---
schema_version: 1.0
artifact_type: task
number: 244
slug: bootstrap-receipt-managed-ownership-recovery
title: "bootstrap receipt managed ownership recovery"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/244-bootstrap-receipt-managed-ownership-recovery.md
eval: evals/244-bootstrap-receipt-managed-ownership-recovery.md
task_level: L2
---
# Task 244: bootstrap receipt managed ownership recovery

## Task Level

L2

## Related Spec

`specs/244-bootstrap-receipt-managed-ownership-recovery.md`

## Related Eval

`evals/244-bootstrap-receipt-managed-ownership-recovery.md`

## Goal

Recover exact per-file managed ownership from verified bootstrap receipt
evidence when a legacy version record omitted the digest, without weakening
project-owned file protection.

## Scope

Allowed:

- `scripts/init-project/plan.mjs`
- one focused existing test file under `tests/`
- Task 244 workflow, review, log, boundary, and final evidence

Not allowed:

- Pawcode target writes
- receipt/schema/project-entry/apply authority redesign
- CI/hooks, dependencies, release, business code, migration, or production config
- directory-wide, source-similarity, filename, or Git-history ownership inference

## Acceptance Criteria

- Validated receipt fallback requires an exact digest-bound bootstrap plan,
  exactly one matching create/applied action pair, canonical current hash
  match, and project-bound verified bootstrap receipt.
- Invalid or mismatched evidence remains `UNPROVEN_PROJECT_OWNED`.
- Existing unproven locally edited asset test remains passing.
- Real Pawcode dry-run shows zero ownership conflicts and zero dirty write overlap.
- Required focused and full verification passes.

## Commands

Run:

```bash
node --test tests/project-entry-new-project-transaction.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/244-bootstrap-receipt-managed-ownership-recovery.md
node scripts/check-review-loop.mjs . --task tasks/244-bootstrap-receipt-managed-ownership-recovery.md
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
|  |  | Accepted / Rejected / Unresolved |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md`
- Environment baseline: Not applicable

Baseline decisions introduced:

- No; preserve current module/test patterns and existing bootstrap validator.

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
- `tests/project-entry-new-project-transaction.test.mjs`
- Task 244 evidence files

Forbidden paths:

- `/Users/liushan/Developer/Pawcode/**`
- bootstrap receipt/schema and apply execution modules
- package/dependency, CI/hook, release, production, and business-code files

Allowed change types:

- bounded ownership classification, focused tests, governance evidence

Forbidden change types:

- target writes, broad refactor, dependency or authority expansion

Expected diff scale: small

Change-boundary report: `change-boundary-reports/123-bootstrap-receipt-managed-ownership-recovery.md`

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- Engineering baseline: CONFIRMED
- Environment/data/release baselines: NOT_APPLICABLE

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
