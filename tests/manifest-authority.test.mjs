import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");
const manifestPath = path.join(kitRoot, "intentos-manifest.json");
const baseManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: kitRoot,
    encoding: "utf8",
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
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
