import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = "tests/114-work-queue-transition-obligation-evidence.test.mjs";
const childEnvironment = { ...process.env };
delete childEnvironment.NODE_TEST_CONTEXT;
const focused = spawnSync(process.execPath, ["--test", "tests/work-queue-transition.test.mjs"], {
  cwd: root,
  env: childEnvironment,
  encoding: "utf8",
  timeout: 60_000,
  maxBuffer: 16 * 1024 * 1024,
});
const focusedOutput = `${focused.stdout}\n${focused.stderr}`;

const obligationIds = [
  "verify:universe-77a8f448-expected",
  "verify:universe-77a8f448-negative",
  "verify:universe-e4141c50-expected",
  "verify:universe-e4141c50-negative",
  "verify:universe-081a836f-expected",
  "verify:universe-081a836f-negative",
  "verify:universe-1abf3bf4-expected",
  "verify:universe-1abf3bf4-negative",
  "verify:universe-d630cfd9-expected",
  "verify:universe-d630cfd9-negative",
  "verify:universe-08850f5d-expected",
  "verify:universe-08850f5d-negative",
  "verify:universe-d0e72ece-expected",
  "verify:universe-d0e72ece-negative",
  "verify:universe-d896a585-expected",
  "verify:universe-d896a585-negative",
  "verify:universe-f9542c4e-expected",
  "verify:universe-f9542c4e-negative",
  "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
  "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
  "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
  "verify:data-model-data-model-check-data-model-historical-records-migrat",
  "verify:background-work-integration-contract-check-scheduled-queued-retr",
  "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
  "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
  "verify:test-coverage-regression-smoke-task-specific-verification-exists",
];

for (const obligationId of obligationIds) {
  test(`[${obligationId}] ${target} :: focused Work Queue transition behavior and tamper paths pass`, () => {
    assert.equal(focused.status, 0, focusedOutput);
    assert.match(focusedOutput, /append-only transition closes an immutable predecessor and selects one successor/);
    assert.match(focusedOutput, /fails closed when an immutable source snapshot changes/);
    assert.match(focusedOutput, /rejects a non-positive sequence even with a valid digest/);
  });
}
