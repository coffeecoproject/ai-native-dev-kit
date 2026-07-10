#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { validateSchema } from "./lib/artifact-schema.mjs";
import {
  currentIntentOSVersion,
  diffLists,
  kitRoot,
  manifestGroupNames,
  readJson,
  readText,
  sortedUnique,
} from "./lib/manifest.mjs";
import { assertSafeRelativePath, normalizePortablePath } from "./lib/path-safety.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const manifestPath = args.manifest ? normalizePortablePath(String(args.manifest)) : "intentos-manifest.json";
const schemaPath = args.schema ? normalizePortablePath(String(args.schema)) : "schemas/intentos-manifest.schema.json";
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
  if (!Array.isArray(schema.required)) {
    fail("manifest schema file must define required array");
  } else if (!schema.required.includes("copyRules")) {
    fail("manifest schema file must require copyRules");
  }
  const groupProperties = schema.properties?.groups?.properties;
  if (!groupProperties) {
    fail("manifest schema file must define groups properties");
    return;
  }
  if (!schema.properties?.copyRules?.properties) fail("manifest schema file must define copyRules properties");
  const acceptedGroups = new Set(manifestGroupNames);
  const requiredGroups = schema.properties.groups.required;
  if (!Array.isArray(requiredGroups)) fail("manifest schema file must define required groups");
  for (const groupName of manifestGroupNames) {
    if (!groupProperties[groupName]) {
      fail(`manifest schema file missing group property: ${groupName}`);
    }
    if (Array.isArray(requiredGroups) && !requiredGroups.includes(groupName)) {
      fail(`manifest schema file must require group: ${groupName}`);
    }
  }
  for (const groupName of Object.keys(groupProperties)) {
    if (!acceptedGroups.has(groupName)) {
      fail(`manifest schema file contains unsupported group property: ${groupName}`);
    }
  }
}

function validateManifestAgainstSchema(manifest, schema) {
  if (!manifest || !schema) return;
  const validation = validateSchema(manifest, schema, { label: "manifest schema validation" });
  for (const error of validation.errors) fail(error);
  if (validation.ok) pass(`manifest validates against ${schemaPath} with strict artifact schema validation`);
}

function validateManifestDomain(manifest) {
  if (manifest.compatibilityPolicy?.phase !== manifest.intentOSVersion) {
    fail(`manifest schema validation: compatibilityPolicy.phase ${manifest.compatibilityPolicy?.phase || "<missing>"} must match intentOSVersion ${manifest.intentOSVersion}`);
  }

  for (const groupName of manifestGroupNames) {
    validatePathList(manifest.groups[groupName], `manifest domain validation: groups.${groupName}`);
  }

  validateRuleList(manifest.copyRules.directories, "manifest domain validation: copyRules.directories");
  validateRuleList(manifest.copyRules.files, "manifest domain validation: copyRules.files");
}

function validatePathList(group, label) {
  for (const item of group) {
    try {
      assertSafeRelativePath(item, label);
    } catch (error) {
      fail(error.message);
    }
  }
}

function validateRuleList(rules, label) {
  for (const rule of rules) {
    for (const key of ["source", "target"]) {
      try {
        assertSafeRelativePath(rule[key], `${label}.${key}`);
      } catch (error) {
        fail(error.message);
      }
    }
  }
}

function checkCopyRuleNormalization(manifest) {
  const directoryRules = manifest.copyRules.directories.map((rule, index) => ({
    ...rule,
    source: normalizePortablePath(rule.source),
    target: normalizePortablePath(rule.target),
    kind: "directory",
    index,
  }));
  const fileRules = manifest.copyRules.files.map((rule, index) => ({
    ...rule,
    source: normalizePortablePath(rule.source),
    target: normalizePortablePath(rule.target),
    kind: "file",
    index,
  }));
  const rules = [...directoryRules, ...fileRules];
  const targetOwners = new Map();

  for (const rule of rules) {
    const existing = targetOwners.get(rule.target);
    if (!existing) {
      targetOwners.set(rule.target, rule);
      continue;
    }
    if (existing.source === rule.source) {
      fail(`manifest copy rules contain exact duplicate target ${rule.target}: ${rule.source}`);
    } else {
      fail(`manifest copy rules contain conflicting target ${rule.target}: ${existing.source} and ${rule.source}`);
    }
  }

  for (const parent of directoryRules) {
    const targetPrefix = `${parent.target.replace(/\/$/, "")}/`;
    for (const child of rules) {
      if (child.kind === parent.kind && child.index === parent.index) continue;
      if (!child.target.startsWith(targetPrefix)) continue;
      const relativeTarget = child.target.slice(targetPrefix.length);
      const inheritedSource = path.posix.join(parent.source, relativeTarget);
      if (child.source === inheritedSource) {
        fail(`manifest copy rules contain redundant ancestor-child mapping: ${parent.source} -> ${parent.target} covers ${child.source} -> ${child.target}`);
      } else {
        fail(`manifest copy rules contain conflicting target-space overlap: ${parent.source} -> ${parent.target} covers target ${child.target}, but the nested rule uses source ${child.source} instead of ${inheritedSource}`);
      }
    }
  }

  if (!failed) pass("manifest copy rule targets are unique and ancestor-normalized");
}

function checkVersion(manifest) {
  const currentVersion = currentIntentOSVersion(projectRoot);
  if (manifest.intentOSVersion === currentVersion) {
    pass(`manifest intentOSVersion matches VERSION.md (${currentVersion})`);
  } else {
    fail(`manifest intentOSVersion ${manifest.intentOSVersion} does not match VERSION.md ${currentVersion}`);
  }
}

function checkSourceRequiredAssets(manifest) {
  for (const asset of sortedUnique(manifest.groups.sourceRequired || [])) {
    if (!fs.existsSync(path.join(projectRoot, asset))) {
      fail(`manifest sourceRequired asset missing: ${asset}`);
      continue;
    }
  }
  if (!failed) pass("manifest sourceRequired assets exist");
}

function checkCopyRules(manifest) {
  for (const rule of manifest.copyRules.directories || []) {
    const source = path.join(projectRoot, rule.source);
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
      fail(`manifest copyRules.directories source missing directory: ${rule.source}`);
    }
  }
  for (const rule of manifest.copyRules.files || []) {
    const source = path.join(projectRoot, rule.source);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
      fail(`manifest copyRules.files source missing file: ${rule.source}`);
    }
  }
  if (!failed) pass("manifest copy rule sources exist");

  const targets = sortedUnique([
    ...(manifest.copyRules.directories || []).map((rule) => rule.target),
    ...(manifest.copyRules.files || []).map((rule) => rule.target),
  ]);
  for (const requiredTarget of [
    ".intentos/intentos-manifest.json",
    "scripts/lib/manifest.mjs",
    "scripts/check-ai-workflow.mjs",
    "scripts/workflow-next.mjs",
    ".github/workflows/ai-workflow-checks.yml",
  ]) {
    if (targets.includes(requiredTarget)) {
      pass(`manifest copy rules include ${requiredTarget}`);
    } else {
      fail(`manifest copy rules must include ${requiredTarget}`);
    }
  }
}

function checkTargetGroups(manifest) {
  const targetCore = sortedUnique(manifest.groups.targetCore || []);
  const targetFull = sortedUnique(manifest.groups.targetFull || []);
  const targetFullSet = new Set(targetFull);
  const missingFromFull = targetCore.filter((item) => !targetFullSet.has(item));
  if (missingFromFull.length === 0) {
    pass("manifest targetCore is a subset of targetFull");
  } else {
    fail(`manifest targetFull missing targetCore path(s): ${missingFromFull.join(", ")}`);
  }

  for (const requiredTarget of [".intentos/intentos-manifest.json", "scripts/lib/manifest.mjs"]) {
    if (targetCore.includes(requiredTarget) && targetFull.includes(requiredTarget)) {
      pass(`manifest target groups include ${requiredTarget}`);
    } else {
      fail(`manifest target groups must include ${requiredTarget}`);
    }
  }
}

function checkWorkflowVersionAssets(manifest) {
  const templateAssets = sortedUnique(readJson(projectRoot, "templates/workflow-version.json").workflowAssets || []);
  const manifestAssets = sortedUnique(manifest.groups.workflowVersionAssets || []);
  const comparison = diffLists(manifestAssets, templateAssets);
  if (comparison.missing.length === 0 && comparison.extra.length === 0) {
    pass("templates/workflow-version.json matches manifest workflowVersionAssets");
  } else {
    if (comparison.missing.length > 0) {
      fail(`templates/workflow-version.json missing manifest workflow asset(s): ${comparison.missing.join(", ")}`);
    }
    if (comparison.extra.length > 0) {
      fail(`templates/workflow-version.json has non-manifest workflow asset(s): ${comparison.extra.join(", ")}`);
    }
  }
}

function walkFiles(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = normalizePortablePath(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) {
      output.push(...walkFiles(relativePath));
    } else {
      output.push(relativePath);
    }
  }
  return output;
}

function isImportantSourceAsset(file) {
  if (/^(core|templates|prompts|checklists|docs|profiles|platforms)\//.test(file)) {
    return /\.(md|json|yml)$/.test(file);
  }
  if (/^scripts\//.test(file)) {
    return /\.(mjs|md)$/.test(file);
  }
  if (/^\.github\/workflows\//.test(file)) {
    return /\.yml$/.test(file);
  }
  return [
    "README.md",
    "README.zh-CN.md",
    "VERSION.md",
    "package.json",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "LICENSE.md",
    "LICENSE-FAQ.md",
    "LICENSE-COMMERCIAL.md",
    ".github/CODEOWNERS",
    ".github/pull_request_template.md",
  ].includes(file);
}

function checkManifestReverseDrift(manifest) {
  const exactCoverage = new Set([
    ...(manifest.groups.sourceRequired || []),
    ...(manifest.copyRules.files || []).map((rule) => rule.source),
  ].map(normalizePortablePath));
  const directoryCoverage = sortedUnique((manifest.copyRules.directories || []).map((rule) => rule.source));
  const candidates = sortedUnique([
    ...[
      "README.md",
      "README.zh-CN.md",
      "VERSION.md",
      "package.json",
      "SECURITY.md",
      "CONTRIBUTING.md",
      "LICENSE.md",
      "LICENSE-FAQ.md",
      "LICENSE-COMMERCIAL.md",
      ".github/CODEOWNERS",
      ".github/pull_request_template.md",
    ].filter((file) => fs.existsSync(path.join(projectRoot, file))),
    ...walkFiles(".github/workflows"),
    ...walkFiles("core"),
    ...walkFiles("templates"),
    ...walkFiles("prompts"),
    ...walkFiles("checklists"),
    ...walkFiles("docs"),
    ...walkFiles("profiles"),
    ...walkFiles("platforms"),
    ...walkFiles("scripts"),
  ]).filter(isImportantSourceAsset);

  const missing = candidates.filter((file) => {
    if (exactCoverage.has(file)) return false;
    return !directoryCoverage.some((dir) => file.startsWith(`${dir.replace(/\/$/, "")}/`));
  });
  if (missing.length === 0) {
    pass("manifest reverse drift guard covers important source assets");
  } else {
    fail(`manifest reverse drift guard missing important source asset(s): ${missing.join(", ")}`);
  }
}

function checkScriptConsumption() {
  const consumers = [
    ["scripts/check-ai-workflow.mjs", "targetRequiredPaths(projectRoot, workflowMode"],
    ["scripts/workflow-next.mjs", "manifestWorkflowRequiredPaths(projectRoot"],
    ["scripts/check-intentos.mjs", "sourceRequiredPaths(kitRoot"],
    ["scripts/init-project.mjs", "manifestCopyRules(kitRoot"],
    ["scripts/init-project.mjs", "workflowVersionAssets(kitRoot"],
    ["scripts/init-project.mjs", "manifestGroup(kitRoot, \"workflowDirs\""],
  ];
  for (const [file, marker] of consumers) {
    const content = readText(projectRoot, file);
    if (content.includes(marker)) {
      pass(`${file} consumes authoritative manifest marker`);
    } else {
      fail(`${file} missing authoritative manifest marker: ${marker}`);
    }
  }
}

if (projectRoot !== kitRoot && !fs.existsSync(path.join(projectRoot, "scripts", "check-intentos.mjs"))) {
  fail("check-manifest must run at the intentos repository root");
  exitIfFailed();
}

const schema = loadJsonOrFail(schemaPath, "manifest schema");
const manifest = loadJsonOrFail(manifestPath, "manifest");
exitIfFailed();

validateManifestAgainstSchema(manifest, schema);
exitIfFailed();

validateSchemaFile(schema);
validateManifestDomain(manifest);
checkCopyRuleNormalization(manifest);
exitIfFailed();

checkVersion(manifest);
checkSourceRequiredAssets(manifest);
checkCopyRules(manifest);
checkTargetGroups(manifest);
checkWorkflowVersionAssets(manifest);
checkManifestReverseDrift(manifest);
checkScriptConsumption();

emitJsonIfNeeded();
if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Manifest check passed.");
}
