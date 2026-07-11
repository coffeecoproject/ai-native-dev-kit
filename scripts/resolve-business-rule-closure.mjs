#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
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
  const signals = collectSignals(root, userIntent);
  const classification = classifyBusinessRule(userIntent, signals);
  const taskSlug = slugify(userIntent);
  const taskRef = `tasks/001-${taskSlug}.md`;
  const businessRuleId = `business-rule:${taskSlug}`;
  const businessRuleRef = businessRuleRefForOutput(root, outputPath, taskSlug);
  const sourceRuleRefs = sourceRuleRefsFor(root);
  const conflicts = conflictsFor(userIntent, sourceRuleRefs);
  const dimensions = dimensionsFor(userIntent, classification, signals, conflicts);
  const safeDefaults = safeDefaultsFor(userIntent, signals);
  const decisionItems = decisionItemsFor(classification, signals, conflicts, dimensions, safeDefaults);
  const state = stateFor({ classification, dimensions, decisionItems, safeDefaults, conflicts });
  const canEnterImpactCoverage = state === "READY_FOR_IMPACT_COVERAGE" ? "Yes" : "No";
  const realEnvironmentValidation = {
    expectation: "Local smoke evidence first; staging or internal trial evidence when available before release review.",
    claims_verified: "No",
    evidence_refs: [],
  };
  const ruleModel = {
    task_ref: taskRef,
    user_request: userIntent,
    primary_business_rule_type: classification.primary,
    business_rule_types: classification.types,
    risk_domains: classification.riskDomains,
    dimensions,
    decision_items: decisionItems,
    safe_defaults: safeDefaults,
    out_of_scope: outOfScopeFor(),
    source_rule_refs: sourceRuleRefs,
    conflicts,
    unknown_authority_items: unknownAuthorityItemsFor(classification),
    real_environment_validation: realEnvironmentValidation,
    state,
  };
  const sourceRequestDigest = digest(userIntent);
  const businessRuleDigest = evidenceDigest(ruleModel, []);
  const structuredEvidenceBase = {
    schema_version: "1.75.0",
    artifact_type: "business_rule_closure",
    task_ref: taskRef,
    user_request: userIntent,
    source_request_digest: sourceRequestDigest,
    business_rule_id: businessRuleId,
    business_rule_ref: businessRuleRef,
    business_rule_digest: businessRuleDigest,
    closure_digest: "",
    primary_business_rule_type: classification.primary,
    business_rule_types: classification.types,
    risk_domains: classification.riskDomains,
    state,
    can_enter_impact_coverage: canEnterImpactCoverage,
    can_codex_write_now: "No",
    dimensions,
    decision_items: decisionItems,
    safe_defaults: safeDefaults,
    out_of_scope: outOfScopeFor(),
    source_rule_refs: sourceRuleRefs,
    conflicts,
    unknown_authority_items: unknownAuthorityItemsFor(classification),
    real_environment_validation: realEnvironmentValidation,
    next_step: nextStepFor(state),
    boundaries: boundariesFor(),
  };
  const structuredEvidence = {
    ...structuredEvidenceBase,
    closure_digest: evidenceDigest(structuredEvidenceBase, ["closure_digest"]),
  };

  const boundaries = boundariesFor();
  return {
    reportType: "BUSINESS_RULE_CLOSURE",
    schemaVersion: "1.75.0",
    generatedBy: "scripts/resolve-business-rule-closure.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      businessRuleState: state,
      primaryRuleType: classification.primary,
      canEnterImpactCoverage,
      canCodexWriteNow: "No",
      safeNextStep: nextStepFor(state),
    },
    userRequest: userIntent,
    codexUnderstanding: understandingFor(userIntent, signals, classification),
    ruleIdentity: {
      businessRuleId,
      businessRuleRef,
      sourceRequestDigest,
      businessRuleDigest,
      closureDigest: structuredEvidence.closure_digest,
    },
    dimensions,
    userConfirmationQuestions: userQuestionsFor(decisionItems),
    safeDefaults,
    sourceRuleRefs,
    conflicts,
    decisionsNeeded: decisionItems,
    outOfScope: outOfScopeFor(),
    realEnvironmentValidation,
    nextStep: nextStepFor(state),
    boundaries: {
      ...boundaries,
      writesTargetFiles: boundaries.writes_target_files,
      authorizesImplementation: boundaries.authorizes_implementation,
      approvesReleaseOrProduction: boundaries.approves_release_or_production,
      approvesHighRiskDomainDecisions: boundaries.approves_high_risk_domain_decisions,
      provesRealEnvironmentBehavior: boundaries.proves_real_environment_behavior,
    },
    structuredEvidence,
    outcome: state,
  };
}

function collectSignals(root, userIntent) {
  const intentText = String(userIntent || "").toLowerCase();
  const projectText = projectTextSignals(root).toLowerCase();
  const text = `${intentText}\n${projectText}`;
  return {
    hasProject: fs.existsSync(root),
    hasMultipleClients: /\b(web|frontend|react|vue|next|mini-program|小程序|ios|android|mobile|api)\b/i.test(text)
      && /\b(api|backend|server|service)\b/i.test(text),
    hasHighRiskDomain: /\b(finance|invoice|tax|legal|hr|payment|privacy|compliance|migration|production|customer data|发票|税|付款|支付|隐私|合规)\b/i.test(intentText),
    hasTaxField: /\b(tax id|tax number|taxpayer|invoice|税号|纳税)\b/i.test(intentText),
    hasPermission: /\b(permission|role|rbac|approval|approve|visibility|admin|权限|审批|角色)\b/i.test(intentText),
    hasStatus: /\b(status|state|transition|submit|approve|reject|状态|提交|审批|驳回)\b/i.test(intentText),
    hasIntegration: /\b(webhook|callback|sync|integration|import|export|scheduled|cron|导入|导出|同步|回调)\b/i.test(intentText),
    hasAppointment: /\b(appointment|booking|schedule|reschedule|预约|排期)\b/i.test(intentText),
  };
}

function projectTextSignals(root) {
  const candidates = [
    "AGENTS.md",
    "docs/business-spec-index.md",
    "docs/project-profile.md",
    "docs/permission-model.md",
    "docs/WEB_ENGINEERING_BASELINE.md",
    "docs/WEB_ENVIRONMENT_BASELINE.md",
  ];
  return candidates
    .map((relativePath) => {
      const file = path.join(root, relativePath);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return "";
      try {
        return fs.readFileSync(file, "utf8").slice(0, 8000);
      } catch {
        return "";
      }
    })
    .join("\n");
}

function classifyBusinessRule(userIntent, signals) {
  const types = new Set();
  if (/\b(required|must|cannot|limit|validate|validation|restriction)\b|不能为空|必须|限制|校验/i.test(userIntent)) {
    types.add("VALIDATION_RULE");
  }
  if (signals.hasPermission) types.add("PERMISSION_RULE");
  if (signals.hasStatus) types.add("STATUS_TRANSITION");
  if (signals.hasHighRiskDomain) types.add("FINANCE_RULE");
  if (signals.hasIntegration) types.add("DATA_LIFECYCLE_RULE");
  if (/\b(notification|reminder|alert|通知|提醒)\b/i.test(userIntent)) types.add("NOTIFICATION_RULE");
  if (/\b(approval|approve|review|审批|审核)\b/i.test(userIntent)) types.add("APPROVAL_RULE");
  if (/\b(webhook|callback|sync|provider|integration|回调|同步|集成)\b/i.test(userIntent)) types.add("INTEGRATION_RULE");
  if (types.size === 0) types.add("UNKNOWN");
  const ordered = [...types];
  return {
    primary: ordered[0],
    types: ordered,
    riskDomains: riskDomainsFor(signals, userIntent),
  };
}

function riskDomainsFor(signals, userIntent) {
  const domains = [];
  if (signals.hasAppointment) domains.push("appointment-scheduling");
  if (signals.hasTaxField) domains.push("tax-sensitive-field");
  if (signals.hasPermission) domains.push("permission");
  if (signals.hasHighRiskDomain) domains.push("high-risk-domain");
  if (signals.hasIntegration) domains.push("integration-or-data-flow");
  if (domains.length === 0) domains.push(slugify(userIntent).slice(0, 40) || "general-business-rule");
  return domains;
}

function dimensionsFor(userIntent, classification, signals, conflicts) {
  const dims = new Map();
  const add = (dimension, status, summary, options = {}) => {
    dims.set(dimension, {
      dimension,
      status,
      summary,
      evidence_refs: options.evidenceRefs || ["human-decision:rule-understanding"],
      decision_refs: options.decisionRefs || [],
      safe_default_refs: options.safeDefaultRefs || [],
      notes: options.notes || "",
    });
  };
  if (classification.primary === "UNKNOWN") {
    add("ACTOR", "NEEDS_USER_CONFIRMATION", "Who is affected by this rule?");
    add("TRIGGER_SCENARIO", "NEEDS_USER_CONFIRMATION", "When should this rule run?");
    add("INPUT_CONDITION", "NEEDS_USER_CONFIRMATION", "What exact condition should be accepted or rejected?");
    add("SUCCESS_PATH", "NEEDS_USER_CONFIRMATION", "What should happen when the rule passes?");
    add("FAILURE_PATH", "NEEDS_USER_CONFIRMATION", "What should happen when the rule fails?");
    return [...dims.values()];
  }
  add("ACTOR", "CLOSED", signals.hasAppointment ? "People or operators creating or changing an appointment are affected." : "Codex must infer affected actors from active UI, API, backend, and workflow entry points.");
  add("TRIGGER_SCENARIO", "CLOSED", signals.hasAppointment ? "Apply during appointment creation and every later edit or reschedule that can change the relevant value." : "Apply at every active create, edit, submit, import, API, or workflow entry point discovered by impact coverage.");
  add("INPUT_CONDITION", "CLOSED", userIntent);
  add("SUCCESS_PATH", "CLOSED", "Valid input continues through the normal user flow.");
  add("FAILURE_PATH", "CLOSED", "Invalid input is blocked with a user-facing explanation.");
  add("USER_FEEDBACK", "CLOSED", "Show a clear inline error, toast, or operator-facing message.");
  add("SERVER_ENFORCEMENT", "CLOSED", "Backend/domain/API enforcement is expected; UI-only validation is not enough.");
  add("DATA_BEHAVIOR", "DEFAULTED_WITH_REASON", "Do not batch-change existing records unless the user explicitly consents to that irreversible data effect.", {
    safeDefaultRefs: ["default:existing-records"],
  });
  add("EFFECTIVE_TIME", "DEFAULTED_WITH_REASON", "Apply the rule to new records and future edits/reschedules/submissions.", {
    safeDefaultRefs: ["default:effective-time"],
  });
  add("EXCEPTION_POLICY", "DEFAULTED_WITH_REASON", "No bypass or exemption is assumed unless the user states the corresponding business exception.", {
    safeDefaultRefs: ["default:no-implicit-exemptions"],
  });
  add("PRECEDENCE", "NOT_APPLICABLE_WITH_REASON", "No conflicting priority rule is known from the current request.");
  add("ROLE_PERMISSION", signals.hasPermission ? "NEEDS_USER_CONFIRMATION" : "NOT_APPLICABLE_WITH_REASON", signals.hasPermission ? "The intended role behavior is a business fact; Codex owns the technical permission design." : "No role-specific behavior is explicit in the request.", {
    decisionRefs: signals.hasPermission ? ["decision:role_permission"] : [],
  });
  add("CROSS_SURFACE_CONSISTENCY", "CLOSED", signals.hasMultipleClients ? "Multiple active clients or backend/API signals exist; impact coverage must map each surface." : "No multi-client conflict is known; impact coverage must still check project signals.");
  add("AUDIT_LOGGING", signals.hasPermission || classification.types.includes("STATUS_TRANSITION") ? "CLOSED" : "NOT_APPLICABLE_WITH_REASON", signals.hasPermission ? "Codex must include audit evidence for permission or status behavior." : "No audit-specific behavior is explicit.");
  add("IDEMPOTENCY_CONCURRENCY", signals.hasIntegration ? "CLOSED" : "NOT_APPLICABLE_WITH_REASON", signals.hasIntegration ? "Codex must design and verify retry, deduplication, and concurrency behavior for integrations." : "No retry or concurrent workflow is explicit.");
  add("DOWNSTREAM_EFFECT", "CLOSED", "Reports, exports, notifications, dashboards, and integrations must be checked during impact coverage.");
  add("TENANCY_DATA_BOUNDARY", "NOT_APPLICABLE_WITH_REASON", "No tenant or data-isolation change is explicit in the request.");
  add("LOCALIZATION_REGION", signals.hasTaxField ? "NEEDS_DOMAIN_OWNER" : "NOT_APPLICABLE_WITH_REASON", signals.hasTaxField ? "Tax or regional meaning needs an authoritative external fact; the user does not make the technical design decision." : "No regional variation is explicit.");
  add("SOURCE_RULE_CONFLICT", conflicts.some((conflict) => conflict.status === "UNRESOLVED") ? "BLOCKED_CONTRADICTORY" : "CLOSED", conflicts.some((conflict) => conflict.status === "UNRESOLVED") ? "Existing rule conflict is unresolved." : "No existing rule conflict is recorded.");
  add("REAL_ENVIRONMENT_VALIDATION", "CLOSED", "Local smoke evidence first; staging or internal trial before release review when available.");
  add("OUT_OF_SCOPE", "CLOSED", "Release, production, and batch data mutation are out of scope for this closure.");
  add("HUMAN_DECISION", "CLOSED", "No blocking human decision remains for low-risk validation semantics.");
  if (classification.riskDomains.includes("high-risk-domain")) {
    add("HUMAN_DECISION", "NEEDS_DOMAIN_OWNER", "A high-risk business or external-policy fact is missing; no additional technical choice is delegated to the user.", {
      decisionRefs: ["decision:external-business-fact"],
    });
  }
  return [...dims.values()];
}

function safeDefaultsFor() {
  return [
    {
      id: "default:existing-records",
      recommendation: "Do not batch-change existing records.",
      reason: "Avoid silent historical data mutation.",
      requires_user_acceptance: "No",
      accepted_by_user: "No",
      can_codex_apply_now: "No",
    },
    {
      id: "default:effective-time",
      recommendation: "Apply the new rule to new records and future edits or reschedules.",
      reason: "This is conservative and avoids rewriting historical data.",
      requires_user_acceptance: "No",
      accepted_by_user: "No",
      can_codex_apply_now: "No",
    },
    {
      id: "default:no-implicit-exemptions",
      recommendation: "Do not assume admin, legacy, regional, or special-customer exemptions.",
      reason: "Hidden exceptions change business behavior and require explicit confirmation.",
      requires_user_acceptance: "No",
      accepted_by_user: "No",
      can_codex_apply_now: "No",
    },
  ];
}

function decisionItemsFor(classification, signals, conflicts, dimensions, safeDefaults) {
  const decisions = [];
  if (classification.riskDomains.includes("high-risk-domain")) {
    decisions.push({
      id: "decision:external-business-fact",
      question: "What real business outcome is intended here, and is there an authoritative external rule or provider requirement that must be followed?",
      owner: "CURRENT_CONVERSATION_USER_OR_EXTERNAL_SOURCE",
      blocking: "Yes",
      status: "PENDING",
    });
  }
  if (signals.hasTaxField) {
    decisions.push({
      id: "decision:tax-field-boundary",
      question: "Is this only a field-entry validation, not a tax compliance, invoice validity, filing, or legal decision?",
      owner: "CURRENT_CONVERSATION_USER_OR_EXTERNAL_SOURCE",
      blocking: "Yes",
      status: "PENDING",
    });
  }
  if (conflicts.some((conflict) => conflict.status === "UNRESOLVED")) {
    decisions.push({
      id: "decision:existing-rule-conflict",
      question: "The request conflicts with an existing business rule. What real behavior should the product preserve? Codex will reconcile the technical rules.",
      owner: "CURRENT_CONVERSATION_USER",
      blocking: "Yes",
      status: "PENDING",
    });
  }
  for (const item of safeDefaults) {
    if (item.requires_user_acceptance === "Yes" && item.accepted_by_user !== "Yes") {
      decisions.push({
        id: `decision:${item.id.replace(/^default:/, "")}`,
        question: `Do you accept this safe default: ${item.recommendation}`,
        owner: "user",
        blocking: "Yes",
        status: "PENDING",
      });
    }
  }
  for (const dimension of dimensions) {
    if (dimension.status === "NEEDS_USER_CONFIRMATION") {
      decisions.push({
        id: `decision:${dimension.dimension.toLowerCase()}`,
        question: dimension.summary,
        owner: "user",
        blocking: "Yes",
        status: "PENDING",
      });
    }
  }
  return decisions.slice(0, 3);
}

function stateFor({ dimensions, decisionItems, safeDefaults, conflicts }) {
  if (dimensions.some((item) => item.status === "BLOCKED_CONTRADICTORY")) return "BLOCKED_INCOMPLETE_RULE";
  if (conflicts.some((conflict) => conflict.status === "UNRESOLVED")) return "BLOCKED_INCOMPLETE_RULE";
  if (dimensions.some((item) => item.status === "NEEDS_DOMAIN_OWNER")) return "NEEDS_DOMAIN_OWNER";
  if (decisionItems.some((item) => item.blocking === "Yes" && item.status === "PENDING")) return "NEEDS_USER_CONFIRMATION";
  if (safeDefaults.some((item) => item.requires_user_acceptance === "Yes" && item.accepted_by_user !== "Yes")) return "NEEDS_USER_CONFIRMATION";
  return "READY_FOR_IMPACT_COVERAGE";
}

function understandingFor(userIntent, signals, classification) {
  if (signals.hasAppointment) {
    return [
      "Appointment creation and rescheduling should require a service time.",
      "Existing appointments are not changed automatically.",
      "Change Impact Coverage must check UI, API, backend, error copy, tests, and real-environment evidence.",
    ];
  }
  if (classification.riskDomains.includes("tax-sensitive-field")) {
    return [
      "This may be a field-entry validation only, but tax/compliance meaning is not assumed.",
      "An authoritative tax or external-policy fact is required before the dependent claim can be treated as ready; unaffected engineering may continue.",
      "No tax compliance, invoice validity, filing, or legal meaning is approved by this closure.",
    ];
  }
  return [
    "The request describes a business rule that must be clarified before implementation.",
    "Codex will identify actor, trigger, input, success path, failure path, data behavior, and validation expectations.",
    "The next safe step is Change Impact Coverage only when the rule is closed enough.",
  ];
}

function userQuestionsFor(decisionItems) {
  return decisionItems.filter((item) => item.status === "PENDING").slice(0, 1).map((item) => item.question);
}

function sourceRuleRefsFor(root) {
  const refs = [];
  for (const relativePath of [
    "AGENTS.md",
    "docs/business-spec-index.md",
    "docs/permission-model.md",
    "docs/project-profile.md",
    "existing-rule-reconciliations",
  ]) {
    if (fs.existsSync(path.join(root, relativePath))) refs.push(`file:${relativePath}`);
  }
  return refs;
}

function conflictsFor(userIntent, sourceRuleRefs) {
  if (/conflict|contradict|冲突|矛盾/i.test(userIntent) && sourceRuleRefs.length > 0) {
    return [{
      id: "conflict:existing-rule",
      source_ref: sourceRuleRefs[0],
      status: "UNRESOLVED",
      summary: "User request indicates a possible conflict with existing project rules.",
    }];
  }
  return [];
}

function unknownAuthorityItemsFor(classification) {
  if (classification.riskDomains.includes("high-risk-domain")) {
    return ["An authoritative business or external-policy fact is not yet available for the dependent capability or claim."];
  }
  return [];
}

function outOfScopeFor() {
  return [
    "Implementation",
    "Release or production approval",
    "Batch mutation of existing records",
    "Finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions",
  ];
}

function boundariesFor() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_release_or_production: "No",
    approves_high_risk_domain_decisions: "No",
    proves_real_environment_behavior: "No",
  };
}

function nextStepFor(state) {
  if (state === "READY_FOR_IMPACT_COVERAGE") return "Run Change Impact Coverage with this business_rule_ref.";
  if (state === "NEEDS_DOMAIN_OWNER") return "Ask only for the missing business or external-policy fact; continue unaffected technical work internally.";
  if (state === "BLOCKED_INCOMPLETE_RULE") return "Resolve contradictory or missing business-rule facts before implementation.";
  if (state === "OUT_OF_SCOPE_FOR_CURRENT_TASK") return "Move this request to the Work Queue.";
  return "Ask the user to confirm the pending business decision.";
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  return `# Business Rule Closure Card

This card is a read-only business-rule interpretation. It does not write target files or approve release. Codex owns technical interpretation and implementation planning; the user supplies only missing business facts or consent to concrete real-world effects.

## Human Summary

| Field | Value |
| --- | --- |
| Business Rule State | \`${report.humanSummary.businessRuleState}\` |
| Primary Rule Type | \`${report.humanSummary.primaryRuleType}\` |
| Can Enter Impact Coverage | \`${report.humanSummary.canEnterImpactCoverage}\` |
| Can Codex Write Now | \`${report.humanSummary.canCodexWriteNow}\` |
| Safe Next Step | ${report.humanSummary.safeNextStep} |

## User Request

${report.userRequest}

## Codex Understanding

${report.codexUnderstanding.map((item) => `- ${item}`).join("\n")}

## Rule Identity

| Field | Value |
| --- | --- |
| Business Rule ID | \`${report.ruleIdentity.businessRuleId}\` |
| Business Rule Ref | \`${report.ruleIdentity.businessRuleRef}\` |
| Source Request Digest | \`${report.ruleIdentity.sourceRequestDigest}\` |
| Business Rule Digest | \`${report.ruleIdentity.businessRuleDigest}\` |
| Closure Digest | \`${report.ruleIdentity.closureDigest}\` |

## Business Rule Dimensions

| Dimension | Status | Summary | Evidence / Decision |
| --- | --- | --- | --- |
${report.dimensions.map((item) => `| \`${item.dimension}\` | \`${item.status}\` | ${item.summary} | ${[...item.evidence_refs, ...item.decision_refs, ...item.safe_default_refs].join(", ") || "N/A"} |`).join("\n")}

## User Confirmation Card

${report.userConfirmationQuestions.length > 0 ? report.userConfirmationQuestions.map((item) => `- ${item}`).join("\n") : "- No user confirmation is required before Change Impact Coverage."}

## Safe Defaults

| Default | Recommendation | Requires User Acceptance | Accepted By User | Can Codex Apply Now |
| --- | --- | --- | --- | --- |
${report.safeDefaults.map((item) => `| \`${item.id}\` | ${item.recommendation} | \`${item.requires_user_acceptance}\` | \`${item.accepted_by_user}\` | \`${item.can_codex_apply_now}\` |`).join("\n")}

## Existing Rule Check

| Source | Status | Notes |
| --- | --- | --- |
${report.sourceRuleRefs.length > 0 ? report.sourceRuleRefs.map((item) => `| \`${item}\` | \`RECORDED\` | Source checked for possible rule authority. |`).join("\n") : "| `N/A` | `NOT_FOUND` | No source rule conflict recorded. |"}

## Decisions Needed

${report.decisionsNeeded.length > 0 ? report.decisionsNeeded.map((item) => `- \`${item.id}\`: ${item.question}`).join("\n") : "- None before Change Impact Coverage."}

## Out Of Scope

${report.outOfScope.map((item) => `- ${item}`).join("\n")}

## Real-Environment Validation Expectation

${report.realEnvironmentValidation.expectation}

## Next Step

\`${report.nextStep}\`

## Boundaries

- This closure writes target files: ${report.boundaries.writes_target_files}
- This closure authorizes implementation: ${report.boundaries.authorizes_implementation}
- This closure approves release or production: ${report.boundaries.approves_release_or_production}
- This closure approves finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions: ${report.boundaries.approves_high_risk_domain_decisions}
- This closure proves real-environment behavior: ${report.boundaries.proves_real_environment_behavior}

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`
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

function businessRuleRefForOutput(root, requestedOutputPath, taskSlug) {
  if (!requestedOutputPath) return `artifact:business-rule-closures/001-${taskSlug}.md`;
  const relative = path.relative(root, requestedOutputPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return `artifact:business-rule-closures/001-${taskSlug}.md`;
  }
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
  return slug || "business-rule";
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}
