#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { assertSafeWritePath } from "./lib/path-safety.mjs";

const args = parseArgs(process.argv.slice(2));
const allowedKeys = new Set(["_", "target", "from", "to", "dry-run", "write-plan", "json"]);
const supportedFrom = new Set(["0.33.0"]);
const supportedTo = new Set(["1.0.0"]);
const currentIntentOSVersion = readCurrentVersion();

for (const key of Object.keys(args)) {
  if (!allowedKeys.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

const targetArg = args.target || args._[0];
const fromVersion = args.from;
const toVersion = args.to;
const dryRun = Boolean(args["dry-run"]);
const writePlan = args["write-plan"];
const outputJson = Boolean(args.json);

function fail(message, status = 1) {
  console.error(`FAIL ${message}`);
  process.exit(status);
}

if (!targetArg) fail("migrate requires --target <project>");
if (!fromVersion) fail("migrate requires --from <version>");
if (!toVersion) fail("migrate requires --to <version>");
const legacyMigration = supportedFrom.has(fromVersion) && supportedTo.has(toVersion);
const controlledOneXUpdate = /^1\.\d+(?:\.\d+)?$/.test(String(fromVersion || ""))
  && toVersion === currentIntentOSVersion;
if (!legacyMigration && !controlledOneXUpdate) {
  fail(`unsupported migration range: ${fromVersion} -> ${toVersion}`);
}
if (dryRun && writePlan) fail("use either --dry-run or --write-plan, not both");
if (!dryRun && !writePlan) {
  fail("migrate is plan-only in this phase; use --dry-run or --write-plan <file>", 2);
}

const projectRoot = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
  fail(`target is not a directory: ${projectRoot}`);
}

if (controlledOneXUpdate) {
  const installed = readJson(path.join(projectRoot, ".intentos", "version.json"));
  const detected = installed?.intentOSVersion || installed?.workflowVersion || null;
  if (detected !== fromVersion) {
    fail(`--from ${fromVersion} does not match the installed IntentOS version ${detected || "none"}`);
  }
}

if (writePlan && !isSafePlanPath(writePlan)) {
  fail("--write-plan must be a project-relative .json path under apply-execution-plans/ or .intentos/apply-plans/");
}

const plan = buildPlan(projectRoot, fromVersion, toVersion, controlledOneXUpdate ? "CONTROLLED_1X_UPDATE" : "LEGACY_033_TO_100");

if (dryRun) {
  printPlan(plan, outputJson);
  process.exit(0);
}

let planPath;
try {
  planPath = assertSafeWritePath(projectRoot, writePlan, "migration plan output");
} catch (error) {
  fail(error.message);
}
fs.mkdirSync(path.dirname(planPath), { recursive: true });
fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
if (outputJson) {
  console.log(JSON.stringify({ wrotePlan: planPath, plan }, null, 2));
} else {
  console.log(`Wrote migration plan: ${planPath}`);
  console.log("No target project files were modified.");
  console.log(`Planned actions: ${plan.actions.length}`);
  console.log(`Human decisions: ${plan.humanDecisions.length}`);
}

function buildPlan(target, from, to, migrationKind) {
  const versionFile = readJson(path.join(target, ".intentos", "version.json"));
  const hasIntentOS = fs.existsSync(path.join(target, ".intentos"));
  const hasAgents = fs.existsSync(path.join(target, "AGENTS.md"));
  const hasLegacyAgent = fs.existsSync(path.join(target, "agent.md"));
  const hasPrTemplate = fs.existsSync(path.join(target, ".github", "pull_request_template.md"));
  const hasWorkflowCi = fs.existsSync(path.join(target, ".github", "workflows", "ai-workflow-checks.yml"));
  const hasPackage = fs.existsSync(path.join(target, "package.json"));
  const hasGit = fs.existsSync(path.join(target, ".git"));
  const migrationReportsDir = path.join(target, ".intentos", "migration-reports");
  const pendingMigrationReports = fs.existsSync(migrationReportsDir)
    ? fs.readdirSync(migrationReportsDir).filter((name) => name.endsWith(".md")).sort()
    : [];

  const detectedVersion = versionFile?.intentOSVersion || versionFile?.workflowVersion || null;
  const actions = [];
  const humanDecisions = [];

  if (!hasIntentOS) {
    actions.push(planAction(
      "INIT_PLAN_REQUIRED",
      "Project has no .intentos directory.",
      "Run init/update with --dry-run or --write-plan before applying workflow assets.",
      false,
    ));
  } else {
    actions.push(planAction(
      "UPDATE_WORKFLOW_ASSETS_PLAN_REQUIRED",
      ".intentos directory exists.",
      "Generate an init-project update plan; review before applying.",
      false,
    ));
  }

  actions.push(planAction(
    "SYNC_DOCS_IA",
    `${to} workflow assets, evidence rules, and public entry must be replayed from the current trusted manifest.`,
    "Update workflow assets through a reviewed plan; do not hand-copy partial docs.",
    false,
  ));

  actions.push(planAction(
    "CHECK_ARTIFACT_FRONTMATTER",
    "Existing artifacts may use an older evidence contract.",
    "Run current strict artifact checks and keep legacy records diagnostic-only until rebound.",
    false,
  ));

  if (hasAgents || hasLegacyAgent) {
    humanDecisions.push(decision(
      "Agent instruction governance",
      "Existing agent instructions may be project-owned.",
      "Review migration report before applying AGENTS.md governance appendix.",
    ));
  }
  if (hasPrTemplate) {
    humanDecisions.push(decision(
      "PR template governance",
      "Existing PR templates may be project-owned.",
      "Review migration report before applying PR template governance appendix.",
    ));
  }
  if (pendingMigrationReports.length > 0) {
    humanDecisions.push(decision(
      "Pending migration reports",
      `${pendingMigrationReports.length} migration report(s) already exist.`,
      "Approve, reject, or manually merge each report before applying updates.",
    ));
  }

  humanDecisions.push(decision(
    "Apply migration",
    "IntentOS migrate is plan-only.",
    "Use init/update plan review; do not apply from migrate.",
  ));

  return {
    schemaVersion: "1.0",
    command: "migrate",
    migrationKind,
    fromVersion: from,
    toVersion: to,
    generatedAt: new Date().toISOString(),
    target: target,
    state: {
      detectedIntentOSVersion: detectedVersion,
      hasIntentOS,
      hasGit,
      hasPackage,
      hasAgents,
      hasLegacyAgent,
      hasPrTemplate,
      hasWorkflowCi,
      pendingMigrationReports,
    },
    signals: [
      signal("workflow-assets", hasIntentOS ? "present" : "missing"),
      signal("agent-instructions", hasAgents ? "AGENTS.md" : hasLegacyAgent ? "agent.md" : "missing"),
      signal("pr-template", hasPrTemplate ? "present" : "missing"),
      signal("workflow-ci", hasWorkflowCi ? "present" : "missing"),
    ],
    actions,
    humanDecisions,
    blockedApply: true,
    blockedReason: "migrate only produces dry-run output or a reviewable routing plan. It never applies changes.",
    nextCommand: [
      "node scripts/init-project.mjs",
      "--target",
      target,
      hasIntentOS ? "--update-workflow-assets" : "--starter generic-project",
      "--write-plan",
      `apply-execution-plans/intentos-${to}.json`,
    ].join(" "),
  };
}

function readCurrentVersion() {
  const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "VERSION.md");
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8").match(/Current version:\s*`([^`]+)`/i)?.[1] || "";
}

function planAction(id, reason, recommendation, willWrite) {
  return { id, reason, recommendation, willWrite };
}

function decision(id, reason, recommendation) {
  return { id, reason, recommendation, owner: "human", status: "PENDING" };
}

function signal(name, value) {
  return { name, value };
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function isSafePlanPath(value) {
  const text = String(value || "");
  if (!text.endsWith(".json")) return false;
  if (text.includes("\0")) return false;
  if (path.isAbsolute(text)) return false;
  const normalized = path.normalize(text);
  if (normalized.split(path.sep).includes("..")) return false;
  const portable = normalized.replaceAll(path.sep, "/");
  return portable.startsWith("apply-execution-plans/")
    || portable.startsWith(".intentos/apply-plans/");
}

function printPlan(plan, json) {
  if (json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  console.log("# IntentOS Migration Plan");
  console.log("");
  console.log(`From: ${plan.fromVersion}`);
  console.log(`To: ${plan.toVersion}`);
  console.log(`Target: ${plan.target}`);
  console.log(`Detected intentos version: ${plan.state.detectedIntentOSVersion || "none"}`);
  console.log(`Blocked apply: ${plan.blockedApply ? "Yes" : "No"}`);
  console.log("");
  console.log("Planned actions:");
  for (const action of plan.actions) {
    console.log(`- ${action.id}: ${action.recommendation}`);
  }
  console.log("");
  console.log("Human decisions:");
  for (const item of plan.humanDecisions) {
    console.log(`- ${item.id}: ${item.recommendation}`);
  }
  console.log("");
  console.log("No target project files were modified.");
}
