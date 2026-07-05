#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "auto-native"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_RECONCILED_RULES = 20;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, {
  intent: String(args.intent || ""),
  autoNative: Boolean(args["auto-native"]),
});

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildReport(root, options) {
  let nativePlans = readNativeMigrationPlans(root);
  if (nativePlans.length === 0 && options.autoNative) {
    nativePlans = generateNativeMigrationPlans(root);
  }
  const rules = nativePlans.flatMap((plan) => plan.rules.map((rule) => ({ ...rule, planPath: plan.path })));
  const ruleReconciliationCoverage = buildRuleReconciliationCoverage(rules);
  const items = buildReconciliationItems(rules);
  const protectedConstraints = buildProtectedConstraints(items);
  const releaseProductionGaps = buildReleaseProductionGaps(items);
  const conflicts = buildConflicts(items);
  const proposedNextSteps = [
    "Review Existing Rule Reconciliation Report",
    "Prepare Unified Apply Plan only after human approval",
    "Record Controlled Apply Readiness",
    "Record Approval Record",
    "Apply approved governance-file edits only",
  ];
  const nativeAdoptionDecision = nativeAdoptionDecisionFor(nativePlans, rules, items, ruleReconciliationCoverage);
  const canRecommendApplyPlan = nativeAdoptionDecision.recommendation.startsWith("BLOCKED")
    ? "NoUntilBlockResolved"
    : "Yes";
  const projectState = projectStateFor(nativePlans, rules);
  const outcome = nativeAdoptionDecision.recommendation.startsWith("BLOCKED")
    ? "BLOCKED"
    : conflicts.length > 0 ? "NEEDS_HUMAN_DECISION" : "RECONCILIATION_RECORDED";
  const report = {
    reportType: "EXISTING_RULE_RECONCILIATION",
    schemaVersion: "1.69.2",
    generatedBy: "scripts/resolve-existing-rule-reconciliation.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    intent: options.intent || "Not provided",
    readOnly: true,
    projectState,
    canCodexWriteNow: "No",
    canRecommendApplyPlan,
    canRecommendApplyPlanNow: canRecommendApplyPlan === "Yes" ? "Yes" : "No",
    canRecommendApplyPlanAfterHumanReview: "Yes",
    reconciliationAuthority: "RECOMMENDATION_ONLY",
    businessAuthority: "PROJECT_OWNED",
    productionAuthority: "HUMAN_OR_EXTERNAL_SYSTEM",
    requiresHumanApprovalBeforeApply: "Yes",
    inputEvidence: nativePlans.map((plan) => ({
      evidence: "Native Migration Plan",
      path: plan.path,
      status: plan.generated ? "generated read-only input" : "read-only input",
    })),
    existingRuleSet: rules.map((rule) => ({
      ruleRef: `native-migration:${rule.rule_id}`,
      surface: surfaceForRule(rule),
      summary: rule.source_excerpt,
      authority: rule.authority || "project-owned",
    })),
    intentOsReferenceSet: referenceSetFor(items),
    ruleReconciliationCoverage,
    reconciliationItems: items,
    protectedConstraints,
    releaseProductionGaps,
    conflicts,
    nativeAdoptionDecision,
    proposedNextSteps,
    boundary: {
      writesTargetFiles: "No",
      authorizesTargetFileWrites: "No",
      approvesGovernanceReplacement: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      changesHighRiskProjectBehavior: "No",
    },
    outcome,
  };
  report.structuredEvidence = structuredEvidenceFor(report);
  return report;
}

function readNativeMigrationPlans(root) {
  const dir = path.join(root, "native-migration-plans");
  if (!fs.existsSync(dir)) return [];
  return walkMarkdown(dir)
    .map((file) => {
      const content = fs.readFileSync(file, "utf8");
      const evidence = parseFencedJson(content);
      return {
        path: path.relative(root, file),
        evidence,
        rules: Array.isArray(evidence?.rule_classifications) ? evidence.rule_classifications : [],
      };
    })
    .filter((plan) => plan.evidence);
}

function generateNativeMigrationPlans(root) {
  const result = spawnSync(process.execPath, [
    path.join(__dirname, "resolve-native-migration.mjs"),
    root,
    "--json",
  ], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  if (result.status !== 0) return [];
  const parsed = parseJson(result.stdout);
  const evidence = parsed?.structuredEvidence;
  if (!evidence) return [];
  return [{
    path: "generated:native-migration",
    generated: true,
    evidence,
    nativeReport: parsed,
    rules: Array.isArray(evidence.rule_classifications) ? evidence.rule_classifications : [],
  }];
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function projectStateFor(nativePlans, rules) {
  const nativeProjectState = nativePlans.find((plan) => plan.evidence?.project_state)?.evidence.project_state;
  if (nativeProjectState === "DIRTY_WORKTREE_PROJECT") return "DIRTY_WORKTREE_PROJECT";
  if (nativeProjectState === "EXISTING_PRODUCTION_PROJECT") return "EXISTING_PRODUCTION_PROJECT";
  if (nativeProjectState === "EXISTING_GOVERNED_PROJECT") return "EXISTING_GOVERNED_PROJECT";
  if (nativeProjectState === "EXISTING_LIGHT_PROJECT") return "EXISTING_LIGHT_PROJECT";
  return rules.length > 0 ? "EXISTING_GOVERNED_PROJECT" : "EXISTING_PROJECT_NEEDS_NATIVE_MIGRATION_PLAN";
}

function nativeAdoptionDecisionFor(nativePlans, rules, items, coverage) {
  const generatedState = nativePlans.find((plan) => plan.evidence?.project_state)?.evidence?.project_state || "";
  const hasRelease = items.some((item) => item.surface === "RELEASE_PRODUCTION" || item.surface === "PRODUCTION_CONTROL");
  const hasEngineering = items.some((item) => item.surface === "ENGINEERING_BASELINE");
  const hasProtected = items.some((item) => item.surface === "PROTECTED_CONSTRAINT");
  const hasActionableUnknown = rules
    .filter((rule) => surfaceForRule(rule) === "UNKNOWN_AUTHORITY")
    .some((rule) => !isLowSignalGeneratedUnknown(rule));

  if (generatedState === "DIRTY_WORKTREE_PROJECT") {
    return nativeDecision({
      recommendation: "BLOCKED_BY_DIRTY_WORKTREE",
      migrationDepth: "READ_ONLY_DIAGNOSIS",
      confidence: "HIGH",
      defaultPath: "stop and classify existing worktree changes before migration planning",
      preserve: ["current uncommitted work", "existing project rules"],
      merge: [],
      replace: [],
      blocked: ["workflow asset writes", "governance replacement", "task execution"],
      humanConfirmation: "Confirm how to handle the current worktree before Codex prepares any apply plan.",
    });
  }

  if (rules.length === 0) {
    return nativeDecision({
      recommendation: nativePlans.length > 0 ? "BLOCKED_NEEDS_OWNER" : "READ_ONLY_DIAGNOSIS",
      migrationDepth: "READ_ONLY_DIAGNOSIS",
      confidence: "LOW",
      defaultPath: "record or generate native migration evidence before reconciliation",
      preserve: ["existing project rules"],
      merge: [],
      replace: [],
      blocked: ["native adoption apply plan"],
      humanConfirmation: "Allow Codex to generate native migration evidence in read-only mode first.",
    });
  }

  if (coverage.omittedRules > 0) {
    return nativeDecision({
      recommendation: "BLOCKED_NEEDS_OWNER",
      migrationDepth: "READ_ONLY_DIAGNOSIS",
      confidence: "HIGH",
      defaultPath: "review omitted extracted rules before selected native adoption",
      preserve: ["all omitted existing project rules", "existing release / production and protected constraints"],
      merge: [],
      replace: [],
      blocked: ["selected native adoption", "governance apply plan until omitted rules are reviewed"],
      humanConfirmation: "Confirm review of omitted extracted rules before Codex prepares any selected native adoption apply plan.",
    });
  }

  if (hasActionableUnknown) {
    return nativeDecision({
      recommendation: "BLOCKED_NEEDS_OWNER",
      migrationDepth: "DOCS_BRIDGE",
      confidence: "LOW",
      defaultPath: "classify unknown rule authority before selected native adoption",
      preserve: ["unknown-authority project rules", "business and production rules"],
      merge: hasEngineering ? ["engineering baseline"] : [],
      replace: [],
      blocked: ["governance replacement for unknown-authority rules"],
      humanConfirmation: "Confirm the owner for unknown-authority rules before Codex prepares an apply plan.",
    });
  }

  const recommendation = generatedState === "EXISTING_GOVERNED_PROJECT" && !hasRelease
    ? "DOCS_BRIDGE"
    : "SELECTED_NATIVE_ADOPTION";
  return nativeDecision({
    recommendation,
    migrationDepth: recommendation === "DOCS_BRIDGE" ? "DOCS_BRIDGE" : "DOCS_BRIDGE_THEN_SELECTED_ASSETS",
    confidence: hasRelease || hasEngineering || hasProtected ? "MEDIUM" : "LOW",
    defaultPath: "prepare apply plan after review",
    preserve: [
      ...(hasRelease ? ["release / rollback SOP", "production CI / hooks / guard scripts"] : []),
      ...(hasProtected ? ["business rules", "permissions / data / compliance controls"] : []),
    ],
    merge: hasEngineering ? ["engineering baseline", "environment baseline"] : ["project context docs"],
    replace: ["old AI workflow routing after approval"],
    blocked: ["production execution", "secrets", "CI/hook mutation without approval"],
    humanConfirmation: "Allow Codex to prepare a reviewable apply plan for the recommended migration path.",
  });
}

function isLowSignalGeneratedUnknown(rule) {
  const excerpt = String(rule.source_excerpt || "").trim();
  return /^No rule-like lines extracted from /i.test(excerpt)
    || /^[A-Za-z0-9_./-]+$/.test(excerpt);
}

function nativeDecision(input) {
  return {
    recommendation: input.recommendation,
    migrationDepth: input.migrationDepth,
    confidence: input.confidence,
    canCodexWriteNow: "No",
    defaultPath: input.defaultPath,
    preserve: input.preserve,
    merge: input.merge,
    replace: input.replace,
    blocked: input.blocked,
    humanConfirmation: input.humanConfirmation,
  };
}

function walkMarkdown(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files.sort();
}

function parseFencedJson(content) {
  const match = content.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function buildRuleReconciliationCoverage(rules) {
  const totalExtractedRules = rules.length;
  const reconciledRules = totalExtractedRules === 0 ? 0 : Math.min(totalExtractedRules, MAX_RECONCILED_RULES);
  const omittedRules = Math.max(0, totalExtractedRules - reconciledRules);
  return {
    totalExtractedRules,
    reconciledRules,
    omittedRules,
    truncationWarning: omittedRules > 0
      ? `Only first ${MAX_RECONCILED_RULES} extracted rules were reconciled; ${omittedRules} rule(s) were omitted.`
      : "None",
    blocksSelectedNativeAdoption: omittedRules > 0 ? "Yes" : "No",
  };
}

function buildReconciliationItems(rules) {
  if (rules.length === 0) {
    return [
      {
        itemId: "RR-001",
        existingRuleRef: "native-migration:missing",
        intentOsReferenceRef: "native-migration-plan",
        surface: "UNKNOWN_AUTHORITY",
        surfaceAuthority: "PROJECT_OWNED",
        allowedOutcomes: ["NEEDS_HUMAN_DECISION", "NO_EXISTING_RULE", "UNKNOWN_AUTHORITY"],
        outcome: "NEEDS_HUMAN_DECISION",
        reason: "No Native Migration rule classifications were found; reconciliation requires classified existing rules first.",
        riskSurfaces: ["workflow"],
        humanDecisionRequired: "Yes",
        requiresApplyChain: "Yes",
        canReplaceExistingRule: "No",
        targetAction: "prepare Native Migration Plan before reconciliation",
      },
    ];
  }

  return rules.slice(0, MAX_RECONCILED_RULES).map((rule, index) => {
    const itemId = `RR-${String(index + 1).padStart(3, "0")}`;
    const surface = surfaceForRule(rule);
    if (surface === "RELEASE_PRODUCTION" || surface === "PRODUCTION_CONTROL") {
      return item({
        itemId,
        rule,
        surface,
        intentOsReferenceRef: "release-recipe:project-specific",
        allowedOutcomes: ["KEEP_EXISTING", "GAP_SUGGESTION", "NEEDS_HUMAN_DECISION", "CONFLICT_HIGH_RISK", "UNKNOWN_AUTHORITY"],
        outcome: "KEEP_EXISTING",
        reason: "Existing release / production rules remain project-owned; IntentOS may only record gaps or conflicts.",
        riskSurfaces: ["release", "production"],
        targetAction: "keep existing SOP; map gaps through release guide or handoff after approval",
        surfaceAuthority: "HUMAN_OR_EXTERNAL",
      });
    }
    if (surface === "PROTECTED_CONSTRAINT") {
      return item({
        itemId,
        rule,
        surface,
        intentOsReferenceRef: "protected-constraint:project-owned",
        allowedOutcomes: ["KEEP_EXISTING", "NEEDS_HUMAN_DECISION", "CONFLICT_HIGH_RISK", "UNKNOWN_AUTHORITY"],
        outcome: "KEEP_EXISTING",
        reason: "Business, permission, security, privacy, compliance, data, finance, tax, legal, HR, payment, migration, and provider-state rules remain project-owned.",
        riskSurfaces: protectedRiskSurfaces(rule),
        targetAction: "keep existing protected constraint or ask owner before apply plan",
        surfaceAuthority: "PROJECT_OWNED",
      });
    }
    if (surface === "ENGINEERING_BASELINE") {
      const merge = /\b(enum|schema|api|test|contract|baseline|database|string|type)\b/i.test(rule.source_excerpt || "");
      return item({
        itemId,
        rule,
        surface,
        intentOsReferenceRef: "standard-baseline:engineering",
        allowedOutcomes: ["KEEP_EXISTING", "ADOPT_INTENTOS", "MERGE", "NEEDS_HUMAN_DECISION"],
        outcome: merge ? "MERGE" : "KEEP_EXISTING",
        reason: merge
          ? "Existing engineering rule can be preserved while IntentOS adds missing evidence wording."
          : "Existing engineering rule remains project-specific unless a reviewed gap is approved.",
        mergeReason: merge ? "Prepare reviewed wording that preserves the existing engineering rule and adds IntentOS evidence wording." : "",
        preservedExistingTerms: merge ? [rule.source_excerpt || "existing engineering rule"] : [],
        addedIntentosTerms: merge ? ["evidence wording", "apply-plan before writes"] : [],
        riskSurfaces: ["engineering"],
        targetAction: merge ? "prepare apply-plan after approval" : "keep existing engineering baseline",
        surfaceAuthority: "PROJECT_OWNED",
      });
    }
    return item({
      itemId,
      rule,
      surface: "UNKNOWN_AUTHORITY",
      intentOsReferenceRef: "native-migration:classification-review",
      allowedOutcomes: ["NEEDS_HUMAN_DECISION", "UNKNOWN_AUTHORITY"],
      outcome: "NEEDS_HUMAN_DECISION",
      reason: "Rule authority is unclear; owner must classify before reconciliation.",
      riskSurfaces: ["workflow"],
      targetAction: "ask human to classify authority before apply plan",
      surfaceAuthority: "PROJECT_OWNED",
    });
  });
}

function item(input) {
  return {
    itemId: input.itemId,
    existingRuleRef: `native-migration:${input.rule.rule_id || input.itemId}`,
    intentOsReferenceRef: input.intentOsReferenceRef || input.intentosReferenceRef,
    surface: input.surface,
    surfaceAuthority: input.surfaceAuthority,
    allowedOutcomes: input.allowedOutcomes,
    outcome: input.outcome,
    reason: input.reason,
    mergeReason: input.mergeReason || "",
    preservedExistingTerms: input.preservedExistingTerms || [],
    addedIntentosTerms: input.addedIntentosTerms || [],
    riskSurfaces: input.riskSurfaces,
    humanDecisionRequired: "Yes",
    requiresApplyChain: "Yes",
    canReplaceExistingRule: "No",
    targetAction: input.targetAction,
  };
}

function surfaceForRule(rule) {
  const source = `${rule.rule_class || ""} ${rule.source_excerpt || ""} ${rule.risk_surfaces || ""}`;
  if (rule.rule_class === "PRODUCTION_CONTROL" || /\b(release|rollback|deploy|production|incident|secret|provider|migration)\b|生产|上线|发布|回滚|事故|密钥|生产配置/i.test(source)) {
    return "RELEASE_PRODUCTION";
  }
  if (rule.rule_class === "BUSINESS_FACT"
    || rule.rule_class === "PROJECT_CONSTRAINT"
    || /\b(business|contract|invoice|tax|finance|payment|permission|privacy|security|compliance|customer|legal|HR|data|provider)\b|客户|合同|发票|税务|财务|权限|隐私|合规|数据/i.test(source)) {
    return "PROTECTED_CONSTRAINT";
  }
  if (rule.rule_class === "ENGINEERING_BASELINE") return "ENGINEERING_BASELINE";
  return "UNKNOWN_AUTHORITY";
}

function protectedRiskSurfaces(rule) {
  const text = `${rule.source_excerpt || ""} ${rule.risk_surfaces || ""}`.toLowerCase();
  const risks = [];
  for (const value of ["business", "data", "permission", "security", "privacy", "compliance", "payment", "finance", "tax", "legal", "hr", "migration", "provider"]) {
    if (text.includes(value)) risks.push(value);
  }
  return risks.length ? risks : ["protected"];
}

function buildProtectedConstraints(items) {
  return items
    .filter((item) => item.surface === "PROTECTED_CONSTRAINT")
    .map((item) => ({
      item_id: item.itemId,
      surface: item.riskSurfaces.join(", "),
      owner: "project owner",
      authority: "PROJECT_OWNED",
      human_decision_required: "Yes",
      handling: "keep existing or ask owner before apply plan",
    }));
}

function buildReleaseProductionGaps(items) {
  const hasRelease = items.some((item) => item.surface === "RELEASE_PRODUCTION");
  if (!hasRelease) return [];
  return [
    {
      item_id: "RPG-001",
      gap: "Confirm rollback, monitoring, owner, and post-release smoke evidence before release review.",
      outcome: "GAP_SUGGESTION",
      approval: "No",
    },
  ];
}

function buildConflicts(items) {
  return items
    .filter((item) => item.outcome === "NEEDS_HUMAN_DECISION" || item.outcome === "CONFLICT_HIGH_RISK")
    .map((item) => ({
      conflict_id: item.itemId.replace(/^RR-/, "C-"),
      item_id: item.itemId,
      decision_needed: item.reason,
      owner: "human",
      status: "Pending",
    }));
}

function referenceSetFor(items) {
  const refs = new Map();
  for (const item of items) {
    refs.set(item.intentOsReferenceRef, {
      referenceRef: item.intentOsReferenceRef,
      surface: item.surface,
      summary: referenceSummary(item),
      authority: "IntentOS reference only",
    });
  }
  return Array.from(refs.values());
}

function referenceSummary(item) {
  if (item.surface === "RELEASE_PRODUCTION") return "Release recipe / handoff expectation";
  if (item.surface === "ENGINEERING_BASELINE") return "Engineering baseline expectation";
  if (item.surface === "PROTECTED_CONSTRAINT") return "Project-owned protected constraint handling";
  return "Classification review expectation";
}

function structuredEvidenceFor(report) {
  return {
    schema_version: "1.69.2",
    evidence_profile: "existing-rule-reconciliation-1.69.2",
    artifact_type: "existing_rule_reconciliation_report",
    report_type: report.reportType,
    project_state: report.projectState,
    can_codex_write_now: report.canCodexWriteNow,
    can_recommend_apply_plan: report.canRecommendApplyPlan,
    can_recommend_apply_plan_now: report.canRecommendApplyPlanNow,
    can_recommend_apply_plan_after_human_review: report.canRecommendApplyPlanAfterHumanReview,
    reconciliation_authority: report.reconciliationAuthority,
    business_authority: report.businessAuthority,
    production_authority: report.productionAuthority,
    requires_human_approval_before_apply: report.requiresHumanApprovalBeforeApply,
    existing_rule_source: report.existingRuleSet.map((item) => ({
      rule_ref: item.ruleRef,
      surface: item.surface,
      summary: item.summary,
      authority: item.authority,
    })),
    intentos_reference_source: report.intentOsReferenceSet.map((item) => ({
      reference_ref: item.referenceRef,
      surface: item.surface,
      summary: item.summary,
      authority: item.authority,
    })),
    rule_reconciliation_coverage: {
      total_extracted_rules: report.ruleReconciliationCoverage.totalExtractedRules,
      reconciled_rules: report.ruleReconciliationCoverage.reconciledRules,
      omitted_rules: report.ruleReconciliationCoverage.omittedRules,
      truncation_warning: report.ruleReconciliationCoverage.truncationWarning,
      blocks_selected_native_adoption: report.ruleReconciliationCoverage.blocksSelectedNativeAdoption,
    },
    reconciliation_items: report.reconciliationItems.map((item) => ({
      item_id: item.itemId,
      existing_rule_ref: item.existingRuleRef,
      intentos_reference_ref: item.intentOsReferenceRef,
      surface: item.surface,
      surface_authority: item.surfaceAuthority,
      allowed_outcomes: item.allowedOutcomes,
      outcome: item.outcome,
      reason: item.reason,
      merge_reason: item.mergeReason,
      preserved_existing_terms: item.preservedExistingTerms,
      added_intentos_terms: item.addedIntentosTerms,
      risk_surfaces: item.riskSurfaces,
      human_decision_required: item.humanDecisionRequired,
      requires_apply_chain: item.requiresApplyChain,
      can_replace_existing_rule: item.canReplaceExistingRule,
      target_action: item.targetAction,
    })),
    protected_constraints: report.protectedConstraints,
    release_production_gaps: report.releaseProductionGaps,
    conflicts: report.conflicts,
    native_adoption_decision: {
      recommendation: report.nativeAdoptionDecision.recommendation,
      migration_depth: report.nativeAdoptionDecision.migrationDepth,
      confidence: report.nativeAdoptionDecision.confidence,
      can_codex_write_now: report.nativeAdoptionDecision.canCodexWriteNow,
      default_path: report.nativeAdoptionDecision.defaultPath,
      preserve: report.nativeAdoptionDecision.preserve,
      merge: report.nativeAdoptionDecision.merge,
      replace: report.nativeAdoptionDecision.replace,
      blocked: report.nativeAdoptionDecision.blocked,
      human_confirmation: report.nativeAdoptionDecision.humanConfirmation,
    },
    proposed_next_steps: report.proposedNextSteps,
    boundary: report.boundary,
    outcome: report.outcome,
  };
}

function printHuman(report) {
  console.log("# Existing Rule Reconciliation Report");
  console.log("");
  console.log("This is a recommendation report, not permission to change files.");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  printTable(["Field", "Value"], [
    ["Project State", code(report.projectState)],
    ["Can Codex write now", code(report.canCodexWriteNow)],
    ["Reconciliation Authority", code(report.reconciliationAuthority)],
    ["Business Authority", code(report.businessAuthority)],
    ["Production Authority", code(report.productionAuthority)],
    ["Approves Governance Replacement", code("No")],
    ["Approves Implementation", code("No")],
    ["Approves Release Or Production", code("No")],
    ["Requires Apply Plan Before File Change", code("Yes")],
    ["Recommended Next Step", "Review recommendations, then prepare a Unified Apply Plan only if approved."],
  ]);
  console.log("");
  console.log("## Input Evidence");
  console.log("");
  printTable(["Evidence", "Path", "Status"], report.inputEvidence.length
    ? report.inputEvidence.map((item) => [item.evidence, code(item.path), item.status])
    : [["Native Migration Plan", "not found", "prepare Native Migration Plan first"]]);
  console.log("");
  console.log("## Rule Reconciliation Coverage");
  console.log("");
  printTable(["Field", "Value"], [
    ["Total Extracted Rules", code(String(report.ruleReconciliationCoverage.totalExtractedRules))],
    ["Reconciled Rules", code(String(report.ruleReconciliationCoverage.reconciledRules))],
    ["Omitted Rules", code(String(report.ruleReconciliationCoverage.omittedRules))],
    ["Truncation Warning", report.ruleReconciliationCoverage.truncationWarning],
    ["Blocks Selected Native Adoption", code(report.ruleReconciliationCoverage.blocksSelectedNativeAdoption)],
  ]);
  console.log("");
  console.log("## Existing Rule Set");
  console.log("");
  printTable(["Rule Ref", "Surface", "Existing Rule Summary", "Authority"], report.existingRuleSet.map((item) => [code(item.ruleRef), code(item.surface), item.summary, item.authority]));
  console.log("");
  console.log("## IntentOS Reference Set");
  console.log("");
  printTable(["Reference Ref", "Surface", "Reference Summary", "Authority"], report.intentOsReferenceSet.map((item) => [code(item.referenceRef), code(item.surface), item.summary, item.authority]));
  console.log("");
  console.log("## Reconciliation Matrix");
  console.log("");
  printTable(["Item ID", "Surface", "Existing Rule Ref", "IntentOS Reference Ref", "Outcome", "Human Decision Required", "Target Action"], report.reconciliationItems.map((item) => [
    code(item.itemId),
    code(item.surface),
    code(item.existingRuleRef),
    code(item.intentOsReferenceRef),
    code(item.outcome),
    item.humanDecisionRequired,
    item.targetAction,
  ]));
  console.log("");
  console.log("## Engineering Baseline Recommendations");
  console.log("");
  printTable(["Item ID", "Recommendation", "Reason"], report.reconciliationItems.filter((item) => item.surface === "ENGINEERING_BASELINE").map((item) => [code(item.itemId), item.outcome, item.reason]));
  console.log("");
  console.log("## Release / Production Recommendations");
  console.log("");
  printTable(["Item ID", "Recommendation", "Reason"], report.reconciliationItems.filter((item) => item.surface === "RELEASE_PRODUCTION" || item.surface === "PRODUCTION_CONTROL").map((item) => [code(item.itemId), item.outcome, item.reason]));
  console.log("");
  console.log("## Protected Constraint Handling");
  console.log("");
  printTable(["Item ID", "Protected Surface", "Owner / Authority", "Handling"], report.protectedConstraints.map((item) => [code(item.item_id), item.surface, `${item.owner} / ${item.authority}`, item.handling]));
  console.log("");
  console.log("## Conflicts And Human Decisions");
  console.log("");
  printTable(["Conflict ID", "Decision Needed", "Owner", "Status"], report.conflicts.length
    ? report.conflicts.map((item) => [code(item.conflict_id), item.decision_needed, item.owner, item.status])
    : [["None", "No conflict recorded", "human", "N/A"]]);
  console.log("");
  console.log("## IntentOS Adoption Recommendation");
  console.log("");
  printTable(["Field", "Value"], [
    ["Recommendation", code(report.nativeAdoptionDecision.recommendation)],
    ["Migration Depth", code(report.nativeAdoptionDecision.migrationDepth)],
    ["Confidence", code(report.nativeAdoptionDecision.confidence)],
    ["Can Codex write now", code(report.nativeAdoptionDecision.canCodexWriteNow)],
    ["Default Path", report.nativeAdoptionDecision.defaultPath],
    ["Human Confirmation", report.nativeAdoptionDecision.humanConfirmation],
  ]);
  console.log("");
  printTable(["Decision Part", "Items"], [
    ["Preserve", report.nativeAdoptionDecision.preserve.join(", ") || "None"],
    ["Merge", report.nativeAdoptionDecision.merge.join(", ") || "None"],
    ["Replace After Approval", report.nativeAdoptionDecision.replace.join(", ") || "None"],
    ["Blocked", report.nativeAdoptionDecision.blocked.join(", ") || "None"],
  ]);
  console.log("");
  console.log("## False Positive / False Negative Notes");
  console.log("");
  printTable(["Type", "Note"], [["false_positive", "None recorded"], ["false_negative", "None recorded"]]);
  console.log("");
  console.log("## Proposed Next Step");
  console.log("");
  console.log("```text");
  for (const step of report.proposedNextSteps) console.log(step);
  console.log("```");
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This report writes target files: No");
  console.log("- This report authorizes target-file writes: No");
  console.log("- This report approves governance replacement: No");
  console.log("- This report approves implementation: No");
  console.log("- This report approves release or production: No");
  console.log("- This report modifies CI or hooks: No");
  console.log("- This report changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.structuredEvidence, null, 2));
  console.log("```");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printTable(headers, rows) {
  const safeRows = rows.length ? rows : [["None", "None", "None", "None"].slice(0, headers.length)];
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of safeRows) {
    const cells = headers.map((_, index) => escapeCell(row[index] ?? ""));
    console.log(`| ${cells.join(" | ")} |`);
  }
}

function escapeCell(value) {
  return String(value).replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

function code(value) {
  return `\`${String(value).replace(/`/g, "")}\``;
}
