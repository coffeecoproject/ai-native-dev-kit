# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `EXISTING_LIGHT_PROJECT` |
| Recommended Posture | `NATIVE_FIRST_MIGRATION` |
| Can Codex write now | `No` |
| IntentOS Workflow Authority | `ACTIVE_FOR_PLANNING` |
| Target File Write Authority | `PLAN_REQUIRED` |
| Business Authority | `PROJECT_OWNED` |
| Production Authority | `HUMAN_OR_EXTERNAL_SYSTEM` |
| Requires Human Approval Before Apply | `Yes` |

## Existing Governance Inventory

| Area | Source | Handling |
| --- | --- | --- |
| Agent rules | `AGENTS.md` | classify before migration |
| Engineering baseline | `README.md` | preserve build command and map |
| Release / rollback | none detected | do not invent release process |

## Extracted Rule Classification

| Rule ID | Source file | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | `AGENTS.md` | line 4: AI may edit files after a short plan. | `WORKFLOW_RULE` | old agent rule | replace after reviewed plan and approval | replace | IntentOS should become the future Codex workflow authority. | workflow | replace with IntentOS apply-plan and review flow | Yes |
| `R-002` | `README.md` | line 9: Run npm test before handoff. | `ENGINEERING_BASELINE` | project README | migrate into baseline after review | map | Existing verification command should be preserved as evidence. | engineering | map to engineering baseline | Yes |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| `C-001` | `WORKFLOW_CONFLICT` | `AGENTS.md` | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Record Native Migration Plan | `native-migration-plans/001-light-web.md` | No | Yes | Proposed |
| 2 | Prepare Unified Apply Plan for governance assets only | `apply-plans/001-light-web-native-governance.md` | No | Yes | Proposed |
| 3 | Plan IntentOS-native AGENTS.md replacement after classification | `AGENTS.md` | No | Yes | Proposed |

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
| Project test command | Preserve | It is current project evidence |
| Old AI workflow rule | Replace after approval | IntentOS becomes future workflow authority |
| Historical notes | Archive suggestion | Do not delete by default |

## Restore Plan

| Field | Value |
| --- | --- |
| Backup path | `.intentos/backups/native-migration/light-web/AGENTS.md` |
| Restore method | Restore approved backup or leave old AGENTS unchanged |
| Restore owner | human owner |
| If owner rejects migration | Keep adapter-only / read-only mapping |

## Authority Transition

| Field | Value |
| --- | --- |
| Old workflow rules | Preserved until reviewed migration plan is approved |
| IntentOS rules | Preferred future workflow authority for Codex planning |
| Transition condition | Human approval of exact Native Migration Plan and related apply plan |

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
