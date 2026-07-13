# Project Hook Policy: <project-name>

## User Input Summary

Conclusion: <what hook policy is needed>

Recommended choice: <keep read-only / draft policy / review existing policy / stop>

Can AI continue now: <yes / limited / no>

User input class: <NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED>

If nothing is decided: No hooks are installed, no CI is changed, and no blocking gates are added.

## Policy State

| Field | Value |
|---|---|
| Policy state | `POLICY_DRAFT_READY` |
| Can install hooks now? | No |
| Existing hook risk | <none / needs review / high risk> |
| Existing policy ref | <path or none> |

## Existing Hook Sources

| Source | Path / name | Current role | Risk note |
|---|---|---|---|
| CI workflow | <path> | <existing check> | <risk> |
| Package script | <script> | <command> | <risk> |

## Allowed Hook Classes

| Class | Default policy | Allowed automatic behavior | Approval needed |
|---|---|---|---|
| `H0_AUTO_READ_ONLY` | Allowed | Read-only local checks and recommendations | Not required |
| `H1_AUTO_SUGGESTION` | Allowed | Generate plans, prompts, reports, and suggestions | Not required for suggestion |
| `H2_REQUIRES_CONFIRMATION` | Compatibility label | Non-blocking hook installation or project-file change | Controlled apply |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Compatibility label | Blocking, CI-changing, external, release, production, token, or auto-fix hook | Strict review; exact consent for external effects |

## Approval Matrix

| Hook class | Approval owner | Minimum evidence | Default if unclear |
|---|---|---|---|
| `H0_AUTO_READ_ONLY` | Codex may run read-only | Command output or report | Allow read-only only |
| `H1_AUTO_SUGGESTION` | Codex may suggest | Plan or recommendation | Suggest only |
| `H2_REQUIRES_CONFIRMATION` | IntentOS evidence authority | Reviewed plan and rollback path | Defer |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | IntentOS evidence authority plus bounded consent when external | Strict review, rollback path, evidence, expiry | Stop |

## Rollback / Disable Policy

| Hook class | Disable path | Restore command or file | Owner | Evidence needed |
|---|---|---|---|---|
| `H2_REQUIRES_CONFIRMATION` | Remove hook/config through controlled rollback | Restore previous config from git diff or backup | IntentOS execution responsibility | Diff, command output, rollback note |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Disable gate/API/schedule before merge or release | Restore CI/release/secrets config from authority-bound rollback plan | IntentOS execution responsibility | Evidence authority, bounded consent when external, rollback evidence, expiry |

## Forbidden Automatic Actions

- Install Git hooks automatically: No
- Modify CI automatically: No
- Add blocking gates automatically: No
- Call external APIs automatically: No
- Store tokens or secrets automatically: No
- Enable auto-fix automatically: No
- Treat hook output as human approval: No

## Relationship To Hook Orchestration

- Hook Orchestration proposes candidate hooks.
- Project Hook Policy defines what this project allows.
- This policy does not replace Hook Orchestration.
- A Hook Orchestration Plan is still required before any hook installation task.

## Bounded User Input Needed

| Input | Class | Recommended default | Responsibility | Status |
|---|---|---|---|---|
| Prepared H2 action | `NO_USER_ACTION` unless a real-world effect exists | controlled review | IntentOS/Codex | NOT_NEEDED |
| Prepared H3 external effect | `REAL_WORLD_CONSENT_NEEDED` when applicable | stop until exact consent | current conversation user | PENDING / NOT_NEEDED |

## Boundary

- This policy installs hooks: No
- This policy modifies CI: No
- This policy adds blocking gates: No
- This policy calls external APIs: No
- This policy stores tokens or secrets: No
- This policy enables auto-fix: No
- This policy treats hook output as human approval: No
- This policy approves implementation, release, or production: No
- This policy replaces Hook Orchestration: No

## Outcome

`HOOK_POLICY_RECORDED`
