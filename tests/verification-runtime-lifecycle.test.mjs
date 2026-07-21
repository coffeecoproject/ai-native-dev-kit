import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest } from "../scripts/lib/evidence-authority.mjs";
import {
  executeLifecyclePlan,
  lifecycleDeclarationErrors,
  preflightExecutableErrors,
  requiredVerificationObligationIds,
  safeLifecycleCommandErrors,
} from "../scripts/lib/verification-runtime-lifecycle.mjs";

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
import path from "node:path";
if (!process.env.INTENTOS_RUN_ID || !process.env.INTENTOS_OWNER_TOKEN) process.exit(2);
if (process.env.INTENTOS_OWNER_TOKEN.length < 32) process.exit(3);
const projectRoot = fs.realpathSync(process.cwd());
const isolatedTemp = fs.realpathSync(process.env.TMPDIR);
if (isolatedTemp === projectRoot || isolatedTemp.startsWith(projectRoot + path.sep)) process.exit(4);
console.log("verified", process.env.INTENTOS_RUN_ID, fs.existsSync("package.json"), "external-temp", isolatedTemp);
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
  assert.match(output, /external-temp/, "runtime temp isolation must stay outside the project source tree");
});

test("1.113 archives exact run evidence for clean-checkout consumers without reusing an archive", () => {
  const root = project();
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-durable-001", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);

  const executed = run("scripts/run-verification-runtime.mjs", [
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/local.md",
    "--out", "verification-run-manifests/local.md",
    "--durable-evidence-out", "evidence/runtime-runs/vrun-durable-001",
  ]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  const manifest = evidence(path.join(root, "verification-run-manifests/local.md"));
  assert.equal(manifest.lifecycle_journal_ref, "file:evidence/runtime-runs/vrun-durable-001/lifecycle-journal.jsonl");
  assert.equal(manifest.verification_executions[0].output_ref, "file:evidence/runtime-runs/vrun-durable-001/outputs/verify-local.log");
  assert.equal(fs.existsSync(path.join(root, "evidence/runtime-runs/vrun-durable-001/evidence/cleanup-after.txt")), true);
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/local.md", "--require-complete"]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);

  const reused = run("scripts/run-verification-runtime.mjs", [
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/local.md",
    "--out", "verification-run-manifests/local.md",
    "--durable-evidence-out", "evidence/runtime-runs/vrun-durable-001",
  ]);
  assert.notEqual(reused.status, 0);
  assert.match(`${reused.stdout}\n${reused.stderr}`, /run workspace already exists|archive already exists/i);

  const escaped = run("scripts/run-verification-runtime.mjs", [
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/local.md",
    "--durable-evidence-out", "evidence/runtime-runs/other-run",
  ]);
  assert.notEqual(escaped.status, 0);
  assert.match(`${escaped.stdout}\n${escaped.stderr}`, /must be evidence\/runtime-runs\/vrun-durable-001/);
});

test("1.113 rejects lifecycle manifest field tampering and offline journal synthesis", async (t) => {
  await t.test("execution argv digest tampering", () => {
    const fixture = completedCommandRun("vrun-replay-digest");
    rewriteManifest(fixture.manifestFile, (manifest) => {
      manifest.verification_executions[0].command_digest = `sha256:${"0".repeat(64)}`;
    });
    const checked = checkManifest(fixture);
    assert.notEqual(checked.status, 0);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /Lifecycle Replay execution verify-local command_digest/);
  });

  await t.test("execution obligation tampering", () => {
    const fixture = completedCommandRun("vrun-replay-obligation");
    rewriteManifest(fixture.manifestFile, (manifest) => {
      manifest.verification_executions[0].covers_obligations.push("verify:offline-claim");
    });
    const checked = checkManifest(fixture);
    assert.notEqual(checked.status, 0);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /Lifecycle Replay execution verify-local obligation ids/);
  });

  await t.test("journal action order tampering", () => {
    const fixture = completedCommandRun("vrun-replay-order");
    rewriteJournal(fixture, (rows) => {
      const starting = rows.find((row) => row.event === "ACTION_STARTING");
      const finished = rows.find((row) => row.event === "ACTION_FINISHED");
      starting.event = "ACTION_FINISHED";
      starting.exit_code = 0;
      starting.timed_out = false;
      finished.event = "ACTION_STARTING";
      delete finished.exit_code;
      delete finished.timed_out;
    });
    const checked = checkManifest(fixture);
    assert.notEqual(checked.status, 0);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /Lifecycle Replay lifecycle action event sequence/);
  });

  await t.test("offline journal missing observed action events", () => {
    const fixture = completedCommandRun("vrun-replay-missing");
    rewriteJournal(fixture, (rows) => {
      const retained = rows.filter((row) => !["ACTION_STARTING", "ACTION_FINISHED"].includes(row.event));
      rows.splice(0, rows.length, ...retained);
    });
    const checked = checkManifest(fixture);
    assert.notEqual(checked.status, 0);
    assert.match(`${checked.stdout}\n${checked.stderr}`, /Lifecycle Replay (lifecycle action event sequence|manifest verification execution ids)/);
  });
});

test("1.103 runs a local service with positive and negative probes, then cleans owned resources", async () => {
  const root = project();
  configureServiceProject(root);

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

test("1.113 checker replays exact service, probe, resource, and cleanup sets", () => {
  const root = project();
  configureServiceProject(root);
  const sourcePlan = path.join(kitRoot, "examples/1.77-test-evidence-binding/appointment-service-time/verification-plans/001-service-time.md");
  const targetPlan = path.join(root, "verification-plans/001-service-time.md");
  fs.mkdirSync(path.dirname(targetPlan), { recursive: true });
  fs.copyFileSync(sourcePlan, targetPlan);
  const verificationPlan = evidence(targetPlan);
  const declarationFile = path.join(root, ".intentos/verification-runtime-lifecycle.json");
  const declaration = JSON.parse(fs.readFileSync(declarationFile, "utf8"));
  declaration.actions.find((item) => item.id === "positive").obligation_ids = ["$CURRENT_REQUIRED_OBLIGATIONS"];
  declaration.actions.find((item) => item.id === "negative").obligation_ids = [];
  fs.writeFileSync(declarationFile, JSON.stringify(declaration, null, 2));
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [
    root,
    "--intent", verificationPlan.intent,
    "--task-ref", verificationPlan.task_ref,
    "--task-tier", "HIGH",
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--out", "verification-runtime-plans/service.md",
  ]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/service.md", "--run-id", "vrun-service-replay", "--out", "verification-runtime-lifecycle-plans/service.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const executed = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/service.md", "--out", "verification-run-manifests/service.md"]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  const checked = run("scripts/check-verification-run-manifest.mjs", [root, "--report", "verification-run-manifests/service.md", "--require-complete"]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  assert.match(checked.stdout, /Lifecycle Plan, journal, executions, services, resources, and cleanup replay exactly/);
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

test("1.113 expands the current required Verification Plan obligations and rejects stale sources", () => {
  const root = project();
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: "lifecycle-obligation-fixture",
    private: true,
    intentos: { verificationRuntime: { adapter: "LOCAL_PROCESS" } },
  }, null, 2));
  const sourcePlan = path.join(kitRoot, "examples/1.77-test-evidence-binding/appointment-service-time/verification-plans/001-service-time.md");
  const targetPlan = path.join(root, "verification-plans/001-service-time.md");
  fs.mkdirSync(path.dirname(targetPlan), { recursive: true });
  fs.copyFileSync(sourcePlan, targetPlan);
  const verificationPlan = evidence(targetPlan);
  const required = verificationPlan.verification_obligations
    .filter((item) => item.required === "Yes")
    .map((item) => item.id)
    .sort();

  const declarationFile = path.join(root, ".intentos/verification-runtime-lifecycle.json");
  const declaration = JSON.parse(fs.readFileSync(declarationFile, "utf8"));
  declaration.adapter_kind = "LOCAL_PROCESS";
  declaration.actions[0].obligation_ids = ["$CURRENT_REQUIRED_OBLIGATIONS"];
  fs.writeFileSync(declarationFile, JSON.stringify(declaration, null, 2));

  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [
    root,
    "--intent", verificationPlan.intent,
    "--task-ref", verificationPlan.task_ref,
    "--task-tier", "HIGH",
    "--verification-plan-ref", "artifact:verification-plans/001-service-time.md",
    "--out", "verification-runtime-plans/current.md",
  ]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [
    root,
    "--runtime-plan-ref", "artifact:verification-runtime-plans/current.md",
    "--run-id", "vrun-obligations-001",
    "--out", "verification-runtime-lifecycle-plans/current.md",
  ]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const lifecyclePlan = evidence(path.join(root, "verification-runtime-lifecycle-plans/current.md"));
  assert.deepEqual(lifecyclePlan.actions[0].obligation_ids, required);

  const tamperedPlan = fs.readFileSync(targetPlan, "utf8").replace('"required": "Yes"', '"required": "No"');
  fs.writeFileSync(targetPlan, tamperedPlan);
  const stale = run("scripts/resolve-verification-runtime-lifecycle.mjs", [
    root,
    "--runtime-plan-ref", "artifact:verification-runtime-plans/current.md",
    "--run-id", "vrun-obligations-stale",
    "--out", "verification-runtime-lifecycle-plans/stale.md",
  ]);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /valid verification_plan evidence|source digest is stale/i);
});

test("1.113 rejects a copied current Verification Plan authority before lifecycle execution", () => {
  const root = project();
  const sourcePlan = path.join(kitRoot, "verification-plans/113-cross-domain-trust-closure.md");
  const targetPlan = path.join(root, "verification-plans/113-cross-domain-trust-closure.md");
  fs.mkdirSync(path.dirname(targetPlan), { recursive: true });
  fs.copyFileSync(sourcePlan, targetPlan);
  const verificationPlan = evidence(targetPlan);
  const resolved = requiredVerificationObligationIds(root, {
    task_ref: verificationPlan.task_ref,
    intent_digest: verificationPlan.intent_digest,
    verification_plan_source: {
      status: "RECORDED",
      ref: "artifact:verification-plans/113-cross-domain-trust-closure.md",
      digest: verificationPlan.verification_plan_digest,
    },
  });
  assert.equal(resolved.ok, false);
  assert.ok(resolved.errors.some((item) => /authority is stale/i.test(item)));
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

test("1.113 permits bounded 30-minute verification actions but rejects longer execution", () => {
  const action = {
    argv: ["node", "verify.mjs"],
    cwd: ".",
    timeout_ms: 1_800_000,
    environment: [],
    obligation_ids: [],
    resource_ids: [],
    depends_on: [],
    positive_path: "Yes",
    negative_path: "No",
    external_effect: "No",
  };
  assert.deepEqual(safeLifecycleCommandErrors(action), []);
  assert.ok(safeLifecycleCommandErrors({ ...action, timeout_ms: 1_800_001 }).some((item) => /between 100 and 1800000/.test(item)));
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

test("1.113 runtime execution binds exact staged bytes and rejects a split index/worktree candidate", () => {
  const root = project();
  fs.writeFileSync(path.join(root, ".gitignore"), ".intentos/runtime-runs/\n");
  assert.equal(spawnSync("git", ["init"], { cwd: root, encoding: "utf8" }).status, 0);
  assert.equal(spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" }).status, 0);
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-source-freeze", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  assert.equal(spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" }).status, 0);
  fs.appendFileSync(path.join(root, "verify.mjs"), "\n// unstaged mutation\n");

  const split = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/local.md", "--out", "verification-run-manifests/local.md"]);
  assert.notEqual(split.status, 0);
  assert.match(`${split.stdout}\n${split.stderr}`, /staged runtime candidate differs from tracked worktree bytes/);
  assert.equal(fs.existsSync(path.join(root, ".intentos/runtime-runs/vrun-source-freeze")), false);

  assert.equal(spawnSync("git", ["add", "verify.mjs"], { cwd: root, encoding: "utf8" }).status, 0);
  const reboundRuntime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(reboundRuntime.status, 0, `${reboundRuntime.stdout}\n${reboundRuntime.stderr}`);
  const reboundLifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-source-freeze", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(reboundLifecycle.status, 0, `${reboundLifecycle.stdout}\n${reboundLifecycle.stderr}`);
  assert.equal(spawnSync("git", ["add", "verification-runtime-plans/local.md", "verification-runtime-lifecycle-plans/local.md"], { cwd: root, encoding: "utf8" }).status, 0);
  const exact = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/local.md", "--out", "verification-run-manifests/local.md"]);
  assert.equal(exact.status, 0, `${exact.stdout}\n${exact.stderr}`);
});

test("1.103 rejects project-external paths and shared or production resources", () => {
  const root = project();
  const declaration = JSON.parse(fs.readFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), "utf8"));
  declaration.resources.push({ resource_id: "bad-db", resource_type: "DATABASE_FILE", relative_path: "../shared", environment_name: "TEST_DB_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "Yes", shared_resource: "Yes", role: "", migration_revision: "none" });
  const errors = lifecycleDeclarationErrors(declaration, root);
  assert.ok(errors.some((item) => /relative_path/.test(item)));
  assert.ok(errors.some((item) => /non-production and non-shared/.test(item)));
});

test("1.113 records a failed executable preflight instead of projecting later cleanup as PASS", async () => {
  const root = project();
  const runId = "vrun-preflight-failed";
  const plan = {
    run_id: runId,
    run_workspace: `.intentos/runtime-runs/${runId}`,
    adapter_kind: "COMMAND_ONLY",
    adapter_contract_digest: `sha256:${"a".repeat(64)}`,
    runtime_plan_digest: `sha256:${"b".repeat(64)}`,
    execution_mode: "LOCAL_CONTROLLED",
    actions: [{ id: "verify", phase: "VERIFY", kind: "COMMAND", argv: ["node", "verify.mjs"], cwd: ".", timeout_ms: 5000, environment: [], output_ref: `file:.intentos/runtime-runs/${runId}/outputs/verify.log`, obligation_ids: [], positive_path: "Yes", negative_path: "No", resource_ids: [], external_effect: "No", depends_on: [] }],
    resources: [],
  };
  const originalPath = process.env.PATH;
  process.env.PATH = "";
  try {
    const result = await executeLifecyclePlan(root, plan);
    assert.equal(result.ok, false);
    assert.equal(result.preflightPassed, false);
    assert.match(result.failure, /unavailable in the executor PATH/);
    assert.equal(result.ownedResourcesRemaining, 0);
  } finally {
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
  }
});

test("1.113 failed runtime preflight is projected as BLOCKED in the emitted manifest", () => {
  const root = project();
  const gitName = process.platform === "win32" ? "git.exe" : "git";
  const gitExecutable = String(process.env.PATH || "")
    .split(path.delimiter)
    .map((directory) => path.join(directory, gitName))
    .find((candidate) => fs.existsSync(candidate));
  assert.ok(gitExecutable, "git must be available for the runtime identity fixture");
  const preflightPath = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-runtime-preflight-path-"));
  fs.symlinkSync(gitExecutable, path.join(preflightPath, gitName));
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", "vrun-preflight-manifest", "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const executed = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/run-verification-runtime.mjs"),
    root,
    "--plan", "artifact:verification-runtime-lifecycle-plans/local.md",
    "--out", "verification-run-manifests/local.md",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, PATH: preflightPath },
  });
  assert.equal(executed.status, 2, `${executed.stdout}\n${executed.stderr}`);
  const manifest = evidence(path.join(root, "verification-run-manifests/local.md"));
  assert.equal(manifest.outcome, "RUNTIME_TRUST_PARTIAL");
  const executable = manifest.preflight_results.find((item) => item.probe === "EXECUTABLE_AVAILABILITY");
  assert.equal(executable.result, "BLOCKED");
  assert.match(executable.reason, /unavailable in the executor PATH/);
  assert.equal(manifest.preflight_results.some((item) => item.probe === "SOURCE_IDENTITY" && item.result === "PASS"), true);
  assert.equal(manifest.preflight_results.some((item) => item.probe === "WORKTREE_STATE" && item.result === "PASS"), true);
  assert.equal(new Set(manifest.preflight_results.map((item) => `${item.probe}:${item.reason}`)).size, manifest.preflight_results.length);
});

test("1.103 interruption stops exact child processes and cleans only run-owned resources", async () => {
  const root = project();
  fs.writeFileSync(path.join(root, "service.mjs"), "console.log(process.env.INTENTOS_OWNER_TOKEN); setInterval(() => {}, 1000);\n");
  fs.writeFileSync(path.join(root, "slow.mjs"), `
import fs from "node:fs";
import { spawn } from "node:child_process";
const descendant = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });
fs.writeFileSync("descendant.pid", String(descendant.pid));
process.on("SIGTERM", () => {});
setInterval(() => {}, 1000);
`);
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
  if (process.platform !== "win32") {
    const descendantPid = Number(fs.readFileSync(path.join(root, "descendant.pid"), "utf8"));
    assert.throws(() => process.kill(descendantPid, 0), /ESRCH/, "interrupt cleanup must stop command descendants in the owned process group");
  }
});

function evidence(file) {
  const parsed = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  assert.equal(parsed?.ok, true);
  return parsed.value;
}

function completedCommandRun(runId) {
  const root = project();
  const runtime = run("scripts/resolve-verification-runtime-plan.mjs", [root, "--intent", "change home page copy wording", "--task-ref", "tasks/local.md", "--task-tier", "LOW", "--out", "verification-runtime-plans/local.md"]);
  assert.equal(runtime.status, 0, `${runtime.stdout}\n${runtime.stderr}`);
  const lifecycle = run("scripts/resolve-verification-runtime-lifecycle.mjs", [root, "--runtime-plan-ref", "artifact:verification-runtime-plans/local.md", "--run-id", runId, "--out", "verification-runtime-lifecycle-plans/local.md"]);
  assert.equal(lifecycle.status, 0, `${lifecycle.stdout}\n${lifecycle.stderr}`);
  const executed = run("scripts/run-verification-runtime.mjs", [root, "--plan", "artifact:verification-runtime-lifecycle-plans/local.md", "--out", "verification-run-manifests/local.md"]);
  assert.equal(executed.status, 0, `${executed.stdout}\n${executed.stderr}`);
  return {
    root,
    manifestFile: path.join(root, "verification-run-manifests/local.md"),
  };
}

function configureServiceProject(root) {
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: "lifecycle-service-fixture",
    private: true,
    scripts: { dev: "node service.mjs" },
    intentos: { verificationRuntime: { adapter: "LOCAL_PROCESS" } },
  }, null, 2));
  fs.writeFileSync(path.join(root, "service.mjs"), `
import fs from "node:fs";
import path from "node:path";
fs.writeFileSync(path.join(process.env.INTENTOS_FIXTURE_PATH, "ready"), "ready");
setInterval(() => {}, 1000);
`);
  fs.writeFileSync(path.join(root, "probe.mjs"), `
import fs from "node:fs";
import path from "node:path";
const ready = fs.existsSync(path.join(process.env.INTENTOS_FIXTURE_PATH, "ready"));
if (process.argv[2] === "positive" ? !ready : fs.existsSync(path.join(process.env.INTENTOS_FIXTURE_PATH, "forbidden"))) process.exit(2);
console.log(process.argv[2], "passed");
`);
  fs.writeFileSync(path.join(root, ".intentos/verification-runtime-lifecycle.json"), JSON.stringify({
    version: "1.103.0",
    adapter_kind: "LOCAL_PROCESS",
    actions: [
      { id: "service", phase: "START_SERVICE", kind: "SERVICE", argv: ["node", "service.mjs"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: [], positive_path: "No", negative_path: "No", resource_ids: ["session", "cache"], external_effect: "No", depends_on: [] },
      { id: "positive", phase: "VERIFY", kind: "PROBE", argv: ["node", "probe.mjs", "positive"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: ["verify:positive"], positive_path: "Yes", negative_path: "No", resource_ids: ["session", "cache"], external_effect: "No", depends_on: ["service"] },
      { id: "negative", phase: "VERIFY", kind: "PROBE", argv: ["node", "probe.mjs", "negative"], cwd: ".", timeout_ms: 10_000, environment: [], obligation_ids: ["verify:negative"], positive_path: "No", negative_path: "Yes", resource_ids: ["session", "cache"], external_effect: "No", depends_on: ["service"] },
    ],
    resources: [
      { resource_id: "session", resource_type: "SESSION_NAMESPACE", relative_path: "resources/session", environment_name: "INTENTOS_FIXTURE_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "No", shared_resource: "No", role: "test-user", migration_revision: "not-recorded" },
      { resource_id: "cache", resource_type: "CACHE_NAMESPACE", relative_path: "resources/cache", environment_name: "INTENTOS_CACHE_FIXTURE_PATH", created_by_action: "executor:preflight", cleanup_strategy: "REMOVE_OWNED_PATH", production_instance: "No", shared_resource: "No", role: "", migration_revision: "not-recorded" },
    ],
  }, null, 2));
}

function checkManifest(fixture) {
  return run("scripts/check-verification-run-manifest.mjs", [fixture.root, "--report", "verification-run-manifests/local.md", "--require-complete"]);
}

function rewriteJournal(fixture, mutate) {
  const manifest = evidence(fixture.manifestFile);
  const journalFile = path.join(fixture.root, manifest.lifecycle_journal_ref.replace(/^file:/, ""));
  const rows = fs.readFileSync(journalFile, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  mutate(rows);
  fs.writeFileSync(journalFile, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
  const journalDigest = canonicalFileDigest(journalFile);
  rewriteManifest(fixture.manifestFile, (value) => {
    value.lifecycle_journal_digest = journalDigest;
    const source = value.authority_binding.sources.find((item) => item.ref === value.lifecycle_journal_ref);
    assert.ok(source, "journal must be present in Evidence Authority sources");
    source.raw_file_digest = journalDigest;
  });
}

function rewriteManifest(file, mutate) {
  const content = fs.readFileSync(file, "utf8");
  const value = evidence(file);
  mutate(value);
  value.run_manifest_digest = evidenceDigest(value, ["run_manifest_digest"]);
  const next = content.replace(
    /(## Machine-Readable Evidence\s*\n\s*```json\s*\n)[\s\S]*?(\n```)/,
    `$1${JSON.stringify(value, null, 2)}$2`,
  );
  assert.notEqual(next, content, "manifest evidence block must be replaced");
  fs.writeFileSync(file, next);
}
