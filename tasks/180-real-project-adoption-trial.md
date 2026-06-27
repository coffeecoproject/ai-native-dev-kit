---
schema_version: 1.0
artifact_type: task
number: 180
slug: real-project-adoption-trial
title: Real Project Read-only Adoption Trial
spec: specs/180-real-project-adoption-trial.md
eval: evals/180-real-project-adoption-trial.md
task_level: L2
status: done
created_at: 2026-06-27
---
# Task 180: Real Project Read-only Adoption Trial

## Task Level

L2

## Related Spec

`specs/180-real-project-adoption-trial.md`

## Related Eval

`evals/180-real-project-adoption-trial.md`

## Goal

Implement and verify 1.8 Real Project Read-only Adoption Trial and Patch Classification Governance.

## Scope

Allowed:

- Dev-kit workflow assets.
- Core docs, templates, checklists, prompts, examples, fixtures, and release evidence.
- CLI, CI, manifest, platform adapters, and self-check integration.
- Read-only baseline detection improvements for existing projects.

Not allowed:

- Business project code.
- Writes to inspected real projects.
- Private project names, private paths, secrets, or internal business data.
- Production validation, release approval, security approval, privacy approval, compliance approval, migration approval, payment approval, or customer approval.
- External GPT/API hook automation.

## Acceptance Criteria

- Real adoption trial and patch classification protocols exist.
- Source and example evidence pass the new checkers.
- Bad fixtures fail as expected.
- Existing governed projects are routed to mapping/adapter decisions instead of direct initialization.
- Equivalent non-canonical baseline files can be recognized.
- Manifest, fixture, claim, context, product, workflow, review-loop, next-step, and full dev-kit checks pass.

## Commands

Run:

```bash
node --check scripts/check-real-adoption-trial.mjs
node --check scripts/check-patch-classification.mjs
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly
node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/180-real-project-adoption-trial.md
node scripts/check-review-loop.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-next-step-boundary.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-dev-kit.mjs
git diff --check
```

## AI Budget

Max agent runs: 3
Max repair runs: 2
Use high reasoning model: No
Stop if: a change requires target project writes, private data disclosure, production approval, external API automation, or a human risk decision.

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
| production / release / security / privacy / compliance / migration / payment | these are claim-control and stop-boundary terms, not implemented behavior | Yes |
| real project | this task records sanitized read-only dev-kit evidence only; it does not modify a target project | Yes |

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

- write to a real target project
- publish private target project identity
- initialize or overwrite existing governed project assets
- implement patch classifications
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
- private project data or target project writes are needed
- production approval or risk decision is required

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
| N1 | DIRECT_FOLLOW_UP | run additional private read-only trials on other project types | future evidence | No | new request | human project choice |
