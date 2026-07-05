# Task 170: First Delivery Walkthrough

## Task Level

L2

## Related Spec

`specs/170-first-delivery-walkthrough.md`

## Related Eval

`evals/170-first-delivery-walkthrough.md`

## Goal

Implement and verify a complete first-delivery walkthrough simulation with subagent orchestration records.

## Scope

Allowed:

- Dev-kit workflow assets.
- Docs, templates, checklist, prompt, checker, examples, fixtures.
- CLI/CI/manifest/self-check integration.
- Release evidence.

Not allowed:

- Business project code.
- Real project production validation claims.
- Release, payment, privacy, security, legal, compliance, migration, or customer approval.
- Automatic GPT/API hook automation.

## Acceptance Criteria

- First Delivery Walkthrough assets exist.
- Booking mini app walkthrough passes the first-delivery checker.
- Bad fixtures fail as expected.
- Manifest, fixture, claim, product, and full intentos checks pass.
- Subagents are closed after handoff.

## Commands

Run:

```bash
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-first-delivery-walkthrough.mjs examples/1.7-first-delivery-walkthrough
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
git diff --check
```

## AI Budget

Max agent runs: 3
Max repair runs: 2
Use high reasoning model: No
Stop if: a change requires real project data, production approval, external API automation, or legal/compliance acceptance.

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

If any item is checked, implementation requires explicit human approval before code changes.

## Risk Gate Exclusions

Use only when a high-risk term appears in the task/spec text but is explicitly out of scope.
If more than three exclusions are accepted, implementation requires Human Approval scope to explicitly cover Risk Gate Exclusions.

| Mentioned term | Not checked because | Human accepted |
|---|---|---|
| production / release / payment | these are claim-control boundaries and forbidden scope, not implemented behavior | Yes |

## Baseline References

Engineering Baseline touched: No

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md` / Not applicable
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No

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

Codex must not do without a new request, task, or human decision:

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
| N1 | DIRECT_FOLLOW_UP | Real project read-only trial | Future evidence | No | new request | human project choice |
