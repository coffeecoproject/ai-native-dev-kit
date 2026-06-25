#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const enforce = Boolean(args.enforce);

const pendingPattern = /<[^>\n]+>|PENDING_CONFIRMATION|PENDING\b|TBD|TODO|NOT_READY/;
const ignoredRootEntries = new Set([".git", ".DS_Store", "node_modules"]);

const onboardingDocs = [
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
];

const workflowRequiredPaths = [
  "AGENTS.md",
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "scripts/check-ai-workflow.mjs",
  "scripts/check-project-onboarding.mjs",
  "scripts/check-workflow-artifacts.mjs",
  "scripts/check-workflow-version.mjs",
  "scripts/new-workflow-item.mjs",
  "scripts/summarize-ai-logs.mjs",
  "scripts/workflow-daily-summary.mjs",
  "scripts/workflow-next.mjs",
  ".github/workflows/ai-workflow-checks.yml",
  ".ai-native/version.json",
  ".ai-native/core/workflow.md",
  ".ai-native/core/project-onboarding.md",
  ".ai-native/prompts/bootstrap-agent.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/checklists/project-onboarding-review.md",
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

const workflowArtifactDirs = ["requests", "specs", "evals", "tasks"];
const projectSignalFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "Package.swift",
  "pom.xml",
  "build.gradle",
  "settings.gradle",
  "README.md",
];
const projectSignalDirs = ["src", "app", "pages", "components", "ios", "android", "server", "backend", "frontend", "services"];

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

function exists(rel) {
  return fs.existsSync(path.join(projectRoot, rel));
}

function read(rel) {
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function readJson(rel) {
  const content = read(rel);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function localKitRoot() {
  const candidate = path.resolve(__dirname, "..");
  if (fs.existsSync(path.join(candidate, "VERSION.md")) && fs.existsSync(path.join(candidate, "scripts", "init-project.mjs"))) {
    return candidate;
  }
  return null;
}

function readLocalKitVersion(kitRoot) {
  if (!kitRoot) return null;
  const content = fs.readFileSync(path.join(kitRoot, "VERSION.md"), "utf8");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function rootEntries() {
  if (!fs.existsSync(projectRoot)) return [];
  return fs.readdirSync(projectRoot).filter((entry) => !ignoredRootEntries.has(entry));
}

function hasProjectSignals() {
  return projectSignalFiles.some((rel) => exists(rel)) || projectSignalDirs.some((rel) => exists(rel));
}

function listMarkdownFiles(relDir) {
  const fullDir = path.join(projectRoot, relDir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(path.relative(projectRoot, full)));
    } else if (entry.name.endsWith(".md")) {
      results.push(path.relative(projectRoot, full));
    }
  }
  return results.sort();
}

function pendingMigrationReports() {
  const reportDir = path.join(projectRoot, ".ai-native", "migration-reports");
  if (!fs.existsSync(reportDir)) return [];
  const reports = [];
  for (const entry of fs.readdirSync(reportDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const rel = path.join(".ai-native", "migration-reports", entry.name);
    if (read(rel).includes("PENDING_HUMAN_APPROVAL")) {
      reports.push(rel);
    }
  }
  return reports.sort();
}

function missingAgentSections() {
  const content = read("AGENTS.md");
  if (!content) return requiredAgentSections;
  return requiredAgentSections.filter((section) => !content.includes(section));
}

function onboardingState() {
  const missing = onboardingDocs.filter((rel) => !exists(rel));
  if (missing.length > 0) {
    return { state: "MISSING", missing, pending: [] };
  }
  const pending = onboardingDocs.filter((rel) => pendingPattern.test(read(rel)));
  if (pending.length > 0) {
    return { state: "NEEDS_HUMAN_CONFIRMATION", missing: [], pending };
  }
  return { state: "READY", missing: [], pending: [] };
}

function workflowArtifactCount() {
  return workflowArtifactDirs.reduce((count, dir) => count + listMarkdownFiles(dir).length, 0);
}

function commandFor(action, kitRoot) {
  const initProject = kitRoot ? `node ${path.join(kitRoot, "scripts", "init-project.mjs")}` : "node ai-native-dev-kit/scripts/init-project.mjs";
  if (action === "INIT_WITH_STARTER") {
    return `${initProject} --starter generic-project --target ${projectRoot}`;
  }
  if (action === "RUN_WORKFLOW_ASSET_UPDATE") {
    return `${initProject} --target ${projectRoot} --update-workflow-assets`;
  }
  if (action === "RUN_PROJECT_ONBOARDING") {
    return "Use .ai-native/prompts/project-onboarding-agent.md, then run node scripts/check-project-onboarding.mjs .";
  }
  if (action === "REVIEW_GOVERNANCE_MIGRATION") {
    return "Review .ai-native/migration-reports/ and apply only after explicit human approval.";
  }
  if (action === "READY_FOR_FIRST_REQUEST") {
    return "Create the first request with node scripts/new-workflow-item.mjs --type request --name <name>.";
  }
  if (action === "READY_FOR_TASK_EXECUTION") {
    return "Use the approved task card, then run verification.";
  }
  if (action === "RUN_DEV_KIT_SELF_CHECK") {
    return "Run node scripts/check-dev-kit.mjs from the dev-kit repository.";
  }
  return "Select or create a valid project root.";
}

function buildResult() {
  const targetExists = fs.existsSync(projectRoot);
  if (!targetExists) {
    return {
      projectRoot,
      projectState: "TARGET_MISSING",
      workflowState: "UNAVAILABLE",
      onboardingState: "UNAVAILABLE",
      versionState: "UNAVAILABLE",
      nextAction: "SELECT_OR_CREATE_TARGET",
      canWriteWorkflowAssets: "no",
      mustStopForHuman: "yes",
      pendingMigrationReports: [],
      missingWorkflowAssets: [],
      missingAgentSections: [],
      notes: ["Target path does not exist."],
      suggestedCommand: "Select or create a valid project root.",
    };
  }

  const kitRoot = localKitRoot();
  const localVersion = readLocalKitVersion(kitRoot);
  const isDevKitRepository = exists("VERSION.md")
    && exists("core/workflow.md")
    && exists("templates/workflow-version.json")
    && exists("scripts/init-project.mjs");
  if (isDevKitRepository) {
    return {
      projectRoot,
      projectState: "DEV_KIT_REPOSITORY",
      workflowState: "DEV_KIT_SOURCE",
      onboardingState: "NOT_APPLICABLE",
      versionState: localVersion ? "CURRENT" : "UNKNOWN_LOCAL_DEV_KIT",
      nextAction: "RUN_DEV_KIT_SELF_CHECK",
      canWriteWorkflowAssets: "not_applicable",
      mustStopForHuman: "no",
      pendingMigrationReports: [],
      missingWorkflowAssets: [],
      missingAgentSections: [],
      notes: [
        localVersion ? `Local dev-kit version: ${localVersion}` : "Local dev-kit version is unavailable.",
        "This directory is the dev-kit source repository, not a target project.",
      ],
      suggestedCommand: commandFor("RUN_DEV_KIT_SELF_CHECK", kitRoot),
    };
  }

  const version = readJson(".ai-native/version.json");
  const entries = rootEntries();
  const emptyLike = entries.length === 0;
  const projectHasSignals = hasProjectSignals();
  const hasAiNative = exists(".ai-native");
  const missingWorkflowAssets = workflowRequiredPaths.filter((rel) => !exists(rel));
  const pendingReports = pendingMigrationReports();
  const agentMissing = missingAgentSections();
  const onboarding = onboardingState();
  const artifactCount = workflowArtifactCount();

  let projectState;
  if (version) {
    projectState = "BOOTSTRAPPED_PROJECT";
  } else if (hasAiNative || missingWorkflowAssets.length < workflowRequiredPaths.length) {
    projectState = "PARTIALLY_BOOTSTRAPPED_PROJECT";
  } else if (emptyLike) {
    projectState = "NEW_PROJECT";
  } else if (projectHasSignals || entries.length > 0) {
    projectState = "EXISTING_PROJECT";
  } else {
    projectState = "NEW_PROJECT";
  }

  let workflowState;
  if (!version && !hasAiNative) {
    workflowState = "NOT_BOOTSTRAPPED";
  } else if (!version) {
    workflowState = "PARTIAL_BOOTSTRAP";
  } else if (pendingReports.length > 0) {
    workflowState = "BOOTSTRAPPED_WITH_PENDING_MIGRATION";
  } else if (missingWorkflowAssets.length > 0 || agentMissing.length > 0) {
    workflowState = "BOOTSTRAPPED_WITH_MISSING_ASSETS";
  } else {
    workflowState = "BOOTSTRAPPED";
  }

  let versionState;
  if (!version) {
    versionState = "NO_VERSION_FILE";
  } else if (!localVersion) {
    versionState = "UNKNOWN_LOCAL_DEV_KIT";
  } else if (version.devKitVersion !== localVersion) {
    versionState = "MISMATCH";
  } else {
    versionState = "CURRENT";
  }

  let nextAction;
  if (projectState === "NEW_PROJECT") {
    nextAction = "INIT_WITH_STARTER";
  } else if (!version || missingWorkflowAssets.length > 0 || versionState === "MISMATCH") {
    nextAction = "RUN_WORKFLOW_ASSET_UPDATE";
  } else if (pendingReports.length > 0) {
    nextAction = "REVIEW_GOVERNANCE_MIGRATION";
  } else if (agentMissing.length > 0) {
    nextAction = "RUN_WORKFLOW_ASSET_UPDATE";
  } else if (onboarding.state !== "READY") {
    nextAction = "RUN_PROJECT_ONBOARDING";
  } else if (artifactCount === 0) {
    nextAction = "READY_FOR_FIRST_REQUEST";
  } else {
    nextAction = "READY_FOR_TASK_EXECUTION";
  }

  const notes = [];
  if (version?.devKitVersion) notes.push(`Project dev-kit version: ${version.devKitVersion}`);
  if (localVersion) notes.push(`Local dev-kit version: ${localVersion}`);
  if (missingWorkflowAssets.length > 0) notes.push(`${missingWorkflowAssets.length} workflow asset(s) are missing.`);
  if (agentMissing.length > 0) notes.push(`${agentMissing.length} AGENTS.md governance section(s) are missing.`);
  if (pendingReports.length > 0) notes.push(`${pendingReports.length} migration report(s) need human approval.`);
  if (onboarding.state === "NEEDS_HUMAN_CONFIRMATION") notes.push(`${onboarding.pending.length} onboarding doc(s) still have pending decisions.`);
  if (onboarding.state === "MISSING") notes.push(`${onboarding.missing.length} onboarding doc(s) are missing.`);
  if (artifactCount > 0) notes.push(`${artifactCount} workflow artifact file(s) exist.`);
  if (notes.length === 0) notes.push("No blocking workflow issue detected.");

  const humanStopActions = new Set(["SELECT_OR_CREATE_TARGET", "REVIEW_GOVERNANCE_MIGRATION", "READY_FOR_FIRST_REQUEST"]);

  return {
    projectRoot,
    projectState,
    workflowState,
    onboardingState: onboarding.state,
    versionState,
    nextAction,
    canWriteWorkflowAssets: ["INIT_WITH_STARTER", "RUN_WORKFLOW_ASSET_UPDATE", "RUN_PROJECT_ONBOARDING"].includes(nextAction) ? "yes_with_execution_intent" : "not_without_more_input",
    mustStopForHuman: humanStopActions.has(nextAction) || pendingReports.length > 0 ? "yes" : "no",
    pendingMigrationReports: pendingReports,
    missingWorkflowAssets,
    missingAgentSections: agentMissing,
    notes,
    suggestedCommand: commandFor(nextAction, kitRoot),
  };
}

const result = buildResult();
const enforceFailures = enforceReasons(result);

if (outputJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("# Workflow Next");
  console.log("");
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`PROJECT_STATE: ${result.projectState}`);
  console.log(`WORKFLOW_STATE: ${result.workflowState}`);
  console.log(`ONBOARDING_STATE: ${result.onboardingState}`);
  console.log(`VERSION_STATE: ${result.versionState}`);
  console.log(`NEXT_ACTION: ${result.nextAction}`);
  console.log(`CAN_WRITE_WORKFLOW_ASSETS: ${result.canWriteWorkflowAssets}`);
  console.log(`MUST_STOP_FOR_HUMAN: ${result.mustStopForHuman}`);
  console.log("");
  console.log("## Notes");
  console.log("");
  for (const note of result.notes) console.log(`- ${note}`);
  console.log("");
  console.log("## Pending Migration Reports");
  console.log("");
  if (result.pendingMigrationReports.length === 0) {
    console.log("- None");
  } else {
    for (const report of result.pendingMigrationReports) console.log(`- ${report}`);
  }
  console.log("");
  console.log("## Suggested Command");
  console.log("");
  console.log(result.suggestedCommand);
  if (enforce) {
    console.log("");
    console.log("## Enforce");
    console.log("");
    if (enforceFailures.length === 0) {
      console.log("PASS");
    } else {
      for (const reason of enforceFailures) console.log(`FAIL ${reason}`);
    }
  }
}

if (enforce && enforceFailures.length > 0) {
  process.exit(2);
}

function enforceReasons(result) {
  const reasons = [];
  if (result.projectState === "TARGET_MISSING") reasons.push("target path is missing");
  if (result.versionState === "MISMATCH") reasons.push("workflow version is not current");
  if (result.workflowState === "PARTIAL_BOOTSTRAP") reasons.push("workflow bootstrap is partial");
  if (result.workflowState === "BOOTSTRAPPED_WITH_MISSING_ASSETS") reasons.push("workflow assets or AGENTS.md governance sections are missing");
  if (result.workflowState === "BOOTSTRAPPED_WITH_PENDING_MIGRATION") reasons.push("migration reports need human approval");
  if (result.nextAction === "RUN_WORKFLOW_ASSET_UPDATE") reasons.push("workflow asset update is required");
  if (result.nextAction === "RUN_PROJECT_ONBOARDING") reasons.push("project onboarding is not ready");
  return [...new Set(reasons)];
}
