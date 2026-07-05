#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

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

const report = buildWorkflowMap(projectRoot);

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildWorkflowMap(root) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 4,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const pathSet = new Set(paths);
  const signals = exists ? collectSignals(root, pathSet) : emptySignals();
  const classification = classify(root, exists, git, signals);
  const adapterMode = adapterModeFor(classification);
  const recommendedChoice = choiceFor(adapterMode, classification);
  const nativeMigrationRecommendation = nativeMigrationFor(adapterMode, classification);

  return {
    reportType: "WORKFLOW_ADOPTION_MAP_RECOMMENDATION",
    generatedBy: "scripts/resolve-existing-workflow.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    classification,
    adapterMode,
    humanDecisionSummary: {
      conclusion: conclusionFor(classification, adapterMode),
      recommendedChoice: recommendedChoice.choice,
      canAiContinueNow: recommendedChoice.canAiContinueNow,
      needFromHuman: recommendedChoice.needFromHuman,
      ifNothing: recommendedChoice.ifNothing,
    },
    existingProjectSignals: {
      exists,
      git: git || {
        isGitRepository: false,
        isDirty: false,
        changedFileCount: 0,
        changedFilesSample: [],
      },
      signals,
    },
    existingWorkflowInventory: inventory(signals),
    recommendedIntentOSWorkflowUse: recommendedWorkflowUse(classification),
    nativeMigrationRecommendation,
    whatToReuse: reuseList(signals, classification),
    whatToAdd: additionsFor(adapterMode, classification),
    whatNotToTouch: forbiddenTouchList(classification),
    conflictsOrDuplicates: conflictsFor(signals, classification),
    migrationAdapterPlan: adapterPlan(adapterMode, classification),
    humanDecisionsNeeded: humanDecisions(adapterMode, classification),
    boundary: {
      installsWorkflowAssets: "No",
      authorizesTargetProjectWrites: "No",
      changesCiOrHooks: "No",
      overwritesExistingGovernance: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: outcomeFor(adapterMode, classification),
  };
}

function collectSignals(root, pathSet) {
  const has = (rel) => pathSet.has(rel) || fs.existsSync(path.join(root, rel));
  const matching = (patterns) => pathsMatching(pathSet, patterns).slice(0, 12);
  const allPaths = Array.from(pathSet);

  return {
    hasProjectSignals: hasProjectSignals(root),
    agentRules: matching([
      /^AGENTS\.md$/i,
      /^agent\.md$/i,
      /^\.agent\.md$/i,
      /^\.codex(\/|$)/i,
      /^\.cursor(\/|$)/i,
      /^\.claude(\/|$)/i,
    ]),
    governanceDocs: matching([
      /^docs\/governance(\/|$)/i,
      /^docs\/baseline/i,
      /^docs\/baselines(\/|$)/i,
      /^docs\/risk/i,
      /^docs\/architecture/i,
      /^docs\/adr(\/|$)/i,
      /^docs\/contracts(\/|$)/i,
      /^docs\/evidence(\/|$)/i,
      /^docs\/sessions(\/|$)/i,
      /baseline.*\.md$/i,
      /governance.*\.md$/i,
    ]),
    workIntake: matching([
      /^requests(\/|$)/i,
      /^specs(\/|$)/i,
      /^tasks(\/|$)/i,
      /^issues(\/|$)/i,
      /^\.github\/ISSUE_TEMPLATE(\/|$)/i,
      /^\.github\/pull_request_template\.md$/i,
    ]),
    reviewEvidence: matching([
      /^review-packets(\/|$)/i,
      /^review-loop-reports(\/|$)/i,
      /^final-reports(\/|$)/i,
      /^evidence(\/|$)/i,
      /^docs\/evidence(\/|$)/i,
      /^docs\/sessions(\/|$)/i,
      /^releases(\/|$)/i,
    ]),
    ciGates: matching([
      /^\.github\/workflows(\/|$)/i,
      /^scripts\/guard(\/|$)/i,
      /^scripts\/check(\/|$)/i,
      /^scripts\/ci(\/|$)/i,
      /gate/i,
      /quality/i,
    ]),
    releaseRollback: matching([
      /^docs\/release(\/|$)/i,
      /^docs\/releases(\/|$)/i,
      /^docs\/runbooks(\/|$)/i,
      /^docs\/rollback/i,
      /^docs\/incident(\/|$)/i,
      /^infra\/prod/i,
      /^infra\/production/i,
      /^infra\/staging/i,
      /release/i,
      /rollback/i,
      /deploy/i,
    ]),
    hooksAutomation: matching([
      /^\.husky(\/|$)/i,
      /^\.pre-commit-config\.ya?ml$/i,
      /^hooks(\/|$)/i,
      /^scripts\/hooks(\/|$)/i,
      /pre-commit/i,
      /pre-push/i,
      /scheduled/i,
      /automation/i,
    ]),
    intentOSAssets: matching([
      /^\.intentos(\/|$)/i,
      /^workflow-adoption-maps(\/|$)/i,
      /^real-adoption-trials(\/|$)/i,
      /^governance-maps(\/|$)/i,
      /^patch-classifications(\/|$)/i,
    ]),
    productionSignals: allPaths.filter((item) => /\b(prod|production|release|deploy|rollback|incident|runbook|migration|backup|restore|staging)\b/i.test(item)).slice(0, 12),
  };
}

function emptySignals() {
  return {
    hasProjectSignals: false,
    agentRules: [],
    governanceDocs: [],
    workIntake: [],
    reviewEvidence: [],
    ciGates: [],
    releaseRollback: [],
    hooksAutomation: [],
    intentOSAssets: [],
    productionSignals: [],
  };
}

function pathsMatching(pathSet, patterns) {
  return Array.from(pathSet).filter((item) => patterns.some((pattern) => pattern.test(item))).sort();
}

function classify(root, exists, git, signals) {
  if (!exists) {
    return {
      projectState: "BLOCKED_UNKNOWN_RISK",
      reason: "Target path does not exist.",
      riskLevel: "medium",
      confidence: "high",
      dirtyWorktree: "Unknown",
      productionSensitive: "Unknown",
      governed: "Unknown",
    };
  }

  const isIntentOS = fs.existsSync(path.join(root, "intentos-manifest.json"))
    && fs.existsSync(path.join(root, "core", "workflow.md"));
  if (isIntentOS) {
    return {
      projectState: "DEV_KIT_REPOSITORY",
      reason: "The target is the IntentOS source repository.",
      riskLevel: "low",
      confidence: "high",
      dirtyWorktree: git?.isDirty ? "Yes" : "No",
      productionSensitive: "No",
      governed: "Yes",
    };
  }

  if (git?.isDirty) {
    return {
      projectState: "DIRTY_WORKTREE_PROJECT",
      reason: "Git worktree has existing changes; adoption must not mix with current user work.",
      riskLevel: "high",
      confidence: "high",
      dirtyWorktree: "Yes",
      productionSensitive: signals.productionSignals.length > 0 ? "Yes" : "Unknown",
      governed: hasGovernance(signals) ? "Yes" : "Unknown",
    };
  }

  if (signals.productionSignals.length > 0 || signals.releaseRollback.length > 0) {
    return {
      projectState: "EXISTING_PRODUCTION_PROJECT",
      reason: "Production, release, deploy, rollback, or incident signals were detected.",
      riskLevel: "high",
      confidence: "medium",
      dirtyWorktree: git?.isDirty ? "Yes" : "No",
      productionSensitive: "Yes",
      governed: hasGovernance(signals) ? "Yes" : "Unknown",
    };
  }

  if (hasGovernance(signals)) {
    return {
      projectState: "EXISTING_GOVERNED_PROJECT",
      reason: "Existing agent rules, governance docs, gates, or IntentOS assets were detected.",
      riskLevel: "medium-high",
      confidence: "medium",
      dirtyWorktree: git?.isDirty ? "Yes" : "No",
      productionSensitive: "Unknown",
      governed: "Yes",
    };
  }

  if (signals.hasProjectSignals) {
    return {
      projectState: "EXISTING_LIGHT_PROJECT",
      reason: "Project files exist, but strong governance signals were not detected.",
      riskLevel: "medium",
      confidence: "medium",
      dirtyWorktree: git?.isDirty ? "Yes" : "No",
      productionSensitive: "Unknown",
      governed: "No",
    };
  }

  return {
    projectState: "NEW_OR_EMPTY_PROJECT",
    reason: "No strong project signals were detected.",
    riskLevel: "low",
    confidence: "medium",
    dirtyWorktree: git?.isDirty ? "Yes" : "No",
    productionSensitive: "No",
    governed: "No",
  };
}

function hasGovernance(signals) {
  return signals.agentRules.length > 0
    || signals.governanceDocs.length > 0
    || signals.ciGates.length > 0
    || signals.intentOSAssets.length > 0
    || signals.reviewEvidence.length > 0;
}

function adapterModeFor(classification) {
  if (classification.projectState === "DEV_KIT_REPOSITORY") return "NOT_APPLICABLE";
  if (classification.projectState === "NEW_OR_EMPTY_PROJECT") return "NOT_APPLICABLE";
  if (classification.projectState === "BLOCKED_UNKNOWN_RISK") return "BLOCKED_NEEDS_OWNER";
  if (classification.projectState === "DIRTY_WORKTREE_PROJECT") return "BLOCKED_NEEDS_OWNER";
  if (classification.projectState === "EXISTING_PRODUCTION_PROJECT") return "READ_ONLY_MAP";
  if (classification.projectState === "EXISTING_GOVERNED_PROJECT") return "READ_ONLY_MAP";
  if (classification.projectState === "EXISTING_LIGHT_PROJECT") return "DOCS_ONLY_BRIDGE";
  return "READ_ONLY_MAP";
}

function choiceFor(adapterMode, classification) {
  if (adapterMode === "READ_ONLY_MAP") {
    return {
      choice: "A. Read-only map",
      canAiContinueNow: "limited",
      needFromHuman: "Confirm whether to keep this as guidance only or allow a later docs-only adapter.",
      ifNothing: "No project files are changed; Codex should keep using read-only mapping before task work.",
    };
  }
  if (adapterMode === "DOCS_ONLY_BRIDGE") {
    return {
      choice: "B. Docs-only bridge",
      canAiContinueNow: "limited",
      needFromHuman: "Confirm whether Codex may draft an adapter doc before writing it into the project.",
      ifNothing: "No project files are changed; Codex can still use this map as guidance.",
    };
  }
  if (adapterMode === "BLOCKED_NEEDS_OWNER") {
    return {
      choice: "D. Pause",
      canAiContinueNow: "no",
      needFromHuman: classification.projectState === "DIRTY_WORKTREE_PROJECT"
        ? "Confirm how to handle the dirty worktree before adoption or task execution."
        : "Confirm the project owner and safe adoption boundary.",
      ifNothing: "Codex should not write workflow assets or start implementation.",
    };
  }
  return {
    choice: "A. Read-only map",
    canAiContinueNow: "no",
    needFromHuman: "Confirm whether this target is an adoption target.",
    ifNothing: "No project files are changed.",
  };
}

function nativeMigrationFor(adapterMode, classification) {
  if (classification.projectState === "NEW_OR_EMPTY_PROJECT" || adapterMode === "NOT_APPLICABLE") {
    return {
      nextStep: "Use new-project bootstrap or baseline selection instead of existing-project native migration.",
      command: "node scripts/cli.mjs start <project>",
      posture: "FULL_MANAGED_INTENTOS_NATIVE",
      reason: "The target is not an old-project migration target.",
      writes: "No",
      approvalNeeded: "Yes before any target-project writes",
    };
  }
  if (adapterMode === "BLOCKED_NEEDS_OWNER") {
    return {
      nextStep: "Do not migrate yet; resolve owner, risk, or dirty worktree first.",
      command: "node scripts/cli.mjs native-migration <project>",
      posture: classification.projectState === "DIRTY_WORKTREE_PROJECT"
        ? "NATIVE_FIRST_PENDING_WORKTREE_REVIEW"
        : "BLOCKED_NEEDS_OWNER",
      reason: "Native migration planning can record the block, but cannot write target files.",
      writes: "No",
      approvalNeeded: "Yes before any target-project writes",
    };
  }
  if (classification.projectState === "EXISTING_PRODUCTION_PROJECT") {
    return {
      nextStep: "Generate a Native Migration Plan that preserves production and release authority.",
      command: "node scripts/cli.mjs native-migration <project>",
      posture: "PRODUCTION_SAFE_NATIVE_OVERLAY",
      reason: "IntentOS can become the planning workflow while production controls remain external.",
      writes: "No",
      approvalNeeded: "Yes before any governance replacement",
    };
  }
  if (classification.projectState === "EXISTING_GOVERNED_PROJECT") {
    return {
      nextStep: "Generate a Native Migration Plan and classify governance conflicts before any bridge apply.",
      command: "node scripts/cli.mjs native-migration <project>",
      posture: "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW",
      reason: "Existing governance should be classified rather than left in adapter-only limbo.",
      writes: "No",
      approvalNeeded: "Yes before any governance replacement",
    };
  }
  return {
    nextStep: "Generate a Native Migration Plan for a light existing project.",
    command: "node scripts/cli.mjs native-migration <project>",
    posture: "NATIVE_FIRST_MIGRATION",
    reason: "Light projects can use IntentOS-native planning after human confirmation.",
    writes: "No",
    approvalNeeded: "Yes before any target-project writes",
  };
}

function conclusionFor(classification, adapterMode) {
  if (adapterMode === "NOT_APPLICABLE") {
    return "Workflow adapter is not the right first step for this target.";
  }
  if (classification.projectState === "DIRTY_WORKTREE_PROJECT") {
    return "This map is diagnostic. This project has existing uncommitted work, so resolve the worktree boundary before any Native Migration Plan or adapter apply.";
  }
  if (classification.projectState === "EXISTING_PRODUCTION_PROJECT") {
    return "This map is diagnostic. If you want IntentOS to become the Codex workflow for this production-sensitive project, the next step is a Native Migration Plan that preserves production and release authority.";
  }
  if (classification.projectState === "EXISTING_GOVERNED_PROJECT") {
    return "This map is diagnostic. If you want IntentOS to become the Codex workflow for this governed project, the next step is a Native Migration Plan that classifies existing rules first.";
  }
  return "This map is diagnostic. If you want IntentOS to become the Codex workflow for this project, the next step is a Native Migration Plan. Adapter-only remains available when ownership, production, compliance, or project constraints block native migration.";
}

function inventory(signals) {
  return [
    row("Agent rules", signals.agentRules),
    row("Project docs", signals.governanceDocs),
    row("Work intake", signals.workIntake),
    row("Review / evidence", signals.reviewEvidence),
    row("CI / gates", signals.ciGates),
    row("Release / rollback", signals.releaseRollback),
    row("Hooks / automation", signals.hooksAutomation),
    row("IntentOS assets", signals.intentOSAssets),
  ];
}

function row(area, items) {
  return {
    area,
    assets: items.length > 0 ? items : [],
    coverage: items.length > 0 ? "Partial" : "Missing",
    handling: items.length > 0 ? "Keep / Map" : "Gap",
  };
}

function recommendedWorkflowUse(classification) {
  const nowForGoverned = classification.projectState === "EXISTING_GOVERNED_PROJECT"
    || classification.projectState === "EXISTING_PRODUCTION_PROJECT"
    || classification.projectState === "DIRTY_WORKTREE_PROJECT";
  return [
    workflowUse("New request or feature", "Request / Spec / Task Card", nowForGoverned ? "Yes" : "Later", "Use only after adapter boundary is clear.", "Yes"),
    workflowUse("Risk or baseline choice", "Baseline Decision Card", "Yes", "Use before changing baseline, platform, or risk scope.", "Yes"),
    workflowUse("Existing governance mapping", "Workflow Adoption Map", "Yes", "Use as the first old-project routing artifact.", "No"),
    workflowUse("IntentOS adoption for old projects", "Native Migration Plan", "Yes", "Use after workflow-map when the user asks to adopt or configure IntentOS.", "Yes"),
    workflowUse("Actual file-change boundary", "Change Boundary Report", "Yes", "Use before multi-file changes or when scope may drift.", "Yes"),
    workflowUse("Complex repair", "Patch Classification", "Yes", "Use before non-trivial fixes, hardcuts, or remediation.", "Yes"),
    workflowUse("Completion review", "Review Loop", "Yes", "Use after task completion, not after every small edit.", "No"),
    workflowUse("Delivery / handoff", "Safe Launch / Launch Readiness", "Later", "Use when demo, handoff, staging, or release is claimed.", "Yes"),
    workflowUse("Scope drift", "Conversation Turn / Scope Change Report", "Yes", "Use when the user switches tasks or asks a new direction.", "No"),
    workflowUse("Context correction", "Context Governance", "Yes", "Use when Codex detects stale or wrong context.", "No"),
    workflowUse("Interrupted or long-running work", "Work queue / pause report when available", "Later", "Recommended later; do not invent hidden continuation.", "Yes"),
    workflowUse("Stale or conflicting docs", "Doc lifecycle report when available", "Later", "Recommended later; do not delete docs by default.", "Yes"),
    workflowUse("Hook / CI changes", "Hook orchestration plan when available", "Later", "Recommended later; never install hooks from this map.", "Yes"),
  ];
}

function workflowUse(situation, workflow, useNow, howToConnect, humanDecisionNeeded) {
  return { situation, workflow, useNow, howToConnect, humanDecisionNeeded };
}

function reuseList(signals, classification) {
  const items = [];
  if (signals.agentRules.length > 0) items.push(`Existing agent rules: ${signals.agentRules.join(", ")}`);
  if (signals.governanceDocs.length > 0) items.push(`Existing governance docs: ${signals.governanceDocs.slice(0, 5).join(", ")}`);
  if (signals.ciGates.length > 0) items.push(`Existing CI / gates: ${signals.ciGates.slice(0, 5).join(", ")}`);
  if (signals.releaseRollback.length > 0) items.push(`Existing release / rollback process: ${signals.releaseRollback.slice(0, 5).join(", ")}`);
  if (signals.reviewEvidence.length > 0) items.push(`Existing review / evidence process: ${signals.reviewEvidence.slice(0, 5).join(", ")}`);
  if (items.length === 0) items.push("No strong workflow authority detected; keep project files unchanged until the human confirms adoption intent.");
  if (classification.projectState === "EXISTING_PRODUCTION_PROJECT") {
    items.push("Production or release process stays authoritative; IntentOS can only map to it.");
  }
  return items;
}

function additionsFor(adapterMode) {
  if (adapterMode === "READ_ONLY_MAP") {
    return [
      addition("Workflow Adoption Map report", "Record how IntentOS should route future work.", "No", "No", "Recommended"),
      addition("Native Migration Plan", "Move from adapter mapping into IntentOS-native planning after the user asks to adopt.", "No", "Yes", "Recommended"),
      addition("Docs-only bridge", "Optional shared adapter document after review.", "Docs only", "Yes", "Later"),
    ];
  }
  if (adapterMode === "DOCS_ONLY_BRIDGE") {
    return [
      addition("Workflow Adoption Map report", "Record current workflow and routing.", "No", "No", "Recommended"),
      addition("Native Migration Plan", "Classify old rules and plan IntentOS-native adoption.", "No", "Yes", "Recommended"),
      addition("Docs-only bridge", "Add an approved adapter doc without changing gates or code.", "Docs only", "Yes", "Candidate"),
    ];
  }
  return [
    addition("Workflow Adoption Map report", "Record safe boundary only.", "No", "No", "Recommended"),
    addition("Native Migration Plan", "Record blocked native migration posture without writing target files.", "No", "Yes", "Later"),
  ];
}

function addition(name, why, writes, approvalNeeded, status) {
  return { name, why, writes, approvalNeeded, status };
}

function forbiddenTouchList(classification) {
  const base = [
    "Existing agent rules unless separately approved.",
    "Existing PR templates, CI workflows, hooks, and release gates unless separately approved.",
    "Business code, production config, data, migrations, secrets, permissions, payment, finance, tax, HR, security, privacy, or compliance surfaces.",
    "Release evidence, audit evidence, historical session records, and signed-off reports.",
  ];
  if (classification.projectState === "DIRTY_WORKTREE_PROJECT") {
    base.unshift("Current uncommitted user work.");
  }
  return base;
}

function conflictsFor(signals) {
  const conflicts = [];
  if (signals.agentRules.length > 0) {
    conflicts.push(conflict("Agent rules", "IntentOS AGENTS/governance appendix", "possible", "Keep existing authority; add adapter only after owner approval."));
  }
  if (signals.ciGates.length > 0) {
    conflicts.push(conflict("CI / gates", "IntentOS workflow checks", "possible", "Map first; do not add blocking gates from this report."));
  }
  if (signals.hooksAutomation.length > 0) {
    conflicts.push(conflict("Hooks / automation", "future hook orchestration", "possible", "Plan-only; do not install hooks."));
  }
  if (signals.releaseRollback.length > 0) {
    conflicts.push(conflict("Release / rollback", "Safe Launch / Launch Readiness", "possible", "Use launch readiness as evidence wrapper, not release approval."));
  }
  if (conflicts.length === 0) {
    conflicts.push(conflict("No strong duplicate detected", "IntentOS workflow", "none", "Keep read-only until adoption intent is confirmed."));
  }
  return conflicts;
}

function conflict(existingAsset, overlap, conflictLevel, handling) {
  return { existingAsset, overlap, conflict: conflictLevel, recommendedHandling: handling };
}

function adapterPlan(adapterMode, classification) {
  const steps = [
    planStep(1, "Keep existing workflow authoritative", "No", "No", "PROPOSED"),
    planStep(2, "Use workflow-map before recommending old-project writes", "No", "No", "PROPOSED"),
    planStep(3, "If user wants IntentOS adoption, generate Native Migration Plan", "No", "Yes", "PROPOSED"),
  ];
  if (adapterMode === "DOCS_ONLY_BRIDGE") {
    steps.push(planStep(4, "Draft docs-only bridge after review", "Docs only", "Yes", "PENDING"));
  } else if (adapterMode === "READ_ONLY_MAP") {
    steps.push(planStep(4, "Prepare docs-only bridge only if approved later", "Docs only", "Yes", "PENDING"));
  } else if (classification.projectState === "DIRTY_WORKTREE_PROJECT") {
    steps.push(planStep(4, "Resolve dirty worktree boundary before adoption", "No", "Yes", "BLOCKED"));
  }
  return steps;
}

function planStep(step, action, writesTargetFiles, requiresHumanApproval, status) {
  return { step, action, writesTargetFiles, requiresHumanApproval, status };
}

function humanDecisions(adapterMode, classification) {
  return [
    decision("Adapter mode", "READ_ONLY_MAP / DOCS_ONLY_BRIDGE / THIN_OPERATIONAL_BRIDGE / BLOCKED_NEEDS_OWNER", adapterMode, "human", adapterMode === "BLOCKED_NEEDS_OWNER" ? "NEEDED_NOW" : "PENDING"),
    decision("Write scope", "none / docs-only / approved assets", "none", "human", "PENDING"),
    decision("Public evidence", "LOCAL_ONLY / SANITIZED_APPROVED / PUBLIC_APPROVED", "LOCAL_ONLY", "human", "PENDING"),
    ...(classification.projectState === "DIRTY_WORKTREE_PROJECT"
      ? [decision("Dirty worktree handling", "commit / stash / ignore with explicit scope / stop", "stop", "human", "NEEDED_NOW")]
      : []),
  ];
}

function decision(name, options, recommended, owner, status) {
  return { name, options, recommended, owner, status };
}

function outcomeFor(adapterMode) {
  if (adapterMode === "BLOCKED_NEEDS_OWNER") return "BLOCKED";
  if (adapterMode === "NOT_APPLICABLE") return "NEEDS_HUMAN_DECISION";
  return "WORKFLOW_MAP_RECORDED";
}

function printHuman(report) {
  console.log("# Workflow Adoption Map Recommendation");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${report.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${report.humanDecisionSummary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${report.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${report.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${report.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Existing Project Signals");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Project state | ${report.classification.projectState} |`);
  console.log(`| Adapter mode | ${report.adapterMode} |`);
  console.log(`| Reason | ${report.classification.reason} |`);
  console.log(`| Confidence | ${report.classification.confidence} |`);
  console.log(`| Dirty worktree | ${report.classification.dirtyWorktree} |`);
  console.log(`| Production-sensitive signals | ${report.classification.productionSensitive} |`);
  console.log(`| Existing governance signals | ${report.classification.governed} |`);
  console.log("| Target writes authorized by this report | No |");
  console.log("");
  console.log("## Existing Workflow Inventory");
  console.log("");
  console.log("| Area | Existing asset / signal | Coverage | Keep / Map / Gap |");
  console.log("|---|---|---|---|");
  for (const item of report.existingWorkflowInventory) {
    console.log(`| ${item.area} | ${item.assets.length ? item.assets.join("<br>") : "none detected"} | ${item.coverage} | ${item.handling} |`);
  }
  console.log("");
  console.log("## Recommended IntentOS Workflow Use");
  console.log("");
  console.log("| Situation | Recommended workflow | Use now? | How to connect | Human decision needed |");
  console.log("|---|---|---|---|---|");
  for (const item of report.recommendedIntentOSWorkflowUse) {
    console.log(`| ${item.situation} | ${item.workflow} | ${item.useNow} | ${item.howToConnect} | ${item.humanDecisionNeeded} |`);
  }
  console.log("");
  console.log("## Native Migration Recommendation");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Next step | ${report.nativeMigrationRecommendation.nextStep} |`);
  console.log(`| Command | \`${report.nativeMigrationRecommendation.command}\` |`);
  console.log(`| Posture | \`${report.nativeMigrationRecommendation.posture}\` |`);
  console.log(`| Reason | ${report.nativeMigrationRecommendation.reason} |`);
  console.log(`| Writes target files? | ${report.nativeMigrationRecommendation.writes} |`);
  console.log(`| Approval needed | ${report.nativeMigrationRecommendation.approvalNeeded} |`);
  console.log("");
  console.log("## What To Reuse");
  console.log("");
  for (const item of report.whatToReuse) console.log(`- ${item}`);
  console.log("");
  console.log("## What To Add");
  console.log("");
  console.log("| Proposed addition | Why | Writes? | Approval needed | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of report.whatToAdd) {
    console.log(`| ${item.name} | ${item.why} | ${item.writes} | ${item.approvalNeeded} | ${item.status} |`);
  }
  console.log("");
  console.log("## What Not To Touch");
  console.log("");
  for (const item of report.whatNotToTouch) console.log(`- ${item}`);
  console.log("");
  console.log("## Conflicts / Duplicates");
  console.log("");
  console.log("| Existing asset | Potential IntentOS overlap | Conflict | Recommended handling |");
  console.log("|---|---|---|---|");
  for (const item of report.conflictsOrDuplicates) {
    console.log(`| ${item.existingAsset} | ${item.overlap} | ${item.conflict} | ${item.recommendedHandling} |`);
  }
  console.log("");
  console.log("## Migration / Adapter Plan");
  console.log("");
  console.log("| Step | Action | Writes target files? | Requires human approval | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of report.migrationAdapterPlan) {
    console.log(`| ${item.step} | ${item.action} | ${item.writesTargetFiles} | ${item.requiresHumanApproval} | ${item.status} |`);
  }
  console.log("");
  console.log("## Human Decisions Needed");
  console.log("");
  console.log("| Decision | Options | Recommended | Owner | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of report.humanDecisionsNeeded) {
    console.log(`| ${item.name} | ${item.options} | ${item.recommended} | ${item.owner} | ${item.status} |`);
  }
  console.log("");
  console.log("## Boundary");
  console.log("");
  console.log("- This report installs workflow assets: No");
  console.log("- This report authorizes target-project writes: No");
  console.log("- This report changes CI or hooks: No");
  console.log("- This report overwrites existing governance: No");
  console.log("- This report approves implementation: No");
  console.log("- This report approves release or production: No");
  console.log("- This report approves security, privacy, compliance, payment, finance, tax, HR, migration, permission, or data decisions: No");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}
