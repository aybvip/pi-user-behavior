#!/usr/bin/env node
// pi-user-behavior — read-only measurement of user behavior observable on Pi.
//
// Measures B1 (ledger operations), B2 (contract events), B3 (account/ledger state).
// Refuses to pretend B4/B5/B6 (app engagement, Sybil heuristics, intent) are on-chain.
//
// Zero dependencies. Node >= 20 (built-in fetch). Read-only: GET/POST-read only.
//
// Usage:
//   node behavior.mjs --network mainnet          # B1 + B3 via Horizon REST
//   node behavior.mjs --network testnet-events   # B2 via Soroban JSON-RPC
//   node behavior.mjs --claims                   # print the claim audit
//   node behavior.mjs --help

import { REST_BASE, RPC_BASE, classifyOperation, eventTopicNames, horizonHref, CLAIMS, BEHAVIOR_LAYERS, OPERATION_TYPES } from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
};
const has = (name) => args.includes(name);

function line(s = "") { process.stdout.write(s + "\n"); }
function rule(t) { line(`\n=== ${t} ===`); }

// ---------------------------------------------------------------------------
// B1 + B3 — Mainnet ledger-level behavior (Horizon REST)
// ---------------------------------------------------------------------------

async function restGet(path) {
  const url = path.startsWith("http") ? path : REST_BASE + path;
  const res = await fetch(url, {
    headers: { Accept: "application/hal+json" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.json();
}

async function measureMainnet({ txPages = 3, txPerPage = 50 } = {}) {
  rule("B1 - ledger operation behavior (Pi Mainnet, Horizon REST)");
  line(`endpoint : ${REST_BASE}`);
  line(`window   : up to ${txPages * txPerPage} most-recent successful transactions`);

  const ledgerPage = await restGet("/ledgers?limit=1&order=desc");
  const head = ledgerPage?._embedded?.records?.[0];
  if (!head) throw new Error("no ledger header returned");

  line(`latest   : ledger ${head.sequence}`);
  line(`total_coins: ${head.total_coins}   fee_pool: ${head.fee_pool}`);

  const histogram = new Map();
  let scanned = 0;
  let cursor = null;
  for (let page = 0; page < txPages; page++) {
    const q = `/transactions?limit=${txPerPage}&order=desc&include_failed=false` + (cursor ? `&cursor=${cursor}` : "");
    const tx = await restGet(q);
    const recs = tx?._embedded?.records ?? [];
    if (recs.length === 0) break;
    cursor = recs[recs.length - 1].paging_token;
    for (const t of recs) {
      scanned++;
      const href = horizonHref(t?._links?.operations?.href);
      if (!href) continue;
      let ops;
      try { ops = await restGet(href + "?limit=20"); } catch { continue; }
      for (const o of ops?._embedded?.records ?? []) {
        histogram.set(o.type, (histogram.get(o.type) ?? 0) + 1);
      }
    }
  }

  rule("observed operation-type histogram");
  if (histogram.size === 0) {
    line("(none parsed - transactions may expose operations only via _links)");
  } else {
    const sorted = [...histogram.entries()].sort((a, b) => b[1] - a[1]);
    for (const [type, n] of sorted) {
      line(`  ${String(n).padStart(6)}  ${type}${OPERATION_TYPES[type] ? `   (${OPERATION_TYPES[type]})` : ""}`);
    }
  }
  line(`  scanned transactions: ${scanned}`);

  const contractish = [...histogram.keys()].filter((t) => /invoke_host_function|invoke_contract|contract/.test(t));
  const claimish = [...histogram.keys()].filter((t) => /claim|create_claimable|clawback/.test(t));

  rule("behavior-verdict (B1)");
  line(`  contract-invocation ops : ${contractish.length ? contractish.join(", ") : "NOT OBSERVED in window"}`);
  line(`  claimable-balance ops  : ${claimish.length ? claimish.join(", ") : "NOT OBSERVED in window"}`);
  if (claimish.length) {
    const c = classifyOperation(claimish[0]);
    line(`    note                 : these are account STATE transitions (${c}) - not per-coin origin, not a launchpad claim`);
  }
  line(`  native asset only      : ${head.total_coins ? "yes - one native supply figure in header" : "unknown"}`);
  line("  note                   : absence in this window is NOT a global claim; widen the window to extend it.");

  return { histogram, scanned, head };
}

// ---------------------------------------------------------------------------
// B2 — Testnet contract-event behavior (Soroban JSON-RPC)
// ---------------------------------------------------------------------------

async function rpc(method, params) {
  const res = await fetch(RPC_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(30000),
  });
  const json = await res.json();
  if (json.error) throw new Error(`${method}: ${json.error.message ?? JSON.stringify(json.error)}`);
  return json.result;
}

async function measureTestnetEvents({ chunks = 8, span = 3000 } = {}) {
  rule("B2 - contract-event behavior (Pi Testnet, Soroban JSON-RPC)");
  line(`endpoint : ${RPC_BASE}`);
  line(`window   : ${chunks} chunks x ${span} ledgers, most recent`);

  const health = await rpc("getHealth", {});
  const latest = Number(health.latestLedger);
  const retention = health.ledgerRetentionWindow ? Number(health.ledgerRetentionWindow) : null;
  let network = {};
  try { network = await rpc("getNetwork", {}); } catch { /* optional */ }
  line(`latest   : ${latest}   retention: ${retention ?? "unknown"} ledgers`);
  line(`network  : ${network.passphrase ?? "?"}   protocol: ${network.protocolVersion ?? "?"}`);

  const vocab = new Map();
  const contracts = new Map();
  let events = 0;
  let truncatedChunks = 0;

  for (let c = 0; c < chunks; c++) {
    const startLedger = latest - (c + 1) * span;
    const endLedger = latest - c * span; // EXCLUSIVE (measured)
    let res;
    try {
      res = await rpc("getEvents", { startLedger, endLedger, filters: [], limit: 100, xdrFormat: "json" });
    } catch (e) {
      line(`  chunk ${startLedger}..${endLedger}: ${e.message}`);
      continue;
    }
    const evs = res.events ?? [];
    if (evs.length >= 100) truncatedChunks++;
    events += evs.length;
    for (const e of evs) {
      for (const name of eventTopicNames(e)) vocab.set(name, (vocab.get(name) ?? 0) + 1);
      const cid = e.contractId ?? "(none)";
      contracts.set(cid, (contracts.get(cid) ?? 0) + 1);
    }
  }

  rule("observed event-topic vocabulary");
  const sortedVocab = [...vocab.entries()].sort((a, b) => b[1] - a[1]);
  if (sortedVocab.length === 0) line("  (none)");
  for (const [name, n] of sortedVocab.slice(0, 25)) line(`  ${String(n).padStart(6)}  ${name}`);
  line(`  distinct topics   : ${vocab.size}`);
  line(`  distinct contracts: ${contracts.size}`);
  line(`  events collected  : ${events}${truncatedChunks ? ` (lower bound; ${truncatedChunks} chunk(s) hit the 100-event page cap)` : ""}`);

  const behaviorish = [...vocab.keys()].filter((n) => /claim|vest|contrib|reward|stake|engage|mint|allocat|score/i.test(n));
  rule("behavior-verdict (B2)");
  line(`  engagement/claim-ish topics : ${behaviorish.length ? behaviorish.join(", ") : "NOT OBSERVED in window"}`);
  line("  note : token contracts expose transfer/fee-style events; app-level scoring does not appear as a topic.");

  return { vocab, contracts, events, truncatedChunks };
}

// ---------------------------------------------------------------------------
// --claims — audit table
// ---------------------------------------------------------------------------

function printClaims() {
  rule("claim audit (measured / documented / external / not-claimed)");
  for (const c of CLAIMS) {
    line(`\n[${c.bucket.toUpperCase()}] ${c.id} - ${c.claim}`);
    if (c.detail) line(`  detail : ${c.detail}`);
    if (c.source) line(`  source : ${c.source}`);
    if (c.status) line(`  status : ${c.status}`);
  }

  rule("behavior layers (which are on-chain?)");
  for (const l of BEHAVIOR_LAYERS) {
    line(`  ${l.id}  ${l.onChain ? "[ON-CHAIN ]" : "[OFF-CHAIN]"}  ${l.name}`);
    line(`        ${l.example}`);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main() {
  if (has("--help") || args.length === 0) {
    line("pi-user-behavior - read-only measurement of behavior observable on Pi");
    line("");
    line("  --network mainnet          measure ledger-level behavior (B1 + B3, Horizon REST)");
    line("  --network testnet-events   measure contract-event behavior (B2, Soroban JSON-RPC)");
    line("  --claims                   print the claim audit");
    line("  --help                     this message");
    return;
  }

  if (has("--claims")) return printClaims();

  const net = flag("--network");
  if (net === "mainnet") return measureMainnet();
  if (net === "testnet-events") return measureTestnetEvents();

  if (net === "mainnet-events") {
    line("REFUSED: Pi Mainnet does not expose a public Soroban JSON-RPC for events.");
    line("  measured 2026-10: rpc.mainnet.minepi.com -> HTTP 503, certificate expired 2023-05-30.");
    line("  api.mainnet.minepi.com is Horizon REST (protocol 28), not JSON-RPC.");
    line("  Use --network mainnet (REST) or --network testnet-events (RPC).");
    process.exitCode = 2;
    return;
  }

  line(`unknown --network value: ${net}`);
  line("see --help");
  process.exitCode = 2;
}

main()
  .then(() => { if (process.exitCode === undefined) process.exitCode = 0; })
  .catch((e) => {
    line(`error: ${e.message}`);
    process.exitCode = 1;
  });
