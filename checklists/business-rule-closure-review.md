# Business Rule Closure Review Checklist

Use this checklist before a business-rule task enters Change Impact Coverage.

- The user-facing summary is short and decision-oriented.
- The card asks no more than three user-facing questions.
- The rule has a stable `business_rule_id`, `business_rule_ref`, and digest.
- Required dimensions for the detected rule type are closed, defaulted with a
  reason, or explicitly not applicable with a reason.
- Recommended safe defaults are not treated as user acceptance or application.
- Historical data behavior and effective time are explicit.
- Existing project rule conflicts are resolved or block readiness.
- High-risk finance, tax, HR, legal, payment, privacy, compliance, migration,
  production, and customer-data decisions remain human/domain-owner decisions.
- Real-environment validation is described as an expectation unless there is
  concrete evidence.
- The card does not authorize implementation, writes, release, production, or
  domain-owner decisions.
