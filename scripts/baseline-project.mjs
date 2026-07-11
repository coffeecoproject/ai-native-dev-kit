#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { filterIntentOSManagedPaths, walkRelativePaths } from "./lib/project-signals.mjs";
import { assertSafeRelativePath, assertSafeWritePath } from "./lib/path-safety.mjs";

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
  console.error("FAIL direct baseline plan apply was retired in IntentOS 1.94");
  console.error("Generate an exact init/update execution plan, then use the structured Approval Record and Controlled Apply Readiness path.");
  process.exit(2);
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
  let planPath;
  try {
    const planRel = assertSafeRelativePath(String(args["write-plan"]), "baseline proposal path");
    if (!planRel.startsWith("baseline-recommendations/") || !planRel.endsWith(".json")) {
      throw new Error("baseline proposal path must match baseline-recommendations/*.json");
    }
    planPath = assertSafeWritePath(projectRoot, planRel, "baseline proposal path");
    if (fs.existsSync(planPath)) throw new Error(`baseline proposal already exists: ${planRel}`);
  } catch (error) {
    console.error(`FAIL ${error.message}`);
    process.exit(2);
  }
  const plan = buildWritePlan(recommendation);
  fs.mkdirSync(path.dirname(planPath), { recursive: true });
  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  recommendation.planWritten = {
    path: planPath,
    writesTargetProject: "No",
    applyCommand: "N/A - proposal only; convert selected actions into an init-project controlled execution plan",
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
    suggestedWritePlanCommand: `node scripts/baseline-project.mjs ${shellQuote(targetRoot)} --write-plan baseline-recommendations/baseline-plan.json`,
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
  if (workflow.projectState === "INTENTOS_REPOSITORY") return "INTENTOS_REPOSITORY";
  if (tags.has("DIRTY_WORKTREE_PROJECT")) return "DIRTY_WORKTREE_PROJECT";
  if (tags.has("PRODUCTION_GOVERNED_PROJECT")) return "PRODUCTION_SENSITIVE_PROJECT";
  if (tags.has("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_EXISTING_PROJECT";
  if (workflow.projectState === "NEW_PROJECT") return "NEW_PROJECT";
  if (workflow.projectState === "BOOTSTRAPPED_PROJECT") return "ALREADY_BOOTSTRAPPED_PROJECT";
  if (workflow.projectState === "EXISTING_PROJECT" || workflow.projectState === "PARTIALLY_BOOTSTRAPPED_PROJECT") return "EXISTING_LIGHT_PROJECT";
  return "UNKNOWN_NEEDS_DISCUSSION";
}

function detectProfileCandidates(targetRoot) {
  const discovered = walkRelativePaths(targetRoot, ".", { maxDepth: 3 }).map((item) => item.replace(/\\/g, "/"));
  const rels = new Set(filterIntentOSManagedPaths(targetRoot, discovered));
  const packageJson = readJsonIfExists(path.join(targetRoot, "package.json"));
  const packageText = packageJson ? JSON.stringify({ dependencies: packageJson.dependencies || {}, devDependencies: packageJson.devDependencies || {}, scripts: packageJson.scripts || {} }) : "";
  const candidates = [];

  if (rels.has("index.html") || rels.has("vite.config.ts") || rels.has("vite.config.js") || rels.has("next.config.js") || rels.has("next.config.mjs") || /"(?:react|next|vue|vite|svelte|solid-js|@angular\/[^"\\]+)"\s*:/i.test(packageText)) {
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
  if (hasInternalAdminSignals(rels, packageText)) {
    candidates.push(profile("internal-admin", "Admin, dashboard, approval, or operations console signals found."));
  }

  if (candidates.length === 0) {
    candidates.push(profile("unknown", "No strong platform signal found. Human should confirm project platform before baseline setup."));
  }
  return candidates;
}

function profile(id, reason) {
  return { id, reason, status: id === "unknown" ? "PENDING_CONFIRMATION" : "CANDIDATE" };
}

function hasInternalAdminSignals(rels, packageText) {
  return /\b(admin|dashboard|management-console|ops-console|operations-console|approval|merchant-admin|platform-admin|web-admin)\b/i.test(packageText)
    || [...rels].some((item) => /(^|\/)(admin|dashboard|console|approval)(\/|$)|(^|\/)apps\/[^/]*(admin|dashboard)[^/]*(\/|$)|[-_](admin|dashboard)([-_/]|$)/i.test(item));
}

function inspectBaselineDoc(targetRoot, rel) {
  const resolvedRel = fs.existsSync(path.join(targetRoot, rel))
    ? rel
    : findEquivalentBaselineDoc(targetRoot, rel);
  const full = path.join(targetRoot, resolvedRel || rel);
  if (!fs.existsSync(full)) {
    return {
      ref: rel,
      state: "MISSING",
      summary: `${rel} or an equivalent baseline doc does not exist yet.`,
      canUseForTaskReferences: "No",
    };
  }
  const content = fs.readFileSync(full, "utf8");
  const pending = /\b(PENDING|PENDING_CONFIRMATION|DRAFT|TODO|TBD|NEEDS_HUMAN|待确认|待定)\b/i.test(content);
  return {
    ref: resolvedRel || rel,
    state: pending ? "PENDING" : "PRESENT",
    summary: pending ? `${resolvedRel || rel} exists with pending decisions.` : `${resolvedRel || rel} exists.`,
    canUseForTaskReferences: "Yes",
  };
}

function findEquivalentBaselineDoc(targetRoot, canonicalRel) {
  const rels = walkRelativePaths(targetRoot, ".", { maxDepth: 4 })
    .map((item) => item.replace(/\\/g, "/"))
    .filter((item) => item.toLowerCase().endsWith(".md"));
  const lowerCanonical = canonicalRel.toLowerCase();
  const kind = lowerCanonical.includes("environment") ? "environment" : "engineering";
  const docs = rels.filter((item) => item.startsWith("docs/") || item.includes("/docs/"));
  const candidates = docs.filter((item) => {
    const lower = item.toLowerCase();
    if (!lower.includes("baseline")) return false;
    if (kind === "engineering") return /engineering|code|quality|frontend|backend|web|ios|android|miniprogram/.test(lower);
    return /environment|env|runtime|release|rollback|deploy|ci/.test(lower);
  });
  return candidates.sort((left, right) => scoreBaselineCandidate(right, kind) - scoreBaselineCandidate(left, kind))[0] || null;
}

function scoreBaselineCandidate(rel, kind) {
  const lower = rel.toLowerCase();
  let score = 0;
  if (lower.startsWith("docs/")) score += 2;
  if (lower.includes("baseline")) score += 2;
  if (kind === "engineering" && lower.includes("engineering")) score += 4;
  if (kind === "environment" && lower.includes("environment")) score += 4;
  if (kind === "environment" && lower.includes("env")) score += 2;
  if (lower.includes("web")) score += 1;
  return score;
}

function recommendBaselineLevel(classification, profiles) {
  if (classification === "INTENTOS_REPOSITORY") {
    return {
      level: "Not applicable for target-project adoption",
      reason: "This is the IntentOS source repository. Run intentos self-check for maintenance, or run baseline against a target project.",
      industrialPacks: "Not applicable",
    };
  }
  if (classification === "PRODUCTION_SENSITIVE_PROJECT" || classification === "GOVERNED_EXISTING_PROJECT" || classification === "DIRTY_WORKTREE_PROJECT") {
    return {
      level: "BL1",
      safeActionLevel: classification === "DIRTY_WORKTREE_PROJECT" ? "READ_ONLY_UNTIL_WORKTREE_DECISION" : "BL1 read-only mapping",
      targetCandidateLevel: "BL2 candidate after human confirmation and evidence",
      reason: "Existing governance, production, or dirty-worktree signals require visible baseline decisions before implementation. Current safe action stays BL1/read-only; BL2 remains a candidate only after explicit evidence and human confirmation.",
      industrialPacks: "None by default",
    };
  }
  if (classification === "NEW_PROJECT") {
    return {
      level: "BL0 first, then BL1 after platform and project goal confirmation",
      safeActionLevel: "BL0 discovery",
      targetCandidateLevel: "none",
      reason: "New projects should start light, then confirm engineering and environment rules before non-trivial work.",
      industrialPacks: "None by default",
    };
  }
  if (profiles.some((item) => item.id === "backend-api" || item.id === "internal-admin")) {
    return {
      level: "BL1",
      safeActionLevel: "BL1 plan-first",
      targetCandidateLevel: "none unless high-risk scope is confirmed",
      reason: "Backend/admin signals usually need data, permission, environment, and release decisions before implementation.",
      industrialPacks: "None by default",
    };
  }
  return {
    level: "BL0/BL1 depending on first task risk",
    safeActionLevel: "BL0/BL1 depending on first task risk",
    targetCandidateLevel: "none unless high-risk scope is confirmed",
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
  const decisions = [];
  if (profiles.some((item) => item.id === "unknown")) decisions.push("Describe the product target in plain language because Codex cannot yet identify a platform safely.");
  if (classification === "PRODUCTION_SENSITIVE_PROJECT") decisions.push("Confirm the unresolved production owner or material-risk recommendation before any apply.");
  if (/BL2/.test(level.level)) decisions.push("Accept or reject Codex's plain-language BL2 recommendation and its concrete industrial scope.");
  if (decisions.length === 0 && gaps.some((item) => /Engineering|Environment/.test(item))) {
    decisions.push("No technical choice is required from you now; Codex should prepare the bounded baseline gap plan and ask only if project evidence cannot resolve a material decision.");
  }
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
  const controlledApplyCommand = fs.existsSync(path.join(kitRoot, "scripts", "init-project.mjs"))
    ? "node scripts/init-project.mjs --target <project> --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan <project>/apply-execution-plans/baseline.json"
    : "From the IntentOS source checkout, run: node scripts/init-project.mjs --target <project> --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan <project>/apply-execution-plans/baseline.json";
  return [
    action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(targetRoot)}`, "No", "No"),
    action("Write baseline plan only", `node scripts/baseline-project.mjs ${shellQuote(targetRoot)} --write-plan baseline-recommendations/baseline-plan.json`, "Plan file only", "Yes"),
    action("Prepare controlled baseline apply", controlledApplyCommand, "Plan file only", "Yes"),
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

function printRecommendation(report) {
  console.log(renderRecommendationMarkdown(report));
  if (report.planWritten) {
    console.log("");
    console.log("## Plan Written");
    console.log("");
    console.log(`Plan file: ${report.planWritten.path}`);
    console.log(`Writes target project now: ${report.planWritten.writesTargetProject}`);
    console.log(`Controlled apply route: \`${report.planWritten.applyCommand}\``);
  }
}

function renderRecommendationMarkdown(report) {
  const decision = buildBaselineDecisionSummary(report);
  const lines = [
    "# Baseline Recommendation",
    "",
    "## Human Decision Summary",
    "",
    `Conclusion: ${decision.conclusion}`,
    "",
    `Recommended choice: ${decision.recommendedChoice}`,
    "",
    `Can AI continue now: ${decision.canAiContinue}`,
    "",
    `What I need from you: ${decision.needFromHuman}`,
    "",
    "| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |",
    "|---|---|---|---|---|---|",
    ...decision.options.map((item) => `| ${mdCell(item.option)} | ${mdCell(item.meaning)} | ${mdCell(item.aiWillDo)} | ${mdCell(item.writes)} | ${mdCell(item.risk)} | ${mdCell(item.when)} |`),
    "",
    `Recommended reason: ${decision.reason}`,
    "",
    `What happens if you do nothing: ${decision.ifNothing}`,
    "",
    "## Human Summary",
    "",
    `Project classification: ${report.projectClassification}. Current safe action: ${report.recommendedBaselineLevel.safeActionLevel || report.recommendedBaselineLevel.level}. Target candidate level: ${report.recommendedBaselineLevel.targetCandidateLevel || "none"}. Baseline is read-only by default; no target project files are written unless a reviewed plan is applied.`,
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

function buildBaselineDecisionSummary(report) {
  const actions = report.safeNextActions || [];
  const options = actions.slice(0, 4).map((item, index) => ({
    option: String.fromCharCode(65 + index),
    meaning: item.label,
    aiWillDo: item.command,
    writes: item.writes,
    risk: baselineActionRisk(report, item),
    when: baselineActionWhen(report, item),
  }));
  if (!options.some((item) => item.meaning === "Pause")) {
    options.push({
      option: String.fromCharCode(65 + options.length),
      meaning: "Pause",
      aiWillDo: "Stop baseline setup and wait for a clearer project decision.",
      writes: "No",
      risk: "low",
      when: "Choose when the platform, risk level, or baseline owner is unclear.",
    });
  }
  const recommendedAction = chooseRecommendedBaselineAction(report, actions);
  return {
    conclusion: `This project is classified as ${report.projectClassification}; current safe action is ${report.recommendedBaselineLevel.safeActionLevel || report.recommendedBaselineLevel.level}; target candidate level is ${report.recommendedBaselineLevel.targetCandidateLevel || "none"}.`,
    recommendedChoice: recommendedAction ? `${optionLetterFor(options, recommendedAction)} - ${recommendedAction.label}` : "A - Read baseline recommendation",
    canAiContinue: report.canAiWriteNow === "Yes" ? "yes" : "limited",
    needFromHuman: report.pendingHumanDecisions?.[0] || "Confirm the baseline path.",
    options,
    reason: report.recommendedBaselineLevel.reason,
    ifNothing: "Codex should keep baseline setup read-only and avoid project-wide engineering, environment, release, or production assumptions.",
  };
}

function chooseRecommendedBaselineAction(report, actions) {
  if (report.gapSummary.some((item) => /missing|pending/i.test(item))) {
    return actions.find((item) => item.label === "Write baseline plan only") || actions[0];
  }
  if (report.projectClassification === "PRODUCTION_SENSITIVE_PROJECT") {
    return actions.find((item) => item.label === "Read baseline recommendation") || actions[0];
  }
  return actions.find((item) => item.label === "Check task baseline references") || actions[0];
}

function baselineActionRisk(report, item) {
  if (item.writes === "No") return "low";
  if (report.projectClassification === "PRODUCTION_SENSITIVE_PROJECT"
    || /BL2/.test(report.recommendedBaselineLevel.level)
    || /BL2/.test(report.recommendedBaselineLevel.targetCandidateLevel || "")) return "medium/high";
  if (item.writes === "Plan file only") return "low/medium";
  return "medium";
}

function baselineActionWhen(report, item) {
  if (item.label === "Read baseline recommendation") return "Choose when you only want diagnosis.";
  if (item.label === "Write baseline plan only") return "Choose when gaps exist and you want a reviewable plan before files change.";
  if (item.label === "Prepare controlled baseline apply") return "Choose only after Codex has converted selected gaps into the exact controlled action graph.";
  if (item.label === "Check environment baseline") return "Choose when environment facts may already be recorded.";
  return "Choose when the project baseline is already ready enough for task work.";
}

function optionLetterFor(options, actionItem) {
  const optionItem = options.find((item) => item.meaning === actionItem.label);
  return optionItem?.option || "A";
}

function mdCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}
