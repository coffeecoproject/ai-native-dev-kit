# Goal Card: 1.8 Real Project Read-only Adoption Trial

## Human Summary

Route the real-project read-only finding into a bounded 1.8 implementation without writing to or naming the target project.

## Goal

Goal: add 1.8 Real Project Read-only Adoption Trial and Patch Classification Governance.

Source: Human conversation and sanitized read-only trial result.

Non-goals: do not modify target projects, disclose private target identity, or claim production approval.

## Goal Mode

Selected: IMPLEMENT_TASK

Why: The user asked to execute the reviewed 1.8 upgrade plan in the dev-kit source repository.

## Project State

Project state: source repository

Workflow state: already governed

Adoption mode: not applicable for the source repository

Current `workflow-next` result:

```text
NEXT_ACTION: IMPLEMENT_TASK
CAN_WRITE_WORKFLOW_ASSETS: Yes
MUST_STOP_FOR_HUMAN: No
```

## Risk And Level

Task level: L2

Baseline level: BL1_STANDARD

Risk reason: changes shared workflow assets, checkers, generated project behavior, release wording, and existing-project routing.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

If yes, related decision area:

- structure / module boundary
- DTO / schema / domain boundary
- enum / string / lookup / state-machine
- API contract / generated type
- permission / migration / dependency / cross-module state

Engineering baseline status: Not applicable

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/180-real-project-adoption-trial.md` | user request |
| Preflight | Yes | `preflight/180-real-project-adoption-trial.md` | scope/risk |
| Spec | Yes | `specs/180-real-project-adoption-trial.md` | intended behavior |
| Eval | Yes | `evals/180-real-project-adoption-trial.md` | checks |
| Task | Yes | `tasks/180-real-project-adoption-trial.md` | execution boundary |
| Review Packet | Yes | `review-packets/180-real-project-adoption-trial.md` | L2 review input |
| Review Loop Report | Yes | `review-loop-reports/180-real-project-adoption-trial.md` | L2 review closure |
| Decision Brief | No | Not applicable | no human decision needed for dev-kit repo change |
| Final Report / Handoff | Yes | `final-reports/180-real-project-adoption-trial.md` | closure |

## Allowed Actions

- Read project and workflow files needed to route the goal.
- Create or update only the artifacts listed as required after the selected mode permits writes.
- Run non-destructive local checks referenced by the selected route.
- Update dev-kit source repository documentation, checkers, examples, fixtures, CI, manifest, and release evidence.

## Forbidden Actions

- Do not treat this Goal Card as approval to write to any inspected target project.
- Do not disclose private target names, paths, secrets, or business details.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change target production config, add target dependencies, change target migrations, change target permissions, or modify target architecture without the required human decision.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| None for dev-kit source update | human | not applicable | Not needed |
| Future target-project bridge application | human | before any target write | Deferred |

## Next Safe Step

Next action: complete review loop and run full dev-kit self-checks.

## Technical Details

Related files:

- `tasks/180-real-project-adoption-trial.md`
- `review-packets/180-real-project-adoption-trial.md`
- `review-loop-reports/180-real-project-adoption-trial.md`

Commands run:

```text
node scripts/check-dev-kit.mjs
```

## Audit Notes

- Goal Card is a routing artifact, not target-project execution approval.
- Subagent orchestration is recorded separately.
