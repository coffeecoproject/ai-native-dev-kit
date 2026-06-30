# Ordinary User First-Slice Governance

Ordinary User First-Slice is the O0 / BL0 path for turning a natural-language product idea into a small first version.

It exists for low-risk local products, prototypes, tools, and early demos where the user should not need to understand workflow commands, artifact names, baseline packs, or implementation gates.

## Required Behavior

Codex should:

- restate the product goal in plain language;
- recommend one small first version;
- ask at most three short questions;
- separate first-version scope from backlog;
- explain what Codex can safely do next;
- name verification before implementation;
- keep production, payment, data, permissions, CI, hooks, release, and migration out unless explicitly approved through the heavier path.

## First-Slice Output

The user-facing surface should use this shape:

```text
I understand you want:
I suggest the first version:
I need you to confirm:
After confirmation I can:
Not in this version:
You will get:
```

Technical routing and audit fields may be recorded later, but the ordinary user should not need them to decide.

## Escalation

Leave O0 / BL0 when the request touches:

- real customer data;
- login, roles, permissions, tenancy, or admin access;
- payment, value transfer, tax, legal, privacy, security, or compliance;
- database migrations or irreversible data changes;
- CI, hooks, deployment, release, rollback, or production config;
- existing governed project rules;
- dirty worktree affecting the request;
- repeated failures or non-trivial repair.

## Boundary

An Ordinary User First-Slice Card does not write target files, approve implementation, approve release or production, change CI, install hooks, change task state, enable BL2, enable industrial packs, or approve high-risk decisions.
