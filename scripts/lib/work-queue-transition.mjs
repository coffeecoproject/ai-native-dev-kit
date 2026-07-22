import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateSchema,
} from "./artifact-schema.mjs";

const TRANSITION_DIR = "work-queue-transitions";
const SCHEMA_PATH = "schemas/artifacts/work-queue-state-transition.schema.json";

export function sourceItemDigest(projectRoot, sourceRef) {
  const normalized = normalizeSourceRef(sourceRef);
  const [relativePath] = normalized.split("#");
  if (!relativePath || !normalized.includes("#") || !relativePath.startsWith("work-queue/")) {
    return { ok: false, error: "source item ref must be work-queue/<file>.md#<task-id>" };
  }
  const file = path.resolve(projectRoot, relativePath);
  if (!inside(projectRoot, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return { ok: false, error: `source item does not resolve: ${normalized}` };
  }
  const content = fs.readFileSync(file, "utf8");
  return {
    ok: true,
    ref: normalized,
    relativePath,
    file,
    digest: sha256(`${normalized}\n${content}`),
  };
}

export function loadWorkQueueTransitions(projectRoot) {
  const directory = path.join(projectRoot, TRANSITION_DIR);
  if (!fs.existsSync(directory)) return { transitions: [], errors: [] };
  const schema = loadSchema(projectRoot, SCHEMA_PATH);
  if (!schema) return { transitions: [], errors: [`trusted schema is unavailable: ${SCHEMA_PATH}`] };
  const transitions = [];
  const errors = [];
  for (const name of fs.readdirSync(directory).filter((entry) => entry.endsWith(".md")).sort()) {
    const file = path.join(directory, name);
    const relativePath = `${TRANSITION_DIR}/${name}`;
    const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
    if (!extracted?.ok) {
      errors.push(`${relativePath}: missing or invalid Machine-Readable Evidence`);
      continue;
    }
    const evidence = extracted.value;
    const validation = validateSchema(evidence, schema, { label: relativePath });
    if (!validation.ok) {
      errors.push(...validation.errors.map((error) => `${relativePath}: ${error}`));
      continue;
    }
    if (evidence.transition_ref !== relativePath) {
      errors.push(`${relativePath}: transition_ref must point to this report`);
      continue;
    }
    if (evidence.transition_digest !== evidenceDigest(evidence, ["transition_digest"])) {
      errors.push(`${relativePath}: transition_digest is invalid`);
      continue;
    }
    const predecessor = sourceItemDigest(projectRoot, evidence.predecessor.source_ref);
    const successor = sourceItemDigest(projectRoot, evidence.successor.source_ref);
    if (!predecessor.ok) errors.push(`${relativePath}: predecessor ${predecessor.error}`);
    if (!successor.ok) errors.push(`${relativePath}: successor ${successor.error}`);
    if (!predecessor.ok || !successor.ok) continue;
    if (predecessor.digest !== evidence.predecessor.source_digest) {
      errors.push(`${relativePath}: predecessor source digest is stale`);
      continue;
    }
    if (successor.digest !== evidence.successor.source_digest) {
      errors.push(`${relativePath}: successor source digest is stale`);
      continue;
    }
    transitions.push({ file, relativePath, evidence });
  }
  errors.push(...validateTransitionGraph(transitions));
  return { transitions: errors.length === 0 ? transitions : [], errors };
}

export function applyWorkQueueTransitions(items, loaded) {
  const errors = [...(loaded?.errors || [])];
  if (errors.length > 0) return { items, errors, applied: [] };
  const next = items.map((item) => ({ ...item }));
  const byRef = new Map();
  for (const item of next) {
    const ref = `${item.source}#${item.taskId}`;
    if (!byRef.has(ref)) byRef.set(ref, []);
    byRef.get(ref).push(item);
  }
  const applied = [];
  for (const record of [...(loaded?.transitions || [])].sort(compareTransitions)) {
    const transition = record.evidence;
    const predecessor = byRef.get(normalizeSourceRef(transition.predecessor.source_ref)) || [];
    const successor = byRef.get(normalizeSourceRef(transition.successor.source_ref)) || [];
    if (predecessor.length !== 1) {
      errors.push(`${record.relativePath}: predecessor must resolve to one canonical Work Queue item`);
      continue;
    }
    if (successor.length !== 1) {
      errors.push(`${record.relativePath}: successor must resolve to one canonical Work Queue item`);
      continue;
    }
    if (predecessor[0].intentDigest !== transition.predecessor.intent_digest) {
      errors.push(`${record.relativePath}: predecessor intent digest does not match the Work Queue item`);
      continue;
    }
    if (successor[0].intentDigest !== transition.successor.intent_digest) {
      errors.push(`${record.relativePath}: successor intent digest does not match the Work Queue item`);
      continue;
    }
    predecessor[0].state = "DONE";
    predecessor[0].transitionRef = record.relativePath;
    successor[0].state = "CURRENT";
    successor[0].transitionRef = record.relativePath;
    applied.push(record.relativePath);
  }
  return { items: errors.length === 0 ? next : items, errors, applied };
}

export function effectiveSourceStates(loaded) {
  const states = new Map();
  if ((loaded?.errors || []).length > 0) return { states, errors: loaded.errors };
  for (const record of [...(loaded?.transitions || [])].sort(compareTransitions)) {
    states.set(normalizeSourceRef(record.evidence.predecessor.source_ref), "DONE");
    states.set(normalizeSourceRef(record.evidence.successor.source_ref), "CURRENT");
  }
  return { states, errors: [] };
}

function validateTransitionGraph(records) {
  const errors = [];
  const sequences = new Set();
  const predecessors = new Set();
  const successors = new Set();
  for (const record of records) {
    const evidence = record.evidence;
    const predecessor = normalizeSourceRef(evidence.predecessor.source_ref);
    const successor = normalizeSourceRef(evidence.successor.source_ref);
    if (!Number.isInteger(evidence.sequence) || evidence.sequence < 1) {
      errors.push(`${record.relativePath}: sequence must be a positive integer`);
    }
    if (predecessor === successor) errors.push(`${record.relativePath}: predecessor and successor must differ`);
    if (sequences.has(evidence.sequence)) errors.push(`${record.relativePath}: sequence must be unique`);
    if (predecessors.has(predecessor)) errors.push(`${record.relativePath}: predecessor already has a terminal transition`);
    if (successors.has(successor)) errors.push(`${record.relativePath}: successor is introduced by more than one transition`);
    sequences.add(evidence.sequence);
    predecessors.add(predecessor);
    successors.add(successor);
  }
  const ordered = [...records].sort(compareTransitions);
  for (let index = 1; index < ordered.length; index += 1) {
    const previousSuccessor = normalizeSourceRef(ordered[index - 1].evidence.successor.source_ref);
    const currentPredecessor = normalizeSourceRef(ordered[index].evidence.predecessor.source_ref);
    if (previousSuccessor !== currentPredecessor) {
      errors.push(`${ordered[index].relativePath}: transition chain must continue from the prior successor`);
    }
  }
  return errors;
}

function compareTransitions(left, right) {
  return left.evidence.sequence - right.evidence.sequence
    || left.relativePath.localeCompare(right.relativePath);
}

function normalizeSourceRef(value) {
  return String(value || "").trim().replace(/^(?:artifact|file):/i, "").replaceAll("\\", "/");
}

function inside(root, candidate) {
  const relative = path.relative(path.resolve(root), candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}
