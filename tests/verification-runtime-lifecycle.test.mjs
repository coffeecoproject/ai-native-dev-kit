import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import { executeLifecyclePlan, lifecycleDeclarationErrors, preflightExecutableErrors, safeLifecycleCommandErrors } from "../scripts/lib/verification-runtime-lifecycle.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: options.timeout || 60_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-lifecycle-"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "lifecycle-fixture", private: true }, null, 2));
  fs.writeFileSync(path.join(root, "verify.mjs"), `
import fs from "node:fs";
if (!process.env.INTENTOS_RUN_ID || !process.env.INTENTOS_OWNER_TOKEN) process.exit(2);
if (process.env.INTENTOS_OWNER_TOKEN.length < 32) process.exit(3);
console.log("verified", process.env.INTENTOS_RUN_ID, fs.existsSync("package.json"));
`);
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), JSON.stringify({
    version: "1.103.0",
    adapter_kind: "COMMAND_ONLY",
    actions: [{
      id: "verify-local",
      phase: "VERIFY",
      kind: "COMMAND",
      argv: ["node", "verify.mjs"],
      cwd: ".",
      timeout_ms: 10_000,
      environment: [],
      obligation_ids: ["verify:local-command"],
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

test("1.103 executes a bounded command and emits current cleanup-bound evidence", () => {
  const root = project();
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-local-001", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const lifecycleCheck = run("scripts/check-verification-runtime-lifecycle.mjs", [root, "--report", "verification-runtime-lifecycle-plans/local.md", "--require-ready"]);
  assert.equal(lifecycleCheck.status, 0, `${lifecycleCheck.stdout}\n${lifecycleCheck.stderr}`);
  const executed = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/local.md", "--out", "verification-run-manifests/local.md"]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/local.md", "--require-complete"]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);

  const manifest = evidence(path.join(root, "verification-run-manifests/local.md"));
  assert.equal(manifest.schema_version, "1.103.0");
  assert.equal(manifest.outcome, "RUNTIME_TRUST_COMPLETE");
  assert.equal(manifest.cleanup_summary.owned_resources_remaining, 0);
  assert.equal(manifest.cleanup_summary.unrelated_resources_touched, "No");
  assert.equal(manifest.verification_executions[0].result, "PASSED");
  const output = fs.readFileSync(path.join(root, ".intentos/runtime-runs/vrun-local-001/outputs/verify-local.log"), "utf8");
  assert.doesNotMatch(output, /[a-f0-9]{64}/, "raw owner token must not be persisted");
});

test("1.103 runs a local service with positive and negative probes, then cleans owned resources", async () => {
  const root = project();
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "lifecycle-service-fixture", private: true, scripts: { dev: "node service.mjs" } }, null, 2));
  fs.writeFileSync(path.join(root, "service.mjs"), `
import fs from "node:fs";
import path from "node:path";
fs.writeFileSync(path.join(process.env.TEST_SESSION_PATH, "ready"), "ready");
setInterval(() => {}, 1000);
`);
  fs.writeFileSync(path.join(root, "probe.mjs"), `
import fs from "node:fs";
import path from "node:path";
const ready = fs.existsSync(path.join(process.env.TEST_SESSION_PATH, "ready"));
if (process.argv[2] === "positive" ? !ready : fs.existsSync(path.join(process.env.TEST_SESSION_PATH, "forbidden"))) process.exit(2);
console.log(process.argv[2], "passed");
`);
  fs.writeFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), JSON.stringify({
    version: "1.103.0",
    adapter_kind: "LOCAL_PROCESS",
    actions: [
      { id: "service", phase: "START_SERVICE", kind: "SERVICE", argv: ["node", "service.mjs"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: [], positive_path: "No", negative_path: "No", resource_ids: ["session"], external_effect: "No", depends_on: [] },
      { id: "positive", phase: "VERIFY", kind: "PROBE", argv: ["node", "probe.mjs", "positive"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: ["verify:positive"], positive_path: "Yes", negative_path: "No", resource_ids: ["session"], external_effect: "No", depends_on: ["service"] },
      { id: "negative", phase: "VERIFY", kind: "PROBE", argv: ["node", "probe.mjs", "negative"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: ["verify:negative"], positive_path: "No", negative_path: "Yes", resource_ids: ["session"], external_effect: "No", depends_on: ["service"] },
    ],
    resources: [{ resource_id: "session", resource_type: "SESSION_NAMESPACE", relative_path: "resources/session", environment_name: "TEST_SESSION_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "No", shared_resource: "No", role: "test-user", migration_revision: "not-recorded" }],
  }, null, 2));

  const declaration = JSON.parse(fs.readFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), "utf8"));
  const runId = "vrun-service-001";
  const plan = {
    run_id: runId,
    run_workspace: `.intentos/runtime-runs/${runId}`,
    adapter_kind: "LOCAL_PROCESS",
    adapter_contract_digest: `sha256:${"c".repeat(64)}`,
    runtime_plan_digest: `sha256:${"d".repeat(64)}`,
    execution_mode: "LOCAL_CONTROLLED",
    actions: declaration.actions.map((item) => ({ ...item, output_ref: `file:.intentos/runtime-runs/${runId}/outputs/${item.id}.log` })),
    resources: declaration.resources.map((item) => ({ ...item, owner_marker_required: "Yes" })),
  };
  const result = await executeLifecyclePlan(root, plan);
  assert.equal(result.ok, true, result.failure);
  assert.deepEqual(result.executions.map((item) => item.result), ["PASSED", "PASSED"]);
  assert.equal(result.serviceInstances.length, 1);
  assert.equal(result.ownedResourcesRemaining, 0);
  assert.equal(result.cleanupBlocked, false);
  assert.equal(fs.existsSync(path.join(root, ".intentos/runtime-runs/vrun-service-001/resources/session")), false);
});

test("1.103 blocks execution when the technical declaration is missing", () => {
  const root = project();
  fs.rmSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"));
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-local-002", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const value = evidence(path.join(root, "verification-runtime-lifecycle-plans/local.md"));
  assert.equal(value.outcome, "LIFECYCLE_PLAN_BLOCKED");
  const executed = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/local.md"]);
  assert.notEqual(executed.status, 0);
  assert.match(executed.stderr, /not ready|requires a valid lifecycle declaration/i);
});

test("1.103 JSON output preserves the Markdown evidence artifact", () => {
  const root = project();
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-local-json", "--out", "verification-runtime-lifecycle-plans/local.md", "--json"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  assert.equal(JSON.parse(lifecycle.stdout).run_id, "vrun-local-json");
  const artifact = fs.readFileSync(path.join(root, "verification-runtime-lifecycle-plans/local.md"), "utf8");
  assert.match(artifact, /^# Verification Runtime Lifecycle Plan/);
  assert.equal(evidence(path.join(root, "verification-runtime-lifecycle-plans/local.md")).run_id, "vrun-local-json");
});

test("1.103 rejects shell, provider, broad cleanup, and production-shaped commands", () => {
  for (const argv of [
    ["bash", "-lc", "node verify.mjs"],
    ["node", "verify.mjs", "&&", "node", "other.mjs"],
    ["docker", "compose", "up"],
    ["npm", "run", "deploy-production"],
    ["rm", "-rf", "tmp"],
  ]) {
    const errors = safeLifecycleCommandErrors({ argv, cwd: ".", timeout_ms: 1000, environment: [], obligation_ids: [], resource_ids: [], depends_on: [], positive_path: "No", negative_path: "No", external_effect: "No" });
    assert.ok(errors.length > 0, `${argv.join(" ")} must fail closed`);
  }
  const root = project();
  const declaration = JSON.parse(fs.readFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), "utf8"));
  declaration.actions = [{ ...declaration.actions[0], id: "wrapped-service", phase: "START_SERVICE", kind: "SERVICE", argv: ["npm", "run", "dev"] }];
  assert.ok(lifecycleDeclarationErrors(declaration, root).some((item) => /direct long-lived runtime executable/.test(item)));
  assert.ok(safeLifecycleCommandErrors({ ...declaration.actions[0], kind: "COMMAND", phase: "VERIFY", argv: ["./node", "verify.mjs"] }).some((item) => /bare allowlisted name/.test(item)));
  assert.ok(safeLifecycleCommandErrors({ ...declaration.actions[0], kind: "COMMAND", phase: "VERIFY", argv: ["node", "verify.mjs"], environment: [{ name: "PATH", value: "/tmp" }] }).some((item) => /PATH cannot be overridden/.test(item)));
  assert.ok(preflightExecutableErrors({ actions: [{ id: "missing", argv: ["node"] }] }, "").some((item) => /unavailable/.test(item)));
});

test("1.103 preserves dependency order within the same lifecycle phase", () => {
  const root = project();
  const declarationFile = path.join(root, ".intentos/verification-runtime-lifecycle.json");
  const declaration = JSON.parse(fs.readFileSync(declarationFile, "utf8"));
  declaration.actions = [
    { ...declaration.actions[0], id: "z-dependency", depends_on: [] },
    { ...declaration.actions[0], id: "a-dependent", depends_on: ["z-dependency"] },
  ];
  fs.writeFileSync(declarationFile, JSON.stringify(declaration, null, 2));
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-dependency-001", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  assert.deepEqual(evidence(path.join(root, "verification-runtime-lifecycle-plans/local.md")).actions.map((item) => item.id), ["z-dependency", "a-dependent"]);
});

test("1.103 rejects project-external paths and shared or production resources", () => {
  const root = project();
  const declaration = JSON.parse(fs.readFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), "utf8"));
  declaration.resources.push({ resource_id: "bad-db", resource_type: "DATABASE_FILE", relative_path: "../shared", environment_name: "TEST_DB_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "Yes", shared_resource: "Yes", role: "", migration_revision: "none" });
  const errors = lifecycleDeclarationErrors(declaration, root);
  assert.ok(errors.some((item) => /relative_path/.test(item)));
  assert.ok(errors.some((item) => /non-production and non-shared/.test(item)));
});

test("1.103 interruption stops exact child processes and cleans only run-owned resources", async () => {
  const root = project();
  fs.writeFileSync(path.join(root, "service.mjs"), "console.log(process.env.INTENTOS_OWNER_TOKEN); setInterval(() => {}, 1000);\n");
  fs.writeFileSync(path.join(root, "slow.mjs"), "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);\n");
  const runId = "vrun-interrupt-001";
  const plan = {
    run_id: runId,
    run_workspace: `.intentos/runtime-runs/${runId}`,
    adapter_kind: "LOCAL_PROCESS",
    adapter_contract_digest: `sha256:${"a".repeat(64)}`,
    runtime_plan_digest: `sha256:${"b".repeat(64)}`,
    execution_mode: "LOCAL_CONTROLLED",
    actions: [
      { id: "service", phase: "START_SERVICE", kind: "SERVICE", argv: ["node", "service.mjs"], cwd: ".", timeout_ms: 5000, environment: [], output_ref: `file:.intentos/runtime-runs/${runId}/outputs/service.log`, obligation_ids: [], positive_path: "No", negative_path: "No", resource_ids: ["session"], external_effect: "No", depends_on: [] },
      { id: "verify", phase: "VERIFY", kind: "COMMAND", argv: ["node", "slow.mjs"], cwd: ".", timeout_ms: 15000, environment: [], output_ref: `file:.intentos/runtime-runs/${runId}/outputs/verify.log`, obligation_ids: ["verify:interrupt"], positive_path: "Yes", negative_path: "No", resource_ids: ["session"], external_effect: "No", depends_on: ["service"] },
    ],
    resources: [{ resource_id: "session", resource_type: "SESSION_NAMESPACE", relative_path: "resources/session", environment_name: "TEST_SESSION_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "No", shared_resource: "No", owner_marker_required: "Yes", role: "user", migration_revision: "not-recorded" }],
  };
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 700);
  const started = Date.now();
  const result = await executeLifecyclePlan(root, plan, { signal: controller.signal });
  assert.ok(Date.now() - started < 5000, "an interrupted command that ignores SIGTERM must be killed promptly");
  assert.equal(result.ok, false);
  assert.equal(result.interrupted, true);
  assert.equal(result.ownedResourcesRemaining, 0);
  assert.equal(result.cleanupBlocked, false);
  assert.equal(fs.existsSync(path.join(root, `.intentos/runtime-runs/${runId}/resources/session`)), false);
  const journal = fs.readFileSync(result.journalFile, "utf8");
  assert.match(journal, /INTERRUPTED/);
  assert.match(journal, /PROCESS_CLEANED/);
  assert.match(journal, /RESOURCE_CLEANED/);
  const serviceOutput = fs.readFileSync(path.join(root, `.intentos/runtime-runs/${runId}/outputs/service.log`), "utf8");
  assert.doesNotMatch(serviceOutput, /[a-f0-9]{64}/, "interrupted service output must redact the owner token");
  assert.match(serviceOutput, /process_state=exited/);
  assert.match(serviceOutput, /process_signal=SIGTERM|process_exit_code=\d+/);
});

function evidence(file) {
  const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  assert.equal(parsed?.ok, true);
  return parsed.value;
}
