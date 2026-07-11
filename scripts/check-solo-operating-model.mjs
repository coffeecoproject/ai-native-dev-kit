#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isSpecificHumanApprover } from "./lib/approval-record-validation.mjs";
import { buildSoloOperatingModel, SOLO_OPERATING_MODEL } from "./lib/solo-operating-model.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(scriptDir, "..");
let failed = false;

const requiredAssets = [
  "core/zero-experience-solo-operating-model.md",
  "docs/plans/zero-experience-solo-operating-model-1.99-plan.md",
  "scripts/lib/solo-operating-model.mjs",
  "scripts/check-solo-operating-model.mjs",
  "platforms/codex/AGENTS.template.md",
];

for (const asset of requiredAssets) {
  if (fs.existsSync(path.join(kitRoot, asset))) pass(`required asset exists: ${asset}`);
  else fail(`required asset missing: ${asset}`);
}

checkCoreContract();
checkResponsibilityProjection();
checkPublicOperatingEntry();
checkBeginnerEntry();
checkBusinessAndImpactEntry();
checkExistingProjectAdoptionEntry();
checkReleasePreparationEntries();
checkCurrentConversationIdentity();
checkPublicRoleLanguage();

if (failed) process.exit(1);
console.log("Zero-experience solo operating model check passed.");

function checkCoreContract() {
  const content = read("core/zero-experience-solo-operating-model.md");
  for (const marker of [
    "zero-experience solo developer",
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
    "Silence",
    "Hidden Workflow Rule",
    "technical choices",
  ]) {
    if (content.toLowerCase().includes(marker.toLowerCase())) pass(`solo contract includes ${marker}`);
    else fail(`solo contract missing ${marker}`);
  }
}

function checkResponsibilityProjection() {
  const routine = buildSoloOperatingModel({ intent: "修改预约页面并补齐测试", operation: "CONTINUE_TASK", actionCode: "PREPARE_IMPLEMENTATION_REVIEW", language: "zh" });
  if (routine.operatingModel === SOLO_OPERATING_MODEL
    && routine.userResponsibilityClass === "NO_USER_ACTION"
    && routine.technicalDecisionRequiredFromUser === "No"
    && routine.internalRoleSelectionRequiredFromUser === "No"
    && routine.routineEngineeringMayProceedAfterInternalGates === "Yes"
    && routine.capabilityCoverage.userSelectsProfilesOrPacks === "No") {
    pass("routine engineering is delegated to Codex without a technical-choice prompt");
  } else fail("routine engineering did not resolve to the solo delegation contract");

  const product = buildSoloOperatingModel({ intent: "做一个带登录和退款的预约管理后台", operation: "START_PROJECT", actionCode: "PREPARE_PROJECT_PLAN", language: "zh" });
  if (product.capabilityCoverage.inferredProfiles.includes("internal-admin")
    && product.capabilityCoverage.inferredCapabilities.includes("DATA_STORAGE")
    && product.capabilityCoverage.inferredCapabilities.includes("AUTH_PERMISSION")
    && product.capabilityCoverage.inferredCapabilities.includes("PAYMENT_VALUE_TRANSFER")
    && product.capabilityCoverage.internalPackRecommendations.includes("data-storage-industrial")
    && product.capabilityCoverage.internalPackRecommendations.includes("auth-permission-industrial")
    && product.capabilityCoverage.missingCoverageIsUserDecision === "No") {
    pass("capability coverage maps product intent to internal technical packs without user selection");
  } else fail("capability coverage did not map product intent to the required internal technical coverage");

  const external = buildSoloOperatingModel({ intent: "实现税务规则并满足当地合规要求", operation: "CONTINUE_TASK", actionCode: "PREPARE_BUSINESS_RULE_CLOSURE", language: "zh" });
  if (external.userResponsibilityClass === "EXTERNAL_FACT_NEEDED"
    && external.unaffectedEngineeringMayContinue === "Yes"
    && external.responsibilityDomains.includes("EXTERNAL_POLICY")) {
    pass("external facts keep only dependent capability blocked while engineering continues");
  } else fail("external facts did not resolve to a bounded dependent-capability block");

  const release = buildSoloOperatingModel({ intent: "现在正式发布并向真实用户发送通知", operation: "PREPARE_RELEASE", actionCode: "PREPARE_RELEASE_REVIEW", language: "zh" });
  if (release.userResponsibilityClass === "REAL_WORLD_CONSENT_NEEDED"
    && release.userActionRequiredNow === "No"
    && release.silenceCountsAsConsent === "No") {
    pass("release preparation defers consent until the concrete real-world effect is ready");
  } else fail("release preparation did not preserve real-world consent boundaries");
}

function checkPublicOperatingEntry() {
  withTemporaryProject("intentos-solo-work-", (root) => {
    makeExistingProject(root);
    makeQueue(root, "TASK-APPOINTMENT", "完善预约取消规则");
    const report = runJson(["scripts/resolve-operating-loop.mjs", root, "--intent", "完善预约取消规则"]);
    if (report.schemaVersion === "1.99.0"
      && report.decisionResponsibility?.operatingModel === SOLO_OPERATING_MODEL
      && report.decisionResponsibility?.technicalDecisionRequiredFromUser === "No"
      && report.decisionResponsibility?.internalRoleSelectionRequiredFromUser === "No"
      && report.boundaries?.requiresSeparateTechnicalApprovalAfterInternalGates === "No") {
      pass("public work entry exposes the zero-experience solo contract");
    } else fail("public work entry does not expose the zero-experience solo contract");
  });
}

function checkBeginnerEntry() {
  withTemporaryProject("intentos-solo-beginner-", (root) => {
    const report = runJson(["scripts/resolve-beginner-entry.mjs", root, "我想做一个预约 App"]);
    const questions = (report.questionsForHuman || []).join("\n");
    if (report.operatingModel === SOLO_OPERATING_MODEL
      && report.boundary?.requiresTechnicalChoiceFromUser === "No"
      && report.boundary?.requiresWorkflowKnowledgeFromUser === "No"
      && report.boundary?.requiresMultiplePeople === "No"
      && !/(BL[012]|baseline|工业包|技术栈|数据库|测试类型|review surface|owner)/i.test(questions)) {
      pass("beginner entry asks no technical, workflow, or organization question");
    } else fail("beginner entry still exposes a technical, workflow, or organization choice");
  });
}

function checkBusinessAndImpactEntry() {
  withTemporaryProject("intentos-solo-business-", (root) => {
    makeExistingProject(root);
    const business = runJson(["scripts/resolve-business-rule-closure.mjs", root, "--intent", "appointment requests must include a service time"]);
    if (business.outcome === "READY_FOR_IMPACT_COVERAGE"
      && business.userConfirmationQuestions?.length === 0
      && !/domain owner|release owner|choose.*(?:UI|backend|API)/i.test(JSON.stringify(business.humanSummary || {}))) {
      pass("ordinary business-rule closure uses complete safe defaults without a technical user question");
    } else fail("ordinary business-rule closure still delegates technical coverage to the user");

    const impact = runJson(["scripts/resolve-change-impact-coverage.mjs", root, "--intent", "appointment requests must include a service time"]);
    if (Array.isArray(impact.humanDecisionsNeeded) && impact.humanDecisionsNeeded.length === 0) {
      pass("impact coverage remains an internal technical responsibility");
    } else fail("impact coverage still asks the user to choose technical surfaces");
  });
}

function checkExistingProjectAdoptionEntry() {
  withTemporaryProject("intentos-solo-adoption-", (root) => {
    makeExistingProject(root);
    const report = runJson(["scripts/resolve-existing-project-adoption-autopilot.mjs", root, "--intent", "把这个老项目接入 IntentOS"]);
    const questions = JSON.stringify(report.humanDecisions || []);
    if ((report.humanDecisions || []).every((item) => item.required_now === "No")
      && !/which owner|project owner|should codex prepare/i.test(questions)) {
      pass("existing-project adoption prepares technical reconciliation without an adoption-mode decision");
    } else fail("existing-project adoption still delegates the technical adoption mode to the user");
  });
}

function checkReleasePreparationEntries() {
  withTemporaryProject("intentos-solo-release-", (root) => {
    makeExistingProject(root);
    const adapter = runJson(["scripts/resolve-release-adapter.mjs", root, "--intent", "prepare release"]);
    const guide = runJson(["scripts/resolve-release-guide.mjs", root, "--intent", "prepare release"]);
    const plan = runJson(["scripts/resolve-release-plan.mjs", root, "--intent", "prepare release"]);
    if ((adapter.beginnerCard?.questions || adapter.beginnerExperience?.questions || []).length === 0
      && (guide.beginnerCard?.questions || guide.beginnerExperience?.questions || []).length === 0) {
      pass("release adapter and guide make technical release-path choices internally");
    } else fail("release adapter or guide still asks the user for a technical release-path choice");
    const publicPlan = JSON.stringify({ summary: plan.humanSummary, input: plan.humanMustDecide, actions: plan.externalSystemActions });
    if (/REAL_WORLD_CONSENT_NEEDED/.test(publicPlan)
      && !/Ask owner|select a platform release recipe|who can approve/i.test(publicPlan)) {
      pass("release plan separates technical preparation from concrete real-world consent");
    } else fail("release plan still exposes owner or technical-selection burden");
  });
}

function checkCurrentConversationIdentity() {
  if (isSpecificHumanApprover("CURRENT_CONVERSATION_USER")
    && !isSpecificHumanApprover("user")
    && !isSpecificHumanApprover("Codex")) {
    pass("structured consent accepts the current conversation user without accepting ambiguous or AI identities");
  } else fail("current-conversation consent identity calibration failed");
}

function checkPublicRoleLanguage() {
  const publicFiles = [
    "scripts/resolve-operating-loop.mjs",
    "scripts/resolve-beginner-entry.mjs",
    "core/zero-experience-solo-operating-model.md",
    "core/beginner-entry.md",
  ];
  const forbidden = /\b(PROJECT_OWNER|TASK_SCOPE_OWNER|DOMAIN_OWNER|SECURITY_OWNER|DATA_OWNER|PRODUCTION_OWNER|RELEASE_OWNER|COMPLIANCE_OWNER|EXTERNAL_SYSTEM_OWNER)\b/;
  for (const file of publicFiles) {
    const content = read(file);
    if (!forbidden.test(content)) pass(`public solo surface hides enterprise role tokens: ${file}`);
    else fail(`public solo surface exposes enterprise role token: ${file}`);
  }
}

function runJson(args) {
  const result = spawnSync(process.execPath, [...args, "--json"], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 1024 * 1024 * 24,
  });
  if (result.status !== 0) {
    fail(`command failed: node ${args.join(" ")}: ${result.stderr || result.stdout}`);
    return {};
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    fail(`command returned invalid JSON: node ${args.join(" ")}: ${error.message}`);
    return {};
  }
}

function withTemporaryProject(prefix, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function makeExistingProject(root) {
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({ name: "solo-existing-project", private: true }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = true;\n");
}

function makeQueue(root, taskId, title) {
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, "work-queue/current.md"), [
    "# Work Queue",
    "",
    "| Task ID | Title | State | Evidence | Resume Review | Notes |",
    "|---|---|---|---|---|---|",
    `| ${taskId} | ${title} | CURRENT | test setup | N/A | current |`,
    "",
  ].join("\n"));
}

function read(relativePath) {
  return fs.readFileSync(path.join(kitRoot, relativePath), "utf8");
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}
