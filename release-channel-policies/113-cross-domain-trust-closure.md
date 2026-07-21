# Release Channel Policy Report

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | I will keep the external release blocked because a workflow package script cannot be proven free of external effects. I will continue the technical checks and prepare evidence; you do not need to choose the technical release path. |
| Project type | existing_project |
| Effective release channel | source_only |
| Recommendation | KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE |
| Blocked | Yes |
| Blocks release review | Yes |
| Release approved | No |
| Production approved | No |

## Source Identity

| Field | Value |
| --- | --- |
| Source ref | git:refs/heads/main |
| Source ref role | identity_only |
| Git allowed | Yes |
| Tag allowed as identity | Yes |
| Tag triggers release workflow | No |
| Tag trigger workflow ref | not_applicable |

## GitHub Release Policy

| Field | Value |
| --- | --- |
| GitHub Release used | No |
| GitHub Release assets uploaded | No |
| GitHub Release assets allowed | No |
| GitHub Release notes only | Unknown |
| Release event workflow detected | No |
| Policy state | NOT_USED |

## GitHub Actions Policy

| Field | Value |
| --- | --- |
| Release workflow detected | No |
| GitHub-hosted runner used | No |
| Self-hosted runner used | No |
| Actions artifact used as release package | No |
| GitHub Packages used as release package | No |
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
| Concrete cost consent required | No |
| Cost consent ref | missing |

## Release Package Identity

| Field | Value |
| --- | --- |
| Identity type | none |
| Identity ref | not_applicable |
| Digest or ID | not_applicable |
| Package location | none |
| Evidence preserved outside runtime bundle | Yes |
| Release evidence deleted to reduce bundle | No |

## Consent And External References

| Field | Value |
| --- | --- |
| Concrete release consent required | No |
| Consent required for this policy | No |
| Consent required before release review | Yes |
| Consent confirmer ref | missing |
| Cost consent ref | missing |
| Platform/provider ref | not_applicable |
| Production consent ref | not_applicable |

## Source Chain

| Source | Ref | Digest | Scope Match | Release Candidate Match | Project Match |
| --- | --- | --- | --- | --- | --- |
| release_evidence_gate | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | release_candidate | Unknown | Unknown |
| runtime_hygiene | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | release_candidate | Unknown | Unknown |
| project_sop | file:docs/execution-release-runtime-hygiene.md | sha256:afead0d719642c5cc7d46543c5692c899c872f5913673ee414054741feb6cffb | project | N/A | Yes |
| ci_workflow | file:.github/workflows/intentos-pr-checks.yml | sha256:483d945d493cce1674ffe72448cea5921ea5a5bbb255e45c7baa603d4802235c | project | N/A | Yes |
| package_config | file:package.json | sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e | project | N/A | Yes |
| docker_config | missing | sha256:ffa63583dfa6706b87d284b86b0d693a161e4840aad2c5cf6b5d27c3b9621f7d | project | N/A | Unknown |
| provider_config | not_applicable | sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e | project | N/A | Unknown |
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
  "schema_version": "1.87.1",
  "artifact_type": "release_channel_policy",
  "release_channel_policy_ref": "release-channel-policies/113-cross-domain-trust-closure.md",
  "release_channel_policy_digest": "sha256:6c428f9a95fe75180707404eda74660bb7745f054e89f50259074dc5bdff6908",
  "intent": "Keep the IntentOS 1.113 candidate source-only and prohibit all external release effects.",
  "intent_digest": "sha256:1207ceb6c34889b6518a44d6d4f58aaa4af7c1adefea6c8efb5dddb9777a71a7",
  "project_type": "existing_project",
  "source_identity": {
    "source_ref": "git:refs/heads/main",
    "source_ref_role": "identity_only",
    "git_allowed": "Yes",
    "tag_allowed_as_identity": "Yes",
    "tag_used": "Unknown",
    "tag_triggers_release_workflow": "No",
    "tag_trigger_workflow_ref": "not_applicable"
  },
  "effective_release_channel": {
    "channel": "source_only",
    "recommendation_class": "KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE",
    "blocked": "Yes",
    "blocked_by": [
      "source_only_external_effect_not_proven_absent"
    ],
    "current_channel_detected": "Yes",
    "current_channel_summary": "release SOP, unresolved package-script external effect",
    "recommended_channel_summary": "source_only with recommendation KEEP_GIT_SOURCE_ONLY_AND_EXTERNAL_RELEASE."
  },
  "github_release_policy": {
    "github_release_used": "No",
    "github_release_assets_uploaded": "No",
    "github_release_assets_allowed": "No",
    "github_release_notes_only": "Unknown",
    "release_event_workflow_detected": "No",
    "policy_state": "NOT_USED"
  },
  "github_actions_policy": {
    "release_workflow_detected": "No",
    "github_hosted_runner_used": "No",
    "self_hosted_runner_used": "No",
    "actions_artifact_used_as_release_package": "No",
    "github_packages_used_as_release_package": "No",
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
    "release_owner_required": "No",
    "release_owner_required_for_policy": "No",
    "release_owner_required_before_release_review": "Yes",
    "release_owner_ref": "missing",
    "cost_owner_ref": "missing",
    "platform_owner_ref": "not_applicable",
    "production_owner_ref": "not_applicable"
  },
  "release_package_identity": {
    "identity_type": "none",
    "identity_ref": "not_applicable",
    "digest_or_id": "not_applicable",
    "not_applicable_reason": "No release package is selected by this policy."
  },
  "artifact_policy": {
    "release_package_location": "none",
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
      "source_scope_match": "release_candidate",
      "current_release_candidate_match": "Unknown",
      "project_match": "Unknown"
    },
    {
      "source_kind": "project_sop",
      "source_ref": "file:docs/execution-release-runtime-hygiene.md",
      "source_digest": "sha256:afead0d719642c5cc7d46543c5692c899c872f5913673ee414054741feb6cffb",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "ci_workflow",
      "source_ref": "file:.github/workflows/intentos-pr-checks.yml",
      "source_digest": "sha256:483d945d493cce1674ffe72448cea5921ea5a5bbb255e45c7baa603d4802235c",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Yes"
    },
    {
      "source_kind": "package_config",
      "source_ref": "file:package.json",
      "source_digest": "sha256:7f3904c21ef809771285b8eb1f57d6675b841578bbb47cd10399e5f66fbba75e",
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
      "project_match": "Unknown"
    },
    {
      "source_kind": "provider_config",
      "source_ref": "not_applicable",
      "source_digest": "sha256:243ffa2eeced1cbfa18357fe8edf03833381b9a83359bf0930ae5e8e862ab30e",
      "source_scope_match": "project",
      "current_release_candidate_match": "N/A",
      "project_match": "Unknown"
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
    "can_use_github_as_release_channel": "No",
    "can_use_github_as_source_and_evidence_only": "Yes",
    "needs_release_owner_decision": "No",
    "needs_cost_owner_decision": "No",
    "blocks_release_review": "Yes",
    "plain_user_summary": "I will keep the external release blocked because a workflow package script cannot be proven free of external effects. I will continue the technical checks and prepare evidence; you do not need to choose the technical release path."
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

Keep release review blocked while Codex resolves technical gaps; ask the user only for missing cost consent, a concrete external effect, or an external provider fact.
