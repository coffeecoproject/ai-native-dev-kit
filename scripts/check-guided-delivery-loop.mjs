#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "task"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const allowedLevels = new Set(["D0", "D1", "D2", "D3", "D4"]);
let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Guided Delivery Loop Check");
  console.log("");
}

checkActiveWorkThreads();
checkGuidedDecisionSummaries();
checkFinalReports();
checkSourceAssets();

emitAndExit();

function checkActiveWorkThreads() {
  const files = markdownFiles("active-work-threads");
  if (files.length === 0) {
    pass("active work thread check skipped: no active work threads");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    const mainline = sectionBody(content, "Current Mainline");
    if (meaningful(mainline)) pass(`${label} includes Current Mainline`);
    else fail(`${label} missing meaningful Current Mainline`);

    const parking = sectionBody(content, "Parking Lot");
    if (parking && /(\|\s*Yes\s*\|)|\b(execute now|backlog approved)\b/i.test(parking)) {
      fail(`${label} parking-lot items must not be approved or executable now`);
    } else if (parking) {
      pass(`${label} keeps Parking Lot non-executable`);
    }

    const mustNot = sectionBody(content, "What AI Must Not Do");
    if (mustNot && /D3|D4|parking-lot|parking lot/i.test(mustNot)) {
      pass(`${label} records AI stop boundaries`);
    } else {
      fail(`${label} must record AI stop boundaries for parking lot or D3/D4 decisions`);
    }
  }
}

function checkGuidedDecisionSummaries() {
  const files = markdownFiles("guided-decision-summaries");
  if (files.length === 0) {
    pass("guided decision summary check skipped: no guided decision summaries");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    const decisionLevel = extractDecisionLevel(sectionBody(content, "Decision Level"));
    if (allowedLevels.has(decisionLevel)) {
      pass(`${label} uses valid Decision Level ${decisionLevel}`);
    } else {
      fail(`${label} has invalid Decision Level: ${decisionLevel || "<empty>"}`);
    }
    for (const section of ["Human Choice Needed", "What We Should Do Now", "What We Should Not Do Now", "Next Safe Action"]) {
      if (meaningful(sectionBody(content, section))) pass(`${label} includes ${section}`);
      else fail(`${label} missing meaningful ${section}`);
    }
    if (["D3", "D4"].includes(decisionLevel)) {
      const unsafeText = [
        sectionBody(content, "What We Should Do Now"),
        sectionBody(content, "Next Safe Action"),
        sectionBody(content, "Recommendation"),
      ].join("\n");
      if (/\b(implemented|completed|approved implementation|execute now|can ai do it now:\s*yes|can ai do it now\s*\n\s*yes)\b/i.test(unsafeText)) {
        fail(`${label} ${decisionLevel} must not claim implementation approval or completion`);
      } else {
        pass(`${label} ${decisionLevel} stops implementation`);
      }
    }
  }
}

function checkFinalReports() {
  const files = markdownFiles("final-reports");
  if (files.length === 0) {
    pass("guided final report check skipped: no final reports");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (!/Current Mainline|Parking Lot|Next-Step Suggestions|Guided Decision/i.test(content)) continue;
    if (meaningful(sectionBody(content, "Next Safe Action"))) {
      pass(`${label} includes Next Safe Action`);
    } else {
      fail(`${label} missing Next Safe Action`);
    }
  }
}

function checkSourceAssets() {
  if (!exists("dev-kit-manifest.json")) return;
  for (const file of [
    "core/guided-delivery-loop.md",
    "core/decision-delegation-boundary.md",
    "templates/active-work-thread.md",
    "templates/guided-decision-summary.md",
    "prompts/delivery-coach-agent.md",
  ]) {
    if (exists(file)) pass(`guided delivery source asset exists ${file}`);
    else fail(`guided delivery source asset missing ${file}`);
  }
}

function extractDecisionLevel(body) {
  const text = stripMarkdown(String(body || ""));
  const exact = text.match(/\bD[0-4]\b/);
  if (!exact) return "";
  const all = [...text.matchAll(/\bD[0-4]\b/g)].map((match) => match[0]);
  if (all.length > 1 && /\/|or/i.test(text)) return "";
  return exact[0];
}

function markdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(fullDir, entry.name))
    .sort();
}

function meaningful(value) {
  const text = stripMarkdown(String(value || "")).replace(/[|:\-\s]/g, "");
  return text.length >= 8;
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/") || path.basename(file);
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

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2));
  }
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Guided delivery loop check passed.");
  }
}
