import crypto from "node:crypto";
import fs from "node:fs";
import zlib from "node:zlib";
import { evidenceDigest, validateSchema } from "./artifact-schema.mjs";

let cachedStdinEnvelopeBundle;

export function createSameRunEvidenceEnvelope(options = {}) {
  const createdAt = options.createdAt || new Date().toISOString();
  const payload = options.payload ?? null;
  const sources = normalizeSources(options.sources || []);
  const base = {
    schema_version: "1.109.0",
    artifact_type: "same_run_evidence_envelope",
    envelope_id: String(options.envelopeId || `same-run:${crypto.randomUUID()}`),
    run_id: String(options.runId || crypto.randomUUID()),
    sequence: Number(options.sequence || 1),
    created_at: createdAt,
    expires_at: options.expiresAt || new Date(Date.parse(createdAt) + 30 * 60 * 1000).toISOString(),
    evidence_type: String(options.evidenceType || "unknown"),
    producer: String(options.producer || "unknown"),
    producer_schema_version: String(options.producerSchemaVersion || "unknown"),
    project_binding: options.projectBinding || {},
    task_ref: String(options.taskRef || "N/A"),
    intent_digest: String(options.intentDigest || "N/A"),
    goal_digest: String(options.goalDigest || "N/A"),
    project_fact_digest: String(options.projectFactDigest || "N/A"),
    guidance_digest: String(options.guidanceDigest || "N/A"),
    authority_inventory_digest: String(options.authorityInventoryDigest || "N/A"),
    source_revision: String(options.sourceRevision || "N/A"),
    sources,
    payload,
    payload_digest: evidenceDigest(payload, []),
    checker_result: String(options.checkerResult || "PASS"),
    invalidation_conditions: [...new Set(options.invalidationConditions || [
      "PROJECT_BINDING_CHANGED",
      "SOURCE_REVISION_CHANGED",
      "GOAL_OR_TASK_CHANGED",
      "GUIDANCE_CHANGED",
      "PROJECT_FACTS_CHANGED",
      "ENVELOPE_EXPIRED",
    ])].sort(),
    persistence_status: "EPHEMERAL",
    durable_authority: "No",
    authorizes_apply: "No",
    authorizes_activation: "No",
  };
  return { ...base, envelope_digest: evidenceDigest(base, []) };
}

export function validateSameRunEvidenceEnvelope(envelope, options = {}) {
  const errors = [];
  if (!envelope || envelope.artifact_type !== "same_run_evidence_envelope") errors.push("same-run envelope artifact type is invalid");
  const { envelope_digest: _digest, ...base } = envelope || {};
  if (envelope?.envelope_digest !== evidenceDigest(base, [])) errors.push("same-run envelope digest is not canonical");
  if (envelope?.payload_digest !== evidenceDigest(envelope?.payload, [])) errors.push("same-run payload digest is not canonical");
  if (envelope?.persistence_status !== "EPHEMERAL" || envelope?.durable_authority !== "No") errors.push("same-run evidence cannot become durable authority");
  if (envelope?.authorizes_apply !== "No" || envelope?.authorizes_activation !== "No") errors.push("same-run evidence cannot authorize apply or activation");
  if (!Number.isInteger(envelope?.sequence) || envelope.sequence < 1) errors.push("same-run sequence must be a positive integer");
  if (!envelope?.run_id || !envelope?.envelope_id) errors.push("same-run envelope requires run and envelope identity");
  if (!Array.isArray(envelope?.sources) || envelope.sources.some((item) => !validSource(item))) errors.push("same-run sources must use exact ref/digest/checker/result rows");
  if (envelope?.checker_result !== "PASS") errors.push("same-run producer checker did not pass");
  if (!Number.isFinite(Date.parse(envelope?.expires_at || "")) || Date.parse(envelope.expires_at) <= Date.now()) errors.push("same-run envelope is expired or has invalid expiry");
  compare("evidence_type", envelope?.evidence_type, options.evidenceType, errors);
  compare("producer", envelope?.producer, options.producer, errors);
  compare("run_id", envelope?.run_id, options.runId, errors);
  compare("sequence", envelope?.sequence, options.sequence, errors);
  compareJson("project_binding", envelope?.project_binding, options.projectBinding, errors);
  compare("task_ref", envelope?.task_ref, options.taskRef, errors);
  compare("intent_digest", envelope?.intent_digest, options.intentDigest, errors);
  compare("goal_digest", envelope?.goal_digest, options.goalDigest, errors);
  compare("project_fact_digest", envelope?.project_fact_digest, options.projectFactDigest, errors);
  compare("guidance_digest", envelope?.guidance_digest, options.guidanceDigest, errors);
  compare("authority_inventory_digest", envelope?.authority_inventory_digest, options.authorityInventoryDigest, errors);
  compare("source_revision", envelope?.source_revision, options.sourceRevision, errors);
  if (options.payloadSchema) {
    const validation = validateSchema(envelope?.payload, options.payloadSchema, { label: "same-run payload" });
    if (!validation.ok) errors.push(...validation.errors);
  }
  return { ok: errors.length === 0, errors, payload: errors.length === 0 ? envelope.payload : null };
}

export function consumeSameRunEvidenceEnvelope(envelope, options = {}) {
  const validation = validateSameRunEvidenceEnvelope(envelope, options);
  if (!validation.ok) throw new Error(validation.errors.join("; "));
  return validation.payload;
}

export function consumeAuthoritativeEvidence(input = {}, options = {}) {
  const choices = [input.sameRunEnvelope !== undefined, input.persistedEvidence !== undefined].filter(Boolean).length;
  if (choices !== 1) throw new Error("consumer requires exactly one same-run envelope or persisted Evidence Authority source");
  if (input.sameRunEnvelope !== undefined) return consumeSameRunEvidenceEnvelope(input.sameRunEnvelope, options);
  if (typeof options.validatePersisted !== "function") throw new Error("persisted evidence requires a strict Evidence Authority validator");
  const validation = options.validatePersisted(input.persistedEvidence);
  if (!validation?.ok) throw new Error((validation?.errors || ["persisted evidence validation failed"]).join("; "));
  return validation.payload ?? input.persistedEvidence;
}

export function sameRunEnvironmentKey(evidenceType) {
  return `INTENTOS_SAME_RUN_${String(evidenceType || "unknown")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase()}_ENVELOPE`;
}

export function readSameRunEnvelopeFromEnvironment(evidenceType, env = process.env) {
  const key = sameRunEnvironmentKey(evidenceType);
  const raw = env[key];
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(`${key} is not valid JSON: ${error.message}`);
    }
  }
  if (env.INTENTOS_SAME_RUN_STDIN !== "1") return null;
  if (cachedStdinEnvelopeBundle === undefined) {
    try {
      const content = process.stdin.isTTY ? "" : fs.readFileSync(0, "utf8");
      cachedStdinEnvelopeBundle = content ? decodeSameRunEnvelopeBundle(content) : {};
    } catch (error) {
      throw new Error(`INTENTOS_SAME_RUN_STDIN is not valid JSON: ${error.message}`);
    }
  }
  return cachedStdinEnvelopeBundle?.envelopes?.[evidenceType] || null;
}

export function encodeSameRunEnvelopeBundle(envelopes = []) {
  const plain = JSON.stringify({
    envelopes: Object.fromEntries(envelopes.map((envelope) => [envelope.evidence_type, envelope])),
  });
  return JSON.stringify({
    encoding: "gzip-base64",
    data: zlib.gzipSync(plain).toString("base64"),
  });
}

function decodeSameRunEnvelopeBundle(content) {
  const parsed = JSON.parse(content);
  if (parsed?.encoding !== "gzip-base64") return parsed;
  if (typeof parsed.data !== "string" || !parsed.data) throw new Error("compressed same-run envelope bundle has no data");
  return JSON.parse(zlib.gunzipSync(Buffer.from(parsed.data, "base64")).toString("utf8"));
}

export function projectBindingFromTrust(trust = {}) {
  const facts = trust.project_fact_projection || {};
  const identity = trust.project_identity || facts.project_identity || {};
  return {
    canonical_root: String(trust.target_topology?.canonical_target || identity.canonical_root || ""),
    topology_digest: String(trust.target_topology?.topology_digest || "N/A"),
    identity_kind: String(identity.kind || identity.form || "UNKNOWN"),
    identity_fingerprint: String(identity.fingerprint || identity.repository_identity?.fingerprint || "N/A"),
  };
}

export function sameRunBindingFromTrust(trust = {}) {
  const facts = trust.project_fact_projection || {};
  const goalDigest = trust.goal_projection?.goal_digest || facts.goal_projection?.goal_digest || "N/A";
  return {
    projectBinding: projectBindingFromTrust(trust),
    taskRef: /^sha256:[a-f0-9]{64}$/.test(String(goalDigest)) ? `task:${goalDigest.slice("sha256:".length)}` : "N/A",
    goalDigest,
    projectFactDigest: facts.projection_digest || "N/A",
    guidanceDigest: trust.guidance_authority?.guidance_digest || "N/A",
    authorityInventoryDigest: facts.authority_inventory?.inventory_digest || "N/A",
    sourceRevision: String(facts.project_identity?.revision || facts.project_identity?.fingerprint || trust.target_topology?.topology_digest || "N/A"),
  };
}

export function sourceRowFromEnvelope(envelope, checker = "validateSameRunEvidenceEnvelope") {
  const validation = validateSameRunEvidenceEnvelope(envelope);
  if (!validation.ok) throw new Error(validation.errors.join("; "));
  return {
    ref: envelope.envelope_id,
    digest: envelope.envelope_digest,
    checker,
    result: "PASS",
  };
}

function normalizeSources(sources) {
  return sources.map((item) => ({
    ref: String(item.ref || ""),
    digest: String(item.digest || ""),
    checker: String(item.checker || ""),
    result: String(item.result || ""),
  })).sort((left, right) => `${left.ref}:${left.checker}`.localeCompare(`${right.ref}:${right.checker}`));
}

function validSource(item) {
  return Boolean(item && item.ref && /^sha256:[a-f0-9]{64}$/.test(item.digest) && item.checker && item.result === "PASS");
}

function compare(field, actual, expected, errors) {
  if (expected !== undefined && actual !== expected) errors.push(`${field} does not match the current consumer`);
}

function compareJson(field, actual, expected, errors) {
  if (expected !== undefined && JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`${field} does not match the current consumer`);
}
