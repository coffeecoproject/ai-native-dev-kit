# Task <number>: <task-name>

## Task Level

L0 / L1 / L2 / L3

## Related Spec

`specs/<file>.md`

## Related Eval

`evals/<file>.md`

## Goal

Implement one narrow change:

## Scope

Allowed:

- 

Not allowed:

- 

## Acceptance Criteria

- 

## Commands

Run:

```bash
scripts/verify.sh
```

## AI Budget

Max agent runs:
Max repair runs:
Use high reasoning model:
Stop if:

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

Engineering Baseline touched: Yes / No

Environment Baseline touched: Yes / No

Baseline refs:

- `docs/engineering-baseline.md` / Not applicable
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No / <decision brief or current-request authority ref>

Baseline rules:

- If this task touches structure, API contracts, DTO/schema/domain boundaries, database schema, migrations, permissions, dependencies, generated types, enum/lookup/state-machine choices, or cross-module state, set Engineering Baseline touched to Yes and cite `docs/engineering-baseline.md`.
- If this task touches build commands, CI/CD, environment variables, deployment, production config, release process, rollback, secrets, logs, monitoring, or alerts, set Environment Baseline touched to Yes and cite `docs/environment-baseline.md`.
- If the relevant baseline is missing or pending, Codex derives and reviews the
  evidence-backed baseline before implementation. Ask only for a permitted
  business/external fact or exact real-world consent.

## Change Boundary

Boundary level: CB0_ADVISORY / CB1_RECORDED / CB2_CHECKED / CB3_HUMAN_APPROVED

Allowed paths:

- <path or N/A>

Forbidden paths:

- <path or N/A>

Allowed change types:

- <type or N/A>

Forbidden change types:

- <type or N/A>

Expected diff scale: tiny / small / medium / large

Change-boundary report: Not required / `change-boundary-reports/<file>.md`

## Baseline State

Baseline-state report: Not required / `baseline-state-reports/<file>.md`

Baseline states used for this task:

- PROPOSED / PENDING_CONFIRMATION / EVIDENCE_REQUIRED / CONFIRMED / NOT_APPLICABLE / SUPERSEDED

No-code or evidence-required baseline items must not be treated as confirmed implementation authority.

## Human Approval

Compatibility section: these fields bind exact authority when an external
effect or legacy schema requires it. They are not a user-facing technical
approval step for ordinary reversible project-local work.

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
