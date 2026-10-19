// CLI contract tests: exercise argument parsing and exit codes without network.
// These run the real behavior.mjs but only on paths that do NOT hit the network.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, "..", "behavior.mjs");

let pass = 0;
let fail = 0;
const failures = [];

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

function check(label, cond, extra = "") {
  if (cond) { pass++; return; }
  fail++;
  failures.push(`${label}${extra ? "\n    " + extra : ""}`);
}

// --help => exit 0, prints usage
{
  const r = run(["--help"]);
  check("--help exits 0", r.status === 0, `status=${r.status}`);
  check("--help prints usage", /--network mainnet/.test(r.stdout) && /--claims/.test(r.stdout));
}

// no args => treated like help, exit 0
{
  const r = run([]);
  check("no args exits 0", r.status === 0, `status=${r.status}`);
}

// --network mainnet-events => refused with exit code 2
{
  const r = run(["--network", "mainnet-events"]);
  check("mainnet-events refused with exit 2", r.status === 2, `status=${r.status}`);
  check("refusal explains the 503 reason", /503/.test(r.stdout) && /certificate expired/.test(r.stdout));
  check("refusal suggests alternatives", /testnet-events/.test(r.stdout));
}

// unknown network => exit code 2
{
  const r = run(["--network", "nonsense"]);
  check("unknown network exits 2", r.status === 2, `status=${r.status}`);
  check("unknown network message", /unknown --network value/.test(r.stdout));
}

// --claims => exit 0, prints all four buckets
{
  const r = run(["--claims"]);
  check("--claims exits 0", r.status === 0, `status=${r.status}`);
  for (const b of ["MEASURED", "DOCUMENTED", "EXTERNAL", "NOT-CLAIMED"]) {
    check(`--claims prints ${b}`, r.stdout.includes(`[${b}]`));
  }
  check("--claims prints layers", /\[ON-CHAIN \]/.test(r.stdout) && /\[OFF-CHAIN\]/.test(r.stdout));
}

console.log(`pi-user-behavior CLI tests`);
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  - " + f);
  process.exitCode = 1;
}
