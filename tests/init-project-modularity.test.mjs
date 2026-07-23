import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entryPath = path.join(kitRoot, "scripts/init-project.mjs");
const moduleRoot = path.join(kitRoot, "scripts/init-project");
const moduleFiles = ["assets.mjs", "plan.mjs", "apply.mjs", "cli.mjs"];

test("init-project keeps one thin executable and an acyclic domain module graph", async () => {
  const entry = fs.readFileSync(entryPath, "utf8");
  assert.ok(entry.split("\n").length <= 6, "public executable entry must remain thin");
  assert.match(entry, /^#!\/usr\/bin\/env node\n\nimport "\.\/init-project\/cli\.mjs";\n$/);

  const modules = Object.fromEntries(moduleFiles.map((file) => [file, fs.readFileSync(path.join(moduleRoot, file), "utf8")]));
  assert.doesNotMatch(modules["assets.mjs"], /from "\.\/(?:plan|apply|cli)\.mjs"/);
  assert.match(modules["plan.mjs"], /from "\.\/assets\.mjs"/);
  assert.doesNotMatch(modules["plan.mjs"], /from "\.\/(?:apply|cli)\.mjs"/);
  assert.match(modules["apply.mjs"], /from "\.\/assets\.mjs"/);
  assert.match(modules["apply.mjs"], /from "\.\/plan\.mjs"/);
  assert.doesNotMatch(modules["apply.mjs"], /from "\.\/cli\.mjs"/);
  for (const dependency of ["assets", "plan", "apply"]) {
    assert.match(modules["cli.mjs"], new RegExp(`from "\\./${dependency}\\.mjs"`));
  }

  for (const file of moduleFiles.slice(0, -1)) {
    const loaded = await import(`${pathToFileURL(path.join(moduleRoot, file)).href}?modularity=${Date.now()}-${file}`);
    assert.ok(Object.keys(loaded).length > 0, `${file} must expose an explicit internal contract`);
  }
});

test("init-project domain modules remain Manifest-authoritative source assets", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(kitRoot, "intentos-manifest.json"), "utf8"));
  const sourceRequired = new Set(manifest.groups.sourceRequired || []);
  const scripts = new Set(manifest.groups.scripts || []);
  for (const file of moduleFiles) {
    const relative = `scripts/init-project/${file}`;
    assert.equal(sourceRequired.has(relative), true, `${relative}:sourceRequired`);
    assert.equal(scripts.has(relative), true, `${relative}:scripts`);
  }
});

test("project verification scripts syntax-check and exercise init-project modules", () => {
  const scripts = JSON.parse(fs.readFileSync(path.join(kitRoot, "package.json"), "utf8")).scripts;
  for (const file of moduleFiles) {
    assert.match(scripts["verify:syntax"], new RegExp(`node --check scripts/init-project/${file.replace(".", "\\.")}`));
  }
  assert.match(scripts["verify:project-entry"], /tests\/init-project-modularity\.test\.mjs/);
});
