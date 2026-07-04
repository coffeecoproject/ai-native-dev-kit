# Governance Convergence Report

This report is a derived read-only view. It is not permission to change target
project files.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `EXISTING_GOVERNED_PROJECT` |
| IntentOS Operating Mode | `ACTIVE` |
| Operating Mode Grants Write Permission | `No` |
| Convergence State | `CONVERGENCE_PARTIAL` |
| Can Codex write now | `No` |
| Convergence Authority | `DERIVED_READ_ONLY` |
| Approves Governance Replacement | `No` |
| Approves Release Or Production | `No` |
| Rewrites History | `No` |

## Source Systems

| Source System | Ref | Status | Contribution |
| --- | --- | --- | --- |
| Workflow Next | `generated:workflow-next` | `RECORDED` | Current workflow routing. |
| Native Migration | `generated:native-migration` | `RECORDED` | Existing rule extraction and authority. |
| Existing Rule Reconciliation | `generated:existing-rule-reconciliation` | `RECORDED` | Rule comparison and migration depth. |
| Release Plan | `generated:release-plan` | `RECORDED` | Release source system summary. |

## Convergence Dimensions

| Dimension | Current State | Target State | Recommendation | Human Decision Required | Write Requires Apply Plan |
| --- | --- | --- | --- | --- | --- |
| workflow | Existing workflow present | IntentOS daily workflow | `MERGE_AFTER_REVIEW` | `Yes` | `Yes` |
| baseline | Existing baseline present | Best available baseline rule | `KEEP_EXISTING_STRICTER` | `Yes` | `Yes` |
| audit | Historical evidence predates IntentOS | Convergence anchor then IntentOS artifacts | `MAP_TO_INTENTOS_ARTIFACT` | `Yes` | `Yes` |
| release | Release SOP is project-owned | Project-owned release with IntentOS view | `KEEP_PROJECT_OWNED` | `Yes` | `Yes` |
| ci_hooks | Existing guards present | Compare before mutation | `KEEP_PROJECT_OWNED` | `Yes` | `Yes` |
| documents | Docs need source-of-truth mapping | Document lifecycle map | `MERGE_AFTER_REVIEW` | `Yes` | `Yes` |
| work_queue | Old TODOs / interrupted work may exist | IntentOS Work Queue | `MAP_TO_INTENTOS_ARTIFACT` | `Yes` | `Yes` |
| ai_logs | Logging policy unclear | Important governance notes only | `NO_ACTION` | `Yes` | `Yes` |
| risk_authority | Protected decisions project-owned | Preserve protected authority | `KEEP_PROJECT_OWNED` | `Yes` | `Yes` |

## Audit Bridge

| Field | Value |
| --- | --- |
| Historical Evidence Status | `preserve` |
| Convergence Anchor Required | `Yes` |
| Post-Adoption Evidence Model | `IntentOS artifacts` |
| Rewrite History | `No` |

## AI Log Policy

| Field | Value |
| --- | --- |
| Write AI Logs By Default | `No` |
| Allowed For Governance Decisions | `Yes` |
| Routine Task Logging | `No` |
| Routine Command Logging | `No` |

## Protected Authority

| Surface | Owner | Handling |
| --- | --- | --- |
| release / production | `HUMAN_OR_EXTERNAL_SYSTEM` | Keep project-owned SOP and release owner. |
| CI / hooks | `PROJECT_OWNED` | Compare and plan before mutation. |
| data / permission / compliance | `PROJECT_OWNED` | Block until owner confirms. |

## Proposed Next Step

Review this convergence report. If accepted, prepare a Unified Apply Plan for
bounded workflow or documentation asset changes, then require Approval Record
and Controlled Apply Readiness before any target-project write.

## Boundaries

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves governance replacement: No
- This report approves implementation: No
- This report approves release or production: No
- This report modifies CI or hooks: No
- This report rewrites history: No
- This report turns ai-logs into routine command logs: No
- This report maximizes migration: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.70.0",
  "artifact_type": "governance_convergence_report",
  "project_state": "EXISTING_GOVERNED_PROJECT",
  "intentos_operating_mode": "ACTIVE",
  "operating_mode_grants_write_permission": "No",
  "can_codex_write_now": "No",
  "convergence_state": "CONVERGENCE_PARTIAL",
  "source_systems": {
    "workflow_next": "generated:workflow-next",
    "native_migration": "generated:native-migration",
    "existing_rule_reconciliation": "generated:existing-rule-reconciliation",
    "release_plan": "generated:release-plan"
  },
  "dimensions": [
    {
      "dimension": "workflow",
      "current_state": "Existing workflow present",
      "target_state": "IntentOS daily workflow",
      "recommendation": "MERGE_AFTER_REVIEW",
      "human_decision_required": "Yes",
      "write_requires_apply_plan": "Yes"
    }
  ],
  "audit_bridge": {
    "historical_evidence_status": "preserve",
    "convergence_anchor_required": "Yes",
    "post_adoption_evidence_model": "IntentOS artifacts",
    "rewrite_history": "No"
  },
  "ai_log_policy": {
    "write_ai_logs_by_default": "No",
    "allowed_for_governance_decisions": "Yes",
    "routine_task_logging": "No",
    "routine_command_logging": "No"
  },
  "blocked": [],
  "next_safe_step": "review convergence report before Unified Apply Plan",
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_governance_replacement": "No",
    "approves_release_or_production": "No",
    "modifies_ci_or_hooks": "No",
    "rewrites_history": "No",
    "routine_ai_log_spam": "No",
    "maximizes_migration": "No"
  },
  "outcome": "CONVERGENCE_PARTIAL"
}
```

## Outcome

`CONVERGENCE_PARTIAL`
