
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "../lib/manifest.mjs";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateSchema } from "../lib/artifact-schema.mjs";
import {
  controlledApplyImpactFlags,
  formatActionId,
  initExecutableActions,
  isWorkflowActivationState,
  validateVerifiedApplyReceiptFile,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
  validateReadinessPlanReview,
} from "../lib/adoption-apply-chain.mjs";
import { isGovernedWorkflowOutputPath, projectIdentity } from "../lib/evidence-authority.mjs";
import {
  createBootstrapTransaction,
  executeBootstrapTransaction,
  recoverInterruptedBootstrap,
} from "../lib/bootstrap-transaction.mjs";
import {
  beginControlledApplyJournal,
  commitControlledApplyAction,
  completeControlledApplyJournal,
  markControlledApplyActionApplied,
  markControlledApplyMutationComplete,
  markControlledApplyRollbackIncomplete,
  prepareControlledApplyAction,
  recoverInterruptedControlledApply,
  rollbackControlledApply,
  writeControlledApplyReceipt,
} from "../lib/controlled-apply-transaction.mjs";
import {
  resolveBehavioralAdoptionActivation,
  validateBehavioralActivation,
  verifyProjectLocalBehavioralRoute,
} from "../lib/behavioral-adoption-activation.mjs";
import {
  consumeRequestBoundApplyAuthority,
  createRequestBoundApplyAuthority,
  createRequestBoundReadiness,
  evaluateRequestBoundApplyPreflight,
  isRequestBoundLocalActionAllowed,
  requestBoundAuthorityConsumptionState,
  requestBoundSupportPaths,
  validateCurrentRequestForPlan,
  validateRequestBoundApplyAuthority,
  validateRequestBoundLocalActionGraph,
  validateRequestBoundReadiness,
} from "../lib/request-bound-apply-authority.mjs";
import { resolveProjectEntryTrust, requireTrustedProjectEntry } from "../lib/project-entry-trust.mjs";
import { projectGoalProjection } from "../lib/project-fact-projection.mjs";
import { inspectTargetTopology } from "../lib/target-topology.mjs";
import {
  normalizeBaselineLevel,
  parseSelectionIds,
  renderBaselineEvidence,
  renderBaselineSelection,
  renderEnvironmentBaseline,
  renderProjectProfile,
  resolveBaselineConfiguration,
} from "../lib/baseline-selection.mjs";
import {
  assertInsideRoot,
  assertNoSymlinkInPath,
  assertSafeNameSegment,
  assertSafeRelativePath,
  assertSafeWritePath,
  resolveBackupRoot,
  resolveUnderRoot,
} from "../lib/path-safety.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..", "..");
const currentIntentOSVersion = readCurrentVersion();
const baselineLevelRank = new Map([
  ["BL0_LIGHTWEIGHT", 0],
  ["BL1_STANDARD", 1],
  ["BL2_INDUSTRIAL", 2],
]);
const validateControlledApplyReceipt = ({ projectRoot, receiptPath }) => validateVerifiedApplyReceiptFile(
  projectRoot,
  receiptPath,
  { schemasRoot: kitRoot },
);
const requiredPullRequestTemplateMarkers = [
  "Human Summary",
  "Bootstrap state",
  "Beginner Entry",
  "Workflow Guidance",
  "Delivery Path",
  "Debt / Knowledge Handoff",
  "Document Archive Apply",
  "Unified Apply Plan",
  "Apply Execution Receipt",
  "Release Approval Record",
  "Controlled Apply Readiness",
  "Hook Policy",
  "Project onboarding",
  "Engineering baseline",
  "Workflow Evidence",
  "Workflow artifact quality",
  "Review Surface",
  "Review Packet / Review Loop Report",
  "Subagent Run Plan",
  "Safe Launch",
  "Conversation Drift",
  "Next-Step Suggestions",
  "Skill / Automation Governance",
  "irreversible operation",
];
const requiredAgentGovernanceMarkers = [
  "Mission",
  "Zero-Experience Solo Developer",
  "Core Rules",
  "Bootstrap Entry",
  "Beginner Entry",
  "Natural Language Workflow Guidance",
  "Delivery Path Governance",
  "Debt & Knowledge Handoff",
  "Document Archive Apply",
  "Unified Apply Plan",
  "Apply Execution Receipt",
  "Release Approval Record",
  "Controlled Apply Readiness",
  "Project Hook Policy",
  "Project Onboarding",
  "Engineering Baseline",
  "Environment Baseline",
  "Platform Baseline",
  "Industrial Baseline",
  "Product Baseline And Claim Control",
  "Standard Baseline Packs",
  "Baseline Pack System",
  "Workflow Artifact Generation",
  "Review Surface Governance",
  "Review Loop",
  "Goal Mode",
  "Subagent Orchestration",
  "Safe Launch",
  "Conversation Drift",
  "Bounded Next-Step",
  "Output Experience",
  "Task Execution Rules",
  "High-risk Boundaries",
  "Skill Governance",
  "Automation Governance",
  "Final Report",
];

function readCurrentVersion() {
  const versionPath = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "VERSION.md");
  if (!fs.existsSync(versionPath)) return "0.0.0";
  const content = fs.readFileSync(versionPath, "utf8");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : "0.0.0";
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item.startsWith("--")) {
      const key = item.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    }
  }
  return args;
}

function backupFileIfNeeded(filePath, options = {}) {
  if (!options.backupDir || !options.targetPath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return;
  const backupRoot = resolveBackupRoot(options.targetPath, options.backupDir);
  const relativePath = path.relative(options.targetPath, filePath);
  if (relativePath.startsWith("..")) return;
  const backupPath = path.join(backupRoot, relativePath);
  assertInsideRoot(options.targetPath, backupPath, "backup file");
  assertNoSymlinkInPath(options.targetPath, backupPath, "backup file");
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`backed up ${path.relative(process.cwd(), filePath)} to ${path.relative(process.cwd(), backupPath)}`);
  }
}

function copyDir(src, dest, options = {}) {
  const { overwrite = false } = options;
  if (!fs.existsSync(src)) {
    throw new Error(`Starter not found: ${src}`);
  }
  if (options.targetPath) {
    assertInsideRoot(options.targetPath, dest, "copy directory destination");
    assertNoSymlinkInPath(options.targetPath, dest, "copy directory destination");
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (isIgnorableNewProjectEntry(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, options);
    } else if (fs.existsSync(destPath) && !overwrite) {
      console.log(`skip existing ${path.relative(process.cwd(), destPath)}`);
    } else {
      copyFile(srcPath, destPath, options);
    }
  }
}

function copyFile(src, dest, options = {}) {
  const { overwrite = false } = options;
  if (options.targetPath) {
    assertInsideRoot(options.targetPath, dest, "copy file destination");
    assertNoSymlinkInPath(options.targetPath, dest, "copy file destination");
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest) && !overwrite) {
    console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
    return;
  }
  const existed = fs.existsSync(dest);
  if (existed && overwrite) backupFileIfNeeded(dest, options);
  fs.copyFileSync(src, dest);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), dest)}`);
}

function readExistingStarter(targetPath) {
  const versionPath = path.join(targetPath, ".intentos", "version.json");
  if (!fs.existsSync(versionPath)) return null;
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    return typeof version.starter === "string" && version.starter
      ? assertSafeNameSegment(version.starter, "existing starter")
      : null;
  } catch {
    return null;
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

function parseIndustrialPackIds(value) {
  return parseSelectionIds(value);
}

function selectedListFromProjectDoc(targetPath, fileName, heading) {
  const file = path.join(targetPath, "docs", fileName);
  if (!fs.existsSync(file)) return [];
  const body = markdownSectionBody(fs.readFileSync(file, "utf8"), heading);
  return [...new Set(body.split("\n")
    .map((line) => line.match(/^\s*-\s+([a-z0-9][a-z0-9-]*)\s*$/i)?.[1])
    .filter((value) => value && !/^(?:none|n-a|na|pending|tbd|todo)$/i.test(value)))].sort();
}

function selectedBaselineLevelFromProject(targetPath) {
  const file = path.join(targetPath, "docs", "baseline-selection.md");
  if (!fs.existsSync(file)) return null;
  const body = markdownSectionBody(fs.readFileSync(file, "utf8"), "Baseline Level");
  const token = body.match(/\bBL[0-2](?:_(?:LIGHTWEIGHT|STANDARD|INDUSTRIAL))?\b/i)?.[0];
  return normalizeBaselineLevel(token);
}

function baselineConfigurationForPlan(targetPath, options = {}) {
  if (options.withIndustrialPacks) {
    throw new Error("Full industrial-pack installation is not supported; select only concrete risk-justified industrial pack IDs");
  }
  const existingProject = fs.existsSync(targetPath)
    && fs.statSync(targetPath).isDirectory()
    && fs.readdirSync(targetPath).some((entry) => !isIgnorableNewProjectEntry(entry));
  const profiles = parseSelectionIds(options.profiles).length > 0
    ? options.profiles
    : selectedListFromProjectDoc(targetPath, "project-profile.md", "Selected Profiles").join(",");
  const standardPacks = parseSelectionIds(options.standardPacks).length > 0
    ? options.standardPacks
    : selectedListFromProjectDoc(targetPath, "baseline-selection.md", "Selected Standard Packs").join(",");
  const industrialPacks = parseSelectionIds(options.industrialPacks).length > 0
    ? options.industrialPacks
    : selectedIndustrialPackIdsFromProject(targetPath).join(",");
  const existingProjectWithoutProfileEvidence = existingProject && !profiles;
  const selectionOptions = {
    starter: existingProjectWithoutProfileEvidence ? "" : options.starter,
    goal: options.goal,
    profiles,
    projectRoot: targetPath,
    existingProject,
  };
  const derived = resolveBaselineConfiguration(kitRoot, {
    ...selectionOptions,
    baselineLevel: options.baselineLevel || undefined,
    ...(normalizeBaselineLevel(options.baselineLevel) === "BL2_INDUSTRIAL"
      ? { standardPacks, industrialPacks }
      : {}),
  });
  const existingLevel = selectedBaselineLevelFromProject(targetPath);
  const targetLevel = options.baselineLevel
    ? derived.baselineLevel
    : highestBaselineLevel(existingLevel, derived.baselineLevel);
  const config = resolveBaselineConfiguration(kitRoot, {
    ...selectionOptions,
    baselineLevel: targetLevel,
    standardPacks,
    industrialPacks,
  });
  config.reconciliation = baselineReconciliation(targetPath, config);
  assertExistingBaselineConfigurationCompatible(targetPath, config);
  return config;
}

function highestBaselineLevel(left, right) {
  const normalizedLeft = normalizeBaselineLevel(left);
  const normalizedRight = normalizeBaselineLevel(right);
  if (!normalizedLeft) return normalizedRight;
  if (!normalizedRight) return normalizedLeft;
  return baselineLevelRank.get(normalizedLeft) >= baselineLevelRank.get(normalizedRight)
    ? normalizedLeft
    : normalizedRight;
}

function baselineReconciliation(targetPath, config) {
  const current = {
    baselineLevel: selectedBaselineLevelFromProject(targetPath),
    profiles: selectedListFromProjectDoc(targetPath, "project-profile.md", "Selected Profiles"),
    standardPacks: selectedListFromProjectDoc(targetPath, "baseline-selection.md", "Selected Standard Packs"),
    industrialPacks: selectedListFromProjectDoc(targetPath, "baseline-selection.md", "Selected Industrial Packs"),
  };
  const target = {
    baselineLevel: config.baselineLevel,
    profiles: config.profiles,
    standardPacks: config.standardPacks,
    industrialPacks: config.industrialPacks,
  };
  const changed = ["baselineLevel", "profiles", "standardPacks", "industrialPacks"]
    .some((key) => JSON.stringify(current[key]) !== JSON.stringify(target[key]));
  return {
    current,
    target,
    required: Boolean(current.baselineLevel && changed),
    levelChange: current.baselineLevel && current.baselineLevel !== target.baselineLevel
      ? `${current.baselineLevel}_TO_${target.baselineLevel}`
      : "UNCHANGED",
  };
}

function assertExistingBaselineConfigurationCompatible(targetPath, config) {
  if (!config.configured) return;
  const profileFile = path.join(targetPath, "docs", "project-profile.md");
  const selectionFile = path.join(targetPath, "docs", "baseline-selection.md");
  const profileValues = selectedListFromProjectDoc(targetPath, "project-profile.md", "Selected Profiles");
  if (fs.existsSync(profileFile) && profileValues.length === 0) {
    throw new Error("Existing project profile is incomplete; use existing-rule reconciliation and a selected gap plan instead of replacing the document");
  }
  if (profileValues.length > 0 && JSON.stringify(profileValues) !== JSON.stringify(config.profiles)) {
    throw new Error("Existing project profile conflicts with the requested profile selection; run existing-rule reconciliation before changing it");
  }
  const level = selectedBaselineLevelFromProject(targetPath);
  if (fs.existsSync(selectionFile) && !level) {
    throw new Error("Existing baseline selection is incomplete; use existing-rule reconciliation and a selected gap plan instead of replacing the document");
  }
  if (level && baselineLevelRank.get(config.baselineLevel) < baselineLevelRank.get(level)) {
    throw new Error(`Existing baseline level ${level} cannot be downgraded to ${config.baselineLevel}; preserve the stronger project baseline`);
  }
  const selectionProfiles = selectedListFromProjectDoc(targetPath, "baseline-selection.md", "Selected Profiles");
  if (fs.existsSync(selectionFile) && JSON.stringify(selectionProfiles) !== JSON.stringify(config.profiles)) {
    throw new Error("Existing baseline selected profiles are incomplete or conflicting; run existing-rule reconciliation before changing them");
  }
  for (const [heading, expected] of [
    ["Selected Standard Packs", config.standardPacks],
    ["Selected Industrial Packs", config.industrialPacks],
  ]) {
    const actual = selectedListFromProjectDoc(targetPath, "baseline-selection.md", heading);
    const removed = actual.filter((item) => !expected.includes(item));
    if (fs.existsSync(selectionFile) && removed.length > 0) {
      throw new Error(`Existing ${heading.toLowerCase()} would be removed by the requested selection (${removed.join(", ")}); preserve project facts and reconcile the conflict first`);
    }
  }
}

function markdownSectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"));
  if (!match) return "";
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd);
}

function selectedIndustrialPackIdsFromProject(targetPath) {
  const selectionPath = path.join(targetPath, "docs", "baseline-selection.md");
  if (!fs.existsSync(selectionPath)) return [];
  const content = fs.readFileSync(selectionPath, "utf8");
  const body = markdownSectionBody(content, "Selected Industrial Packs");
  if (!body) return [];
  return [...new Set([...body.matchAll(/\b[a-z0-9][a-z0-9-]*-industrial\b/gi)]
    .map((item) => item[0]))].sort();
}

function installedIndustrialPackIds(targetPath, sourceIndex) {
  const destRoot = path.join(targetPath, ".intentos", "industrial-packs");
  if (!fs.existsSync(destRoot) || !sourceIndex?.packs) return [];
  return sourceIndex.packs
    .filter((entry) => entry?.status !== "planned" && entry.path && fs.existsSync(path.join(destRoot, entry.path, "pack.json")))
    .map((entry) => entry.id)
    .filter(Boolean)
    .sort();
}

function resolvePullRequestTemplateSource(starter) {
  const starterTemplate = path.join(kitRoot, "starters", starter, ".github", "pull_request_template.md");
  if (fs.existsSync(starterTemplate)) return starterTemplate;
  return path.join(kitRoot, "platforms", "github", "pull_request_template.md");
}

function pullRequestTemplateGovernanceAppendix() {
  return [
    "",
    "## Human Summary",
    "",
    "Explain the change, current status, risk, and next safe step in plain language.",
    "",
    "## Workflow Evidence",
    "",
    "- [ ] Workflow Guidance was used or marked not applicable when the request started from a broad goal, project path/repository, or next-step question",
    "- [ ] Beginner Entry was used or marked not applicable when the user gave a one-sentence goal or did not know which workflow command to choose",
    "- [ ] Delivery Path was recorded or marked not applicable when claiming local-use, self-test, internal-trial, release-review, or blocked status",
    "- [ ] Debt / Knowledge Handoff is recorded or marked not applicable when work is interrupted, paused, leaves known debt, or needs a reliable next-run handoff",
    "- [ ] Document Archive Apply Plan is linked or marked not applicable when archive suggestions are ready to become an execution plan",
      "- [ ] Unified Apply Plan is linked or marked not applicable before applying workflow assets, baseline docs, AGENTS/PR template governance, archive actions, hooks, CI, industrial packs, or other target-project writes",
    "- [ ] Apply Execution Receipt is linked after any controlled IntentOS init/update apply, or marked not applicable when no target writes occurred",
    "- [ ] Release Approval Record is linked and strictly checked before any real release handoff or assisted execution state",
    "- [ ] Controlled Apply Readiness is linked or marked not applicable after a Unified Apply Plan is reviewed and before Codex performs any controlled apply step permitted by the bounded plan and project authority",
    "- [ ] Project Hook Policy is linked or marked not applicable before any hook installation, CI hook change, blocking gate, scheduled job, external reviewer hook, token use, or auto-fix hook is proposed",
    "- [ ] Bootstrap state was checked with `workflow-next` when workflow assets or project setup changed",
    "- [ ] Project onboarding is confirmed or not applicable for this change",
    "- [ ] Engineering baseline was checked when this change touched structure, contracts, schema, permissions, migrations, dependencies, or cross-module state",
    "- [ ] Environment baseline was checked when this change touched build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts",
    "- [ ] Goal Card is linked or marked not applicable when route selection was ambiguous, high-risk, or multi-step",
    "- [ ] Subagent Run Plan is linked or marked not applicable when helper agents were used",
    "- [ ] Request / preflight / spec / eval / task links are included or marked not applicable",
    "- [ ] Workflow artifact quality check passed or is not applicable",
    "- [ ] Review Surface Card is linked or marked not applicable before non-trivial implementation, repair, or review work",
    "- [ ] Review surface close-out includes per-surface result, unverified surfaces, debt result, and next delivery state",
    "- [ ] Review Packet / Review Loop Report is linked when independent review or review loop was needed, or marked not applicable",
    "- [ ] Safe Launch / Delivery Readiness was checked when demo, handoff, release-review, blocked, or not-ready status is claimed",
    "- [ ] Conversation Drift was checked when user messages changed scope, added a new task, asked for discussion-only handling, raised a risk decision, or paused work",
    "- [ ] AI task log is written for L1/L2/L3 work or marked not applicable",
    "- [ ] Verification evidence is included",
    "- [ ] Workflow daily summary impact is reviewed when workflow assets changed",
    "",
    "## Next-Step Suggestions",
    "",
    "Use `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`. Only `IN_SCOPE_NEXT_STEP` may be handled inside this PR when no new approval is needed.",
    "",
    "| ID | Type | Suggestion | Relation to this PR | Can AI do now? | Required entry | Risk / approval |",
    "|---|---|---|---|---|---|---|",
    "|  |  |  |  | Yes / No | current PR / new request / follow-up proposal / human decision / do not proceed |  |",
    "",
    "## Skill / Automation Governance",
    "",
    "- [ ] No active Skill was created, updated, installed, enabled, or run without explicit approval",
    "- [ ] Skill candidates are proposals only and were reviewed when changed",
    "- [ ] No automation was created, updated, resumed, deleted, or enabled without explicit approval",
    "- [ ] Automation proposals are project-scoped and reviewed when changed",
    "",
    "## Additional Risk Marker",
    "",
    "- [ ] irreversible operation",
    "",
  ].join("\n");
}

function pullRequestTemplateMigrationReportPath(targetPath) {
  return path.join(targetPath, ".intentos", "migration-reports", "pr-template-governance.md");
}

function agentsGovernanceMigrationReportPath(targetPath) {
  return path.join(targetPath, ".intentos", "migration-reports", "agents-governance.md");
}

function migrationControlSummary({ status, targetLabel, applyCommand }) {
  const pending = status === "PENDING_CONTROLLED_APPLY" || status === "PENDING_HUMAN_APPROVAL";
  const recommended = pending
    ? "Codex reconciles project authority, prepares a bounded apply plan, and verifies rollback before writing"
    : "Keep the resolved project state";
  const canWrite = pending ? "no" : "not needed";
  const userInput = pending
    ? "No technical choice is required. Codex asks only if a missing business fact or a concrete real-world effect requires consent."
    : `No user input is needed for ${targetLabel} at this status.`;
  return [
    "## Controlled Migration Summary",
    "",
    `Conclusion: ${targetLabel} governance migration status is ${status}.`,
    "",
    `Codex recommendation: ${recommended}.`,
    "",
    "Can Codex continue assessment and planning now: yes",
    "",
    `Can Codex write ${targetLabel} now: ${canWrite}`,
    "",
    `User input: ${userInput}`,
    "",
    "Codex must preserve stronger project rules, classify conflicts, limit the target set, prepare rollback, pass plan review and controlled readiness, and verify the resulting file before using the internal apply command:",
    "",
    `\`${applyCommand}\``,
    "",
    "This command is an internal execution mechanism, not a technical decision for the user. A pending report keeps the target unchanged and blocks a full-adoption claim.",
    "",
  ];
}

function writePullRequestTemplateMigrationReport(targetPath, missingMarkers, options = {}) {
  const status = options.status || (options.applied ? "APPLIED" : "PENDING_CONTROLLED_APPLY");
  const reportPath = pullRequestTemplateMigrationReportPath(targetPath);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const existed = fs.existsSync(reportPath);
  const statusNotes = {
    PENDING_CONTROLLED_APPLY: "The PR template was left unchanged. Codex must reconcile authority and pass bounded apply readiness before applying it.",
    PENDING_HUMAN_APPROVAL: "Compatibility status from an older report. Treat it as PENDING_CONTROLLED_APPLY; do not ask the user for a technical decision.",
    APPLIED: "The proposed appendix was applied through the controlled migration path.",
    RESOLVED_MANUALLY: "The PR template already contains all required governance markers. No script change to the PR template was needed.",
  };
  const reasonLines = status === "RESOLVED_MANUALLY"
    ? [
        "The project PR template now contains all required IntentOS workflow governance markers.",
        "",
        "A previous pending migration report was resolved after the template was updated manually or by another approved process.",
      ]
    : [
        "The project already has a pull request template, but it is missing IntentOS workflow governance markers.",
        "",
        "The update command does not modify an existing project PR template until Codex proves project-authority reconciliation, bounded scope, rollback, and controlled apply readiness.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_CONTROLLED_APPLY" || status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After Codex completes rule reconciliation, plan review, rollback preparation, and controlled apply readiness, it may run:",
        "",
        "```bash",
        "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-pr-template-governance",
        "```",
      ]
    : ["No apply command is needed for this report status."];
  const content = [
    "# Migration Report: PR Template Governance",
    "",
    `Status: ${status}`,
    `IntentOS version: ${currentIntentOSVersion}`,
    "",
    ...migrationControlSummary({
      status,
      targetLabel: "PR template",
      applyCommand: "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-pr-template-governance",
    }),
    "## Status Notes",
    "",
    statusNotes[status] || statusNotes.PENDING_CONTROLLED_APPLY,
    "",
    "## Target",
    "",
    "`.github/pull_request_template.md`",
    "",
    "## Reason",
    "",
    ...reasonLines,
    "",
    "## Missing Markers",
    "",
    ...missingMarkerLines,
    "",
    "## Proposed Appendix",
    "",
    "```md",
    pullRequestTemplateGovernanceAppendix().trim(),
    "```",
    "",
    "## Apply",
    "",
    ...applyLines,
    "",
    "Do not apply this migration if the project uses a centrally managed pull request template and governance must be added elsewhere.",
    "",
  ].join("\n");
  backupFileIfNeeded(reportPath, { ...options, targetPath });
  fs.writeFileSync(reportPath, content);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), reportPath)}`);
}

function ensurePullRequestTemplate(targetPath, starter, options = {}) {
  const { applyPrTemplateGovernance = false } = options;
  const dest = path.join(targetPath, ".github", "pull_request_template.md");
  const source = resolvePullRequestTemplateSource(starter);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(source, dest);
    console.log(`created ${path.relative(process.cwd(), dest)}`);
    return;
  }

  const content = fs.readFileSync(dest, "utf8");
  const missingMarkers = requiredPullRequestTemplateMarkers.filter((marker) => !content.includes(marker));
  if (missingMarkers.length === 0) {
    const reportPath = pullRequestTemplateMigrationReportPath(targetPath);
    if (fs.existsSync(reportPath)) {
      const report = fs.readFileSync(reportPath, "utf8");
      if (report.includes("PENDING_HUMAN_APPROVAL") || report.includes("PENDING_CONTROLLED_APPLY")) {
        writePullRequestTemplateMigrationReport(targetPath, [], { ...options, status: "RESOLVED_MANUALLY" });
      }
    }
    console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
    return;
  }

  if (!applyPrTemplateGovernance) {
    writePullRequestTemplateMigrationReport(targetPath, missingMarkers, options);
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .intentos/migration-reports/pr-template-governance.md`);
    return;
  }

  backupFileIfNeeded(dest, { ...options, targetPath });
  fs.appendFileSync(dest, `${content.endsWith("\n") ? "" : "\n"}${pullRequestTemplateGovernanceAppendix()}`);
  writePullRequestTemplateMigrationReport(targetPath, missingMarkers, { ...options, applied: true });
  console.log(`updated ${path.relative(process.cwd(), dest)} with IntentOS workflow governance appendix through controlled apply`);
}

function agentGovernanceSectionContent() {
  return new Map([
    ["Mission", [
      "## Mission",
      "",
      "This repository follows an AI-native, spec-first development workflow.",
      "",
      "Do not implement vague requests directly. Convert broad work into request, preflight, spec, eval, and task assets before implementation.",
      "",
    ].join("\n")],
    ["Zero-Experience Solo Developer", [
      "## Zero-Experience Solo Developer",
      "",
      "Treat the default user as one zero-experience solo developer. The user describes business goals and supplies missing business facts. Codex owns technical choices, workflow routing, architecture, baselines, implementation, testing, review, evidence, repair, and rollback preparation.",
      "",
      "Do not ask the user to choose technical stacks, BL levels, packs, database representations, migration strategies, test types, review surfaces, subagent plans, hook classes, workflow commands, or internal owner roles.",
      "",
      "A normal natural-language implementation request is sufficient execution intent for ordinary, reversible, task-bounded project-local engineering after internal IntentOS gates pass. Ask again only for a missing business fact or consent to a concrete production, cost, real-user communication, account/provider, or irreversible real-data effect. Silence is not consent.",
      "",
    ].join("\n")],
    ["Core Rules", [
      "## Core Rules",
      "",
      "1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.",
      "2. Every non-trivial change must have acceptance criteria before implementation.",
      "3. Prefer vertical slices over broad rewrites.",
      "4. Keep changes minimal and scoped.",
      "5. Select production dependencies from project evidence and safe engineering defaults; surface cost, licensing, provider, or irreversible external impact before it occurs.",
      "6. For auth, permission, migration, production config, secrets, high-risk, safety-critical, or security-sensitive logic, perform the full internal risk, test, review, evidence, and rollback path. Ask the user only for missing business rules or concrete real-world consent.",
      "7. Every implementation must include tests or explain why tests are not applicable.",
      "8. If the same verification failure repeats twice, stop and report instead of blindly retrying.",
      "9. After implementation, produce a final report with changed files, tests run, remaining risks, and next step.",
      "",
    ].join("\n")],
    ["Bootstrap Entry", [
      "## Bootstrap Entry",
      "",
      "When the user asks to configure, apply, initialize, inject, install, or bootstrap the IntentOS workflow, treat that as execution bootstrap intent.",
      "",
      "Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.",
      "",
      "When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.",
      "",
      "For bootstrap work, first use `.intentos/prompts/bootstrap-agent.md` when present, then run:",
      "",
      "```bash",
      "node scripts/workflow-next.mjs .",
      "```",
      "",
      "Follow the reported `NEXT_ACTION`. A direct user request to configure IntentOS supplies the business execution intent for a bounded project-local setup. Codex must still generate and verify the exact plan, readiness, approval evidence, backup, rollback, and receipt internally; ask again only if scope or real-world impact exceeds that request.",
      "",
    ].join("\n")],
    ["Beginner Entry", [
      "## Beginner Entry",
      "",
      "Use `.intentos/core/beginner-entry.md` and `.intentos/docs/beginner-entry.md` when the user gives one natural-language goal or should not need to choose internal workflow commands.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs ask . \"<user goal>\"",
      "node scripts/cli.mjs ask-check .",
      "```",
      "",
      "Beginner Entry returns one plain card with what Codex understood, the recommended path, missing business facts, safe next actions, blocked external effects, routing evidence, and boundaries. It does not write files or perform external effects. It does not require a separate technical approval: ordinary reversible engineering may continue through internal IntentOS gates after this read-only entry.",
      "",
    ].join("\n")],
    ["Conversation-Native Ask", [
      "## Conversation-Native Ask",
      "",
      "Use `.intentos/core/conversation-native-ask.md` and `.intentos/docs/conversation-native-ask.md` when the user gives a plain project goal in conversation, unless they clearly ask only to discuss, review, compare, inspect, pause, or stop.",
      "",
      "The user should not need to know or run workflow commands before Codex can route the work. Internally, treat the turn as Beginner Entry behavior and keep the output plain.",
      "",
      "For durable evidence or maintainer debugging, use:",
      "",
      "```bash",
      "node scripts/cli.mjs ask . \"<user goal>\"",
      "node scripts/cli.mjs conversation-ask-check .",
      "```",
      "",
      "Conversation-Native Ask does not write files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive documents, change task state, enable baseline/industrial packs, or approve high-risk decisions.",
      "",
    ].join("\n")],
    ["Natural Language Workflow Guidance", [
      "## Natural Language Workflow Guidance",
      "",
      "When the user gives a broad goal, asks what to do next, or provides a project path/repository without naming a workflow command, start with the plain guidance entry.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/resolve-workflow-guidance.mjs .",
      "```",
      "",
      "Use the result to decide the next safe workflow path. In plain user-facing output, do not require the user to choose internal command names. Do not treat guidance as permission to write files, change CI, install hooks, archive documents, change task state, implement, release, or approve high-risk domain decisions.",
      "",
    ].join("\n")],
    ["Delivery Path Governance", [
      "## Delivery Path Governance",
      "",
      "Use `.intentos/core/delivery-path-governance.md` whenever Codex needs to explain how far the project or task is from useful use.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs delivery-path .",
      "node scripts/cli.mjs delivery-path-check .",
      "```",
      "",
      "Delivery Path states include `IDEA_ONLY`, `NEEDS_PROJECT_READING`, `READY_FOR_PLAN`, `READY_FOR_LOCAL_BUILD`, `READY_FOR_SELF_TEST`, `READY_FOR_INTERNAL_TRIAL`, `READY_FOR_RELEASE_REVIEW`, `BLOCKED_BY_RISK`, `BLOCKED_BY_DIRTY_WORK`, and `BLOCKED_BY_MISSING_DECISION`.",
      "",
      "A Delivery Path Report is read-only. It does not write files, approve implementation, approve release or production, change CI/hooks, change task state, replace Safe Launch, or prove real users can use the product.",
      "",
    ].join("\n")],
    ["Debt & Knowledge Handoff", [
      "## Debt & Knowledge Handoff",
      "",
      "Use `.intentos/core/debt-knowledge-handoff.md` when a task is interrupted, paused, has known debt, or needs a reliable next-run handoff.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs debt-handoff .",
      "node scripts/cli.mjs debt-handoff-check .",
      "```",
      "",
      "A Debt & Knowledge Handoff Report records debt level, verification notes, files to revisit, human decisions, and where to resume. It does not forgive debt, approve implementation, approve release or production, change task state, change source of truth, replace Review Loop, or replace Safe Launch.",
      "",
    ].join("\n")],
    ["Project Onboarding", [
      "## Project Onboarding",
      "",
      "Before the first non-trivial implementation, run project onboarding.",
      "",
      "Use `.intentos/prompts/project-onboarding-agent.md` and `.intentos/core/project-onboarding.md` to derive project onboarding from the user's business goal and project evidence. Codex owns technical onboarding decisions and requests only bounded business or external input.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-project-onboarding.mjs .",
      "node scripts/check-project-onboarding.mjs . --strict",
      "```",
      "",
    ].join("\n")],
    ["Engineering Baseline", [
      "## Engineering Baseline",
      "",
      "Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.intentos/core/engineering-baseline.md` when present.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-engineering-baseline.mjs .",
      "```",
      "",
      "Codex may follow existing local patterns for low-risk local changes. Codex must not create or upgrade project-wide engineering conventions without a documented source of truth, evidence-backed derivation, and the required internal review. If the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns.",
      "",
    ].join("\n")],
    ["Environment Baseline", [
      "## Environment Baseline",
      "",
      "Before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert changes, read `docs/environment-baseline.md` and `.intentos/core/environment-baseline.md` when present.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-environment-baseline.mjs .",
      "node scripts/check-baseline-enforcement.mjs . --mode ready",
      "```",
      "",
      "Codex may draft missing environment facts as `PENDING_CONFIRMATION` and mark irrelevant items as `NOT_APPLICABLE`. Codex must not create or edit `.env`, record secret values, or invent production/release/rollback/monitoring facts. A prepared CI/CD, deployment, or production action requires exact real-world consent only when it has an external effect; Codex still owns the technical plan and readiness judgment.",
      "",
    ].join("\n")],
    ["Platform Baseline", [
      "## Platform Baseline",
      "",
      "Before the first non-trivial implementation, select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-platform-baseline.mjs .",
      "```",
      "",
      "Use `node scripts/resolve-platform-baseline.mjs .` to inspect the effective baseline. Codex selects profiles from project evidence and uses strict mode after the selection and project docs are evidence-backed.",
      "",
    ].join("\n")],
    ["Industrial Baseline", [
      "## Industrial Baseline",
      "",
      "Baseline level describes project governance strength: `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`. It is separate from task level `L0` / `L1` / `L2` / `L3`.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-industrial-pack.mjs . --selected-only",
      "node scripts/resolve-industrial-baseline.mjs .",
      "node scripts/check-industrial-baseline.mjs . --bl2-only",
      "```",
      "",
      "Concrete industrial packs are installed only when Codex selects them from platform, lifecycle, risk, and project evidence. Do not treat BL2 or any industrial pack as ready until baseline level, selected packs, exceptions, residual-risk treatment, and `check-industrial-baseline` pass the required internal review. Use `.intentos/templates/baseline-selection.md` and `.intentos/templates/baseline-evidence.md` to record that evidence-backed decision.",
      "",
    ].join("\n")],
    ["Standard Baseline Packs", [
      "## Standard Baseline Packs",
      "",
      "Use `.intentos/core/standard-baseline-pack-registry.md`, `.intentos/docs/standard-baseline-pack-registry.md`, and `.intentos/docs/platform-standard-baseline-packs.md` when platform standard packs need to be selected before considering BL2 industrial overlays.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/resolve-standard-baseline.mjs .",
      "node scripts/check-standard-baseline-selection.mjs .",
      "```",
      "",
      "Codex may recommend standard packs, but it must not treat recommendations as pack activation, target-project write approval, implementation approval, release approval, or compliance/security/privacy approval.",
      "",
    ].join("\n")],
    ["Workflow Artifact Generation", [
      "## Workflow Artifact Generation",
      "",
      "Use `scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, AI task log, review packet, GPT review prompt, and review loop report files instead of hand-copying templates.",
      "",
      "Before implementation, run:",
      "",
      "```bash",
      "node scripts/check-workflow-artifacts.mjs . --mode ready",
      "```",
      "",
      "For high-risk implementation, run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` after compatibility `Human Approval` fields have been resolved through current evidence authority and the required internal gates.",
      "",
      "If artifact quality fails, fix the workflow artifacts before writing code.",
      "",
      "When independent review is needed, create a review packet with `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` and fill evidence, diff summary, risks, and open questions before handing it to a human reviewer or second model.",
      "",
      "For L2/L3 work or when review creates findings, create `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` to record review rounds, AUTO_FIX attempts, verification, repeated issues, and bounded user-input items. AUTO_FIX is limited to 2 rounds and cannot silently change scope or evidence authority; architecture, dependencies, migrations, production config, release, or rollback findings require a revised plan and re-review.",
      "",
      "When a next-step suggestion is related but outside current scope, create `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>`. When a task result needs durable reporting, create `node scripts/new-workflow-item.mjs --type final-report --task <task-card>`.",
      "",
    ].join("\n")],
    ["Goal Mode", [
      "## Goal Mode",
      "",
      "Use `.intentos/core/goal-mode.md` and `.intentos/prompts/goal-planner-agent.md` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.",
      "",
      "Goal Mode chooses one of: `DISCUSS_ONLY`, `ADOPT_PROJECT`, `DEFINE_WORK`, `IMPLEMENT_TASK`, `REVIEW_TASK`, `REPAIR_TASK`, `BASELINE_DECISION`, or `HANDOFF_OR_REPORT`.",
      "",
      "Create a Goal Card with:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>",
      "node scripts/check-goal-mode.mjs .",
      "```",
      "",
      "A Goal Card is route selection only. It does not approve implementation, risk acceptance, release, Human Approval, Approval scope, or subagent orchestration.",
      "",
    ].join("\n")],
    ["Subagent Orchestration", [
      "## Subagent Orchestration",
      "",
      "Use `.intentos/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting.",
      "",
      "The default rule is: many readers, one writer. Subagent output is input, not authority. The main thread remains responsible for writes, verification, and final reporting.",
      "",
      "Before opening or reusing helper agents, apply Subagent Dispatch Hygiene: recover before dispatch. Close or skip stale helpers, check task drift, and confirm no more than one active writer before sending new work to a helper.",
      "",
      "Create a Subagent Run Plan with:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>",
      "node scripts/check-subagent-orchestration.mjs .",
      "```",
      "",
      "Close or skip every subagent after handoff. Do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot after its output is consumed.",
      "",
    ].join("\n")],
    ["Safe Launch", [
      "## Safe Launch",
      "",
      "Use `.intentos/core/safe-launch.md` when completed work needs a demo, internal handoff, release-review, blocked, or not-ready classification.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-launch-readiness.mjs .",
      "```",
      "",
      "Safe Launch is a readiness recommendation. It does not approve production launch, release, legal, compliance, payment, privacy, security, migration, or irreversible operations.",
      "",
    ].join("\n")],
    ["Conversation Drift", [
      "## Conversation Drift",
      "",
      "Use `.intentos/core/conversation-drift-control.md` when a user message may be discussion-only, review-only, a pause/stop request, a scope change, a new task, a direct follow-up, or a risk decision.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-conversation-drift.mjs .",
      "```",
      "",
      "Classify before acting. Do not treat discussion, direct follow-up, scope change, new task, or risk decision as permission to continue the current task.",
      "",
    ].join("\n")],
    ["First Delivery Walkthrough", [
      "## First Delivery Walkthrough",
      "",
      "Use `.intentos/core/first-delivery-walkthrough.md` when a broad new idea needs a complete first-slice walkthrough from human idea to demo, handoff, or not-ready recommendation.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/check-first-delivery-walkthrough.mjs .",
      "```",
      "",
      "First Delivery Walkthrough records the route, baseline path, artifacts, human decisions, drift handling, verification, and launch readiness. It does not approve production launch, release, payment, privacy, security, legal, compliance, migration, or customer promises.",
      "",
    ].join("\n")],
    ["Review Surface Governance", [
      "## Review Surface Governance",
      "",
      "Use `.intentos/core/review-surface-governance.md` before non-trivial implementation, repair, or review work to decide what must be reviewed before and after execution.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs review-surface .",
      "node scripts/cli.mjs review-surface-check .",
      "```",
      "",
      "Codex selects review surfaces from the project and task intent. The human should not need to choose technical review types. Every Review Surface Card must include `FUNCTIONAL_REVIEW`, `CODE_REVIEW`, `VERIFICATION_REVIEW`, and `DEBT_REVIEW`.",
      "",
      "A Review Surface Card is pre-execution planning only. It does not write files, approve implementation, approve release or production, change CI, install hooks, change task state, or approve security/privacy/compliance/payment/migration/data decisions.",
      "",
      "After execution, final reporting must include per-surface result, unverified surfaces, debt result, and next delivery state.",
      "",
    ].join("\n")],
    ["Review Loop", [
      "## Review Loop",
      "",
      "Use `.intentos/core/review-loop.md` for L2/L3 work or whenever review findings need closure.",
      "",
      "Review Packet is the input. GPT Review Prompt is read-only reviewer instruction. Review Loop Report records review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items.",
      "",
      "Reviewer agents are read-only. Codex may auto-fix only deterministic, low-risk findings inside the bounded task, for at most 2 rounds. Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, compatibility `Human Approval`, and Approval scope changes through replanning, evidence authority, and re-review; ask the user only for bounded business, external-fact, or real-world-consent input.",
      "",
    ].join("\n")],
    ["Bounded Next-Step", [
      "## Bounded Next-Step",
      "",
      "Use `.intentos/core/next-step-boundary.md` for every task final report, review summary, and follow-up suggestion.",
      "",
      "Codex may suggest next steps, but suggestions must be bounded, classified, and actionable. Suggestions must use one of: `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`.",
      "",
      "Only `IN_SCOPE_NEXT_STEP` may be done inside the current task, and only when it stays inside the bounded scope and needs no new evidence authority. All other suggestion types require a new request, follow-up proposal, bounded user input, or explicit stop.",
      "",
    ].join("\n")],
    ["Output Experience", [
      "## Output Experience",
      "",
      "Use `.intentos/core/output-protocol.md` and `.intentos/prompts/reporter-agent.md` when reporting workflow, baseline, adoption, review, release, or automation status.",
      "",
      "Human-facing output must explain status, risk, decision needed, next safe step, what AI can do, and what AI must not do before technical details. Do not hide technical details; move them under `Technical Details` or `Audit Notes`.",
      "",
      "Use `.intentos/core/glossary.md` to translate internal workflow terms when the user may not know them.",
      "",
    ].join("\n")],
    ["Product Baseline And Claim Control", [
      "## Product Baseline And Claim Control",
      "",
      "Use `.intentos/core/outcome-baseline.md`, `.intentos/core/product-baseline.md`, `.intentos/core/claim-control.md`, and `.intentos/core/assumption-register.md` when changing workflow behavior, release wording, public summaries, final reports, or handoffs.",
      "",
      "Do not claim that a task, product, adoption, verification, release, or production outcome is complete unless the current task-bound evidence supports that exact claim.",
      "",
    ].join("\n")],
    ["Guided Decision & Delivery Loop", [
      "## Guided Decision & Delivery Loop",
      "",
      "Use `.intentos/core/decision-delegation-boundary.md`, `.intentos/core/guided-delivery-loop.md`, and `.intentos/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices.",
      "",
      "Codex should recommend the smallest safe path, explain what is out of scope, ask for one user-owned confirmation, and park side ideas instead of executing them.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type active-work-thread --name <current-mainline>",
      "node scripts/new-workflow-item.mjs --type guided-decision-summary --name <decision-name>",
      "```",
      "",
      "These artifacts do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.",
      "",
      "Run `node scripts/check-guided-delivery-loop.mjs .` when these artifacts exist.",
      "",
    ].join("\n")],
    ["Change Boundary And Baseline State", [
      "## Change Boundary And Baseline State",
      "",
      "Use `.intentos/core/change-boundary.md` and `.intentos/core/baseline-state.md` when a task needs explicit diff-boundary proof or when baselines are drafted before code/evidence exists.",
      "",
      "Change Boundary compares approved task scope with actual changed files. It is not hard sandbox enforcement.",
      "",
      "Baseline State keeps `PROPOSED`, `PENDING_CONFIRMATION`, and `EVIDENCE_REQUIRED` separate from `CONFIRMED` project facts.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type change-boundary-report --name <task-scope>",
      "node scripts/new-workflow-item.mjs --type baseline-state-report --name <baseline-state>",
      "```",
      "",
      "Run `node scripts/check-change-boundary.mjs . --report <report>` and `node scripts/check-baseline-state.mjs . --report <report>` when these reports exist.",
      "",
    ].join("\n")],
    ["Baseline Pack System", [
      "## Baseline Pack System",
      "",
      "Use `.intentos/core/baseline-pack-system.md` and `.intentos/docs/baseline-pack-system.md` when project profile, BL level, standard packs, industrial packs, or risk overlays need to be selected.",
      "",
      "Use `.intentos/core/guided-baseline-selection.md` and `.intentos/docs/guided-baseline-selection-entry.md` first when the user needs a plain-language baseline decision instead of internal pack details.",
      "",
      "Codex selects candidate packs from project evidence, but it must not enable BL2, select all packs, treat draft packs as stable, or treat pack files as real project evidence without strict baseline checks and internal review. Standard packs are normal engineering guardrails; industrial packs are optional BL2 overlays.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type baseline-decision-card --name <project-baseline-decision>",
      "node scripts/new-workflow-item.mjs --type standard-baseline-selection-report --name <project-standard-baseline>",
      "node scripts/new-workflow-item.mjs --type baseline-pack-selection-report --name <project-baseline-packs>",
      "```",
      "",
      "Run `node scripts/cli.mjs baseline-decision .` for a plain-language decision card, `node scripts/resolve-standard-baseline.mjs .` for a standard baseline recommendation, `node scripts/cli.mjs baseline-packs .` for the umbrella recommendation, and selection checkers when reports exist.",
      "",
    ].join("\n")],
    ["Document Lifecycle", [
      "## Document Lifecycle",
      "",
      "Use `.intentos/core/document-lifecycle.md` and `.intentos/docs/document-lifecycle.md` when project docs appear stale, duplicated, deprecated, unclear, or when source of truth is disputed.",
      "",
      "Default to archive suggestions before deletion. A Document Lifecycle Report is read-only: it does not delete files, authorize deletion, move files, archive files, change source of truth, or approve cleanup work.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type document-lifecycle-report --name <docs-area>",
      "```",
      "",
      "Run `node scripts/cli.mjs doc-lifecycle .` for a read-only recommendation and `node scripts/check-document-lifecycle.mjs .` when reports exist.",
      "",
    ].join("\n")],
    ["Document Archive Apply", [
      "## Document Archive Apply",
      "",
      "Use `.intentos/core/document-archive-apply.md` and `.intentos/docs/document-archive-apply.md` only after Document Lifecycle has produced archive suggestions that may be ready for controlled execution.",
      "",
      "Archive Apply is plan-first. It creates an apply plan, link-check plan, archive index preview, rollback plan, and human decision list. It does not delete files, move/archive files, rewrite links, change source of truth, replace Document Lifecycle, approve cleanup completion, or authorize archive apply by itself.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type document-archive-apply-plan --name <docs-area>",
      "```",
      "",
      "Run `node scripts/cli.mjs archive-apply .` for a plan-only recommendation and `node scripts/check-document-archive-apply.mjs .` when plans exist.",
      "",
    ].join("\n")],
    ["Unified Apply Plan", [
      "## Unified Apply Plan",
      "",
      "Use `.intentos/core/unified-apply-plan.md` and `.intentos/docs/unified-apply-plan.md` before applying any recommendation that may write target-project files.",
      "",
      "Unified Apply Plan turns proposed writes into one reviewable plan with source evidence, planned actions, human-only or blocked actions, backup, rollback, verification, and boundaries. It does not write files, authorize apply, approve implementation, approve release/production, modify CI/hooks, delete/archive files, change source of truth, or grant permission to continue beyond scope.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type unified-apply-plan --name <apply-scope>",
      "```",
      "",
      "Run `node scripts/cli.mjs apply-plan . --intent \"<goal>\"` for a plan-only recommendation and `node scripts/check-apply-plan.mjs .` when plans exist.",
      "",
    ].join("\n")],
    ["Controlled Apply Readiness", [
      "## Controlled Apply Readiness",
      "",
      "Use `.intentos/core/controlled-apply-readiness.md` and `.intentos/docs/controlled-apply-readiness.md` after a Unified Apply Plan exists and before any future controlled apply is considered.",
      "",
      "Controlled Apply Readiness checks whether the plan is bounded, reversible, verifiable, authority-compatible, and backed by the required consent only for concrete real-world effects. It does not execute writes, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive files, change source of truth, enable industrial packs, or approve high-risk decisions.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type controlled-apply-readiness-report --name <apply-scope>",
      "```",
      "",
      "Run `node scripts/cli.mjs apply-readiness . --plan <apply-plan>` for a read-only readiness report and `node scripts/check-controlled-apply-readiness.mjs .` when reports exist.",
      "",
    ].join("\n")],
    ["Apply Execution Receipt", [
      "## Apply Execution Receipt",
      "",
      "After any controlled IntentOS init/update apply, require a project-bound receipt before claiming that adoption writes were executed or that IntentOS behavior is active.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs apply-receipt-check . --require-structured-evidence",
      "```",
      "",
      "A receipt proves only exact approved governance replay and workflow activation. It does not approve business implementation, CI/hooks, release, production, or project authority changes.",
      "",
    ].join("\n")],
    ["Release Approval Record", [
      "## Release Approval Record",
      "",
      "Before any real release handoff or assisted execution state, require a project-bound structured human Release Approval Record for the exact revision, candidate, target, package identity, and strict release evidence chain.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs release-approval-check . --require-structured-evidence --require-approved",
      "```",
      "",
      "Plain text, tags, Launch Review, recipes, or command-line approval flags are not release authority. High-risk release actions remain human or external-system owned.",
      "",
    ].join("\n")],
    ["Approval Record Governance", [
      "## Approval Record Governance",
      "",
      "Use `.intentos/core/approval-record-governance.md` and `.intentos/docs/approval-record-governance.md` only after a Unified Apply Plan and readiness report exist and the exact action IDs are bound to the current request or one prepared external-effect authority.",
      "",
      "Approval records capture who approved, which plan and hash were approved, exact action IDs, target paths, expiry, rollback acknowledgement, verification acknowledgement, and non-authorizations. They do not execute writes, authorize automatic apply, approve implementation, approve release/production, install hooks, modify CI, change source of truth, or enable high-risk actions.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type approval-record --name <apply-scope>",
      "```",
      "",
      "Run `node scripts/cli.mjs approval-record-check .` when approval records exist.",
      "",
    ].join("\n")],
    ["Work Queue", [
      "## Work Queue",
      "",
      "Use `.intentos/core/work-queue.md` and `.intentos/docs/work-queue.md` when work is interrupted, long-running, paused, resumed, or parked for later.",
      "",
      "Keep at most one task as `CURRENT`. Paused work requires resume review before execution, and backlog items are parking only, not permission to implement.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type work-queue-report --name <current-work>",
      "```",
      "",
      "Run `node scripts/cli.mjs work-queue .` for a read-only recommendation and `node scripts/check-work-queue.mjs .` when reports exist.",
      "",
    ].join("\n")],
    ["Hook Orchestration", [
      "## Hook Orchestration",
      "",
      "Use `.intentos/core/hook-orchestration.md` and `.intentos/docs/hook-orchestration.md` when the project needs automatic trigger planning.",
      "",
      "Codex may run H0 read-only checks and create H1 suggestions. Hook installation, CI changes, blocking gates, external APIs, auto-fix, or release behavior require an evidence-backed controlled plan; concrete external effects additionally require exact real-world consent.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type hook-orchestration-plan --name <project-hooks>",
      "```",
      "",
      "Run `node scripts/cli.mjs hook-plan .` for a read-only recommendation and `node scripts/check-hook-orchestration.mjs .` when plans exist.",
      "",
    ].join("\n")],
    ["Project Hook Policy", [
      "## Project Hook Policy",
      "",
      "Use `.intentos/core/hook-policy.md` and `.intentos/docs/hook-policy.md` before turning hook ideas into project policy or implementation.",
      "",
      "Project Hook Policy defines which H0/H1/H2/H3 hooks this project allows, who approves them, and how they are disabled or rolled back. It does not install hooks, modify CI, add blocking gates, call external APIs, store tokens, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration.",
      "",
      "Optional artifacts:",
      "",
      "```bash",
      "node scripts/new-workflow-item.mjs --type project-hook-policy --name <project-hooks>",
      "```",
      "",
      "Run `node scripts/cli.mjs hook-policy .` for a read-only policy recommendation and `node scripts/check-hook-policy.mjs .` when policies exist.",
      "",
    ].join("\n")],
    ["Task Execution Rules", [
      "## Task Execution Rules",
      "",
      "When a task card exists:",
      "",
      "1. Read `AGENTS.md`.",
      "2. Read the linked spec.",
      "3. Read the linked eval if present.",
      "4. Follow allowed and forbidden scope.",
      "5. Respect stop conditions.",
      "6. Run requested verification.",
      "7. Report evidence and remaining risk.",
      "",
    ].join("\n")],
    ["High-risk Boundaries", [
      "## High-risk Boundaries",
      "",
      "Before changing production release paths, secrets, auth, permission policy, database schema, destructive data operations, production data access, infrastructure, or other irreversible or security-sensitive behavior, Codex must perform the required evidence-backed technical review and continue only when the bounded plan is safe. Ask the user only for an unavailable business or external fact, or for exact consent to a concrete real-world effect; do not ask the user to make the technical decision.",
      "",
    ].join("\n")],
    ["Skill Governance", [
      "## Skill Governance",
      "",
      "Use `.intentos/templates/skill-candidate.md` for candidate drafts and `.intentos/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.",
      "",
    ].join("\n")],
    ["Automation Governance", [
      "## Automation Governance",
      "",
      "Codex may propose project-scoped automations during setup, release preparation, or workflow review.",
      "",
      "Use `automation-proposals/` and `.intentos/templates/project-automation-proposal.md` before creating or updating any Codex App automation. Create, update, resume, delete, or enable an automation only when the user's stated goal explicitly requests that persistent automation; Codex derives the project root, schedule, prompt, allowed writes, and safe initial status and presents the prepared effect for exact consent.",
      "",
    ].join("\n")],
    ["Final Report", [
      "## Final Report",
      "",
      "Every implementation response must include:",
      "",
      "- Completed",
      "- Verified",
      "- Not changed",
      "- Risks remaining",
      "- Next-step suggestions with type, relation to current task, whether AI can do it now, required entry, and risk / approval",
      "- Human decisions needed",
      "- Next safe action",
      "",
    ].join("\n")],
  ]);
}

function agentGovernanceAppendix(missingMarkers) {
  const sections = agentGovernanceSectionContent();
  const selected = missingMarkers
    .map((marker) => sections.get(marker))
    .filter(Boolean);
  return [
    "",
    "# IntentOS Workflow Governance Appendix",
    "",
    ...selected,
  ].join("\n");
}

function writeAgentsGovernanceMigrationReport(targetPath, missingMarkers, options = {}) {
  const status = options.status || (options.applied ? "APPLIED" : "PENDING_CONTROLLED_APPLY");
  const reportPath = agentsGovernanceMigrationReportPath(targetPath);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const existed = fs.existsSync(reportPath);
  const statusNotes = {
    PENDING_CONTROLLED_APPLY: "The AGENTS.md file was left unchanged. Codex must reconcile authority and pass bounded apply readiness before applying it.",
    PENDING_HUMAN_APPROVAL: "Compatibility status from an older report. Treat it as PENDING_CONTROLLED_APPLY; do not ask the user for a technical decision.",
    APPLIED: "The proposed governance appendix was applied through the controlled migration path.",
    RESOLVED_MANUALLY: "AGENTS.md already contains all required governance markers. No script change to AGENTS.md was needed.",
  };
  const reasonLines = status === "RESOLVED_MANUALLY"
    ? [
        "The project AGENTS.md now contains all required IntentOS workflow governance markers.",
        "",
        "A previous pending migration report was resolved after AGENTS.md was updated manually or by another approved process.",
      ]
    : [
        "The project already has AGENTS.md, but it is missing IntentOS workflow governance markers.",
        "",
        "The update command does not modify an existing project AGENTS.md until Codex proves project-authority reconciliation, bounded scope, rollback, and controlled apply readiness.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_CONTROLLED_APPLY" || status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After Codex completes rule reconciliation, plan review, rollback preparation, and controlled apply readiness, it may run:",
        "",
        "```bash",
        "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-agent-governance",
        "```",
      ]
    : ["No apply command is needed for this report status."];
  const content = [
    "# Migration Report: AGENTS.md Governance",
    "",
    `Status: ${status}`,
    `IntentOS version: ${currentIntentOSVersion}`,
    "",
    ...migrationControlSummary({
      status,
      targetLabel: "AGENTS.md",
      applyCommand: "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-agent-governance",
    }),
    "## Status Notes",
    "",
    statusNotes[status] || statusNotes.PENDING_CONTROLLED_APPLY,
    "",
    "## Target",
    "",
    "`AGENTS.md`",
    "",
    "## Reason",
    "",
    ...reasonLines,
    "",
    "## Missing Markers",
    "",
    ...missingMarkerLines,
    "",
    "## Proposed Appendix",
    "",
    "```md",
    agentGovernanceAppendix(missingMarkers).trim(),
    "```",
    "",
    "## Apply",
    "",
    ...applyLines,
    "",
    "Do not apply this migration if the project uses centrally managed agent instructions and governance must be added elsewhere.",
    "",
  ].join("\n");
  backupFileIfNeeded(reportPath, { ...options, targetPath });
  fs.writeFileSync(reportPath, content);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), reportPath)}`);
}

function ensureAgentsGovernance(targetPath, options = {}) {
  const { applyAgentGovernance = false } = options;
  const entry = preferredAgentEntry(targetPath);
  const dest = path.join(targetPath, entry);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(path.join(kitRoot, "platforms", "codex", "AGENTS.template.md"), dest);
    console.log(`created ${path.relative(process.cwd(), dest)}`);
    return;
  }

  const content = fs.readFileSync(dest, "utf8");
  const missingMarkers = requiredAgentGovernanceMarkers.filter((marker) => !content.includes(marker));
  if (missingMarkers.length === 0) {
    const reportPath = agentsGovernanceMigrationReportPath(targetPath);
    if (fs.existsSync(reportPath)) {
      const report = fs.readFileSync(reportPath, "utf8");
      if (report.includes("PENDING_HUMAN_APPROVAL") || report.includes("PENDING_CONTROLLED_APPLY")) {
        writeAgentsGovernanceMigrationReport(targetPath, [], { ...options, status: "RESOLVED_MANUALLY" });
      }
    }
    console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
    return;
  }

  if (!applyAgentGovernance) {
    writeAgentsGovernanceMigrationReport(targetPath, missingMarkers, options);
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .intentos/migration-reports/agents-governance.md`);
    return;
  }

  backupFileIfNeeded(dest, { ...options, targetPath });
  fs.appendFileSync(dest, `${content.endsWith("\n") ? "" : "\n"}${agentGovernanceAppendix(missingMarkers)}`);
  writeAgentsGovernanceMigrationReport(targetPath, missingMarkers, { ...options, applied: true });
  console.log(`updated ${path.relative(process.cwd(), dest)} with IntentOS workflow governance appendix through controlled apply`);
}

function ensureProjectOnboardingDocs(targetPath) {
  const docs = [
    ["project-onboarding.md", "project-onboarding.md"],
    ["project-profile.md", "project-profile.md"],
    ["tech-stack-strategy.md", "tech-stack-strategy.md"],
    ["business-spec-index.md", "business-spec-index.md"],
    ["sample-policy.md", "sample-policy.md"],
    ["onboarding-decisions.md", "onboarding-decisions.md"],
    ["verification-matrix.md", "verification-matrix.md"],
    ["engineering-baseline.md", "engineering-baseline.md"],
    ["environment-baseline.md", "environment-baseline.md"],
  ];

  for (const [templateName, docName] of docs) {
    const source = resolveUnderRoot(kitRoot, `templates/${templateName}`, "onboarding template source");
    const dest = assertSafeWritePath(targetPath, `docs/${docName}`, "onboarding document target");
    if (fs.existsSync(dest)) {
      console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
      continue;
    }
    copyFile(source, dest, { targetPath });
  }
}

function copyIndustrialAssets(targetPath, options = {}) {
  const sourceRoot = path.join(kitRoot, "industrial-packs");
  const destRoot = assertSafeWritePath(targetPath, ".intentos/industrial-packs", "industrial pack root");
  fs.mkdirSync(destRoot, { recursive: true });

  if (options.withIndustrialPacks) {
    copyDir(sourceRoot, destRoot, options);
    return;
  }

  copyFile(path.join(sourceRoot, "README.md"), path.join(destRoot, "README.md"), options);
  copyFile(path.join(sourceRoot, "selection-guide.md"), path.join(destRoot, "selection-guide.md"), options);
  copyFile(path.join(sourceRoot, "index.json"), path.join(destRoot, "index.json"), options);
  copyDir(path.join(sourceRoot, "schema"), path.join(destRoot, "schema"), options);

  const sourceIndex = readJsonIfExists(path.join(sourceRoot, "index.json"));
  const explicitPacks = parseIndustrialPackIds(options.industrialPacks);
  const selectedPacks = options.update ? selectedIndustrialPackIdsFromProject(targetPath) : [];
  const installedPacks = options.update ? installedIndustrialPackIds(targetPath, sourceIndex) : [];
  const packIds = [...new Set([...explicitPacks, ...selectedPacks, ...installedPacks])].sort();
  if (packIds.length === 0) return;

  const entriesById = new Map((sourceIndex?.packs || []).map((entry) => [entry.id, entry]));
  for (const packId of packIds) {
    assertSafeNameSegment(packId, "industrial pack id");
    const entry = entriesById.get(packId);
    if (!entry) {
      throw new Error(`Unknown industrial pack: ${packId}`);
    }
    if (entry.status === "planned") {
      throw new Error(`Industrial pack is planned and not executable yet: ${packId}`);
    }
    if (!entry.path) {
      throw new Error(`Industrial pack has no source path: ${packId}`);
    }
    const entryPath = assertSafeRelativePath(entry.path, `industrial pack path for ${packId}`);
    copyDir(resolveUnderRoot(sourceRoot, entryPath, `industrial pack source for ${packId}`), assertSafeWritePath(destRoot, entryPath, `industrial pack target for ${packId}`), options);
  }
}

function copySharedAssets(targetPath, options = {}) {
  options = { ...options, targetPath };
  const { starter = "generic-project", applyPrTemplateGovernance = false, applyAgentGovernance = false } = options;
  const copyRules = manifestCopyRules(kitRoot, { fallback: fallbackCopyRules() });
  for (const rule of copyRules.directories || []) {
    copyDir(resolveUnderRoot(kitRoot, rule.source, "manifest directory source"), assertSafeWritePath(targetPath, rule.target, "manifest directory target"), options);
  }
  for (const rule of copyRules.files || []) {
    copyFile(resolveUnderRoot(kitRoot, rule.source, "manifest file source"), assertSafeWritePath(targetPath, rule.target, "manifest file target"), options);
  }
  copyIndustrialAssets(targetPath, options);

  ensureProjectOnboardingDocs(targetPath);
  ensureAgentsGovernance(targetPath, { ...options, applyAgentGovernance });
  ensurePullRequestTemplate(targetPath, starter, { ...options, applyPrTemplateGovernance });
  ensureWorkflowDirs(targetPath);
}

function fallbackCopyRules() {
  return {
    directories: [
      { source: "core", target: ".intentos/core" },
      { source: "templates", target: ".intentos/templates" },
      { source: "prompts", target: ".intentos/prompts" },
      { source: "checklists", target: ".intentos/checklists" },
      { source: "profiles", target: ".intentos/profiles" },
      { source: "standard-baseline-packs", target: ".intentos/standard-baseline-packs" },
      { source: "schemas/artifacts", target: ".intentos/schemas/artifacts" },
    ],
    files: [
      { source: "intentos-manifest.json", target: ".intentos/intentos-manifest.json" },
      { source: "docs/artifact-decision-tree.md", target: ".intentos/docs/artifact-decision-tree.md" },
      { source: "docs/artifact-lifecycle.md", target: ".intentos/docs/artifact-lifecycle.md" },
      { source: "docs/o0-bl0-lightweight-path.md", target: ".intentos/docs/o0-bl0-lightweight-path.md" },
      { source: "docs/goal-subagent-usage.md", target: ".intentos/docs/goal-subagent-usage.md" },
      { source: "docs/subagent-dispatch-hygiene.md", target: ".intentos/docs/subagent-dispatch-hygiene.md" },
      { source: "docs/baseline-setup.md", target: ".intentos/docs/baseline-setup.md" },
      { source: "docs/guided-delivery-baseline.md", target: ".intentos/docs/guided-delivery-baseline.md" },
      { source: "docs/guided-decision-delivery-loop.md", target: ".intentos/docs/guided-decision-delivery-loop.md" },
      { source: "docs/change-boundary.md", target: ".intentos/docs/change-boundary.md" },
      { source: "docs/baseline-state.md", target: ".intentos/docs/baseline-state.md" },
      { source: "docs/guided-delivery-check.md", target: ".intentos/docs/guided-delivery-check.md" },
      { source: "docs/baseline-pack-system.md", target: ".intentos/docs/baseline-pack-system.md" },
      { source: "docs/standard-baseline-pack-registry.md", target: ".intentos/docs/standard-baseline-pack-registry.md" },
      { source: "docs/structured-evidence-schema.md", target: ".intentos/docs/structured-evidence-schema.md" },
      { source: "docs/platform-standard-baseline-packs.md", target: ".intentos/docs/platform-standard-baseline-packs.md" },
      { source: "docs/existing-project-workflow-adapter.md", target: ".intentos/docs/existing-project-workflow-adapter.md" },
      { source: "docs/document-lifecycle.md", target: ".intentos/docs/document-lifecycle.md" },
      { source: "docs/document-archive-apply.md", target: ".intentos/docs/document-archive-apply.md" },
      { source: "docs/unified-apply-plan.md", target: ".intentos/docs/unified-apply-plan.md" },
      { source: "docs/apply-execution-receipt.md", target: ".intentos/docs/apply-execution-receipt.md" },
      { source: "docs/controlled-apply-readiness.md", target: ".intentos/docs/controlled-apply-readiness.md" },
      { source: "docs/approval-record-governance.md", target: ".intentos/docs/approval-record-governance.md" },
      { source: "docs/beginner-entry.md", target: ".intentos/docs/beginner-entry.md" },
      { source: "docs/conversation-native-ask.md", target: ".intentos/docs/conversation-native-ask.md" },
      { source: "docs/work-queue.md", target: ".intentos/docs/work-queue.md" },
      { source: "docs/hook-orchestration.md", target: ".intentos/docs/hook-orchestration.md" },
      { source: "docs/hook-policy.md", target: ".intentos/docs/hook-policy.md" },
      { source: "docs/review-surface-governance.md", target: ".intentos/docs/review-surface-governance.md" },
      { source: "docs/delivery-path-governance.md", target: ".intentos/docs/delivery-path-governance.md" },
      { source: "docs/debt-knowledge-handoff.md", target: ".intentos/docs/debt-knowledge-handoff.md" },
      { source: "docs/product-baseline.md", target: ".intentos/docs/product-baseline.md" },
      { source: "docs/claim-control.md", target: ".intentos/docs/claim-control.md" },
      { source: "core/decision-delegation-boundary.md", target: ".intentos/core/decision-delegation-boundary.md" },
      { source: "core/guided-delivery-loop.md", target: ".intentos/core/guided-delivery-loop.md" },
      { source: "core/change-boundary.md", target: ".intentos/core/change-boundary.md" },
      { source: "core/baseline-state.md", target: ".intentos/core/baseline-state.md" },
      { source: "core/baseline-pack-system.md", target: ".intentos/core/baseline-pack-system.md" },
      { source: "core/standard-baseline-pack-registry.md", target: ".intentos/core/standard-baseline-pack-registry.md" },
      { source: "core/existing-project-workflow-adapter.md", target: ".intentos/core/existing-project-workflow-adapter.md" },
      { source: "core/document-lifecycle.md", target: ".intentos/core/document-lifecycle.md" },
      { source: "core/document-archive-apply.md", target: ".intentos/core/document-archive-apply.md" },
      { source: "core/unified-apply-plan.md", target: ".intentos/core/unified-apply-plan.md" },
      { source: "core/controlled-apply-readiness.md", target: ".intentos/core/controlled-apply-readiness.md" },
      { source: "core/beginner-entry.md", target: ".intentos/core/beginner-entry.md" },
      { source: "core/conversation-native-ask.md", target: ".intentos/core/conversation-native-ask.md" },
      { source: "core/work-queue.md", target: ".intentos/core/work-queue.md" },
      { source: "core/hook-orchestration.md", target: ".intentos/core/hook-orchestration.md" },
      { source: "core/hook-policy.md", target: ".intentos/core/hook-policy.md" },
      { source: "core/review-surface-governance.md", target: ".intentos/core/review-surface-governance.md" },
      { source: "core/delivery-path-governance.md", target: ".intentos/core/delivery-path-governance.md" },
      { source: "core/debt-knowledge-handoff.md", target: ".intentos/core/debt-knowledge-handoff.md" },
      { source: "core/subagent-dispatch-hygiene.md", target: ".intentos/core/subagent-dispatch-hygiene.md" },
      { source: "prompts/delivery-coach-agent.md", target: ".intentos/prompts/delivery-coach-agent.md" },
      { source: "prompts/guided-delivery-check-agent.md", target: ".intentos/prompts/guided-delivery-check-agent.md" },
      { source: "prompts/change-boundary-agent.md", target: ".intentos/prompts/change-boundary-agent.md" },
      { source: "prompts/baseline-state-agent.md", target: ".intentos/prompts/baseline-state-agent.md" },
      { source: "prompts/baseline-pack-router-agent.md", target: ".intentos/prompts/baseline-pack-router-agent.md" },
      { source: "prompts/standard-baseline-router-agent.md", target: ".intentos/prompts/standard-baseline-router-agent.md" },
      { source: "prompts/workflow-adapter-agent.md", target: ".intentos/prompts/workflow-adapter-agent.md" },
      { source: "prompts/document-lifecycle-agent.md", target: ".intentos/prompts/document-lifecycle-agent.md" },
      { source: "prompts/document-archive-agent.md", target: ".intentos/prompts/document-archive-agent.md" },
      { source: "prompts/apply-plan-agent.md", target: ".intentos/prompts/apply-plan-agent.md" },
      { source: "prompts/controlled-apply-readiness-agent.md", target: ".intentos/prompts/controlled-apply-readiness-agent.md" },
      { source: "prompts/beginner-entry-agent.md", target: ".intentos/prompts/beginner-entry-agent.md" },
      { source: "prompts/conversation-native-ask-agent.md", target: ".intentos/prompts/conversation-native-ask-agent.md" },
      { source: "prompts/work-queue-agent.md", target: ".intentos/prompts/work-queue-agent.md" },
      { source: "prompts/hook-orchestration-agent.md", target: ".intentos/prompts/hook-orchestration-agent.md" },
      { source: "prompts/hook-policy-agent.md", target: ".intentos/prompts/hook-policy-agent.md" },
      { source: "prompts/review-surface-agent.md", target: ".intentos/prompts/review-surface-agent.md" },
      { source: "prompts/delivery-path-agent.md", target: ".intentos/prompts/delivery-path-agent.md" },
      { source: "prompts/debt-handoff-agent.md", target: ".intentos/prompts/debt-handoff-agent.md" },
      { source: "templates/active-work-thread.md", target: ".intentos/templates/active-work-thread.md" },
      { source: "templates/guided-decision-summary.md", target: ".intentos/templates/guided-decision-summary.md" },
      { source: "templates/change-boundary-report.md", target: ".intentos/templates/change-boundary-report.md" },
      { source: "templates/baseline-state-report.md", target: ".intentos/templates/baseline-state-report.md" },
      { source: "templates/baseline-pack-selection-report.md", target: ".intentos/templates/baseline-pack-selection-report.md" },
      { source: "templates/standard-baseline-selection-report.md", target: ".intentos/templates/standard-baseline-selection-report.md" },
      { source: "templates/workflow-adoption-map.md", target: ".intentos/templates/workflow-adoption-map.md" },
      { source: "templates/document-lifecycle-report.md", target: ".intentos/templates/document-lifecycle-report.md" },
      { source: "templates/document-archive-apply-plan.md", target: ".intentos/templates/document-archive-apply-plan.md" },
      { source: "templates/unified-apply-plan.md", target: ".intentos/templates/unified-apply-plan.md" },
      { source: "templates/apply-execution-receipt.md", target: ".intentos/templates/apply-execution-receipt.md" },
      { source: "templates/controlled-apply-readiness-report.md", target: ".intentos/templates/controlled-apply-readiness-report.md" },
      { source: "templates/beginner-entry-card.md", target: ".intentos/templates/beginner-entry-card.md" },
      { source: "templates/conversation-ask-card.md", target: ".intentos/templates/conversation-ask-card.md" },
      { source: "templates/archive-index.md", target: ".intentos/templates/archive-index.md" },
      { source: "templates/work-queue-report.md", target: ".intentos/templates/work-queue-report.md" },
      { source: "templates/hook-orchestration-plan.md", target: ".intentos/templates/hook-orchestration-plan.md" },
      { source: "templates/project-hook-policy.md", target: ".intentos/templates/project-hook-policy.md" },
      { source: "templates/review-surface-card.md", target: ".intentos/templates/review-surface-card.md" },
      { source: "templates/delivery-path-report.md", target: ".intentos/templates/delivery-path-report.md" },
      { source: "templates/debt-knowledge-handoff-report.md", target: ".intentos/templates/debt-knowledge-handoff-report.md" },
      { source: "checklists/review-surface-review.md", target: ".intentos/checklists/review-surface-review.md" },
      { source: "checklists/delivery-path-review.md", target: ".intentos/checklists/delivery-path-review.md" },
      { source: "checklists/debt-knowledge-handoff-review.md", target: ".intentos/checklists/debt-knowledge-handoff-review.md" },
      { source: "checklists/document-archive-apply-review.md", target: ".intentos/checklists/document-archive-apply-review.md" },
      { source: "checklists/unified-apply-plan-review.md", target: ".intentos/checklists/unified-apply-plan-review.md" },
      { source: "checklists/controlled-apply-readiness-review.md", target: ".intentos/checklists/controlled-apply-readiness-review.md" },
      { source: "checklists/beginner-entry-review.md", target: ".intentos/checklists/beginner-entry-review.md" },
      { source: "checklists/conversation-native-ask-review.md", target: ".intentos/checklists/conversation-native-ask-review.md" },
      { source: "checklists/hook-policy-review.md", target: ".intentos/checklists/hook-policy-review.md" },
      { source: "scripts/check-ai-workflow.mjs", target: "scripts/check-ai-workflow.mjs" },
      { source: "scripts/baseline-project.mjs", target: "scripts/baseline-project.mjs" },
      { source: "scripts/check-product-baseline.mjs", target: "scripts/check-product-baseline.mjs" },
      { source: "scripts/check-claim-control.mjs", target: "scripts/check-claim-control.mjs" },
      { source: "scripts/summarize-ai-logs.mjs", target: "scripts/summarize-ai-logs.mjs" },
      { source: "scripts/check-workflow-version.mjs", target: "scripts/check-workflow-version.mjs" },
      { source: "scripts/workflow-daily-summary.mjs", target: "scripts/workflow-daily-summary.mjs" },
      { source: "scripts/check-project-onboarding.mjs", target: "scripts/check-project-onboarding.mjs" },
      { source: "scripts/check-engineering-baseline.mjs", target: "scripts/check-engineering-baseline.mjs" },
      { source: "scripts/check-environment-baseline.mjs", target: "scripts/check-environment-baseline.mjs" },
      { source: "scripts/check-baseline-enforcement.mjs", target: "scripts/check-baseline-enforcement.mjs" },
      { source: "scripts/check-platform-baseline.mjs", target: "scripts/check-platform-baseline.mjs" },
      { source: "scripts/resolve-platform-baseline.mjs", target: "scripts/resolve-platform-baseline.mjs" },
      { source: "scripts/check-industrial-pack.mjs", target: "scripts/check-industrial-pack.mjs" },
      { source: "scripts/resolve-industrial-baseline.mjs", target: "scripts/resolve-industrial-baseline.mjs" },
      { source: "scripts/check-industrial-baseline.mjs", target: "scripts/check-industrial-baseline.mjs" },
      { source: "scripts/check-workflow-artifacts.mjs", target: "scripts/check-workflow-artifacts.mjs" },
      { source: "scripts/check-review-loop.mjs", target: "scripts/check-review-loop.mjs" },
      { source: "scripts/check-next-step-boundary.mjs", target: "scripts/check-next-step-boundary.mjs" },
      { source: "scripts/check-goal-mode.mjs", target: "scripts/check-goal-mode.mjs" },
      { source: "scripts/check-subagent-orchestration.mjs", target: "scripts/check-subagent-orchestration.mjs" },
      { source: "scripts/check-guided-delivery-loop.mjs", target: "scripts/check-guided-delivery-loop.mjs" },
      { source: "scripts/check-change-boundary.mjs", target: "scripts/check-change-boundary.mjs" },
      { source: "scripts/check-baseline-state.mjs", target: "scripts/check-baseline-state.mjs" },
      { source: "scripts/resolve-existing-workflow.mjs", target: "scripts/resolve-existing-workflow.mjs" },
      { source: "scripts/check-workflow-adoption-map.mjs", target: "scripts/check-workflow-adoption-map.mjs" },
      { source: "scripts/resolve-document-lifecycle.mjs", target: "scripts/resolve-document-lifecycle.mjs" },
      { source: "scripts/check-document-lifecycle.mjs", target: "scripts/check-document-lifecycle.mjs" },
      { source: "scripts/resolve-document-archive-apply.mjs", target: "scripts/resolve-document-archive-apply.mjs" },
      { source: "scripts/check-document-archive-apply.mjs", target: "scripts/check-document-archive-apply.mjs" },
      { source: "scripts/resolve-apply-plan.mjs", target: "scripts/resolve-apply-plan.mjs" },
      { source: "scripts/check-apply-plan.mjs", target: "scripts/check-apply-plan.mjs" },
      { source: "scripts/check-apply-execution-receipt.mjs", target: "scripts/check-apply-execution-receipt.mjs" },
      { source: "scripts/resolve-controlled-apply-readiness.mjs", target: "scripts/resolve-controlled-apply-readiness.mjs" },
      { source: "scripts/check-controlled-apply-readiness.mjs", target: "scripts/check-controlled-apply-readiness.mjs" },
      { source: "scripts/check-approval-record.mjs", target: "scripts/check-approval-record.mjs" },
      { source: "scripts/resolve-beginner-entry.mjs", target: "scripts/resolve-beginner-entry.mjs" },
      { source: "scripts/check-beginner-entry.mjs", target: "scripts/check-beginner-entry.mjs" },
      { source: "scripts/check-conversation-native-ask.mjs", target: "scripts/check-conversation-native-ask.mjs" },
      { source: "scripts/resolve-work-queue.mjs", target: "scripts/resolve-work-queue.mjs" },
      { source: "scripts/check-work-queue.mjs", target: "scripts/check-work-queue.mjs" },
      { source: "scripts/resolve-hook-orchestration.mjs", target: "scripts/resolve-hook-orchestration.mjs" },
      { source: "scripts/check-hook-orchestration.mjs", target: "scripts/check-hook-orchestration.mjs" },
      { source: "scripts/resolve-hook-policy.mjs", target: "scripts/resolve-hook-policy.mjs" },
      { source: "scripts/check-hook-policy.mjs", target: "scripts/check-hook-policy.mjs" },
      { source: "scripts/resolve-review-surface.mjs", target: "scripts/resolve-review-surface.mjs" },
      { source: "scripts/check-review-surface.mjs", target: "scripts/check-review-surface.mjs" },
      { source: "scripts/resolve-delivery-path.mjs", target: "scripts/resolve-delivery-path.mjs" },
      { source: "scripts/check-delivery-path.mjs", target: "scripts/check-delivery-path.mjs" },
      { source: "scripts/resolve-debt-handoff.mjs", target: "scripts/resolve-debt-handoff.mjs" },
      { source: "scripts/check-debt-handoff.mjs", target: "scripts/check-debt-handoff.mjs" },
      { source: "scripts/resolve-standard-baseline.mjs", target: "scripts/resolve-standard-baseline.mjs" },
      { source: "scripts/check-standard-baseline-pack.mjs", target: "scripts/check-standard-baseline-pack.mjs" },
      { source: "scripts/check-standard-baseline-selection.mjs", target: "scripts/check-standard-baseline-selection.mjs" },
      { source: "scripts/resolve-baseline-packs.mjs", target: "scripts/resolve-baseline-packs.mjs" },
      { source: "scripts/check-baseline-pack-selection.mjs", target: "scripts/check-baseline-pack-selection.mjs" },
      { source: "scripts/lib/artifact-schema.mjs", target: "scripts/lib/artifact-schema.mjs" },
      { source: "scripts/lib/frontmatter.mjs", target: "scripts/lib/frontmatter.mjs" },
      { source: "scripts/lib/manifest.mjs", target: "scripts/lib/manifest.mjs" },
      { source: "scripts/lib/plan-review-binding.mjs", target: "scripts/lib/plan-review-binding.mjs" },
      { source: "scripts/new-workflow-item.mjs", target: "scripts/new-workflow-item.mjs" },
      { source: "scripts/new-workflow-item/cli.mjs", target: "scripts/new-workflow-item/cli.mjs" },
      { source: "scripts/new-workflow-item/fillers.mjs", target: "scripts/new-workflow-item/fillers.mjs" },
      { source: "scripts/new-workflow-item/fillers/baseline.mjs", target: "scripts/new-workflow-item/fillers/baseline.mjs" },
      { source: "scripts/new-workflow-item/fillers/frontmatter.mjs", target: "scripts/new-workflow-item/fillers/frontmatter.mjs" },
      { source: "scripts/new-workflow-item/fillers/governance.mjs", target: "scripts/new-workflow-item/fillers/governance.mjs" },
      { source: "scripts/new-workflow-item/fillers/reporting.mjs", target: "scripts/new-workflow-item/fillers/reporting.mjs" },
      { source: "scripts/new-workflow-item/fillers/review.mjs", target: "scripts/new-workflow-item/fillers/review.mjs" },
      { source: "scripts/new-workflow-item/fillers/routing.mjs", target: "scripts/new-workflow-item/fillers/routing.mjs" },
      { source: "scripts/new-workflow-item/fillers/workflow.mjs", target: "scripts/new-workflow-item/fillers/workflow.mjs" },
      { source: "scripts/new-workflow-item/references.mjs", target: "scripts/new-workflow-item/references.mjs" },
      { source: "scripts/new-workflow-item/registry.mjs", target: "scripts/new-workflow-item/registry.mjs" },
      { source: "scripts/workflow-next.mjs", target: "scripts/workflow-next.mjs" },
      { source: "platforms/github/ci-ai-workflow.yml", target: ".github/workflows/ai-workflow-checks.yml" },
    ],
  };
}

function ensureWorkflowDirs(targetPath) {
  const dirs = manifestGroup(kitRoot, "workflowDirs", { fallback: [
    "requests",
    "preflight",
    "specs",
    "evals",
    "tasks",
    "ai-logs",
    "workflow-retros",
    "workflow-improvements",
    "skill-candidates",
    "automation-proposals",
    "intentos-proposals",
    "baseline-recommendations",
    "baseline-gap-reports",
    "review-packets",
    "gpt-review-prompts",
    "review-loop-reports",
    "goal-cards",
    "subagent-run-plans",
    "status-reports",
    "decision-briefs",
    "review-summaries",
    "customer-handoffs",
    "follow-up-proposals",
    "final-reports",
    "active-work-threads",
    "guided-decision-summaries",
    "change-boundary-reports",
    "baseline-state-reports",
    "workflow-adoption-maps",
    "doc-lifecycle-reports",
    "archive-apply-plans",
    "apply-plans",
    "apply-execution-plans",
    "apply-receipts",
    "apply-readiness-reports",
    "approval-records",
    "release-approval-records",
    "beginner-entry-cards",
    "conversation-ask-cards",
    "work-queue",
    "hook-orchestration-plans",
    "hook-policies",
    "review-surface-cards",
    "delivery-path-reports",
    "debt-handoff-reports",
    "execution-closures",
    "standard-baseline-selections",
    "baseline-pack-selections",
    "releases",
  ] });
  for (const dir of dirs) {
    const fullDir = path.join(targetPath, dir);
    fs.mkdirSync(fullDir, { recursive: true });
    const keepFile = path.join(fullDir, ".gitkeep");
    if (!fs.existsSync(keepFile)) {
      fs.writeFileSync(keepFile, "");
      console.log(`created ${path.relative(process.cwd(), keepFile)}`);
    }
  }
}

function buildVersionRecord(targetPath, starter, options = {}, now = new Date().toISOString()) {
  const versionPath = path.join(targetPath, ".intentos", "version.json");
  const existed = fs.existsSync(versionPath);
  let existing = {};
  if (existed) {
    try {
      existing = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    } catch {
      existing = {};
    }
  }
  const version = {
    intentOSVersion: currentIntentOSVersion,
    starter: existing.starter || starter,
    projectEntryOrigin: existing.projectEntryOrigin || options.projectEntryOrigin || "UNKNOWN_PROJECT_ORIGIN",
    baselineSelection: options.baselineConfig?.configured ? {
      level: options.baselineConfig.baselineLevel,
      profiles: options.baselineConfig.profiles,
      standardPacks: options.baselineConfig.standardPacks,
      industrialPacks: options.baselineConfig.industrialPacks,
    } : existing.baselineSelection || null,
    initializedAt: existing.initializedAt || now,
    lastWorkflowAssetUpdateAt: options.update ? now : existing.lastWorkflowAssetUpdateAt || now,
    workflowAssets: workflowVersionAssets(kitRoot, { fallback: [
      ".intentos/core",
      ".intentos/templates",
      ".intentos/prompts",
      ".intentos/checklists",
      ".intentos/profiles",
      ".intentos/industrial-packs",
      ".intentos/standard-baseline-packs",
      ".intentos/schemas/artifacts",
      ".intentos/docs/artifact-decision-tree.md",
      ".intentos/docs/artifact-lifecycle.md",
      ".intentos/docs/o0-bl0-lightweight-path.md",
      ".intentos/docs/goal-subagent-usage.md",
      ".intentos/docs/baseline-setup.md",
      ".intentos/docs/guided-delivery-baseline.md",
      ".intentos/docs/baseline-pack-system.md",
      ".intentos/docs/standard-baseline-pack-registry.md",
      ".intentos/docs/structured-evidence-schema.md",
      ".intentos/docs/platform-standard-baseline-packs.md",
      ".intentos/docs/existing-project-workflow-adapter.md",
      ".intentos/docs/document-lifecycle.md",
      ".intentos/docs/document-archive-apply.md",
      ".intentos/docs/unified-apply-plan.md",
      ".intentos/docs/apply-execution-receipt.md",
      ".intentos/docs/beginner-entry.md",
      ".intentos/docs/conversation-native-ask.md",
      ".intentos/docs/work-queue.md",
      ".intentos/docs/hook-orchestration.md",
      ".intentos/docs/hook-policy.md",
      ".intentos/docs/review-surface-governance.md",
      ".intentos/docs/delivery-path-governance.md",
      ".intentos/docs/debt-knowledge-handoff.md",
      ".intentos/docs/execution-review-closure.md",
      ".intentos/docs/product-baseline.md",
      ".intentos/docs/claim-control.md",
      "AGENTS.md",
      "scripts/check-ai-workflow.mjs",
      "scripts/baseline-project.mjs",
      "scripts/check-product-baseline.mjs",
      "scripts/check-claim-control.mjs",
      "scripts/summarize-ai-logs.mjs",
      "scripts/check-workflow-version.mjs",
      "scripts/workflow-daily-summary.mjs",
      "scripts/check-project-onboarding.mjs",
      "scripts/check-engineering-baseline.mjs",
      "scripts/check-environment-baseline.mjs",
      "scripts/check-baseline-enforcement.mjs",
      "scripts/check-platform-baseline.mjs",
      "scripts/resolve-platform-baseline.mjs",
      "scripts/check-industrial-pack.mjs",
      "scripts/resolve-industrial-baseline.mjs",
      "scripts/check-industrial-baseline.mjs",
      "scripts/check-workflow-artifacts.mjs",
      "scripts/check-review-loop.mjs",
      "scripts/check-next-step-boundary.mjs",
      "scripts/check-goal-mode.mjs",
      "scripts/check-subagent-orchestration.mjs",
      "scripts/check-guided-delivery-loop.mjs",
      "scripts/check-change-boundary.mjs",
      "scripts/check-baseline-state.mjs",
      "scripts/resolve-existing-workflow.mjs",
      "scripts/check-workflow-adoption-map.mjs",
      "scripts/resolve-document-lifecycle.mjs",
      "scripts/check-document-lifecycle.mjs",
      "scripts/resolve-document-archive-apply.mjs",
      "scripts/check-document-archive-apply.mjs",
      "scripts/resolve-apply-plan.mjs",
      "scripts/check-apply-plan.mjs",
      "scripts/check-apply-execution-receipt.mjs",
      "scripts/resolve-controlled-apply-readiness.mjs",
      "scripts/check-controlled-apply-readiness.mjs",
      "scripts/resolve-beginner-entry.mjs",
      "scripts/check-beginner-entry.mjs",
      "scripts/check-conversation-native-ask.mjs",
      "scripts/resolve-work-queue.mjs",
      "scripts/check-work-queue.mjs",
      "scripts/resolve-hook-orchestration.mjs",
      "scripts/check-hook-orchestration.mjs",
      "scripts/resolve-hook-policy.mjs",
      "scripts/check-hook-policy.mjs",
      "scripts/resolve-review-surface.mjs",
      "scripts/check-review-surface.mjs",
      "scripts/resolve-delivery-path.mjs",
      "scripts/check-delivery-path.mjs",
      "scripts/resolve-debt-handoff.mjs",
      "scripts/check-debt-handoff.mjs",
      "scripts/resolve-execution-closure.mjs",
      "scripts/check-execution-closure.mjs",
      "scripts/resolve-standard-baseline.mjs",
      "scripts/check-standard-baseline-pack.mjs",
      "scripts/check-standard-baseline-selection.mjs",
      "scripts/resolve-baseline-packs.mjs",
      "scripts/check-baseline-pack-selection.mjs",
      "scripts/lib/artifact-schema.mjs",
      "scripts/lib/frontmatter.mjs",
      "scripts/lib/manifest.mjs",
      "scripts/new-workflow-item.mjs",
      "scripts/new-workflow-item/cli.mjs",
      "scripts/new-workflow-item/fillers.mjs",
      "scripts/new-workflow-item/fillers/baseline.mjs",
      "scripts/new-workflow-item/fillers/frontmatter.mjs",
      "scripts/new-workflow-item/fillers/governance.mjs",
      "scripts/new-workflow-item/fillers/reporting.mjs",
      "scripts/new-workflow-item/fillers/review.mjs",
      "scripts/new-workflow-item/fillers/routing.mjs",
      "scripts/new-workflow-item/fillers/workflow.mjs",
      "scripts/new-workflow-item/references.mjs",
      "scripts/new-workflow-item/registry.mjs",
      "scripts/workflow-next.mjs",
      "docs/project-onboarding.md",
      "docs/project-profile.md",
      "docs/tech-stack-strategy.md",
      "docs/business-spec-index.md",
      "docs/sample-policy.md",
      "docs/onboarding-decisions.md",
      "docs/verification-matrix.md",
      "docs/engineering-baseline.md",
      "docs/environment-baseline.md",
      "baseline-recommendations",
      "baseline-gap-reports",
      "review-packets",
      "gpt-review-prompts",
      "review-loop-reports",
      "goal-cards",
      "subagent-run-plans",
      "status-reports",
      "decision-briefs",
      "review-summaries",
      "customer-handoffs",
      "follow-up-proposals",
      "final-reports",
      "active-work-threads",
      "guided-decision-summaries",
      "change-boundary-reports",
      "baseline-state-reports",
      "workflow-adoption-maps",
      "doc-lifecycle-reports",
      "archive-apply-plans",
      "apply-plans",
      "apply-execution-plans",
      "apply-receipts",
      "apply-readiness-reports",
      "beginner-entry-cards",
      "conversation-ask-cards",
      "work-queue",
      "hook-orchestration-plans",
      "hook-policies",
      "review-surface-cards",
      "delivery-path-reports",
      "debt-handoff-reports",
      "execution-closures",
      "standard-baseline-selections",
      "baseline-pack-selections",
      ".github/pull_request_template.md",
      ".github/workflows/ai-workflow-checks.yml",
    ] }),
  };
  version.managedAssetDigests = managedAssetDigestsForVersion(targetPath, version.workflowAssets, existing, options.actions || []);
  return version;
}

function managedAssetDigestsForVersion(targetPath, workflowAssets, existing, actions) {
  const declared = (relative) => (workflowAssets || []).some((value) => {
    const managed = String(value || "").replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
    return managed && (relative === managed || relative.startsWith(`${managed}/`));
  });
  const digests = {};
  for (const [relative, digest] of Object.entries(existing?.managedAssetDigests || {})) {
    if (!declared(relative) || !/^sha256:[a-f0-9]{64}$/.test(String(digest || ""))) continue;
    const current = sha256File(path.join(targetPath, relative));
    if (current === digest) digests[relative] = digest;
  }
  for (const action of actions) {
    const relative = String(action?.path || "").replaceAll("\\", "/");
    if (!relative || relative === ".intentos/version.json" || !declared(relative)) continue;
    const expected = action.willWrite ? action.expectedHashAfter : action.hashBefore;
    const owned = action.type === "CREATE"
      || action.ownership?.state === "VERIFIED_PRIOR_INTENTOS_MANAGED"
      || ["RECONCILE_PRESERVE", "BACKUP_THEN_RECONCILE"].includes(action.type);
    if (owned && /^sha256:[a-f0-9]{64}$/.test(String(expected || ""))) digests[relative] = expected;
  }
  return Object.fromEntries(Object.entries(digests).sort(([left], [right]) => left.localeCompare(right)));
}

function writeVersionFile(targetPath, starter, options = {}) {
  options = { ...options, targetPath };
  const versionDir = path.join(targetPath, ".intentos");
  fs.mkdirSync(versionDir, { recursive: true });
  const versionPath = path.join(versionDir, "version.json");
  const existed = fs.existsSync(versionPath);
  const version = buildVersionRecord(targetPath, starter, options);
  if (existed) backupFileIfNeeded(versionPath, options);
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), versionPath)}`);
}


function sha256File(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  const hash = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  const fd = fs.openSync(filePath, "r");
  try {
    let bytesRead;
    do {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(fd);
  }
  return `sha256:${hash.digest("hex")}`;
}

function sha256Content(content) {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}


function preferredAgentEntry(targetPath) {
  for (const relative of ["AGENTS.md", "agent.md", ".agent.md"]) {
    const candidate = path.join(targetPath, relative);
    let stat;
    try {
      stat = fs.lstatSync(candidate);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error(`Legacy agent source must be a non-symlink regular file: ${relative}`);
    }
    const root = fs.realpathSync(targetPath);
    const real = fs.realpathSync(candidate);
    const resolved = path.relative(root, real);
    if (!resolved || resolved.startsWith("..") || path.isAbsolute(resolved)) {
      throw new Error(`Legacy agent source resolves outside the target project: ${relative}`);
    }
    return relative;
  }
  return "AGENTS.md";
}


function snapshotTargetFiles(root, options = {}) {
  const snapshot = new Map();
  if (!fs.existsSync(root)) return snapshot;
  const ignoredDirectories = new Set([".git", "node_modules"]);
  const limits = { files: 100000, bytes: 20 * 1024 * 1024 * 1024, depth: 40 };
  let fileCount = 0;
  let totalBytes = 0;
  const walk = (dir, relativeDir = "", depth = 0) => {
    if (depth > limits.depth) throw new Error(`Target snapshot exceeds maximum depth ${limits.depth}`);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const relative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (options.ignoreRelative?.(relative, entry)) continue;
      if (entry.isSymbolicLink()) {
        snapshot.set(relative, `symlink:${fs.readlinkSync(full)}`);
      } else if (entry.isDirectory()) {
        walk(full, relative, depth + 1);
      } else if (entry.isFile()) {
        fileCount += 1;
        totalBytes += fs.statSync(full).size;
        if (fileCount > limits.files || totalBytes > limits.bytes) {
          throw new Error("Target snapshot exceeds bounded file or byte limits");
        }
        snapshot.set(relative, sha256File(full));
      }
    }
  };
  walk(root);
  return snapshot;
}


function normalizeOutput(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 2000);
}

function isIgnorableNewProjectEntry(name) {
  return name === ".DS_Store"
    || name === ".localized"
    || isGovernedWorkflowOutputPath(name);
}

function assertExistingTargetRootIsSafe(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  if (stat.isSymbolicLink()) {
    throw new Error(`Target root must not be a symlink: ${targetPath}`);
  }
}

export {
  agentGovernanceAppendix,
  agentsGovernanceMigrationReportPath,
  assertExistingTargetRootIsSafe,
  baselineConfigurationForPlan,
  buildVersionRecord,
  copyDir,
  copySharedAssets,
  currentIntentOSVersion,
  fallbackCopyRules,
  installedIndustrialPackIds,
  isIgnorableNewProjectEntry,
  kitRoot,
  normalizeOutput,
  parseArgs,
  parseIndustrialPackIds,
  preferredAgentEntry,
  pullRequestTemplateMigrationReportPath,
  readExistingStarter,
  readJsonIfExists,
  requiredAgentGovernanceMarkers,
  requiredPullRequestTemplateMarkers,
  resolvePullRequestTemplateSource,
  selectedIndustrialPackIdsFromProject,
  sha256Content,
  sha256File,
  validateControlledApplyReceipt,
  snapshotTargetFiles,
  writeVersionFile
};
