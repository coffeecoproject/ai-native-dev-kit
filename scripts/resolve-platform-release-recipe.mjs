#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "platform", "recipe-id", "release-target"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const context = {
  intent: stringArg("intent") || args._[1] || "help me launch",
  platform: normalizeInput(stringArg("platform")),
  recipeId: normalizeInput(stringArg("recipe-id")),
  releaseTarget: normalizeInput(stringArg("release-target")),
};

function buildRecipeSelection(root, options) {
  const candidates = detectCandidates(root, options);
  const selected = selectRecipe(candidates, options);
  const recipe = recipeById(selected.recipeId);
  const confidence = selected.confidence;
  const outcome = outcomeFor(recipe, confidence);

  return {
    reportType: "PLATFORM_RELEASE_RECIPE_SELECTION",
    generatedBy: "scripts/resolve-platform-release-recipe.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      selectedRecipeId: recipe.id,
      recipeStatus: recipe.status,
      platformFamily: recipe.family,
      selectionConfidence: confidence,
      safeFirstTarget: options.releaseTarget || recipe.safeFirstTarget,
      why: selected.why,
      safeNextStep: safeNextStepFor(recipe, confidence),
    },
    beginnerRecipeCard: beginnerCard(recipe, selected, confidence),
    recipeSelection: selectionRows(candidates, selected),
    selectedRecipe: recipeRows(recipe, options),
    requiredInputs: recipe.requiredInputs,
    preflightChecks: recipe.preflightChecks,
    humanDecisions: recipe.humanDecisions,
    codexAllowedActions: recipe.codexAllowedActions,
    codexBlockedActions: recipe.codexBlockedActions,
    requiredEvidence: recipe.requiredEvidence,
    rollbackRequirements: recipe.rollbackRequirements,
    monitoringRequirements: recipe.monitoringRequirements,
    releaseGuideBridge: [
      `node scripts/cli.mjs release-guide . --intent "${options.intent}" --recipe-id ${recipe.id}`,
    ],
    boundaries: {
      approvesRelease: "No",
      deploysOrPublishesByItself: "No",
      asksForOrStoresSecrets: "No",
      changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramProductionDataOrProductionConfig: "No",
      makesCodexReleaseOwner: "No",
      treatsProviderAssumptionsAsCertainty: "No",
    },
    outcome,
  };
}

function detectCandidates(root, options) {
  const signals = collectSignals(root, options);
  const scored = RECIPES.map((recipe) => {
    let score = 0;
    const matched = [];
    for (const signal of recipe.signals) {
      if (signals.has(signal.key)) {
        score += signal.weight;
        matched.push(`${signal.key}: ${signals.get(signal.key)}`);
      }
    }
    if (options.platform && recipe.aliases.includes(options.platform)) {
      score += 8;
      matched.push(`platform option: ${options.platform}`);
    }
    if (options.recipeId && recipe.id === options.recipeId) {
      score += 12;
      matched.push(`recipe option: ${options.recipeId}`);
    }
    return {
      recipeId: recipe.id,
      recipeStatus: recipe.status,
      platformFamily: recipe.family,
      score,
      matchedSignals: matched,
      confidence: confidenceFor(score),
    };
  });

  return scored.sort((a, b) => b.score - a.score || statusRank(a.recipeStatus) - statusRank(b.recipeStatus));
}

function collectSignals(root, options) {
  const signals = new Map();
  const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
  const packageJson = readJson(path.join(root, "package.json"));

  if (packageJson) {
    signals.set("package-json", "package.json exists");
    const scripts = packageJson.scripts || {};
    const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
    if (scripts.build || scripts.dev || deps.next || deps.vite || deps.react || deps.vue || deps.svelte) {
      signals.set("frontend-web", "package scripts or frontend dependencies");
    }
    if (deps.express || deps.fastify || deps.koa || deps.hono || deps["@nestjs/core"] || scripts.start || scripts["db:migrate"]) {
      signals.set("backend-api", "backend dependencies or service scripts");
    }
  }

  for (const file of ["vercel.json", "netlify.toml", "firebase.json", "wrangler.toml"]) {
    if (exists(file)) signals.set("hosted-web-provider", file);
  }
  for (const file of ["project.config.json", "app.json", "miniprogram/project.config.json"]) {
    if (exists(file)) signals.set("mini-program", file);
  }
  for (const file of ["Dockerfile", "docker-compose.yml", "compose.yml"]) {
    if (exists(file)) signals.set("web-container", file);
  }
  for (const file of ["Package.swift", "Podfile"]) {
    if (exists(file)) signals.set("ios", file);
  }
  if (listFiles(root, 2).some((file) => /\.(xcodeproj|xcworkspace)$/.test(file))) signals.set("ios", "Xcode project");
  for (const file of ["build.gradle", "settings.gradle", "gradlew"]) {
    if (exists(file)) signals.set("android", file);
  }
  if (listFiles(root, 3).some((file) => file.endsWith("AndroidManifest.xml"))) signals.set("android", "AndroidManifest.xml");
  if (listFiles(root, 3).some((file) => /admin|rbac|permission|audit/i.test(file))) {
    signals.set("internal-admin", "admin/RBAC/audit project signal");
  }
  if (/mini.?program|小程序/i.test(options.intent)) signals.set("mini-program", "intent");
  if (/backend|api|server|migration|database|数据库/i.test(options.intent)) signals.set("backend-api", "intent");
  if (/ios|testflight|app store/i.test(options.intent)) signals.set("ios", "intent");
  if (/android|play console/i.test(options.intent)) signals.set("android", "intent");
  if (/admin|中台|internal/i.test(options.intent)) signals.set("internal-admin", "intent");
  if (/web|preview|vercel|netlify|hosted|上线/i.test(options.intent)) signals.set("frontend-web", "intent");
  return signals;
}

function selectRecipe(candidates, options) {
  if (options.recipeId) {
    const explicit = candidates.find((item) => item.recipeId === options.recipeId);
    if (explicit) {
      return {
        ...explicit,
        confidence: "HIGH",
        why: `Explicit recipe requested: ${options.recipeId}.`,
      };
    }
  }

  const top = candidates[0] || { recipeId: "web-hosted-preview", confidence: "LOW", matchedSignals: [] };
  const second = candidates[1];
  let confidence = top.confidence;
  if (second && top.score > 0 && top.score === second.score) confidence = "CONFLICT";
  const matched = top.matchedSignals.length > 0 ? top.matchedSignals.join("; ") : "no strong platform signal";
  return {
    ...top,
    confidence,
    why: confidence === "CONFLICT"
      ? "Multiple platform recipes have equal confidence; user must choose."
      : `Selected from project signals: ${matched}.`,
  };
}

function confidenceFor(score) {
  if (score >= 8) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "LOW";
}

function outcomeFor(recipe, confidence) {
  if (confidence === "CONFLICT") return "NEEDS_RECIPE_DECISION";
  if (recipe.status === "DRAFT") return "DRAFT_RECIPE_SUGGESTED";
  if (confidence === "LOW" || confidence === "MEDIUM") return "NEEDS_RECIPE_CONFIRMATION";
  return "RECIPE_SELECTED";
}

function safeNextStepFor(recipe, confidence) {
  if (confidence === "CONFLICT") return "Choose the platform release recipe before preparing a release path.";
  if (recipe.status === "DRAFT") return "Treat this recipe as a draft and collect project-specific release SOP, owner, rollback, and monitoring evidence.";
  if (confidence === "LOW" || confidence === "MEDIUM") return "Confirm the selected platform recipe before release execution planning.";
  return "Use Release Guide with this recipe, then collect structured approval and launch evidence.";
}

function beginnerCard(recipe, selected, confidence) {
  return [
    `What I found: ${selected.why}`,
    `Recommended recipe: ${recipe.id}`,
    `Safe first target: ${recipe.safeFirstTarget}`,
    `Confidence: ${confidence}`,
    "What I need from you: confirm this is the right release path and name the release owner before any execution planning.",
  ];
}

function selectionRows(candidates, selected) {
  return candidates.slice(0, 4).map((item) => ({
    recipeId: item.recipeId,
    status: item.recipeStatus,
    confidence: item.recipeId === selected.recipeId ? selected.confidence : item.confidence,
    matchedSignals: item.matchedSignals.join("; ") || "none",
  }));
}

function recipeRows(recipe, options) {
  return {
    recipeId: recipe.id,
    recipeStatus: recipe.status,
    platformFamily: recipe.family,
    safeFirstTarget: options.releaseTarget || recipe.safeFirstTarget,
    supportedTargets: recipe.supportedTargets.join(", "),
  };
}

function printHuman(report) {
  console.log("# Platform Release Recipe Selection");
  console.log("");
  printTable("Human Summary", [
    ["Selected Recipe", report.humanSummary.selectedRecipeId],
    ["Recipe Status", report.humanSummary.recipeStatus],
    ["Platform Family", report.humanSummary.platformFamily],
    ["Selection Confidence", report.humanSummary.selectionConfidence],
    ["Safe First Target", report.humanSummary.safeFirstTarget],
    ["Why", report.humanSummary.why],
    ["Safe Next Step", report.humanSummary.safeNextStep],
  ]);
  console.log("## Beginner Recipe Card");
  console.log("");
  for (const line of report.beginnerRecipeCard) console.log(`- ${line}`);
  console.log("");
  printObjectRows("Recipe Selection", report.recipeSelection);
  printTable("Selected Recipe", Object.entries(report.selectedRecipe));
  printObjectRows("Required Inputs", report.requiredInputs);
  printObjectRows("Preflight Checks", report.preflightChecks);
  printObjectRows("Human Decisions", report.humanDecisions);
  printObjectRows("Codex Allowed Actions", report.codexAllowedActions);
  printObjectRows("Codex Blocked Actions", report.codexBlockedActions);
  printObjectRows("Required Evidence", report.requiredEvidence);
  printObjectRows("Rollback Requirements", report.rollbackRequirements);
  printObjectRows("Monitoring Requirements", report.monitoringRequirements);
  console.log("## Release Guide Bridge");
  console.log("");
  for (const item of report.releaseGuideBridge) console.log(`- \`${item}\``);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This recipe approves release: ${report.boundaries.approvesRelease}`);
  console.log(`- This recipe deploys or publishes by itself: ${report.boundaries.deploysOrPublishesByItself}`);
  console.log(`- This recipe asks for or stores secrets: ${report.boundaries.asksForOrStoresSecrets}`);
  console.log(`- This recipe changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: ${report.boundaries.changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramProductionDataOrProductionConfig}`);
  console.log(`- This recipe makes Codex the release owner: ${report.boundaries.makesCodexReleaseOwner}`);
  console.log(`- This recipe treats provider assumptions as certainty: ${report.boundaries.treatsProviderAssumptionsAsCertainty}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printTable(title, rows) {
  console.log(`## ${title}`);
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  for (const [field, value] of rows) console.log(`| ${field} | ${value || "N/A"} |`);
  console.log("");
}

function printObjectRows(title, rows) {
  console.log(`## ${title}`);
  console.log("");
  if (!rows || rows.length === 0) {
    console.log("| Item | Detail |");
    console.log("|---|---|");
    console.log("| N/A | N/A |");
    console.log("");
    return;
  }
  const keys = Object.keys(rows[0]);
  console.log(`| ${keys.join(" | ")} |`);
  console.log(`| ${keys.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${keys.map((key) => row[key] || "N/A").join(" | ")} |`);
  console.log("");
}

function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) || RECIPES[0];
}

function statusRank(status) {
  return status === "STRICT" ? 0 : 1;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function listFiles(root, maxDepth) {
  const out = [];
  walk(root, 0);
  return out;

  function walk(current, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = path.join(current, entry.name);
      const relative = path.relative(root, full);
      out.push(relative);
      if (entry.isDirectory()) walk(full, depth + 1);
    }
  }
}

function stringArg(name) {
  const value = args[name];
  if (value === true || value === false || value === undefined) return "";
  return String(value).trim();
}

function normalizeInput(value) {
  return String(value || "").trim();
}

const RECIPES = [
  {
    id: "web-hosted-preview",
    status: "STRICT",
    family: "web-hosted-preview",
    safeFirstTarget: "preview",
    supportedTargets: ["preview", "staging", "production"],
    aliases: ["web", "web-hosted", "preview", "vercel", "netlify", "cloudflare-pages", "firebase-hosting"],
    signals: [
      { key: "frontend-web", weight: 5 },
      { key: "hosted-web-provider", weight: 5 },
      { key: "package-json", weight: 1 },
    ],
    requiredInputs: [
      { input: "release owner", minimumQuality: "named owner or external release system" },
      { input: "environment reference", minimumQuality: "non-secret preview/staging environment reference" },
      { input: "rollback path", minimumQuality: "path, owner, and restore condition" },
      { input: "monitoring path", minimumQuality: "logs, dashboard, smoke, or owner-owned observation path" },
    ],
    preflightChecks: [
      { check: "local build", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" },
      { check: "local tests", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" },
      { check: "preview publish", owner: "HUMAN_OR_EXTERNAL_SYSTEM" },
    ],
    humanDecisions: [
      { decision: "choose preview provider or SOP", owner: "HUMAN_REQUIRED" },
      { decision: "approve preview publication", owner: "HUMAN_REQUIRED" },
    ],
    codexAllowedActions: [
      { action: "inspect local scripts and docs", riskClass: "LOCAL_READ_ONLY" },
      { action: "run local build after approval", riskClass: "LOCAL_BUILD" },
      { action: "prepare preview handoff instructions", riskClass: "PREVIEW_PREPARE" },
    ],
    codexBlockedActions: [
      { action: "publish preview", reason: "remote-state mutation" },
      { action: "production deploy", reason: "human or external release system only" },
      { action: "request or store provider secrets", reason: "secrets are out of scope" },
    ],
    requiredEvidence: [
      { evidence: "release owner", minimumQuality: "named owner or external release system" },
      { evidence: "build/test output", minimumQuality: "command, timestamp, and result" },
      { evidence: "release SOP", minimumQuality: "documented procedure or owner-owned path" },
    ],
    rollbackRequirements: [
      { requirement: "rollback path", minimumQuality: "previous deployment, revert path, or provider rollback owner" },
    ],
    monitoringRequirements: [
      { requirement: "observation path", minimumQuality: "preview smoke, logs, analytics, or dashboard owner" },
    ],
  },
  {
    id: "backend-api-handoff",
    status: "STRICT",
    family: "backend-api",
    safeFirstTarget: "staging-handoff",
    supportedTargets: ["staging", "production"],
    aliases: ["backend", "api", "server"],
    signals: [
      { key: "backend-api", weight: 7 },
      { key: "web-container", weight: 2 },
    ],
    requiredInputs: [
      { input: "release owner", minimumQuality: "named owner or external release system" },
      { input: "migration review", minimumQuality: "migration plan or N/A reason" },
      { input: "rollback path", minimumQuality: "deployment rollback and data restore owner" },
      { input: "monitoring path", minimumQuality: "logs, metrics, health checks, or incident owner" },
    ],
    preflightChecks: [
      { check: "local tests", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" },
      { check: "migration diff review", owner: "HUMAN_REQUIRED" },
      { check: "production deploy", owner: "HUMAN_OR_EXTERNAL_SYSTEM" },
    ],
    humanDecisions: [
      { decision: "approve migration risk", owner: "HUMAN_REQUIRED" },
      { decision: "approve deployment window", owner: "HUMAN_REQUIRED" },
    ],
    codexAllowedActions: [
      { action: "inspect local scripts and docs", riskClass: "LOCAL_READ_ONLY" },
      { action: "run local tests after approval", riskClass: "LOCAL_TEST" },
      { action: "prepare release handoff checklist", riskClass: "PREVIEW_PREPARE" },
    ],
    codexBlockedActions: [
      { action: "production deploy", reason: "human or external release system only" },
      { action: "production migration", reason: "human-owned data risk" },
      { action: "request or store database secrets", reason: "secrets are out of scope" },
    ],
    requiredEvidence: [
      { evidence: "release owner", minimumQuality: "named owner or external release system" },
      { evidence: "verification output", minimumQuality: "command, timestamp, and result" },
      { evidence: "migration review", minimumQuality: "migration plan, N/A reason, or owner approval" },
    ],
    rollbackRequirements: [
      { requirement: "rollback path", minimumQuality: "deployment rollback and data restore strategy" },
      { requirement: "rollback owner", minimumQuality: "named owner or external release system" },
    ],
    monitoringRequirements: [
      { requirement: "health check", minimumQuality: "endpoint, log, or dashboard owner" },
      { requirement: "incident observation", minimumQuality: "owner and escalation path" },
    ],
  },
  {
    id: "mini-program-review-handoff",
    status: "STRICT",
    family: "mini-program",
    safeFirstTarget: "review-handoff",
    supportedTargets: ["preview", "review", "production"],
    aliases: ["mini-program", "wechat", "weapp", "小程序"],
    signals: [
      { key: "mini-program", weight: 9 },
    ],
    requiredInputs: [
      { input: "release owner", minimumQuality: "named owner or external release system" },
      { input: "platform account owner", minimumQuality: "named owner, not a secret" },
      { input: "review SOP", minimumQuality: "mini-program upload/review/release procedure" },
      { input: "rollback path", minimumQuality: "release rollback or version fallback owner" },
      { input: "monitoring path", minimumQuality: "smoke, platform status, logs, or customer support observation" },
    ],
    preflightChecks: [
      { check: "local build/lint where available", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" },
      { check: "platform upload", owner: "HUMAN_OR_EXTERNAL_SYSTEM" },
      { check: "platform review submission", owner: "HUMAN_OR_EXTERNAL_SYSTEM" },
    ],
    humanDecisions: [
      { decision: "approve platform upload", owner: "HUMAN_REQUIRED" },
      { decision: "approve review submission", owner: "HUMAN_REQUIRED" },
    ],
    codexAllowedActions: [
      { action: "inspect local mini-program config", riskClass: "LOCAL_READ_ONLY" },
      { action: "run local checks after approval", riskClass: "LOCAL_TEST" },
      { action: "prepare review handoff checklist", riskClass: "PREVIEW_PREPARE" },
    ],
    codexBlockedActions: [
      { action: "upload mini-program package", reason: "platform remote mutation" },
      { action: "submit review", reason: "human-owned platform decision" },
      { action: "release approved version", reason: "human-owned production decision" },
      { action: "request or store platform secrets", reason: "secrets are out of scope" },
    ],
    requiredEvidence: [
      { evidence: "release owner", minimumQuality: "named owner or external release system" },
      { evidence: "local verification", minimumQuality: "command, timestamp, and result" },
      { evidence: "review SOP", minimumQuality: "documented platform review procedure" },
    ],
    rollbackRequirements: [
      { requirement: "fallback version", minimumQuality: "previous version, owner, and restore condition" },
      { requirement: "rollback owner", minimumQuality: "named owner or external release system" },
    ],
    monitoringRequirements: [
      { requirement: "smoke path", minimumQuality: "preview/review/production smoke checklist owner" },
      { requirement: "user feedback path", minimumQuality: "support, logs, platform status, or incident owner" },
    ],
  },
  {
    id: "ios-testflight-handoff",
    status: "DRAFT",
    family: "ios",
    safeFirstTarget: "testflight-handoff",
    supportedTargets: ["testflight", "app-store"],
    aliases: ["ios", "testflight", "app-store"],
    signals: [{ key: "ios", weight: 7 }],
    requiredInputs: [{ input: "release owner", minimumQuality: "named owner or external release system" }],
    preflightChecks: [{ check: "local build", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" }],
    humanDecisions: [{ decision: "app-store upload and submission", owner: "HUMAN_REQUIRED" }],
    codexAllowedActions: [{ action: "inspect local iOS project", riskClass: "LOCAL_READ_ONLY" }],
    codexBlockedActions: [{ action: "upload archive", reason: "external platform mutation" }],
    requiredEvidence: [{ evidence: "release owner", minimumQuality: "named owner or external release system" }],
    rollbackRequirements: [{ requirement: "rollback path", minimumQuality: "draft requires project-specific completion" }],
    monitoringRequirements: [{ requirement: "observation path", minimumQuality: "draft requires project-specific completion" }],
  },
  {
    id: "android-internal-testing-handoff",
    status: "DRAFT",
    family: "android",
    safeFirstTarget: "internal-testing-handoff",
    supportedTargets: ["internal-testing", "play-console"],
    aliases: ["android", "play-console"],
    signals: [{ key: "android", weight: 7 }],
    requiredInputs: [{ input: "release owner", minimumQuality: "named owner or external release system" }],
    preflightChecks: [{ check: "local build", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" }],
    humanDecisions: [{ decision: "Play Console upload and rollout", owner: "HUMAN_REQUIRED" }],
    codexAllowedActions: [{ action: "inspect local Android project", riskClass: "LOCAL_READ_ONLY" }],
    codexBlockedActions: [{ action: "upload bundle", reason: "external platform mutation" }],
    requiredEvidence: [{ evidence: "release owner", minimumQuality: "named owner or external release system" }],
    rollbackRequirements: [{ requirement: "rollback path", minimumQuality: "draft requires project-specific completion" }],
    monitoringRequirements: [{ requirement: "observation path", minimumQuality: "draft requires project-specific completion" }],
  },
  {
    id: "internal-admin-rollout",
    status: "DRAFT",
    family: "internal-admin",
    safeFirstTarget: "protected-preview",
    supportedTargets: ["protected-preview"],
    aliases: ["internal-admin", "admin"],
    signals: [{ key: "internal-admin", weight: 5 }],
    requiredInputs: [{ input: "release owner", minimumQuality: "named owner or external release system" }],
    preflightChecks: [{ check: "role/access review", owner: "HUMAN_REQUIRED" }],
    humanDecisions: [{ decision: "access rollout", owner: "HUMAN_REQUIRED" }],
    codexAllowedActions: [{ action: "inspect local admin docs", riskClass: "LOCAL_READ_ONLY" }],
    codexBlockedActions: [{ action: "change production permissions", reason: "human-owned production decision" }],
    requiredEvidence: [{ evidence: "release owner", minimumQuality: "named owner or external release system" }],
    rollbackRequirements: [{ requirement: "rollback path", minimumQuality: "draft requires project-specific completion" }],
    monitoringRequirements: [{ requirement: "observation path", minimumQuality: "draft requires project-specific completion" }],
  },
  {
    id: "web-container-release-handoff",
    status: "DRAFT",
    family: "web-container",
    safeFirstTarget: "staging-handoff",
    supportedTargets: ["staging", "production"],
    aliases: ["container", "docker", "vps"],
    signals: [{ key: "web-container", weight: 6 }],
    requiredInputs: [{ input: "release owner", minimumQuality: "named owner or external release system" }],
    preflightChecks: [{ check: "local build", owner: "CODEX_MAY_RUN_IF_APPROVED_LOCAL_SAFE" }],
    humanDecisions: [{ decision: "server deployment", owner: "HUMAN_REQUIRED" }],
    codexAllowedActions: [{ action: "inspect local deployment docs", riskClass: "LOCAL_READ_ONLY" }],
    codexBlockedActions: [{ action: "SSH production deploy", reason: "remote production mutation" }],
    requiredEvidence: [{ evidence: "release owner", minimumQuality: "named owner or external release system" }],
    rollbackRequirements: [{ requirement: "rollback path", minimumQuality: "draft requires project-specific completion" }],
    monitoringRequirements: [{ requirement: "observation path", minimumQuality: "draft requires project-specific completion" }],
  },
];

const report = buildRecipeSelection(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);
