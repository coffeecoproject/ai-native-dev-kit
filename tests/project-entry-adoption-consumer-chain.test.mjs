import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { evidenceDigest, validateSchema } from "../scripts/lib/artifact-schema.mjs";
import { verifyProjectLocalBehavioralRoute } from "../scripts/lib/behavioral-adoption-activation.mjs";
import { evaluateWriteOverlap } from "../scripts/lib/current-work-continuity.mjs";
import { collectProjectFactProjection } from "../scripts/lib/project-fact-projection.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";
import {
  consumeAuthoritativeEvidence,
  consumeSameRunEvidenceEnvelope,
  createSameRunEvidenceEnvelope,
  sameRunBindingFromTrust,
  validateSameRunEvidenceEnvelope,
} from "../scripts/lib/same-run-evidence-envelope.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envelopeSchema = JSON.parse(fs.readFileSync(
  path.join(kitRoot, "schemas", "artifacts", "same-run-evidence-envelope.schema.json"),
  "utf8",
));
const payloadSchema = {
  type: "object",
  additionalProperties: false,
  required: ["report_type", "verified"],
  properties: {
    report_type: { const: "STRICT_FIXTURE" },
    verified: { const: true },
  },
};

function fixture(prefix = "intentos-entry-consumer-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function run(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, ...(options.env || {}) },
  });
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return String(result.stdout || "").trim();
}

function initializeGitProject(root) {
  git(root, ["init", "-q"]);
  git(root, ["add", "."]);
  git(root, ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "fixture"]);
}

function digest(label) {
  return evidenceDigest({ label }, []);
}

function binding(root = "/fixture/project-a", revision = "revision-a") {
  return {
    projectBinding: {
      canonical_root: root,
      topology_digest: digest(`topology:${root}`),
      identity_kind: "GIT",
      identity_fingerprint: digest(`identity:${root}`),
    },
    taskRef: "TASK-109",
    intentDigest: digest("intent"),
    goalDigest: digest("goal"),
    projectFactDigest: digest("facts"),
    guidanceDigest: digest("guidance"),
    authorityInventoryDigest: digest("authority"),
    sourceRevision: revision,
  };
}

function envelope(options = {}) {
  const expected = { ...binding(), ...(options.binding || {}) };
  return createSameRunEvidenceEnvelope({
    envelopeId: options.envelopeId || "same-run:native-migration",
    runId: options.runId || "run-109",
    sequence: options.sequence || 1,
    evidenceType: options.evidenceType || "native_migration",
    producer: options.producer || "scripts/resolve-native-migration.mjs",
    producerSchemaVersion: "1.109.0",
    payload: options.payload || { report_type: "STRICT_FIXTURE", verified: true },
    sources: options.sources || [],
    checkerResult: options.checkerResult || "PASS",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    ...expected,
  });
}

function recanonicalize(value) {
  const copy = structuredClone(value);
  copy.payload_digest = evidenceDigest(copy.payload, []);
  const { envelope_digest: _ignored, ...base } = copy;
  copy.envelope_digest = evidenceDigest(base, []);
  return copy;
}

function strictEnvelopeValidation(value, expected) {
  const shape = validateSchema(value, envelopeSchema, { label: "same-run envelope" });
  const semantic = validateSameRunEvidenceEnvelope(value, { ...expected, payloadSchema });
  return { ok: shape.ok && semantic.ok, errors: [...shape.errors, ...semantic.errors] };
}

test("1.109 same-run evidence is consumable only for the exact project, task, facts, guidance, authority, and revision", () => {
  const expected = binding();
  const valid = envelope();
  assert.equal(strictEnvelopeValidation(valid, { ...expected, sequence: 1, runId: "run-109", evidenceType: "native_migration", producer: "scripts/resolve-native-migration.mjs" }).ok, true);
  assert.deepEqual(
    consumeSameRunEvidenceEnvelope(valid, {
      ...expected,
      sequence: 1,
      runId: "run-109",
      evidenceType: "native_migration",
      producer: "scripts/resolve-native-migration.mjs",
      payloadSchema,
    }),
    { report_type: "STRICT_FIXTURE", verified: true },
  );

  const missingFact = structuredClone(valid);
  delete missingFact.project_fact_digest;
  assert.equal(strictEnvelopeValidation(recanonicalize(missingFact), expected).ok, false);

  const outOfOrder = recanonicalize({ ...valid, sequence: 2 });
  assert.throws(() => consumeSameRunEvidenceEnvelope(outOfOrder, { ...expected, sequence: 1 }), /sequence does not match/);

  const crossProject = recanonicalize({
    ...valid,
    project_binding: binding("/fixture/project-b").projectBinding,
  });
  assert.throws(() => consumeSameRunEvidenceEnvelope(crossProject, expected), /project_binding does not match/);

  const crossRevision = recanonicalize({ ...valid, source_revision: "revision-b" });
  assert.throws(() => consumeSameRunEvidenceEnvelope(crossRevision, expected), /source_revision does not match/);

  const forgedPass = recanonicalize({
    ...valid,
    checker_result: "PASS",
    payload: { report_type: "STRICT_FIXTURE", verified: false },
  });
  assert.throws(
    () => consumeSameRunEvidenceEnvelope(forgedPass, { ...expected, payloadSchema }),
    /same-run payload/,
  );
});

test("1.109 same-run producer binding always carries one deterministic task identity", () => {
  const root = fixture("intentos-same-run-task-");
  write(root, "README.md", "# Existing project\n");
  const trust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: "Adopt this existing project under IntentOS",
  });
  const first = sameRunBindingFromTrust(trust);
  const second = sameRunBindingFromTrust(trust);
  assert.match(first.taskRef, /^task:[a-f0-9]{64}$/);
  assert.notEqual(first.taskRef, "N/A");
  assert.equal(first.taskRef, second.taskRef);
});

test("1.109 missing or duplicate authority inputs and duplicate source rows fail closed", () => {
  const valid = envelope();
  assert.throws(() => consumeAuthoritativeEvidence({}, {}), /exactly one/);
  assert.throws(() => consumeAuthoritativeEvidence({ sameRunEnvelope: valid, persistedEvidence: {} }, {}), /exactly one/);
  assert.throws(
    () => consumeAuthoritativeEvidence({ persistedEvidence: {} }, { validatePersisted: () => ({ ok: false, errors: ["wrong current project"] }) }),
    /wrong current project/,
  );

  const source = {
    ref: valid.envelope_id,
    digest: valid.envelope_digest,
    checker: "check-native-migration.mjs",
    result: "PASS",
  };
  const duplicate = envelope({
    envelopeId: "same-run:reconciliation",
    evidenceType: "existing_rule_reconciliation",
    producer: "scripts/resolve-existing-rule-reconciliation.mjs",
    sequence: 2,
    sources: [source, source],
  });
  const validation = validateSchema(duplicate, envelopeSchema, { label: "duplicate envelope" });
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((item) => /unique/i.test(item)), validation.errors.join("\n"));
});

test("1.109 persisted Native Migration authority is rejected after a project or revision change", () => {
  const goal = "Adopt IntentOS while preserving current project governance";
  const projectA = fixture("intentos-persisted-a-");
  write(projectA, "AGENTS.md", [
    "# Project Rules",
    "",
    "- Preserve production data and release rollback controls.",
    "",
  ].join("\n"));
  write(projectA, "src/current.js", "export const current = true;\n");
  write(projectA, ".gitignore", "native-migration-plans/\n");
  // Reserve the durable evidence path before producing the binding. This keeps
  // target topology stable while the evidence content itself remains excluded
  // from the project revision authority calculation.
  write(projectA, "native-migration-plans/current.md", "# Pending Native Migration Evidence\n");
  initializeGitProject(projectA);

  const native = run("scripts/resolve-native-migration.mjs", [projectA, "--intent", goal, "--json"]);
  assert.equal(native.status, 0, `${native.stdout}\n${native.stderr}`);
  const nativeEvidence = JSON.parse(native.stdout).structuredEvidence;
  assert.ok(nativeEvidence.rule_classifications.length > 0);
  write(projectA, "native-migration-plans/current.md", [
    "# Native Migration",
    "",
    "```json",
    JSON.stringify(nativeEvidence, null, 2),
    "```",
    "",
  ].join("\n"));

  const current = run("scripts/resolve-existing-rule-reconciliation.mjs", [projectA, "--intent", goal, "--json"]);
  assert.equal(current.status, 0, `${current.stdout}\n${current.stderr}`);
  const currentEvidence = JSON.parse(current.stdout).structuredEvidence;
  assert.ok(currentEvidence.rule_reconciliation_coverage.total_extracted_rules > 0);
  assert.ok(currentEvidence.existing_rule_source.some((item) => item.rule_ref.startsWith("native-migration:")));

  write(projectA, "src/current.js", "export const current = 'changed-after-report';\n");
  const stale = run("scripts/resolve-existing-rule-reconciliation.mjs", [projectA, "--intent", goal, "--json"]);
  assert.equal(stale.status, 1, `${stale.stdout}\n${stale.stderr}`);
  const staleReport = JSON.parse(stale.stdout);
  assert.equal(staleReport.outcome, "BLOCKED");
  assert.equal(staleReport.structuredEvidence.native_adoption_decision.recommendation, "BLOCKED_NEEDS_OWNER");
  assert.match(staleReport.structuredEvidence.native_adoption_decision.default_path, /regenerate Native Migration evidence/i);
  assert.equal(staleReport.structuredEvidence.can_recommend_apply_plan_now, "No");

  const projectB = fixture("intentos-persisted-b-");
  write(projectB, "AGENTS.md", fs.readFileSync(path.join(projectA, "AGENTS.md"), "utf8"));
  write(projectB, "src/current.js", "export const current = true;\n");
  write(projectB, "native-migration-plans/current.md", fs.readFileSync(path.join(projectA, "native-migration-plans/current.md"), "utf8"));
  initializeGitProject(projectB);
  const copied = run("scripts/resolve-existing-rule-reconciliation.mjs", [projectB, "--intent", goal, "--json"]);
  assert.equal(copied.status, 1, `${copied.stdout}\n${copied.stderr}`);
  const copiedReport = JSON.parse(copied.stdout);
  assert.equal(copiedReport.outcome, "BLOCKED");
  assert.equal(copiedReport.structuredEvidence.native_adoption_decision.recommendation, "BLOCKED_NEEDS_OWNER");
  assert.match(copiedReport.structuredEvidence.native_adoption_decision.default_path, /regenerate Native Migration evidence/i);
  assert.equal(copiedReport.structuredEvidence.can_recommend_apply_plan_now, "No");
});

test("1.109 adoption autopilot consumes one strict same-run chain for a light existing project", () => {
  const root = fixture("intentos-adoption-autopilot-");
  write(root, "package.json", `${JSON.stringify({ name: "light-existing-project", private: true }, null, 2)}\n`);
  write(root, "src/index.js", "export const ready = true;\n");
  write(root, "work-queue/current.md", [
    "# Work Queue",
    "",
    "| Task ID | Title | State | Evidence | Resume Review | Notes |",
    "|---|---|---|---|---|---|",
    "| TASK-109 | Continue current feature | CURRENT | existing project | N/A | preserve current work |",
    "",
  ].join("\n"));

  const result = run("scripts/resolve-existing-project-adoption-autopilot.mjs", [
    root,
    "--intent",
    "Continue this project under IntentOS",
    "--json",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  const native = report.sourceChain.find((item) => item.name === "native_migration");
  assert.equal(native?.status, "RECORDED", JSON.stringify(report.sourceChain, null, 2));
  assert.ok(report.sourceChain.some((item) => item.name === "adoption_assurance"));
  assert.equal(report.humanDecisions.every((item) => item.required_now === "No"), true);
  assert.equal(report.boundary.writes_target_files, "No");
  assert.equal(report.boundary.approves_release_or_production, "No");
});

test("1.109 controlled adoption review keeps technical sequencing inside Codex", () => {
  const root = fixture("intentos-adoption-solo-contract-");
  write(root, "README.md", "# Existing project\n");

  const result = run("scripts/resolve-controlled-native-adoption-review.mjs", [
    root,
    "--intent",
    "Continue this project under IntentOS",
    "--json",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  const blockedAction = report.structuredEvidence.blocked_actions.find((item) => item.id === "CNAR-B002");
  assert.ok(blockedAction);
  assert.match(blockedAction.reason, /bounded plan.*project evidence.*real-world consent/i);
  assert.doesNotMatch(blockedAction.reason, /owners?\s+and\s+approval/i);
  assert.equal(report.structuredEvidence.human_decisions.every((item) => item.required_now === "No"), true);
  assert.equal(report.boundaries.native_apply_allowed, "No");
  assert.equal(report.boundaries.approves_release_or_production, "No");
});

test("1.109 authority inventory accounts for deep and paged governance sources without silent truncation", () => {
  const root = fixture("intentos-authority-inventory-");
  for (let index = 0; index < 525; index += 1) {
    write(root, `governance/policies/policy-${String(index).padStart(3, "0")}.md`, `# Governance ${index}\n\nRule ${index} must remain accounted.\n`);
  }
  const deepRef = "packages/area/a/b/c/d/e/f/g/h/i/j/k/l/AGENTS.md";
  write(root, deepRef, "# Nested Agent Authority\n\nUse project-native verification.\n");

  const first = collectProjectFactProjection(root, { goal: "Review existing governance" });
  const second = collectProjectFactProjection(root, { goal: "Review existing governance" });
  const inventory = first.authority_inventory;
  assert.equal(inventory.complete, "Yes");
  assert.equal(inventory.total_sources, 526);
  assert.equal(inventory.accounted_sources, 526);
  assert.equal(inventory.pages.length, 3);
  assert.equal(inventory.pages.flatMap((item) => item.source_refs).length, 526);
  assert.ok(inventory.sources.some((item) => item.source_ref === deepRef));
  assert.equal(inventory.inventory_digest, second.authority_inventory.inventory_digest);
});

test("1.109 read-only adoption keeps the current task and owned dirty work visible", () => {
  const root = fixture("intentos-current-work-");
  write(root, "AGENTS.md", "# Project Authority\n\nPreserve the current task.\n");
  write(root, "src/current.js", "export const value = 1;\n");
  write(root, "work-queue/current.md", [
    "# Current Work",
    "",
    "State: CURRENT",
    "",
    "Continue the existing feature without resetting its history.",
    "",
  ].join("\n"));
  initializeGitProject(root);
  write(root, "src/current.js", "export const value = 2;\n");

  const trust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: "Read-only review of IntentOS adoption for the current task",
  });
  const continuity = trust.project_fact_projection.current_work_continuity;
  assert.equal(continuity.state, "CURRENT_MAPPED");
  assert.deepEqual(continuity.current_task_refs, ["work-queue/current.md"]);
  assert.ok(continuity.git.changed_paths.includes("src/current.js"));
  assert.equal(trust.goal_projection.execution_intent, "READ_ONLY");
  assert.notEqual(trust.entry_state, "BLOCKED_REPAIR_REQUIRED");
  assert.equal(trust.boundaries.writes_target_files, "No");
});

test("1.109 current-work discovery covers root TODO, sessions, plans, and conflicting current items", () => {
  const root = fixture("intentos-current-work-sources-");
  write(root, "TODO.md", [
    "# Todo",
    "",
    "State: CURRENT",
    "",
    "Continue the current product task.",
    "",
  ].join("\n"));
  write(root, "docs/sessions/paused.md", "# Session\n\nState: PAUSED\n");
  write(root, "implementation-plans/queued.md", "# Plan\n\nStatus: QUEUED\n");

  const mapped = collectProjectFactProjection(root, { goal: "Continue current work" }).current_work_continuity;
  assert.equal(mapped.state, "CURRENT_MAPPED");
  assert.deepEqual(mapped.current_task_refs, ["TODO.md"]);
  assert.ok(mapped.queue_candidates.some((item) => item.ref === "docs/sessions/paused.md" && item.state === "PAUSED"));
  assert.ok(mapped.queue_candidates.some((item) => item.ref === "implementation-plans/queued.md" && item.state === "QUEUED"));

  write(root, "tasks/second.md", "# Second task\n\nState: CURRENT\n");
  const conflicted = collectProjectFactProjection(root, { goal: "Continue current work" }).current_work_continuity;
  assert.equal(conflicted.state, "CURRENT_CONFLICTED");
  assert.deepEqual(conflicted.current_task_refs, ["TODO.md", "tasks/second.md"]);
});

test("1.109 dirty work blocks only writes that overlap the observed changed paths", () => {
  const continuity = {
    git: { changed_paths: ["src/current.js", "docs/current-task.md"] },
  };
  assert.deepEqual(evaluateWriteOverlap(continuity, [".intentos/version.json"]), {
    state: "NO_OVERLAP",
    overlapping_paths: [],
    target_paths: [".intentos/version.json"],
  });
  assert.deepEqual(evaluateWriteOverlap(continuity, ["src"]), {
    state: "OVERLAP_BLOCKED",
    overlapping_paths: ["src/current.js"],
    target_paths: ["src"],
  });
});

test("1.109 read-only behavioral assessment never executes target-project resolver scripts", () => {
  const root = fixture("intentos-readonly-target-script-");
  const marker = path.join(root, "target-script-executed.txt");
  write(root, "scripts/workflow-next.mjs", [
    "import fs from 'node:fs';",
    `fs.writeFileSync(${JSON.stringify(marker)}, 'unsafe execution\\n');`,
    "process.stdout.write('{}\\n');",
    "",
  ].join("\n"));
  write(root, "README.md", "# Existing project\n");

  const result = verifyProjectLocalBehavioralRoute({
    targetRoot: root,
    sourceRoot: kitRoot,
    goal: "Assess this existing project under IntentOS",
  });

  assert.equal(fs.existsSync(marker), false, JSON.stringify(result, null, 2));
  assert.notEqual(result.state, "VERIFIED_ACTIVE");
});
