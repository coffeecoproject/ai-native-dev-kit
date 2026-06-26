# Subagent Run Plan: Manifest Authoritative Asset Source

## Human Summary

This plan records helper-agent roles for phase `0.37.0`. Helper roles inspect manifest authority and copy-rule boundaries; the main thread owns file edits and verification.

## Goal

Use helper roles to inspect authority boundaries, validate copy rules, and confirm no helper agent remains open after `tasks/037-manifest-authoritative.md`.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Reason: The phase needs bounded implementation after authority and safety boundaries are planned.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Implementation route selected | Handoff recorded in `goal-cards/037-manifest-authoritative.md` |
| A2 | Manifest Architect | READ_ONLY_DRAFT | CLOSED | none | Authority and copy-rule boundaries drafted | Findings reflected in `specs/037-manifest-authoritative.md` |
| A3 | Manifest Writer | WRITER_LIMITED | CLOSED | manifest, schema, scripts, version metadata, and phase artifacts | Manifest and generated-project checks pass | Evidence recorded in `final-reports/037-manifest-authoritative.md` |
| A4 | Reviewer | READ_ONLY | CLOSED | none | Manifest authority reviewed against scope | Findings recorded in `review-loop-reports/037-manifest-authoritative.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/` and `releases/0.37.0/` evidence files | Human-facing report drafted | Output recorded in `final-reports/037-manifest-authoritative.md` |

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

- Use planning and read-only review roles to inspect manifest authority.
- Let the main thread write approved phase files.
- Keep all writes inside phase `0.37.0` scope.
- Run the commands listed in `tasks/037-manifest-authoritative.md`.

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
| Manifest authority must be limited to assets and safe static copies | Main thread | Enforced in manifest copyRules and decision brief |
| Generated projects must receive manifest and loader | Main thread | Enforced by manifest copyRules and self-check smoke |
| Approval-sensitive overwrites must stay in code | Main thread | PR template and AGENTS functions remain unchanged |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Keep approval-sensitive operations outside raw copy rules | Confirmed for this phase | `decision-briefs/037-manifest-authoritative.md` |
| Add init/update plans later | Deferred | Future `0.38.0` task |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/037-manifest-authoritative.md`.

## Technical Details

This run plan uses one limited writer role and closes all helper roles before final response, commit, or handoff.

## Audit Notes

- No external GPT/API automation is used.
- No helper role remains open after handoff.
- No persistent monitor or automation is created.
