# Guided Delivery Baseline

## User Summary

Guided Delivery Baseline is the product boundary for using IntentOS as an end-to-end delivery helper, not just a code-writing workflow.

## What It Means

The user gives a goal and any unavailable business facts. Codex reads the project, selects the safe technical path, executes within bounded authority, verifies, reviews, records evidence, and reports. Exact consent is requested only before a prepared concrete real-world effect.

The user does not manage technical steps or approve technical risk. The user owns business intent, product preference, exact real-world consent, and unavailable external facts.

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
