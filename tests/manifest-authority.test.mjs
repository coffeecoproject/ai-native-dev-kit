import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadManifest, manifestPathForRoot } from "../scripts/lib/manifest.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");
const manifestPath = path.join(kitRoot, "intentos-manifest.json");
const baseManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: kitRoot,
    encoding: "utf8",
    env: options.env || process.env,
  });
}

function checkerOutput(result) {
  return `${result.stdout}\n${result.stderr}`;
}

function withManifest(mutator, callback) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-manifest-authority-"));
  try {
    const manifest = structuredClone(baseManifest);
    mutator(manifest);
    const candidatePath = path.join(tempRoot, "intentos-manifest.json");
    fs.writeFileSync(candidatePath, `${JSON.stringify(manifest, null, 2)}\n`);
    return callback(candidatePath);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function assertCheckerRejects(mutator, expectedMarker) {
  withManifest(mutator, (candidatePath) => {
    const result = runNode([
      "scripts/check-manifest.mjs",
      kitRoot,
      "--manifest",
      candidatePath,
    ]);
    assert.notEqual(result.status, 0, checkerOutput(result));
    assert.match(checkerOutput(result), expectedMarker);
  });
}

function walkFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if ([".DS_Store", ".localized"].includes(entry.name)) continue;
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

test("current manifest passes strict authority checks", () => {
  const result = runNode(["scripts/check-manifest.mjs"]);
  assert.equal(result.status, 0, checkerOutput(result));
  assert.match(result.stdout, /strict artifact schema validation/);
  assert.match(result.stdout, /copy rule targets are unique and ancestor-normalized/);
  assert.match(result.stdout, /GitHub-hosted workflow remains a source-required optional platform adapter/);
  assert.match(result.stdout, /GitHub-hosted workflow is absent from unconditional target distribution/);
});

test("1.113 manifest closes imported and runtime-script distribution dependencies", () => {
  const workflowVersion = JSON.parse(fs.readFileSync(path.join(kitRoot, "templates/workflow-version.json"), "utf8"));
  const required = [
    "scripts/lib/release-evidence-requirements.mjs",
    "scripts/lib/release-execution-topology.mjs",
    "scripts/lib/release-surface-evidence.mjs",
    "scripts/lib/release-topology-consumer.mjs",
    "scripts/lib/release-topology-migration.mjs",
    "scripts/verification-runtime-self-service.mjs",
  ];
  for (const dependency of required) {
    assert.ok(baseManifest.groups.workflowVersionAssets.includes(dependency), `${dependency}:manifest workflowVersionAssets`);
    assert.ok(workflowVersion.workflowAssets.includes(dependency), `${dependency}:workflow version template`);
    assert.ok(baseManifest.copyRules.files.some((rule) => rule.source === dependency && rule.target === dependency), `${dependency}:copy rule`);
  }
  for (const dependency of [
    "scripts/lib/release-surface-evidence.mjs",
    "scripts/verification-runtime-self-service.mjs",
  ]) {
    assert.ok(baseManifest.groups.sourceRequired.includes(dependency), `${dependency}:source authority`);
    assert.ok(baseManifest.groups.targetFull.includes(dependency), `${dependency}:full target`);
  }
});

test("manifest checker fails closed when a distributed import is omitted", () => {
  assertCheckerRejects((manifest) => {
    const dependency = "scripts/lib/release-surface-evidence.mjs";
    manifest.groups.workflowVersionAssets = manifest.groups.workflowVersionAssets.filter((item) => item !== dependency);
    manifest.copyRules.files = manifest.copyRules.files.filter((rule) => rule.source !== dependency);
  }, /runtime dependencies must be copied and workflow-version managed: .*release-surface-evidence\.mjs/);
});

test("manifest checker fails closed when a package runtime script is outside source authority", () => {
  assertCheckerRejects((manifest) => {
    const dependency = "scripts/verification-runtime-self-service.mjs";
    manifest.groups.sourceRequired = manifest.groups.sourceRequired.filter((item) => item !== dependency);
    manifest.groups.workflowVersionAssets = manifest.groups.workflowVersionAssets.filter((item) => item !== dependency);
    manifest.copyRules.files = manifest.copyRules.files.filter((rule) => rule.source !== dependency);
  }, /package runtime script reference\(s\) are absent from manifest source coverage: .*verification-runtime-self-service\.mjs/);
});

test("installed managed manifest overrides a stale root manifest", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-installed-manifest-"));
  try {
    fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
    fs.writeFileSync(path.join(root, "intentos-manifest.json"), JSON.stringify({ intentOSVersion: "0.0.1" }));
    fs.writeFileSync(path.join(root, ".intentos", "intentos-manifest.json"), JSON.stringify({ intentOSVersion: "9.9.9", mode: "installed" }));
    assert.equal(manifestPathForRoot(root), path.join(root, ".intentos", "intentos-manifest.json"));
    assert.equal(loadManifest(root).intentOSVersion, "9.9.9");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("an arbitrary project root manifest is not source authority", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-shadow-manifest-"));
  try {
    fs.writeFileSync(path.join(root, "VERSION.md"), "Current version: `9.9.9`\n");
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "business-project" }));
    fs.writeFileSync(path.join(root, "intentos-manifest.json"), JSON.stringify({
      mode: "authoritative",
      compatibilityPolicy: { authoritative: true },
      intentOSVersion: "9.9.9",
    }));
    assert.equal(manifestPathForRoot(root), path.join(root, ".intentos", "intentos-manifest.json"));
    assert.throws(() => loadManifest(root), /ENOENT/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("strict schema rejects unknown fields at every manifest layer", async (t) => {
  const cases = [
    ["root", (manifest) => { manifest.unknown = true; }, /manifest schema validation\.unknown is not allowed/],
    ["group", (manifest) => { manifest.groups.unknown = []; }, /manifest schema validation\.groups\.unknown is not allowed/],
    ["compatibility", (manifest) => { manifest.compatibilityPolicy.unknown = true; }, /manifest schema validation\.compatibilityPolicy\.unknown is not allowed/],
    ["copy rules", (manifest) => { manifest.copyRules.unknown = []; }, /manifest schema validation\.copyRules\.unknown is not allowed/],
    ["copy rule item", (manifest) => { manifest.copyRules.files[0].unknown = true; }, /manifest schema validation\.copyRules\.files\[0\]\.unknown is not allowed/],
  ];

  for (const [name, mutate, marker] of cases) {
    await t.test(name, () => assertCheckerRejects(mutate, marker));
  }
});

test("checker rejects an exact duplicate target", () => {
  assertCheckerRejects((manifest) => {
    manifest.copyRules.files.push(structuredClone(manifest.copyRules.files[0]));
  }, /manifest schema validation\.copyRules\.files\[\d+\] must be unique/);
});

test("checker rejects conflicting source-to-target mappings", () => {
  assertCheckerRejects((manifest) => {
    manifest.copyRules.files.push({
      source: "LICENSE.md",
      target: `./${manifest.copyRules.files[0].target}`,
    });
  }, /copy rules contain conflicting target/);
});

test("checker rejects redundant ancestor-child mappings", () => {
  assertCheckerRejects((manifest) => {
    manifest.copyRules.files.push({
      source: "templates/workflow-version.json",
      target: ".intentos/templates/workflow-version.json",
    });
  }, /copy rules contain redundant ancestor-child mapping/);
});

test("checker rejects conflicting target-space overlaps", () => {
  assertCheckerRejects((manifest) => {
    manifest.copyRules.files.push({
      source: "LICENSE.md",
      target: ".intentos/templates/target-space-conflict.md",
    });
  }, /copy rules contain conflicting target-space overlap/);
});

test("reverse drift guard covers every current test and schema source", () => {
  assertCheckerRejects((manifest) => {
    manifest.groups.sourceRequired = manifest.groups.sourceRequired.filter(
      (item) => item !== "tests/current-trust-fixture.test.mjs",
    );
  }, /reverse drift guard missing important source asset\(s\): .*tests\/current-trust-fixture\.test\.mjs/);
});

test("reverse drift ignores an untracked draft outside the exact Git candidate", () => {
  const draft = path.join(kitRoot, "docs", "untracked-manifest-candidate-draft.md");
  try {
    fs.writeFileSync(draft, "# Untracked Draft\n");
    const result = runNode(["scripts/check-manifest.mjs"]);
    assert.equal(result.status, 0, checkerOutput(result));
  } finally {
    fs.rmSync(draft, { force: true });
  }
});

test("manifest cannot declare an untracked worktree file as source authority", () => {
  const relative = "docs/untracked-manifest-authority-source.md";
  const full = path.join(kitRoot, relative);
  try {
    fs.writeFileSync(full, "# Untracked authority candidate\n");
    assertCheckerRejects((manifest) => {
      manifest.groups.sourceRequired.push(relative);
    }, /not staged\/tracked Git candidates: .*untracked-manifest-authority-source\.md/);
  } finally {
    fs.rmSync(full, { force: true });
  }
});

test("manifest copy directories cannot smuggle untracked worktree files", () => {
  const relative = "templates/untracked-copy-rule-source.md";
  const full = path.join(kitRoot, relative);
  try {
    fs.writeFileSync(full, "# Untracked copy source\n");
    const result = runNode(["scripts/check-manifest.mjs"]);
    assert.notEqual(result.status, 0, checkerOutput(result));
    assert.match(checkerOutput(result), /not staged\/tracked Git candidates: .*untracked-copy-rule-source\.md/);
  } finally {
    fs.rmSync(full, { force: true });
  }
});

test("manifest strict validation fails when the Git candidate is unreadable", () => {
  const fakeBin = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-unreadable-git-"));
  const fakeGit = path.join(fakeBin, "git");
  try {
    fs.writeFileSync(fakeGit, "#!/bin/sh\necho 'candidate unavailable' >&2\nexit 23\n");
    fs.chmodSync(fakeGit, 0o755);
    const result = runNode(["scripts/check-manifest.mjs"], {
      env: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH || ""}` },
    });
    assert.notEqual(result.status, 0, checkerOutput(result));
    assert.match(checkerOutput(result), /manifest Git candidate is unreadable: candidate unavailable/);
    assert.doesNotMatch(checkerOutput(result), /manifest reverse drift guard covers important source assets/);
  } finally {
    fs.rmSync(fakeBin, { recursive: true, force: true });
  }
});

test("hosted GitHub Actions is optional while local checker core remains distributed", () => {
  const adapterSource = "platforms/github/ci-ai-workflow.yml";
  const adapterTarget = ".github/workflows/ai-workflow-checks.yml";
  assert.ok(baseManifest.groups.platformAdapters.includes(adapterSource));
  assert.ok(baseManifest.groups.sourceRequired.includes(adapterSource));
  assert.ok(!baseManifest.copyRules.files.some((rule) => (
    rule.source === adapterSource || rule.target === adapterTarget
  )));
  for (const group of ["targetCore", "targetFull", "workflowVersionAssets"]) {
    assert.ok(!baseManifest.groups[group].includes(adapterTarget), group);
  }

  for (const checker of [
    "scripts/check-ai-workflow.mjs",
    "scripts/check-consumer-chain.mjs",
    "scripts/check-review-context-authority.mjs",
  ]) {
    assert.ok(baseManifest.groups.targetCore.includes(checker), `${checker}:targetCore`);
    assert.ok(baseManifest.groups.targetFull.includes(checker), `${checker}:targetFull`);
    assert.ok(baseManifest.copyRules.files.some((rule) => (
      rule.source === checker && rule.target === checker
    )), `${checker}:copyRule`);
  }
});

test("normalized manifest preserves generated assets", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-manifest-generated-"));
  const targetRoot = path.join(tempRoot, "target");
  try {
    const init = runNode([
      "scripts/init-project.mjs",
      "--starter",
      "generic-project",
      "--target",
      targetRoot,
      "--goal",
      "build a local project that verifies normalized manifest assets",
    ]);
    assert.equal(init.status, 0, checkerOutput(init));

    const expectedTargets = new Set();
    for (const rule of baseManifest.copyRules.directories) {
      const sourceRoot = path.join(kitRoot, rule.source);
      for (const sourceFile of walkFiles(sourceRoot)) {
        const relative = path.relative(sourceRoot, sourceFile);
        expectedTargets.add(path.join(rule.target, relative));
      }
    }
    for (const rule of baseManifest.copyRules.files) expectedTargets.add(rule.target);

    const missingTargets = [...expectedTargets]
      .filter((target) => !fs.existsSync(path.join(targetRoot, target)))
      .sort();
    assert.deepEqual(missingTargets, []);

    const missingWorkflowAssets = baseManifest.groups.workflowVersionAssets
      .filter((target) => !fs.existsSync(path.join(targetRoot, target)))
      .sort();
    assert.deepEqual(missingWorkflowAssets, []);
    assert.equal(fs.existsSync(path.join(targetRoot, ".github/workflows/ai-workflow-checks.yml")), false);
    for (const checker of [
      "scripts/check-ai-workflow.mjs",
      "scripts/check-consumer-chain.mjs",
      "scripts/check-review-context-authority.mjs",
    ]) {
      assert.equal(fs.existsSync(path.join(targetRoot, checker)), true, checker);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
