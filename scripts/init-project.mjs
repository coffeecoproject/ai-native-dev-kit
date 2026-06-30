#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "./lib/manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const currentDevKitVersion = readCurrentVersion();
const requiredPullRequestTemplateMarkers = [
  "Human Summary",
  "Bootstrap state",
  "Beginner Entry",
  "Workflow Guidance",
  "Delivery Path",
  "Debt / Knowledge Handoff",
  "Document Archive Apply",
  "Unified Apply Plan",
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
  "Core Rules",
  "Bootstrap Entry",
  "Beginner Entry",
  "Natural Language Workflow Guidance",
  "Delivery Path Governance",
  "Debt & Knowledge Handoff",
  "Document Archive Apply",
  "Unified Apply Plan",
  "Controlled Apply Readiness",
  "Project Hook Policy",
  "Project Onboarding",
  "Engineering Baseline",
  "Environment Baseline",
  "Platform Baseline",
  "Industrial Baseline",
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
  const backupRoot = path.isAbsolute(options.backupDir)
    ? options.backupDir
    : path.join(options.targetPath, options.backupDir);
  const relativePath = path.relative(options.targetPath, filePath);
  if (relativePath.startsWith("..")) return;
  const backupPath = path.join(backupRoot, relativePath);
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
  const versionPath = path.join(targetPath, ".ai-native", "version.json");
  if (!fs.existsSync(versionPath)) return null;
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    return typeof version.starter === "string" && version.starter ? version.starter : null;
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
  if (!value || value === true) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  const destRoot = path.join(targetPath, ".ai-native", "industrial-packs");
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
  return path.join(targetPath, ".ai-native", "migration-reports", "pr-template-governance.md");
}

function agentsGovernanceMigrationReportPath(targetPath) {
  return path.join(targetPath, ".ai-native", "migration-reports", "agents-governance.md");
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
        "The project PR template now contains all required AI Native workflow governance markers.",
        "",
        "A previous pending migration report was resolved after the template was updated manually or by another approved process.",
      ]
    : [
        "The project already has a pull request template, but it is missing AI Native workflow governance markers.",
        "",
        "The update command does not modify an existing project PR template unless the human explicitly approves that migration.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After human review, either merge the proposed appendix manually or run:",
        "",
        "```bash",
        "node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-pr-template-governance",
        "```",
      ]
    : ["No apply command is needed for this report status."];
  const content = [
    "# Migration Report: PR Template Governance",
    "",
    `Status: ${status}`,
    `Dev kit version: ${currentDevKitVersion}`,
    "",
    ...migrationHumanDecisionSummary({
      status,
      targetLabel: "PR template",
      applyCommand: "node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-pr-template-governance",
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
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .ai-native/migration-reports/pr-template-governance.md`);
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
    ["Core Rules", [
      "## Core Rules",
      "",
      "1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.",
      "2. Every non-trivial change must have acceptance criteria before implementation.",
      "3. Prefer vertical slices over broad rewrites.",
      "4. Keep changes minimal and scoped.",
      "5. Do not add production dependencies without explicit approval.",
      "6. Do not modify auth, permission, migration, production config, secrets, high-risk, safety-critical, or security-sensitive logic without a risk report and explicit approval.",
      "7. Every implementation must include tests or explain why tests are not applicable.",
      "8. If the same verification failure repeats twice, stop and report instead of blindly retrying.",
      "9. After implementation, produce a final report with changed files, tests run, remaining risks, and next step.",
      "",
    ].join("\n")],
    ["Bootstrap Entry", [
      "## Bootstrap Entry",
      "",
      "When the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat that as execution bootstrap intent.",
      "",
      "Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.",
      "",
      "When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.",
      "",
      "For bootstrap work, first use `.ai-native/prompts/bootstrap-agent.md` when present, then run:",
      "",
      "```bash",
      "node scripts/workflow-next.mjs .",
      "```",
      "",
      "Follow the reported `NEXT_ACTION`. Stop for human approval before applying any migration report.",
      "",
    ].join("\n")],
    ["Beginner Entry", [
      "## Beginner Entry",
      "",
      "Use `.ai-native/core/beginner-entry.md` and `.ai-native/docs/beginner-entry.md` when the user gives one natural-language goal or should not need to choose internal workflow commands.",
      "",
      "Run:",
      "",
      "```bash",
      "node scripts/cli.mjs ask . \"<user goal>\"",
      "node scripts/cli.mjs ask-check .",
      "```",
      "",
      "Beginner Entry returns one plain card with what Codex understood, the recommended path, a small set of human decisions, safe next actions, blocked actions, routing evidence, and boundaries. It does not write files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive documents, change task state, enable baseline/industrial packs, or approve high-risk decisions.",
      "",
    ].join("\n")],
    ["Conversation-Native Ask", [
      "## Conversation-Native Ask",
      "",
      "Use `.ai-native/core/conversation-native-ask.md` and `.ai-native/docs/conversation-native-ask.md` when the user gives a plain project goal in conversation, unless they clearly ask only to discuss, review, compare, inspect, pause, or stop.",
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
      "Use `.ai-native/core/delivery-path-governance.md` whenever Codex needs to explain how far the project or task is from useful use.",
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
      "Use `.ai-native/core/debt-knowledge-handoff.md` when a task is interrupted, paused, has known debt, or needs a reliable next-run handoff.",
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
      "Use `.ai-native/prompts/project-onboarding-agent.md` and `.ai-native/core/project-onboarding.md` to draft project onboarding docs. AI drafts; humans decide.",
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
      "Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.ai-native/core/engineering-baseline.md` when present.",
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
      "Before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert changes, read `docs/environment-baseline.md` and `.ai-native/core/environment-baseline.md` when present.",
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
      "Concrete industrial packs are installed only when selected or explicitly requested with `init-project --industrial-packs <pack-id>`. Do not treat BL2 or any industrial pack as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and `check-industrial-baseline` is ready. Use `.ai-native/templates/baseline-selection.md` and `.ai-native/templates/baseline-evidence.md` as project docs only after that decision.",
      "",
    ].join("\n")],
    ["Standard Baseline Packs", [
      "## Standard Baseline Packs",
      "",
      "Use `.ai-native/core/standard-baseline-pack-registry.md`, `.ai-native/docs/standard-baseline-pack-registry.md`, and `.ai-native/docs/platform-standard-baseline-packs.md` when platform standard packs need to be selected before considering BL2 industrial overlays.",
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
      "Use `.ai-native/core/goal-mode.md` and `.ai-native/prompts/goal-planner-agent.md` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.",
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
      "Use `.ai-native/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting.",
      "",
      "The default rule is: many readers, one writer. Subagent output is input, not authority. The main thread remains responsible for writes, verification, and final reporting.",
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
      "Use `.ai-native/core/safe-launch.md` when completed work needs a demo, internal handoff, release-review, blocked, or not-ready classification.",
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
      "Use `.ai-native/core/conversation-drift-control.md` when a user message may be discussion-only, review-only, a pause/stop request, a scope change, a new task, a direct follow-up, or a risk decision.",
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
      "Use `.ai-native/core/first-delivery-walkthrough.md` when a broad new idea needs a complete first-slice walkthrough from human idea to demo, handoff, or not-ready recommendation.",
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
      "Use `.ai-native/core/review-surface-governance.md` before non-trivial implementation, repair, or review work to decide what must be reviewed before and after execution.",
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
      "Use `.ai-native/core/review-loop.md` for L2/L3 work or whenever review findings need closure.",
      "",
      "Review Packet is the input. GPT Review Prompt is read-only reviewer instruction. Review Loop Report records review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items.",
      "",
      "Reviewer agents are read-only. Codex may auto-fix only deterministic, low-risk findings inside approved task scope, for at most 2 rounds. Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to humans.",
      "",
    ].join("\n")],
    ["Bounded Next-Step", [
      "## Bounded Next-Step",
      "",
      "Use `.ai-native/core/next-step-boundary.md` for every task final report, review summary, and follow-up suggestion.",
      "",
      "Codex may suggest next steps, but suggestions must be bounded, classified, and actionable. Suggestions must use one of: `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`.",
      "",
      "Only `IN_SCOPE_NEXT_STEP` may be done inside the current task, and only when it stays inside approved scope and needs no new approval. All other suggestion types require a new request, follow-up proposal, human decision, or explicit stop.",
      "",
    ].join("\n")],
    ["Output Experience", [
      "## Output Experience",
      "",
      "Use `.ai-native/core/output-protocol.md` and `.ai-native/prompts/reporter-agent.md` when reporting workflow, baseline, adoption, review, release, or automation status.",
      "",
      "Human-facing output must explain status, risk, decision needed, next safe step, what AI can do, and what AI must not do before technical details. Do not hide technical details; move them under `Technical Details` or `Audit Notes`.",
      "",
      "Use `.ai-native/core/glossary.md` to translate internal workflow terms when the user may not know them.",
      "",
    ].join("\n")],
    ["Guided Decision & Delivery Loop", [
      "## Guided Decision & Delivery Loop",
      "",
      "Use `.ai-native/core/decision-delegation-boundary.md`, `.ai-native/core/guided-delivery-loop.md`, and `.ai-native/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices.",
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
      "Use `.ai-native/core/change-boundary.md` and `.ai-native/core/baseline-state.md` when a task needs explicit diff-boundary proof or when baselines are drafted before code/evidence exists.",
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
      "Use `.ai-native/core/baseline-pack-system.md` and `.ai-native/docs/baseline-pack-system.md` when project profile, BL level, standard packs, industrial packs, or risk overlays need to be selected.",
      "",
      "Use `.ai-native/core/guided-baseline-selection.md` and `.ai-native/docs/guided-baseline-selection-entry.md` first when the user needs a plain-language baseline decision instead of internal pack details.",
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
      "Use `.ai-native/core/document-lifecycle.md` and `.ai-native/docs/document-lifecycle.md` when project docs appear stale, duplicated, deprecated, unclear, or when source of truth is disputed.",
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
      "Use `.ai-native/core/document-archive-apply.md` and `.ai-native/docs/document-archive-apply.md` only after Document Lifecycle has produced archive suggestions that may be ready for controlled execution.",
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
      "Use `.ai-native/core/unified-apply-plan.md` and `.ai-native/docs/unified-apply-plan.md` before applying any recommendation that may write target-project files.",
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
      "Use `.ai-native/core/controlled-apply-readiness.md` and `.ai-native/docs/controlled-apply-readiness.md` after a Unified Apply Plan exists and before any future controlled apply is considered.",
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
    ["Work Queue", [
      "## Work Queue",
      "",
      "Use `.ai-native/core/work-queue.md` and `.ai-native/docs/work-queue.md` when work is interrupted, long-running, paused, resumed, or parked for later.",
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
      "Use `.ai-native/core/hook-orchestration.md` and `.ai-native/docs/hook-orchestration.md` when the project needs automatic trigger planning.",
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
      "Use `.ai-native/core/hook-policy.md` and `.ai-native/docs/hook-policy.md` before turning hook ideas into project policy or implementation.",
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
      "Use `.ai-native/templates/skill-candidate.md` for candidate drafts and `.ai-native/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.",
      "",
    ].join("\n")],
    ["Automation Governance", [
      "## Automation Governance",
      "",
      "Codex may propose project-scoped automations during setup, release preparation, or workflow review.",
      "",
      "Use `automation-proposals/` and `.ai-native/templates/project-automation-proposal.md` before creating or updating any Codex App automation. Do not create, update, resume, delete, or enable automations without explicit human approval for the exact project root, schedule, prompt, allowed writes, and initial status.",
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
    "# AI Native Workflow Governance Appendix",
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
        "The project AGENTS.md now contains all required AI Native workflow governance markers.",
        "",
        "A previous pending migration report was resolved after AGENTS.md was updated manually or by another approved process.",
      ]
    : [
        "The project already has AGENTS.md, but it is missing AI Native workflow governance markers.",
        "",
        "The update command does not modify an existing project AGENTS.md unless the human explicitly approves that migration.",
      ];
  const missingMarkerLines = missingMarkers.length > 0 ? missingMarkers.map((marker) => `- ${marker}`) : ["- none"];
  const applyLines = status === "PENDING_HUMAN_APPROVAL"
    ? [
        "After human review, either merge the proposed appendix manually or run:",
        "",
        "```bash",
        "node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-agent-governance",
        "```",
      ]
    : ["No apply command is needed for this report status."];
  const content = [
    "# Migration Report: AGENTS.md Governance",
    "",
    `Status: ${status}`,
    `Dev kit version: ${currentDevKitVersion}`,
    "",
    ...migrationHumanDecisionSummary({
      status,
      targetLabel: "AGENTS.md",
      applyCommand: "node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets --apply-agent-governance",
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
  const dest = path.join(targetPath, "AGENTS.md");
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
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .ai-native/migration-reports/agents-governance.md`);
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
    const source = path.join(kitRoot, "templates", templateName);
    const dest = path.join(targetPath, "docs", docName);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest)) {
      console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
      continue;
    }
    fs.copyFileSync(source, dest);
    console.log(`created ${path.relative(process.cwd(), dest)}`);
  }
}

function copyIndustrialAssets(targetPath, options = {}) {
  const sourceRoot = path.join(kitRoot, "industrial-packs");
  const destRoot = path.join(targetPath, ".ai-native", "industrial-packs");
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
    copyDir(path.join(sourceRoot, entry.path), path.join(destRoot, entry.path), options);
  }
}

function copySharedAssets(targetPath, options = {}) {
  options = { ...options, targetPath };
  const { starter = "generic-project", applyPrTemplateGovernance = false, applyAgentGovernance = false } = options;
  const copyRules = manifestCopyRules(kitRoot, { fallback: fallbackCopyRules() });
  for (const rule of copyRules.directories || []) {
    copyDir(path.join(kitRoot, rule.source), path.join(targetPath, rule.target), options);
  }
  for (const rule of copyRules.files || []) {
    copyFile(path.join(kitRoot, rule.source), path.join(targetPath, rule.target), options);
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
      { source: "core", target: ".ai-native/core" },
      { source: "templates", target: ".ai-native/templates" },
      { source: "prompts", target: ".ai-native/prompts" },
      { source: "checklists", target: ".ai-native/checklists" },
      { source: "profiles", target: ".ai-native/profiles" },
      { source: "standard-baseline-packs", target: ".ai-native/standard-baseline-packs" },
      { source: "schemas/artifacts", target: ".ai-native/schemas/artifacts" },
    ],
    files: [
      { source: "dev-kit-manifest.json", target: ".ai-native/dev-kit-manifest.json" },
      { source: "docs/artifact-decision-tree.md", target: ".ai-native/docs/artifact-decision-tree.md" },
      { source: "docs/goal-subagent-usage.md", target: ".ai-native/docs/goal-subagent-usage.md" },
      { source: "docs/baseline-setup.md", target: ".ai-native/docs/baseline-setup.md" },
      { source: "docs/guided-delivery-baseline.md", target: ".ai-native/docs/guided-delivery-baseline.md" },
      { source: "docs/guided-decision-delivery-loop.md", target: ".ai-native/docs/guided-decision-delivery-loop.md" },
      { source: "docs/change-boundary.md", target: ".ai-native/docs/change-boundary.md" },
      { source: "docs/baseline-state.md", target: ".ai-native/docs/baseline-state.md" },
      { source: "docs/guided-delivery-check.md", target: ".ai-native/docs/guided-delivery-check.md" },
      { source: "docs/baseline-pack-system.md", target: ".ai-native/docs/baseline-pack-system.md" },
      { source: "docs/standard-baseline-pack-registry.md", target: ".ai-native/docs/standard-baseline-pack-registry.md" },
      { source: "docs/platform-standard-baseline-packs.md", target: ".ai-native/docs/platform-standard-baseline-packs.md" },
      { source: "docs/existing-project-workflow-adapter.md", target: ".ai-native/docs/existing-project-workflow-adapter.md" },
      { source: "docs/document-lifecycle.md", target: ".ai-native/docs/document-lifecycle.md" },
      { source: "docs/document-archive-apply.md", target: ".ai-native/docs/document-archive-apply.md" },
      { source: "docs/unified-apply-plan.md", target: ".ai-native/docs/unified-apply-plan.md" },
      { source: "docs/controlled-apply-readiness.md", target: ".ai-native/docs/controlled-apply-readiness.md" },
      { source: "docs/beginner-entry.md", target: ".ai-native/docs/beginner-entry.md" },
      { source: "docs/conversation-native-ask.md", target: ".ai-native/docs/conversation-native-ask.md" },
      { source: "docs/work-queue.md", target: ".ai-native/docs/work-queue.md" },
      { source: "docs/hook-orchestration.md", target: ".ai-native/docs/hook-orchestration.md" },
      { source: "docs/hook-policy.md", target: ".ai-native/docs/hook-policy.md" },
      { source: "docs/review-surface-governance.md", target: ".ai-native/docs/review-surface-governance.md" },
      { source: "docs/delivery-path-governance.md", target: ".ai-native/docs/delivery-path-governance.md" },
      { source: "docs/debt-knowledge-handoff.md", target: ".ai-native/docs/debt-knowledge-handoff.md" },
      { source: "docs/product-baseline.md", target: ".ai-native/docs/product-baseline.md" },
      { source: "docs/claim-control.md", target: ".ai-native/docs/claim-control.md" },
      { source: "core/decision-delegation-boundary.md", target: ".ai-native/core/decision-delegation-boundary.md" },
      { source: "core/guided-delivery-loop.md", target: ".ai-native/core/guided-delivery-loop.md" },
      { source: "core/change-boundary.md", target: ".ai-native/core/change-boundary.md" },
      { source: "core/baseline-state.md", target: ".ai-native/core/baseline-state.md" },
      { source: "core/baseline-pack-system.md", target: ".ai-native/core/baseline-pack-system.md" },
      { source: "core/standard-baseline-pack-registry.md", target: ".ai-native/core/standard-baseline-pack-registry.md" },
      { source: "core/existing-project-workflow-adapter.md", target: ".ai-native/core/existing-project-workflow-adapter.md" },
      { source: "core/document-lifecycle.md", target: ".ai-native/core/document-lifecycle.md" },
      { source: "core/document-archive-apply.md", target: ".ai-native/core/document-archive-apply.md" },
      { source: "core/unified-apply-plan.md", target: ".ai-native/core/unified-apply-plan.md" },
      { source: "core/controlled-apply-readiness.md", target: ".ai-native/core/controlled-apply-readiness.md" },
      { source: "core/beginner-entry.md", target: ".ai-native/core/beginner-entry.md" },
      { source: "core/conversation-native-ask.md", target: ".ai-native/core/conversation-native-ask.md" },
      { source: "core/work-queue.md", target: ".ai-native/core/work-queue.md" },
      { source: "core/hook-orchestration.md", target: ".ai-native/core/hook-orchestration.md" },
      { source: "core/hook-policy.md", target: ".ai-native/core/hook-policy.md" },
      { source: "core/review-surface-governance.md", target: ".ai-native/core/review-surface-governance.md" },
      { source: "core/delivery-path-governance.md", target: ".ai-native/core/delivery-path-governance.md" },
      { source: "core/debt-knowledge-handoff.md", target: ".ai-native/core/debt-knowledge-handoff.md" },
      { source: "prompts/delivery-coach-agent.md", target: ".ai-native/prompts/delivery-coach-agent.md" },
      { source: "prompts/guided-delivery-check-agent.md", target: ".ai-native/prompts/guided-delivery-check-agent.md" },
      { source: "prompts/change-boundary-agent.md", target: ".ai-native/prompts/change-boundary-agent.md" },
      { source: "prompts/baseline-state-agent.md", target: ".ai-native/prompts/baseline-state-agent.md" },
      { source: "prompts/baseline-pack-router-agent.md", target: ".ai-native/prompts/baseline-pack-router-agent.md" },
      { source: "prompts/standard-baseline-router-agent.md", target: ".ai-native/prompts/standard-baseline-router-agent.md" },
      { source: "prompts/workflow-adapter-agent.md", target: ".ai-native/prompts/workflow-adapter-agent.md" },
      { source: "prompts/document-lifecycle-agent.md", target: ".ai-native/prompts/document-lifecycle-agent.md" },
      { source: "prompts/document-archive-agent.md", target: ".ai-native/prompts/document-archive-agent.md" },
      { source: "prompts/apply-plan-agent.md", target: ".ai-native/prompts/apply-plan-agent.md" },
      { source: "prompts/controlled-apply-readiness-agent.md", target: ".ai-native/prompts/controlled-apply-readiness-agent.md" },
      { source: "prompts/beginner-entry-agent.md", target: ".ai-native/prompts/beginner-entry-agent.md" },
      { source: "prompts/conversation-native-ask-agent.md", target: ".ai-native/prompts/conversation-native-ask-agent.md" },
      { source: "prompts/work-queue-agent.md", target: ".ai-native/prompts/work-queue-agent.md" },
      { source: "prompts/hook-orchestration-agent.md", target: ".ai-native/prompts/hook-orchestration-agent.md" },
      { source: "prompts/hook-policy-agent.md", target: ".ai-native/prompts/hook-policy-agent.md" },
      { source: "prompts/review-surface-agent.md", target: ".ai-native/prompts/review-surface-agent.md" },
      { source: "prompts/delivery-path-agent.md", target: ".ai-native/prompts/delivery-path-agent.md" },
      { source: "prompts/debt-handoff-agent.md", target: ".ai-native/prompts/debt-handoff-agent.md" },
      { source: "templates/active-work-thread.md", target: ".ai-native/templates/active-work-thread.md" },
      { source: "templates/guided-decision-summary.md", target: ".ai-native/templates/guided-decision-summary.md" },
      { source: "templates/change-boundary-report.md", target: ".ai-native/templates/change-boundary-report.md" },
      { source: "templates/baseline-state-report.md", target: ".ai-native/templates/baseline-state-report.md" },
      { source: "templates/baseline-pack-selection-report.md", target: ".ai-native/templates/baseline-pack-selection-report.md" },
      { source: "templates/standard-baseline-selection-report.md", target: ".ai-native/templates/standard-baseline-selection-report.md" },
      { source: "templates/workflow-adoption-map.md", target: ".ai-native/templates/workflow-adoption-map.md" },
      { source: "templates/document-lifecycle-report.md", target: ".ai-native/templates/document-lifecycle-report.md" },
      { source: "templates/document-archive-apply-plan.md", target: ".ai-native/templates/document-archive-apply-plan.md" },
      { source: "templates/unified-apply-plan.md", target: ".ai-native/templates/unified-apply-plan.md" },
      { source: "templates/controlled-apply-readiness-report.md", target: ".ai-native/templates/controlled-apply-readiness-report.md" },
      { source: "templates/beginner-entry-card.md", target: ".ai-native/templates/beginner-entry-card.md" },
      { source: "templates/conversation-ask-card.md", target: ".ai-native/templates/conversation-ask-card.md" },
      { source: "templates/archive-index.md", target: ".ai-native/templates/archive-index.md" },
      { source: "templates/work-queue-report.md", target: ".ai-native/templates/work-queue-report.md" },
      { source: "templates/hook-orchestration-plan.md", target: ".ai-native/templates/hook-orchestration-plan.md" },
      { source: "templates/project-hook-policy.md", target: ".ai-native/templates/project-hook-policy.md" },
      { source: "templates/review-surface-card.md", target: ".ai-native/templates/review-surface-card.md" },
      { source: "templates/delivery-path-report.md", target: ".ai-native/templates/delivery-path-report.md" },
      { source: "templates/debt-knowledge-handoff-report.md", target: ".ai-native/templates/debt-knowledge-handoff-report.md" },
      { source: "checklists/review-surface-review.md", target: ".ai-native/checklists/review-surface-review.md" },
      { source: "checklists/delivery-path-review.md", target: ".ai-native/checklists/delivery-path-review.md" },
      { source: "checklists/debt-knowledge-handoff-review.md", target: ".ai-native/checklists/debt-knowledge-handoff-review.md" },
      { source: "checklists/document-archive-apply-review.md", target: ".ai-native/checklists/document-archive-apply-review.md" },
      { source: "checklists/unified-apply-plan-review.md", target: ".ai-native/checklists/unified-apply-plan-review.md" },
      { source: "checklists/controlled-apply-readiness-review.md", target: ".ai-native/checklists/controlled-apply-readiness-review.md" },
      { source: "checklists/beginner-entry-review.md", target: ".ai-native/checklists/beginner-entry-review.md" },
      { source: "checklists/conversation-native-ask-review.md", target: ".ai-native/checklists/conversation-native-ask-review.md" },
      { source: "checklists/hook-policy-review.md", target: ".ai-native/checklists/hook-policy-review.md" },
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
      { source: "scripts/resolve-controlled-apply-readiness.mjs", target: "scripts/resolve-controlled-apply-readiness.mjs" },
      { source: "scripts/check-controlled-apply-readiness.mjs", target: "scripts/check-controlled-apply-readiness.mjs" },
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
      { source: "scripts/lib/frontmatter.mjs", target: "scripts/lib/frontmatter.mjs" },
      { source: "scripts/lib/manifest.mjs", target: "scripts/lib/manifest.mjs" },
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
    "dev-kit-proposals",
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

function writeVersionFile(targetPath, starter, options = {}) {
  options = { ...options, targetPath };
  const versionDir = path.join(targetPath, ".ai-native");
  fs.mkdirSync(versionDir, { recursive: true });
  const versionPath = path.join(versionDir, "version.json");
  const now = new Date().toISOString();
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
    devKitVersion: currentDevKitVersion,
    starter: existing.starter || starter,
    initializedAt: existing.initializedAt || now,
    lastWorkflowAssetUpdateAt: options.update ? now : existing.lastWorkflowAssetUpdateAt || now,
    workflowAssets: workflowVersionAssets(kitRoot, { fallback: [
      ".ai-native/core",
      ".ai-native/templates",
      ".ai-native/prompts",
      ".ai-native/checklists",
      ".ai-native/profiles",
      ".ai-native/industrial-packs",
      ".ai-native/standard-baseline-packs",
      ".ai-native/schemas/artifacts",
      ".ai-native/docs/artifact-decision-tree.md",
      ".ai-native/docs/goal-subagent-usage.md",
      ".ai-native/docs/baseline-setup.md",
      ".ai-native/docs/guided-delivery-baseline.md",
      ".ai-native/docs/baseline-pack-system.md",
      ".ai-native/docs/standard-baseline-pack-registry.md",
      ".ai-native/docs/platform-standard-baseline-packs.md",
      ".ai-native/docs/existing-project-workflow-adapter.md",
      ".ai-native/docs/document-lifecycle.md",
      ".ai-native/docs/document-archive-apply.md",
      ".ai-native/docs/unified-apply-plan.md",
      ".ai-native/docs/beginner-entry.md",
      ".ai-native/docs/conversation-native-ask.md",
      ".ai-native/docs/work-queue.md",
      ".ai-native/docs/hook-orchestration.md",
      ".ai-native/docs/hook-policy.md",
      ".ai-native/docs/review-surface-governance.md",
      ".ai-native/docs/delivery-path-governance.md",
      ".ai-native/docs/debt-knowledge-handoff.md",
      ".ai-native/docs/execution-review-closure.md",
      ".ai-native/docs/product-baseline.md",
      ".ai-native/docs/claim-control.md",
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
  if (existed) backupFileIfNeeded(versionPath, options);
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), versionPath)}`);
}

function sha256File(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  return `sha256:${createHash("sha256").update(fs.readFileSync(filePath)).digest("hex")}`;
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
  const status = spawnSync("git", ["-C", targetPath, "status", "--short"], { encoding: "utf8" });
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
  const destPath = path.join(targetPath, targetRel);
  const existed = fs.existsSync(destPath);
  const overwrite = Boolean(options.overwrite);
  let type;
  if (!existed) type = "CREATE";
  else if (!overwrite) type = "SKIP_EXISTING";
  else type = options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED";
  actions.push({
    type,
    path: targetRel,
    source: path.relative(kitRoot, sourcePath).replaceAll(path.sep, "/"),
    reason: options.reason || "managed workflow asset",
    willWrite: type !== "SKIP_EXISTING",
    hashBefore: sha256File(destPath),
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
  ]) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, "templates", docName), `docs/${docName}`, {
      overwrite: false,
      reason: "project onboarding document",
    });
  }
}

function addIndustrialPlanActions(actions, targetPath, options = {}) {
  const sourceRoot = path.join(kitRoot, "industrial-packs");
  const addRegistry = (source, target) => addFilePlanAction(actions, targetPath, path.join(sourceRoot, source), `.ai-native/industrial-packs/${target}`, {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack registry asset",
  });
  addRegistry("README.md", "README.md");
  addRegistry("selection-guide.md", "selection-guide.md");
  addRegistry("index.json", "index.json");
  addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, "schema"), ".ai-native/industrial-packs/schema", {
    overwrite: options.update,
    backupDir: options.backupDir,
    reason: "industrial pack schema asset",
  });
  if (options.withIndustrialPacks) {
    addDirectoryPlanActions(actions, targetPath, sourceRoot, ".ai-native/industrial-packs", {
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
        path: `.ai-native/industrial-packs/${packId}`,
        source: null,
        reason: `industrial pack is not executable: ${packId}`,
        willWrite: false,
        hashBefore: null,
      });
      continue;
    }
    addDirectoryPlanActions(actions, targetPath, path.join(sourceRoot, entry.path), `.ai-native/industrial-packs/${entry.path}`, {
      overwrite: options.update,
      backupDir: options.backupDir,
      reason: `selected industrial pack: ${packId}`,
    });
  }
}

function addGovernancePlanActions(actions, targetPath, starter, options = {}) {
  const agentsPath = path.join(targetPath, "AGENTS.md");
  if (!fs.existsSync(agentsPath)) {
    addFilePlanAction(actions, targetPath, path.join(kitRoot, "platforms", "codex", "AGENTS.template.md"), "AGENTS.md", {
      overwrite: false,
      reason: "missing AGENTS.md governance file",
    });
  } else {
    const content = fs.readFileSync(agentsPath, "utf8");
    const missingMarkers = requiredAgentGovernanceMarkers.filter((marker) => !content.includes(marker));
    if (missingMarkers.length === 0) {
      actions.push({ type: "SKIP_EXISTING", path: "AGENTS.md", source: null, reason: "AGENTS.md already has required governance markers", willWrite: false, hashBefore: sha256File(agentsPath) });
    } else if (options.applyAgentGovernance) {
      actions.push({ type: options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED", path: "AGENTS.md", source: null, reason: "explicit AGENTS.md governance apply", willWrite: true, hashBefore: sha256File(agentsPath) });
    } else {
      actions.push({ type: "NEEDS_HUMAN_APPROVAL", path: "AGENTS.md", source: null, reason: `missing markers: ${missingMarkers.join(", ")}`, willWrite: false, hashBefore: sha256File(agentsPath) });
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".ai-native/migration-reports/agents-governance.md", source: null, reason: "AGENTS.md governance migration report", willWrite: true, hashBefore: sha256File(agentsGovernanceMigrationReportPath(targetPath)) });
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
      actions.push({ type: "WRITE_MIGRATION_REPORT", path: ".ai-native/migration-reports/pr-template-governance.md", source: null, reason: "PR template governance migration report", willWrite: true, hashBefore: sha256File(pullRequestTemplateMigrationReportPath(targetPath)) });
    }
  }
}

function buildPlan(targetPath, options = {}) {
  const operation = options.update ? "UPDATE_WORKFLOW_ASSETS" : "INIT_PROJECT";
  const actions = [];
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
  addGovernancePlanActions(actions, targetPath, options.starter, options);
  addWorkflowDirPlanActions(actions, targetPath);
  actions.push({
    type: fs.existsSync(path.join(targetPath, ".ai-native", "version.json"))
      ? (options.backupDir ? "BACKUP_THEN_UPDATE" : "UPDATE_MANAGED")
      : "CREATE",
    path: ".ai-native/version.json",
    source: null,
    reason: "workflow version record",
    willWrite: true,
    hashBefore: sha256File(path.join(targetPath, ".ai-native", "version.json")),
  });

  const targetFingerprint = createTargetFingerprint(targetPath, actions);
  return {
    planVersion: "1.0",
    devKitVersion: currentDevKitVersion,
    manifestVersion: readJsonIfExists(path.join(kitRoot, "dev-kit-manifest.json"))?.devKitVersion || currentDevKitVersion,
    operation,
    targetRoot: targetPath,
    createdAt: new Date().toISOString(),
    arguments: {
      starter: options.starter,
      updateWorkflowAssets: Boolean(options.update),
      applyPrTemplateGovernance: Boolean(options.applyPrTemplateGovernance),
      applyAgentGovernance: Boolean(options.applyAgentGovernance),
      withIndustrialPacks: Boolean(options.withIndustrialPacks),
      industrialPacks: options.industrialPacks || "",
      backupDir: options.backupDir || null,
    },
    targetFingerprint,
    expectedPreconditions: {
      targetExists: fs.existsSync(targetPath),
      fileHashes: targetFingerprint.fileHashes,
    },
    actions,
  };
}

function createTargetFingerprint(targetPath, actions) {
  const fileHashes = {};
  for (const action of actions) {
    const rel = action.path;
    if (!rel || rel.startsWith("../")) continue;
    const full = path.join(targetPath, rel);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      fileHashes[rel] = sha256File(full);
    }
  }
  return {
    targetExists: fs.existsSync(targetPath),
    ...gitFingerprint(targetPath),
    fileHashes,
  };
}

function validatePlanForApply(plan, backupDirOverride = null) {
  if (!plan || plan.planVersion !== "1.0") {
    throw new Error("Invalid plan: planVersion must be 1.0");
  }
  if (!["INIT_PROJECT", "UPDATE_WORKFLOW_ASSETS"].includes(plan.operation)) {
    throw new Error(`Invalid plan operation: ${plan.operation}`);
  }
  if (plan.devKitVersion !== currentDevKitVersion) {
    throw new Error(`Plan devKitVersion ${plan.devKitVersion} does not match current ${currentDevKitVersion}`);
  }
  if (!Array.isArray(plan.actions) || plan.actions.length === 0) {
    throw new Error("Invalid plan: actions must be a non-empty array");
  }
  const forbiddenAction = plan.actions.find((action) => action.type === "FORBIDDEN");
  if (forbiddenAction) {
    throw new Error(`Plan contains forbidden action for ${forbiddenAction.path}: ${forbiddenAction.reason}`);
  }
  const backupDir = backupDirOverride || plan.arguments?.backupDir || null;
  const currentFingerprint = createTargetFingerprint(plan.targetRoot, plan.actions);
  if (currentFingerprint.targetExists !== plan.targetFingerprint?.targetExists) {
    throw new Error("Plan precondition failed: target existence changed");
  }
  for (const key of ["isGitRepository", "gitBranch", "gitHead", "isDirty", "changedFileCount"]) {
    if (currentFingerprint[key] !== plan.targetFingerprint?.[key]) {
      throw new Error(`Plan precondition failed: target fingerprint ${key} changed`);
    }
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

function writePlan(plan, planPath) {
  const fullPath = path.resolve(process.cwd(), planPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(plan, null, 2)}\n`);
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
  const hasVersion = fs.existsSync(path.join(targetPath, ".ai-native", "version.json"));
  const isBootstrapped = hasVersion || tags.has("AI_NATIVE_BOOTSTRAPPED_PROJECT") || tags.has("BOOTSTRAPPED_PROJECT");
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
  console.log("Updated .ai-native/, workflow scripts, workflow CI, missing onboarding docs, missing AGENTS.md, and missing workflow directories.");
  console.log("Industrial pack registry and schemas are updated by default; concrete packs are updated only when already installed, selected, or explicitly requested.");
  console.log("Existing PR templates and AGENTS.md files are left unchanged unless an explicit apply flag is passed; review .ai-native/migration-reports/ when present.");
}

function executeInit(targetPath, starter, options = {}) {
  copyDir(path.join(kitRoot, "starters", starter), targetPath, { targetPath, backupDir: options.backupDir });
  copySharedAssets(targetPath, {
    starter,
    withIndustrialPacks: options.withIndustrialPacks,
    industrialPacks: options.industrialPacks,
    backupDir: options.backupDir,
  });
  writeVersionFile(targetPath, starter, { backupDir: options.backupDir });
  console.log("");
  console.log(`Initialized ${starter} at ${targetPath}`);
  printNextSteps();
}

function printNextSteps() {
  console.log("Next steps:");
  console.log("1. Run project onboarding by using .ai-native/prompts/project-onboarding-agent.md.");
  console.log("2. Let AI draft docs/project-onboarding.md, project-profile, tech-stack strategy, business spec index, sample policy, and decisions from conversation.");
  console.log("3. Human confirms decisions; then run node scripts/check-project-onboarding.mjs . --strict when ready.");
  console.log("4. Draft docs/engineering-baseline.md before structural, schema, contract, permission, migration, dependency, or cross-module state decisions.");
  console.log("5. Run node scripts/check-engineering-baseline.mjs . and route pending engineering decisions to humans before high-impact code changes.");
  console.log("6. Select platform profiles, then run node scripts/check-platform-baseline.mjs .");
  console.log("7. Run node scripts/cli.mjs baseline-decision . so Codex explains BL level, standard packs, industrial candidates, and human decisions in plain language.");
  console.log("8. Run node scripts/resolve-standard-baseline.mjs . to review standard packs before considering BL2 industrial overlays.");
  console.log("9. For BL2 industrial work, install selected packs with --industrial-packs, then run node scripts/check-industrial-pack.mjs . --selected-only and node scripts/check-industrial-baseline.mjs . --bl2-only.");
  console.log("10. Create the first request card only after onboarding is ready.");
  console.log("11. Use scripts/new-workflow-item.mjs to create request/spec/eval/task files.");
  console.log("12. Run scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
  console.log("13. After L2/L3 work or independent review, create review packet / review loop report assets when required.");
  console.log("14. Run scripts/check-review-loop.mjs . --task <task-card> when a Review Loop Report exists.");
  console.log("15. Run scripts/check-next-step-boundary.mjs . --task <task-card> when next-step suggestions are recorded.");
  console.log("16. Before turning document archive suggestions into action, run node scripts/cli.mjs archive-apply . and review the plan.");
  console.log("17. Before proposing hook installation, CI hook changes, blocking gates, scheduled jobs, external reviewer hooks, token use, or auto-fix hooks, run node scripts/cli.mjs hook-policy . and review the policy.");
  console.log("18. Use scripts/new-workflow-item.mjs --type goal-card when the route is ambiguous, high-risk, or multi-step.");
  console.log("19. Run scripts/check-goal-mode.mjs . when Goal Cards exist.");
  console.log("20. When helper agents are used, create a subagent run plan and close or skip every subagent before final response.");
  console.log("21. Run scripts/check-subagent-orchestration.mjs . when Subagent Run Plans exist.");
  console.log("22. When a task is paused, interrupted, or leaves known debt, run node scripts/cli.mjs debt-handoff . and record the handoff.");
  console.log("23. After L1/L2/L3 work, write ai-logs and run scripts/summarize-ai-logs.mjs.");
}

function isIgnorableNewProjectEntry(name) {
  return name === ".DS_Store" || name === ".localized";
}

function assertDirectInitTargetIsSafe(targetPath, options = {}) {
  if (options.forceNewProject) return;
  if (!fs.existsSync(targetPath)) return;
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

const args = parseArgs(process.argv.slice(2));
const target = args.target;
const updateWorkflowAssets = Boolean(args["update-workflow-assets"]);
const applyPrTemplateGovernance = Boolean(args["apply-pr-template-governance"]);
const applyAgentGovernance = Boolean(args["apply-agent-governance"]);
const withIndustrialPacks = Boolean(args["with-industrial-packs"]);
const industrialPacks = args["industrial-packs"] || "";
const dryRun = Boolean(args["dry-run"]);
const writePlanPath = args["write-plan"];
const applyPlanPath = args["apply-plan"];
const backupDir = args["backup-dir"] || "";
const forceNewProject = Boolean(args["force-new-project"]);

if (!target && !applyPlanPath) {
  console.error("Usage: node scripts/init-project.mjs --starter generic-project --target ../my-project");
  console.error("       node scripts/init-project.mjs --starter generic-project --target ../my-project --force-new-project");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --dry-run");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --write-plan ./init-update-plan.json");
  console.error("       node scripts/init-project.mjs --apply-plan ./init-update-plan.json");
  console.error("       node scripts/init-project.mjs --apply-plan ./init-update-plan.json --backup-dir .ai-native/backups/phase-001");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --industrial-packs web-app-industrial,backend-api-industrial");
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
  let planBackupDir;
  try {
    planBackupDir = validatePlanForApply(plan, backupDir || null);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  const planArgs = plan.arguments || {};
  const planStarter = planArgs.starter || readExistingStarter(plan.targetRoot) || "generic-project";
  if (plan.operation === "UPDATE_WORKFLOW_ASSETS") {
    executeUpdate(plan.targetRoot, planStarter, {
      applyPrTemplateGovernance: planArgs.applyPrTemplateGovernance,
      applyAgentGovernance: planArgs.applyAgentGovernance,
      withIndustrialPacks: planArgs.withIndustrialPacks,
      industrialPacks: planArgs.industrialPacks,
      backupDir: planBackupDir,
    });
  } else {
    executeInit(plan.targetRoot, planStarter, {
      withIndustrialPacks: planArgs.withIndustrialPacks,
      industrialPacks: planArgs.industrialPacks,
      backupDir: planBackupDir,
    });
  }
  console.log("");
  console.log(`Applied init/update plan: ${fullPlanPath}`);
  process.exit(0);
}

const targetPath = path.resolve(process.cwd(), target);
const starter = args.starter || readExistingStarter(targetPath) || "generic-project";
const starterPath = path.join(kitRoot, "starters", starter);

if (!fs.existsSync(starterPath)) {
  console.error(`Starter not found: ${starterPath}`);
  process.exit(1);
}

if (updateWorkflowAssets && !fs.existsSync(targetPath)) {
  console.error(`Target does not exist for workflow update: ${targetPath}`);
  process.exit(1);
}

const commonOptions = {
  starter,
  applyPrTemplateGovernance,
  applyAgentGovernance,
  withIndustrialPacks,
  industrialPacks,
  backupDir,
};

if (dryRun || writePlanPath) {
  const plan = buildPlan(targetPath, {
    ...commonOptions,
    update: updateWorkflowAssets,
  });
  if (dryRun) {
    printPlan(plan);
    process.exit(0);
  }
  writePlan(plan, writePlanPath);
  process.exit(0);
}

if (updateWorkflowAssets) {
  const gate = workflowNextGate(targetPath);
  if (!gate.allowed) {
    console.error(`Workflow update requires a plan-first path: ${gate.reason}`);
    console.error("Run --write-plan, review the plan, then run --apply-plan.");
    process.exit(2);
  }
  executeUpdate(targetPath, starter, commonOptions);
  process.exit(0);
}

assertDirectInitTargetIsSafe(targetPath, { forceNewProject });
executeInit(targetPath, starter, commonOptions);
