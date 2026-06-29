# Delivery Path Governance

Delivery Path Governance answers a plain question:

> How far is this project from something people can actually use?

The report is read-only. It does not write files, approve implementation, or
approve release.

## Run

```bash
node scripts/cli.mjs delivery-path ../my-project
node scripts/cli.mjs delivery-path-check ../my-project
```

Direct commands:

```bash
node scripts/resolve-delivery-path.mjs ../my-project
node scripts/check-delivery-path.mjs ../my-project
```

## What The Human Sees

A Delivery Path Report should say:

- current state
- next target state
- what is missing
- what is blocked
- what Codex can do next
- what Codex will not do without approval

Example:

```text
Current state: READY_FOR_SELF_TEST
Next state: READY_FOR_INTERNAL_TRIAL
Still missing: deployment environment, error logging, trial checklist
Codex can continue: limited
Human decision needed: confirm whether internal trial is the goal
```

## State Ladder

```text
IDEA_ONLY
-> NEEDS_PROJECT_READING
-> READY_FOR_PLAN
-> READY_FOR_LOCAL_BUILD
-> READY_FOR_SELF_TEST
-> READY_FOR_INTERNAL_TRIAL
-> READY_FOR_RELEASE_REVIEW
```

Blocked states:

```text
BLOCKED_BY_RISK
BLOCKED_BY_DIRTY_WORK
BLOCKED_BY_MISSING_DECISION
```

## Rules

- Be conservative when existing users, data, login, payment, release, or dirty
  worktree signals are unclear.
- Never claim "production ready" from a Delivery Path Report.
- Use Safe Launch before release or production claims.
- Use Review Surface before implementation.
- Use Work Queue before switching from unfinished work.
- Use Document Lifecycle before archive or cleanup actions.
- Use Hook Orchestration before hook or CI automation changes.

## Checker

`check-delivery-path` validates recorded reports under
`delivery-path-reports/`.

It rejects:

- missing or invalid states
- release or production approval claims
- target-file, CI, hook, task-state, or implementation approval claims
- missing blockers, evidence, next action, or boundaries
- too many human questions
