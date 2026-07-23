# Review Surface Card — Evidence Retention 1.118

## Human Decision Summary

The current batch is repository-local governance. Codex may complete planning and verification, but this card authorizes no commit, push, release, production, CI, hook, external storage, or historical evidence rewrite.

## Plain Summary

Review the new retention rule, its read-only checker, generated-project distribution, failure paths, documentation, and full evidence chain. The independent Controlled Adoption draft remains outside this task.

## Project Reading

| Field | Value |
| --- | --- |
| User mode | `maintainer` |
| Project state | `INTENTOS_REPOSITORY` |
| Existing users assumed | No |
| Can write files now | No |
| Risk level | high |

## Selected Review Surfaces

- `FUNCTIONAL_REVIEW`: policy classification, exact findings, and forward-only cutoff.
- `CODE_REVIEW`: evaluator/CLI separation and bounded Business Universe projection.
- `VERIFICATION_REVIEW`: positive, negative, historical, generated-project, and full-chain replay.
- `DEBT_REVIEW`: evidence growth is governed; operating-loop modularity remains a separate batch.
- `DATA_REVIEW`: no database, customer data, or historical evidence mutation.
- `PERMISSION_REVIEW`: no authorization, role, tenant, or existence-leakage behavior change.
- `UX_REVIEW`: only local CLI diagnostics and exit status are affected.
- `DOCUMENTATION_REVIEW`: policy, budgets, cleanup order, and non-goals stay aligned.
- `RELEASE_IMPACT_REVIEW`: no release, deployment, CI, hook, or production operation.
- `EXISTING_GOVERNANCE_REVIEW`: Manifest, Runtime Trust, Test Evidence, Change Boundary, and Consumer Chain remain authoritative.
- `SECURITY_PRIVACY_REVIEW`: no secrets, external upload, privacy, finance, payment, or compliance surface.

## Review Surface Checklist

Each selected surface requires a post-execution pass, fail, or explicit not-applicable result. Missing evidence blocks completion; no technical surface is delegated to the user.

## Questions For Human

1. None. The user already authorized this bounded governance batch and did not authorize external or destructive effects.

## Post-Execution Review Contract

- Per-surface result: report pass, fail, or not applicable for every selected surface.
- Unverified surfaces: name the reason and owner; do not claim completion.
- Debt result: record fixed, deferred, or separately governed debt.
- Next delivery state: state whether the batch is ready for review or blocked.

## Boundaries

- This card writes target files: No
- This card modifies CI: No
- This card installs hooks: No
- This card deletes or archives documents: No
- This card changes task state: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`REVIEW_SURFACE_RECORDED`
