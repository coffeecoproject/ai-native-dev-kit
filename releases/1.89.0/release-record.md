# Release 1.89.0: Path And Evidence Hardening

## Summary

1.89.0 hardens write-path safety, evidence fail-closed behavior, and existing
project adoption claims.

This release does not add a new workflow concept. It tightens the foundation
under existing execution and adoption flows so IntentOS is harder to misuse in
real projects.

## Changed Assets

- `scripts/lib/path-safety.mjs`
- `scripts/init-project.mjs`
- `scripts/check-manifest.mjs`
- `scripts/new-workflow-item.mjs`
- `scripts/lib/artifact-schema.mjs`
- `scripts/check-plan-review.mjs`
- `scripts/check-completion-evidence.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `scripts/check-adoption-assurance.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/resolve-work-queue-takeover.mjs`
- `scripts/cli.mjs`
- `templates/release-handoff-pack.md`
- `templates/workflow-version.json`
- `intentos-manifest.json`
- `docs/plans/safety-evidence-hardening-1.89-plan.md`
- `examples/1.71-adoption-execution-assurance/*`

## Allowed Claims

- IntentOS validates write targets for traversal, absolute paths, and symlink
  path components before writing generated workflow assets.
- Init/update apply plans include a digest and cannot be applied after content
  tampering.
- Manifest paths are validated before drift checks run.
- Strict evidence gates fail when required reports are absent.
- Old-project adoption cannot claim `VERIFIED_ACTIVE` or full adoption without
  a verified apply plan, approval record, and controlled apply readiness chain.
- Work Queue takeover no longer silently truncates discovered task sources.
- Release handoff templates default to a blocked state until structured
  approval is recorded.

## Forbidden Claims

- 1.89.0 does not approve implementation.
- 1.89.0 does not approve native apply.
- 1.89.0 does not approve commit, push, release, production, tests, migrations,
  provider actions, or project-owner decisions.
- A verified apply chain is prerequisite evidence only; it still does not
  replace owner approval or project-native gates.

## Evidence Status

- Self-check now covers unsafe manifest path rejection.
- Self-check now covers tampered init/update apply plan rejection.
- Self-check now covers symlink write rejection.
- Self-check now covers strict evidence absence failure.
- Self-check now covers stricter artifact schema keyword enforcement.
- Self-check now covers partial old-project adoption staying valid without
  full-adoption claims.

## Known Limitations

- Path safety protects IntentOS-managed write paths. It does not audit arbitrary
  project scripts outside IntentOS.
- Strict evidence absence failure applies where strict flags are enabled or a
  report is explicitly required.
- `VERIFIED_ACTIVE` requires a verified apply chain, but IntentOS still does
  not decide whether the underlying business change is correct.
- Existing project native adoption remains a controlled, owner-approved process.

## Verification

Required verification:

```bash
npm run verify
git diff --check
```

Verification status is recorded in
[self-check-report.md](self-check-report.md).
