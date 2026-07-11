#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "project-type",
  "source-ref",
  "source-ref-role",
  "tag-used",
  "tag-triggers-release-workflow",
  "tag-trigger-workflow-ref",
  "channel",
  "recommendation-class",
  "github-release-used",
  "github-release-assets-uploaded",
  "github-release-assets-allowed",
  "github-release-notes-only",
  "release-event-workflow-detected",
  "release-workflow-detected",
  "github-hosted-runner-used",
  "self-hosted-runner-used",
  "actions-artifact-used-as-release-package",
  "github-packages-used-as-release-package",
  "artifact-retention-policy-ref",
  "repository-visibility",
  "runner-type",
  "uses-larger-runner",
  "actions-minutes-cost-risk",
  "artifact-storage-cost-risk",
  "cache-storage-cost-risk",
  "github-packages-risk",
  "external-provider-cost-risk",
  "registry-storage-cost-risk",
  "platform-fee-risk",
  "release-owner-ref",
  "cost-owner-ref",
  "platform-owner-ref",
  "production-owner-ref",
  "package-identity-type",
  "package-identity-ref",
  "package-digest-or-id",
  "package-location",
  "evidence-preserved-outside-runtime-bundle",
  "release-evidence-deleted-to-reduce-bundle",
  "release-evidence-gate-ref",
  "runtime-hygiene-ref",
  "release-candidate-ref",
  "project-sop-ref",
  "ci-workflow-ref",
  "package-config-ref",
  "docker-config-ref",
  "provider-config-ref",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "decide release channel policy").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const evidence = buildEvidence();

if (outputFormat === "json") {
  const output = `${JSON.stringify(evidence, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = renderMarkdown(evidence);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildEvidence() {
  const detected = detectProjectSignals(projectRoot);
  const projectType = normalizeProjectType(args["project-type"] || detected.projectType);
  const sourceIdentity = sourceIdentityFor(detected);
  const githubReleasePolicy = githubReleasePolicyFor(detected);
  const githubActionsPolicy = githubActionsPolicyFor(detected);
  const billingProfile = githubActionsBillingProfileFor(detected, githubActionsPolicy);
  const costRisk = costRiskFor(detected, githubActionsPolicy, billingProfile);
  const releasePackageIdentity = releasePackageIdentityFor(detected);
  const artifactPolicy = artifactPolicyFor(releasePackageIdentity);
  const channel = args.channel ? String(args.channel) : inferChannel({ detected, githubReleasePolicy, githubActionsPolicy, releasePackageIdentity });
  const owners = ownersFor({ channel, githubReleasePolicy, githubActionsPolicy });
  const effectiveReleaseChannel = effectiveReleaseChannelFor({
    projectType,
    detected,
    channel,
    githubReleasePolicy,
    githubActionsPolicy,
    costRisk,
    owners,
    releasePackageIdentity,
  });
  const sourceChain = sourceChainFor(detected);
  const decision = decisionFor({
    effectiveReleaseChannel,
    githubReleasePolicy,
    githubActionsPolicy,
    costRisk,
    owners,
    releasePackageIdentity,
  });
  const policyRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "release-channel-policies/generated.md";
  const base = {
    schema_version: "1.87.1",
    artifact_type: "release_channel_policy",
    release_channel_policy_ref: policyRef,
    release_channel_policy_digest: "sha256:pending",
    intent,
    intent_digest: digest(intent),
    project_type: projectType,
    source_identity: sourceIdentity,
    effective_release_channel: effectiveReleaseChannel,
    github_release_policy: githubReleasePolicy,
    github_actions_policy: githubActionsPolicy,
    github_actions_billing_profile: billingProfile,
    cost_risk: costRisk,
    owners,
    release_package_identity: releasePackageIdentity,
    artifact_policy: artifactPolicy,
    source_chain: sourceChain,
    decision,
    boundaries: {
      approves_release: "No",
      executes_release: "No",
      uploads_github_release_asset: "No",
      runs_github_hosted_release_workflow: "No",
      deletes_artifacts: "No",
      changes_ci: "No",
      changes_production: "No",
      changes_secrets: "No",
    },
    outcome: effectiveReleaseChannel.blocked === "Yes" ? "BLOCKED_RELEASE_CHANNEL_POLICY" : "RELEASE_CHANNEL_POLICY_RECORDED",
  };
  base.release_channel_policy_digest = evidenceDigest(base, ["release_channel_policy_digest"]);
  return base;
}

function detectProjectSignals(root) {
  const workflowFiles = listFiles(path.join(root, ".github", "workflows"), [".yml", ".yaml"]);
  const workflowText = workflowFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const packageJson = readText(path.join(root, "package.json"));
  const dockerText = [
    readText(path.join(root, "Dockerfile")),
    readText(path.join(root, "docker-compose.yml")),
    readText(path.join(root, "compose.yml")),
  ].join("\n");
  const releaseDocs = listFiles(path.join(root, "docs"), [".md"])
    .filter((file) => /release|rollback|deploy|发布|上线/i.test(file))
    .slice(0, 20);
  const providerText = [
    readText(path.join(root, "vercel.json")),
    readText(path.join(root, "firebase.json")),
    readText(path.join(root, "wrangler.toml")),
    readText(path.join(root, "app.yaml")),
  ].join("\n");
  const combined = `${workflowText}\n${packageJson}\n${dockerText}\n${providerText}`;
  return {
    projectType: fs.existsSync(path.join(root, "intentos-manifest.json")) ? "new_project" : "existing_project",
    workflowFiles,
    workflowText,
    packageJson,
    dockerText,
    providerText,
    releaseDocs,
    hasTagTrigger: /push:\s*[\s\S]*tags:|on:\s*\[[^\]]*push[^\]]*\][\s\S]*tags:/i.test(workflowText),
    hasReleaseEvent: /\bon:\s*release\b|release:\s*[\r\n]/i.test(workflowText),
    hasWorkflowDispatch: /workflow_dispatch:/i.test(workflowText),
    hasGithubReleaseAction: /gh\s+release\s+(create|upload)|softprops\/action-gh-release|ncipollo\/release-action|actions\/create-release|actions\/upload-release-asset/i.test(workflowText),
    hasUploadArtifact: /actions\/upload-artifact/i.test(workflowText),
    hasDockerPush: /docker\s+push/i.test(combined),
    hasPackagePublish: /\b(npm|pnpm)\s+publish\b|twine\s+upload/i.test(combined),
    hasProviderDeploy: /vercel\s+deploy\s+--prod|firebase\s+deploy|gcloud\s+run\s+deploy|wrangler\s+deploy|kubectl\s+apply/i.test(combined),
    hasServerCopy: /\b(scp|rsync)\b[\s\S]*(server|deploy|prod|production)/i.test(combined),
    hasReleaseSop: releaseDocs.length > 0,
  };
}

function sourceIdentityFor(detected) {
  const tagTrigger = normalizeYesNoUnknown(args["tag-triggers-release-workflow"] || (detected.hasTagTrigger ? "Yes" : "No"));
  return {
    source_ref: String(args["source-ref"] || gitSourceRef(projectRoot) || "unknown"),
    source_ref_role: String(args["source-ref-role"] || (tagTrigger === "Yes" ? "release_trigger" : "identity_only")),
    git_allowed: "Yes",
    tag_allowed_as_identity: "Yes",
    tag_used: normalizeYesNoUnknown(args["tag-used"] || (tagTrigger === "Yes" ? "Yes" : "Unknown")),
    tag_triggers_release_workflow: tagTrigger,
    tag_trigger_workflow_ref: String(args["tag-trigger-workflow-ref"] || (detected.hasTagTrigger ? sourceRefForFirst(detected.workflowFiles) : "not_applicable")),
  };
}

function githubReleasePolicyFor(detected) {
  const releaseUsed = normalizeYesNoUnknown(args["github-release-used"] || (detected.hasGithubReleaseAction || detected.hasReleaseEvent ? "Yes" : "No"));
  const assetsUploaded = normalizeYesNoUnknown(args["github-release-assets-uploaded"] || (detected.hasGithubReleaseAction ? "Yes" : "No"));
  const notesOnly = normalizeYesNoUnknown(args["github-release-notes-only"] || (releaseUsed === "Yes" && assetsUploaded === "No" ? "Yes" : "Unknown"));
  const releaseEvent = normalizeYesNoUnknown(args["release-event-workflow-detected"] || (detected.hasReleaseEvent ? "Yes" : "No"));
  const assetsAllowed = normalizeAssetsAllowed(args["github-release-assets-allowed"], assetsUploaded);
  return {
    github_release_used: releaseUsed,
    github_release_assets_uploaded: assetsUploaded,
    github_release_assets_allowed: assetsAllowed,
    github_release_notes_only: notesOnly,
    release_event_workflow_detected: releaseEvent,
    policy_state: githubReleasePolicyState({ releaseUsed, assetsUploaded, notesOnly, releaseEvent, assetsAllowed }),
  };
}

function githubActionsPolicyFor(detected) {
  const workflowDetected = normalizeYesNoUnknown(args["release-workflow-detected"] || (detected.hasTagTrigger || detected.hasReleaseEvent || detected.hasWorkflowDispatch ? "Yes" : "No"));
  const uploadArtifact = normalizeYesNoUnknown(args["actions-artifact-used-as-release-package"] || (detected.hasUploadArtifact ? "Yes" : "No"));
  const packages = normalizeYesNoUnknown(args["github-packages-used-as-release-package"] || (detected.hasPackagePublish ? "Unknown" : "No"));
  const hosted = normalizeYesNoUnknown(args["github-hosted-runner-used"] || (workflowDetected === "Yes" ? "Unknown" : "No"));
  const selfHosted = normalizeYesNoUnknown(args["self-hosted-runner-used"] || "Unknown");
  const retention = String(args["artifact-retention-policy-ref"] || (uploadArtifact === "Yes" ? "missing" : "not_applicable"));
  return {
    release_workflow_detected: workflowDetected,
    github_hosted_runner_used: hosted,
    self_hosted_runner_used: selfHosted,
    actions_artifact_used_as_release_package: uploadArtifact,
    github_packages_used_as_release_package: packages,
    artifact_retention_policy_ref: retention,
    policy_state: actionsPolicyState({ workflowDetected, uploadArtifact, retention }),
  };
}

function githubActionsBillingProfileFor(detected, actionsPolicy) {
  const runnerType = String(args["runner-type"] || "unknown");
  const hasGithubHostedReleaseWork = actionsPolicy.release_workflow_detected === "Yes" || actionsPolicy.actions_artifact_used_as_release_package === "Yes";
  const defaultActionsMinutesRisk = runnerType === "self_hosted" ? "No"
    : hasGithubHostedReleaseWork ? "Unknown"
      : "No";
  const defaultStorageRisk = actionsPolicy.actions_artifact_used_as_release_package === "Yes" ? "Unknown" : "No";
  const defaultCacheRisk = detected.hasUploadArtifact || hasGithubHostedReleaseWork ? "Unknown" : "No";
  return {
    repository_visibility: String(args["repository-visibility"] || "unknown"),
    runner_type: runnerType,
    uses_larger_runner: normalizeYesNoUnknown(args["uses-larger-runner"] || "Unknown"),
    actions_minutes_cost_risk: normalizeYesNoUnknown(args["actions-minutes-cost-risk"] || defaultActionsMinutesRisk),
    artifact_storage_cost_risk: normalizeYesNoUnknown(args["artifact-storage-cost-risk"] || defaultStorageRisk),
    cache_storage_cost_risk: normalizeYesNoUnknown(args["cache-storage-cost-risk"] || defaultCacheRisk),
    cost_owner_ref: String(args["cost-owner-ref"] || "missing"),
  };
}

function costRiskFor(detected, actionsPolicy, billingProfile) {
  const externalRisk = normalizeYesNoUnknown(args["external-provider-cost-risk"] || (detected.hasProviderDeploy ? "Unknown" : "No"));
  const registryRisk = normalizeYesNoUnknown(args["registry-storage-cost-risk"] || (detected.hasDockerPush || detected.hasPackagePublish ? "Unknown" : "No"));
  const platformRisk = normalizeYesNoUnknown(args["platform-fee-risk"] || (detected.hasProviderDeploy ? "Unknown" : "No"));
  const anyRisk = [
    billingProfile.actions_minutes_cost_risk,
    billingProfile.artifact_storage_cost_risk,
    billingProfile.cache_storage_cost_risk,
    normalizeYesNoUnknown(args["github-packages-risk"] || (actionsPolicy.github_packages_used_as_release_package === "Yes" ? "Unknown" : "No")),
    externalRisk,
    registryRisk,
    platformRisk,
  ].some((value) => value === "Yes" || value === "Unknown");
  return {
    github_actions_minutes_risk: billingProfile.actions_minutes_cost_risk,
    github_actions_artifact_storage_risk: billingProfile.artifact_storage_cost_risk,
    github_actions_cache_storage_risk: billingProfile.cache_storage_cost_risk,
    github_packages_risk: normalizeYesNoUnknown(args["github-packages-risk"] || (actionsPolicy.github_packages_used_as_release_package === "Yes" ? "Unknown" : "No")),
    external_provider_cost_risk: externalRisk,
    registry_storage_cost_risk: registryRisk,
    app_store_or_platform_fee_risk: platformRisk,
    cost_owner_required: anyRisk ? "Yes" : "No",
    cost_owner_ref: String(args["cost-owner-ref"] || (anyRisk ? "missing" : "not_applicable")),
  };
}

function ownersFor({ channel, githubReleasePolicy, githubActionsPolicy }) {
  const requiredForPolicy = requiresReleaseOwner(channel, githubReleasePolicy, githubActionsPolicy) ? "Yes" : "No";
  return {
    release_owner_required: requiredForPolicy,
    release_owner_required_for_policy: requiredForPolicy,
    release_owner_required_before_release_review: "Yes",
    release_owner_ref: String(args["release-owner-ref"] || (requiredForPolicy === "Yes" ? "missing" : "not_applicable_until_release_review")),
    cost_owner_ref: String(args["cost-owner-ref"] || "missing"),
    platform_owner_ref: String(args["platform-owner-ref"] || "not_applicable"),
    production_owner_ref: String(args["production-owner-ref"] || "not_applicable"),
  };
}

function releasePackageIdentityFor(detected) {
  const defaultType = detected.hasDockerPush ? "docker_digest"
    : detected.hasPackagePublish ? "registry_version"
      : detected.hasProviderDeploy ? "provider_build_id"
        : "none";
  const identityType = String(args["package-identity-type"] || defaultType);
  return {
    identity_type: identityType,
    identity_ref: String(args["package-identity-ref"] || (identityType === "none" ? "not_applicable" : "missing")),
    digest_or_id: String(args["package-digest-or-id"] || (identityType === "none" ? "not_applicable" : "missing")),
    not_applicable_reason: identityType === "none" ? "No release package is selected by this policy." : "N/A",
  };
}

function artifactPolicyFor(releasePackageIdentity) {
  return {
    release_package_location: String(args["package-location"] || packageLocationFor(releasePackageIdentity.identity_type)),
    evidence_preserved_outside_runtime_bundle: normalizeYesNoUnknown(args["evidence-preserved-outside-runtime-bundle"] || "Yes"),
    release_evidence_deleted_to_reduce_bundle: normalizeYesNoUnknown(args["release-evidence-deleted-to-reduce-bundle"] || "No"),
  };
}

function effectiveReleaseChannelFor({ projectType, detected, channel, githubReleasePolicy, githubActionsPolicy, costRisk, owners, releasePackageIdentity }) {
  const recommendationClass = String(args["recommendation-class"] || recommendationFor({ projectType, channel, githubReleasePolicy, githubActionsPolicy, detected }));
  const blockedBy = [];
  if (owners.release_owner_ref === "missing" && requiresReleaseOwner(channel, githubReleasePolicy, githubActionsPolicy)) blockedBy.push("missing_release_owner");
  if (costRisk.cost_owner_required === "Yes" && (costRisk.cost_owner_ref === "missing" || owners.cost_owner_ref === "missing")) blockedBy.push("missing_cost_owner");
  if (githubReleasePolicy.github_release_notes_only === "Yes" && githubReleasePolicy.release_event_workflow_detected === "Yes" && owners.release_owner_ref === "missing") {
    blockedBy.push("notes_only_release_event_workflow_unreviewed");
  }
  if (githubActionsPolicy.actions_artifact_used_as_release_package === "Yes" && githubActionsPolicy.artifact_retention_policy_ref === "missing") {
    blockedBy.push("missing_artifact_retention_policy");
  }
  if (releasePackageIdentity.identity_type === "unknown") {
    blockedBy.push("unknown_release_package_identity");
  }
  if (channel !== "source_only" && releasePackageIdentity.identity_type === "none") {
    blockedBy.push("release_channel_requires_package_identity");
  }
  if (releasePackageIdentity.identity_type !== "none" && (releasePackageIdentity.identity_ref === "missing" || releasePackageIdentity.digest_or_id === "missing")) {
    blockedBy.push("missing_release_package_identity");
  }
  return {
    channel,
    recommendation_class: recommendationClass,
    blocked: blockedBy.length > 0 ? "Yes" : "No",
    blocked_by: blockedBy,
    current_channel_detected: detected.hasReleaseSop || detected.hasGithubReleaseAction || detected.hasUploadArtifact || detected.hasProviderDeploy || detected.hasDockerPush || detected.hasPackagePublish ? "Yes" : "No",
    current_channel_summary: currentChannelSummary(detected),
    recommended_channel_summary: recommendedChannelSummary(channel, recommendationClass),
  };
}

function sourceChainFor(detected) {
  return [
    sourceRecord("release_evidence_gate", args["release-evidence-gate-ref"], "release_candidate"),
    sourceRecord("runtime_hygiene", args["runtime-hygiene-ref"], "release_candidate"),
    sourceRecord("project_sop", args["project-sop-ref"] || sourceRefForFirst(detected.releaseDocs), "project"),
    sourceRecord("ci_workflow", args["ci-workflow-ref"] || sourceRefForFirst(detected.workflowFiles), "project"),
    sourceRecord("package_config", args["package-config-ref"] || (fs.existsSync(path.join(projectRoot, "package.json")) ? "file:package.json" : ""), "project"),
    sourceRecord("docker_config", args["docker-config-ref"] || (fs.existsSync(path.join(projectRoot, "Dockerfile")) ? "file:Dockerfile" : ""), "project"),
    sourceRecord("provider_config", args["provider-config-ref"] || "not_applicable", "project"),
    sourceRecord("manual_observation", "not_applicable", "not_applicable"),
  ];
}

function sourceRecord(kind, refValue, scope) {
  const ref = String(refValue || "").trim() || "missing";
  const projectMatch = scope === "project" && !["missing", "unknown", "not_applicable"].includes(ref) ? "Yes" : "Unknown";
  return {
    source_kind: kind,
    source_ref: ref,
    source_digest: digestSource(ref),
    source_scope_match: scope,
    current_release_candidate_match: scope === "release_candidate" ? currentReleaseCandidateMatch(kind, ref) : "N/A",
    project_match: projectMatch,
  };
}

function currentReleaseCandidateMatch(kind, sourceRef) {
  const expected = normalizeCandidateRef(args["release-candidate-ref"]);
  if (!expected || ["missing", "unknown", "not_applicable"].includes(sourceRef)) return "Unknown";
  if (!sourceRef.startsWith("file:") && !sourceRef.startsWith("artifact:")) return "Unknown";
  const raw = sourceRef.replace(/^(file|artifact):/, "");
  const file = path.resolve(projectRoot, raw);
  const relative = path.relative(projectRoot, file);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return "Unknown";
  const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
  if (!extracted?.ok) return "Unknown";
  const actual = kind === "release_evidence_gate"
    ? extracted.value.release_scope?.release_candidate_ref
    : extracted.value.release_trust_binding?.release_candidate_ref;
  return normalizeCandidateRef(actual) === expected ? "Yes" : "No";
}

function normalizeCandidateRef(value) {
  return String(value || "").trim().replace(/^(file|artifact):/, "");
}

function decisionFor({ effectiveReleaseChannel, githubReleasePolicy, githubActionsPolicy, costRisk, owners }) {
  const needsReleaseOwner = effectiveReleaseChannel.blocked_by.includes("missing_release_owner") ? "Yes" : "No";
  const needsCostOwner = effectiveReleaseChannel.blocked_by.includes("missing_cost_owner") ? "Yes" : "No";
  return {
    can_prepare_release_channel_policy: "Yes",
    can_use_github_as_release_channel: githubReleasePolicy.github_release_assets_allowed === "Yes" ? "Yes"
      : githubReleasePolicy.github_release_assets_allowed === "NeedsOwnerDecision" ? "NeedsOwnerDecision"
        : "No",
    can_use_github_as_source_and_evidence_only: githubReleasePolicy.github_release_assets_uploaded === "Yes" ? "No" : "Yes",
    needs_release_owner_decision: needsReleaseOwner,
    needs_cost_owner_decision: needsCostOwner,
    blocks_release_review: effectiveReleaseChannel.blocked,
    plain_user_summary: plainSummary(effectiveReleaseChannel, githubReleasePolicy, githubActionsPolicy, costRisk, owners),
  };
}

function renderMarkdown(evidence) {
  return `# Release Channel Policy Report

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | ${evidence.decision.plain_user_summary} |
| Project type | ${evidence.project_type} |
| Effective release channel | ${evidence.effective_release_channel.channel} |
| Recommendation | ${evidence.effective_release_channel.recommendation_class} |
| Blocked | ${evidence.effective_release_channel.blocked} |
| Blocks release review | ${evidence.decision.blocks_release_review} |
| Release approved | No |
| Production approved | No |

## Source Identity

| Field | Value |
| --- | --- |
| Source ref | ${evidence.source_identity.source_ref} |
| Source ref role | ${evidence.source_identity.source_ref_role} |
| Git allowed | ${evidence.source_identity.git_allowed} |
| Tag allowed as identity | ${evidence.source_identity.tag_allowed_as_identity} |
| Tag triggers release workflow | ${evidence.source_identity.tag_triggers_release_workflow} |
| Tag trigger workflow ref | ${evidence.source_identity.tag_trigger_workflow_ref} |

## GitHub Release Policy

| Field | Value |
| --- | --- |
| GitHub Release used | ${evidence.github_release_policy.github_release_used} |
| GitHub Release assets uploaded | ${evidence.github_release_policy.github_release_assets_uploaded} |
| GitHub Release assets allowed | ${evidence.github_release_policy.github_release_assets_allowed} |
| GitHub Release notes only | ${evidence.github_release_policy.github_release_notes_only} |
| Release event workflow detected | ${evidence.github_release_policy.release_event_workflow_detected} |
| Policy state | ${evidence.github_release_policy.policy_state} |

## GitHub Actions Policy

| Field | Value |
| --- | --- |
| Release workflow detected | ${evidence.github_actions_policy.release_workflow_detected} |
| GitHub-hosted runner used | ${evidence.github_actions_policy.github_hosted_runner_used} |
| Self-hosted runner used | ${evidence.github_actions_policy.self_hosted_runner_used} |
| Actions artifact used as release package | ${evidence.github_actions_policy.actions_artifact_used_as_release_package} |
| GitHub Packages used as release package | ${evidence.github_actions_policy.github_packages_used_as_release_package} |
| Artifact retention policy ref | ${evidence.github_actions_policy.artifact_retention_policy_ref} |
| Policy state | ${evidence.github_actions_policy.policy_state} |

## Cost And Retention

| Field | Value |
| --- | --- |
| Repository visibility | ${evidence.github_actions_billing_profile.repository_visibility} |
| Runner type | ${evidence.github_actions_billing_profile.runner_type} |
| Actions minutes risk | ${evidence.cost_risk.github_actions_minutes_risk} |
| Artifact storage risk | ${evidence.cost_risk.github_actions_artifact_storage_risk} |
| Cache storage risk | ${evidence.cost_risk.github_actions_cache_storage_risk} |
| External provider cost risk | ${evidence.cost_risk.external_provider_cost_risk} |
| Registry storage cost risk | ${evidence.cost_risk.registry_storage_cost_risk} |
| Platform fee risk | ${evidence.cost_risk.app_store_or_platform_fee_risk} |
| Cost owner required | ${evidence.cost_risk.cost_owner_required} |
| Cost owner ref | ${evidence.cost_risk.cost_owner_ref} |

## Release Package Identity

| Field | Value |
| --- | --- |
| Identity type | ${evidence.release_package_identity.identity_type} |
| Identity ref | ${evidence.release_package_identity.identity_ref} |
| Digest or ID | ${evidence.release_package_identity.digest_or_id} |
| Package location | ${evidence.artifact_policy.release_package_location} |
| Evidence preserved outside runtime bundle | ${evidence.artifact_policy.evidence_preserved_outside_runtime_bundle} |
| Release evidence deleted to reduce bundle | ${evidence.artifact_policy.release_evidence_deleted_to_reduce_bundle} |

## Owners

| Field | Value |
| --- | --- |
| Release owner required | ${evidence.owners.release_owner_required} |
| Release owner required for policy | ${evidence.owners.release_owner_required_for_policy} |
| Release owner required before release review | ${evidence.owners.release_owner_required_before_release_review} |
| Release owner ref | ${evidence.owners.release_owner_ref} |
| Cost owner ref | ${evidence.owners.cost_owner_ref} |
| Platform owner ref | ${evidence.owners.platform_owner_ref} |
| Production owner ref | ${evidence.owners.production_owner_ref} |

## Source Chain

| Source | Ref | Digest | Scope Match | Release Candidate Match | Project Match |
| --- | --- | --- | --- | --- | --- |
${evidence.source_chain.map((source) => `| ${source.source_kind} | ${source.source_ref} | ${source.source_digest} | ${source.source_scope_match} | ${source.current_release_candidate_match} | ${source.project_match} |`).join("\n")}

## Boundaries

- This report approves release: No
- This report approves production: No
- This report executes release: No
- This report uploads GitHub Release assets: No
- This report runs GitHub-hosted release workflows: No
- This report deletes artifacts: No
- This report changes CI: No
- This report changes production: No
- This report changes secrets: No

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

${evidence.outcome}

## Next Step

${evidence.effective_release_channel.blocked === "Yes"
  ? "Keep release review blocked until the listed owner, cost, retention, or package identity gaps are resolved."
  : "Use this policy as release-channel evidence before release-owner review."}
`;
}

function resolveOutputPath(root, raw) {
  if (path.isAbsolute(raw)) {
    console.error("FAIL --out must be a relative path under release-channel-policies/");
    process.exit(1);
  }
  const normalized = raw.replaceAll("\\", "/");
  if (normalized.includes("..") || !normalized.startsWith("release-channel-policies/") || !normalized.endsWith(".md")) {
    console.error("FAIL --out must stay under release-channel-policies/*.md");
    process.exit(1);
  }
  const resolved = path.resolve(root, normalized);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out escapes project root");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function normalizeProjectType(value) {
  return new Set(["new_project", "existing_project", "unknown"]).has(String(value)) ? String(value) : "unknown";
}

function normalizeYesNoUnknown(value) {
  const normalized = String(value ?? "Unknown").trim();
  if (/^yes$/i.test(normalized)) return "Yes";
  if (/^no$/i.test(normalized)) return "No";
  return "Unknown";
}

function normalizeAssetsAllowed(value, assetsUploaded) {
  const normalized = String(value || "").trim();
  if (["Yes", "No", "NeedsOwnerDecision", "Unknown"].includes(normalized)) return normalized;
  return assetsUploaded === "Yes" ? "NeedsOwnerDecision" : "No";
}

function githubReleasePolicyState({ releaseUsed, assetsUploaded, notesOnly, releaseEvent, assetsAllowed }) {
  if (releaseUsed === "No") return "NOT_USED";
  if (assetsUploaded === "Yes" && assetsAllowed !== "Yes") return "ASSET_CHANNEL_REVIEW_REQUIRED";
  if (notesOnly === "Yes" && releaseEvent === "Yes") return "ASSET_CHANNEL_REVIEW_REQUIRED";
  if (assetsAllowed === "Yes") return "ALLOWED_WITH_OWNER_POLICY";
  if (notesOnly === "Yes") return "NOTES_ONLY";
  return "UNKNOWN";
}

function actionsPolicyState({ workflowDetected, uploadArtifact, retention }) {
  if (workflowDetected === "No" && uploadArtifact === "No") return "DISABLED";
  if (uploadArtifact === "Yes" && retention === "missing") return "BLOCKED_LONG_LIVED_PACKAGE";
  if (uploadArtifact === "Yes") return "SHORT_LIVED_HANDOFF_ONLY";
  if (workflowDetected === "Yes") return "ALLOWED_WITH_RETENTION_POLICY";
  return "UNKNOWN";
}

function inferChannel({ detected, githubReleasePolicy, githubActionsPolicy, releasePackageIdentity }) {
  if (detected.hasProviderDeploy) return "provider_direct_deploy";
  if (detected.hasDockerPush) return "docker_registry";
  if (detected.hasPackagePublish) return "package_registry";
  if (githubReleasePolicy.github_release_assets_uploaded === "Yes") return "github_release";
  if (githubActionsPolicy.actions_artifact_used_as_release_package === "Yes") return "github_actions_artifact";
  if (detected.hasServerCopy) return "server_release_sop";
  if (releasePackageIdentity.identity_type !== "none") return "local_handoff";
  return "source_only";
}

function recommendationFor({ projectType, channel, githubReleasePolicy, githubActionsPolicy, detected }) {
  if (detected.hasReleaseSop && !["github_release", "github_actions_artifact"].includes(channel)) return "KEEP_EXISTING_APPROVED_CHANNEL";
  if (githubActionsPolicy.actions_artifact_used_as_release_package === "Yes") return "RECOMMEND_DECOUPLING_FROM_ACTIONS_ARTIFACT_PACKAGE";
  if (githubReleasePolicy.github_release_assets_uploaded === "Yes") return "RECOMMEND_DECOUPLING_FROM_GITHUB_RELEASE_ASSETS";
  if (projectType === "new_project" || channel === "source_only") return "KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE";
  return "REQUIRE_RELEASE_OWNER_DECISION";
}

function requiresReleaseOwner(channel, githubReleasePolicy, githubActionsPolicy) {
  if (["provider_direct_deploy", "app_store_or_mini_program", "docker_registry", "package_registry", "github_release", "github_actions_artifact", "server_release_sop"].includes(channel)) return true;
  if (githubReleasePolicy.release_event_workflow_detected === "Yes") return true;
  if (githubActionsPolicy.release_workflow_detected === "Yes") return true;
  return false;
}

function currentChannelSummary(detected) {
  const signals = [];
  if (detected.hasReleaseSop) signals.push("release SOP");
  if (detected.hasGithubReleaseAction) signals.push("GitHub Release asset action");
  if (detected.hasUploadArtifact) signals.push("GitHub Actions artifact");
  if (detected.hasProviderDeploy) signals.push("provider deploy");
  if (detected.hasDockerPush) signals.push("Docker registry publish");
  if (detected.hasPackagePublish) signals.push("package registry publish");
  if (detected.hasTagTrigger) signals.push("tag-triggered workflow");
  return signals.length ? signals.join(", ") : "No release channel signal detected.";
}

function recommendedChannelSummary(channel, recommendation) {
  return `${channel} with recommendation ${recommendation}.`;
}

function plainSummary(channel, releasePolicy, actionsPolicy, costRisk) {
  if (channel.blocked === "Yes") {
    return `I found release-channel gaps (${channel.blocked_by.join(", ")}). I will keep release review blocked and prepare only evidence, not release execution.`;
  }
  if (releasePolicy.github_release_assets_uploaded === "No" && actionsPolicy.actions_artifact_used_as_release_package === "No") {
    return "I will keep GitHub for code and evidence, and will not treat GitHub Release assets or Actions artifacts as the release package by default.";
  }
  if (costRisk.cost_owner_required === "Yes") {
    return "I found a release channel with possible cost or retention impact. A release/cost owner must decide before release review.";
  }
  return "Release channel policy is recorded for release-owner review. This does not approve release or production.";
}

function packageLocationFor(identityType) {
  if (identityType === "none") return "none";
  if (identityType === "docker_digest" || identityType === "registry_version") return "registry";
  if (identityType === "provider_build_id") return "external_provider";
  if (identityType === "app_store_build" || identityType === "mini_program_upload_id") return "external_provider";
  return "local_handoff";
}

function sourceRefForFirst(files) {
  const first = Array.isArray(files) ? files[0] : "";
  if (!first) return "";
  return `file:${path.relative(projectRoot, first).replaceAll(path.sep, "/")}`;
}

function digestSource(ref) {
  if (!ref || ref === "missing" || ref === "not_applicable") return digest(ref || "");
  if (ref.startsWith("file:")) {
    const filePath = path.resolve(projectRoot, ref.slice(5));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return digest(fs.readFileSync(filePath));
  }
  return digest(ref);
}

function gitSourceRef(root) {
  try {
    const head = fs.readFileSync(path.join(root, ".git", "HEAD"), "utf8").trim();
    if (head.startsWith("ref:")) return `git:${head.slice(5)}`;
    return `git:${head}`;
  } catch {
    return "";
  }
}

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, extensions));
    else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
}

function readText(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, "utf8") : "";
  } catch {
    return "";
  }
}

function digest(value) {
  const hash = crypto.createHash("sha256");
  if (Buffer.isBuffer(value)) hash.update(value);
  else hash.update(String(value));
  return `sha256:${hash.digest("hex")}`;
}
