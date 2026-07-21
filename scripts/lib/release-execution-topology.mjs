import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { extractMachineReadableEvidence } from "./artifact-schema.mjs";
import { isGovernedWorkflowOutputPath, projectIdentity } from "./evidence-authority.mjs";
import { discoverReleaseWorkflowFacts } from "./release-action-authority.mjs";

export const TOPOLOGY_SCHEMA_VERSION = "1.105.0";
export const PLANE_NAMES = [
  "source_control", "orchestration", "execution_backend",
  "package_transport", "evidence_store", "production_target",
];
export const CRITICAL_CAPABILITIES = [
  "exact_source_identity", "exact_package_identity", "durable_evidence",
  "test_lane", "release_lock", "rollback", "observation", "safe_cleanup",
];

export function digestText(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

export function discoverReleaseTopology(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const intent = String(options.intent || "prepare a safe release path");
  const workflowFacts = discoverReleaseWorkflowFacts(root);
  const files = listProjectFiles(root);
  const workflows = files.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/i.test(file));
  const workflowText = workflows.map((file) => safeRead(path.join(root, file))).join("\n");
  const releaseWorkflowText = workflowFacts.releaseWorkflowFiles
    .map((item) => safeRead(path.join(root, item.relativePath))).join("\n");
  const publishingWorkflows = [...new Set(workflowFacts.releaseWorkflowFiles.map((item) => item.relativePath))];
  const releaseDocs = files.filter((file) => /(release|deploy|rollback|promotion|launch).*(\.md|\.ya?ml)$/i.test(file));
  const docsText = releaseDocs.map((file) => safeRead(path.join(root, file))).join("\n");
  const legacy = readLegacyPolicy(root);
  const legacyChannel = legacy.topology?.package_transport || "";
  const sourceOnly = /^source_only$/i.test(legacyChannel);
  const hasHosted = /runs-on:\s*(ubuntu|macos|windows)-/i.test(workflowText);
  const hasSelfHosted = /runs-on:[^\n]*self-hosted/i.test(workflowText);
  const releaseAuthorityText = sourceOnly ? `${releaseWorkflowText}\n${safeRead(path.join(root, legacy.ref || ""))}` : `${releaseWorkflowText}\n${docsText}`;
  const hasSsh = /\bssh\b|scp\b|rsync\b/i.test(releaseAuthorityText);
  const providerPattern = /(vercel|netlify|cloudflare|firebase|fly\.io|render|railway)/i;
  const submissionPattern = /(app store|testflight|play console|mini.?program|微信小程序)/i;
  const hasObservedProvider = providerPattern.test(releaseWorkflowText);
  const hasProvider = hasObservedProvider || (!sourceOnly && providerPattern.test(docsText));
  const hasObservedSubmission = submissionPattern.test(releaseWorkflowText);
  const hasSubmission = hasObservedSubmission || (!sourceOnly && submissionPattern.test(docsText));
  const hasObservedProductionTarget = /environment:\s*production|deployment[_ -]?target:\s*production|\bdeploy\b[^\n]*(production|prod)\b/i.test(releaseWorkflowText);
  const hasRollback = sourceOnly || /rollback|回滚/i.test(releaseAuthorityText);
  const hasLock = sourceOnly || /concurrency:|flock|release.?lock|发布锁/i.test(releaseAuthorityText);
  const hasObservation = sourceOnly || /monitor|smoke|health.?check|观察|监控/i.test(releaseAuthorityText);
  const sourceEvidence = fs.existsSync(path.join(root, ".git/config")) ? ".git/config" : workflows[0] || "missing";
  const sourceConfidence = fs.existsSync(path.join(root, ".git")) ? "OBSERVED" : "INFERRED";
  const executorClass = hasSelfHosted ? "SELF_HOSTED_CI_RUNNER"
    : hasHosted ? "HOSTED_CI_RUNNER"
      : hasProvider ? "PROVIDER_MANAGED_EXECUTOR"
        : hasSubmission ? "PLATFORM_SUBMISSION_EXECUTOR"
          : "UNKNOWN";
  const executorConfidence = executorClass === "UNKNOWN" ? "UNKNOWN"
    : hasHosted || hasSelfHosted || hasObservedProvider || hasObservedSubmission ? "OBSERVED" : "DECLARED";
  const transportType = sourceOnly ? "SOURCE_ONLY"
    : hasSsh ? "SSH"
    : /upload-artifact|download-artifact/i.test(workflowText) ? "CI_ARTIFACT"
      : hasProvider ? "PROVIDER_NATIVE" : "UNKNOWN";
  const productionType = sourceOnly ? "NO_PRODUCTION_TARGET"
    : hasSubmission ? "PLATFORM_SUBMISSION"
    : hasProvider ? "PROVIDER_TARGET"
      : /production|prod|生产/i.test(docsText + workflowText) ? "PROJECT_TARGET"
        : "UNKNOWN";
  const evidenceRef = sourceOnly ? legacy.ref : workflowFacts.releaseWorkflowFiles[0]?.relativePath || workflows[0] || releaseDocs[0] || "missing";
  const controls = (values) => values.filter(Boolean);

  const planes = {
    source_control: plane("GIT", "current-project-source", sourceConfidence, sourceEvidence, ["revision_identity"]),
    orchestration: plane(workflows.length ? "PROJECT_CI" : "UNKNOWN", workflows[0] || "missing", workflows.length ? "OBSERVED" : "UNKNOWN", workflows[0] || "missing", controls([workflows.length && "workflow_state"])),
    execution_backend: {
      ...plane(executorClass, executorClass === "UNKNOWN" ? "missing" : executorClass.toLowerCase(), executorConfidence, evidenceRef, controls([hasSelfHosted && "persistent_executor", hasHosted && "ephemeral_workspace"])),
      backend_class: executorClass,
    },
    package_transport: plane(transportType, transportType === "UNKNOWN" ? "missing" : transportType.toLowerCase(), transportType === "UNKNOWN" ? "UNKNOWN" : sourceOnly ? "DECLARED" : "OBSERVED", evidenceRef, controls([hasSsh && "transport_only_not_executor_identity", sourceOnly && "source_only_no_external_transport"])),
    evidence_store: plane(workflows.length ? "PROJECT_AND_CI_EVIDENCE" : "PROJECT_EVIDENCE", "project-evidence", files.some((file) => file.startsWith("evidence/")) ? "OBSERVED" : "DECLARED", files.find((file) => file.startsWith("evidence/")) || releaseDocs[0] || "missing", controls(["redaction_required", "retention_required"])),
    production_target: plane(
      productionType,
      productionType === "UNKNOWN" ? "missing" : productionType.toLowerCase(),
      productionType === "UNKNOWN" ? "UNKNOWN" : sourceOnly || hasObservedProductionTarget || hasObservedProvider || hasObservedSubmission ? "OBSERVED" : "INFERRED",
      sourceOnly ? legacy.ref : hasObservedProductionTarget ? workflows[0] || "missing" : releaseDocs[0] || workflows[0] || "missing",
      controls([hasRollback && "rollback", hasObservation && "observation", sourceOnly && "external_release_blocked"]),
    ),
  };
  const mandatoryCapabilities = [
    capability("exact_source_identity", true, sourceConfidence === "OBSERVED", sourceEvidence),
    capability("exact_package_identity", !sourceOnly, sourceOnly || transportType !== "UNKNOWN", evidenceRef),
    capability("durable_evidence", true, planes.evidence_store.confidence !== "UNKNOWN", planes.evidence_store.evidence_ref),
    capability("test_lane", true, /preview|staging|testflight|review|sandbox/i.test(docsText + workflowText), evidenceRef),
    capability("release_lock", true, hasLock, evidenceRef),
    capability("rollback", true, hasRollback, releaseDocs[0] || "missing"),
    capability("observation", true, hasObservation, releaseDocs[0] || "missing"),
    capability("safe_cleanup", true, /cleanup|retention|清理|保留/i.test(docsText + workflowText), evidenceRef),
  ];
  const executionInspectionIssues = [
    ...workflowFacts.errors,
    ...workflowFacts.releaseWorkflowFiles.flatMap((item) => item.unresolvedIndirectExecutions.map((reason) => `${item.relativePath}: ${reason}`)),
  ];
  const conflicts = [...legacy.conflicts];
  for (const issue of executionInspectionIssues) conflicts.push(`release execution graph unresolved: ${issue}`);
  if (publishingWorkflows.length > 1) {
    conflicts.push(`multiple active publish-capable workflows detected: ${publishingWorkflows.join(", ")}`);
  }
  if (legacy.topology?.execution_backend
    && legacy.topology.execution_backend !== "UNKNOWN"
    && planes.execution_backend.confidence === "OBSERVED"
    && legacy.topology.execution_backend !== planes.execution_backend.backend_class) {
    conflicts.push(`legacy execution backend ${legacy.topology.execution_backend} conflicts with observed ${planes.execution_backend.backend_class}`);
  }
  const missingFacts = PLANE_NAMES.filter((name) => ["INFERRED", "UNKNOWN"].includes(planes[name].confidence));
  const missingCapabilities = mandatoryCapabilities.filter((item) => item.required === "Yes" && item.satisfied !== "Yes");
  let state = "KEEP_CURRENT_TOPOLOGY";
  if (executionInspectionIssues.length || missingFacts.length) state = "NEEDS_PROJECT_FACT_DISCOVERY";
  else if (missingCapabilities.length) state = "BLOCKED_BY_MISSING_CAPABILITY";
  else if (conflicts.length) state = "NEEDS_PROJECT_FACT_DISCOVERY";
  const plainSummary = state === "KEEP_CURRENT_TOPOLOGY"
    ? "The current release path has the required evidence and should be preserved."
    : state === "BLOCKED_BY_MISSING_CAPABILITY"
      ? "The release path is missing a required safety capability; Codex should prepare the bounded correction."
      : "Codex needs to inspect missing project or provider facts before recommending a release-path change.";
  const userInputClass = missingFacts.some((name) => ["production_target", "execution_backend"].includes(name))
    ? "EXTERNAL_FACT_NEEDED" : "NO_USER_ACTION";
  const topology = {
    schema_version: TOPOLOGY_SCHEMA_VERSION,
    artifact_type: "release_execution_topology",
    topology_ref: String(options.topologyRef || "release-execution-topologies/generated.md"),
    topology_digest: "sha256:" + "0".repeat(64),
    intent,
    intent_digest: digestText(intent),
    project_identity: projectIdentity(root),
    planes,
    mandatory_capabilities: mandatoryCapabilities,
    source_chain: sourceChainFor(root, planes, legacy),
    conflicts,
    recommendation: {
      state,
      plain_summary: plainSummary,
      selected_candidate: state === "KEEP_CURRENT_TOPOLOGY" ? "current_topology" : "pending_fact_discovery",
      rejected_candidates: [],
      user_input_class: userInputClass,
    },
    legacy_compatibility: {
      release_channel_policy_ref: legacy.ref,
      translated: legacy.translated ? "Yes" : "No",
      can_establish_readiness: "No",
    },
    boundaries: boundaries(),
    outcome: state === "KEEP_CURRENT_TOPOLOGY" ? "RELEASE_TOPOLOGY_RECORDED" : "RELEASE_TOPOLOGY_BLOCKED",
  };
  topology.topology_digest = topologyDigest(topology);
  return topology;
}

export function topologyDigest(topology) {
  const copy = structuredClone(topology);
  delete copy.topology_digest;
  return digestText(JSON.stringify(sortObject(copy)));
}

export function translateLegacyReleaseChannelPolicy(evidence) {
  if (!evidence || evidence.artifact_type !== "release_channel_policy") return null;
  const channel = evidence.effective_release_channel?.channel || "unknown";
  const runner = evidence.github_actions_billing_profile?.runner_type || "unknown";
  return {
    source_control: evidence.source_identity?.source_ref_role || "unknown",
    orchestration: evidence.github_actions_policy?.release_workflow_detected === "Yes" ? "github_actions" : "unknown",
    execution_backend: runner === "github_hosted" ? "HOSTED_CI_RUNNER" : runner === "self_hosted" ? "SELF_HOSTED_CI_RUNNER" : "UNKNOWN",
    package_transport: channel,
  };
}

function readLegacyPolicy(root) {
  const dir = path.join(root, "release-channel-policies");
  if (!fs.existsSync(dir)) return { ref: "not_available", translated: false, topology: null, conflicts: [] };
  for (const name of fs.readdirSync(dir).filter((item) => item.endsWith(".md")).sort()) {
    const file = path.join(dir, name);
    const extracted = extractMachineReadableEvidence(safeRead(file));
    const topology = extracted?.ok ? translateLegacyReleaseChannelPolicy(extracted.value) : null;
    if (topology) {
      return { ref: `release-channel-policies/${name}`, translated: true, topology, conflicts: [] };
    }
  }
  return { ref: "not_available", translated: false, topology: null, conflicts: [] };
}

function plane(type, identityRef, confidence, evidenceRef, controls) {
  return { type, identity_ref: identityRef, confidence, evidence_ref: evidenceRef, controls };
}

function capability(id, required, satisfied, evidenceRef) {
  return { id, required: required ? "Yes" : "No", satisfied: satisfied ? "Yes" : "No", evidence_ref: evidenceRef };
}

function boundaries() {
  return {
    writes_project_files: "No", approves_implementation: "No",
    approves_release_or_production: "No", executes_release_or_cutover: "No",
    moves_secrets_or_provider_state: "No", embedded_consent_is_authority: "No",
  };
}

function sourceChainFor(root, planes, legacy) {
  const rows = [];
  for (const name of PLANE_NAMES) {
    const item = planes[name];
    const ref = item.evidence_ref;
    const full = ref !== "missing" ? path.join(root, ref) : "";
    const digest = full && fs.existsSync(full) && fs.lstatSync(full).isFile() ? digestText(fs.readFileSync(full)) : digestText(`${name}:${ref}`);
    rows.push({ plane: name, ref, digest, confidence: item.confidence });
  }
  if (legacy.translated) rows.push({ plane: "legacy_policy", ref: legacy.ref, digest: digestText(safeRead(path.join(root, legacy.ref))), confidence: "DECLARED" });
  return rows;
}

function listProjectFiles(root) {
  const output = [];
  const ignored = new Set([".git", "node_modules", ".pnpm-store", "dist", "build", "coverage"]);
  const walk = (dir, depth) => {
    if (depth > 6) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      const relative = path.relative(root, full).split(path.sep).join("/");
      if (isGovernedWorkflowOutputPath(relative)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.isFile()) output.push(relative);
    }
  };
  walk(root, 0);
  return output.sort();
}

function safeRead(file) {
  try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
}
