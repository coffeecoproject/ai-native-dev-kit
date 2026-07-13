import fs from "node:fs";
import {
  canonicalFileDigest,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { loadSchema, validateEvidenceBlock } from "./artifact-schema.mjs";
import { topologyDigest } from "./release-execution-topology.mjs";

const readyStates = new Set([
  "KEEP_CURRENT_TOPOLOGY",
  "RECOMMEND_BOUNDED_MIGRATION",
  "RECOMMEND_PROVIDER_ADAPTER",
]);

export function validateReleaseTopologySource(projectRoot, fromFile, source, options = {}) {
  const errors = [];
  if (!source?.ref || !source?.digest) {
    return { ok: false, errors: ["Release Execution Topology ref and digest are required"], evidence: null, resolved: null };
  }
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile || "", source.ref, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, errors: [`Release Execution Topology is unsafe or unresolved: ${resolved.error}`], evidence: null, resolved: null };
  if (canonicalFileDigest(resolved.file) !== source.digest) errors.push("Release Execution Topology file digest does not match current evidence");
  const schema = loadSchema(projectRoot, "schemas/artifacts/release-execution-topology.schema.json");
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), schema, resolved.relativePath, {
    require: true,
    digestField: "topology_digest",
  });
  if (!checked.ok) errors.push(...checked.errors);
  const evidence = checked.value || null;
  if (evidence) {
    if (topologyDigest(evidence) !== evidence.topology_digest) errors.push("Release Execution Topology canonical digest mismatch");
    const current = projectIdentity(projectRoot);
    if (JSON.stringify(evidence.project_identity) !== JSON.stringify(current)) errors.push("Release Execution Topology is stale, copied, or belongs to another project");
    if (options.expectedSourceRevision && evidence.project_identity?.revision !== options.expectedSourceRevision) errors.push("Release Execution Topology source revision does not match the consumer");
    if (options.requireReady && !readyStates.has(evidence.recommendation?.state)) errors.push("Release Execution Topology is not ready for strict release consumption");
    if (evidence.boundaries?.approves_release_or_production !== "No" || evidence.boundaries?.executes_release_or_cutover !== "No") {
      errors.push("Release Execution Topology must remain non-authorizing");
    }
  }
  return { ok: errors.length === 0, errors, evidence, resolved };
}

export function releaseTopologyBindingsAgree(expected = {}, actual = {}) {
  const fields = ["source_revision", "release_candidate_ref", "package_identity_ref", "action_id"];
  return fields.every((field) => {
    if (expected[field] === undefined) return true;
    return normalize(expected[field]) === normalize(actual[field]);
  });
}

function normalize(value) {
  return String(value || "").trim().replace(/^(artifact|file):/i, "");
}
