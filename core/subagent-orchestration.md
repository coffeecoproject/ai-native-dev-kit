# Subagent Orchestration Protocol

Subagent Orchestration defines how Codex may use helper agents without losing control of scope, writes, review authority, or cleanup.

It is not automatic parallel execution. It is a governance protocol for when multiple agents are useful.

## Core Principle

```text
Many readers, one writer.
```

Read-only subagents may inspect, plan, compare, or review. Only one writer may change project files at a time.

## Purpose

Use subagents only when they reduce risk or make independent work clearer:

- route a broad goal
- inspect engineering baseline gaps
- draft specs from existing request/preflight
- review completed work
- repair allowed `AUTO_FIX` findings
- convert technical state into human-facing output

Do not use subagents just because the task is large. Split the task first.

## Default Roles

| Role | Default Authority | May Do | Must Not Do |
|---|---|---|---|
| Goal Planner | READ_ONLY | classify Goal Mode, propose required artifacts | implement, approve, or change files |
| Engineering Baseline Agent | READ_ONLY | identify engineering-decision gaps and source-of-truth conflicts | create project standards or edit code |
| Spec Agent | READ_ONLY_DRAFT | draft spec/eval/task artifacts when allowed by the run plan | write business code or approve scope |
| Builder | WRITER | implement one approved task | widen scope, edit approvals, or act as reviewer |
| Reviewer | READ_ONLY | inspect Review Packet and produce findings | edit files, approve release, accept risk |
| Repair | WRITER_LIMITED | fix `AUTO_FIX` findings only | repair human-decision items or expand scope |
| Reporter | READ_ONLY_DRAFT | produce human-readable status, summary, handoff, or final report | approve continuation or create implementation authority |

`READ_ONLY_DRAFT` means the agent may draft workflow artifacts only when the run plan explicitly allows that write. It still must not edit business code.

## Run Plan

Before using subagents for non-trivial work, create a run plan:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
```

Run plans live in:

```text
subagent-run-plans/
```

A run plan records:

- selected orchestration mode
- role roster
- authority of each agent
- current writer
- allowed write scope
- lifecycle state
- required closure evidence
- human decisions needed
- next safe step

## Orchestration Modes

| Mode | Use When | Writer Rule |
|---|---|---|
| `READ_ONLY_RESEARCH` | Multiple agents inspect context or compare options | no writer |
| `PLAN_THEN_BUILD` | planning agents prepare context before one builder implements | one builder writer after planning closes |
| `REVIEW_LOOP` | reviewer inspects a completed task | reviewer is read-only |
| `AUTO_FIX_REPAIR` | repair agent fixes `AUTO_FIX` findings | one repair writer, maximum 2 rounds |
| `REPORTING` | reporter converts technical state into human output | no implementation writer |

## Writer Control

Only one active writer is allowed.

Allowed writer roles:

- Builder
- Repair

Spec Agent and Reporter may write workflow artifacts only when the run plan explicitly sets their authority to `READ_ONLY_DRAFT` and the write scope is limited to approved artifact paths.

Never allow two writers to edit the same tree at the same time.

If disjoint write ownership is ever needed, it must be recorded as a human-approved exception with:

- exact agent IDs
- exact non-overlapping paths
- reason
- owner
- expiry condition

The default remains one writer.

## Lifecycle Rules

Every subagent has a lifecycle:

```text
PLANNED -> RUNNING -> CLOSED
PLANNED -> SKIPPED
```

Allowed status values:

- `PLANNED`
- `RUNNING`
- `CLOSED`
- `SKIPPED`

Completion requirement:

```text
All subagents must be CLOSED or SKIPPED before the main thread sends the final task response.
```

This prevents helper agents from occupying slots, holding stale context, or acting on old instructions after the task ends.

## Close / Release Requirement

When a subagent is done, close or release it immediately.

The run plan must record:

- status: `CLOSED` or `SKIPPED`
- closed at
- closure evidence
- handoff summary
- whether any findings or drafts remain unresolved

Do not leave a subagent in `RUNNING` after its output has been consumed.

Do not keep standby subagents open for possible future work.

Do not create background or persistent agents from this protocol.

If the tool surface does not expose an explicit close command, record closure in the run plan and stop sending that subagent work.

## Handoff Rules

Subagent output is input to the main thread. It is not authority by itself.

The main thread must:

- read the output
- decide whether it is relevant
- route findings to the right artifact
- apply only allowed writes
- close the subagent after handoff
- report unresolved decisions to humans

Reviewer and planner output must not be applied blindly.

## Forbidden Patterns

Do not:

- keep subagents running after their task is done
- leave `RUNNING` agents in a committed run plan
- run multiple writers on the same files
- let reviewers edit files
- let repair agents handle `NEEDS_HUMAN_DECISION`
- let reporter output approve continuation
- use subagents to bypass Goal Mode, Request, Preflight, Spec, Eval, Task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope
- create persistent monitors or scheduled agents from a subagent run plan
- use external GPT/API reviewer automation from this protocol

## Checks

Use:

```bash
node scripts/check-subagent-orchestration.mjs .
```

The checker validates Subagent Run Plans when they exist. Empty projects pass without requiring a run plan.

## Non-goals

Subagent Orchestration does not:

- replace Goal Mode
- replace task cards
- create active Skills
- create automations
- call external GPT/API reviewers
- approve release or risk
- grant write authority without a run plan
- keep helper agents alive across tasks

## Completion

A subagent run is complete only when:

- all launched agents are `CLOSED` or `SKIPPED`
- there is at most one writer in the run
- no writer remains active
- findings are routed to Review Loop, Decision Brief, Follow-up Proposal, Final Report, or Human Decisions Needed
- the final response says which subagents ran, what they produced, and that they were closed
