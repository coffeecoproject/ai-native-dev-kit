# Release Handoff Pack Review

- [ ] Pack records selected recipe, release target, execution level, and release owner.
- [ ] Pack requires structured `RELEASE_APPROVAL`.
- [ ] `Codex May Run` defaults to none unless local-safe actions are explicitly approved.
- [ ] Production, store, mini-program, migration, DNS, payment, permissions, secrets, CI/CD, and production config actions remain human/external-system owned.
- [ ] Rollback evidence, monitoring evidence, post-release smoke, and close-out evidence are present.
- [ ] Pack does not approve release, execute release commands, request secrets, or make Codex the release owner.
