import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { assessExistingProjectProfileReconciliation } from "../scripts/lib/existing-project-adoption-coordinator.mjs";
import {
  createSelectedProfilesReconciliationAction,
  validateSelectedProfilesReconciliationAction,
} from "../scripts/lib/project-profile-reconciliation.mjs";
import { isRequestBoundLocalActionAllowed } from "../scripts/lib/request-bound-apply-authority.mjs";
import { buildPlan } from "../scripts/init-project/plan.mjs";
import {
  createAutomaticRequestBoundApplyContext,
  replayApprovedPlan,
  validatePlanForApply,
} from "../scripts/init-project/apply.mjs";
import { validateVerifiedApplyReceiptFile } from "../scripts/lib/adoption-apply-chain.mjs";

const source = [
  "# Project Profile: existing-project",
  "",
  "## Status",
  "",
  "Human decision status: CONFIRMED_FOR_SELECTED_PROFILES",
  "",
  "## Selected Profiles",
  "",
  "- wechat-miniprogram",
  "- backend-api",
  "- internal-admin",
  "- high-risk-change",
  "",
  "## Profile Rationale",
  "",
  "Keep this project-owned rationale byte-for-byte.",
  "",
].join("\n");

function assessment() {
  return assessExistingProjectProfileReconciliation({
    declaredProfiles: ["wechat-miniprogram", "backend-api", "internal-admin", "high-risk-change"],
    projectEvidence: {
      profiles: ["wechat-miniprogram", "internal-admin", "web-app"],
      inspectionStatus: "COMPLETE",
      profileSignals: [{
        profile: "web-app",
        evidence: [{ source: "project-file", reason: "web entrypoint or framework configuration" }],
      }],
    },
  });
}

function docsBridgePlan() {
  return {
    operationKind: "NATIVE_ADOPTION",
    arguments: { migrationDepth: "DOCS_BRIDGE" },
  };
}

test("selected profile reconciliation changes only one exact Markdown section", () => {
  const action = createSelectedProfilesReconciliationAction({ currentContent: source, assessment: assessment() });
  const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
  const sourcePrefix = source.slice(0, source.indexOf("## Selected Profiles"));
  const proposedPrefix = proposed.slice(0, proposed.indexOf("## Selected Profiles"));
  const sourceSuffix = source.slice(source.indexOf("## Profile Rationale"));
  const proposedSuffix = proposed.slice(proposed.indexOf("## Profile Rationale"));

  assert.equal(proposedPrefix, sourcePrefix);
  assert.equal(proposedSuffix, sourceSuffix);
  assert.match(proposed, /- web-app/);
  assert.match(proposed, /- wechat-miniprogram\n- backend-api\n- internal-admin\n- high-risk-change\n- web-app\n\n## Profile Rationale/);
  assert.deepEqual(action.preservation.addedProfiles, ["web-app"]);
  assert.deepEqual(action.preservation.removedProfiles, []);
  assert.equal(validateSelectedProfilesReconciliationAction(action, docsBridgePlan(), source), true);
});

test("selected profile reconciliation rejects prefix, suffix, and migration-stage widening", () => {
  const action = createSelectedProfilesReconciliationAction({ currentContent: source, assessment: assessment() });
  const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
  const prefixTamper = structuredClone(action);
  prefixTamper.inlineContentBase64 = Buffer.from(proposed.replace("existing-project", "different-project")).toString("base64");
  assert.equal(validateSelectedProfilesReconciliationAction(prefixTamper, docsBridgePlan(), source), false);

  const suffixTamper = structuredClone(action);
  suffixTamper.inlineContentBase64 = Buffer.from(proposed.replace("byte-for-byte", "changed")).toString("base64");
  assert.equal(validateSelectedProfilesReconciliationAction(suffixTamper, docsBridgePlan(), source), false);

  assert.equal(validateSelectedProfilesReconciliationAction(action, {
    operationKind: "NATIVE_ADOPTION",
    arguments: { migrationDepth: "SELECTED_ASSETS" },
  }, source), false);
});

test("selected profile reconciliation rejects duplicate sections and subtractive proposals", () => {
  assert.throws(
    () => createSelectedProfilesReconciliationAction({
      currentContent: `${source}\n## Selected Profiles\n\n- web-app\n`,
      assessment: assessment(),
    }),
    /exactly one/,
  );
  const subtractive = assessment();
  subtractive.proposed_profiles = ["wechat-miniprogram", "web-app"];
  const { assessment_digest: _digest, ...base } = subtractive;
  subtractive.assessment_digest = evidenceDigest(base, []);
  assert.throws(
    () => createSelectedProfilesReconciliationAction({ currentContent: source, assessment: subtractive }),
    /additive/,
  );
});

test("request-bound authority accepts only the exact current project profile preimage", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-profile-authority-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "project-profile.md"), source);
  const action = createSelectedProfilesReconciliationAction({ currentContent: source, assessment: assessment() });
  const plan = {
    targetRoot: root,
    operationKind: "NATIVE_ADOPTION",
    arguments: { migrationDepth: "DOCS_BRIDGE" },
    actions: [action],
  };

  assert.equal(isRequestBoundLocalActionAllowed(action, plan, { validationPhase: "PRE_APPLY" }), true);
  fs.appendFileSync(path.join(root, "docs", "project-profile.md"), "\nProject-owned drift.\n");
  assert.equal(isRequestBoundLocalActionAllowed(action, plan, { validationPhase: "PRE_APPLY" }), false);
});

test("docs bridge plan contains only the exact profile section transaction and receipt", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-profile-plan-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "docs"));
  fs.mkdirSync(path.join(root, "admin"));
  fs.writeFileSync(path.join(root, "docs", "project-profile.md"), source);
  fs.writeFileSync(path.join(root, "admin", "index.html"), "<!doctype html><title>Admin</title>\n");
  fs.writeFileSync(path.join(root, "project.config.json"), "{}\n");
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({ name: "profile-plan-fixture", private: true }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "AGENTS.md"), [
    "# Project Rules",
    "",
    "- Preserve release and rollback controls.",
    "- Run project tests before completion.",
    "",
  ].join("\n"));

  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt IntentOS while preserving all project-owned files and rules",
    migrationDepth: "DOCS_BRIDGE",
    createdAt: new Date().toISOString(),
  });
  const writes = plan.actions.filter((action) => action.willWrite);
  assert.equal(plan.executionState, "EXECUTABLE");
  assert.equal(plan.adoptionAssessment.assessment_state, "READY_FOR_PROFILE_RECONCILIATION");
  assert.equal(plan.adoptionAssessment.rule_reconciliation.source_mode, "SAME_RUN_ENVELOPE");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.state, "PROFILE_RECONCILIATION_REQUIRED");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.next_action, "PREPARE_CONTROLLED_PROFILE_RECONCILIATION");
  assert.deepEqual(writes.map((action) => action.path), [
    "docs/project-profile.md",
    plan.receiptPath,
  ]);
  assert.equal(writes[0].type, "RECONCILE_PRESERVE");
  assert.equal(writes.some((action) => action.path === "AGENTS.md"), false);
  assert.equal(writes.some((action) => action.path.startsWith("scripts/")), false);
  assert.equal(writes.some((action) => action.path === ".intentos/version.json"), false);
  assert.doesNotThrow(() => validatePlanForApply(plan));

  const planPath = path.join(root, "apply-execution-plans", "profile-reconciliation.json");
  fs.mkdirSync(path.dirname(planPath), { recursive: true });
  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);
  const context = createAutomaticRequestBoundApplyContext(plan, planPath, {
    activeRequest: plan.arguments.goal,
    activeRequestDigest: plan.arguments.goalDigest,
    now: Date.now(),
  });
  const receipt = replayApprovedPlan(plan, context);
  assert.equal(receipt.receipt_state, "APPLY_VERIFIED");
  assert.equal(receipt.activation.project_state, "PROFILE_RECONCILED");
  assert.equal(receipt.activation.next_action, "RERUN_NATIVE_ADOPTION_DISCOVERY");
  assert.equal(fs.existsSync(path.join(root, ".intentos", "version.json")), false);
  assert.equal(fs.existsSync(path.join(root, "scripts")), false);
  assert.equal(validateVerifiedApplyReceiptFile(root, plan.receiptPath, {
    schemasRoot: path.resolve("."),
  }).ok, true);
});
