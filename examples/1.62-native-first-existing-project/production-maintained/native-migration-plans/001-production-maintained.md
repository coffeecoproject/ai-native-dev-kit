# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `EXISTING_PRODUCTION_PROJECT` |
| Recommended Posture | `PRODUCTION_SAFE_NATIVE_OVERLAY` |
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
| Release / rollback | `docs/production-release-sop.md` | preserve and map |
| Incident response | `docs/incident-runbook.md` | preserve and escalate |

## Extracted Rule Classification

| Rule ID | Source file | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | `AGENTS.md` | line 6: AI must ask before changing production-adjacent files. | `WORKFLOW_RULE` | old agent rule | replace after reviewed plan and approval | replace | IntentOS should make the workflow boundary explicit. | workflow | replace with IntentOS workflow rule | Yes |
| `R-002` | `docs/production-release-sop.md` | line 2: Production deploys require release owner approval and rollback evidence. | `PRODUCTION_CONTROL` | release owner | preserve and escalate | preserve | Production controls remain outside IntentOS authority. | release, production | map to Release Guide / Recipe / Handoff | Yes |
| `R-003` | `docs/incident-runbook.md` | line 7: Active incidents freeze non-emergency workflow changes. | `PRODUCTION_CONTROL` | incident owner | preserve and escalate | preserve | Incident controls override workflow convenience. | incident, production | keep as blocking project constraint | Yes |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| `C-001` | `WORKFLOW_CONFLICT` | `AGENTS.md` | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |
| `C-002` | `PRODUCTION_CONFLICT` | `docs/production-release-sop.md` | Release Guide / Handoff mapping | Preserve SOP and map only | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Record Native Migration Plan | `native-migration-plans/001-production-maintained.md` | No | Yes | Proposed |
| 2 | Prepare Unified Apply Plan for governance assets only | `apply-plans/001-production-native-governance.md` | No | Yes | Proposed |
| 3 | Plan IntentOS-native AGENTS.md replacement after classification | `AGENTS.md` | No | Yes | Proposed |
| 4 | Map release SOP without replacing it | `release-guides/001-production-release.md` | No | Yes | Proposed |

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
| Production release SOP | Preserve and map | Release owner remains authoritative |
| Incident runbook | Preserve and escalate | Active incident rules override workflow |
| Old AI workflow rule | Replace after approval | IntentOS becomes future workflow authority |

## Restore Plan

| Field | Value |
| --- | --- |
| Backup path | `.ai-native/backups/native-migration/production-maintained/AGENTS.md` |
| Restore method | Restore approved backup or leave old AGENTS unchanged |
| Restore owner | release owner |
| If owner rejects migration | Keep adapter-only / read-only mapping |

## Authority Transition

| Field | Value |
| --- | --- |
| Old workflow rules | Preserved until reviewed migration plan is approved |
| IntentOS rules | Preferred future workflow authority for Codex planning |
| Transition condition | Human approval of exact Native Migration Plan and release owner acceptance |

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
| Confirm production overlay and release SOP mapping | release owner | Needed before apply |

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
