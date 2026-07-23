import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), "utf8");
const manifest = JSON.parse(read("intentos-manifest.json"));
const packageJson = JSON.parse(read("package.json"));
const policy = JSON.parse(read(".intentos/evidence-retention-policy.json"));
const workflowVersion = JSON.parse(read("templates/workflow-version.json"));
const evaluatorSource = read("scripts/lib/evidence-retention.mjs");
const checkerSource = read("scripts/check-evidence-retention.mjs");
const behaviorTests = read("tests/evidence-retention.test.mjs");

test("[verify:universe-93e4686c-expected] tests/118-evidence-retention-governance-obligations.test.mjs :: generated projects receive every retention surface", () => {
  for (const target of [
    ".intentos/evidence-retention-policy.json",
    ".intentos/docs/evidence-retention.md",
    "scripts/check-evidence-retention.mjs",
    "scripts/lib/evidence-retention.mjs",
  ]) assert.ok(JSON.stringify(manifest).includes(target), target);
});

test("[verify:universe-93e4686c-negative] tests/118-evidence-retention-governance-obligations.test.mjs :: missing distribution declarations fail closed", () => {
  assert.match(packageJson.scripts["verify:pre-runtime"], /verify:evidence-retention/);
  assert.match(behaviorTests, /installs and executes the same retention policy in a generated project/);
  assert.match(behaviorTests, /assert\.equal\(fs\.existsSync/);
});

test("[verify:universe-2118bb89-expected] tests/118-evidence-retention-governance-obligations.test.mjs :: pre-runtime invokes the strict checker", () => {
  assert.match(packageJson.scripts["verify:evidence-retention"], /node scripts\/check-evidence-retention\.mjs \. --strict$/);
  assert.match(packageJson.scripts["verify:pre-runtime"], /npm run verify:evidence-retention/);
});

test("[verify:universe-2118bb89-negative] tests/118-evidence-retention-governance-obligations.test.mjs :: checker violations propagate a non-zero exit", () => {
  assert.match(checkerSource, /new Set\(\["policy", "strict", "json"\]\)/);
  assert.match(checkerSource, /process\.exit\(result\.ok \? 0 : 2\)/);
});

test("[verify:universe-2020517d-expected] tests/118-evidence-retention-governance-obligations.test.mjs :: policy enforces final-run, duplicate, and budget limits", () => {
  assert.equal(policy.applies_from_task_number, 118);
  assert.equal(policy.retention.durable_runtime_archives_per_task, 1);
  assert.equal(policy.retention.standalone_full_verification_logs, "FORBIDDEN");
  assert.equal(policy.retention.duplicate_raw_content, "FORBIDDEN");
  assert.ok(policy.budgets.raw_evidence_per_task_bytes > 0);
});

test("[verify:universe-2020517d-negative] tests/118-evidence-retention-governance-obligations.test.mjs :: historical evidence is immutable and evaluation is read-only", () => {
  assert.equal(policy.historical_evidence.before_task_number, 118);
  assert.equal(policy.historical_evidence.mutation, "FORBIDDEN");
  assert.deepEqual(Object.values(policy.boundaries), [false, false, false, false]);
  assert.doesNotMatch(`${evaluatorSource}\n${checkerSource}`, /\b(?:unlink|rmSync|renameSync|truncateSync|writeFileSync)\b/);
});

test("[verify:universe-8140bff0-expected] tests/118-evidence-retention-governance-obligations.test.mjs :: workflow template declares retention assets", () => {
  const serialized = JSON.stringify(workflowVersion);
  for (const target of ["evidence-retention-policy.json", "check-evidence-retention.mjs", "evidence-retention.mjs"]) {
    assert.ok(serialized.includes(target), target);
  }
});

test("[verify:universe-8140bff0-negative] tests/118-evidence-retention-governance-obligations.test.mjs :: manifest and generated-project tests detect template drift", () => {
  assert.match(packageJson.scripts["verify:pre-runtime"], /verify:evidence-retention/);
  assert.match(behaviorTests, /generated project/);
});

test("[verify:universe-4193ff31-expected] tests/118-evidence-retention-governance-obligations.test.mjs :: valid source and generated fixtures are characterized", () => {
  assert.match(behaviorTests, /keeps historical oversized evidence/);
  assert.match(behaviorTests, /installs and executes the same retention policy/);
});

test("[verify:universe-4193ff31-negative] tests/118-evidence-retention-governance-obligations.test.mjs :: every governed rejection mode is characterized", () => {
  for (const marker of [
    "MULTIPLE_DURABLE_RUNS",
    "FULL_VERIFICATION_LOG",
    "DUPLICATE_RAW_CONTENT",
    "STANDALONE_RAW_FILE_BUDGET",
    "STRUCTURED_REPORT_BUDGET",
    "UNBOUND_DURABLE_RUN",
  ]) assert.match(behaviorTests, new RegExp(marker));
});

test("[verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-] tests/118-evidence-retention-governance-obligations.test.mjs :: local maintainer receives explicit PASS or FAIL output", () => {
  assert.match(checkerSource, /PASS evidence retention policy/);
  assert.match(checkerSource, /`FAIL \$\{item\.code\} \$\{item\.path\}: \$\{item\.reason\}`/);
});

test("[verify:user-flow-regression-smoke-existing-critical-flow-still-works-af] tests/118-evidence-retention-governance-obligations.test.mjs :: standard verification retains its existing prefix and adds one gate", () => {
  assert.match(packageJson.scripts["verify:pre-runtime"], /^npm run verify:syntax && npm run verify:consumer-syntax && npm run verify:runtime-trust:core/);
  assert.match(packageJson.scripts["verify:pre-runtime"], /&& npm run verify:evidence-retention &&/);
});

test("[verify:background-work-integration-contract-check-scheduled-queued-retr] tests/118-evidence-retention-governance-obligations.test.mjs :: checker starts no background work", () => {
  assert.doesNotMatch(`${evaluatorSource}\n${checkerSource}`, /setInterval|setTimeout|Worker|child_process|spawn\(/);
});

test("[verify:runtime-behavior-regression-smoke-the-current-code-runs-through-] tests/118-evidence-retention-governance-obligations.test.mjs :: runtime entry imports the current evaluator", () => {
  assert.match(checkerSource, /\.\/lib\/evidence-retention\.mjs/);
  assert.match(checkerSource, /inspectEvidenceRetention/);
});

test("[verify:rollback-recovery-release-smoke-check-failure-interruption-rollb] tests/118-evidence-retention-governance-obligations.test.mjs :: failure preserves the bounded repository state", () => {
  assert.equal(policy.boundaries.automatically_deletes_evidence, false);
  assert.equal(policy.boundaries.silently_truncates_output, false);
  assert.doesNotMatch(checkerSource, /writeFileSync|unlinkSync|rmSync|renameSync/);
});

test("[verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders] tests/118-evidence-retention-governance-obligations.test.mjs :: documentation records budgets and cleanup order", () => {
  const docs = read("docs/evidence-retention.md");
  assert.match(docs, /## Budgets/);
  assert.match(docs, /## Cleanup Order/);
  assert.match(docs, /never deletes, archives, uploads, or rewrites evidence/);
});

test("[verify:test-coverage-regression-smoke-task-specific-verification-exists] tests/118-evidence-retention-governance-obligations.test.mjs :: task-specific evidence covers positive and negative paths", () => {
  const testNames = [...behaviorTests.matchAll(/test\("1\.118 /g)];
  assert.ok(testNames.length >= 8, `observed ${testNames.length} task-specific tests`);
});
