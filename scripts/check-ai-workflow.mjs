#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { targetRequiredPaths } from "./lib/manifest.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const workflowMode = String(args.mode || "full").toLowerCase();
const knownFlags = new Set(["mode"]);
const allowedWorkflowModes = new Set(["core", "full"]);

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

if (!allowedWorkflowModes.has(workflowMode)) {
  console.error(`FAIL invalid --mode: ${workflowMode}`);
  console.error("Valid modes: core, full");
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

const fullRequiredPaths = [
  "AGENTS.md",
  "docs/ai-workflow.md",
  "docs/product-vision.md",
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/verification-matrix.md",
  "docs/engineering-principles.md",
  "docs/engineering-baseline.md",
  "docs/risk-policy.md",
  "docs/architecture.md",
  "docs/domain-model.md",
  "docs/permission-model.md",
  "docs/test-strategy.md",
  "requests",
  "preflight",
  "specs",
  "evals",
  "tasks",
  "ai-logs",
  "workflow-retros",
  "workflow-improvements",
  "skill-candidates",
  "automation-proposals",
  "dev-kit-proposals",
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
  "releases",
  "scripts/verify.sh",
  "scripts/check-ai-workflow.mjs",
  "scripts/summarize-ai-logs.mjs",
  "scripts/check-workflow-version.mjs",
  "scripts/workflow-daily-summary.mjs",
  "scripts/check-project-onboarding.mjs",
  "scripts/check-engineering-baseline.mjs",
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
  "scripts/new-workflow-item.mjs",
  "scripts/workflow-next.mjs",
  ".github/pull_request_template.md",
  ".github/workflows/ai-workflow-checks.yml",
  ".ai-native/version.json",
  ".ai-native/docs/artifact-decision-tree.md",
  ".ai-native/docs/goal-subagent-usage.md",
  ".ai-native/core/extension-policy.md",
  ".ai-native/core/self-iteration.md",
  ".ai-native/core/skill-governance.md",
  ".ai-native/core/automation-governance.md",
  ".ai-native/core/project-onboarding.md",
  ".ai-native/core/engineering-baseline.md",
  ".ai-native/core/review-loop.md",
  ".ai-native/core/goal-mode.md",
  ".ai-native/core/subagent-orchestration.md",
  ".ai-native/core/next-step-boundary.md",
  ".ai-native/core/output-protocol.md",
  ".ai-native/core/glossary.md",
  ".ai-native/core/workflow.md",
  ".ai-native/core/task-levels.md",
  ".ai-native/core/gates.md",
  ".ai-native/templates/request-card.md",
  ".ai-native/templates/preflight-report.md",
  ".ai-native/templates/spec.md",
  ".ai-native/templates/eval.md",
  ".ai-native/templates/task-card.md",
  ".ai-native/templates/ai-task-log.md",
  ".ai-native/templates/workflow-retro.md",
  ".ai-native/templates/workflow-improvement.md",
  ".ai-native/templates/workflow-daily-summary.md",
  ".ai-native/templates/dogfood-observation.md",
  ".ai-native/templates/adoption-assessment.md",
  ".ai-native/templates/existing-governance-map.md",
  ".ai-native/templates/review-packet.md",
  ".ai-native/templates/gpt-review-prompt.md",
  ".ai-native/templates/review-loop-report.md",
  ".ai-native/templates/goal-card.md",
  ".ai-native/templates/subagent-run-plan.md",
  ".ai-native/templates/follow-up-proposal.md",
  ".ai-native/templates/final-report.md",
  ".ai-native/templates/human-status-report.md",
  ".ai-native/templates/decision-brief.md",
  ".ai-native/templates/plain-review-summary.md",
  ".ai-native/templates/customer-handoff.md",
  ".ai-native/templates/dev-kit-change-proposal.md",
  ".ai-native/templates/skill-candidate.md",
  ".ai-native/templates/project-automation-proposal.md",
  ".ai-native/templates/daily-automation-prompt.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/engineering-baseline.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/templates/profile.md",
  ".ai-native/templates/starter-readiness.md",
  ".ai-native/templates/platform-risk-policy.md",
  ".ai-native/templates/verification-matrix.md",
  ".ai-native/prompts/bootstrap-agent.md",
  ".ai-native/prompts/preflight-agent.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/prompts/goal-planner-agent.md",
  ".ai-native/prompts/engineering-baseline-agent.md",
  ".ai-native/prompts/reporter-agent.md",
  ".ai-native/prompts/spec-agent.md",
  ".ai-native/prompts/architect-agent.md",
  ".ai-native/prompts/builder-agent.md",
  ".ai-native/prompts/reviewer-agent.md",
  ".ai-native/prompts/repair-agent.md",
  ".ai-native/checklists/core-purity-review.md",
  ".ai-native/checklists/self-iteration-review.md",
  ".ai-native/checklists/daily-summary-review.md",
  ".ai-native/checklists/skill-review.md",
  ".ai-native/checklists/automation-review.md",
  ".ai-native/checklists/project-onboarding-review.md",
  ".ai-native/checklists/engineering-baseline-review.md",
  ".ai-native/checklists/review-loop-review.md",
  ".ai-native/checklists/goal-mode-review.md",
  ".ai-native/checklists/subagent-orchestration-review.md",
  ".ai-native/checklists/next-step-boundary-review.md",
  ".ai-native/checklists/scope-gate.md",
  ".ai-native/checklists/risk-gate.md",
  ".ai-native/checklists/profile-review.md",
  ".ai-native/checklists/starter-review.md",
  ".ai-native/checklists/industrial-pack-review.md",
  ".ai-native/checklists/verification-gate.md",
  ".ai-native/checklists/release-gate.md",
  ".ai-native/industrial-packs/README.md",
  ".ai-native/industrial-packs/selection-guide.md",
  ".ai-native/industrial-packs/index.json",
  ".ai-native/industrial-packs/schema/pack.schema.json",
  ".ai-native/industrial-packs/schema/baseline-selection.schema.json",
  ".ai-native/templates/baseline-selection.md",
  ".ai-native/templates/baseline-evidence.md",
  ".ai-native/profiles/web-app/profile.md",
  ".ai-native/profiles/web-app/baseline.json",
  ".ai-native/profiles/backend-api/profile.md",
  ".ai-native/profiles/backend-api/baseline.json",
  ".ai-native/profiles/ios-app/profile.md",
  ".ai-native/profiles/ios-app/baseline.json",
  ".ai-native/profiles/android-app/profile.md",
  ".ai-native/profiles/android-app/baseline.json",
  ".ai-native/profiles/wechat-miniprogram/profile.md",
  ".ai-native/profiles/wechat-miniprogram/baseline.json",
  ".ai-native/profiles/internal-admin/profile.md",
  ".ai-native/profiles/internal-admin/baseline.json",
  ".ai-native/profiles/high-risk-change/profile.md",
  ".ai-native/profiles/high-risk-change/baseline.json",
];

const coreRequiredPaths = [
  "AGENTS.md",
  "docs/ai-workflow.md",
  "docs/product-vision.md",
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/verification-matrix.md",
  "docs/engineering-principles.md",
  "docs/engineering-baseline.md",
  "docs/risk-policy.md",
  "docs/architecture.md",
  "docs/domain-model.md",
  "docs/permission-model.md",
  "docs/test-strategy.md",
  "requests",
  "preflight",
  "specs",
  "evals",
  "tasks",
  "ai-logs",
  "workflow-retros",
  "workflow-improvements",
  "skill-candidates",
  "automation-proposals",
  "dev-kit-proposals",
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
  "releases",
  "scripts/verify.sh",
  "scripts/check-ai-workflow.mjs",
  "scripts/summarize-ai-logs.mjs",
  "scripts/check-workflow-version.mjs",
  "scripts/workflow-daily-summary.mjs",
  "scripts/check-project-onboarding.mjs",
  "scripts/check-engineering-baseline.mjs",
  "scripts/check-workflow-artifacts.mjs",
  "scripts/check-review-loop.mjs",
  "scripts/check-next-step-boundary.mjs",
  "scripts/check-goal-mode.mjs",
  "scripts/check-subagent-orchestration.mjs",
  "scripts/new-workflow-item.mjs",
  "scripts/workflow-next.mjs",
  ".github/pull_request_template.md",
  ".github/workflows/ai-workflow-checks.yml",
  ".ai-native/version.json",
  ".ai-native/docs/artifact-decision-tree.md",
  ".ai-native/docs/goal-subagent-usage.md",
  ".ai-native/core/extension-policy.md",
  ".ai-native/core/self-iteration.md",
  ".ai-native/core/skill-governance.md",
  ".ai-native/core/automation-governance.md",
  ".ai-native/core/project-onboarding.md",
  ".ai-native/core/engineering-baseline.md",
  ".ai-native/core/review-loop.md",
  ".ai-native/core/goal-mode.md",
  ".ai-native/core/subagent-orchestration.md",
  ".ai-native/core/next-step-boundary.md",
  ".ai-native/core/output-protocol.md",
  ".ai-native/core/glossary.md",
  ".ai-native/core/workflow.md",
  ".ai-native/core/task-levels.md",
  ".ai-native/core/gates.md",
  ".ai-native/templates/request-card.md",
  ".ai-native/templates/preflight-report.md",
  ".ai-native/templates/spec.md",
  ".ai-native/templates/eval.md",
  ".ai-native/templates/task-card.md",
  ".ai-native/templates/ai-task-log.md",
  ".ai-native/templates/workflow-retro.md",
  ".ai-native/templates/workflow-improvement.md",
  ".ai-native/templates/workflow-daily-summary.md",
  ".ai-native/templates/dogfood-observation.md",
  ".ai-native/templates/adoption-assessment.md",
  ".ai-native/templates/existing-governance-map.md",
  ".ai-native/templates/review-packet.md",
  ".ai-native/templates/gpt-review-prompt.md",
  ".ai-native/templates/review-loop-report.md",
  ".ai-native/templates/goal-card.md",
  ".ai-native/templates/subagent-run-plan.md",
  ".ai-native/templates/follow-up-proposal.md",
  ".ai-native/templates/final-report.md",
  ".ai-native/templates/human-status-report.md",
  ".ai-native/templates/decision-brief.md",
  ".ai-native/templates/plain-review-summary.md",
  ".ai-native/templates/customer-handoff.md",
  ".ai-native/templates/dev-kit-change-proposal.md",
  ".ai-native/templates/skill-candidate.md",
  ".ai-native/templates/project-automation-proposal.md",
  ".ai-native/templates/daily-automation-prompt.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/engineering-baseline.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/templates/verification-matrix.md",
  ".ai-native/prompts/bootstrap-agent.md",
  ".ai-native/prompts/preflight-agent.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/prompts/goal-planner-agent.md",
  ".ai-native/prompts/engineering-baseline-agent.md",
  ".ai-native/prompts/reporter-agent.md",
  ".ai-native/prompts/spec-agent.md",
  ".ai-native/prompts/architect-agent.md",
  ".ai-native/prompts/builder-agent.md",
  ".ai-native/prompts/reviewer-agent.md",
  ".ai-native/prompts/repair-agent.md",
  ".ai-native/checklists/core-purity-review.md",
  ".ai-native/checklists/self-iteration-review.md",
  ".ai-native/checklists/daily-summary-review.md",
  ".ai-native/checklists/skill-review.md",
  ".ai-native/checklists/automation-review.md",
  ".ai-native/checklists/project-onboarding-review.md",
  ".ai-native/checklists/engineering-baseline-review.md",
  ".ai-native/checklists/review-loop-review.md",
  ".ai-native/checklists/goal-mode-review.md",
  ".ai-native/checklists/subagent-orchestration-review.md",
  ".ai-native/checklists/next-step-boundary-review.md",
  ".ai-native/checklists/scope-gate.md",
  ".ai-native/checklists/risk-gate.md",
  ".ai-native/checklists/verification-gate.md",
  ".ai-native/checklists/release-gate.md",
];

const requiredPaths = targetRequiredPaths(projectRoot, workflowMode, {
  fallback: workflowMode === "core" ? coreRequiredPaths : fullRequiredPaths,
});

const requiredAgentSections = [
  "Mission",
  "Core Rules",
  "Bootstrap Entry",
  "Project Onboarding",
  "Engineering Baseline",
  "Platform Baseline",
  "Industrial Baseline",
  "Workflow Artifact Generation",
  "Review Loop",
  "Goal Mode",
  "Subagent Orchestration",
  "Bounded Next-Step",
  "Output Experience",
  "Task Execution Rules",
  "High-risk Boundaries",
  "Skill Governance",
  "Automation Governance",
  "Final Report",
];

const requiredPullRequestMarkers = [
  "Bootstrap state",
  "Project onboarding",
  "Engineering baseline",
  "Workflow Evidence",
  "Workflow artifact quality",
  "Review Packet / Review Loop Report",
  "Subagent Run Plan",
  "Next-Step Suggestions",
  "Human Summary",
  "Skill / Automation Governance",
  "irreversible operation",
];

const requiredWorkflowCommands = [
  "check-ai-workflow.mjs",
  "check-workflow-version.mjs",
  "summarize-ai-logs.mjs",
  "workflow-daily-summary.mjs",
  "check-project-onboarding.mjs",
  "check-engineering-baseline.mjs",
  "check-workflow-artifacts.mjs",
  "check-review-loop.mjs",
  "check-next-step-boundary.mjs",
  "check-goal-mode.mjs",
  "check-subagent-orchestration.mjs",
  "new-workflow-item.mjs",
  "workflow-next.mjs",
];

const requiredFullWorkflowCommands = [
  ...requiredWorkflowCommands,
  "check-platform-baseline.mjs",
  "resolve-platform-baseline.mjs",
  "check-industrial-pack.mjs",
  "resolve-industrial-baseline.mjs",
  "check-industrial-baseline.mjs",
];

const requiredGithubWorkflowCommands = workflowMode === "core" ? requiredWorkflowCommands : requiredFullWorkflowCommands;

let failed = false;

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

for (const rel of requiredPaths) {
  const full = path.join(projectRoot, rel);
  if (fs.existsSync(full)) {
    pass(rel);
  } else {
    fail(`missing ${rel}`);
  }
}

const agentsPath = path.join(projectRoot, "AGENTS.md");
if (fs.existsSync(agentsPath)) {
  const content = fs.readFileSync(agentsPath, "utf8");
  for (const section of requiredAgentSections) {
    if (content.includes(section)) {
      pass(`AGENTS.md contains ${section}`);
    } else {
      fail(`AGENTS.md missing section: ${section}`);
    }
  }
}

const prTemplatePath = path.join(projectRoot, ".github", "pull_request_template.md");
if (fs.existsSync(prTemplatePath)) {
  const content = fs.readFileSync(prTemplatePath, "utf8");
  for (const marker of requiredPullRequestMarkers) {
    if (content.includes(marker)) {
      pass(`PR template contains ${marker}`);
    } else {
      fail(`PR template missing marker: ${marker}`);
    }
  }
}

const githubWorkflowPath = path.join(projectRoot, ".github", "workflows", "ai-workflow-checks.yml");
if (fs.existsSync(githubWorkflowPath)) {
  const content = fs.readFileSync(githubWorkflowPath, "utf8");
  for (const command of requiredGithubWorkflowCommands) {
    if (content.includes(command)) {
      pass(`GitHub workflow runs ${command}`);
    } else {
      fail(`GitHub workflow missing command: ${command}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("");
console.log(`AI workflow baseline is present (${workflowMode} mode).`);
