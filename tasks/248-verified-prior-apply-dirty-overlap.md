---
schema_version: 1.0
artifact_type: task
number: 248
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/248-verified-prior-apply-dirty-overlap.md
eval: evals/248-verified-prior-apply-dirty-overlap.md
task_level: L2
---
# Task 248: verified prior apply dirty overlap

## Task Level

L2

## Related Spec

`specs/248-verified-prior-apply-dirty-overlap.md`

## Related Eval

`evals/248-verified-prior-apply-dirty-overlap.md`

## Goal

Allow only strictly verified prior-transaction file overlap during consecutive dirty controlled updates.

## Scope

Allowed:

- `scripts/init-project/plan.mjs`
- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- Task 248 workflow evidence

Not allowed:

- Pawcode apply or business/product files
- receipt/authority/readiness schemas or workflow states
- dependencies, CI/hooks, release, production, external actions
- general dirty merge or directory overlap tolerance

## Acceptance Criteria

- Canonical plans record a receipt/plan/action/hash-bound proof for the exact current dirty/write intersection, not a reusable allowlist of all prior writes.
- Only exact, fully proved, supported managed update overlaps pass dirty activation.
- All unproved, stale, malformed, directory-level, or non-managed overlaps fail closed.
- Consecutive generated controlled updates succeed while dirty project-owned business content remains byte-for-byte preserved.
- Required focused and full source verification passes.

## Commands

Run:

```bash
node --test --test-name-pattern='dirty-worktree activation requires|dirty generated project preserves business work' tests/execution-distribution-trust.test.mjs tests/project-entry-generated-parity.test.mjs
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 1
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
| apply / receipt | internal local evidence validation only; schemas and authority unchanged | Accepted |
| dirty worktree | exact bounded path classification; no project-content merge | Accepted |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md`
- source repository controlled-apply and full self-check contract
- `docs/environment-baseline.md` reviewed; no environment surface changes in this source-only task

Baseline decisions introduced: No

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- `scripts/init-project/plan.mjs`
- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- Task 248 evidence files

Forbidden paths:

- Pawcode files except the already generated read-only v4 plan
- schemas, dependencies, CI/hooks, release, production, business code

Allowed change types:

- bounded plan evidence, activation guard, tests, governance evidence

Forbidden change types:

- state/schema redesign, broad drift tolerance, unrelated refactor

Expected diff scale: medium

Change-boundary report: `change-boundary-reports/127-verified-prior-apply-dirty-overlap.md`

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED source repository control contract; Environment NOT_APPLICABLE

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
