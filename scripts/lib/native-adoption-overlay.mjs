import fs from "node:fs";
import path from "node:path";
import { kitRoot, loadManifest, normalizePath, sortedUnique } from "./manifest.mjs";

export const nativeAdoptionStages = Object.freeze([
  "READ_ONLY_DIAGNOSIS",
  "DOCS_BRIDGE",
  "SELECTED_ASSETS",
]);

// Retain the old export name for callers that still describe this value as a
// migration depth. New code should treat it as an adoption stage.
export const nativeAdoptionMigrationDepths = nativeAdoptionStages;

const legacyNativeAdoptionStageAliases = Object.freeze({
  ADAPTER_ONLY: "READ_ONLY_DIAGNOSIS",
});

export const selectedNativeOperationalProfile = "SELECTED_EXISTING_PROJECT";

const selectedOperationalRequiredAssets = Object.freeze([
  ".intentos/intentos-manifest.json",
  ".intentos/schemas/artifacts/apply-execution-receipt.schema.json",
  ".intentos/schemas/artifacts/approval-record.schema.json",
  ".intentos/schemas/artifacts/controlled-apply-readiness.schema.json",
  ".intentos/schemas/artifacts/request-bound-apply-authority.schema.json",
  ".intentos/schemas/artifacts/unified-apply-plan.schema.json",
  ".intentos/version.json",
  "AGENTS.md",
  "scripts/check-baseline-installation.mjs",
  "scripts/resolve-task-governance.mjs",
  "scripts/resolve-work-queue.mjs",
  "scripts/workflow-next.mjs",
]);

const selectedAgentGovernanceSections = Object.freeze([
  {
    markers: ["Mission", "Zero-Experience Solo Developer", "Core Rules"],
    content: [
      "## Mission / Zero-Experience Solo Developer / Core Rules",
      "",
      "This project uses the IntentOS selected native overlay. The user may state a business goal in natural language; Codex owns bounded technical routing, implementation, tests, review, evidence, repair, and rollback preparation.",
      "",
      "Preserve project-owned rules and business code. Do not infer permission for production, paid, external-account, real-user communication, or irreversible data effects.",
    ].join("\n"),
  },
  {
    markers: ["Bootstrap Entry", "Beginner Entry", "Natural Language Workflow Guidance"],
    content: [
      "## Bootstrap Entry / Beginner Entry / Natural Language Workflow Guidance",
      "",
      "For a normal project request, use the installed entrypoint:",
      "",
      "```bash",
      "node scripts/workflow-next.mjs . --json --intent \"<user goal>\"",
      "```",
      "",
      "Follow its structured blocker or next action. Files not listed in `.intentos/version.json` under `workflowAssets` are not part of this local installation; advanced maintenance must be planned from the IntentOS source checkout.",
    ].join("\n"),
  },
  {
    markers: ["Delivery Path Governance", "Debt & Knowledge Handoff", "Document Archive Apply"],
    content: [
      "## Delivery Path Governance / Debt & Knowledge Handoff / Document Archive Apply",
      "",
      "Choose the smallest project-valid delivery path, keep debt and knowledge handoff explicit, and archive or migrate documents only through a separately bounded action graph. Existing project history remains project-owned unless a separate migration is requested.",
    ].join("\n"),
  },
  {
    markers: ["Unified Apply Plan", "Apply Execution Receipt", "Release Approval Record", "Controlled Apply Readiness"],
    content: [
      "## Unified Apply Plan / Apply Execution Receipt / Release Approval Record / Controlled Apply Readiness",
      "",
      "Every write must belong to the exact reviewed plan, preserve rollback material when replacing managed content, and end with a verified receipt. Release approval is distinct from local implementation and never follows from installation alone.",
    ].join("\n"),
  },
  {
    markers: ["Project Hook Policy", "Project Onboarding", "Engineering Baseline", "Environment Baseline", "Platform Baseline", "Industrial Baseline", "Product Baseline And Claim Control", "Standard Baseline Packs", "Baseline Pack System"],
    content: [
      "## Project Hook Policy / Project Onboarding / Engineering Baseline / Environment Baseline / Platform Baseline / Industrial Baseline",
      "",
      "### Product Baseline And Claim Control / Standard Baseline Packs / Baseline Pack System",
      "",
      "Derive project identity and baselines from repository evidence. Hooks, platform integration, industrial packs, and stronger controls are capability choices made by Codex from risk and project facts; they are not installed or enabled merely because they exist.",
    ].join("\n"),
  },
  {
    markers: ["Workflow Artifact Generation", "Review Surface Governance", "Review Loop"],
    content: [
      "## Workflow Artifact Generation / Review Surface Governance / Review Loop",
      "",
      "Generate only artifacts required by the current request and selected capabilities. Review the real Git change boundary, applicable tests, produced evidence, and remaining risks before declaring completion.",
    ].join("\n"),
  },
  {
    markers: ["Goal Mode", "Subagent Orchestration", "Safe Launch", "Conversation Drift", "Bounded Next-Step", "Output Experience"],
    content: [
      "## Goal Mode / Subagent Orchestration / Safe Launch / Conversation Drift / Bounded Next-Step / Output Experience",
      "",
      "Keep work bound to the current goal. Delegate only independent scoped work, stop repeated failure loops, separate safe local progress from real-world effects, and present one clear next action in plain language.",
    ].join("\n"),
  },
  {
    markers: ["Task Execution Rules", "High-risk Boundaries", "Skill Governance", "Automation Governance"],
    content: [
      "## Task Execution Rules / High-risk Boundaries / Skill Governance / Automation Governance",
      "",
      "Require acceptance criteria for non-trivial work, verify changes in proportion to risk, and keep high-risk effects explicit. Skills and persistent automations may be used only within the current task authority and must not silently broaden project scope.",
    ].join("\n"),
  },
  {
    markers: ["Final Report"],
    content: [
      "## Final Report",
      "",
      "Report completed work, verification performed, items intentionally not changed, remaining risks, human decisions still needed, and the next safe action.",
    ].join("\n"),
  },
]);

const selectedAgentGovernanceMarkers = Object.freeze(
  selectedAgentGovernanceSections.flatMap((section) => section.markers),
);

export function selectedAgentGovernanceAppendix(missingMarkers = selectedAgentGovernanceMarkers) {
  const missing = new Set(missingMarkers);
  return [
    "",
    "# IntentOS Selected Native Overlay Governance",
    "",
    ...selectedAgentGovernanceSections
      .filter((section) => section.markers.some((marker) => missing.has(marker)))
      .map((section) => section.content),
    "",
  ].join("\n");
}

export function isTrustedSelectedAgentCreateAction(action, plan) {
  if (plan?.operationKind !== "NATIVE_ADOPTION"
    || plan?.executionState !== "EXECUTABLE"
    || plan?.arguments?.migrationDepth !== "SELECTED_ASSETS"
    || plan?.adoptionAssessment?.assessment_state !== "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION"
    || action?.type !== "CREATE"
    || normalizePath(action?.path) !== "AGENTS.md"
    || action?.source
    || action?.hashBefore
    || action?.capability !== "PROJECT_ENTRY"
    || action?.selectionEvidence !== plan.adoptionAssessment.assessment_digest
    || typeof action?.inlineContentBase64 !== "string") return false;
  let proposed;
  try {
    proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
  } catch {
    return false;
  }
  return proposed === `${selectedAgentGovernanceAppendix().trim()}\n`;
}

export function normalizeNativeAdoptionMigrationDepth(value, fallback = "READ_ONLY_DIAGNOSIS") {
  const requested = String(value || fallback).trim().toUpperCase();
  const normalized = legacyNativeAdoptionStageAliases[requested] || requested;
  if (!nativeAdoptionStages.includes(normalized)) {
    throw new Error(`Native adoption stage must be one of: ${nativeAdoptionStages.join(", ")}`);
  }
  return normalized;
}

export function resolveNativeAdoptionStage(input = {}) {
  const requestedStage = normalizeNativeAdoptionMigrationDepth(input.requestedStage);
  const reconciliationPath = String(input.reconciliationPath || "READ_ONLY_DIAGNOSIS").trim().toUpperCase();
  const scanState = String(input.scanState || "UNKNOWN");
  const profileReconciliationState = String(input.profileReconciliationState || "NOT_EVALUATED").trim().toUpperCase();
  const governanceBacklogState = String(input.governanceBacklogState || "NOT_EVALUATED").trim().toUpperCase();
  const deferredGovernanceBacklog = governanceBacklogState === "BOUNDED_NON_BLOCKING";
  const scanComplete = ["COMPLETE_NO_ACTIONABLE_RULES", "COMPLETE_ACTIONABLE_RULES"].includes(scanState);
  const operationalPath = deferredGovernanceBacklog ? "SELECTED_ASSETS" : reconciliationPath;
  const requiredStages = operationalPath === "SELECTED_ASSETS"
    ? ["READ_ONLY_DIAGNOSIS", "SELECTED_ASSETS"]
    : operationalPath === "DOCS_BRIDGE_THEN_SELECTED_ASSETS"
      ? ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE", "SELECTED_ASSETS"]
      : operationalPath === "DOCS_BRIDGE"
        ? ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"]
        : ["READ_ONLY_DIAGNOSIS"];
  const transitionEvidence = {
    scan_state: scanState,
    recommendation: String(input.recommendation || "UNKNOWN"),
    reconciliation_path: reconciliationPath,
    can_recommend_apply_plan_now: String(input.canRecommendApplyPlanNow || "No"),
    profile_reconciliation_state: profileReconciliationState,
    governance_backlog_state: governanceBacklogState,
  };
  const selectedAssetsEligible = deferredGovernanceBacklog || (scanComplete
    && input.recommendation === "SELECTED_NATIVE_ADOPTION"
    && input.canRecommendApplyPlanNow === "Yes"
    && ["SELECTED_ASSETS", "DOCS_BRIDGE_THEN_SELECTED_ASSETS"].includes(reconciliationPath));
  const blockers = [];

  if (requestedStage === "READ_ONLY_DIAGNOSIS") {
    return {
      requested_stage: requestedStage,
      reconciliation_path: reconciliationPath,
      state: "READ_ONLY_DIAGNOSIS_COMPLETE",
      required_stages: requiredStages,
      completed_stages: ["READ_ONLY_DIAGNOSIS"],
      next_stage: scanComplete
        ? operationalPath === "SELECTED_ASSETS" ? "SELECTED_ASSETS" : "DOCS_BRIDGE"
        : deferredGovernanceBacklog ? "SELECTED_ASSETS"
        : null,
      selected_assets_eligible: selectedAssetsEligible ? "Yes" : "No",
      write_graph_allowed: "No",
      transition_evidence: transitionEvidence,
      blockers: scanComplete || deferredGovernanceBacklog
        ? []
        : ["Complete the bounded existing-rule scan before advancing adoption."],
    };
  }

  if (requestedStage === "DOCS_BRIDGE") {
    if (profileReconciliationState === "ADDITIVE_RECONCILIATION_REQUIRED") {
      return {
        requested_stage: requestedStage,
        reconciliation_path: reconciliationPath,
        state: blockers.length > 0 ? "DOCS_BRIDGE_BLOCKED" : "DOCS_BRIDGE_READY",
        required_stages: requiredStages,
        completed_stages: ["READ_ONLY_DIAGNOSIS"],
        next_stage: blockers.length > 0 ? null : "DOCS_BRIDGE",
        selected_assets_eligible: "No",
        write_graph_allowed: blockers.length > 0 ? "No" : "Yes",
        transition_evidence: transitionEvidence,
        blockers,
      };
    }
    if (!["DOCS_BRIDGE", "DOCS_BRIDGE_THEN_SELECTED_ASSETS", "SELECTED_ASSETS"].includes(reconciliationPath)) {
      blockers.push(`Reconciliation path ${reconciliationPath} does not permit a docs bridge.`);
    }
    if (!scanComplete) blockers.push("Existing-rule scan is not complete.");
    if (["INCOMPLETE", "CONFLICT"].includes(profileReconciliationState)) {
      blockers.push(`Project profile reconciliation is ${profileReconciliationState}.`);
    }
    if (profileReconciliationState === "CURRENT") {
      return {
        requested_stage: requestedStage,
        reconciliation_path: reconciliationPath,
        state: blockers.length > 0
          ? "DOCS_BRIDGE_BLOCKED"
          : selectedAssetsEligible ? "READY_FOR_SELECTED_ASSETS" : "DOCS_BRIDGE_COMPLETE",
        required_stages: requiredStages,
        completed_stages: blockers.length > 0
          ? ["READ_ONLY_DIAGNOSIS"]
          : ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"],
        next_stage: blockers.length === 0 && selectedAssetsEligible ? "SELECTED_ASSETS" : null,
        selected_assets_eligible: blockers.length === 0 && selectedAssetsEligible ? "Yes" : "No",
        write_graph_allowed: "No",
        transition_evidence: transitionEvidence,
        blockers,
      };
    }
    return {
      requested_stage: requestedStage,
      reconciliation_path: reconciliationPath,
      state: blockers.length > 0
        ? "DOCS_BRIDGE_BLOCKED"
        : selectedAssetsEligible ? "READY_FOR_SELECTED_ASSETS" : "DOCS_BRIDGE_REVIEW_REQUIRED",
      required_stages: requiredStages,
      completed_stages: scanComplete
        ? ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"]
        : ["READ_ONLY_DIAGNOSIS"],
      next_stage: blockers.length === 0 && selectedAssetsEligible ? "SELECTED_ASSETS" : null,
      selected_assets_eligible: selectedAssetsEligible ? "Yes" : "No",
      write_graph_allowed: "No",
      transition_evidence: transitionEvidence,
      blockers,
    };
  }

  if (!scanComplete && !deferredGovernanceBacklog) blockers.push("Existing-rule scan is not complete.");
  if (!selectedAssetsEligible) {
    blockers.push("Current reconciliation does not authorize selected-assets planning.");
  }
  return {
    requested_stage: requestedStage,
    reconciliation_path: reconciliationPath,
    state: blockers.length === 0 ? "SELECTED_ASSETS_READY" : "SELECTED_ASSETS_BLOCKED",
    required_stages: requiredStages,
    completed_stages: blockers.length === 0
      ? requiredStages.filter((stage) => stage !== "SELECTED_ASSETS")
      : ["READ_ONLY_DIAGNOSIS"],
    next_stage: null,
    selected_assets_eligible: selectedAssetsEligible ? "Yes" : "No",
    write_graph_allowed: blockers.length === 0 ? "Yes" : "No",
    transition_evidence: transitionEvidence,
    blockers,
  };
}

export function nativeAdoptionOperationalPolicy(version) {
  const selected = version?.projectEntryOrigin === "EXISTING_PROJECT"
    && version?.assetMigrationDepth === "SELECTED_ASSETS";
  if (!selected) {
    return {
      profile: "FULL_NATIVE_PROJECT",
      selected: false,
      valid: true,
      missingRequiredAssets: [],
      defersFullProjectOnboarding: false,
      defersProfileRequiredDocs: false,
      defersBaselineSatisfaction: false,
    };
  }

  const declared = new Set(Array.isArray(version.workflowAssets) ? version.workflowAssets : []);
  const missingRequiredAssets = selectedOperationalRequiredAssets
    .filter((relative) => !declared.has(relative));
  return {
    profile: selectedNativeOperationalProfile,
    selected: true,
    valid: missingRequiredAssets.length === 0,
    missingRequiredAssets,
    defersFullProjectOnboarding: true,
    defersProfileRequiredDocs: true,
    defersBaselineSatisfaction: true,
  };
}

export function selectedNativeBaselineReadiness(policy, baseline) {
  if (!policy?.selected || !policy.valid) {
    return {
      ready: false,
      state: "SELECTED_OPERATIONAL_PROFILE_INVALID",
      reasons: policy?.missingRequiredAssets || [],
      deferredEvidence: [],
    };
  }

  const reasons = [];
  if (!Array.isArray(baseline?.selectedProfiles) || baseline.selectedProfiles.length === 0) {
    reasons.push("selected project profile is missing");
  }
  if (Array.isArray(baseline?.missingProfiles) && baseline.missingProfiles.length > 0) {
    reasons.push(`selected profile assets are missing: ${baseline.missingProfiles.join(", ")}`);
  }
  if (Array.isArray(baseline?.incompatibleStarters) && baseline.incompatibleStarters.length > 0) {
    reasons.push("selected profile is incompatible with the installed starter identity");
  }
  if (![
    "BASELINE_READY",
    "BASELINE_DOCS_MISSING",
    "STANDARD_PACK_EVIDENCE_INCOMPLETE",
    "ENVIRONMENT_BASELINE_INCOMPLETE",
  ].includes(baseline?.rawState)) {
    reasons.push(`selected baseline mapping is not structurally ready: ${baseline?.rawState || "UNKNOWN"}`);
  }
  if (baseline?.baselineInstallationState !== "READY") {
    reasons.push(`selected baseline installation is not ready: ${baseline?.baselineInstallationState || "UNKNOWN"}`);
  }

  const deferredEvidence = [];
  if (baseline?.standardPackEvidenceState !== "READY") {
    deferredEvidence.push(`standard-pack evidence: ${baseline?.standardPackEvidenceState || "UNKNOWN"}`);
  }
  if (baseline?.environmentBaseline?.required === true
    && baseline.environmentBaseline.state !== "READY") {
    deferredEvidence.push(`environment baseline: ${baseline.environmentBaseline.state || "UNKNOWN"}`);
  }

  return {
    ready: reasons.length === 0,
    state: reasons.length === 0 ? "SELECTED_BASELINE_MAPPING_READY" : "SELECTED_BASELINE_MAPPING_INCOMPLETE",
    reasons,
    deferredEvidence,
  };
}

export function selectedNativeIndustrialReadiness(policy, baseline) {
  if (!policy?.selected || !policy.valid) {
    return {
      ready: false,
      state: "SELECTED_OPERATIONAL_PROFILE_INVALID",
      reasons: policy?.missingRequiredAssets || [],
      deferredEvidence: [],
    };
  }

  const baselineLevel = String(baseline?.baselineLevel || "");
  if (baselineLevel !== "BL2_INDUSTRIAL") {
    const ready = baseline?.state === "NOT_APPLICABLE";
    return {
      ready,
      state: ready ? "SELECTED_INDUSTRIAL_MAPPING_NOT_APPLICABLE" : "SELECTED_INDUSTRIAL_MAPPING_INCOMPLETE",
      reasons: ready ? [] : [`selected industrial mapping is not structurally ready: ${baseline?.state || "UNKNOWN"}`],
      deferredEvidence: [],
    };
  }

  const structurallyReadyStates = new Set(["BASELINE_READY", "EVIDENCE_MISSING", "EVIDENCE_INVALID"]);
  const reasons = [];
  if (!structurallyReadyStates.has(baseline?.state)) {
    reasons.push(`selected industrial mapping is not structurally ready: ${baseline?.state || "UNKNOWN"}`);
  }
  if (!Array.isArray(baseline?.selectedIndustrialPacks) || baseline.selectedIndustrialPacks.length === 0) {
    reasons.push("selected industrial packs are missing");
  }
  if (baseline?.profileDocuments?.conflict) {
    reasons.push(`selected industrial profile documents conflict: ${baseline.profileDocuments.conflict.reason || "unknown conflict"}`);
  }
  for (const [key, label] of [
    ["unknownPacks", "unknown"],
    ["plannedPacks", "not available"],
    ["invalidPacks", "invalid"],
    ["incompatiblePacks", "incompatible"],
  ]) {
    if (Array.isArray(baseline?.[key]) && baseline[key].length > 0) {
      reasons.push(`selected industrial packs are ${label}: ${baseline[key].map((item) => item?.packId || item).join(", ")}`);
    }
  }

  const deferredEvidence = ["EVIDENCE_MISSING", "EVIDENCE_INVALID"].includes(baseline?.state)
    ? [`industrial baseline evidence: ${baseline.state}`]
    : [];
  return {
    ready: reasons.length === 0,
    state: reasons.length === 0 ? "SELECTED_INDUSTRIAL_MAPPING_READY" : "SELECTED_INDUSTRIAL_MAPPING_INCOMPLETE",
    reasons,
    deferredEvidence,
  };
}

export function selectedNativeOverlayAssets(root = kitRoot, options = {}) {
  const manifest = options.manifest || loadManifest(root);
  const policy = manifest.adoptionPolicies?.selectedAssets;
  if (!policy) throw new Error("IntentOS manifest is missing adoptionPolicies.selectedAssets");

  const targetScope = new Set(manifest.groups?.[policy.targetGroup] || []);
  const selectedByTarget = new Map();
  for (const groupName of policy.includeGroups || []) {
    const capability = capabilityForGroup(policy, groupName);
    for (const target of manifest.groups?.[groupName] || []) {
      const normalized = normalizePath(target);
      if (!targetScope.has(normalized)) continue;
      const entry = selectedByTarget.get(normalized) || {
        target: normalized,
        sourceGroups: [],
        capabilities: [],
      };
      entry.sourceGroups.push(groupName);
      entry.capabilities.push(capability);
      selectedByTarget.set(normalized, entry);
    }
  }
  for (const target of policy.requiredTargets || []) {
    const normalized = normalizePath(target);
    if (!targetScope.has(normalized)) {
      throw new Error(`Selected adoption required target is outside ${policy.targetGroup}: ${normalized}`);
    }
    const entry = selectedByTarget.get(normalized) || {
      target: normalized,
      sourceGroups: [],
      capabilities: [],
    };
    entry.sourceGroups.push("requiredTargets");
    entry.capabilities.push("INSTALLATION_IDENTITY");
    selectedByTarget.set(normalized, entry);
  }
  for (const target of staticRuntimeClosure(root, policy.runtimeEntrypoints || [])) {
    if (!targetScope.has(target)) {
      throw new Error(`Selected adoption runtime dependency is outside ${policy.targetGroup}: ${target}`);
    }
    const entry = selectedByTarget.get(target) || {
      target,
      sourceGroups: [],
      capabilities: [],
    };
    entry.sourceGroups.push("runtimeEntrypoints");
    entry.capabilities.push("OPERATING_RUNTIME");
    selectedByTarget.set(target, entry);
  }

  const copyRules = manifest.copyRules || {};
  return [...selectedByTarget.values()]
    .map((entry) => ({
      ...entry,
      source: sourceForTarget(root, entry.target, copyRules),
      sourceGroups: sortedUnique(entry.sourceGroups),
      capabilities: [...new Set(entry.capabilities)].sort(),
    }))
    .filter((entry) => entry.source !== null)
    .sort((left, right) => left.target.localeCompare(right.target));
}

function staticRuntimeClosure(root, entrypoints) {
  const pending = [...entrypoints].map(normalizePath);
  const visited = new Set();
  while (pending.length > 0) {
    const relative = pending.shift();
    if (visited.has(relative)) continue;
    const file = path.join(root, relative);
    if (!relative.startsWith("scripts/") || !fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
      throw new Error(`Selected adoption runtime entry or dependency is unavailable: ${relative}`);
    }
    visited.add(relative);
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(/(?:from\s*|import\s*)["']([^"']+\.mjs)["']/g)) {
      if (!match[1].startsWith(".")) continue;
      const dependency = normalizePath(path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1])));
      if (!dependency.startsWith("scripts/")) {
        throw new Error(`Selected adoption runtime import escapes scripts/: ${relative} -> ${match[1]}`);
      }
      if (!visited.has(dependency)) pending.push(dependency);
    }
  }
  return [...visited].sort();
}

export function nativeAdoptionActionCapability(relativePath) {
  const target = normalizePath(relativePath);
  if (target === "AGENTS.md") return "PROJECT_ENTRY";
  if (target === ".intentos/version.json" || target === ".intentos/intentos-manifest.json") return "INSTALLATION_IDENTITY";
  if (target.startsWith("scripts/")) return "OPERATING_RUNTIME";
  if (target.startsWith(".intentos/profiles/")
    || target.startsWith(".intentos/standard-baseline-packs/")
    || target.startsWith(".intentos/industrial-packs/")
    || target === "baseline-gap-reports/intentos-baseline-reconciliation.md"
    || [
      "docs/project-profile.md",
      "docs/engineering-baseline.md",
      "docs/environment-baseline.md",
      "docs/baseline-selection.md",
      "docs/baseline-evidence.md",
    ].includes(target)) return "BASELINE_MAPPING";
  if (/^(?:requests|work-queue)\//.test(target)) return "CURRENT_REQUEST_BRIDGE";
  if (target.startsWith("apply-receipts/")) return "APPLY_EVIDENCE";
  if (target.startsWith("docs/")) return "PROJECT_MAPPING";
  if (target.startsWith(".intentos/")) return "GOVERNANCE_CORE";
  return "UNCLASSIFIED";
}

function capabilityForGroup(policy, groupName) {
  const capability = policy.capabilities?.[groupName];
  if (!capability) throw new Error(`Selected adoption policy has no capability for group ${groupName}`);
  return capability;
}

function sourceForTarget(root, target, copyRules) {
  const exact = (copyRules.files || []).find((rule) => normalizePath(rule.target) === target);
  if (exact) return requireRegularSource(root, normalizePath(exact.source), target);

  for (const rule of copyRules.directories || []) {
    const targetRoot = normalizePath(rule.target).replace(/\/$/, "");
    if (!target.startsWith(`${targetRoot}/`)) continue;
    const relative = target.slice(targetRoot.length + 1);
    const source = normalizePath(path.posix.join(normalizePath(rule.source), relative));
    return requireRegularSource(root, source, target);
  }
  const targetPath = path.join(root, target);
  if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isFile()) return target;
  if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isDirectory()) return null;
  if ((copyRules.files || []).some((rule) => normalizePath(rule.target).startsWith(`${target}/`))
    || (copyRules.directories || []).some((rule) => normalizePath(rule.target).startsWith(`${target}/`))) {
    return null;
  }
  throw new Error(`Selected adoption target has no copy source: ${target}`);
}

function requireRegularSource(root, source, target) {
  const full = path.join(root, source);
  if (!fs.existsSync(full)) throw new Error(`Selected adoption source is missing for ${target}: ${source}`);
  const stat = fs.lstatSync(full);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    if (stat.isDirectory()) return null;
    throw new Error(`Selected adoption source is not a regular file for ${target}: ${source}`);
  }
  return source;
}
