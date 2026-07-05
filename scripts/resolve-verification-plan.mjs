#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "business-rule-ref",
  "impact-ref",
  "project-level",
  "platform",
  "change-kind",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const businessRuleRef = String(args["business-rule-ref"] || "").trim();
const impactRef = String(args["impact-ref"] || "").trim();
const projectLevel = String(args["project-level"] || "BL1").trim().toUpperCase();
const platformProfiles = String(args.platform || "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const changeKind = String(args["change-kind"] || "").trim().toUpperCase();
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

if (!["BL0", "BL1", "BL2"].includes(projectLevel)) {
  console.error(`FAIL unknown --project-level: ${projectLevel}`);
  console.error("Use BL0, BL1, or BL2.");
  process.exit(1);
}

const report = buildReport(projectRoot, intent || "appointment requests must include a service time");

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root, userIntent) {
  const businessRule = resolveArtifact(root, businessRuleRef);
  const impact = resolveArtifact(root, impactRef);
  const resolvedIntent = userIntent
    || businessRule.evidence?.user_request
    || impact.evidence?.user_request?.intent
    || "Not provided";
  const inferredChangeKind = inferChangeKind(resolvedIntent, businessRule.evidence, impact.evidence);
  const effectiveChangeKind = changeKind || inferredChangeKind;
  const taskRef = taskRefFor(resolvedIntent, businessRule.evidence, impact.evidence);
  const intentDigest = businessRule.evidence?.source_request_digest || digest(resolvedIntent);
  const planSlug = slugify(resolvedIntent);
  const verificationPlanRef = verificationPlanRefForOutput(root, outputPath, planSlug);
  const surfaces = impact.evidence?.affected_surface_map?.length
    ? impact.evidence.affected_surface_map
    : inferredSurfacesFor(resolvedIntent, effectiveChangeKind);
  const sourceSystems = sourceSystemsFor(businessRule, impact);
  const riskDomains = riskDomainsFor(resolvedIntent, businessRule.evidence, impact.evidence, surfaces);
  const obligations = obligationsFor({
    surfaces,
    businessRule,
    impact,
    resolvedIntent,
    effectiveChangeKind,
    riskDomains,
  });
  const controls = testCorrectnessControlsFor({
    obligations,
    surfaces,
    effectiveChangeKind,
    riskDomains,
  });
  const manualVerification = manualVerificationFor(surfaces, riskDomains);
  const notApplicable = notApplicableFor(surfaces);
  const state = stateFor({
    effectiveChangeKind,
    businessRule,
    impact,
    surfaces,
    obligations,
    manualVerification,
  });
  const boundaries = boundariesFor();
  const structuredBase = {
    schema_version: "1.76.0",
    artifact_type: "verification_plan",
    task_ref: taskRef,
    intent: resolvedIntent,
    intent_digest: intentDigest,
    verification_plan_ref: verificationPlanRef,
    verification_plan_digest: "",
    business_rule_ref: businessRuleRef || "not provided",
    business_rule_digest: businessRule.evidence?.business_rule_digest || "not provided",
    business_rule_state: businessRule.evidence?.state || "not provided",
    impact_ref: impactRef || "not provided",
    impact_digest: impact.evidence?.impact_digest || "not provided",
    source_systems: sourceSystems,
    project_level: projectLevel,
    platform_profiles: platformProfiles.length > 0 ? platformProfiles : inferPlatforms(root, resolvedIntent),
    change_kind: effectiveChangeKind,
    risk_domains: riskDomains,
    verification_state: state,
    affected_surfaces: surfaces.map((surface) => ({
      surface: surface.surface,
      status: surface.status,
      reason: surface.reason || "",
      expected_evidence: surface.expected_evidence || surface.expectedEvidence || "",
    })),
    verification_obligations: obligations,
    test_correctness_controls: controls,
    manual_verification: manualVerification,
    not_applicable_obligations: notApplicable,
    boundaries,
    next_step: nextStepFor(state),
  };
  const structuredEvidence = {
    ...structuredBase,
    verification_plan_digest: evidenceDigest(structuredBase, ["verification_plan_digest"]),
  };

  return {
    reportType: "VERIFICATION_PLAN",
    schemaVersion: "1.76.0",
    generatedBy: "scripts/resolve-verification-plan.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: summaryFor(state, obligations, surfaces),
    intent: resolvedIntent,
    taskRef,
    planIdentity: {
      verificationPlanRef,
      verificationPlanDigest: structuredEvidence.verification_plan_digest,
      intentDigest,
    },
    sourceSystems,
    projectCalibration: {
      projectLevel,
      platformProfiles: structuredEvidence.platform_profiles,
      changeKind: effectiveChangeKind,
      riskDomains,
    },
    affectedSurfaces: structuredEvidence.affected_surfaces,
    verificationObligations: obligations,
    testCorrectnessControls: controls,
    manualVerification,
    notApplicableObligations: notApplicable,
    boundaries,
    nextStep: nextStepFor(state),
    outcome: state,
    structuredEvidence,
  };
}

function obligationsFor({ surfaces, businessRule, impact, resolvedIntent, effectiveChangeKind, riskDomains }) {
  const obligations = [];
  const required = new Set(
    surfaces
      .filter((surface) => surface.status === "REQUIRED" || surface.status === "NEEDS_HUMAN_DECISION")
      .map((surface) => surface.surface),
  );
  const sourceRefs = sourceRefsFor(businessRule, impact);
  const add = (surface, type, behavior, evidence, options = {}) => {
    obligations.push({
      id: `verify:${slugify(`${surface}-${type}-${behavior}`).slice(0, 80)}`,
      source_surface: surface,
      verification_type: type,
      required: options.required || "Yes",
      priority: options.priority || "BLOCKING",
      behavior_under_test: behavior,
      expected_evidence: evidence,
      test_correctness_risk: options.risk || testRiskFor(surface, type),
      suggested_command: options.command || "",
      broad_command_only: options.broadCommandOnly || "No",
      source_refs: options.sourceRefs || sourceRefs,
      owner: options.owner || "",
      decision_ref: options.decisionRef || "",
      not_applicable_reason: options.notApplicableReason || "",
    });
  };

  if (required.has("USER_FLOW")) {
    add("USER_FLOW", "UI_INTERACTION_TEST", "The primary user flow follows the requested rule.", "Behavior, screen, or journey evidence for the success path.");
    add("USER_FLOW", "REGRESSION_SMOKE", "Existing critical flow still works after the change.", "Task-specific smoke evidence mapped to this flow.", {
      priority: "REQUIRED",
    });
  }
  if (required.has("FRONTEND_UI")) {
    add("FRONTEND_UI", "UI_INTERACTION_TEST", "Visible form or screen behavior enforces the rule.", "UI interaction evidence, screenshot, or component behavior proof.");
  }
  if (required.has("API_CONTRACT")) {
    add("API_CONTRACT", "API_POSITIVE_TEST", "Valid API request succeeds with the required data.", "API positive-path evidence tied to the current task.");
    add("API_CONTRACT", "API_NEGATIVE_TEST", "Invalid API request fails with a bounded validation error.", "API request missing or violating the rule is rejected.");
  }
  if (required.has("BACKEND_RULE")) {
    add("BACKEND_RULE", "BACKEND_RULE_TEST", "Server/domain logic enforces the rule even if UI is bypassed.", "Domain, service, or handler validation evidence.");
  }
  if (required.has("ERROR_COPY")) {
    add("ERROR_COPY", "ERROR_COPY_CHECK", "Blocked users receive clear bounded feedback.", "Error copy, validation message, or not-applicable reason.");
  }
  if (required.has("DATA_MODEL")) {
    add("DATA_MODEL", "DATA_MODEL_CHECK", "Data model, historical records, migration, and rollback impact are explicit.", "Schema/model/migration evidence or a concrete not-applicable decision.");
  }
  if (required.has("PERMISSION_RISK")) {
    add("PERMISSION_RISK", "PERMISSION_BOUNDARY_TEST", "Role, tenant, visibility, privacy, or audit boundary is verified.", "Role/tenant/owner boundary evidence or domain-owner decision.", {
      owner: "domain-owner",
      decisionRef: "human-decision:permission-or-risk-owner",
    });
  }
  if (required.has("RELEASE_IMPACT")) {
    add("RELEASE_IMPACT", "RELEASE_SMOKE_CHECK", "Release, rollback, monitoring, or handoff impact is bounded.", "Release-owner handoff evidence; this does not approve production.", {
      owner: "release-owner",
      decisionRef: "human-decision:release-owner",
    });
  }
  if (required.has("DOCS_HANDOFF")) {
    add("DOCS_HANDOFF", "REGRESSION_SMOKE", "The rule and exclusions are understandable for future work.", "Handoff, doc update, or final report evidence.", {
      required: "Yes",
      priority: "REQUIRED",
    });
  }
  if (required.has("TEST_COVERAGE")) {
    add("TEST_COVERAGE", "REGRESSION_SMOKE", "Task-specific verification exists beyond broad command success.", "Specific obligation-to-evidence mapping; broad commands alone are not enough.", {
      priority: "REQUIRED",
      command: suggestedBroadCommand(resolvedIntent),
    });
  }

  if (effectiveChangeKind === "BUG_FIX" && !obligations.some((item) => item.verification_type === "REGRESSION_SMOKE")) {
    add("USER_FLOW", "REGRESSION_SMOKE", "The fixed bug has a regression case.", "A failing-before/passing-after case or equivalent bug regression proof.");
  }

  if (riskDomains.includes("security-or-privacy") && !required.has("PERMISSION_RISK")) {
    add("PERMISSION_RISK", "PRIVACY_DATA_CHECK", "Security or privacy impact is bounded.", "Security/privacy boundary evidence or domain-owner decision.", {
      owner: "domain-owner",
      decisionRef: "human-decision:security-privacy-owner",
    });
  }

  return dedupeObligations(obligations);
}

function testCorrectnessControlsFor({ obligations, surfaces, effectiveChangeKind, riskDomains }) {
  const controls = [];
  const add = (id, appliesTo, reason) => controls.push({
    id,
    applies_to: appliesTo,
    required: "Yes",
    reason,
  });
  if (obligations.some((item) => item.verification_type === "API_NEGATIVE_TEST")) {
    add("control:negative-path-required", "API_CONTRACT", "Validation or API behavior requires failure-path proof.");
  }
  if (obligations.some((item) => item.source_surface === "BACKEND_RULE")) {
    add("control:ui-only-not-enough", "BACKEND_RULE", "Backend/domain rules must be verified outside the UI.");
  }
  if (surfaces.some((surface) => surface.surface === "FRONTEND_UI") && surfaces.some((surface) => surface.surface === "BACKEND_RULE")) {
    add("control:cross-surface-required", "FRONTEND_UI,BACKEND_RULE", "Cross-surface rules need UI and backend/API evidence.");
  }
  if (projectLevel === "BL2" || riskDomains.some((item) => ["high-risk-domain", "permission", "security-or-privacy"].includes(item))) {
    add("control:generated-test-review-required", "TEST_COVERAGE", "High-risk or BL2 work needs review signals for Codex-generated tests.");
  }
  if (effectiveChangeKind === "BUG_FIX") {
    add("control:regression-required", "BUG_FIX", "Bug fixes require a regression obligation, not only current passing behavior.");
  }
  add("control:broad-command-not-proof", "TEST_COVERAGE", "Broad test commands must map to specific obligations.");
  return controls;
}

function manualVerificationFor(surfaces, riskDomains) {
  const manual = [];
  const needsOwner = surfaces.some((surface) => surface.status === "NEEDS_HUMAN_DECISION")
    || riskDomains.some((item) => ["high-risk-domain", "permission", "security-or-privacy", "release"].includes(item));
  if (!needsOwner) return manual;
  manual.push({
    id: "manual:domain-or-release-owner",
    owner: riskDomains.includes("release") ? "release-owner" : "domain-owner",
    decision_ref: riskDomains.includes("release") ? "human-decision:release-owner" : "human-decision:domain-owner",
    expected_manual_evidence: "Owner confirms the high-risk verification scope before completion is claimed.",
    blocking: "Yes",
  });
  return manual;
}

function notApplicableFor(surfaces) {
  return surfaces
    .filter((surface) => surface.status === "NOT_APPLICABLE")
    .map((surface) => ({
      source_surface: surface.surface,
      reason: surface.reason || "Not applicable according to Change Impact Coverage.",
    }));
}

function stateFor({ effectiveChangeKind, businessRule, impact, surfaces, obligations }) {
  if (effectiveChangeKind === "BUSINESS_RULE") {
    if (!businessRule.ref) return "NEEDS_BUSINESS_RULE_CLOSURE";
    if (businessRule.evidence?.state !== "READY_FOR_IMPACT_COVERAGE") return "NEEDS_BUSINESS_RULE_CLOSURE";
  }
  if (!impact.ref) return "NEEDS_IMPACT_COVERAGE";
  if (!impact.evidence) return "NEEDS_IMPACT_COVERAGE";
  if (surfaces.some((surface) => surface.status === "NEEDS_HUMAN_DECISION")) return "NEEDS_DOMAIN_OWNER";
  if (obligations.length === 0) return "BLOCKED_BY_UNCLEAR_TEST_SCOPE";
  return "VERIFICATION_PLAN_READY";
}

function sourceSystemsFor(businessRule, impact) {
  const systems = [];
  if (businessRule.ref) {
    systems.push({
      name: "business_rule_closure",
      status: businessRule.evidence ? "RECORDED" : "UNRESOLVED",
      ref: businessRule.ref,
      source_outcome: businessRule.evidence?.state || "UNRESOLVED",
      digest: businessRule.evidence?.business_rule_digest || "not provided",
    });
  }
  if (impact.ref) {
    systems.push({
      name: "change_impact_coverage",
      status: impact.evidence ? "RECORDED" : "UNRESOLVED",
      ref: impact.ref,
      source_outcome: impact.evidence?.outcome || "UNRESOLVED",
      digest: impact.evidence?.impact_digest || "not provided",
    });
  }
  return systems;
}

function sourceRefsFor(businessRule, impact) {
  const refs = [];
  if (businessRule.ref) refs.push(businessRule.ref);
  if (impact.ref) refs.push(impact.ref);
  if (refs.length === 0) refs.push("human-decision:verification-scope");
  return refs;
}

function resolveArtifact(root, ref) {
  const normalized = normalizeArtifactRef(ref);
  if (!normalized) return { ref: "", file: "", evidence: null };
  const candidates = [
    path.resolve(root, normalized),
    path.resolve(root, ".intentos", normalized),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(root, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    const content = fs.readFileSync(candidate, "utf8");
    const extracted = extractMachineReadableEvidence(content);
    return {
      ref,
      file: candidate,
      evidence: extracted?.ok ? extracted.value : null,
    };
  }
  return { ref, file: "", evidence: null };
}

function normalizeArtifactRef(ref) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return "";
  const relative = match[1].trim();
  if (!relative || path.isAbsolute(relative)) return "";
  return relative;
}

function taskRefFor(userIntent, businessRule, impact) {
  if (businessRule?.task_ref) return businessRule.task_ref;
  const impactTask = impact?.user_request?.task_ref;
  if (impactTask && !/^not provided$/i.test(impactTask)) return impactTask;
  return `tasks/001-${slugify(userIntent)}.md`;
}

function inferChangeKind(userIntent, businessRule, impact) {
  const text = [
    userIntent,
    businessRule?.primary_business_rule_type || "",
    impact?.change_type?.primary_type || "",
  ].join("\n").toLowerCase();
  if (/\bbug|fix|regression|修复|问题\b/i.test(text)) return "BUG_FIX";
  if (/\brefactor|cleanup|重构|清理\b/i.test(text)) return "REFACTOR";
  if (/\bdependency|upgrade|package|依赖|升级\b/i.test(text)) return "DEPENDENCY_UPGRADE";
  if (/\bconfig|ci|workflow|配置\b/i.test(text)) return "CONFIG_CHANGE";
  if (/\bdocs?|documentation|readme|文档\b/i.test(text)) return "DOCS_ONLY";
  if (/\brelease|launch|deploy|上线|发布\b/i.test(text)) return "RELEASE_PREPARATION";
  if (/\badoption|migration|intentos|迁移|接入\b/i.test(text)) return "ADOPTION_MIGRATION";
  if (businessRule || /\brule|required|validation|must|不能为空|必须|校验\b/i.test(text)) return "BUSINESS_RULE";
  return "BUSINESS_RULE";
}

function inferredSurfacesFor(userIntent, effectiveChangeKind) {
  const text = String(userIntent || "").toLowerCase();
  if (effectiveChangeKind === "DOCS_ONLY") {
    return [
      surface("DOCS_HANDOFF", "REQUIRED", "Docs-only request.", "Doc diff or handoff evidence."),
      surface("TEST_COVERAGE", "OPTIONAL", "No executable behavior is implied.", "Checker evidence or not-applicable reason."),
    ];
  }
  const surfaces = [
    surface("USER_FLOW", "REQUIRED", "User-visible behavior may change.", "Behavior evidence."),
    surface("FRONTEND_UI", "REQUIRED", "Visible form or screen behavior may change.", "UI evidence."),
    surface("API_CONTRACT", "REQUIRED", "Client/server expectations may change.", "API evidence."),
    surface("BACKEND_RULE", "REQUIRED", "Server/domain enforcement may be needed.", "Backend rule evidence."),
    surface("ERROR_COPY", "REQUIRED", "Users need bounded feedback.", "Error copy evidence."),
    surface("TEST_COVERAGE", "REQUIRED", "Task-specific verification is needed.", "Test or smoke evidence."),
    surface("DOCS_HANDOFF", "REQUIRED", "Future work needs the rule recorded.", "Handoff evidence."),
  ];
  if (/\bdata|database|migration|schema|enum|db|历史|迁移\b/i.test(text)) {
    surfaces.push(surface("DATA_MODEL", "REQUIRED", "Data shape or historical behavior may change.", "Data model evidence."));
  } else {
    surfaces.push(surface("DATA_MODEL", "NOT_APPLICABLE", "No data model change is indicated.", "Reason recorded."));
  }
  if (/\bpermission|role|tenant|security|privacy|权限|角色|租户\b/i.test(text)) {
    surfaces.push(surface("PERMISSION_RISK", "NEEDS_HUMAN_DECISION", "Permission or privacy risk may be affected.", "Owner decision."));
  } else {
    surfaces.push(surface("PERMISSION_RISK", "NOT_APPLICABLE", "No permission or privacy change is indicated.", "Reason recorded."));
  }
  if (/\brelease|production|deploy|rollback|上线|发布|回滚\b/i.test(text)) {
    surfaces.push(surface("RELEASE_IMPACT", "NEEDS_HUMAN_DECISION", "Release impact may be affected.", "Release owner decision."));
  } else {
    surfaces.push(surface("RELEASE_IMPACT", "NOT_APPLICABLE", "No release impact is indicated.", "Reason recorded."));
  }
  return surfaces;
}

function surface(name, status, reason, expectedEvidence) {
  return {
    surface: name,
    status,
    reason,
    expected_evidence: expectedEvidence,
  };
}

function riskDomainsFor(userIntent, businessRule, impact, surfaces) {
  const domains = new Set(businessRule?.risk_domains || []);
  const activeSurfaces = surfaces
    .filter((item) => item.status !== "NOT_APPLICABLE")
    .map((item) => item.surface)
    .join(" ");
  const text = [
    userIntent,
    impact?.change_type?.reason || "",
    activeSurfaces,
  ].join("\n").toLowerCase();
  if (/\bpermission|role|tenant|audit|权限|角色|租户\b/i.test(text)) domains.add("permission");
  if (/\bsecurity|privacy|secret|customer data|隐私|安全|客户数据\b/i.test(text)) domains.add("security-or-privacy");
  if (/\brelease|production|deploy|rollback|上线|发布|回滚\b/i.test(text)) domains.add("release");
  if (/\bpayment|tax|finance|legal|hr|compliance|支付|税|财务|法务|合规\b/i.test(text)) domains.add("high-risk-domain");
  if (domains.size === 0) domains.add("validation-rule");
  return [...domains];
}

function inferPlatforms(root, userIntent) {
  const platforms = new Set();
  const text = `${userIntent}\n${packageMetadata(root)}`.toLowerCase();
  if (/\b(next|react|vue|vite|web|frontend)\b/i.test(text)) platforms.add("web");
  if (/\b(express|fastify|koa|api|backend|server)\b/i.test(text)) platforms.add("backend");
  if (/\bmini-program|小程序\b/i.test(text)) platforms.add("mini-program");
  if (/\bios|swift|xcode\b/i.test(text)) platforms.add("ios");
  if (/\bandroid|gradle|kotlin\b/i.test(text)) platforms.add("android");
  if (platforms.size === 0) platforms.add("web");
  return [...platforms];
}

function packageMetadata(root) {
  try {
    const file = path.join(root, "package.json");
    if (!fs.existsSync(file)) return "";
    return fs.readFileSync(file, "utf8").slice(0, 12000);
  } catch {
    return "";
  }
}

function testRiskFor(surfaceName, type) {
  if (type === "API_NEGATIVE_TEST") return "Must fail for invalid input, not only assert happy path.";
  if (surfaceName === "BACKEND_RULE") return "UI-only tests can miss backend bypass paths.";
  if (surfaceName === "FRONTEND_UI") return "API-only tests can miss user-facing behavior.";
  if (surfaceName === "DATA_MODEL") return "Tests must account for historical data, migration, and rollback impact.";
  if (surfaceName === "PERMISSION_RISK") return "Tests must account for role, tenant, ownership, and audit boundaries.";
  return "Must assert intended behavior rather than implementation details.";
}

function suggestedBroadCommand(userIntent) {
  if (/\bios|swift|xcode\b/i.test(userIntent)) return "xcodebuild test";
  if (/\bandroid|gradle\b/i.test(userIntent)) return "./gradlew test";
  return "npm test or project-standard equivalent";
}

function dedupeObligations(obligations) {
  const seen = new Set();
  return obligations.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function summaryFor(state, obligations, surfaces) {
  const blocking = obligations.filter((item) => item.priority === "BLOCKING").length;
  const requiredSurfaces = surfaces.filter((item) => item.status === "REQUIRED" || item.status === "NEEDS_HUMAN_DECISION").length;
  return `Verification state ${state}; ${requiredSurfaces} affected surfaces require ${obligations.length} obligations, including ${blocking} blocking obligations.`;
}

function nextStepFor(state) {
  if (state === "VERIFICATION_PLAN_READY") return "Use this plan during execution, then bind actual test evidence in a later Test Evidence Report.";
  if (state === "NEEDS_BUSINESS_RULE_CLOSURE") return "Create or resolve a READY Business Rule Closure before verification planning is ready.";
  if (state === "NEEDS_IMPACT_COVERAGE") return "Create or resolve a Change Impact Coverage report before verification planning is ready.";
  if (state === "NEEDS_DOMAIN_OWNER") return "Ask the domain or release owner to confirm high-risk verification scope.";
  if (state === "BLOCKED_BY_UNCLEAR_TEST_SCOPE") return "Clarify the task or affected surfaces before execution.";
  return "Record a concrete not-applicable reason.";
}

function boundariesFor() {
  return {
    writes_target_files: "No",
    executes_tests: "No",
    authorizes_implementation: "No",
    approves_release_or_production: "No",
    proves_product_correctness: "No",
    proves_real_environment_behavior: "No",
  };
}

function humanReportText(report) {
  return `# Verification Plan

## Human Summary

${report.humanSummary}

## User Request

- Request: ${report.intent}
- Task ref: \`${report.taskRef}\`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
${report.sourceSystems.length > 0 ? report.sourceSystems.map((item) => `| \`${item.name}\` | \`${item.status}\` | \`${item.ref}\` | \`${item.source_outcome}\` | \`${item.digest}\` |`).join("\n") : "| `none` | `NOT_RECORDED` | `not provided` | `not provided` | `not provided` |"}

## Verification Plan Identity

- Verification plan ref: \`${report.planIdentity.verificationPlanRef}\`
- Verification plan digest: \`${report.planIdentity.verificationPlanDigest}\`
- Intent digest: \`${report.planIdentity.intentDigest}\`

## Project Calibration

- Project level: \`${report.projectCalibration.projectLevel}\`
- Platform profiles: ${report.projectCalibration.platformProfiles.map((item) => `\`${item}\``).join(", ")}
- Change kind: \`${report.projectCalibration.changeKind}\`
- Risk domains: ${report.projectCalibration.riskDomains.map((item) => `\`${item}\``).join(", ")}

## Affected Surface Inputs

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
${report.affectedSurfaces.map((item) => `| \`${item.surface}\` | \`${item.status}\` | ${item.reason} | ${item.expected_evidence} |`).join("\n")}

## Verification Obligations

| ID | Surface | Type | Required | Priority | Behavior Under Test | Expected Evidence | Broad Command Only | Source Refs |
|---|---|---|---|---|---|---|---|---|
${report.verificationObligations.map((item) => `| \`${item.id}\` | \`${item.source_surface}\` | \`${item.verification_type}\` | \`${item.required}\` | \`${item.priority}\` | ${item.behavior_under_test} | ${item.expected_evidence} | \`${item.broad_command_only}\` | ${item.source_refs.map((ref) => `\`${ref}\``).join(", ")} |`).join("\n")}

## Test Correctness Controls

| ID | Applies To | Required | Reason |
|---|---|---|---|
${report.testCorrectnessControls.map((item) => `| \`${item.id}\` | \`${item.applies_to}\` | \`${item.required}\` | ${item.reason} |`).join("\n")}

## Manual Verification

| ID | Owner | Decision Ref | Expected Manual Evidence | Blocking |
|---|---|---|---|---|
${report.manualVerification.length > 0 ? report.manualVerification.map((item) => `| \`${item.id}\` | ${item.owner} | \`${item.decision_ref}\` | ${item.expected_manual_evidence} | \`${item.blocking}\` |`).join("\n") : "| `none` | None | `not required` | Not required. | `No` |"}

## Not Applicable Obligations

| Surface | Reason |
|---|---|
${report.notApplicableObligations.length > 0 ? report.notApplicableObligations.map((item) => `| \`${item.source_surface}\` | ${item.reason} |`).join("\n") : "| `none` | No not-applicable obligations recorded. |"}

## Boundaries

- This plan writes target files: ${report.boundaries.writes_target_files}
- This plan executes tests: ${report.boundaries.executes_tests}
- This plan authorizes implementation: ${report.boundaries.authorizes_implementation}
- This plan approves release or production: ${report.boundaries.approves_release_or_production}
- This plan proves product correctness: ${report.boundaries.proves_product_correctness}
- This plan proves real-environment behavior: ${report.boundaries.proves_real_environment_behavior}

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(report.structuredEvidence, null, 2)}
\`\`\`

## Outcome

\`${report.outcome}\`

## Next Step

${report.nextStep}
`;
}

function resolveOutputPath(root, requestedPath) {
  const resolved = path.resolve(root, String(requestedPath));
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out must stay inside the target project.");
    process.exit(1);
  }
  return resolved;
}

function verificationPlanRefForOutput(root, requestedOutputPath, taskSlug) {
  if (!requestedOutputPath) return `artifact:verification-plans/001-${taskSlug}.md`;
  const relative = path.relative(root, requestedOutputPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return `artifact:verification-plans/001-${taskSlug}.md`;
  return `artifact:${relative.split(path.sep).join("/")}`;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "verification-plan";
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}
