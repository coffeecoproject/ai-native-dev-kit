---
schema_version: 1.0
artifact_type: subagent-run-plan
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
devkit_version: 0.41.0
subagent_mode: PLAN_THEN_BUILD
---
# Subagent Run Plan: 042-docs-ia-migration-command

## Human Summary

One-sentence conclusion:

0.42.0 can be executed by the main thread; helper roles are documented and skipped to keep one writer.

## Goal

Goal: docs IA and non-mutating migration plan command.

Related task: `tasks/042-docs-ia-migration-command.md`

Related spec: `specs/042-docs-ia-migration-command.md`

Related eval: `evals/042-docs-ia-migration-command.md`

Non-goals: Do not use helper agents as approval, release authority, risk acceptance, or hidden background execution.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Why: The phase has two build surfaces, docs and CLI, but main thread can own both without launching helpers.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Docs IA Planner | READ_ONLY_DRAFT | SKIPPED | none | main thread read roadmap and docs | No subagent launched |
| A2 | Migration CLI Reviewer | READ_ONLY | SKIPPED | none | main thread inspected CLI and self-check | No subagent launched |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

Human-approved owner / expiry if disjoint ownership is used: not applicable

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: No subagent is running. All helper roles are skipped and main thread owns writes.

## Dispatch Hygiene

Before dispatch checked: Yes

Idle subagents recovered: Yes

Completed subagents closed: Yes

Unused planned subagents skipped: N/A

Stale task subagents closed or skipped: Yes

Task drift checked: Yes

Active writer count: 0

Dispatch allowed: Yes

Dispatch block reason: N/A

Recovery notes: Historical run plan updated to record that no helper should be reused before cleanup.

## Allowed Actions

- Use read-only helper agents to inspect files, summarize findings, or review artifacts.
- Use at most one writer at a time, owned by the main thread unless a human-approved disjoint owner and expiry are recorded.
- Close each subagent immediately after its handoff is consumed.
- Run `node scripts/check-subagent-orchestration.mjs .` after the plan is closed.

## Forbidden Actions

- Do not leave subagents running after handoff.
- Do not send a final response while RUNNING agents exist.
- Do not keep standby subagents open.
- Do not run multiple active writers.
- Do not let reviewer agents edit files.
- Do not use subagents to resolve NEEDS_HUMAN_DECISION items.
- Do not create persistent monitors, automations, hooks, or external GPT/API reviewer calls from this plan.

## Handoff / Findings

| Agent ID | Handoff Summary | Findings / Output Ref | Main Thread Decision |
|---|---|---|---|
| A1 | No helper launched | Roadmap target docs inspected by main thread | proceed |
| A2 | No helper launched | CLI migrate placeholder inspected by main thread | replace planned-only route with plan-only command |

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Approve migration apply implementation | human | future phase | Pending |

## Next Safe Step

Next action: Main thread implements bounded changes; no subagent remains running.

## Technical Details

Related files:

- `scripts/cli.mjs`
- `scripts/check-dev-kit.mjs`
- `docs/plans/productization-hardcut-1.0-plan.md`

Commands run:

```text
No subagent launched.
```

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
