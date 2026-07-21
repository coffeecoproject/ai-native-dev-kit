import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { canonicalFileDigest, projectIdentity } from "../scripts/lib/evidence-authority.mjs";
import {
  fullVerificationAuthorityErrors,
  releaseAcceptanceCandidateRevision,
  STAGED_RELEASE_CANDIDATE_CHECK,
  validateReleasePreflightReceipt,
} from "../scripts/lib/release-trust.mjs";

test("full verification authority cannot substitute a partial verification command", () => {
  const base = {
    test_evidence_state: "TEST_EVIDENCE_COMPLETE",
    evidence_items: [{
      evidence_type: "COMMAND_OUTPUT",
      result_state: "PASSED",
      ref: "artifact:evidence/full-verification.log",
      command: "npm run verify:pre-runtime",
      exit_code: 0,
      ran_after_change: "Yes",
      current_task_match: "Yes",
    }],
  };
  assert.match(fullVerificationAuthorityErrors(base).join("; "), /exactly one npm run verify/);
  base.evidence_items[0].command = "npm run verify";
  assert.deepEqual(fullVerificationAuthorityErrors(base), []);
  base.evidence_items[0].command = "npm run verify -- --allow-empty";
  assert.match(fullVerificationAuthorityErrors(base).join("; "), /exactly one npm run verify/);
});

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hostedConsent = "CONSENT_TO_HOSTED_RUNNER_FOR_READ_ONLY_RELEASE_CHECKS";
const fullVerificationChecker = "node scripts/check-test-evidence.mjs . --report {evidence_ref} --require-structured-evidence --strict-source-binding --require-current-evidence --require-test-quality-controls --require-evidence-authority --require-runtime-trust";
const p0P1ClosureChecker = "node scripts/check-completion-evidence.mjs . --report {evidence_ref} --require-ready --require-task-governance --require-work-queue --strict-task-consumer --require-plan-review --require-evidence-authority";

test("release preflight receipt replays one non-empty staged exact candidate check", () => {
  const root = gitFixture("intentos-release-preflight-");
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const current = 2;\n");
  fs.writeFileSync(path.join(root, "release-candidates/source.md"), "# Exact source candidate\n\nRevision two.\n");
  git(root, ["add", "src/index.mjs", "release-candidates/source.md"]);

  const receiptRef = "evidence/release-preflight.json";
  const expected = writeReceipt(root, receiptRef);
  const accepted = validateReleasePreflightReceipt(root, `artifact:${receiptRef}`, expected);
  assert.equal(accepted.ok, true, accepted.errors.join("\n"));

  for (const command of ["true", "node arbitrary-check.mjs", "", `${STAGED_RELEASE_CANDIDATE_CHECK} && true`]) {
    writeReceipt(root, receiptRef, { command });
    const rejected = validateReleasePreflightReceipt(root, `artifact:${receiptRef}`, expected);
    assert.equal(rejected.ok, false, `unexpectedly accepted ${JSON.stringify(command)}`);
    assert.match(rejected.errors.join("\n"), /supported exact candidate check/);
  }
});

test("release preflight receipt rejects an empty staged diff and candidate digest drift", () => {
  const root = gitFixture("intentos-release-preflight-empty-");
  const receiptRef = "evidence/release-preflight.json";
  const expected = writeReceipt(root, receiptRef);
  const empty = validateReleasePreflightReceipt(root, `artifact:${receiptRef}`, expected);
  assert.equal(empty.ok, false);
  assert.match(empty.errors.join("\n"), /non-empty staged diff/);

  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const current = 2;\n");
  git(root, ["add", "src/index.mjs"]);
  const drifted = writeReceipt(root, receiptRef, {
    release_candidate_digest: `sha256:${"0".repeat(64)}`,
  });
  const badDigest = validateReleasePreflightReceipt(root, `artifact:${receiptRef}`, drifted);
  assert.equal(badDigest.ok, false);
  assert.match(badDigest.errors.join("\n"), /does not match the current candidate file/);
});

test("structured release acceptance binds a candidate and rejects prose-only acceptance", () => {
  const fixture = acceptanceFixture();
  const checked = checkAcceptance(fixture);
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);

  fs.writeFileSync(fixture.reportFile, [
    "# IntentOS 1.113.0 Independent Review Report",
    "",
    "## Status",
    "",
    "BLOCKED",
    "",
    "## Review Result",
    "",
    "BLOCKED",
    "",
  ].join("\n"));
  const proseOnly = checkAcceptance(fixture);
  assert.notEqual(proseOnly.status, 0);
  assert.match(`${proseOnly.stdout}\n${proseOnly.stderr}`, /Machine-Readable Evidence is required/);
});

test("candidate base is read from the structured record and spans multiple commits", () => {
  const fixture = acceptanceFixture();
  assert.equal(Number(git(fixture.root, ["rev-list", "--count", `${fixture.baseRevision}..HEAD`]).stdout.trim()), 2);

  const printed = checkAcceptance(fixture, { printBaseRevision: true });
  assert.equal(printed.status, 0, `${printed.stdout}\n${printed.stderr}`);
  assert.equal(printed.stdout.trim(), fixture.baseRevision);

  const rebound = rebindCandidateBase(fixture, fixture.gitRevision);
  const headAsBase = checkAcceptance(fixture, {
    candidateDigest: rebound.evidence.candidate.candidate_digest,
  });
  assert.notEqual(headAsBase.status, 0);
  assert.match(`${headAsBase.stdout}\n${headAsBase.stderr}`, /must precede at least one candidate commit/);

  const unrelatedFixture = acceptanceFixture();
  const unrelated = git(unrelatedFixture.root, ["commit-tree", "HEAD^{tree}", "-m", "unrelated root"]).stdout.trim().toLowerCase();
  const nonAncestorBinding = rebindCandidateBase(unrelatedFixture, unrelated);
  const nonAncestor = checkAcceptance(unrelatedFixture, {
    candidateDigest: nonAncestorBinding.evidence.candidate.candidate_digest,
  });
  assert.notEqual(nonAncestor.status, 0);
  assert.match(`${nonAncestor.stdout}\n${nonAncestor.stderr}`, /must be an ancestor of checked-out HEAD/);
});

test("accepted state cannot contradict Markdown or retain open P0/P1 findings", () => {
  const fixture = acceptanceFixture();
  const accepted = acceptedEvidence(fixture.evidence);

  writeAcceptanceReport(fixture.reportFile, accepted, { status: "PENDING\n\nACCEPTED" });
  const contradictory = checkAcceptance(fixture, { requireAccepted: true });
  assert.notEqual(contradictory.status, 0);
  assert.match(`${contradictory.stdout}\n${contradictory.stderr}`, /contradicts Markdown state: PENDING/);

  accepted.findings.p0_open = 1;
  seal(accepted);
  writeAcceptanceReport(fixture.reportFile, accepted);
  const open = checkAcceptance(fixture);
  assert.notEqual(open.status, 0);
  assert.match(`${open.stdout}\n${open.stderr}`, /requires exactly zero open P0 and P1/);
});

test("candidate revision, symlink, and finding-count drift fail closed", () => {
  const fixture = acceptanceFixture();
  const stale = structuredClone(fixture.evidence);
  stale.candidate.candidate_revision = `sha256:${"0".repeat(64)}`;
  seal(stale);
  writeAcceptanceReport(fixture.reportFile, stale);
  const identityDrift = checkAcceptance(fixture);
  assert.notEqual(identityDrift.status, 0);
  assert.match(`${identityDrift.stdout}\n${identityDrift.stderr}`, /candidate revision does not match/);

  writeAcceptanceReport(fixture.reportFile, fixture.evidence);
  const linkedReport = `releases/${fixture.version}/linked-review.md`;
  fs.symlinkSync(fixture.reportFile, path.join(fixture.root, linkedReport));
  const symlinked = checkAcceptance(fixture, { report: linkedReport });
  assert.notEqual(symlinked.status, 0);
  assert.match(`${symlinked.stdout}\n${symlinked.stderr}`, /must not contain symlinks/);

  const negative = structuredClone(fixture.evidence);
  negative.findings.p0_open = -1;
  seal(negative);
  writeAcceptanceReport(fixture.reportFile, negative);
  const invalidCount = checkAcceptance(fixture);
  assert.notEqual(invalidCount.status, 0);
  assert.match(`${invalidCount.stdout}\n${invalidCount.stderr}`, /must be non-negative/);
});

test("release acceptance rejects unstaged and untracked source contamination", () => {
  const unstagedFixture = acceptanceFixture();
  fs.writeFileSync(path.join(unstagedFixture.root, "src/index.mjs"), "export const contaminated = true;\n");
  const unstaged = checkAcceptance(unstagedFixture);
  assert.notEqual(unstaged.status, 0);
  assert.match(`${unstaged.stdout}\n${unstaged.stderr}`, /unstaged project change src\/index\.mjs/);

  const untrackedFixture = acceptanceFixture();
  fs.writeFileSync(path.join(untrackedFixture.root, "src/untracked.mjs"), "export const contaminated = true;\n");
  const untracked = checkAcceptance(untrackedFixture);
  assert.notEqual(untracked.status, 0);
  assert.match(`${untracked.stdout}\n${untracked.stderr}`, /untracked project file src\/untracked\.mjs/);

  const draftFixture = acceptanceFixture();
  fs.mkdirSync(path.join(draftFixture.root, "docs/plans"), { recursive: true });
  fs.writeFileSync(path.join(draftFixture.root, "docs/plans/unregistered-review-draft.md"), "# Draft\n");
  const draft = checkAcceptance(draftFixture);
  assert.equal(draft.status, 0, `${draft.stdout}\n${draft.stderr}`);
});

test("authority checks reject arbitrary paths, shared files, and arbitrary checker commands", () => {
  const fixture = acceptanceFixture();
  const duplicateAuthority = path.join(fixture.root, "test-evidence-reports/release-duplicate.md");
  fs.copyFileSync(path.join(fixture.root, "test-evidence-reports/release-001.md"), duplicateAuthority);
  const duplicate = structuredClone(fixture.evidence);
  duplicate.checks[1] = {
    ...duplicate.checks[0],
    evidence_ref: "artifact:test-evidence-reports/release-duplicate.md",
    evidence_digest: canonicalFileDigest(duplicateAuthority),
  };
  seal(duplicate);
  writeAcceptanceReport(fixture.reportFile, duplicate);
  const duplicateId = checkAcceptance(fixture);
  assert.notEqual(duplicateId.status, 0);
  assert.match(`${duplicateId.stdout}\n${duplicateId.stderr}`, /exactly one required check p0_p1_closure/);

  const shared = structuredClone(fixture.evidence);
  shared.checks[1].evidence_ref = shared.checks[0].evidence_ref;
  shared.checks[1].evidence_digest = shared.checks[0].evidence_digest;
  seal(shared);
  writeAcceptanceReport(fixture.reportFile, shared);
  const sharedFile = checkAcceptance(fixture);
  assert.notEqual(sharedFile.status, 0);
  assert.match(`${sharedFile.stdout}\n${sharedFile.stderr}`, /completion-evidence-reports|evidence_ref/);

  const arbitrary = structuredClone(fixture.evidence);
  arbitrary.checks[0].checker = "node arbitrary-self-check.mjs";
  seal(arbitrary);
  writeAcceptanceReport(fixture.reportFile, arbitrary);
  const arbitraryChecker = checkAcceptance(fixture);
  assert.notEqual(arbitraryChecker.status, 0);
  assert.match(`${arbitraryChecker.stdout}\n${arbitraryChecker.stderr}`, /checker/);
});

test("accepted PASS claims replay the prescribed authority checkers", () => {
  const fixture = acceptanceFixture();
  const accepted = acceptedEvidence(fixture.evidence);
  writeAcceptanceReport(fixture.reportFile, accepted);

  const checked = checkAcceptance(fixture, { requireAccepted: true });
  assert.notEqual(checked.status, 0);
  assert.match(
    `${checked.stdout}\n${checked.stderr}`,
    /PASS requires TEST_EVIDENCE_COMPLETE|prescribed authority checker replay failed/,
  );
  assert.match(
    `${checked.stdout}\n${checked.stderr}`,
    /PASS requires ready completion evidence|prescribed authority checker replay failed/,
  );
});

test("review independence is bound to structured identity and provenance", () => {
  const fixture = acceptanceFixture();
  const authorAsReviewer = identity({
    principal_type: "HUMAN",
    subject_id: "candidate-author-reviewer",
    issuer: "git-fixture",
    source_control_email: fixture.authorIdentity.source_control_email,
  });
  const provenance = structuredClone(fixture.provenance);
  provenance.reviewer_identity = authorAsReviewer;
  sealField(provenance, "provenance_digest");
  writeJson(fixture.provenanceFile, provenance);

  const evidence = structuredClone(fixture.evidence);
  evidence.review.reviewer_identity = authorAsReviewer;
  evidence.review.provenance.digest = canonicalFileDigest(fixture.provenanceFile);
  seal(evidence);
  writeAcceptanceReport(fixture.reportFile, evidence);
  const sameIdentity = checkAcceptance(fixture);
  assert.notEqual(sameIdentity.status, 0);
  assert.match(`${sameIdentity.stdout}\n${sameIdentity.stderr}`, /must be distinct from every candidate author identity/);

  const aliasFixture = acceptanceFixture();
  const subjectAlias = identity({
    principal_type: "HUMAN",
    subject_id: aliasFixture.authorIdentity.subject_id,
    issuer: aliasFixture.authorIdentity.issuer,
    source_control_email: "alias-reviewer@example.invalid",
  });
  const aliasProvenance = structuredClone(aliasFixture.provenance);
  aliasProvenance.reviewer_identity = subjectAlias;
  sealField(aliasProvenance, "provenance_digest");
  writeJson(aliasFixture.provenanceFile, aliasProvenance);
  const aliasEvidence = structuredClone(aliasFixture.evidence);
  aliasEvidence.review.reviewer_identity = subjectAlias;
  aliasEvidence.review.provenance.digest = canonicalFileDigest(aliasFixture.provenanceFile);
  seal(aliasEvidence);
  writeAcceptanceReport(aliasFixture.reportFile, aliasEvidence);
  const sameSubject = checkAcceptance(aliasFixture);
  assert.notEqual(sameSubject.status, 0);
  assert.match(`${sameSubject.stdout}\n${sameSubject.stderr}`, /must be distinct from every candidate author identity/);

  const selfReported = structuredClone(fixture.provenance);
  selfReported.candidate_authored_by_reviewer = "Yes";
  sealField(selfReported, "provenance_digest");
  writeJson(fixture.provenanceFile, selfReported);
  const drifted = structuredClone(fixture.evidence);
  drifted.review.provenance.digest = canonicalFileDigest(fixture.provenanceFile);
  seal(drifted);
  writeAcceptanceReport(fixture.reportFile, drifted);
  const authored = checkAcceptance(fixture);
  assert.notEqual(authored.status, 0);
  assert.match(`${authored.stdout}\n${authored.stderr}`, /independent, read-only, and non-authoring/);

  const staleFixture = acceptanceFixture();
  const staleProvenance = structuredClone(staleFixture.provenance);
  staleProvenance.candidate_revision = `sha256:${"0".repeat(64)}`;
  sealField(staleProvenance, "provenance_digest");
  writeJson(staleFixture.provenanceFile, staleProvenance);
  const staleEvidence = structuredClone(staleFixture.evidence);
  staleEvidence.review.provenance.digest = canonicalFileDigest(staleFixture.provenanceFile);
  seal(staleEvidence);
  writeAcceptanceReport(staleFixture.reportFile, staleEvidence);
  const staleCandidate = checkAcceptance(staleFixture);
  assert.notEqual(staleCandidate.status, 0);
  assert.match(`${staleCandidate.stdout}\n${staleCandidate.stderr}`, /provenance candidate_revision does not match/);

  const copiedFixture = acceptanceFixture();
  const copiedProvenance = structuredClone(copiedFixture.provenance);
  copiedProvenance.project_identity.fingerprint = `sha256:${"f".repeat(64)}`;
  sealField(copiedProvenance, "provenance_digest");
  writeJson(copiedFixture.provenanceFile, copiedProvenance);
  const copiedEvidence = structuredClone(copiedFixture.evidence);
  copiedEvidence.review.provenance.digest = canonicalFileDigest(copiedFixture.provenanceFile);
  seal(copiedEvidence);
  writeAcceptanceReport(copiedFixture.reportFile, copiedEvidence);
  const copiedProject = checkAcceptance(copiedFixture);
  assert.notEqual(copiedProject.status, 0);
  assert.match(`${copiedProject.stdout}\n${copiedProject.stderr}`, /provenance project_identity does not match/);
});

test("manual hosted-runner consent and dispatch bindings are exact", () => {
  const fixture = acceptanceFixture();
  const badConsent = checkAcceptance(fixture, { hostedConsent: "true" });
  assert.notEqual(badConsent.status, 0);
  assert.match(`${badConsent.stdout}\n${badConsent.stderr}`, /hosted runner consent must equal/);

  const badRevision = checkAcceptance(fixture, { gitRevision: "0".repeat(40) });
  assert.notEqual(badRevision.status, 0);
  assert.match(`${badRevision.stdout}\n${badRevision.stderr}`, /must match checked-out HEAD/);

  const badDigest = checkAcceptance(fixture, { candidateDigest: `sha256:${"0".repeat(64)}` });
  assert.notEqual(badDigest.status, 0);
  assert.match(`${badDigest.stdout}\n${badDigest.stderr}`, /candidate digest does not match structured acceptance/);
});

function gitFixture(prefix) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "release-candidates"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const current = 1;\n");
  fs.writeFileSync(path.join(root, "release-candidates/source.md"), "# Exact source candidate\n\nRevision one.\n");
  git(root, ["init", "-q"]);
  git(root, ["config", "user.email", "release-test@example.invalid"]);
  git(root, ["config", "user.name", "Release Trust Test"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-qm", "initial candidate"]);
  return root;
}

function writeReceipt(root, receiptRef, overrides = {}) {
  const candidateRef = "artifact:release-candidates/source.md";
  const receipt = {
    schema_version: "1.113.0",
    artifact_type: "release_preflight_receipt",
    operation: "release_preflight",
    task_ref: "task:release-trust-boundary",
    intent_digest: `sha256:${"1".repeat(64)}`,
    release_candidate_ref: candidateRef,
    release_candidate_digest: canonicalFileDigest(path.join(root, "release-candidates/source.md")),
    source_revision: projectIdentity(root).revision,
    lane_state: "PREFLIGHT_ONLY",
    command: STAGED_RELEASE_CANDIDATE_CHECK,
    result: "PASS",
    exit_code: 0,
    external_effects_executed: "No",
    production_touched: "No",
    receipt_digest: "",
    ...overrides,
  };
  receipt.receipt_digest = evidenceDigest(receipt, ["receipt_digest"]);
  const file = path.join(root, receiptRef);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
  return {
    taskRef: receipt.task_ref,
    intentDigest: receipt.intent_digest,
    releaseCandidateRef: receipt.release_candidate_ref,
    releaseCandidateDigest: receipt.release_candidate_digest,
    sourceRevision: receipt.source_revision,
    laneState: receipt.lane_state,
  };
}

function acceptanceFixture() {
  const root = gitFixture("intentos-release-acceptance-");
  const version = "1.113.0";
  const baseRevision = git(root, ["rev-parse", "HEAD"]).stdout.trim().toLowerCase();
  const reportRelative = `releases/${version}/independent-review-report.md`;
  const reportFile = path.join(root, reportRelative);
  const candidateRelative = "release-candidates/source.md";
  const candidateFile = path.join(root, candidateRelative);
  const provenanceRelative = "release-review-provenance/review-001.json";
  const provenanceFile = path.join(root, provenanceRelative);
  const fullRelative = "test-evidence-reports/release-001.md";
  const fullFile = path.join(root, fullRelative);
  const closureRelative = "completion-evidence-reports/release-001.md";
  const closureFile = path.join(root, closureRelative);
  const reviewedAt = "2026-01-01T00:00:00Z";
  const authorIdentity = identity({
    principal_type: "HUMAN",
    subject_id: "release-author-001",
    issuer: "git-fixture",
    source_control_email: "release-test@example.invalid",
  });
  const reviewerIdentity = identity({
    principal_type: "AGENT",
    subject_id: "review-agent-001",
    issuer: "release-review-harness",
    source_control_email: "review-agent@example.invalid",
  });
  const candidateRecord = {
    schema_version: "1.113.0",
    artifact_type: "release_candidate",
    candidate_id: "release-1.113.0-source",
    candidate_ref: `artifact:${candidateRelative}`,
    record_digest: "",
    release_version: version,
    base_revision: baseRevision,
    author_identities: [authorIdentity],
    boundaries: {
      authorizes_release: "No",
      authorizes_external_effect: "No",
    },
  };
  sealField(candidateRecord, "record_digest");
  writeStructuredMarkdown(candidateFile, "Release Candidate", candidateRecord);

  writeStructuredMarkdown(fullFile, "Test Evidence", {
    artifact_type: "test_evidence",
    test_evidence_state: "NOT_RUN",
  });
  writeStructuredMarkdown(closureFile, "Completion Evidence", {
    artifact_type: "completion_evidence_gate",
    completion_state: "BLOCKED",
    can_claim_complete: "No",
  });

  const candidateDigest = canonicalFileDigest(candidateFile);
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, "# Pending independent review\n");

  git(root, ["add", candidateRelative, fullRelative, closureRelative, reportRelative]);
  git(root, ["commit", "-qm", "record structured release candidate"]);
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const current = 2;\n");
  git(root, ["add", "src/index.mjs"]);
  git(root, ["commit", "-qm", "complete candidate implementation"]);

  const currentProjectIdentity = projectIdentity(root);
  const candidateRevision = releaseAcceptanceCandidateRevision(root, [reportRelative, provenanceRelative]);
  const provenance = {
    schema_version: "1.113.0",
    artifact_type: "release_review_provenance",
    provenance_id: "release-1.113.0-review-001",
    provenance_digest: "",
    reviewer_identity: reviewerIdentity,
    candidate_author_identities: [authorIdentity],
    candidate_ref: `artifact:${candidateRelative}`,
    candidate_digest: candidateDigest,
    candidate_revision: candidateRevision,
    project_identity: {
      kind: currentProjectIdentity.kind,
      fingerprint: currentProjectIdentity.fingerprint,
    },
    base_revision: baseRevision,
    review_mode: "INDEPENDENT_READ_ONLY",
    candidate_authored_by_reviewer: "No",
    candidate_write_access_during_review: "No",
    recorded_at: reviewedAt,
  };
  sealField(provenance, "provenance_digest");
  writeJson(provenanceFile, provenance);
  git(root, ["add", provenanceRelative]);

  const evidence = {
    schema_version: "1.113.0",
    artifact_type: "release_acceptance",
    acceptance_id: "release-1.113.0-independent",
    acceptance_digest: "",
    release_version: version,
    candidate: {
      candidate_ref: `artifact:${candidateRelative}`,
      candidate_digest: candidateDigest,
      candidate_revision: candidateRevision,
      base_revision: baseRevision,
    },
    review: {
      decision: "BLOCKED",
      reviewer_identity: reviewerIdentity,
      reviewed_at: reviewedAt,
      provenance: {
        ref: `artifact:${provenanceRelative}`,
        digest: canonicalFileDigest(provenanceFile),
      },
    },
    findings: {
      p0_open: 0,
      p1_open: 0,
      unresolved_finding_ids: [],
    },
    checks: [
      {
        check_id: "full_verification",
        status: "NOT_RUN",
        authority_artifact_type: "test_evidence",
        evidence_ref: `artifact:${fullRelative}`,
        evidence_digest: canonicalFileDigest(fullFile),
        checker: fullVerificationChecker,
      },
      {
        check_id: "p0_p1_closure",
        status: "NOT_RUN",
        authority_artifact_type: "completion_evidence_gate",
        evidence_ref: `artifact:${closureRelative}`,
        evidence_digest: canonicalFileDigest(closureFile),
        checker: p0P1ClosureChecker,
      },
    ],
    contradictions: {
      markdown_result_conflict: "No",
      candidate_identity_conflict: "No",
      unresolved_evidence_conflict: "No",
    },
    boundaries: {
      authorizes_tag: "No",
      authorizes_push: "No",
      authorizes_release: "No",
      authorizes_production: "No",
      authorizes_external_effect: "No",
    },
    outcome: "RELEASE_CANDIDATE_BLOCKED",
  };
  seal(evidence);
  writeAcceptanceReport(reportFile, evidence);
  return {
    root,
    version,
    reportRelative,
    reportFile,
    candidateFile,
    candidateRecord,
    provenanceFile,
    provenance,
    authorIdentity,
    evidence,
    baseRevision,
    candidateDigest,
    gitRevision: git(root, ["rev-parse", "HEAD"]).stdout.trim().toLowerCase(),
  };
}

function rebindCandidateBase(fixture, baseRevision) {
  const candidateRecord = structuredClone(fixture.candidateRecord);
  candidateRecord.base_revision = baseRevision;
  sealField(candidateRecord, "record_digest");
  writeStructuredMarkdown(fixture.candidateFile, "Release Candidate", candidateRecord);
  const candidateDigest = canonicalFileDigest(fixture.candidateFile);

  const provenance = structuredClone(fixture.provenance);
  provenance.base_revision = baseRevision;
  provenance.candidate_digest = candidateDigest;
  sealField(provenance, "provenance_digest");
  writeJson(fixture.provenanceFile, provenance);

  const evidence = structuredClone(fixture.evidence);
  evidence.candidate.base_revision = baseRevision;
  evidence.candidate.candidate_digest = candidateDigest;
  evidence.review.provenance.digest = canonicalFileDigest(fixture.provenanceFile);
  seal(evidence);
  writeAcceptanceReport(fixture.reportFile, evidence);
  return { candidateRecord, provenance, evidence };
}

function acceptedEvidence(source) {
  const evidence = structuredClone(source);
  evidence.review.decision = "ACCEPTED";
  evidence.checks.forEach((item) => { item.status = "PASS"; });
  evidence.outcome = "RELEASE_CANDIDATE_ACCEPTED";
  return seal(evidence);
}

function writeStructuredMarkdown(file, title, evidence) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    `# ${title}`,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ].join("\n"));
}

function writeAcceptanceReport(file, evidence, options = {}) {
  fs.writeFileSync(file, [
    "# IntentOS 1.113.0 Independent Review Report",
    "",
    "## Status",
    "",
    options.status || evidence.review.decision,
    "",
    "## Review Result",
    "",
    options.result || evidence.review.decision,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
    "## Boundary",
    "",
    "This acceptance does not authorize tag, push, release, production, or another external effect.",
    "",
  ].join("\n"));
}

function identity(fields) {
  const value = { ...fields, identity_digest: "" };
  value.identity_digest = evidenceDigest(value, ["identity_digest"]);
  return value;
}

function seal(evidence) {
  return sealField(evidence, "acceptance_digest");
}

function sealField(value, field) {
  value[field] = evidenceDigest(value, [field]);
  return value;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function checkAcceptance(fixture, overrides = {}) {
  const args = [
    path.join(kitRoot, "scripts/check-release-acceptance.mjs"),
    fixture.root,
    "--report", overrides.report || fixture.reportRelative,
    "--version", fixture.version,
    "--candidate-git-revision", overrides.gitRevision || fixture.gitRevision,
    "--candidate-digest", overrides.candidateDigest || fixture.candidateDigest,
    "--hosted-runner-consent", overrides.hostedConsent || hostedConsent,
    "--require-hosted-runner-consent",
    "--require-dispatch-binding",
  ];
  if (overrides.requireAccepted) args.push("--require-accepted");
  if (overrides.printBaseRevision) args.push("--print-base-revision");
  return spawnSync(process.execPath, args, { cwd: fixture.root, encoding: "utf8" });
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result;
}
