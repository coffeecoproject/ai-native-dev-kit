# 1.7.0 Release Record

## Human Summary

`1.7.0` adds First Delivery Walkthrough and Adoption Trial Report support. It shows how a plain user idea can move through the existing workflow to a bounded demo readiness recommendation without adding a new production approval gate.

## Included

- `core/first-delivery-walkthrough.md`
- `docs/first-delivery-walkthrough.md`
- `templates/adoption-trial-report.md`
- `checklists/first-delivery-walkthrough-review.md`
- `prompts/walkthrough-agent.md`
- `adoption-trial-reports/`
- `scripts/check-first-delivery-walkthrough.mjs`
- CLI command `first-delivery`
- complete simulated example under `examples/1.7-first-delivery-walkthrough/`
- bad fixtures for missing final report, missing launch readiness, and overclaim

## Not Included

- production validation
- real project adoption claim
- automatic implementation from a walkthrough
- automatic release approval
- automatic payment, privacy, security, legal, compliance, migration, or customer approval
- external GPT/API hook automation
- default BL2 or industrial-pack enablement

## Verification

```bash
node --check scripts/check-first-delivery-walkthrough.mjs
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-first-delivery-walkthrough.mjs examples/1.7-first-delivery-walkthrough
node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-missing-final
node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-missing-launch
node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-overclaim
```

Bad fixtures are expected to fail.

## Allowed Claims

- `1.7.0` adds First Delivery Walkthrough assets and checks.
- `1.7.0` adds an Adoption Trial Report template.
- The walkthrough example demonstrates a simulated booking app first slice.
- The checker rejects missing final reports, missing launch readiness, and forbidden overclaims.

## Forbidden Claims

- `1.7.0` is production-proven.
- The booking walkthrough is real-project validation.
- `READY_FOR_DEMO` means production-ready.
- Adoption Trial Reports approve release, payment, privacy, security, legal, compliance, migration, or customer launch.
- Subagents can approve scope, risk, release, or production use.

## Evidence Status

| Evidence | Status | Notes |
|---|---|---|
| Source assets | `PASS` | core, docs, template, prompt, checklist, checker |
| Simulated walkthrough | `PASS` | booking mini app first slice |
| Bad fixtures | `PASS_EXPECTED_FAIL` | missing final, missing launch, overclaim |
| Real project adoption | `NOT_INCLUDED` | future evidence |
| Production validation | `NOT_INCLUDED` | out of scope |

## Known Limitations

- The included walkthrough is simulated evidence, not real project adoption evidence.
- The checker validates recorded Adoption Trial Reports only; it cannot inspect unrecorded private conversations.
- The checker does not prove implementation correctness, security, compliance, release readiness, or production readiness.
- Real project trials still need project-specific evidence and human decisions.

## Human Boundary

Codex may simulate, record, and recommend the first delivery path. Humans still decide project direction, baseline level, scope changes, risk acceptance, production release, payment, privacy, security, legal, compliance, migration, and customer promises.
