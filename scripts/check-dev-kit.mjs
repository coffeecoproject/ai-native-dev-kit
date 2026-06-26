#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";

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

function walkFiles(dir) {
  const fullDir = path.join(kitRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(path.relative(kitRoot, full)));
    } else {
      results.push(full);
    }
  }
  return results;
}

function checkRequiredFiles() {
  const required = [
    "README.md",
    "README.zh-CN.md",
    "LICENSE.md",
    "VERSION.md",
    "docs/quickstart.md",
    "docs/codex-usage.md",
    "docs/mental-model.md",
    "core/workflow.md",
    "core/task-levels.md",
    "core/gates.md",
    "core/platform-strategy.md",
    "core/extension-policy.md",
    "core/self-iteration.md",
    "core/skill-governance.md",
    "core/automation-governance.md",
    "core/project-onboarding.md",
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
    "templates/dev-kit-change-proposal.md",
    "templates/skill-candidate.md",
    "templates/project-automation-proposal.md",
    "templates/daily-automation-prompt.md",
    "templates/project-onboarding.md",
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
    "prompts/bootstrap-agent.md",
    "prompts/project-onboarding-agent.md",
    "scripts/init-project.mjs",
    "scripts/check-ai-workflow.mjs",
    "scripts/check-dev-kit.mjs",
    "scripts/summarize-ai-logs.mjs",
    "scripts/check-workflow-version.mjs",
    "scripts/workflow-daily-summary.mjs",
    "scripts/check-project-onboarding.mjs",
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
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
  ];

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
    "scripts/check-platform-baseline.mjs",
    "scripts/resolve-platform-baseline.mjs",
    "scripts/check-industrial-pack.mjs",
    "scripts/resolve-industrial-baseline.mjs",
    "scripts/check-industrial-baseline.mjs",
    "scripts/check-workflow-artifacts.mjs",
    "scripts/new-workflow-item.mjs",
    "scripts/workflow-next.mjs",
    "docs/project-onboarding.md",
    "docs/project-profile.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/verification-matrix.md",
    ".ai-native/profiles",
    ".ai-native/industrial-packs",
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
    for (const file of walkFiles(dir)) {
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
    for (const injectedScript of ["scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/check-ai-workflow.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/new-workflow-item.mjs", "scripts/workflow-next.mjs"]) {
      const full = path.join(starterRoot, entry.name, injectedScript);
      if (fs.existsSync(full)) {
        fail(`starter ${entry.name} should not duplicate injected workflow script ${injectedScript}`);
      }
    }
    const agents = path.join(starterRoot, entry.name, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const content = fs.readFileSync(agents, "utf8");
      for (const section of ["Mission", "Core Rules", "Bootstrap Entry", "Project Onboarding", "Platform Baseline", "Industrial Baseline", "Workflow Artifact Generation", "Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
        if (!content.includes(section)) {
          fail(`starter ${entry.name} AGENTS.md missing ${section}`);
        }
      }
    }
    const prTemplate = path.join(starterRoot, entry.name, ".github", "pull_request_template.md");
    if (fs.existsSync(prTemplate)) {
      const content = fs.readFileSync(prTemplate, "utf8");
      for (const marker of ["Bootstrap state", "Project onboarding", "Workflow Evidence", "Workflow artifact quality", "Skill / Automation Governance", "irreversible operation"]) {
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
    for (const marker of ["bootstrap", "onboarding", "artifact", "skill", "automation", "daily summary"]) {
      if (normalized.includes(marker)) {
        pass(`${name} includes ${marker}`);
      } else {
        fail(`${name} missing ${marker}`);
      }
    }
  }

  for (const command of [
    "check-ai-workflow.mjs",
    "check-workflow-version.mjs",
    "summarize-ai-logs.mjs",
    "workflow-daily-summary.mjs",
    "check-project-onboarding.mjs",
    "check-platform-baseline.mjs",
    "resolve-platform-baseline.mjs",
    "check-industrial-pack.mjs",
    "resolve-industrial-baseline.mjs",
    "check-industrial-baseline.mjs",
    "check-workflow-artifacts.mjs",
    "new-workflow-item.mjs",
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
  for (const script of ["scripts/init-project.mjs", "scripts/check-ai-workflow.mjs", "scripts/check-dev-kit.mjs", "scripts/summarize-ai-logs.mjs", "scripts/check-workflow-version.mjs", "scripts/workflow-daily-summary.mjs", "scripts/check-project-onboarding.mjs", "scripts/check-platform-baseline.mjs", "scripts/resolve-platform-baseline.mjs", "scripts/check-industrial-pack.mjs", "scripts/resolve-industrial-baseline.mjs", "scripts/check-industrial-baseline.mjs", "scripts/check-workflow-artifacts.mjs", "scripts/new-workflow-item.mjs", "scripts/workflow-next.mjs"]) {
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
  const content = read("README.md");
  const requiredPointers = [
    "generic-project",
    "codex-ios-app",
    "codex-android-app",
    "examples/generic-first-change",
    "examples/web-internal-admin-first-slice",
    "examples/web-industrial-bl2-first-slice",
    "examples/miniprogram-industrial-bl2-first-slice",
    "docs/quickstart",
    "docs/codex-usage",
    "docs/mental-model",
    "check-workflow-artifacts",
    "check-platform-baseline",
    "resolve-platform-baseline",
    "check-industrial-pack",
    "resolve-industrial-baseline",
    "check-industrial-baseline",
    "--selected-only",
    "--bl2-only",
    "--mode core",
    "--mode full",
    "new-workflow-item",
    "--mode ready",
    "--mode implementation",
    "--task",
    "--changed-only",
    "Human Approval",
    "Approval scope",
    "Risk Gate Exclusions",
    "O0",
    "O1",
    "O2",
    "BL0",
    "BL1",
    "BL2",
    "workflow-next",
    "ADOPTION_MODE",
    "RUN_ADOPTION_ASSESSMENT",
    "PROJECT_STATE_TAGS",
    "adoption-assessment",
    "existing-governance-map",
    "dogfood-observation",
    "--enforce",
    "bootstrap-agent",
    "--apply-pr-template-governance",
    "--apply-agent-governance",
    "migration-reports",
    "self-iteration",
    "skill-candidates",
    "automation-proposals",
    "project-onboarding",
    "Selected Profiles",
    "platform baseline",
    "industrial-packs",
    "selection-guide",
    "check-project-onboarding",
    "workflow-daily-summary",
    "VERSION",
    "profiles/",
    "platforms/",
  ];
  for (const pointer of requiredPointers) {
    if (content.includes(pointer)) pass(`README mentions ${pointer}`);
    else fail(`README missing ${pointer}`);
  }
}

function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
  });
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
    ".ai-native/profiles/web-app/baseline.json",
    ".ai-native/profiles/wechat-miniprogram/baseline.json",
    ".ai-native/industrial-packs/index.json",
    ".ai-native/industrial-packs/selection-guide.md",
    ".ai-native/industrial-packs/schema/pack.schema.json",
    ".ai-native/industrial-packs/schema/baseline-selection.schema.json",
    ".ai-native/templates/baseline-selection.md",
    ".ai-native/templates/baseline-evidence.md",
    "docs/verification-matrix.md",
  ]) {
    if (!fs.existsSync(path.join(target, rel))) {
      fail(`generated project missing platform baseline asset: ${rel}`);
      return;
    }
  }
  pass("generated project platform baseline assets");

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
  pass("generated project new workflow item creates request");

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

  const legacyTarget = path.join(tempRoot, "legacy-project");
  fs.mkdirSync(legacyTarget, { recursive: true });
  fs.writeFileSync(path.join(legacyTarget, "AGENTS.md"), "# Legacy\n");
  fs.mkdirSync(path.join(legacyTarget, "docs"), { recursive: true });
  const legacyUpdateResult = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyTarget,
    "--update-workflow-assets",
  ]);
  if (legacyUpdateResult.status !== 0) {
    fail(`legacy project workflow update failed: ${legacyUpdateResult.stderr || legacyUpdateResult.stdout}`);
    return;
  }
  const legacyExpectedDirs = ["skill-candidates", "automation-proposals", "workflow-retros", "workflow-improvements"];
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
  for (const marker of ["Bootstrap Entry", "Project Onboarding", "Platform Baseline", "Industrial Baseline", "Workflow Artifact Generation", "Skill Governance", "Automation Governance", "Final Report"]) {
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
  const legacyNoAgentsUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyNoAgentsTarget,
    "--update-workflow-assets",
  ]);
  if (legacyNoAgentsUpdate.status !== 0) {
    fail(`legacy no-AGENTS workflow update failed: ${legacyNoAgentsUpdate.stderr || legacyNoAgentsUpdate.stdout}`);
    return;
  }
  const createdAgents = path.join(legacyNoAgentsTarget, "AGENTS.md");
  if (!fs.existsSync(createdAgents)) {
    fail("legacy no-AGENTS workflow update did not create AGENTS.md");
    return;
  }
  const createdAgentsContent = fs.readFileSync(createdAgents, "utf8");
  for (const marker of ["Bootstrap Entry", "Platform Baseline", "Industrial Baseline", "High-risk Boundaries", "Skill Governance", "Automation Governance", "Final Report"]) {
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
  for (const marker of ["Bootstrap state", "Project onboarding", "Workflow Evidence", "Workflow artifact quality", "Skill / Automation Governance", "irreversible operation"]) {
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
  const legacyCustomPrUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyCustomPrTarget,
    "--update-workflow-assets",
  ]);
  if (legacyCustomPrUpdate.status !== 0) {
    fail(`legacy custom PR template workflow update failed: ${legacyCustomPrUpdate.stderr || legacyCustomPrUpdate.stdout}`);
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
  const legacyManualPrUpdate = runNode([
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--target",
    legacyManualPrTarget,
    "--update-workflow-assets",
  ]);
  if (legacyManualPrUpdate.status !== 0) {
    fail(`legacy manual PR template workflow update failed: ${legacyManualPrUpdate.stderr || legacyManualPrUpdate.stdout}`);
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
  for (const marker of ["Bootstrap state", "Project onboarding", "Workflow Evidence", "Workflow artifact quality", "Skill / Automation Governance", "irreversible operation"]) {
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
checkCorePurity();
checkProfiles();
checkIndustrialPacks();
checkIndustrialBaselineResolver();
checkStarters();
checkPlatformAdapters();
checkScriptSyntax();
checkReadmePointers();
checkWebBl2ExampleArtifacts();
checkMiniProgramBl2ExampleArtifacts();
checkGeneratedProjectE2E();

if (failed) {
  process.exit(1);
}

console.log("");
console.log("AI Native Dev Kit self-check passed.");
