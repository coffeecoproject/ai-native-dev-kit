# 1.60.0 Release Record

## Human Summary

1.60.0 adds Release Handoff Packs. Release Guide can now bridge from platform recipe selection into a bounded handoff package that separates Codex, human, and external-system responsibility.

## Added

- `core/release-handoff-packs.md`
- `docs/release-handoff-packs.md`
- `templates/release-handoff-pack.md`
- `checklists/release-handoff-pack-review.md`
- `prompts/release-handoff-pack-agent.md`
- `release-handoff-packs/`
- `scripts/resolve-release-handoff-pack.mjs`
- `scripts/check-release-handoff-pack.mjs`
- CLI entries: `release-handoff`, `release-handoff-check`
- Release Guide bridge into Release Handoff Pack
- examples:
  - web hosted preview handoff
  - mini-program review handoff
  - backend/API release handoff
- bad fixtures for unsafe handoff patterns

## Allowed Claims

- IntentOS can prepare a bounded release handoff pack.
- Handoff packs distinguish Codex, human, and external-system ownership.
- Handoff packs require selected recipe, structured approval, release owner, rollback evidence, monitoring evidence, and close-out evidence.
- `Codex May Run` defaults to none unless local-safe actions are explicitly approved and classified.

## Forbidden Claims

- 1.60 approves release.
- 1.60 executes release commands.
- 1.60 deploys, publishes, uploads, submits, migrates, or mutates remote state.
- 1.60 runs provider API commands.
- 1.60 asks for or stores secrets.
- 1.60 makes Codex the release owner.
- 1.60 turns structured approval into blanket authorization.

## Evidence Status

- Source handoff pack assets added.
- Source examples added.
- Bad fixtures added for unsafe handoff patterns.
- Checker rejects production actions in `Codex May Run`, missing structured approval, missing owner, missing rollback, missing monitoring, secret requests, remote-state commands, store/mini-program actions assigned to Codex, and production migrations assigned to Codex.

## Boundary

Release Handoff Packs are handoff packages, not release execution packs.

## Known Limitations

- 1.60 does not integrate provider APIs.
- 1.60 does not run production release actions.
- 1.60 does not submit app-store or mini-program review.
- 1.60 does not execute database migrations.
- 1.60 does not manage secrets.

## Verification

See `releases/1.60.0/self-check-report.md`.
