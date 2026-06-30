# Controlled Apply Readiness Report: workflow asset update

## Human Decision Summary

Conclusion: `READY_FOR_HUMAN_APPROVED_APPLY`

Recommended choice: Review and explicitly approve the bounded workflow asset update before any apply step.

Can Codex apply now: No

What I need from you: Explicit approval for the referenced low-risk workflow asset update plan.

## Apply Plan Reference

| Field | Value |
|---|---|
| Unified Apply Plan | `apply-plans/001-workflow-assets.md` |
| Plan readable | Yes |
| Plan authorizes apply | No |
| Plan writes files now | No |
| Plan says Codex can write now | No |

## Readiness State

| Field | Value |
|---|---|
| State | `READY_FOR_HUMAN_APPROVED_APPLY` |
| Candidate for human-approved apply | Yes |
| Requires explicit human approval | Yes |
| Can proceed without new approval | No |

## Action Classification

| Action type | Target paths | Classification | Reason |
|---|---|---|---|
| `WORKFLOW_ASSET_UPDATE` | `.ai-native`, `scripts/check-ai-workflow.mjs` | LOW_RISK_CANDIDATE | Workflow assets are bounded and reversible, but still need explicit approval. |

## Preconditions

| Precondition | Status | Evidence |
|---|---|---|
| Apply plan exists | pass | `apply-plans/001-workflow-assets.md` |
| Git state safe | pass | clean worktree recorded before apply |
| Target paths bounded | pass | `.ai-native`, `scripts/check-ai-workflow.mjs` |
| Backup plan exists | pass | backup path listed below |
| Rollback plan exists | pass | rollback step listed below |
| Verification plan exists | pass | verification listed below |
| Human approval recorded | fail | must be explicit before future apply |

## Human-Only / Blocked Items

| Item | Reason | Owner |
|---|---|---|
| Actual apply execution | Requires explicit human approval after readiness review | Human |

## Backup / Rollback Readiness

| Field | Value |
|---|---|
| Backup required | Yes |
| Backup path | `.ai-native/backups/<timestamp>` |
| Rollback step | Restore backed up workflow assets and rerun workflow checks |
| Rollback verification | `node scripts/check-ai-workflow.mjs . --mode core` |

## Verification Readiness

| Field | Value |
|---|---|
| Pre-apply verification | `node scripts/check-ai-workflow.mjs . --mode core` |
| Post-apply verification | `node scripts/check-ai-workflow.mjs . --mode core` |
| Evidence path | `apply-readiness-reports/001-workflow-assets.md` |
| Missing verification | No |

## Boundary

- This readiness report writes files now: No
- This readiness report authorizes apply: No
- This readiness report approves implementation: No
- This readiness report approves release or production: No
- This readiness report installs hooks or changes CI: No
- This readiness report changes source of truth: No
- This readiness report enables high-risk actions: No

## Outcome

`READINESS_RECORDED`
