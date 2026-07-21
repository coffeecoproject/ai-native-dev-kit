#!/usr/bin/env node

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import {
  canonicalReleaseExecutionRequest,
  releaseStepAuthorityErrors,
  releaseTopologyRequiredForExecution,
} from "./lib/release-action-authority.mjs";
import { releaseTopologyBindingsAgree } from "./lib/release-topology-consumer.mjs";
import { commandOrRequestDigest, parseApprovedExternalEffect, readReleaseApprovalRecord } from "./lib/release-trust.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "report", "require-report", "require-structured-evidence", "require-release-trust", "require-release-topology"]);
const unknown = unknownOptions(args, knownFlags);
const requestedProjectRoot = path.resolve(process.cwd(), args._[0] || ".");
const projectRoot = fs.existsSync(requestedProjectRoot) ? fs.realpathSync(requestedProjectRoot) : requestedProjectRoot;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputJson = Boolean(args.json);
const requireReport = Boolean(args["require-report"] || args["require-structured-evidence"] || args["require-release-trust"] || args["require-release-topology"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"] || args["require-release-trust"] || args["require-release-topology"]);
const requireReleaseTrust = Boolean(args["require-release-trust"]);
const explicitlyRequireReleaseTopology = Boolean(args["require-release-topology"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const releaseExecutionSchema = loadSchema(projectRoot, "schemas/artifacts/release-execution-plan.schema.json")
  || loadPinnedReleaseExecutionSchema();
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
  "core/release-execution-protocol.md",
  "docs/release-execution-protocol.md",
  "templates/release-execution-plan.md",
  "checklists/release-execution-review.md",
  "prompts/release-execution-agent.md",
  "scripts/resolve-release-execution.mjs",
  "scripts/check-release-execution.mjs",
  "schemas/artifacts/release-execution-plan.schema.json",
  "schemas/artifacts/release-approval-record.schema.json",
  "scripts/check-release-approval-record.mjs",
];
const requiredDirectories = ["release-execution-plans"];
const sections = [
  "Human Summary",
  "Preconditions",
  "Launch Review Input",
  "Execution Mode",
  "Execution Steps",
  "Evidence Capture",
  "Stop Conditions",
  "Post-Launch Close-Out",
  "Boundaries",
  "Outcome",
];
const allowedModes = new Set(["PLAN_ONLY", "HUMAN_EXECUTION_HANDOFF", "ASSISTED_EXECUTION", "BLOCKED"]);
const allowedOutcomes = new Set([
  "RELEASE_EXECUTION_PLAN_RECORDED",
  "BLOCKED_PENDING_LAUNCH_REVIEW",
  "BLOCKED_PENDING_RELEASE_APPROVAL",
  "READY_FOR_HUMAN_EXECUTION_HANDOFF",
  "READY_FOR_ASSISTED_EXECUTION",
]);
const highRiskStepPattern = /\b(DEPLOY_OR_SUBMIT|PROVIDER_DEPLOY|MIGRATION|SECRETS|DNS|PAYMENT|PERMISSION|PRODUCTION_CONFIG|APP_STORE|MINI_PROGRAM|ROLLBACK_EXECUTION)\b/i;
const unsafeExecutorPattern = /\b(AUTO_RUN|AUTO_EXECUTE|CODEX_AUTO|CODEX_EXECUTES|CODEX_DEPLOYS|CODEX_PUBLISHES|CODEX_SUBMITS|CODEX_MIGRATES)\b/i;
const forbiddenClaims = [
  /\brelease approved by (IntentOS|Codex|this plan)\b/i,
  /\bproduction approved by (IntentOS|Codex|this plan)\b/i,
  /\bCodex is the release owner\b/i,
  /\bCodex will deploy production\b/i,
  /\bCodex will publish\b/i,
  /\bCodex will submit (app store|mini program|wechat|play store)\b/i,
  /\bautomatically deploy(s|ed)?\b/i,
  /\bautomatically publish(es|ed)?\b/i,
  /\bThis plan approves release:\s*Yes\b/i,
  /\bThis plan executes release by itself:\s*Yes\b/i,
  /\bThis plan changes CI\/CD, hooks, secrets, DNS, payment, permissions, app-store state, mini-program state, or production config:\s*Yes\b/i,
  /\bThis plan treats Launch Review View as release approval:\s*Yes\b/i,
  /\bThis plan makes Codex the release owner:\s*Yes\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Execution Check");
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
checkReleaseExecutionPlans();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.56 release execution evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-execution-protocol.md"),
    readResolved("docs/release-execution-protocol.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Execution Protocol",
    "Launch Review View",
    "current user consented to the exact external effect",
    "ASSISTED_EXECUTION",
    "does not mean technical readiness automatically publishes or deploys",
  ]) {
    if (combined.includes(marker)) pass(`release execution docs include ${marker}`);
    else fail(`release execution docs missing ${marker}`);
  }
}

function loadPinnedReleaseExecutionSchema() {
  const expected = "sha256:a0a57706272e112c590a8aba0648bb5e2a2aca0b2e36667bb10ae64d209065e2";
  const candidates = [
    path.resolve(scriptDir, "..", "schemas/artifacts/release-execution-plan.schema.json"),
    path.join(projectRoot, ".intentos/schemas/artifacts/release-execution-plan.schema.json"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const content = fs.readFileSync(file);
    const actual = `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
    if (actual !== expected) continue;
    return JSON.parse(content.toString("utf8"));
  }
  return null;
}

function checkReleaseExecutionPlans() {
  const files = explicitReport ? [explicitReport] : markdownFiles("release-execution-plans");
  if (files.length === 0) {
    if (requireReport) fail("Release Execution Plan is required but no report exists");
    else pass("release execution check skipped: no Release Execution Plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    const consentSection = content.includes("## Structured Release Consent") ? "Structured Release Consent" : "Human Release Approval";
    requireSection(content, consentSection, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release execution claim: ${pattern.source}`);
    }

    const launchLabel = tableValue(sectionBody(content, "Launch Review Input"), "Safe Launch Label");
    const launchCanProceed = tableValue(sectionBody(content, "Launch Review Input"), "Launch review can proceed");
    const consentBody = sectionBody(content, consentSection);
    const approvalStatus = tableValue(consentBody, "Approval Status");
    const approvalOwner = tableValue(consentBody, "Confirmer") || tableValue(consentBody, "Owner");
    const approvalRef = tableValue(consentBody, "Ref");
    const mode = tableValue(sectionBody(content, "Execution Mode"), "Mode");
    const realAllowed = tableValue(sectionBody(content, "Execution Mode"), "Real release execution allowed");
    const realMode = mode === "ASSISTED_EXECUTION" || mode === "HUMAN_EXECUTION_HANDOFF" || realAllowed === "Yes";
    const topologyRequired = explicitlyRequireReleaseTopology
      || releaseTopologyRequiredForExecution(mode, realAllowed);
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    const structured = validateEvidenceBlock(content, releaseExecutionSchema, label, {
      require: requireStructuredEvidence,
      digestField: "release_execution_digest",
    });
    if (!structured.ok) structured.errors.forEach((error) => fail(error));
    else if (structured.present) pass(`${label} has valid structured release execution evidence`);
    if (structured.ok && structured.present) checkExecutionRequestIntegrity(label, structured.value, realMode);

    if (launchLabel) pass(`${label} references Launch Review input`);
    else fail(`${label} must reference Launch Review input`);
    if (allowedModes.has(mode)) pass(`${label} has valid execution mode`);
    else fail(`${label} has invalid execution mode: ${mode || "<empty>"}`);
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    if (realMode) {
      if (launchLabel === "READY_FOR_RELEASE_REVIEW" && launchCanProceed === "Yes") {
        pass(`${label} real release execution depends on ready Launch Review View`);
      } else {
        fail(`${label} real release execution requires READY_FOR_RELEASE_REVIEW`);
      }
      if (approvalStatus === "APPROVED" && approvalOwner && approvalOwner !== "N/A" && approvalRef && approvalRef !== "N/A") {
        pass(`${label} real release execution has scoped current-user consent`);
      } else {
        fail(`${label} real release execution requires scoped structured release consent`);
      }
      for (const gate of ["Release SOP", "Rollback", "Monitoring", "Post-launch smoke"]) {
        requirePreconditionPass(content, label, gate);
      }
    }

    if (mode === "ASSISTED_EXECUTION" && realAllowed !== "Yes") {
      fail(`${label} ASSISTED_EXECUTION must only appear when real release execution is allowed`);
    }

    checkReleaseTopologyDisposition(content, label, mode, structured.value, topologyRequired);
    checkExecutionStepOwnership(content, label, {
      mode,
      allowedCodexActions: structured.value?.allowed_codex_actions || [],
      blockedActions: structured.value?.blocked_actions || [],
    });
    if (realMode && !structured.present) fail(`${label} real release execution requires structured release trust evidence`);
    if ((requireReleaseTrust || realMode) && structured.ok && structured.present) {
      checkReleaseTrust(content, file, label, structured.value, mode, realAllowed, outcome, topologyRequired);
    }

    for (const boundary of [
      "This plan approves release",
      "This plan executes release by itself",
      "This plan deploys, publishes, submits, migrates, or changes production without explicit human/project approval",
      "This plan changes CI/CD, hooks, secrets, DNS, payment, permissions, app-store state, mini-program state, or production config",
      "This plan replaces project release SOPs or release owner",
      "This plan treats Launch Review View as release approval",
      "This plan makes Codex the release owner",
      "This plan approves legal/security/privacy/compliance/tax/finance/payment decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }
  }
}

function checkReleaseTopologyDisposition(content, label, mode, evidence, topologyRequired) {
  if (!evidence) return;
  const status = tableValue(sectionBody(content, "Preconditions"), "Release Execution Topology");
  const ref = evidence.trust_inputs?.release_execution_topology_ref;
  const digest = evidence.trust_inputs?.release_execution_topology_digest;
  const refMissing = ref === "N/A";
  const digestMissing = digest === "N/A";

  if (refMissing !== digestMissing) {
    fail(`${label} Release Execution Topology ref and digest must both be present or both be N/A`);
    return;
  }
  if (refMissing && status === "PASS") {
    fail(`${label} Release Execution Topology cannot be PASS while its structured ref and digest are N/A`);
    return;
  }
  if (!refMissing && status === "NOT_APPLICABLE_WITH_EVIDENCE") {
    fail(`${label} Release Execution Topology cannot be NOT_APPLICABLE_WITH_EVIDENCE while a topology ref and digest are present`);
    return;
  }
  if (topologyRequired) {
    if (refMissing) {
      fail(`${label} real release execution requires Release Execution Topology by default`);
    } else if (status !== "PASS") {
      fail(`${label} required Release Execution Topology precondition must be PASS`);
    } else {
      pass(`${label} real release execution records a required Release Execution Topology`);
    }
  }
  if (mode === "PLAN_ONLY" && refMissing) {
    if (status === "NOT_APPLICABLE_WITH_EVIDENCE") {
      pass(`${label} PLAN_ONLY topology absence is explicit and non-authorizing`);
    } else {
      fail(`${label} PLAN_ONLY with no topology ref must use NOT_APPLICABLE_WITH_EVIDENCE`);
    }
  }
}

function checkReleaseTrust(content, file, label, evidence, mode, realAllowed, outcome, topologyRequired) {
  if (JSON.stringify(evidence.project_identity) === JSON.stringify(projectIdentity(projectRoot))) pass(`${label} matches current project and revision`);
  else fail(`${label} project identity or revision is stale`);
  if (evidence.execution_mode?.mode === mode && evidence.execution_mode?.real_release_execution_allowed === realAllowed) pass(`${label} structured execution mode matches Markdown`);
  else fail(`${label} structured execution mode does not match Markdown`);
  if (evidence.outcome === outcome) pass(`${label} structured outcome matches Markdown`);
  else fail(`${label} structured outcome does not match Markdown`);

  const launchRef = evidence.trust_inputs?.launch_review_ref;
  const launchResolved = resolveAuthoritativeEvidenceReference(projectRoot, file, launchRef, { markdownOnly: true });
  if (!launchResolved.ok || !launchResolved.relativePath.startsWith("launch-review-views/")) {
    fail(`${label} Launch Review ref is unsafe, missing, or outside launch-review-views/`);
  } else {
    const launchContent = fs.readFileSync(launchResolved.file, "utf8");
    const launchSchema = loadSchema(projectRoot, "schemas/artifacts/launch-review-view.schema.json");
    const launchEvidence = validateEvidenceBlock(launchContent, launchSchema, launchResolved.relativePath, {
      require: true,
      digestField: "launch_review_digest",
    });
    const launchCheck = spawnSync(process.execPath, [
      path.join(scriptDir, "check-launch-review-view.mjs"), projectRoot,
      "--report", launchResolved.relativePath,
      "--require-structured-evidence",
    ], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 * 20 });
    if (launchEvidence.ok
      && launchCheck.status === 0
      && launchEvidence.value.safe_launch_label === "READY_FOR_RELEASE_REVIEW"
      && launchEvidence.value.launch_review_can_proceed === "Yes"
      && launchEvidence.value.launch_review_digest === evidence.trust_inputs?.launch_review_digest) {
      pass(`${label} consumes the exact strict current Launch Review View`);
    } else {
      const reason = launchEvidence.ok
        ? firstUsefulLine(launchCheck.stderr || launchCheck.stdout) || "Launch Review is not ready or its digest does not match"
        : launchEvidence.errors?.[0] || "Launch Review structured evidence is invalid";
      fail(`${label} Launch Review binding is stale, invalid, or not ready: ${reason}`);
    }
  }

  const approvalRef = evidence.trust_inputs?.release_approval_ref;
  const approval = readReleaseApprovalRecord(projectRoot, approvalRef, { fromFile: file, requireApproved: true, requireTopology: topologyRequired });
  if (!approval.ok) {
    approval.errors.forEach((error) => fail(`${label}: ${error}`));
    return;
  }
  pass(`${label} consumes a valid current Release Approval Record`);
  if (approval.evidence.release_approval_digest === evidence.trust_inputs.release_approval_digest) pass(`${label} release approval digest matches`);
  else fail(`${label} release approval digest mismatch`);
  if (JSON.stringify(approval.evidence.release_candidate) === JSON.stringify(evidence.release_candidate)) pass(`${label} release candidate identity matches approval`);
  else fail(`${label} release candidate identity does not match approval`);
  checkExactExecutionAuthorityBinding(label, evidence, approval.evidence);
  checkApprovedExternalEffect(content, label, approval.evidence);

  const expectedTrust = {
    release_evidence_gate_ref: approval.evidence.trust_sources.release_evidence_gate.ref,
    release_evidence_gate_digest: approval.evidence.trust_sources.release_evidence_gate.digest,
    runtime_hygiene_ref: approval.evidence.trust_sources.runtime_hygiene.ref,
    runtime_hygiene_digest: approval.evidence.trust_sources.runtime_hygiene.digest,
    release_channel_policy_ref: approval.evidence.trust_sources.release_channel_policy.ref,
    release_channel_policy_digest: approval.evidence.trust_sources.release_channel_policy.digest,
    platform_recipe_ref: approval.evidence.trust_sources.platform_recipe.ref,
    platform_recipe_digest: approval.evidence.trust_sources.platform_recipe.digest,
    release_handoff_pack_ref: approval.evidence.trust_sources.release_handoff_pack.ref,
    release_handoff_pack_digest: approval.evidence.trust_sources.release_handoff_pack.digest,
  };
  if (topologyRequired) {
    expectedTrust.release_execution_topology_ref = approval.evidence.trust_sources.release_execution_topology?.ref;
    expectedTrust.release_execution_topology_digest = approval.evidence.trust_sources.release_execution_topology?.digest;
  }
  for (const [key, expected] of Object.entries(expectedTrust)) {
    if (evidence.trust_inputs?.[key] === expected) pass(`${label} ${key} matches approval`);
    else fail(`${label} ${key} does not match approval`);
  }
  if (JSON.stringify(evidence.allowed_codex_actions) === JSON.stringify(approval.evidence.allowed_codex_actions)) pass(`${label} allowed Codex actions match approval`);
  else fail(`${label} allowed Codex actions do not match approval`);

  const approvalCheck = spawnSync(process.execPath, [
    path.join(scriptDir, "check-release-approval-record.mjs"),
    projectRoot,
    "--report",
    approval.relativePath,
    "--require-structured-evidence",
    "--require-approved",
    ...(topologyRequired ? ["--require-release-topology"] : []),
  ], { encoding: "utf8" });
  if (approvalCheck.status === 0) pass(`${label} Release Approval authority chain passed strict checkers`);
  else fail(`${label} Release Approval authority chain failed: ${firstUsefulLine(approvalCheck.stderr || approvalCheck.stdout)}`);

  if (new Set(["ASSISTED_EXECUTION", "HUMAN_EXECUTION_HANDOFF"]).has(mode) && realAllowed === "Yes") pass(`${label} trusted execution mode is eligible for review`);
  else fail(`${label} --require-release-trust requires an eligible assisted or human handoff mode`);

  for (const [gate, ref] of [
    ["Release Evidence Gate", approval.evidence.trust_sources.release_evidence_gate.ref],
    ["Runtime Hygiene", approval.evidence.trust_sources.runtime_hygiene.ref],
    ["Release Channel Policy", approval.evidence.trust_sources.release_channel_policy.ref],
    ...(topologyRequired ? [["Release Execution Topology", approval.evidence.trust_sources.release_execution_topology.ref]] : []),
  ]) {
    const row = tableRow(sectionBody(content, "Preconditions"), gate);
    if (/\|\s*`PASS`\s*\|/i.test(row) && row.includes(ref)) pass(`${label} ${gate} precondition matches approval`);
    else fail(`${label} ${gate} precondition must be PASS and match approval ref`);
  }
}

function checkExecutionRequestIntegrity(label, evidence, realMode) {
  const request = evidence.external_effect_request;
  if (!request) {
    if (realMode) fail(`${label} real release execution requires a persisted normalized external effect request`);
    else pass(`${label} legacy plan-only evidence has no executable external effect request`);
    return;
  }
  const normalized = canonicalReleaseExecutionRequest(request);
  if (!normalized.ok) {
    normalized.errors.forEach((error) => fail(`${label} ${error}`));
    return;
  }
  if (normalized.value.request_type === "none") {
    if (Object.hasOwn(request, "argv") || Object.hasOwn(request, "provider_request")) {
      fail(`${label} empty external effect request must not carry argv or provider_request data`);
    }
    if (request.command_or_request_digest === "N/A") pass(`${label} records no executable external effect request`);
    else fail(`${label} empty external effect request must use command_or_request_digest N/A`);
    if (realMode) fail(`${label} real release execution cannot use an empty external effect request`);
    return;
  }
  const expectedDigest = commandOrRequestDigest(normalized.canonical);
  if (request.command_or_request_digest === expectedDigest) {
    pass(`${label} external effect request digest is recomputed from persisted machine request`);
  } else {
    fail(`${label} external effect request digest does not match persisted normalized machine request`);
  }
  const persistedPayload = request.request_type === "argv"
    ? { request_type: request.request_type, argv: request.argv }
    : { request_type: request.request_type, provider_request: request.provider_request };
  if (JSON.stringify(persistedPayload) === JSON.stringify(normalized.value)) pass(`${label} external effect request is normalized`);
  else fail(`${label} external effect request is not in normalized canonical form`);
}

function checkExactExecutionAuthorityBinding(label, executionEvidence, approvalEvidence) {
  const parsed = parseApprovedExternalEffect(approvalEvidence.human_approval?.approved_scope);
  if (!parsed.ok) {
    parsed.errors.forEach((error) => fail(`${label}: ${error}`));
    return;
  }
  const effect = parsed.value;
  const request = executionEvidence.external_effect_request || {};
  const expected = {
    source_revision: approvalEvidence.release_candidate?.source_revision,
    release_candidate_ref: approvalEvidence.release_candidate?.candidate_ref,
    package_identity_ref: approvalEvidence.release_candidate?.package_identity_ref,
    action_id: effect.action,
  };
  const actual = {
    source_revision: executionEvidence.release_candidate?.source_revision,
    release_candidate_ref: executionEvidence.release_candidate?.candidate_ref,
    package_identity_ref: executionEvidence.release_candidate?.package_identity_ref,
    action_id: request.action,
  };
  if (releaseTopologyBindingsAgree(expected, actual)) {
    pass(`${label} source revision, candidate, package, and external action exactly match approval authority`);
  } else {
    fail(`${label} release topology bindings do not exactly match current approval/effect authority`);
  }
  if (request.provider === effect.platform) pass(`${label} persisted request provider matches approval authority`);
  else fail(`${label} persisted request provider does not match approval authority`);
  if (request.command_or_request_digest === effect.command_or_request_digest) pass(`${label} persisted request digest matches approval authority`);
  else fail(`${label} persisted request digest does not match approval authority`);
}

function checkApprovedExternalEffect(content, label, approvalEvidence) {
  const parsed = parseApprovedExternalEffect(approvalEvidence.human_approval?.approved_scope);
  if (!parsed.ok) {
    parsed.errors.forEach((error) => fail(`${label}: ${error}`));
    return;
  }
  const effect = parsed.value;
  const approvalBody = sectionBody(content, "Human Release Approval") || sectionBody(content, "Structured Release Consent") || "";
  const expectedRows = new Map([
    ["Effect ID", effect.effect_id],
    ["Action", effect.action],
    ["Platform", effect.platform],
    ["Environment", effect.environment],
    ["Candidate Ref", effect.candidate_ref],
    ["Candidate Digest", effect.candidate_digest],
    ["Package Identity Type", effect.package_identity_type],
    ["Package Identity Ref", effect.package_identity_ref],
    ["Package Identity Digest Or ID", effect.package_identity_digest_or_id],
    ["Command Or Request Digest", effect.command_or_request_digest],
    ["Cost Boundary", `${effect.cost_boundary.cost_class};${effect.cost_boundary.currency};${effect.cost_boundary.maximum_amount}`],
    ["Rollback Ref", effect.rollback_ref],
    ["Rollback Digest", effect.rollback_digest],
  ]);
  for (const [field, expected] of expectedRows) {
    const actual = tableValue(approvalBody, field);
    if (actual === expected) pass(`${label} ${field} matches the approved external effect`);
    else fail(`${label} ${field} must equal approved external effect value ${expected}`);
  }

  const rows = tableRows(sectionBody(content, "Execution Steps"));
  const external = rows.find((row) => row.action === effect.action);
  if (!external) fail(`${label} execution steps do not consume approved action ${effect.action}`);
  else if (external.executor === "HUMAN_REQUIRED") pass(`${label} approved external action remains externally owned`);
  else fail(`${label} approved external action ${effect.action} must remain HUMAN_REQUIRED`);
}

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*Step\s*\|/i.test(line))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((item) => item.trim().replaceAll("`", ""));
      return { action: cells[1] || "", executor: cells[2] || "" };
    });
}

function checkExecutionStepOwnership(content, label, options = {}) {
  const body = sectionBody(content, "Execution Steps") || "";
  const rows = body.split(/\r?\n/).filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*Step\s*\|/i.test(line));
  if (rows.length > 0) pass(`${label} records execution steps`);
  else fail(`${label} must record execution steps`);

  for (const row of rows) {
    if (unsafeExecutorPattern.test(row)) fail(`${label} contains unsafe executor in step row: ${row}`);
    const cells = row.split("|").slice(1, -1).map((item) => item.trim().replaceAll("`", ""));
    const stepAction = cells[1] || "";
    const executor = cells[2] || "";
    releaseStepAuthorityErrors({
      mode: options.mode,
      stepAction,
      executor,
      allowedCodexActions: options.allowedCodexActions,
      blockedActions: options.blockedActions,
    }).forEach((error) => fail(`${label} ${error}`));
    if (highRiskStepPattern.test(row) && executor === "CODEX_MAY_RUN_AFTER_APPROVAL") fail(`${label} assigns high-risk release step to Codex: ${row}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-execution-protocol-1.56-plan.md",
    "examples/1.56-release-execution/web-assisted-handoff/README.md",
    "examples/1.56-release-execution/web-assisted-handoff/release-execution-plans/001-web-release.md",
    "test-fixtures/bad/bad-release-execution-missing-launch-view/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-assisted-without-approval/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-auto-production-deploy/release-execution-plans/001-bad.md",
    "releases/1.56.0/release-record.md",
    "releases/1.56.0/known-limitations.md",
    "releases/1.56.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.56 release execution source evidence exists ${file}`);
    else fail(`1.56 release execution source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Execution Plan")
    && resolver.stdout.includes("## Execution Mode")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan executes release by itself: No")) {
    pass("1.56 release execution resolver prints safe plan");
  } else {
    fail(`1.56 release execution resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-execution.mjs", ".", "--intent", "prepare release execution", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_EXECUTION_PLAN"
        && parsed.executionMode?.mode
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.executesReleaseByItself === "No") {
        pass("1.56 release execution resolver JSON includes mode and boundaries");
      } else {
        fail(`1.56 release execution resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.56 release execution resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.56 release execution resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.56 release execution checker is executing source repo checks");

  const example = runNode(["scripts/check-release-execution.mjs", "examples/1.56-release-execution/web-assisted-handoff"]);
  if (example.status !== 0 && `${example.stdout}\n${example.stderr}`.includes("real release execution requires structured release trust evidence")) {
    pass("1.56 legacy text-only real execution example remains readable but cannot authorize execution");
  } else {
    fail(`1.56 legacy text-only real execution example must fail closed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing launch view", "test-fixtures/bad/bad-release-execution-missing-launch-view", "must reference Launch Review input"],
    ["assisted without approval", "test-fixtures/bad/bad-release-execution-assisted-without-approval", "requires scoped structured release consent"],
    ["auto production deploy", "test-fixtures/bad/bad-release-execution-auto-production-deploy", "assigns high-risk release step to Codex"],
  ]) {
    const result = runNode(["scripts/check-release-execution.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.56 release execution rejects ${name}`);
    } else {
      fail(`1.56 release execution must reject ${name}: ${output}`);
    }
  }
}

function requirePreconditionPass(content, label, gate) {
  const row = tableRow(sectionBody(content, "Preconditions"), gate);
  if (/\|\s*`PASS`\s*\|/i.test(row)) pass(`${label} ${gate} precondition is PASS`);
  else fail(`${label} real release execution requires ${gate} PASS`);
}

function requireBoundaryNo(content, label, boundary) {
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`-\\s*${escaped}:\\s*No\\b`, "i").test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} missing boundary or not No: ${boundary}`);
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) !== null) pass(`${label} has section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function tableValue(content, field) {
  const escaped = String(field).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? codeOrTextValue(match[1]) : "";
}

function tableRow(content, firstCell) {
  const escaped = String(firstCell).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content || "").match(new RegExp(`^\\|\\s*${escaped}\\s*\\|.*$`, "im"));
  return match ? match[0] : "";
}

function codeOrTextValue(value) {
  return String(value || "").replace(/`/g, "").trim();
}

function resolveReportPath(value) {
  const full = path.resolve(projectRoot, value);
  const relative = path.relative(projectRoot, full);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !/\.md$/i.test(full)) {
    console.error("FAIL --report must be a project-relative Markdown file");
    process.exit(1);
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    console.error(`FAIL missing explicit Release Execution Plan ${full}`);
    process.exit(1);
  }
  return full;
}

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "unknown failure";
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const base = path.join(projectRoot, resolved);
  const out = [];
  walk(base, out);
  return out.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(path.join(projectRoot, resolved), "utf8");
}

function resolveAsset(file) {
  const direct = path.join(projectRoot, file);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return file;
  const installed = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(installed) && fs.statSync(installed).isFile()) return path.join(".intentos", file);
  return "";
}

function resolveDirectory(dir) {
  const direct = path.join(projectRoot, dir);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return dir;
  const installed = path.join(projectRoot, ".intentos", dir);
  if (fs.existsSync(installed) && fs.statSync(installed).isDirectory()) return path.join(".intentos", dir);
  return "";
}

function displayAsset(file, resolved) {
  return file === resolved ? file : `${file} (${resolved})`;
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8" });
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
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Release Execution check passed.");
  }
  process.exit(failed ? 1 : 0);
}
