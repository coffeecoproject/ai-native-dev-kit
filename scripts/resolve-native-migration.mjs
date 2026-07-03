#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";
import { extractNativeRulesFromMarkdown } from "./lib/native-rule-extraction.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "owner", "adapter-only"]);
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
});

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildNativeMigration(root, options) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 4,
    ignoredDirs: defaultIgnoredDirs,
  }).sort() : [];
  const pathSet = new Set(paths);
  const signals = exists ? collectSignals(root, pathSet) : emptySignals();
  const projectState = classifyProject(root, exists, git, signals);
  const posture = postureFor(projectState, options);
  const authority = authorityFor(posture, projectState);
  const inventory = inventoryFor(signals);
  const { ruleClassifications, ruleExtractionCoverage, parserWarnings } = classifyRules(root, signals);
  const conflicts = conflictsFor(signals, posture, ruleClassifications);
  const proposedActions = proposedActionsFor(posture, signals, projectState);
  const humanDecisionsNeeded = humanDecisionsFor(posture, projectState, signals);
  const outcome = outcomeFor(posture);

  const report = {
    reportType: "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
    schemaVersion: "1.63.0",
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
    ruleExtractionCoverage,
    parserWarnings,
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
    outcome,
  };
  report.structuredEvidence = structuredEvidenceFor(report);
  return report;
}

function collectSignals(root, pathSet) {
  const allPaths = Array.from(pathSet);
  const matching = (patterns) => allPaths.filter((item) => patterns.some((pattern) => pattern.test(item))).sort().slice(0, 16);
  return {
    hasProjectSignals: hasProjectSignals(root),
    agentRules: matching([
      /^AGENTS\.md$/i,
      /^agent\.md$/i,
      /^\.agent\.md$/i,
      /^\.codex(\/|$)/i,
      /^\.cursor(\/|$)/i,
      /^\.claude(\/|$)/i,
    ]),
    governanceDocs: matching([
      /^docs\/governance(\/|$)/i,
      /^docs\/baseline/i,
      /^docs\/baselines(\/|$)/i,
      /^docs\/architecture/i,
      /^docs\/adr(\/|$)/i,
      /^docs\/risk/i,
      /baseline.*\.md$/i,
      /governance.*\.md$/i,
    ]),
    workIntake: matching([
      /^requests(\/|$)/i,
      /^specs(\/|$)/i,
      /^tasks(\/|$)/i,
      /^issues(\/|$)/i,
      /^\.github\/pull_request_template\.md$/i,
      /^\.github\/ISSUE_TEMPLATE(\/|$)/i,
    ]),
    ciGates: matching([
      /^\.github\/workflows(\/|$)/i,
      /^scripts\/guard(\/|$)/i,
      /^scripts\/check(\/|$)/i,
      /^scripts\/ci(\/|$)/i,
      /gate/i,
      /quality/i,
    ]),
    releaseRollback: matching([
      /^docs\/release(\/|$)/i,
      /^docs\/releases(\/|$)/i,
      /^docs\/runbooks(\/|$)/i,
      /^docs\/rollback/i,
      /^docs\/incident(\/|$)/i,
      /^infra\/prod/i,
      /^infra\/production/i,
      /^infra\/staging/i,
      /release/i,
      /rollback/i,
      /deploy/i,
    ]),
    hooksAutomation: matching([
      /^\.husky(\/|$)/i,
      /^\.pre-commit-config\.ya?ml$/i,
      /^hooks(\/|$)/i,
      /^scripts\/hooks(\/|$)/i,
      /pre-commit/i,
      /pre-push/i,
      /automation/i,
    ]),
    aiNativeAssets: matching([
      /^\.ai-native(\/|$)/i,
      /^workflow-adoption-maps(\/|$)/i,
      /^native-migration-plans(\/|$)/i,
      /^apply-plans(\/|$)/i,
    ]),
    productionSignals: allPaths.filter((item) => /\b(prod|production|release|deploy|rollback|incident|runbook|migration|backup|restore|staging)\b/i.test(item)).slice(0, 16),
  };
}

function emptySignals() {
  return {
    hasProjectSignals: false,
    agentRules: [],
    governanceDocs: [],
    workIntake: [],
    ciGates: [],
    releaseRollback: [],
    hooksAutomation: [],
    aiNativeAssets: [],
    productionSignals: [],
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

  const isDevKit = fs.existsSync(path.join(root, "dev-kit-manifest.json"))
    && fs.existsSync(path.join(root, "core", "workflow.md"));
  if (isDevKit) {
    return {
      state: "DEV_KIT_REPOSITORY",
      reason: "This is the IntentOS / AI Native Dev Kit source repository.",
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
    || signals.aiNativeAssets.length > 0
    || signals.workIntake.length > 0;
}

function postureFor(projectState, options) {
  if (options.adapterOnly) return "ADAPTER_ONLY_RECOMMENDED";
  if (projectState.state === "BLOCKED_UNKNOWN_RISK") return "BLOCKED_NEEDS_OWNER";
  if (projectState.state === "DIRTY_WORKTREE_PROJECT") return "NATIVE_FIRST_PENDING_WORKTREE_REVIEW";
  if (projectState.state === "EXISTING_PRODUCTION_PROJECT") return "PRODUCTION_SAFE_NATIVE_OVERLAY";
  if (projectState.state === "EXISTING_GOVERNED_PROJECT") return "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW";
  if (projectState.state === "DEV_KIT_REPOSITORY") return "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW";
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
    inventoryRow("IntentOS assets", signals.aiNativeAssets, signals.aiNativeAssets.length ? "reuse and update through apply-plan" : "candidate only"),
  ];
}

function inventoryRow(area, assets, handling) {
  return {
    area,
    source: assets.length ? assets.join(", ") : "none detected",
    handling,
  };
}

function classifyRules(root, signals) {
  const candidates = [
    ...signals.agentRules,
    ...signals.governanceDocs.slice(0, 4),
    ...signals.releaseRollback.slice(0, 3),
    ...signals.ciGates.slice(0, 3),
  ];
  const unique = Array.from(new Set(candidates)).slice(0, 10);
  if (unique.length === 0) {
    const fallback = {
      ruleClassifications: [
        {
        ruleId: "R-001",
        sourceFile: "project scan",
        sourceStartLine: 1,
        sourceEndLine: 1,
        contextHeading: "project scan",
        sourceExcerpt: "No existing governance rule source detected.",
        ruleClass: "UNKNOWN_AUTHORITY",
        authority: "unknown",
        defaultHandling: "stop for classification",
        preserveOrReplace: "preserve until owner confirms",
        reason: "IntentOS cannot replace rules that were not found or owned.",
        riskSurfaces: "workflow",
        targetAction: "ask human to confirm native adoption scope",
        humanDecisionRequired: "Yes",
        confidence: "LOW",
      },
      ],
      ruleExtractionCoverage: [
        {
          sourceFile: "project scan",
          linesScanned: 0,
          rulesExtracted: 1,
          unclassifiedBlocks: [],
          parserWarnings: ["No existing governance rule source detected."],
        },
      ],
      parserWarnings: ["No existing governance rule source detected."],
    };
    return fallback;
  }

  const extractedRules = [];
  const coverage = [];
  const warnings = [];
  for (const rel of unique) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      coverage.push({
        sourceFile: rel,
        linesScanned: 0,
        rulesExtracted: 1,
        unclassifiedBlocks: [],
        parserWarnings: [`${rel} was detected as a path but not readable as a file.`],
      });
      warnings.push(`${rel} was detected as a path but not readable as a file.`);
      extractedRules.push({
        source_file: rel,
        source_start_line: 1,
        source_end_line: 1,
        source_excerpt: rel,
        context_heading: "path detected",
        rule_class: "UNKNOWN_AUTHORITY",
        authority: "unknown",
        default_handling: "stop for classification",
        preserve_or_replace: "preserve until classified",
        reason: "Detected path needs owner confirmation before migration.",
        risk_surfaces: "workflow",
        target_action: "ask human to classify authority",
        human_decision_required: "Yes",
        confidence: "LOW",
      });
      continue;
    }
    const content = fs.readFileSync(full, "utf8");
    const extracted = extractNativeRulesFromMarkdown(content, rel);
    coverage.push(toCoverage(extracted.coverage));
    warnings.push(...extracted.coverage.parser_warnings);
    extractedRules.push(...extracted.rules);
    if (extracted.rules.length === 0) {
      extractedRules.push({
        source_file: rel,
        source_start_line: 1,
        source_end_line: Math.max(1, content.split(/\r?\n/).length),
        source_excerpt: `No rule-like lines extracted from ${rel}.`,
        context_heading: "file scan",
        rule_class: "UNKNOWN_AUTHORITY",
        authority: "unknown",
        default_handling: "stop for classification",
        preserve_or_replace: "preserve until classified",
        reason: "The file was detected as governance-like but no rule-level extraction was confident.",
        risk_surfaces: "workflow",
        target_action: "ask human to classify authority",
        human_decision_required: "Yes",
        confidence: "LOW",
      });
    }
  }

  return {
    ruleClassifications: extractedRules.slice(0, 40).map((item, index) => ({
      ruleId: `R-${String(index + 1).padStart(3, "0")}`,
      sourceFile: item.source_file,
      sourceStartLine: item.source_start_line,
      sourceEndLine: item.source_end_line,
      contextHeading: item.context_heading,
      sourceExcerpt: item.source_excerpt,
      ruleClass: item.rule_class,
      authority: item.authority,
      defaultHandling: item.default_handling,
      preserveOrReplace: item.preserve_or_replace,
      reason: item.reason,
      riskSurfaces: item.risk_surfaces,
      targetAction: item.target_action,
      humanDecisionRequired: item.human_decision_required,
      confidence: item.confidence,
      detectedTerms: item.detected_terms || [],
    })),
    ruleExtractionCoverage: coverage,
    parserWarnings: warnings,
  };
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
    parserWarnings: coverage.parser_warnings,
  };
}

function structuredEvidenceFor(report) {
  return {
    schema_version: "1.63.0",
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

function conflictsFor(signals, posture, rules) {
  const conflicts = [];
  if (signals.agentRules.length > 0) {
    conflicts.push(conflict("C-001", "WORKFLOW_CONFLICT", signals.agentRules.join(", "), "IntentOS workflow authority", "IntentOS after reviewed plan and approval", "Yes"));
  }
  if (signals.releaseRollback.length > 0) {
    conflicts.push(conflict("C-002", "PRODUCTION_CONFLICT", signals.releaseRollback.slice(0, 4).join(", "), "Release Guide / Recipe / Handoff mapping", "Preserve SOP and map only", "Yes"));
  }
  if (signals.ciGates.length > 0 || signals.hooksAutomation.length > 0) {
    conflicts.push(conflict("C-003", "PRODUCTION_CONFLICT", [...signals.ciGates, ...signals.hooksAutomation].slice(0, 4).join(", "), "IntentOS checks / hook policy", "Map first; do not modify CI or hooks", "Yes"));
  }
  if (rules.some((item) => item.ruleClass === "UNKNOWN_AUTHORITY")) {
    conflicts.push(conflict("C-004", "OWNER_CONFLICT", "unknown-authority rule", "Native migration", "Stop until owner classifies rule", "Yes"));
  }
  if (posture === "NATIVE_FIRST_PENDING_WORKTREE_REVIEW") {
    conflicts.push(conflict("C-005", "OWNER_CONFLICT", "dirty worktree", "Native migration apply", "No writes until worktree boundary is resolved", "Yes"));
  }
  if (conflicts.length === 0) {
    conflicts.push(conflict("C-001", "WORKFLOW_CONFLICT", "no strong old workflow conflict detected", "IntentOS workflow authority", "Use IntentOS planning after human confirms", "Yes"));
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
    action(4, "Record human Approval Record for exact governance action IDs", "approval-records/001-native-governance.md", "No", "Yes", "Proposed"),
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
      oldWorkflowRules: "remain active until owner and authority are clarified",
      intentOsRules: "blocked from becoming workflow authority",
      transitionCondition: "human owner confirms migration posture and approves reviewed plan",
    };
  }
  return {
    oldWorkflowRules: "preserved until reviewed migration plan is approved",
    intentOsRules: "preferred future workflow authority for Codex planning",
    transitionCondition: "human approval of exact Native Migration Plan and related apply plan",
  };
}

function humanDecisionsFor(posture, projectState, signals) {
  const decisions = [
    decision("Confirm IntentOS-native planning posture", "human", posture === "BLOCKED_NEEDS_OWNER" ? "Needed now" : "Pending"),
    decision("Approve or reject governance replacement plan", "human", "Pending"),
    decision("Confirm which old rules are business or production constraints", "human", "Pending"),
  ];
  if (signals.agentRules.length > 0) decisions.push(decision("Approve AGENTS.md replacement only after classification and restore plan", "human", "Pending"));
  if (projectState.state === "DIRTY_WORKTREE_PROJECT") decisions.push(decision("Resolve dirty worktree before governance writes", "human", "Needed now"));
  if (projectState.productionSensitive === "Yes") decisions.push(decision("Confirm release/production owner for any release SOP mapping", "release owner", "Needed before apply"));
  return decisions;
}

function decision(name, owner, status) {
  return { decision: name, owner, status };
}

function recommendedNextStepFor(posture) {
  if (posture === "NATIVE_FIRST_PENDING_WORKTREE_REVIEW") return "Review current worktree and pause governance writes.";
  if (posture === "PRODUCTION_SAFE_NATIVE_OVERLAY") return "Review native migration plan with production/release constraints preserved.";
  if (posture === "ADAPTER_ONLY_RECOMMENDED" || posture === "BLOCKED_NEEDS_OWNER") return "Keep adapter-only read-only mapping until owner or authority is clear.";
  return "Review native migration plan, then prepare Unified Apply Plan only if human approves.";
}

function outcomeFor(posture) {
  if (posture === "BLOCKED_NEEDS_OWNER" || posture === "ADAPTER_ONLY_RECOMMENDED") return "NEEDS_HUMAN_DECISION";
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
  console.log("## Rule Extraction Coverage");
  console.log("");
  console.log("| Source file | Lines scanned | Rules extracted | Unclassified blocks | Parser warnings |");
  console.log("| --- | --- | --- | --- | --- |");
  for (const item of report.ruleExtractionCoverage) {
    console.log(`| ${item.sourceFile} | ${item.linesScanned} | ${item.rulesExtracted} | ${item.unclassifiedBlocks.length} | ${item.parserWarnings.length ? item.parserWarnings.join("<br>") : "None"} |`);
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
  console.log("| Backup path | `.ai-native/backups/native-migration/<timestamp>/` |");
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
  console.log(JSON.stringify(report.structuredEvidence, null, 2));
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
