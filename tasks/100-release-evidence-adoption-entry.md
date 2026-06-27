---
schema_version: 1.0
artifact_type: task
number: 100
slug: release-evidence-adoption-entry
title: "release evidence adoption entry"
status: ready
created_at: 2026-06-27
devkit_version: 0.42.0
spec: specs/100-release-evidence-adoption-entry.md
eval: evals/100-release-evidence-adoption-entry.md
task_level: L3
---
# Task 100: release evidence adoption entry

## Task Level

L3

## Related Spec

`specs/100-release-evidence-adoption-entry.md`

## Related Eval

`evals/100-release-evidence-adoption-entry.md`

## Goal

Complete Productization Hardcut `1.0.0` release evidence and adoption entry criteria.

## Scope

Allowed:

- add `releases/1.0.0/` evidence files
- add adoption/productization trial templates
- update version metadata to `1.0.0`
- update manifest and self-check
- add 100 workflow artifacts and reports

Not allowed:

- package publishing
- migration apply
- external automation
- industrial pack promotion
- license term change
- production config change

## Acceptance Criteria

- All required 1.0 release files exist.
- Self-check validates release evidence.
- 1.0 minimum release boundary is explicit.
- 10/10 evidence gap is explicit.
- Required 1.0 smoke commands are recorded.

## Commands

Run:

```bash
node --check scripts/check-dev-kit.mjs
node scripts/check-manifest.mjs .
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-1-test
node /tmp/ai-native-1-test/scripts/check-ai-workflow.mjs /tmp/ai-native-1-test --mode core
node scripts/cli.mjs update --target /tmp/ai-native-1-test --dry-run
node scripts/cli.mjs migrate --target /tmp/ai-native-1-test --from 0.33.0 --to 1.0.0 --dry-run
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/100-release-evidence-adoption-entry.md
node scripts/check-review-loop.mjs . --task tasks/100-release-evidence-adoption-entry.md
node scripts/check-next-step-boundary.mjs . --task tasks/100-release-evidence-adoption-entry.md
node scripts/check-goal-mode.mjs .
node scripts/check-subagent-orchestration.mjs .
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 2
Use high reasoning model: Yes
Stop if: release evidence requires migration apply, package publishing, industrial pack promotion, or 10/10 evidence claim.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [x] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [x] production config
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
| migration | Matrix and smoke only; migrate remains plan-only. | Yes |
| production config | Known limitations and adapter criteria only; no production config changes. | Yes |

## Human Approval

Required: Yes
Status: Approved
Approval scope: Complete 1.0 minimum release evidence while explicitly not claiming 10/10 real-project validation.
Approved by: user
Approved at: 2026-06-27
Approval notes: User asked to continue from the roadmap after 0.42.0.

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

- implement migration apply
- publish package
- promote industrial packs
- change license terms
- start real target-project adoption
- change production config
- implement task non-goals

## Stop Conditions

Stop and report if:

- release evidence cannot avoid overclaiming
- final self-check fails twice on the same issue
- migration apply becomes necessary
- industrial pack promotion is required
- package publishing is required

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
