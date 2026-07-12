#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "./lib/manifest.mjs";
import { evidenceDigest, extractMachineReadableEvidence, loadSchema, validateSchema } from "./lib/artifact-schema.mjs";
import {
  formatActionId,
  initExecutableActions,
  isWorkflowActivationState,
  validateApprovalRecordForInitApplyPlan,
  validateReadinessForInitApplyPlan,
  validateReadinessPlanReview,
} from "./lib/adoption-apply-chain.mjs";
import { projectIdentity } from "./lib/evidence-authority.mjs";
import {
  normalizeBaselineLevel,
  parseSelectionIds,
  renderBaselineEvidence,
  renderBaselineSelection,
  renderProjectProfile,
  resolveBaselineConfiguration,
} from "./lib/baseline-selection.mjs";
import {
  assertInsideRoot,
  assertNoSymlinkInPath,
  assertSafeNameSegment,
  assertSafeRelativePath,
  assertSafeWritePath,
  resolveBackupRoot,
  resolveUnderRoot,
} from "./lib/path-safety.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const currentIntentOSVersion = readCurrentVersion();
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
    .filter(Boolean))].sort();
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
  const profiles = parseSelectionIds(options.profiles).length > 0
    ? options.profiles
    : selectedListFromProjectDoc(targetPath, "project-profile.md", "Selected Profiles").join(",");
  const standardPacks = parseSelectionIds(options.standardPacks).length > 0
    ? options.standardPacks
    : selectedListFromProjectDoc(targetPath, "baseline-selection.md", "Selected Standard Packs").join(",");
  const industrialPacks = parseSelectionIds(options.industrialPacks).length > 0
    ? options.industrialPacks
    : selectedIndustrialPackIdsFromProject(targetPath).join(",");
  const config = resolveBaselineConfiguration(kitRoot, {
    starter: options.starter,
    baselineLevel: options.baselineLevel || selectedBaselineLevelFromProject(targetPath),
    profiles,
    standardPacks,
    industrialPacks,
  });
  assertExistingBaselineConfigurationCompatible(targetPath, config);
  return config;
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
  if (level && level !== config.baselineLevel) {
    throw new Error("Existing baseline level conflicts with the requested selection; run existing-rule reconciliation before changing it");
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
    if (fs.existsSync(selectionFile) && JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Existing ${heading.toLowerCase()} are incomplete or conflicting; run existing-rule reconciliation before changing them`);
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
    "- [ ] Controlled Apply Readiness is linked or marked not applicable after a Unified Apply Plan is reviewed and before any future human-approved controlled apply step",
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

function migrationHumanDecisionSummary({ status, targetLabel, applyCommand }) {
  const recommended = status === "PENDING_HUMAN_APPROVAL"
    ? "B - Review and merge deliberately"
    : "A - Keep current resolved state";
  const canContinue = status === "PENDING_HUMAN_APPROVAL" ? "limited" : "yes";
  const need = status === "PENDING_HUMAN_APPROVAL"
    ? `Approve, reject, or manually merge the proposed ${targetLabel} governance appendix.`
    : `No decision is needed for ${targetLabel} at this status.`;
  return [
    "## Human Decision Summary",
    "",
    `Conclusion: ${targetLabel} governance migration status is ${status}.`,
    "",
    `Recommended choice: ${recommended}`,
    "",
    `Can AI continue now: ${canContinue}`,
    "",
    `What I need from you: ${need}`,
    "",
    "| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |",
    "|---|---|---|---|---|---|",
    `| A | Keep migration pending | Leave ${targetLabel} unchanged and keep this report as the decision record | Report only | low | Choose when you are not ready to change governance |`,
    `| B | Review and merge deliberately | Explain the appendix and wait for explicit approval or manual merge | No direct write until approved | medium | Choose when existing governance should be preserved while adopting selected rules |`,
    `| C | Apply approved migration | Run \`${applyCommand}\` | Yes, ${targetLabel} only | medium/high | Choose only after reviewing the proposed appendix |`,
    `| D | Reject migration | Keep current ${targetLabel} and document that the appendix is not accepted | Report only | low/medium | Choose when governance belongs elsewhere |`,
    "",
    "Recommended reason: Governance files define how Codex and reviewers operate, so changes need explicit human approval or manual merge.",
    "",
    "What happens if you do nothing: The migration remains pending and full workflow checks may continue to block until it is resolved.",
    "",
  ];
}

function writePullRequestTemplateMigrationReport(targetPath, missingMarkers, options = {}) {
  const status = options.status || (options.applied ? "APPLIED" : "PENDING_HUMAN_APPROVAL");
  const reportPath = pullRequestTemplateMigrationReportPath(targetPath);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const existed = fs.existsSync(reportPath);
  const statusNotes = {
    PENDING_HUMAN_APPROVAL: "The PR template was left unchanged. Review the proposed appendix before applying it.",
    APPLIED: "The proposed appendix was applied by explicit command approval.",
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
        "The update command does not modify an existing project PR template unless the human explicitly approves that migration.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After human review, either merge the proposed appendix manually or run:",
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
    ...migrationHumanDecisionSummary({
      status,
      targetLabel: "PR template",
      applyCommand: "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-pr-template-governance",
    }),
    "## Status Notes",
    "",
    statusNotes[status] || statusNotes.PENDING_HUMAN_APPROVAL,
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
      if (report.includes("PENDING_HUMAN_APPROVAL")) {
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
  console.log(`updated ${path.relative(process.cwd(), dest)} with AI workflow governance appendix after explicit approval`);
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
      "Use `.intentos/prompts/project-onboarding-agent.md` and `.intentos/core/project-onboarding.md` to draft project onboarding docs. AI drafts; humans decide.",
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
      "Codex may follow existing local patterns for low-risk local changes. Codex must not create or upgrade project-wide engineering conventions without a documented project source of truth or human approval. If the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns.",
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
      "Codex may draft missing environment facts as `PENDING_CONFIRMATION` and mark irrelevant items as `NOT_APPLICABLE`. Codex must not create or edit `.env`, record secret values, invent production/release/rollback/monitoring facts, or change CI/CD, deployment, or production config without explicit approval.",
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
      "Use `node scripts/resolve-platform-baseline.mjs .` to inspect the effective baseline. Use strict mode only after humans confirm selected profiles and project docs.",
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
      "Concrete industrial packs are installed only when selected or explicitly requested with `init-project --industrial-packs <pack-id>`. Do not treat BL2 or any industrial pack as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and `check-industrial-baseline` is ready. Use `.intentos/templates/baseline-selection.md` and `.intentos/templates/baseline-evidence.md` as project docs only after that decision.",
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
      "For high-risk implementation, run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` after `Human Approval` records status and scope.",
      "",
      "If artifact quality fails, fix the workflow artifacts before writing code.",
      "",
      "When independent review is needed, create a review packet with `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` and fill evidence, diff summary, risks, and open questions before handing it to a human reviewer or second model.",
      "",
      "For L2/L3 work or when review creates findings, create `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` to record review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items. AUTO_FIX is limited to 2 rounds and cannot change scope, risk acceptance, Human Approval, architecture, dependencies, migrations, production config, release, or rollback decisions.",
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
      "Reviewer agents are read-only. Codex may auto-fix only deterministic, low-risk findings inside approved task scope, for at most 2 rounds. Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to humans.",
      "",
    ].join("\n")],
    ["Bounded Next-Step", [
      "## Bounded Next-Step",
      "",
      "Use `.intentos/core/next-step-boundary.md` for every task final report, review summary, and follow-up suggestion.",
      "",
      "Codex may suggest next steps, but suggestions must be bounded, classified, and actionable. Suggestions must use one of: `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`.",
      "",
      "Only `IN_SCOPE_NEXT_STEP` may be done inside the current task, and only when it stays inside approved scope and needs no new approval. All other suggestion types require a new request, follow-up proposal, human decision, or explicit stop.",
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
      "Codex may recommend candidate packs, but it must not enable BL2, select all packs, treat draft packs as stable, or treat pack files as real project evidence without explicit human decision. Standard packs are normal engineering guardrails; industrial packs are optional BL2 overlays.",
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
      "Controlled Apply Readiness checks whether the plan is low-risk, bounded, reversible, verifiable, and still requires explicit human approval. It does not execute writes, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive files, change source of truth, enable industrial packs, or approve high-risk decisions.",
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
      "Use `.intentos/core/approval-record-governance.md` and `.intentos/docs/approval-record-governance.md` only after a Unified Apply Plan and readiness report exist and a human gives explicit approval for exact action IDs.",
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
      "Codex may run H0 read-only checks and create H1 suggestions, but must not install hooks, modify CI, add blocking gates, call external APIs, enable auto-fix, or change release behavior without human approval.",
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
      "Stop and ask before changing production release paths, secrets, auth, permission policy, database schema, destructive data operations, production data access, infrastructure, or other irreversible or security-sensitive behavior.",
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
      "Use `automation-proposals/` and `.intentos/templates/project-automation-proposal.md` before creating or updating any Codex App automation. Do not create, update, resume, delete, or enable automations without explicit human approval for the exact project root, schedule, prompt, allowed writes, and initial status.",
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
  const status = options.status || (options.applied ? "APPLIED" : "PENDING_HUMAN_APPROVAL");
  const reportPath = agentsGovernanceMigrationReportPath(targetPath);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const existed = fs.existsSync(reportPath);
  const statusNotes = {
    PENDING_HUMAN_APPROVAL: "The AGENTS.md file was left unchanged. Review the proposed governance appendix before applying it.",
    APPLIED: "The proposed governance appendix was applied by explicit command approval.",
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
        "The update command does not modify an existing project AGENTS.md unless the human explicitly approves that migration.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After human review, either merge the proposed appendix manually or run:",
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
    ...migrationHumanDecisionSummary({
      status,
      targetLabel: "AGENTS.md",
      applyCommand: "node intentos/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-agent-governance",
    }),
    "## Status Notes",
    "",
    statusNotes[status] || statusNotes.PENDING_HUMAN_APPROVAL,
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
      if (report.includes("PENDING_HUMAN_APPROVAL")) {
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
  console.log(`updated ${path.relative(process.cwd(), dest)} with AI workflow governance appendix after explicit approval`);
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
  return version;
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

function planRunId(createdAt) {
  return createdAt.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function enrichExecutionActions(actions, targetPath, options, createdAt, receiptPath) {
  const backupRoot = options.backupDir || `.intentos/backups/${planRunId(createdAt)}`;
  for (const action of actions) {
    action.executionSupported = true;
    if (!action.willWrite) {
      action.sourceHash = action.source ? sha256File(path.join(kitRoot, action.source)) : null;
      action.expectedHashAfter = action.hashBefore;
      continue;
    }
    if (action.source) {
      const sourcePath = resolveUnderRoot(kitRoot, action.source, "plan action source");
      action.sourceHash = sha256File(sourcePath);
      action.expectedHashAfter = action.sourceHash;
    } else if (typeof action.inlineContentBase64 === "string") {
      const content = Buffer.from(action.inlineContentBase64, "base64");
      action.sourceHash = sha256Content(content);
      action.expectedHashAfter = action.sourceHash;
    } else if (action.path.endsWith("/.gitkeep")) {
      action.inlineContentBase64 = Buffer.from("").toString("base64");
      action.sourceHash = sha256Content("");
      action.expectedHashAfter = action.sourceHash;
    } else if (action.path === ".intentos/version.json") {
      const record = buildVersionRecord(targetPath, options.starter, {
        update: options.update,
        baselineConfig: options.baselineConfig,
        projectEntryOrigin: options.projectEntryOrigin,
      }, createdAt);
      const content = `${JSON.stringify(record, null, 2)}\n`;
      action.inlineContentBase64 = Buffer.from(content).toString("base64");
      action.sourceHash = sha256Content(content);
      action.expectedHashAfter = action.sourceHash;
    } else {
      action.executionSupported = false;
      action.sourceHash = null;
      action.expectedHashAfter = null;
    }
    if (action.hashBefore) {
      action.backupPath = assertSafeRelativePath(`${backupRoot}/${action.path}`, "plan action backup path");
    }
  }
  actions.push({
    type: "WRITE_APPLY_RECEIPT",
    path: receiptPath,
    source: null,
    reason: "runtime apply and activation evidence",
    willWrite: true,
    hashBefore: sha256File(path.join(targetPath, receiptPath)),
    sourceHash: null,
    expectedHashAfter: null,
    executionSupported: true,
    dynamicReceipt: true,
  });
}

function boundControlledAdoptionActions(actions) {
  for (const action of actions) {
    if (!action.willWrite) {
      if (action.type === "NEEDS_HUMAN_APPROVAL") {
        action.originalType = action.type;
        action.type = "HUMAN_ONLY";
        action.executionSupported = false;
        action.reason = `${action.reason}; excluded from the bounded 1.92 controlled apply graph`;
      }
      continue;
    }
    if (action.type === "WRITE_APPLY_RECEIPT") continue;
    if (action.executionSupported === true && !isForbiddenControlledApplyAction(action)) continue;
    action.originalType = action.type;
    action.type = "HUMAN_ONLY";
    action.willWrite = false;
    action.executionSupported = false;
    action.reason = `${action.reason}; excluded from the bounded 1.92 controlled apply graph`;
    action.backupPath = null;
  }
}

function planDigest(plan) {
  const normalized = JSON.stringify(sortForStableJson(omitPlanDigest(plan)));
  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`;
}

function omitPlanDigest(value) {
  if (Array.isArray(value)) return value.map(omitPlanDigest);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "planDigest")
    .map(([key, child]) => [key, omitPlanDigest(child)]));
}

function sortForStableJson(value) {
  if (Array.isArray(value)) return value.map(sortForStableJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value)
    .sort()
    .map((key) => [key, sortForStableJson(value[key])]));
}

function walkSourceFiles(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) return [];
  const results = [];
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    const full = path.join(sourceRoot, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSourceFiles(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results.sort();
}

function gitFingerprint(targetPath) {
  const gitCheck = spawnSync("git", ["-C", targetPath, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  if (gitCheck.status !== 0 || gitCheck.stdout.trim() !== "true") {
    return {
      isGitRepository: false,
      gitBranch: null,
      gitHead: null,
      isDirty: false,
      changedFileCount: 0,
      changedFilesSample: [],
    };
  }
  const branch = spawnSync("git", ["-C", targetPath, "branch", "--show-current"], { encoding: "utf8" });
  const head = spawnSync("git", ["-C", targetPath, "rev-parse", "HEAD"], { encoding: "utf8" });
  const status = spawnSync("git", [
    "-C", targetPath, "status", "--short", "--", ".",
    ":(exclude)apply-execution-plans/**",
    ":(exclude)approval-records/**",
    ":(exclude)release-approval-records/**",
    ":(exclude)apply-readiness-reports/**",
    ":(exclude)apply-receipts/**",
    ":(exclude).intentos/backups/**",
  ], { encoding: "utf8" });
  const changedFiles = status.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  return {
    isGitRepository: true,
    gitBranch: branch.status === 0 ? branch.stdout.trim() || null : null,
    gitHead: head.status === 0 ? head.stdout.trim() || null : null,
    isDirty: changedFiles.length > 0,
    changedFileCount: changedFiles.length,
    changedFilesSample: changedFiles.slice(0, 20),
  };
}

function addFilePlanAction(actions, targetPath, sourcePath, targetRel, options = {}) {
  const safeTargetRel = assertSafeRelativePath(targetRel, "plan action target path");
  const destPath = assertSafeWritePath(targetPath, safeTargetRel, "plan action target path");
  const existed = fs.existsSync(destPath);
  const overwrite = Boolean(options.overwrite);
  const sourceRel = assertSafeRelativePath(path.relative(kitRoot, sourcePath).replaceAll(path.sep, "/"), "plan action source path");
  let type;
  if (!existed) type = "CREATE";
  else if (sha256File(destPath) === sha256File(sourcePath)) type = "SKIP_EXISTING";
  else if (!overwrite) type = "SKIP_EXISTING";
  else type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  actions.push({
    type,
    path: safeTargetRel,
    source: sourceRel,
    reason: options.reason || "managed workflow asset",
    willWrite: type !== "SKIP_EXISTING",
    hashBefore: sha256File(destPath),
  });
}

function addGeneratedFilePlanAction(actions, targetPath, targetRel, content, options = {}) {
  const safeTargetRel = assertSafeRelativePath(targetRel, "generated plan action target path");
  const destPath = assertSafeWritePath(targetPath, safeTargetRel, "generated plan action target path");
  const existed = fs.existsSync(destPath);
  const currentHash = sha256File(destPath);
  const nextHash = sha256Content(content);
  let type;
  if (!existed) type = "CREATE";
  else if (currentHash === nextHash) type = "SKIP_EXISTING";
  else if (!options.overwrite) type = "SKIP_EXISTING";
  else type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  actions.push({
    type,
    path: safeTargetRel,
    source: null,
    reason: options.reason || "plan-bound generated project record",
    willWrite: type !== "SKIP_EXISTING",
    hashBefore: currentHash,
    inlineContentBase64: Buffer.from(content).toString("base64"),
  });
}

function addDirectoryPlanActions(actions, targetPath, sourceDir, targetRel, options = {}) {
  for (const sourceFile of walkSourceFiles(sourceDir)) {
    const nestedRel = path.relative(sourceDir, sourceFile).replaceAll(path.sep, "/");
    const targetFile = targetRel === "." || targetRel === "" ? nestedRel : `${targetRel}/${nestedRel}`;
    addFilePlanAction(actions, targetPath, sourceFile, targetFile, options);
  }
}

function addWorkflowDirPlanActions(actions, targetPath) {
  const dirs = manifestGroup(kitRoot, "workflowDirs", { fallback: [] });
  for (const dir of dirs) {
    const keepRel = `${dir}/.gitkeep`;
    const keepPath = path.join(targetPath, keepRel);
    actions.push({
      type: fs.existsSync(keepPath) ? "SKIP_EXISTING" : "CREATE",
      path: keepRel,
      source: null,
      reason: "workflow directory marker",
      willWrite: !fs.existsSync(keepPath),
      hashBefore: sha256File(keepPath),
    });
  }
}

function addOnboardingDocPlanActions(actions, targetPath) {
  for (const docName of [
    "project-onboarding.md",
    "project-profile.md",
    "tech-stack-strategy.md",
    "business-spec-index.md",
    "sample-policy.md",
    "onboarding-decisions.md",
    "verification-matrix.md",
    "engineering-baseline.md",
    "environment-baseline.md",
  ]) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, "templates", docName), `docs/${docName}`, {
      overwrite: false,
      reason: "project onboarding document",
    });
  }
}

function addBaselineConfigurationPlanActions(actions, targetPath, config, options = {}) {
  if (!config?.configured) return;
  const projectName = path.basename(targetPath) || "project";
  const generated = [
    ["docs/project-profile.md", renderProjectProfile(config, { projectName })],
    ["docs/baseline-selection.md", renderBaselineSelection(config)],
    ["docs/baseline-evidence.md", renderBaselineEvidence(config)],
  ];
  for (const [targetRel, content] of generated) {
    addGeneratedFilePlanAction(actions, targetPath, targetRel, content, {
      overwrite: false,
      backupDir: options.backupDir,
      reason: "selected baseline configuration bound to controlled init plan",
    });
  }
}

function addIndustrialPlanActions(actions, targetPath, options = {}) {
  const sourceRoot = path.join(kitRoot, "industrial-packs");
  const addRegistry = (source, target) => addFilePlanAction(actions, targetPath, path.join(sourceRoot, source), `.intentos/industrial-packs/${target}`, {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack registry asset",
  });
  addRegistry("README.md", "README.md");
  addRegistry("selection-guide.md", "selection-guide.md");
  addRegistry("index.json", "index.json");
  addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, "schema"), ".intentos/industrial-packs/schema", {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack schema asset",
  });
  if (options.withIndustrialPacks) {
    addDirectoryPlanActions(actions, targetPath, sourceRoot, ".intentos/industrial-packs", {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "explicit full industrial pack install",
    });
    return;
  }
  const sourceIndex = readJsonIfExists(path.join(sourceRoot, "index.json"));
  const explicitPacks = parseIndustrialPackIds(options.industrialPacks);
  const selectedPacks = options.update ? selectedIndustrialPackIdsFromProject(targetPath) : [];
  const installedPacks = options.update ? installedIndustrialPackIds(targetPath, sourceIndex) : [];
  const packIds = [...new Set([...explicitPacks, ...selectedPacks, ...installedPacks])].sort();
  const entriesById = new Map((sourceIndex?.packs || []).map((entry) => [entry.id, entry]));
  for (const packId of packIds) {
    const entry = entriesById.get(packId);
    if (!entry || entry.status === "planned" || !entry.path) {
      actions.push({
        type: "FORBIDDEN",
        path: `.intentos/industrial-packs/${packId}`,
        source: null,
        reason: `industrial pack is not executable: ${packId}`,
        willWrite: false,
        hashBefore: null,
      });
      continue;
    }
    addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, entry.path), `.intentos/industrial-packs/${entry.path}`, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: `selected industrial pack: ${packId}`,
    });
  }
}

function addGovernancePlanActions(actions, targetPath, starter, options = {}) {
  const agentEntry = preferredAgentEntry(targetPath);
  if (agentEntry !== "AGENTS.md") {
    for (let index = actions.length - 1; index >= 0; index -= 1) {
      if (actions[index]?.path === "AGENTS.md") actions.splice(index, 1);
    }
  }
  const agentsPath = path.join(targetPath, agentEntry);
  if (!fs.existsSync(agentsPath)) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, "platforms", "codex", "AGENTS.template.md"), "AGENTS.md", {
      overwrite: false,
      reason: "missing AGENTS.md governance file",
    });
  } else {
    const content = fs.readFileSync(agentsPath, "utf8");
    const missingMarkers = requiredAgentGovernanceMarkers.filter((marker) => !content.includes(marker));
    if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: agentEntry, source: null, reason: `${agentEntry} already has required governance markers`, willWrite: false, hashBefore: sha256File(agentsPath) });
    } else if (options.applyAgentGovernance) {
      const merged = `${content.trimEnd()}\n\n${agentGovernanceAppendix(missingMarkers).trim()}\n`;
      actions.push({
        type: options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED",
        path: agentEntry,
        source: null,
        inlineContentBase64: Buffer.from(merged).toString("base64"),
        reason: `explicit ${agentEntry} governance apply`,
        willWrite: true,
        hashBefore: sha256File(agentsPath),
      });
    } else {
      actions.push({ type: "NEEDS_HUMAN_APPROVAL", path: agentEntry, source: null, reason: `missing markers: ${missingMarkers.join(", ")}`, willWrite: false, hashBefore: sha256File(agentsPath) });
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".intentos/migration-reports/agents-governance.md", source: null, reason: `${agentEntry} governance migration report`, willWrite: true, hashBefore: sha256File(agentsGovernanceMigrationReportPath(targetPath)) });
    }
  }

  const prPath = path.join(targetPath, ".github", "pull_request_template.md");
  if (!fs.existsSync(prPath)) {
    addFilePlanAction(actions, targetPath, resolvePullRequestTemplateSource(starter), ".github/pull_request_template.md", {
      overwrite: false,
      reason: "missing pull request template",
    });
  } else {
    const content = fs.readFileSync(prPath, "utf8");
    const missingMarkers = requiredPullRequestTemplateMarkers.filter((marker) => !content.includes(marker));
    if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: ".github/pull_request_template.md", source: null, reason: "PR template already has required governance markers", willWrite: false, hashBefore: sha256File(prPath) });
    } else if (options.applyPrTemplateGovernance) {
      actions.push({ type: options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED", path: ".github/pull_request_template.md", source: null, reason: "explicit PR template governance apply", willWrite: true, hashBefore: sha256File(prPath) });
    } else {
      actions.push({ type: "NEEDS_HUMAN_APPROVAL", path: ".github/pull_request_template.md", source: null, reason: `missing markers: ${missingMarkers.join(", ")}`, willWrite: false, hashBefore: sha256File(prPath) });
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".intentos/migration-reports/pr-template-governance.md", source: null, reason: "PR template governance migration report", willWrite: true, hashBefore: sha256File(pullRequestTemplateMigrationReportPath(targetPath)) });
    }
  }
}

function preferredAgentEntry(targetPath) {
  for (const relative of ["AGENTS.md", "agent.md", ".agent.md"]) {
    if (fs.existsSync(path.join(targetPath, relative))) return relative;
  }
  return "AGENTS.md";
}

function buildPlan(targetPath, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, options.backupDir);
  const operation = options.update ? "UPDATE_WORKFLOW_ASSETS" : "INIT_PROJECT";
  const actions = [];
  const baselineConfig = baselineConfigurationForPlan(targetPath, options);
  const projectEntryOrigin = fs.existsSync(targetPath)
    && fs.statSync(targetPath).isDirectory()
    && fs.readdirSync(targetPath).some((entry) => !isIgnorableNewProjectEntry(entry))
    ? "EXISTING_PROJECT"
    : "NEW_PROJECT";
  options = { ...options, baselineConfig, projectEntryOrigin };
  if (!options.update) {
    addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, "starters", options.starter), ".", {
      overwrite: false,
      reason: "starter asset",
    });
  }
  const copyRules = manifestCopyRules(kitRoot, { fallback: fallbackCopyRules() });
  for (const rule of copyRules.directories || []) {
    addDirectoryPlanActions(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest directory copy rule",
    });
  }
  for (const rule of copyRules.files || []) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, rule.source), rule.target, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: "manifest file copy rule",
    });
  }
  addIndustrialPlanActions(actions, targetPath, options);
  addOnboardingDocPlanActions(actions, targetPath);
  addBaselineConfigurationPlanActions(actions, targetPath, baselineConfig, options);
  addGovernancePlanActions(actions, targetPath, options.starter, options);
  addWorkflowDirPlanActions(actions, targetPath);
  actions.push({
    type: fs.existsSync(path.join(targetPath, ".intentos", "version.json"))
      ? (options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED")
      : "CREATE",
    path: ".intentos/version.json",
    source: null,
    reason: "workflow version record",
    willWrite: true,
    hashBefore: sha256File(path.join(targetPath, ".intentos", "version.json")),
  });
  collapseDuplicateTargetActions(actions);
  const createdAt = new Date().toISOString();
  const receiptPath = `apply-receipts/${planRunId(createdAt)}.md`;
  enrichExecutionActions(actions, targetPath, options, createdAt, receiptPath);
  boundControlledAdoptionActions(actions);
  assignPlanActionIds(actions);

  const targetFingerprint = createTargetFingerprint(targetPath, actions);
  const plan = {
    planVersion: "1.1",
    intentOSVersion: currentIntentOSVersion,
    manifestVersion: readJsonIfExists(path.join(kitRoot, "intentos-manifest.json"))?.intentOSVersion || currentIntentOSVersion,
    manifestDigest: sha256File(path.join(kitRoot, "intentos-manifest.json")),
    operation,
    targetRoot: targetPath,
    createdAt,
    projectIdentity: projectIdentity(targetPath),
    receiptPath,
    arguments: {
      starter: options.starter,
      updateWorkflowAssets: Boolean(options.update),
      applyPrTemplateGovernance: Boolean(options.applyPrTemplateGovernance),
      applyAgentGovernance: Boolean(options.applyAgentGovernance),
      withIndustrialPacks: Boolean(options.withIndustrialPacks),
      industrialPacks: options.industrialPacks || "",
      profiles: baselineConfig.profiles,
      baselineLevel: baselineConfig.baselineLevel,
      standardPacks: baselineConfig.standardPacks,
      selectedIndustrialPacks: baselineConfig.industrialPacks,
      backupDir: options.backupDir || null,
      controlledAdoption: true,
    },
    targetFingerprint,
    expectedPreconditions: {
      targetExists: fs.existsSync(targetPath),
      fileHashes: targetFingerprint.fileHashes,
    },
    actions,
  };
  plan.receiptActionId = actions.find((action) => action.type === "WRITE_APPLY_RECEIPT")?.id || null;
  plan.planDigest = planDigest(plan);
  return plan;
}

function assignPlanActionIds(actions) {
  actions.forEach((action, index) => {
    if (!action.id) action.id = formatActionId(index + 1);
  });
}

function collapseDuplicateTargetActions(actions) {
  const lastIndexByPath = new Map();
  actions.forEach((action, index) => {
    if (action?.path) lastIndexByPath.set(action.path, index);
  });
  const collapsed = actions.filter((action, index) => !action?.path || lastIndexByPath.get(action.path) === index);
  actions.splice(0, actions.length, ...collapsed);
}

function createTargetFingerprint(targetPath, actions) {
  const fileHashes = {};
  for (const action of actions) {
    if (!action.path) continue;
    let rel;
    try {
      rel = assertSafeRelativePath(action.path, "plan fingerprint action path");
    } catch {
      continue;
    }
    const full = assertSafeWritePath(targetPath, rel, "plan fingerprint action path");
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      fileHashes[rel] = sha256File(full);
    }
  }
  return {
    targetExists: fs.existsSync(targetPath),
    ...gitFingerprint(targetPath),
    sourceStateDigest: targetSourceStateDigest(targetPath),
    fileHashes,
  };
}

function targetSourceStateDigest(targetPath) {
  if (!fs.existsSync(targetPath)) return sha256Content("TARGET_MISSING");
  const ignored = [
    ".git/",
    "node_modules/",
    "apply-execution-plans/",
    "approval-records/",
    "release-approval-records/",
    "apply-readiness-reports/",
    "apply-receipts/",
    ".intentos/apply-plans/",
    ".intentos/backups/",
  ];
  const rows = [];
  const ignoreRelative = (relative) => {
    const normalized = relative.replaceAll(path.sep, "/");
    return ignored.some((prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix));
  };
  for (const [relative, digest] of snapshotTargetFiles(targetPath, { ignoreRelative })) {
    const normalized = relative.replaceAll(path.sep, "/");
    rows.push(`${normalized}:${digest}`);
  }
  return sha256Content(rows.sort().join("\n"));
}

function validatePlanForApply(plan, backupDirOverride = null) {
  if (!plan || plan.planVersion !== "1.1") {
    throw new Error("Invalid plan: planVersion must be 1.1; regenerate the plan with IntentOS 1.92+");
  }
  if (!["INIT_PROJECT", "UPDATE_WORKFLOW_ASSETS"].includes(plan.operation)) {
    throw new Error(`Invalid plan operation: ${plan.operation}`);
  }
  if (plan.intentOSVersion !== currentIntentOSVersion) {
    throw new Error(`Plan intentOSVersion ${plan.intentOSVersion} does not match current ${currentIntentOSVersion}`);
  }
  if (plan.manifestDigest !== sha256File(path.join(kitRoot, "intentos-manifest.json"))) {
    throw new Error("Plan precondition failed: IntentOS manifest changed; regenerate the plan");
  }
  if (plan.projectIdentity?.fingerprint !== projectIdentity(plan.targetRoot).fingerprint) {
    throw new Error("Plan precondition failed: target project identity changed");
  }
  if (!plan.planDigest || plan.planDigest !== planDigest(plan)) {
    throw new Error("Plan precondition failed: planDigest is missing or does not match current plan content; regenerate the plan");
  }
  if (!Array.isArray(plan.actions) || plan.actions.length === 0) {
    throw new Error("Invalid plan: actions must be a non-empty array");
  }
  for (const action of plan.actions) {
    if (!action || typeof action !== "object") {
      throw new Error("Invalid plan: every action must be an object");
    }
    if (action.path) assertSafeRelativePath(action.path, "plan action path");
    if (action.source) assertSafeRelativePath(action.source, "plan action source");
    if (!/^A-[0-9]{3,}$/.test(String(action.id || ""))) {
      throw new Error("Invalid plan: every action must include a stable A-000 style id with at least three digits; regenerate the plan");
    }
    if (action.backupPath) assertSafeRelativePath(action.backupPath, "plan action backup path");
    if (action.willWrite && action.type !== "WRITE_APPLY_RECEIPT" && action.executionSupported !== true) {
      throw new Error(`Plan contains an unsupported generated action ${action.id} for ${action.path}; use a narrower selected migration plan`);
    }
    if (action.willWrite && isForbiddenControlledApplyAction(action)) {
      throw new Error(`Plan contains a human-only or high-risk controlled apply action ${action.id} for ${action.path}`);
    }
    const currentHash = sha256File(assertSafeWritePath(plan.targetRoot, action.path, "plan action target"));
    if (currentHash !== (action.hashBefore || null)) {
      throw new Error(`Plan precondition failed: ${action.path} changed or appeared after planning`);
    }
    if (action.source && action.willWrite) {
      const sourcePath = resolveUnderRoot(kitRoot, action.source, "plan action source");
      if (sha256File(sourcePath) !== action.sourceHash || action.expectedHashAfter !== action.sourceHash) {
        throw new Error(`Plan precondition failed: source for ${action.id} changed`);
      }
    }
  }
  const forbiddenAction = plan.actions.find((action) => action.type === "FORBIDDEN");
  if (forbiddenAction) {
    throw new Error(`Plan contains forbidden action for ${forbiddenAction.path}: ${forbiddenAction.reason}`);
  }
  const backupDir = backupDirOverride || plan.arguments?.backupDir || null;
  if (backupDirOverride && backupDirOverride !== plan.arguments?.backupDir) {
    throw new Error("Plan precondition failed: backupDir override is not allowed after approval");
  }
  if (backupDir) resolveBackupRoot(plan.targetRoot, backupDir);
  const currentFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  if (currentFingerprint.targetExists !== plan.targetFingerprint?.targetExists) {
    throw new Error("Plan precondition failed: target existence changed");
  }
  for (const key of ["isGitRepository", "gitBranch", "gitHead", "isDirty", "changedFileCount"]) {
    if (currentFingerprint[key] !== plan.targetFingerprint?.[key]) {
      throw new Error(`Plan precondition failed: target fingerprint ${key} changed`);
    }
  }
  if (currentFingerprint.sourceStateDigest !== plan.targetFingerprint?.sourceStateDigest) {
    throw new Error("Plan precondition failed: target source state changed after planning");
  }
  const expectedHashes = plan.targetFingerprint?.fileHashes || {};
  for (const [rel, expected] of Object.entries(expectedHashes)) {
    const actual = currentFingerprint.fileHashes[rel] || null;
    if (actual !== expected) {
      throw new Error(`Plan precondition failed: ${rel} changed`);
    }
  }
  return backupDir;
}

function isForbiddenControlledApplyAction(action) {
  const target = String(action?.path || "");
  const reason = String(action?.reason || "");
  return target.startsWith(".github/workflows/")
    || target.startsWith("hooks/")
    || target.startsWith("migrations/")
    || target.startsWith("deploy/")
    || target.startsWith("src/")
    || /^\.env/.test(target)
    || /explicit full industrial pack/i.test(reason);
}

function readApprovalRecordForApply(recordPath) {
  if (!recordPath) {
    throw new Error("Approval record required: rerun with --approval-record <approval-record.md>");
  }
  const fullPath = path.resolve(process.cwd(), recordPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error(`Approval record not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted) {
    throw new Error("Approval record must include Machine-Readable Evidence");
  }
  if (!extracted.ok) {
    throw new Error(`Approval record Machine-Readable Evidence invalid: ${extracted.errors.join("; ")}`);
  }
  const schema = loadSchema(kitRoot, "schemas/artifacts/approval-record.schema.json");
  const validation = validateSchema(extracted.value, schema, { label: "approval record" });
  if (!validation.ok) {
    throw new Error(`Approval record schema validation failed: ${validation.errors.join("; ")}`);
  }
  return { fullPath, evidence: extracted.value };
}

function validateApprovalRecordForApply(plan, approvalRecord, applyPlanFullPath) {
  const errors = validateApprovalRecordForInitApplyPlan(plan, approvalRecord.evidence);
  if (!approvalPlanPathMatches(plan, approvalRecord, applyPlanFullPath)) {
    errors.push("approval record approved_plan.path must resolve to the apply plan being executed");
  }
  if (errors.length > 0) {
    throw new Error(`Approval record precondition failed: ${errors.join("; ")}`);
  }
}

function approvalPlanPathMatches(plan, approvalRecord, applyPlanFullPath) {
  const approvedPath = String(approvalRecord.evidence?.approved_plan?.path || "");
  if (!approvedPath.trim()) return false;
  const candidates = [
    path.resolve(process.cwd(), approvedPath),
    path.resolve(path.dirname(approvalRecord.fullPath), approvedPath),
    path.resolve(plan.targetRoot, approvedPath),
  ];
  return candidates.some((candidate) => path.resolve(candidate) === path.resolve(applyPlanFullPath));
}

function readReadinessReportForApply(recordPath) {
  if (!recordPath) {
    throw new Error("Controlled Apply Readiness Report required: rerun with --readiness-report <readiness-report.md>");
  }
  const fullPath = path.resolve(process.cwd(), recordPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    throw new Error(`Controlled Apply Readiness Report not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) {
    throw new Error("Controlled Apply Readiness Report must include valid Machine-Readable Evidence");
  }
  const schema = loadSchema(kitRoot, "schemas/artifacts/controlled-apply-readiness.schema.json");
  const validation = validateSchema(extracted.value, schema, { label: "controlled apply readiness" });
  if (!validation.ok) {
    throw new Error(`Controlled Apply Readiness schema validation failed: ${validation.errors.join("; ")}`);
  }
  return { fullPath, evidence: extracted.value };
}

function validateReadinessReportForApply(plan, readinessRecord, applyPlanFullPath) {
  const errors = validateReadinessForInitApplyPlan(plan, readinessRecord.evidence);
  errors.push(...validateReadinessPlanReview(plan.targetRoot, readinessRecord.fullPath, readinessRecord.evidence));
  if (!evidencePlanPathMatches(plan, readinessRecord, readinessRecord.evidence?.apply_plan?.path, applyPlanFullPath)) {
    errors.push("controlled apply readiness apply_plan.path must resolve to the execution plan being replayed");
  }
  if (errors.length > 0) {
    throw new Error(`Controlled Apply Readiness precondition failed: ${errors.join("; ")}`);
  }
}

function evidencePlanPathMatches(plan, record, approvedPath, applyPlanFullPath) {
  const value = String(approvedPath || "").trim();
  if (!value) return false;
  const candidates = [
    path.resolve(process.cwd(), value),
    path.resolve(path.dirname(record.fullPath), value),
    path.resolve(plan.targetRoot, value),
  ];
  return candidates.some((candidate) => path.resolve(candidate) === path.resolve(applyPlanFullPath));
}

function requireProjectLocalEvidencePath(targetRoot, filePath, label) {
  const root = fs.existsSync(targetRoot) ? fs.realpathSync(targetRoot) : path.resolve(targetRoot);
  const file = fs.realpathSync(filePath);
  const relative = path.relative(root, file);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must be stored inside the target project before controlled apply`);
  }
  assertNoSymlinkInPath(root, file, label);
  return relative.replaceAll(path.sep, "/");
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

function changedSnapshotPaths(before, after) {
  const keys = new Set([...before.keys(), ...after.keys()]);
  return [...keys].filter((key) => before.get(key) !== after.get(key)).sort();
}

function actionTargetPaths(action) {
  return [action.path, action.backupPath].filter(Boolean);
}

function replayApprovedPlan(plan, context) {
  const beforeSnapshot = snapshotTargetFiles(plan.targetRoot);
  const executable = initExecutableActions(plan);
  const executableIds = new Set(executable.map((item) => item.id));
  const receiptAction = plan.actions.find((action) => action.id === plan.receiptActionId && action.type === "WRITE_APPLY_RECEIPT");
  if (!receiptAction || !executableIds.has(receiptAction.id)) {
    throw new Error("Execution plan is missing its approved receipt action");
  }
  const results = new Map();
  const replayed = [];
  let activation = activationNotRun();
  let unexpectedChangedPaths = [];
  let receiptState = "APPLY_FAILED_NO_WRITE";
  let rollbackAttempted = false;
  let rollbackVerified = true;
  let executionError = null;

  try {
    for (const action of plan.actions) {
      if (!action.willWrite || action.id === receiptAction.id) continue;
      replayed.push(action);
      replayAction(plan, action);
      const hashAfter = sha256File(path.join(plan.targetRoot, action.path));
      if (hashAfter !== action.expectedHashAfter) {
        throw new Error(`Post-write digest mismatch for ${action.id} ${action.path}`);
      }
      results.set(action.id, receiptActionResult(action, "APPLIED", hashAfter));
    }

    const afterReplay = snapshotTargetFiles(plan.targetRoot);
    const allowed = new Set(plan.actions.flatMap(actionTargetPaths));
    unexpectedChangedPaths = changedSnapshotPaths(beforeSnapshot, afterReplay).filter((item) => !allowed.has(item));
    if (unexpectedChangedPaths.length > 0) {
      throw new Error(`Unexpected target writes detected: ${unexpectedChangedPaths.join(", ")}`);
    }

    activation = verifyInstalledWorkflowActivation(plan.targetRoot, plan);
    if (activation.status !== "VERIFIED") {
      throw new Error(`Installed workflow activation failed: ${activation.reason || "unknown error"}`);
    }
    receiptState = "APPLY_VERIFIED";
  } catch (error) {
    executionError = error;
    if (replayed.length > 0) {
      rollbackAttempted = true;
      rollbackVerified = rollbackActions(plan, replayed, results);
      receiptState = rollbackVerified ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_PARTIAL_ROLLBACK_REQUIRED";
    }
  }

  for (const action of plan.actions) {
    if (!action.willWrite || results.has(action.id) || action.id === receiptAction.id) continue;
    results.set(action.id, receiptActionResult(action, "FAILED", sha256File(path.join(plan.targetRoot, action.path))));
  }
  results.set(receiptAction.id, receiptActionResult(receiptAction, "RECEIPT_WRITTEN", "self"));

  let receipt = buildApplyReceipt(plan, context, {
    receiptState,
    actions: executable.map((action) => results.get(action.id)),
    unexpectedChangedPaths,
    activation,
    rollbackAttempted,
    rollbackVerified,
  });
  try {
    writeApplyReceipt(plan, receipt);
  } catch (receiptError) {
    if (!executionError && replayed.length > 0) {
      rollbackAttempted = true;
      rollbackVerified = rollbackActions(plan, replayed, results);
      receiptState = rollbackVerified ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_PARTIAL_ROLLBACK_REQUIRED";
    }
    executionError ||= receiptError;
    results.set(receiptAction.id, receiptActionResult(receiptAction, "FAILED", sha256File(path.join(plan.targetRoot, receiptAction.path))));
    receipt = buildApplyReceipt(plan, context, {
      receiptState,
      actions: executable.map((action) => results.get(action.id)),
      unexpectedChangedPaths,
      activation,
      rollbackAttempted,
      rollbackVerified,
    });
    try {
      writeApplyReceipt(plan, receipt);
    } catch (failureReceiptError) {
      throw new Error(`${executionError.message}; failed to persist failure receipt: ${failureReceiptError.message}`);
    }
  }
  if (executionError) throw new Error(`${executionError.message}; apply receipt: ${plan.receiptPath}`);
  return receipt;
}

function replayAction(plan, action) {
  const target = assertSafeWritePath(plan.targetRoot, action.path, `action ${action.id} target`);
  if (action.backupPath) {
    const backup = assertSafeWritePath(plan.targetRoot, action.backupPath, `action ${action.id} backup`);
    if (fs.existsSync(backup)) throw new Error(`Backup path already exists for ${action.id}: ${action.backupPath}`);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.copyFileSync(target, backup, fs.constants.COPYFILE_EXCL);
    if (sha256File(backup) !== action.hashBefore) throw new Error(`Backup digest mismatch for ${action.id}`);
  }
  let content;
  if (action.source) {
    const source = resolveUnderRoot(kitRoot, action.source, `action ${action.id} source`);
    if (sha256File(source) !== action.sourceHash) throw new Error(`Source digest changed for ${action.id}`);
    content = fs.readFileSync(source);
  } else if (typeof action.inlineContentBase64 === "string") {
    content = Buffer.from(action.inlineContentBase64, "base64");
    if (sha256Content(content) !== action.sourceHash) throw new Error(`Inline content digest mismatch for ${action.id}`);
  } else {
    throw new Error(`Action ${action.id} has no replayable source`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  atomicWriteFile(target, content);
}

function atomicWriteFile(target, content) {
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.intentos-${process.pid}-${Date.now()}.tmp`);
  try {
    fs.writeFileSync(temp, content, { flag: "wx" });
    fs.renameSync(temp, target);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

function rollbackActions(plan, actions, results) {
  let verified = true;
  for (const action of [...actions].reverse()) {
    let actionVerified = true;
    try {
      const target = assertSafeWritePath(plan.targetRoot, action.path, `rollback ${action.id} target`);
      if (action.hashBefore) {
        const backup = assertSafeWritePath(plan.targetRoot, action.backupPath, `rollback ${action.id} backup`);
        if (sha256File(backup) !== action.hashBefore) throw new Error(`Rollback backup digest mismatch for ${action.id}`);
        if (sha256File(target) !== action.hashBefore) atomicWriteFile(target, fs.readFileSync(backup));
      } else if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
      if (action.backupPath) {
        const backup = assertSafeWritePath(plan.targetRoot, action.backupPath, `rollback ${action.id} backup cleanup`);
        if (fs.existsSync(backup)) fs.unlinkSync(backup);
      }
      const hashAfter = sha256File(target);
      if (hashAfter !== (action.hashBefore || null)) {
        actionVerified = false;
        verified = false;
      }
      results.set(action.id, receiptActionResult(action, actionVerified ? "ROLLED_BACK" : "FAILED", hashAfter));
    } catch {
      verified = false;
      results.set(action.id, receiptActionResult(action, "FAILED", sha256File(path.join(plan.targetRoot, action.path))));
    }
  }
  return verified;
}

function verifyInstalledWorkflowActivation(targetRoot, plan) {
  const script = path.join(targetRoot, "scripts", "workflow-next.mjs");
  if (!fs.existsSync(script)) return { ...activationNotRun(), status: "FAILED", reason: "installed workflow-next entry is missing" };
  const trustedWorkflowNext = path.join(kitRoot, "scripts", "workflow-next.mjs");
  if (sha256File(script) !== sha256File(trustedWorkflowNext)) {
    return { ...activationNotRun(), status: "FAILED", reason: "installed workflow-next entry does not match the approved IntentOS source" };
  }
  const versionRecord = readJsonIfExists(path.join(targetRoot, ".intentos", "version.json"));
  if (versionRecord?.intentOSVersion !== plan.intentOSVersion) {
    return { ...activationNotRun(), status: "FAILED", reason: "installed IntentOS version does not match the approved plan" };
  }
  const before = snapshotTargetFiles(targetRoot);
  const result = spawnSync(process.execPath, [script, targetRoot, "--json"], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    timeout: 30000,
  });
  let baselineResult = null;
  let industrialResult = null;
  if (plan?.arguments?.baselineLevel && Array.isArray(plan?.arguments?.profiles) && plan.arguments.profiles.length > 0) {
    const baselineScript = path.join(targetRoot, "scripts", "check-baseline-installation.mjs");
    baselineResult = fs.existsSync(baselineScript)
      ? spawnSync(process.execPath, [baselineScript, targetRoot, "--require-selection", "--allow-pending-receipt"], {
        cwd: targetRoot,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20,
        timeout: 30000,
      })
      : { status: 1, stdout: "", stderr: "installed baseline checker is missing" };
  }
  if (plan?.arguments?.baselineLevel === "BL2_INDUSTRIAL") {
    const industrialScript = path.join(targetRoot, "scripts", "check-industrial-baseline.mjs");
    industrialResult = fs.existsSync(industrialScript)
      ? spawnSync(process.execPath, [industrialScript, targetRoot], {
        cwd: targetRoot,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 20,
        timeout: 30000,
      })
      : { status: 1, stdout: "", stderr: "installed industrial baseline checker is missing" };
  }
  const after = snapshotTargetFiles(targetRoot);
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }
  const changed = changedSnapshotPaths(before, after);
  const nextAction = String(parsed?.nextAction || "");
  const projectState = typeof parsed?.projectState === "string"
    ? parsed.projectState
    : String(parsed?.projectState?.state || parsed?.projectStateTags?.[0] || "");
  const baselineOk = !baselineResult || baselineResult.status === 0;
  const industrialOk = !industrialResult || industrialResult.status === 0;
  const ok = result.status === 0 && parsed && isWorkflowActivationState(parsed, plan) && projectState && changed.length === 0 && baselineOk && industrialOk;
  return {
    status: ok ? "VERIFIED" : "FAILED",
    workflow_next_exit_code: String(result.status ?? "N/A"),
    output_digest: sha256Content(String(result.stdout || "")),
    project_state: projectState || "N/A",
    next_action: nextAction || "N/A",
    read_only: changed.length === 0,
    reason: ok ? "" : normalizeOutput(
      baselineResult && baselineResult.status !== 0
        ? baselineResult.stderr || baselineResult.stdout
        : industrialResult && industrialResult.status !== 0
          ? industrialResult.stderr || industrialResult.stdout
        : result.stderr || result.stdout || `activation changed: ${changed.join(", ")}`,
    ),
  };
}

function activationNotRun() {
  return {
    status: "NOT_RUN",
    workflow_next_exit_code: "N/A",
    output_digest: sha256Content(""),
    project_state: "N/A",
    next_action: "N/A",
    read_only: true,
    reason: "not run",
  };
}

function receiptActionResult(action, result, hashAfter) {
  return {
    id: action.id,
    type: action.type,
    target_paths: actionTargetPaths(action),
    result,
    hash_before: action.hashBefore || "N/A",
    hash_after: hashAfter || "N/A",
    expected_hash_after: action.expectedHashAfter || (action.dynamicReceipt ? "dynamic" : "N/A"),
    source_hash: action.sourceHash || "N/A",
  };
}

function buildApplyReceipt(plan, context, result) {
  const before = plan.targetFingerprint || {};
  const after = gitFingerprint(plan.targetRoot);
  const receipt = {
    schema_version: "1.92.0",
    artifact_type: "apply_execution_receipt",
    artifact_id: path.basename(plan.receiptPath, ".md"),
    receipt_state: result.receiptState,
    project_identity: {
      root_digest: plan.projectIdentity.fingerprint,
      git_repository: Boolean(before.isGitRepository),
      git_branch_before: before.gitBranch || "N/A",
      git_head_before: before.gitHead || "N/A",
      git_head_after: after.gitHead || "N/A",
    },
    execution_plan: {
      path: context.planRelativePath,
      plan_digest: plan.planDigest,
      intentos_version: plan.intentOSVersion,
      manifest_digest: plan.manifestDigest,
    },
    approval_record: {
      path: context.approvalRelativePath,
      artifact_id: context.approval.evidence.artifact_id,
      approved_by: context.approval.evidence.approved_by,
      expires_at: context.approval.evidence.expires_at,
    },
    readiness_report: {
      path: context.readinessRelativePath,
      artifact_id: context.readiness.evidence.artifact_id,
      evidence_digest: evidenceDigest(context.readiness.evidence, []),
      readiness_state: context.readiness.evidence.readiness_state,
    },
    actions: result.actions,
    unexpected_changed_paths: result.unexpectedChangedPaths,
    activation: {
      status: result.activation.status,
      workflow_next_exit_code: result.activation.workflow_next_exit_code,
      output_digest: result.activation.output_digest,
      project_state: result.activation.project_state,
      next_action: result.activation.next_action,
      read_only: result.activation.read_only,
    },
    rollback: {
      required: result.actions.some((action) => action.hash_before !== "N/A" && action.type !== "WRITE_APPLY_RECEIPT"),
      attempted: result.rollbackAttempted,
      verified: result.rollbackVerified,
      backup_paths: plan.actions.map((action) => action.backupPath).filter(Boolean),
    },
    boundary: {
      only_approved_actions_executed: result.unexpectedChangedPaths.length === 0,
      approves_business_implementation: false,
      approves_release_or_production: false,
      modifies_ci_or_hooks: false,
      changes_project_authority: false,
      proves_product_correctness: false,
    },
    outcome: result.receiptState,
  };
  return receipt;
}

function writeApplyReceipt(plan, receipt) {
  const receiptPath = assertSafeWritePath(plan.targetRoot, plan.receiptPath, "apply receipt");
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  const humanResult = receipt.receipt_state === "APPLY_VERIFIED"
    ? "The exact approved IntentOS governance plan was applied and workflow activation was verified."
    : "The controlled apply did not complete as verified; review rollback and blocker evidence.";
  const content = [
    `# Apply Execution Receipt: ${receipt.artifact_id}`,
    "",
    "## Human Summary",
    "",
    `Result: \`${receipt.receipt_state}\``,
    "",
    humanResult,
    "",
    `Changed action count: ${receipt.actions.filter((item) => item.result === "APPLIED").length}`,
    "",
    `Unexpected changed paths: ${receipt.unexpected_changed_paths.length === 0 ? "none" : receipt.unexpected_changed_paths.join(", ")}`,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(receipt, null, 2),
    "```",
    "",
    "## Boundary",
    "",
    "- This receipt approves business implementation: No",
    "- This receipt approves release or production: No",
    "- This receipt modifies CI or hooks: No",
    "- This receipt changes project authority: No",
    "- This receipt proves product correctness: No",
    "",
  ].join("\n");
  atomicWriteFile(receiptPath, content);
}

function normalizeOutput(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 2000);
}

function writePlan(plan, planPath) {
  if (path.isAbsolute(String(planPath || ""))) throw new Error("--write-plan must use a project-local relative path");
  const fullPath = path.resolve(plan.targetRoot, planPath);
  assertInsideRoot(plan.targetRoot, fullPath, "--write-plan");
  const relative = path.relative(plan.targetRoot, fullPath).split(path.sep).join("/");
  if (!relative.startsWith("apply-execution-plans/") && !relative.startsWith(".intentos/apply-plans/")) {
    throw new Error("--write-plan must stay under apply-execution-plans/ or .intentos/apply-plans/ in the target project");
  }
  assertNoSymlinkInPath(plan.targetRoot, fullPath, "--write-plan");
  if (fs.existsSync(fullPath)) throw new Error(`--write-plan refuses to overwrite existing file: ${relative}`);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(plan, null, 2)}\n`, { flag: "wx" });
  console.log(`Wrote init/update plan: ${fullPath}`);
}

function printPlan(plan) {
  console.log(JSON.stringify(plan, null, 2));
}

function workflowNextGate(targetPath) {
  if (!fs.existsSync(targetPath)) return { allowed: true };
  const result = spawnSync(process.execPath, [path.join(kitRoot, "scripts", "workflow-next.mjs"), targetPath, "--json"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return { allowed: false, reason: result.stderr || result.stdout || "workflow-next failed" };
  }
  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (error) {
    return { allowed: false, reason: `workflow-next JSON parse failed: ${error.message}` };
  }
  const tags = new Set(parsed.projectStateTags || []);
  const hasVersion = fs.existsSync(path.join(targetPath, ".intentos", "version.json"));
  const isBootstrapped = hasVersion || tags.has("INTENTOS_BOOTSTRAPPED_PROJECT") || tags.has("BOOTSTRAPPED_PROJECT");
  const blocked = parsed.nextAction === "REVIEW_DIRTY_WORKTREE"
    || tags.has("DIRTY_WORKTREE_PROJECT")
    || !isBootstrapped;
  return {
    allowed: !blocked,
    reason: blocked
      ? `workflow-next requires guarded update path: NEXT_ACTION=${parsed.nextAction}, PROJECT_STATE_TAGS=${[...tags].join(", ")}`
      : null,
  };
}

function executeUpdate(targetPath, starter, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, options.backupDir);
  copySharedAssets(targetPath, {
    overwrite: true,
    starter,
    applyPrTemplateGovernance: options.applyPrTemplateGovernance,
    applyAgentGovernance: options.applyAgentGovernance,
    update: true,
    withIndustrialPacks: options.withIndustrialPacks,
    industrialPacks: options.industrialPacks,
    backupDir: options.backupDir,
  });
  writeVersionFile(targetPath, starter, { update: true, backupDir: options.backupDir });
  console.log("");
  console.log(`Updated workflow assets at ${targetPath}`);
  console.log("Updated .intentos/, workflow scripts, workflow CI, missing onboarding docs, missing AGENTS.md, and missing workflow directories.");
  console.log("Industrial pack registry and schemas are updated by default; concrete packs are updated only when already installed, selected, or explicitly requested.");
  console.log("Existing PR templates and AGENTS.md files are left unchanged unless an explicit apply flag is passed; review .intentos/migration-reports/ when present.");
}

function executeInit(targetPath, starter, options = {}) {
  if (options.backupDir) resolveBackupRoot(targetPath, options.backupDir);
  copyDir(path.join(kitRoot, "starters", starter), targetPath, { targetPath, backupDir: options.backupDir });
  copySharedAssets(targetPath, {
    starter,
    withIndustrialPacks: options.withIndustrialPacks,
    industrialPacks: options.industrialPacks,
    backupDir: options.backupDir,
  });
  writeVersionFile(targetPath, starter, {
    backupDir: options.backupDir,
    projectEntryOrigin: "NEW_PROJECT",
  });
  console.log("");
  console.log(`Initialized ${starter} at ${targetPath}`);
  printNextSteps();
}

function printNextSteps() {
  console.log("Next steps:");
  console.log("1. Tell Codex the product goal in plain language.");
  console.log("2. Codex reads the project, derives the platform and baseline, and prepares any required controlled setup plan.");
  console.log("3. You confirm only a meaningful product, cost, ownership, or material-risk recommendation when one is needed.");
  console.log("4. Codex completes onboarding, builds the first useful slice, runs the required review and verification, and records evidence.");
  console.log("5. Codex reports one plain result: done, limited, blocked, or one decision needed.");
}

function isIgnorableNewProjectEntry(name) {
  return name === ".DS_Store" || name === ".localized";
}

function assertDirectInitTargetIsSafe(targetPath, options = {}) {
  if (options.forceNewProject) return;
  if (!fs.existsSync(targetPath)) return;
  const lstat = fs.lstatSync(targetPath);
  if (lstat.isSymbolicLink()) {
    console.error(`Target must not be a symlink: ${targetPath}`);
    process.exit(2);
  }
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    console.error(`Target exists and is not a directory: ${targetPath}`);
    console.error("Direct init is only allowed for a missing or empty directory.");
    process.exit(2);
  }
  const meaningfulEntries = fs.readdirSync(targetPath).filter((entry) => !isIgnorableNewProjectEntry(entry));
  if (meaningfulEntries.length === 0) return;
  console.error(`Direct init refused because target is not empty: ${targetPath}`);
  console.error(`Existing entries: ${meaningfulEntries.slice(0, 8).join(", ")}${meaningfulEntries.length > 8 ? ", ..." : ""}`);
  console.error("Use --dry-run or --write-plan first for existing projects, then review and apply the plan.");
  console.error("If this is intentionally a new project directory, rerun with --force-new-project.");
  process.exit(2);
}

function assertExistingTargetRootIsSafe(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.lstatSync(targetPath);
  if (stat.isSymbolicLink()) {
    throw new Error(`Target root must not be a symlink: ${targetPath}`);
  }
}

const args = parseArgs(process.argv.slice(2));
const target = args.target;
const updateWorkflowAssets = Boolean(args["update-workflow-assets"]);
const applyPrTemplateGovernance = Boolean(args["apply-pr-template-governance"]);
const applyAgentGovernance = Boolean(args["apply-agent-governance"]);
const withIndustrialPacks = Boolean(args["with-industrial-packs"]);
const industrialPacks = args["industrial-packs"] || "";
const profiles = args.profiles || "";
const baselineLevel = args["baseline-level"] || "";
const standardPacks = args["standard-packs"] || "";
const dryRun = Boolean(args["dry-run"]);
const writePlanPath = args["write-plan"];
const applyPlanPath = args["apply-plan"];
const approvalRecordPath = args["approval-record"];
const readinessReportPath = args["readiness-report"];
const backupDir = args["backup-dir"] || "";
const forceNewProject = Boolean(args["force-new-project"]);

if (!target && !applyPlanPath) {
  console.error("Usage: node scripts/init-project.mjs --starter generic-project --target ../my-project");
  console.error("       node scripts/init-project.mjs --starter generic-project --target ../my-project --force-new-project");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --dry-run");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --write-plan apply-execution-plans/init-update-plan.json");
  console.error("       node scripts/init-project.mjs --apply-plan ./apply-execution-plans/init-update-plan.json --approval-record ./approval-records/approval.md --readiness-report ./apply-readiness-reports/readiness.md");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --industrial-packs web-app-industrial,backend-api-industrial");
  console.error("       node scripts/init-project.mjs --starter codex-web-app --target ../my-project --profiles web-app --baseline-level BL1_STANDARD --write-plan apply-execution-plans/init.json");
  console.error("       node scripts/init-project.mjs --starter codex-web-app --target ../my-project --profiles web-app --baseline-level BL2_INDUSTRIAL --standard-packs web-runtime-standard,environment-standard --industrial-packs web-app-industrial --write-plan apply-execution-plans/init.json");
  console.error("       node scripts/init-project.mjs --target ../my-project --with-industrial-packs");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-pr-template-governance");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-agent-governance");
  process.exit(1);
}

if (applyPlanPath) {
  const fullPlanPath = path.resolve(process.cwd(), applyPlanPath);
  if (!fs.existsSync(fullPlanPath)) {
    console.error(`Plan not found: ${fullPlanPath}`);
    process.exit(1);
  }
  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(fullPlanPath, "utf8"));
  } catch (error) {
    console.error(`Plan JSON parse failed: ${error.message}`);
    process.exit(1);
  }
  if (target && path.resolve(process.cwd(), target) !== path.resolve(plan.targetRoot)) {
    console.error(`--target does not match plan targetRoot: ${target} != ${plan.targetRoot}`);
    process.exit(1);
  }
  try {
    assertExistingTargetRootIsSafe(plan.targetRoot);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  let planBackupDir;
  let approvalRecord;
  let readinessRecord;
  try {
    planBackupDir = validatePlanForApply(plan, backupDir || null);
    approvalRecord = readApprovalRecordForApply(approvalRecordPath);
    validateApprovalRecordForApply(plan, approvalRecord, fullPlanPath);
    readinessRecord = readReadinessReportForApply(readinessReportPath);
    validateReadinessReportForApply(plan, readinessRecord, fullPlanPath);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  try {
    const planRelativePath = requireProjectLocalEvidencePath(plan.targetRoot, fullPlanPath, "execution plan");
    const approvalRelativePath = requireProjectLocalEvidencePath(plan.targetRoot, approvalRecord.fullPath, "approval record");
    const readinessRelativePath = requireProjectLocalEvidencePath(plan.targetRoot, readinessRecord.fullPath, "readiness report");
    replayApprovedPlan(plan, {
      planRelativePath,
      approvalRelativePath,
      readinessRelativePath,
      approval: approvalRecord,
      readiness: readinessRecord,
      backupDir: planBackupDir,
    });
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  console.log("");
  console.log(`Applied exact approved init/update action graph: ${fullPlanPath}`);
  console.log(`Apply receipt: ${path.join(plan.targetRoot, plan.receiptPath)}`);
  process.exit(0);
}

const targetPath = path.resolve(process.cwd(), target);
const starter = assertSafeNameSegment(args.starter || readExistingStarter(targetPath) || "generic-project", "starter");
const starterPath = resolveUnderRoot(path.join(kitRoot, "starters"), starter, "starter path");

if (!fs.existsSync(starterPath)) {
  console.error(`Starter not found: ${starterPath}`);
  process.exit(1);
}

if (updateWorkflowAssets && !fs.existsSync(targetPath)) {
  console.error(`Target does not exist for workflow update: ${targetPath}`);
  process.exit(1);
}
try {
  assertExistingTargetRootIsSafe(targetPath);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const commonOptions = {
  starter,
  applyPrTemplateGovernance,
  applyAgentGovernance,
  withIndustrialPacks,
  industrialPacks,
  profiles,
  baselineLevel,
  standardPacks,
  backupDir,
};

if (dryRun || writePlanPath) {
  let plan;
  try {
    plan = buildPlan(targetPath, {
      ...commonOptions,
      update: updateWorkflowAssets,
    });
  } catch (error) {
    console.error(`FAIL ${error.message}`);
    process.exit(2);
  }
  if (dryRun) {
    printPlan(plan);
    process.exit(0);
  }
  writePlan(plan, writePlanPath);
  process.exit(0);
}

if (updateWorkflowAssets) {
  const gate = workflowNextGate(targetPath);
  console.error(`Workflow update requires the 1.92 plan-first path${gate.reason ? `: ${gate.reason}` : "."}`);
  console.error("Run --write-plan, record exact approval and readiness, then run --apply-plan with both records.");
  process.exit(2);
}

if (profiles || baselineLevel || standardPacks || industrialPacks || withIndustrialPacks) {
  console.error("Selected baseline/profile/pack setup requires the controlled plan-first path.");
  console.error("Run --write-plan, record exact approval and readiness, then run --apply-plan with both records.");
  process.exit(2);
}

assertDirectInitTargetIsSafe(targetPath, { forceNewProject });
executeInit(targetPath, starter, commonOptions);
