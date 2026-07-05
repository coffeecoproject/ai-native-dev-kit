# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `DIRTY_WORKTREE_PROJECT` |
| Recommended Posture | `NATIVE_FIRST_PENDING_WORKTREE_REVIEW` |
| Can Codex write now | `No` |
| IntentOS Workflow Authority | `ACTIVE_FOR_PLANNING` |
| Target File Write Authority | `NO_WRITE` |
| Business Authority | `PROJECT_OWNED` |
| Production Authority | `HUMAN_OR_EXTERNAL_SYSTEM` |
| Requires Human Approval Before Apply | `Yes` |

## Existing Governance Inventory

| Area | Source | Handling |
| --- | --- | --- |
| Agent rules | `AGENTS.md` | classify before migration |
| Worktree | git status | pause governance writes |
| Work intake | `tasks/current.md` | preserve current work boundary |

## Extracted Rule Classification

| Rule ID | Source file | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | `AGENTS.md` | line 5: Codex may continue current task after checking status. | `WORKFLOW_RULE` | old agent rule | replace after reviewed plan and approval | replace | IntentOS should route interrupted work through Work Queue and boundary review. | workflow | replace with IntentOS work queue and apply-plan flow | Yes |
| `R-002` | `tasks/current.md` | line 2: Current contract validation change is unfinished. | `PROJECT_CONSTRAINT` | project work queue | preserve or map | preserve | Current user work must not be mixed with migration. | worktree, task | stop migration writes until worktree is reviewed | Yes |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| `C-001` | `OWNER_CONFLICT` | dirty worktree | Native migration apply | No writes until current changes are classified | Yes |
| `C-002` | `WORKFLOW_CONFLICT` | `AGENTS.md` | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Record Native Migration Plan | `native-migration-plans/001-dirty-worktree.md` | No | Yes | Proposed |
| 2 | Record worktree pause / resume decision | `work-queue/001-current-worktree.md` | No | Yes | Blocked |
| 3 | Prepare Unified Apply Plan only after worktree review | `apply-plans/001-native-governance.md` | No | Yes | Blocked |

## Proposed AGENTS.md Handling

| Field | Value |
| --- | --- |
| Existing AGENTS parsed | Yes |
| Replacement proposed | Yes, only after reviewed plan and approval |
| Project facts preserved | Yes |
| Old workflow rules replaced by IntentOS only after approval | Yes |
| Restore owner | human owner |

## Preserve / Replace / Archive Suggestions

| Item | Action | Reason |
| --- | --- | --- |
| Current worktree changes | Preserve | User work must not be overwritten |
| Old AI workflow rule | Replace after approval | IntentOS becomes future workflow authority |
| Current task note | Preserve | Resume review needs it |

## Restore Plan

| Field | Value |
| --- | --- |
| Backup path | `.intentos/backups/native-migration/dirty-worktree/AGENTS.md` |
| Restore method | Restore approved backup or leave old AGENTS unchanged |
| Restore owner | human owner |
| If owner rejects migration | Keep adapter-only / read-only mapping |

## Authority Transition

| Field | Value |
| --- | --- |
| Old workflow rules | Preserved until reviewed migration plan is approved |
| IntentOS rules | Preferred future workflow authority for Codex planning |
| Transition condition | Worktree boundary is resolved and human approves exact plan |

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
| Resolve dirty worktree before governance writes | human | Needed now |
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
