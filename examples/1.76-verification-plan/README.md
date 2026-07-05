# Verification Plan Governance Example

This example shows how 1.76 turns a closed business rule and a Change Impact Coverage report into a source-bound Verification Plan.

It is intentionally small:

- Business Rule Closure closes the user rule: appointment requests must include a service time.
- Change Impact Coverage maps the affected user flow, frontend, API, backend, error copy, docs, and test coverage surfaces.
- Verification Plan converts those source reports into concrete verification obligations and test-correctness controls.

The example does not execute tests, approve implementation, approve release or production, or prove product correctness.

Strict check:

```bash
node scripts/check-verification-plan.mjs \
  examples/1.76-verification-plan/appointment-service-time \
  --report verification-plans/001-service-time.md \
  --require-structured-evidence \
  --require-business-rule-ref \
  --require-impact-ref \
  --strict-source-binding
```
