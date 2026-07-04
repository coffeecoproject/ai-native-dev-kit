# Governance Convergence Report

This report is a derived read-only view. It is not permission to change target project files.

## Human Summary

| Field | Value |
| --- | --- |
| Project State | `DIRTY_WORKTREE_PROJECT` |
| IntentOS Operating Mode | `ACTIVE` |
| Operating Mode Grants Write Permission | `No` |
| Convergence State | `CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE` |
| Can Codex write now | `No` |
| Convergence Authority | `DERIVED_READ_ONLY` |
| Approves Governance Replacement | `No` |
| Approves Release Or Production | `No` |
| Rewrites History | `No` |

## Source Systems

| Source System | Ref | Status | Contribution |
| --- | --- | --- | --- |
| Workflow Next | `generated:workflow-next` | `NEEDS_INPUT` | Dirty worktree must be classified before convergence apply planning. |
| Native Migration | `generated:native-migration` | `NEEDS_INPUT` | Migration stays read-only while worktree is dirty. |
| Existing Rule Reconciliation | `generated:existing-rule-reconciliation` | `NEEDS_INPUT` | Rule comparison can be read-only only. |
| Release Plan | `generated:release-plan` | `RECORDED` | Release remains project-owned. |

## Convergence Dimensions

| Dimension | Current State | Target State | Recommendation | Human Decision Required | Write Requires Apply Plan |
| --- | --- | --- | --- | --- | --- |
| workflow | Dirty worktree present | IntentOS daily workflow | `BLOCKED_NEEDS_OWNER` | `Yes` | `Yes` |
| baseline | Existing baseline cannot be changed now | Best available baseline rule | `BLOCKED_NEEDS_OWNER` | `Yes` | `Yes` |
| audit | Current uncommitted work predates convergence anchor | Convergence anchor then IntentOS artifacts | `MAP_TO_INTENTOS_ARTIFACT` | `Yes` | `Yes` |
| release | Release SOP is project-owned | Project-owned release with IntentOS view | `KEEP_PROJECT_OWNED` | `Yes` | `Yes` |
| ci_hooks | Existing CI guards may exist | Compare before mutation | `KEEP_PROJECT_OWNED` | `Yes` | `Yes` |
| documents | Docs cannot be touched while dirty state is unresolved | Document lifecycle map | `BLOCKED_NEEDS_OWNER` | `Yes` | `Yes` |
| work_queue | Interrupted work may exist | IntentOS Work Queue | `MAP_TO_INTENTOS_ARTIFACT` | `Yes` | `Yes` |
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

Classify current dirty worktree before preparing any Unified Apply Plan.

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
  "schema_version": "1.70.1",
  "artifact_type": "governance_convergence_report",
  "project_state": "DIRTY_WORKTREE_PROJECT",
  "intentos_operating_mode": "ACTIVE",
  "operating_mode_grants_write_permission": "No",
  "can_codex_write_now": "No",
  "convergence_state": "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE",
  "source_systems": {
    "workflow_next": {
      "status": "RECORDED",
      "ref": "generated:workflow-next",
      "contribution": "Current workflow routing."
    },
    "native_migration": {
      "status": "RECORDED",
      "ref": "generated:native-migration",
      "contribution": "Existing rule extraction and authority."
    },
    "existing_rule_reconciliation": {
      "status": "RECORDED",
      "ref": "generated:existing-rule-reconciliation",
      "contribution": "Rule comparison and migration depth."
    },
    "release_plan": {
      "status": "RECORDED",
      "ref": "generated:release-plan",
      "contribution": "Release source system summary."
    }
  },
  "dimensions": [
    { "dimension": "workflow", "current_state": "Dirty worktree present", "target_state": "IntentOS daily workflow", "recommendation": "BLOCKED_NEEDS_OWNER", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "baseline", "current_state": "Existing baseline cannot be changed now", "target_state": "Best available baseline rule", "recommendation": "BLOCKED_NEEDS_OWNER", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "audit", "current_state": "Current uncommitted work predates convergence anchor", "target_state": "Convergence anchor then IntentOS artifacts", "recommendation": "MAP_TO_INTENTOS_ARTIFACT", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "release", "current_state": "Release SOP is project-owned", "target_state": "Project-owned release with IntentOS view", "recommendation": "KEEP_PROJECT_OWNED", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "ci_hooks", "current_state": "Existing CI guards may exist", "target_state": "Compare before mutation", "recommendation": "KEEP_PROJECT_OWNED", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "documents", "current_state": "Docs cannot be touched while dirty state is unresolved", "target_state": "Document lifecycle map", "recommendation": "BLOCKED_NEEDS_OWNER", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "work_queue", "current_state": "Interrupted work may exist", "target_state": "IntentOS Work Queue", "recommendation": "MAP_TO_INTENTOS_ARTIFACT", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "ai_logs", "current_state": "Logging policy unclear", "target_state": "Important governance notes only", "recommendation": "NO_ACTION", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" },
    { "dimension": "risk_authority", "current_state": "Protected decisions project-owned", "target_state": "Preserve protected authority", "recommendation": "KEEP_PROJECT_OWNED", "human_decision_required": "Yes", "write_requires_apply_plan": "Yes" }
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
  "blocked": [
    "dirty worktree"
  ],
  "next_safe_step": "classify current dirty worktree before convergence apply planning",
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
  "outcome": "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE"
}
```

## Outcome

`CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE`
