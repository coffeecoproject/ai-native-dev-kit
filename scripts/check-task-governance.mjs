#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/task-governance.schema.json");
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/behavior-complete-existing-project-adoption.md",
  "docs/behavior-complete-existing-project-adoption.md",
  "templates/task-governance-report.md",
  "schemas/artifacts/task-governance.schema.json",
  "checklists/task-governance-review.md",
  "prompts/task-governance-agent.md",
  "scripts/resolve-task-governance.mjs",
  "scripts/check-task-governance.mjs",
];
const requiredDirectories = ["task-governance-reports"];
const requiredSections = [
  "Human Summary",
  "Impact Classification",
  "Excluded High-Impact Surfaces",
  "Required Before Implementation Review",
  "Required Before Completion Claim",
  "Review Policy",
  "Existing Project Mapping",
  "Source Chain",
  "Lightweight Close-Out",
  "Readiness",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
];
const highSurfacePatterns = [
  /\bDB\b|database|schema|migration|数据库|迁移/i,
  /API contract|public API|DTO|domain boundary|接口契约|对外接口/i,
  /runtime state|state machine|workflow state|状态机|状态推进/i,
  /permission|auth|role|rbac|audit|权限|角色|审计/i,
  /business rule|approval|review|settlement|payment|finance|tax|业务规则|审批|审核|结算|支付|财务|税务/i,
  /release|production|rollback|CI|hook|deploy|发布|上线|生产|回滚/i,
];
const lowKinds = new Set(["docs_only", "test_docs_only", "copy", "visual_only"]);
const userBurdenPatterns = [
  /Task Governance/i,
  /Review Policy/i,
  /Business Rule Closure/i,
  /Change Impact Coverage/i,
  /Execution Assurance/i,
  /Completion Evidence/i,
  /\bBRC\b/,
  /\bCIC\b/,
  /是否进入/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Task Governance Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();
emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/behavior-complete-existing-project-adoption.md"),
    readResolved("docs/behavior-complete-existing-project-adoption.md"),
    readResolved("templates/task-governance-report.md"),
    readResolved("schemas/artifacts/task-governance.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Behavior-Complete Existing Project Adoption",
    "LOW",
    "MEDIUM",
    "POSSIBLE_HIGH",
    "HIGH",
    "task_governance",
    "implementation_authorized_by_this_report",
    "does not authorize implementation",
  ]) {
    if (combined.includes(marker)) pass(`task governance docs include ${marker}`);
    else fail(`task governance docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("task-governance-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("task governance check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Task Governance reports found");
    else pass("SKIPPED_NO_REPORT: no Task Governance reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Task Governance report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  if (content.includes("does not authorize implementation")) pass(`${label} states no implementation authorization`);
  else fail(`${label} must state no implementation authorization`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const userFacing = [
    sectionBody(content, "Human Summary") || "",
    sectionBody(content, "Readiness") || "",
  ].join("\n");
  for (const pattern of userBurdenPatterns) {
    if (pattern.test(userFacing)) fail(`${label} exposes technical workflow burden to user: ${pattern.source}`);
  }
  checkBoundaryTables(content, label);
  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "task_governance_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, evidence);
}

function checkStructuredEvidence(content, label, file, evidence) {
  if (reportRefCandidates(file).includes(evidence.task_governance_ref)) pass(`${label} task_governance_ref points to this report`);
  else fail(`${label} task_governance_ref ${evidence.task_governance_ref || "<missing>"} must point to this report`);
  if (evidence.outcome && stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} outcome matches Markdown`);
  else fail(`${label} Outcome must include structured outcome`);

  const boundaries = evidence.boundaries || {};
  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["authorizes_implementation", "No"],
    ["approves_commit_or_push", "No"],
    ["approves_release_or_production", "No"],
    ["executes_tests", "No"],
    ["executes_migrations", "No"],
    ["changes_ci_or_hooks", "No"],
  ]) {
    if (boundaries[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }
  if (evidence.readiness?.implementation_authorized_by_this_report === "No") pass(`${label} implementation_authorized_by_this_report is No`);
  else fail(`${label} implementation_authorized_by_this_report must be No`);
  if (evidence.readiness?.can_claim_done === "No") pass(`${label} can_claim_done is No`);
  else fail(`${label} can_claim_done must be No`);
  checkUserPromptBurden(label, evidence);

  if (evidence.schema_version === "1.108.0") {
    if (sectionBody(content, "Business Universe Routing")) pass(`${label} includes Business Universe Routing`);
    else fail(`${label} 1.108.0 report missing Business Universe Routing`);
    checkBusinessUniverseRouting(label, evidence);
  }

  const impact = evidence.impact_classification?.task_impact;
  if (["LOW", "MEDIUM", "POSSIBLE_HIGH", "HIGH"].includes(impact)) pass(`${label} task impact is ${impact}`);
  else fail(`${label} task impact must be LOW, MEDIUM, POSSIBLE_HIGH, or HIGH`);

  checkSourceChain(label, projectRoot, file, evidence);
  checkExistingProjectMapping(label, evidence);
  checkReadinessRespectsProjectNativeMappings(label, evidence);
  checkReviewPolicy(label, evidence);
  checkTierRules(label, evidence);
  checkMarkdownConsistency(content, label, evidence);
}

function checkUserPromptBurden(label, evidence) {
  const userText = [
    evidence.user_prompt?.plain_user_summary || "",
    evidence.user_prompt?.plain_next_step || "",
  ].join("\n");
  if (!userText.trim()) {
    fail(`${label} user prompt must include plain user summary and next step`);
    return;
  }
  if (evidence.user_prompt?.technical_terms_required === "No") pass(`${label} user prompt does not require technical terms`);
  else fail(`${label} user prompt must not require technical terms`);
  for (const pattern of userBurdenPatterns) {
    if (pattern.test(userText)) fail(`${label} user prompt exposes technical workflow burden: ${pattern.source}`);
  }
}

function checkTierRules(label, evidence) {
  const classification = evidence.impact_classification || {};
  const impact = classification.task_impact;
  const beforeImplementation = evidence.required_before_implementation_review || {};
  const beforeCompletion = evidence.required_before_completion_claim || {};
  const readiness = evidence.readiness || {};
  const closeout = evidence.lightweight_closeout || {};
  const highSurfaceText = [
    evidence.intent || "",
    ...(classification.triggered_surfaces || []),
    ...(classification.trigger_evidence || []),
  ].join("\n");
  const rawIntentHighSurface = hasHighSurface(evidence.intent || "");
  const universeRequired = evidence.business_universe_routing?.required || "No";

  if (evidence.schema_version === "1.108.0") {
    requireRequirement(label, beforeImplementation, "business_universe_coverage_required", universeRequired);
  }

  if (evidence.adoption_review?.blocks_task_governance === "Yes") {
    if (evidence.outcome === "BLOCKED_BY_ADOPTION_REVIEW") pass(`${label} adoption blocker drives blocked outcome`);
    else fail(`${label} must be BLOCKED_BY_ADOPTION_REVIEW when adoption review blocks task governance`);
    if (readiness.ready_for_implementation_review === "No") pass(`${label} adoption blocker prevents implementation review readiness`);
    else fail(`${label} adoption blocker must prevent implementation review readiness`);
  }

  if (impact === "LOW") {
    if (classification.low_impact_reason) pass(`${label} LOW has low-impact reason`);
    else fail(`${label} LOW requires low-impact reason`);
    if (lowKinds.has(classification.task_kind)) pass(`${label} LOW has valid task_kind`);
    else fail(`${label} LOW task_kind must be one of ${Array.from(lowKinds).join(", ")}`);
    if (!hasHighSurface(highSurfaceText)) pass(`${label} LOW has no high-impact triggered surface`);
    else fail(`${label} LOW must not touch API, DB, runtime, permissions, release, production, business rules, state, CI, gates, or test behavior`);
    if (!rawIntentHighSurface) pass(`${label} LOW intent has no hidden high-impact surface`);
    else fail(`${label} LOW intent contains high-impact wording and must be upgraded or explicitly inspected`);
    requireExcludedHighSurfaces(label, classification);
    requireRequirement(label, beforeImplementation, "scope_check_required", "Yes");
    requireRequirement(label, beforeImplementation, "short_plan_required", "No");
    requireRequirement(label, beforeCompletion, "test_evidence_required", "No");
    if (closeout.scope_unchanged === "Yes") pass(`${label} LOW records scope unchanged`);
    else fail(`${label} LOW requires scope unchanged evidence`);
    if (["REQUIRED", "RECORDED"].includes(closeout.minimal_verification_status)
      || (closeout.minimal_verification_status === "NOT_APPLICABLE_WITH_REASON" && closeout.remaining_risk)) {
      pass(`${label} LOW records minimal verification status`);
    } else {
      fail(`${label} LOW requires minimal verification status without claiming unperformed work is done`);
    }
  }

  if (impact === "MEDIUM") {
    if (classification.medium_impact_reason) pass(`${label} MEDIUM has medium-impact reason`);
    else fail(`${label} MEDIUM requires medium-impact reason`);
    if (!hasHighSurface(highSurfaceText)) pass(`${label} MEDIUM has no high-impact triggered surface`);
    else fail(`${label} MEDIUM must not include public API, DTO/domain, persisted parameter, permission, runtime-state, release, or production impact`);
    if (!rawIntentHighSurface) pass(`${label} MEDIUM intent has no hidden high-impact surface`);
    else fail(`${label} MEDIUM intent contains high-impact wording and must be upgraded or explicitly inspected`);
    requireExcludedHighSurfaces(label, classification);
    requireRequirement(label, beforeImplementation, "scope_check_required", "Yes");
    requireRequirement(label, beforeImplementation, "short_plan_required", "Yes");
    if (["REQUIRED", "RECORDED"].includes(closeout.targeted_verification_status)) pass(`${label} MEDIUM records targeted verification status`);
    else fail(`${label} MEDIUM requires targeted verification status without claiming unperformed work is done`);
  }

  if (impact === "POSSIBLE_HIGH") {
    const resolution = classification.possible_high_resolution || {};
    if (resolution.initial_state === "POSSIBLE_HIGH" && /NEEDS_|DOWNGRADED_TO_|CONFIRMED_HIGH/.test(String(resolution.resolution))) {
      pass(`${label} POSSIBLE_HIGH records resolution state`);
    } else {
      fail(`${label} POSSIBLE_HIGH requires clarification or read-only inspection resolution`);
    }
    if (readiness.ready_for_implementation_review === "No") pass(`${label} POSSIBLE_HIGH blocks implementation review`);
    else fail(`${label} POSSIBLE_HIGH must not proceed as LOW or MEDIUM without clarification or inspection evidence`);
  }

  if (impact === "HIGH") {
    for (const [field, expected] of [
      ["scope_check_required", "Yes"],
      ["business_rule_closure_required", "Yes"],
      ["change_impact_coverage_required", "Yes"],
      ["execution_plan_required", "Yes"],
      ["verification_plan_required", "Yes"],
    ]) {
      requireRequirement(label, beforeImplementation, field, expected);
    }
    for (const [field, expected] of [
      ["test_evidence_required", "Yes"],
      ["execution_assurance_required", "Yes"],
      ["completion_evidence_required", "Yes"],
    ]) {
      requireRequirement(label, beforeCompletion, field, expected);
    }
    if (readiness.ready_for_implementation_review === "Yes") {
      requireReadySource(label, evidence, "Business Rule Closure");
      requireReadySource(label, evidence, "Change Impact Coverage");
      requireReadySource(label, evidence, "Execution Plan");
      requireReadySource(label, evidence, "Verification Plan");
    } else {
      if ((readiness.blocked_by || []).length > 0) pass(`${label} HIGH blocks until required governance exists`);
      else fail(`${label} HIGH not ready must list missing governance blockers`);
    }
  }
}

function checkSourceChain(label, root, file, evidence) {
  for (const source of evidence.source_chain || []) {
    if (!source.ref || !source.digest || !source.state || !source.current_task_match) {
      fail(`${label} source ${source.name || "<unknown>"} must include ref, digest, state, and task match`);
      continue;
    }
    if (source.status === "NOT_APPLICABLE") {
      if (source.not_applicable_reason) pass(`${label} source ${source.name} has not-applicable reason`);
      else fail(`${label} source ${source.name} requires not_applicable_reason`);
    }
    if (source.ref.startsWith("artifact:") && source.status !== "MISSING") {
      const resolved = resolveArtifactRef(root, file, source.ref);
      if (!resolved) {
        fail(`${label} source ${source.name} ref does not resolve: ${source.ref}`);
      } else if (source.digest.startsWith("sha256:")) {
        const actual = digest(fs.readFileSync(resolved, "utf8"));
        if (source.digest === actual) pass(`${label} source ${source.name} digest matches`);
        else fail(`${label} source ${source.name} digest mismatch`);
      }
    }
  }
}

function checkExistingProjectMapping(label, evidence) {
  for (const mapping of evidence.existing_project_mapping || []) {
    checkProjectNativeEvidenceBinding(label, mapping);
    if (mapping.mapping_state === "STRONGER") {
      if (mapping.stronger_project_rule_preserved === "Yes") pass(`${label} preserves stronger project-native rule`);
      else fail(`${label} STRONGER project-native rule must be preserved`);
    }
  }
}

function checkReadinessRespectsProjectNativeMappings(label, evidence) {
  const blockers = (evidence.readiness?.blocked_by || []).join("\n");
  for (const mapping of evidence.existing_project_mapping || []) {
    if (!["MATCHED", "STRONGER"].includes(mapping.mapping_state)) continue;
    if (mapping.project_native_task_match !== "Yes") continue;
    const behavior = mapping.required_behavior || "";
    if (behavior === "Business Rule Closure") {
      if (!/missing clear business rule or project-native equivalent/i.test(blockers)) {
        pass(`${label} readiness respects project-native Business Rule Closure mapping`);
      } else {
        fail(`${label} readiness must not keep Business Rule Closure missing when project-native mapping is matched`);
      }
    }
    if (behavior === "Verification Plan") {
      if (!/missing verification checklist/i.test(blockers)) {
        pass(`${label} readiness respects project-native Verification Plan mapping`);
      } else {
        fail(`${label} readiness must not keep Verification Plan missing when project-native mapping is matched`);
      }
    }
  }
}

function checkReviewPolicy(label, evidence) {
  const impact = evidence.impact_classification?.task_impact;
  const policy = evidence.review_policy || {};
  const coverage = new Set(policy.review_must_cover || []);
  const expected = {
    LOW: {
      review_level: "LIGHTWEIGHT",
      independent_review_required: "No",
      review_must_happen_before: "completion_claim",
      review_source: "codex_self_check",
      coverage: ["scope unchanged", "excluded high-impact surfaces", "minimal verification or explicit reason", "unrelated edits check"],
    },
    MEDIUM: {
      review_level: "TARGETED",
      independent_review_required: "Conditional",
      review_must_happen_before: "completion_claim",
      review_source: "targeted_checker_or_project_review",
      coverage: [
        "short plan", "bounded impact surface",
        ...(evidence.business_universe_routing?.required === "Yes" ? ["business universe coverage", "business rule closure", "change impact coverage", "verification plan"] : []),
        "excluded high-impact surfaces", "targeted verification", "unrelated edits check",
      ],
    },
    POSSIBLE_HIGH: {
      review_level: "BLOCKING_CLARIFICATION",
      independent_review_required: "Yes",
      review_must_happen_before: "implementation_review",
      review_source: "human_or_read_only_inspection",
      coverage: [
        "clarification or read-only inspection", "high-impact surface decision", "upgrade or downgrade rationale",
        ...(evidence.business_universe_routing?.required === "Yes" ? ["business universe coverage", "business rule closure", "change impact coverage", "verification plan"] : []),
      ],
    },
    HIGH: {
      review_level: "FULL",
      independent_review_required: "Yes",
      review_must_happen_before: "implementation_and_completion",
      review_source: "review_loop_or_project_native_review",
      coverage: [
        ...(evidence.business_universe_routing?.required === "Yes" ? ["business universe coverage"] : []),
        "business rule closure",
        "change impact coverage",
        "execution plan",
        "verification plan",
        "test evidence",
        "execution assurance",
        "completion evidence",
      ],
    },
  }[impact];

  if (!expected) return;
  if (policy.review_level === expected.review_level) pass(`${label} review level matches ${impact}`);
  else fail(`${label} review level must be ${expected.review_level} for ${impact}`);
  if (policy.codex_self_check_required === "Yes") pass(`${label} requires Codex self-check review`);
  else fail(`${label} must require Codex self-check review`);
  if (policy.independent_review_required === expected.independent_review_required) pass(`${label} independent review policy matches ${impact}`);
  else fail(`${label} independent review policy must be ${expected.independent_review_required} for ${impact}`);
  if (policy.review_must_happen_before === expected.review_must_happen_before) pass(`${label} review timing matches ${impact}`);
  else fail(`${label} review must happen before ${expected.review_must_happen_before} for ${impact}`);
  if (policy.review_source === expected.review_source) pass(`${label} review source matches ${impact}`);
  else fail(`${label} review source must be ${expected.review_source} for ${impact}`);
  for (const item of expected.coverage) {
    if (coverage.has(item)) pass(`${label} review policy covers ${item}`);
    else fail(`${label} review policy must cover ${item} for ${impact}`);
  }
  if (policy.skip_full_review_reason) pass(`${label} review policy explains full-review boundary`);
  else fail(`${label} review policy must explain full-review boundary`);
}

function checkBusinessUniverseRouting(label, evidence) {
  const routing = evidence.business_universe_routing;
  if (!routing) {
    fail(`${label} 1.108.0 requires business_universe_routing`);
    return;
  }
  if (routing.technical_terms_required_from_user === "No") pass(`${label} Business Universe routing keeps technical terms away from the user`);
  else fail(`${label} Business Universe routing must not require technical terms from the user`);
  const preflight = routing.preflight || {};
  const preflightBase = { ...preflight };
  delete preflightBase.preflight_digest;
  if (preflight.preflight_digest === evidenceDigest(preflightBase, [])) pass(`${label} Business Universe preflight digest is canonical`);
  else fail(`${label} Business Universe preflight digest must match its bounded evidence`);
  if (preflight.discovery_boundary_digest === preflight.discovery_projection?.discovery_boundary_digest) pass(`${label} preflight discovery boundary is internally consistent`);
  else fail(`${label} preflight discovery boundary must match its discovery projection`);
  if (routing.required === "Yes") {
    if (routing.routing_result === "REQUIRED_WITH_EVIDENCE") pass(`${label} required Business Universe routing uses REQUIRED_WITH_EVIDENCE`);
    else fail(`${label} required Business Universe routing must use REQUIRED_WITH_EVIDENCE`);
    if ((routing.reason_codes || []).length > 0 && (routing.relationship_ids || []).length > 0) pass(`${label} required Business Universe routing has structural reasons and relationships`);
    else fail(`${label} required Business Universe routing needs reason codes and structural relationship ids`);
    const evidenced = (preflight.structural_relationships || []).filter((item) => item.evidence_state === "EVIDENCE_BOUND");
    if (evidenced.length > 0) pass(`${label} required routing is backed by an evidence-bound structural relationship`);
    else fail(`${label} required routing cannot be produced from lexical candidates alone`);
    if ((routing.reason_codes || []).some((item) => item !== "HIGH_RISK_OMISSION_AMPLIFIER")) pass(`${label} high-risk amplifier is not the only trigger`);
    else fail(`${label} HIGH impact alone cannot trigger Business Universe Coverage`);
    if (!routing.not_required_reason) pass(`${label} required Business Universe routing has no conflicting not-required reason`);
    else fail(`${label} required Business Universe routing must not include not_required_reason`);
    if (!routing.technical_inspection_reason) pass(`${label} required Business Universe routing has no conflicting inspection reason`);
    else fail(`${label} required Business Universe routing must not retain an inspection reason`);
    if ((evidence.readiness?.blocked_by || []).some((item) => /Business Universe Coverage/i.test(item))) pass(`${label} required Business Universe routing blocks until evidence exists`);
    else fail(`${label} required Business Universe routing must add a coverage blocker`);
  } else if (routing.required === "Unknown") {
    if (routing.routing_result === "TECHNICAL_INSPECTION_REQUIRED" && routing.technical_inspection_reason) pass(`${label} ambiguous Business Universe routing remains Codex-owned technical inspection`);
    else fail(`${label} ambiguous Business Universe routing must use TECHNICAL_INSPECTION_REQUIRED with a reason`);
    if ((evidence.readiness?.blocked_by || []).some((item) => /read-only omission-risk inspection/i.test(item))) pass(`${label} technical inspection blocks implementation review`);
    else fail(`${label} technical inspection must block implementation review without asking the user for technical classification`);
  } else {
    if (routing.routing_result === "NOT_REQUIRED_WITH_REASON" && routing.not_required_reason) pass(`${label} non-required Business Universe routing has a reason`);
    else fail(`${label} non-required Business Universe routing must use NOT_REQUIRED_WITH_REASON with a reason`);
    if ((routing.reason_codes || []).length === 0 && (routing.relationship_ids || []).length === 0) pass(`${label} non-required Business Universe routing has no synthetic trigger`);
    else fail(`${label} non-required Business Universe routing must not carry trigger reasons`);
  }
}

function checkProjectNativeEvidenceBinding(label, mapping) {
  const state = mapping.mapping_state;
  const ref = mapping.project_native_evidence_ref || "";
  const digestValue = mapping.project_native_evidence_digest || "";
  const owner = mapping.project_native_evidence_owner || "";
  const scope = mapping.project_native_evidence_scope || "";
  const taskMatch = mapping.project_native_task_match || "";
  const summary = mapping.project_native_evidence_summary || "";
  const behavior = mapping.required_behavior || "<unknown>";

  if (state === "MISSING") {
    if (ref === "N/A" && digestValue === "N/A" && owner === "N/A" && scope === "N/A" && taskMatch === "N/A") {
      pass(`${label} missing project-native mapping for ${behavior} is explicit`);
    } else {
      fail(`${label} MISSING project-native mapping for ${behavior} must use N/A ref, digest, owner, scope, and task match`);
    }
    if (/missing|no project-native|not supplied|not found/i.test(`${summary}\n${mapping.reason || ""}`)) {
      pass(`${label} missing project-native mapping for ${behavior} explains the gap`);
    } else {
      fail(`${label} MISSING project-native mapping for ${behavior} must explain the missing evidence`);
    }
    return;
  }

  if (["MATCHED", "STRONGER"].includes(state)) {
    if (ref.startsWith("artifact:")) {
      const resolved = resolveArtifactRef(projectRoot, path.join(projectRoot, mapping.project_native_evidence_ref.replace(/^artifact:/, "")), ref);
      if (!resolved) {
        fail(`${label} project-native evidence for ${behavior} does not resolve: ${ref}`);
      } else if (digestValue.startsWith("sha256:")) {
        const actual = digest(fs.readFileSync(resolved, "utf8"));
        if (digestValue === actual) pass(`${label} project-native evidence digest matches for ${behavior}`);
        else fail(`${label} project-native evidence digest mismatch for ${behavior}`);
      } else {
        fail(`${label} project-native evidence for ${behavior} must include sha256 digest`);
      }
    } else {
      fail(`${label} project-native evidence for ${behavior} must use artifact: ref`);
    }
    if (taskMatch === "Yes") pass(`${label} project-native evidence task match is Yes for ${behavior}`);
    else fail(`${label} project-native evidence for ${behavior} must match the current task`);
    if (owner && owner !== "N/A" && owner !== "Unknown") pass(`${label} project-native evidence owner recorded for ${behavior}`);
    else fail(`${label} project-native evidence owner is required for ${behavior}`);
    if (["task_specific", "project_wide", "release_wide"].includes(scope)) pass(`${label} project-native evidence scope recorded for ${behavior}`);
    else fail(`${label} project-native evidence scope must be concrete for ${behavior}`);
    if (summary && summary !== "N/A") pass(`${label} project-native evidence summary recorded for ${behavior}`);
    else fail(`${label} project-native evidence summary is required for ${behavior}`);
  }

  if (state === "WEAKER" || state === "NEEDS_OWNER") {
    if (summary && summary !== "N/A") pass(`${label} ${state} project-native mapping explains ${behavior}`);
    else fail(`${label} ${state} project-native mapping for ${behavior} needs an evidence summary`);
    if (state === "NEEDS_OWNER" && owner === "Unknown") pass(`${label} NEEDS_OWNER mapping records unknown owner for ${behavior}`);
  }
}

function checkMarkdownConsistency(content, label, evidence) {
  const summary = sectionBody(content, "Human Summary") || "";
  if (summary.includes(evidence.impact_classification?.task_impact)) pass(`${label} Human Summary includes task impact`);
  else fail(`${label} Human Summary must include task impact`);
  if (summary.includes(evidence.readiness?.implementation_authorized_by_this_report)) pass(`${label} Human Summary includes implementation authorization boundary`);
  else fail(`${label} Human Summary must include implementation authorization boundary`);
}

function requireRequirement(label, object, field, expected) {
  if (object[field] === expected) pass(`${label} ${field} is ${expected}`);
  else fail(`${label} ${field} must be ${expected}`);
}

function requireExcludedHighSurfaces(label, classification) {
  const surfaces = classification.excluded_high_impact_surfaces || [];
  const required = ["DB", "API contract", "runtime state", "permission", "business rule", "release/production", "CI/hooks"];
  for (const item of required) {
    const match = surfaces.find((surface) => surface.surface === item);
    if (match?.excluded === "Yes" && match.reason) pass(`${label} excludes ${item} with reason`);
    else fail(`${label} must include negative evidence excluding ${item}`);
  }
}

function requireReadySource(label, evidence, name) {
  const source = (evidence.source_chain || []).find((item) => item.name === name || item.state === name);
  const mapping = (evidence.existing_project_mapping || []).find((item) => item.required_behavior === name && ["MATCHED", "STRONGER"].includes(item.mapping_state));
  if (source?.status === "READY" || mapping) pass(`${label} has ready source or project-native mapping for ${name}`);
  else fail(`${label} HIGH ready report requires ${name} source or project-native equivalent`);
}

function hasHighSurface(value) {
  return highSurfacePatterns.some((pattern) => pattern.test(value));
}

function checkBoundaryTables(content, label) {
  for (const [field, expected] of [
    ["Writes target files", "No"],
    ["Authorizes implementation", "No"],
    ["Approves commit or push", "No"],
    ["Approves release or production", "No"],
    ["Executes tests", "No"],
    ["Executes migrations", "No"],
    ["Changes CI or hooks", "No"],
  ]) {
    requireTableValue(content, label, "Boundaries", field, expected);
  }
}

function requireTableValue(content, label, section, field, expected) {
  const body = sectionBody(content, section) || "";
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*\`?${escapeRegExp(expected)}\`?\\s*\\|`, "i");
  if (pattern.test(body)) pass(`${label} ${section} ${field} is ${expected}`);
  else fail(`${label} ${section} must set ${field} to ${expected}`);
}

function markdownFiles(dirName) {
  const dir = path.join(projectRoot, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry))
    .filter((file) => fs.statSync(file).isFile());
}

function resolveArtifactRef(root, fromFile, ref) {
  const relativeRef = ref.replace(/^artifact:/, "");
  const candidates = [
    path.join(root, relativeRef),
    path.join(path.dirname(fromFile), relativeRef),
  ];
  for (const candidate of candidates) {
    const relative = path.relative(root, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function reportRefCandidates(file) {
  const relative = rel(file);
  return [relative, `artifact:${relative}`];
}

function resolveAsset(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || "";
}

function resolveDirectory(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".intentos", relativePath),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || "";
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  if (resolved.includes(`${path.sep}.intentos${path.sep}`)) return `.intentos/${relativePath}`;
  return relativePath;
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    process.stdout.write(`${JSON.stringify({ ok: !failed, checks }, null, 2)}\n`);
  }
  process.exit(failed ? 1 : 0);
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
