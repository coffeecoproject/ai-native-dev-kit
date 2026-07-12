#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "mode", "intent"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const userMode = String(args.mode || "plain").toLowerCase();
const intent = String(args.intent || "").trim();
const allowedFormats = new Set(["human", "json"]);
const allowedModes = new Set(["plain", "developer", "maintainer"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!allowedFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

if (!allowedModes.has(userMode)) {
  console.error(`FAIL unknown --mode: ${userMode}`);
  console.error("Use --mode plain, --mode developer, or --mode maintainer.");
  process.exit(1);
}

const report = buildReviewSurfaceCard(projectRoot, userMode, intent);

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildReviewSurfaceCard(root, mode, userIntent) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const pathSet = new Set(paths);
  const signals = collectSignals(root, exists, pathSet, userIntent);
  const project = classifyProject(root, exists, git, signals);
  const surfaces = selectedSurfaces(project, signals);
  const questions = questionsFor(project, signals);

  return {
    reportType: "REVIEW_SURFACE_CARD",
    generatedBy: "scripts/resolve-review-surface.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    userMode: mode,
    intent: userIntent || "Not provided",
    humanDecisionSummary: {
      conclusion: conclusionFor(project, surfaces),
      recommendedNextStep: recommendedNextStep(project),
      canAiContinueNow: project.state === "UNKNOWN_PROJECT" ? "no" : "limited",
      needFromHuman: questions.length > 0 ? questions.join(" / ") : "No decision needed for read-only review-surface planning.",
      ifNothing: "No files are changed. No CI, hook, document, task state, implementation, release, or production behavior is changed.",
    },
    plainSummary: plainSummary(project, surfaces),
    projectReading: {
      userMode: mode,
      projectState: project.state,
      existingUsersAssumed: project.existingUsersAssumed,
      canWriteFilesNow: "No",
      riskLevel: project.riskLevel,
      dirty: project.dirty,
      reason: project.reason,
    },
    selectedReviewSurfaces: surfaces,
    reviewSurfaceChecklist: checklistFor(surfaces),
    questionsForHuman: questions,
    postExecutionReviewContract: [
      "Per-surface result: after execution, Codex must say pass, fail, or not verified for every selected review surface.",
      "Unverified surfaces: anything not checked must be named with the reason and owner.",
      "Debt result: related debt must be recorded as fixed, deferred, or needs human decision.",
      "Next delivery state: Codex must state whether the task is ready for self-test, internal trial, release review, or blocked.",
    ],
    boundaries: {
      writesTargetFiles: "No",
      modifiesCi: "No",
      installsHooks: "No",
      deletesOrArchivesDocuments: "No",
      changesTaskState: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: outcomeFor(project),
  };
}

function collectSignals(root, exists, pathSet, userIntent) {
  const paths = [...pathSet];
  const joined = paths.join("\n");
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const packageText = JSON.stringify({
    dependencies: packageJson?.dependencies || {},
    devDependencies: packageJson?.devDependencies || {},
    scripts: packageJson?.scripts || {},
  });
  const allText = `${joined}\n${packageText}\n${userIntent || ""}`;
  const has = (rel) => pathSet.has(rel) || fs.existsSync(path.join(root, rel));
  const hasPrefix = (prefix) => paths.some((item) => item === prefix || item.startsWith(`${prefix}/`));

  return {
    exists,
    hasProjectSignals: exists ? hasProjectSignals(root) : false,
    isEmptyish: exists && paths.filter((item) => !item.startsWith(".git/")).length <= 3,
    isIntentOS: has("intentos-manifest.json") && hasPrefix("core"),
    hasIntentOSAssets: hasPrefix(".intentos") || hasPrefix("workflow-adoption-maps") || hasPrefix("review-surface-cards"),
    hasGovernance: ["AGENTS.md", "agent.md", ".agent.md"].some(has) || hasPrefix("docs") || hasPrefix(".github/workflows") || hasPrefix("scripts/guard"),
    hasDataSignals: /\b(database|schema|migration|migrations|db|sql|prisma|supabase|model|storage|api|data|order|payment|invoice|finance|tax)\b/i.test(allText),
    hasPermissionSignals: /\b(auth|login|rbac|permission|role|admin|session|jwt|oauth|tenant|owner)\b/i.test(allText),
    hasUxSignals: /\b(frontend|ui|component|components|page|pages|route|routes|wxml|wxss|swiftui|compose|android|css|tailwind|storybook|view|views)\b/i.test(allText),
    hasDocsSignals: hasPrefix("docs") || paths.some((item) => /(^|\/)(README|AGENTS|CONTRIBUTING|SECURITY|CHANGELOG|NOTICE)\.md$/i.test(item)),
    hasReleaseSignals: /\b(prod|production|deploy|deployment|release|rollback|staging|incident|runbook|ci|workflow|github\/workflows)\b/i.test(allText),
    hasExistingGovernanceSignals: ["AGENTS.md", "agent.md", ".agent.md"].some(has) || hasPrefix(".intentos") || hasPrefix("scripts/guard") || hasPrefix(".github/workflows") || hasPrefix("docs/governance"),
    hasSecurityPrivacySignals: /\b(security|privacy|compliance|secret|token|env|credential|payment|billing|finance|tax|pii|personal)\b/i.test(allText),
    hasRiskSignals: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release)\b/i.test(allText),
    pathCount: paths.length,
  };
}

function classifyProject(root, exists, git, signals) {
  if (!exists) {
    return {
      state: "UNKNOWN_PROJECT",
      reason: "Target path does not exist.",
      riskLevel: "unknown",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Unknown",
    };
  }

  if (signals.isIntentOS) {
    return {
      state: "INTENTOS_REPOSITORY",
      reason: "This is the IntentOS source repository.",
      riskLevel: git?.isDirty ? "medium" : "low",
      existingUsersAssumed: "No",
      dirty: git?.isDirty ? "Yes" : "No",
    };
  }

  if (git?.isDirty) {
    return {
      state: "DIRTY_WORKTREE_PROJECT",
      reason: "Project has unfinished changes. Review scope and current work before execution.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Yes",
    };
  }

  if (signals.hasReleaseSignals || signals.hasRiskSignals) {
    return {
      state: "PRODUCTION_SENSITIVE_PROJECT",
      reason: "Release, data, login, payment, migration, or other risk signals were detected.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  if (signals.isEmptyish || !signals.hasProjectSignals) {
    return {
      state: "NEW_PROJECT",
      reason: "No strong existing project structure was detected.",
      riskLevel: "low",
      existingUsersAssumed: "No",
      dirty: "No",
    };
  }

  if (signals.hasGovernance || signals.hasIntentOSAssets) {
    return {
      state: "EXISTING_GOVERNED_PROJECT",
      reason: "Existing docs, rules, CI, or IntentOS assets were detected.",
      riskLevel: "medium",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  return {
    state: "EXISTING_LIGHT_PROJECT",
    reason: "A project exists, but strong governance signals were not detected.",
    riskLevel: "medium",
    existingUsersAssumed: "Unknown treated as Yes",
    dirty: "No",
  };
}

function selectedSurfaces(project, signals) {
  const rows = new Map();
  const add = (surface, why, before = "Yes", after = "Yes", human = "No") => {
    rows.set(surface, {
      surface,
      why,
      requiredBeforeExecution: before,
      requiredAfterExecution: after,
      humanDecisionNeeded: human,
    });
  };

  add("FUNCTIONAL_REVIEW", "Confirm the change matches the user goal and does not silently change scope.");
  add("CODE_REVIEW", "Check the implementation shape, maintainability, and local conventions.");
  add("VERIFICATION_REVIEW", "Confirm tests, build, lint, or manual evidence are enough for this task.");
  add("DEBT_REVIEW", "Record related debt as fixed, deferred, or needing a decision instead of hiding it.");

  if (signals.hasDataSignals) add("DATA_REVIEW", "Data shape, migrations, storage, and API behavior may be affected.", "Yes", "Yes", "Yes");
  if (signals.hasPermissionSignals) add("PERMISSION_REVIEW", "Auth, roles, tenant boundaries, or admin access may be affected.", "Yes", "Yes", "Yes");
  if (signals.hasUxSignals) add("UX_REVIEW", "User-facing screens, routes, or interaction behavior may be affected.");
  if (signals.hasDocsSignals) add("DOCUMENTATION_REVIEW", "Docs or project instructions may need to stay aligned with the change.");
  if (signals.hasReleaseSignals) add("RELEASE_IMPACT_REVIEW", "CI, deployment, rollback, or production behavior may be affected.", "Yes", "Yes", "Yes");
  if (signals.hasExistingGovernanceSignals || project.state === "EXISTING_GOVERNED_PROJECT" || project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    add("EXISTING_GOVERNANCE_REVIEW", "Existing rules must be mapped and preserved before adding new workflow assets.", "Yes", "Yes", "Yes");
  }
  if (signals.hasSecurityPrivacySignals) add("SECURITY_PRIVACY_REVIEW", "Secrets, privacy, compliance, finance, or payment risk may be affected.", "Yes", "Yes", "Yes");

  return [...rows.values()];
}

function checklistFor(surfaces) {
  return surfaces.map((surface) => ({
    surface: surface.surface,
    before: surface.requiredBeforeExecution === "Yes" ? "Name the expected evidence before writing." : "Optional before writing.",
    after: surface.requiredAfterExecution === "Yes" ? "Report pass, fail, or not verified after writing." : "Optional after writing.",
    missingEvidenceAction: surface.humanDecisionNeeded === "Yes" ? "Stop for human decision." : "Record as not verified or deferred.",
  }));
}

function questionsFor(project, signals) {
  const questions = [];
  if (project.existingUsersAssumed !== "No") questions.push("这个项目现在是否已经有人在用？");
  if (project.riskLevel === "high" || signals.hasRiskSignals) questions.push("这次是否涉及登录、支付、数据、发布或迁移？");
  questions.push("是否允许我先生成审查面和执行计划，不直接改文件？");
  if (signals.hasExistingGovernanceSignals) questions.push("是否以项目现有规则为准，只把 IntentOS 作为辅助审查层？");
  if (project.state === "DIRTY_WORKTREE_PROJECT") questions.push("当前未完成改动是继续、暂停，还是先切换到新任务？");
  const maxQuestions = project.riskLevel === "high" ? 5 : 3;
  return questions.slice(0, maxQuestions);
}

function conclusionFor(project, surfaces) {
  return `I selected ${surfaces.length} review surfaces for ${plainProjectState(project.state)}.`;
}

function recommendedNextStep(project) {
  if (project.state === "UNKNOWN_PROJECT") return "先确认项目路径，再生成审查面。";
  if (project.state === "DIRTY_WORKTREE_PROJECT") return "先确认当前未完成改动归属，再决定是否继续执行。";
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") return "先只读确认审查面和既有治理映射，再准备计划。";
  return "先记录审查面，再执行任务；任务完成后按这些审查面逐项复查。";
}

function plainSummary(project, surfaces) {
  const surfaceNames = surfaces.map((item) => plainSurfaceName(item.surface)).join("、");
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    return `这个项目可能有真实用户或高风险内容。执行前需要先确认要审的范围：${surfaceNames}。这一步不改文件，只是防止后面漏审。`;
  }
  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return `项目里有未完成改动。先确认这些改动和当前任务的关系，再按 ${surfaceNames} 做复查范围。`;
  }
  return `这一步先确定任务完成后要检查哪些方面：${surfaceNames}。用户不用自己选技术项，Codex 根据项目判断。`;
}

function outcomeFor(project) {
  if (project.state === "UNKNOWN_PROJECT") return "BLOCKED";
  if (project.riskLevel === "high") return "NEEDS_HUMAN_DECISION";
  return "REVIEW_SURFACE_RECORDED";
}

function plainProjectState(state) {
  const labels = {
    NEW_PROJECT: "a new or not-yet-shaped project",
    EXISTING_LIGHT_PROJECT: "an existing project with light governance",
    EXISTING_GOVERNED_PROJECT: "an existing project with rules already present",
    PRODUCTION_SENSITIVE_PROJECT: "a risk-sensitive existing project",
    DIRTY_WORKTREE_PROJECT: "a project with unfinished changes",
    INTENTOS_REPOSITORY: "the IntentOS repository",
    UNKNOWN_PROJECT: "an unreadable or missing project",
  };
  return labels[state] || state;
}

function plainSurfaceName(surface) {
  const labels = {
    FUNCTIONAL_REVIEW: "功能是否对",
    CODE_REVIEW: "代码是否稳",
    DATA_REVIEW: "数据是否安全",
    PERMISSION_REVIEW: "权限是否正确",
    UX_REVIEW: "体验是否可用",
    VERIFICATION_REVIEW: "验证是否充分",
    DOCUMENTATION_REVIEW: "文档是否同步",
    RELEASE_IMPACT_REVIEW: "上线影响是否清楚",
    DEBT_REVIEW: "遗留问题是否记录",
    EXISTING_GOVERNANCE_REVIEW: "现有规则是否保留",
    SECURITY_PRIVACY_REVIEW: "安全和隐私是否可控",
  };
  return labels[surface] || surface;
}

function printHuman(report) {
  console.log("# Review Surface Card");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${report.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended next step: ${report.humanDecisionSummary.recommendedNextStep}`);
  console.log("");
  console.log(`Can AI continue now: ${report.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${report.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${report.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Plain Summary");
  console.log("");
  console.log(report.plainSummary);
  console.log("");
  console.log("## Project Reading");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| User mode | \`${report.userMode}\` |`);
  console.log(`| Project state | \`${report.projectReading.projectState}\` |`);
  console.log(`| Existing users assumed | ${report.projectReading.existingUsersAssumed} |`);
  console.log(`| Can write files now | ${report.projectReading.canWriteFilesNow} |`);
  console.log(`| Risk level | ${report.projectReading.riskLevel} |`);
  console.log(`| Dirty | ${report.projectReading.dirty} |`);
  console.log("");
  console.log("## Selected Review Surfaces");
  console.log("");
  console.log("| Surface | Why | Required before execution | Required after execution | Human decision needed |");
  console.log("|---|---|---|---|---|");
  for (const row of report.selectedReviewSurfaces) {
    console.log(`| \`${row.surface}\` | ${row.why} | ${row.requiredBeforeExecution} | ${row.requiredAfterExecution} | ${row.humanDecisionNeeded} |`);
  }
  console.log("");
  console.log("## Review Surface Checklist");
  console.log("");
  console.log("| Surface | Before execution | After execution | Missing evidence action |");
  console.log("|---|---|---|---|");
  for (const row of report.reviewSurfaceChecklist) {
    console.log(`| \`${row.surface}\` | ${row.before} | ${row.after} | ${row.missingEvidenceAction} |`);
  }
  console.log("");
  console.log("## Questions For Human");
  console.log("");
  report.questionsForHuman.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });
  console.log("");
  console.log("## Post-Execution Review Contract");
  console.log("");
  for (const item of report.postExecutionReviewContract) console.log(`- ${item}`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This card writes target files: No");
  console.log("- This card modifies CI: No");
  console.log("- This card installs hooks: No");
  console.log("- This card deletes or archives documents: No");
  console.log("- This card changes task state: No");
  console.log("- This card approves implementation: No");
  console.log("- This card approves release or production: No");
  console.log("- This card approves security/privacy/compliance/payment/migration decisions: No");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}
