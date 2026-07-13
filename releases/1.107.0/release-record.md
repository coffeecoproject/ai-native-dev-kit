# IntentOS 1.107.0 Release Record

## Theme

Release Topology Migration And Calibration.

## Delivered

- one read-only migration lifecycle from discovery through separate retirement;
- exact current topology, project, revision, candidate, and dependency binding;
- Plan Review, controlled apply, receipt, rollback, Runtime Trust, rehearsal,
  cutover, post-cutover, and retirement evidence requirements;
- separate cutover and release consent boundaries;
- copied, stale, tampered, missing-evidence, production-rehearsal, and
  premature-retirement negative tests;
- source and generated-project distribution parity.

## Boundaries

This release does not edit a project release path, call a provider, execute a
rehearsal or cutover, approve release, move secrets, or retire an old backend.

## Evidence Status

Repository lifecycle tests and generated-project checks validate exact binding,
stage-specific failure behavior, separate consent boundaries, and read-only
migration records. They do not prove a real provider migration or cutover.

## Allowed Claims

- IntentOS can record a current release topology migration from discovery
  through separately governed retirement review.
- Later lifecycle stages fail when their exact apply, rehearsal, cutover,
  observation, rollback, or retirement evidence is absent or mismatched.

## Forbidden Claims

- A migration report applies project changes, performs rehearsal, cutover, or
  release, moves secrets, or retires infrastructure.
- Passing repository fixtures proves a real provider migration is safe.
- Cutover consent substitutes for release consent or retirement authority.

## Known Limitations

See `releases/1.107.0/known-limitations.md`.

## Verification

See `releases/1.107.0/self-check-report.md`.
