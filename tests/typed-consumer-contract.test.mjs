import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { extractMachineReadableEvidence } from "../scripts/lib/artifact-schema.mjs";
import { requireAcceptedOutcome } from "../scripts/lib/check-result.mjs";
import {
  createEvidenceAuthorityBinding,
  projectIdentity,
  validateEvidenceAuthorityBinding,
} from "../scripts/lib/evidence-authority.mjs";
import { validatePlanReviewSourceEvidence } from "../scripts/lib/plan-review-binding.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(script, args) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

test("1.113 evidence authority binds an exact item inside a file-backed artifact", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-fragment-authority-"));
  const relative = "work-queue-takeover-reports/current.md";
  const identityBeforeEvidence = projectIdentity(root);
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), "# Work Queue\n\n- WQ-001\n");
  assert.deepEqual(projectIdentity(root), identityBeforeEvidence);
  const sourceRef = `artifact:${relative}#WQ-001`;
  const binding = createEvidenceAuthorityBinding(root, {
    taskRef: "task:fragment-authority",
    intentDigest: `sha256:${"1".repeat(64)}`,
    sourceRefs: [sourceRef],
  });

  assert.equal(binding.sources.length, 1);
  assert.equal(binding.sources[0].ref, sourceRef);
  assert.equal(binding.sources[0].relative_path, relative);
  assert.deepEqual(validateEvidenceAuthorityBinding(root, binding, {
    taskRef: "task:fragment-authority",
    intentDigest: `sha256:${"1".repeat(64)}`,
    sourceRefs: [sourceRef],
  }), { ok: true, errors: [] });
});

test("post-write evidence authority accepts only an exact ancestor source revision", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-revision-advance-"));
  try {
    fs.writeFileSync(path.join(root, "README.md"), "base\n");
    for (const args of [
      ["init"],
      ["config", "user.email", "intentos-test@example.com"],
      ["config", "user.name", "IntentOS Test"],
      ["add", "."],
      ["commit", "-m", "planning base"],
    ]) {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
    const sourceCommit = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    const binding = createEvidenceAuthorityBinding(root, {
      taskRef: "task:revision-advance",
      intentDigest: `sha256:${"2".repeat(64)}`,
      sourceRefs: [],
    });
    fs.writeFileSync(path.join(root, "README.md"), "candidate\n");

    assert.deepEqual(validateEvidenceAuthorityBinding(root, binding, {
      taskRef: "task:revision-advance",
      intentDigest: `sha256:${"2".repeat(64)}`,
      sourceRefs: [],
      allowRevisionAdvance: true,
      sourceRevisionDigest: binding.project.revision,
      sourceGitCommit: sourceCommit,
    }), { ok: true, errors: [] });

    const forged = structuredClone(binding);
    forged.project.revision = `sha256:${"0".repeat(64)}`;
    const forgedResult = validateEvidenceAuthorityBinding(root, forged, {
      taskRef: "task:revision-advance",
      intentDigest: `sha256:${"2".repeat(64)}`,
      sourceRefs: [],
      allowRevisionAdvance: true,
      sourceRevisionDigest: binding.project.revision,
      sourceGitCommit: sourceCommit,
    });
    assert.equal(forgedResult.ok, false);
    assert.match(forgedResult.errors.join("\n"), /pre-write source revision/);

    const unrelated = validateEvidenceAuthorityBinding(root, binding, {
      taskRef: "task:revision-advance",
      intentDigest: `sha256:${"2".repeat(64)}`,
      sourceRefs: [],
      allowRevisionAdvance: true,
      sourceRevisionDigest: binding.project.revision,
      sourceGitCommit: "0".repeat(40),
    });
    assert.equal(unrelated.ok, false);
    assert.match(unrelated.errors.join("\n"), /exact source Git commit/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("1.113 missing Change Boundary and Standard Baseline artifacts are typed MISSING", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-missing-"));
  for (const [script, extra] of [
    ["scripts/check-change-boundary.mjs", []],
    ["scripts/check-standard-baseline-selection.mjs", []],
  ]) {
    const result = run(script, [root, ...extra, "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const value = JSON.parse(result.stdout);
    assert.equal(value.consumerOutcome, "MISSING");
    assert.equal(requireAcceptedOutcome(value).ok, false);
  }
});

test("1.113 strict Change Boundary fails when the required artifact is missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-boundary-"));
  const result = run("scripts/check-change-boundary.mjs", [root, "--require-report", "--json"]);
  assert.notEqual(result.status, 0);
  assert.equal(JSON.parse(result.stdout).consumerOutcome, "MISSING");
});

test("1.113 execution kind uses adoption intent instead of the IntentOS product name", () => {
  const sourceTask = run("scripts/resolve-execution-assurance.mjs", [
    kitRoot,
    "--intent", "Complete IntentOS source trust closure with baseline and release evidence",
    "--json",
  ]);
  assert.equal(sourceTask.status, 0, sourceTask.stderr || sourceTask.stdout);
  assert.equal(JSON.parse(sourceTask.stdout).structuredEvidence.execution_kind, "WORKFLOW_CAPABILITY");

  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-adoption-kind-"));
  const adoptionTask = run("scripts/resolve-execution-assurance.mjs", [
    targetRoot,
    "--intent", "adopt IntentOS into an existing project",
    "--json",
  ]);
  assert.equal(adoptionTask.status, 0, adoptionTask.stderr || adoptionTask.stdout);
  assert.equal(JSON.parse(adoptionTask.stdout).structuredEvidence.execution_kind, "ADOPTION_MIGRATION");
});

test("1.113 a structurally valid Plan Review revision is BLOCKED, not READY", () => {
  const root = path.join(kitRoot, "examples/1.88-plan-review-gate/high-permission-delete-plan-revision");
  const result = run("scripts/check-plan-review.mjs", [
    root,
    "--report", "plan-review-reports/001-revision.md",
    "--require-report",
    "--require-structured-evidence",
    "--json",
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const value = JSON.parse(result.stdout);
  assert.equal(value.consumerOutcome, "BLOCKED");
  assert.equal(requireAcceptedOutcome(value).ok, false);
});

test("1.113 project-native Review Surface evidence does not invent a task binding", () => {
  const report = extractMachineReadableEvidence(fs.readFileSync(
    path.join(kitRoot, "plan-review-reports/113-cross-domain-trust-closure.md"),
    "utf8",
  ));
  assert.equal(report.ok, true, report.errors?.join("; "));
  const source = report.value.source_chain.find((item) => item.source_kind === "review_surface_card");
  assert.equal(source.current_task_match, "N/A");
  assert.equal(
    report.value.review_surface_matrix.every((item) => item.human_decision_needed === "No"),
    true,
    "a passed current Plan Review must not delegate technical review judgment to the solo user",
  );
});

test("1.113 historical completion evidence is readable but cannot satisfy current readiness", () => {
  const root = path.join(kitRoot, "examples/1.78-completion-evidence-gate/appointment-service-time");
  const common = [
    root,
    "--report", "completion-evidence-reports/001-service-time.md",
    "--require-structured-evidence",
    "--require-source-refs",
  ];
  const compatibility = run("scripts/check-completion-evidence.mjs", common);
  assert.equal(compatibility.status, 0, compatibility.stderr || compatibility.stdout);
  assert.match(compatibility.stdout, /historical ready evidence remains readable but is not current completion authority/i);

  const authoritative = run("scripts/check-completion-evidence.mjs", [...common, "--require-ready"]);
  assert.notEqual(authoritative.status, 0, "historical evidence must not satisfy current completion readiness");
  assert.match(authoritative.stdout, /authoritative Execution Assurance checker failed/i);
});

test("1.113 historical Plan Review is readable but cannot become current task authority", () => {
  const relativePath = "plan-review-reports/109-project-entry-adoption-trust.md";
  const reportFile = path.join(kitRoot, relativePath);
  const extracted = extractMachineReadableEvidence(fs.readFileSync(reportFile, "utf8"));
  assert.equal(extracted.ok, true, extracted.errors?.join("; "));

  const compatibility = validatePlanReviewSourceEvidence(kitRoot, reportFile, extracted.value);
  assert.deepEqual(compatibility, { ok: true, errors: [] });

  const authoritative = validatePlanReviewSourceEvidence(kitRoot, reportFile, extracted.value, {
    requireCurrentTaskLineage: true,
  });
  assert.equal(authoritative.ok, false);
  assert.equal(
    authoritative.errors.includes("intent and intent_digest must be canonical and exact"),
    true,
  );
});

test("1.113 historical release evidence requires explicit compatibility audit and cannot satisfy current release authority", () => {
  const root = path.join(kitRoot, "examples/1.80-release-evidence-gate/web-preview-handoff");
  const compatibility = run("scripts/check-release-evidence-gate.mjs", [
    root,
    "--require-structured-evidence",
    "--compatibility-only",
  ]);
  assert.equal(compatibility.status, 0, compatibility.stderr || compatibility.stdout);
  assert.match(compatibility.stdout, /historical ready release evidence remains readable but is not current release authority/i);

  const authoritative = run("scripts/check-release-evidence-gate.mjs", [
    root,
    "--require-structured-evidence",
    "--require-current-completion",
    "--strict-source-binding",
  ]);
  assert.notEqual(authoritative.status, 0, "historical release evidence must not satisfy current release authority");
  assert.match(
    `${authoritative.stdout}\n${authoritative.stderr}`,
    /Completion Evidence set .* strict checker failed/i,
  );
});

test("1.113 a blocked POSSIBLE_HIGH completion report may omit not-yet-created execution evidence", () => {
  const root = path.join(kitRoot, "examples/1.85-task-governance-consumer-integration/possible-high-blocked");
  const common = [
    root,
    "--report", "completion-evidence-reports/001-possible-high-blocked.md",
    "--require-structured-evidence",
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
  ];
  const blocked = run("scripts/check-completion-evidence.mjs", common);
  assert.equal(blocked.status, 0, `${blocked.stdout}\n${blocked.stderr}`);
  assert.match(blocked.stdout, /unresolved POSSIBLE_HIGH blocks completion/i);

  const ready = run("scripts/check-completion-evidence.mjs", [...common, "--require-ready"]);
  assert.notEqual(ready.status, 0, "a blocked report must never satisfy a ready completion request");
});

test("1.113 strict user delivery binds the current intent outside the plain user surface", () => {
  const source = path.join(kitRoot, "examples/1.85-task-governance-consumer-integration/possible-high-blocked");
  const common = [
    source,
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
  ];
  const accepted = run("scripts/check-user-delivery-console.mjs", common);
  assert.equal(accepted.status, 0, `${accepted.stdout}\n${accepted.stderr}`);
  assert.doesNotMatch(accepted.stdout, /user surface exposes internal evidence jargon/i);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-113-delivery-intent-"));
  fs.cpSync(source, root, { recursive: true });
  const card = path.join(root, "delivery-status-cards/001-possible-high-blocked.md");
  const content = fs.readFileSync(card, "utf8");
  const withoutIntent = content.replace(/^\| Intent Digest \|.*\n/m, "");
  assert.notEqual(withoutIntent, content, "fixture must contain a technical intent binding");
  fs.writeFileSync(card, withoutIntent);

  const rejected = run("scripts/check-user-delivery-console.mjs", [
    root,
    "--require-task-governance",
    "--require-work-queue",
    "--strict-task-consumer",
  ]);
  assert.notEqual(rejected.status, 0);
  assert.match(`${rejected.stdout}\n${rejected.stderr}`, /strict task consumer requires consumer intent_digest/i);
});
