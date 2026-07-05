# Guided Delivery Baseline

## Human Summary

Guided Delivery Baseline is the product boundary for using IntentOS as an end-to-end delivery helper, not just a code-writing workflow.

## What It Means

The user gives a goal. Codex reads the project, recommends a safe path, asks humans to confirm key decisions, executes approved work, verifies, reviews, records evidence, and reports.

The user does not need to manage every technical step. The user still owns judgment, approval, risk, scope, and launch decisions.

## Current Delivery Chain

```text
start
  -> baseline
  -> goal mode
  -> workflow artifacts
  -> optional subagent plan
  -> task execution
  -> review loop
  -> baseline enforcement
  -> claim control
  -> final report
```

## How To Use

For a project:

```bash
node scripts/cli.mjs start ../project
node scripts/cli.mjs baseline ../project
```

For IntentOS maintenance:

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
```

## Boundaries

- `start` is read-only.
- `baseline` is read-only by default.
- Existing project writes are plan-first.
- AI reports do not approve release or risk.
- Unknown assumptions must be visible.
- Claims must match evidence.

## Related Files

- `core/outcome-baseline.md`
- `core/product-baseline.md`
- `core/claim-control.md`
- `core/assumption-register.md`
- `docs/product-baseline.md`
- `docs/claim-control.md`
