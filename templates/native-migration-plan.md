# Native Migration Plan

I have switched to IntentOS Native-First Migration Planning mode.

Compatibility note: fields containing `Human Approval`, `Human Decision`, or
`owner` remain machine-readable legacy contracts. They bind the current
request or one exact external-effect authority; they do not ask the ordinary
user to choose migration mechanics, rule precedence, files, or safeguards.
Codex derives the technical recommendation and proves controlled-apply
readiness.

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

## Rule Extraction Coverage

| Source file | Lines scanned | Rules extracted | Unclassified blocks | Skipped blocks | Low-signal blocks | Parser warnings |
| --- | --- | --- | --- | --- | --- | --- |
| `<path>` | `<number>` | `<number>` | `<number>` | `<number>` | `<number>` | `<None or warning>` |

## Extracted Rule Classification

| Rule ID | Source file | Source line range | Context heading | Source location / excerpt | Rule class | Authority | Default handling | Preserve or replace | Reason | Risk surfaces | Target action | Human decision required | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `R-001` | `<path>` | `8-8` | `<heading>` | `<line or excerpt>` | `WORKFLOW_RULE` | `<source>` | replace after approval | replace | `<reason>` | workflow | migrate to IntentOS workflow rule | Yes | HIGH |

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
| Transition condition | exact current-request or external-effect authority bound to the reviewed Native Migration Plan and apply plan |

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
| Missing business meaning, if any | current user | Pending / Not needed |
| Exact external effect, if any | current user or external authority | Pending / Not needed |
| Technical migration recommendation | IntentOS/Codex | Evidence required |

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
  "schema_version": "1.113.0",
  "artifact_type": "native_migration_plan",
  "report_type": "NATIVE_FIRST_EXISTING_PROJECT_MIGRATION",
  "project_state": "<state>",
  "posture": "<posture>",
  "can_codex_write_now": "No",
  "intent_os_workflow_authority": "<ACTIVE_FOR_PLANNING / PENDING_APPROVAL / BLOCKED>",
  "target_file_write_authority": "<NO_WRITE / PLAN_REQUIRED / APPROVAL_REQUIRED>",
  "business_authority": "PROJECT_OWNED",
  "production_authority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requires_human_approval_before_apply": "Yes",
  "project_binding": {
    "canonical_root": "<canonical project root>",
    "topology_digest": "sha256:<64 lowercase hex characters>",
    "identity_kind": "<identity kind>",
    "identity_fingerprint": "<identity fingerprint>"
  },
  "goal_digest": "sha256:<64 lowercase hex characters>",
  "project_fact_digest": "sha256:<64 lowercase hex characters>",
  "guidance_digest": "sha256:<64 lowercase hex characters>",
  "authority_inventory_digest": "sha256:<64 lowercase hex characters>",
  "source_revision": "<current source revision>",
  "authority_source_boundary": {
    "status": "<COMPLETE / REVIEW_REQUIRED>",
    "native_path_count": 0,
    "excluded_path_count": 0,
    "selected_authority_source_count": 0,
    "review_required_authority_source_count": 0,
    "excluded_by_classification": {},
    "exclusions": []
  },
  "authority_source_inventory": [],
  "block_decision_resolution": {
    "state": "NOT_PROVIDED",
    "artifact_ref": "N/A",
    "artifact_digest": "N/A",
    "decisions_declared": 0,
    "decisions_applied": 0,
    "errors": [],
    "applied_decisions": [],
    "boundary": {
      "writes_target_files": "No",
      "authorizes_apply": "No",
      "authorizes_activation": "No",
      "authorizes_release_or_production": "No"
    }
  },
  "rule_extraction_coverage": [
    {
      "source_file": "<path>",
      "lines_scanned": 1,
      "rules_extracted": 1,
      "unclassified_blocks": [],
      "skipped_blocks": [],
      "low_signal_blocks": [],
      "block_ledger": [
        {
          "block_id": "NB-000000000000000000000000-1",
          "block_digest": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
          "block_type": "PARAGRAPH",
          "source_start_line": 1,
          "source_end_line": 1,
          "context_heading": "<heading>",
          "disposition": "EXTRACTED_RULE",
          "rule_count": 1,
          "reason": "<why this block contains the classified rule>"
        }
      ],
      "parser_warnings": []
    }
  ],
  "rule_classifications": [
    {
      "rule_id": "R-001",
      "source_file": "<path>",
      "source_start_line": 1,
      "source_end_line": 1,
      "context_heading": "<heading>",
      "source_excerpt": "<line or excerpt>",
      "rule_class": "WORKFLOW_RULE",
      "authority": "<source>",
      "default_handling": "replace after approval",
      "preserve_or_replace": "replace",
      "reason": "<reason>",
      "risk_surfaces": "workflow",
      "target_action": "migrate to IntentOS workflow rule",
      "human_decision_required": "Yes",
      "confidence": "HIGH"
    }
  ],
  "conflicts": [],
  "proposed_actions": [
    {
      "step": 1,
      "action": "Record Native Migration Plan",
      "exactTargetPath": "native-migration-plans/<id>.md",
      "writesTargetFiles": "No",
      "requiresHumanApproval": "Yes",
      "status": "Proposed"
    }
  ],
  "authority_transition": {
    "oldWorkflowRules": "preserved until the reviewed migration plan is applied",
    "intentOsRules": "future workflow authority after controlled apply",
    "transitionCondition": "the current request, binding, decisions, plan, and apply authority remain valid"
  },
  "human_decisions_needed": [],
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
