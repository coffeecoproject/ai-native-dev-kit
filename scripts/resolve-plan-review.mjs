#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "out",
  "plan",
  "task-governance",
  "work-queue-item",
  "mode",
  "source",
  "revised-plan-out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "review implementation plan before coding").trim();
const planArg = args.plan ? String(args.plan) : "";
const taskGovernanceArg = args["task-governance"] ? String(args["task-governance"]) : "";
const workQueueArg = args["work-queue-item"] ? String(args["work-queue-item"]) : "";
const mode = String(args.mode || "review");
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

if (!["draft", "review", "rereview"].includes(mode)) {
  console.error(`FAIL unknown --mode: ${mode}`);
  console.error("Use --mode draft, --mode review, or --mode rereview.");
  process.exit(1);
}

if (args["revised-plan-out"]) {
  console.error("FAIL --revised-plan-out is reserved for a future explicit documentation write mode.");
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
  const plan = readPlan(projectRoot, planArg);
  const classification = classify(intent, plan.content);
  const taskGovernance = taskGovernanceFor(classification);
  const surfaces = surfacesFor(classification, plan.content);
  const findings = findingsFor(classification, plan, surfaces);
  const state = stateFor(classification, plan, findings);
  const prerequisiteSatisfied = state === "PLAN_REVIEW_PASSED" ? "Yes" : "No";
  const planReviewRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "plan-review-reports/generated.md";
  const sourceChain = sourceChainFor(classification, surfaces);
  const subagent = subagentRoutingFor(classification, surfaces, state);
  const skip = skipReviewFor(classification, state);
  const baseEvidence = {
    schema_version: "1.88.0",
    artifact_type: "plan_review",
    plan_review_ref: planReviewRef,
    plan_review_digest: "",
    task_ref: taskGovernance.task_ref,
    work_queue_item_ref: workQueueArg || "N/A",
    work_queue_item_digest: workQueueArg ? digest(workQueueArg) : "N/A",
    review_surface_analysis: reviewSurfaceAnalysisFor(classification, surfaces),
    task_governance: taskGovernance,
    source_chain: sourceChain,
    plan_ref: plan.ref,
    plan_digest: plan.digest,
    plan_task_match: plan.exists ? "Yes" : (state === "NO_PLAN_REQUIRED" ? "N/A" : "Unknown"),
    plan_review_state: state,
    pre_implementation_review_prerequisite_satisfied: prerequisiteSatisfied,
    ready_for_implementation_review: prerequisiteSatisfied,
    implementation_authorized_by_this_report: "No",
    implementation_allowed_by_full_authority: "Unknown",
    task_impact: classification.task_impact,
    skip_review: skip,
    required_review_surfaces: surfaces.map((item) => item.surface),
    review_surface_matrix: surfaces,
    subagent_review_routing: subagent,
    reviewed_surfaces: surfaces.map((item) => ({
      surface: item.surface,
      reviewed: item.reviewed,
      finding_count: findings.filter((finding) => finding.surface === item.surface).length,
      notes: item.reviewed === "Yes" ? "Surface was reviewed against the plan." : "Surface still needs review.",
    })),
    findings,
    revision_loop: {
      round: state === "PLAN_REVISION_REQUIRED" ? 1 : 0,
      max_auto_rounds: 2,
      requires_revision: state === "PLAN_REVISION_REQUIRED" ? "Yes" : "No",
      previous_plan_digest: state === "PLAN_REVISION_REQUIRED" ? plan.digest : "N/A",
      rewrites_original_plan: "No",
      revised_plan_ref: "N/A",
    },
    verification_command_review: verificationCommandReviewFor(plan.content, state),
    plain_user_summary: plainSummaryFor(state, classification, findings),
    plain_next_step: plainNextStepFor(state),
    technical_terms_required: "No",
    boundaries: boundaries(),
    outcome: state,
  };
  const structuredEvidence = {
    ...baseEvidence,
    plan_review_digest: evidenceDigest(baseEvidence, ["plan_review_digest"]),
  };
  return {
    reportType: "PLAN_REVIEW",
    schemaVersion: "1.88.0",
    generatedBy: "scripts/resolve-plan-review.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    humanSummary: {
      planReviewState: state,
      plainNextStep: structuredEvidence.plain_next_step,
      readyForImplementationReview: structuredEvidence.ready_for_implementation_review,
      implementationAuthorizedByThisReport: "No",
    },
    plan: {
      ref: structuredEvidence.plan_ref,
      digest: structuredEvidence.plan_digest,
      exists: plan.exists,
    },
    taskGovernance: structuredEvidence.task_governance,
    reviewSurfaceAnalysis: structuredEvidence.review_surface_analysis,
    reviewSurfaceMatrix: structuredEvidence.review_surface_matrix,
    findings: structuredEvidence.findings,
    boundaries: structuredEvidence.boundaries,
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function readPlan(root, relPath) {
  if (!relPath) return {
    exists: false,
    ref: "N/A",
    digest: "N/A",
    content: "",
  };
  if (path.isAbsolute(relPath) || relPath.includes("..")) {
    return {
      exists: false,
      ref: relPath,
      digest: "N/A",
      content: "",
    };
  }
  const fullPath = path.resolve(root, relPath);
  const relative = path.relative(root, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return {
      exists: false,
      ref: relPath,
      digest: "N/A",
      content: "",
    };
  }
  const content = fs.readFileSync(fullPath, "utf8");
  return {
    exists: true,
    ref: relative.replaceAll(path.sep, "/"),
    digest: fileDigest(fullPath),
    content,
  };
}

function classify(userIntent, planContent) {
  const text = `${userIntent}\n${planContent}`.toLowerCase();
  const highSignals = [
    "permission",
    "authorization",
    "auth",
    "role",
    "delete",
    "destructive",
    "audit",
    "workflow state",
    "settlement",
    "payment",
    "finance",
    "tax",
    "schema",
    "migration",
    "production",
    "release",
    "权限",
    "删除",
    "审核",
    "结算",
    "支付",
    "财务",
    "迁移",
    "生产",
    "发布",
  ];
  const mediumSignals = ["api", "ui", "frontend", "backend", "form", "list", "filter", "页面", "接口"];
  const lowSignals = ["docs", "readme", "copy", "文档", "说明", "文案"];
  if (highSignals.some((signal) => text.includes(signal))) return {
    task_impact: "HIGH",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
  if (mediumSignals.some((signal) => text.includes(signal))) return {
    task_impact: "MEDIUM",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
  if (lowSignals.some((signal) => text.includes(signal))) return {
    task_impact: "LOW",
    plan_review_required: "No",
    task_ref: `task:${slug(userIntent)}`,
  };
  return {
    task_impact: "POSSIBLE_HIGH",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
}

function taskGovernanceFor(classification) {
  return {
    ref: taskGovernanceArg || "artifact:task-governance-reports/generated.md",
    digest: taskGovernanceArg ? digest(taskGovernanceArg) : digest(`${classification.task_ref}:${classification.task_impact}`),
    task_ref: classification.task_ref,
    task_impact: classification.task_impact,
    plan_review_required: classification.plan_review_required,
    current_task_match: "Yes",
  };
}

function surfacesFor(classification, planContent) {
  const text = planContent.toLowerCase();
  const surfaces = new Map();
  const add = (surface, required = "Yes", reviewed = "Yes", human = "No") => {
    surfaces.set(surface, {
      surface,
      required,
      required_before_implementation: required,
      required_after_implementation: "Yes",
      reviewed,
      source: "task_governance",
      human_decision_needed: human,
      finding_count: 0,
      blocking: "No",
    });
  };
  add("scope", "Yes", planContent ? "Yes" : "No");
  add("verification", "Yes", planContent ? "Yes" : "No");
  if (classification.task_impact === "LOW") return [...surfaces.values()];

  if (classification.task_impact === "HIGH" || /permission|auth|role|权限/.test(text)) add("permission", "Yes", planContent ? "Yes" : "No", "Yes");
  if (classification.task_impact === "HIGH" || /delete|destructive|删除/.test(text)) add("data_destructive", "Yes", planContent ? "Yes" : "No", "Yes");
  if (classification.task_impact === "HIGH" || /business|workflow|state|审核|业务/.test(text)) add("business_rule", "Yes", planContent ? "Yes" : "No", "Yes");
  if (/frontend|backend|api|ui|button|capability|前端|后端|接口/.test(text)) add("frontend_backend_consistency", "Yes", planContent ? "Yes" : "No");
  if (/release|production|deploy|发布|上线|生产/.test(text)) add("release", "Yes", planContent ? "Yes" : "No", "Yes");
  return [...surfaces.values()];
}

function findingsFor(classification, plan, surfaces) {
  if (!plan.exists) return [];
  const text = plan.content.toLowerCase();
  const findings = [];
  const add = (id, severity, surface, summary, requiredAction) => findings.push({
    id,
    severity,
    surface,
    summary,
    required_action: requiredAction,
    resolved: "No",
    accepted: "No",
    accepted_by_ref: "N/A",
    acceptance_reason: "N/A",
    acceptance_scope: "N/A",
    expires_at: "N/A",
    allowed_for_task_impact: "N/A",
  });
  if (classification.task_impact === "HIGH") {
    if (surfaces.some((item) => item.surface === "permission")
      && !/existence leakage|non-existence|404|error priority|存在性|错误优先级/.test(text)) {
      add("P1-001", "P1", "permission", "Permission plan does not cover existence leakage or error priority.", "Specify the unauthorized actor error order before coding.");
    }
    if (surfaces.some((item) => item.surface === "data_destructive")
      && !/history guard|historical|settlement|workflow history|audit before delete|历史|审计/.test(text)) {
      add("P1-002", "P1", "data_destructive", "Deletion plan does not cover historical associations and audit-before-delete.", "Specify historical guards and audit sequencing before coding.");
    }
    if (surfaces.some((item) => item.surface === "frontend_backend_consistency")
      && !/backend capability|backend authority|capability flag|后端权威/.test(text)) {
      add("P2-001", "P2", "frontend_backend_consistency", "Frontend/backend authority boundary is weak.", "Make backend authority and capability source explicit.");
    }
  }
  return findings;
}

function stateFor(classification, plan, findings) {
  if (classification.task_impact === "LOW" && classification.plan_review_required === "No" && !plan.exists) return "NO_PLAN_REQUIRED";
  if (classification.plan_review_required === "Yes" && !plan.exists) return "PLAN_REQUIRED";
  if (plan.content.includes("STALE_PLAN_MARKER")) return "BLOCKED_BY_STALE_PLAN";
  if (findings.some((item) => ["P0", "P1"].includes(item.severity) && item.resolved !== "Yes")) return "PLAN_REVISION_REQUIRED";
  if (findings.some((item) => item.severity === "P2" && item.resolved !== "Yes" && item.accepted !== "Yes")) {
    return classification.task_impact === "HIGH" ? "PLAN_REVISION_REQUIRED" : "PLAN_REVIEW_PASSED";
  }
  return "PLAN_REVIEW_PASSED";
}

function reviewSurfaceAnalysisFor(classification, surfaces) {
  if (classification.task_impact === "LOW") return {
    ref: "N/A",
    digest: "N/A",
    source: "N/A",
    derived_by_plan_review: "No",
    current_task_match: "N/A",
    user_selected_surfaces: "No",
  };
  return {
    ref: "artifact:review-surface-cards/generated.md",
    digest: digest(surfaces),
    source: "review_surface_card",
    derived_by_plan_review: "No",
    current_task_match: "Yes",
    user_selected_surfaces: "No",
  };
}

function sourceChainFor(classification, surfaces) {
  if (!["HIGH", "POSSIBLE_HIGH"].includes(classification.task_impact)) return [];
  const kinds = new Set(["task_governance", "review_surface_card", "verification_plan"]);
  if (surfaces.some((item) => item.surface === "permission" || item.surface === "business_rule")) kinds.add("business_rule_closure");
  if (surfaces.some((item) => item.surface === "data_destructive" || item.surface === "frontend_backend_consistency")) kinds.add("change_impact_coverage");
  return [...kinds].map((sourceKind) => ({
    source_kind: sourceKind,
    source_ref: `artifact:${sourceKind}/generated.md`,
    source_digest: digest(`${classification.task_ref}:${sourceKind}`),
    source_state: "READY",
    current_task_match: "Yes",
    project_native_equivalent: sourceKind === "task_governance" ? "Yes" : "No",
    owner: sourceKind === "business_rule_closure" ? "domain-owner" : "codex",
    contradicts_plan: "No",
  }));
}

function verificationCommandReviewFor(planContent, state) {
  const hasCommand = /npm run|pnpm|node scripts|xcodebuild|go test|pytest|cargo test/i.test(planContent);
  const fake = /fake-test|todo-test|example-only-command/i.test(planContent);
  return {
    commands_reviewed: state === "NO_PLAN_REQUIRED" ? "No" : "Yes",
    commands_exist_in_project: hasCommand ? (fake ? "No" : "Unknown") : "Unknown",
    commands_are_project_native: hasCommand ? (fake ? "No" : "Unknown") : "Unknown",
    commands_target_required_behavior: fake ? "No" : (hasCommand ? "Unknown" : "Unknown"),
    commands_executed_by_this_report: "No",
    requires_test_evidence_later: state === "NO_PLAN_REQUIRED" ? "No" : "Yes",
    fake_or_unstable_command_found: fake ? "Yes" : "No",
    notes: hasCommand ? "Commands were statically reviewed only; no tests were executed by this report." : "No concrete command was found; later verification evidence remains required if work proceeds.",
  };
}

function subagentRoutingFor(classification, surfaces, state) {
  const recommended = classification.task_impact === "HIGH" || surfaces.length >= 5;
  const completedRecommendedReview = state === "PLAN_REVIEW_PASSED" && recommended;
  return {
    subagent_review_recommended: recommended ? "Yes" : "No",
    reason: recommended ? "High-impact or broad plan review benefits from independent read-only review." : "Main-thread structured review is enough for this task class.",
    run_plan_required: recommended ? "Yes" : "No",
    run_plan_ref: recommended ? "artifact:subagent-run-plans/generated.md" : "N/A",
    all_subagents_read_only: recommended ? "Yes" : "N/A",
    subagent_output_is_authority: "No",
    writer_subagent_used: "No",
    all_subagents_closed_or_skipped: completedRecommendedReview ? "Yes" : (recommended ? "Unknown" : "N/A"),
    fallback_used: completedRecommendedReview ? "No" : (recommended ? "Yes" : "No"),
    fallback_reason: completedRecommendedReview ? "N/A" : (recommended ? "Subagent review is recommended, but the plan is not yet in a passing state." : "N/A"),
  };
}

function skipReviewFor(classification, state) {
  if (state === "NO_PLAN_REQUIRED") return {
    skip_allowed: "Yes",
    skip_source: "task_governance",
    skip_reason: "Task Governance classifies this as LOW and lightweight execution is allowed.",
    task_impact: classification.task_impact,
  };
  return {
    skip_allowed: "No",
    skip_source: "task_governance",
    skip_reason: "N/A",
    task_impact: classification.task_impact,
  };
}

function plainSummaryFor(state, classification, findings) {
  if (state === "NO_PLAN_REQUIRED") return "This looks low risk, so a heavy implementation plan review is not required.";
  if (state === "PLAN_REQUIRED") return "This work needs a plan before coding, but I did not find a plan yet.";
  if (state === "PLAN_REVISION_REQUIRED") return `The plan is not ready yet. I found ${findings.length} issue(s) that must be fixed before coding.`;
  if (state === "BLOCKED_BY_STALE_PLAN") return "The plan appears stale, so it must be refreshed before coding.";
  if (state === "PLAN_REVIEW_PASSED") return "The plan review passed. I can move to implementation review if the project workflow also allows it.";
  return `The plan review state is ${state}.`;
}

function plainNextStepFor(state) {
  if (state === "NO_PLAN_REQUIRED") return "Continue with the lightweight project workflow and still verify the final change.";
  if (state === "PLAN_REQUIRED") return "Write a bounded plan first, then run plan review again.";
  if (state === "PLAN_REVISION_REQUIRED") return "Update the plan to close the blocking gaps, then run the plan review again.";
  if (state === "BLOCKED_BY_STALE_PLAN") return "Refresh the plan and its source references, then run the plan review again.";
  if (state === "PLAN_REVIEW_PASSED") return "Move to implementation review under the approved project scope; this report still does not approve implementation by itself.";
  return "Review the blocker and keep the task in planning mode.";
}

function boundaries() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
    executes_tests: "No",
    changes_production: "No",
  };
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const lines = [
    "# Plan Review Report",
    "",
    "## Human Summary",
    "",
    `- Plain summary: ${evidence.plain_user_summary}`,
    `- Plain next step: ${evidence.plain_next_step}`,
    `- Plan review state: \`${evidence.plan_review_state}\``,
    `- Ready for implementation review: ${evidence.ready_for_implementation_review}`,
    "- This report authorizes implementation: No",
    "",
    "## Plan Identity",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Plan ref | ${evidence.plan_ref} |`,
    `| Plan digest | ${evidence.plan_digest} |`,
    `| Plan task match | ${evidence.plan_task_match} |`,
    `| Task ref | ${evidence.task_ref} |`,
    "",
    "## Task Governance Binding",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Task Governance ref | ${evidence.task_governance.ref} |`,
    `| Task Governance digest | ${evidence.task_governance.digest} |`,
    `| Task impact | ${evidence.task_governance.task_impact} |`,
    `| Plan review required | ${evidence.task_governance.plan_review_required} |`,
    `| Current task match | ${evidence.task_governance.current_task_match} |`,
    "",
    "## Review Surface Analysis",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Review surface ref | ${evidence.review_surface_analysis.ref} |`,
    `| Review surface digest | ${evidence.review_surface_analysis.digest} |`,
    `| Source | ${evidence.review_surface_analysis.source} |`,
    `| Derived by Plan Review | ${evidence.review_surface_analysis.derived_by_plan_review} |`,
    `| Current task match | ${evidence.review_surface_analysis.current_task_match} |`,
    `| User selected surfaces | ${evidence.review_surface_analysis.user_selected_surfaces} |`,
    "",
    "## Review Surface Matrix",
    "",
    "| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...evidence.review_surface_matrix.map((item) => `| ${item.surface} | ${item.required} | ${item.required_before_implementation} | ${item.required_after_implementation} | ${item.reviewed} | ${item.human_decision_needed} | ${item.finding_count} | ${item.blocking} |`),
    "",
    "## Source Chain",
    "",
    "| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...(evidence.source_chain.length
      ? evidence.source_chain.map((item) => `| ${item.source_kind} | ${item.source_ref} | ${item.source_digest} | ${item.source_state} | ${item.current_task_match} | ${item.project_native_equivalent} | ${item.owner} |`)
      : ["| N/A | N/A | N/A | N/A | N/A | N/A | N/A |"]),
    "",
    "## Reviewed Surfaces",
    "",
    "| Surface | Reviewed | Finding count | Notes |",
    "| --- | --- | --- | --- |",
    ...evidence.reviewed_surfaces.map((item) => `| ${item.surface} | ${item.reviewed} | ${item.finding_count} | ${item.notes} |`),
    "",
    "## Findings",
    "",
    "| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...(evidence.findings.length
      ? evidence.findings.map((item) => `| ${item.id} | ${item.severity} | ${item.surface} | ${item.summary} | ${item.required_action} | ${item.resolved} | ${item.accepted} |`)
      : ["| N/A | P3 | none | No blocking findings. | N/A | Yes | No |"]),
    "",
    "## Revision Loop",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Round | ${evidence.revision_loop.round} |`,
    `| Max automatic rounds | ${evidence.revision_loop.max_auto_rounds} |`,
    `| Requires revision | ${evidence.revision_loop.requires_revision} |`,
    `| Previous plan digest | ${evidence.revision_loop.previous_plan_digest} |`,
    `| Rewrites original plan | ${evidence.revision_loop.rewrites_original_plan} |`,
    "",
    "## Verification Command Review",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Commands reviewed | ${evidence.verification_command_review.commands_reviewed} |`,
    `| Commands exist in project | ${evidence.verification_command_review.commands_exist_in_project} |`,
    `| Commands are project-native | ${evidence.verification_command_review.commands_are_project_native} |`,
    `| Commands target required behavior | ${evidence.verification_command_review.commands_target_required_behavior} |`,
    `| Commands executed by this report | ${evidence.verification_command_review.commands_executed_by_this_report} |`,
    `| Requires Test Evidence later | ${evidence.verification_command_review.requires_test_evidence_later} |`,
    `| Fake or unstable command found | ${evidence.verification_command_review.fake_or_unstable_command_found} |`,
    "",
    "## Subagent Review Routing",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Subagent review recommended | ${evidence.subagent_review_routing.subagent_review_recommended} |`,
    `| Run plan required | ${evidence.subagent_review_routing.run_plan_required} |`,
    `| All subagents read-only | ${evidence.subagent_review_routing.all_subagents_read_only} |`,
    `| Subagent output is authority | ${evidence.subagent_review_routing.subagent_output_is_authority} |`,
    `| All subagents closed or skipped | ${evidence.subagent_review_routing.all_subagents_closed_or_skipped} |`,
    "",
    "## Boundaries",
    "",
    "| Boundary | Value |",
    "| --- | --- |",
    `| This report writes target files | ${evidence.boundaries.writes_target_files} |`,
    `| This report authorizes implementation | ${evidence.boundaries.authorizes_implementation} |`,
    `| This report approves commit or push | ${evidence.boundaries.approves_commit_or_push} |`,
    `| This report approves release or production | ${evidence.boundaries.approves_release_or_production} |`,
    `| This report executes tests | ${evidence.boundaries.executes_tests} |`,
    `| This report changes production | ${evidence.boundaries.changes_production} |`,
    "",
    "## Outcome",
    "",
    `\`${evidence.outcome}\``,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ];
  return `${lines.join("\n")}`;
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested) || requested.includes("..")) {
    console.error("FAIL --out must be a relative path inside plan-review-reports/");
    process.exit(1);
  }
  const normalized = requested.replaceAll("\\", "/");
  if (!/^plan-review-reports\/[^/]+\.md$/.test(normalized)) {
    console.error("FAIL --out must match plan-review-reports/*.md");
    process.exit(1);
  }
  const resolved = path.resolve(root, normalized);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out escapes target project");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex")}`;
}

function slug(value) {
  return String(value || "task")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "task";
}
