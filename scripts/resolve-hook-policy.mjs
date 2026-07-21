#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  defaultIgnoredDirs,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human, --format json, or --json.");
  process.exit(1);
}

const policy = buildPolicy(projectRoot);
if (outputFormat === "json") console.log(JSON.stringify(policy, null, 2));
else printHuman(policy);

function buildPolicy(root) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: new Set([...defaultIgnoredDirs].filter((item) => item !== ".git")),
  }) : [];
  const inventory = exists ? hookPolicyInventory(root, paths) : emptyInventory();
  const state = policyStateFor(exists, inventory);
  const allowedHookClasses = allowedClasses();
  const approvalMatrix = approvals();
  const rollbackDisablePolicy = rollbackPolicy();

  return {
    reportType: "PROJECT_HOOK_POLICY",
    generatedBy: "scripts/resolve-hook-policy.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: summaryFor(exists, state, inventory),
    policyState: state,
    existingHookSources: existingHookSources(inventory),
    allowedHookClasses,
    approvalMatrix,
    rollbackDisablePolicy,
    forbiddenAutomaticActions: forbiddenActions(),
    relationshipToHookOrchestration: [
      "Hook Orchestration proposes candidate hooks.",
      "Project Hook Policy defines what this project allows.",
      "This policy does not replace Hook Orchestration.",
      "A Hook Orchestration Plan is still required before any hook installation task.",
    ],
    humanDecisionsNeeded: decisionsFor(state, inventory),
    boundaries: {
      installsHooks: "No",
      modifiesCi: "No",
      addsBlockingGates: "No",
      callsExternalApis: "No",
      storesTokensOrSecrets: "No",
      enablesAutoFix: "No",
      treatsHookOutputAsHumanApproval: "No",
      approvesImplementationReleaseOrProduction: "No",
      replacesHookOrchestration: "No",
    },
    outcome: outcomeFor(state),
  };
}

function hookPolicyInventory(root, paths) {
  const packageJson = readJson(path.join(root, "package.json"));
  const packageScripts = Object.entries(packageJson?.scripts || {}).map(([name, command]) => ({ name, command }));
  const ciWorkflows = paths.filter((item) => /^\.github\/workflows\/.+\.(ya?ml)$/i.test(item));
  const hookPolicies = [
    ...paths.filter((item) => /^hook-policies\/.+\.md$/i.test(item)),
    ...paths.filter((item) => /^docs\/.*hook.*policy.*\.md$/i.test(item)),
  ];
  const gitHooks = gitHookFiles(root);
  const hookTooling = [];
  if (fs.existsSync(path.join(root, ".husky"))) hookTooling.push(".husky");
  if (fs.existsSync(path.join(root, "lefthook.yml")) || fs.existsSync(path.join(root, "lefthook.yaml"))) hookTooling.push("lefthook");
  if (fs.existsSync(path.join(root, ".pre-commit-config.yaml"))) hookTooling.push("pre-commit");
  if (packageJson?.["lint-staged"]) hookTooling.push("lint-staged");
  if (packageJson?.devDependencies?.husky || packageJson?.dependencies?.husky) hookTooling.push("husky package");
  const scheduledWorkflows = ciWorkflows.filter((file) => /schedule:/i.test(readFile(path.join(root, file))));
  const externalAutomationSignals = [
    ...ciWorkflows.filter((file) => /(openai|gpt|webhook|curl|api[_-]?key|secret)/i.test(readFile(path.join(root, file)))),
    ...packageScripts.filter((item) => /(openai|gpt|webhook|curl|api[_-]?key|secret)/i.test(`${item.name} ${item.command}`)).map((item) => `package:${item.name}`),
  ];

  return {
    hookPolicies,
    gitHooks,
    ciWorkflows,
    packageScripts,
    hookTooling,
    scheduledWorkflows,
    externalAutomationSignals,
    summary: {
      hookPoliciesDetected: hookPolicies.length,
      gitHooksDetected: gitHooks.length,
      ciWorkflowsDetected: ciWorkflows.length,
      packageScriptCount: packageScripts.length,
      hookToolingDetected: hookTooling.length,
      scheduledWorkflowsDetected: scheduledWorkflows.length,
      externalAutomationSignalsDetected: externalAutomationSignals.length,
    },
  };
}

function emptyInventory() {
  return {
    hookPolicies: [],
    gitHooks: [],
    ciWorkflows: [],
    packageScripts: [],
    hookTooling: [],
    scheduledWorkflows: [],
    externalAutomationSignals: [],
    summary: {
      hookPoliciesDetected: 0,
      gitHooksDetected: 0,
      ciWorkflowsDetected: 0,
      packageScriptCount: 0,
      hookToolingDetected: 0,
      scheduledWorkflowsDetected: 0,
      externalAutomationSignalsDetected: 0,
    },
  };
}

function policyStateFor(exists, inventory) {
  if (!exists) {
    return state("BLOCKED", "Target path does not exist.", "No", "none", "none");
  }
  if (inventory.externalAutomationSignals.length > 0) {
    return state("BLOCKED_BY_EXISTING_HOOK_RISK", "External, secret-like, or API automation signals require strict internal evidence review before any change.", "No", "high risk", firstOrNone(inventory.hookPolicies));
  }
  if (inventory.hookPolicies.length > 0) {
    return state("GOVERNED_POLICY_PRESENT", "A hook policy or equivalent governance document already exists.", "No", "needs mapping", firstOrNone(inventory.hookPolicies));
  }
  if (inventory.gitHooks.length > 0 || inventory.ciWorkflows.length > 0 || inventory.hookTooling.length > 0 || inventory.scheduledWorkflows.length > 0) {
    return state("POLICY_REVIEW_REQUIRED", "Existing hook, CI, tooling, or schedule signals should be reviewed before hook work.", "No", "needs review", "none");
  }
  return state("NO_POLICY_FOUND", "No hook policy or hook automation signals were found.", "No", "none", "none");
}

function state(policyState, why, canInstallHooksNow, existingHookRisk, existingPolicyRef) {
  return {
    policyState,
    canInstallHooksNow,
    existingHookRisk,
    existingPolicyRef,
    why,
  };
}

function allowedClasses() {
  return [
    {
      class: "H0_AUTO_READ_ONLY",
      defaultPolicy: "Allowed",
      allowedAutomaticBehavior: "Read-only local checks and recommendations",
      approvalNeeded: "Not required",
    },
    {
      class: "H1_AUTO_SUGGESTION",
      defaultPolicy: "Allowed",
      allowedAutomaticBehavior: "Generate plans, prompts, reports, and suggestions",
      approvalNeeded: "Not required for suggestion",
    },
    {
      class: "H2_REQUIRES_CONFIRMATION",
      defaultPolicy: "Compatibility label",
      allowedAutomaticBehavior: "Non-blocking hook installation or project-file change",
      approvalNeeded: "Controlled apply",
    },
    {
      class: "H3_EXPLICIT_APPROVAL_REQUIRED",
      defaultPolicy: "Compatibility label",
      allowedAutomaticBehavior: "Blocking, CI-changing, external, release, production, token, or auto-fix hook",
      approvalNeeded: "Strict review; exact consent only for a prepared external effect",
    },
  ];
}

function approvals() {
  return [
    {
      hookClass: "H0_AUTO_READ_ONLY",
      approvalOwner: "Codex may run read-only",
      minimumEvidence: "Command output or report",
      defaultIfUnclear: "Allow read-only only",
    },
    {
      hookClass: "H1_AUTO_SUGGESTION",
      approvalOwner: "Codex may suggest",
      minimumEvidence: "Plan or recommendation",
      defaultIfUnclear: "Suggest only",
    },
    {
      hookClass: "H2_REQUIRES_CONFIRMATION",
      approvalOwner: "IntentOS evidence authority",
      minimumEvidence: "Reviewed plan and rollback path",
      defaultIfUnclear: "Defer",
    },
    {
      hookClass: "H3_EXPLICIT_APPROVAL_REQUIRED",
      approvalOwner: "IntentOS evidence authority plus bounded consent when external",
      minimumEvidence: "Strict review, rollback path, evidence, external-effect identity, expiry",
      defaultIfUnclear: "Stop",
    },
  ];
}

function rollbackPolicy() {
  return [
    {
      hookClass: "H2_REQUIRES_CONFIRMATION",
      disablePath: "Remove hook/config through controlled rollback",
      restoreCommandOrFile: "Restore previous config from git diff or backup",
      owner: "IntentOS execution responsibility",
      evidenceNeeded: "Diff, command output, rollback note",
    },
    {
      hookClass: "H3_EXPLICIT_APPROVAL_REQUIRED",
      disablePath: "Disable gate/API/schedule before merge or release",
      restoreCommandOrFile: "Restore CI/release/secrets config from authority-bound rollback plan",
      owner: "IntentOS execution responsibility",
      evidenceNeeded: "Evidence authority, bounded consent when external, rollback evidence, expiry",
    },
  ];
}

function forbiddenActions() {
  return {
    installGitHooksAutomatically: "No",
    modifyCiAutomatically: "No",
    addBlockingGatesAutomatically: "No",
    callExternalApisAutomatically: "No",
    storeTokensOrSecretsAutomatically: "No",
    enableAutoFixAutomatically: "No",
    treatHookOutputAsHumanApproval: "No",
  };
}

function existingHookSources(inventory) {
  const rows = [];
  rows.push(...inventory.hookPolicies.map((file) => source("Existing policy", file, "project policy", "map instead of replace")));
  rows.push(...inventory.gitHooks.map((file) => source("Local Git hook", file, "existing hook file", "review before changes")));
  rows.push(...inventory.hookTooling.map((tool) => source("Hook tooling", tool, "tooling signal", "review before changes")));
  rows.push(...inventory.ciWorkflows.map((file) => source("CI workflow", file, "existing workflow", workflowRisk(file, inventory))));
  rows.push(...inventory.packageScripts
    .filter((item) => /verify|lint|test|prepare|pre|hook|husky|lefthook|commit|push/i.test(`${item.name} ${item.command}`))
    .slice(0, 12)
    .map((item) => source("Package script", item.name, item.command, "manual or policy-reviewed use only")));
  if (rows.length === 0) rows.push(source("None", "none", "none detected", "no hook work authorized"));
  return rows;
}

function source(sourceType, pathOrName, currentRole, riskNote) {
  return { source: sourceType, pathOrName, currentRole, riskNote };
}

function workflowRisk(file, inventory) {
  if (inventory.scheduledWorkflows.includes(file)) return "scheduled workflow requires review";
  if (inventory.externalAutomationSignals.includes(file)) return "external/API-like automation signal requires review";
  return "review before changes";
}

function decisionsFor(policyState, inventory) {
  const decisions = [];
  if (policyState.policyState === "BLOCKED") {
    decisions.push(decision("Target path", "provide valid path / stop", "provide valid path", "external project fact", "EXTERNAL_FACT_NEEDED"));
  } else if (policyState.policyState === "GOVERNED_POLICY_PRESENT") {
    decisions.push(decision("Existing hook policy", "map / reconcile / stop", "map and reconcile", "Codex", "NO_USER_ACTION"));
  } else if (policyState.policyState === "BLOCKED_BY_EXISTING_HOOK_RISK") {
    decisions.push(decision("Existing hook risk", "inspect / isolate / stop", "inspect and isolate", "Codex", "NO_USER_ACTION"));
  } else if (inventory.ciWorkflows.length > 0 || inventory.hookTooling.length > 0 || inventory.gitHooks.length > 0) {
    decisions.push(decision("H2/H3 hook work", "reconcile / defer / block", "reconcile through controlled plan", "Codex", "NO_USER_ACTION"));
  } else {
    decisions.push(decision("Record hook policy", "record / defer", "record", "Codex", "NO_USER_ACTION"));
  }
  decisions.push(decision("Prepared H2 action", "controlled apply / defer / block", "controlled review", "IntentOS/Codex", "NO_USER_ACTION"));
  decisions.push(decision("Prepared H3 external effect", "consent / decline", "stop until exact effect is ready", "current conversation user", "REAL_WORLD_CONSENT_NEEDED_LATER"));
  return decisions;
}

function decision(name, options, recommended, owner, status) {
  return { decision: name, options, recommended, owner, status };
}

function outcomeFor(policyState) {
  if (policyState.policyState === "BLOCKED" || policyState.policyState === "BLOCKED_BY_EXISTING_HOOK_RISK") return "BLOCKED";
  return "HOOK_POLICY_RECORDED";
}

function summaryFor(exists, policyState, inventory) {
  if (!exists) {
    return {
      conclusion: "Target path does not exist.",
      recommendedChoice: "stop",
      canAiContinueNow: "no",
      needFromHuman: "Provide a valid project path.",
      ifNothing: "No hooks are installed, no CI is changed, and no blocking gates are added.",
    };
  }
  return {
    conclusion: `${policyState.policyState}: ${policyState.why}`,
    recommendedChoice: policyState.policyState === "BLOCKED_BY_EXISTING_HOOK_RISK" ? "keep writes blocked and complete strict evidence review" : "record policy and continue internal planning",
    canAiContinueNow: "yes for read-only analysis and controlled planning",
    needFromHuman: "No technical decision. Ask only for an unavailable business/external fact or consent to an exact prepared external effect.",
    ifNothing: "No hooks are installed, no CI is changed, and no blocking gates are added.",
    signals: inventory.summary,
  };
}

function printHuman(report) {
  console.log("# Project Hook Policy");
  console.log("");
  printHumanDecisionSummary(report.humanDecisionSummary);
  printPolicyState(report.policyState);
  printExistingSources(report.existingHookSources);
  printAllowedClasses(report.allowedHookClasses);
  printApprovalMatrix(report.approvalMatrix);
  printRollbackPolicy(report.rollbackDisablePolicy);
  printForbiddenActions();
  printRelationship(report.relationshipToHookOrchestration);
  printDecisions(report.humanDecisionsNeeded);
  printBoundary(report.boundaries);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printHumanDecisionSummary(summary) {
  console.log("## User Input Summary");
  console.log("");
  console.log(`Conclusion: ${summary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${summary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${summary.canAiContinueNow}`);
  console.log("");
  console.log(`User input boundary: ${summary.needFromHuman}`);
  console.log("");
  console.log(`If nothing is decided: ${summary.ifNothing}`);
}

function printPolicyState(policyState) {
  console.log("");
  console.log("## Policy State");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Policy state | \`${policyState.policyState}\` |`);
  console.log(`| Can install hooks now? | ${policyState.canInstallHooksNow} |`);
  console.log(`| Existing hook risk | ${policyState.existingHookRisk} |`);
  console.log(`| Existing policy ref | ${policyState.existingPolicyRef} |`);
}

function printExistingSources(sources) {
  console.log("");
  console.log("## Existing Hook Sources");
  console.log("");
  console.log("| Source | Path / name | Current role | Risk note |");
  console.log("|---|---|---|---|");
  for (const row of sources) {
    console.log(`| ${row.source} | ${row.pathOrName} | ${row.currentRole} | ${row.riskNote} |`);
  }
}

function printAllowedClasses(classes) {
  console.log("");
  console.log("## Allowed Hook Classes");
  console.log("");
  console.log("| Class | Default policy | Allowed automatic behavior | Approval needed |");
  console.log("|---|---|---|---|");
  for (const item of classes) {
    console.log(`| \`${item.class}\` | ${item.defaultPolicy} | ${item.allowedAutomaticBehavior} | ${item.approvalNeeded} |`);
  }
}

function printApprovalMatrix(approvals) {
  console.log("");
  console.log("## Approval Matrix");
  console.log("");
  console.log("| Hook class | Approval owner | Minimum evidence | Default if unclear |");
  console.log("|---|---|---|---|");
  for (const item of approvals) {
    console.log(`| \`${item.hookClass}\` | ${item.approvalOwner} | ${item.minimumEvidence} | ${item.defaultIfUnclear} |`);
  }
}

function printRollbackPolicy(items) {
  console.log("");
  console.log("## Rollback / Disable Policy");
  console.log("");
  console.log("| Hook class | Disable path | Restore command or file | Owner | Evidence needed |");
  console.log("|---|---|---|---|---|");
  for (const item of items) {
    console.log(`| \`${item.hookClass}\` | ${item.disablePath} | ${item.restoreCommandOrFile} | ${item.owner} | ${item.evidenceNeeded} |`);
  }
}

function printForbiddenActions() {
  console.log("");
  console.log("## Forbidden Automatic Actions");
  console.log("");
  console.log("- Install Git hooks automatically: No");
  console.log("- Modify CI automatically: No");
  console.log("- Add blocking gates automatically: No");
  console.log("- Call external APIs automatically: No");
  console.log("- Store tokens or secrets automatically: No");
  console.log("- Enable auto-fix automatically: No");
  console.log("- Treat hook output as human approval: No");
}

function printRelationship(items) {
  console.log("");
  console.log("## Relationship To Hook Orchestration");
  console.log("");
  for (const item of items) console.log(`- ${item}`);
}

function printDecisions(decisions) {
  console.log("");
  console.log("## Bounded User Input Needed");
  console.log("");
  console.log("| Decision | Options | Recommended default | Owner | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of decisions) {
    console.log(`| ${item.decision} | ${item.options} | ${item.recommended} | ${item.owner} | ${item.status} |`);
  }
}

function printBoundary(boundary) {
  console.log("");
  console.log("## Boundary");
  console.log("");
  console.log(`- This policy installs hooks: ${boundary.installsHooks}`);
  console.log(`- This policy modifies CI: ${boundary.modifiesCi}`);
  console.log(`- This policy adds blocking gates: ${boundary.addsBlockingGates}`);
  console.log(`- This policy calls external APIs: ${boundary.callsExternalApis}`);
  console.log(`- This policy stores tokens or secrets: ${boundary.storesTokensOrSecrets}`);
  console.log(`- This policy enables auto-fix: ${boundary.enablesAutoFix}`);
  console.log(`- This policy treats hook output as human approval: ${boundary.treatsHookOutputAsHumanApproval}`);
  console.log(`- This policy approves implementation, release, or production: ${boundary.approvesImplementationReleaseOrProduction}`);
  console.log(`- This policy replaces Hook Orchestration: ${boundary.replacesHookOrchestration}`);
}

function gitHookFiles(root) {
  const dir = path.join(root, ".git", "hooks");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => !/\.sample$/i.test(file))
    .map((file) => `.git/hooks/${file}`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function firstOrNone(values) {
  return values[0] || "none";
}
