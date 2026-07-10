#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { checkTaskEntryBinding } from "./lib/task-entry-binding.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-task-governance", "require-work-queue", "strict-task-consumer"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireTaskGovernance = Boolean(args["require-task-governance"]);
const requireWorkQueue = Boolean(args["require-work-queue"]);
const strictTaskConsumer = Boolean(args["strict-task-consumer"]);
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
  "core/unified-closure-model.md",
  "core/decision-explain-trace.md",
  "docs/unified-closure-model.md",
  "docs/decision-explain-trace.md",
  "templates/closure-decision.md",
  "checklists/closure-decision-review.md",
  "prompts/closure-decision-agent.md",
  "scripts/resolve-closure-decision.mjs",
  "scripts/check-closure-decision.mjs",
];
const requiredDirectories = ["closure-decisions"];
const sections = [
  "Human Summary",
  "Closure Decision",
  "Decision Inputs",
  "Decision Trace",
  "Dominant Reason",
  "Conflict Summary",
  "Single Source Rule",
  "Required Next Action",
  "Evidence Map",
  "Boundaries",
  "Outcome",
];
const allowedDecisions = new Set([
  "DONE",
  "NOT_DONE",
  "NEEDS_EVIDENCE",
  "NEEDS_IMPACT_COVERAGE",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["CLOSURE_DECISION_RECORDED"]);
const forbiddenClaims = [
  /\bThis decision writes target files:\s*Yes\b/i,
  /\bThis decision authorizes apply:\s*Yes\b/i,
  /\bThis decision approves implementation:\s*Yes\b/i,
  /\bThis decision approves commit or push:\s*Yes\b/i,
  /\bThis decision approves release or production:\s*Yes\b/i,
  /\bThis decision modifies CI or hooks:\s*Yes\b/i,
  /\bThis decision changes task state:\s*Yes\b/i,
  /\bThis decision replaces Review Loop:\s*Yes\b/i,
  /\bThis decision replaces Safe Launch:\s*Yes\b/i,
  /\bThis decision approves security\/privacy\/compliance\/payment\/migration decisions:\s*Yes\b/i,
  /\bcommit approved\b/i,
  /\bpush approved\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
  /\bimplementation approved\b/i,
  /\bno explanation needed\b/i,
  /\bfinal decision only\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Unified Closure Decision Check");
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
checkClosureDecisions();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.53 unified closure evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/unified-closure-model.md");
  const trace = readResolved("core/decision-explain-trace.md");
  if (!core) return;
  for (const marker of [
    "Unified Closure Model",
    "single final close-out decision",
    "Single Source Rule",
    "DONE",
    "NEEDS_IMPACT_COVERAGE",
    "These artifacts are inputs",
  ]) {
    if (core.includes(marker)) pass(`unified closure core includes ${marker}`);
    else fail(`unified closure core missing ${marker}`);
  }
  if (trace.includes("Decision Explain Trace") && trace.includes("Dominant Reason") && trace.includes("Conflict Summary")) {
    pass("decision explain trace core includes trace markers");
  } else {
    fail("decision explain trace core missing required trace markers");
  }
}

function checkClosureDecisions() {
  const files = markdownFiles("closure-decisions");
  if (files.length === 0) {
    pass("unified closure decision check skipped: no Closure Decision records");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden unified closure claim: ${pattern.source}`);
    }

    const decision = tableValue(content, "Decision");
    const taskRef = tableValue(content, "Task ref");
    if (allowedDecisions.has(decision)) pass(`${label} has valid closure decision`);
    else fail(`${label} has invalid closure decision: ${decision || "<empty>"}`);
    checkTaskEntryBinding({
      content,
      evidence: { decision, task_ref: taskRef },
      label,
      projectRoot,
      consumer: "closure_decision",
      requireTaskGovernance,
      requireWorkQueue,
      strictTaskConsumer,
      pass,
      fail,
    });
    if (!strictTaskConsumer || taskRef) pass(`${label} task ref is available for closure task binding`);
    else fail(`${label} strict task consumer requires Closure Decision Task ref`);

    const finalSource = tableValue(content, "Final closure source");
    if (finalSource === "UNIFIED_CLOSURE_DECISION") pass(`${label} declares unified final closure source`);
    else fail(`${label} must declare UNIFIED_CLOSURE_DECISION as final closure source`);

    requireDecisionTrace(content, label);
    requireDominantReason(content, label, decision);
    requireConflictSummary(content, label);

    const singleSource = sectionBody(content, "Single Source Rule") || "";
    if (/single closure source for this task:\s*Yes/i.test(singleSource)) pass(`${label} confirms single closure source`);
    else fail(`${label} must confirm single closure source`);
    if (/stricter result:\s*Yes|stricter result.*Yes/i.test(singleSource)) pass(`${label} confirms stricter result wins`);
    else fail(`${label} must confirm stricter result wins`);

    if (decision === "DONE") requireDoneEvidence(content, label);

    for (const boundary of [
      "This decision writes target files",
      "This decision authorizes apply",
      "This decision approves implementation",
      "This decision approves commit or push",
      "This decision approves release or production",
      "This decision modifies CI or hooks",
      "This decision changes task state",
      "This decision replaces Review Loop",
      "This decision replaces Safe Launch",
      "This decision approves security/privacy/compliance/payment/migration decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requireDoneEvidence(content, label) {
  const evidence = sectionBody(content, "Evidence Map") || "";
  const verification = parseInputVerification(content, label);
  const verificationEvidence = evidenceRow(evidence, "Verification");
  const executionEvidence = evidenceRow(evidence, "Execution Closure");
  const impactEvidence = evidenceRow(evidence, "Change Impact Coverage") || evidenceRow(evidence, "Impact coverage");
  const humanEvidence = evidenceRow(evidence, "Human decision");
  if (verificationEvidence?.status === "PASS") pass(`${label} DONE evidence includes Verification PASS`);
  else fail(`${label} cannot be DONE without Verification PASS`);
  if (executionEvidence?.status === "PASS") pass(`${label} DONE evidence includes Execution Closure PASS`);
  else fail(`${label} cannot be DONE without Execution Closure PASS`);
  if (["PASS", "N/A"].includes(impactEvidence?.status)) pass(`${label} DONE impact coverage is PASS or N/A`);
  else fail(`${label} cannot be DONE with missing impact coverage`);
  if (["PASS", "N/A"].includes(humanEvidence?.status)) pass(`${label} DONE human decision is PASS or N/A`);
  else fail(`${label} cannot be DONE with missing human decision`);

  requireVerifiedInput(verification, label, "Verification", { required: "Yes" });
  const execution = requireVerifiedInput(verification, label, "Execution Closure", { required: "Yes" });
  const impact = requireVerifiedInput(verification, label, "Change Impact Coverage", {
    required: impactEvidence?.status === "PASS" ? "Yes" : "No",
  });
  const human = requireVerifiedInput(verification, label, "Human Decision", {
    required: humanEvidence?.status === "PASS" ? "Yes" : "No",
  });

  if (execution?.verified === "Yes") requireVerifiedExecutionClosure(execution, label);
  if (impact?.required === "Yes" && impact?.verified === "Yes") requireVerifiedImpactCoverage(impact, label);
  if (human?.required === "Yes" && human?.verified === "Yes") requireDistinctHumanDecision(human, [execution, impact], label);
}

function evidenceRow(content, name) {
  const line = tableRow(content, name);
  if (!line) return null;
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/`/g, ""));
  if (cells.length < 3) return null;
  return {
    evidence: cells[0],
    status: cells[1],
    verified: cells[2],
    ref: cells[3] || "N/A",
    checker: cells[4] || "N/A",
  };
}

function parseInputVerification(content, label) {
  const body = sectionBody(content, "Input Verification");
  if (body === null) {
    fail(`${label} DONE requires Input Verification`);
    return new Map();
  }
  const rows = body.split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .slice(2)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/`/g, "")))
    .filter((cells) => cells.length >= 5 && cells[0]);
  const entries = new Map(rows.map((cells) => [cells[0].toLowerCase(), {
    input: cells[0],
    required: cells[1],
    verified: cells[2],
    ref: cells[3],
    checker: cells[4],
  }]));
  if (entries.size > 0) pass(`${label} DONE includes Input Verification entries`);
  else fail(`${label} DONE Input Verification must include evidence entries`);
  return entries;
}

function requireVerifiedInput(entries, label, name, options = {}) {
  const entry = entries.get(name.toLowerCase());
  if (!entry) {
    fail(`${label} DONE Input Verification is missing ${name}`);
    return null;
  }
  const expectedRequired = options.required || "Yes";
  if (entry.required === expectedRequired) pass(`${label} ${name} Input Verification required state matches evidence map`);
  else fail(`${label} ${name} Input Verification required state must be ${expectedRequired}`);
  if (expectedRequired === "Yes") {
    if (entry.verified === "Yes") pass(`${label} ${name} Input Verification is verified`);
    else fail(`${label} ${name} Input Verification must be verified Yes for DONE`);
    if (entry.ref && entry.ref !== "N/A") pass(`${label} ${name} Input Verification has an evidence ref`);
    else fail(`${label} ${name} Input Verification requires an evidence ref`);
    if (entry.checker && entry.checker !== "N/A") pass(`${label} ${name} Input Verification names its checker`);
    else fail(`${label} ${name} Input Verification requires a checker`);
  } else if (["N/A", "No"].includes(entry.verified)) {
    pass(`${label} ${name} Input Verification is not required`);
  } else {
    fail(`${label} ${name} Input Verification must be N/A or No when not required`);
  }
  return entry;
}

function requireVerifiedExecutionClosure(entry, label) {
  const check = runNode([
    "scripts/check-execution-closure.mjs",
    projectRoot,
    "--report",
    entry.ref,
    "--require-impact-coverage",
    "--require-precise-evidence",
  ]);
  if (check.status === 0) pass(`${label} verified Execution Closure passes exact strict checker`);
  else fail(`${label} verified Execution Closure fails exact strict checker: ${firstFailure(check)}`);
}

function requireVerifiedImpactCoverage(entry, label) {
  const check = runNode([
    "scripts/check-change-impact-coverage.mjs",
    projectRoot,
    "--report",
    entry.ref,
    "--require-structured-evidence",
    "--mode",
    "closure",
    "--strict-evidence",
    "--resolve-evidence-refs",
    "--require-precise-evidence",
  ]);
  if (check.status === 0) pass(`${label} verified Change Impact Coverage passes exact strict checker`);
  else fail(`${label} verified Change Impact Coverage fails exact strict checker: ${firstFailure(check)}`);
}

function requireDistinctHumanDecision(entry, evidenceEntries, label) {
  const ref = String(entry.ref || "").trim();
  const duplicated = evidenceEntries.filter(Boolean).some((item) => item.ref === ref);
  if (duplicated) {
    fail(`${label} verified Human Decision cannot reuse execution or impact evidence`);
    return;
  }
  const file = resolveProjectFile(ref);
  if (!file) {
    fail(`${label} verified Human Decision ref is not a safe project-local file: ${ref || "<missing>"}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8").trim();
  if (content.length >= 40 && /(human|owner|decision|approve|confirm|确认|决定|负责人)/i.test(content)) {
    pass(`${label} verified Human Decision is a distinct meaningful record`);
  } else {
    fail(`${label} verified Human Decision record is too weak`);
  }
}

function requireDecisionTrace(content, label) {
  const trace = sectionBody(content, "Decision Trace") || "";
  if (trace.includes("| Step | Input | Status | Effect |")) pass(`${label} includes Decision Trace table`);
  else fail(`${label} Decision Trace must include Step/Input/Status/Effect table`);
  const rows = trace.split("\n").filter((line) => /^\|\s*\d+\s*\|/.test(line));
  if (rows.length >= 3) pass(`${label} Decision Trace includes multiple input steps`);
  else fail(`${label} Decision Trace must include multiple input steps`);
  if (/Dominant reason:/i.test(trace)) pass(`${label} Decision Trace identifies the dominant reason`);
  else fail(`${label} Decision Trace must identify the dominant reason`);
}

function requireDominantReason(content, label, decision) {
  const body = sectionBody(content, "Dominant Reason") || "";
  const dominantInput = tableValue(body, "Input");
  const dominantStatus = tableValue(body, "Status");
  const dominantResult = tableValue(body, "Result");
  const why = tableValue(body, "Why this decides");
  if (dominantInput) pass(`${label} Dominant Reason has input`);
  else fail(`${label} Dominant Reason must name the deciding input`);
  if (dominantStatus) pass(`${label} Dominant Reason has status`);
  else fail(`${label} Dominant Reason must include deciding status`);
  if (dominantResult === decision) pass(`${label} Dominant Reason result matches Closure Decision`);
  else fail(`${label} Dominant Reason result must match Closure Decision`);
  if (why && why.length >= 20) pass(`${label} Dominant Reason explains why`);
  else fail(`${label} Dominant Reason must explain why this input decides`);
  if (decision !== "DONE" && /^(PASS|N\/A|OPTIONAL)$/i.test(dominantStatus)) {
    fail(`${label} non-DONE decision cannot be explained by non-blocking dominant status`);
  }
}

function requireConflictSummary(content, label) {
  const body = sectionBody(content, "Conflict Summary") || "";
  const disagreement = tableValue(body, "Inputs disagree");
  const stricterInput = tableValue(body, "Stricter input");
  const summary = tableValue(body, "Summary");
  if (["Yes", "No"].includes(disagreement)) pass(`${label} Conflict Summary states whether inputs disagree`);
  else fail(`${label} Conflict Summary must state Inputs disagree as Yes or No`);
  if (stricterInput) pass(`${label} Conflict Summary names stricter input`);
  else fail(`${label} Conflict Summary must name the stricter input`);
  if (summary && summary.length >= 20) pass(`${label} Conflict Summary explains the conflict or absence of conflict`);
  else fail(`${label} Conflict Summary must explain the conflict or absence of conflict`);
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/unified-closure-model-1.53-plan.md",
    "docs/plans/decision-explain-trace-1.54-plan.md",
    "docs/decision-explain-trace.md",
    "examples/1.53-unified-closure-model/README.md",
    "examples/1.53-unified-closure-model/closure-decisions/001-booking-validation.md",
    "examples/1.54-decision-explain-trace/README.md",
    "examples/1.54-decision-explain-trace/closure-decisions/001-contract-approval-rule.md",
    "test-fixtures/bad/bad-closure-decision-done-without-evidence/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-closure-decision-split-truth/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-closure-decision-missing-explain-trace/closure-decisions/001-bad.md",
    "releases/1.53.0/release-record.md",
    "releases/1.53.0/known-limitations.md",
    "releases/1.53.0/self-check-report.md",
    "releases/1.54.0/release-record.md",
    "releases/1.54.0/known-limitations.md",
    "releases/1.54.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.54 closure explanation source evidence exists ${file}`);
    else fail(`1.54 closure explanation source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Closure Decision")
    && resolver.stdout.includes("This decision writes target files: No")) {
    pass("1.53 unified closure resolver prints safe decision");
  } else {
    fail(`1.53 unified closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_CLOSURE_DECISION"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.closureDecision?.finalClosureSource === "UNIFIED_CLOSURE_DECISION"
        && Array.isArray(parsed.decisionTrace)
        && parsed.dominantReason?.result
        && parsed.conflictSummary?.summary) {
        pass("1.54 closure decision resolver JSON includes explain trace fields and boundaries");
      } else {
        fail(`1.54 closure decision resolver JSON missing expected explain trace fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.53 unified closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.53 unified closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.53-unified-closure-model"]);
  if (example.status !== 0 && `${example.stdout}\n${example.stderr}`.includes("DONE requires Input Verification")) {
    pass("1.53 legacy unified closure example cannot claim verified DONE after 1.90");
  } else {
    fail(`1.53 legacy unified closure example must be rejected as unverified DONE: ${example.stderr || example.stdout}`);
  }

  const verifiedExample = runNode(["scripts/check-closure-decision.mjs", "examples/1.49-structured-impact-coverage/contract-input-rule"]);
  if (verifiedExample.status === 0 && verifiedExample.stdout.includes("verified Execution Closure passes exact strict checker")) {
    pass("1.90 verified unified closure example passes checker");
  } else {
    fail(`1.90 verified unified closure example failed: ${verifiedExample.stderr || verifiedExample.stdout}`);
  }

  const explainExample = runNode(["scripts/check-closure-decision.mjs", "examples/1.54-decision-explain-trace"]);
  if (explainExample.status === 0 && explainExample.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.54 decision explain trace example passes checker");
  } else {
    fail(`1.54 decision explain trace example failed: ${explainExample.stderr || explainExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["done without evidence", "test-fixtures/bad/bad-closure-decision-done-without-evidence", "cannot be DONE without"],
    ["split truth", "test-fixtures/bad/bad-closure-decision-split-truth", "must confirm single closure source"],
    ["missing explain trace", "test-fixtures/bad/bad-closure-decision-missing-explain-trace", "missing section Decision Trace"],
  ]) {
    const result = runNode(["scripts/check-closure-decision.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.54 closure decision rejects ${name}`);
    else fail(`1.54 closure decision must reject ${name}: ${output}`);
  }
}

function emitAndExit() {
  if (outputJson) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  else {
    console.log("");
    console.log(failed ? "Unified Closure Decision check failed." : "Unified Closure Decision check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isFile()) return intentOS;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isDirectory()) return intentOS;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function displayAsset(relativePath, resolved) {
  const normalized = rel(resolved);
  return normalized === relativePath ? relativePath : `${relativePath} (${normalized})`;
}

function markdownFiles(relativeDir) {
  const dirs = [path.join(projectRoot, relativeDir), path.join(projectRoot, ".intentos", relativeDir)]
    .filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());
  const files = [];
  for (const dir of dirs) walk(dir, files);
  return files.filter((file) => file.endsWith(".md"));
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) !== null) pass(`${label} includes section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`${escapeRegExp(boundary)}:\\s*No`, "i");
  if (pattern.test(content)) pass(`${label} boundary is No: ${boundary}`);
  else fail(`${label} boundary must be No: ${boundary}`);
}

function tableValue(content, label) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = content.match(pattern);
  return match ? match[1].trim().replace(/`/g, "") : "";
}

function tableRow(content, label) {
  return String(content || "").split("\n").find((line) => new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|`, "i").test(line)) || "";
}

function codeOrTextValue(body) {
  const text = String(body || "");
  const code = text.match(/`([A-Z0-9_]+)`/);
  return code ? code[1] : text.trim().replace(/`/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(commandArgs) {
  const resolvedArgs = commandArgs.slice();
  if (/^scripts\/[^/]+\.mjs$/.test(resolvedArgs[0] || "")) {
    resolvedArgs[0] = path.join(scriptDir, path.basename(resolvedArgs[0]));
  }
  return spawnSync(process.execPath, resolvedArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
}

function resolveProjectFile(ref) {
  const normalized = String(ref || "").trim().replace(/^(artifact|file):/, "").replaceAll("\\", "/");
  if (!normalized || path.isAbsolute(normalized) || normalized.includes("\0") || normalized.split("/").some((part) => !part || part === "." || part === "..")) return null;
  const candidate = path.resolve(projectRoot, normalized);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;
  try {
    const realRoot = fs.realpathSync(projectRoot);
    const realFile = fs.realpathSync(candidate);
    const realRelative = path.relative(realRoot, realFile);
    if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) return null;
  } catch {
    return null;
  }
  return candidate;
}

function firstFailure(result) {
  const line = `${result.stdout || ""}\n${result.stderr || ""}`.split(/\r?\n/).find((item) => /^FAIL\s+/i.test(item));
  return line ? line.replace(/^FAIL\s+/i, "") : "checker did not pass";
}

function rel(filePath) {
  return path.relative(projectRoot, filePath) || ".";
}
