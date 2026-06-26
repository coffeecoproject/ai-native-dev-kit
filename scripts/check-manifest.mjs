#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  currentDevKitVersion,
  diffLists,
  extractConstStringArray,
  extractPropertyStringArray,
  kitRoot,
  loadManifest,
  manifestGroupNames,
  normalizePath,
  readJson,
  readText,
  sortedUnique,
} from "./lib/manifest.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const manifestPath = args.manifest ? normalizePath(String(args.manifest)) : "dev-kit-manifest.json";
const schemaPath = args.schema ? normalizePath(String(args.schema)) : "schemas/dev-kit-manifest.schema.json";
const outputJson = Boolean(args.json);
const knownFlags = new Set(["manifest", "schema", "json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

let failed = false;
const results = [];

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function pass(message) {
  results.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  results.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function exitIfFailed() {
  if (!failed) return;
  emitJsonIfNeeded();
  process.exit(1);
}

function emitJsonIfNeeded() {
  if (!outputJson) return;
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    manifest: manifestPath,
    schema: schemaPath,
    results,
  }, null, 2));
}

function loadJsonOrFail(relativePath, label) {
  const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(projectRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`${label} not found: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function validateSchemaFile(schema) {
  if (!schema) return;
  if (schema.type !== "object") fail("manifest schema file must define type object");
  if (!Array.isArray(schema.required)) fail("manifest schema file must define required array");
  if (!schema.properties?.groups?.properties) fail("manifest schema file must define groups properties");
  for (const groupName of manifestGroupNames) {
    if (!schema.properties?.groups?.properties?.[groupName]) {
      fail(`manifest schema file missing group property: ${groupName}`);
    }
  }
}

function validateManifestShape(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("manifest schema validation: manifest must be an object");
    return;
  }
  if (manifest.schemaVersion !== "1.0") {
    fail("manifest schema validation: schemaVersion must be 1.0");
  }
  if (typeof manifest.devKitVersion !== "string" || manifest.devKitVersion.length === 0) {
    fail("manifest schema validation: devKitVersion must be a non-empty string");
  }
  if (manifest.mode !== "read-only") {
    fail("manifest schema validation: mode must be read-only for phase 0.35.0");
  }
  if (manifest.compatibilityPolicy?.readOnly !== true) {
    fail("manifest schema validation: compatibilityPolicy.readOnly must be true");
  }
  if (manifest.compatibilityPolicy?.authoritative !== false) {
    fail("manifest schema validation: compatibilityPolicy.authoritative must be false");
  }
  if (!manifest.groups || typeof manifest.groups !== "object" || Array.isArray(manifest.groups)) {
    fail("manifest schema validation: groups must be an object");
    return;
  }

  for (const groupName of manifestGroupNames) {
    const group = manifest.groups[groupName];
    if (!Array.isArray(group)) {
      fail(`manifest schema validation: groups.${groupName} must be an array`);
      continue;
    }
    const seen = new Set();
    for (const item of group) {
      if (typeof item !== "string" || item.length === 0) {
        fail(`manifest schema validation: groups.${groupName} contains a non-empty string violation`);
        continue;
      }
      if (path.isAbsolute(item) || item.includes("\\")) {
        fail(`manifest schema validation: groups.${groupName} contains non-portable path ${item}`);
      }
      if (seen.has(item)) {
        fail(`manifest schema validation: groups.${groupName} contains duplicate ${item}`);
      }
      seen.add(item);
    }
  }
}

function sourceRequiredFromCheckDevKit() {
  const content = readText(projectRoot, "scripts/check-dev-kit.mjs");
  return extractConstStringArray(content, "required");
}

function targetPathsFromCheckAiWorkflow(constName) {
  const content = readText(projectRoot, "scripts/check-ai-workflow.mjs");
  return extractConstStringArray(content, constName);
}

function workflowAssetsFromInitProject() {
  const content = readText(projectRoot, "scripts/init-project.mjs");
  return extractPropertyStringArray(content, "workflowAssets");
}

function workflowAssetsFromTemplate() {
  return sortedUnique(readJson(projectRoot, "templates/workflow-version.json").workflowAssets || []);
}

function groupFromPrefix(paths, prefix) {
  return sortedUnique(paths.filter((item) => item.startsWith(prefix)));
}

function workflowDirsFromTarget(paths) {
  return sortedUnique(paths.filter((item) => !item.includes("/") && !path.extname(item)));
}

function industrialPackRegistryFromSource(paths) {
  const registry = new Set([
    "industrial-packs/README.md",
    "industrial-packs/selection-guide.md",
    "industrial-packs/index.json",
    "industrial-packs/schema/pack.schema.json",
    "industrial-packs/schema/baseline-selection.schema.json",
    "industrial-pack-candidates/README.md",
    "industrial-pack-candidates/web-app/README.md",
  ]);
  return sortedUnique(paths.filter((item) => registry.has(item)));
}

function expectedGroups() {
  const sourceRequired = sourceRequiredFromCheckDevKit();
  const targetCore = targetPathsFromCheckAiWorkflow("coreRequiredPaths");
  const targetFull = targetPathsFromCheckAiWorkflow("fullRequiredPaths");
  return {
    sourceRequired,
    targetCore,
    targetFull,
    aiNativeCore: groupFromPrefix(targetFull, ".ai-native/core/"),
    templates: groupFromPrefix(sourceRequired, "templates/"),
    prompts: groupFromPrefix(sourceRequired, "prompts/"),
    checklists: groupFromPrefix(sourceRequired, "checklists/"),
    profiles: groupFromPrefix(sourceRequired, "profiles/"),
    industrialPackRegistry: industrialPackRegistryFromSource(sourceRequired),
    workflowDirs: workflowDirsFromTarget(targetCore),
    scripts: groupFromPrefix(sourceRequired, "scripts/"),
    platformAdapters: groupFromPrefix(sourceRequired, "platforms/"),
    examples: groupFromPrefix(sourceRequired, "examples/"),
    fixtures: groupFromPrefix(sourceRequired, "test-fixtures/"),
    workflowVersionAssets: workflowAssetsFromTemplate(),
  };
}

function checkGroupDrift(manifest) {
  const expected = expectedGroups();
  for (const groupName of manifestGroupNames) {
    const actual = sortedUnique(manifest.groups[groupName] || []);
    const comparison = diffLists(expected[groupName] || [], actual);
    if (comparison.missing.length === 0 && comparison.extra.length === 0) {
      pass(`manifest group ${groupName} matches current source`);
      continue;
    }
    if (comparison.missing.length > 0) {
      fail(`manifest group ${groupName} missing: ${comparison.missing.join(", ")}`);
    }
    if (comparison.extra.length > 0) {
      fail(`manifest group ${groupName} extra: ${comparison.extra.join(", ")}`);
    }
  }

  const initProjectWorkflowAssets = workflowAssetsFromInitProject();
  const templateWorkflowAssets = workflowAssetsFromTemplate();
  const workflowAssetsComparison = diffLists(templateWorkflowAssets, initProjectWorkflowAssets);
  if (workflowAssetsComparison.missing.length === 0 && workflowAssetsComparison.extra.length === 0) {
    pass("init-project workflowAssets match templates/workflow-version.json");
  } else {
    if (workflowAssetsComparison.missing.length > 0) {
      fail(`init-project workflowAssets missing template asset(s): ${workflowAssetsComparison.missing.join(", ")}`);
    }
    if (workflowAssetsComparison.extra.length > 0) {
      fail(`init-project workflowAssets extra asset(s): ${workflowAssetsComparison.extra.join(", ")}`);
    }
  }
}

function checkVersion(manifest) {
  const currentVersion = currentDevKitVersion(projectRoot);
  if (manifest.devKitVersion === currentVersion) {
    pass(`manifest devKitVersion matches VERSION.md (${currentVersion})`);
  } else {
    fail(`manifest devKitVersion ${manifest.devKitVersion} does not match VERSION.md ${currentVersion}`);
  }
}

if (projectRoot !== kitRoot && !fs.existsSync(path.join(projectRoot, "scripts", "check-dev-kit.mjs"))) {
  fail("check-manifest must run at the dev-kit repository root");
  exitIfFailed();
}

const schema = loadJsonOrFail(schemaPath, "manifest schema");
validateSchemaFile(schema);
exitIfFailed();

const manifest = loadJsonOrFail(manifestPath, "manifest");
validateManifestShape(manifest);
exitIfFailed();

checkVersion(manifest);
checkGroupDrift(manifest);

emitJsonIfNeeded();
if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Manifest check passed.");
}
