import fs from "node:fs";
import path from "node:path";

import { canonicalJson, evidenceDigest, validateVersionedArtifact } from "./artifact-schema.mjs";
import { validateNativeRuleClassification } from "./native-rule-extraction.mjs";

const artifactType = "native_rule_block_decisions";
const schemaVersion = "1.0.0";
const maximumArtifactBytes = 16 * 1024 * 1024;
const bindingFields = [
  ["project_binding", "projectBinding"],
  ["goal_digest", "goalDigest"],
  ["project_fact_digest", "projectFactDigest"],
  ["guidance_digest", "guidanceDigest"],
  ["authority_inventory_digest", "authorityInventoryDigest"],
  ["source_revision", "sourceRevision"],
];
const decisionDispositions = new Set([
  "PRESERVE_AS_CONTEXT",
  "RESOLVED_NON_RULE",
  "CLASSIFY_AS_RULE",
]);
const ruleClasses = new Set([
  "BUSINESS_FACT",
  "PRODUCTION_CONTROL",
  "ENGINEERING_BASELINE",
  "WORKFLOW_RULE",
  "HISTORICAL_NOTE",
  "UNKNOWN_AUTHORITY",
]);
const confidenceValues = new Set(["HIGH", "MEDIUM", "LOW"]);
const classificationFields = [
  "rule_class",
  "authority",
  "default_handling",
  "preserve_or_replace",
  "reason",
  "risk_surfaces",
  "target_action",
  "confidence",
];

export function createNativeRuleBlockDecisionArtifact(options = {}) {
  const binding = options.binding || {};
  const base = {
    schema_version: schemaVersion,
    artifact_type: artifactType,
    project_binding: binding.projectBinding || {},
    goal_digest: String(binding.goalDigest || "N/A"),
    project_fact_digest: String(binding.projectFactDigest || "N/A"),
    guidance_digest: String(binding.guidanceDigest || "N/A"),
    authority_inventory_digest: String(binding.authorityInventoryDigest || "N/A"),
    source_revision: String(binding.sourceRevision || "N/A"),
    decisions: Array.isArray(options.decisions) ? options.decisions : [],
    boundary: {
      writes_target_files: "No",
      authorizes_apply: "No",
      authorizes_activation: "No",
      authorizes_release_or_production: "No",
    },
  };
  return { ...base, decision_digest: evidenceDigest(base, []) };
}

export function readNativeRuleBlockDecisionArtifact(decisionPath, expectedBinding = {}, options = {}) {
  if (!decisionPath) return emptyResolution("NOT_PROVIDED");
  const resolvedPath = path.resolve(decisionPath);
  let artifact;
  try {
    const stat = fs.lstatSync(resolvedPath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      return invalidResolution(resolvedPath, ["decision artifact must be a regular non-symlink file"]);
    }
    if (stat.size > maximumArtifactBytes) {
      return invalidResolution(resolvedPath, [`decision artifact exceeds ${maximumArtifactBytes} bytes`]);
    }
    artifact = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    return invalidResolution(resolvedPath, [`decision artifact cannot be read: ${error.message}`]);
  }

  const structural = validateVersionedArtifact(artifact, options.schema, {
    label: "native rule block decisions",
    requireCurrent: true,
  });
  const errors = [
    ...structural.errors,
    ...validateArtifact(artifact, expectedBinding),
  ];
  if (errors.length > 0) return invalidResolution(resolvedPath, errors, artifact);
  return {
    state: "CURRENT",
    artifactRef: `external:${path.basename(resolvedPath)}`,
    artifactPath: resolvedPath,
    artifactDigest: artifact.decision_digest,
    decisionsDeclared: artifact.decisions.length,
    decisionsApplied: 0,
    errors: [],
    appliedDecisions: [],
    artifact,
  };
}

export function applyNativeRuleBlockDecisions(extractions, resolution) {
  const sourceExtractions = Array.isArray(extractions) ? extractions : [];
  if (resolution?.state !== "CURRENT") {
    return { extractions: sourceExtractions, resolution: publicResolution(resolution) };
  }

  const ledgerById = new Map();
  for (const extraction of sourceExtractions) {
    const sourceFile = extraction.coverage?.source_file || "";
    for (const block of extraction.coverage?.block_ledger || []) {
      if (ledgerById.has(block.block_id)) {
        return invalidApplication(sourceExtractions, resolution, [`duplicate current block id: ${block.block_id}`]);
      }
      ledgerById.set(block.block_id, { sourceFile, block, extraction });
    }
  }

  const errors = [];
  const decisionsById = new Map();
  for (const decision of resolution.artifact.decisions) {
    if (decisionsById.has(decision.block_id)) {
      errors.push(`duplicate decision for block ${decision.block_id}`);
      continue;
    }
    decisionsById.set(decision.block_id, decision);
    const current = ledgerById.get(decision.block_id);
    if (!current) {
      errors.push(`decision block is not present in the current ledger: ${decision.block_id}`);
      continue;
    }
    if (current.sourceFile !== decision.source_file) {
      errors.push(`decision source_file does not match current block ${decision.block_id}`);
    }
    if (current.block.block_digest !== decision.block_digest) {
      errors.push(`decision block_digest does not match current block ${decision.block_id}`);
    }
    if (current.block.disposition !== "NEEDS_REVIEW") {
      errors.push(`decision may only resolve NEEDS_REVIEW blocks: ${decision.block_id}`);
    }
    if (decision.disposition === "CLASSIFY_AS_RULE") {
      const unresolved = unresolvedBlockFor(current.extraction.coverage || {}, current.block);
      const semanticErrors = validateNativeRuleClassification({
        ...decision.classification,
        source_file: current.sourceFile,
        source_excerpt: unresolved?.excerpt || current.block.context_heading,
        context_heading: current.block.context_heading,
      });
      errors.push(...semanticErrors.map((error) => `decision ${decision.block_id} ${error}`));
    }
  }
  if (errors.length > 0) return invalidApplication(sourceExtractions, resolution, errors);

  const transformed = sourceExtractions.map((extraction) => applyToExtraction(extraction, decisionsById));
  const appliedDecisions = resolution.artifact.decisions.map((decision) => ({
    block_id: decision.block_id,
    block_digest: decision.block_digest,
    source_file: decision.source_file,
    disposition: decision.disposition,
  }));
  return {
    extractions: transformed,
    resolution: {
      ...publicResolution(resolution),
      state: "APPLIED",
      decisionsApplied: appliedDecisions.length,
      appliedDecisions,
    },
  };
}

function applyToExtraction(extraction, decisionsById) {
  const coverage = extraction.coverage || {};
  const rules = [...(extraction.rules || [])];
  const blockLedger = (coverage.block_ledger || []).map((block) => {
    const decision = decisionsById.get(block.block_id);
    if (!decision) return block;
    const unresolved = unresolvedBlockFor(coverage, block);
    if (decision.disposition === "CLASSIFY_AS_RULE") {
      rules.push({
        source_file: coverage.source_file,
        source_start_line: block.source_start_line,
        source_end_line: block.source_end_line,
        source_excerpt: unresolved?.excerpt || block.context_heading,
        context_heading: block.context_heading,
        detected_terms: [],
        ...decision.classification,
      });
    }
    return {
      ...block,
      disposition: ledgerDisposition(decision.disposition, block.rule_count),
      rule_count: Number(block.rule_count || 0) + (decision.disposition === "CLASSIFY_AS_RULE" ? 1 : 0),
      reason: `project-bound decision ${decision.disposition}: ${decision.reason}`,
    };
  });
  const resolvedBlocks = blockLedger.filter((block) => decisionsById.has(block.block_id));
  const unresolvedBlocks = [
    ...(coverage.unclassified_blocks || []),
    ...(coverage.skipped_blocks || []),
    ...(coverage.low_signal_blocks || []),
  ].filter((item) => resolvedBlocks.some((block) => rangesIntersect(item, block)));
  const keepUnresolved = (item) => !resolvedBlocks.some((block) => rangesIntersect(item, block));
  const warningPrefixes = new Set(
    unresolvedBlocks.map((block) => `${coverage.source_file}:${block.source_start_line}-${block.source_end_line}`),
  );
  return {
    rules,
    coverage: {
      ...coverage,
      rules_extracted: rules.length,
      unclassified_blocks: (coverage.unclassified_blocks || []).filter(keepUnresolved),
      skipped_blocks: (coverage.skipped_blocks || []).filter(keepUnresolved),
      low_signal_blocks: (coverage.low_signal_blocks || []).filter(keepUnresolved),
      parser_warnings: (coverage.parser_warnings || []).filter(
        (warning) => ![...warningPrefixes].some((prefix) => String(warning).startsWith(prefix)),
      ),
      block_ledger: blockLedger,
    },
  };
}

function unresolvedBlockFor(coverage, block) {
  return [
    ...(coverage.unclassified_blocks || []),
    ...(coverage.skipped_blocks || []),
    ...(coverage.low_signal_blocks || []),
  ].find((item) => rangesIntersect(item, block));
}

function ledgerDisposition(disposition, existingRuleCount) {
  if (Number(existingRuleCount || 0) > 0) return "EXTRACTED_RULE";
  if (disposition === "CLASSIFY_AS_RULE") return "EXTRACTED_RULE";
  if (disposition === "RESOLVED_NON_RULE") return "RESOLVED_NON_RULE";
  return "PRESERVED_CONTEXT";
}

function validateArtifact(artifact, expectedBinding) {
  const errors = [];
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) return ["decision artifact must be an object"];
  if (artifact.schema_version !== schemaVersion) errors.push(`schema_version must be ${schemaVersion}`);
  if (artifact.artifact_type !== artifactType) errors.push(`artifact_type must be ${artifactType}`);
  const { decision_digest: suppliedDigest, ...base } = artifact;
  if (suppliedDigest !== evidenceDigest(base, [])) errors.push("decision_digest is not canonical");
  for (const [artifactField, bindingField] of bindingFields) {
    const actual = artifact[artifactField];
    const expected = expectedBinding[bindingField];
    const matches = artifactField === "project_binding"
      ? canonicalJson(actual) === canonicalJson(expected)
      : actual === expected;
    if (!matches) errors.push(`${artifactField} does not match the current project assessment`);
  }
  if (!Array.isArray(artifact.decisions)) {
    errors.push("decisions must be an array");
  } else {
    artifact.decisions.forEach((decision, index) => errors.push(...validateDecision(decision, index)));
  }
  if (artifact.boundary?.writes_target_files !== "No"
    || artifact.boundary?.authorizes_apply !== "No"
    || artifact.boundary?.authorizes_activation !== "No"
    || artifact.boundary?.authorizes_release_or_production !== "No") {
    errors.push("decision boundary must deny writes, apply, activation, release, and production authority");
  }
  return errors;
}

function validateDecision(decision, index) {
  const label = `decisions[${index}]`;
  const errors = [];
  if (!decision || typeof decision !== "object" || Array.isArray(decision)) return [`${label} must be an object`];
  if (!/^NB-[a-f0-9]{24}-[1-9][0-9]*$/.test(String(decision.block_id || ""))) errors.push(`${label}.block_id is invalid`);
  if (!/^sha256:[a-f0-9]{64}$/.test(String(decision.block_digest || ""))) errors.push(`${label}.block_digest is invalid`);
  if (!safeRelativePath(decision.source_file)) errors.push(`${label}.source_file must be a safe project-relative path`);
  if (!decisionDispositions.has(decision.disposition)) errors.push(`${label}.disposition is invalid`);
  if (!String(decision.reason || "").trim()) errors.push(`${label}.reason is required`);
  if (decision.disposition === "CLASSIFY_AS_RULE") {
    if (!decision.classification || typeof decision.classification !== "object" || Array.isArray(decision.classification)) {
      errors.push(`${label}.classification is required for CLASSIFY_AS_RULE`);
    } else {
      for (const field of classificationFields) {
        if (!String(decision.classification[field] || "").trim()) errors.push(`${label}.classification.${field} is required`);
      }
      if (!ruleClasses.has(decision.classification.rule_class)) errors.push(`${label}.classification.rule_class is invalid`);
      if (!confidenceValues.has(decision.classification.confidence)) errors.push(`${label}.classification.confidence is invalid`);
    }
  } else if (decision.classification !== undefined) {
    errors.push(`${label}.classification is only allowed for CLASSIFY_AS_RULE`);
  }
  return errors;
}

function safeRelativePath(value) {
  const normalized = String(value || "").replaceAll("\\", "/");
  return Boolean(normalized)
    && !path.posix.isAbsolute(normalized)
    && normalized !== "."
    && normalized !== ".."
    && !normalized.startsWith("../")
    && !normalized.includes("/../");
}

function rangesIntersect(left, right) {
  const leftStart = Number(left.source_start_line || 0);
  const leftEnd = Number(left.source_end_line || leftStart);
  const rightStart = Number(right.source_start_line || 0);
  const rightEnd = Number(right.source_end_line || rightStart);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function invalidApplication(extractions, resolution, errors) {
  return {
    extractions,
    resolution: {
      ...publicResolution(resolution),
      state: "INVALID",
      decisionsApplied: 0,
      errors: [...new Set(errors)],
      appliedDecisions: [],
    },
  };
}

function emptyResolution(state) {
  return {
    state,
    artifactRef: "N/A",
    artifactPath: "",
    artifactDigest: "N/A",
    decisionsDeclared: 0,
    decisionsApplied: 0,
    errors: [],
    appliedDecisions: [],
  };
}

function invalidResolution(resolvedPath, errors, artifact = null) {
  return {
    ...emptyResolution("INVALID"),
    artifactRef: `external:${path.basename(resolvedPath)}`,
    artifactPath: resolvedPath,
    artifactDigest: /^sha256:[a-f0-9]{64}$/.test(String(artifact?.decision_digest || ""))
      ? artifact.decision_digest
      : "N/A",
    decisionsDeclared: Array.isArray(artifact?.decisions) ? artifact.decisions.length : 0,
    errors: [...new Set(errors)],
    artifact,
  };
}

function publicResolution(resolution = {}) {
  return {
    state: resolution.state || "NOT_PROVIDED",
    artifactRef: resolution.artifactRef || "N/A",
    artifactDigest: resolution.artifactDigest || "N/A",
    decisionsDeclared: Number(resolution.decisionsDeclared || 0),
    decisionsApplied: Number(resolution.decisionsApplied || 0),
    errors: Array.isArray(resolution.errors) ? resolution.errors : [],
    appliedDecisions: Array.isArray(resolution.appliedDecisions) ? resolution.appliedDecisions : [],
    boundary: {
      writesTargetFiles: "No",
      authorizesApply: "No",
      authorizesActivation: "No",
      authorizesReleaseOrProduction: "No",
    },
  };
}
