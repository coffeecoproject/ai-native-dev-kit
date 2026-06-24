#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const projectArg = args.find((arg) => !arg.startsWith("--")) || ".";
const projectRoot = path.resolve(process.cwd(), projectArg);

const requiredPaths = [
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
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

const requiredSections = {
  "docs/project-onboarding.md": ["## Status", "## Source Conversation", "## Open Decisions", "## Ready For First Request Card"],
  "docs/project-profile.md": ["## Status", "## Project Type", "## Purpose", "## High-risk Boundaries"],
  "docs/tech-stack-strategy.md": ["## Status", "## Decision Summary", "## Dependency Policy", "## Verification Strategy"],
  "docs/business-spec-index.md": ["## Status", "## Capability Map", "## Domain Entities", "## First Request Candidates"],
  "docs/sample-policy.md": ["## Status", "## Rules", "## Sample Creation Gate", "## Planned Samples"],
  "docs/onboarding-decisions.md": ["## Status", "## Decision Log", "## Pending Decisions", "## Risk Acceptances"],
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

for (const rel of requiredPaths) {
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) {
    fail(`missing ${rel}`);
    continue;
  }
  pass(rel);

  const sections = requiredSections[rel] || [];
  if (sections.length > 0) {
    const content = fs.readFileSync(full, "utf8");
    for (const section of sections) {
      if (content.includes(section)) {
        pass(`${rel} contains ${section}`);
      } else {
        fail(`${rel} missing ${section}`);
      }
    }
    if (pendingPattern.test(content)) {
      if (strict) {
        fail(`${rel} still has pending placeholders`);
      } else {
        warn(`${rel} still needs human confirmation`);
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("");
console.log(pending ? "Project onboarding baseline is present; decisions are still pending." : "Project onboarding is confirmed.");
