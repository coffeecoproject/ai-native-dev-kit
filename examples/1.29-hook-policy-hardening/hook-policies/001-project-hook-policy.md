# Project Hook Policy: Example Web Admin

## Human Decision Summary

Conclusion: The project can allow H0 read-only checks and H1 suggestions, but H2 and H3 hooks require human approval before any installation or CI change.

Recommended choice: draft policy only

Can AI continue now: limited

Need from human: Confirm whether any H2/H3 hook should become a separate reviewed installation task.

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
| `H2_REQUIRES_CONFIRMATION` | Confirmation required | Non-blocking hook installation or project-file change | Human confirmation |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Explicit approval required | Blocking, CI-changing, external, release, production, token, or auto-fix hook | Explicit human approval |

## Approval Matrix

| Hook class | Approval owner | Minimum evidence | Default if unclear |
|---|---|---|---|
| `H0_AUTO_READ_ONLY` | Codex may run read-only | Command output or report | Allow read-only only |
| `H1_AUTO_SUGGESTION` | Codex may suggest | Plan or recommendation | Suggest only |
| `H2_REQUIRES_CONFIRMATION` | Human project owner | Reviewed plan and rollback path | Defer |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Human risk owner | Explicit approval, rollback path, evidence, owner, expiry | Stop |

## Rollback / Disable Policy

| Hook class | Disable path | Restore command or file | Owner | Evidence needed |
|---|---|---|---|---|
| `H2_REQUIRES_CONFIRMATION` | Remove hook/config after approval | Restore previous config from git diff or backup | Human project owner | Diff, command output, rollback note |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Disable gate/API/schedule before merge or release | Restore CI/release/secrets config from approved rollback plan | Human risk owner | Explicit approval, rollback evidence, expiry |

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

## Human Decisions Needed

| Decision | Options | Recommended default | Owner | Status |
|---|---|---|---|---|
| Approve H2 hook installation? | approve / reject / defer | defer | human | PENDING |
| Approve H3 hook behavior? | approve / reject / stop | stop | human risk owner | PENDING |

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
