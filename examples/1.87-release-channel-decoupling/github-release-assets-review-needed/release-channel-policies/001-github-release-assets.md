# Release Channel Policy Report

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | I found release-channel gaps (missing_release_owner, missing_release_package_identity). I will keep release review blocked and prepare only evidence, not release execution. |
| Project type | existing_project |
| Effective release channel | github_release |
| Recommendation | RECOMMEND_DECOUPLING_FROM_GITHUB_RELEASE_ASSETS |
| Blocked | Yes |
| Blocks release review | Yes |
| Release approved | No |
| Production approved | No |

## Source Identity

| Field | Value |
| --- | --- |
| Source ref | unknown |
| Source ref role | identity_only |
| Git allowed | Yes |
| Tag allowed as identity | Yes |
| Tag triggers release workflow | No |
| Tag trigger workflow ref | not_applicable |

## GitHub Release Policy

| Field | Value |
| --- | --- |
| GitHub Release used | Yes |
| GitHub Release assets uploaded | Yes |
| GitHub Release assets allowed | NeedsOwnerDecision |
| GitHub Release notes only | Unknown |
| Release event workflow detected | No |
| Policy state | ASSET_CHANNEL_REVIEW_REQUIRED |

## GitHub Actions Policy

| Field | Value |
| --- | --- |
| Release workflow detected | No |
| GitHub-hosted runner used | No |
| Self-hosted runner used | Unknown |
| Actions artifact used as release package | No |
| GitHub Packages used as release package | Unknown |
| Artifact retention policy ref | not_applicable |
| Policy state | DISABLED |

## Cost And Retention

| Field | Value |
| --- | --- |
| Repository visibility | unknown |
| Runner type | unknown |
| Actions minutes risk | No |
| Artifact storage risk | No |
| Cache storage risk | No |
| External provider cost risk | No |
| Registry storage cost risk | No |
| Platform fee risk | No |
| Cost owner required | No |
| Cost owner ref | missing |

## Release Package Identity

| Field | Value |
| --- | --- |
| Identity type | file_digest |
| Identity ref | missing |
| Digest or ID | missing |
| Package location | local_handoff |
| Evidence preserved outside runtime bundle | Yes |
| Release evidence deleted to reduce bundle | No |

## Owners

| Field | Value |
| --- | --- |
| Release owner required | Yes |
| Release owner ref | missing |
| Cost owner ref | missing |
| Platform owner ref | not_applicable |
| Production owner ref | not_applicable |

## Source Chain

| Source | Ref | Digest | Scope Match | Release Candidate Match | Project Match |
| --- | --- | --- | --- | --- | --- |
| release_evidence_gate | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | release_candidate | Unknown | Unknown |
| runtime_hygiene | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | current_task | N/A | Unknown |
| project_sop | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | project | N/A | Yes |
| ci_workflow | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | project | N/A | Yes |
| package_config | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | project | N/A | Yes |
| docker_config | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | project | N/A | Yes |
| provider_config | not_applicable | sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e | project | N/A | Yes |
| manual_observation | not_applicable | sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e | not_applicable | N/A | Unknown |

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

```json
{
  "schema_version": "1.87.0",
  "artifact_type": "release_channel_policy",
  "release_channel_policy_ref": "release-channel-policies/001-github-release-assets.md",
  "release_channel_policy_digest": "sha256:cd359999c9a44da161c0a85d5c4242ddc8e317f7232dbca611b0d223731e59cc",
  "intent": "decide release channel policy",
  "intent_digest": "sha256:cd325117ede5d7c7bb350b32798d4e75e4297f78144203f5bf9eaa4583b8a130",
  "project_type": "existing_project",
  "source_identity": {
    "source_ref": "unknown",
    "source_ref_role": "identity_only",
    "git_allowed": "Yes",
    "tag_allowed_as_identity": "Yes",
    "tag_used": "Unknown",
    "tag_triggers_release_workflow": "No",
    "tag_trigger_workflow_ref": "not_applicable"
  },
  "effective_release_channel": {
    "channel": "github_release",
    "recommendation_class": "RECOMMEND_DECOUPLING_FROM_GITHUB_RELEASE_ASSETS",
    "blocked": "Yes",
    "blocked_by": [
      "missing_release_owner",
      "missing_release_package_identity"
    ],
    "current_channel_detected": "No",
    "current_channel_summary": "No release channel signal detected.",
    "recommended_channel_summary": "github_release with recommendation RECOMMEND_DECOUPLING_FROM_GITHUB_RELEASE_ASSETS."
  },
  "github_release_policy": {
    "github_release_used": "Yes",
    "github_release_assets_uploaded": "Yes",
    "github_release_assets_allowed": "NeedsOwnerDecision",
    "github_release_notes_only": "Unknown",
    "release_event_workflow_detected": "No",
    "policy_state": "ASSET_CHANNEL_REVIEW_REQUIRED"
  },
  "github_actions_policy": {
    "release_workflow_detected": "No",
    "github_hosted_runner_used": "No",
    "self_hosted_runner_used": "Unknown",
    "actions_artifact_used_as_release_package": "No",
    "github_packages_used_as_release_package": "Unknown",
    "artifact_retention_policy_ref": "not_applicable",
    "policy_state": "DISABLED"
  },
  "github_actions_billing_profile": {
    "repository_visibility": "unknown",
    "runner_type": "unknown",
    "uses_larger_runner": "Unknown",
    "actions_minutes_cost_risk": "No",
    "artifact_storage_cost_risk": "No",
    "cache_storage_cost_risk": "No",
    "cost_owner_ref": "missing"
  },
  "cost_risk": {
    "github_actions_minutes_risk": "No",
    "github_actions_artifact_storage_risk": "No",
    "github_actions_cache_storage_risk": "No",
    "github_packages_risk": "No",
    "external_provider_cost_risk": "No",
    "registry_storage_cost_risk": "No",
    "app_store_or_platform_fee_risk": "No",
    "cost_owner_required": "No",
    "cost_owner_ref": "missing"
  },
  "owners": {
    "release_owner_required": "Yes",
    "release_owner_ref": "missing",
    "cost_owner_ref": "missing",
    "platform_owner_ref": "not_applicable",
    "production_owner_ref": "not_applicable"
  },
  "release_package_identity": {
    "identity_type": "file_digest",
    "identity_ref": "missing",
    "digest_or_id": "missing",
    "not_applicable_reason": "N/A"
  },
  "artifact_policy": {
    "release_package_location": "local_handoff",
    "evidence_preserved_outside_runtime_bundle": "Yes",
    "release_evidence_deleted_to_reduce_bundle": "No"
  },
  "source_chain": [
    {
      "source_kind": "release_evidence_gate",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "release_candidate",
      "current_release_candidate_match": "Unknown",
      "project_match": "Unknown"
    },
    {
      "source_kind": "runtime_hygiene",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "current_task",
      "current_release_candidate_match": "N/A",
      "project_match": "Unknown"
    },
    {
      "source_kind": "project_sop",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "ci_workflow",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "package_config",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "docker_config",
      "source_ref": "missing",
      "source_digest": "sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "provider_config",
      "source_ref": "not_applicable",
      "source_digest": "sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "manual_observation",
      "source_ref": "not_applicable",
      "source_digest": "sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e",
      "source_scope_match": "not_applicable",
      "current_release_candidate_match": "N/A",
      "project_match": "Unknown"
    }
  ],
  "decision": {
    "can_prepare_release_channel_policy": "Yes",
    "can_use_github_as_release_channel": "NeedsOwnerDecision",
    "can_use_github_as_source_and_evidence_only": "No",
    "needs_release_owner_decision": "Yes",
    "needs_cost_owner_decision": "No",
    "blocks_release_review": "Yes",
    "plain_user_summary": "I found release-channel gaps (missing_release_owner, missing_release_package_identity). I will keep release review blocked and prepare only evidence, not release execution."
  },
  "boundaries": {
    "approves_release": "No",
    "executes_release": "No",
    "uploads_github_release_asset": "No",
    "runs_github_hosted_release_workflow": "No",
    "deletes_artifacts": "No",
    "changes_ci": "No",
    "changes_production": "No",
    "changes_secrets": "No"
  },
  "outcome": "BLOCKED_RELEASE_CHANNEL_POLICY"
}
```

## Outcome

BLOCKED_RELEASE_CHANNEL_POLICY

## Next Step

Keep release review blocked until the listed owner, cost, retention, or package identity gaps are resolved.
