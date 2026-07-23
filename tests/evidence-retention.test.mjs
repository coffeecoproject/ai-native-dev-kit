import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { inspectEvidenceRetention, loadEvidenceRetentionPolicy } from "../scripts/lib/evidence-retention.mjs";
import { boundBusinessUniverseDiscovery } from "../scripts/lib/business-universe.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePolicy = JSON.parse(fs.readFileSync(path.join(kitRoot, ".intentos/evidence-retention-policy.json"), "utf8"));

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-evidence-retention-"));
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/evidence-retention-policy.json"), `${JSON.stringify(sourcePolicy, null, 2)}\n`);
  fs.mkdirSync(path.join(root, "evidence/runtime-runs/vrun-118-policy-r3/outputs"), { recursive: true });
  fs.writeFileSync(path.join(root, "evidence/runtime-runs/vrun-118-policy-r3/outputs/verify.log"), "final observed verification output\n");
  fs.mkdirSync(path.join(root, "verification-run-manifests"), { recursive: true });
  fs.writeFileSync(path.join(root, "verification-run-manifests/118-policy.md"), `{"run_id":"vrun-118-policy-r3","outcome":"RUNTIME_TRUST_COMPLETE","output_ref":"file:evidence/runtime-runs/vrun-118-policy-r3/outputs/verify.log"}`);
  fs.writeFileSync(path.join(root, "evidence/118-focused.log"), "focused task proof with a distinct digest\n");
  fs.writeFileSync(path.join(root, "evidence/117-full-verification.log"), "x".repeat(sourcePolicy.budgets.standalone_raw_evidence_bytes + 1));
  return root;
}

function inspect(root) {
  const loaded = loadEvidenceRetentionPolicy(root);
  assert.equal(loaded.ok, true, loaded.errors?.join("; "));
  return inspectEvidenceRetention(root, loaded.policy);
}

test("1.118 keeps historical oversized evidence outside forward-only budgets", () => {
  const result = inspect(fixture());
  assert.equal(result.ok, true, JSON.stringify(result.violations));
});

test("1.118 bounds Business Universe retention to observed task sources", () => {
  const discovery = {
    projection: {
      inventory_digest: "sha256:inventory",
      next_file_index: 3,
      candidate_sources: ["file:a.mjs", "file:b.mjs", "file:c.mjs"],
      unsupported_constructs: [],
      resume_state_digest: "sha256:old",
      discovery_boundary_digest: "sha256:old",
    },
    candidate_sources: [
      { source_ref: "file:a.mjs", relative_path: "a.mjs" },
      { source_ref: "file:b.mjs", relative_path: "b.mjs" },
      { source_ref: "file:c.mjs", relative_path: "c.mjs" },
    ],
  };
  const bounded = boundBusinessUniverseDiscovery(discovery, ["c.mjs", "a.mjs"]);
  assert.equal(bounded.ok, true);
  assert.deepEqual(bounded.discovery.projection.candidate_sources, ["file:a.mjs", "file:c.mjs"]);
  assert.notEqual(bounded.discovery.projection.resume_state_digest, "sha256:old");
  assert.notEqual(bounded.discovery.projection.discovery_boundary_digest, "sha256:old");
  assert.equal(boundBusinessUniverseDiscovery(discovery, ["missing.mjs"]).ok, false);
});

test("1.118 rejects more than one durable runtime archive for a task", () => {
  const root = fixture();
  fs.mkdirSync(path.join(root, "evidence/runtime-runs/vrun-118-policy-r2/outputs"), { recursive: true });
  fs.writeFileSync(path.join(root, "evidence/runtime-runs/vrun-118-policy-r2/outputs/verify.log"), "superseded output\n");
  const result = inspect(root);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((item) => item.code === "MULTIPLE_DURABLE_RUNS"));
});

test("1.118 rejects standalone full verification logs", () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, "evidence/118-full-verification.log"), "duplicate aggregate output\n");
  assert.ok(inspect(root).violations.some((item) => item.code === "FULL_VERIFICATION_LOG"));
});

test("1.118 rejects duplicate raw content", () => {
  const root = fixture();
  const content = "same retained raw evidence content must be referenced instead of copied\n";
  fs.writeFileSync(path.join(root, "evidence/118-first.log"), content);
  fs.writeFileSync(path.join(root, "evidence/118-second.log"), content);
  assert.ok(inspect(root).violations.some((item) => item.code === "DUPLICATE_RAW_CONTENT"));
});

test("1.118 rejects raw evidence and report budget overflow without truncating", () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, "evidence/118-oversized.log"), "y".repeat(sourcePolicy.budgets.standalone_raw_evidence_bytes + 1));
  fs.mkdirSync(path.join(root, "task-governance-reports"), { recursive: true });
  fs.writeFileSync(path.join(root, "task-governance-reports/118-oversized.md"), "z".repeat(sourcePolicy.budgets.structured_report_bytes + 1));
  const result = inspect(root);
  assert.ok(result.violations.some((item) => item.code === "STANDALONE_RAW_FILE_BUDGET"));
  assert.ok(result.violations.some((item) => item.code === "STRUCTURED_REPORT_BUDGET"));
  assert.equal(fs.statSync(path.join(root, "evidence/118-oversized.log")).size, sourcePolicy.budgets.standalone_raw_evidence_bytes + 1);
});

test("1.118 rejects a durable runtime without complete manifest binding", () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, "verification-run-manifests/118-policy.md"), `{"run_id":"vrun-118-policy-r3","outcome":"RUNTIME_TRUST_PARTIAL"}`);
  assert.ok(inspect(root).violations.some((item) => item.code === "UNBOUND_DURABLE_RUN"));
});

test("1.118 installs and executes the same retention policy in a generated project", { timeout: 180_000 }, (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-evidence-retention-generated-"));
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  const initialized = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--starter", "generic-project",
    "--goal", "build a local evidence retention fixture",
  ], { cwd: kitRoot, encoding: "utf8", timeout: 150_000, maxBuffer: 64 * 1024 * 1024 });
  assert.equal(initialized.status, 0, `${initialized.stdout}\n${initialized.stderr}`);
  for (const file of [
    ".intentos/evidence-retention-policy.json",
    ".intentos/docs/evidence-retention.md",
    "scripts/check-evidence-retention.mjs",
    "scripts/lib/evidence-retention.mjs",
  ]) assert.equal(fs.existsSync(path.join(target, file)), true, file);
  const checked = spawnSync(process.execPath, [path.join(target, "scripts/check-evidence-retention.mjs"), target, "--strict"], {
    cwd: target,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  assert.match(checked.stdout, /evidence retention policy .* is satisfied/);
});
