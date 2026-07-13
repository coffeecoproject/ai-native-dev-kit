import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { migrationDigest } from "../scripts/lib/release-topology-migration.mjs";

const kitRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

test("plan-stage migration resolves and passes strict current-project checking", () => {
  const project = fixture();
  prepare(project);
  run("scripts/resolve-release-topology-migration.mjs", [project, "--topology-ref", "release-execution-topologies/001.md", "--out", "release-topology-migrations/001.md"]);
  run("scripts/check-release-topology-migration.mjs", [project, "--report", "release-topology-migrations/001.md", "--require-structured-evidence", "--require-current-project"]);
});

test("discovery-stage migration records an incomplete current topology without claiming readiness", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-topology-discovery-"));
  fs.mkdirSync(path.join(project, "release-execution-topologies"), { recursive: true });
  run("scripts/resolve-release-execution-topology.mjs", [project, "--out", "release-execution-topologies/001.md"]);
  run("scripts/resolve-release-topology-migration.mjs", [
    project,
    "--stage", "DISCOVERY",
    "--topology-ref", "release-execution-topologies/001.md",
    "--out", "release-topology-migrations/001.md",
  ]);
  run("scripts/check-release-topology-migration.mjs", [
    project,
    "--report", "release-topology-migrations/001.md",
    "--require-structured-evidence",
    "--require-current-project",
  ]);
  const content = fs.readFileSync(path.join(project, "release-topology-migrations/001.md"), "utf8");
  assert.match(content, /\"stage\": \"DISCOVERY\"/);
  assert.match(content, /\"outcome\": \"MIGRATION_DISCOVERED\"/);
});

test("copied and tampered migration evidence fails closed", () => {
  const project = fixture();
  prepare(project);
  run("scripts/resolve-release-topology-migration.mjs", [project, "--topology-ref", "release-execution-topologies/001.md", "--out", "release-topology-migrations/001.md"]);
  mutate(project, (value) => { value.target_topology.summary = "tampered"; });
  const tampered = check(project);
  assert.notEqual(tampered.status, 0);
  assert.match(output(tampered), /migration_digest|digest mismatch/i);

  const copied = fixture();
  fs.mkdirSync(path.join(copied, "release-topology-migrations"), { recursive: true });
  fs.mkdirSync(path.join(copied, "release-execution-topologies"), { recursive: true });
  fs.copyFileSync(path.join(project, "release-topology-migrations/001.md"), path.join(copied, "release-topology-migrations/001.md"));
  fs.copyFileSync(path.join(project, "release-execution-topologies/001.md"), path.join(copied, "release-execution-topologies/001.md"));
  assert.notEqual(check(copied).status, 0);
});

test("rehearsal cannot pass without non-production runtime and cleanup proof", () => {
  const project = preparedReport();
  mutate(project, (value) => {
    value.stage = "REHEARSAL";
    value.rehearsal.status = "PASSED";
    value.rehearsal.environment = "PRODUCTION";
    value.rehearsal.duplicate_production_effect = "Unknown";
  }, true);
  const result = check(project);
  assert.notEqual(result.status, 0);
  assert.match(output(result), /non-production|duplicate production|requires an exact ref/i);
});

test("cutover review cannot use embedded or missing consent", () => {
  const project = preparedReport();
  mutate(project, (value) => {
    value.stage = "CUTOVER_REVIEW";
    value.cutover.readiness_status = "READY_FOR_REVIEW";
    value.cutover.rollback_ref = "artifact:rollback/001.md";
    value.cutover.external_effect = "switch production release trigger";
    value.recommendation.user_input_class = "NO_USER_ACTION";
  }, true);
  const result = check(project);
  assert.notEqual(result.status, 0);
  assert.match(output(result), /cutover\.consent|real-world consent/i);
});

test("post-cutover stage requires observed target and old-backend nonpublish proof", () => {
  const project = preparedReport();
  mutate(project, (value) => {
    value.stage = "POST_CUTOVER_PROOF";
    value.post_cutover.status = "NOT_STARTED";
  }, true);
  const result = check(project);
  assert.notEqual(result.status, 0);
  assert.match(output(result), /post-cutover|target_active_proof|old_backend_nonpublish_proof/i);
});

test("retirement review requires separate authority and preserved evidence", () => {
  const project = preparedReport();
  mutate(project, (value) => {
    value.stage = "RETIREMENT_REVIEW";
    value.retirement.status = "READY_FOR_REVIEW";
    value.retirement.historical_evidence_preserved = "No";
  }, true);
  const result = check(project);
  assert.notEqual(result.status, 0);
  assert.match(output(result), /retirement\.authority|preserve historical evidence/i);
});

test("strict mode cannot be bypassed by allow-empty", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-migration-empty-"));
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts/check-release-topology-migration.mjs"), empty, "--allow-empty", "--require-structured-evidence"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
});

function preparedReport() {
  const project = fixture();
  prepare(project);
  run("scripts/resolve-release-topology-migration.mjs", [project, "--topology-ref", "release-execution-topologies/001.md", "--out", "release-topology-migrations/001.md"]);
  return project;
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-topology-migration-"));
  git(root, ["init"]); git(root, ["config", "user.email", "test@example.com"]); git(root, ["config", "user.name", "IntentOS Test"]);
  fs.mkdirSync(path.join(root, ".github/workflows"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\nenvironment: production\nconcurrency: release\n- uses: actions/upload-artifact@v4\n");
  fs.writeFileSync(path.join(root, "docs/release-sop.md"), "staging rollback smoke monitoring cleanup retention\n");
  git(root, ["add", "."]); git(root, ["commit", "-m", "fixture"]);
  return root;
}
function prepare(project) { run("scripts/resolve-release-execution-topology.mjs", [project, "--out", "release-execution-topologies/001.md"]); }
function mutate(project, callback, refreshDigest = false) {
  const file = path.join(project, "release-topology-migrations/001.md");
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  const value = JSON.parse(match[1]);
  callback(value);
  if (refreshDigest) value.migration_digest = migrationDigest(value);
  fs.writeFileSync(file, content.replace(match[1], JSON.stringify(value, null, 2)));
}
function check(project) { return spawnSync(process.execPath, [path.join(kitRoot, "scripts/check-release-topology-migration.mjs"), project, "--report", "release-topology-migrations/001.md", "--require-structured-evidence", "--require-current-project"], { encoding: "utf8" }); }
function run(script, args) { const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...args], { encoding: "utf8" }); assert.equal(result.status, 0, output(result)); return result; }
function git(root, args) { const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" }); assert.equal(result.status, 0, result.stderr); }
function output(result) { return `${result.stdout || ""}\n${result.stderr || ""}`; }
