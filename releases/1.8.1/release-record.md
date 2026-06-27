# Release Record: 1.8.1

## Human Summary

1.8.1 calibrates 1.8 after review. It does not add a new governance layer; it clarifies real-adoption usage and adds a controlled false-positive record for conservative patch classification triggers.

## Scope

- Split profiles from risk/capability packs in governance maps.
- Add patch classification false-positive records.
- Add real adoption usage documentation.
- Extend patch classification checks and fixture coverage.

## Allowed Claims

- The dev kit can record reviewed false positives for conservative patch classification triggers.
- The dev kit can reject false-positive records that accept real high-risk impact as safe.
- The dev kit docs now state that `real-adoption` checks recorded reports and does not auto-generate target-project reports.

## Forbidden Claims

- This release does not implement an automatic real-project scanning runner.
- This release does not approve target-project writes.
- This release does not weaken high-risk patch classification defaults.
- This release does not approve implementation from false-positive records.

## Evidence Status

Status: SOURCE_EVIDENCE

Evidence basis:

- local checker and fixture verification
- dev-kit self-check report

Not included:

- new target-project trial evidence
- automatic scanning evidence
- production validation evidence

## Verification

See `releases/1.8.1/self-check-report.md`.

## Known Limitations

See `releases/1.8.1/known-limitations.md`.
