#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
  const optionalAdapterTargets = new Set([".github/workflows/ai-workflow-checks.yml"]);
  const requiredTemplateAssets = templateAssets.filter((asset) => !optionalAdapterTargets.has(asset));
  const comparison = diffLists(manifestAssets, requiredTemplateAssets);
  if (comparison.missing.length === 0 && comparison.extra.length === 0) {
    pass("templates/workflow-version.json matches default manifest workflowVersionAssets after optional adapters are excluded");
  } else {
    if (comparison.missing.length > 0) {
      fail(`templates/workflow-version.json missing manifest workflow asset(s): ${comparison.missing.join(", ")}`);
    }
    if (comparison.extra.length > 0) {
      fail(`templates/workflow-version.json has non-manifest workflow asset(s): ${comparison.extra.join(", ")}`);
    }
  }
}

function checkOptionalPlatformAdapters(manifest) {
  const adapterSource = "platforms/github/ci-ai-workflow.yml";
  const adapterTarget = ".github/workflows/ai-workflow-checks.yml";
  const platformAdapters = new Set(manifest.groups.platformAdapters || []);
  const sourceRequired = new Set(manifest.groups.sourceRequired || []);
  if (platformAdapters.has(adapterSource) && sourceRequired.has(adapterSource)) {
    pass("GitHub-hosted workflow remains a source-required optional platform adapter");
  } else {
    fail("GitHub-hosted workflow must remain registered as a source-required optional platform adapter");
  }

  const copiedTargets = new Set([
    ...(manifest.copyRules.directories || []).map((rule) => rule.target),
    ...(manifest.copyRules.files || []).map((rule) => rule.target),
  ]);
  const unconditionalGroups = ["targetCore", "targetFull", "workflowVersionAssets"]
    .filter((group) => (manifest.groups[group] || []).includes(adapterTarget));
  const copiedAdapter = (manifest.copyRules.files || []).some((rule) => (
    rule.source === adapterSource || rule.target === adapterTarget
  ));
  if (!copiedTargets.has(adapterTarget) && !copiedAdapter && unconditionalGroups.length === 0) {
    pass("GitHub-hosted workflow is absent from unconditional target distribution");
  } else {
    fail(`GitHub-hosted workflow must be optional, not default-distributed${unconditionalGroups.length > 0 ? ` via ${unconditionalGroups.join(", ")}` : ""}`);
  }

  const targetCore = new Set(manifest.groups.targetCore || []);
  const targetFull = new Set(manifest.groups.targetFull || []);
  for (const checker of [
    "scripts/check-ai-workflow.mjs",
    "scripts/check-consumer-chain.mjs",
    "scripts/check-review-context-authority.mjs",
  ]) {
    if (copiedTargets.has(checker) && targetCore.has(checker) && targetFull.has(checker)) {
      pass(`local core checker remains default-distributed: ${checker}`);
    } else {
      fail(`local core checker must remain default-distributed: ${checker}`);
    }
  }
}

function walkFiles(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if ([".DS_Store", ".localized"].includes(entry.name)) continue;
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
  if (/^schemas\//.test(file)) {
    return /\.json$/.test(file);
  }
  if (/^tests\//.test(file)) {
    return /\.test\.mjs$/.test(file);
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

function checkManifestCandidateAuthority(manifest, candidate) {
  if (candidate.error) {
    fail(`manifest Git candidate is unreadable: ${candidate.error}`);
    return;
  }

  const declaredFiles = sortedUnique([
    ...(manifest.groups.sourceRequired || []),
    ...(manifest.copyRules.files || []).map((rule) => rule.source),
    ...(manifest.copyRules.directories || []).flatMap((rule) => walkFiles(rule.source)),
  ].map(normalizePortablePath));
  const outsideCandidate = declaredFiles.filter((file) => !candidate.files.has(file));
  if (outsideCandidate.length > 0) {
    fail(`manifest declared source asset(s) are not staged/tracked Git candidates: ${outsideCandidate.join(", ")}`);
    return;
  }

  const emptyCandidateDirectories = (manifest.copyRules.directories || [])
    .map((rule) => normalizePortablePath(rule.source))
    .filter((directory) => !declaredFiles.some((file) => file.startsWith(`${directory.replace(/\/$/, "")}/`)));
  if (emptyCandidateDirectories.length > 0) {
    fail(`manifest copy rule director${emptyCandidateDirectories.length === 1 ? "y has" : "ies have"} no staged/tracked source files: ${emptyCandidateDirectories.join(", ")}`);
    return;
  }

  pass("manifest sourceRequired and copy rule sources belong to the staged/tracked Git candidate");
}

function checkManifestReverseDrift(manifest, candidateFiles) {
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
    ...walkFiles("schemas"),
    ...walkFiles("tests"),
  ]).filter((file) => isImportantSourceAsset(file) && candidateFiles.has(file));

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

function localModuleReferences(relativeFile) {
  const fullPath = path.join(projectRoot, relativeFile);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return [];
  const content = fs.readFileSync(fullPath, "utf8");
  const references = [];
  const pattern = /(?:\bfrom\s*|\bimport\s*\()\s*["']([^"']+)["']/g;
  for (const match of content.matchAll(pattern)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    let resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relativeFile), specifier));
    if (!path.posix.extname(resolved)) resolved += ".mjs";
    references.push(normalizePortablePath(resolved));
  }
  return sortedUnique(references);
}

function packageScriptReferences() {
  const packageJson = loadJsonOrFail("package.json", "package metadata");
  if (!packageJson) return [];
  const references = [];
  for (const command of Object.values(packageJson.scripts || {})) {
    for (const match of String(command).matchAll(/\bscripts\/[A-Za-z0-9_./-]+\.mjs\b/g)) {
      references.push(normalizePortablePath(match[0]));
    }
  }
  return sortedUnique(references);
}

function checkRuntimeDependencyClosure(manifest, candidateFiles) {
  const copySources = new Set((manifest.copyRules.files || [])
    .map((rule) => normalizePortablePath(rule.source)));
  const workflowAssets = new Set((manifest.groups.workflowVersionAssets || [])
    .map(normalizePortablePath));
  const sourceCoverage = new Set([
    ...(manifest.groups.sourceRequired || []),
    ...copySources,
  ].map(normalizePortablePath));
  const distributedRoots = [...copySources].filter((file) => file.endsWith(".mjs"));
  const queue = [...distributedRoots];
  const visited = new Set();
  const dependencies = new Set();
  const missingFiles = [];

  while (queue.length > 0) {
    const current = queue.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const fullPath = path.join(projectRoot, current);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      missingFiles.push(current);
      continue;
    }
    for (const dependency of localModuleReferences(current)) {
      dependencies.add(dependency);
      queue.push(dependency);
    }
  }

  const undistributed = [...dependencies]
    .filter((dependency) => !copySources.has(dependency) || !workflowAssets.has(dependency))
    .sort();
  const packageReferences = packageScriptReferences();
  const undeclaredPackageReferences = packageReferences
    .filter((dependency) => !sourceCoverage.has(dependency))
    .sort();
  const outsideCandidate = [...new Set([...dependencies, ...packageReferences])]
    .filter((dependency) => !candidateFiles.has(dependency))
    .sort();

  if (missingFiles.length > 0) {
    fail(`manifest runtime dependency file(s) are missing: ${sortedUnique(missingFiles).join(", ")}`);
  }
  if (undistributed.length > 0) {
    fail(`manifest runtime dependencies must be copied and workflow-version managed: ${undistributed.join(", ")}`);
  }
  if (undeclaredPackageReferences.length > 0) {
    fail(`package runtime script reference(s) are absent from manifest source coverage: ${undeclaredPackageReferences.join(", ")}`);
  }
  if (outsideCandidate.length > 0) {
    fail(`runtime dependency reference(s) are not staged/tracked Git candidates: ${outsideCandidate.join(", ")}`);
  }
  if (missingFiles.length === 0
    && undistributed.length === 0
    && undeclaredPackageReferences.length === 0
    && outsideCandidate.length === 0) {
    pass("manifest closes distributed imports and package runtime script references over the staged/tracked candidate");
  }
}

function gitCandidateFiles() {
  const result = spawnSync("git", ["-C", projectRoot, "ls-files", "--cached", "-z"], {
    encoding: "buffer",
    maxBuffer: 1024 * 1024 * 32,
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GIT_PAGER: "cat",
    },
  });
  if (result.status !== 0 || result.error) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString("utf8").trim() : "";
    return {
      files: new Set(),
      error: result.error?.message || stderr || `git ls-files exited with status ${result.status}`,
    };
  }
  return {
    files: new Set(
      result.stdout.toString("utf8")
      .split("\0")
      .map(normalizePortablePath)
      .filter(Boolean),
    ),
    error: null,
  };
}

function checkScriptConsumption() {
  const consumers = [
    ["scripts/check-ai-workflow.mjs", "targetRequiredPaths(projectRoot, workflowMode"],
    ["scripts/workflow-next.mjs", "manifestWorkflowRequiredPaths(projectRoot"],
    ["scripts/self-check/foundation.mjs", "sourceRequiredPaths(kitRoot"],
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
checkOptionalPlatformAdapters(manifest);
const gitCandidate = gitCandidateFiles();
checkManifestCandidateAuthority(manifest, gitCandidate);
if (!gitCandidate.error) {
  checkManifestReverseDrift(manifest, gitCandidate.files);
  checkRuntimeDependencyClosure(manifest, gitCandidate.files);
}
checkScriptConsumption();

emitJsonIfNeeded();
if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Manifest check passed.");
}
