# Subagent Run Plan: Read-only Dev Kit Manifest

## Human Summary

This plan records helper-agent roles for phase `0.35.0`. Helper roles research and review manifest boundaries; the main thread owns all file edits and verification.

## Goal

Use helper roles to inspect the manifest decision, review drift-check design, and verify that the manifest remains read-only for `tasks/035-readonly-manifest.md`.

## Orchestration Mode

Selected: READ_ONLY_RESEARCH

Reason: The main risk is authority drift, so helper roles should inspect and review boundaries rather than write files.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Baseline decision route selected | Handoff recorded in `goal-cards/035-readonly-manifest.md` |
| A2 | Manifest Research | READ_ONLY | CLOSED | none | Existing script lists inspected | Findings reflected in `dev-kit-manifest.json` groups |
| A3 | Schema Reviewer | READ_ONLY | CLOSED | none | Manifest shape reviewed | Rules recorded in `schemas/dev-kit-manifest.schema.json` |
| A4 | Drift Reviewer | READ_ONLY | CLOSED | none | Drift behavior reviewed | Findings recorded in `review-loop-reports/035-readonly-manifest.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/` and `releases/0.35.0/` evidence files | Human-facing report drafted | Output recorded in `final-reports/035-readonly-manifest.md` |

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

- Use read-only helper roles to inspect manifest scope and drift risk.
- Let the main thread write approved phase files.
- Keep all writes inside the task scope.
- Run the commands listed in `tasks/035-readonly-manifest.md`.

## Forbidden Actions

- Do not leave subagents running.
- Do not keep `RUNNING` agents after handoff.
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
| Manifest must remain read-only | Main thread | Enforced in decision brief, manifest policy, and checker |
| Drift checker must fail invalid structure before drift | Main thread | Covered by `check-dev-kit` negative manifest test |
| Existing scripts must keep current behavior | Main thread | No init/update/check runtime behavior changed |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Keep manifest read-only until authority phase | Confirmed for this phase | `decision-briefs/035-readonly-manifest.md` |
| Make manifest authoritative later | Deferred | Future `0.37.0` task |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/035-readonly-manifest.md`.

## Technical Details

This run plan uses read-only helper roles because manifest authority is the main risk. The main thread remains the only writer.

## Audit Notes

- No external GPT/API automation is used.
- No helper role remains open after handoff.
- No persistent monitor or automation is created.
