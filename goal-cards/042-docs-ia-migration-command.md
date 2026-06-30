---
schema_version: 1.0
artifact_type: goal-card
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
devkit_version: 0.41.0
goal_mode: IMPLEMENT_TASK
task_level: L3
---
# Goal Card: 042-docs-ia-migration-command

## Human Summary

One-sentence conclusion:

0.42.0 is an implementation task for docs information architecture and a non-mutating migration plan command.

## Goal

Goal: implement Docs IA + Migration Command.

Source: Productization Hardcut roadmap and user instruction to continue.

Non-goals: Do not implement migration apply, mutate target projects, or add new workflow concepts.

## Goal Mode

Selected: IMPLEMENT_TASK

Why: The roadmap phase is already defined and prior phases are complete.

## Project State

Project state:

Dev-kit source repository, clean and synced before starting 0.42.0.

Workflow state:

0.41.0 complete and pushed.

Adoption mode:

Dev-kit productization, not target-project adoption.

Current `workflow-next` result:

```text
NEXT_ACTION: execute roadmap phase 0.42.0
CAN_WRITE_WORKFLOW_ASSETS: yes
MUST_STOP_FOR_HUMAN: no, within approved plan-only migration scope
```

## Risk And Level

Task level: L3

Baseline level: not selected for this dev-kit repository task

Risk reason:

Migration commands can become dangerous if they write target project files. This phase is safe only
because it is dry-run/write-plan only.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: Yes

If yes, related decision area:

- structure / module boundary
- API contract / generated type
- permission / migration / dependency / cross-module state

Engineering baseline status: bounded CLI/docs productization change

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/042-docs-ia-migration-command.md` | capture roadmap request |
| Preflight | Yes | `preflight/042-docs-ia-migration-command.md` | confirm safety boundary |
| Spec | Yes | `specs/042-docs-ia-migration-command.md` | define docs and migrate contract |
| Eval | Yes | `evals/042-docs-ia-migration-command.md` | define checks |
| Task | Yes | `tasks/042-docs-ia-migration-command.md` | implementation scope |
| Review Packet | Yes | `review-packets/042-docs-ia-migration-command.md` | L3 review input |
| Review Loop Report | Yes | `review-loop-reports/042-docs-ia-migration-command.md` | review closure |
| Decision Brief | No | not required | no new policy decision beyond task approval |
| Final Report / Handoff | Yes | `final-reports/042-docs-ia-migration-command.md` | durable result |

## Allowed Actions

- Read project and workflow files needed to route the goal.
- Create or update only the artifacts listed as required after the selected mode permits writes.
- Run non-destructive local checks referenced by the selected route.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement migration apply.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture without the required human decision.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Approve plan-only migrate implementation scope | human | implementation | Approved |
| Approve future migrate apply behavior | human | future phase | Pending |

## Next Safe Step

Next action: implement docs IA and migration plan command, then run full self-check.

## Technical Details

Related files:

- `docs/plans/productization-hardcut-1.0-plan.md`
- `scripts/cli.mjs`
- `scripts/check-dev-kit.mjs`

Commands run:

```text
git status -sb
sed -n '775,860p' docs/plans/productization-hardcut-1.0-plan.md
sed -n '1,260p' scripts/cli.mjs
```

## Audit Notes

- Goal Card is a routing artifact, not execution approval for migration apply.
- Subagent orchestration is tracked separately.
