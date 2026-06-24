#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd(), process.argv[2] || ".");

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
  return results;
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
    .find((line) => line.length > 0) || "";
}

function countNumberAfter(label, content) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`${escaped}\\s*:?\\s*(\\d+)`, "i"));
  return match ? Number(match[1]) : 0;
}

function bullets(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

const files = listMarkdownFiles("ai-logs");
const improvements = listMarkdownFiles("workflow-improvements");
const skillCandidates = listMarkdownFiles("skill-candidates");
const automationProposals = listMarkdownFiles("automation-proposals");
const proposals = listMarkdownFiles("dev-kit-proposals");

const summary = {
  total: files.length,
  results: new Map(),
  aiRuns: 0,
  repairRuns: 0,
  rework: 0,
  problems: new Map(),
  lessons: new Map(),
  triggers: new Map(),
};

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const result = firstLine(section(content, "Result")) || "Unknown";
  summary.results.set(result, (summary.results.get(result) || 0) + 1);
  summary.aiRuns += countNumberAfter("AI runs", content);
  summary.repairRuns += countNumberAfter("Repair runs", content);
  summary.rework += countNumberAfter("Rework", content);

  for (const problem of bullets(section(content, "Problems"))) {
    summary.problems.set(problem, (summary.problems.get(problem) || 0) + 1);
  }
  for (const lesson of bullets(section(content, "Lessons"))) {
    summary.lessons.set(lesson, (summary.lessons.get(lesson) || 0) + 1);
  }
  for (const trigger of bullets(section(content, "Workflow Improvement Trigger"))) {
    if (trigger.includes("[x]") || trigger.includes("[X]")) {
      const normalized = trigger.replace(/\[[xX]\]/, "").trim();
      summary.triggers.set(normalized, (summary.triggers.get(normalized) || 0) + 1);
    }
  }
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

console.log("# AI Workflow Learning Summary");
console.log("");
console.log(`Project: ${projectRoot}`);
console.log("");
console.log("## Counts");
console.log("");
console.log(`- AI task logs: ${summary.total}`);
console.log(`- Workflow improvements: ${improvements.length}`);
console.log(`- Skill candidates: ${skillCandidates.length}`);
console.log(`- Automation proposals: ${automationProposals.length}`);
console.log(`- Dev kit proposals: ${proposals.length}`);
console.log(`- AI runs: ${summary.aiRuns}`);
console.log(`- Repair runs: ${summary.repairRuns}`);
console.log(`- Rework count: ${summary.rework}`);
console.log("");

console.log("## Results");
console.log("");
if (summary.results.size === 0) {
  console.log("- No result data.");
} else {
  for (const [result, count] of topEntries(summary.results)) {
    console.log(`- ${result}: ${count}`);
  }
}
console.log("");

console.log("## Repeated Problems");
console.log("");
const repeatedProblems = topEntries(summary.problems).filter(([, count]) => count >= 2);
if (repeatedProblems.length === 0) {
  console.log("- No repeated problems detected.");
} else {
  for (const [problem, count] of repeatedProblems) {
    console.log(`- ${problem}: ${count}`);
  }
}
console.log("");

console.log("## Top Lessons");
console.log("");
if (summary.lessons.size === 0) {
  console.log("- No lessons recorded.");
} else {
  for (const [lesson, count] of topEntries(summary.lessons)) {
    console.log(`- ${lesson}: ${count}`);
  }
}
console.log("");

console.log("## Improvement Triggers");
console.log("");
if (summary.triggers.size === 0) {
  console.log("- No checked workflow improvement triggers.");
} else {
  for (const [trigger, count] of topEntries(summary.triggers)) {
    console.log(`- ${trigger}: ${count}`);
  }
}
console.log("");

console.log("## Suggested Next Step");
console.log("");
if (repeatedProblems.length > 0) {
  console.log("- Create or update `workflow-improvements/` for repeated problems.");
  if (improvements.length > 0 && skillCandidates.length === 0) {
    console.log("- Evaluate whether repeated workflow improvements need `skill-candidates/` entries.");
  }
} else if (summary.total > 0) {
  console.log("- Continue collecting logs until repeated patterns emerge.");
} else {
  console.log("- Add AI task logs after L1/L2/L3 work.");
}
