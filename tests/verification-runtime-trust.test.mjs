import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  createEvidenceAuthorityBinding,
  projectIdentity,
} from "../scripts/lib/evidence-authority.mjs";
import { digestText, effectiveTaskTier } from "../scripts/lib/verification-runtime-trust.mjs";
import {
  adapterSelectionSemanticErrors,
  selectRuntimeAdapter,
} from "../scripts/lib/verification-runtime-adapters.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 1024 * 1024 * 32,
  });
}

function tempProject(prefix = "intentos-runtime-trust-") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.cpSync(path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time"), root, { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: "runtime-trust-fixture",
    private: true,
    scripts: { dev: "node server.mjs", test: "node --test" },
  }, null, 2));
  return root;
}

function createHighPlan(root) {
  const result = run("scripts/resolve-verification-runtime-plan.mjs", [
    root,
    "--intent", "appointment requests must include a service time",
    "--task-ref", "tasks/001-appointment-requests-must-include-a-service-time.md",
    "--task-tier", "HIGH",
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--out", "verification-runtime-plans/001-service-time.md",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const checked = run("scripts/check-verification-runtime-plan.mjs", [
    root,
    "--report", "verification-runtime-plans/001-service-time.md",
    "--require-structured-evidence",
  ]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  return readEvidence(path.join(root, "verification-runtime-plans/001-service-time.md"));
}

function createHighManifest(root, mutate = null) {
  const plan = readEvidence(path.join(root, "verification-runtime-plans/001-service-time.md"));
  const evidenceDir = path.join(root, "evidence");
  fs.mkdirSync(evidenceDir, { recursive: true });
  const evidenceFiles = {
    preflight: writeEvidence(root, "evidence/runtime-preflight.txt", "PASS source worktree process port env data session production guards\n"),
    service: writeEvidence(root, "evidence/runtime-service.txt", "PASS pid argv cwd start-time identity\n"),
    resources: writeEvidence(root, "evidence/runtime-resources.txt", "PASS isolated database cache session ownership\n"),
    positive: writeEvidence(root, "evidence/runtime-positive.txt", "PASS appointment accepted with service time\n"),
    negative: writeEvidence(root, "evidence/runtime-negative.txt", "PASS appointment rejected without service time\n"),
    before: writeEvidence(root, "evidence/runtime-cleanup-before.txt", "owned resources: process db session\n"),
    after: writeEvidence(root, "evidence/runtime-cleanup-after.txt", "owned resources remaining: 0; unrelated touched: 0\n"),
  };
  const now = Date.now();
  const startedAt = new Date(now - 10_000).toISOString();
  const finishedAt = new Date(now).toISOString();
  const ownerTokenDigest = digestText("fixture-owner-token-never-recorded");
  const ownerMarker = digestText(`vrun-fixture-high|${ownerTokenDigest}`);
  const manifest = {
    schema_version: "1.102.0",
    artifact_type: "verification_run_manifest",
    run_manifest_ref: "verification-run-manifests/001-service-time.md",
    run_manifest_digest: "sha256:pending",
    run_id: "vrun-fixture-high-001",
    owner_token_digest: ownerTokenDigest,
    runtime_plan_ref: "artifact:verification-runtime-plans/001-service-time.md",
    runtime_plan_digest: plan.runtime_plan_digest,
    adapter_contract_digest: plan.adapter_selection.contract_digest,
    verification_plan_ref: "artifact:verification-plans/001-service-time.md",
    verification_plan_digest: plan.verification_plan_source.digest,
    task_ref: plan.task_ref,
    intent_digest: plan.intent_digest,
    task_tier: "HIGH",
    runtime_trust_level: "ISOLATED_RUNTIME",
    source_identity: { ...projectIdentity(root), current_project_match: "Yes" },
    build_artifacts: [],
    run_window: { started_at: startedAt, finished_at: finishedAt, state: "COMPLETED" },
    preflight_results: plan.preflight_requirements.map((item) => ({
      probe: item.probe,
      required: item.required,
      result: "PASS",
      evidence_ref: evidenceFiles.preflight.ref,
      evidence_digest: evidenceFiles.preflight.digest,
      reason: "Observed by the current run preflight.",
    })),
    service_instances: [{
      id: "service:api",
      adapter_kind: "LOCAL_PROCESS",
      identity_status: "VERIFIED",
      identity_fields: [
        { name: "pid", value_digest: digestText("12345"), redacted_display: "pid:<recorded>" },
        { name: "argv", value_digest: digestText("node server.mjs"), redacted_display: "node <entry>" },
        { name: "cwd", value_digest: digestText(root), redacted_display: "<project-root>" },
      ],
      started_at: startedAt,
      owned_by_run: "Yes",
      evidence_ref: evidenceFiles.service.ref,
      evidence_digest: evidenceFiles.service.digest,
    }],
    data_resources: [{
      id: "data:db",
      resource_type: "DATABASE",
      instance_fingerprint: digestText("fixture-postgres-instance"),
      namespace_digest: digestText("vrun-fixture-high-001-db"),
      migration_revision: "fixture-migration-001",
      isolation_status: "ISOLATED",
      production_instance: "No",
      owned_by_run: "Yes",
    }],
    session_contexts: [{
      id: "session:user",
      role: "booking-user",
      namespace_digest: digestText("vrun-fixture-high-001-user-session"),
      isolation_status: "ISOLATED",
      owned_by_run: "Yes",
      credential_stored: "No",
    }],
    resource_ledger: [
      ownedResource("service:api", "PROCESS", ownerMarker, evidenceFiles.resources),
      ownedResource("data:db", "DATABASE", ownerMarker, evidenceFiles.resources),
      ownedResource("session:user", "SESSION", ownerMarker, evidenceFiles.resources),
    ],
    verification_executions: [
      execution("exec:positive", true, false, evidenceFiles.positive, startedAt, finishedAt),
      execution("exec:negative", false, true, evidenceFiles.negative, startedAt, finishedAt),
    ],
    cleanup_summary: {
      state: "VERIFIED",
      owned_resources_remaining: 0,
      unrelated_resources_touched: "No",
      before_evidence_ref: evidenceFiles.before.ref,
      before_evidence_digest: evidenceFiles.before.digest,
      after_evidence_ref: evidenceFiles.after.ref,
      after_evidence_digest: evidenceFiles.after.digest,
    },
    boundaries: {
      stores_raw_secrets: "No",
      authorizes_broad_cleanup: "No",
      changes_production: "No",
      approves_implementation_release_or_production: "No",
      proves_product_or_business_correctness: "No",
    },
    authority_binding: {},
    outcome: "RUNTIME_TRUST_COMPLETE",
    next_step: "Bind this run manifest to Test Evidence in the downstream consumer release.",
  };
  if (mutate) mutate(manifest);
  manifest.authority_binding = createEvidenceAuthorityBinding(root, {
    taskRef: manifest.task_ref,
    intentDigest: manifest.intent_digest,
    sourceRefs: sourceRefs(manifest),
  });
  manifest.run_manifest_digest = evidenceDigest(manifest, ["run_manifest_digest"]);
  const report = renderManifest(manifest);
  fs.mkdirSync(path.join(root, "verification-run-manifests"), { recursive: true });
  fs.writeFileSync(path.join(root, "verification-run-manifests/001-service-time.md"), report);
  return manifest;
}

test("LOW runtime plan is automatic, lightweight, and strict", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-low-"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "low-fixture" }));
  const generated = run("scripts/resolve-verification-runtime-plan.mjs", [
    root, "--intent", "change home page copy", "--task-ref", "tasks/low.md",
    "--out", "verification-runtime-plans/low.md",
  ]);
  assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
  const plan = readEvidence(path.join(root, "verification-runtime-plans/low.md"));
  assert.equal(plan.task_tier, "LOW");
  assert.equal(plan.runtime_trust_level, "SOURCE_OUTPUT_BINDING");
  assert.equal(plan.adapter_selection.adapter_kind, "COMMAND_ONLY");
  assert.equal(plan.adapter_selection.user_selection_required, "No");
  assert.equal(plan.outcome, "RUNTIME_PLAN_READY");
  const checked = run("scripts/check-verification-runtime-plan.mjs", [root, "--report", "verification-runtime-plans/low.md", "--require-structured-evidence"]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
});

test("explicit task tier cannot downgrade classifier risk", () => {
  assert.equal(effectiveTaskTier("HIGH", "LOW"), "HIGH");
  assert.equal(effectiveTaskTier("MEDIUM", "LOW"), "MEDIUM");
  assert.equal(effectiveTaskTier("POSSIBLE_HIGH", "LOW"), "POSSIBLE_HIGH");
  assert.equal(effectiveTaskTier("POSSIBLE_HIGH", "HIGH"), "HIGH");
});

test("runtime adapters derive typed project contracts without user selection", () => {
  const cases = [
    ["LOCAL_PROCESS", { "package.json": JSON.stringify({ scripts: { dev: "node server.mjs" } }) }],
    ["DOCKER_CONTAINER", { "Dockerfile": "FROM node:22\n" }],
    ["KUBERNETES_WORKLOAD", { "k8s/deployment.yaml": "apiVersion: apps/v1\nkind: Deployment\n" }],
    ["SERVERLESS_DEPLOYMENT", { "vercel.json": "{}\n" }],
    ["STATIC_BUILD", { "index.html": "<!doctype html>\n" }],
    ["PROJECT_NATIVE", { "Package.swift": "// swift-tools-version: 6.0\n" }],
  ];
  for (const [expected, files] of cases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-adapter-${expected.toLowerCase()}-`));
    for (const [relative, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
      fs.writeFileSync(path.join(root, relative), content);
    }
    const selected = selectRuntimeAdapter(root, "MEDIUM");
    assert.equal(selected.adapter_kind, expected);
    assert.equal(selected.user_selection_required, "No");
    assert.equal(selected.lifecycle_mode, "OBSERVE_AND_PLAN_ONLY");
    assert.ok(selected.discovery_sources.length > 0);
    assert.deepEqual(adapterSelectionSemanticErrors(selected, "TARGETED_SERVICE_IDENTITY", "1.102.0"), []);
  }
});

test("Kubernetes orchestration evidence outranks a generic Docker build file", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-adapter-precedence-"));
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM node:22\n");
  fs.mkdirSync(path.join(root, "k8s"));
  fs.writeFileSync(path.join(root, "k8s/deployment.yaml"), "apiVersion: apps/v1\nkind: Deployment\n");
  const selected = selectRuntimeAdapter(root, "HIGH");
  assert.equal(selected.adapter_kind, "KUBERNETES_WORKLOAD");
  assert.ok(selected.alternative_adapters.includes("DOCKER_CONTAINER"));
});

test("conflicting project-owned adapter declarations fail closed", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-adapter-conflict-"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ intentos: { verificationRuntime: { adapter: "LOCAL_PROCESS" } } }));
  fs.mkdirSync(path.join(root, ".intentos"));
  fs.writeFileSync(path.join(root, ".intentos/runtime-adapter.json"), JSON.stringify({ adapter_kind: "DOCKER_CONTAINER" }));
  const selected = selectRuntimeAdapter(root, "MEDIUM");
  assert.equal(selected.status, "BLOCKED");
  assert.equal(selected.adapter_kind, "UNRESOLVED");
  assert.match(selected.reason, /Conflicting project-owned runtime adapter declarations/);
});

test("adapter contract tampering fails semantic validation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-adapter-tamper-"));
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM node:22\n");
  const selected = selectRuntimeAdapter(root, "MEDIUM");
  selected.required_identity_fields = ["pid"];
  const errors = adapterSelectionSemanticErrors(selected, "TARGETED_SERVICE_IDENTITY", "1.102.0");
  assert.ok(errors.some((error) => /required_identity_fields/.test(error)));
});

test("POSSIBLE_HIGH runtime planning fails closed", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-possible-high-"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "possible-high", scripts: { dev: "node server.mjs" } }));
  const generated = run("scripts/resolve-verification-runtime-plan.mjs", [
    root, "--intent", "update API response formatting", "--task-ref", "tasks/api.md",
    "--out", "verification-runtime-plans/api.md",
  ]);
  assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
  const plan = readEvidence(path.join(root, "verification-runtime-plans/api.md"));
  assert.equal(plan.task_tier, "POSSIBLE_HIGH");
  assert.equal(plan.runtime_trust_level, "BLOCKED_FOR_CLASSIFICATION");
  assert.equal(plan.outcome, "RUNTIME_PLAN_BLOCKED");
});

test("valid HIGH runtime manifest binds isolated run and cleanup evidence", () => {
  const root = tempProject();
  createHighPlan(root);
  createHighManifest(root);
  const checked = run("scripts/check-verification-run-manifest.mjs", [
    root,
    "--report", "verification-run-manifests/001-service-time.md",
    "--require-structured-evidence",
    "--require-complete",
  ]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
});

test("HIGH runtime manifest rejects missing service identity", () => {
  const root = tempProject();
  createHighPlan(root);
  createHighManifest(root, (manifest) => { manifest.service_instances = []; });
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/001-service-time.md", "--require-complete"]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /verified service instance identity/i);
});

test("HIGH runtime manifest rejects incomplete adapter-specific identity", () => {
  const root = tempProject();
  createHighPlan(root);
  createHighManifest(root, (manifest) => {
    manifest.service_instances[0].identity_fields = manifest.service_instances[0].identity_fields.filter((item) => item.name !== "cwd");
  });
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/001-service-time.md", "--require-complete"]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /requires adapter identity field cwd/i);
});

test("runtime plan invalidates changed adapter discovery evidence", () => {
  const root = tempProject();
  createHighPlan(root);
  const packageFile = path.join(root, "package.json");
  const value = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  value.scripts.dev = "node changed-server.mjs";
  fs.writeFileSync(packageFile, JSON.stringify(value, null, 2));
  const checked = run("scripts/check-verification-runtime-plan.mjs", [root, "--report", "verification-runtime-plans/001-service-time.md", "--require-structured-evidence"]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /adapter discovery source.*digest/i);
});

test("HIGH runtime manifest rejects production data and unsafe cleanup", () => {
  const root = tempProject();
  createHighPlan(root);
  createHighManifest(root, (manifest) => {
    manifest.data_resources[0].production_instance = "Yes";
    manifest.cleanup_summary.unrelated_resources_touched = "Yes";
  });
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/001-service-time.md", "--require-complete"]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /isolated non-production data resource/i);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /must not touch unrelated resources/i);
});

test("runtime manifest rejects raw connection credentials", () => {
  const root = tempProject();
  createHighPlan(root);
  createHighManifest(root);
  const file = path.join(root, "verification-run-manifests/001-service-time.md");
  fs.appendFileSync(file, "\nDATABASE_URL=postgres://user:unsafe-password@example.invalid/db\n");
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/001-service-time.md"]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /secret-like content/i);
});

test("runtime trust report arguments cannot escape the project", () => {
  const project = tempProject("intentos-runtime-report-path-");
  for (const [script, report] of [
    ["scripts/check-verification-runtime-plan.mjs", "../outside.md"],
    ["scripts/check-verification-run-manifest.mjs", "../outside.md"],
  ]) {
    const result = run(script, [project, "--report", report]);
    assert.notEqual(result.status, 0, `${script} must reject project-external reports`);
    assert.match(result.stderr + result.stdout, /safe project-relative Markdown path/);
  }
});

test("runtime trust report arguments reject symbolic links", () => {
  const project = tempProject("intentos-runtime-report-symlink-");
  const outside = path.join(os.tmpdir(), `intentos-runtime-outside-${process.pid}-${Date.now()}.md`);
  fs.writeFileSync(outside, "# Outside report\n");

  for (const [script, directory] of [
    ["scripts/check-verification-runtime-plan.mjs", "verification-runtime-plans"],
    ["scripts/check-verification-run-manifest.mjs", "verification-run-manifests"],
  ]) {
    const reportDirectory = path.join(project, directory);
    fs.mkdirSync(reportDirectory, { recursive: true });
    fs.symlinkSync(outside, path.join(reportDirectory, "linked.md"));
    const result = run(script, [project, "--report", `${directory}/linked.md`]);
    assert.notEqual(result.status, 0, `${script} must reject symbolic-link reports`);
    assert.match(result.stderr + result.stdout, /symlink/i);
  }

  fs.rmSync(outside, { force: true });
});

function ownedResource(resourceId, resourceType, ownerMarker, evidence) {
  return {
    resource_id: resourceId,
    resource_type: resourceType,
    created_by_run: "Yes",
    owner_marker_digest: ownerMarker,
    cleanup_state: "CLEANED",
    evidence_ref: evidence.ref,
    evidence_digest: evidence.digest,
  };
}

function execution(id, positive, negative, evidence, startedAt, finishedAt) {
  return {
    id,
    result: "PASSED",
    command_digest: digestText(`${id}:command`),
    started_at: startedAt,
    finished_at: finishedAt,
    exit_code: 0,
    output_ref: evidence.ref,
    output_digest: evidence.digest,
    covers_obligations: [positive ? "verify:api-positive" : "verify:api-negative"],
    service_instance_ids: ["service:api"],
    resource_ids: ["data:db", "session:user"],
    positive_path: positive ? "Yes" : "No",
    negative_path: negative ? "Yes" : "No",
  };
}

function writeEvidence(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return { ref: `artifact:${relative}`, digest: canonicalFileDigest(file) };
}

function sourceRefs(manifest) {
  return [
    manifest.runtime_plan_ref,
    manifest.verification_plan_ref,
    ...manifest.preflight_results.map((item) => item.evidence_ref),
    ...manifest.service_instances.map((item) => item.evidence_ref),
    ...manifest.resource_ledger.map((item) => item.evidence_ref),
    ...manifest.verification_executions.map((item) => item.output_ref),
    manifest.cleanup_summary.before_evidence_ref,
    manifest.cleanup_summary.after_evidence_ref,
  ];
}

function readEvidence(file) {
  const result = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  assert.equal(result?.ok, true);
  return result.value;
}

function renderManifest(value) {
  return `# Verification Run Manifest

## Human Summary

The current run recorded source, service, isolated data/session, execution, ownership, and cleanup evidence.

## Run Binding

- Run ID: \`${value.run_id}\`
- Task ref: \`${value.task_ref}\`
- Intent digest: \`${value.intent_digest}\`
- Runtime plan ref: \`${value.runtime_plan_ref}\`
- Runtime plan digest: \`${value.runtime_plan_digest}\`
- Runtime trust level: \`${value.runtime_trust_level}\`

## Source Identity

- Project kind: \`${value.source_identity.kind}\`
- Project fingerprint: \`${value.source_identity.fingerprint}\`
- Source revision: \`${value.source_identity.revision}\`

## Run Window

- Started at: \`${value.run_window.started_at}\`
- Finished at: \`${value.run_window.finished_at}\`
- Run state: \`${value.run_window.state}\`

## Environment Preflight

All required preflight probes are recorded in structured evidence.

## Service Instances

The intended local process identity is digest-bound and run-owned.

## Data And Session Isolation

Database and login session namespaces are isolated and non-production.

## Resource Ownership Ledger

Every managed resource carries the current run owner marker.

## Verification Executions

Positive and negative task paths have passing output evidence.

## Cleanup Proof

- Cleanup state: \`${value.cleanup_summary.state}\`
- Owned resources remaining: \`${value.cleanup_summary.owned_resources_remaining}\`
- Unrelated resources touched: \`${value.cleanup_summary.unrelated_resources_touched}\`

## Boundaries

- This manifest stores raw secrets: No
- This manifest authorizes broad cleanup: No
- This manifest changes production: No
- This manifest approves implementation, release, or production: No
- This manifest proves product or business correctness: No

## Evidence Authority

Current project, task, intent, runtime plan, and run evidence are digest-bound.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

\`${value.outcome}\`

## Next Step

${value.next_step}
`;
}
