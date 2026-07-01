# IntentOS 1.48.0 Known Limitations

## Summary

1.48.0 improves coverage discipline for cross-surface changes, but it remains a governance and evidence layer.

## Limitations

- It does not modify target-project code.
- It does not run a full semantic scan of every project file.
- It does not guarantee every possible impact is discovered.
- It does not replace human product judgment for deciding whether a surface is truly in or out of scope.
- It does not approve implementation, apply, commit, push, release, production, CI, hooks, migrations, payment, permission, data, privacy, security, tax, legal, or compliance work.
- It does not replace Safe Launch or production readiness checks.
- It does not make BL2 or industrial overlays active by default.

## Expected Use

Use Change Impact Coverage before or during close-out of rule, validation, API, backend, data, permission, error-copy, or business-behavior changes. Treat the result as an impact map and evidence checklist, not as permission to proceed.
