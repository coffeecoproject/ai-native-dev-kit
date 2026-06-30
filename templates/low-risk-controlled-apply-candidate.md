# Low-Risk Controlled Apply Candidate

## Human Summary

Describe the proposed change in one or two plain-language sentences.

## Candidate Scope

| Field | Value |
|---|---|
| Candidate type | documentation / local demo / test-only / config-free code |
| Exact target paths | `docs/example.md` |
| Why this is low risk | Small, local, reversible, and does not touch production-sensitive surfaces. |
| Human decision needed | Yes |

## Required Evidence

| Evidence | Status | Notes |
|---|---|---|
| First-slice scope | Present | Link or describe. |
| Verification plan | Present | Link or describe. |
| Rollback path | Present | Link or describe. |

## Allowed Actions

- Ask the human whether this candidate may become a reviewed apply plan.
- Prepare a separate apply plan if the human agrees.

## Forbidden Actions

- Do not write target files from this candidate.
- Do not apply changes automatically.
- Do not change CI or hooks.
- Do not touch payment, secrets, production, migration, data, or permissions.

## Verification And Rollback

Verification:

- Run the smallest relevant local check.

Rollback:

- Revert only the exact target paths listed above.

## Boundaries

- This candidate writes files now: No
- This candidate authorizes apply: No
- This candidate approves implementation: No
- This candidate approves release or production: No
- This candidate changes CI or hooks: No
- This candidate touches payment, secrets, production, migration, data, or permissions: No

## Outcome

`LOW_RISK_APPLY_CANDIDATE_RECORDED`
