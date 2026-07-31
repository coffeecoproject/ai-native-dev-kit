---
schema_version: 1.0
artifact_type: task
number: 243
slug: source-repository-platform-gate-boundary
title: "source repository platform gate boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/243-source-repository-platform-gate-boundary.md
eval: evals/243-source-repository-platform-gate-boundary.md
task_level: L2
---
# Task 243: source repository platform gate boundary

## Task Level

L2

## Related Spec

`specs/243-source-repository-platform-gate-boundary.md`

## Related Eval

`evals/243-source-repository-platform-gate-boundary.md`

## Goal

Prevent target application platform baselines from self-blocking the
authoritative IntentOS source repository.

## Scope

Allowed:

- workflow-artifact checker, an existing strict source identity helper or one
  minimal helper, candidate-aware source self-check tests, focused tests, Task
  243 evidence

Not allowed:

- platform resolver/profile changes, target files, dependencies, CI/hooks,
  industrial/review/eval gate changes

## Acceptance Criteria

- Spec 243 acceptance criteria pass.
- Task 242 implementation check proceeds past platform baseline.
- Near-miss projects remain gated.
- Task 119 historical batch stays readable and explicit current mode rejects
  stale project authority in a modified source candidate.

## Commands

Run:

```bash
node --test tests/workflow-artifacts.test.mjs
node --test tests/business-universe-consumer-chain.test.mjs
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/243-source-repository-platform-gate-boundary.md
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/242-native-authority-source-boundary.md
node scripts/check-intentos.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 2
Use high reasoning model: No
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

- `core/engineering-baseline.md`
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No; reuses authoritative source identity and existing checker boundaries.

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- `scripts/check-workflow-artifacts.mjs`
- one existing source identity helper if needed
- `tests/business-universe-consumer-chain.test.mjs`
- focused checker tests and Task 243 evidence

Forbidden paths:

- Pawcode, platform resolver/profiles, CI/hooks, dependencies, release files

Allowed change types:

- strict source-only gate routing and candidate-aware tests

Forbidden change types:

- target-project exemptions or unrelated gate changes

Expected diff scale: small

Change-boundary report: required at close-out

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED: authoritative IntentOS source identity
- NOT_APPLICABLE: target application platform baseline for source checkout

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
