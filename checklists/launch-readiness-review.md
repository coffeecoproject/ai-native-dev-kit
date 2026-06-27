# Launch Readiness Review Checklist

Use this checklist before a task is called ready.

## Required Checks

- [ ] Scope is clear.
- [ ] Baseline level is recorded.
- [ ] Verification evidence is linked or explained.
- [ ] Review Loop status is recorded when needed.
- [ ] Human decisions are closed or explicitly blocking.
- [ ] Assumptions are visible.
- [ ] Known limitations are visible.
- [ ] Release Boundary states what is not approved.
- [ ] Rollback / Recovery is recorded or marked not applicable.

## Blockers

Mark the work `BLOCKED` when:

- a human decision is pending
- verification is missing for a ready state
- release or production approval is implied but not granted
- payment, tax, privacy, security, compliance, migration, or irreversible operation risk is unresolved
- the report overclaims beyond evidence

## Allowed Recommendations

Codex may recommend:

- `NOT_READY`
- `READY_FOR_DEMO`
- `READY_FOR_INTERNAL_HANDOFF`
- `READY_FOR_RELEASE_REVIEW`
- `BLOCKED`

Codex must not approve production launch.
