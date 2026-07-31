---
schema_version: 1.0
artifact_type: task
number: 241
slug: source-only-markdown-evidence-fence-hardening
title: "source only markdown evidence fence hardening"
status: ready
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/241-source-only-markdown-evidence-fence-hardening.md
eval: evals/241-source-only-markdown-evidence-fence-hardening.md
task_level: L2
---
# Task 241: source only markdown evidence fence hardening

## Task Level

L2

## Related Spec

`specs/241-source-only-markdown-evidence-fence-hardening.md`

## Related Eval

`evals/241-source-only-markdown-evidence-fence-hardening.md`

## Goal

Prevent Markdown fence collisions from corrupting source-only adoption machine evidence while preserving parsed evidence values and all fail-closed gates.

## Scope

Allowed:

- `scripts/lib/artifact-schema.mjs`
- `scripts/lib/native-rule-extraction.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/check-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/check-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-controlled-native-adoption-review.mjs`
- `tests/existing-adoption-activation-hardening.test.mjs`
- Task 241 workflow/review/final evidence only

Not allowed:

- Pawcode target files
- schemas, digests, adoption state logic, CI/hooks, dependencies, release/version files
- unrelated source refactors

## Acceptance Criteria

- All acceptance criteria in Spec 241 pass.
- One shared helper owns fence-safe serialization.
- Sentinel-only governance declarations remain visible in coverage without becoming invalid structured rules.
- Native boundary checks remain strict and read only from the actual Boundaries section.
- Reconciliation claim checks remain strict on report-authored conclusions and ignore only project-native trace payloads.
- Strict checking remains mandatory and existing fail-closed tests pass.
- Real Pawcode read-only adoption no longer fails because of triple-backtick evidence truncation.

## Commands

Run:

```bash
node --check scripts/lib/artifact-schema.mjs
node --check scripts/lib/native-rule-extraction.mjs
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node --check scripts/resolve-existing-rule-reconciliation.mjs
node --check scripts/check-existing-rule-reconciliation.mjs
node --check scripts/resolve-governance-convergence.mjs
node --check scripts/resolve-controlled-native-adoption-review.mjs
node --test tests/existing-adoption-activation-hardening.test.mjs tests/project-entry-adoption-consumer-chain.test.mjs
npm run verify:project-entry
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/241-source-only-markdown-evidence-fence-hardening.md
```

## AI Budget

Max agent runs: 1
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

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- `core/engineering-baseline.md`
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No; follows the existing `scripts/lib/artifact-schema.mjs` evidence utility boundary.

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB2_CHECKED

Allowed paths:

- Paths listed in Scope / Allowed

Forbidden paths:

- Pawcode target, schemas, package dependencies, CI/hooks, release/version files

Allowed change types:

- Shared serialization helper, producer call-site substitution, tests, bounded task evidence

Forbidden change types:

- Schema/digest semantic changes, checker bypass, project adoption apply

Expected diff scale: small

Change-boundary report: to be recorded before closure

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED: existing artifact-schema utility boundary

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
