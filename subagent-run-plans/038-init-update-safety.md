# Subagent Run Plan: Init/Update Safety

## Human Summary

This plan records helper-agent roles for phase `0.38.0`. Helper roles inspect plan-first behavior and safety boundaries; the main thread owns file edits, verification, and closure.

## Goal

Use helper roles to inspect init/update safety, review plan validation, and confirm all roles are closed before commit or handoff.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Reason: The phase changes execution behavior and needs bounded implementation after safety rules are planned.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Implementation route selected | Handoff recorded in `goal-cards/038-init-update-safety.md` |
| A2 | Init/Update Safety Architect | READ_ONLY_DRAFT | CLOSED | none | Plan-first safety rules drafted | Findings reflected in `specs/038-init-update-safety.md` |
| A3 | CLI Writer | WRITER_LIMITED | CLOSED | `scripts/init-project.mjs`, `scripts/cli.mjs`, `scripts/check-dev-kit.mjs`, version metadata, and phase artifacts | Safety checks pass | Evidence recorded in `final-reports/038-init-update-safety.md` |
| A4 | Reviewer | READ_ONLY | CLOSED | none | Safety behavior reviewed against scope | Findings recorded in `review-loop-reports/038-init-update-safety.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/` and `releases/0.38.0/` evidence files | Human-facing report drafted | Output recorded in `final-reports/038-init-update-safety.md` |

## Writer Control

Many readers, one writer: Yes

Single active writer: Yes

Disjoint write ownership used: No

Active writer rule: The main thread owns final file changes and verification; helper-agent outputs are input only.

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure evidence: Each row in Role Roster has a concrete handoff artifact or evidence location.

## Allowed Actions

- Use planning and read-only review roles to inspect plan-first behavior.
- Let the main thread write approved phase files.
- Keep all writes inside phase `0.38.0` scope.

## Forbidden Actions

- Do not leave subagents running.
- Do not leave `RUNNING` agents or subagents after handoff.
- Do not keep standby subagents.
- Do not use multiple active writers.
- Do not let reviewer agents edit files.
- Do not resolve `NEEDS_HUMAN_DECISION` by implementation.
- Do not create persistent monitors.
- Do not create automations.
- Do not call external GPT/API reviewers from this run plan.

## Handoff / Findings

| Finding | Owner | Result |
|---|---|---|
| Direct update needs plan-first blocking for risky targets | Main thread | Enforced through `workflow-next` gate |
| Plans need stale-target protection | Main thread | Enforced through fingerprint validation |
| Overwrites need recoverability | Main thread | Enforced through `--backup-dir` |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Implement plan-first init/update safety | Confirmed for this phase | `tasks/038-init-update-safety.md` |
| Implement migration command later | Deferred | Future `0.42.0` task |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/038-init-update-safety.md`.

## Technical Details

This run plan uses one limited writer role and closes all helper roles before final response, commit, or handoff.

## Audit Notes

- No external GPT/API automation is used.
- No helper role remains open after handoff.
- No persistent monitor or automation is created.
