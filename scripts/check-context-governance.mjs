#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/context-governance.md",
  "core/git-boundary.md",
  "templates/learning-candidate.md",
  "templates/context-correction-report.md",
  "templates/git-boundary-report.md",
  "checklists/context-governance-review.md",
  "checklists/git-boundary-review.md",
  "prompts/context-governance-agent.md",
  "docs/project-memory.md",
  "docs/git-boundary.md",
  "scripts/check-context-governance.mjs",
];

const requiredDirectories = [
  "learning-candidates",
  "context-corrections",
  "git-boundary-reports",
];

const candidateSections = [
  "Human Summary",
  "Observation",
  "Evidence",
  "Type",
  "Confidence",
  "Recommended Destination",
  "Human Decision",
  "AI Must Not",
];

const correctionSections = [
  "Human Summary",
  "Old Context",
  "New Evidence",
  "Impact",
  "Proposed Correction",
  "Source Of Truth To Update",
  "Human Decision",
  "Applied Changes",
  "Audit Notes",
];

const gitBoundarySections = [
  "Human Summary",
  "Change Scope",
  "Should Enter Git",
  "Conditional / Needs Human Decision",
  "Should Stay Local",
  "Never Commit Check",
  "Human Decision",
  "Audit Notes",
];

const allowedCandidateTypes = new Set([
  "PROJECT_FACT",
  "ENGINEERING_DECISION",
  "ENVIRONMENT_FACT",
  "FAILURE_MODE",
  "USER_PREFERENCE",
  "CHECKER_FALSE_POSITIVE",
  "OBSOLETE_CONTEXT",
]);

const allowedDecisions = new Set(["Pending", "Approved", "Rejected", "Needs Revision"]);
const allowedConfidence = new Set(["High", "Medium", "Low"]);

const secretPatterns = [
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/, reason: "GitHub token" },
  { pattern: /\bghp_[A-Za-z0-9_]{20,}\b/, reason: "GitHub token" },
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, reason: "private key" },
  { pattern: /\b[A-Za-z0-9_]*TOKEN[A-Za-z0-9_]*\s*=\s*["']?[A-Za-z0-9_\-]{16,}/i, reason: "token assignment" },
  { pattern: /\b[A-Za-z0-9_]*SECRET[A-Za-z0-9_]*\s*=\s*["']?[A-Za-z0-9_\-]{16,}/i, reason: "secret assignment" },
  { pattern: /\bDATABASE_URL\s*=\s*["']?(postgres|mysql|mongodb):\/\/[^:\s]+:[^@\s]+@/i, reason: "database URL with credentials" },
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Context Governance Check");
  console.log("");
}

for (const file of requiredAssets) {
  const resolved = resolveAsset(file);
  if (resolved) pass(`${displayAsset(file, resolved)} exists`);
  else fail(`missing ${file}`);
}

for (const dir of requiredDirectories) {
  if (exists(dir)) pass(`${dir} exists`);
  else fail(`missing ${dir}`);
}

checkCoreContent();
checkLearningCandidates();
checkContextCorrections();
checkGitBoundaryReports();
scanForSecrets();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.4 release and workflow artifact checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const context = readResolved("core/context-governance.md");
  if (context) {
    for (const marker of [
      "Codex drafts. Humans confirm.",
      "Context Authority Order",
      "Git-backed source of truth",
      "Only `CONFIRMED` context can become a project rule",
      "Model memory must not override Git-backed context",
    ]) {
      if (context.includes(marker)) pass(`context governance includes ${marker}`);
      else fail(`context governance missing ${marker}`);
    }
  }

  const gitBoundary = readResolved("core/git-boundary.md");
  if (gitBoundary) {
    for (const marker of [
      "Should Enter Git",
      "Conditional Git Artifacts",
      "Default Local Only",
      "Never Commit",
      "Git Boundary Report",
    ]) {
      if (gitBoundary.includes(marker)) pass(`git boundary includes ${marker}`);
      else fail(`git boundary missing ${marker}`);
    }
  }
}

function checkLearningCandidates() {
  for (const file of markdownFiles("learning-candidates")) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of candidateSections) {
      requireSection(content, section, label);
    }

    const decision = firstDecision(content);
    if (decision && !allowedDecisions.has(decision)) {
      fail(`${label} has invalid Human Decision: ${decision}`);
    } else if (decision) {
      pass(`${label} has valid Human Decision`);
    }

    const confidence = firstSectionValue(content, "Confidence");
    if (confidence && !allowedConfidence.has(confidence)) {
      fail(`${label} has invalid Confidence: ${confidence}`);
    } else if (confidence) {
      pass(`${label} has valid Confidence`);
    }

    const type = firstListCodeValue(sectionBody(content, "Type"));
    if (type && !allowedCandidateTypes.has(type)) {
      fail(`${label} has invalid Type: ${type}`);
    } else if (type) {
      pass(`${label} has valid Type`);
    }

    if (decision === "Approved") {
      requireNonEmptySection(content, "Recommended Destination", label);
      requireEvidence(content, label);
    }
    if (decision === "Rejected") {
      requireNonEmptySection(content, "Rejection Reason", label);
    }
  }
}

function checkContextCorrections() {
  for (const file of markdownFiles("context-corrections")) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of correctionSections) {
      requireSection(content, section, label);
    }

    const decision = firstDecision(content);
    if (decision && !allowedDecisions.has(decision)) {
      fail(`${label} has invalid Human Decision: ${decision}`);
    } else if (decision) {
      pass(`${label} has valid Human Decision`);
    }

    if (decision === "Approved") {
      requireNonEmptySection(content, "New Evidence", label);
      requireNonEmptySection(content, "Source Of Truth To Update", label);
      requireNonEmptySection(content, "Applied Changes", label);
    }
  }
}

function checkGitBoundaryReports() {
  for (const file of markdownFiles("git-boundary-reports")) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of gitBoundarySections) {
      requireSection(content, section, label);
    }

    const decision = firstDecision(content);
    if (decision && !allowedDecisions.has(decision)) {
      fail(`${label} has invalid Human Decision: ${decision}`);
    } else if (decision) {
      pass(`${label} has valid Human Decision`);
    }

    if (!/Secrets\s*\|\s*(PASS|FAIL|NOT_APPLICABLE)/i.test(content)) {
      fail(`${label} must record Never Commit Check status for Secrets`);
    } else {
      pass(`${label} records Never Commit Check status for Secrets`);
    }
  }
}

function scanForSecrets() {
  const roots = [
    "learning-candidates",
    "context-corrections",
    "git-boundary-reports",
    "docs/project-memory.md",
    "docs/git-boundary.md",
    "core/context-governance.md",
    "core/git-boundary.md",
  ];
  for (const root of roots) {
    const full = path.join(projectRoot, root);
    if (!fs.existsSync(full)) continue;
    const files = fs.statSync(full).isDirectory() ? markdownFiles(root) : [full];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      for (const entry of secretPatterns) {
        if (entry.pattern.test(content)) fail(`${rel(file)} contains forbidden secret-like content: ${entry.reason}`);
      }
    }
  }
  pass("context governance artifacts scanned for obvious secret-like content");
}

function checkSourceEvidence() {
  for (const file of [
    "docs/project-memory-context-governance-1.4-plan.md",
    "examples/1.4-project-memory-context/README.md",
    "releases/1.4.0/release-record.md",
    "releases/1.4.0/known-limitations.md",
    "releases/1.4.0/self-check-report.md",
    "tasks/140-project-memory-context-governance.md",
    "review-loop-reports/140-project-memory-context-governance.md",
    "final-reports/140-project-memory-context-governance.md",
  ]) {
    if (exists(file)) pass(`1.4 source evidence exists ${file}`);
    else fail(`missing 1.4 source evidence ${file}`);
  }

  for (const [name, command, expected] of [
    ["bad approved learning without evidence", ["test-fixtures/bad/bad-learning-approved-without-evidence"], "approved learning candidate must include evidence"],
    ["bad correction without evidence", ["test-fixtures/bad/bad-context-correction-missing-evidence"], "New Evidence"],
    ["bad git boundary secret", ["test-fixtures/bad/bad-git-boundary-secret"], "secret-like content"],
  ]) {
    const fixtureRoot = path.join(projectRoot, command[0]);
    const result = runSelf(fixtureRoot);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`context governance rejects ${name}`);
    } else {
      fail(`context governance must reject ${name}: ${output}`);
    }
  }
}

function runSelf(root) {
  return spawnSync(process.execPath, [path.join(projectRoot, "scripts", "check-context-governance.mjs"), root], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function requireSection(content, section, label) {
  if (new RegExp(`^## ${escapeRegExp(section)}\\s*$`, "m").test(content)) {
    pass(`${label} includes ${section}`);
  } else {
    fail(`${label} missing section: ${section}`);
  }
}

function requireNonEmptySection(content, section, label) {
  const body = sectionBody(content, section);
  const meaningful = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<!--") && line !== "-" && line !== "None");
  if (meaningful.length > 0) pass(`${label} has non-empty ${section}`);
  else fail(`${label} missing required content in ${section}`);
}

function requireEvidence(content, label) {
  const body = sectionBody(content, "Evidence");
  const evidenceRows = body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\|/.test(line) && !/^\|\s*-/.test(line) && !/Evidence\s*\|/.test(line));
  const hasEvidence = evidenceRows.some((row) => row.split("|").map((part) => part.trim()).filter(Boolean).length >= 3);
  if (hasEvidence) pass(`${label} approved learning candidate includes evidence`);
  else fail(`${label} approved learning candidate must include evidence`);
}

function firstDecision(content) {
  const value = firstSectionValue(content, "Human Decision");
  if (!value) return null;
  const match = value.match(/\b(Pending|Approved|Rejected|Needs Revision)\b/i);
  if (!match) return value;
  return match[1].replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstSectionValue(content, section) {
  const body = sectionBody(content, section);
  const line = body.split("\n").map((item) => item.trim()).find((item) => item && !item.startsWith("-") && !item.startsWith("|"));
  return line || "";
}

function firstListCodeValue(body) {
  const codeMatch = body.match(/`([A-Z_]+)`/);
  if (codeMatch) return codeMatch[1];
  const lineMatch = body.match(/-\s*([A-Z_]+)/);
  return lineMatch ? lineMatch[1] : "";
}

function sectionBody(content, section) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(section)}\\s*$`, "m"));
  if (!match) return "";
  const start = match.index + match[0].length;
  const bodyStart = content.indexOf("\n", start) + 1;
  const rest = content.slice(bodyStart);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

function markdownFiles(relativeDir) {
  const root = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(root)) return [];
  const files = [];
  walk(root, files);
  return files.filter((file) => file.endsWith(".md"));
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
}

function resolveAsset(file) {
  const direct = path.join(projectRoot, file);
  if (fs.existsSync(direct)) return direct;
  if (/^(core|templates|prompts|checklists|docs)\//.test(file)) {
    const aiNative = path.join(projectRoot, ".ai-native", file);
    if (fs.existsSync(aiNative)) return aiNative;
  }
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(file, resolved) {
  return path.relative(projectRoot, resolved).replace(/\\/g, "/") || file;
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replace(/\\/g, "/") || path.basename(file);
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      checks,
    }, null, 2));
  }
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Context governance check passed.");
  }
}
