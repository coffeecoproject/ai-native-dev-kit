#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/work-queue-takeover.schema.json");
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/existing-project-work-queue-takeover.md",
  "docs/existing-project-work-queue-takeover.md",
  "templates/work-queue-takeover-report.md",
  "schemas/artifacts/work-queue-takeover.schema.json",
  "checklists/work-queue-takeover-review.md",
  "prompts/work-queue-takeover-agent.md",
  "scripts/resolve-work-queue-takeover.mjs",
  "scripts/check-work-queue-takeover.mjs",
];
const requiredDirectories = ["work-queue-takeover-reports"];
const requiredSections = [
  "Human Summary",
  "Source Inventory",
  "Reliability Assessment",
  "Migration Dispositions",
  "Queue Items",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const forbiddenClaims = [
  /\bFULL_ADOPTION\b(?![:\s]*(No|Blocked|cannot|not))/i,
  /\bnative\s+apply\s+(approved|authorized|ready|allowed)\b/i,
  /\bimplementation\s+(approved|authorized)\b/i,
  /\bold\s+(todo|task)\s+(can\s+)?execute\s+directly\b/i,
  /\bdelete(d|s)?\s+old\s+task\s+sources?:\s*yes\b/i,
  /\bwrites?\s+target\s+files?:\s*yes\b/i,
  /\bapproves?\s+(commit|push|release|production)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Work Queue Takeover Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();
emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/existing-project-work-queue-takeover.md"),
    readResolved("docs/existing-project-work-queue-takeover.md"),
    readResolved("templates/work-queue-takeover-report.md"),
    readResolved("schemas/artifacts/work-queue-takeover.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Existing Project Work Queue Takeover",
    "RELIABLE_EXISTING_TASK_SYSTEM",
    "MESSY_TASK_SYSTEM",
    "MISSING_TASK_SYSTEM",
    "UNSAFE_TO_TAKE_OVER",
    "MIGRATE_CURRENT",
    "ARCHIVE_SOURCE_ONLY",
    "can_execute_from_old_todo_directly",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`work queue takeover docs include ${marker}`);
    else fail(`work queue takeover docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("work-queue-takeover-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("work queue takeover check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Work Queue Takeover reports found");
    else pass("SKIPPED_NO_REPORT: no Work Queue Takeover reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Work Queue Takeover report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const scanContent = contentForForbiddenScan(content);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(scanContent)) fail(`${label} contains forbidden takeover claim: ${pattern.source}`);
  }

  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "work_queue_takeover_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, result.value);
}

function checkStructuredEvidence(content, label, file, evidence) {
  if (reportRefCandidates(file).includes(evidence.work_queue_takeover_ref)) pass(`${label} work_queue_takeover_ref points to this report`);
  else fail(`${label} work_queue_takeover_ref ${evidence.work_queue_takeover_ref || "<missing>"} must point to this report`);

  if (evidence.outcome && stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} outcome matches Markdown`);
  else fail(`${label} Outcome must include structured outcome`);

  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["deletes_old_task_sources", "No"],
    ["approves_implementation", "No"],
    ["approves_completion", "No"],
    ["approves_commit_or_push", "No"],
    ["approves_release_or_production", "No"],
    ["claims_full_adoption", "No"],
    ["installs_native_assets", "No"],
  ]) {
    if (evidence.boundaries?.[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }
  if (evidence.readiness?.can_codex_write_now === "No") pass(`${label} can_codex_write_now is No`);
  else fail(`${label} can_codex_write_now must be No`);
  if (evidence.readiness?.can_execute_from_old_todo_directly === "No") pass(`${label} old TODO cannot execute directly`);
  else fail(`${label} can_execute_from_old_todo_directly must be No`);

  checkClassConsistency(label, evidence);
  checkSourceCoverage(label, evidence);
  checkQueueItems(label, evidence);
}

function checkClassConsistency(label, evidence) {
  const taskClass = evidence.project_task_system_class;
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") {
    requireValue(label, evidence.recommended_action, "MAP_EXISTING_TASK_SYSTEM", "reliable existing system action");
    requireValue(label, evidence.future_task_authority, "PROJECT_NATIVE_MAPPED", "reliable existing system authority");
    requireValue(label, evidence.outcome, "MAPPED_EXISTING_SYSTEM", "reliable existing system outcome");
  } else if (taskClass === "MESSY_TASK_SYSTEM" || taskClass === "MISSING_TASK_SYSTEM") {
    requireValue(label, evidence.recommended_action, "ESTABLISH_INTENTOS_WORK_QUEUE", `${taskClass} action`);
    requireValue(label, evidence.future_task_authority, "INTENTOS_WORK_QUEUE", `${taskClass} authority`);
    requireValue(label, evidence.outcome, "TAKEOVER_RECOMMENDED", `${taskClass} outcome`);
  } else if (taskClass === "UNSAFE_TO_TAKE_OVER") {
    requireValue(label, evidence.recommended_action, "BLOCK_TAKEOVER", "unsafe action");
    requireValue(label, evidence.future_task_authority, "BLOCKED", "unsafe authority");
    requireValue(label, evidence.outcome, "TAKEOVER_BLOCKED", "unsafe outcome");
    if (evidence.readiness?.takeover_ready === "No") pass(`${label} unsafe takeover is not ready`);
    else fail(`${label} unsafe takeover must set takeover_ready to No`);
  }
}

function checkSourceCoverage(label, evidence) {
  const inventoryRefs = new Set((evidence.source_inventory || [])
    .filter((source) => source.status !== "MISSING")
    .map((source) => source.source_ref));
  const dispositionRefs = new Set((evidence.migration_dispositions || []).map((item) => item.source_item));
  for (const ref of inventoryRefs) {
    if (dispositionRefs.has(ref)) pass(`${label} source ${ref} has migration disposition`);
    else fail(`${label} source ${ref} must have migration disposition`);
  }
  for (const item of evidence.migration_dispositions || []) {
    if (item.disposition === "ARCHIVE_SOURCE_ONLY" && item.target_queue_state === "N/A") pass(`${label} archive-only disposition does not create queue state`);
    if (item.disposition === "MARK_STALE" && item.target_queue_state !== "CURRENT") pass(`${label} stale source is not current`);
    if (item.disposition === "MARK_STALE" && item.target_queue_state === "CURRENT") fail(`${label} stale source cannot become CURRENT`);
  }
}

function checkQueueItems(label, evidence) {
  const queueItems = evidence.queue_items || [];
  const currentItems = queueItems.filter((item) => item.state === "CURRENT");
  if (currentItems.length <= 1) pass(`${label} has at most one CURRENT queue item`);
  else fail(`${label} has multiple CURRENT queue items`);

  for (const item of queueItems) {
    if (item.state === "CURRENT") {
      if (item.task_governance_ref && item.task_governance_ref !== "N/A") pass(`${label} CURRENT item ${item.item_id} has Task Governance ref`);
      else fail(`${label} CURRENT item ${item.item_id} must have Task Governance ref`);
      if (/^sha256:[a-f0-9]{64}$/.test(item.task_governance_digest || "")) pass(`${label} CURRENT item ${item.item_id} has Task Governance digest`);
      else fail(`${label} CURRENT item ${item.item_id} must have Task Governance digest`);
    } else if (item.execution_eligible === "No") {
      pass(`${label} non-current item ${item.item_id} is not executable`);
    } else {
      fail(`${label} non-current item ${item.item_id} must not be execution eligible`);
    }
    if (item.execution_eligible === "Yes" && item.state !== "CURRENT") {
      fail(`${label} only CURRENT items may be execution eligible`);
    }
    if (item.execution_eligible === "Yes" && (!item.task_governance_ref || item.task_governance_ref === "N/A")) {
      fail(`${label} execution eligible item ${item.item_id} must have Task Governance ref`);
    }
  }
}

function requireValue(label, actual, expected, name) {
  if (actual === expected) pass(`${label} ${name} is ${expected}`);
  else fail(`${label} ${name} must be ${expected}, got ${actual || "<missing>"}`);
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/This report writes target files:\s*No/gi, "")
    .replace(/This report deletes old task sources:\s*No/gi, "")
    .replace(/This report approves implementation:\s*No/gi, "")
    .replace(/This report approves completion:\s*No/gi, "")
    .replace(/This report approves commit or push:\s*No/gi, "")
    .replace(/This report approves release or production:\s*No/gi, "")
    .replace(/This report claims full adoption:\s*No/gi, "")
    .replace(/This report installs native assets:\s*No/gi, "");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Work queue takeover check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function markdownFiles(dir) {
  const rootDir = path.join(projectRoot, dir);
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  walk(rootDir, files);
  return files.filter((file) => /\.md$/i.test(file)).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(file) {
  const targetAsset = path.join(projectRoot, file);
  if (fs.existsSync(targetAsset)) return targetAsset;
  const nativeAsset = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(nativeAsset)) return nativeAsset;
  return null;
}

function resolveDirectory(dir) {
  const targetDir = path.join(projectRoot, dir);
  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) return targetDir;
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function reportRefCandidates(file) {
  return [
    rel(file),
    path.basename(path.dirname(file)) + "/" + path.basename(file),
    path.basename(file),
  ];
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(expected, resolved) {
  const relative = rel(resolved);
  return relative || expected;
}
