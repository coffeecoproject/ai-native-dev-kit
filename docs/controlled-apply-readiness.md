# Controlled Apply Readiness

Controlled Apply Readiness is the step after a Unified Apply Plan and before any possible controlled apply.

In plain language:

```text
We already have a plan. Can it be considered safe enough for a human-approved apply step?
```

The answer may be:

- not ready;
- ready for human-approved apply;
- human-only;
- blocked.

It still does not write files.

## When To Use

Use it when the user says things like:

```text
这个 apply plan 我确认了，接下来能执行吗？
```

or:

```text
这份计划是否满足受控执行条件？
```

Codex should not jump from plan to write. It should first produce a Controlled Apply Readiness Report.

## What Codex Should Do

Codex should check:

- whether the apply plan exists;
- whether the plan itself says it does not authorize apply;
- whether target paths are clear;
- whether git state is safe;
- whether backup and rollback are planned;
- whether verification is planned;
- whether the action is low-risk or human-only;
- whether explicit human approval is still needed.

## What Codex Must Not Do

Controlled Apply Readiness must not:

- write files;
- apply the plan;
- treat user confirmation as blanket permission;
- approve implementation;
- approve release or production;
- install hooks;
- change CI;
- archive or delete documents;
- enable industrial packs;
- touch secrets, migrations, payments, production config, legal, privacy, security, or compliance changes.

## Commands

For maintainer evidence:

```bash
node scripts/cli.mjs apply-readiness . --plan apply-plans/001-example.md
node scripts/cli.mjs apply-readiness-check .
```

For ordinary users, Codex should not require these commands. Codex can run the internal path and explain the result.

## Relationship To Unified Apply Plan

Unified Apply Plan answers:

```text
What would change?
```

Controlled Apply Readiness answers:

```text
Is this plan eligible for a future human-approved controlled apply?
```

Approval Record Governance answers:

```text
What exactly did the human approve?
```

None of these steps is an executor.
