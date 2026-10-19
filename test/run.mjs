// Minimal zero-dependency test runner. Node >= 20.
// Usage: node test/run.mjs
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(here).filter((f) => f.endsWith(".test.mjs")).sort();

let failed = 0;
for (const f of files) {
  const res = spawnSync(process.execPath, [join(here, f)], { stdio: "inherit" });
  if (res.status !== 0) failed++;
}

console.log(`\n${files.length - failed}/${files.length} test file(s) passed`);
process.exitCode = failed > 0 ? 1 : 0;
