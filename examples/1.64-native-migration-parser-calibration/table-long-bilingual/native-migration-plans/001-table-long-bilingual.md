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
| Recommended Next Step | Review current worktree and pause governance writes. |

## Existing Governance Inventory

| Area | Source | Handling |
| --- | --- | --- |
| Agent rules | AGENTS.md | classify before migration |
| Governance docs | docs/GOVERNANCE.md | preserve or map |
| Work intake | none detected | gap or not needed |
| CI / gates | none detected | do not invent gates |
| Release / rollback | none detected | not detected |
| Hooks / automation | none detected | not detected |
| IntentOS assets | native-migration-plans | reuse and update through apply-plan |

## Rule Extraction Coverage

| Source file | Lines scanned | Rules extracted | Unclassified blocks | Skipped blocks | Low-signal blocks | Parser warnings |
| --- | --- | --- | --- | --- | --- | --- |
| AGENTS.md | 20 | 2 | 0 | 2 | 0 | AGENTS.md:11-14 markdown table skipped by deterministic extractor<br>AGENTS.md:18-18 long paragraph skipped by deterministic extractor |
| docs/GOVERNANCE.md | 10 | 1 | 0 | 0 | 1 | docs/GOVERNANCE.md:5-5 low-signal governance text needs manual review |

## Extracted Rule Classification

| Rule ID | Source file | Source line range | Context heading | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | AGENTS.md | 5-5 | Project Agent Rules > Workflow Rules | Codex should follow the old task checklist before editing files. | `WORKFLOW_RULE` | old workflow source | replace after reviewed plan and approval | replace | Old AI workflow guidance can move under IntentOS workflow authority after approval. | workflow | replace with IntentOS workflow rule through apply-plan | Yes | HIGH |
| `R-002` | AGENTS.md | 9-9 | Project Agent Rules > Release Rules | Production release requires rollback evidence from the release owner. | `PRODUCTION_CONTROL` | project/release owner | preserve and escalate | preserve | Release and production controls remain external to IntentOS workflow convenience. | release, production | map to Release Guide / Recipe / Handoff without replacement | Yes | HIGH |
| `R-003` | docs/GOVERNANCE.md | 9-9 | Governance Notes > Data Rules | Domain status values must use enums, not free strings. | `ENGINEERING_BASELINE` | project baseline | migrate into IntentOS baseline after review | map | Engineering rules can become baseline evidence after review. | engineering | map to engineering/environment baseline | Yes | HIGH |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| C-001 | `WORKFLOW_CONFLICT` | AGENTS.md | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |
| C-005 | `OWNER_CONFLICT` | dirty worktree | Native migration apply | No writes until worktree boundary is resolved | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Record Native Migration Plan | `native-migration-plans/001-native-migration.md` | No | Yes | Proposed |
| 2 | Prepare Unified Apply Plan for approved governance assets only | `apply-plans/001-native-governance.md` | No | Yes | Proposed |
| 3 | Record Controlled Apply Readiness before any apply | `apply-readiness-reports/001-native-governance.md` | No | Yes | Proposed |
| 4 | Record human Approval Record for exact governance action IDs | `approval-records/001-native-governance.md` | No | Yes | Proposed |
| 5 | Plan IntentOS-native AGENTS.md replacement after classification | `AGENTS.md` | No | Yes | Proposed |
| 7 | Pause governance writes until current worktree changes are classified | `work-queue/001-current-worktree.md` | No | Yes | Blocked |

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
| Business facts | Preserve | Project behavior remains project-owned |
| Production controls | Preserve and escalate | Production authority remains human or external-system owned |
| Engineering baseline rules | Map | Baseline changes require review and evidence |
| Old workflow rules | Replace after approval | IntentOS becomes future workflow authority |
| Historical notes | Archive suggestion | Do not delete by default |

## Restore Plan

| Field | Value |
| --- | --- |
| Backup path | `.ai-native/backups/native-migration/<timestamp>/` |
| Restore method | Restore approved backup or keep old governance unchanged if approval is rejected |
| Restore owner | human owner |
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
| Confirm which old rules are business or production constraints | human | Pending |
| Approve AGENTS.md replacement only after classification and restore plan | human | Pending |
| Resolve dirty worktree before governance writes | human | Needed now |
| Confirm release/production owner for any release SOP mapping | release owner | Needed before apply |

## Boundaries

- This plan writes target files: No
- This plan authorizes target-file writes: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks: No
- This plan changes production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior: No
- This plan requires human approval before governance replacement: Yes
- This plan treats IntentOS workflow authority as business authority: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.64.0",
  "artifact_type": "native_migration_plan",
  "report_type": "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
  "project_state": "DIRTY_WORKTREE_PROJECT",
  "posture": "NATIVE_FIRST_PENDING_WORKTREE_REVIEW",
  "can_codex_write_now": "No",
  "intent_os_workflow_authority": "ACTIVE_FOR_PLANNING",
  "target_file_write_authority": "NO_WRITE",
  "business_authority": "PROJECT_OWNED",
  "production_authority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requires_human_approval_before_apply": "Yes",
  "rule_extraction_coverage": [
    {
      "source_file": "AGENTS.md",
      "lines_scanned": 20,
      "rules_extracted": 2,
      "unclassified_blocks": [],
      "skipped_blocks": [
        {
          "source_file": "AGENTS.md",
          "source_start_line": 11,
          "source_end_line": 14,
          "context_heading": "Project Agent Rules > Release Rules",
          "excerpt": "/ Area / Rule / / --- / --- / / Finance / Invoice approval limit stays with finance owner. / / Permission / Admin role changes need owner review. /",
          "reason": "Markdown table skipped by deterministic extractor; classify table rules manually before migration."
        },
        {
          "source_file": "AGENTS.md",
          "source_start_line": 18,
          "source_end_line": 18,
          "context_heading": "Project Agent Rules > Historical Notes",
          "excerpt": "This paragraph intentionally describes a long historical governance note with several operational details, unresolved ownership hints, and old project habits that may or may not st",
          "reason": "Long paragraph skipped by deterministic extractor; review manually before migration."
        }
      ],
      "low_signal_blocks": [],
      "parser_warnings": [
        "AGENTS.md:11-14 markdown table skipped by deterministic extractor",
        "AGENTS.md:18-18 long paragraph skipped by deterministic extractor"
      ]
    },
    {
      "source_file": "docs/GOVERNANCE.md",
      "lines_scanned": 10,
      "rules_extracted": 1,
      "unclassified_blocks": [],
      "skipped_blocks": [],
      "low_signal_blocks": [
        {
          "source_file": "docs/GOVERNANCE.md",
          "source_start_line": 5,
          "source_end_line": 5,
          "context_heading": "Governance Notes > 业务规则",
          "excerpt": "门店结算周期按实际协议执行。",
          "reason": "Low-signal text under a governance-like heading was not classified automatically."
        }
      ],
      "parser_warnings": [
        "docs/GOVERNANCE.md:5-5 low-signal governance text needs manual review"
      ]
    }
  ],
  "rule_classifications": [
    {
      "rule_id": "R-001",
      "source_file": "AGENTS.md",
      "source_start_line": 5,
      "source_end_line": 5,
      "context_heading": "Project Agent Rules > Workflow Rules",
      "source_excerpt": "Codex should follow the old task checklist before editing files.",
      "rule_class": "WORKFLOW_RULE",
      "authority": "old workflow source",
      "default_handling": "replace after reviewed plan and approval",
      "preserve_or_replace": "replace",
      "reason": "Old AI workflow guidance can move under IntentOS workflow authority after approval.",
      "risk_surfaces": "workflow",
      "target_action": "replace with IntentOS workflow rule through apply-plan",
      "human_decision_required": "Yes",
      "confidence": "HIGH"
    },
    {
      "rule_id": "R-002",
      "source_file": "AGENTS.md",
      "source_start_line": 9,
      "source_end_line": 9,
      "context_heading": "Project Agent Rules > Release Rules",
      "source_excerpt": "Production release requires rollback evidence from the release owner.",
      "rule_class": "PRODUCTION_CONTROL",
      "authority": "project/release owner",
      "default_handling": "preserve and escalate",
      "preserve_or_replace": "preserve",
      "reason": "Release and production controls remain external to IntentOS workflow convenience.",
      "risk_surfaces": "release, production",
      "target_action": "map to Release Guide / Recipe / Handoff without replacement",
      "human_decision_required": "Yes",
      "confidence": "HIGH"
    },
    {
      "rule_id": "R-003",
      "source_file": "docs/GOVERNANCE.md",
      "source_start_line": 9,
      "source_end_line": 9,
      "context_heading": "Governance Notes > Data Rules",
      "source_excerpt": "Domain status values must use enums, not free strings.",
      "rule_class": "ENGINEERING_BASELINE",
      "authority": "project baseline",
      "default_handling": "migrate into IntentOS baseline after review",
      "preserve_or_replace": "map",
      "reason": "Engineering rules can become baseline evidence after review.",
      "risk_surfaces": "engineering",
      "target_action": "map to engineering/environment baseline",
      "human_decision_required": "Yes",
      "confidence": "HIGH"
    }
  ],
  "conflicts": [
    {
      "conflictId": "C-001",
      "conflictType": "WORKFLOW_CONFLICT",
      "existingSource": "AGENTS.md",
      "intentOsTarget": "IntentOS workflow authority",
      "defaultDecision": "IntentOS after reviewed plan and approval",
      "humanDecisionRequired": "Yes"
    },
    {
      "conflictId": "C-005",
      "conflictType": "OWNER_CONFLICT",
      "existingSource": "dirty worktree",
      "intentOsTarget": "Native migration apply",
      "defaultDecision": "No writes until worktree boundary is resolved",
      "humanDecisionRequired": "Yes"
    }
  ],
  "proposed_actions": [
    {
      "step": 1,
      "action": "Record Native Migration Plan",
      "exactTargetPath": "native-migration-plans/001-native-migration.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    },
    {
      "step": 2,
      "action": "Prepare Unified Apply Plan for approved governance assets only",
      "exactTargetPath": "apply-plans/001-native-governance.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    },
    {
      "step": 3,
      "action": "Record Controlled Apply Readiness before any apply",
      "exactTargetPath": "apply-readiness-reports/001-native-governance.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    },
    {
      "step": 4,
      "action": "Record human Approval Record for exact governance action IDs",
      "exactTargetPath": "approval-records/001-native-governance.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    },
    {
      "step": 5,
      "action": "Plan IntentOS-native AGENTS.md replacement after classification",
      "exactTargetPath": "AGENTS.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    },
    {
      "step": 7,
      "action": "Pause governance writes until current worktree changes are classified",
      "exactTargetPath": "work-queue/001-current-worktree.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Blocked"
    }
  ],
  "authority_transition": {
    "oldWorkflowRules": "preserved until reviewed migration plan is approved",
    "intentOsRules": "preferred future workflow authority for Codex planning",
    "transitionCondition": "human approval of exact Native Migration Plan and related apply plan"
  },
  "human_decisions_needed": [
    {
      "decision": "Confirm IntentOS-native planning posture",
      "owner": "human",
      "status": "Pending"
    },
    {
      "decision": "Approve or reject governance replacement plan",
      "owner": "human",
      "status": "Pending"
    },
    {
      "decision": "Confirm which old rules are business or production constraints",
      "owner": "human",
      "status": "Pending"
    },
    {
      "decision": "Approve AGENTS.md replacement only after classification and restore plan",
      "owner": "human",
      "status": "Pending"
    },
    {
      "decision": "Resolve dirty worktree before governance writes",
      "owner": "human",
      "status": "Needed now"
    },
    {
      "decision": "Confirm release/production owner for any release SOP mapping",
      "owner": "release owner",
      "status": "Needed before apply"
    }
  ],
  "boundary": {
    "writesTargetFiles": "No",
    "authorizesTargetFileWrites": "No",
    "approvesImplementation": "No",
    "approvesReleaseOrProduction": "No",
    "modifiesCiOrHooks": "No",
    "changesHighRiskProjectBehavior": "No",
    "requiresHumanApprovalBeforeGovernanceReplacement": "Yes",
    "treatsIntentOsWorkflowAuthorityAsBusinessAuthority": "No"
  },
  "outcome": "NATIVE_MIGRATION_PLAN_RECORDED"
}
```

## Outcome

`NATIVE_MIGRATION_PLAN_RECORDED`
