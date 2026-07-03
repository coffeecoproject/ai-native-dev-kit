#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { sourceRequiredPaths } from "./lib/manifest.mjs";
import { walkFiles as walkProjectFiles } from "./lib/project-signals.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";

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

function walkSourceFiles(dir) {
  return walkProjectFiles(path.join(kitRoot, dir));
}

function checkRequiredFiles() {
  const required = sourceRequiredPaths(kitRoot, { fallback: [
    "README.md",
    "README.zh-CN.md",
    "LICENSE.md",
    "VERSION.md",
    "package.json",
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
    "dev-kit-manifest.json",
    "schemas/dev-kit-manifest.schema.json",
    ".github/workflows/dev-kit-pr-checks.yml",
    ".github/workflows/dev-kit-release-checks.yml",
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
    "templates/dev-kit-change-proposal.md",
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
    "scripts/check-dev-kit.mjs",
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
  if (workflowVersion.devKitVersion === version) {
    pass("templates/workflow-version.json matches current version");
  } else {
    fail(`templates/workflow-version.json version ${workflowVersion.devKitVersion} does not match ${version}`);
  }

  const packageVersion = JSON.parse(read("package.json")).version;
  if (packageVersion === version) {
    pass("package.json matches current version");
  } else {
    fail(`package.json version ${packageVersion} does not match ${version}`);
  }

  const manifestVersion = JSON.parse(read("dev-kit-manifest.json")).devKitVersion;
  if (manifestVersion === version) {
    pass("dev-kit-manifest.json matches current version");
  } else {
    fail(`dev-kit-manifest.json version ${manifestVersion} does not match ${version}`);
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
    "scripts/lib/risk-surfaces.mjs",
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
    ".ai-native/profiles",
    ".ai-native/industrial-packs",
    ".ai-native/standard-baseline-packs",
    ".ai-native/dev-kit-manifest.json",
    ".ai-native/docs/artifact-decision-tree.md",
    ".ai-native/docs/first-hour.md",
    ".ai-native/docs/goal-subagent-usage.md",
    ".ai-native/docs/baseline-setup.md",
    ".ai-native/docs/guided-delivery-baseline.md",
    ".ai-native/docs/product-baseline.md",
    ".ai-native/docs/claim-control.md",
    ".ai-native/docs/project-memory.md",
    ".ai-native/docs/git-boundary.md",
    ".ai-native/docs/context-governance-usage.md",
    ".ai-native/docs/minimal-commit-set.md",
    ".ai-native/docs/safe-launch.md",
    ".ai-native/docs/conversation-drift-control.md",
    ".ai-native/docs/first-delivery-walkthrough.md",
    ".ai-native/docs/change-boundary.md",
    ".ai-native/docs/baseline-state.md",
    ".ai-native/docs/guided-delivery-check.md",
    ".ai-native/docs/standard-baseline-pack-registry.md",
    ".ai-native/docs/existing-project-workflow-adapter.md",
    ".ai-native/docs/document-lifecycle.md",
    ".ai-native/docs/beginner-entry.md",
    ".ai-native/docs/work-queue.md",
    ".ai-native/docs/hook-orchestration.md",
    ".ai-native/docs/hook-policy.md",
    ".ai-native/docs/natural-language-orchestrator.md",
    ".ai-native/docs/change-impact-coverage.md",
    ".ai-native/docs/context-governance-usage.md",
    ".ai-native/docs/minimal-commit-set.md",
    ".ai-native/docs/safe-launch.md",
    ".ai-native/docs/conversation-drift-control.md",
    ".ai-native/core/outcome-baseline.md",
    ".ai-native/core/product-baseline.md",
    ".ai-native/core/claim-control.md",
    ".ai-native/core/assumption-register.md",
    ".ai-native/core/context-governance.md",
    ".ai-native/core/git-boundary.md",
    ".ai-native/core/safe-launch.md",
    ".ai-native/core/conversation-drift-control.md",
    ".ai-native/core/first-delivery-walkthrough.md",
    ".ai-native/core/real-project-adoption-trial.md",
    ".ai-native/core/patch-classification.md",
    ".ai-native/core/existing-project-workflow-adapter.md",
    ".ai-native/core/document-lifecycle.md",
    ".ai-native/core/beginner-entry.md",
    ".ai-native/core/work-queue.md",
    ".ai-native/core/hook-orchestration.md",
    ".ai-native/core/natural-language-orchestrator.md",
    ".ai-native/core/unified-closure-model.md",
    ".ai-native/core/review-surface-governance.md",
    ".ai-native/core/change-impact-coverage.md",
    ".ai-native/core/change-boundary.md",
    ".ai-native/core/baseline-state.md",
    ".ai-native/core/standard-baseline-pack-registry.md",
    ".ai-native/core/safe-launch.md",
    ".ai-native/core/conversation-drift-control.md",
    ".ai-native/templates/learning-candidate.md",
    ".ai-native/templates/context-correction-report.md",
    ".ai-native/templates/git-boundary-report.md",
    ".ai-native/templates/launch-readiness-report.md",
    ".ai-native/templates/conversation-turn-classification.md",
    ".ai-native/templates/scope-change-report.md",
    ".ai-native/templates/adoption-trial-report.md",
    ".ai-native/templates/real-adoption-trial-report.md",
    ".ai-native/templates/patch-classification-report.md",
    ".ai-native/templates/workflow-adoption-map.md",
    ".ai-native/templates/document-lifecycle-report.md",
    ".ai-native/templates/beginner-entry-card.md",
    ".ai-native/templates/work-queue-report.md",
    ".ai-native/templates/hook-orchestration-plan.md",
    ".ai-native/templates/workflow-guidance-card.md",
    ".ai-native/templates/closure-decision.md",
    ".ai-native/templates/review-surface-card.md",
    ".ai-native/templates/change-impact-coverage-report.md",
    ".ai-native/templates/user-decision-card.md",
    ".ai-native/templates/change-boundary-report.md",
    ".ai-native/templates/baseline-state-report.md",
    ".ai-native/templates/standard-baseline-selection-report.md",
    ".ai-native/templates/launch-readiness-report.md",
    ".ai-native/templates/conversation-turn-classification.md",
    ".ai-native/templates/scope-change-report.md",
    ".ai-native/prompts/context-governance-agent.md",
    ".ai-native/prompts/launch-readiness-agent.md",
    ".ai-native/prompts/conversation-router-agent.md",
    ".ai-native/prompts/walkthrough-agent.md",
    ".ai-native/prompts/real-adoption-agent.md",
    ".ai-native/prompts/patch-classifier-agent.md",
    ".ai-native/prompts/workflow-adapter-agent.md",
    ".ai-native/prompts/document-lifecycle-agent.md",
    ".ai-native/prompts/beginner-entry-agent.md",
    ".ai-native/prompts/work-queue-agent.md",
    ".ai-native/prompts/hook-orchestration-agent.md",
    ".ai-native/prompts/workflow-concierge-agent.md",
    ".ai-native/prompts/review-surface-agent.md",
    ".ai-native/prompts/change-impact-coverage-agent.md",
    ".ai-native/prompts/guided-delivery-check-agent.md",
    ".ai-native/prompts/change-boundary-agent.md",
    ".ai-native/prompts/baseline-state-agent.md",
    ".ai-native/prompts/standard-baseline-router-agent.md",
    ".ai-native/prompts/launch-readiness-agent.md",
    ".ai-native/prompts/conversation-router-agent.md",
    ".ai-native/checklists/context-governance-review.md",
    ".ai-native/checklists/git-boundary-review.md",
    ".ai-native/checklists/launch-readiness-review.md",
    ".ai-native/checklists/conversation-drift-review.md",
    ".ai-native/checklists/first-delivery-walkthrough-review.md",
    ".ai-native/checklists/real-adoption-trial-review.md",
    ".ai-native/checklists/patch-classification-review.md",
    ".ai-native/checklists/workflow-adoption-map-review.md",
    ".ai-native/checklists/document-lifecycle-review.md",
    ".ai-native/checklists/beginner-entry-review.md",
    ".ai-native/checklists/work-queue-review.md",
    ".ai-native/checklists/hook-orchestration-review.md",
    ".ai-native/checklists/workflow-guidance-review.md",
    ".ai-native/checklists/review-surface-review.md",
    ".ai-native/checklists/change-impact-coverage-review.md",
    ".ai-native/checklists/standard-baseline-selection-review.md",
    ".ai-native/checklists/guided-delivery-loop-review.md",
    ".ai-native/checklists/change-boundary-review.md",
    ".ai-native/checklists/baseline-state-review.md",
    ".ai-native/checklists/launch-readiness-review.md",
    ".ai-native/checklists/conversation-drift-review.md",
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

function checkDevKitFirstPartyCi() {
  const prCi = read(".github/workflows/dev-kit-pr-checks.yml");
  const releaseCi = read(".github/workflows/dev-kit-release-checks.yml");
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
    "node scripts/check-dev-kit.mjs",
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
    "check-change-impact-coverage.mjs",
    "resolve-change-impact-coverage.mjs",
    "check-delivery-path.mjs",
    "resolve-delivery-path.mjs",
    "check-debt-handoff.mjs",
    "resolve-debt-handoff.mjs",
    "check-execution-closure.mjs",
    "resolve-execution-closure.mjs",
    "guide",
    "guide . --deep",
    "guide . --deep --intent",
    "guide-check",
    "ask",
    "ask-check",
    "review-surface",
    "review-surface-check",
    "impact-coverage",
    "impact-coverage-check",
    "delivery-path",
    "delivery-path-check",
    "debt-handoff",
    "debt-handoff-check",
    "closure",
    "closure-check",
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
    if (prCi.includes(marker)) pass(`dev-kit PR CI includes ${marker}`);
    else fail(`dev-kit PR CI missing ${marker}`);
  }

  const releaseMarkers = [
    "workflow_dispatch",
    "tags:",
    "actions/setup-node",
    "node-version: 22",
    "node scripts/check-dev-kit.mjs",
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
    "impact-coverage",
    "impact-coverage-check",
    "delivery-path",
    "delivery-path-check",
    "debt-handoff",
    "debt-handoff-check",
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
    if (releaseCi.includes(marker)) pass(`dev-kit release CI includes ${marker}`);
    else fail(`dev-kit release CI missing ${marker}`);
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
    if (prTemplate.includes(marker)) pass(`dev-kit PR template includes ${marker}`);
    else fail(`dev-kit PR template missing ${marker}`);
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
    "node scripts/check-dev-kit.mjs",
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
    "check-dev-kit",
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
    "node scripts/check-dev-kit.mjs",
    "node scripts/check-fixtures.mjs",
    "git diff --check",
  ]) {
    if (selfCheck.includes(marker)) pass(`1.0 self-check report includes ${marker}`);
    else fail(`1.0 self-check report missing ${marker}`);
  }

  const generatedSmoke = read("releases/1.0.0/generated-project-smoke.md");
  for (const marker of [
    "Status: PASS",
    "node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-1-test",
    "node /tmp/ai-native-1-test/scripts/check-ai-workflow.mjs /tmp/ai-native-1-test --mode core",
  ]) {
    if (generatedSmoke.includes(marker)) pass(`1.0 generated smoke includes ${marker}`);
    else fail(`1.0 generated smoke missing ${marker}`);
  }

  const updateSmoke = read("releases/1.0.0/update-smoke.md");
  for (const marker of [
    "Status: PASS",
    "node scripts/cli.mjs update --target /tmp/ai-native-1-test --dry-run",
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
    "`ai-native migrate` is dry-run/write-plan only",
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
  const manifest = JSON.parse(read("dev-kit-manifest.json"));
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
  if (manifest.compatibilityPolicy?.phase === manifest.devKitVersion) {
    pass("manifest compatibilityPolicy.phase matches devKitVersion");
  } else {
    fail(`manifest compatibilityPolicy.phase ${manifest.compatibilityPolicy?.phase || "<missing>"} must match devKitVersion ${manifest.devKitVersion}`);
  }

  for (const group of [
    "sourceRequired",
    "targetCore",
    "targetFull",
    "aiNativeCore",
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
    ".ai-native/dev-kit-manifest.json",
    "scripts/lib/args.mjs",
    "scripts/lib/check-result.mjs",
    "scripts/lib/git.mjs",
    "scripts/lib/markdown.mjs",
    "scripts/lib/project-signals.mjs",
    "scripts/lib/manifest.mjs",
    "scripts/start-project.mjs",
    "scripts/check-guided-adoption.mjs",
    ".ai-native/docs/first-hour.md",
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

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-manifest-check-"));
  try {
    const invalidManifest = path.join(tempRoot, "invalid-manifest.json");
    fs.writeFileSync(invalidManifest, JSON.stringify({
      schemaVersion: "1.0",
      devKitVersion: currentVersion(),
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
      && phaseDriftOutput.includes("must match devKitVersion")) {
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
    const targetManifestPath = path.join(target, ".ai-native", "dev-kit-manifest.json");
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

  if (pkg.bin?.["ai-native"] === "./scripts/cli.mjs") pass("package.json exposes ai-native compatibility bin");
  else fail("package.json must expose ai-native bin at ./scripts/cli.mjs");

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
    "node scripts/check-dev-kit.mjs",
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
    "Compatibility alias: ai-native",
    currentVersion(),
    "Manifest: dev-kit-manifest.json",
    "guide",
    "guide-check",
    "ask",
    "ask-check",
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
    if (helpOutput.includes(marker)) pass(`CLI help includes ${marker}`);
    else fail(`CLI help missing ${marker}`);
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

  const beginnerEntry = runNode(["scripts/cli.mjs", "ask", ".", "maintain Dev Kit beginner entry"]);
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

  const guidedClosure = runNode(["scripts/cli.mjs", "finish", ".", "--intent", "maintain Dev Kit close-out experience", "--verification", "npm run verify passed"]);
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

  const applyPlan = runNode(["scripts/cli.mjs", "apply-plan", ".", "--intent", "maintain Dev Kit apply plan", "--action", "workflow-assets"]);
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

  const startTempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-cli-start-"));
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
  if (selfCheckDryRun.status === 0 && selfCheckDryRun.stdout.includes("node scripts/check-dev-kit.mjs")) {
    pass("CLI self-check dry-run delegates to check-dev-kit");
  } else {
    fail(`CLI self-check dry-run missing check-dev-kit mapping: ${selfCheckDryRun.stderr || selfCheckDryRun.stdout}`);
  }

  const updateDryRun = runNode(["scripts/cli.mjs", "--dry-run", "update", "--target", "/tmp/ai-native-cli-dry-run"]);
  if (updateDryRun.status === 0
    && updateDryRun.stdout.includes("node scripts/init-project.mjs")
    && updateDryRun.stdout.includes("--update-workflow-assets")) {
    pass("CLI update dry-run prints underlying update command");
  } else {
    fail(`CLI update dry-run missing underlying update command: ${updateDryRun.stderr || updateDryRun.stdout}`);
  }

  const cliCommandDryRunRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-cli-command-dry-run-"));
  try {
    const commandDryRunTarget = path.join(cliCommandDryRunRoot, "project");
    fs.mkdirSync(commandDryRunTarget, { recursive: true });
    const updateCommandDryRun = runNode(["scripts/cli.mjs", "update", "--target", commandDryRunTarget, "--dry-run"]);
    if (updateCommandDryRun.status === 0
      && updateCommandDryRun.stdout.includes('"operation": "UPDATE_WORKFLOW_ASSETS"')
      && !fs.existsSync(path.join(commandDryRunTarget, ".ai-native", "version.json"))) {
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
    && doctorDryRun.stdout.includes("node scripts/check-ai-workflow.mjs . --mode core")) {
    pass("CLI doctor dry-run shows workflow-next and core check sequence");
  } else {
    fail(`CLI doctor dry-run missing sequence: ${doctorDryRun.stderr || doctorDryRun.stdout}`);
  }

  const migrateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-cli-migrate-"));
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
      && migrateDryRun.stdout.includes("AI Native Migration Plan")
      && migrateDryRun.stdout.includes("No target project files were modified.")
      && !fs.existsSync(path.join(migrateTarget, ".ai-native"))) {
      pass("CLI migrate dry-run prints plan and does not mutate target");
    } else {
      fail(`CLI migrate dry-run failed or mutated target: ${migrateDryRun.stderr || migrateDryRun.stdout}`);
    }

    const planPath = path.join(migrateRoot, "migration-plan.json");
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
      planPath,
    ]);
    const wrotePlan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, "utf8")) : null;
    if (migrateWritePlan.status === 0
      && wrotePlan?.blockedApply === true
      && Array.isArray(wrotePlan.actions)
      && wrotePlan.actions.length > 0
      && !fs.existsSync(path.join(migrateTarget, ".ai-native"))) {
      pass("CLI migrate write-plan writes reviewable plan only");
    } else {
      fail(`CLI migrate write-plan failed safety check: ${migrateWritePlan.stderr || migrateWritePlan.stdout}`);
    }
  } finally {
    fs.rmSync(migrateRoot, { recursive: true, force: true });
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-cli-"));
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
    ".ai-native/core/change-boundary.md",
    ".ai-native/core/baseline-state.md",
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

  const prCi = read(".github/workflows/dev-kit-pr-checks.yml");
  const releaseCi = read(".github/workflows/dev-kit-release-checks.yml");
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
    ".ai-native/core/baseline-pack-system.md",
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

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-baseline-pack-"));
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
    ".ai-native/standard-baseline-packs",
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

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-baseline-calibration-"));
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
    read(".github/workflows/dev-kit-pr-checks.yml"),
    read(".github/workflows/dev-kit-release-checks.yml"),
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

  const emptyReleaseRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-empty-release-"));
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
    "Recommended AI Native Workflow Use",
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
        && Array.isArray(parsed.recommendedAiNativeWorkflowUse)
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
    "core/native-first-existing-project-migration.md",
    "docs/native-first-existing-project-migration.md",
    "templates/native-migration-plan.md",
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
    read("releases/1.62.0/release-record.md"),
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
  ]) {
    if (combined.includes(marker)) pass(`1.62 native migration includes ${marker}`);
    else fail(`1.62 native migration missing ${marker}`);
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

  const resolver = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain Dev Kit apply plan", "--action", "workflow-assets"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Apply Plan")
    && resolver.stdout.includes("This plan authorizes apply: No")
    && resolver.stdout.includes("Can Codex write now: No")) {
    pass("1.34 unified apply plan resolver prints safe plan");
  } else {
    fail(`1.34 unified apply plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain Dev Kit apply plan", "--action", "workflow-assets", "--json"]);
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
    "users who should not need to know AI Native workflow commands",
    "ask at most 3 human questions by default",
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

  const resolver = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 Dev Kit 小白入口"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Beginner Entry Card")
    && resolver.stdout.includes("This entry writes target files: No")
    && resolver.stdout.includes("Can Codex change files now: No")) {
    pass("1.35 beginner entry resolver prints safe card");
  } else {
    fail(`1.35 beginner entry resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const positionalResolver = runNode(["scripts/resolve-beginner-entry.mjs", "我想把当前项目接入 AI Native"]);
  if (positionalResolver.status === 0
    && positionalResolver.stdout.includes("Beginner Entry Card")
    && positionalResolver.stdout.includes("This entry writes target files: No")) {
    pass("1.35 beginner entry resolver accepts one-sentence goal");
  } else {
    fail(`1.35 beginner entry one-sentence goal failed: ${positionalResolver.stderr || positionalResolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "维护 Dev Kit 小白入口", "--json"]);
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
    "What exactly did a human approve?",
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
    ["AI owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ai-owner"], "approval owner must be a specific human owner"],
    ["missing plan hash", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-missing-plan-hash"], "must include a plan hash"],
    ["all actions", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-all-actions"], "approved action ids must be explicit"],
    ["auto apply", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-auto-apply"], "forbidden approval record claim"],
    ["high risk", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-high-risk"], "cannot approve high-risk actions"],
    ["wildcard path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-wildcard-path"], "must use exact bounded target paths"],
    ["parent traversal", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-parent-traversal"], "must use exact bounded target paths"],
    ["symlink path", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-symlink-path"], "must use exact bounded target paths"],
    ["expired approval", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-expired"], "approval is expired"],
    ["ambiguous owner", ["scripts/check-approval-record.mjs", "test-fixtures/bad/bad-approval-record-ambiguous-owner"], "approval owner must be a specific human owner"],
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
    "Codex may ask at most 3 questions by default",
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
  if (example.status === 0 && example.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.53 unified closure example passes checker");
  } else {
    fail(`1.53 unified closure example failed: ${example.stderr || example.stdout}`);
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
    "Human Release Decision outside IntentOS",
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
    "Human Release Approval",
    "ASSISTED_EXECUTION",
    "does not execute release by itself",
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
  if (example.status === 0 && example.stdout.includes("Release Execution check passed")) {
    pass("1.56 release execution example passes checker");
  } else {
    fail(`1.56 release execution example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing launch view", "test-fixtures/bad/bad-release-execution-missing-launch-view", "must reference Launch Review input"],
    ["assisted without approval", "test-fixtures/bad/bad-release-execution-assisted-without-approval", "requires scoped Human Release Approval"],
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

  const resolver = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish Dev Kit closure", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Execution Closure Report")
    && resolver.stdout.includes("Commit Readiness")
    && resolver.stdout.includes("This closure authorizes commit or push: No")) {
    pass("1.32 execution closure resolver prints safe report");
  } else {
    fail(`1.32 execution closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish Dev Kit closure", "--verification", "npm run verify passed", "--json"]);
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
    paths: [".github/workflows/dev-kit-release-checks.yml"],
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
    fail(`dev-kit source industrial baseline should be pending/not selected, got ${parsed.checkStatus}/${parsed.state}`);
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
    "dev-kit-proposals/.gitkeep",
    "review-packets/.gitkeep",
    "review-surface-cards/.gitkeep",
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
    for (const injectedScript of ["scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/check-ai-workflow.mjs", "scripts/check-guided-adoption.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-engineering-baseline.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/check-review-loop.mjs", "scripts/check-next-step-boundary.mjs", "scripts/check-goal-mode.mjs", "scripts/check-subagent-orchestration.mjs", "scripts/resolve-beginner-entry.mjs", "scripts/check-beginner-entry.mjs", "scripts/resolve-work-queue.mjs", "scripts/check-work-queue.mjs", "scripts/resolve-hook-orchestration.mjs", "scripts/check-hook-orchestration.mjs", "scripts/resolve-hook-policy.mjs", "scripts/check-hook-policy.mjs", "scripts/resolve-review-surface.mjs", "scripts/check-review-surface.mjs", "scripts/resolve-change-impact-coverage.mjs", "scripts/check-change-impact-coverage.mjs", "scripts/resolve-delivery-path.mjs", "scripts/check-delivery-path.mjs", "scripts/resolve-debt-handoff.mjs", "scripts/check-debt-handoff.mjs", "scripts/resolve-document-archive-apply.mjs", "scripts/check-document-archive-apply.mjs", "scripts/resolve-apply-plan.mjs", "scripts/check-apply-plan.mjs", "scripts/new-workflow-item.mjs", "scripts/start-project.mjs", "scripts/workflow-next.mjs"]) {
      const full = path.join(starterRoot, entry.name, injectedScript);
      if (fs.existsSync(full)) {
        fail(`starter ${entry.name} should not duplicate injected workflow script ${injectedScript}`);
      }
    }
    const agents = path.join(starterRoot, entry.name, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf8");
      for (const section of ["Mission", "Core Rules", "Bootstrap Entry", "Beginner Entry", "Natural Language Workflow Guidance", "Delivery Path Governance", "Debt & Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Project Onboarding", "Engineering Baseline", "Environment Baseline", "Platform Baseline", "Industrial Baseline", "Product Baseline", "Claim Control", "Workflow Artifact Generation", "Guided Decision & Delivery Loop", "Change Boundary And Baseline State", "Goal Mode", "Subagent Orchestration", "Review Surface Governance", "Change Impact Coverage", "Review Loop", "Bounded Next-Step", "Output Experience", "Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
        if (!content.includes(section)) {
          fail(`starter ${entry.name} AGENTS.md missing ${section}`);
        }
      }
    }
    const prTemplate = path.join(starterRoot, entry.name, ".github", "pull_request_template.md");
    if (fs.existsSync(prTemplate)) {
      const content = fs.readFileSync(prTemplate, "utf8");
      for (const marker of ["Human Summary", "Workflow Guidance", "Beginner Entry", "Delivery Path", "Debt / Knowledge Handoff", "Document Archive Apply", "Unified Apply Plan", "Project Hook Policy", "Bootstrap state", "Project onboarding", "Engineering baseline", "Environment baseline", "Product baseline", "Claim control", "Context governance", "Git Boundary", "Assumptions", "Workflow Evidence", "Guided Delivery Loop", "Change Boundary Report", "Baseline State Report", "Workflow artifact quality", "Review Surface Card", "Change Impact Coverage Report", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
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
    "scripts/check-dev-kit.mjs",
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
    "AI Native Dev Kit",
    "An AI-native system for guided software delivery",
    "You describe the goal",
    "3 分钟理解",
    "新项目",
    "已有项目",
    "已上线",
    "用户负责目标、取舍、风险接受和发布确认",
    "所有可能写入项目的动作，都必须先变成可确认的计划",
    "O0 / BL0",
    "O1 / BL1",
    "O2 / BL2",
    "Beginner Entry",
    "Unified Apply Plan",
    "Change Impact Coverage",
    "Approval Record",
    "Unified Closure",
    "Decision Explain Trace",
    "Launch Review View",
    "Guided Release Adapter",
    "Release Guide",
    "Platform Release Recipes",
    "Release Handoff Packs",
    "Release Execution",
    "Structured Evidence Schema",
    "Artifact Lifecycle Map",
    "O0 / BL0 Lightweight Path",
    "Work Queue / Todo",
    "Document Lifecycle",
    "Hook Policy",
    "node scripts/cli.mjs guide",
    "node scripts/cli.mjs apply-plan",
    "node scripts/cli.mjs start",
    "node scripts/cli.mjs baseline-decision",
    "node scripts/cli.mjs workflow-map",
    "node scripts/cli.mjs impact-coverage",
    "node scripts/cli.mjs finish",
    "node scripts/cli.mjs launch-view",
    "node scripts/cli.mjs release-adapter",
    "node scripts/cli.mjs release-guide",
    "node scripts/cli.mjs release-recipe",
    "node scripts/cli.mjs release-handoff",
    "node scripts/cli.mjs release-execution",
    "node scripts/cli.mjs work-queue",
    "node scripts/cli.mjs doc-lifecycle",
    "node scripts/cli.mjs hook-policy",
    "node scripts/cli.mjs closure",
    "node scripts/cli.mjs check",
    "npm run verify",
    "npm run verify:governance",
    "node scripts/cli.mjs ask",
    "node scripts/resolve-beginner-entry.mjs",
    "node scripts/check-beginner-entry.mjs",
    "node scripts/check-approval-record.mjs",
    "node scripts/check-workflow-guidance.mjs",
    "node scripts/check-closure-decision.mjs",
    "node scripts/check-guided-closure.mjs",
    "node scripts/check-release-adapter.mjs",
    "node scripts/check-release-guide.mjs",
    "node scripts/check-platform-release-recipe.mjs",
    "node scripts/check-release-handoff-pack.mjs",
    "node scripts/check-release-execution.mjs",
    "不因为一句话就写文件",
    "不把建议当成执行授权",
    "不自动改 CI、hook、发布流程或生产配置",
    "不自动启用 BL2 或工业增强包",
    "docs/operator-manual.md",
    "docs/natural-language-orchestrator.md",
    "docs/unified-closure-model.md",
    "docs/decision-explain-trace.md",
    "docs/guided-closure-experience.md",
    "docs/launch-review-view.md",
    "docs/release-adapter.md",
    "docs/release-guide.md",
    "docs/platform-release-recipes.md",
    "docs/release-handoff-packs.md",
    "docs/release-execution-protocol.md",
    "docs/beginner-entry.md",
    "docs/conversation-native-ask.md",
    "docs/existing-project-workflow-adapter.md",
    "docs/review-surface-governance.md",
    "docs/change-impact-coverage.md",
    "docs/delivery-path-governance.md",
    "docs/debt-knowledge-handoff.md",
    "docs/approval-record-governance.md",
    "docs/structured-evidence-schema.md",
    "docs/artifact-lifecycle.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/first-hour.md",
    "docs/reference/scripts.md",
    "docs/reference/artifacts.md",
    "docs/reference/checkers.md",
    "docs/reference/standard-baseline-packs.md",
    "docs/reference/industrial-packs.md",
    "docs/guided-delivery-baseline.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/document-lifecycle.md",
    "docs/document-archive-apply.md",
    "docs/work-queue.md",
    "docs/hook-orchestration.md",
    "docs/hook-policy.md",
    "docs/baseline-pack-system.md",
    "docs/adoption-playbooks/new-project.md",
    "docs/adoption-playbooks/existing-light-project.md",
    "docs/adoption-playbooks/governed-project-read-only.md",
    "docs/adoption-playbooks/production-project-adapter.md",
    "docs/migrations/index.md",
    "docs/troubleshooting.md",
    "docs/faq.md",
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
    "一句话开始",
    "Conversation-Native Ask",
    "适合什么场景",
    "项目分级",
    "Artifact Lifecycle Map",
    "Structured Evidence Schema",
    "Decision Explain Trace",
    "Launch Review View",
    "Guided Release Adapter",
    "Release Guide",
    "Platform Release Recipes",
    "Release Execution",
    "O0 / BL0 Lightweight Path",
    "安全边界",
    "node scripts/cli.mjs guide",
    "node scripts/cli.mjs apply-plan",
    "node scripts/cli.mjs start",
    "node scripts/cli.mjs baseline-decision",
    "node scripts/cli.mjs workflow-map",
    "node scripts/cli.mjs impact-coverage",
    "node scripts/cli.mjs finish",
    "node scripts/cli.mjs launch-view",
    "node scripts/cli.mjs release-adapter",
    "node scripts/cli.mjs release-guide",
    "node scripts/cli.mjs release-recipe",
    "node scripts/cli.mjs release-execution",
    "node scripts/cli.mjs work-queue",
    "node scripts/cli.mjs doc-lifecycle",
    "node scripts/cli.mjs hook-policy",
    "node scripts/cli.mjs closure",
    "npm run verify",
    "npm run verify:governance",
    "node scripts/check-beginner-entry.mjs",
    "node scripts/check-conversation-native-ask.mjs",
    "node scripts/check-closure-decision.mjs",
    "node scripts/check-guided-closure.mjs",
    "node scripts/check-launch-review-view.mjs",
    "node scripts/check-release-adapter.mjs",
    "node scripts/check-release-guide.mjs",
    "node scripts/check-platform-release-recipe.mjs",
    "node scripts/check-release-execution.mjs",
    "docs/operator-manual.md",
    "docs/natural-language-orchestrator.md",
    "docs/unified-closure-model.md",
    "docs/decision-explain-trace.md",
    "docs/guided-closure-experience.md",
    "docs/launch-review-view.md",
    "docs/release-adapter.md",
    "docs/release-guide.md",
    "docs/platform-release-recipes.md",
    "docs/release-execution-protocol.md",
    "docs/review-surface-governance.md",
    "docs/change-impact-coverage.md",
    "docs/delivery-path-governance.md",
    "docs/debt-knowledge-handoff.md",
    "docs/first-hour.md",
    "docs/guided-delivery-baseline.md",
    "docs/product-baseline.md",
    "docs/claim-control.md",
    "docs/project-memory.md",
    "docs/git-boundary.md",
    "docs/context-governance-usage.md",
    "docs/minimal-commit-set.md",
    "docs/safe-launch.md",
    "docs/conversation-drift-control.md",
    "docs/first-delivery-walkthrough.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/structured-evidence-schema.md",
    "docs/existing-project-workflow-adapter.md",
    "docs/document-lifecycle.md",
    "docs/document-archive-apply.md",
    "docs/beginner-entry.md",
    "docs/conversation-native-ask.md",
    "docs/work-queue.md",
    "docs/hook-orchestration.md",
    "docs/hook-policy.md",
    "docs/baseline-pack-system.md",
    "docs/reference/scripts.md",
    "docs/README.md",
    "docs/index.md",
    "docs/repository-structure.md",
    "docs/document-ownership.md",
    "docs/artifact-lifecycle.md",
    "docs/structured-evidence-schema.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/plans/README.md",
    "docs/roadmaps/README.md",
    currentReleasePointer,
    "VERSION.md",
  ]) {
    if (zhReadme.includes(pointer)) pass(`README.zh-CN mentions ${pointer}`);
    else fail(`README.zh-CN missing ${pointer}`);
  }

  const requiredDocs = [
    "docs/README.md",
    "docs/index.md",
    "docs/repository-structure.md",
    "docs/document-ownership.md",
    "docs/artifact-lifecycle.md",
    "docs/structured-evidence-schema.md",
    "docs/o0-bl0-lightweight-path.md",
    "docs/plans/README.md",
    "docs/plans/repository-information-architecture-1.36-plan.md",
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "docs/roadmaps/README.md",
    "docs/operator-manual.md",
    "docs/natural-language-orchestrator.md",
    "docs/unified-closure-model.md",
    "docs/decision-explain-trace.md",
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
    "implementation",
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
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ai-native-dev-kit-e2e-"));
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
    ".ai-native/profiles/web-app/baseline.json",
    ".ai-native/profiles/wechat-miniprogram/baseline.json",
    ".ai-native/industrial-packs/index.json",
    ".ai-native/industrial-packs/selection-guide.md",
    ".ai-native/industrial-packs/schema/pack.schema.json",
    ".ai-native/industrial-packs/schema/baseline-selection.schema.json",
    ".ai-native/templates/baseline-selection.md",
    ".ai-native/templates/baseline-evidence.md",
    ".ai-native/docs/artifact-decision-tree.md",
    ".ai-native/docs/goal-subagent-usage.md",
    ".ai-native/docs/guided-delivery-baseline.md",
    ".ai-native/docs/product-baseline.md",
    ".ai-native/docs/claim-control.md",
    ".ai-native/docs/project-memory.md",
    ".ai-native/docs/git-boundary.md",
    ".ai-native/docs/change-boundary.md",
    ".ai-native/docs/baseline-state.md",
    ".ai-native/docs/guided-delivery-check.md",
    ".ai-native/docs/beginner-entry.md",
    ".ai-native/core/engineering-baseline.md",
    ".ai-native/core/outcome-baseline.md",
    ".ai-native/core/product-baseline.md",
    ".ai-native/core/claim-control.md",
    ".ai-native/core/assumption-register.md",
    ".ai-native/core/context-governance.md",
    ".ai-native/core/git-boundary.md",
    ".ai-native/core/change-boundary.md",
    ".ai-native/core/baseline-state.md",
    ".ai-native/core/beginner-entry.md",
    ".ai-native/templates/engineering-baseline.md",
    ".ai-native/templates/product-baseline-review.md",
    ".ai-native/templates/claim-control-report.md",
    ".ai-native/templates/assumption-register.md",
    ".ai-native/templates/learning-candidate.md",
    ".ai-native/templates/context-correction-report.md",
    ".ai-native/templates/git-boundary-report.md",
    ".ai-native/templates/change-boundary-report.md",
    ".ai-native/templates/baseline-state-report.md",
    ".ai-native/templates/beginner-entry-card.md",
    ".ai-native/checklists/engineering-baseline-review.md",
    ".ai-native/checklists/product-baseline-review.md",
    ".ai-native/checklists/claim-control-review.md",
    ".ai-native/checklists/context-governance-review.md",
    ".ai-native/checklists/git-boundary-review.md",
    ".ai-native/checklists/guided-delivery-loop-review.md",
    ".ai-native/checklists/change-boundary-review.md",
    ".ai-native/checklists/baseline-state-review.md",
    ".ai-native/checklists/beginner-entry-review.md",
    ".ai-native/core/next-step-boundary.md",
    ".ai-native/core/goal-mode.md",
    ".ai-native/core/subagent-orchestration.md",
    ".ai-native/templates/follow-up-proposal.md",
    ".ai-native/templates/final-report.md",
    ".ai-native/templates/goal-card.md",
    ".ai-native/templates/subagent-run-plan.md",
    ".ai-native/checklists/next-step-boundary-review.md",
    ".ai-native/checklists/goal-mode-review.md",
    ".ai-native/checklists/subagent-orchestration-review.md",
    ".ai-native/prompts/goal-planner-agent.md",
    ".ai-native/prompts/engineering-baseline-agent.md",
    ".ai-native/prompts/product-baseline-agent.md",
    ".ai-native/prompts/claim-control-agent.md",
    ".ai-native/prompts/context-governance-agent.md",
    ".ai-native/prompts/guided-delivery-check-agent.md",
    ".ai-native/prompts/change-boundary-agent.md",
    ".ai-native/prompts/baseline-state-agent.md",
    ".ai-native/prompts/beginner-entry-agent.md",
    ".ai-native/core/output-protocol.md",
    ".ai-native/core/glossary.md",
    ".ai-native/prompts/reporter-agent.md",
    ".ai-native/templates/human-status-report.md",
    ".ai-native/templates/decision-brief.md",
    ".ai-native/templates/plain-review-summary.md",
    ".ai-native/templates/customer-handoff.md",
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
  ]) {
    if (!fs.existsSync(path.join(target, rel))) {
      fail(`generated project missing platform baseline asset: ${rel}`);
      return;
    }
  }
  pass("generated project platform baseline assets");

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

  if (fs.existsSync(path.join(target, ".ai-native", "industrial-packs", "web-app", "pack.json"))) {
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
    path.join(target, ".ai-native", "templates", "baseline-selection.md"),
    path.join(target, "docs", "baseline-selection.md"),
  );
  fs.copyFileSync(
    path.join(target, ".ai-native", "templates", "baseline-evidence.md"),
    path.join(target, "docs", "baseline-evidence.md"),
  );
  const baselineSelectionPath = path.join(target, "docs", "baseline-selection.md");
  const baselineSelectionContent = fs.readFileSync(baselineSelectionPath, "utf8")
    .replace("BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL:", "BL2_INDUSTRIAL:")
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
    || !selectedPackMissingOutput.includes("--industrial-packs web-app-industrial")) {
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
    || !selectedPackMissingBaselineOutput.includes("--industrial-packs web-app-industrial")) {
    fail(`generated project industrial baseline check should reject missing selected pack with repair hint: ${selectedPackMissingBaselineCheck.stderr || selectedPackMissingBaselineCheck.stdout}`);
    return;
  }
  pass("generated project industrial baseline check rejects missing selected pack with repair hint");

  const installSelectedPack = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
    "--industrial-packs",
    "web-app-industrial",
  ]);
  if (installSelectedPack.status !== 0 || !fs.existsSync(path.join(target, ".ai-native", "industrial-packs", "web-app", "pack.json"))) {
    fail(`generated project selected industrial pack install failed: ${installSelectedPack.stderr || installSelectedPack.stdout}`);
    return;
  }
  pass("generated project selected industrial pack install");

  const baselineEvidencePath = path.join(target, "docs", "baseline-evidence.md");
  const evidenceRecordPath = path.join(target, "releases", "generated-bl2-evidence.md");
  fs.writeFileSync(evidenceRecordPath, [
    "# Generated BL2 Evidence",
    "",
    "This generated file is used by the dev-kit self-check to prove that structured baseline evidence refs are validated.",
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
  spawnSync("git", ["init"], { cwd: governedExistingTarget, encoding: "utf8" });

  const governedNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    governedExistingTarget,
  ]);
  if (governedNext.status !== 0
    || !governedNext.stdout.includes("NEXT_ACTION: RUN_ADOPTION_ASSESSMENT")
    || !governedNext.stdout.includes("ADOPTION_MODE: READ_ONLY")
    || !governedNext.stdout.includes("CAN_WRITE_WORKFLOW_ASSETS: no")
    || !governedNext.stdout.includes("GOVERNED_EXISTING_PROJECT")
    || !governedNext.stdout.includes("PRODUCTION_GOVERNED_PROJECT")
    || !governedNext.stdout.includes("DIRTY_WORKTREE_PROJECT")) {
    fail(`governed existing project should require read-only adoption assessment: ${governedNext.stderr || governedNext.stdout}`);
    return;
  }
  pass("governed existing project workflow-next requires read-only adoption assessment");

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
    fail(`dirty production-governed ready project should stop before task execution: ${dirtyReadyNext.stderr || dirtyReadyNext.stdout}`);
    return;
  }
  pass("dirty production-governed ready project workflow-next stops before task execution");

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
    || !fs.existsSync(path.join(target, ".ai-native", "adoption", "001-governed-existing-project.md"))) {
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
    || !fs.existsSync(path.join(target, ".ai-native", "adoption", "002-governed-existing-project.md"))) {
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

  const updateResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    target,
    "--update-workflow-assets",
  ]);
  if (updateResult.status !== 0) {
    fail(`generated project workflow update failed: ${updateResult.stderr || updateResult.stdout}`);
    return;
  }
  pass("generated project workflow asset update");

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
    || fs.existsSync(path.join(nonEmptyInitTarget, ".ai-native", "version.json"))) {
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
  if (forceInit.status !== 0 || !fs.existsSync(path.join(nonEmptyInitTarget, ".ai-native", "version.json"))) {
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
  const planOnlyPath = path.join(tempRoot, "plan-only-init.json");
  const writeInitPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    planOnlyTarget,
    "--write-plan",
    planOnlyPath,
  ]);
  if (writeInitPlan.status !== 0 || !fs.existsSync(planOnlyPath)) {
    fail(`init write-plan failed: ${writeInitPlan.stderr || writeInitPlan.stdout}`);
    return;
  }
  if (fs.existsSync(planOnlyTarget)) {
    fail("init write-plan wrote target files");
    return;
  }
  const applyInitPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    planOnlyPath,
  ]);
  if (applyInitPlan.status !== 0 || !fs.existsSync(path.join(planOnlyTarget, ".ai-native", "version.json"))) {
    fail(`init apply-plan failed: ${applyInitPlan.stderr || applyInitPlan.stdout}`);
    return;
  }
  pass("init write-plan/apply-plan initializes target after reviewable plan");

  const stalePlanTarget = path.join(tempRoot, "stale-plan-project");
  fs.mkdirSync(stalePlanTarget, { recursive: true });
  fs.writeFileSync(path.join(stalePlanTarget, "AGENTS.md"), "# Stale\n");
  const stalePlanPath = path.join(tempRoot, "stale-update-plan.json");
  const staleWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    stalePlanTarget,
    "--update-workflow-assets",
    "--write-plan",
    stalePlanPath,
  ]);
  if (staleWritePlan.status !== 0) {
    fail(`stale update write-plan failed: ${staleWritePlan.stderr || staleWritePlan.stdout}`);
    return;
  }
  fs.appendFileSync(path.join(stalePlanTarget, "AGENTS.md"), "\nChanged after plan.\n");
  const staleApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    stalePlanPath,
  ]);
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
  const backupPlanPath = path.join(tempRoot, "backup-update-plan.json");
  const backupDir = ".ai-native/backups/0.38-test";
  const backupPlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    backupTarget,
    "--update-workflow-assets",
    "--backup-dir",
    backupDir,
    "--write-plan",
    backupPlanPath,
  ]);
  if (backupPlan.status !== 0) {
    fail(`backup update write-plan failed: ${backupPlan.stderr || backupPlan.stdout}`);
    return;
  }
  const backupApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    backupPlanPath,
  ]);
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
  const legacyPlanPath = path.join(tempRoot, "legacy-update-plan.json");
  const legacyWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--write-plan",
    legacyPlanPath,
  ]);
  if (legacyWritePlan.status !== 0 || !fs.existsSync(legacyPlanPath)) {
    fail(`legacy project write-plan failed: ${legacyWritePlan.stderr || legacyWritePlan.stdout}`);
    return;
  }
  if (fs.existsSync(path.join(legacyTarget, ".ai-native", "version.json"))) {
    fail("legacy project write-plan wrote workflow version before apply-plan");
    return;
  }
  const legacyUpdateResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    legacyPlanPath,
  ]);
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
  if (legacyAgentsContent !== "# Legacy\n") {
    fail("legacy project AGENTS.md was modified without explicit approval");
    return;
  }
  const legacyAgentsReport = path.join(legacyTarget, ".ai-native", "migration-reports", "agents-governance.md");
  if (!fs.existsSync(legacyAgentsReport)) {
    fail("legacy project update missing AGENTS.md governance migration report");
    return;
  }
  const legacyAgentsReportContent = fs.readFileSync(legacyAgentsReport, "utf8");
  if (!legacyAgentsReportContent.includes("PENDING_HUMAN_APPROVAL") || !legacyAgentsReportContent.includes("--apply-agent-governance")) {
    fail("legacy project AGENTS.md governance report missing pending status or apply command");
    return;
  }
  pass("legacy project workflow update creates AGENTS.md migration report without modifying AGENTS.md");

  const legacyNext = runNode([
    path.join(kitRoot, "scripts", "workflow-next.mjs"),
    legacyTarget,
  ]);
  if (legacyNext.status !== 0 || !legacyNext.stdout.includes("NEXT_ACTION: REVIEW_GOVERNANCE_MIGRATION")) {
    fail(`legacy project workflow next did not report governance migration: ${legacyNext.stderr || legacyNext.stdout}`);
    return;
  }
  pass("legacy project workflow next reports pending governance migration");

  const legacyAgentsApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
    "--apply-agent-governance",
  ]);
  if (legacyAgentsApply.status !== 0) {
    fail(`legacy project AGENTS.md explicit governance apply failed: ${legacyAgentsApply.stderr || legacyAgentsApply.stdout}`);
    return;
  }
  const appliedLegacyAgents = fs.readFileSync(path.join(legacyTarget, "AGENTS.md"), "utf8");
  for (const marker of ["Bootstrap Entry", "Project Onboarding", "Engineering Baseline", "Platform Baseline", "Industrial Baseline", "Workflow Artifact Generation", "Review Loop", "Bounded Next-Step", "Skill Governance", "Automation Governance", "Final Report"]) {
    if (!appliedLegacyAgents.includes(marker)) {
      fail(`legacy project AGENTS.md explicit apply missing ${marker}`);
      return;
    }
  }
  const appliedLegacyAgentsReport = fs.readFileSync(legacyAgentsReport, "utf8");
  if (!appliedLegacyAgentsReport.includes("APPLIED")) {
    fail("legacy project AGENTS.md governance report missing applied status after explicit apply");
    return;
  }
  pass("legacy project AGENTS.md explicit governance apply updates AGENTS.md");

  const legacyNoAgentsTarget = path.join(tempRoot, "legacy-no-agents");
  fs.mkdirSync(legacyNoAgentsTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyNoAgentsTarget, "README.md"), "# Existing Project\n");
  const legacyNoAgentsPlanPath = path.join(tempRoot, "legacy-no-agents-update-plan.json");
  const legacyNoAgentsWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyNoAgentsTarget,
    "--update-workflow-assets",
    "--write-plan",
    legacyNoAgentsPlanPath,
  ]);
  if (legacyNoAgentsWritePlan.status !== 0) {
    fail(`legacy no-AGENTS write-plan failed: ${legacyNoAgentsWritePlan.stderr || legacyNoAgentsWritePlan.stdout}`);
    return;
  }
  const legacyNoAgentsUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    legacyNoAgentsPlanPath,
  ]);
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
  const legacyCustomPrPlanPath = path.join(tempRoot, "legacy-custom-pr-update-plan.json");
  const legacyCustomPrWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--write-plan",
    legacyCustomPrPlanPath,
  ]);
  if (legacyCustomPrWritePlan.status !== 0) {
    fail(`legacy custom PR template write-plan failed: ${legacyCustomPrWritePlan.stderr || legacyCustomPrWritePlan.stdout}`);
    return;
  }
  const legacyCustomPrUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    legacyCustomPrPlanPath,
  ]);
  if (legacyCustomPrUpdate.status !== 0) {
    fail(`legacy custom PR template apply-plan workflow update failed: ${legacyCustomPrUpdate.stderr || legacyCustomPrUpdate.stdout}`);
    return;
  }
  const unchangedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  if (unchangedCustomPrTemplate !== originalCustomPrTemplate) {
    fail("legacy custom PR template was modified without explicit approval");
    return;
  }
  const migrationReport = path.join(legacyCustomPrTarget, ".ai-native", "migration-reports", "pr-template-governance.md");
  if (!fs.existsSync(migrationReport)) {
    fail("legacy custom PR template update missing migration report");
    return;
  }
  const migrationReportContent = fs.readFileSync(migrationReport, "utf8");
  if (!migrationReportContent.includes("PENDING_HUMAN_APPROVAL") || !migrationReportContent.includes("--apply-pr-template-governance")) {
    fail("legacy custom PR template migration report missing pending status or apply command");
    return;
  }
  pass("legacy custom PR template update creates migration report without modifying template");

  const legacyManualPrTarget = path.join(tempRoot, "legacy-manual-pr-template");
  fs.mkdirSync(path.join(legacyManualPrTarget, ".github"), { recursive: true });
  const legacyManualPrTemplate = path.join(legacyManualPrTarget, ".github", "pull_request_template.md");
  fs.writeFileSync(legacyManualPrTemplate, originalCustomPrTemplate);
  const legacyManualPrPlanPath = path.join(tempRoot, "legacy-manual-pr-update-plan.json");
  const legacyManualPrWritePlan = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyManualPrTarget,
    "--update-workflow-assets",
    "--write-plan",
    legacyManualPrPlanPath,
  ]);
  if (legacyManualPrWritePlan.status !== 0) {
    fail(`legacy manual PR template write-plan failed: ${legacyManualPrWritePlan.stderr || legacyManualPrWritePlan.stdout}`);
    return;
  }
  const legacyManualPrUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    legacyManualPrPlanPath,
  ]);
  if (legacyManualPrUpdate.status !== 0) {
    fail(`legacy manual PR template apply-plan workflow update failed: ${legacyManualPrUpdate.stderr || legacyManualPrUpdate.stdout}`);
    return;
  }
  const manualMigrationReport = path.join(legacyManualPrTarget, ".ai-native", "migration-reports", "pr-template-governance.md");
  const manualMigrationReportContent = fs.readFileSync(manualMigrationReport, "utf8");
  const proposedAppendixMatch = manualMigrationReportContent.match(/```md\n([\s\S]*?)\n```/);
  if (!proposedAppendixMatch) {
    fail("legacy manual PR template migration report missing proposed appendix");
    return;
  }
  fs.appendFileSync(legacyManualPrTemplate, `\n${proposedAppendixMatch[1]}\n`);
  const legacyManualPrResolve = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyManualPrTarget,
    "--update-workflow-assets",
  ]);
  if (legacyManualPrResolve.status !== 0) {
    fail(`legacy manual PR template resolution failed: ${legacyManualPrResolve.stderr || legacyManualPrResolve.stdout}`);
    return;
  }
  const resolvedMigrationReportContent = fs.readFileSync(manualMigrationReport, "utf8");
  if (!resolvedMigrationReportContent.includes("RESOLVED_MANUALLY") || resolvedMigrationReportContent.includes("PENDING_HUMAN_APPROVAL")) {
    fail("legacy manual PR template migration report was not resolved after manual appendix merge");
    return;
  }
  pass("legacy manual PR template merge resolves pending migration report");

  const legacyCustomPrApply = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
    "--apply-pr-template-governance",
  ]);
  if (legacyCustomPrApply.status !== 0) {
    fail(`legacy custom PR template explicit governance apply failed: ${legacyCustomPrApply.stderr || legacyCustomPrApply.stdout}`);
    return;
  }
  const appliedCustomPrTemplate = fs.readFileSync(legacyCustomPrTemplate, "utf8");
  for (const marker of ["Human Summary", "Bootstrap state", "Project onboarding", "Engineering baseline", "Workflow Evidence", "Workflow artifact quality", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
    if (!appliedCustomPrTemplate.includes(marker)) {
      fail(`legacy custom PR template explicit apply missing ${marker}`);
      return;
    }
  }
  const appliedMigrationReportContent = fs.readFileSync(migrationReport, "utf8");
  if (!appliedMigrationReportContent.includes("APPLIED")) {
    fail("legacy custom PR template migration report missing applied status after explicit apply");
    return;
  }
  pass("legacy custom PR template explicit governance apply updates template");
}

checkRequiredFiles();
checkDefaultStarter();
checkVersionMetadata();
checkDevKitFirstPartyCi();
checkOneDotZeroReleaseEvidence();
checkManifestProtocol();
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
checkChangeImpactCoverageProtocol();
checkDeliveryPathGovernanceProtocol();
checkDebtKnowledgeHandoffProtocol();
checkUnifiedClosureModelProtocol();
checkDecisionExplainTraceProtocol();
checkLaunchReviewViewProtocol();
checkReleaseAdapterProtocol();
checkReleaseGuideProtocol();
checkPlatformReleaseRecipeProtocol();
checkReleaseHandoffPackProtocol();
checkReleaseExecutionProtocol();
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
console.log("AI Native Dev Kit self-check passed.");
