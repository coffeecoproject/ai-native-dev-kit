#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";
import { walkFiles } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const minScore = args["min-score"] ? Number(args["min-score"]) : null;
const knownFlags = new Set(["json", "min-score"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

if (minScore !== null && (!Number.isFinite(minScore) || minScore < 0 || minScore > 100)) {
  console.error("FAIL --min-score must be a number from 0 to 100");
  process.exit(1);
}

const reportDirs = [
  "final-reports",
  "status-reports",
  "decision-briefs",
  "review-summaries",
  "customer-handoffs",
];
const requiredQualitySections = [
  "Human Summary",
  "Technical Details",
  "Audit Notes",
];
let failed = false;
const results = [];

function rel(fullPath) {
  return path.relative(root, fullPath).replaceAll(path.sep, "/") || ".";
}

function listReportFiles() {
  const files = [];
  for (const dir of reportDirs) {
    files.push(...walkFiles(path.join(root, dir), { extensions: [".md"] }));
  }
  return files.sort();
}

function hasSection(content, heading) {
  return new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m").test(content);
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*]\s*/gm, "")
    .trim();
}

function bodyHasConcreteText(content, heading) {
  const body = stripMarkdown(sectionBody(content, heading));
  if (!body) return false;
  if (/^(one-sentence|pending|tbd|todo|n\/a|not run|pass \/ fail|yes \/ no|-)$/i.test(body)) return false;
  return body.split(/\s+/).filter(Boolean).length >= 4;
}

function countMatches(content, pattern) {
  return (content.match(pattern) || []).length;
}

function scoreFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const checks = [];
  let score = 0;

  function add(points, passed, label) {
    checks.push({ label, passed, points });
    if (passed) score += points;
  }

  for (const section of requiredQualitySections) {
    add(10, hasSection(content, section), `${section} section exists`);
  }
  add(12, bodyHasConcreteText(content, "Human Summary"), "Human Summary is concrete");
  add(10, hasSection(content, "Next Safe Action") || hasSection(content, "Recommended Next Step"), "next safe action is present");
  add(10, hasSection(content, "Human Decisions Needed") || hasSection(content, "What I Need From You"), "human decision section is present");
  add(10, hasSection(content, "Next-Step Suggestions") || /No follow-up|No next step|Not applicable/i.test(content), "next-step boundary is present");
  add(8, /evidence refs?:|evidence ref|commands run|verified|verification/i.test(content), "evidence or verification is present");
  add(8, /risk|approval|approved|exception|residual/i.test(content), "risk or approval context is present");
  add(6, countMatches(content, /\b(NEXT_ACTION|ADOPTION_MODE|EVIDENCE_MISSING|BASELINE_STATE|PROJECT_STATE)\b/g) === 0 || hasSection(content, "Human Summary"), "machine terms are paired with human summary");
  add(6, !/\b(done|safe|approved)\b/i.test(sectionBody(content, "Next-Step Suggestions")) || /Can AI do now\?/i.test(sectionBody(content, "Next-Step Suggestions")), "next-step suggestions include execution boundary");

  const normalizedScore = Math.min(100, score);
  const missing = checks.filter((check) => !check.passed).map((check) => check.label);
  return {
    file: rel(filePath),
    score: normalizedScore,
    status: minScore !== null && normalizedScore < minScore ? "FAIL" : "PASS",
    missing,
  };
}

const files = listReportFiles();
for (const file of files) {
  const result = scoreFile(file);
  results.push(result);
  if (result.status === "FAIL") failed = true;
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    minScore,
    fileCount: results.length,
    results,
  }, null, 2));
}

if (!outputJson) {
  console.log("# Output Quality Score");
  console.log("");
  if (files.length === 0) {
    console.log("No report files found.");
  }
  for (const result of results) {
    const prefix = result.status === "FAIL" ? "FAIL" : "PASS";
    console.log(`${prefix} ${result.file}: ${result.score}/100`);
    if (result.missing.length > 0) {
      console.log(`  Missing: ${result.missing.join("; ")}`);
    }
  }
}

if (failed) {
  if (!outputJson) {
    console.error("");
    console.error("Human Summary");
    console.error("One or more report outputs are below the requested quality score. Improve the human summary, decision routing, next safe action, evidence, or audit notes before treating the report as ready.");
  }
  process.exit(1);
}
