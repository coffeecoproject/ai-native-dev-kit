# Goal Card: 1.4.1 To 1.6 Delivery Readiness And Drift

## Human Summary

One-sentence conclusion:

Implement the context polish, Safe Launch readiness, and Conversation Drift Control upgrade batch as one governed release line.

## Goal

Goal: add the 1.4.1, 1.5.0, and 1.6.0 workflow capabilities, verify them, then commit and push.

Source: user requested a complete plan document, execution, review, commit, and push for GPT review.

Non-goals: do not add external GPT/API automation, do not approve production launch, do not change license terms, do not deepen platform industrial packs.

## Goal Mode

Selected: IMPLEMENT_TASK

Allowed values:

```text
DISCUSS_ONLY
ADOPT_PROJECT
DEFINE_WORK
IMPLEMENT_TASK
REVIEW_TASK
REPAIR_TASK
BASELINE_DECISION
HANDOFF_OR_REPORT
```

Why: the user approved implementation after prior discussion and asked for execution plus verification.

## Project State

Project state: source dev-kit repository.

Workflow state: 1.4.0 baseline with Project Memory and Context Governance already present.

Adoption mode: not applicable to source repo.

Current `workflow-next` result:

```text
NEXT_ACTION: implement approved dev-kit upgrade batch
CAN_WRITE_WORKFLOW_ASSETS: Yes
MUST_STOP_FOR_HUMAN: No
```

## Risk And Level

Task level: L2

Baseline level: BL1_STANDARD

Risk reason: the change adds new governance assets, checkers, CLI commands, generated-project assets, fixture coverage, and docs.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: Yes

If yes, related decision area:

- structure / module boundary
- DTO / schema / domain boundary
- enum / string / lookup / state-machine
- API contract / generated type
- permission / migration / dependency / cross-module state

Engineering baseline status: follows existing dev-kit checker, manifest, fixture, and generated-project patterns.

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | No | user thread | request is in conversation |
| Preflight | No | covered by repository read and plan doc | no separate project adoption |
| Spec | Yes | `docs/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md` | upgrade specification |
| Eval | Yes | `releases/1.6.0/self-check-report.md` | final verification evidence |
| Task | Yes | `goal-cards/141-160-delivery-readiness-drift.md` | selected task container |
| Review Packet | No | not required before GPT handoff | user will send repo to GPT after push |
| Review Loop Report | Yes | `review-loop-reports/141-160-delivery-readiness-drift.md` | internal review closure |
| Decision Brief | No | no new strategic decision after user approval | boundary already agreed |
| Final Report / Handoff | Yes | `final-reports/141-160-delivery-readiness-drift.md` | user-facing closure |

## Allowed Actions

- Modify approved dev-kit docs, core rules, templates, prompts, checklists, scripts, examples, fixtures, manifest, CI, README, and version files.
- Run non-destructive local checks.
- Commit and push after verification passes.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement unrelated roadmap items.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture without the required human decision.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Confirm approved upgrade scope | human | file edits | Not needed, user requested execution |

## Next Safe Step

Next action: implement the approved artifacts, run checks, commit, and push.

## Technical Details

Related files:

- `docs/delivery-readiness-and-drift-roadmap-1.4.1-1.6.md`
- `core/safe-launch.md`
- `core/conversation-drift-control.md`
- `scripts/check-launch-readiness.mjs`
- `scripts/check-conversation-drift.mjs`

Commands run:

```text
node --check scripts/check-launch-readiness.mjs
node --check scripts/check-conversation-drift.mjs
```

## Audit Notes

- Goal Card is a routing artifact, not execution approval.
- Subagent orchestration is recorded in `subagent-run-plans/141-160-delivery-readiness-drift.md`.
