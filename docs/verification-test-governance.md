# Verification Plan Governance

Verification Plan Governance helps Codex answer a practical question before it
claims work is complete:

```text
What needs to be checked for this task to be trusted?
```

It does not ask the user to design tests. Codex reads the request, the Business
Rule Closure, the Change Impact Coverage report, project level, platform
signals, and risk signals. Then it produces a Verification Plan.

In strict mode, the plan must prove it is one continuous source chain: the
Change Impact Coverage report must have consumed the same Business Rule Closure
that the Verification Plan references, and the `source_systems[]` trace must
match the top-level refs, digests, and outcomes.

The report body is also checked against JSON evidence. If the Markdown says one
outcome, source, surface, obligation, manual check, or not-applicable reason,
and the machine-readable evidence says another, the report fails strict checks.

## What It Produces

A Verification Plan lists:

- what must be verified;
- which affected surface each check belongs to;
- what evidence would be enough later;
- which checks are blocking;
- which checks require a human or domain owner;
- which checks are not applicable and why;
- why broad commands like `npm test` are not enough by themselves.

## What It Does Not Do

Verification Plan does not:

- run tests;
- execute tests;
- write target files by default;
- approve implementation;
- approve release or production;
- prove product correctness;
- replace existing project test gates.

## Why Tests Need Governance

Tests can be wrong. A Codex-written test may verify the implementation detail
instead of the intended behavior. It may test only the happy path, skip the
backend, ignore the UI, or reuse stale output.

For that reason, IntentOS treats tests as evidence that must be tied to a
specific verification obligation.

## Typical Flow

```bash
node scripts/cli.mjs business-rule . \
  --intent "appointment requests must include a service time" \
  --out business-rule-closures/001-service-time.md

node scripts/cli.mjs impact-coverage . \
  --intent "appointment requests must include a service time" \
  --business-rule-ref artifact:business-rule-closures/001-service-time.md \
  --out change-impact-coverage-reports/001-service-time.md

node scripts/cli.mjs verification-plan . \
  --intent "appointment requests must include a service time" \
  --business-rule-ref artifact:business-rule-closures/001-service-time.md \
  --impact-ref artifact:change-impact-coverage-reports/001-service-time.md \
  --project-level BL1 \
  --platform web,backend \
  --out verification-plans/001-service-time.md

node scripts/cli.mjs verification-plan-check . \
  --report verification-plans/001-service-time.md \
  --require-structured-evidence \
  --require-business-rule-ref \
  --require-impact-ref \
  --strict-source-binding
```

## User Experience

The user should see a short conclusion:

```text
This task needs API positive/negative checks, backend rule checks, UI behavior
checks, error copy checks, and regression smoke.
```

The user should not have to choose internal test types unless a real business,
risk, data, owner, or release decision is needed.
