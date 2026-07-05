# Business Rule Closure

Business Rule Closure helps IntentOS avoid building the wrong interpretation of
a business rule.

It happens before coding:

```text
User asks for a rule
-> Codex checks whether the rule is business-complete
-> user confirms only key decisions
-> Change Impact Coverage maps affected surfaces
```

## What Users See

Users should not see an internal checklist. Codex should summarize:

- what it understands;
- what decision is still needed;
- the safe default if the user is unsure.

Example:

```text
My understanding:
- Appointment creation and rescheduling must include a service time.
- Existing appointments are not changed automatically.
- Rescheduling an existing appointment applies the new rule.

Need your confirmation:
- Should existing appointments without service time be blocked from
  rescheduling?

Safe default:
- Do not batch-change existing appointments. Apply the rule only when an
  appointment is created or rescheduled.
```

## What It Does Not Do

Business Rule Closure does not write files, approve implementation, approve
release, approve production behavior, or decide finance, tax, HR, legal,
payment, privacy, compliance, migration, production, or customer-data policy.

It only decides whether the rule is clear enough to enter Change Impact
Coverage.

## Why It Matters

Without Business Rule Closure, Codex may implement only one obvious layer, such
as backend validation, while missing user flow, UI, API contract, historical
data, permissions, tests, or real-environment validation.

Business Rule Closure creates a bindable rule record with a digest so later
Impact Coverage and Execution Assurance can prove they are working from the
same business interpretation.

## Binding Into Change Impact Coverage

The `business_rule_ref` in a Business Rule Closure report must point to that
same report file. Strict checks reject a card whose machine-readable
`business_rule_ref` points somewhere else.

When Change Impact Coverage receives `--business-rule-ref`, it can carry the
referenced rule's `business_rule_digest` and `business_rule_state` into its own
machine-readable evidence. For rule-heavy tasks, strict review should require:

```bash
node scripts/check-change-impact-coverage.mjs <project> \
  --report <change-impact-report> \
  --require-structured-evidence \
  --require-business-rule-ref \
  --require-business-rule-ready
```

This proves the impact map consumed a `READY_FOR_IMPACT_COVERAGE` Business Rule
Closure. It still does not authorize implementation or release.
