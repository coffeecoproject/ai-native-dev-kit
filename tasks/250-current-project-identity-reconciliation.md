---
schema_version: 1.0
artifact_type: task
number: 250
slug: current-project-identity-reconciliation
title: "current project identity reconciliation"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
spec: specs/250-current-project-identity-reconciliation.md
eval: evals/250-current-project-identity-reconciliation.md
task_level: L2
---
# Task 250: Current Project Identity Reconciliation

## Task Level

L2

## Related Spec

`specs/250-current-project-identity-reconciliation.md`

## Related Eval

`evals/250-current-project-identity-reconciliation.md`

## Goal

Separate durable entry provenance from current project identity so an
established project created through IntentOS is no longer presented as a new
project, and keep project-information status outside the current-task
completion route.

## Scope

Allowed:

- `scripts/lib/project-fact-projection.mjs`
- `scripts/lib/project-entry-trust.mjs`
- `scripts/operating-loop/classification.mjs`
- `scripts/operating-loop/identity.mjs`
- `scripts/operating-loop/source-orchestration.mjs`
- `scripts/resolve-operating-loop.mjs`
- `tests/operating-model.test.mjs`
- `docs/operating-model.md`
- Task 250 workflow evidence

Not allowed:

- Pawcode or any other target-project write
- init/apply/receipt/ownership behavior
- dependencies, hosted CI, release, deployment, production, or external action
- unrelated refactoring or version expansion

## Acceptance Criteria

- Historical origin remains unchanged and visible.
- Fresh scaffold and established project cases are distinguished from current
  evidence, not intent wording.
- Source-only workflow evidence directories are resolved from authoritative
  Manifest data and do not change the project-owned content or Project Fact
  digest; genuine project content still does.
- `PROJECT_INFORMATION` and missing-current-task status do not start the User
  Delivery Console; one identified current task still does.
- The source repository identity projection completes within the existing
  child-process timeout and leaves no associated process behind.
- Pawcode reads as an existing dirty bootstrapped project.
- Dirty worktree protection and all no-write boundaries remain intact.
- Focused tests and one final source self-check pass.

## Commands

Run:

```bash
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --test tests/operating-model.test.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/lib/project-entry-trust.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node --check scripts/operating-loop/source-orchestration.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-manifest.mjs
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/250-current-project-identity-reconciliation.md
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-change-boundary.mjs . --report change-boundary-reports/129-current-project-identity-reconciliation.md
/Users/liushan/.nvm/versions/node/v22.22.3/bin/node scripts/check-intentos.mjs
git diff --cached --check
```

## AI Budget

Max agent runs: 1

Max repair runs: 1

Use high reasoning model: Yes

Stop if: a fresh scaffold regresses, a target write is required, or a new
unrelated failure appears.

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
- [x] performance
- [ ] dependency change

The checked performance item is bounded to removing an unnecessary task
completion source from project-information status. Focused timing changed the
previous source identity case from a 180-second timeout to about 21 seconds;
the same command remains read-only and no external effect is introduced.

## Risk Gate Exclusions

| Mentioned term | Not checked because | Evidence disposition |
|---|---|---|
| target-project write | explicitly forbidden; Pawcode validation is snapshot-proven read-only | Accepted |
| release / production | mentioned only as an excluded authority boundary | Accepted |

## Baseline References

Engineering Baseline touched: Yes

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md`
- Environment baseline: Not applicable

Baseline decisions introduced: No

The implementation adds one current fact to an existing projection and keeps
the public decision and write-authority contracts unchanged.

## Change Boundary

Boundary level: `CB2_CHECKED`

Change-boundary report:
`change-boundary-reports/129-current-project-identity-reconciliation.md`

Allowed change types:

- current fact projection, source-manifest handoff, entry reconciliation,
  additive identity fields, status-scope source selection, focused tests,
  documentation, and bounded evidence

Forbidden change types:

- apply/receipt/ownership behavior, dependencies, hosted CI, release,
  production, target-project mutation, and unrelated refactoring

Expected diff scale: small

## Baseline State

Baseline-state report: Not required

Baseline states used for this task:

- CONFIRMED current read-only Operating Model and Project Fact Projection
- NOT_APPLICABLE external environment or industrial baseline

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by:

Approved at:

Approval notes: The user explicitly authorized this bounded IntentOS repair.
No external effect is included.

## Authorized Next Actions

Codex may run Task 250 checks, close in-scope review findings, update bounded
evidence, and report the result. Codex must not commit, push, release, alter
Pawcode, or begin follow-up work without a separate user instruction.

## Stop Conditions

Stop and report if:

- required spec/eval becomes contradictory;
- the same focused test fails twice;
- a fix requires a forbidden path or target write;
- a new unrelated source or verification failure appears;
- production data, config, secrets, or external consent is needed.

## Final Report Required

- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action
