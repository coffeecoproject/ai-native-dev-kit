# IntentOS 1.100.0 Known Limitations

## External Effects

IntentOS can prepare, verify, and explain a release path, but provider-side
deployment, store submission, production migration, rollback execution,
secrets, DNS, payment, and irreversible production actions remain external
effects. Repository evidence cannot prove that those effects succeeded.

## Business Reality

Task and evidence consumers prove structural and project-local consistency.
They do not prove that a business rule is desirable, legally valid, or correct
in every real-world situation. Missing business facts still have to come from
the user when they cannot be inferred from the project.

## Existing Projects

Deep discovery is bounded at 100,000 entries and 20 directory levels. Crossing
either bound stops the review instead of silently omitting files. IntentOS does
not replace stronger project-owned CI, release, data, permission, or production
rules without an exact reviewed migration plan.

## Installed CI

The installed consumer chain treats one changed report per evidence family as
the current PR evidence. A PR containing multiple independent implementation
tasks should be split or explicitly reorganized before it can pass that gate.

## Platform Verification

Starter verification reports unavailable project-native tools or setup as a
failure. IntentOS does not fabricate a passing build, simulator, provider, or
production check when the required environment is unavailable.

## Concurrent Work

The shared source worktree may contain unregistered files from another task.
Final release verification uses an isolated snapshot containing only this
release's intended files; unrelated files are neither registered nor modified.
