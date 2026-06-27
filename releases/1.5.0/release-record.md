# Release Record 1.5.0

## Human Summary

`1.5.0` adds Safe Launch / Delivery Readiness.

It helps Codex tell the user whether completed work is not ready, demo-ready, internal-handoff ready, ready for release review, or blocked.

## Included

- `core/safe-launch.md`
- `templates/launch-readiness-report.md`
- `checklists/launch-readiness-review.md`
- `prompts/launch-readiness-agent.md`
- `docs/safe-launch.md`
- `launch-readiness/`
- `scripts/check-launch-readiness.mjs`
- CLI command `launch-readiness`
- examples and bad fixtures

## Not Included

- no production approval
- no legal, compliance, payment, privacy, or security approval
- no deployment automation
- no external reviewer automation

## Verification

```text
node scripts/check-launch-readiness.mjs .
node scripts/check-launch-readiness.mjs examples/1.5-safe-launch-readiness
node scripts/check-launch-readiness.mjs test-fixtures/bad/bad-launch-readiness-missing-verification
node scripts/check-launch-readiness.mjs test-fixtures/bad/bad-launch-readiness-unclosed-decision
node scripts/check-launch-readiness.mjs test-fixtures/bad/bad-launch-readiness-overclaim
```

The bad fixture commands are expected to fail.

## Allowed Claims

- `1.5.0` adds Safe Launch / Delivery Readiness assets and checks.
- Launch readiness reports can classify demo, internal handoff, release review, blocked, or not-ready status.
- The checker rejects ready states without verification and pending human decisions.

## Forbidden Claims

- Do not claim production launch approval.
- Do not claim legal, compliance, payment, privacy, security, or migration approval.
- Do not claim real-project production validation.

## Evidence Status

Source repo checks, good example, and bad fixtures exist. Real-project adoption evidence remains future work.

## Known Limitations

See `releases/1.5.0/known-limitations.md`.

## Human Boundary

Codex recommends readiness. Humans approve launch, risk acceptance, release, and production changes.
