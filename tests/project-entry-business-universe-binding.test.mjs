import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  compactUniverseBinding,
  coverageScenarioIdentity,
  deriveBusinessUniverseRouting,
} from "../scripts/lib/business-universe.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coverageSuite = path.join(kitRoot, "tests", "business-universe-coverage.test.mjs");

function fixture() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "intentos-entry-universe-"));
}

function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function runCoverageTest(pattern, env = {}) {
  const childEnv = { ...process.env, ...env };
  delete childEnv.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, [
    "--test",
    `--test-name-pattern=${pattern}`,
    coverageSuite,
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
    env: childEnv,
  });
}

function scenario() {
  return {
    category_ids: ["category:imported", "category:interactive"],
    participant_ids: ["participant:operator"],
    origin_ids: ["origin:import", "origin:form"],
    lifecycle_stage: "PROCESS",
    processing_path_ids: ["path:validate", "path:persist"],
    selection_point_ids: ["selection:eligible"],
    consistency_group_ids: ["consistency:record"],
    path_provenance: "REAL_GENERATION_PATH",
    required_proof_strength: "PROJECT_NATIVE_BEHAVIOR_PROOF",
    expected_behavior: "Both origins use the same validation and persistence behavior.",
    negative_or_reverse_behavior: "A failed or cancelled path leaves no partial result.",
  };
}

test("1.109 invokes Business Universe only when the current 1.108 routing authority requires it", () => {
  const docsRoot = fixture();
  write(docsRoot, "README.md", "# Sample\n");
  const notRequired = deriveBusinessUniverseRouting({
    projectRoot: docsRoot,
    intent: "Fix one typo in README documentation",
    taskKind: "docs_only",
    taskImpact: "LOW",
  });
  assert.equal(notRequired.required, "No");
  assert.equal(notRequired.routing_result, "NOT_REQUIRED_WITH_REASON");
  assert.deepEqual(compactUniverseBinding(null), {
    required: "No",
    business_universe_ref: "N/A",
    business_universe_digest: "N/A",
    business_universe_state: "NOT_REQUIRED_WITH_REASON",
    coverage_scenario_ids: [],
    coverage_mapping_status: "NOT_REQUIRED",
  });

  const behaviorRoot = fixture();
  write(behaviorRoot, "src/records.ts", [
    "export function validateInteractive(record) { return record; }",
    "export function validateImported(record) { return record; }",
    "export function compensateCancelled(record) { return record; }",
    "",
  ].join("\n"));
  const intent = "Interactive and imported records use the same validation; failed work retries and cancelled work compensates before derived status changes.";
  const required = deriveBusinessUniverseRouting({
    projectRoot: behaviorRoot,
    intent,
    taskKind: "code_behavior",
    taskImpact: "MEDIUM",
  });
  assert.equal(required.required, "Yes");
  assert.equal(required.routing_result, "REQUIRED_WITH_EVIDENCE");
  assert.ok(required.relationship_ids.length > 0);

  const trust = resolveProjectEntryTrust({ projectRoot: behaviorRoot, sourceRoot: kitRoot, goal: intent });
  assert.equal(trust.goal_projection.original_goal, intent);
  assert.equal(trust.project_fact_projection.goal_projection.goal_digest, trust.goal_projection.goal_digest);
});

test("1.109 entry/adoption metadata cannot rewrite a 1.108 coverage scenario identity", () => {
  const original = scenario();
  const initial = coverageScenarioIdentity(original);
  const withEntryMetadata = coverageScenarioIdentity({
    ...original,
    category_ids: [...original.category_ids].reverse(),
    origin_ids: [...original.origin_ids].reverse(),
    processing_path_ids: [...original.processing_path_ids].reverse(),
    project_entry_trust_digest: "sha256:not-a-business-universe-field",
    adoption_state: "VERIFIED_ACTIVE",
    project_fact_digest: "sha256:also-not-a-business-universe-field",
  });
  assert.deepEqual(withEntryMetadata, initial);

  const universe = {
    coverage_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    outcome: "COVERAGE_READY",
    coverage_scenarios: [{ ...original, ...initial }],
  };
  assert.deepEqual(compactUniverseBinding(universe, "business-universe-coverages/current.md"), {
    required: "Yes",
    business_universe_ref: "business-universe-coverages/current.md",
    business_universe_digest: universe.coverage_digest,
    business_universe_state: "COVERAGE_READY",
    coverage_scenario_ids: [initial.coverage_scenario_id],
    coverage_mapping_status: "COMPLETE",
  });
});

test("1.109 keeps the exact required Business Universe scenario set through the existing structured consumers", () => {
  const result = runCoverageTest("preserves every scenario through Plan Review", {
    INTENTOS_BUSINESS_UNIVERSE_TEST_INTENT: "Interactive forms and local imports use the same validation; when processing fails it retries, and when cancelled it compensates before updating derived status.",
    INTENTOS_BUSINESS_UNIVERSE_EXPECTED_TIER: "MEDIUM",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("1.109 keeps strict finish fail-closed for missing or altered Business Universe bindings", () => {
  for (const pattern of [
    "candidate output fails closed without exact Work Queue",
    "rejects a scenario removed from a downstream completion consumer",
  ]) {
    const result = runCoverageTest(pattern);
    assert.equal(result.status, 0, `${pattern}\n${result.stdout}\n${result.stderr}`);
  }
});
