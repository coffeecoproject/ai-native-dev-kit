# Hook Orchestration

Hook orchestration means deciding what should happen automatically when a trigger occurs.

Plain-language rule:

> Codex can automatically check and suggest. Codex cannot automatically install hooks, change CI, or add blockers.

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
- create a plan for human review

### Needs Human Confirmation

Anything that changes project behavior needs approval.

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
| `H2_REQUIRES_CONFIRMATION` | Non-blocking installation or file change | Human confirms first |
| `H3_EXPLICIT_APPROVAL_REQUIRED` | Blocking, CI, API, release, auto-fix, or production-related | Explicit approval first |

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
5. Human chooses whether any H2/H3 hook should be installed.
6. A separate reviewed task handles installation if approved.

## Incorrect Use

Do not use Hook Orchestration to silently:

- install hooks
- change `.github/workflows`
- add blocking gates
- enable scheduled jobs
- enable external reviewer APIs
- run auto-fixes
- approve release or production

