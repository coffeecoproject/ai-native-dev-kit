# Hook Orchestration Plan

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion: `<what bounded input, if any, is missing?>`

User input class: `NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED`

User input needed now: `<Yes / No>`

Plain-language question or exact consent request, if needed: `<question or none>`

Why project evidence cannot answer it: `<evidence gap or none>`

What happens if you do nothing: `No action occurs.`

## Codex Hook Decision And Evidence

Selected disposition: `KEEP_READ_ONLY / PLAN_ONLY / CONFIGURE_NON_BLOCKING / PREPARE_EXTERNAL_EFFECT / BLOCKED_BY_EVIDENCE`

Can Codex continue now: `<yes / limited / no>`

Inventory and compatibility evidence: `<refs>`

Selected trigger, action, and blocking behavior: `<Codex decision>`

Scope, rollback, and disable path: `<evidence>`

Verification and review route: `<evidence>`

Technical recovery path: `<replan or disable action>`

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

| Hook ID | Trigger | Action | Level | Installation | Blocking behavior | External API | User input class |
|---|---|---|---|---|---|---|---|
| H-001 | `task-complete` | `run review-loop/work-queue checks` | `H0_AUTO_READ_ONLY` | Not installed | No | No | NO_USER_ACTION |
| H-002 | `pre-push` | `run project verification` | `H2_REQUIRES_CONFIRMATION` | Proposed only | No | No | NO_USER_ACTION; Codex resolves configuration evidence |
| H-003 | `release-requested` | `run launch readiness gate` | `H3_EXPLICIT_APPROVAL_REQUIRED` | Proposed only | Proposed only | No | REAL_WORLD_CONSENT_NEEDED only before the prepared release effect |

## Auto-Allow Candidates

| Hook ID | Why safe | Allowed action now |
|---|---|---|
| H-001 | Read-only, local, non-blocking | Codex may run the existing checks manually |

## Approval-Required Candidates

Compatibility section: legacy hook levels remain schema vocabulary; technical configuration is decided by Codex.

| Hook ID | Why automatic execution is disabled | Codex disposition | User input class |
|---|---|---|---|
| H-002 | Would configure project behavior | inspect, plan, verify, then configure or reject | NO_USER_ACTION |
| H-003 | Could trigger an external release effect | prepare exact effect and rollback before execution | REAL_WORLD_CONSENT_NEEDED only for that effect |

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
| H-002 | `<remove hook config / revert controlled commit>` | Codex | Must be documented before installation |
| H-003 | `<revert CI/release change>` | Codex | Must be verified before the prepared effect |

## Human Decisions Needed

Compatibility heading: semantically this is the bounded `User Input Queue`; configuration and recovery are excluded.

| Input class | Missing business fact, exact prepared effect, or external fact | Why project evidence is insufficient | Source | Status |
|---|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  | user / external authority / N/A | PENDING / PROVIDED / CONSENTED / NOT_NEEDED |

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
