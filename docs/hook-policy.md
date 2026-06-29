# Project Hook Policy

Project Hook Policy is the project-level rulebook for hooks and automatic
triggers.

In plain language:

```text
Hook Orchestration says what could be automated.
Project Hook Policy says what this project allows.
```

It is useful when a project wants pre-commit checks, pre-push checks, CI steps,
scheduled checks, daily summaries, review loops, or external reviewer hooks.

## What It Does

- lists existing hook and CI sources
- separates read-only checks from hook installation
- states which hook classes are allowed
- states who approves H2 and H3 hooks
- requires rollback and disable steps before risky hooks
- prevents "hook suggestion" from becoming "hook installed"

## What It Does Not Do

- It does not install hooks.
- It does not modify CI.
- It does not add blocking gates.
- It does not call external APIs.
- It does not store tokens or secrets.
- It does not enable auto-fix.
- It does not approve release or production.

## Recommended Use

Run a read-only recommendation first:

```bash
node scripts/cli.mjs hook-policy ../my-project
```

If a policy document is recorded, check it:

```bash
node scripts/cli.mjs hook-policy-check ../my-project
```

For a new project, this can create a clear policy before hook work begins. For
an existing governed project, it should map to existing policy and avoid
replacing CI, release, or agent governance.

## Relationship To Hook Orchestration

Use Hook Orchestration when deciding candidate triggers and risk levels. Use
Project Hook Policy when deciding what the project allows by default and what
requires human approval.

Project Hook Policy does not replace Hook Orchestration. It constrains it.
