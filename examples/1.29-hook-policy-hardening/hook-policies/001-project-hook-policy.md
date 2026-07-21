# Project Hook Policy: Example Web Admin

## User Input Summary

Conclusion: The project can allow H0 read-only checks and H1 suggestions; H2 and H3 remain blocked until controlled review, rollback, and evidence are complete.

Recommended choice: draft policy only

Can AI continue now: yes for read-only analysis and controlled planning

User input class: `NO_USER_ACTION` until an exact prepared external effect requires `REAL_WORLD_CONSENT_NEEDED`.

If nothing is decided: No hooks are installed, no CI is changed, and no blocking gates are added.

## Policy State

| Field | Value |
|---|---|
| Policy state | `POLICY_DRAFT_READY` |
| Can install hooks now? | No |
| Existing hook risk | needs review |
| Existing policy ref | none |

## Existing Hook Sources

| Source | Path / name | Current role | Risk note |
|---|---|---|---|
| CI workflow | `.github/workflows/ci.yml` | existing verification | review before changes |
| Package script | `verify` | local verification | read-only when run manually |

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
| `H3_EXPLICIT_APPROVAL_REQUIRED` | IntentOS evidence authority plus bounded consent when external | Strict review, rollback path, evidence, external-effect identity, expiry | Stop |

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

| Decision | Options | Recommended default | Owner | Status |
|---|---|---|---|---|
| Prepared H2 action | controlled apply / defer / block | controlled review | IntentOS/Codex | NO_USER_ACTION |
| Prepared H3 external effect | consent / decline | stop until exact effect is ready | current conversation user | REAL_WORLD_CONSENT_NEEDED_LATER |

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
