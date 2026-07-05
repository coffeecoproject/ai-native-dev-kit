#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["strict", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const strict = Boolean(args.strict);
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const baselineRef = "docs/environment-baseline.md";
const baselinePath = path.join(projectRoot, baselineRef);
const requiredSections = [
  "Human Summary",
  "Status",
  "Scope",
  "Local Development",
  "Runtime Versions",
  "Package Manager And Lockfile",
  "Environment Variables",
  "Secret Boundary",
  "External Services",
  "Test Environment",
  "Preview / Staging / Production",
  "CI / CD",
  "Release Process",
  "Rollback Process",
  "Logs / Monitoring / Alerts",
  "Open Environment Decisions",
];

let failed = false;
let pending = false;
let state = "READY";
const checks = [];

if (!outputJson) {
  console.log(`# Environment Baseline Check (${strict ? "strict" : "advisory"})`);
  console.log("");
}

if (!fs.existsSync(baselinePath)) {
  state = "MISSING";
  const message = `missing ${baselineRef}`;
  if (strict) fail(message);
  else warn(`${message}; create it from .intentos/templates/environment-baseline.md before environment, CI, deploy, release, rollback, or secret-sensitive work`);
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

  if (containsForbiddenSecretValue(content)) {
    fail(`${baselineRef} appears to contain secret values or credentials`);
  } else {
    pass("no obvious secret values detected");
  }

  if (/Secret values must never be written into this file\./.test(content)) {
    pass("secret-value prohibition is explicit");
  } else {
    const message = `${baselineRef} must say: Secret values must never be written into this file.`;
    if (strict) fail(message);
    else warn(message);
  }

  if (/\b(CONFIRMED|PENDING_CONFIRMATION|NOT_APPLICABLE)\b/.test(content)) {
    pass("tri-state environment status model is present");
  } else {
    const message = `${baselineRef} must use CONFIRMED / PENDING_CONFIRMATION / NOT_APPLICABLE states`;
    if (strict) fail(message);
    else warn(message);
  }

  if (hasPendingDecision(content)) {
    const message = `${baselineRef} contains pending environment decisions`;
    if (strict) fail(message);
    else warn(message);
  }

  if (!/Codex may modify CI:\s*(No|Human approval required)/i.test(content)) {
    const message = `${baselineRef} must explicitly restrict Codex CI changes`;
    if (strict) fail(message);
    else warn(message);
  } else {
    pass("CI modification boundary is explicit");
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

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (state === "READY") {
    console.log("Environment baseline is ready.");
  } else if (state === "MISSING") {
    console.log("Environment baseline is missing. This is advisory for BL0 work, but environment, CI, release, rollback, deployment, production config, and secret-sensitive changes need a baseline or human decision.");
  } else {
    console.log("Environment baseline is present but still pending. Codex must route missing environment, release, rollback, CI, deploy, monitoring, or secret decisions to humans.");
  }
}

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

function bodyLooksPlaceholder(body) {
  const stripped = stripMarkdown(body);
  if (!stripped) return true;
  const nonPlaceholderLines = stripped
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^\|?[-:| ]+\|?$/.test(line))
    .filter((line) => !/^#+\s*/.test(line))
    .filter((line) => !/^<[^>]+>$/.test(line))
    .filter((line) => !/^(Yes\s*\/\s*No|No\s*\/\s*Yes|DRAFT\s*\/|PENDING\s*\/|CONFIRMED\s*\/|NOT_APPLICABLE\s*\/)/i.test(line));
  return nonPlaceholderLines.length === 0;
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function hasPendingDecision(content) {
  return /\b(PENDING|PENDING_CONFIRMATION|DRAFT|PARTIAL|TBD|TODO|NEEDS_HUMAN|NEEDS HUMAN|待定|待确认|人工确认)\b/i.test(content);
}

function containsForbiddenSecretValue(content) {
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(content)
    || /\bgithub_pat_[A-Za-z0-9_]{20,}\b/.test(content)
    || /\bghp_[A-Za-z0-9]{20,}\b/.test(content)
    || /\bAKIA[0-9A-Z]{16}\b/.test(content)
    || /\b(password|secret|api_key|apikey)\s*=\s*[^<\s][^\s]+/i.test(content)
    || /:\/\/[^/\s:@]+:[^/\s:@]+@/.test(content);
}
