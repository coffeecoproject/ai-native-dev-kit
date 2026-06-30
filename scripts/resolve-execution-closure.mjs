#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "task",
  "verification",
  "review-surface-ref",
  "review-loop-ref",
  "change-boundary-ref",
  "verification-file",
  "debt-handoff-ref",
  "delivery-path-ref",
  "base",
  "cached",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "").trim();
const task = String(args.task || "").trim();
const verification = String(args.verification || "").trim();
const evidenceRefs = {
  reviewSurface: stringArg("review-surface-ref"),
  reviewLoop: stringArg("review-loop-ref"),
  changeBoundary: stringArg("change-boundary-ref"),
  verificationFile: stringArg("verification-file"),
  debtHandoff: stringArg("debt-handoff-ref"),
  deliveryPath: stringArg("delivery-path-ref"),
};
const diffOptions = {
  base: stringArg("base"),
  cached: Boolean(args.cached),
};

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, intent, task, verification, evidenceRefs, diffOptions);

if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReport(root, userIntent, taskRef, verificationEvidence, refs, diff) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const evidence = collectEvidence(root, refs, verificationEvidence);
  const signals = collectSignals(root, paths, userIntent, evidence, diff);
  const closure = classifyClosure(signals, evidence, userIntent, taskRef);
  const surfaces = reviewSurfaceClosure(signals, evidence);
  const decisions = decisionsFor(closure, signals, evidence, surfaces);

  return {
    reportType: "EXECUTION_REVIEW_CLOSURE",
    generatedBy: "scripts/resolve-execution-closure.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    taskContext: {
      taskOrChange: taskRef || userIntent || "Not provided",
      relatedTaskCard: taskRef || "N/A",
      userIntent: userIntent || "Not provided",
      deliveryPathState: evidence.deliveryPath.state || "N/A",
      reviewSurfaceSource: evidence.reviewSurface.ref || "inferred from changed files, intent, and project signals",
    },
    humanDecisionSummary: {
      conclusion: `Closure state is ${closure.state}.`,
      recommendedChoice: closure.recommendedChoice,
      canAiContinueNow: closure.canAiContinueNow,
      needFromHuman: decisions.length > 0 ? decisions.join(" / ") : "No decision needed for read-only closure reporting.",
      ifNothing: "No files are changed. No task state, debt, commit, push, release, or production behavior is approved.",
    },
    evidenceLinks: evidenceLinksFor(evidence, diff),
    changeSummary: {
      changedFilesCount: signals.changedFiles.length,
      changedFilesReviewed: changedFilesReviewed(signals, evidence),
      changedFiles: signals.changedFiles.slice(0, 12),
      whatChanged: signals.changedFiles.length > 0
        ? `Detected changed files: ${signals.changedFiles.slice(0, 8).map((item) => item.path).join(", ")}`
        : "No changed files were detected by this read-only closure.",
      whyItChanged: userIntent || taskRef || "Not provided. Record the task reason before treating closure as ready.",
    },
    reviewSurfaceClosure: surfaces,
    verificationClosure: verificationClosure(signals, evidence),
    scopeBoundaryClosure: {
      intendedScope: taskRef || userIntent || evidence.changeBoundary.intendedScope || "Not provided",
      outOfScopeChangesFound: outOfScopeValue(signals, evidence),
      highRiskSurfacesTouched: signals.highRisk ? "Yes" : "No",
      requiresHumanDecision: closure.state === "NEEDS_HUMAN_DECISION" || closure.state === "BLOCKED" ? "Yes" : "No",
      changeBoundaryRef: evidence.changeBoundary.ref || "N/A",
    },
    debtClosure: {
      debtResult: debtResultFor(evidence, signals),
      debtBlocksReleaseReview: evidence.debtHandoff.blocksReleaseReview || (signals.releaseRisk && !signals.verificationPassed ? "Yes" : "No"),
      handoffNeeded: evidence.debtHandoff.debtStatus === "pass" ? "No" : signals.changedFiles.length > 0 ? "Yes" : "No",
      handoffRef: evidence.debtHandoff.ref || "N/A",
    },
    commitReadiness: {
      closureState: closure.state,
      canPrepareCommitReview: closure.state === "READY_FOR_COMMIT_REVIEW" ? "Yes" : closure.state === "CLOSE_WITH_LIMITATIONS" ? "Limited" : "No",
      commitScopeReady: closure.state === "READY_FOR_COMMIT_REVIEW" ? "Yes" : "No",
      requiredBeforeCommitReview: closure.requiredBeforeCommitReview,
    },
    humanDecisions: decisions,
    boundaries: {
      writesTargetFiles: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      changesTaskState: "No",
      forgivesDebt: "No",
      replacesReviewLoop: "No",
      replacesSafeLaunch: "No",
      authorizesCommitOrPush: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: closure.outcome,
  };
}

function collectSignals(root, paths, userIntent, evidence, diff) {
  const git = readGitStatus(root, diff);
  const changedFiles = git.files.filter((item) => !isNoiseFile(item.path));
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  const allText = [
    paths.join("\n"),
    JSON.stringify(packageJson || {}),
    userIntent,
    changedFiles.map((item) => item.path).join("\n"),
    evidence.reviewSurface.content || "",
    evidence.changeBoundary.content || "",
  ].join("\n");
  const verificationStatus = classifyVerification([
    evidence.verificationNote,
    evidence.verificationFile.content || "",
  ].join("\n"));
  return {
    exists: fs.existsSync(root),
    git,
    changedFiles,
    dirty: changedFiles.length > 0,
    verificationStatus,
    verificationPassed: verificationStatus === "pass",
    verificationFailed: verificationStatus === "fail",
    hasVerificationPath: /\b(test|check|lint|typecheck|e2e|verify)\b/i.test(Object.keys(scripts).join(" ")),
    highRisk: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token|ci|workflow|hook)\b/i.test(allText),
    releaseRisk: /\b(release|production|deploy|rollback|staging|ci|workflow|hook|launch)\b/i.test(allText),
    outOfScopeRisk: changedFiles.length > 12,
  };
}

function collectEvidence(root, refs, verificationEvidence) {
  const reviewSurface = readEvidenceRef(root, refs.reviewSurface, "Review Surface Card");
  const reviewLoop = readEvidenceRef(root, refs.reviewLoop, "Review Loop / Reviewer Evidence");
  const changeBoundary = readEvidenceRef(root, refs.changeBoundary, "Change Boundary Report");
  const verificationFile = readEvidenceRef(root, refs.verificationFile, "Verification File");
  const debtHandoff = readEvidenceRef(root, refs.debtHandoff, "Debt Handoff Report");
  const deliveryPath = readEvidenceRef(root, refs.deliveryPath, "Delivery Path Report");

  reviewSurface.selectedSurfaces = reviewSurface.content ? parseSelectedSurfaces(reviewSurface.content) : [];
  reviewLoop.reviewStatus = classifyReviewLoop(reviewLoop.content);
  changeBoundary.boundaryStatus = classifyChangeBoundary(changeBoundary.content);
  changeBoundary.intendedScope = parseTableValue(changeBoundary.content, "Intended scope") || parseSectionLine(changeBoundary.content, "Allowed paths") || "";
  debtHandoff.debtStatus = classifyDebtHandoff(debtHandoff.content);
  debtHandoff.blocksReleaseReview = debtHandoff.content && /Blocks release review\?\s*\|\s*Yes/i.test(debtHandoff.content) ? "Yes" : "No";
  deliveryPath.state = parseDeliveryState(deliveryPath.content);

  const evidence = {
    verificationNote: verificationEvidence,
    reviewSurface,
    reviewLoop,
    changeBoundary,
    verificationFile,
    debtHandoff,
    deliveryPath,
  };
  evidence.hasAnyRef = Object.values(refs).some(Boolean);
  evidence.hasInvalidRef = [reviewSurface, reviewLoop, changeBoundary, verificationFile, debtHandoff, deliveryPath]
    .some((item) => item.provided && item.status !== "found");
  return evidence;
}

function classifyClosure(signals, evidence, userIntent, taskRef) {
  if (!signals.exists) {
    return closure("BLOCKED", "Confirm the project path before closure.", "no", "Project cannot be read.", "BLOCKED");
  }
  if (evidence.hasInvalidRef) {
    return closure("BLOCKED", "Fix unreadable evidence references before closure.", "no", "All provided evidence refs must be readable.", "BLOCKED");
  }
  if (signals.verificationFailed) {
    return closure("BLOCKED", "Fix or record failed verification before closure.", "no", "Verification failed.", "BLOCKED");
  }
  if (evidence.changeBoundary.boundaryStatus === "fail") {
    return closure("BLOCKED", "Resolve out-of-scope or forbidden changes before closure.", "no", "Change boundary failed.", "BLOCKED");
  }
  if (evidence.debtHandoff.debtStatus === "fail") {
    return closure("NEEDS_HUMAN_DECISION", "Debt or handoff evidence needs human decision before closure.", "limited", "Resolve or explicitly route blocking debt.", "NEEDS_HUMAN_DECISION");
  }

  const hasExecutionContext = signals.changedFiles.length > 0 || userIntent || taskRef || evidence.hasAnyRef || evidence.verificationNote;
  if (!hasExecutionContext) {
    return closure("NOT_READY_TO_CLOSE", "No execution evidence was detected. Use closure after a task, verification, or changed scope exists.", "no", "Task, intent, changed files, or verification evidence.", "NEEDS_HUMAN_DECISION");
  }

  const evidenceLinkedReady = (signals.changedFiles.length > 0 || userIntent || taskRef)
    && signals.verificationPassed
    && evidence.reviewSurface.status === "found"
    && evidence.reviewLoop.reviewStatus === "pass"
    && evidence.changeBoundary.boundaryStatus === "pass"
    && evidence.debtHandoff.debtStatus === "pass";

  if (evidenceLinkedReady) {
    return closure("READY_FOR_COMMIT_REVIEW", "Prepare a commit review summary; do not commit or push without the current workflow allowing it.", "limited", "Human review of commit scope.", "CLOSURE_RECORDED");
  }

  if (signals.changedFiles.length > 0 && signals.verificationPassed) {
    return closure("CLOSE_WITH_LIMITATIONS", "Record a limited closure and list missing review, boundary, or debt evidence before commit review.", "limited", missingEvidenceSummary(evidence), "CLOSURE_RECORDED");
  }

  if (signals.highRisk && !signals.verificationPassed) {
    return closure("NEEDS_HUMAN_DECISION", "High-risk work needs explicit verification and human decision before closure.", "limited", "Provide verification evidence and risk decision.", "NEEDS_HUMAN_DECISION");
  }

  if (signals.changedFiles.length > 0) {
    return closure("NOT_READY_TO_CLOSE", "Run or record verification before closing this execution.", "limited", "Verification evidence.", "NEEDS_HUMAN_DECISION");
  }

  return closure("CLOSE_WITH_LIMITATIONS", "Record that no changed files were detected and keep closure limited to the supplied context.", "limited", "Confirm whether there was actually implementation work to close.", "CLOSURE_RECORDED");
}

function closure(state, recommendedChoice, canAiContinueNow, requiredBeforeCommitReview, outcome) {
  return {
    state,
    recommendedChoice,
    canAiContinueNow,
    requiredBeforeCommitReview,
    outcome,
  };
}

function reviewSurfaceClosure(signals, evidence) {
  const selected = selectedSurfaces(evidence);
  return selected.map((surfaceName) => {
    if (surfaceName === "VERIFICATION_REVIEW") {
      return surface(surfaceName, signals.verificationStatus, verificationEvidenceSummary(evidence, signals), signals.verificationPassed ? "N/A" : "Verification must be run or recorded.");
    }
    if (surfaceName === "DEBT_REVIEW") {
      const result = evidence.debtHandoff.debtStatus;
      return surface(surfaceName, result, result === "pass" ? `debt handoff evidence: ${evidence.debtHandoff.ref}` : "debt handoff evidence missing, blocking, or not verified", result === "pass" ? "N/A" : "Debt or handoff needs review.");
    }
    const reviewResult = evidence.reviewLoop.reviewStatus;
    const evidenceText = reviewResult === "pass"
      ? `review-loop evidence: ${evidence.reviewLoop.ref}`
      : "review-loop/reviewer evidence not provided or not passing; changed files are not proof";
    return surface(surfaceName, reviewResult, evidenceText, reviewResult === "pass" ? "N/A" : "Review evidence required before marking this surface pass.");
  });
}

function selectedSurfaces(evidence) {
  return unique([
    ...evidence.reviewSurface.selectedSurfaces,
    "FUNCTIONAL_REVIEW",
    "CODE_REVIEW",
    "VERIFICATION_REVIEW",
    "DEBT_REVIEW",
  ]);
}

function surface(surfaceName, result, evidence, unverifiedReasonOrOwner) {
  return { surface: surfaceName, result, evidence, unverifiedReasonOrOwner };
}

function verificationClosure(signals, evidence) {
  return [
    { check: "Verification commands", status: signals.verificationStatus, evidence: verificationEvidenceSummary(evidence, signals), owner: "Codex" },
    { check: "Manual verification", status: "not verified", evidence: "manual verification was not provided to this read-only resolver", owner: "Codex / human" },
    { check: "Unverified items named", status: signals.verificationStatus === "pass" ? "pass" : "pass", evidence: signals.verificationStatus === "pass" ? "no unresolved verification items detected by provided evidence" : "unverified verification/manual checks are named", owner: "Codex" },
  ];
}

function evidenceLinksFor(evidence, diff) {
  return [
    link("Review Surface Card", evidence.reviewSurface, evidence.reviewSurface.selectedSurfaces.length > 0 ? `selected surfaces: ${evidence.reviewSurface.selectedSurfaces.join(", ")}` : "defines required surfaces when provided"),
    link("Review Loop / Reviewer Evidence", evidence.reviewLoop, `review status: ${evidence.reviewLoop.reviewStatus}`),
    link("Change Boundary Report", evidence.changeBoundary, `boundary status: ${evidence.changeBoundary.boundaryStatus}`),
    link("Verification File", evidence.verificationFile, `verification file status: ${classifyVerification(evidence.verificationFile.content)}`),
    {
      type: "Verification Note",
      ref: evidence.verificationNote ? "inline --verification" : "N/A",
      status: evidence.verificationNote ? classifyVerification(evidence.verificationNote) : "not provided",
      usedFor: "VERIFICATION_REVIEW",
      note: evidence.verificationNote ? "inline verification note classified without executing commands" : "no inline verification note provided",
    },
    link("Debt Handoff Report", evidence.debtHandoff, `debt status: ${evidence.debtHandoff.debtStatus}`),
    link("Delivery Path Report", evidence.deliveryPath, evidence.deliveryPath.state ? `delivery path state: ${evidence.deliveryPath.state}` : "delivery path state not provided"),
    {
      type: "Git Diff Scope",
      ref: diff.base ? `--base ${diff.base}` : diff.cached ? "--cached" : "git status --porcelain",
      status: "read-only",
      usedFor: "CHANGE_SUMMARY",
      note: "diff source used only to list changed files",
    },
  ];
}

function link(type, item, note) {
  return {
    type,
    ref: item.ref || "N/A",
    status: item.status || "not provided",
    usedFor: evidenceUseFor(type),
    note,
  };
}

function evidenceUseFor(type) {
  if (type === "Review Surface Card") return "REVIEW_SURFACE_SELECTION";
  if (type === "Review Loop / Reviewer Evidence") return "FUNCTIONAL_REVIEW, CODE_REVIEW, selected review surfaces";
  if (type === "Change Boundary Report") return "SCOPE_BOUNDARY";
  if (type === "Verification File") return "VERIFICATION_REVIEW";
  if (type === "Debt Handoff Report") return "DEBT_REVIEW";
  if (type === "Delivery Path Report") return "DELIVERY_PATH_STATE";
  return "N/A";
}

function changedFilesReviewed(signals, evidence) {
  if (signals.changedFiles.length === 0) return "not verified";
  if (evidence.changeBoundary.boundaryStatus === "pass") return "pass";
  if (evidence.changeBoundary.boundaryStatus === "fail") return "fail";
  return "not verified";
}

function outOfScopeValue(signals, evidence) {
  if (evidence.changeBoundary.boundaryStatus === "pass") return "No";
  if (evidence.changeBoundary.boundaryStatus === "fail") return "Yes";
  return signals.outOfScopeRisk ? "Unknown" : "Unknown";
}

function debtResultFor(evidence, signals) {
  if (evidence.debtHandoff.debtStatus === "pass") return "deferred";
  if (evidence.debtHandoff.debtStatus === "fail") return "needs human decision";
  if (signals.changedFiles.length > 0) return "not reviewed";
  return "not reviewed";
}

function decisionsFor(closureInfo, signals, evidence, surfaces) {
  const decisions = [];
  if (closureInfo.state === "BLOCKED") decisions.push("Confirm whether to stop and repair the blocking issue before any follow-up.");
  if (closureInfo.state === "NEEDS_HUMAN_DECISION") decisions.push("Confirm whether the high-risk or unverified work may proceed to a separate review task.");
  if (!signals.verificationPassed) decisions.push("Confirm the verification evidence required before closure.");
  if (signals.changedFiles.length > 0 && evidence.changeBoundary.boundaryStatus !== "pass") decisions.push("Confirm the change-boundary evidence before commit review.");
  if (surfaces.some((item) => item.result === "not verified")) decisions.push("Confirm owner for unverified review surfaces.");
  if (evidence.debtHandoff.debtStatus !== "pass" && signals.changedFiles.length > 0) decisions.push("Confirm whether debt handoff is required before closure.");
  if (closureInfo.state === "READY_FOR_COMMIT_REVIEW") decisions.push("Confirm whether Codex should prepare a commit summary; this does not approve commit or push.");
  if (decisions.length === 0) decisions.push("Confirm whether this limited closure is enough for the current task.");
  return decisions.slice(0, signals.highRisk ? 5 : 3);
}

function classifyVerification(value) {
  const text = String(value || "").trim();
  if (!text) return "not verified";
  if (/\b(fail|failed|failing|error|broken|失败|报错|未通过)\b/i.test(text)) return "fail";
  if (/\b(pass|passed|ok|success|green|通过|成功)\b/i.test(text)) return "pass";
  return "not verified";
}

function classifyReviewLoop(content) {
  const text = String(content || "");
  if (!text) return "not verified";
  if (/\b(FAIL|FAILED|BLOCKED|NEEDS_HUMAN_DECISION)\b/i.test(text)) return "fail";
  if (/\b(PASS|PASSED|READY_FOR_COMMIT_REVIEW|REVIEW_PASSED)\b/i.test(text)) return "pass";
  return "not verified";
}

function classifyChangeBoundary(content) {
  const text = String(content || "");
  if (!text) return "not verified";
  if (/\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*No\s*\|/i.test(text) || /Disposition:\s*`?FAIL`?/i.test(text) || /Forbidden paths?:.+\n[\s\S]*Actual Changed Files[\s\S]*\|\s*No\s*\|/i.test(text)) return "fail";
  if (/Disposition:\s*`?PASS`?/i.test(text) || /Boundary Result[\s\S]*`?PASS`?/i.test(text)) return "pass";
  return "not verified";
}

function classifyDebtHandoff(content) {
  const text = String(content || "");
  if (!text) return "not verified";
  if (/\bD[34]_/i.test(text) || /Blocks release review\?\s*\|\s*Yes/i.test(text) || /\bNEEDS_HUMAN_DECISION\b/i.test(text)) return "fail";
  if (/\bHANDOFF_RECORDED\b/i.test(text) || /\bD[012]_/i.test(text) || /Debt result\s*\|\s*(fixed|deferred)/i.test(text)) return "pass";
  return "not verified";
}

function parseSelectedSurfaces(content) {
  const body = sectionBody(content, "Selected Review Surfaces");
  const surfaces = [...body.matchAll(/\|\s*`?([A-Z][A-Z0-9_]+)`?\s*\|/g)].map((match) => match[1]);
  return unique(surfaces.filter((item) => item.endsWith("_REVIEW")));
}

function parseDeliveryState(content) {
  return parseTableValue(content, "Current state").replace(/`/g, "") || "";
}

function parseTableValue(content, key) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(key)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = String(content || "").match(pattern);
  return match ? match[1].trim() : "";
}

function parseSectionLine(content, section) {
  const body = sectionBody(content, section);
  return body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0] || "";
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = String(content || "").match(pattern);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = String(content).slice(start);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function verificationEvidenceSummary(evidence, signals) {
  const parts = [];
  if (evidence.verificationFile.ref) parts.push(`verification file: ${evidence.verificationFile.ref}`);
  if (evidence.verificationNote) parts.push("inline verification note");
  if (parts.length === 0 && signals.hasVerificationPath) parts.push("verification path detected but result not provided");
  if (parts.length === 0) parts.push("no verification evidence provided");
  return `${parts.join("; ")}; status=${signals.verificationStatus}`;
}

function missingEvidenceSummary(evidence) {
  const missing = [];
  if (evidence.reviewSurface.status !== "found") missing.push("review surface ref");
  if (evidence.reviewLoop.reviewStatus !== "pass") missing.push("passing review-loop/reviewer evidence");
  if (evidence.changeBoundary.boundaryStatus !== "pass") missing.push("passing change-boundary evidence");
  if (evidence.debtHandoff.debtStatus !== "pass") missing.push("non-blocking debt handoff evidence");
  return missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "Human review of commit scope.";
}

function readGitStatus(root, diff) {
  const inside = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") {
    return { isGitRepository: false, files: [] };
  }
  const gitArgs = diff.base
    ? ["-C", root, "diff", "--name-status", diff.base, "--", "."]
    : diff.cached
      ? ["-C", root, "diff", "--cached", "--name-status", "--", "."]
      : ["-C", root, "status", "--porcelain", "--", "."];
  const status = spawnSync("git", gitArgs, { encoding: "utf8" });
  const files = status.status === 0
    ? status.stdout.split("\n").map((line) => line.trimEnd()).filter(Boolean).map(diff.base || diff.cached ? parseNameStatusLine : parsePorcelainLine)
    : [];
  return { isGitRepository: true, files };
}

function parsePorcelainLine(line) {
  const status = line.slice(0, 2).trim() || "??";
  const rawPath = line.slice(3).replace(/^"|"$/g, "");
  const renamed = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return { status, path: renamed };
}

function parseNameStatusLine(line) {
  const [status, ...parts] = line.split(/\t+/);
  const rawPath = parts.at(-1) || "";
  return { status: status || "M", path: rawPath.replace(/^"|"$/g, "") };
}

function readEvidenceRef(root, ref, label) {
  if (!ref) {
    return { label, ref: "", status: "not provided", content: "", provided: false };
  }
  const resolved = path.isAbsolute(ref) ? path.resolve(ref) : path.resolve(root, ref);
  const rootWithSep = `${path.resolve(root)}${path.sep}`;
  if (resolved !== path.resolve(root) && !resolved.startsWith(rootWithSep)) {
    return { label, ref, status: "invalid", content: "", provided: true };
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return { label, ref, status: "missing", content: "", provided: true };
  }
  return { label, ref: path.relative(root, resolved).replaceAll(path.sep, "/"), status: "found", content: fs.readFileSync(resolved, "utf8"), provided: true };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function printHuman(report) {
  console.log("# Execution Closure Report");
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
  console.log("## Task Context");
  printTable([
    ["Field", "Value"],
    ["Task / change", report.taskContext.taskOrChange],
    ["Related task card", report.taskContext.relatedTaskCard],
    ["User intent", report.taskContext.userIntent],
    ["Delivery path state", report.taskContext.deliveryPathState],
    ["Review surface source", report.taskContext.reviewSurfaceSource],
  ]);
  console.log("");
  console.log("## Evidence Links");
  console.log("");
  console.log("| Evidence | Ref | Status | Used for | Note |");
  console.log("|---|---|---|---|---|");
  for (const item of report.evidenceLinks) {
    console.log(`| ${escapeCell(item.type)} | ${escapeCell(item.ref)} | ${escapeCell(item.status)} | ${escapeCell(item.usedFor)} | ${escapeCell(item.note)} |`);
  }
  console.log("");
  console.log("## Change Summary");
  printTable([
    ["Field", "Value"],
    ["Changed files count", report.changeSummary.changedFilesCount],
    ["Changed files reviewed", report.changeSummary.changedFilesReviewed],
    ["What changed", report.changeSummary.whatChanged],
    ["Why it changed", report.changeSummary.whyItChanged],
  ]);
  console.log("");
  console.log("## Review Surface Closure");
  console.log("");
  console.log("| Surface | Result | Evidence | Unverified reason / owner |");
  console.log("|---|---|---|---|");
  for (const item of report.reviewSurfaceClosure) {
    console.log(`| \`${item.surface}\` | ${item.result} | ${escapeCell(item.evidence)} | ${escapeCell(item.unverifiedReasonOrOwner)} |`);
  }
  console.log("");
  console.log("## Verification Closure");
  console.log("");
  console.log("| Check | Status | Evidence | Owner |");
  console.log("|---|---|---|---|");
  for (const item of report.verificationClosure) {
    console.log(`| ${escapeCell(item.check)} | ${item.status} | ${escapeCell(item.evidence)} | ${escapeCell(item.owner)} |`);
  }
  console.log("");
  console.log("## Scope Boundary Closure");
  printTable([
    ["Field", "Value"],
    ["Intended scope", report.scopeBoundaryClosure.intendedScope],
    ["Out-of-scope changes found", report.scopeBoundaryClosure.outOfScopeChangesFound],
    ["High-risk surfaces touched", report.scopeBoundaryClosure.highRiskSurfacesTouched],
    ["Requires human decision", report.scopeBoundaryClosure.requiresHumanDecision],
    ["Change boundary ref", report.scopeBoundaryClosure.changeBoundaryRef],
  ]);
  console.log("");
  console.log("## Debt Closure");
  printTable([
    ["Field", "Value"],
    ["Debt result", report.debtClosure.debtResult],
    ["Debt blocks release review", report.debtClosure.debtBlocksReleaseReview],
    ["Handoff needed", report.debtClosure.handoffNeeded],
    ["Handoff ref", report.debtClosure.handoffRef],
  ]);
  console.log("");
  console.log("## Commit Readiness");
  printTable([
    ["Field", "Value"],
    ["Closure state", `\`${report.commitReadiness.closureState}\``],
    ["Can prepare commit review?", report.commitReadiness.canPrepareCommitReview],
    ["Commit scope ready?", report.commitReadiness.commitScopeReady],
    ["Required before commit review", report.commitReadiness.requiredBeforeCommitReview],
  ]);
  console.log("");
  console.log("## Human Decisions");
  console.log("");
  for (const [index, item] of report.humanDecisions.entries()) console.log(`${index + 1}. ${item}`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This closure writes target files: ${report.boundaries.writesTargetFiles}`);
  console.log(`- This closure approves implementation: ${report.boundaries.approvesImplementation}`);
  console.log(`- This closure approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This closure changes task state: ${report.boundaries.changesTaskState}`);
  console.log(`- This closure forgives debt: ${report.boundaries.forgivesDebt}`);
  console.log(`- This closure replaces Review Loop: ${report.boundaries.replacesReviewLoop}`);
  console.log(`- This closure replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log(`- This closure authorizes commit or push: ${report.boundaries.authorizesCommitOrPush}`);
  console.log(`- This closure approves security/privacy/compliance/payment/migration decisions: ${report.boundaries.approvesHighRiskDecisions}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printTable(rows) {
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  for (const [key, value] of rows.slice(1)) {
    console.log(`| ${escapeCell(key)} | ${escapeCell(value)} |`);
  }
}

function stringArg(name) {
  const value = args[name];
  return typeof value === "string" ? value.trim() : "";
}

function isNoiseFile(filePath) {
  return [".DS_Store"].includes(path.basename(filePath));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
