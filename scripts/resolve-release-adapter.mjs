#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "release-target",
  "deployment",
  "platform",
  "release-owner",
  "sop-ref",
  "environment-ref",
  "rollback-ref",
  "monitoring-ref",
  "evidence-path",
  "allow-build",
  "allow-test",
]);
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
  intent: stringArg("intent") || args._[1] || "prepare release adapter",
  explicitPlatform: stringArg("platform"),
  requestedTarget: normalizeTarget(stringArg("release-target")),
  explicitDeployment: stringArg("deployment"),
  releaseOwner: stringArg("release-owner"),
  sopRef: stringArg("sop-ref"),
  environmentRef: stringArg("environment-ref"),
  rollbackRef: stringArg("rollback-ref"),
  monitoringRef: stringArg("monitoring-ref"),
  evidencePath: stringArg("evidence-path") || "release-adapters",
  allowBuild: Boolean(args["allow-build"]),
  allowTest: Boolean(args["allow-test"]),
};

const report = buildReleaseAdapter(projectRoot, context);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReleaseAdapter(root, options) {
  const files = listProjectFiles(root);
  const packageInfo = readPackage(root);
  const discovery = discover(root, files, packageInfo, options);
  const recommendation = recommendTarget(discovery, options);
  const missingInputs = collectMissingInputs(discovery, options, recommendation);
  const adapterState = chooseAdapterState(recommendation, missingInputs, options);
  const safeNextStep = nextStepFor(adapterState, recommendation, missingInputs);

  return {
    reportType: "RELEASE_ADAPTER_PROFILE",
    generatedBy: "scripts/resolve-release-adapter.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      adapterState,
      recommendedTarget: recommendation.recommendedTarget,
      why: recommendation.why,
      safeNextStep,
    },
    projectReleaseDiscovery: discovery.rows,
    releaseTargetRecommendation: recommendation.options,
    beginnerReleaseCard: beginnerCard(adapterState, recommendation, missingInputs, options),
    projectReleaseProfile: releaseProfile(discovery, recommendation, options),
    codexExecutionBoundary: executionBoundary(options, recommendation),
    missingInputs,
    releaseExecutionBridge: [
      `node scripts/cli.mjs release-execution . --intent "prepare release execution" --release-sop ${options.evidencePath}/001-release-adapter.md`,
    ],
    evidence: [
      { evidence: "Release discovery", ref: "generated:resolve-release-adapter" },
      { evidence: "Release SOP", ref: options.sopRef || "N/A" },
      { evidence: "Release consent confirmer", ref: options.releaseOwner || "N/A" },
      { evidence: "Environment source", ref: options.environmentRef || discovery.environmentEvidence || "N/A" },
      { evidence: "Rollback source", ref: options.rollbackRef || discovery.rollbackEvidence || "N/A" },
      { evidence: "Monitoring source", ref: options.monitoringRef || discovery.monitoringEvidence || "N/A" },
    ],
    boundaries: {
      approvesRelease: "No",
      deploysByItself: "No",
      asksForOrStoresSecrets: "No",
      changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig: "No",
      treatsBeginnerConfirmationAsProductionApproval: "No",
      makesCodexReleaseOwner: "No",
    },
    outcome: adapterState,
  };
}

function discover(root, files, packageInfo, options) {
  const platform = options.explicitPlatform || detectPlatform(files, packageInfo);
  const build = detectScript(packageInfo, ["build", "build:web", "build:prod", "compile"]);
  const test = detectScript(packageInfo, ["test", "test:web", "typecheck", "lint", "check"]);
  const deployment = options.explicitDeployment || detectDeployment(files, packageInfo);
  const releaseWorkflow = findFirst(files, [
    ".github/workflows/release.yml",
    ".github/workflows/deploy.yml",
    ".github/workflows/production.yml",
    ".github/workflows/preview.yml",
  ]);
  const envEvidence = options.environmentRef || findFirst(files, ["docs/environment-baseline.md", ".env.example", "env.example", "vercel.json", "Dockerfile"]);
  const rollbackEvidence = options.rollbackRef || findFirstContains(files, ["rollback", "recovery", "feature-flag"]);
  const monitoringEvidence = options.monitoringRef || findFirstContains(files, ["monitor", "observability", "sentry", "logging", "incident"]);

  return {
    platform,
    buildCommand: build.command,
    buildEvidence: build.evidence,
    testCommand: test.command,
    testEvidence: test.evidence,
    deploymentMethod: deployment.method,
    deploymentEvidence: deployment.evidence,
    releaseWorkflow: releaseWorkflow || "N/A",
    environmentEvidence: envEvidence || "N/A",
    rollbackEvidence: rollbackEvidence || "N/A",
    monitoringEvidence: monitoringEvidence || "N/A",
    rows: [
      row("Platform", platform, platformEvidence(platform, files)),
      row("Build command", build.command || "N/A", build.evidence || "N/A"),
      row("Test command", test.command || "N/A", test.evidence || "N/A"),
      row("Deployment provider", deployment.method, deployment.evidence),
      row("Release workflow", releaseWorkflow ? "found" : "missing", releaseWorkflow || "N/A"),
      row("Environment source", envEvidence ? "found" : "missing", envEvidence || "N/A"),
      row("Rollback source", rollbackEvidence ? "found" : "missing", rollbackEvidence || "N/A"),
      row("Monitoring source", monitoringEvidence ? "found" : "missing", monitoringEvidence || "N/A"),
    ],
  };
}

function recommendTarget(discovery, options) {
  const requested = options.requestedTarget;
  const recommendedTarget = requested || "PREVIEW_OR_TEST";
  const deploymentKnown = discovery.deploymentMethod !== "UNKNOWN";
  const why = requested
    ? `The goal implies ${requested}; production actions still require exact current-user consent and strict gates.`
    : deploymentKnown
      ? `Detected ${discovery.deploymentMethod}; safest next step is a preview/test release path.`
      : "No clear deployment provider was found; Codex defaults to a preview/test release path.";
  return {
    recommendedTarget,
    deploymentKnown,
    why,
    options: [
      option("PREVIEW_OR_TEST", "Validate in a non-production place first", "low", recommendedTarget === "PREVIEW_OR_TEST" ? "Recommended" : "Available"),
      option("STAGING_OR_INTERNAL", "Hand off to internal release review", "medium", recommendedTarget === "STAGING_OR_INTERNAL" ? "Recommended" : "Optional"),
      option("PRODUCTION_REVIEW", "Prepare production evidence without deploying", "high", recommendedTarget === "PRODUCTION_REVIEW" ? "Needs exact real-world consent later" : "Only after launch review"),
      option("APP_OR_MINI_PROGRAM_REVIEW", "Prepare store or mini-program review materials", "medium/high", recommendedTarget === "APP_OR_MINI_PROGRAM_REVIEW" ? "Needs current-user consent and provider access later" : "Platform-specific"),
      option("PAUSE", "Stop until account/platform details are known", "low", "Use if unclear"),
    ],
  };
}

function collectMissingInputs(discovery, options, recommendation) {
  const missing = [];
  if (discovery.deploymentMethod === "UNKNOWN" && !options.explicitDeployment) missing.push("Deployment method or platform account is not known.");
  if (!discovery.buildCommand) missing.push("Build command is not known.");
  if (!discovery.testCommand) missing.push("Verification command is not known.");
  if (!options.sopRef) missing.push("Project release SOP is not linked.");
  if (recommendation.recommendedTarget === "PRODUCTION_REVIEW") {
    if (!options.environmentRef && discovery.environmentEvidence === "N/A") missing.push("Production environment source is not linked.");
    if (!options.rollbackRef && discovery.rollbackEvidence === "N/A") missing.push("Rollback source is not linked.");
    if (!options.monitoringRef && discovery.monitoringEvidence === "N/A") missing.push("Monitoring source is not linked.");
  }
  return missing.length > 0 ? missing : ["N/A"];
}

function chooseAdapterState(recommendation, missingInputs, options) {
  const realMissing = missingInputs.filter((item) => item !== "N/A");
  if (recommendation.recommendedTarget === "PRODUCTION_REVIEW" && !options.sopRef) {
    return "NEEDS_BEGINNER_RELEASE_DECISION";
  }
  if (realMissing.length > 0) return "NEEDS_BEGINNER_RELEASE_DECISION";
  if (recommendation.recommendedTarget === "PREVIEW_OR_TEST" || recommendation.recommendedTarget === "STAGING_OR_INTERNAL") {
    return "READY_FOR_RELEASE_EXECUTION_PLAN";
  }
  return "NEEDS_BEGINNER_RELEASE_DECISION";
}

function beginnerCard(adapterState, recommendation, missingInputs, options) {
  return {
    recommendedChoice: recommendation.recommendedTarget,
    adapterState,
    questions: [],
    codexCanDoNext: [
      "Generate a Release Execution Plan in PLAN_ONLY mode.",
      "Run local build and tests after internal gates without a separate technical confirmation.",
      "Record missing release inputs as a checklist.",
    ],
    codexMustNotDo: [
      "Deploy production without exact current-user consent and strict release gates.",
      "Ask for or store secrets.",
      "Change CI/CD, hooks, DNS, payment, permissions, app-store, mini-program, or production config.",
    ],
  };
}

function releaseProfile(discovery, recommendation, options) {
  return [
    field("Project type", discovery.platform),
    field("Release target", recommendation.recommendedTarget),
    field("Build command", discovery.buildCommand || "N/A"),
    field("Verification command", discovery.testCommand || "N/A"),
    field("Deployment method", discovery.deploymentMethod),
    field("Environment source", options.environmentRef || discovery.environmentEvidence || "N/A"),
    field("Rollback source", options.rollbackRef || discovery.rollbackEvidence || "N/A"),
    field("Monitoring source", options.monitoringRef || discovery.monitoringEvidence || "N/A"),
    field("Release owner", options.releaseOwner || "N/A"),
    field("Evidence path", options.evidencePath),
  ];
}

function executionBoundary(options, recommendation) {
  const localBuildOwner = options.allowBuild ? "CODEX_MAY_RUN_AFTER_CONFIRMATION" : "HUMAN_CONFIRMATION_REQUIRED";
  const localTestOwner = options.allowTest ? "CODEX_MAY_RUN_AFTER_CONFIRMATION" : "HUMAN_CONFIRMATION_REQUIRED";
  return [
    action("DISCOVERY", "CODEX_MAY_RUN", "ALLOWED", "Read-only project discovery."),
    action("LOCAL_BUILD", localBuildOwner, "CONDITIONAL", "Only local, non-production build."),
    action("LOCAL_TEST", localTestOwner, "CONDITIONAL", "Only local, non-production verification."),
    action("PREVIEW_DEPLOY", "HUMAN_APPROVAL_REQUIRED", "CONDITIONAL", "Requires project SOP and platform/account context."),
    action("PRODUCTION_DEPLOY", "HUMAN_REQUIRED", "BLOCKED", "Not automated by this adapter."),
    action("STORE_OR_MINI_PROGRAM_SUBMIT", "HUMAN_REQUIRED", "BLOCKED", "Requires exact current-user consent and valid provider access; the legacy executor label does not imply another person."),
    action("SECRETS_OR_DNS_OR_PAYMENT", "HUMAN_REQUIRED", "BLOCKED", "Never collected or changed by this adapter."),
    action("RELEASE_EXECUTION_PLAN", "CODEX_MAY_PREPARE", recommendation.recommendedTarget === "PRODUCTION_REVIEW" ? "CONDITIONAL" : "ALLOWED", "Plan only until approval exists."),
  ];
}

function nextStepFor(adapterState, recommendation, missingInputs) {
  if (adapterState === "READY_FOR_RELEASE_EXECUTION_PLAN") {
    return "Codex generates the Release Execution Plan and keeps real release actions blocked until exact current-user consent and strict gates pass.";
  }
  const missing = missingInputs.filter((item) => item !== "N/A");
  return `Codex should resolve or prepare safe defaults for the remaining release inputs: ${missing.join("; ") || recommendation.recommendedTarget}. Ask the user only when a business/external fact or concrete real-world consent is actually required.`;
}

function detectPlatform(files, packageInfo) {
  const deps = packageInfo.dependencyNames.join("\n");
  if (files.includes("intentos-manifest.json") && files.includes("core/workflow.md")) return "workflow-toolkit";
  if (files.some((file) => /\.xcodeproj\b|Package\.swift|\.xcworkspace\b/.test(file))) return "ios-app";
  if (files.some((file) => /(^|\/)(build\.gradle|settings\.gradle|AndroidManifest\.xml)$/.test(file))) return "android-app";
  if (files.some((file) => /(^|\/)(project\.config\.json|app\.json|app\.js|app\.ts)$/.test(file)) && /miniprogram|wechat|wx/i.test(files.join("\n"))) return "wechat-miniprogram";
  if (packageInfo.exists && /(next|vite|react|vue|svelte|astro|remix)/i.test(deps)) return "web-app";
  if (packageInfo.exists && /(express|fastify|koa|nestjs|hono|prisma)/i.test(deps)) return "backend-api";
  if (packageInfo.exists) return "node-project";
  if (files.includes("go.mod")) return "backend-api";
  if (files.includes("pyproject.toml")) return "backend-api";
  return "generic";
}

function detectDeployment(files, packageInfo) {
  const checks = [
    ["Vercel", ["vercel.json", ".vercel/project.json"]],
    ["Netlify", ["netlify.toml"]],
    ["Docker", ["Dockerfile", "docker-compose.yml", "compose.yml"]],
    ["Cloudflare", ["wrangler.toml"]],
    ["Firebase", ["firebase.json"]],
    ["GitHub Actions", [".github/workflows/deploy.yml", ".github/workflows/release.yml"]],
    ["WeChat Mini Program", ["project.config.json", "miniprogram/project.config.json"]],
  ];
  for (const [method, candidates] of checks) {
    const evidence = findFirst(files, candidates);
    if (evidence) return { method, evidence };
  }
  const deps = packageInfo.dependencyNames.join("\n");
  if (/\bvercel\b/i.test(deps)) return { method: "Vercel", evidence: "package.json" };
  if (/\bnetlify\b/i.test(deps)) return { method: "Netlify", evidence: "package.json" };
  return { method: "UNKNOWN", evidence: "N/A" };
}

function detectScript(packageInfo, names) {
  if (!packageInfo.exists) return { command: "", evidence: "" };
  for (const name of names) {
    if (packageInfo.scripts[name]) {
      return { command: `npm run ${name}`, evidence: "package.json" };
    }
  }
  return { command: "", evidence: "" };
}

function platformEvidence(platform, files) {
  const markers = {
    "web-app": ["package.json", "vite.config.ts", "next.config.js", "src", "app"],
    "backend-api": ["package.json", "go.mod", "pyproject.toml", "server", "services"],
    "ios-app": ["Package.swift"],
    "android-app": ["build.gradle", "settings.gradle"],
    "wechat-miniprogram": ["project.config.json", "miniprogram/project.config.json"],
    "workflow-toolkit": ["intentos-manifest.json", "core/workflow.md"],
  };
  return findFirst(files, markers[platform] || ["package.json"]) || "N/A";
}

function listProjectFiles(root) {
  if (!fs.existsSync(root)) return [];
  return walkRelativePaths(root, ".", { maxDepth: 4, ignoredDirs: defaultIgnoredDirs })
    .map((item) => item.replaceAll(path.sep, "/"))
    .sort();
}

function readPackage(root) {
  const file = path.join(root, "package.json");
  if (!fs.existsSync(file)) return { exists: false, scripts: {}, dependencyNames: [] };
  try {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    const dependencyNames = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.optionalDependencies || {}),
    ];
    return { exists: true, scripts: pkg.scripts || {}, dependencyNames };
  } catch {
    return { exists: true, scripts: {}, dependencyNames: [] };
  }
}

function findFirst(files, candidates) {
  for (const candidate of candidates) {
    const exact = files.find((file) => file === candidate || file.endsWith(`/${candidate}`));
    if (exact) return exact;
  }
  return "";
}

function findFirstContains(files, needles) {
  return files.find((file) => needles.some((needle) => file.toLowerCase().includes(needle.toLowerCase()))) || "";
}

function printHuman(report) {
  console.log("# Release Adapter Profile");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  printTable(["Field", "Value"], [
    ["Adapter State", code(report.humanSummary.adapterState)],
    ["Recommended Target", code(report.humanSummary.recommendedTarget)],
    ["Why", report.humanSummary.why],
    ["Safe Next Step", report.humanSummary.safeNextStep],
  ]);
  console.log("");

  console.log("## Project Release Discovery");
  printTable(["Signal", "Finding", "Evidence"], report.projectReleaseDiscovery.map((item) => [item.signal, item.finding, item.evidence]));
  console.log("");

  console.log("## Release Target Recommendation");
  printTable(["Option", "Meaning", "Risk", "Recommendation"], report.releaseTargetRecommendation.map((item) => [code(item.option), item.meaning, item.risk, item.recommendation]));
  console.log("");

  console.log("## Beginner Release Card");
  console.log("");
  console.log(`Recommended choice: ${code(report.beginnerReleaseCard.recommendedChoice)}`);
  console.log("");
  console.log("What I need from you:");
  console.log("");
  for (const question of report.beginnerReleaseCard.questions) console.log(`- ${question}`);
  console.log("");
  console.log("What Codex can do next:");
  console.log("");
  for (const item of report.beginnerReleaseCard.codexCanDoNext) console.log(`- ${item}`);
  console.log("");
  console.log("What Codex must not do:");
  console.log("");
  for (const item of report.beginnerReleaseCard.codexMustNotDo) console.log(`- ${item}`);
  console.log("");

  console.log("## Project Release Profile");
  printTable(["Field", "Value"], report.projectReleaseProfile.map((item) => [item.field, item.value]));
  console.log("");

  console.log("## Codex Execution Boundary");
  printTable(["Action", "Owner", "Status", "Notes"], report.codexExecutionBoundary.map((item) => [item.action, code(item.owner), code(item.status), item.notes]));
  console.log("");

  console.log("## Missing Inputs");
  console.log("");
  for (const item of report.missingInputs) console.log(`- ${item}`);
  console.log("");

  console.log("## Release Execution Bridge");
  console.log("");
  console.log("```bash");
  for (const command of report.releaseExecutionBridge) console.log(command);
  console.log("```");
  console.log("");

  console.log("## Evidence");
  printTable(["Evidence", "Ref"], report.evidence.map((item) => [item.evidence, item.ref]));
  console.log("");

  console.log("## Boundaries");
  console.log("");
  console.log(`- This adapter approves release: ${report.boundaries.approvesRelease}`);
  console.log(`- This adapter deploys by itself: ${report.boundaries.deploysByItself}`);
  console.log(`- This adapter asks for or stores secrets: ${report.boundaries.asksForOrStoresSecrets}`);
  console.log(`- This adapter changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config: ${report.boundaries.changesCiHooksDnsPaymentPermissionsAppStoreMiniProgramOrProductionConfig}`);
  console.log(`- This adapter treats beginner confirmation as production approval: ${report.boundaries.treatsBeginnerConfirmationAsProductionApproval}`);
  console.log(`- This adapter makes Codex the release owner: ${report.boundaries.makesCodexReleaseOwner}`);
  console.log("");

  console.log("## Outcome");
  console.log("");
  console.log(code(report.outcome));
}

function printTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`|${headers.map(() => "---").join("|")}|`);
  for (const rowItems of rows) console.log(`| ${rowItems.map((item) => String(item || "N/A")).join(" | ")} |`);
}

function row(signal, finding, evidence) {
  return { signal, finding: finding || "N/A", evidence: evidence || "N/A" };
}

function option(optionValue, meaning, risk, recommendation) {
  return { option: optionValue, meaning, risk, recommendation };
}

function field(fieldValue, value) {
  return { field: fieldValue, value: value || "N/A" };
}

function action(actionValue, owner, status, notes) {
  return { action: actionValue, owner, status, notes };
}

function normalizeTarget(value) {
  const normalized = String(value || "").trim().toUpperCase().replace(/-/g, "_");
  const targets = new Set(["PREVIEW_OR_TEST", "STAGING_OR_INTERNAL", "PRODUCTION_REVIEW", "APP_OR_MINI_PROGRAM_REVIEW", "PAUSE"]);
  return targets.has(normalized) ? normalized : "";
}

function stringArg(name) {
  const value = args[name];
  if (Array.isArray(value)) return String(value[value.length - 1] || "").trim();
  if (value === true || value === undefined || value === null) return "";
  return String(value).trim();
}

function code(value) {
  return `\`${value}\``;
}
