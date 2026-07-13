# Hook Orchestration

Hook orchestration means deciding what should happen automatically when a trigger occurs.

Plain-language rule:

> Codex can automatically check and suggest. Persistent changes require a controlled plan; concrete external effects require exact consent.

## What Is A Hook?

A hook is an automatic trigger:

```text
when X happens -> run Y
```

Examples:

- when a task finishes, run Review Loop checks
- before push, run project verification
- before release, run launch readiness
- every day, summarize AI logs

## Two Buckets

### Can Run Automatically

Safe automation is read-only and non-blocking.

Examples:

- run existing checks
- inspect current workflow state
- generate a recommendation
- classify hook candidates
- create a plan for internal review

### Needs Controlled Apply Or Exact Consent

Anything that changes project behavior needs an evidence-backed controlled
plan. Only a concrete external, scheduled, paid, release, or production effect
needs exact user consent.

Examples:

- install Git hooks
- modify CI
- add a blocking gate
- call GPT/API automatically
- enable auto-fix
- change release flow
- store secrets

## Hook Levels

| Level | Meaning | Default |
|---|---|---|
| `H0_AUTO_READ_ONLY` | Read-only local check | Codex may run |
| `H1_AUTO_SUGGESTION` | Generate recommendation or plan | Codex may generate |
| `H2_REQUIRES_CONFIRMATION` | Compatibility name for non-blocking installation or file change | Controlled apply first |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Compatibility name for blocking, CI, API, release, auto-fix, or production-related work | Strict review; exact consent for external effects |

## Commands

```bash
node scripts/resolve-hook-orchestration.mjs .
node scripts/check-hook-orchestration.mjs .
node scripts/new-workflow-item.mjs --type hook-orchestration-plan --name project-hooks
```

CLI aliases:

```bash
node scripts/cli.mjs hook-plan .
node scripts/cli.mjs hook-plan-check .
```

## Correct Use

1. Codex reads the project.
2. Codex inventories existing hooks and CI.
3. Codex classifies candidate hooks as H0-H3.
4. Codex prints a plan.
5. Codex validates project authority, rollback, and verification for H2/H3 work.
6. A separate reviewed task handles installation; the user is involved only for a prepared external effect.

## Incorrect Use

Do not use Hook Orchestration to silently:

- install hooks
- change `.github/workflows`
- add blocking gates
- enable scheduled jobs
- enable external reviewer APIs
- run auto-fixes
- approve release or production
