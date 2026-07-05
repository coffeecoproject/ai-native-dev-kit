# Goal + Subagent Usage

This guide explains how to use Goal Mode and Subagent Orchestration together in a project.

The short version:

```text
Goal Card decides what kind of work this is.
Subagent Run Plan decides how helper agents are used.
Task artifacts decide what can actually be changed.
Review Loop decides whether the task is really closed.
```

Goal Mode is not permission to implement. It is route selection.

Subagent Orchestration is not delegation of responsibility. It is a controlled way for Codex to use helper agents while the main thread remains responsible for scope, writes, checks, and final reporting.

## When To Use Goal Mode

Use a Goal Card when the human request is broad, ambiguous, high-risk, or can be handled in more than one way.

Typical cases:

- The user gives a repository or document and says to configure it.
- The user asks to build, adopt, review, repair, or summarize but does not specify the exact workflow entry.
- The request may touch baseline decisions, review loops, release, permissions, schema, dependencies, or existing governance.
- The task is multi-step and Codex needs to show the route before execution.

Do not use a Goal Card for every tiny task. If the request is already a clear L0 or L1 edit, and scope is obvious, use the normal task flow.

## Goal Modes

Goal Mode must choose one route:

| Mode | Use when | What Codex may do |
|---|---|---|
| `DISCUSS_ONLY` | The user asks to talk, review, or evaluate without execution | Read and explain only |
| `ADOPT_PROJECT` | A new or existing project needs IntentOS workflow setup | Assess or bootstrap workflow assets according to project state |
| `DEFINE_WORK` | The request is not yet ready for implementation | Create request, preflight, spec, eval, and task assets |
| `IMPLEMENT_TASK` | A selected task card exists and is ready | Implement inside approved scope only |
| `REVIEW_TASK` | A task needs independent review | Create or use Review Packet and review-only instructions |
| `REPAIR_TASK` | Review found deterministic `AUTO_FIX` findings | Fix only approved low-risk findings within scope |
| `BASELINE_DECISION` | Engineering or platform conventions are unclear | Route to Decision Brief or human decision |
| `HANDOFF_OR_REPORT` | Work needs status, handoff, or final report | Produce human-first reporting artifacts |

## When To Use Subagent Orchestration

Use a Subagent Run Plan only when helper agents are used.

Typical cases:

- One agent reads existing project rules while another plans the task.
- A reviewer agent checks work without editing files.
- A repair agent analyzes `AUTO_FIX` findings before the main thread edits.
- A reporter agent turns technical results into human-facing output.

Do not keep helper agents open after their output is consumed. Every helper agent must be `CLOSED` or `SKIPPED` before final response, commit, or handoff.

Before opening or reusing a helper agent, Codex must also apply dispatch hygiene:

```text
Recover before dispatch.
```

That means old helpers are closed or skipped, stale task helpers are not reused silently, task drift is checked, and there is at most one active writer before another helper is dispatched.

## The Default Rule

```text
Many readers, one writer.
```

Read-only helper agents may inspect docs, code, evidence, and review packets.

Only one writer should edit files at a time. The main thread is the default writer. If a helper agent has write authority, the write scope must be explicit, narrow, and closed after handoff.

Reviewer agents must not edit files.

## Complete Flow

For a non-trivial L2 task, use this order:

```text
1. Goal Card
2. Request
3. Preflight
4. Spec
5. Eval
6. Task
7. Subagent Run Plan, if helper agents are used
8. Implementation
9. Review Packet
10. Review Loop Report
11. Auto-fix, if allowed
12. Re-review
13. Final Report
14. Follow-up Proposal, only for out-of-scope next work
```

The task card remains the execution authority. Goal Card and Subagent Run Plan do not expand scope.

## What Codex Must Stop For

Codex must stop for human decision before:

- Scope expansion
- Risk acceptance
- Human Approval or Approval scope changes
- Architecture changes
- Permission model changes
- New production dependency
- Database migration
- Production configuration change
- Release, rollback, or irreversible operation
- Any `NEEDS_HUMAN_DECISION` finding

## Commands

Create and check a Goal Card:

```bash
node scripts/new-workflow-item.mjs --type goal-card --task tasks/<task>.md --goal-mode IMPLEMENT_TASK
node scripts/check-goal-mode.mjs .
```

Create and check a Subagent Run Plan:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --task tasks/<task>.md --subagent-mode REVIEW_LOOP
node scripts/check-subagent-orchestration.mjs .
```

For dispatch-specific rules, see `docs/subagent-dispatch-hygiene.md`.

Check a full L2 task route:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/<task>.md
node scripts/check-review-loop.mjs . --task tasks/<task>.md
node scripts/check-next-step-boundary.mjs . --task tasks/<task>.md
```

## Example

See `examples/goal-subagent-l2-feature/` for a simulated L2 feature flow.

It is a workflow rehearsal, not proof that a real project has been validated.
