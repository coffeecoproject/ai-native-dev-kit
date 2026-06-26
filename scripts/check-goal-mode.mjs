#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const knownFlags = new Set(["goal-card", "json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const legalModes = new Set([
  "DISCUSS_ONLY",
  "ADOPT_PROJECT",
  "DEFINE_WORK",
  "IMPLEMENT_TASK",
  "REVIEW_TASK",
  "REPAIR_TASK",
  "BASELINE_DECISION",
  "HANDOFF_OR_REPORT",
]);

const requiredSections = [
  "Human Summary",
  "Goal",
  "Goal Mode",
  "Project State",
  "Risk And Level",
  "Engineering Baseline Touch",
  "Required Artifacts",
  "Allowed Actions",
  "Forbidden Actions",
  "Human Decisions Needed",
  "Next Safe Step",
  "Technical Details",
  "Audit Notes",
];

const results = [];
let failed = false;

function listGoalCards() {
  if (args["goal-card"]) {
    const rel = String(args["goal-card"]);
    const full = path.resolve(projectRoot, rel);
    if (!fs.existsSync(full)) {
      return [{ rel, missing: true }];
    }
    return [{ rel: path.relative(projectRoot, full).replaceAll(path.sep, "/"), full }];
  }

  const dir = path.join(projectRoot, "goal-cards");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => ({
      rel: path.join("goal-cards", file).replaceAll(path.sep, "/"),
      full: path.join(dir, file),
    }));
}

function selectedMode(content) {
  const body = sectionBody(content, "Goal Mode") || "";
  const selected = body.match(/\bSelected:\s*([A-Z_]+)/)?.[1];
  if (selected) return selected;
  const firstLegalMode = body.match(new RegExp(`\\b(${[...legalModes].join("|")})\\b`))?.[1];
  return firstLegalMode || null;
}

function hasConcreteBody(content, heading) {
  const body = sectionBody(content, heading);
  if (body === null) return false;
  const cleaned = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\|[-:\s|]+\|/g, "")
    .replace(/[-*]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0;
}

function requiredArtifacts(content) {
  return sectionBody(content, "Required Artifacts") || "";
}

function allowedActions(content) {
  return sectionBody(content, "Allowed Actions") || "";
}

function forbiddenActions(content) {
  return sectionBody(content, "Forbidden Actions") || "";
}

function humanDecisions(content) {
  return sectionBody(content, "Human Decisions Needed") || "";
}

function containsAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function artifactRequired(artifacts, label) {
  const lines = artifacts.split("\n");
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*Yes\\b`, "i");
  return lines.some((line) => pattern.test(line));
}

function artifactMentioned(artifacts, label) {
  return new RegExp(`\\b${escapeRegExp(label)}\\b`, "i").test(artifacts);
}

function addIssue(issues, message) {
  issues.push(message);
}

function validateGoalCard(card) {
  if (card.missing) {
    return {
      file: card.rel,
      status: "FAIL",
      issues: [`goal card does not exist: ${card.rel}`],
    };
  }

  const content = fs.readFileSync(card.full, "utf8");
  const issues = [];

  for (const section of requiredSections) {
    if (sectionBody(content, section) === null) {
      addIssue(issues, `missing section: ${section}`);
    } else if (!hasConcreteBody(content, section)) {
      addIssue(issues, `section has no concrete content: ${section}`);
    }
  }

  const mode = selectedMode(content);
  if (!mode) {
    addIssue(issues, "Goal Mode missing Selected value");
  } else if (!legalModes.has(mode)) {
    addIssue(issues, `invalid Goal Mode: ${mode}`);
  }

  const artifacts = requiredArtifacts(content);
  const allowed = allowedActions(content);
  const forbidden = forbiddenActions(content);
  const decisions = humanDecisions(content);
  const projectState = sectionBody(content, "Project State") || "";
  const riskAndLevel = sectionBody(content, "Risk And Level") || "";
  const all = content;

  if (mode === "DISCUSS_ONLY" && containsAny(allowed, [/\bwrite\b/i, /\bedit\b/i, /\bmodify\b/i, /\bimplement\b/i, /\binit-project\b/i, /\bupdate-workflow-assets\b/i])) {
    addIssue(issues, "DISCUSS_ONLY allowed actions must stay read-only");
  }

  if (mode === "ADOPT_PROJECT"
    && containsAny(projectState, [/ADOPTION_MODE:\s*READ_ONLY/i, /RUN_ADOPTION_ASSESSMENT/i])
    && containsAny(allowed, [/\binit-project\b/i, /--update-workflow-assets/i, /\bupdate workflow assets\b/i])) {
    addIssue(issues, "ADOPT_PROJECT with READ_ONLY adoption must not allow workflow asset writes");
  }

  if (mode === "DEFINE_WORK") {
    for (const label of ["Request", "Preflight", "Spec", "Eval", "Task"]) {
      if (!artifactMentioned(artifacts, label)) addIssue(issues, `DEFINE_WORK must route ${label}`);
    }
  }

  if (mode === "IMPLEMENT_TASK") {
    if (!artifactRequired(artifacts, "Task") && !/tasks\/[^\s`|)]+\.md/.test(all)) {
      addIssue(issues, "IMPLEMENT_TASK requires a selected task card");
    }
    if (!containsAny(forbidden, [/scope/i, /approval/i, /Risk Gate/i])) {
      addIssue(issues, "IMPLEMENT_TASK forbidden actions must preserve scope, approval, and Risk Gate boundaries");
    }
  }

  if (mode === "REVIEW_TASK" && !artifactMentioned(artifacts, "Review Packet")) {
    addIssue(issues, "REVIEW_TASK must use or create a Review Packet");
  }

  if (mode === "REPAIR_TASK") {
    if (!all.includes("AUTO_FIX")) {
      addIssue(issues, "REPAIR_TASK must reference AUTO_FIX findings");
    }
    if (!containsAny(forbidden, [/scope/i, /Human Approval/i, /Approval scope/i, /migration/i, /production config/i, /permission model/i, /architecture/i, /dependency/i])) {
      addIssue(issues, "REPAIR_TASK forbidden actions must block scope, approval, architecture, dependency, migration, production config, and permission changes");
    }
    if (containsAny(allowed, [/new dependency/i, /migration/i, /production config/i, /permission model/i, /architecture/i])) {
      addIssue(issues, "REPAIR_TASK allowed actions include forbidden repair authority");
    }
  }

  if (mode === "BASELINE_DECISION"
    && !artifactMentioned(artifacts, "Decision Brief")
    && !containsAny(decisions, [/human/i, /decision/i, /owner/i])) {
    addIssue(issues, "BASELINE_DECISION must route to a Decision Brief or explicit human decision");
  }

  if (mode === "HANDOFF_OR_REPORT"
    && !containsAny(artifacts, [/Final Report/i, /Handoff/i, /status report/i, /review summary/i, /customer handoff/i])) {
    addIssue(issues, "HANDOFF_OR_REPORT must route to final report, status report, review summary, or handoff artifact");
  }

  if (/\bL[23]\b/.test(riskAndLevel)) {
    if (!artifactMentioned(artifacts, "Review Packet")) {
      addIssue(issues, "L2/L3 Goal Card must plan Review Packet handling");
    }
    if (!artifactMentioned(artifacts, "Review Loop Report")) {
      addIssue(issues, "L2/L3 Goal Card must plan Review Loop Report handling");
    }
  }

  if (all.includes("RISK_DECISION") && !containsAny(decisions, [/RISK_DECISION/, /human/i, /decision/i])) {
    addIssue(issues, "RISK_DECISION must be routed to Human Decisions Needed");
  }

  if (containsAny(allowed, [/approve release/i, /accept risk/i, /self-approve/i, /Human Approval/i])) {
    addIssue(issues, "Allowed Actions must not approve release, accept risk, self-approve, or change Human Approval");
  }

  if (!containsAny(forbidden, [/Goal Card.*not.*approval/i, /not.*approval/i, /bypass/i])) {
    addIssue(issues, "Forbidden Actions must state that Goal Card does not bypass approval or gates");
  }

  return {
    file: card.rel,
    status: issues.length > 0 ? "FAIL" : "PASS",
    mode,
    issues,
  };
}

const cards = listGoalCards();

if (cards.length === 0) {
  if (outputJson) {
    console.log(JSON.stringify({
      status: "PASS",
      checkedGoalCards: 0,
      results: [],
    }, null, 2));
  } else {
    console.log("PASS no Goal Cards found; Goal Mode check skipped.");
  }
  process.exit(0);
}

for (const card of cards) {
  const result = validateGoalCard(card);
  results.push(result);
  if (result.status === "FAIL") failed = true;
  if (!outputJson) {
    if (result.status === "PASS") {
      console.log(`PASS ${result.file} (${result.mode})`);
    } else {
      for (const issue of result.issues) {
        console.error(`FAIL ${result.file}: ${issue}`);
      }
    }
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : "PASS",
    checkedGoalCards: results.length,
    results,
  }, null, 2));
}

if (failed) {
  process.exit(1);
}

if (!outputJson) {
  console.log("");
  console.log(`Goal Mode check passed (${results.length} goal card(s)).`);
}
