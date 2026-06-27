#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { walkRelativePaths } from "./lib/project-signals.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "write-plan", "apply-plan", "target"]);
const unknown = unknownOptions(args, knownFlags);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (args["apply-plan"]) {
  applyPlan(path.resolve(process.cwd(), String(args["apply-plan"])));
  process.exit(0);
}

const outputFormat = args.json ? "json" : String(args.format || "human");
if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const projectRoot = path.resolve(process.cwd(), String(args.target || args._[0] || "."));
const workflow = runWorkflowNext(projectRoot);
const recommendation = buildRecommendation(projectRoot, workflow);

if (args["write-plan"]) {
  const planPath = path.resolve(process.cwd(), String(args["write-plan"]));
  const plan = buildWritePlan(recommendation);
  fs.mkdirSync(path.dirname(planPath), { recursive: true });
  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  recommendation.planWritten = {
    path: planPath,
    writesTargetProject: "No",
    applyCommand: `node scripts/baseline-project.mjs --apply-plan ${shellQuote(planPath)}`,
  };
}

if (outputFormat === "json") {
  console.log(JSON.stringify(recommendation, null, 2));
} else {
  printRecommendation(recommendation);
}

function runWorkflowNext(targetRoot) {
  const result = spawnSync(process.execPath, ["scripts/workflow-next.mjs", targetRoot, "--json"], {
    cwd: kitRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return {
      status: "UNAVAILABLE",
      error: result.stderr || result.stdout || "workflow-next failed",
      projectRoot: targetRoot,
      projectState: fs.existsSync(targetRoot) ? "UNKNOWN" : "TARGET_MISSING",
      projectStateTags: [],
    };
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    return {
      status: "UNPARSEABLE",
      error: error.message,
      projectRoot: targetRoot,
      projectState: fs.existsSync(targetRoot) ? "UNKNOWN" : "TARGET_MISSING",
      projectStateTags: [],
    };
  }
}

function buildRecommendation(targetRoot, workflow) {
  const projectStateTags = new Set(workflow.projectStateTags || []);
  const projectClassification = classify(workflow, projectStateTags);
  const profileCandidates = detectProfileCandidates(targetRoot);
  const engineeringBaseline = inspectBaselineDoc(targetRoot, "docs/engineering-baseline.md");
  const environmentBaseline = inspectBaselineDoc(targetRoot, "docs/environment-baseline.md");
  const recommendedBlLevel = recommendBaselineLevel(projectClassification, profileCandidates);
  const gaps = baselineGaps(recommendedBlLevel, engineeringBaseline, environmentBaseline);

  return {
    reportType: "BASELINE_RECOMMENDATION",
    generatedBy: "scripts/baseline-project.mjs",
    generatedAt: new Date().toISOString(),
    baselineIsReadOnlyByDefault: true,
    canAiWriteNow: "No",
    projectRoot: targetRoot,
    projectClassification,
    detectedProfileCandidates: profileCandidates,
    recommendedBaselineLevel: recommendedBlLevel,
    engineeringBaseline,
    environmentBaseline,
    gapSummary: gaps,
    pendingHumanDecisions: pendingHumanDecisions(projectClassification, profileCandidates, recommendedBlLevel, gaps),
    highRiskAreas: highRiskAreas(projectClassification, targetRoot),
    safeNextActions: safeNextActions(targetRoot),
    actionsAiMustNotTakeYet: [
      "Do not create or edit .env files.",
      "Do not record secret values, private keys, tokens, production credentials, or connection strings with embedded credentials.",
      "Do not modify CI/CD, deployment, production config, AGENTS.md, PR templates, migrations, permissions, or release paths through baseline setup.",
      "Do not enable BL2 or install industrial packs without explicit human confirmation.",
      "Do not invent staging, production, rollback, monitoring, or release ownership when evidence is missing.",
    ],
    suggestedWritePlanCommand: `node scripts/baseline-project.mjs ${shellQuote(targetRoot)} --write-plan baseline-plan.json`,
    workflowNext: {
      status: workflow.status || "PASS",
      projectState: workflow.projectState,
      nextAction: workflow.nextAction,
      adoptionMode: workflow.adoptionMode,
      baselineLevel: workflow.baselineLevel || null,
    },
  };
}

function classify(workflow, tags) {
  if (workflow.projectState === "TARGET_MISSING") return "UNKNOWN_NEEDS_DISCUSSION";
  if (workflow.projectState === "DEV_KIT_REPOSITORY") return "DEV_KIT_REPOSITORY";
  if (tags.has("DIRTY_WORKTREE_PROJECT")) return "DIRTY_WORKTREE_PROJECT";
  if (tags.has("PRODUCTION_GOVERNED_PROJECT")) return "PRODUCTION_SENSITIVE_PROJECT";
  if (tags.has("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_EXISTING_PROJECT";
  if (workflow.projectState === "NEW_PROJECT") return "NEW_PROJECT";
  if (workflow.projectState === "BOOTSTRAPPED_PROJECT") return "ALREADY_BOOTSTRAPPED_PROJECT";
  if (workflow.projectState === "EXISTING_PROJECT" || workflow.projectState === "PARTIALLY_BOOTSTRAPPED_PROJECT") return "EXISTING_LIGHT_PROJECT";
  return "UNKNOWN_NEEDS_DISCUSSION";
}

function detectProfileCandidates(targetRoot) {
  const rels = new Set(walkRelativePaths(targetRoot, ".", { maxDepth: 3 }).map((item) => item.replace(/\\/g, "/")));
  const packageJson = readJsonIfExists(path.join(targetRoot, "package.json"));
  const packageText = packageJson ? JSON.stringify({ dependencies: packageJson.dependencies || {}, devDependencies: packageJson.devDependencies || {}, scripts: packageJson.scripts || {} }) : "";
  const candidates = [];

  if (packageJson || rels.has("vite.config.ts") || rels.has("next.config.js") || /react|next|vue|vite|svelte/i.test(packageText)) {
    candidates.push(profile("web-app", "Web app signals found in package.json, frontend config, or source layout."));
  }
  if (rels.has("project.config.json") || rels.has("app.json") || rels.has("miniprogram") || rels.has("cloudfunctions")) {
    candidates.push(profile("wechat-miniprogram", "WeChat Mini Program config, app.json, miniprogram, or cloudfunctions signals found."));
  }
  if ([...rels].some((item) => item.endsWith(".xcodeproj") || item.endsWith(".xcworkspace")) || rels.has("Package.swift") || rels.has("ios")) {
    candidates.push(profile("ios-app", "iOS project, workspace, Swift package, or ios directory signals found."));
  }
  if (rels.has("build.gradle") || rels.has("settings.gradle") || rels.has("android") || [...rels].some((item) => item.endsWith(".gradle"))) {
    candidates.push(profile("android-app", "Android Gradle or android directory signals found."));
  }
  if (rels.has("server") || rels.has("backend") || rels.has("services") || rels.has("go.mod") || rels.has("pyproject.toml") || /express|fastify|nestjs|prisma|typeorm|drizzle/i.test(packageText)) {
    candidates.push(profile("backend-api", "Backend runtime, server directory, service directory, or API dependency signals found."));
  }
  if (/admin|antd|data-table|rbac|permission/i.test(packageText) || [...rels].some((item) => /admin|dashboard|permission|rbac/i.test(item))) {
    candidates.push(profile("internal-admin", "Admin, dashboard, permission, or RBAC signals found."));
  }

  if (candidates.length === 0) {
    candidates.push(profile("unknown", "No strong platform signal found. Human should confirm project platform before baseline setup."));
  }
  return candidates;
}

function profile(id, reason) {
  return { id, reason, status: id === "unknown" ? "PENDING_CONFIRMATION" : "CANDIDATE" };
}

function inspectBaselineDoc(targetRoot, rel) {
  const full = path.join(targetRoot, rel);
  if (!fs.existsSync(full)) {
    return {
      ref: rel,
      state: "MISSING",
      summary: `${rel} does not exist yet.`,
      canUseForTaskReferences: "No",
    };
  }
  const content = fs.readFileSync(full, "utf8");
  const pending = /\b(PENDING|PENDING_CONFIRMATION|DRAFT|TODO|TBD|NEEDS_HUMAN|待确认|待定)\b/i.test(content);
  return {
    ref: rel,
    state: pending ? "PENDING" : "PRESENT",
    summary: pending ? `${rel} exists with pending decisions.` : `${rel} exists.`,
    canUseForTaskReferences: "Yes",
  };
}

function recommendBaselineLevel(classification, profiles) {
  if (classification === "DEV_KIT_REPOSITORY") {
    return {
      level: "Not applicable for target-project adoption",
      reason: "This is the AI Native Dev Kit source repository. Run dev-kit self-check for maintenance, or run baseline against a target project.",
      industrialPacks: "Not applicable",
    };
  }
  if (classification === "PRODUCTION_SENSITIVE_PROJECT" || classification === "GOVERNED_EXISTING_PROJECT" || classification === "DIRTY_WORKTREE_PROJECT") {
    return {
      level: "BL1",
      reason: "Existing governance, production, or dirty-worktree signals require visible baseline decisions before implementation. BL2 remains explicit opt-in.",
      industrialPacks: "None by default",
    };
  }
  if (classification === "NEW_PROJECT") {
    return {
      level: "BL0 first, then BL1 after platform and project goal confirmation",
      reason: "New projects should start light, then confirm engineering and environment rules before non-trivial work.",
      industrialPacks: "None by default",
    };
  }
  if (profiles.some((item) => item.id === "backend-api" || item.id === "internal-admin")) {
    return {
      level: "BL1",
      reason: "Backend/admin signals usually need data, permission, environment, and release decisions before implementation.",
      industrialPacks: "None by default",
    };
  }
  return {
    level: "BL0/BL1 depending on first task risk",
    reason: "No high-risk baseline signal found. Keep BL0 advisory unless the first task touches structure, API, data, environment, release, or permissions.",
    industrialPacks: "None by default",
  };
}

function baselineGaps(level, engineeringBaseline, environmentBaseline) {
  const gaps = [];
  if (engineeringBaseline.state === "MISSING") gaps.push("Engineering baseline is missing.");
  if (environmentBaseline.state === "MISSING") gaps.push("Environment baseline is missing.");
  if (engineeringBaseline.state === "PENDING") gaps.push("Engineering baseline has pending decisions.");
  if (environmentBaseline.state === "PENDING") gaps.push("Environment baseline has pending decisions.");
  if (/BL1|BL2/.test(level.level) && environmentBaseline.state === "MISSING") {
    gaps.push("BL1/BL2 work needs an environment baseline doc, with unknown items marked PENDING_CONFIRMATION or NOT_APPLICABLE.");
  }
  if (gaps.length === 0) gaps.push("No baseline document gap detected. Check task references before implementation.");
  return gaps;
}

function pendingHumanDecisions(classification, profiles, level, gaps) {
  const decisions = [
    "Confirm project goal and risk level.",
    "Confirm platform profile candidates.",
    "Confirm baseline level: BL0, BL1, or BL2.",
  ];
  if (profiles.some((item) => item.id === "unknown")) decisions.push("Confirm project platform before writing baseline docs.");
  if (gaps.some((item) => item.includes("Engineering"))) decisions.push("Confirm engineering rules that Codex must follow before structure, API, data, or dependency work.");
  if (gaps.some((item) => item.includes("Environment"))) decisions.push("Confirm environment facts and mark unknown release, rollback, CI, secret, or monitoring items as PENDING_CONFIRMATION.");
  if (classification === "PRODUCTION_SENSITIVE_PROJECT") decisions.push("Confirm production, release, rollback, secret, and deployment ownership before any apply.");
  if (/BL2/.test(level.level)) decisions.push("Explicitly approve BL2 and selected industrial packs; none are enabled by baseline recommendation.");
  return decisions;
}

function highRiskAreas(classification, targetRoot) {
  const rels = walkRelativePaths(targetRoot, ".", { maxDepth: 3 }).map((item) => item.replace(/\\/g, "/"));
  const areas = [];
  const signals = [
    ["auth", /auth|login|session|oauth/i, "Authentication or session files detected."],
    ["permission", /permission|rbac|role|acl/i, "Permission or RBAC files detected."],
    ["migration", /migration|prisma|drizzle|schema\.sql/i, "Database schema or migration signals detected."],
    ["ci", /^\.github\/workflows|gitlab-ci|circleci|jenkins/i, "CI/CD config detected."],
    ["deploy", /deploy|vercel|netlify|docker|k8s|helm|terraform/i, "Deployment or infrastructure signals detected."],
    ["secret", /\.env|secret|credential|key/i, "Secret or env file names detected. Values must not be read into baseline docs."],
  ];
  for (const [id, pattern, reason] of signals) {
    if (rels.some((item) => pattern.test(item))) areas.push({ id, reason, status: "NEEDS_HUMAN_CONFIRMATION_BEFORE_WRITE" });
  }
  if (classification === "PRODUCTION_SENSITIVE_PROJECT") {
    areas.push({ id: "production", reason: "Production-sensitive project classification.", status: "READ_ONLY_FIRST" });
  }
  return areas;
}

function safeNextActions(targetRoot) {
  return [
    action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(targetRoot)}`, "No", "No"),
    action("Write baseline plan only", `node scripts/baseline-project.mjs ${shellQuote(targetRoot)} --write-plan baseline-plan.json`, "Plan file only", "Yes"),
    action("Apply reviewed baseline plan", "node scripts/baseline-project.mjs --apply-plan baseline-plan.json", "Approved baseline docs/reports only", "Yes"),
    action("Check environment baseline", `node scripts/check-environment-baseline.mjs ${shellQuote(targetRoot)}`, "No", "No"),
    action("Check task baseline references", `node scripts/check-baseline-enforcement.mjs ${shellQuote(targetRoot)} --mode ready`, "No", "No"),
  ];
}

function action(label, command, writes, requiresHumanConfirmation) {
  return { label, command, writes, requiresHumanConfirmation };
}

function buildWritePlan(report) {
  const date = new Date().toISOString().slice(0, 10);
  const writes = [
    {
      path: "docs/engineering-baseline.md",
      reason: "Draft or refresh project engineering baseline for human confirmation.",
      overwrite: false,
      content: fillTemplate("templates/engineering-baseline.md", report),
    },
    {
      path: "docs/environment-baseline.md",
      reason: "Draft project environment baseline with PENDING_CONFIRMATION and NOT_APPLICABLE states instead of invented facts.",
      overwrite: false,
      content: fillTemplate("templates/environment-baseline.md", report),
    },
    {
      path: `baseline-recommendations/${date}-baseline-recommendation.md`,
      reason: "Record read-only baseline recommendation for review.",
      overwrite: true,
      content: renderRecommendationMarkdown(report),
    },
  ];
  return {
    planType: "BASELINE_WRITE_PLAN",
    generatedBy: "scripts/baseline-project.mjs",
    generatedAt: new Date().toISOString(),
    targetRoot: report.projectRoot,
    reviewedByHuman: "PENDING",
    allowedWriteScope: [
      "docs/engineering-baseline.md",
      "docs/environment-baseline.md",
      "baseline-recommendations/",
      "baseline-gap-reports/",
    ],
    forbiddenWriteScope: [
      ".env",
      "CI/CD files",
      "deployment files",
      "production config",
      "AGENTS.md",
      "PR templates",
      "industrial packs",
      "secret values",
    ],
    writes,
  };
}

function fillTemplate(templateRel, report) {
  const templatePath = path.join(kitRoot, templateRel);
  if (!fs.existsSync(templatePath)) return `# Missing Template\n\nTemplate not found: ${templateRel}\n`;
  let content = fs.readFileSync(templatePath, "utf8");
  content = content.replace("<project-name>", path.basename(report.projectRoot));
  content = content.replace("<date>", new Date().toISOString().slice(0, 10));
  content = content.replace("<detected-profile-candidates>", report.detectedProfileCandidates.map((item) => `${item.id} (${item.status})`).join(", "));
  content = content.replace("<recommended-bl-level>", report.recommendedBaselineLevel.level);
  content = content.replace("<baseline-generated-summary>", `Generated from baseline recommendation. Can AI write now: No. Human confirmation is required before use as an approved project standard.`);
  return content;
}

function applyPlan(planPath) {
  if (!fs.existsSync(planPath)) throwUserError(`plan not found: ${planPath}`);
  const plan = readJson(planPath);
  if (plan.planType !== "BASELINE_WRITE_PLAN") throwUserError("planType must be BASELINE_WRITE_PLAN");
  if (!plan.targetRoot) throwUserError("plan.targetRoot is required");
  const targetRoot = path.resolve(plan.targetRoot);
  const writes = Array.isArray(plan.writes) ? plan.writes : [];
  if (writes.length === 0) throwUserError("plan.writes is empty");

  const applied = [];
  const skipped = [];
  for (const write of writes) {
    const rel = normalizePlanPath(write.path);
    assertAllowedWrite(rel);
    if (containsForbiddenSecretValue(write.content || "")) {
      throwUserError(`refusing to write ${rel}: content appears to contain a secret value`);
    }
    const dest = path.join(targetRoot, rel);
    if (fs.existsSync(dest) && !write.overwrite) {
      skipped.push({ path: rel, reason: "exists and overwrite is false" });
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, String(write.content || ""));
    applied.push(rel);
  }

  console.log("# Baseline Plan Apply Result");
  console.log("");
  console.log(`Target: ${targetRoot}`);
  console.log(`Applied: ${applied.length}`);
  for (const rel of applied) console.log(`- ${rel}`);
  console.log(`Skipped: ${skipped.length}`);
  for (const item of skipped) console.log(`- ${item.path}: ${item.reason}`);
}

function normalizePlanPath(value) {
  const rel = String(value || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel || rel.includes("..")) throwUserError(`unsafe plan path: ${value}`);
  return rel;
}

function assertAllowedWrite(rel) {
  const allowed = rel === "docs/engineering-baseline.md"
    || rel === "docs/environment-baseline.md"
    || rel.startsWith("baseline-recommendations/")
    || rel.startsWith("baseline-gap-reports/");
  if (!allowed) throwUserError(`write is outside baseline apply scope: ${rel}`);
}

function containsForbiddenSecretValue(content) {
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(content)
    || /\bgithub_pat_[A-Za-z0-9_]{20,}\b/.test(content)
    || /\bghp_[A-Za-z0-9]{20,}\b/.test(content)
    || /\bAKIA[0-9A-Z]{16}\b/.test(content)
    || /\b(password|secret|api_key|apikey)\s*=\s*[^<\s][^\s]+/i.test(content)
    || /:\/\/[^/\s:@]+:[^/\s:@]+@/.test(content);
}

function printRecommendation(report) {
  console.log(renderRecommendationMarkdown(report));
  if (report.planWritten) {
    console.log("");
    console.log("## Plan Written");
    console.log("");
    console.log(`Plan file: ${report.planWritten.path}`);
    console.log(`Writes target project now: ${report.planWritten.writesTargetProject}`);
    console.log(`Apply after review: \`${report.planWritten.applyCommand}\``);
  }
}

function renderRecommendationMarkdown(report) {
  const lines = [
    "# Baseline Recommendation",
    "",
    "## Human Summary",
    "",
    `Project classification: ${report.projectClassification}. Recommended baseline level: ${report.recommendedBaselineLevel.level}. Baseline is read-only by default; no target project files are written unless a reviewed plan is applied.`,
    "",
    "## Baseline Write Status",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Can AI write now | ${report.canAiWriteNow} |`,
    "| Default behavior | Read-only recommendation |",
    "| Write flow | write-plan -> human review -> apply-plan |",
    "",
    "## Profile Candidates",
    "",
    "| Profile | Status | Reason |",
    "|---|---|---|",
    ...report.detectedProfileCandidates.map((item) => `| ${item.id} | ${item.status} | ${item.reason} |`),
    "",
    "## Baseline State",
    "",
    "| Layer | State | Summary |",
    "|---|---|---|",
    `| Engineering | ${report.engineeringBaseline.state} | ${report.engineeringBaseline.summary} |`,
    `| Environment | ${report.environmentBaseline.state} | ${report.environmentBaseline.summary} |`,
    "",
    "## Gap Summary",
    "",
    ...report.gapSummary.map((item) => `- ${item}`),
    "",
    "## Pending Human Decisions",
    "",
    ...report.pendingHumanDecisions.map((item) => `- ${item}`),
    "",
    "## High-risk Areas",
    "",
    ...(report.highRiskAreas.length ? report.highRiskAreas.map((item) => `- ${item.id}: ${item.reason} (${item.status})`) : ["- none detected"]),
    "",
    "## Safe Next Actions",
    "",
    "| Action | Command | Writes | Requires human confirmation |",
    "|---|---|---|---|",
    ...report.safeNextActions.map((item) => `| ${item.label} | \`${item.command}\` | ${item.writes} | ${item.requiresHumanConfirmation} |`),
    "",
    "## Actions AI Must Not Take Yet",
    "",
    ...report.actionsAiMustNotTakeYet.map((item) => `- ${item}`),
    "",
    "## Suggested Write-plan Command",
    "",
    `\`${report.suggestedWritePlanCommand}\``,
  ];
  return `${lines.join("\n")}\n`;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throwUserError(`invalid JSON in ${filePath}: ${error.message}`);
  }
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function throwUserError(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}
