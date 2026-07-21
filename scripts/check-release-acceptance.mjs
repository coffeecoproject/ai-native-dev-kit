#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import {
  canonicalJson,
  evidenceDigest,
  extractMachineReadableEvidence,
  validateEvidenceBlock,
} from "./lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./lib/evidence-authority.mjs";
import {
  fullVerificationAuthorityErrors,
  releaseAcceptanceCandidateRevision,
  releaseCandidateContaminationErrors,
} from "./lib/release-trust.mjs";

export const HOSTED_RUNNER_CONSENT = "CONSENT_TO_HOSTED_RUNNER_FOR_READ_ONLY_RELEASE_CHECKS";

const authorityChecks = new Map([
  ["full_verification", {
    artifactType: "test_evidence",
    pathPattern: /^test-evidence-reports\/[A-Za-z0-9._/-]+\.md$/,
    checker: "node scripts/check-test-evidence.mjs . --report {evidence_ref} --require-structured-evidence --strict-source-binding --require-current-evidence --require-test-quality-controls --require-evidence-authority --require-runtime-trust",
    script: "check-test-evidence.mjs",
    args: ["--require-structured-evidence", "--strict-source-binding", "--require-current-evidence", "--require-test-quality-controls", "--require-evidence-authority", "--require-runtime-trust"],
  }],
  ["p0_p1_closure", {
    artifactType: "completion_evidence_gate",
    pathPattern: /^completion-evidence-reports\/[A-Za-z0-9._/-]+\.md$/,
    checker: "node scripts/check-completion-evidence.mjs . --report {evidence_ref} --require-ready --require-task-governance --require-work-queue --strict-task-consumer --require-plan-review --require-evidence-authority",
    script: "check-completion-evidence.mjs",
    args: ["--require-ready", "--require-task-governance", "--require-work-queue", "--strict-task-consumer", "--require-plan-review", "--require-evidence-authority"],
  }],
]);

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "candidate-digest",
  "candidate-git-revision",
  "hosted-runner-consent",
  "json",
  "print-base-revision",
  "report",
  "require-accepted",
  "require-dispatch-binding",
  "require-hosted-runner-consent",
  "version",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputJson = Boolean(args.json);
const printBaseRevision = Boolean(args["print-base-revision"]);
const requireAccepted = Boolean(args["require-accepted"]);
const quiet = outputJson || printBaseRevision;
let failures = 0;
const checks = [];
let validatedBaseRevision = "";

if (unknown.length > 0) fail(`unknown option: --${unknown.join(", --")}`);
if (outputJson && printBaseRevision) fail("--json and --print-base-revision cannot be combined");

const version = String(args.version || packageVersion(projectRoot) || "").trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) fail("--version must be an exact semantic release version");

if (args["require-hosted-runner-consent"]
  && args["hosted-runner-consent"] !== HOSTED_RUNNER_CONSENT) {
  fail(`hosted runner consent must equal ${HOSTED_RUNNER_CONSENT}`);
}

const reportRelative = args.report
  ? String(args.report)
  : version ? `releases/${version}/independent-review-report.md` : "";
const report = safeProjectFile(projectRoot, reportRelative);
if (!report.ok) fail(`release acceptance report is unsafe or unresolved: ${report.error}`);

if (!quiet) console.log("# Release Acceptance Check\n");

if (report.ok) checkAcceptanceReport(report, version);

if (outputJson) console.log(JSON.stringify({ status: failures ? "FAIL" : "PASS", baseRevision: validatedBaseRevision || null, checks }, null, 2));
if (failures > 0) {
  if (!quiet) console.error(`Release Acceptance check failed with ${failures} issue(s).`);
  process.exit(1);
}
if (printBaseRevision) console.log(validatedBaseRevision);
else if (!quiet) console.log("Release Acceptance check passed.");

function checkAcceptanceReport(reportFile, expectedVersion) {
  const content = fs.readFileSync(reportFile.file, "utf8");
  const schema = readBundledSchema();
  const structured = validateEvidenceBlock(content, schema, reportFile.relativePath, {
    require: true,
    digestField: "acceptance_digest",
  });
  if (!structured.ok) {
    structured.errors.forEach(fail);
    return;
  }
  pass(`${reportFile.relativePath} has schema-valid structured acceptance evidence`);

  const evidence = structured.value;
  if (evidence.release_version === expectedVersion) pass("release acceptance version matches the requested release");
  else fail("release acceptance version does not match the requested release");

  checkMarkdownAgreement(content, evidence.review.decision);
  checkDecision(evidence);
  const candidateContext = checkCandidate(
    reportFile,
    evidence.candidate,
    expectedVersion,
    evidence.review?.provenance?.ref,
  );
  checkReviewProvenance(reportFile.file, evidence, candidateContext);
  checkAuthorityChecks(reportFile.file, evidence.checks);
}

function checkMarkdownAgreement(content, decision) {
  const status = sectionBody(content, "Status");
  const result = sectionBody(content, "Review Result");
  for (const [label, body] of [["Status", status], ["Review Result", result]]) {
    const state = canonicalStateLine(body);
    if (state === decision) pass(`${label} agrees with structured review decision ${decision}`);
    else fail(`${label} must contain a canonical ${decision} state line that agrees with structured evidence`);
  }
  if (decision === "ACCEPTED") {
    const contradictory = `${status}\n${result}`.match(/\b(PENDING|REJECTED|BLOCKED|NOT\s+YET\s+RECORDED|NOT\s+RUN|PLANNED\s+ONLY)\b/i);
    if (contradictory) fail(`accepted release evidence contradicts Markdown state: ${contradictory[0]}`);
    else pass("accepted release evidence has no contradictory Markdown state");
  }
}

function checkDecision(evidence) {
  const expectedOutcome = {
    ACCEPTED: "RELEASE_CANDIDATE_ACCEPTED",
    REJECTED: "RELEASE_CANDIDATE_REJECTED",
    BLOCKED: "RELEASE_CANDIDATE_BLOCKED",
  }[evidence.review.decision];
  if (evidence.outcome === expectedOutcome) pass("structured outcome agrees with review decision");
  else fail("structured outcome contradicts review decision");

  const reviewedAt = Date.parse(evidence.review.reviewed_at);
  if (Number.isFinite(reviewedAt) && reviewedAt <= Date.now() + 5 * 60 * 1000) pass("reviewed_at is a current or historical timestamp");
  else fail("reviewed_at must be a valid timestamp that is not in the future");

  if (evidence.findings.p0_open >= 0 && evidence.findings.p1_open >= 0) {
    pass("open P0 and P1 finding counts are non-negative");
  } else {
    fail("open P0 and P1 finding counts must be non-negative");
  }

  const ids = new Set(evidence.checks.map((item) => item.check_id));
  for (const required of ["full_verification", "p0_p1_closure"]) {
    if (ids.has(required) && evidence.checks.filter((item) => item.check_id === required).length === 1) {
      pass(`release acceptance includes exactly one required check ${required}`);
    } else {
      fail(`release acceptance must include exactly one required check ${required}`);
    }
  }

  const accepted = evidence.review.decision === "ACCEPTED";
  if (requireAccepted) {
    if (accepted) pass("independent review decision is ACCEPTED");
    else fail("independent review decision must be ACCEPTED");
  }
  if (!accepted) return;
  if (evidence.findings.p0_open === 0 && evidence.findings.p1_open === 0) pass("accepted review has zero open P0 and P1 findings");
  else fail("accepted review requires exactly zero open P0 and P1 findings");
  if (evidence.findings.unresolved_finding_ids.length === 0) pass("accepted review has no unresolved finding IDs");
  else fail("accepted review cannot retain unresolved finding IDs");
  if (evidence.checks.every((item) => item.status === "PASS")) pass("all structured acceptance checks passed");
  else fail("accepted review cannot contain FAIL or NOT_RUN checks");
}

function checkCandidate(reportFile, candidate, expectedVersion, provenanceRef) {
  const context = { baseRevision: "", authorIdentities: [], candidateFile: "" };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile.file, candidate.candidate_ref);
  if (!resolved.ok) {
    fail(`release candidate is unsafe or unresolved: ${resolved.error}`);
    return context;
  }
  context.candidateFile = resolved.file;
  if (canonicalFileDigest(resolved.file) === candidate.candidate_digest) pass("candidate digest matches the exact candidate file");
  else fail("candidate digest does not match the exact candidate file");

  const candidateRecord = readStructuredArtifact(resolved.file, "release candidate");
  if (!candidateRecord) return context;
  checkReleaseCandidateRecord(candidateRecord, candidate, expectedVersion, resolved.relativePath, context);

  let candidateRevision = "";
  try {
    candidateRevision = releaseAcceptanceCandidateRevision(projectRoot, [
      reportFile.relativePath,
      provenanceRef,
    ]);
  } catch (error) {
    fail(`cannot establish the current release candidate revision: ${error.message}`);
  }
  if (candidateRevision && candidate.candidate_revision === candidateRevision) pass("candidate revision matches the exact Git index content excluding its acceptance report");
  else fail("candidate revision does not match the exact Git index content excluding its acceptance report");
  const contamination = releaseCandidateContaminationErrors(projectRoot, [reportFile.relativePath, provenanceRef]);
  if (contamination.length === 0) pass("candidate worktree has no unbound executable or source contamination");
  else contamination.forEach(fail);

  const gitRevision = currentGitRevision(projectRoot);
  const dispatchedRevision = String(args["candidate-git-revision"] || "").toLowerCase();
  if (dispatchedRevision && gitRevision === dispatchedRevision) {
    pass("dispatched candidate Git revision matches checked-out HEAD");
  } else if (args["require-dispatch-binding"]) {
    fail("dispatched candidate Git revision must match checked-out HEAD");
  }

  if (args["candidate-digest"] && args["candidate-digest"] === candidate.candidate_digest) {
    pass("dispatched candidate digest matches structured acceptance");
  } else if (args["require-dispatch-binding"]) {
    fail("dispatched candidate digest does not match structured acceptance");
  }
  return context;
}

function checkAuthorityChecks(fromFile, evidenceChecks) {
  const refs = new Set();
  for (const item of evidenceChecks) {
    const expected = authorityChecks.get(item.check_id);
    if (!expected) {
      fail(`unsupported release acceptance check ${item.check_id || "<missing>"}`);
      continue;
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, item.evidence_ref);
    if (!resolved.ok) {
      fail(`${item.check_id} evidence is unsafe or unresolved: ${resolved.error}`);
      continue;
    }
    if (refs.has(resolved.relativePath)) {
      fail("full_verification and p0_p1_closure must bind distinct authority artifacts");
    }
    refs.add(resolved.relativePath);
    if (canonicalFileDigest(resolved.file) !== item.evidence_digest) {
      fail(`${item.check_id} evidence digest does not match its current file`);
      continue;
    }
    if (item.authority_artifact_type !== expected.artifactType) {
      fail(`${item.check_id} authority artifact type must be ${expected.artifactType}`);
    }
    if (!expected.pathPattern.test(resolved.relativePath)) {
      fail(`${item.check_id} evidence must use its prescribed authority path`);
    }
    if (item.checker !== expected.checker) {
      fail(`${item.check_id} checker must use the prescribed rerunnable command`);
    }
    const authority = readStructuredArtifact(resolved.file, `${item.check_id} authority`);
    if (!authority) continue;
    if (authority.artifact_type === expected.artifactType) {
      pass(`${item.check_id} evidence has authority artifact type ${expected.artifactType}`);
    } else {
      fail(`${item.check_id} evidence artifact_type must be ${expected.artifactType}`);
    }
    if (item.status === "PASS") {
      checkAuthorityReadyState(item.check_id, authority);
      replayAuthorityChecker(item, expected, resolved.relativePath);
    } else {
      pass(`${item.check_id} evidence is current and digest-bound`);
    }
  }
}

function checkReleaseCandidateRecord(record, candidate, expectedVersion, relativePath, context) {
  const requiredFields = [
    "schema_version",
    "artifact_type",
    "candidate_id",
    "candidate_ref",
    "record_digest",
    "release_version",
    "base_revision",
    "author_identities",
    "boundaries",
  ];
  checkExactFields(record, requiredFields, "release candidate record");
  if (record.schema_version === "1.113.0") pass("release candidate record uses schema version 1.113.0");
  else fail("release candidate record schema_version must be 1.113.0");
  if (record.artifact_type === "release_candidate") pass("candidate_ref resolves to a release_candidate artifact");
  else fail("candidate_ref must resolve to artifact_type release_candidate");
  if (/^[a-z0-9][a-z0-9._-]*$/.test(String(record.candidate_id || ""))) pass("release candidate record has a stable candidate_id");
  else fail("release candidate record candidate_id is invalid");
  if (record.candidate_ref === `artifact:${relativePath}`) pass("release candidate record binds its prescribed project path");
  else fail("release candidate record candidate_ref must point to itself");
  if (record.release_version === expectedVersion) pass("release candidate record matches the requested version");
  else fail("release candidate record release_version does not match acceptance");
  if (record.record_digest === evidenceDigest(record, ["record_digest"])) pass("release candidate record digest is canonical");
  else fail("release candidate record digest does not match its structured content");
  if (record.boundaries?.authorizes_release === "No" && record.boundaries?.authorizes_external_effect === "No") {
    pass("release candidate record remains non-authorizing");
  } else {
    fail("release candidate record must not authorize release or an external effect");
  }
  checkExactFields(record.boundaries, ["authorizes_release", "authorizes_external_effect"], "release candidate boundaries");

  const base = String(record.base_revision || "").toLowerCase();
  if (candidate.base_revision === base) pass("acceptance base revision matches the structured candidate record");
  else fail("acceptance base revision does not match the structured candidate record");
  const resolvedBase = resolveCommit(projectRoot, base);
  const head = currentGitRevision(projectRoot);
  if (resolvedBase && resolvedBase === base) pass("candidate base revision resolves to an exact commit");
  else fail("candidate base revision must be a full exact Git commit");
  if (resolvedBase && head && isAncestor(projectRoot, resolvedBase, head)) pass("candidate base revision is an ancestor of checked-out HEAD");
  else fail("candidate base revision must be an ancestor of checked-out HEAD");
  const commitCount = resolvedBase && head ? commitsBetween(projectRoot, resolvedBase, head) : 0;
  if (commitCount > 0) pass(`candidate range contains ${commitCount} commit(s)`);
  else fail("candidate base revision must precede at least one candidate commit");

  const identities = Array.isArray(record.author_identities) ? record.author_identities : [];
  const validIdentities = identities.length > 0
    && identities.every((identity, index) => validateIdentity(identity, `candidate author identity ${index + 1}`));
  if (identities.length === 0) fail("release candidate record requires structured author identities");
  if (new Set(identities.map((identity) => identity?.identity_digest)).size === identities.length) {
    pass("release candidate author identities are unique");
  } else {
    fail("release candidate author identities must be unique");
  }
  const observedEmails = resolvedBase && head ? gitAuthorEmails(projectRoot, resolvedBase, head) : [];
  const recordedEmails = [...new Set(identities.map((identity) => String(identity?.source_control_email || "").toLowerCase()))].sort();
  if (validIdentities && JSON.stringify(recordedEmails) === JSON.stringify(observedEmails)) {
    pass("release candidate author identities match every commit in base..HEAD");
  } else {
    fail("release candidate author identities must exactly match Git authors in base..HEAD");
  }
  context.baseRevision = base;
  context.authorIdentities = identities;
  validatedBaseRevision = base;
}

function checkReviewProvenance(fromFile, evidence, candidateContext) {
  const reviewer = evidence.review?.reviewer_identity;
  const reviewerValid = validateIdentity(reviewer, "reviewer identity");
  const provenanceSource = evidence.review?.provenance || {};
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, provenanceSource.ref);
  if (!resolved.ok) {
    fail(`review provenance is unsafe or unresolved: ${resolved.error}`);
    return;
  }
  if (!resolved.relativePath.startsWith("release-review-provenance/")) {
    fail("review provenance must use release-review-provenance/");
  }
  if (canonicalFileDigest(resolved.file) === provenanceSource.digest) pass("review provenance file is current and digest-bound");
  else fail("review provenance digest does not match its current file");
  const provenance = readStructuredArtifact(resolved.file, "review provenance");
  if (!provenance) return;
  const requiredFields = [
    "schema_version",
    "artifact_type",
    "provenance_id",
    "provenance_digest",
    "reviewer_identity",
    "candidate_author_identities",
    "candidate_ref",
    "candidate_digest",
    "candidate_revision",
    "project_identity",
    "base_revision",
    "review_mode",
    "candidate_authored_by_reviewer",
    "candidate_write_access_during_review",
    "recorded_at",
  ];
  checkExactFields(provenance, requiredFields, "review provenance");
  if (provenance.schema_version === "1.113.0" && provenance.artifact_type === "release_review_provenance") {
    pass("review provenance has the prescribed artifact type and schema version");
  } else {
    fail("review provenance must be a 1.113.0 release_review_provenance artifact");
  }
  if (/^[a-z0-9][a-z0-9._-]*$/.test(String(provenance.provenance_id || ""))) pass("review provenance has a stable provenance_id");
  else fail("review provenance provenance_id is invalid");
  if (provenance.provenance_digest === evidenceDigest(provenance, ["provenance_digest"])) pass("review provenance digest is canonical");
  else fail("review provenance digest does not match its structured content");
  if (provenance.candidate_revision === evidence.candidate?.candidate_revision) {
    pass("review provenance binds the exact candidate revision");
  } else {
    fail("review provenance candidate_revision does not match acceptance");
  }
  const currentProject = projectIdentity(projectRoot);
  const expectedProjectIdentity = {
    kind: currentProject.kind,
    fingerprint: currentProject.fingerprint,
  };
  if (canonicalJson(provenance.project_identity) === canonicalJson(expectedProjectIdentity)) {
    pass("review provenance binds the current project identity");
  } else {
    fail("review provenance project_identity does not match the current project");
  }
  const provenanceReviewerValid = validateIdentity(provenance.reviewer_identity, "review provenance reviewer identity");
  if (reviewerValid && provenanceReviewerValid && canonicalJson(provenance.reviewer_identity) === canonicalJson(reviewer)) pass("review provenance binds the exact reviewer identity");
  else fail("review provenance reviewer identity does not match acceptance");
  if (canonicalJson(sortIdentities(provenance.candidate_author_identities)) === canonicalJson(sortIdentities(candidateContext.authorIdentities))) {
    pass("review provenance binds the exact candidate author identities");
  } else {
    fail("review provenance candidate author identities do not match the candidate record");
  }
  for (const [field, expected] of [
    ["candidate_ref", evidence.candidate?.candidate_ref],
    ["candidate_digest", evidence.candidate?.candidate_digest],
    ["base_revision", candidateContext.baseRevision],
    ["recorded_at", evidence.review?.reviewed_at],
  ]) {
    if (provenance[field] === expected) pass(`review provenance ${field} matches acceptance`);
    else fail(`review provenance ${field} does not match acceptance`);
  }
  if (provenance.review_mode === "INDEPENDENT_READ_ONLY"
    && provenance.candidate_authored_by_reviewer === "No"
    && provenance.candidate_write_access_during_review === "No") {
    pass("review provenance records an independent read-only review context");
  } else {
    fail("accepted review provenance must be independent, read-only, and non-authoring");
  }
  const authorEmails = new Set(candidateContext.authorIdentities.map(identityEmail));
  const authorSubjects = new Set(candidateContext.authorIdentities.map(identitySubject));
  const authorDigests = new Set(candidateContext.authorIdentities.map((identity) => String(identity?.identity_digest || "")));
  const reviewerDistinct = reviewerValid
    && !authorEmails.has(identityEmail(reviewer))
    && !authorSubjects.has(identitySubject(reviewer))
    && !authorDigests.has(String(reviewer.identity_digest || ""));
  if (reviewerDistinct) {
    pass("reviewer structured identity is distinct from every candidate author");
  } else {
    fail("reviewer identity must be distinct from every candidate author identity");
  }
}

function checkAuthorityReadyState(checkId, authority) {
  if (checkId === "full_verification") {
    const errors = fullVerificationAuthorityErrors(authority);
    if (errors.length === 0) pass("full_verification authority binds one exact successful npm run verify result");
    else errors.forEach((error) => fail(`full_verification PASS ${error}`));
  } else if (checkId === "p0_p1_closure") {
    if (authority.completion_state === "COMPLETION_EVIDENCE_READY" && authority.can_claim_complete === "Yes") {
      pass("p0_p1_closure authority is COMPLETION_EVIDENCE_READY");
    } else {
      fail("p0_p1_closure PASS requires ready completion evidence that can claim complete");
    }
  }
}

function replayAuthorityChecker(item, expected, relativePath) {
  const result = spawnSync(process.execPath, [
    path.join(scriptDir, expected.script),
    projectRoot,
    "--report",
    relativePath,
    ...expected.args,
  ], {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 32,
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GIT_PAGER: "cat",
    },
  });
  if (result.status === 0) pass(`${item.check_id} prescribed authority checker replay passed`);
  else fail(`${item.check_id} prescribed authority checker replay failed: ${firstUsefulLine(result.stderr || result.stdout)}`);
}

function readStructuredArtifact(file, label) {
  try {
    if (/\.json$/i.test(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
    const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
    if (extracted?.ok) return extracted.value;
    fail(`${label} requires a valid Machine-Readable Evidence block`);
  } catch (error) {
    fail(`${label} is not valid structured evidence: ${error.message}`);
  }
  return null;
}

function validateIdentity(identity, label) {
  const requiredFields = ["principal_type", "subject_id", "issuer", "source_control_email", "identity_digest"];
  if (!identity || typeof identity !== "object" || Array.isArray(identity)) {
    fail(`${label} must be a structured identity`);
    return false;
  }
  const exact = checkExactFields(identity, requiredFields, label);
  const typeValid = new Set(["HUMAN", "AGENT", "SERVICE"]).has(identity.principal_type);
  if (!typeValid) fail(`${label} principal_type is invalid`);
  const subject = String(identity.subject_id || "");
  const issuer = String(identity.issuer || "");
  const email = String(identity.source_control_email || "");
  const concrete = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{2,127}$/.test(subject)
    && /^[A-Za-z0-9][A-Za-z0-9._:@/-]{1,127}$/.test(issuer)
    && /^[^\s@]+@[^\s@]+$/.test(email)
    && !/^(?:unknown|n\/?a|none|independent-reviewer)$/i.test(subject);
  if (!concrete) fail(`${label} must contain concrete issuer, subject, and source-control identity`);
  const digestValid = identity.identity_digest === evidenceDigest(identity, ["identity_digest"]);
  if (digestValid) pass(`${label} digest is canonical`);
  else fail(`${label} identity_digest does not match its structured content`);
  return exact && typeValid && concrete && digestValid;
}

function checkExactFields(value, requiredFields, label) {
  const actual = Object.keys(value || {}).sort();
  const expected = [...requiredFields].sort();
  if (JSON.stringify(actual) === JSON.stringify(expected)) return true;
  fail(`${label} fields must be exactly: ${requiredFields.join(", ")}`);
  return false;
}

function sortIdentities(value) {
  return Array.isArray(value)
    ? [...value].sort((left, right) => String(left?.identity_digest || "").localeCompare(String(right?.identity_digest || "")))
    : [];
}

function identityEmail(identity) {
  return String(identity?.source_control_email || "").trim().toLowerCase();
}

function identitySubject(identity) {
  return `${String(identity?.issuer || "").trim().toLowerCase()}\u0000${String(identity?.subject_id || "").trim().toLowerCase()}`;
}

function canonicalStateLine(value) {
  for (const line of String(value || "").split(/\r?\n/)) {
    const normalized = line.trim().replace(/^`|`$/g, "").replace(/\.$/, "");
    if (["ACCEPTED", "REJECTED", "BLOCKED"].includes(normalized)) return normalized;
  }
  return "";
}

function readBundledSchema() {
  const bundled = path.resolve(scriptDir, "..", "schemas", "artifacts", "release-acceptance.schema.json");
  const installed = path.join(projectRoot, ".intentos", "schemas", "artifacts", "release-acceptance.schema.json");
  const schemaFile = fs.existsSync(bundled) ? bundled : installed;
  if (!schemaFile || !fs.existsSync(schemaFile)) {
    fail("release acceptance schema is missing");
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  } catch (error) {
    fail(`release acceptance schema is invalid JSON: ${error.message}`);
    return null;
  }
}

function safeProjectFile(root, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath) || !/\.md$/i.test(relativePath)) {
    return { ok: false, error: "report must be a project-relative Markdown path" };
  }
  let canonicalRoot;
  try {
    canonicalRoot = fs.realpathSync(root);
  } catch (error) {
    return { ok: false, error: `project root cannot be resolved: ${error.message}` };
  }
  const file = path.resolve(canonicalRoot, relativePath);
  const relative = path.relative(canonicalRoot, file);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(file)) {
    return { ok: false, error: "report does not resolve inside the project" };
  }
  try {
    let cursor = file;
    while (cursor !== canonicalRoot) {
      if (fs.lstatSync(cursor).isSymbolicLink()) return { ok: false, error: "report path must not contain symlinks" };
      cursor = path.dirname(cursor);
    }
    if (!fs.lstatSync(file).isFile()) return { ok: false, error: "report must be a regular file" };
  } catch (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, file, relativePath: relative.replaceAll(path.sep, "/"), error: "" };
}

function currentGitRevision(root) {
  const result = runGit(root, ["rev-parse", "--verify", "HEAD^{commit}"]);
  return result.status === 0 ? result.stdout.trim().toLowerCase() : "";
}

function resolveCommit(root, revision) {
  if (!/^[a-f0-9]{40,64}$/.test(String(revision || ""))) return "";
  const result = runGit(root, ["rev-parse", "--verify", `${revision}^{commit}`]);
  return result.status === 0 ? result.stdout.trim().toLowerCase() : "";
}

function isAncestor(root, base, head) {
  return runGit(root, ["merge-base", "--is-ancestor", base, head]).status === 0;
}

function commitsBetween(root, base, head) {
  const result = runGit(root, ["rev-list", "--count", `${base}..${head}`]);
  return result.status === 0 ? Number.parseInt(result.stdout.trim(), 10) || 0 : 0;
}

function gitAuthorEmails(root, base, head) {
  const result = runGit(root, ["log", "--format=%ae", `${base}..${head}`]);
  if (result.status !== 0) return [];
  return [...new Set(result.stdout.split(/\r?\n/).map((item) => item.trim().toLowerCase()).filter(Boolean))].sort();
}

function runGit(root, gitArgs) {
  return spawnSync("git", ["-C", root, ...gitArgs], {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GIT_PAGER: "cat",
    },
  });
}

function packageVersion(root) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
  } catch {
    return "";
  }
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!quiet) console.log(`PASS ${message}`);
}

function fail(message) {
  failures += 1;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "unknown checker failure";
}
