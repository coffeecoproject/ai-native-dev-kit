# Appointment Service Time Verification Plan

This fixture models one ordinary rule change:

```text
Appointment requests must include a service time.
```

The fixture includes:

- `business-rule-closures/001-service-time.md`
- `change-impact-coverage-reports/001-service-time.md`
- `verification-plans/001-service-time.md`

The Verification Plan is bound to the Business Rule Closure and Change Impact Coverage report through structured evidence, digests, `verification_plan_ref`, `business_rule_ref`, `impact_ref`, `source_systems`, and `intent_digest`.

It requires positive and negative API checks, backend rule checks, UI interaction checks, error copy checks, regression smoke, and generated-test review control. It rejects treating a broad command such as `npm test` as the only proof for the rule.
