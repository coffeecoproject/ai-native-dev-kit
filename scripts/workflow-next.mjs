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
  "scripts/check-platform-baseline.mjs",
  "scripts/resolve-platform-baseline.mjs",
  "scripts/check-industrial-pack.mjs",
  "scripts/resolve-industrial-baseline.mjs",
  "scripts/check-industrial-baseline.mjs",
  ".github/workflows/ai-workflow-checks.yml",
  ".ai-native/version.json",
  ".ai-native/core/workflow.md",
  ".ai-native/profiles/web-app/baseline.json",
  ".ai-native/profiles/backend-api/baseline.json",
  ".ai-native/profiles/ios-app/baseline.json",
  ".ai-native/profiles/android-app/baseline.json",
  ".ai-native/profiles/wechat-miniprogram/baseline.json",
  ".ai-native/profiles/internal-admin/baseline.json",
  ".ai-native/profiles/high-risk-change/baseline.json",
  ".ai-native/core/project-onboarding.md",
  ".ai-native/prompts/bootstrap-agent.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/templates/baseline-selection.md",
  ".ai-native/templates/baseline-evidence.md",
  ".ai-native/checklists/project-onboarding-review.md",
  ".ai-native/checklists/industrial-pack-review.md",
  ".ai-native/industrial-packs/index.json",
  ".ai-native/industrial-packs/web-app/pack.json",
  "docs/verification-matrix.md",
];

const requiredAgentSections = [
  "Mission",
  "Core Rules",
  "Bootstrap Entry",
  "Project Onboarding",
  "Platform Baseline",
  "Industrial Baseline",
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
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

function cleanProfileId(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function isProfilePlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(profile-id|selected profile|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function selectedProfiles() {
  const content = read("docs/project-profile.md");
  if (!content) return [];
  const body = sectionBody(content, "Selected Profiles");
  if (!body) return [];
  return [...new Set(body
    .split("\n")
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/)?.[1])
    .map(cleanProfileId)
    .filter((value) => !isProfilePlaceholder(value)))].sort();
}

function cleanListValue(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function isBaselinePlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(industrial-pack-id|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function parseSingleEnum(body, allowed) {
  if (!body) return null;
  const allowedPattern = allowed.map(escapeRegExp).join("|");
  for (const line of body.split("\n")) {
    const matches = line.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
    const distinct = unique(matches);
    if (distinct.length === 1) return distinct[0];
  }
  const matches = body.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
  const distinct = unique(matches);
  return distinct.length === 1 ? distinct[0] : null;
}

function selectedBaselineLevel() {
  const content = read("docs/baseline-selection.md");
  if (!content) return null;
  return parseSingleEnum(sectionBody(content, "Baseline Level"), ["BL0_LIGHTWEIGHT", "BL1_STANDARD", "BL2_INDUSTRIAL"]);
}

function selectedIndustrialPacks() {
  const content = read("docs/baseline-selection.md");
  if (!content) return [];
  const body = sectionBody(content, "Selected Industrial Packs");
  if (!body) return [];
  const packs = [];
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) continue;
    const value = cleanListValue(match[1]);
    if (isBaselinePlaceholder(value)) continue;
    const token = value.match(/\b[a-z0-9][a-z0-9-]*-industrial\b/i)?.[0];
    if (token && !isBaselinePlaceholder(token)) packs.push(token);
  }
  return unique(packs);
}

function industrialHumanApprovalStatus() {
  const content = read("docs/baseline-selection.md");
  if (!content) return null;
  return parseSingleEnum(sectionBody(content, "Human Approval"), ["PENDING", "APPROVED", "REJECTED"]);
}

function industrialBaselineState() {
  const hasSelection = exists("docs/baseline-selection.md");
  const baselineLevel = selectedBaselineLevel();
  const selectedPacks = selectedIndustrialPacks();
  const humanApprovalStatus = industrialHumanApprovalStatus();
  const selectedProfileIds = selectedProfiles();
  const base = {
    baselineLevel,
    selectedIndustrialPacks: selectedPacks,
    humanApprovalStatus,
    unknownPacks: [],
    plannedPacks: [],
    invalidPacks: [],
    incompatiblePacks: [],
    missingProjectDocs: [],
  };

  if (!hasSelection || !baselineLevel) {
    return { ...base, state: "NOT_SELECTED" };
  }
  if (baselineLevel !== "BL2_INDUSTRIAL") {
    return { ...base, state: "NOT_APPLICABLE" };
  }

  const index = readJson(".ai-native/industrial-packs/index.json");
  if (!index?.packs) {
    return { ...base, state: "PACK_INDEX_MISSING" };
  }
  if (selectedPacks.length === 0) {
    return { ...base, state: "PACKS_NOT_SELECTED" };
  }

  const entriesById = new Map(index.packs.map((entry) => [entry.id, entry]));
  const unknownPacks = selectedPacks.filter((packId) => !entriesById.has(packId));
  const plannedPacks = selectedPacks
    .map((packId) => entriesById.get(packId))
    .filter((entry) => entry?.status === "planned")
    .map((entry) => entry.id);
  const invalidPacks = [];
  const incompatiblePacks = [];
  for (const packId of selectedPacks) {
    const entry = entriesById.get(packId);
    if (!entry || entry.status === "planned") continue;
    const manifest = readJson(path.join(".ai-native", "industrial-packs", entry.path || "", "pack.json"));
    if (!manifest) {
      invalidPacks.push(packId);
      continue;
    }
    const appliesToProfiles = Array.isArray(manifest.appliesToProfiles) ? manifest.appliesToProfiles : entry.appliesToProfiles || [];
    if (appliesToProfiles.length > 0
      && selectedProfileIds.length > 0
      && !appliesToProfiles.some((profileId) => selectedProfileIds.includes(profileId))) {
      incompatiblePacks.push(packId);
    }
  }

  if (unknownPacks.length > 0 || invalidPacks.length > 0) {
    return { ...base, state: "PACKS_INVALID", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }
  if (plannedPacks.length > 0) {
    return { ...base, state: "PACKS_NOT_AVAILABLE", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }
  if (incompatiblePacks.length > 0) {
    return { ...base, state: "PACKS_INCOMPATIBLE", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }

  const missingProjectDocs = ["docs/baseline-selection.md", "docs/baseline-evidence.md"].filter((rel) => !exists(rel));
  if (missingProjectDocs.length > 0) {
    return { ...base, state: "EVIDENCE_MISSING", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
  }
  if (humanApprovalStatus !== "APPROVED") {
    return { ...base, state: "NEEDS_HUMAN_APPROVAL", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
  }
  return { ...base, state: "BASELINE_READY", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
}

function platformBaselineState() {
  if (!exists("docs/project-profile.md")) {
    return { state: "MISSING_PROFILE", selectedProfiles: [], missingProfiles: [], missingRequiredDocs: [] };
  }
  const selected = selectedProfiles();
  if (selected.length === 0) {
    return { state: "MISSING_PROFILE", selectedProfiles: [], missingProfiles: [], missingRequiredDocs: [] };
  }
  const missingProfiles = selected.filter((profileId) => !exists(path.join(".ai-native", "profiles", profileId, "baseline.json")));
  if (missingProfiles.length > 0) {
    return { state: "PROFILE_INVALID", selectedProfiles: selected, missingProfiles, missingRequiredDocs: [] };
  }
  const requiredDocs = new Set();
  for (const profileId of selected) {
    const baseline = readJson(path.join(".ai-native", "profiles", profileId, "baseline.json"));
    for (const rel of baseline?.requiredDocs || []) requiredDocs.add(rel);
  }
  const missingRequiredDocs = [...requiredDocs].filter((rel) => !exists(rel)).sort();
  if (missingRequiredDocs.length > 0) {
    return { state: "BASELINE_DOCS_MISSING", selectedProfiles: selected, missingProfiles: [], missingRequiredDocs };
  }
  return { state: "BASELINE_READY", selectedProfiles: selected, missingProfiles: [], missingRequiredDocs: [] };
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
  if (action === "RUN_PLATFORM_BASELINE_SETUP") {
    return "Select project profiles in docs/project-profile.md, then run node scripts/check-platform-baseline.mjs .";
  }
  if (action === "RUN_INDUSTRIAL_BASELINE_SETUP") {
    return "For BL2 work, draft docs/baseline-selection.md and docs/baseline-evidence.md from .ai-native/templates, then run node scripts/check-industrial-baseline.mjs .";
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
      platformBaselineState: "UNAVAILABLE",
      industrialBaselineState: "UNAVAILABLE",
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
      platformBaselineState: "NOT_APPLICABLE",
      industrialBaselineState: "NOT_APPLICABLE",
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
  const platformBaseline = platformBaselineState();
  const industrialBaseline = industrialBaselineState();
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
  } else if (platformBaseline.state !== "BASELINE_READY") {
    nextAction = "RUN_PLATFORM_BASELINE_SETUP";
  } else if ([
    "PACK_INDEX_MISSING",
    "PACKS_NOT_SELECTED",
    "PACKS_INVALID",
    "PACKS_NOT_AVAILABLE",
    "PACKS_INCOMPATIBLE",
    "EVIDENCE_MISSING",
    "NEEDS_HUMAN_APPROVAL",
  ].includes(industrialBaseline.state)) {
    nextAction = "RUN_INDUSTRIAL_BASELINE_SETUP";
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
  if (platformBaseline.state === "MISSING_PROFILE") notes.push("Project profile has not selected platform profiles.");
  if (platformBaseline.state === "PROFILE_INVALID") notes.push(`${platformBaseline.missingProfiles.length} selected platform profile(s) are missing.`);
  if (platformBaseline.state === "BASELINE_DOCS_MISSING") notes.push(`${platformBaseline.missingRequiredDocs.length} platform baseline doc(s) are missing.`);
  if (platformBaseline.selectedProfiles.length > 0) notes.push(`Selected platform profiles: ${platformBaseline.selectedProfiles.join(", ")}.`);
  if (industrialBaseline.baselineLevel) notes.push(`Selected baseline level: ${industrialBaseline.baselineLevel}.`);
  if (industrialBaseline.selectedIndustrialPacks.length > 0) notes.push(`Selected industrial packs: ${industrialBaseline.selectedIndustrialPacks.join(", ")}.`);
  if (industrialBaseline.state === "NOT_SELECTED") notes.push("Industrial baseline level is not selected; BL2 checks are not active.");
  if (industrialBaseline.state === "PACK_INDEX_MISSING") notes.push("Industrial pack index is missing.");
  if (industrialBaseline.state === "PACKS_NOT_SELECTED") notes.push("BL2 is selected but no industrial packs are selected.");
  if (industrialBaseline.state === "PACKS_INVALID") notes.push("One or more selected industrial packs are unknown or invalid.");
  if (industrialBaseline.state === "PACKS_NOT_AVAILABLE") notes.push("One or more selected industrial packs are planned but not executable yet.");
  if (industrialBaseline.state === "PACKS_INCOMPATIBLE") notes.push("One or more selected industrial packs do not match selected platform profiles.");
  if (industrialBaseline.state === "EVIDENCE_MISSING") notes.push(`${industrialBaseline.missingProjectDocs.length} BL2 project evidence doc(s) are missing.`);
  if (industrialBaseline.state === "NEEDS_HUMAN_APPROVAL") notes.push("BL2 industrial baseline still needs explicit human approval.");
  if (artifactCount > 0) notes.push(`${artifactCount} workflow artifact file(s) exist.`);
  if (notes.length === 0) notes.push("No blocking workflow issue detected.");

  const humanStopActions = new Set(["SELECT_OR_CREATE_TARGET", "REVIEW_GOVERNANCE_MIGRATION", "READY_FOR_FIRST_REQUEST"]);

  return {
    projectRoot,
    projectState,
    workflowState,
    onboardingState: onboarding.state,
    platformBaselineState: platformBaseline.state,
    industrialBaselineState: industrialBaseline.state,
    baselineLevel: industrialBaseline.baselineLevel,
    selectedIndustrialPacks: industrialBaseline.selectedIndustrialPacks,
    versionState,
    nextAction,
    canWriteWorkflowAssets: ["INIT_WITH_STARTER", "RUN_WORKFLOW_ASSET_UPDATE", "RUN_PROJECT_ONBOARDING", "RUN_PLATFORM_BASELINE_SETUP", "RUN_INDUSTRIAL_BASELINE_SETUP"].includes(nextAction) ? "yes_with_execution_intent" : "not_without_more_input",
    mustStopForHuman: humanStopActions.has(nextAction) || pendingReports.length > 0 || industrialBaseline.state === "NEEDS_HUMAN_APPROVAL" ? "yes" : "no",
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
  console.log(`PLATFORM_BASELINE_STATE: ${result.platformBaselineState}`);
  console.log(`INDUSTRIAL_BASELINE_STATE: ${result.industrialBaselineState}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
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
  if (result.nextAction === "RUN_PLATFORM_BASELINE_SETUP") reasons.push("platform baseline is not ready");
  if (result.nextAction === "RUN_INDUSTRIAL_BASELINE_SETUP") reasons.push("industrial baseline is not ready");
  return [...new Set(reasons)];
}
