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

const report = buildDocumentLifecycleReport(projectRoot);

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildDocumentLifecycleReport(root) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const docs = exists ? collectDocuments(root, paths) : [];
  const duplicateGroups = duplicateGroupsFor(docs);
  const inventory = docs.map((doc) => classifyDocument(doc, duplicateGroups));
  const sourceMap = sourceOfTruthMap(inventory);
  const staleAndDuplicates = duplicateAndStaleCandidates(inventory);
  const archiveSuggestions = archiveSuggestionsFor(inventory);
  const deprecationSuggestions = deprecationSuggestionsFor(inventory);
  const summary = summaryFor(exists, docs, inventory, staleAndDuplicates);

  return {
    reportType: "DOCUMENT_LIFECYCLE_RECOMMENDATION",
    generatedBy: "scripts/resolve-document-lifecycle.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: summary,
    documentInventory: inventory,
    sourceOfTruthMap: sourceMap,
    duplicateOrStaleCandidates: staleAndDuplicates,
    archiveSuggestions,
    deprecationSuggestions,
    whatNotToDelete: notToDeleteList(),
    humanDecisionsNeeded: decisionsFor(staleAndDuplicates, archiveSuggestions, deprecationSuggestions),
    boundary: {
      deletesFiles: "No",
      authorizesDeletion: "No",
      movesOrArchivesFiles: "No",
      changesSourceOfTruth: "No",
      changesGovernanceOrRiskDocs: "No",
      approvesImplementationOrCleanup: "No",
    },
    outcome: outcomeFor(exists, docs, staleAndDuplicates),
  };
}

function collectDocuments(root, paths) {
  return paths
    .filter((item) => isDocumentPath(item))
    .map((relativePath) => {
      const fullPath = path.join(root, relativePath);
      const stat = safeStat(fullPath);
      const content = readHead(fullPath);
      return {
        path: relativePath,
        basename: path.basename(relativePath),
        normalizedName: normalizeDocName(relativePath),
        size: stat?.size || 0,
        content,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function isDocumentPath(relativePath) {
  return /\.(md|mdx|txt)$/i.test(relativePath)
    || /^README(\.[a-z]+)?$/i.test(relativePath)
    || /^AGENTS\.md$/i.test(relativePath)
    || /^LICENSE/i.test(relativePath)
    || /^SECURITY\.md$/i.test(relativePath)
    || /^NOTICE\.md$/i.test(relativePath);
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function readHead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8").slice(0, 4000);
  } catch {
    return "";
  }
}

function normalizeDocName(relativePath) {
  const parsed = path.parse(relativePath);
  return parsed.name
    .toLowerCase()
    .replace(/^\d+[-_]/, "")
    .replace(/\b(v?\d+(\.\d+){1,3}|release|phase|plan|draft|copy|old|new|latest)\b/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function duplicateGroupsFor(docs) {
  const groups = new Map();
  for (const doc of docs) {
    if (!doc.normalizedName || doc.normalizedName.length < 4) continue;
    if (!groups.has(doc.normalizedName)) groups.set(doc.normalizedName, []);
    groups.get(doc.normalizedName).push(doc.path);
  }
  return new Map(Array.from(groups.entries()).filter(([, values]) => values.length > 1));
}

function classifyDocument(doc, duplicateGroups) {
  const role = roleFor(doc);
  const lifecycleState = lifecycleStateFor(doc, role, duplicateGroups);
  return {
    document: doc.path,
    currentRole: role,
    lifecycleState,
    evidence: evidenceFor(doc, role, lifecycleState),
    ownerOrSource: ownerFor(doc, role),
    notes: notesFor(doc, lifecycleState),
  };
}

function roleFor(doc) {
  const file = doc.path;
  if (/^(AGENTS\.md|agent\.md|\.agent\.md)$/i.test(file)) return "source of truth";
  if (/^README(\.[a-z]+)?\.?md?$/i.test(file)) return "source of truth candidate";
  if (/^(LICENSE|NOTICE|SECURITY|CONTRIBUTING)\b/i.test(file)) return "protected policy";
  if (/^docs\/(engineering-baseline|environment-baseline|project-profile|tech-stack-strategy|business-spec-index|risk-policy|architecture|domain-model|permission-model|test-strategy|verification-matrix)\.md$/i.test(file)) return "source of truth candidate";
  if (/^docs\/(release|rollback|runbook|incident|security|privacy|compliance)/i.test(file)) return "protected operations";
  if (/^(releases|final-reports|ai-logs|review-loop-reports|review-packets)\//i.test(file)) return "historical evidence";
  if (/^docs\/.*(\d+\.\d+|\d{4}-\d{2}-\d{2}).*(plan|roadmap|record|report)\.md$/i.test(file)) return "historical reference";
  if (/^templates\//i.test(file)) return "template";
  if (/^prompts\//i.test(file)) return "prompt";
  if (/^checklists\//i.test(file)) return "checklist";
  return "active reference";
}

function lifecycleStateFor(doc, role, duplicateGroups) {
  if (/protected|source of truth/i.test(role)) return role === "source of truth" ? "ACTIVE_SOURCE_OF_TRUTH" : "ACTIVE_REFERENCE";
  if (/historical evidence|historical reference/i.test(role)) return "RETIRED_REFERENCE";
  if (duplicateGroups.has(doc.normalizedName)) return "DUPLICATE_CANDIDATE";
  if (/\b(deprecated|superseded|obsolete|no longer current|replaced by)\b/i.test(doc.content)) return "DEPRECATION_CANDIDATE";
  if (/\b(TODO stale|OUTDATED|old version|legacy only)\b/i.test(doc.content)) return "STALE_CANDIDATE";
  if (/^docs\/.*(old|archive|deprecated|legacy|superseded)/i.test(doc.path)) return "ARCHIVE_CANDIDATE";
  return "ACTIVE_REFERENCE";
}

function evidenceFor(doc, role, lifecycleState) {
  const evidence = [];
  if (/source of truth/i.test(role)) evidence.push("path/name indicates possible project authority");
  if (/protected/i.test(role)) evidence.push("protected policy or operations path");
  if (/historical/i.test(role)) evidence.push("historical evidence or dated planning path");
  if (lifecycleState === "DUPLICATE_CANDIDATE") evidence.push("normalized name appears in more than one document");
  if (lifecycleState === "DEPRECATION_CANDIDATE") evidence.push("content contains deprecation or superseded wording");
  if (lifecycleState === "STALE_CANDIDATE") evidence.push("content contains stale or outdated wording");
  if (lifecycleState === "ARCHIVE_CANDIDATE") evidence.push("path/name suggests archive, old, legacy, or superseded status");
  return evidence.join("; ") || "no stale or duplicate signal found";
}

function ownerFor(doc, role) {
  if (/source of truth|protected/i.test(role)) return "project evidence authority";
  if (/template|prompt|checklist/i.test(role)) return "IntentOS workflow authority";
  if (/historical/i.test(role)) return "history/evidence authority";
  return "Codex evidence review";
}

function notesFor(doc, lifecycleState) {
  if (lifecycleState === "ACTIVE_SOURCE_OF_TRUTH") return "cite and protect";
  if (lifecycleState === "DUPLICATE_CANDIDATE") return "compare with possible authority before any merge";
  if (lifecycleState === "STALE_CANDIDATE") return "archive review before any deletion";
  if (lifecycleState === "ARCHIVE_CANDIDATE") return "archive suggestion only";
  if (lifecycleState === "DEPRECATION_CANDIDATE") return "suggest visible deprecation note only";
  if (lifecycleState === "RETIRED_REFERENCE") return "keep readable as historical evidence";
  return "keep unless replacement evidence and controlled apply prove otherwise";
}

function sourceOfTruthMap(inventory) {
  const topics = [
    ["Agent behavior", /(^AGENTS\.md$|agent\.md|\.agent\.md)/i],
    ["Project overview", /^README/i],
    ["Engineering baseline", /engineering-baseline/i],
    ["Environment baseline", /environment-baseline/i],
    ["Project profile", /project-profile/i],
    ["Architecture", /architecture/i],
    ["Risk / release", /(risk-policy|release|rollback|runbook)/i],
    ["Security / policy", /(SECURITY|LICENSE|NOTICE|privacy|compliance)/i],
  ];

  return topics.map(([topic, pattern]) => {
    const matches = inventory.filter((item) => pattern.test(item.document));
    return {
      topic,
      sourceOfTruthDocument: matches[0]?.document || "PENDING_CONFIRMATION",
      evidence: matches[0] ? matches[0].evidence : "not detected",
      confidence: matches[0] ? (matches.length === 1 ? "medium" : "low") : "low",
      humanDecisionNeeded: "No technical user decision",
      internalEvidenceReviewNeeded: matches.length === 1 ? "No" : "Yes",
    };
  });
}

function duplicateAndStaleCandidates(inventory) {
  return inventory
    .filter((item) => /DUPLICATE_CANDIDATE|STALE_CANDIDATE|ARCHIVE_CANDIDATE|DEPRECATION_CANDIDATE|UNKNOWN_NEEDS_OWNER/.test(item.lifecycleState))
    .map((item) => ({
      candidateDocument: item.document,
      suspectedIssue: issueFor(item.lifecycleState),
      possibleSourceOfTruth: "PENDING_CONFIRMATION",
      evidence: item.evidence,
      recommendedHandling: handlingFor(item.lifecycleState),
    }));
}

function issueFor(state) {
  if (state === "DUPLICATE_CANDIDATE") return "duplicate";
  if (state === "DEPRECATION_CANDIDATE") return "deprecated";
  if (state === "ARCHIVE_CANDIDATE") return "archive candidate";
  if (state === "STALE_CANDIDATE") return "stale";
  return "unclear";
}

function handlingFor(state) {
  if (state === "DUPLICATE_CANDIDATE") return "compare authority and prepare bounded merge suggestion";
  if (state === "DEPRECATION_CANDIDATE") return "deprecation suggestion";
  if (state === "ARCHIVE_CANDIDATE" || state === "STALE_CANDIDATE") return "archive suggestion";
  return "needs project evidence";
}

function archiveSuggestionsFor(inventory) {
  return inventory
    .filter((item) => /STALE_CANDIDATE|ARCHIVE_CANDIDATE|DUPLICATE_CANDIDATE/.test(item.lifecycleState))
    .map((item) => ({
      document: item.document,
      proposedArchivePath: `docs/archive/${item.document.replace(/^docs\//, "")}`,
      reason: item.evidence,
      replacementOrSourceOfTruth: "PENDING_CONFIRMATION",
      approvalNeeded: "Controlled apply readiness",
      status: "SUGGESTED",
    }));
}

function deprecationSuggestionsFor(inventory) {
  return inventory
    .filter((item) => item.lifecycleState === "DEPRECATION_CANDIDATE")
    .map((item) => ({
      document: item.document,
      suggestedDeprecationNote: "This document is retained for reference. Resolve the current source of truth from project evidence before use.",
      why: item.evidence,
      approvalNeeded: "Controlled apply readiness",
      status: "SUGGESTED",
    }));
}

function notToDeleteList() {
  return [
    "Source-of-truth docs unless replacement evidence, exact scope, rollback, and controlled apply readiness prove a safe replacement.",
    "AGENTS, agent rules, PR templates, CI workflows, hooks, release gates.",
    "Legal, license, security, privacy, compliance, or policy docs.",
    "Production, deployment, rollback, incident, migration, backup, or restore docs.",
    "Audit evidence, release evidence, historical session records, signed-off reports, and customer-facing handoff records.",
    "Docs containing secrets, credentials, private endpoints, customer data, or regulated records.",
  ];
}

function decisionsFor(candidates, archiveSuggestions, deprecationSuggestions) {
  const reviewStatus = candidates.length > 0 ? "INTERNAL_EVIDENCE_REVIEW" : "RESOLVED";
  return [
    decision("Source of truth", "keep / change / unresolved", "keep unless project evidence proves otherwise", reviewStatus),
    decision("Archive action", "none / archive through controlled apply", archiveSuggestions.length > 0 ? "prepare evidence-backed archive action" : "none", reviewStatus),
    decision("Deprecation action", "none / add note through controlled apply", deprecationSuggestions.length > 0 ? "prepare evidence-backed deprecation note" : "none", reviewStatus),
    decision("Merge action", "none / merge through controlled apply", candidates.some((item) => item.suspectedIssue === "duplicate") ? "compare content and prepare bounded merge" : "none", reviewStatus),
    decision("Deletion action", "none / separate evidence-backed deletion plan", "none", "NO_USER_ACTION"),
  ];
}

function decision(name, options, recommended, status) {
  return {
    decision: name,
    options,
    recommended,
    owner: "Codex",
    status,
  };
}

function outcomeFor(exists, docs, candidates) {
  if (!exists) return "BLOCKED";
  if (docs.length === 0) return "DOCUMENT_LIFECYCLE_RECORDED";
  if (candidates.length > 0) return "DOCUMENT_LIFECYCLE_RECORDED";
  return "DOCUMENT_LIFECYCLE_RECORDED";
}

function summaryFor(exists, docs, inventory, candidates) {
  if (!exists) {
    return {
      conclusion: "Target path does not exist.",
      recommendedChoice: "E. Pause",
      canAiContinueNow: "no",
      needFromHuman: "Provide a valid project path.",
      ifNothing: "No project files are changed.",
    };
  }
  if (docs.length === 0) {
    return {
      conclusion: "No project documents were detected.",
      recommendedChoice: "A. Keep project unchanged and continue project discovery",
      canAiContinueNow: "yes",
      needFromHuman: "No technical decision. Codex should continue discovering project authority.",
      ifNothing: "No project files are changed.",
    };
  }
  const sourceCount = inventory.filter((item) => item.lifecycleState === "ACTIVE_SOURCE_OF_TRUTH").length;
  return {
    conclusion: candidates.length > 0
      ? "Possible stale, duplicate, archive, or deprecation candidates were found."
      : "No obvious stale or duplicate document candidates were found.",
    recommendedChoice: candidates.length > 0 ? "B. Review candidates and prepare bounded actions" : "A. Keep active",
    canAiContinueNow: "yes",
    needFromHuman: candidates.length > 0
      ? "No technical decision. Codex must resolve source-of-truth evidence before proposing archive, merge, deprecation, or deletion."
      : "No user input is required.",
    ifNothing: `No project files are changed. ${sourceCount} source-of-truth candidate(s) remain protected.`,
  };
}

function printHuman(report) {
  console.log("# Document Lifecycle Recommendation");
  console.log("");
  printHumanDecisionSummary(report.humanDecisionSummary);
  printInventory(report);
  printSourceMap(report);
  printCandidates(report);
  printArchiveSuggestions(report);
  printDeprecationSuggestions(report);
  printBoundary(report);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printHumanDecisionSummary(summary) {
  console.log("## Compatibility Decision Summary");
  console.log("");
  console.log(`Conclusion: ${summary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${summary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${summary.canAiContinueNow}`);
  console.log("");
  console.log(`User input boundary: ${summary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${summary.ifNothing}`);
  console.log("");
}

function printInventory(report) {
  console.log("## Document Inventory");
  console.log("");
  console.log("| Document | Current role | Lifecycle state | Evidence | Owner / source | Notes |");
  console.log("|---|---|---|---|---|---|");
  for (const item of report.documentInventory.slice(0, 40)) {
    console.log(`| ${escapeCell(item.document)} | ${escapeCell(item.currentRole)} | ${item.lifecycleState} | ${escapeCell(item.evidence)} | ${escapeCell(item.ownerOrSource)} | ${escapeCell(item.notes)} |`);
  }
  if (report.documentInventory.length > 40) {
    console.log(`| ... | ${report.documentInventory.length - 40} more document(s) omitted from console output | ACTIVE_REFERENCE | use --json for full list | Codex evidence review | no files changed |`);
  }
  console.log("");
}

function printSourceMap(report) {
  console.log("## Source Of Truth Map");
  console.log("");
  console.log("| Topic | Source-of-truth document | Evidence | Confidence | User technical decision needed |");
  console.log("|---|---|---|---|---|");
  for (const item of report.sourceOfTruthMap) {
    console.log(`| ${escapeCell(item.topic)} | ${escapeCell(item.sourceOfTruthDocument)} | ${escapeCell(item.evidence)} | ${item.confidence} | ${item.humanDecisionNeeded} |`);
  }
  console.log("");
}

function printCandidates(report) {
  console.log("## Duplicate / Stale Candidates");
  console.log("");
  console.log("| Candidate document | Suspected issue | Possible source of truth | Evidence | Recommended handling |");
  console.log("|---|---|---|---|---|");
  const rows = report.duplicateOrStaleCandidates;
  if (rows.length === 0) {
    console.log("| None detected | none | n/a | no obvious duplicate/stale signals | keep |");
  } else {
    for (const item of rows.slice(0, 30)) {
      console.log(`| ${escapeCell(item.candidateDocument)} | ${escapeCell(item.suspectedIssue)} | ${escapeCell(item.possibleSourceOfTruth)} | ${escapeCell(item.evidence)} | ${escapeCell(item.recommendedHandling)} |`);
    }
  }
  console.log("");
}

function printArchiveSuggestions(report) {
  console.log("## Archive Suggestions");
  console.log("");
  console.log("| Document | Proposed archive path | Reason | Replacement / source of truth | Approval needed | Status |");
  console.log("|---|---|---|---|---|---|");
  if (report.archiveSuggestions.length === 0) {
    console.log("| None | n/a | no archive candidate detected | n/a | Yes before any future archive | SUGGESTED |");
  } else {
    for (const item of report.archiveSuggestions.slice(0, 30)) {
      console.log(`| ${escapeCell(item.document)} | ${escapeCell(item.proposedArchivePath)} | ${escapeCell(item.reason)} | ${escapeCell(item.replacementOrSourceOfTruth)} | ${item.approvalNeeded} | ${item.status} |`);
    }
  }
  console.log("");
}

function printDeprecationSuggestions(report) {
  console.log("## Deprecation Suggestions");
  console.log("");
  console.log("| Document | Suggested deprecation note | Why | Approval needed | Status |");
  console.log("|---|---|---|---|---|");
  if (report.deprecationSuggestions.length === 0) {
    console.log("| None | n/a | no deprecation candidate detected | Yes before any future deprecation note | SUGGESTED |");
  } else {
    for (const item of report.deprecationSuggestions.slice(0, 30)) {
      console.log(`| ${escapeCell(item.document)} | ${escapeCell(item.suggestedDeprecationNote)} | ${escapeCell(item.why)} | ${item.approvalNeeded} | ${item.status} |`);
    }
  }
  console.log("");
}

function printBoundary(report) {
  console.log("## Boundary");
  console.log("");
  console.log(`- This report deletes files: ${report.boundary.deletesFiles}`);
  console.log(`- This report authorizes deletion: ${report.boundary.authorizesDeletion}`);
  console.log(`- This report moves or archives files: ${report.boundary.movesOrArchivesFiles}`);
  console.log(`- This report changes source of truth: ${report.boundary.changesSourceOfTruth}`);
  console.log(`- This report changes AGENTS, CI, hooks, release, legal, security, or production docs: ${report.boundary.changesGovernanceOrRiskDocs}`);
  console.log(`- This report approves implementation or cleanup work: ${report.boundary.approvesImplementationOrCleanup}`);
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}
