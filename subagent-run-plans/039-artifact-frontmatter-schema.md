# Subagent Run Plan: Artifact Frontmatter + Schema

## Human Summary

This plan records helper-agent roles for phase `0.39.0`. The main thread owns implementation and verification.

## Goal

Use bounded helper roles to inspect schema boundaries, generator behavior, checker compatibility, and final evidence.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Reason: The phase changes checker behavior and needs a planned compatibility boundary.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Route selected | `goal-cards/039-artifact-frontmatter-schema.md` |
| A2 | Schema Architect | READ_ONLY_DRAFT | CLOSED | none | Metadata fields drafted | `specs/039-artifact-frontmatter-schema.md` |
| A3 | Checker Writer | WRITER_LIMITED | CLOSED | schemas, scripts, manifest, version, phase artifacts | Checks pass | `final-reports/039-artifact-frontmatter-schema.md` |
| A4 | Reviewer | READ_ONLY | CLOSED | none | Findings recorded | `review-loop-reports/039-artifact-frontmatter-schema.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | reports and release evidence | Final report complete | `final-reports/039-artifact-frontmatter-schema.md` |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: No subagent is running after handoff.

## Allowed Actions

- Use read-only planning and review roles.
- Keep all writes inside `0.39.0` scope.
- Run local verification commands.

## Forbidden Actions

- Do not leave subagents running.
- Do not leave `RUNNING` agents or subagents after handoff.
- Do not keep standby subagents.
- Do not create persistent monitors.
- Do not create automations.
- Do not run multiple active writers.
- Do not let reviewer agents edit files.
- Do not resolve `NEEDS_HUMAN_DECISION` by implementation.
- Do not add external GPT/API reviewer calls.

## Handoff / Findings

| Agent ID | Handoff Summary | Findings / Output Ref | Main Thread Decision |
|---|---|---|---|
| A1 | Route selected | Goal card | Proceed |
| A2 | Schema boundary drafted | Spec | Proceed |
| A4 | Review findings recorded | Review loop | Proceed after AUTO_FIX |

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Strict schema default timing | human | future release | Deferred |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/039-artifact-frontmatter-schema.md`.

## Technical Details

Subagent output is input to the main thread, not authority.

## Audit Notes

No persistent monitor or automation is created.
