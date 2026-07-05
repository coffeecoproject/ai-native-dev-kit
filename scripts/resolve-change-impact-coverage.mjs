#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "changed-files", "mode", "from-git-diff", "cached", "base", "business-rule-ref", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const mode = String(args.mode || "preflight").trim().toLowerCase();
const explicitChangedFiles = String(args["changed-files"] || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const gitDiffRequested = Boolean(args["from-git-diff"]);
const cachedDiffRequested = Boolean(args.cached);
const baseRef = args.base ? String(args.base).trim() : "";
const businessRuleRef = args["business-rule-ref"] ? String(args["business-rule-ref"]).trim() : "";
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

if (!["preflight", "closure"].includes(mode)) {
  console.error(`FAIL unknown --mode: ${mode}`);
  console.error("Use --mode preflight or --mode closure.");
  process.exit(1);
}

if (cachedDiffRequested && baseRef) {
  console.error("FAIL --cached and --base cannot be combined.");
  process.exit(1);
}

const gitChangedFiles = gitDiffRequested
  ? readGitChangedFiles(projectRoot, { cached: cachedDiffRequested, base: baseRef })
  : [];
const changedFiles = unique([...explicitChangedFiles, ...gitChangedFiles]);
const report = buildReport(projectRoot, intent, changedFiles, mode, businessRuleRef);

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root, userIntent, explicitChangedFiles, requestedMode, linkedBusinessRuleRef) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const signals = collectSignals(root, exists, paths, userIntent, explicitChangedFiles);
  const risk = analyzeRiskSurfaces({
    intent: userIntent,
    paths: explicitChangedFiles,
    projectRoot: root,
    includeProjectSignals: false,
  });
  const changeType = classifyChangeType(signals);
  const surfaces = affectedSurfaces(signals, risk);
  const questions = questionsFor(signals, risk);
  const outcome = risk.high && highRiskNeedsDecision(surfaces) ? "NEEDS_HUMAN_DECISION" : "CHANGE_IMPACT_RECORDED";
  const businessRule = resolveBusinessRuleClosure(root, linkedBusinessRuleRef);

  return {
    reportType: "CHANGE_IMPACT_COVERAGE_REPORT",
    generatedBy: "scripts/resolve-change-impact-coverage.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    mode: requestedMode,
    intent: userIntent || "Not provided",
    businessRuleRef: linkedBusinessRuleRef || "Not provided",
    businessRuleDigest: businessRule.evidence?.business_rule_digest || "Not provided",
    businessRuleState: businessRule.evidence?.state || "Not provided",
    changedFiles: explicitChangedFiles,
    humanSummary: summaryFor(changeType, surfaces, risk),
    changeType: {
      primaryType: changeType,
      riskLevel: risk.high ? "high" : "low",
      reason: reasonFor(signals, risk),
    },
    affectedSurfaceMap: surfaces,
    outOfScopeDecisions: [],
    humanDecisionsNeeded: questions,
    implementationCoverage: surfaces.map((surface) => ({
      surface: surface.surface,
      status: surface.status === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "NOT_STARTED",
      evidence: "",
      reason: surface.status === "NOT_APPLICABLE" ? surface.reason : "Pre-execution report.",
    })),
    verificationCoverage: surfaces
      .filter((surface) => surface.surface === "TEST_COVERAGE" || surface.status === "REQUIRED")
      .map((surface) => ({
        surface: surface.surface,
        verification: surface.surface === "TEST_COVERAGE" ? "Run task-appropriate tests or smoke evidence." : "Confirm surface-specific evidence after implementation.",
        evidence: "",
        status: "NOT_STARTED",
      })),
    missedSurfaceReview: {
      missedSurfacesFound: "No",
      notes: "Pre-execution report; missed surfaces must be reviewed after implementation.",
    },
    boundaries: {
      writesTargetFiles: "No",
      authorizesImplementation: "No",
      approvesReleaseOrProduction: "No",
      replacesHumanProductJudgment: "No",
      provesEveryPossibleImpactWasFound: "No",
    },
    outcome,
    machineReadableEvidence: buildMachineReadableEvidence({
      mode: requestedMode,
      userIntent,
      changeType,
      risk,
      explicitChangedFiles,
      surfaces,
      questions,
      outcome,
      businessRuleRef: linkedBusinessRuleRef,
      businessRule,
    }),
  };
}

function buildMachineReadableEvidence({ mode: requestedMode, userIntent, changeType, risk, explicitChangedFiles, surfaces, outcome, businessRuleRef, businessRule }) {
  const evidence = {
    schema_version: "1.49.0",
    artifact_type: "change_impact_coverage",
    artifact_id: artifactId(userIntent, explicitChangedFiles),
    impact_digest: "",
    mode: requestedMode,
    user_request: {
      intent: userIntent || "Not provided",
      task_ref: "not provided",
      project_profile: "inferred from project signals",
    },
    business_rule_ref: businessRuleRef || "not provided",
    business_rule_digest: businessRule?.evidence?.business_rule_digest || "not provided",
    business_rule_state: businessRule?.evidence?.state || "not provided",
    change_type: {
      primary_type: changeType,
      risk_level: risk.high ? "high" : "low",
      reason: reasonFor(collectSignals(projectRoot, fs.existsSync(projectRoot), [], userIntent, explicitChangedFiles), risk),
    },
    changed_files: explicitChangedFiles,
    affected_surface_map: surfaces.map((surface) => ({
      surface: surface.surface,
      status: surface.status,
      reason: surface.reason,
      expected_evidence: surface.expectedEvidence,
    })),
    implementation_coverage: surfaces.map((surface) => ({
      surface: surface.surface,
      status: surface.status === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "NOT_STARTED",
      evidence: "",
      reason: surface.status === "NOT_APPLICABLE" ? surface.reason : "Pre-execution report.",
    })),
    verification_coverage: surfaces
      .filter((surface) => surface.surface === "TEST_COVERAGE" || surface.status === "REQUIRED")
      .map((surface) => ({
        surface: surface.surface,
        verification: surface.surface === "TEST_COVERAGE" ? "Run task-appropriate tests or smoke evidence." : "Confirm surface-specific evidence after implementation.",
        evidence: "",
        status: "NOT_STARTED",
      })),
    missed_surface_review: {
      missed_surfaces_found: "No",
      notes: "Pre-execution report; missed surfaces must be reviewed after implementation.",
    },
    boundaries: {
      writes_target_files: false,
      authorizes_implementation: false,
      approves_release_or_production: false,
      replaces_human_product_judgment: false,
      proves_every_possible_impact_was_found: false,
    },
    outcome,
  };
  return {
    ...evidence,
    impact_digest: evidenceDigest(evidence, ["impact_digest"]),
  };
}

function collectSignals(root, exists, paths, userIntent, explicitChangedFiles) {
  const broadText = [
    userIntent,
    paths.join("\n"),
    explicitChangedFiles.join("\n"),
    packageMetadata(root),
  ].join("\n");
  const explicitText = [
    userIntent,
    explicitChangedFiles.join("\n"),
  ].join("\n");
  const lower = broadText.toLowerCase();
  const explicitLower = explicitText.toLowerCase();
  return {
    exists,
    hasProjectSignals: exists ? hasProjectSignals(root) : false,
    isDocsOnly: /\b(docs?|documentation|readme|copy-only|docs-only)\b/i.test(userIntent) && !/\b(validation|rule|api|backend|frontend|permission|data|migration|contract|form|input)\b/i.test(userIntent),
    isCopyOnly: /\b(copy|wording|label|text)\b/i.test(userIntent) && !/\b(validation|rule|api|backend|permission|data|migration)\b/i.test(userIntent),
    isValidationRule: /\b(validation|validate|restriction|limit|rule|required|contract input|input restriction|form rule)\b/i.test(lower),
    hasUserFlow: /\b(user|flow|journey|screen|page|form|input|command|interaction|booking|contract)\b/i.test(lower),
    hasFrontend: /\b(frontend|ui|form|input|screen|page|component|wxml|wxss|css|app\.js|view|toast|disabled|client)\b/i.test(lower),
    hasApi: /\b(api|endpoint|request|response|dto|schema|contract|server|client contract)\b/i.test(lower),
    hasBackend: /\b(backend|server|service|domain|validation|permission|rule|workflow|controller|handler)\b/i.test(lower),
    hasData: /\b(data|database|db|schema|migration|enum|lookup|model|persistence|seed|storage)\b/i.test(explicitLower),
    hasErrorCopy: /\b(error|message|copy|toast|hint|empty|validation|restriction|input)\b/i.test(lower),
    hasPermission: /\b(auth|permission|permissions|role|rbac|tenant|visibility|admin|audit|privacy|security)\b/i.test(explicitLower),
    hasRelease: /\b(release|deploy|deployment|production|rollback|migration|feature flag|staging)\b/i.test(explicitLower),
    hasPaymentOrCompliance: /\b(payment|billing|invoice|tax|finance|compliance|legal|privacy|security)\b/i.test(explicitLower),
  };
}

function packageMetadata(root) {
  try {
    const file = path.join(root, "package.json");
    if (!fs.existsSync(file)) return "";
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    return JSON.stringify({
      name: pkg.name,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
    });
  } catch {
    return "";
  }
}

function classifyChangeType(signals) {
  if (signals.isDocsOnly) return "DOCS_ONLY";
  if (signals.isCopyOnly) return "COPY_ONLY";
  if (signals.hasPermission) return "PERMISSION_OR_VISIBILITY_RULE";
  if (signals.hasData) return "DATA_OR_MODEL_CHANGE";
  if (signals.isValidationRule) return "VALIDATION_OR_BUSINESS_RULE";
  if (signals.hasApi) return "API_CONTRACT_CHANGE";
  return "GENERAL_PRODUCT_CHANGE";
}

function affectedSurfaces(signals, risk) {
  const rows = new Map();
  const add = (surface, status, reason, evidence) => {
    rows.set(surface, {
      surface,
      status,
      reason,
      expectedEvidence: evidence,
    });
  };

  if (signals.isDocsOnly || signals.isCopyOnly) {
    add("DOCS_HANDOFF", "REQUIRED", "The request is docs/copy scoped.", "Updated docs, copy diff, or handoff note.");
    add("TEST_COVERAGE", "OPTIONAL", "No executable behavior is implied by current wording.", "Review evidence or not-applicable reason.");
    return [...rows.values()];
  }

  const crossSurfaceRule = signals.isValidationRule || signals.hasUserFlow || signals.hasFrontend || signals.hasBackend || signals.hasApi;
  if (crossSurfaceRule) {
    add("USER_FLOW", "REQUIRED", "The user-facing behavior or task flow may change.", "Screen, command, journey, or behavior evidence.");
    add("FRONTEND_UI", "REQUIRED", "Input, form, state, or visible behavior may need to match the rule.", "UI diff, screenshot, local behavior evidence, or not-applicable reason.");
    add("API_CONTRACT", "REQUIRED", "Client/server expectations may need to stay aligned.", "API/DTO/schema evidence or not-applicable reason.");
    add("BACKEND_RULE", "REQUIRED", "The rule should be enforced outside the UI when server/domain logic exists.", "Domain/service validation evidence or not-applicable reason.");
    add("ERROR_COPY", "REQUIRED", "Users need a clear message when the rule blocks input.", "Error copy, validation message, or not-applicable reason.");
  }

  if (signals.hasData) {
    add("DATA_MODEL", risk.high ? "NEEDS_HUMAN_DECISION" : "REQUIRED", "Data shape, enum, lookup, migration, or persistence may change.", "Schema/model/migration evidence or human decision.");
  } else {
    add("DATA_MODEL", "NOT_APPLICABLE", "No data model or persistence change is indicated by current wording.", "Reason recorded.");
  }

  if (signals.hasPermission || signals.hasPaymentOrCompliance) {
    add("PERMISSION_RISK", "NEEDS_HUMAN_DECISION", "Permission, privacy, security, finance, payment, tax, or compliance risk may be affected.", "Human decision, baseline, or explicit exclusion.");
  } else {
    add("PERMISSION_RISK", "NOT_APPLICABLE", "No permission, privacy, payment, or compliance change is indicated by current wording.", "Reason recorded.");
  }

  if (signals.hasRelease || risk.surfaces.includes("production-release")) {
    add("RELEASE_IMPACT", "NEEDS_HUMAN_DECISION", "Deployment, rollback, migration, or production behavior may be affected.", "Release/rollback decision or explicit exclusion.");
  } else {
    add("RELEASE_IMPACT", "NOT_APPLICABLE", "No release, deployment, rollback, or production change is indicated by current wording.", "Reason recorded.");
  }

  add("TEST_COVERAGE", "REQUIRED", "The change needs evidence that required behavior was checked.", "Unit, integration, smoke, behavior, fixture, or manual evidence.");
  add("DOCS_HANDOFF", "REQUIRED", "The rule and any exclusions need to be understandable later.", "Docs, handoff note, final report, or decision record.");

  return [...rows.values()];
}

function questionsFor(signals, risk) {
  const questions = [];
  if (signals.isValidationRule) questions.push("Should this rule be enforced in both UI and backend/API, or only one layer?");
  if (signals.hasPermission || signals.hasPaymentOrCompliance || risk.high) questions.push("Does this touch permissions, payment, data, production, compliance, or privacy?");
  if (signals.hasRelease) questions.push("Is release, rollback, migration, or production rollout in scope?");
  if (questions.length === 0) questions.push("Can I record the impact map before implementation without writing files?");
  return questions.slice(0, risk.high ? 5 : 3);
}

function highRiskNeedsDecision(surfaces) {
  return surfaces.some((surface) => surface.status === "NEEDS_HUMAN_DECISION");
}

function summaryFor(changeType, surfaces, risk) {
  const required = surfaces.filter((surface) => surface.status === "REQUIRED").map((surface) => surface.surface);
  return `Change type ${changeType}; ${required.length} required surfaces were identified. Risk level is ${risk.high ? "high" : "low"}.`;
}

function reasonFor(signals, risk) {
  if (risk.high) return `High-risk signals: ${risk.surfaces.join(", ") || "path safety"}.`;
  if (signals.isDocsOnly || signals.isCopyOnly) return "Current wording appears docs/copy scoped.";
  if (signals.isValidationRule) return "Validation or business-rule wording was detected.";
  return "General product change wording was detected.";
}

function printHuman(report) {
  console.log("# Change Impact Coverage Report");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(report.humanSummary);
  console.log("");
  console.log("## User Request");
  console.log("");
  console.log(`- Request: ${report.intent}`);
  console.log("- Task ref: not provided");
  console.log("- Project/profile: inferred from project signals");
  console.log(`- Business rule closure ref: ${report.businessRuleRef}`);
  console.log(`- Business rule digest: ${report.businessRuleDigest}`);
  console.log(`- Business rule state: ${report.businessRuleState}`);
  console.log("");
  console.log("## Change Type");
  console.log("");
  console.log(`- Mode: \`${report.mode}\``);
  console.log(`- Primary type: \`${report.changeType.primaryType}\``);
  console.log(`- Risk level: ${report.changeType.riskLevel}`);
  console.log(`- Reason: ${report.changeType.reason}`);
  console.log("");
  console.log("## Changed Files");
  console.log("");
  if (report.changedFiles.length > 0) report.changedFiles.forEach((file) => console.log(`- \`${file}\``));
  else console.log("- None provided.");
  console.log("");
  console.log("## Affected Surface Map");
  console.log("");
  console.log("| Surface | Status | Reason | Expected Evidence |");
  console.log("|---|---|---|---|");
  for (const row of report.affectedSurfaceMap) {
    console.log(`| \`${row.surface}\` | \`${row.status}\` | ${row.reason} | ${row.expectedEvidence} |`);
  }
  console.log("");
  console.log("## Out-of-Scope Decisions");
  console.log("");
  console.log("| Surface | Decision | Reason | Owner / Follow-up |");
  console.log("|---|---|---|---|");
  console.log("| None | None | Pre-execution report. | None |");
  console.log("");
  console.log("## Human Decisions Needed");
  console.log("");
  report.humanDecisionsNeeded.forEach((question, index) => console.log(`${index + 1}. ${question}`));
  console.log("");
  console.log("## Implementation Coverage");
  console.log("");
  console.log("| Surface | Status | Evidence | Reason |");
  console.log("|---|---|---|---|");
  for (const row of report.implementationCoverage) {
    console.log(`| \`${row.surface}\` | \`${row.status}\` | ${row.evidence || "Not started"} | ${row.reason} |`);
  }
  console.log("");
  console.log("## Verification Coverage");
  console.log("");
  console.log("| Surface | Verification | Evidence | Status |");
  console.log("|---|---|---|---|");
  for (const row of report.verificationCoverage) {
    console.log(`| \`${row.surface}\` | ${row.verification} | ${row.evidence || "Not started"} | \`${row.status}\` |`);
  }
  console.log("");
  console.log("## Missed Surface Review");
  console.log("");
  console.log(`- Missed surfaces found: ${report.missedSurfaceReview.missedSurfacesFound}`);
  console.log(`- Notes: ${report.missedSurfaceReview.notes}`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This report writes target files: No");
  console.log("- This report authorizes implementation: No");
  console.log("- This report approves release or production: No");
  console.log("- This report replaces human product judgment: No");
  console.log("- This report proves every possible impact was found: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(JSON.stringify(report.machineReadableEvidence, null, 2));
  console.log("```");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function humanReportText(report) {
  const lines = [];
  const log = (value = "") => lines.push(String(value));
  log("# Change Impact Coverage Report");
  log("");
  log("## Human Summary");
  log("");
  log(report.humanSummary);
  log("");
  log("## User Request");
  log("");
  log(`- Request: ${report.intent}`);
  log("- Task ref: not provided");
  log("- Project/profile: inferred from project signals");
  log(`- Business rule closure ref: ${report.businessRuleRef}`);
  log(`- Business rule digest: ${report.businessRuleDigest}`);
  log(`- Business rule state: ${report.businessRuleState}`);
  log("");
  log("## Change Type");
  log("");
  log(`- Mode: \`${report.mode}\``);
  log(`- Primary type: \`${report.changeType.primaryType}\``);
  log(`- Risk level: ${report.changeType.riskLevel}`);
  log(`- Reason: ${report.changeType.reason}`);
  log("");
  log("## Changed Files");
  log("");
  if (report.changedFiles.length > 0) report.changedFiles.forEach((file) => log(`- \`${file}\``));
  else log("- None provided.");
  log("");
  log("## Affected Surface Map");
  log("");
  log("| Surface | Status | Reason | Expected Evidence |");
  log("|---|---|---|---|");
  for (const row of report.affectedSurfaceMap) {
    log(`| \`${row.surface}\` | \`${row.status}\` | ${row.reason} | ${row.expectedEvidence} |`);
  }
  log("");
  log("## Out-of-Scope Decisions");
  log("");
  log("| Surface | Decision | Reason | Owner / Follow-up |");
  log("|---|---|---|---|");
  log("| None | None | Pre-execution report. | None |");
  log("");
  log("## Human Decisions Needed");
  log("");
  report.humanDecisionsNeeded.forEach((question, index) => log(`${index + 1}. ${question}`));
  log("");
  log("## Implementation Coverage");
  log("");
  log("| Surface | Status | Evidence | Reason |");
  log("|---|---|---|---|");
  for (const row of report.implementationCoverage) {
    log(`| \`${row.surface}\` | \`${row.status}\` | ${row.evidence || "Not started"} | ${row.reason} |`);
  }
  log("");
  log("## Verification Coverage");
  log("");
  log("| Surface | Verification | Evidence | Status |");
  log("|---|---|---|---|");
  for (const row of report.verificationCoverage) {
    log(`| \`${row.surface}\` | ${row.verification} | ${row.evidence || "Not started"} | \`${row.status}\` |`);
  }
  log("");
  log("## Missed Surface Review");
  log("");
  log(`- Missed surfaces found: ${report.missedSurfaceReview.missedSurfacesFound}`);
  log(`- Notes: ${report.missedSurfaceReview.notes}`);
  log("");
  log("## Boundaries");
  log("");
  log("- This report writes target files: No");
  log("- This report authorizes implementation: No");
  log("- This report approves release or production: No");
  log("- This report replaces human product judgment: No");
  log("- This report proves every possible impact was found: No");
  log("");
  log("## Machine-Readable Evidence");
  log("");
  log("```json");
  log(JSON.stringify(report.machineReadableEvidence, null, 2));
  log("```");
  log("");
  log("## Outcome");
  log("");
  log(`\`${report.outcome}\``);
  return `${lines.join("\n")}\n`;
}

function resolveOutputPath(root, requestedPath) {
  const resolved = path.resolve(root, String(requestedPath));
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out must stay inside the target project.");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function artifactId(userIntent, explicitChangedFiles) {
  const seed = `${userIntent || "change-impact"}-${explicitChangedFiles.join("-")}`.toLowerCase();
  const slug = seed
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/^-+|-+$/g, "");
  return slug || "change-impact";
}

function readGitChangedFiles(root, options = {}) {
  const gitArgs = ["diff", "--name-only"];
  if (options.cached) gitArgs.push("--cached");
  if (options.base) gitArgs.push(options.base);
  gitArgs.push("--");
  const result = spawnSync("git", gitArgs, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error(`FAIL --from-git-diff could not read git diff: ${result.stderr || result.stdout}`);
    process.exit(1);
  }
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function resolveBusinessRuleClosure(root, ref) {
  const match = String(ref || "").trim().match(/^artifact:(.+)$/i);
  if (!match) return { file: "", evidence: null };
  const relativeRef = match[1].trim();
  if (!relativeRef || path.isAbsolute(relativeRef)) return { file: "", evidence: null };
  const candidates = [
    path.resolve(root, relativeRef),
    path.resolve(root, ".intentos", relativeRef),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(root, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
    const content = fs.readFileSync(candidate, "utf8");
    const extracted = extractMachineReadableEvidence(content);
    if (!extracted?.ok) return { file: candidate, evidence: null };
    return { file: candidate, evidence: extracted.value };
  }
  return { file: "", evidence: null };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
