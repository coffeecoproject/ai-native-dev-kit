# IntentOS 1.58.0 Release Record

## Human Summary

1.58.0 adds Release Guide Consolidation.

Plainly: when a user says "help me launch", Codex now has one release entry that routes across Release Adapter, Launch Review View, structured approval, and Release Execution without making the user choose internal commands.

## Allowed Claims

- IntentOS can generate a read-only Release Guide Card.
- Release Guide can route launch intent across existing release systems.
- Release Guide can require structured release approval before execution readiness.
- Release Guide can classify assist level and command risk.
- Release Guide can distinguish evidence visibility from evidence quality.
- Release Guide can bridge to Release Execution in PLAN_ONLY mode.

## Forbidden Claims

- 1.58.0 does not approve release, production, publication, app-store review, mini-program review, customer rollout, rollback risk, or incident acceptance.
- 1.58.0 does not deploy, publish, submit, migrate, tag, merge, or release by itself.
- 1.58.0 does not ask for, store, copy, or validate secrets, tokens, passwords, private keys, or production credentials.
- 1.58.0 does not change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations.
- 1.58.0 does not treat free-form approval text as release approval.
- 1.58.0 does not make Codex the release owner.

## Evidence Status

- Plan: `docs/plans/release-path-consolidation-1.58-plan.md`
- Roadmap: `docs/plans/release-path-consolidation-1.58-1.60-plan.md`
- Core: `core/release-guide.md`
- Docs: `docs/release-guide.md`
- Template: `templates/release-guide-card.md`
- Approval template: `templates/release-approval-record.md`
- Checklist: `checklists/release-guide-review.md`
- Prompt: `prompts/release-guide-agent.md`
- Resolver: `scripts/resolve-release-guide.mjs`
- Checker: `scripts/check-release-guide.mjs`
- Workflow directory: `release-guides/`
- Good example: `examples/1.58-release-guide-consolidation/web-preview-release-guide`
- Bad fixtures: `test-fixtures/bad/bad-release-guide-*`

## Added

- `core/release-guide.md`
- `docs/release-guide.md`
- `docs/plans/release-path-consolidation-1.58-plan.md`
- `templates/release-guide-card.md`
- `templates/release-approval-record.md`
- `checklists/release-guide-review.md`
- `prompts/release-guide-agent.md`
- `release-guides/`
- `scripts/resolve-release-guide.mjs`
- `scripts/check-release-guide.mjs`
- 1.58 example and bad fixtures

## Boundary

Release Guide is a routing, explanation, approval-shape, and evidence-quality layer. It is not a release owner, deployment engine, CI installer, secret manager, provider API executor, store-submission agent, migration runner, rollback approver, or production authority.

## Known Limitations

- Release Guide is not a deployment tool and does not execute provider, store, CI/CD, DNS, migration, or production commands.
- Structured approval shape is required for release execution readiness, but approval validity remains human-owned.
- Lower-level Release Execution records remain backward-compatible; the stricter structured approval gate lives in the Release Guide layer.
- Evidence quality checks reject missing, placeholder, or weak references but do not inspect live cloud consoles, app stores, DNS, payment systems, production logs, or monitoring dashboards.
- Platform release recipes are intentionally deferred to 1.59, and Release Handoff Packs are intentionally deferred to 1.60.

## Verification

```bash
node --check scripts/resolve-release-guide.mjs
node --check scripts/check-release-guide.mjs
node scripts/cli.mjs release-guide . --intent "help me launch"
node scripts/check-release-guide.mjs .
node scripts/check-release-guide.mjs examples/1.58-release-guide-consolidation/web-preview-release-guide
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
