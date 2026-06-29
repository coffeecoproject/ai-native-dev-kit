# Hook Orchestration Plan

## Human Decision Summary

Conclusion: The project can use read-only task-complete checks now, but hook installation and release gates need approval.

Recommended choice: B. generate plan only

Can AI continue now: limited

What I need from you: Confirm whether any H2/H3 hook should become a separate installation task.

What happens if you do nothing: No hooks are installed; no CI is changed; no blocking gates are added.

## Human Summary

Codex may run existing checks manually after task completion. Pre-push hooks and release gates are only proposals and require human approval before installation.

## Existing Hook / CI Inventory

| Area | Detected | Evidence | Notes |
|---|---|---|---|
| Git hooks | No | none detected | no local hook installed |
| CI workflows | Yes | .github/workflows/ai-workflow-checks.yml | keep existing workflow |
| Hook tooling | No | none detected | no Husky/Lefthook/pre-commit config |
| Scheduled jobs | No | none detected | no schedule proposed |

## Proposed Hook Candidates

| Hook ID | Trigger | Action | Level | Installation | Blocking behavior | External API | Human approval |
|---|---|---|---|---|---|---|---|
| H-001 | `task-complete` | `run review-loop/work-queue/change-boundary checks` | `H0_AUTO_READ_ONLY` | Not installed | No | No | Not required for read-only run |
| H-002 | `task-complete` | `generate hook recommendation for next task` | `H1_AUTO_SUGGESTION` | Not installed | No | No | Not required for suggestion |
| H-003 | `pre-push` | `run npm run verify` | `H2_REQUIRES_CONFIRMATION` | Proposed only | No | No | Required |
| H-004 | `release-requested` | `run launch readiness gate` | `H3_EXPLICIT_APPROVAL_REQUIRED` | Proposed only | Proposed only | No | Explicit required |

## Auto-Allow Candidates

| Hook ID | Why safe | Allowed action now |
|---|---|---|
| H-001 | Read-only, local, non-blocking | Codex may run existing checks manually |
| H-002 | Suggestion-only | Codex may write a plan or recommendation |

## Approval-Required Candidates

| Hook ID | Why approval is required | Required decision |
|---|---|---|
| H-003 | Would install project behavior before push | Approve / reject / defer |
| H-004 | Would affect release or blocking behavior | Explicit approval / reject / defer |

## Forbidden Automatic Actions

- Install Git hooks automatically: No
- Modify CI automatically: No
- Add blocking gates automatically: No
- Call external APIs automatically: No
- Store tokens or secrets automatically: No
- Enable auto-fix automatically: No
- Treat hook output as human approval: No

## Rollback / Disable Plan

| Candidate | Disable path | Owner | Notes |
|---|---|---|---|
| H-003 | Remove approved hook config or revert the approved commit | human | Must be reviewed before installation |
| H-004 | Revert the approved CI/release change | human | Must be reviewed separately |

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Install pre-push hook | approve / reject / defer | defer | human | PENDING |
| Add release gate | approve / reject / defer | defer | human | PENDING |

## Boundary

- This plan installs hooks: No
- This plan modifies CI: No
- This plan adds blocking gates: No
- This plan calls external APIs: No
- This plan changes target-project files: No
- This plan enables auto-fix: No
- This plan approves implementation, release, or production: No
- This plan treats hook output as human approval: No

## Outcome

`NEEDS_HUMAN_DECISION`

