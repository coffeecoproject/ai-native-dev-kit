#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const currentDevKitVersion = readCurrentVersion();
const requiredPullRequestTemplateMarkers = [
  "Project onboarding",
  "Workflow Evidence",
  "Workflow artifact quality",
  "Skill / Automation Governance",
  "irreversible operation",
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

function resolvePullRequestTemplateSource(starter) {
  const starterTemplate = path.join(kitRoot, "starters", starter, ".github", "pull_request_template.md");
  if (fs.existsSync(starterTemplate)) return starterTemplate;
  return path.join(kitRoot, "platforms", "github", "pull_request_template.md");
}

function pullRequestTemplateGovernanceAppendix() {
  return [
    "",
    "## Workflow Evidence",
    "",
    "- [ ] Project onboarding is confirmed or not applicable for this change",
    "- [ ] Request / preflight / spec / eval / task links are included or marked not applicable",
    "- [ ] Workflow artifact quality check passed or is not applicable",
    "- [ ] AI task log is written for L1/L2/L3 work or marked not applicable",
    "- [ ] Verification evidence is included",
    "- [ ] Workflow daily summary impact is reviewed when workflow assets changed",
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

function ensureProjectOnboardingDocs(targetPath) {
  const docs = [
    ["project-onboarding.md", "project-onboarding.md"],
    ["project-profile.md", "project-profile.md"],
    ["tech-stack-strategy.md", "tech-stack-strategy.md"],
    ["business-spec-index.md", "business-spec-index.md"],
    ["sample-policy.md", "sample-policy.md"],
    ["onboarding-decisions.md", "onboarding-decisions.md"],
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

function copySharedAssets(targetPath, options = {}) {
  const { starter = "generic-project", applyPrTemplateGovernance = false } = options;
  const sharedDirs = ["core", "templates", "prompts", "checklists"];
  for (const dir of sharedDirs) {
    copyDir(path.join(kitRoot, dir), path.join(targetPath, ".ai-native", dir), options);
  }

  const projectScriptsDir = path.join(targetPath, "scripts");
  fs.mkdirSync(projectScriptsDir, { recursive: true });
  const workflowCheckDest = path.join(projectScriptsDir, "check-ai-workflow.mjs");
  copyFile(path.join(kitRoot, "scripts", "check-ai-workflow.mjs"), workflowCheckDest, options);

  const summarizeDest = path.join(projectScriptsDir, "summarize-ai-logs.mjs");
  copyFile(path.join(kitRoot, "scripts", "summarize-ai-logs.mjs"), summarizeDest, options);

  const versionCheckDest = path.join(projectScriptsDir, "check-workflow-version.mjs");
  copyFile(path.join(kitRoot, "scripts", "check-workflow-version.mjs"), versionCheckDest, options);

  const dailySummaryDest = path.join(projectScriptsDir, "workflow-daily-summary.mjs");
  copyFile(path.join(kitRoot, "scripts", "workflow-daily-summary.mjs"), dailySummaryDest, options);

  const onboardingCheckDest = path.join(projectScriptsDir, "check-project-onboarding.mjs");
  copyFile(path.join(kitRoot, "scripts", "check-project-onboarding.mjs"), onboardingCheckDest, options);

  const artifactCheckDest = path.join(projectScriptsDir, "check-workflow-artifacts.mjs");
  copyFile(path.join(kitRoot, "scripts", "check-workflow-artifacts.mjs"), artifactCheckDest, options);

  const newWorkflowItemDest = path.join(projectScriptsDir, "new-workflow-item.mjs");
  copyFile(path.join(kitRoot, "scripts", "new-workflow-item.mjs"), newWorkflowItemDest, options);

  const githubWorkflowDir = path.join(targetPath, ".github", "workflows");
  fs.mkdirSync(githubWorkflowDir, { recursive: true });
  const ciDest = path.join(githubWorkflowDir, "ai-workflow-checks.yml");
  copyFile(path.join(kitRoot, "platforms", "github", "ci-ai-workflow.yml"), ciDest, options);

  ensureProjectOnboardingDocs(targetPath);
  ensurePullRequestTemplate(targetPath, starter, { applyPrTemplateGovernance });
  ensureWorkflowDirs(targetPath);
}

function ensureWorkflowDirs(targetPath) {
  const dirs = [
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
    "releases",
  ];
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
    workflowAssets: [
      ".ai-native/core",
      ".ai-native/templates",
      ".ai-native/prompts",
      ".ai-native/checklists",
      "scripts/check-ai-workflow.mjs",
      "scripts/summarize-ai-logs.mjs",
      "scripts/check-workflow-version.mjs",
      "scripts/workflow-daily-summary.mjs",
      "scripts/check-project-onboarding.mjs",
      "scripts/check-workflow-artifacts.mjs",
      "scripts/new-workflow-item.mjs",
      "docs/project-onboarding.md",
      "docs/project-profile.md",
      "docs/tech-stack-strategy.md",
      "docs/business-spec-index.md",
      "docs/sample-policy.md",
      "docs/onboarding-decisions.md",
      ".github/pull_request_template.md",
      ".github/workflows/ai-workflow-checks.yml",
    ],
  };
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);
  console.log(`${existed ? "updated" : "created"} ${path.relative(process.cwd(), versionPath)}`);
}

const args = parseArgs(process.argv.slice(2));
const target = args.target;
const updateWorkflowAssets = Boolean(args["update-workflow-assets"]);
const applyPrTemplateGovernance = Boolean(args["apply-pr-template-governance"]);

if (!target) {
  console.error("Usage: node scripts/init-project.mjs --starter generic-project --target ../my-project");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets");
  console.error("       node scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-pr-template-governance");
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
  copySharedAssets(targetPath, { overwrite: true, starter, applyPrTemplateGovernance });
  writeVersionFile(targetPath, starter, { update: true });
  console.log("");
  console.log(`Updated workflow assets at ${targetPath}`);
  console.log("Updated .ai-native/, workflow scripts, workflow CI, missing onboarding docs, and missing workflow directories.");
  console.log("Existing PR templates are left unchanged unless --apply-pr-template-governance is passed; review .ai-native/migration-reports/ when present.");
  process.exit(0);
}

copyDir(starterPath, targetPath);
copySharedAssets(targetPath, { starter });
writeVersionFile(targetPath, starter);

console.log("");
console.log(`Initialized ${starter} at ${targetPath}`);
console.log("Next steps:");
console.log("1. Run project onboarding by using .ai-native/prompts/project-onboarding-agent.md.");
console.log("2. Let AI draft docs/project-onboarding.md, project-profile, tech-stack strategy, business spec index, sample policy, and decisions from conversation.");
console.log("3. Human confirms decisions; then run node scripts/check-project-onboarding.mjs . --strict when ready.");
console.log("4. Create the first request card only after onboarding is ready.");
console.log("5. Use scripts/new-workflow-item.mjs to create request/spec/eval/task files.");
console.log("6. Run scripts/check-workflow-artifacts.mjs before implementation.");
console.log("7. After L1/L2/L3 work, write ai-logs and run scripts/summarize-ai-logs.mjs.");
