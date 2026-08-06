import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { verifiedBootstrapManagedOwnership } from "../scripts/lib/bootstrap-transaction.mjs";
import {
  consumeRequestBoundApplyAuthority,
  createRequestBoundApplyAuthority,
  createRequestBoundReadiness,
  isRequestBoundLocalActionAllowed,
  requestBoundAuthorityConsumptionState,
  validateCurrentRequestForPlan,
  validateRequestBoundApplyAuthority,
  validateRequestBoundLocalActionGraph,
  validateRequestBoundReadiness,
} from "../scripts/lib/request-bound-apply-authority.mjs";

function sha(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-request-authority-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const legacyAgent = "# Existing Agent\n\nPreserve current project rules.\n";
  fs.writeFileSync(path.join(root, "agent.md"), legacyAgent);
  return { root, legacyAgent };
}

function planFor(root, legacyAgent) {
  const goal = "adopt this existing project into IntentOS without changing business behavior";
  const separator = legacyAgent.endsWith("\n") ? "\n" : "\n\n";
  const proposedAgent = `${legacyAgent}${separator}## IntentOS\n\n## Zero-Experience Solo Developer\n`;
  return {
    operationKind: "NATIVE_ADOPTION",
    createdAt: "2030-01-01T00:00:00.000Z",
    targetRoot: root,
    receiptPath: "apply-receipts/request-bound.md",
    planDigest: sha("exact-plan"),
    arguments: {
      goal,
      goalDigest: sha(goal),
    },
    projectIdentity: {
      fingerprint: sha(root),
      revision: sha("revision"),
    },
    targetFingerprint: {
      sourceStateDigest: sha("source-state"),
    },
    actions: [
      {
        id: "A-001",
        type: "CREATE",
        path: "AGENTS.md",
        source: null,
        inlineContentBase64: Buffer.from(proposedAgent).toString("base64"),
        preservation: {
          mode: "EXACT_PREFIX_APPEND",
          sourcePath: "agent.md",
          sourceDigest: sha(legacyAgent),
          sourceBytes: Buffer.byteLength(legacyAgent),
          separator,
        },
        sourceHash: sha(proposedAgent),
        expectedHashAfter: sha(proposedAgent),
        willWrite: true,
      },
      {
        id: "A-002",
        type: "WRITE_APPLY_RECEIPT",
        path: "apply-receipts/request-bound.md",
        source: null,
        willWrite: true,
      },
    ],
  };
}

function installBootstrapOwnership(root, relative, content) {
  const currentHash = sha(content);
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, relative), content);
  fs.writeFileSync(path.join(root, ".intentos/version.json"), `${JSON.stringify({
    intentOSVersion: "0.0.0",
    projectEntryOrigin: "NEW_PROJECT",
    workflowAssets: [],
    managedAssetDigests: {},
  }, null, 2)}\n`);
  const bootstrapPlan = {
    planVersion: "1.1",
    operation: "INIT_PROJECT",
    operationKind: "NEW_BOOTSTRAP",
    targetRoot: root,
    receiptPath: ".intentos/bootstrap-receipt.json",
    actions: [{
      id: "A-764",
      type: "CREATE",
      path: relative,
      source: relative,
      willWrite: true,
      executionSupported: true,
      sourceHash: currentHash,
      expectedHashAfter: currentHash,
    }],
  };
  bootstrapPlan.planDigest = evidenceDigest(bootstrapPlan, ["planDigest"]);
  fs.writeFileSync(path.join(root, ".intentos/bootstrap-plan.json"), `${JSON.stringify(bootstrapPlan, null, 2)}\n`);
  const base = {
    schema_version: "1.109.0",
    artifact_type: "bootstrap_transaction_receipt",
    transaction_id: "bootstrap-request-bound-consumer",
    target_root: root,
    original_topology: "ABSENT_LEAF",
    envelope_digest: sha("bootstrap envelope"),
    goal_digest: sha("bootstrap goal"),
    plan_ref: ".intentos/bootstrap-plan.json",
    plan_digest: bootstrapPlan.planDigest,
    approval_ref: "bootstrap:original-request-approval",
    approval_digest: sha("bootstrap approval"),
    readiness_ref: "bootstrap:controlled-readiness",
    readiness_digest: sha("bootstrap readiness"),
    source_inventory_digest: sha("bootstrap source inventory"),
    preserved_control_files: [],
    state: "APPLY_VERIFIED",
    actions: [{ id: "A-764", path: relative, result: "APPLIED", hash_after: currentHash }],
    errors: [],
    rollback_state: "NOT_REQUIRED",
    residual_paths: [],
    exact_action_ids: ["A-764"],
    activation: { ok: true, state: "VERIFIED_ACTIVE" },
  };
  const receipt = {
    ...base,
    receipt_ref: ".intentos/bootstrap-receipt.json",
    receipt_digest: evidenceDigest(base, []),
  };
  fs.writeFileSync(path.join(root, ".intentos/bootstrap-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
  return { bootstrapPlan, currentHash, receipt };
}

function authorityContext(t) {
  const { root, legacyAgent } = fixture(t);
  const plan = planFor(root, legacyAgent);
  const planRelativePath = "apply-execution-plans/native-adoption.json";
  const authorityRelativePath = ".intentos/apply-authorities/request.json";
  const issuedAt = "2030-01-01T00:00:00.000Z";
  const authority = createRequestBoundApplyAuthority({
    plan,
    planRelativePath,
    issuedAt,
    expiresAt: "2030-01-01T00:15:00.000Z",
  });
  const planFile = path.join(root, planRelativePath);
  fs.mkdirSync(path.dirname(planFile), { recursive: true });
  fs.writeFileSync(planFile, `${JSON.stringify(plan, null, 2)}\n`);
  const readiness = createRequestBoundReadiness({
    plan,
    authority,
    planRelativePath,
    authorityRelativePath,
  });
  return { root, legacyAgent, plan, planRelativePath, authorityRelativePath, authority, readiness };
}

test("request-bound local authority accepts an exact reversible existing-project adoption graph", (t) => {
  const context = authorityContext(t);
  const authority = validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  });
  const readiness = validateRequestBoundReadiness(context.readiness, context);
  assert.equal(authority.ok, true, authority.errors.join("; "));
  assert.equal(readiness.ok, true, readiness.errors.join("; "));
});

test("request-bound authority validates a legacy agent bridge before and after exact apply", (t) => {
  const context = authorityContext(t);
  const preApply = validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    validationPhase: "PRE_APPLY",
  });
  assert.equal(preApply.ok, true, preApply.errors.join("; "));

  const proposed = Buffer.from(context.plan.actions[0].inlineContentBase64, "base64");
  fs.writeFileSync(path.join(context.root, "AGENTS.md"), proposed);
  const postApply = validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    validationPhase: "POST_APPLY",
  });
  assert.equal(postApply.ok, true, postApply.errors.join("; "));

  fs.writeFileSync(path.join(context.root, "AGENTS.md"), "# changed after apply\n");
  const stale = validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    validationPhase: "POST_APPLY",
  });
  assert.equal(stale.ok, false);
  assert.match(stale.errors.join("\n"), /outside request-bound local authority/);
});

test("request-bound AGENTS reconcile has distinct pre-apply and post-apply invariants", (t) => {
  const context = authorityContext(t);
  const original = "# Existing AGENTS\n\nPreserve release and rollback rules.\n";
  fs.writeFileSync(path.join(context.root, "AGENTS.md"), original);
  const separator = "\n";
  const proposed = `${original}${separator}## IntentOS\n\n## Zero-Experience Solo Developer\n`;
  const action = {
    ...context.plan.actions[0],
    type: "RECONCILE_PRESERVE",
    hashBefore: sha(original),
    backupPath: ".intentos/backups/test/AGENTS.md",
    inlineContentBase64: Buffer.from(proposed).toString("base64"),
    preservation: {
      mode: "EXACT_PREFIX_APPEND",
      sourcePath: "AGENTS.md",
      sourceDigest: sha(original),
      sourceBytes: Buffer.byteLength(original),
      separator,
    },
    sourceHash: sha(proposed),
    expectedHashAfter: sha(proposed),
  };
  const plan = { ...context.plan, actions: [action, context.plan.actions[1]] };
  const authority = createRequestBoundApplyAuthority({
    plan,
    planRelativePath: context.planRelativePath,
    issuedAt: "2030-01-01T00:00:00.000Z",
    expiresAt: "2030-01-01T00:15:00.000Z",
  });
  const preApply = validateRequestBoundApplyAuthority(authority, {
    plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    validationPhase: "PRE_APPLY",
  });
  assert.equal(preApply.ok, true, preApply.errors.join("; "));

  fs.writeFileSync(path.join(context.root, "AGENTS.md"), proposed);
  const postApply = validateRequestBoundApplyAuthority(authority, {
    plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    validationPhase: "POST_APPLY",
  });
  assert.equal(postApply.ok, true, postApply.errors.join("; "));
  assert.equal(isRequestBoundLocalActionAllowed(action, plan, { validationPhase: "PRE_APPLY" }), false);
});

test("request-bound AGENTS preservation rejects a fabricated prefix proof", (t) => {
  const context = authorityContext(t);
  const fabricated = structuredClone(context.plan.actions[0]);
  const replacement = "# Replacement Agent\n\n## IntentOS\n\n## Zero-Experience Solo Developer\n";
  fabricated.inlineContentBase64 = Buffer.from(replacement).toString("base64");
  fabricated.sourceHash = sha(replacement);
  fabricated.expectedHashAfter = sha(replacement);
  const plan = { ...context.plan, actions: [fabricated, context.plan.actions[1]] };
  assert.equal(isRequestBoundLocalActionAllowed(fabricated, plan, { validationPhase: "PRE_APPLY" }), false);
  assert.equal(isRequestBoundLocalActionAllowed(fabricated, plan, { validationPhase: "RECOVERY_BINDING" }), false);
});

test("request-bound authority fails closed on request, project, plan, expiry, and reuse mismatches", (t) => {
  const context = authorityContext(t);
  const requestTamper = structuredClone(context.authority);
  requestTamper.request.request_digest = sha("different request");
  assert.equal(validateRequestBoundApplyAuthority(requestTamper, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  }).ok, false);

  const projectTamper = structuredClone(context.authority);
  projectTamper.project.revision = sha("different revision");
  assert.equal(validateRequestBoundApplyAuthority(projectTamper, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  }).ok, false);

  assert.equal(validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: "apply-execution-plans/different.json",
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  }).ok, false);
  assert.equal(validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:16:00.000Z"),
  }).ok, false);
  assert.equal(validateRequestBoundApplyAuthority(context.authority, {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
    usedAuthorityDigests: [context.authority.authority_digest],
  }).ok, false);
});

test("request-bound authority is durably consumed outside the target before replay", (t) => {
  const context = authorityContext(t);
  const options = {
    plan: context.plan,
    planRelativePath: context.planRelativePath,
    activeRequest: context.plan.arguments.goal,
    activeRequestDigest: context.plan.arguments.goalDigest,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  };

  const consumed = consumeRequestBoundApplyAuthority(context.authority, options);
  t.after(() => fs.rmSync(consumed.file, { force: true }));
  assert.equal(path.dirname(consumed.file), path.dirname(context.root));
  assert.equal(fs.lstatSync(consumed.file).isFile(), true);
  assert.equal(requestBoundAuthorityConsumptionState(context.root, context.authority.authority_digest).consumed, true);

  fs.rmSync(path.join(context.root, ".intentos"), { recursive: true, force: true });
  assert.throws(
    () => consumeRequestBoundApplyAuthority(context.authority, options),
    /already been consumed/,
  );
});

test("request-bound authority rejects business code and a fabricated legacy-agent bridge", (t) => {
  const context = authorityContext(t);
  const unsafePlan = structuredClone(context.plan);
  unsafePlan.actions[0] = {
    ...unsafePlan.actions[0],
    path: "src/business.js",
    inlineContentBase64: Buffer.from("export const changed = true;\n").toString("base64"),
  };
  const unsafeAuthority = createRequestBoundApplyAuthority({
    plan: unsafePlan,
    planRelativePath: context.planRelativePath,
    issuedAt: "2030-01-01T00:00:00.000Z",
    expiresAt: "2030-01-01T00:15:00.000Z",
  });
  const validation = validateRequestBoundApplyAuthority(unsafeAuthority, {
    plan: unsafePlan,
    planRelativePath: context.planRelativePath,
    now: Date.parse("2030-01-01T00:05:00.000Z"),
  });
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /outside request-bound local authority/);

  const fabricated = {
    ...context.plan.actions[0],
    inlineContentBase64: Buffer.from("# Replacement Agent\n\n## IntentOS\n\n## Zero-Experience Solo Developer\n").toString("base64"),
  };
  assert.equal(isRequestBoundLocalActionAllowed(fabricated, context.plan), false);
});

test("request-bound readiness cannot widen the exact action graph or external-effect boundary", (t) => {
  const context = authorityContext(t);
  const widened = structuredClone(context.readiness);
  widened.actions[0].target_paths.push("src/business.js");
  widened.boundary.approves_release_or_production = true;
  const validation = validateRequestBoundReadiness(widened, context);
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /target paths do not match|boundary expands/);
});

test("request-bound authority rejects a stale plan even when the request text still matches", (t) => {
  const context = authorityContext(t);
  const stalePlan = structuredClone(context.plan);
  stalePlan.createdAt = "2030-01-01T00:00:00.000Z";
  const validation = validateCurrentRequestForPlan(stalePlan, {
    request: stalePlan.arguments.goal,
    requestDigest: stalePlan.arguments.goalDigest,
    now: Date.parse("2030-01-01T00:16:00.000Z"),
  });
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /plan is stale/i);
});

test("request-bound authority cannot overwrite an unmanaged existing workflow script", (t) => {
  const context = authorityContext(t);
  const relative = "scripts/workflow-next.mjs";
  const content = "export const projectOwned = true;\n";
  fs.mkdirSync(path.dirname(path.join(context.root, relative)), { recursive: true });
  fs.writeFileSync(path.join(context.root, relative), content);
  const action = {
    id: "A-003",
    type: "COPY",
    path: relative,
    source: relative,
    hashBefore: sha(content),
    expectedHashAfter: sha("export const projectOwned = false;\n"),
    willWrite: true,
  };
  const plan = { ...context.plan, actions: [...context.plan.actions, action] };
  assert.equal(isRequestBoundLocalActionAllowed(action, plan), false);
});

test("request-bound authority consumes exact independently verified bootstrap ownership", (t) => {
  const context = authorityContext(t);
  const relative = "scripts/check-release-execution-topology.mjs";
  const content = "export const bootstrapManaged = true;\n";
  const evidence = installBootstrapOwnership(context.root, relative, content);
  const ownership = verifiedBootstrapManagedOwnership(context.root, relative, evidence.currentHash);
  assert.deepEqual(ownership, {
    state: "VERIFIED_PRIOR_INTENTOS_MANAGED",
    evidence_ref: ".intentos/bootstrap-receipt.json#actions:A-764",
    managed_digest: evidence.currentHash,
  });
  const action = {
    id: "A-003",
    type: "UPDATE_MANAGED",
    path: relative,
    source: relative,
    hashBefore: evidence.currentHash,
    ownership,
    sourceHash: sha("updated source"),
    expectedHashAfter: sha("updated source"),
    willWrite: true,
  };
  const plan = { ...context.plan, actions: [...context.plan.actions, action] };
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), []);

  const missing = { ...action, ownership: undefined };
  assert.equal(isRequestBoundLocalActionAllowed(missing, { ...plan, actions: [...context.plan.actions, missing] }), false);
  const forged = { ...action, ownership: { ...ownership, evidence_ref: ".intentos/bootstrap-receipt.json#actions:A-999" } };
  assert.equal(isRequestBoundLocalActionAllowed(forged, { ...plan, actions: [...context.plan.actions, forged] }), false);

  fs.appendFileSync(path.join(context.root, relative), "// local edit\n");
  assert.equal(isRequestBoundLocalActionAllowed(action, plan), false);
});

test("request-bound bootstrap ownership consumer rejects duplicate receipt actions and plan drift", (t) => {
  const context = authorityContext(t);
  const relative = "scripts/check-release-execution-topology.mjs";
  const content = "export const bootstrapManaged = true;\n";
  const evidence = installBootstrapOwnership(context.root, relative, content);
  const ownership = verifiedBootstrapManagedOwnership(context.root, relative, evidence.currentHash);
  const action = {
    id: "A-003",
    type: "UPDATE_MANAGED",
    path: relative,
    source: relative,
    hashBefore: evidence.currentHash,
    ownership,
    expectedHashAfter: sha("updated source"),
    willWrite: true,
  };
  const receiptFile = path.join(context.root, ".intentos/bootstrap-receipt.json");
  const duplicate = structuredClone(evidence.receipt);
  duplicate.actions.push({ ...duplicate.actions[0] });
  const { receipt_digest: _digest, receipt_ref: _ref, ...duplicateBase } = duplicate;
  duplicate.receipt_digest = evidenceDigest(duplicateBase, []);
  fs.writeFileSync(receiptFile, `${JSON.stringify(duplicate, null, 2)}\n`);
  assert.equal(isRequestBoundLocalActionAllowed(action, { ...context.plan, actions: [...context.plan.actions, action] }), false);

  fs.writeFileSync(receiptFile, `${JSON.stringify(evidence.receipt, null, 2)}\n`);
  const planFile = path.join(context.root, ".intentos/bootstrap-plan.json");
  const drifted = structuredClone(evidence.bootstrapPlan);
  drifted.actions[0].expectedHashAfter = sha("drifted");
  drifted.planDigest = evidenceDigest(drifted, ["planDigest"]);
  fs.writeFileSync(planFile, `${JSON.stringify(drifted, null, 2)}\n`);
  assert.equal(isRequestBoundLocalActionAllowed(action, { ...context.plan, actions: [...context.plan.actions, action] }), false);
});
