import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const checker = path.join(root, "scripts/check-closure-decision.mjs");

test("repository batch preserves historical closures while explicit old selection stays strict", () => {
  const batch = run([root]);
  assert.equal(batch.status, 0, combined(batch));
  assert.match(
    combined(batch),
    /historical DONE preserves recorded evidence maps without claiming current completion or runtime authority/,
  );

  const explicitOld = run([
    root,
    "--report", "closure-decisions/113-cross-domain-trust-closure.md",
    "--require-done",
  ]);
  assert.notEqual(explicitOld.status, 0);
  assert.match(
    combined(explicitOld),
    /authority_binding\.project does not match|source_identity must match the current project identity/,
  );
});

function run(args) {
  return spawnSync(process.execPath, [checker, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function combined(result) {
  return `${result.stdout}\n${result.stderr}`;
}
