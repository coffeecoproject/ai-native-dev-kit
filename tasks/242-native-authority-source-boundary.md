---
schema_version: 1.0
artifact_type: task
number: 242
slug: native-authority-source-boundary
title: "native authority source boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/242-native-authority-source-boundary.md
eval: evals/242-native-authority-source-boundary.md
task_level: L2
---
# Task 242: native authority source boundary

## Task Level

L2

## Related Spec

`specs/242-native-authority-source-boundary.md`

## Related Eval

`evals/242-native-authority-source-boundary.md`

## Goal

Make source-only Native Migration scan only real project authority while
preserving deterministic fail-closed rule coverage.

## Scope

Allowed:

- `scripts/lib/project-signals.mjs`
- `scripts/lib/native-rule-extraction.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- focused adoption tests and Task 242 evidence artifacts

Not allowed:

- Pawcode target files
- CI/hooks/release execution, dependencies, schemas, business code
- broad workflow artifact cleanup or historical baseline repair

## Acceptance Criteria

- All acceptance criteria in Spec 242 pass.
- Source boundary decisions are visible and deterministic.
- Customized/drifted files remain project-owned candidates.
- Real Pawcode assurance reaches complete rule coverage without changing its
  worktree.

## Commands

Run:

```bash
node --test tests/existing-adoption-activation-hardening.test.mjs
npm run verify:project-entry
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

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No; follows current source module boundaries and read-only report contracts.

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- `scripts/lib/project-signals.mjs`
- `scripts/lib/native-rule-extraction.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `tests/existing-adoption-activation-hardening.test.mjs`
- Task 242 workflow/review/report artifacts

Forbidden paths:

- `/Users/liushan/Developer/Pawcode/**`
- CI, hooks, dependency manifests, release execution, production config

Allowed change types:

- read-only authority partition, deterministic extraction/reconciliation,
  focused tests and evidence docs

Forbidden change types:

- target writes, destructive operations, dependency or external effects

Expected diff scale: medium

Change-boundary report: required at close-out

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED: existing source engineering baseline and module boundaries
- NOT_APPLICABLE: environment baseline

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
