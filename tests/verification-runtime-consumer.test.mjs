import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import {
  resolveRuntimeTrustBinding,
  runtimeTrustBindingsAgree,
  validateRuntimeTrustBinding,
} from "../scripts/lib/verification-runtime-consumer.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const intent = "appointment requests must include a service time";
const taskRef = "tasks/001-appointment-requests-must-include-a-service-time.md";

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(options.scriptRoot || kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: 90_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function runInstalled(root, script, args) {
  return run(script, args, { cwd: root, scriptRoot: root });
}

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-consumer-"));
  const initialized = run("scripts/init-project.mjs", ["--target", root, "--starter", "generic-project"]);
  assert.equal(initialized.status, 0, `${initialized.stdout}\n${initialized.stderr}`);
  fs.cpSync(path.join(kitRoot, "examples/1.77-test-evidence-binding/appointment-service-time"), root, { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "runtime-consumer-fixture", private: true }, null, 2));
  fs.writeFileSync(path.join(root, "verify.mjs"), `
if (!process.env.INTENTOS_RUN_ID || !process.env.INTENTOS_OWNER_TOKEN) process.exit(2);
console.log("current runtime verified", process.env.INTENTOS_RUN_ID);
`);
  const verificationPlan = evidence(path.join(root, "verification-plans/001-service-time.md"));
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/task-governance.md"), `# Task Governance\n\n## Machine-Readable Evidence\n\n\`\`\`json\n${JSON.stringify({
    artifact_type: "task_governance",
    task_ref: taskRef,
    intent,
    intent_digest: verificationPlan.intent_digest,
    task_governance_digest: `sha256:${"a".repeat(64)}`,
    impact_classification: { task_impact: "LOW" },
  }, null, 2)}\n\`\`\`\n`);
  fs.writeFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), JSON.stringify({
    version: "1.103.0",
    adapter_kind: "COMMAND_ONLY",
    actions: [{
      id: "verify-current-task",
      phase: "VERIFY",
      kind: "COMMAND",
      argv: ["node", "verify.mjs"],
      cwd: ".",
      timeout_ms: 10_000,
      environment: [],
      obligation_ids: verificationPlan.verification_obligations.filter((item) => item.required === "Yes").map((item) => item.id),
      positive_path: "Yes",
      negative_path: "No",
      resource_ids: [],
      external_effect: "No",
      depends_on: [],
    }],
    resources: [],
  }, null, 2));
  return root;
}

function completeRuntime(root, runId = "vrun-consumer-001") {
  const runtime = runInstalled(root, "scripts/resolve-verification-runtime-plan.mjs", [
    root,
    "--intent", intent,
    "--task-ref", taskRef,
    "--task-tier", "LOW",
    "--task-governance-ref", "artifact:.intentos/task-governance.md",
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--out", "verification-runtime-plans/current.md",
  ]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = runInstalled(root, "scripts/resolve-verification-runtime-lifecycle.mjs", [
    root,
    "--runtime-plan-ref", "artifact:verification-runtime-plans/current.md",
    "--run-id", runId,
    "--out", "verification-runtime-lifecycle-plans/current.md",
  ]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const executed = runInstalled(root, "scripts/run-verification-runtime.mjs", [
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/current.md",
    "--out", "verification-run-manifests/current.md",
  ]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  const manifest = evidence(path.join(root, "verification-run-manifests/current.md"));
  return { manifest, ref: "artifact:verification-run-manifests/current.md" };
}

test("1.104 binds one authoritative current runtime into Test Evidence, Execution Assurance, Completion, and finish", () => {
  const root = project();
  const { manifest, ref } = completeRuntime(root);
  const resolved = resolveRuntimeTrustBinding(root, {
    manifestRef: ref,
    taskRef,
    intentDigest: manifest.intent_digest,
    verificationPlanRef: "artifact:verification-plans/001-service-time.md",
    verificationPlanDigest: manifest.verification_plan_digest,
  });
  assert.equal(resolved.ok, true, resolved.binding.reason);
  assert.equal(resolved.binding.run_id, manifest.run_id);

  const testEvidence = runInstalled(root, "scripts/resolve-test-evidence.mjs", [
    root,
    "--intent", intent,
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--runtime-manifest-ref", ref,
    "--out", "test-evidence-reports/001-service-time.md",
  ]);
  assert.equal(testEvidence.status, 0, `${testEvidence.stdout}\n${testEvidence.stderr}`);
  const testValue = evidence(path.join(root, "test-evidence-reports/001-service-time.md"));
  assert.equal(testValue.test_evidence_state, "TEST_EVIDENCE_COMPLETE");
  assert.equal(testValue.runtime_trust_binding.run_id, manifest.run_id);
  const testCheck = runInstalled(root, "scripts/check-test-evidence.mjs", [
    root,
    "--report", "test-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "--require-runtime-trust",
  ]);
  assert.equal(testCheck.status, 0, `${testCheck.stdout}\n${testCheck.stderr}`);

  const assurance = runInstalled(root, "scripts/resolve-execution-assurance.mjs", [
    root,
    "--intent", intent,
    "--task", taskRef,
    "--runtime-manifest-ref", ref,
    "--out", "execution-assurance-reports/001-service-time.md",
  ]);
  assert.equal(assurance.status, 0, `${assurance.stdout}\n${assurance.stderr}`);
  const assuranceValue = evidence(path.join(root, "execution-assurance-reports/001-service-time.md"));
  assert.equal(assuranceValue.runtime_trust_binding.run_id, manifest.run_id);
  const assuranceCheck = runInstalled(root, "scripts/check-execution-assurance.mjs", [
    root,
    "--report", "execution-assurance-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-runtime-trust",
  ]);
  assert.equal(assuranceCheck.status, 0, `${assuranceCheck.stdout}\n${assuranceCheck.stderr}`);

  const completion = runInstalled(root, "scripts/resolve-completion-evidence.mjs", [
    root,
    "--intent", intent,
    "--task", taskRef,
    "--business-rule-ref", "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref", "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref", "artifact:execution-assurance-reports/001-service-time.md",
    "--runtime-manifest-ref", ref,
    "--out", "completion-evidence-reports/001-service-time.md",
  ]);
  assert.equal(completion.status, 0, `${completion.stdout}\n${completion.stderr}`);
  const completionValue = evidence(path.join(root, "completion-evidence-reports/001-service-time.md"));
  assert.equal(completionValue.runtime_trust_binding.run_id, manifest.run_id);
  assert.equal(completionValue.completion_state, "BLOCKED_BY_EXECUTION_ASSURANCE");
  const completionCheck = runInstalled(root, "scripts/check-completion-evidence.mjs", [
    root,
    "--report", "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-runtime-trust",
  ]);
  assert.equal(completionCheck.status, 0, `${completionCheck.stdout}\n${completionCheck.stderr}`);

  const finish = runInstalled(root, "scripts/resolve-closure-decision.mjs", [
    root,
    "--intent", intent,
    "--intent-digest", manifest.intent_digest,
    "--task", taskRef,
    "--verification", "targeted verification passed",
    "--runtime-manifest", ref,
    "--json",
  ]);
  assert.equal(finish.status, 0, `${finish.stdout}\n${finish.stderr}`);
  const finishValue = JSON.parse(finish.stdout);
  assert.equal(finishValue.decisionInputs.find((item) => item.input === "Runtime Trust").status, "PASS");
  assert.notEqual(finishValue.closureDecision.decision, "DONE", "Runtime Trust must not override missing closure evidence");
});

test("1.104 rejects wrong-task, copied-project, and stale-source runtime evidence", () => {
  const root = project();
  const { manifest, ref } = completeRuntime(root, "vrun-consumer-002");
  const wrongTask = resolveRuntimeTrustBinding(root, { manifestRef: ref, taskRef: "tasks/other.md", intentDigest: manifest.intent_digest });
  assert.equal(wrongTask.ok, false);
  assert.match(wrongTask.binding.reason, /different task/i);

  const copied = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-consumer-copy-"));
  fs.cpSync(root, copied, { recursive: true });
  const copiedResult = resolveRuntimeTrustBinding(copied, { manifestRef: ref, taskRef, intentDigest: manifest.intent_digest });
  assert.equal(copiedResult.ok, false);
  assert.match(copiedResult.binding.reason, /checker|project identity|current project/i);

  fs.appendFileSync(path.join(root, "package.json"), "\n");
  const stale = resolveRuntimeTrustBinding(root, { manifestRef: ref, taskRef, intentDigest: manifest.intent_digest });
  assert.equal(stale.ok, false);
  assert.match(stale.binding.reason, /checker|project identity|revision/i);
});

test("1.104 strict Runtime Trust cannot be bypassed with allow-empty or historical evidence", () => {
  for (const [script, target] of [
    ["scripts/check-test-evidence.mjs", fs.mkdtempSync(path.join(os.tmpdir(), "intentos-empty-test-evidence-"))],
    ["scripts/check-execution-assurance.mjs", fs.mkdtempSync(path.join(os.tmpdir(), "intentos-empty-assurance-"))],
    ["scripts/check-completion-evidence.mjs", fs.mkdtempSync(path.join(os.tmpdir(), "intentos-empty-completion-"))],
  ]) {
    const result = run(script, [target, "--allow-empty", "--require-runtime-trust"]);
    assert.notEqual(result.status, 0, `${script} must fail closed`);
  }
  const historical = run("scripts/check-test-evidence.mjs", [
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--report", "test-evidence-reports/001-service-time.md",
    "--require-runtime-trust",
  ]);
  assert.notEqual(historical.status, 0);
  assert.match(`${historical.stdout}\n${historical.stderr}`, /schema 1\.104\.0|Runtime Trust Binding/);
});

test("1.108 records an exact NOT_REQUIRED binding when no scenario needs runtime proof", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-not-required-"));
  const resolved = resolveRuntimeTrustBinding(root, {
    required: false,
    notRequiredReason: "Only structural and project-native verification obligations apply.",
  });
  assert.equal(resolved.ok, true);
  assert.equal(resolved.manifest, null);
  assert.equal(resolved.binding.requirement, "NOT_REQUIRED");
  assert.equal(resolved.binding.status, "NOT_REQUIRED");
  assert.equal(resolved.binding.run_manifest_ref, "N/A");
  assert.equal(resolved.binding.checker, "N/A");

  const checked = validateRuntimeTrustBinding(root, resolved.binding, { required: false });
  assert.equal(checked.ok, true, checked.errors.join("; "));
  const agreement = runtimeTrustBindingsAgree([resolved.binding, { ...resolved.binding }]);
  assert.equal(agreement.ok, true, agreement.errors.join("; "));
});

test("1.108 rejects NOT_REQUIRED when a consumer requires runtime-trusted proof", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-required-"));
  const optional = resolveRuntimeTrustBinding(root, { required: false }).binding;
  const checked = validateRuntimeTrustBinding(root, optional, { required: true });
  assert.equal(checked.ok, false);
  assert.match(checked.errors.join("\n"), /cannot be NOT_REQUIRED|is required/i);

  const required = resolveRuntimeTrustBinding(root, { required: true });
  assert.equal(required.ok, false);
  assert.equal(required.binding.requirement, "REQUIRED");
  assert.equal(required.binding.status, "BLOCKED");

  const agreement = runtimeTrustBindingsAgree([optional, required.binding]);
  assert.equal(agreement.ok, false);
  assert.match(agreement.errors.join("\n"), /requirement/i);
});

function evidence(file) {
  const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  assert.equal(parsed?.ok, true, file);
  return parsed.value;
}
