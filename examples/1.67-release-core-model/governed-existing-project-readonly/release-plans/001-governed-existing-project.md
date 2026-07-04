# Release Plan

## Human Summary

| Field | Value |
|---|---|
| Release Plan State | `BLOCKED_BY_PROJECT_AUTHORITY` |
| Summary State Kind | `SUMMARY_ONLY` |
| Release Target | `PREVIEW_OR_TEST` |
| Release Plan Is Pure View | Yes |
| IntentOS Operating Mode | `ACTIVE` |
| Project Asset Migration Depth | `ADAPTER_ONLY` |
| Safe Next Step | Keep Codex working in IntentOS Operating Mode, then complete Native Migration and Existing Rule Reconciliation before changing governance files. |

## Release Decision View

| Decision | Status | Reason | Next Step |
|---|---|---|---|
| Final release-plan state | `BLOCKED_BY_PROJECT_AUTHORITY` | Existing governed project rules are authoritative until compared. | Complete rule comparison. |
| Release source systems | `NEEDS_INPUT` | Lower-level systems remain authoritative. | Inspect trace before acting. |
| Execution authority | `HUMAN_OR_EXTERNAL_SYSTEM` | Release Plan cannot approve or execute release. | Use structured approval and handoff. |

## Release Plan Trace

| Source System | Status | Ref | Contribution | Control Authority |
|---|---|---|---|---|
| Release Adapter | `NEEDS_INPUT` | release-adapters/001-release-adapter.md | Existing release path needs mapping. | No |
| Release Guide | `NEEDS_INPUT` | release-guides/001-release-guide.md | User-facing routing is pending. | No |
| Platform Release Recipe | `NEEDS_INPUT` | release-recipes/001-web-hosted-preview.md | Platform recipe must respect existing SOP. | No |
| Launch Review View | `MISSING` | N/A | Launch review not recorded. | No |
| Release Handoff Pack | `MISSING` | N/A | Handoff waits for approval. | No |
| Release Execution Protocol | `MISSING` | N/A | Execution remains plan-only. | No |
| Native Migration Plan | `NEEDS_INPUT` | native-migration-plans/001-governed.md | Migration depth requires review. | No |
| Existing Rule Reconciliation | `NEEDS_INPUT` | existing-rule-reconciliations/001-governed.md | Existing rules must be compared. | No |

## Source System Inputs

| System | Authority | Status | Ref | Notes |
|---|---|---|---|---|
| Release Adapter | `SOURCE_SYSTEM` | `NEEDS_INPUT` | release-adapters/001-release-adapter.md | Maps release path only. |
| Native Migration Plan | `SOURCE_SYSTEM` | `NEEDS_INPUT` | native-migration-plans/001-governed.md | Selects migration depth. |
| Existing Rule Reconciliation | `SOURCE_SYSTEM` | `NEEDS_INPUT` | existing-rule-reconciliations/001-governed.md | Compares project-owned rules. |
| Release Handoff Pack | `SOURCE_SYSTEM` | `MISSING` | N/A | Created only after approval. |

## Existing Project Decision Summary

| Field | Value |
|---|---|
| Project State | `EXISTING_GOVERNED_PROJECT` |
| IntentOS Operating Mode | `ACTIVE` |
| Operating Mode Grants Write Permission | No |
| Project Asset Migration Depth | `ADAPTER_ONLY` |
| Rule Comparison Required | Yes |
| Why | Existing baselines and release rules are present; IntentOS guides Codex immediately but does not overwrite project assets. |

## Existing Project Rule Comparison

| Surface | Existing Ref | IntentOS Ref | Recommendation | Reason | Human Decision |
|---|---|---|---|---|---|
| Engineering baseline | docs/WEB_ENGINEERING_BASELINE.md | core/engineering-baseline.md | `KEEP_EXISTING_AS_STRICTER` | Existing typed contract and structure rules are stricter. | Yes |
| Environment baseline | docs/WEB_ENVIRONMENT_BASELINE.md | core/environment-baseline.md | `KEEP_EXISTING_AS_STRICTER` | Existing environment owner review is stricter. | Yes |
| Release / rollback | docs/WEB_RELEASE_ROLLBACK_BASELINE.md | core/release-core-model.md | `KEEP_EXISTING_AS_STRICTER` | Release and rollback remain project-owned. | Yes |
| Agent instructions | AGENTS.md | core/native-first-existing-project-migration.md | `MERGE_AFTER_REVIEW` | Add IntentOS mode wording only after review. | Yes |

## Codex May Do

| Action | Condition |
|---|---|
| Work in IntentOS Operating Mode | Planning, task routing, comparison, and local-safe checks. |
| Prepare Native Migration Plan | No target-file writes. |
| Prepare Existing Rule Reconciliation | Compare before proposing changes. |
| Prepare Unified Apply Plan | Only after reviewed migration depth. |

## Human Must Decide

| Decision | Why | Next Step |
|---|---|---|
| Governance migration | Existing governance is project-owned. | Review migration plan. |
| Release approval | Release risk is human-owned. | Record structured approval. |
| Rule replacement | Existing stricter rules may not be downgraded. | Use apply plan after review. |

## External System Actions

| Action | Owner |
|---|---|
| Production deploy | Human or external release system |
| Provider state change | Human or external release system |
| CI / hook mutation | Human-approved apply path |

## Evidence Requirements

| Evidence | Required | Status | Ref |
|---|---|---|---|
| Native Migration Plan | Yes | `NEEDS_INPUT` | native-migration-plans/001-governed.md |
| Existing Rule Reconciliation | Yes | `NEEDS_INPUT` | existing-rule-reconciliations/001-governed.md |
| Release Adapter | Yes | `NEEDS_INPUT` | release-adapters/001-release-adapter.md |
| Launch Review View | Yes | `MISSING` | N/A |
| Structured Approval | Yes | `MISSING` | N/A |

## Rollback / Monitoring / Smoke

| Surface | Status | Ref |
|---|---|---|
| Rollback | `RECORDED` | docs/WEB_RELEASE_ROLLBACK_BASELINE.md |
| Monitoring | `MISSING` | N/A |
| Post-release smoke | `MISSING` | N/A |

## Conflicts

| Conflict | Status | Resolution |
|---|---|---|
| Existing governance vs IntentOS defaults | `PENDING` | Keep stricter project rules; propose gaps through apply plan. |

## Boundaries

- This plan approves release: No
- This plan approves production: No
- This plan writes target-project files: No
- This plan changes command behavior: No
- This plan lets trace control execution: No
- This plan lets summary state drive execution: No
- This plan treats IntentOS Operating Mode as write permission: No
- This plan makes Codex the release owner: No
- This plan replaces existing governance: No
- This plan modifies CI or hooks: No
- This plan asks for or stores secrets: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.67.0",
  "artifact_type": "release_plan_evidence",
  "artifact_id": "governed-existing-project-release-plan",
  "release_plan_digest": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
  "release_plan": {
    "state": "BLOCKED_BY_PROJECT_AUTHORITY",
    "summary_state_kind": "SUMMARY_ONLY",
    "release_target": "PREVIEW_OR_TEST",
    "project_asset_migration_depth": "ADAPTER_ONLY",
    "safe_next_step": "Keep Codex working in IntentOS Operating Mode, then complete Native Migration and Existing Rule Reconciliation before changing governance files."
  },
  "release_plan_boundary": {
    "pure_view_model": true,
    "approves_release": false,
    "approves_production": false,
    "writes_target_files": false,
    "changes_command_behavior": false,
    "trace_controls_execution": false,
    "summary_state_drives_execution": false,
    "operating_mode_grants_write_permission": false,
    "codex_release_owner": false,
    "replaces_existing_governance": false,
    "modifies_ci_or_hooks": false,
    "asks_for_or_stores_secrets": false
  },
  "existing_project_intentos_mode": {
    "operating_mode_active": true,
    "operating_mode_grants_write_permission": false,
    "migration_depth": "ADAPTER_ONLY",
    "rule_comparison_required": true
  },
  "trace": [
    {
      "source_system": "Release Adapter",
      "status": "NEEDS_INPUT",
      "ref": "release-adapters/001-release-adapter.md",
      "contribution": "Existing release path needs mapping.",
      "control_authority": false
    },
    {
      "source_system": "Native Migration Plan",
      "status": "NEEDS_INPUT",
      "ref": "native-migration-plans/001-governed.md",
      "contribution": "Migration depth requires review.",
      "control_authority": false
    },
    {
      "source_system": "Existing Rule Reconciliation",
      "status": "NEEDS_INPUT",
      "ref": "existing-rule-reconciliations/001-governed.md",
      "contribution": "Existing rules must be compared.",
      "control_authority": false
    }
  ],
  "existing_rule_comparison": [
    {
      "surface": "Engineering baseline",
      "existing_ref": "docs/WEB_ENGINEERING_BASELINE.md",
      "intentos_ref": "core/engineering-baseline.md",
      "recommendation": "KEEP_EXISTING_AS_STRICTER",
      "human_decision_required": true
    },
    {
      "surface": "Release / rollback",
      "existing_ref": "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
      "intentos_ref": "core/release-core-model.md",
      "recommendation": "KEEP_EXISTING_AS_STRICTER",
      "human_decision_required": true
    }
  ],
  "outcome": "BLOCKED_BY_PROJECT_AUTHORITY"
}
```

## Outcome

`BLOCKED_BY_PROJECT_AUTHORITY`

