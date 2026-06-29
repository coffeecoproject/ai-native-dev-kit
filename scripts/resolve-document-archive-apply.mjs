#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "from-lifecycle"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const lifecycleRef = args["from-lifecycle"] ? String(args["from-lifecycle"]) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const plan = buildPlan(projectRoot, lifecycleRef);
if (outputFormat === "json") console.log(JSON.stringify(plan, null, 2));
else printHuman(plan);

function buildPlan(root, explicitLifecycleRef) {
  const exists = fs.existsSync(root);
  const lifecycleReports = exists ? collectLifecycleReports(root, explicitLifecycleRef) : [];
  const candidates = lifecycleReports.flatMap((report) => archiveCandidatesFromReport(report));
  const uniqueCandidates = dedupeCandidates(candidates);
  const readiness = archiveReadiness(exists, lifecycleReports, uniqueCandidates);
  const actions = uniqueCandidates.length > 0
    ? uniqueCandidates.map((candidate, index) => actionFor(candidate, index))
    : [emptyAction()];

  return {
    reportType: "DOCUMENT_ARCHIVE_APPLY_PLAN",
    generatedBy: "scripts/resolve-document-archive-apply.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: {
      conclusion: readiness.conclusion,
      recommendedChoice: readiness.recommendedChoice,
      canAiContinueNow: readiness.canAiContinueNow,
      needFromHuman: readiness.needFromHuman,
      ifNothing: "No files are deleted, moved, archived, or rewritten.",
    },
    archiveReadiness: readiness,
    sourceEvidence: sourceEvidenceFor(lifecycleReports, uniqueCandidates),
    archiveActionPlan: actions,
    linkCheckPlan: linkCheckPlanFor(actions),
    archiveIndex: {
      indexPath: "docs/archive/index.md",
      requiredBeforeApply: "Yes",
      entries: actions.map((action) => ({
        originalPath: action.sourceDocument,
        archivePath: action.proposedArchivePath,
        replacementOrSourceOfTruth: action.replacementOrSourceOfTruth,
        archiveReason: action.reason,
        approvalOwner: "human",
        rollbackPath: action.sourceDocument,
      })),
    },
    rollbackPlan: actions.map((action) => ({
      archiveAction: action.actionId,
      restoreStep: action.sourceDocument === "N/A"
        ? "No archive action planned."
        : `Move ${action.proposedArchivePath} back to ${action.sourceDocument} after approval.`,
      linkRestoreStep: "Restore references found by pre/post link checks.",
      evidenceNeeded: "Human approval record, link-check output, and archive index diff.",
    })),
    whatNotToArchive: notToArchiveList(),
    humanDecisionsNeeded: decisionsFor(readiness, uniqueCandidates),
    boundaries: {
      deletesFiles: "No",
      movesOrArchivesFilesNow: "No",
      authorizesArchiveApply: "No",
      changesSourceOfTruth: "No",
      changesLinksAutomatically: "No",
      replacesDocumentLifecycle: "No",
      approvesCleanupCompletion: "No",
    },
    outcome: readiness.outcome,
  };
}

function collectLifecycleReports(root, explicitLifecycleRef) {
  const refs = [];
  if (explicitLifecycleRef) refs.push(explicitLifecycleRef);
  const reportDir = path.join(root, "doc-lifecycle-reports");
  if (fs.existsSync(reportDir)) refs.push(...walkMarkdown(reportDir).map((file) => path.relative(root, file)));
  return [...new Set(refs)]
    .map((relativePath) => {
      const fullPath = path.resolve(root, relativePath);
      if (!fs.existsSync(fullPath)) return null;
      return {
        path: path.relative(root, fullPath).replaceAll(path.sep, "/"),
        content: fs.readFileSync(fullPath, "utf8"),
      };
    })
    .filter(Boolean);
}

function walkMarkdown(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(full));
    else if (/\.md$/i.test(entry.name)) files.push(full);
  }
  return files.sort();
}

function archiveCandidatesFromReport(report) {
  const archive = sectionBody(report.content, "Archive Suggestions");
  const rows = markdownRows(archive);
  return rows
    .filter((row) => row.length >= 6)
    .filter((row) => !/^none$/i.test(row[0]))
    .filter((row) => /suggested|pending|approved/i.test(row[5] || ""))
    .map((row) => ({
      lifecycleReport: report.path,
      document: row[0],
      proposedArchivePath: row[1] || archivePathFor(row[0]),
      reason: row[2] || "archive suggestion from lifecycle report",
      replacementOrSourceOfTruth: row[3] || "PENDING_CONFIRMATION",
      approvalNeeded: row[4] || "Yes",
      sourceStatus: row[5] || "SUGGESTED",
    }));
}

function markdownRows(section) {
  return String(section || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 0 && !/^document$/i.test(cells[0]));
}

function dedupeCandidates(candidates) {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const key = `${candidate.document}=>${candidate.proposedArchivePath}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

function archiveReadiness(exists, lifecycleReports, candidates) {
  if (!exists) {
    return readiness("BLOCKED", "Target path does not exist.", "D - Pause", "no", "Provide a valid project path.", "BLOCKED");
  }
  if (lifecycleReports.length === 0) {
    return readiness("NO_LIFECYCLE_EVIDENCE", "No Document Lifecycle report was found.", "D - Run lifecycle first", "no", "Run Document Lifecycle before planning archive apply.", "BLOCKED");
  }
  if (candidates.length === 0) {
    return readiness("NO_ARCHIVE_ACTION_READY", "No archive candidate is ready for an apply plan.", "A - Keep active", "yes", "Confirm if any document area needs deeper lifecycle review.", "ARCHIVE_PLAN_RECORDED");
  }
  const unclearSource = candidates.some((candidate) => /PENDING_CONFIRMATION|unknown|n\/a/i.test(candidate.replacementOrSourceOfTruth));
  if (unclearSource) {
    return readiness("BLOCKED_BY_SOURCE_OF_TRUTH", `${candidates.length} archive candidate(s) need source-of-truth confirmation.`, "C - Confirm source of truth", "no", "Confirm replacement/source-of-truth docs before archive apply.", "NEEDS_HUMAN_DECISION");
  }
  return readiness("NEEDS_APPROVAL", `${candidates.length} archive candidate(s) are plan-ready but not approved.`, "B - Review archive plan", "limited", "Approve, defer, or reject the archive plan after reviewing links and rollback.", "NEEDS_HUMAN_DECISION");
}

function readiness(state, conclusion, recommendedChoice, canAiContinueNow, needFromHuman, outcome) {
  return {
    state,
    canApplyArchiveNow: "No",
    why: conclusion,
    lifecycleEvidence: state === "NO_LIFECYCLE_EVIDENCE" ? "missing" : "present or not required for empty plan",
    conclusion,
    recommendedChoice,
    canAiContinueNow,
    needFromHuman,
    outcome,
  };
}

function sourceEvidenceFor(lifecycleReports, candidates) {
  return [
    {
      evidence: "Document Lifecycle report",
      ref: lifecycleReports.map((report) => report.path).join(", ") || "missing",
      status: lifecycleReports.length > 0 ? "present" : "missing",
    },
    {
      evidence: "Archive suggestions",
      ref: candidates.map((candidate) => candidate.document).join(", ") || "none",
      status: candidates.length > 0 ? "present" : "missing",
    },
    {
      evidence: "Source-of-truth replacement",
      ref: candidates.map((candidate) => candidate.replacementOrSourceOfTruth).join(", ") || "not needed",
      status: candidates.some((candidate) => /PENDING_CONFIRMATION/i.test(candidate.replacementOrSourceOfTruth)) ? "pending" : "reviewed",
    },
  ];
}

function actionFor(candidate, index) {
  return {
    actionId: `A-${String(index + 1).padStart(3, "0")}`,
    sourceDocument: candidate.document,
    proposedArchivePath: candidate.proposedArchivePath || archivePathFor(candidate.document),
    replacementOrSourceOfTruth: candidate.replacementOrSourceOfTruth || "PENDING_CONFIRMATION",
    reason: candidate.reason || "archive suggestion",
    status: "PLAN_ONLY",
    approvalNeeded: "Yes",
    linkCheckRequired: "Yes",
    rollbackRequired: "Yes",
    lifecycleReport: candidate.lifecycleReport,
  };
}

function emptyAction() {
  return {
    actionId: "A-000",
    sourceDocument: "N/A",
    proposedArchivePath: "N/A",
    replacementOrSourceOfTruth: "N/A",
    reason: "No archive action ready.",
    status: "PLAN_ONLY",
    approvalNeeded: "Yes before any future archive",
    linkCheckRequired: "Yes before any future archive",
    rollbackRequired: "Yes before any future archive",
    lifecycleReport: "N/A",
  };
}

function archivePathFor(documentPath) {
  return `docs/archive/${String(documentPath || "document.md").replace(/^docs\//, "")}`;
}

function linkCheckPlanFor(actions) {
  const realActions = actions.filter((action) => action.sourceDocument !== "N/A");
  const refs = realActions.map((action) => action.sourceDocument).join("|") || "<source-document>";
  return [
    {
      check: "Pre-apply reference search",
      commandOrMethod: `rg "${refs}" .`,
      requiredBeforeApply: "Yes",
      requiredAfterApply: "No",
      owner: "Codex",
      status: "planned",
    },
    {
      check: "Post-apply reference search",
      commandOrMethod: `rg "${refs}" .`,
      requiredBeforeApply: "No",
      requiredAfterApply: "Yes",
      owner: "Codex",
      status: "planned",
    },
    {
      check: "Broken-link handling",
      commandOrMethod: "Review unresolved references and update only after approval.",
      requiredBeforeApply: "Yes",
      requiredAfterApply: "Yes",
      owner: "human / Codex",
      status: "planned",
    },
  ];
}

function notToArchiveList() {
  return [
    "Source-of-truth docs without explicit owner approval.",
    "AGENTS, agent rules, PR templates, CI workflows, hooks, release gates.",
    "Legal, license, security, privacy, compliance, or policy docs.",
    "Production, deployment, rollback, incident, migration, backup, or restore docs.",
    "Audit evidence, release evidence, historical session records, signed-off reports, and customer-facing handoff records.",
    "Docs containing secrets, credentials, private endpoints, customer data, or regulated records.",
  ];
}

function decisionsFor(readinessInfo, candidates) {
  if (readinessInfo.state === "NO_ARCHIVE_ACTION_READY") {
    return [{ decision: "Archive approval", options: "none / review deeper", recommended: "none", owner: "human", status: "NOT_NEEDED" }];
  }
  return [
    { decision: "Source of truth", options: "confirm / defer / reject", recommended: "confirm before apply", owner: "human", status: candidates.length > 0 ? "PENDING" : "MISSING" },
    { decision: "Archive approval", options: "approve later / defer / reject", recommended: "defer until source of truth and link checks are clear", owner: "human", status: "PENDING" },
    { decision: "Link update approval", options: "approve later / defer / no link changes", recommended: "defer", owner: "human", status: "PENDING" },
  ];
}

function printHuman(plan) {
  console.log("# Document Archive Apply Plan");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${plan.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${plan.humanDecisionSummary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${plan.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${plan.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${plan.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Archive Readiness");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| State | \`${plan.archiveReadiness.state}\` |`);
  console.log(`| Can apply archive now? | ${plan.archiveReadiness.canApplyArchiveNow} |`);
  console.log(`| Why | ${escapeCell(plan.archiveReadiness.why)} |`);
  console.log(`| Lifecycle evidence | ${escapeCell(plan.archiveReadiness.lifecycleEvidence)} |`);
  console.log("");
  printRows("Source Evidence", ["Evidence", "Ref", "Status"], plan.sourceEvidence.map((item) => [item.evidence, item.ref, item.status]));
  printRows("Archive Action Plan", ["Action ID", "Source document", "Proposed archive path", "Replacement / source of truth", "Reason", "Status", "Approval needed", "Link check required", "Rollback required"], plan.archiveActionPlan.map((item) => [item.actionId, item.sourceDocument, item.proposedArchivePath, item.replacementOrSourceOfTruth, item.reason, item.status, item.approvalNeeded, item.linkCheckRequired, item.rollbackRequired]));
  printRows("Link Check Plan", ["Check", "Command or method", "Required before apply", "Required after apply", "Owner", "Status"], plan.linkCheckPlan.map((item) => [item.check, item.commandOrMethod, item.requiredBeforeApply, item.requiredAfterApply, item.owner, item.status]));
  console.log("## Archive Index");
  console.log("");
  console.log(`Index path: \`${plan.archiveIndex.indexPath}\``);
  console.log("");
  printTable(["Original path", "Archive path", "Replacement / source of truth", "Archive reason", "Approval owner", "Rollback path"], plan.archiveIndex.entries.map((item) => [item.originalPath, item.archivePath, item.replacementOrSourceOfTruth, item.archiveReason, item.approvalOwner, item.rollbackPath]));
  console.log("");
  printRows("Rollback Plan", ["Archive action", "Restore step", "Link restore step", "Evidence needed"], plan.rollbackPlan.map((item) => [item.archiveAction, item.restoreStep, item.linkRestoreStep, item.evidenceNeeded]));
  console.log("## What Not To Archive");
  console.log("");
  for (const item of plan.whatNotToArchive) console.log(`- ${item}`);
  console.log("");
  printRows("Human Decisions Needed", ["Decision", "Options", "Recommended", "Owner", "Status"], plan.humanDecisionsNeeded.map((item) => [item.decision, item.options, item.recommended, item.owner, item.status]));
  console.log("## Boundary");
  console.log("");
  console.log(`- This plan deletes files: ${plan.boundaries.deletesFiles}`);
  console.log(`- This plan moves or archives files now: ${plan.boundaries.movesOrArchivesFilesNow}`);
  console.log(`- This plan authorizes archive apply: ${plan.boundaries.authorizesArchiveApply}`);
  console.log(`- This plan changes source of truth: ${plan.boundaries.changesSourceOfTruth}`);
  console.log(`- This plan changes links automatically: ${plan.boundaries.changesLinksAutomatically}`);
  console.log(`- This plan replaces Document Lifecycle: ${plan.boundaries.replacesDocumentLifecycle}`);
  console.log(`- This plan approves cleanup completion: ${plan.boundaries.approvesCleanupCompletion}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${plan.outcome}\``);
}

function printRows(title, headers, rows) {
  console.log(`## ${title}`);
  console.log("");
  printTable(headers, rows);
  console.log("");
}

function printTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) console.log(`| ${row.map(escapeCell).join(" | ")} |`);
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = pattern.exec(content);
  if (!match) return "";
  const rest = content.slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
