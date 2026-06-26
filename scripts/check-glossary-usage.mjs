#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { createCheckRecorder } from "./lib/check-result.mjs";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const knownFlags = new Set(["json"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const glossaryPath = path.join(root, "core", "glossary.md");
const requiredTerms = [
  "Engineering Baseline",
  "Output Quality Score",
  "Glossary Usage Check",
  "NEXT_ACTION",
  "EVIDENCE_MISSING",
  "BL2",
  "AUTO_FIX",
  "Review Packet",
  "Human Approval",
  "Risk Gate",
  "Next-Step Suggestion",
];
const recorder = createCheckRecorder({ outputJson });

function splitRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function parseTerms(content) {
  const terms = new Map();
  const lines = content.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  for (const line of lines.slice(2)) {
    const [term, meaning] = splitRow(line);
    if (term && meaning) terms.set(term.replace(/`/g, "").trim(), meaning.replace(/`/g, "").trim());
  }
  return terms;
}

function isConcreteMeaning(value) {
  if (!value) return false;
  if (/^(tbd|todo|pending|n\/a|-)$/i.test(value.trim())) return false;
  return value.split(/\s+/).filter(Boolean).length >= 5;
}

if (!fs.existsSync(glossaryPath)) {
  recorder.fail("missing core/glossary.md");
} else {
  const glossary = fs.readFileSync(glossaryPath, "utf8");
  const terms = parseTerms(glossary);
  for (const term of requiredTerms) {
    const meaning = terms.get(term);
    if (!meaning) {
      recorder.fail(`missing glossary term: ${term}`);
    } else if (!isConcreteMeaning(meaning)) {
      recorder.fail(`glossary term has weak explanation: ${term}`);
    } else {
      recorder.pass(`glossary term explained: ${term}`);
    }
  }
}

if (outputJson) {
  console.log(JSON.stringify({
    status: recorder.failed ? "FAIL" : "PASS",
    checks: recorder.checks,
  }, null, 2));
}

if (recorder.failed) process.exit(1);

if (!outputJson) {
  console.log("");
  console.log("Glossary usage check passed.");
}
