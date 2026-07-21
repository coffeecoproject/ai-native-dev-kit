import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  consumeRequestBoundApplyAuthority,
  createRequestBoundApplyAuthority,
  createRequestBoundReadiness,
  isRequestBoundLocalActionAllowed,
  requestBoundAuthorityConsumptionState,
  validateCurrentRequestForPlan,
  validateRequestBoundApplyAuthority,
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
        inlineContentBase64: Buffer.from(`${legacyAgent.trimEnd()}\n\n## IntentOS\n\n## Zero-Experience Solo Developer\n`).toString("base64"),
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
