# Release Record: 1.33.0

## Summary

`1.33.0` adds Evidence-Linked Closure.

Execution Closure now distinguishes between "changed files exist" and "review evidence proves this surface can pass." A closure may summarize changed files with limitations, but `READY_FOR_COMMIT_REVIEW` requires linked evidence for review surfaces, verification, change boundary, and debt.

## Added

- `docs/evidence-linked-closure-1.33-plan.md`
- Evidence-link arguments for `scripts/resolve-execution-closure.mjs`
  - `--review-surface-ref`
  - `--review-loop-ref`
  - `--change-boundary-ref`
  - `--verification-file`
  - `--debt-handoff-ref`
  - `--delivery-path-ref`
  - `--base`
  - `--cached`
- `Evidence Links` section in Execution Closure Reports
- 1.33 evidence-linked closure example
- Bad fixtures for changed-files-only pass evidence and ready-without-evidence claims

## Changed

- `FUNCTIONAL_REVIEW` and `CODE_REVIEW` no longer pass just because changed files exist.
- `READY_FOR_COMMIT_REVIEW` now requires evidence links for review surface, review-loop/reviewer evidence, change boundary, verification, and debt handoff.
- `check-execution-closure.mjs` rejects pass claims based only on changed files.
- Execution closure docs, template, manifest, CI smoke checks, README, and governance verification now include evidence-linked closure usage.

## Boundary

This release does not:

- write target files
- approve implementation
- approve release or production
- change task state
- forgive debt
- replace Review Loop
- replace Safe Launch
- authorize commit or push
- approve security, privacy, compliance, payment, migration, tax, legal, data, hook, CI, automation, release, or production decisions
- apply plans or introduce the unified apply layer

## Allowed Claims

- AI Native Dev Kit can produce an evidence-linked Execution Closure Report.
- Execution Closure can use recorded evidence refs to decide whether a task can enter commit review.
- Changed files are treated as scope evidence, not proof of functional or code-review correctness.

## Forbidden Claims

- Do not claim changed files prove functionality or code quality.
- Do not claim `READY_FOR_COMMIT_REVIEW` authorizes commit or push.
- Do not claim evidence-linked closure approves implementation, release, production, payment, auth, data, migration, security, privacy, compliance, or legal decisions.

## Evidence Status

- Release evidence recorded in `releases/1.33.0/self-check-report.md`.
- Final verification passed on 2026-06-30:
  - `node scripts/check-dev-kit.mjs`
  - `npm run verify`
  - `git diff --check`

## Known Limitations

- Evidence-link parsing is heuristic and based on recorded markdown reports.
- `--verification-file` classifies existing output; it does not execute the command by itself.
- Review-loop evidence is required for functional/code pass, but this release does not create a unified reviewer runner.
- Change-boundary refs are read from recorded reports; full diff policy enforcement remains in the existing change-boundary layer.
- Real production validation is still not claimed.

## Verification

See `releases/1.33.0/self-check-report.md`.
