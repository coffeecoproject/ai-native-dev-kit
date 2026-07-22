import * as runtime from "./runtime.mjs";
import { failed } from "./runtime.mjs";

const {
  fs,
  path,
  crypto,
  spawnSync,
  os,
  sourceRequiredPaths,
  walkProjectFiles,
  analyzeRiskSurfaces,
  evidenceDigest,
  extractMachineReadableEvidence,
  validateSchema,
  initExecutableActions,
  loadVerifiedBootstrapReceipt,
  buildCurrentTrustFixture,
  prepareCurrentTrustFixtureSource,
  canonicalFileDigest,
  createEvidenceAuthorityBinding,
  projectIdentity,
  resolveProjectEntryTrust,
  sectionBody,
  stripMarkdown,
  kitRoot,
  approvedInitProjectApplyArgs,
  checkRiskSurfaceCalibration,
  currentVersion,
  exists,
  fail,
  fileDigest,
  generatedExecutionAssuranceReportText,
  hasCompleteAdoptionAssuranceEvidence,
  hasCompleteGovernanceConvergenceEvidence,
  mutateVerificationPlan,
  pass,
  read,
  rel,
  reportNameForTakeoverExample,
  rewriteMachineEvidence,
  runNode,
  walkSourceFiles,
  writeInitProjectApprovalRecord,
  writeInitProjectReadinessRecord,
} = runtime;

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
    "candidate_git_revision:",
    "candidate_digest:",
    "node scripts/check-release-acceptance.mjs",
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
    const init = runNode([
      "scripts/init-project.mjs", "--starter", "generic-project", "--target", target,
      "--goal", "create a generic project for manifest authority verification",
    ]);
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
    try {
      const nextResult = JSON.parse(targetNext.stdout);
      const readsManifestPath = (nextResult.missingWorkflowAssets || []).includes("fake/manifest-target-required.md");
      const failsClosed = targetNext.status !== 0
        && nextResult.nextAction === "REPAIR_PROJECT_ENTRY_TRUST"
        && nextResult.canWriteWorkflowAssets === "no";
      if (readsManifestPath && failsClosed) {
        pass("workflow-next reads manifest readiness paths and rejects a tampered installed identity");
      } else {
        fail(`workflow-next must report the manifest path and fail closed on identity drift: ${targetNext.stdout}`);
      }
    } catch (error) {
      fail(`workflow-next manifest target check returned invalid JSON: ${error.message}; ${targetNext.stderr || targetNext.stdout}`);
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
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
  if ([0, 1].includes(guidedClosure.status)
    && guidedClosure.stdout.includes("IntentOS Current Operating State")
    && guidedClosure.stdout.includes("Current status:")
    && guidedClosure.stdout.includes("This entry is read-only")) {
    pass("CLI finish presents the unified close-out through the zero-experience operating view without requiring stale evidence to claim done");
  } else {
    fail(`CLI finish failed: ${guidedClosure.stderr || guidedClosure.stdout}`);
  }

  const guidedClosureCheck = runNode([
    "scripts/cli.mjs",
    "finish-check",
    "examples/1.54-decision-explain-trace",
    "--historical-audit",
  ]);
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

  const businessRuleCheck = runNode([
    "scripts/cli.mjs",
    "business-rule-check",
    "examples/1.75-business-rule-closure/appointment-service-time",
  ]);
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
    const init = runNode([
      "scripts/cli.mjs", "init", "--starter", "generic-project", "--target", target,
      "--goal", "create a simple appointment scheduling project",
    ]);
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
    "strict internal review",
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
    "Decision Responsibility Summary",
    "User Summary",
    "Current Status",
    "What I Need From You",
    "Recommended Next Step",
    "What AI Can Do Safely",
    "What AI Must Not Do",
    "Technical Details",
    "Audit Notes",
    "Machine-readable Output",
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
    "Technical alternatives remain in Technical Details and are not a user menu",
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
  for (const marker of ["--format human", "--format technical", "## Decision Responsibility Summary", "## User Input Needed", "## Technical Details"]) {
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
    "requireTrustedProjectEntry",
    "executeBootstrapTransaction",
    "--force-new-project was removed",
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
    "candidate path for internal review",
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
    "IntentOS/Codex makes technical decisions",
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
  for (const marker of ["must not become", "PENDING_CONFIRMATION", "User input class"]) {
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
  const baselineEnforcementOutput = `${baselineEnforcement.stdout}\n${baselineEnforcement.stderr}`;
  if (baselineEnforcement.status !== 0
    && baselineEnforcementOutput.includes("platform baseline is not implementation-ready")
    && baselineEnforcementOutput.includes("industrial baseline is not implementation-ready")) {
    pass("1.3 task baseline enforcement fails closed when the source repository has no target-project baseline authority");
  } else {
    fail(`1.3 task baseline enforcement did not fail closed as expected: ${baselineEnforcementOutput}`);
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
    "Codex derives technical context from project evidence",
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
    "Codex determines technical readiness from current evidence",
    "exact consent only to a prepared concrete release",
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

export function runFoundationChecks() {
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
}
