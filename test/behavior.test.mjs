// Offline, deterministic tests for pi-user-behavior. No network. Node >= 20.
import { classifyOperation, eventTopicNames, horizonHref, OPERATION_TYPES, CLAIMS, BEHAVIOR_LAYERS } from "../lib.mjs";

let pass = 0;
let fail = 0;
const failures = [];

function eq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) { pass++; return; }
  fail++;
  failures.push(`${label}\n    expected: ${e}\n    actual:   ${a}`);
}

function ok(cond, label) {
  if (cond) { pass++; return; }
  fail++;
  failures.push(`${label} (expected truthy, got falsy)`);
}

// --- classifyOperation -----------------------------------------------------
eq(classifyOperation("payment"), "value", "payment -> value");
eq(classifyOperation("create_account"), "value", "create_account -> value");
eq(classifyOperation("path_payment_strict_send"), "value", "path_payment -> value");
eq(classifyOperation("manage_sell_offer"), "value", "manage_sell_offer -> value");
eq(classifyOperation("liquidity_pool_deposit"), "value", "lp deposit -> value");
eq(classifyOperation("invoke_host_function"), "contract", "invoke_host_function -> contract");
eq(classifyOperation("extend_footprint_ttl"), "contract", "extend footprint -> contract");
eq(classifyOperation("restore_footprint"), "contract", "restore footprint -> contract");
eq(classifyOperation("create_claimable_balance"), "state", "claimable balance -> state");
eq(classifyOperation("claim_claimable_balance"), "state", "claim -> state");
eq(classifyOperation("clawback"), "state", "clawback -> state");
eq(classifyOperation("begin_sponsoring_future_reserves"), "state", "sponsoring -> state");
eq(classifyOperation("set_options"), "other", "set_options -> other");
eq(classifyOperation("change_trust"), "other", "change_trust -> other");
eq(classifyOperation("manage_data"), "other", "manage_data -> other");
eq(classifyOperation(""), "unknown", "empty -> unknown");
eq(classifyOperation(null), "unknown", "null -> unknown");
eq(classifyOperation(undefined), "unknown", "undefined -> unknown");
eq(classifyOperation(42), "unknown", "number -> unknown");

// --- eventTopicNames -------------------------------------------------------
eq(eventTopicNames({ topicJson: [{ symbol: "transfer" }, { symbol: "fee" }] }), ["transfer", "fee"], "symbols from topicJson");
eq(eventTopicNames({ topicJson: [{ symbol: "transfer" }, { string: "OUSD:G..." }] }), ["transfer", "OUSD:G..."], "mixed symbol/string");
eq(eventTopicNames({ topicsJson: [{ symbol: "x" }] }), ["x"], "topicsJson fallback");
eq(eventTopicNames({ topic: ["a", "b"] }), ["a", "b"], "plain string topic");
eq(eventTopicNames({}), [], "no topics -> []");
eq(eventTopicNames(null), [], "null event -> []");
eq(eventTopicNames({ topicJson: [null, { other: 1 }, 7] }), [], "ignores null/unknown shapes");
eq(eventTopicNames({ topicJson: [{ symbol: "escrow_created" }] }), ["escrow_created"], "escrow topic");

// --- horizonHref (RFC 6570 template stripping) -----------------------------
eq(
  horizonHref("https://api.mainnet.minepi.com/transactions/abc/operations{?cursor,limit,order}"),
  "https://api.mainnet.minepi.com/transactions/abc/operations",
  "strips URI template"
);
eq(horizonHref("https://api.mainnet.minepi.com/accounts/X"), "https://api.mainnet.minepi.com/accounts/X", "keeps plain href");
eq(horizonHref(null), null, "null href -> null");
eq(horizonHref(undefined), null, "undefined href -> null");
eq(horizonHref(""), null, "empty href -> null");

// --- table integrity -------------------------------------------------------
ok(Object.keys(OPERATION_TYPES).length > 20, "OPERATION_TYPES has >20 entries");
ok(OPERATION_TYPES.payment.includes("scalar"), "payment doc mentions scalar balance");

const buckets = new Set(CLAIMS.map((c) => c.bucket));
ok(buckets.has("measured"), "claim audit has measured bucket");
ok(buckets.has("documented"), "claim audit has documented bucket");
ok(buckets.has("external"), "claim audit has external bucket");
ok(buckets.has("not-claimed"), "claim audit has not-claimed bucket");

for (const c of CLAIMS) {
  ok(typeof c.id === "string" && c.id.length > 0, `claim ${c.id} has id`);
  ok(typeof c.claim === "string" && c.claim.length > 10, `claim ${c.id} has text`);
  if (c.bucket === "measured" || c.bucket === "documented") {
    ok(typeof c.source === "string" && c.source.length > 0, `claim ${c.id} (${c.bucket}) cites a source`);
  }
  if (c.bucket === "external") {
    ok(/unofficial|unverified|official, but not/i.test(c.status ?? ""), `external claim ${c.id} is flagged`);
  }
}

// no measured claim should assert an on-chain behavior score exists.
// Mentioning a score is fine only if the claim negates it.
const scoreMentions = CLAIMS.filter((c) => c.bucket === "measured" && /engagement|score|sybil/i.test(c.claim));
const assertingScore = scoreMentions.filter((c) => !/\bno\b|\bnot\b|n't|refus|absent|not observed/i.test(c.claim));
eq(assertingScore.length, 0, "no measured claim asserts an on-chain engagement/sybil score exists");

// --- behavioral layer taxonomy --------------------------------------------
eq(BEHAVIOR_LAYERS.filter((l) => l.onChain).map((l) => l.id), ["B1", "B2", "B3"], "on-chain layers are B1-B3");
eq(BEHAVIOR_LAYERS.filter((l) => !l.onChain).map((l) => l.id), ["B4", "B5", "B6", "B7"], "off-chain layers are B4-B7");
for (const l of BEHAVIOR_LAYERS) {
  ok(l.name && l.example, `layer ${l.id} has name and example`);
}

// --- new documented claims (beyond-RPC / enforcement) ----------------------
const byId = Object.fromEntries(CLAIMS.map((c) => [c.id, c]));
ok(byId.D6 && byId.D6.bucket === "documented", "D6 (multi-pronged anti-bot) is documented");
ok(/multi-pronged/.test(byId.D6.claim), "D6 quotes the multi-pronged strategy");
ok(byId.D7 && /one Pi account per person/.test(byId.D7.claim), "D7 states the one-account-per-person rule");
ok(byId.D8 && /PiVerify/.test(byId.D8.claim) && /duplicate detection/.test(byId.D8.detail), "D8 covers PiVerify + duplicate detection");
ok(byId.D9 && /Code of Conduct/.test(byId.D9.claim), "D9 covers the Code of Conduct");
ok(byId.E3 && byId.E3.bucket === "external" && /silently/.test(byId.E3.claim), "E3 flags the 'silently marked' claim as external");
ok(byId.D6 && /NOT public/.test(byId.D6.status), "D6 explicitly says thresholds are not public");

// --- documentation-consistency invariant ----------------------------------
// The layer count is now 7 (B1-B7). Guard against docs drifting back to "six".
{
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..");
  eq(BEHAVIOR_LAYERS.length, 7, "there are exactly seven behavior layers");
  for (const rel of ["README.md", "llms.txt", "docs/FAQ-BEHAVIOR-ON-CHAIN.md", "docs/INDEX.md", "docs/FAQ-BEYOND-RPC.md", "docs/VERIFICATION.md", "docs/SOURCES.md", "docs/SAID-VS-DONE.md", "docs/FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md", "docs/FAQ-PI-BROWSER-PROFILE.md"]) {
    const src = readFileSync(join(root, rel), "utf8");
    ok(!/\bsix layers\b/i.test(src), `${rel}: does not claim "six layers"`);
    if (/B7/.test(src)) ok(/seven|B7/.test(src), `${rel}: mentions B7 consistently`);
  }
}

// --- the contribution-profile page must not weaken the repo's scope ---------
{
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const page = readFileSync(join(here, "..", "docs", "FAQ-CONTRIBUTION-PROFILE-PROPOSAL.md"), "utf8");
  ok(/app-specific/.test(page), "profile-proposal page states uid is app-specific");
  ok(/cannot correlate the same person/.test(page), "profile-proposal page quotes the official correlation limit");
  ok(/does not change what this repository is|stays a measurement/i.test(page), "profile-proposal page declares the repo scope unchanged");
  ok(/four independent axes/i.test(page), "profile-proposal page keeps four axes, not one score");
  ok(/no .*combined score|no\*\* combined score|exposes \*\*no\*\* combined score/i.test(page), "profile-proposal page refuses a combined score");
}

// --- the Pi Browser Profile page must classify it as B6 and not measurable ---
{
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  const page = readFileSync(join(here, "..", "docs", "FAQ-PI-BROWSER-PROFILE.md"), "utf8");
  ok(/Pi Social Profiles/.test(page), "browser-profile page names the official object");
  ok(/3\.36 million/.test(page), "browser-profile page quotes the official scale figure");
  ok(/\bB6\b/.test(page), "browser-profile page classifies the profile as layer B6");
  ok(/UserDTO/.test(page), "browser-profile page cites the official UserDTO");
  ok(/no field at all|contains \*\*no field\*\*/i.test(page), "browser-profile page states UserDTO has no profile fields");
  ok(/not a measurement source|not measurable/i.test(page), "browser-profile page refuses to treat the profile as a measurement source");
  ok(/does not claim the profile is on-chain|We do \*\*not\*\* claim the profile is on-chain/i.test(page), "browser-profile page does not claim on-chain presence");
  ok(/presence, not\s+contribution|presence, not contribution/i.test(page), "browser-profile page keeps presence distinct from contribution");
}

// --- read-only invariant for the measurement scripts ----------------------
// Every script that talks to the network must be read-only: it may issue REST
// GETs and JSON-RPC reads (POST of a read method), but it must never sign or
// submit anything, and every network call must be time-boxed.
{
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const here = dirname(fileURLToPath(import.meta.url));
  for (const name of ["behavior.mjs", "said-vs-done.mjs"]) {
    const src = readFileSync(join(here, "..", name), "utf8");
    // The only permitted POST is to the Soroban JSON-RPC base, for read methods.
    const postBodies = [...src.matchAll(/method:\s*"POST"/g)];
    ok(postBodies.length === 0 || /RPC_BASE/.test(src), `${name}: POST is only used against the RPC base`);
    ok(!/\b(sign|submitTransaction|sendTransaction)\s*\(/.test(src), `${name}: never signs or submits`);
    ok(/AbortSignal\.timeout/.test(src), `${name}: network calls are time-boxed`);
  }
}

// --- report ----------------------------------------------------------------
console.log(`pi-user-behavior offline tests`);
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  - " + f);
  process.exitCode = 1;
}
