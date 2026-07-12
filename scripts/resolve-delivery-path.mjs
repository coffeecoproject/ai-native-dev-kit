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
const knownFlags = new Set(["json", "format", "mode", "intent"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const userMode = String(args.mode || "plain").toLowerCase();
const intent = String(args.intent || "").trim();
const allowedFormats = new Set(["human", "json"]);
const allowedModes = new Set(["plain", "developer", "maintainer"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!allowedFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

if (!allowedModes.has(userMode)) {
  console.error(`FAIL unknown --mode: ${userMode}`);
  process.exit(1);
}

const report = buildDeliveryPathReport(projectRoot, userMode, intent);

if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildDeliveryPathReport(root, mode, userIntent) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const pathSet = new Set(paths);
  const signals = collectSignals(root, exists, pathSet, userIntent);
  const project = classifyProject(root, exists, git, signals);
  const delivery = classifyDeliveryPath(project, signals);
  const decisions = userDecisionsFor(project, signals, delivery);

  return {
    reportType: "DELIVERY_PATH_REPORT",
    generatedBy: "scripts/resolve-delivery-path.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    userMode: mode,
    intent: userIntent || "Not provided",
    humanDecisionSummary: {
      conclusion: `Current delivery path state is ${delivery.currentState}.`,
      recommendedChoice: delivery.recommendedChoice,
      canAiContinueNow: delivery.canAiContinueNow,
      needFromHuman: decisions.length > 0 ? decisions.join(" / ") : "No decision needed for read-only delivery-path reporting.",
      ifNothing: "No files are changed. No CI, hook, task state, implementation, release, or production behavior is changed.",
    },
    projectReading: {
      projectState: project.state,
      existingUsersAssumed: project.existingUsersAssumed,
      riskLevel: project.riskLevel,
      dirtyWorktree: project.dirty,
      reason: project.reason,
    },
    deliveryPathState: {
      currentState: delivery.currentState,
      nextTargetState: delivery.nextTargetState,
      canMoveNow: delivery.canMoveNow,
    },
    distanceToUsefulUse: delivery.distance,
    stateEvidence: stateEvidence(signals, delivery),
    blockers: delivery.blockers,
    nextSafeAction: delivery.nextSafeAction,
    userDecisions: decisions,
    boundaries: {
      writesTargetFiles: "No",
      changesCiOrHooks: "No",
      changesTaskState: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      replacesSafeLaunch: "No",
      provesRealUsersCanUseProduct: "No",
    },
    outcome: delivery.outcome,
  };
}

function collectSignals(root, exists, pathSet, userIntent) {
  const paths = [...pathSet];
  const joined = paths.join("\n");
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  const allText = `${joined}\n${JSON.stringify(packageJson || {})}\n${userIntent || ""}`;
  const has = (rel) => pathSet.has(rel) || fs.existsSync(path.join(root, rel));
  const hasPrefix = (prefix) => paths.some((item) => item === prefix || item.startsWith(`${prefix}/`));
  const scriptNames = Object.keys(scripts);
  const scriptText = scriptNames.join(" ");

  return {
    exists,
    pathCount: paths.length,
    hasProjectSignals: exists ? hasProjectSignals(root) : false,
    isEmptyish: exists && paths.filter((item) => !item.startsWith(".git/")).length <= 3,
    isIntentOS: has("intentos-manifest.json") && hasPrefix("core"),
    hasIntentOSAssets: hasPrefix(".intentos") || hasPrefix("workflow-guidance-cards") || hasPrefix("delivery-path-reports"),
    hasGovernance: ["AGENTS.md", "agent.md", ".agent.md"].some(has) || hasPrefix("docs") || hasPrefix(".github/workflows") || hasPrefix("scripts/guard"),
    hasPackage: Boolean(packageJson),
    hasBuildScript: /\b(build|compile|typecheck)\b/i.test(scriptText),
    hasTestScript: /\b(test|e2e|check|lint)\b/i.test(scriptText),
    hasDevScript: /\b(dev|start|serve)\b/i.test(scriptText),
    hasLaunchReadiness: hasPrefix("launch-readiness") || has("docs/safe-launch.md") || hasPrefix("release-evidence") || hasPrefix("releases"),
    hasInternalTrialEvidence: hasPrefix("adoption-trial-reports") || hasPrefix("customer-handoffs") || hasPrefix("final-reports"),
    hasRiskSignals: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release)\b/i.test(allText),
    hasReleaseSignals: /\b(prod|production|deploy|deployment|release|rollback|staging|incident|runbook|ci|workflow|github\/workflows)\b/i.test(allText),
    hasDirtySignal: false,
  };
}

function classifyProject(root, exists, git, signals) {
  if (!exists) {
    return {
      state: "MISSING_PROJECT",
      reason: "Target path does not exist.",
      riskLevel: "unknown",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Unknown",
    };
  }

  if (signals.isIntentOS) {
    return {
      state: "INTENTOS_REPOSITORY",
      reason: "This is the IntentOS source repository.",
      riskLevel: git?.isDirty ? "medium" : "low",
      existingUsersAssumed: "No",
      dirty: git?.isDirty ? "Yes" : "No",
    };
  }

  if (git?.isDirty) {
    return {
      state: "DIRTY_WORKTREE_PROJECT",
      reason: "Project has unfinished changes.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Yes",
    };
  }

  if (signals.isEmptyish || !signals.hasProjectSignals) {
    return {
      state: "IDEA_OR_EMPTY_PROJECT",
      reason: "No strong project structure was detected.",
      riskLevel: "low",
      existingUsersAssumed: "No",
      dirty: "No",
    };
  }

  if (signals.hasReleaseSignals || signals.hasRiskSignals) {
    return {
      state: "PRODUCTION_SENSITIVE_PROJECT",
      reason: "Release, data, login, payment, migration, or other risk signals were detected.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  if (signals.hasGovernance || signals.hasIntentOSAssets) {
    return {
      state: "EXISTING_GOVERNED_PROJECT",
      reason: "Existing docs, rules, CI, or IntentOS assets were detected.",
      riskLevel: "medium",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  return {
    state: "EXISTING_LIGHT_PROJECT",
    reason: "A project exists, but strong governance signals were not detected.",
    riskLevel: "medium",
    existingUsersAssumed: "Unknown treated as Yes",
    dirty: "No",
  };
}

function classifyDeliveryPath(project, signals) {
  if (project.state === "MISSING_PROJECT") {
    return delivery({
      currentState: "NEEDS_PROJECT_READING",
      nextTargetState: "READY_FOR_PLAN",
      canMoveNow: "No",
      canAiContinueNow: "no",
      outcome: "BLOCKED",
      nextSafeAction: "Confirm the project path or describe the idea before planning.",
      blockers: ["Project path is missing or unreadable."],
      distance: ["Project cannot be read yet.", "A plan cannot be trusted until the target is confirmed."],
      recommendedChoice: "A - Confirm the project path",
    });
  }

  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return delivery({
      currentState: "BLOCKED_BY_DIRTY_WORK",
      nextTargetState: "READY_FOR_PLAN",
      canMoveNow: "No",
      canAiContinueNow: "limited",
      outcome: "NEEDS_HUMAN_DECISION",
      nextSafeAction: "Review existing changes and choose continue, pause, split, or defer before new execution.",
      blockers: ["Dirty worktree must be classified before new work."],
      distance: ["Current work is not isolated.", "A new plan may mix unrelated changes."],
      recommendedChoice: "B - Review existing changes first",
    });
  }

  if (project.riskLevel === "high") {
    return delivery({
      currentState: "BLOCKED_BY_RISK",
      nextTargetState: "READY_FOR_PLAN",
      canMoveNow: "Limited",
      canAiContinueNow: "limited",
      outcome: "NEEDS_HUMAN_DECISION",
      nextSafeAction: "Confirm risk boundaries, then prepare a read-only plan with review surfaces.",
      blockers: ["Risk signals require human confirmation before execution."],
      distance: ["Risk boundaries are not confirmed.", "The project may need Safe Launch before trial or release."],
      recommendedChoice: "B - Confirm risk boundary before execution",
    });
  }

  if (project.state === "IDEA_OR_EMPTY_PROJECT") {
    return delivery({
      currentState: "IDEA_ONLY",
      nextTargetState: "READY_FOR_PLAN",
      canMoveNow: "Yes",
      canAiContinueNow: "limited",
      outcome: "DELIVERY_PATH_RECORDED",
      nextSafeAction: "Create the smallest useful plan before code or setup.",
      blockers: [],
      distance: ["A usable slice is not defined yet.", "Local build, self-test, and trial evidence do not exist yet."],
      recommendedChoice: "A - Define the smallest useful slice",
    });
  }

  if (!signals.hasBuildScript && !signals.hasDevScript) {
    return delivery({
      currentState: "READY_FOR_PLAN",
      nextTargetState: "READY_FOR_LOCAL_BUILD",
      canMoveNow: "Yes",
      canAiContinueNow: "limited",
      outcome: "DELIVERY_PATH_RECORDED",
      nextSafeAction: "Prepare a scoped plan and define the local build/run evidence.",
      blockers: [],
      distance: ["A local build/run path is not confirmed.", "Self-test and trial evidence are still missing."],
      recommendedChoice: "A - Prepare a small plan and local build path",
    });
  }

  if (!signals.hasTestScript) {
    return delivery({
      currentState: "READY_FOR_LOCAL_BUILD",
      nextTargetState: "READY_FOR_SELF_TEST",
      canMoveNow: "Yes",
      canAiContinueNow: "limited",
      outcome: "DELIVERY_PATH_RECORDED",
      nextSafeAction: "Run or define local build evidence, then prepare a self-test checklist.",
      blockers: [],
      distance: ["Local build/run is discoverable.", "Self-test evidence is not confirmed."],
      recommendedChoice: "A - Move toward self-test evidence",
    });
  }

  if (!signals.hasInternalTrialEvidence) {
    return delivery({
      currentState: "READY_FOR_SELF_TEST",
      nextTargetState: "READY_FOR_INTERNAL_TRIAL",
      canMoveNow: "Yes",
      canAiContinueNow: "limited",
      outcome: "DELIVERY_PATH_RECORDED",
      nextSafeAction: "Complete focused self-test evidence before any internal trial claim.",
      blockers: [],
      distance: ["Build/test scripts are discoverable.", "Internal trial evidence is not present."],
      recommendedChoice: "A - Finish self-test evidence first",
    });
  }

  if (!signals.hasLaunchReadiness) {
    return delivery({
      currentState: "READY_FOR_INTERNAL_TRIAL",
      nextTargetState: "READY_FOR_RELEASE_REVIEW",
      canMoveNow: "Limited",
      canAiContinueNow: "limited",
      outcome: "DELIVERY_PATH_RECORDED",
      nextSafeAction: "Prepare release-readiness evidence before release review.",
      blockers: ["Safe Launch evidence is not present."],
      distance: ["Internal trial evidence is present.", "Release review evidence is still missing."],
      recommendedChoice: "B - Prepare release-readiness evidence",
    });
  }

  return delivery({
    currentState: "READY_FOR_RELEASE_REVIEW",
    nextTargetState: "N/A",
    canMoveNow: "Limited",
    canAiContinueNow: "limited",
    outcome: "DELIVERY_PATH_RECORDED",
    nextSafeAction: "Run Safe Launch / release readiness before any release or production claim.",
    blockers: ["Release approval still requires Safe Launch and human acceptance."],
    distance: ["Release-readiness assets are discoverable.", "This report still does not approve release."],
    recommendedChoice: "B - Enter Safe Launch review",
  });
}

function delivery(value) {
  return value;
}

function stateEvidence(signals, deliveryPath) {
  return [
    evidence("Project readable", signals.exists ? "pass" : "fail", signals.exists ? "Target path exists." : "Target path missing."),
    evidence("Local build/run path", signals.hasBuildScript || signals.hasDevScript ? "pass" : "not verified", signals.hasBuildScript || signals.hasDevScript ? "Build/dev script detected." : "No build/dev script detected."),
    evidence("Self-test path", signals.hasTestScript ? "pass" : "not verified", signals.hasTestScript ? "Test/check script detected." : "No test/check script detected."),
    evidence("Internal trial path", signals.hasInternalTrialEvidence ? "pass" : "not verified", signals.hasInternalTrialEvidence ? "Trial or handoff evidence detected." : "No internal trial evidence detected."),
    evidence("Release review path", deliveryPath.currentState === "READY_FOR_RELEASE_REVIEW" ? "pass" : "not verified", deliveryPath.currentState === "READY_FOR_RELEASE_REVIEW" ? "Release readiness assets detected." : "Safe Launch evidence still required before release claims."),
  ];
}

function evidence(name, status, notes) {
  return { evidence: name, status, notes };
}

function userDecisionsFor(project, signals, deliveryPath) {
  const decisions = [];
  if (project.existingUsersAssumed !== "No") decisions.push("Confirm whether real users or real data are involved.");
  if (project.riskLevel === "high" || signals.hasRiskSignals) decisions.push("Confirm risk boundary before implementation.");
  if (deliveryPath.currentState === "IDEA_ONLY") decisions.push("Confirm the smallest useful slice.");
  if (deliveryPath.currentState === "BLOCKED_BY_DIRTY_WORK") decisions.push("Confirm whether to continue, pause, split, or defer current changes.");
  if (decisions.length === 0) decisions.push("Confirm whether Codex may prepare the next small plan.");
  return decisions.slice(0, project.riskLevel === "high" ? 5 : 3);
}

function printHuman(report) {
  console.log("# Delivery Path Report");
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
  console.log("## Project Reading");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Project state | ${escapeCell(report.projectReading.projectState)} |`);
  console.log(`| Existing users assumed | ${escapeCell(report.projectReading.existingUsersAssumed)} |`);
  console.log(`| Risk level | ${escapeCell(report.projectReading.riskLevel)} |`);
  console.log(`| Dirty worktree | ${escapeCell(report.projectReading.dirtyWorktree)} |`);
  console.log(`| Reason | ${escapeCell(report.projectReading.reason)} |`);
  console.log("");
  console.log("## Delivery Path State");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Current state | \`${report.deliveryPathState.currentState}\` |`);
  console.log(`| Next target state | \`${report.deliveryPathState.nextTargetState}\` |`);
  console.log(`| Can move now? | ${report.deliveryPathState.canMoveNow} |`);
  console.log("");
  console.log("## Distance To Useful Use");
  console.log("");
  for (const [index, item] of report.distanceToUsefulUse.entries()) {
    console.log(`${index + 1}. ${item}`);
  }
  console.log("");
  console.log("## State Evidence");
  console.log("");
  console.log("| Evidence | Status | Notes |");
  console.log("|---|---|---|");
  for (const item of report.stateEvidence) {
    console.log(`| ${escapeCell(item.evidence)} | ${escapeCell(item.status)} | ${escapeCell(item.notes)} |`);
  }
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (report.blockers.length === 0) {
    console.log("| Blocker | Owner | Required decision or evidence |");
    console.log("|---|---|---|");
    console.log("| none | N/A | N/A |");
  } else {
    console.log("| Blocker | Owner | Required decision or evidence |");
    console.log("|---|---|---|");
    for (const item of report.blockers) {
      console.log(`| ${escapeCell(item)} | human / Codex | confirm before continuing |`);
    }
  }
  console.log("");
  console.log("## Next Safe Action");
  console.log("");
  console.log(report.nextSafeAction);
  console.log("");
  console.log("## User Decisions");
  console.log("");
  for (const [index, item] of report.userDecisions.entries()) {
    console.log(`${index + 1}. ${item}`);
  }
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This report writes target files: ${report.boundaries.writesTargetFiles}`);
  console.log(`- This report changes CI or hooks: ${report.boundaries.changesCiOrHooks}`);
  console.log(`- This report changes task state: ${report.boundaries.changesTaskState}`);
  console.log(`- This report approves implementation: ${report.boundaries.approvesImplementation}`);
  console.log(`- This report approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This report replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log(`- This report proves real users can use the product: ${report.boundaries.provesRealUsersCanUseProduct}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
