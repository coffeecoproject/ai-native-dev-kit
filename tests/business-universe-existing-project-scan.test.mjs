import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  coverageVerificationProjection,
  deriveBusinessUniverseRouting,
  discoverBusinessUniverseEvidence,
} from "../scripts/lib/business-universe.mjs";

function project(prefix = "intentos-universe-existing-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

test("1.108 discovers deep project-owned behavior across monorepo roots without a shallow-depth shortcut", () => {
  const root = project();
  write(root, "apps/admin/src/features/orders/deep/workflow.ts", "export function validateOrderRetry() { return 'retry'; }\n");
  write(root, "services/api/src/domain/orders/deep/handler.go", "package orders\n// validate retry workflow state\n");
  write(root, "packages/shared/src/order-state.ts", "export type OrderState = 'created' | 'failed';\n");
  write(root, "docs/domain-model.md", "Order creation, failure, retry, cancellation, and audit use shared rules.\n");

  const result = discoverBusinessUniverseEvidence(root, {
    intent: "Existing project business closure audit for order creation, retry, cancellation, and audit",
  });
  const refs = result.candidate_sources.map((item) => item.source_ref);
  assert.equal(result.projection.support_status, "SUPPORTED");
  assert.ok(refs.includes("file:apps/admin/src/features/orders/deep/workflow.ts"));
  assert.ok(refs.includes("file:services/api/src/domain/orders/deep/handler.go"));
  assert.ok(refs.includes("file:packages/shared/src/order-state.ts"));
  assert.deepEqual(new Set(result.projection.inspected_roots), new Set(["apps", "docs", "packages", "services"]));
  assert.ok(result.projection.scan_segments.every((item) => item.status === "COMPLETE"));
});

test("1.108 excludes IntentOS assets, dependencies, generated output, vendor trees, and symlink escapes", () => {
  const root = project();
  const outside = project("intentos-universe-outside-");
  write(root, "src/real-rule.ts", "export function validateRealRule() { return true; }\n");
  write(root, ".intentos/core/fake-rule.ts", "export function validateFakeIntentOSRule() {}\n");
  write(root, "node_modules/pkg/fake-rule.ts", "export function validateDependencyRule() {}\n");
  write(root, "generated/fake-rule.ts", "export function validateGeneratedRule() {}\n");
  write(root, "vendor/fake-rule.go", "package fake\n// validate vendor rule\n");
  const outsideFile = write(outside, "external-rule.ts", "export function validateExternalRule() {}\n");
  fs.symlinkSync(outsideFile, path.join(root, "external-rule.ts"));

  const result = discoverBusinessUniverseEvidence(root, { intent: "validate the real rule" });
  const refs = result.candidate_sources.map((item) => item.source_ref);
  assert.deepEqual(refs, ["file:src/real-rule.ts"]);
  assert.ok(refs.every((ref) => !/\.intentos|node_modules|generated|vendor|external-rule/.test(ref)));
});

test("1.108 reports deterministic partial scan state when file or byte budgets are exhausted", () => {
  const root = project();
  for (let index = 0; index < 24; index += 1) {
    write(root, `modules/module-${String(index).padStart(2, "0")}/src/rule.ts`, `export function validateRule${index}() { return ${index}; }\n`);
  }
  const first = discoverBusinessUniverseEvidence(root, { intent: "all modules share validation", maxFiles: 5, maxBytes: 160 });
  const second = discoverBusinessUniverseEvidence(root, { intent: "all modules share validation", maxFiles: 5, maxBytes: 160 });
  assert.equal(first.projection.support_status, "PARTIAL");
  assert.equal(first.projection.truncated, "No");
  assert.equal(first.projection.budget_exhausted, "Yes");
  assert.ok(first.projection.next_file_index < first.projection.total_semantic_files);
  assert.ok(first.projection.remaining_segment_ids.length > 0);
  assert.equal(first.projection.resume_state_digest, second.projection.resume_state_digest);
  assert.equal(first.projection.discovery_boundary_digest, second.projection.discovery_boundary_digest);
  assert.deepEqual(first.projection.scan_segments, second.projection.scan_segments);
});

test("1.108 resumes a bounded scan without dropping prior candidates", () => {
  const root = project();
  for (let index = 0; index < 17; index += 1) {
    write(root, `packages/p${String(index).padStart(2, "0")}/src/rule.ts`, `export function validateSharedRule${index}() { return 'retry-${index}'; }\n`);
  }
  const options = { intent: "all packages share validation and retry behavior", maxFiles: 4, maxBytes: 1024 * 1024 };
  let current = discoverBusinessUniverseEvidence(root, options);
  let runs = 1;
  while (current.projection.budget_exhausted === "Yes") {
    current = discoverBusinessUniverseEvidence(root, { ...options, resumeFrom: current.projection });
    runs += 1;
    assert.ok(runs < 10, "resume must converge");
  }
  const uninterrupted = discoverBusinessUniverseEvidence(root, { ...options, maxFiles: 100 });
  assert.ok(runs > 1);
  assert.equal(current.projection.resumed, "Yes");
  assert.equal(current.projection.support_status, "SUPPORTED");
  assert.equal(current.projection.next_file_index, current.projection.total_semantic_files);
  assert.deepEqual(
    current.candidate_sources.map((item) => item.source_ref),
    uninterrupted.candidate_sources.map((item) => item.source_ref),
  );
});

test("1.108 rejects stale or tampered resume state", () => {
  const root = project();
  for (let index = 0; index < 8; index += 1) {
    write(root, `src/rule-${index}.ts`, `export function validateRule${index}() { return true; }\n`);
  }
  const partial = discoverBusinessUniverseEvidence(root, { intent: "all rules share validation", maxFiles: 2 });
  const tampered = { ...partial.projection, next_file_index: partial.projection.next_file_index + 1 };
  assert.throws(
    () => discoverBusinessUniverseEvidence(root, { intent: "all rules share validation", maxFiles: 2, resumeFrom: tampered }),
    /resume state digest is invalid/,
  );
  write(root, "src/new-rule.ts", "export function validateNewRule() { return true; }\n");
  assert.throws(
    () => discoverBusinessUniverseEvidence(root, { intent: "all rules share validation", maxFiles: 2, resumeFrom: partial.projection }),
    /resume inventory does not match/,
  );
});

test("1.108 existing-project closure audit triggers technical coverage without an industry whitelist", () => {
  const root = project();
  write(root, "src/alpha.ts", "export function validateAlphaRetry() { return 'alpha'; }\n");
  write(root, "src/beta.ts", "export function validateBetaRecovery() { return 'beta'; }\n");
  const routing = deriveBusinessUniverseRouting({
    projectRoot: root,
    intent: "Audit the existing project business closure for alpha and beta recovery paths",
    taskImpact: "MEDIUM",
    taskKind: "code_behavior",
  });
  assert.equal(routing.required, "Yes");
  assert.equal(routing.routing_result, "REQUIRED_WITH_EVIDENCE");
  assert.ok(routing.reason_codes.includes("EXISTING_PROJECT_CLOSURE_AUDIT"));
  assert.equal(routing.technical_terms_required_from_user, "No");
});

test("1.108 adapter discovery remains platform-neutral across supported source families", () => {
  const cases = [
    ["Sources/App.swift", "struct AppState {}\n", "SWIFT_PROJECT"],
    ["app/src/main/Main.kt", "class MainState\n", "JVM_OR_ANDROID_PROJECT"],
    ["src/main.go", "package main\ntype AppState struct{}\n", "GO_PROJECT"],
    ["src/main.py", "class AppState:\n    pass\n", "PYTHON_PROJECT"],
    ["src/main.ts", "export type AppState = {};\n", "JS_TS_PROJECT"],
  ];
  for (const [relativePath, content, expected] of cases) {
    const root = project();
    write(root, relativePath, content);
    const result = discoverBusinessUniverseEvidence(root, { intent: "inspect application state" });
    assert.equal(result.projection.adapter_kind, expected, relativePath);
  }
});

test("1.108 verification projection covers supported platform profiles without a universal backend assumption", () => {
  const cases = [
    ["src/components/form.tsx", ["web"], "WEB_CLIENT_BEHAVIOR", "UI_INTERACTION_TEST"],
    ["miniprogram/pages/form/index.js", ["wechat-miniprogram"], "MINI_PROGRAM_BEHAVIOR", "UI_INTERACTION_TEST"],
    ["cloudfunctions/submit/index.js", ["wechat-miniprogram"], "MINI_PROGRAM_CLOUD_FUNCTION", "INTEGRATION_CONTRACT_CHECK"],
    ["Sources/Feature/Rule.swift", ["ios"], "IOS_LOCAL_BEHAVIOR", "UNIT_BEHAVIOR_TEST"],
    ["app/src/main/Rule.kt", ["android"], "ANDROID_LOCAL_BEHAVIOR", "UNIT_BEHAVIOR_TEST"],
    ["src/admin/workflows/rule.ts", ["internal-admin"], "INTERNAL_ADMIN_WORKFLOW", "UI_INTERACTION_TEST"],
    ["services/api/handlers/rule.ts", ["backend-api"], "API_OR_SERVICE_BEHAVIOR", "BACKEND_RULE_TEST"],
    ["workers/projection-job.ts", [], "WORKER_OR_DATA_PATH", "INTEGRATION_CONTRACT_CHECK"],
  ];
  for (const [sourceRef, profiles, expectedSurface, expectedType] of cases) {
    const locatorId = `locator:${expectedSurface.toLowerCase()}`;
    const universe = {
      evidence_locators: [{ locator_id: locatorId, source_ref: `file:${sourceRef}` }],
    };
    const scenario = {
      source_locator_refs: [locatorId],
      required_proof_strength: "PROJECT_NATIVE_BEHAVIOR_PROOF",
    };
    const projection = coverageVerificationProjection(universe, scenario, profiles);
    assert.equal(projection.source_surface, expectedSurface, sourceRef);
    assert.equal(projection.verification_type, expectedType, sourceRef);
  }
});
