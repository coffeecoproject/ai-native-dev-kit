---
schema_version: 1.0
artifact_type: task
number: 247
slug: current-managed-identity-boundary
title: "current managed identity boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/247-current-managed-identity-boundary.md
eval: evals/247-current-managed-identity-boundary.md
task_level: L2
---
# Task 247: current managed identity boundary

## Task Level

L2

## Related Spec

`specs/247-current-managed-identity-boundary.md`

## Related Eval

`evals/247-current-managed-identity-boundary.md`

## Goal

Make Project Entry validate the current managed identity without retaining retired historical assets as permanent blockers.

## Scope

Allowed:

- `scripts/lib/project-entry-trust.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- Task 247 evidence files

Not allowed:

- Pawcode writes during Task 247 source repair
- workflow states, apply/receipt schema or authority, dependencies, CI/hooks, release, production, and business code
- weakening evidence or hash checks for current `workflowAssets`

## Acceptance Criteria

- Current identity roots come from current `workflowAssets` plus required identity files.
- Retired `scripts/verify.sh` remains preserved and does not conflict.
- Current managed-asset tamper still blocks trust.
- Focused, project-entry, manifest, and full source verification pass.

## Commands

Run:

```bash
node --test --test-name-pattern='generated project remains trusted' tests/project-entry-generated-parity.test.mjs
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
| identity / trust | internal project-local evidence validation only | Accepted |
| apply / receipt | execution mechanics unchanged; only evidence consumption scope changes | Accepted |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- Source repository Project Entry and full self-check contract
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

- `scripts/lib/project-entry-trust.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- Task 247 evidence files

Forbidden paths:

- Pawcode, workflow states, schemas, authority mechanics, dependencies, CI/hooks, release, production, and business code

Allowed change types:

- narrow current-asset identity boundary, regression tests, evidence

Forbidden change types:

- broad trust relaxation, apply redesign, unrelated refactor

Expected diff scale: small

Change-boundary report: `change-boundary-reports/126-current-managed-identity-boundary.md`

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED source repository self-check contract; NOT_APPLICABLE environment baseline

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
| N1 | IN_SCOPE_NEXT_STEP | run verification and create a local source commit | completes Task 247 | Yes | current task | reversible local commit |
