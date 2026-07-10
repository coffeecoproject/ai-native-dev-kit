# Release 1.91.1: Evidence Authority Coverage Close-Out

## Summary

1.91.1 makes explicit strict evidence requirements fail closed when no report
exists and repairs a false repository self-check regression in the existing
project adoption plain-language summary.

## Changed Assets

- Strict empty-report handling for Change Impact Coverage.
- Strict empty-report handling for Unified Apply Plan.
- Strict empty-report handling for Release Handoff Pack.
- Complete plain-language state recognition in the 1.81.3 adoption-autopilot
  self-check.
- Target-scoped Git worktree risk detection for projects nested in a larger
  repository.
- Plan, documentation, reference, release, and version updates.

## Compatibility

- Default checks without strict flags still allow empty report directories.
- Existing historical Markdown remains readable.
- No new workflow artifact type or project structure is introduced.

## Allowed Claims

- An explicit strict Change Impact Coverage request cannot pass with no report.
- An explicit structured Apply Plan request cannot pass with no plan.
- An explicit structured Release Handoff request cannot pass with no pack.
- Every supported adoption Human Summary state can be verified as plain
  language without exposing internal enums.

## Forbidden Claims

- 1.91.1 does not prove product correctness.
- 1.91.1 does not approve or execute implementation, apply, commit, push,
  release, production, migrations, provider actions, or owner decisions.
- This patch does not implement Apply Receipt or release-candidate trust.

## Evidence Status

- The three strict empty-project invocations exit non-zero with an exact
  missing-report reason.
- The same three checkers pass their default non-strict empty-project checks.
- The Adoption Autopilot resolver emits a supported plain-language Human
  Summary while keeping technical state in Machine-Readable Evidence.
- A dirty parent-only release/workflow file does not escalate a clean nested
  target project's low-risk closure decision.
- Repository-wide self-check and verification must pass before this patch is
  treated as released.

## Known Limitations

- Apply Plan is not yet the sole replayable execution graph; Apply Receipt and
  post-apply target proof remain 1.92 work.
- Structured release approval and release-candidate identity remain 1.93 work.
- Manifest schema alignment, duplicate copy coverage, baseline installation,
  and public source-only links remain 1.94 work.

## Verification

```bash
node scripts/check-intentos.mjs --mode full
npm run verify
node scripts/check-manifest.mjs
git diff --check
```

Executed results are recorded in
[self-check-report.md](self-check-report.md). A command list or report path is
not itself proof; every command above must exit zero before close-out.
