#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd(), process.argv[2] || ".");

const requiredPaths = [
  "AGENTS.md",
  "docs/ai-workflow.md",
  "docs/product-vision.md",
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/engineering-principles.md",
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
  "releases",
  "scripts/verify.sh",
  "scripts/check-ai-workflow.mjs",
  "scripts/summarize-ai-logs.mjs",
  "scripts/check-workflow-version.mjs",
  "scripts/workflow-daily-summary.mjs",
  "scripts/check-project-onboarding.mjs",
  "scripts/check-workflow-artifacts.mjs",
  "scripts/new-workflow-item.mjs",
  "scripts/workflow-next.mjs",
  ".github/pull_request_template.md",
  ".github/workflows/ai-workflow-checks.yml",
  ".ai-native/version.json",
  ".ai-native/core/extension-policy.md",
  ".ai-native/core/self-iteration.md",
  ".ai-native/core/skill-governance.md",
  ".ai-native/core/automation-governance.md",
  ".ai-native/core/project-onboarding.md",
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
  ".ai-native/templates/dev-kit-change-proposal.md",
  ".ai-native/templates/skill-candidate.md",
  ".ai-native/templates/project-automation-proposal.md",
  ".ai-native/templates/daily-automation-prompt.md",
  ".ai-native/templates/project-onboarding.md",
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
  ".ai-native/checklists/scope-gate.md",
  ".ai-native/checklists/risk-gate.md",
  ".ai-native/checklists/profile-review.md",
  ".ai-native/checklists/starter-review.md",
  ".ai-native/checklists/verification-gate.md",
  ".ai-native/checklists/release-gate.md",
];

const requiredAgentSections = [
  "Mission",
  "Core Rules",
  "Bootstrap Entry",
  "Project Onboarding",
  "Workflow Artifact Generation",
  "Task Execution Rules",
  "High-risk Boundaries",
  "Skill Governance",
  "Automation Governance",
  "Final Report",
];

const requiredPullRequestMarkers = [
  "Bootstrap state",
  "Project onboarding",
  "Workflow Evidence",
  "Workflow artifact quality",
  "Skill / Automation Governance",
  "irreversible operation",
];

const requiredWorkflowCommands = [
  "check-ai-workflow.mjs",
  "check-workflow-version.mjs",
  "summarize-ai-logs.mjs",
  "workflow-daily-summary.mjs",
  "check-project-onboarding.mjs",
  "check-workflow-artifacts.mjs",
  "new-workflow-item.mjs",
  "workflow-next.mjs",
];

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
  for (const command of requiredWorkflowCommands) {
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
console.log("AI workflow baseline is present.");
