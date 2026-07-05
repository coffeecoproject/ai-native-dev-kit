# Release 1.75.0 - Business Rule Closure

## Summary

1.75.0 adds Business Rule Closure: a read-only business-rule communication layer that runs before Change Impact Coverage and implementation.

The purpose is to help Codex avoid partial or misunderstood task execution. Codex reads the user's request, summarizes the rule, closes required dimensions, proposes safe defaults, asks only the few decisions that matter, and then carries a `business_rule_ref` into Change Impact Coverage.

This is a generic task-communication layer. Contract, tax, finance, HR, legal, payment, privacy, compliance, migration, production, and customer-data wording is treated as example or risk-signal language, not as the default business domain.
The interaction contract is safe defaults plus limited user questions: Codex should not ask the user to design the whole rule when it can propose a conservative default.
For example, contract, tax, finance, HR, legal wording is handled as risk-signal language unless the user's actual task is in that domain.

## Added

- `core/business-rule-closure.md`
- `docs/business-rule-closure.md`
- `templates/business-rule-closure-card.md`
- `checklists/business-rule-closure-review.md`
- `prompts/business-rule-closure-agent.md`
- `schemas/artifacts/business-rule-closure.schema.json`
- `business-rule-closures/`
- `scripts/resolve-business-rule-closure.mjs`
- `scripts/check-business-rule-closure.mjs`
- CLI commands:
  - `business-rule`
  - `business-rule-check`
- Appointment service-time positive example.
- Bad fixtures for missing dimensions, unsafe approval claims, high-risk overclaims, safe-default misuse, stale/mismatched digests, cross-surface assumptions, and excessive user questions.

## Changed

- `impact-coverage` accepts optional `--business-rule-ref <ref>` and records it in human output plus machine-readable evidence.
- Generated-project smoke checks cover Business Rule Closure resolver/checker behavior.
- README, Chinese README, VERSION, manifest, workflow-version, reference docs, and CI workflows describe 1.75.0.

## Allowed Claims

- Codex can generate a read-only Business Rule Closure Card before implementation.
- Codex can recommend safe defaults with reasons.
- Codex can ask limited confirmation questions when the rule is incomplete.
- Codex can block impact coverage when the rule requires domain owner confirmation.
- Codex can carry a `business_rule_ref` into Change Impact Coverage.

## Forbidden Claims

- Business Rule Closure does not write target files.
- Business Rule Closure does not authorize implementation.
- Business Rule Closure does not approve release or production.
- Business Rule Closure does not approve finance, tax, HR, legal, payment, privacy, compliance, migration, production, customer-data, or other high-risk domain decisions.
- Business Rule Closure does not prove real-environment behavior.
- Safe defaults are not user approval.
- A Business Rule Closure Card is not a product, legal, compliance, or release sign-off.

## Verification

Planned verification for this release:

```bash
node --check scripts/resolve-business-rule-closure.mjs
node --check scripts/check-business-rule-closure.mjs
node scripts/check-business-rule-closure.mjs . --allow-empty
node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence
node scripts/resolve-change-impact-coverage.mjs examples/mvp-booking-web-app --intent "appointment requests must include a service time" --business-rule-ref artifact:business-rule-closures/001-appointment-service-time.md --json
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

- Business Rule Closure verifies the recorded Business Rule Closure artifact, not real business correctness.
- It relies on user wording and documented project signals, so it can miss undocumented project-specific domain facts.
- It does not prove real-environment behavior; staging, internal-trial, production, customer-data, release, and operations evidence remains separate.
- It does not approve finance, tax, HR, legal, payment, privacy, compliance, migration, production, customer-data, implementation, release, or other high-risk domain decisions.
- Safe defaults reduce user burden, but they are not user approval.
- `READY_FOR_IMPACT_COVERAGE` only means the business rule is clear enough to map affected implementation surfaces.
- Contract, tax, finance, HR, legal, and similar wording is present only as example or risk-signal language unless the user's actual task is in that domain.

## Evidence Status

Evidence status: passed local verification.

See `self-check-report.md` for the final command outcomes. The release evidence confirms:

- Business Rule Closure resolver/checker syntax passes.
- The source repository passes explicit empty-report checks.
- The appointment service-time example passes strict structured-evidence checks.
- Bad fixtures are rejected by the Business Rule Closure checker.
- `business_rule_ref` carries into Change Impact Coverage.
- `check-intentos`, `npm run verify`, and `git diff --check` pass.
