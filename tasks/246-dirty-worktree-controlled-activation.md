---
schema_version: 1.0
artifact_type: task
number: 246
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/246-dirty-worktree-controlled-activation.md
eval: evals/246-dirty-worktree-controlled-activation.md
task_level: L2
---
# Task 246: dirty worktree controlled activation

## Task Level

L2

## Related Spec

`specs/246-dirty-worktree-controlled-activation.md`

## Related Eval

`evals/246-dirty-worktree-controlled-activation.md`

## Goal

Allow only an exact, conflict-free, zero-overlap dirty controlled update to
count as an installed workflow activation state.

## Scope

Allowed:

- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- Task 246 evidence files

Not allowed:

- Pawcode managed-asset apply
- workflow-next states, authority artifacts, schemas, dependencies, CI/hooks, release, production, and business code
- broad acceptance of `REVIEW_DIRTY_WORKTREE`

## Acceptance Criteria

- Existing ready states remain accepted.
- Dirty acceptance requires controlled update, complete fingerprint, zero conflicts, safe paths, and zero bidirectional overlap.
- All missing/malformed/overlap/wrong-route cases fail closed.
- Focused, project-entry, real-plan, and full source verification pass.

## Commands

Run:

```bash
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```

## AI Budget

Max agent runs: 2
Max repair runs: 2
Use high reasoning model: Yes
Stop if: acceptance criteria, scope, or risk boundary becomes unclear.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, Task Governance must select the stricter technical
planning, review, verification, evidence, and rollback path before code
changes. Ask the user only through a permitted user-input class.

## Risk Gate Exclusions

Use only when a high-risk term appears in the task/spec text but is explicitly out of scope.
If more than three exclusions are proposed, implementation requires stricter
internal review and evidence that explicitly covers every exclusion.

| Mentioned term | Not checked because | Evidence disposition |
|---|---|---|
|  |  | Accepted / Rejected / Unresolved |
| authority / activation | internal project-local execution trust only | Accepted |
| apply / rollback | Pawcode execution excluded; failed v2 receipt proves rollback | Accepted |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md`
- Environment baseline: Not applicable

Baseline decisions introduced:

- No

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- Task 246 evidence files

Forbidden paths:

- Pawcode managed assets
- workflow-next state production, schemas, dependencies, CI/hooks, release, and business code

Allowed change types:

- narrow fail-closed predicate, focused tests, evidence

Forbidden change types:

- state widening without exact plan proof, external effects, unrelated refactor

Expected diff scale: small

Change-boundary report: `change-boundary-reports/125-dirty-worktree-controlled-activation.md`

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED engineering baseline; NOT_APPLICABLE environment baseline

No-code or evidence-required baseline items must not be treated as confirmed implementation authority.

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

## Authorized Next Actions

Codex may do after implementation:

- run verification required by this task
- fix current-task lint, typecheck, or test failures
- fix AUTO_FIX findings inside approved current task scope
- update review-loop-report when review is required
- write ai-task-log or final-report evidence for this task
- create follow-up-proposal for bounded suggestions

Codex must not do without a new request, task, or the applicable exact
authority:

Codex must not implement next-step suggestions unless they are `IN_SCOPE_NEXT_STEP` and inside this task scope.

- implement follow-up suggestions
- add features
- add dependencies
- change architecture
- change permissions
- change data model or migration
- change production config
- change release or rollback behavior
- change payment, value-transfer, or regulated behavior
- implement task non-goals

## Stop Conditions

Stop and report if:

- required spec/eval is missing or contradictory
- scope requires forbidden files
- same test fails twice
- production data/config/secrets are needed
- high-risk decision is required

## Final Report Required

- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action

Next-Step Suggestions must use:

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |
