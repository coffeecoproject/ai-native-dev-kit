#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { sourceRequiredPaths } from "./lib/manifest.mjs";
import { walkFiles as walkProjectFiles } from "./lib/project-signals.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";
import { evidenceDigest, extractMachineReadableEvidence, validateSchema } from "./lib/artifact-schema.mjs";
import { initExecutableActions } from "./lib/adoption-apply-chain.mjs";
import { projectIdentity } from "./lib/evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import {
  loadReviewContextAuthority,
  reviewContextBindingFromMarkdown,
  validateReviewContextBinding,
} from "./lib/review-context-authority.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");

let failed = false;

function rel(fullPath) {
  return path.relative(kitRoot, fullPath) || ".";
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function exists(relativePath) {
  return fs.existsSync(path.join(kitRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(kitRoot, relativePath), "utf8");
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function writeInitProjectApprovalRecord(planPath, options = {}) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const actions = initExecutableActions(plan);
  const approvalPath = options.approvalPath || `${planPath}.approval.md`;
  let approval = {
    schema_version: "1.41.0",
    artifact_type: "approval_record",
    artifact_id: path.basename(approvalPath).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "init-project-approval",
    approval_status: "APPROVED",
    approved_by: "IntentOS self-check human fixture",
    approval_owner_type: "HUMAN",
    approved_plan: {
      path: options.planRef || path.basename(planPath),
      plan_digest: plan.planDigest,
    },
    approved_action_ids: actions.map((action) => action.id),
    approved_action_paths: actions.map((action) => ({
      id: action.id,
      target_paths: action.targetPaths,
    })),
    expires_at: "2099-12-31T23:59:00Z",
    plan_changed_after_approval: false,
    risk_acceptance: {
      high_risk_action_included: false,
      human_only_action_included: false,
    },
    rollback_reviewed: true,
    verification_reviewed: true,
    boundary: {
      writes_files_now: false,
      authorizes_automatic_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
      lets_codex_proceed_without_readiness: false,
    },
  };
  if (typeof options.mutate === "function") {
    approval = options.mutate(approval, plan, actions) || approval;
  }
  fs.writeFileSync(approvalPath, [
    "# Approval Record: init-project self-check",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(approval, null, 2),
    "```",
    "",
  ].join("\n"));
  return approvalPath;
}

function writeInitProjectReadinessRecord(planPath, options = {}) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const actions = initExecutableActions(plan);
  const readinessPath = options.readinessPath || `${planPath}.readiness.md`;
  const readiness = {
    schema_version: "1.41.0",
    artifact_type: "controlled_apply_readiness",
    artifact_id: path.basename(readinessPath).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "init-project-readiness",
    readiness_state: "READY_FOR_HUMAN_APPROVED_APPLY",
    can_codex_apply_now: false,
    requires_explicit_human_approval: true,
    can_proceed_without_new_approval: false,
    apply_plan: { path: options.planRef || path.basename(planPath), plan_digest: plan.planDigest },
    actions: actions.map((action) => ({ id: action.id, classification: "LOW_RISK_CANDIDATE", target_paths: action.targetPaths })),
    preconditions: [
      { name: "Apply plan exists", status: "pass" },
      { name: "Git state safe", status: "pass" },
      { name: "Target paths bounded", status: "pass" },
      { name: "Rollback ready", status: "pass" },
      { name: "Verification ready", status: "pass" }
    ],
    rollback: { required: true, path: ".intentos/backups", step: "Restore exact plan-bound backups", verification: "Compare pre-apply hashes" },
    verification: { pre_apply: "validate exact graph", post_apply: "workflow-next --json", evidence_path: plan.receiptPath },
    boundary: {
      writes_files_now: false,
      authorizes_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
    },
    outcome: "READINESS_RECORDED",
  };
  fs.writeFileSync(readinessPath, [
    "# Controlled Apply Readiness: init-project self-check",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(readiness, null, 2),
    "```",
    "",
  ].join("\n"));
  return readinessPath;
}

function approvedInitProjectApplyArgs(planPath, extraArgs = []) {
  const originalPlan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  fs.mkdirSync(originalPlan.targetRoot, { recursive: true });
  const localPlanDir = path.join(originalPlan.targetRoot, "apply-execution-plans");
  const approvalDir = path.join(originalPlan.targetRoot, "approval-records");
  const readinessDir = path.join(originalPlan.targetRoot, "apply-readiness-reports");
  fs.mkdirSync(localPlanDir, { recursive: true });
  fs.mkdirSync(approvalDir, { recursive: true });
  fs.mkdirSync(readinessDir, { recursive: true });
  const localPlanPath = path.join(localPlanDir, path.basename(planPath));
  if (path.resolve(planPath) !== path.resolve(localPlanPath)) fs.copyFileSync(planPath, localPlanPath);
  const planRef = `apply-execution-plans/${path.basename(planPath)}`;
  const approvalPath = writeInitProjectApprovalRecord(localPlanPath, {
    approvalPath: path.join(approvalDir, `${path.basename(planPath)}.approval.md`),
    planRef,
  });
  const readinessPath = writeInitProjectReadinessRecord(localPlanPath, {
    readinessPath: path.join(readinessDir, `${path.basename(planPath)}.readiness.md`),
    planRef,
  });
  return [
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    localPlanPath,
    "--approval-record",
    approvalPath,
    "--readiness-report",
    readinessPath,
    ...extraArgs,
  ];
}

function rewriteMachineEvidence(file, mutate) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/```json\s*([\s\S]*?)```/i);
  if (!match) throw new Error(`Machine-Readable Evidence JSON block not found: ${file}`);
  const evidence = JSON.parse(match[1]);
  const nextEvidence = mutate(evidence) || evidence;
  const nextContent = content.replace(match[0], [
    "```json",
    JSON.stringify(nextEvidence, null, 2),
    "```",
  ].join("\n"));
  fs.writeFileSync(file, nextContent);
}

function walkSourceFiles(dir) {
  return walkProjectFiles(path.join(kitRoot, dir));
}

function checkIntentOSNamingHardcut() {
  const scanRoots = [
    "README.md",
    "README.zh-CN.md",
    "VERSION.md",
    "package.json",
    "intentos-manifest.json",
    "schemas",
    "scripts",
    "templates",
    "core",
    "platforms",
    "docs",
    ".github",
  ];
  const allowedExceptions = new Set([
    "docs/plans/intentos-naming-hardcut-1.73-plan.md",
    "docs/plans/baseline-manifest-public-entry-consolidation-1.94-plan.md",
    "docs/source-only-adoption.md",
  ]);
  const extensions = [".md", ".mjs", ".json", ".yml", ".yaml"];
  const files = [];
  for (const item of scanRoots) {
    const fullPath = path.join(kitRoot, item);
    if (!fs.existsSync(fullPath)) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...walkProjectFiles(fullPath, { extensions }));
    } else {
      files.push(fullPath);
    }
  }

  const forbidden = [
    ["AI", "Native", "Dev", "Kit"].join(" "),
    ["AI", "Native"].join(" "),
    ["ai", "native", "dev", "kit"].join("-"),
    ["ai", "native"].join("-"),
    ["AI", "NATIVE"].join("_"),
    ["AI", "NATIVE", "BOOTSTRAPPED", "PROJECT"].join("_"),
    ["DEV", "KIT"].join("_"),
    ["DEV", "KIT", "REPOSITORY"].join("_"),
    ["DEV", "KIT", "SOURCE"].join("_"),
    ["RUN", "DEV", "KIT", "SELF", "CHECK"].join("_"),
    ["AI", "NATIVE"].join("-"),
    ["Dev", "Kit"].join(" "),
    ["Dev", "kit"].join("-"),
    ["dev", "kit"].join("-"),
    ["dev", "Kit"].join(""),
    `.${["ai", "native"].join("-")}`,
    ["Command", "aliases:"].join(" "),
    ["dev", "kit"].join(" "),
  ];
  const findings = [];
  for (const file of files) {
    const relativePath = rel(file);
    if (allowedExceptions.has(relativePath)) continue;
    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const term of forbidden) {
      if (content.includes(term)) findings.push(`${relativePath}: ${term}`);
    }
  }

  if (findings.length > 0) {
    fail(`IntentOS naming hardcut drift found: ${findings.slice(0, 20).join("; ")}`);
    return;
  }
  pass("IntentOS naming hardcut active surfaces are clean");
}

function checkRequiredFiles() {
  const required = sourceRequiredPaths(kitRoot, { fallback: [
    "README.md",
    "README.zh-CN.md",
    "LICENSE.md",
    "VERSION.md",
    "package.json",
    "docs/start-here.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/quickstart.md",
    "docs/codex-usage.md",
    "docs/mental-model.md",
    "docs/README.md",
    "docs/index.md",
    "docs/repository-structure.md",
    "docs/document-ownership.md",
    "docs/plans/README.md",
    "docs/artifact-decision-tree.md",
    "docs/goal-subagent-usage.md",
    "docs/roadmaps/governance-hardening-roadmap.md",
    "docs/roadmaps/README.md",
    "docs/plans/productization-hardcut-1.0-plan.md",
    "docs/plans/existing-project-native-adoption-decision-1.69-plan.md",
    "docs/plans/product-adoption-trust-finalization-1.68.2-plan.md",
    "docs/plans/product-adoption-trust-hardening-1.68.1-plan.md",
    "docs/plans/product-adoption-simplification-1.68-plan.md",
    "intentos-manifest.json",
    "schemas/intentos-manifest.schema.json",
    ".github/workflows/intentos-pr-checks.yml",
    ".github/workflows/intentos-release-checks.yml",
    ".github/pull_request_template.md",
    ".github/CODEOWNERS",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "requests/034-baseline-freeze-self-ci.md",
    "preflight/034-baseline-freeze-self-ci.md",
    "specs/034-baseline-freeze-self-ci.md",
    "evals/034-baseline-freeze-self-ci.md",
    "tasks/034-baseline-freeze-self-ci.md",
    "goal-cards/034-baseline-freeze-self-ci.md",
    "subagent-run-plans/034-baseline-freeze-self-ci.md",
    "review-packets/034-baseline-freeze-self-ci.md",
    "review-loop-reports/034-baseline-freeze-self-ci.md",
    "final-reports/034-baseline-freeze-self-ci.md",
    "releases/0.33.0/baseline-freeze.md",
    "releases/0.33.0/self-check-report.md",
    "releases/0.34.0/phase-report.md",
    "requests/035-readonly-manifest.md",
    "preflight/035-readonly-manifest.md",
    "specs/035-readonly-manifest.md",
    "evals/035-readonly-manifest.md",
    "tasks/035-readonly-manifest.md",
    "goal-cards/035-readonly-manifest.md",
    "subagent-run-plans/035-readonly-manifest.md",
    "decision-briefs/035-readonly-manifest.md",
    "review-packets/035-readonly-manifest.md",
    "review-loop-reports/035-readonly-manifest.md",
    "final-reports/035-readonly-manifest.md",
    "releases/0.35.0/phase-report.md",
    "requests/036-cli-front-door.md",
    "preflight/036-cli-front-door.md",
    "specs/036-cli-front-door.md",
    "evals/036-cli-front-door.md",
    "tasks/036-cli-front-door.md",
    "goal-cards/036-cli-front-door.md",
    "subagent-run-plans/036-cli-front-door.md",
    "decision-briefs/036-cli-front-door.md",
    "review-packets/036-cli-front-door.md",
    "review-loop-reports/036-cli-front-door.md",
    "final-reports/036-cli-front-door.md",
    "releases/0.36.0/phase-report.md",
    "core/workflow.md",
    "core/task-levels.md",
    "core/gates.md",
    "core/platform-strategy.md",
    "core/extension-policy.md",
    "core/self-iteration.md",
    "core/skill-governance.md",
    "core/automation-governance.md",
    "core/project-onboarding.md",
    "core/engineering-baseline.md",
    "core/review-loop.md",
    "core/goal-mode.md",
    "core/subagent-orchestration.md",
    "core/next-step-boundary.md",
    "core/output-protocol.md",
    "core/glossary.md",
    "templates/request-card.md",
    "templates/preflight-report.md",
    "templates/spec.md",
    "templates/eval.md",
    "templates/task-card.md",
    "templates/ai-task-log.md",
    "templates/workflow-retro.md",
    "templates/workflow-improvement.md",
    "templates/workflow-daily-summary.md",
    "templates/dogfood-observation.md",
    "templates/adoption-assessment.md",
    "templates/existing-governance-map.md",
    "templates/review-packet.md",
    "templates/gpt-review-prompt.md",
    "templates/review-loop-report.md",
    "templates/goal-card.md",
    "templates/subagent-run-plan.md",
    "templates/follow-up-proposal.md",
    "templates/final-report.md",
    "templates/human-status-report.md",
    "templates/decision-brief.md",
    "templates/plain-review-summary.md",
    "templates/customer-handoff.md",
    "templates/output-quality-report.md",
    "templates/intentos-change-proposal.md",
    "templates/skill-candidate.md",
    "templates/project-automation-proposal.md",
    "templates/daily-automation-prompt.md",
    "templates/project-onboarding.md",
    "templates/engineering-baseline.md",
    "templates/project-profile.md",
    "templates/tech-stack-strategy.md",
    "templates/business-spec-index.md",
    "templates/sample-policy.md",
    "templates/onboarding-decisions.md",
    "templates/profile.md",
    "templates/starter-readiness.md",
    "templates/platform-risk-policy.md",
    "templates/verification-matrix.md",
    "templates/baseline-selection.md",
    "templates/baseline-evidence.md",
    "templates/workflow-version.json",
    "templates/version-record.md",
    "checklists/scope-gate.md",
    "checklists/risk-gate.md",
    "checklists/verification-gate.md",
    "checklists/release-gate.md",
    "checklists/profile-review.md",
    "checklists/starter-review.md",
    "checklists/industrial-pack-review.md",
    "checklists/core-purity-review.md",
    "checklists/self-iteration-review.md",
    "checklists/daily-summary-review.md",
    "checklists/skill-review.md",
    "checklists/automation-review.md",
    "checklists/project-onboarding-review.md",
    "checklists/engineering-baseline-review.md",
    "checklists/review-loop-review.md",
    "checklists/goal-mode-review.md",
    "checklists/subagent-orchestration-review.md",
    "checklists/next-step-boundary-review.md",
    "prompts/bootstrap-agent.md",
    "prompts/project-onboarding-agent.md",
    "prompts/goal-planner-agent.md",
    "prompts/engineering-baseline-agent.md",
    "prompts/reviewer-agent.md",
    "prompts/reporter-agent.md",
    "scripts/init-project.mjs",
    "scripts/check-ai-workflow.mjs",
    "scripts/check-intentos.mjs",
    "scripts/summarize-ai-logs.mjs",
    "scripts/check-workflow-version.mjs",
    "scripts/workflow-daily-summary.mjs",
    "scripts/check-project-onboarding.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-environment-baseline.mjs",
    "scripts/check-baseline-enforcement.mjs",
    "scripts/check-baseline-installation.mjs",
    "scripts/lib/baseline-selection.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-launch-readiness.mjs",
    "scripts/check-conversation-drift.mjs",
    "scripts/check-first-delivery-walkthrough.mjs",
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-guided-adoption.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/cli.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/check-manifest.mjs",
    "scripts/check-fixtures.mjs",
    "scripts/score-output-quality.mjs",
    "scripts/check-glossary-usage.mjs",
    "scripts/new-workflow-item.mjs",
    "scripts/workflow-next.mjs",
    "platforms/codex/AGENTS.template.md",
    "platforms/codex/quickstart.md",
    "platforms/cursor/rules-template.md",
    "platforms/claude/instructions.md",
    "platforms/github/ci-ai-workflow.yml",
    "platforms/github/pull_request_template.md",
    "profiles/web-app/baseline.json",
    "profiles/backend-api/baseline.json",
    "profiles/ios-app/baseline.json",
    "profiles/android-app/baseline.json",
    "profiles/wechat-miniprogram/baseline.json",
    "profiles/internal-admin/baseline.json",
    "profiles/high-risk-change/baseline.json",
    "industrial-packs/README.md",
    "industrial-packs/selection-guide.md",
    "industrial-packs/index.json",
    "industrial-packs/schema/pack.schema.json",
    "industrial-packs/schema/baseline-selection.schema.json",
    "industrial-packs/web-app/pack.md",
    "industrial-packs/web-app/pack.json",
    "industrial-packs/web-app/baselines/web-runtime-baseline.md",
    "industrial-packs/web-app/baselines/web-security-permission-baseline.md",
    "industrial-packs/web-app/baselines/web-release-readiness-baseline.md",
    "industrial-packs/web-app/baselines/web-interaction-api-baseline.md",
    "industrial-packs/web-app/baselines/web-performance-accessibility-baseline.md",
    "industrial-packs/web-app/executions/codex-web-industrial-execution.md",
    "industrial-packs/web-app/audit/web-existing-project-audit.md",
    "industrial-packs/web-app/audit/web-release-readiness.md",
    "industrial-packs/web-app/audit/web-runtime-quality-audit.md",
    "industrial-packs/web-app/checklists/web-ui-state-checklist.md",
    "industrial-packs/web-app/checklists/web-security-checklist.md",
    "industrial-packs/web-app/checklists/web-form-interaction-checklist.md",
    "industrial-packs/web-app/checklists/web-api-error-handling-checklist.md",
    "industrial-packs/web-app/checklists/web-performance-accessibility-checklist.md",
    "industrial-packs/web-app/templates/release-record.md",
    "industrial-packs/web-app/templates/incident-record.md",
    "industrial-packs/web-app/templates/web-runtime-evidence.md",
    "industrial-packs/web-app/bootstrap-kit/README.md",
    "industrial-packs/wechat-miniprogram/pack.md",
    "industrial-packs/wechat-miniprogram/pack.json",
    "industrial-packs/wechat-miniprogram/baselines/miniprogram-runtime-release-baseline.md",
    "industrial-packs/wechat-miniprogram/baselines/miniprogram-runtime-baseline.md",
    "industrial-packs/wechat-miniprogram/baselines/miniprogram-cloudbase-security-baseline.md",
    "industrial-packs/wechat-miniprogram/baselines/miniprogram-privacy-payment-baseline.md",
    "industrial-packs/wechat-miniprogram/baselines/miniprogram-release-readiness-baseline.md",
    "industrial-packs/wechat-miniprogram/executions/codex-miniprogram-industrial-execution.md",
    "industrial-packs/wechat-miniprogram/audit/miniprogram-existing-project-audit.md",
    "industrial-packs/wechat-miniprogram/audit/miniprogram-runtime-quality-audit.md",
    "industrial-packs/wechat-miniprogram/audit/miniprogram-release-readiness.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-release-checklist.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-ui-state-checklist.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-cloud-function-checklist.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-auth-permission-checklist.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-payment-checklist.md",
    "industrial-packs/wechat-miniprogram/checklists/miniprogram-release-review-checklist.md",
    "industrial-packs/wechat-miniprogram/templates/miniprogram-release-record.md",
    "industrial-packs/wechat-miniprogram/templates/miniprogram-runtime-evidence.md",
    "industrial-packs/wechat-miniprogram/templates/miniprogram-incident-record.md",
    "industrial-packs/wechat-miniprogram/bootstrap-kit/README.md",
    "industrial-pack-candidates/README.md",
    "industrial-pack-candidates/web-app/README.md",
    "starters/generic-project/AGENTS.md",
    "examples/generic-first-change/README.md",
    "examples/review-loop-l2-first-slice/README.md",
    "examples/review-loop-l2-first-slice/requests/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/preflight/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/specs/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/evals/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/tasks/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/review-packets/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/gpt-review-prompts/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/review-loop-reports/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/final-reports/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/follow-up-proposals/001-review-loop-l2-slice.md",
    "examples/review-loop-l2-first-slice/review-summaries/001-review-loop-l2-slice.md",
    "examples/web-internal-admin-first-slice/README.md",
    "examples/web-internal-admin-first-slice/request-card.md",
    "examples/web-internal-admin-first-slice/preflight-report.md",
    "examples/web-internal-admin-first-slice/spec.md",
    "examples/web-internal-admin-first-slice/eval.md",
    "examples/web-internal-admin-first-slice/task-card.md",
    "examples/web-internal-admin-first-slice/ai-task-log.example.md",
    "examples/web-industrial-bl2-first-slice/README.md",
    "examples/web-industrial-bl2-first-slice/docs/baseline-selection.md",
    "examples/web-industrial-bl2-first-slice/docs/baseline-evidence.md",
    "examples/web-industrial-bl2-first-slice/requests/001-web-runtime-quality.md",
    "examples/web-industrial-bl2-first-slice/preflight/001-web-runtime-quality.md",
    "examples/web-industrial-bl2-first-slice/specs/001-web-runtime-quality.md",
    "examples/web-industrial-bl2-first-slice/evals/001-web-runtime-quality.md",
    "examples/web-industrial-bl2-first-slice/tasks/001-web-runtime-quality.md",
    "examples/web-industrial-bl2-first-slice/evidence/web-runtime-evidence.md",
    "examples/web-industrial-bl2-first-slice/releases/001-web-runtime-quality-release.md",
    "examples/web-industrial-bl2-first-slice/ai-logs/2026-06-26-web-runtime-quality.md",
    "examples/miniprogram-industrial-bl2-first-slice/README.md",
    "examples/miniprogram-industrial-bl2-first-slice/docs/baseline-selection.md",
    "examples/miniprogram-industrial-bl2-first-slice/docs/baseline-evidence.md",
    "examples/miniprogram-industrial-bl2-first-slice/requests/001-miniprogram-login-cloud-read.md",
    "examples/miniprogram-industrial-bl2-first-slice/preflight/001-miniprogram-login-cloud-read.md",
    "examples/miniprogram-industrial-bl2-first-slice/specs/001-miniprogram-login-cloud-read.md",
    "examples/miniprogram-industrial-bl2-first-slice/evals/001-miniprogram-login-cloud-read.md",
    "examples/miniprogram-industrial-bl2-first-slice/tasks/001-miniprogram-login-cloud-read.md",
    "examples/miniprogram-industrial-bl2-first-slice/evidence/miniprogram-runtime-evidence.md",
    "examples/miniprogram-industrial-bl2-first-slice/releases/001-miniprogram-login-cloud-read-release.md",
    "examples/miniprogram-industrial-bl2-first-slice/ai-logs/2026-06-26-miniprogram-login-cloud-read.md",
    "examples/engineering-baseline-enum-vs-lookup/README.md",
    "examples/engineering-baseline-enum-vs-lookup/docs/engineering-baseline.md",
    "examples/engineering-baseline-enum-vs-lookup/decision-briefs/001-status-model-decision.md",
    "examples/engineering-baseline-api-dto-domain/README.md",
    "examples/engineering-baseline-api-dto-domain/docs/engineering-baseline.md",
    "examples/engineering-baseline-api-dto-domain/decision-briefs/001-dto-domain-boundary.md",
    "examples/next-step-boundary-suggestions/README.md",
    "examples/next-step-boundary-suggestions/final-reports/001-suggestions.md",
    "examples/goal-mode-first-route/README.md",
    "examples/goal-mode-first-route/goal-cards/001-define-work.md",
    "examples/subagent-orchestration-closed-run/README.md",
    "examples/subagent-orchestration-closed-run/subagent-run-plans/001-closed-review.md",
    "examples/goal-subagent-l2-feature/README.md",
    "examples/goal-subagent-l2-feature/docs/engineering-baseline.md",
    "examples/goal-subagent-l2-feature/goal-cards/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/subagent-run-plans/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/requests/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/preflight/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/specs/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/evals/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/tasks/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/review-packets/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/gpt-review-prompts/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/review-loop-reports/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/final-reports/001-project-status-filter.md",
    "examples/goal-subagent-l2-feature/follow-up-proposals/001-status-filter-lookup-admin.md",
    "examples/goal-subagent-l2-feature/review-summaries/001-project-status-filter.md",
    "test-fixtures/README.md",
    "test-fixtures/fixture-cases.json",
    "test-fixtures/bad/bad-engineering-baseline/docs/engineering-baseline.md",
    "test-fixtures/bad/bad-engineering-baseline-pending-decision/docs/engineering-baseline.md",
    "test-fixtures/bad/bad-review-loop/tasks/001-risky-dependency.md",
    "test-fixtures/bad/bad-review-loop/specs/001-risky-dependency.md",
    "test-fixtures/bad/bad-review-loop/evals/001-risky-dependency.md",
    "test-fixtures/bad/bad-review-loop/review-packets/001-risky-dependency.md",
    "test-fixtures/bad/bad-review-loop/review-loop-reports/001-risky-dependency.md",
    "test-fixtures/bad/bad-review-loop-too-many-rounds/tasks/001-auto-fix-rounds.md",
    "test-fixtures/bad/bad-review-loop-too-many-rounds/specs/001-auto-fix-rounds.md",
    "test-fixtures/bad/bad-review-loop-too-many-rounds/evals/001-auto-fix-rounds.md",
    "test-fixtures/bad/bad-review-loop-too-many-rounds/review-packets/001-auto-fix-rounds.md",
    "test-fixtures/bad/bad-review-loop-too-many-rounds/review-loop-reports/001-auto-fix-rounds.md",
    "test-fixtures/bad/bad-next-step-boundary/final-reports/001-boundary.md",
    "test-fixtures/bad/bad-next-step-risk-decision/final-reports/001-risk-decision.md",
    "test-fixtures/bad/bad-output-quality/final-reports/001-low-quality.md",
    "test-fixtures/bad/bad-glossary-usage/core/glossary.md",
    "test-fixtures/bad/bad-goal-mode-invalid/goal-cards/001-invalid-mode.md",
    "test-fixtures/bad/bad-goal-mode-readonly-write/goal-cards/001-readonly-write.md",
    "test-fixtures/bad/bad-subagent-unclosed/subagent-run-plans/001-unclosed.md",
    "test-fixtures/bad/bad-subagent-multiple-writers/subagent-run-plans/001-two-writers.md",
  ] });

  for (const file of required) {
    if (exists(file)) pass(file);
    else fail(`missing required file ${file}`);
  }
}

function checkDefaultStarter() {
  const content = read("scripts/init-project.mjs");
  if (content.includes('readExistingStarter(targetPath) || "generic-project"')) {
    pass("default starter falls back to generic-project");
  } else {
    fail("default starter must be generic-project");
  }
}

function currentVersion() {
  const content = read("VERSION.md");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function checkVersionMetadata() {
  const version = currentVersion();
  if (!version) {
    fail("VERSION.md missing current version");
    return;
  }

  const workflowVersion = JSON.parse(read("templates/workflow-version.json"));
  if (workflowVersion.intentOSVersion === version) {
    pass("templates/workflow-version.json matches current version");
  } else {
    fail(`templates/workflow-version.json version ${workflowVersion.intentOSVersion} does not match ${version}`);
  }

  const packageVersion = JSON.parse(read("package.json")).version;
  if (packageVersion === version) {
    pass("package.json matches current version");
  } else {
    fail(`package.json version ${packageVersion} does not match ${version}`);
  }

  const manifestVersion = JSON.parse(read("intentos-manifest.json")).intentOSVersion;
  if (manifestVersion === version) {
    pass("intentos-manifest.json matches current version");
  } else {
    fail(`intentos-manifest.json version ${manifestVersion} does not match ${version}`);
  }

  const readme = read("README.md");
  if (readme.includes(`Current release: \`${version}\`.`) && readme.includes(`releases/${version}/release-record.md`)) {
    pass("README.md current release matches current version");
  } else {
    fail(`README.md current release metadata must match ${version}`);
  }

  const chineseReadme = read("README.zh-CN.md");
  if (chineseReadme.includes(`当前版本：\`${version}\`。`) && chineseReadme.includes(`releases/${version}/release-record.md`)) {
    pass("README.zh-CN.md current release matches current version");
  } else {
    fail(`README.zh-CN.md current release metadata must match ${version}`);
  }

  const versionRecord = read("templates/version-record.md");
  if (versionRecord.includes(`\`${version}\``)) {
    pass("templates/version-record.md matches current version");
  } else {
    fail(`templates/version-record.md missing ${version}`);
  }

  for (const asset of [
    "AGENTS.md",
    "scripts/check-ai-workflow.mjs",
    "scripts/summarize-ai-logs.mjs",
    "scripts/check-workflow-version.mjs",
    "scripts/workflow-daily-summary.mjs",
    "scripts/check-project-onboarding.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-environment-baseline.mjs",
    "scripts/check-baseline-enforcement.mjs",
    "scripts/check-baseline-installation.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-real-adoption-trial.mjs",
    "scripts/check-patch-classification.mjs",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "scripts/resolve-document-lifecycle.mjs",
    "scripts/check-document-lifecycle.mjs",
    "scripts/resolve-document-archive-apply.mjs",
    "scripts/check-document-archive-apply.mjs",
    "scripts/resolve-apply-plan.mjs",
    "scripts/check-apply-plan.mjs",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
    "scripts/resolve-closure-decision.mjs",
    "scripts/check-closure-decision.mjs",
    "scripts/resolve-guided-closure.mjs",
    "scripts/check-guided-closure.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "scripts/resolve-hook-orchestration.mjs",
    "scripts/check-hook-orchestration.mjs",
    "scripts/resolve-hook-policy.mjs",
    "scripts/check-hook-policy.mjs",
    "scripts/resolve-workflow-guidance.mjs",
    "scripts/check-workflow-guidance.mjs",
    "scripts/resolve-review-surface.mjs",
    "scripts/check-review-surface.mjs",
    "scripts/resolve-business-rule-closure.mjs",
    "scripts/check-business-rule-closure.mjs",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-pack.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "scripts/resolve-baseline-packs.mjs",
    "scripts/check-baseline-pack-selection.mjs",
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/lib/baseline-selection.mjs",
    "scripts/lib/risk-surfaces.mjs",
    "scripts/lib/path-safety.mjs",
    "scripts/new-workflow-item.mjs",
    "scripts/start-project.mjs",
    "scripts/workflow-next.mjs",
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/verification-matrix.md",
    "docs/engineering-baseline.md",
    "review-packets",
    "gpt-review-prompts",
    "review-loop-reports",
    "goal-cards",
    "subagent-run-plans",
    "follow-up-proposals",
    "final-reports",
    "status-reports",
    "decision-briefs",
    "review-summaries",
    "customer-handoffs",
    ".intentos/profiles",
    ".intentos/industrial-packs",
    ".intentos/standard-baseline-packs",
    ".intentos/intentos-manifest.json",
    ".intentos/docs/artifact-decision-tree.md",
    ".intentos/docs/first-hour.md",
    ".intentos/docs/goal-subagent-usage.md",
    ".intentos/docs/baseline-setup.md",
    ".intentos/docs/guided-delivery-baseline.md",
    ".intentos/docs/product-baseline.md",
    ".intentos/docs/claim-control.md",
    ".intentos/docs/project-memory.md",
    ".intentos/docs/git-boundary.md",
    ".intentos/docs/context-governance-usage.md",
    ".intentos/docs/minimal-commit-set.md",
    ".intentos/docs/safe-launch.md",
    ".intentos/docs/conversation-drift-control.md",
    ".intentos/docs/first-delivery-walkthrough.md",
    ".intentos/docs/change-boundary.md",
    ".intentos/docs/baseline-state.md",
    ".intentos/docs/guided-delivery-check.md",
    ".intentos/docs/standard-baseline-pack-registry.md",
    ".intentos/docs/existing-project-workflow-adapter.md",
    ".intentos/docs/document-lifecycle.md",
    ".intentos/docs/beginner-entry.md",
    ".intentos/docs/work-queue.md",
    ".intentos/docs/hook-orchestration.md",
    ".intentos/docs/hook-policy.md",
    ".intentos/docs/natural-language-orchestrator.md",
    ".intentos/docs/business-rule-closure.md",
    ".intentos/docs/change-impact-coverage.md",
    ".intentos/docs/context-governance-usage.md",
    ".intentos/docs/minimal-commit-set.md",
    ".intentos/docs/safe-launch.md",
    ".intentos/docs/conversation-drift-control.md",
    ".intentos/core/outcome-baseline.md",
    ".intentos/core/product-baseline.md",
    ".intentos/core/claim-control.md",
    ".intentos/core/assumption-register.md",
    ".intentos/core/context-governance.md",
    ".intentos/core/git-boundary.md",
    ".intentos/core/safe-launch.md",
    ".intentos/core/conversation-drift-control.md",
    ".intentos/core/first-delivery-walkthrough.md",
    ".intentos/core/real-project-adoption-trial.md",
    ".intentos/core/patch-classification.md",
    ".intentos/core/existing-project-workflow-adapter.md",
    ".intentos/core/document-lifecycle.md",
    ".intentos/core/beginner-entry.md",
    ".intentos/core/work-queue.md",
    ".intentos/core/hook-orchestration.md",
    ".intentos/core/natural-language-orchestrator.md",
    ".intentos/core/unified-closure-model.md",
    ".intentos/core/review-surface-governance.md",
    ".intentos/core/business-rule-closure.md",
    ".intentos/core/change-impact-coverage.md",
    ".intentos/core/change-boundary.md",
    ".intentos/core/baseline-state.md",
    ".intentos/core/standard-baseline-pack-registry.md",
    ".intentos/core/safe-launch.md",
    ".intentos/core/conversation-drift-control.md",
    ".intentos/templates/learning-candidate.md",
    ".intentos/templates/context-correction-report.md",
    ".intentos/templates/git-boundary-report.md",
    ".intentos/templates/launch-readiness-report.md",
    ".intentos/templates/conversation-turn-classification.md",
    ".intentos/templates/scope-change-report.md",
    ".intentos/templates/adoption-trial-report.md",
    ".intentos/templates/real-adoption-trial-report.md",
    ".intentos/templates/patch-classification-report.md",
    ".intentos/templates/workflow-adoption-map.md",
    ".intentos/templates/document-lifecycle-report.md",
    ".intentos/templates/beginner-entry-card.md",
    ".intentos/templates/work-queue-report.md",
    ".intentos/templates/hook-orchestration-plan.md",
    ".intentos/templates/workflow-guidance-card.md",
    ".intentos/templates/closure-decision.md",
    ".intentos/templates/review-surface-card.md",
    ".intentos/templates/business-rule-closure-card.md",
    ".intentos/templates/change-impact-coverage-report.md",
    ".intentos/templates/user-decision-card.md",
    ".intentos/templates/change-boundary-report.md",
    ".intentos/templates/baseline-state-report.md",
    ".intentos/templates/standard-baseline-selection-report.md",
    ".intentos/templates/launch-readiness-report.md",
    ".intentos/templates/conversation-turn-classification.md",
    ".intentos/templates/scope-change-report.md",
    ".intentos/prompts/context-governance-agent.md",
    ".intentos/prompts/launch-readiness-agent.md",
    ".intentos/prompts/conversation-router-agent.md",
    ".intentos/prompts/walkthrough-agent.md",
    ".intentos/prompts/real-adoption-agent.md",
    ".intentos/prompts/patch-classifier-agent.md",
    ".intentos/prompts/workflow-adapter-agent.md",
    ".intentos/prompts/document-lifecycle-agent.md",
    ".intentos/prompts/beginner-entry-agent.md",
    ".intentos/prompts/work-queue-agent.md",
    ".intentos/prompts/hook-orchestration-agent.md",
    ".intentos/prompts/workflow-concierge-agent.md",
    ".intentos/prompts/review-surface-agent.md",
    ".intentos/prompts/business-rule-closure-agent.md",
    ".intentos/prompts/change-impact-coverage-agent.md",
    ".intentos/prompts/guided-delivery-check-agent.md",
    ".intentos/prompts/change-boundary-agent.md",
    ".intentos/prompts/baseline-state-agent.md",
    ".intentos/prompts/standard-baseline-router-agent.md",
    ".intentos/prompts/launch-readiness-agent.md",
    ".intentos/prompts/conversation-router-agent.md",
    ".intentos/checklists/context-governance-review.md",
    ".intentos/checklists/git-boundary-review.md",
    ".intentos/checklists/launch-readiness-review.md",
    ".intentos/checklists/conversation-drift-review.md",
    ".intentos/checklists/first-delivery-walkthrough-review.md",
    ".intentos/checklists/real-adoption-trial-review.md",
    ".intentos/checklists/patch-classification-review.md",
    ".intentos/checklists/workflow-adoption-map-review.md",
    ".intentos/checklists/document-lifecycle-review.md",
    ".intentos/checklists/beginner-entry-review.md",
    ".intentos/checklists/work-queue-review.md",
    ".intentos/checklists/hook-orchestration-review.md",
    ".intentos/checklists/workflow-guidance-review.md",
    ".intentos/checklists/review-surface-review.md",
    ".intentos/checklists/business-rule-closure-review.md",
    ".intentos/checklists/change-impact-coverage-review.md",
    ".intentos/checklists/standard-baseline-selection-review.md",
    ".intentos/checklists/guided-delivery-loop-review.md",
    ".intentos/checklists/change-boundary-review.md",
    ".intentos/checklists/baseline-state-review.md",
    ".intentos/checklists/launch-readiness-review.md",
    ".intentos/checklists/conversation-drift-review.md",
    "learning-candidates",
    "context-corrections",
    "git-boundary-reports",
    "launch-readiness",
    "conversation-turns",
    "scope-change-reports",
    "adoption-trial-reports",
    "real-adoption-trials",
    "governance-maps",
    "patch-classifications",
    "workflow-adoption-maps",
    "doc-lifecycle-reports",
    "beginner-entry-cards",
    "work-queue",
    "hook-orchestration-plans",
    "hook-policies",
    "workflow-guidance-cards",
    "review-surface-cards",
    "business-rule-closures",
    "change-impact-coverage-reports",
    "change-boundary-reports",
    "baseline-state-reports",
    "adoption-recommendations",
    "baseline-recommendations",
    "baseline-gap-reports",
    ".github/pull_request_template.md",
    ".github/workflows/ai-workflow-checks.yml",
  ]) {
    if (workflowVersion.workflowAssets.includes(asset)) {
      pass(`templates/workflow-version.json lists ${asset}`);
    } else {
      fail(`templates/workflow-version.json missing workflow asset ${asset}`);
    }
  }
}

function checkIntentOSFirstPartyCi() {
  const prCi = read(".github/workflows/intentos-pr-checks.yml");
  const releaseCi = read(".github/workflows/intentos-release-checks.yml");
  const prTemplate = read(".github/pull_request_template.md");
  const codeowners = read(".github/CODEOWNERS");
  const contributing = read("CONTRIBUTING.md");
  const security = read("SECURITY.md");
  const phaseReport = read("releases/0.34.0/phase-report.md");
  const baselineFreeze = read("releases/0.33.0/baseline-freeze.md");

  const prMarkers = [
    "actions/setup-node",
    "node-version: 22",
    "branches:",
    "- main",
    "node scripts/check-intentos.mjs",
    "npm run verify",
    "node scripts/check-manifest.mjs",
    "node scripts/check-product-baseline.mjs .",
    "node scripts/check-baseline-installation.mjs .",
    "node scripts/check-claim-control.mjs .",
    "node scripts/check-context-governance.mjs .",
    "node scripts/check-launch-readiness.mjs .",
    "node scripts/check-conversation-drift.mjs .",
    "node scripts/check-first-delivery-walkthrough.mjs .",
    "node scripts/check-real-adoption-trial.mjs .",
    "node scripts/check-patch-classification.mjs .",
    "node scripts/check-workflow-adoption-map.mjs .",
    "node scripts/cli.mjs workflow-map .",
    "node scripts/check-document-lifecycle.mjs .",
    "node scripts/cli.mjs doc-lifecycle .",
    "node scripts/check-document-archive-apply.mjs .",
    "node scripts/cli.mjs archive-apply .",
    "node scripts/check-apply-plan.mjs .",
    "node scripts/cli.mjs apply-plan .",
    "node scripts/check-beginner-entry.mjs .",
    "node scripts/resolve-beginner-entry.mjs . --goal",
    "node scripts/cli.mjs ask .",
    "node scripts/check-work-queue.mjs .",
    "node scripts/cli.mjs work-queue .",
    "node scripts/check-hook-orchestration.mjs .",
    "node scripts/cli.mjs hook-plan .",
    "node scripts/check-hook-policy.mjs .",
    "node scripts/cli.mjs hook-policy .",
    "node scripts/check-workflow-guidance.mjs .",
    "node scripts/cli.mjs guide .",
    "node scripts/check-review-surface.mjs .",
    "node scripts/cli.mjs review-surface .",
    "node scripts/check-business-rule-closure.mjs .",
    "node scripts/cli.mjs business-rule .",
    "node scripts/check-change-impact-coverage.mjs .",
    "node scripts/cli.mjs impact-coverage .",
    "node scripts/check-delivery-path.mjs .",
    "node scripts/cli.mjs delivery-path .",
    "node scripts/check-debt-handoff.mjs .",
    "node scripts/cli.mjs debt-handoff .",
    "node scripts/check-guided-delivery-loop.mjs .",
    "node scripts/check-change-boundary.mjs .",
    "node scripts/check-baseline-state.mjs .",
    "node scripts/cli.mjs baseline-decision .",
    "node scripts/cli.mjs baseline-decision-check .",
    "node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict",
    "node scripts/cli.mjs standard-baseline .",
    "node scripts/check-standard-baseline-pack.mjs .",
    "node scripts/check-standard-baseline-selection.mjs .",
    "node scripts/cli.mjs baseline-packs .",
    "node scripts/check-fixtures.mjs",
    "find scripts -name '*.mjs' -print0",
    "node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80",
    "node scripts/check-glossary-usage.mjs .",
    "node scripts/init-project.mjs --starter generic-project",
    "check-ai-workflow.mjs",
    "workflow-next.mjs",
    "start-project.mjs",
    "check-guided-adoption.mjs",
    "check-project-onboarding.mjs",
    "check-engineering-baseline.mjs",
    "check-baseline-installation.mjs",
    "check-product-baseline.mjs",
    "check-claim-control.mjs",
    "check-context-governance.mjs",
    "check-launch-readiness.mjs",
    "check-conversation-drift.mjs",
    "check-first-delivery-walkthrough.mjs",
    "check-real-adoption-trial.mjs",
    "check-patch-classification.mjs",
    "check-workflow-adoption-map.mjs",
    "resolve-existing-workflow.mjs",
    "check-document-lifecycle.mjs",
    "resolve-document-lifecycle.mjs",
    "check-document-archive-apply.mjs",
    "resolve-document-archive-apply.mjs",
    "check-apply-plan.mjs",
    "resolve-apply-plan.mjs",
    "check-beginner-entry.mjs",
    "resolve-beginner-entry.mjs",
    "check-work-queue.mjs",
    "resolve-work-queue.mjs",
    "check-hook-orchestration.mjs",
    "resolve-hook-orchestration.mjs",
    "check-hook-policy.mjs",
    "resolve-hook-policy.mjs",
    "check-workflow-guidance.mjs",
    "resolve-workflow-guidance.mjs",
    "check-review-surface.mjs",
    "resolve-review-surface.mjs",
    "check-business-rule-closure.mjs",
    "resolve-business-rule-closure.mjs",
    "check-change-impact-coverage.mjs",
    "resolve-change-impact-coverage.mjs",
    "check-delivery-path.mjs",
    "resolve-delivery-path.mjs",
    "check-debt-handoff.mjs",
    "resolve-debt-handoff.mjs",
    "check-execution-closure.mjs",
    "resolve-execution-closure.mjs",
    "resolve-execution-assurance.mjs",
    "check-execution-assurance.mjs",
    "guide",
    "guide . --deep",
    "guide . --deep --intent",
    "guide-check",
    "ask",
    "ask-check",
    "review-surface",
    "review-surface-check",
    "business-rule",
    "business-rule-check",
    "impact-coverage",
    "impact-coverage-check",
    "delivery-path",
    "delivery-path-check",
    "debt-handoff",
    "debt-handoff-check",
    "closure",
    "closure-check",
    "execution-assurance",
    "execution-assurance-check",
    "execution-assurance-reports/001-generated.md",
    "completion-evidence",
    "completion-evidence-check",
    "status",
    "status-check",
    "delivery-status-cards/001-generated-status.md",
    "done-check",
    "verify-execution",
    "baseline-installation",
    "baseline-decision",
    "baseline-decision-check",
    "workflow-map",
    "workflow-map-check",
    "doc-lifecycle",
    "doc-lifecycle-check",
    "archive-apply",
    "archive-apply-check",
    "work-queue",
    "work-queue-check",
    "hook-plan",
    "hook-plan-check",
    "hook-policy",
    "hook-policy-check",
    "check-guided-delivery-loop.mjs",
    "check-change-boundary.mjs",
    "check-baseline-state.mjs",
    "check-workflow-version.mjs",
    "contents: read",
  ];
  for (const marker of prMarkers) {
    if (prCi.includes(marker)) pass(`intentos PR CI includes ${marker}`);
    else fail(`intentos PR CI missing ${marker}`);
  }

  const releaseMarkers = [
    "workflow_dispatch",
    "tags:",
    "actions/setup-node",
    "node-version: 22",
    "node scripts/check-intentos.mjs",
    "npm run verify",
    "node scripts/check-manifest.mjs",
    "node scripts/check-product-baseline.mjs .",
    "node scripts/check-claim-control.mjs .",
    "node scripts/check-context-governance.mjs .",
    "node scripts/check-launch-readiness.mjs .",
    "node scripts/check-conversation-drift.mjs .",
    "node scripts/check-first-delivery-walkthrough.mjs .",
    "node scripts/check-real-adoption-trial.mjs .",
    "node scripts/check-patch-classification.mjs .",
    "node scripts/check-workflow-adoption-map.mjs .",
    "node scripts/cli.mjs workflow-map .",
    "node scripts/check-document-lifecycle.mjs .",
    "node scripts/cli.mjs doc-lifecycle .",
    "node scripts/check-document-archive-apply.mjs .",
    "node scripts/cli.mjs archive-apply .",
    "node scripts/check-apply-plan.mjs .",
    "node scripts/cli.mjs apply-plan .",
    "node scripts/check-beginner-entry.mjs .",
    "node scripts/resolve-beginner-entry.mjs . --goal",
    "node scripts/cli.mjs ask .",
    "node scripts/check-work-queue.mjs .",
    "node scripts/cli.mjs work-queue .",
    "node scripts/check-hook-orchestration.mjs .",
    "node scripts/cli.mjs hook-plan .",
    "node scripts/check-hook-policy.mjs .",
    "node scripts/cli.mjs hook-policy .",
    "node scripts/check-workflow-guidance.mjs .",
    "node scripts/cli.mjs guide .",
    "node scripts/check-review-surface.mjs .",
    "node scripts/cli.mjs review-surface .",
    "node scripts/check-business-rule-closure.mjs .",
    "node scripts/cli.mjs business-rule .",
    "node scripts/check-change-impact-coverage.mjs .",
    "node scripts/cli.mjs impact-coverage .",
    "node scripts/check-delivery-path.mjs .",
    "node scripts/cli.mjs delivery-path .",
    "node scripts/check-debt-handoff.mjs .",
    "node scripts/cli.mjs debt-handoff .",
    "node scripts/check-guided-delivery-loop.mjs .",
    "node scripts/check-change-boundary.mjs .",
    "node scripts/check-baseline-state.mjs .",
    "node scripts/cli.mjs baseline-decision .",
    "node scripts/cli.mjs baseline-decision-check .",
    "node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict",
    "node scripts/cli.mjs standard-baseline .",
    "node scripts/check-standard-baseline-pack.mjs .",
    "node scripts/check-standard-baseline-selection.mjs .",
    "node scripts/cli.mjs baseline-packs .",
    "node scripts/check-fixtures.mjs",
    "find . -name '*.mjs' -not -path './node_modules/*' -print0",
    "node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80",
    "node scripts/check-glossary-usage.mjs .",
    "node scripts/init-project.mjs --starter generic-project",
    "check-ai-workflow.mjs",
    "workflow-next.mjs",
    "check-project-onboarding.mjs",
    "check-engineering-baseline.mjs",
    "check-product-baseline.mjs",
    "check-claim-control.mjs",
    "check-context-governance.mjs",
    "check-launch-readiness.mjs",
    "check-conversation-drift.mjs",
    "check-first-delivery-walkthrough.mjs",
    "check-real-adoption-trial.mjs",
    "check-patch-classification.mjs",
    "check-workflow-adoption-map.mjs",
    "resolve-existing-workflow.mjs",
    "check-document-lifecycle.mjs",
    "resolve-document-lifecycle.mjs",
    "check-document-archive-apply.mjs",
    "resolve-document-archive-apply.mjs",
    "check-apply-plan.mjs",
    "resolve-apply-plan.mjs",
    "check-beginner-entry.mjs",
    "resolve-beginner-entry.mjs",
    "check-work-queue.mjs",
    "resolve-work-queue.mjs",
    "check-hook-orchestration.mjs",
    "resolve-hook-orchestration.mjs",
    "check-hook-policy.mjs",
    "resolve-hook-policy.mjs",
    "check-workflow-guidance.mjs",
    "resolve-workflow-guidance.mjs",
    "check-review-surface.mjs",
    "resolve-review-surface.mjs",
    "check-business-rule-closure.mjs",
    "resolve-business-rule-closure.mjs",
    "check-change-impact-coverage.mjs",
    "resolve-change-impact-coverage.mjs",
    "check-delivery-path.mjs",
    "resolve-delivery-path.mjs",
    "check-debt-handoff.mjs",
    "resolve-debt-handoff.mjs",
    "guide",
    "guide-check",
    "ask",
    "ask-check",
    "review-surface",
    "review-surface-check",
    "business-rule",
    "business-rule-check",
    "impact-coverage",
    "impact-coverage-check",
    "delivery-path",
    "delivery-path-check",
    "debt-handoff",
    "debt-handoff-check",
    "baseline-installation",
    "baseline-decision",
    "baseline-decision-check",
    "workflow-map",
    "workflow-map-check",
    "doc-lifecycle",
    "doc-lifecycle-check",
    "archive-apply",
    "archive-apply-check",
    "work-queue",
    "work-queue-check",
    "hook-plan",
    "hook-plan-check",
    "hook-policy",
    "hook-policy-check",
    "check-guided-delivery-loop.mjs",
    "check-change-boundary.mjs",
    "check-baseline-state.mjs",
    "check-workflow-version.mjs",
    "contents: read",
  ];
  for (const marker of releaseMarkers) {
    if (releaseCi.includes(marker)) pass(`intentos release CI includes ${marker}`);
    else fail(`intentos release CI missing ${marker}`);
  }

  for (const marker of [
    "Human Summary",
    "Workflow Guidance",
    "Beginner Entry",
    "Workflow Evidence",
    "Debt / Knowledge Handoff",
    "Document Archive Apply",
    "Goal Card",
    "Subagent Run Plan",
    "Review Packet",
    "Review Loop Report",
    "Final Report",
    "License / Commercial Boundary",
    "Risk And Approval",
    "Next-Step Boundary",
    "Product baseline",
    "Claim control",
    "Assumption Register",
    "Project memory",
    "Git Boundary",
    "Guided Delivery Loop",
    "Change Boundary Report",
    "Baseline State Report",
    "Change Impact Coverage Report",
  ]) {
    if (prTemplate.includes(marker)) pass(`intentos PR template includes ${marker}`);
    else fail(`intentos PR template missing ${marker}`);
  }

  const activeCodeownerLines = codeowners
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (activeCodeownerLines.length > 0
    && activeCodeownerLines.every((line) => line.includes("@coffeecoproject"))
    && codeowners.includes("standard-baseline-packs/** @coffeecoproject")
    && codeowners.includes("industrial-packs/** @coffeecoproject")
    && codeowners.includes("scripts/** @coffeecoproject")
    && codeowners.includes("core/** @coffeecoproject")
    && codeowners.includes(".github/** @coffeecoproject")) {
    pass("CODEOWNERS declares active maintainer ownership for governance-sensitive areas");
  } else {
    fail("CODEOWNERS must declare active @coffeecoproject ownership for governance-sensitive areas");
  }

  for (const marker of [
    "node scripts/check-intentos.mjs",
    "node scripts/check-fixtures.mjs",
    "phase artifacts",
    "Generated-Project Smoke",
    "AUTO_FIX",
    "NEEDS_HUMAN_DECISION",
  ]) {
    if (contributing.includes(marker)) pass(`CONTRIBUTING includes ${marker}`);
    else fail(`CONTRIBUTING missing ${marker}`);
  }

  for (const marker of [
    "Supported Version",
    "Reporting",
    "does not promise a response SLA",
    "not a hosted service",
    "not legal advice",
  ]) {
    if (security.includes(marker)) pass(`SECURITY includes ${marker}`);
    else fail(`SECURITY missing ${marker}`);
  }

  for (const marker of [
    "1acd7440f4ffc295cba9abd8324e943d06eb8099",
    "0.33.0",
    "0.33.0` baseline",
    "CC BY-NC 4.0",
    "not legal advice",
    "not proof",
  ]) {
    if (baselineFreeze.includes(marker)) pass(`baseline freeze includes ${marker}`);
    else fail(`baseline freeze missing ${marker}`);
  }

  for (const marker of [
    "0.34.0",
    "PR CI workflow added",
    "Release CI workflow added",
    "check-intentos",
    "No target-project bootstrap semantics were changed",
    "No license wording was changed",
  ]) {
    if (phaseReport.includes(marker)) pass(`0.34 phase report includes ${marker}`);
    else fail(`0.34 phase report missing ${marker}`);
  }
}

function checkOneDotZeroReleaseEvidence() {
  if (currentVersion() !== "1.0.0") return;

  const releaseFiles = [
    "releases/1.0.0/release-record.md",
    "releases/1.0.0/self-check-report.md",
    "releases/1.0.0/generated-project-smoke.md",
    "releases/1.0.0/update-smoke.md",
    "releases/1.0.0/migration-matrix.md",
    "releases/1.0.0/known-limitations.md",
    "releases/1.0.0/adoption-evidence.md",
    "templates/adoption-evidence-report.md",
    "templates/productization-trial-report.md",
  ];
  for (const file of releaseFiles) {
    if (exists(file)) pass(`1.0 release evidence file exists ${file}`);
    else fail(`1.0 release evidence file missing ${file}`);
  }
  if (releaseFiles.some((file) => !exists(file))) return;

  const releaseRecord = read("releases/1.0.0/release-record.md");
  for (const marker of [
    "1.0 minimum productization release",
    "not a 10/10 real-project evidence release",
    "No package publishing",
    "No migration apply",
    "All concrete packs remain draft",
  ]) {
    if (releaseRecord.includes(marker)) pass(`1.0 release record includes ${marker}`);
    else fail(`1.0 release record missing ${marker}`);
  }

  const selfCheck = read("releases/1.0.0/self-check-report.md");
  for (const marker of [
    "Status: PASS",
    "node scripts/check-intentos.mjs",
    "node scripts/check-fixtures.mjs",
    "git diff --check",
  ]) {
    if (selfCheck.includes(marker)) pass(`1.0 self-check report includes ${marker}`);
    else fail(`1.0 self-check report missing ${marker}`);
  }

  const generatedSmoke = read("releases/1.0.0/generated-project-smoke.md");
  for (const marker of [
    "Status: PASS",
    "node scripts/cli.mjs init --starter generic-project --target /tmp/intentos-1-test",
    "node /tmp/intentos-1-test/scripts/check-ai-workflow.mjs /tmp/intentos-1-test --mode core",
  ]) {
    if (generatedSmoke.includes(marker)) pass(`1.0 generated smoke includes ${marker}`);
    else fail(`1.0 generated smoke missing ${marker}`);
  }

  const updateSmoke = read("releases/1.0.0/update-smoke.md");
  for (const marker of [
    "Status: PASS",
    "node scripts/cli.mjs update --target /tmp/intentos-1-test --dry-run",
    "\"operation\": \"UPDATE_WORKFLOW_ASSETS\"",
  ]) {
    if (updateSmoke.includes(marker)) pass(`1.0 update smoke includes ${marker}`);
    else fail(`1.0 update smoke missing ${marker}`);
  }

  const migrationMatrix = read("releases/1.0.0/migration-matrix.md");
  for (const marker of [
    "0.33.0",
    "1.0.0",
    "Plan-only",
    "Added Assets",
    "Removed Assets",
    "Renamed Assets",
    "CI Impact",
    "AGENTS Impact",
    "PR Template Impact",
    "Human Approval Requirements",
    "Rollback",
  ]) {
    if (migrationMatrix.includes(marker)) pass(`1.0 migration matrix includes ${marker}`);
    else fail(`1.0 migration matrix missing ${marker}`);
  }

  const limitations = read("releases/1.0.0/known-limitations.md");
  for (const marker of [
    "10/10 real-project evidence has not been achieved",
    "`intentos migrate` is dry-run/write-plan only",
    "Industrial packs remain `draft`",
    "License explanation docs are not legal advice",
  ]) {
    if (limitations.includes(marker)) pass(`1.0 limitations include ${marker}`);
    else fail(`1.0 limitations missing ${marker}`);
  }

  const adoptionEvidence = read("releases/1.0.0/adoption-evidence.md");
  for (const marker of [
    "Minimum productization evidence complete",
    "10/10 real-project evidence not achieved",
    "templates/adoption-evidence-report.md",
    "Forbidden claim",
  ]) {
    if (adoptionEvidence.includes(marker)) pass(`1.0 adoption evidence includes ${marker}`);
    else fail(`1.0 adoption evidence missing ${marker}`);
  }

  const adoptionTemplate = read("templates/adoption-evidence-report.md");
  for (const marker of [
    "False Positives",
    "False Negatives",
    "AI Failure Modes",
    "Human Decisions Required",
    "Would keep using",
  ]) {
    if (adoptionTemplate.includes(marker)) pass(`adoption evidence template includes ${marker}`);
    else fail(`adoption evidence template missing ${marker}`);
  }

  const trialTemplate = read("templates/productization-trial-report.md");
  for (const marker of [
    "Trial type",
    "generated-project smoke",
    "update smoke",
    "migration dry-run",
    "Do not claim",
  ]) {
    if (trialTemplate.includes(marker)) pass(`productization trial template includes ${marker}`);
    else fail(`productization trial template missing ${marker}`);
  }
}

function checkManifestProtocol() {
  const manifest = JSON.parse(read("intentos-manifest.json"));
  if (manifest.schemaVersion === "1.0") pass("manifest schemaVersion is 1.0");
  else fail("manifest schemaVersion must be 1.0");
  if (manifest.mode === "authoritative") pass("manifest mode is authoritative");
  else fail("manifest mode must be authoritative for phase 0.37.0");
  if (manifest.compatibilityPolicy?.readOnly === false
    && manifest.compatibilityPolicy?.authoritative === true
    && manifest.compatibilityPolicy?.changesRuntimeBehavior === true) {
    pass("manifest compatibility policy is authoritative");
  } else {
    fail("manifest compatibility policy must be authoritative for phase 0.37.0");
  }
  if (manifest.compatibilityPolicy?.phase === manifest.intentOSVersion) {
    pass("manifest compatibilityPolicy.phase matches intentOSVersion");
  } else {
    fail(`manifest compatibilityPolicy.phase ${manifest.compatibilityPolicy?.phase || "<missing>"} must match intentOSVersion ${manifest.intentOSVersion}`);
  }

  for (const group of [
    "sourceRequired",
    "targetCore",
    "targetFull",
    "intentOSCore",
    "templates",
    "prompts",
    "checklists",
    "profiles",
    "industrialPackRegistry",
    "workflowDirs",
    "workflowReadiness",
    "scripts",
    "platformAdapters",
    "examples",
    "fixtures",
    "workflowVersionAssets",
  ]) {
    if (Array.isArray(manifest.groups?.[group])) pass(`manifest contains group ${group}`);
    else fail(`manifest missing group ${group}`);
  }
  if (Array.isArray(manifest.copyRules?.directories) && Array.isArray(manifest.copyRules?.files)) {
    pass("manifest contains copy rules");
  } else {
    fail("manifest must contain copyRules.directories and copyRules.files");
  }
  for (const marker of [
    ".intentos/intentos-manifest.json",
    "scripts/lib/args.mjs",
    "scripts/lib/check-result.mjs",
    "scripts/lib/git.mjs",
    "scripts/lib/markdown.mjs",
    "scripts/lib/project-signals.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/lib/path-safety.mjs",
    "scripts/start-project.mjs",
    "scripts/check-guided-adoption.mjs",
    ".intentos/docs/first-hour.md",
    "adoption-recommendations",
  ]) {
    if (manifest.groups.targetCore.includes(marker) && manifest.groups.targetFull.includes(marker)) {
      pass(`manifest target required paths include ${marker}`);
    } else {
      fail(`manifest target required paths must include ${marker}`);
    }
    if (manifest.groups.workflowVersionAssets.includes(marker)) {
      pass(`manifest workflow version assets include ${marker}`);
    } else {
      fail(`manifest workflow version assets must include ${marker}`);
    }
  }

  const manifestCheck = runNode(["scripts/check-manifest.mjs"]);
  if (manifestCheck.status === 0) {
    pass("manifest check");
  } else {
    fail(`manifest check failed: ${manifestCheck.stderr || manifestCheck.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-manifest-check-"));
  try {
    const invalidManifest = path.join(tempRoot, "invalid-manifest.json");
    fs.writeFileSync(invalidManifest, JSON.stringify({
      schemaVersion: "1.0",
      intentOSVersion: currentVersion(),
      mode: "authoritative",
      compatibilityPolicy: {
        readOnly: false,
        authoritative: true,
        changesRuntimeBehavior: true,
        phase: "0.37.0",
      },
      groups: {
        sourceRequired: [],
      },
    }, null, 2));
    const invalidResult = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", invalidManifest]);
    const invalidOutput = `${invalidResult.stdout}\n${invalidResult.stderr}`;
    if (invalidResult.status !== 0 && invalidOutput.includes("manifest schema validation")) {
      pass("manifest check rejects invalid manifest before drift checking");
    } else {
      fail(`manifest check must reject invalid manifest before drift checking: ${invalidOutput}`);
    }

    const phaseDriftManifest = path.join(tempRoot, "phase-drift-manifest.json");
    const phaseDrift = JSON.parse(JSON.stringify(manifest));
    phaseDrift.compatibilityPolicy.phase = "0.0.0";
    fs.writeFileSync(phaseDriftManifest, JSON.stringify(phaseDrift, null, 2));
    const phaseDriftResult = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", phaseDriftManifest]);
    const phaseDriftOutput = `${phaseDriftResult.stdout}\n${phaseDriftResult.stderr}`;
    if (phaseDriftResult.status !== 0
      && phaseDriftOutput.includes("compatibilityPolicy.phase")
      && phaseDriftOutput.includes("must match intentOSVersion")) {
      pass("manifest check rejects compatibilityPolicy phase drift");
    } else {
      fail(`manifest check must reject compatibilityPolicy phase drift: ${phaseDriftOutput}`);
    }

    const sourceManifest = path.join(tempRoot, "source-required-manifest.json");
    const sourceRequired = JSON.parse(JSON.stringify(manifest));
    sourceRequired.groups.sourceRequired.push("fake/manifest-source-required.md");
    fs.writeFileSync(sourceManifest, JSON.stringify(sourceRequired, null, 2));
    const sourceRequiredResult = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", sourceManifest]);
    const sourceRequiredOutput = `${sourceRequiredResult.stdout}\n${sourceRequiredResult.stderr}`;
    if (sourceRequiredResult.status !== 0
      && sourceRequiredOutput.includes("sourceRequired")
      && sourceRequiredOutput.includes("fake/manifest-source-required.md")) {
      pass("manifest check reports missing sourceRequired asset");
    } else {
      fail(`manifest check must report missing sourceRequired asset: ${sourceRequiredOutput}`);
    }

    const reverseDriftManifest = path.join(tempRoot, "reverse-drift-manifest.json");
    const reverseDrift = JSON.parse(JSON.stringify(manifest));
    reverseDrift.groups.sourceRequired = reverseDrift.groups.sourceRequired.filter((item) => item !== "scripts/README.md");
    fs.writeFileSync(reverseDriftManifest, JSON.stringify(reverseDrift, null, 2));
    const reverseDriftResult = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", reverseDriftManifest]);
    const reverseDriftOutput = `${reverseDriftResult.stdout}\n${reverseDriftResult.stderr}`;
    if (reverseDriftResult.status !== 0
      && reverseDriftOutput.includes("manifest reverse drift guard")
      && reverseDriftOutput.includes("scripts/README.md")) {
      pass("manifest reverse drift guard rejects unmanifested important source asset");
    } else {
      fail(`manifest reverse drift guard must reject unmanifested important source asset: ${reverseDriftOutput}`);
    }

    const target = path.join(tempRoot, "target-project");
    const init = runNode(["scripts/init-project.mjs", "--starter", "generic-project", "--target", target]);
    if (init.status !== 0) {
      fail(`manifest authoritative generated target init failed: ${init.stderr || init.stdout}`);
      return;
    }
    const targetManifestPath = path.join(target, ".intentos", "intentos-manifest.json");
    const targetManifest = JSON.parse(fs.readFileSync(targetManifestPath, "utf8"));
    targetManifest.groups.targetCore.push("fake/manifest-target-required.md");
    targetManifest.groups.targetFull.push("fake/manifest-target-required.md");
    targetManifest.groups.workflowReadiness.push("fake/manifest-target-required.md");
    fs.writeFileSync(targetManifestPath, JSON.stringify(targetManifest, null, 2));

    const targetCheck = runNode([path.join(target, "scripts", "check-ai-workflow.mjs"), target, "--mode", "core"]);
    const targetCheckOutput = `${targetCheck.stdout}\n${targetCheck.stderr}`;
    if (targetCheck.status !== 0 && targetCheckOutput.includes("fake/manifest-target-required.md")) {
      pass("target check-ai-workflow reads target required paths from manifest");
    } else {
      fail(`target check-ai-workflow must report manifest-added required path: ${targetCheckOutput}`);
    }

    const targetNext = runNode([path.join(target, "scripts", "workflow-next.mjs"), target, "--json"]);
    if (targetNext.status === 0) {
      const nextResult = JSON.parse(targetNext.stdout);
      if ((nextResult.missingWorkflowAssets || []).includes("fake/manifest-target-required.md")) {
        pass("workflow-next reads workflow readiness paths from manifest");
      } else {
        fail(`workflow-next missingWorkflowAssets must include manifest-added path: ${targetNext.stdout}`);
      }
    } else {
      fail(`workflow-next manifest target check failed: ${targetNext.stderr || targetNext.stdout}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkCliFrontDoor() {
  const pkg = JSON.parse(read("package.json"));
  if (pkg.version === currentVersion()) pass("package.json version matches current version");
  else fail(`package.json version ${pkg.version} does not match ${currentVersion()}`);

  if (pkg.type === "module") pass("package.json declares module type");
  else fail("package.json must declare module type");

  if (pkg.private === true) pass("package.json remains private during CLI front-door phase");
  else fail("package.json must remain private until package publishing is explicitly approved");

  if (pkg.bin?.["intentos"] === "./scripts/cli.mjs") pass("package.json exposes intentos bin");
  else fail("package.json must expose intentos bin at ./scripts/cli.mjs");

  if (pkg.engines?.node === ">=22") pass("package.json declares Node >=22 engine");
  else fail("package.json must declare Node >=22 engine");

  for (const scriptName of ["check", "verify", "self-check", "fixtures", "smoke:init"]) {
    if (typeof pkg.scripts?.[scriptName] === "string" && pkg.scripts[scriptName].length > 0) {
      pass(`package.json script ${scriptName}`);
    } else {
      fail(`package.json missing script ${scriptName}`);
    }
  }
  for (const scriptName of ["verify:syntax", "verify:baseline", "verify:governance", "verify:industrial", "verify:examples", "verify:release"]) {
    if (typeof pkg.scripts?.[scriptName] === "string" && pkg.scripts[scriptName].length > 0) {
      pass(`package.json script ${scriptName}`);
    } else {
      fail(`package.json missing script ${scriptName}`);
    }
  }

  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node scripts/check-manifest.mjs",
    "node --check scripts/lib/path-safety.mjs",
    "node scripts/check-intentos.mjs",
    "node --check scripts/check-guided-delivery-loop.mjs",
    "node --check scripts/check-change-boundary.mjs",
    "node --check scripts/check-baseline-state.mjs",
    "node --check scripts/resolve-standard-baseline.mjs",
    "node --check scripts/check-standard-baseline-pack.mjs",
    "node --check scripts/check-standard-baseline-selection.mjs",
    "node --check scripts/resolve-guided-baseline-selection.mjs",
    "node --check scripts/check-guided-baseline-selection.mjs",
    "node --check scripts/check-baseline-selection-precision.mjs",
    "node --check scripts/resolve-existing-workflow.mjs",
    "node --check scripts/check-workflow-adoption-map.mjs",
    "node --check scripts/resolve-document-lifecycle.mjs",
    "node --check scripts/check-document-lifecycle.mjs",
    "node --check scripts/resolve-document-archive-apply.mjs",
    "node --check scripts/check-document-archive-apply.mjs",
    "node --check scripts/resolve-apply-plan.mjs",
    "node --check scripts/check-apply-plan.mjs",
    "node --check scripts/resolve-beginner-entry.mjs",
    "node --check scripts/check-beginner-entry.mjs",
    "node scripts/cli.mjs workflow-map .",
    "node scripts/check-workflow-adoption-map.mjs .",
    "node scripts/cli.mjs doc-lifecycle .",
    "node scripts/check-document-lifecycle.mjs .",
    "node scripts/cli.mjs archive-apply .",
    "node scripts/check-document-archive-apply.mjs .",
    "node scripts/cli.mjs apply-plan .",
    "node scripts/check-apply-plan.mjs .",
    "node scripts/cli.mjs ask .",
    "node scripts/check-beginner-entry.mjs .",
    "node scripts/cli.mjs work-queue .",
    "node scripts/check-work-queue.mjs .",
    "node scripts/cli.mjs hook-plan .",
    "node scripts/check-hook-orchestration.mjs .",
    "node --check scripts/resolve-hook-policy.mjs",
    "node --check scripts/check-hook-policy.mjs",
    "node scripts/cli.mjs hook-policy .",
    "node scripts/check-hook-policy.mjs .",
    "node --check scripts/resolve-workflow-guidance.mjs",
    "node --check scripts/check-workflow-guidance.mjs",
    "node scripts/cli.mjs guide .",
    "node scripts/check-workflow-guidance.mjs .",
    "node --check scripts/resolve-review-surface.mjs",
    "node --check scripts/check-review-surface.mjs",
    "node scripts/cli.mjs review-surface .",
    "node scripts/check-review-surface.mjs .",
    "node --check scripts/resolve-business-rule-closure.mjs",
    "node --check scripts/check-business-rule-closure.mjs",
    "node scripts/cli.mjs business-rule .",
    "node scripts/cli.mjs business-rule-check .",
    "node --check scripts/resolve-change-impact-coverage.mjs",
    "node --check scripts/check-change-impact-coverage.mjs",
    "node scripts/cli.mjs impact-coverage .",
    "node scripts/check-change-impact-coverage.mjs .",
    "node --check scripts/resolve-delivery-path.mjs",
    "node --check scripts/check-delivery-path.mjs",
    "node scripts/cli.mjs delivery-path .",
    "node scripts/check-delivery-path.mjs .",
    "node --check scripts/resolve-debt-handoff.mjs",
    "node --check scripts/check-debt-handoff.mjs",
    "node scripts/cli.mjs debt-handoff .",
    "node scripts/check-debt-handoff.mjs .",
    "node --check scripts/resolve-closure-decision.mjs",
    "node --check scripts/check-closure-decision.mjs",
    "node scripts/cli.mjs finish .",
    "node scripts/check-closure-decision.mjs .",
    "node --check scripts/resolve-guided-closure.mjs",
    "node --check scripts/check-guided-closure.mjs",
    "node scripts/check-guided-closure.mjs .",
    "node --check scripts/resolve-launch-review-view.mjs",
    "node --check scripts/check-launch-review-view.mjs",
    "node scripts/cli.mjs launch-view .",
    "node scripts/check-launch-review-view.mjs .",
    "node --check scripts/resolve-release-execution.mjs",
    "node --check scripts/check-release-execution.mjs",
    "node scripts/cli.mjs release-execution .",
    "node scripts/check-release-execution.mjs .",
    "node --check scripts/resolve-release-adapter.mjs",
    "node --check scripts/check-release-adapter.mjs",
    "node scripts/cli.mjs release-adapter .",
    "node scripts/check-release-adapter.mjs .",
    "node --check scripts/resolve-release-guide.mjs",
    "node --check scripts/check-release-guide.mjs",
    "node scripts/cli.mjs release-guide .",
    "node scripts/check-release-guide.mjs .",
    "node --check scripts/resolve-platform-release-recipe.mjs",
    "node --check scripts/check-platform-release-recipe.mjs",
    "node scripts/cli.mjs release-recipe .",
    "node scripts/cli.mjs release-recipe-check .",
    "node scripts/check-platform-release-recipe.mjs .",
    "node --check scripts/resolve-release-handoff-pack.mjs",
    "node --check scripts/check-release-handoff-pack.mjs",
    "node scripts/cli.mjs release-handoff .",
    "node scripts/cli.mjs release-handoff-check .",
    "node scripts/check-release-handoff-pack.mjs .",
    "node --check scripts/resolve-release-plan.mjs",
    "node --check scripts/check-release-plan.mjs",
    "node scripts/cli.mjs release-plan .",
    "node scripts/cli.mjs release-check .",
    "node scripts/check-release-plan.mjs .",
    "node --check scripts/resolve-user-delivery-console.mjs",
    "node --check scripts/check-user-delivery-console.mjs",
    "node scripts/cli.mjs status . --intent \"维护 IntentOS 普通用户交付状态\"",
    "node scripts/cli.mjs status-check .",
    "node scripts/cli.mjs baseline-decision .",
    "node scripts/cli.mjs baseline-decision-check .",
    "node scripts/check-standard-baseline-pack.mjs .",
    "node scripts/check-standard-baseline-selection.mjs .",
    "node --check scripts/resolve-baseline-packs.mjs",
    "node --check scripts/check-baseline-pack-selection.mjs",
    "node scripts/check-baseline-pack-selection.mjs .",
    "node scripts/check-baseline-selection-precision.mjs .",
    "git diff --check",
  ]) {
    if (verifySurface.includes(marker)) pass(`package.json verify surface includes ${marker}`);
    else fail(`package.json verify surface missing ${marker}`);
  }

  const help = runNode(["scripts/cli.mjs", "--help"]);
  const helpOutput = `${help.stdout}\n${help.stderr}`;
  if (help.status !== 0) {
    fail(`CLI help failed: ${helpOutput}`);
    return;
  }
  for (const marker of [
    "IntentOS CLI",
    "Command: intentos",
    currentVersion(),
    "Manifest: intentos-manifest.json",
    "One public operating loop",
    "Plain-language meanings",
    "work",
    "Start a project",
    "Continue a task",
    "Check status",
    "Finish a task",
    "Prepare release",
    "Adopt old project",
    "--help-advanced",
    "docs/operating-model.md",
    "Lower-level commands remain supported",
  ]) {
    if (helpOutput.includes(marker)) pass(`CLI beginner help includes ${marker}`);
    else fail(`CLI beginner help missing ${marker}`);
  }
  for (const hiddenMarker of ["business-rule-check", "execution-assurance-check", "release-execution-check", "self-check"]) {
    if (!helpOutput.includes(hiddenMarker)) pass(`CLI beginner help hides ${hiddenMarker}`);
    else fail(`CLI beginner help exposes advanced command ${hiddenMarker}`);
  }

  const advancedHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  const advancedHelpOutput = `${advancedHelp.stdout}\n${advancedHelp.stderr}`;
  if (advancedHelp.status !== 0) {
    fail(`CLI advanced help failed: ${advancedHelpOutput}`);
    return;
  }
  for (const marker of [
    "Primary entry commands",
    "Common user-facing decisions",
    "Advanced commands remain available",
    "docs/start-here.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "guide",
    "guide-check",
    "ask",
    "ask-check",
    "status",
    "status-check",
    "start",
    "baseline",
    "product-baseline",
    "claim-control",
    "context-governance",
    "launch-readiness",
    "launch-view",
    "launch-view-check",
    "release-adapter",
    "release-adapter-check",
    "release-guide",
    "release-guide-check",
    "release-recipe",
    "release-recipe-check",
    "release-handoff",
    "release-handoff-check",
    "release-execution",
    "release-execution-check",
    "conversation-drift",
    "guided-delivery",
    "real-adoption",
    "patch-classification",
    "workflow-map",
    "workflow-map-check",
    "archive-apply",
    "archive-apply-check",
    "change-boundary",
    "baseline-state",
    "debt-handoff",
    "debt-handoff-check",
    "business-rule",
    "business-rule-check",
    "finish",
    "finish-check",
    "baseline-decision",
    "baseline-decision-check",
    "standard-baseline",
    "standard-baseline-selection",
    "baseline-packs",
    "baseline-pack-selection",
    "init",
    "update",
    "next",
    "check",
    "doctor",
    "new",
    "migrate",
    "fixtures",
    "self-check",
    "--dry-run",
    "Lower-level scripts remain supported",
  ]) {
    if (advancedHelpOutput.includes(marker)) pass(`CLI advanced help includes ${marker}`);
    else fail(`CLI advanced help missing ${marker}`);
  }

  const operating = runNode(["scripts/cli.mjs", "work", ".", "检查当前项目状态", "--json"]);
  try {
    const parsed = JSON.parse(operating.stdout);
    if (operating.status === 0
      && parsed.reportType === "INTENTOS_OPERATING_STATE"
      && parsed.readOnly === true
      && parsed.operatingLoop?.operation === "CHECK_STATUS"
      && parsed.boundaries?.authorizesImplementation === "No") {
      pass("CLI work delegates to the read-only Operating Model");
    } else {
      fail(`CLI work returned an invalid Operating State: ${operating.stderr || operating.stdout}`);
    }
  } catch (error) {
    fail(`CLI work output is not valid JSON: ${error.message}`);
  }

  const version = runNode(["scripts/cli.mjs", "--version"]);
  if (version.status === 0 && version.stdout.trim() === currentVersion()) {
    pass("CLI version matches VERSION.md");
  } else {
    fail(`CLI version mismatch: ${version.stderr || version.stdout}`);
  }

  const next = runNode(["scripts/cli.mjs", "next", "."]);
  if (next.status === 0 && next.stdout.includes("NEXT_ACTION:")) {
    pass("CLI next delegates to workflow-next");
  } else {
    fail(`CLI next failed or hid workflow-next output: ${next.stderr || next.stdout}`);
  }

  const guide = runNode(["scripts/cli.mjs", "guide", "."]);
  if (guide.status === 0
    && guide.stdout.includes("Workflow Guidance Card")
    && guide.stdout.includes("This guidance writes target files: No")) {
    pass("CLI guide delegates to workflow guidance resolver");
  } else {
    fail(`CLI guide failed: ${guide.stderr || guide.stdout}`);
  }

  const guideCheck = runNode(["scripts/cli.mjs", "guide-check", "."]);
  if (guideCheck.status === 0 && guideCheck.stdout.includes("Workflow guidance check passed")) {
    pass("CLI guide-check delegates to workflow guidance checker");
  } else {
    fail(`CLI guide-check failed: ${guideCheck.stderr || guideCheck.stdout}`);
  }

  const beginnerEntry = runNode(["scripts/cli.mjs", "ask", ".", "maintain IntentOS beginner entry"]);
  if (beginnerEntry.status === 0
    && beginnerEntry.stdout.includes("Beginner Entry Card")
    && beginnerEntry.stdout.includes("This entry writes target files: No")) {
    pass("CLI ask delegates to beginner entry resolver");
  } else {
    fail(`CLI ask failed: ${beginnerEntry.stderr || beginnerEntry.stdout}`);
  }

  const beginnerEntryCheck = runNode(["scripts/cli.mjs", "ask-check", "."]);
  if (beginnerEntryCheck.status === 0 && beginnerEntryCheck.stdout.includes("Beginner Entry check passed")) {
    pass("CLI ask-check delegates to beginner entry checker");
  } else {
    fail(`CLI ask-check failed: ${beginnerEntryCheck.stderr || beginnerEntryCheck.stdout}`);
  }

  const guidedClosure = runNode(["scripts/cli.mjs", "finish", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed"]);
  if (guidedClosure.status === 0
    && guidedClosure.stdout.includes("Unified Closure Decision")
    && guidedClosure.stdout.includes("This decision writes target files: No")) {
    pass("CLI finish delegates to unified closure resolver");
  } else {
    fail(`CLI finish failed: ${guidedClosure.stderr || guidedClosure.stdout}`);
  }

  const guidedClosureCheck = runNode(["scripts/cli.mjs", "finish-check", "."]);
  if (guidedClosureCheck.status === 0 && guidedClosureCheck.stdout.includes("Unified Closure Decision check passed")) {
    pass("CLI finish-check delegates to unified closure checker");
  } else {
    fail(`CLI finish-check failed: ${guidedClosureCheck.stderr || guidedClosureCheck.stdout}`);
  }

  const reviewSurface = runNode(["scripts/cli.mjs", "review-surface", "."]);
  if (reviewSurface.status === 0
    && reviewSurface.stdout.includes("Review Surface Card")
    && reviewSurface.stdout.includes("This card writes target files: No")) {
    pass("CLI review-surface delegates to review surface resolver");
  } else {
    fail(`CLI review-surface failed: ${reviewSurface.stderr || reviewSurface.stdout}`);
  }

  const reviewSurfaceCheck = runNode(["scripts/cli.mjs", "review-surface-check", "."]);
  if (reviewSurfaceCheck.status === 0 && reviewSurfaceCheck.stdout.includes("Review surface check passed")) {
    pass("CLI review-surface-check delegates to review surface checker");
  } else {
    fail(`CLI review-surface-check failed: ${reviewSurfaceCheck.stderr || reviewSurfaceCheck.stdout}`);
  }

  const businessRule = runNode(["scripts/cli.mjs", "business-rule", ".", "--intent", "appointment requests must include a service time"]);
  if (businessRule.status === 0
    && businessRule.stdout.includes("Business Rule Closure")
    && businessRule.stdout.includes("This closure writes target files: No")) {
    pass("CLI business-rule delegates to business rule closure resolver");
  } else {
    fail(`CLI business-rule failed: ${businessRule.stderr || businessRule.stdout}`);
  }

  const businessRuleCheck = runNode(["scripts/cli.mjs", "business-rule-check", ".", "--allow-empty"]);
  if (businessRuleCheck.status === 0 && businessRuleCheck.stdout.includes("Business Rule Closure check passed")) {
    pass("CLI business-rule-check delegates to business rule closure checker");
  } else {
    fail(`CLI business-rule-check failed: ${businessRuleCheck.stderr || businessRuleCheck.stdout}`);
  }

  const impactCoverage = runNode(["scripts/cli.mjs", "impact-coverage", ".", "--intent", "add contract input restriction"]);
  if (impactCoverage.status === 0
    && impactCoverage.stdout.includes("Change Impact Coverage Report")
    && impactCoverage.stdout.includes("This report writes target files: No")) {
    pass("CLI impact-coverage delegates to change impact coverage resolver");
  } else {
    fail(`CLI impact-coverage failed: ${impactCoverage.stderr || impactCoverage.stdout}`);
  }

  const impactCoverageCheck = runNode(["scripts/cli.mjs", "impact-coverage-check", "."]);
  if (impactCoverageCheck.status === 0 && impactCoverageCheck.stdout.includes("Change Impact Coverage check passed")) {
    pass("CLI impact-coverage-check delegates to change impact coverage checker");
  } else {
    fail(`CLI impact-coverage-check failed: ${impactCoverageCheck.stderr || impactCoverageCheck.stdout}`);
  }

  const deliveryPath = runNode(["scripts/cli.mjs", "delivery-path", "."]);
  if (deliveryPath.status === 0
    && deliveryPath.stdout.includes("Delivery Path Report")
    && deliveryPath.stdout.includes("This report writes target files: No")) {
    pass("CLI delivery-path delegates to delivery path resolver");
  } else {
    fail(`CLI delivery-path failed: ${deliveryPath.stderr || deliveryPath.stdout}`);
  }

  const deliveryPathCheck = runNode(["scripts/cli.mjs", "delivery-path-check", "."]);
  if (deliveryPathCheck.status === 0 && deliveryPathCheck.stdout.includes("Delivery path check passed")) {
    pass("CLI delivery-path-check delegates to delivery path checker");
  } else {
    fail(`CLI delivery-path-check failed: ${deliveryPathCheck.stderr || deliveryPathCheck.stdout}`);
  }

  const debtHandoff = runNode(["scripts/cli.mjs", "debt-handoff", "."]);
  if (debtHandoff.status === 0
    && debtHandoff.stdout.includes("Debt & Knowledge Handoff Report")
    && debtHandoff.stdout.includes("This report forgives debt: No")) {
    pass("CLI debt-handoff delegates to debt handoff resolver");
  } else {
    fail(`CLI debt-handoff failed: ${debtHandoff.stderr || debtHandoff.stdout}`);
  }

  const debtHandoffCheck = runNode(["scripts/cli.mjs", "debt-handoff-check", "."]);
  if (debtHandoffCheck.status === 0 && debtHandoffCheck.stdout.includes("Debt & Knowledge Handoff check passed")) {
    pass("CLI debt-handoff-check delegates to debt handoff checker");
  } else {
    fail(`CLI debt-handoff-check failed: ${debtHandoffCheck.stderr || debtHandoffCheck.stdout}`);
  }

  const archiveApply = runNode(["scripts/cli.mjs", "archive-apply", "."]);
  if (archiveApply.status === 0
    && archiveApply.stdout.includes("Document Archive Apply Plan")
    && archiveApply.stdout.includes("This plan authorizes archive apply: No")) {
    pass("CLI archive-apply delegates to document archive apply resolver");
  } else {
    fail(`CLI archive-apply failed: ${archiveApply.stderr || archiveApply.stdout}`);
  }

  const archiveApplyCheck = runNode(["scripts/cli.mjs", "archive-apply-check", "."]);
  if (archiveApplyCheck.status === 0 && archiveApplyCheck.stdout.includes("Document Archive Apply check passed")) {
    pass("CLI archive-apply-check delegates to document archive apply checker");
  } else {
    fail(`CLI archive-apply-check failed: ${archiveApplyCheck.stderr || archiveApplyCheck.stdout}`);
  }

  const applyPlan = runNode(["scripts/cli.mjs", "apply-plan", ".", "--intent", "maintain IntentOS apply plan", "--action", "workflow-assets"]);
  if (applyPlan.status === 0
    && applyPlan.stdout.includes("Unified Apply Plan")
    && applyPlan.stdout.includes("This plan authorizes apply: No")
    && applyPlan.stdout.includes("Can Codex write now: No")) {
    pass("CLI apply-plan delegates to unified apply plan resolver");
  } else {
    fail(`CLI apply-plan failed: ${applyPlan.stderr || applyPlan.stdout}`);
  }

  const applyPlanCheck = runNode(["scripts/cli.mjs", "apply-plan-check", "."]);
  if (applyPlanCheck.status === 0 && applyPlanCheck.stdout.includes("Unified Apply Plan check passed")) {
    pass("CLI apply-plan-check delegates to unified apply plan checker");
  } else {
    fail(`CLI apply-plan-check failed: ${applyPlanCheck.stderr || applyPlanCheck.stdout}`);
  }

  const baselineDecision = runNode(["scripts/cli.mjs", "baseline-decision", "."]);
  if (baselineDecision.status === 0 && baselineDecision.stdout.includes("Baseline Decision Card") && baselineDecision.stdout.includes("This card authorizes target-project writes: No")) {
    pass("CLI baseline-decision delegates to guided baseline resolver");
  } else {
    fail(`CLI baseline-decision failed: ${baselineDecision.stderr || baselineDecision.stdout}`);
  }

  const baselineDecisionCheck = runNode(["scripts/cli.mjs", "baseline-decision-check", "."]);
  if (baselineDecisionCheck.status === 0 && baselineDecisionCheck.stdout.includes("Guided Baseline Selection Check")) {
    pass("CLI baseline-decision-check delegates to guided baseline checker");
  } else {
    fail(`CLI baseline-decision-check failed: ${baselineDecisionCheck.stderr || baselineDecisionCheck.stdout}`);
  }

  const baselinePacks = runNode(["scripts/cli.mjs", "baseline-packs", "."]);
  if (baselinePacks.status === 0 && baselinePacks.stdout.includes("Baseline Pack Recommendation") && baselinePacks.stdout.includes("umbrella read-only recommendation")) {
    pass("CLI baseline-packs delegates to umbrella baseline pack resolver");
  } else {
    fail(`CLI baseline-packs failed: ${baselinePacks.stderr || baselinePacks.stdout}`);
  }

  const standardBaseline = runNode(["scripts/cli.mjs", "standard-baseline", "."]);
  if (standardBaseline.status === 0 && standardBaseline.stdout.includes("Standard Baseline Recommendation")) {
    pass("CLI standard-baseline delegates to standard baseline resolver");
  } else {
    fail(`CLI standard-baseline failed: ${standardBaseline.stderr || standardBaseline.stdout}`);
  }

  const standardBaselineSelection = runNode(["scripts/cli.mjs", "standard-baseline-selection", "."]);
  if (standardBaselineSelection.status === 0 && standardBaselineSelection.stdout.includes("Standard Baseline Selection Check")) {
    pass("CLI standard-baseline-selection delegates to standard baseline checker");
  } else {
    fail(`CLI standard-baseline-selection failed: ${standardBaselineSelection.stderr || standardBaselineSelection.stdout}`);
  }

  const baselinePackSelection = runNode(["scripts/cli.mjs", "baseline-pack-selection", "."]);
  if (baselinePackSelection.status === 0 && baselinePackSelection.stdout.includes("Baseline Pack Selection Check")) {
    pass("CLI baseline-pack-selection delegates to baseline pack checker");
  } else {
    fail(`CLI baseline-pack-selection failed: ${baselinePackSelection.stderr || baselinePackSelection.stdout}`);
  }

  const productBaseline = runNode(["scripts/cli.mjs", "product-baseline", "."]);
  if (productBaseline.status === 0 && productBaseline.stdout.includes("Product baseline check passed")) {
    pass("CLI product-baseline delegates to product baseline checker");
  } else {
    fail(`CLI product-baseline failed: ${productBaseline.stderr || productBaseline.stdout}`);
  }

  const claimControl = runNode(["scripts/cli.mjs", "claim-control", "."]);
  if (claimControl.status === 0 && claimControl.stdout.includes("Claim control check passed")) {
    pass("CLI claim-control delegates to claim control checker");
  } else {
    fail(`CLI claim-control failed: ${claimControl.stderr || claimControl.stdout}`);
  }

  const contextGovernance = runNode(["scripts/cli.mjs", "context-governance", "."]);
  if (contextGovernance.status === 0 && contextGovernance.stdout.includes("Context governance check passed")) {
    pass("CLI context-governance delegates to context governance checker");
  } else {
    fail(`CLI context-governance failed: ${contextGovernance.stderr || contextGovernance.stdout}`);
  }

  const launchReadiness = runNode(["scripts/cli.mjs", "launch-readiness", "."]);
  if (launchReadiness.status === 0 && launchReadiness.stdout.includes("Launch readiness check passed")) {
    pass("CLI launch-readiness delegates to launch readiness checker");
  } else {
    fail(`CLI launch-readiness failed: ${launchReadiness.stderr || launchReadiness.stdout}`);
  }

  const launchView = runNode(["scripts/cli.mjs", "launch-view", ".", "--intent", "prepare release review", "--verification", "npm run verify passed"]);
  if (launchView.status === 0
    && launchView.stdout.includes("Launch Review View")
    && launchView.stdout.includes("This view approves release or production: No")) {
    pass("CLI launch-view delegates to launch review view resolver");
  } else {
    fail(`CLI launch-view failed: ${launchView.stderr || launchView.stdout}`);
  }

  const launchViewCheck = runNode(["scripts/cli.mjs", "launch-view-check", "."]);
  if (launchViewCheck.status === 0 && launchViewCheck.stdout.includes("Launch Review View check passed")) {
    pass("CLI launch-view-check delegates to launch review view checker");
  } else {
    fail(`CLI launch-view-check failed: ${launchViewCheck.stderr || launchViewCheck.stdout}`);
  }

  const releaseAdapter = runNode(["scripts/cli.mjs", "release-adapter", ".", "--intent", "prepare release adapter"]);
  if (releaseAdapter.status === 0
    && releaseAdapter.stdout.includes("Release Adapter Profile")
    && releaseAdapter.stdout.includes("Beginner Release Card")
    && releaseAdapter.stdout.includes("This adapter approves release: No")
    && releaseAdapter.stdout.includes("This adapter deploys by itself: No")) {
    pass("CLI release-adapter delegates to release adapter resolver");
  } else {
    fail(`CLI release-adapter failed: ${releaseAdapter.stderr || releaseAdapter.stdout}`);
  }

  const releaseAdapterCheck = runNode(["scripts/cli.mjs", "release-adapter-check", "."]);
  if (releaseAdapterCheck.status === 0 && releaseAdapterCheck.stdout.includes("Release Adapter check passed")) {
    pass("CLI release-adapter-check delegates to release adapter checker");
  } else {
    fail(`CLI release-adapter-check failed: ${releaseAdapterCheck.stderr || releaseAdapterCheck.stdout}`);
  }

  const releaseGuide = runNode(["scripts/cli.mjs", "release-guide", ".", "--intent", "help me launch"]);
  if (releaseGuide.status === 0
    && releaseGuide.stdout.includes("Release Guide Card")
    && releaseGuide.stdout.includes("This guide approves release: No")
    && releaseGuide.stdout.includes("This guide deploys or publishes by itself: No")) {
    pass("CLI release-guide delegates to release guide resolver");
  } else {
    fail(`CLI release-guide failed: ${releaseGuide.stderr || releaseGuide.stdout}`);
  }

  const releaseGuideCheck = runNode(["scripts/cli.mjs", "release-guide-check", "."]);
  if (releaseGuideCheck.status === 0 && releaseGuideCheck.stdout.includes("Release Guide check passed")) {
    pass("CLI release-guide-check delegates to release guide checker");
  } else {
    fail(`CLI release-guide-check failed: ${releaseGuideCheck.stderr || releaseGuideCheck.stdout}`);
  }

  const releaseRecipe = runNode(["scripts/cli.mjs", "release-recipe", ".", "--intent", "help me launch"]);
  if (releaseRecipe.status === 0
    && releaseRecipe.stdout.includes("Platform Release Recipe Selection")
    && releaseRecipe.stdout.includes("This recipe approves release: No")
    && releaseRecipe.stdout.includes("This recipe deploys or publishes by itself: No")) {
    pass("CLI release-recipe delegates to platform release recipe resolver");
  } else {
    fail(`CLI release-recipe failed: ${releaseRecipe.stderr || releaseRecipe.stdout}`);
  }

  const releaseRecipeCheck = runNode(["scripts/cli.mjs", "release-recipe-check", "."]);
  if (releaseRecipeCheck.status === 0 && releaseRecipeCheck.stdout.includes("Platform Release Recipe check passed")) {
    pass("CLI release-recipe-check delegates to platform release recipe checker");
  } else {
    fail(`CLI release-recipe-check failed: ${releaseRecipeCheck.stderr || releaseRecipeCheck.stdout}`);
  }

  const releaseHandoff = runNode(["scripts/cli.mjs", "release-handoff", ".", "--intent", "help me launch"]);
  if (releaseHandoff.status === 0
    && releaseHandoff.stdout.includes("Release Handoff Pack")
    && releaseHandoff.stdout.includes("This pack approves release: No")
    && releaseHandoff.stdout.includes("This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No")) {
    pass("CLI release-handoff delegates to release handoff pack resolver");
  } else {
    fail(`CLI release-handoff failed: ${releaseHandoff.stderr || releaseHandoff.stdout}`);
  }

  const releaseHandoffCheck = runNode(["scripts/cli.mjs", "release-handoff-check", "."]);
  if (releaseHandoffCheck.status === 0 && releaseHandoffCheck.stdout.includes("Release Handoff Pack check passed")) {
    pass("CLI release-handoff-check delegates to release handoff pack checker");
  } else {
    fail(`CLI release-handoff-check failed: ${releaseHandoffCheck.stderr || releaseHandoffCheck.stdout}`);
  }

  const releaseExecution = runNode(["scripts/cli.mjs", "release-execution", ".", "--intent", "prepare release execution"]);
  if (releaseExecution.status === 0
    && releaseExecution.stdout.includes("Release Execution Plan")
    && releaseExecution.stdout.includes("This plan approves release: No")
    && releaseExecution.stdout.includes("This plan executes release by itself: No")) {
    pass("CLI release-execution delegates to release execution resolver");
  } else {
    fail(`CLI release-execution failed: ${releaseExecution.stderr || releaseExecution.stdout}`);
  }

  const releaseExecutionCheck = runNode(["scripts/cli.mjs", "release-execution-check", "."]);
  if (releaseExecutionCheck.status === 0 && releaseExecutionCheck.stdout.includes("Release Execution check passed")) {
    pass("CLI release-execution-check delegates to release execution checker");
  } else {
    fail(`CLI release-execution-check failed: ${releaseExecutionCheck.stderr || releaseExecutionCheck.stdout}`);
  }

  const conversationDrift = runNode(["scripts/cli.mjs", "conversation-drift", "."]);
  if (conversationDrift.status === 0 && conversationDrift.stdout.includes("Conversation drift check passed")) {
    pass("CLI conversation-drift delegates to conversation drift checker");
  } else {
    fail(`CLI conversation-drift failed: ${conversationDrift.stderr || conversationDrift.stdout}`);
  }

  const guidedDelivery = runNode(["scripts/cli.mjs", "guided-delivery", "."]);
  if (guidedDelivery.status === 0 && guidedDelivery.stdout.includes("Guided delivery loop check passed")) {
    pass("CLI guided-delivery delegates to guided delivery loop checker");
  } else {
    fail(`CLI guided-delivery failed: ${guidedDelivery.stderr || guidedDelivery.stdout}`);
  }

  const firstDelivery = runNode(["scripts/cli.mjs", "first-delivery", "."]);
  if (firstDelivery.status === 0 && firstDelivery.stdout.includes("First delivery walkthrough check passed")) {
    pass("CLI first-delivery delegates to first delivery checker");
  } else {
    fail(`CLI first-delivery failed: ${firstDelivery.stderr || firstDelivery.stdout}`);
  }

  const realAdoption = runNode(["scripts/cli.mjs", "real-adoption", "."]);
  if (realAdoption.status === 0 && realAdoption.stdout.includes("Real adoption trial check passed")) {
    pass("CLI real-adoption delegates to real adoption checker");
  } else {
    fail(`CLI real-adoption failed: ${realAdoption.stderr || realAdoption.stdout}`);
  }

  const patchClassification = runNode(["scripts/cli.mjs", "patch-classification", "."]);
  if (patchClassification.status === 0 && patchClassification.stdout.includes("Patch classification check passed")) {
    pass("CLI patch-classification delegates to patch classification checker");
  } else {
    fail(`CLI patch-classification failed: ${patchClassification.stderr || patchClassification.stdout}`);
  }

  const workflowMap = runNode(["scripts/cli.mjs", "workflow-map", "."]);
  if (workflowMap.status === 0 && workflowMap.stdout.includes("Workflow Adoption Map Recommendation")) {
    pass("CLI workflow-map delegates to workflow adapter resolver");
  } else {
    fail(`CLI workflow-map failed: ${workflowMap.stderr || workflowMap.stdout}`);
  }

  const workflowMapCheck = runNode(["scripts/cli.mjs", "workflow-map-check", "."]);
  if (workflowMapCheck.status === 0 && workflowMapCheck.stdout.includes("Workflow adoption map check passed")) {
    pass("CLI workflow-map-check delegates to workflow adoption map checker");
  } else {
    fail(`CLI workflow-map-check failed: ${workflowMapCheck.stderr || workflowMapCheck.stdout}`);
  }

  const changeBoundary = runNode(["scripts/cli.mjs", "change-boundary", "."]);
  if (changeBoundary.status === 0 && changeBoundary.stdout.includes("Change boundary check passed")) {
    pass("CLI change-boundary delegates to change boundary checker");
  } else {
    fail(`CLI change-boundary failed: ${changeBoundary.stderr || changeBoundary.stdout}`);
  }

  const baselineState = runNode(["scripts/cli.mjs", "baseline-state", "."]);
  if (baselineState.status === 0 && baselineState.stdout.includes("Baseline state check passed")) {
    pass("CLI baseline-state delegates to baseline state checker");
  } else {
    fail(`CLI baseline-state failed: ${baselineState.stderr || baselineState.stdout}`);
  }

  const start = runNode(["scripts/cli.mjs", "start", "."]);
  if (start.status === 0
    && start.stdout.includes("# Guided Adoption Recommendation")
    && start.stdout.includes("Can AI write now | No")
    && start.stdout.includes("start is read-only by default")
    && start.stdout.includes("target files written by start | No")) {
    pass("CLI start prints read-only guided adoption recommendation");
  } else {
    fail(`CLI start failed or hid guided adoption recommendation: ${start.stderr || start.stdout}`);
  }

  const startJson = runNode(["scripts/cli.mjs", "start", ".", "--json"]);
  try {
    const parsedStart = JSON.parse(startJson.stdout);
    if (startJson.status === 0
      && parsedStart.startIsReadOnlyByDefault === true
      && parsedStart.classification?.canAiWriteNow === "No"
      && parsedStart.reportType === "ADOPTION_RECOMMENDATION") {
      pass("CLI start --json returns structured read-only recommendation");
    } else {
      fail(`CLI start --json missing read-only structure: ${startJson.stderr || startJson.stdout}`);
    }
  } catch (error) {
    fail(`CLI start --json returned invalid JSON: ${error.message}`);
  }

  const startTempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-cli-start-"));
  try {
    const newTarget = path.join(startTempRoot, "new-project");
    fs.mkdirSync(newTarget, { recursive: true });
    const startNew = runNode(["scripts/cli.mjs", "start", newTarget]);
    const targetEntries = fs.readdirSync(newTarget);
    if (startNew.status === 0
      && startNew.stdout.includes("Project type | NEW_PROJECT")
      && startNew.stdout.includes("Can AI write now | No")
      && targetEntries.length === 0) {
      pass("CLI start classifies empty target without mutating it");
    } else {
      fail(`CLI start new-project smoke failed or mutated target: ${startNew.stderr || startNew.stdout}`);
    }
  } finally {
    fs.rmSync(startTempRoot, { recursive: true, force: true });
  }

  const fixtures = runNode(["scripts/cli.mjs", "fixtures"]);
  if (fixtures.status === 0 && fixtures.stdout.includes("Fixture checks passed")) {
    pass("CLI fixtures delegates to fixture suite");
  } else {
    fail(`CLI fixtures failed: ${fixtures.stderr || fixtures.stdout}`);
  }

  const selfCheckDryRun = runNode(["scripts/cli.mjs", "--dry-run", "self-check"]);
  if (selfCheckDryRun.status === 0 && selfCheckDryRun.stdout.includes("node scripts/check-intentos.mjs")) {
    pass("CLI self-check dry-run delegates to check-intentos");
  } else {
    fail(`CLI self-check dry-run missing check-intentos mapping: ${selfCheckDryRun.stderr || selfCheckDryRun.stdout}`);
  }

  const updateDryRun = runNode(["scripts/cli.mjs", "--dry-run", "update", "--target", "/tmp/intentos-cli-dry-run"]);
  if (updateDryRun.status === 0
    && updateDryRun.stdout.includes("node scripts/init-project.mjs")
    && updateDryRun.stdout.includes("--update-workflow-assets")) {
    pass("CLI update dry-run prints underlying update command");
  } else {
    fail(`CLI update dry-run missing underlying update command: ${updateDryRun.stderr || updateDryRun.stdout}`);
  }

  const cliCommandDryRunRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-cli-command-dry-run-"));
  try {
    const commandDryRunTarget = path.join(cliCommandDryRunRoot, "project");
    fs.mkdirSync(commandDryRunTarget, { recursive: true });
    const updateCommandDryRun = runNode(["scripts/cli.mjs", "update", "--target", commandDryRunTarget, "--dry-run"]);
    if (updateCommandDryRun.status === 0
      && updateCommandDryRun.stdout.includes('"operation": "UPDATE_WORKFLOW_ASSETS"')
      && !fs.existsSync(path.join(commandDryRunTarget, ".intentos", "version.json"))) {
      pass("CLI command-level update dry-run delegates to init/update plan preview");
    } else {
      fail(`CLI command-level update dry-run failed: ${updateCommandDryRun.stderr || updateCommandDryRun.stdout}`);
    }
  } finally {
    fs.rmSync(cliCommandDryRunRoot, { recursive: true, force: true });
  }

  const doctorDryRun = runNode(["scripts/cli.mjs", "--dry-run", "doctor", "."]);
  if (doctorDryRun.status === 0
    && doctorDryRun.stdout.includes("node scripts/workflow-next.mjs .")
    && doctorDryRun.stdout.includes("node scripts/check-intentos.mjs")) {
    pass("CLI doctor dry-run routes intentos source to self-check sequence");
  } else {
    fail(`CLI doctor dry-run missing intentos source sequence: ${doctorDryRun.stderr || doctorDryRun.stdout}`);
  }

  const doctorTargetRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-cli-doctor-target-"));
  try {
    const doctorTarget = path.join(doctorTargetRoot, "project");
    fs.mkdirSync(doctorTarget, { recursive: true });
    const doctorTargetDryRun = runNode(["scripts/cli.mjs", "--dry-run", "doctor", doctorTarget]);
    if (doctorTargetDryRun.status === 0
      && doctorTargetDryRun.stdout.includes(`node scripts/workflow-next.mjs ${doctorTarget}`)
      && doctorTargetDryRun.stdout.includes(`node scripts/check-ai-workflow.mjs ${doctorTarget} --mode core`)) {
      pass("CLI doctor dry-run routes target project to workflow-next and core check sequence");
    } else {
      fail(`CLI doctor dry-run missing target project sequence: ${doctorTargetDryRun.stderr || doctorTargetDryRun.stdout}`);
    }
  } finally {
    fs.rmSync(doctorTargetRoot, { recursive: true, force: true });
  }

  const migrateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-cli-migrate-"));
  try {
    const migrateTarget = path.join(migrateRoot, "project");
    fs.mkdirSync(migrateTarget, { recursive: true });

    const migrateUnsafe = runNode([
      "scripts/cli.mjs",
      "migrate",
      "--target",
      migrateTarget,
      "--from",
      "0.33.0",
      "--to",
      "1.0.0",
    ]);
    const unsafeOutput = `${migrateUnsafe.stdout}\n${migrateUnsafe.stderr}`;
    if (migrateUnsafe.status === 2 && unsafeOutput.includes("plan-only")) {
      pass("CLI migrate refuses direct apply without dry-run or write-plan");
    } else {
      fail(`CLI migrate must fail without a safe output mode: ${unsafeOutput}`);
    }

    const migrateDryRun = runNode([
      "scripts/cli.mjs",
      "migrate",
      "--target",
      migrateTarget,
      "--from",
      "0.33.0",
      "--to",
      "1.0.0",
      "--dry-run",
    ]);
    if (migrateDryRun.status === 0
      && migrateDryRun.stdout.includes("IntentOS Migration Plan")
      && migrateDryRun.stdout.includes("No target project files were modified.")
      && !fs.existsSync(path.join(migrateTarget, ".intentos"))) {
      pass("CLI migrate dry-run prints plan and does not mutate target");
    } else {
      fail(`CLI migrate dry-run failed or mutated target: ${migrateDryRun.stderr || migrateDryRun.stdout}`);
    }

    const planRelativePath = "apply-execution-plans/migration-plan.json";
    const planPath = path.join(migrateTarget, planRelativePath);
    const migrateWritePlan = runNode([
      "scripts/cli.mjs",
      "migrate",
      "--target",
      migrateTarget,
      "--from",
      "0.33.0",
      "--to",
      "1.0.0",
      "--write-plan",
      planRelativePath,
    ]);
    const wrotePlan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, "utf8")) : null;
    if (migrateWritePlan.status === 0
      && wrotePlan?.blockedApply === true
      && Array.isArray(wrotePlan.actions)
      && wrotePlan.actions.length > 0
      && !fs.existsSync(path.join(migrateTarget, ".intentos"))) {
      pass("CLI migrate write-plan writes reviewable plan only");
    } else {
      fail(`CLI migrate write-plan failed safety check: ${migrateWritePlan.stderr || migrateWritePlan.stdout}`);
    }
  } finally {
    fs.rmSync(migrateRoot, { recursive: true, force: true });
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-cli-"));
  try {
    const target = path.join(tempRoot, "project");
    const init = runNode(["scripts/cli.mjs", "init", "--starter", "generic-project", "--target", target]);
    if (init.status !== 0) {
      fail(`CLI init failed: ${init.stderr || init.stdout}`);
      return;
    }
    if (!init.stdout.includes("Underlying command: node scripts/init-project.mjs")) {
      fail("CLI init must print the underlying write command");
      return;
    }
    const check = runNode([path.join(target, "scripts", "check-ai-workflow.mjs"), target, "--mode", "core"]);
    if (check.status === 0) {
      pass("CLI init generated project passes core workflow check");
    } else {
      fail(`CLI init generated project failed core check: ${check.stderr || check.stdout}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkCorePurity() {
  const scannedDirs = [
    "core",
    "templates",
    "prompts",
    "checklists",
    "starters/generic-project",
    "examples/generic-first-change",
  ];
  const bannedPatterns = [
    /中小/,
    /项目管理/,
    /财务/,
    /人资/,
    /税务/,
    /薪酬/,
    /报销/,
    /客户/,
    /应收/,
    /应付/,
    /workspace/i,
    /project create/i,
    /project list/i,
    /web-first/i,
    /project-management/i,
    /high-risk-business/i,
  ];

  for (const dir of scannedDirs) {
    for (const file of walkSourceFiles(dir)) {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of bannedPatterns) {
        if (pattern.test(content)) {
          fail(`business/platform-specific term ${pattern} found in ${rel(file)}`);
        }
      }
    }
  }

  if (!failed) pass("core/default assets are business-neutral by banned-term scan");
}

function checkGuidedAdoptionEntry() {
  const requiredFiles = [
    "scripts/start-project.mjs",
    "scripts/check-guided-adoption.mjs",
    "templates/adoption-recommendation-report.md",
    "docs/first-hour.md",
    "adoption-recommendations/.gitkeep",
    "examples/1.1-guided-adoption/README.md",
    "examples/1.1-guided-adoption/new-project/adoption-recommendations/001-guided-start.md",
    "examples/1.1-guided-adoption/existing-light-project/adoption-recommendations/001-guided-start.md",
    "examples/1.1-guided-adoption/governed-readonly/adoption-recommendations/001-guided-start.md",
    "releases/1.1.0/release-record.md",
    "releases/1.1.0/start-smoke.md",
    "releases/1.1.0/guided-adoption-example.md",
    "releases/1.1.0/known-limitations.md",
    "releases/1.1.0/self-check-report.md",
  ];

  for (const file of requiredFiles) {
    if (exists(file)) pass(`guided adoption asset exists ${file}`);
    else fail(`guided adoption asset missing ${file}`);
  }

  const template = read("templates/adoption-recommendation-report.md");
  for (const marker of [
    "# Guided Adoption Recommendation",
    "Can AI write now | No",
    "start is read-only by default",
    "target files written by start | No",
    "explicit human confirmation",
    "Do not install all industrial packs by default",
  ]) {
    if (template.includes(marker)) pass(`guided adoption template includes ${marker}`);
    else fail(`guided adoption template missing ${marker}`);
  }

  for (const example of [
    "examples/1.1-guided-adoption/new-project",
    "examples/1.1-guided-adoption/existing-light-project",
    "examples/1.1-guided-adoption/governed-readonly",
  ]) {
    const result = runNode(["scripts/check-guided-adoption.mjs", example]);
    if (result.status === 0) {
      pass(`guided adoption example passes ${example}`);
    } else {
      fail(`guided adoption example failed ${example}: ${result.stderr || result.stdout}`);
    }
  }

  const guidedHelp = runNode(["scripts/cli.mjs", "--dry-run", "start", "."]);
  if (guidedHelp.status === 0 && guidedHelp.stdout.includes("node scripts/start-project.mjs .")) {
    pass("CLI start dry-run maps to start-project");
  } else {
    fail(`CLI start dry-run mapping failed: ${guidedHelp.stderr || guidedHelp.stdout}`);
  }
}

function checkReviewLoopProtocol() {
  const files = {
    "core/review-loop.md": read("core/review-loop.md"),
    "templates/review-loop-report.md": read("templates/review-loop-report.md"),
    "templates/gpt-review-prompt.md": read("templates/gpt-review-prompt.md"),
    "checklists/review-loop-review.md": read("checklists/review-loop-review.md"),
    "prompts/reviewer-agent.md": read("prompts/reviewer-agent.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "Max auto-fix rounds: 2",
    "AUTO_FIX",
    "NEEDS_HUMAN_DECISION",
    "NEEDS_CLARIFICATION",
    "NO_ACTION",
    "NO_ACTION requires a reason",
    "NEEDS_CLARIFICATION can be attempted once",
    "must not edit files",
    "must not approve release",
    "scope expansion",
    "new dependency",
    "architecture change",
    "permission model change",
    "database migration",
    "production configuration",
    "Human Approval",
    "Approval scope",
    "Risk Gate",
    "2 rounds",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`review loop protocol includes ${marker}`);
    } else {
      fail(`review loop protocol missing ${marker}`);
    }
  }

  if (files["core/review-loop.md"].includes("Hook-based reviewer automation can be added later")) {
    pass("review loop protocol keeps hook automation future-scoped");
  } else {
    fail("review loop protocol must keep hook automation future-scoped");
  }
}

function checkNextStepBoundaryProtocol() {
  const files = {
    "core/next-step-boundary.md": read("core/next-step-boundary.md"),
    "templates/task-card.md": read("templates/task-card.md"),
    "templates/review-loop-report.md": read("templates/review-loop-report.md"),
    "templates/follow-up-proposal.md": read("templates/follow-up-proposal.md"),
    "templates/final-report.md": read("templates/final-report.md"),
    "checklists/next-step-boundary-review.md": read("checklists/next-step-boundary-review.md"),
    "prompts/builder-agent.md": read("prompts/builder-agent.md"),
    "prompts/reviewer-agent.md": read("prompts/reviewer-agent.md"),
    "prompts/reporter-agent.md": read("prompts/reporter-agent.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "Codex may suggest next steps, but suggestions must be bounded, classified, and actionable.",
    "IN_SCOPE_NEXT_STEP",
    "DIRECT_FOLLOW_UP",
    "RISK_DECISION",
    "OUT_OF_SCOPE_OBSERVATION",
    "DO_NOT_PROCEED",
    "Can AI do now?",
    "Required entry",
    "Next-Step Suggestions",
    "Human Decisions Needed",
    "Next Safe Action",
    "Finding = current task issue",
    "Suggestion = possible work or context after the current task",
    "Future work must be listed under `Next-Step Suggestions`, not as AUTO_FIX",
    "follow-up proposal",
    "final report",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`next-step boundary protocol includes ${marker}`);
    } else {
      fail(`next-step boundary protocol missing ${marker}`);
    }
  }

  if (files["templates/task-card.md"].includes("Authorized Next Actions")
    && files["templates/task-card.md"].includes("Codex must not implement next-step suggestions")) {
    pass("task card constrains authorized next actions");
  } else {
    fail("task card must constrain authorized next actions and next-step implementation");
  }
}

function checkGoalModeProtocol() {
  const files = {
    "core/goal-mode.md": read("core/goal-mode.md"),
    "templates/goal-card.md": read("templates/goal-card.md"),
    "checklists/goal-mode-review.md": read("checklists/goal-mode-review.md"),
    "prompts/goal-planner-agent.md": read("prompts/goal-planner-agent.md"),
    "platforms/codex/AGENTS.template.md": read("platforms/codex/AGENTS.template.md"),
    "starters/generic-project/AGENTS.md": read("starters/generic-project/AGENTS.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "Goal Mode is the workflow entry layer",
    "routing protocol, not execution approval",
    "DISCUSS_ONLY",
    "ADOPT_PROJECT",
    "DEFINE_WORK",
    "IMPLEMENT_TASK",
    "REVIEW_TASK",
    "REPAIR_TASK",
    "BASELINE_DECISION",
    "HANDOFF_OR_REPORT",
    "Goal Card is route selection only",
    "does not approve implementation",
    "ADOPTION_MODE: READ_ONLY",
    "RUN_ADOPTION_ASSESSMENT",
    "request, preflight, spec, eval, and task",
    "AUTO_FIX",
    "maximum 2 auto-fix rounds",
    "Decision Brief",
    "Subagent orchestration is not activated",
    "Do not call external GPT/API reviewers",
    "node scripts/check-goal-mode.mjs .",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`goal mode protocol includes ${marker}`);
    } else {
      fail(`goal mode protocol missing ${marker}`);
    }
  }

  const checker = read("scripts/check-goal-mode.mjs");
  for (const marker of [
    "legalModes",
    "DISCUSS_ONLY allowed actions must stay read-only",
    "ADOPT_PROJECT with READ_ONLY adoption must not allow workflow asset writes",
    "IMPLEMENT_TASK requires a selected task card",
    "REPAIR_TASK must reference AUTO_FIX findings",
    "L2/L3 Goal Card must plan Review Packet handling",
    "Allowed Actions must not approve release",
  ]) {
    if (checker.includes(marker)) {
      pass(`goal mode checker includes ${marker}`);
    } else {
      fail(`goal mode checker missing ${marker}`);
    }
  }

  const goodExample = runNode([
    path.join(kitRoot, "scripts", "check-goal-mode.mjs"),
    path.join(kitRoot, "examples", "goal-mode-first-route"),
  ]);
  if (goodExample.status !== 0) {
    fail(`Goal Mode example check failed: ${goodExample.stderr || goodExample.stdout}`);
  } else {
    pass("Goal Mode example check");
  }
}

function checkEngineeringBaselineProtocol() {
  const files = {
    "core/engineering-baseline.md": read("core/engineering-baseline.md"),
    "templates/engineering-baseline.md": read("templates/engineering-baseline.md"),
    "checklists/engineering-baseline-review.md": read("checklists/engineering-baseline-review.md"),
    "prompts/builder-agent.md": read("prompts/builder-agent.md"),
    "prompts/reviewer-agent.md": read("prompts/reviewer-agent.md"),
    "templates/review-packet.md": read("templates/review-packet.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "docs/engineering-baseline.md",
    "project-wide engineering conventions",
    "low-risk local changes",
    "DTO / schema / domain",
    "enum / string / lookup",
    "state-machine",
    "API Contract Source",
    "generated type",
    "Decision Brief",
    "Engineering baseline checked",
    "Engineering baseline gaps",
    "not a coding style guide",
    "source-code scanning gates",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`engineering baseline protocol includes ${marker}`);
    } else {
      fail(`engineering baseline protocol missing ${marker}`);
    }
  }

  const checker = read("scripts/check-engineering-baseline.mjs");
  for (const marker of ["advisory", "PENDING", "args.strict", "args.json", "docs/engineering-baseline.md"]) {
    if (checker.includes(marker)) {
      pass(`engineering baseline checker includes ${marker}`);
    } else {
      fail(`engineering baseline checker missing ${marker}`);
    }
  }
}

function checkSubagentOrchestrationProtocol() {
  for (const file of [
    "core/subagent-dispatch-hygiene.md",
    "docs/subagent-dispatch-hygiene.md",
    "docs/plans/subagent-dispatch-hygiene-1.39-plan.md",
    "examples/1.39-subagent-dispatch-hygiene/README.md",
    "examples/1.39-subagent-dispatch-hygiene/subagent-run-plans/001-dispatch-hygiene.md",
    "test-fixtures/bad/bad-subagent-dispatch-idle-running/subagent-run-plans/001-bad.md",
    "test-fixtures/bad/bad-subagent-dispatch-multiple-writers/subagent-run-plans/001-bad.md",
    "test-fixtures/bad/bad-subagent-dispatch-task-drift/subagent-run-plans/001-bad.md",
    "releases/1.39.0/release-record.md",
    "releases/1.39.0/known-limitations.md",
    "releases/1.39.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.39 subagent dispatch hygiene asset exists ${file}`);
    else fail(`1.39 subagent dispatch hygiene asset missing ${file}`);
  }

  const files = {
    "core/subagent-orchestration.md": read("core/subagent-orchestration.md"),
    "core/subagent-dispatch-hygiene.md": read("core/subagent-dispatch-hygiene.md"),
    "docs/subagent-dispatch-hygiene.md": read("docs/subagent-dispatch-hygiene.md"),
    "templates/subagent-run-plan.md": read("templates/subagent-run-plan.md"),
    "checklists/subagent-orchestration-review.md": read("checklists/subagent-orchestration-review.md"),
    "prompts/engineering-baseline-agent.md": read("prompts/engineering-baseline-agent.md"),
    "prompts/spec-agent.md": read("prompts/spec-agent.md"),
    "prompts/repair-agent.md": read("prompts/repair-agent.md"),
    "prompts/builder-agent.md": read("prompts/builder-agent.md"),
    "prompts/reviewer-agent.md": read("prompts/reviewer-agent.md"),
    "platforms/codex/AGENTS.template.md": read("platforms/codex/AGENTS.template.md"),
    "starters/generic-project/AGENTS.md": read("starters/generic-project/AGENTS.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "Subagent Orchestration defines how Codex may use helper agents",
    "Many readers, one writer",
    "READ_ONLY_RESEARCH",
    "PLAN_THEN_BUILD",
    "REVIEW_LOOP",
    "AUTO_FIX_REPAIR",
    "REPORTING",
    "READ_ONLY_DRAFT",
    "WRITER_LIMITED",
    "PLANNED",
    "RUNNING",
    "CLOSED",
    "SKIPPED",
    "All subagents must be CLOSED or SKIPPED before the main thread sends the final task response",
    "Close / Release Requirement",
    "Do not leave a subagent in `RUNNING` after its output has been consumed",
    "Do not keep standby subagents open",
    "Subagent Dispatch Hygiene",
    "Recover before dispatch",
    "Before dispatch checked",
    "Idle subagents recovered",
    "Completed subagents closed",
    "Unused planned subagents skipped",
    "Task drift checked",
    "Dispatch allowed",
    "Subagent output is input to the main thread",
    "use external GPT/API reviewer automation from this protocol",
    "node scripts/check-subagent-orchestration.mjs .",
    "Subagent Closure",
    "close after handing findings to the main thread",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`subagent orchestration protocol includes ${marker}`);
    } else {
      fail(`subagent orchestration protocol missing ${marker}`);
    }
  }

  const checker = read("scripts/check-subagent-orchestration.mjs");
  for (const marker of [
    "allowedModes",
    "subagent must be closed before final response",
    "more than one active writer is not allowed",
    "all subagents must be closed or skipped before final response",
    "subagents must not be left occupying slots after handoff",
    "Dispatch Hygiene",
    "idle subagents must be recovered before dispatch",
    "completed subagents must be closed before dispatch",
    "unused planned subagents must be skipped before dispatch",
    "stale task subagents must be closed or skipped before dispatch",
    "task drift must be checked before subagent dispatch",
    "dispatch cannot be allowed with more than one active writer",
    "Forbidden Actions missing guard",
    "external GPT\\/API",
  ]) {
    if (checker.includes(marker)) {
      pass(`subagent orchestration checker includes ${marker}`);
    } else {
      fail(`subagent orchestration checker missing ${marker}`);
    }
  }

  const goodExample = runNode([
    path.join(kitRoot, "scripts", "check-subagent-orchestration.mjs"),
    path.join(kitRoot, "examples", "subagent-orchestration-closed-run"),
  ]);
  if (goodExample.status !== 0) {
    fail(`Subagent Orchestration example check failed: ${goodExample.stderr || goodExample.stdout}`);
  } else {
    pass("Subagent Orchestration example check");
  }

  const dispatchExample = runNode([
    path.join(kitRoot, "scripts", "check-subagent-orchestration.mjs"),
    path.join(kitRoot, "examples", "1.39-subagent-dispatch-hygiene"),
  ]);
  if (dispatchExample.status !== 0) {
    fail(`Subagent Dispatch Hygiene example check failed: ${dispatchExample.stderr || dispatchExample.stdout}`);
  } else {
    pass("Subagent Dispatch Hygiene example check");
  }

  for (const [fixture, expected] of [
    ["bad-subagent-dispatch-idle-running", "idle subagents must be recovered before dispatch"],
    ["bad-subagent-dispatch-multiple-writers", "dispatch cannot be allowed with more than one active writer"],
    ["bad-subagent-dispatch-task-drift", "task drift must be checked before subagent dispatch"],
  ]) {
    const badResult = runNode([
      path.join(kitRoot, "scripts", "check-subagent-orchestration.mjs"),
      path.join(kitRoot, "test-fixtures", "bad", fixture),
    ]);
    if (badResult.status === 0 || !(badResult.stderr || badResult.stdout).includes(expected)) {
      fail(`Subagent Dispatch Hygiene fixture ${fixture} should fail with ${expected}: ${badResult.stderr || badResult.stdout}`);
    } else {
      pass(`Subagent Dispatch Hygiene fixture ${fixture} rejected`);
    }
  }
}

function checkOutputExperienceProtocol() {
  const files = {
    "core/output-protocol.md": read("core/output-protocol.md"),
    "core/glossary.md": read("core/glossary.md"),
    "templates/human-status-report.md": read("templates/human-status-report.md"),
    "templates/decision-brief.md": read("templates/decision-brief.md"),
    "templates/plain-review-summary.md": read("templates/plain-review-summary.md"),
    "templates/customer-handoff.md": read("templates/customer-handoff.md"),
    "prompts/reporter-agent.md": read("prompts/reporter-agent.md"),
  };
  const combined = Object.values(files).join("\n");
  const requiredMarkers = [
    "Human first. Technical second. Machine last.",
    "Human Decision Summary",
    "Recommended choice",
    "Writes project files?",
    "What happens if you do nothing",
    "Human Summary",
    "Current Status",
    "What I Need From You",
    "Recommended Next Step",
    "What AI Can Do Safely",
    "What AI Must Not Do",
    "Technical Details",
    "Audit Notes",
    "Machine-readable Output",
    "owner",
    "developer",
    "reviewer",
    "audit",
    "Must stop",
    "Approval scope",
    "Review Packet",
    "AUTO_FIX",
    "Decision Brief",
    "Customer Handoff Summary",
  ];

  for (const marker of requiredMarkers) {
    if (combined.includes(marker)) {
      pass(`output experience protocol includes ${marker}`);
    } else {
      fail(`output experience protocol missing ${marker}`);
    }
  }

  const workflowNext = read("scripts/workflow-next.mjs");
  for (const marker of ["--format human", "--format technical", "## Human Decision Summary", "## Human Summary", "## Technical Details"]) {
    if (workflowNext.includes(marker)) {
      pass(`workflow-next supports output marker ${marker}`);
    } else {
      fail(`workflow-next missing output marker ${marker}`);
    }
  }
}

function checkGuidedDecisionDeliveryLoopProtocol() {
  const required = [
    "docs/plans/guided-decision-delivery-loop-1.10-plan.md",
    "docs/guided-decision-delivery-loop.md",
    "core/decision-delegation-boundary.md",
    "core/guided-delivery-loop.md",
    "templates/active-work-thread.md",
    "templates/guided-decision-summary.md",
    "prompts/delivery-coach-agent.md",
    "active-work-threads/.gitkeep",
    "guided-decision-summaries/.gitkeep",
    "requests/200-guided-decision-delivery-loop.md",
    "preflight/200-guided-decision-delivery-loop.md",
    "specs/200-guided-decision-delivery-loop.md",
    "evals/200-guided-decision-delivery-loop.md",
    "tasks/200-guided-decision-delivery-loop.md",
    "final-reports/200-guided-decision-delivery-loop.md",
    "releases/1.22.0/release-record.md",
    "releases/1.10.0/release-record.md",
    "releases/1.10.0/known-limitations.md",
    "releases/1.10.0/self-check-report.md",
    "examples/1.10-guided-decision-delivery-loop/README.md",
    "examples/1.10-guided-decision-delivery-loop/active-work-threads/001-appointment-first-slice.md",
    "examples/1.10-guided-decision-delivery-loop/guided-decision-summaries/001-status-model.md",
    "examples/1.10-guided-decision-delivery-loop/conversation-turns/001-payment-mention.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`guided decision delivery asset exists ${file}`);
    else fail(`guided decision delivery asset missing ${file}`);
  }

  const combined = [
    read("core/decision-delegation-boundary.md"),
    read("core/guided-delivery-loop.md"),
    read("docs/guided-decision-delivery-loop.md"),
    read("templates/active-work-thread.md"),
    read("templates/guided-decision-summary.md"),
    read("prompts/delivery-coach-agent.md"),
  ].join("\n");

  for (const marker of [
    "Decision Delegation Boundary",
    "Guided Delivery Loop",
    "D0",
    "D1",
    "D2",
    "D3",
    "D4",
    "Current Mainline",
    "Parking Lot",
    "smallest safe path",
    "raw technical choices",
    "does not approve implementation",
    "release, production, payment, privacy, security, compliance, migration",
  ]) {
    if (combined.includes(marker)) {
      pass(`guided decision delivery protocol includes ${marker}`);
    } else {
      fail(`guided decision delivery protocol missing ${marker}`);
    }
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "active-work-thread",
    "guided-decision-summary",
    "fillActiveWorkThread",
    "fillGuidedDecisionSummary",
  ]) {
    if (newWorkflowItem.includes(marker)) {
      pass(`new-workflow-item supports guided decision marker ${marker}`);
    } else {
      fail(`new-workflow-item missing guided decision marker ${marker}`);
    }
  }
}

function checkGovernanceHardeningDriftGuardProtocol() {
  const required = [
    "docs/plans/governance-hardening-drift-guard-1.11-plan.md",
    "requests/210-governance-hardening-drift-guard.md",
    "preflight/210-governance-hardening-drift-guard.md",
    "specs/210-governance-hardening-drift-guard.md",
    "evals/210-governance-hardening-drift-guard.md",
    "tasks/210-governance-hardening-drift-guard.md",
    "final-reports/210-governance-hardening-drift-guard.md",
    "releases/1.11.0/release-record.md",
    "releases/1.11.0/known-limitations.md",
    "releases/1.11.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`governance hardening asset exists ${file}`);
    else fail(`governance hardening asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/governance-hardening-drift-guard-1.11-plan.md"),
    read("releases/1.11.0/release-record.md"),
    read("releases/1.11.0/known-limitations.md"),
  ].join("\n");
  for (const marker of [
    "Governance Hardening & Drift Guard",
    "Direct Init Non-Empty Guard",
    "Manifest Reverse Drift Guard",
    "Structured Release Section Checks",
    "npm run verify",
    "does not promote industrial packs",
    "does not add automatic GPT/API review",
  ]) {
    if (combined.includes(marker)) {
      pass(`governance hardening protocol includes ${marker}`);
    } else {
      fail(`governance hardening protocol missing ${marker}`);
    }
  }

  const initProject = read("scripts/init-project.mjs");
  for (const marker of [
    "assertDirectInitTargetIsSafe",
    "--force-new-project",
    "Direct init refused",
  ]) {
    if (initProject.includes(marker)) pass(`init-project includes hardening marker ${marker}`);
    else fail(`init-project missing hardening marker ${marker}`);
  }

  const manifestCheck = read("scripts/check-manifest.mjs");
  for (const marker of [
    "checkManifestReverseDrift",
    "manifest reverse drift guard",
    "isImportantSourceAsset",
  ]) {
    if (manifestCheck.includes(marker)) pass(`check-manifest includes drift marker ${marker}`);
    else fail(`check-manifest missing drift marker ${marker}`);
  }
}

function checkChangeBoundaryBaselineStateProtocol() {
  const required = [
    "docs/plans/change-boundary-baseline-state-1.12-plan.md",
    "core/change-boundary.md",
    "core/baseline-state.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "checklists/change-boundary-review.md",
    "checklists/baseline-state-review.md",
    "checklists/guided-delivery-loop-review.md",
    "prompts/change-boundary-agent.md",
    "prompts/baseline-state-agent.md",
    "prompts/guided-delivery-check-agent.md",
    "templates/change-boundary-report.md",
    "templates/baseline-state-report.md",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    "change-boundary-reports/.gitkeep",
    "baseline-state-reports/.gitkeep",
    "requests/220-change-boundary-baseline-state.md",
    "preflight/220-change-boundary-baseline-state.md",
    "specs/220-change-boundary-baseline-state.md",
    "evals/220-change-boundary-baseline-state.md",
    "tasks/220-change-boundary-baseline-state.md",
    "final-reports/220-change-boundary-baseline-state.md",
    "releases/1.12.0/release-record.md",
    "releases/1.12.0/known-limitations.md",
    "releases/1.12.0/self-check-report.md",
    "examples/1.12-change-boundary-baseline-state/README.md",
    "examples/1.12-change-boundary-baseline-state/active-work-threads/001-appointment-first-slice.md",
    "examples/1.12-change-boundary-baseline-state/guided-decision-summaries/001-first-slice-boundary.md",
    "examples/1.12-change-boundary-baseline-state/change-boundary-reports/001-appointment-first-slice.md",
    "examples/1.12-change-boundary-baseline-state/baseline-state-reports/001-no-code-baseline.md",
    "examples/1.12-change-boundary-baseline-state/final-reports/001-appointment-first-slice.md",
    "test-fixtures/bad/bad-guided-delivery-d3-executed/guided-decision-summaries/001-d3-executed.md",
    "test-fixtures/bad/bad-guided-delivery-parking-approved/active-work-threads/001-parking-approved.md",
    "test-fixtures/bad/bad-change-boundary-forbidden/change-boundary-reports/001-forbidden.md",
    "test-fixtures/bad/bad-baseline-state-confirmed-no-evidence/baseline-state-reports/001-confirmed.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`change boundary/baseline state asset exists ${file}`);
    else fail(`change boundary/baseline state asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/change-boundary-baseline-state-1.12-plan.md"),
    read("core/change-boundary.md"),
    read("core/baseline-state.md"),
    read("docs/change-boundary.md"),
    read("docs/baseline-state.md"),
    read("docs/guided-delivery-check.md"),
    read("templates/change-boundary-report.md"),
    read("templates/baseline-state-report.md"),
    read("checklists/guided-delivery-loop-review.md"),
    read("releases/1.12.0/release-record.md"),
    read("releases/1.12.0/known-limitations.md"),
  ].join("\n");

  for (const marker of [
    "Change Boundary",
    "Baseline State",
    "Guided Delivery Check",
    "Intended Scope",
    "Actual Changed Files",
    "Allowed paths",
    "Forbidden paths",
    "PROPOSED",
    "PENDING_CONFIRMATION",
    "EVIDENCE_REQUIRED",
    "CONFIRMED",
    "D0",
    "D1",
    "D2",
    "D3",
    "D4",
    "does not approve target-project writes",
    "does not approve production",
    "does not make no-code baselines implemented",
  ]) {
    if (combined.includes(marker)) pass(`1.12 protocol includes ${marker}`);
    else fail(`1.12 protocol missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "guided-delivery",
    "change-boundary",
    "baseline-state",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports 1.12 marker ${marker}`);
    else fail(`CLI missing 1.12 marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "change-boundary-report",
    "baseline-state-report",
    "fillChangeBoundaryReport",
    "fillBaselineStateReport",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports 1.12 marker ${marker}`);
    else fail(`new-workflow-item missing 1.12 marker ${marker}`);
  }

  const initProject = read("scripts/init-project.mjs");
  for (const marker of [
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    "change-boundary-reports",
    "baseline-state-reports",
    ".intentos/core/change-boundary.md",
    ".intentos/core/baseline-state.md",
  ]) {
    if (initProject.includes(marker)) pass(`init-project includes 1.12 marker ${marker}`);
    else fail(`init-project missing 1.12 marker ${marker}`);
  }

  const positiveChecks = [
    ["guided delivery example", ["scripts/check-guided-delivery-loop.mjs", "examples/1.12-change-boundary-baseline-state"], "Guided delivery loop check passed"],
    ["change boundary example", ["scripts/check-change-boundary.mjs", "examples/1.12-change-boundary-baseline-state", "--report", "change-boundary-reports/001-appointment-first-slice.md"], "Change boundary check passed"],
    ["baseline state example", ["scripts/check-baseline-state.mjs", "examples/1.12-change-boundary-baseline-state", "--report", "baseline-state-reports/001-no-code-baseline.md"], "Baseline state check passed"],
  ];
  for (const [label, args, marker] of positiveChecks) {
    const result = runNode(args);
    if (result.status === 0 && result.stdout.includes(marker)) {
      pass(`1.12 ${label}`);
    } else {
      fail(`1.12 ${label} failed: ${result.stderr || result.stdout}`);
    }
  }

  const negativeChecks = [
    ["bad guided delivery D3 execution", ["scripts/check-guided-delivery-loop.mjs", "test-fixtures/bad/bad-guided-delivery-d3-executed"], "D3 must not claim implementation approval"],
    ["bad guided delivery parking approval", ["scripts/check-guided-delivery-loop.mjs", "test-fixtures/bad/bad-guided-delivery-parking-approved"], "parking-lot items must not be approved"],
    ["bad change boundary forbidden path", ["scripts/check-change-boundary.mjs", "test-fixtures/bad/bad-change-boundary-forbidden", "--report", "change-boundary-reports/001-forbidden.md"], "changed forbidden path"],
    ["bad baseline state confirmed no evidence", ["scripts/check-baseline-state.mjs", "test-fixtures/bad/bad-baseline-state-confirmed-no-evidence", "--report", "baseline-state-reports/001-confirmed.md"], "CONFIRMED without evidence"],
  ];
  for (const [label, args, marker] of negativeChecks) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(marker)) {
      pass(`1.12 rejects ${label}`);
    } else {
      fail(`1.12 must reject ${label}: ${output}`);
    }
  }

  const prCi = read(".github/workflows/intentos-pr-checks.yml");
  const releaseCi = read(".github/workflows/intentos-release-checks.yml");
  for (const [label, content] of [["PR CI", prCi], ["release CI", releaseCi]]) {
    for (const marker of [
      "npm run verify",
      "node scripts/check-guided-delivery-loop.mjs .",
      "node scripts/check-change-boundary.mjs .",
      "node scripts/check-baseline-state.mjs .",
    ]) {
      if (content.includes(marker)) pass(`1.12 ${label} includes ${marker}`);
      else fail(`1.12 ${label} missing ${marker}`);
    }
  }
}

function checkBaselinePackSystemProtocol() {
  const required = [
    "docs/plans/baseline-pack-system-1.13-plan.md",
    "core/baseline-pack-system.md",
    "docs/baseline-pack-system.md",
    "templates/baseline-pack-selection-report.md",
    "checklists/baseline-pack-selection-review.md",
    "prompts/baseline-pack-router-agent.md",
    "baseline-pack-selections/.gitkeep",
    "scripts/resolve-baseline-packs.mjs",
    "scripts/check-baseline-pack-selection.mjs",
    "requests/230-baseline-pack-system.md",
    "preflight/230-baseline-pack-system.md",
    "specs/230-baseline-pack-system.md",
    "evals/230-baseline-pack-system.md",
    "tasks/230-baseline-pack-system.md",
    "final-reports/230-baseline-pack-system.md",
    "releases/1.13.0/release-record.md",
    "releases/1.13.0/known-limitations.md",
    "releases/1.13.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`baseline pack system asset exists ${file}`);
    else fail(`baseline pack system asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/baseline-pack-system-1.13-plan.md"),
    read("core/baseline-pack-system.md"),
    read("docs/baseline-pack-system.md"),
    read("templates/baseline-pack-selection-report.md"),
    read("checklists/baseline-pack-selection-review.md"),
    read("prompts/baseline-pack-router-agent.md"),
    read("releases/1.13.0/release-record.md"),
    read("releases/1.13.0/known-limitations.md"),
  ].join("\n");

  for (const marker of [
    "Baseline Pack System",
    "BL0_LIGHTWEIGHT",
    "BL1_STANDARD",
    "BL2_INDUSTRIAL",
    "Primary platform",
    "Capability",
    "Risk overlay",
    "Do not select a pack because it exists",
    "Can AI enable packs now: No",
    "does not approve target-project writes",
    "does not make BL2 default",
    "does not promote industrial packs to stable",
  ]) {
    if (combined.includes(marker)) pass(`baseline pack system protocol includes ${marker}`);
    else fail(`baseline pack system protocol missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "baseline-packs",
    "baseline-pack-selection",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-baseline-pack-selection.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports baseline pack marker ${marker}`);
    else fail(`CLI missing baseline pack marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "baseline-pack-selection-report",
    "baseline-pack-selections",
    "fillBaselinePackSelectionReport",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports baseline pack marker ${marker}`);
    else fail(`new-workflow-item missing baseline pack marker ${marker}`);
  }

  const initProject = read("scripts/init-project.mjs");
  for (const marker of [
    "Baseline Pack System",
    "scripts/resolve-baseline-packs.mjs",
    "scripts/check-baseline-pack-selection.mjs",
    "baseline-pack-selections",
    ".intentos/core/baseline-pack-system.md",
  ]) {
    if (initProject.includes(marker)) pass(`init-project includes baseline pack marker ${marker}`);
    else fail(`init-project missing baseline pack marker ${marker}`);
  }

  const recommendation = runNode(["scripts/cli.mjs", "baseline-packs", "."]);
  if (recommendation.status === 0 && recommendation.stdout.includes("Baseline Pack Recommendation") && recommendation.stdout.includes("CAN_AI_ENABLE_PACKS_NOW: No")) {
    pass("baseline-packs CLI recommendation");
  } else {
    fail(`baseline-packs CLI recommendation failed: ${recommendation.stderr || recommendation.stdout}`);
  }

  const emptyCheck = runNode(["scripts/check-baseline-pack-selection.mjs", "."]);
  if (emptyCheck.status === 0 && emptyCheck.stdout.includes("baseline pack selection check skipped")) {
    pass("baseline pack selection checker allows no reports");
  } else {
    fail(`baseline pack selection checker should allow no reports: ${emptyCheck.stderr || emptyCheck.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-baseline-pack-"));
  try {
    fs.mkdirSync(path.join(tempRoot, "baseline-pack-selections"), { recursive: true });
    const goodReport = path.join(tempRoot, "baseline-pack-selections", "001-good.md");
    fs.writeFileSync(goodReport, [
      "# Baseline Pack Selection Report: good",
      "",
      "## Human Summary",
      "",
      "Recommended path: BL1 with candidate packs only.",
      "",
      "Can AI enable packs now: No.",
      "",
      "## Project Classification",
      "",
      "- Project state: existing-light",
      "- Project shape: web",
      "- Risk level: medium",
      "- Evidence source: docs/project-profile.md",
      "",
      "## Baseline Level",
      "",
      "- Recommended level: BL1_STANDARD",
      "- Current selected level: none",
      "- Why: no production evidence yet",
      "",
      "## Selected Profiles",
      "",
      "- web-app",
      "",
      "## Recommended Pack Set",
      "",
      "Primary platform packs:",
      "",
      "- web-app-industrial",
      "",
      "Capability packs:",
      "",
      "- none",
      "",
      "Risk overlay packs:",
      "",
      "- none",
      "",
      "## Not Selected",
      "",
      "| Pack | Reason |",
      "|---|---|",
      "| payment-value-transfer-industrial | no value movement |",
      "",
      "## Evidence Required",
      "",
      "| Requirement | Evidence ref | Status |",
      "|---|---|---|",
      "| baseline decision | docs/baseline-selection.md | PENDING |",
      "",
      "## Human Decision",
      "",
      "- Decision status: PENDING",
      "- Decision owner: human",
      "- Approved packs: none until approved",
      "- Explicitly rejected packs: none",
      "- Draft pack acceptance: PENDING",
      "",
      "## Boundary",
      "",
      "- This report authorizes target-project writes: No",
      "- This report approves implementation: No",
      "- This report approves release or production: No",
      "- This report proves real project evidence exists: No",
      "",
    ].join("\n"));
    const good = runNode(["scripts/check-baseline-pack-selection.mjs", tempRoot, "--report", "baseline-pack-selections/001-good.md"]);
    if (good.status === 0 && good.stdout.includes("Baseline pack selection check passed")) {
      pass("baseline pack selection checker accepts bounded report");
    } else {
      fail(`baseline pack selection checker should accept bounded report: ${good.stderr || good.stdout}`);
    }

    const badReport = path.join(tempRoot, "baseline-pack-selections", "002-bad.md");
    fs.writeFileSync(badReport, fs.readFileSync(goodReport, "utf8")
      .replace("Recommended path: BL1 with candidate packs only.", "Recommended path: select all packs by default.")
      .replace("This report authorizes target-project writes: No", "This report authorizes target-project writes: Yes"));
    const bad = runNode(["scripts/check-baseline-pack-selection.mjs", tempRoot, "--report", "baseline-pack-selections/002-bad.md"]);
    const badOutput = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && badOutput.includes("selects all packs by default") && badOutput.includes("write authorization")) {
      pass("baseline pack selection checker rejects overclaim report");
    } else {
      fail(`baseline pack selection checker must reject overclaim report: ${badOutput}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkStandardBaselinePackRegistryProtocol() {
  const required = [
    "docs/plans/standard-baseline-pack-registry-1.14-plan.md",
    "docs/plans/platform-standard-baseline-packs-1.15-plan.md",
    "docs/plans/bl2-industrial-baseline-deepening-1.16-plan.md",
    "docs/plans/guided-baseline-selection-entry-1.17-plan.md",
    "core/standard-baseline-pack-registry.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/platform-standard-baseline-packs.md",
    "docs/reference/platform-standard-baseline-matrix.md",
    "docs/reference/standard-baseline-packs.md",
    "standard-baseline-packs/README.md",
    "standard-baseline-packs/selection-guide.md",
    "standard-baseline-packs/index.json",
    "standard-baseline-packs/schema/index.schema.json",
    "standard-baseline-packs/schema/standard-pack.schema.json",
    "standard-baseline-packs/web-runtime/pack.json",
    "standard-baseline-packs/web-runtime/baselines/web-runtime-baseline.md",
    "standard-baseline-packs/web-runtime/checklists/web-runtime-review.md",
    "standard-baseline-packs/web-runtime/templates/web-runtime-evidence.md",
    "standard-baseline-packs/backend-api/pack.json",
    "standard-baseline-packs/backend-api/baselines/backend-api-contract-baseline.md",
    "standard-baseline-packs/backend-api/checklists/backend-api-review.md",
    "standard-baseline-packs/backend-api/templates/backend-api-evidence.md",
    "standard-baseline-packs/release-rollback/pack.json",
    "standard-baseline-packs/release-rollback/baselines/release-readiness-baseline.md",
    "standard-baseline-packs/release-rollback/checklists/release-rollback-review.md",
    "standard-baseline-packs/release-rollback/templates/release-rollback-evidence.md",
    "standard-baseline-packs/miniprogram-runtime/pack.json",
    "standard-baseline-packs/ios-app/pack.json",
    "standard-baseline-packs/android-app/pack.json",
    "standard-baseline-packs/internal-admin/pack.json",
    "standard-baseline-packs/environment/pack.json",
    "templates/standard-baseline-selection-report.md",
    "checklists/standard-baseline-selection-review.md",
    "prompts/standard-baseline-router-agent.md",
    "standard-baseline-selections/.gitkeep",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-pack.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "examples/1.14-standard-baseline-registry/README.md",
    "examples/1.15-platform-standard-baselines/README.md",
    "examples/1.15-platform-standard-baselines/new-miniprogram-basic/standard-baseline-selections/001-platform-standard.md",
    "examples/1.15-platform-standard-baselines/new-miniprogram-with-backend/standard-baseline-selections/001-platform-standard.md",
    "examples/1.15-platform-standard-baselines/new-internal-admin-web/standard-baseline-selections/001-platform-standard.md",
    "examples/1.15-platform-standard-baselines/new-ios-app/standard-baseline-selections/001-platform-standard.md",
    "examples/1.15-platform-standard-baselines/new-android-app/standard-baseline-selections/001-platform-standard.md",
    "examples/1.15-platform-standard-baselines/existing-governed-project-gap-review/standard-baseline-selections/001-platform-standard.md",
    "requests/240-standard-baseline-pack-registry.md",
    "preflight/240-standard-baseline-pack-registry.md",
    "specs/240-standard-baseline-pack-registry.md",
    "evals/240-standard-baseline-pack-registry.md",
    "tasks/240-standard-baseline-pack-registry.md",
    "final-reports/240-standard-baseline-pack-registry.md",
    "releases/1.14.0/release-record.md",
    "releases/1.14.0/known-limitations.md",
    "releases/1.14.0/self-check-report.md",
    "releases/1.14.1/release-record.md",
    "releases/1.14.1/known-limitations.md",
    "releases/1.14.1/self-check-report.md",
    "releases/1.15.0/release-record.md",
    "releases/1.15.0/known-limitations.md",
    "releases/1.15.0/self-check-report.md",
    "releases/1.15.1/release-record.md",
    "releases/1.15.1/known-limitations.md",
    "releases/1.15.1/self-check-report.md",
    "test-fixtures/bad/bad-standard-pack-unknown-field/standard-baseline-packs/index.json",
    "test-fixtures/bad/bad-standard-pack-unknown-field/standard-baseline-packs/bad-runtime/pack.json",
    "test-fixtures/bad/bad-standard-pack-index-entry-mismatch/standard-baseline-packs/index.json",
    "test-fixtures/bad/bad-standard-pack-index-entry-mismatch/standard-baseline-packs/bad-runtime/pack.json",
    "test-fixtures/bad/bad-standard-pack-environment-overclaims/standard-baseline-packs/index.json",
    "test-fixtures/bad/bad-standard-pack-environment-overclaims/standard-baseline-packs/environment/pack.json",
    "test-fixtures/bad/bad-standard-selection-unknown-profile/standard-baseline-selections/001-bad.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`standard baseline registry asset exists ${file}`);
    else fail(`standard baseline registry asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/standard-baseline-pack-registry-1.14-plan.md"),
    read("docs/plans/platform-standard-baseline-packs-1.15-plan.md"),
    read("docs/plans/bl2-industrial-baseline-deepening-1.16-plan.md"),
    read("docs/plans/guided-baseline-selection-entry-1.17-plan.md"),
    read("core/standard-baseline-pack-registry.md"),
    read("docs/standard-baseline-pack-registry.md"),
    read("docs/platform-standard-baseline-packs.md"),
    read("docs/reference/platform-standard-baseline-matrix.md"),
    read("templates/standard-baseline-selection-report.md"),
    read("checklists/standard-baseline-selection-review.md"),
    read("prompts/standard-baseline-router-agent.md"),
    read("releases/1.14.0/release-record.md"),
    read("releases/1.14.0/known-limitations.md"),
    read("releases/1.14.1/release-record.md"),
    read("releases/1.14.1/known-limitations.md"),
    read("releases/1.15.0/release-record.md"),
    read("releases/1.15.0/known-limitations.md"),
    read("releases/1.15.1/release-record.md"),
    read("releases/1.15.1/known-limitations.md"),
    read("standard-baseline-packs/schema/index.schema.json"),
    read("standard-baseline-packs/schema/standard-pack.schema.json"),
    read("scripts/resolve-baseline-packs.mjs"),
    read("scripts/check-standard-baseline-pack.mjs"),
    read("scripts/check-standard-baseline-selection.mjs"),
  ].join("\n");

  for (const marker of [
    "Standard Baseline Pack Registry",
    "standard baseline packs first",
    "industrial overlays",
    "recommendedForBL",
    "activeByDefault",
    "does not approve a specific implementation task",
    "authorizes target-project writes: No",
    "approves implementation: No",
    "approves release or production: No",
    "approves compliance/security/privacy: No",
    "draft",
    "Deprecated lower-level resolver",
    "\"additionalProperties\": false",
    "extensions",
    "index-level schema",
    "index/pack.json consistency",
    "environment-standard overclaim",
    "owner-decision backlog",
    "unknown pack metadata field",
    "unknown selected profile",
    "allowedPublicUrlHosts",
    "miniprogram-runtime-standard",
    "ios-app-standard",
    "android-app-standard",
    "internal-admin-standard",
    "environment-standard",
    "Mini Program backend is common, but optional",
    "environment is proportional",
    "forces backend-api-standard without backend scope evidence",
    "governed or sensitive existing project uses overwrite language",
  ]) {
    if (combined.includes(marker)) pass(`standard baseline protocol includes ${marker}`);
    else fail(`standard baseline protocol missing ${marker}`);
  }

  const index = JSON.parse(read("standard-baseline-packs/index.json"));
  const packIds = (index.packs || []).map((pack) => pack.id).sort();
  for (const packId of [
    "android-app-standard",
    "backend-api-standard",
    "environment-standard",
    "internal-admin-standard",
    "ios-app-standard",
    "miniprogram-runtime-standard",
    "release-rollback-standard",
    "web-runtime-standard",
  ]) {
    if (packIds.includes(packId)) pass(`standard pack index includes ${packId}`);
    else fail(`standard pack index missing ${packId}`);
  }
  for (const pack of index.packs || []) {
    if (pack.activeByDefault === false && pack.canAuthorizeWrites === false && pack.canApproveImplementation === false && pack.canApproveRelease === false) {
      pass(`standard pack metadata is bounded ${pack.id}`);
    } else {
      fail(`standard pack metadata must be bounded ${pack.id}`);
    }
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "standard-baseline",
    "standard-baseline-selection",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "--umbrella",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports standard baseline marker ${marker}`);
    else fail(`CLI missing standard baseline marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "standard-baseline-selection-report",
    "standard-baseline-selections",
    "fillStandardBaselineSelectionReport",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports standard baseline marker ${marker}`);
    else fail(`new-workflow-item missing standard baseline marker ${marker}`);
  }

  const initProject = read("scripts/init-project.mjs");
  for (const marker of [
    "Standard Baseline Packs",
    ".intentos/standard-baseline-packs",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "standard-baseline-selections",
  ]) {
    if (initProject.includes(marker)) pass(`init-project includes standard baseline marker ${marker}`);
    else fail(`init-project missing standard baseline marker ${marker}`);
  }

  const packCheck = runNode(["scripts/check-standard-baseline-pack.mjs", "."]);
  if (packCheck.status === 0 && packCheck.stdout.includes("Standard baseline pack check passed")) {
    pass("standard baseline pack checker passes registry");
  } else {
    fail(`standard baseline pack checker failed: ${packCheck.stderr || packCheck.stdout}`);
  }

  const emptySelectionCheck = runNode(["scripts/check-standard-baseline-selection.mjs", "."]);
  if (emptySelectionCheck.status === 0 && emptySelectionCheck.stdout.includes("standard baseline selection check skipped")) {
    pass("standard baseline selection checker allows no reports");
  } else {
    fail(`standard baseline selection checker should allow no reports: ${emptySelectionCheck.stderr || emptySelectionCheck.stdout}`);
  }

  const recommendation = runNode(["scripts/cli.mjs", "standard-baseline", "."]);
  if (recommendation.status === 0 && recommendation.stdout.includes("Standard Baseline Recommendation") && recommendation.stdout.includes("CAN_AI_WRITE_TARGET_FILES_NOW: No")) {
    pass("standard-baseline CLI recommendation");
  } else {
    fail(`standard-baseline CLI recommendation failed: ${recommendation.stderr || recommendation.stdout}`);
  }

  const umbrella = runNode(["scripts/cli.mjs", "baseline-packs", "."]);
  if (umbrella.status === 0 && umbrella.stdout.includes("Baseline Pack Recommendation") && umbrella.stdout.includes("Standard packs are shown first")) {
    pass("baseline-packs CLI umbrella recommendation");
  } else {
    fail(`baseline-packs CLI umbrella recommendation failed: ${umbrella.stderr || umbrella.stdout}`);
  }

  const example = runNode(["scripts/check-standard-baseline-selection.mjs", "examples/1.14-standard-baseline-registry", "--strict", "--compare-resolver"]);
  if (example.status === 0 && example.stdout.includes("Standard baseline selection check passed")) {
    pass("standard baseline selection example passes strict resolver comparison");
  } else {
    fail(`standard baseline selection example failed: ${example.stderr || example.stdout}`);
  }

  for (const exampleDir of [
    "new-miniprogram-basic",
    "new-miniprogram-with-backend",
    "new-internal-admin-web",
    "new-ios-app",
    "new-android-app",
    "existing-governed-project-gap-review",
  ]) {
    const platformExample = runNode(["scripts/check-standard-baseline-selection.mjs", `examples/1.15-platform-standard-baselines/${exampleDir}`, "--strict", "--compare-resolver"]);
    if (platformExample.status === 0 && platformExample.stdout.includes("Standard baseline selection check passed")) {
      pass(`1.15 platform standard example passes ${exampleDir}`);
    } else {
      fail(`1.15 platform standard example failed ${exampleDir}: ${platformExample.stderr || platformExample.stdout}`);
    }
  }

  const badDefault = runNode(["scripts/check-standard-baseline-pack.mjs", "test-fixtures/bad/bad-standard-pack-default-enabled"]);
  if (badDefault.status !== 0 && `${badDefault.stdout}\n${badDefault.stderr}`.includes("activeByDefault must be false")) {
    pass("standard baseline pack checker rejects activeByDefault");
  } else {
    fail(`standard baseline pack checker must reject activeByDefault: ${badDefault.stderr || badDefault.stdout}`);
  }

  const badUnknownField = runNode(["scripts/check-standard-baseline-pack.mjs", "test-fixtures/bad/bad-standard-pack-unknown-field"]);
  if (badUnknownField.status !== 0 && `${badUnknownField.stdout}\n${badUnknownField.stderr}`.includes("unknown pack metadata field")) {
    pass("standard baseline pack checker rejects unknown metadata fields");
  } else {
    fail(`standard baseline pack checker must reject unknown metadata fields: ${badUnknownField.stderr || badUnknownField.stdout}`);
  }

  const badIndexMismatch = runNode(["scripts/check-standard-baseline-pack.mjs", "test-fixtures/bad/bad-standard-pack-index-entry-mismatch"]);
  if (badIndexMismatch.status !== 0 && `${badIndexMismatch.stdout}\n${badIndexMismatch.stderr}`.includes("index displayName must match pack.json")) {
    pass("standard baseline pack checker rejects index/pack drift");
  } else {
    fail(`standard baseline pack checker must reject index/pack drift: ${badIndexMismatch.stderr || badIndexMismatch.stdout}`);
  }

  const badEnvironmentOverclaim = runNode(["scripts/check-standard-baseline-pack.mjs", "test-fixtures/bad/bad-standard-pack-environment-overclaims"]);
  const badEnvironmentOutput = `${badEnvironmentOverclaim.stdout}\n${badEnvironmentOverclaim.stderr}`;
  if (
    badEnvironmentOverclaim.status !== 0 &&
    badEnvironmentOutput.includes(".env write") &&
    badEnvironmentOutput.includes("secret assignment") &&
    badEnvironmentOutput.includes("CI/CD approval") &&
    badEnvironmentOutput.includes("invented deployment fact")
  ) {
    pass("standard baseline pack checker rejects environment overclaims");
  } else {
    fail(`standard baseline pack checker must reject environment overclaims: ${badEnvironmentOutput}`);
  }

  const badUnknownProfile = runNode(["scripts/check-standard-baseline-selection.mjs", "test-fixtures/bad/bad-standard-selection-unknown-profile"]);
  if (badUnknownProfile.status !== 0 && `${badUnknownProfile.stdout}\n${badUnknownProfile.stderr}`.includes("unknown selected profile")) {
    pass("standard baseline selection checker rejects unknown selected profiles");
  } else {
    fail(`standard baseline selection checker must reject unknown selected profiles: ${badUnknownProfile.stderr || badUnknownProfile.stdout}`);
  }

  const badSelectsAll = runNode(["scripts/check-standard-baseline-selection.mjs", "test-fixtures/bad/bad-platform-standard-selects-all"]);
  if (badSelectsAll.status !== 0 && `${badSelectsAll.stdout}\n${badSelectsAll.stderr}`.includes("selects all known standard packs")) {
    pass("standard baseline selection checker rejects all-pack selection");
  } else {
    fail(`standard baseline selection checker must reject all-pack selection: ${badSelectsAll.stderr || badSelectsAll.stdout}`);
  }

  const badForcedBackend = runNode(["scripts/check-standard-baseline-selection.mjs", "test-fixtures/bad/bad-platform-standard-backend-forced"]);
  if (badForcedBackend.status !== 0 && `${badForcedBackend.stdout}\n${badForcedBackend.stderr}`.includes("forces backend-api-standard")) {
    pass("standard baseline selection checker rejects forced backend");
  } else {
    fail(`standard baseline selection checker must reject forced backend: ${badForcedBackend.stderr || badForcedBackend.stdout}`);
  }

  const badOverwrite = runNode(["scripts/check-standard-baseline-selection.mjs", "test-fixtures/bad/bad-platform-standard-existing-project-overwrite"]);
  if (badOverwrite.status !== 0 && `${badOverwrite.stdout}\n${badOverwrite.stderr}`.includes("overwrite language")) {
    pass("standard baseline selection checker rejects governed overwrite language");
  } else {
    fail(`standard baseline selection checker must reject governed overwrite language: ${badOverwrite.stderr || badOverwrite.stdout}`);
  }
}

function checkGuidedBaselineSelectionEntryProtocol() {
  const required = [
    "core/guided-baseline-selection.md",
    "docs/guided-baseline-selection-entry.md",
    "templates/baseline-decision-card.md",
    "checklists/baseline-decision-review.md",
    "prompts/baseline-decision-agent.md",
    "baseline-decision-cards/.gitkeep",
    "scripts/resolve-guided-baseline-selection.mjs",
    "scripts/check-guided-baseline-selection.mjs",
    "examples/1.17-guided-baseline-selection/README.md",
    "examples/1.17-guided-baseline-selection/new-miniprogram/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/new-web-admin/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/existing-light-web/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/existing-governed-readonly/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/production-sensitive/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/dirty-worktree/baseline-decision-cards/001-baseline-decision.md",
    "examples/1.17-guided-baseline-selection/bl2-candidate/baseline-decision-cards/001-baseline-decision.md",
    "test-fixtures/bad/bad-guided-baseline-selects-all-packs/baseline-decision-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-baseline-bl2-default/baseline-decision-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-baseline-forces-backend/baseline-decision-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-baseline-production-direct-init/baseline-decision-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-baseline-dirty-continues/baseline-decision-cards/001-bad.md",
    "releases/1.17.0/release-record.md",
    "releases/1.17.0/known-limitations.md",
    "releases/1.17.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.17 guided baseline asset exists ${file}`);
    else fail(`1.17 guided baseline asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/guided-baseline-selection-entry-1.17-plan.md"),
    read("core/guided-baseline-selection.md"),
    read("docs/guided-baseline-selection-entry.md"),
    read("templates/baseline-decision-card.md"),
    read("checklists/baseline-decision-review.md"),
    read("prompts/baseline-decision-agent.md"),
    read("scripts/resolve-guided-baseline-selection.mjs"),
    read("scripts/check-guided-baseline-selection.mjs"),
    read("releases/1.17.0/release-record.md"),
    read("releases/1.17.0/known-limitations.md"),
  ].join("\n");

  for (const marker of [
    "Guided Baseline Selection",
    "Baseline Decision Card",
    "baseline-decision",
    "baseline-decision-check",
    "BL0_LIGHTWEIGHT",
    "BL1_STANDARD",
    "BL2_INDUSTRIAL",
    "candidate path for human review",
    "Candidate only, not selected",
    "authorizes target-project writes: No",
    "approves implementation: No",
    "approves release or production: No",
    "does not approve target-project writes",
    "does not make BL2 default",
    "does not select all packs",
    "production-sensitive direct init/update",
    "dirty worktree",
  ]) {
    if (combined.includes(marker)) pass(`1.17 guided baseline protocol includes ${marker}`);
    else fail(`1.17 guided baseline protocol missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "baseline-decision",
    "baseline-decision-check",
    "scripts/resolve-guided-baseline-selection.mjs",
    "scripts/check-guided-baseline-selection.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports guided baseline marker ${marker}`);
    else fail(`CLI missing guided baseline marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "baseline-decision-card",
    "baseline-decision-cards",
    "fillBaselineDecisionCard",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports guided baseline marker ${marker}`);
    else fail(`new-workflow-item missing guided baseline marker ${marker}`);
  }

  const initProject = read("scripts/init-project.mjs");
  for (const marker of [
    "guided-baseline-selection",
    "baseline-decision-card",
    "node scripts/cli.mjs baseline-decision .",
  ]) {
    if (initProject.includes(marker)) pass(`init-project includes guided baseline marker ${marker}`);
    else fail(`init-project missing guided baseline marker ${marker}`);
  }

  const resolver = runNode(["scripts/cli.mjs", "baseline-decision", "."]);
  if (resolver.status === 0 && resolver.stdout.includes("Baseline Decision Card") && resolver.stdout.includes("This card authorizes target-project writes: No")) {
    pass("guided baseline resolver CLI output");
  } else {
    fail(`guided baseline resolver CLI output failed: ${resolver.stderr || resolver.stdout}`);
  }

  const emptyCheck = runNode(["scripts/check-guided-baseline-selection.mjs", "."]);
  if (emptyCheck.status === 0 && emptyCheck.stdout.includes("guided baseline selection check skipped")) {
    pass("guided baseline checker allows no cards");
  } else {
    fail(`guided baseline checker should allow no cards: ${emptyCheck.stderr || emptyCheck.stdout}`);
  }

  for (const exampleDir of [
    "new-miniprogram",
    "new-web-admin",
    "existing-light-web",
    "existing-governed-readonly",
    "production-sensitive",
    "dirty-worktree",
    "bl2-candidate",
  ]) {
    const example = runNode(["scripts/check-guided-baseline-selection.mjs", `examples/1.17-guided-baseline-selection/${exampleDir}`, "--strict"]);
    if (example.status === 0 && example.stdout.includes("Guided baseline selection check passed")) {
      pass(`1.17 guided baseline example passes ${exampleDir}`);
    } else {
      fail(`1.17 guided baseline example failed ${exampleDir}: ${example.stderr || example.stdout}`);
    }
  }

  for (const [name, fixture, expected] of [
    ["selects all packs", "bad-guided-baseline-selects-all-packs", "selects all known standard packs"],
    ["BL2 default", "bad-guided-baseline-bl2-default", "BL2 is default"],
    ["forces backend", "bad-guided-baseline-forces-backend", "forces backend-api-standard"],
    ["approves writes", "bad-guided-baseline-approves-writes", "write approval"],
    ["approves implementation", "bad-guided-baseline-approves-implementation", "implementation approval"],
    ["approves release", "bad-guided-baseline-approves-release", "release approval"],
    ["production ready", "bad-guided-baseline-production-ready", "production-ready claim"],
    ["too many questions", "bad-guided-baseline-too-many-questions", "too many human decision questions"],
    ["governed overwrite", "bad-guided-baseline-governed-overwrite", "existing governed project recommends overwrite"],
    ["production direct init", "bad-guided-baseline-production-direct-init", "production-sensitive project recommends direct init/update"],
    ["BL2 no evidence gap", "bad-guided-baseline-bl2-no-evidence-gap", "BL2 candidate has no evidence gap"],
    ["dirty continues", "bad-guided-baseline-dirty-continues", "dirty worktree continues without decision"],
    ["missing platform states", "bad-guided-baseline-missing-platform-states", "missing or empty section Platform States"],
    ["invalid platform state", "bad-guided-baseline-invalid-platform-state", "invalid Platform States state"],
  ]) {
    const bad = runNode(["scripts/check-guided-baseline-selection.mjs", `test-fixtures/bad/${fixture}`]);
    const output = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && output.includes(expected)) {
      pass(`1.17 guided baseline checker rejects ${name}`);
    } else {
      fail(`1.17 guided baseline checker must reject ${name}: ${output}`);
    }
  }
}

function checkGuidedBaselineSelectionCalibrationProtocol() {
  const required = [
    "docs/plans/guided-baseline-selection-calibration-1.18-plan.md",
    "baseline-calibration-reports/2026-06-28-summary.md",
    "baseline-calibration-reports/2026-06-28-local-ios-industrial-monorepo-project.md",
    "releases/1.18.0/release-record.md",
    "releases/1.18.0/known-limitations.md",
    "releases/1.18.0/self-check-report.md",
    "docs/plans/guided-baseline-selection-calibration-1.18.1-plan.md",
    "baseline-calibration-reports/scoreboard.md",
    "releases/1.18.1/release-record.md",
    "releases/1.18.1/known-limitations.md",
    "releases/1.18.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.18 guided baseline calibration asset exists ${file}`);
    else fail(`1.18 guided baseline calibration asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/guided-baseline-selection-calibration-1.18-plan.md"),
    read("core/guided-baseline-selection.md"),
    read("docs/guided-baseline-selection-entry.md"),
    read("templates/baseline-decision-card.md"),
    read("checklists/baseline-decision-review.md"),
    read("scripts/resolve-guided-baseline-selection.mjs"),
    read("scripts/baseline-project.mjs"),
    read("releases/1.18.0/release-record.md"),
    read("docs/plans/guided-baseline-selection-calibration-1.18.1-plan.md"),
    read("baseline-calibration-reports/scoreboard.md"),
    read("releases/1.18.1/release-record.md"),
  ].join("\n");

  for (const marker of [
    "current safe action",
    "target candidate level",
    "Platform States",
    "selected-inferred",
    "present-needs-confirmation",
    "present-inactive-or-deferred",
    "Mini Program cloud functions",
    "permission/RBAC vocabulary alone",
    "Platform States required section",
    "precision scoreboard",
    "verify:baseline",
    "does not add new packs",
    "does not approve target-project writes",
  ]) {
    if (combined.includes(marker)) pass(`1.18 guided baseline calibration includes ${marker}`);
    else fail(`1.18 guided baseline calibration missing ${marker}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-baseline-calibration-"));
  try {
    const miniprogram = path.join(tempRoot, "miniprogram-cloud");
    fs.mkdirSync(path.join(miniprogram, "cloudfunctions", "login"), { recursive: true });
    fs.writeFileSync(path.join(miniprogram, "project.config.json"), "{\"miniprogramRoot\":\"miniprogram\",\"cloudfunctionRoot\":\"cloudfunctions\"}\n");

    const permissionOnly = path.join(tempRoot, "permission-docs");
    fs.mkdirSync(path.join(permissionOnly, "docs", "architecture"), { recursive: true });
    fs.writeFileSync(path.join(permissionOnly, "package.json"), "{\"name\":\"permission-docs\"}\n");
    fs.writeFileSync(path.join(permissionOnly, "docs", "architecture", "permission-boundary.md"), "# Permission boundary\n");

    const monorepo = path.join(tempRoot, "ios-monorepo");
    fs.mkdirSync(path.join(monorepo, "apps", "ios", "App.xcodeproj"), { recursive: true });
    fs.mkdirSync(path.join(monorepo, "apps", "android", "app"), { recursive: true });
    fs.mkdirSync(path.join(monorepo, "apps", "miniapp", "src"), { recursive: true });
    fs.mkdirSync(path.join(monorepo, "apps", "web-platform-admin", "src"), { recursive: true });
    fs.mkdirSync(path.join(monorepo, "backend", "internal"), { recursive: true });
    fs.mkdirSync(path.join(monorepo, "docs", "entity", "sql"), { recursive: true });
    fs.writeFileSync(path.join(monorepo, "package.json"), JSON.stringify({
      name: "calibration-monorepo",
      scripts: {
        "ci:matrix:strict:active-no-android-miniapp": "echo ok",
        "web-admin:check": "echo ok",
      },
      dependencies: {
        react: "latest",
      },
    }, null, 2));

    const miniDecision = runNode(["scripts/resolve-guided-baseline-selection.mjs", miniprogram, "--json"]);
    const mini = JSON.parse(miniDecision.stdout);
    if (mini.platformAndScope.backendApiScope.includes("Mini Program cloud functions need confirmation")) {
      pass("1.18 Mini Program cloud functions mark backend scope possible");
    } else {
      fail(`1.18 Mini Program backend scope calibration failed: ${miniDecision.stdout}`);
    }
    if (!mini.recommendedStandardPacks.includes("backend-api-standard")) {
      pass("1.18 Mini Program cloud functions do not force backend standard pack");
    } else {
      fail("1.18 Mini Program cloud functions forced backend-api-standard");
    }

    const permissionDecision = runNode(["scripts/resolve-guided-baseline-selection.mjs", permissionOnly, "--json"]);
    const permission = JSON.parse(permissionDecision.stdout);
    if (!permission.platformAndScope.detectedPlatform.includes("internal-admin")) {
      pass("1.18 permission-only project does not infer internal-admin");
    } else {
      fail(`1.18 internal-admin false positive remains: ${permissionDecision.stdout}`);
    }

    const monoDecision = runNode(["scripts/resolve-guided-baseline-selection.mjs", monorepo, "--json"]);
    const mono = JSON.parse(monoDecision.stdout);
    const monoStates = Object.fromEntries(mono.platformStates.map((item) => [item.profile, item.state]));
    if (monoStates["android-app"] === "present-inactive-or-deferred"
      && monoStates["wechat-miniprogram"] === "present-needs-confirmation"
      && monoStates["ios-app"] === "selected-inferred") {
      pass("1.18 monorepo platform states distinguish selected and present profiles");
    } else {
      fail(`1.18 monorepo platform states are wrong: ${JSON.stringify(monoStates)}`);
    }
    if (mono.recommendedBaselineLevel.currentSafeAction === "BL1_STANDARD_READ_ONLY_MAPPING"
      && mono.recommendedBaselineLevel.targetCandidateLevel === "BL2_INDUSTRIAL") {
      pass("1.18 guided decision separates current safe action from target candidate level");
    } else {
      fail(`1.18 guided safe action calibration failed: ${JSON.stringify(mono.recommendedBaselineLevel)}`);
    }

    const legacyBaseline = runNode(["scripts/cli.mjs", "baseline", monorepo]);
    if (legacyBaseline.status === 0
      && legacyBaseline.stdout.includes("Current safe action")
      && legacyBaseline.stdout.includes("Target candidate level")) {
      pass("1.18 legacy baseline output explains safe action and candidate target");
    } else {
      fail(`1.18 legacy baseline output missing calibration language: ${legacyBaseline.stderr || legacyBaseline.stdout}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkBaselineSelectionPrecisionCalibrationProtocol() {
  const required = [
    "docs/plans/baseline-selection-precision-calibration-1.19-plan.md",
    "baseline-calibration-reports/scoreboard.md",
    "baseline-calibration-reports/2026-06-29-synthetic-precision-fixtures.md",
    "baseline-calibration-reports/precision-fixtures.json",
    "scripts/check-baseline-selection-precision.mjs",
    "test-fixtures/bad/bad-baseline-selection-scoreboard/baseline-calibration-reports/scoreboard.md",
    "releases/1.19.0/release-record.md",
    "releases/1.19.0/known-limitations.md",
    "releases/1.19.0/self-check-report.md",
    "releases/1.19.1/release-record.md",
    "releases/1.19.1/known-limitations.md",
    "releases/1.19.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.19 baseline selection precision asset exists ${file}`);
    else fail(`1.19 baseline selection precision asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/baseline-selection-precision-calibration-1.19-plan.md"),
    read("baseline-calibration-reports/scoreboard.md"),
    read("baseline-calibration-reports/2026-06-29-synthetic-precision-fixtures.md"),
    read("baseline-calibration-reports/precision-fixtures.json"),
    read("scripts/check-baseline-selection-precision.mjs"),
    read("releases/1.19.0/release-record.md"),
    read("releases/1.19.1/release-record.md"),
    read(".github/workflows/intentos-pr-checks.yml"),
    read(".github/workflows/intentos-release-checks.yml"),
  ].join("\n");

  for (const marker of [
    "Baseline Selection Precision Calibration",
    "falsePositive",
    "falseNegative",
    "fixStatus",
    "Summary Metrics",
    "precision-fixtures.json",
    "JSON summary",
    "Synthetic Precision Fixtures",
    "Mini Program cloud functions",
    "permission-only docs",
    "production governed read-only",
    "dirty worktree with payment risk",
    "monorepo with deferred platforms",
    "backend data/API",
    "empty unknown",
    "not production validation",
    "does not approve target-project writes",
    "Baseline selection precision check",
  ]) {
    if (combined.includes(marker)) pass(`1.19 baseline selection precision includes ${marker}`);
    else fail(`1.19 baseline selection precision missing ${marker}`);
  }

  const precision = runNode(["scripts/check-baseline-selection-precision.mjs", "."]);
  if (precision.status === 0 && precision.stdout.includes("Baseline selection precision check passed")) {
    pass("1.19 baseline selection precision checker passes");
  } else {
    fail(`1.19 baseline selection precision checker failed: ${precision.stderr || precision.stdout}`);
  }

  const scoreboardOnly = runNode(["scripts/check-baseline-selection-precision.mjs", ".", "--skip-fixtures"]);
  if (scoreboardOnly.status === 0 && scoreboardOnly.stdout.includes("Baseline selection precision check passed")) {
    pass("1.19 baseline selection precision scoreboard-only check passes");
  } else {
    fail(`1.19 baseline selection precision scoreboard-only check failed: ${scoreboardOnly.stderr || scoreboardOnly.stdout}`);
  }

  const jsonSummary = runNode(["scripts/check-baseline-selection-precision.mjs", ".", "--json"]);
  if (jsonSummary.status === 0) {
    try {
      const parsed = JSON.parse(jsonSummary.stdout);
      if (parsed.summary?.metrics?.totalCases === 12
        && parsed.summary?.metrics?.syntheticFixtureCases === 8
        && Array.isArray(parsed.summary?.fixtureCaseIds)
        && parsed.summary.fixtureCaseIds.length === 8) {
        pass("1.19 baseline selection precision JSON summary includes metrics and fixture registry");
      } else {
        fail(`1.19 baseline selection precision JSON summary missing expected metrics: ${jsonSummary.stdout}`);
      }
    } catch (error) {
      fail(`1.19 baseline selection precision JSON summary invalid JSON: ${error.message}`);
    }
  } else {
    fail(`1.19 baseline selection precision JSON summary failed: ${jsonSummary.stderr || jsonSummary.stdout}`);
  }

  const bad = runNode([
    "scripts/check-baseline-selection-precision.mjs",
    "test-fixtures/bad/bad-baseline-selection-scoreboard",
    "--scoreboard",
    "baseline-calibration-reports/scoreboard.md",
    "--skip-fixtures",
  ]);
  const badOutput = `${bad.stdout}\n${bad.stderr}`;
  if (bad.status !== 0
    && badOutput.includes("invalid case id")
    && badOutput.includes("invalid falsePositive")
    && badOutput.includes("invalid fixStatus")) {
    pass("1.19 baseline selection precision checker rejects bad scoreboard");
  } else {
    fail(`1.19 baseline selection precision checker must reject bad scoreboard: ${badOutput}`);
  }
}

function checkGuidedDeliveryBaselineProtocol() {
  const required = [
    "docs/plans/guided-delivery-baseline-1.3-plan.md",
    "core/outcome-baseline.md",
    "core/product-baseline.md",
    "core/claim-control.md",
    "core/assumption-register.md",
    "templates/product-baseline-review.md",
    "templates/claim-control-report.md",
    "templates/assumption-register.md",
    "checklists/product-baseline-review.md",
    "checklists/claim-control-review.md",
    "prompts/product-baseline-agent.md",
    "prompts/claim-control-agent.md",
    "docs/guided-delivery-baseline.md",
    "docs/product-baseline.md",
    "docs/claim-control.md",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "examples/1.3-guided-delivery-baseline/README.md",
    "releases/1.3.0/release-record.md",
    "releases/1.3.0/known-limitations.md",
    "releases/1.3.0/self-check-report.md",
    "tasks/130-guided-delivery-baseline.md",
    "review-loop-reports/130-guided-delivery-baseline.md",
    "final-reports/130-guided-delivery-baseline.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`guided delivery baseline asset exists ${file}`);
    else fail(`guided delivery baseline asset missing ${file}`);
  }

  const productBaseline = read("core/product-baseline.md");
  for (const marker of [
    "Human decides",
    "Reports are not approvals",
    "Simulated evidence is not production evidence",
    "Industrial packs are selected-only",
    "Allowed Claims",
    "Forbidden Claims",
    "Evidence Status",
    "Known Limitations",
  ]) {
    if (productBaseline.includes(marker)) pass(`product baseline includes ${marker}`);
    else fail(`product baseline missing ${marker}`);
  }

  const claimControl = read("core/claim-control.md");
  for (const marker of ["Claims must match evidence", "Forbidden Claims", "Required Release Sections", "Required Report Boundary"]) {
    if (claimControl.includes(marker)) pass(`claim control includes ${marker}`);
    else fail(`claim control missing ${marker}`);
  }

  const assumptionRegister = read("core/assumption-register.md");
  for (const marker of ["must not become", "PENDING_CONFIRMATION", "Needs human confirmation"]) {
    if (assumptionRegister.includes(marker)) pass(`assumption register includes ${marker}`);
    else fail(`assumption register missing ${marker}`);
  }

  const productCheck = runNode(["scripts/check-product-baseline.mjs", "."]);
  if (productCheck.status === 0 && productCheck.stdout.includes("Product baseline check passed")) {
    pass("product baseline checker passes source repo");
  } else {
    fail(`product baseline checker failed: ${productCheck.stderr || productCheck.stdout}`);
  }

  const claimCheck = runNode(["scripts/check-claim-control.mjs", "."]);
  if (claimCheck.status === 0 && claimCheck.stdout.includes("Claim control check passed")) {
    pass("claim control checker passes source repo");
  } else {
    fail(`claim control checker failed: ${claimCheck.stderr || claimCheck.stdout}`);
  }

  for (const [name, args, expected] of [
    ["bad overclaimed release", ["scripts/check-claim-control.mjs", "test-fixtures/bad/bad-overclaimed-release"], "forbidden claim"],
    ["bad report as approval", ["scripts/check-claim-control.mjs", "test-fixtures/bad/bad-report-as-approval", "--file", "test-fixtures/bad/bad-report-as-approval/final-reports/001-release.md"], "forbidden claim"],
    ["bad unmarked assumption", ["scripts/check-claim-control.mjs", "test-fixtures/bad/bad-unmarked-assumption", "--file", "test-fixtures/bad/bad-unmarked-assumption/final-reports/001-assumption.md"], "without Assumption Register"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`claim control rejects ${name}`);
    } else {
      fail(`claim control must reject ${name}: ${output}`);
    }
  }

  const emptyReleaseRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-empty-release-"));
  fs.mkdirSync(path.join(emptyReleaseRoot, "releases", "9.9.9"), { recursive: true });
  fs.writeFileSync(path.join(emptyReleaseRoot, "VERSION.md"), "Current version: `9.9.9`\n");
  fs.writeFileSync(path.join(emptyReleaseRoot, "releases", "9.9.9", "release-record.md"), [
    "# Release Record: 9.9.9",
    "",
    "## Allowed Claims",
    "",
    "## Forbidden Claims",
    "",
    "## Evidence Status",
    "",
    "## Known Limitations",
    "",
    "## Verification",
    "",
  ].join("\n"));
  const emptyReleaseCheck = runNode(["scripts/check-claim-control.mjs", emptyReleaseRoot]);
  const emptyReleaseOutput = `${emptyReleaseCheck.stdout}\n${emptyReleaseCheck.stderr}`;
  if (emptyReleaseCheck.status !== 0 && emptyReleaseOutput.includes("meaningful claim-control section")) {
    pass("claim control rejects empty release sections");
  } else {
    fail(`claim control must reject empty release sections: ${emptyReleaseOutput}`);
  }

  const baselineEnforcement = runNode([
    "scripts/check-baseline-enforcement.mjs",
    ".",
    "--mode",
    "implementation",
    "--task",
    "tasks/130-guided-delivery-baseline.md",
  ]);
  if (baselineEnforcement.status === 0) {
    pass("1.3 task baseline enforcement check");
  } else {
    fail(`1.3 task baseline enforcement failed: ${baselineEnforcement.stderr || baselineEnforcement.stdout}`);
  }
}

function checkProjectMemoryContextGovernanceProtocol() {
  const required = [
    "docs/plans/project-memory-context-governance-1.4-plan.md",
    "core/context-governance.md",
    "core/git-boundary.md",
    "templates/learning-candidate.md",
    "templates/context-correction-report.md",
    "templates/git-boundary-report.md",
    "checklists/context-governance-review.md",
    "checklists/git-boundary-review.md",
    "prompts/context-governance-agent.md",
    "docs/project-memory.md",
    "docs/git-boundary.md",
    "learning-candidates/.gitkeep",
    "context-corrections/.gitkeep",
    "git-boundary-reports/.gitkeep",
    "launch-readiness/.gitkeep",
    "conversation-turns/.gitkeep",
    "scope-change-reports/.gitkeep",
    "scripts/check-context-governance.mjs",
    "examples/1.4-project-memory-context/README.md",
    "examples/1.4-project-memory-context/learning-candidates/001-status-source.md",
    "examples/1.4-project-memory-context/context-corrections/001-status-source-correction.md",
    "examples/1.4-project-memory-context/git-boundary-reports/001-context-artifacts.md",
    "releases/1.4.0/release-record.md",
    "releases/1.4.0/known-limitations.md",
    "releases/1.4.0/self-check-report.md",
    "tasks/140-project-memory-context-governance.md",
    "review-loop-reports/140-project-memory-context-governance.md",
    "final-reports/140-project-memory-context-governance.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`project memory context governance asset exists ${file}`);
    else fail(`project memory context governance asset missing ${file}`);
  }

  const contextGovernance = read("core/context-governance.md");
  for (const marker of [
    "Codex drafts. Humans confirm.",
    "Context Authority Order",
    "Only `CONFIRMED` context can become a project rule",
    "Model memory must not override Git-backed context",
  ]) {
    if (contextGovernance.includes(marker)) pass(`context governance includes ${marker}`);
    else fail(`context governance missing ${marker}`);
  }

  const gitBoundary = read("core/git-boundary.md");
  for (const marker of ["Should Enter Git", "Conditional Git Artifacts", "Default Local Only", "Never Commit", "Git Boundary Report"]) {
    if (gitBoundary.includes(marker)) pass(`git boundary includes ${marker}`);
    else fail(`git boundary missing ${marker}`);
  }

  const contextCheck = runNode(["scripts/check-context-governance.mjs", "."]);
  if (contextCheck.status === 0 && contextCheck.stdout.includes("Context governance check passed")) {
    pass("context governance checker passes source repo");
  } else {
    fail(`context governance checker failed: ${contextCheck.stderr || contextCheck.stdout}`);
  }

  for (const [name, args, expected] of [
    ["bad approved learning without evidence", ["scripts/check-context-governance.mjs", "test-fixtures/bad/bad-learning-approved-without-evidence"], "approved learning candidate must include evidence"],
    ["bad context correction missing evidence", ["scripts/check-context-governance.mjs", "test-fixtures/bad/bad-context-correction-missing-evidence"], "New Evidence"],
    ["bad git boundary secret", ["scripts/check-context-governance.mjs", "test-fixtures/bad/bad-git-boundary-secret"], "secret-like content"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`context governance rejects ${name}`);
    } else {
      fail(`context governance must reject ${name}: ${output}`);
    }
  }
}

function checkSafeLaunchProtocol() {
  const required = [
    "docs/roadmaps/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md",
    "docs/context-governance-usage.md",
    "docs/minimal-commit-set.md",
    "core/safe-launch.md",
    "templates/launch-readiness-report.md",
    "checklists/launch-readiness-review.md",
    "prompts/launch-readiness-agent.md",
    "docs/safe-launch.md",
    "launch-readiness/.gitkeep",
    "scripts/check-launch-readiness.mjs",
    "examples/1.5-safe-launch-readiness/README.md",
    "examples/1.5-safe-launch-readiness/launch-readiness/001-internal-handoff.md",
    "releases/1.4.1/release-record.md",
    "releases/1.4.1/known-limitations.md",
    "releases/1.4.1/self-check-report.md",
    "releases/1.5.0/release-record.md",
    "releases/1.5.0/known-limitations.md",
    "releases/1.5.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`safe launch asset exists ${file}`);
    else fail(`safe launch asset missing ${file}`);
  }

  const safeLaunch = read("core/safe-launch.md");
  for (const marker of [
    "Codex may recommend readiness",
    "Humans approve release",
    "READY_FOR_DEMO",
    "READY_FOR_INTERNAL_HANDOFF",
    "READY_FOR_RELEASE_REVIEW",
    "BL0 must not be described as production-ready",
  ]) {
    if (safeLaunch.includes(marker)) pass(`safe launch core includes ${marker}`);
    else fail(`safe launch core missing ${marker}`);
  }

  const usage = read("docs/context-governance-usage.md");
  for (const marker of ["Learning Candidate", "Context Correction Report", "Git Boundary Report", "Finding something is not the same"]) {
    if (usage.includes(marker)) pass(`context governance usage includes ${marker}`);
    else fail(`context governance usage missing ${marker}`);
  }

  const minimalCommit = read("docs/minimal-commit-set.md");
  for (const marker of ["Commit only the durable work", ".DS_Store", "Do not commit", "Dirty Worktree Rule"]) {
    if (minimalCommit.includes(marker)) pass(`minimal commit set includes ${marker}`);
    else fail(`minimal commit set missing ${marker}`);
  }

  const launchCheck = runNode(["scripts/check-launch-readiness.mjs", "."]);
  if (launchCheck.status === 0 && launchCheck.stdout.includes("Launch readiness check passed")) {
    pass("launch readiness checker passes source repo");
  } else {
    fail(`launch readiness checker failed: ${launchCheck.stderr || launchCheck.stdout}`);
  }

  const example = runNode(["scripts/check-launch-readiness.mjs", "examples/1.5-safe-launch-readiness"]);
  if (example.status === 0 && example.stdout.includes("Launch readiness check passed")) {
    pass("safe launch example passes checker");
  } else {
    fail(`safe launch example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["missing verification", ["scripts/check-launch-readiness.mjs", "test-fixtures/bad/bad-launch-readiness-missing-verification"], "ready state must include verification evidence"],
    ["pending human decision", ["scripts/check-launch-readiness.mjs", "test-fixtures/bad/bad-launch-readiness-unclosed-decision"], "has pending human decision"],
    ["overclaim", ["scripts/check-launch-readiness.mjs", "test-fixtures/bad/bad-launch-readiness-overclaim"], "forbidden launch overclaim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`safe launch rejects ${name}`);
    } else {
      fail(`safe launch must reject ${name}: ${output}`);
    }
  }
}

function checkConversationDriftProtocol() {
  const required = [
    "core/conversation-drift-control.md",
    "templates/conversation-turn-classification.md",
    "templates/scope-change-report.md",
    "checklists/conversation-drift-review.md",
    "prompts/conversation-router-agent.md",
    "docs/conversation-drift-control.md",
    "conversation-turns/.gitkeep",
    "scope-change-reports/.gitkeep",
    "scripts/check-conversation-drift.mjs",
    "examples/1.6-conversation-drift-control/README.md",
    "examples/1.6-conversation-drift-control/conversation-turns/001-discuss-only.md",
    "examples/1.6-conversation-drift-control/scope-change-reports/001-add-release-gate.md",
    "releases/1.6.0/release-record.md",
    "releases/1.6.0/known-limitations.md",
    "releases/1.6.0/self-check-report.md",
    "goal-cards/141-160-delivery-readiness-drift.md",
    "subagent-run-plans/141-160-delivery-readiness-drift.md",
    "review-loop-reports/141-160-delivery-readiness-drift.md",
    "final-reports/141-160-delivery-readiness-drift.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`conversation drift asset exists ${file}`);
    else fail(`conversation drift asset missing ${file}`);
  }

  const drift = read("core/conversation-drift-control.md");
  for (const marker of [
    "Classify before acting",
    "DISCUSS_ONLY",
    "SCOPE_CHANGE",
    "RISK_DECISION",
    "Codex must not continue",
  ]) {
    if (drift.includes(marker)) pass(`conversation drift core includes ${marker}`);
    else fail(`conversation drift core missing ${marker}`);
  }

  const driftCheck = runNode(["scripts/check-conversation-drift.mjs", "."]);
  if (driftCheck.status === 0 && driftCheck.stdout.includes("Conversation drift check passed")) {
    pass("conversation drift checker passes source repo");
  } else {
    fail(`conversation drift checker failed: ${driftCheck.stderr || driftCheck.stdout}`);
  }

  const example = runNode(["scripts/check-conversation-drift.mjs", "examples/1.6-conversation-drift-control"]);
  if (example.status === 0 && example.stdout.includes("Conversation drift check passed")) {
    pass("conversation drift example passes checker");
  } else {
    fail(`conversation drift example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["discussion-only writes", ["scripts/check-conversation-drift.mjs", "test-fixtures/bad/bad-conversation-discuss-only-writes"], "DISCUSS_ONLY must not continue current task"],
    ["scope creep", ["scripts/check-conversation-drift.mjs", "test-fixtures/bad/bad-conversation-scope-creep"], "SCOPE_CHANGE must require human decision"],
    ["risk auto continue", ["scripts/check-conversation-drift.mjs", "test-fixtures/bad/bad-conversation-risk-auto-continue"], "RISK_DECISION must require human decision"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`conversation drift rejects ${name}`);
    } else {
      fail(`conversation drift must reject ${name}: ${output}`);
    }
  }
}

function checkFirstDeliveryWalkthroughProtocol() {
  const required = [
    "core/first-delivery-walkthrough.md",
    "templates/adoption-trial-report.md",
    "checklists/first-delivery-walkthrough-review.md",
    "prompts/walkthrough-agent.md",
    "docs/first-delivery-walkthrough.md",
    "adoption-trial-reports/.gitkeep",
    "adoption-trial-reports/170-first-delivery-walkthrough.md",
    "scripts/check-first-delivery-walkthrough.mjs",
    "examples/1.7-first-delivery-walkthrough/README.md",
    "examples/1.7-first-delivery-walkthrough/adoption-trial-reports/001-booking-app-simulation.md",
    "examples/1.7-first-delivery-walkthrough/launch-readiness/001-booking-app-demo.md",
    "examples/1.7-first-delivery-walkthrough/final-reports/001-booking-app.md",
    "examples/1.7-first-delivery-walkthrough/conversation-turns/001-add-payment.md",
    "examples/1.7-first-delivery-walkthrough/scope-change-reports/001-add-payment.md",
    "releases/1.7.0/release-record.md",
    "releases/1.7.0/known-limitations.md",
    "releases/1.7.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`first delivery asset exists ${file}`);
    else fail(`first delivery asset missing ${file}`);
  }

  const core = read("core/first-delivery-walkthrough.md");
  for (const marker of [
    "Human idea",
    "Lightweight Path",
    "Adoption Trial Report",
    "Forbidden Claims",
  ]) {
    if (core.includes(marker)) pass(`first delivery core includes ${marker}`);
    else fail(`first delivery core missing ${marker}`);
  }

  const firstDeliveryCheck = runNode(["scripts/check-first-delivery-walkthrough.mjs", "."]);
  if (firstDeliveryCheck.status === 0 && firstDeliveryCheck.stdout.includes("First delivery walkthrough check passed")) {
    pass("first delivery checker passes source repo");
  } else {
    fail(`first delivery checker failed: ${firstDeliveryCheck.stderr || firstDeliveryCheck.stdout}`);
  }

  const example = runNode(["scripts/check-first-delivery-walkthrough.mjs", "examples/1.7-first-delivery-walkthrough"]);
  if (example.status === 0 && example.stdout.includes("First delivery walkthrough check passed")) {
    pass("first delivery example passes checker");
  } else {
    fail(`first delivery example failed: ${example.stderr || example.stdout}`);
  }

  const workflowArtifacts = runNode([
    "scripts/check-workflow-artifacts.mjs",
    ".",
    "--mode",
    "ready",
    "--task",
    "tasks/170-first-delivery-walkthrough.md",
  ]);
  if (workflowArtifacts.status === 0) {
    pass("first delivery execution passes workflow artifact gate");
  } else {
    fail(`first delivery workflow artifact gate failed: ${workflowArtifacts.stderr || workflowArtifacts.stdout}`);
  }

  const reviewLoop = runNode([
    "scripts/check-review-loop.mjs",
    ".",
    "--task",
    "tasks/170-first-delivery-walkthrough.md",
  ]);
  if (reviewLoop.status === 0) {
    pass("first delivery execution passes review loop gate");
  } else {
    fail(`first delivery review loop gate failed: ${reviewLoop.stderr || reviewLoop.stdout}`);
  }

  const nextStepBoundary = runNode([
    "scripts/check-next-step-boundary.mjs",
    ".",
    "--task",
    "tasks/170-first-delivery-walkthrough.md",
  ]);
  if (nextStepBoundary.status === 0) {
    pass("first delivery execution passes next-step boundary gate");
  } else {
    fail(`first delivery next-step boundary gate failed: ${nextStepBoundary.stderr || nextStepBoundary.stdout}`);
  }

  const subagentRunPlan = read("subagent-run-plans/170-first-delivery-walkthrough.md");
  const subagentMarkers = [
    "Many readers, one writer: Yes",
    "All subagents closed: Yes",
    "No subagent left occupying a slot after handoff: Yes",
  ];
  for (const marker of subagentMarkers) {
    if (subagentRunPlan.includes(marker)) pass(`first delivery subagent evidence includes ${marker}`);
    else fail(`first delivery subagent evidence missing ${marker}`);
  }
  if (/\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*(RUNNING|PENDING)\s*\|/i.test(subagentRunPlan)) {
    fail("first delivery subagent role roster must not leave RUNNING or PENDING agents");
  } else {
    pass("first delivery subagent role roster leaves no running or pending agents");
  }

  for (const [name, args, expected] of [
    ["missing final", ["scripts/check-first-delivery-walkthrough.mjs", "test-fixtures/bad/bad-first-delivery-missing-final"], "must reference Final Report"],
    ["missing launch", ["scripts/check-first-delivery-walkthrough.mjs", "test-fixtures/bad/bad-first-delivery-missing-launch"], "must reference Launch Readiness"],
    ["overclaim", ["scripts/check-first-delivery-walkthrough.mjs", "test-fixtures/bad/bad-first-delivery-overclaim"], "forbidden walkthrough overclaim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`first delivery rejects ${name}`);
    } else {
      fail(`first delivery must reject ${name}: ${output}`);
    }
  }
}

function checkRealAdoptionAndPatchClassificationProtocol() {
  const required = [
    "docs/plans/real-project-adoption-trial-1.8-plan.md",
    "docs/real-adoption-usage.md",
    "core/real-project-adoption-trial.md",
    "core/patch-classification.md",
    "templates/real-adoption-trial-report.md",
    "templates/patch-classification-report.md",
    "templates/patch-classification-false-positive.md",
    "templates/existing-governance-map.md",
    "checklists/real-adoption-trial-review.md",
    "checklists/patch-classification-review.md",
    "prompts/real-adoption-agent.md",
    "prompts/patch-classifier-agent.md",
    "scripts/check-real-adoption-trial.mjs",
    "scripts/check-patch-classification.mjs",
    "scripts/lib/risk-surfaces.mjs",
    "real-adoption-trials/.gitkeep",
    "governance-maps/.gitkeep",
    "patch-classifications/.gitkeep",
    "patch-classification-false-positives/.gitkeep",
    "real-adoption-trials/180-governed-web-readonly.md",
    "governance-maps/180-governed-web-readonly.md",
    "patch-classifications/180-governed-web-repair-scale.md",
    "patch-classification-false-positives/181-risk-surface-calibration.md",
    "examples/1.8-real-project-readonly/README.md",
    "examples/1.8-real-project-readonly/real-adoption-trials/001-governed-web-readonly.md",
    "examples/1.8-real-project-readonly/governance-maps/001-governed-web-readonly.md",
    "examples/1.8-real-project-readonly/patch-classifications/001-structural-remediation.md",
    "releases/1.8.0/release-record.md",
    "releases/1.8.0/known-limitations.md",
    "releases/1.8.0/self-check-report.md",
    "releases/1.8.1/release-record.md",
    "releases/1.8.1/known-limitations.md",
    "releases/1.8.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`real adoption / patch classification asset exists ${file}`);
    else fail(`real adoption / patch classification asset missing ${file}`);
  }

  const realAdoptionCore = read("core/real-project-adoption-trial.md");
  for (const marker of [
    "Real project adoption is read-only by default",
    "primary mode plus secondary tags",
    "NO_WRITE_MAP",
    "DOCS_ONLY_BRIDGE",
    "THIN_OPERATIONAL_BRIDGE",
    "Public Evidence Status",
    "Patch classification authorizes code changes",
  ]) {
    if (realAdoptionCore.includes(marker)) pass(`real adoption core includes ${marker}`);
    else fail(`real adoption core missing ${marker}`);
  }

  const patchCore = read("core/patch-classification.md");
  for (const marker of [
    "Patch Classification Governance",
    "SAFE_LOCAL_FIX",
    "BASELINE_ALIGNED_HARDCUT",
    "STRUCTURAL_REMEDIATION",
    "NEEDS_HUMAN_DECISION",
    "DO_NOT_PATCH",
    "Patch classification does not authorize implementation",
    "heuristic and structure-based",
  ]) {
    if (patchCore.includes(marker)) pass(`patch classification core includes ${marker}`);
    else fail(`patch classification core missing ${marker}`);
  }

  const realAdoptionCheck = runNode(["scripts/check-real-adoption-trial.mjs", "."]);
  if (realAdoptionCheck.status === 0 && realAdoptionCheck.stdout.includes("Real adoption trial check passed")) {
    pass("real adoption checker passes source repo");
  } else {
    fail(`real adoption checker failed: ${realAdoptionCheck.stderr || realAdoptionCheck.stdout}`);
  }

  const patchCheck = runNode(["scripts/check-patch-classification.mjs", "."]);
  if (patchCheck.status === 0 && patchCheck.stdout.includes("Patch classification check passed")) {
    pass("patch classification checker passes source repo");
  } else {
    fail(`patch classification checker failed: ${patchCheck.stderr || patchCheck.stdout}`);
  }

  const realExample = runNode(["scripts/check-real-adoption-trial.mjs", "examples/1.8-real-project-readonly"]);
  if (realExample.status === 0 && realExample.stdout.includes("Real adoption trial check passed")) {
    pass("real adoption example passes checker");
  } else {
    fail(`real adoption example failed: ${realExample.stderr || realExample.stdout}`);
  }

  const patchExample = runNode(["scripts/check-patch-classification.mjs", "examples/1.8-real-project-readonly"]);
  if (patchExample.status === 0 && patchExample.stdout.includes("Patch classification check passed")) {
    pass("patch classification example passes checker");
  } else {
    fail(`patch classification example failed: ${patchExample.stderr || patchExample.stdout}`);
  }

  for (const [name, args, expected] of [
    ["real adoption overclaim", ["scripts/check-real-adoption-trial.mjs", "test-fixtures/bad/bad-real-adoption-overclaim"], "forbidden real-adoption overclaim"],
    ["real adoption target write", ["scripts/check-real-adoption-trial.mjs", "test-fixtures/bad/bad-real-adoption-target-write"], "No target writes performed"],
    ["real adoption public name", ["scripts/check-real-adoption-trial.mjs", "test-fixtures/bad/bad-real-adoption-public-name"], "Public Evidence Status is LOCAL_ONLY"],
    ["safe local high risk", ["scripts/check-patch-classification.mjs", "test-fixtures/bad/bad-patch-safe-local-high-risk"], "SAFE_LOCAL_FIX"],
    ["patch authorizes implementation", ["scripts/check-patch-classification.mjs", "test-fixtures/bad/bad-patch-authorizes-implementation"], "authorize implementation"],
    ["do not patch completed", ["scripts/check-patch-classification.mjs", "test-fixtures/bad/bad-patch-do-not-patch-done"], "DO_NOT_PATCH"],
    ["patch false positive unsafe", ["scripts/check-patch-classification.mjs", "test-fixtures/bad/bad-patch-false-positive-unsafe"], "false-positive cannot be accepted"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.8 rejects ${name}`);
    } else {
      fail(`1.8 must reject ${name}: ${output}`);
    }
  }

  const workflowArtifacts = runNode([
    "scripts/check-workflow-artifacts.mjs",
    ".",
    "--mode",
    "ready",
    "--task",
    "tasks/180-real-project-adoption-trial.md",
  ]);
  if (workflowArtifacts.status === 0) {
    pass("1.8 execution passes workflow artifact gate");
  } else {
    fail(`1.8 workflow artifact gate failed: ${workflowArtifacts.stderr || workflowArtifacts.stdout}`);
  }

  const reviewLoop = runNode([
    "scripts/check-review-loop.mjs",
    ".",
    "--task",
    "tasks/180-real-project-adoption-trial.md",
  ]);
  if (reviewLoop.status === 0) {
    pass("1.8 execution passes review loop gate");
  } else {
    fail(`1.8 review loop gate failed: ${reviewLoop.stderr || reviewLoop.stdout}`);
  }
}

function checkExistingProjectWorkflowAdapterProtocol() {
  const required = [
    "core/existing-project-workflow-adapter.md",
    "docs/existing-project-workflow-adapter.md",
    "templates/workflow-adoption-map.md",
    "checklists/workflow-adoption-map-review.md",
    "prompts/workflow-adapter-agent.md",
    "workflow-adoption-maps/.gitkeep",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "examples/1.20-existing-project-workflow-adapter/README.md",
    "examples/1.20-existing-project-workflow-adapter/workflow-adoption-maps/001-governed-web-workflow-map.md",
    "test-fixtures/bad/bad-workflow-adoption-authorizes-write/workflow-adoption-maps/001-bad.md",
    "test-fixtures/bad/bad-workflow-adoption-missing-use/workflow-adoption-maps/001-bad.md",
    "releases/1.20.0/release-record.md",
    "releases/1.20.0/known-limitations.md",
    "releases/1.20.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.20 workflow adapter asset exists ${file}`);
    else fail(`1.20 workflow adapter asset missing ${file}`);
  }

  const combined = [
    read("core/existing-project-workflow-adapter.md"),
    read("docs/existing-project-workflow-adapter.md"),
    read("templates/workflow-adoption-map.md"),
    read("scripts/resolve-existing-workflow.mjs"),
    read("scripts/check-workflow-adoption-map.mjs"),
    read("releases/1.20.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Existing Project Workflow Adapter",
    "Workflow Adoption Map",
    "READ_ONLY_MAP",
    "DOCS_ONLY_BRIDGE",
    "THIN_OPERATIONAL_BRIDGE",
    "BLOCKED_NEEDS_OWNER",
    "For existing projects, Codex must recommend a workflow adapter path before recommending file writes",
    "Recommended IntentOS Workflow Use",
    "Native Migration Plan",
    "What Not To Touch",
    "does not install target-project workflow assets",
    "does not change hooks or CI",
    "does not approve implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.20 workflow adapter includes ${marker}`);
    else fail(`1.20 workflow adapter missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-workflow.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Adoption Map Recommendation")
    && resolver.stdout.includes("Native Migration Recommendation")
    && resolver.stdout.includes("This report authorizes target-project writes: No")) {
    pass("1.20 workflow adapter resolver passes source repo");
  } else {
    fail(`1.20 workflow adapter resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-workflow.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_ADOPTION_MAP_RECOMMENDATION"
        && parsed.boundary?.authorizesTargetProjectWrites === "No"
        && Array.isArray(parsed.recommendedIntentOSWorkflowUse)
        && parsed.nativeMigrationRecommendation?.nextStep
        && parsed.nativeMigrationRecommendation?.posture
        && parsed.nativeMigrationRecommendation?.writes === "No") {
        pass("1.20 workflow adapter resolver JSON includes map and boundary");
      } else {
        fail(`1.20 workflow adapter resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.20 workflow adapter resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.20 workflow adapter resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-workflow-adoption-map.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Workflow adoption map check passed")) {
    pass("1.20 workflow adoption map checker passes source repo");
  } else {
    fail(`1.20 workflow adoption map checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-adoption-map.mjs", "examples/1.20-existing-project-workflow-adapter"]);
  if (example.status === 0 && example.stdout.includes("Workflow adoption map check passed")) {
    pass("1.20 workflow adoption map example passes checker");
  } else {
    fail(`1.20 workflow adoption map example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-adoption-authorizes-write"], "authorizes target-project writes"],
    ["missing workflow use", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-adoption-missing-use"], "Request / Spec / Task Card"],
    ["adapter endpoint", ["scripts/check-workflow-adoption-map.mjs", "test-fixtures/bad/bad-workflow-map-adapter-endpoint"], "final adoption endpoint"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.20 workflow adapter rejects ${name}`);
    } else {
      fail(`1.20 workflow adapter must reject ${name}: ${output}`);
    }
  }
}

function checkNativeFirstMigrationProtocol() {
  const required = [
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
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/AGENTS.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/docs/GOVERNANCE.md",
    "examples/1.64-native-migration-parser-calibration/table-long-bilingual/native-migration-plans/001-table-long-bilingual.md",
    "examples/1.65-native-migration-classification-calibration/README.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/AGENTS.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/docs/GOVERNANCE.md",
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/native-migration-plans/001-mixed-domain-bilingual.md",
    "releases/1.62.0/release-record.md",
    "releases/1.62.0/known-limitations.md",
    "releases/1.62.0/self-check-report.md",
    "test-fixtures/bad/bad-native-migration-drops-business-rule/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-direct-agents-overwrite/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-keeps-split-authority/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-auto-ci-hook/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-production-config/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-human-approval/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-restore-plan/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-approves-implementation/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-unknown-owner/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-business-rule-as-workflow-rule/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-production-control-as-baseline/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-source-excerpt/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-broad-target-path/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-no-authority-transition/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-mixed-rules-collapsed/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-missing-line-range/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-structured-evidence-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-schema-invalid/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-rule-json-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-line-range-mismatch/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-missing-skipped-block-reporting/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-structured-action-writes/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-mixed-business-engineering-as-baseline/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-chinese-production-as-business/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-simple-table-no-line-range/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-complex-table-no-warning/native-migration-plans/001-bad.md",
    "test-fixtures/bad/bad-native-migration-proposed-action-mismatch/native-migration-plans/001-bad.md",
    "releases/1.65.0/release-record.md",
    "releases/1.65.0/known-limitations.md",
    "releases/1.65.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.62 native migration asset exists ${file}`);
    else fail(`1.62 native migration asset missing ${file}`);
  }

  const combined = [
    read("core/native-first-existing-project-migration.md"),
    read("docs/native-first-existing-project-migration.md"),
    read("templates/native-migration-plan.md"),
    read("scripts/resolve-native-migration.mjs"),
    read("scripts/check-native-migration.mjs"),
    read("scripts/lib/native-rule-extraction.mjs"),
    read("schemas/artifacts/native-migration-plan.schema.json"),
    read("releases/1.62.0/release-record.md"),
    read("releases/1.63.0/release-record.md"),
    read("releases/1.64.0/release-record.md"),
    read("releases/1.65.0/release-record.md"),
  ].join("\n");

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
    "Rule Extraction Coverage",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "parser_warnings",
    "skipped_blocks",
    "low_signal_blocks",
    "proposed_actions",
    "Markdown/JSON",
    "classification calibration",
    "mixed business + engineering",
    "Chinese",
    "simple Markdown table",
    "proposed-action",
  ]) {
    if (combined.includes(marker)) pass(`native migration includes ${marker}`);
    else fail(`native migration missing ${marker}`);
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

  const resolverJson = runNode(["scripts/resolve-native-migration.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION"
        && parsed.canCodexWriteNow === "No"
        && parsed.businessAuthority === "PROJECT_OWNED"
        && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM"
        && parsed.boundary?.writesTargetFiles === "No") {
        pass("1.62 native migration resolver JSON includes safe authority fields");
      } else {
        fail(`1.62 native migration resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.62 native migration resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.62 native migration resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-native-migration.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Native Migration check passed")) {
    pass("1.62 native migration checker passes source repo");
  } else {
    fail(`1.62 native migration checker failed: ${source.stderr || source.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "native-migration", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Native-First Migration Planning mode")) {
    pass("CLI native-migration delegates to native migration resolver");
  } else {
    fail(`CLI native-migration failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "native-migration-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Native Migration check passed")) {
    pass("CLI native-migration-check delegates to native migration checker");
  } else {
    fail(`CLI native-migration-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
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
    else fail(`1.62 native migration must reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-mixed-rules-collapsed",
    "bad-native-migration-missing-line-range",
    "bad-native-migration-structured-evidence-mismatch",
    "bad-native-migration-schema-invalid",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.63 native migration rejects ${target}`);
    else fail(`1.63 native migration must reject ${target}`);
  }

  for (const target of [
    "bad-native-migration-rule-json-mismatch",
    "bad-native-migration-line-range-mismatch",
    "bad-native-migration-missing-skipped-block-reporting",
    "bad-native-migration-structured-action-writes",
  ]) {
    const result = runNode(["scripts/check-native-migration.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.64 native migration rejects ${target}`);
    else fail(`1.64 native migration must reject ${target}`);
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
    else fail(`1.65 native migration must reject ${target}`);
  }
}

function checkExistingRuleReconciliationProtocol() {
  const badFixtures = [
    "bad-rule-reconciliation-replaces-release-sop",
    "bad-rule-reconciliation-business-as-engineering",
    "bad-rule-reconciliation-approves-target-write",
    "bad-rule-reconciliation-skips-approval-chain",
    "bad-rule-reconciliation-production-intentos-wins",
    "bad-rule-reconciliation-missing-protected-owner",
    "bad-rule-reconciliation-fake-gap-evidence",
    "bad-rule-reconciliation-release-adopt-intentos",
    "bad-rule-reconciliation-merge-without-preserved-terms",
    "bad-rule-reconciliation-gap-suggestion-as-approval",
    "bad-rule-reconciliation-missing-source-ref",
  ];
  const required = [
    "docs/plans/existing-rule-reconciliation-calibration-1.66-plan.md",
    "core/existing-rule-reconciliation.md",
    "docs/existing-rule-reconciliation.md",
    "templates/existing-rule-reconciliation-report.md",
    "schemas/artifacts/existing-rule-reconciliation.schema.json",
    "checklists/existing-rule-reconciliation-review.md",
    "prompts/existing-rule-reconciliation-agent.md",
    "existing-rule-reconciliations/.gitkeep",
    "rule-reconciliation-calibration-reports/.gitkeep",
    "rule-reconciliation-calibration-reports/2026-07-04-anonymized-existing-project.md",
    "scripts/resolve-existing-rule-reconciliation.mjs",
    "scripts/check-existing-rule-reconciliation.mjs",
    "examples/1.66-existing-rule-reconciliation/README.md",
    "examples/1.66-existing-rule-reconciliation/governed-web-admin/README.md",
    "examples/1.66-existing-rule-reconciliation/governed-web-admin/existing-rule-reconciliations/001-governed-web-admin.md",
    "releases/1.66.0/release-record.md",
    "releases/1.66.0/known-limitations.md",
    "releases/1.66.0/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/existing-rule-reconciliations/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.66 existing rule reconciliation asset exists ${file}`);
    else fail(`1.66 existing rule reconciliation asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-rule-reconciliation-calibration-1.66-plan.md"),
    read("core/existing-rule-reconciliation.md"),
    read("docs/existing-rule-reconciliation.md"),
    read("templates/existing-rule-reconciliation-report.md"),
    read("schemas/artifacts/existing-rule-reconciliation.schema.json"),
    read("scripts/resolve-existing-rule-reconciliation.mjs"),
    read("scripts/check-existing-rule-reconciliation.mjs"),
    exists("releases/1.66.0/release-record.md") ? read("releases/1.66.0/release-record.md") : "",
  ].join("\n");

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
    "Native Migration Plan",
    "Unified Apply Plan",
    "Controlled Apply Readiness",
    "Approval Record",
    "Machine-Readable Evidence",
    "existing_rule_reconciliation_report",
    "can_codex_write_now",
    "protected_constraints",
    "release_production_gaps",
    "rule_reconciliation_coverage",
    "native_adoption_decision",
    "can_recommend_apply_plan_now",
    "NoUntilBlockResolved",
    "evidence_profile",
    "existing_rule_source",
    "intentos_reference_source",
    "IntentOS Adoption Recommendation",
    "false positive",
    "false negative",
  ]) {
    if (combined.includes(marker)) pass(`1.66 existing rule reconciliation includes ${marker}`);
    else fail(`1.66 existing rule reconciliation missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-existing-rule-reconciliation.mjs",
    "node --check scripts/check-existing-rule-reconciliation.mjs",
    "node scripts/cli.mjs reconcile-rules .",
    "node scripts/cli.mjs reconcile-rules . --auto-native",
    "node scripts/cli.mjs reconcile-rules-check .",
    "node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.66 package verify surface includes ${marker}`);
    else fail(`1.66 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-rule-reconciliation.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Existing Rule Reconciliation Report")
    && resolver.stdout.includes("This is a recommendation report, not permission to change files.")
    && resolver.stdout.includes("Unified Apply Plan")) {
    pass("1.66 existing rule reconciliation resolver prints safe report");
  } else {
    fail(`1.66 existing rule reconciliation resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-rule-reconciliation.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXISTING_RULE_RECONCILIATION"
        && parsed.canCodexWriteNow === "No"
        && parsed.reconciliationAuthority === "RECOMMENDATION_ONLY"
        && parsed.businessAuthority === "PROJECT_OWNED"
        && parsed.productionAuthority === "HUMAN_OR_EXTERNAL_SYSTEM"
        && parsed.boundary?.writesTargetFiles === "No") {
        pass("1.66 existing rule reconciliation resolver JSON includes safe authority fields");
      } else {
        fail(`1.66 existing rule reconciliation resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.66 existing rule reconciliation resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.66 existing rule reconciliation resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-existing-rule-reconciliation.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Existing Rule Reconciliation check passed")) {
    pass("1.66 existing rule reconciliation checker passes source repo");
  } else {
    fail(`1.66 existing rule reconciliation checker failed: ${source.stderr || source.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "reconcile-rules", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Existing Rule Reconciliation Report")) {
    pass("CLI reconcile-rules delegates to existing rule reconciliation resolver");
  } else {
    fail(`CLI reconcile-rules failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "reconcile-rules-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Existing Rule Reconciliation check passed")) {
    pass("CLI reconcile-rules-check delegates to existing rule reconciliation checker");
  } else {
    fail(`CLI reconcile-rules-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  const strictExample = runNode(["scripts/check-existing-rule-reconciliation.mjs", "examples/1.66-existing-rule-reconciliation/governed-web-admin", "--require-structured-evidence"]);
  if (strictExample.status === 0) pass("1.66 existing rule reconciliation example passes strict checker");
  else fail(`1.66 existing rule reconciliation example failed: ${strictExample.stderr || strictExample.stdout}`);

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-existing-rule-reconciliation.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.66 existing rule reconciliation rejects ${target}`);
    else fail(`1.66 existing rule reconciliation must reject ${target}`);
  }
}

function checkGovernanceConvergenceProtocol() {
  const badFixtures = [
    "bad-governance-convergence-writes-target-files",
    "bad-governance-convergence-rewrites-history",
    "bad-governance-convergence-replaces-release-sop",
    "bad-governance-convergence-mutates-ci-hooks",
    "bad-governance-convergence-ai-log-spam",
    "bad-governance-convergence-claims-production-approval",
    "bad-governance-convergence-maximizes-migration",
    "bad-governance-convergence-ignores-omitted-rules",
    "bad-governance-convergence-upstream-ready",
    "bad-governance-convergence-summary-json-state-mismatch",
    "bad-governance-convergence-dimensions-mismatch",
    "bad-governance-convergence-schema-one-dimension",
  ];
  const required = [
    "docs/plans/existing-project-governance-convergence-1.70-plan.md",
    "core/existing-project-governance-convergence.md",
    "docs/existing-project-governance-convergence.md",
    "templates/governance-convergence-report.md",
    "schemas/artifacts/governance-convergence.schema.json",
    "checklists/governance-convergence-review.md",
    "prompts/governance-convergence-agent.md",
    "governance-convergence-reports/.gitkeep",
    "scripts/resolve-governance-convergence.mjs",
    "scripts/check-governance-convergence.mjs",
    "examples/1.70-existing-project-governance-convergence/README.md",
    "examples/1.70-existing-project-governance-convergence/governed-web-admin/governance-convergence-reports/001-governed-web-admin.md",
    "examples/1.70-existing-project-governance-convergence/production-multiplatform/governance-convergence-reports/001-production-multiplatform.md",
    "examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked/governance-convergence-reports/001-dirty-worktree.md",
    "releases/1.70.0/release-record.md",
    "releases/1.70.0/known-limitations.md",
    "releases/1.70.0/self-check-report.md",
    "releases/1.70.1/release-record.md",
    "releases/1.70.1/known-limitations.md",
    "releases/1.70.1/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/governance-convergence-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.70 governance convergence asset exists ${file}`);
    else fail(`1.70 governance convergence asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-project-governance-convergence-1.70-plan.md"),
    read("core/existing-project-governance-convergence.md"),
    read("docs/existing-project-governance-convergence.md"),
    read("templates/governance-convergence-report.md"),
    read("schemas/artifacts/governance-convergence.schema.json"),
    read("scripts/resolve-governance-convergence.mjs"),
    read("scripts/check-governance-convergence.mjs"),
    exists("releases/1.70.0/release-record.md") ? read("releases/1.70.0/release-record.md") : "",
    exists("releases/1.70.1/release-record.md") ? read("releases/1.70.1/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Existing Project Governance Convergence",
    "IntentOS Operating Mode",
    "does not mean Codex can write project assets",
    "Governance Convergence Report",
    "governance_convergence_report",
    "workflow",
    "baseline",
    "audit",
    "release",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs",
    "risk_authority",
    "Audit Bridge",
    "AI Log Boundary",
    "CONVERGENCE_READY_FOR_PLAN",
    "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE",
    "CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE",
    "upstream source requires input",
    "KEEP_EXISTING_STRICTER",
    "MERGE_AFTER_REVIEW",
    "MAP_TO_INTENTOS_ARTIFACT",
    "source_systems",
    "workflow_next",
    "native_migration",
    "existing_rule_reconciliation",
    "release_plan",
    "Human Summary",
    "Machine-Readable Evidence",
    "Unified Apply Plan",
    "Approval Record",
    "Controlled Apply Readiness",
    "This report is a derived read-only view",
    "This report maximizes migration: No",
  ]) {
    if (combined.includes(marker)) pass(`1.70 governance convergence includes ${marker}`);
    else fail(`1.70 governance convergence missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-governance-convergence.mjs",
    "node --check scripts/check-governance-convergence.mjs",
    "node scripts/cli.mjs convergence .",
    "node scripts/cli.mjs convergence-check .",
    "node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/governed-web-admin --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.70 package verify surface includes ${marker}`);
    else fail(`1.70 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-governance-convergence.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Governance Convergence Report")
    && resolver.stdout.includes("This report is a derived read-only view")
    && resolver.stdout.includes("## Convergence Dimensions")
    && resolver.stdout.includes("## AI Log Policy")) {
    pass("1.70 governance convergence resolver prints safe report");
  } else {
    fail(`1.70 governance convergence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-governance-convergence.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "GOVERNANCE_CONVERGENCE_REPORT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.70.1"
        && parsed.humanSummary?.intentosOperatingMode === "ACTIVE"
        && parsed.humanSummary?.canCodexWriteNow === "No"
        && parsed.humanSummary?.convergenceAuthority === "DERIVED_READ_ONLY"
        && parsed.boundaries?.writes_target_files === "No"
        && parsed.structuredEvidence?.artifact_type === "governance_convergence_report"
        && parsed.structuredEvidence?.boundary?.maximizes_migration === "No"
        && hasCompleteGovernanceConvergenceEvidence(parsed)) {
        pass("1.70 governance convergence resolver JSON includes safe authority fields");
      } else {
        fail(`1.70 governance convergence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.70 governance convergence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.70 governance convergence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-governance-convergence.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Governance Convergence check passed")) {
    pass("1.70 governance convergence checker passes source repo");
  } else {
    fail(`1.70 governance convergence checker failed: ${source.stderr || source.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "governance-convergence-report-"));
  const explicitReportPath = path.join(explicitReportDir, "generated.md");
  fs.writeFileSync(explicitReportPath, resolver.stdout);
  const explicitReport = runNode([
    "scripts/check-governance-convergence.mjs",
    ".",
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (explicitReport.status === 0 && explicitReport.stdout.includes("Governance Convergence check passed")) {
    pass("1.70 governance convergence checker validates generated explicit report");
  } else {
    fail(`1.70 governance convergence explicit report check failed: ${explicitReport.stderr || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "convergence", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Governance Convergence Report")) {
    pass("CLI convergence delegates to governance convergence resolver");
  } else {
    fail(`CLI convergence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "convergence-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Governance Convergence check passed")) {
    pass("CLI convergence-check delegates to governance convergence checker");
  } else {
    fail(`CLI convergence-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const target of [
    "examples/1.70-existing-project-governance-convergence/governed-web-admin",
    "examples/1.70-existing-project-governance-convergence/production-multiplatform",
    "examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked",
  ]) {
    const example = runNode(["scripts/check-governance-convergence.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0) pass(`1.70 governance convergence example passes strict checker ${target}`);
    else fail(`1.70 governance convergence example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-governance-convergence.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.70 governance convergence rejects ${target}`);
    else fail(`1.70 governance convergence must reject ${target}`);
  }
}

function hasCompleteGovernanceConvergenceEvidence(parsed) {
  const requiredDimensions = [
    "workflow",
    "baseline",
    "audit",
    "release",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs",
    "risk_authority",
  ];
  const dimensions = parsed.structuredEvidence?.dimensions;
  const dimensionNames = new Set(Array.isArray(dimensions) ? dimensions.map((dimension) => dimension.dimension) : []);
  const hasAllDimensions = requiredDimensions.every((dimension) => dimensionNames.has(dimension));
  const sourceSystems = parsed.structuredEvidence?.source_systems || {};
  const requiredSources = [
    "workflow_next",
    "native_migration",
    "existing_rule_reconciliation",
    "release_plan",
  ];
  const hasAllSources = requiredSources.every((source) => {
    const evidence = sourceSystems[source];
    return evidence
      && typeof evidence.status === "string"
      && typeof evidence.ref === "string"
      && typeof evidence.contribution === "string";
  });
  const blocked = Array.isArray(parsed.structuredEvidence?.blocked) ? parsed.structuredEvidence.blocked : [];
  const sourceStatuses = requiredSources.map((source) => sourceSystems[source]?.status);
  const needsUpstreamBlock = sourceStatuses.some((status) => status === "BLOCKED" || status === "NEEDS_INPUT");
  const recordsUpstreamBlock = blocked.some((reason) => reason.includes("upstream source requires input"));
  return hasAllDimensions && hasAllSources && (!needsUpstreamBlock || recordsUpstreamBlock);
}

function checkAdoptionExecutionAssuranceProtocol() {
  const badFixtures = [
    "bad-adoption-assurance-full-without-simulation",
    "bad-adoption-assurance-missing-rule-coverage",
    "bad-adoption-assurance-unresolved-evidence",
    "bad-adoption-assurance-authorizes-write",
    "bad-adoption-assurance-claims-production-approval",
    "bad-adoption-assurance-mutates-ci-hooks",
    "bad-adoption-assurance-replaces-release-sop",
    "bad-adoption-assurance-stale-diff",
    "bad-adoption-assurance-ai-log-spam",
    "bad-adoption-assurance-empty-na-reason",
    "bad-adoption-assurance-verified-production-approved",
    "bad-adoption-assurance-summary-json-state-mismatch",
    "bad-adoption-assurance-surface-table-json-mismatch",
    "bad-adoption-assurance-source-blocked-verified",
    "bad-adoption-assurance-gitkeep-apply-chain-verified",
    "bad-adoption-assurance-simulation-missing-exit-code",
    "bad-adoption-assurance-simulation-target-diff-changed",
    "bad-adoption-assurance-unresolved-generated-evidence",
    "bad-adoption-assurance-unknown-evidence-prefix",
    "bad-adoption-assurance-surface-evidence-not-in-evidence-refs",
  ];
  const required = [
    "docs/plans/adoption-execution-assurance-1.71-plan.md",
    "core/adoption-execution-assurance.md",
    "docs/adoption-execution-assurance.md",
    "templates/adoption-assurance-report.md",
    "schemas/artifacts/adoption-assurance.schema.json",
    "checklists/adoption-assurance-review.md",
    "prompts/adoption-assurance-agent.md",
    "adoption-assurance-reports/.gitkeep",
    "scripts/resolve-adoption-assurance.mjs",
    "scripts/check-adoption-assurance.mjs",
    "examples/1.71-adoption-execution-assurance/README.md",
    "examples/1.71-adoption-execution-assurance/verified-existing-project/adoption-assurance-reports/001-verified.md",
    "examples/1.71-adoption-execution-assurance/partial-existing-project/adoption-assurance-reports/001-partial.md",
    "examples/1.71-adoption-execution-assurance/blocked-production-project/adoption-assurance-reports/001-blocked.md",
    "examples/1.71-adoption-execution-assurance/failed-assurance/adoption-assurance-reports/001-failed.md",
    "releases/1.71.0/release-record.md",
    "releases/1.71.0/known-limitations.md",
    "releases/1.71.0/self-check-report.md",
    "releases/1.71.1/release-record.md",
    "releases/1.71.1/known-limitations.md",
    "releases/1.71.1/self-check-report.md",
    "releases/1.71.2/release-record.md",
    "releases/1.71.2/known-limitations.md",
    "releases/1.71.2/self-check-report.md",
    "releases/1.71.3/release-record.md",
    "releases/1.71.3/known-limitations.md",
    "releases/1.71.3/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/adoption-assurance-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.71 adoption assurance asset exists ${file}`);
    else fail(`1.71 adoption assurance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/adoption-execution-assurance-1.71-plan.md"),
    read("core/adoption-execution-assurance.md"),
    read("docs/adoption-execution-assurance.md"),
    read("templates/adoption-assurance-report.md"),
    read("schemas/artifacts/adoption-assurance.schema.json"),
    read("scripts/resolve-adoption-assurance.mjs"),
    read("scripts/check-adoption-assurance.mjs"),
    read("releases/1.71.3/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Adoption Execution Assurance",
    "Adoption Assurance Report",
    "adoption_assurance_report",
    "VERIFIED_ACTIVE",
    "PARTIAL_ADOPTION",
    "BLOCKED_BY_PROJECT_AUTHORITY",
    "BLOCKED_BY_UPSTREAM_EVIDENCE",
    "SIMULATION_PASSED",
    "PRESENT_UNVERIFIED",
    "source_systems",
    "steps",
    "exit_code",
    "output_digest",
    "target_diff_status",
    "UNCHANGED",
    "unknown evidence ref prefix",
    "surface ${surface.surface || \"<unknown>\"} evidence is listed in evidence_refs",
    "--out requires a relative report path",
    "read-only simulated task",
    "does not write target files",
    "does not approve release or production",
    "does not replace project-owned release SOP",
    "can_claim_full_adoption",
    "can_codex_write_now",
    "workflow_entry",
    "ai_rules_agents",
    "engineering_baseline",
    "environment_baseline",
    "release_rollback",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs_audit",
    "risk_authority",
    "apply_chain",
    "simulation_task",
  ]) {
    if (combined.includes(marker)) pass(`1.71 adoption assurance includes ${marker}`);
    else fail(`1.71 adoption assurance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-adoption-assurance.mjs",
    "node --check scripts/check-adoption-assurance.mjs",
    "node scripts/cli.mjs adoption-assurance .",
    "node scripts/cli.mjs adoption-assurance-check .",
    "node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.71 package verify surface includes ${marker}`);
    else fail(`1.71 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-adoption-assurance.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Adoption Assurance Report")
    && resolver.stdout.includes("read-only evidence-bound verification view")
    && resolver.stdout.includes("## Adoption Surface Coverage")
    && resolver.stdout.includes("## Simulation Task Result")) {
    pass("1.71 adoption assurance resolver prints safe report");
  } else {
    fail(`1.71 adoption assurance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-adoption-assurance.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "ADOPTION_ASSURANCE_REPORT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.71.3"
        && parsed.humanSummary?.canCodexWriteNow === "No"
        && parsed.structuredEvidence?.artifact_type === "adoption_assurance_report"
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && hasCompleteAdoptionAssuranceEvidence(parsed)) {
        pass("1.71 adoption assurance resolver JSON includes safe evidence fields");
      } else {
        fail(`1.71 adoption assurance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.71 adoption assurance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.71 adoption assurance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-adoption-assurance.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Adoption Assurance check passed")) {
    pass("1.71 adoption assurance checker passes source repo");
  } else {
    fail(`1.71 adoption assurance checker failed: ${source.stderr || source.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "adoption-assurance-target-"));
  const generatedReport = runNode([
    "scripts/resolve-adoption-assurance.mjs",
    explicitReportDir,
    "--out",
    "adoption-assurance-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "adoption-assurance-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-adoption-assurance.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status === 0
    && explicitReport.stdout.includes("Adoption Assurance check passed")) {
    pass("1.71 adoption assurance --out report is generated and checked as the same file");
  } else {
    fail(`1.71 adoption assurance --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adoption-assurance", "."]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Adoption Assurance Report")) {
    pass("CLI adoption-assurance delegates to resolver");
  } else {
    fail(`CLI adoption-assurance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adoption-assurance-check", "."]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Adoption Assurance check passed")) {
    pass("CLI adoption-assurance-check delegates to checker");
  } else {
    fail(`CLI adoption-assurance-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const [target, extraFlags] of [
    ["examples/1.71-adoption-execution-assurance/verified-existing-project", ["--require-simulation"]],
    ["examples/1.71-adoption-execution-assurance/partial-existing-project", []],
    ["examples/1.71-adoption-execution-assurance/blocked-production-project", []],
    ["examples/1.71-adoption-execution-assurance/failed-assurance", []],
  ]) {
    const example = runNode(["scripts/check-adoption-assurance.mjs", target, "--require-structured-evidence", ...extraFlags]);
    if (example.status === 0) pass(`1.71 adoption assurance example passes strict checker ${target}`);
    else fail(`1.71 adoption assurance example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-adoption-assurance.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.71 adoption assurance rejects ${target}`);
    else fail(`1.71 adoption assurance must reject ${target}`);
  }
}

function hasCompleteAdoptionAssuranceEvidence(parsed) {
  const requiredSurfaces = [
    "workflow_entry",
    "ai_rules_agents",
    "engineering_baseline",
    "environment_baseline",
    "release_rollback",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs_audit",
    "risk_authority",
    "apply_chain",
    "simulation_task",
  ];
  const surfaces = parsed.structuredEvidence?.surfaces;
  const surfaceNames = new Set(Array.isArray(surfaces) ? surfaces.map((surface) => surface.surface) : []);
  const hasAllSurfaces = requiredSurfaces.every((surface) => surfaceNames.has(surface));
  const simulation = parsed.structuredEvidence?.simulation || {};
  const simulationSteps = Array.isArray(simulation.steps) ? simulation.steps : [];
  const sourceSystems = parsed.structuredEvidence?.source_systems || {};
  const boundary = parsed.structuredEvidence?.boundary || {};
  return hasAllSurfaces
    && typeof simulation.state === "string"
    && simulationSteps.length > 0
    && simulationSteps.every((step) => Object.prototype.hasOwnProperty.call(step, "exit_code")
      && step.read_only === "Yes"
      && step.writes_target_files === "No"
      && typeof step.target_diff_status === "string"
      && typeof step.output_digest === "string")
    && (simulation.state !== "SIMULATION_PASSED" || simulationSteps.every((step) => step.exit_code === 0 && step.target_diff_status === "UNCHANGED"))
    && Object.keys(sourceSystems).length > 0
    && boundary.writes_target_files === "No"
    && boundary.approves_release_or_production === "No"
    && boundary.replaces_release_sop === "No";
}

function checkExistingProjectAdoptionAutopilotProtocol() {
  const badFixtures = [
    "bad-adoption-autopilot-technical-user-burden",
    "bad-adoption-autopilot-claims-full-adoption",
    "bad-adoption-autopilot-writes-performed",
    "bad-adoption-autopilot-authority-changed",
  ];
  const required = [
    "docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md",
    "core/existing-project-safe-adoption-autopilot.md",
    "docs/existing-project-safe-adoption-autopilot.md",
    "templates/existing-project-adoption-autopilot-report.md",
    "schemas/artifacts/existing-project-adoption-autopilot.schema.json",
    "checklists/existing-project-adoption-autopilot-review.md",
    "prompts/existing-project-adoption-autopilot-agent.md",
    "adoption-autopilot-reports/.gitkeep",
    "scripts/resolve-existing-project-adoption-autopilot.mjs",
    "scripts/check-existing-project-adoption-autopilot.mjs",
    "examples/1.81-existing-project-adoption-autopilot/governed-readonly/adoption-autopilot-reports/001-adoption.md",
    "examples/1.81-existing-project-adoption-autopilot/light-existing/adoption-autopilot-reports/001-adoption.md",
    "examples/1.81-existing-project-adoption-autopilot/dirty-blocked/adoption-autopilot-reports/001-adoption.md",
    "docs/plans/public-entry-adoption-integration-1.81.2-plan.md",
    "docs/plans/adoption-autopilot-plain-language-reference-1.81.3-plan.md",
    "releases/1.81.0/release-record.md",
    "releases/1.81.0/known-limitations.md",
    "releases/1.81.0/self-check-report.md",
    "releases/1.81.2/release-record.md",
    "releases/1.81.2/known-limitations.md",
    "releases/1.81.2/self-check-report.md",
    "releases/1.81.3/release-record.md",
    "releases/1.81.3/known-limitations.md",
    "releases/1.81.3/self-check-report.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/adoption-autopilot-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.81 adoption autopilot asset exists ${file}`);
    else fail(`1.81 adoption autopilot asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md"),
    read("core/existing-project-safe-adoption-autopilot.md"),
    read("docs/existing-project-safe-adoption-autopilot.md"),
    read("templates/existing-project-adoption-autopilot-report.md"),
    read("schemas/artifacts/existing-project-adoption-autopilot.schema.json"),
    read("scripts/resolve-existing-project-adoption-autopilot.mjs"),
    read("scripts/check-existing-project-adoption-autopilot.mjs"),
    read("docs/start-here.md"),
    read("docs/for-existing-projects.md"),
    read("docs/reference/scripts.md"),
    read("docs/plans/public-entry-adoption-integration-1.81.2-plan.md"),
    read("docs/plans/adoption-autopilot-plain-language-reference-1.81.3-plan.md"),
    read("releases/1.81.0/release-record.md"),
    read("releases/1.81.2/release-record.md"),
    read("releases/1.81.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Existing Project Safe Adoption Autopilot",
    "Adoption Autopilot Plain-Language",
    "Public Entry Adoption Integration",
    "existing_project_adoption_autopilot",
    "AVAILABLE_FOR_SAFE_USE",
    "S0_READ_ONLY_ONLY",
    "project_authority_changed",
    "native_assets_installed",
    "full_adoption_claim",
    "adopt",
    "adopt-check",
    "does not write target-project files",
    "does not claim full adoption",
    "Technical Trace",
    "read-only orientation only",
    "safe adoption entry",
    "Maintainers may use `adopt`",
    "node scripts/cli.mjs adopt <existing-project> --intent",
    "node scripts/cli.mjs adopt-check <project>",
    "plain-language adoption state",
  ]) {
    if (combined.includes(marker)) pass(`1.81 adoption autopilot includes ${marker}`);
    else fail(`1.81 adoption autopilot missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-existing-project-adoption-autopilot.mjs",
    "node --check scripts/check-existing-project-adoption-autopilot.mjs",
    "node scripts/cli.mjs adopt . --intent",
    "node scripts/cli.mjs adopt-check . --allow-empty",
    "node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.81 package verify surface includes ${marker}`);
    else fail(`1.81 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-existing-project-adoption-autopilot.mjs", ".", "--intent", "connect existing project"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Existing Project Adoption Autopilot Report")
    && resolver.stdout.includes("This report is a read-only adoption view")
    && resolver.stdout.includes("## Human Summary")
    && resolver.stdout.includes("## Technical Trace")) {
    pass("1.81 adoption autopilot resolver prints read-only result card");
  } else {
    fail(`1.81 adoption autopilot resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverHumanSummary = sectionBody(resolver.stdout, "Human Summary", { fallback: "" }) || "";
  const rawSummaryEnums = [
    "SAFE_READ_ONLY_ADOPTION_COMPLETE",
    "READY_FOR_RULE_ENTRY_REVIEW",
    "BLOCKED_BY_PROJECT_AUTHORITY",
    "BLOCKED_BY_UNSAFE_PROJECT_STATE",
    "BLOCKED_BY_PROJECT_NOT_FOUND",
    "FAILED_INVALID_EVIDENCE",
    "AVAILABLE_FOR_SAFE_USE",
    "READ_ONLY_DIAGNOSIS_ONLY",
    "NOT_AVAILABLE",
  ];
  const exposesRawSummaryEnum = rawSummaryEnums.some((marker) => resolverHumanSummary.includes(marker));
  if (resolver.status === 0
    && resolverHumanSummary.includes("Current state")
    && resolverHumanSummary.includes("IntentOS working mode")
    && /The project can|The project has authority rules|The project has an unsafe current state|The target project path was not found|The evidence is invalid or incomplete/.test(stripMarkdown(resolverHumanSummary))
    && /Available as a read-only working method|Read-only diagnosis only|Not available until/.test(stripMarkdown(resolverHumanSummary))
    && !exposesRawSummaryEnum
    && resolver.stdout.includes('"adoption_state"')
    && resolver.stdout.includes('"intentos_working_mode"')) {
    pass("1.81.3 adoption autopilot Human Summary uses plain language while JSON keeps technical state");
  } else {
    fail(`1.81.3 adoption autopilot Human Summary plain-language regression failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-existing-project-adoption-autopilot.mjs", ".", "--json", "--intent", "connect existing project"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXISTING_PROJECT_ADOPTION_AUTOPILOT"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.81.0"
        && parsed.structuredEvidence?.artifact_type === "existing_project_adoption_autopilot"
        && parsed.structuredEvidence?.project_authority_changed === "No"
        && parsed.structuredEvidence?.native_assets_installed === "No"
        && parsed.structuredEvidence?.full_adoption_claim === "No"
        && parsed.structuredEvidence?.writes_performed === "No"
        && parsed.structuredEvidence?.runtime_changes_performed === "No") {
        pass("1.81 adoption autopilot resolver JSON includes safe evidence fields");
      } else {
        fail(`1.81 adoption autopilot resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.81 adoption autopilot resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.81 adoption autopilot resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("1.81 adoption autopilot checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.81 adoption autopilot checker failed source repo: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "adoption-autopilot-target-"));
  const generatedReport = runNode([
    "scripts/resolve-existing-project-adoption-autopilot.mjs",
    explicitReportDir,
    "--out",
    "adoption-autopilot-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "adoption-autopilot-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-existing-project-adoption-autopilot.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status === 0
    && explicitReport.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("1.81 adoption autopilot --out report is generated and checked as the same file");
  } else {
    fail(`1.81 adoption autopilot --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adopt", ".", "--intent", "connect existing project"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Existing Project Adoption Autopilot Report")) {
    pass("CLI adopt delegates to adoption autopilot resolver");
  } else {
    fail(`CLI adopt failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adopt-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Existing Project Adoption Autopilot check passed")) {
    pass("CLI adopt-check delegates to adoption autopilot checker");
  } else {
    fail(`CLI adopt-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const target of [
    "examples/1.81-existing-project-adoption-autopilot/governed-readonly",
    "examples/1.81-existing-project-adoption-autopilot/light-existing",
    "examples/1.81-existing-project-adoption-autopilot/dirty-blocked",
  ]) {
    const example = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0) pass(`1.81 adoption autopilot example passes strict checker ${target}`);
    else fail(`1.81 adoption autopilot example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-existing-project-adoption-autopilot.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.81 adoption autopilot rejects ${target}`);
    else fail(`1.81 adoption autopilot must reject ${target}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("Primary entry commands:")
    && cliHelp.stdout.includes("adopt")
    && cliHelp.stdout.includes("Read-only project orientation")
    && cliHelp.stdout.includes("Enter read-only existing-project safe adoption autopilot")) {
    pass("1.81.2 advanced entry reference preserves start/adopt distinction");
  } else {
    fail(`1.81.2 advanced entry reference missing start/adopt distinction: ${cliHelp.stderr || cliHelp.stdout}`);
  }

  const startHuman = runNode(["scripts/cli.mjs", "start", "."]);
  const forbiddenStartPhrases = [
    "Apply reviewed init plan",
    "--apply-plan adoption-plan.json",
    "init-project.mjs --apply-plan",
    "Write adoption plan",
    "Write init plan",
  ];
  const hasForbiddenStartPhrase = forbiddenStartPhrases.some((phrase) => startHuman.stdout.includes(phrase));
  if (startHuman.status === 0
    && startHuman.stdout.includes("## Public Entry Boundary")
    && startHuman.stdout.includes("`start` only reads and classifies the target")
    && startHuman.stdout.includes("Use `adopt <project> --intent")
    && !hasForbiddenStartPhrase) {
    pass("1.81.2 start output stays read-only and does not recommend direct apply actions");
  } else {
    fail(`1.81.2 start output boundary failed: ${startHuman.stderr || startHuman.stdout}`);
  }

  const startJson = runNode(["scripts/cli.mjs", "start", ".", "--json"]);
  if (startJson.status === 0) {
    try {
      const parsed = JSON.parse(startJson.stdout);
      if (parsed.startIsReadOnlyByDefault === true
        && parsed.publicEntryBoundary?.writesTargetProjectFiles === "No"
        && parsed.publicEntryBoundary?.startsAdoptionAutopilot === "No"
        && parsed.publicEntryBoundary?.appliesWorkflowAssets === "No"
        && String(parsed.publicEntryBoundary?.adopt || "").includes("existing-project safe adoption entry")) {
        pass("1.81.2 start JSON records public entry boundary");
      } else {
        fail(`1.81.2 start JSON missing public entry boundary: ${startJson.stdout}`);
      }
    } catch (error) {
      fail(`1.81.2 start JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.81.2 start JSON failed: ${startJson.stderr || startJson.stdout}`);
  }
}

function checkControlledNativeAdoptionReviewProtocol() {
  const examples = [
    "strong-governed-stay-partial",
    "weak-governance-repair",
    "messy-production-repair-only",
    "light-plan-only",
  ];
  const badFixtures = [
    "bad-controlled-native-adoption-review-dirty-plan-only",
    "bad-controlled-native-adoption-review-unknown-owner-repair",
    "bad-controlled-native-adoption-review-messy-selected-plan",
    "bad-controlled-native-adoption-review-maturity-depth-drift",
  ];
  const required = [
    "docs/plans/controlled-native-adoption-autopilot-review-1.82-plan.md",
    "core/controlled-native-adoption-autopilot-review.md",
    "docs/controlled-native-adoption-autopilot-review.md",
    "templates/controlled-native-adoption-review-report.md",
    "schemas/artifacts/controlled-native-adoption-review.schema.json",
    "checklists/controlled-native-adoption-review.md",
    "prompts/controlled-native-adoption-review-agent.md",
    "native-adoption-review-reports/.gitkeep",
    "scripts/resolve-controlled-native-adoption-review.mjs",
    "scripts/check-controlled-native-adoption-review.mjs",
    "examples/1.82-controlled-native-adoption-review/README.md",
    ...examples.map((example) => `examples/1.82-controlled-native-adoption-review/${example}/native-adoption-review-reports/001-review.md`),
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/native-adoption-review-reports/001-bad.md`),
    "releases/1.82.0/release-record.md",
    "releases/1.82.0/known-limitations.md",
    "releases/1.82.0/self-check-report.md",
    "releases/1.82.1/release-record.md",
    "releases/1.82.1/known-limitations.md",
    "releases/1.82.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.82 controlled native adoption review asset exists ${file}`);
    else fail(`1.82 controlled native adoption review asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/controlled-native-adoption-autopilot-review-1.82-plan.md"),
    read("core/controlled-native-adoption-autopilot-review.md"),
    read("docs/controlled-native-adoption-autopilot-review.md"),
    read("templates/controlled-native-adoption-review-report.md"),
    read("schemas/artifacts/controlled-native-adoption-review.schema.json"),
    read("checklists/controlled-native-adoption-review.md"),
    read("prompts/controlled-native-adoption-review-agent.md"),
    read("scripts/resolve-controlled-native-adoption-review.mjs"),
    read("scripts/check-controlled-native-adoption-review.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("docs/reference/scripts.md"),
    read("releases/1.82.0/release-record.md"),
    read("releases/1.82.1/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Controlled Native Adoption Review",
    "controlled_native_adoption_review",
    "adopt-review",
    "adopt-review-check",
    "review-only",
    "does not write target-project files",
    "source evidence",
    "derived_view",
    "source_outcome",
    "current_project_match",
    "blocker_class",
    "maturity adoption depth matches recommendation class",
    "native_apply_allowed",
    "STRONG_GOVERNED_PROJECT",
    "WEAK_GOVERNANCE_PROJECT",
    "MESSY_PRODUCTION_PROJECT",
    "LIGHT_LOW_RISK_PROJECT",
    "RECOMMEND_STAY_PARTIAL",
    "RECOMMEND_GOVERNANCE_REPAIR",
    "READY_FOR_SELECTED_NATIVE_PLAN_ONLY",
    "BLOCKED_BY_UNSAFE_PROJECT_STATE",
    "full_adoption_claim",
  ]) {
    if (combined.includes(marker)) pass(`1.82 controlled native adoption review includes ${marker}`);
    else fail(`1.82 controlled native adoption review missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-controlled-native-adoption-review.mjs",
    "node --check scripts/check-controlled-native-adoption-review.mjs",
    "node scripts/cli.mjs adopt-review . --intent",
    "node scripts/cli.mjs adopt-review-check . --allow-empty",
    "node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/strong-governed-stay-partial --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.82 package verify surface includes ${marker}`);
    else fail(`1.82 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-controlled-native-adoption-review.mjs", ".", "--intent", "review deeper IntentOS adoption"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Controlled Native Adoption Review Report")
    && resolver.stdout.includes("read-only maturity and adoption-depth recommendation")
    && resolver.stdout.includes("Native apply allowed")
    && resolver.stdout.includes("Full adoption claim")) {
    pass("1.82 controlled native adoption review resolver prints read-only result card");
  } else {
    fail(`1.82 controlled native adoption review resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-controlled-native-adoption-review.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Controlled Native Adoption Review check passed")) {
    pass("1.82 controlled native adoption review checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.82 controlled native adoption review source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "adopt-review", ".", "--intent", "review deeper IntentOS adoption"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Controlled Native Adoption Review Report")) {
    pass("CLI adopt-review delegates to controlled native adoption review resolver");
  } else {
    fail(`CLI adopt-review failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "adopt-review-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Controlled Native Adoption Review check passed")) {
    pass("CLI adopt-review-check delegates to controlled native adoption review checker");
  } else {
    fail(`CLI adopt-review-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.82-controlled-native-adoption-review/${example}`;
    const result = runNode(["scripts/check-controlled-native-adoption-review.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.82 controlled native adoption review example passes strict checker ${target}`);
    else fail(`1.82 controlled native adoption review example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-controlled-native-adoption-review.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.82 controlled native adoption review rejects ${fixture}`);
    else fail(`1.82 controlled native adoption review must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("adopt-review")
    && cliHelp.stdout.includes("Review whether an existing project should stay partial")) {
    pass("1.82 CLI help exposes adopt-review as primary entry");
  } else {
    fail(`1.82 CLI help missing adopt-review: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}

function checkTaskGovernanceProtocol() {
  const examples = [
    "low-copy-change",
    "medium-list-filter",
    "medium-frontend-interaction",
    "review-required-step-policy",
    "db-api-ui-change",
    "last-step-settlement",
    "permission-sensitive-workflow",
    "possible-high-downgraded",
    "project-native-rfc-mapping",
    "project-native-qa-checklist-mapping",
  ];
  const badFixtures = [
    "bad-task-governance-low-hidden-api-change",
    "bad-task-governance-low-no-reason",
    "bad-task-governance-medium-no-short-plan",
    "bad-task-governance-medium-hidden-permission-impact",
    "bad-task-governance-possible-high-no-clarification",
    "bad-task-governance-no-business-rule-closure",
    "bad-task-governance-no-change-impact-coverage",
    "bad-task-governance-no-execution-plan",
    "bad-task-governance-no-verification-plan",
    "bad-task-governance-closeout-without-evidence",
    "bad-task-governance-authorizes-implementation",
    "bad-task-governance-ignores-1.82-blocker",
    "bad-task-governance-technical-user-prompt",
    "bad-task-governance-stronger-rule-not-preserved",
    "bad-task-governance-project-native-digest-mismatch",
    "bad-task-governance-low-wrong-review-policy",
    "bad-task-governance-low-hidden-intent-api",
  ];
  const required = [
    "docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md",
    "core/behavior-complete-existing-project-adoption.md",
    "docs/behavior-complete-existing-project-adoption.md",
    "templates/task-governance-report.md",
    "schemas/artifacts/task-governance.schema.json",
    "checklists/task-governance-review.md",
    "prompts/task-governance-agent.md",
    "task-governance-reports/.gitkeep",
    "scripts/resolve-task-governance.mjs",
    "scripts/check-task-governance.mjs",
    "examples/1.83-task-governance/README.md",
    ...examples.map((example) => `examples/1.83-task-governance/${example}/task-governance-reports/001-task-governance.md`),
    "examples/1.83-task-governance/project-native-rfc-mapping/docs/rfc-approval-review-workflow.md",
    "examples/1.83-task-governance/project-native-qa-checklist-mapping/docs/qa-permission-approval-checklist.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/task-governance-reports/001-bad.md`),
    "releases/1.83.0/release-record.md",
    "releases/1.83.0/known-limitations.md",
    "releases/1.83.0/self-check-report.md",
    "releases/1.83.1/release-record.md",
    "releases/1.83.1/known-limitations.md",
    "releases/1.83.1/self-check-report.md",
    "releases/1.83.2/release-record.md",
    "releases/1.83.2/known-limitations.md",
    "releases/1.83.2/self-check-report.md",
    "releases/1.83.3/release-record.md",
    "releases/1.83.3/known-limitations.md",
    "releases/1.83.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.83 task governance asset exists ${file}`);
    else fail(`1.83 task governance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md"),
    read("core/behavior-complete-existing-project-adoption.md"),
    read("docs/behavior-complete-existing-project-adoption.md"),
    read("templates/task-governance-report.md"),
    read("schemas/artifacts/task-governance.schema.json"),
    read("checklists/task-governance-review.md"),
    read("prompts/task-governance-agent.md"),
    read("scripts/resolve-task-governance.mjs"),
    read("scripts/check-task-governance.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.83.0/release-record.md"),
    read("releases/1.83.1/release-record.md"),
    read("releases/1.83.2/release-record.md"),
    read("releases/1.83.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Behavior-Complete Existing Project Adoption",
    "task_governance",
    "task-governance",
    "task-governance-check",
    "LOW",
    "MEDIUM",
    "POSSIBLE_HIGH",
    "HIGH",
    "required_before_implementation_review",
    "required_before_completion_claim",
    "review_policy",
    "review_level",
    "minimal_verification_status",
    "targeted_verification_status",
    "plain_user_summary",
    "LIGHTWEIGHT",
    "TARGETED",
    "BLOCKING_CLARIFICATION",
    "FULL",
    "implementation_authorized_by_this_report",
    "project-native evidence",
    "project_native_evidence_digest",
    "project_native_evidence_owner",
    "project_native_task_match",
    "STRONGER",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.83 task governance includes ${marker}`);
    else fail(`1.83 task governance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-task-governance.mjs",
    "node --check scripts/check-task-governance.mjs",
    "node scripts/cli.mjs task-governance . --intent",
    "node scripts/cli.mjs task-governance-check . --allow-empty",
    "node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.83 package verify surface includes ${marker}`);
    else fail(`1.83 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-task-governance.mjs", ".", "--intent", "change approval review workflow state transition"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Task Governance Report")
    && resolver.stdout.includes("Task impact")
    && resolver.stdout.includes("Plain user summary")
    && resolver.stdout.includes("Minimal verification status")
    && resolver.stdout.includes("Implementation authorized by this report")
    && resolver.stdout.includes("No")) {
    pass("1.83 task governance resolver prints non-authorizing task card");
  } else {
    fail(`1.83 task governance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-task-governance.mjs", ".", "--intent", "update README copy", "--out", "/tmp/task-governance.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.83 task governance rejects absolute --out path");
  } else {
    fail("1.83 task governance must reject absolute --out path");
  }

  const sourceCheck = runNode(["scripts/check-task-governance.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("task governance check skipped by explicit --allow-empty")) {
    pass("1.83 task governance checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.83 task governance source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "task-governance", ".", "--intent", "change approval review workflow state transition"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Task Governance Report")) {
    pass("CLI task-governance delegates to resolver");
  } else {
    fail(`CLI task-governance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "task-governance-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("task governance check skipped by explicit --allow-empty")) {
    pass("CLI task-governance-check delegates to checker");
  } else {
    fail(`CLI task-governance-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.83-task-governance/${example}`;
    const result = runNode(["scripts/check-task-governance.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.83 task governance example passes strict checker ${target}`);
    else fail(`1.83 task governance example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-task-governance.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.83 task governance rejects ${fixture}`);
    else fail(`1.83 task governance must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("task-governance")
    && cliHelp.stdout.includes("Classify task impact")) {
    pass("1.83 CLI help exposes task-governance");
  } else {
    fail(`1.83 CLI help missing task-governance: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}

function checkWorkQueueTakeoverProtocol() {
  const examples = [
    "reliable-existing-system",
    "messy-todo-migration",
    "missing-task-system",
    "unsafe-dirty-project",
  ];
  const badFixtures = [
    "bad-work-queue-takeover-activates-all-todos",
    "bad-work-queue-takeover-multiple-current",
    "bad-work-queue-takeover-current-without-task-governance",
    "bad-work-queue-takeover-deletes-old-source",
    "bad-work-queue-takeover-claims-full-adoption",
    "bad-work-queue-takeover-backlog-executable",
    "bad-work-queue-takeover-stale-current",
    "bad-work-queue-takeover-approves-implementation",
  ];
  const required = [
    "docs/plans/work-queue-takeover-hardening-1.84.1-plan.md",
    "docs/plans/existing-project-work-queue-takeover-1.84-plan.md",
    "docs/plans/task-governance-consumer-integration-1.85-plan.md",
    "core/existing-project-work-queue-takeover.md",
    "docs/existing-project-work-queue-takeover.md",
    "templates/work-queue-takeover-report.md",
    "schemas/artifacts/work-queue-takeover.schema.json",
    "checklists/work-queue-takeover-review.md",
    "prompts/work-queue-takeover-agent.md",
    "work-queue-takeover-reports/.gitkeep",
    "scripts/resolve-work-queue-takeover.mjs",
    "scripts/check-work-queue-takeover.mjs",
    "examples/1.84-work-queue-takeover/README.md",
    ...examples.map((example) => `examples/1.84-work-queue-takeover/${example}/work-queue-takeover-reports/001-${reportNameForTakeoverExample(example)}.md`),
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/work-queue-takeover-reports/001-bad.md`),
    "releases/1.84.0/release-record.md",
    "releases/1.84.0/known-limitations.md",
    "releases/1.84.0/self-check-report.md",
    "releases/1.84.1/release-record.md",
    "releases/1.84.1/known-limitations.md",
    "releases/1.84.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.84 work queue takeover asset exists ${file}`);
    else fail(`1.84 work queue takeover asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/work-queue-takeover-hardening-1.84.1-plan.md"),
    read("docs/plans/existing-project-work-queue-takeover-1.84-plan.md"),
    read("core/existing-project-work-queue-takeover.md"),
    read("docs/existing-project-work-queue-takeover.md"),
    read("templates/work-queue-takeover-report.md"),
    read("schemas/artifacts/work-queue-takeover.schema.json"),
    read("checklists/work-queue-takeover-review.md"),
    read("prompts/work-queue-takeover-agent.md"),
    read("scripts/resolve-work-queue-takeover.mjs"),
    read("scripts/check-work-queue-takeover.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.84.0/release-record.md"),
    read("releases/1.84.1/release-record.md"),
    read("releases/1.84.1/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Existing Project Work Queue Takeover",
    "work_queue_takeover",
    "queue-takeover",
    "queue-takeover-check",
    "RELIABLE_EXISTING_TASK_SYSTEM",
    "MESSY_TASK_SYSTEM",
    "MISSING_TASK_SYSTEM",
    "UNSAFE_TO_TAKE_OVER",
    "MAP_EXISTING_TASK_SYSTEM",
    "ESTABLISH_INTENTOS_WORK_QUEUE",
    "BLOCK_TAKEOVER",
    "MIGRATE_CURRENT",
    "MIGRATE_BACKLOG",
    "ARCHIVE_SOURCE_ONLY",
    "source_digest",
    "source_item_digest",
    "task_governance_binding_status",
    "execution_review_eligible_after_task_governance",
    "takeover_review_ready",
    "can_execute_from_old_todo_directly",
    "task_governance_ref",
    "npm run verify:baseline",
    "npm run verify:industrial",
    "npm run verify:release",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`1.84 work queue takeover includes ${marker}`);
    else fail(`1.84 work queue takeover missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-work-queue-takeover.mjs",
    "node --check scripts/check-work-queue-takeover.mjs",
    "node scripts/cli.mjs queue-takeover . --intent",
    "node scripts/cli.mjs queue-takeover-check . --allow-empty",
    "node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.84 package verify surface includes ${marker}`);
    else fail(`1.84 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-work-queue-takeover.mjs", "examples/1.84-work-queue-takeover/messy-todo-migration", "--intent", "continue old project tasks"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Work Queue Takeover Report")
    && resolver.stdout.includes("MESSY_TASK_SYSTEM")
    && resolver.stdout.includes("Can Codex execute tasks from old TODO directly")
    && resolver.stdout.includes("No")
    && resolver.stdout.includes("This report approves implementation: No")) {
    pass("1.84 work queue takeover resolver prints non-authorizing takeover report");
  } else {
    fail(`1.84 work queue takeover resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-work-queue-takeover.mjs", ".", "--intent", "continue old project tasks", "--out", "/tmp/work-queue-takeover.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.84 work queue takeover rejects absolute --out path");
  } else {
    fail("1.84 work queue takeover must reject absolute --out path");
  }

  const sourceCheck = runNode(["scripts/check-work-queue-takeover.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("work queue takeover check skipped by explicit --allow-empty")) {
    pass("1.84 work queue takeover checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.84 work queue takeover source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "queue-takeover", "examples/1.84-work-queue-takeover/messy-todo-migration", "--intent", "continue old project tasks"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Work Queue Takeover Report")) {
    pass("CLI queue-takeover delegates to resolver");
  } else {
    fail(`CLI queue-takeover failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "queue-takeover-check", "examples/1.84-work-queue-takeover/messy-todo-migration", "--require-structured-evidence"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("Work queue takeover check passed")) {
    pass("CLI queue-takeover-check delegates to checker");
  } else {
    fail(`CLI queue-takeover-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.84-work-queue-takeover/${example}`;
    const result = runNode(["scripts/check-work-queue-takeover.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.84 work queue takeover example passes strict checker ${target}`);
    else fail(`1.84 work queue takeover example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-work-queue-takeover.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.84 work queue takeover rejects ${fixture}`);
    else fail(`1.84 work queue takeover must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("queue-takeover")
    && cliHelp.stdout.includes("old project's task records")) {
    pass("1.84 CLI help exposes queue-takeover");
  } else {
    fail(`1.84 CLI help missing queue-takeover: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}

function reportNameForTakeoverExample(example) {
  return {
    "reliable-existing-system": "reliable-existing-system",
    "messy-todo-migration": "messy-todo",
    "missing-task-system": "missing-task-system",
    "unsafe-dirty-project": "unsafe",
  }[example] || example;
}

function checkTaskGovernanceConsumerIntegrationProtocol() {
  const required = [
    "docs/plans/task-governance-consumer-integration-1.85-plan.md",
    "core/task-governance-consumer-integration.md",
    "docs/task-governance-consumer-integration.md",
    "scripts/lib/task-entry-binding.mjs",
    "examples/1.85-task-governance-consumer-integration/README.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/task-governance-reports/001-task-governance.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/work-queue-takeover-reports/001-current.md",
    "examples/1.85-task-governance-consumer-integration/high-workflow-rule/execution-assurance-reports/001-high-workflow-rule.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/task-governance-reports/001-task-governance.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/work-queue-takeover-reports/001-current.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/completion-evidence-reports/001-possible-high-blocked.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/closure-decisions/001-possible-high-blocked.md",
    "examples/1.85-task-governance-consumer-integration/possible-high-blocked/delivery-status-cards/001-possible-high-blocked.md",
    "test-fixtures/bad/bad-task-consumer-missing-task-entry/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-task-consumer-possible-high-done/closure-decisions/001-bad.md",
    "releases/1.85.0/release-record.md",
    "releases/1.85.0/known-limitations.md",
    "releases/1.85.0/self-check-report.md",
    "releases/1.85.1/release-record.md",
    "releases/1.85.1/known-limitations.md",
    "releases/1.85.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.85 task governance consumer asset exists ${file}`);
    else fail(`1.85 task governance consumer asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/task-governance-consumer-integration-1.85-plan.md"),
    read("core/task-governance-consumer-integration.md"),
    read("docs/task-governance-consumer-integration.md"),
    read("docs/execution-assurance-chain.md"),
    read("docs/completion-evidence-gate.md"),
    read("docs/unified-closure-model.md"),
    read("docs/user-delivery-console.md"),
    read("scripts/lib/task-entry-binding.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("scripts/check-user-delivery-console.mjs"),
    read("releases/1.85.0/release-record.md"),
    read("releases/1.85.1/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Task Governance Consumer Integration",
    "task_entry_binding",
    "Task Entry Binding",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
    "work_queue_item_ref",
    "work_queue_item_digest",
    "task_governance_ref",
    "task_governance_digest",
    "validateEvidenceBlock",
    "checkJointBinding",
    "resume_review_ref",
    "strict task consumer requires consumer task_ref",
    "referenced Work Queue report has valid structured evidence",
    "referenced Task Governance report has valid structured evidence",
    "POSSIBLE_HIGH",
    "plain user blocker",
    "does not authorize implementation",
    "does not approve release or production",
  ]) {
    if (combined.includes(marker)) pass(`1.85 task governance consumer includes ${marker}`);
    else fail(`1.85 task governance consumer missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/lib/task-entry-binding.mjs",
    "node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer",
    "node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --report completion-evidence-reports/001-possible-high-blocked.md --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer",
    "node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer",
    "node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.85 package verify surface includes ${marker}`);
    else fail(`1.85 package verify surface missing ${marker}`);
  }

  for (const [name, args] of [
    ["execution assurance high task consumer", ["scripts/check-execution-assurance.mjs", "examples/1.85-task-governance-consumer-integration/high-workflow-rule", "--require-structured-evidence", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
    ["completion evidence possible-high blocked consumer", ["scripts/check-completion-evidence.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--report", "completion-evidence-reports/001-possible-high-blocked.md", "--require-structured-evidence", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
    ["closure possible-high blocked consumer", ["scripts/check-closure-decision.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
    ["user delivery possible-high blocked consumer", ["scripts/check-user-delivery-console.mjs", "examples/1.85-task-governance-consumer-integration/possible-high-blocked", "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]],
  ]) {
    const result = runNode(args);
    if (result.status === 0) pass(`1.85 ${name} passes strict checker`);
    else fail(`1.85 ${name} failed: ${result.stderr || result.stdout}`);
  }

  for (const [name, target] of [
    ["missing task entry", "test-fixtures/bad/bad-task-consumer-missing-task-entry"],
    ["possible-high done claim", "test-fixtures/bad/bad-task-consumer-possible-high-done"],
  ]) {
    const result = runNode(["scripts/check-closure-decision.mjs", target, "--require-task-governance", "--require-work-queue", "--strict-task-consumer"]);
    if (result.status !== 0) pass(`1.85 task consumer rejects ${name}`);
    else fail(`1.85 task consumer must reject ${name}`);
  }
}

function checkRuntimeHygieneProtocol() {
  const examples = [
    "git-old-branch-rebase-plan",
    "pre-push-structure-gate",
    "ci-environment-retry",
    "release-artifact-quota-preflight",
    "release-bundle-evidence-bloat",
    "strict-task-entry",
  ];
  const badFixtures = [
    "bad-runtime-hygiene-force-push-without-approval",
    "bad-runtime-hygiene-bypasses-pre-push",
    "bad-runtime-hygiene-claims-done-after-gate-fail",
    "bad-runtime-hygiene-artifact-delete-without-approval",
    "bad-runtime-hygiene-deletes-release-evidence",
    "bad-runtime-hygiene-reuses-release-id-after-prod-touch",
    "bad-runtime-hygiene-unknown-production-side-effect-continues",
    "bad-runtime-hygiene-bundle-slimming-deletes-evidence",
    "bad-runtime-hygiene-technical-user-burden",
    "bad-runtime-hygiene-ci-auto-without-safety-proof",
  ];
  const required = [
    "docs/plans/execution-release-runtime-hygiene-1.86-plan.md",
    "core/execution-release-runtime-hygiene.md",
    "docs/execution-release-runtime-hygiene.md",
    "templates/runtime-hygiene-report.md",
    "schemas/artifacts/runtime-hygiene.schema.json",
    "checklists/runtime-hygiene-review.md",
    "prompts/runtime-hygiene-agent.md",
    "runtime-hygiene-reports/.gitkeep",
    "scripts/resolve-runtime-hygiene.mjs",
    "scripts/check-runtime-hygiene.mjs",
    "examples/1.86-runtime-hygiene/README.md",
    "examples/1.86-runtime-hygiene/git-old-branch-rebase-plan/runtime-hygiene-reports/001-git-old-branch.md",
    "examples/1.86-runtime-hygiene/pre-push-structure-gate/runtime-hygiene-reports/001-pre-push-structure-gate.md",
    "examples/1.86-runtime-hygiene/ci-environment-retry/runtime-hygiene-reports/001-ci-environment-retry.md",
    "examples/1.86-runtime-hygiene/release-artifact-quota-preflight/runtime-hygiene-reports/001-artifact-quota.md",
    "examples/1.86-runtime-hygiene/release-bundle-evidence-bloat/runtime-hygiene-reports/001-bundle-evidence-bloat.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/runtime-hygiene-reports/001-strict-task-entry.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/work-queue-takeover-reports/001-current.md",
    "examples/1.86-runtime-hygiene/strict-task-entry/task-governance-reports/001-task-governance.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/runtime-hygiene-reports/001-bad.md`),
    "releases/1.86.0/release-record.md",
    "releases/1.86.0/known-limitations.md",
    "releases/1.86.0/self-check-report.md",
    "releases/1.86.1/release-record.md",
    "releases/1.86.1/known-limitations.md",
    "releases/1.86.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.86 runtime hygiene asset exists ${file}`);
    else fail(`1.86 runtime hygiene asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-release-runtime-hygiene-1.86-plan.md"),
    read("core/execution-release-runtime-hygiene.md"),
    read("docs/execution-release-runtime-hygiene.md"),
    read("templates/runtime-hygiene-report.md"),
    read("schemas/artifacts/runtime-hygiene.schema.json"),
    read("checklists/runtime-hygiene-review.md"),
    read("prompts/runtime-hygiene-agent.md"),
    read("scripts/resolve-runtime-hygiene.mjs"),
    read("scripts/check-runtime-hygiene.mjs"),
    read("README.md"),
    read("README.zh-CN.md"),
    read("releases/1.86.0/release-record.md"),
    read("releases/1.86.0/known-limitations.md"),
    read("releases/1.86.0/self-check-report.md"),
    read("releases/1.86.1/release-record.md"),
    read("releases/1.86.1/known-limitations.md"),
    read("releases/1.86.1/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Execution And Release Runtime Hygiene",
    "runtime_hygiene",
    "runtime-hygiene",
    "runtime-hygiene-check",
    "GIT_LINEAGE_DIRTY",
    "COMMIT_SCOPE_MIXED",
    "PRE_PUSH_GATE_FAILED",
    "STRUCTURE_BUDGET_EXCEEDED",
    "CI_CODE_FAILURE",
    "CI_ENVIRONMENT_FAILURE",
    "RELEASE_PREFLIGHT_FAILED",
    "ARTIFACT_QUOTA_BLOCKED",
    "RELEASE_BUNDLE_OVERSIZED",
    "PRODUCTION_SIDE_EFFECT_UNKNOWN",
    "PRODUCTION_SIDE_EFFECT_PRESENT",
    "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR",
    "NEEDS_RELEASE_OWNER_APPROVAL",
    "NEEDS_PLAIN_USER_APPROVAL",
    "BLOCKED_BY_PRODUCTION_SIDE_EFFECT",
    "BLOCKED_BY_UNCLEAR_TASK_SCOPE",
    "runtime_hygiene_digest",
    "runtime_source_trace",
    "task_entry_binding",
    "retry_policy_allowed",
    "production_side_effect_checked",
    "strict-task-entry",
    "require-runtime-sources",
    "technical_terms_required",
    "approves commit or push: No",
    "approves release or production: No",
    "bypasses gates: No",
    "deletes artifacts: No",
    "force pushes: No",
    "does not approve commit",
  ]) {
    if (combined.includes(marker)) pass(`1.86 runtime hygiene includes ${marker}`);
    else fail(`1.86 runtime hygiene missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-runtime-hygiene.mjs",
    "node --check scripts/check-runtime-hygiene.mjs",
    "node scripts/cli.mjs runtime-hygiene . --intent",
    "node scripts/cli.mjs runtime-hygiene-check . --allow-empty",
    "node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/git-old-branch-rebase-plan --require-structured-evidence",
    "node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/strict-task-entry --require-structured-evidence --require-runtime-sources --strict-task-entry",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.86 package verify surface includes ${marker}`);
    else fail(`1.86 package verify surface missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-runtime-hygiene.mjs",
    "examples/1.86-runtime-hygiene/pre-push-structure-gate",
    "--intent",
    "pre-push structure budget gate failed",
    "--gate-output",
    "structure budget failed",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Runtime Hygiene Report")
    && resolver.stdout.includes("STRUCTURE_BUDGET_EXCEEDED")
    && resolver.stdout.includes("CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR")
    && resolver.stdout.includes("This report approves commit or push: No")
    && resolver.stdout.includes("This report bypasses gates: No")) {
    pass("1.86 runtime hygiene resolver prints non-authorizing gate report");
  } else {
    fail(`1.86 runtime hygiene resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const absoluteOut = runNode(["scripts/resolve-runtime-hygiene.mjs", ".", "--intent", "push current task", "--out", "/tmp/runtime-hygiene.md"]);
  if (absoluteOut.status !== 0 && (absoluteOut.stderr || absoluteOut.stdout).includes("--out must be a relative path")) {
    pass("1.86 runtime hygiene rejects absolute --out path");
  } else {
    fail("1.86 runtime hygiene must reject absolute --out path");
  }

  const sourceCheck = runNode(["scripts/check-runtime-hygiene.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("runtime hygiene check skipped by explicit --allow-empty")) {
    pass("1.86 runtime hygiene checker passes source repo with explicit allow-empty");
  } else {
    fail(`1.86 runtime hygiene source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "runtime-hygiene", ".", "--intent", "push current task"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Runtime Hygiene Report")) {
    pass("CLI runtime-hygiene delegates to resolver");
  } else {
    fail(`CLI runtime-hygiene failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliChecker = runNode(["scripts/cli.mjs", "runtime-hygiene-check", ".", "--allow-empty"]);
  if (cliChecker.status === 0 && cliChecker.stdout.includes("runtime hygiene check skipped by explicit --allow-empty")) {
    pass("CLI runtime-hygiene-check delegates to checker");
  } else {
    fail(`CLI runtime-hygiene-check failed: ${cliChecker.stderr || cliChecker.stdout}`);
  }

  for (const example of examples) {
    const target = `examples/1.86-runtime-hygiene/${example}`;
    const result = example === "strict-task-entry"
      ? runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence", "--require-runtime-sources", "--strict-task-entry"])
      : runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0) pass(`1.86 runtime hygiene example passes strict checker ${target}`);
    else fail(`1.86 runtime hygiene example failed ${target}: ${result.stderr || result.stdout}`);
  }

  for (const fixture of badFixtures) {
    const target = `test-fixtures/bad/${fixture}`;
    const result = runNode(["scripts/check-runtime-hygiene.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.86 runtime hygiene rejects ${fixture}`);
    else fail(`1.86 runtime hygiene must reject ${fixture}`);
  }

  const cliHelp = runNode(["scripts/cli.mjs", "--help-advanced"]);
  if (cliHelp.status === 0
    && cliHelp.stdout.includes("runtime-hygiene")
    && cliHelp.stdout.includes("Git, push, CI, artifact, bundle, or release-runtime blockers")) {
    pass("1.86 CLI help exposes runtime-hygiene");
  } else {
    fail(`1.86 CLI help missing runtime-hygiene: ${cliHelp.stderr || cliHelp.stdout}`);
  }
}

function checkExecutionAssuranceChainProtocol() {
  const badFixtures = [
    "bad-execution-assurance-no-completion-contract",
    "bad-execution-assurance-missing-actual-diff",
    "bad-execution-assurance-unresolved-evidence",
    "bad-execution-assurance-stale-evidence",
    "bad-execution-assurance-patch-smell-verified",
    "bad-execution-assurance-unexpected-ci-hook",
    "bad-execution-assurance-safe-patch-broad-diff",
    "bad-execution-assurance-controlled-patch-no-debt",
    "bad-execution-assurance-missing-review",
    "bad-execution-assurance-adoption-without-source",
    "bad-execution-assurance-release-overclaim",
    "bad-execution-assurance-source-task-mismatch",
    "bad-execution-assurance-planned-path-mismatch",
    "bad-execution-assurance-source-digest-mismatch",
    "bad-execution-assurance-declarative-precise-evidence",
    "bad-execution-assurance-unresolved-plan-ref",
    "bad-execution-assurance-markdown-json-plan-mismatch",
  ];
  const required = [
    "docs/plans/execution-assurance-log-markdown-consistency-1.74.3-plan.md",
    "docs/plans/execution-assurance-runtime-plan-ref-binding-1.74.2-plan.md",
    "docs/plans/execution-assurance-vocabulary-docs-sync-1.74.1-plan.md",
    "docs/plans/execution-assurance-strict-binding-1.74-plan.md",
    "docs/plans/execution-assurance-empty-report-hardening-1.72.1-plan.md",
    "docs/plans/execution-assurance-chain-1.72-plan.md",
    "core/execution-assurance-chain.md",
    "docs/execution-assurance-chain.md",
    "templates/execution-assurance-report.md",
    "schemas/artifacts/execution-assurance.schema.json",
    "checklists/execution-assurance-review.md",
    "prompts/execution-assurance-agent.md",
    "execution-assurance-reports/.gitkeep",
    "scripts/resolve-execution-assurance.mjs",
    "scripts/check-execution-assurance.mjs",
    "examples/1.72-execution-assurance-chain/README.md",
    "examples/1.72-execution-assurance-chain/feature-contract-validation/execution-assurance-reports/001-contract-validation.md",
    "examples/1.72-execution-assurance-chain/old-project-intentos-adoption/execution-assurance-reports/001-adoption.md",
    "examples/1.72-execution-assurance-chain/safe-copy-patch/execution-assurance-reports/001-copy.md",
    "examples/1.72-execution-assurance-chain/safe-copy-patch/tasks/001-copy.md",
    "examples/1.72-execution-assurance-chain/patch-smell-backend-only/execution-assurance-reports/001-backend-only.md",
    "releases/1.72.0/release-record.md",
    "releases/1.72.0/known-limitations.md",
    "releases/1.72.0/self-check-report.md",
    "releases/1.72.1/release-record.md",
    "releases/1.72.1/known-limitations.md",
    "releases/1.72.1/self-check-report.md",
    "releases/1.74.0/release-record.md",
    "releases/1.74.0/known-limitations.md",
    "releases/1.74.0/self-check-report.md",
    "releases/1.74.1/release-record.md",
    "releases/1.74.1/known-limitations.md",
    "releases/1.74.1/self-check-report.md",
    "releases/1.74.2/release-record.md",
    "releases/1.74.2/known-limitations.md",
    "releases/1.74.2/self-check-report.md",
    "releases/1.74.3/release-record.md",
    "releases/1.74.3/known-limitations.md",
    "releases/1.74.3/self-check-report.md",
    "test-fixtures/bad/bad-execution-assurance-unresolved-plan-ref/evidence/copy-smoke.txt",
    "test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch/evidence/copy-smoke.txt",
    "test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch/tasks/001-copy.md",
    ...badFixtures.map((fixture) => `test-fixtures/bad/${fixture}/execution-assurance-reports/001-bad.md`),
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.72-1.74 execution assurance asset exists ${file}`);
    else fail(`1.72-1.74 execution assurance asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-assurance-log-markdown-consistency-1.74.3-plan.md"),
    read("docs/plans/execution-assurance-empty-report-hardening-1.72.1-plan.md"),
    read("docs/plans/execution-assurance-chain-1.72-plan.md"),
    read("docs/plans/execution-assurance-strict-binding-1.74-plan.md"),
    read("docs/plans/execution-assurance-vocabulary-docs-sync-1.74.1-plan.md"),
    read("docs/plans/execution-assurance-runtime-plan-ref-binding-1.74.2-plan.md"),
    read("core/execution-assurance-chain.md"),
    read("docs/execution-assurance-chain.md"),
    read("templates/execution-assurance-report.md"),
    read("schemas/artifacts/execution-assurance.schema.json"),
    read("scripts/resolve-execution-assurance.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("releases/1.72.0/release-record.md"),
    read("releases/1.72.1/release-record.md"),
    read("releases/1.74.0/release-record.md"),
    read("releases/1.74.1/release-record.md"),
    read("releases/1.74.2/release-record.md"),
    read("releases/1.74.3/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Execution Assurance Chain",
    "Execution Assurance Report",
    "execution_assurance_report",
    "VERIFIED_DONE",
    "PARTIAL_DONE",
    "BLOCKED_BY_MISSING_EVIDENCE",
    "BLOCKED_BY_PATCH_SMELL",
    "NEEDS_HUMAN_DECISION",
    "FEATURE_IMPLEMENTATION",
    "ADOPTION_MIGRATION",
    "RELEASE_PREPARATION",
    "completion_contract",
    "planned_impact_map",
    "actual_diff",
    "evidence_bindings",
    "patch_assessment",
    "source_systems",
    "intent_digest",
    "source_system_ref",
    "source_task_ref",
    "current_task_match",
    "report_digest",
    "evidence_digest",
    "REQUIRES_EXPLICIT_EXECUTION_PLAN",
    "actual diff changed files are outside planned target paths",
    "No evidence chain, no verified completion",
    "no execution assurance reports found",
    "--allow-empty",
    "does not write target-project files",
    "does not approve commit or push",
    "does not approve release or production",
    "schema enum",
    "uppercase legacy identity tokens",
    "legacy source-kit identity drift",
    "execution_plan.plan_ref",
    "resolvable execution plan reference",
    "unresolved plan refs",
    "Execution Plan Binding Plan Ref",
    "Evidence Binding row count",
    "same-report generated-project smoke",
    "generated-project smoke",
  ]) {
    if (combined.includes(marker)) pass(`1.72-1.74 execution assurance includes ${marker}`);
    else fail(`1.72-1.74 execution assurance missing ${marker}`);
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, command]) => command)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-execution-assurance.mjs",
    "node --check scripts/check-execution-assurance.mjs",
    "node scripts/cli.mjs execution-assurance . --intent \"verify execution completion\"",
    "node scripts/cli.mjs execution-assurance-check . --allow-empty",
    "node scripts/cli.mjs done-check .",
    "node scripts/cli.mjs verify-execution .",
    "node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.72-1.74 package verify surface includes ${marker}`);
    else fail(`1.72-1.74 package verify surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-execution-assurance.mjs", ".", "--intent", "verify execution completion"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Execution Assurance Report")
    && resolver.stdout.includes("## Completion Contract")
    && resolver.stdout.includes("## Actual Diff Binding")
    && resolver.stdout.includes("## Patch Assessment")) {
    pass("1.72-1.74 execution assurance resolver prints safe report");
  } else {
    fail(`1.72-1.74 execution assurance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-assurance.mjs", ".", "--intent", "verify execution completion", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXECUTION_ASSURANCE"
        && parsed.readOnly === true
        && parsed.schemaVersion === "1.74.0"
        && parsed.structuredEvidence?.artifact_type === "execution_assurance_report"
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && parsed.structuredEvidence?.completion_contract
        && parsed.structuredEvidence?.planned_impact_map
        && parsed.structuredEvidence?.actual_diff
        && parsed.structuredEvidence?.patch_assessment
        && parsed.structuredEvidence?.boundary?.approves_commit_or_push === "No") {
        pass("1.72-1.74 execution assurance resolver JSON includes safe evidence fields");
      } else {
        fail(`1.72-1.74 execution assurance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.72-1.74 execution assurance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.72-1.74 execution assurance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-execution-assurance.mjs", ".", "--allow-empty"]);
  if (source.status === 0 && source.stdout.includes("Execution assurance check passed")) {
    pass("1.72-1.74 execution assurance checker allows explicit source asset check without reports");
  } else {
    fail(`1.72-1.74 execution assurance checker failed: ${source.stderr || source.stdout}`);
  }

  const emptyReportTarget = fs.mkdtempSync(path.join(os.tmpdir(), "execution-assurance-empty-"));
  const emptyReportCheck = runNode(["scripts/check-execution-assurance.mjs", emptyReportTarget]);
  if (emptyReportCheck.status !== 0 && /no execution assurance reports found/.test(emptyReportCheck.stderr || emptyReportCheck.stdout)) {
    pass("1.72.1 execution assurance rejects no-report completion checks by default");
  } else {
    fail(`1.72.1 execution assurance must reject no-report checks: ${emptyReportCheck.stderr || emptyReportCheck.stdout}`);
  }

  const explicitReportDir = fs.mkdtempSync(path.join(os.tmpdir(), "execution-assurance-target-"));
  const generatedReport = runNode([
    "scripts/resolve-execution-assurance.mjs",
    explicitReportDir,
    "--intent",
    "verify execution completion",
    "--out",
    "execution-assurance-reports/generated.md",
  ]);
  const explicitReportPath = path.join(explicitReportDir, "execution-assurance-reports", "generated.md");
  const explicitReport = runNode([
    "scripts/check-execution-assurance.mjs",
    explicitReportDir,
    "--report",
    explicitReportPath,
    "--require-structured-evidence",
  ]);
  if (generatedReport.status === 0
    && fs.existsSync(explicitReportPath)
    && explicitReport.status === 0
    && explicitReport.stdout.includes("Execution assurance check passed")) {
    pass("1.72-1.74 execution assurance --out report is generated and checked as the same file");
  } else {
    fail(`1.72-1.74 execution assurance --out explicit report check failed: ${generatedReport.stderr || explicitReport.stderr || generatedReport.stdout || explicitReport.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "execution-assurance", ".", "--intent", "verify execution completion"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Execution Assurance Report")) {
    pass("CLI execution-assurance delegates to resolver");
  } else {
    fail(`CLI execution-assurance failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  for (const commandName of ["execution-assurance-check", "done-check", "verify-execution"]) {
    const cliChecker = runNode(["scripts/cli.mjs", commandName, "examples/1.72-execution-assurance-chain/feature-contract-validation"]);
    if (cliChecker.status === 0 && cliChecker.stdout.includes("Execution assurance check passed")) {
      pass(`CLI ${commandName} delegates to checker`);
    } else {
      fail(`CLI ${commandName} failed: ${cliChecker.stderr || cliChecker.stdout}`);
    }
  }

  for (const [target, extraFlags] of [
    ["examples/1.72-execution-assurance-chain/feature-contract-validation", ["--require-evidence-refs", "--require-review", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/old-project-intentos-adoption", ["--require-evidence-refs", "--require-review", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/safe-copy-patch", ["--require-evidence-refs", "--require-actual-diff"]],
    ["examples/1.72-execution-assurance-chain/patch-smell-backend-only", []],
  ]) {
    const example = runNode(["scripts/check-execution-assurance.mjs", target, "--require-structured-evidence", ...extraFlags]);
    if (example.status === 0) pass(`1.72-1.74 execution assurance example passes strict checker ${target}`);
    else fail(`1.72-1.74 execution assurance example failed ${target}: ${example.stderr || example.stdout}`);
  }

  for (const target of badFixtures) {
    const result = runNode(["scripts/check-execution-assurance.mjs", `test-fixtures/bad/${target}`, "--require-structured-evidence"]);
    if (result.status !== 0) pass(`1.72-1.74 execution assurance rejects ${target}`);
    else fail(`1.72-1.74 execution assurance must reject ${target}`);
  }
}

function checkDocumentLifecycleProtocol() {
  const required = [
    "core/document-lifecycle.md",
    "docs/document-lifecycle.md",
    "docs/work-queue.md",
    "templates/document-lifecycle-report.md",
    "checklists/document-lifecycle-review.md",
    "prompts/document-lifecycle-agent.md",
    "doc-lifecycle-reports/.gitkeep",
    "scripts/resolve-document-lifecycle.mjs",
    "scripts/check-document-lifecycle.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "examples/1.21-document-lifecycle/README.md",
    "examples/1.21-document-lifecycle/doc-lifecycle-reports/001-doc-lifecycle.md",
    "test-fixtures/bad/bad-document-lifecycle-authorizes-delete/doc-lifecycle-reports/001-bad.md",
    "test-fixtures/bad/bad-document-lifecycle-missing-source-of-truth/doc-lifecycle-reports/001-bad.md",
    "releases/1.21.0/release-record.md",
    "releases/1.21.0/known-limitations.md",
    "releases/1.21.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.21 document lifecycle asset exists ${file}`);
    else fail(`1.21 document lifecycle asset missing ${file}`);
  }

  const combined = [
    read("core/document-lifecycle.md"),
    read("docs/document-lifecycle.md"),
    read("templates/document-lifecycle-report.md"),
    read("scripts/resolve-document-lifecycle.mjs"),
    read("scripts/check-document-lifecycle.mjs"),
    read("releases/1.21.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Document Lifecycle Governance",
    "Document Lifecycle Report",
    "ACTIVE_SOURCE_OF_TRUTH",
    "DUPLICATE_CANDIDATE",
    "ARCHIVE_CANDIDATE",
    "DEPRECATION_CANDIDATE",
    "Codex must recommend archive review before recommending deletion",
    "Source Of Truth Map",
    "Archive Suggestions",
    "What Not To Delete",
    "does not delete files",
    "does not authorize deletion",
    "does not move or archive files",
    "does not change source of truth",
  ]) {
    if (combined.includes(marker)) pass(`1.21 document lifecycle includes ${marker}`);
    else fail(`1.21 document lifecycle missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-document-lifecycle.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Lifecycle Recommendation")
    && resolver.stdout.includes("This report deletes files: No")
    && resolver.stdout.includes("Archive Suggestions")) {
    pass("1.21 document lifecycle resolver passes source repo");
  } else {
    fail(`1.21 document lifecycle resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-document-lifecycle.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_LIFECYCLE_RECOMMENDATION"
        && parsed.boundary?.deletesFiles === "No"
        && Array.isArray(parsed.sourceOfTruthMap)) {
        pass("1.21 document lifecycle resolver JSON includes map and boundary");
      } else {
        fail(`1.21 document lifecycle resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.21 document lifecycle resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.21 document lifecycle resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-document-lifecycle.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Document lifecycle check passed")) {
    pass("1.21 document lifecycle checker passes source repo");
  } else {
    fail(`1.21 document lifecycle checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-document-lifecycle.mjs", "examples/1.21-document-lifecycle"]);
  if (example.status === 0 && example.stdout.includes("Document lifecycle check passed")) {
    pass("1.21 document lifecycle example passes checker");
  } else {
    fail(`1.21 document lifecycle example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes deletion", ["scripts/check-document-lifecycle.mjs", "test-fixtures/bad/bad-document-lifecycle-authorizes-delete"], "authorizes deletion"],
    ["missing source of truth", ["scripts/check-document-lifecycle.mjs", "test-fixtures/bad/bad-document-lifecycle-missing-source-of-truth"], "source-of-truth map"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.21 document lifecycle rejects ${name}`);
    } else {
      fail(`1.21 document lifecycle must reject ${name}: ${output}`);
    }
  }
}

function checkDocumentArchiveApplyProtocol() {
  const required = [
    "core/document-archive-apply.md",
    "docs/document-archive-apply.md",
    "templates/document-archive-apply-plan.md",
    "templates/archive-index.md",
    "checklists/document-archive-apply-review.md",
    "prompts/document-archive-agent.md",
    "archive-apply-plans/.gitkeep",
    "scripts/resolve-document-archive-apply.mjs",
    "scripts/check-document-archive-apply.mjs",
    "examples/1.28-document-archive-apply/README.md",
    "examples/1.28-document-archive-apply/archive-apply-plans/001-archive-plan.md",
    "test-fixtures/bad/bad-archive-apply-authorizes-archive/archive-apply-plans/001-bad.md",
    "test-fixtures/bad/bad-archive-apply-missing-index/archive-apply-plans/001-bad.md",
    "releases/1.28.0/release-record.md",
    "releases/1.28.0/known-limitations.md",
    "releases/1.28.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.28 document archive apply asset exists ${file}`);
    else fail(`1.28 document archive apply asset missing ${file}`);
  }

  const combined = [
    read("core/document-archive-apply.md"),
    read("docs/document-archive-apply.md"),
    read("templates/document-archive-apply-plan.md"),
    read("templates/archive-index.md"),
    read("scripts/resolve-document-archive-apply.mjs"),
    read("scripts/check-document-archive-apply.mjs"),
    read("releases/1.28.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Document Archive Apply Governance",
    "Document Archive Apply Plan",
    "Archive Apply States",
    "Link Check Plan",
    "Archive Index",
    "Rollback Plan",
    "This plan authorizes archive apply: No",
    "This plan replaces Document Lifecycle: No",
  ]) {
    if (combined.includes(marker)) pass(`1.28 document archive apply includes ${marker}`);
    else fail(`1.28 document archive apply missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-document-archive-apply.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Archive Apply Plan")
    && resolver.stdout.includes("Link Check Plan")
    && resolver.stdout.includes("This plan authorizes archive apply: No")) {
    pass("1.28 document archive apply resolver prints safe plan");
  } else {
    fail(`1.28 document archive apply resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-document-archive-apply.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_ARCHIVE_APPLY_PLAN"
        && parsed.boundaries?.authorizesArchiveApply === "No"
        && parsed.boundaries?.movesOrArchivesFilesNow === "No"
        && parsed.linkCheckPlan
        && parsed.archiveIndex) {
        pass("1.28 document archive apply resolver JSON includes boundaries, link check, and index");
      } else {
        fail(`1.28 document archive apply resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.28 document archive apply resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.28 document archive apply resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-document-archive-apply.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Document Archive Apply check passed")) {
    pass("1.28 document archive apply checker passes source repo");
  } else {
    fail(`1.28 document archive apply checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-document-archive-apply.mjs", "examples/1.28-document-archive-apply"]);
  if (example.status === 0 && example.stdout.includes("Document Archive Apply check passed")) {
    pass("1.28 document archive apply example passes checker");
  } else {
    fail(`1.28 document archive apply example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes archive apply", ["scripts/check-document-archive-apply.mjs", "test-fixtures/bad/bad-archive-apply-authorizes-archive"], "forbidden archive apply claim"],
    ["missing archive index", ["scripts/check-document-archive-apply.mjs", "test-fixtures/bad/bad-archive-apply-missing-index"], "missing Archive Index"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.28 document archive apply rejects ${name}`);
    } else {
      fail(`1.28 document archive apply must reject ${name}: ${output}`);
    }
  }
}

function checkUnifiedApplyPlanProtocol() {
  const required = [
    "core/unified-apply-plan.md",
    "docs/unified-apply-plan.md",
    "docs/plans/unified-apply-plan-1.34-plan.md",
    "templates/unified-apply-plan.md",
    "checklists/unified-apply-plan-review.md",
    "prompts/apply-plan-agent.md",
    "apply-plans/.gitkeep",
    "scripts/resolve-apply-plan.mjs",
    "scripts/check-apply-plan.mjs",
    "examples/1.34-unified-apply-plan/README.md",
    "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md",
    "test-fixtures/bad/bad-apply-plan-authorizes-apply/apply-plans/001-bad.md",
    "test-fixtures/bad/bad-apply-plan-writes-now/apply-plans/001-bad.md",
    "releases/1.34.0/release-record.md",
    "releases/1.34.0/known-limitations.md",
    "releases/1.34.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.34 unified apply plan asset exists ${file}`);
    else fail(`1.34 unified apply plan asset missing ${file}`);
  }

  const combined = [
    read("core/unified-apply-plan.md"),
    read("docs/unified-apply-plan.md"),
    read("templates/unified-apply-plan.md"),
    read("scripts/resolve-apply-plan.mjs"),
    read("scripts/check-apply-plan.mjs"),
    read("releases/1.34.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Unified Apply Plan Governance",
    "Unified Apply Plan",
    "Apply States",
    "Planned Actions",
    "Human-Only / Blocked Actions",
    "Backup / Rollback Plan",
    "This plan writes files now: No",
    "This plan authorizes apply: No",
    "This plan approves implementation: No",
    "This plan approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.34 unified apply plan includes ${marker}`);
    else fail(`1.34 unified apply plan missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain IntentOS apply plan", "--action", "workflow-assets"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Apply Plan")
    && resolver.stdout.includes("This plan authorizes apply: No")
    && resolver.stdout.includes("Can Codex write now: No")) {
    pass("1.34 unified apply plan resolver prints safe plan");
  } else {
    fail(`1.34 unified apply plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain IntentOS apply plan", "--action", "workflow-assets", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_APPLY_PLAN"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && Array.isArray(parsed.plannedActions)
        && parsed.plannedActions.every((action) => action.willWriteNow === "No")) {
        pass("1.34 unified apply plan resolver JSON includes actions and boundaries");
      } else {
        fail(`1.34 unified apply plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.34 unified apply plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.34 unified apply plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-apply-plan.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Unified Apply Plan check passed")) {
    pass("1.34 unified apply plan checker passes source repo");
  } else {
    fail(`1.34 unified apply plan checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-apply-plan.mjs", "examples/1.34-unified-apply-plan"]);
  if (example.status === 0 && example.stdout.includes("Unified Apply Plan check passed")) {
    pass("1.34 unified apply plan example passes checker");
  } else {
    fail(`1.34 unified apply plan example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes apply", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-apply-plan-authorizes-apply"], "forbidden apply plan claim"],
    ["writes now", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-apply-plan-writes-now"], "planned actions must not write now"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.34 unified apply plan rejects ${name}`);
    } else {
      fail(`1.34 unified apply plan must reject ${name}: ${output}`);
    }
  }
}

function checkBeginnerEntryProtocol() {
  const required = [
    "core/beginner-entry.md",
    "docs/beginner-entry.md",
    "docs/plans/beginner-entry-1.35-plan.md",
    "templates/beginner-entry-card.md",
    "checklists/beginner-entry-review.md",
    "prompts/beginner-entry-agent.md",
    "beginner-entry-cards/.gitkeep",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
    "examples/1.35-beginner-entry/README.md",
    "examples/1.35-beginner-entry/beginner-entry-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-beginner-entry-authorizes-write/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-jargon/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-too-many-questions/beginner-entry-cards/001-bad.md",
    "releases/1.35.0/release-record.md",
    "releases/1.35.0/known-limitations.md",
    "releases/1.35.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.35 beginner entry asset exists ${file}`);
    else fail(`1.35 beginner entry asset missing ${file}`);
  }

  const combined = [
    read("core/beginner-entry.md"),
    read("docs/beginner-entry.md"),
    read("templates/beginner-entry-card.md"),
    read("scripts/resolve-beginner-entry.mjs"),
    read("scripts/check-beginner-entry.mjs"),
    read("releases/1.35.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Beginner Entry Governance",
    "users who should not need to know IntentOS workflow commands",
    "ask at most 2 plain business questions by default",
    "Beginner Entry Card",
    "What Codex Must Not Do Yet",
    "This entry writes target files: No",
    "This entry authorizes apply: No",
    "This entry approves implementation: No",
    "This entry approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.35 beginner entry includes ${marker}`);
    else fail(`1.35 beginner entry missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "ask",
    "ask-check",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports beginner entry marker ${marker}`);
    else fail(`CLI missing beginner entry marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "beginner-entry-card",
    "beginner-entry-cards",
    "beginner-entry-card.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports beginner entry marker ${marker}`);
    else fail(`new-workflow-item missing beginner entry marker ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 IntentOS 小白入口"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Beginner Entry Card")
    && resolver.stdout.includes("This entry writes target files: No")
    && resolver.stdout.includes("Can Codex change files now: No")) {
    pass("1.35 beginner entry resolver prints safe card");
  } else {
    fail(`1.35 beginner entry resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const positionalResolver = runNode(["scripts/resolve-beginner-entry.mjs", "我想把当前项目接入 IntentOS"]);
  if (positionalResolver.status === 0
    && positionalResolver.stdout.includes("Beginner Entry Card")
    && positionalResolver.stdout.includes("This entry writes target files: No")) {
    pass("1.35 beginner entry resolver accepts one-sentence goal");
  } else {
    fail(`1.35 beginner entry one-sentence goal failed: ${positionalResolver.stderr || positionalResolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 IntentOS 小白入口", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "BEGINNER_ENTRY_CARD"
        && parsed.boundary?.writesTargetFiles === "No"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.routingEvidence?.technicalEvidenceAvailable === "yes"
        && Array.isArray(parsed.questionsForHuman)
        && parsed.questionsForHuman.length <= 3) {
        pass("1.35 beginner entry resolver JSON includes bounded decisions and boundaries");
      } else {
        fail(`1.35 beginner entry resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.35 beginner entry resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.35 beginner entry resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-beginner-entry.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Beginner Entry check passed")) {
    pass("1.35 beginner entry checker passes source repo");
  } else {
    fail(`1.35 beginner entry checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-beginner-entry.mjs", "examples/1.35-beginner-entry"]);
  if (example.status === 0 && example.stdout.includes("Beginner Entry check passed")) {
    pass("1.35 beginner entry example passes checker");
  } else {
    fail(`1.35 beginner entry example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-authorizes-write"], "forbidden beginner entry claim"],
    ["jargon", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-jargon"], "internal workflow jargon"],
    ["too many questions", ["scripts/check-beginner-entry.mjs", "test-fixtures/bad/bad-beginner-entry-too-many-questions"], "too many questions"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.35 beginner entry rejects ${name}`);
    } else {
      fail(`1.35 beginner entry must reject ${name}: ${output}`);
    }
  }
}

function checkControlledApplyReadinessProtocol() {
  const required = [
    "core/controlled-apply-readiness.md",
    "docs/controlled-apply-readiness.md",
    "docs/plans/controlled-apply-readiness-1.38-plan.md",
    "templates/controlled-apply-readiness-report.md",
    "checklists/controlled-apply-readiness-review.md",
    "prompts/controlled-apply-readiness-agent.md",
    "apply-readiness-reports/.gitkeep",
    "scripts/resolve-controlled-apply-readiness.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
    "examples/1.38-controlled-apply-readiness/README.md",
    "examples/1.38-controlled-apply-readiness/apply-readiness-reports/001-workflow-assets.md",
    "test-fixtures/bad/bad-controlled-apply-authorizes-apply/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-high-risk-ready/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-controlled-apply-proceeds-without-approval/apply-readiness-reports/001-bad.md",
    "releases/1.38.0/release-record.md",
    "releases/1.38.0/known-limitations.md",
    "releases/1.38.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.38 controlled apply readiness asset exists ${file}`);
    else fail(`1.38 controlled apply readiness asset missing ${file}`);
  }

  const combined = [
    read("core/controlled-apply-readiness.md"),
    read("docs/controlled-apply-readiness.md"),
    read("templates/controlled-apply-readiness-report.md"),
    read("scripts/resolve-controlled-apply-readiness.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("releases/1.38.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Controlled Apply Readiness Governance",
    "It does not execute the plan",
    "READY_FOR_HUMAN_APPROVED_APPLY",
    "Human-Only Actions",
    "This readiness report writes files now: No",
    "This readiness report authorizes apply: No",
    "This readiness report approves implementation: No",
    "This readiness report approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.38 controlled apply readiness includes ${marker}`);
    else fail(`1.38 controlled apply readiness missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "apply-readiness",
    "apply-readiness-check",
    "scripts/resolve-controlled-apply-readiness.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports controlled apply readiness marker ${marker}`);
    else fail(`CLI missing controlled apply readiness marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "controlled-apply-readiness-report",
    "apply-readiness-reports",
    "controlled-apply-readiness-report.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports controlled apply readiness marker ${marker}`);
    else fail(`new-workflow-item missing controlled apply readiness marker ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Controlled Apply Readiness Report")
    && resolver.stdout.includes("Can Codex apply now")
    && resolver.stdout.includes("This readiness report authorizes apply: No")) {
    pass("1.38 controlled apply readiness resolver prints safe report");
  } else {
    fail(`1.38 controlled apply readiness resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-controlled-apply-readiness.mjs", ".", "--plan", "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md", "--git-state", "clean", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CONTROLLED_APPLY_READINESS"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && parsed.readinessState?.canProceedWithoutNewApproval === "No") {
        pass("1.38 controlled apply readiness resolver JSON includes boundaries");
      } else {
        fail(`1.38 controlled apply readiness resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.38 controlled apply readiness resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.38 controlled apply readiness resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-controlled-apply-readiness.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Controlled Apply Readiness check passed")) {
    pass("1.38 controlled apply readiness checker passes source repo");
  } else {
    fail(`1.38 controlled apply readiness checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-controlled-apply-readiness.mjs", "examples/1.38-controlled-apply-readiness"]);
  if (example.status === 0 && example.stdout.includes("Controlled Apply Readiness check passed")) {
    pass("1.38 controlled apply readiness example passes checker");
  } else {
    fail(`1.38 controlled apply readiness example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes apply", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-authorizes-apply"], "forbidden controlled apply readiness claim"],
    ["high-risk ready", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-high-risk-ready"], "cannot be READY_FOR_HUMAN_APPROVED_APPLY"],
    ["proceeds without approval", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-proceeds-without-approval"], "must state it cannot proceed without new approval"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.38 controlled apply readiness rejects ${name}`);
    } else {
      fail(`1.38 controlled apply readiness must reject ${name}: ${output}`);
    }
  }
}

function checkApprovalRecordGovernanceProtocol() {
  const required = [
    "core/approval-record-governance.md",
    "docs/approval-record-governance.md",
    "docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md",
    "docs/plans/approval-record-governance-1.40-plan.md",
    "docs/plans/approval-record-hardening-1.40.1-plan.md",
    "docs/plans/structured-evidence-schema-1.41-plan.md",
    "docs/plans/structured-evidence-hardening-1.41.1-plan.md",
    "docs/artifact-lifecycle.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/structured-evidence-schema.md",
    "templates/approval-record.md",
    "templates/controlled-apply-readiness-report.md",
    "templates/unified-apply-plan.md",
    "checklists/approval-record-review.md",
    "prompts/approval-record-agent.md",
    "approval-records/.gitkeep",
    "schemas/artifacts/approval-record.schema.json",
    "schemas/artifacts/controlled-apply-readiness.schema.json",
    "schemas/artifacts/unified-apply-plan.schema.json",
    "scripts/lib/artifact-schema.mjs",
    "scripts/check-apply-plan.mjs",
    "scripts/check-controlled-apply-readiness.mjs",
    "scripts/check-approval-record.mjs",
    "examples/1.40-approval-record-governance/README.md",
    "examples/1.40-approval-record-governance/approval-records/001-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/README.md",
    "examples/1.41-structured-evidence-schema/apply-plans/001-structured-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/apply-readiness-reports/001-structured-workflow-assets.md",
    "examples/1.41-structured-evidence-schema/approval-records/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-approval-record-ai-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-missing-plan-hash/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-all-actions/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-auto-apply/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-high-risk/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-wildcard-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-parent-traversal/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-symlink-path/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-expired/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-ambiguous-owner/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-mismatched-action-id/approval-records/001-bad.md",
    "test-fixtures/bad/bad-approval-record-plan-changed/approval-records/001-bad.md",
    "test-fixtures/bad/bad-structured-apply-plan-digest/apply-plans/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-plan-digest/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-approval-plan-digest/approval-records/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-missing-plan-ref/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-readiness-empty-actions/apply-readiness-reports/001-bad.md",
    "test-fixtures/bad/bad-structured-approval-missing-plan-ref/approval-records/001-bad.md",
    "releases/1.40.0/release-record.md",
    "releases/1.40.0/known-limitations.md",
    "releases/1.40.0/self-check-report.md",
    "releases/1.40.1/release-record.md",
    "releases/1.40.1/known-limitations.md",
    "releases/1.40.1/self-check-report.md",
    "releases/1.41.0/release-record.md",
    "releases/1.41.0/known-limitations.md",
    "releases/1.41.0/self-check-report.md",
    "releases/1.41.1/release-record.md",
    "releases/1.41.1/known-limitations.md",
    "releases/1.41.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.40 approval record asset exists ${file}`);
    else fail(`1.40 approval record asset missing ${file}`);
  }

  const combined = [
    read("core/approval-record-governance.md"),
    read("docs/approval-record-governance.md"),
    read("templates/approval-record.md"),
    read("scripts/check-approval-record.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("releases/1.40.0/release-record.md"),
    read("releases/1.40.1/release-record.md"),
    read("releases/1.41.0/release-record.md"),
    read("releases/1.41.1/release-record.md"),
    read("docs/artifact-lifecycle.md"),
    read("docs/o0-bl0-lightweight-path.md"),
    read("docs/structured-evidence-schema.md"),
  ].join("\n");

  for (const marker of [
    "Approval Record Governance",
    "Which exact low-risk actions remain inside the current user's explicit business request?",
    "Approval owner type",
    "Plan hash",
    "Approved action IDs must be explicit",
    "Artifact Lifecycle Map",
    "O0 / BL0 Lightweight Path",
    "Structured Evidence Schema",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "plan_digest",
    "canonical evidence digest",
    "wildcard paths",
    "parent directory traversal",
    "symlink aliases",
    "This approval record authorizes automatic apply: No",
    "This approval record approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.40 approval record includes ${marker}`);
    else fail(`1.40 approval record missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "approval-record-check",
    "scripts/check-approval-record.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports approval record marker ${marker}`);
    else fail(`CLI missing approval record marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "approval-record",
    "approval-records",
    "approval-record.md",
    "Approval status: `DRAFT`",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports approval record marker ${marker}`);
    else fail(`new-workflow-item missing approval record marker ${marker}`);
  }

  const check = runNode(["scripts/check-approval-record.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record checker passes source repo");
  } else {
    fail(`1.40 approval record checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance"]);
  if (example.status === 0 && example.stdout.includes("Approval Record check passed")) {
    pass("1.40 approval record example passes checker");
  } else {
    fail(`1.40 approval record example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["structured apply plan", ["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema"], "structured apply plan evidence matches schema"],
    ["structured readiness", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema"], "structured readiness evidence matches schema"],
    ["structured approval", ["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema"], "structured approval evidence matches schema"],
    ["strict structured apply plan", ["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured apply plan evidence matches schema"],
    ["strict structured readiness", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured readiness references matching apply plan digest"],
    ["strict structured approval", ["scripts/check-approval-record.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"], "structured approval references matching apply plan digest"],
  ]) {
    const result = runNode(args);
    if (result.status === 0 && result.stdout.includes(expected)) {
      pass(`1.41 ${name} example passes checker`);
    } else {
      fail(`1.41 ${name} example failed: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, args, expected] of [
    ["AI owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ai-owner"], "current conversation user or another specific human confirmer"],
    ["missing plan hash", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-missing-plan-hash"], "must include a plan hash"],
    ["all actions", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-all-actions"], "approved action ids must be explicit"],
    ["auto apply", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-auto-apply"], "forbidden approval record claim"],
    ["high risk", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-high-risk"], "cannot approve high-risk actions"],
    ["wildcard path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-wildcard-path"], "must use exact bounded target paths"],
    ["parent traversal", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-parent-traversal"], "must use exact bounded target paths"],
    ["symlink path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-symlink-path"], "must use exact bounded target paths"],
    ["expired approval", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-expired"], "is expired and must be re-approved"],
    ["ambiguous owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ambiguous-owner"], "current conversation user or another specific human confirmer"],
    ["mismatched action ID", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-mismatched-action-id"], "human approval statement must match approved action IDs"],
    ["plan changed", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-plan-changed"], "plan changed after approval"],
    ["structured apply digest", ["scripts/check-apply-plan.mjs", "test-fixtures/bad/bad-structured-apply-plan-digest"], "plan_digest does not match canonical evidence digest"],
    ["structured readiness digest", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-plan-digest"], "apply_plan.plan_digest does not match referenced apply plan evidence"],
    ["structured approval digest", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-structured-approval-plan-digest"], "approved_plan.plan_digest does not match referenced apply plan evidence"],
    ["strict apply missing structured evidence", ["scripts/check-apply-plan.mjs", "examples/1.34-unified-apply-plan", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict readiness missing structured evidence", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.38-controlled-apply-readiness", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict approval missing structured evidence", ["scripts/check-approval-record.mjs", "examples/1.40-approval-record-governance", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
    ["strict readiness missing plan reference", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
    ["strict approval missing plan reference", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-structured-approval-missing-plan-ref", "--require-structured-evidence"], "plan reference must resolve"],
    ["structured readiness empty actions", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-structured-readiness-empty-actions"], "structured readiness actions must not be empty"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.40 approval record rejects ${name}`);
    } else {
      fail(`1.40 approval record must reject ${name}: ${output}`);
    }
  }
}

function checkConversationNativeAskProtocol() {
  const required = [
    "core/conversation-native-ask.md",
    "docs/conversation-native-ask.md",
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "templates/conversation-ask-card.md",
    "checklists/conversation-native-ask-review.md",
    "prompts/conversation-native-ask-agent.md",
    "conversation-ask-cards/.gitkeep",
    "scripts/check-conversation-native-ask.mjs",
    "examples/1.37-conversation-native-ask/README.md",
    "examples/1.37-conversation-native-ask/conversation-ask-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-conversation-ask-authorizes-write/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-cli-burden/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-too-many-questions/conversation-ask-cards/001-bad.md",
    "releases/1.37.0/release-record.md",
    "releases/1.37.0/known-limitations.md",
    "releases/1.37.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.37 conversation-native ask asset exists ${file}`);
    else fail(`1.37 conversation-native ask asset missing ${file}`);
  }

  const combined = [
    read("core/conversation-native-ask.md"),
    read("docs/conversation-native-ask.md"),
    read("templates/conversation-ask-card.md"),
    read("scripts/check-conversation-native-ask.mjs"),
    read("releases/1.37.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Conversation-Native Ask Governance",
    "default conversational behavior",
    "Codex should not require the user to first run",
    "does not replace Beginner Entry",
    "This conversation ask writes target files: No",
    "This conversation ask authorizes apply: No",
    "This conversation ask approves implementation: No",
    "This conversation ask requires the user to run CLI commands first: No",
  ]) {
    if (combined.includes(marker)) pass(`1.37 conversation-native ask includes ${marker}`);
    else fail(`1.37 conversation-native ask missing ${marker}`);
  }

  const cli = read("scripts/cli.mjs");
  for (const marker of [
    "conversation-ask-check",
    "scripts/check-conversation-native-ask.mjs",
  ]) {
    if (cli.includes(marker)) pass(`CLI supports conversation-native ask marker ${marker}`);
    else fail(`CLI missing conversation-native ask marker ${marker}`);
  }

  const newWorkflowItem = read("scripts/new-workflow-item.mjs");
  for (const marker of [
    "conversation-ask-card",
    "conversation-ask-cards",
    "conversation-ask-card.md",
  ]) {
    if (newWorkflowItem.includes(marker)) pass(`new-workflow-item supports conversation-native ask marker ${marker}`);
    else fail(`new-workflow-item missing conversation-native ask marker ${marker}`);
  }

  const check = runNode(["scripts/check-conversation-native-ask.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Conversation-Native Ask check passed")) {
    pass("1.37 conversation-native ask checker passes source repo");
  } else {
    fail(`1.37 conversation-native ask checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-conversation-native-ask.mjs", "examples/1.37-conversation-native-ask"]);
  if (example.status === 0 && example.stdout.includes("Conversation-Native Ask check passed")) {
    pass("1.37 conversation-native ask example passes checker");
  } else {
    fail(`1.37 conversation-native ask example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["authorizes write", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-authorizes-write"], "forbidden conversation ask claim"],
    ["CLI burden", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-cli-burden"], "requires CLI command burden"],
    ["too many questions", ["scripts/check-conversation-native-ask.mjs", "test-fixtures/bad/bad-conversation-ask-too-many-questions"], "too many questions"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.37 conversation-native ask rejects ${name}`);
    } else {
      fail(`1.37 conversation-native ask must reject ${name}: ${output}`);
    }
  }
}

function checkWorkQueueProtocol() {
  const required = [
    "core/work-queue.md",
    "docs/work-queue.md",
    "templates/work-queue-report.md",
    "checklists/work-queue-review.md",
    "prompts/work-queue-agent.md",
    "work-queue/.gitkeep",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "examples/1.22-work-queue/README.md",
    "examples/1.22-work-queue/work-queue/001-work-queue.md",
    "test-fixtures/bad/bad-work-queue-multiple-current/work-queue/001-bad.md",
    "test-fixtures/bad/bad-work-queue-resume-without-review/work-queue/001-bad.md",
    "releases/1.22.0/release-record.md",
    "releases/1.22.0/known-limitations.md",
    "releases/1.22.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.22 work queue asset exists ${file}`);
    else fail(`1.22 work queue asset missing ${file}`);
  }

  const combined = [
    read("core/work-queue.md"),
    read("docs/work-queue.md"),
    read("templates/work-queue-report.md"),
    read("scripts/resolve-work-queue.mjs"),
    read("scripts/check-work-queue.mjs"),
    read("releases/1.22.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Work Queue Governance",
    "Work Queue Report",
    "There must be at most one `CURRENT` task",
    "PAUSED",
    "BACKLOG",
    "Resume Review",
    "Interruption Rules",
    "This report approves implementation: No",
    "This report approves target-project writes: No",
    "This report approves scope expansion: No",
    "This report approves release or production: No",
    "This report resumes stale work without review: No",
  ]) {
    if (combined.includes(marker)) pass(`1.22 work queue includes ${marker}`);
    else fail(`1.22 work queue missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-work-queue.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Work Queue Recommendation")
    && resolver.stdout.includes("CURRENT task count")
    && resolver.stdout.includes("This report approves implementation: No")) {
    pass("1.22 work queue resolver passes source repo");
  } else {
    fail(`1.22 work queue resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-work-queue.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORK_QUEUE_RECOMMENDATION"
        && parsed.boundary?.approvesImplementation === "No"
        && Number.isFinite(parsed.currentTaskCount)
        && Array.isArray(parsed.recommendedQueueActions)) {
        pass("1.22 work queue resolver JSON includes task count, actions, and boundary");
      } else {
        fail(`1.22 work queue resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.22 work queue resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.22 work queue resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-work-queue.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Work queue check passed")) {
    pass("1.22 work queue checker passes source repo");
  } else {
    fail(`1.22 work queue checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-work-queue.mjs", "examples/1.22-work-queue"]);
  if (example.status === 0 && example.stdout.includes("Work queue check passed")) {
    pass("1.22 work queue example passes checker");
  } else {
    fail(`1.22 work queue example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["multiple current", ["scripts/check-work-queue.mjs", "test-fixtures/bad/bad-work-queue-multiple-current"], "multiple CURRENT"],
    ["resume without review", ["scripts/check-work-queue.mjs", "test-fixtures/bad/bad-work-queue-resume-without-review"], "Resume without review"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.22 work queue rejects ${name}`);
    } else {
      fail(`1.22 work queue must reject ${name}: ${output}`);
    }
  }
}

function checkHookOrchestrationProtocol() {
  const required = [
    "core/hook-orchestration.md",
    "docs/hook-orchestration.md",
    "templates/hook-orchestration-plan.md",
    "checklists/hook-orchestration-review.md",
    "prompts/hook-orchestration-agent.md",
    "hook-orchestration-plans/.gitkeep",
    "scripts/resolve-hook-orchestration.mjs",
    "scripts/check-hook-orchestration.mjs",
    "examples/1.23-hook-orchestration/README.md",
    "examples/1.23-hook-orchestration/hook-orchestration-plans/001-hook-plan.md",
    "test-fixtures/bad/bad-hook-orchestration-installs-hook/hook-orchestration-plans/001-bad.md",
    "test-fixtures/bad/bad-hook-orchestration-blocking-gate/hook-orchestration-plans/001-bad.md",
    "releases/1.23.0/release-record.md",
    "releases/1.23.0/known-limitations.md",
    "releases/1.23.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.23 hook orchestration asset exists ${file}`);
    else fail(`1.23 hook orchestration asset missing ${file}`);
  }

  const combined = [
    read("core/hook-orchestration.md"),
    read("docs/hook-orchestration.md"),
    read("templates/hook-orchestration-plan.md"),
    read("scripts/resolve-hook-orchestration.mjs"),
    read("scripts/check-hook-orchestration.mjs"),
    read("releases/1.23.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Hook Orchestration Governance",
    "Hook Orchestration Plan",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "Hook orchestration is plan-first",
    "Codex must not automatically install hooks",
    "This plan installs hooks: No",
    "This plan modifies CI: No",
    "This plan adds blocking gates: No",
    "This plan calls external APIs: No",
  ]) {
    if (combined.includes(marker)) pass(`1.23 hook orchestration includes ${marker}`);
    else fail(`1.23 hook orchestration missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-hook-orchestration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Hook Orchestration Recommendation")
    && resolver.stdout.includes("Proposed Hook Candidates")
    && resolver.stdout.includes("This plan installs hooks: No")) {
    pass("1.23 hook orchestration resolver passes source repo");
  } else {
    fail(`1.23 hook orchestration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-orchestration.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "HOOK_ORCHESTRATION_RECOMMENDATION"
        && parsed.boundary?.installsHooks === "No"
        && Array.isArray(parsed.proposedHookCandidates)
        && parsed.proposedHookCandidates.some((item) => item.level === "H3_EXPLICIT_APPROVAL_REQUIRED")) {
        pass("1.23 hook orchestration resolver JSON includes candidates and boundary");
      } else {
        fail(`1.23 hook orchestration resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.23 hook orchestration resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.23 hook orchestration resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-hook-orchestration.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Hook orchestration check passed")) {
    pass("1.23 hook orchestration checker passes source repo");
  } else {
    fail(`1.23 hook orchestration checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-hook-orchestration.mjs", "examples/1.23-hook-orchestration"]);
  if (example.status === 0 && example.stdout.includes("Hook orchestration check passed")) {
    pass("1.23 hook orchestration example passes checker");
  } else {
    fail(`1.23 hook orchestration example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["installs hook", ["scripts/check-hook-orchestration.mjs", "test-fixtures/bad/bad-hook-orchestration-installs-hook"], "installs hooks"],
    ["blocking gate", ["scripts/check-hook-orchestration.mjs", "test-fixtures/bad/bad-hook-orchestration-blocking-gate"], "adds blocking gates"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.23 hook orchestration rejects ${name}`);
    } else {
      fail(`1.23 hook orchestration must reject ${name}: ${output}`);
    }
  }
}

function checkHookPolicyProtocol() {
  const required = [
    "core/hook-policy.md",
    "docs/hook-policy.md",
    "templates/project-hook-policy.md",
    "checklists/hook-policy-review.md",
    "prompts/hook-policy-agent.md",
    "hook-policies/.gitkeep",
    "scripts/resolve-hook-policy.mjs",
    "scripts/check-hook-policy.mjs",
    "examples/1.29-hook-policy-hardening/README.md",
    "examples/1.29-hook-policy-hardening/hook-policies/001-project-hook-policy.md",
    "test-fixtures/bad/bad-hook-policy-installs-hook/hook-policies/001-bad.md",
    "test-fixtures/bad/bad-hook-policy-missing-rollback/hook-policies/001-bad.md",
    "releases/1.29.0/release-record.md",
    "releases/1.29.0/known-limitations.md",
    "releases/1.29.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.29 hook policy asset exists ${file}`);
    else fail(`1.29 hook policy asset missing ${file}`);
  }

  const combined = [
    read("core/hook-policy.md"),
    read("docs/hook-policy.md"),
    read("templates/project-hook-policy.md"),
    read("scripts/resolve-hook-policy.mjs"),
    read("scripts/check-hook-policy.mjs"),
    read("releases/1.29.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Project Hook Policy Governance",
    "Project Hook Policy",
    "Hook policy is authorization planning only",
    "POLICY_REVIEW_REQUIRED",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "Approval Matrix",
    "Rollback / Disable Policy",
    "This policy installs hooks: No",
    "This policy modifies CI: No",
    "This policy adds blocking gates: No",
    "This policy calls external APIs: No",
    "This policy stores tokens or secrets: No",
    "This policy enables auto-fix: No",
    "This policy replaces Hook Orchestration: No",
  ]) {
    if (combined.includes(marker)) pass(`1.29 hook policy includes ${marker}`);
    else fail(`1.29 hook policy missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-hook-policy.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Project Hook Policy")
    && resolver.stdout.includes("Allowed Hook Classes")
    && resolver.stdout.includes("This policy installs hooks: No")) {
    pass("1.29 hook policy resolver passes source repo");
  } else {
    fail(`1.29 hook policy resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-policy.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PROJECT_HOOK_POLICY"
        && parsed.boundaries?.installsHooks === "No"
        && Array.isArray(parsed.allowedHookClasses)
        && parsed.allowedHookClasses.some((item) => item.class === "H3_EXPLICIT_APPROVAL_REQUIRED")) {
        pass("1.29 hook policy resolver JSON includes classes and boundary");
      } else {
        fail(`1.29 hook policy resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.29 hook policy resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.29 hook policy resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-hook-policy.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Project Hook Policy check passed")) {
    pass("1.29 hook policy checker passes source repo");
  } else {
    fail(`1.29 hook policy checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-hook-policy.mjs", "examples/1.29-hook-policy-hardening"]);
  if (example.status === 0 && example.stdout.includes("Project Hook Policy check passed")) {
    pass("1.29 hook policy example passes checker");
  } else {
    fail(`1.29 hook policy example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["installs hook", ["scripts/check-hook-policy.mjs", "test-fixtures/bad/bad-hook-policy-installs-hook"], "This policy installs hooks"],
    ["missing rollback", ["scripts/check-hook-policy.mjs", "test-fixtures/bad/bad-hook-policy-missing-rollback"], "rollback policy"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.29 hook policy rejects ${name}`);
    } else {
      fail(`1.29 hook policy must reject ${name}: ${output}`);
    }
  }
}

function checkNaturalLanguageOrchestratorProtocol() {
  const required = [
    "core/natural-language-orchestrator.md",
    "docs/natural-language-orchestrator.md",
    "templates/workflow-guidance-card.md",
    "templates/user-decision-card.md",
    "checklists/workflow-guidance-review.md",
    "prompts/workflow-concierge-agent.md",
    "workflow-guidance-cards/.gitkeep",
    "scripts/resolve-workflow-guidance.mjs",
    "scripts/check-workflow-guidance.mjs",
    "examples/1.24-natural-language-orchestrator/README.md",
    "examples/1.24-natural-language-orchestrator/workflow-guidance-cards/001-existing-project.md",
    "examples/1.30-deep-guide-orchestration/README.md",
    "examples/1.30-deep-guide-orchestration/workflow-guidance-cards/001-deep-guide.md",
    "examples/1.31-intent-aware-deep-guide/README.md",
    "examples/1.31-intent-aware-deep-guide/workflow-guidance-cards/001-payment-booking-intent.md",
    "test-fixtures/bad/bad-workflow-guidance-too-many-questions/workflow-guidance-cards/001-bad.md",
    "test-fixtures/bad/bad-workflow-guidance-overclaim/workflow-guidance-cards/001-bad.md",
    "releases/1.24.0/release-record.md",
    "releases/1.24.0/known-limitations.md",
    "releases/1.24.0/self-check-report.md",
    "releases/1.30.0/release-record.md",
    "releases/1.30.0/known-limitations.md",
    "releases/1.30.0/self-check-report.md",
    "releases/1.31.0/release-record.md",
    "releases/1.31.0/known-limitations.md",
    "releases/1.31.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.24 workflow guidance asset exists ${file}`);
    else fail(`1.24 workflow guidance asset missing ${file}`);
  }

  const combined = [
    read("core/natural-language-orchestrator.md"),
    read("docs/natural-language-orchestrator.md"),
    read("templates/workflow-guidance-card.md"),
    read("scripts/resolve-workflow-guidance.mjs"),
    read("scripts/check-workflow-guidance.mjs"),
    read("releases/1.24.0/release-record.md"),
    exists("releases/1.30.0/release-record.md") ? read("releases/1.30.0/release-record.md") : "",
    exists("releases/1.31.0/release-record.md") ? read("releases/1.31.0/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Natural Language Workflow Orchestrator",
    "Workflow Guidance Card",
    "Default output mode is `plain`",
    "Delivery Path State",
    "Codex asks at most one plain business question in one turn",
    "This guidance writes target files: No",
    "This guidance modifies CI: No",
    "This guidance installs hooks: No",
    "--deep",
    "--intent",
    "Intent-Aware Deep Guide",
    "intentUnderstanding",
    "Deep Guide Orchestration",
    "selective-read-only",
  ]) {
    if (combined.includes(marker)) pass(`1.24 workflow guidance includes ${marker}`);
    else fail(`1.24 workflow guidance missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-workflow-guidance.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Guidance Card")
    && resolver.stdout.includes("Delivery Path State")
    && resolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.24 workflow guidance resolver prints safe card");
  } else {
    fail(`1.24 workflow guidance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_GUIDANCE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.current
        && Array.isArray(parsed.questionsForHuman)) {
        pass("1.24 workflow guidance resolver JSON includes boundaries, state, and questions");
      } else {
        fail(`1.24 workflow guidance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.24 workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.24 workflow guidance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const deepResolver = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep"]);
  if (deepResolver.status === 0
    && deepResolver.stdout.includes("Workflow Guidance Card")
    && (deepResolver.stdout.includes("What I Checked") || deepResolver.stdout.includes("Deep Orchestration"))
    && deepResolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.30 deep workflow guidance resolver prints safe card");
  } else {
    fail(`1.30 deep workflow guidance resolver failed: ${deepResolver.stderr || deepResolver.stdout}`);
  }

  const deepResolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep", "--json"]);
  if (deepResolverJson.status === 0) {
    try {
      const parsed = JSON.parse(deepResolverJson.stdout);
      const selected = parsed.deepOrchestration?.selectedCapabilities || [];
      const summaries = parsed.deepOrchestration?.summaries || [];
      if (parsed.deepOrchestration?.enabled === true
        && parsed.deepOrchestration?.mode === "selective-read-only"
        && selected.includes("review-surface")
        && selected.includes("delivery-path")
        && summaries.every((item) => item.readOnly === true)
        && parsed.deepOrchestration?.boundaries?.writesTargetFiles === "No") {
        pass("1.30 deep workflow guidance resolver JSON includes selective read-only orchestration");
      } else {
        fail(`1.30 deep workflow guidance resolver JSON missing expected fields: ${deepResolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.30 deep workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.30 deep workflow guidance resolver JSON failed: ${deepResolverJson.stderr || deepResolverJson.stdout}`);
  }

  const intentResolver = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep", "--intent", "我要加支付预约", "--json"]);
  if (intentResolver.status === 0) {
    try {
      const parsed = JSON.parse(intentResolver.stdout);
      const selected = parsed.deepOrchestration?.selectedCapabilities || [];
      if (parsed.intentUnderstanding?.classification === "ADD_PAYMENT_OR_VALUE_TRANSFER"
        && parsed.intentUnderstanding?.riskLevel === "high"
        && parsed.deepOrchestration?.intentAware === true
        && parsed.deepOrchestration?.intentClassification === "ADD_PAYMENT_OR_VALUE_TRANSFER"
        && selected.includes("review-surface")
        && selected.includes("delivery-path")
        && parsed.boundaries?.writesTargetFiles === "No") {
        pass("1.31 intent-aware workflow guidance resolver JSON classifies and routes payment intent");
      } else {
        fail(`1.31 intent-aware workflow guidance resolver JSON missing expected fields: ${intentResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.31 intent-aware workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.31 intent-aware workflow guidance resolver JSON failed: ${intentResolver.stderr || intentResolver.stdout}`);
  }

  const check = runNode(["scripts/check-workflow-guidance.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Workflow guidance check passed")) {
    pass("1.24 workflow guidance checker passes source repo");
  } else {
    fail(`1.24 workflow guidance checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.24-natural-language-orchestrator"]);
  if (example.status === 0 && example.stdout.includes("Workflow guidance check passed")) {
    pass("1.24 workflow guidance example passes checker");
  } else {
    fail(`1.24 workflow guidance example failed: ${example.stderr || example.stdout}`);
  }

  const deepExample = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.30-deep-guide-orchestration"]);
  if (deepExample.status === 0 && deepExample.stdout.includes("Workflow guidance check passed")) {
    pass("1.30 deep workflow guidance example passes checker");
  } else {
    fail(`1.30 deep workflow guidance example failed: ${deepExample.stderr || deepExample.stdout}`);
  }

  const intentExample = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.31-intent-aware-deep-guide"]);
  if (intentExample.status === 0 && intentExample.stdout.includes("Workflow guidance check passed")) {
    pass("1.31 intent-aware workflow guidance example passes checker");
  } else {
    fail(`1.31 intent-aware workflow guidance example failed: ${intentExample.stderr || intentExample.stdout}`);
  }

  for (const [name, args, expected] of [
    ["too many questions", ["scripts/check-workflow-guidance.mjs", "test-fixtures/bad/bad-workflow-guidance-too-many-questions"], "too many questions"],
    ["overclaim", ["scripts/check-workflow-guidance.mjs", "test-fixtures/bad/bad-workflow-guidance-overclaim"], "forbidden workflow guidance claim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.24 workflow guidance rejects ${name}`);
    } else {
      fail(`1.24 workflow guidance must reject ${name}: ${output}`);
    }
  }
}

function checkReviewSurfaceGovernanceProtocol() {
  const required = [
    "core/review-surface-governance.md",
    "docs/review-surface-governance.md",
    "templates/review-surface-card.md",
    "checklists/review-surface-review.md",
    "prompts/review-surface-agent.md",
    "review-surface-cards/.gitkeep",
    "scripts/resolve-review-surface.mjs",
    "scripts/check-review-surface.mjs",
    "examples/1.25-review-surface-governance/README.md",
    "examples/1.25-review-surface-governance/review-surface-cards/001-booking-review-surface.md",
    "test-fixtures/bad/bad-review-surface-approves-implementation/review-surface-cards/001-bad.md",
    "test-fixtures/bad/bad-review-surface-missing-debt/review-surface-cards/001-bad.md",
    "releases/1.25.0/release-record.md",
    "releases/1.25.0/known-limitations.md",
    "releases/1.25.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.25 review surface asset exists ${file}`);
    else fail(`1.25 review surface asset missing ${file}`);
  }

  const combined = [
    read("core/review-surface-governance.md"),
    read("docs/review-surface-governance.md"),
    read("templates/review-surface-card.md"),
    read("scripts/resolve-review-surface.mjs"),
    read("scripts/check-review-surface.mjs"),
    read("releases/1.25.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Review Surface Governance",
    "Review Surface Card",
    "Codex selects review surfaces",
    "DEBT_REVIEW is always required",
    "Post-Execution Review Contract",
    "This card writes target files: No",
    "This card approves implementation: No",
    "This card approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.25 review surface includes ${marker}`);
    else fail(`1.25 review surface missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-review-surface.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Review Surface Card")
    && resolver.stdout.includes("Selected Review Surfaces")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.25 review surface resolver prints safe card");
  } else {
    fail(`1.25 review surface resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-review-surface.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "REVIEW_SURFACE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.selectedReviewSurfaces?.some((item) => item.surface === "DEBT_REVIEW")
        && Array.isArray(parsed.postExecutionReviewContract)) {
        pass("1.25 review surface resolver JSON includes boundaries, debt review, and post-execution contract");
      } else {
        fail(`1.25 review surface resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.25 review surface resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.25 review surface resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-review-surface.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Review surface check passed")) {
    pass("1.25 review surface checker passes source repo");
  } else {
    fail(`1.25 review surface checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-review-surface.mjs", "examples/1.25-review-surface-governance"]);
  if (example.status === 0 && example.stdout.includes("Review surface check passed")) {
    pass("1.25 review surface example passes checker");
  } else {
    fail(`1.25 review surface example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["approval overclaim", ["scripts/check-review-surface.mjs", "test-fixtures/bad/bad-review-surface-approves-implementation"], "forbidden review surface claim"],
    ["missing debt", ["scripts/check-review-surface.mjs", "test-fixtures/bad/bad-review-surface-missing-debt"], "missing required review surface: DEBT_REVIEW"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.25 review surface rejects ${name}`);
    } else {
      fail(`1.25 review surface must reject ${name}: ${output}`);
    }
  }
}

function checkBusinessRuleClosureProtocol() {
  const required = [
    "core/business-rule-closure.md",
    "docs/business-rule-closure.md",
    "docs/plans/business-rule-closure-1.75-plan.md",
    "templates/business-rule-closure-card.md",
    "checklists/business-rule-closure-review.md",
    "prompts/business-rule-closure-agent.md",
    "schemas/artifacts/business-rule-closure.schema.json",
    "business-rule-closures/.gitkeep",
    "scripts/resolve-business-rule-closure.mjs",
    "scripts/check-business-rule-closure.mjs",
    "examples/1.75-business-rule-closure/README.md",
    "examples/1.75-business-rule-closure/appointment-service-time/README.md",
    "examples/1.75-business-rule-closure/appointment-service-time/business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
    "test-fixtures/bad/bad-business-rule-authorizes-implementation/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-codex-approves-tax-decision/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-cross-platform-single-surface/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-effective-time-missing/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-exception-policy-ambiguous/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-existing-rule-conflict-ready/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-historical-data-auto-change/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-markdown-json-mismatch/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-missing-actor/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-missing-digest/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-production-verified-without-evidence/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-ready-with-blocking-decision/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-ready-with-domain-owner-pending/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-safe-default-treated-as-approval/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-tax-field-claims-tax-compliance/business-rule-closures/001-bad.md",
    "test-fixtures/bad/bad-business-rule-too-many-user-questions/business-rule-closures/001-bad.md",
    "releases/1.75.0/release-record.md",
    "releases/1.75.0/known-limitations.md",
    "releases/1.75.0/self-check-report.md",
    "releases/1.75.1/release-record.md",
    "releases/1.75.1/known-limitations.md",
    "releases/1.75.1/self-check-report.md",
    "releases/1.75.2/release-record.md",
    "releases/1.75.2/known-limitations.md",
    "releases/1.75.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.75 business rule closure asset exists ${file}`);
    else fail(`1.75 business rule closure asset missing ${file}`);
  }

  const combined = [
    read("core/business-rule-closure.md"),
    read("docs/business-rule-closure.md"),
    read("templates/business-rule-closure-card.md"),
    read("checklists/business-rule-closure-review.md"),
    read("prompts/business-rule-closure-agent.md"),
    read("schemas/artifacts/business-rule-closure.schema.json"),
    read("scripts/resolve-business-rule-closure.mjs"),
    read("scripts/check-business-rule-closure.mjs"),
    read("scripts/check-change-impact-coverage.mjs"),
    read("docs/plans/business-rule-closure-1.75-plan.md"),
    read("releases/1.75.0/release-record.md"),
    read("releases/1.75.1/release-record.md"),
    read("releases/1.75.2/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Business Rule Closure",
    "READY_FOR_IMPACT_COVERAGE",
    "NEEDS_USER_CONFIRMATION",
    "NEEDS_DOMAIN_OWNER",
    "business_rule_digest",
    "closure_digest",
    "business_rule_ref",
    "business_rule_digest",
    "business_rule_state",
    "source_request_digest",
    "safe defaults",
    "limited user questions",
    "Real-Environment Validation",
    "This closure writes target files: No",
    "This closure authorizes implementation: No",
    "This closure approves release or production: No",
    "contract, tax, finance, HR, legal",
    "generic task-communication layer",
    "require-business-rule-ready",
    "now require Change Impact Coverage machine-readable evidence",
    "generated-project smoke now write a Business Rule",
  ]) {
    if (combined.includes(marker)) pass(`1.75 business rule closure includes ${marker}`);
    else fail(`1.75 business rule closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-business-rule-closure.mjs", "examples/mvp-booking-web-app", "--intent", "appointment requests must include a service time"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Business Rule Closure")
    && resolver.stdout.includes("READY_FOR_IMPACT_COVERAGE")
    && resolver.stdout.includes("User Confirmation Card")
    && resolver.stdout.includes("No user confirmation is required")
    && resolver.stdout.includes("This closure writes target files: No")) {
    pass("1.75 business rule closure resolver prints safe appointment rule closure");
  } else {
    fail(`1.75 business rule closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-business-rule-closure.mjs", "examples/mvp-booking-web-app", "--intent", "appointment requests must include a service time", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "BUSINESS_RULE_CLOSURE"
        && parsed.structuredEvidence?.artifact_type === "business_rule_closure"
        && parsed.structuredEvidence?.business_rule_digest
        && parsed.structuredEvidence?.closure_digest
        && parsed.structuredEvidence?.can_codex_write_now === "No"
        && parsed.boundaries?.writesTargetFiles === "No") {
        pass("1.75 business rule closure resolver JSON includes structured non-authorizing evidence");
      } else {
        fail(`1.75 business rule closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.75 business rule closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.75 business rule closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-business-rule-closure.mjs", ".", "--allow-empty"]);
  if (check.status === 0 && check.stdout.includes("Business Rule Closure check passed")) {
    pass("1.75 business rule closure checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.75 business rule closure checker failed: ${check.stderr || check.stdout}`);
  }

  const strictExample = runNode([
    "scripts/check-business-rule-closure.mjs",
    "examples/1.75-business-rule-closure/appointment-service-time",
    "--require-structured-evidence",
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("Business Rule Closure check passed")) {
    pass("1.75 business rule closure strict example passes checker");
  } else {
    fail(`1.75 business rule closure strict example failed: ${strictExample.stderr || strictExample.stdout}`);
  }

  const impactWithBusinessRule = runNode([
    "scripts/resolve-change-impact-coverage.mjs",
    "examples/1.75-business-rule-closure/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
    "--json",
  ]);
  if (impactWithBusinessRule.status === 0) {
    try {
      const parsed = JSON.parse(impactWithBusinessRule.stdout);
      if (parsed.businessRuleRef === "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md"
        && parsed.businessRuleDigest === "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee"
        && parsed.businessRuleState === "READY_FOR_IMPACT_COVERAGE"
        && parsed.machineReadableEvidence?.business_rule_ref === "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md"
        && parsed.machineReadableEvidence?.business_rule_digest === "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee"
        && parsed.machineReadableEvidence?.business_rule_state === "READY_FOR_IMPACT_COVERAGE") {
        pass("1.75 business rule ref, digest, and state carry into change impact coverage");
      } else {
        fail(`1.75 business rule binding missing from change impact coverage: ${impactWithBusinessRule.stdout}`);
      }
    } catch (error) {
      fail(`1.75 business-rule-linked impact coverage JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.75 business-rule-linked impact coverage failed: ${impactWithBusinessRule.stderr || impactWithBusinessRule.stdout}`);
  }

  const bindingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-business-rule-binding-"));
  fs.mkdirSync(path.join(bindingRoot, "business-rule-closures"), { recursive: true });
  fs.mkdirSync(path.join(bindingRoot, "change-impact-coverage-reports"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.75-business-rule-closure/appointment-service-time/business-rule-closures/001-appointment-requests-must-include-a-service-time.md"),
    path.join(bindingRoot, "business-rule-closures/001-appointment-requests-must-include-a-service-time.md"),
  );
  const generatedImpact = runNode([
    "scripts/resolve-change-impact-coverage.mjs",
    bindingRoot,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
  ]);
  if (generatedImpact.status !== 0) {
    fail(`1.75 business-rule-linked impact coverage report generation failed: ${generatedImpact.stderr || generatedImpact.stdout}`);
  } else {
    fs.writeFileSync(path.join(bindingRoot, "change-impact-coverage-reports/001-appointment-service-time.md"), generatedImpact.stdout);
    const strictImpact = runNode([
      "scripts/check-change-impact-coverage.mjs",
      bindingRoot,
      "--report",
      "change-impact-coverage-reports/001-appointment-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-business-rule-ready",
    ]);
    if (strictImpact.status === 0
      && strictImpact.stdout.includes("business_rule_ref resolves")
      && strictImpact.stdout.includes("business_rule_digest matches referenced Business Rule Closure")
      && strictImpact.stdout.includes("referenced Business Rule Closure is READY_FOR_IMPACT_COVERAGE")) {
      pass("1.75 business-rule-linked Change Impact Coverage passes strict ready binding");
    } else {
      fail(`1.75 business-rule-linked Change Impact Coverage strict ready binding failed: ${strictImpact.stderr || strictImpact.stdout}`);
    }
  }

  const badFixtures = [
    "test-fixtures/bad/bad-business-rule-authorizes-implementation",
    "test-fixtures/bad/bad-business-rule-codex-approves-tax-decision",
    "test-fixtures/bad/bad-business-rule-cross-platform-single-surface",
    "test-fixtures/bad/bad-business-rule-effective-time-missing",
    "test-fixtures/bad/bad-business-rule-exception-policy-ambiguous",
    "test-fixtures/bad/bad-business-rule-existing-rule-conflict-ready",
    "test-fixtures/bad/bad-business-rule-historical-data-auto-change",
    "test-fixtures/bad/bad-business-rule-markdown-json-mismatch",
    "test-fixtures/bad/bad-business-rule-missing-actor",
    "test-fixtures/bad/bad-business-rule-missing-digest",
    "test-fixtures/bad/bad-business-rule-production-verified-without-evidence",
    "test-fixtures/bad/bad-business-rule-ready-with-blocking-decision",
    "test-fixtures/bad/bad-business-rule-ready-with-domain-owner-pending",
    "test-fixtures/bad/bad-business-rule-safe-default-treated-as-approval",
    "test-fixtures/bad/bad-business-rule-tax-field-claims-tax-compliance",
    "test-fixtures/bad/bad-business-rule-too-many-user-questions",
  ];
  for (const target of badFixtures) {
    const result = runNode(["scripts/check-business-rule-closure.mjs", target, "--require-structured-evidence"]);
    if (result.status !== 0) {
      pass(`1.75 business rule closure rejects ${target}`);
    } else {
      fail(`1.75 business rule closure must reject ${target}`);
    }
  }
}

function checkVerificationPlanGovernanceProtocol() {
  const required = [
    "core/verification-test-governance.md",
    "docs/verification-test-governance.md",
    "docs/plans/verification-test-governance-1.76-plan.md",
    "templates/verification-plan.md",
    "checklists/verification-plan-review.md",
    "prompts/verification-plan-agent.md",
    "schemas/artifacts/verification-plan.schema.json",
    "verification-plans/.gitkeep",
    "scripts/resolve-verification-plan.mjs",
    "scripts/check-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.76-verification-plan/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.76-verification-plan/appointment-service-time/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-impact-bound-to-different-business-rule/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-impact-missing-business-rule-binding/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-source-systems-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-source-systems-ref-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-source-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-identity-digest-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-surface-status-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-obligation-missing/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-outcome-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-obligation/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-source-system/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-surface/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-markdown-test-control-missing/verification-plans/001-service-time.md",
    "test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system/verification-plans/001-service-time.md",
    "releases/1.76.0/release-record.md",
    "releases/1.76.0/known-limitations.md",
    "releases/1.76.0/self-check-report.md",
    "releases/1.76.1/release-record.md",
    "releases/1.76.1/known-limitations.md",
    "releases/1.76.1/self-check-report.md",
    "releases/1.76.2/release-record.md",
    "releases/1.76.2/known-limitations.md",
    "releases/1.76.2/self-check-report.md",
    "releases/1.76.3/release-record.md",
    "releases/1.76.3/known-limitations.md",
    "releases/1.76.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.76 verification plan asset exists ${file}`);
    else fail(`1.76 verification plan asset missing ${file}`);
  }

  const combined = [
    read("core/verification-test-governance.md"),
    read("docs/verification-test-governance.md"),
    read("docs/plans/verification-test-governance-1.76-plan.md"),
    read("templates/verification-plan.md"),
    read("checklists/verification-plan-review.md"),
    read("prompts/verification-plan-agent.md"),
    read("schemas/artifacts/verification-plan.schema.json"),
    read("scripts/resolve-verification-plan.mjs"),
    read("scripts/check-verification-plan.mjs"),
    read("scripts/resolve-change-impact-coverage.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.76.0/release-record.md") ? read("releases/1.76.0/release-record.md") : "",
    exists("releases/1.76.1/release-record.md") ? read("releases/1.76.1/release-record.md") : "",
    exists("releases/1.76.2/release-record.md") ? read("releases/1.76.2/release-record.md") : "",
    exists("releases/1.76.3/release-record.md") ? read("releases/1.76.3/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Verification Plan Governance",
    "Verification And Test Governance",
    "verification_plan_digest",
    "verification_plan_ref",
    "source_systems",
    "intent_digest",
    "Test Correctness",
    "broad-command",
    "API_NEGATIVE_TEST",
    "BACKEND_RULE_TEST",
    "does not execute tests",
    "does not approve release or production",
    "verification-plan",
    "verification-plan-check",
    "--out",
    "impact report business_rule_ref matches Verification Plan",
    "checkSourceSystemsConsistency",
    "matches top-level binding",
    "checkMarkdownJsonConsistency",
    "Markdown Verification Obligations missing",
    "Markdown outcome matches structured verification_state",
    "READY source_systems",
    "Markdown Test Correctness Controls",
    "has extra row",
  ]) {
    if (combined.includes(marker)) pass(`1.76 verification plan includes ${marker}`);
    else fail(`1.76 verification plan missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Verification Plan")
    && resolver.stdout.includes("VERIFICATION_PLAN_READY")
    && resolver.stdout.includes("This plan executes tests: No")) {
    pass("1.76 verification plan resolver prints safe plan");
  } else {
    fail(`1.76 verification plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "VERIFICATION_PLAN"
        && parsed.structuredEvidence?.artifact_type === "verification_plan"
        && parsed.structuredEvidence?.verification_plan_digest
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "business_rule_closure")
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "change_impact_coverage")
        && parsed.structuredEvidence?.verification_obligations?.some((item) => item.verification_type === "API_NEGATIVE_TEST")
        && parsed.boundaries?.executes_tests === "No") {
        pass("1.76 verification plan resolver JSON includes source-bound obligations");
      } else {
        fail(`1.76 verification plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.76 verification plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.76 verification plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-verification-plan.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Verification Plan check passed")) {
    pass("1.76 verification plan checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.76 verification plan source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-verification-plan.mjs",
    "examples/1.76-verification-plan/appointment-service-time",
    "--report",
    "verification-plans/001-service-time.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Verification Plan check passed")
    && exampleCheck.stdout.includes("verification_plan_ref points to this report")
    && exampleCheck.stdout.includes("business_rule_digest matches referenced Business Rule Closure")
    && exampleCheck.stdout.includes("impact_digest matches referenced Change Impact Coverage")
    && exampleCheck.stdout.includes("API_CONTRACT includes API_NEGATIVE_TEST")) {
    pass("1.76 verification plan strict example passes checker");
  } else {
    fail(`1.76 verification plan strict example failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "verification-plan",
    "examples/1.76-verification-plan/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--impact-ref",
    "artifact:change-impact-coverage-reports/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Verification Plan")) {
    pass("CLI verification-plan delegates to resolver");
  } else {
    fail(`CLI verification-plan failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "verification-plan-check",
    "examples/1.76-verification-plan/appointment-service-time",
    "--report",
    "verification-plans/001-service-time.md",
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Verification Plan check passed")) {
    pass("CLI verification-plan-check delegates to checker");
  } else {
    fail(`CLI verification-plan-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-verification-plan-"));
  fs.mkdirSync(path.join(tempRoot, "business-rule-closures"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "change-impact-coverage-reports"), { recursive: true });
  fs.mkdirSync(path.join(tempRoot, "verification-plans"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/business-rule-closures/001-service-time.md"),
    path.join(tempRoot, "business-rule-closures/001-service-time.md"),
  );
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/change-impact-coverage-reports/001-service-time.md"),
    path.join(tempRoot, "change-impact-coverage-reports/001-service-time.md"),
  );
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time/verification-plans/001-service-time.md"),
    path.join(tempRoot, "verification-plans/001-service-time.md"),
  );

  const badCases = [
    {
      name: "missing API negative test",
      expected: "API_CONTRACT requires API_NEGATIVE_TEST",
      mutate(evidence) {
        evidence.verification_obligations = evidence.verification_obligations.filter((item) => item.verification_type !== "API_NEGATIVE_TEST");
      },
    },
    {
      name: "broad command as required business proof",
      expected: "cannot be broad-command-only",
      mutate(evidence) {
        const target = evidence.verification_obligations.find((item) => item.verification_type === "BACKEND_RULE_TEST");
        target.broad_command_only = "Yes";
        target.suggested_command = "npm test";
      },
    },
    {
      name: "task ref mismatch",
      expected: "must match Business Rule Closure task_ref",
      mutate(evidence) {
        evidence.task_ref = "tasks/001-other-task.md";
      },
    },
    {
      name: "manual verification without owner",
      expected: "needs owner",
      mutate(evidence) {
        evidence.manual_verification = [{
          id: "manual:bad",
          owner: "",
          decision_ref: "human-decision:missing-owner",
          expected_manual_evidence: "Owner evidence is required.",
          blocking: "Yes",
        }];
      },
    },
  ];

  for (const badCase of badCases) {
    const badRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-bad-verification-plan-"));
    fs.cpSync(tempRoot, badRoot, { recursive: true });
    const reportFile = path.join(badRoot, "verification-plans/001-service-time.md");
    mutateVerificationPlan(reportFile, badCase.mutate);
    const result = runNode([
      "scripts/check-verification-plan.mjs",
      badRoot,
      "--report",
      "verification-plans/001-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(badCase.expected)) {
      pass(`1.76 verification plan rejects ${badCase.name}`);
    } else {
      fail(`1.76 verification plan must reject ${badCase.name}: ${output}`);
    }
  }

  const badFixtureCases = [
    {
      target: "test-fixtures/bad/bad-verification-plan-impact-bound-to-different-business-rule",
      expected: "impact report business_rule_ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-impact-missing-business-rule-binding",
      expected: "impact report business_rule_ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-source-systems-digest-mismatch",
      expected: "source_systems business_rule_closure.digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-source-systems-ref-mismatch",
      expected: "source_systems change_impact_coverage.ref",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-source-digest-mismatch",
      expected: "Markdown source business_rule_closure digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-identity-digest-mismatch",
      expected: "Markdown identity verification_plan_digest",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-surface-status-mismatch",
      expected: "Markdown affected surface DATA_MODEL status",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-obligation-missing",
      expected: "Markdown Verification Obligations missing",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-outcome-mismatch",
      expected: "Markdown outcome",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-obligation",
      expected: "Markdown Verification Obligations has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-source-system",
      expected: "Markdown Source Systems has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-surface",
      expected: "Markdown Affected Surface Inputs has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable",
      expected: "Markdown Not Applicable Obligations has extra row",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch",
      expected: "Markdown test correctness control",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-markdown-test-control-missing",
      expected: "Markdown Test Correctness Controls missing",
    },
    {
      target: "test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system",
      expected: "READY source_systems business_rule_closure.status must be RECORDED",
    },
  ];
  for (const badCase of badFixtureCases) {
    const result = runNode([
      "scripts/check-verification-plan.mjs",
      badCase.target,
      "--report",
      "verification-plans/001-service-time.md",
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(badCase.expected)) {
      pass(`1.76 verification plan rejects ${badCase.target}`);
    } else {
      fail(`1.76 verification plan must reject ${badCase.target}: ${output}`);
    }
  }
}

function mutateVerificationPlan(reportFile, mutate) {
  const content = fs.readFileSync(reportFile, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) throw new Error(`invalid verification plan fixture ${reportFile}`);
  const evidence = structuredClone(extracted.value);
  mutate(evidence);
  evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
  const updated = content.replace(/```json\s*[\s\S]*?```/i, `\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\``);
  fs.writeFileSync(reportFile, updated);
}

function checkTestEvidenceBindingProtocol() {
  const required = [
    "core/test-evidence-binding.md",
    "docs/test-evidence-binding.md",
    "docs/plans/test-evidence-binding-1.77-plan.md",
    "docs/plans/test-evidence-identity-hardening-1.77.1-plan.md",
    "docs/plans/test-evidence-installation-schema-contract-1.77.2-plan.md",
    "templates/test-evidence-report.md",
    "checklists/test-evidence-review.md",
    "prompts/test-evidence-agent.md",
    "schemas/artifacts/test-evidence.schema.json",
    "test-evidence-reports/.gitkeep",
    "scripts/resolve-test-evidence.mjs",
    "scripts/check-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/README.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/README.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/verification-plans/001-service-time.md",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/api-contract.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/backend-rule.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/frontend-ui.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/handoff.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/evidence/user-flow.txt",
    "examples/1.77-test-evidence-binding/appointment-service-time/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-missing-verification-plan-ref/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-verification-plan-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-missing-required-obligation/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-covered-with-failed-evidence/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-covered-with-skipped-evidence/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-stale-ran-before-change/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-current-task-no/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-output-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-broad-command-only/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-manual-owner-ai/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-waiver-missing-human-decision/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-markdown-result-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-markdown-extra-coverage-row/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-source-system-digest-mismatch/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-passed-unresolved-nonartifact-ref/test-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-test-evidence-passed-missing-ref/test-evidence-reports/001-service-time.md",
    "releases/1.77.0/release-record.md",
    "releases/1.77.0/known-limitations.md",
    "releases/1.77.0/self-check-report.md",
    "releases/1.77.1/release-record.md",
    "releases/1.77.1/known-limitations.md",
    "releases/1.77.1/self-check-report.md",
    "releases/1.77.2/release-record.md",
    "releases/1.77.2/known-limitations.md",
    "releases/1.77.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.77 test evidence asset exists ${file}`);
    else fail(`1.77 test evidence asset missing ${file}`);
  }

  const combined = [
    read("core/test-evidence-binding.md"),
    read("docs/test-evidence-binding.md"),
    read("docs/plans/test-evidence-binding-1.77-plan.md"),
    read("docs/plans/test-evidence-identity-hardening-1.77.1-plan.md"),
    read("docs/plans/test-evidence-installation-schema-contract-1.77.2-plan.md"),
    read("templates/test-evidence-report.md"),
    read("checklists/test-evidence-review.md"),
    read("prompts/test-evidence-agent.md"),
    read("schemas/artifacts/test-evidence.schema.json"),
    read("scripts/resolve-test-evidence.mjs"),
    read("scripts/check-test-evidence.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.77.0/release-record.md") ? read("releases/1.77.0/release-record.md") : "",
    exists("releases/1.77.2/release-record.md") ? read("releases/1.77.2/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Test Evidence Binding",
    "Test Evidence Report",
    "test_evidence_digest",
    "test_evidence_ref",
    "verification_plan_ref",
    "verification_plan_digest",
    "coverage_map",
    "covers_obligations",
    "PASSED",
    "FAILED",
    "SKIPPED_WITH_REASON",
    "FLAKY_REQUIRES_REVIEW",
    "WAIVED_BY_HUMAN_DECISION",
    "does not execute tests",
    "does not approve release or production",
    "test-evidence",
    "test-evidence-check",
    "schemaVersion",
    "1.77.1",
    "--out",
    "--require-current-evidence",
    "--require-test-quality-controls",
    "Markdown Evidence Items",
    "output_digest matches",
    "exit_code",
    "failure_reason",
    "required Verification Plan control",
    "passed evidence",
    "Markdown coverage",
    "Markdown quality control",
    "Markdown known gap",
    "Markdown manual verification",
    "Markdown existing project reason",
    "Generated-project PR smoke",
  ]) {
    if (combined.includes(marker)) pass(`1.77 test evidence includes ${marker}`);
    else fail(`1.77 test evidence missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--evidence",
    "artifact:evidence/user-flow.txt,artifact:evidence/frontend-ui.txt,artifact:evidence/api-contract.txt,artifact:evidence/backend-rule.txt,artifact:evidence/handoff.txt",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Test Evidence Report")
    && resolver.stdout.includes("TEST_EVIDENCE_COMPLETE")
    && resolver.stdout.includes("This report executes tests: No")) {
    pass("1.77 test evidence resolver prints safe complete report");
  } else {
    fail(`1.77 test evidence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--evidence",
    "artifact:evidence/user-flow.txt,artifact:evidence/frontend-ui.txt,artifact:evidence/api-contract.txt,artifact:evidence/backend-rule.txt,artifact:evidence/handoff.txt",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "TEST_EVIDENCE_REPORT"
        && parsed.schemaVersion === "1.77.1"
        && parsed.structuredEvidence?.artifact_type === "test_evidence"
        && parsed.structuredEvidence?.schema_version === "1.77.1"
        && parsed.structuredEvidence?.test_evidence_digest
        && parsed.structuredEvidence?.evidence_items?.every((item) => item.exit_code === 0 && item.failure_reason === "not recorded")
        && parsed.structuredEvidence?.source_systems?.some((item) => item.name === "verification_plan")
        && parsed.structuredEvidence?.coverage_map?.every((item) => item.coverage_state === "COVERED")
        && parsed.boundaries?.executes_tests === "No") {
        pass("1.77 test evidence resolver JSON includes source-bound coverage");
      } else {
        fail(`1.77 test evidence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.77 test evidence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.77 test evidence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-test-evidence.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Test Evidence check passed")) {
    pass("1.77 test evidence checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.77 test evidence source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-test-evidence.mjs",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--report",
    "test-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Test Evidence check passed")
    && exampleCheck.stdout.includes("test_evidence_ref points to this report")
    && exampleCheck.stdout.includes("verification_plan_digest matches referenced Verification Plan")
    && exampleCheck.stdout.includes("TEST_EVIDENCE_COMPLETE covers every required obligation")
    && exampleCheck.stdout.includes("output_digest matches")
    && exampleCheck.stdout.includes("Markdown coverage")
    && exampleCheck.stdout.includes("reason matches structured evidence")) {
    pass("1.77 test evidence strict example passes checker");
  } else {
    fail(`1.77 test evidence strict example failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "test-evidence",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Test Evidence Report")) {
    pass("CLI test-evidence delegates to resolver");
  } else {
    fail(`CLI test-evidence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "test-evidence-check",
    "examples/1.77-test-evidence-binding/appointment-service-time",
    "--report",
    "test-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Test Evidence check passed")) {
    pass("CLI test-evidence-check delegates to checker");
  } else {
    fail(`CLI test-evidence-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const badFixtureCases = [
    ["bad-test-evidence-missing-verification-plan-ref", "verification_plan_ref is required"],
    ["bad-test-evidence-verification-plan-digest-mismatch", "verification_plan_digest"],
    ["bad-test-evidence-missing-required-obligation", "coverage_map missing required obligation"],
    ["bad-test-evidence-covered-with-failed-evidence", "cannot use FAILED"],
    ["bad-test-evidence-covered-with-skipped-evidence", "cannot use SKIPPED_WITH_REASON"],
    ["bad-test-evidence-stale-ran-before-change", "must run after change"],
    ["bad-test-evidence-current-task-no", "must match current task"],
    ["bad-test-evidence-output-digest-mismatch", "output_digest"],
    ["bad-test-evidence-broad-command-only", "cannot rely on broad command only"],
    ["bad-test-evidence-manual-owner-ai", "needs a real owner"],
    ["bad-test-evidence-waiver-missing-human-decision", "requires human-decision ref"],
    ["bad-test-evidence-markdown-result-mismatch", "Markdown evidence evidence:api-contract result"],
    ["bad-test-evidence-markdown-extra-coverage-row", "Markdown Coverage Map has extra row"],
    ["bad-test-evidence-source-system-digest-mismatch", "source_systems business_rule_closure.digest"],
    ["bad-test-evidence-passed-unresolved-nonartifact-ref", "passed evidence evidence:user-flow requires artifact ref"],
    ["bad-test-evidence-passed-missing-ref", "passed evidence evidence:user-flow requires artifact ref"],
  ];
  for (const [name, expected] of badFixtureCases) {
    const result = runNode([
      "scripts/check-test-evidence.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      "test-evidence-reports/001-service-time.md",
      "--require-structured-evidence",
      "--require-verification-plan-ref",
      "--strict-source-binding",
      "--require-current-evidence",
      "--require-test-quality-controls",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.77 test evidence rejects ${name}`);
    } else {
      fail(`1.77 test evidence must reject ${name}: ${output}`);
    }
  }
}

function checkCompletionEvidenceGateProtocol() {
  const required = [
    "core/completion-evidence-gate.md",
    "docs/completion-evidence-gate.md",
    "docs/plans/completion-evidence-gate-1.78-plan.md",
    "templates/completion-evidence-report.md",
    "checklists/completion-evidence-review.md",
    "prompts/completion-evidence-agent.md",
    "schemas/artifacts/completion-evidence.schema.json",
    "completion-evidence-reports/.gitkeep",
    "scripts/resolve-completion-evidence.mjs",
    "scripts/check-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/README.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/README.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/business-rule-closures/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/change-impact-coverage-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/verification-plans/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/test-evidence-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/execution-assurance-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/completion-evidence-reports/001-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/tasks/001-appointment-requests-must-include-a-service-time.md",
    "examples/1.78-completion-evidence-gate/appointment-service-time/review-loop-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-missing-test-evidence/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-task-mismatch/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-execution-not-verified/completion-evidence-reports/001-bad.md",
    "test-fixtures/bad/bad-completion-evidence-vp-bound-to-different-brc/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-test-evidence-bound-to-different-plan/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-ea-missing-test-evidence-ref/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-source-digest-mismatch/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-source-schema-invalid/completion-evidence-reports/001-service-time.md",
    "test-fixtures/bad/bad-completion-evidence-intent-digest-mismatch/completion-evidence-reports/001-service-time.md",
    "releases/1.78.0/release-record.md",
    "releases/1.78.0/known-limitations.md",
    "releases/1.78.0/self-check-report.md",
    "releases/1.78.1/release-record.md",
    "releases/1.78.1/known-limitations.md",
    "releases/1.78.1/self-check-report.md",
    "releases/1.78.2/release-record.md",
    "releases/1.78.2/known-limitations.md",
    "releases/1.78.2/self-check-report.md",
    "releases/1.78.3/release-record.md",
    "releases/1.78.3/known-limitations.md",
    "releases/1.78.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.78 completion evidence asset exists ${file}`);
    else fail(`1.78 completion evidence asset missing ${file}`);
  }

  const combined = [
    read("core/completion-evidence-gate.md"),
    read("docs/completion-evidence-gate.md"),
    read("docs/plans/completion-evidence-gate-1.78-plan.md"),
    read("templates/completion-evidence-report.md"),
    read("checklists/completion-evidence-review.md"),
    read("prompts/completion-evidence-agent.md"),
    read("schemas/artifacts/completion-evidence.schema.json"),
    read("scripts/resolve-completion-evidence.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.78.0/release-record.md") ? read("releases/1.78.0/release-record.md") : "",
    exists("releases/1.78.1/release-record.md") ? read("releases/1.78.1/release-record.md") : "",
    exists("releases/1.78.2/release-record.md") ? read("releases/1.78.2/release-record.md") : "",
    exists("releases/1.78.3/release-record.md") ? read("releases/1.78.3/release-record.md") : "",
  ].join("\n");

  for (const marker of [
    "Completion Evidence Gate",
    "Completion Evidence Gate Report",
    "completion_evidence_gate",
    "completion_gate_digest",
    "can_claim_complete",
    "source_chain",
    "Business Rule Closure",
    "Verification Plan",
    "Test Evidence",
    "Execution Assurance",
    "COMPLETION_EVIDENCE_READY",
    "BLOCKED_BY_TEST_EVIDENCE",
    "BLOCKED_BY_EXECUTION_ASSURANCE",
    "BLOCKED_BY_TASK_MISMATCH",
    "check:source-digest-consistency",
    "check:intent-consistency",
    "check:source-chain-binding",
    "source_chain[].intent_digest",
    "canonical task intent",
    "1.78.0 / 1.78.1 Completion Evidence reports",
    "Execution Assurance reports now expose top-level",
    "top-level `intent_digest`",
    "Execution Assurance intent directly",
    "does not run tests",
    "does not approve release or production",
    "completion-evidence",
    "completion-evidence-check",
    "--require-ready",
    "No source chain, no completion claim",
  ]) {
    if (combined.includes(marker)) pass(`1.78 completion evidence includes ${marker}`);
    else fail(`1.78 completion evidence missing ${marker}`);
  }

  const resolver = runNode([
    "scripts/resolve-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
  ]);
  if (resolver.status === 0
    && resolver.stdout.includes("Completion Evidence Gate Report")
    && resolver.stdout.includes("COMPLETION_EVIDENCE_READY")
    && resolver.stdout.includes("This report runs tests: No")) {
    pass("1.78 completion evidence resolver prints safe complete report");
  } else {
    fail(`1.78 completion evidence resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode([
    "scripts/resolve-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
    "--json",
  ]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "COMPLETION_EVIDENCE_GATE"
        && parsed.schemaVersion === "1.78.0"
        && parsed.structuredEvidence?.artifact_type === "completion_evidence_gate"
        && parsed.structuredEvidence?.completion_state === "COMPLETION_EVIDENCE_READY"
        && parsed.structuredEvidence?.can_claim_complete === "Yes"
        && parsed.structuredEvidence?.source_chain?.length === 4
        && parsed.structuredEvidence?.source_chain?.every((item) => typeof item.intent_digest === "string" && item.intent_digest.startsWith("sha256:"))
        && parsed.structuredEvidence?.gate_checks?.every((item) => item.status === "PASS")
        && parsed.structuredEvidence?.boundary?.runs_tests === "No") {
        pass("1.78 completion evidence resolver JSON includes ready source chain");
      } else {
        fail(`1.78 completion evidence resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.78 completion evidence resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.78 completion evidence resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-completion-evidence.mjs", ".", "--allow-empty"]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("Completion Evidence Gate check passed")) {
    pass("1.78 completion evidence checker passes source repo with explicit empty allowance");
  } else {
    fail(`1.78 completion evidence source checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const exampleCheck = runNode([
    "scripts/check-completion-evidence.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--report",
    "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ]);
  if (exampleCheck.status === 0
    && exampleCheck.stdout.includes("Completion Evidence Gate check passed")
    && exampleCheck.stdout.includes("completion_evidence_ref points to this report")
    && exampleCheck.stdout.includes("ready gate can claim complete")
    && exampleCheck.stdout.includes("source test_evidence outcome matches referenced evidence")
    && exampleCheck.stdout.includes("source execution_assurance outcome matches referenced evidence")) {
    pass("1.78 completion evidence strict example passes checker");
  } else {
    fail(`1.78 completion evidence strict example failed: ${exampleCheck.stderr || exampleCheck.stdout}`);
  }

  const cliResolver = runNode([
    "scripts/cli.mjs",
    "completion-evidence",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    "artifact:business-rule-closures/001-service-time.md",
    "--verification-plan-ref",
    "artifact:verification-plans/001-service-time.md",
    "--test-evidence-ref",
    "artifact:test-evidence-reports/001-service-time.md",
    "--execution-assurance-ref",
    "artifact:execution-assurance-reports/001-service-time.md",
  ]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("Completion Evidence Gate Report")) {
    pass("CLI completion-evidence delegates to resolver");
  } else {
    fail(`CLI completion-evidence failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const cliCheck = runNode([
    "scripts/cli.mjs",
    "completion-evidence-check",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--report",
    "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("Completion Evidence Gate check passed")) {
    pass("CLI completion-evidence-check delegates to checker");
  } else {
    fail(`CLI completion-evidence-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const badFixtureCases = [
    ["bad-completion-evidence-missing-test-evidence", "ready gate requires recorded ready source test_evidence", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-task-mismatch", "source chain task refs must be consistent", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-execution-not-verified", "ready gate requires recorded ready source execution_assurance", "completion-evidence-reports/001-bad.md"],
    ["bad-completion-evidence-vp-bound-to-different-brc", "Verification Plan business_rule_ref", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-test-evidence-bound-to-different-plan", "Test Evidence verification_plan_ref", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-ea-missing-test-evidence-ref", "Execution Assurance must bind referenced Test Evidence", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-source-digest-mismatch", "source test_evidence digest", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-source-schema-invalid", "source business_rule_closure.artifact_type", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-intent-digest-mismatch", "source verification_plan intent_digest", "completion-evidence-reports/001-service-time.md"],
    ["bad-completion-evidence-ea-intent-digest-mismatch", "source execution_assurance intent_digest", "completion-evidence-reports/001-service-time.md"],
  ];
  for (const [name, expected, report] of badFixtureCases) {
    const result = runNode([
      "scripts/check-completion-evidence.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      "--require-ready",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.78 completion evidence rejects ${name}`);
    } else {
      fail(`1.78 completion evidence must reject ${name}: ${output}`);
    }
  }

  const completionPackage = JSON.parse(read("package.json"));
  const completionVerifySurface = Object.entries(completionPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-completion-evidence.mjs",
    "node --check scripts/check-completion-evidence.mjs",
    "node scripts/cli.mjs completion-evidence . --intent \"verify task completion\"",
    "node scripts/cli.mjs completion-evidence-check . --allow-empty",
    "node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready",
  ]) {
    if (completionVerifySurface.includes(marker)) pass(`1.78 package verify includes ${marker}`);
    else fail(`1.78 package verify missing ${marker}`);
  }
}

function checkReleaseEvidenceGateProtocol() {
  const required = [
    "core/release-evidence-gate.md",
    "docs/release-evidence-gate.md",
    "docs/plans/release-evidence-gate-1.80-plan.md",
    "docs/plans/release-owner-completion-set-binding-1.80.3-plan.md",
    "templates/release-evidence-gate-report.md",
    "checklists/release-evidence-gate-review.md",
    "prompts/release-evidence-gate-agent.md",
    "schemas/artifacts/release-evidence-gate.schema.json",
    "release-evidence-gate-reports/.gitkeep",
    "release-candidates/.gitkeep",
    "scripts/resolve-release-evidence-gate.mjs",
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/README.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/release-evidence-gate-reports/001-web-preview.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/completion-evidence-reports/001-web-preview-completion.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/completion-evidence-reports/002-web-preview-completion.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/business-rule-closures/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/verification-plans/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/test-evidence-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/execution-assurance-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/evidence/preview-build.txt",
    "examples/1.80-release-evidence-gate/web-preview-handoff/evidence/runtime-smoke.txt",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/release-evidence-gate-reports/001-mini-program-review.md",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/completion-evidence-reports/001-mini-program-completion.md",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked/release-evidence-gate-reports/001-admin-production-blocked.md",
    "test-fixtures/bad/bad-release-evidence-release-approved-claim/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-no-release-owner/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-missing-rollback-production/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-source-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-unresolved/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-build-artifact-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-markdown-json-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-completion-evidence-strict-check-fails/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-second-completion-unchecked/release-evidence-gate-reports/001-web-preview.md",
    "test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope/release-evidence-gate-reports/001-web-preview.md",
    "test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref/release-evidence-gate-reports/001-mini-program-review.md",
    "test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved/release-evidence-gate-reports/001-web-preview.md",
    "releases/1.80.0/release-record.md",
    "releases/1.80.0/known-limitations.md",
    "releases/1.80.0/self-check-report.md",
    "releases/1.80.1/release-record.md",
    "releases/1.80.1/known-limitations.md",
    "releases/1.80.1/self-check-report.md",
    "releases/1.80.2/release-record.md",
    "releases/1.80.2/known-limitations.md",
    "releases/1.80.2/self-check-report.md",
    "releases/1.80.3/release-record.md",
    "releases/1.80.3/known-limitations.md",
    "releases/1.80.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.80 release evidence gate asset exists ${file}`);
    else fail(`1.80 release evidence gate asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("docs/README.md"),
    read("docs/index.md"),
    read("core/release-evidence-gate.md"),
    read("docs/release-evidence-gate.md"),
    read("docs/plans/release-evidence-gate-1.80-plan.md"),
    read("docs/plans/release-owner-completion-set-binding-1.80.3-plan.md"),
    read("templates/release-evidence-gate-report.md"),
    read("checklists/release-evidence-gate-review.md"),
    read("prompts/release-evidence-gate-agent.md"),
    read("schemas/artifacts/release-evidence-gate.schema.json"),
    read("scripts/resolve-release-evidence-gate.mjs"),
    read("scripts/check-release-evidence-gate.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.80.1/release-record.md") ? read("releases/1.80.1/release-record.md") : "",
  ].join("\n");
  for (const marker of [
    "Release Evidence Gate",
    "release_evidence_gate",
    "release-evidence",
    "release-evidence-check",
    "Completion Evidence strict checker",
    "source_chain",
    "build_artifact_digest",
    "runtime_smoke_digest",
    "rollback_digest",
    "monitoring_digest",
    "completion_evidence_set",
    "owner_readiness",
    "Completion Evidence Set",
    "Release Owner Ref",
    "Risk Owner Ref",
    "Environment Owner Ref",
    "Markdown/JSON",
    "runtime_smoke_ref",
    "human release owner",
    "not release approval",
    "does not deploy",
    "does not submit app-store or mini-program review",
    "User Delivery Console is not a source authority",
  ]) {
    if (combined.includes(marker)) pass(`1.80 release evidence includes ${marker}`);
    else fail(`1.80 release evidence missing ${marker}`);
  }

  const web = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/web-preview-handoff",
    "--require-structured-evidence",
    "--require-current-completion",
    "--strict-source-binding",
  ]);
  if (web.status === 0
    && web.stdout.includes("Completion Evidence set count matches release scope")
    && web.stdout.includes("Completion Evidence set artifact:completion-evidence-reports/001-web-preview-completion.md strict checker passed")
    && web.stdout.includes("Completion Evidence set artifact:completion-evidence-reports/002-web-preview-completion.md strict checker passed")
    && web.stdout.includes("source completion_evidence digest matches resolved artifact")
    && web.stdout.includes("required evidence build-or-preview-evidence digest matches resolved artifact")
    && web.stdout.includes("required evidence runtime-smoke digest matches resolved artifact")
    && web.stdout.includes("Release Scope Build Artifact Digest matches structured evidence")) {
    pass("1.80 release evidence strict web preview example passes checker");
  } else {
    fail(`1.80 release evidence strict web preview example failed: ${web.stderr || web.stdout}`);
  }

  const mini = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff",
    "--require-structured-evidence",
    "--require-platform-recipe",
  ]);
  if (mini.status === 0
    && mini.stdout.includes("required source release_handoff_pack digest matches resolved artifact")
    && mini.stdout.includes("required source platform_release_recipe digest matches resolved artifact")
    && mini.stdout.includes("production-like target has rollback evidence")
    && mini.stdout.includes("production-like target has concrete risk owner ref")
    && mini.stdout.includes("production-like target has concrete environment owner ref")) {
    pass("1.80 release evidence mini-program handoff example passes checker");
  } else {
    fail(`1.80 release evidence mini-program example failed: ${mini.stderr || mini.stdout}`);
  }

  const blocked = runNode([
    "scripts/check-release-evidence-gate.mjs",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked",
    "--require-structured-evidence",
  ]);
  if (blocked.status === 0 && blocked.stdout.includes("blocked production-like report records missing rollback")) {
    pass("1.80 release evidence blocked production example stays non-ready");
  } else {
    fail(`1.80 release evidence blocked production example failed: ${blocked.stderr || blocked.stdout}`);
  }

  const badFixtureCases = [
    ["bad-release-evidence-release-approved-claim", "release-evidence-gate-reports/001-bad.md", "contains forbidden release evidence claim", []],
    ["bad-release-evidence-no-release-owner", "release-evidence-gate-reports/001-bad.md", "release-evidence-gate-reports/001-bad.md.intent is required", []],
    ["bad-release-evidence-missing-rollback-production", "release-evidence-gate-reports/001-bad.md", "required evidence rollback must record artifact ref", []],
    ["bad-release-evidence-user-note-treated-as-smoke", "release-evidence-gate-reports/001-bad.md", "release-evidence-gate-reports/001-bad.md.runtime_readiness.runtime_smoke_ref is required", []],
    ["bad-release-evidence-source-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "source completion_evidence digest", ["--strict-source-binding"]],
    ["bad-release-evidence-runtime-smoke-unresolved", "release-evidence-gate-reports/001-bad.md", "required evidence runtime-smoke does not resolve", ["--strict-source-binding"]],
    ["bad-release-evidence-build-artifact-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "required evidence build-or-preview-evidence digest", ["--strict-source-binding"]],
    ["bad-release-evidence-runtime-smoke-digest-mismatch", "release-evidence-gate-reports/001-bad.md", "required evidence runtime-smoke digest", ["--strict-source-binding"]],
    ["bad-release-evidence-markdown-json-mismatch", "release-evidence-gate-reports/001-bad.md", "Release Scope Build Artifact", ["--strict-source-binding"]],
    ["bad-release-evidence-completion-evidence-strict-check-fails", "release-evidence-gate-reports/001-bad.md", "Completion Evidence set artifact:completion-evidence-reports/001-web-preview-completion.md strict checker failed", ["--require-current-completion", "--strict-source-binding"]],
    ["bad-release-evidence-second-completion-unchecked", "release-evidence-gate-reports/001-web-preview.md", "Completion Evidence set must record strict check PASS", ["--strict-source-binding"]],
    ["bad-release-evidence-completion-task-not-in-release-scope", "release-evidence-gate-reports/001-web-preview.md", "Completion Evidence task must be included in release scope", ["--strict-source-binding"]],
    ["bad-release-evidence-production-without-risk-owner-ref", "release-evidence-gate-reports/001-mini-program-review.md", "production-like target requires concrete risk owner ref", ["--require-platform-recipe"]],
    ["bad-release-evidence-approval-ref-implies-release-approved", "release-evidence-gate-reports/001-web-preview.md", "release approval ref must be out_of_scope, pending, or human-decision:* without approving release", []],
  ];
  for (const [name, report, expected, extra] of badFixtureCases) {
    const result = runNode([
      "scripts/check-release-evidence-gate.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      ...extra,
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.80 release evidence rejects ${name}`);
    } else {
      fail(`1.80 release evidence must reject ${name}: ${output}`);
    }
  }

  const releasePackage = JSON.parse(read("package.json"));
  const releaseVerifySurface = Object.entries(releasePackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-release-evidence-gate.mjs",
    "node --check scripts/check-release-evidence-gate.mjs",
    "node scripts/cli.mjs release-evidence . --intent \"prepare release review\"",
    "node scripts/cli.mjs release-evidence-check . --allow-empty",
    "node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding",
  ]) {
    if (releaseVerifySurface.includes(marker)) pass(`1.80 package verify includes ${marker}`);
    else fail(`1.80 package verify missing ${marker}`);
  }
}

function checkReleaseChannelDecouplingProtocol() {
  const required = [
    "core/release-channel-decoupling.md",
    "docs/release-channel-decoupling.md",
    "docs/plans/release-channel-decoupling-1.87-plan.md",
    "templates/release-channel-policy-report.md",
    "checklists/release-channel-policy-review.md",
    "prompts/release-channel-policy-agent.md",
    "schemas/artifacts/release-channel-policy.schema.json",
    "release-channel-policies/.gitkeep",
    "scripts/resolve-release-channel-policy.mjs",
    "scripts/check-release-channel-policy.mjs",
    "examples/1.87-release-channel-decoupling/README.md",
    "examples/1.87-release-channel-decoupling/new-project-source-only/release-channel-policies/001-source-only.md",
    "examples/1.87-release-channel-decoupling/existing-provider-release-sop/release-channel-policies/001-provider-sop.md",
    "examples/1.87-release-channel-decoupling/github-release-assets-review-needed/release-channel-policies/001-github-release-assets.md",
    "examples/1.87-release-channel-decoupling/actions-artifact-package-blocked/release-channel-policies/001-actions-artifact-blocked.md",
    "examples/1.87-release-channel-decoupling/tag-source-identity-only/release-channel-policies/001-tag-identity-only.md",
    "examples/1.87-release-channel-decoupling/strict-source-binding/docs/release-sop.md",
    "examples/1.87-release-channel-decoupling/strict-source-binding/release-channel-policies/001-strict-source-binding.md",
    "test-fixtures/bad/bad-release-channel-github-release-auto-approved/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-actions-artifact-long-lived/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-tag-push-production/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-missing-cost-owner/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-deletes-evidence/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-technical-user-burden/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-source-release-confusion/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-notes-only-release-workflow/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-github-source-only-conflict/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-provider-owner-missing/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-package-identity-unknown/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-source-digest-mismatch/docs/release-sop.md",
    "test-fixtures/bad/bad-release-channel-source-digest-mismatch/release-channel-policies/001-bad.md",
    "test-fixtures/bad/bad-release-channel-required-source-missing/release-channel-policies/001-bad.md",
    "releases/1.87.0/release-record.md",
    "releases/1.87.0/known-limitations.md",
    "releases/1.87.0/self-check-report.md",
    "releases/1.87.1/release-record.md",
    "releases/1.87.1/known-limitations.md",
    "releases/1.87.1/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.87 release channel asset exists ${file}`);
    else fail(`1.87 release channel asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("VERSION.md"),
    read("core/release-channel-decoupling.md"),
    read("docs/release-channel-decoupling.md"),
    read("docs/plans/release-channel-decoupling-1.87-plan.md"),
    read("templates/release-channel-policy-report.md"),
    read("checklists/release-channel-policy-review.md"),
    read("prompts/release-channel-policy-agent.md"),
    read("schemas/artifacts/release-channel-policy.schema.json"),
    read("scripts/resolve-release-channel-policy.mjs"),
    read("scripts/check-release-channel-policy.mjs"),
    read("scripts/cli.mjs"),
    exists("releases/1.87.0/release-record.md") ? read("releases/1.87.0/release-record.md") : "",
    exists("releases/1.87.1/release-record.md") ? read("releases/1.87.1/release-record.md") : "",
  ].join("\n");
  for (const marker of [
    "Release Channel Decoupling",
    "release_channel_policy",
    "release-channel",
    "release-channel-check",
    "source identity",
    "GitHub source and evidence",
    "GitHub Release Policy",
    "GitHub Actions Policy",
    "GitHub Release assets",
    "Actions artifacts",
    "tag-triggered release workflow",
    "release package identity",
    "cost owner",
    "retention policy",
    "strict-source-binding",
    "source_digest",
    "release_owner_required_for_policy",
    "does not approve release",
    "does not execute release",
    "does not upload GitHub Release assets",
    "does not run GitHub-hosted release workflows",
    "does not delete artifacts",
  ]) {
    if (combined.includes(marker)) pass(`1.87 release channel includes ${marker}`);
    else fail(`1.87 release channel missing ${marker}`);
  }

  const examples = [
    ["new-project-source-only", "release-channel-policies/001-source-only.md", []],
    ["existing-provider-release-sop", "release-channel-policies/001-provider-sop.md", []],
    ["github-release-assets-review-needed", "release-channel-policies/001-github-release-assets.md", []],
    ["actions-artifact-package-blocked", "release-channel-policies/001-actions-artifact-blocked.md", []],
    ["tag-source-identity-only", "release-channel-policies/001-tag-identity-only.md", []],
    ["strict-source-binding", "release-channel-policies/001-strict-source-binding.md", ["--strict-source-binding"]],
  ];
  for (const [name, report, extra] of examples) {
    const result = runNode([
      "scripts/check-release-channel-policy.mjs",
      `examples/1.87-release-channel-decoupling/${name}`,
      "--report",
      report,
      "--require-structured-evidence",
      ...extra,
    ]);
    if (result.status === 0 && result.stdout.includes("has valid structured evidence")) {
      pass(`1.87 release channel example ${name} passes checker`);
    } else {
      fail(`1.87 release channel example ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const badFixtureCases = [
    ["bad-release-channel-github-release-auto-approved", "GitHub Release assets require release owner policy"],
    ["bad-release-channel-actions-artifact-long-lived", "Actions artifact release package requires retention policy"],
    ["bad-release-channel-tag-push-production", "tag-triggered release workflow requires release owner evidence"],
    ["bad-release-channel-missing-cost-owner", "cost-risk channel must have cost owner or block release review"],
    ["bad-release-channel-deletes-evidence", "release evidence must not be deleted to reduce bundle"],
    ["bad-release-channel-technical-user-burden", "plain summary must not ask user to choose technical release channel primitives"],
    ["bad-release-channel-source-release-confusion", "cannot claim GitHub source/evidence-only while release assets are uploaded"],
    ["bad-release-channel-notes-only-release-workflow", "notes-only GitHub Release with on: release workflow requires release owner review"],
    ["bad-release-channel-github-source-only-conflict", "cannot claim GitHub source/evidence-only while release assets are uploaded"],
    ["bad-release-channel-provider-owner-missing", "provider_direct_deploy requires release owner or blocked state"],
    ["bad-release-channel-package-identity-unknown", "release package channel requires package identity before ready state", []],
    ["bad-release-channel-source-digest-mismatch", "source project_sop digest mismatch", ["--strict-source-binding"]],
    ["bad-release-channel-required-source-missing", "strict source binding requires project_sop with resolved ref", ["--strict-source-binding"]],
  ];
  for (const [name, expected, extra = []] of badFixtureCases) {
    const result = runNode([
      "scripts/check-release-channel-policy.mjs",
      `test-fixtures/bad/${name}`,
      "--report",
      "release-channel-policies/001-bad.md",
      "--require-structured-evidence",
      ...extra,
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.87 release channel rejects ${name}`);
    } else {
      fail(`1.87 release channel must reject ${name}: ${output}`);
    }
  }

  const releaseChannelPackage = JSON.parse(read("package.json"));
  const releaseChannelVerifySurface = Object.entries(releaseChannelPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-release-channel-policy.mjs",
    "node --check scripts/check-release-channel-policy.mjs",
    "node scripts/cli.mjs release-channel . --intent \"decide release channel policy\"",
    "node scripts/cli.mjs release-channel-check . --allow-empty",
    "node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/new-project-source-only --require-structured-evidence",
    "node scripts/check-release-channel-policy.mjs examples/1.87-release-channel-decoupling/strict-source-binding --require-structured-evidence --strict-source-binding",
  ]) {
    if (releaseChannelVerifySurface.includes(marker)) pass(`1.87 package verify includes ${marker}`);
    else fail(`1.87 package verify missing ${marker}`);
  }
}

function checkPlanReviewGateProtocol() {
  const required = [
    "core/plan-review-gate.md",
    "docs/plan-review-gate.md",
    "docs/plans/plan-review-gate-1.88-plan.md",
    "docs/plans/plan-review-gate-hardening-1.88.1-plan.md",
    "docs/plans/plan-review-consumer-integration-1.88.2-plan.md",
    "docs/plans/plan-review-binding-hardening-1.88.3-plan.md",
    "templates/plan-review-report.md",
    "checklists/plan-review-gate-review.md",
    "prompts/plan-review-gate-agent.md",
    "schemas/artifacts/plan-review.schema.json",
    "plan-review-reports/.gitkeep",
    "scripts/resolve-plan-review.mjs",
    "scripts/check-plan-review.mjs",
    "scripts/lib/plan-review-binding.mjs",
    "examples/1.88-plan-review-gate/README.md",
    "examples/1.88-plan-review-gate/low-docs-plan-skip/plan-review-reports/001-low-skip.md",
    "examples/1.88-plan-review-gate/medium-ui-plan-reviewed/docs/example-plan.md",
    "examples/1.88-plan-review-gate/medium-ui-plan-reviewed/plan-review-reports/001-medium-ui.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-revision/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-revision/plan-review-reports/001-revision.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-passed/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-permission-delete-plan-passed/plan-review-reports/001-passed.md",
    "examples/1.88-plan-review-gate/high-business-rule-plan-stale/docs/example-plan.md",
    "examples/1.88-plan-review-gate/high-business-rule-plan-stale/plan-review-reports/001-stale.md",
    "examples/1.88-plan-review-consumer-integration/README.md",
    "examples/1.88-plan-review-consumer-integration/high-execution-assurance/execution-assurance-reports/001-plan-reviewed.md",
    "examples/1.88-plan-review-consumer-integration/completion-evidence-plan-reviewed/completion-evidence-reports/001-service-time.md",
    "examples/1.88-plan-review-consumer-integration/apply-readiness-plan-reviewed/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-plan-review-high-without-task-governance/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-high-without-review-surface-analysis/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-review-surface-matrix/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-required-surface-not-reviewed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-authorizes-implementation/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-passed-without-prerequisite-satisfied/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-passed-claims-full-authority/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-unresolved-p1-passed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-unstructured-p2-acceptance/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-codex-accepted-p2/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-output-treated-as-authority/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-writer-used-for-review/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-left-running/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-source-chain/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-source-chain-digest-mismatch/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-source-chain-contradiction/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-fake-test-command/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-claims-test-executed/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-stale-plan-digest/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-rewrites-original-plan/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-repeated-failure-not-blocked/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-technical-user-burden/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-derived-surface-pass/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-missing-source-verification/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-plan-review-subagent-fallback-pass/plan-review-reports/001-bad.md",
    "test-fixtures/bad/bad-execution-assurance-missing-plan-review-binding/execution-assurance-reports/001-plan-reviewed.md",
    "test-fixtures/bad/bad-completion-evidence-missing-plan-review-binding/completion-evidence-reports/001-possible-high-blocked.md",
    "test-fixtures/bad/bad-controlled-apply-plan-review-not-passed/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-execution-assurance-plan-review-digest-drift/execution-assurance-reports/001-plan-reviewed.md",
    "test-fixtures/bad/bad-controlled-apply-plan-review-other-plan/apply-readiness-reports/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-completion-evidence-plan-review-for-other-task/completion-evidence-reports/001-service-time.md",
    "releases/1.88.0/release-record.md",
    "releases/1.88.0/known-limitations.md",
    "releases/1.88.0/self-check-report.md",
    "releases/1.88.1/release-record.md",
    "releases/1.88.1/known-limitations.md",
    "releases/1.88.1/self-check-report.md",
    "releases/1.88.2/release-record.md",
    "releases/1.88.2/known-limitations.md",
    "releases/1.88.2/self-check-report.md",
    "releases/1.88.3/release-record.md",
    "releases/1.88.3/known-limitations.md",
    "releases/1.88.3/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.88 plan review asset exists ${file}`);
    else fail(`1.88 plan review asset missing ${file}`);
  }

  const combined = [
    read("README.md"),
    read("README.zh-CN.md"),
    read("VERSION.md"),
    read("core/plan-review-gate.md"),
    read("docs/plan-review-gate.md"),
    read("docs/plans/plan-review-gate-1.88-plan.md"),
    read("docs/plans/plan-review-gate-hardening-1.88.1-plan.md"),
    read("docs/plans/plan-review-consumer-integration-1.88.2-plan.md"),
    read("docs/plans/plan-review-binding-hardening-1.88.3-plan.md"),
    read("templates/plan-review-report.md"),
    read("templates/execution-assurance-report.md"),
    read("templates/completion-evidence-report.md"),
    read("templates/controlled-apply-readiness-report.md"),
    read("checklists/plan-review-gate-review.md"),
    read("prompts/plan-review-gate-agent.md"),
    read("schemas/artifacts/plan-review.schema.json"),
    read("schemas/artifacts/execution-assurance.schema.json"),
    read("schemas/artifacts/completion-evidence.schema.json"),
    read("schemas/artifacts/controlled-apply-readiness.schema.json"),
    read("scripts/resolve-plan-review.mjs"),
    read("scripts/check-plan-review.mjs"),
    read("scripts/lib/plan-review-binding.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("scripts/cli.mjs"),
    read("releases/1.88.0/release-record.md"),
    read("releases/1.88.1/release-record.md"),
    read("releases/1.88.2/release-record.md"),
    read("releases/1.88.3/release-record.md"),
  ].join("\n");
  for (const marker of [
    "Plan Review Gate",
    "plan_review",
    "plan-review",
    "plan-review-check",
    "PLAN_REVIEW_PASSED",
    "NO_PLAN_REQUIRED",
    "PLAN_REVISION_REQUIRED",
    "Task Governance remains the source of truth",
    "Review Surface Governance remains the source of truth",
    "derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED",
    "Review Surface authority",
    "pre-implementation plan-review prerequisite",
    "does not authorize implementation",
    "does not execute tests",
    "commands_executed_by_this_report",
    "subagent_output_is_authority",
    "PLAN_REVIEW_PASSED cannot use fallback as substitute",
    "rewrites_original_plan",
    "plan_review_binding",
    "--require-plan-review",
    "Plan Review Consumer Integration",
    "Plan Review Binding Hardening",
    "referenced Plan Review schema and digest are valid",
    "must match plan_review_binding.plan_ref",
    "required plan review must be PLAN_REVIEW_PASSED",
  ]) {
    if (combined.includes(marker)) pass(`1.88 plan review includes ${marker}`);
    else fail(`1.88 plan review missing ${marker}`);
  }

  const examples = [
    "low-docs-plan-skip",
    "medium-ui-plan-reviewed",
    "high-permission-delete-plan-revision",
    "high-permission-delete-plan-passed",
    "high-business-rule-plan-stale",
  ];
  for (const name of examples) {
    const result = runNode([
      "scripts/check-plan-review.mjs",
      `examples/1.88-plan-review-gate/${name}`,
      "--require-structured-evidence",
    ]);
    if (result.status === 0 && result.stdout.includes("Plan review check passed")) {
      pass(`1.88 plan review example ${name} passes checker`);
    } else {
      fail(`1.88 plan review example ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const consumerExamples = [
    ["execution assurance consumer", ["scripts/check-execution-assurance.mjs", "examples/1.88-plan-review-consumer-integration/high-execution-assurance", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence"], "Execution assurance check passed"],
    ["completion evidence consumer", ["scripts/check-completion-evidence.mjs", "examples/1.88-plan-review-consumer-integration/completion-evidence-plan-reviewed", "--report", "completion-evidence-reports/001-service-time.md", "--require-structured-evidence", "--require-source-refs", "--require-ready", "--require-plan-review"], "Completion Evidence Gate check passed"],
    ["controlled apply readiness consumer", ["scripts/check-controlled-apply-readiness.mjs", "examples/1.88-plan-review-consumer-integration/apply-readiness-plan-reviewed", "--require-structured-evidence", "--require-plan-review"], "Controlled Apply Readiness check passed"],
  ];
  for (const [name, command, expected] of consumerExamples) {
    const result = runNode(command);
    if (result.status === 0 && result.stdout.includes(expected)) {
      pass(`1.88.2 plan review ${name} passes strict consumer checker`);
    } else {
      fail(`1.88.2 plan review ${name} failed: ${result.stderr || result.stdout}`);
    }
  }

  const badFixtureCases = [
    ["bad-plan-review-high-without-task-governance", "high-impact review requires Task Governance ref"],
    ["bad-plan-review-high-without-review-surface-analysis", "high-impact review requires review surface analysis"],
    ["bad-plan-review-missing-review-surface-matrix", "high-impact review requires review surface matrix"],
    ["bad-plan-review-required-surface-not-reviewed", "required surface not reviewed"],
    ["bad-plan-review-authorizes-implementation", "implementation_authorized_by_this_report must be No"],
    ["bad-plan-review-passed-without-prerequisite-satisfied", "PLAN_REVIEW_PASSED requires pre_implementation_review_prerequisite_satisfied Yes"],
    ["bad-plan-review-passed-claims-full-authority", "PLAN_REVIEW_PASSED must not claim full implementation authority"],
    ["bad-plan-review-unresolved-p1-passed", "PLAN_REVIEW_PASSED has unresolved P0/P1 findings"],
    ["bad-plan-review-unstructured-p2-acceptance", "acceptance is not structured owner acceptance"],
    ["bad-plan-review-codex-accepted-p2", "Codex cannot accept blocking P2"],
    ["bad-plan-review-subagent-output-treated-as-authority", "subagent output must not be authority"],
    ["bad-plan-review-subagent-writer-used-for-review", "must not use writer subagent"],
    ["bad-plan-review-subagent-left-running", "cannot leave recommended subagent review unknown"],
    ["bad-plan-review-missing-source-chain", "high-impact PLAN_REVIEW_PASSED requires source chain"],
    ["bad-plan-review-source-chain-digest-mismatch", "digest mismatch sentinel is blocked"],
    ["bad-plan-review-source-chain-contradiction", "contradicts plan"],
    ["bad-plan-review-fake-test-command", "PLAN_REVIEW_PASSED cannot contain fake or unstable verification command"],
    ["bad-plan-review-claims-test-executed", "plan review must not claim tests were executed"],
    ["bad-plan-review-stale-plan-digest", "plan_digest does not match plan file"],
    ["bad-plan-review-rewrites-original-plan", "review loop must not rewrite original plan"],
    ["bad-plan-review-repeated-failure-not-blocked", "repeated plan review failure must be blocked after max rounds"],
    ["bad-plan-review-technical-user-burden", "user-facing text exposes technical workflow burden"],
    ["bad-plan-review-derived-surface-pass", "derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED"],
    ["bad-plan-review-missing-source-verification", "requires source_chain kind verification_plan"],
    ["bad-plan-review-subagent-fallback-pass", "cannot use fallback as substitute"],
  ];
  for (const [name, expected] of badFixtureCases) {
    const result = runNode([
      "scripts/check-plan-review.mjs",
      `test-fixtures/bad/${name}`,
      "--require-structured-evidence",
    ]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.88 plan review rejects ${name}`);
    } else {
      fail(`1.88 plan review must reject ${name}: ${output}`);
    }
  }

  const badConsumerCases = [
    ["bad-execution-assurance-missing-plan-review-binding", ["scripts/check-execution-assurance.mjs", "test-fixtures/bad/bad-execution-assurance-missing-plan-review-binding", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence"], "requires plan_review_binding"],
    ["bad-completion-evidence-missing-plan-review-binding", ["scripts/check-completion-evidence.mjs", "test-fixtures/bad/bad-completion-evidence-missing-plan-review-binding", "--report", "completion-evidence-reports/001-possible-high-blocked.md", "--require-structured-evidence", "--require-plan-review"], "requires plan_review_binding"],
    ["bad-controlled-apply-plan-review-not-passed", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-plan-review-not-passed", "--require-structured-evidence", "--require-plan-review"], "required plan review must be PLAN_REVIEW_PASSED"],
    ["bad-execution-assurance-plan-review-digest-drift", ["scripts/check-execution-assurance.mjs", "test-fixtures/bad/bad-execution-assurance-plan-review-digest-drift", "--require-structured-evidence", "--require-plan-review", "--require-actual-diff", "--require-precise-evidence"], "plan_review_digest does not match canonical evidence digest"],
    ["bad-controlled-apply-plan-review-other-plan", ["scripts/check-controlled-apply-readiness.mjs", "test-fixtures/bad/bad-controlled-apply-plan-review-other-plan", "--require-structured-evidence", "--require-plan-review"], "must match plan_review_binding.plan_ref"],
    ["bad-completion-evidence-plan-review-for-other-task", ["scripts/check-completion-evidence.mjs", "test-fixtures/bad/bad-completion-evidence-plan-review-for-other-task", "--report", "completion-evidence-reports/001-service-time.md", "--require-structured-evidence", "--require-source-refs", "--require-ready", "--require-plan-review"], "Completion Evidence plan_review_binding task_ref"],
  ];
  for (const [name, command, expected] of badConsumerCases) {
    const result = runNode(command);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.88.2 plan review consumer rejects ${name}`);
    } else {
      fail(`1.88.2 plan review consumer must reject ${name}: ${output}`);
    }
  }

  const planReviewPackage = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(planReviewPackage.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-plan-review.mjs",
    "node --check scripts/check-plan-review.mjs",
    "node --check scripts/lib/plan-review-binding.mjs",
    "node scripts/cli.mjs plan-review . --intent \"review implementation plan before coding\"",
    "node scripts/cli.mjs plan-review-check . --allow-empty",
    "node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-passed --require-structured-evidence",
    "node scripts/check-execution-assurance.mjs examples/1.88-plan-review-consumer-integration/high-execution-assurance --require-structured-evidence --require-plan-review --require-actual-diff --require-precise-evidence",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.88 package verify includes ${marker}`);
    else fail(`1.88 package verify missing ${marker}`);
  }
}

function checkSafetyEvidenceHardeningProtocol() {
  const required = [
    "docs/plans/safety-evidence-hardening-1.89-plan.md",
    "scripts/lib/path-safety.mjs",
    "scripts/lib/approval-record-validation.mjs",
    "scripts/lib/adoption-apply-chain.mjs",
    "releases/1.89.0/release-record.md",
    "releases/1.89.0/known-limitations.md",
    "releases/1.89.0/self-check-report.md",
    "releases/1.89.1/release-record.md",
    "releases/1.89.1/known-limitations.md",
    "releases/1.89.1/self-check-report.md",
    "releases/1.89.2/release-record.md",
    "releases/1.89.2/known-limitations.md",
    "releases/1.89.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.89 safety/evidence hardening asset exists ${file}`);
    else fail(`1.89 safety/evidence hardening asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/safety-evidence-hardening-1.89-plan.md"),
    read("scripts/lib/path-safety.mjs"),
    read("scripts/lib/approval-record-validation.mjs"),
    read("scripts/lib/adoption-apply-chain.mjs"),
    read("scripts/init-project.mjs"),
    read("scripts/check-manifest.mjs"),
    read("scripts/new-workflow-item.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("scripts/check-adoption-assurance.mjs"),
    read("scripts/resolve-adoption-assurance.mjs"),
    read("scripts/resolve-work-queue-takeover.mjs"),
    read("scripts/check-plan-review.mjs"),
    read("scripts/check-completion-evidence.mjs"),
    read("scripts/check-controlled-apply-readiness.mjs"),
    read("scripts/cli.mjs"),
    read("templates/release-handoff-pack.md"),
    read("releases/1.89.0/release-record.md"),
    read("releases/1.89.0/known-limitations.md"),
    read("releases/1.89.0/self-check-report.md"),
    read("releases/1.89.1/release-record.md"),
    read("releases/1.89.1/known-limitations.md"),
    read("releases/1.89.1/self-check-report.md"),
    read("releases/1.89.2/release-record.md"),
    read("releases/1.89.2/known-limitations.md"),
    read("releases/1.89.2/self-check-report.md"),
  ].join("\n");
  for (const marker of [
    "Path And Evidence Hardening",
    "assertSafeWritePath",
    "assertNoSymlinkInPath",
    "planDigest",
    "planDigest is missing or does not match current plan content",
    "safe relative path",
    "no Controlled Apply Readiness reports found while strict evidence",
    "no Plan Review reports found",
    "apply_chain",
    "VERIFIED_ACTIVE requires verified apply chain",
    "structured approval",
    "current conversation user or another specific human confirmer",
    "expires_at must be a parseable date/time",
    "approved_action_ids must exactly match approved_action_paths row IDs",
    "Adoption Assurance apply-chain helper rejects forged apply-plan digest",
    "Underlying command:",
  ]) {
    if (combined.includes(marker)) pass(`1.89 hardening includes ${marker}`);
    else fail(`1.89 hardening missing ${marker}`);
  }

  const syntax = runNode(["--check", "scripts/lib/path-safety.mjs"]);
  if (syntax.status === 0) {
    pass("path-safety helper syntax check");
  } else {
    fail(`path-safety helper syntax failed: ${syntax.stderr || syntax.stdout}`);
  }
  const approvalSyntax = runNode(["--check", "scripts/lib/approval-record-validation.mjs"]);
  if (approvalSyntax.status === 0) {
    pass("approval-record-validation helper syntax check");
  } else {
    fail(`approval-record-validation helper syntax failed: ${approvalSyntax.stderr || approvalSyntax.stdout}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1-89-"));
  try {
    const unsafeManifestPath = path.join(tempRoot, "unsafe-manifest.json");
    const manifest = JSON.parse(read("intentos-manifest.json"));
    manifest.copyRules.files.push({
      source: "README.md",
      target: "../escape.md",
    });
    fs.writeFileSync(unsafeManifestPath, JSON.stringify(manifest, null, 2));
    const unsafeManifest = runNode(["scripts/check-manifest.mjs", kitRoot, "--manifest", unsafeManifestPath]);
    const unsafeManifestOutput = `${unsafeManifest.stdout}\n${unsafeManifest.stderr}`;
    if (unsafeManifest.status !== 0 && unsafeManifestOutput.includes("safe relative path")) {
      pass("manifest rejects unsafe copy rule target path");
    } else {
      fail(`manifest must reject unsafe copy rule target path: ${unsafeManifestOutput}`);
    }

    const target = path.join(tempRoot, "target");
    const writePlanPath = path.join(target, "apply-execution-plans", "plan.json");
    fs.mkdirSync(target, { recursive: true });
    const writePlan = runNode([
      "scripts/init-project.mjs",
      "--target",
      target,
      "--write-plan",
      path.relative(target, writePlanPath),
    ]);
    if (writePlan.status !== 0) {
      fail(`init-project write-plan failed during digest hardening smoke: ${writePlan.stderr || writePlan.stdout}`);
      return;
    }
    const tamperedApprovalPath = writeInitProjectApprovalRecord(writePlanPath);
    const plan = JSON.parse(fs.readFileSync(writePlanPath, "utf8"));
    plan.actions.push({ id: "tampered", type: "noop", description: "tamper after digest" });
    fs.writeFileSync(writePlanPath, JSON.stringify(plan, null, 2));
    const applyTampered = runNode(["scripts/init-project.mjs", "--apply-plan", writePlanPath, "--approval-record", tamperedApprovalPath]);
    const applyTamperedOutput = `${applyTampered.stdout}\n${applyTampered.stderr}`;
    if (applyTampered.status !== 0 && applyTamperedOutput.includes("planDigest is missing or does not match")) {
      pass("init-project rejects tampered apply plan digest");
    } else {
      fail(`init-project must reject tampered apply plan digest: ${applyTamperedOutput}`);
    }

    for (const [name, mutate, expected] of [
      ["non-human approval owner", (approval) => ({ ...approval, approved_by: "Codex" }), "current conversation user or another specific human confirmer"],
      ["ambiguous approval owner", (approval) => ({ ...approval, approved_by: "human" }), "current conversation user or another specific human confirmer"],
      ["unparseable approval expiry", (approval) => ({ ...approval, expires_at: "next week maybe" }), "expires_at must be a parseable date/time"],
      ["extra approval path row", (approval) => ({
        ...approval,
        approved_action_paths: [
          ...approval.approved_action_paths,
          { id: "A-999999", target_paths: ["docs/extra.md"] },
        ],
      }), "approved_action_ids must exactly match approved_action_paths row IDs"],
    ]) {
      const caseTarget = path.join(tempRoot, `approval-runtime-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`);
      const casePlanPath = path.join(caseTarget, "apply-execution-plans", `approval-runtime-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`);
      fs.mkdirSync(caseTarget, { recursive: true });
      const casePlan = runNode([
        "scripts/init-project.mjs",
        "--target",
        caseTarget,
        "--write-plan",
        path.relative(caseTarget, casePlanPath),
      ]);
      if (casePlan.status !== 0) {
        fail(`init-project write-plan failed during ${name} smoke: ${casePlan.stderr || casePlan.stdout}`);
        continue;
      }
      const caseApprovalPath = writeInitProjectApprovalRecord(casePlanPath, { mutate });
      const caseApply = runNode(["scripts/init-project.mjs", "--apply-plan", casePlanPath, "--approval-record", caseApprovalPath]);
      const caseApplyOutput = `${caseApply.stdout}\n${caseApply.stderr}`;
      if (caseApply.status !== 0 && caseApplyOutput.includes(expected)) {
        pass(`init-project rejects ${name} before apply`);
      } else {
        fail(`init-project must reject ${name} before apply: ${caseApplyOutput}`);
      }
    }

    const forgedApplyChain = path.join(tempRoot, "forged-apply-chain");
    fs.mkdirSync(forgedApplyChain, { recursive: true });
    for (const dir of ["apply-plans", "approval-records", "apply-readiness-reports"]) {
      fs.cpSync(
        path.join(kitRoot, "examples", "1.41-structured-evidence-schema", dir),
        path.join(forgedApplyChain, dir),
        { recursive: true },
      );
    }
    for (const file of [
      "apply-plans/001-structured-workflow-assets.md",
      "approval-records/001-structured-workflow-assets.md",
      "apply-readiness-reports/001-structured-workflow-assets.md",
    ]) {
      rewriteMachineEvidence(path.join(forgedApplyChain, file), (evidence) => {
        const forgedDigest = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        if (evidence.plan_digest) evidence.plan_digest = forgedDigest;
        if (evidence.approved_plan?.plan_digest) evidence.approved_plan.plan_digest = forgedDigest;
        if (evidence.apply_plan?.plan_digest) evidence.apply_plan.plan_digest = forgedDigest;
        return evidence;
      });
    }
    const forgedAdoption = runNode(["scripts/resolve-adoption-assurance.mjs", forgedApplyChain, "--json"]);
    const forgedOutput = `${forgedAdoption.stdout}\n${forgedAdoption.stderr}`;
    try {
      const parsed = JSON.parse(forgedAdoption.stdout);
      const applySurface = (parsed.surfaces || []).find((item) => item.surface === "apply_chain");
      if (forgedAdoption.status === 0 && applySurface?.status !== "VERIFIED" && parsed.humanSummary?.canClaimFullAdoption === "No") {
        pass("Adoption Assurance helper rejects forged apply plan digest before VERIFIED_ACTIVE");
      } else {
        fail(`Adoption Assurance helper must reject forged apply plan digest: ${forgedOutput}`);
      }
    } catch (error) {
      fail(`forged adoption assurance JSON invalid: ${error.message}: ${forgedOutput}`);
    }

    const symlinkTarget = path.join(tempRoot, "symlink-target");
    const symlinkEscape = path.join(tempRoot, "outside.txt");
    fs.mkdirSync(path.join(symlinkTarget, "scripts"), { recursive: true });
    fs.writeFileSync(symlinkEscape, "outside");
    fs.symlinkSync(symlinkEscape, path.join(symlinkTarget, "scripts", "check-ai-workflow.mjs"));
    const symlinkUpdate = runNode([
      "scripts/init-project.mjs",
      "--target",
      symlinkTarget,
      "--force-new-project",
    ]);
    const symlinkUpdateOutput = `${symlinkUpdate.stdout}\n${symlinkUpdate.stderr}`;
    if (symlinkUpdate.status !== 0 && symlinkUpdateOutput.includes("symlink")) {
      pass("init-project refuses workflow asset write through symlink path");
    } else {
      fail(`init-project must refuse workflow asset write through symlink path: ${symlinkUpdateOutput}`);
    }

    const strictNoReport = runNode([
      "scripts/check-plan-review.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictNoReportOutput = `${strictNoReport.stdout}\n${strictNoReport.stderr}`;
    if (strictNoReport.status !== 0 && strictNoReportOutput.includes("no Plan Review reports found")) {
      pass("strict plan review fails closed when reports are absent");
    } else {
      fail(`strict plan review must fail closed when reports are absent: ${strictNoReportOutput}`);
    }

    const strictImpactNoReport = runNode([
      "scripts/check-change-impact-coverage.mjs",
      tempRoot,
      "--require-structured-evidence",
      "--mode",
      "closure",
      "--strict-evidence",
    ]);
    const strictImpactNoReportOutput = `${strictImpactNoReport.stdout}\n${strictImpactNoReport.stderr}`;
    if (strictImpactNoReport.status !== 0 && strictImpactNoReportOutput.includes("no Change Impact Coverage reports found")) {
      pass("strict change impact coverage fails closed when reports are absent");
    } else {
      fail(`strict change impact coverage must fail closed when reports are absent: ${strictImpactNoReportOutput}`);
    }

    const strictApplyPlanNoReport = runNode([
      "scripts/check-apply-plan.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApplyPlanNoReportOutput = `${strictApplyPlanNoReport.stdout}\n${strictApplyPlanNoReport.stderr}`;
    if (strictApplyPlanNoReport.status !== 0 && strictApplyPlanNoReportOutput.includes("no Unified Apply Plan reports found")) {
      pass("strict unified apply plan fails closed when reports are absent");
    } else {
      fail(`strict unified apply plan must fail closed when reports are absent: ${strictApplyPlanNoReportOutput}`);
    }

    const strictReleaseHandoffNoReport = runNode([
      "scripts/check-release-handoff-pack.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictReleaseHandoffNoReportOutput = `${strictReleaseHandoffNoReport.stdout}\n${strictReleaseHandoffNoReport.stderr}`;
    if (strictReleaseHandoffNoReport.status !== 0 && strictReleaseHandoffNoReportOutput.includes("no Release Handoff Pack reports found")) {
      pass("strict release handoff pack fails closed when reports are absent");
    } else {
      fail(`strict release handoff pack must fail closed when reports are absent: ${strictReleaseHandoffNoReportOutput}`);
    }

    const strictCompletionNoReport = runNode([
      "scripts/check-completion-evidence.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictCompletionNoReportOutput = `${strictCompletionNoReport.stdout}\n${strictCompletionNoReport.stderr}`;
    if (strictCompletionNoReport.status !== 0 && strictCompletionNoReportOutput.includes("no Completion Evidence Gate reports found")) {
      pass("strict completion evidence fails closed when reports are absent");
    } else {
      fail(`strict completion evidence must fail closed when reports are absent: ${strictCompletionNoReportOutput}`);
    }

    const strictApplyReadinessNoReport = runNode([
      "scripts/check-controlled-apply-readiness.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApplyReadinessOutput = `${strictApplyReadinessNoReport.stdout}\n${strictApplyReadinessNoReport.stderr}`;
    if (strictApplyReadinessNoReport.status !== 0 && strictApplyReadinessOutput.includes("no Controlled Apply Readiness reports found")) {
      pass("strict controlled apply readiness fails closed when reports are absent");
    } else {
      fail(`strict controlled apply readiness must fail closed when reports are absent: ${strictApplyReadinessOutput}`);
    }

    const strictApprovalNoReport = runNode([
      "scripts/check-approval-record.mjs",
      tempRoot,
      "--require-structured-evidence",
    ]);
    const strictApprovalOutput = `${strictApprovalNoReport.stdout}\n${strictApprovalNoReport.stderr}`;
    if (strictApprovalNoReport.status !== 0 && strictApprovalOutput.includes("no approval records found")) {
      pass("strict approval record check fails closed when reports are absent");
    } else {
      fail(`strict approval record check must fail closed when reports are absent: ${strictApprovalOutput}`);
    }

    const allowEmptyApproval = runNode([
      "scripts/check-approval-record.mjs",
      tempRoot,
      "--require-structured-evidence",
      "--allow-empty",
    ]);
    const allowEmptyApprovalOutput = `${allowEmptyApproval.stdout}\n${allowEmptyApproval.stderr}`;
    if (allowEmptyApproval.status === 0 && allowEmptyApprovalOutput.includes("--allow-empty")) {
      pass("approval record --allow-empty remains explicit maintainer override");
    } else {
      fail(`approval record --allow-empty should permit empty source checks: ${allowEmptyApprovalOutput}`);
    }

    const schema = {
      type: "object",
      required: ["kind", "items"],
      additionalProperties: false,
      properties: {
        kind: { const: "demo" },
        items: {
          type: "array",
          minItems: 1,
          uniqueItems: true,
          contains: { const: "required" },
          items: { type: "string", minLength: 3 },
        },
      },
    };
    const goodSchema = validateSchema({ kind: "demo", items: ["required", "other"] }, schema);
    const badSchema = validateSchema({ kind: "wrong", items: ["x"] }, schema);
    if (goodSchema.ok && !badSchema.ok && badSchema.errors.some((error) => error.includes("must equal"))) {
      pass("artifact schema validator enforces const/minLength/contains/uniqueItems");
    } else {
      fail(`artifact schema validator must enforce stricter keywords: ${badSchema.errors.join("; ")}`);
    }

    const adoption = runNode([
      "scripts/check-adoption-assurance.mjs",
      "examples/1.71-adoption-execution-assurance/verified-existing-project",
      "--require-structured-evidence",
    ]);
    const adoptionOutput = `${adoption.stdout}\n${adoption.stderr}`;
    if (adoption.status === 0 && adoptionOutput.includes("Adoption Assurance check passed")) {
      pass("read-only adoption assurance example remains partial and valid");
    } else {
      fail(`read-only adoption assurance example should remain valid partial adoption: ${adoptionOutput}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkUserDeliveryConsoleProtocol() {
  const required = [
    "core/user-delivery-console.md",
    "docs/user-delivery-console.md",
    "docs/plans/user-delivery-console-1.79-plan.md",
    "docs/plans/user-delivery-console-evidence-validation-1.79.1-plan.md",
    "docs/plans/user-delivery-console-current-task-binding-1.79.2-plan.md",
    "docs/plans/user-delivery-console-verification-note-1.79.3-plan.md",
    "docs/plans/user-delivery-console-source-signal-calibration-1.79.4-plan.md",
    "templates/user-delivery-console-card.md",
    "checklists/user-delivery-console-review.md",
    "prompts/user-delivery-console-agent.md",
    "delivery-status-cards/.gitkeep",
    "scripts/resolve-user-delivery-console.mjs",
    "scripts/check-user-delivery-console.mjs",
    "examples/1.79-user-delivery-console/README.md",
    "examples/1.79-user-delivery-console/appointment-app/delivery-status-cards/001-status.md",
    "test-fixtures/bad/bad-user-delivery-console-internal-jargon/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-overclaim/delivery-status-cards/001-bad.md",
    "test-fixtures/bad/bad-user-delivery-console-too-many-decisions/delivery-status-cards/001-bad.md",
    "releases/1.79.0/release-record.md",
    "releases/1.79.0/known-limitations.md",
    "releases/1.79.0/self-check-report.md",
    "releases/1.79.1/release-record.md",
    "releases/1.79.1/known-limitations.md",
    "releases/1.79.1/self-check-report.md",
    "releases/1.79.2/release-record.md",
    "releases/1.79.2/known-limitations.md",
    "releases/1.79.2/self-check-report.md",
    "releases/1.79.3/release-record.md",
    "releases/1.79.3/known-limitations.md",
    "releases/1.79.3/self-check-report.md",
    "releases/1.79.4/release-record.md",
    "releases/1.79.4/known-limitations.md",
    "releases/1.79.4/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.79 user delivery console asset exists ${file}`);
    else fail(`1.79 user delivery console asset missing ${file}`);
  }

  const combined = [
    read("core/user-delivery-console.md"),
    read("docs/user-delivery-console.md"),
    read("docs/plans/user-delivery-console-1.79-plan.md"),
    read("docs/plans/user-delivery-console-evidence-validation-1.79.1-plan.md"),
    read("docs/plans/user-delivery-console-current-task-binding-1.79.2-plan.md"),
    read("docs/plans/user-delivery-console-verification-note-1.79.3-plan.md"),
    read("docs/plans/user-delivery-console-source-signal-calibration-1.79.4-plan.md"),
    read("templates/user-delivery-console-card.md"),
    read("checklists/user-delivery-console-review.md"),
    read("prompts/user-delivery-console-agent.md"),
    read("scripts/resolve-user-delivery-console.mjs"),
    read("scripts/check-user-delivery-console.mjs"),
    read("scripts/cli.mjs"),
    read(".github/workflows/intentos-pr-checks.yml"),
    read("releases/1.79.0/release-record.md"),
    read("releases/1.79.1/release-record.md"),
    read("releases/1.79.2/release-record.md"),
    read("releases/1.79.3/release-record.md"),
    read("releases/1.79.4/release-record.md"),
  ].join("\n");

  for (const marker of [
    "User Delivery Console",
    "User Delivery Console Card",
    "derived view only",
    "What are we building first?",
    "Can this task be treated as done",
    "Technical Trace",
    "status",
    "status-check",
    "STRICT_CHECK_PASSED",
    "NEEDS_COMPLETION_EVIDENCE_CHECK",
    "verificationPlanPrepared",
    "testCheckEvidenceRecorded",
    "userVerificationNoteProvided",
    "sourceSignals",
    "currentTaskMatches",
    "completionEvidenceStrictCheck",
    "PROJECT_HAS_OTHER_COMPLETION_RECORD",
    "currentIntentMatch",
    "delivery-status-cards/001-generated-status.md",
    "does not approve implementation",
    "does not approve release or production",
    "does not write target files",
    "does not prove real-user stability",
  ]) {
    if (combined.includes(marker)) pass(`1.79 user delivery console includes ${marker}`);
    else fail(`1.79 user delivery console missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# User Delivery Console Card")
    && resolver.stdout.includes("## Human Summary")
    && resolver.stdout.includes("Can this task be treated as done")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.79 user delivery console resolver prints safe status card");
  } else {
    fail(`1.79 user delivery console resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-user-delivery-console.mjs", ".", "--intent", "maintain IntentOS ordinary user delivery status", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "USER_DELIVERY_CONSOLE_CARD"
        && parsed.schemaVersion === "1.79.4"
        && parsed.readOnly === true
        && parsed.deliveryStatus?.currentState
        && parsed.deliveryStatus?.currentStateLabel
        && parsed.taskCompletion?.verificationPlanPrepared
        && parsed.taskCompletion?.testCheckEvidenceRecorded
        && parsed.taskCompletion?.userVerificationNoteProvided
        && parsed.taskCompletion?.completionEvidenceStrictCheck
        && "currentIntentMatch" in parsed.taskCompletion
        && parsed.sourceSignals?.verificationPlan
        && parsed.sourceSignals?.testEvidence
        && parsed.sourceSignals?.executionAssurance
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.boundaries?.approvesReleaseOrProduction === "No") {
        pass("1.79 user delivery console resolver JSON includes split verification fields, strict completion status, and no-authority boundaries");
      } else {
        fail(`1.79 user delivery console resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const noteJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    ".",
    "--intent",
    "maintain IntentOS ordinary user delivery status",
    "--verification",
    "npm run verify passed",
    "--json",
  ]);
  if (noteJson.status === 0) {
    try {
      const parsed = JSON.parse(noteJson.stdout);
      if (parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.userVerificationNoteProvided === "Yes") {
        pass("1.79 user delivery console keeps user verification note separate from Test Evidence reports");
      } else {
        fail(`1.79 user delivery console verification note must not count as Test Evidence: ${noteJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console verification note JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console verification note JSON failed: ${noteJson.stderr || noteJson.stdout}`);
  }

  const otherTaskJson = runNode([
    "scripts/resolve-user-delivery-console.mjs",
    "examples/1.78-completion-evidence-gate/appointment-service-time",
    "--intent",
    "different task",
    "--json",
  ]);
  if (otherTaskJson.status === 0) {
    try {
      const parsed = JSON.parse(otherTaskJson.stdout);
      if (parsed.taskCompletion?.verificationPlanPrepared === "No"
        && parsed.taskCompletion?.testCheckEvidenceRecorded === "No"
        && parsed.taskCompletion?.executionProofRecorded === "No"
        && parsed.sourceSignals?.verificationPlan?.otherTaskRecords > 0
        && parsed.sourceSignals?.testEvidence?.otherTaskRecords > 0
        && parsed.sourceSignals?.executionAssurance?.otherTaskRecords > 0) {
        pass("1.79 user delivery console keeps other-task source signals out of current-task status");
      } else {
        fail(`1.79 user delivery console must not count other-task source signals as current-task evidence: ${otherTaskJson.stdout}`);
      }
    } catch (error) {
      fail(`1.79 user delivery console other-task source signal JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.79 user delivery console other-task source signal JSON failed: ${otherTaskJson.stderr || otherTaskJson.stdout}`);
  }

  const cliResolver = runNode(["scripts/cli.mjs", "status", ".", "--intent", "maintain IntentOS ordinary user delivery status"]);
  if (cliResolver.status === 0 && cliResolver.stdout.includes("# User Delivery Console Card")) {
    pass("CLI status delegates to user delivery console resolver");
  } else {
    fail(`CLI status failed: ${cliResolver.stderr || cliResolver.stdout}`);
  }

  const sourceCheck = runNode(["scripts/check-user-delivery-console.mjs", "."]);
  if (sourceCheck.status === 0 && sourceCheck.stdout.includes("User Delivery Console check passed")) {
    pass("1.79 user delivery console checker passes source repo");
  } else {
    fail(`1.79 user delivery console checker failed: ${sourceCheck.stderr || sourceCheck.stdout}`);
  }

  const cliCheck = runNode(["scripts/cli.mjs", "status-check", "."]);
  if (cliCheck.status === 0 && cliCheck.stdout.includes("User Delivery Console check passed")) {
    pass("CLI status-check delegates to user delivery console checker");
  } else {
    fail(`CLI status-check failed: ${cliCheck.stderr || cliCheck.stdout}`);
  }

  const example = runNode(["scripts/check-user-delivery-console.mjs", "examples/1.79-user-delivery-console/appointment-app"]);
  if (example.status === 0 && example.stdout.includes("User Delivery Console check passed")) {
    pass("1.79 user delivery console example passes checker");
  } else {
    fail(`1.79 user delivery console example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["internal jargon", "test-fixtures/bad/bad-user-delivery-console-internal-jargon", "internal evidence jargon"],
    ["overclaim", "test-fixtures/bad/bad-user-delivery-console-overclaim", "forbidden user delivery console claim"],
    ["too many decisions", "test-fixtures/bad/bad-user-delivery-console-too-many-decisions", "invalid number of human decisions"],
  ]) {
    const result = runNode(["scripts/check-user-delivery-console.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.79 user delivery console rejects ${name}`);
    } else {
      fail(`1.79 user delivery console must reject ${name}: ${output}`);
    }
  }

  const pkg = JSON.parse(read("package.json"));
  const verifySurface = Object.entries(pkg.scripts || {})
    .filter(([name]) => name === "verify" || name.startsWith("verify:"))
    .map(([, value]) => value)
    .join("\n");
  for (const marker of [
    "node --check scripts/resolve-user-delivery-console.mjs",
    "node --check scripts/check-user-delivery-console.mjs",
    "node scripts/cli.mjs status . --intent \"维护 IntentOS 普通用户交付状态\"",
    "node scripts/cli.mjs status-check .",
    "node scripts/check-user-delivery-console.mjs examples/1.79-user-delivery-console/appointment-app",
  ]) {
    if (verifySurface.includes(marker)) pass(`1.79 package verify includes ${marker}`);
    else fail(`1.79 package verify missing ${marker}`);
  }
}

function generatedExecutionAssuranceReportText({ taskRef, testEvidenceRef, testEvidenceDigest }) {
  return `# Execution Assurance Report

This report is a read-only derived verification view. It does not write target files, authorize writes, approve release, or replace source systems.

## Human Summary

| Field | Value |
| --- | --- |
| Execution Kind | \`FEATURE_IMPLEMENTATION\` |
| Assurance State | \`VERIFIED_DONE\` |
| Can Claim Done | \`Yes\` |
| Can Codex Write Now | \`No\` |
| Safe Next Step | Prepare a completion evidence gate before claiming the task is complete. |

## Execution Kind

\`FEATURE_IMPLEMENTATION\`

## Intent Lock

| Field | Value |
| --- | --- |
| User Intent | appointment requests must include a service time |
| Normalized Intent | Service time is required across user-visible and server-side entry paths. |
| Task Ref | \`${taskRef}\` |
| Drift Policy | Any new scheduling policy exits this task. |

## Completion Contract

| Criterion | Status | Evidence | Notes |
| --- | --- | --- | --- |
| criterion:test-evidence | \`DONE\` | \`${testEvidenceRef}\` | Test Evidence report is recorded. |

## Planned Impact Map

| Surface | Expected | Status | Evidence | Notes |
| --- | --- | --- | --- |
| USER_FLOW | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | User flow covered by Test Evidence. |
| FRONTEND_UI | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | Frontend covered by Test Evidence. |
| API_CONTRACT | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | API covered by Test Evidence. |
| BACKEND_RULE | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | Backend rule covered by Test Evidence. |

## Execution Plan Binding

| Field | Value |
| --- | --- |
| Plan Ref | \`artifact:${taskRef}\` |
| Risk Classification | \`NORMAL\` |
| Planned Target Paths | \`src/appointment/form.ts, src/appointment/api.ts, src/appointment/domain.ts, tests/appointment-service-time.test.ts\` |
| Approval Ref | \`N/A\` |
| Restore Strategy | Revert task-scoped diff if validation behavior regresses. |

## Actual Diff Binding

| Field | Value |
| --- | --- |
| Diff Source | \`git\` |
| Changed Files | \`src/appointment/form.ts, src/appointment/api.ts, src/appointment/domain.ts, tests/appointment-service-time.test.ts\` |
| Unexpected Files | \`none\` |
| Target Diff Status | \`MATCHED_PLAN\` |

## Evidence Binding

| Criterion | Evidence Ref | Resolved | Current Task Match |
| --- | --- | --- | --- |
| criterion:test-evidence | \`${testEvidenceRef}\` | \`Yes\` | \`Yes\` |

## Independent Review Binding

| Field | Value |
| --- | --- |
| Review Required | \`No\` |
| Review Refs | \`checker:generated-project-smoke\` |
| All Reviewers Closed | \`Yes\` |

## Patch Assessment

| Field | Value |
| --- | --- |
| Patch State | \`NOT_A_PATCH\` |
| Reason | Generated-project smoke covers a cross-surface task chain. |

## Source System Trace

| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| test_evidence | \`RECORDED\` | \`${testEvidenceRef}\` | \`${taskRef}\` | \`TEST_EVIDENCE_COMPLETE\` | \`Yes\` | \`${testEvidenceDigest}\` | Generated smoke Test Evidence. | Source system |

## Closure Decision

\`VERIFIED_DONE\`

## Pending Human Decisions

- None.

## Forbidden Claims

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves implementation beyond recorded scope: No
- This report approves commit or push: No
- This report approves release or production: No
- This report replaces source systems: No
- This report proves product correctness: No
- This report transfers project authority to IntentOS: No

## Boundary

Execution Assurance is derived from recorded evidence and project facts. Source systems remain authoritative.

## Machine-Readable Evidence

\`\`\`json
{
  "schema_version": "1.74.0",
  "artifact_type": "execution_assurance_report",
  "execution_kind": "FEATURE_IMPLEMENTATION",
  "task_ref": "${taskRef}",
  "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "assurance_state": "VERIFIED_DONE",
  "can_claim_done": "Yes",
  "can_codex_write_now": "No",
  "intent_lock": {
    "user_intent": "appointment requests must include a service time",
    "normalized_intent": "Service time is required across user-visible and server-side entry paths.",
    "in_scope": ["user flow", "frontend UI", "API contract", "backend rule", "verification"],
    "out_of_scope": ["payment", "production release", "new scheduling policy"]
  },
  "completion_contract": {
    "criteria": [
      {"id":"criterion:test-evidence","status":"DONE","evidence_refs":["${testEvidenceRef}"]}
    ]
  },
  "planned_impact_map": {
    "surfaces": [
      {"surface":"USER_FLOW","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"FRONTEND_UI","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"API_CONTRACT","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"BACKEND_RULE","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]}
    ]
  },
  "execution_plan": {
    "plan_ref": "artifact:${taskRef}",
    "planned_target_paths": ["src/appointment/form.ts", "src/appointment/api.ts", "src/appointment/domain.ts", "tests/appointment-service-time.test.ts"],
    "risk_classification": "NORMAL",
    "approval_refs": [],
    "restore_strategy": "Revert task-scoped diff if validation behavior regresses."
  },
  "actual_diff": {
    "diff_source": "git",
    "changed_files": ["src/appointment/form.ts", "src/appointment/api.ts", "src/appointment/domain.ts", "tests/appointment-service-time.test.ts"],
    "unexpected_files": [],
    "target_diff_status": "MATCHED_PLAN"
  },
  "evidence_bindings": [
    {"criterion_id":"criterion:test-evidence","evidence_ref":"${testEvidenceRef}","resolved":"Yes","current_task_match":"Yes"}
  ],
  "review": {
    "review_required": "No",
    "review_refs": ["checker:generated-project-smoke"],
    "all_reviewers_closed": "Yes"
  },
  "patch_assessment": {
    "state": "NOT_A_PATCH",
    "reason": "Generated-project smoke covers a cross-surface task chain."
  },
  "source_systems": [
    {
      "name": "test_evidence",
      "status": "RECORDED",
      "ref": "${testEvidenceRef}",
      "source_system_ref": "${testEvidenceRef}",
      "source_task_ref": "${taskRef}",
      "source_outcome": "TEST_EVIDENCE_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "${testEvidenceDigest}",
      "contribution": "Generated smoke Test Evidence."
    }
  ],
  "pending_human_decisions": [],
  "forbidden_claims": [],
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_implementation_beyond_recorded_scope": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "replaces_source_systems": "No",
    "proves_product_correctness": "No",
    "transfers_project_authority_to_intentos": "No"
  },
  "outcome": "VERIFIED_DONE"
}
\`\`\`
`;
}

function checkChangeImpactCoverageProtocol() {
  const required = [
    "core/change-impact-coverage.md",
    "docs/change-impact-coverage.md",
    "docs/plans/change-impact-coverage-1.48-plan.md",
    "docs/plans/structured-impact-coverage-1.49-plan.md",
    "docs/plans/evidence-reference-resolution-1.50-plan.md",
    "docs/plans/closeout-evidence-precision-1.51-plan.md",
    "templates/change-impact-coverage-report.md",
    "checklists/change-impact-coverage-review.md",
    "prompts/change-impact-coverage-agent.md",
    "schemas/artifacts/change-impact-coverage.schema.json",
    "change-impact-coverage-reports/.gitkeep",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.48-change-impact-coverage/contract-input-rule/README.md",
    "examples/1.48-change-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/README.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/change-impact-coverage-reports/001-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/user-flow-contract-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/frontend-contract-form-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/api-contract-title-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/backend-contract-validation.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/error-copy-title-required.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/test-contract-input-rule.txt",
    "examples/1.49-structured-impact-coverage/contract-input-rule/evidence/docs-contract-input-rule.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/execution-closures/001-contract-input-rule.md",
    "examples/1.50-evidence-reference-resolution/README.md",
    "test-fixtures/bad/bad-change-impact-backend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-frontend-only/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-api-without-tests/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-high-risk-na/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-approves-implementation/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-structured-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-placeholder-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-closure-not-started/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-missing-evidence-ref/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/change-impact-coverage-reports/001-bad.md",
    "test-fixtures/bad/bad-change-impact-weak-evidence/evidence/weak.txt",
    "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref/change-impact-coverage-reports/001-bad.md",
    "releases/1.48.0/release-record.md",
    "releases/1.48.0/known-limitations.md",
    "releases/1.48.0/self-check-report.md",
    "releases/1.49.0/release-record.md",
    "releases/1.49.0/known-limitations.md",
    "releases/1.49.0/self-check-report.md",
    "releases/1.50.0/release-record.md",
    "releases/1.50.0/known-limitations.md",
    "releases/1.50.0/self-check-report.md",
    "releases/1.51.0/release-record.md",
    "releases/1.51.0/known-limitations.md",
    "releases/1.51.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.49 change impact coverage asset exists ${file}`);
    else fail(`1.49 change impact coverage asset missing ${file}`);
  }

  const combined = [
    read("core/change-impact-coverage.md"),
    read("docs/change-impact-coverage.md"),
    read("templates/change-impact-coverage-report.md"),
    read("checklists/change-impact-coverage-review.md"),
    read("scripts/resolve-change-impact-coverage.mjs"),
    read("scripts/check-change-impact-coverage.mjs"),
    read("docs/plans/change-impact-coverage-1.48-plan.md"),
    read("docs/plans/structured-impact-coverage-1.49-plan.md"),
    read("docs/plans/evidence-reference-resolution-1.50-plan.md"),
    read("docs/plans/closeout-evidence-precision-1.51-plan.md"),
    read("releases/1.48.0/release-record.md"),
    read("releases/1.49.0/release-record.md"),
    read("releases/1.50.0/release-record.md"),
    read("releases/1.51.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Change Impact Coverage",
    "prevents partial implementation",
    "Machine-Readable Evidence",
    "require-structured-evidence",
    "strict-evidence",
    "resolve-evidence-refs",
    "require-precise-evidence",
    "--report",
    "from-git-diff",
    "closure mode",
    "USER_FLOW",
    "FRONTEND_UI",
    "API_CONTRACT",
    "BACKEND_RULE",
    "DATA_MODEL",
    "ERROR_COPY",
    "TEST_COVERAGE",
    "DOCS_HANDOFF",
    "PERMISSION_RISK",
    "RELEASE_IMPACT",
    "This report authorizes implementation: No",
    "This report approves release or production: No",
    "backend-only",
    "frontend-only",
  ]) {
    if (combined.includes(marker)) pass(`1.49 change impact coverage includes ${marker}`);
    else fail(`1.49 change impact coverage missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Change Impact Coverage Report")
    && resolver.stdout.includes("FRONTEND_UI")
    && resolver.stdout.includes("BACKEND_RULE")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.49 change impact coverage resolver prints safe cross-surface report");
  } else {
    fail(`1.49 change impact coverage resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-change-impact-coverage.mjs", "examples/mvp-booking-web-app", "--intent", "add contract input restriction", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "CHANGE_IMPACT_COVERAGE_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.machineReadableEvidence?.artifact_type === "change_impact_coverage"
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "FRONTEND_UI")
        && parsed.affectedSurfaceMap?.some((item) => item.surface === "BACKEND_RULE")) {
        pass("1.49 change impact coverage resolver JSON includes boundaries, structured evidence, and cross-surface map");
      } else {
        fail(`1.49 change impact coverage resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.49 change impact coverage resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.49 change impact coverage resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-change-impact-coverage.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.49 change impact coverage checker passes source repo");
  } else {
    fail(`1.49 change impact coverage checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-change-impact-coverage.mjs", "examples/1.48-change-impact-coverage/contract-input-rule"]);
  if (example.status === 0 && example.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.48 legacy change impact coverage example passes checker");
  } else {
    fail(`1.48 change impact coverage example failed: ${example.stderr || example.stdout}`);
  }

  const strictExample = runNode([
    "scripts/check-change-impact-coverage.mjs",
    "examples/1.49-structured-impact-coverage/contract-input-rule",
    "--require-structured-evidence",
    "--mode",
    "closure",
    "--strict-evidence",
    "--resolve-evidence-refs",
    "--require-precise-evidence",
    "--report",
    "change-impact-coverage-reports/001-contract-input-rule.md",
  ]);
  if (strictExample.status === 0
    && strictExample.stdout.includes("has valid structured evidence")
    && strictExample.stdout.includes("precise evidence refs pass")
    && strictExample.stdout.includes("Change Impact Coverage check passed")) {
    pass("1.51 structured change impact coverage example passes strict precision checker");
  } else {
    fail(`1.49 structured change impact coverage example failed: ${strictExample.stderr || strictExample.stdout}`);
  }

  for (const [name, target, expected, extraArgs] of [
    ["backend-only rule", "test-fixtures/bad/bad-change-impact-backend-only", "backend rule change must close FRONTEND_UI", []],
    ["frontend-only rule", "test-fixtures/bad/bad-change-impact-frontend-only", "frontend rule change must close BACKEND_RULE", []],
    ["API without tests", "test-fixtures/bad/bad-change-impact-api-without-tests", "API contract change needs DONE test coverage evidence", []],
    ["high-risk not applicable", "test-fixtures/bad/bad-change-impact-high-risk-na", "high-risk surface PERMISSION_RISK cannot be NOT_APPLICABLE", []],
    ["approval overclaim", "test-fixtures/bad/bad-change-impact-approves-implementation", "forbidden change impact claim", []],
    ["missing structured evidence", "test-fixtures/bad/bad-change-impact-missing-structured-evidence", "Machine-Readable Evidence is required", ["--require-structured-evidence", "--mode", "closure"]],
    ["placeholder evidence", "test-fixtures/bad/bad-change-impact-placeholder-evidence", "uses placeholder evidence", ["--strict-evidence", "--mode", "closure"]],
    ["closure not started", "test-fixtures/bad/bad-change-impact-closure-not-started", "closure mode cannot leave required surface FRONTEND_UI NOT_STARTED", ["--mode", "closure"]],
    ["missing evidence ref", "test-fixtures/bad/bad-change-impact-missing-evidence-ref", "evidence ref is not resolvable", ["--mode", "closure", "--resolve-evidence-refs"]],
    ["weak precise evidence", "test-fixtures/bad/bad-change-impact-weak-evidence", "resolved evidence file is empty or too short", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
    ["unresolved artifact ref", "test-fixtures/bad/bad-change-impact-unresolved-artifact-ref", "artifact record was not found", ["--mode", "closure", "--resolve-evidence-refs", "--require-precise-evidence"]],
  ]) {
    const result = runNode(["scripts/check-change-impact-coverage.mjs", target, ...extraArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.49 change impact coverage rejects ${name}`);
    } else {
      fail(`1.49 change impact coverage must reject ${name}: ${output}`);
    }
  }
}

function checkDeliveryPathGovernanceProtocol() {
  const required = [
    "docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md",
    "core/delivery-path-governance.md",
    "docs/delivery-path-governance.md",
    "templates/delivery-path-report.md",
    "checklists/delivery-path-review.md",
    "prompts/delivery-path-agent.md",
    "delivery-path-reports/.gitkeep",
    "scripts/resolve-delivery-path.mjs",
    "scripts/check-delivery-path.mjs",
    "examples/1.26-delivery-path-governance/README.md",
    "examples/1.26-delivery-path-governance/delivery-path-reports/001-booking-delivery-path.md",
    "test-fixtures/bad/bad-delivery-path-release-overclaim/delivery-path-reports/001-bad.md",
    "test-fixtures/bad/bad-delivery-path-missing-state/delivery-path-reports/001-bad.md",
    "releases/1.26.0/release-record.md",
    "releases/1.26.0/known-limitations.md",
    "releases/1.26.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.26 delivery path asset exists ${file}`);
    else fail(`1.26 delivery path asset missing ${file}`);
  }

  const combined = [
    read("core/delivery-path-governance.md"),
    read("docs/delivery-path-governance.md"),
    read("templates/delivery-path-report.md"),
    read("scripts/resolve-delivery-path.mjs"),
    read("scripts/check-delivery-path.mjs"),
    read("releases/1.26.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Delivery Path Governance",
    "Delivery Path Report",
    "READY_FOR_SELF_TEST",
    "BLOCKED_BY_DIRTY_WORK",
    "This report writes target files: No",
    "This report approves release or production: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.26 delivery path includes ${marker}`);
    else fail(`1.26 delivery path missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-delivery-path.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Delivery Path Report")
    && resolver.stdout.includes("Delivery Path State")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.26 delivery path resolver prints safe report");
  } else {
    fail(`1.26 delivery path resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-delivery-path.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DELIVERY_PATH_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.currentState
        && Array.isArray(parsed.distanceToUsefulUse)) {
        pass("1.26 delivery path resolver JSON includes state, distance, and boundaries");
      } else {
        fail(`1.26 delivery path resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.26 delivery path resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.26 delivery path resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-delivery-path.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Delivery path check passed")) {
    pass("1.26 delivery path checker passes source repo");
  } else {
    fail(`1.26 delivery path checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-delivery-path.mjs", "examples/1.26-delivery-path-governance"]);
  if (example.status === 0 && example.stdout.includes("Delivery path check passed")) {
    pass("1.26 delivery path example passes checker");
  } else {
    fail(`1.26 delivery path example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["release overclaim", ["scripts/check-delivery-path.mjs", "test-fixtures/bad/bad-delivery-path-release-overclaim"], "forbidden delivery path claim"],
    ["missing state", ["scripts/check-delivery-path.mjs", "test-fixtures/bad/bad-delivery-path-missing-state"], "invalid current state"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.26 delivery path rejects ${name}`);
    } else {
      fail(`1.26 delivery path must reject ${name}: ${output}`);
    }
  }
}

function checkDebtKnowledgeHandoffProtocol() {
  const required = [
    "core/debt-knowledge-handoff.md",
    "docs/debt-knowledge-handoff.md",
    "templates/debt-knowledge-handoff-report.md",
    "checklists/debt-knowledge-handoff-review.md",
    "prompts/debt-handoff-agent.md",
    "debt-handoff-reports/.gitkeep",
    "scripts/resolve-debt-handoff.mjs",
    "scripts/check-debt-handoff.mjs",
    "examples/1.27-debt-knowledge-handoff/README.md",
    "examples/1.27-debt-knowledge-handoff/debt-handoff-reports/001-booking-handoff.md",
    "test-fixtures/bad/bad-debt-handoff-forgives-debt/debt-handoff-reports/001-bad.md",
    "test-fixtures/bad/bad-debt-handoff-missing-handoff/debt-handoff-reports/001-bad.md",
    "releases/1.27.0/release-record.md",
    "releases/1.27.0/known-limitations.md",
    "releases/1.27.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.27 debt handoff asset exists ${file}`);
    else fail(`1.27 debt handoff asset missing ${file}`);
  }

  const combined = [
    read("core/debt-knowledge-handoff.md"),
    read("docs/debt-knowledge-handoff.md"),
    read("templates/debt-knowledge-handoff-report.md"),
    read("scripts/resolve-debt-handoff.mjs"),
    read("scripts/check-debt-handoff.mjs"),
    read("releases/1.27.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Debt & Knowledge Handoff",
    "D0_NO_DEBT_FOUND",
    "D4_HIGH_RISK_DEBT",
    "How To Verify",
    "Do Not Touch Without Approval",
    "This report forgives debt: No",
    "This report approves release or production: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.27 debt handoff includes ${marker}`);
    else fail(`1.27 debt handoff missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-debt-handoff.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Debt & Knowledge Handoff Report")
    && resolver.stdout.includes("This report forgives debt: No")) {
    pass("1.27 debt handoff resolver prints safe report");
  } else {
    fail(`1.27 debt handoff resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-debt-handoff.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DEBT_KNOWLEDGE_HANDOFF_REPORT"
        && parsed.boundaries?.forgivesDebt === "No"
        && parsed.debtRegister?.[0]?.level
        && parsed.knowledgeHandoff?.howToVerify) {
        pass("1.27 debt handoff resolver JSON includes debt, handoff, and boundaries");
      } else {
        fail(`1.27 debt handoff resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.27 debt handoff resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.27 debt handoff resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-debt-handoff.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Debt & Knowledge Handoff check passed")) {
    pass("1.27 debt handoff checker passes source repo");
  } else {
    fail(`1.27 debt handoff checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-debt-handoff.mjs", "examples/1.27-debt-knowledge-handoff"]);
  if (example.status === 0 && example.stdout.includes("Debt & Knowledge Handoff check passed")) {
    pass("1.27 debt handoff example passes checker");
  } else {
    fail(`1.27 debt handoff example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["debt forgiven", ["scripts/check-debt-handoff.mjs", "test-fixtures/bad/bad-debt-handoff-forgives-debt"], "forbidden debt handoff claim"],
    ["missing handoff", ["scripts/check-debt-handoff.mjs", "test-fixtures/bad/bad-debt-handoff-missing-handoff"], "handoff missing How To Verify"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.27 debt handoff rejects ${name}`);
    } else {
      fail(`1.27 debt handoff must reject ${name}: ${output}`);
    }
  }
}

function checkGuidedClosureExperienceProtocol() {
  const required = [
    "core/guided-closure-experience.md",
    "docs/guided-closure-experience.md",
    "templates/guided-closure-card.md",
    "checklists/guided-closure-review.md",
    "prompts/guided-closure-agent.md",
    "guided-closure-cards/.gitkeep",
    "scripts/resolve-guided-closure.mjs",
    "scripts/check-guided-closure.mjs",
    "examples/1.52-guided-closure-experience/README.md",
    "examples/1.52-guided-closure-experience/guided-closure-cards/001-booking-validation.md",
    "test-fixtures/bad/bad-guided-closure-technical-burden/guided-closure-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-closure-overclaim/guided-closure-cards/001-bad.md",
    "releases/1.52.0/release-record.md",
    "releases/1.52.0/known-limitations.md",
    "releases/1.52.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.52 guided closure asset exists ${file}`);
    else fail(`1.52 guided closure asset missing ${file}`);
  }

  const combined = [
    read("core/guided-closure-experience.md"),
    read("docs/guided-closure-experience.md"),
    read("templates/guided-closure-card.md"),
    read("scripts/resolve-guided-closure.mjs"),
    read("scripts/check-guided-closure.mjs"),
    read("releases/1.52.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Guided Closure Experience",
    "Guided Closure Card",
    "Users should not need to choose",
    "NO_TASK_TO_CLOSE",
    "NEEDS_IMPACT_COVERAGE",
    "READY_FOR_REVIEW",
    "This card writes target files: No",
    "This card approves commit or push: No",
    "This card approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.52 guided closure includes ${marker}`);
    else fail(`1.52 guided closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Guided Closure Card")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.52 guided closure resolver prints safe card");
  } else {
    fail(`1.52 guided closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "GUIDED_CLOSURE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.plainCloseOutStatus?.closureState
        && Array.isArray(parsed.whatIChecked)) {
        pass("1.52 guided closure resolver JSON includes state, checks, and boundaries");
      } else {
        fail(`1.52 guided closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.52 guided closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.52 guided closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-guided-closure.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Guided Closure check passed")) {
    pass("1.52 guided closure checker passes source repo");
  } else {
    fail(`1.52 guided closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-guided-closure.mjs", "examples/1.52-guided-closure-experience"]);
  if (example.status === 0 && example.stdout.includes("Guided Closure check passed")) {
    pass("1.52 guided closure example passes checker");
  } else {
    fail(`1.52 guided closure example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["technical burden", ["scripts/check-guided-closure.mjs", "test-fixtures/bad/bad-guided-closure-technical-burden"], "internal close-out command burden"],
    ["overclaim", ["scripts/check-guided-closure.mjs", "test-fixtures/bad/bad-guided-closure-overclaim"], "forbidden guided closure claim"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.52 guided closure rejects ${name}`);
    } else {
      fail(`1.52 guided closure must reject ${name}: ${output}`);
    }
  }
}

function checkUnifiedClosureModelProtocol() {
  const required = [
    "core/unified-closure-model.md",
    "docs/unified-closure-model.md",
    "templates/closure-decision.md",
    "checklists/closure-decision-review.md",
    "prompts/closure-decision-agent.md",
    "closure-decisions/.gitkeep",
    "scripts/resolve-closure-decision.mjs",
    "scripts/check-closure-decision.mjs",
    "examples/1.53-unified-closure-model/README.md",
    "examples/1.53-unified-closure-model/closure-decisions/001-booking-validation.md",
    "test-fixtures/bad/bad-closure-decision-done-without-evidence/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-closure-decision-split-truth/closure-decisions/001-bad.md",
    "releases/1.53.0/release-record.md",
    "releases/1.53.0/known-limitations.md",
    "releases/1.53.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.53 unified closure asset exists ${file}`);
    else fail(`1.53 unified closure asset missing ${file}`);
  }

  const combined = [
    read("core/unified-closure-model.md"),
    read("docs/unified-closure-model.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("releases/1.53.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Unified Closure Model",
    "Unified Closure Decision",
    "single closure source",
    "UNIFIED_CLOSURE_DECISION",
    "NEEDS_IMPACT_COVERAGE",
    "This decision writes target files: No",
    "This decision approves commit or push: No",
    "This decision approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.53 unified closure includes ${marker}`);
    else fail(`1.53 unified closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Closure Decision")
    && resolver.stdout.includes("This decision writes target files: No")) {
    pass("1.53 unified closure resolver prints safe decision");
  } else {
    fail(`1.53 unified closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_CLOSURE_DECISION"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.closureDecision?.finalClosureSource === "UNIFIED_CLOSURE_DECISION"
        && Array.isArray(parsed.decisionInputs)) {
        pass("1.53 unified closure resolver JSON includes decision inputs and boundaries");
      } else {
        fail(`1.53 unified closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.53 unified closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.53 unified closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-closure-decision.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.53 unified closure checker passes source repo");
  } else {
    fail(`1.53 unified closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.53-unified-closure-model"]);
  if (example.status !== 0 && `${example.stdout}\n${example.stderr}`.includes("DONE requires Input Verification")) {
    pass("1.53 legacy unified closure example cannot claim verified DONE after 1.90");
  } else {
    fail(`1.53 legacy unified closure example must be rejected as unverified DONE: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["done without evidence", ["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-done-without-evidence"], "cannot be DONE without"],
    ["split truth", ["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-split-truth"], "must confirm single closure source"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.53 unified closure rejects ${name}`);
    } else {
      fail(`1.53 unified closure must reject ${name}: ${output}`);
    }
  }
}

function checkExecutionTruthHardcutProtocol() {
  const required = [
    "docs/plans/execution-truth-hardcut-1.90-plan.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/closure-decisions/001-contract-input-rule.md",
    "releases/1.90.0/release-record.md",
    "releases/1.90.0/known-limitations.md",
    "releases/1.90.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.90 execution truth asset exists ${file}`);
    else fail(`1.90 execution truth asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/execution-truth-hardcut-1.90-plan.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("scripts/check-execution-closure.mjs"),
  ].join("\n");
  for (const marker of [
    "Execution Truth Hardcut",
    "Input Verification",
    "selected execution closure report",
    "--require-precise-evidence",
    "verified Execution Closure",
  ]) {
    if (combined.includes(marker)) pass(`1.90 execution truth includes ${marker}`);
    else fail(`1.90 execution truth missing ${marker}`);
  }

  const exampleRoot = "examples/1.49-structured-impact-coverage/contract-input-rule";
  const exactClosure = runNode([
    "scripts/check-execution-closure.mjs",
    exampleRoot,
    "--report",
    "execution-closures/001-contract-input-rule.md",
    "--require-impact-coverage",
    "--require-precise-evidence",
  ]);
  if (exactClosure.status === 0 && exactClosure.stdout.includes("selected execution closure report found")) {
    pass("1.90 exact Execution Closure report passes strict validation");
  } else {
    fail(`1.90 exact Execution Closure report failed: ${exactClosure.stderr || exactClosure.stdout}`);
  }

  const closureDecision = runNode(["scripts/check-closure-decision.mjs", exampleRoot]);
  if (closureDecision.status === 0 && closureDecision.stdout.includes("verified Execution Closure passes exact strict checker")) {
    pass("1.90 recorded DONE requires verified upstream sources");
  } else {
    fail(`1.90 verified Closure Decision example failed: ${closureDecision.stderr || closureDecision.stdout}`);
  }

  const validIntent = "Add a contract input restriction that rejects blank contract titles.";
  const validResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    exampleRoot,
    "--intent",
    validIntent,
    "--task",
    exampleRoot,
    "--intent-digest",
    `sha256:${crypto.createHash("sha256").update(validIntent).digest("hex")}`,
    "--verification",
    "targeted contract validation checks passed",
    "--execution-closure",
    "execution-closures/001-contract-input-rule.md",
    "--impact-report",
    "change-impact-coverage-reports/001-contract-input-rule.md",
    "--json",
  ]);
  if (validResolver.status === 0) {
    try {
      const parsed = JSON.parse(validResolver.stdout);
      if (parsed.closureDecision?.decision === "DONE"
        && parsed.inputVerification?.some((item) => item.input === "Execution Closure" && item.verified === "Yes")
        && parsed.inputVerification?.some((item) => item.input === "Change Impact Coverage" && item.verified === "Yes")) {
        pass("1.90 resolver returns DONE only with verified matched evidence");
      } else {
        fail(`1.90 resolver valid decision missing verified inputs: ${validResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 resolver valid decision JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 resolver valid decision failed: ${validResolver.stderr || validResolver.stdout}`);
  }

  const staleResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report",
    "--intent",
    "unrelated current task",
    "--verification",
    "passed",
    "--execution-closure",
    "execution-closures/001-contract-input-rule.md",
    "--human-decision",
    "execution-closures/001-contract-input-rule.md",
    "--json",
  ]);
  if (staleResolver.status === 0) {
    try {
      const parsed = JSON.parse(staleResolver.stdout);
      if (parsed.closureDecision?.decision !== "DONE"
        && parsed.decisionInputs?.some((item) => item.input === "Execution Closure" && item.status === "FAIL")) {
        pass("1.90 stale Execution Closure cannot produce DONE");
      } else {
        fail(`1.90 stale Execution Closure must not produce DONE: ${staleResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 stale resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 stale resolver failed unexpectedly: ${staleResolver.stderr || staleResolver.stdout}`);
  }

  const lowRiskResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    exampleRoot,
    "--intent",
    "Clarify a documentation sentence.",
    "--verification",
    "documentation review passed",
    "--json",
  ]);
  if (lowRiskResolver.status === 0) {
    try {
      const parsed = JSON.parse(lowRiskResolver.stdout);
      const humanDecision = parsed.decisionInputs?.find((item) => item.input === "Human Decision");
      const executionClosure = parsed.decisionInputs?.find((item) => item.input === "Execution Closure");
      const impactCoverage = parsed.decisionInputs?.find((item) => item.input === "Change Impact Coverage");
      if (humanDecision?.status === "N/A" && executionClosure?.status === "MISSING" && impactCoverage?.status === "N/A") {
        pass("1.90 low-risk intent is not escalated or bound to unrelated historical evidence");
      } else {
        fail(`1.90 low-risk intent must not require Human Decision or consume unrelated historical evidence: ${lowRiskResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.90 low-risk resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.90 low-risk resolver failed unexpectedly: ${lowRiskResolver.stderr || lowRiskResolver.stdout}`);
  }

  const scopedGitRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-closure-git-scope-"));
  const scopedProjectRoot = path.join(scopedGitRoot, "target-project");
  fs.mkdirSync(scopedProjectRoot, { recursive: true });
  fs.writeFileSync(path.join(scopedProjectRoot, "README.md"), "# Scoped target project\n");
  spawnSync("git", ["init"], { cwd: scopedGitRoot, encoding: "utf8" });
  spawnSync("git", ["add", "."], { cwd: scopedGitRoot, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=IntentOS Self Check", "-c", "user.email=intentos@example.invalid", "commit", "-m", "initial"], {
    cwd: scopedGitRoot,
    encoding: "utf8",
  });
  fs.writeFileSync(path.join(scopedGitRoot, "release-workflow-draft.md"), "dirty parent-only release note\n");
  const scopedLowRiskResolver = runNode([
    "scripts/resolve-closure-decision.mjs",
    scopedProjectRoot,
    "--intent",
    "Clarify a documentation sentence.",
    "--verification",
    "documentation review passed",
    "--json",
  ]);
  if (scopedLowRiskResolver.status === 0) {
    try {
      const parsed = JSON.parse(scopedLowRiskResolver.stdout);
      const humanDecision = parsed.decisionInputs?.find((item) => item.input === "Human Decision");
      const gitWorktree = parsed.decisionInputs?.find((item) => item.input === "Git worktree");
      if (humanDecision?.status === "N/A" && gitWorktree?.status === "PASS") {
        pass("1.91.1 closure Git risk signals stay scoped to the target subproject");
      } else {
        fail(`1.91.1 closure Git risk signals must ignore dirty parent-only files: ${scopedLowRiskResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.91.1 scoped Git closure JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.91.1 scoped Git closure resolver failed: ${scopedLowRiskResolver.stderr || scopedLowRiskResolver.stdout}`);
  }

  const unsafeReport = runNode([
    "scripts/check-execution-closure.mjs",
    exampleRoot,
    "--report",
    "../execution-closures/001-contract-input-rule.md",
  ]);
  if (unsafeReport.status !== 0 && `${unsafeReport.stdout}\n${unsafeReport.stderr}`.includes("path is unsafe")) {
    pass("1.90 exact report checker rejects traversal");
  } else {
    fail(`1.90 exact report checker must reject traversal: ${unsafeReport.stderr || unsafeReport.stdout}`);
  }
}

function checkEvidenceAuthorityCoreProtocol() {
  const required = [
    "docs/plans/evidence-authority-core-1.91-plan.md",
    "scripts/lib/evidence-authority.mjs",
    "releases/1.91.0/release-record.md",
    "releases/1.91.0/known-limitations.md",
    "releases/1.91.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.91 evidence authority asset exists ${file}`);
    else fail(`1.91 evidence authority asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/evidence-authority-core-1.91-plan.md"),
    read("scripts/lib/evidence-authority.mjs"),
    read("scripts/lib/artifact-schema.mjs"),
    read("scripts/lib/path-safety.mjs"),
    read("scripts/check-verification-plan.mjs"),
    read("scripts/check-test-evidence.mjs"),
    read("scripts/check-execution-assurance.mjs"),
    read("scripts/check-completion-evidence.mjs"),
  ].join("\n");
  for (const marker of [
    "Evidence Authority Core",
    "--require-evidence-authority",
    "authority_binding",
    "raw_file_digest",
    "must not pass through or overwrite a symlink",
  ]) {
    if (combined.includes(marker)) pass(`1.91 evidence authority includes ${marker}`);
    else fail(`1.91 evidence authority missing ${marker}`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-evidence-authority-"));
  try {
    fs.cpSync(path.join(kitRoot, "examples/1.76-verification-plan/appointment-service-time"), tempRoot, { recursive: true });
    const planReport = "verification-plans/001-authority.md";
    const resolve = runNode([
      "scripts/resolve-verification-plan.mjs",
      tempRoot,
      "--intent",
      "appointment requests must include a service time",
      "--business-rule-ref",
      "artifact:business-rule-closures/001-service-time.md",
      "--impact-ref",
      "artifact:change-impact-coverage-reports/001-service-time.md",
      "--project-level",
      "BL1",
      "--platform",
      "web,backend",
      "--out",
      planReport,
    ]);
    const strictArgs = [
      "scripts/check-verification-plan.mjs",
      tempRoot,
      "--report",
      planReport,
      "--require-structured-evidence",
      "--require-business-rule-ref",
      "--require-impact-ref",
      "--strict-source-binding",
      "--require-evidence-authority",
    ];
    const strictCheck = runNode(strictArgs);
    if (resolve.status === 0 && strictCheck.status === 0 && strictCheck.stdout.includes("authority binding matches the current project")) {
      pass("1.91 generated Verification Plan passes strict evidence authority validation");
    } else {
      fail(`1.91 generated Verification Plan strict authority validation failed: ${strictCheck.stderr || strictCheck.stdout || resolve.stderr || resolve.stdout}`);
      return;
    }

    const shadowPath = path.join(tempRoot, "schemas", "artifacts", "verification-plan.schema.json");
    fs.mkdirSync(path.dirname(shadowPath), { recursive: true });
    fs.writeFileSync(shadowPath, JSON.stringify({ type: "object" }, null, 2));
    const shadowCheck = runNode(strictArgs);
    if (shadowCheck.status === 0) pass("1.91 target schema shadow cannot weaken the authoritative artifact schema");
    else fail(`1.91 target schema shadow must not affect authority: ${shadowCheck.stderr || shadowCheck.stdout}`);

    const reportPath = path.join(tempRoot, planReport);
    const original = fs.readFileSync(reportPath, "utf8");
    rewriteMachineEvidence(reportPath, (evidence) => {
      evidence.authority_binding.sources[0].raw_file_digest = `sha256:${"0".repeat(64)}`;
      evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
      return evidence;
    });
    const staleDigestCheck = runNode(strictArgs);
    if (staleDigestCheck.status !== 0 && `${staleDigestCheck.stdout}\n${staleDigestCheck.stderr}`.includes("raw_file_digest does not match")) {
      pass("1.91 strict authority rejects a stale source file digest");
    } else {
      fail(`1.91 strict authority must reject stale source digest: ${staleDigestCheck.stderr || staleDigestCheck.stdout}`);
    }

    fs.writeFileSync(reportPath, original);
    rewriteMachineEvidence(reportPath, (evidence) => {
      evidence.authority_binding.task.task_ref = "tasks/other-task.md";
      evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
      return evidence;
    });
    const taskMismatchCheck = runNode(strictArgs);
    if (taskMismatchCheck.status !== 0 && `${taskMismatchCheck.stdout}\n${taskMismatchCheck.stderr}`.includes("authority_binding.task.task_ref")) {
      pass("1.91 strict authority rejects a task-mismatched binding");
    } else {
      fail(`1.91 strict authority must reject task mismatch: ${taskMismatchCheck.stderr || taskMismatchCheck.stdout}`);
    }

    fs.writeFileSync(reportPath, original);
    const sourcePath = path.join(tempRoot, "business-rule-closures", "001-service-time.md");
    const external = path.join(tempRoot, "..", `${path.basename(tempRoot)}-outside-evidence.md`);
    fs.writeFileSync(external, "outside project evidence\n");
    fs.rmSync(sourcePath);
    fs.symlinkSync(external, sourcePath);
    const symlinkCheck = runNode(strictArgs);
    if (symlinkCheck.status !== 0 && `${symlinkCheck.stdout}\n${symlinkCheck.stderr}`.includes("symlink")) {
      pass("1.91 strict authority rejects an evidence symlink escape");
    } else {
      fail(`1.91 strict authority must reject symlink evidence escape: ${symlinkCheck.stderr || symlinkCheck.stdout}`);
    }
    fs.rmSync(external, { force: true });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkDecisionExplainTraceProtocol() {
  const required = [
    "core/decision-explain-trace.md",
    "docs/decision-explain-trace.md",
    "docs/plans/decision-explain-trace-1.54-plan.md",
    "examples/1.54-decision-explain-trace/README.md",
    "examples/1.54-decision-explain-trace/closure-decisions/001-contract-approval-rule.md",
    "test-fixtures/bad/bad-closure-decision-missing-explain-trace/closure-decisions/001-bad.md",
    "releases/1.54.0/release-record.md",
    "releases/1.54.0/known-limitations.md",
    "releases/1.54.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.54 decision explain trace asset exists ${file}`);
    else fail(`1.54 decision explain trace asset missing ${file}`);
  }

  const combined = [
    read("core/decision-explain-trace.md"),
    read("docs/decision-explain-trace.md"),
    read("templates/closure-decision.md"),
    read("scripts/resolve-closure-decision.mjs"),
    read("scripts/check-closure-decision.mjs"),
    read("releases/1.54.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Decision Explain Trace",
    "Decision Trace",
    "Dominant Reason",
    "Conflict Summary",
    "why the single Unified Closure Decision was selected",
    "does not create a second final closure source",
  ]) {
    if (combined.includes(marker)) pass(`1.54 decision explain trace includes ${marker}`);
    else fail(`1.54 decision explain trace missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure explanation", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("## Decision Trace")
    && resolver.stdout.includes("## Dominant Reason")
    && resolver.stdout.includes("## Conflict Summary")) {
    pass("1.54 closure resolver prints explain trace sections");
  } else {
    fail(`1.54 closure resolver missing explain trace sections: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure explanation", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (Array.isArray(parsed.decisionTrace)
        && parsed.decisionTrace.length >= 3
        && parsed.dominantReason?.whyThisDecides
        && parsed.conflictSummary?.summary) {
        pass("1.54 closure resolver JSON includes explain trace fields");
      } else {
        fail(`1.54 closure resolver JSON missing explain trace fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.54 closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.54 closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.54-decision-explain-trace"]);
  if (example.status === 0 && example.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.54 decision explain trace example passes checker");
  } else {
    fail(`1.54 decision explain trace example failed: ${example.stderr || example.stdout}`);
  }

  const bad = runNode(["scripts/check-closure-decision.mjs", "test-fixtures/bad/bad-closure-decision-missing-explain-trace"]);
  const badOutput = `${bad.stdout}\n${bad.stderr}`;
  if (bad.status !== 0 && badOutput.includes("missing section Decision Trace")) {
    pass("1.54 decision explain trace rejects missing trace");
  } else {
    fail(`1.54 decision explain trace must reject missing trace: ${badOutput}`);
  }
}

function checkLaunchReviewViewProtocol() {
  const required = [
    "core/launch-review-view.md",
    "docs/launch-review-view.md",
    "templates/launch-review-view-card.md",
    "checklists/launch-review-view-review.md",
    "prompts/launch-review-view-agent.md",
    "launch-review-views/.gitkeep",
    "scripts/resolve-launch-review-view.mjs",
    "scripts/check-launch-review-view.mjs",
    "docs/plans/launch-review-view-1.55-plan.md",
    "examples/1.55-launch-review-view/web-internal-handoff/README.md",
    "examples/1.55-launch-review-view/web-internal-handoff/launch-review-views/001-web-mvp.md",
    "test-fixtures/bad/bad-launch-view-missing-closure/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-release-review-missing-rollback/launch-review-views/001-bad.md",
    "test-fixtures/bad/bad-launch-view-claims-production-approval/launch-review-views/001-bad.md",
    "releases/1.55.0/release-record.md",
    "releases/1.55.0/known-limitations.md",
    "releases/1.55.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.55 launch review view asset exists ${file}`);
    else fail(`1.55 launch review view asset missing ${file}`);
  }

  const combined = [
    read("core/launch-review-view.md"),
    read("docs/launch-review-view.md"),
    read("templates/launch-review-view-card.md"),
    read("scripts/resolve-launch-review-view.mjs"),
    read("scripts/check-launch-review-view.mjs"),
    read("docs/plans/launch-review-view-1.55-plan.md"),
    read("releases/1.55.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Launch Review View",
    "Unified Closure Decision",
    "Safe Launch readiness labels",
    "Current-user consent to the concrete external effect",
    "must not override Unified Closure",
    "does not create a second launch decision system",
    "READY_FOR_RELEASE_REVIEW",
    "This view approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`1.55 launch review view includes ${marker}`);
    else fail(`1.55 launch review view missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Launch Review View")
    && resolver.stdout.includes("## Unified Closure Input")
    && resolver.stdout.includes("## Safe Launch View")
    && resolver.stdout.includes("This view approves release or production: No")) {
    pass("1.55 launch review resolver prints safe view");
  } else {
    fail(`1.55 launch review resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-launch-review-view.mjs", ".", "--intent", "prepare release review", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "LAUNCH_REVIEW_VIEW"
        && parsed.unifiedClosureInput?.closureDecision
        && parsed.safeLaunchView?.safeLaunchLabel
        && parsed.boundaries?.approvesReleaseOrProduction === "No") {
        pass("1.55 launch review resolver JSON includes closure input, label, and boundary");
      } else {
        fail(`1.55 launch review resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.55 launch review resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.55 launch review resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-launch-review-view.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Launch Review View check passed")) {
    pass("1.55 launch review checker passes source repo");
  } else {
    fail(`1.55 launch review checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-launch-review-view.mjs", "examples/1.55-launch-review-view/web-internal-handoff"]);
  if (example.status === 0 && example.stdout.includes("Launch Review View check passed")) {
    pass("1.55 launch review example passes checker");
  } else {
    fail(`1.55 launch review example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected, extraArgs = []] of [
    ["missing closure", "test-fixtures/bad/bad-launch-view-missing-closure", "must reference Unified Closure input"],
    ["release review missing rollback", "test-fixtures/bad/bad-launch-view-release-review-missing-rollback", "requires Rollback PASS"],
    ["production approval claim", "test-fixtures/bad/bad-launch-view-claims-production-approval", "forbidden launch review claim"],
  ]) {
    const result = runNode(["scripts/check-launch-review-view.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.55 launch review rejects ${name}`);
    } else {
      fail(`1.55 launch review must reject ${name}: ${output}`);
    }
  }
}

function checkReleaseExecutionProtocol() {
  const required = [
    "core/release-execution-protocol.md",
    "docs/release-execution-protocol.md",
    "templates/release-execution-plan.md",
    "checklists/release-execution-review.md",
    "prompts/release-execution-agent.md",
    "release-execution-plans/.gitkeep",
    "scripts/resolve-release-execution.mjs",
    "scripts/check-release-execution.mjs",
    "docs/plans/release-execution-protocol-1.56-plan.md",
    "examples/1.56-release-execution/web-assisted-handoff/README.md",
    "examples/1.56-release-execution/web-assisted-handoff/release-execution-plans/001-web-release.md",
    "test-fixtures/bad/bad-release-execution-missing-launch-view/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-assisted-without-approval/release-execution-plans/001-bad.md",
    "test-fixtures/bad/bad-release-execution-auto-production-deploy/release-execution-plans/001-bad.md",
    "releases/1.56.0/release-record.md",
    "releases/1.56.0/known-limitations.md",
    "releases/1.56.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.56 release execution asset exists ${file}`);
    else fail(`1.56 release execution asset missing ${file}`);
  }

  const combined = [
    read("core/release-execution-protocol.md"),
    read("docs/release-execution-protocol.md"),
    read("templates/release-execution-plan.md"),
    read("scripts/resolve-release-execution.mjs"),
    read("scripts/check-release-execution.mjs"),
    read("docs/plans/release-execution-protocol-1.56-plan.md"),
    read("releases/1.56.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Execution Protocol",
    "Launch Review View",
    "current user consented to the exact external effect",
    "ASSISTED_EXECUTION",
    "does not mean technical readiness automatically publishes or deploys",
    "This plan approves release: No",
    "This plan executes release by itself: No",
    "does not make Codex the release owner",
  ]) {
    if (combined.includes(marker)) pass(`1.56 release execution includes ${marker}`);
    else fail(`1.56 release execution missing ${marker}`);
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

  const source = runNode(["scripts/check-release-execution.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Execution check passed")) {
    pass("1.56 release execution checker passes source repo");
  } else {
    fail(`1.56 release execution checker failed: ${source.stderr || source.stdout}`);
  }

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

function checkReleasePlanProtocol() {
  const required = [
    "core/release-core-model.md",
    "docs/release-core-model.md",
    "templates/release-plan.md",
    "schemas/artifacts/release-plan.schema.json",
    "checklists/release-plan-review.md",
    "prompts/release-plan-agent.md",
    "release-plans/.gitkeep",
    "scripts/resolve-release-plan.mjs",
    "scripts/check-release-plan.mjs",
    "docs/plans/release-core-model-consolidation-1.67-plan.md",
    "examples/1.67-release-core-model/README.md",
    "examples/1.67-release-core-model/web-preview/README.md",
    "examples/1.67-release-core-model/web-preview/release-plans/001-web-preview.md",
    "examples/1.67-release-core-model/mini-program-review/README.md",
    "examples/1.67-release-core-model/mini-program-review/release-plans/001-mini-program-review.md",
    "examples/1.67-release-core-model/backend-api-handoff/README.md",
    "examples/1.67-release-core-model/backend-api-handoff/release-plans/001-backend-api-handoff.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/README.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/AGENTS.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_ENGINEERING_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_ENVIRONMENT_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/release-plans/001-governed-existing-project.md",
    "test-fixtures/bad/bad-release-plan-approves-production/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-codex-owner/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-secret-request/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-provider-exec/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-skips-native-migration/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-missing-trace/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-replaces-lower-level-system/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-asset-migration-maximize-governed-project/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-trace-controls-execution/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-state-drives-execution/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-operating-mode-writes-files/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-ignores-existing-rules/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-extra-dangerous-field/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-chinese-forbidden-claim/release-plans/001-bad.md",
    "releases/1.67.0/release-record.md",
    "releases/1.67.0/known-limitations.md",
    "releases/1.67.0/self-check-report.md",
    "releases/1.67.1/release-record.md",
    "releases/1.67.1/known-limitations.md",
    "releases/1.67.1/self-check-report.md",
    "releases/1.67.2/release-record.md",
    "releases/1.67.2/known-limitations.md",
    "releases/1.67.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.67 release plan asset exists ${file}`);
    else fail(`1.67 release plan asset missing ${file}`);
  }

  const combined = [
    read("core/release-core-model.md"),
    read("docs/release-core-model.md"),
    read("templates/release-plan.md"),
    read("schemas/artifacts/release-plan.schema.json"),
    read("scripts/resolve-release-plan.mjs"),
    read("scripts/check-release-plan.mjs"),
    read("docs/plans/release-core-model-consolidation-1.67-plan.md"),
    read("releases/1.67.0/release-record.md"),
    read("releases/1.67.1/release-record.md"),
    read("releases/1.67.2/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Core Model",
    "Release Plan",
    "pure view model",
    "Source Systems Stay Authoritative",
    "IntentOS Operating Mode",
    "Project Asset Migration Depth",
    "Existing Rule Comparison Contract",
    "This plan approves release: No",
    "This plan treats IntentOS Operating Mode as write permission: No",
    "trace_controls_execution",
    "summary_state_drives_execution",
    "release_plan_evidence",
    "release_plan_digest",
    "additionalProperties",
  ]) {
    if (combined.includes(marker)) pass(`1.67 release plan includes ${marker}`);
    else fail(`1.67 release plan missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Plan")
    && resolver.stdout.includes("## Release Plan Trace")
    && resolver.stdout.includes("## Existing Project Rule Comparison")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan treats IntentOS Operating Mode as write permission: No")) {
    pass("1.67 release plan resolver prints pure-view release plan");
  } else {
    fail(`1.67 release plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_PLAN"
        && parsed.humanSummary?.summaryStateKind === "SUMMARY_ONLY"
        && parsed.humanSummary?.intentosOperatingMode === "ACTIVE"
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.treatsIntentosOperatingModeAsWritePermission === "No"
        && parsed.releasePlanTrace?.every((item) => item.controlAuthority === "No")
        && parsed.existingProjectRuleComparison?.length > 0) {
        pass("1.67 release plan resolver JSON includes pure view, trace, and rule comparison");
      } else {
        fail(`1.67 release plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.67 release plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.67 release plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-plan.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Plan check passed")) {
    pass("1.67 release plan checker passes source repo");
  } else {
    fail(`1.67 release plan checker failed: ${source.stderr || source.stdout}`);
  }

  for (const target of [
    "examples/1.67-release-core-model/web-preview",
    "examples/1.67-release-core-model/mini-program-review",
    "examples/1.67-release-core-model/backend-api-handoff",
    "examples/1.67-release-core-model/governed-existing-project-readonly",
  ]) {
    const example = runNode(["scripts/check-release-plan.mjs", target, "--require-structured-evidence"]);
    if (example.status === 0 && example.stdout.includes("Release Plan check passed")) {
      pass(`1.67 release plan example passes checker ${target}`);
    } else {
      fail(`1.67 release plan example failed ${target}: ${example.stderr || example.stdout}`);
    }
  }

  for (const [name, target, expected] of [
    ["approves production", "test-fixtures/bad/bad-release-plan-approves-production", "forbidden release plan claim"],
    ["codex owner", "test-fixtures/bad/bad-release-plan-codex-owner", "forbidden release plan claim"],
    ["secret request", "test-fixtures/bad/bad-release-plan-secret-request", "forbidden release plan claim"],
    ["provider execution", "test-fixtures/bad/bad-release-plan-provider-exec", "forbidden release plan claim"],
    ["skips native migration", "test-fixtures/bad/bad-release-plan-skips-native-migration", "forbidden release plan claim"],
    ["missing trace", "test-fixtures/bad/bad-release-plan-missing-trace", "at least three trace rows"],
    ["replaces lower-level system", "test-fixtures/bad/bad-release-plan-replaces-lower-level-system", "forbidden release plan claim"],
    ["asset migration maximize", "test-fixtures/bad/bad-release-plan-asset-migration-maximize-governed-project", "must not maximize"],
    ["trace controls execution", "test-fixtures/bad/bad-release-plan-trace-controls-execution", "forbidden release plan claim"],
    ["state drives execution", "test-fixtures/bad/bad-release-plan-state-drives-execution", "forbidden release plan claim"],
    ["operating mode writes files", "test-fixtures/bad/bad-release-plan-operating-mode-writes-files", "forbidden release plan claim"],
    ["ignores existing rules", "test-fixtures/bad/bad-release-plan-ignores-existing-rules", "forbidden release plan claim"],
    ["extra dangerous field", "test-fixtures/bad/bad-release-plan-extra-dangerous-field", "is not allowed"],
    ["Chinese forbidden claim", "test-fixtures/bad/bad-release-plan-chinese-forbidden-claim", "forbidden release plan claim"],
  ]) {
    const result = runNode(["scripts/check-release-plan.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.67 release plan rejects ${name}`);
    } else {
      fail(`1.67 release plan must reject ${name}: ${output}`);
    }
  }
}

function checkReleaseAdapterProtocol() {
  const required = [
    "core/release-adapter.md",
    "docs/release-adapter.md",
    "templates/release-adapter-profile.md",
    "checklists/release-adapter-review.md",
    "prompts/release-adapter-agent.md",
    "release-adapters/.gitkeep",
    "scripts/resolve-release-adapter.mjs",
    "scripts/check-release-adapter.mjs",
    "docs/plans/guided-release-adapter-1.57-plan.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/README.md",
    "examples/1.57-guided-release-adapter/web-vercel-preview/release-adapters/001-release-adapter.md",
    "test-fixtures/bad/bad-release-adapter-missing-beginner-card/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-codex-auto-production/release-adapters/001-bad.md",
    "test-fixtures/bad/bad-release-adapter-secret-request/release-adapters/001-bad.md",
    "releases/1.57.0/release-record.md",
    "releases/1.57.0/known-limitations.md",
    "releases/1.57.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.57 release adapter asset exists ${file}`);
    else fail(`1.57 release adapter asset missing ${file}`);
  }

  const combined = [
    read("core/release-adapter.md"),
    read("docs/release-adapter.md"),
    read("templates/release-adapter-profile.md"),
    read("scripts/resolve-release-adapter.mjs"),
    read("scripts/check-release-adapter.mjs"),
    read("docs/plans/guided-release-adapter-1.57-plan.md"),
    read("releases/1.57.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Guided Release Adapter",
    "Beginner Release Card",
    "Project Release Profile",
    "Release Execution Protocol",
    "This adapter approves release: No",
    "This adapter deploys by itself: No",
    "does not ask for or store secrets",
    "does not treat beginner confirmation as production approval",
  ]) {
    if (combined.includes(marker)) pass(`1.57 release adapter includes ${marker}`);
    else fail(`1.57 release adapter missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Adapter Profile")
    && resolver.stdout.includes("## Beginner Release Card")
    && resolver.stdout.includes("This adapter approves release: No")
    && resolver.stdout.includes("This adapter deploys by itself: No")) {
    pass("1.57 release adapter resolver prints safe profile");
  } else {
    fail(`1.57 release adapter resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-adapter.mjs", ".", "--intent", "prepare release adapter", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_ADAPTER_PROFILE"
        && parsed.humanSummary?.adapterState
        && parsed.beginnerReleaseCard?.recommendedChoice
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.deploysByItself === "No") {
        pass("1.57 release adapter resolver JSON includes state, beginner card, and boundaries");
      } else {
        fail(`1.57 release adapter resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.57 release adapter resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.57 release adapter resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-adapter.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Adapter check passed")) {
    pass("1.57 release adapter checker passes source repo");
  } else {
    fail(`1.57 release adapter checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-release-adapter.mjs", "examples/1.57-guided-release-adapter/web-vercel-preview"]);
  if (example.status === 0 && example.stdout.includes("Release Adapter check passed")) {
    pass("1.57 release adapter example passes checker");
  } else {
    fail(`1.57 release adapter example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing beginner card", "test-fixtures/bad/bad-release-adapter-missing-beginner-card", "must include Beginner Release Card"],
    ["codex auto production", "test-fixtures/bad/bad-release-adapter-codex-auto-production", "assigns high-risk release action to Codex"],
    ["secret request", "test-fixtures/bad/bad-release-adapter-secret-request", "contains secret-like content"],
  ]) {
    const result = runNode(["scripts/check-release-adapter.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.57 release adapter rejects ${name}`);
    } else {
      fail(`1.57 release adapter must reject ${name}: ${output}`);
    }
  }
}

function checkReleaseGuideProtocol() {
  const required = [
    "core/release-guide.md",
    "docs/release-guide.md",
    "templates/release-guide-card.md",
    "templates/release-approval-record.md",
    "checklists/release-guide-review.md",
    "prompts/release-guide-agent.md",
    "release-guides/.gitkeep",
    "scripts/resolve-release-guide.mjs",
    "scripts/check-release-guide.mjs",
    "docs/plans/release-path-consolidation-1.58-plan.md",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/README.md",
    "examples/1.58-release-guide-consolidation/web-preview-release-guide/release-guides/001-release-guide.md",
    "test-fixtures/bad/bad-release-guide-unstructured-approval/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-codex-production/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-remote-local/release-guides/001-bad.md",
    "test-fixtures/bad/bad-release-guide-weak-evidence/release-guides/001-bad.md",
    "releases/1.58.0/release-record.md",
    "releases/1.58.0/known-limitations.md",
    "releases/1.58.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.58 release guide asset exists ${file}`);
    else fail(`1.58 release guide asset missing ${file}`);
  }

  const combined = [
    read("core/release-guide.md"),
    read("docs/release-guide.md"),
    read("templates/release-guide-card.md"),
    read("templates/release-approval-record.md"),
    read("scripts/resolve-release-guide.mjs"),
    read("scripts/check-release-guide.mjs"),
    read("docs/plans/release-path-consolidation-1.58-plan.md"),
    read("docs/plans/release-path-consolidation-1.58-1.60-plan.md"),
    read("releases/1.58.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Guide",
    "Structured Approval",
    "Assist Levels",
    "Command Risk Classes",
    "Evidence Quality",
    "This guide approves release: No",
    "This guide deploys or publishes by itself: No",
    "Unknown commands default to NO_RUN",
    "does not call provider APIs",
    "does not request, store, print, or infer secrets",
  ]) {
    if (combined.includes(marker)) pass(`1.58 release guide includes ${marker}`);
    else fail(`1.58 release guide missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Guide Card")
    && resolver.stdout.includes("## Structured Release Approval Gate")
    && resolver.stdout.includes("## Assist Level Classification")
    && resolver.stdout.includes("This guide approves release: No")
    && resolver.stdout.includes("This guide deploys or publishes by itself: No")) {
    pass("1.58 release guide resolver prints safe guide");
  } else {
    fail(`1.58 release guide resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_GUIDE_CARD"
        && parsed.humanSummary?.guideState
        && Array.isArray(parsed.structuredReleaseApprovalGate)
        && parsed.assistLevelClassification?.some((item) => item.level === "PREVIEW_ASSIST")
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.deploysOrPublishesByItself === "No") {
        pass("1.58 release guide resolver JSON includes approval, assist, and boundaries");
      } else {
        fail(`1.58 release guide resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.58 release guide resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.58 release guide resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-release-guide.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Guide check passed")) {
    pass("1.58 release guide checker passes source repo");
  } else {
    fail(`1.58 release guide checker failed: ${source.stderr || source.stdout}`);
  }

  const example = runNode(["scripts/check-release-guide.mjs", "examples/1.58-release-guide-consolidation/web-preview-release-guide"]);
  if (example.status === 0 && example.stdout.includes("Release Guide check passed")) {
    pass("1.58 release guide example passes checker");
  } else {
    fail(`1.58 release guide example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["unstructured approval", "test-fixtures/bad/bad-release-guide-unstructured-approval", "requires structured approval field"],
    ["codex production", "test-fixtures/bad/bad-release-guide-codex-production", "production handoff must be human"],
    ["remote local", "test-fixtures/bad/bad-release-guide-remote-local", "remote side-effect"],
    ["weak evidence", "test-fixtures/bad/bad-release-guide-weak-evidence", "PASS without concrete ref"],
  ]) {
    const result = runNode(["scripts/check-release-guide.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.58 release guide rejects ${name}`);
    } else {
      fail(`1.58 release guide must reject ${name}: ${output}`);
    }
  }
}

function checkPlatformReleaseRecipeProtocol() {
  const required = [
    "core/platform-release-recipes.md",
    "docs/platform-release-recipes.md",
    "templates/platform-release-recipe.md",
    "checklists/platform-release-recipe-review.md",
    "prompts/platform-release-recipe-agent.md",
    "release-recipes/.gitkeep",
    "release-recipes/web-hosted-preview.md",
    "release-recipes/backend-api-handoff.md",
    "release-recipes/mini-program-review-handoff.md",
    "release-recipes/draft-ios-testflight.md",
    "release-recipes/draft-android-internal-testing.md",
    "release-recipes/draft-internal-admin-rollout.md",
    "release-recipes/draft-web-container-release.md",
    "scripts/resolve-platform-release-recipe.mjs",
    "scripts/check-platform-release-recipe.mjs",
    "docs/plans/platform-release-recipes-1.59-plan.md",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/README.md",
    "examples/1.59-platform-release-recipes/web-hosted-preview/release-recipes/001-web-hosted-preview.md",
    "examples/1.59-platform-release-recipes/mini-program-review/README.md",
    "examples/1.59-platform-release-recipes/mini-program-review/release-recipes/001-mini-program-review.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/README.md",
    "examples/1.59-platform-release-recipes/backend-api-handoff/release-recipes/001-backend-api-handoff.md",
    "test-fixtures/bad/bad-release-recipe-codex-production/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-secret-request/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-rollback/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-monitoring/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-missing-owner/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-provider-certainty/release-recipes/001-bad.md",
    "test-fixtures/bad/bad-release-recipe-draft-strict/release-recipes/001-bad.md",
    "releases/1.59.0/release-record.md",
    "releases/1.59.0/known-limitations.md",
    "releases/1.59.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.59 platform release recipe asset exists ${file}`);
    else fail(`1.59 platform release recipe asset missing ${file}`);
  }

  const combined = [
    read("core/platform-release-recipes.md"),
    read("docs/platform-release-recipes.md"),
    read("templates/platform-release-recipe.md"),
    read("scripts/resolve-platform-release-recipe.mjs"),
    read("scripts/check-platform-release-recipe.mjs"),
    read("docs/plans/platform-release-recipes-1.59-plan.md"),
    read("docs/plans/release-path-consolidation-1.58-1.60-plan.md"),
    read("releases/1.59.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Platform Release Recipes",
    "Strict And Draft Recipes",
    "web-hosted-preview",
    "backend-api-handoff",
    "mini-program-review-handoff",
    "DRAFT",
    "does not approve release",
    "does not execute release commands",
    "provider APIs",
    "secrets",
    "draft recipes",
  ]) {
    if (combined.includes(marker)) pass(`1.59 platform release recipe includes ${marker}`);
    else fail(`1.59 platform release recipe missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Platform Release Recipe Selection")
    && resolver.stdout.includes("## Beginner Recipe Card")
    && resolver.stdout.includes("This recipe approves release: No")
    && resolver.stdout.includes("This recipe deploys or publishes by itself: No")) {
    pass("1.59 platform release recipe resolver prints safe selection");
  } else {
    fail(`1.59 platform release recipe resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-platform-release-recipe.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "PLATFORM_RELEASE_RECIPE_SELECTION"
        && parsed.humanSummary?.selectedRecipeId
        && parsed.boundaries?.approvesRelease === "No"
        && Array.isArray(parsed.codexAllowedActions)) {
        pass("1.59 platform release recipe resolver JSON includes recipe, boundaries, and allowed actions");
      } else {
        fail(`1.59 platform release recipe resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.59 platform release recipe resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.59 platform release recipe resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const source = runNode(["scripts/check-platform-release-recipe.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Platform Release Recipe check passed")) {
    pass("1.59 platform release recipe checker passes source repo");
  } else {
    fail(`1.59 platform release recipe checker failed: ${source.stderr || source.stdout}`);
  }

  for (const target of [
    "examples/1.59-platform-release-recipes/web-hosted-preview",
    "examples/1.59-platform-release-recipes/mini-program-review",
    "examples/1.59-platform-release-recipes/backend-api-handoff",
  ]) {
    const result = runNode(["scripts/check-platform-release-recipe.mjs", target, "--strict"]);
    if (result.status === 0 && result.stdout.includes("Platform Release Recipe check passed")) {
      pass(`1.59 platform release recipe example passes ${target}`);
    } else {
      fail(`1.59 platform release recipe example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  const guideJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (guideJson.status === 0) {
    try {
      const parsed = JSON.parse(guideJson.stdout);
      if (Array.isArray(parsed.platformReleaseRecipe)
        && parsed.releaseGuideRouting?.some((item) => item.stage === "Platform Release Recipe")) {
        pass("1.59 release guide consumes platform release recipe selection");
      } else {
        fail(`1.59 release guide missing platform release recipe bridge: ${guideJson.stdout}`);
      }
    } catch (error) {
      fail(`1.59 release guide platform recipe JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.59 release guide platform recipe bridge failed: ${guideJson.stderr || guideJson.stdout}`);
  }

  for (const [name, target, expected, mode] of [
    ["codex production", "test-fixtures/bad/bad-release-recipe-codex-production", "Codex Allowed Actions", ""],
    ["secret request", "test-fixtures/bad/bad-release-recipe-secret-request", "secret", ""],
    ["missing rollback", "test-fixtures/bad/bad-release-recipe-missing-rollback", "Rollback Requirements", ""],
    ["missing monitoring", "test-fixtures/bad/bad-release-recipe-missing-monitoring", "Monitoring Requirements", ""],
    ["missing owner", "test-fixtures/bad/bad-release-recipe-missing-owner", "Release Owner", ""],
    ["provider certainty", "test-fixtures/bad/bad-release-recipe-provider-certainty", "provider assumptions", ""],
    ["draft strict", "test-fixtures/bad/bad-release-recipe-draft-strict", "cannot pass --strict", "--strict"],
  ]) {
    const command = ["scripts/check-platform-release-recipe.mjs", target];
    if (mode) command.push(mode);
    const result = runNode(command);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.59 platform release recipe rejects ${name}`);
    } else {
      fail(`1.59 platform release recipe must reject ${name}: ${output}`);
    }
  }
}

function checkReleaseHandoffPackProtocol() {
  const required = [
    "core/release-handoff-packs.md",
    "docs/release-handoff-packs.md",
    "templates/release-handoff-pack.md",
    "checklists/release-handoff-pack-review.md",
    "prompts/release-handoff-pack-agent.md",
    "release-handoff-packs/.gitkeep",
    "scripts/resolve-release-handoff-pack.mjs",
    "scripts/check-release-handoff-pack.mjs",
    "docs/plans/release-path-consolidation-1.58-1.60-plan.md",
    "docs/plans/release-path-hardening-1.61-plan.md",
    "core/release-path-hardening.md",
    "docs/release-path-hardening.md",
    "schemas/artifacts/release-handoff-evidence.schema.json",
    "examples/1.60-release-handoff-packs/web-hosted-preview/README.md",
    "examples/1.60-release-handoff-packs/web-hosted-preview/release-handoff-packs/001-web-hosted-preview.md",
    "examples/1.60-release-handoff-packs/mini-program-review/README.md",
    "examples/1.60-release-handoff-packs/mini-program-review/release-handoff-packs/001-mini-program-review.md",
    "examples/1.60-release-handoff-packs/backend-api-release/README.md",
    "examples/1.60-release-handoff-packs/backend-api-release/release-handoff-packs/001-backend-api-release.md",
    "test-fixtures/bad/bad-release-handoff-codex-production/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-approval/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-owner/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-rollback/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-monitoring/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-secret-request/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-remote-state/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-missing-structured-evidence/release-handoff-packs/001-bad.md",
    "test-fixtures/bad/bad-release-handoff-execution-redefines-evidence/release-handoff-packs/001-bad.md",
    "releases/1.60.0/release-record.md",
    "releases/1.60.0/known-limitations.md",
    "releases/1.60.0/self-check-report.md",
    "releases/1.61.0/release-record.md",
    "releases/1.61.0/known-limitations.md",
    "releases/1.61.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.61 release path hardening asset exists ${file}`);
    else fail(`1.61 release path hardening asset missing ${file}`);
  }

  const combined = [
    read("core/release-path-hardening.md"),
    read("core/release-handoff-packs.md"),
    read("docs/release-path-hardening.md"),
    read("docs/release-handoff-packs.md"),
    read("templates/release-handoff-pack.md"),
    read("schemas/artifacts/release-handoff-evidence.schema.json"),
    read("scripts/resolve-release-handoff-pack.mjs"),
    read("scripts/check-release-handoff-pack.mjs"),
    read("scripts/resolve-release-guide.mjs"),
    read("docs/plans/release-path-hardening-1.61-plan.md"),
    read("releases/1.61.0/release-record.md"),
    read("releases/1.60.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Release Handoff Packs",
    "Release Path Hardening",
    "bounded runbooks",
    "Codex May Run",
    "does not approve release",
    "does not execute release commands",
    "structured approval",
    "Machine-Readable Evidence",
    "release_handoff_evidence",
    "--require-structured-evidence",
    "DEFERRED_UNTIL_RELEASE_GUIDE_READY",
    "Ready for handoff review, not release approval",
    "handoff_is_execution_input",
    "execution_redefines_owner_evidence",
    "external-system",
  ]) {
    if (combined.includes(marker)) pass(`1.61 release path hardening includes ${marker}`);
    else fail(`1.61 release path hardening missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Handoff Pack")
    && resolver.stdout.includes("## Codex May Run")
    && resolver.stdout.includes("## Machine-Readable Evidence")
    && resolver.stdout.includes("release_handoff_evidence")
    && resolver.stdout.includes("This pack approves release: No")
    && resolver.stdout.includes("This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No")) {
    pass("1.61 release handoff pack resolver prints safe structured handoff");
  } else {
    fail(`1.61 release handoff pack resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-handoff-pack.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_HANDOFF_PACK"
        && parsed.humanSummary?.packId
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.machineReadableEvidence?.artifact_type === "release_handoff_evidence"
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.handoff_is_execution_input === true
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.execution_redefines_owner_evidence === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.approves_release === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.executes_release_commands === false
        && parsed.machineReadableEvidence?.handoff_execution_boundary?.codex_release_owner === false
        && Array.isArray(parsed.codexMayRun)
        && Array.isArray(parsed.humanMustRun)
        && Array.isArray(parsed.externalSystemMustRun)) {
        pass("1.61 release handoff pack resolver JSON includes structured evidence and boundaries");
      } else {
        fail(`1.61 release handoff pack resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.61 release handoff pack resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.61 release handoff pack resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const readyResolver = runNode([
    "scripts/resolve-release-handoff-pack.mjs",
    ".",
    "--intent",
    "help me launch",
    "--release-target",
    "web-hosted-preview",
    "--recipe-id",
    "web-hosted-preview",
    "--approval-type",
    "RELEASE_APPROVAL",
    "--approval-status",
    "APPROVED",
    "--approval-scope",
    "web-hosted-preview handoff review",
    "--approval-time",
    "2026-07-03T00:00:00Z",
    "--allowed-codex-actions",
    "LOCAL_READ_ONLY",
    "--blocked-actions",
    "PRODUCTION_DEPLOY,SECRET_ACCESS,REMOTE_STATE_MUTATION",
    "--approval-expiry",
    "2026-07-10",
    "--release-owner",
    "human:release-owner",
    "--evidence-path",
    "approval-records/demo-release-approval.md",
    "--release-sop",
    "docs/release-sop.md owned by human:release-owner",
    "--rollback",
    "docs/release-rollback.md owned by human:release-owner restore when smoke fails",
    "--monitoring",
    "docs/monitoring.md owned by human:release-owner smoke dashboard",
    "--environment",
    "docs/environment.md",
    "--post-launch-smoke",
    "docs/post-release-smoke.md owned by human:release-owner read-only smoke check",
  ]);
  if (readyResolver.status === 0
    && readyResolver.stdout.includes("READY_FOR_HANDOFF_REVIEW")
    && readyResolver.stdout.includes("Ready for handoff review, not release approval")) {
    pass("1.61 release handoff ready wording is handoff review only");
  } else {
    fail(`1.61 release handoff ready wording failed: ${readyResolver.stderr || readyResolver.stdout}`);
  }

  const source = runNode(["scripts/check-release-handoff-pack.mjs", "."]);
  if (source.status === 0 && source.stdout.includes("Release Handoff Pack check passed")) {
    pass("1.61 release handoff pack checker passes source repo");
  } else {
    fail(`1.61 release handoff pack checker failed: ${source.stderr || source.stdout}`);
  }

  const guideJson = runNode(["scripts/resolve-release-guide.mjs", ".", "--intent", "help me launch", "--json"]);
  if (guideJson.status === 0) {
    try {
      const parsed = JSON.parse(guideJson.stdout);
      const handoffRoute = parsed.releaseGuideRouting?.find((row) => row.stage === "Release Handoff Pack");
      const handoffStatus = parsed.releaseHandoffPack?.find?.((row) => row.field === "Status")?.value || "";
      const handoffState = parsed.releaseHandoffPack?.find?.((row) => row.field === "Handoff State")?.value || "";
      const handoffDeferred = handoffStatus.includes("DEFERRED")
        && handoffState.includes("DEFERRED_UNTIL_RELEASE_GUIDE_READY")
        && handoffRoute?.status === "DEFERRED";
      if (handoffDeferred) {
        pass("1.61 release guide defers handoff pack until route prerequisites are ready");
      } else {
        fail(`1.61 release guide missing deferred handoff bridge: ${guideJson.stdout}`);
      }
    } catch (error) {
      fail(`1.61 release guide handoff JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.61 release guide handoff bridge failed: ${guideJson.stderr || guideJson.stdout}`);
  }

  for (const target of [
    "examples/1.60-release-handoff-packs/web-hosted-preview",
    "examples/1.60-release-handoff-packs/mini-program-review",
    "examples/1.60-release-handoff-packs/backend-api-release",
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0 && result.stdout.includes("Release Handoff Pack check passed")) {
      pass(`1.61 release handoff pack strict example passes: ${target}`);
    } else {
      fail(`1.61 release handoff pack strict example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, target, expected, extraArgs = []] of [
    ["codex production", "test-fixtures/bad/bad-release-handoff-codex-production", "Codex May Run"],
    ["missing approval", "test-fixtures/bad/bad-release-handoff-missing-approval", "Approval Type"],
    ["missing owner", "test-fixtures/bad/bad-release-handoff-missing-owner", "Release Owner"],
    ["missing rollback", "test-fixtures/bad/bad-release-handoff-missing-rollback", "Rollback Evidence"],
    ["missing monitoring", "test-fixtures/bad/bad-release-handoff-missing-monitoring", "Monitoring Evidence"],
    ["secret request", "test-fixtures/bad/bad-release-handoff-secret-request", "secret"],
    ["remote state", "test-fixtures/bad/bad-release-handoff-remote-state", "Codex May Run"],
    ["store assigned to Codex", "test-fixtures/bad/bad-release-handoff-store-assigned-to-codex", "Codex May Run"],
    ["migration assigned to Codex", "test-fixtures/bad/bad-release-handoff-migration-assigned-to-codex", "Codex May Run"],
    ["missing structured evidence", "test-fixtures/bad/bad-release-handoff-missing-structured-evidence", "Machine-Readable Evidence is required", ["--require-structured-evidence"]],
    ["execution redefines evidence", "test-fixtures/bad/bad-release-handoff-execution-redefines-evidence", "execution_redefines_owner_evidence", ["--require-structured-evidence"]],
  ]) {
    const result = runNode(["scripts/check-release-handoff-pack.mjs", target, ...extraArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.61 release handoff pack rejects ${name}`);
    } else {
      fail(`1.61 release handoff pack must reject ${name}: ${output}`);
    }
  }
}

function checkExecutionReviewClosureProtocol() {
  const required = [
    "core/execution-review-closure.md",
    "docs/execution-review-closure.md",
    "templates/execution-closure-report.md",
    "checklists/execution-review-closure-review.md",
    "prompts/execution-closure-agent.md",
    "execution-closures/.gitkeep",
    "scripts/resolve-execution-closure.mjs",
    "scripts/check-execution-closure.mjs",
    "docs/plans/evidence-linked-closure-1.33-plan.md",
    "docs/plans/closeout-evidence-precision-1.51-plan.md",
    "examples/1.32-execution-review-closure/README.md",
    "examples/1.32-execution-review-closure/execution-closures/001-booking-validation-closure.md",
    "examples/1.33-evidence-linked-closure/README.md",
    "examples/1.33-evidence-linked-closure/execution-closures/001-booking.md",
    "examples/1.33-evidence-linked-closure/review-surface-cards/001-booking.md",
    "examples/1.33-evidence-linked-closure/review-loop-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/change-boundary-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/reports/verify-output.txt",
    "examples/1.33-evidence-linked-closure/debt-handoff-reports/001-booking.md",
    "examples/1.33-evidence-linked-closure/delivery-path-reports/001-booking.md",
    "examples/1.49-structured-impact-coverage/contract-input-rule/execution-closures/001-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-approves-implementation/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-missing-verification/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-changed-files-pass/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-ready-without-evidence/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-missing-impact-coverage/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/change-impact-coverage-reports/001-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/api-contract-title-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/backend-contract-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/docs-contract-input-rule.md",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/error-copy-title-required.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/frontend-contract-form-validation.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/test-contract-input-rule.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/evidence/user-flow-contract-title-required.txt",
    "test-fixtures/bad/bad-execution-closure-stale-impact-report/execution-closures/001-contract-input-rule.md",
    "releases/1.32.0/release-record.md",
    "releases/1.32.0/known-limitations.md",
    "releases/1.32.0/self-check-report.md",
    "releases/1.33.0/release-record.md",
    "releases/1.33.0/known-limitations.md",
    "releases/1.33.0/self-check-report.md",
    "releases/1.50.0/release-record.md",
    "releases/1.50.0/known-limitations.md",
    "releases/1.50.0/self-check-report.md",
    "releases/1.51.0/release-record.md",
    "releases/1.51.0/known-limitations.md",
    "releases/1.51.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.32 execution closure asset exists ${file}`);
    else fail(`1.32 execution closure asset missing ${file}`);
  }

  const combined = [
    read("core/execution-review-closure.md"),
    read("docs/execution-review-closure.md"),
    read("templates/execution-closure-report.md"),
    read("scripts/resolve-execution-closure.mjs"),
    read("scripts/check-execution-closure.mjs"),
    read("docs/plans/closeout-evidence-precision-1.51-plan.md"),
    read("releases/1.32.0/release-record.md"),
    read("releases/1.33.0/release-record.md"),
    read("releases/1.50.0/release-record.md"),
    read("releases/1.51.0/release-record.md"),
  ].join("\n");

  for (const marker of [
    "Execution Review Closure",
    "Execution Closure Report",
    "READY_FOR_COMMIT_REVIEW",
    "Verification Closure",
    "Commit Readiness",
    "Evidence Links",
    "changed files are not proof",
    "--review-surface-ref",
    "--verification-file",
    "require-impact-coverage",
    "require-precise-evidence",
    "Change Impact Coverage Report",
    "This closure approves implementation: No",
    "This closure authorizes commit or push: No",
    "This closure replaces Safe Launch: No",
  ]) {
    if (combined.includes(marker)) pass(`1.32 execution closure includes ${marker}`);
    else fail(`1.32 execution closure missing ${marker}`);
  }

  const resolver = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish IntentOS closure", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Execution Closure Report")
    && resolver.stdout.includes("Commit Readiness")
    && resolver.stdout.includes("This closure authorizes commit or push: No")) {
    pass("1.32 execution closure resolver prints safe report");
  } else {
    fail(`1.32 execution closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish IntentOS closure", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXECUTION_REVIEW_CLOSURE"
        && parsed.boundaries?.authorizesCommitOrPush === "No"
        && parsed.commitReadiness?.closureState
        && Array.isArray(parsed.reviewSurfaceClosure)) {
        pass("1.32 execution closure resolver JSON includes closure state, surfaces, and boundary");
      } else {
        fail(`1.32 execution closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.32 execution closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.32 execution closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const check = runNode(["scripts/check-execution-closure.mjs", "."]);
  if (check.status === 0 && check.stdout.includes("Execution Review Closure check passed")) {
    pass("1.32 execution closure checker passes source repo");
  } else {
    fail(`1.32 execution closure checker failed: ${check.stderr || check.stdout}`);
  }

  const example = runNode(["scripts/check-execution-closure.mjs", "examples/1.32-execution-review-closure"]);
  if (example.status === 0 && example.stdout.includes("Execution Review Closure check passed")) {
    pass("1.32 execution closure example passes checker");
  } else {
    fail(`1.32 execution closure example failed: ${example.stderr || example.stdout}`);
  }

  const evidenceExample = runNode(["scripts/check-execution-closure.mjs", "examples/1.33-evidence-linked-closure"]);
  if (evidenceExample.status === 0 && evidenceExample.stdout.includes("Execution Review Closure check passed")) {
    pass("1.33 evidence-linked closure example passes checker");
  } else {
    fail(`1.33 evidence-linked closure example failed: ${evidenceExample.stderr || evidenceExample.stdout}`);
  }

  const impactCoverageExample = runNode(["scripts/check-execution-closure.mjs", "examples/1.49-structured-impact-coverage/contract-input-rule", "--require-impact-coverage", "--require-precise-evidence"]);
  if (impactCoverageExample.status === 0
    && impactCoverageExample.stdout.includes("linked Change Impact Coverage Report passes strict closure evidence checks")
    && impactCoverageExample.stdout.includes("precise linked report matches current closure task or intent")
    && impactCoverageExample.stdout.includes("Execution Review Closure check passed")) {
    pass("1.51 execution closure example requires linked precise impact coverage");
  } else {
    fail(`1.50 execution closure impact coverage example failed: ${impactCoverageExample.stderr || impactCoverageExample.stdout}`);
  }

  const evidenceResolver = runNode([
    "scripts/resolve-execution-closure.mjs",
    "examples/1.33-evidence-linked-closure",
    "--intent",
    "finish booking validation",
    "--review-surface-ref",
    "review-surface-cards/001-booking.md",
    "--review-loop-ref",
    "review-loop-reports/001-booking.md",
    "--change-boundary-ref",
    "change-boundary-reports/001-booking.md",
    "--verification-file",
    "reports/verify-output.txt",
    "--debt-handoff-ref",
    "debt-handoff-reports/001-booking.md",
    "--delivery-path-ref",
    "delivery-path-reports/001-booking.md",
    "--json",
  ]);
  if (evidenceResolver.status === 0) {
    try {
      const parsed = JSON.parse(evidenceResolver.stdout);
      if (parsed.commitReadiness?.closureState === "READY_FOR_COMMIT_REVIEW"
        && Array.isArray(parsed.evidenceLinks)
        && parsed.evidenceLinks.some((item) => item.type === "Review Loop / Reviewer Evidence" && item.status === "found")
        && parsed.reviewSurfaceClosure?.some((item) => item.surface === "CODE_REVIEW" && item.result === "pass" && /review-loop evidence/.test(item.evidence))) {
        pass("1.33 evidence-linked resolver reaches ready state with linked evidence");
      } else {
        fail(`1.33 evidence-linked resolver JSON missing expected evidence-linked readiness: ${evidenceResolver.stdout}`);
      }
    } catch (error) {
      fail(`1.33 evidence-linked resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.33 evidence-linked resolver failed: ${evidenceResolver.stderr || evidenceResolver.stdout}`);
  }

  for (const [name, args, expected] of [
    ["approval overclaim", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-approves-implementation"], "forbidden execution closure claim"],
    ["missing verification", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-missing-verification"], "requires passing verification commands"],
    ["changed files pass", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-changed-files-pass"], "changed files as the only evidence"],
    ["ready without evidence", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-ready-without-evidence"], "requires Review Surface Card found"],
    ["missing impact coverage", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-missing-impact-coverage", "--require-impact-coverage"], "requires Change Impact Coverage Report found"],
    ["stale impact report", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-stale-impact-report", "--require-impact-coverage", "--require-precise-evidence"], "precise linked report must match current closure task or intent"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.32 execution closure rejects ${name}`);
    } else {
      fail(`1.32 execution closure must reject ${name}: ${output}`);
    }
  }
}

function checkOrdinaryUserProductLoopProtocol() {
  const required = [
    "docs/roadmaps/ordinary-user-product-loop-1.42-1.45.md",
    "docs/plans/ordinary-user-product-loop-hardening-1.46-plan.md",
    "docs/plans/evidence-reliability-risk-calibration-1.47-plan.md",
    "baseline-calibration-reports/risk-surface-false-positives.md",
    "core/ordinary-user-first-slice.md",
    "docs/ordinary-user-first-slice.md",
    "templates/ordinary-user-first-slice-card.md",
    "checklists/ordinary-user-first-slice-review.md",
    "prompts/ordinary-user-first-slice-agent.md",
    "ordinary-first-slices/.gitkeep",
    "scripts/resolve-first-slice.mjs",
    "scripts/check-first-slice.mjs",
    "core/product-completeness-gate.md",
    "docs/product-completeness-gate.md",
    "templates/product-completeness-report.md",
    "checklists/product-completeness-gate-review.md",
    "prompts/product-completeness-agent.md",
    "product-completeness-reports/.gitkeep",
    "scripts/resolve-product-completeness.mjs",
    "scripts/check-product-completeness.mjs",
    "core/real-mvp-example-evidence.md",
    "docs/real-mvp-example-evidence.md",
    "templates/real-mvp-example-record.md",
    "checklists/real-mvp-example-review.md",
    "prompts/real-mvp-example-agent.md",
    "mvp-example-reports/.gitkeep",
    "scripts/check-mvp-example.mjs",
    "core/low-risk-controlled-apply-candidate.md",
    "docs/low-risk-controlled-apply-candidate.md",
    "templates/low-risk-controlled-apply-candidate.md",
    "checklists/low-risk-controlled-apply-candidate-review.md",
    "prompts/low-risk-controlled-apply-candidate-agent.md",
    "controlled-apply-candidates/.gitkeep",
    "schemas/artifacts/product-completeness-evidence.schema.json",
    "schemas/artifacts/low-risk-apply-candidate.schema.json",
    "scripts/lib/risk-surfaces.mjs",
    "scripts/resolve-low-risk-apply-candidate.mjs",
    "scripts/check-low-risk-apply-candidate.mjs",
    "examples/1.42-ordinary-user-first-slice/README.md",
    "examples/1.42-ordinary-user-first-slice/ordinary-first-slices/001-booking-app.md",
    "examples/1.43-product-completeness-gate/README.md",
    "examples/1.43-product-completeness-gate/product-completeness-reports/001-booking-mvp.md",
    "examples/mvp-booking-web-app/README.md",
    "examples/mvp-booking-web-app/package.json",
    "examples/mvp-booking-web-app/src/index.html",
    "examples/mvp-booking-web-app/src/styles.css",
    "examples/mvp-booking-web-app/src/app.js",
    "examples/mvp-booking-web-app/scripts/smoke-test.mjs",
    "examples/mvp-booking-web-app/evidence/smoke-output.txt",
    "examples/mvp-booking-web-app/evidence/smoke-output.json",
    "examples/mvp-booking-web-app/docs/product-brief.md",
    "examples/mvp-booking-web-app/ordinary-first-slices/001-booking-web-app.md",
    "examples/mvp-booking-web-app/product-completeness-reports/001-booking-web-app.md",
    "examples/mvp-booking-web-app/final-reports/001-booking-web-app.md",
    "examples/mvp-dashboard-web-app/README.md",
    "examples/mvp-dashboard-web-app/package.json",
    "examples/mvp-dashboard-web-app/src/index.html",
    "examples/mvp-dashboard-web-app/src/styles.css",
    "examples/mvp-dashboard-web-app/src/app.js",
    "examples/mvp-dashboard-web-app/scripts/smoke-test.mjs",
    "examples/mvp-dashboard-web-app/evidence/smoke-output.txt",
    "examples/mvp-dashboard-web-app/evidence/smoke-output.json",
    "examples/mvp-dashboard-web-app/docs/product-brief.md",
    "examples/mvp-dashboard-web-app/ordinary-first-slices/001-dashboard-web-app.md",
    "examples/mvp-dashboard-web-app/product-completeness-reports/001-dashboard-web-app.md",
    "examples/mvp-dashboard-web-app/final-reports/001-dashboard-web-app.md",
    "examples/mvp-cli-note-tool/README.md",
    "examples/mvp-cli-note-tool/package.json",
    "examples/mvp-cli-note-tool/src/cli.mjs",
    "examples/mvp-cli-note-tool/scripts/smoke-test.mjs",
    "examples/mvp-cli-note-tool/evidence/smoke-output.txt",
    "examples/mvp-cli-note-tool/evidence/smoke-output.json",
    "examples/mvp-cli-note-tool/docs/product-brief.md",
    "examples/mvp-cli-note-tool/ordinary-first-slices/001-cli-note-tool.md",
    "examples/mvp-cli-note-tool/product-completeness-reports/001-cli-note-tool.md",
    "examples/mvp-cli-note-tool/final-reports/001-cli-note-tool.md",
    "examples/1.45-low-risk-apply-candidate/README.md",
    "examples/1.45-low-risk-apply-candidate/controlled-apply-candidates/001-booking-demo.md",
    "test-fixtures/bad/bad-first-slice-authorizes-write/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-jargon/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-too-many-questions/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-product-completeness-release-overclaim/product-completeness-reports/001-bad.md",
    "test-fixtures/bad/bad-product-completeness-missing-run/product-completeness-reports/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-authorizes-run/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-broad-path/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-high-risk/controlled-apply-candidates/001-bad.md",
    "releases/1.42.0/release-record.md",
    "releases/1.42.0/known-limitations.md",
    "releases/1.42.0/self-check-report.md",
    "releases/1.43.0/release-record.md",
    "releases/1.43.0/known-limitations.md",
    "releases/1.43.0/self-check-report.md",
    "releases/1.44.0/release-record.md",
    "releases/1.44.0/known-limitations.md",
    "releases/1.44.0/self-check-report.md",
    "releases/1.45.0/release-record.md",
    "releases/1.45.0/known-limitations.md",
    "releases/1.45.0/self-check-report.md",
    "releases/1.46.0/release-record.md",
    "releases/1.46.0/known-limitations.md",
    "releases/1.46.0/self-check-report.md",
    "releases/1.47.0/release-record.md",
    "releases/1.47.0/known-limitations.md",
    "releases/1.47.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.42-1.47 ordinary user product loop asset exists ${file}`);
    else fail(`1.42-1.47 ordinary user product loop asset missing ${file}`);
  }

  const combined = [
    read("docs/roadmaps/ordinary-user-product-loop-1.42-1.45.md"),
    read("docs/plans/ordinary-user-product-loop-hardening-1.46-plan.md"),
    read("docs/plans/evidence-reliability-risk-calibration-1.47-plan.md"),
    read("baseline-calibration-reports/risk-surface-false-positives.md"),
    read("core/ordinary-user-first-slice.md"),
    read("core/product-completeness-gate.md"),
    read("core/real-mvp-example-evidence.md"),
    read("core/low-risk-controlled-apply-candidate.md"),
    read("templates/ordinary-user-first-slice-card.md"),
    read("templates/product-completeness-report.md"),
    read("templates/low-risk-controlled-apply-candidate.md"),
    read("schemas/artifacts/product-completeness-evidence.schema.json"),
    read("schemas/artifacts/low-risk-apply-candidate.schema.json"),
    read("scripts/lib/risk-surfaces.mjs"),
    read("scripts/resolve-first-slice.mjs"),
    read("scripts/resolve-product-completeness.mjs"),
    read("scripts/resolve-low-risk-apply-candidate.mjs"),
    read("examples/mvp-booking-web-app/product-completeness-reports/001-booking-web-app.md"),
    read("examples/mvp-booking-web-app/evidence/smoke-output.json"),
    read("examples/mvp-dashboard-web-app/README.md"),
    read("examples/mvp-dashboard-web-app/evidence/smoke-output.json"),
    read("examples/mvp-cli-note-tool/README.md"),
    read("examples/mvp-cli-note-tool/evidence/smoke-output.json"),
    read("docs/reference/scripts.md"),
    read("docs/reference/checkers.md"),
    read("docs/reference/artifacts.md"),
    read("scripts/cli.mjs"),
  ].join("\n");

  for (const marker of [
    "Ordinary User First-Slice",
    "Product Completeness",
    "Real MVP Example",
    "Low-Risk Controlled Apply Candidate",
    "Machine-Readable Evidence",
    "product_completeness_evidence",
    "analyzeRiskSurfaces",
    "evidence/smoke-output.txt",
    "evidence/smoke-output.json",
    "MVP Dashboard Web App",
    "MVP CLI Note Tool",
    "This card writes target files: No",
    "This report approves release or production: No",
    "This candidate authorizes apply: No",
    "first-slice",
    "product-completeness",
    "mvp-example-check",
    "apply-candidate",
  ]) {
    if (combined.includes(marker)) pass(`1.42-1.47 ordinary user product loop includes ${marker}`);
    else fail(`1.42-1.47 ordinary user product loop missing ${marker}`);
  }

  const firstSliceResolver = runNode(["scripts/resolve-first-slice.mjs", ".", "我想做一个预约 App"]);
  if (firstSliceResolver.status === 0
    && firstSliceResolver.stdout.includes("Ordinary User First-Slice Card")
    && firstSliceResolver.stdout.includes("This card writes target files: No")) {
    pass("1.42 first-slice resolver prints safe card");
  } else {
    fail(`1.42 first-slice resolver failed: ${firstSliceResolver.stderr || firstSliceResolver.stdout}`);
  }

  const firstSliceExample = runNode(["scripts/check-first-slice.mjs", "examples/1.42-ordinary-user-first-slice"]);
  if (firstSliceExample.status === 0 && firstSliceExample.stdout.includes("Ordinary User First-Slice check passed")) {
    pass("1.42 first-slice example passes checker");
  } else {
    fail(`1.42 first-slice example failed: ${firstSliceExample.stderr || firstSliceExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["first-slice write authorization", "test-fixtures/bad/bad-first-slice-authorizes-write", "boundary This card writes target files must be No"],
    ["first-slice jargon", "test-fixtures/bad/bad-first-slice-jargon", "internal jargon"],
    ["first-slice too many questions", "test-fixtures/bad/bad-first-slice-too-many-questions", "must ask 1-3 questions"],
  ]) {
    const result = runNode(["scripts/check-first-slice.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.42 rejects ${name}`);
    else fail(`1.42 must reject ${name}: ${output}`);
  }

  const productResolver = runNode(["scripts/resolve-product-completeness.mjs", "examples/mvp-booking-web-app", "--evidence", "evidence/smoke-output.json"]);
  if (productResolver.status === 0
    && productResolver.stdout.includes("Product Completeness Report")
    && productResolver.stdout.includes("Explicit evidence: evidence/smoke-output.json")
    && productResolver.stdout.includes("structured evidence:")
    && productResolver.stdout.includes("This report approves release or production: No")) {
    pass("1.47 product completeness resolver prints safe structured evidence-linked report");
  } else {
    fail(`1.47 product completeness resolver failed: ${productResolver.stderr || productResolver.stdout}`);
  }

  const productExample = runNode(["scripts/check-product-completeness.mjs", "examples/1.43-product-completeness-gate"]);
  if (productExample.status === 0 && productExample.stdout.includes("Product Completeness check passed")) {
    pass("1.43 product completeness example passes checker");
  } else {
    fail(`1.43 product completeness example failed: ${productExample.stderr || productExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["product release overclaim", "test-fixtures/bad/bad-product-completeness-release-overclaim", "boundary This report approves release or production must be No"],
    ["product missing run", "test-fixtures/bad/bad-product-completeness-missing-run", "checklist missing Local run or demo instructions"],
  ]) {
    const result = runNode(["scripts/check-product-completeness.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.43 rejects ${name}`);
    else fail(`1.43 must reject ${name}: ${output}`);
  }

  const mvpExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-booking-web-app"]);
  if (mvpExample.status === 0 && mvpExample.stdout.includes("MVP Example check passed")) {
    pass("1.44 booking MVP example passes checker and local smoke test");
  } else {
    fail(`1.44 booking MVP example failed: ${mvpExample.stderr || mvpExample.stdout}`);
  }

  const dashboardExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-dashboard-web-app"]);
  if (dashboardExample.status === 0 && dashboardExample.stdout.includes("MVP Example check passed")) {
    pass("1.46 dashboard MVP example passes checker and local smoke test");
  } else {
    fail(`1.46 dashboard MVP example failed: ${dashboardExample.stderr || dashboardExample.stdout}`);
  }

  const cliExample = runNode(["scripts/check-mvp-example.mjs", "examples/mvp-cli-note-tool"]);
  if (cliExample.status === 0 && cliExample.stdout.includes("MVP Example check passed")) {
    pass("1.47 CLI MVP example passes checker and local smoke test");
  } else {
    fail(`1.47 CLI MVP example failed: ${cliExample.stderr || cliExample.stdout}`);
  }

  const applyResolver = runNode(["scripts/resolve-low-risk-apply-candidate.mjs", ".", "--intent", "update local booking demo copy", "--path", "examples/mvp-booking-web-app/src/app.js"]);
  if (applyResolver.status === 0
    && applyResolver.stdout.includes("Low-Risk Controlled Apply Candidate")
    && applyResolver.stdout.includes("This candidate authorizes apply: No")) {
    pass("1.46 structured apply candidate resolver prints safe record");
  } else {
    fail(`1.46 structured apply candidate resolver failed: ${applyResolver.stderr || applyResolver.stdout}`);
  }

  const applyExample = runNode(["scripts/check-low-risk-apply-candidate.mjs", "examples/1.45-low-risk-apply-candidate", "--require-structured-evidence"]);
  if (applyExample.status === 0 && applyExample.stdout.includes("Low-Risk Controlled Apply Candidate check passed")) {
    pass("1.46 structured apply candidate example passes strict structured checker");
  } else {
    fail(`1.46 structured apply candidate example failed: ${applyExample.stderr || applyExample.stdout}`);
  }

  for (const [name, target, expected] of [
    ["apply authorization", "test-fixtures/bad/bad-apply-candidate-authorizes-run", "boundary This candidate authorizes apply must be No"],
    ["broad path", "test-fixtures/bad/bad-apply-candidate-broad-path", "unsafe target path"],
    ["high risk", "test-fixtures/bad/bad-apply-candidate-high-risk", "mentions high-risk surface without explicit no-authority boundary"],
  ]) {
    const result = runNode(["scripts/check-low-risk-apply-candidate.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`structured apply candidate rejects ${name}`);
    else fail(`structured apply candidate must reject ${name}: ${output}`);
  }

  checkRiskSurfaceCalibration();
}

function checkRiskSurfaceCalibration() {
  const benign = analyzeRiskSurfaces({
    intent: "update product workflow label, key metric copy, and package display text",
    paths: ["examples/mvp-cli-note-tool/README.md"],
  });
  if (!benign.high) pass("1.47 risk calibration keeps benign workflow/key/package copy low-risk");
  else fail(`1.47 risk calibration false positive: ${benign.reasons.join("; ")}`);

  const secret = analyzeRiskSurfaces({
    intent: "update API key and secret token handling",
    paths: ["src/example.js"],
  });
  if (secret.high && secret.surfaces.includes("environment-secret")) pass("1.47 risk calibration detects secret key context");
  else fail("1.47 risk calibration must detect secret key context");

  const ciWorkflow = analyzeRiskSurfaces({
    intent: "update GitHub workflow file",
    paths: [".github/workflows/intentos-release-checks.yml"],
  });
  if (ciWorkflow.high && ciWorkflow.reasons.some((reason) => reason.includes("CI workflow path") || reason.includes("ci-hook-automation"))) pass("1.47 risk calibration detects CI workflow context");
  else fail("1.47 risk calibration must detect CI workflow context");

  const dataMigration = analyzeRiskSurfaces({
    intent: "change database migration for payment permissions",
    paths: ["src/domain.js"],
  });
  if (dataMigration.high && dataMigration.surfaces.includes("database-migration") && dataMigration.surfaces.includes("payment-billing") && dataMigration.surfaces.includes("auth-permission")) pass("1.47 risk calibration detects migration payment permission context");
  else fail("1.47 risk calibration must detect migration payment permission context");
}

function checkProfiles() {
  const profileRoot = path.join(kitRoot, "profiles");
  const requiredSections = [
    "## Purpose",
    "## Applies To",
    "## Does Not Apply To",
    "## Default Task Level",
    "## Required Project Docs",
    "## Focus Areas",
    "## Platform / Project-type Risks",
    "## High-risk Boundaries",
    "## Required Verification",
    "## Release / Distribution Checks",
    "## AI Boundaries",
    "## Starter Expectations",
  ];

  for (const entry of fs.readdirSync(profileRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const profilePath = path.join(profileRoot, entry.name, "profile.md");
    const baselinePath = path.join(profileRoot, entry.name, "baseline.json");
    if (!fs.existsSync(profilePath)) {
      fail(`profile missing profile.md: profiles/${entry.name}`);
      continue;
    }
    if (!fs.existsSync(baselinePath)) {
      fail(`profile missing baseline.json: profiles/${entry.name}`);
      continue;
    }
    const content = fs.readFileSync(profilePath, "utf8");
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        fail(`profiles/${entry.name}/profile.md missing ${section}`);
      }
    }
    if (!content.includes("L0") && !content.includes("L1") && !content.includes("L2") && !content.includes("L3")) {
      fail(`profiles/${entry.name}/profile.md missing task level reference`);
    }
    let baseline;
    try {
      baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    } catch (error) {
      fail(`profiles/${entry.name}/baseline.json invalid JSON: ${error.message}`);
      continue;
    }
    for (const key of [
      "id",
      "defaultTaskLevel",
      "escalationRules",
      "requiredDocs",
      "riskGateMappings",
      "requiredVerification",
      "verificationKeywords",
      "verifyScriptKeywords",
      "highRiskKeywords",
      "humanApprovalRequiredFor",
      "releaseChecks",
      "aiBoundaries",
      "compatibleStarters",
    ]) {
      if (!(key in baseline)) {
        fail(`profiles/${entry.name}/baseline.json missing ${key}`);
      }
    }
    for (const key of [
      "escalationRules",
      "requiredDocs",
      "requiredVerification",
      "verificationKeywords",
      "verifyScriptKeywords",
      "highRiskKeywords",
      "humanApprovalRequiredFor",
      "releaseChecks",
      "compatibleStarters",
    ]) {
      if (key in baseline && !Array.isArray(baseline[key])) {
        fail(`profiles/${entry.name}/baseline.json ${key} must be an array`);
      }
    }
    if (baseline.riskGateMappings && typeof baseline.riskGateMappings !== "object") {
      fail(`profiles/${entry.name}/baseline.json riskGateMappings must be an object`);
    }
    if (!baseline.aiBoundaries
      || typeof baseline.aiBoundaries !== "object"
      || !Array.isArray(baseline.aiBoundaries.may)
      || !Array.isArray(baseline.aiBoundaries.mustNot)) {
      fail(`profiles/${entry.name}/baseline.json aiBoundaries must include may and mustNot arrays`);
    }
    if (baseline.id !== entry.name) {
      fail(`profiles/${entry.name}/baseline.json id must match directory name`);
    }
    pass(`profile structure checked: ${entry.name}`);
  }
}

function checkIndustrialPacks() {
  const requiredDocs = [
    "docs/bl2-industrial-baseline-deepening.md",
    "docs/reference/bl2-industrial-pack-depth-matrix.md",
    "examples/1.16-bl2-industrial-deepening/README.md",
    "test-fixtures/bad/bad-industrial-pack-missing-depth/industrial-packs/index.json",
    "test-fixtures/bad/bad-industrial-selects-all/docs/baseline-selection.md",
    "test-fixtures/bad/bad-industrial-risk-overlay-no-evidence/docs/baseline-selection.md",
  ];
  for (const file of requiredDocs) {
    if (exists(file)) pass(`1.16 industrial depth asset exists ${file}`);
    else fail(`1.16 industrial depth asset missing ${file}`);
  }

  const combined = [
    read("docs/plans/bl2-industrial-baseline-deepening-1.16-plan.md"),
    read("docs/bl2-industrial-baseline-deepening.md"),
    read("docs/reference/bl2-industrial-pack-depth-matrix.md"),
    read("docs/reference/industrial-packs.md"),
    read("industrial-packs/README.md"),
    read("industrial-packs/selection-guide.md"),
    read("scripts/check-industrial-pack.mjs"),
    read("scripts/check-industrial-baseline.mjs"),
    read("scripts/resolve-industrial-baseline.mjs"),
  ].join("\n");
  for (const marker of [
    "Does Not Cover By Itself",
    "Scope Boundary",
    "Evidence Template",
    "Codex Forbidden Actions",
    "Maturity Limits",
    "risk-specific evidence",
    "BL2 selects all industrial packs by default",
    "selected without risk-specific evidence",
    "Pack files define standards",
  ]) {
    if (combined.includes(marker)) pass(`1.16 industrial depth protocol includes ${marker}`);
    else fail(`1.16 industrial depth protocol missing ${marker}`);
  }

  const result = runNode(["scripts/check-industrial-pack.mjs", kitRoot, "--json"]);
  if (result.status !== 0) {
    fail(`industrial pack check failed: ${result.stderr || result.stdout}`);
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    fail(`industrial pack check JSON is not parseable: ${error.message}`);
    return;
  }
  if (parsed.status !== "PASS") {
    fail(`industrial pack check status is ${parsed.status}`);
    return;
  }
  if (!parsed.checkedPacks || parsed.checkedPacks < 11) {
    fail(`industrial pack check validated ${parsed.checkedPacks || 0} concrete pack(s), expected at least 11`);
    return;
  }
  if (parsed.plannedPacks?.length > 0) {
    fail(`industrial pack check still has planned packs: ${parsed.plannedPacks.join(", ")}`);
    return;
  }
  pass("industrial pack structure checked");

  for (const example of [
    "web-admin-data-auth",
    "miniprogram-cloud-auth",
    "mobile-api",
    "payment-risk-overlay",
  ]) {
    const exampleResult = runNode([
      "scripts/check-industrial-baseline.mjs",
      `examples/1.16-bl2-industrial-deepening/${example}`,
      "--strict",
    ]);
    if (exampleResult.status === 0 && exampleResult.stdout.includes("Industrial baseline is ready")) {
      pass(`1.16 industrial example passes ${example}`);
    } else {
      fail(`1.16 industrial example failed ${example}: ${exampleResult.stderr || exampleResult.stdout}`);
    }
  }

  const badDepth = runNode(["scripts/check-industrial-pack.mjs", "test-fixtures/bad/bad-industrial-pack-missing-depth"]);
  if (badDepth.status !== 0 && `${badDepth.stdout}\n${badDepth.stderr}`.includes("missing BL2 depth section")) {
    pass("industrial pack checker rejects missing BL2 depth contract");
  } else {
    fail(`industrial pack checker must reject missing BL2 depth contract: ${badDepth.stderr || badDepth.stdout}`);
  }

  const badAll = runNode(["scripts/check-industrial-baseline.mjs", "test-fixtures/bad/bad-industrial-selects-all", "--strict"]);
  if (badAll.status !== 0 && `${badAll.stdout}\n${badAll.stderr}`.includes("BL2 selects all industrial packs by default")) {
    pass("industrial baseline checker rejects all-pack BL2 default");
  } else {
    fail(`industrial baseline checker must reject all-pack BL2 default: ${badAll.stderr || badAll.stdout}`);
  }

  const badRisk = runNode(["scripts/check-industrial-baseline.mjs", "test-fixtures/bad/bad-industrial-risk-overlay-no-evidence", "--strict"]);
  if (badRisk.status !== 0 && `${badRisk.stdout}\n${badRisk.stderr}`.includes("selected without risk-specific evidence")) {
    pass("industrial baseline checker rejects risk overlay without risk evidence");
  } else {
    fail(`industrial baseline checker must reject risk overlay without risk evidence: ${badRisk.stderr || badRisk.stdout}`);
  }
}

function checkIndustrialBaselineResolver() {
  const result = runNode(["scripts/check-industrial-baseline.mjs", kitRoot, "--json"]);
  if (result.status !== 0) {
    fail(`industrial baseline check failed: ${result.stderr || result.stdout}`);
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    fail(`industrial baseline check JSON is not parseable: ${error.message}`);
    return;
  }
  if (parsed.checkStatus !== "PENDING" || parsed.state !== "NOT_SELECTED") {
    fail(`intentos source industrial baseline should be pending/not selected, got ${parsed.checkStatus}/${parsed.state}`);
    return;
  }
  pass("industrial baseline resolver checked");
}

function checkStarters() {
  const starterRoot = path.join(kitRoot, "starters");
  const required = [
    "AGENTS.md",
    "README.md",
    "docs/ai-workflow.md",
    "docs/product-vision.md",
    "docs/engineering-principles.md",
    "docs/engineering-baseline.md",
    "docs/risk-policy.md",
    "docs/architecture.md",
    "docs/domain-model.md",
    "docs/permission-model.md",
    "docs/test-strategy.md",
    "requests/.gitkeep",
    "preflight/.gitkeep",
    "specs/.gitkeep",
    "evals/.gitkeep",
    "tasks/.gitkeep",
    "ai-logs/.gitkeep",
    "workflow-retros/.gitkeep",
    "workflow-improvements/.gitkeep",
    "skill-candidates/.gitkeep",
    "automation-proposals/.gitkeep",
    "intentos-proposals/.gitkeep",
    "review-packets/.gitkeep",
    "review-surface-cards/.gitkeep",
    "business-rule-closures/.gitkeep",
    "change-impact-coverage-reports/.gitkeep",
    "gpt-review-prompts/.gitkeep",
    "review-loop-reports/.gitkeep",
    "goal-cards/.gitkeep",
    "subagent-run-plans/.gitkeep",
    "follow-up-proposals/.gitkeep",
    "final-reports/.gitkeep",
    "status-reports/.gitkeep",
    "decision-briefs/.gitkeep",
    "review-summaries/.gitkeep",
    "customer-handoffs/.gitkeep",
    "releases/.gitkeep",
    "scripts/verify.sh",
    ".github/pull_request_template.md",
  ];

  for (const entry of fs.readdirSync(starterRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of required) {
      const full = path.join(starterRoot, entry.name, file);
      if (fs.existsSync(full)) {
        pass(`starter ${entry.name}: ${file}`);
      } else {
        fail(`starter ${entry.name} missing ${file}`);
      }
    }
    for (const injectedScript of ["scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/check-ai-workflow.mjs", "scripts/check-guided-adoption.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-engineering-baseline.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/check-review-loop.mjs", "scripts/check-next-step-boundary.mjs", "scripts/check-goal-mode.mjs", "scripts/check-subagent-orchestration.mjs", "scripts/resolve-beginner-entry.mjs", "scripts/check-beginner-entry.mjs", "scripts/resolve-work-queue.mjs", "scripts/check-work-queue.mjs", "scripts/resolve-hook-orchestration.mjs", "scripts/check-hook-orchestration.mjs", "scripts/resolve-hook-policy.mjs", "scripts/check-hook-policy.mjs", "scripts/resolve-review-surface.mjs", "scripts/check-review-surface.mjs", "scripts/resolve-business-rule-closure.mjs", "scripts/check-business-rule-closure.mjs", "scripts/resolve-change-impact-coverage.mjs", "scripts/check-change-impact-coverage.mjs", "scripts/resolve-delivery-path.mjs", "scripts/check-delivery-path.mjs", "scripts/resolve-debt-handoff.mjs", "scripts/check-debt-handoff.mjs", "scripts/resolve-document-archive-apply.mjs", "scripts/check-document-archive-apply.mjs", "scripts/resolve-apply-plan.mjs", "scripts/check-apply-plan.mjs", "scripts/new-workflow-item.mjs", "scripts/start-project.mjs", "scripts/workflow-next.mjs"]) {
      const full = path.join(starterRoot, entry.name, injectedScript);
      if (fs.existsSync(full)) {
        fail(`starter ${entry.name} should not duplicate injected workflow script ${injectedScript}`);
      }
    }
    const agents = path.join(starterRoot, entry.name, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf8");
      for (const section of ["Mission", "Zero-Experience Solo Developer", "Core Rules", "Bootstrap Entry", "Beginner Entry", "Natural Language Workflow Guidance", "Delivery Path Governance", "Debt & Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Project Onboarding", "Engineering Baseline", "Environment Baseline", "Platform Baseline", "Industrial Baseline", "Product Baseline", "Claim Control", "Workflow Artifact Generation", "Guided Decision & Delivery Loop", "Change Boundary And Baseline State", "Goal Mode", "Subagent Orchestration", "Review Surface Governance", "Business Rule Closure", "Change Impact Coverage", "Review Loop", "Bounded Next-Step", "Output Experience", "Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
        if (!content.includes(section)) {
          fail(`starter ${entry.name} AGENTS.md missing ${section}`);
        }
      }
    }
    const prTemplate = path.join(starterRoot, entry.name, ".github", "pull_request_template.md");
    if (fs.existsSync(prTemplate)) {
      const content = fs.readFileSync(prTemplate, "utf8");
      for (const marker of ["Human Summary", "Workflow Guidance", "Beginner Entry", "Delivery Path", "Debt / Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Bootstrap state", "Project onboarding", "Engineering baseline", "Environment baseline", "Product baseline", "Claim control", "Context governance", "Git Boundary", "Assumptions", "Workflow Evidence", "Guided Delivery Loop", "Change Boundary Report", "Baseline State Report", "Workflow artifact quality", "Review Surface Card", "Business Rule Closure Card", "Change Impact Coverage Report", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
        if (!content.includes(marker)) {
          fail(`starter ${entry.name} PR template missing ${marker}`);
        }
      }
    }
    const verifyScript = path.join(starterRoot, entry.name, "scripts", "verify.sh");
    if (fs.existsSync(verifyScript)) {
      const result = spawnSync("bash", ["-n", verifyScript], { encoding: "utf8" });
      if (result.status === 0) {
        pass(`starter ${entry.name}: verify.sh syntax`);
      } else {
        fail(`starter ${entry.name}: verify.sh syntax failed: ${result.stderr || result.stdout}`);
      }
      const emptyProject = fs.mkdtempSync(path.join(os.tmpdir(), `intentos-${entry.name}-verify-`));
      const negative = spawnSync("bash", [verifyScript], { cwd: emptyProject, encoding: "utf8" });
      fs.rmSync(emptyProject, { recursive: true, force: true });
      if (negative.status !== 0) {
        pass(`starter ${entry.name}: verify.sh fails closed without a runnable verification path`);
      } else {
        fail(`starter ${entry.name}: verify.sh must fail when no runnable verification path exists`);
      }
    }
  }
}

function checkPlatformAdapters() {
  const cursorRules = read("platforms/cursor/rules-template.md");
  const claudeInstructions = read("platforms/claude/instructions.md");
  const githubPr = read("platforms/github/pull_request_template.md");
  const githubCi = read("platforms/github/ci-ai-workflow.yml");

  for (const [name, content] of [
    ["platforms/cursor/rules-template.md", cursorRules],
    ["platforms/claude/instructions.md", claudeInstructions],
    ["platforms/github/pull_request_template.md", githubPr],
  ]) {
    const normalized = content.toLowerCase();
    for (const marker of ["bootstrap", "onboarding", "artifact", "skill", "automation", "daily summary", "human summary", "next-step", "subagent", "product baseline", "claim control", "assumption", "context governance", "git boundary", "safe launch", "conversation drift", "first delivery", "guided delivery", "delivery path", "debt", "archive apply", "apply plan", "beginner entry", "change boundary", "baseline state", "baseline pack", "workflow guidance", "review surface"]) {
      if (normalized.includes(marker)) {
        pass(`${name} includes ${marker}`);
      } else {
        fail(`${name} missing ${marker}`);
      }
    }
  }

  for (const command of [
    "check-ai-workflow.mjs",
    "check-guided-adoption.mjs",
    "check-workflow-version.mjs",
    "summarize-ai-logs.mjs",
    "workflow-daily-summary.mjs",
    "check-project-onboarding.mjs",
    "check-engineering-baseline.mjs",
    "check-environment-baseline.mjs",
    "check-baseline-enforcement.mjs",
    "check-product-baseline.mjs",
    "check-claim-control.mjs",
    "check-context-governance.mjs",
    "check-launch-readiness.mjs",
    "check-conversation-drift.mjs",
    "check-guided-delivery-loop.mjs",
    "check-first-delivery-walkthrough.mjs",
    "check-real-adoption-trial.mjs",
    "check-patch-classification.mjs",
    "check-workflow-adoption-map.mjs",
    "resolve-existing-workflow.mjs",
    "check-document-lifecycle.mjs",
    "resolve-document-lifecycle.mjs",
    "check-document-archive-apply.mjs",
    "resolve-document-archive-apply.mjs",
    "check-apply-plan.mjs",
    "resolve-apply-plan.mjs",
    "check-beginner-entry.mjs",
    "resolve-beginner-entry.mjs",
    "check-work-queue.mjs",
    "resolve-work-queue.mjs",
    "check-hook-orchestration.mjs",
    "resolve-hook-orchestration.mjs",
    "check-workflow-guidance.mjs",
    "resolve-workflow-guidance.mjs",
    "check-review-surface.mjs",
    "resolve-review-surface.mjs",
    "check-change-impact-coverage.mjs",
    "resolve-change-impact-coverage.mjs",
    "check-delivery-path.mjs",
    "resolve-delivery-path.mjs",
    "check-debt-handoff.mjs",
    "resolve-debt-handoff.mjs",
    "check-change-boundary.mjs",
    "check-baseline-state.mjs",
    "resolve-standard-baseline.mjs",
    "check-standard-baseline-pack.mjs",
    "check-standard-baseline-selection.mjs",
    "resolve-baseline-packs.mjs",
    "check-baseline-pack-selection.mjs",
    "check-platform-baseline.mjs",
    "resolve-platform-baseline.mjs",
    "check-industrial-pack.mjs",
    "resolve-industrial-baseline.mjs",
    "check-industrial-baseline.mjs",
    "check-workflow-artifacts.mjs",
    "check-review-loop.mjs",
    "check-next-step-boundary.mjs",
    "check-goal-mode.mjs",
    "check-subagent-orchestration.mjs",
    "new-workflow-item.mjs",
    "start-project.mjs",
    "workflow-next.mjs",
  ]) {
    if (githubCi.includes(command)) {
      pass(`platforms/github/ci-ai-workflow.yml runs ${command}`);
    } else {
      fail(`platforms/github/ci-ai-workflow.yml missing ${command}`);
    }
  }

  for (const marker of ["fetch-depth: 0", "--mode core", "--selected-only", "--bl2-only", "--mode ready", "--changed-only", "--base origin/${{ github.base_ref }}"]) {
    if (githubCi.includes(marker)) {
      pass(`platforms/github/ci-ai-workflow.yml includes ${marker}`);
    } else {
      fail(`platforms/github/ci-ai-workflow.yml missing ${marker}`);
    }
  }
}

function checkScriptSyntax() {
  const scripts = [
    "scripts/lib/artifact-schema.mjs",
    "scripts/init-project.mjs",
    "scripts/check-ai-workflow.mjs",
    "scripts/check-guided-adoption.mjs",
    "scripts/check-intentos.mjs",
    "scripts/summarize-ai-logs.mjs",
    "scripts/check-workflow-version.mjs",
    "scripts/workflow-daily-summary.mjs",
    "scripts/check-project-onboarding.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-environment-baseline.mjs",
    "scripts/check-baseline-enforcement.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-launch-readiness.mjs",
    "scripts/check-conversation-drift.mjs",
    "scripts/check-first-delivery-walkthrough.mjs",
    "scripts/check-real-adoption-trial.mjs",
    "scripts/check-patch-classification.mjs",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "scripts/resolve-document-lifecycle.mjs",
    "scripts/check-document-lifecycle.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/check-work-queue.mjs",
    "scripts/resolve-hook-orchestration.mjs",
    "scripts/check-hook-orchestration.mjs",
    "scripts/resolve-workflow-guidance.mjs",
    "scripts/check-workflow-guidance.mjs",
    "scripts/resolve-guided-closure.mjs",
    "scripts/check-guided-closure.mjs",
    "scripts/resolve-execution-assurance.mjs",
    "scripts/check-execution-assurance.mjs",
    "scripts/resolve-change-impact-coverage.mjs",
    "scripts/check-change-impact-coverage.mjs",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    "scripts/resolve-first-slice.mjs",
    "scripts/check-first-slice.mjs",
    "scripts/resolve-product-completeness.mjs",
    "scripts/check-product-completeness.mjs",
    "scripts/check-mvp-example.mjs",
    "scripts/resolve-low-risk-apply-candidate.mjs",
    "scripts/check-low-risk-apply-candidate.mjs",
    "scripts/resolve-platform-release-recipe.mjs",
    "scripts/check-platform-release-recipe.mjs",
    "scripts/resolve-release-handoff-pack.mjs",
    "scripts/check-release-handoff-pack.mjs",
    "scripts/resolve-delivery-path.mjs",
    "scripts/check-delivery-path.mjs",
    "scripts/resolve-debt-handoff.mjs",
    "scripts/check-debt-handoff.mjs",
    "scripts/check-approval-record.mjs",
    "scripts/resolve-standard-baseline.mjs",
    "scripts/check-standard-baseline-pack.mjs",
    "scripts/check-standard-baseline-selection.mjs",
    "scripts/resolve-guided-baseline-selection.mjs",
    "scripts/check-guided-baseline-selection.mjs",
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/cli.mjs",
    "scripts/start-project.mjs",
    "scripts/baseline-project.mjs",
    "scripts/migrate-project.mjs",
    "scripts/lib/args.mjs",
    "scripts/lib/check-result.mjs",
    "scripts/lib/frontmatter.mjs",
    "scripts/lib/git.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/lib/markdown.mjs",
    "scripts/lib/project-signals.mjs",
    "scripts/check-manifest.mjs",
    "scripts/check-fixtures.mjs",
    "scripts/score-output-quality.mjs",
    "scripts/check-glossary-usage.mjs",
    "scripts/new-workflow-item.mjs",
    "scripts/workflow-next.mjs",
  ];
  for (const script of scripts) {
    const result = spawnSync(process.execPath, ["--check", path.join(kitRoot, script)], {
      encoding: "utf8",
    });
    if (result.status === 0) {
      pass(`syntax ${script}`);
    } else {
      fail(`syntax ${script}: ${result.stderr || result.stdout}`);
    }
  }
}

function checkReadmePointers() {
  const readme = read("README.md");
  const zhReadme = read("README.zh-CN.md");
  const requiredReadmePointers = [
    "IntentOS",
    "An AI-native system for guided software delivery",
    "Current release",
    "Start In 30 Seconds",
    "You describe the goal",
    "node scripts/cli.mjs work",
    "How It Works",
    "What IntentOS Covers",
    "New, Existing, And Production Projects",
    "Safety Boundaries",
    "Release History",
    "core/review-context-authority.md",
    "docs/start-here.md",
    "docs/operating-model.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "npm run verify",
    "VERSION.md",
    "License",
  ];
  for (const pointer of requiredReadmePointers) {
    if (readme.includes(pointer)) pass(`README entry mentions ${pointer}`);
    else fail(`README entry missing ${pointer}`);
  }
  const currentReleasePointer = `releases/${currentVersion()}/release-record.md`;
  if (readme.includes(currentReleasePointer) && zhReadme.includes(currentReleasePointer)) {
    pass("README files mention current release record");
  } else {
    fail(`README files must mention current release record: ${currentReleasePointer}`);
  }

  for (const pointer of [
    "IntentOS 中文说明",
    "面向 AI 协作开发的项目交付系统",
    "当前版本",
    "30 秒开始",
    "你只说真实业务",
    "node scripts/cli.mjs work",
    "版本历史",
    "core/review-context-authority.md",
    "3 分钟理解",
    "适合什么场景",
    "项目分级",
    "安全边界",
    "docs/start-here.md",
    "docs/operating-model.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "npm run verify",
    currentReleasePointer,
    "VERSION.md",
  ]) {
    if (zhReadme.includes(pointer)) pass(`README.zh-CN mentions ${pointer}`);
    else fail(`README.zh-CN missing ${pointer}`);
  }

  const requiredDocs = [
    "docs/start-here.md",
    "docs/minimal-adoption.md",
    "docs/source-only-adoption.md",
    "docs/for-existing-projects.md",
    "docs/for-maintainers.md",
    "docs/README.md",
    "docs/index.md",
    "docs/repository-structure.md",
    "docs/document-ownership.md",
    "docs/artifact-lifecycle.md",
    "docs/structured-evidence-schema.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/plans/README.md",
    "docs/plans/repository-information-architecture-1.36-plan.md",
    "docs/plans/existing-project-native-adoption-decision-1.69-plan.md",
    "docs/plans/product-adoption-trust-finalization-1.68.2-plan.md",
    "docs/plans/product-adoption-trust-hardening-1.68.1-plan.md",
    "docs/plans/product-adoption-simplification-1.68-plan.md",
    "docs/plans/execution-assurance-chain-1.72-plan.md",
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "docs/roadmaps/README.md",
    "docs/operator-manual.md",
    "docs/natural-language-orchestrator.md",
    "docs/unified-closure-model.md",
    "docs/decision-explain-trace.md",
    "docs/execution-assurance-chain.md",
    "docs/launch-review-view.md",
    "docs/release-adapter.md",
    "docs/release-execution-protocol.md",
    "docs/review-surface-governance.md",
    "docs/change-impact-coverage.md",
    "docs/delivery-path-governance.md",
    "docs/first-hour.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "docs/reference/standard-baseline-packs.md",
    "docs/reference/industrial-packs.md",
    "docs/guided-delivery-baseline.md",
    "docs/product-baseline.md",
    "docs/claim-control.md",
    "docs/project-memory.md",
    "docs/git-boundary.md",
    "docs/context-governance-usage.md",
    "docs/minimal-commit-set.md",
    "docs/safe-launch.md",
    "docs/conversation-drift-control.md",
    "docs/conversation-native-ask.md",
    "docs/first-delivery-walkthrough.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/existing-project-workflow-adapter.md",
    "docs/document-lifecycle.md",
    "docs/document-archive-apply.md",
    "docs/work-queue.md",
    "docs/hook-policy.md",
    "docs/baseline-pack-system.md",
    "docs/adoption-playbooks/new-project.md",
    "docs/adoption-playbooks/existing-light-project.md",
    "docs/adoption-playbooks/governed-project-read-only.md",
    "docs/adoption-playbooks/production-project-adapter.md",
    "docs/migrations/index.md",
    "docs/migrations/0.33-to-1.0.md",
    "docs/troubleshooting.md",
    "docs/faq.md",
  ];
  for (const doc of requiredDocs) {
    if (exists(doc)) pass(`docs IA file exists ${doc}`);
    else fail(`docs IA file missing ${doc}`);
  }

  const rootDocs = fs.readdirSync(path.join(kitRoot, "docs"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
  const misplacedPlans = rootDocs.filter((name) => /-\d+(?:\.\d+)*-plan\.md$/.test(name));
  const misplacedRoadmaps = rootDocs.filter((name) => /roadmap/i.test(name));
  if (misplacedPlans.length === 0) pass("docs IA keeps historical plan files out of docs root");
  else fail(`docs IA has plan files in docs root: ${misplacedPlans.join(", ")}`);
  if (misplacedRoadmaps.length === 0) pass("docs IA keeps roadmap files out of docs root");
  else fail(`docs IA has roadmap files in docs root: ${misplacedRoadmaps.join(", ")}`);

  const plans = fs.readdirSync(path.join(kitRoot, "docs", "plans"))
    .filter((name) => name.endsWith(".md"))
    .sort();
  const roadmaps = fs.readdirSync(path.join(kitRoot, "docs", "roadmaps"))
    .filter((name) => name.endsWith(".md"))
    .sort();
  if (plans.includes("repository-information-architecture-1.36-plan.md")
    && plans.includes("beginner-entry-1.35-plan.md")
    && plans.includes("productization-hardcut-1.0-plan.md")) {
    pass("docs IA has historical plans under docs/plans");
  } else {
    fail(`docs IA missing expected plans under docs/plans: ${plans.join(", ")}`);
  }
  if (roadmaps.includes("governance-hardening-roadmap.md")
    && roadmaps.includes("delivery-governance-roadmap-1.26-1.29.md")) {
    pass("docs IA has roadmap docs under docs/roadmaps");
  } else {
    fail(`docs IA missing expected roadmaps under docs/roadmaps: ${roadmaps.join(", ")}`);
  }

  const repositoryStructure = read("docs/repository-structure.md");
  for (const marker of [
    "Root Directory Classes",
    "Why Many Root Artifact Directories Remain Flat",
    "workflow artifact contract",
    "Do not move root workflow artifact directories",
  ]) {
    if (repositoryStructure.includes(marker)) pass(`repository structure docs include ${marker}`);
    else fail(`repository structure docs missing ${marker}`);
  }

  const ownership = read("docs/document-ownership.md");
  for (const marker of [
    "Source Of Truth",
    "Historical plans",
    "Roadmaps",
    "When Docs Disagree",
    "does not authorize deletion",
  ]) {
    if (ownership.includes(marker)) pass(`document ownership docs include ${marker}`);
    else fail(`document ownership docs missing ${marker}`);
  }

  const referenceContent = [
    readme,
    zhReadme,
    ...requiredDocs.filter(exists).map(read),
    read("docs/quickstart.md"),
    read("docs/codex-usage.md"),
    read("docs/mental-model.md"),
    read("docs/artifact-decision-tree.md"),
    read("docs/goal-subagent-usage.md"),
    read("docs/roadmaps/governance-hardening-roadmap.md"),
  ].join("\n");
  const requiredReferencePointers = [
    "Start Here",
    "Minimal Adoption",
    "Source-Only Adoption",
    "For Existing Projects",
    "For Maintainers",
    "Primary Public Entry",
    "generic-project",
    "codex-ios-app",
    "codex-android-app",
    "Goal Mode",
    "Subagent Orchestration",
    "Many readers, one writer",
    "CLOSED",
    "SKIPPED",
    "DISCUSS_ONLY",
    "ADOPT_PROJECT",
    "DEFINE_WORK",
    "IMPLEMENT_TASK",
    "REVIEW_TASK",
    "REPAIR_TASK",
    "BASELINE_DECISION",
    "HANDOFF_OR_REPORT",
    "Human Approval",
    "Risk Gate Exclusions",
    "O0",
    "O1",
    "O2",
    "BL0",
    "BL1",
    "BL2",
    "workflow-next",
    "start-project",
    "Guided Adoption Recommendation",
    "adoption-recommendations",
    "ADOPTION_MODE",
    "RUN_ADOPTION_ASSESSMENT",
    "REVIEW_DIRTY_WORKTREE",
    "PROJECT_STATE_TAGS",
    "adoption-assessment",
    "existing-governance-map",
    "review-packet",
    "gpt-review-prompt",
    "review-loop-report",
    "Safe Launch",
    "Launch Readiness Report",
    "Conversation Drift Control",
    "Conversation Turn Classification",
    "Scope Change Report",
    "First Delivery Walkthrough",
    "Adoption Trial Report",
    "Workflow Adoption Map",
    "Document Lifecycle",
    "Guided Delivery Check",
    "Change Boundary",
    "Baseline State",
    "Unified Apply Plan",
    "Beginner Entry",
    "beginner-entry-cards",
    "apply-plans",
    "change-boundary-reports",
    "baseline-state-reports",
    "launch-readiness",
    "conversation-turns",
    "scope-change-reports",
    "adoption-trial-reports",
    "workflow-adoption-maps",
    "doc-lifecycle-reports",
    "work-queue",
    "follow-up-proposal",
    "final-report",
    "human-status-report",
    "decision-brief",
    "plain-review-summary",
    "customer-handoff",
    "skill-candidates",
    "automation-proposals",
    "platform baseline",
    "industrial-packs",
    "selection-guide",
    "--selected-only",
    "--bl2-only",
    "--mode core",
    "--mode full",
    "--mode ready",
    "--mode implementation",
    "--task",
    "--changed-only",
    "--enforce",
    "--apply-pr-template-governance",
    "--apply-agent-governance",
    "migration-reports",
    "workflow-daily-summary",
    "profiles/",
    "platforms/",
  ];
  for (const pointer of requiredReferencePointers) {
    if (referenceContent.includes(pointer)) pass(`docs references mention ${pointer}`);
    else fail(`docs references missing ${pointer}`);
  }
}

function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    maxBuffer: options.maxBuffer || 1024 * 1024 * 80,
  });
}

function checkFixtureSuite() {
  const result = runNode([
    path.join(kitRoot, "scripts", "check-fixtures.mjs"),
  ]);
  if (result.status !== 0) {
    fail(`fixture suite failed: ${result.stderr || result.stdout}`);
    return;
  }
  pass("fixture suite");
}

function checkReviewLoopL2DogfoodExample() {
  const exampleRoot = path.join(kitRoot, "examples", "review-loop-l2-first-slice");
  const requiredMarkers = [
    ["review-loop-reports/001-review-loop-l2-slice.md", "AUTO_FIX"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "NEEDS_HUMAN_DECISION"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "DIRECT_FOLLOW_UP"],
    ["review-loop-reports/001-review-loop-l2-slice.md", "DO_NOT_PROCEED"],
    ["final-reports/001-review-loop-l2-slice.md", "DIRECT_FOLLOW_UP"],
    ["final-reports/001-review-loop-l2-slice.md", "DO_NOT_PROCEED"],
  ];
  for (const [file, marker] of requiredMarkers) {
    const content = fs.readFileSync(path.join(exampleRoot, file), "utf8");
    if (!content.includes(marker)) {
      fail(`Review Loop L2 dogfood example missing ${marker} in ${file}`);
      return;
    }
  }

  const artifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (artifactCheck.status !== 0) {
    fail(`Review Loop L2 dogfood workflow artifact check failed: ${artifactCheck.stderr || artifactCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood workflow artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`Review Loop L2 dogfood review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-review-loop-l2-slice.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`Review Loop L2 dogfood next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("Review Loop L2 dogfood next-step boundary check");
}

function checkGoalSubagentL2FeatureExample() {
  const exampleRoot = path.join(kitRoot, "examples", "goal-subagent-l2-feature");
  const requiredMarkers = [
    ["README.md", "simulated dogfood"],
    ["README.md", "not real project validation"],
    ["goal-cards/001-project-status-filter.md", "IMPLEMENT_TASK"],
    ["subagent-run-plans/001-project-status-filter.md", "Many readers, one writer: Yes"],
    ["subagent-run-plans/001-project-status-filter.md", "All subagents closed: Yes"],
    ["review-loop-reports/001-project-status-filter.md", "AUTO_FIX"],
    ["review-loop-reports/001-project-status-filter.md", "NEEDS_HUMAN_DECISION"],
    ["review-loop-reports/001-project-status-filter.md", "DIRECT_FOLLOW_UP"],
    ["review-loop-reports/001-project-status-filter.md", "DO_NOT_PROCEED"],
    ["final-reports/001-project-status-filter.md", "DIRECT_FOLLOW_UP"],
    ["follow-up-proposals/001-status-filter-lookup-admin.md", "Can AI Do This Now?"],
  ];
  for (const [file, marker] of requiredMarkers) {
    const content = fs.readFileSync(path.join(exampleRoot, file), "utf8");
    if (!content.includes(marker)) {
      fail(`Goal + Subagent L2 feature example missing ${marker} in ${file}`);
      return;
    }
  }

  const checks = [
    ["Goal + Subagent L2 feature Goal Mode check", [
      path.join(kitRoot, "scripts", "check-goal-mode.mjs"),
      exampleRoot,
    ]],
    ["Goal + Subagent L2 feature Subagent Orchestration check", [
      path.join(kitRoot, "scripts", "check-subagent-orchestration.mjs"),
      exampleRoot,
    ]],
    ["Goal + Subagent L2 feature Engineering Baseline strict check", [
      path.join(kitRoot, "scripts", "check-engineering-baseline.mjs"),
      exampleRoot,
      "--strict",
    ]],
    ["Goal + Subagent L2 feature workflow artifact check", [
      path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
      exampleRoot,
      "--mode",
      "ready",
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature review loop check", [
      path.join(kitRoot, "scripts", "check-review-loop.mjs"),
      exampleRoot,
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature next-step boundary check", [
      path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
      exampleRoot,
      "--task",
      "tasks/001-project-status-filter.md",
    ]],
    ["Goal + Subagent L2 feature output quality check", [
      path.join(kitRoot, "scripts", "score-output-quality.mjs"),
      exampleRoot,
      "--min-score",
      "80",
    ]],
  ];

  for (const [label, args] of checks) {
    const result = runNode(args);
    if (result.status !== 0) {
      fail(`${label} failed: ${result.stderr || result.stdout}`);
      return;
    }
    pass(label);
  }
}

function checkWebBl2ExampleArtifacts() {
  const exampleRoot = path.join(kitRoot, "examples", "web-industrial-bl2-first-slice");
  const readyArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (readyArtifactCheck.status !== 0) {
    fail(`web BL2 example ready artifact check failed: ${readyArtifactCheck.stderr || readyArtifactCheck.stdout}`);
    return;
  }
  pass("web BL2 example ready artifact check");

  const implementationArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (implementationArtifactCheck.status !== 0) {
    fail(`web BL2 example implementation artifact check failed: ${implementationArtifactCheck.stderr || implementationArtifactCheck.stdout}`);
    return;
  }
  pass("web BL2 example implementation artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`web BL2 example review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("web BL2 example review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-web-runtime-quality.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`web BL2 example next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("web BL2 example next-step boundary check");
}

function checkMiniProgramBl2ExampleArtifacts() {
  const exampleRoot = path.join(kitRoot, "examples", "miniprogram-industrial-bl2-first-slice");
  const readyArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "ready",
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (readyArtifactCheck.status !== 0) {
    fail(`Mini Program BL2 example ready artifact check failed: ${readyArtifactCheck.stderr || readyArtifactCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example ready artifact check");

  const implementationArtifactCheck = runNode([
    path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"),
    exampleRoot,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (implementationArtifactCheck.status !== 0) {
    fail(`Mini Program BL2 example implementation artifact check failed: ${implementationArtifactCheck.stderr || implementationArtifactCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example implementation artifact check");

  const reviewLoopCheck = runNode([
    path.join(kitRoot, "scripts", "check-review-loop.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (reviewLoopCheck.status !== 0) {
    fail(`Mini Program BL2 example review loop check failed: ${reviewLoopCheck.stderr || reviewLoopCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example review loop check");

  const nextStepCheck = runNode([
    path.join(kitRoot, "scripts", "check-next-step-boundary.mjs"),
    exampleRoot,
    "--task",
    "tasks/001-miniprogram-login-cloud-read.md",
  ]);
  if (nextStepCheck.status !== 0) {
    fail(`Mini Program BL2 example next-step boundary check failed: ${nextStepCheck.stderr || nextStepCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example next-step boundary check");

  const baselineCheck = runNode([
    path.join(kitRoot, "scripts", "check-industrial-baseline.mjs"),
    exampleRoot,
    "--strict",
  ]);
  if (baselineCheck.status !== 0 || !baselineCheck.stdout.includes("Industrial baseline is ready")) {
    fail(`Mini Program BL2 example strict baseline check failed: ${baselineCheck.stderr || baselineCheck.stdout}`);
    return;
  }
  pass("Mini Program BL2 example strict baseline check");
}

function checkGeneratedProjectE2E() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-e2e-"));
  const target = path.join(tempRoot, "generated-project");

  const initResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
  ]);
  if (initResult.status !== 0) {
    fail(`generated project init failed: ${initResult.stderr || initResult.stdout}`);
    return;
  }
  pass("generated project init");

  const operatingModelAssets = [
    "scripts/resolve-operating-loop.mjs",
    "scripts/check-review-context-authority.mjs",
    "scripts/lib/review-context-authority.mjs",
    ".intentos/core/operating-model.md",
    ".intentos/docs/operating-model.md",
    ".intentos/core/review-context-authority.json",
    ".intentos/core/review-context-authority.md",
  ];
  const missingOperatingModelAssets = operatingModelAssets.filter((relativePath) => !fs.existsSync(path.join(target, relativePath)));
  if (missingOperatingModelAssets.length > 0) {
    fail(`generated project missing operating model assets: ${missingOperatingModelAssets.join(", ")}`);
    return;
  }
  const generatedVersion = JSON.parse(fs.readFileSync(path.join(target, ".intentos", "version.json"), "utf8"));
  if (generatedVersion.projectEntryOrigin !== "NEW_PROJECT") {
    fail(`generated project entry origin is not durable: ${generatedVersion.projectEntryOrigin || "missing"}`);
    return;
  }
  const generatedReviewContextCheck = runNode([
    path.join(target, "scripts", "check-review-context-authority.mjs"),
    target,
  ]);
  if (generatedReviewContextCheck.status !== 0
    || !generatedReviewContextCheck.stdout.includes("Review context authority check passed")) {
    fail(`generated project review context authority check failed: ${generatedReviewContextCheck.stderr || generatedReviewContextCheck.stdout}`);
    return;
  }
  pass("generated project review context authority check");

  for (const type of ["review-packet", "gpt-review-prompt"]) {
    const generatedReviewInput = runNode([
      path.join(target, "scripts", "new-workflow-item.mjs"),
      "--root", target,
      "--type", type,
      "--name", "context-binding-smoke",
    ]);
    if (generatedReviewInput.status !== 0) {
      fail(`generated project ${type} creation failed: ${generatedReviewInput.stderr || generatedReviewInput.stdout}`);
      return;
    }
  }
  const authority = loadReviewContextAuthority(target);
  const generatedBindings = [
    path.join(target, "review-packets", "001-context-binding-smoke.md"),
    path.join(target, "gpt-review-prompts", "001-context-binding-smoke.md"),
  ].map((file) => validateReviewContextBinding(
    reviewContextBindingFromMarkdown(fs.readFileSync(file, "utf8")),
    authority,
  ));
  if (generatedBindings.every((binding) => binding.ok)) {
    pass("generated project review inputs carry current context binding");
  } else {
    fail(`generated project review input binding failed: ${generatedBindings.flatMap((binding) => binding.errors).join("; ")}`);
    return;
  }
  const operatingLoop = runNode([
    path.join(target, "scripts", "resolve-operating-loop.mjs"),
    target,
    "--intent",
    "我想做一个预约 App",
    "--json",
  ]);
  if (operatingLoop.status !== 0) {
    fail(`generated project operating loop failed: ${operatingLoop.stderr || operatingLoop.stdout}`);
    return;
  }
  let operatingState;
  try {
    operatingState = JSON.parse(operatingLoop.stdout);
  } catch (error) {
    fail(`generated project operating loop returned invalid JSON: ${error.message}`);
    return;
  }
  if (operatingState.projectEntry?.state !== "NEW_PROJECT_ENTRY"
    || operatingState.operatingLoop?.operation !== "START_PROJECT"
    || operatingState.readOnly !== true
    || operatingState.boundaries?.writesTargetFiles !== "No") {
    fail(`generated project operating loop misrouted the new project: ${operatingLoop.stdout}`);
    return;
  }
  pass("generated project operating model entry and routing");

  const generatedReleaseChannel = runNode([
    path.join(target, "scripts", "cli.mjs"),
    "release-channel",
    target,
    "--intent", "review source-only release channel",
    "--project-type", "new_project",
    "--channel", "source_only",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
    "--json",
  ]);
  if (generatedReleaseChannel.status !== 0) {
    fail(`generated project release-channel command failed: ${generatedReleaseChannel.stderr || generatedReleaseChannel.stdout}`);
    return;
  }
  try {
    const channel = JSON.parse(generatedReleaseChannel.stdout);
    if (channel.outcome === "RELEASE_CHANNEL_POLICY_RECORDED") pass("generated project release-channel command and dependencies");
    else fail(`generated project release-channel returned unexpected outcome: ${generatedReleaseChannel.stdout}`);
  } catch (error) {
    fail(`generated project release-channel returned invalid JSON: ${error.message}`);
    return;
  }

  const projectCheck = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
  ]);
  if (projectCheck.status !== 0) {
    fail(`generated project workflow check failed: ${projectCheck.stderr || projectCheck.stdout}`);
    return;
  }
  pass("generated project workflow check");

  const projectCoreCheck = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
    "--mode",
    "core",
  ]);
  if (projectCoreCheck.status !== 0) {
    fail(`generated project core workflow check failed: ${projectCoreCheck.stderr || projectCoreCheck.stdout}`);
    return;
  }
  pass("generated project core workflow check");

  const nextCheck = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
  ]);
  if (nextCheck.status !== 0 || !nextCheck.stdout.includes("PROJECT_STATE: BOOTSTRAPPED_PROJECT")) {
    fail(`generated project workflow next check failed: ${nextCheck.stderr || nextCheck.stdout}`);
    return;
  }
  pass("generated project workflow next check");

  const startCheck = runNode([
    path.join(target, "scripts", "start-project.mjs"),
    target,
  ]);
  if (startCheck.status !== 0
    || !startCheck.stdout.includes("# Guided Adoption Recommendation")
    || !startCheck.stdout.includes("Can AI write now | No")
    || !startCheck.stdout.includes("target files written by start | No")) {
    fail(`generated project guided adoption start check failed: ${startCheck.stderr || startCheck.stdout}`);
    return;
  }
  pass("generated project guided adoption start check");

  const guidedReportCheck = runNode([
    path.join(target, "scripts", "check-guided-adoption.mjs"),
    target,
  ]);
  if (guidedReportCheck.status !== 0) {
    fail(`generated project guided adoption report check failed: ${guidedReportCheck.stderr || guidedReportCheck.stdout}`);
    return;
  }
  pass("generated project guided adoption report check");

  const beginnerEntryResolverCheck = runNode([
    path.join(target, "scripts", "resolve-beginner-entry.mjs"),
    target,
    "--goal",
    "build an appointment app",
  ]);
  if (beginnerEntryResolverCheck.status !== 0
    || !beginnerEntryResolverCheck.stdout.includes("Beginner Entry Card")
    || !beginnerEntryResolverCheck.stdout.includes("This entry writes target files: No")) {
    fail(`generated project beginner entry resolver failed: ${beginnerEntryResolverCheck.stderr || beginnerEntryResolverCheck.stdout}`);
    return;
  }
  pass("generated project beginner entry resolver");

  const beginnerEntryCheck = runNode([
    path.join(target, "scripts", "check-beginner-entry.mjs"),
    target,
  ]);
  if (beginnerEntryCheck.status !== 0 || !beginnerEntryCheck.stdout.includes("Beginner Entry check passed")) {
    fail(`generated project beginner entry check failed: ${beginnerEntryCheck.stderr || beginnerEntryCheck.stdout}`);
    return;
  }
  pass("generated project beginner entry check");

  const beginnerEntryCli = runNode([
    path.join(target, "scripts", "cli.mjs"),
    "ask",
    target,
    "build an appointment app",
  ]);
  if (beginnerEntryCli.status !== 0
    || !beginnerEntryCli.stdout.includes("Beginner Entry Card")
    || !beginnerEntryCli.stdout.includes("This entry writes target files: No")) {
    fail(`generated project CLI ask failed: ${beginnerEntryCli.stderr || beginnerEntryCli.stdout}`);
    return;
  }
  pass("generated project CLI ask");

  const summaryCheck = runNode([
    path.join(target, "scripts", "summarize-ai-logs.mjs"),
    target,
  ]);
  if (summaryCheck.status !== 0) {
    fail(`generated project summarize-ai-logs failed: ${summaryCheck.stderr || summaryCheck.stdout}`);
    return;
  }
  pass("generated project summarize-ai-logs");

  const versionCheck = runNode([
    path.join(target, "scripts", "check-workflow-version.mjs"),
    target,
  ]);
  if (versionCheck.status !== 0) {
    fail(`generated project workflow version check failed: ${versionCheck.stderr || versionCheck.stdout}`);
    return;
  }
  pass("generated project workflow version check");

  const onboardingCheck = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
  ]);
  if (onboardingCheck.status !== 0) {
    fail(`generated project onboarding check failed: ${onboardingCheck.stderr || onboardingCheck.stdout}`);
    return;
  }
  pass("generated project onboarding check");

  for (const rel of [
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-review-loop.mjs",
    "scripts/check-next-step-boundary.mjs",
    "scripts/check-goal-mode.mjs",
    "scripts/check-subagent-orchestration.mjs",
    "scripts/resolve-beginner-entry.mjs",
    "scripts/check-beginner-entry.mjs",
    "scripts/check-engineering-baseline.mjs",
    "scripts/check-product-baseline.mjs",
    "scripts/check-claim-control.mjs",
    "scripts/check-context-governance.mjs",
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
    ".intentos/profiles/web-app/baseline.json",
    ".intentos/profiles/wechat-miniprogram/baseline.json",
    ".intentos/industrial-packs/index.json",
    ".intentos/industrial-packs/selection-guide.md",
    ".intentos/industrial-packs/schema/pack.schema.json",
    ".intentos/industrial-packs/schema/baseline-selection.schema.json",
    ".intentos/templates/baseline-selection.md",
    ".intentos/templates/baseline-evidence.md",
    ".intentos/docs/artifact-decision-tree.md",
    ".intentos/docs/goal-subagent-usage.md",
    ".intentos/docs/guided-delivery-baseline.md",
    ".intentos/docs/product-baseline.md",
    ".intentos/docs/claim-control.md",
    ".intentos/docs/project-memory.md",
    ".intentos/docs/git-boundary.md",
    ".intentos/docs/change-boundary.md",
    ".intentos/docs/baseline-state.md",
    ".intentos/docs/guided-delivery-check.md",
    ".intentos/docs/beginner-entry.md",
    ".intentos/core/engineering-baseline.md",
    ".intentos/core/outcome-baseline.md",
    ".intentos/core/product-baseline.md",
    ".intentos/core/claim-control.md",
    ".intentos/core/assumption-register.md",
    ".intentos/core/context-governance.md",
    ".intentos/core/git-boundary.md",
    ".intentos/core/change-boundary.md",
    ".intentos/core/baseline-state.md",
    ".intentos/core/beginner-entry.md",
    ".intentos/templates/engineering-baseline.md",
    ".intentos/templates/product-baseline-review.md",
    ".intentos/templates/claim-control-report.md",
    ".intentos/templates/assumption-register.md",
    ".intentos/templates/learning-candidate.md",
    ".intentos/templates/context-correction-report.md",
    ".intentos/templates/git-boundary-report.md",
    ".intentos/templates/change-boundary-report.md",
    ".intentos/templates/baseline-state-report.md",
    ".intentos/templates/beginner-entry-card.md",
    ".intentos/checklists/engineering-baseline-review.md",
    ".intentos/checklists/product-baseline-review.md",
    ".intentos/checklists/claim-control-review.md",
    ".intentos/checklists/context-governance-review.md",
    ".intentos/checklists/git-boundary-review.md",
    ".intentos/checklists/guided-delivery-loop-review.md",
    ".intentos/checklists/change-boundary-review.md",
    ".intentos/checklists/baseline-state-review.md",
    ".intentos/checklists/beginner-entry-review.md",
    ".intentos/core/next-step-boundary.md",
    ".intentos/core/goal-mode.md",
    ".intentos/core/subagent-orchestration.md",
    ".intentos/templates/follow-up-proposal.md",
    ".intentos/templates/final-report.md",
    ".intentos/templates/goal-card.md",
    ".intentos/templates/subagent-run-plan.md",
    ".intentos/checklists/next-step-boundary-review.md",
    ".intentos/checklists/goal-mode-review.md",
    ".intentos/checklists/subagent-orchestration-review.md",
    ".intentos/prompts/goal-planner-agent.md",
    ".intentos/prompts/engineering-baseline-agent.md",
    ".intentos/prompts/product-baseline-agent.md",
    ".intentos/prompts/claim-control-agent.md",
    ".intentos/prompts/context-governance-agent.md",
    ".intentos/prompts/guided-delivery-check-agent.md",
    ".intentos/prompts/change-boundary-agent.md",
    ".intentos/prompts/baseline-state-agent.md",
    ".intentos/prompts/beginner-entry-agent.md",
    ".intentos/core/output-protocol.md",
    ".intentos/core/glossary.md",
    ".intentos/prompts/reporter-agent.md",
    ".intentos/templates/human-status-report.md",
    ".intentos/templates/decision-brief.md",
    ".intentos/templates/plain-review-summary.md",
    ".intentos/templates/customer-handoff.md",
    "status-reports/.gitkeep",
    "goal-cards/.gitkeep",
    "subagent-run-plans/.gitkeep",
    "decision-briefs/.gitkeep",
    "review-summaries/.gitkeep",
    "customer-handoffs/.gitkeep",
    "follow-up-proposals/.gitkeep",
    "final-reports/.gitkeep",
    "beginner-entry-cards/.gitkeep",
    "learning-candidates/.gitkeep",
    "context-corrections/.gitkeep",
    "git-boundary-reports/.gitkeep",
    "change-boundary-reports/.gitkeep",
    "baseline-state-reports/.gitkeep",
    "docs/verification-matrix.md",
    "docs/engineering-baseline.md",
    ".intentos/core/completion-evidence-gate.md",
    ".intentos/docs/completion-evidence-gate.md",
    ".intentos/templates/completion-evidence-report.md",
    ".intentos/checklists/completion-evidence-review.md",
    ".intentos/prompts/completion-evidence-agent.md",
    ".intentos/schemas/artifacts/completion-evidence.schema.json",
    "scripts/resolve-completion-evidence.mjs",
    "scripts/check-completion-evidence.mjs",
    "completion-evidence-reports/.gitkeep",
    ".intentos/core/release-evidence-gate.md",
    ".intentos/docs/release-evidence-gate.md",
    ".intentos/templates/release-evidence-gate-report.md",
    ".intentos/checklists/release-evidence-gate-review.md",
    ".intentos/prompts/release-evidence-gate-agent.md",
    ".intentos/schemas/artifacts/release-evidence-gate.schema.json",
    "scripts/resolve-release-evidence-gate.mjs",
    "scripts/check-release-evidence-gate.mjs",
    "release-evidence-gate-reports/.gitkeep",
    "release-candidates/.gitkeep",
  ]) {
    if (!fs.existsSync(path.join(target, rel))) {
      fail(`generated project missing platform baseline asset: ${rel}`);
      return;
    }
  }
  pass("generated project platform baseline assets");

  const generatedBusinessRuleReport = "business-rule-closures/001-generated-service-time.md";
  const generatedBusinessRuleRef = `artifact:${generatedBusinessRuleReport}`;
  const generatedBusinessRuleResolve = runNode([
    path.join(target, "scripts", "resolve-business-rule-closure.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--out",
    generatedBusinessRuleReport,
  ]);
  if (generatedBusinessRuleResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedBusinessRuleReport))
    || !generatedBusinessRuleResolve.stdout.includes(generatedBusinessRuleRef)) {
    fail(`generated project business rule resolver should write a self-referencing report: ${generatedBusinessRuleResolve.stderr || generatedBusinessRuleResolve.stdout}`);
    return;
  }
  const generatedBusinessRuleStrictCheck = runNode([
    path.join(target, "scripts", "check-business-rule-closure.mjs"),
    target,
    "--report",
    generatedBusinessRuleReport,
    "--require-structured-evidence",
  ]);
  if (generatedBusinessRuleStrictCheck.status !== 0
    || !generatedBusinessRuleStrictCheck.stdout.includes("Business Rule Closure check passed")
    || !generatedBusinessRuleStrictCheck.stdout.includes("business_rule_ref points to this report")) {
    fail(`generated project business rule strict same-report check failed: ${generatedBusinessRuleStrictCheck.stderr || generatedBusinessRuleStrictCheck.stdout}`);
    return;
  }
  const generatedImpactReport = "change-impact-coverage-reports/001-generated-service-time.md";
  const generatedImpactResolve = runNode([
    path.join(target, "scripts", "resolve-change-impact-coverage.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--out",
    generatedImpactReport,
  ]);
  if (generatedImpactResolve.status !== 0
    || !generatedImpactResolve.stdout.includes(generatedBusinessRuleRef)
    || !generatedImpactResolve.stdout.includes("Business rule state: READY_FOR_IMPACT_COVERAGE")
    || !generatedImpactResolve.stdout.includes("## Human Decisions Needed")
    || !generatedImpactResolve.stdout.includes("Codex derives technical surface coverage")
    || !generatedImpactResolve.stdout.includes("This report authorizes implementation: No")) {
    fail(`generated project must preserve unconfirmed Business Rule Closure in a non-authorizing impact report: ${generatedImpactResolve.stderr || generatedImpactResolve.stdout}`);
    return;
  }
  pass("generated project consumes saved Business Rule Closure and keeps impact analysis non-authorizing without technical user questions");

  const generatedVerificationReport = "verification-plans/001-generated-service-time.md";
  const generatedVerificationResolve = runNode([
    path.join(target, "scripts", "resolve-verification-plan.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--impact-ref",
    `artifact:${generatedImpactReport}`,
    "--project-level",
    "BL1",
    "--platform",
    "web,backend",
    "--out",
    generatedVerificationReport,
  ]);
  if (generatedVerificationResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedVerificationReport))
    || !generatedVerificationResolve.stdout.includes("Verification Plan")
    || !generatedVerificationResolve.stdout.includes("VERIFICATION_PLAN_READY")) {
    fail(`generated project verification plan resolver should write a source-bound report: ${generatedVerificationResolve.stderr || generatedVerificationResolve.stdout}`);
    return;
  }
  const generatedVerificationStrictCheck = runNode([
    path.join(target, "scripts", "check-verification-plan.mjs"),
    target,
    "--report",
    generatedVerificationReport,
    "--require-structured-evidence",
    "--require-business-rule-ref",
    "--require-impact-ref",
    "--strict-source-binding",
  ]);
  if (generatedVerificationStrictCheck.status !== 0
    && `${generatedVerificationStrictCheck.stdout}\n${generatedVerificationStrictCheck.stderr}`.includes("requires READY Business Rule Closure")) {
    pass("generated project Verification Plan stays blocked until Business Rule Closure is ready");
  } else if (generatedVerificationStrictCheck.status === 0
    && generatedVerificationStrictCheck.stdout.includes("Verification Plan check passed")) {
    pass("generated project strict Verification Plan source binding");
  } else {
    fail(`generated project Verification Plan must fail closed until Business Rule Closure is ready: ${generatedVerificationStrictCheck.stderr || generatedVerificationStrictCheck.stdout}`);
    return;
  }

  const generatedTestEvidenceReport = "test-evidence-reports/001-generated-service-time.md";
  const generatedExecutionAssuranceReport = "execution-assurance-reports/001-generated-service-time.md";
  const generatedCompletionReport = "completion-evidence-reports/001-generated-service-time.md";
  if (generatedVerificationStrictCheck.status === 0) {
  const generatedVerificationEvidence = extractMachineReadableEvidence(fs.readFileSync(path.join(target, generatedVerificationReport), "utf8"));
  if (!generatedVerificationEvidence?.ok) {
    fail("generated project Verification Plan should include machine-readable evidence for Test Evidence smoke");
    return;
  }
  const obligationsBySurface = new Map();
  for (const obligation of generatedVerificationEvidence.value.verification_obligations || []) {
    if (obligation.required !== "Yes") continue;
    const list = obligationsBySurface.get(obligation.source_surface) || [];
    list.push(obligation.id);
    obligationsBySurface.set(obligation.source_surface, list);
  }
  const generatedEvidenceDir = path.join(target, "evidence");
  fs.mkdirSync(generatedEvidenceDir, { recursive: true });
  const generatedEvidenceFiles = [
    ["user-flow.txt", "evidence:user-flow", "COMMAND_OUTPUT", "npm run test:user-flow -- generated-service-time", ["USER_FLOW"], "Generated user-flow smoke evidence."],
    ["frontend-ui.txt", "evidence:frontend-ui", "COMMAND_OUTPUT", "npm run test:ui -- generated-service-time", ["FRONTEND_UI", "ERROR_COPY"], "Generated frontend UI smoke evidence."],
    ["api-contract.txt", "evidence:api-contract", "COMMAND_OUTPUT", "npm run test:api -- generated-service-time", ["API_CONTRACT"], "Generated API contract smoke evidence."],
    ["backend-rule.txt", "evidence:backend-rule", "COMMAND_OUTPUT", "npm run test:domain -- generated-service-time", ["BACKEND_RULE"], "Generated backend rule smoke evidence."],
    ["handoff.txt", "evidence:handoff", "COMMAND_OUTPUT", "npm run docs:check -- generated-service-time", ["DOCS_HANDOFF", "TEST_COVERAGE"], "Generated handoff smoke evidence."],
  ];
  const generatedEvidenceRefs = [];
  for (const [fileName, evidenceId, type, command, surfaces, limitation] of generatedEvidenceFiles) {
    const covered = surfaces.flatMap((surface) => obligationsBySurface.get(surface) || []);
    if (covered.length === 0) continue;
    const relativeFile = `evidence/${fileName}`;
    fs.writeFileSync(path.join(target, relativeFile), [
      `id: ${evidenceId}`,
      `evidence_type: ${type}`,
      "result_state: PASSED",
      `command: ${command}`,
      "owner: generated-project-smoke",
      "environment: generated-local-ci",
      "ran_at: 2026-07-06T10:10:00Z",
      "exit_code: 0",
      "failure_reason: not recorded",
      "ran_after_change: Yes",
      "current_task_match: Yes",
      `covers_obligations: ${covered.join(", ")}`,
      `limitations: ${limitation}`,
      "",
      "PASS generated project task-bound evidence.",
      "",
    ].join("\n"));
    generatedEvidenceRefs.push(`artifact:${relativeFile}`);
  }
  const generatedTestEvidenceResolve = runNode([
    path.join(target, "scripts", "resolve-test-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--evidence",
    generatedEvidenceRefs.join(","),
    "--out",
    generatedTestEvidenceReport,
  ]);
  if (generatedTestEvidenceResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedTestEvidenceReport))
    || !generatedTestEvidenceResolve.stdout.includes("TEST_EVIDENCE_COMPLETE")
    || !generatedTestEvidenceResolve.stdout.includes("Exit Code")) {
    fail(`generated project Test Evidence resolver should write a source-bound report: ${generatedTestEvidenceResolve.stderr || generatedTestEvidenceResolve.stdout}`);
    return;
  }
  const generatedTestEvidenceStrictCheck = runNode([
    path.join(target, "scripts", "check-test-evidence.mjs"),
    target,
    "--report",
    generatedTestEvidenceReport,
    "--require-structured-evidence",
    "--require-verification-plan-ref",
    "--strict-source-binding",
    "--require-current-evidence",
    "--require-test-quality-controls",
  ]);
  if (generatedTestEvidenceStrictCheck.status !== 0
    || !generatedTestEvidenceStrictCheck.stdout.includes("Test Evidence check passed")
    || !generatedTestEvidenceStrictCheck.stdout.includes("test_evidence_ref points to this report")
    || !generatedTestEvidenceStrictCheck.stdout.includes("verification_plan_digest matches referenced Verification Plan")
    || !generatedTestEvidenceStrictCheck.stdout.includes("TEST_EVIDENCE_COMPLETE covers every required obligation")) {
    fail(`generated project Test Evidence strict source binding failed: ${generatedTestEvidenceStrictCheck.stderr || generatedTestEvidenceStrictCheck.stdout}`);
    return;
  }
  pass("generated project strict Test Evidence source binding");

  fs.mkdirSync(path.join(target, "execution-assurance-reports"), { recursive: true });
  fs.writeFileSync(path.join(target, generatedExecutionAssuranceReport), generatedExecutionAssuranceReportText({
    taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
    testEvidenceRef: `artifact:${generatedTestEvidenceReport}`,
    testEvidenceDigest: fileDigest(path.join(target, generatedTestEvidenceReport)),
  }));
  const generatedCompletionResolve = runNode([
    path.join(target, "scripts", "resolve-completion-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--test-evidence-ref",
    `artifact:${generatedTestEvidenceReport}`,
    "--execution-assurance-ref",
    `artifact:${generatedExecutionAssuranceReport}`,
    "--out",
    generatedCompletionReport,
  ]);
  if (generatedCompletionResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedCompletionReport))
    || !generatedCompletionResolve.stdout.includes("COMPLETION_EVIDENCE_READY")
    || !generatedCompletionResolve.stdout.includes("Can Claim Complete")) {
    fail(`generated project Completion Evidence resolver should write a source-bound report: ${generatedCompletionResolve.stderr || generatedCompletionResolve.stdout}`);
    return;
  }
  const generatedCompletionStrictCheck = runNode([
    path.join(target, "scripts", "check-completion-evidence.mjs"),
    target,
    "--report",
    generatedCompletionReport,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ]);
  if (generatedCompletionStrictCheck.status !== 0
    || !generatedCompletionStrictCheck.stdout.includes("Completion Evidence Gate check passed")
    || !generatedCompletionStrictCheck.stdout.includes("completion_evidence_ref points to this report")
    || !generatedCompletionStrictCheck.stdout.includes("ready gate can claim complete")
    || !generatedCompletionStrictCheck.stdout.includes("source execution_assurance outcome matches referenced evidence")) {
    fail(`generated project Completion Evidence strict source binding failed: ${generatedCompletionStrictCheck.stderr || generatedCompletionStrictCheck.stdout}`);
    return;
  }
  pass("generated project strict Completion Evidence source binding");
  const generatedStatusReport = "delivery-status-cards/001-generated-status.md";
  const generatedStatusResolve = runNode([
    path.join(target, "scripts", "resolve-user-delivery-console.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--out",
    generatedStatusReport,
  ]);
  if (generatedStatusResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedStatusReport))
    || !generatedStatusResolve.stdout.includes("Passed for this request")
    || !generatedStatusResolve.stdout.includes("Can the current task be treated as done? | Yes")) {
    fail(`generated project User Delivery Console should write a current-task matched status card: ${generatedStatusResolve.stderr || generatedStatusResolve.stdout}`);
    return;
  }
  const generatedStatusCheck = runNode([
    path.join(target, "scripts", "check-user-delivery-console.mjs"),
    target,
  ]);
  if (generatedStatusCheck.status !== 0 || !generatedStatusCheck.stdout.includes("User Delivery Console check passed")) {
    fail(`generated project User Delivery Console same-card check failed: ${generatedStatusCheck.stderr || generatedStatusCheck.stdout}`);
    return;
  }
  pass("generated project User Delivery Console same-card status check");
  fs.rmSync(path.join(target, generatedExecutionAssuranceReport), { force: true });
  fs.rmSync(path.join(target, generatedCompletionReport), { force: true });
  }

  const emptyGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (emptyGoalModeCheck.status !== 0 || !emptyGoalModeCheck.stdout.includes("Goal Mode check skipped")) {
    fail(`generated project empty Goal Mode check should pass by skipping: ${emptyGoalModeCheck.stderr || emptyGoalModeCheck.stdout}`);
    return;
  }
  pass("generated project empty Goal Mode check skips");

  const emptySubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (emptySubagentCheck.status !== 0 || !emptySubagentCheck.stdout.includes("Subagent Orchestration check skipped")) {
    fail(`generated project empty Subagent Orchestration check should pass by skipping: ${emptySubagentCheck.stderr || emptySubagentCheck.stdout}`);
    return;
  }
  pass("generated project empty Subagent Orchestration check skips");

  const engineeringBaselineCheck = runNode([
    path.join(target, "scripts", "check-engineering-baseline.mjs"),
    target,
  ]);
  if (engineeringBaselineCheck.status !== 0 || !engineeringBaselineCheck.stdout.includes("PENDING")) {
    fail(`generated project engineering baseline check should be pending before human confirmation: ${engineeringBaselineCheck.stderr || engineeringBaselineCheck.stdout}`);
    return;
  }
  pass("generated project engineering baseline check is advisory pending");

  const productBaselineCheck = runNode([
    path.join(target, "scripts", "check-product-baseline.mjs"),
    target,
  ]);
  if (productBaselineCheck.status !== 0 || !productBaselineCheck.stdout.includes("Product baseline check passed")) {
    fail(`generated project product baseline check failed: ${productBaselineCheck.stderr || productBaselineCheck.stdout}`);
    return;
  }
  pass("generated project product baseline check");

  const claimControlCheck = runNode([
    path.join(target, "scripts", "check-claim-control.mjs"),
    target,
  ]);
  if (claimControlCheck.status !== 0 || !claimControlCheck.stdout.includes("Claim control check passed")) {
    fail(`generated project claim control check failed: ${claimControlCheck.stderr || claimControlCheck.stdout}`);
    return;
  }
  pass("generated project claim control check");

  const contextGovernanceCheck = runNode([
    path.join(target, "scripts", "check-context-governance.mjs"),
    target,
  ]);
  if (contextGovernanceCheck.status !== 0 || !contextGovernanceCheck.stdout.includes("Context governance check passed")) {
    fail(`generated project context governance check failed: ${contextGovernanceCheck.stderr || contextGovernanceCheck.stdout}`);
    return;
  }
  pass("generated project context governance check");

  const launchReadinessCheck = runNode([
    path.join(target, "scripts", "check-launch-readiness.mjs"),
    target,
  ]);
  if (launchReadinessCheck.status !== 0 || !launchReadinessCheck.stdout.includes("Launch readiness check passed")) {
    fail(`generated project launch readiness check failed: ${launchReadinessCheck.stderr || launchReadinessCheck.stdout}`);
    return;
  }
  pass("generated project launch readiness check");

  const conversationDriftCheck = runNode([
    path.join(target, "scripts", "check-conversation-drift.mjs"),
    target,
  ]);
  if (conversationDriftCheck.status !== 0 || !conversationDriftCheck.stdout.includes("Conversation drift check passed")) {
    fail(`generated project conversation drift check failed: ${conversationDriftCheck.stderr || conversationDriftCheck.stdout}`);
    return;
  }
  pass("generated project conversation drift check");

  const guidedDeliveryCheck = runNode([
    path.join(target, "scripts", "check-guided-delivery-loop.mjs"),
    target,
  ]);
  if (guidedDeliveryCheck.status !== 0 || !guidedDeliveryCheck.stdout.includes("Guided delivery loop check passed")) {
    fail(`generated project guided delivery loop check failed: ${guidedDeliveryCheck.stderr || guidedDeliveryCheck.stdout}`);
    return;
  }
  pass("generated project guided delivery loop check");

  const changeBoundaryCheck = runNode([
    path.join(target, "scripts", "check-change-boundary.mjs"),
    target,
  ]);
  if (changeBoundaryCheck.status !== 0 || !changeBoundaryCheck.stdout.includes("Change boundary check passed")) {
    fail(`generated project change boundary check failed: ${changeBoundaryCheck.stderr || changeBoundaryCheck.stdout}`);
    return;
  }
  pass("generated project change boundary check");

  const baselineStateCheck = runNode([
    path.join(target, "scripts", "check-baseline-state.mjs"),
    target,
  ]);
  if (baselineStateCheck.status !== 0 || !baselineStateCheck.stdout.includes("Baseline state check passed")) {
    fail(`generated project baseline state check failed: ${baselineStateCheck.stderr || baselineStateCheck.stdout}`);
    return;
  }
  pass("generated project baseline state check");

  const firstDeliveryCheck = runNode([
    path.join(target, "scripts", "check-first-delivery-walkthrough.mjs"),
    target,
  ]);
  if (firstDeliveryCheck.status !== 0 || !firstDeliveryCheck.stdout.includes("First delivery walkthrough check passed")) {
    fail(`generated project first delivery walkthrough check failed: ${firstDeliveryCheck.stderr || firstDeliveryCheck.stdout}`);
    return;
  }
  pass("generated project first delivery walkthrough check");

  if (fs.existsSync(path.join(target, ".intentos", "industrial-packs", "web-app", "pack.json"))) {
    fail("generated project default bootstrap should not install concrete web-app industrial pack");
    return;
  }
  pass("generated project default bootstrap keeps industrial packs lightweight");

  const industrialPackCheck = runNode([
    path.join(target, "scripts", "check-industrial-pack.mjs"),
    target,
    "--selected-only",
  ]);
  if (industrialPackCheck.status !== 0 || !industrialPackCheck.stdout.includes("Selected-only mode: no selected packs")) {
    fail(`generated project selected industrial pack check failed: ${industrialPackCheck.stderr || industrialPackCheck.stdout}`);
    return;
  }
  pass("generated project selected industrial pack check");

  const industrialBaselinePending = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--bl2-only",
  ]);
  if (industrialBaselinePending.status !== 0 || !industrialBaselinePending.stdout.includes("BL2 industrial baseline is not active")) {
    fail(`generated project industrial baseline check should skip before BL2 selection: ${industrialBaselinePending.stderr || industrialBaselinePending.stdout}`);
    return;
  }
  pass("generated project industrial baseline check skips before BL2 selection");

  const platformBaselinePending = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselinePending.status !== 0 || !platformBaselinePending.stdout.includes("PENDING")) {
    fail(`generated project platform baseline check should be pending before profile selection: ${platformBaselinePending.stderr || platformBaselinePending.stdout}`);
    return;
  }
  pass("generated project platform baseline check is pending before profile selection");

  const projectProfilePath = path.join(target, "docs", "project-profile.md");
  const projectProfileContent = fs.readFileSync(projectProfilePath, "utf8")
    .replace(/## Selected Profiles\n\n[\s\S]*?\n## Profile Rationale/, "## Selected Profiles\n\n- web-app\n\n## Profile Rationale")
    .replace("|  |  | Yes / No |", "| web-app | browser-based UI | Yes |");
  fs.writeFileSync(projectProfilePath, projectProfileContent);

  const platformBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselineResolved.status !== 0 || !platformBaselineResolved.stdout.includes("PLATFORM_BASELINE_STATE: BASELINE_READY")) {
    fail(`generated project platform baseline resolver failed after profile selection: ${platformBaselineResolved.stderr || platformBaselineResolved.stdout}`);
    return;
  }
  pass("generated project platform baseline resolver handles selected profile");

  const platformBaselineCheck = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
  ]);
  if (platformBaselineCheck.status !== 0 || !platformBaselineCheck.stdout.includes("selected profiles: web-app")) {
    fail(`generated project platform baseline check failed after profile selection: ${platformBaselineCheck.stderr || platformBaselineCheck.stdout}`);
    return;
  }
  pass("generated project platform baseline check handles selected profile");

  const platformBaselineJson = runNode([
    path.join(target, "scripts", "check-platform-baseline.mjs"),
    target,
    "--json",
  ]);
  if (platformBaselineJson.status !== 0) {
    fail(`generated project platform baseline JSON check failed: ${platformBaselineJson.stderr || platformBaselineJson.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(platformBaselineJson.stdout);
    if (parsed.checkStatus !== "PENDING" && parsed.checkStatus !== "PASS") {
      fail(`generated project platform baseline JSON has unexpected status: ${parsed.checkStatus}`);
      return;
    }
    if (!parsed.effectiveRiskGateMappings?.permission || !parsed.effectiveAiBoundaries?.mustNot?.length) {
      fail("generated project platform baseline JSON missing effective risk mappings or AI boundaries");
      return;
    }
  } catch (error) {
    fail(`generated project platform baseline JSON output is not parseable: ${error.message}`);
    return;
  }
  pass("generated project platform baseline JSON is machine-readable");

  fs.copyFileSync(
    path.join(target, ".intentos", "templates", "baseline-selection.md"),
    path.join(target, "docs", "baseline-selection.md"),
  );
  fs.copyFileSync(
    path.join(target, ".intentos", "templates", "baseline-evidence.md"),
    path.join(target, "docs", "baseline-evidence.md"),
  );
  const baselineSelectionPath = path.join(target, "docs", "baseline-selection.md");
  const baselineSelectionContent = fs.readFileSync(baselineSelectionPath, "utf8")
    .replace("BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL:", "BL2_INDUSTRIAL:")
    .replace("- <profile-id>", "- web-app")
    .replace("- <standard-pack-id>", "- environment-standard\n- web-runtime-standard")
    .replace("- <industrial-pack-id>", "- web-app-industrial")
    .replace("Status: PENDING / APPROVED / REJECTED", "Status: APPROVED")
    .replace("|  |  | Yes / No |", "| web-app-industrial | production-grade web delivery | Yes |")
    .replace("|  |  |  |  |  | Yes / No |", "| none | none | none | owner | 2026-06-25 | Yes |")
    .replace("|  |  |  |  |  | Yes / No |", "| none | none | none | owner | 2026-06-25 | Yes |");
  fs.writeFileSync(baselineSelectionPath, baselineSelectionContent);

  const selectedPackMissingCheck = runNode([
    path.join(target, "scripts", "check-industrial-pack.mjs"),
    target,
    "--selected-only",
  ]);
  const selectedPackMissingOutput = `${selectedPackMissingCheck.stderr}\n${selectedPackMissingCheck.stdout}`;
  if (selectedPackMissingCheck.status === 0
    || !selectedPackMissingOutput.includes("missing pack.md")
    || !selectedPackMissingOutput.includes("--update-workflow-assets")
    || !selectedPackMissingOutput.includes("--industrial-packs web-app-industrial")
    || !selectedPackMissingOutput.includes("--write-plan")) {
    fail(`generated project selected industrial pack check should reject missing selected pack: ${selectedPackMissingCheck.stderr || selectedPackMissingCheck.stdout}`);
    return;
  }
  pass("generated project selected industrial pack check rejects missing selected pack with repair hint");

  const selectedPackMissingBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--bl2-only",
  ]);
  const selectedPackMissingBaselineOutput = `${selectedPackMissingBaselineCheck.stderr}\n${selectedPackMissingBaselineCheck.stdout}`;
  if (selectedPackMissingBaselineCheck.status === 0
    || !selectedPackMissingBaselineOutput.includes("selected industrial pack is invalid: web-app-industrial")
    || !selectedPackMissingBaselineOutput.includes("--update-workflow-assets")
    || !selectedPackMissingBaselineOutput.includes("--industrial-packs web-app-industrial")
    || !selectedPackMissingBaselineOutput.includes("--write-plan")) {
    fail(`generated project industrial baseline check should reject missing selected pack with repair hint: ${selectedPackMissingBaselineCheck.stderr || selectedPackMissingBaselineCheck.stdout}`);
    return;
  }
  pass("generated project industrial baseline check rejects missing selected pack with repair hint");

  const selectedPackPlanPath = path.join(target, "apply-execution-plans", "selected-industrial-pack-plan.json");
  const planSelectedPack = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
    "--industrial-packs",
    "web-app-industrial",
    "--write-plan",
    path.relative(target, selectedPackPlanPath),
  ]);
  if (planSelectedPack.status !== 0 || !fs.existsSync(selectedPackPlanPath)) {
    fail(`generated project selected industrial pack plan failed: ${planSelectedPack.stderr || planSelectedPack.stdout}`);
    return;
  }
  const selectedPackPlan = JSON.parse(fs.readFileSync(selectedPackPlanPath, "utf8"));
  const selectedPackActions = selectedPackPlan.actions.filter((action) => action.path.startsWith(".intentos/industrial-packs/web-app/"));
  if (selectedPackActions.length === 0 || selectedPackActions.some((action) => action.willWrite !== true || action.executionSupported !== true || action.type === "HUMAN_ONLY")) {
    fail("generated project selected industrial pack plan must bind exact pack assets to the controlled action graph");
    return;
  }
  pass("generated project selected industrial pack plan binds exact approved pack assets");
  fs.cpSync(
    path.join(kitRoot, "industrial-packs", "web-app"),
    path.join(target, ".intentos", "industrial-packs", "web-app"),
    { recursive: true },
  );
  pass("generated project BL2 fixture simulates owner-installed selected industrial pack");

  const baselineEvidencePath = path.join(target, "docs", "baseline-evidence.md");
  const evidenceRecordPath = path.join(target, "releases", "generated-bl2-evidence.md");
  fs.writeFileSync(evidenceRecordPath, [
    "# Generated BL2 Evidence",
    "",
    "This generated file is used by the intentos self-check to prove that structured baseline evidence refs are validated.",
    "",
  ].join("\n"));
  const evidenceRows = [
    "loading-empty-error-forbidden evidence",
    "success and layout stability evidence",
    "responsive behavior evidence",
    "critical flow behavior evidence",
    "form submission validation and duplicate-submit evidence",
    "destructive action and recovery evidence",
    "API failure and recovery evidence",
    "auth and validation error behavior evidence",
    "keyboard focus and accessible name evidence",
    "status message and contrast evidence",
    "bundle asset and loading impact evidence",
    "interaction responsiveness evidence",
    "server-side permission test evidence",
    "forbidden state evidence",
    "resource scope evidence",
    "release record",
    "rollback plan",
    "monitoring evidence",
    "environment variable review",
    "secret exposure review",
    "deployment configuration evidence",
    "dependency rationale and vulnerability review",
    "client bundle impact review",
  ].map((requirement) => `| ${requirement} | doc | releases/generated-bl2-evidence.md | Done |  | self-check | 2026-06-25 |`);
  const baselineEvidenceContent = [
    "# Baseline Evidence",
    "",
    "## Status",
    "",
    "Draft status: CONFIRMED",
    "",
    "Human decision status: CONFIRMED",
    "",
    "## Evidence Index",
    "",
    "| Requirement | Evidence Type | Evidence Ref | Status | Reason if skipped | Owner | Review date |",
    "|---|---|---|---|---|---|---|",
    ...evidenceRows,
    "",
    "## Production Readiness",
    "",
    "Status: PASS",
    "",
    "Evidence:",
    "",
    "- releases/generated-bl2-evidence.md",
    "",
    "## Release Readiness",
    "",
    "Status: PASS",
    "",
    "Evidence:",
    "",
    "- releases/generated-bl2-evidence.md",
    "",
    "## Security Readiness",
    "",
    "Status: PASS",
    "",
    "Evidence:",
    "",
    "- releases/generated-bl2-evidence.md",
    "",
    "## Privacy Readiness",
    "",
    "Status: NOT_APPLICABLE",
    "",
    "Evidence:",
    "",
    "- Not applicable to generated self-check fixture.",
    "",
    "## Recovery Readiness",
    "",
    "Status: PASS",
    "",
    "Evidence:",
    "",
    "- releases/generated-bl2-evidence.md",
    "",
    "## Exceptions",
    "",
    "| Requirement | Exception | Reason | Owner | Review date |",
    "|---|---|---|---|---|",
    "| none | none | none | self-check | 2026-06-25 |",
    "",
    "## Residual Risks",
    "",
    "| Risk | Impact | Mitigation | Owner | Accepted |",
    "|---|---|---|---|---|",
    "| none | none | none | self-check | Yes |",
    "",
  ].join("\n");
  fs.writeFileSync(baselineEvidencePath, baselineEvidenceContent);

  const invalidBaselineEvidenceContent = baselineEvidenceContent.replace(
    "releases/generated-bl2-evidence.md | Done",
    "releases/missing-bl2-evidence.md | Done",
  );
  fs.writeFileSync(baselineEvidencePath, invalidBaselineEvidenceContent);
  const invalidIndustrialBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--strict",
  ]);
  if (invalidIndustrialBaselineCheck.status === 0 || !invalidIndustrialBaselineCheck.stderr.includes("missing evidence ref")) {
    fail(`generated project industrial baseline strict check should reject missing evidence refs: ${invalidIndustrialBaselineCheck.stderr || invalidIndustrialBaselineCheck.stdout}`);
    return;
  }
  const invalidIndustrialBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-industrial-baseline.mjs"),
    target,
    "--json",
  ]);
  if (invalidIndustrialBaselineResolved.status !== 0) {
    fail(`generated project industrial baseline resolver failed for invalid evidence refs: ${invalidIndustrialBaselineResolved.stderr || invalidIndustrialBaselineResolved.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(invalidIndustrialBaselineResolved.stdout);
    if (parsed.state !== "EVIDENCE_MISSING") {
      fail(`generated project industrial baseline resolver should mark invalid evidence refs as EVIDENCE_MISSING, got ${parsed.state}`);
      return;
    }
  } catch (error) {
    fail(`generated project invalid industrial baseline JSON output is not parseable: ${error.message}`);
    return;
  }
  pass("generated project industrial baseline rejects missing evidence refs");
  fs.writeFileSync(baselineEvidencePath, baselineEvidenceContent);

  const industrialBaselineResolved = runNode([
    path.join(target, "scripts", "resolve-industrial-baseline.mjs"),
    target,
  ]);
  if (industrialBaselineResolved.status !== 0 || !industrialBaselineResolved.stdout.includes("INDUSTRIAL_BASELINE_STATE: BASELINE_READY")) {
    fail(`generated project industrial baseline resolver failed after BL2 selection: ${industrialBaselineResolved.stderr || industrialBaselineResolved.stdout}`);
    return;
  }
  pass("generated project industrial baseline resolver handles BL2 selection");

  const industrialBaselineCheck = runNode([
    path.join(target, "scripts", "check-industrial-baseline.mjs"),
    target,
    "--strict",
  ]);
  if (industrialBaselineCheck.status !== 0 || !industrialBaselineCheck.stdout.includes("Industrial baseline is ready")) {
    fail(`generated project industrial baseline strict check failed after BL2 selection: ${industrialBaselineCheck.stderr || industrialBaselineCheck.stdout}`);
    return;
  }
  pass("generated project industrial baseline strict check handles BL2 selection");

  const governedExistingTarget = path.join(tempRoot, "governed-existing-project");
  fs.mkdirSync(path.join(governedExistingTarget, ".github", "workflows"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "scripts", "guard"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "docs", "baselines"), { recursive: true });
  fs.mkdirSync(path.join(governedExistingTarget, "docs", "evidence"), { recursive: true });
  fs.writeFileSync(path.join(governedExistingTarget, "package.json"), JSON.stringify({ name: "governed-existing-project", private: true }, null, 2));
  fs.writeFileSync(path.join(governedExistingTarget, "agent.md"), "# Existing Agent Rules\n");
  fs.writeFileSync(path.join(governedExistingTarget, ".github", "workflows", "quality.yml"), "name: quality\n");
  fs.writeFileSync(path.join(governedExistingTarget, ".github", "workflows", "release-promotion.yml"), "name: release-promotion\n");
  fs.writeFileSync(path.join(governedExistingTarget, "scripts", "guard", "check-quality.js"), "console.log('ok');\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "baselines", "web-baseline.md"), "# Existing Web Baseline\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "WEB_RELEASE_ROLLBACK_BASELINE.md"), "# Existing Release Baseline\n");
  fs.writeFileSync(path.join(governedExistingTarget, "docs", "evidence", ".gitkeep"), "");

  const governedNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    governedExistingTarget,
  ]);
  if (governedNext.status !== 0
    || !governedNext.stdout.includes("NEXT_ACTION: RUN_ADOPTION_ASSESSMENT")
    || !governedNext.stdout.includes("ADOPTION_MODE: READ_ONLY")
    || !governedNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !governedNext.stdout.includes("GOVERNED_EXISTING_PROJECT")
    || !governedNext.stdout.includes("PRODUCTION_GOVERNED_PROJECT")) {
    fail(`governed existing project should require read-only adoption assessment: ${governedNext.stderr || governedNext.stdout}`);
    return;
  }
  pass("governed existing project workflow-next requires read-only adoption assessment");

  const governedDoctor = runNode([
    path.join(kitRoot, "scripts", "cli.mjs"),
    "doctor",
    governedExistingTarget,
  ]);
  if (governedDoctor.status !== 0
    || !governedDoctor.stdout.includes("Doctor old-project mode: skipped full workflow asset checks.")
    || !governedDoctor.stdout.includes("Next safe step: run native-migration and reconcile-rules --auto-native")
    || governedDoctor.stdout.includes("FAIL missing")) {
    fail(`governed existing project doctor should stop at old-project diagnosis without asset flood: ${governedDoctor.stderr || governedDoctor.stdout}`);
    return;
  }
  pass("governed existing project doctor avoids missing-asset flood");

  const governedReconcileAuto = runNode([
    path.join(kitRoot, "scripts", "cli.mjs"),
    "reconcile-rules",
    governedExistingTarget,
    "--auto-native",
  ]);
  if (governedReconcileAuto.status !== 0
    || !governedReconcileAuto.stdout.includes("IntentOS Adoption Recommendation")
    || !governedReconcileAuto.stdout.includes("generated:native-migration")
    || !governedReconcileAuto.stdout.includes("SELECTED_NATIVE_ADOPTION")
    || fs.existsSync(path.join(governedExistingTarget, "native-migration-plans"))) {
    fail(`governed existing project reconcile-rules --auto-native should produce read-only native adoption decision: ${governedReconcileAuto.stderr || governedReconcileAuto.stdout}`);
    return;
  }
  pass("governed existing project reconcile-rules --auto-native produces read-only native adoption decision");

  const truncatedRuleTarget = path.join(tempRoot, "truncated-rule-project");
  fs.mkdirSync(path.join(truncatedRuleTarget, "native-migration-plans"), { recursive: true });
  const truncatedRules = Array.from({ length: 21 }, (_, index) => ({
    rule_id: `R-${String(index + 1).padStart(3, "0")}`,
    rule_class: "ENGINEERING_BASELINE",
    source_excerpt: `Project enum rule ${index + 1}`,
    authority: "project baseline",
    risk_surfaces: ["engineering"],
  }));
  fs.writeFileSync(path.join(truncatedRuleTarget, "native-migration-plans", "001-many-rules.md"), [
    "# Native Migration Plan",
    "",
    "```json",
    JSON.stringify({
      schema_version: "1.62.0",
      artifact_type: "native_migration_plan",
      project_state: "EXISTING_GOVERNED_PROJECT",
      rule_classifications: truncatedRules,
    }, null, 2),
    "```",
    "",
  ].join("\n"));
  const truncatedReconcile = runNode([
    path.join(kitRoot, "scripts", "resolve-existing-rule-reconciliation.mjs"),
    truncatedRuleTarget,
    "--json",
  ]);
  if (truncatedReconcile.status !== 0) {
    fail(`truncated existing rule reconciliation should resolve: ${truncatedReconcile.stderr || truncatedReconcile.stdout}`);
    return;
  }
  try {
    const parsed = JSON.parse(truncatedReconcile.stdout);
    if (parsed.ruleReconciliationCoverage?.omittedRules === 1
      && parsed.ruleReconciliationCoverage?.blocksSelectedNativeAdoption === "Yes"
      && parsed.nativeAdoptionDecision?.recommendation === "BLOCKED_NEEDS_OWNER"
      && parsed.canRecommendApplyPlan === "NoUntilBlockResolved"
      && parsed.canRecommendApplyPlanNow === "No"
      && parsed.outcome === "BLOCKED") {
      pass("truncated existing rule reconciliation blocks selected native adoption");
    } else {
      fail(`truncated existing rule reconciliation missing block evidence: ${truncatedReconcile.stdout}`);
      return;
    }
  } catch (error) {
    fail(`truncated existing rule reconciliation JSON invalid: ${error.message}`);
    return;
  }

  const dirtyReadyTarget = path.join(tempRoot, "dirty-ready-production-project");
  const dirtyReadyInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dirtyReadyTarget,
  ]);
  if (dirtyReadyInit.status !== 0) {
    fail(`dirty ready production project init failed: ${dirtyReadyInit.stderr || dirtyReadyInit.stdout}`);
    return;
  }
  const onboardingDocsToConfirm = [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
  ];
  for (const relPath of onboardingDocsToConfirm) {
    const fullPath = path.join(dirtyReadyTarget, relPath);
    let content = fs.readFileSync(fullPath, "utf8")
      .replace(/<[^>\n]+>/g, "confirmed")
      .replace(/PENDING_CONFIRMATION|PENDING|TBD|TODO|NOT_READY/g, "CONFIRMED");
    if (relPath === "docs/project-profile.md") {
      content = content.replace(/## Selected Profiles\n\n[\s\S]*?\n## Profile Rationale/, "## Selected Profiles\n\n- web-app\n\n## Profile Rationale");
    }
    fs.writeFileSync(fullPath, content);
  }
  fs.mkdirSync(path.join(dirtyReadyTarget, ".github", "workflows"), { recursive: true });
  fs.writeFileSync(path.join(dirtyReadyTarget, ".github", "workflows", "release.yml"), "name: release\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "requests", "001-ready-task.md"), "# Request: ready-task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "specs", "001-ready-task.md"), "# Spec 001: ready task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "evals", "001-ready-task.md"), "# Eval: ready task\n");
  fs.writeFileSync(path.join(dirtyReadyTarget, "tasks", "001-ready-task.md"), "# Task 001: ready task\n");
  spawnSync("git", ["init"], { cwd: dirtyReadyTarget, encoding: "utf8" });
  const dirtyReadyNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    dirtyReadyTarget,
  ]);
  if (dirtyReadyNext.status !== 0
    || !dirtyReadyNext.stdout.includes("NEXT_ACTION: REVIEW_DIRTY_WORKTREE")
    || !dirtyReadyNext.stdout.includes("ADOPTION_MODE: GUARDED")
    || !dirtyReadyNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !dirtyReadyNext.stdout.includes("MUST_STOP_FOR_HUMAN: yes")
    || !dirtyReadyNext.stdout.includes("PRODUCTION_GOVERNED_PROJECT")
    || !dirtyReadyNext.stdout.includes("DIRTY_WORKTREE_PROJECT")) {
    fail(`dirty ready project should stop before task execution: ${dirtyReadyNext.stderr || dirtyReadyNext.stdout}`);
    return;
  }
  pass("dirty ready project workflow-next stops before task execution");

  const dirtyUpdateTarget = path.join(tempRoot, "dirty-workflow-update-project");
  const dirtyUpdateInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dirtyUpdateTarget,
  ]);
  if (dirtyUpdateInit.status !== 0) {
    fail(`dirty workflow update project init failed: ${dirtyUpdateInit.stderr || dirtyUpdateInit.stdout}`);
    return;
  }
  fs.rmSync(path.join(dirtyUpdateTarget, "scripts", "check-ai-workflow.mjs"), { force: true });
  spawnSync("git", ["init"], { cwd: dirtyUpdateTarget, encoding: "utf8" });
  const dirtyUpdateNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    dirtyUpdateTarget,
  ]);
  if (dirtyUpdateNext.status !== 0
    || !dirtyUpdateNext.stdout.includes("NEXT_ACTION: REVIEW_DIRTY_WORKTREE")
    || !dirtyUpdateNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !dirtyUpdateNext.stdout.includes("MUST_STOP_FOR_HUMAN: yes")
    || !dirtyUpdateNext.stdout.includes("DIRTY_WORKTREE_PROJECT")) {
    fail(`dirty workflow update project should stop before recommending update: ${dirtyUpdateNext.stderr || dirtyUpdateNext.stdout}`);
    return;
  }
  pass("dirty workflow update project stops before workflow asset update");

  const partialExistingTarget = path.join(tempRoot, "partial-existing-project");
  fs.mkdirSync(path.join(partialExistingTarget, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(partialExistingTarget, "package.json"), JSON.stringify({ name: "partial-existing-project", private: true }, null, 2));
  const partialExistingNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    partialExistingTarget,
  ]);
  if (partialExistingNext.status !== 0
    || !partialExistingNext.stdout.includes("NEXT_ACTION: RUN_WORKFLOW_ASSET_UPDATE")
    || !partialExistingNext.stdout.includes("--update-workflow-assets --write-plan apply-execution-plans/intentos-workflow-update-plan.json")) {
    fail(`partial existing workflow update should recommend plan-first command: ${partialExistingNext.stderr || partialExistingNext.stdout}`);
    return;
  }
  pass("partial existing project workflow-next recommends plan-first workflow update");

  const onboardingO0Check = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
    "--level",
    "O0",
  ]);
  if (onboardingO0Check.status !== 0) {
    fail(`generated project O0 onboarding check failed: ${onboardingO0Check.stderr || onboardingO0Check.stdout}`);
    return;
  }
  pass("generated project O0 onboarding check");

  const onboardingO2Check = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
    "--level",
    "O2",
  ]);
  if (onboardingO2Check.status !== 0) {
    fail(`generated project O2 onboarding check failed: ${onboardingO2Check.stderr || onboardingO2Check.stdout}`);
    return;
  }
  pass("generated project O2 onboarding check");

  const workflowNextEnforcePending = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
    "--enforce",
  ]);
  if (workflowNextEnforcePending.status === 0 || !workflowNextEnforcePending.stdout.includes("project onboarding is not ready")) {
    fail(`generated project workflow-next enforce should fail while onboarding is pending: ${workflowNextEnforcePending.stderr || workflowNextEnforcePending.stdout}`);
    return;
  }
  pass("generated project workflow-next enforce fails while onboarding is pending");

  const dailySummaryCheck = runNode([
    path.join(target, "scripts", "workflow-daily-summary.mjs"),
    target,
    "--write-state",
  ]);
  if (dailySummaryCheck.status !== 0) {
    fail(`generated project workflow daily summary failed: ${dailySummaryCheck.stderr || dailySummaryCheck.stdout}`);
    return;
  }
  pass("generated project workflow daily summary");

  const emptyArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (emptyArtifactCheck.status !== 0) {
    fail(`generated project empty workflow artifact check failed: ${emptyArtifactCheck.stderr || emptyArtifactCheck.stdout}`);
    return;
  }
  pass("generated project empty workflow artifact check");

  const generatedRequest = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "request",
    "--name",
    "generated-check",
  ]);
  if (generatedRequest.status !== 0) {
    fail(`generated project new workflow item failed: ${generatedRequest.stderr || generatedRequest.stdout}`);
    return;
  }
  if (!fs.existsSync(path.join(target, "requests", "001-generated-check.md"))) {
    fail("generated project new workflow item did not create request");
    return;
  }
  const generatedRequestPath = path.join(target, "requests", "001-generated-check.md");
  const generatedRequestContent = fs.readFileSync(generatedRequestPath, "utf8");
  if (!generatedRequestContent.startsWith("---\n") || !generatedRequestContent.includes("artifact_type: request")) {
    fail("generated project new workflow item did not add request frontmatter");
    return;
  }
  pass("generated project new workflow item creates request");

  const legacyRequestContent = generatedRequestContent.replace(/^---\n[\s\S]*?\n---\n/, "");
  fs.writeFileSync(generatedRequestPath, legacyRequestContent);
  const legacyFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (legacyFrontmatterCheck.status !== 0 || !legacyFrontmatterCheck.stdout.includes("missing artifact frontmatter")) {
    fail(`generated project workflow artifact check should warn for legacy artifact frontmatter: ${legacyFrontmatterCheck.stderr || legacyFrontmatterCheck.stdout}`);
    return;
  }
  const strictLegacyFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
    "--strict-schema",
  ]);
  if (strictLegacyFrontmatterCheck.status === 0 || !strictLegacyFrontmatterCheck.stderr.includes("missing artifact frontmatter")) {
    fail(`generated project strict schema check should reject legacy artifact frontmatter: ${strictLegacyFrontmatterCheck.stderr || strictLegacyFrontmatterCheck.stdout}`);
    return;
  }
  fs.writeFileSync(generatedRequestPath, generatedRequestContent);
  pass("generated project workflow artifact check warns for legacy frontmatter and strict mode rejects it");

  const invalidGeneratedRequestContent = generatedRequestContent.replace("artifact_type: request\n", "");
  fs.writeFileSync(generatedRequestPath, invalidGeneratedRequestContent);
  const invalidFrontmatterCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (invalidFrontmatterCheck.status === 0 || !invalidFrontmatterCheck.stderr.includes("missing required frontmatter field: artifact_type")) {
    fail(`generated project workflow artifact check should reject invalid frontmatter: ${invalidFrontmatterCheck.stderr || invalidFrontmatterCheck.stdout}`);
    return;
  }
  fs.writeFileSync(generatedRequestPath, generatedRequestContent);
  pass("generated project workflow artifact check rejects invalid frontmatter");

  const generatedAdoptionAssessment = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "adoption-assessment",
    "--name",
    "governed-existing-project",
  ]);
  if (generatedAdoptionAssessment.status !== 0
    || !fs.existsSync(path.join(target, ".intentos", "adoption", "001-governed-existing-project.md"))) {
    fail(`generated project adoption assessment item failed: ${generatedAdoptionAssessment.stderr || generatedAdoptionAssessment.stdout}`);
    return;
  }
  pass("generated project new workflow item creates adoption assessment");

  const generatedGovernanceMap = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "governance-map",
    "--name",
    "governed-existing-project",
  ]);
  if (generatedGovernanceMap.status !== 0
    || !fs.existsSync(path.join(target, ".intentos", "adoption", "002-governed-existing-project.md"))) {
    fail(`generated project governance map item failed: ${generatedGovernanceMap.stderr || generatedGovernanceMap.stdout}`);
    return;
  }
  pass("generated project new workflow item creates governance map");

  const draftArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "draft",
  ]);
  if (draftArtifactCheck.status !== 0) {
    fail(`generated project draft workflow artifact check failed: ${draftArtifactCheck.stderr || draftArtifactCheck.stdout}`);
    return;
  }
  pass("generated project draft workflow artifact check tolerates placeholders");

  const readyPlaceholderCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
  ]);
  if (readyPlaceholderCheck.status === 0 || !readyPlaceholderCheck.stderr.includes("placeholder")) {
    fail(`generated project ready workflow artifact check should reject placeholders: ${readyPlaceholderCheck.stderr || readyPlaceholderCheck.stdout}`);
    return;
  }
  pass("generated project ready workflow artifact check rejects placeholders");

  const unknownArtifactOption = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--unknown-option",
  ]);
  if (unknownArtifactOption.status === 0 || !unknownArtifactOption.stderr.includes("unknown option")) {
    fail(`generated project workflow artifact check should reject unknown options: ${unknownArtifactOption.stderr || unknownArtifactOption.stdout}`);
    return;
  }
  pass("generated project workflow artifact check rejects unknown options");

  fs.unlinkSync(path.join(target, "requests", "001-generated-check.md"));

  const exampleCopies = [
    ["examples/web-internal-admin-first-slice/request-card.md", "requests/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/preflight-report.md", "preflight/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/spec.md", "specs/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/eval.md", "evals/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/task-card.md", "tasks/001-admin-work-item-list.md"],
    ["examples/web-internal-admin-first-slice/ai-task-log.example.md", "ai-logs/2026-06-24-admin-work-item-list.md"],
  ];
  for (const [source, dest] of exampleCopies) {
    fs.copyFileSync(path.join(kitRoot, source), path.join(target, dest));
  }

  const taskPath = path.join(target, "tasks", "001-admin-work-item-list.md");
  const originalTaskContent = fs.readFileSync(taskPath, "utf8");

  fs.writeFileSync(taskPath, originalTaskContent.replace(/^Approval scope:.*$/m, "Approval scope:"));
  const missingApprovalScopeCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (missingApprovalScopeCheck.status === 0 || !missingApprovalScopeCheck.stderr.includes("Approval scope")) {
    fail(`generated project ready workflow artifact check should reject missing approval scope: ${missingApprovalScopeCheck.stderr || missingApprovalScopeCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project ready workflow artifact check rejects missing approval scope");

  fs.writeFileSync(taskPath, originalTaskContent.replace("`specs/001-admin-work-item-list.md`", "`specs/<file>.md`"));
  const placeholderRefCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (placeholderRefCheck.status === 0 || !placeholderRefCheck.stderr.includes("placeholder file")) {
    fail(`generated project ready workflow artifact check should reject placeholder refs: ${placeholderRefCheck.stderr || placeholderRefCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project ready workflow artifact check rejects placeholder refs");

  const artifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (artifactCheck.status !== 0) {
    fail(`generated project workflow artifact quality check failed: ${artifactCheck.stderr || artifactCheck.stdout}`);
    return;
  }
  pass("generated project workflow artifact quality check");

  const taskScopedArtifactCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (taskScopedArtifactCheck.status !== 0) {
    fail(`generated project task-scoped workflow artifact check failed: ${taskScopedArtifactCheck.stderr || taskScopedArtifactCheck.stdout}`);
    return;
  }
  pass("generated project task-scoped workflow artifact check");

  const generatedReviewPacket = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "review-packet",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewPacket.status !== 0
    || !fs.existsSync(path.join(target, "review-packets", "001-admin-work-item-list.md"))) {
    fail(`generated project review packet item failed: ${generatedReviewPacket.stderr || generatedReviewPacket.stdout}`);
    return;
  }
  pass("generated project new workflow item creates review packet");

  const generatedGptReviewPrompt = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "gpt-review-prompt",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedGptReviewPrompt.status !== 0
    || !fs.existsSync(path.join(target, "gpt-review-prompts", "001-admin-work-item-list.md"))) {
    fail(`generated project GPT review prompt item failed: ${generatedGptReviewPrompt.stderr || generatedGptReviewPrompt.stdout}`);
    return;
  }
  pass("generated project new workflow item creates GPT review prompt");

  const generatedReviewLoopReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "review-loop-report",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewLoopReport.status !== 0
    || !fs.existsSync(path.join(target, "review-loop-reports", "001-admin-work-item-list.md"))) {
    fail(`generated project review loop report item failed: ${generatedReviewLoopReport.stderr || generatedReviewLoopReport.stdout}`);
    return;
  }
  const generatedReviewLoopContent = fs.readFileSync(path.join(target, "review-loop-reports", "001-admin-work-item-list.md"), "utf8");
  if (!generatedReviewLoopContent.includes("Review required: Yes") || !generatedReviewLoopContent.includes("Max auto-fix rounds: 2")) {
    fail("generated project review loop report missing required review policy");
    return;
  }
  pass("generated project new workflow item creates review loop report");

  const generatedFollowUpProposal = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "follow-up-proposal",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedFollowUpProposal.status !== 0
    || !fs.existsSync(path.join(target, "follow-up-proposals", "001-admin-work-item-list.md"))) {
    fail(`generated project follow-up proposal item failed: ${generatedFollowUpProposal.stderr || generatedFollowUpProposal.stdout}`);
    return;
  }
  const generatedFollowUpContent = fs.readFileSync(path.join(target, "follow-up-proposals", "001-admin-work-item-list.md"), "utf8");
  if (!generatedFollowUpContent.includes("DIRECT_FOLLOW_UP") || !generatedFollowUpContent.includes("Can AI Do This Now?")) {
    fail("generated project follow-up proposal missing bounded next-step markers");
    return;
  }
  pass("generated project new workflow item creates follow-up proposal");

  const generatedFinalReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "final-report",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedFinalReport.status !== 0
    || !fs.existsSync(path.join(target, "final-reports", "001-admin-work-item-list.md"))) {
    fail(`generated project final report item failed: ${generatedFinalReport.stderr || generatedFinalReport.stdout}`);
    return;
  }
  const generatedFinalReportContent = fs.readFileSync(path.join(target, "final-reports", "001-admin-work-item-list.md"), "utf8");
  if (!generatedFinalReportContent.includes("Next-Step Suggestions") || !generatedFinalReportContent.includes("Next Safe Action")) {
    fail("generated project final report missing bounded next-step sections");
    return;
  }
  pass("generated project new workflow item creates final report");

  const generatedReviewLoopSemanticCheck = runNode([
    path.join(target, "scripts", "check-review-loop.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedReviewLoopSemanticCheck.status !== 0) {
    fail(`generated project review loop semantic check failed: ${generatedReviewLoopSemanticCheck.stderr || generatedReviewLoopSemanticCheck.stdout}`);
    return;
  }
  pass("generated project review loop semantic check");

  const generatedNextStepSemanticCheck = runNode([
    path.join(target, "scripts", "check-next-step-boundary.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedNextStepSemanticCheck.status !== 0) {
    fail(`generated project next-step boundary semantic check failed: ${generatedNextStepSemanticCheck.stderr || generatedNextStepSemanticCheck.stdout}`);
    return;
  }
  pass("generated project next-step boundary semantic check");

  const reviewLoopPath = path.join(target, "review-loop-reports", "001-admin-work-item-list.md");
  const originalReviewLoopContent = fs.readFileSync(reviewLoopPath, "utf8");
  const invalidReviewLoopContent = originalReviewLoopContent.replace(
    "|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |  |  |  |",
    "| F1 | P1 | AUTO_FIX | Add a new dependency to fix this task | review-packets/001-admin-work-item-list.md | Install dependency | Codex | OPEN |",
  );
  fs.writeFileSync(reviewLoopPath, invalidReviewLoopContent);
  const invalidReviewLoopSemanticCheck = runNode([
    path.join(target, "scripts", "check-review-loop.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (invalidReviewLoopSemanticCheck.status === 0 || !invalidReviewLoopSemanticCheck.stderr.includes("AUTO_FIX")) {
    fail(`generated project review loop semantic check should reject forbidden AUTO_FIX: ${invalidReviewLoopSemanticCheck.stderr || invalidReviewLoopSemanticCheck.stdout}`);
    return;
  }
  fs.writeFileSync(reviewLoopPath, originalReviewLoopContent);
  pass("generated project review loop semantic check rejects forbidden AUTO_FIX");

  const finalReportPath = path.join(target, "final-reports", "001-admin-work-item-list.md");
  const originalFinalReportContent = fs.readFileSync(finalReportPath, "utf8");
  const invalidFinalReportContent = originalFinalReportContent.replace(
    "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    "| N1 | DIRECT_FOLLOW_UP | Align neighboring state | Same surface | Yes | current task | none |",
  );
  fs.writeFileSync(finalReportPath, invalidFinalReportContent);
  const invalidNextStepSemanticCheck = runNode([
    path.join(target, "scripts", "check-next-step-boundary.mjs"),
    target,
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (invalidNextStepSemanticCheck.status === 0 || !invalidNextStepSemanticCheck.stderr.includes("Can AI do now")) {
    fail(`generated project next-step semantic check should reject out-of-scope immediate work: ${invalidNextStepSemanticCheck.stderr || invalidNextStepSemanticCheck.stdout}`);
    return;
  }
  fs.writeFileSync(finalReportPath, originalFinalReportContent);
  pass("generated project next-step boundary semantic check rejects out-of-scope immediate work");

  const generatedGoalCard = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "goal-card",
    "--task",
    "tasks/001-admin-work-item-list.md",
    "--goal-mode",
    "IMPLEMENT_TASK",
  ]);
  const goalCardPath = path.join(target, "goal-cards", "001-admin-work-item-list.md");
  if (generatedGoalCard.status !== 0 || !fs.existsSync(goalCardPath)) {
    fail(`generated project goal card item failed: ${generatedGoalCard.stderr || generatedGoalCard.stdout}`);
    return;
  }
  pass("generated project new workflow item creates goal card");

  const generatedGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (generatedGoalModeCheck.status !== 0) {
    fail(`generated project Goal Mode semantic check failed: ${generatedGoalModeCheck.stderr || generatedGoalModeCheck.stdout}`);
    return;
  }
  pass("generated project Goal Mode semantic check");

  const originalGoalCardContent = fs.readFileSync(goalCardPath, "utf8");
  const invalidGoalCardContent = originalGoalCardContent.replace("Selected: IMPLEMENT_TASK", "Selected: AUTO_IMPLEMENT");
  fs.writeFileSync(goalCardPath, invalidGoalCardContent);
  const invalidGoalModeCheck = runNode([
    path.join(target, "scripts", "check-goal-mode.mjs"),
    target,
  ]);
  if (invalidGoalModeCheck.status === 0 || !invalidGoalModeCheck.stderr.includes("invalid Goal Mode")) {
    fail(`generated project Goal Mode check should reject invalid mode: ${invalidGoalModeCheck.stderr || invalidGoalModeCheck.stdout}`);
    return;
  }
  fs.writeFileSync(goalCardPath, originalGoalCardContent);
  pass("generated project Goal Mode semantic check rejects invalid mode");

  const generatedSubagentRunPlan = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "subagent-run-plan",
    "--task",
    "tasks/001-admin-work-item-list.md",
    "--subagent-mode",
    "READ_ONLY_RESEARCH",
  ]);
  const subagentRunPlanPath = path.join(target, "subagent-run-plans", "001-admin-work-item-list.md");
  if (generatedSubagentRunPlan.status !== 0 || !fs.existsSync(subagentRunPlanPath)) {
    fail(`generated project Subagent Run Plan item failed: ${generatedSubagentRunPlan.stderr || generatedSubagentRunPlan.stdout}`);
    return;
  }
  pass("generated project new workflow item creates Subagent Run Plan");

  const generatedSubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (generatedSubagentCheck.status !== 0) {
    fail(`generated project Subagent Orchestration semantic check failed: ${generatedSubagentCheck.stderr || generatedSubagentCheck.stdout}`);
    return;
  }
  pass("generated project Subagent Orchestration semantic check");

  const originalSubagentRunPlanContent = fs.readFileSync(subagentRunPlanPath, "utf8");
  const invalidSubagentRunPlanContent = originalSubagentRunPlanContent
    .replace("| A1 | Goal Planner | READ_ONLY | SKIPPED | none | no helper needed yet | No subagent launched; plan is draft |", "| A1 | Reviewer | READ_ONLY | RUNNING | none | handoff complete | still open |")
    .replace("All subagents closed: Yes", "All subagents closed: No")
    .replace("No subagent left occupying a slot after handoff: Yes", "No subagent left occupying a slot after handoff: No");
  fs.writeFileSync(subagentRunPlanPath, invalidSubagentRunPlanContent);
  const invalidSubagentCheck = runNode([
    path.join(target, "scripts", "check-subagent-orchestration.mjs"),
    target,
  ]);
  if (invalidSubagentCheck.status === 0 || !invalidSubagentCheck.stderr.includes("subagent must be closed before final response")) {
    fail(`generated project Subagent Orchestration check should reject unclosed subagent: ${invalidSubagentCheck.stderr || invalidSubagentCheck.stdout}`);
    return;
  }
  fs.writeFileSync(subagentRunPlanPath, originalSubagentRunPlanContent);
  pass("generated project Subagent Orchestration semantic check rejects unclosed subagent");

  const generatedHumanStatusReport = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "human-status-report",
    "--name",
    "workflow-next",
  ]);
  if (generatedHumanStatusReport.status !== 0
    || !fs.existsSync(path.join(target, "status-reports", "001-workflow-next.md"))) {
    fail(`generated project human status report item failed: ${generatedHumanStatusReport.stderr || generatedHumanStatusReport.stdout}`);
    return;
  }
  pass("generated project new workflow item creates human status report");

  const generatedDecisionBrief = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "decision-brief",
    "--name",
    "baseline-selection",
  ]);
  if (generatedDecisionBrief.status !== 0
    || !fs.existsSync(path.join(target, "decision-briefs", "001-baseline-selection.md"))) {
    fail(`generated project decision brief item failed: ${generatedDecisionBrief.stderr || generatedDecisionBrief.stdout}`);
    return;
  }
  pass("generated project new workflow item creates decision brief");

  const generatedPlainReviewSummary = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "plain-review-summary",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (generatedPlainReviewSummary.status !== 0
    || !fs.existsSync(path.join(target, "review-summaries", "001-admin-work-item-list.md"))) {
    fail(`generated project plain review summary item failed: ${generatedPlainReviewSummary.stderr || generatedPlainReviewSummary.stdout}`);
    return;
  }
  pass("generated project new workflow item creates plain review summary");

  const generatedCustomerHandoff = runNode([
    path.join(target, "scripts", "new-workflow-item.mjs"),
    "--root",
    target,
    "--type",
    "customer-handoff",
    "--name",
    "release-001",
  ]);
  if (generatedCustomerHandoff.status !== 0
    || !fs.existsSync(path.join(target, "customer-handoffs", "001-release-001.md"))) {
    fail(`generated project customer handoff item failed: ${generatedCustomerHandoff.stderr || generatedCustomerHandoff.stdout}`);
    return;
  }
  pass("generated project new workflow item creates customer handoff");

  const missedRiskTaskContent = originalTaskContent
    .replace("- [x] permission", "- [ ] permission")
    .replace("Required: Yes", "Required: No")
    .replace("Status: Pending", "Status: Not Required")
    .replace(/^Approval scope:.*$/m, "Approval scope: Not Required");
  fs.writeFileSync(taskPath, missedRiskTaskContent);
  const missedRiskReadyCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (missedRiskReadyCheck.status !== 0 || !missedRiskReadyCheck.stdout.includes("without matching Risk Gate checks")) {
    fail(`generated project ready workflow artifact check should warn on missed Risk Gate checks: ${missedRiskReadyCheck.stderr || missedRiskReadyCheck.stdout}`);
    return;
  }
  const missedRiskImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (missedRiskImplementationCheck.status === 0 || !missedRiskImplementationCheck.stderr.includes("without matching Risk Gate checks")) {
    fail(`generated project implementation mode should reject missed Risk Gate checks: ${missedRiskImplementationCheck.stderr || missedRiskImplementationCheck.stdout}`);
    return;
  }
  const excludedRiskTaskContent = missedRiskTaskContent.replace("## Human Approval", [
    "## Risk Gate Exclusions",
    "",
    "| Mentioned term | Not checked because | Human accepted |",
    "|---|---|---|",
    "| permission | self-check verifies an explicit human-accepted exclusion can override a text-only risk mention | Yes |",
    "",
    "## Human Approval",
  ].join("\n"));
  fs.writeFileSync(taskPath, excludedRiskTaskContent);
  const excludedRiskImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (excludedRiskImplementationCheck.status !== 0) {
    fail(`generated project implementation mode should accept human-approved Risk Gate Exclusions: ${excludedRiskImplementationCheck.stderr || excludedRiskImplementationCheck.stdout}`);
    return;
  }
  const tooManyExclusionsTaskContent = missedRiskTaskContent.replace("## Human Approval", [
    "## Risk Gate Exclusions",
    "",
    "| Mentioned term | Not checked because | Human accepted |",
    "|---|---|---|",
    "| permission | self-check verifies an explicit human-accepted exclusion can override a text-only risk mention | Yes |",
    "| auth | self-check fixture mentions auth only as a non-goal for this task | Yes |",
    "| migration | self-check fixture mentions migration only as a non-goal for this task | Yes |",
    "| production config | self-check fixture mentions production config only as a non-goal for this task | Yes |",
    "",
    "## Human Approval",
  ].join("\n"));
  fs.writeFileSync(taskPath, tooManyExclusionsTaskContent);
  const tooManyExclusionsReadyCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "ready",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (tooManyExclusionsReadyCheck.status !== 0 || !tooManyExclusionsReadyCheck.stdout.includes("accepted Risk Gate Exclusions")) {
    fail(`generated project ready mode should warn on too many Risk Gate Exclusions: ${tooManyExclusionsReadyCheck.stderr || tooManyExclusionsReadyCheck.stdout}`);
    return;
  }
  const tooManyExclusionsImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (tooManyExclusionsImplementationCheck.status === 0 || !tooManyExclusionsImplementationCheck.stderr.includes("Risk Gate Exclusions")) {
    fail(`generated project implementation mode should reject too many Risk Gate Exclusions without approval scope: ${tooManyExclusionsImplementationCheck.stderr || tooManyExclusionsImplementationCheck.stdout}`);
    return;
  }
  const approvedTooManyExclusionsTaskContent = tooManyExclusionsTaskContent
    .replace("Required: No", "Required: Yes")
    .replace("Status: Not Required", "Status: Approved")
    .replace(/^Approval scope:.*$/m, "Approval scope: Risk Gate Exclusions accepted for this self-check fixture.")
    .replace("Approved by:", "Approved by: human-review")
    .replace("Approved at:", "Approved at: 2026-06-25T00:00:00.000Z");
  fs.writeFileSync(taskPath, approvedTooManyExclusionsTaskContent);
  const approvedTooManyExclusionsImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (approvedTooManyExclusionsImplementationCheck.status !== 0) {
    fail(`generated project implementation mode should accept explicitly approved Risk Gate Exclusions: ${approvedTooManyExclusionsImplementationCheck.stderr || approvedTooManyExclusionsImplementationCheck.stdout}`);
    return;
  }
  fs.writeFileSync(taskPath, originalTaskContent);
  pass("generated project workflow artifact check detects missed Risk Gate checks");
  pass("generated project workflow artifact check accepts human-approved Risk Gate Exclusions");
  pass("generated project workflow artifact check guards excessive Risk Gate Exclusions");

  const pendingImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (pendingImplementationCheck.status === 0 || !pendingImplementationCheck.stderr.includes("Status: Approved")) {
    fail(`generated project implementation mode should require approved human approval: ${pendingImplementationCheck.stderr || pendingImplementationCheck.stdout}`);
    return;
  }
  pass("generated project implementation mode rejects pending human approval");

  const copiedTaskPath = path.join(target, "tasks", "001-admin-work-item-list.md");
  const copiedTaskContent = fs.readFileSync(copiedTaskPath, "utf8")
    .replace("Status: Pending", "Status: Approved")
    .replace("Approved by:", "Approved by: human-review")
    .replace("Approved at:", "Approved at: 2026-06-25T00:00:00.000Z");
  fs.writeFileSync(copiedTaskPath, copiedTaskContent);

  const approvedImplementationCheck = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
    "--mode",
    "implementation",
    "--task",
    "tasks/001-admin-work-item-list.md",
  ]);
  if (approvedImplementationCheck.status !== 0) {
    fail(`generated project implementation mode with approved human approval failed: ${approvedImplementationCheck.stderr || approvedImplementationCheck.stdout}`);
    return;
  }
  pass("generated project implementation mode accepts approved human approval");

  const generatedUpdatePlanPath = path.join(target, "apply-execution-plans", "generated-workflow-update-plan.json");
  const generatedUpdatePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
    "--write-plan",
    path.relative(target, generatedUpdatePlanPath),
  ]);
  if (generatedUpdatePlan.status !== 0 || !fs.existsSync(generatedUpdatePlanPath)) {
    fail(`generated project workflow update plan failed: ${generatedUpdatePlan.stderr || generatedUpdatePlan.stdout}`);
    return;
  }
  const updateResult = runNode(approvedInitProjectApplyArgs(generatedUpdatePlanPath));
  if (updateResult.status !== 0) {
    fail(`generated project workflow update failed: ${updateResult.stderr || updateResult.stdout}`);
    return;
  }
  pass("generated project workflow asset update uses exact approved plan replay");

  const projectCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-ai-workflow.mjs"),
    target,
  ]);
  if (projectCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow check after update failed: ${projectCheckAfterUpdate.stderr || projectCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow check after update");

  const nextCheckAfterUpdate = runNode([
    path.join(target, "scripts", "workflow-next.mjs"),
    target,
  ]);
  if (nextCheckAfterUpdate.status !== 0 || !nextCheckAfterUpdate.stdout.includes("PROJECT_STATE: BOOTSTRAPPED_PROJECT")) {
    fail(`generated project workflow next check after update failed: ${nextCheckAfterUpdate.stderr || nextCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow next check after update");

  const versionCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-workflow-version.mjs"),
    target,
  ]);
  if (versionCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow version check after update failed: ${versionCheckAfterUpdate.stderr || versionCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow version check after update");

  const onboardingCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-project-onboarding.mjs"),
    target,
  ]);
  if (onboardingCheckAfterUpdate.status !== 0) {
    fail(`generated project onboarding check after update failed: ${onboardingCheckAfterUpdate.stderr || onboardingCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project onboarding check after update");

  const dailySummaryAfterUpdate = runNode([
    path.join(target, "scripts", "workflow-daily-summary.mjs"),
    target,
  ]);
  if (dailySummaryAfterUpdate.status !== 0) {
    fail(`generated project workflow daily summary after update failed: ${dailySummaryAfterUpdate.stderr || dailySummaryAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow daily summary after update");

  const artifactCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-workflow-artifacts.mjs"),
    target,
  ]);
  if (artifactCheckAfterUpdate.status !== 0) {
    fail(`generated project workflow artifact quality check after update failed: ${artifactCheckAfterUpdate.stderr || artifactCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project workflow artifact quality check after update");

  const executionAssuranceResolveAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-execution-assurance.mjs"),
    target,
    "--intent",
    "generated project execution assurance smoke",
  ]);
  if (executionAssuranceResolveAfterUpdate.status !== 0 || !executionAssuranceResolveAfterUpdate.stdout.includes("Execution Assurance Report")) {
    fail(`generated project execution assurance resolver after update failed: ${executionAssuranceResolveAfterUpdate.stderr || executionAssuranceResolveAfterUpdate.stdout}`);
    return;
  }
  pass("generated project execution assurance resolver after update");

  const executionAssuranceCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-execution-assurance.mjs"),
    target,
    "--allow-empty",
  ]);
  if (executionAssuranceCheckAfterUpdate.status !== 0) {
    fail(`generated project execution assurance checker after update failed: ${executionAssuranceCheckAfterUpdate.stderr || executionAssuranceCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project execution assurance checker after update");

  if (generatedVerificationStrictCheck.status === 0) {
  fs.writeFileSync(path.join(target, generatedExecutionAssuranceReport), generatedExecutionAssuranceReportText({
    taskRef: "tasks/001-appointment-requests-must-include-a-service-time.md",
    testEvidenceRef: `artifact:${generatedTestEvidenceReport}`,
    testEvidenceDigest: fileDigest(path.join(target, generatedTestEvidenceReport)),
  }));
  const generatedCompletionResolveAfterUpdate = runNode([
    path.join(target, "scripts", "resolve-completion-evidence.mjs"),
    target,
    "--intent",
    "appointment requests must include a service time",
    "--business-rule-ref",
    generatedBusinessRuleRef,
    "--verification-plan-ref",
    `artifact:${generatedVerificationReport}`,
    "--test-evidence-ref",
    `artifact:${generatedTestEvidenceReport}`,
    "--execution-assurance-ref",
    `artifact:${generatedExecutionAssuranceReport}`,
    "--out",
    generatedCompletionReport,
  ]);
  if (generatedCompletionResolveAfterUpdate.status !== 0
    || !fs.existsSync(path.join(target, generatedCompletionReport))
    || !generatedCompletionResolveAfterUpdate.stdout.includes("COMPLETION_EVIDENCE_READY")) {
    fail(`generated project Completion Evidence resolver after workflow update failed: ${generatedCompletionResolveAfterUpdate.stderr || generatedCompletionResolveAfterUpdate.stdout}`);
    return;
  }
  const generatedCompletionStrictCheckAfterUpdate = runNode([
    path.join(target, "scripts", "check-completion-evidence.mjs"),
    target,
    "--report",
    generatedCompletionReport,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ]);
  if (generatedCompletionStrictCheckAfterUpdate.status !== 0
    || !generatedCompletionStrictCheckAfterUpdate.stdout.includes("Completion Evidence Gate check passed")) {
    fail(`generated project Completion Evidence strict source binding after workflow update failed: ${generatedCompletionStrictCheckAfterUpdate.stderr || generatedCompletionStrictCheckAfterUpdate.stdout}`);
    return;
  }
  pass("generated project strict Completion Evidence source binding after workflow update");

  const generatedReleaseCandidate = "release-candidates/001-generated-service-time-preview.md";
  const generatedBuildEvidence = "evidence/generated-preview-build.txt";
  const generatedRuntimeSmoke = "evidence/generated-runtime-smoke.txt";
  fs.mkdirSync(path.join(target, "release-candidates"), { recursive: true });
  fs.writeFileSync(path.join(target, generatedReleaseCandidate), [
    "# Generated Service Time Preview Candidate",
    "",
    "- Target: preview",
    "- Source revision: git:generated-project-smoke",
    "- Boundary: review handoff only; no release approval.",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, generatedBuildEvidence), [
    "id: evidence:generated-preview-build",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    "command: npm run build -- generated-service-time",
    "owner: generated-project-smoke",
    "environment: generated-local-ci",
    "ran_at: 2026-07-06T10:20:00Z",
    "exit_code: 0",
    "PASS generated preview build artifact.",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(target, generatedRuntimeSmoke), [
    "id: evidence:generated-runtime-smoke",
    "evidence_type: COMMAND_OUTPUT",
    "result_state: PASSED",
    "command: npm run smoke:preview -- generated-service-time",
    "owner: generated-project-smoke",
    "environment: generated-local-ci",
    "ran_at: 2026-07-06T10:21:00Z",
    "exit_code: 0",
    "PASS generated preview runtime smoke.",
    "",
  ].join("\n"));
  const generatedReleaseEvidenceReport = "release-evidence-gate-reports/001-generated-service-time-preview.md";
  const generatedReleaseEvidenceResolve = runNode([
    path.join(target, "scripts", "resolve-release-evidence-gate.mjs"),
    target,
    "--intent",
    "prepare generated service time preview review",
    "--release-target",
    "preview",
    "--release-candidate-ref",
    `artifact:${generatedReleaseCandidate}`,
    "--source-revision",
    "git:generated-project-smoke",
    "--dirty-worktree-status",
    "clean",
    "--task-ref",
    "tasks/001-appointment-requests-must-include-a-service-time.md",
    "--completion-evidence-ref",
    `artifact:${generatedCompletionReport}`,
    "--build-artifact-ref",
    `artifact:${generatedBuildEvidence}`,
    "--build-artifact-digest",
    fileDigest(path.join(target, generatedBuildEvidence)),
    "--release-owner",
    "human:generated-preview-owner",
    "--runtime-smoke-ref",
    `artifact:${generatedRuntimeSmoke}`,
    "--out",
    generatedReleaseEvidenceReport,
  ]);
  if (generatedReleaseEvidenceResolve.status !== 0
    || !fs.existsSync(path.join(target, generatedReleaseEvidenceReport))
    || !generatedReleaseEvidenceResolve.stdout.includes("Release Evidence Gate Report")
    || !generatedReleaseEvidenceResolve.stdout.includes("READY_FOR_INTERNAL_TRIAL_REVIEW")) {
    fail(`generated project Release Evidence Gate resolver after update failed: ${generatedReleaseEvidenceResolve.stderr || generatedReleaseEvidenceResolve.stdout}`);
    return;
  }
  const generatedReleaseEvidenceCheck = runNode([
    path.join(target, "scripts", "check-release-evidence-gate.mjs"),
    target,
    "--report",
    generatedReleaseEvidenceReport,
    "--require-structured-evidence",
    "--require-current-completion",
    "--strict-source-binding",
  ]);
  if (generatedReleaseEvidenceCheck.status !== 0
    || !generatedReleaseEvidenceCheck.stdout.includes(`Completion Evidence set artifact:${generatedCompletionReport} strict checker passed`)
    || !generatedReleaseEvidenceCheck.stdout.includes("required evidence build-or-preview-evidence digest matches resolved artifact")
    || !generatedReleaseEvidenceCheck.stdout.includes("Release Evidence Gate check passed")) {
    fail(`generated project Release Evidence Gate checker after update failed: ${generatedReleaseEvidenceCheck.stderr || generatedReleaseEvidenceCheck.stdout}`);
    return;
  }
  pass("generated project Release Evidence Gate resolver/checker after update");
  }

  const dryRunTarget = path.join(tempRoot, "dry-run-project");
  const nonEmptyInitTarget = path.join(tempRoot, "non-empty-init-project");
  fs.mkdirSync(nonEmptyInitTarget, { recursive: true });
  fs.writeFileSync(path.join(nonEmptyInitTarget, "existing.txt"), "existing project file\n");
  const directNonEmptyInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    nonEmptyInitTarget,
  ]);
  if (directNonEmptyInit.status !== 2
    || !`${directNonEmptyInit.stdout}\n${directNonEmptyInit.stderr}`.includes("Direct init refused")
    || fs.existsSync(path.join(nonEmptyInitTarget, ".intentos", "version.json"))) {
    fail(`direct init must reject non-empty targets: ${directNonEmptyInit.stderr || directNonEmptyInit.stdout}`);
    return;
  }
  pass("direct init rejects non-empty target without force");

  const forceInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    nonEmptyInitTarget,
    "--force-new-project",
  ]);
  if (forceInit.status !== 0 || !fs.existsSync(path.join(nonEmptyInitTarget, ".intentos", "version.json"))) {
    fail(`direct init force flag should initialize intentionally non-empty new target: ${forceInit.stderr || forceInit.stdout}`);
    return;
  }
  pass("direct init allows non-empty target only with explicit force flag");

  const dryRunResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    dryRunTarget,
    "--dry-run",
  ]);
  if (dryRunResult.status !== 0 || !dryRunResult.stdout.includes('"operation": "INIT_PROJECT"')) {
    fail(`init dry-run did not produce plan preview: ${dryRunResult.stderr || dryRunResult.stdout}`);
    return;
  }
  if (fs.existsSync(dryRunTarget)) {
    fail("init dry-run wrote target files");
    return;
  }
  pass("init dry-run emits plan without writing target files");

  const planOnlyTarget = path.join(tempRoot, "plan-only-project");
  const planOnlyPath = path.join(planOnlyTarget, "apply-execution-plans", "plan-only-init.json");
  fs.mkdirSync(planOnlyTarget, { recursive: true });
  const writeInitPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    planOnlyTarget,
    "--write-plan",
    path.relative(planOnlyTarget, planOnlyPath),
  ]);
  if (writeInitPlan.status !== 0 || !fs.existsSync(planOnlyPath)) {
    fail(`init write-plan failed: ${writeInitPlan.stderr || writeInitPlan.stdout}`);
    return;
  }
  if (fs.existsSync(path.join(planOnlyTarget, ".intentos", "version.json"))) {
    fail("init write-plan wrote workflow target files");
    return;
  }
  const missingReadinessApproval = writeInitProjectApprovalRecord(planOnlyPath);
  const missingReadinessApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    planOnlyPath,
    "--approval-record",
    missingReadinessApproval,
  ]);
  if (missingReadinessApply.status !== 2
    || !`${missingReadinessApply.stdout}\n${missingReadinessApply.stderr}`.includes("Controlled Apply Readiness Report required")) {
    fail(`controlled apply must require readiness evidence: ${missingReadinessApply.stderr || missingReadinessApply.stdout}`);
    return;
  }
  pass("1.92 controlled apply fails closed without readiness evidence");
  const applyInitPlan = runNode(approvedInitProjectApplyArgs(planOnlyPath));
  if (applyInitPlan.status !== 0 || !fs.existsSync(path.join(planOnlyTarget, ".intentos", "version.json"))) {
    fail(`init apply-plan failed: ${applyInitPlan.stderr || applyInitPlan.stdout}`);
    return;
  }
  pass("init write-plan/apply-plan initializes target after reviewable plan");
  const receiptCheck = runNode([
    path.join(kitRoot, "scripts", "check-apply-execution-receipt.mjs"),
    planOnlyTarget,
    "--require-structured-evidence",
  ]);
  if (receiptCheck.status !== 0 || !receiptCheck.stdout.includes("Apply Execution Receipt check passed")) {
    fail(`1.92 applied init receipt did not verify: ${receiptCheck.stderr || receiptCheck.stdout}`);
    return;
  }
  pass("1.92 exact plan replay produces a valid project-bound receipt");
  const copiedReceiptTarget = path.join(tempRoot, "copied-receipt-project");
  fs.mkdirSync(copiedReceiptTarget, { recursive: true });
  fs.cpSync(path.join(planOnlyTarget, "apply-receipts"), path.join(copiedReceiptTarget, "apply-receipts"), { recursive: true });
  const copiedReceiptCheck = runNode([
    path.join(kitRoot, "scripts", "check-apply-execution-receipt.mjs"),
    copiedReceiptTarget,
    "--require-structured-evidence",
  ]);
  if (copiedReceiptCheck.status === 0 || !`${copiedReceiptCheck.stdout}\n${copiedReceiptCheck.stderr}`.includes("belongs to another project")) {
    fail(`1.92 receipt checker must reject evidence copied from another project: ${copiedReceiptCheck.stderr || copiedReceiptCheck.stdout}`);
    return;
  }
  pass("1.92 receipt checker rejects evidence copied from another project");
  const staleReceiptTarget = path.join(planOnlyTarget, "docs", "project-onboarding.md");
  fs.appendFileSync(staleReceiptTarget, "\nReceipt stale mutation.\n");
  const staleReceiptCheck = runNode([
    path.join(kitRoot, "scripts", "check-apply-execution-receipt.mjs"),
    planOnlyTarget,
    "--require-structured-evidence",
  ]);
  if (staleReceiptCheck.status === 0 || !`${staleReceiptCheck.stdout}\n${staleReceiptCheck.stderr}`.includes("stale or mismatched")) {
    fail(`1.92 receipt checker must reject post-apply target drift: ${staleReceiptCheck.stderr || staleReceiptCheck.stdout}`);
    return;
  }
  pass("1.92 receipt checker rejects post-apply target drift");

  const sourceDriftTarget = path.join(tempRoot, "source-drift-project");
  const sourceDriftPlanPath = path.join(sourceDriftTarget, "apply-execution-plans", "source-drift-init.json");
  fs.mkdirSync(sourceDriftTarget, { recursive: true });
  const sourceDriftWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    sourceDriftTarget,
    "--write-plan",
    path.relative(sourceDriftTarget, sourceDriftPlanPath),
  ]);
  if (sourceDriftWritePlan.status !== 0) {
    fail(`1.92 source-drift write-plan failed: ${sourceDriftWritePlan.stderr || sourceDriftWritePlan.stdout}`);
    return;
  }
  const sourceDriftPlan = JSON.parse(fs.readFileSync(sourceDriftPlanPath, "utf8"));
  const sourceBoundAction = sourceDriftPlan.actions.find((action) => action.source && action.willWrite === true);
  if (!sourceBoundAction) {
    fail("1.92 source-drift fixture could not find a source-bound executable action");
    return;
  }
  sourceBoundAction.sourceHash = `sha256:${"0".repeat(64)}`;
  sourceBoundAction.expectedHashAfter = sourceBoundAction.sourceHash;
  sourceDriftPlan.planDigest = evidenceDigest(sourceDriftPlan, ["planDigest"]);
  fs.writeFileSync(sourceDriftPlanPath, `${JSON.stringify(sourceDriftPlan, null, 2)}\n`);
  const sourceDriftApply = runNode(approvedInitProjectApplyArgs(sourceDriftPlanPath));
  if (sourceDriftApply.status !== 2 || !`${sourceDriftApply.stdout}\n${sourceDriftApply.stderr}`.includes("source for")) {
    fail(`1.92 controlled apply must reject source drift after planning: ${sourceDriftApply.stderr || sourceDriftApply.stdout}`);
    return;
  }
  pass("1.92 controlled apply rejects source drift after planning");

  const stalePlanTarget = path.join(tempRoot, "stale-plan-project");
  fs.mkdirSync(stalePlanTarget, { recursive: true });
  fs.writeFileSync(path.join(stalePlanTarget, "AGENTS.md"), "# Stale\n");
  const stalePlanPath = path.join(stalePlanTarget, "apply-execution-plans", "stale-update-plan.json");
  const staleWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    stalePlanTarget,
    "--update-workflow-assets",
    "--write-plan",
    path.relative(stalePlanTarget, stalePlanPath),
  ]);
  if (staleWritePlan.status !== 0) {
    fail(`stale update write-plan failed: ${staleWritePlan.stderr || staleWritePlan.stdout}`);
    return;
  }
  fs.appendFileSync(path.join(stalePlanTarget, "AGENTS.md"), "\nChanged after plan.\n");
  const staleApply = runNode(approvedInitProjectApplyArgs(stalePlanPath));
  if (staleApply.status !== 2 || !`${staleApply.stdout}\n${staleApply.stderr}`.includes("Plan precondition failed")) {
    fail(`stale update apply-plan did not fail on fingerprint change: ${staleApply.stderr || staleApply.stdout}`);
    return;
  }
  pass("apply-plan rejects changed target fingerprint");

  const backupTarget = path.join(tempRoot, "backup-project");
  const backupInit = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    backupTarget,
  ]);
  if (backupInit.status !== 0) {
    fail(`backup target init failed: ${backupInit.stderr || backupInit.stdout}`);
    return;
  }
  fs.appendFileSync(path.join(backupTarget, "scripts", "check-ai-workflow.mjs"), "\n// local backup sentinel\n");
  const backupPlanPath = path.join(backupTarget, "apply-execution-plans", "backup-update-plan.json");
  const backupDir = ".intentos/backups/0.38-test";
  const backupPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    backupTarget,
    "--update-workflow-assets",
    "--backup-dir",
    backupDir,
    "--write-plan",
    path.relative(backupTarget, backupPlanPath),
  ]);
  if (backupPlan.status !== 0) {
    fail(`backup update write-plan failed: ${backupPlan.stderr || backupPlan.stdout}`);
    return;
  }
  const backupApply = runNode(approvedInitProjectApplyArgs(backupPlanPath));
  const backedUpScript = path.join(backupTarget, backupDir, "scripts", "check-ai-workflow.mjs");
  if (backupApply.status !== 0 || !fs.existsSync(backedUpScript)) {
    fail(`backup update apply-plan did not preserve backup: ${backupApply.stderr || backupApply.stdout}`);
    return;
  }
  if (!fs.readFileSync(backedUpScript, "utf8").includes("local backup sentinel")) {
    fail("backup file does not contain pre-update content");
    return;
  }
  pass("backup-dir preserves overwritten managed assets during apply-plan");

  const legacyTarget = path.join(tempRoot, "legacy-project");
  fs.mkdirSync(legacyTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyTarget, "AGENTS.md"), "# Legacy\n");
  fs.mkdirSync(path.join(legacyTarget, "docs"), { recursive: true });
  const legacyDirectUpdateResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
  ]);
  if (legacyDirectUpdateResult.status !== 2 || !`${legacyDirectUpdateResult.stdout}\n${legacyDirectUpdateResult.stderr}`.includes("plan-first")) {
    fail(`legacy project direct workflow update was not blocked: ${legacyDirectUpdateResult.stderr || legacyDirectUpdateResult.stdout}`);
    return;
  }
  const legacyPlanPath = path.join(legacyTarget, "apply-execution-plans", "legacy-update-plan.json");
  const legacyWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--apply-agent-governance",
    "--write-plan",
    path.relative(legacyTarget, legacyPlanPath),
  ]);
  if (legacyWritePlan.status !== 0 || !fs.existsSync(legacyPlanPath)) {
    fail(`legacy project write-plan failed: ${legacyWritePlan.stderr || legacyWritePlan.stdout}`);
    return;
  }
  if (fs.existsSync(path.join(legacyTarget, ".intentos", "version.json"))) {
    fail("legacy project write-plan wrote workflow version before apply-plan");
    return;
  }
  const legacyUpdateResult = runNode(approvedInitProjectApplyArgs(legacyPlanPath));
  if (legacyUpdateResult.status !== 0) {
    fail(`legacy project apply-plan workflow update failed: ${legacyUpdateResult.stderr || legacyUpdateResult.stdout}`);
    return;
  }
  pass("legacy project workflow update requires plan-first apply");
  const legacyExpectedDirs = ["skill-candidates", "automation-proposals", "workflow-retros", "workflow-improvements", "review-packets", "gpt-review-prompts", "review-loop-reports", "follow-up-proposals", "final-reports", "status-reports", "decision-briefs", "review-summaries", "customer-handoffs"];
  for (const dir of legacyExpectedDirs) {
    if (!fs.existsSync(path.join(legacyTarget, dir))) {
      fail(`legacy project workflow update missing ${dir}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing workflow dirs");

  const legacyExpectedOnboardingDocs = [
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/verification-matrix.md",
    "docs/engineering-baseline.md",
  ];
  for (const rel of legacyExpectedOnboardingDocs) {
    if (!fs.existsSync(path.join(legacyTarget, rel))) {
      fail(`legacy project workflow update missing ${rel}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing onboarding docs");

  const legacyAgentsContent = fs.readFileSync(path.join(legacyTarget, "AGENTS.md"), "utf8");
  if (!legacyAgentsContent.startsWith("# Legacy\n")
    || !legacyAgentsContent.includes("# IntentOS Workflow Governance Appendix")
    || !legacyAgentsContent.includes("## Product Baseline And Claim Control")) {
    fail("legacy project AGENTS.md did not preserve existing authority while applying the approved IntentOS appendix");
    return;
  }
  const legacyPlan = JSON.parse(fs.readFileSync(legacyPlanPath, "utf8"));
  if (!legacyPlan.actions.some((action) => action.type === "UPDATE_MANAGED" && action.path === "AGENTS.md" && action.executionSupported === true)) {
    fail("legacy project plan must include the explicitly approved AGENTS.md governance update");
    return;
  }
  pass("legacy project plan binds the explicitly approved AGENTS.md governance update");

  const legacyAgentsApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--apply-agent-governance",
  ]);
  if (legacyAgentsApply.status !== 2 || !`${legacyAgentsApply.stdout}\n${legacyAgentsApply.stderr}`.includes("plan-first")) {
    fail(`legacy project direct AGENTS.md governance apply must be blocked: ${legacyAgentsApply.stderr || legacyAgentsApply.stdout}`);
    return;
  }
  const appliedLegacyAgents = fs.readFileSync(path.join(legacyTarget, "AGENTS.md"), "utf8");
  if (appliedLegacyAgents !== legacyAgentsContent) {
    fail("blocked direct governance apply changed legacy AGENTS.md");
    return;
  }
  pass("legacy project direct AGENTS.md governance apply is blocked without a new exact plan");

  const legacyNoAgentsTarget = path.join(tempRoot, "legacy-no-agents");
  fs.mkdirSync(legacyNoAgentsTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyNoAgentsTarget, "README.md"), "# Existing Project\n");
  const legacyNoAgentsPlanPath = path.join(legacyNoAgentsTarget, "apply-execution-plans", "legacy-no-agents-update-plan.json");
  const legacyNoAgentsWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyNoAgentsTarget,
    "--update-workflow-assets",
    "--write-plan",
    path.relative(legacyNoAgentsTarget, legacyNoAgentsPlanPath),
  ]);
  if (legacyNoAgentsWritePlan.status !== 0) {
    fail(`legacy no-AGENTS write-plan failed: ${legacyNoAgentsWritePlan.stderr || legacyNoAgentsWritePlan.stdout}`);
    return;
  }
  const legacyNoAgentsUpdate = runNode(approvedInitProjectApplyArgs(legacyNoAgentsPlanPath));
  if (legacyNoAgentsUpdate.status !== 0) {
    fail(`legacy no-AGENTS apply-plan workflow update failed: ${legacyNoAgentsUpdate.stderr || legacyNoAgentsUpdate.stdout}`);
    return;
  }
  const createdAgents = path.join(legacyNoAgentsTarget, "AGENTS.md");
  if (!fs.existsSync(createdAgents)) {
    fail("legacy no-AGENTS workflow update did not create AGENTS.md");
    return;
  }
  const createdAgentsContent = fs.readFileSync(createdAgents, "utf8");
  for (const marker of ["Bootstrap Entry", "Engineering Baseline", "Platform Baseline", "Industrial Baseline", "Subagent Orchestration", "Bounded Next-Step", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
    if (!createdAgentsContent.includes(marker)) {
      fail(`created AGENTS.md missing ${marker}`);
      return;
    }
  }
  pass("legacy no-AGENTS workflow update creates governed AGENTS.md");

  const legacyPrTemplate = path.join(legacyTarget, ".github", "pull_request_template.md");
  if (!fs.existsSync(legacyPrTemplate)) {
    fail("legacy project workflow update missing PR template");
    return;
  }
  const legacyPrTemplateContent = fs.readFileSync(legacyPrTemplate, "utf8");
  for (const marker of ["Human Summary", "Bootstrap state", "Project onboarding", "Engineering baseline", "Workflow Evidence", "Workflow artifact quality", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
    if (!legacyPrTemplateContent.includes(marker)) {
      fail(`legacy project workflow update PR template missing ${marker}`);
      return;
    }
  }
  pass("legacy project workflow update creates missing PR template with governance markers");

  const legacyCustomPrTarget = path.join(tempRoot, "legacy-custom-pr-template");
  fs.mkdirSync(path.join(legacyCustomPrTarget, ".github"), { recursive: true });
  const legacyCustomPrTemplate = path.join(legacyCustomPrTarget, ".github", "pull_request_template.md");
  const originalCustomPrTemplate = "# Existing PR Template\n\n- [ ] Existing project checklist\n";
  fs.writeFileSync(legacyCustomPrTemplate, originalCustomPrTemplate);
  const legacyCustomPrPlanPath = path.join(legacyCustomPrTarget, "apply-execution-plans", "legacy-custom-pr-update-plan.json");
  const legacyCustomPrWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--write-plan",
    path.relative(legacyCustomPrTarget, legacyCustomPrPlanPath),
  ]);
  if (legacyCustomPrWritePlan.status !== 0) {
    fail(`legacy custom PR template write-plan failed: ${legacyCustomPrWritePlan.stderr || legacyCustomPrWritePlan.stdout}`);
    return;
  }
  const legacyCustomPrUpdate = runNode(approvedInitProjectApplyArgs(legacyCustomPrPlanPath));
  if (legacyCustomPrUpdate.status !== 0) {
    fail(`legacy custom PR template apply-plan workflow update failed: ${legacyCustomPrUpdate.stderr || legacyCustomPrUpdate.stdout}`);
    return;
  }
  const unchangedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  if (unchangedCustomPrTemplate !== originalCustomPrTemplate) {
    fail("legacy custom PR template was modified without explicit approval");
    return;
  }
  const legacyCustomPrPlan = JSON.parse(fs.readFileSync(legacyCustomPrPlanPath, "utf8"));
  if (!legacyCustomPrPlan.actions.some((action) => action.type === "HUMAN_ONLY" && action.path === ".github/pull_request_template.md")) {
    fail("legacy custom PR template plan must keep governance migration human-only");
    return;
  }
  pass("legacy custom PR template stays unchanged and its migration remains human-only");

  const legacyCustomPrApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--apply-pr-template-governance",
  ]);
  if (legacyCustomPrApply.status !== 2 || !`${legacyCustomPrApply.stdout}\n${legacyCustomPrApply.stderr}`.includes("plan-first")) {
    fail(`legacy custom PR template direct governance apply must be blocked: ${legacyCustomPrApply.stderr || legacyCustomPrApply.stdout}`);
    return;
  }
  const appliedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  if (appliedCustomPrTemplate !== originalCustomPrTemplate) {
    fail("blocked direct PR governance apply changed the project template");
    return;
  }
  pass("legacy custom PR governance apply requires a new exact approved plan");
}

function checkApplyAdoptionClosureProtocol() {
  const required = [
    "docs/plans/apply-adoption-closure-1.92-plan.md",
    "core/apply-execution-receipt.md",
    "docs/apply-execution-receipt.md",
    "templates/apply-execution-receipt.md",
    "schemas/artifacts/apply-execution-receipt.schema.json",
    "scripts/check-apply-execution-receipt.mjs",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.92 apply and adoption closure asset exists ${file}`);
    else fail(`1.92 apply and adoption closure asset missing ${file}`);
  }
  const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.92-empty-receipt-"));
  const strictEmpty = runNode([
    "scripts/check-apply-execution-receipt.mjs",
    emptyRoot,
    "--require-structured-evidence",
  ]);
  if (strictEmpty.status !== 0 && `${strictEmpty.stdout}\n${strictEmpty.stderr}`.includes("receipt is required")) {
    pass("1.92 strict apply receipt check fails closed when evidence is absent");
  } else {
    fail(`1.92 strict apply receipt check must fail closed when absent: ${strictEmpty.stderr || strictEmpty.stdout}`);
  }
}

function checkReleaseTrustClosureProtocol() {
  for (const file of [
    "docs/plans/release-trust-closure-1.93-plan.md",
    "core/release-approval-record.md",
    "docs/release-approval-record.md",
    "templates/release-approval-record.md",
    "schemas/artifacts/release-approval-record.schema.json",
    "schemas/artifacts/release-execution-plan.schema.json",
    "scripts/lib/release-trust.mjs",
    "scripts/check-release-approval-record.mjs",
  ]) {
    if (exists(file)) pass(`1.93 release trust closure asset exists ${file}`);
    else fail(`1.93 release trust closure asset missing ${file}`);
  }

  const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-empty-approval-"));
  const emptyCheck = runNode(["scripts/check-release-approval-record.mjs", emptyRoot, "--require-approved"]);
  if (emptyCheck.status !== 0 && `${emptyCheck.stdout}\n${emptyCheck.stderr}`.includes("record is required")) pass("1.93 release approval fails closed when evidence is absent");
  else fail(`1.93 release approval must fail closed when evidence is absent: ${emptyCheck.stderr || emptyCheck.stdout}`);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-release-trust-"));
  fs.cpSync(path.join(kitRoot, "examples", "1.80-release-evidence-gate", "web-preview-handoff"), root, { recursive: true });
  for (const [relative, content] of [
    ["docs/release-sop.md", "# Release SOP\n\nHuman release owner performs the provider handoff.\n"],
    ["evidence/release-preflight.txt", "PASS release preflight succeeded before production.\n"],
    ["evidence/rollback-current.md", "# Rollback\n\nRestore the previous preview candidate.\n"],
    ["evidence/monitoring-current.md", "# Monitoring\n\nObserve preview health and error logs.\n"],
    ["evidence/post-release-smoke-current.md", "# Post-release Smoke\n\nRead-only preview smoke procedure.\n"],
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    fs.writeFileSync(path.join(root, relative), content);
  }
  const closureFixtureRoot = path.join(kitRoot, "examples", "1.49-structured-impact-coverage", "contract-input-rule");
  for (const relative of ["change-impact-coverage-reports", "closure-decisions", "evidence", "execution-closures"]) {
    fs.cpSync(path.join(closureFixtureRoot, relative), path.join(root, relative), { recursive: true });
  }
  for (const gitArgs of [
    ["init"],
    ["config", "user.email", "intentos-self-check@example.com"],
    ["config", "user.name", "IntentOS Self Check"],
    ["add", "."],
    ["commit", "-m", "release candidate"],
  ]) {
    const result = spawnSync("git", ["-C", root, ...gitArgs], { encoding: "utf8" });
    if (result.status !== 0) {
      fail(`1.93 release trust fixture Git setup failed: ${result.stderr || result.stdout}`);
      return;
    }
  }
  const revision = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
  const candidateRef = "release-candidates/001-web-preview.md";
  const candidateFile = path.join(root, candidateRef);
  const candidateOriginal = fs.readFileSync(candidateFile, "utf8");
  const candidateDigest = fileDigest(candidateFile);
  const releaseEvidenceRef = "release-evidence-gate-reports/001-web-preview.md";
  const releaseEvidenceFile = path.join(root, releaseEvidenceRef);
  const releaseEvidenceText = fs.readFileSync(releaseEvidenceFile, "utf8")
    .replaceAll("git:1111111111111111111111111111111111111111", revision);
  fs.writeFileSync(releaseEvidenceFile, releaseEvidenceText);
  rewriteMachineEvidence(releaseEvidenceFile, (evidence) => {
    evidence.release_scope.source_revision = revision;
    evidence.release_scope.release_candidate_digest = candidateDigest;
    evidence.release_evidence_digest = evidenceDigest(evidence, ["release_evidence_digest"]);
    return evidence;
  });
  const releaseEvidenceCheck = runNode([
    "scripts/check-release-evidence-gate.mjs", root, "--report", releaseEvidenceRef,
    "--require-report", "--require-structured-evidence", "--require-ready", "--strict-source-binding",
  ]);
  if (releaseEvidenceCheck.status !== 0) {
    fail(`1.93 release trust fixture Release Evidence failed: ${releaseEvidenceCheck.stderr || releaseEvidenceCheck.stdout}`);
    return;
  }

  const runtimeRef = "runtime-hygiene-reports/001-release-ready.md";
  fs.mkdirSync(path.join(root, "runtime-hygiene-reports"), { recursive: true });
  const runtimeResolve = runNode([
    "scripts/resolve-runtime-hygiene.mjs", root,
    "--operation", "release",
    "--release-lane", "PREFLIGHT_ONLY",
    "--release-event", "evidence/release-preflight.txt",
    "--release-event-ref", "artifact:evidence/release-preflight.txt",
    "--release-candidate-ref", `artifact:${candidateRef}`,
    "--release-candidate-digest", candidateDigest,
    "--source-revision", revision,
    "--out", runtimeRef,
  ]);
  if (runtimeResolve.status !== 0) {
    fail(`1.93 release trust fixture Runtime Hygiene resolver failed: ${runtimeResolve.stderr || runtimeResolve.stdout}`);
    return;
  }
  const runtimeCheck = runNode([
    "scripts/check-runtime-hygiene.mjs", root, "--report", runtimeRef,
    "--require-report", "--require-structured-evidence", "--require-runtime-sources",
  ]);
  if (runtimeCheck.status !== 0) {
    fail(`1.93 release trust fixture Runtime Hygiene failed: ${runtimeCheck.stderr || runtimeCheck.stdout}`);
    return;
  }

  const channelRef = "release-channel-policies/001-current-preview.md";
  fs.mkdirSync(path.join(root, "release-channel-policies"), { recursive: true });
  const channelResolve = runNode([
    "scripts/resolve-release-channel-policy.mjs", root,
    "--intent", "select source-only preview release channel",
    "--project-type", "existing_project",
    "--channel", "source_only",
    "--recommendation-class", "KEEP_EXISTING_APPROVED_CHANNEL",
    "--release-owner-ref", "human:release-owner",
    "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable",
    "--package-digest-or-id", "not_applicable",
    "--release-candidate-ref", `artifact:${candidateRef}`,
    "--release-evidence-gate-ref", `file:${releaseEvidenceRef}`,
    "--runtime-hygiene-ref", `file:${runtimeRef}`,
    "--project-sop-ref", "file:docs/release-sop.md",
    "--out", channelRef,
  ]);
  if (channelResolve.status !== 0) {
    fail(`1.93 release trust fixture Release Channel resolver failed: ${channelResolve.stderr || channelResolve.stdout}`);
    return;
  }
  const channelCheck = runNode([
    "scripts/check-release-channel-policy.mjs", root, "--report", channelRef,
    "--require-report", "--require-structured-evidence", "--strict-source-binding",
  ]);
  if (channelCheck.status !== 0) {
    fail(`1.93 release trust fixture Release Channel failed: ${channelCheck.stderr || channelCheck.stdout}`);
    return;
  }

  const approvalRef = "release-approval-records/001-preview.md";
  fs.mkdirSync(path.join(root, "release-approval-records"), { recursive: true });
  const approval = {
    schema_version: "1.93.0",
    artifact_type: "release_approval_record",
    artifact_id: "preview-release-approval",
    release_approval_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    release_candidate: {
      release_target: "preview",
      candidate_ref: `artifact:${candidateRef}`,
      candidate_digest: candidateDigest,
      source_revision: revision,
      package_identity_type: "none",
      package_identity_ref: "not_applicable",
      package_identity_digest_or_id: "not_applicable",
    },
    trust_sources: {
      release_evidence_gate: { ref: `artifact:${releaseEvidenceRef}`, digest: fileDigest(releaseEvidenceFile) },
      runtime_hygiene: { ref: `artifact:${runtimeRef}`, digest: fileDigest(path.join(root, runtimeRef)) },
      release_channel_policy: { ref: `artifact:${channelRef}`, digest: fileDigest(path.join(root, channelRef)) },
      platform_recipe: { required: "No", ref: "N/A", digest: "N/A" },
      release_handoff_pack: { required: "No", ref: "N/A", digest: "N/A" },
    },
    release_controls: {
      release_owner_ref: "human:release-owner",
      release_sop_ref: "artifact:docs/release-sop.md",
      release_sop_digest: fileDigest(path.join(root, "docs/release-sop.md")),
      rollback_ref: "artifact:evidence/rollback-current.md",
      rollback_digest: fileDigest(path.join(root, "evidence/rollback-current.md")),
      monitoring_ref: "artifact:evidence/monitoring-current.md",
      monitoring_digest: fileDigest(path.join(root, "evidence/monitoring-current.md")),
      post_release_smoke_ref: "artifact:evidence/post-release-smoke-current.md",
      post_release_smoke_digest: fileDigest(path.join(root, "evidence/post-release-smoke-current.md")),
    },
    human_approval: {
      approval_status: "APPROVED",
      approval_owner_type: "HUMAN",
      approved_by: "Release Owner Dana",
      approved_at: "2026-07-10T10:00:00Z",
      expires_at: "2099-12-31T23:59:00Z",
      approved_scope: "Preview release candidate review and bounded low-risk assistance only.",
    },
    allowed_codex_actions: ["VERIFY", "BUILD", "EVIDENCE_CAPTURE", "HANDOFF_PREPARATION", "POST_RELEASE_READ_ONLY_SMOKE"],
    blocked_actions: ["PRODUCTION_DEPLOY", "STORE_SUBMISSION", "MINI_PROGRAM_RELEASE", "PRODUCTION_MIGRATION", "SECRETS", "DNS", "PAYMENT", "PERMISSIONS", "PRODUCTION_CONFIG", "ROLLBACK_EXECUTION"],
    boundaries: {
      codex_release_owner: "No",
      automatic_production_deploy: "No",
      codex_store_or_mini_program_submission: "No",
      codex_high_risk_production_changes: "No",
      proves_product_or_production_safety: "No",
    },
    outcome: "RELEASE_APPROVAL_VALID",
  };
  approval.release_approval_digest = evidenceDigest(approval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, approvalRef), [
    "# Release Approval Record: preview-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(approval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const approvalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", approvalRef,
    "--require-structured-evidence", "--require-approved",
  ]);
  if (approvalCheck.status !== 0) {
    fail(`1.93 release trust fixture approval failed: ${approvalCheck.stderr || approvalCheck.stdout}`);
    return;
  }
  pass("1.93 current project-bound Release Approval Record passes strict authority chain");

  const closureRef = "closure-decisions/001-contract-input-rule.md";
  const launchViewRef = "launch-review-views/001-preview-ready.md";
  fs.mkdirSync(path.join(root, "launch-review-views"), { recursive: true });
  const launchViewEvidence = {
    schema_version: "1.98.1",
    artifact_type: "launch_review_view",
    artifact_id: "preview-launch-review",
    launch_review_digest: "sha256:pending",
    project_identity: projectIdentity(root),
    intent: "prepare preview release handoff",
    closure_input: {
      ref: `artifact:${closureRef}`,
      digest: fileDigest(path.join(root, closureRef)),
      decision: "DONE",
      can_count_as_done: "Yes",
      durable: "Yes",
    },
    safe_launch_label: "READY_FOR_RELEASE_REVIEW",
    launch_review_can_proceed: "Yes",
    surfaces: {
      environment: "PASS",
      monitoring: "PASS",
      rollback: "PASS",
      release_ownership: "PASS",
      post_launch_smoke: "PASS",
    },
    surface_evidence: {
      environment: { ref: "docs/release-sop.md", digest: fileDigest(path.join(root, "docs/release-sop.md")) },
      monitoring: { ref: "evidence/monitoring-current.md", digest: fileDigest(path.join(root, "evidence/monitoring-current.md")) },
      rollback: { ref: "evidence/rollback-current.md", digest: fileDigest(path.join(root, "evidence/rollback-current.md")) },
      release_ownership: { ref: "human:release-owner", digest: "N/A" },
      post_launch_smoke: { ref: "evidence/post-release-smoke-current.md", digest: fileDigest(path.join(root, "evidence/post-release-smoke-current.md")) },
    },
    boundaries: {
      approves_release: "No",
      executes_release: "No",
      changes_production: "No",
      replaces_closure: "No",
    },
    outcome: "LAUNCH_REVIEW_VIEW_RECORDED",
  };
  launchViewEvidence.launch_review_digest = evidenceDigest(launchViewEvidence, ["launch_review_digest"]);
  fs.writeFileSync(path.join(root, launchViewRef), [
    "# Launch Review View", "", "## Human Summary", "", "Launch review view: READY_FOR_RELEASE_REVIEW", "",
    "## Unified Closure Input", "", "| Field | Value |", "|---|---|", "| Closure Decision | `DONE` |", "| Can count as done | Yes |", "",
    "## Safe Launch View", "", "| Field | Value |", "|---|---|", "| Safe Launch Label | `READY_FOR_RELEASE_REVIEW` |", "| Launch review can proceed | Yes |", "| Release approval | No |", "",
    "## Platform View", "", "| Field | Value |", "|---|---|", "| Platform | `web` |", "",
    "## Launch Surface Gaps", "", "| Surface | Status | Evidence / Decision | Finding |", "|---|---|---|---|",
    "| Environment | `PASS` | docs/release-sop.md | ready |", "| Monitoring | `PASS` | evidence/monitoring-current.md | ready |",
    "| Rollback | `PASS` | evidence/rollback-current.md | ready |", "| Release ownership | `PASS` | human:release-owner | ready |",
    "| Post-launch smoke | `PASS` | evidence/post-release-smoke-current.md | ready |", "",
    "## Human Release Decisions", "", "Human release approval remains external.", "", "## Evidence Map", "", "Current project evidence only.", "",
    "## Recommended Next Step", "", "Hand off to the human release owner.", "", "## Boundaries", "",
    "- This view writes target files: No", "- This view deploys, publishes, or submits release: No", "- This view approves release or production: No",
    "- This view modifies CI/CD or hooks: No", "- This view changes production config, secrets, DNS, app-store state, payment, permissions, or migrations: No",
    "- This view replaces Unified Closure: No", "- This view replaces Safe Launch: No", "- This view replaces project release SOPs: No",
    "- This view approves security/privacy/compliance/legal/tax/finance/payment decisions: No", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(launchViewEvidence, null, 2), "```", "", "## Outcome", "", "`LAUNCH_REVIEW_VIEW_RECORDED`", "",
  ].join("\n"));

  const launchViewCheck = runNode([
    "scripts/check-launch-review-view.mjs", root,
    "--report", launchViewRef,
    "--require-structured-evidence",
  ]);
  if (launchViewCheck.status !== 0) {
    fail(`1.93 strict Launch Review fixture failed before Release Execution: ${launchViewCheck.stderr || launchViewCheck.stdout}`);
    return;
  }
  pass("1.98 Launch Review consumes an exact strictly validated Unified Closure chain");

  const executionRef = "release-execution-plans/001-preview.md";
  fs.mkdirSync(path.join(root, "release-execution-plans"), { recursive: true });
  const executionResolve = runNode([
    "scripts/resolve-release-execution.mjs", root,
    "--intent", "prepare preview release handoff",
    "--mode", "ASSISTED_EXECUTION",
    "--approval-ref", `artifact:${approvalRef}`,
    "--launch-view-ref", `artifact:${launchViewRef}`,
  ]);
  fs.writeFileSync(path.join(root, executionRef), executionResolve.stdout);
  const executionCheck = runNode([
    "scripts/check-release-execution.mjs", root, "--report", executionRef, "--require-release-trust",
  ]);
  if (executionResolve.status !== 0 || executionCheck.status !== 0 || !executionResolve.stdout.includes("READY_FOR_ASSISTED_EXECUTION")) {
    fail(`1.93 trusted Release Execution failed: ${executionResolve.stderr || executionCheck.stderr || executionCheck.stdout}`);
    return;
  }
  pass("1.93 Release Execution consumes the exact strict release authority chain");

  const missingLaunch = runNode([
    "scripts/resolve-release-execution.mjs", root,
    "--intent", "prepare preview release handoff",
    "--mode", "ASSISTED_EXECUTION",
    "--approval-ref", `artifact:${approvalRef}`,
  ]);
  if (missingLaunch.status === 0
    && missingLaunch.stdout.includes("BLOCKED_PENDING_LAUNCH_REVIEW")
    && !missingLaunch.stdout.includes("READY_FOR_ASSISTED_EXECUTION")) {
    pass("1.98 approval cannot substitute for an independent Launch Review View");
  } else {
    fail(`1.98 missing Launch Review must block release execution: ${missingLaunch.stderr || missingLaunch.stdout}`);
  }

  const weakRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-weak-approval-"));
  fs.mkdirSync(path.join(weakRoot, "release-execution-plans"), { recursive: true });
  const weakResolve = runNode([
    "scripts/resolve-release-execution.mjs", weakRoot,
    "--intent", "prepare release", "--mode", "ASSISTED_EXECUTION", "--approval-status", "APPROVED",
  ]);
  fs.writeFileSync(path.join(weakRoot, "release-execution-plans/001.md"), weakResolve.stdout);
  const weakCheck = runNode(["scripts/check-release-execution.mjs", weakRoot, "--require-release-trust"]);
  if (weakCheck.status !== 0 && weakResolve.stdout.includes("BLOCKED_PENDING_LAUNCH_REVIEW")) pass("1.93 self-declared CLI approval cannot unlock Release Execution");
  else fail(`1.93 weak CLI approval must fail closed: ${weakCheck.stderr || weakCheck.stdout}`);

  const copiedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.93-copied-approval-"));
  fs.mkdirSync(path.join(copiedRoot, "release-approval-records"), { recursive: true });
  fs.copyFileSync(path.join(root, approvalRef), path.join(copiedRoot, approvalRef));
  const copiedCheck = runNode(["scripts/check-release-approval-record.mjs", copiedRoot, "--report", approvalRef, "--require-approved"]);
  if (copiedCheck.status !== 0 && `${copiedCheck.stdout}\n${copiedCheck.stderr}`.includes("project_identity")) pass("1.93 copied release approval is rejected");
  else fail(`1.93 copied release approval must be rejected: ${copiedCheck.stderr || copiedCheck.stdout}`);

  const unsafeApprovalRef = "release-approval-records/002-unsafe-action.md";
  const unsafeApproval = structuredClone(approval);
  unsafeApproval.artifact_id = "unsafe-release-approval";
  unsafeApproval.allowed_codex_actions.push("PRODUCTION_DEPLOY");
  unsafeApproval.release_approval_digest = evidenceDigest(unsafeApproval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, unsafeApprovalRef), [
    "# Release Approval Record: unsafe-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(unsafeApproval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const unsafeApprovalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", unsafeApprovalRef, "--require-approved",
  ]);
  if (unsafeApprovalCheck.status !== 0 && `${unsafeApprovalCheck.stdout}\n${unsafeApprovalCheck.stderr}`.includes("allowed_codex_actions")) pass("1.93 approval cannot assign high-risk release actions to Codex");
  else fail(`1.93 high-risk Codex release action must be rejected: ${unsafeApprovalCheck.stderr || unsafeApprovalCheck.stdout}`);

  const expiredApprovalRef = "release-approval-records/003-expired.md";
  const expiredApproval = structuredClone(approval);
  expiredApproval.artifact_id = "expired-release-approval";
  expiredApproval.human_approval.expires_at = "2020-01-01T00:00:00Z";
  expiredApproval.release_approval_digest = evidenceDigest(expiredApproval, ["release_approval_digest"]);
  fs.writeFileSync(path.join(root, expiredApprovalRef), [
    "# Release Approval Record: expired-release-approval", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(expiredApproval, null, 2), "```", "", "## Outcome", "", "`RELEASE_APPROVAL_VALID`", "",
  ].join("\n"));
  const expiredApprovalCheck = runNode([
    "scripts/check-release-approval-record.mjs", root, "--report", expiredApprovalRef, "--require-approved",
  ]);
  if (expiredApprovalCheck.status !== 0 && `${expiredApprovalCheck.stdout}\n${expiredApprovalCheck.stderr}`.includes("expired")) pass("1.93 expired release approval is rejected");
  else fail(`1.93 expired release approval must be rejected: ${expiredApprovalCheck.stderr || expiredApprovalCheck.stdout}`);

  fs.appendFileSync(candidateFile, "\nCandidate changed after approval.\n");
  const staleCandidateCheck = runNode(["scripts/check-release-approval-record.mjs", root, "--report", approvalRef, "--require-approved"]);
  if (staleCandidateCheck.status !== 0 && `${staleCandidateCheck.stdout}\n${staleCandidateCheck.stderr}`.includes("release candidate digest")) pass("1.93 candidate drift invalidates release approval");
  else fail(`1.93 candidate drift must invalidate approval: ${staleCandidateCheck.stderr || staleCandidateCheck.stdout}`);
  fs.writeFileSync(candidateFile, candidateOriginal);

  const headChange = spawnSync("git", ["-C", root, "commit", "--allow-empty", "-m", "revision changed"], { encoding: "utf8" });
  const staleRevisionCheck = runNode(["scripts/check-release-approval-record.mjs", root, "--report", approvalRef, "--require-approved"]);
  if (headChange.status === 0 && staleRevisionCheck.status !== 0 && `${staleRevisionCheck.stdout}\n${staleRevisionCheck.stderr}`.includes("project_identity")) pass("1.93 project revision change invalidates release approval");
  else fail(`1.93 project revision drift must invalidate approval: ${headChange.stderr || staleRevisionCheck.stderr || staleRevisionCheck.stdout}`);
}

function checkBaselineManifestPublicEntryConsolidationProtocol() {
  const plan = read("docs/plans/baseline-manifest-public-entry-consolidation-1.94-plan.md");
  for (const marker of [
    "BL1_STANDARD",
    "Managed IntentOS assets",
    "controlled init/update plan",
    "real schema validation",
    "The user is not expected",
  ]) {
    if (plan.toLowerCase().includes(marker.toLowerCase())) pass(`1.94 plan includes ${marker}`);
    else fail(`1.94 plan missing ${marker}`);
  }

  const bl1Root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-bl1-"));
  fs.mkdirSync(path.join(bl1Root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(bl1Root, "docs/baseline-selection.md"), "# Baseline Selection\n\n## Baseline Level\n\nBL1_STANDARD\n");
  const bl1Check = runNode(["scripts/check-baseline-enforcement.mjs", bl1Root, "--json"]);
  let bl1Evidence = null;
  try { bl1Evidence = JSON.parse(bl1Check.stdout); } catch {}
  if (bl1Check.status === 0 && bl1Evidence?.baselineLevel === "BL1") pass("1.94 BL1_STANDARD is enforced as BL1");
  else fail(`1.94 BL1_STANDARD classification failed: ${bl1Check.stderr || bl1Check.stdout}`);

  const managedSignalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-managed-signals-"));
  fs.mkdirSync(path.join(managedSignalRoot, ".intentos", "managed-web-app"), { recursive: true });
  fs.writeFileSync(path.join(managedSignalRoot, ".intentos/managed-web-app/package.json"), JSON.stringify({ dependencies: { react: "1.0.0" } }));
  const signalCheck = runNode(["scripts/baseline-project.mjs", managedSignalRoot, "--json"]);
  let signalEvidence = null;
  try { signalEvidence = JSON.parse(signalCheck.stdout); } catch {}
  if (signalCheck.status === 0 && signalEvidence?.detectedProfileCandidates?.every((item) => item.id !== "web-app")) {
    pass("1.94 managed .intentos assets do not classify the host platform");
  } else {
    fail(`1.94 managed asset signal isolation failed: ${signalCheck.stderr || signalCheck.stdout}`);
  }

  const bl2Root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-bl2-missing-pack-"));
  fs.mkdirSync(bl2Root, { recursive: true });
  const bl2Plan = path.join(bl2Root, "apply-execution-plans", `intentos-1.94-bl2-${Date.now()}.json`);
  const bl2Check = runNode([
    "scripts/init-project.mjs", "--starter", "codex-web-app", "--target", bl2Root,
    "--profiles", "web-app", "--baseline-level", "BL2_INDUSTRIAL", "--write-plan", path.relative(bl2Root, bl2Plan),
  ]);
  if (bl2Check.status !== 0 && `${bl2Check.stdout}\n${bl2Check.stderr}`.includes("requires at least one concrete selected industrial pack")) {
    pass("1.94 BL2 without a concrete industrial pack fails closed");
  } else {
    fail(`1.94 BL2 missing-pack path must fail: ${bl2Check.stderr || bl2Check.stdout}`);
  }

  const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-legacy-baseline-"));
  const legacyPlan = path.join(legacyRoot, "baseline-plan.json");
  fs.writeFileSync(legacyPlan, JSON.stringify({
    planType: "BASELINE_WRITE_PLAN",
    targetRoot: legacyRoot,
    writes: [{ path: "docs/should-not-exist.md", content: "forbidden legacy write" }],
  }));
  const legacyApply = runNode(["scripts/baseline-project.mjs", "--apply-plan", legacyPlan]);
  if (legacyApply.status !== 0 && !fs.existsSync(path.join(legacyRoot, "docs/should-not-exist.md"))) {
    pass("1.94 retired direct baseline apply performs no target write");
  } else {
    fail("1.94 retired direct baseline apply wrote a target file");
  }

  const outsideProposal = path.join(path.dirname(legacyRoot), `${path.basename(legacyRoot)}-outside.json`);
  const unsafeProposal = runNode([
    "scripts/baseline-project.mjs", legacyRoot, "--write-plan", `../${path.basename(outsideProposal)}`,
  ]);
  if (unsafeProposal.status !== 0 && !fs.existsSync(outsideProposal)) {
    pass("1.94 baseline proposal output cannot escape the target project");
  } else {
    fail("1.94 baseline proposal output escaped the target project");
  }

  const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-1.94-install-"));
  const installPlan = path.join(installRoot, "apply-execution-plans", `intentos-1.94-install-${Date.now()}.json`);
  const planResult = runNode([
    "scripts/init-project.mjs", "--starter", "codex-web-app", "--target", installRoot,
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD", "--write-plan", path.relative(installRoot, installPlan),
  ]);
  if (planResult.status !== 0) {
    fail(`1.94 controlled baseline plan generation failed: ${planResult.stderr || planResult.stdout}`);
    return;
  }
  const generatedPlan = JSON.parse(fs.readFileSync(installPlan, "utf8"));
  const generatedDocs = new Set(generatedPlan.actions
    .filter((action) => action.willWrite && typeof action.inlineContentBase64 === "string")
    .map((action) => action.path));
  if (["docs/project-profile.md", "docs/baseline-selection.md", "docs/baseline-evidence.md"].every((item) => generatedDocs.has(item))) {
    pass("1.94 controlled plan binds generated baseline records");
  } else {
    fail("1.94 controlled plan is missing generated baseline records");
  }
  const applyResult = runNode(approvedInitProjectApplyArgs(installPlan));
  if (applyResult.status !== 0) {
    fail(`1.94 controlled baseline apply failed: ${applyResult.stderr || applyResult.stdout}`);
    return;
  }
  const receiptPath = path.join(installRoot, generatedPlan.receiptPath);
  const heldReceiptPath = `${receiptPath}.held`;
  fs.renameSync(receiptPath, heldReceiptPath);
  const missingReceiptCheck = runNode(["scripts/check-baseline-installation.mjs", installRoot, "--require-selection"]);
  fs.renameSync(heldReceiptPath, receiptPath);
  if (missingReceiptCheck.status !== 0
    && `${missingReceiptCheck.stdout}\n${missingReceiptCheck.stderr}`.includes("no valid current-project Apply Receipt")) {
    pass("1.94 baseline installation fails closed without its exact Apply Receipt");
  } else {
    fail(`1.94 baseline installation accepted missing receipt evidence: ${missingReceiptCheck.stderr || missingReceiptCheck.stdout}`);
  }
  const installedCheck = runNode(["scripts/check-baseline-installation.mjs", installRoot, "--require-selection"]);
  if (installedCheck.status === 0) pass("1.94 controlled baseline installation is verifiable after apply");
  else fail(`1.94 baseline installation verification failed: ${installedCheck.stderr || installedCheck.stdout}`);
}

function checkOperatingModelConsolidationProtocol() {
  const plan = read("docs/plans/operating-model-consolidation-1.95-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const prWorkflow = read(".github/workflows/intentos-pr-checks.yml");
  const releaseWorkflow = read(".github/workflows/intentos-release-checks.yml");

  for (const marker of [
    "Project Entry",
    "Operating Loop",
    "Evidence Trace",
    "Authority Recommendation",
    "BL2 must not automatically classify every task as HIGH",
    "does not add a new governance authority",
  ]) {
    if (plan.includes(marker)) pass(`1.95 plan includes ${marker}`);
    else fail(`1.95 plan missing ${marker}`);
  }
  for (const marker of [
    "START_PROJECT",
    "CONTINUE_TASK",
    "CHECK_STATUS",
    "FINISH_TASK",
    "PREPARE_RELEASE",
    "ADOPT_PROJECT",
    "derived read-only view",
  ]) {
    if (`${core}\n${resolver}`.includes(marker)) pass(`1.95 operating model includes ${marker}`);
    else fail(`1.95 operating model missing ${marker}`);
  }
  if (usage.includes("cli.mjs work") && usage.includes("--help-advanced")) {
    pass("1.95 usage exposes one natural-language work entry and advanced maintenance help");
  } else {
    fail("1.95 usage must expose work and explicit advanced help");
  }
  for (const forbidden of ["evidence-graph-reports", "operating-state-reports", "authority-recommendation-records"]) {
    if (!read("intentos-manifest.json").includes(forbidden)) pass(`1.95 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.95 must not add parallel artifact directory ${forbidden}`);
  }
  if (prWorkflow.includes("CHECK_STATUS")
    && releaseWorkflow.includes("CHECK_STATUS")
    && prWorkflow.includes("Operating Decision status route failed")
    && releaseWorkflow.includes("Operating Decision status route failed")) {
    pass("1.95 PR and release CI assert the Operating Model route instead of only its exit code");
  } else {
    fail("1.95 PR and release CI must assert the CHECK_STATUS route");
  }
  if (releaseWorkflow.includes("Release tag matches package version")
    && releaseWorkflow.includes("GITHUB_REF_NAME")
    && releaseWorkflow.includes("package.json")) {
    pass("1.95 release CI enforces tag and package version parity");
  } else {
    fail("1.95 release CI must enforce tag and package version parity");
  }

  const tests = runNode(["--test", "tests/operating-model.test.mjs"]);
  if (tests.status === 0 && tests.stdout.includes("pass 34") && tests.stdout.includes("fail 0")) {
    pass("1.95 Operating Model and current decision-contract regression tests");
  } else {
    fail(`1.95 Operating Model tests failed: ${tests.stderr || tests.stdout}`);
  }
}

function checkOperatingDecisionContractProtocol() {
  const plan = read("docs/plans/operating-decision-contract-1.96-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const manifest = read("intentos-manifest.json");
  const workflows = `${read(".github/workflows/intentos-pr-checks.yml")}\n${read(".github/workflows/intentos-release-checks.yml")}`;

  for (const marker of [
    "Operating Decision Contract",
    "exactly one `actionCode`",
    "materialActionAuthorized",
    "sourceInputs",
    "Project Identity Projection belongs to 1.97",
    "Internal surface consolidation",
  ]) {
    if (plan.includes(marker)) pass(`1.96 plan includes ${marker}`);
    else fail(`1.96 plan missing ${marker}`);
  }
  for (const marker of [
    "operatingDecision",
    "PREPARE_PROJECT_PLAN",
    "INSPECT_TASK_RISK",
    "PREPARE_BUSINESS_RULE_CLOSURE",
    "COMPLETE_CLOSURE_EVIDENCE",
    "REPORT_TASK_COMPLETE",
    "materialActionAuthorized: \"No\"",
    "decisionDigest",
  ]) {
    if (`${core}\n${usage}\n${resolver}`.includes(marker)) pass(`1.96 Operating Decision includes ${marker}`);
    else fail(`1.96 Operating Decision missing ${marker}`);
  }
  for (const forbidden of ["operating-decision-reports", "decision-engine-reports", "authority-decision-records"]) {
    if (!manifest.includes(forbidden)) pass(`1.96 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.96 must not add parallel artifact directory ${forbidden}`);
  }
  if (workflows.includes("SUMMARIZE_CURRENT_STATUS")
    && workflows.includes("PREPARE_PROJECT_PLAN")
    && workflows.includes("materialActionAuthorized")) {
    pass("1.96 PR and release CI assert structured Operating Decisions");
  } else {
    fail("1.96 PR and release CI must assert structured Operating Decisions");
  }

  const operating = runNode(["scripts/cli.mjs", "work", ".", "检查当前项目状态", "--json"]);
  try {
    const parsed = JSON.parse(operating.stdout);
    const decision = parsed.operatingDecision;
    const sourceNames = new Set((parsed.sourceSystemTrace || []).map((source) => source.sourceSystem));
    if (operating.status === 0
      && parsed.schemaVersion === "1.99.0"
      && decision?.contractVersion === "1.99.0"
      && decision?.actionCode === "SUMMARIZE_CURRENT_STATUS"
      && decision?.materialActionAuthorized === "No"
      && parsed.humanSummary?.nextSafeAction === decision?.plainAction
      && Array.isArray(decision?.sourceInputs)
      && decision.sourceInputs.every((source) => sourceNames.has(source.sourceSystem))
      && decision.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest || ""))
      && /^sha256:[a-f0-9]{64}$/.test(decision?.decisionDigest || "")) {
      pass("1.96 work returns one traceable, non-authorizing Operating Decision");
    } else {
      fail(`1.96 work returned an invalid Operating Decision: ${operating.stderr || operating.stdout}`);
    }
  } catch (error) {
    fail(`1.96 work output is not valid JSON: ${error.message}`);
  }
}

function checkProjectIdentityProjectionProtocol() {
  const plan = read("docs/plans/project-identity-projection-1.97-plan.md");
  const core = read("core/operating-model.md");
  const usage = read("docs/operating-model.md");
  const resolver = read("scripts/resolve-operating-loop.mjs");
  const workflowNext = read("scripts/workflow-next.mjs");
  const manifest = read("intentos-manifest.json");
  const workflows = `${read(".github/workflows/intentos-pr-checks.yml")}\n${read(".github/workflows/intentos-release-checks.yml")}`;

  for (const marker of [
    "Project Identity Projection",
    "Evidence Authority keeps responsibility",
    "NO_PRODUCTION_EVIDENCE",
    "Operating Decision Binding",
    "Internal command and source-system surface consolidation belongs to 1.98",
  ]) {
    if (plan.includes(marker)) pass(`1.97 plan includes ${marker}`);
    else fail(`1.97 plan missing ${marker}`);
  }
  for (const marker of [
    "projectIdentityProjection",
    "projectKind",
    "governancePosture",
    "productionPosture",
    "worktreePosture",
    "evidenceIdentity",
    "projectionDigest",
    "grantsAuthority: \"No\"",
  ]) {
    if (`${core}\n${usage}\n${resolver}`.includes(marker)) pass(`1.97 Project Identity Projection includes ${marker}`);
    else fail(`1.97 Project Identity Projection missing ${marker}`);
  }
  if (workflowNext.includes("selectedProfiles: platformBaseline.selectedProfiles")) {
    pass("1.97 Workflow Next exposes selected profiles as structured source data");
  } else {
    fail("1.97 Workflow Next must expose selected profiles as structured source data");
  }
  for (const forbidden of ["project-identity-reports", "project-projection-reports", "project-classification-records"]) {
    if (!manifest.includes(forbidden)) pass(`1.97 does not add parallel artifact directory ${forbidden}`);
    else fail(`1.97 must not add parallel artifact directory ${forbidden}`);
  }
  if (workflows.includes("projectIdentityProjection")
    && workflows.includes("INTENTOS_SOURCE")
    && workflows.includes("NOT_ESTABLISHED")
    && workflows.includes("grantsAuthority")) {
    pass("1.97 PR and release CI assert source and generated Project Identity projections");
  } else {
    fail("1.97 PR and release CI must assert source and generated Project Identity projections");
  }

  const operating = runNode(["scripts/cli.mjs", "work", ".", "检查当前项目状态", "--json"]);
  try {
    const parsed = JSON.parse(operating.stdout);
    const projection = parsed.projectIdentityProjection;
    const actualIdentity = projectIdentity(kitRoot);
    if (operating.status === 0
      && parsed.schemaVersion === "1.99.0"
      && projection?.contractVersion === "1.98.1"
      && projection?.projectKind === "INTENTOS_SOURCE"
      && projection?.governancePosture === "INTENTOS_SOURCE_GOVERNANCE"
      && projection?.evidenceIdentity?.fingerprint === actualIdentity.fingerprint
      && projection?.evidenceIdentity?.revision === actualIdentity.revision
      && projection?.grantsAuthority === "No"
      && projection?.writesProjectFiles === "No"
      && Array.isArray(projection?.sourceInputs)
      && projection.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest || ""))
      && /^sha256:[a-f0-9]{64}$/.test(projection?.projectionDigest || "")
      && parsed.operatingDecision?.contractVersion === "1.99.0"
      && /^sha256:[a-f0-9]{64}$/.test(parsed.operatingDecision?.decisionDigest || "")
      && parsed.humanSummary?.projectIdentity
      && !Object.hasOwn(projection, "changedFilesSample")) {
      pass("1.97 work returns one current, traceable, non-authorizing Project Identity Projection");
    } else {
      fail(`1.97 work returned an invalid Project Identity Projection: ${operating.stderr || operating.stdout}`);
    }
  } catch (error) {
    fail(`1.97 work output is not valid JSON: ${error.message}`);
  }
}

function checkZeroExperienceSoloOperatingModelProtocol() {
  const required = [
    "core/zero-experience-solo-operating-model.md",
    "docs/plans/zero-experience-solo-operating-model-1.99-plan.md",
    "scripts/lib/solo-operating-model.mjs",
    "scripts/check-solo-operating-model.mjs",
    "releases/1.99.0/release-record.md",
    "releases/1.99.0/known-limitations.md",
    "releases/1.99.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.99 solo operating-model asset exists: ${file}`);
    else fail(`1.99 solo operating-model asset missing: ${file}`);
  }

  const combined = [
    read("core/zero-experience-solo-operating-model.md"),
    read("docs/plans/zero-experience-solo-operating-model-1.99-plan.md"),
    read("scripts/lib/solo-operating-model.mjs"),
    read("scripts/resolve-operating-loop.mjs"),
    read("scripts/resolve-beginner-entry.mjs"),
    read("platforms/codex/AGENTS.template.md"),
    read("templates/approval-record.md"),
    read("README.md"),
    read("README.zh-CN.md"),
  ].join("\n");
  for (const marker of [
    "ZERO_EXPERIENCE_SOLO_DEVELOPER",
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
    "technicalDecisionRequiredFromUser",
    "internalRoleSelectionRequiredFromUser",
    "capabilityCoverage",
    "CURRENT_CONVERSATION_USER",
    "Silence is not consent",
  ]) {
    if (combined.includes(marker)) pass(`1.99 solo operating model includes ${marker}`);
    else fail(`1.99 solo operating model missing ${marker}`);
  }

  const checker = runNode(["scripts/check-solo-operating-model.mjs"]);
  if (checker.status === 0 && checker.stdout.includes("Zero-experience solo operating model check passed")) {
    pass("1.99 zero-experience solo operating-model checker");
  } else {
    fail(`1.99 zero-experience solo operating-model checker failed: ${checker.stderr || checker.stdout}`);
  }
}

function checkReviewContextAuthorityProtocol() {
  const required = [
    "core/review-context-authority.md",
    "core/review-context-authority.json",
    "docs/plans/review-context-authority-1.99.1-plan.md",
    "docs/plans/review-context-enforcement-1.99.2-plan.md",
    "scripts/lib/review-context-authority.mjs",
    "scripts/check-review-context-authority.mjs",
    "tests/review-context-authority.test.mjs",
    "releases/1.99.1/release-record.md",
    "releases/1.99.1/known-limitations.md",
    "releases/1.99.1/self-check-report.md",
    "releases/1.99.2/release-record.md",
    "releases/1.99.2/known-limitations.md",
    "releases/1.99.2/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.99.2 review-context authority asset exists: ${file}`);
    else fail(`1.99.2 review-context authority asset missing: ${file}`);
  }

  const combined = [
    read("core/review-context-authority.md"),
    read("core/review-context-authority.json"),
    read("prompts/reviewer-agent.md"),
    read("templates/gpt-review-prompt.md"),
    read("platforms/codex/AGENTS.template.md"),
    read("starters/codex-web-app/AGENTS.md"),
    read("README.md"),
    read("README.zh-CN.md"),
  ].join("\n");
  for (const marker of [
    "CURRENT_PRODUCT_CONTRACT",
    "COMPATIBILITY_SCHEMA",
    "HISTORICAL_RECORD",
    "UNCLASSIFIED",
    "CONFLICTING",
    "ZERO_EXPERIENCE_SOLO_DEVELOPER",
    "North-Star Alignment",
    "Compatibility / History Notes",
    "CURRENT_CONVERSATION_USER",
    "Industrial depth does not imply",
  ]) {
    if (combined.includes(marker)) pass(`1.99.2 review-context authority includes ${marker}`);
    else fail(`1.99.2 review-context authority missing ${marker}`);
  }

  const checker = runNode(["scripts/check-review-context-authority.mjs"]);
  if (checker.status === 0 && checker.stdout.includes("Review context authority check passed")) {
    pass("1.99.2 review-context authority checker");
  } else {
    fail(`1.99.2 review-context authority checker failed: ${checker.stderr || checker.stdout}`);
  }

  const tests = runNode(["--test", "tests/review-context-authority.test.mjs"]);
  if (tests.status === 0) pass("1.99.2 review-context authority regression tests");
  else fail(`1.99.2 review-context authority regression tests failed: ${tests.stderr || tests.stdout}`);
}

checkRequiredFiles();
checkDefaultStarter();
checkVersionMetadata();
checkIntentOSFirstPartyCi();
checkOneDotZeroReleaseEvidence();
checkManifestProtocol();
checkIntentOSNamingHardcut();
checkCliFrontDoor();
checkCorePurity();
checkGuidedAdoptionEntry();
checkEngineeringBaselineProtocol();
checkReviewLoopProtocol();
checkNextStepBoundaryProtocol();
checkGoalModeProtocol();
checkSubagentOrchestrationProtocol();
checkOutputExperienceProtocol();
checkGuidedDecisionDeliveryLoopProtocol();
checkGovernanceHardeningDriftGuardProtocol();
checkChangeBoundaryBaselineStateProtocol();
checkBaselinePackSystemProtocol();
checkStandardBaselinePackRegistryProtocol();
checkGuidedBaselineSelectionEntryProtocol();
checkGuidedBaselineSelectionCalibrationProtocol();
checkBaselineSelectionPrecisionCalibrationProtocol();
checkGuidedDeliveryBaselineProtocol();
checkProjectMemoryContextGovernanceProtocol();
checkSafeLaunchProtocol();
checkConversationDriftProtocol();
checkFirstDeliveryWalkthroughProtocol();
checkRealAdoptionAndPatchClassificationProtocol();
checkExistingProjectWorkflowAdapterProtocol();
checkNativeFirstMigrationProtocol();
checkExistingRuleReconciliationProtocol();
checkGovernanceConvergenceProtocol();
checkAdoptionExecutionAssuranceProtocol();
checkExistingProjectAdoptionAutopilotProtocol();
checkControlledNativeAdoptionReviewProtocol();
checkTaskGovernanceProtocol();
checkWorkQueueTakeoverProtocol();
checkTaskGovernanceConsumerIntegrationProtocol();
checkRuntimeHygieneProtocol();
checkExecutionAssuranceChainProtocol();
checkDocumentLifecycleProtocol();
checkDocumentArchiveApplyProtocol();
checkUnifiedApplyPlanProtocol();
checkControlledApplyReadinessProtocol();
checkApprovalRecordGovernanceProtocol();
checkBeginnerEntryProtocol();
checkConversationNativeAskProtocol();
checkWorkQueueProtocol();
checkHookOrchestrationProtocol();
checkHookPolicyProtocol();
checkNaturalLanguageOrchestratorProtocol();
checkReviewSurfaceGovernanceProtocol();
checkBusinessRuleClosureProtocol();
checkChangeImpactCoverageProtocol();
checkVerificationPlanGovernanceProtocol();
checkTestEvidenceBindingProtocol();
checkCompletionEvidenceGateProtocol();
checkReleaseEvidenceGateProtocol();
checkReleaseChannelDecouplingProtocol();
checkPlanReviewGateProtocol();
checkSafetyEvidenceHardeningProtocol();
checkUserDeliveryConsoleProtocol();
checkDeliveryPathGovernanceProtocol();
checkDebtKnowledgeHandoffProtocol();
checkUnifiedClosureModelProtocol();
checkExecutionTruthHardcutProtocol();
checkEvidenceAuthorityCoreProtocol();
checkApplyAdoptionClosureProtocol();
checkReleaseTrustClosureProtocol();
checkBaselineManifestPublicEntryConsolidationProtocol();
checkOperatingModelConsolidationProtocol();
checkOperatingDecisionContractProtocol();
checkProjectIdentityProjectionProtocol();
checkReviewContextAuthorityProtocol();
checkZeroExperienceSoloOperatingModelProtocol();
checkDecisionExplainTraceProtocol();
checkLaunchReviewViewProtocol();
checkReleaseAdapterProtocol();
checkReleaseGuideProtocol();
checkPlatformReleaseRecipeProtocol();
checkReleaseHandoffPackProtocol();
checkReleaseExecutionProtocol();
checkReleasePlanProtocol();
checkGuidedClosureExperienceProtocol();
checkExecutionReviewClosureProtocol();
checkOrdinaryUserProductLoopProtocol();
checkProfiles();
checkIndustrialPacks();
checkIndustrialBaselineResolver();
checkStarters();
checkPlatformAdapters();
checkScriptSyntax();
checkReadmePointers();
checkFixtureSuite();
checkReviewLoopL2DogfoodExample();
checkGoalSubagentL2FeatureExample();
checkWebBl2ExampleArtifacts();
checkMiniProgramBl2ExampleArtifacts();
checkGeneratedProjectE2E();

if (failed) {
  process.exit(1);
}

console.log("");
console.log("IntentOS self-check passed.");
