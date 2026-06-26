#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const statePath = path.join(projectRoot, ".ai-native", "daily-summary-state.json");
const now = new Date();
const sinceDays = Number(args["since-days"] || 1);
const writeState = Boolean(args["write-state"]);
const state = readJson(statePath);
const since = state.lastRunAt ? new Date(state.lastRunAt) : new Date(now.getTime() - sinceDays * 24 * 60 * 60 * 1000);

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

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

function listMarkdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      const nested = path.relative(projectRoot, full);
      results.push(...listMarkdownFiles(nested));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results.sort();
}

function recentFiles(files) {
  return files.filter((file) => fs.statSync(file).mtime > since);
}

function section(content, heading) {
  const pattern = new RegExp(`^## ${heading}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function firstLine(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) || "";
}

function bullets(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function checkedBullets(value) {
  return bullets(value)
    .filter((line) => line.includes("[x]") || line.includes("[X]"))
    .map((line) => line.replace(/\[[xX]\]/, "").trim());
}

function relative(file) {
  return path.relative(projectRoot, file);
}

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countBy(items) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function statusOf(file, fallbackHeading) {
  const content = fs.readFileSync(file, "utf8");
  return firstLine(section(content, "Status")) || firstLine(section(content, fallbackHeading)) || "Unknown";
}

const aiLogs = listMarkdownFiles("ai-logs");
const retros = listMarkdownFiles("workflow-retros");
const improvements = listMarkdownFiles("workflow-improvements");
const skillCandidates = listMarkdownFiles("skill-candidates");
const automationProposals = listMarkdownFiles("automation-proposals");
const proposals = listMarkdownFiles("dev-kit-proposals");
const reviewPackets = listMarkdownFiles("review-packets");
const reviewLoopReports = listMarkdownFiles("review-loop-reports");

const recentAiLogs = recentFiles(aiLogs);
const recentRetros = recentFiles(retros);
const recentImprovements = recentFiles(improvements);
const recentSkillCandidates = recentFiles(skillCandidates);
const recentAutomationProposals = recentFiles(automationProposals);
const recentProposals = recentFiles(proposals);
const recentReviewPackets = recentFiles(reviewPackets);
const recentReviewLoopReports = recentFiles(reviewLoopReports);

const allProblems = [];
const recentProblems = [];
const recentTriggers = [];

for (const file of aiLogs) {
  const content = fs.readFileSync(file, "utf8");
  const problems = bullets(section(content, "Problems"));
  allProblems.push(...problems);
  if (recentAiLogs.includes(file)) {
    recentProblems.push(...problems);
    recentTriggers.push(...checkedBullets(section(content, "Workflow Improvement Trigger")));
  }
}

const repeatedProblems = countBy(allProblems).filter(([, count]) => count >= 2);
const repeatedRecentProblems = countBy(recentProblems).filter(([, count]) => count >= 2);
const pendingSkillCandidates = skillCandidates.filter((file) => {
  const status = statusOf(file, "Human Review Decision").toLowerCase();
  return !["rejected", "superseded"].some((closed) => status.includes(closed));
});
const pendingAutomationProposals = automationProposals.filter((file) => {
  const status = statusOf(file, "Decision").toLowerCase();
  return !["reject", "delete", "superseded"].some((closed) => status.includes(closed));
});
const pendingProposals = proposals.filter((file) => {
  const status = statusOf(file, "Decision").toLowerCase();
  return !["accepted", "rejected"].some((closed) => status.includes(closed));
});
const pendingReviewPackets = reviewPackets.filter((file) => {
  const status = statusOf(file, "Packet Status").toLowerCase();
  return !status.includes("reviewed");
});
const pendingReviewLoopReports = reviewLoopReports.filter((file) => {
  const content = fs.readFileSync(file, "utf8").toLowerCase();
  return !content.includes("final status: done")
    && !content.includes("final status: auto_fixed")
    && !content.includes("final status: blocked");
});

const signals = [];
if (recentAiLogs.length > 0) signals.push(`${recentAiLogs.length} new AI task log(s) since last summary window`);
if (recentRetros.length > 0) signals.push(`${recentRetros.length} updated workflow retro(s)`);
if (recentImprovements.length > 0) signals.push(`${recentImprovements.length} updated workflow improvement(s)`);
if (recentSkillCandidates.length > 0) signals.push(`${recentSkillCandidates.length} updated Skill candidate(s)`);
if (recentAutomationProposals.length > 0) signals.push(`${recentAutomationProposals.length} updated automation proposal(s)`);
if (recentProposals.length > 0) signals.push(`${recentProposals.length} updated dev-kit proposal(s)`);
if (recentReviewPackets.length > 0) signals.push(`${recentReviewPackets.length} updated review packet(s)`);
if (recentReviewLoopReports.length > 0) signals.push(`${recentReviewLoopReports.length} updated review loop report(s)`);
if (repeatedRecentProblems.length > 0) signals.push(`${repeatedRecentProblems.length} repeated problem(s) in recent logs`);
if (recentTriggers.length > 0) signals.push(`${recentTriggers.length} checked workflow trigger(s) in recent logs`);
if (pendingSkillCandidates.length > 0) signals.push(`${pendingSkillCandidates.length} Skill candidate(s) need human review or disposition`);
if (pendingAutomationProposals.length > 0) signals.push(`${pendingAutomationProposals.length} automation proposal(s) need human review or disposition`);
if (pendingProposals.length > 0) signals.push(`${pendingProposals.length} dev-kit proposal(s) need review or disposition`);
if (pendingReviewPackets.length > 0) signals.push(`${pendingReviewPackets.length} review packet(s) need independent review or disposition`);
if (pendingReviewLoopReports.length > 0) signals.push(`${pendingReviewLoopReports.length} review loop report(s) need final disposition`);

const hasAction = signals.length > 0;
const summaryPath = `workflow-retros/${localDate(now)}-daily-summary.md`;

console.log("# Workflow Daily Summary Check");
console.log("");
console.log(`Project: ${projectRoot}`);
console.log(`Window start: ${since.toISOString()}`);
console.log(`Generated at: ${now.toISOString()}`);
console.log("");
console.log("## Decision");
console.log("");
console.log(hasAction ? "ACTION_REQUIRED" : "NO_ACTION");
console.log("");
console.log("## Counts");
console.log("");
console.log(`- AI task logs: ${aiLogs.length}`);
console.log(`- New AI task logs: ${recentAiLogs.length}`);
console.log(`- Workflow retros: ${retros.length}`);
console.log(`- Workflow improvements: ${improvements.length}`);
console.log(`- Skill candidates: ${skillCandidates.length}`);
console.log(`- Automation proposals: ${automationProposals.length}`);
console.log(`- Dev-kit proposals: ${proposals.length}`);
console.log(`- Review packets: ${reviewPackets.length}`);
console.log(`- Review loop reports: ${reviewLoopReports.length}`);
console.log("");
console.log("## Signals");
console.log("");
if (signals.length === 0) {
  console.log("- No new workflow signal detected.");
} else {
  for (const signal of signals) console.log(`- ${signal}`);
}
console.log("");
console.log("## Recent Files");
console.log("");
const recentGroups = [
  ["AI task logs", recentAiLogs],
  ["Workflow retros", recentRetros],
  ["Workflow improvements", recentImprovements],
  ["Skill candidates", recentSkillCandidates],
  ["Automation proposals", recentAutomationProposals],
  ["Dev-kit proposals", recentProposals],
  ["Review packets", recentReviewPackets],
  ["Review loop reports", recentReviewLoopReports],
];
for (const [label, files] of recentGroups) {
  console.log(`### ${label}`);
  console.log("");
  if (files.length === 0) {
    console.log("- None");
  } else {
    for (const file of files) console.log(`- ${relative(file)}`);
  }
  console.log("");
}
console.log("## Repeated Problems");
console.log("");
if (repeatedProblems.length === 0) {
  console.log("- No repeated problems detected.");
} else {
  for (const [problem, count] of repeatedProblems.slice(0, 10)) {
    console.log(`- ${problem}: ${count}`);
  }
}
console.log("");
console.log("## Checked Triggers");
console.log("");
if (recentTriggers.length === 0) {
  console.log("- No checked triggers in recent logs.");
} else {
  for (const [trigger, count] of countBy(recentTriggers).slice(0, 10)) {
    console.log(`- ${trigger}: ${count}`);
  }
}
console.log("");
console.log("## Recommended Action");
console.log("");
if (!hasAction) {
  console.log("- No summary file needed today.");
} else {
  console.log(`- Create or update \`${summaryPath}\` using \`.ai-native/templates/workflow-daily-summary.md\`.`);
  if (repeatedProblems.length > 0) {
    console.log("- Create or update `workflow-improvements/` for repeated problems that are not already handled.");
  }
  if (recentTriggers.some((trigger) => trigger.includes("skill-candidates")) || (recentImprovements.length > 0 && skillCandidates.length === 0)) {
    console.log("- Evaluate whether a `skill-candidates/` draft is justified.");
  }
  if (pendingSkillCandidates.length > 0) {
    console.log("- Review pending Skill candidates with `.ai-native/checklists/skill-review.md`.");
  }
  if (pendingAutomationProposals.length > 0) {
    console.log("- Review pending automation proposals with `.ai-native/checklists/automation-review.md`.");
  }
  if (pendingReviewPackets.length > 0) {
    console.log("- Review pending `review-packets/` entries or mark their outcome.");
  }
  if (pendingReviewLoopReports.length > 0) {
    console.log("- Review pending `review-loop-reports/` entries and close DONE, AUTO_FIXED, BLOCKED, or NEEDS_HUMAN_DECISION status.");
  }
}
console.log("");
console.log("## Guardrails");
console.log("");
console.log("- Do not modify business code from a daily summary run.");
console.log("- Do not create, update, install, or enable active Skills from daily automation.");
console.log("- Daily automation may draft retros, improvements, and Skill candidates only when signals exist.");

if (writeState) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify({
    lastRunAt: now.toISOString(),
    lastDecision: hasAction ? "ACTION_REQUIRED" : "NO_ACTION",
    lastSignalCount: signals.length,
    lastRecommendedSummary: hasAction ? summaryPath : null,
  }, null, 2)}\n`);
}
