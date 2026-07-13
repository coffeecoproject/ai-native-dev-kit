# IntentOS 1.106.0 Release Record

## Theme

Release Topology Consumer Binding.

## Delivered

- shared strict topology-source validator;
- Release Evidence Gate topology source support;
- Release Approval exact topology binding;
- Release Execution and Runtime Hygiene strict topology consumption;
- copied, stale, mismatched, legacy-only, and dual-trigger regressions;
- generated-project distribution parity.

## Evidence Status

Repository consumer tests and generated-project checks prove strict source,
digest, project, candidate, package, action, and dual-trigger validation. They
do not prove that a real provider or production target is correctly configured.

## Allowed Claims

- Strict release consumers can require one exact current topology source.
- Copied, stale, mismatched, legacy-only, and conflicting-trigger evidence is
  rejected by the covered consumers.

## Forbidden Claims

- Consumer binding approves or executes a release.
- A valid topology proves provider, production, or business correctness.
- A topology report replaces exact approval for the pending external action.

## Boundaries

This version does not approve or execute a release, change provider state, or
make the topology report an authority source.

## Verification

See `releases/1.106.0/self-check-report.md`.

## Known Limitations

See `releases/1.106.0/known-limitations.md`.
