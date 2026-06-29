# Debt & Knowledge Handoff

Debt & Knowledge Handoff answers:

> What did we leave behind, and what does the next person need to know?

Run:

```bash
node scripts/cli.mjs debt-handoff ../my-project
node scripts/cli.mjs debt-handoff-check ../my-project
```

Direct commands:

```bash
node scripts/resolve-debt-handoff.mjs ../my-project
node scripts/check-debt-handoff.mjs ../my-project
```

## What It Records

- debt level
- debt impact
- whether the debt blocks release review
- what changed
- why it changed
- how to verify it
- where to continue next
- what not to touch without approval

## Debt Levels

```text
D0_NO_DEBT_FOUND
D1_ACCEPTABLE_SMALL_DEBT
D2_MAINTENANCE_DEBT
D3_RELEASE_BLOCKING_DEBT
D4_HIGH_RISK_DEBT
```

## Rules

- D3 cannot move to release review.
- D4 must stop for human decision.
- Debt handoff does not approve implementation.
- Debt handoff does not approve release or production.
- Debt handoff does not replace Review Loop or Safe Launch.
- If handoff reveals stale docs, route to Document Lifecycle.
- If work is paused, route to Work Queue.
