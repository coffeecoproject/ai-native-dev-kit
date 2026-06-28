#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { walkRelativePaths } from "./lib/project-signals.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { buildStandardBaselineRecommendation } from "./resolve-standard-baseline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format"]);
const unknown = unknownOptions(args, knownFlags);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const outputFormat = args.json ? "json" : String(args.format || "human");
if (!new Set(["human", "json", "markdown"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human, --format markdown, or --json.");
  process.exit(1);
}

const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const decision = buildGuidedBaselineDecision(projectRoot);

if (outputFormat === "json") {
  console.log(JSON.stringify(decision, null, 2));
} else {
  console.log(renderDecisionCard(decision));
}

export function buildGuidedBaselineDecision(root) {
  const projectRoot = path.resolve(root);
  const workflow = runWorkflowNext(projectRoot);
  const git = gitWorktreeState(projectRoot);
  const signals = detectSignals(projectRoot);
  const projectState = classifyProject(workflow, git, signals);
  const profiles = chooseProfiles(workflow, signals);
  const risk = classifyRisk(projectState, signals);
  const baselineLevel = recommendBaselineLevel(projectState, profiles, risk, workflow);
  const platformStates = classifyPlatformStates(workflow, signals, profiles);
  const standardRecommendation = safeStandardRecommendation(projectRoot);
  const standardPacks = recommendStandardPacks(profiles, baselineLevel, standardRecommendation);
  const industrialCandidates = recommendIndustrialCandidates(profiles, baselineLevel, risk);
  const notSelected = buildNotSelected(projectRoot, standardPacks, industrialCandidates, profiles, risk, baselineLevel, platformStates);

  return {
    reportType: "BASELINE_DECISION_CARD",
    generatedBy: "scripts/resolve-guided-baseline-selection.mjs",
    generatedAt: new Date().toISOString(),
    readOnly: true,
    canAiWriteTargetFilesNow: "No",
    projectRoot,
    humanSummary: humanSummary(projectState, baselineLevel, profiles, risk),
    projectState,
    platformAndScope: {
      detectedPlatform: platformLabel(profiles),
      platformStateSummary: platformStateSummary(platformStates),
      backendApiScope: backendScope(profiles, signals),
      productionSensitivity: risk.productionSensitivity,
      highRiskScope: risk.highRiskScope,
    },
    platformStates,
    recommendedBaselineLevel: baselineLevel,
    recommendedStandardPacks: standardPacks,
    candidateIndustrialPacks: industrialCandidates,
    notSelected,
    humanDecisionsNeeded: humanDecisions(projectState, profiles, risk, baselineLevel),
    safeNextActions: safeNextActions(projectState, baselineLevel, standardPacks, industrialCandidates),
    boundary: [
      "This card authorizes target-project writes: No",
      "This card approves implementation: No",
      "This card approves release or production: No",
      "This card approves security/privacy/compliance/payment/migration decisions: No",
      "This card proves real project evidence exists: No",
    ],
    evidence: evidenceRows(projectRoot, workflow, git, signals, baselineLevel, industrialCandidates),
    workflowNext: workflow,
    git,
    signals,
    lowerLevelRecommendationState: standardRecommendation?.state || "UNAVAILABLE",
  };
}

function runWorkflowNext(targetRoot) {
  const result = spawnSync(process.execPath, ["scripts/workflow-next.mjs", targetRoot, "--json"], {
    cwd: kitRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return {
      projectRoot: targetRoot,
      projectState: fs.existsSync(targetRoot) ? "UNKNOWN" : "TARGET_MISSING",
      workflowState: "UNAVAILABLE",
      projectStateTags: [],
      adoptionMode: "unknown",
      nextAction: "DISCUSS_PROJECT_STATE",
      canWriteWorkflowAssets: "no",
      error: result.stderr || result.stdout || "workflow-next failed",
    };
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    return {
      projectRoot: targetRoot,
      projectState: fs.existsSync(targetRoot) ? "UNKNOWN" : "TARGET_MISSING",
      workflowState: "UNPARSEABLE",
      projectStateTags: [],
      adoptionMode: "unknown",
      nextAction: "DISCUSS_PROJECT_STATE",
      canWriteWorkflowAssets: "no",
      error: error.message,
    };
  }
}

function detectSignals(targetRoot) {
  const rels = new Set(walkRelativePaths(targetRoot, ".", { maxDepth: 4 }).map((item) => item.replace(/\\/g, "/")));
  const packageJson = readJsonIfExists(path.join(targetRoot, "package.json"));
  const packageText = packageJson ? JSON.stringify({
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    scripts: packageJson.scripts || {},
  }) : "";
  const joinedPaths = [...rels].join("\n");
  return {
    rels: [...rels].sort(),
    packageText,
    hasPackageJson: Boolean(packageJson),
    hasExistingGovernance: hasAny(rels, [
      "AGENTS.md",
      ".github/workflows",
      ".github/pull_request_template.md",
      "docs/engineering-baseline.md",
      "docs/environment-baseline.md",
      "docs/release",
      "docs/governance",
    ]),
    hasReleaseSignals: /\b(release|rollback|deploy|production|ci|workflow|sop)\b/i.test(joinedPaths),
    hasAuthSignals: /\b(auth|login|permission|rbac|role|acl|session)\b/i.test(`${joinedPaths}\n${packageText}`),
    hasDataSignals: /\b(database|db|schema|migration|prisma|drizzle|typeorm|sequelize|sql|storage)\b/i.test(`${joinedPaths}\n${packageText}`),
    hasPaymentSignals: /\b(payment|pay|stripe|wechatpay|alipay|invoice|billing|finance|tax)\b/i.test(`${joinedPaths}\n${packageText}`),
    hasIrreversibleSignals: /\b(migration|delete|destructive|irreversible|backfill|rollback)\b/i.test(joinedPaths),
    hasMiniProgramCloudFunctionSignals: hasMiniProgramCloudFunctionSignals(rels),
    profiles: detectProfiles(rels, packageText),
  };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function hasAny(rels, needles) {
  for (const needle of needles) {
    if (rels.has(needle) || [...rels].some((item) => item.startsWith(`${needle}/`) || item.includes(`/${needle}/`))) return true;
  }
  return false;
}

function detectProfiles(rels, packageText) {
  const profiles = [];
  if (rels.has("package.json") || rels.has("vite.config.ts") || rels.has("vite.config.js") || rels.has("next.config.js") || rels.has("next.config.mjs") || /react|next|vue|vite|svelte/i.test(packageText)) {
    profiles.push(profile("web-app", "Web app signals found."));
  }
  if (rels.has("project.config.json") || rels.has("app.json") || rels.has("miniprogram") || rels.has("cloudfunctions")) {
    profiles.push(profile("wechat-miniprogram", "Mini Program config or cloudfunctions signals found."));
  }
  if ([...rels].some((item) => item.endsWith(".xcodeproj") || item.endsWith(".xcworkspace")) || rels.has("Package.swift") || rels.has("ios")) {
    profiles.push(profile("ios-app", "iOS project signals found."));
  }
  if (rels.has("build.gradle") || rels.has("settings.gradle") || rels.has("android") || [...rels].some((item) => item.endsWith(".gradle"))) {
    profiles.push(profile("android-app", "Android project signals found."));
  }
  if (rels.has("server") || rels.has("backend") || rels.has("services") || rels.has("go.mod") || rels.has("pyproject.toml") || /express|fastify|nestjs|prisma|typeorm|drizzle/i.test(packageText)) {
    profiles.push(profile("backend-api", "Backend/API signals found."));
  }
  if (hasInternalAdminSignals(rels, packageText)) {
    profiles.push(profile("internal-admin", "Internal admin, dashboard, approval, or operations console signals found."));
  }
  return profiles;
}

function hasMiniProgramCloudFunctionSignals(rels) {
  return [...rels].some((item) => /(^|\/)(cloudfunctions|cloud-functions|functions)(\/|$)/i.test(item));
}

function hasInternalAdminSignals(rels, packageText) {
  return /\b(admin|dashboard|management-console|ops-console|operations-console|approval|merchant-admin|platform-admin|web-admin)\b/i.test(packageText)
    || [...rels].some((item) => /(^|\/)(admin|dashboard|console|approval)(\/|$)|(^|\/)apps\/[^/]*(admin|dashboard)[^/]*(\/|$)|[-_](admin|dashboard)([-_/]|$)/i.test(item));
}

function profile(id, reason) {
  return { id, reason };
}

function classifyProject(workflow, git, signals) {
  const tags = new Set(workflow.projectStateTags || []);
  if (workflow.projectState === "DEV_KIT_REPOSITORY" || tags.has("DEV_KIT_REPOSITORY")) {
    return {
      label: "Dev Kit source repository",
      internal: "DEV_KIT_REPOSITORY",
      defaultAdoptionMode: "dev-kit-maintenance",
      canCodexWriteNow: "No",
      why: "This directory is the AI Native Dev Kit source repository.",
    };
  }
  if (git.isDirty || tags.has("DIRTY_WORKTREE_PROJECT")) {
    return {
      label: "Dirty worktree",
      internal: "DIRTY_WORKTREE_PROJECT",
      defaultAdoptionMode: "read-only",
      canCodexWriteNow: "No",
      why: "Uncommitted changes exist, so Codex must not write before the human decides how to handle current work.",
    };
  }
  if (tags.has("PRODUCTION_GOVERNED_PROJECT") || signals.hasReleaseSignals) {
    return {
      label: "Production-sensitive project",
      internal: "PRODUCTION_SENSITIVE_PROJECT",
      defaultAdoptionMode: "adapter-only",
      canCodexWriteNow: "No",
      why: "Release, production, CI, rollback, or governance signals were detected.",
    };
  }
  if (tags.has("GOVERNED_EXISTING_PROJECT") || signals.hasExistingGovernance) {
    return {
      label: "Existing governed project",
      internal: "EXISTING_GOVERNED_PROJECT",
      defaultAdoptionMode: "read-only mapping first",
      canCodexWriteNow: "No",
      why: "Existing governance or baseline assets were detected.",
    };
  }
  if (workflow.projectState === "NEW_PROJECT" || workflow.projectState === "TARGET_MISSING") {
    return {
      label: "New empty project",
      internal: "NEW_EMPTY_PROJECT",
      defaultAdoptionMode: "guided-init after confirmation",
      canCodexWriteNow: "No",
      why: "The target appears empty, missing, or not yet configured.",
    };
  }
  if (workflow.projectState === "EXISTING_PROJECT" || workflow.projectState === "PARTIALLY_BOOTSTRAPPED_PROJECT") {
    return {
      label: "Existing light project",
      internal: "EXISTING_LIGHT_PROJECT",
      defaultAdoptionMode: "gap review first",
      canCodexWriteNow: "No",
      why: "Project files exist, but strong governance signals were not detected.",
    };
  }
  return {
    label: "Unknown project state",
    internal: "UNKNOWN",
    defaultAdoptionMode: "discuss-only",
    canCodexWriteNow: "No",
    why: "Codex needs the human to confirm project state before baseline setup.",
  };
}

function chooseProfiles(workflow, signals) {
  const fromDocs = Array.isArray(workflow.selectedProfiles) ? workflow.selectedProfiles : [];
  const inferred = signals.profiles.map((item) => item.id);
  const ids = unique([...fromDocs, ...inferred]);
  return ids.length > 0 ? ids.map((id) => ({ id, reason: profileReason(id, signals) })) : [{ id: "unknown", reason: "No strong platform signal found." }];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function profileReason(id, signals) {
  return signals.profiles.find((item) => item.id === id)?.reason || "Selected or inferred from project evidence.";
}

function classifyRisk(projectState, signals) {
  if (projectState.internal === "DEV_KIT_REPOSITORY") {
    return {
      productionSensitivity: "not applicable",
      highRiskScope: "not applicable",
      hasHighRisk: false,
    };
  }
  const scopes = [];
  if (signals.hasAuthSignals) scopes.push("permission");
  if (signals.hasDataSignals) scopes.push("data");
  if (signals.hasPaymentSignals) scopes.push("payment/finance/tax");
  if (signals.hasIrreversibleSignals) scopes.push("migration/irreversible data");
  const productionSensitivity = projectState.internal === "PRODUCTION_SENSITIVE_PROJECT"
    ? "confirmed"
    : projectState.internal === "EXISTING_GOVERNED_PROJECT"
      ? "possible"
      : "not detected";
  return {
    productionSensitivity,
    highRiskScope: scopes.length > 0 ? scopes.join(", ") : "none detected",
    hasHighRisk: scopes.length > 0 || productionSensitivity === "confirmed",
  };
}

function recommendBaselineLevel(projectState, profiles, risk, workflow) {
  const current = workflow.baselineLevel || null;
  if (projectState.internal === "DEV_KIT_REPOSITORY") {
    return {
      level: "NOT_APPLICABLE",
      userLabel: "Not applicable",
      why: "This is the dev-kit source repository, not a target project adoption.",
      currentSelectedLevel: current || "not applicable",
      bl2Status: "not selected",
    };
  }
  if (risk.hasHighRisk && projectState.internal !== "DIRTY_WORKTREE_PROJECT") {
    return {
      level: "BL2_INDUSTRIAL",
      userLabel: "Industrial",
      why: "High-risk or production-sensitive signals exist. BL2 is a candidate recommendation and still needs human confirmation plus evidence.",
      currentSafeAction: "BL1_STANDARD_READ_ONLY_MAPPING",
      targetCandidateLevel: "BL2_INDUSTRIAL",
      currentSelectedLevel: current || "none",
      bl2Status: "candidate only",
    };
  }
  if (risk.hasHighRisk && projectState.internal === "DIRTY_WORKTREE_PROJECT") {
    return {
      level: "BL1_STANDARD",
      userLabel: "Standard",
      why: "Dirty worktree protection blocks writes now. High-risk signals may still make BL2 a candidate after the worktree decision is resolved.",
      currentSafeAction: "READ_ONLY_UNTIL_WORKTREE_DECISION",
      targetCandidateLevel: "BL2_INDUSTRIAL",
      currentSelectedLevel: current || "none",
      bl2Status: "candidate after worktree resolution",
    };
  }
  if (projectState.internal === "NEW_EMPTY_PROJECT" && profiles.some((item) => item.id === "unknown")) {
    return {
      level: "BL0_LIGHTWEIGHT",
      userLabel: "Lightweight",
      why: "The platform is not confirmed yet, so start lightweight and ask the human to confirm scope.",
      currentSafeAction: "BL0_LIGHTWEIGHT_DISCOVERY",
      targetCandidateLevel: null,
      currentSelectedLevel: current || "none",
      bl2Status: "not selected",
    };
  }
  return {
    level: "BL1_STANDARD",
    userLabel: "Standard",
    why: "This is enough for normal Web, app, Mini Program, backend, or admin work before high-risk scope is confirmed.",
    currentSafeAction: "BL1_STANDARD_PLAN_FIRST",
    targetCandidateLevel: null,
    currentSelectedLevel: current || "none",
    bl2Status: "not selected",
  };
}

function classifyPlatformStates(workflow, signals, profiles) {
  const selected = new Set(profiles.map((item) => item.id).filter((id) => id !== "unknown"));
  const confirmed = new Set(Array.isArray(workflow.selectedProfiles) ? workflow.selectedProfiles : []);
  return [
    "web-app",
    "wechat-miniprogram",
    "ios-app",
    "android-app",
    "backend-api",
    "internal-admin",
  ].map((id) => {
    if (selected.has(id)) {
      return {
        profile: id,
        state: confirmed.has(id) ? "selected-confirmed" : "selected-inferred",
        reason: profileReason(id, signals),
      };
    }
    const presence = profilePresence(id, signals);
    if (presence.present) {
      return {
        profile: id,
        state: presence.deferred ? "present-inactive-or-deferred" : "present-needs-confirmation",
        reason: presence.reason,
      };
    }
    return {
      profile: id,
      state: "not-detected",
      reason: "No matching project signal was detected.",
    };
  });
}

function profilePresence(id, signals) {
  const rels = signals.rels || [];
  const packageText = signals.packageText || "";
  const hasPath = (pattern) => rels.some((item) => pattern.test(item));
  const hasNoScript = (name) => new RegExp(`\\b(no|without|skip)[-_]${name}\\b|\\bactive-no-${name}\\b`, "i").test(packageText);
  if (id === "web-app" && (hasPath(/(^|\/)apps\/[^/]*(web|frontend)[^/]*(\/|$)/i) || /web[:\w-]*check|web[:\w-]*build/i.test(packageText))) {
    return { present: true, reason: "Web app directory or script is present." };
  }
  if (id === "wechat-miniprogram" && (hasPath(/(^|\/)(miniapp|miniprogram|cloudfunctions|cloud-functions)(\/|$)/i) || /miniapp|miniprogram/i.test(packageText))) {
    return { present: true, deferred: hasNoScript("miniapp") || hasNoScript("miniprogram"), reason: "Mini Program or cloud-function structure is present." };
  }
  if (id === "ios-app" && hasPath(/(^|\/)(ios|[^/]+\.xcodeproj|[^/]+\.xcworkspace)(\/|$)/i)) {
    return { present: true, reason: "iOS app structure is present." };
  }
  if (id === "android-app" && (hasPath(/(^|\/)(android|build\.gradle|settings\.gradle)(\/|$)/i) || /android/i.test(packageText))) {
    return { present: true, deferred: hasNoScript("android"), reason: "Android structure or script is present." };
  }
  if (id === "backend-api" && (hasPath(/(^|\/)(backend|server|services|api-contracts|contracts|db|database)(\/|$)/i) || /backend|api-contract|server/i.test(packageText))) {
    return { present: true, reason: "Backend, API contract, service, or database structure is present." };
  }
  if (id === "internal-admin" && hasInternalAdminSignals(new Set(rels), packageText)) {
    return { present: true, reason: "Admin or operations console structure is present." };
  }
  return { present: false, reason: "" };
}

function platformStateSummary(states) {
  const visible = states.filter((item) => item.state !== "not-detected");
  if (visible.length === 0) return "none detected";
  return visible.map((item) => `${item.profile}: ${item.state}`).join("; ");
}

function safeStandardRecommendation(projectRoot) {
  try {
    return buildStandardBaselineRecommendation(projectRoot, { umbrella: true });
  } catch {
    return null;
  }
}

function recommendStandardPacks(profiles, baselineLevel, standardRecommendation) {
  if (baselineLevel.level === "NOT_APPLICABLE") return [];
  const fromResolver = Array.isArray(standardRecommendation?.recommendedStandardPacks)
    ? standardRecommendation.recommendedStandardPacks.map((pack) => pack.id)
    : [];
  const mapped = profiles.flatMap((item) => standardPacksForProfile(item.id));
  if (baselineLevel.level === "BL0_LIGHTWEIGHT") return unique(mapped.slice(0, 1));
  const withEnvironment = mapped.length > 0 ? [...mapped, "environment-standard"] : [];
  return unique([...fromResolver, ...withEnvironment]);
}

function standardPacksForProfile(profileId) {
  const map = {
    "web-app": ["web-runtime-standard"],
    "wechat-miniprogram": ["miniprogram-runtime-standard"],
    "ios-app": ["ios-app-standard"],
    "android-app": ["android-app-standard"],
    "backend-api": ["backend-api-standard"],
    "internal-admin": ["internal-admin-standard"],
  };
  return map[profileId] || [];
}

function recommendIndustrialCandidates(profiles, baselineLevel, risk) {
  if (baselineLevel.level !== "BL2_INDUSTRIAL") return [];
  const candidates = [];
  for (const item of profiles) {
    const pack = industrialPackForProfile(item.id);
    if (pack) candidates.push(pack);
  }
  if (/permission/i.test(risk.highRiskScope)) candidates.push("auth-permission-industrial");
  if (/\bdata\b/i.test(risk.highRiskScope)) candidates.push("data-storage-industrial");
  if (/payment|finance|tax/i.test(risk.highRiskScope)) candidates.push("payment-value-transfer-industrial");
  if (/migration|irreversible/i.test(risk.highRiskScope) || risk.productionSensitivity === "confirmed") candidates.push("high-risk-change-industrial");
  return unique(candidates);
}

function industrialPackForProfile(profileId) {
  const map = {
    "web-app": "web-app-industrial",
    "wechat-miniprogram": "wechat-miniprogram-industrial",
    "ios-app": "ios-app-industrial",
    "android-app": "android-app-industrial",
    "backend-api": "backend-api-industrial",
    "internal-admin": "internal-admin-industrial",
  };
  return map[profileId] || null;
}

function buildNotSelected(projectRoot, standardPacks, industrialCandidates, profiles, risk, baselineLevel, platformStates = []) {
  const rows = [];
  const selectedStandard = new Set(standardPacks);
  const candidateIndustrial = new Set(industrialCandidates);
  for (const id of loadPackIds(projectRoot, "standard-baseline-packs")) {
    if (!selectedStandard.has(id)) rows.push({ pack: id, reason: notSelectedStandardReason(id, profiles, platformStates) });
  }
  for (const id of loadPackIds(projectRoot, "industrial-packs")) {
    if (!candidateIndustrial.has(id)) rows.push({ pack: id, reason: notSelectedIndustrialReason(id, risk, baselineLevel) });
  }
  return rows.slice(0, 12);
}

function loadPackIds(projectRoot, registryName) {
  const candidates = [
    path.join(projectRoot, ".ai-native", registryName, "index.json"),
    path.join(projectRoot, registryName, "index.json"),
    path.join(kitRoot, registryName, "index.json"),
  ];
  const indexPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!indexPath) return [];
  const parsed = readJsonIfExists(indexPath);
  return Array.isArray(parsed?.packs) ? parsed.packs.map((entry) => entry.id).filter(Boolean).sort() : [];
}

function notSelectedStandardReason(id, profiles, platformStates = []) {
  const profileId = profileForStandardPack(id);
  const state = platformStates.find((item) => item.profile === profileId);
  if (state && state.state !== "selected-confirmed" && state.state !== "selected-inferred" && state.state !== "not-detected") {
    return `${state.state}; confirm this profile before selecting the pack.`;
  }
  if (id === "backend-api-standard" && !profiles.some((item) => item.id === "backend-api")) return "not selected until backend/API scope is confirmed.";
  if (id === "release-rollback-standard") return "not selected until release or rollback scope is confirmed.";
  return "not selected because current platform and scope do not require it.";
}

function profileForStandardPack(id) {
  const map = {
    "web-runtime-standard": "web-app",
    "miniprogram-runtime-standard": "wechat-miniprogram",
    "ios-app-standard": "ios-app",
    "android-app-standard": "android-app",
    "backend-api-standard": "backend-api",
    "internal-admin-standard": "internal-admin",
  };
  return map[id] || null;
}

function notSelectedIndustrialReason(id, risk, baselineLevel) {
  if (baselineLevel.level !== "BL2_INDUSTRIAL") return "not selected because BL2 is not confirmed.";
  if (id === "payment-value-transfer-industrial" && !/payment|finance|tax/i.test(risk.highRiskScope)) return "not selected because payment, finance, tax, or value transfer scope is not confirmed.";
  if (id === "auth-permission-industrial" && !/permission/i.test(risk.highRiskScope)) return "not selected because permission risk is not confirmed.";
  return "not selected until explicit BL2 evidence and human approval require it.";
}

function humanSummary(projectState, baselineLevel, profiles, risk) {
  const platform = platformLabel(profiles);
  const riskText = risk.hasHighRisk ? "High-risk or production-sensitive signals need confirmation." : "No high-risk scope is confirmed yet.";
  const recommendation = baselineLevel.targetCandidateLevel
    ? `Current safe action is ${baselineLevel.currentSafeAction}; ${baselineLevel.targetCandidateLevel} is ${baselineLevel.bl2Status}.`
    : `I recommend ${baselineLevel.level} for this phase.`;
  return [
    `I think this is a ${projectState.label.toLowerCase()} with ${platform}.`,
    recommendation,
    `${riskText} This card does not approve writes or implementation.`,
  ];
}

function platformLabel(profiles) {
  const labels = profiles.map((item) => item.id).filter((id) => id !== "unknown");
  return labels.length > 0 ? labels.join(" + ") : "unknown platform";
}

function backendScope(profiles, signals) {
  if (profiles.some((item) => item.id === "backend-api")) return "confirmed by project signals";
  if (signals.hasMiniProgramCloudFunctionSignals) return "possible; Mini Program cloud functions need confirmation";
  if (signals.hasDataSignals) return "possible; needs confirmation";
  return "not detected";
}

function humanDecisions(projectState, profiles, risk, baselineLevel) {
  if (projectState.internal === "DEV_KIT_REPOSITORY") {
    return [
      "Is this work maintaining the dev-kit itself rather than adopting a target project?",
      "Should Codex run dev-kit verification before any code change?",
    ];
  }
  if (projectState.internal === "DIRTY_WORKTREE_PROJECT") {
    return [
      "Should Codex continue read-only, create a plan only, or wait until current changes are committed?",
      "Which current changes belong to the user and must not be touched?",
      "May Codex generate a baseline decision card file after the worktree is clean?",
    ];
  }
  const questions = [
    "Is this project already serving real users?",
    "Does this phase include backend/API/database changes?",
    "Does this phase include permission, payment, finance, HR, tax, migration, or irreversible data changes?",
    `Do you confirm ${baselineLevel.level} for this phase, or should it be lighter?`,
    "May Codex write baseline/workflow files after you review the plan, or should it stay read-only?",
  ];
  if (profiles.some((item) => item.id === "unknown")) {
    questions[1] = "Which platform should this project use: Web, Mini Program, iOS, Android, backend, admin, or mixed?";
  }
  if (!risk.hasHighRisk) return questions.slice(0, 4);
  return questions;
}

function safeNextActions(projectState, baselineLevel, standardPacks, industrialCandidates) {
  if (projectState.internal === "DEV_KIT_REPOSITORY") {
    return [
      "Codex can run dev-kit self-checks for repository maintenance.",
      "Run baseline-decision against a target project when the goal is project adoption.",
    ];
  }
  if (projectState.internal === "DIRTY_WORKTREE_PROJECT") {
    const actions = [
      "Codex should stay read-only until the human decides how to handle uncommitted changes.",
      "After that decision, Codex can prepare a write plan instead of applying changes directly.",
    ];
    if (baselineLevel.targetCandidateLevel) actions.push(`${baselineLevel.targetCandidateLevel} remains a candidate only after the dirty-worktree decision is resolved.`);
    return actions;
  }
  if (projectState.internal === "PRODUCTION_SENSITIVE_PROJECT") {
    return [
      "Codex can prepare a read-only governance map before any controlled apply.",
      "Codex must not run direct init/update, add gates, or change release flow without explicit approval.",
    ];
  }
  if (baselineLevel.level === "BL2_INDUSTRIAL") {
    return [
      "Codex can prepare a BL2 evidence gap report before enabling any industrial pack.",
      `Candidate industrial packs stay inactive: ${industrialCandidates.length > 0 ? industrialCandidates.join(", ") : "none"}.`,
    ];
  }
  return [
    `Codex can prepare standard baseline files for review: ${standardPacks.length > 0 ? standardPacks.join(", ") : "none yet"}.`,
    "Codex should use plan-first apply before writing target-project files.",
  ];
}

function evidenceRows(projectRoot, workflow, git, signals, baselineLevel, industrialCandidates) {
  const rows = [
    {
      evidence: "Project state",
      ref: workflow.workflowState === "UNAVAILABLE" ? "workflow-next unavailable" : "workflow-next output",
      status: "DONE",
    },
    {
      evidence: "Git worktree",
      ref: git.isGitRepository ? `branch ${git.currentBranch || "unknown"}, changed files ${git.changedFileCount}` : "not a git repository",
      status: git.isDirty ? "PENDING" : "DONE",
    },
    {
      evidence: "Project signals",
      ref: signals.rels.slice(0, 8).join(", ") || "no project files detected",
      status: signals.rels.length > 0 ? "DONE" : "PENDING",
    },
  ];
  if (baselineLevel.level === "BL2_INDUSTRIAL" || industrialCandidates.length > 0) {
    rows.push({
      evidence: "BL2 evidence gap",
      ref: fs.existsSync(path.join(projectRoot, "docs", "baseline-evidence.md")) ? "docs/baseline-evidence.md" : "PENDING",
      status: "PENDING",
    });
  }
  return rows;
}

export function renderDecisionCard(decision) {
  return [
    "# Baseline Decision Card",
    "",
    "## Human Summary",
    "",
    ...decision.humanSummary,
    "",
    "## Project State",
    "",
    `- Project state: ${decision.projectState.label}`,
    `- Why: ${decision.projectState.why}`,
    `- Default adoption mode: ${decision.projectState.defaultAdoptionMode}`,
    "- Can Codex write now: No",
    "",
    "## Platform And Scope",
    "",
    `- Detected platform: ${decision.platformAndScope.detectedPlatform}`,
    `- Platform state summary: ${decision.platformAndScope.platformStateSummary}`,
    `- Backend/API scope: ${decision.platformAndScope.backendApiScope}`,
    `- Production sensitivity: ${decision.platformAndScope.productionSensitivity}`,
    `- High-risk scope: ${decision.platformAndScope.highRiskScope}`,
    "",
    "## Recommended Baseline Level",
    "",
    `- Recommended level: ${decision.recommendedBaselineLevel.level}`,
    `- Why: ${decision.recommendedBaselineLevel.why}`,
    `- Current safe action: ${decision.recommendedBaselineLevel.currentSafeAction || decision.recommendedBaselineLevel.level}`,
    `- Target candidate level: ${decision.recommendedBaselineLevel.targetCandidateLevel || "none"}`,
    `- Current selected level: ${decision.recommendedBaselineLevel.currentSelectedLevel}`,
    `- BL2 status: ${decision.recommendedBaselineLevel.bl2Status}`,
    "",
    "## Platform States",
    "",
    "| Profile | State | Reason |",
    "|---|---|---|",
    ...decision.platformStates.map((row) => `| ${row.profile} | ${row.state} | ${row.reason} |`),
    "",
    "## Recommended Standard Packs",
    "",
    ...listOrNone(decision.recommendedStandardPacks),
    "",
    "## Candidate Industrial Packs",
    "",
    "Candidate only, not selected:",
    "",
    ...listOrNone(decision.candidateIndustrialPacks),
    "",
    "## Not Selected",
    "",
    "| Pack | Reason |",
    "|---|---|",
    ...(decision.notSelected.length > 0 ? decision.notSelected.map((row) => `| ${row.pack} | ${row.reason} |`) : ["| none | no additional pack considered |"]),
    "",
    "## Human Decisions Needed",
    "",
    ...decision.humanDecisionsNeeded.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Safe Next Actions",
    "",
    ...decision.safeNextActions.map((item) => `- ${item}`),
    "",
    "## Boundary",
    "",
    ...decision.boundary.map((item) => `- ${item}`),
    "",
    "This card is a recommendation only. Human confirmation is still required before Codex writes baseline files, enables BL2, applies industrial packs, changes business code, changes CI, changes release flow, or touches production-sensitive configuration.",
    "",
    "## Evidence",
    "",
    "| Evidence | Ref | Status |",
    "|---|---|---|",
    ...decision.evidence.map((row) => `| ${row.evidence} | ${row.ref} | ${row.status} |`),
  ].join("\n");
}

function listOrNone(values) {
  return values.length > 0 ? values.map((item) => `- ${item}`) : ["- none"];
}
