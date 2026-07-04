#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/existing-rule-reconciliation.md",
  "docs/existing-rule-reconciliation.md",
  "templates/existing-rule-reconciliation-report.md",
  "schemas/artifacts/existing-rule-reconciliation.schema.json",
  "checklists/existing-rule-reconciliation-review.md",
  "prompts/existing-rule-reconciliation-agent.md",
  "scripts/resolve-existing-rule-reconciliation.mjs",
  "scripts/check-existing-rule-reconciliation.mjs",
];
const requiredDirectories = ["existing-rule-reconciliations"];
const requiredSections = [
  "Human Summary",
  "Input Evidence",
  "Rule Reconciliation Coverage",
  "Existing Rule Set",
  "IntentOS Reference Set",
  "Reconciliation Matrix",
  "Engineering Baseline Recommendations",
  "Release / Production Recommendations",
  "Protected Constraint Handling",
  "Conflicts And Human Decisions",
  "False Positive / False Negative Notes",
  "Proposed Next Step",
  "Boundaries",
  "Outcome",
];
const requiredStructuredSections = ["Machine-Readable Evidence"];
const generalOutcomes = new Set([
  "KEEP_EXISTING",
  "ADOPT_INTENTOS",
  "MERGE",
  "NEEDS_HUMAN_DECISION",
  "NO_INTENTOS_MATCH",
  "NO_EXISTING_RULE",
  "CONFLICT_HIGH_RISK",
  "UNKNOWN_AUTHORITY",
  "GAP_SUGGESTION",
]);
const releaseOutcomes = new Set(["KEEP_EXISTING", "GAP_SUGGESTION", "NEEDS_HUMAN_DECISION", "CONFLICT_HIGH_RISK", "UNKNOWN_AUTHORITY"]);
const nativeRecommendations = new Set([
  "READ_ONLY_DIAGNOSIS",
  "DOCS_BRIDGE",
  "SELECTED_NATIVE_ADOPTION",
  "BLOCKED_NEEDS_OWNER",
  "BLOCKED_BY_DIRTY_WORKTREE",
]);
const protectedTerms = /\b(business|contract|invoice|tax|finance|payment|permission|privacy|security|compliance|customer|legal|HR|data|provider|migration)\b|客户|合同|发票|税务|财务|权限|隐私|合规|数据/i;
const forbiddenClaims = [
  /\bsafe to apply\b/i,
  /\brules reconciled[, ]+safe\b/i,
  /\bapproves governance replacement\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves implementation\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves release or production\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves release\b(?!\s+or production)(?!\s*(?:\||:)\s*`?No`?)/i,
  /\bapproves production\b(?!\s*(?:\||:)\s*`?No`?)/i,
  /\breplaces? release SOP\b/i,
  /\bIntentOS wins\b/i,
  /\bwrite target files\b(?!:\s*No)/i,
  /\bdeploy(ed|s)? production\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Existing Rule Reconciliation Check");
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
checkReports();

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/existing-rule-reconciliation.md"),
    readResolved("docs/existing-rule-reconciliation.md"),
    readResolved("templates/existing-rule-reconciliation-report.md"),
    readResolved("schemas/artifacts/existing-rule-reconciliation.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Existing Rule Reconciliation",
    "recommendation report, not permission to change files",
    "RECOMMENDATION_ONLY",
    "PROJECT_OWNED",
    "HUMAN_OR_EXTERNAL_SYSTEM",
    "ADOPT_INTENTOS",
    "GAP_SUGGESTION",
    "MERGE means",
    "release / production surfaces cannot use",
    "existing_rule_reconciliation_report",
  ]) {
    if (combined.includes(marker)) pass(`rule reconciliation docs include ${marker}`);
    else fail(`rule reconciliation docs missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("existing-rule-reconciliations");
  if (files.length === 0) {
    pass("existing rule reconciliation check skipped: no reports");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    if (!content.includes("This is a recommendation report, not permission to change files.")) {
      fail(`${label} must state recommendation-not-permission boundary`);
    } else {
      pass(`${label} states recommendation-not-permission boundary`);
    }
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden reconciliation claim: ${pattern.source}`);
    }
    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) {
      for (const section of requiredStructuredSections) requireSection(content, section, label);
    }

    const summary = sectionBody(content, "Human Summary") || "";
    checkSummary(summary, label);
    checkBoundaries(content, label);
    checkProposedNextStep(content, label);
    const evidence = checkStructuredEvidence(content, label);
    checkReconciliationMatrix(content, label, evidence);
    checkProtectedConstraintSection(content, label, evidence);
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (["RECONCILIATION_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"].includes(outcome)) {
      pass(`${label} has valid Outcome`);
    } else {
      fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
    }
  }
}

function checkSummary(summary, label) {
  const expected = [
    ["Can Codex write now", "No"],
    ["Reconciliation Authority", "RECOMMENDATION_ONLY"],
    ["Business Authority", "PROJECT_OWNED"],
    ["Production Authority", "HUMAN_OR_EXTERNAL_SYSTEM"],
    ["Approves Governance Replacement", "No"],
    ["Approves Implementation", "No"],
    ["Approves Release Or Production", "No"],
    ["Requires Apply Plan Before File Change", "Yes"],
  ];
  for (const [field, value] of expected) {
    const actual = tableValue(summary, field);
    if (actual === value) pass(`${label} summary ${field} is ${value}`);
    else fail(`${label} summary ${field} must be ${value}`);
  }
}

function checkReconciliationMatrix(content, label, evidence) {
  const body = sectionBody(content, "Reconciliation Matrix") || "";
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include reconciliation matrix rows`);
    return;
  }
  const evidenceById = new Map((evidence?.reconciliation_items || []).map((item) => [item.item_id, item]));
  for (const row of rows) {
    const itemId = stripMarkdown(row[0] || "");
    const surface = stripMarkdown(row[1] || "");
    const existingRef = stripMarkdown(row[2] || "");
    const intentosRef = stripMarkdown(row[3] || "");
    const outcome = stripMarkdown(row[4] || "");
    const humanDecision = stripMarkdown(row[5] || "");
    const targetAction = stripMarkdown(row[6] || "");
    const rowLabel = `${label} ${itemId || "item"}`;
    if (itemId) pass(`${rowLabel} records item id`);
    else fail(`${rowLabel} missing item id`);
    if (surface) pass(`${rowLabel} records surface`);
    else fail(`${rowLabel} missing surface`);
    if (existingRef) pass(`${rowLabel} records existing rule ref`);
    else fail(`${rowLabel} missing existing rule ref`);
    if (intentosRef) pass(`${rowLabel} records IntentOS reference ref`);
    else fail(`${rowLabel} missing IntentOS reference ref`);
    if (generalOutcomes.has(outcome)) pass(`${rowLabel} has valid outcome`);
    else fail(`${rowLabel} invalid outcome: ${outcome || "<empty>"}`);
    if (humanDecision === "Yes") pass(`${rowLabel} requires human decision`);
    else fail(`${rowLabel} must require human decision`);
    if (/apply-plan after (approval|human review)|Native Migration Plan before reconciliation|ask human/i.test(targetAction)) {
      pass(`${rowLabel} target action stays plan-bound`);
    } else {
      fail(`${rowLabel} target action must stay plan-bound`);
    }
    if ((surface === "RELEASE_PRODUCTION" || surface === "PRODUCTION_CONTROL") && !releaseOutcomes.has(outcome)) {
      fail(`${rowLabel} release / production outcome cannot be ${outcome}`);
    }
    if ((surface === "RELEASE_PRODUCTION" || surface === "PRODUCTION_CONTROL") && /ADOPT_INTENTOS|MERGE/.test(outcome)) {
      fail(`${rowLabel} release / production cannot adopt or merge IntentOS`);
    }
    if (outcome === "ADOPT_INTENTOS" && surface !== "ENGINEERING_BASELINE") {
      fail(`${rowLabel} ADOPT_INTENTOS is only allowed for engineering baseline gaps`);
    }
    if (outcome === "ADOPT_INTENTOS" && protectedTerms.test(`${surface} ${targetAction}`)) {
      fail(`${rowLabel} ADOPT_INTENTOS must not apply to protected surfaces`);
    }
    if (outcome === "GAP_SUGGESTION" && /\b(approve|approved|release approval|deploy)\b/i.test(targetAction)) {
      fail(`${rowLabel} GAP_SUGGESTION must not imply approval`);
    }
    if (evidence && requireStructuredEvidence) {
      const structured = evidenceById.get(itemId);
      if (!structured) {
        fail(`${rowLabel} missing structured reconciliation item`);
      } else {
        compareField(rowLabel, "surface", surface, structured.surface);
        compareField(rowLabel, "existing_rule_ref", existingRef, structured.existing_rule_ref);
        compareField(rowLabel, "intentos_reference_ref", intentosRef, structured.intentos_reference_ref);
        compareField(rowLabel, "outcome", outcome, structured.outcome);
        compareField(rowLabel, "human_decision_required", humanDecision, structured.human_decision_required);
        compareField(rowLabel, "target_action", targetAction, structured.target_action);
      }
    }
  }
}

function checkStructuredEvidence(content, label) {
  const body = sectionBody(content, "Machine-Readable Evidence", { fallback: "" }) || "";
  if (!body.trim()) {
    if (requireStructuredEvidence) fail(`${label} must include Machine-Readable Evidence in strict mode`);
    return null;
  }
  const jsonText = fencedJson(body);
  if (!jsonText) {
    fail(`${label} Machine-Readable Evidence must contain a fenced json block`);
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
    pass(`${label} Machine-Readable Evidence parses as JSON`);
  } catch (error) {
    fail(`${label} Machine-Readable Evidence JSON invalid: ${error.message}`);
    return null;
  }
  const required = [
    "schema_version",
    "artifact_type",
    "report_type",
    "project_state",
    "can_codex_write_now",
    "can_recommend_apply_plan",
    "can_recommend_apply_plan_now",
    "can_recommend_apply_plan_after_human_review",
    "reconciliation_authority",
    "business_authority",
    "production_authority",
    "requires_human_approval_before_apply",
    "existing_rule_source",
    "intentos_reference_source",
    "rule_reconciliation_coverage",
    "reconciliation_items",
    "protected_constraints",
    "release_production_gaps",
    "conflicts",
    "native_adoption_decision",
    "proposed_next_steps",
    "boundary",
    "outcome",
  ];
  for (const field of required) {
    if (Object.prototype.hasOwnProperty.call(parsed, field)) pass(`${label} structured evidence includes ${field}`);
    else fail(`${label} structured evidence missing ${field}`);
  }
  if (parsed.schema_version === "1.66.0") pass(`${label} structured evidence schema version is 1.66.0`);
  else fail(`${label} structured evidence schema version must be 1.66.0`);
  if (parsed.artifact_type === "existing_rule_reconciliation_report") pass(`${label} structured artifact type is valid`);
  else fail(`${label} structured artifact type invalid`);
  if (parsed.report_type === "EXISTING_RULE_RECONCILIATION") pass(`${label} structured report type is valid`);
  else fail(`${label} structured report type invalid`);
  if (parsed.can_codex_write_now === "No") pass(`${label} structured write authority is off`);
  else fail(`${label} structured can_codex_write_now must be No`);
  const nativeDecision = parsed.native_adoption_decision || {};
  const blockedNativeDecision = String(nativeDecision.recommendation || "").startsWith("BLOCKED");
  const expectedApplyPlan = blockedNativeDecision ? "NoUntilBlockResolved" : "Yes";
  if (parsed.can_recommend_apply_plan === expectedApplyPlan) pass(`${label} structured can_recommend_apply_plan is ${expectedApplyPlan}`);
  else fail(`${label} structured can_recommend_apply_plan must be ${expectedApplyPlan}`);
  if (parsed.can_recommend_apply_plan_now === (blockedNativeDecision ? "No" : "Yes")) pass(`${label} structured can_recommend_apply_plan_now is bounded`);
  else fail(`${label} structured can_recommend_apply_plan_now does not match native adoption decision`);
  if (parsed.can_recommend_apply_plan_after_human_review === "Yes") pass(`${label} structured can_recommend_apply_plan_after_human_review is Yes`);
  else fail(`${label} structured can_recommend_apply_plan_after_human_review must be Yes`);
  if (parsed.reconciliation_authority === "RECOMMENDATION_ONLY") pass(`${label} structured reconciliation authority is recommendation-only`);
  else fail(`${label} structured reconciliation authority must be RECOMMENDATION_ONLY`);
  if (parsed.business_authority === "PROJECT_OWNED") pass(`${label} structured business authority is project-owned`);
  else fail(`${label} structured business authority must be PROJECT_OWNED`);
  if (parsed.production_authority === "HUMAN_OR_EXTERNAL_SYSTEM") pass(`${label} structured production authority is human/external`);
  else fail(`${label} structured production authority must be HUMAN_OR_EXTERNAL_SYSTEM`);
  if (parsed.requires_human_approval_before_apply === "Yes") pass(`${label} structured approval required before apply`);
  else fail(`${label} structured approval before apply must be Yes`);
  if (!Array.isArray(parsed.reconciliation_items) || parsed.reconciliation_items.length === 0) {
    fail(`${label} structured evidence must include reconciliation items`);
  } else {
    for (const item of parsed.reconciliation_items) validateStructuredItem(item, label);
  }
  validateRuleReconciliationCoverage(parsed.rule_reconciliation_coverage, label, parsed);
  if (Array.isArray(parsed.protected_constraints)) {
    for (const item of parsed.protected_constraints) validateProtectedConstraint(item, label);
  } else {
    fail(`${label} structured protected_constraints must be an array`);
  }
  if (Array.isArray(parsed.release_production_gaps)) {
    for (const gap of parsed.release_production_gaps) {
      if (String(gap.approval || "No") === "No") pass(`${label} release production gap stays non-approving`);
      else fail(`${label} release production gap must not approve release`);
    }
  }
  if (Array.isArray(parsed.proposed_next_steps)) {
    const next = parsed.proposed_next_steps.join(" ");
    for (const marker of ["Unified Apply Plan", "Controlled Apply Readiness", "Approval Record"]) {
      if (next.includes(marker)) pass(`${label} proposed next steps include ${marker}`);
      else fail(`${label} proposed next steps missing ${marker}`);
    }
  }
  const boundary = parsed.boundary || {};
  for (const field of ["writesTargetFiles", "authorizesTargetFileWrites", "approvesGovernanceReplacement", "approvesImplementation", "approvesReleaseOrProduction", "modifiesCiOrHooks"]) {
    if (boundary[field] === "No") pass(`${label} boundary ${field} is No`);
    else fail(`${label} boundary ${field} must be No`);
  }
  validateNativeAdoptionDecision(parsed.native_adoption_decision, label, parsed);
  return parsed;
}

function validateRuleReconciliationCoverage(coverage, label, evidence) {
  if (!coverage || typeof coverage !== "object") {
    fail(`${label} structured evidence missing rule_reconciliation_coverage`);
    return;
  }
  for (const field of ["total_extracted_rules", "reconciled_rules", "omitted_rules"]) {
    if (Number.isInteger(coverage[field]) && coverage[field] >= 0) pass(`${label} rule reconciliation coverage includes ${field}`);
    else fail(`${label} rule reconciliation coverage ${field} must be a non-negative integer`);
  }
  const total = coverage.total_extracted_rules;
  const reconciled = coverage.reconciled_rules;
  const omitted = coverage.omitted_rules;
  if (Number.isInteger(total) && Number.isInteger(reconciled) && Number.isInteger(omitted) && total - reconciled === omitted) {
    pass(`${label} rule reconciliation coverage counts reconcile`);
  } else {
    fail(`${label} rule reconciliation coverage counts must satisfy total - reconciled = omitted`);
  }
  if (omitted > 0) {
    if (coverage.blocks_selected_native_adoption === "Yes") pass(`${label} truncated coverage blocks selected native adoption`);
    else fail(`${label} truncated coverage must block selected native adoption`);
    if (/Only first .* extracted rules were reconciled/i.test(String(coverage.truncation_warning || ""))) {
      pass(`${label} truncated coverage includes explicit warning`);
    } else {
      fail(`${label} truncated coverage must include explicit warning`);
    }
    if (evidence.native_adoption_decision?.recommendation === "SELECTED_NATIVE_ADOPTION") {
      fail(`${label} selected native adoption is not allowed with omitted rules`);
    } else {
      pass(`${label} selected native adoption is blocked when rules are omitted`);
    }
    if (evidence.outcome === "BLOCKED") pass(`${label} truncated coverage blocks reconciliation outcome`);
    else fail(`${label} truncated coverage must set outcome to BLOCKED`);
  } else {
    if (coverage.blocks_selected_native_adoption === "No") pass(`${label} full coverage does not block selected native adoption`);
    else fail(`${label} full coverage must not set selected native adoption block`);
  }
}

function validateNativeAdoptionDecision(decision, label, evidence) {
  if (!decision || typeof decision !== "object") {
    fail(`${label} structured evidence missing native_adoption_decision`);
    return;
  }
  for (const field of [
    "recommendation",
    "migration_depth",
    "confidence",
    "can_codex_write_now",
    "default_path",
    "preserve",
    "merge",
    "replace",
    "blocked",
    "human_confirmation",
  ]) {
    if (Array.isArray(decision[field]) ? decision[field].length >= 0 : isConcrete(decision[field])) {
      pass(`${label} native adoption decision includes ${field}`);
    } else {
      fail(`${label} native adoption decision missing ${field}`);
    }
  }
  if (nativeRecommendations.has(decision.recommendation)) pass(`${label} native adoption recommendation is allowed`);
  else fail(`${label} native adoption recommendation invalid: ${decision.recommendation || "<empty>"}`);
  if (["LOW", "MEDIUM", "HIGH"].includes(decision.confidence)) pass(`${label} native adoption confidence is allowed`);
  else fail(`${label} native adoption confidence invalid`);
  if (decision.can_codex_write_now === "No") pass(`${label} native adoption decision keeps write authority off`);
  else fail(`${label} native adoption decision can_codex_write_now must be No`);
  if (String(decision.recommendation || "").startsWith("BLOCKED") && evidence.can_recommend_apply_plan_now !== "No") {
    fail(`${label} blocked native adoption decision must not recommend apply plan now`);
  }
  if (decision.recommendation === "SELECTED_NATIVE_ADOPTION"
    && evidence.rule_reconciliation_coverage?.blocks_selected_native_adoption === "Yes") {
    fail(`${label} selected native adoption cannot override coverage block`);
  }
  const authorityText = `${decision.default_path || ""} ${decision.human_confirmation || ""}`;
  if (/\b(auto[- ]?apply|write target files now|approve release|approve production|deploy production|commit now|push now)\b/i.test(authorityText)) {
    fail(`${label} native adoption decision must not imply apply, commit, push, release, or production approval`);
  } else {
    pass(`${label} native adoption decision does not imply execution approval`);
  }
}

function validateStructuredItem(item, label) {
  const rowLabel = `${label} structured item ${item?.item_id || "item"}`;
  for (const field of [
    "item_id",
    "existing_rule_ref",
    "intentos_reference_ref",
    "surface",
    "surface_authority",
    "allowed_outcomes",
    "outcome",
    "reason",
    "risk_surfaces",
    "human_decision_required",
    "requires_apply_chain",
    "can_replace_existing_rule",
    "target_action",
  ]) {
    if (Array.isArray(item?.[field]) ? item[field].length >= 0 : isConcrete(item?.[field])) pass(`${rowLabel} includes ${field}`);
    else fail(`${rowLabel} missing ${field}`);
  }
  if (generalOutcomes.has(item?.outcome)) pass(`${rowLabel} has allowed outcome`);
  else fail(`${rowLabel} invalid outcome ${item?.outcome || "<empty>"}`);
  if ((item?.surface === "RELEASE_PRODUCTION" || item?.surface === "PRODUCTION_CONTROL") && !releaseOutcomes.has(item?.outcome)) {
    fail(`${rowLabel} release / production outcome cannot be ${item?.outcome}`);
  }
  if ((item?.surface === "RELEASE_PRODUCTION" || item?.surface === "PRODUCTION_CONTROL") && ["ADOPT_INTENTOS", "MERGE"].includes(item?.outcome)) {
    fail(`${rowLabel} release / production cannot adopt or merge IntentOS`);
  }
  if (item?.outcome === "ADOPT_INTENTOS" && item?.surface !== "ENGINEERING_BASELINE") {
    fail(`${rowLabel} ADOPT_INTENTOS is only allowed for engineering baseline gaps`);
  }
  if (item?.outcome === "ADOPT_INTENTOS" && hasProtectedRisk(item)) {
    fail(`${rowLabel} ADOPT_INTENTOS must not apply to protected surfaces`);
  }
  if (item?.outcome === "MERGE") {
    for (const field of ["merge_reason", "preserved_existing_terms", "added_intentos_terms"]) {
      const value = item?.[field];
      if (Array.isArray(value) ? value.length > 0 : isConcrete(value)) pass(`${rowLabel} MERGE includes ${field}`);
      else fail(`${rowLabel} MERGE missing ${field}`);
    }
    if (item?.human_decision_required === "Yes" && item?.requires_apply_chain === "Yes" && /prepare apply-plan after approval/i.test(item?.target_action || "")) {
      pass(`${rowLabel} MERGE remains future apply-plan wording`);
    } else {
      fail(`${rowLabel} MERGE must remain future apply-plan wording`);
    }
  }
  if (item?.human_decision_required === "Yes") pass(`${rowLabel} requires human decision`);
  else fail(`${rowLabel} must require human decision`);
  if (item?.requires_apply_chain === "Yes") pass(`${rowLabel} requires apply chain`);
  else fail(`${rowLabel} must require apply chain`);
  if (item?.can_replace_existing_rule === "No") pass(`${rowLabel} cannot replace existing rule`);
  else fail(`${rowLabel} must not replace existing rule`);
  if (item?.outcome === "GAP_SUGGESTION" && /\b(approve|approval|deploy|release now)\b/i.test(item?.target_action || "")) {
    fail(`${rowLabel} GAP_SUGGESTION must not imply approval`);
  }
}

function validateProtectedConstraint(item, label) {
  const rowLabel = `${label} protected constraint ${item?.item_id || "item"}`;
  for (const field of ["item_id", "surface", "owner", "authority", "human_decision_required", "handling"]) {
    if (isConcrete(item?.[field])) pass(`${rowLabel} includes ${field}`);
    else fail(`${rowLabel} missing ${field}`);
  }
  if (item?.human_decision_required === "Yes") pass(`${rowLabel} requires human decision`);
  else fail(`${rowLabel} must require human decision`);
}

function checkProtectedConstraintSection(content, label, evidence) {
  const body = sectionBody(content, "Protected Constraint Handling") || "";
  if (!body.trim()) {
    fail(`${label} missing protected constraint handling`);
    return;
  }
  if ((evidence?.protected_constraints || []).length > 0 && !/project owner|PROJECT_OWNED|human/i.test(body)) {
    fail(`${label} protected constraints must name owner / authority / human decision`);
  } else {
    pass(`${label} protected constraint section is bounded`);
  }
}

function checkProposedNextStep(content, label) {
  const body = sectionBody(content, "Proposed Next Step") || "";
  for (const marker of ["Unified Apply Plan", "Controlled Apply Readiness", "Approval Record"]) {
    if (body.includes(marker)) pass(`${label} proposed next step includes ${marker}`);
    else fail(`${label} proposed next step missing ${marker}`);
  }
}

function checkBoundaries(content, label) {
  const body = sectionBody(content, "Boundaries") || "";
  const expected = [
    "This report writes target files: No",
    "This report authorizes target-file writes: No",
    "This report approves governance replacement: No",
    "This report approves implementation: No",
    "This report approves release or production: No",
    "This report modifies CI or hooks: No",
  ];
  for (const marker of expected) {
    if (body.includes(marker)) pass(`${label} boundary ${marker}`);
    else fail(`${label} missing boundary ${marker}`);
  }
}

function hasProtectedRisk(item) {
  const text = [
    item?.surface,
    item?.risk_surfaces?.join?.(" "),
    item?.reason,
    item?.target_action,
  ].join(" ");
  return protectedTerms.test(text);
}

function requireSection(content, section, label) {
  if (sectionBody(content, section, { fallback: null }) !== null) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function tableRows(body) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .map(splitMarkdownRow)
    .filter((row) => row.length > 0)
    .filter((row) => !/^field$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^evidence$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^rule ref$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^reference ref$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^item id$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^conflict id$/i.test(stripMarkdown(row[0] || "")))
    .filter((row) => !/^type$/i.test(stripMarkdown(row[0] || "")));
}

function tableValue(body, field) {
  for (const row of tableRows(body)) {
    if (stripMarkdown(row[0]) === field) return stripMarkdown(row[1] || "");
  }
  return "";
}

function fencedJson(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() || "";
}

function compareField(label, field, markdownValue, structuredValue) {
  const md = normalize(markdownValue);
  const json = normalize(structuredValue);
  if (md === json) pass(`${label} Markdown/JSON ${field} matches`);
  else fail(`${label} Markdown/JSON ${field} mismatch: markdown=${md || "<empty>"} json=${json || "<empty>"}`);
}

function normalize(value) {
  return stripMarkdown(String(value || "")).replace(/\s+/g, " ").trim();
}

function codeOrTextValue(body) {
  const text = stripMarkdown(String(body || "").trim());
  const first = text.split(/\r?\n/).map(stripMarkdown).find(Boolean);
  return first || "";
}

function markdownFiles(dir) {
  const base = path.join(projectRoot, dir);
  if (!fs.existsSync(base)) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  return path.relative(projectRoot, resolved) || relativePath;
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function isConcrete(value) {
  const text = String(value ?? "").trim();
  return text.length > 0 && !/^N\/A$/i.test(text) && !/^TBD$/i.test(text) && !/^TODO$/i.test(text);
}

function pass(message) {
  checks.push({ status: "PASS", message });
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    for (const check of checks) console.log(`${check.status} ${check.message}`);
    console.log("");
    if (failed) console.log("Existing Rule Reconciliation check failed.");
    else console.log("Existing Rule Reconciliation check passed.");
  }
  process.exit(failed ? 1 : 0);
}
