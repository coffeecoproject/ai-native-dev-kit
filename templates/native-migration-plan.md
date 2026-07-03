# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `<existing-light / governed / production / dirty / blocked>` |
| Recommended Posture | `<NATIVE_FIRST_MIGRATION / NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW / PRODUCTION_SAFE_NATIVE_OVERLAY / NATIVE_FIRST_PENDING_WORKTREE_REVIEW / ADAPTER_ONLY_RECOMMENDED>` |
| Can Codex write now | `No` |
| IntentOS Workflow Authority | `<ACTIVE_FOR_PLANNING / PENDING_APPROVAL / BLOCKED>` |
| Target File Write Authority | `<NO_WRITE / PLAN_REQUIRED / APPROVAL_REQUIRED>` |
| Business Authority | `PROJECT_OWNED` |
| Production Authority | `HUMAN_OR_EXTERNAL_SYSTEM` |
| Requires Human Approval Before Apply | `Yes` |

## Existing Governance Inventory

| Area | Source | Handling |
| --- | --- | --- |
| Agent rules | `<path>` | classify before migration |
| Engineering baseline | `<path>` | preserve or map |
| Release / rollback | `<path>` | preserve and map |

## Extracted Rule Classification

| Rule ID | Source file | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | `<path>` | `<line or excerpt>` | `WORKFLOW_RULE` | `<source>` | replace after approval | replace | `<reason>` | workflow | migrate to IntentOS workflow rule | Yes |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| `C-001` | `WORKFLOW_CONFLICT` | `<path>` | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Review classified rules | `native-migration-plans/<id>.md` | No | Yes | Proposed |
| 2 | Prepare Unified Apply Plan for governance assets only | `apply-plans/<id>.md` | No | Yes | Proposed |

## Proposed AGENTS.md Handling

| Field | Value |
| --- | --- |
| Existing AGENTS parsed | `<Yes / No / N/A>` |
| Replacement proposed | `<Yes / No>` |
| Project facts preserved | `Yes` |
| Old workflow rules replaced by IntentOS only after approval | `Yes` |
| Restore owner | `<human owner>` |

## Preserve / Replace / Archive Suggestions

| Item | Action | Reason |
| --- | --- | --- |
| Business rules | Preserve | Project behavior remains project-owned |
| Old AI workflow rules | Replace after approval | IntentOS becomes workflow authority |
| Historical duplicate notes | Archive suggestion | Do not delete by default |

## Restore Plan

| Field | Value |
| --- | --- |
| Backup path | `<backup path or N/A if no replacement>` |
| Restore method | `<manual restore / git restore from approved backup>` |
| Restore owner | `<human owner>` |
| If owner rejects migration | Keep adapter-only / read-only mapping |

## Authority Transition

| Field | Value |
| --- | --- |
| Old workflow rules | preserved until reviewed migration plan is approved |
| IntentOS rules | preferred future workflow authority for Codex planning |
| Transition condition | human approval of exact Native Migration Plan and related apply plan |

## Apply Chain

```text
Native Migration Plan
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
Change Impact Coverage / Review Loop / Finish
```

## Human Decisions Needed

| Decision | Owner | Status |
| --- | --- | --- |
| Confirm IntentOS-native planning posture | human | Pending |
| Approve or reject governance replacement plan | human | Pending |

## Boundaries

- This plan writes target files: No
- This plan authorizes target-file writes: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks: No
- This plan changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior: No
- This plan requires human approval before governance replacement: Yes
- This plan treats IntentOS workflow authority as business authority: No

## Outcome

`NATIVE_MIGRATION_PLAN_RECORDED`
