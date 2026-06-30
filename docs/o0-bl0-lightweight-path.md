# O0 / BL0 Lightweight Path

O0 / BL0 is the lightest IntentOS path.

It is for prototypes, small tools, low-risk features, and early exploration where the work does not touch production, customer data, payments, permissions, migrations, CI, hooks, or release infrastructure.

## Plain Flow

```text
User says the goal
-> Codex reads the project briefly
-> Codex gives one simple recommendation
-> User confirms the small first slice
-> Codex implements only that slice
-> Codex verifies and writes a short final report
```

## Default Artifact Set

| Artifact | Required? | Purpose |
|---|---|---|
| Beginner Entry Card | Yes | Translate the goal into a safe next step |
| Minimal task note | Yes | Keep scope small and visible |
| Verification note | Yes | Record what was actually checked |
| Final Report / Execution Closure | Yes | Close the task with changed scope, evidence, and remaining gaps |
| Baseline Decision | Only if setup or platform choice is unclear | Avoid asking baseline questions when they do not matter |
| Review Surface | Optional | Use only when the task has meaningful review risk |
| Apply Plan / Readiness / Approval Record | No by default | Use only if controlled writes are requested |
| Hook Policy / Document Lifecycle / Industrial Packs | No by default | Use only when the task explicitly enters those areas |

## What Codex Should Ask

Ask at most three short questions:

1. What is the smallest useful first result?
2. Is this for local trial, internal use, or production?
3. Does it touch data, login, payment, release, migration, CI, hooks, or secrets?

If the answer is low-risk and local, stay in O0 / BL0.

## When To Escalate

Move out of O0 / BL0 when any of these appear:

- real users or customer data;
- login, roles, permissions, tenant boundary, or admin access;
- payment, value transfer, tax, legal, privacy, security, or compliance;
- database migrations or irreversible data changes;
- CI, hooks, deployment, release, rollback, or production config;
- existing governed project rules;
- dirty worktree that affects the requested task;
- repeated failures or non-trivial structural repair.

## Boundaries

- O0 / BL0 does not skip verification.
- O0 / BL0 does not authorize production release.
- O0 / BL0 does not let Codex bypass human risk decisions.
- O0 / BL0 keeps the workflow small; it does not disable the workflow.
