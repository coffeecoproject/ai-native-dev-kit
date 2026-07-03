# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `EXISTING_GOVERNED_PROJECT` |
| Recommended Posture | `NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW` |
| Can Codex write now | `No` |
| IntentOS Workflow Authority | `ACTIVE_FOR_PLANNING` |
| Target File Write Authority | `PLAN_REQUIRED` |
| Business Authority | `PROJECT_OWNED` |
| Production Authority | `HUMAN_OR_EXTERNAL_SYSTEM` |
| Requires Human Approval Before Apply | `Yes` |
| Recommended Next Step | Review native migration plan, then prepare Unified Apply Plan only if human approves. |

## Existing Governance Inventory

| Area | Source | Handling |
| --- | --- | --- |
| Agent rules | AGENTS.md | classify before migration |
| Governance docs | docs/WEB_ENGINEERING_BASELINE.md | preserve or map |
| Release / rollback | AGENTS.md | preserve and map to release guide/handoff |

## Rule Extraction Coverage

| Source file | Lines scanned | Rules extracted | Unclassified blocks | Parser warnings |
| --- | --- | --- | --- | --- |
| AGENTS.md | 16 | 3 | 1 | AGENTS.md:12-15 fenced bash block needs manual classification |
| docs/WEB_ENGINEERING_BASELINE.md | 5 | 1 | 0 | None |

## Extracted Rule Classification

| Rule ID | Source file | Source line range | Context heading | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | AGENTS.md | 5-5 | Project Agent Rules > Workflow Rules | Codex should follow the old task checklist before editing files. | `WORKFLOW_RULE` | old workflow source | replace after reviewed plan and approval | replace | Old AI workflow guidance can move under IntentOS workflow authority after approval. | workflow | replace with IntentOS workflow rule through apply-plan | Yes | HIGH |
| `R-002` | AGENTS.md | 6-6 | Project Agent Rules > Workflow Rules | Contract approval limits are business rules and must remain project-owned. | `BUSINESS_FACT` | project owner | preserve or escalate | preserve | Business facts are project-owned and cannot be replaced by workflow migration. | business, data | preserve as project constraint | Yes | HIGH |
| `R-003` | AGENTS.md | 10-10 | Project Agent Rules > Release Rules | Production release requires rollback evidence from the release owner. | `PRODUCTION_CONTROL` | project/release owner | preserve and escalate | preserve | Release and production controls remain external to IntentOS workflow convenience. | release, production | map to Release Guide / Recipe / Handoff without replacement | Yes | HIGH |
| `R-004` | docs/WEB_ENGINEERING_BASELINE.md | 5-5 | Web Engineering Baseline > Data Modeling | Domain status values must use enums, not free strings. | `ENGINEERING_BASELINE` | project baseline | migrate into IntentOS baseline after review | map | Engineering rules can become baseline evidence after review. | engineering | map to engineering/environment baseline | Yes | HIGH |

## Conflicts And Decisions

| Conflict ID | Conflict Type | Existing Source | IntentOS Target | Default Decision | Human Decision Required |
| --- | --- | --- | --- | --- | --- |
| `C-001` | `WORKFLOW_CONFLICT` | AGENTS.md | IntentOS workflow authority | IntentOS after reviewed plan and approval | Yes |
| `C-002` | `PRODUCTION_CONFLICT` | AGENTS.md | Release Guide / Recipe / Handoff mapping | Preserve SOP and map only | Yes |

## Proposed Native Migration Plan

| Step | Action | Exact Target Path | Writes Target Files? | Requires Human Approval | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Record Native Migration Plan | `native-migration-plans/001-mixed-agent-rules.md` | No | Yes | Proposed |
| 2 | Prepare Unified Apply Plan for approved governance assets only | `apply-plans/001-native-governance.md` | No | Yes | Proposed |
| 3 | Record Controlled Apply Readiness before any apply | `apply-readiness-reports/001-native-governance.md` | No | Yes | Proposed |
| 4 | Record human Approval Record for exact governance action IDs | `approval-records/001-native-governance.md` | No | Yes | Proposed |
| 5 | Plan IntentOS-native AGENTS.md replacement after classification | `AGENTS.md` | No | Yes | Proposed |

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
| Backup path | `.ai-native/backups/native-migration/mixed-agent-rules/` |
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
  "schema_version": "1.63.0",
  "artifact_type": "native_migration_plan",
  "report_type": "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
  "project_state": "EXISTING_GOVERNED_PROJECT",
  "posture": "NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW",
  "can_codex_write_now": "No",
  "intent_os_workflow_authority": "ACTIVE_FOR_PLANNING",
  "target_file_write_authority": "PLAN_REQUIRED",
  "business_authority": "PROJECT_OWNED",
  "production_authority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requires_human_approval_before_apply": "Yes",
  "rule_extraction_coverage": [
    {
      "source_file": "AGENTS.md",
      "lines_scanned": 16,
      "rules_extracted": 3,
      "unclassified_blocks": [
        {
          "source_file": "AGENTS.md",
          "source_start_line": 12,
          "source_end_line": 15,
          "context_heading": "Project Agent Rules > Release Rules",
          "excerpt": "pnpm gate:quality pnpm release:preview",
          "reason": "Fenced code block may contain commands or rules; classify manually before migration."
        }
      ],
      "parser_warnings": ["AGENTS.md:12-15 fenced bash block needs manual classification"]
    },
    {
      "source_file": "docs/WEB_ENGINEERING_BASELINE.md",
      "lines_scanned": 5,
      "rules_extracted": 1,
      "unclassified_blocks": [],
      "parser_warnings": []
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
      "source_start_line": 6,
      "source_end_line": 6,
      "context_heading": "Project Agent Rules > Workflow Rules",
      "source_excerpt": "Contract approval limits are business rules and must remain project-owned.",
      "rule_class": "BUSINESS_FACT",
      "authority": "project owner",
      "default_handling": "preserve or escalate",
      "preserve_or_replace": "preserve",
      "reason": "Business facts are project-owned and cannot be replaced by workflow migration.",
      "risk_surfaces": "business, data",
      "target_action": "preserve as project constraint",
      "human_decision_required": "Yes",
      "confidence": "HIGH"
    },
    {
      "rule_id": "R-003",
      "source_file": "AGENTS.md",
      "source_start_line": 10,
      "source_end_line": 10,
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
      "rule_id": "R-004",
      "source_file": "docs/WEB_ENGINEERING_BASELINE.md",
      "source_start_line": 5,
      "source_end_line": 5,
      "context_heading": "Web Engineering Baseline > Data Modeling",
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
  "conflicts": [],
  "proposed_actions": [
    {
      "step": 1,
      "action": "Record Native Migration Plan",
      "exactTargetPath": "native-migration-plans/001-mixed-agent-rules.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
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
