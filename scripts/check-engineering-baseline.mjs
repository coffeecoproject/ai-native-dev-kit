#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const strict = Boolean(args.strict);
const outputJson = Boolean(args.json);
const knownFlags = new Set(["strict", "json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const baselineRef = "docs/engineering-baseline.md";
const baselinePath = path.join(projectRoot, baselineRef);
const requiredSections = [
  "Human Summary",
  "Status",
  "Scope",
  "Code Structure Boundary",
  "Type Source of Truth",
  "DTO / Schema / Domain Rules",
  "API Contract Source",
  "Enum / String / Lookup / State Machine Decision Matrix",
  "Schema / Migration Rules",
  "Engineering Decision Required When",
  "Codex Behavior",
  "Open Engineering Decisions",
];
const advisorySections = [
  "Frontend Boundary",
];

let failed = false;
let pending = false;
let state = "READY";
const checks = [];

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function pass(message) {
  record("PASS", message);
}

function warn(message) {
  pending = true;
  record("PENDING", message);
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function splitRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function parseMarkdownTable(body) {
  if (!body) return [];
  const lines = body.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2) return [];
  return lines.slice(2)
    .map(splitRow)
    .filter((cells) => cells.some((cell) => stripMarkdown(cell)));
}

function isPlaceholderText(value) {
  const text = stripMarkdown(value);
  if (!text) return true;
  if (/^<[^>]+>$/.test(text)) return true;
  if (/^(yes\s*\/\s*no|no\s*\/\s*yes|draft\s*\/|pending\s*\/|approved\s*\/|confirmed\s*\/|not applicable\s*\/)/i.test(text)) return true;
  return false;
}

function bodyLooksPlaceholder(body) {
  const stripped = stripMarkdown(body);
  if (!stripped) return true;
  const withoutTableSyntax = stripped
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\|?[-:| ]+\|?$/.test(line))
    .join("\n");
  if (!withoutTableSyntax) return true;
  const nonPlaceholderLines = withoutTableSyntax
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line && !isPlaceholderText(line) && !/^#+\s*/.test(line));
  return nonPlaceholderLines.length === 0;
}

function hasPendingDecision(content) {
  return /\b(PENDING|DRAFT|PARTIAL|TBD|TODO|NEEDS_HUMAN|NEEDS HUMAN|待定|待确认|人工确认)\b/i.test(content);
}

function hasExplicitCodexBoundary(content) {
  return /must not.*(invent|create|upgrade|decide|standard|convention)|不得.*(自作主张|自行决定|创造|升级)|do not invent a project standard/i.test(content);
}

if (!outputJson) {
  console.log(`# Engineering Baseline Check (${strict ? "strict" : "advisory"})`);
  console.log("");
}

if (!fs.existsSync(baselinePath)) {
  state = "MISSING";
  const message = `missing ${baselineRef}`;
  if (strict) fail(message);
  else warn(`${message}; create it from .ai-native/templates/engineering-baseline.md before structural or schema work`);
} else {
  const content = fs.readFileSync(baselinePath, "utf8");
  pass(`${baselineRef} exists`);

  for (const section of requiredSections) {
    const body = sectionBody(content, section);
    if (body === null) {
      const message = `${baselineRef} missing section: ${section}`;
      if (strict) fail(message);
      else warn(message);
      continue;
    }
    if (bodyLooksPlaceholder(body)) {
      const message = `${baselineRef} section is empty or placeholder-only: ${section}`;
      if (strict) fail(message);
      else warn(message);
    } else {
      pass(`${section} section`);
    }
  }

  for (const section of advisorySections) {
    const body = sectionBody(content, section);
    if (body === null) {
      warn(`${baselineRef} optional section missing: ${section}`);
    } else if (bodyLooksPlaceholder(body)) {
      warn(`${baselineRef} optional section is empty or placeholder-only: ${section}`);
    } else {
      pass(`${section} section`);
    }
  }

  const openDecisionRows = parseMarkdownTable(sectionBody(content, "Open Engineering Decisions"));
  if (openDecisionRows.length > 0 && openDecisionRows.some((row) => row.join(" ").match(/\bPENDING\b|待定|待确认/i))) {
    const message = `${baselineRef} has open engineering decisions`;
    if (strict) fail(message);
    else warn(message);
  }

  if (hasPendingDecision(content)) {
    const message = `${baselineRef} contains draft or pending markers`;
    if (strict) fail(message);
    else warn(message);
  }

  if (hasExplicitCodexBoundary(content)) {
    pass("Codex decision boundary is explicit");
  } else {
    const message = `${baselineRef} must say Codex cannot create or upgrade project-wide engineering conventions without approval`;
    if (strict) fail(message);
    else warn(message);
  }
}

if (failed) state = "FAILED";
else if (pending && state !== "MISSING") state = "PENDING";

if (outputJson) {
  console.log(JSON.stringify({
    state,
    checkMode: strict ? "strict" : "advisory",
    checkStatus: failed ? "FAIL" : pending ? "PENDING" : "PASS",
    baselineRef,
    checks,
  }, null, 2));
}

if (failed) {
  process.exit(1);
}

if (!outputJson) {
  console.log("");
  if (state === "READY") {
    console.log("Engineering baseline is ready.");
  } else if (state === "MISSING") {
    console.log("Engineering baseline is missing. This is advisory for low-risk local work, but structural or schema decisions need a baseline or human decision.");
  } else {
    console.log("Engineering baseline is present but still pending. Codex may use local patterns for low-risk local work, but must not create project-wide engineering standards.");
  }
}
