# Subagent Dispatch Hygiene

Subagent Dispatch Hygiene is the plain rule for helper agents:

```text
先回收，再派发。
```

If Codex used helper agents before, it must confirm those helpers are closed, skipped, or no longer receiving work before starting another helper.

## Why This Exists

Subagents are useful for planning, review, repair analysis, and reporting.

They become risky when a task is interrupted, the user changes direction, or a helper remains logically open after its output was already used.

This document keeps subagent usage from drifting into:

- stale helpers acting on old instructions;
- multiple writers editing at the same time;
- helpers staying open as standby capacity;
- old task context leaking into a new task.

## What Codex Should Do

Before using a helper agent, Codex should check:

```text
Is this still the same task?
Are any old helpers still running or occupying slots?
Were completed helpers closed?
Were unused planned helpers skipped?
Is there more than one writer?
Can this dispatch proceed safely?
```

Then Codex records the answer in the `Dispatch Hygiene` section of the Subagent Run Plan.

## What Users Need To Decide

Usually nothing.

The user only needs to decide when the current task changed or a stale helper belongs to another task:

```text
继续当前任务 / 暂停当前任务 / 切换到新任务
```

Codex should not ask the user to manage helper-agent slots.

## Commands

Create a run plan:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
```

Check the run plan:

```bash
node scripts/check-subagent-orchestration.mjs .
```

## Boundaries

This is a governance check, not an automation engine.

It does not create real subagents, close real tool sessions, install hooks, run schedulers, call GPT/API reviewers, or approve writes.
