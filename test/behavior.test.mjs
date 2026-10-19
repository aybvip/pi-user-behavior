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
eq(BEHAVIOR_LAYERS.filter((l) => !l.onChain).map((l) => l.id), ["B4", "B5", "B6"], "off-chain layers are B4-B6");
for (const l of BEHAVIOR_LAYERS) {
  ok(l.name && l.example, `layer ${l.id} has name and example`);
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
