#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
  "core/native-first-existing-project-migration.md",
  "docs/native-first-existing-project-migration.md",
  "templates/native-migration-plan.md",
  "checklists/native-migration-review.md",
  "prompts/native-migration-agent.md",
  "scripts/resolve-native-migration.mjs",
  "scripts/check-native-migration.mjs",
];
const requiredDirectories = ["native-migration-plans"];
const requiredSections = [
  "Human Summary",
  "Existing Governance Inventory",
  "Extracted Rule Classification",
  "Conflicts And Decisions",
  "Proposed Native Migration Plan",
  "Proposed AGENTS.md Handling",
  "Preserve / Replace / Archive Suggestions",
  "Restore Plan",
  "Authority Transition",
  "Apply Chain",
  "Human Decisions Needed",
  "Boundaries",
  "Outcome",
];
const allowedPostures = new Set([
  "FULL_MANAGED_INTENTOS_NATIVE",
  "NATIVE_FIRST_MIGRATION",
  "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW",
  "PRODUCTION_SAFE_NATIVE_OVERLAY",
  "NATIVE_FIRST_PENDING_WORKTREE_REVIEW",
  "BLOCKED_NEEDS_OWNER",
  "ADAPTER_ONLY_RECOMMENDED",
]);
const allowedWorkflowAuthority = new Set(["ACTIVE_FOR_PLANNING", "PENDING_APPROVAL", "BLOCKED"]);
const allowedWriteAuthority = new Set(["NO_WRITE", "PLAN_REQUIRED", "APPROVAL_REQUIRED"]);
const allowedOutcomes = new Set(["NATIVE_MIGRATION_PLAN_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const allowedRuleClasses = new Set([
  "BUSINESS_FACT",
  "PROJECT_CONSTRAINT",
  "PRODUCTION_CONTROL",
  "ENGINEERING_BASELINE",
  "WORKFLOW_RULE",
  "HISTORICAL_NOTE",
  "UNKNOWN_AUTHORITY",
]);
const allowedConfidence = new Set(["HIGH", "MEDIUM", "LOW"]);
const allowedSchemaVersions = new Set(["1.63.0", "1.64.0", "1.65.0"]);
const forbiddenClaims = [
  /\bfully migrated\b/i,
  /\balready fully migrated\b/i,
  /\bequal authority\b/i,
  /\boverwrote AGENTS\.md\b/i,
  /\bdirectly rewrites? AGENTS\.md\b/i,
  /\bremoves? business constraint\b/i,
  /\bdrops? business rule\b/i,
  /\bremoves? production constraint\b/i,
  /\bchanges? production config\b(?!, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior:\s*No)/i,
  /\bmodifies? CI\b(?! or hooks:\s*No)/i,
  /\binstalls? hooks?\b/i,
  /\bapproves implementation\b(?!:\s*No)/i,
  /\bapproves release\b(?! or production:\s*No)/i,
  /\bapproves production\b(?!:\s*No)/i,
  /\bsecret=.*[A-Za-z0-9]/i,
  /\bTOKEN=.*[A-Za-z0-9]/i,
  /\bPASSWORD=.*[A-Za-z0-9]/i,
];
const broadPathPattern = /(`|\s|\|)(\.|\/|repo root|repository root|docs\/\*\*|docs\/|\*\*|all workflow files|all files)(`|\s|\|)/i;

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Native Migration Check");
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
checkNativeMigrationPlans();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.62 native migration evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/native-first-existing-project-migration.md"),
    readResolved("docs/native-first-existing-project-migration.md"),
    readResolved("templates/native-migration-plan.md"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Native-First Existing Project Migration",
    "Native-First Migration Planning mode",
    "IntentOS may become the workflow authority",
    "IntentOS must not become the business",
    "intentOsWorkflowAuthority",
    "targetFileWriteAuthority",
    "businessAuthority",
    "productionAuthority",
    "Unified Apply Plan",
    "Controlled Apply Readiness",
    "Approval Record",
    "This plan writes target files: No",
  ]) {
    if (combined.includes(marker)) pass(`native migration docs include ${marker}`);
    else fail(`native migration docs missing ${marker}`);
  }
}

function checkNativeMigrationPlans() {
  const files = markdownFiles("native-migration-plans");
  if (files.length === 0) {
    pass("native migration check skipped: no native migration plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden native migration claim: ${pattern.source}`);
    }
    if (!content.includes("I have switched to IntentOS Native-First Migration Planning mode.")) {
      fail(`${label} must start by switching into Native-First Migration Planning mode`);
    } else {
      pass(`${label} includes Native-First mode statement`);
    }

    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) {
      for (const section of ["Rule Extraction Coverage", "Machine-Readable Evidence"]) requireSection(content, section, label);
    }

    const summary = sectionBody(content, "Human Summary") || "";
    const posture = tableValue(summary, "Recommended Posture");
    const canWrite = tableValue(summary, "Can Codex write now");
    const workflowAuthority = tableValue(summary, "IntentOS Workflow Authority");
    const writeAuthority = tableValue(summary, "Target File Write Authority");
    const businessAuthority = tableValue(summary, "Business Authority");
    const productionAuthority = tableValue(summary, "Production Authority");
    const approvalBeforeApply = tableValue(summary, "Requires Human Approval Before Apply");

    if (allowedPostures.has(posture)) pass(`${label} has valid posture`);
    else fail(`${label} has invalid posture: ${posture || "<empty>"}`);
    if (canWrite === "No") pass(`${label} keeps Codex write authority off`);
    else fail(`${label} must say Can Codex write now is No`);
    if (allowedWorkflowAuthority.has(workflowAuthority)) pass(`${label} has valid IntentOS workflow authority`);
    else fail(`${label} has invalid IntentOS workflow authority: ${workflowAuthority || "<empty>"}`);
    if (allowedWriteAuthority.has(writeAuthority)) pass(`${label} has valid target-file write authority`);
    else fail(`${label} has invalid target-file write authority: ${writeAuthority || "<empty>"}`);
    if (businessAuthority === "PROJECT_OWNED") pass(`${label} keeps business authority project-owned`);
    else fail(`${label} must keep Business Authority PROJECT_OWNED`);
    if (productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM") pass(`${label} keeps production authority human/external`);
    else fail(`${label} must keep Production Authority HUMAN_OR_EXTERNAL_SYSTEM`);
    if (approvalBeforeApply === "Yes") pass(`${label} requires human approval before apply`);
    else fail(`${label} must require human approval before apply`);

    const structuredEvidence = checkStructuredEvidence(content, label, {
      posture,
      canWrite,
      workflowAuthority,
      writeAuthority,
      businessAuthority,
      productionAuthority,
      approvalBeforeApply,
    });

    checkRuleExtractionCoverage(content, label, structuredEvidence);
    checkRuleClassification(content, label, structuredEvidence);
    checkProposedActions(content, label, structuredEvidence);
    checkAgentsHandling(content, label);
    checkRestorePlan(content, label);
    checkAuthorityTransition(content, label);
    checkApplyChain(content, label);
    checkBoundaries(content, label);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkRuleExtractionCoverage(content, label, structuredEvidence) {
  const body = sectionBody(content, "Rule Extraction Coverage", { fallback: "" }) || "";
  if (!body.trim()) {
    if (requireStructuredEvidence) fail(`${label} must include Rule Extraction Coverage in strict mode`);
    return;
  }
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include rule extraction coverage rows`);
    return;
  }
  for (const row of rows) {
    const cells = row.map(stripMarkdown);
    const [sourceFile, linesScanned, rulesExtracted, unclassifiedBlocks] = cells;
    const hasExtendedCoverage = cells.length >= 7;
    const skippedBlocks = hasExtendedCoverage ? cells[4] : "";
    const lowSignalBlocks = hasExtendedCoverage ? cells[5] : "";
    const parserWarnings = hasExtendedCoverage ? cells[6] : cells[4];
    const rowLabel = `${label} coverage ${sourceFile || "source"}`;
    if (isConcrete(sourceFile)) pass(`${rowLabel} records source file`);
    else fail(`${rowLabel} missing source file`);
    if (isPositiveInteger(linesScanned) || linesScanned === "0") pass(`${rowLabel} records lines scanned`);
    else fail(`${rowLabel} missing numeric lines scanned`);
    if (isPositiveInteger(rulesExtracted) || rulesExtracted === "0") pass(`${rowLabel} records rules extracted`);
    else fail(`${rowLabel} missing numeric rules extracted`);
    if (/^\d+$/.test(unclassifiedBlocks)) pass(`${rowLabel} records unclassified block count`);
    else fail(`${rowLabel} missing unclassified block count`);
    if (hasExtendedCoverage) {
      if (/^\d+$/.test(skippedBlocks)) pass(`${rowLabel} records skipped block count`);
      else fail(`${rowLabel} missing skipped block count`);
      if (/^\d+$/.test(lowSignalBlocks)) pass(`${rowLabel} records low-signal block count`);
      else fail(`${rowLabel} missing low-signal block count`);
    } else if (["1.64.0", "1.65.0"].includes(structuredEvidence?.schema_version)) {
      fail(`${rowLabel} must record skipped and low-signal block counts for 1.64 evidence`);
    }
    if (isConcrete(parserWarnings) || parserWarnings === "None") pass(`${rowLabel} records parser warning status`);
    else fail(`${rowLabel} missing parser warning status`);
  }
  if (structuredEvidence) {
    const coverageCount = structuredEvidence.rule_extraction_coverage?.length || 0;
    if (coverageCount === rows.length) pass(`${label} coverage table matches structured evidence source count`);
    else fail(`${label} coverage table count ${rows.length} does not match structured evidence ${coverageCount}`);
  }
}

function checkRuleClassification(content, label, structuredEvidence) {
  const body = sectionBody(content, "Extracted Rule Classification") || "";
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include extracted rule classification rows`);
    return;
  }
  for (const row of rows) {
    const parsed = parseRuleRow(row);
    const {
      ruleId,
      sourceFile,
      sourceLineRange,
      contextHeading,
      sourceExcerpt,
      ruleClass,
      authority,
      defaultHandling,
      preserveOrReplace,
      reason,
      riskSurfaces,
      targetAction,
      humanDecisionRequired,
      confidence,
    } = parsed;
    const rowLabel = `${label} ${ruleId || "rule"}`;
    if (isConcrete(ruleId)) pass(`${rowLabel} records rule id`);
    else fail(`${rowLabel} missing rule id`);
    if (isConcrete(sourceFile) && sourceFile !== "N/A") pass(`${rowLabel} records source file`);
    else fail(`${rowLabel} missing source file`);
    if (isConcrete(sourceExcerpt) && sourceExcerpt !== "N/A") pass(`${rowLabel} records source excerpt`);
    else fail(`${rowLabel} missing source excerpt`);
    if (sourceLineRange) {
      if (validLineRange(sourceLineRange)) pass(`${rowLabel} records source line range`);
      else fail(`${rowLabel} has invalid source line range: ${sourceLineRange}`);
    } else if (requireStructuredEvidence) {
      fail(`${rowLabel} missing source line range in strict mode`);
    }
    if (contextHeading) {
      if (isConcrete(contextHeading)) pass(`${rowLabel} records context heading`);
      else fail(`${rowLabel} missing context heading`);
    } else if (requireStructuredEvidence) {
      fail(`${rowLabel} missing context heading in strict mode`);
    }
    if (allowedRuleClasses.has(ruleClass)) pass(`${rowLabel} has valid rule class`);
    else fail(`${rowLabel} has invalid rule class: ${ruleClass || "<empty>"}`);
    if (isConcrete(authority)) pass(`${rowLabel} records authority`);
    else fail(`${rowLabel} missing authority`);
    if (isConcrete(defaultHandling)) pass(`${rowLabel} records default handling`);
    else fail(`${rowLabel} missing default handling`);
    if (isConcrete(preserveOrReplace)) pass(`${rowLabel} records preserve/replace decision`);
    else fail(`${rowLabel} missing preserve/replace decision`);
    if (isConcrete(reason)) pass(`${rowLabel} records reason`);
    else fail(`${rowLabel} missing reason`);
    if (isConcrete(riskSurfaces)) pass(`${rowLabel} records risk surfaces`);
    else fail(`${rowLabel} missing risk surfaces`);
    if (isConcrete(targetAction)) pass(`${rowLabel} records target action`);
    else fail(`${rowLabel} missing target action`);
    if (humanDecisionRequired === "Yes") pass(`${rowLabel} requires human decision`);
    else fail(`${rowLabel} must require human decision`);
    if (confidence) {
      if (allowedConfidence.has(confidence)) pass(`${rowLabel} records valid confidence`);
      else fail(`${rowLabel} has invalid confidence: ${confidence}`);
    } else if (requireStructuredEvidence) {
      fail(`${rowLabel} missing confidence in strict mode`);
    }

    const excerptAndAction = `${sourceExcerpt} ${targetAction} ${preserveOrReplace}`;
    if (ruleClass === "WORKFLOW_RULE"
      && /\b(customer|business|contract|invoice|tax|finance|HR|payment|permission|data)\b/i.test(sourceExcerpt)
      && /\b(replace|remove|drop)\b/i.test(excerptAndAction)) {
      fail(`${rowLabel} misclassifies a business rule as replaceable workflow`);
    }
    if (ruleClass === "ENGINEERING_BASELINE"
      && /\b(release|rollback|deploy|production|secret|migration|incident|provider)\b/i.test(sourceExcerpt)) {
      fail(`${rowLabel} misclassifies production control as engineering baseline`);
    }
    if (ruleClass === "ENGINEERING_BASELINE"
      && /\b(invoice|tax|finance|payment|contract|customer data|data meaning|tax meaning|approval limit|role changes?)\b/i.test(sourceExcerpt)
      && /\b(schema|api|database|enum|type|string|dto)\b/i.test(sourceExcerpt)) {
      fail(`${rowLabel} misclassifies mixed business + engineering rule as plain engineering baseline`);
    }
    if (ruleClass === "ENGINEERING_BASELINE"
      && /(客户|合同|协议|订单|发票|税务|结算|财务|审批|权限|角色|客户数据|隐私|合规)/.test(sourceExcerpt)
      && /(数据库|接口|枚举|schema|api|database|enum)/i.test(sourceExcerpt)) {
      fail(`${rowLabel} misclassifies Chinese business + engineering rule as plain engineering baseline`);
    }
    if (ruleClass !== "PRODUCTION_CONTROL"
      && /(生产|上线|发布|回滚|事故|密钥|生产配置)/.test(sourceExcerpt)) {
      fail(`${rowLabel} misclassifies Chinese production or release rule`);
    }
    if (ruleClass === "UNKNOWN_AUTHORITY" && !/\b(stop|classify|owner|confirm)\b/i.test(targetAction)) {
      fail(`${rowLabel} unknown authority must stop for classification`);
    }
  }
  if (structuredEvidence) {
    if ((structuredEvidence.rule_classifications?.length || 0) === rows.length) {
      pass(`${label} rule table matches structured evidence rule count`);
    } else {
      fail(`${label} rule table count ${rows.length} does not match structured evidence ${structuredEvidence.rule_classifications?.length || 0}`);
    }
    checkRuleConsistency(rows.map(parseRuleRow), structuredEvidence.rule_classifications || [], label);
  }
}

function parseRuleRow(row) {
  const cells = row.map(stripMarkdown);
  if (cells.length >= 14) {
    return {
      ruleId: cells[0],
      sourceFile: cells[1],
      sourceLineRange: cells[2],
      contextHeading: cells[3],
      sourceExcerpt: cells[4],
      ruleClass: cells[5],
      authority: cells[6],
      defaultHandling: cells[7],
      preserveOrReplace: cells[8],
      reason: cells[9],
      riskSurfaces: cells[10],
      targetAction: cells[11],
      humanDecisionRequired: cells[12],
      confidence: cells[13],
    };
  }
  return {
    ruleId: cells[0],
    sourceFile: cells[1],
    sourceLineRange: "",
    contextHeading: "",
    sourceExcerpt: cells[2],
    ruleClass: cells[3],
    authority: cells[4],
    defaultHandling: cells[5],
    preserveOrReplace: cells[6],
    reason: cells[7],
    riskSurfaces: cells[8],
    targetAction: cells[9],
    humanDecisionRequired: cells[10],
    confidence: "",
  };
}

function checkStructuredEvidence(content, label, summary) {
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
    "posture",
    "can_codex_write_now",
    "intent_os_workflow_authority",
    "target_file_write_authority",
    "business_authority",
    "production_authority",
    "requires_human_approval_before_apply",
    "rule_extraction_coverage",
    "rule_classifications",
    "proposed_actions",
    "authority_transition",
    "boundary",
    "outcome",
  ];
  for (const field of required) {
    if (Object.prototype.hasOwnProperty.call(parsed, field)) pass(`${label} structured evidence includes ${field}`);
    else fail(`${label} structured evidence missing ${field}`);
  }

  if (allowedSchemaVersions.has(parsed.schema_version)) pass(`${label} structured evidence schema version is supported`);
  else fail(`${label} structured evidence has invalid schema version: ${parsed.schema_version || "<empty>"}`);
  if (parsed.artifact_type === "native_migration_plan") pass(`${label} structured evidence artifact type is native_migration_plan`);
  else fail(`${label} structured evidence has invalid artifact type: ${parsed.artifact_type || "<empty>"}`);
  if (parsed.report_type === "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION") pass(`${label} structured evidence report type is valid`);
  else fail(`${label} structured evidence has invalid report type: ${parsed.report_type || "<empty>"}`);
  if (parsed.posture === summary.posture) pass(`${label} structured posture matches Human Summary`);
  else fail(`${label} structured posture ${parsed.posture || "<empty>"} does not match summary ${summary.posture || "<empty>"}`);
  if (parsed.can_codex_write_now === summary.canWrite) pass(`${label} structured write authority matches Human Summary`);
  else fail(`${label} structured can_codex_write_now must match Human Summary`);
  if (parsed.intent_os_workflow_authority === summary.workflowAuthority) pass(`${label} structured workflow authority matches Human Summary`);
  else fail(`${label} structured workflow authority must match Human Summary`);
  if (parsed.target_file_write_authority === summary.writeAuthority) pass(`${label} structured target-file authority matches Human Summary`);
  else fail(`${label} structured target-file authority must match Human Summary`);
  if (parsed.business_authority === "PROJECT_OWNED" && parsed.business_authority === summary.businessAuthority) pass(`${label} structured business authority stays project-owned`);
  else fail(`${label} structured business authority must be PROJECT_OWNED`);
  if (parsed.production_authority === "HUMAN_OR_EXTERNAL_SYSTEM" && parsed.production_authority === summary.productionAuthority) pass(`${label} structured production authority stays human/external`);
  else fail(`${label} structured production authority must be HUMAN_OR_EXTERNAL_SYSTEM`);
  if (parsed.requires_human_approval_before_apply === "Yes" && parsed.requires_human_approval_before_apply === summary.approvalBeforeApply) pass(`${label} structured approval requirement matches`);
  else fail(`${label} structured evidence must require human approval before apply`);

  if (!Array.isArray(parsed.rule_extraction_coverage) || parsed.rule_extraction_coverage.length === 0) {
    fail(`${label} structured evidence must include rule extraction coverage`);
  } else {
    for (const item of parsed.rule_extraction_coverage) validateStructuredCoverage(item, label, parsed.schema_version);
  }

  if (!Array.isArray(parsed.rule_classifications) || parsed.rule_classifications.length === 0) {
    fail(`${label} structured evidence must include rule classifications`);
  } else {
    for (const item of parsed.rule_classifications) validateStructuredRule(item, label);
  }

  if (Array.isArray(parsed.rule_extraction_coverage) && Array.isArray(parsed.rule_classifications)) {
    const extracted = parsed.rule_extraction_coverage.reduce((sum, item) => sum + Number(item.rules_extracted || 0), 0);
    if (extracted === parsed.rule_classifications.length) {
      pass(`${label} structured extracted-rule count matches classifications`);
    } else {
      fail(`${label} structured extracted-rule count ${extracted} does not match classifications ${parsed.rule_classifications.length}`);
    }
  }

  validateStructuredProposedActions(parsed.proposed_actions, label);

  if (parsed.boundary?.writesTargetFiles === "No"
    && parsed.boundary?.authorizesTargetFileWrites === "No"
    && parsed.boundary?.approvesImplementation === "No"
    && parsed.boundary?.approvesReleaseOrProduction === "No"
    && parsed.boundary?.modifiesCiOrHooks === "No") {
    pass(`${label} structured boundary remains plan-only`);
  } else {
    fail(`${label} structured boundary must remain plan-only`);
  }

  return parsed;
}

function validateStructuredCoverage(item, label, schemaVersion) {
  const rowLabel = `${label} structured coverage ${item?.source_file || "source"}`;
  if (isConcrete(item?.source_file)) pass(`${rowLabel} has source file`);
  else fail(`${rowLabel} missing source file`);
  if (Number.isInteger(item?.lines_scanned) && item.lines_scanned >= 0) pass(`${rowLabel} has lines scanned`);
  else fail(`${rowLabel} missing numeric lines scanned`);
  if (Number.isInteger(item?.rules_extracted) && item.rules_extracted >= 0) pass(`${rowLabel} has rules extracted`);
  else fail(`${rowLabel} missing numeric rules extracted`);
  if (Array.isArray(item?.unclassified_blocks)) pass(`${rowLabel} has unclassified block list`);
  else fail(`${rowLabel} missing unclassified block list`);
  if (["1.64.0", "1.65.0"].includes(schemaVersion)) {
    if (Array.isArray(item?.skipped_blocks)) pass(`${rowLabel} has skipped block list`);
    else fail(`${rowLabel} missing skipped block list`);
    if (Array.isArray(item?.low_signal_blocks)) pass(`${rowLabel} has low-signal block list`);
    else fail(`${rowLabel} missing low-signal block list`);
  }
  if (Array.isArray(item?.parser_warnings)) pass(`${rowLabel} has parser warnings list`);
  else fail(`${rowLabel} missing parser warnings list`);
  const hasReviewBlocks = (Array.isArray(item?.unclassified_blocks) && item.unclassified_blocks.length > 0)
    || (Array.isArray(item?.skipped_blocks) && item.skipped_blocks.length > 0)
    || (Array.isArray(item?.low_signal_blocks) && item.low_signal_blocks.length > 0);
  if (hasReviewBlocks
    && (!Array.isArray(item?.parser_warnings) || item.parser_warnings.length === 0)) {
    fail(`${rowLabel} must include parser warnings when unclassified, skipped, or low-signal blocks exist`);
  }
}

function validateStructuredRule(item, label) {
  const rowLabel = `${label} structured rule ${item?.rule_id || "rule"}`;
  for (const field of [
    "rule_id",
    "source_file",
    "source_start_line",
    "source_end_line",
    "context_heading",
    "source_excerpt",
    "rule_class",
    "authority",
    "default_handling",
    "preserve_or_replace",
    "reason",
    "risk_surfaces",
    "target_action",
    "human_decision_required",
    "confidence",
  ]) {
    if (isConcrete(item?.[field]) || Number.isInteger(item?.[field])) pass(`${rowLabel} includes ${field}`);
    else fail(`${rowLabel} missing ${field}`);
  }
  if (Number.isInteger(item?.source_start_line) && Number.isInteger(item?.source_end_line) && item.source_start_line <= item.source_end_line) {
    pass(`${rowLabel} line range is valid`);
  } else {
    fail(`${rowLabel} line range is invalid`);
  }
  if (allowedRuleClasses.has(item?.rule_class)) pass(`${rowLabel} has valid rule class`);
  else fail(`${rowLabel} invalid rule class: ${item?.rule_class || "<empty>"}`);
  if (allowedConfidence.has(item?.confidence)) pass(`${rowLabel} has valid confidence`);
  else fail(`${rowLabel} invalid confidence: ${item?.confidence || "<empty>"}`);
  if (item?.human_decision_required === "Yes") pass(`${rowLabel} requires human decision`);
  else fail(`${rowLabel} must require human decision`);
  if ((item?.rule_class === "BUSINESS_FACT" || item?.rule_class === "PRODUCTION_CONTROL")
    && /\b(replace|remove|drop)\b/i.test(`${item?.preserve_or_replace || ""} ${item?.target_action || ""}`)) {
    fail(`${rowLabel} must not replace business or production authority`);
  }
}

function validateStructuredProposedActions(actions, label) {
  if (!Array.isArray(actions) || actions.length === 0) {
    fail(`${label} structured evidence must include proposed actions`);
    return;
  }
  for (const action of actions) {
    const rowLabel = `${label} structured proposed action ${action?.step || action?.action || "action"}`;
    for (const field of ["step", "action", "exactTargetPath", "writesTargetFiles", "requiresHumanApproval", "status"]) {
      if (isConcrete(action?.[field]) || Number.isInteger(action?.[field])) pass(`${rowLabel} includes ${field}`);
      else fail(`${rowLabel} missing ${field}`);
    }
    if (isConcrete(action?.exactTargetPath)) pass(`${rowLabel} has exact target path`);
    else fail(`${rowLabel} missing exact target path`);
    if (broadPathPattern.test(` ${action?.exactTargetPath || ""} `)) fail(`${rowLabel} uses broad target path: ${action?.exactTargetPath}`);
    if (action?.writesTargetFiles === "No") pass(`${rowLabel} stays plan-only`);
    else fail(`${rowLabel} must not write target files`);
    if (action?.requiresHumanApproval === "Yes") pass(`${rowLabel} requires human approval`);
    else fail(`${rowLabel} must require human approval`);
  }
}

function checkRuleConsistency(markdownRules, structuredRules, label) {
  const structuredById = new Map(structuredRules.map((rule) => [stripMarkdown(rule.rule_id || ""), rule]));
  for (const markdownRule of markdownRules) {
    const structured = structuredById.get(markdownRule.ruleId);
    const rowLabel = `${label} ${markdownRule.ruleId || "rule"} Markdown/JSON`;
    if (!structured) {
      fail(`${rowLabel} missing structured evidence rule`);
      continue;
    }
    compareRuleField(rowLabel, "source_file", markdownRule.sourceFile, structured.source_file);
    const [startLine, endLine] = lineRangeParts(markdownRule.sourceLineRange);
    compareRuleField(rowLabel, "source_start_line", startLine, structured.source_start_line);
    compareRuleField(rowLabel, "source_end_line", endLine, structured.source_end_line);
    compareRuleField(rowLabel, "context_heading", markdownRule.contextHeading, structured.context_heading);
    compareRuleField(rowLabel, "source_excerpt", markdownRule.sourceExcerpt, structured.source_excerpt);
    compareRuleField(rowLabel, "rule_class", markdownRule.ruleClass, structured.rule_class);
    compareRuleField(rowLabel, "authority", markdownRule.authority, structured.authority);
    compareRuleField(rowLabel, "default_handling", markdownRule.defaultHandling, structured.default_handling);
    compareRuleField(rowLabel, "preserve_or_replace", markdownRule.preserveOrReplace, structured.preserve_or_replace);
    compareRuleField(rowLabel, "risk_surfaces", markdownRule.riskSurfaces, structured.risk_surfaces);
    compareRuleField(rowLabel, "target_action", markdownRule.targetAction, structured.target_action);
    compareRuleField(rowLabel, "human_decision_required", markdownRule.humanDecisionRequired, structured.human_decision_required);
    compareRuleField(rowLabel, "confidence", markdownRule.confidence, structured.confidence);
  }
}

function compareRuleField(label, field, markdownValue, structuredValue) {
  const md = normalizeComparable(markdownValue);
  const json = normalizeComparable(structuredValue);
  if (md === json) pass(`${label} ${field} matches`);
  else fail(`${label} ${field} mismatch: markdown=${md || "<empty>"} json=${json || "<empty>"}`);
}

function normalizeComparable(value) {
  if (Number.isInteger(value)) return String(value);
  return stripMarkdown(String(value || "")).replace(/\s+/g, " ").trim();
}

function lineRangeParts(value) {
  const match = String(value || "").trim().match(/^(\d+)-(\d+)$/);
  if (!match) return ["", ""];
  return [match[1], match[2]];
}

function fencedJson(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() || "";
}

function checkProposedActions(content, label, structuredEvidence) {
  const body = sectionBody(content, "Proposed Native Migration Plan") || "";
  const rows = tableRows(body);
  if (rows.length === 0) {
    fail(`${label} must include proposed native migration actions`);
    return;
  }
  const structuredByStep = new Map((structuredEvidence?.proposed_actions || []).map((action) => [String(action.step), action]));
  for (const row of rows) {
    const step = stripMarkdown(row[0] || "");
    const action = stripMarkdown(row[1] || "");
    const targetPath = stripMarkdown(row[2] || "");
    const writes = stripMarkdown(row[3] || "");
    const approval = stripMarkdown(row[4] || "");
    const status = stripMarkdown(row[5] || "");
    if (!isConcrete(targetPath)) fail(`${label} proposed action missing exact target path: ${action}`);
    else pass(`${label} proposed action has exact target path: ${targetPath}`);
    if (broadPathPattern.test(` ${targetPath} `)) fail(`${label} uses broad target path: ${targetPath}`);
    if (writes === "Yes") fail(`${label} proposed action claims direct target-file writes: ${action}`);
    else pass(`${label} proposed action stays plan-only: ${action}`);
    if (approval === "Yes") pass(`${label} proposed action requires approval: ${action}`);
    else fail(`${label} proposed action must require human approval: ${action}`);
    if (structuredEvidence && requireStructuredEvidence) {
      const structured = structuredByStep.get(step);
      const rowLabel = `${label} proposed action ${step || action} Markdown/JSON`;
      if (!structured) {
        fail(`${rowLabel} missing structured proposed action`);
      } else {
        compareProposedActionField(rowLabel, "action", action, structured.action);
        compareProposedActionField(rowLabel, "exactTargetPath", targetPath, structured.exactTargetPath);
        compareProposedActionField(rowLabel, "writesTargetFiles", writes, structured.writesTargetFiles);
        compareProposedActionField(rowLabel, "requiresHumanApproval", approval, structured.requiresHumanApproval);
        compareProposedActionField(rowLabel, "status", status, structured.status);
      }
    }
  }
}

function compareProposedActionField(label, field, markdownValue, structuredValue) {
  const md = normalizeComparable(markdownValue);
  const json = normalizeComparable(structuredValue);
  if (md === json) pass(`${label} ${field} matches`);
  else fail(`${label} ${field} mismatch: markdown=${md || "<empty>"} json=${json || "<empty>"}`);
}

function checkAgentsHandling(content, label) {
  const body = sectionBody(content, "Proposed AGENTS.md Handling") || "";
  if (!body.trim()) {
    fail(`${label} missing AGENTS.md handling`);
    return;
  }
  for (const marker of [
    "Project facts preserved",
    "Old workflow rules replaced by IntentOS only after approval",
    "Restore owner",
  ]) {
    if (body.includes(marker)) pass(`${label} AGENTS handling includes ${marker}`);
    else fail(`${label} AGENTS handling missing ${marker}`);
  }
}

function checkRestorePlan(content, label) {
  const body = sectionBody(content, "Restore Plan") || "";
  for (const marker of ["Backup path", "Restore method", "Restore owner", "If owner rejects migration"]) {
    if (body.includes(marker) && isConcrete(tableValue(body, marker))) pass(`${label} restore plan includes ${marker}`);
    else fail(`${label} restore plan missing ${marker}`);
  }
}

function checkAuthorityTransition(content, label) {
  const body = sectionBody(content, "Authority Transition") || "";
  if (/\bequal authority\b/i.test(body)) {
    fail(`${label} authority transition must not keep old workflow and IntentOS as equal authority`);
  }
  for (const marker of ["Old workflow rules", "IntentOS rules", "Transition condition"]) {
    if (body.includes(marker) && isConcrete(tableValue(body, marker))) pass(`${label} authority transition includes ${marker}`);
    else fail(`${label} authority transition missing ${marker}`);
  }
}

function checkApplyChain(content, label) {
  const body = sectionBody(content, "Apply Chain") || "";
  for (const marker of ["Native Migration Plan", "Unified Apply Plan", "Controlled Apply Readiness", "Approval Record", "approved governance-file edits only"]) {
    if (body.includes(marker)) pass(`${label} apply chain includes ${marker}`);
    else fail(`${label} apply chain missing ${marker}`);
  }
}

function checkBoundaries(content, label) {
  for (const boundary of [
    "This plan writes target files",
    "This plan authorizes target-file writes",
    "This plan approves implementation",
    "This plan approves release or production",
    "This plan modifies CI or hooks",
    "This plan changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior",
    "This plan treats IntentOS workflow authority as business authority",
  ]) {
    requireBoundaryNo(content, label, boundary);
  }
  const approval = boundaryValue(content, "This plan requires human approval before governance replacement");
  if (approval === "Yes") pass(`${label} requires human approval before governance replacement`);
  else fail(`${label} must require human approval before governance replacement`);
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/native-first-existing-project-migration-1.62-plan.md",
    "docs/plans/native-migration-precision-hardening-1.63-plan.md",
    "docs/plans/native-migration-parser-calibration-1.64-plan.md",
    "docs/plans/native-migration-classification-calibration-1.65-plan.md",
    "core/native-first-existing-project-migration.md",
    "docs/native-first-existing-project-migration.md",
    "templates/native-migration-plan.md",
    "schemas/artifacts/native-migration-plan.schema.json",
    "scripts/lib/native-rule-extraction.mjs",
    "checklists/native-migration-review.md",
    "prompts/native-migration-agent.md",
    "native-migration-plans/.gitkeep",
    "scripts/resolve-native-migration.mjs",
    "scripts/check-native-migration.mjs",
    "examples/1.62-native-first-existing-project/README.md",
    "examples/1.62-native-first-existing-project/light-web/native-migration-plans/001-light-web.md",
    "examples/1.62-native-first-existing-project/governed-admin/native-migration-plans/001-governed-admin.md",
    "examples/1.62-native-first-existing-project/production-maintained/native-migration-plans/001-production-maintained.md",
    "examples/1.62-native-first-existing-project/dirty-worktree/native-migration-plans/001-dirty-worktree.md",
    "examples/1.63-native-migration-precision/README.md",
    "examples/1.63-native-migration-precision/mixed-agent-rules/native-migration-plans/001-mixed-agent-rules.md",
    "examples/1.64-native-migration-parser-calibration/README.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/native-migration-plans/001-table-long-bilingual.md",
    "examples/1.65-native-migration-classification-calibration/README.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/native-migration-plans/001-mixed-domain-bilingual.md",
    "releases/1.62.0/release-record.md",
    "releases/1.62.0/known-limitations.md",
    "releases/1.62.0/self-check-report.md",
    "releases/1.64.0/release-record.md",
    "releases/1.64.0/known-limitations.md",
    "releases/1.64.0/self-check-report.md",
    "releases/1.65.0/release-record.md",
    "releases/1.65.0/known-limitations.md",
    "releases/1.65.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`native migration source evidence exists ${file}`);
    else fail(`native migration source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-native-migration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("I have switched to IntentOS Native-First Migration Planning mode.")
    && resolver.stdout.includes("This plan writes target files: No")
    && resolver.stdout.includes("Unified Apply Plan")) {
    pass("1.62 native migration resolver prints safe plan");
  } else {
    fail(`1.62 native migration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const json = runNode(["scripts/resolve-native-migration.mjs", ".", "--json"]);
  try {
    const parsed = JSON.parse(json.stdout);
    if (json.status === 0
      && parsed.reportType === "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION"
      && allowedPostures.has(parsed.posture)
      && parsed.canCodexWriteNow === "No"
      && parsed.intentOsWorkflowAuthority
      && parsed.targetFileWriteAuthority
      && parsed.businessAuthority === "PROJECT_OWNED"
      && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM") {
      pass("1.62 native migration resolver JSON includes posture and authorities");
    } else {
      fail("1.62 native migration resolver JSON missing required fields");
    }
  } catch (error) {
    fail(`1.62 native migration resolver JSON parse failed: ${error.message}`);
  }

  for (const target of [
    "examples/1.62-native-first-existing-project/light-web",
    "examples/1.62-native-first-existing-project/governed-admin",
    "examples/1.62-native-first-existing-project/production-maintained",
    "examples/1.62-native-first-existing-project/dirty-worktree",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", target]);
    if (result.status === 0) pass(`1.62 native migration example passes ${target}`);
    else fail(`1.62 native migration example failed ${target}: ${result.stderr || result.stdout}`);
  }

  const strictExample = runNode(["scripts/check-native-migration.mjs", "examples/1.63-native-migration-precision/mixed-agent-rules", "--require-structured-evidence"]);
  if (strictExample.status === 0) pass("1.63 native migration precision example passes strict checker");
  else fail(`1.63 native migration precision example failed: ${strictExample.stderr || strictExample.stdout}`);

  const strictCalibrationExample = runNode(["scripts/check-native-migration.mjs", "examples/1.64-native-migration-parser-calibration/table-long-bilingual", "--require-structured-evidence"]);
  if (strictCalibrationExample.status === 0) pass("1.64 native migration parser calibration example passes strict checker");
  else fail(`1.64 native migration parser calibration example failed: ${strictCalibrationExample.stderr || strictCalibrationExample.stdout}`);

  const strictClassificationExample = runNode(["scripts/check-native-migration.mjs", "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual", "--require-structured-evidence"]);
  if (strictClassificationExample.status === 0) pass("1.65 native migration classification calibration example passes strict checker");
  else fail(`1.65 native migration classification calibration example failed: ${strictClassificationExample.stderr || strictClassificationExample.stdout}`);

  for (const target of [
    "bad-native-migration-drops-business-rule",
    "bad-native-migration-direct-agents-overwrite",
    "bad-native-migration-keeps-split-authority",
    "bad-native-migration-auto-ci-hook",
    "bad-native-migration-production-config",
    "bad-native-migration-no-human-approval",
    "bad-native-migration-no-restore-plan",
    "bad-native-migration-approves-implementation",
    "bad-native-migration-unknown-owner",
    "bad-native-migration-business-rule-as-workflow-rule",
    "bad-native-migration-production-control-as-baseline",
    "bad-native-migration-no-source-excerpt",
    "bad-native-migration-broad-target-path",
    "bad-native-migration-no-authority-transition",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`]);
    if (result.status !== 0) pass(`1.62 native migration rejects ${target}`);
    else fail(`1.62 native migration should reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-mixed-rules-collapsed",
    "bad-native-migration-missing-line-range",
    "bad-native-migration-structured-evidence-mismatch",
    "bad-native-migration-schema-invalid",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.63 native migration rejects ${target}`);
    else fail(`1.63 native migration should reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-rule-json-mismatch",
    "bad-native-migration-line-range-mismatch",
    "bad-native-migration-missing-skipped-block-reporting",
    "bad-native-migration-structured-action-writes",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.64 native migration rejects ${target}`);
    else fail(`1.64 native migration should reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-mixed-business-engineering-as-baseline",
    "bad-native-migration-chinese-production-as-business",
    "bad-native-migration-simple-table-no-line-range",
    "bad-native-migration-complex-table-no-warning",
    "bad-native-migration-proposed-action-mismatch",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.65 native migration rejects ${target}`);
    else fail(`1.65 native migration should reject ${target}`);
  }
}

function markdownFiles(dirName) {
  const roots = candidateRoots(dirName).filter((item) => fs.existsSync(item));
  const results = [];
  for (const root of roots) results.push(...walkMarkdown(root));
  return Array.from(new Set(results)).sort();
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkMarkdown(full));
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results;
}

function candidateRoots(name) {
  return [
    path.join(projectRoot, name),
    path.join(projectRoot, ".ai-native", name),
  ];
}

function resolveAsset(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative)) return aiNative;
  return null;
}

function resolveDirectory(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isDirectory()) return aiNative;
  return null;
}

function readResolved(relPath) {
  const resolved = resolveAsset(relPath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading, { fallback: null }) !== null) pass(`${label} includes section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function requireBoundaryNo(content, label, boundary) {
  const value = boundaryValue(content, boundary);
  if (value === "No") pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} boundary ${boundary} must be No`);
}

function boundaryValue(content, boundary) {
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`[-*]\\s+${escaped}:\\s*([^\\n]+)`, "i"));
  return stripMarkdown(match?.[1] || "");
}

function tableValue(content, field) {
  const rows = content.split(/\r?\n/);
  for (const row of rows) {
    if (!row.trim().startsWith("|")) continue;
    const cells = splitMarkdownRow(row).map(stripMarkdown);
    if (cells.length >= 2 && cells[0].toLowerCase() === field.toLowerCase()) return cells[1];
  }
  return "";
}

function tableRows(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => splitMarkdownRow(line))
    .filter((cells) => cells.length > 0)
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim())))
    .filter((cells) => !/^rule id$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^step$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^source file$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^field$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^decision$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^conflict id$/i.test(stripMarkdown(cells[0] || "")))
    .filter((cells) => !/^item$/i.test(stripMarkdown(cells[0] || "")));
}

function codeOrTextValue(body) {
  const code = body?.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return stripMarkdown((body || "").split(/\r?\n/).find((line) => line.trim()) || "");
}

function isConcrete(value) {
  const text = stripMarkdown(value || "");
  return Boolean(text) && !/^(N\/A|TBD|TODO|unknown|none|<.*>)$/i.test(text);
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value || "").trim());
}

function validLineRange(value) {
  const match = String(value || "").trim().match(/^(\d+)-(\d+)$/);
  if (!match) return false;
  return Number(match[1]) >= 1 && Number(match[2]) >= Number(match[1]);
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function rel(file) {
  return path.relative(projectRoot, file) || ".";
}

function displayAsset(file, resolved) {
  return path.relative(projectRoot, resolved) || file;
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
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
      ok: !failed,
      checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Native Migration check passed.");
  }
  process.exit(failed ? 1 : 0);
}
