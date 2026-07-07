# Release Evidence Gate Report

## Human Summary

| Field | Value |
|---|---|
| Release Candidate | artifact:release-candidates/001-example.md |
| Release Target | preview |
| Gate State | BLOCKED_BY_MISSING_RELEASE_EVIDENCE |
| Can Handoff To Release Owner | No |
| Release Or Production Approved | No |

## Release Scope

| Field | Value |
|---|---|
| Source Revision | unknown |
| Dirty Worktree Status | unknown |
| Build Artifact | missing |
| Build Artifact Digest | sha256:replace-with-generated |
| Completion Evidence Count | 0 |

## Release Target Requirements

- completion-evidence
- build-or-preview-evidence
- runtime-smoke
- release-owner

## Source Chain

| Source | Status | Ref | Current Release Match | Outcome |
|---|---|---|---|---|
| completion_evidence | NOT_PROVIDED | not provided | N/A | not provided |

## Owner And Approval

| Field | Value |
|---|---|
| Release Owner Identified | No |
| Release Approval | No |
| Owner Decisions | Identify the human release owner. |

## Environment Readiness

| Field | Value |
|---|---|
| Target Environment | preview |
| Config Owner | missing |
| Secrets Required | No |
| Secret Values Recorded | No |
| DNS Or Callback Changes Required | No |
| Blocked By Environment Config | No |

## Runtime And Rollback

| Field | Value |
|---|---|
| Runtime Smoke Ref | missing |
| Runtime Smoke Digest |  |
| Runtime Smoke User Note Only | No |
| Rollback Ref | missing |
| Rollback Digest |  |
| Rollback Window | missing |
| Monitoring Ref | missing |
| Monitoring Digest |  |
| Incident Owner Ref | missing |

## Data Migration And Cost

| Field | Value |
|---|---|
| Migration Required | No |
| Migration Plan Ref | missing |
| Codex May Execute Migration | No |
| Cost Owner Ref | not_applicable |
| Blocked By Unknown Quota | No |

## Existing Project Release Rules

| Project Rule | IntentOS Requirement | Mapping State |
|---|---|---|
| not_applicable | release evidence gate | NOT_APPLICABLE |

## Missing Evidence

- completion-evidence
- build-or-preview-evidence
- runtime-smoke
- release-owner

## Boundaries

| Boundary | Value |
|---|---|
| This report writes target files | No |
| This report approves release or production | No |
| This report executes deployment | No |
| This report executes migration | No |
| This report uses or records secrets | No |
| This report submits to app store or mini program | No |
| This report changes DNS, payment, provider, or CI | No |
| This report proves real-user stability | No |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.80.0",
  "artifact_type": "release_evidence_gate",
  "intent": "prepare release owner review",
  "intent_digest": "sha256:replace-with-generated",
  "release_evidence_digest": "sha256:replace-with-generated",
  "release_target": "preview",
  "release_scope": {
    "release_candidate_ref": "artifact:release-candidates/001-example.md",
    "release_candidate_digest": "sha256:replace-with-generated",
    "source_revision": "unknown",
    "dirty_worktree_status": "unknown",
    "included_task_refs": [],
    "included_completion_evidence_refs": [],
    "excluded_known_items": [],
    "build_artifact_ref": "missing",
    "build_artifact_digest": "sha256:replace-with-generated"
  },
  "gate_state": "BLOCKED_BY_MISSING_RELEASE_EVIDENCE",
  "can_handoff_to_release_owner": "No",
  "release_or_production_approved": "No",
  "source_chain": [],
  "release_target_requirements": [
    {
      "target": "preview",
      "required_evidence_ids": ["completion-evidence", "build-or-preview-evidence", "runtime-smoke", "release-owner"]
    }
  ],
  "required_evidence": ["completion-evidence", "build-or-preview-evidence", "runtime-smoke", "release-owner"],
  "missing_evidence": ["completion-evidence", "build-or-preview-evidence", "runtime-smoke", "release-owner"],
  "owner_decisions": ["Identify the human release owner."],
  "runtime_readiness": {
    "runtime_smoke_ref": "missing",
    "runtime_smoke_digest": "",
    "runtime_smoke_evidence_type": "missing",
    "runtime_smoke_user_note_only": "No"
  },
  "rollback_readiness": {
    "rollback_ref": "missing",
    "rollback_digest": "",
    "rollback_window": "missing",
    "blocked_by_missing_rollback": "No"
  },
  "monitoring_readiness": {
    "monitoring_ref": "missing",
    "monitoring_digest": "",
    "incident_owner_ref": "missing",
    "support_handoff_ref": "missing",
    "blocked_by_missing_monitoring": "No"
  },
  "environment_readiness": {
    "target_environment": "preview",
    "config_owner": "missing",
    "secrets_required": "No",
    "secrets_values_recorded": "No",
    "dns_or_callback_changes_required": "No",
    "blocked_by_environment_config": "No"
  },
  "data_migration_readiness": {
    "migration_required": "No",
    "migration_plan_ref": "missing",
    "backup_or_restore_ref": "missing",
    "data_owner_ref": "missing",
    "codex_may_execute_migration": "No"
  },
  "cost_quota_readiness": {
    "cost_owner_ref": "not_applicable",
    "quota_risks": [],
    "blocked_by_unknown_quota": "No"
  },
  "existing_release_rule_mapping": [
    {
      "project_rule_ref": "not_applicable",
      "intentos_requirement": "release evidence gate",
      "mapping_state": "NOT_APPLICABLE"
    }
  ],
  "forbidden_actions": [],
  "boundaries": {
    "writes_target_files": "No",
    "approves_release_or_production": "No",
    "executes_deployment": "No",
    "executes_migration": "No",
    "uses_or_records_secrets": "No",
    "submits_to_app_store_or_mini_program": "No",
    "changes_dns_payment_provider_or_ci": "No",
    "proves_real_user_stability": "No"
  },
  "next_step": "Collect missing release evidence before release-owner review."
}
```

## Outcome

`BLOCKED_BY_MISSING_RELEASE_EVIDENCE`

## Next Step

Collect missing release evidence before release-owner review.
