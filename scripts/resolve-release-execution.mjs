#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { projectIdentity } from "./lib/evidence-authority.mjs";
import { readReleaseApprovalRecord } from "./lib/release-trust.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "verification",
  "platform",
  "mode",
  "launch-view-ref",
  "approval-ref",
  "approval-status",
  "release-owner",
  "release-sop",
  "rollback",
  "monitoring",
  "post-launch-smoke",
  "deployment",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const context = {
  intent: stringArg("intent") || args._[1] || "prepare release execution",
  verification: stringArg("verification"),
  platform: stringArg("platform") || "generic",
  requestedMode: normalizeMode(stringArg("mode") || "PLAN_ONLY"),
  launchViewRef: stringArg("launch-view-ref"),
  approvalRef: stringArg("approval-ref"),
  approvalStatus: stringArg("approval-status"),
  releaseOwner: stringArg("release-owner"),
  releaseSop: stringArg("release-sop"),
  rollback: stringArg("rollback"),
  monitoring: stringArg("monitoring"),
  postLaunchSmoke: stringArg("post-launch-smoke"),
  deployment: stringArg("deployment"),
};

const report = buildReleaseExecutionPlan(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReleaseExecutionPlan(root, options) {
  const approval = resolveApproval(root, options);
  const launchReview = resolveLaunchReview(root, options, approval);
  const preconditions = collectPreconditions(options, launchReview, approval);
  const mode = chooseMode(options.requestedMode, launchReview, approval, preconditions);
  const realReleaseExecutionAllowed = realExecutionAllowed(mode, launchReview, approval, preconditions);
  const why = reasonFor(mode, launchReview, approval, preconditions);
  const executionSteps = buildExecutionSteps(mode);
  const outcome = outcomeFor(mode, realReleaseExecutionAllowed, launchReview, approval);

  const report = {
    reportType: "RELEASE_EXECUTION_PLAN",
    generatedBy: "scripts/resolve-release-execution.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      releaseExecutionMode: mode,
      why,
      safeNextStep: nextStepFor(mode, realReleaseExecutionAllowed, preconditions),
    },
    preconditions,
    launchReviewInput: launchReview,
    humanReleaseApproval: approval,
    executionMode: {
      mode,
      realReleaseExecutionAllowed,
      why,
    },
    executionSteps,
    evidenceCapture: buildEvidenceCapture(launchReview, approval, options),
    stopConditions: [
      "Stop if Launch Review View is not READY_FOR_RELEASE_REVIEW.",
      "Stop if human release approval is missing, ambiguous, or out of scope.",
      "Stop before production deploy, publication, app submission, mini-program publish, migration, secrets, DNS, payment, permissions, or production config changes unless the project SOP explicitly assigns that action.",
      "Stop if rollback, monitoring, release owner, release SOP, or post-launch smoke evidence is missing.",
      "Stop if verification, build, smoke, monitoring, or release handoff evidence fails.",
    ],
    postLaunchCloseOut: [
      { item: "Release evidence recorded", status: "PENDING", ownerOrRef: options.releaseOwner || "N/A" },
      { item: "Smoke evidence recorded", status: "PENDING", ownerOrRef: options.postLaunchSmoke || "N/A" },
      { item: "Monitoring observation recorded", status: "PENDING", ownerOrRef: options.monitoring || "N/A" },
      { item: "Rollback window / owner confirmed", status: "PENDING", ownerOrRef: options.rollback || options.releaseOwner || "N/A" },
      { item: "User-facing status summarized", status: "PENDING", ownerOrRef: options.releaseOwner || "N/A" },
    ],
    boundaries: {
      approvesRelease: "No",
      executesReleaseByItself: "No",
      deploysPublishesSubmitsMigratesOrChangesProductionWithoutApproval: "No",
      changesCiHooksSecretsDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig: "No",
      replacesReleaseSopOrOwner: "No",
      treatsLaunchReviewAsReleaseApproval: "No",
      makesCodexReleaseOwner: "No",
      approvesLegalSecurityPrivacyComplianceTaxFinancePaymentDecisions: "No",
    },
    outcome,
  };
  report.machineEvidence = buildMachineEvidence(root, report, approval);
  return report;
}

function resolveLaunchReview(root, options, approval) {
  if (approval.verified) {
    return {
      safeLaunchLabel: "READY_FOR_RELEASE_REVIEW",
      launchReviewCanProceed: "Yes",
      ref: approval.evidence.trust_sources.release_evidence_gate.ref,
      source: "verified-release-trust",
    };
  }
  if (options.launchViewRef) {
    const resolved = resolveRef(root, options.launchViewRef);
    if (resolved) {
      const content = fs.readFileSync(path.join(root, resolved), "utf8");
      const safeLabel = tableValue(content, "Safe Launch Label") || "NOT_READY";
      const canProceed = tableValue(content, "Launch review can proceed") || (safeLabel === "READY_FOR_RELEASE_REVIEW" ? "Yes" : "No");
      return {
        safeLaunchLabel: safeLabel,
        launchReviewCanProceed: canProceed,
        ref: resolved,
        source: "recorded",
      };
    }
    return {
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: options.launchViewRef,
      source: "missing",
    };
  }

  const result = spawnSync(process.execPath, [
    path.join(scriptDir, "resolve-launch-review-view.mjs"),
    root,
    "--intent",
    options.intent || "prepare release execution",
    "--verification",
    options.verification || "",
    "--json",
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    return {
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: "scripts/resolve-launch-review-view.mjs",
      source: "generated",
    };
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return {
      safeLaunchLabel: parsed.safeLaunchView?.safeLaunchLabel || "NOT_READY",
      launchReviewCanProceed: parsed.safeLaunchView?.launchReviewCanProceed || "No",
      ref: "generated:resolve-launch-review-view",
      source: "generated",
    };
  } catch {
    return {
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: "scripts/resolve-launch-review-view.mjs",
      source: "generated",
    };
  }
}

function resolveApproval(root, options) {
  if (!options.approvalRef) return { approvalStatus: "MISSING", owner: "N/A", ref: "N/A", scope: "N/A", verified: false, evidence: null, errors: ["structured release approval record is missing"] };
  const checked = readReleaseApprovalRecord(root, options.approvalRef, { requireApproved: true });
  if (!checked.ok) {
    return {
      approvalStatus: "INVALID",
      owner: "N/A",
      ref: options.approvalRef,
      scope: "N/A",
      verified: false,
      evidence: checked.evidence,
      errors: checked.errors,
    };
  }
  const evidence = checked.evidence;
  return {
    approvalStatus: "APPROVED",
    owner: evidence.release_controls.release_owner_ref,
    ref: `artifact:${checked.relativePath}`,
    scope: evidence.human_approval.approved_scope,
    verified: true,
    evidence,
    errors: [],
  };
}

function collectPreconditions(options, launchReview, approval) {
  const controls = approval.evidence?.release_controls || {};
  const sources = approval.evidence?.trust_sources || {};
  return [
    precondition("Launch Review View", launchReview.safeLaunchLabel === "READY_FOR_RELEASE_REVIEW" && launchReview.launchReviewCanProceed === "Yes", launchReview.ref, "Must be READY_FOR_RELEASE_REVIEW before real release execution."),
    precondition("Release Evidence Gate", approval.verified, sources.release_evidence_gate?.ref, "Strict current release evidence required."),
    precondition("Runtime Hygiene", approval.verified, sources.runtime_hygiene?.ref, "Current candidate runtime preflight required."),
    precondition("Release Channel Policy", approval.verified, sources.release_channel_policy?.ref, "Strict channel and package identity required."),
    precondition("Human Release Approval", approval.verified, approval.ref, "Approval must be structured, current, human-owned, and scoped."),
    precondition("Release owner", approval.verified && Boolean(controls.release_owner_ref), controls.release_owner_ref, "Human release owner required."),
    precondition("Release SOP", approval.verified && Boolean(controls.release_sop_ref), controls.release_sop_ref, "Project release procedure required."),
    precondition("Rollback", approval.verified && Boolean(controls.rollback_ref), controls.rollback_ref, "Rollback or fallback path required."),
    precondition("Monitoring", approval.verified && Boolean(controls.monitoring_ref), controls.monitoring_ref, "Observation path required."),
    precondition("Post-launch smoke", approval.verified && Boolean(controls.post_release_smoke_ref), controls.post_release_smoke_ref, "Post-launch verification required."),
  ];
}

function chooseMode(requestedMode, launchReview, approval, preconditions) {
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW" || launchReview.launchReviewCanProceed !== "Yes") return "BLOCKED";
  if (requestedMode === "PLAN_ONLY") return "PLAN_ONLY";
  if (!approval.verified) return "BLOCKED";
  const missingRequired = preconditions.some((item) => item.status !== "PASS");
  if (missingRequired) return "BLOCKED";
  if (requestedMode === "ASSISTED_EXECUTION") return "ASSISTED_EXECUTION";
  if (requestedMode === "HUMAN_EXECUTION_HANDOFF") return "HUMAN_EXECUTION_HANDOFF";
  return "PLAN_ONLY";
}

function realExecutionAllowed(mode, launchReview, approval, preconditions) {
  if (!new Set(["HUMAN_EXECUTION_HANDOFF", "ASSISTED_EXECUTION"]).has(mode)) return "No";
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW" || launchReview.launchReviewCanProceed !== "Yes") return "No";
  if (!approval.verified) return "No";
  if (preconditions.some((item) => item.status !== "PASS")) return "No";
  return "Yes";
}

function reasonFor(mode, launchReview, approval, preconditions) {
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW") {
    return `Launch Review View is ${launchReview.safeLaunchLabel}; release execution cannot start.`;
  }
  if (mode === "PLAN_ONLY") {
    return "Release execution is being planned only; no real release action is allowed.";
  }
  if (!approval.verified) {
    return `Structured Release Approval is missing or invalid${approval.errors?.length ? `: ${approval.errors[0]}` : "."}`;
  }
  const missing = preconditions.filter((item) => item.status !== "PASS").map((item) => item.gate);
  if (missing.length > 0) {
    return `Release execution is blocked by missing preconditions: ${missing.join(", ")}.`;
  }
  if (mode === "ASSISTED_EXECUTION") {
    return "Human approval and required launch evidence are present; Codex may assist only with explicitly allowed low-risk steps.";
  }
  return "Human approval and required launch evidence are present; release should be executed by the human owner or existing release system.";
}

function nextStepFor(mode, realAllowed, preconditions) {
  if (mode === "PLAN_ONLY") return "Use this plan for human review; do not execute release actions yet.";
  if (realAllowed === "Yes" && mode === "HUMAN_EXECUTION_HANDOFF") return "Hand this plan to the release owner or existing release system.";
  if (realAllowed === "Yes" && mode === "ASSISTED_EXECUTION") return "Run only explicitly allowed low-risk steps and stop at production actions.";
  const missing = preconditions.filter((item) => item.status !== "PASS").map((item) => item.gate);
  return `Resolve missing release preconditions: ${missing.join(", ") || "none"}.`;
}

function buildExecutionSteps(mode) {
  const codexExecutor = mode === "ASSISTED_EXECUTION" ? "CODEX_MAY_RUN_AFTER_APPROVAL" : "HUMAN_REQUIRED";
  return [
    step("Preflight verification", "VERIFY", codexExecutor, "PENDING", "Verification output", "Stop if verification fails."),
    step("Build artifact", "BUILD", codexExecutor, "PENDING", "Build output", "Stop if build fails."),
    step("Release handoff", "DEPLOY_OR_SUBMIT", "HUMAN_REQUIRED", "PENDING", "Release system evidence", "Stop before production action without project SOP."),
    step("Post-launch smoke", "POST_LAUNCH_SMOKE", codexExecutor, "PENDING", "Smoke output", "Stop if smoke fails."),
    step("Rollback readiness", "ROLLBACK_READY", "HUMAN_REQUIRED", "PENDING", "Rollback owner / path", "Stop if rollback owner is unavailable."),
  ];
}

function buildEvidenceCapture(launchReview, approval, options) {
  const sources = approval.evidence?.trust_sources || {};
  const controls = approval.evidence?.release_controls || {};
  return [
    evidence("Launch Review View", "Yes", launchReview.ref || "N/A"),
    evidence("Human Release Approval", "Yes", approval.ref || "N/A"),
    evidence("Release Evidence Gate", "Yes", sources.release_evidence_gate?.ref || "N/A"),
    evidence("Runtime Hygiene", "Yes", sources.runtime_hygiene?.ref || "N/A"),
    evidence("Release Channel Policy", "Yes", sources.release_channel_policy?.ref || "N/A"),
    evidence("Platform Release Recipe", sources.platform_recipe?.required || "Conditional", sources.platform_recipe?.ref || "N/A"),
    evidence("Release Handoff Pack", sources.release_handoff_pack?.required || "Conditional", sources.release_handoff_pack?.ref || "N/A"),
    evidence("Preflight verification", "Yes", options.verification || "N/A"),
    evidence("Build output", "Conditional", "N/A"),
    evidence("Release handoff evidence", "Yes", options.deployment || "N/A"),
    evidence("Monitoring observation", "Yes", controls.monitoring_ref || "N/A"),
    evidence("Post-launch smoke result", "Yes", controls.post_release_smoke_ref || "N/A"),
    evidence("Rollback path / owner", "Yes", controls.rollback_ref || approval.owner || "N/A"),
  ];
}

function outcomeFor(mode, realAllowed, launchReview, approval) {
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW") return "BLOCKED_PENDING_LAUNCH_REVIEW";
  if (mode === "PLAN_ONLY") return "RELEASE_EXECUTION_PLAN_RECORDED";
  if (!approval.verified) return "BLOCKED_PENDING_RELEASE_APPROVAL";
  if (mode === "ASSISTED_EXECUTION" && realAllowed === "Yes") return "READY_FOR_ASSISTED_EXECUTION";
  if (mode === "HUMAN_EXECUTION_HANDOFF" && realAllowed === "Yes") return "READY_FOR_HUMAN_EXECUTION_HANDOFF";
  return "BLOCKED_PENDING_RELEASE_APPROVAL";
}

function buildMachineEvidence(root, report, approval) {
  const candidate = approval.evidence?.release_candidate || {};
  const sources = approval.evidence?.trust_sources || {};
  const evidence = {
    schema_version: "1.93.0",
    artifact_type: "release_execution_plan",
    artifact_id: "generated-release-execution-plan",
    release_execution_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    release_candidate: {
      release_target: candidate.release_target || "N/A",
      candidate_ref: candidate.candidate_ref || "N/A",
      candidate_digest: candidate.candidate_digest || "N/A",
      source_revision: candidate.source_revision || "N/A",
      package_identity_type: candidate.package_identity_type || "none",
      package_identity_ref: candidate.package_identity_ref || "N/A",
      package_identity_digest_or_id: candidate.package_identity_digest_or_id || "N/A",
    },
    trust_inputs: {
      release_approval_ref: approval.ref || "N/A",
      release_approval_digest: approval.evidence?.release_approval_digest || "N/A",
      release_evidence_gate_ref: sources.release_evidence_gate?.ref || "N/A",
      release_evidence_gate_digest: sources.release_evidence_gate?.digest || "N/A",
      runtime_hygiene_ref: sources.runtime_hygiene?.ref || "N/A",
      runtime_hygiene_digest: sources.runtime_hygiene?.digest || "N/A",
      release_channel_policy_ref: sources.release_channel_policy?.ref || "N/A",
      release_channel_policy_digest: sources.release_channel_policy?.digest || "N/A",
      platform_recipe_ref: sources.platform_recipe?.ref || "N/A",
      platform_recipe_digest: sources.platform_recipe?.digest || "N/A",
      release_handoff_pack_ref: sources.release_handoff_pack?.ref || "N/A",
      release_handoff_pack_digest: sources.release_handoff_pack?.digest || "N/A",
    },
    execution_mode: {
      mode: report.executionMode.mode,
      real_release_execution_allowed: report.executionMode.realReleaseExecutionAllowed,
    },
    allowed_codex_actions: approval.evidence?.allowed_codex_actions || [],
    boundaries: {
      approves_release: "No",
      executes_release_by_itself: "No",
      codex_high_risk_release_action: "No",
      changes_project_release_authority: "No",
    },
    outcome: report.outcome,
  };
  evidence.release_execution_digest = evidenceDigest(evidence, ["release_execution_digest"]);
  return evidence;
}

function precondition(gate, passed, ref, notes) {
  return {
    gate,
    status: passed ? "PASS" : "MISSING",
    ref: ref || "N/A",
    notes,
  };
}

function step(name, type, executor, status, evidenceRequired, stopCondition) {
  return { name, type, executor, status, evidenceRequired, stopCondition };
}

function evidence(name, required, ref) {
  return { evidence: name, required, ref: ref || "N/A" };
}

function printHuman(report) {
  console.log("# Release Execution Plan");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`Release execution mode: \`${report.humanSummary.releaseExecutionMode}\``);
  console.log("");
  console.log(`Why: ${report.humanSummary.why}`);
  console.log("");
  console.log(`Safe next step: ${report.humanSummary.safeNextStep}`);
  console.log("");

  console.log("## Preconditions");
  printTable(["Gate", "Status", "Ref / Evidence", "Notes"], report.preconditions.map((item) => [
    item.gate,
    code(item.status),
    item.ref,
    item.notes,
  ]));
  console.log("");

  console.log("## Launch Review Input");
  printTable(["Field", "Value"], [
    ["Safe Launch Label", code(report.launchReviewInput.safeLaunchLabel)],
    ["Launch review can proceed", report.launchReviewInput.launchReviewCanProceed],
    ["Ref", report.launchReviewInput.ref],
  ]);
  console.log("");

  console.log("## Human Release Approval");
  printTable(["Field", "Value"], [
    ["Approval Status", code(report.humanReleaseApproval.approvalStatus)],
    ["Owner", report.humanReleaseApproval.owner],
    ["Ref", report.humanReleaseApproval.ref],
    ["Scope", report.humanReleaseApproval.scope],
  ]);
  console.log("");

  console.log("## Execution Mode");
  printTable(["Field", "Value"], [
    ["Mode", code(report.executionMode.mode)],
    ["Real release execution allowed", report.executionMode.realReleaseExecutionAllowed],
    ["Why", report.executionMode.why],
  ]);
  console.log("");

  console.log("## Execution Steps");
  printTable(["Step", "Type", "Executor", "Status", "Evidence Required", "Stop Condition"], report.executionSteps.map((item) => [
    item.name,
    code(item.type),
    code(item.executor),
    code(item.status),
    item.evidenceRequired,
    item.stopCondition,
  ]));
  console.log("");

  console.log("## Evidence Capture");
  printTable(["Evidence", "Required", "Ref"], report.evidenceCapture.map((item) => [
    item.evidence,
    item.required,
    item.ref,
  ]));
  console.log("");

  console.log("## Stop Conditions");
  console.log("");
  for (const item of report.stopConditions) console.log(`- ${item}`);
  console.log("");

  console.log("## Post-Launch Close-Out");
  printTable(["Item", "Status", "Owner / Ref"], report.postLaunchCloseOut.map((item) => [
    item.item,
    code(item.status),
    item.ownerOrRef,
  ]));
  console.log("");

  console.log("## Boundaries");
  console.log("");
  console.log(`- This plan approves release: ${report.boundaries.approvesRelease}`);
  console.log(`- This plan executes release by itself: ${report.boundaries.executesReleaseByItself}`);
  console.log(`- This plan deploys, publishes, submits, migrates, or changes production without explicit human/project approval: ${report.boundaries.deploysPublishesSubmitsMigratesOrChangesProductionWithoutApproval}`);
  console.log(`- This plan changes CI/CD, hooks, secrets, DNS, payment, permissions, app-store state, mini-program state, or production config: ${report.boundaries.changesCiHooksSecretsDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig}`);
  console.log(`- This plan replaces project release SOPs or release owner: ${report.boundaries.replacesReleaseSopOrOwner}`);
  console.log(`- This plan treats Launch Review View as release approval: ${report.boundaries.treatsLaunchReviewAsReleaseApproval}`);
  console.log(`- This plan makes Codex the release owner: ${report.boundaries.makesCodexReleaseOwner}`);
  console.log(`- This plan approves legal/security/privacy/compliance/tax/finance/payment decisions: ${report.boundaries.approvesLegalSecurityPrivacyComplianceTaxFinancePaymentDecisions}`);
  console.log("");

  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.machineEvidence, null, 2));
  console.log("```");
  console.log("");

  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`|${headers.map(() => "---").join("|")}|`);
  for (const row of rows) console.log(`| ${row.map((item) => String(item || "N/A")).join(" | ")} |`);
}

function normalizeMode(value) {
  const normalized = String(value || "PLAN_ONLY").trim().toUpperCase().replace(/-/g, "_");
  const modes = new Set(["PLAN_ONLY", "HUMAN_EXECUTION_HANDOFF", "ASSISTED_EXECUTION", "BLOCKED"]);
  return modes.has(normalized) ? normalized : "PLAN_ONLY";
}

function normalizeApprovalStatus(value) {
  const normalized = String(value || "").trim().toUpperCase().replace(/-/g, "_");
  if (["APPROVED", "YES", "PASS"].includes(normalized)) return "APPROVED";
  if (["REJECTED", "DENIED", "NO"].includes(normalized)) return "REJECTED";
  if (["PENDING", "NEEDS_HUMAN_DECISION"].includes(normalized)) return "PENDING";
  return "MISSING";
}

function tableValue(content, field) {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? codeOrText(match[1]) : "";
}

function codeOrText(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function resolveRef(root, ref) {
  const clean = String(ref || "").trim();
  if (!clean || clean === "N/A") return "";
  const absolute = path.resolve(root, clean);
  if (!absolute.startsWith(root)) return "";
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return "";
  return path.relative(root, absolute);
}

function stringArg(name) {
  const value = args[name];
  if (Array.isArray(value)) return String(value[value.length - 1] || "").trim();
  if (value === true || value === undefined || value === null) return "";
  return String(value).trim();
}

function code(value) {
  return `\`${value}\``;
}
