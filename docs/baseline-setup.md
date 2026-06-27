# Baseline Setup

Baseline setup is the second entry after guided adoption.

Use `start` to answer:

```text
What kind of project is this, and how should it be adopted?
```

Use `baseline` to answer:

```text
What engineering and environment rules does this project need?
```

## Default Flow

```bash
node scripts/cli.mjs start ../project
node scripts/cli.mjs baseline ../project
```

`baseline` is read-only by default.

It reports:

- project classification
- platform profile candidates
- recommended BL level
- engineering baseline status
- environment baseline status
- missing decisions
- high-risk areas
- safe next actions

Required invariant:

```text
Can AI write now: No
```

## Plan-first Writes

Writing baseline docs requires a plan:

```bash
node scripts/baseline-project.mjs ../project --write-plan baseline-plan.json
node scripts/baseline-project.mjs --apply-plan baseline-plan.json
```

The apply step may write only:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `baseline-recommendations/`
- `baseline-gap-reports/`

It must not write:

- `.env`
- secret values
- CI/CD files
- deployment files
- production config
- AGENTS.md
- PR templates
- migrations
- permission changes
- industrial packs

## Environment Baseline

Environment Baseline records facts and unknowns about runtime, local development, environment variables, CI/CD, release, rollback, logs, monitoring, and alerts.

It uses three states:

- `CONFIRMED`
- `PENDING_CONFIRMATION`
- `NOT_APPLICABLE`

Secret values must never be written into this file.

## Task Proof

Task cards must declare whether baselines were touched:

```text
Engineering Baseline touched: Yes / No
Environment Baseline touched: Yes / No
Baseline refs:
Baseline decisions introduced:
```

Run:

```bash
node scripts/check-baseline-enforcement.mjs . --mode ready
```

This check is artifact-level. It checks declarations and refs; it does not claim full source-code architecture enforcement.

## BL Behavior

| Level | Behavior |
|---|---|
| BL0 | Advisory; light projects are not blocked by missing environment docs. |
| BL1 | Baseline docs should exist; pending decisions are visible and routed to humans. |
| BL2 | Evidence, review loop, explicit approval, and strict refs are required. |
