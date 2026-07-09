# Release 1.89.0 Self-Check Report

## Scope

Path And Evidence Hardening.

## Checks

- Unsafe manifest copy paths are rejected before drift checking.
- Tampered init/update apply plans are rejected by `planDigest`.
- Workflow asset writes through symlink paths are rejected.
- Strict Plan Review, Completion Evidence, and Controlled Apply Readiness fail
  closed when required reports are absent.
- Artifact schema validation enforces stricter keywords used by IntentOS
  schemas.
- Read-only old-project adoption remains valid as partial adoption, but does
  not claim full adoption without a verified apply chain.

## Boundaries

- No implementation authorization added.
- No native apply authorization added.
- No release or production authorization added.
- No project-owner decision replacement added.

## Final Verification

Verified in this working tree:

```bash
npm run verify
git diff --check
```

Result:

- `npm run verify`: PASS
- Verify log: `/tmp/intentos-verify-1.89.log`
- Verify log length: 33,168 lines
- Final verify line: `IntentOS self-check passed.`
- `git diff --check`: PASS
