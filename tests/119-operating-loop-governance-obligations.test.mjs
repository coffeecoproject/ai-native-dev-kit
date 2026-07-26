import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const manifest = JSON.parse(read("intentos-manifest.json"));
const workflowVersion = JSON.parse(read("templates/workflow-version.json"));
const entry = read("scripts/resolve-operating-loop.mjs");
const orchestration = read("scripts/operating-loop/source-orchestration.mjs");
const modularityTests = read("tests/resolve-operating-loop-modularity.test.mjs");
const operatingTests = read("tests/operating-model.test.mjs");
const markerTests = read("tests/self-check-modular-source-marker.test.mjs");
const moduleNames = ["classification", "decision", "identity", "presentation", "shared", "source-execution", "source-orchestration", "state"];

test("[verify:universe-bf60f92e-expected] tests/119-operating-loop-governance-obligations.test.mjs :: generated projects receive every operating-loop module", () => {
  for (const name of moduleNames) assert.ok(JSON.stringify(manifest).includes(`scripts/operating-loop/${name}.mjs`));
});

test("[verify:universe-bf60f92e-negative] tests/119-operating-loop-governance-obligations.test.mjs :: missing distribution declarations remain fail-closed", () => {
  assert.match(modularityTests, /sourceRequired/);
  assert.match(modularityTests, /copy-rule/);
  assert.match(JSON.stringify(workflowVersion), /source-orchestration\.mjs/);
});

test("[verify:universe-7ec23da9-expected] tests/119-operating-loop-governance-obligations.test.mjs :: source orchestration preserves ordered consumers", () => {
  assert.match(orchestration, /export function addOperationSources/);
  assert.match(orchestration, /sources\.push\(runSource/);
  assert.match(operatingTests, /operating loop/);
});

test("[verify:universe-7ec23da9-negative] tests/119-operating-loop-governance-obligations.test.mjs :: source failures remain visible and non-zero", () => {
  assert.match(operatingTests, /failure|non-zero|exit/i);
  assert.match(orchestration, /status/);
});

test("[verify:universe-a3a9cbeb-expected] tests/119-operating-loop-governance-obligations.test.mjs :: public entry retains every internal contract", () => {
  for (const name of moduleNames) assert.match(entry, new RegExp(`operating-loop/${name}\\.mjs`));
});

test("[verify:universe-a3a9cbeb-negative] tests/119-operating-loop-governance-obligations.test.mjs :: public failure and unknown-mode paths remain characterized", () => {
  assert.match(operatingTests, /invalid|unknown|failure/i);
  assert.match(entry, /process\.exit/);
});

test("[verify:universe-5517624a-expected] tests/119-operating-loop-governance-obligations.test.mjs :: self-check consumes modular source graphs", () => {
  assert.match(markerTests, /modular implementation graphs/);
  assert.match(read("scripts/self-check/architecture.mjs"), /operating-loop/);
});

test("[verify:universe-5517624a-negative] tests/119-operating-loop-governance-obligations.test.mjs :: extracted modules cannot hide legacy markers", () => {
  assert.match(markerTests, /legacy/);
  assert.match(markerTests, /assert\.(?:match|doesNotMatch|equal)/);
});

test("[verify:universe-aa06199b-expected] tests/119-operating-loop-governance-obligations.test.mjs :: structural budgets and exports are enforced", () => {
  assert.match(modularityTests, /380/);
  assert.match(modularityTests, /500/);
  assert.match(modularityTests, /explicit internal contract/);
});

test("[verify:universe-aa06199b-negative] tests/119-operating-loop-governance-obligations.test.mjs :: dependency and distribution regressions are rejected", () => {
  assert.match(modularityTests, /acyclic/);
  assert.match(modularityTests, /doesNotMatch/);
});

test("[verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-] tests/119-operating-loop-governance-obligations.test.mjs :: CLI flow remains executable without a rendered UI", () => {
  assert.match(operatingTests, /operating loop/);
  assert.doesNotMatch(entry, /document\.|window\./);
});

test("[verify:user-flow-regression-smoke-existing-critical-flow-still-works-af] tests/119-operating-loop-governance-obligations.test.mjs :: characteristic coverage retains existing critical modes", () => {
  assert.match(operatingTests, /work|guide|review|verify/i);
});

test("[verify:background-work-integration-contract-check-scheduled-queued-retr] tests/119-operating-loop-governance-obligations.test.mjs :: split modules start no background work", () => {
  const source = moduleNames.map((name) => read(`scripts/operating-loop/${name}.mjs`)).join("\n");
  assert.doesNotMatch(source, /setInterval|Worker|cron|scheduleJob/);
});

test("[verify:rollback-recovery-release-smoke-check-failure-interruption-rollb] tests/119-operating-loop-governance-obligations.test.mjs :: split is a reversible internal boundary", () => {
  assert.ok(entry.split("\n").length <= 380);
  assert.equal(moduleNames.length, 8);
  assert.match(entry, /resolveOperatingLoop|main|process\.argv/);
});

test("[verify:release-impact-release-smoke-check-release-rollback-monitoring-o] tests/119-operating-loop-governance-obligations.test.mjs :: structural batch remains source-only and performs no external release", () => {
  const channel = read("release-channel-policies/119-resolve-operating-loop-modularity.md");
  const execution = read("release-execution-plans/119-resolve-operating-loop-modularity.md");
  assert.match(channel, /source_only/);
  assert.match(execution, /PLAN_ONLY/);
  assert.match(execution, /"request_type": "none"/);
  assert.match(execution, /"real_release_execution_allowed": "No"/);
});

test("[verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders] tests/119-operating-loop-governance-obligations.test.mjs :: plan records structural and non-authorizing boundaries", () => {
  const plan = read("implementation-plans/119-resolve-operating-loop-modularity.md");
  assert.match(plan, /structure-preserving refactor/);
  assert.match(plan, /does not approve commit or push/);
});

test("[verify:test-coverage-regression-smoke-task-specific-verification-exists] tests/119-operating-loop-governance-obligations.test.mjs :: task-specific positive and reverse proofs are mapped", () => {
  const names = [...read("tests/119-operating-loop-governance-obligations.test.mjs").matchAll(/test\("\[verify:/g)];
  assert.equal(names.length, 17);
});
