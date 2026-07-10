#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { normalizeBaselineLevel } from "./lib/baseline-selection.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["mode", "task", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const mode = String(args.mode || "ready");
const outputJson = Boolean(args.json);
const taskScoped = Boolean(args.task);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["ready", "implementation"]).has(mode)) {
  console.error(`FAIL unknown --mode: ${mode}`);
  process.exit(1);
}

let failed = false;
let warning = false;
const checks = [];
const baselineLevel = detectBaselineLevel(projectRoot);
let legacyTaskMissingFields = 0;
let legacyReviewPacketMissingFields = 0;
let legacyReviewLoopMissingFields = 0;

if (!outputJson) {
  console.log(`# Baseline Enforcement Check (${mode}, ${baselineLevel})`);
  console.log("");
}

checkTaskCards();
checkReviewPackets();
checkReviewLoopReports();
emitLegacySummaries();

if (outputJson) {
  console.log(JSON.stringify({
    baselineLevel,
    mode,
    checkStatus: failed ? "FAIL" : warning ? "PENDING" : "PASS",
    checks,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (failed) console.log("Baseline enforcement failed.");
  else if (warning) console.log("Baseline enforcement has advisory gaps.");
  else console.log("Baseline enforcement is ready.");
}

function detectBaselineLevel(root) {
  const candidates = ["docs/baseline-selection.md", "docs/baseline-evidence.md", "docs/project-profile.md"];
  const text = candidates
    .map((rel) => {
      const full = path.join(root, rel);
      return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
    })
    .join("\n");
  const tokens = text.match(/\bBL[0-2](?:_(?:LIGHTWEIGHT|STANDARD|INDUSTRIAL))?\b/gi) || [];
  const levels = new Set(tokens.map(normalizeBaselineLevel).filter(Boolean));
  if (levels.has("BL2_INDUSTRIAL")) return "BL2";
  if (levels.has("BL1_STANDARD")) return "BL1";
  return "BL0";
}

function checkTaskCards() {
  const taskFiles = args.task
    ? [path.resolve(process.cwd(), String(args.task))]
    : markdownFiles(path.join(projectRoot, "tasks"));
  if (taskFiles.length === 0) {
    advisory("No task cards found; baseline reference enforcement is skipped until a task exists.");
    return;
  }

  for (const file of taskFiles) {
    const rel = relative(file);
    if (!fs.existsSync(file)) {
      issue("FAIL", `${rel} does not exist`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const level = taskLevel(content);
    const engineeringTouched = fieldValue(content, "Engineering Baseline touched");
    const environmentTouched = fieldValue(content, "Environment Baseline touched");
    const refs = fieldValue(content, "Baseline refs");
    const decisions = fieldValue(content, "Baseline decisions introduced");
    const hasEngineeringField = engineeringTouched !== null;
    const hasEnvironmentField = environmentTouched !== null;
    const hasRefsField = refs !== null;
    const hasDecisionsField = decisions !== null;
    const touchesEngineeringByText = obviousEngineeringTouch(content);
    const touchesEnvironmentByText = obviousEnvironmentTouch(content);

    if (!hasEngineeringField || !hasEnvironmentField || !hasRefsField || !hasDecisionsField) {
      if (!taskScoped && baselineLevel !== "BL2") {
        legacyTaskMissingFields += 1;
        continue;
      }
      levelAwareIssue(level, `${rel} missing baseline fields: Engineering Baseline touched, Environment Baseline touched, Baseline refs, Baseline decisions introduced`);
    } else {
      pass(`${rel} includes baseline fields`);
    }

    if (isYes(engineeringTouched) && !referencesAny(refs, ["docs/engineering-baseline.md", "core/engineering-baseline.md"])) {
      failOrWarnForMissingRef(level, `${rel} touches engineering baseline but does not reference docs/engineering-baseline.md`);
    }
    if (isYes(environmentTouched) && !referencesAny(refs, ["docs/environment-baseline.md", "core/environment-baseline.md"])) {
      failOrWarnForMissingRef(level, `${rel} touches environment baseline but does not reference docs/environment-baseline.md`);
    }
    if (touchesEngineeringByText && !isYes(engineeringTouched)) {
      levelAwareIssue(level, `${rel} appears to touch engineering baseline areas but does not declare Engineering Baseline touched: Yes`);
    }
    if (touchesEnvironmentByText && !isYes(environmentTouched)) {
      levelAwareIssue(level, `${rel} appears to touch environment baseline areas but does not declare Environment Baseline touched: Yes`);
    }
    if (hasDecision(decisions) && !/decision-briefs\/|Human Approval\s*\n[\s\S]*Status:\s*Approved/i.test(content)) {
      levelAwareIssue(level, `${rel} introduces baseline decisions without a decision brief or approved human decision`);
    }
  }
}

function checkReviewPackets() {
  const files = taskScopedFiles(markdownFiles(path.join(projectRoot, "review-packets")));
  if (files.length === 0) {
    if (baselineLevel === "BL2") issue("FAIL", "BL2 requires review packets for task evidence");
    else advisory("No review packets found; skipped until review evidence exists.");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const rel = relative(file);
    for (const field of ["Environment baseline checked", "Environment baseline ref", "Environment baseline gaps"]) {
      if (!new RegExp(`^${escapeRegExp(field)}:`, "mi").test(content)) {
        if (!taskScoped && baselineLevel !== "BL2") {
          legacyReviewPacketMissingFields += 1;
        } else if (baselineLevel === "BL2") issue("FAIL", `${rel} missing ${field}`);
        else advisory(`${rel} missing ${field}`);
      }
    }
    if (/Environment baseline checked:\s*Yes/i.test(content) && !/Environment baseline ref:\s*.*(docs\/environment-baseline\.md|core\/environment-baseline\.md)/i.test(content)) {
      failOrWarnForMissingRef(taskLevel(content), `${rel} says environment baseline was checked but lacks docs/environment-baseline.md ref`);
    }
  }
}

function checkReviewLoopReports() {
  const files = taskScopedFiles(markdownFiles(path.join(projectRoot, "review-loop-reports")));
  if (files.length === 0) {
    if (baselineLevel === "BL2") issue("FAIL", "BL2 requires review-loop reports for baseline-sensitive work");
    else advisory("No review-loop reports found; skipped until review loop evidence exists.");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const rel = relative(file);
    for (const marker of ["Engineering Baseline Follow-check", "Environment Baseline Follow-check"]) {
      if (!content.includes(marker)) {
        if (!taskScoped && baselineLevel !== "BL2") {
          legacyReviewLoopMissingFields += 1;
        } else if (baselineLevel === "BL2") issue("FAIL", `${rel} missing ${marker}`);
        else advisory(`${rel} missing ${marker}`);
      }
    }
  }
}

function emitLegacySummaries() {
  if (legacyTaskMissingFields > 0) {
    advisory(`${legacyTaskMissingFields} legacy task card(s) do not have 1.2 baseline fields; use --task for current-task enforcement.`);
  }
  if (legacyReviewPacketMissingFields > 0) {
    advisory(`${legacyReviewPacketMissingFields} legacy review packet field gap(s) found; new packets should include environment baseline fields.`);
  }
  if (legacyReviewLoopMissingFields > 0) {
    advisory(`${legacyReviewLoopMissingFields} legacy review loop field gap(s) found; new reports should include baseline follow-checks.`);
  }
}

function levelAwareIssue(taskLevelValue, message) {
  if (baselineLevel === "BL2" || (taskScoped && taskLevelValue === "L3")) issue("FAIL", message);
  else if (baselineLevel === "BL1" && mode === "implementation") issue("FAIL", message);
  else advisory(message);
}

function failOrWarnForMissingRef(taskLevelValue, message) {
  if (baselineLevel === "BL2" || (taskScoped && taskLevelValue === "L3")) issue("FAIL", message);
  else if (baselineLevel === "BL1" && mode === "implementation") issue("FAIL", message);
  else advisory(message);
}

function issue(status, message) {
  checks.push({ status, message });
  if (status === "FAIL") failed = true;
  if (status !== "PASS") warning = true;
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  issue("PASS", message);
}

function advisory(message) {
  issue("PENDING", message);
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...markdownFiles(full));
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results.sort();
}

function taskScopedFiles(files) {
  if (!taskScoped) return files;
  const taskBase = path.basename(String(args.task), ".md");
  return files.filter((file) => path.basename(file, ".md") === taskBase);
}

function relative(file) {
  return path.relative(projectRoot, file).replace(/\\/g, "/") || path.basename(file);
}

function taskLevel(content) {
  const match = content.match(/\b(L0|L1|L2|L3)\b/);
  return match ? match[1] : "L1";
}

function fieldValue(content, field) {
  const lines = content.split("\n");
  const fieldPattern = new RegExp(`^${escapeRegExp(field)}:\\s*(.*)$`, "i");
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(fieldPattern);
    if (!match) continue;
    const values = [];
    if (match[1].trim()) values.push(match[1].trim());
    for (let next = index + 1; next < lines.length; next += 1) {
      const line = lines[next];
      if (/^#{1,6}\s+/.test(line)) break;
      if (/^[A-Za-z][A-Za-z /-]+:\s*/.test(line)) break;
      if (!line.trim()) {
        if (values.length === 0) continue;
        break;
      }
      values.push(line.trim());
    }
    return values.join("\n").trim();
  }
  return null;
}

function isYes(value) {
  return /^yes\b/i.test(String(value || ""));
}

function referencesAny(value, refs) {
  const text = String(value || "");
  return refs.some((ref) => text.includes(ref));
}

function hasDecision(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(No|None|Not Required|Not applicable|N\/A)$/i.test(text);
}

function obviousEngineeringTouch(content) {
  return /\b(database schema|schema|migration|api contract|permission model|dependency|folder structure|dto|domain|enum|lookup|state machine|generated type|cross-module)\b/i.test(content);
}

function obviousEnvironmentTouch(content) {
  return /\b(build command|ci|cd|environment variable|env var|deployment|production config|release process|rollback|secret|monitoring|alert|logs)\b/i.test(content);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
