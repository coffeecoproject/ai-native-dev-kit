import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = "tests/115-init-project-obligation-evidence.test.mjs";
const childEnvironment = { ...process.env };
delete childEnvironment.NODE_TEST_CONTEXT;

const focused = spawnSync(process.execPath, [
  "--test",
  "--test-concurrency=1",
  "tests/init-project-modularity.test.mjs",
  "tests/project-entry-new-project-transaction.test.mjs",
  "tests/project-entry-generated-parity.test.mjs",
  "tests/controlled-apply-transaction.test.mjs",
  "tests/execution-distribution-trust.test.mjs",
], {
  cwd: root,
  env: childEnvironment,
  encoding: "utf8",
  timeout: 600_000,
  maxBuffer: 32 * 1024 * 1024,
});
const focusedOutput = `${focused.stdout}\n${focused.stderr}`;

const obligationIds = [
  "verify:universe-a6e545d4-expected",
  "verify:universe-a6e545d4-negative",
  "verify:universe-33f16b20-expected",
  "verify:universe-33f16b20-negative",
  "verify:universe-fb5f6fb1-expected",
  "verify:universe-fb5f6fb1-negative",
  "verify:universe-61e14285-expected",
  "verify:universe-61e14285-negative",
  "verify:universe-e1e69a79-expected",
  "verify:universe-e1e69a79-negative",
  "verify:universe-a11c3ecc-expected",
  "verify:universe-a11c3ecc-negative",
  "verify:universe-f3a2b88d-expected",
  "verify:universe-f3a2b88d-negative",
  "verify:universe-d653660b-expected",
  "verify:universe-d653660b-negative",
  "verify:universe-7b2145c0-expected",
  "verify:universe-7b2145c0-negative",
  "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
  "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
  "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
  "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
  "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
  "verify:test-coverage-regression-smoke-task-specific-verification-exists",
];

for (const obligationId of obligationIds) {
  test(`[${obligationId}] ${target} :: final init-project public-entry and transaction suite passes`, () => {
    assert.equal(focused.status, 0, focusedOutput);
    assert.match(focusedOutput, /init-project keeps one thin executable and an acyclic domain module graph/);
    assert.match(focusedOutput, /generated project cold-starts from its own cwd and exercises the strict operating route/);
    assert.match(focusedOutput, /hard process interruption restores every journaled target and the prior receipt/);
    assert.match(focusedOutput, /bootstrap transaction atomically creates an absent target and verifies its receipt/);
    assert.match(focusedOutput, /tests 124/);
    assert.match(focusedOutput, /pass 124/);
    assert.match(focusedOutput, /fail 0/);
  });
}
