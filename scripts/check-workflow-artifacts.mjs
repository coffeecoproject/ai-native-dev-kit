#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd(), process.argv[2] || ".");
const placeholderPattern = /<[^>\n]+>|\b(TBD|TODO|FIXME|XXX)\b|待补|待定|稍后|以后|placeholder/i;

let failed = false;
let checked = 0;

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

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function listMarkdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(fullDir, entry.name))
    .sort();
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

function hasMeaning(body) {
  if (!body) return false;
  const cleaned = body
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/[`*_#[\]()]/g, " ")
    .replace(/^-+\s*$/gm, "")
    .trim();
  return /[A-Za-z0-9\u4e00-\u9fff]/.test(cleaned);
}

function requireSections(file, content, sections) {
  for (const section of sections) {
    const body = sectionBody(content, section);
    if (body === null) {
      fail(`${file} missing section: ${section}`);
      continue;
    }
    if (!hasMeaning(body)) fail(`${file} section has no meaningful content: ${section}`);
  }
}

function requireNoPlaceholders(file, content) {
  const match = content.match(placeholderPattern);
  if (match) fail(`${file} contains placeholder content: ${match[0]}`);
}

function requireSingleChoice(file, content, section, choices) {
  const body = sectionBody(content, section);
  if (body === null) {
    fail(`${file} missing section: ${section}`);
    return;
  }
  const found = choices.filter((choice) => new RegExp(`\\b${choice}\\b`).test(body));
  if (body.includes("/") || found.length !== 1) {
    fail(`${file} section must choose exactly one value for ${section}: ${choices.join(", ")}`);
  }
}

function refsFromSection(content, section) {
  const body = sectionBody(content, section);
  if (!body) return [];
  return [...body.matchAll(/`([^`]+\.md)`/g)].map((match) => match[1]);
}

function requireExistingRefs(file, content, section) {
  for (const ref of refsFromSection(content, section)) {
    if (ref.includes("<")) continue;
    const full = path.resolve(projectRoot, ref);
    if (!fs.existsSync(full)) fail(`${file} references missing file: ${ref}`);
  }
}

function requireFilledColonLines(file, content, section) {
  const body = sectionBody(content, section);
  if (!body) return;
  const filled = body
    .split("\n")
    .some((line) => {
      const index = line.indexOf(":");
      if (index === -1) return false;
      return line.slice(index + 1).trim().length > 0;
    });
  if (!filled) fail(`${file} section must define concrete values after ':' labels: ${section}`);
}

function requireSubList(file, content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return;
  const start = body.indexOf(label);
  if (start === -1) {
    fail(`${file} section ${section} missing ${label}`);
    return;
  }
  const rest = body.slice(start + label.length);
  const nextLabel = rest.search(/\n[A-Z][A-Za-z /-]{1,40}:\s*\n/);
  const block = nextLabel === -1 ? rest : rest.slice(0, nextLabel);
  if (!/-\s+\S+/.test(block)) {
    fail(`${file} section ${section} must include at least one concrete item under ${label}`);
  }
}

function checkedRiskCount(content) {
  const body = sectionBody(content, "Risk Gate") || "";
  return [...body.matchAll(/-\s*\[[xX]\]/g)].length;
}

function checkRequest(file, content) {
  requireSections(file, content, [
    "Raw Request",
    "User / Customer",
    "Problem",
    "Desired Outcome",
    "Constraints",
    "Priority",
    "Suggested Task Level",
  ]);
  requireSingleChoice(file, content, "Priority", ["P0", "P1", "P2"]);
  requireSingleChoice(file, content, "Suggested Task Level", ["L0", "L1", "L2", "L3"]);
}

function checkPreflight(file, content) {
  requireSections(file, content, [
    "Source Request",
    "Clarity",
    "Problem Summary",
    "Missing Information",
    "Assumptions",
    "Direction Risks",
    "Over-design Risks",
    "MVP Recommendation",
    "Non-goals",
    "Domain Model Draft",
    "Permission / Security Risks",
    "First Vertical Slice",
    "Suggested Specs",
    "Suggested Task Level",
    "Decision",
    "Rationale",
  ]);
  requireSingleChoice(file, content, "Clarity", ["READY", "PARTIAL", "UNCLEAR"]);
  requireSingleChoice(file, content, "Suggested Task Level", ["L0", "L1", "L2", "L3"]);
  requireSingleChoice(file, content, "Decision", ["READY_FOR_SPEC", "NEEDS_CLARIFICATION", "TOO_LARGE_SPLIT_REQUIRED", "NOT_RECOMMENDED"]);
  requireExistingRefs(file, content, "Source Request");
  requireExistingRefs(file, content, "Suggested Specs");
}

function checkSpec(file, content) {
  requireSections(file, content, [
    "Status",
    "Problem",
    "User Story",
    "Scope",
    "Non-goals",
    "Data Model Impact",
    "API / Interface Contract",
    "UI States",
    "Permission Rules",
    "Observability",
    "Acceptance Criteria",
    "Test Plan",
    "Rollback Notes",
  ]);
  requireSingleChoice(file, content, "Status", ["Draft", "Ready", "Implementing", "Done", "Superseded"]);
  requireExistingRefs(file, content, "Source");
}

function checkEval(file, content) {
  requireSections(file, content, [
    "Related Spec",
    "Must Pass",
    "Spec Alignment",
    "Permission / Data Checks",
    "Manual Review Checklist",
    "Reject Conditions",
    "Required Evidence",
  ]);
  requireExistingRefs(file, content, "Related Spec");
  requireFilledColonLines(file, content, "Required Evidence");
}

function checkTask(file, content) {
  requireSections(file, content, [
    "Task Level",
    "Related Spec",
    "Related Eval",
    "Goal",
    "Scope",
    "Acceptance Criteria",
    "Commands",
    "AI Budget",
    "Risk Gate",
    "Stop Conditions",
    "Final Report Required",
  ]);
  requireSingleChoice(file, content, "Task Level", ["L0", "L1", "L2", "L3"]);
  requireExistingRefs(file, content, "Related Spec");
  requireExistingRefs(file, content, "Related Eval");
  requireSubList(file, content, "Scope", "Allowed:");
  requireSubList(file, content, "Scope", "Not allowed:");

  const budget = sectionBody(content, "AI Budget") || "";
  if (!/Max agent runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max agent runs`);
  if (!/Max repair runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max repair runs`);
  if (!/Stop if:\s*\S+/i.test(budget)) fail(`${file} AI Budget must include concrete Stop if condition`);

  if (checkedRiskCount(content) > 0 && !/explicit human approval/i.test(content)) {
    fail(`${file} checked risk items require explicit human approval wording`);
  }
}

function checkLog(file, content) {
  requireSections(file, content, [
    "Task",
    "Agent / Tool",
    "Runs",
    "Result",
    "Human Time",
    "AI Helpfulness",
    "What Worked",
    "Problems",
    "Cost / Usage",
    "Issues Caught By Review",
    "Lessons",
    "Dev Kit Updates Needed",
    "Workflow Improvement Trigger",
    "Related Follow-up",
  ]);
  requireSingleChoice(file, content, "Result", ["Merged", "Rejected", "Blocked", "Abandoned"]);
  requireSingleChoice(file, content, "AI Helpfulness", ["High", "Medium", "Low"]);
  requireExistingRefs(file, content, "Task");
  const cost = sectionBody(content, "Cost / Usage") || "";
  if (!/AI runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric AI runs`);
  if (!/Repair runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric Repair runs`);
}

const checks = [
  ["requests", checkRequest],
  ["preflight", checkPreflight],
  ["specs", checkSpec],
  ["evals", checkEval],
  ["tasks", checkTask],
  ["ai-logs", checkLog],
];

for (const [dir, checker] of checks) {
  const files = listMarkdownFiles(dir);
  if (files.length === 0) {
    warn(`${dir} has no markdown artifacts`);
    continue;
  }
  for (const filePath of files) {
    checked += 1;
    const file = rel(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    requireNoPlaceholders(file, content);
    checker(file, content);
  }
}

if (failed) {
  console.error("");
  console.error(`Workflow artifact quality check failed for ${checked} file(s).`);
  process.exit(1);
}

console.log("");
pass(`workflow artifact quality check passed for ${checked} file(s)`);
