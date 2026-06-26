#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const taskArg = args.task ? normalizePath(String(args.task)) : null;
const mode = String(args.mode || "ready").toLowerCase();
const allowedModes = new Set(["draft", "ready", "implementation"]);
const knownFlags = new Set(["task", "mode"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

if (!allowedModes.has(mode)) {
  console.error(`FAIL invalid --mode: ${mode}`);
  console.error("Valid modes: draft, ready, implementation");
  process.exit(1);
}

const allowedSeverities = new Set(["P0", "P1", "P2"]);
const allowedCategories = new Set(["AUTO_FIX", "NEEDS_HUMAN_DECISION", "NEEDS_CLARIFICATION", "NO_ACTION"]);
const terminalStatuses = new Set(["DONE", "AUTO_FIXED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const taskLevelRank = { L0: 0, L1: 1, L2: 2, L3: 3 };
const forbiddenAutoFixPattern = /\b(scope expansion|new dependency|dependency|architecture|permission model|payment|value-transfer|value transfer|database migration|migration|production configuration|production config|release|rollback|human approval|approval scope|risk acceptance|risk gate bypass|weaken(?:ing)? risk gate)\b/i;

let failed = false;
let checkedReports = 0;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function warn(message) {
  console.log(`WARN ${message}`);
}

function normalizePath(value) {
  return value.replaceAll(path.sep, "/").replace(/^\.\//, "");
}

function rel(fullPath) {
  return normalizePath(path.relative(projectRoot, fullPath)) || ".";
}

function labeledValue(content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return "";
  const pattern = new RegExp(`^${escapeRegExp(label)}:[^\\S\\r\\n]*(.*)$`, "im");
  const match = body.match(pattern);
  return match ? stripMarkdown(match[1]) : "";
}

function firstRefFromSection(content, section) {
  const body = sectionBody(content, section);
  if (!body) return null;
  const backtick = body.match(/`([^`]+\.md)`/);
  if (backtick) return normalizePath(backtick[1]);
  const plain = body.match(/\b(?:tasks|specs|evals|review-packets|gpt-review-prompts)\/[^\s`|)]+\.md\b/);
  return plain ? normalizePath(plain[0]) : null;
}

function labeledRef(content, section, label) {
  const value = labeledValue(content, section, label);
  const backtick = value.match(/`([^`]+\.md)`/);
  if (backtick) return normalizePath(backtick[1]);
  const plain = value.match(/\b(?:tasks|specs|evals|review-packets|gpt-review-prompts)\/[^\s`|)]+\.md\b/);
  return plain ? normalizePath(plain[0]) : null;
}

function listMarkdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(fullDir, entry.name))
    .sort();
}

function taskStem(ref) {
  if (!ref) return null;
  return path.basename(ref, ".md").replace(/^\d{3}-/, "");
}

function taskScoped(files) {
  if (!taskArg) return files;
  const stem = taskStem(taskArg);
  return files.filter((file) => taskStem(file) === stem);
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function normalizeHeader(value) {
  return stripMarkdown(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function isPlaceholder(value) {
  const text = stripMarkdown(value);
  if (!text) return true;
  if (/^(yes\s*\/\s*no|open\s*\/|pending\s*\/|p0\s*\/|auto_fix\s*\/|self\s*\/|l0\s*\/|pass\s*\/)/i.test(text)) return true;
  if (/^<[^>]+>$/.test(text)) return true;
  return false;
}

function parseMarkdownTable(body) {
  if (!body) return [];
  const lines = body.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2) return [];
  const header = splitRow(lines[0]).map(normalizeHeader);
  const rows = [];
  for (const line of lines.slice(2)) {
    const cells = splitRow(line);
    if (cells.length === 0 || cells.every((cell) => /^-+$/.test(cell))) continue;
    const row = {};
    header.forEach((key, index) => {
      row[key] = stripMarkdown(cells[index] || "");
    });
    rows.push(row);
  }
  return rows.filter((row) => Object.values(row).some((value) => value && !isPlaceholder(value)));
}

function splitRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function taskLevelFromContent(content) {
  const explicit = labeledValue(content, "Status", "Task Level") || sectionBody(content, "Task Level") || "";
  const match = explicit.match(/\bL[0-3]\b/);
  return match ? match[0] : null;
}

function readProjectFile(ref) {
  const full = path.join(projectRoot, ref);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function requireExistingRef(file, label, ref) {
  if (!ref || isPlaceholder(ref)) {
    fail(`${file} missing ${label}`);
    return;
  }
  if (!fs.existsSync(path.join(projectRoot, ref))) fail(`${file} references missing ${label}: ${ref}`);
}

function numberValue(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function findingId(row, index) {
  return stripMarkdown(row.id || `finding-${index + 1}`);
}

function humanDecisionQueueRows(content) {
  return parseMarkdownTable(sectionBody(content, "Human Decision Queue"));
}

function hasConcreteHumanDecision(content, findingText) {
  const rows = humanDecisionQueueRows(content);
  if (rows.length === 0) return false;
  const target = stripMarkdown(findingText).toLowerCase();
  return rows.some((row) => {
    const body = Object.values(row).join(" ").toLowerCase();
    return body && (!target || body.includes(target.slice(0, 32)) || /pending|approved|rejected/i.test(body));
  });
}

function requireNoActionReason(file, row, id) {
  const body = [row.proposed_action, row.status, row.finding].filter(Boolean).join(" ");
  if (!/\b(reason|because|not needed|not applicable|no change|无需|原因|不需要)\b/i.test(body)) {
    fail(`${file} ${id} NO_ACTION must include a reason`);
  }
}

function checkFindings(file, content) {
  const rows = parseMarkdownTable(sectionBody(content, "Findings"));
  if (rows.length === 0) {
    if (mode === "implementation") fail(`${file} must include concrete findings or NO_ACTION rows before implementation closure`);
    else warn(`${file} has no concrete findings`);
    return { hasAutoFix: false, hasHumanDecision: false };
  }

  let hasAutoFix = false;
  let hasHumanDecision = false;
  const seen = new Set();
  for (const [index, row] of rows.entries()) {
    const id = findingId(row, index);
    const severity = stripMarkdown(row.severity || "").toUpperCase();
    const category = stripMarkdown(row.category || "").toUpperCase();
    const finding = stripMarkdown(row.finding || "");
    const evidence = stripMarkdown(row.evidence || "");
    const action = stripMarkdown(row.proposed_action || "");

    if (!allowedSeverities.has(severity)) fail(`${file} ${id} has invalid severity: ${severity || "(empty)"}`);
    if (!allowedCategories.has(category)) fail(`${file} ${id} has invalid category: ${category || "(empty)"}`);
    if (!finding) fail(`${file} ${id} must include finding text`);
    if (!evidence) fail(`${file} ${id} must include evidence`);
    if (!action && mode !== "draft") fail(`${file} ${id} must include proposed action`);
    if (seen.has(id)) fail(`${file} duplicate finding ID: ${id}`);
    seen.add(id);

    if (category === "AUTO_FIX") {
      hasAutoFix = true;
      const text = [finding, action, row.status].join(" ");
      if (forbiddenAutoFixPattern.test(text)) {
        fail(`${file} ${id} AUTO_FIX appears to touch forbidden scope/risk authority`);
      }
    }
    if (category === "NEEDS_HUMAN_DECISION") {
      hasHumanDecision = true;
      if (!hasConcreteHumanDecision(content, finding)) {
        fail(`${file} ${id} NEEDS_HUMAN_DECISION must appear in Human Decision Queue`);
      }
    }
    if (category === "NO_ACTION") requireNoActionReason(file, row, id);
  }
  return { hasAutoFix, hasHumanDecision };
}

function checkAutoFixAttempts(file, content, hasAutoFix) {
  const rows = parseMarkdownTable(sectionBody(content, "Auto-fix Attempts"));
  const rounds = new Set(rows.map((row) => numberValue(row.round)).filter((value) => value !== null));
  if (rounds.size > 2) fail(`${file} AUTO_FIX attempts exceed 2 rounds`);
  for (const row of rows) {
    const round = numberValue(row.round);
    if (round !== null && round > 2) fail(`${file} AUTO_FIX round exceeds max 2: ${round}`);
    if (!row.finding_ids && mode !== "draft") fail(`${file} auto-fix attempt missing Finding IDs`);
    if (!row.commands_run && mode !== "draft") fail(`${file} auto-fix attempt missing Commands run`);
    if (!row.result && mode !== "draft") fail(`${file} auto-fix attempt missing Result`);
  }
  if (hasAutoFix && rows.length === 0 && mode === "implementation") {
    fail(`${file} has AUTO_FIX findings but no Auto-fix Attempts`);
  }
}

function checkVerificationAfterFix(file, content, hasAutoFix) {
  if (!hasAutoFix) return;
  const body = sectionBody(content, "Verification After Fix") || "";
  const commands = body.match(/Commands:\s*```text\s*([\s\S]*?)```/i);
  const result = body.match(/^Result:\s*(.+)$/im);
  const evidence = body.match(/^Evidence:\s*(.+)$/im);
  if (mode === "draft") return;
  if (!commands || !commands[1].trim()) fail(`${file} AUTO_FIX requires Verification After Fix commands`);
  if (!result || !result[1].trim()) fail(`${file} AUTO_FIX requires Verification After Fix result`);
  if (!evidence || !evidence[1].trim()) fail(`${file} AUTO_FIX requires Verification After Fix evidence`);
}

function checkRepeatedIssues(file, content) {
  const body = sectionBody(content, "Re-review Result") || "";
  const repeatedMatch = body.match(/Repeated issues:\s*([\s\S]*?)(?:\n[A-Z][A-Za-z /-]+:|$)/i);
  if (!repeatedMatch) return;
  const repeated = repeatedMatch[1].trim();
  if (!repeated || /^-\s*$/m.test(repeated)) return;
  if (/^(?:-\s*)?(?:none|no repeated issues|not applicable|n\/a|无|没有|不适用)\.?$/i.test(repeated)) return;
  const stop = labeledValue(content, "Re-review Result", "Stop condition triggered");
  if (!/^Yes$/i.test(stop)) fail(`${file} repeated issues require Stop condition triggered: Yes`);
}

function checkReport(filePath) {
  checkedReports += 1;
  const file = rel(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const status = sectionBody(content, "Status");
  if (!status) {
    fail(`${file} missing Status section`);
    return;
  }

  const taskRef = labeledRef(content, "Status", "Task") || firstRefFromSection(content, "Status");
  const specRef = labeledRef(content, "Status", "Related Spec");
  const evalRef = labeledRef(content, "Status", "Related Eval");
  const packetRef = labeledRef(content, "Review Packet", "Review Packet ref");
  const taskLevel = taskLevelFromContent(content);
  const reviewRequired = labeledValue(content, "Status", "Review required");
  const currentRound = numberValue(labeledValue(content, "Status", "Current round"));
  const maxRounds = numberValue(labeledValue(content, "Status", "Max auto-fix rounds"));
  const finalStatus = labeledValue(content, "Status", "Final status").toUpperCase();

  if (taskArg && taskRef && normalizePath(taskRef) !== taskArg) {
    fail(`${file} task ref ${taskRef} does not match --task ${taskArg}`);
  }
  requireExistingRef(file, "Task", taskRef);
  requireExistingRef(file, "Related Spec", specRef);
  requireExistingRef(file, "Related Eval", evalRef);
  if (!taskLevel) fail(`${file} missing Task Level`);
  if (maxRounds === null || maxRounds > 2) fail(`${file} Max auto-fix rounds must be <= 2`);
  if (currentRound !== null && maxRounds !== null && currentRound > maxRounds) fail(`${file} Current round exceeds Max auto-fix rounds`);
  if (finalStatus && !terminalStatuses.has(finalStatus) && finalStatus !== "OPEN") fail(`${file} has invalid Final status: ${finalStatus}`);

  const strictReview = taskLevel && taskLevelRank[taskLevel] >= taskLevelRank.L2;
  if (strictReview && !/^Yes$/i.test(reviewRequired)) fail(`${file} ${taskLevel} requires Review required: Yes`);
  if (/^Yes$/i.test(reviewRequired) || strictReview) requireExistingRef(file, "Review Packet ref", packetRef);

  const taskContent = taskRef ? readProjectFile(taskRef) : null;
  if (taskContent) {
    const taskCardLevel = taskLevelFromContent(taskContent);
    if (taskCardLevel && taskLevel && taskCardLevel !== taskLevel) {
      fail(`${file} Task Level ${taskLevel} does not match task card ${taskCardLevel}`);
    }
  }

  const { hasAutoFix, hasHumanDecision } = checkFindings(file, content);
  checkAutoFixAttempts(file, content, hasAutoFix);
  checkVerificationAfterFix(file, content, hasAutoFix);
  checkRepeatedIssues(file, content);

  if (hasHumanDecision) {
    const final = labeledValue(content, "Status", "Final status");
    if (!/NEEDS_HUMAN_DECISION|BLOCKED/i.test(final) && mode === "implementation") {
      fail(`${file} human-decision findings require Final status NEEDS_HUMAN_DECISION or BLOCKED before closure`);
    }
  }
}

function checkTaskRequirement() {
  if (!taskArg) return;
  const taskPath = path.join(projectRoot, taskArg);
  if (!fs.existsSync(taskPath)) {
    fail(`missing task: ${taskArg}`);
    return;
  }
  const taskContent = fs.readFileSync(taskPath, "utf8");
  const level = taskLevelFromContent(taskContent);
  if (!level || taskLevelRank[level] < taskLevelRank.L2) return;

  const stem = taskStem(taskArg);
  const packetExists = fs.existsSync(path.join(projectRoot, "review-packets", `${path.basename(taskArg)}`));
  const reportExists = fs.existsSync(path.join(projectRoot, "review-loop-reports", `${path.basename(taskArg)}`));
  const message = `${taskArg} is ${level}; Review Packet and Review Loop Report are expected for implementation review`;
  if (!packetExists || !reportExists) {
    if (mode === "implementation") fail(message);
    else warn(`${message} (${stem})`);
  }
}

checkTaskRequirement();
const reports = taskScoped(listMarkdownFiles("review-loop-reports"));
for (const report of reports) checkReport(report);

if (failed) process.exit(1);

console.log("");
if (checkedReports === 0) {
  console.log("No review loop reports found.");
} else {
  pass(`review loop check passed (${checkedReports} report(s))`);
}
