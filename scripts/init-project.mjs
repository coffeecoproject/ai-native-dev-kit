#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { manifestCopyRules, manifestGroup, workflowVersionAssets } from "./lib/manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const currentDevKitVersion = readCurrentVersion();
const requiredPullRequestTemplateMarkers = [
  "Human Summary",
  "Bootstrap state",
  "Project onboarding",
  "Engineering baseline",
  "Workflow Evidence",
  "Workflow artifact quality",
  "Review Packet / Review Loop Report",
  "Subagent Run Plan",
  "Next-Step Suggestions",
  "Skill / Automation Governance",
  "irreversible operation",
];
const requiredAgentGovernanceMarkers = [
  "Mission",
  "Core Rules",
  "Bootstrap Entry",
  "Project Onboarding",
  "Engineering Baseline",
  "Platform Baseline",
  "Industrial Baseline",
  "Workflow Artifact Generation",
  "Review Loop",
  "Goal Mode",
  "Subagent Orchestration",
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
      fs.copyFileSync(srcPath, destPath);
      console.log(`${fs.existsSync(destPath) && overwrite ? "updated" : "created"} ${path.relative(process.cwd(), destPath)}`);
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
    "- [ ] Bootstrap state was checked with `workflow-next` when workflow assets or project setup changed",
    "- [ ] Project onboarding is confirmed or not applicable for this change",
    "- [ ] Engineering baseline was checked when this change touched structure, contracts, schema, permissions, migrations, dependencies, or cross-module state",
    "- [ ] Goal Card is linked or marked not applicable when route selection was ambiguous, high-risk, or multi-step",
    "- [ ] Subagent Run Plan is linked or marked not applicable when helper agents were used",
    "- [ ] Request / preflight / spec / eval / task links are included or marked not applicable",
    "- [ ] Workflow artifact quality check passed or is not applicable",
    "- [ ] Review Packet / Review Loop Report is linked when independent review or review loop was needed, or marked not applicable",
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
        writePullRequestTemplateMigrationReport(targetPath, [], { status: "RESOLVED_MANUALLY" });
      }
    }
    console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
    return;
  }

  if (!applyPrTemplateGovernance) {
    writePullRequestTemplateMigrationReport(targetPath, missingMarkers);
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .ai-native/migration-reports/pr-template-governance.md`);
    return;
  }

  fs.appendFileSync(dest, `${content.endsWith("\n") ? "" : "\n"}${pullRequestTemplateGovernanceAppendix()}`);
  writePullRequestTemplateMigrationReport(targetPath, missingMarkers, { applied: true });
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
        writeAgentsGovernanceMigrationReport(targetPath, [], { status: "RESOLVED_MANUALLY" });
      }
    }
    console.log(`skip existing ${path.relative(process.cwd(), dest)}`);
    return;
  }

  if (!applyAgentGovernance) {
    writeAgentsGovernanceMigrationReport(targetPath, missingMarkers);
    console.log(`left existing ${path.relative(process.cwd(), dest)} unchanged; review .ai-native/migration-reports/agents-governance.md`);
    return;
  }

  fs.appendFileSync(dest, `${content.endsWith("\n") ? "" : "\n"}${agentGovernanceAppendix(missingMarkers)}`);
  writeAgentsGovernanceMigrationReport(targetPath, missingMarkers, { applied: true });
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
  ensureAgentsGovernance(targetPath, { applyAgentGovernance });
  ensurePullRequestTemplate(targetPath, starter, { applyPrTemplateGovernance });
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
    ],
    files: [
      { source: "dev-kit-manifest.json", target: ".ai-native/dev-kit-manifest.json" },
      { source: "docs/artifact-decision-tree.md", target: ".ai-native/docs/artifact-decision-tree.md" },
      { source: "docs/goal-subagent-usage.md", target: ".ai-native/docs/goal-subagent-usage.md" },
      { source: "scripts/check-ai-workflow.mjs", target: "scripts/check-ai-workflow.mjs" },
      { source: "scripts/summarize-ai-logs.mjs", target: "scripts/summarize-ai-logs.mjs" },
      { source: "scripts/check-workflow-version.mjs", target: "scripts/check-workflow-version.mjs" },
      { source: "scripts/workflow-daily-summary.mjs", target: "scripts/workflow-daily-summary.mjs" },
      { source: "scripts/check-project-onboarding.mjs", target: "scripts/check-project-onboarding.mjs" },
      { source: "scripts/check-engineering-baseline.mjs", target: "scripts/check-engineering-baseline.mjs" },
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
      ".ai-native/docs/artifact-decision-tree.md",
      ".ai-native/docs/goal-subagent-usage.md",
      "AGENTS.md",
      "scripts/check-ai-workflow.mjs",
      "scripts/summarize-ai-logs.mjs",
      "scripts/check-workflow-version.mjs",
      "scripts/workflow-daily-summary.mjs",
      "scripts/check-project-onboarding.mjs",
      "scripts/check-engineering-baseline.mjs",
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
      ".github/pull_request_template.md",
      ".github/workflows/ai-workflow-checks.yml",
    ] }),
  };
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), versionPath)}`);
}

const args = parseArgs(process.argv.slice(2));
const target = args.target;
const updateWorkflowAssets = Boolean(args["update-workflow-assets"]);
const applyPrTemplateGovernance = Boolean(args["apply-pr-template-governance"]);
const applyAgentGovernance = Boolean(args["apply-agent-governance"]);
const withIndustrialPacks = Boolean(args["with-industrial-packs"]);
const industrialPacks = args["industrial-packs"] || "";

if (!target) {
  console.error("Usage: node scripts/init-project.mjs --starter generic-project --target ../my-project");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --industrial-packs web-app-industrial,backend-api-industrial");
  console.error("       node scripts/init-project.mjs --target ../my-project --with-industrial-packs");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-pr-template-governance");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-agent-governance");
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), target);
const starter = args.starter || readExistingStarter(targetPath) || "generic-project";
const starterPath = path.join(kitRoot, "starters", starter);

if (updateWorkflowAssets) {
  if (!fs.existsSync(targetPath)) {
    console.error(`Target does not exist for workflow update: ${targetPath}`);
    process.exit(1);
  }
  copySharedAssets(targetPath, {
    overwrite: true,
    starter,
    applyPrTemplateGovernance,
    applyAgentGovernance,
    update: true,
    withIndustrialPacks,
    industrialPacks,
  });
  writeVersionFile(targetPath, starter, { update: true });
  console.log("");
  console.log(`Updated workflow assets at ${targetPath}`);
  console.log("Updated .ai-native/, workflow scripts, workflow CI, missing onboarding docs, missing AGENTS.md, and missing workflow directories.");
  console.log("Industrial pack registry and schemas are updated by default; concrete packs are updated only when already installed, selected, or explicitly requested.");
  console.log("Existing PR templates and AGENTS.md files are left unchanged unless an explicit apply flag is passed; review .ai-native/migration-reports/ when present.");
  process.exit(0);
}

copyDir(starterPath, targetPath);
copySharedAssets(targetPath, { starter, withIndustrialPacks, industrialPacks });
writeVersionFile(targetPath, starter);

console.log("");
console.log(`Initialized ${starter} at ${targetPath}`);
console.log("Next steps:");
console.log("1. Run project onboarding by using .ai-native/prompts/project-onboarding-agent.md.");
console.log("2. Let AI draft docs/project-onboarding.md, project-profile, tech-stack strategy, business spec index, sample policy, and decisions from conversation.");
console.log("3. Human confirms decisions; then run node scripts/check-project-onboarding.mjs . --strict when ready.");
console.log("4. Draft docs/engineering-baseline.md before structural, schema, contract, permission, migration, dependency, or cross-module state decisions.");
console.log("5. Run node scripts/check-engineering-baseline.mjs . and route pending engineering decisions to humans before high-impact code changes.");
console.log("6. Select platform profiles, then run node scripts/check-platform-baseline.mjs .");
console.log("7. For BL2 industrial work, install selected packs with --industrial-packs, then run node scripts/check-industrial-pack.mjs . --selected-only and node scripts/check-industrial-baseline.mjs . --bl2-only.");
console.log("8. Create the first request card only after onboarding is ready.");
console.log("9. Use scripts/new-workflow-item.mjs to create request/spec/eval/task files.");
console.log("10. Run scripts/check-workflow-artifacts.mjs . --mode ready before implementation.");
console.log("11. After L2/L3 work or independent review, create review packet / review loop report assets when required.");
console.log("12. Run scripts/check-review-loop.mjs . --task <task-card> when a Review Loop Report exists.");
console.log("13. Run scripts/check-next-step-boundary.mjs . --task <task-card> when next-step suggestions are recorded.");
console.log("14. Use scripts/new-workflow-item.mjs --type goal-card when the route is ambiguous, high-risk, or multi-step.");
console.log("15. Run scripts/check-goal-mode.mjs . when Goal Cards exist.");
console.log("16. When helper agents are used, create a subagent run plan and close or skip every subagent before final response.");
console.log("17. Run scripts/check-subagent-orchestration.mjs . when Subagent Run Plans exist.");
console.log("18. After L1/L2/L3 work, write ai-logs and run scripts/summarize-ai-logs.mjs.");
