#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import {
  expectedReleaseStepExecutor,
  normalizeReleaseExecutionRequest,
  releaseTopologyRequiredForExecution,
} from "./lib/release-action-authority.mjs";
import {
  commandOrRequestDigest,
  parseApprovedExternalEffect,
  readReleaseApprovalRecord,
} from "./lib/release-trust.mjs";

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
  "require-release-topology",
]);
const unknown = unknownOptions(args, knownFlags);
const requestedProjectRoot = path.resolve(process.cwd(), args._[0] || ".");
const projectRoot = fs.existsSync(requestedProjectRoot) ? fs.realpathSync(requestedProjectRoot) : requestedProjectRoot;
const outputFormat = args.json ? "json" : String(args.format || "human");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

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
  requireReleaseTopology: Boolean(args["require-release-topology"]),
};

const report = buildReleaseExecutionPlan(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReleaseExecutionPlan(root, options) {
  const effectiveOptions = {
    ...options,
    requireReleaseTopology: options.requireReleaseTopology
      || releaseTopologyRequiredForExecution(options.requestedMode),
  };
  const executionRequest = normalizeReleaseExecutionRequest(effectiveOptions.deployment);
  const approval = resolveApproval(root, effectiveOptions, executionRequest);
  const launchReview = resolveLaunchReview(root, effectiveOptions);
  const preconditions = collectPreconditions(effectiveOptions, launchReview, approval);
  const mode = chooseMode(effectiveOptions.requestedMode, launchReview, approval, preconditions);
  const realReleaseExecutionAllowed = realExecutionAllowed(mode, launchReview, approval, preconditions);
  const why = reasonFor(mode, launchReview, approval, preconditions);
  const executionSteps = buildExecutionSteps(mode, approval);
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
    evidenceCapture: buildEvidenceCapture(launchReview, approval, effectiveOptions),
    stopConditions: [
      "Stop if Launch Review View is not READY_FOR_RELEASE_REVIEW.",
      "Stop if a real release execution request lacks a current Release Execution Topology.",
      "Stop if current-user consent to the concrete release effect is missing, ambiguous, or out of scope.",
      "Stop before production deploy, publication, app submission, mini-program publish, migration, secrets, DNS, payment, permissions, or production config changes unless the project SOP explicitly assigns that action.",
      "Stop if rollback, monitoring, consent reference, release SOP, or post-launch smoke evidence is missing.",
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
      allowsCodexExecutionAfterStructuredConsentAndGates: "Yes",
      deploysPublishesSubmitsMigratesOrChangesProductionWithoutApproval: "No",
      changesCiHooksSecretsDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig: "No",
      replacesReleaseSopOrOwner: "No",
      treatsLaunchReviewAsReleaseApproval: "No",
      makesCodexReleaseOwner: "No",
      approvesLegalSecurityPrivacyComplianceTaxFinancePaymentDecisions: "No",
    },
    outcome,
  };
  report.machineEvidence = buildMachineEvidence(root, report, approval, executionRequest, effectiveOptions);
  return report;
}

function resolveLaunchReview(root, options) {
  if (options.launchViewRef) {
    const resolved = resolveAuthoritativeEvidenceReference(root, "", options.launchViewRef, { markdownOnly: true });
    if (resolved.ok && resolved.relativePath.startsWith("launch-review-views/")) {
      const content = fs.readFileSync(resolved.file, "utf8");
      const checked = spawnSync(process.execPath, [
        path.join(scriptDir, "check-launch-review-view.mjs"),
        root,
        "--report",
        resolved.relativePath,
        "--require-structured-evidence",
      ], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 * 20 });
      const schema = loadSchema(root, "schemas/artifacts/launch-review-view.schema.json");
      const structured = validateEvidenceBlock(content, schema, resolved.relativePath, {
        require: true,
        digestField: "launch_review_digest",
      });
      const evidence = structured.ok ? structured.value : null;
      const safeLabel = evidence?.safe_launch_label || "BLOCKED";
      const canProceed = evidence?.launch_review_can_proceed || "No";
      const valid = checked.status === 0
        && safeLabel === "READY_FOR_RELEASE_REVIEW"
        && canProceed === "Yes"
        && evidence?.closure_input?.decision === "DONE"
        && evidence?.closure_input?.can_count_as_done === "Yes"
        && evidence?.closure_input?.durable === "Yes";
      return {
        safeLaunchLabel: valid ? safeLabel : "BLOCKED",
        launchReviewCanProceed: valid ? canProceed : "No",
        ref: resolved.relativePath,
        digest: valid ? evidence.launch_review_digest : "N/A",
        source: valid ? "recorded" : "invalid",
        errors: valid ? [] : [firstUsefulLine(checked.stderr || checked.stdout) || "Launch Review evidence is invalid"],
      };
    }
    return {
      safeLaunchLabel: "BLOCKED",
      launchReviewCanProceed: "No",
      ref: options.launchViewRef,
      digest: "N/A",
      source: "missing",
    };
  }

  return {
    safeLaunchLabel: "BLOCKED",
    launchReviewCanProceed: "No",
    ref: "N/A",
    digest: "N/A",
    source: "missing",
  };
}

function launchSurfaceStatus(content, surface) {
  const escaped = surface.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`^\\|\\s*${escaped}\\s*\\|\\s*\`?([A-Z_/ -]+)\`?\\s*\\|`, "im"));
  return match ? match[1].trim() : "";
}

function resolveApproval(root, options, executionRequest) {
  const realModeRequested = new Set(["ASSISTED_EXECUTION", "HUMAN_EXECUTION_HANDOFF"]).has(options.requestedMode);
  if (realModeRequested && (!executionRequest.ok || executionRequest.value?.request_type === "none")) {
    return {
      approvalStatus: "INVALID",
      owner: "N/A",
      ref: options.approvalRef,
      scope: "N/A",
      effect: null,
      verified: false,
      evidence: null,
      errors: executionRequest.ok
        ? ["real release execution requires the exact external command or provider request so its digest can be matched to approval"]
        : executionRequest.errors,
    };
  }
  if (!options.approvalRef) return { approvalStatus: "MISSING", owner: "N/A", ref: "N/A", scope: "N/A", effect: null, verified: false, evidence: null, errors: ["structured release approval record is missing"] };
  const expectedEffect = realModeRequested ? {
    command_or_request_digest: commandOrRequestDigest(executionRequest.canonical),
    ...(options.platform && options.platform !== "generic" ? { platform: options.platform } : {}),
  } : {};
  const checked = readReleaseApprovalRecord(root, options.approvalRef, {
    requireApproved: true,
    requireTopology: options.requireReleaseTopology,
    expectedEffect,
  });
  if (!checked.ok) {
    return {
      approvalStatus: "INVALID",
      owner: "N/A",
      ref: options.approvalRef,
      scope: "N/A",
      effect: null,
      verified: false,
      evidence: checked.evidence,
      errors: checked.errors,
    };
  }
  const strictCheck = spawnSync(process.execPath, [
    path.join(scriptDir, "check-release-approval-record.mjs"),
    root,
    "--report",
    checked.relativePath,
    "--require-structured-evidence",
    "--require-approved",
    ...(options.requireReleaseTopology ? ["--require-release-topology"] : []),
  ], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 * 20 });
  if (strictCheck.status !== 0) {
    return {
      approvalStatus: "INVALID",
      owner: "N/A",
      ref: options.approvalRef,
      scope: "N/A",
      effect: null,
      verified: false,
      evidence: checked.evidence,
      errors: [firstUsefulLine(strictCheck.stderr || strictCheck.stdout) || "strict release approval check failed"],
    };
  }
  const evidence = checked.evidence;
  const effect = parseApprovedExternalEffect(evidence.human_approval.approved_scope).value;
  return {
    approvalStatus: "APPROVED",
    owner: evidence.release_controls.release_owner_ref,
    ref: `artifact:${checked.relativePath}`,
    scope: effect.effect_id,
    effect,
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
    options.requireReleaseTopology
      ? precondition("Release Execution Topology", approval.verified && Boolean(sources.release_execution_topology?.ref), sources.release_execution_topology?.ref, "Current six-plane release topology required for strict topology consumption.")
      : notApplicablePrecondition("Release Execution Topology", "Topology consumption was not requested for this bounded release plan."),
    precondition("Real-world release consent", approval.verified, approval.ref, "Consent must be structured, current, supplied by the current user or another specific confirmer, and scoped to the concrete effect."),
    precondition("Consent confirmer", approval.verified && Boolean(controls.release_owner_ref), controls.release_owner_ref, "A specific confirmer reference is required; this does not imply a separate enterprise role."),
    precondition("Release SOP", approval.verified && Boolean(controls.release_sop_ref), controls.release_sop_ref, "Project release procedure required."),
    precondition("Rollback", approval.verified && Boolean(controls.rollback_ref), controls.rollback_ref, "Rollback or fallback path required."),
    precondition("Monitoring", approval.verified && Boolean(controls.monitoring_ref), controls.monitoring_ref, "Observation path required."),
    precondition("Post-launch smoke", approval.verified && Boolean(controls.post_release_smoke_ref), controls.post_release_smoke_ref, "Post-launch verification required."),
  ];
}

function chooseMode(requestedMode, launchReview, approval, preconditions) {
  if (requestedMode === "PLAN_ONLY") return "PLAN_ONLY";
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW" || launchReview.launchReviewCanProceed !== "Yes") return "BLOCKED";
  if (!approval.verified) return "BLOCKED";
  const missingRequired = preconditions.some(isFailedPrecondition);
  if (missingRequired) return "BLOCKED";
  if (requestedMode === "ASSISTED_EXECUTION") return "ASSISTED_EXECUTION";
  if (requestedMode === "HUMAN_EXECUTION_HANDOFF") return "HUMAN_EXECUTION_HANDOFF";
  return "PLAN_ONLY";
}

function realExecutionAllowed(mode, launchReview, approval, preconditions) {
  if (!new Set(["HUMAN_EXECUTION_HANDOFF", "ASSISTED_EXECUTION"]).has(mode)) return "No";
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW" || launchReview.launchReviewCanProceed !== "Yes") return "No";
  if (!approval.verified) return "No";
  if (preconditions.some(isFailedPrecondition)) return "No";
  return "Yes";
}

function reasonFor(mode, launchReview, approval, preconditions) {
  if (mode === "PLAN_ONLY") {
    return "Release execution is being planned only; no real release action is allowed.";
  }
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW") {
    return `Launch Review View is ${launchReview.safeLaunchLabel}; release execution cannot start.`;
  }
  if (!approval.verified) {
    return `Structured Release Approval is missing or invalid${approval.errors?.length ? `: ${approval.errors[0]}` : "."}`;
  }
  const missing = preconditions.filter(isFailedPrecondition).map((item) => item.gate);
  if (missing.length > 0) {
    return `Release execution is blocked by missing preconditions: ${missing.join(", ")}.`;
  }
  if (mode === "ASSISTED_EXECUTION") {
    return "Current-user consent and required launch evidence are present; Codex may execute only the explicitly approved steps under the project release protocol.";
  }
  return "Current-user consent and required launch evidence are present; the existing release system may execute the approved action.";
}

function nextStepFor(mode, realAllowed, preconditions) {
  if (mode === "PLAN_ONLY") return "Codex should finish the evidence and exact action plan; do not request consent or execute the external effect yet.";
  if (realAllowed === "Yes" && mode === "HUMAN_EXECUTION_HANDOFF") return "Hand the exact approved action to the existing release system and capture its evidence.";
  if (realAllowed === "Yes" && mode === "ASSISTED_EXECUTION") return "Codex may run only the explicitly approved local verification, build, packaging, evidence, and read-only smoke actions. The existing release system or current user performs the prepared external release effect.";
  const missing = preconditions.filter(isFailedPrecondition).map((item) => item.gate);
  return `Resolve missing release preconditions: ${missing.join(", ") || "none"}.`;
}

function buildExecutionSteps(mode, approval) {
  const allowed = approval.evidence?.allowed_codex_actions || [];
  const blocked = approval.evidence?.blocked_actions || [];
  const executor = (action) => expectedReleaseStepExecutor(mode, action, allowed, blocked);
  const externalAction = approval.effect?.action || "DEPLOY_OR_SUBMIT";
  const preparingOnly = mode === "PLAN_ONLY";
  return [
    step(preparingOnly ? "Prepare preflight verification" : "Preflight verification", "VERIFY", executor("VERIFY"), "PENDING", preparingOnly ? "Verification command and checklist" : "Verification output", "Stop if verification fails."),
    step(preparingOnly ? "Prepare build instructions" : "Build artifact", "BUILD", executor("BUILD"), "PENDING", preparingOnly ? "Build command and artifact plan" : "Build output", "Stop if build fails."),
    step("Release handoff", externalAction, executor(externalAction), "PENDING", "Release system evidence", "The existing release system or current user performs only the exact approved external effect."),
    step(preparingOnly ? "Prepare post-launch smoke" : "Post-launch smoke", "POST_LAUNCH_SMOKE", executor("POST_LAUNCH_SMOKE"), "PENDING", preparingOnly ? "Read-only smoke plan" : "Smoke output", "Stop if smoke fails."),
    step("Rollback readiness", "ROLLBACK_READY", executor("ROLLBACK_READY"), "PENDING", "Rollback path and evidence", "This prepares rollback evidence; rollback execution remains externally owned."),
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
    evidence("Release Execution Topology", options.requireReleaseTopology ? "Yes" : "Conditional", sources.release_execution_topology?.ref || "N/A"),
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
  if (mode === "PLAN_ONLY") return "RELEASE_EXECUTION_PLAN_RECORDED";
  if (launchReview.safeLaunchLabel !== "READY_FOR_RELEASE_REVIEW") return "BLOCKED_PENDING_LAUNCH_REVIEW";
  if (!approval.verified) return "BLOCKED_PENDING_RELEASE_APPROVAL";
  if (mode === "ASSISTED_EXECUTION" && realAllowed === "Yes") return "READY_FOR_ASSISTED_EXECUTION";
  if (mode === "HUMAN_EXECUTION_HANDOFF" && realAllowed === "Yes") return "READY_FOR_HUMAN_EXECUTION_HANDOFF";
  return "BLOCKED_PENDING_RELEASE_APPROVAL";
}

function buildMachineEvidence(root, report, approval, executionRequest, options) {
  const candidate = approval.evidence?.release_candidate || {};
  const sources = approval.evidence?.trust_sources || {};
  const request = persistedExecutionRequest(executionRequest, approval, options);
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
    external_effect_request: request,
    trust_inputs: {
      release_approval_ref: approval.ref || "N/A",
      release_approval_digest: approval.evidence?.release_approval_digest || "N/A",
      launch_review_ref: report.launchReviewInput.ref || "N/A",
      launch_review_digest: report.launchReviewInput.digest || "N/A",
      release_evidence_gate_ref: sources.release_evidence_gate?.ref || "N/A",
      release_evidence_gate_digest: sources.release_evidence_gate?.digest || "N/A",
      runtime_hygiene_ref: sources.runtime_hygiene?.ref || "N/A",
      runtime_hygiene_digest: sources.runtime_hygiene?.digest || "N/A",
      release_channel_policy_ref: sources.release_channel_policy?.ref || "N/A",
      release_channel_policy_digest: sources.release_channel_policy?.digest || "N/A",
      release_execution_topology_ref: sources.release_execution_topology?.ref || "N/A",
      release_execution_topology_digest: sources.release_execution_topology?.digest || "N/A",
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
    blocked_actions: approval.evidence?.blocked_actions || [],
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

function persistedExecutionRequest(executionRequest, approval, options) {
  const normalized = executionRequest.ok
    ? executionRequest
    : normalizeReleaseExecutionRequest(null);
  const requestType = normalized.value.request_type;
  return {
    ...normalized.value,
    action: approval.effect?.action || "DEPLOY_OR_SUBMIT",
    provider: approval.effect?.platform || options.platform || "generic",
    command_or_request_digest: requestType === "none"
      ? "N/A"
      : commandOrRequestDigest(normalized.canonical),
  };
}

function precondition(gate, passed, ref, notes) {
  return {
    gate,
    status: passed ? "PASS" : "MISSING",
    ref: ref || "N/A",
    notes,
  };
}

function notApplicablePrecondition(gate, notes) {
  return {
    gate,
    status: "NOT_APPLICABLE_WITH_EVIDENCE",
    ref: "N/A",
    notes,
  };
}

function isFailedPrecondition(item) {
  return !new Set(["PASS", "NOT_APPLICABLE_WITH_EVIDENCE"]).has(item.status);
}

function step(name, type, executor, status, evidenceRequired, stopCondition) {
  return { name, type, executor, status, evidenceRequired, stopCondition };
}

function evidence(name, required, ref) {
  return { evidence: name, required, ref: ref || "N/A" };
}

function formatCostBoundary(value) {
  if (!value) return "N/A";
  return `${value.cost_class};${value.currency};${value.maximum_amount}`;
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
    ["Effect ID", report.humanReleaseApproval.effect?.effect_id || "N/A"],
    ["Action", report.humanReleaseApproval.effect?.action || "N/A"],
    ["Platform", report.humanReleaseApproval.effect?.platform || "N/A"],
    ["Environment", report.humanReleaseApproval.effect?.environment || "N/A"],
    ["Candidate Ref", report.humanReleaseApproval.effect?.candidate_ref || "N/A"],
    ["Candidate Digest", report.humanReleaseApproval.effect?.candidate_digest || "N/A"],
    ["Package Identity Type", report.humanReleaseApproval.effect?.package_identity_type || "N/A"],
    ["Package Identity Ref", report.humanReleaseApproval.effect?.package_identity_ref || "N/A"],
    ["Package Identity Digest Or ID", report.humanReleaseApproval.effect?.package_identity_digest_or_id || "N/A"],
    ["Command Or Request Digest", report.humanReleaseApproval.effect?.command_or_request_digest || "N/A"],
    ["Cost Boundary", formatCostBoundary(report.humanReleaseApproval.effect?.cost_boundary)],
    ["Rollback Ref", report.humanReleaseApproval.effect?.rollback_ref || "N/A"],
    ["Rollback Digest", report.humanReleaseApproval.effect?.rollback_digest || "N/A"],
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

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
}
