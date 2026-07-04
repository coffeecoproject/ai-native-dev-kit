#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";
import { workflowRequiredPaths as manifestWorkflowRequiredPaths } from "./lib/manifest.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals as hasProjectSignalsForRoot,
  projectSignalDirs,
  projectSignalFiles,
  walkRelativePaths as walkRelativePathsForRoot,
} from "./lib/project-signals.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputJson = outputFormat === "json";
const enforce = Boolean(args.enforce);
const allowedOutputFormats = new Set(["human", "technical", "json"]);

if (!allowedOutputFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human, --format technical, --format json, or --json.");
  process.exit(1);
}

const pendingPattern = /<[^>\n]+>|PENDING_CONFIRMATION|PENDING\b|TBD|TODO|NOT_READY/;
const ignoredRootEntries = new Set([".git", ".DS_Store", "node_modules"]);

const onboardingDocs = [
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
];

const fallbackWorkflowRequiredPaths = [
  "AGENTS.md",
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/environment-baseline.md",
  "scripts/check-ai-workflow.mjs",
  "scripts/check-guided-adoption.mjs",
  "scripts/check-project-onboarding.mjs",
  "scripts/check-engineering-baseline.mjs",
  "scripts/check-environment-baseline.mjs",
  "scripts/check-baseline-enforcement.mjs",
  "scripts/check-product-baseline.mjs",
  "scripts/check-claim-control.mjs",
  "scripts/resolve-existing-workflow.mjs",
  "scripts/check-workflow-adoption-map.mjs",
  "scripts/resolve-document-lifecycle.mjs",
  "scripts/check-document-lifecycle.mjs",
  "scripts/resolve-document-archive-apply.mjs",
  "scripts/check-document-archive-apply.mjs",
  "scripts/resolve-work-queue.mjs",
  "scripts/check-work-queue.mjs",
  "scripts/resolve-hook-orchestration.mjs",
  "scripts/check-hook-orchestration.mjs",
  "scripts/resolve-hook-policy.mjs",
  "scripts/check-hook-policy.mjs",
  "scripts/resolve-workflow-guidance.mjs",
  "scripts/check-workflow-guidance.mjs",
  "scripts/resolve-review-surface.mjs",
  "scripts/check-review-surface.mjs",
  "scripts/resolve-delivery-path.mjs",
  "scripts/check-delivery-path.mjs",
  "scripts/check-workflow-artifacts.mjs",
  "scripts/check-review-loop.mjs",
  "scripts/check-next-step-boundary.mjs",
  "scripts/check-goal-mode.mjs",
  "scripts/check-subagent-orchestration.mjs",
  "scripts/check-workflow-version.mjs",
  "scripts/new-workflow-item.mjs",
  "scripts/baseline-project.mjs",
  "scripts/summarize-ai-logs.mjs",
  "scripts/start-project.mjs",
  "scripts/workflow-daily-summary.mjs",
  "scripts/workflow-next.mjs",
  "scripts/cli.mjs",
  "scripts/check-platform-baseline.mjs",
  "scripts/resolve-platform-baseline.mjs",
  "scripts/check-industrial-pack.mjs",
  "scripts/resolve-industrial-baseline.mjs",
  "scripts/check-industrial-baseline.mjs",
  ".github/workflows/ai-workflow-checks.yml",
  "review-packets",
  "adoption-recommendations",
  "baseline-recommendations",
  "baseline-gap-reports",
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
  "workflow-adoption-maps",
  "doc-lifecycle-reports",
  "archive-apply-plans",
  "work-queue",
  "hook-orchestration-plans",
  "hook-policies",
  "workflow-guidance-cards",
  "review-surface-cards",
  "delivery-path-reports",
  "debt-handoff-reports",
  "execution-closures",
  ".ai-native/version.json",
  ".ai-native/docs/artifact-decision-tree.md",
  ".ai-native/docs/first-hour.md",
  ".ai-native/docs/goal-subagent-usage.md",
  ".ai-native/docs/baseline-setup.md",
  ".ai-native/docs/guided-delivery-baseline.md",
  ".ai-native/docs/existing-project-workflow-adapter.md",
  ".ai-native/docs/document-lifecycle.md",
  ".ai-native/docs/document-archive-apply.md",
  ".ai-native/docs/work-queue.md",
  ".ai-native/docs/hook-orchestration.md",
  ".ai-native/docs/hook-policy.md",
  ".ai-native/docs/natural-language-orchestrator.md",
  ".ai-native/docs/review-surface-governance.md",
  ".ai-native/docs/delivery-path-governance.md",
  ".ai-native/docs/debt-knowledge-handoff.md",
  ".ai-native/docs/product-baseline.md",
  ".ai-native/docs/claim-control.md",
  ".ai-native/core/workflow.md",
  ".ai-native/core/review-loop.md",
  ".ai-native/core/goal-mode.md",
  ".ai-native/core/subagent-orchestration.md",
  ".ai-native/core/output-protocol.md",
  ".ai-native/core/glossary.md",
  ".ai-native/core/next-step-boundary.md",
  ".ai-native/profiles/web-app/baseline.json",
  ".ai-native/profiles/web-app/environment-topics.md",
  ".ai-native/profiles/backend-api/baseline.json",
  ".ai-native/profiles/backend-api/environment-topics.md",
  ".ai-native/profiles/ios-app/baseline.json",
  ".ai-native/profiles/ios-app/environment-topics.md",
  ".ai-native/profiles/android-app/baseline.json",
  ".ai-native/profiles/android-app/environment-topics.md",
  ".ai-native/profiles/wechat-miniprogram/baseline.json",
  ".ai-native/profiles/wechat-miniprogram/environment-topics.md",
  ".ai-native/profiles/internal-admin/baseline.json",
  ".ai-native/profiles/internal-admin/environment-topics.md",
  ".ai-native/profiles/high-risk-change/baseline.json",
  ".ai-native/profiles/high-risk-change/environment-topics.md",
  ".ai-native/core/project-onboarding.md",
  ".ai-native/core/engineering-baseline.md",
  ".ai-native/core/environment-baseline.md",
  ".ai-native/core/baseline-enforcement.md",
  ".ai-native/core/outcome-baseline.md",
  ".ai-native/core/product-baseline.md",
  ".ai-native/core/existing-project-workflow-adapter.md",
  ".ai-native/core/document-lifecycle.md",
  ".ai-native/core/document-archive-apply.md",
  ".ai-native/core/work-queue.md",
  ".ai-native/core/hook-orchestration.md",
  ".ai-native/core/hook-policy.md",
  ".ai-native/core/natural-language-orchestrator.md",
  ".ai-native/core/review-surface-governance.md",
  ".ai-native/core/delivery-path-governance.md",
  ".ai-native/core/debt-knowledge-handoff.md",
  ".ai-native/core/claim-control.md",
  ".ai-native/core/assumption-register.md",
  ".ai-native/prompts/bootstrap-agent.md",
  ".ai-native/prompts/project-onboarding-agent.md",
  ".ai-native/prompts/goal-planner-agent.md",
  ".ai-native/prompts/engineering-baseline-agent.md",
  ".ai-native/prompts/environment-baseline-agent.md",
  ".ai-native/prompts/workflow-adapter-agent.md",
  ".ai-native/prompts/document-lifecycle-agent.md",
  ".ai-native/prompts/document-archive-agent.md",
  ".ai-native/prompts/work-queue-agent.md",
  ".ai-native/prompts/hook-orchestration-agent.md",
  ".ai-native/prompts/hook-policy-agent.md",
  ".ai-native/prompts/workflow-concierge-agent.md",
  ".ai-native/prompts/review-surface-agent.md",
  ".ai-native/prompts/delivery-path-agent.md",
  ".ai-native/prompts/debt-handoff-agent.md",
  ".ai-native/prompts/baseline-setup-agent.md",
  ".ai-native/prompts/product-baseline-agent.md",
  ".ai-native/prompts/claim-control-agent.md",
  ".ai-native/prompts/reporter-agent.md",
  ".ai-native/templates/project-onboarding.md",
  ".ai-native/templates/engineering-baseline.md",
  ".ai-native/templates/environment-baseline.md",
  ".ai-native/templates/product-baseline-review.md",
  ".ai-native/templates/claim-control-report.md",
  ".ai-native/templates/assumption-register.md",
  ".ai-native/templates/project-profile.md",
  ".ai-native/templates/tech-stack-strategy.md",
  ".ai-native/templates/business-spec-index.md",
  ".ai-native/templates/sample-policy.md",
  ".ai-native/templates/onboarding-decisions.md",
  ".ai-native/templates/adoption-assessment.md",
  ".ai-native/templates/adoption-recommendation-report.md",
  ".ai-native/templates/baseline-recommendation-report.md",
  ".ai-native/templates/baseline-gap-report.md",
  ".ai-native/templates/existing-governance-map.md",
  ".ai-native/templates/workflow-adoption-map.md",
  ".ai-native/templates/document-lifecycle-report.md",
  ".ai-native/templates/document-archive-apply-plan.md",
  ".ai-native/templates/archive-index.md",
  ".ai-native/templates/work-queue-report.md",
  ".ai-native/templates/hook-orchestration-plan.md",
  ".ai-native/templates/project-hook-policy.md",
  ".ai-native/templates/workflow-guidance-card.md",
  ".ai-native/templates/review-surface-card.md",
  ".ai-native/templates/delivery-path-report.md",
  ".ai-native/templates/debt-knowledge-handoff-report.md",
  ".ai-native/templates/user-decision-card.md",
  ".ai-native/templates/review-packet.md",
  ".ai-native/templates/gpt-review-prompt.md",
  ".ai-native/templates/review-loop-report.md",
  ".ai-native/templates/goal-card.md",
  ".ai-native/templates/subagent-run-plan.md",
  ".ai-native/templates/human-status-report.md",
  ".ai-native/templates/decision-brief.md",
  ".ai-native/templates/plain-review-summary.md",
  ".ai-native/templates/customer-handoff.md",
  ".ai-native/templates/follow-up-proposal.md",
  ".ai-native/templates/final-report.md",
  ".ai-native/templates/baseline-selection.md",
  ".ai-native/templates/baseline-evidence.md",
  ".ai-native/checklists/project-onboarding-review.md",
  ".ai-native/checklists/engineering-baseline-review.md",
  ".ai-native/checklists/environment-baseline-review.md",
  ".ai-native/checklists/baseline-enforcement-review.md",
  ".ai-native/checklists/product-baseline-review.md",
  ".ai-native/checklists/claim-control-review.md",
  ".ai-native/checklists/workflow-adoption-map-review.md",
  ".ai-native/checklists/document-lifecycle-review.md",
  ".ai-native/checklists/document-archive-apply-review.md",
  ".ai-native/checklists/work-queue-review.md",
  ".ai-native/checklists/hook-orchestration-review.md",
  ".ai-native/checklists/hook-policy-review.md",
  ".ai-native/checklists/workflow-guidance-review.md",
  ".ai-native/checklists/review-surface-review.md",
  ".ai-native/checklists/delivery-path-review.md",
  ".ai-native/checklists/debt-knowledge-handoff-review.md",
  ".ai-native/checklists/review-loop-review.md",
  ".ai-native/checklists/goal-mode-review.md",
  ".ai-native/checklists/subagent-orchestration-review.md",
  ".ai-native/checklists/next-step-boundary-review.md",
  ".ai-native/checklists/industrial-pack-review.md",
  ".ai-native/industrial-packs/selection-guide.md",
  ".ai-native/industrial-packs/index.json",
  ".ai-native/industrial-packs/schema/pack.schema.json",
  ".ai-native/industrial-packs/schema/baseline-selection.schema.json",
  "docs/verification-matrix.md",
];

const workflowRequiredPaths = manifestWorkflowRequiredPaths(projectRoot, {
  fallback: fallbackWorkflowRequiredPaths,
});

const requiredAgentSections = [
  "Mission",
  "Core Rules",
  "Bootstrap Entry",
  "Project Onboarding",
  "Engineering Baseline",
  "Environment Baseline",
  "Platform Baseline",
  "Industrial Baseline",
  "Product Baseline",
  "Claim Control",
  "Workflow Artifact Generation",
  "Review Surface Governance",
  "Delivery Path Governance",
  "Debt & Knowledge Handoff",
  "Document Archive Apply",
  "Project Hook Policy",
  "Goal Mode",
  "Subagent Orchestration",
  "Task Execution Rules",
  "Bounded Next-Step",
  "Output Experience",
  "High-risk Boundaries",
  "Skill Governance",
  "Automation Governance",
  "Final Report",
];

const workflowArtifactDirs = ["requests", "specs", "evals", "tasks"];
const governanceSignalPaths = [
  "AGENTS.md",
  "agent.md",
  ".agent.md",
  ".codex",
  ".cursor",
  ".claude",
  ".github/pull_request_template.md",
  ".github/workflows",
  "scripts/guard",
  "scripts/check",
  "scripts/verify",
  "docs/baseline",
  "docs/baselines",
  "docs/evidence",
  "docs/sessions",
  "docs/architecture",
  "docs/adr",
  "docs/contracts",
  "docs/governance",
  "docs/risk",
];
const productionSignalPaths = [
  ".github/workflows/release-promotion.yml",
  ".github/workflows/release.yml",
  ".github/workflows/deploy.yml",
  "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
  "docs/WEB_INCIDENT_RESPONSE_SRE_OPERATIONS_BASELINE.md",
  "docs/WEB_BACKUP_RECOVERY_DR_BASELINE.md",
  "docs/workcontrol-release-promotion-sop.md",
  "docs/release",
  "docs/releases",
  "docs/runbooks",
  "docs/incident",
  "docs/incidents",
  "docs/monitoring",
  "docs/observability",
  "docs/recovery",
  "docs/backup",
  "infra/production",
  "infra/prod",
  "infra/staging",
];
const workflowInternalProductionSignalPaths = new Set([
  "native-migration-plans",
  "release-adapters",
  "release-recipes",
  "release-handoff-packs",
  "release-guides",
  "release-execution-plans",
  "release-plans",
  "scripts/check-native-migration.mjs",
  "scripts/resolve-native-migration.mjs",
  "scripts/check-release-adapter.mjs",
  "scripts/check-platform-release-recipe.mjs",
  "scripts/check-release-handoff-pack.mjs",
  "scripts/check-release-guide.mjs",
  "scripts/check-release-execution.mjs",
  "scripts/check-release-plan.mjs",
  "scripts/resolve-release-adapter.mjs",
  "scripts/resolve-platform-release-recipe.mjs",
  "scripts/resolve-release-handoff-pack.mjs",
  "scripts/resolve-release-guide.mjs",
  "scripts/resolve-release-execution.mjs",
  "scripts/resolve-release-plan.mjs",
]);
const productionPathPattern = /\b(prod|production|staging|release|deploy|deployment|rollback|recovery|incident|runbook|monitoring|observability|migration|backup|restore)\b/i;
const ignoredSignalDirs = defaultIgnoredDirs;

function exists(rel) {
  return fs.existsSync(path.join(projectRoot, rel));
}

function read(rel) {
  const full = path.join(projectRoot, rel);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function readJson(rel) {
  const content = read(rel);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function localKitRoot() {
  const candidate = path.resolve(__dirname, "..");
  if (fs.existsSync(path.join(candidate, "VERSION.md")) && fs.existsSync(path.join(candidate, "scripts", "init-project.mjs"))) {
    return candidate;
  }
  return null;
}

function readLocalKitVersion(kitRoot) {
  if (!kitRoot) return null;
  const content = fs.readFileSync(path.join(kitRoot, "VERSION.md"), "utf8");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function rootEntries() {
  if (!fs.existsSync(projectRoot)) return [];
  return fs.readdirSync(projectRoot).filter((entry) => !ignoredRootEntries.has(entry));
}

function hasProjectSignals() {
  return hasProjectSignalsForRoot(projectRoot, {
    files: projectSignalFiles,
    dirs: projectSignalDirs,
  });
}

function projectRelativePaths(relDir = ".", maxDepth = 4) {
  return walkRelativePathsForRoot(projectRoot, relDir, { maxDepth, ignoredDirs: ignoredSignalDirs });
}

function matchedExistingPaths(paths) {
  return paths.filter((rel) => exists(rel)).sort();
}

function isWorkflowInternalProductionSignal(rel) {
  return workflowInternalProductionSignalPaths.has(rel)
    || rel.startsWith("native-migration-plans/")
    || rel.startsWith("release-adapters/")
    || rel.startsWith("release-recipes/")
    || rel.startsWith("release-handoff-packs/")
    || rel.startsWith("release-guides/")
    || rel.startsWith("release-execution-plans/")
    || rel.startsWith("release-plans/");
}

function governanceSignals() {
  const basicSignals = matchedExistingPaths(governanceSignalPaths);
  const directProductionSignals = matchedExistingPaths(productionSignalPaths);
  const pathSignals = projectRelativePaths(".", 4)
    .filter((rel) => productionPathPattern.test(rel))
    .filter((rel) => !rel.startsWith(".ai-native/"))
    .filter((rel) => !isWorkflowInternalProductionSignal(rel))
    .slice(0, 50)
    .sort();
  const productionSignals = unique([...directProductionSignals, ...pathSignals]);
  const git = gitWorktreeState(projectRoot);
  const hasAgentRules = ["AGENTS.md", "agent.md", ".agent.md"].some((rel) => basicSignals.includes(rel));
  const hasCi = basicSignals.includes(".github/workflows");
  const hasGuard = basicSignals.some((rel) => rel.startsWith("scripts/"));
  const hasBaselines = basicSignals.some((rel) => rel.includes("baseline"));
  const hasEvidence = basicSignals.includes("docs/evidence");
  const hasSessions = basicSignals.includes("docs/sessions");
  const isGovernedExisting = basicSignals.length >= 4
    || (hasAgentRules && (hasCi || hasGuard || hasBaselines || hasEvidence || hasSessions))
    || ((hasCi || hasGuard) && (hasBaselines || hasEvidence || hasSessions));
  const isProductionGoverned = productionSignals.length >= 2
    || directProductionSignals.some((rel) => rel.includes("release-promotion") || rel.includes("RELEASE_ROLLBACK"))
    || (isGovernedExisting && productionSignals.length >= 1);

  return {
    basicSignals,
    productionSignals,
    git,
    isGovernedExisting,
    isProductionGoverned,
    isDirtyWorktree: git.isDirty,
  };
}

function listMarkdownFiles(relDir) {
  const fullDir = path.join(projectRoot, relDir);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
    const full = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(path.relative(projectRoot, full)));
    } else if (entry.name.endsWith(".md")) {
      results.push(path.relative(projectRoot, full));
    }
  }
  return results.sort();
}

function pendingMigrationReports() {
  const reportDir = path.join(projectRoot, ".ai-native", "migration-reports");
  if (!fs.existsSync(reportDir)) return [];
  const reports = [];
  for (const entry of fs.readdirSync(reportDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const rel = path.join(".ai-native", "migration-reports", entry.name);
    if (read(rel).includes("PENDING_HUMAN_APPROVAL")) {
      reports.push(rel);
    }
  }
  return reports.sort();
}

function missingAgentSections() {
  const content = read("AGENTS.md");
  if (!content) return requiredAgentSections;
  return requiredAgentSections.filter((section) => !content.includes(section));
}

function onboardingState() {
  const missing = onboardingDocs.filter((rel) => !exists(rel));
  if (missing.length > 0) {
    return { state: "MISSING", missing, pending: [] };
  }
  const pending = onboardingDocs.filter((rel) => pendingPattern.test(read(rel)));
  if (pending.length > 0) {
    return { state: "NEEDS_HUMAN_CONFIRMATION", missing: [], pending };
  }
  return { state: "READY", missing: [], pending: [] };
}

function cleanProfileId(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function isProfilePlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(profile-id|selected profile|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function selectedProfiles() {
  const content = read("docs/project-profile.md");
  if (!content) return [];
  const body = sectionBody(content, "Selected Profiles");
  if (!body) return [];
  return [...new Set(body
    .split("\n")
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/)?.[1])
    .map(cleanProfileId)
    .filter((value) => !isProfilePlaceholder(value)))].sort();
}

function cleanListValue(value) {
  return String(value || "")
    .replace(/[`*_#[\]]/g, "")
    .replace(/\(.+\)$/g, "")
    .trim();
}

function isBaselinePlaceholder(value) {
  return !value
    || value.includes("<")
    || /^(industrial-pack-id|none|n\/a|pending|tbd|todo|not_ready)$/i.test(value)
    || /PENDING|TBD|TODO|NOT_READY/i.test(value);
}

function parseSingleEnum(body, allowed) {
  if (!body) return null;
  const allowedPattern = allowed.map(escapeRegExp).join("|");
  for (const line of body.split("\n")) {
    const matches = line.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
    const distinct = unique(matches);
    if (distinct.length === 1) return distinct[0];
  }
  const matches = body.match(new RegExp(`\\b(${allowedPattern})\\b`, "g")) || [];
  const distinct = unique(matches);
  return distinct.length === 1 ? distinct[0] : null;
}

function selectedBaselineLevel() {
  const content = read("docs/baseline-selection.md");
  if (!content) return null;
  return parseSingleEnum(sectionBody(content, "Baseline Level"), ["BL0_LIGHTWEIGHT", "BL1_STANDARD", "BL2_INDUSTRIAL"]);
}

function selectedIndustrialPacks() {
  const content = read("docs/baseline-selection.md");
  if (!content) return [];
  const body = sectionBody(content, "Selected Industrial Packs");
  if (!body) return [];
  const packs = [];
  for (const line of body.split("\n")) {
    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!match) continue;
    const value = cleanListValue(match[1]);
    if (isBaselinePlaceholder(value)) continue;
    const token = value.match(/\b[a-z0-9][a-z0-9-]*-industrial\b/i)?.[0];
    if (token && !isBaselinePlaceholder(token)) packs.push(token);
  }
  return unique(packs);
}

function industrialHumanApprovalStatus() {
  const content = read("docs/baseline-selection.md");
  if (!content) return null;
  return parseSingleEnum(sectionBody(content, "Human Approval"), ["PENDING", "APPROVED", "REJECTED"]);
}

function industrialBaselineState() {
  const hasSelection = exists("docs/baseline-selection.md");
  const baselineLevel = selectedBaselineLevel();
  const selectedPacks = selectedIndustrialPacks();
  const humanApprovalStatus = industrialHumanApprovalStatus();
  const selectedProfileIds = selectedProfiles();
  const base = {
    baselineLevel,
    selectedIndustrialPacks: selectedPacks,
    humanApprovalStatus,
    unknownPacks: [],
    plannedPacks: [],
    invalidPacks: [],
    incompatiblePacks: [],
    missingProjectDocs: [],
  };

  if (!hasSelection || !baselineLevel) {
    return { ...base, state: "NOT_SELECTED" };
  }
  if (baselineLevel !== "BL2_INDUSTRIAL") {
    return { ...base, state: "NOT_APPLICABLE" };
  }

  const index = readJson(".ai-native/industrial-packs/index.json");
  if (!index?.packs) {
    return { ...base, state: "PACK_INDEX_MISSING" };
  }
  if (selectedPacks.length === 0) {
    return { ...base, state: "PACKS_NOT_SELECTED" };
  }

  const entriesById = new Map(index.packs.map((entry) => [entry.id, entry]));
  const unknownPacks = selectedPacks.filter((packId) => !entriesById.has(packId));
  const plannedPacks = selectedPacks
    .map((packId) => entriesById.get(packId))
    .filter((entry) => entry?.status === "planned")
    .map((entry) => entry.id);
  const invalidPacks = [];
  const incompatiblePacks = [];
  for (const packId of selectedPacks) {
    const entry = entriesById.get(packId);
    if (!entry || entry.status === "planned") continue;
    const manifest = readJson(path.join(".ai-native", "industrial-packs", entry.path || "", "pack.json"));
    if (!manifest) {
      invalidPacks.push(packId);
      continue;
    }
    const appliesToProfiles = Array.isArray(manifest.appliesToProfiles) ? manifest.appliesToProfiles : entry.appliesToProfiles || [];
    if (appliesToProfiles.length > 0
      && selectedProfileIds.length > 0
      && !appliesToProfiles.some((profileId) => selectedProfileIds.includes(profileId))) {
      incompatiblePacks.push(packId);
    }
  }

  if (unknownPacks.length > 0 || invalidPacks.length > 0) {
    return { ...base, state: "PACKS_INVALID", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }
  if (plannedPacks.length > 0) {
    return { ...base, state: "PACKS_NOT_AVAILABLE", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }
  if (incompatiblePacks.length > 0) {
    return { ...base, state: "PACKS_INCOMPATIBLE", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks };
  }

  const missingProjectDocs = ["docs/baseline-selection.md", "docs/baseline-evidence.md"].filter((rel) => !exists(rel));
  if (missingProjectDocs.length > 0) {
    return { ...base, state: "EVIDENCE_MISSING", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
  }
  if (humanApprovalStatus !== "APPROVED") {
    return { ...base, state: "NEEDS_HUMAN_APPROVAL", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
  }
  return { ...base, state: "BASELINE_READY", unknownPacks, plannedPacks, invalidPacks, incompatiblePacks, missingProjectDocs };
}

function platformBaselineState() {
  if (!exists("docs/project-profile.md")) {
    return { state: "MISSING_PROFILE", selectedProfiles: [], missingProfiles: [], missingRequiredDocs: [] };
  }
  const selected = selectedProfiles();
  if (selected.length === 0) {
    return { state: "MISSING_PROFILE", selectedProfiles: [], missingProfiles: [], missingRequiredDocs: [] };
  }
  const missingProfiles = selected.filter((profileId) => !exists(path.join(".ai-native", "profiles", profileId, "baseline.json")));
  if (missingProfiles.length > 0) {
    return { state: "PROFILE_INVALID", selectedProfiles: selected, missingProfiles, missingRequiredDocs: [] };
  }
  const requiredDocs = new Set();
  for (const profileId of selected) {
    const baseline = readJson(path.join(".ai-native", "profiles", profileId, "baseline.json"));
    for (const rel of baseline?.requiredDocs || []) requiredDocs.add(rel);
  }
  const missingRequiredDocs = [...requiredDocs].filter((rel) => !exists(rel)).sort();
  if (missingRequiredDocs.length > 0) {
    return { state: "BASELINE_DOCS_MISSING", selectedProfiles: selected, missingProfiles: [], missingRequiredDocs };
  }
  return { state: "BASELINE_READY", selectedProfiles: selected, missingProfiles: [], missingRequiredDocs: [] };
}

function workflowArtifactCount() {
  return workflowArtifactDirs.reduce((count, dir) => count + listMarkdownFiles(dir).length, 0);
}

function commandFor(action, kitRoot) {
  const initProject = kitRoot ? `node ${path.join(kitRoot, "scripts", "init-project.mjs")}` : "node ai-native-dev-kit/scripts/init-project.mjs";
  if (action === "INIT_WITH_STARTER") {
    return `${initProject} --starter generic-project --target ${projectRoot}`;
  }
  if (action === "RUN_WORKFLOW_ASSET_UPDATE") {
    return `${initProject} --target ${projectRoot} --update-workflow-assets`;
  }
  if (action === "RUN_PROJECT_ONBOARDING") {
    return "Use .ai-native/prompts/project-onboarding-agent.md, draft docs/engineering-baseline.md when structural decisions are needed, then run node scripts/check-project-onboarding.mjs . and node scripts/check-engineering-baseline.mjs .";
  }
  if (action === "RUN_PLATFORM_BASELINE_SETUP") {
    return "Select project profiles in docs/project-profile.md, then run node scripts/check-platform-baseline.mjs .";
  }
  if (action === "RUN_INDUSTRIAL_BASELINE_SETUP") {
    return "For BL2 work, read .ai-native/industrial-packs/selection-guide.md, draft docs/baseline-selection.md and docs/baseline-evidence.md from .ai-native/templates, install selected packs with init-project --industrial-packs <pack-id>, then run node scripts/check-industrial-pack.mjs . --selected-only and node scripts/check-industrial-baseline.mjs . --bl2-only.";
  }
  if (action === "RUN_ADOPTION_ASSESSMENT") {
    return "Produce a read-only adoption assessment from templates/adoption-assessment.md and templates/existing-governance-map.md. Do not run init-project, update workflow assets, create migration reports, or modify project files until a human approves adapter setup.";
  }
  if (action === "REVIEW_DIRTY_WORKTREE") {
    return "Stop before task execution. Review git status, identify ownership of existing changes, and ask the human whether to continue, split, stash, commit, or create a review packet first.";
  }
  if (action === "REVIEW_EXISTING_GOVERNANCE_MAP") {
    return "Review the existing governance map with the human before choosing any adapter setup.";
  }
  if (action === "WAIT_FOR_ADAPTER_CONFIRMATION") {
    return "Wait for explicit human approval before writing adapter docs or workflow assets.";
  }
  if (action === "REVIEW_GOVERNANCE_MIGRATION") {
    return "Review .ai-native/migration-reports/ and apply only after explicit human approval.";
  }
  if (action === "READY_FOR_FIRST_REQUEST") {
    return "Create the first request with node scripts/new-workflow-item.mjs --type request --name <name>.";
  }
  if (action === "READY_FOR_TASK_EXECUTION") {
    return "Use the approved task card, then run verification.";
  }
  if (action === "RUN_DEV_KIT_SELF_CHECK") {
    return "node scripts/check-dev-kit.mjs";
  }
  return "Select or create a valid project root.";
}

function buildResult() {
  const targetExists = fs.existsSync(projectRoot);
  if (!targetExists) {
    return {
      projectRoot,
      projectState: "TARGET_MISSING",
      workflowState: "UNAVAILABLE",
      onboardingState: "UNAVAILABLE",
      platformBaselineState: "UNAVAILABLE",
      industrialBaselineState: "UNAVAILABLE",
      versionState: "UNAVAILABLE",
      projectStateTags: ["TARGET_MISSING"],
      adoptionMode: "UNAVAILABLE",
      governanceSignals: null,
      nextAction: "SELECT_OR_CREATE_TARGET",
      canWriteWorkflowAssets: "no",
      mustStopForHuman: "yes",
      pendingMigrationReports: [],
      missingWorkflowAssets: [],
      missingAgentSections: [],
      notes: ["Target path does not exist."],
      suggestedCommand: "Select or create a valid project root.",
    };
  }

  const kitRoot = localKitRoot();
  const localVersion = readLocalKitVersion(kitRoot);
  const isDevKitRepository = exists("VERSION.md")
    && exists("core/workflow.md")
    && exists("templates/workflow-version.json")
    && exists("scripts/init-project.mjs");
  if (isDevKitRepository) {
    return {
      projectRoot,
      projectState: "DEV_KIT_REPOSITORY",
      workflowState: "DEV_KIT_SOURCE",
      onboardingState: "NOT_APPLICABLE",
      platformBaselineState: "NOT_APPLICABLE",
      industrialBaselineState: "NOT_APPLICABLE",
      versionState: localVersion ? "CURRENT" : "UNKNOWN_LOCAL_DEV_KIT",
      projectStateTags: ["DEV_KIT_REPOSITORY"],
      adoptionMode: "NOT_APPLICABLE",
      governanceSignals: null,
      nextAction: "RUN_DEV_KIT_SELF_CHECK",
      canWriteWorkflowAssets: "not_applicable",
      mustStopForHuman: "no",
      pendingMigrationReports: [],
      missingWorkflowAssets: [],
      missingAgentSections: [],
      notes: [
        localVersion ? `Local dev-kit version: ${localVersion}` : "Local dev-kit version is unavailable.",
        "This directory is the dev-kit source repository, not a target project.",
      ],
      suggestedCommand: commandFor("RUN_DEV_KIT_SELF_CHECK", kitRoot),
    };
  }

  const version = readJson(".ai-native/version.json");
  const entries = rootEntries();
  const emptyLike = entries.length === 0;
  const projectHasSignals = hasProjectSignals();
  const hasAiNative = exists(".ai-native");
  const missingWorkflowAssets = workflowRequiredPaths.filter((rel) => !exists(rel));
  const pendingReports = pendingMigrationReports();
  const agentMissing = missingAgentSections();
  const onboarding = onboardingState();
  const platformBaseline = platformBaselineState();
  const industrialBaseline = industrialBaselineState();
  const artifactCount = workflowArtifactCount();
  const signals = governanceSignals();

  let projectState;
  if (version) {
    projectState = "BOOTSTRAPPED_PROJECT";
  } else if (hasAiNative || missingWorkflowAssets.length < workflowRequiredPaths.length) {
    projectState = "PARTIALLY_BOOTSTRAPPED_PROJECT";
  } else if (emptyLike) {
    projectState = "NEW_PROJECT";
  } else if (projectHasSignals || entries.length > 0) {
    projectState = "EXISTING_PROJECT";
  } else {
    projectState = "NEW_PROJECT";
  }

  const projectStateTags = [projectState];
  if (version) projectStateTags.push("AI_NATIVE_BOOTSTRAPPED_PROJECT");
  if (signals.isGovernedExisting) projectStateTags.push("GOVERNED_EXISTING_PROJECT");
  if (signals.isProductionGoverned) projectStateTags.push("PRODUCTION_GOVERNED_PROJECT");
  if (signals.isDirtyWorktree) projectStateTags.push("DIRTY_WORKTREE_PROJECT");

  let workflowState;
  if (!version && !hasAiNative) {
    workflowState = "NOT_BOOTSTRAPPED";
  } else if (!version) {
    workflowState = "PARTIAL_BOOTSTRAP";
  } else if (pendingReports.length > 0) {
    workflowState = "BOOTSTRAPPED_WITH_PENDING_MIGRATION";
  } else if (missingWorkflowAssets.length > 0 || agentMissing.length > 0) {
    workflowState = "BOOTSTRAPPED_WITH_MISSING_ASSETS";
  } else {
    workflowState = "BOOTSTRAPPED";
  }

  let versionState;
  if (!version) {
    versionState = "NO_VERSION_FILE";
  } else if (!localVersion) {
    versionState = "UNKNOWN_LOCAL_DEV_KIT";
  } else if (version.devKitVersion !== localVersion) {
    versionState = "MISMATCH";
  } else {
    versionState = "CURRENT";
  }

  let nextAction;
  if (projectState === "NEW_PROJECT") {
    nextAction = "INIT_WITH_STARTER";
  } else if (!version || missingWorkflowAssets.length > 0 || versionState === "MISMATCH") {
    nextAction = "RUN_WORKFLOW_ASSET_UPDATE";
  } else if (pendingReports.length > 0) {
    nextAction = "REVIEW_GOVERNANCE_MIGRATION";
  } else if (agentMissing.length > 0) {
    nextAction = "RUN_WORKFLOW_ASSET_UPDATE";
  } else if (onboarding.state !== "READY") {
    nextAction = "RUN_PROJECT_ONBOARDING";
  } else if (platformBaseline.state !== "BASELINE_READY") {
    nextAction = "RUN_PLATFORM_BASELINE_SETUP";
  } else if ([
    "PACK_INDEX_MISSING",
    "PACKS_NOT_SELECTED",
    "PACKS_INVALID",
    "PACKS_NOT_AVAILABLE",
    "PACKS_INCOMPATIBLE",
    "EVIDENCE_MISSING",
    "NEEDS_HUMAN_APPROVAL",
  ].includes(industrialBaseline.state)) {
    nextAction = "RUN_INDUSTRIAL_BASELINE_SETUP";
  } else if (artifactCount === 0) {
    nextAction = "READY_FOR_FIRST_REQUEST";
  } else {
    nextAction = "READY_FOR_TASK_EXECUTION";
  }

  const governedProtectionApplies = projectState !== "NEW_PROJECT"
    && projectState !== "DEV_KIT_REPOSITORY"
    && (signals.isProductionGoverned || signals.isDirtyWorktree || (signals.isGovernedExisting && !version));
  if (governedProtectionApplies
    && ["INIT_WITH_STARTER", "RUN_WORKFLOW_ASSET_UPDATE", "RUN_PROJECT_ONBOARDING", "RUN_PLATFORM_BASELINE_SETUP", "RUN_INDUSTRIAL_BASELINE_SETUP"].includes(nextAction)) {
    nextAction = "RUN_ADOPTION_ASSESSMENT";
  }
  if (signals.isDirtyWorktree
    && signals.isProductionGoverned
    && ["READY_FOR_FIRST_REQUEST", "READY_FOR_TASK_EXECUTION"].includes(nextAction)) {
    nextAction = "REVIEW_DIRTY_WORKTREE";
  }
  const adoptionMode = nextAction === "RUN_ADOPTION_ASSESSMENT"
    ? "READ_ONLY"
    : nextAction === "REVIEW_DIRTY_WORKTREE" ? "GUARDED" : "STANDARD";

  const notes = [];
  if (version?.devKitVersion) notes.push(`Project dev-kit version: ${version.devKitVersion}`);
  if (localVersion) notes.push(`Local dev-kit version: ${localVersion}`);
  if (missingWorkflowAssets.length > 0) notes.push(`${missingWorkflowAssets.length} workflow asset(s) are missing.`);
  if (agentMissing.length > 0) notes.push(`${agentMissing.length} AGENTS.md governance section(s) are missing.`);
  if (pendingReports.length > 0) notes.push(`${pendingReports.length} migration report(s) need human approval.`);
  if (onboarding.state === "NEEDS_HUMAN_CONFIRMATION") notes.push(`${onboarding.pending.length} onboarding doc(s) still have pending decisions.`);
  if (onboarding.state === "MISSING") notes.push(`${onboarding.missing.length} onboarding doc(s) are missing.`);
  if (platformBaseline.state === "MISSING_PROFILE") notes.push("Project profile has not selected platform profiles.");
  if (platformBaseline.state === "PROFILE_INVALID") notes.push(`${platformBaseline.missingProfiles.length} selected platform profile(s) are missing.`);
  if (platformBaseline.state === "BASELINE_DOCS_MISSING") notes.push(`${platformBaseline.missingRequiredDocs.length} platform baseline doc(s) are missing.`);
  if (platformBaseline.selectedProfiles.length > 0) notes.push(`Selected platform profiles: ${platformBaseline.selectedProfiles.join(", ")}.`);
  if (industrialBaseline.baselineLevel) notes.push(`Selected baseline level: ${industrialBaseline.baselineLevel}.`);
  if (industrialBaseline.selectedIndustrialPacks.length > 0) notes.push(`Selected industrial packs: ${industrialBaseline.selectedIndustrialPacks.join(", ")}.`);
  if (industrialBaseline.state === "NOT_SELECTED") notes.push("Industrial baseline level is not selected; BL2 checks are not active.");
  if (industrialBaseline.state === "PACK_INDEX_MISSING") notes.push("Industrial pack index is missing.");
  if (industrialBaseline.state === "PACKS_NOT_SELECTED") notes.push("BL2 is selected but no industrial packs are selected.");
  if (industrialBaseline.state === "PACKS_INVALID") notes.push("One or more selected industrial packs are unknown or invalid.");
  if (industrialBaseline.state === "PACKS_NOT_AVAILABLE") notes.push("One or more selected industrial packs are planned but not executable yet.");
  if (industrialBaseline.state === "PACKS_INCOMPATIBLE") notes.push("One or more selected industrial packs do not match selected platform profiles.");
  if (industrialBaseline.state === "EVIDENCE_MISSING") notes.push(`${industrialBaseline.missingProjectDocs.length} BL2 project evidence doc(s) are missing.`);
  if (industrialBaseline.state === "NEEDS_HUMAN_APPROVAL") notes.push("BL2 industrial baseline still needs explicit human approval.");
  if (artifactCount > 0) notes.push(`${artifactCount} workflow artifact file(s) exist.`);
  if (signals.isGovernedExisting) notes.push(`${signals.basicSignals.length} existing governance signal(s) detected.`);
  if (signals.isProductionGoverned) notes.push(`${signals.productionSignals.length} production governance signal(s) detected.`);
  if (signals.isDirtyWorktree) notes.push(`Git worktree has ${signals.git.changedFileCount} changed or untracked file(s).`);
  if (nextAction === "RUN_ADOPTION_ASSESSMENT") notes.push("Governed, production-sensitive, or dirty project protection is active; execution intent does not allow workflow writes yet.");
  if (nextAction === "REVIEW_DIRTY_WORKTREE") notes.push("Dirty production-governed project execution guard is active; confirm current changes before creating artifacts or executing a task.");
  if (notes.length === 0) notes.push("No blocking workflow issue detected.");

  const humanStopActions = new Set(["SELECT_OR_CREATE_TARGET", "REVIEW_GOVERNANCE_MIGRATION", "RUN_ADOPTION_ASSESSMENT", "REVIEW_DIRTY_WORKTREE", "REVIEW_EXISTING_GOVERNANCE_MAP", "WAIT_FOR_ADAPTER_CONFIRMATION", "READY_FOR_FIRST_REQUEST"]);

  return {
    projectRoot,
    projectState,
    projectStateTags: unique(projectStateTags),
    workflowState,
    onboardingState: onboarding.state,
    platformBaselineState: platformBaseline.state,
    industrialBaselineState: industrialBaseline.state,
    baselineLevel: industrialBaseline.baselineLevel,
    selectedIndustrialPacks: industrialBaseline.selectedIndustrialPacks,
    versionState,
    adoptionMode,
    governanceSignals: signals,
    nextAction,
    canWriteWorkflowAssets: ["RUN_ADOPTION_ASSESSMENT", "REVIEW_DIRTY_WORKTREE"].includes(nextAction)
      ? "no"
      : ["INIT_WITH_STARTER", "RUN_WORKFLOW_ASSET_UPDATE", "RUN_PROJECT_ONBOARDING", "RUN_PLATFORM_BASELINE_SETUP", "RUN_INDUSTRIAL_BASELINE_SETUP"].includes(nextAction) ? "yes_with_execution_intent" : "not_without_more_input",
    mustStopForHuman: humanStopActions.has(nextAction) || pendingReports.length > 0 || industrialBaseline.state === "NEEDS_HUMAN_APPROVAL" ? "yes" : "no",
    pendingMigrationReports: pendingReports,
    missingWorkflowAssets,
    missingAgentSections: agentMissing,
    notes,
    suggestedCommand: commandFor(nextAction, kitRoot),
  };
}

const result = buildResult();
const enforceFailures = enforceReasons(result);

if (outputJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("# Workflow Next");
  console.log("");
  if (outputFormat === "human") {
    printHumanOutput(result);
    console.log("");
    console.log("## Technical Details");
    console.log("");
  }
  printTechnicalOutput(result, enforceFailures);
}

if (enforce && enforceFailures.length > 0) {
  process.exit(2);
}

function printHumanOutput(result) {
  const human = buildHumanOutput(result);
  const decision = buildHumanDecisionSummary(result, human);
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${decision.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${decision.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${decision.canAiContinue}`);
  console.log("");
  console.log(`What I need from you: ${decision.needFromHuman}`);
  console.log("");
  console.log("| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |");
  console.log("|---|---|---|---|---|---|");
  for (const option of decision.options) {
    console.log(`| ${cell(option.option)} | ${cell(option.meaning)} | ${cell(option.aiWillDo)} | ${cell(option.writes)} | ${cell(option.risk)} | ${cell(option.when)} |`);
  }
  console.log("");
  console.log(`Recommended reason: ${decision.reason}`);
  console.log("");
  console.log(`What happens if you do nothing: ${decision.ifNothing}`);
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(human.summary);
  console.log("");
  console.log("## Current Status");
  console.log("");
  console.log(`- Status: ${human.status}`);
  console.log(`- Reason: ${human.reason}`);
  console.log(`- Risk level: ${human.riskLevel}`);
  console.log(`- Can AI continue: ${human.canAiContinue}`);
  console.log("");
  console.log("## What I Need From You");
  console.log("");
  for (const item of human.decisions) console.log(`- ${item}`);
  console.log("");
  console.log("## Recommended Next Step");
  console.log("");
  console.log(human.nextStep);
  if (result.suggestedCommand) {
    console.log("");
    console.log("```bash");
    console.log(result.suggestedCommand);
    console.log("```");
  }
  console.log("");
  console.log("## What AI Can Do Safely");
  console.log("");
  for (const item of human.aiCanDo) console.log(`- ${item}`);
  console.log("");
  console.log("## What AI Must Not Do");
  console.log("");
  for (const item of human.aiMustNotDo) console.log(`- ${item}`);
}

function cell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function option(optionName, meaning, aiWillDo, writes, risk, when) {
  return { option: optionName, meaning, aiWillDo, writes, risk, when };
}

function buildHumanDecisionSummary(result, human) {
  const action = result.nextAction;
  const needFromHuman = human.decisions?.join(" ") || "No decision needed.";
  const defaultSummary = {
    conclusion: human.summary,
    recommendedChoice: "A - Follow the next safe action",
    canAiContinue: human.canAiContinue,
    needFromHuman,
    options: [
      option("A", "Follow the suggested workflow action", result.suggestedCommand || human.nextStep, "Depends on the suggested action", human.riskLevel, "Choose when the technical details match your intent"),
      option("B", "Discuss first", "Explain the state and wait", "No", "low", "Choose when you are unsure"),
      option("C", "Pause", "Stop and wait", "No", "low", "Choose when ownership or risk is unclear"),
    ],
    reason: human.reason,
    ifNothing: "Codex should stop at the current workflow state and not infer approval.",
  };

  if (result.projectState === "TARGET_MISSING") {
    return {
      ...defaultSummary,
      recommendedChoice: "A - Confirm the correct path",
      options: [
        option("A", "Confirm the target path", "Re-run workflow-next against the correct directory", "No", "low", "Choose when the path was mistyped"),
        option("B", "Create a new project directory", "Wait until the directory exists, then inspect it", "No workflow writes yet", "medium", "Choose when this is meant to be a new project"),
        option("C", "Pause", "Stop and wait", "No", "low", "Choose when the target project is not ready"),
      ],
      reason: "A missing path can easily write files into the wrong location if guessed.",
      ifNothing: "No workflow setup or project inspection should happen.",
    };
  }

  if (result.projectState === "DEV_KIT_REPOSITORY") {
    return {
      ...defaultSummary,
      recommendedChoice: "A - Run dev-kit self-check",
      needFromHuman: "Confirm whether the current work is changing the dev kit itself.",
      options: [
        option("A", "Self-check this dev kit", "Run local dev-kit checks and report results", "No target project files", "low", "Choose when editing shared workflow assets"),
        option("B", "Discuss changes first", "Explain the intended dev-kit change", "No", "low", "Choose when direction is unclear"),
        option("C", "Pause", "Stop and wait", "No", "low", "Choose when this is not the intended repository"),
      ],
      reason: "The directory is the kit source, so target-project bootstrap is not appropriate.",
      ifNothing: "Codex should not treat this repository as a generated target project.",
    };
  }

  if (action === "RUN_ADOPTION_ASSESSMENT") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Docs-only adapter assessment",
      options: [
        option("A", "Inspect only in chat", "Read and summarize adoption risk", "No", "low", "Choose when you only want a diagnosis"),
        option("B", "Docs-only adapter assessment", "Draft adoption assessment and governance map without replacing existing governance", "Report/docs only, if approved", "low/medium", "Choose for existing governed or production-sensitive projects"),
        option("C", "Controlled setup after review", "Prepare workflow setup only after adapter assessment is approved", "Yes, approved workflow assets only", "medium/high", "Choose only after reviewing the assessment"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when project ownership or risk is unclear"),
      ],
      reason: "Governed, production-sensitive, or dirty projects should not receive a full workflow install before mapping existing rules.",
      ifNothing: "Codex should remain read-only and avoid workflow writes.",
    };
  }

  if (action === "REVIEW_DIRTY_WORKTREE") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Review existing changes first",
      options: [
        option("A", "Inspect git status only", "List changed files and risk signals", "No", "low", "Choose when you only need visibility"),
        option("B", "Review existing changes first", "Prepare a review packet or ownership summary", "Report only", "medium", "Choose when the changes may affect the next task"),
        option("C", "Human cleans worktree", "Wait until owner commits, stashes, splits, or discards changes", "No", "low", "Choose for production-governed projects"),
        option("D", "Proceed after explicit approval", "Continue only inside approved scope", "Approved task files only", "high", "Choose only when the owner accepts the risk"),
      ],
      reason: "Starting new work on top of unknown changes can mix ownership and hide regressions.",
      ifNothing: "Codex should not create task artifacts or edit project files.",
    };
  }

  if (action === "REVIEW_GOVERNANCE_MIGRATION") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Review and merge deliberately",
      options: [
        option("A", "Keep migration pending", "Summarize pending reports only", "No", "low", "Choose when you are not ready to change governance"),
        option("B", "Review and merge deliberately", "Explain report changes and wait for approval", "No direct write until approved", "medium", "Choose for existing AGENTS or PR templates"),
        option("C", "Apply approved migration", "Run the explicit migration apply flag", "Yes, AGENTS/PR template only", "medium/high", "Choose only after reviewing the report"),
        option("D", "Reject migration", "Keep current governance and record rejection", "Report only", "low/medium", "Choose when the current rules should stay unchanged"),
      ],
      reason: "Agent rules and PR templates change project governance, so they need explicit approval.",
      ifNothing: "Migration reports stay pending and full workflow checks should continue to block.",
    };
  }

  if (action === "INIT_WITH_STARTER") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Initialize starter after confirming intent",
      options: [
        option("A", "Discuss project first", "Clarify platform and starter", "No", "low", "Choose when project direction is not settled"),
        option("B", "Initialize starter", "Create workflow starter and onboarding assets", "Yes, starter/workflow assets", "low/medium", "Choose for a new project location"),
        option("C", "Use platform-specific starter", "Select a platform starter before initializing", "Yes, starter/workflow assets", "medium", "Choose when platform is known"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when this path may not be the target project"),
      ],
      reason: "New projects can be bootstrapped, but the starter choice should match the user intent.",
      ifNothing: "No starter should be created.",
    };
  }

  if (action === "RUN_WORKFLOW_ASSET_UPDATE") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Update workflow assets after confirming setup intent",
      options: [
        option("A", "Inspect missing assets", "Report gaps only", "No", "low", "Choose when you only need a status check"),
        option("B", "Update workflow assets", "Refresh .ai-native assets and scripts", "Yes, workflow assets only", "medium", "Choose when this project is meant to use the kit directly"),
        option("C", "Adapter-only path", "Map concepts without refreshing assets", "Docs/report only", "low/medium", "Choose for existing governed projects"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when asset ownership is unclear"),
      ],
      reason: "Workflow updates are safe only when the project is allowed to adopt or update the kit assets.",
      ifNothing: "The project remains on its current workflow asset state.",
    };
  }

  if (action === "RUN_PROJECT_ONBOARDING") {
    return {
      ...defaultSummary,
      recommendedChoice: "A - Let AI draft onboarding for review",
      options: [
        option("A", "Draft onboarding docs", "Create or update project onboarding docs from evidence", "Docs only", "low/medium", "Choose when context is missing but can be drafted"),
        option("B", "Answer focused questions first", "Ask up to three decision questions", "No", "low", "Choose when key facts are unknown"),
        option("C", "Start only a narrow exception", "Proceed with a clearly bounded low-risk task", "Approved task files only", "medium", "Choose only with explicit approval"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when project direction is not settled"),
      ],
      reason: "Onboarding lets Codex draft routine context while humans only confirm decisions.",
      ifNothing: "Codex should avoid broad implementation until onboarding is ready.",
    };
  }

  if (action === "RUN_PLATFORM_BASELINE_SETUP") {
    return {
      ...defaultSummary,
      recommendedChoice: "A - Recommend platform profile",
      options: [
        option("A", "Recommend platform profile", "Infer candidate profiles and ask for confirmation", "No or docs only if approved", "low/medium", "Choose when the platform can be detected"),
        option("B", "Draft missing platform baseline", "Create required baseline docs for selected profiles", "Docs only", "medium", "Choose after profile confirmation"),
        option("C", "Keep pending", "Leave baseline blocked", "No", "low", "Choose when platform is unclear"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when no one can confirm the platform"),
      ],
      reason: "Platform baselines affect engineering rules and verification, so selection should be explicit.",
      ifNothing: "Platform-dependent work should remain blocked or limited.",
    };
  }

  if (action === "RUN_INDUSTRIAL_BASELINE_SETUP") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Draft selected BL2 evidence for review",
      options: [
        option("A", "Stay BL0/BL1", "Avoid strict industrial packs for now", "No", "low/medium", "Choose when industrial governance is not needed"),
        option("B", "Draft selected BL2 evidence", "Prepare baseline selection and evidence gaps", "Docs/report only", "medium", "Choose when strict governance may be needed"),
        option("C", "Install selected packs after approval", "Apply only approved industrial pack assets", "Yes, selected workflow assets only", "high", "Choose after explicit BL2 approval"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when risk ownership is unclear"),
      ],
      reason: "BL2 and industrial packs are selected-only and require evidence plus human approval.",
      ifNothing: "Codex should not assume BL2 or install industrial packs.",
    };
  }

  if (action === "READY_FOR_FIRST_REQUEST") {
    return {
      ...defaultSummary,
      recommendedChoice: "A - Create the first request card",
      options: [
        option("A", "Create first request", "Draft the first request card from the user's goal", "Workflow record only", "low", "Choose when the first slice is clear"),
        option("B", "Discuss first slice", "Ask focused questions before creating artifacts", "No", "low", "Choose when the first slice is unclear"),
        option("C", "Baseline check first", "Re-check onboarding or baseline state", "No", "low", "Choose when setup may be stale"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when no implementation goal exists"),
      ],
      reason: "A request card starts work without jumping directly into code.",
      ifNothing: "No implementation task should begin.",
    };
  }

  if (action === "READY_FOR_TASK_EXECUTION") {
    return {
      ...defaultSummary,
      recommendedChoice: "B - Select one approved task",
      options: [
        option("A", "Execute current selected task", "Implement only the approved task card", "Approved task files only", "medium", "Choose when exactly one task is selected"),
        option("B", "Select one approved task", "Ask which task to run next, then verify artifacts", "No until selected", "low/medium", "Choose when multiple tasks or ambiguity exists"),
        option("C", "Review before execution", "Run artifact or review checks first", "Evidence/report only", "low", "Choose when confidence is not high"),
        option("D", "Pause", "Stop and wait", "No", "low", "Choose when task approval is unclear"),
      ],
      reason: "Task execution should be tied to one explicit task card and verification path.",
      ifNothing: "Codex should not choose a task silently when selection is ambiguous.",
    };
  }

  return defaultSummary;
}

function printTechnicalOutput(result, enforceFailures) {
  console.log(`PROJECT_ROOT: ${result.projectRoot}`);
  console.log(`PROJECT_STATE: ${result.projectState}`);
  console.log(`PROJECT_STATE_TAGS: ${(result.projectStateTags || []).join(", ") || "none"}`);
  console.log(`WORKFLOW_STATE: ${result.workflowState}`);
  console.log(`ONBOARDING_STATE: ${result.onboardingState}`);
  console.log(`PLATFORM_BASELINE_STATE: ${result.platformBaselineState}`);
  console.log(`INDUSTRIAL_BASELINE_STATE: ${result.industrialBaselineState}`);
  console.log(`BASELINE_LEVEL: ${result.baselineLevel || "none"}`);
  console.log(`VERSION_STATE: ${result.versionState}`);
  console.log(`ADOPTION_MODE: ${result.adoptionMode || "unknown"}`);
  console.log(`NEXT_ACTION: ${result.nextAction}`);
  console.log(`CAN_WRITE_WORKFLOW_ASSETS: ${result.canWriteWorkflowAssets}`);
  console.log(`MUST_STOP_FOR_HUMAN: ${result.mustStopForHuman}`);
  if (result.governanceSignals) {
    console.log(`GOVERNANCE_SIGNALS: basic=${result.governanceSignals.basicSignals.length}, production=${result.governanceSignals.productionSignals.length}, dirty=${result.governanceSignals.isDirtyWorktree ? "yes" : "no"}`);
  }
  console.log("");
  console.log("## Notes");
  console.log("");
  for (const note of result.notes) console.log(`- ${note}`);
  console.log("");
  console.log("## Pending Migration Reports");
  console.log("");
  if (result.pendingMigrationReports.length === 0) {
    console.log("- None");
  } else {
    for (const report of result.pendingMigrationReports) console.log(`- ${report}`);
  }
  console.log("");
  console.log("## Suggested Command");
  console.log("");
  console.log(result.suggestedCommand);
  if (enforce) {
    console.log("");
    console.log("## Enforce");
    console.log("");
    if (enforceFailures.length === 0) {
      console.log("PASS");
    } else {
      for (const reason of enforceFailures) console.log(`FAIL ${reason}`);
    }
  }
}

function enforceReasons(result) {
  const reasons = [];
  if (result.projectState === "TARGET_MISSING") reasons.push("target path is missing");
  if (result.versionState === "MISMATCH") reasons.push("workflow version is not current");
  if (result.workflowState === "PARTIAL_BOOTSTRAP") reasons.push("workflow bootstrap is partial");
  if (result.workflowState === "BOOTSTRAPPED_WITH_MISSING_ASSETS") reasons.push("workflow assets or AGENTS.md governance sections are missing");
  if (result.workflowState === "BOOTSTRAPPED_WITH_PENDING_MIGRATION") reasons.push("migration reports need human approval");
  if (result.nextAction === "RUN_WORKFLOW_ASSET_UPDATE") reasons.push("workflow asset update is required");
  if (result.nextAction === "RUN_PROJECT_ONBOARDING") reasons.push("project onboarding is not ready");
  if (result.nextAction === "RUN_PLATFORM_BASELINE_SETUP") reasons.push("platform baseline is not ready");
  if (result.nextAction === "RUN_INDUSTRIAL_BASELINE_SETUP") reasons.push("industrial baseline is not ready");
  if (result.nextAction === "RUN_ADOPTION_ASSESSMENT") reasons.push("read-only adoption assessment is required before workflow writes");
  if (result.nextAction === "REVIEW_DIRTY_WORKTREE") reasons.push("dirty production-governed worktree needs human confirmation before task execution");
  return [...new Set(reasons)];
}

function buildHumanOutput(result) {
  const common = {
    decisions: ["No human decision is needed for the current next action."],
    aiCanDo: ["Read workflow files and report status.", "Run non-destructive local checks when requested."],
    aiMustNotDo: ["Do not expand scope or change risk approvals without explicit human confirmation."],
  };

  const action = result.nextAction;
  const stateReason = result.notes?.[0] || "Workflow state was inspected.";

  if (result.projectState === "TARGET_MISSING") {
    return {
      summary: "The target project path does not exist, so AI cannot inspect or configure the project yet.",
      status: "Must stop",
      reason: "The target directory is missing.",
      riskLevel: "medium",
      canAiContinue: "no",
      decisions: ["Confirm the correct project path or create the target directory."],
      nextStep: "Select or create a valid project root, then run workflow-next again.",
      aiCanDo: ["Wait for a valid project path."],
      aiMustNotDo: ["Do not create workflow files in an unknown or unintended location."],
    };
  }

  if (result.projectState === "DEV_KIT_REPOSITORY") {
    return {
      summary: "This directory is the AI Native Dev Kit source repository, not a target project.",
      status: "Can continue",
      reason: "Dev-kit self-check is the appropriate next action here.",
      riskLevel: "low",
      canAiContinue: "yes",
      decisions: ["No project setup decision is needed."],
      nextStep: "Run the dev-kit self-check before changing shared workflow assets.",
      aiCanDo: ["Run dev-kit checks.", "Edit shared workflow assets when that is the active task."],
      aiMustNotDo: ["Do not treat this repository as a generated target project."],
    };
  }

  if (action === "RUN_ADOPTION_ASSESSMENT") {
    return {
      summary: "This looks like an existing governed, production-sensitive, or dirty project. AI should first perform a read-only adoption assessment instead of writing workflow assets.",
      status: "Needs confirmation",
      reason: "Existing governance or worktree risk was detected.",
      riskLevel: "high",
      canAiContinue: "limited",
      decisions: [
        "Confirm whether the adoption assessment should stay in chat or be written to an approved file location.",
        "Confirm whether adapter setup is allowed after the assessment is reviewed.",
      ],
      nextStep: "Create a read-only adoption assessment and existing governance map, then wait for approval before any setup writes.",
      aiCanDo: [
        "Read existing governance files.",
        "Draft adoption assessment and governance mapping.",
        "Summarize gaps and conflicts.",
      ],
      aiMustNotDo: [
        "Do not run init-project or update workflow assets.",
        "Do not create migration reports or modify project files without approval.",
        "Do not change business code, CI, release, production config, or agent rules.",
      ],
    };
  }

  if (action === "REVIEW_DIRTY_WORKTREE") {
    return {
      summary: "This project is already bootstrapped and production-governed, but the worktree has existing changes. AI should stop before starting a new task.",
      status: "Must stop",
      reason: "Dirty production-governed worktree protection is active.",
      riskLevel: "high",
      canAiContinue: "no",
      decisions: [
        "Confirm who owns the existing changes.",
        "Choose whether to continue, split, stash, commit, or package the changes for review.",
      ],
      nextStep: "Review git status with the human before creating artifacts or executing a task.",
      aiCanDo: ["Summarize changed files.", "Prepare a review packet if the human asks for one."],
      aiMustNotDo: ["Do not create new task artifacts or edit files until the current changes are confirmed."],
    };
  }

  if (action === "REVIEW_GOVERNANCE_MIGRATION") {
    return {
      summary: "Workflow assets are present, but one or more governance migration reports need human approval before they can be applied.",
      status: "Needs confirmation",
      reason: "Applying AGENTS.md or PR template governance changes can affect project rules.",
      riskLevel: "medium",
      canAiContinue: "limited",
      decisions: ["Review the pending migration reports and approve, reject, or manually merge them."],
      nextStep: "Summarize the migration reports and wait for explicit approval before applying them.",
      aiCanDo: ["Read and summarize migration reports.", "Explain the proposed appendix and missing markers."],
      aiMustNotDo: ["Do not apply AGENTS.md or PR template migrations without explicit approval."],
    };
  }

  if (action === "INIT_WITH_STARTER") {
    return {
      summary: "This appears to be a new project location. AI can initialize the workflow starter if the user intended setup.",
      status: "Can continue",
      reason: "No existing project or governance signals were detected.",
      riskLevel: "low",
      canAiContinue: "yes",
      decisions: ["Confirm the intended starter if a platform-specific starter is preferred."],
      nextStep: "Initialize the generic starter, or choose a platform starter first.",
      aiCanDo: ["Create workflow assets and starter files.", "Run onboarding checks after setup."],
      aiMustNotDo: ["Do not add business implementation before project onboarding and the first task chain."],
    };
  }

  if (action === "RUN_WORKFLOW_ASSET_UPDATE") {
    return {
      summary: "The project has AI Native workflow assets, but they are missing or not current. AI can update workflow assets if setup intent is confirmed.",
      status: "Can continue",
      reason: stateReason,
      riskLevel: "medium",
      canAiContinue: "limited",
      decisions: ["Confirm that workflow asset update is allowed for this project."],
      nextStep: "Run workflow asset update, then review any migration reports before applying them.",
      aiCanDo: ["Refresh .ai-native assets and workflow scripts.", "Create migration reports for existing governance files."],
      aiMustNotDo: ["Do not overwrite existing project docs, task files, logs, specs, or business code."],
    };
  }

  if (action === "RUN_PROJECT_ONBOARDING") {
    return {
      summary: "The workflow is installed, but project context still needs confirmation before normal implementation.",
      status: "Needs confirmation",
      reason: "Project onboarding is missing or still has pending decisions.",
      riskLevel: "medium",
      canAiContinue: "limited",
      decisions: ["Confirm project direction, selected profiles, technology strategy, risk boundaries, and first vertical slice."],
      nextStep: "Let AI draft onboarding docs from the conversation, then ask for focused confirmation.",
      aiCanDo: ["Draft onboarding docs.", "Ask focused questions.", "Run onboarding checks."],
      aiMustNotDo: ["Do not start broad feature implementation until onboarding is ready or an explicit narrow exception is approved."],
    };
  }

  if (action === "RUN_PLATFORM_BASELINE_SETUP") {
    return {
      summary: "Project context exists, but the runtime profile baseline is not ready yet.",
      status: "Needs confirmation",
      reason: "Selected profiles or required platform baseline docs are missing.",
      riskLevel: "medium",
      canAiContinue: "limited",
      decisions: ["Confirm which project profiles apply and whether required docs are acceptable."],
      nextStep: "Select profiles in docs/project-profile.md and run the platform baseline check.",
      aiCanDo: ["Recommend profiles from project context.", "Draft missing baseline docs.", "Run platform baseline checks."],
      aiMustNotDo: ["Do not assume a platform profile or weaken required verification without confirmation."],
    };
  }

  if (action === "RUN_INDUSTRIAL_BASELINE_SETUP") {
    return {
      summary: "The project selected or needs strict industrial governance, but baseline selection, packs, evidence, or approval is not ready yet.",
      status: result.industrialBaselineState === "EVIDENCE_MISSING" ? "Needs missing evidence" : "Needs confirmation",
      reason: "BL2 work requires selected packs, evidence, and human approval before strict execution.",
      riskLevel: "high",
      canAiContinue: "limited",
      decisions: ["Confirm BL level, selected industrial packs, exceptions, residual risks, and Human Approval."],
      nextStep: "Use the industrial pack selection guide, draft baseline selection/evidence, install selected packs, then run BL2 checks.",
      aiCanDo: ["Read the selection guide.", "Recommend the smallest relevant pack set.", "Draft baseline evidence and explain gaps."],
      aiMustNotDo: ["Do not treat BL2 or any industrial pack as accepted until the human confirms it."],
    };
  }

  if (action === "READY_FOR_FIRST_REQUEST") {
    return {
      summary: "The project workflow is ready enough to start the first request card.",
      status: "Can continue",
      reason: "No blocking setup issue was detected, but no workflow artifact exists yet.",
      riskLevel: "low",
      canAiContinue: "yes",
      decisions: ["Confirm the first small request or vertical slice."],
      nextStep: "Create the first request card and continue through preflight, spec, eval, and task.",
      aiCanDo: ["Create the first request card.", "Draft preflight, spec, eval, and task after the request is clear."],
      aiMustNotDo: ["Do not skip spec/eval/task for non-trivial implementation."],
    };
  }

  if (action === "READY_FOR_TASK_EXECUTION") {
    return {
      summary: "Workflow setup is ready and task artifacts exist. AI can proceed only through an approved task card and required verification.",
      status: "Can continue",
      reason: "No blocking workflow setup issue was detected.",
      riskLevel: "medium",
      canAiContinue: "yes",
      decisions: ["Confirm which task card should be executed next if more than one exists."],
      nextStep: "Use the selected task card, run artifact checks, implement within scope, verify, and record the result.",
      aiCanDo: ["Execute one approved task card.", "Run verification.", "Create AI task log and review assets when required."],
      aiMustNotDo: ["Do not widen scope, bypass Risk Gate, or self-approve high-risk decisions."],
    };
  }

  return {
    summary: `Workflow-next selected ${action}. Review the technical details before continuing.`,
    status: result.mustStopForHuman === "yes" ? "Needs confirmation" : "Can continue",
    reason: stateReason,
    riskLevel: result.mustStopForHuman === "yes" ? "medium" : "low",
    canAiContinue: result.mustStopForHuman === "yes" ? "limited" : "yes",
    nextStep: result.suggestedCommand || "Follow NEXT_ACTION.",
    ...common,
  };
}
