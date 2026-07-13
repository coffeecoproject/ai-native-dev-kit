import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { canonicalFileDigest } from "../scripts/lib/evidence-authority.mjs";
import { discoverReleaseTopology } from "../scripts/lib/release-execution-topology.mjs";
import { releaseTopologyBindingsAgree, validateReleaseTopologySource } from "../scripts/lib/release-topology-consumer.mjs";

const kitRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

test("strict topology source accepts current evidence and rejects copied evidence", () => {
  const current = fixture();
  const report = "release-execution-topologies/001.md";
  runNode("scripts/resolve-release-execution-topology.mjs", [current, "--out", report]);
  const source = { ref: `artifact:${report}`, digest: canonicalFileDigest(path.join(current, report)) };
  const accepted = validateReleaseTopologySource(current, "", source, {
    expectedSourceRevision: git(current, ["rev-parse", "HEAD"]).trim(),
    requireReady: true,
  });
  assert.equal(accepted.ok, true, accepted.errors.join("\n"));

  const copied = fixture();
  fs.mkdirSync(path.join(copied, "release-execution-topologies"), { recursive: true });
  fs.copyFileSync(path.join(current, report), path.join(copied, report));
  const rejected = validateReleaseTopologySource(copied, "", source, { requireReady: true });
  assert.equal(rejected.ok, false);
  assert.match(rejected.errors.join("\n"), /stale|copied|another project/i);
});

test("topology source rejects file-digest tampering and legacy-only absence", () => {
  const project = fixture();
  const missing = validateReleaseTopologySource(project, "", null, { requireReady: true });
  assert.equal(missing.ok, false);
  const report = "release-execution-topologies/001.md";
  runNode("scripts/resolve-release-execution-topology.mjs", [project, "--out", report]);
  const bad = validateReleaseTopologySource(project, "", {
    ref: `artifact:${report}`,
    digest: `sha256:${"0".repeat(64)}`,
  }, { requireReady: true });
  assert.equal(bad.ok, false);
  assert.match(bad.errors.join("\n"), /file digest/i);
});

test("candidate, package, source, and action bindings must agree", () => {
  const expected = {
    source_revision: "abc",
    release_candidate_ref: "artifact:release-candidates/001.md",
    package_identity_ref: "artifact:dist/app.tgz",
    action_id: "publish-production",
  };
  assert.equal(releaseTopologyBindingsAgree(expected, { ...expected }), true);
  assert.equal(releaseTopologyBindingsAgree(expected, { ...expected, package_identity_ref: "artifact:dist/other.tgz" }), false);
  assert.equal(releaseTopologyBindingsAgree(expected, { ...expected, action_id: "publish-preview" }), false);
});

test("multiple active publishing workflows fail closed", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, ".github/workflows/second.yml"), "runs-on: ubuntu-latest\nenvironment: production\n- run: vercel deploy --prod\n");
  const topology = discoverReleaseTopology(project);
  assert.equal(topology.outcome, "RELEASE_TOPOLOGY_BLOCKED");
  assert.match(topology.conflicts.join("\n"), /multiple active publish-capable workflows/i);
});

test("strict consumer flags cannot pass an empty project", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-topology-empty-"));
  for (const [script, flag] of [
    ["check-release-evidence-gate.mjs", "--require-release-topology"],
    ["check-release-approval-record.mjs", "--require-release-topology"],
    ["check-release-execution.mjs", "--require-release-topology"],
    ["check-runtime-hygiene.mjs", "--require-release-topology"],
  ]) {
    const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", script), empty, "--allow-empty", flag], { encoding: "utf8" });
    assert.notEqual(result.status, 0, `${script} unexpectedly passed\n${result.stdout}\n${result.stderr}`);
  }
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-topology-consumer-"));
  git(root, ["init"]);
  git(root, ["config", "user.email", "test@example.com"]);
  git(root, ["config", "user.name", "IntentOS Test"]);
  fs.mkdirSync(path.join(root, ".github/workflows"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\nenvironment: production\nconcurrency: release\n- uses: actions/upload-artifact@v4\n");
  fs.writeFileSync(path.join(root, "docs/release-sop.md"), "staging rollback smoke monitoring cleanup retention\n");
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "fixture"]);
  return root;
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
