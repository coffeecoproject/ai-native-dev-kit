#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const allowedFormats = new Set(["human", "json"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!allowedFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human, --format json, or --json.");
  process.exit(1);
}

const workflowNext = runNode(["scripts/workflow-next.mjs", projectRoot, "--json"]);
if (workflowNext.status !== 0) {
  console.error("FAIL start could not inspect project state with workflow-next.");
  process.stderr.write(workflowNext.stderr || workflowNext.stdout || "");
  process.exit(workflowNext.status || 1);
}

let workflow;
try {
  workflow = JSON.parse(workflowNext.stdout);
} catch (error) {
  console.error(`FAIL workflow-next did not return valid JSON: ${error.message}`);
  process.stderr.write(workflowNext.stdout || "");
  process.exit(1);
}

const coreCheck = runCoreCheckIfUseful(workflow);
const recommendation = buildRecommendation(workflow, coreCheck);

if (outputFormat === "json") {
  console.log(JSON.stringify(recommendation, null, 2));
} else {
  printRecommendation(recommendation);
}

function runNode(scriptArgs) {
  return spawnSync(process.execPath, scriptArgs, {
    cwd: kitRoot,
    encoding: "utf8",
  });
}

function runCoreCheckIfUseful(workflowState) {
  const runnableStates = new Set([
    "BOOTSTRAPPED",
    "BOOTSTRAPPED_WITH_MISSING_ASSETS",
    "BOOTSTRAPPED_WITH_PENDING_MIGRATION",
    "PARTIAL_BOOTSTRAP",
  ]);
  if (!runnableStates.has(workflowState.workflowState)) {
    return {
      status: "SKIPPED_NOT_BOOTSTRAPPED",
      exitCode: null,
      summary: "Core workflow check skipped because the project is not bootstrapped yet.",
    };
  }

  const result = runNode(["scripts/check-ai-workflow.mjs", projectRoot, "--mode", "core"]);
  return {
    status: result.status === 0 ? "PASS" : "FAIL",
    exitCode: result.status,
    summary: result.status === 0
      ? "Core workflow check passed."
      : "Core workflow check found missing or invalid workflow assets.",
  };
}

function buildRecommendation(workflow, coreCheck) {
  const classification = classifyProject(workflow);
  const pathPlan = pathForClassification(classification, workflow);
  return {
    reportType: "ADOPTION_RECOMMENDATION",
    generatedBy: "scripts/start-project.mjs",
    generatedAt: new Date().toISOString(),
    startIsReadOnlyByDefault: true,
    projectRoot: workflow.projectRoot,
    classification,
    recommendedPath: pathPlan.recommendedPath,
    why: pathPlan.why,
    decisionsNeededFromHuman: pathPlan.decisionsNeededFromHuman,
    safeNextActions: pathPlan.safeNextActions,
    actionsAiMustNotTakeYet: pathPlan.actionsAiMustNotTakeYet,
    generatedPlanReportRefs: pathPlan.generatedPlanReportRefs,
    finalRecommendation: pathPlan.finalRecommendation,
    workflowNext: workflow,
    doctor: {
      workflowNext: {
        status: "PASS",
        nextAction: workflow.nextAction,
        adoptionMode: workflow.adoptionMode,
      },
      coreWorkflowCheck: coreCheck,
    },
  };
}

function classifyProject(workflow) {
  const tags = new Set(workflow.projectStateTags || []);

  if (workflow.projectState === "TARGET_MISSING") {
    return {
      projectType: "UNKNOWN_NEEDS_DISCUSSION",
      riskLevel: "medium",
      adoptionMode: "discuss-only",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (workflow.projectState === "DEV_KIT_REPOSITORY") {
    return {
      projectType: "DEV_KIT_REPOSITORY",
      riskLevel: "low",
      adoptionMode: "dev-kit-maintenance",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (tags.has("DIRTY_WORKTREE_PROJECT")) {
    return {
      projectType: "DIRTY_WORKTREE_PROJECT",
      riskLevel: "high",
      adoptionMode: "read-only-first",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (tags.has("PRODUCTION_GOVERNED_PROJECT")) {
    return {
      projectType: "PRODUCTION_SENSITIVE_PROJECT",
      riskLevel: "high",
      adoptionMode: "read-only-first",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (tags.has("GOVERNED_EXISTING_PROJECT")) {
    return {
      projectType: "GOVERNED_EXISTING_PROJECT",
      riskLevel: "medium-high",
      adoptionMode: "read-only-first",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (workflow.projectState === "NEW_PROJECT") {
    return {
      projectType: "NEW_PROJECT",
      riskLevel: "low",
      adoptionMode: "guided-init",
      canAiWriteNow: "No",
      confidence: "high",
    };
  }

  if (workflow.projectState === "BOOTSTRAPPED_PROJECT") {
    return {
      projectType: "ALREADY_BOOTSTRAPPED_PROJECT",
      riskLevel: "medium",
      adoptionMode: "doctor-then-next-task",
      canAiWriteNow: "No",
      confidence: "medium",
    };
  }

  if (workflow.projectState === "EXISTING_PROJECT" || workflow.projectState === "PARTIALLY_BOOTSTRAPPED_PROJECT") {
    return {
      projectType: "EXISTING_LIGHT_PROJECT",
      riskLevel: "medium",
      adoptionMode: "plan-first",
      canAiWriteNow: "No",
      confidence: "medium",
    };
  }

  return {
    projectType: "UNKNOWN_NEEDS_DISCUSSION",
    riskLevel: "medium",
    adoptionMode: "discuss-only",
    canAiWriteNow: "No",
    confidence: "low",
  };
}

function pathForClassification(classification, workflow) {
  const commonMustNot = [
    "Do not write workflow assets from start; start is read-only by default.",
    "Do not install all industrial packs by default.",
    "Do not enable BL2 or any industrial pack without explicit human confirmation.",
    "Do not change business code, deployment settings, secrets, migrations, permissions, or production configuration during adoption recommendation.",
  ];

  const baseRefs = [
    "adoption-recommendations/<date>-guided-start.md",
    "docs/first-hour.md",
  ];

  if (classification.projectType === "NEW_PROJECT") {
    return {
      recommendedPath: {
        oLevel: "O0/O1",
        blLevel: "BL0 first; BL1/BL2 only after platform and risk confirmation",
        profiles: "Decide platform profile from project intent before init",
        industrialPacks: "None by default",
        goalMode: "ADOPTION",
        planFirstRequired: false,
        adoptionMode: "guided-init",
        riskLevel: classification.riskLevel,
      },
      why: [
        "The target appears empty or new.",
        "AI can prepare an initialization command, but the human still confirms project type and platform before writing.",
      ],
      decisionsNeededFromHuman: [
        "Confirm this is the intended new project directory.",
        "Choose platform scope, such as web, iOS, Android, WeChat mini program, backend API, or mixed.",
        "Confirm whether to initialize workflow assets now.",
      ],
      safeNextActions: [
        action("Preview init", `node scripts/cli.mjs init --target ${shellQuote(workflow.projectRoot)} --dry-run`, "No", "No"),
        action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(workflow.projectRoot)}`, "No", "No"),
        action("Write init plan", `node scripts/init-project.mjs --target ${shellQuote(workflow.projectRoot)} --write-plan adoption-plan.json`, "Plan file only", "Yes"),
        action("Apply reviewed init plan", "node scripts/init-project.mjs --apply-plan adoption-plan.json", "Yes", "Yes"),
      ],
      actionsAiMustNotTakeYet: commonMustNot,
      generatedPlanReportRefs: baseRefs,
      finalRecommendation: "Ask the human to confirm project type and platform, then create an init plan before applying anything.",
    };
  }

  if (classification.projectType === "EXISTING_LIGHT_PROJECT") {
    return {
      recommendedPath: {
        oLevel: "O1",
        blLevel: "BL0 first; BL1 after current stack is understood",
        profiles: "Infer candidate profiles from code, then ask human to confirm",
        industrialPacks: "None by default",
        goalMode: "ADOPTION",
        planFirstRequired: true,
        adoptionMode: "plan-first",
        riskLevel: classification.riskLevel,
      },
      why: [
        "The target has existing project signals but no strong governance or production-sensitive markers.",
        "The safe path is to write a reviewable adoption plan before adding workflow assets.",
      ],
      decisionsNeededFromHuman: [
        "Confirm whether AI should only assess first or prepare a write plan.",
        "Confirm which project areas are in scope for initial workflow adoption.",
        "Confirm platform profile candidates before any baseline setup.",
      ],
      safeNextActions: [
        action("Inspect only", `node scripts/cli.mjs start ${shellQuote(workflow.projectRoot)}`, "No", "No"),
        action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(workflow.projectRoot)}`, "No", "No"),
        action("Write adoption plan", `node scripts/init-project.mjs --target ${shellQuote(workflow.projectRoot)} --update-workflow-assets --write-plan adoption-plan.json`, "Plan file only", "Yes"),
        action("Apply reviewed plan", "node scripts/init-project.mjs --apply-plan adoption-plan.json", "Yes", "Yes"),
      ],
      actionsAiMustNotTakeYet: commonMustNot,
      generatedPlanReportRefs: baseRefs,
      finalRecommendation: "Prepare a write plan only after the human confirms the existing project should be adopted.",
    };
  }

  if (classification.projectType === "GOVERNED_EXISTING_PROJECT") {
    return governedPath(classification, workflow, "Existing governance signals were detected.");
  }

  if (classification.projectType === "PRODUCTION_SENSITIVE_PROJECT") {
    return governedPath(classification, workflow, "Production-sensitive signals were detected.");
  }

  if (classification.projectType === "DIRTY_WORKTREE_PROJECT") {
    return {
      ...governedPath(classification, workflow, "The git worktree has existing changes or untracked files."),
      finalRecommendation: "Stop write actions. Ask the human to decide how to handle the dirty worktree before adoption or task execution.",
    };
  }

  if (classification.projectType === "ALREADY_BOOTSTRAPPED_PROJECT") {
    return {
      recommendedPath: {
        oLevel: "O1/O2 depending on task",
        blLevel: workflow.baselineLevel || "Use the project-selected baseline",
        profiles: "Use existing selected profiles",
        industrialPacks: workflow.selectedIndustrialPacks?.length ? workflow.selectedIndustrialPacks.join(", ") : "Use selected packs only; none by default",
        goalMode: "TASK_OR_ADOPTION",
        planFirstRequired: workflow.nextAction !== "READY_FOR_FIRST_REQUEST" && workflow.nextAction !== "READY_FOR_TASK_EXECUTION",
        adoptionMode: "doctor-then-next-task",
        riskLevel: classification.riskLevel,
      },
      why: [
        "The project already has AI Native workflow assets.",
        "The next safe step should follow workflow-next and the current task goal, not reinstall the kit.",
      ],
      decisionsNeededFromHuman: [
        "Confirm whether the next action is project maintenance, a new request, or a specific task.",
        "Confirm any pending baseline, onboarding, migration, or industrial-pack decision before execution.",
      ],
      safeNextActions: [
        action("Run doctor", `node scripts/cli.mjs doctor ${shellQuote(workflow.projectRoot)}`, "No", "No"),
        action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(workflow.projectRoot)}`, "No", "No"),
        action("Create first request", "node scripts/new-workflow-item.mjs --type request --name <name>", "Workflow artifact only", "Yes"),
      ],
      actionsAiMustNotTakeYet: commonMustNot,
      generatedPlanReportRefs: baseRefs,
      finalRecommendation: "Use doctor results to choose the next task; do not reinstall workflow assets unless workflow-next reports a version or asset gap.",
    };
  }

  if (classification.projectType === "DEV_KIT_REPOSITORY") {
    return {
      recommendedPath: {
        oLevel: "Dev-kit maintenance",
        blLevel: "Not applicable",
        profiles: "Not applicable",
        industrialPacks: "Not applicable",
        goalMode: "DEV_KIT_MAINTENANCE",
        planFirstRequired: false,
        adoptionMode: "dev-kit-maintenance",
        riskLevel: classification.riskLevel,
      },
      why: [
        "The current directory is the AI Native Dev Kit source repository.",
        "Project adoption commands should target another project directory.",
      ],
      decisionsNeededFromHuman: [
        "Confirm whether the request is to change the dev-kit itself or adopt a separate project.",
      ],
      safeNextActions: [
        action("Run dev-kit self-check", "node scripts/cli.mjs self-check", "No", "No"),
      ],
      actionsAiMustNotTakeYet: [
        "Do not treat this repository as a generated target project.",
        ...commonMustNot,
      ],
      generatedPlanReportRefs: baseRefs,
      finalRecommendation: "Continue only if the requested work is dev-kit maintenance; otherwise ask for a target project path.",
    };
  }

  return {
    recommendedPath: {
      oLevel: "O0",
      blLevel: "Do not select yet",
      profiles: "Do not select yet",
      industrialPacks: "None by default",
      goalMode: "DISCUSS_ONLY",
      planFirstRequired: false,
      adoptionMode: "discuss-only",
      riskLevel: classification.riskLevel,
    },
    why: [
      "The project cannot be classified confidently from available signals.",
      "A short human clarification is safer than guessing.",
    ],
    decisionsNeededFromHuman: [
      "Confirm the correct project path.",
      "Confirm whether this is a new project, existing project, production project, or already governed project.",
      "Confirm whether AI should assess only or prepare a plan.",
    ],
    safeNextActions: [
      action("Discuss only", "Ask focused clarification questions before running setup.", "No", "Yes"),
      action("Inspect again", `node scripts/cli.mjs start ${shellQuote(workflow.projectRoot)}`, "No", "No"),
    ],
    actionsAiMustNotTakeYet: commonMustNot,
    generatedPlanReportRefs: baseRefs,
    finalRecommendation: "Do not configure yet. Clarify the project type and risk boundary first.",
  };
}

function governedPath(classification, workflow, reason) {
  return {
    recommendedPath: {
      oLevel: "O0/O1 read-only adoption",
      blLevel: "Do not change baseline until existing governance is mapped",
      profiles: "Infer only; confirm with human before writing",
      industrialPacks: "None by default; BL2 requires explicit human confirmation",
      goalMode: "ADOPTION_READ_ONLY",
      planFirstRequired: true,
      adoptionMode: "read-only-first",
      riskLevel: classification.riskLevel,
    },
    why: [
      reason,
      "The safe path is assessment first, then a reviewable plan, then optional apply.",
    ],
    decisionsNeededFromHuman: [
      "Confirm who owns the existing governance rules and current changes.",
      "Confirm whether AI may prepare a read-only adoption assessment.",
      "Confirm whether any workflow write plan is allowed after assessment.",
    ],
    safeNextActions: [
      action("Read-only assessment", `node scripts/cli.mjs next ${shellQuote(workflow.projectRoot)}`, "No", "No"),
      action("Read baseline recommendation", `node scripts/cli.mjs baseline ${shellQuote(workflow.projectRoot)}`, "No", "No"),
      action("Prepare adoption assessment", "Use .ai-native/templates/adoption-assessment.md after assets are available, or draft the same structure manually.", "Report only", "Yes"),
      action("Write adoption plan later", `node scripts/init-project.mjs --target ${shellQuote(workflow.projectRoot)} --update-workflow-assets --write-plan adoption-plan.json`, "Plan file only", "Yes"),
    ],
    actionsAiMustNotTakeYet: [
      "Do not run direct init or direct update.",
      "Do not overwrite AGENTS.md, CI, PR template, or existing governance files.",
      "Do not change code, database, production settings, secrets, deployment files, or permissions.",
      "Do not enable BL2 or any industrial pack without explicit human confirmation.",
      "Do not install all industrial packs by default.",
    ],
    generatedPlanReportRefs: [
      "adoption-recommendations/<date>-guided-start.md",
      ".ai-native/templates/adoption-assessment.md",
      ".ai-native/templates/existing-governance-map.md",
      "docs/first-hour.md",
    ],
    finalRecommendation: "Stay read-only. Produce an adoption assessment and ask for human confirmation before any write plan.",
  };
}

function action(label, command, writes, requiresHumanConfirmation) {
  return {
    label,
    command,
    writes,
    requiresHumanConfirmation,
  };
}

function printRecommendation(report) {
  console.log("# Guided Adoption Recommendation");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`Project type: ${report.classification.projectType}. Recommended mode: ${report.classification.adoptionMode}. start is read-only by default; no target project files were written.`);
  console.log("");
  console.log("## Project Classification");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Project type | ${report.classification.projectType} |`);
  console.log(`| Risk level | ${report.classification.riskLevel} |`);
  console.log(`| Adoption mode | ${report.classification.adoptionMode} |`);
  console.log(`| Can AI write now | ${report.classification.canAiWriteNow} |`);
  console.log(`| Confidence | ${report.classification.confidence} |`);
  console.log("");
  console.log("## Recommended Adoption Path");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  for (const [key, value] of Object.entries(report.recommendedPath)) {
    console.log(`| ${humanizeKey(key)} | ${formatValue(value)} |`);
  }
  console.log("");
  console.log("## Why This Path");
  console.log("");
  for (const item of report.why) console.log(`- ${item}`);
  console.log("");
  console.log("## Decisions Needed From Human");
  console.log("");
  for (const item of report.decisionsNeededFromHuman) console.log(`- ${item}`);
  console.log("");
  console.log("## Safe Next Actions");
  console.log("");
  console.log("| Action | Command | Writes | Requires human confirmation |");
  console.log("| --- | --- | --- | --- |");
  for (const item of report.safeNextActions) {
    console.log(`| ${item.label} | \`${item.command}\` | ${item.writes} | ${item.requiresHumanConfirmation} |`);
  }
  console.log("");
  console.log("## Actions AI Must Not Take Yet");
  console.log("");
  for (const item of report.actionsAiMustNotTakeYet) console.log(`- ${item}`);
  console.log("");
  console.log("## Generated Plan / Report Refs");
  console.log("");
  for (const item of report.generatedPlanReportRefs) console.log(`- ${item}`);
  console.log("");
  console.log("## Technical Evidence");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Project root | ${report.projectRoot} |`);
  console.log(`| workflow-next status | ${report.doctor.workflowNext.status} |`);
  console.log(`| workflow-next next action | ${report.doctor.workflowNext.nextAction} |`);
  console.log(`| workflow-next adoption mode | ${report.doctor.workflowNext.adoptionMode} |`);
  console.log(`| core workflow check | ${report.doctor.coreWorkflowCheck.status} |`);
  console.log(`| core workflow check summary | ${report.doctor.coreWorkflowCheck.summary} |`);
  console.log(`| target files written by start | No |`);
  console.log("");
  console.log("## Final Recommendation");
  console.log("");
  console.log(report.finalRecommendation);
}

function humanizeKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\\''")}'`;
}
