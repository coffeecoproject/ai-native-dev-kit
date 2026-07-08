#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out", "task-kind"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "classify task governance").trim();
const explicitTaskKind = args["task-kind"] ? String(args["task-kind"]) : "";
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

const report = buildReport();

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport() {
  const classification = classifyIntent(intent, explicitTaskKind);
  const adoptionReview = adoptionReviewFor(projectRoot);
  const requiredBeforeImplementation = requirementsBeforeImplementation(classification.task_impact);
  const requiredBeforeCompletion = requirementsBeforeCompletion(classification.task_impact);
  const existingProjectMapping = existingProjectMappingFor(classification.task_impact);
  const blockedBy = blockersFor(classification.task_impact, adoptionReview, requiredBeforeImplementation, requiredBeforeCompletion, existingProjectMapping);
  const taskGovernanceRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "task-governance-reports/generated.md";
  const baseEvidence = {
    schema_version: "1.83.3",
    artifact_type: "task_governance",
    intent,
    intent_digest: digest(intent),
    task_governance_ref: taskGovernanceRef,
    task_governance_digest: "",
    task_ref: `task:${slug(intent)}`,
    project_adoption_mode: projectAdoptionModeFor(adoptionReview),
    adoption_review: adoptionReview,
    impact_classification: classification,
    required_before_implementation_review: requiredBeforeImplementation,
    required_before_completion_claim: requiredBeforeCompletion,
    review_policy: reviewPolicyFor(classification.task_impact),
    source_chain: sourceChainFor(intent, classification, adoptionReview),
    existing_project_mapping: existingProjectMapping,
    readiness: {
      governance_prerequisites_satisfied: blockedBy.length === 0 ? "Yes" : "No",
      ready_for_implementation_review: blockedBy.length === 0 && classification.task_impact !== "POSSIBLE_HIGH" ? "Yes" : "No",
      implementation_authorized_by_this_report: "No",
      can_claim_done: "No",
      blocked_by: blockedBy,
    },
    lightweight_closeout: lightweightCloseoutFor(classification.task_impact),
    user_prompt: {
      plain_user_summary: plainUserSummaryFor(classification.task_impact),
      plain_next_step: plainNextStepFor(classification.task_impact),
      technical_terms_required: "No",
    },
    boundaries: boundaryFor(),
    outcome: outcomeFor(classification.task_impact, adoptionReview),
  };
  const structuredEvidence = {
    ...baseEvidence,
    task_governance_digest: evidenceDigest(baseEvidence, ["task_governance_digest"]),
  };
  return {
    reportType: "TASK_GOVERNANCE",
    schemaVersion: "1.83.3",
    generatedBy: "scripts/resolve-task-governance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    humanSummary: {
      taskImpact: classification.task_impact,
      plainNextStep: structuredEvidence.user_prompt.plain_next_step,
      readyForImplementationReview: structuredEvidence.readiness.ready_for_implementation_review,
      implementationAuthorizedByThisReport: "No",
      canClaimDone: "No",
    },
    impactClassification: classification,
    requiredBeforeImplementation,
    requiredBeforeCompletion,
    reviewPolicy: structuredEvidence.review_policy,
    sourceChain: structuredEvidence.source_chain,
    existingProjectMapping: structuredEvidence.existing_project_mapping,
    readiness: structuredEvidence.readiness,
    boundaries: structuredEvidence.boundaries,
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function classifyIntent(value, taskKindOverride) {
  const text = value.toLowerCase();
  const taskKind = taskKindOverride || taskKindFor(text);
  const highMatches = matchPatterns(text, highImpactPatterns());
  const possibleMatches = matchPatterns(text, possibleHighPatterns());
  const mediumMatches = matchPatterns(text, mediumPatterns());
  const lowMatches = matchPatterns(text, lowPatterns());
  let taskImpact = "LOW";
  let confidence = "medium";
  if (highMatches.length > 0) {
    taskImpact = "HIGH";
    confidence = "high";
  } else if (possibleMatches.length > 0) {
    taskImpact = "POSSIBLE_HIGH";
    confidence = "medium";
  } else if (mediumMatches.length > 0) {
    taskImpact = "MEDIUM";
    confidence = "medium";
  } else if (lowMatches.length > 0) {
    taskImpact = "LOW";
    confidence = "high";
  }
  const surfaces = surfacesFor(taskImpact, highMatches, mediumMatches, lowMatches, possibleMatches);
  return {
    task_impact: taskImpact,
    confidence,
    task_kind: taskKind,
    triggered_surfaces: surfaces,
    trigger_evidence: triggerEvidenceFor(taskImpact, highMatches, mediumMatches, lowMatches, possibleMatches),
    excluded_high_impact_surfaces: excludedHighImpactSurfacesFor(taskImpact, surfaces),
    low_impact_reason: taskImpact === "LOW" ? "Only local non-behavioral text, docs, or visual surface is indicated; no high-impact surface is detected." : "",
    medium_impact_reason: taskImpact === "MEDIUM" ? "The task appears bounded to one local behavior surface with no public API, DB, permission, runtime-state, release, or production impact." : "",
    possible_high_resolution: taskImpact === "POSSIBLE_HIGH"
      ? {
          initial_state: "POSSIBLE_HIGH",
          resolution: "NEEDS_CLARIFICATION_OR_READ_ONLY_INSPECTION",
          inspection_ref: "",
          inspection_digest: "",
          reason: "The intent contains credible high-impact signals but not enough evidence to safely downgrade.",
        }
      : {
          initial_state: "N/A",
          resolution: "N/A",
          inspection_ref: "",
          inspection_digest: "",
          reason: "",
        },
    upgrade_history: [],
  };
}

function requirementsBeforeImplementation(impact) {
  if (impact === "LOW") {
    return {
      scope_check_required: "Yes",
      short_plan_required: "No",
      business_rule_closure_required: "No",
      change_impact_coverage_required: "No",
      execution_plan_required: "No",
      verification_plan_required: "No",
    };
  }
  if (impact === "MEDIUM") {
    return {
      scope_check_required: "Yes",
      short_plan_required: "Yes",
      business_rule_closure_required: "No",
      change_impact_coverage_required: "No",
      execution_plan_required: "No",
      verification_plan_required: "No",
    };
  }
  if (impact === "POSSIBLE_HIGH") {
    return {
      scope_check_required: "Yes",
      short_plan_required: "Yes",
      business_rule_closure_required: "No",
      change_impact_coverage_required: "No",
      execution_plan_required: "No",
      verification_plan_required: "No",
    };
  }
  return {
    scope_check_required: "Yes",
    short_plan_required: "No",
    business_rule_closure_required: "Yes",
    change_impact_coverage_required: "Yes",
    execution_plan_required: "Yes",
    verification_plan_required: "Yes",
  };
}

function requirementsBeforeCompletion(impact) {
  if (impact === "HIGH") {
    return {
      test_evidence_required: "Yes",
      execution_assurance_required: "Yes",
      completion_evidence_required: "Yes",
    };
  }
  return {
    test_evidence_required: "No",
    execution_assurance_required: "No",
    completion_evidence_required: "No",
  };
}

function reviewPolicyFor(impact) {
  if (impact === "LOW") {
    return {
      review_level: "LIGHTWEIGHT",
      codex_self_check_required: "Yes",
      independent_review_required: "No",
      review_must_happen_before: "completion_claim",
      review_must_cover: [
        "scope unchanged",
        "excluded high-impact surfaces",
        "minimal verification or explicit reason",
        "unrelated edits check",
      ],
      review_source: "codex_self_check",
      skip_full_review_reason: "LOW tasks use lightweight review only because no high-impact surface is detected.",
    };
  }
  if (impact === "MEDIUM") {
    return {
      review_level: "TARGETED",
      codex_self_check_required: "Yes",
      independent_review_required: "Conditional",
      review_must_happen_before: "completion_claim",
      review_must_cover: [
        "short plan",
        "bounded impact surface",
        "excluded high-impact surfaces",
        "targeted verification",
        "unrelated edits check",
      ],
      review_source: "targeted_checker_or_project_review",
      skip_full_review_reason: "MEDIUM tasks do not require the full high-impact chain when the affected surface stays local and bounded.",
    };
  }
  if (impact === "POSSIBLE_HIGH") {
    return {
      review_level: "BLOCKING_CLARIFICATION",
      codex_self_check_required: "Yes",
      independent_review_required: "Yes",
      review_must_happen_before: "implementation_review",
      review_must_cover: [
        "clarification or read-only inspection",
        "high-impact surface decision",
        "upgrade or downgrade rationale",
      ],
      review_source: "human_or_read_only_inspection",
      skip_full_review_reason: "POSSIBLE_HIGH tasks cannot skip full review until clarification proves the task is not high impact.",
    };
  }
  return {
    review_level: "FULL",
    codex_self_check_required: "Yes",
    independent_review_required: "Yes",
    review_must_happen_before: "implementation_and_completion",
    review_must_cover: [
      "business rule closure",
      "change impact coverage",
      "execution plan",
      "verification plan",
      "test evidence",
      "execution assurance",
      "completion evidence",
    ],
    review_source: "review_loop_or_project_native_review",
    skip_full_review_reason: "HIGH tasks cannot skip the full review chain.",
  };
}

function blockersFor(impact, adoptionReview, beforeImplementation, beforeCompletion, existingProjectMapping = []) {
  const blocked = [];
  if (adoptionReview.blocks_task_governance === "Yes") blocked.push("blocked by current adoption review source");
  if (impact === "POSSIBLE_HIGH") blocked.push("needs clarification or read-only inspection before implementation");
  if (impact === "HIGH") {
    if (beforeImplementation.business_rule_closure_required === "Yes" && !hasMatchedProjectNativeBehavior(existingProjectMapping, "Business Rule Closure")) {
      blocked.push("missing clear business rule or project-native equivalent");
    }
    if (beforeImplementation.change_impact_coverage_required === "Yes") blocked.push("missing affected-surface map");
    if (beforeImplementation.execution_plan_required === "Yes") blocked.push("missing durable execution plan");
    if (beforeImplementation.verification_plan_required === "Yes" && !hasMatchedProjectNativeBehavior(existingProjectMapping, "Verification Plan")) {
      blocked.push("missing verification checklist");
    }
    if (beforeCompletion.test_evidence_required === "Yes") blocked.push("test proof is required before any done claim");
  }
  return blocked;
}

function hasMatchedProjectNativeBehavior(mappings, behavior) {
  return mappings.some((mapping) => mapping.required_behavior === behavior
    && ["MATCHED", "STRONGER"].includes(mapping.mapping_state)
    && mapping.project_native_task_match === "Yes");
}

function sourceChainFor(value, classification, adoptionReview) {
  return [
    {
      name: "task_intent",
      status: "READY",
      ref: "intent:current-request",
      digest: digest(value),
      state: classification.task_impact,
      current_task_match: "Yes",
      not_applicable_reason: "",
    },
    {
      name: "adoption_review",
      status: adoptionReview.state === "N/A" ? "NOT_APPLICABLE" : adoptionReview.blocks_task_governance === "Yes" ? "BLOCKED" : "RECORDED",
      ref: adoptionReview.ref,
      digest: adoptionReview.digest,
      state: adoptionReview.state,
      current_task_match: adoptionReview.current_project_match === "Yes" ? "Yes" : "Unknown",
      not_applicable_reason: adoptionReview.state === "N/A" ? "No current Controlled Native Adoption Review report was found." : "",
    },
  ];
}

function adoptionReviewFor(root) {
  const files = markdownFiles(path.join(root, "native-adoption-review-reports"));
  if (files.length === 0) {
    return {
      ref: "N/A",
      digest: "N/A",
      state: "N/A",
      current_project_match: "Unknown",
      blocks_task_governance: "No",
    };
  }
  const latest = files.sort()[files.length - 1];
  const content = fs.readFileSync(latest, "utf8");
  const state = matchJsonField(content, "outcome") || matchJsonNestedState(content) || "RECORDED";
  const currentProjectMatch = content.includes('"current_project_match": "No"') ? "No" : content.includes('"current_project_match": "Yes"') ? "Yes" : "Unknown";
  const blocks = /BLOCKED_BY_PROJECT_AUTHORITY|BLOCKED_BY_UNSAFE_PROJECT_STATE|FAILED_INVALID_EVIDENCE/i.test(state)
    && currentProjectMatch !== "No";
  return {
    ref: `artifact:${path.relative(root, latest).replaceAll(path.sep, "/")}`,
    digest: digest(content),
    state,
    current_project_match: currentProjectMatch,
    blocks_task_governance: blocks ? "Yes" : "No",
  };
}

function existingProjectMappingFor(impact) {
  if (impact !== "HIGH") return [];
  return [
    {
      required_behavior: "Business Rule Closure",
      project_native_evidence_ref: "N/A",
      project_native_evidence_digest: "N/A",
      project_native_evidence_owner: "N/A",
      project_native_evidence_scope: "N/A",
      project_native_task_match: "N/A",
      project_native_evidence_summary: "No project-native business rule evidence was supplied to this classifier report.",
      mapping_state: "MISSING",
      stronger_project_rule_preserved: "N/A",
      reason: "No project-native business rule evidence was supplied to this classifier report.",
    },
    {
      required_behavior: "Verification Plan",
      project_native_evidence_ref: "N/A",
      project_native_evidence_digest: "N/A",
      project_native_evidence_owner: "N/A",
      project_native_evidence_scope: "N/A",
      project_native_task_match: "N/A",
      project_native_evidence_summary: "No project-native verification plan evidence was supplied to this classifier report.",
      mapping_state: "MISSING",
      stronger_project_rule_preserved: "N/A",
      reason: "No project-native verification plan evidence was supplied to this classifier report.",
    },
  ];
}

function lightweightCloseoutFor(impact) {
  if (impact === "LOW") {
    return {
      scope_unchanged: "Yes",
      minimal_verification_status: "REQUIRED",
      targeted_verification_status: "NOT_APPLICABLE_WITH_REASON",
      unrelated_edits: "No",
      remaining_risk: "Minimal verification is required before a completion claim; none is performed by this read-only classifier.",
    };
  }
  if (impact === "MEDIUM") {
    return {
      scope_unchanged: "Yes",
      minimal_verification_status: "NOT_APPLICABLE_WITH_REASON",
      targeted_verification_status: "REQUIRED",
      unrelated_edits: "No",
      remaining_risk: "Targeted verification is required before a completion claim; none is performed by this read-only classifier.",
    };
  }
  return {
    scope_unchanged: "N/A",
    minimal_verification_status: "NOT_APPLICABLE_WITH_REASON",
    targeted_verification_status: "NOT_APPLICABLE_WITH_REASON",
    unrelated_edits: "No",
    remaining_risk: impact === "POSSIBLE_HIGH" ? "Impact is not yet resolved." : "High-impact governance is required before implementation review.",
  };
}

function plainUserSummaryFor(impact) {
  if (impact === "LOW") return "这是小改动。我会保持范围很小，并在完成前做轻量检查。";
  if (impact === "MEDIUM") return "这是局部功能改动。我会先确认影响范围，再做针对性检查。";
  if (impact === "POSSIBLE_HIGH") return "这个需求可能影响数据、权限或流程状态。我会先只读确认影响范围，不直接改代码。";
  return "这个需求影响较大。我会先梳理业务规则、影响范围和验证方式，再进入实现。";
}

function plainNextStepFor(impact) {
  if (impact === "LOW") return "这个任务看起来是低影响变更。我会保持范围很小，并做最小验证。";
  if (impact === "MEDIUM") return "这个任务是局部行为变更。我会先写短计划，确认影响面，再做针对性验证。";
  if (impact === "POSSIBLE_HIGH") return "这个任务可能影响数据、状态或权限。我会先做只读检查确认影响范围，不直接改代码。";
  return "这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。";
}

function outcomeFor(impact, adoptionReview) {
  if (adoptionReview.blocks_task_governance === "Yes") return "BLOCKED_BY_ADOPTION_REVIEW";
  if (impact === "LOW") return "LOW_LIGHTWEIGHT_GOVERNANCE";
  if (impact === "MEDIUM") return "MEDIUM_TARGETED_GOVERNANCE";
  if (impact === "POSSIBLE_HIGH") return "POSSIBLE_HIGH_NEEDS_CLARIFICATION";
  return "HIGH_REQUIRES_FULL_GOVERNANCE";
}

function projectAdoptionModeFor(adoptionReview) {
  if (adoptionReview.state === "N/A") return "unknown";
  if (/STAY_PARTIAL|PARTIAL/i.test(adoptionReview.state)) return "partial";
  if (/SELECTED_NATIVE|FULL/i.test(adoptionReview.state)) return "behavior_complete";
  return "adapter_only";
}

function boundaryFor() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
    executes_tests: "No",
    executes_migrations: "No",
    changes_ci_or_hooks: "No",
  };
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const impact = evidence.impact_classification;
  const excludedRows = impact.excluded_high_impact_surfaces.map((item) => `| ${item.surface} | ${item.excluded} | ${item.reason} |`).join("\n") || "| N/A | N/A | N/A |";
  const mappingRows = evidence.existing_project_mapping.map((item) => `| ${item.required_behavior} | ${item.project_native_evidence_ref} | ${item.project_native_evidence_digest} | ${item.project_native_evidence_owner} | ${item.project_native_evidence_scope} | ${item.project_native_task_match} | ${item.mapping_state} | ${item.stronger_project_rule_preserved} | ${item.reason} |`).join("\n") || "| N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |";
  const sourceRows = evidence.source_chain.map((item) => `| ${item.name} | ${item.status} | ${item.ref} | ${item.current_task_match} |`).join("\n");
  return `# Task Governance Report

This report classifies task impact and routes required governance. It does not authorize implementation or completion.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | ${evidence.user_prompt.plain_user_summary} |
| Task impact | \`${impact.task_impact}\` |
| Plain next step | ${evidence.user_prompt.plain_next_step} |
| Ready for implementation review | \`${evidence.readiness.ready_for_implementation_review}\` |
| Implementation authorized by this report | \`${evidence.readiness.implementation_authorized_by_this_report}\` |
| Can claim done | \`${evidence.readiness.can_claim_done}\` |
| Review level | \`${evidence.review_policy.review_level}\` |

## Impact Classification

| Field | Value |
| --- | --- |
| Confidence | \`${impact.confidence}\` |
| Task kind | \`${impact.task_kind}\` |
| Triggered surfaces | ${impact.triggered_surfaces.join(", ") || "none"} |
| Low impact reason | ${impact.low_impact_reason || "N/A"} |
| Medium impact reason | ${impact.medium_impact_reason || "N/A"} |
| Upgrade history | ${impact.upgrade_history.join(", ") || "none"} |

## Excluded High-Impact Surfaces

| Surface | Excluded | Reason |
| --- | --- | --- |
${excludedRows}

## Required Before Implementation Review

| Requirement | Required |
| --- | --- |
| Scope check | \`${evidence.required_before_implementation_review.scope_check_required}\` |
| Short plan | \`${evidence.required_before_implementation_review.short_plan_required}\` |
| Business Rule Closure | \`${evidence.required_before_implementation_review.business_rule_closure_required}\` |
| Change Impact Coverage | \`${evidence.required_before_implementation_review.change_impact_coverage_required}\` |
| Execution Plan | \`${evidence.required_before_implementation_review.execution_plan_required}\` |
| Verification Plan | \`${evidence.required_before_implementation_review.verification_plan_required}\` |

## Required Before Completion Claim

| Requirement | Required |
| --- | --- |
| Test Evidence | \`${evidence.required_before_completion_claim.test_evidence_required}\` |
| Execution Assurance | \`${evidence.required_before_completion_claim.execution_assurance_required}\` |
| Completion Evidence | \`${evidence.required_before_completion_claim.completion_evidence_required}\` |

## Review Policy

| Field | Value |
| --- | --- |
| Review level | \`${evidence.review_policy.review_level}\` |
| Codex self-check required | \`${evidence.review_policy.codex_self_check_required}\` |
| Independent review required | \`${evidence.review_policy.independent_review_required}\` |
| Review must happen before | \`${evidence.review_policy.review_must_happen_before}\` |
| Review source | \`${evidence.review_policy.review_source}\` |
| Review must cover | ${evidence.review_policy.review_must_cover.join("; ")} |
| Skip full review reason | ${evidence.review_policy.skip_full_review_reason} |

## Existing Project Mapping

| Required Behavior | Project-Native Evidence | Digest | Owner | Scope | Task Match | State | Stronger Rule Preserved | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${mappingRows}

## Source Chain

| Source | Status | Ref | Task Match |
| --- | --- | --- | --- |
${sourceRows}

## Lightweight Close-Out

| Field | Value |
| --- | --- |
| Scope unchanged | \`${evidence.lightweight_closeout.scope_unchanged}\` |
| Minimal verification status | \`${evidence.lightweight_closeout.minimal_verification_status}\` |
| Targeted verification status | \`${evidence.lightweight_closeout.targeted_verification_status}\` |
| Unrelated edits | \`${evidence.lightweight_closeout.unrelated_edits}\` |
| Remaining risk | ${evidence.lightweight_closeout.remaining_risk || "none"} |

## Readiness

| Field | Value |
| --- | --- |
| Governance prerequisites satisfied | \`${evidence.readiness.governance_prerequisites_satisfied}\` |
| Ready for implementation review | \`${evidence.readiness.ready_for_implementation_review}\` |
| Implementation authorized by this report | \`${evidence.readiness.implementation_authorized_by_this_report}\` |
| Can claim done | \`${evidence.readiness.can_claim_done}\` |
| Blocked by | ${evidence.readiness.blocked_by.join("; ") || "none"} |

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | \`${evidence.boundaries.writes_target_files}\` |
| Authorizes implementation | \`${evidence.boundaries.authorizes_implementation}\` |
| Approves commit or push | \`${evidence.boundaries.approves_commit_or_push}\` |
| Approves release or production | \`${evidence.boundaries.approves_release_or_production}\` |
| Executes tests | \`${evidence.boundaries.executes_tests}\` |
| Executes migrations | \`${evidence.boundaries.executes_migrations}\` |
| Changes CI or hooks | \`${evidence.boundaries.changes_ci_or_hooks}\` |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function taskKindFor(text) {
  if (/\b(readme|doc|docs|documentation|link|typo)\b|文档|错别字|链接/.test(text)) return "docs_only";
  if (/\btest name|test title|测试名称|测试文案\b/.test(text)) return "test_docs_only";
  if (/\bcopy|text|label|wording\b|文案|标签/.test(text)) return "copy";
  if (/\bspacing|style|visual|css|颜色|间距|样式/.test(text)) return "visual_only";
  if (/\bdeploy|release|ci|hook|rollback|生产|发布|上线/.test(text)) return "release_behavior";
  if (/\bmigration|schema|backfill|迁移|表结构/.test(text)) return "migration_behavior";
  if (/\bconfig|env|docker|配置|环境/.test(text)) return "config_behavior";
  return "code_behavior";
}

function highImpactPatterns() {
  return [
    ["DB / migration", /\b(db|database|schema|migration|backfill|sql|postgres)\b|数据库|迁移|表结构/],
    ["API contract", /\b(api contract|public api|dto|domain boundary|compatibility|endpoint)\b|接口契约|对外接口|兼容/],
    ["runtime workflow state", /\b(state machine|workflow state|runtime state|transition|final step|last step)\b|状态机|状态推进|流程状态|最后一步/],
    ["review approval settlement", /\b(review|approval|settlement|billing|payment|finance|tax|hr)\b|审批|审核|结算|支付|财务|税务|人资/],
    ["permission security", /\b(auth|permission|role|rbac|audit|privacy|customer data|security)\b|权限|角色|审计|隐私|客户数据|安全/],
    ["release production", /\b(release|deploy|production|rollback|ci|hook|environment|docker)\b|发布|上线|生产|回滚|环境|钩子/],
    ["scheduled jobs", /\b(cron|scheduled|recurring|background job|queue|worker|snapshot)\b|定时|周期|后台任务|队列|快照/],
  ];
}

function possibleHighPatterns() {
  return [
    ["uncertain data impact", /\b(maybe|possible|might|unknown|unclear)\b.*\b(data|state|permission|api)\b|可能.*(数据|状态|权限|接口)/],
    ["rule change", /\b(rule|restriction|limit|policy)\b|规则|限制|策略/],
  ];
}

function mediumPatterns() {
  return [
    ["local frontend interaction", /\b(local|component|frontend|interaction|modal|tab|form)\b|局部|组件|前端交互/],
    ["list filter display", /\b(filter|sort|display|list|validation)\b|筛选|排序|展示|校验/],
    ["internal parameter", /\binternal query|display parameter|non-critical parameter\b|内部参数/],
  ];
}

function lowPatterns() {
  return [
    ["copy docs visual", /\b(copy|text|typo|readme|docs|documentation|label|spacing|style|visual|link)\b|文案|错别字|说明|标签|间距|样式|链接/],
  ];
}

function matchPatterns(text, patterns) {
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

function surfacesFor(impact, highMatches, mediumMatches, lowMatches, possibleMatches) {
  if (impact === "HIGH") return highMatches;
  if (impact === "POSSIBLE_HIGH") return possibleMatches;
  if (impact === "MEDIUM") return mediumMatches;
  return lowMatches.length > 0 ? ["local text/docs/visual surface"] : ["small local surface"];
}

function triggerEvidenceFor(impact, highMatches, mediumMatches, lowMatches, possibleMatches) {
  if (impact === "HIGH") return highMatches.map((item) => `Intent matched high-impact surface: ${item}`);
  if (impact === "POSSIBLE_HIGH") return possibleMatches.map((item) => `Intent matched possible high-impact signal: ${item}`);
  if (impact === "MEDIUM") return mediumMatches.map((item) => `Intent matched bounded behavior signal: ${item}`);
  return lowMatches.length > 0 ? lowMatches.map((item) => `Intent matched low-impact signal: ${item}`) : ["No high-impact signal detected."];
}

function excludedHighImpactSurfacesFor(impact, triggeredSurfaces) {
  const surfaces = ["DB", "API contract", "runtime state", "permission", "business rule", "release/production", "CI/hooks"];
  const triggeredCategories = triggeredHighSurfaceCategories(triggeredSurfaces);
  return surfaces.map((surface) => ({
    surface,
    excluded: impact === "LOW" || impact === "MEDIUM" ? "Yes" : triggeredCategories.has(surface) ? "No" : "Yes",
    reason: impact === "LOW" || impact === "MEDIUM"
      ? `No ${surface} impact is indicated by the task intent.`
      : triggeredCategories.has(surface)
        ? `${surface} is part of the triggered high-impact surface.`
        : `No ${surface} impact is indicated by the current classification.`,
  }));
}

function triggeredHighSurfaceCategories(triggeredSurfaces) {
  const categories = new Set();
  for (const item of triggeredSurfaces) {
    const value = item.toLowerCase();
    if (/db|database|schema|migration/.test(value)) categories.add("DB");
    if (/api|contract|dto|domain/.test(value)) categories.add("API contract");
    if (/runtime|workflow state|state|scheduled|queue|worker|job/.test(value)) categories.add("runtime state");
    if (/permission|security|auth|role|rbac|audit|privacy/.test(value)) categories.add("permission");
    if (/review|approval|settlement|billing|payment|finance|tax|hr|business/.test(value)) categories.add("business rule");
    if (/release|production|deploy|rollback|environment|docker/.test(value)) categories.add("release/production");
    if (/ci|hook|release|production|deploy|rollback/.test(value)) categories.add("CI/hooks");
  }
  return categories;
}

function matchJsonField(content, field) {
  const pattern = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`);
  return content.match(pattern)?.[1] || "";
}

function matchJsonNestedState(content) {
  return content.match(/"adoption_recommendation"\s*:\s*\{[\s\S]*?"state"\s*:\s*"([^"]+)"/)?.[1] || "";
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry))
    .filter((file) => fs.statSync(file).isFile());
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested)) {
    console.error(`FAIL --out must be a relative path inside target project: ${requested}`);
    process.exit(1);
  }
  const resolved = path.resolve(root, requested);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error(`FAIL --out must stay inside target project: ${requested}`);
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "task";
}
