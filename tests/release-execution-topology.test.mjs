import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { discoverReleaseTopology, topologyDigest, translateLegacyReleaseChannelPolicy } from "../scripts/lib/release-execution-topology.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

test("six-plane discovery keeps SSH transport separate from execution backend", () => {
  const project = fixture({ workflow: "runs-on: ubuntu-latest\nsteps:\n  - run: ssh host deploy\nconcurrency: release\n", docs: "rollback smoke staging cleanup" });
  const result = discoverReleaseTopology(project);
  assert.equal(result.planes.execution_backend.backend_class, "HOSTED_CI_RUNNER");
  assert.equal(result.planes.package_transport.type, "SSH");
  assert.notEqual(result.planes.execution_backend.type, result.planes.package_transport.type);
});

test("self-hosted execution under hosted orchestration remains representable", () => {
  const project = fixture({ workflow: "runs-on: [self-hosted, linux]\nconcurrency: release\n", docs: "rollback smoke staging cleanup" });
  const result = discoverReleaseTopology(project);
  assert.equal(result.planes.orchestration.type, "PROJECT_CI");
  assert.equal(result.planes.execution_backend.backend_class, "SELF_HOSTED_CI_RUNNER");
});

test("provider-managed and platform-submission topology classes remain representable", () => {
  const provider = fixture({ workflow: "runs-on: ubuntu-latest\n- run: vercel deploy --prod\nconcurrency: release", docs: "staging rollback smoke cleanup" });
  assert.equal(discoverReleaseTopology(provider).planes.production_target.type, "PROVIDER_TARGET");
  const submission = fixture({ workflow: "runs-on: macos-latest\n- run: echo 'App Store submission'\nconcurrency: release", docs: "TestFlight rollback observation cleanup" });
  assert.equal(discoverReleaseTopology(submission).planes.production_target.type, "PLATFORM_SUBMISSION");
});

test("documentation-only production facts cannot establish strict readiness", () => {
  const project = fixture({ workflow: "runs-on: ubuntu-latest\nconcurrency: release\n- uses: actions/upload-artifact@v4", docs: "production staging rollback smoke cleanup retention" });
  const result = discoverReleaseTopology(project);
  assert.equal(result.planes.production_target.confidence, "INFERRED");
  assert.equal(result.outcome, "RELEASE_TOPOLOGY_BLOCKED");
});

test("missing active production facts fail closed", () => {
  const project = fixture({ workflow: "", docs: "" });
  const result = discoverReleaseTopology(project);
  assert.equal(result.outcome, "RELEASE_TOPOLOGY_BLOCKED");
  assert.equal(result.recommendation.state, "NEEDS_PROJECT_FACT_DISCOVERY");
});

test("topology digest rejects tampering", () => {
  const project = fixture({ workflow: "runs-on: ubuntu-latest\nconcurrency: release", docs: "production staging rollback smoke cleanup" });
  const result = discoverReleaseTopology(project);
  assert.equal(topologyDigest(result), result.topology_digest);
  result.planes.package_transport.type = "TAMPERED";
  assert.notEqual(topologyDigest(result), result.topology_digest);
});

test("legacy channel policy translates without becoming readiness authority", () => {
  const translated = translateLegacyReleaseChannelPolicy({
    artifact_type: "release_channel_policy",
    source_identity: { source_ref_role: "identity_only" },
    github_actions_policy: { release_workflow_detected: "Yes" },
    github_actions_billing_profile: { runner_type: "self_hosted" },
    effective_release_channel: { channel: "server_release_sop" },
  });
  assert.equal(translated.execution_backend, "SELF_HOSTED_CI_RUNNER");
  assert.equal(translated.package_transport, "server_release_sop");
});

test("resolver output passes strict checker and copied identity fails current-project check", () => {
  const project = fixture({ workflow: "runs-on: ubuntu-latest\nenvironment: production\nconcurrency: release\n- uses: actions/upload-artifact@v4", docs: "production staging rollback smoke cleanup retention" });
  run(["scripts/resolve-release-execution-topology.mjs", project, "--out", "release-execution-topologies/001.md"]);
  run(["scripts/check-release-execution-topology.mjs", project, "--report", "release-execution-topologies/001.md", "--require-structured-evidence", "--require-current-project"]);
  const copied = fixture({ workflow: "runs-on: ubuntu-latest", docs: "production" });
  fs.mkdirSync(path.join(copied, "release-execution-topologies"), { recursive: true });
  fs.copyFileSync(path.join(project, "release-execution-topologies/001.md"), path.join(copied, "release-execution-topologies/001.md"));
  const bad = spawnSync(process.execPath, [path.join(root, "scripts/check-release-execution-topology.mjs"), copied, "--report", "release-execution-topologies/001.md", "--require-structured-evidence", "--require-current-project"], { encoding: "utf8" });
  assert.notEqual(bad.status, 0);
  assert.match(`${bad.stdout}\n${bad.stderr}`, /stale or copied/);
});

function fixture({ workflow, docs }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-topology-"));
  runGit(dir, ["init"]);
  runGit(dir, ["config", "user.email", "test@example.com"]);
  runGit(dir, ["config", "user.name", "IntentOS Test"]);
  fs.mkdirSync(path.join(dir, ".github/workflows"), { recursive: true });
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".github/workflows/release.yml"), workflow || "name: noop\n");
  fs.writeFileSync(path.join(dir, "docs/release-sop.md"), docs || "not configured\n");
  runGit(dir, ["add", "."]);
  runGit(dir, ["commit", "-m", "fixture"]);
  return dir;
}
function run(args) {
  const result = spawnSync(process.execPath, [path.join(root, args[0]), ...args.slice(1)], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result;
}
function runGit(cwd, args) {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}
