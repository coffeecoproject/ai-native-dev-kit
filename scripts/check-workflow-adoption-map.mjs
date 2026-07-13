#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

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
  "core/existing-project-workflow-adapter.md",
  "docs/existing-project-workflow-adapter.md",
  "templates/workflow-adoption-map.md",
  "checklists/workflow-adoption-map-review.md",
  "prompts/workflow-adapter-agent.md",
  "scripts/resolve-existing-workflow.mjs",
  "scripts/check-workflow-adoption-map.mjs",
];

const requiredDirectories = [
  "workflow-adoption-maps",
];

const reportSections = [
  "Human Decision Summary",
  "Human Summary",
  "Existing Project Signals",
  "Existing Workflow Inventory",
  "Recommended IntentOS Workflow Use",
  "What To Reuse",
  "What To Add",
  "What Not To Touch",
  "Conflicts / Duplicates",
  "Migration / Adapter Plan",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];

const allowedProjectStates = new Set([
  "NEW_OR_EMPTY_PROJECT",
  "EXISTING_LIGHT_PROJECT",
  "EXISTING_GOVERNED_PROJECT",
  "EXISTING_PRODUCTION_PROJECT",
  "DIRTY_WORKTREE_PROJECT",
  "INTENTOS_REPOSITORY",
  "BLOCKED_UNKNOWN_RISK",
]);

const allowedAdapterModes = new Set([
  "READ_ONLY_MAP",
  "DOCS_ONLY_BRIDGE",
  "THIN_OPERATIONAL_BRIDGE",
  "BLOCKED_NEEDS_OWNER",
  "NOT_APPLICABLE",
]);

const allowedOutcomes = new Set([
  "WORKFLOW_MAP_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\binstalled\b/i,
  /\bapplied\b/i,
  /\boverwrote\b/i,
  /\bchanged CI\b/i,
  /\bmodified CI\b/i,
  /\binstalled hooks?\b/i,
  /\bblocking gate enabled\b/i,
  /\bapproved implementation\b/i,
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
  /\bproduction validated\b/i,
  /\bsecurity approved\b/i,
  /\bprivacy approved\b/i,
  /\bcompliance approved\b/i,
  /\bfully migrated\b/i,
  /\bfully configured\b/i,
  /\bfinal adoption endpoint\b/i,
  /\bworkflow map is enough for native migration\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Workflow Adoption Map Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkWorkflowMaps();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.20 workflow adapter evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/existing-project-workflow-adapter.md");
  if (!core) return;
  for (const marker of [
    "For existing projects, Codex must recommend a workflow adapter path before recommending file writes",
    "Workflow Adoption Map",
    "READ_ONLY_MAP",
    "DOCS_ONLY_BRIDGE",
    "THIN_OPERATIONAL_BRIDGE",
    "BLOCKED_NEEDS_OWNER",
    "What Not To Touch",
    "Bounded User Input",
  ]) {
    if (core.includes(marker)) pass(`workflow adapter core includes ${marker}`);
    else fail(`workflow adapter core missing ${marker}`);
  }
}

function checkWorkflowMaps() {
  const files = markdownFiles("workflow-adoption-maps");
  if (files.length === 0) {
    pass("workflow adoption map check skipped: no workflow adoption maps");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden workflow adapter claim: ${pattern.source}`);
    }

    const projectState = tableValue(content, "Project state");
    if (allowedProjectStates.has(projectState)) pass(`${label} has valid project state`);
    else fail(`${label} has invalid project state: ${projectState || "<empty>"}`);

    const adapterMode = tableValue(content, "Adapter mode");
    if (allowedAdapterModes.has(adapterMode)) pass(`${label} has valid adapter mode`);
    else fail(`${label} has invalid adapter mode: ${adapterMode || "<empty>"}`);

    const confidence = tableValue(content, "Confidence");
    if (/^(low|medium|high)$/i.test(confidence)) pass(`${label} records confidence`);
    else fail(`${label} must record confidence as low, medium, or high`);

    requireTableValue(content, label, "Target writes authorized by this report", "No");
    requireBoundaryNo(content, label, "This report installs workflow assets");
    requireBoundaryNo(content, label, "This report authorizes target-project writes");
    requireBoundaryNo(content, label, "This report changes CI or hooks");
    requireBoundaryNo(content, label, "This report overwrites existing governance");
    requireBoundaryNo(content, label, "This report approves implementation");
    requireBoundaryNo(content, label, "This report approves release or production");
    requireBoundaryNo(content, label, "This report approves security, privacy, compliance, payment, finance, tax, HR, migration, permission, or data decisions");

    const recommendedUse = sectionBody(content, "Recommended IntentOS Workflow Use");
    for (const marker of [
      "Request / Spec / Task Card",
      "Baseline Decision Card",
      "Workflow Adoption Map",
      "Native Migration Plan",
      "Change Boundary Report",
      "Patch Classification",
      "Review Loop",
      "Safe Launch",
      "Conversation Turn",
      "Context Governance",
      "Work queue",
      "Doc lifecycle",
      "Hook orchestration",
    ]) {
      if (recommendedUse.includes(marker)) pass(`${label} maps ${marker}`);
      else fail(`${label} missing recommended workflow mapping for ${marker}`);
    }

    const notTouch = sectionBody(content, "What Not To Touch");
    for (const marker of [
      "agent",
      "CI",
      "hooks",
      "release",
      "Business code",
      "secrets",
      "production",
      "evidence",
    ]) {
      if (new RegExp(marker, "i").test(notTouch)) pass(`${label} protects ${marker}`);
      else fail(`${label} What Not To Touch must mention ${marker}`);
    }

    const planBody = sectionBody(content, "Migration / Adapter Plan");
    if (/\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*(Yes|Approved assets only)\s*\|\s*(No|Not required)\s*\|/i.test(planBody)) {
      fail(`${label} has write-like adapter step without human approval`);
    } else {
      pass(`${label} does not allow write-like adapter steps without approval`);
    }

    if ((adapterMode === "THIN_OPERATIONAL_BRIDGE" || adapterMode === "DOCS_ONLY_BRIDGE")
      && !/PENDING|NEEDED_NOW|APPROVED/i.test(sectionBody(content, "Human Decisions Needed"))) {
      fail(`${label} bridge mode must record human decision state`);
    } else {
      pass(`${label} bridge mode records decision state or stays read-only`);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.20-existing-project-workflow-adapter/README.md",
    "examples/1.20-existing-project-workflow-adapter/workflow-adoption-maps/001-governed-web-workflow-map.md",
    "releases/1.20.0/release-record.md",
    "releases/1.20.0/known-limitations.md",
    "releases/1.20.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.20 workflow adapter source evidence exists ${file}`);
    else fail(`1.20 workflow adapter source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-existing-workflow.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Adoption Map Recommendation")
    && resolver.stdout.includes("This report authorizes target-project writes: No")) {
    pass("1.20 workflow-map resolver prints read-only recommendation");
  } else {
    fail(`1.20 workflow-map resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const governedResolver = runNode(["scripts/resolve-existing-workflow.mjs", "examples/1.20-existing-project-workflow-adapter"]);
  if (governedResolver.status === 0
    && governedResolver.stdout.includes("This map is diagnostic")
    && governedResolver.stdout.includes("Native Migration Plan")) {
    pass("1.64 workflow-map resolver clarifies diagnostic-to-native-migration path");
  } else {
    fail(`1.64 workflow-map diagnostic wording missing: ${governedResolver.stderr || governedResolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-workflow.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_ADOPTION_MAP_RECOMMENDATION"
        && parsed.boundary?.authorizesTargetProjectWrites === "No"
        && Array.isArray(parsed.recommendedIntentOSWorkflowUse)) {
        pass("1.20 workflow-map resolver JSON includes boundary and workflow use");
      } else {
        fail(`1.20 workflow-map resolver JSON missing required fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.20 workflow-map resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.20 workflow-map resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-adoption-map.mjs", "examples/1.20-existing-project-workflow-adapter"]);
  if (example.status === 0 && example.stdout.includes("Workflow adoption map check passed")) {
    pass("1.20 workflow adoption map example passes checker");
  } else {
    fail(`1.20 workflow adoption map example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["authorizes write", "test-fixtures/bad/bad-workflow-adoption-authorizes-write", "authorizes target-project writes"],
    ["missing workflow use", "test-fixtures/bad/bad-workflow-adoption-missing-use", "Request / Spec / Task Card"],
    ["adapter endpoint", "test-fixtures/bad/bad-workflow-map-adapter-endpoint", "final adoption endpoint"],
  ]) {
    const result = runNode(["scripts/check-workflow-adoption-map.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.20 workflow adoption map rejects ${name}`);
    } else {
      fail(`1.20 workflow adoption map must reject ${name}: ${output}`);
    }
  }
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
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Workflow adoption map check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function resolveAsset(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function resolveDirectory(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : null;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function displayAsset(requestedPath, resolvedPath) {
  const normalized = resolvedPath.split(path.sep).join("/");
  const rootPrefix = projectRoot.split(path.sep).join("/");
  if (normalized.startsWith(`${rootPrefix}/.intentos/`)) return `.intentos/${requestedPath}`;
  return requestedPath;
}

function markdownFiles(relativeDir) {
  const dirs = [
    path.join(projectRoot, relativeDir),
    path.join(projectRoot, ".intentos", relativeDir),
  ];
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}

function rel(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function requireSection(content, heading, label) {
  if (content.includes(`## ${heading}`)) pass(`${label} has ${heading}`);
  else fail(`${label} missing ${heading}`);
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return "";
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

function tableValue(content, field) {
  const escaped = escapeRegExp(field);
  const regex = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = content.match(regex);
  return match ? stripMarkdown(match[1]) : "";
}

function requireTableValue(content, label, field, expected) {
  const actual = tableValue(content, field);
  if (actual.toLowerCase() === expected.toLowerCase()) pass(`${label} ${field}=${expected}`);
  else fail(`${label} must record ${field}=${expected}, got ${actual || "<empty>"}`);
}

function requireBoundaryNo(content, label, field) {
  const escaped = escapeRegExp(field);
  const regex = new RegExp(`-\\s*${escaped}:\\s*No\\b`, "i");
  if (regex.test(content)) pass(`${label} boundary ${field}: No`);
  else fail(`${label} boundary must say ${field}: No`);
}

function codeOrTextValue(value) {
  const text = stripMarkdown(value || "");
  const match = text.match(/\b(WORKFLOW_MAP_RECORDED|NEEDS_HUMAN_DECISION|BLOCKED)\b/);
  return match ? match[1] : text.split(/\s+/)[0] || "";
}

function stripMarkdown(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(scriptArgs) {
  return spawnSync(process.execPath, scriptArgs, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}
