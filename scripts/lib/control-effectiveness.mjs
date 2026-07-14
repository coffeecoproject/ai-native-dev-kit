import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";
import {
  canonicalFileDigest,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./evidence-authority.mjs";

export const CONTROL_EFFECTIVENESS_STATES = Object.freeze([
  "CONTROL_PROVEN_EFFECTIVE",
  "CONTROL_PROVEN_PARTIAL",
  "CONTROL_NOT_PROVEN",
  "CONTROL_INVALID",
  "NOT_APPLICABLE_WITH_REASON",
]);

export const CONTROL_EFFECTIVENESS_REASON_CODES = Object.freeze([
  "IMPLEMENTATION_UNRESOLVED",
  "REVISION_MISMATCH",
  "ENVIRONMENT_MISMATCH",
  "EVIDENCE_STALE",
  "EVIDENCE_IDENTITY_INCOMPLETE",
  "SCAN_SCOPE_INCOMPLETE",
  "EXCLUSION_UNPROVEN",
  "SEMANTIC_MISMATCH",
  "FAILURE_CAPABILITY_UNPROVEN",
  "RESULT_INTEGRITY_UNPROVEN",
  "UNSAFE_PROBE",
  "CONTROL_EXECUTION_FAILED",
  "PROJECT_AUTHORITY_BLOCK",
  "TECHNICAL_INVESTIGATION_REQUIRED",
]);

export const CONTROL_EFFECTIVENESS_DIMENSIONS = Object.freeze([
  "IMPLEMENTATION_IDENTITY",
  "SEMANTIC_MATCH",
  "SCOPE_COMPLETENESS",
  "EVIDENCE_IDENTITY_AND_FRESHNESS",
  "FAILURE_CAPABILITY",
  "RESULT_INTEGRITY",
  "OPERATIONAL_SAFETY",
]);

export const CONTROL_CLAIM_CATEGORIES = Object.freeze([
  "SOURCE_OR_STRUCTURE_COVERAGE",
  "EVIDENCE_FRESHNESS_AND_IDENTITY",
  "POLICY_OR_SCHEMA_CONFORMANCE",
  "STATIC_CORRECTNESS",
  "RUNTIME_BEHAVIOR",
  "VISUAL_OR_INTERACTION_REGRESSION",
  "PERFORMANCE_OR_CAPACITY_BUDGET",
  "SECURITY_OR_PERMISSION_BOUNDARY",
  "DATA_INTEGRITY_OR_MIGRATION_SAFETY",
  "RELEASE_ROLLBACK_OR_OPERATIONAL_READINESS",
  "AUDIT_OR_OBSERVABILITY_QUALITY",
  "CUSTOM_PROJECT_OWNED_CLAIM",
]);

const reliancePatterns = [
  /\b(?:gate|checker|check|lint|test|verify|verification|schema|policy|workflow|hook|ci|release|rollback|migration|permission|security|audit)\b/i,
  /(?:门禁|检查器|检查|测试|验证|规范|策略|工作流|钩子|发布|回滚|迁移|权限|安全|审计)/,
];

export function deriveControlEffectivenessRouting({ projectRoot = ".", intent = "", taskImpact = "POSSIBLE_HIGH" } = {}) {
  const candidates = discoverReliedControls(projectRoot, intent);
  const explicitReliance = reliancePatterns.some((pattern) => pattern.test(String(intent || "")));
  const impactReliance = false;
  if (!explicitReliance && !impactReliance) {
    return {
      required: "No",
      routing_result: "NOT_REQUIRED_WITH_REASON",
      reason_codes: [],
      control_candidates: candidates,
      required_claim_ids: [],
      not_required_reason: "The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim.",
      technical_inspection_reason: "",
      technical_terms_required_from_user: "No",
    };
  }
  if (candidates.length === 0) {
    return {
      required: "Unknown",
      routing_result: "TECHNICAL_INSPECTION_REQUIRED",
      reason_codes: ["TECHNICAL_INVESTIGATION_REQUIRED"],
      control_candidates: [],
      required_claim_ids: [],
      not_required_reason: "",
      technical_inspection_reason: "The task appears to rely on a technical control, but no exact implementation and consumer were resolved from current project evidence.",
      technical_terms_required_from_user: "No",
    };
  }
  return {
    required: "Yes",
    routing_result: "REQUIRED_WITH_EVIDENCE",
    reason_codes: [],
    control_candidates: candidates,
    required_claim_ids: candidates.map((item) => item.claim_id),
    not_required_reason: "",
    technical_inspection_reason: "",
    technical_terms_required_from_user: "No",
  };
}

export function discoverReliedControls(projectRoot, intent = "") {
  const root = path.resolve(projectRoot || ".");
  const found = [];
  const packageFile = path.join(root, "package.json");
  if (safeRegularFile(packageFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      for (const [name, command] of Object.entries(pkg.scripts || {})) {
        if (!/(?:check|gate|lint|test|verify|audit|release|migration|policy)/i.test(name)) continue;
        found.push(controlCandidate({
          origin: "PROJECT_NATIVE",
          controlId: `package-script:${name}`,
          ref: "file:package.json",
          consumer: `package-script:${name}`,
          summary: `Project package script ${name}`,
          category: categoryFor(`${name} ${command} ${intent}`),
        }));
      }
    } catch {
      // Invalid project metadata remains an unresolved technical condition in routing.
    }
  }
  for (const relative of projectControlFiles(root)) {
    found.push(controlCandidate({
      origin: relative.startsWith(".intentos/") ? "INTENTOS_NATIVE" : "PROJECT_NATIVE",
      controlId: `file:${relative}`,
      ref: `file:${relative}`,
      consumer: relative,
      summary: `Project control implemented by ${relative}`,
      category: categoryFor(`${relative} ${intent}`),
    }));
  }
  const filtered = explicitCandidateFilter(found, intent);
  const preferred = found.filter((item) => /package-script:(?:gate|check|verify|test)|check-consumer-chain|check-intentos/i.test(item.control_id));
  return uniqueBy(filtered.length > 0 ? filtered : preferred.length > 0 ? preferred : found, (item) => `${item.control_id}:${item.implementation_ref}`).slice(0, 8);
}

export function validateControlEffectivenessEvidence(projectRoot, fromFile, evidence, options = {}) {
  const errors = [];
  const root = path.resolve(projectRoot || ".");
  if (!evidence || evidence.artifact_type !== "control_effectiveness") return { ok: false, errors: ["artifact is not Control Effectiveness evidence"] };
  if (options.taskRef && evidence.task_ref !== options.taskRef) errors.push("Control Effectiveness task_ref does not match the current task");
  if (options.intentDigest && evidence.intent_digest !== options.intentDigest) errors.push("Control Effectiveness intent_digest does not match the current intent");
  if (options.purpose && evidence.assessment_purpose !== options.purpose) errors.push("Control Effectiveness purpose does not match the current consumer");
  const reportRef = normalizeRef(evidence.report_ref);
  const actualRef = path.relative(root, fromFile).split(path.sep).join("/");
  if (reportRef !== actualRef) errors.push("Control Effectiveness report_ref must point to this report");
  const requiredClaimIds = new Set(options.requiredClaimIds || []);
  const claims = new Map();
  for (const claim of evidence.control_claims || []) {
    if (claims.has(claim.claim_id)) errors.push(`duplicate control claim ${claim.claim_id}`);
    claims.set(claim.claim_id, claim);
    errors.push(...validateClaim(root, fromFile, claim));
  }
  for (const claimId of requiredClaimIds) {
    const claim = claims.get(claimId);
    if (!claim) errors.push(`required control claim ${claimId} is missing`);
    else if (claim.state !== "CONTROL_PROVEN_EFFECTIVE") errors.push(`required control claim ${claimId} is not proven effective`);
  }
  const strictest = deriveControlEffectivenessOutcome(evidence.control_claims || [], evidence.required_claim_ids || []);
  if (evidence.outcome !== strictest) errors.push(`Control Effectiveness outcome must be derived as ${strictest}`);
  const sourceRefs = collectControlSourceRefs(evidence);
  const authority = validateEvidenceAuthorityBinding(root, evidence.authority_binding, {
    taskRef: evidence.task_ref,
    intentDigest: evidence.intent_digest,
    sourceRefs,
    fromFile,
  });
  if (!authority.ok) errors.push(...authority.errors.map((error) => `Evidence Authority: ${error}`));
  if (evidence.boundaries?.authorizes_implementation !== "No"
    || evidence.boundaries?.authorizes_writes !== "No"
    || evidence.boundaries?.authorizes_release !== "No"
    || evidence.boundaries?.authorizes_production !== "No"
    || evidence.boundaries?.proves_product_correctness !== "No") {
    errors.push("Control Effectiveness boundaries must remain non-authorizing and must not claim product correctness");
  }
  return { ok: errors.length === 0, errors };
}

export function deriveControlEffectivenessOutcome(claims, requiredClaimIds = []) {
  const required = requiredClaimIds.length > 0
    ? claims.filter((claim) => requiredClaimIds.includes(claim.claim_id))
    : claims;
  if (required.length === 0) return "NOT_APPLICABLE_WITH_REASON";
  const states = new Set(required.map((claim) => claim.state));
  if (states.has("CONTROL_INVALID")) return "CONTROL_INVALID";
  if (states.has("CONTROL_NOT_PROVEN")) return "CONTROL_NOT_PROVEN";
  if (states.has("CONTROL_PROVEN_PARTIAL")) return "CONTROL_PROVEN_PARTIAL";
  if (states.has("NOT_APPLICABLE_WITH_REASON")) return "CONTROL_NOT_PROVEN";
  return "CONTROL_PROVEN_EFFECTIVE";
}

export function validateBoundedControlAdapter(adapter) {
  const errors = [];
  if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) return { ok: false, errors: ["dynamic adapter is required"] };
  const executable = String(adapter.executable || "");
  if (!executable || /(?:^|\/)(?:sh|bash|zsh|fish|cmd|powershell)(?:\.exe)?$/i.test(executable)) errors.push("dynamic adapter executable must be a direct non-shell executable");
  if (!Array.isArray(adapter.arguments) || adapter.arguments.some((arg) => typeof arg !== "string" || /[;&|`\n\r]/.test(arg))) errors.push("dynamic adapter arguments must be a safe argument array without shell control syntax");
  if (!safeRelative(adapter.working_directory)) errors.push("dynamic adapter working_directory must be project-relative");
  if (!Array.isArray(adapter.environment_allowlist)) errors.push("dynamic adapter environment_allowlist must be an array");
  if (!Number.isInteger(adapter.timeout_ms) || adapter.timeout_ms < 1 || adapter.timeout_ms > 3_600_000) errors.push("dynamic adapter timeout_ms must be between 1 and 3600000");
  if (adapter.production_prohibited !== "Yes") errors.push("dynamic adapter must prohibit production");
  if (adapter.network_required === "Yes" || adapter.secrets_required === "Yes") errors.push("strict automatic probes cannot require network or secrets");
  if (adapter.cleanup_required === "Yes" && !String(adapter.cleanup_owner || "").trim()) errors.push("dynamic adapter cleanup owner is required");
  return { ok: errors.length === 0, errors };
}

export function loadControlEffectivenessReport(projectRoot, reportRef, options = {}) {
  const root = path.resolve(projectRoot || ".");
  const resolved = resolveAuthoritativeEvidenceReference(root, options.fromFile || "", reportRef, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, errors: [`Control Effectiveness report is unsafe or unresolved: ${resolved.error}`] };
  if (!/^control-effectiveness-reports\/[a-zA-Z0-9._/-]+\.md$/.test(resolved.relativePath.replace(/^\.intentos\//, ""))) {
    return { ok: false, errors: ["Control Effectiveness report must be under control-effectiveness-reports/"] };
  }
  const schema = loadSchema(root, "schemas/artifacts/control-effectiveness.schema.json");
  const content = fs.readFileSync(resolved.file, "utf8");
  const checked = validateEvidenceBlock(content, schema, resolved.relativePath, { require: true, digestField: "report_digest" });
  if (!checked.ok) return { ok: false, errors: checked.errors };
  const semantic = validateControlEffectivenessEvidence(root, resolved.file, checked.value, options);
  return { ...semantic, evidence: checked.value, file: resolved.file, relativePath: resolved.relativePath };
}

export function controlEffectivenessBinding({ required = false, report = null, requiredClaimIds = [], reason = "" } = {}) {
  if (!required) {
    return {
      requirement: "NOT_REQUIRED",
      status: "NOT_REQUIRED",
      report_ref: "N/A",
      report_digest: "N/A",
      required_claim_ids: [],
      assessment_outcome: "NOT_APPLICABLE_WITH_REASON",
      current_project_match: "N/A",
      current_task_match: "N/A",
      current_intent_match: "N/A",
      checker: "N/A",
      reason: reason || "No strict current claim relies on a technical control.",
    };
  }
  if (!report?.ok) {
    return {
      requirement: "REQUIRED",
      status: "BLOCKED",
      report_ref: report?.relativePath ? `artifact:${report.relativePath}` : "N/A",
      report_digest: report?.evidence?.report_digest || "N/A",
      required_claim_ids: requiredClaimIds,
      assessment_outcome: report?.evidence?.outcome || "CONTROL_NOT_PROVEN",
      current_project_match: "No",
      current_task_match: "No",
      current_intent_match: "No",
      checker: "scripts/check-control-effectiveness.mjs --require-effective",
      reason: report?.errors?.[0] || reason || "Required control effectiveness evidence is unavailable.",
    };
  }
  return {
    requirement: "REQUIRED",
    status: "VERIFIED",
    report_ref: `artifact:${report.relativePath}`,
    report_digest: report.evidence.report_digest,
    required_claim_ids: requiredClaimIds,
    assessment_outcome: report.evidence.outcome,
    current_project_match: "Yes",
    current_task_match: "Yes",
    current_intent_match: "Yes",
    checker: "scripts/check-control-effectiveness.mjs --require-effective",
    reason: "The exact current report proves every relied-on bounded control claim.",
  };
}

export function resolveCurrentControlEffectivenessBinding(projectRoot, options = {}) {
  if (options.required === false) return controlEffectivenessBinding({ required: false, reason: options.reason });
  const root = path.resolve(projectRoot || ".");
  const candidates = options.reportRef ? [String(options.reportRef)] : reportCandidates(root);
  const failures = [];
  for (const ref of candidates) {
    const report = loadControlEffectivenessReport(root, ref, options);
    if (report.ok && report.evidence.outcome === "CONTROL_PROVEN_EFFECTIVE") {
      return controlEffectivenessBinding({
        required: true,
        report,
        requiredClaimIds: (options.requiredClaimIds || []).length > 0
          ? options.requiredClaimIds
          : report.evidence.required_claim_ids || [],
      });
    }
    failures.push(report);
  }
  const best = failures[0] || { ok: false, errors: ["No current Control Effectiveness report exists."] };
  return controlEffectivenessBinding({ required: true, report: best, requiredClaimIds: options.requiredClaimIds || [] });
}

export function validateControlEffectivenessBinding(projectRoot, binding, options = {}) {
  const errors = [];
  if (!binding || typeof binding !== "object" || Array.isArray(binding)) return { ok: false, errors: ["control_effectiveness_binding is required"] };
  if (binding.requirement === "NOT_REQUIRED") {
    if (options.required) errors.push("control_effectiveness_binding cannot be NOT_REQUIRED for a relied-on control");
    if (binding.status !== "NOT_REQUIRED" || binding.report_ref !== "N/A" || binding.report_digest !== "N/A") errors.push("not-required control binding must not fabricate report authority");
    return { ok: errors.length === 0, errors };
  }
  if (binding.requirement !== "REQUIRED") return { ok: false, errors: ["control_effectiveness_binding.requirement must be REQUIRED or NOT_REQUIRED"] };
  if (binding.status === "BLOCKED" && options.allowBlocked === true) {
    if (binding.assessment_outcome === "CONTROL_PROVEN_EFFECTIVE") {
      errors.push("blocked control binding cannot claim CONTROL_PROVEN_EFFECTIVE");
    }
    const hasNoReport = binding.report_ref === "N/A" && binding.report_digest === "N/A";
    const hasPartialReport = binding.report_ref === "N/A" || binding.report_digest === "N/A";
    if (hasPartialReport && !hasNoReport) {
      errors.push("blocked control binding must provide both report ref and digest or neither");
    } else if (!hasNoReport) {
      const report = loadControlEffectivenessReport(projectRoot, binding.report_ref, {
        fromFile: options.fromFile,
        taskRef: options.taskRef,
        intentDigest: options.intentDigest,
        requiredClaimIds: binding.required_claim_ids,
      });
      if (!report.ok) errors.push(...report.errors);
      else {
        if (binding.report_digest !== report.evidence.report_digest) errors.push("control_effectiveness_binding.report_digest is stale");
        if (binding.assessment_outcome !== report.evidence.outcome) errors.push("control_effectiveness_binding outcome disagrees with the report");
      }
    }
    return { ok: errors.length === 0, errors };
  }
  const report = loadControlEffectivenessReport(projectRoot, binding.report_ref, {
    fromFile: options.fromFile,
    taskRef: options.taskRef,
    intentDigest: options.intentDigest,
    requiredClaimIds: binding.required_claim_ids,
  });
  if (!report.ok) errors.push(...report.errors);
  else {
    if (binding.report_digest !== report.evidence.report_digest) errors.push("control_effectiveness_binding.report_digest is stale");
    if (binding.assessment_outcome !== report.evidence.outcome) errors.push("control_effectiveness_binding outcome disagrees with the report");
    if (binding.status !== "VERIFIED" || report.evidence.outcome !== "CONTROL_PROVEN_EFFECTIVE") errors.push("required control binding must be VERIFIED with effective proof");
  }
  return { ok: errors.length === 0, errors, report };
}

export function controlEffectivenessBindingSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "requirement", "status", "report_ref", "report_digest", "required_claim_ids",
      "assessment_outcome", "current_project_match", "current_task_match",
      "current_intent_match", "checker", "reason",
    ],
    properties: {
      requirement: { enum: ["REQUIRED", "NOT_REQUIRED"] },
      status: { enum: ["VERIFIED", "BLOCKED", "NOT_REQUIRED"] },
      report_ref: { type: "string", minLength: 1 },
      report_digest: { type: "string", minLength: 1 },
      required_claim_ids: { type: "array", uniqueItems: true, items: { type: "string", minLength: 1 } },
      assessment_outcome: { enum: CONTROL_EFFECTIVENESS_STATES },
      current_project_match: { enum: ["Yes", "No", "N/A"] },
      current_task_match: { enum: ["Yes", "No", "N/A"] },
      current_intent_match: { enum: ["Yes", "No", "N/A"] },
      checker: { type: "string", minLength: 1 },
      reason: { type: "string", minLength: 1 },
    },
  };
}

function validateClaim(root, fromFile, claim) {
  const errors = [];
  const expectedDigest = evidenceDigest(claim, ["claim_digest"]);
  if (claim.claim_digest !== expectedDigest) errors.push(`${claim.claim_id} claim_digest is not canonical`);
  for (const binding of claim.implementation_bindings || []) {
    const resolved = resolveAuthoritativeEvidenceReference(root, fromFile, binding.ref);
    if (!resolved.ok) {
      errors.push(`${claim.claim_id} implementation ref is unsafe or unresolved: ${binding.ref}`);
      continue;
    }
    if (binding.digest !== canonicalFileDigest(resolved.file)) errors.push(`${claim.claim_id} implementation digest is stale: ${binding.ref}`);
  }
  for (const ref of claimEvidenceRefs(claim)) {
    const resolved = resolveAuthoritativeEvidenceReference(root, fromFile, ref);
    if (!resolved.ok) errors.push(`${claim.claim_id} evidence ref is unsafe or unresolved: ${ref}`);
  }
  const adapter = claim.dynamic_assessment?.adapter;
  if (claim.dynamic_assessment?.required === "Yes") {
    const validated = validateBoundedControlAdapter(adapter);
    if (!validated.ok) errors.push(...validated.errors.map((error) => `${claim.claim_id} ${error}`));
  }
  const provenDimensions = new Set((claim.effectiveness_dimensions || []).filter((item) => item.state === "PROVEN").map((item) => item.dimension));
  const fullProof = CONTROL_EFFECTIVENESS_DIMENSIONS.every((dimension) => provenDimensions.has(dimension))
    && claim.semantic_assessment.match === "MATCH"
    && claim.scope_assessment.completeness === "COMPLETE"
    && claim.freshness_assessment.status === "CURRENT"
    && (claim.failure_proof.required !== "Yes" || claim.failure_proof.state === "PROVEN")
    && (claim.dynamic_assessment.required !== "Yes" || claim.dynamic_assessment.state === "PROVEN")
    && claim.reason_codes.length === 0;
  if (claim.state === "CONTROL_PROVEN_EFFECTIVE" && !fullProof) errors.push(`${claim.claim_id} cannot be effective with incomplete dimensions, scope, semantics, freshness, failure proof, or dynamic proof`);
  if (claim.state !== "CONTROL_PROVEN_EFFECTIVE" && fullProof) errors.push(`${claim.claim_id} state understates complete effective proof`);
  if (claim.enforcement_level === "ADVISORY" && claim.state === "CONTROL_PROVEN_EFFECTIVE" && claim.consumers.some((consumer) => consumer.strict_reliance === "Yes")) {
    errors.push(`${claim.claim_id} advisory enforcement cannot satisfy a strict blocking consumer`);
  }
  return errors;
}

function collectControlSourceRefs(evidence) {
  return unique([
    ...(evidence.control_claims || []).flatMap((claim) => [
      ...claim.implementation_bindings.map((item) => item.ref),
      ...claimEvidenceRefs(claim),
    ]),
  ].filter((ref) => /^(?:artifact|file):/.test(ref)));
}

function claimEvidenceRefs(claim) {
  return unique([
    ...claim.semantic_assessment.evidence_refs,
    claim.scope_assessment.declared_inventory_ref,
    claim.scope_assessment.observed_inventory_ref,
    ...claim.scope_assessment.exclusions.map((item) => item.evidence_ref),
    claim.failure_proof.evidence_ref,
    claim.dynamic_assessment.evidence_ref,
    ...claim.effectiveness_dimensions.flatMap((item) => item.evidence_refs),
  ].filter((ref) => /^(?:artifact|file):/.test(ref)));
}

function reportCandidates(root) {
  const found = [];
  for (const dir of [path.join(root, "control-effectiveness-reports"), path.join(root, ".intentos", "control-effectiveness-reports")]) {
    if (!safeDirectory(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = path.join(dir, entry.name);
      found.push({
        ref: `artifact:${path.relative(root, file).split(path.sep).join("/")}`,
        mtime: fs.statSync(file).mtimeMs,
      });
    }
  }
  return found.sort((a, b) => b.mtime - a.mtime || a.ref.localeCompare(b.ref)).map((item) => item.ref);
}

function projectControlFiles(root) {
  const files = [];
  const queue = ["scripts", ".github/workflows", ".intentos/scripts"];
  for (const relativeRoot of queue) {
    const absoluteRoot = path.join(root, relativeRoot);
    if (!safeDirectory(absoluteRoot)) continue;
    for (const entry of walkBounded(absoluteRoot, 4, 400)) {
      const relative = path.relative(root, entry).split(path.sep).join("/");
      if (/(?:check|gate|verify|lint|test|audit|release|migration|policy|workflow)/i.test(relative)) files.push(relative);
    }
  }
  return files;
}

function walkBounded(root, maxDepth, maxFiles) {
  const files = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth || files.length >= maxFiles) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (files.length >= maxFiles) return;
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(file, depth + 1);
      else if (entry.isFile()) files.push(file);
    }
  };
  walk(root, 0);
  return files;
}

function explicitCandidateFilter(candidates, intent) {
  const tokens = String(intent || "").toLowerCase().split(/[^\p{L}\p{N}_-]+/u).filter((token) => token.length > 2);
  if (tokens.length === 0) return [];
  return candidates.filter((item) => tokens.some((token) => `${item.control_id} ${item.consumer} ${item.summary}`.toLowerCase().includes(token)));
}

function controlCandidate({ origin, controlId, ref, consumer, summary, category }) {
  return {
    control_id: controlId,
    claim_id: `claim:${slug(controlId)}`,
    origin,
    implementation_ref: ref,
    consumer,
    summary,
    category,
  };
}

function categoryFor(text) {
  if (/(?:permission|security|auth)/i.test(text)) return "SECURITY_OR_PERMISSION_BOUNDARY";
  if (/(?:migration|database|schema|data)/i.test(text)) return "DATA_INTEGRITY_OR_MIGRATION_SAFETY";
  if (/(?:release|rollback|deploy|production)/i.test(text)) return "RELEASE_ROLLBACK_OR_OPERATIONAL_READINESS";
  if (/(?:runtime|e2e|behavior|test)/i.test(text)) return "RUNTIME_BEHAVIOR";
  if (/(?:lint|type|static|build)/i.test(text)) return "STATIC_CORRECTNESS";
  return "POLICY_OR_SCHEMA_CONFORMANCE";
}

function safeRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function safeDirectory(dir) {
  try {
    const stat = fs.lstatSync(dir);
    return stat.isDirectory() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function safeRelative(value) {
  const input = String(value || "").replaceAll("\\", "/");
  return input === "." || (input.length > 0 && !path.posix.isAbsolute(input) && !input.split("/").includes(".."));
}

function normalizeRef(value) {
  return String(value || "").replace(/^(?:artifact|file):/, "").replaceAll("\\", "/");
}

function slug(value) {
  return String(value || "control").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96) || "control";
}

function unique(values) {
  return [...new Set(values)];
}

function uniqueBy(values, keyFn) {
  const seen = new Set();
  return values.filter((value) => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function digestControlValue(value) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}
