#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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

const allowedTypes = new Set([
  "IN_SCOPE_NEXT_STEP",
  "DIRECT_FOLLOW_UP",
  "RISK_DECISION",
  "OUT_OF_SCOPE_OBSERVATION",
  "DO_NOT_PROCEED",
]);

const donePattern = /\b(done|implemented|fixed|completed|safe|available|已完成|已实现|可执行|安全)\b/i;
const allowedEntries = {
  IN_SCOPE_NEXT_STEP: [/current task/i, /current pr/i, /当前任务/, /当前 PR/i],
  DIRECT_FOLLOW_UP: [/new request/i, /follow-up proposal/i, /新 request/i, /后续提案/],
  RISK_DECISION: [/human decision/i, /preflight/i, /人工决策/, /人类决策/],
  OUT_OF_SCOPE_OBSERVATION: [/record/i, /not immediate/i, /context/i, /记录/, /背景/],
  DO_NOT_PROCEED: [/do not proceed/i, /stop/i, /separate approval/i, /不继续/, /停止/],
};

let failed = false;
let checkedFiles = 0;
let checkedRows = 0;

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
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

function parseMarkdownTable(body) {
  if (!body) return [];
  const lines = body.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2) return [];
  const header = splitRow(lines[0]).map((cell) => normalizeHeader(cell));
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
  return rows.filter((row) => {
    const meaningfulValues = Object.entries(row)
      .filter(([key]) => key !== "id")
      .map(([, value]) => value);
    return meaningfulValues.some((value) => value && !isPlaceholder(value));
  });
}

function splitRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function normalizeHeader(value) {
  return stripMarkdown(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function isPlaceholder(value) {
  const text = stripMarkdown(value);
  if (!text) return true;
  if (/^(yes\s*\/\s*no|pending\s*\/|approved\s*\/|pass\s*\/|current task\s*\/|in_scope_next_step\s*\/|p0\s*\/|auto_fix\s*\/)/i.test(text)) return true;
  if (/^<[^>]+>$/.test(text)) return true;
  return false;
}

function booleanYes(value) {
  return /^yes$/i.test(stripMarkdown(value));
}

function rowType(row) {
  return stripMarkdown(row.type || "").toUpperCase();
}

function rowCanAiDoNow(row) {
  return stripMarkdown(row.can_ai_do_now || row.can_ai_do_this_now || "");
}

function rowRequiredEntry(row) {
  return stripMarkdown(row.required_entry || "");
}

function rowRiskApproval(row) {
  return stripMarkdown(row.risk_approval || row.risk_or_approval || "");
}

function rowSuggestionText(row) {
  return [
    row.suggestion,
    row.relation_to_current_task,
    row.relation_to_this_pr,
    row.required_entry,
    row.risk_approval,
    row.status,
  ].filter(Boolean).join(" ");
}

function humanDecisionRows(content) {
  return parseMarkdownTable(sectionBody(content, "Human Decisions Needed"))
    .concat(parseMarkdownTable(sectionBody(content, "Human Decision Queue")));
}

function hasHumanDecisionFor(content, suggestion) {
  const decisions = humanDecisionRows(content);
  if (decisions.length === 0) return false;
  const suggestionText = stripMarkdown(suggestion).toLowerCase();
  return decisions.some((row) => {
    const body = Object.values(row).join(" ").toLowerCase();
    return body && (!suggestionText || body.includes(suggestionText.slice(0, 32)) || !/not_required/i.test(body));
  });
}

function entryMatches(type, entry) {
  const patterns = allowedEntries[type] || [];
  return patterns.some((pattern) => pattern.test(entry));
}

function checkSuggestionRow(file, content, row, index) {
  checkedRows += 1;
  const id = stripMarkdown(row.id || `row-${index + 1}`);
  const type = rowType(row);
  const canAi = rowCanAiDoNow(row);
  const entry = rowRequiredEntry(row);
  const risk = rowRiskApproval(row);
  const suggestion = stripMarkdown(row.suggestion || "");
  const relation = stripMarkdown(row.relation_to_current_task || row.relation_to_this_pr || "");
  const allText = rowSuggestionText(row);

  if (!allowedTypes.has(type)) {
    fail(`${file} ${id} has invalid next-step type: ${type || "(empty)"}`);
    return;
  }
  if (!suggestion) fail(`${file} ${id} must include a suggestion`);
  if (!relation) fail(`${file} ${id} must explain relation to current task`);
  if (!canAi || isPlaceholder(canAi)) fail(`${file} ${id} must state whether AI can do it now`);
  if (!entry || isPlaceholder(entry)) fail(`${file} ${id} must name required entry`);
  if (!risk && mode !== "draft") fail(`${file} ${id} should state risk / approval`);

  if (booleanYes(canAi) && type !== "IN_SCOPE_NEXT_STEP") {
    fail(`${file} ${id} can only set Can AI do now? = Yes for IN_SCOPE_NEXT_STEP`);
  }
  if (type === "IN_SCOPE_NEXT_STEP" && /human decision|follow-up proposal|do not proceed/i.test(entry)) {
    fail(`${file} ${id} IN_SCOPE_NEXT_STEP must not require a separate follow-up or human decision`);
  }
  if (!entryMatches(type, entry) && mode !== "draft") {
    fail(`${file} ${id} required entry does not match ${type}: ${entry}`);
  }
  if (type === "RISK_DECISION" && !hasHumanDecisionFor(content, suggestion)) {
    fail(`${file} ${id} RISK_DECISION must appear in Human Decisions Needed or Human Decision Queue`);
  }
  if (type === "OUT_OF_SCOPE_OBSERVATION" && /immediate|now|next action|current task/i.test(entry)) {
    fail(`${file} ${id} OUT_OF_SCOPE_OBSERVATION must not be presented as immediate work`);
  }
  if (type === "DO_NOT_PROCEED" && donePattern.test(allText)) {
    fail(`${file} ${id} DO_NOT_PROCEED must not be marked done, implemented, safe, or available`);
  }
}

function checkTableFile(filePath) {
  const file = rel(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const body = sectionBody(content, "Next-Step Suggestions");
  if (body === null) {
    warn(`${file} has no Next-Step Suggestions section`);
    return;
  }
  const rows = parseMarkdownTable(body);
  if (rows.length === 0) {
    if (mode === "implementation") fail(`${file} must include at least one concrete Next-Step Suggestions row or explicit NO_ACTION row`);
    else warn(`${file} has no concrete Next-Step Suggestions rows`);
    return;
  }
  checkedFiles += 1;
  rows.forEach((row, index) => checkSuggestionRow(file, content, row, index));
}

function checkFollowUpProposal(filePath) {
  const file = rel(filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const typeBody = sectionBody(content, "Type") || "";
  const type = stripMarkdown(typeBody.split(/\s+/)[0] || "").toUpperCase();
  checkedFiles += 1;
  if (!allowedTypes.has(type)) fail(`${file} has invalid Type: ${type || "(empty)"}`);
  const canAi = sectionBody(content, "Can AI Do This Now?") || "";
  if (booleanYes(canAi) && type !== "IN_SCOPE_NEXT_STEP") {
    fail(`${file} can only set Can AI Do This Now? = Yes for IN_SCOPE_NEXT_STEP`);
  }
  const requiredEntry = sectionBody(content, "Required Entry") || "";
  if (type && !entryMatches(type, requiredEntry) && mode !== "draft") {
    fail(`${file} Required Entry does not match ${type}`);
  }
  if (type === "RISK_DECISION" && !(sectionBody(content, "Human Decision Needed") || "").match(/PENDING|APPROVED|REJECTED/i)) {
    fail(`${file} RISK_DECISION must include Human Decision Needed`);
  }
  if (type === "DO_NOT_PROCEED" && donePattern.test(content)) {
    fail(`${file} DO_NOT_PROCEED must not be marked done, implemented, safe, or available`);
  }
}

const tableFiles = [
  ...taskScoped(listMarkdownFiles("review-loop-reports")),
  ...taskScoped(listMarkdownFiles("final-reports")),
  ...taskScoped(listMarkdownFiles("review-summaries")),
];
for (const file of tableFiles) checkTableFile(file);
for (const file of taskScoped(listMarkdownFiles("follow-up-proposals"))) checkFollowUpProposal(file);

if (failed) process.exit(1);

console.log("");
if (checkedFiles === 0) {
  console.log("No next-step boundary artifacts found.");
} else {
  pass(`next-step boundary check passed (${checkedFiles} file(s), ${checkedRows} suggestion row(s))`);
}
