#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "intent", "evidence"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._?.slice(1).join(" ") || "").trim();
const evidencePaths = normalizeList(args.evidence);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const report = buildReport(projectRoot, intent, evidencePaths);
if (args.json) console.log(JSON.stringify(report, null, 2));
else printReport(report);

function buildReport(root, userIntent, explicitEvidencePaths) {
  const paths = listFiles(root);
  const explicitEvidence = collectEvidence(root, explicitEvidencePaths);
  const hasCode = paths.some((item) => /\.(html|tsx?|jsx?|swift|kt|java|vue|svelte)$/.test(item));
  const hasPackage = fs.existsSync(path.join(root, "package.json"));
  const packageJson = readJson(path.join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  const hasRun = Boolean(scripts.dev || scripts.start || scripts.serve) || paths.some((item) => item.endsWith("index.html"));
  const hasTest = Boolean(scripts.test || scripts.check || scripts["smoke"]);
  const hasPassingExplicitEvidence = explicitEvidence.some((item) => item.status === "pass");
  const hasVerification = hasTest || hasPassingExplicitEvidence;
  const hasFinalReport = paths.some((item) => item.startsWith("final-reports/"));
  const hasFirstSlice = paths.some((item) => item.startsWith("ordinary-first-slices/") || item.startsWith("beginner-entry-cards/"));
  const state = hasCode && hasRun && hasVerification ? "RUNNABLE_MVP" : hasFirstSlice ? "FIRST_SLICE_DEFINED" : "IDEA_ONLY";
  return {
    reportType: "PRODUCT_COMPLETENESS_REPORT",
    generatedBy: "scripts/resolve-product-completeness.mjs",
    projectRoot: root,
    readOnly: true,
    intent: userIntent || "not provided",
    state,
    canSomeoneTryItNow: state === "RUNNABLE_MVP" ? "Yes, locally" : "No",
    explicitEvidence,
    checklist: [
      ["Target user", hasFirstSlice ? "pass" : "fail", evidence(paths, "ordinary-first-slices") || evidence(paths, "beginner-entry-cards")],
      ["Core flow", hasFirstSlice ? "pass" : "fail", evidence(paths, "ordinary-first-slices") || "not recorded"],
      ["Screen/API/data surface", hasCode ? "pass" : "fail", hasCode ? "source files detected" : "not detected"],
      ["Permission and risk boundary", hasFirstSlice ? "pass" : "fail", hasFirstSlice ? "first-slice boundary" : "not recorded"],
      ["Empty and error states", paths.some((item) => /README|final-reports|docs/.test(item)) ? "pass" : "fail", "docs/final report scan"],
      ["Local run or demo instructions", hasRun ? "pass" : "fail", hasPackage ? "package.json or static index" : "not detected"],
      ["Verification evidence", hasVerification ? "pass" : "fail", hasPassingExplicitEvidence ? explicitEvidence.filter((item) => item.status === "pass").map((item) => item.path).join(", ") : hasTest ? "package script" : "not detected"],
      ["Trial or handoff instructions", hasFinalReport ? "pass" : "fail", hasFinalReport ? "final report" : "not detected"],
      ["Feedback or issue capture", paths.some((item) => /README|final-reports/.test(item)) ? "pass" : "fail", "README/final report"],
      ["Next version backlog", hasFirstSlice ? "pass" : "fail", hasFirstSlice ? "first-slice backlog" : "not recorded"],
    ],
  };
}

function printReport(report) {
  console.log("# Product Completeness Report");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`Current product state: \`${report.state}\``);
  console.log("");
  console.log(`Can someone try it now: ${report.canSomeoneTryItNow}`);
  console.log("");
  console.log(`Recommended next action: ${report.state === "RUNNABLE_MVP" ? "Run local verification and prepare internal trial notes." : "Complete missing first-version surfaces before claiming a runnable MVP."}`);
  console.log("");
  console.log("## Product State");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log("| Target user | see checklist |");
  console.log("| Core flow | see checklist |");
  console.log("| Platform | inferred from project files |");
  console.log(`| State | \`${report.state}\` |`);
  console.log("");
  console.log("## Product Completeness Checklist");
  console.log("");
  console.log("| Surface | Status | Evidence |");
  console.log("|---|---|---|");
  report.checklist.forEach(([surface, status, itemEvidence]) => console.log(`| ${surface} | ${status} | ${itemEvidence || "not recorded"} |`));
  console.log("");
  console.log("## Trial / Run Evidence");
  console.log("");
  console.log("| Item | Status | Evidence |");
  console.log("|---|---|---|");
  console.log(`| Local run | ${report.canSomeoneTryItNow === "Yes, locally" ? "pass" : "not verified"} | package script or static app |`);
  console.log(`| Core flow verification | ${report.state === "RUNNABLE_MVP" ? "pass" : "not verified"} | test, smoke command, or explicit evidence |`);
  if (report.explicitEvidence.length > 0) {
    for (const item of report.explicitEvidence) {
      console.log(`| Explicit evidence: ${item.path} | ${item.status} | ${item.summary} |`);
    }
  }
  console.log("");
  console.log("## Gaps");
  console.log("");
  gaps(report).forEach((gap, index) => console.log(`${index + 1}. ${gap}`));
  console.log("");
  console.log("## Next Actions");
  console.log("");
  console.log("1. Fix the highest-priority missing product surface.");
  console.log("2. Re-run product completeness after verification.");
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This report writes target files: No");
  console.log("- This report approves implementation: No");
  console.log("- This report approves release or production: No");
  console.log("- This report replaces Safe Launch: No");
  console.log("- This report proves real users can use the product: No");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log("`PRODUCT_COMPLETENESS_RECORDED`");
}

function gaps(report) {
  const missing = report.checklist.filter(([, status]) => status !== "pass").map(([surface]) => surface);
  return missing.length ? missing.map((surface) => `${surface} is missing or not verified.`) : ["No blocking local MVP gaps found; still not a production release approval."];
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const ignored = new Set([".git", "node_modules", ".next", "dist", "build"]);
  function walk(dir, prefix = "") {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (ignored.has(entry.name)) return [];
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full, rel);
      return [rel];
    });
  }
  return walk(root).slice(0, 500);
}

function evidence(paths, prefix) {
  return paths.find((item) => item.startsWith(`${prefix}/`)) || "";
}

function normalizeList(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => String(item || "").split(",")).map((item) => item.trim()).filter(Boolean);
}

function collectEvidence(root, relativePaths) {
  return relativePaths.map((relativePath) => {
    const fullPath = path.resolve(root, relativePath);
    const rel = path.relative(root, fullPath);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return { path: relativePath, status: "fail", summary: "outside project root" };
    }
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return { path: relativePath, status: "fail", summary: "evidence file missing" };
    }
    const content = fs.readFileSync(fullPath, "utf8");
    const hasFailure = /\b(fail|failed|failure|exception)\b|error:/i.test(content);
    const hasPass = /\b(pass|passed|success|successful|ok)\b/i.test(content);
    return {
      path: relativePath,
      status: hasPass && !hasFailure ? "pass" : "review",
      summary: firstLine(content) || "evidence file recorded",
    };
  });
}

function firstLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
}

function readJson(file) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  } catch {
    return null;
  }
}
