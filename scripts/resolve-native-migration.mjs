#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  buildNativeAuthoritySourceInventory,
  defaultIgnoredDirs,
  hasProjectSignals,
  partitionNativeAuthorityPaths,
  walkRelativePaths,
} from "./lib/project-signals.mjs";
import {
  createSyntheticNativeRuleExtraction,
  extractNativeRulesFromMarkdown,
} from "./lib/native-rule-extraction.mjs";
import {
  applyNativeRuleBlockDecisions,
  readNativeRuleBlockDecisionArtifact,
} from "./lib/native-rule-block-decisions.mjs";
import {
  isControlledApplyProtocolArtifactPath,
  resolveAuthoritativeEvidenceReference,
} from "./lib/evidence-authority.mjs";
import { resolveProjectEntryTrust } from "./lib/project-entry-trust.mjs";
import { sameRunBindingFromTrust } from "./lib/same-run-evidence-envelope.mjs";
import { loadSchema, stringifyJsonForMarkdownFence } from "./lib/artifact-schema.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(scriptDir, "..");
const nativeMigrationSchema = loadSchema(kitRoot, "schemas/artifacts/native-migration-plan.schema.json");
if (!nativeMigrationSchema?.schemaVersion) {
  throw new Error("Native Migration schema is unavailable, untrusted, or missing schemaVersion");
}
const nativeMigrationSchemaVersion = nativeMigrationSchema.schemaVersion;
const nativeRuleBlockDecisionSchema = loadSchema(kitRoot, "schemas/artifacts/native-rule-block-decisions.schema.json");
if (!nativeRuleBlockDecisionSchema?.schemaVersion) {
  throw new Error("Native rule block decision schema is unavailable, untrusted, or missing schemaVersion");
}

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "owner", "adapter-only", "native-rule-decisions"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildNativeMigration(projectRoot, {
  intent: String(args.intent || ""),
  owner: String(args.owner || ""),
  adapterOnly: Boolean(args["adapter-only"]),
  nativeRuleDecisions: args["native-rule-decisions"]
    ? path.resolve(process.cwd(), String(args["native-rule-decisions"]))
    : "",
});

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildNativeMigration(root, options) {
  const entryTrust = resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: options.intent || "assess existing project adoption",
    excludeControlledApplyProtocolArtifacts: true,
  });
  const sourceBinding = sameRunBindingFromTrust(entryTrust);
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root, { excludeControlledApplyProtocolArtifacts: true }) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 1024,
    maxEntries: 1000000,
    ignoredDirs: defaultIgnoredDirs,
  }).filter((relative) => !isControlledApplyProtocolArtifactPath(relative)).sort() : [];
  const pathSet = new Set(paths);
  const signals = exists ? collectSignals(root, pathSet, kitRoot) : emptySignals();
  const projectState = classifyProject(root, exists, git, signals);
  const migrationSignals = projectState.state === "INTENTOS_REPOSITORY"
    ? currentIntentOSSignals(root)
    : signals;
  const blockDecisionInput = readNativeRuleBlockDecisionArtifact(options.nativeRuleDecisions, sourceBinding, {
    schema: nativeRuleBlockDecisionSchema,
  });
  const posture = postureFor(projectState, options);
  const authority = authorityFor(posture, projectState);
  const inventory = inventoryFor(migrationSignals);
  const {
    ruleClassifications,
    ruleExtractionCoverage,
    parserWarnings,
    blockDecisionResolution,
  } = classifyRules(root, migrationSignals, projectState, blockDecisionInput);
  const conflicts = conflictsFor(migrationSignals, posture, ruleClassifications, blockDecisionResolution);
  const proposedActions = proposedActionsFor(posture, migrationSignals, projectState);
  const humanDecisionsNeeded = humanDecisionsFor(posture, projectState, migrationSignals);
  const outcome = outcomeFor(posture);

  const report = {
    reportType: "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
    schemaVersion: nativeMigrationSchemaVersion,
    generatedBy: "scripts/resolve-native-migration.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    intent: options.intent || "Not provided",
    readOnly: true,
    projectState,
    posture,
    canCodexWriteNow: "No",
    ...authority,
    requiresHumanApprovalBeforeApply: "Yes",
    recommendedNextStep: recommendedNextStepFor(posture),
    existingGovernanceInventory: inventory,
    authoritySourceInventory: migrationSignals.authoritySources || [],
    authoritySourceBoundary: sourceBoundaryFor(migrationSignals),
    ruleExtractionCoverage,
    parserWarnings,
    blockDecisionResolution,
    ruleClassifications,
    conflicts,
    proposedActions,
    authorityTransition: authorityTransitionFor(posture),
    humanDecisionsNeeded,
    boundary: {
      writesTargetFiles: "No",
      authorizesTargetFileWrites: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      changesHighRiskProjectBehavior: "No",
      requiresHumanApprovalBeforeGovernanceReplacement: "Yes",
      treatsIntentOsWorkflowAuthorityAsBusinessAuthority: "No",
    },
    outcome: blockDecisionResolution.state === "INVALID" ? "BLOCKED" : outcome,
  };
  report.structuredEvidence = structuredEvidenceFor(report, sourceBinding);
  return report;
}

function currentIntentOSSignals(root) {
  const existing = (refs) => refs.filter((ref) => fs.existsSync(path.join(root, ref)));
  return {
    authoritySourceBoundary: {
      nativePaths: [],
      excluded: [],
      status: "SOURCE_REPOSITORY",
    },
    authoritySources: [],
    hasProjectSignals: true,
    agentRules: existing(["AGENTS.md", "platforms/codex/AGENTS.template.md"]),
    governanceDocs: existing(["core/operating-model.md", "core/project-entry-adoption-trust.md"]),
    workIntake: existing(["core/work-queue.md", "core/task-governance.md"]),
    ciGates: existing([".github/workflows/ai-workflow-checks.yml", "scripts/self-check.mjs"]),
    releaseRollback: existing(["core/release-execution-protocol.md"]),
    hooksAutomation: [],
    intentOSAssets: existing(["intentos-manifest.json"]),
    productionSignals: [],
  };
}

function collectSignals(root, pathSet, sourceRoot) {
  const allPaths = Array.from(pathSet);
  const partition = partitionNativeAuthorityPaths(root, sourceRoot, allPaths);
  const nativePaths = partition.nativePaths;
  const authoritySources = buildNativeAuthoritySourceInventory(root, nativePaths);
  const authorityPathsForRole = (role) => authoritySources
    .filter((source) => source.role === role)
    .map((source) => source.path);
  const nativeFiles = nativePaths.filter((relativePath) => {
    try {
      return !fs.lstatSync(path.join(root, relativePath)).isDirectory();
    } catch {
      return false;
    }
  });
  const matching = (patterns, paths = nativeFiles) => {
    const matches = paths.filter((item) => patterns.some((pattern) => pattern.test(item))).sort();
    return matches;
  };
  return {
    authoritySourceBoundary: partition,
    authoritySources,
    hasProjectSignals: hasProjectSignals(root),
    agentRules: authorityPathsForRole("AGENT_GUIDANCE"),
    governanceDocs: authorityPathsForRole("GOVERNANCE_DOCUMENT"),
    workIntake: matching([
      /^requests(\/|$)/i,
      /^specs(\/|$)/i,
      /^tasks(\/|$)/i,
      /^issues(\/|$)/i,
      /^\.github\/pull_request_template\.md$/i,
      /^\.github\/ISSUE_TEMPLATE(\/|$)/i,
    ], allPaths),
    ciGates: authorityPathsForRole("CI_WORKFLOW"),
    releaseRollback: authorityPathsForRole("RELEASE_CONTROL"),
    hooksAutomation: matching([
      /^\.husky(\/|$)/i,
      /^\.pre-commit-config\.ya?ml$/i,
      /^hooks(\/|$)/i,
      /^scripts\/hooks(\/|$)/i,
      /pre-commit/i,
      /pre-push/i,
      /automation/i,
    ]),
    intentOSAssets: matching([
      /^\.intentos(\/|$)/i,
      /^workflow-adoption-maps(\/|$)/i,
      /^native-migration-plans(\/|$)/i,
      /^apply-plans(\/|$)/i,
    ], allPaths),
    productionSignals: matching([/\b(prod|production|release|deploy|rollback|incident|runbook|migration|backup|restore|staging)\b/i]),
  };
}

function emptySignals() {
  return {
    authoritySourceBoundary: {
      nativePaths: [],
      excluded: [],
      status: "NO_PROJECT",
    },
    authoritySources: [],
    hasProjectSignals: false,
    agentRules: [],
    governanceDocs: [],
    workIntake: [],
    ciGates: [],
    releaseRollback: [],
    hooksAutomation: [],
    intentOSAssets: [],
    productionSignals: [],
  };
}

function sourceBoundaryFor(signals) {
  const boundary = signals.authoritySourceBoundary || { nativePaths: [], excluded: [], status: "NOT_APPLICABLE" };
  const byClassification = {};
  for (const item of boundary.excluded || []) {
    byClassification[item.classification] = (byClassification[item.classification] || 0) + 1;
  }
  return {
    status: boundary.status,
    nativePathCount: boundary.nativePaths?.length || 0,
    excludedPathCount: boundary.excluded?.length || 0,
    excludedByClassification: byClassification,
    exclusions: boundary.excluded || [],
    selectedAuthoritySourceCount: (signals.authoritySources || []).filter((source) => source.disposition === "SELECTED").length,
    reviewRequiredAuthoritySourceCount: (signals.authoritySources || []).filter((source) => source.disposition === "REVIEW_REQUIRED").length,
  };
}

function classifyProject(root, exists, git, signals) {
  if (!exists) {
    return {
      state: "BLOCKED_UNKNOWN_RISK",
      reason: "Target path does not exist.",
      confidence: "high",
      dirtyWorktree: "Unknown",
      governed: "Unknown",
      productionSensitive: "Unknown",
    };
  }

  const isIntentOS = fs.existsSync(path.join(root, "intentos-manifest.json"))
    && fs.existsSync(path.join(root, "core", "workflow.md"));
  if (isIntentOS) {
    return {
      state: "INTENTOS_REPOSITORY",
      reason: "This is the IntentOS / IntentOS source repository.",
      confidence: "high",
      dirtyWorktree: git?.isDirty ? "Yes" : "No",
      governed: "Yes",
      productionSensitive: "No",
    };
  }

  if (git?.isDirty) {
    return {
      state: "DIRTY_WORKTREE_PROJECT",
      reason: "Git worktree has existing changes; native migration must not mix with current user work.",
      confidence: "high",
      dirtyWorktree: "Yes",
      governed: hasGovernance(signals) ? "Yes" : "Unknown",
      productionSensitive: signals.productionSignals.length > 0 ? "Yes" : "Unknown",
    };
  }

  if (signals.productionSignals.length > 0 || signals.releaseRollback.length > 0) {
    return {
      state: "EXISTING_PRODUCTION_PROJECT",
      reason: "Production, release, deploy, rollback, or incident signals were detected.",
      confidence: "medium",
      dirtyWorktree: "No",
      governed: hasGovernance(signals) ? "Yes" : "Unknown",
      productionSensitive: "Yes",
    };
  }

  if (hasGovernance(signals)) {
    return {
      state: "EXISTING_GOVERNED_PROJECT",
      reason: "Agent rules, governance docs, gates, review evidence, or workflow assets were detected.",
      confidence: "medium",
      dirtyWorktree: "No",
      governed: "Yes",
      productionSensitive: "Unknown",
    };
  }

  if (signals.hasProjectSignals) {
    return {
      state: "EXISTING_LIGHT_PROJECT",
      reason: "Project files exist without strong governance signals.",
      confidence: "medium",
      dirtyWorktree: "No",
      governed: "No",
      productionSensitive: "Unknown",
    };
  }

  return {
    state: "NEW_OR_EMPTY_PROJECT",
    reason: "No strong project signals were detected.",
    confidence: "medium",
    dirtyWorktree: "No",
    governed: "No",
    productionSensitive: "No",
  };
}

function hasGovernance(signals) {
  return signals.agentRules.length > 0
    || signals.governanceDocs.length > 0
    || signals.ciGates.length > 0
    || signals.intentOSAssets.length > 0
    || signals.workIntake.length > 0;
}

function postureFor(projectState, options) {
  if (options.adapterOnly) return "ADAPTER_ONLY_RECOMMENDED";
  if (projectState.state === "BLOCKED_UNKNOWN_RISK") return "BLOCKED_NEEDS_OWNER";
  if (projectState.state === "DIRTY_WORKTREE_PROJECT") return "NATIVE_FIRST_PENDING_WORKTREE_REVIEW";
  if (projectState.state === "EXISTING_PRODUCTION_PROJECT") return "PRODUCTION_SAFE_NATIVE_OVERLAY";
  if (projectState.state === "EXISTING_GOVERNED_PROJECT") return "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW";
  if (projectState.state === "INTENTOS_REPOSITORY") return "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW";
  if (projectState.state === "EXISTING_LIGHT_PROJECT") return "NATIVE_FIRST_MIGRATION";
  if (projectState.state === "NEW_OR_EMPTY_PROJECT") return "FULL_MANAGED_INTENTOS_NATIVE";
  return "BLOCKED_NEEDS_OWNER";
}

function authorityFor(posture, projectState) {
  const blocked = posture === "BLOCKED_NEEDS_OWNER" || posture === "ADAPTER_ONLY_RECOMMENDED";
  const dirty = posture === "NATIVE_FIRST_PENDING_WORKTREE_REVIEW";
  return {
    intentOsWorkflowAuthority: blocked ? "BLOCKED" : "ACTIVE_FOR_PLANNING",
    targetFileWriteAuthority: blocked || dirty ? "NO_WRITE" : "PLAN_REQUIRED",
    businessAuthority: "PROJECT_OWNED",
    productionAuthority: "HUMAN_OR_EXTERNAL_SYSTEM",
    authorityReason: projectState.reason,
  };
}

function inventoryFor(signals) {
  return [
    inventoryRow("Agent rules", signals.agentRules, signals.agentRules.length ? "classify before migration" : "no agent-rule source detected"),
    inventoryRow("Governance docs", signals.governanceDocs, signals.governanceDocs.length ? "preserve or map" : "gap or not needed"),
    inventoryRow("Work intake", signals.workIntake, signals.workIntake.length ? "map to IntentOS work queue and task flow" : "gap or not needed"),
    inventoryRow("CI / gates", signals.ciGates, signals.ciGates.length ? "preserve as verification evidence" : "do not invent gates"),
    inventoryRow("Release / rollback", signals.releaseRollback, signals.releaseRollback.length ? "preserve and map to release guide/handoff" : "not detected"),
    inventoryRow("Hooks / automation", signals.hooksAutomation, signals.hooksAutomation.length ? "hook policy first; never auto-install" : "not detected"),
    inventoryRow("IntentOS assets", signals.intentOSAssets, signals.intentOSAssets.length ? "reuse and update through apply-plan" : "candidate only"),
  ];
}

function inventoryRow(area, assets, handling) {
  return {
    area,
    source: assets.length ? assets.join(", ") : "none detected",
    handling,
  };
}

function classifyRules(root, signals, projectState, blockDecisionInput) {
  if (projectState.state === "INTENTOS_REPOSITORY") {
    return nativeRuleClassificationResult([currentIntentOSSourceExtraction()], blockDecisionInput);
  }
  const candidates = Array.isArray(signals.authoritySources)
    ? signals.authoritySources
    : [
      ...signals.agentRules,
      ...signals.governanceDocs,
      ...signals.releaseRollback,
      ...signals.ciGates,
    ].map((sourcePath) => ({
      path: sourcePath,
      role: "LEGACY_AUTHORITY",
      format: "MARKDOWN",
      disposition: "SELECTED",
      reason: "legacy native migration source",
    }));
  const unique = Array.from(new Map(candidates.map((source) => [source.path, source])).values());
  if (unique.length === 0) {
    return nativeRuleClassificationResult([
      createSyntheticNativeRuleExtraction({
        sourceFile: "project scan",
        contextHeading: "project scan",
        sourceExcerpt: "No existing governance rule source detected.",
        warning: "No existing governance rule source detected.",
        classification: {
          rule_class: "UNKNOWN_AUTHORITY",
          authority: "Unresolved project authority",
          default_handling: "stop for classification",
          preserve_or_replace: "preserve until Codex can classify from project evidence",
          reason: "IntentOS cannot replace rules that were not found or owned.",
          risk_surfaces: "workflow",
          target_action: "Codex preserves the source and stops before apply until it can classify authority from project evidence",
          human_decision_required: "No",
          confidence: "LOW",
        },
      }),
    ], blockDecisionInput);
  }

  const sourceExtractions = [];
  for (const source of unique) {
    const rel = source.path;
    const full = path.join(root, rel);
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      const warning = `${rel} was detected as a path but not readable as a file.`;
      sourceExtractions.push(createSyntheticNativeRuleExtraction({
        sourceFile: rel,
        contextHeading: "path detected",
        sourceExcerpt: rel,
        warning,
        classification: {
          rule_class: "UNKNOWN_AUTHORITY",
          authority: "Unresolved project authority",
          default_handling: "stop for classification",
          preserve_or_replace: "preserve until classified",
          reason: "Detected path remains authoritative until Codex can classify it from project evidence.",
          risk_surfaces: "workflow",
          target_action: "Codex preserves the source and stops before apply until it can classify authority from project evidence",
          human_decision_required: "No",
          confidence: "LOW",
        },
      }));
      continue;
    }
    if (source.disposition !== "SELECTED") {
      const warning = `${rel} requires review before rule extraction: ${source.reason}`;
      sourceExtractions.push({
        rules: [],
        coverage: {
          source_file: rel,
          lines_scanned: 0,
          rules_extracted: 0,
          unclassified_blocks: [{
            source_file: rel,
            source_start_line: 1,
            source_end_line: 1,
            context_heading: `${source.role} source inventory`,
            excerpt: rel,
            reason: warning,
          }],
          skipped_blocks: [],
          low_signal_blocks: [],
          block_ledger: [],
          parser_warnings: [warning],
        },
      });
      continue;
    }
    const authoritative = resolveAuthoritativeEvidenceReference(root, "", rel);
    if (!authoritative.ok) {
      const warning = `${rel} is not a safe project-local governance source: ${authoritative.error}`;
      sourceExtractions.push(createSyntheticNativeRuleExtraction({
        sourceFile: rel,
        contextHeading: "unsafe governance source",
        sourceExcerpt: rel,
        warning,
        classification: {
          rule_class: "UNKNOWN_AUTHORITY",
          authority: "Unresolved project authority",
          default_handling: "stop for classification",
          preserve_or_replace: "preserve until classified",
          reason: "A governance source must be a project-contained non-symlink file before IntentOS can classify or reconcile it.",
          risk_surfaces: "workflow authority",
          target_action: "Codex blocks governance replacement until the unsafe source is removed or replaced by project-local evidence",
          human_decision_required: "No",
          confidence: "LOW",
        },
      }));
      continue;
    }
    const content = fs.readFileSync(authoritative.file, "utf8");
    const extracted = extractNativeRulesFromMarkdown(content, authoritative.relativePath, {
      authoritySource: source,
    });
    sourceExtractions.push(extracted);
  }

  return nativeRuleClassificationResult(sourceExtractions, blockDecisionInput);
}

function nativeRuleClassificationResult(sourceExtractions, blockDecisionInput) {
  const extractedRules = [];
  const coverage = [];
  const warnings = [];
  const applied = applyNativeRuleBlockDecisions(sourceExtractions, blockDecisionInput);
  for (const extracted of applied.extractions) {
    coverage.push(toCoverage(extracted.coverage));
    warnings.push(...extracted.coverage.parser_warnings);
    extractedRules.push(...extracted.rules);
    if (extracted.rules.length === 0) {
      warnings.push(`${extracted.coverage.source_file} contains no actionable governance rule; it remains project context but does not create a synthetic authority blocker.`);
    }
  }
  if (applied.resolution.state === "INVALID") {
    warnings.push(...applied.resolution.errors.map((error) => `Native rule block decision rejected: ${error}`));
  }

  return {
    ruleClassifications: extractedRules.map((item, index) => ({
      ruleId: `R-${String(index + 1).padStart(3, "0")}`,
      sourceFile: safeRuleText(item.source_file),
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: safeRuleText(item.context_heading),
      sourceExcerpt: safeRuleText(item.source_excerpt, { redactAssignments: true }),
      ruleClass: item.rule_class,
      authority: safeRuleText(item.authority || "unresolved_project_authority"),
      defaultHandling: safeRuleText(item.default_handling),
      preserveOrReplace: safeRuleText(item.preserve_or_replace),
      reason: safeRuleText(item.reason),
      riskSurfaces: safeRuleText(item.risk_surfaces),
      targetAction: safeRuleText(item.target_action),
      humanDecisionRequired: "No",
      confidence: item.confidence,
      detectedTerms: item.detected_terms || [],
    })),
    ruleExtractionCoverage: coverage,
    parserWarnings: warnings,
    blockDecisionResolution: applied.resolution,
  };
}

function currentIntentOSSourceExtraction() {
  return createSyntheticNativeRuleExtraction({
    sourceFile: "intentos-manifest.json",
    contextHeading: "IntentOS source authority",
    sourceExcerpt: "The authoritative source manifest defines the current IntentOS distribution.",
    classification: {
      rule_class: "WORKFLOW_RULE",
      authority: "IntentOS source repository",
      default_handling: "preserve current source authority",
      preserve_or_replace: "preserve",
      reason: "A current IntentOS source repository is not an existing project awaiting native migration.",
      risk_surfaces: "workflow authority",
      target_action: "continue source verification without self-migration",
      human_decision_required: "No",
      confidence: "HIGH",
    },
  });
}

function safeRuleText(value, options = {}) {
  let text = String(value || "").replace(/[\r\n]+/g, " ").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
  if (options.redactAssignments) {
    text = text.replace(/\b(secret|token|password|api[_-]?key)\s*=\s*[^\s,;]+/gi, "$1=[REDACTED]");
  }
  return text || "unresolved";
}

function toCoverage(coverage) {
  return {
    sourceFile: coverage.source_file,
    linesScanned: coverage.lines_scanned,
    rulesExtracted: coverage.rules_extracted,
    unclassifiedBlocks: coverage.unclassified_blocks.map((item) => ({
      sourceFile: item.source_file,
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: item.context_heading,
      excerpt: item.excerpt,
      reason: item.reason,
    })),
    skippedBlocks: (coverage.skipped_blocks || []).map((item) => ({
      sourceFile: item.source_file,
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: item.context_heading,
      excerpt: item.excerpt,
      reason: item.reason,
    })),
    lowSignalBlocks: (coverage.low_signal_blocks || []).map((item) => ({
      sourceFile: item.source_file,
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: item.context_heading,
      excerpt: item.excerpt,
      reason: item.reason,
      ...(item.disposition ? { disposition: item.disposition } : {}),
    })),
    blockLedger: (coverage.block_ledger || []).map((item) => ({
      blockId: item.block_id,
      blockDigest: item.block_digest,
      blockType: item.block_type,
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: item.context_heading,
      disposition: item.disposition,
      ruleCount: item.rule_count,
      reason: item.reason,
    })),
    parserWarnings: coverage.parser_warnings,
  };
}

function structuredEvidenceFor(report, sourceBinding) {
  return {
    schema_version: nativeMigrationSchemaVersion,
    artifact_type: "native_migration_plan",
    report_type: report.reportType,
    project_state: report.projectState.state,
    posture: report.posture,
    can_codex_write_now: report.canCodexWriteNow,
    intent_os_workflow_authority: report.intentOsWorkflowAuthority,
    target_file_write_authority: report.targetFileWriteAuthority,
    business_authority: report.businessAuthority,
    production_authority: report.productionAuthority,
    requires_human_approval_before_apply: report.requiresHumanApprovalBeforeApply,
    project_binding: sourceBinding.projectBinding,
    goal_digest: sourceBinding.goalDigest,
    project_fact_digest: sourceBinding.projectFactDigest,
    guidance_digest: sourceBinding.guidanceDigest,
    authority_inventory_digest: sourceBinding.authorityInventoryDigest,
    source_revision: sourceBinding.sourceRevision,
    authority_source_boundary: {
      status: report.authoritySourceBoundary.status,
      native_path_count: report.authoritySourceBoundary.nativePathCount,
      excluded_path_count: report.authoritySourceBoundary.excludedPathCount,
      selected_authority_source_count: report.authoritySourceBoundary.selectedAuthoritySourceCount,
      review_required_authority_source_count: report.authoritySourceBoundary.reviewRequiredAuthoritySourceCount,
      excluded_by_classification: report.authoritySourceBoundary.excludedByClassification,
      exclusions: report.authoritySourceBoundary.exclusions.map((item) => ({
        path: item.path,
        classification: item.classification,
        evidence: item.evidence,
        ...(item.source ? { source: item.source } : {}),
      })),
    },
    authority_source_inventory: report.authoritySourceInventory.map((source) => ({
      path: source.path,
      role: source.role,
      format: source.format,
      classification_default: source.classificationDefault,
      disposition: source.disposition,
      reason: source.reason,
    })),
    block_decision_resolution: {
      state: report.blockDecisionResolution.state,
      artifact_ref: report.blockDecisionResolution.artifactRef,
      artifact_digest: report.blockDecisionResolution.artifactDigest,
      decisions_declared: report.blockDecisionResolution.decisionsDeclared,
      decisions_applied: report.blockDecisionResolution.decisionsApplied,
      errors: report.blockDecisionResolution.errors,
      applied_decisions: report.blockDecisionResolution.appliedDecisions,
      boundary: {
        writes_target_files: report.blockDecisionResolution.boundary.writesTargetFiles,
        authorizes_apply: report.blockDecisionResolution.boundary.authorizesApply,
        authorizes_activation: report.blockDecisionResolution.boundary.authorizesActivation,
        authorizes_release_or_production: report.blockDecisionResolution.boundary.authorizesReleaseOrProduction,
      },
    },
    rule_extraction_coverage: report.ruleExtractionCoverage.map((item) => ({
      source_file: item.sourceFile,
      lines_scanned: item.linesScanned,
      rules_extracted: item.rulesExtracted,
      unclassified_blocks: item.unclassifiedBlocks.map((block) => ({
        source_file: block.sourceFile,
        source_start_line: block.sourceStartLine,
        source_end_line: block.sourceEndLine,
        context_heading: block.contextHeading,
        excerpt: block.excerpt,
        reason: block.reason,
      })),
      skipped_blocks: (item.skippedBlocks || []).map((block) => ({
        source_file: block.sourceFile,
        source_start_line: block.sourceStartLine,
        source_end_line: block.sourceEndLine,
        context_heading: block.contextHeading,
        excerpt: block.excerpt,
        reason: block.reason,
      })),
      low_signal_blocks: (item.lowSignalBlocks || []).map((block) => ({
        source_file: block.sourceFile,
        source_start_line: block.sourceStartLine,
        source_end_line: block.sourceEndLine,
        context_heading: block.contextHeading,
        excerpt: block.excerpt,
        reason: block.reason,
        ...(block.disposition ? { disposition: block.disposition } : {}),
      })),
      block_ledger: (item.blockLedger || []).map((block) => ({
        block_id: block.blockId,
        block_digest: block.blockDigest,
        block_type: block.blockType,
        source_start_line: block.sourceStartLine,
        source_end_line: block.sourceEndLine,
        context_heading: block.contextHeading,
        disposition: block.disposition,
        rule_count: block.ruleCount,
        reason: block.reason,
      })),
      parser_warnings: item.parserWarnings,
    })),
    rule_classifications: report.ruleClassifications.map((item) => ({
      rule_id: item.ruleId,
      source_file: item.sourceFile,
      source_start_line: item.sourceStartLine,
      source_end_line: item.sourceEndLine,
      context_heading: item.contextHeading,
      source_excerpt: item.sourceExcerpt,
      rule_class: item.ruleClass,
      authority: item.authority,
      default_handling: item.defaultHandling,
      preserve_or_replace: item.preserveOrReplace,
      reason: item.reason,
      risk_surfaces: item.riskSurfaces,
      target_action: item.targetAction,
      human_decision_required: item.humanDecisionRequired,
      confidence: item.confidence,
    })),
    conflicts: report.conflicts,
    proposed_actions: report.proposedActions,
    authority_transition: report.authorityTransition,
    human_decisions_needed: report.humanDecisionsNeeded,
    boundary: report.boundary,
    outcome: report.outcome,
  };
}

function conflictsFor(signals, posture, rules, blockDecisionResolution) {
  const conflicts = [];
  if (signals.agentRules.length > 0) {
    conflicts.push(conflict("C-001", "WORKFLOW_CONFLICT", signals.agentRules.join(", "), "IntentOS workflow authority", "Codex compares and preserves stronger project rules before selected overlay", "No"));
  }
  if (signals.releaseRollback.length > 0) {
    conflicts.push(conflict("C-002", "PRODUCTION_CONFLICT", signals.releaseRollback.slice(0, 4).join(", "), "Release Guide / Recipe / Handoff mapping", "Preserve SOP and map only", "No"));
  }
  if (signals.ciGates.length > 0 || signals.hooksAutomation.length > 0) {
    conflicts.push(conflict("C-003", "PRODUCTION_CONFLICT", [...signals.ciGates, ...signals.hooksAutomation].slice(0, 4).join(", "), "IntentOS checks / hook policy", "Map first; do not modify CI or hooks", "No"));
  }
  if (rules.some((item) => item.ruleClass === "UNKNOWN_AUTHORITY")) {
    conflicts.push(conflict("C-004", "OWNER_CONFLICT", "unknown-authority rule", "Native migration", "Preserve and block replacement until Codex resolves authority from evidence", "No"));
  }
  if (posture === "NATIVE_FIRST_PENDING_WORKTREE_REVIEW") {
    conflicts.push(conflict("C-005", "OWNER_CONFLICT", "dirty worktree", "Native migration apply", "Codex continues read-only mapping and blocks only overlapping writes", "No"));
  }
  if (blockDecisionResolution?.state === "INVALID") {
    conflicts.push(conflict("C-006", "OWNER_CONFLICT", "stale or invalid native rule block decision", "Native migration classification", "Reject the complete decision artifact and preserve every current unresolved block", "No"));
  }
  if (conflicts.length === 0) {
    conflicts.push(conflict("C-001", "WORKFLOW_CONFLICT", "no strong old workflow conflict detected", "IntentOS workflow authority", "Codex may continue the selected reversible operating overlay after internal gates", "No"));
  }
  return conflicts;
}

function conflict(conflictId, conflictType, existingSource, intentOsTarget, defaultDecision, humanDecisionRequired) {
  return { conflictId, conflictType, existingSource, intentOsTarget, defaultDecision, humanDecisionRequired };
}

function proposedActionsFor(posture, signals, projectState) {
  const actions = [
    action(1, "Record Native Migration Plan", "native-migration-plans/001-native-migration.md", "No", "Yes", "Proposed"),
    action(2, "Prepare Unified Apply Plan for approved governance assets only", "apply-plans/001-native-governance.md", "No", "Yes", "Proposed"),
    action(3, "Record Controlled Apply Readiness before any apply", "apply-readiness-reports/001-native-governance.md", "No", "Yes", "Proposed"),
    action(4, "Materialize the original natural-language request as a bounded Approval Record for exact reversible action IDs", "approval-records/001-native-governance.md", "No", "Yes", "Proposed"),
  ];
  if (signals.agentRules.length > 0) {
    actions.push(action(5, "Plan IntentOS-native AGENTS.md replacement after classification", "AGENTS.md", "No", "Yes", "Proposed"));
  }
  if (posture === "PRODUCTION_SAFE_NATIVE_OVERLAY") {
    actions.push(action(6, "Map release SOP to Release Guide / Recipe / Handoff without replacement", "release-guides/001-release-guide.md", "No", "Yes", "Proposed"));
  }
  if (projectState.state === "DIRTY_WORKTREE_PROJECT") {
    actions.push(action(7, "Pause governance writes until current worktree changes are classified", "work-queue/001-current-worktree.md", "No", "Yes", "Blocked"));
  }
  return actions;
}

function action(step, actionText, exactTargetPath, writesTargetFiles, requiresHumanApproval, status) {
  return { step, action: actionText, exactTargetPath, writesTargetFiles, requiresHumanApproval, status };
}

function authorityTransitionFor(posture) {
  if (posture === "ADAPTER_ONLY_RECOMMENDED" || posture === "BLOCKED_NEEDS_OWNER") {
    return {
      oldWorkflowRules: "remain active until Codex resolves authority from project evidence",
      intentOsRules: "blocked from becoming workflow authority",
      transitionCondition: "current project evidence, reviewed exact plan, and controlled readiness establish a safe selected overlay",
    };
  }
  return {
    oldWorkflowRules: "preserved until a reviewed exact plan proves the selected replacement or merge",
    intentOsRules: "preferred future workflow authority for Codex planning",
    transitionCondition: "the original adoption request is bound to exact reversible actions after Plan Review and controlled readiness; real-world effects still require exact consent",
  };
}

function humanDecisionsFor(posture, projectState, signals) {
  const notes = [decision("No technical migration decision is required from the user", "Codex", "NO_USER_ACTION")];
  if (projectState.state === "DIRTY_WORKTREE_PROJECT") notes.push(decision("Map current changes and isolate selected overlay writes", "Codex", "INTERNAL_GUARD_REQUIRED"));
  if (signals.agentRules.length > 0) notes.push(decision("Preserve and reconcile the effective agent entry before replacement", "Codex", "INTERNAL_REVIEW_REQUIRED"));
  if (projectState.productionSensitive === "Yes") notes.push(decision("Preserve release and production authority; request consent only for a prepared real-world effect", "Codex", "REAL_WORLD_EFFECT_ONLY"));
  return notes;
}

function decision(name, owner, status) {
  return { decision: name, owner, status };
}

function recommendedNextStepFor(posture) {
  if (posture === "NATIVE_FIRST_PENDING_WORKTREE_REVIEW") return "Codex maps current-work ownership read-only, then prepares only non-overlapping selected overlay actions.";
  if (posture === "PRODUCTION_SAFE_NATIVE_OVERLAY") return "Codex prepares a selected native overlay while preserving production and release authority.";
  if (posture === "ADAPTER_ONLY_RECOMMENDED" || posture === "BLOCKED_NEEDS_OWNER") return "Codex preserves unresolved authority and continues evidence collection without target writes.";
  return "Codex prepares the exact selected overlay, Plan Review, bounded request authority, and controlled readiness.";
}

function outcomeFor(posture) {
  if (posture === "BLOCKED_NEEDS_OWNER" || posture === "ADAPTER_ONLY_RECOMMENDED") return "BLOCKED";
  return "NATIVE_MIGRATION_PLAN_RECORDED";
}

function printHuman(report) {
  console.log("# Native Migration Plan");
  console.log("");
  console.log("I have switched to IntentOS Native-First Migration Planning mode.");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Project State | \`${report.projectState.state}\` |`);
  console.log(`| Recommended Posture | \`${report.posture}\` |`);
  console.log(`| Can Codex write now | \`${report.canCodexWriteNow}\` |`);
  console.log(`| IntentOS Workflow Authority | \`${report.intentOsWorkflowAuthority}\` |`);
  console.log(`| Target File Write Authority | \`${report.targetFileWriteAuthority}\` |`);
  console.log(`| Business Authority | \`${report.businessAuthority}\` |`);
  console.log(`| Production Authority | \`${report.productionAuthority}\` |`);
  console.log(`| Requires Human Approval Before Apply | \`${report.requiresHumanApprovalBeforeApply}\` |`);
  console.log(`| Recommended Next Step | ${report.recommendedNextStep} |`);
  console.log("");
  console.log("## Existing Governance Inventory");
  console.log("");
  console.log("| Area | Source | Handling |");
  console.log("| --- | --- | --- |");
  for (const item of report.existingGovernanceInventory) {
    console.log(`| ${item.area} | ${item.source} | ${item.handling} |`);
  }
  console.log("");
  console.log("## Authority Source Boundary");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Status | \`${report.authoritySourceBoundary.status}\` |`);
  console.log(`| Native candidate paths | ${report.authoritySourceBoundary.nativePathCount} |`);
  console.log(`| Excluded IntentOS paths | ${report.authoritySourceBoundary.excludedPathCount} |`);
  console.log(`| Selected authority sources | ${report.authoritySourceBoundary.selectedAuthoritySourceCount} |`);
  console.log(`| Authority sources requiring review | ${report.authoritySourceBoundary.reviewRequiredAuthoritySourceCount} |`);
  for (const [classification, count] of Object.entries(report.authoritySourceBoundary.excludedByClassification)) {
    console.log(`| ${classification} | ${count} |`);
  }
  console.log("");
  console.log("Excluded paths remain present in structured evidence with their ownership proof; drifted files are not excluded.");
  console.log("");
  console.log("## Authority Source Inventory");
  console.log("");
  console.log("| Source | Role | Format | Disposition | Reason |");
  console.log("| --- | --- | --- | --- | --- |");
  for (const source of report.authoritySourceInventory) {
    console.log(`| ${source.path} | ${source.role} | ${source.format} | ${source.disposition} | ${source.reason} |`);
  }
  console.log("");
  console.log("## Rule Extraction Coverage");
  console.log("");
  console.log("| Source file | Lines scanned | Rules extracted | Unclassified blocks | Skipped blocks | Low-signal blocks | Parser warnings |");
  console.log("| --- | --- | --- | --- | --- | --- | --- |");
  for (const item of report.ruleExtractionCoverage) {
    console.log(`| ${item.sourceFile} | ${item.linesScanned} | ${item.rulesExtracted} | ${item.unclassifiedBlocks.length} | ${(item.skippedBlocks || []).length} | ${(item.lowSignalBlocks || []).length} | ${item.parserWarnings.length ? item.parserWarnings.join("<br>") : "None"} |`);
  }
  console.log("");
  console.log("## Extracted Rule Classification");
  console.log("");
  printRuleTable(report.ruleClassifications);
  console.log("");
  console.log("## Conflicts And Decisions");
  console.log("");
  console.log("| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const item of report.conflicts) {
    console.log(`| ${item.conflictId} | \`${item.conflictType}\` | ${item.existingSource || "N/A"} | ${item.intentOsTarget} | ${item.defaultDecision} | ${item.humanDecisionRequired} |`);
  }
  console.log("");
  console.log("## Proposed Native Migration Plan");
  console.log("");
  console.log("| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const item of report.proposedActions) {
    console.log(`| ${item.step} | ${item.action} | \`${item.exactTargetPath}\` | ${item.writesTargetFiles} | ${item.requiresHumanApproval} | ${item.status} |`);
  }
  console.log("");
  console.log("## Proposed AGENTS.md Handling");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Existing AGENTS parsed | ${report.existingGovernanceInventory.some((item) => item.area === "Agent rules" && item.source !== "none detected") ? "Yes" : "No"} |`);
  console.log("| Replacement proposed | Yes, only after reviewed plan and approval |");
  console.log("| Project facts preserved | Yes |");
  console.log("| Old workflow rules replaced by IntentOS only after approval | Yes |");
  console.log("| Restore owner | human owner |");
  console.log("");
  console.log("## Preserve / Replace / Archive Suggestions");
  console.log("");
  console.log("| Item | Action | Reason |");
  console.log("| --- | --- | --- |");
  console.log("| Business facts | Preserve | Project behavior remains project-owned |");
  console.log("| Production controls | Preserve and escalate | Production authority remains human or external-system owned |");
  console.log("| Engineering baseline rules | Map | Baseline changes require review and evidence |");
  console.log("| Old workflow rules | Replace after approval | IntentOS becomes future workflow authority |");
  console.log("| Historical notes | Archive suggestion | Do not delete by default |");
  console.log("");
  console.log("## Restore Plan");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log("| Backup path | `.intentos/backups/native-migration/<timestamp>/` |");
  console.log("| Restore method | Restore approved backup or keep old governance unchanged if approval is rejected |");
  console.log("| Restore owner | human owner |");
  console.log("| If owner rejects migration | Keep adapter-only / read-only mapping |");
  console.log("");
  console.log("## Authority Transition");
  console.log("");
  console.log("| Field | Value |");
  console.log("| --- | --- |");
  console.log(`| Old workflow rules | ${report.authorityTransition.oldWorkflowRules} |`);
  console.log(`| IntentOS rules | ${report.authorityTransition.intentOsRules} |`);
  console.log(`| Transition condition | ${report.authorityTransition.transitionCondition} |`);
  console.log("");
  console.log("## Apply Chain");
  console.log("");
  console.log("```text");
  console.log("Native Migration Plan");
  console.log("Unified Apply Plan");
  console.log("Controlled Apply Readiness");
  console.log("Approval Record");
  console.log("approved governance-file edits only");
  console.log("Change Impact Coverage / Review Loop / Finish");
  console.log("```");
  console.log("");
  console.log("## Human Decisions Needed");
  console.log("");
  console.log("| Decision | Owner | Status |");
  console.log("| --- | --- | --- |");
  for (const item of report.humanDecisionsNeeded) {
    console.log(`| ${item.decision} | ${item.owner} | ${item.status} |`);
  }
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This plan writes target files: No");
  console.log("- This plan authorizes target-file writes: No");
  console.log("- This plan approves implementation: No");
  console.log("- This plan approves release or production: No");
  console.log("- This plan modifies CI or hooks: No");
  console.log("- This plan changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior: No");
  console.log("- This plan requires human approval before governance replacement: Yes");
  console.log("- This plan treats IntentOS workflow authority as business authority: No");
  console.log("");
  console.log("## Machine-Readable Evidence");
  console.log("");
  console.log("```json");
  console.log(stringifyJsonForMarkdownFence(report.structuredEvidence));
  console.log("```");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printRuleTable(items) {
  console.log("| Rule ID | Source file | Source line range | Context heading | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required | Confidence |");
  console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const item of items) {
    console.log(`| \`${item.ruleId}\` | ${item.sourceFile} | ${item.sourceStartLine}-${item.sourceEndLine} | ${item.contextHeading} | ${item.sourceExcerpt} | \`${item.ruleClass}\` | ${item.authority} | ${item.defaultHandling} | ${item.preserveOrReplace} | ${item.reason} | ${item.riskSurfaces} | ${item.targetAction} | ${item.humanDecisionRequired} | ${item.confidence} |`);
  }
}
