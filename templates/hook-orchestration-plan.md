# Hook Orchestration Plan

## Human Decision Summary

Conclusion: `<what hook / automation situation was found?>`

Recommended choice: `<A. keep read-only / B. generate plan only / C. approve one non-blocking hook / D. approve high-risk hook separately / E. stop>`

Can AI continue now: `<yes / limited / no>`

What I need from you: `<decision needed, or none>`

What happens if you do nothing: `No hooks are installed; no CI is changed; no blocking gates are added.`

## Human Summary

`<plain-language summary of existing hooks, safe automatic checks, and approval-required candidates>`

## Existing Hook / CI Inventory

| Area | Detected | Evidence | Notes |
|---|---|---|---|
| Git hooks | `<Yes / No / Unknown>` | `<path or observation>` | `<notes>` |
| CI workflows | `<Yes / No / Unknown>` | `<path or observation>` | `<notes>` |
| Hook tooling | `<Yes / No / Unknown>` | `<husky / lefthook / pre-commit / lint-staged / none>` | `<notes>` |
| Scheduled jobs | `<Yes / No / Unknown>` | `<path or observation>` | `<notes>` |

## Proposed Hook Candidates

| Hook ID | Trigger | Action | Level | Installation | Blocking behavior | External API | Human approval |
|---|---|---|---|---|---|---|---|
| H-001 | `task-complete` | `run review-loop/work-queue checks` | `H0_AUTO_READ_ONLY` | Not installed | No | No | Not required for read-only run |
| H-002 | `pre-push` | `run project verification` | `H2_REQUIRES_CONFIRMATION` | Proposed only | No | No | Required |
| H-003 | `release-requested` | `run launch readiness gate` | `H3_EXPLICIT_APPROVAL_REQUIRED` | Proposed only | Proposed only | No | Explicit required |

## Auto-Allow Candidates

| Hook ID | Why safe | Allowed action now |
|---|---|---|
| H-001 | Read-only, local, non-blocking | Codex may run the existing checks manually |

## Approval-Required Candidates

| Hook ID | Why approval is required | Required decision |
|---|---|---|
| H-002 | Would install or configure project behavior | Approve / reject / defer |
| H-003 | Would affect release or blocking behavior | Explicit approval / reject / defer |

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
| H-002 | `<remove hook config / revert approved commit>` | human | Must be documented before installation |
| H-003 | `<revert CI/release change>` | human | Must be reviewed separately |

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| `<decision>` | `<options>` | `<recommendation>` | `human` | `<PENDING / NOT_NEEDED / DECIDED>` |

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

`<HOOK_PLAN_RECORDED / NEEDS_HUMAN_DECISION / BLOCKED>`

