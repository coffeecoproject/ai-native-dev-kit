import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("[verify:background-work-integration-contract-check-scheduled-queued-retr] tests/116-new-workflow-item-governance-obligations.test.mjs :: governance handoff starts no background worker", () => {
  const transition = fs.readFileSync(
    path.join(repoRoot, "work-queue-transitions/004-init-project-to-new-workflow-item-modularity.md"),
    "utf8",
  );

  assert.match(transition, /Work Queue State Transition/i);
  assert.match(transition, /new-workflow-item/i);
  assert.doesNotMatch(transition, /cron|schedule(?:d)? job|background worker/i);
});

test("[verify:rollback-recovery-release-smoke-check-failure-interruption-rollb] tests/116-new-workflow-item-governance-obligations.test.mjs :: recovery boundary remains explicit", () => {
  const plan = fs.readFileSync(
    path.join(repoRoot, "implementation-plans/116-new-workflow-item-modularity.md"),
    "utf8",
  );

  assert.match(plan, /## Rollback And Recovery/);
  assert.match(plan, /Do not weaken the test/);
  assert.match(plan, /No production rollback path is involved/);
});
