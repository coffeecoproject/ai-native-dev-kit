# IntentOS 1.49.0 Known Limitations

## Summary

1.49.0 makes Change Impact Coverage more verifiable, but it remains a governance and evidence layer.

## Limitations

- It does not modify target-project code.
- It does not perform exhaustive static dependency analysis.
- It does not guarantee every possible impact is discovered.
- It does not replace human product judgment for deciding whether a surface is truly in or out of scope.
- It does not make strict structured evidence mandatory for old Markdown records unless `--require-structured-evidence` is used.
- It does not approve implementation, apply, commit, push, release, production, CI, hooks, migrations, payment, permission, data, privacy, security, tax, legal, or compliance work.
- It does not replace Safe Launch or production readiness checks.
- It does not make BL2 or industrial overlays active by default.

## Expected Use

Use `preflight` before implementation and `closure` after implementation. Use `--require-structured-evidence --mode closure --strict-evidence` for new strict close-out records when a task changes validation, API, backend, frontend, data, permission, release, or user-facing behavior.
