import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { evidenceDigest, extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity } from "../scripts/lib/evidence-authority.mjs";
import {
  discoverReleaseWorkflowFacts,
  expectedReleaseStepExecutor,
  normalizeReleaseExecutionRequest,
  releaseTopologyRequiredForExecution,
} from "../scripts/lib/release-action-authority.mjs";
import { discoverReleaseTopology } from "../scripts/lib/release-execution-topology.mjs";
import { releaseTopologyBindingsAgree, validateReleaseTopologySource } from "../scripts/lib/release-topology-consumer.mjs";
import { commandOrRequestDigest } from "../scripts/lib/release-trust.mjs";

const kitRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

test("release workflow is consent-first and resolves its consumer base from acceptance", () => {
  const workflow = fs.readFileSync(path.join(kitRoot, ".github/workflows/intentos-release-checks.yml"), "utf8");
  assert.match(workflow, /^\s*workflow_dispatch:\s*$/m);
  assert.match(workflow, /hosted_runner_consent:/);
  assert.match(workflow, /CONSENT_TO_HOSTED_RUNNER_FOR_READ_ONLY_RELEASE_CHECKS/);
  assert.doesNotMatch(workflow, /^\s*push:\s*$/m);
  assert.match(workflow, /node scripts\/check-release-acceptance\.mjs/);
  assert.match(workflow, /--require-hosted-runner-consent/);
  assert.match(workflow, /--require-dispatch-binding/);
  assert.match(workflow, /--require-accepted/);
  assert.match(workflow, /--print-base-revision/);
  assert.match(workflow, /id: candidate-base/);
  assert.doesNotMatch(workflow, /HEAD\^/);
  assert.doesNotMatch(workflow, /grep[^\n]*independent-review-report/);
  assert.ok(
    workflow.indexOf("Validate acceptance and resolve candidate base")
      < workflow.indexOf("Enforce current task, completion, and release consumers"),
  );
});

test("source workflow and optional GitHub adapter keep top-level contents read permission parity", () => {
  const source = fs.readFileSync(path.join(kitRoot, ".github/workflows/intentos-release-checks.yml"), "utf8");
  const distributed = fs.readFileSync(path.join(kitRoot, "platforms/github/ci-ai-workflow.yml"), "utf8");
  assert.equal(topLevelPermissions(source), "permissions:\n  contents: read");
  assert.equal(topLevelPermissions(distributed), topLevelPermissions(source));

  const manifest = JSON.parse(fs.readFileSync(path.join(kitRoot, "intentos-manifest.json"), "utf8"));
  assert.ok(manifest.groups.platformAdapters.includes("platforms/github/ci-ai-workflow.yml"));
  assert.ok(manifest.groups.sourceRequired.includes("platforms/github/ci-ai-workflow.yml"));
  assert.ok(!manifest.copyRules.files.some((rule) => (
    rule.source === "platforms/github/ci-ai-workflow.yml"
      || rule.target === ".github/workflows/ai-workflow-checks.yml"
  )));
});

test("PR and release workflows verify their exact committed candidate ranges", () => {
  const pullRequest = fs.readFileSync(path.join(kitRoot, ".github/workflows/intentos-pr-checks.yml"), "utf8");
  assert.match(pullRequest, /Exact candidate diff check/);
  assert.match(pullRequest, /git diff --check .*consumer-base\.outputs\.base.*\.\.\.HEAD/);
  assert.match(pullRequest, /PR_BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(pullRequest, /base_sha:\n\s+description:.*\n\s+required: true\n\s+type: string/);
  assert.doesNotMatch(pullRequest, /github\.base_ref|origin\/\$|HEAD\^|base=["']?HEAD\b/);

  const release = fs.readFileSync(path.join(kitRoot, ".github/workflows/intentos-release-checks.yml"), "utf8");
  assert.match(release, /Exact candidate diff check/);
  assert.match(release, /check-consumer-chain\.mjs \. --base .*candidate-base\.outputs\.base.*--phase final/);
  assert.match(release, /git diff --check .*candidate-base\.outputs\.base.*\.\.\.HEAD/);
  assert.match(release, /INTENTOS_CONSUMER_BASE: .*candidate-base\.outputs\.base/);
  assert.match(release, /npm run verify:release/);

  assert.match(pullRequest, /check-consumer-chain\.mjs \. --base .*consumer-base\.outputs\.base.*--phase candidate/);
});

test("workflow_dispatch provider actions and hosted runners share one discovery authority", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Provider deploy",
    "on:",
    "  workflow_dispatch:",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: FirebaseExtended/action-hosting-deploy@v0",
    "",
  ].join("\n"));
  git(project, ["add", ".github/workflows/release.yml"]);
  git(project, ["commit", "-m", "provider deploy workflow"]);

  const facts = discoverReleaseWorkflowFacts(project);
  assert.deepEqual(facts.errors, []);
  assert.equal(facts.workflowDispatch, true);
  assert.equal(facts.workflowDispatchActionBasedDeploy, true);
  assert.equal(facts.actionBasedDeploy, true);
  assert.equal(facts.providerDeploy, true);
  assert.equal(facts.releaseWorkflow, true);
  assert.equal(facts.githubHostedRunner, "Yes");
  assert.equal(facts.selfHostedRunner, "No");
  assert.equal(facts.runnerType, "github_hosted");

  const report = "release-channel-policies/generated.md";
  const resolved = runCheck("scripts/resolve-release-channel-policy.mjs", [project, "--out", report]);
  assert.equal(resolved.status, 0, `${resolved.stdout}\n${resolved.stderr}`);
  assert.match(resolved.stdout, /\| Release workflow detected \| Yes \|/);
  assert.match(resolved.stdout, /\| GitHub-hosted runner used \| Yes \|/);
  assert.match(resolved.stdout, /\| Effective release channel \| provider_direct_deploy \|/);

  const checked = runCheck("scripts/check-release-channel-policy.mjs", [
    project,
    "--report", report,
    "--require-structured-evidence",
    "--strict-source-binding",
  ]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  assert.match(checked.stdout, /binds observed release workflow/);
});

test("inline workflow_dispatch maps are discovered without treating release notes as deploy actions", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Manual notes",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  notes:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: acme/release-notes@v1",
    "",
  ].join("\n"));
  const facts = discoverReleaseWorkflowFacts(project);
  assert.equal(facts.workflowDispatch, true);
  assert.equal(facts.actionBasedDeploy, false);
  assert.equal(facts.releaseWorkflow, false);
});

test("unknown release-like remote actions and unresolved build targets fail closed", () => {
  for (const releaseStep of [
    "      - uses: acme/promote-production@v1",
    "      - run: npm run ship",
  ]) {
    const project = fixture();
    if (releaseStep.includes("npm run")) {
      fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({ scripts: { ship: "make deploy" } }, null, 2)}\n`);
      fs.writeFileSync(path.join(project, "Makefile"), "deploy:\n\tterraform apply -auto-approve\n");
    }
    fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
      "name: Bounded release inspection",
      "on: { workflow_dispatch: {} }",
      "jobs:",
      "  release:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      releaseStep,
      "",
    ].join("\n"));

    const facts = discoverReleaseWorkflowFacts(project);
    assert.equal(facts.releaseWorkflow, true);
    assert.equal(facts.indirectExecutionResolutionUnknown, true);
    assert.match(JSON.stringify(facts.unresolvedIndirectExecutions), /not statically resolved|not in the bounded inspected action set/);

    const topology = discoverReleaseTopology(project, { topologyRef: "release-execution-topologies/current.md" });
    assert.equal(topology.outcome, "RELEASE_TOPOLOGY_BLOCKED");
    assert.equal(topology.recommendation.state, "NEEDS_PROJECT_FACT_DISCOVERY");
    assert.match(topology.conflicts.join("\n"), /release execution graph unresolved/);
  }
});

test("workflow package scripts recursively expose provider deploys and explicit source_only stays blocked", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: {
      ship: "pnpm run release:provider",
      "release:provider": "yarn deploy:production",
      "deploy:production": "bash scripts/deploy.sh",
    },
  }, null, 2)}\n`);
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(project, "scripts/deploy.sh"), "#!/bin/sh\nvercel deploy --prod\n");
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Hidden provider deploy",
    "on:",
    "  workflow_dispatch:",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - run: npm run ship",
    "",
  ].join("\n"));

  const facts = discoverReleaseWorkflowFacts(project);
  assert.equal(facts.providerDeploy, true);
  assert.equal(facts.externalReleaseAction, true);
  assert.equal(facts.packageScriptResolutionUnknown, false);

  const report = "release-channel-policies/hidden-provider.md";
  const resolved = runCheck("scripts/resolve-release-channel-policy.mjs", [
    project,
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
    "--release-owner-ref", "human:release-owner",
    "--cost-owner-ref", "human:cost-owner",
    "--out", report,
  ]);
  assert.equal(resolved.status, 0, `${resolved.stdout}\n${resolved.stderr}`);
  assert.match(resolved.stdout, /source_only_conflicts_with_detected_provider_deploy/);
  assert.match(resolved.stdout, /BLOCKED_RELEASE_CHANNEL_POLICY/);

  const checked = runCheck("scripts/check-release-channel-policy.mjs", [
    project,
    "--report", report,
    "--require-structured-evidence",
    "--strict-source-binding",
  ]);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
  assert.match(checked.stdout, /source_only correctly blocks release review because a deploy, publish, submission, or release action exists/);
});

test("workflow npm scripts expose provider deploys hidden in project shell, Node, and Python scripts", () => {
  const cases = [
    {
      label: "shell",
      command: "bash scripts/deploy.sh",
      file: "scripts/deploy.sh",
      source: "#!/bin/sh\nvercel deploy --prod\n",
    },
    {
      label: "Node",
      command: "node scripts/deploy.mjs",
      file: "scripts/deploy.mjs",
      source: [
        'import { spawnSync as launch } from "node:child_process";',
        'launch("vercel", ["deploy", "--prod"], { stdio: "inherit" });',
        "",
      ].join("\n"),
    },
    {
      label: "Python",
      command: "python3 scripts/deploy.py",
      file: "scripts/deploy.py",
      source: [
        "from subprocess import run as launch",
        'launch(["vercel", "deploy", "--prod"], check=True)',
        "",
      ].join("\n"),
    },
  ];

  for (const item of cases) {
    const project = fixture();
    fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
    fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({ scripts: { ship: item.command } }, null, 2)}\n`);
    fs.writeFileSync(path.join(project, item.file), item.source);
    fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
      "name: Indirect provider deploy",
      "on: { workflow_dispatch: {} }",
      "jobs:",
      "  deploy:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: npm run ship",
      "",
    ].join("\n"));

    const facts = discoverReleaseWorkflowFacts(project);
    assert.equal(facts.providerDeploy, true, `${item.label}: ${JSON.stringify(facts.unresolvedIndirectExecutions)}`);
    assert.equal(facts.commandBasedDeploy, true, item.label);
    assert.equal(facts.externalReleaseAction, true, item.label);
    assert.equal(facts.indirectExecutionResolutionUnknown, false, item.label);
  }
});

test("mixed project script chains remain recursive through the provider command", () => {
  const project = fixture();
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: { ship: "bash scripts/ship.sh" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, "scripts/ship.sh"), "#!/bin/sh\nnode scripts/ship.mjs\n");
  fs.writeFileSync(path.join(project, "scripts/ship.mjs"), [
    'import { execSync } from "node:child_process";',
    'execSync("python3 scripts/deploy.py");',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, "scripts/deploy.py"), [
    "import subprocess",
    'subprocess.run(["vercel", "deploy", "--prod"], check=True)',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Deep indirect deploy",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - run: npm run ship",
    "",
  ].join("\n"));

  const facts = discoverReleaseWorkflowFacts(project);
  assert.equal(facts.providerDeploy, true, JSON.stringify(facts.unresolvedIndirectExecutions));
  assert.equal(facts.externalReleaseAction, true);
  assert.equal(facts.indirectExecutionResolutionUnknown, false);
});

test("local reusable workflows and composite actions remain in the deploy authority graph", () => {
  const project = fixture();
  fs.mkdirSync(path.join(project, ".github/actions/provider"), { recursive: true });
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: { ship: "node scripts/provider.mjs" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, "scripts/provider.mjs"), [
    'import { execFileSync } from "node:child_process";',
    'execFileSync("vercel", ["deploy", "--prod"]);',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/actions/provider/deploy.sh"), "#!/bin/sh\nnpm run ship\n");
  fs.writeFileSync(path.join(project, ".github/actions/provider/action.yml"), [
    "name: Provider composite",
    "runs:",
    "  using: composite",
    "  steps:",
    "    - shell: bash",
    '      run: bash "${{ github.action_path }}/deploy.sh"',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/workflows/provider.yml"), [
    "name: Reusable provider deploy",
    "on:",
    "  workflow_call:",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - uses: ./.github/actions/provider",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Release caller",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  deploy:",
    "    uses: ./.github/workflows/provider.yml",
    "",
  ].join("\n"));

  const facts = discoverReleaseWorkflowFacts(project);
  assert.equal(facts.providerDeploy, true, JSON.stringify(facts.unresolvedIndirectExecutions));
  assert.equal(facts.externalReleaseAction, true);
  assert.equal(facts.indirectExecutionResolutionUnknown, false);
  assert.equal(facts.githubHostedRunner, "Yes");
});

test("dynamic project process calls and remote reusable workflows fail closed", () => {
  const project = fixture();
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: { ship: "node scripts/deploy.mjs" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, "scripts/deploy.mjs"), [
    'import { spawnSync } from "node:child_process";',
    "const providerArgs = process.argv.slice(2);",
    'spawnSync("vercel", providerArgs);',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Dynamic deploy",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - run: npm run ship",
    "",
  ].join("\n"));

  const dynamic = discoverReleaseWorkflowFacts(project);
  assert.equal(dynamic.providerDeploy, false);
  assert.equal(dynamic.indirectExecutionResolutionUnknown, true);
  assert.match(dynamic.unresolvedIndirectExecutions.map((item) => item.reason).join("\n"), /spawnSync call cannot be statically resolved/);

  const policy = runCheck("scripts/resolve-release-channel-policy.mjs", [
    project,
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
  ]);
  assert.equal(policy.status, 0, `${policy.stdout}\n${policy.stderr}`);
  assert.match(policy.stdout, /source_only_external_effect_not_proven_absent/);
  assert.match(policy.stdout, /BLOCKED_RELEASE_CHANNEL_POLICY/);

  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), [
    "name: Remote reusable deploy",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  deploy:",
    "    uses: acme/release/.github/workflows/provider.yml@v1",
    "",
  ].join("\n"));
  const remote = discoverReleaseWorkflowFacts(project);
  assert.equal(remote.indirectExecutionResolutionUnknown, true);
  assert.match(remote.unresolvedIndirectExecutions.map((item) => item.reason).join("\n"), /remote reusable workflow/);
});

test("manual validation workflows do not become release workflows because checkers spawn processes", () => {
  const project = fixture();
  fs.rmSync(path.join(project, ".github/workflows/release.yml"));
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: { verify: "node scripts/check-release-evidence.mjs" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, "scripts/check-release-evidence.mjs"), [
    'import { spawnSync } from "node:child_process";',
    'const args = process.argv.slice(2);',
    'spawnSync(process.execPath, args);',
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(project, ".github/workflows/checks.yml"), [
    "name: Release evidence checks",
    "on: { workflow_dispatch: {} }",
    "jobs:",
    "  verify:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - run: npm run verify",
    "",
  ].join("\n"));

  const facts = discoverReleaseWorkflowFacts(project);
  assert.equal(facts.indirectExecutionResolutionUnknown, true);
  assert.equal(facts.externalReleaseAction, false);
  assert.equal(facts.releaseWorkflow, false);
});

test("package script recursion distinguishes proven-safe chains from unresolved cycles", () => {
  const project = fixture();
  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: {
      ci: "pnpm run build",
      build: "echo build-only",
      "deploy:unused": "vercel deploy --prod",
    },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\n- run: npm run ci\n");
  const safe = discoverReleaseWorkflowFacts(project);
  assert.equal(safe.providerDeploy, false);
  assert.equal(safe.externalReleaseAction, false);
  assert.equal(safe.packageScriptResolutionUnknown, false);
  const safePolicy = runCheck("scripts/resolve-release-channel-policy.mjs", [
    project,
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
  ]);
  assert.equal(safePolicy.status, 0, `${safePolicy.stdout}\n${safePolicy.stderr}`);
  assert.match(safePolicy.stdout, /RELEASE_CHANNEL_POLICY_RECORDED/);
  assert.doesNotMatch(safePolicy.stdout, /source_only_conflicts_with_detected_provider_deploy/);

  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: { ship: "echo root-only" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\n- run: npm run ship --workspace apps/web\n");
  const workspace = discoverReleaseWorkflowFacts(project);
  assert.equal(workspace.packageScriptResolutionUnknown, true);
  assert.match(workspace.unresolvedPackageScripts.map((item) => item.reason).join("\n"), /non-root package or workspace selector/);

  fs.writeFileSync(path.join(project, "package.json"), `${JSON.stringify({
    scripts: {
      release: "pnpm run stage",
      stage: "yarn run release",
    },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(project, ".github/workflows/release.yml"), "runs-on: ubuntu-latest\n- run: npm run release\n");
  const cyclic = discoverReleaseWorkflowFacts(project);
  assert.equal(cyclic.packageScriptResolutionUnknown, true);
  assert.match(cyclic.unresolvedPackageScripts.map((item) => item.reason).join("\n"), /cycle cannot be proven effect-free/);

  const resolved = runCheck("scripts/resolve-release-channel-policy.mjs", [
    project,
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
  ]);
  assert.equal(resolved.status, 0, `${resolved.stdout}\n${resolved.stderr}`);
  assert.match(resolved.stdout, /source_only_external_effect_not_proven_absent/);
  assert.match(resolved.stdout, /BLOCKED_RELEASE_CHANNEL_POLICY/);
});

test("strict topology source accepts current evidence and rejects copied evidence", () => {
  const current = fixture();
  const report = "release-execution-topologies/001.md";
  runNode("scripts/resolve-release-execution-topology.mjs", [current, "--out", report]);
  const source = { ref: `artifact:${report}`, digest: canonicalFileDigest(path.join(current, report)) };
  const accepted = validateReleaseTopologySource(current, "", source, {
    expectedSourceRevision: projectIdentity(current).revision,
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
  for (const tampered of [
    { source_revision: "def" },
    { release_candidate_ref: "artifact:release-candidates/other.md" },
    { package_identity_ref: "artifact:dist/other.tgz" },
    { action_id: "publish-preview" },
  ]) {
    assert.equal(releaseTopologyBindingsAgree(expected, { ...expected, ...tampered }), false);
  }
  const strictConsumer = fs.readFileSync(path.join(kitRoot, "scripts/check-release-execution.mjs"), "utf8");
  assert.match(strictConsumer, /releaseTopologyBindingsAgree\(expected, actual\)/);
  assert.match(strictConsumer, /release topology bindings do not exactly match current approval\/effect authority/);
});

test("execution requests normalize argv and provider requests and reject shell expansion", () => {
  const argv = normalizeReleaseExecutionRequest("vercel   deploy '--prod'");
  assert.equal(argv.ok, true, argv.errors.join("\n"));
  assert.deepEqual(argv.value, { request_type: "argv", argv: ["vercel", "deploy", "--prod"] });
  assert.equal(argv.canonical, "vercel deploy --prod");

  const provider = normalizeReleaseExecutionRequest('{"target":"production","provider":"vercel"}');
  assert.equal(provider.ok, true, provider.errors.join("\n"));
  assert.deepEqual(provider.value, {
    request_type: "provider_request",
    provider_request: { provider: "vercel", target: "production" },
  });
  assert.equal(provider.canonical, '{"provider":"vercel","target":"production"}');

  assert.equal(normalizeReleaseExecutionRequest("vercel deploy $TARGET").ok, false);
  assert.equal(normalizeReleaseExecutionRequest("vercel deploy --prod && echo done").ok, false);
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

test("release topology is mandatory by mode, without relying on an optional flag", () => {
  assert.equal(releaseTopologyRequiredForExecution("PLAN_ONLY", "No"), false);
  assert.equal(releaseTopologyRequiredForExecution("BLOCKED", "No"), false);
  assert.equal(releaseTopologyRequiredForExecution("ASSISTED_EXECUTION", "No"), true);
  assert.equal(releaseTopologyRequiredForExecution("HUMAN_EXECUTION_HANDOFF", "No"), true);
  assert.equal(releaseTopologyRequiredForExecution("BLOCKED", "Yes"), true);

  const project = fixture();
  const attempted = runCheck("scripts/resolve-release-execution.mjs", [
    project,
    "--mode", "ASSISTED_EXECUTION",
    "--deployment", "vercel deploy --prod",
  ]);
  assert.equal(attempted.status, 0, `${attempted.stdout}\n${attempted.stderr}`);
  assert.match(attempted.stdout, /\| Release Execution Topology \| `MISSING` \| N\/A \|/);

  const realWithoutTopology = attempted.stdout
    .replace("| Mode | `BLOCKED` |", "| Mode | `ASSISTED_EXECUTION` |")
    .replace("| Real release execution allowed | No |", "| Real release execution allowed | Yes |");
  const relative = "release-execution-plans/attempted.md";
  fs.mkdirSync(path.join(project, "release-execution-plans"), { recursive: true });
  fs.writeFileSync(path.join(project, relative), realWithoutTopology);
  const checked = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.notEqual(checked.status, 0);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /requires Release Execution Topology by default/);
});

test("PLAN_ONLY assigns Codex technical preparation while external release remains human-owned", () => {
  assert.equal(expectedReleaseStepExecutor("PLAN_ONLY", "VERIFY"), "CODEX_MAY_PREPARE");
  assert.equal(expectedReleaseStepExecutor("PLAN_ONLY", "BUILD"), "CODEX_MAY_PREPARE");
  assert.equal(expectedReleaseStepExecutor("PLAN_ONLY", "POST_LAUNCH_SMOKE"), "CODEX_MAY_PREPARE");
  assert.equal(expectedReleaseStepExecutor("PLAN_ONLY", "DEPLOY_OR_SUBMIT"), "HUMAN_REQUIRED");

  const project = fixture();
  const generated = runCheck("scripts/resolve-release-execution.mjs", [
    project,
    "--mode", "PLAN_ONLY",
    "--deployment", "vercel deploy --prod",
  ]);
  assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
  assert.match(generated.stdout, /\| Release Execution Topology \| `NOT_APPLICABLE_WITH_EVIDENCE` \| N\/A \|/);
  assert.match(generated.stdout, /\| Prepare preflight verification \| `VERIFY` \| `CODEX_MAY_PREPARE` \|/);
  assert.match(generated.stdout, /\| Prepare build instructions \| `BUILD` \| `CODEX_MAY_PREPARE` \|/);
  assert.match(generated.stdout, /\| Release handoff \| `DEPLOY_OR_SUBMIT` \| `HUMAN_REQUIRED` \|/);
  const generatedEvidence = extractMachineReadableEvidence(generated.stdout);
  assert.equal(generatedEvidence.ok, true, generatedEvidence.errors?.join("\n"));
  assert.deepEqual(generatedEvidence.value.external_effect_request.argv, ["vercel", "deploy", "--prod"]);
  assert.equal(
    generatedEvidence.value.external_effect_request.command_or_request_digest,
    commandOrRequestDigest("vercel deploy --prod"),
  );

  const relative = "release-execution-plans/001.md";
  fs.mkdirSync(path.join(project, "release-execution-plans"), { recursive: true });
  fs.writeFileSync(path.join(project, relative), generated.stdout);
  const accepted = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.equal(accepted.status, 0, `${accepted.stdout}\n${accepted.stderr}`);

  fs.writeFileSync(
    path.join(project, relative),
    generated.stdout.replace(
      "Release execution is being planned only; no real release action is allowed.",
      "Human-readable wording changed without changing the machine request.",
    ),
  );
  const markdownOnlyChange = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.equal(markdownOnlyChange.status, 0, `${markdownOnlyChange.stdout}\n${markdownOnlyChange.stderr}`);

  fs.writeFileSync(
    path.join(project, relative),
    generated.stdout.replace('"--prod"', '"--preview"'),
  );
  const machineRequestTamper = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.notEqual(machineRequestTamper.status, 0);
  assert.match(`${machineRequestTamper.stdout}\n${machineRequestTamper.stderr}`, /release_execution_digest does not match canonical evidence digest/);

  const resealedOuterEvidence = structuredClone(generatedEvidence.value);
  resealedOuterEvidence.external_effect_request.argv[2] = "--preview";
  resealedOuterEvidence.release_execution_digest = evidenceDigest(resealedOuterEvidence, ["release_execution_digest"]);
  fs.writeFileSync(path.join(project, relative), replaceMachineEvidence(generated.stdout, resealedOuterEvidence));
  const requestDigestTamper = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.notEqual(requestDigestTamper.status, 0);
  assert.match(
    `${requestDigestTamper.stdout}\n${requestDigestTamper.stderr}`,
    /external effect request digest does not match persisted normalized machine request/,
  );

  fs.writeFileSync(
    path.join(project, relative),
    generated.stdout.replace("`NOT_APPLICABLE_WITH_EVIDENCE` | N/A", "`PASS` | N/A"),
  );
  const contradiction = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.notEqual(contradiction.status, 0);
  assert.match(`${contradiction.stdout}\n${contradiction.stderr}`, /cannot be PASS while its structured ref and digest are N\/A/);

  fs.writeFileSync(
    path.join(project, relative),
    generated.stdout.replace(
      "| Prepare preflight verification | `VERIFY` | `CODEX_MAY_PREPARE` |",
      "| Prepare preflight verification | `VERIFY` | `HUMAN_REQUIRED` |",
    ),
  );
  const wrongOwner = runCheck("scripts/check-release-execution.mjs", [
    project,
    "--report", relative,
    "--require-structured-evidence",
  ]);
  assert.notEqual(wrongOwner.status, 0);
  assert.match(`${wrongOwner.stdout}\n${wrongOwner.stderr}`, /executor HUMAN_REQUIRED must be CODEX_MAY_PREPARE/);
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
  const result = runCheck(script, args);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result;
}

function runCheck(script, args) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], { encoding: "utf8" });
}

function topLevelPermissions(workflow) {
  return workflow.match(/^permissions:\n(?:  [^\n]+\n?)+/m)?.[0].trim() || "";
}

function replaceMachineEvidence(content, evidence) {
  return content.replace(
    /```json\n[\s\S]*?\n```/,
    `\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\``,
  );
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
