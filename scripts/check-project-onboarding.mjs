#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const strict = Boolean(args.strict);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const requestedLevel = args.level ? String(args.level).toUpperCase() : null;
const allowedLevels = new Set(["O0", "O1", "O2"]);

if (requestedLevel && !allowedLevels.has(requestedLevel)) {
  console.error(`FAIL invalid --level: ${requestedLevel}`);
  console.error("Valid levels: O0, O1, O2");
  process.exit(1);
}

for (const key of Object.keys(args)) {
  if (!["_", "strict", "level"].includes(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const supportPaths = [
  ".ai-native/core/project-onboarding.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/checklists/project-onboarding-review.md",
];

const docsByLevel = {
  O0: [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/onboarding-decisions.md",
  ],
  O1: [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
  ],
  O2: [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/risk-policy.md",
    "docs/permission-model.md",
    "docs/architecture.md",
  ],
};

const requiredSections = {
  "docs/project-onboarding.md": ["## Status", "## Onboarding Level", "## Source Conversation", "## Open Decisions", "## First Vertical Slice Candidate", "## Ready For First Request Card"],
  "docs/project-profile.md": ["## Status", "## Project Type", "## Selected Profiles", "## Purpose", "## High-risk Boundaries"],
  "docs/tech-stack-strategy.md": ["## Status", "## Decision Summary", "## Dependency Policy", "## Verification Strategy"],
  "docs/business-spec-index.md": ["## Status", "## Capability Map", "## Domain Entities", "## First Request Candidates"],
  "docs/sample-policy.md": ["## Status", "## Rules", "## Sample Creation Gate", "## Planned Samples"],
  "docs/onboarding-decisions.md": ["## Status", "## Decision Log", "## Pending Decisions", "## Risk Acceptances"],
  "docs/risk-policy.md": ["## Purpose", "## Risk Levels", "## Stop Conditions"],
  "docs/permission-model.md": ["## Roles", "## Resource Scope", "## Rules"],
  "docs/architecture.md": ["## Stack", "## Module Boundaries", "## High-risk Areas"],
};

const requiredSectionGroups = {
  "docs/permission-model.md": [["## Enforcement", "## Server-side Enforcement"]],
  "docs/architecture.md": [["## Data / State Flow", "## Data Flow"]],
};

const sectionAliases = {
  Enforcement: ["Enforcement", "Server-side Enforcement"],
  "Data / State Flow": ["Data / State Flow", "Data Flow"],
};

const strictSectionsByLevel = {
  O0: {
    "docs/project-onboarding.md": ["Onboarding Level", "First Vertical Slice Candidate", "Ready For First Request Card"],
    "docs/tech-stack-strategy.md": ["Verification Strategy"],
    "docs/onboarding-decisions.md": ["Decision Log"],
  },
  O1: {
    "docs/project-onboarding.md": ["Onboarding Level", "First Vertical Slice Candidate", "Ready For First Request Card"],
    "docs/tech-stack-strategy.md": ["Verification Strategy"],
    "docs/business-spec-index.md": ["First Request Candidates"],
    "docs/sample-policy.md": ["Sample Creation Gate"],
    "docs/onboarding-decisions.md": ["Decision Log", "Risk Acceptances"],
  },
  O2: {
    "docs/project-onboarding.md": ["Onboarding Level", "First Vertical Slice Candidate", "Ready For First Request Card"],
    "docs/project-profile.md": ["High-risk Boundaries"],
    "docs/tech-stack-strategy.md": ["Verification Strategy"],
    "docs/business-spec-index.md": ["First Request Candidates"],
    "docs/sample-policy.md": ["Sample Creation Gate"],
    "docs/onboarding-decisions.md": ["Decision Log", "Risk Acceptances"],
    "docs/risk-policy.md": ["Risk Levels", "Stop Conditions"],
    "docs/permission-model.md": ["Rules", "Enforcement"],
    "docs/architecture.md": ["High-risk Areas"],
  },
};

const pendingPattern = /<[^>\n]+>|PENDING_CONFIRMATION|PENDING\b|TBD|TODO|NOT_READY/;
let failed = false;
let pending = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function warn(message) {
  pending = true;
  console.log(`PENDING ${message}`);
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

function read(rel) {
  return fs.readFileSync(path.join(projectRoot, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(projectRoot, rel));
}

function detectedLevel() {
  if (requestedLevel) return requestedLevel;
  const rel = "docs/project-onboarding.md";
  if (!exists(rel)) return "O1";
  const body = sectionBody(read(rel), "Onboarding Level") || "";
  const found = [...body.matchAll(/\bO[012]\b/g)].map((match) => match[0]);
  const unique = [...new Set(found)];
  return unique.length === 1 ? unique[0] : "O1";
}

function checkSections(rel, sections) {
  const content = read(rel);
  for (const section of sections) {
    if (content.includes(section)) {
      pass(`${rel} contains ${section}`);
    } else {
      fail(`${rel} missing ${section}`);
    }
  }
  for (const group of requiredSectionGroups[rel] || []) {
    if (group.some((section) => content.includes(section))) {
      pass(`${rel} contains one of ${group.join(", ")}`);
    } else {
      fail(`${rel} missing one of ${group.join(", ")}`);
    }
  }
}

function checkStrictSectionContent(rel, sectionNames) {
  const content = read(rel);
  for (const sectionName of sectionNames) {
    const candidates = sectionAliases[sectionName] || [sectionName];
    const body = candidates.map((candidate) => sectionBody(content, candidate)).find((value) => value !== null);
    if (!hasMeaning(body || "")) {
      fail(`${rel} strict ${sectionName} has no meaningful content`);
    }
  }
}

const level = detectedLevel();
console.log(`# Project Onboarding Check (${level})`);
console.log("");

for (const rel of [...supportPaths, ...docsByLevel[level]]) {
  if (!exists(rel)) {
    fail(`missing ${rel}`);
    continue;
  }
  pass(rel);

  const sections = requiredSections[rel] || [];
  if (sections.length > 0) {
    checkSections(rel, sections);
    const content = read(rel);
    if (pendingPattern.test(content)) {
      if (strict) {
        fail(`${rel} still has pending placeholders`);
      } else {
        warn(`${rel} still needs human confirmation`);
      }
    }
  }
}

if (strict) {
  for (const [rel, sections] of Object.entries(strictSectionsByLevel[level])) {
    if (exists(rel)) checkStrictSectionContent(rel, sections);
  }
}

if (failed) {
  process.exit(1);
}

console.log("");
console.log(pending ? `Project onboarding ${level} baseline is present; decisions are still pending.` : `Project onboarding ${level} is confirmed.`);
