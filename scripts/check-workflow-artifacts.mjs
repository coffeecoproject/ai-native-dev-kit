#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const mode = String(args.mode || "ready").toLowerCase();
const taskArg = args.task ? String(args.task) : null;
const changedOnly = Boolean(args["changed-only"]);
const changedBase = args.base ? String(args.base) : "HEAD";
const allowedModes = new Set(["draft", "ready", "implementation"]);
const knownFlags = new Set(["mode", "task", "changed-only", "base"]);

if (!allowedModes.has(mode)) {
  console.error(`FAIL invalid --mode: ${mode}`);
  console.error("Valid modes: draft, ready, implementation");
  process.exit(1);
}

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

if (taskArg && changedOnly) {
  console.error("FAIL use either --task or --changed-only, not both");
  process.exit(1);
}

if (mode === "implementation" && !taskArg) {
  console.error("FAIL implementation mode requires --task tasks/<file>.md");
  process.exit(1);
}

const placeholderPattern = /<[^>\n]+>|\b(TBD|TODO|FIXME|XXX)\b|待补|待定|稍后补|稍后填写|以后补|以后填写|以后完善|placeholder/i;
const artifactDirs = ["requests", "preflight", "specs", "evals", "tasks", "ai-logs"];
const checksByDir = new Map([
  ["requests", checkRequest],
  ["preflight", checkPreflight],
  ["specs", checkSpec],
  ["evals", checkEval],
  ["tasks", checkTask],
  ["ai-logs", checkLog],
]);

let failed = false;
let checked = 0;
const checkedFiles = new Set();

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

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function toProjectPath(value) {
  return path.relative(projectRoot, path.resolve(projectRoot, value)).replaceAll(path.sep, "/");
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
    if (mode !== "draft" && !hasMeaning(body)) {
      fail(`${file} section has no meaningful content: ${section}`);
    }
  }
}

function requireNoPlaceholders(file, content) {
  if (mode === "draft") return;
  const match = stripCode(content).match(placeholderPattern);
  if (match) fail(`${file} contains placeholder content: ${match[0]}`);
}

function stripCode(content) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]+`/g, " ");
}

function requireSingleChoice(file, content, section, choices) {
  if (mode === "draft") return;
  const body = sectionBody(content, section);
  if (body === null) {
    fail(`${file} missing section: ${section}`);
    return;
  }
  const found = choices.filter((choice) => new RegExp(`\\b${escapeRegExp(choice)}\\b`).test(body));
  if (body.includes("/") || found.length !== 1) {
    fail(`${file} section must choose exactly one value for ${section}: ${choices.join(", ")}`);
  }
}

function refsFromSection(content, section) {
  const body = sectionBody(content, section);
  if (!body) return [];
  return [...body.matchAll(/`([^`]+\.md)`/g)].map((match) => match[1]);
}

function firstRefFromSection(content, section) {
  return refsFromSection(content, section)[0] || null;
}

function labeledRefFromSection(content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return null;
  const pattern = new RegExp(`${escapeRegExp(label)}:\\s*\\\`([^\\\`]+\\.md)\\\``, "i");
  const match = body.match(pattern);
  return match ? match[1] : null;
}

function requireExistingRefs(file, content, section) {
  for (const ref of refsFromSection(content, section)) {
    if (ref.includes("<")) {
      if (mode !== "draft") fail(`${file} references placeholder file in ${section}: ${ref}`);
      continue;
    }
    const full = path.resolve(projectRoot, ref);
    if (!fs.existsSync(full)) fail(`${file} references missing file: ${ref}`);
  }
}

function requireFilledColonLines(file, content, section) {
  if (mode === "draft") return;
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
  if (mode === "draft") return;
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

function labeledValue(content, section, label) {
  const body = sectionBody(content, section);
  if (!body) return "";
  const pattern = new RegExp(`^${escapeRegExp(label)}:[^\\S\\r\\n]*(.*)$`, "im");
  const match = body.match(pattern);
  return match ? match[1].trim() : "";
}

function checkedRiskCount(content) {
  const body = sectionBody(content, "Risk Gate") || "";
  return [...body.matchAll(/-\s*\[[xX]\]/g)].length;
}

function readProjectFile(ref) {
  const full = path.resolve(projectRoot, ref);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

function normalizeRef(ref) {
  return ref ? toProjectPath(ref) : null;
}

function requireTaskGraph(file, content) {
  if (mode === "draft") return;
  const taskSpecRef = normalizeRef(firstRefFromSection(content, "Related Spec"));
  const taskEvalRef = normalizeRef(firstRefFromSection(content, "Related Eval"));
  if (!taskSpecRef || !taskEvalRef) {
    fail(`${file} must reference one related spec and one related eval`);
    return;
  }

  const evalContent = readProjectFile(taskEvalRef);
  const specContent = readProjectFile(taskSpecRef);
  if (!evalContent || !specContent) return;

  const evalSpecRef = normalizeRef(firstRefFromSection(evalContent, "Related Spec"));
  if (!evalSpecRef) {
    fail(`${taskEvalRef} must reference its related spec`);
  } else if (evalSpecRef !== taskSpecRef) {
    fail(`${file} references ${taskSpecRef}, but ${taskEvalRef} references ${evalSpecRef}`);
  }

  const requestRef = normalizeRef(labeledRefFromSection(specContent, "Source", "Request"));
  const preflightRef = normalizeRef(labeledRefFromSection(specContent, "Source", "Preflight"));
  if (!requestRef) {
    fail(`${taskSpecRef} Source must reference its request`);
    return;
  }
  if (!fs.existsSync(path.join(projectRoot, requestRef))) {
    fail(`${taskSpecRef} Source references missing request: ${requestRef}`);
  }
  if (preflightRef) {
    const preflightContent = readProjectFile(preflightRef);
    if (!preflightContent) {
      fail(`${taskSpecRef} Source references missing preflight: ${preflightRef}`);
      return;
    }
    const preflightRequestRef = normalizeRef(firstRefFromSection(preflightContent, "Source Request"));
    if (!preflightRequestRef) {
      fail(`${preflightRef} must reference its source request`);
    } else if (preflightRequestRef !== requestRef) {
      fail(`${taskSpecRef} references request ${requestRef}, but ${preflightRef} references ${preflightRequestRef}`);
    }
    const suggestedSpecs = refsFromSection(preflightContent, "Suggested Specs").map(normalizeRef);
    if (!suggestedSpecs.includes(taskSpecRef)) {
      fail(`${preflightRef} Suggested Specs must include ${taskSpecRef}`);
    }
  }
}

function requireHumanApproval(file, content) {
  if (mode === "draft") return;
  const riskCount = checkedRiskCount(content);
  const approval = sectionBody(content, "Human Approval");
  if (approval === null) {
    fail(`${file} missing section: Human Approval`);
    return;
  }

  const required = labeledValue(content, "Human Approval", "Required");
  const status = labeledValue(content, "Human Approval", "Status");
  const approvalScope = labeledValue(content, "Human Approval", "Approval scope");
  const approvedBy = labeledValue(content, "Human Approval", "Approved by");
  const approvedAt = labeledValue(content, "Human Approval", "Approved at");

  if (riskCount > 0) {
    if (!/^Yes$/i.test(required)) {
      fail(`${file} checked risk items require Human Approval Required: Yes`);
    }
    if (!/^(Pending|Approved)$/i.test(status)) {
      fail(`${file} checked risk items require Human Approval Status: Pending or Approved`);
    }
    if (!approvalScope || /^Not Required$/i.test(approvalScope)) {
      fail(`${file} checked risk items require Human Approval scope`);
    }
    if (mode === "implementation" && !/^Approved$/i.test(status)) {
      fail(`${file} implementation mode requires Human Approval Status: Approved`);
    }
  } else {
    if (!/^No$/i.test(required)) {
      fail(`${file} no checked risk items should use Human Approval Required: No`);
    }
    if (!/^Not Required$/i.test(status)) {
      fail(`${file} no checked risk items should use Human Approval Status: Not Required`);
    }
  }

  if (/^Approved$/i.test(status)) {
    if (!approvedBy) fail(`${file} approved Human Approval must include Approved by`);
    if (!approvedAt) fail(`${file} approved Human Approval must include Approved at`);
  }
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
    "Source",
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
    "Human Approval",
    "Stop Conditions",
    "Final Report Required",
  ]);
  requireSingleChoice(file, content, "Task Level", ["L0", "L1", "L2", "L3"]);
  requireExistingRefs(file, content, "Related Spec");
  requireExistingRefs(file, content, "Related Eval");
  requireSubList(file, content, "Scope", "Allowed:");
  requireSubList(file, content, "Scope", "Not allowed:");

  const budget = sectionBody(content, "AI Budget") || "";
  if (mode !== "draft") {
    if (!/Max agent runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max agent runs`);
    if (!/Max repair runs:\s*\d+/i.test(budget)) fail(`${file} AI Budget must include numeric Max repair runs`);
    if (!/Stop if:\s*\S+/i.test(budget)) fail(`${file} AI Budget must include concrete Stop if condition`);
  }

  requireHumanApproval(file, content);
  requireTaskGraph(file, content);
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
  if (mode !== "draft") {
    if (!/AI runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric AI runs`);
    if (!/Repair runs:\s*\d+/i.test(cost)) fail(`${file} Cost / Usage must include numeric Repair runs`);
  }
}

function checkerForFile(filePath) {
  const relPath = rel(filePath);
  const topDir = relPath.split("/")[0];
  return checksByDir.get(topDir) || null;
}

function addFile(files, relPath) {
  if (!relPath || relPath.includes("<")) return;
  const full = path.resolve(projectRoot, relPath);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    files.set(rel(full), full);
  }
}

function filesForTask(taskRef) {
  const files = new Map();
  const taskPath = toProjectPath(taskRef);
  addFile(files, taskPath);
  const taskContent = readProjectFile(taskPath);
  if (!taskContent) {
    fail(`task not found: ${taskRef}`);
    return files;
  }
  const specRef = normalizeRef(firstRefFromSection(taskContent, "Related Spec"));
  const evalRef = normalizeRef(firstRefFromSection(taskContent, "Related Eval"));
  addFile(files, evalRef);
  addFile(files, specRef);

  const specContent = specRef ? readProjectFile(specRef) : null;
  if (specContent) {
    addFile(files, labeledRefFromSection(specContent, "Source", "Request"));
    addFile(files, labeledRefFromSection(specContent, "Source", "Preflight"));
  }
  return [...files.values()];
}

function changedArtifactFiles() {
  const result = spawnSync("git", ["diff", "--name-only", "--diff-filter=ACMR", changedBase, "--", ...artifactDirs], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(`changed-only diff failed from ${changedBase}: ${result.stderr || result.stdout}`);
    return [];
  }
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.endsWith(".md"))
    .map((line) => path.join(projectRoot, line))
    .filter((file) => fs.existsSync(file))
    .sort();
}

function filesToCheck() {
  if (taskArg) return filesForTask(taskArg);
  if (changedOnly) return changedArtifactFiles();
  const files = [];
  for (const dir of artifactDirs) {
    const dirFiles = listMarkdownFiles(dir);
    if (dirFiles.length === 0) warn(`${dir} has no markdown artifacts`);
    files.push(...dirFiles);
  }
  return files;
}

for (const filePath of filesToCheck()) {
  const file = rel(filePath);
  if (checkedFiles.has(file)) continue;
  checkedFiles.add(file);
  const checker = checkerForFile(filePath);
  if (!checker) continue;
  checked += 1;
  const content = fs.readFileSync(filePath, "utf8");
  requireNoPlaceholders(file, content);
  checker(file, content);
}

if (failed) {
  console.error("");
  console.error(`Workflow artifact quality check failed for ${checked} file(s) in ${mode} mode.`);
  process.exit(1);
}

console.log("");
pass(`workflow artifact quality check passed for ${checked} file(s) in ${mode} mode`);
