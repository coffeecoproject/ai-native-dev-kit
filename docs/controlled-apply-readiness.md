# Controlled Apply Readiness

Controlled Apply Readiness is the step after a Unified Apply Plan and before any possible controlled apply.

In plain language:

```text
We already have a plan. Is it technically safe, bounded, reversible, verified,
and bound to the current request or required real-world authority?
```

The answer may be:

- not ready;
- ready for exact authority binding;
- specialized-path only;
- blocked.

It still does not write files.

## When To Use

Codex uses it internally when the current goal is ready to move from planning
to a controlled project write. The user does not need to request this gate by
name.

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
- whether a required Plan Review Gate report is passed and bound;
- whether the plan itself says it does not authorize apply;
- whether target paths are clear;
- whether git state is safe;
- whether backup and rollback are planned;
- whether verification is planned;
- whether the action is low-risk or belongs to a specialized authority;
- whether the current request binds the action or one permitted user input is
  still needed.

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
node scripts/cli.mjs apply-readiness-check . --require-plan-review
```

For ordinary users, Codex should not require these commands. Codex can run the internal path and explain the result.

From 1.88.2, `--require-plan-review` checks `plan_review_binding`. Controlled
Apply Readiness can only pass that strict mode when the referenced Plan Review
report is `PLAN_REVIEW_PASSED`, digest-bound, task-bound, and non-authorizing.

## Relationship To Unified Apply Plan

Unified Apply Plan answers:

```text
What would change?
```

Controlled Apply Readiness answers:

```text
Is this plan eligible for bounded controlled apply after authority, scope, rollback, and verification evidence pass?
```

Approval Record Governance answers:

```text
Which exact actions are bound to the current request or prepared consent?
```

None of these steps is an executor.
