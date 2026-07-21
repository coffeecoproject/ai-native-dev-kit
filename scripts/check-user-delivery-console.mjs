#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { checkTaskEntryBinding } from "./lib/task-entry-binding.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "require-task-governance", "require-work-queue", "strict-task-consumer"]));
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

const checks = [];
let failed = false;

const requiredAssets = [
  "core/user-delivery-console.md",
  "docs/user-delivery-console.md",
  "templates/user-delivery-console-card.md",
  "checklists/user-delivery-console-review.md",
  "prompts/user-delivery-console-agent.md",
  "scripts/resolve-user-delivery-console.mjs",
  "scripts/check-user-delivery-console.mjs",
];
const requiredSections = [
  "Human Summary",
  "Delivery Status",
  "Task Completion",
  "Product Readiness",
  "Launch Readiness",
  "What Is Missing",
  "What Codex Can Safely Do Next",
  "What I Need From You",
  "Technical Trace",
  "Boundaries",
  "Outcome",
];
const allowedStates = new Set([
  "NO_PROJECT",
  "IDEA_ONLY",
  "FIRST_VERSION_DEFINED",
  "IN_PROGRESS",
  "NEEDS_BUSINESS_RULE_CLARITY",
  "NEEDS_VERIFICATION",
  "NEEDS_COMPLETION_EVIDENCE",
  "NEEDS_COMPLETION_EVIDENCE_CHECK",
  "PROJECT_HAS_OTHER_COMPLETION_RECORD",
  "TASK_DONE_WITH_EVIDENCE",
  "READY_FOR_LAUNCH_REVIEW",
  "BLOCKED_BY_HUMAN_DECISION",
  "BLOCKED_BY_RISK",
]);
const userSurfaceJargon = [
  /Business Rule Closure/i,
  /Change Impact Coverage/i,
  /Verification Plan/i,
  /Test Evidence/i,
  /Execution Assurance/i,
  /Completion Evidence/i,
  /Release Plan/i,
  /\bBRC\b/i,
  /\bCIC\b/i,
  /\bVP\b/i,
  /\bTE\b/i,
  /\bEA\b/i,
  /\bartifact:/i,
  /\bschema\b/i,
  /\bdigest\b/i,
  /--require-/i,
  /--strict/i,
  /\bTASK_DONE_WITH_EVIDENCE\b/,
  /\bPROJECT_HAS_OTHER_COMPLETION_RECORD\b/,
  /\bNEEDS_COMPLETION_EVIDENCE_CHECK\b/,
  /\bREADY_FOR_LAUNCH_REVIEW\b/,
  /\bSTRICT_CHECK_PASSED\b/,
  /\bSTRICT_CHECK_FAILED\b/,
];
const forbiddenClaims = [
  /\bThis card writes target files:\s*Yes\b/i,
  /\bThis card authorizes apply:\s*Yes\b/i,
  /\bThis card approves implementation:\s*Yes\b/i,
  /\bThis card approves commit or push:\s*Yes\b/i,
  /\bThis card approves release or production:\s*Yes\b/i,
  /\bThis card changes CI or hooks:\s*Yes\b/i,
  /\bThis card replaces lower-level evidence systems:\s*Yes\b/i,
  /\bThis card proves real-user stability:\s*Yes\b/i,
  /\bThis card approves security\/privacy\/compliance\/payment\/permission\/migration\/legal\/tax\/finance\/production-risk decisions:\s*Yes\b/i,
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bsafe to launch\b/i,
  /\bimplementation approved\b/i,
  /\bcommit approved\b/i,
  /\bpush approved\b/i,
  /批准(发布|生产|上线|实现|提交)/,
  /证明真实用户.*稳定/,
];

if (!outputJson) {
  console.log("# User Delivery Console Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    if (exists(file)) pass(`${file} exists`);
    else fail(`missing ${file}`);
  }
  if (resolveDirectory("delivery-status-cards")) pass("delivery-status-cards exists");
  else fail("missing delivery-status-cards");
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkCards();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.79 user delivery console evidence checks skipped for target project");

emit();

function checkCoreContent() {
  const combined = [
    readResolved("core/user-delivery-console.md"),
    readResolved("docs/user-delivery-console.md"),
    readResolved("templates/user-delivery-console-card.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "User Delivery Console",
    "derived view only",
    "What are we building first?",
    "Can this task be treated as done",
    "Technical Trace",
    "does not approve implementation",
  ]) {
    if (combined.includes(marker)) pass(`user delivery console docs include ${marker}`);
    else fail(`user delivery console docs missing ${marker}`);
  }
}

function checkCards() {
  const files = markdownFiles("delivery-status-cards");
  if (files.length === 0) {
    pass("user delivery console check skipped: no delivery status cards");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of requiredSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden user delivery console claim: ${pattern.source}`);
    }

    const userSurface = [
      sectionBody(content, "Human Summary", { fallback: "" }),
      sectionBody(content, "Delivery Status", { fallback: "" }),
      sectionBody(content, "Task Completion", { fallback: "" }),
      sectionBody(content, "Product Readiness", { fallback: "" }),
      sectionBody(content, "Launch Readiness", { fallback: "" }),
      sectionBody(content, "What Is Missing", { fallback: "" }),
      sectionBody(content, "What Codex Can Safely Do Next", { fallback: "" }),
      sectionBody(content, "What I Need From You", { fallback: "" }),
    ].join("\n");
    const leaking = userSurfaceJargon.filter((pattern) => pattern.test(userSurface));
    if (leaking.length === 0) pass(`${label} user surface avoids internal evidence jargon`);
    else fail(`${label} user surface exposes internal evidence jargon: ${leaking.map((item) => item.source).join(", ")}`);

    const state = currentState(content);
    if (state && !allowedStates.has(state)) pass(`${label} user-facing current state is plain language`);
    else fail(`${label} user-facing current state must be plain language, not internal enum: ${state || "<empty>"}`);
    const taskDone = taskDoneValue(content);
    const taskRef = taskRefValue(content);
    const intentDigest = intentDigestValue(content);
    checkTaskEntryBinding({
      content,
      evidence: {
        task_done: taskDone,
        outcome: codeOrTextValue(sectionBody(content, "Outcome", { fallback: "" })),
        task_ref: taskRef,
        intent_digest: intentDigest,
      },
      label,
      projectRoot,
      consumer: "user_delivery_console",
      requireTaskGovernance,
      requireWorkQueue,
      strictTaskConsumer,
      pass,
      fail,
    });
    if (!strictTaskConsumer || taskRef) pass(`${label} task ref is available for delivery task binding`);
    else fail(`${label} strict task consumer requires delivery card task ref`);

    const decisions = numberedItems(sectionBody(content, "What I Need From You", { fallback: "" }));
    const highRisk = /risk|sensitive|production|payment|permission|security|privacy|compliance|migration/i.test(userSurface);
    const limit = highRisk ? 5 : 3;
    if (decisions.length > 0 && decisions.length <= limit) pass(`${label} human decisions within limit`);
    else fail(`${label} asks invalid number of human decisions: ${decisions.length}`);

    const missing = numberedItems(sectionBody(content, "What Is Missing", { fallback: "" }));
    const safeNext = numberedItems(sectionBody(content, "What Codex Can Safely Do Next", { fallback: "" }));
    if (missing.length > 0) pass(`${label} lists missing items`);
    else fail(`${label} must list missing items`);
    if (safeNext.length > 0) pass(`${label} lists safe next action`);
    else fail(`${label} must list safe next action`);

    const taskCompletion = sectionBody(content, "Task Completion", { fallback: "" });
    for (const marker of [
      "Is the check plan prepared?",
      "Is test/check evidence recorded?",
      "Is there a user verification note?",
      "Did the final completion record pass required checks?",
    ]) {
      if (taskCompletion.includes(marker)) pass(`${label} task completion splits verification plan, evidence, and strict completion status`);
      else fail(`${label} task completion missing ${marker}`);
    }
    if (/Is verification evidence recorded\?/i.test(taskCompletion)) {
      fail(`${label} must not merge verification plan and test evidence into one user-facing field`);
    } else {
      pass(`${label} does not merge verification plan and test evidence`);
    }

    const trace = sectionBody(content, "Technical Trace", { fallback: "" });
    for (const marker of ["Source system", "Status", "Contribution", "Authority"]) {
      if (trace.includes(marker)) pass(`${label} technical trace includes ${marker}`);
      else fail(`${label} technical trace missing ${marker}`);
    }
    if (/Source system only/i.test(trace)) pass(`${label} technical trace keeps source systems non-authoritative`);
    else fail(`${label} technical trace must show source systems are source-only`);

    for (const boundary of [
      "This card writes target files",
      "This card authorizes apply",
      "This card approves implementation",
      "This card approves commit or push",
      "This card approves release or production",
      "This card changes CI or hooks",
      "This card replaces lower-level evidence systems",
      "This card proves real-user stability",
      "This card approves security/privacy/compliance/payment/permission/migration/legal/tax/finance/production-risk decisions",
    ]) requireBoundaryNo(content, label, boundary);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome", { fallback: "" }));
    if (allowedStates.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/user-delivery-console-1.79-plan.md",
    "docs/plans/user-delivery-console-evidence-validation-1.79.1-plan.md",
    "docs/plans/user-delivery-console-current-task-binding-1.79.2-plan.md",
    "docs/plans/user-delivery-console-verification-note-1.79.3-plan.md",
    "docs/plans/user-delivery-console-source-signal-calibration-1.79.4-plan.md",
    "examples/1.79-user-delivery-console/README.md",
    "examples/1.79-user-delivery-console/appointment-app/delivery-status-cards/001-status.md",
    "test-fixtures/bad/bad-user-delivery-console-internal-jargon/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-overclaim/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-too-many-decisions/delivery-status-cards/001-bad.md",
    "releases/1.79.0/release-record.md",
    "releases/1.79.0/known-limitations.md",
    "releases/1.79.0/self-check-report.md",
    "releases/1.79.1/release-record.md",
    "releases/1.79.1/known-limitations.md",
    "releases/1.79.1/self-check-report.md",
    "releases/1.79.2/release-record.md",
    "releases/1.79.2/known-limitations.md",
    "releases/1.79.2/self-check-report.md",
    "releases/1.79.3/release-record.md",
    "releases/1.79.3/known-limitations.md",
    "releases/1.79.3/self-check-report.md",
    "releases/1.79.4/release-record.md",
    "releases/1.79.4/known-limitations.md",
    "releases/1.79.4/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.79 user delivery console source evidence exists ${file}`);
    else fail(`1.79 user delivery console source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status"]);
  if (resolver.status === 0
    && resolver.stdout.includes("User Delivery Console Card")
    && resolver.stdout.includes("Can this task be treated as done")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.79 user delivery console resolver prints safe card");
  } else {
    fail(`1.79 user delivery console resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "USER_DELIVERY_CONSOLE_CARD"
        && parsed.schemaVersion === "1.79.4"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryStatus?.currentState
        && parsed.deliveryStatus?.currentStateLabel
        && parsed.taskCompletion?.verificationPlanPrepared
        && parsed.taskCompletion?.testCheckEvidenceRecorded
        && parsed.taskCompletion?.userVerificationNoteProvided
        && parsed.taskCompletion?.completionEvidenceStrictCheck
        && parsed.sourceSignals?.verificationPlan
        && parsed.sourceSignals?.testEvidence
        && parsed.sourceSignals?.executionAssurance) {
        pass("1.79 user delivery console resolver JSON includes split verification fields, strict completion status, and boundaries");
      } else {
        fail(`1.79 user delivery console resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const noteJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    ".",
    "--intent",
    "maintain IntentOS ordinary user delivery status",
    "--verification",
    "npm run verify passed",
    "--json",
  ]);
  if (noteJson.status === 0) {
    try {
      const parsed = JSON.parse(noteJson.stdout);
      if (parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.userVerificationNoteProvided === "Yes") {
        pass("1.79 user delivery console keeps user verification note separate from Test Evidence reports");
      } else {
        fail(`1.79 user delivery console verification note must not count as Test Evidence: ${noteJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console verification note JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console verification note JSON failed: ${noteJson.stderr || noteJson.stdout}`);
  }

  const otherTaskJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "different task",
    "--json",
  ]);
  if (otherTaskJson.status === 0) {
    try {
      const parsed = JSON.parse(otherTaskJson.stdout);
      if (parsed.taskCompletion?.verificationPlanPrepared === "No"
        && parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.executionProofRecorded === "No"
        && parsed.sourceSignals?.verificationPlan?.otherTaskRecords > 0
        && parsed.sourceSignals?.testEvidence?.otherTaskRecords > 0
        && parsed.sourceSignals?.executionAssurance?.otherTaskRecords > 0) {
        pass("1.79 user delivery console keeps other-task source signals out of current-task status");
      } else {
        fail(`1.79 user delivery console must not count other-task source signals as current-task evidence: ${otherTaskJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console other-task source signal JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console other-task source signal JSON failed: ${otherTaskJson.stderr || otherTaskJson.stdout}`);
  }

  const example = runNode(["scripts/check-user-delivery-console.mjs", "examples/1.79-user-delivery-console/appointment-app"]);
  if (example.status === 0 && example.stdout.includes("User Delivery Console check passed")) {
    pass("1.79 user delivery console example passes checker");
  } else {
    fail(`1.79 user delivery console example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["internal jargon", "test-fixtures/bad/bad-user-delivery-console-internal-jargon", "internal evidence jargon"],
    ["overclaim", "test-fixtures/bad/bad-user-delivery-console-overclaim", "forbidden user delivery console claim"],
    ["too many decisions", "test-fixtures/bad/bad-user-delivery-console-too-many-decisions", "invalid number of human decisions"],
  ]) {
    const bad = runNode(["scripts/check-user-delivery-console.mjs", target]);
    const output = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && output.includes(expected)) pass(`1.79 user delivery console rejects ${name}`);
    else fail(`1.79 user delivery console must reject ${name}: ${output}`);
  }
}

function currentState(content) {
  const body = sectionBody(content, "Delivery Status", { fallback: "" });
  const row = body.split(/\r?\n/).find((line) => /\|\s*Current state\s*\|/i.test(line));
  if (!row) return "";
  return stripPipes(row).split("|")[1]?.replace(/`/g, "").trim() || "";
}

function taskRefValue(content) {
  const body = sectionBody(content, "Delivery Status", { fallback: "" });
  const row = body.split(/\r?\n/).find((line) => /\|\s*Task ref\s*\|/i.test(line));
  if (!row) return "";
  return stripPipes(row).split("|")[1]?.replace(/`/g, "").trim() || "";
}

function intentDigestValue(content) {
  const body = sectionBody(content, "Task Entry Binding", { fallback: "" });
  const row = body.split(/\r?\n/).find((line) => /\|\s*Intent digest\s*\|/i.test(line));
  if (!row) return "";
  return stripPipes(row).split("|")[1]?.replace(/`/g, "").trim() || "";
}

function taskDoneValue(content) {
  const body = sectionBody(content, "Task Completion", { fallback: "" });
  const row = body.split(/\r?\n/).find((line) => /\|\s*Can the current task be treated as done\?\s*\|/i.test(line));
  if (!row) return "";
  return stripPipes(row).split("|")[1]?.replace(/`/g, "").trim() || "";
}

function stripPipes(line) {
  return String(line || "").replace(/^\s*\|/, "").replace(/\|\s*$/, "");
}

function requireSection(content, section, label) {
  if (sectionBody(content, section, { fallback: null }) !== null) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} boundary ${boundary} must be No`);
}

function numberedItems(body) {
  return String(body || "").split(/\r?\n/).filter((line) => /^\s*\d+\.\s+/.test(line));
}

function codeOrTextValue(value) {
  return String(value || "").replace(/`/g, "").trim().split(/\s+/)[0] || "";
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  return walk(base).filter((file) => file.endsWith(".md"));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveDirectory(dir) {
  for (const candidate of [path.join(projectRoot, dir), path.join(projectRoot, ".intentos", dir)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function resolveAsset(file) {
  for (const candidate of [path.join(projectRoot, file), path.join(projectRoot, ".intentos", file)]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return "";
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relativePath) {
  return Boolean(resolveAsset(relativePath));
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function emit() {
  if (outputJson) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  else {
    console.log("");
    if (failed) console.log("User Delivery Console check failed.");
    else console.log("User Delivery Console check passed.");
  }
  process.exit(failed ? 1 : 0);
}
