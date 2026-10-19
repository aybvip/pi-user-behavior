#!/usr/bin/env node
// said-vs-done.mjs — re-measure the "Said vs Done" facts in one command.
//
// Reads only. Prints, for both networks:
//   - network passphrase + protocol version (proves which network)
//   - Mainnet: total_coins, fee_pool, issued-asset count, operation-type histogram,
//              and whether contract invocations appear
//   - Testnet: retention, event count
//
// Usage: node said-vs-done.mjs

import { REST_BASE, RPC_BASE, horizonHref, eventTopicNames } from "./lib.mjs";

const line = (s = "") => process.stdout.write(s + "\n");
const rule = (t) => line(`\n=== ${t} ===`);

async function rest(path) {
  const url = path.startsWith("http") ? path : REST_BASE + path;
  const res = await fetch(url, { headers: { Accept: "application/hal+json" }, signal: AbortSignal.timeout(30000) });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function rpc(method, params) {
  const res = await fetch(RPC_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(30000),
  });
  const j = await res.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
}

async function main() {
  // ---- Mainnet ----
  rule("MAINNET - identity of the network");
  const root = await rest("/");
  line(`network_passphrase : ${root.body?.network_passphrase}`);
  line(`protocol_version   : ${root.body?.current_protocol_version}`);

  const led = await rest("/ledgers?limit=1&order=desc");
  const L = led.body?._embedded?.records?.[0];
  rule("MAINNET - native supply (B1/B3)");
  line(`latest ledger      : ${L?.sequence}`);
  line(`total_coins        : ${L?.total_coins}   (one scalar; no per-unit record)`);
  line(`fee_pool           : ${L?.fee_pool}`);

  rule("MAINNET - issued assets (tokens would appear here)");
  const assets = await rest("/assets?limit=10&order=desc");
  const nAssets = assets.body?._embedded?.records?.length ?? 0;
  line(`/assets records    : ${nAssets}  -> ${nAssets === 0 ? "no issued assets observed" : "issued assets present"}`);

  rule("MAINNET - operation types over ~150 recent successful transactions");
  const types = new Map();
  let cursor = null;
  for (let page = 0; page < 3; page++) {
    const q = `/transactions?limit=50&order=desc&include_failed=false${cursor ? "&cursor=" + cursor : ""}`;
    const tx = await rest(q);
    const recs = tx.body?._embedded?.records ?? [];
    if (!recs.length) break;
    cursor = recs[recs.length - 1].paging_token;
    for (const t of recs) {
      const href = horizonHref(t?._links?.operations?.href);
      if (!href) continue;
      const ops = await rest(href + "?limit=20");
      for (const o of ops.body?._embedded?.records ?? []) types.set(o.type, (types.get(o.type) ?? 0) + 1);
    }
  }
  for (const [k, n] of [...types.entries()].sort((a, b) => b[1] - a[1])) line(`  ${String(n).padStart(6)}  ${k}`);
  const hasContract = [...types.keys()].some((t) => /invoke_host_function/.test(t));
  line(`contract invocations : ${hasContract ? "OBSERVED" : "NOT OBSERVED in window"}`);

  // ---- Testnet ----
  rule("TESTNET - identity + activity");
  const net = await rpc("getNetwork", {});
  line(`network_passphrase : ${net.passphrase}`);
  line(`protocol_version   : ${net.protocolVersion}`);
  const health = await rpc("getHealth", {});
  line(`latest ledger      : ${health.latestLedger}`);
  line(`retention window   : ${health.ledgerRetentionWindow} ledgers`);

  const from = Number(health.latestLedger) - 2000;
  const ev = await rpc("getEvents", { startLedger: from, endLedger: Number(health.latestLedger), filters: [], limit: 100, xdrFormat: "json" });
  const events = ev.events ?? [];
  line(`events (2000-ledger window, capped at 100) : ${events.length}`);
  const topicSet = new Set();
  for (const e of events) for (const t of eventTopicNames(e)) topicSet.add(t);
  line(`distinct event topics observed : ${topicSet.size}`);
  line(`sample topics : ${[...topicSet].slice(0, 12).join(", ")}`);

  rule("READ");
  line("  This is a point-in-time measurement. Statuses in docs/SAID-VS-DONE.md section B");
  line("  are reproducible with this command; sections A/C/D quote official sources.");
}

main().catch((e) => {
  line(`error: ${e.message}`);
  process.exitCode = 1;
});
