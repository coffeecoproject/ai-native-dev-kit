#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/safe-launch.md",
  "templates/launch-readiness-report.md",
  "checklists/launch-readiness-review.md",
  "prompts/launch-readiness-agent.md",
  "docs/safe-launch.md",
  "scripts/check-launch-readiness.mjs",
];

const requiredDirectories = [
  "launch-readiness",
];

const requiredSections = [
  "Human Summary",
  "Scope",
  "Baseline Level",
  "Required Evidence",
  "Verification",
  "Review Loop",
  "Human Decisions",
  "Assumptions",
  "Release Boundary",
  "Rollback / Recovery",
  "Known Limitations",
  "Final Readiness",
];

const readinessStates = new Set([
  "NOT_READY",
  "READY_FOR_DEMO",
  "READY_FOR_INTERNAL_HANDOFF",
  "READY_FOR_RELEASE_REVIEW",
  "BLOCKED",
]);

const baselineLevels = new Set(["BL0", "BL1", "BL2"]);
const readyStates = new Set(["READY_FOR_DEMO", "READY_FOR_INTERNAL_HANDOFF", "READY_FOR_RELEASE_REVIEW"]);
const overclaimPatterns = [
  /\bproduction[- ]ready\b/i,
  /\bguaranteed safe\b/i,
  /\bfully secure\b/i,
  /\bcompliance approved\b/i,
  /\blegal approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Launch Readiness Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }

  for (const dir of requiredDirectories) {
    if (exists(dir)) pass(`${dir} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkLaunchReadinessReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.5 release and example checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/safe-launch.md");
  if (!core) return;
  for (const marker of [
    "Humans approve release",
    "Readiness States",
    "BL0 must not be described as production-ready",
    "Evidence Boundary",
  ]) {
    if (core.includes(marker)) pass(`safe launch core includes ${marker}`);
    else fail(`safe launch core missing ${marker}`);
  }
}

function checkLaunchReadinessReports() {
  const files = markdownFiles("launch-readiness");
  if (files.length === 0) {
    pass("launch readiness check skipped: no launch readiness reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of requiredSections) {
      requireSection(content, section, label);
    }

    const readiness = codeOrTextValue(sectionBody(content, "Final Readiness"));
    if (!readinessStates.has(readiness)) {
      fail(`${label} has invalid Final Readiness: ${readiness || "<empty>"}`);
    } else {
      pass(`${label} has valid Final Readiness`);
    }

    const baseline = codeOrTextValue(sectionBody(content, "Baseline Level"));
    if (!baselineLevels.has(baseline)) {
      fail(`${label} has invalid Baseline Level: ${baseline || "<empty>"}`);
    } else {
      pass(`${label} has valid Baseline Level`);
    }

    if (readyStates.has(readiness)) {
      requireVerification(content, label);
      rejectPendingHumanDecision(content, label);
    }

    if (baseline === "BL0" && content.match(/\bproduction[- ]ready\b/i)) {
      fail(`${label} BL0 work must not be described as production-ready`);
    }

    for (const pattern of overclaimPatterns) {
      if (pattern.test(content)) fail(`${label} contains forbidden launch overclaim: ${pattern.source}`);
    }

    if (readiness === "READY_FOR_RELEASE_REVIEW") {
      requireReviewLoop(content, label);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "releases/1.5.0/release-record.md",
    "releases/1.5.0/known-limitations.md",
    "releases/1.5.0/self-check-report.md",
    "examples/1.5-safe-launch-readiness/README.md",
    "examples/1.5-safe-launch-readiness/launch-readiness/001-internal-handoff.md",
  ]) {
    if (exists(file)) pass(`safe launch source evidence exists ${file}`);
    else fail(`safe launch source evidence missing ${file}`);
  }

  const example = runSelf(["examples/1.5-safe-launch-readiness"]);
  if (example.status === 0 && example.stdout.includes("Launch readiness check passed")) {
    pass("safe launch example passes checker");
  } else {
    fail(`safe launch example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing verification", "test-fixtures/bad/bad-launch-readiness-missing-verification", "ready state must include verification evidence"],
    ["unclosed human decision", "test-fixtures/bad/bad-launch-readiness-unclosed-decision", "has pending human decision"],
    ["overclaim", "test-fixtures/bad/bad-launch-readiness-overclaim", "forbidden launch overclaim"],
  ]) {
    const result = runSelf([target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`safe launch rejects ${name}`);
    } else {
      fail(`safe launch must reject ${name}: ${output}`);
    }
  }
}

function requireVerification(content, label) {
  const body = sectionBody(content, "Verification");
  if (!body || /^none\.?$/i.test(body.trim()) || /\bPENDING\b/i.test(body)) {
    fail(`${label} ready state must include verification evidence`);
  } else {
    pass(`${label} ready state includes verification evidence`);
  }
}

function requireReviewLoop(content, label) {
  const body = sectionBody(content, "Review Loop");
  if (!body || !/Required:\s*`?Yes`?/i.test(body) || !/Report:\s*`?[^`\n]+`?/i.test(body)) {
    fail(`${label} READY_FOR_RELEASE_REVIEW must include Review Loop report evidence`);
  } else {
    pass(`${label} READY_FOR_RELEASE_REVIEW includes Review Loop evidence`);
  }
}

function rejectPendingHumanDecision(content, label) {
  const body = sectionBody(content, "Human Decisions");
  if (/\bPending\b/i.test(body)) {
    fail(`${label} has pending human decision`);
  } else {
    pass(`${label} has no pending human decision for ready state`);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  if (relativePath.startsWith("core/") || relativePath.startsWith("templates/") || relativePath.startsWith("checklists/") || relativePath.startsWith("prompts/") || relativePath.startsWith("docs/")) {
    const nested = path.join(projectRoot, ".intentos", relativePath);
    if (fs.existsSync(nested)) return nested;
  }
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function markdownFiles(relativeDir) {
  const root = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(root)) return [];
  return walk(root).filter((file) => file.endsWith(".md")).sort();
}

function walk(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) === null) fail(`${label} missing section: ${heading}`);
  else pass(`${label} has section: ${heading}`);
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

function codeOrTextValue(body) {
  const text = String(body || "").trim();
  const code = text.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return text.split(/\s+/)[0] || "";
}

function displayAsset(file, resolved) {
  const relative = path.relative(projectRoot, resolved).replaceAll(path.sep, "/");
  return relative || file;
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
}

function runSelf(extraArgs) {
  return spawnSync(process.execPath, [new URL(import.meta.url).pathname, ...extraArgs], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  } else if (!failed) {
    console.log("");
    console.log("Launch readiness check passed");
  }
  process.exit(failed ? 1 : 0);
}
