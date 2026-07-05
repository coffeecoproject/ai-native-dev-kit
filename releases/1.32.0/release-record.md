# Release Record: 1.32.0

## Summary

`1.32.0` adds Execution Review Closure.

Codex can now close a completed task with a read-only report that summarizes changed files, review surfaces, verification evidence, scope boundary, debt, and commit-readiness state.

## Added

- `core/execution-review-closure.md`
- `docs/execution-review-closure.md`
- `templates/execution-closure-report.md`
- `checklists/execution-review-closure-review.md`
- `prompts/execution-closure-agent.md`
- `execution-closures/`
- `scripts/resolve-execution-closure.mjs`
- `scripts/check-execution-closure.mjs`
- CLI commands `closure` and `closure-check`
- Example and bad fixtures for execution closure

## Changed

- Deep guide can include execution closure when the project is dirty or the user intent is to finish, close, review, commit, or push work.
- README, script reference, CI smoke checks, manifest, and governance verification now include closure usage.

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

## Allowed Claims

- IntentOS can produce and check an Execution Closure Report.
- Execution Closure can identify whether closure is blocked, limited, needs human decision, or ready for commit review.
- Execution Closure keeps commit/push/release authority outside the report.

## Forbidden Claims

- Do not claim Execution Closure proves implementation correctness.
- Do not claim `READY_FOR_COMMIT_REVIEW` authorizes commit or push.
- Do not claim closure approves release, production, payment, auth, data, migration, security, privacy, compliance, or legal decisions.

## Evidence Status

- Release evidence is recorded in `releases/1.32.0/self-check-report.md`.
- `node scripts/check-intentos.mjs`, `npm run verify`, and `git diff --check` passed on 2026-06-29.

## Known Limitations

- Execution Closure is read-only and does not write target files.
- Closure state is based on available files, Git status, intent, and supplied verification notes; it is not authoritative proof of correctness.
- `READY_FOR_COMMIT_REVIEW` does not authorize commit or push.
- Execution Closure does not approve implementation, release, production, security, privacy, compliance, payment, migration, or data decisions.
- Real production validation is still not claimed.

## Verification

See `releases/1.32.0/self-check-report.md`.
