# Work Queue Takeover Report

This report reviews old project task sources and recommends whether IntentOS Work Queue should become the future task entry.

It does not authorize implementation.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | `<plain summary>` |
| Task system class | `<RELIABLE_EXISTING_TASK_SYSTEM/MESSY_TASK_SYSTEM/MISSING_TASK_SYSTEM/UNSAFE_TO_TAKE_OVER>` |
| Recommended action | `<MAP_EXISTING_TASK_SYSTEM/ESTABLISH_INTENTOS_WORK_QUEUE/BLOCK_TAKEOVER>` |
| Future task authority | `<PROJECT_NATIVE_MAPPED/INTENTOS_WORK_QUEUE/BLOCKED>` |
| Can Codex write now | `No` |
| Can Codex execute tasks from old TODO directly | `No` |

## Source Inventory

| Source | Digest | Type | Status | Summary |
| --- | --- | --- | --- | --- |
| `<source ref>` | `sha256:<64 hex>` | `<todo/session/work_queue/other>` | `<CURRENT/STALE/UNKNOWN/RISKY>` | `<summary>` |

## Reliability Assessment

| Criterion | Result | Reason |
| --- | --- | --- |
| One current task | `<Yes/No/Unknown>` | `<reason>` |
| Stable task ids | `<Yes/No/Unknown>` | `<reason>` |
| Task states | `<Yes/No/Unknown>` | `<reason>` |
| Owners or source owners | `<Yes/No/Unknown>` | `<reason>` |
| Resume checkpoints | `<Yes/No/Unknown>` | `<reason>` |
| Verification or close-out evidence | `<Yes/No/Unknown>` | `<reason>` |
| No uncontrolled duplication | `<Yes/No/Unknown>` | `<reason>` |

## Migration Dispositions

| Source Item | Source Digest | Disposition | Target Queue State | Reason |
| --- | --- | --- | --- | --- |
| `<source item>` | `sha256:<64 hex>` | `<MIGRATE_CURRENT/MIGRATE_BACKLOG/MARK_STALE/...>` | `<CURRENT/BACKLOG/PAUSED/BLOCKED/DONE/CANCELLED/N/A>` | `<reason>` |

## Queue Items

| Item ID | State | Title | Source Item | Source Digest | Task Governance Ref | Task Governance Digest | Binding Status | Execution Review Eligible After Task Governance | Execution Eligible | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<item id>` | `<CURRENT/BACKLOG/PAUSED/BLOCKED/DONE/CANCELLED>` | `<title>` | `<source item>` | `sha256:<64 hex>` | `<ref or N/A>` | `<digest or N/A>` | `<PENDING/VERIFIED/N/A>` | `<Yes/No>` | `No` | `<reason>` |

## Boundaries

- This report writes target files: No
- This report deletes old task sources: No
- This report approves implementation: No
- This report approves completion: No
- This report approves commit or push: No
- This report approves release or production: No
- This report claims full adoption: No
- This report installs native assets: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.84.1",
  "artifact_type": "work_queue_takeover",
  "work_queue_takeover_ref": "work-queue-takeover-reports/generated.md",
  "work_queue_takeover_digest": "sha256:<64 hex>",
  "intent": "<intent>",
  "intent_digest": "sha256:<64 hex>",
  "project_task_system_class": "MESSY_TASK_SYSTEM",
  "recommended_action": "ESTABLISH_INTENTOS_WORK_QUEUE",
  "future_task_authority": "INTENTOS_WORK_QUEUE",
  "plain_user_summary": "<plain summary>",
  "source_inventory": [],
  "reliability_assessment": [],
  "migration_dispositions": [],
  "queue_items": [],
  "readiness": {
    "takeover_ready": "Yes",
    "takeover_review_ready": "Yes",
    "can_codex_write_now": "No",
    "can_execute_from_old_todo_directly": "No",
    "blocked_by": []
  },
  "boundaries": {
    "writes_target_files": "No",
    "deletes_old_task_sources": "No",
    "approves_implementation": "No",
    "approves_completion": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "claims_full_adoption": "No",
    "installs_native_assets": "No"
  },
  "outcome": "TAKEOVER_RECOMMENDED"
}
```

## Outcome

`<MAPPED_EXISTING_SYSTEM/TAKEOVER_RECOMMENDED/TAKEOVER_BLOCKED>`
