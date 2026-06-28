#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { sourceRequiredPaths } from "./lib/manifest.mjs";
import { walkFiles as walkProjectFiles } from "./lib/project-signals.mjs";

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
    "docs/artifact-decision-tree.md",
    "docs/goal-subagent-usage.md",
    "docs/governance-hardening-roadmap.md",
    "docs/productization-hardcut-1.0-plan.md",
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
    "baseline-decision",
    "baseline-decision-check",
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
    "baseline-decision",
    "baseline-decision-check",
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
    "Workflow Evidence",
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

  if (pkg.bin?.["ai-native"] === "./scripts/cli.mjs") pass("package.json exposes ai-native bin");
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
    "node scripts/cli.mjs baseline-decision .",
    "node scripts/cli.mjs baseline-decision-check .",
    "node scripts/check-standard-baseline-pack.mjs .",
    "node scripts/check-standard-baseline-selection.mjs .",
    "node --check scripts/resolve-baseline-packs.mjs",
    "node --check scripts/check-baseline-pack-selection.mjs",
    "node scripts/check-baseline-pack-selection.mjs .",
    "git diff --check",
  ]) {
    if (pkg.scripts?.verify?.includes(marker)) pass(`package.json verify includes ${marker}`);
    else fail(`package.json verify missing ${marker}`);
  }

  const help = runNode(["scripts/cli.mjs", "--help"]);
  const helpOutput = `${help.stdout}\n${help.stderr}`;
  if (help.status !== 0) {
    fail(`CLI help failed: ${helpOutput}`);
    return;
  }
  for (const marker of [
    "AI Native Dev Kit CLI",
    currentVersion(),
    "Manifest: dev-kit-manifest.json",
    "start",
    "baseline",
    "product-baseline",
    "claim-control",
    "context-governance",
    "launch-readiness",
    "conversation-drift",
    "guided-delivery",
    "real-adoption",
    "patch-classification",
    "change-boundary",
    "baseline-state",
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
  const files = {
    "core/subagent-orchestration.md": read("core/subagent-orchestration.md"),
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
    "docs/guided-decision-delivery-loop-1.10-plan.md",
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
    "docs/governance-hardening-drift-guard-1.11-plan.md",
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
    read("docs/governance-hardening-drift-guard-1.11-plan.md"),
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
    "docs/change-boundary-baseline-state-1.12-plan.md",
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
    read("docs/change-boundary-baseline-state-1.12-plan.md"),
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
    "docs/baseline-pack-system-1.13-plan.md",
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
    read("docs/baseline-pack-system-1.13-plan.md"),
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
    "docs/standard-baseline-pack-registry-1.14-plan.md",
    "docs/platform-standard-baseline-packs-1.15-plan.md",
    "docs/bl2-industrial-baseline-deepening-1.16-plan.md",
    "docs/guided-baseline-selection-entry-1.17-plan.md",
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
    read("docs/standard-baseline-pack-registry-1.14-plan.md"),
    read("docs/platform-standard-baseline-packs-1.15-plan.md"),
    read("docs/bl2-industrial-baseline-deepening-1.16-plan.md"),
    read("docs/guided-baseline-selection-entry-1.17-plan.md"),
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
    read("docs/guided-baseline-selection-entry-1.17-plan.md"),
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
    "docs/guided-baseline-selection-calibration-1.18-plan.md",
    "baseline-calibration-reports/2026-06-28-summary.md",
    "baseline-calibration-reports/2026-06-28-local-ios-industrial-monorepo-project.md",
    "releases/1.18.0/release-record.md",
    "releases/1.18.0/known-limitations.md",
    "releases/1.18.0/self-check-report.md",
  ];
  for (const file of required) {
    if (exists(file)) pass(`1.18 guided baseline calibration asset exists ${file}`);
    else fail(`1.18 guided baseline calibration asset missing ${file}`);
  }

  const combined = [
    read("docs/guided-baseline-selection-calibration-1.18-plan.md"),
    read("core/guided-baseline-selection.md"),
    read("docs/guided-baseline-selection-entry.md"),
    read("templates/baseline-decision-card.md"),
    read("checklists/baseline-decision-review.md"),
    read("scripts/resolve-guided-baseline-selection.mjs"),
    read("scripts/baseline-project.mjs"),
    read("releases/1.18.0/release-record.md"),
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

function checkGuidedDeliveryBaselineProtocol() {
  const required = [
    "docs/guided-delivery-baseline-1.3-plan.md",
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
    "docs/project-memory-context-governance-1.4-plan.md",
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
    "docs/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md",
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
    "docs/real-project-adoption-trial-1.8-plan.md",
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
    read("docs/bl2-industrial-baseline-deepening-1.16-plan.md"),
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
    for (const injectedScript of ["scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/check-ai-workflow.mjs", "scripts/check-guided-adoption.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-engineering-baseline.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/check-review-loop.mjs", "scripts/check-next-step-boundary.mjs", "scripts/check-goal-mode.mjs", "scripts/check-subagent-orchestration.mjs", "scripts/new-workflow-item.mjs", "scripts/start-project.mjs", "scripts/workflow-next.mjs"]) {
      const full = path.join(starterRoot, entry.name, injectedScript);
      if (fs.existsSync(full)) {
        fail(`starter ${entry.name} should not duplicate injected workflow script ${injectedScript}`);
      }
    }
    const agents = path.join(starterRoot, entry.name, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf8");
      for (const section of ["Mission", "Core Rules", "Bootstrap Entry", "Project Onboarding", "Engineering Baseline", "Environment Baseline", "Platform Baseline", "Industrial Baseline", "Product Baseline", "Claim Control", "Workflow Artifact Generation", "Guided Decision & Delivery Loop", "Change Boundary And Baseline State", "Goal Mode", "Subagent Orchestration", "Review Loop", "Bounded Next-Step", "Output Experience", "Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
        if (!content.includes(section)) {
          fail(`starter ${entry.name} AGENTS.md missing ${section}`);
        }
      }
    }
    const prTemplate = path.join(starterRoot, entry.name, ".github", "pull_request_template.md");
    if (fs.existsSync(prTemplate)) {
      const content = fs.readFileSync(prTemplate, "utf8");
      for (const marker of ["Human Summary", "Bootstrap state", "Project onboarding", "Engineering baseline", "Environment baseline", "Product baseline", "Claim control", "Context governance", "Git Boundary", "Assumptions", "Workflow Evidence", "Guided Delivery Loop", "Change Boundary Report", "Baseline State Report", "Workflow artifact quality", "Review Packet / Review Loop Report", "Subagent Run Plan", "Next-Step Suggestions", "Skill / Automation Governance", "irreversible operation"]) {
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
    for (const marker of ["bootstrap", "onboarding", "artifact", "skill", "automation", "daily summary", "human summary", "next-step", "subagent", "product baseline", "claim control", "assumption", "context governance", "git boundary", "safe launch", "conversation drift", "first delivery", "guided delivery", "change boundary", "baseline state", "baseline pack"]) {
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
    "scripts/check-guided-delivery-loop.mjs",
    "scripts/check-change-boundary.mjs",
    "scripts/check-baseline-state.mjs",
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
    "AI Native Dev Kit",
    "3 分钟理解",
    "新项目",
    "已有项目",
    "已上线",
    "O0 + BL0",
    "O1 + selected profiles + BL1",
    "O2 + selected profiles + BL2",
    "node scripts/cli.mjs start",
    "node scripts/cli.mjs baseline",
    "node scripts/cli.mjs baseline-decision",
    "node scripts/cli.mjs standard-baseline",
    "node scripts/cli.mjs baseline-packs",
    "npm run verify",
    "node scripts/check-product-baseline.mjs",
    "node scripts/check-claim-control.mjs",
    "node scripts/check-context-governance.mjs",
    "node scripts/check-launch-readiness.mjs",
    "node scripts/check-conversation-drift.mjs",
    "node scripts/check-guided-delivery-loop.mjs",
    "node scripts/check-first-delivery-walkthrough.mjs",
    "node scripts/check-change-boundary.mjs",
    "node scripts/check-baseline-state.mjs",
    "node scripts/resolve-guided-baseline-selection.mjs",
    "node scripts/check-guided-baseline-selection.mjs",
    "node scripts/resolve-standard-baseline.mjs",
    "node scripts/check-standard-baseline-pack.mjs",
    "node scripts/check-standard-baseline-selection.mjs",
    "node scripts/resolve-baseline-packs.mjs",
    "node scripts/check-baseline-pack-selection.mjs",
    "node scripts/cli.mjs next",
    "node scripts/cli.mjs init",
    "node scripts/cli.mjs update",
    "node scripts/cli.mjs migrate",
    "node scripts/cli.mjs check",
    "releases/1.10.0/release-record.md",
    "releases/1.9.0/release-record.md",
    "不要",
    "docs/operator-manual.md",
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
    "docs/first-delivery-walkthrough.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "docs/standard-baseline-pack-registry.md",
    "docs/baseline-pack-system.md",
    "docs/adoption-playbooks/new-project.md",
    "docs/adoption-playbooks/existing-light-project.md",
    "docs/adoption-playbooks/governed-project-read-only.md",
    "docs/adoption-playbooks/production-project-adapter.md",
    "docs/migrations/index.md",
    "docs/migrations/0.33-to-1.0.md",
    "docs/troubleshooting.md",
    "docs/faq.md",
    "releases/1.7.0/release-record.md",
    "releases/1.4.0/release-record.md",
    "releases/1.4.1/release-record.md",
    "releases/1.5.0/release-record.md",
    "releases/1.6.0/release-record.md",
    "releases/1.3.0/release-record.md",
    "releases/1.2.0/release-record.md",
    "releases/1.1.0/release-record.md",
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
    "最小开始方式",
    "Codex 一句话入口",
    "node scripts/cli.mjs start",
    "node scripts/cli.mjs baseline",
    "node scripts/cli.mjs standard-baseline",
    "node scripts/cli.mjs baseline-packs",
    "npm run verify",
    "node scripts/check-product-baseline.mjs",
    "node scripts/check-context-governance.mjs",
    "node scripts/check-launch-readiness.mjs",
    "node scripts/check-conversation-drift.mjs",
    "node scripts/check-guided-delivery-loop.mjs",
    "node scripts/check-first-delivery-walkthrough.mjs",
    "node scripts/check-change-boundary.mjs",
    "node scripts/check-baseline-state.mjs",
    "node scripts/resolve-standard-baseline.mjs",
    "node scripts/check-standard-baseline-pack.mjs",
    "node scripts/check-standard-baseline-selection.mjs",
    "node scripts/resolve-baseline-packs.mjs",
    "node scripts/check-baseline-pack-selection.mjs",
    "重要边界",
    "docs/operator-manual.md",
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
    "docs/baseline-pack-system.md",
    "docs/migrations/0.33-to-1.0.md",
  ]) {
    if (zhReadme.includes(pointer)) pass(`README.zh-CN mentions ${pointer}`);
    else fail(`README.zh-CN missing ${pointer}`);
  }

  const requiredDocs = [
    "docs/operator-manual.md",
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
    "docs/first-delivery-walkthrough.md",
    "docs/change-boundary.md",
    "docs/baseline-state.md",
    "docs/guided-delivery-check.md",
    "docs/standard-baseline-pack-registry.md",
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

  const referenceContent = [
    readme,
    zhReadme,
    ...requiredDocs.filter(exists).map(read),
    read("docs/quickstart.md"),
    read("docs/codex-usage.md"),
    read("docs/mental-model.md"),
    read("docs/artifact-decision-tree.md"),
    read("docs/goal-subagent-usage.md"),
    read("docs/governance-hardening-roadmap.md"),
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
    "Guided Delivery Check",
    "Change Boundary",
    "Baseline State",
    "change-boundary-reports",
    "baseline-state-reports",
    "launch-readiness",
    "conversation-turns",
    "scope-change-reports",
    "adoption-trial-reports",
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
    ".ai-native/core/engineering-baseline.md",
    ".ai-native/core/outcome-baseline.md",
    ".ai-native/core/product-baseline.md",
    ".ai-native/core/claim-control.md",
    ".ai-native/core/assumption-register.md",
    ".ai-native/core/context-governance.md",
    ".ai-native/core/git-boundary.md",
    ".ai-native/core/change-boundary.md",
    ".ai-native/core/baseline-state.md",
    ".ai-native/templates/engineering-baseline.md",
    ".ai-native/templates/product-baseline-review.md",
    ".ai-native/templates/claim-control-report.md",
    ".ai-native/templates/assumption-register.md",
    ".ai-native/templates/learning-candidate.md",
    ".ai-native/templates/context-correction-report.md",
    ".ai-native/templates/git-boundary-report.md",
    ".ai-native/templates/change-boundary-report.md",
    ".ai-native/templates/baseline-state-report.md",
    ".ai-native/checklists/engineering-baseline-review.md",
    ".ai-native/checklists/product-baseline-review.md",
    ".ai-native/checklists/claim-control-review.md",
    ".ai-native/checklists/context-governance-review.md",
    ".ai-native/checklists/git-boundary-review.md",
    ".ai-native/checklists/guided-delivery-loop-review.md",
    ".ai-native/checklists/change-boundary-review.md",
    ".ai-native/checklists/baseline-state-review.md",
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
checkGuidedDeliveryBaselineProtocol();
checkProjectMemoryContextGovernanceProtocol();
checkSafeLaunchProtocol();
checkConversationDriftProtocol();
checkFirstDeliveryWalkthroughProtocol();
checkRealAdoptionAndPatchClassificationProtocol();
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
