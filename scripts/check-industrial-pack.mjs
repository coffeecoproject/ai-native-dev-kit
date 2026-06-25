#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);

for (const key of Object.keys(args)) {
  if (!["_", "json"].includes(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

let failed = false;
const checks = [];

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

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(projectRoot, filePath)} invalid JSON: ${error.message}`);
    return null;
  }
}

function findIndustrialRoot(root) {
  const candidates = [
    path.join(root, "industrial-packs"),
    path.join(root, ".ai-native", "industrial-packs"),
  ];
  return candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.json"))) || candidates[0];
}

function findProfilesRoot(root) {
  const candidates = [
    path.join(root, "profiles"),
    path.join(root, ".ai-native", "profiles"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function isSafeRelativePath(value) {
  return typeof value === "string"
    && value.length > 0
    && !path.isAbsolute(value)
    && !value.split(/[\\/]/).includes("..");
}

function requireArray(object, key, context, options = {}) {
  if (!Array.isArray(object[key])) {
    fail(`${context} ${key} must be an array`);
    return [];
  }
  if (options.nonEmpty && object[key].length === 0) {
    fail(`${context} ${key} must not be empty`);
  }
  return object[key];
}

function requireObject(object, key, context) {
  if (!object[key] || typeof object[key] !== "object" || Array.isArray(object[key])) {
    fail(`${context} ${key} must be an object`);
    return {};
  }
  return object[key];
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else results.push(full);
  }
  return results.sort();
}

function validateNoProjectFacts(packRoot, packId) {
  const scanned = [
    path.join(packRoot, "pack.md"),
    path.join(packRoot, "pack.json"),
    ...walkFiles(path.join(packRoot, "baselines")),
    ...walkFiles(path.join(packRoot, "executions")),
    ...walkFiles(path.join(packRoot, "audit")),
    ...walkFiles(path.join(packRoot, "bootstrap-kit")),
    ...walkFiles(path.join(packRoot, "checklists")),
    ...walkFiles(path.join(packRoot, "templates")),
  ].filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());

  const bannedPatterns = [
    { name: "absolute local user path", pattern: /\/Users\/[A-Za-z0-9._-]+\// },
    { name: "non-example http URL", pattern: /\bhttps?:\/\/(?!(example\.com|example\.invalid|localhost|127\.0\.0\.1)\b)[^\s)]+/i },
    { name: "secret assignment", pattern: /\b(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/i },
    { name: "GitHub token", pattern: /\bgithub_pat_[A-Za-z0-9_]+/ },
    { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: "email address", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
    { name: "bundle identifier", pattern: /\bcom\.[a-z0-9][a-z0-9-]*(?:\.[a-z0-9][a-z0-9-]*){1,}\b/i },
  ];

  for (const file of scanned) {
    const content = fs.readFileSync(file, "utf8");
    for (const { name, pattern } of bannedPatterns) {
      if (pattern.test(content)) {
        fail(`${packId} contains possible project fact or secret (${name}) in ${path.relative(projectRoot, file)}`);
      }
    }
  }
  pass(`${packId} purity scan`);
}

function validatePackJson(pack, context) {
  const requiredKeys = [
    "schemaVersion",
    "id",
    "type",
    "displayName",
    "status",
    "appliesToProfiles",
    "compatiblePacks",
    "conflictsWith",
    "requiredBaselines",
    "requiredExecutionDocs",
    "requiredAuditDocs",
    "requiredChecklists",
    "requiredTemplates",
    "riskMappings",
    "taskLevelEscalation",
    "requiredEvidence",
    "humanApprovalRequiredFor",
  ];
  for (const key of requiredKeys) {
    if (!(key in pack)) fail(`${context} missing ${key}`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*-industrial$/.test(pack.id || "")) {
    fail(`${context} id must end with -industrial and use kebab case`);
  }
  if (!["primary-platform", "capability", "risk-overlay"].includes(pack.type)) {
    fail(`${context} type must be primary-platform, capability, or risk-overlay`);
  }
  if (!["draft", "stable"].includes(pack.status)) {
    fail(`${context} status must be draft or stable`);
  }

  for (const key of [
    "appliesToProfiles",
    "compatiblePacks",
    "conflictsWith",
    "requiredBaselines",
    "requiredExecutionDocs",
    "requiredAuditDocs",
    "requiredChecklists",
    "requiredTemplates",
    "taskLevelEscalation",
    "humanApprovalRequiredFor",
  ]) {
    requireArray(pack, key, context);
  }
  for (const key of ["requiredBaselines", "requiredExecutionDocs", "requiredAuditDocs", "requiredChecklists", "requiredTemplates"]) {
    requireArray(pack, key, context, { nonEmpty: true });
  }
  requireObject(pack, "riskMappings", context);
  requireObject(pack, "requiredEvidence", context);

  for (const item of pack.taskLevelEscalation || []) {
    if (!item || typeof item !== "object") {
      fail(`${context} taskLevelEscalation entries must be objects`);
      continue;
    }
    if (!Array.isArray(item.when) || item.when.length === 0) {
      fail(`${context} taskLevelEscalation entries need non-empty when arrays`);
    }
    if (!["L0", "L1", "L2", "L3"].includes(item.minTaskLevel)) {
      fail(`${context} taskLevelEscalation minTaskLevel must be L0/L1/L2/L3`);
    }
  }
}

const industrialRoot = findIndustrialRoot(projectRoot);
const profilesRoot = findProfilesRoot(projectRoot);
const indexPath = path.join(industrialRoot, "index.json");
const schemaPath = path.join(industrialRoot, "schema", "pack.schema.json");
const selectionSchemaPath = path.join(industrialRoot, "schema", "baseline-selection.schema.json");

if (!outputJson) {
  console.log("# Industrial Pack Check");
  console.log("");
}

if (!fs.existsSync(indexPath)) {
  fail(`missing ${path.relative(projectRoot, indexPath)}`);
} else {
  pass(`${path.relative(projectRoot, indexPath)}`);
}
if (!fs.existsSync(schemaPath)) fail(`missing ${path.relative(projectRoot, schemaPath)}`);
else pass(`${path.relative(projectRoot, schemaPath)}`);
if (!fs.existsSync(selectionSchemaPath)) fail(`missing ${path.relative(projectRoot, selectionSchemaPath)}`);
else pass(`${path.relative(projectRoot, selectionSchemaPath)}`);

const index = fs.existsSync(indexPath) ? readJson(indexPath) : null;
const knownPackIds = new Set();
const plannedPackIds = new Set();
let checkedPacks = 0;

if (index) {
  if (index.schemaVersion !== "0.1") fail("industrial-packs/index.json schemaVersion must be 0.1");
  const packs = requireArray(index, "packs", "industrial-packs/index.json");
  for (const item of packs) {
    if (!item || typeof item !== "object") {
      fail("industrial-packs/index.json pack entries must be objects");
      continue;
    }
    if (!item.id) fail("industrial-packs/index.json pack entry missing id");
    if (knownPackIds.has(item.id)) fail(`duplicate industrial pack id: ${item.id}`);
    knownPackIds.add(item.id);
    if (item.status === "planned") plannedPackIds.add(item.id);
    if (!["planned", "draft", "stable"].includes(item.status)) fail(`${item.id} index status must be planned, draft, or stable`);
    if (!["primary-platform", "capability", "risk-overlay"].includes(item.type)) fail(`${item.id} index type invalid`);
    if (!isSafeRelativePath(item.path)) fail(`${item.id} index path must be safe relative path`);
  }

  for (const item of packs) {
    if (!item || item.status === "planned") {
      if (item?.id) pass(`${item.id} planned pack registered`);
      continue;
    }

    const packRoot = path.join(industrialRoot, item.path);
    const packMdPath = path.join(packRoot, "pack.md");
    const packJsonPath = path.join(packRoot, "pack.json");
    if (!fs.existsSync(packMdPath)) fail(`${item.id} missing pack.md`);
    else pass(`${item.id} pack.md`);
    if (!fs.existsSync(packJsonPath)) {
      fail(`${item.id} missing pack.json`);
      continue;
    }
    pass(`${item.id} pack.json`);

    const pack = readJson(packJsonPath);
    if (!pack) continue;
    checkedPacks += 1;
    validatePackJson(pack, `${item.id} pack.json`);
    if (pack.id !== item.id) fail(`${item.id} pack.json id must match index id`);
    if (pack.type !== item.type) fail(`${item.id} pack.json type must match index type`);
    if (pack.status !== item.status) fail(`${item.id} pack.json status must match index status`);

    for (const profileId of pack.appliesToProfiles || []) {
      if (!fs.existsSync(path.join(profilesRoot, profileId, "profile.md"))) {
        fail(`${item.id} appliesToProfiles references missing profile: ${profileId}`);
      }
    }
    for (const packId of [...(pack.compatiblePacks || []), ...(pack.conflictsWith || [])]) {
      if (!knownPackIds.has(packId)) fail(`${item.id} references unknown industrial pack: ${packId}`);
    }

    for (const rel of [
      ...(pack.requiredBaselines || []),
      ...(pack.requiredExecutionDocs || []),
      ...(pack.requiredAuditDocs || []),
      ...(pack.requiredChecklists || []),
      ...(pack.requiredTemplates || []),
    ]) {
      if (!isSafeRelativePath(rel)) {
        fail(`${item.id} required file path is unsafe: ${rel}`);
        continue;
      }
      const full = path.join(packRoot, rel);
      if (fs.existsSync(full)) pass(`${item.id} ${rel}`);
      else fail(`${item.id} missing ${rel}`);
    }

    for (const dir of ["baselines", "executions", "audit", "bootstrap-kit", "checklists", "templates"]) {
      const full = path.join(packRoot, dir);
      if (fs.existsSync(full) && fs.statSync(full).isDirectory()) pass(`${item.id} ${dir}/`);
      else fail(`${item.id} missing ${dir}/`);
    }
    validateNoProjectFacts(packRoot, item.id);
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    projectRoot,
    industrialRoot,
    checkedPacks,
    plannedPacks: [...plannedPackIds].sort(),
    status: failed ? "FAIL" : "PASS",
    checks,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log(`Industrial packs checked: ${checkedPacks}`);
  console.log("Industrial pack structure is ready.");
}

