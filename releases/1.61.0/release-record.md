# 1.61.0 Release Record

## Human Summary

1.61.0 hardens the release path after Release Handoff Packs. It does not add another release subsystem. It clarifies that Release Handoff Pack is the release handoff source of truth, while Release Execution is a plan-only consumer.

## Added

- `core/release-path-hardening.md`
- `docs/release-path-hardening.md`
- `docs/plans/release-path-hardening-1.61-plan.md`
- `schemas/artifacts/release-handoff-evidence.schema.json`
- strict Release Handoff Pack structured evidence checks
- Release Guide lazy handoff routing
- handoff-ready language that says ready for handoff review, not release approval

## Changed

- Release Handoff Pack output now includes Machine-Readable Evidence.
- Release Handoff Pack strict mode validates structured approval, release owner, rollback, monitoring, post-release smoke, and handoff/execution boundaries.
- Release Guide defers handoff generation when prerequisites are missing.
- Release Execution docs now state that handoff owns release owner/evidence facts.

## Allowed Claims

- IntentOS can prepare a structured release handoff package.
- IntentOS can validate strict release handoff evidence.
- Release Guide can defer handoff until prerequisites are ready.
- Release Execution can consume handoff facts in plan-only mode.

## Forbidden Claims

- 1.61 approves release.
- 1.61 executes release commands.
- 1.61 deploys, publishes, uploads, submits, migrates, or mutates remote state.
- 1.61 validates live provider state.
- 1.61 stores secrets.
- 1.61 makes Codex the release owner.

## Evidence Status

- `docs/plans/release-path-hardening-1.61-plan.md` records the execution and acceptance plan.
- `core/release-path-hardening.md` and `docs/release-path-hardening.md` define the source-of-truth relationship between Release Handoff Packs and Release Execution.
- `schemas/artifacts/release-handoff-evidence.schema.json` defines strict release handoff evidence.
- `examples/1.60-release-handoff-packs/*` demonstrate strict structured handoff evidence.
- `test-fixtures/bad/bad-release-handoff-missing-structured-evidence` proves strict mode rejects Markdown-only handoff packs.
- `test-fixtures/bad/bad-release-handoff-execution-redefines-evidence` proves strict mode rejects execution-boundary redefinition.
- `releases/1.61.0/self-check-report.md` records verification commands and final result.

## Known Limitations

- Structured release handoff evidence validates recorded fields, not live provider state.
- Release Guide can defer handoff, but it cannot prove a project is safe to publish.
- Release Execution remains plan-only unless a real project policy and human owner approve a safe path.
- Provider APIs, uploads, app-store/mini-program submission, production deployment, production migrations, DNS, payment, permissions, production config, and secrets remain outside Codex ownership.

## Verification

See `releases/1.61.0/self-check-report.md`.
