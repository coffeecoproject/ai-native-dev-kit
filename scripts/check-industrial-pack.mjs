#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { walkFiles } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const selectedOnly = Boolean(args["selected-only"]);
const maturityStages = ["draft", "candidate", "stable", "deprecated", "retired"];
const requiredMaturityDocs = [
  "maturity.md",
  "evidence.md",
  "dogfood.md",
  "false-positive-log.md",
  "owner.md",
  "changelog.md",
];

for (const key of Object.keys(args)) {
  if (!["_", "json", "selected-only"].includes(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

let failed = false;
const checks = [];
const repairHints = [];

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

function hint(message) {
  repairHints.push(message);
  if (!outputJson) console.error(`HINT ${message}`);
}

function installSelectedPacksCommand(packIds) {
  return [
    "node <ai-native-dev-kit>/scripts/init-project.mjs",
    `--target ${projectRoot}`,
    "--update-workflow-assets",
    `--industrial-packs ${[...new Set(packIds)].sort().join(",")}`,
  ].join(" ");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(projectRoot, filePath)} invalid JSON: ${error.message}`);
    return null;
  }
}

function selectedPackIds(root) {
  const selectionPath = path.join(root, "docs", "baseline-selection.md");
  if (!fs.existsSync(selectionPath)) return [];
  const body = sectionBody(fs.readFileSync(selectionPath, "utf8"), "Selected Industrial Packs");
  if (!body) return [];
  return [...new Set([...body.matchAll(/\b[a-z0-9][a-z0-9-]*-industrial\b/gi)]
    .map((match) => match[0]))].sort();
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

function sortedArray(value) {
  return Array.isArray(value) ? [...value].sort() : [];
}

function sameArray(left, right) {
  return JSON.stringify(sortedArray(left)) === JSON.stringify(sortedArray(right));
}

function validateNoProjectFacts(packRoot, packId) {
  const scanned = [
    path.join(packRoot, "pack.md"),
    path.join(packRoot, "pack.json"),
    ...requiredMaturityDocs.map((rel) => path.join(packRoot, rel)),
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

function validateDraftClaims(packRoot, packId, stage) {
  if (stage !== "draft") return;
  const scanned = [
    path.join(packRoot, "pack.md"),
    ...requiredMaturityDocs.map((rel) => path.join(packRoot, rel)),
  ].filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());

  const bannedClaimPatterns = [
    /\bis production[- ]ready\b/i,
    /\bready for production\b/i,
    /\bstable default\b/i,
    /\bfully validated\b/i,
    /\bvalidated for production\b/i,
  ];

  for (const file of scanned) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      const normalized = line.toLowerCase();
      if (normalized.includes("not production-ready")
        || normalized.includes("not stable")
        || normalized.includes("does not prove")
        || normalized.includes("do not mean")
        || normalized.includes("must not")
        || normalized.includes("cannot move")
        || normalized.includes("before stable")) {
        return;
      }
      if (bannedClaimPatterns.some((pattern) => pattern.test(line))) {
        fail(`${packId} draft maturity overclaim in ${path.relative(projectRoot, file)}:${index + 1}`);
      }
    });
  }
  pass(`${packId} draft maturity claim scan`);
}

function validateMaturity(pack, packRoot, context) {
  const maturity = requireObject(pack, "maturity", context);
  if (!maturity || Object.keys(maturity).length === 0) return;

  if (!maturityStages.includes(maturity.stage)) {
    fail(`${context} maturity.stage must be ${maturityStages.join("/")}`);
  }
  if (maturity.stage && pack.status && maturity.stage !== pack.status) {
    fail(`${context} maturity.stage must match status`);
  }
  if (!String(maturity.stageReason || "").trim()) {
    fail(`${context} maturity.stageReason must not be empty`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(maturity.lastMaturityReviewAt || "")) {
    fail(`${context} maturity.lastMaturityReviewAt must use YYYY-MM-DD`);
  }
  if (!String(maturity.reviewedBy || "").trim()) {
    fail(`${context} maturity.reviewedBy must not be empty`);
  }

  for (const key of [
    "evidenceDocs",
    "evidenceSummary",
    "missingEvidenceBeforeCandidate",
    "missingEvidenceBeforeStable",
    "promotionCriteria",
    "demotionTriggers",
    "knownLimitations",
  ]) {
    requireArray(maturity, key, `${context} maturity`, { nonEmpty: true });
  }

  for (const rel of requiredMaturityDocs) {
    if (!Array.isArray(maturity.evidenceDocs) || !maturity.evidenceDocs.includes(rel)) {
      fail(`${context} maturity.evidenceDocs must include ${rel}`);
    }
  }

  for (const rel of maturity.evidenceDocs || []) {
    if (!isSafeRelativePath(rel)) {
      fail(`${context} maturity evidence doc path is unsafe: ${rel}`);
      continue;
    }
    const full = path.join(packRoot, rel);
    if (!fs.existsSync(full)) {
      fail(`${context} missing maturity evidence doc: ${rel}`);
      continue;
    }
    const content = fs.readFileSync(full, "utf8").trim();
    if (!content) fail(`${context} maturity evidence doc is empty: ${rel}`);
    else pass(`${pack.id} ${rel}`);
  }

  if (maturity.stage === "stable" && (maturity.promotionCriteria || []).length < 3) {
    fail(`${context} stable maturity requires explicit promotion criteria`);
  }
}

function validatePackJson(pack, context, packRoot) {
  const requiredKeys = [
    "schemaVersion",
    "packVersion",
    "minimumDevKitVersion",
    "lastReviewedAt",
    "stabilityNotes",
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
    "maturity",
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
  if (!maturityStages.includes(pack.status)) {
    fail(`${context} status must be ${maturityStages.join("/")}`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(pack.packVersion || "")) {
    fail(`${context} packVersion must use semantic version format x.y.z`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(pack.minimumDevKitVersion || "")) {
    fail(`${context} minimumDevKitVersion must use semantic version format x.y.z`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pack.lastReviewedAt || "")) {
    fail(`${context} lastReviewedAt must use YYYY-MM-DD`);
  }
  if (!String(pack.stabilityNotes || "").trim()) {
    fail(`${context} stabilityNotes must not be empty`);
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
  if (packRoot) validateMaturity(pack, packRoot, context);

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
const selectedIds = selectedOnly ? selectedPackIds(projectRoot) : null;
let checkedPacks = 0;
const missingInstalledSelectedPackIds = new Set();

if (index) {
  if (index.schemaVersion !== "0.2") fail("industrial-packs/index.json schemaVersion must be 0.2");
  if (!sameArray(index.maturityStages, maturityStages)) {
    fail(`industrial-packs/index.json maturityStages must be ${maturityStages.join(", ")}`);
  }
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
    if (!["planned", ...maturityStages].includes(item.status)) fail(`${item.id} index status must be planned or ${maturityStages.join("/")}`);
    if (item.status !== "planned" && !maturityStages.includes(item.maturityStage)) {
      fail(`${item.id} index maturityStage must be ${maturityStages.join("/")}`);
    }
    if (!["primary-platform", "capability", "risk-overlay"].includes(item.type)) fail(`${item.id} index type invalid`);
    if (!isSafeRelativePath(item.path)) fail(`${item.id} index path must be safe relative path`);
    if (!item.displayName) fail(`${item.id} index displayName is required`);
    if (!Array.isArray(item.appliesToProfiles)) fail(`${item.id} index appliesToProfiles must be an array`);
  }

  for (const item of packs) {
    if (!item || item.status === "planned") {
      if (!selectedOnly && item?.id) pass(`${item.id} planned pack registered`);
      continue;
    }
    if (selectedOnly && !selectedIds.includes(item.id)) continue;

    const packRoot = path.join(industrialRoot, item.path);
    const packMdPath = path.join(packRoot, "pack.md");
    const packJsonPath = path.join(packRoot, "pack.json");
    if (!fs.existsSync(packMdPath)) {
      fail(`${item.id} missing pack.md`);
      if (selectedOnly) missingInstalledSelectedPackIds.add(item.id);
    } else {
      pass(`${item.id} pack.md`);
    }
    if (!fs.existsSync(packJsonPath)) {
      fail(`${item.id} missing pack.json`);
      if (selectedOnly) missingInstalledSelectedPackIds.add(item.id);
      continue;
    }
    pass(`${item.id} pack.json`);

    const pack = readJson(packJsonPath);
    if (!pack) continue;
    checkedPacks += 1;
    validatePackJson(pack, `${item.id} pack.json`, packRoot);
    if (pack.id !== item.id) fail(`${item.id} pack.json id must match index id`);
    if (pack.displayName !== item.displayName) fail(`${item.id} pack.json displayName must match index displayName`);
    if (pack.type !== item.type) fail(`${item.id} pack.json type must match index type`);
    if (pack.status !== item.status) fail(`${item.id} pack.json status must match index status`);
    if (pack.maturity?.stage !== item.maturityStage) fail(`${item.id} pack.json maturity.stage must match index maturityStage`);
    if (!sameArray(pack.appliesToProfiles, item.appliesToProfiles)) {
      fail(`${item.id} pack.json appliesToProfiles must match index appliesToProfiles`);
    }

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
    validateDraftClaims(packRoot, item.id, pack.maturity?.stage || pack.status);
  }

  if (selectedOnly) {
    for (const selectedId of selectedIds) {
      if (!knownPackIds.has(selectedId)) fail(`selected industrial pack is unknown: ${selectedId}`);
      if (plannedPackIds.has(selectedId)) fail(`selected industrial pack is planned and not executable yet: ${selectedId}`);
    }
    if (selectedIds.length === 0) pass("no selected industrial packs");
  }
}

if (selectedOnly && missingInstalledSelectedPackIds.size > 0) {
  hint(`Install missing selected industrial pack(s): ${installSelectedPacksCommand(missingInstalledSelectedPackIds)}`);
}

if (outputJson) {
  console.log(JSON.stringify({
    projectRoot,
    industrialRoot,
    checkedPacks,
    selectedOnly,
    selectedPacks: selectedIds || null,
    plannedPacks: [...plannedPackIds].sort(),
    repairHints,
    status: failed ? "FAIL" : "PASS",
    checks,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log(`Industrial packs checked: ${checkedPacks}`);
  if (selectedOnly) console.log(`Selected-only mode: ${selectedIds.length > 0 ? selectedIds.join(", ") : "no selected packs"}`);
  console.log("Industrial pack structure is ready.");
}
