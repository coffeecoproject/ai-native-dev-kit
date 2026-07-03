# IntentOS 1.57.0 Release Record

## Human Summary

1.57.0 adds Guided Release Adapter.

Plainly: when a beginner user wants to launch a project but does not know the release process, Codex can discover the project release shape, recommend a safe first target, record missing inputs, and bridge into Release Execution.

## Allowed Claims

- IntentOS can generate a read-only Release Adapter Profile.
- Guided Release Adapter can inspect project files for platform, build, test, deployment, environment, rollback, monitoring, owner, and evidence hints.
- Guided Release Adapter can recommend a beginner-friendly release target such as preview/test before production.
- Guided Release Adapter can explain missing release inputs in plain language.
- Guided Release Adapter can bridge into Release Execution Protocol.

## Forbidden Claims

- 1.57.0 does not approve release, production, publication, app-store review, mini-program review, customer rollout, rollback risk, or incident acceptance.
- 1.57.0 does not deploy, publish, submit, migrate, tag, merge, or release by itself.
- 1.57.0 does not ask for, store, copy, or validate secrets, tokens, passwords, private keys, or production credentials.
- 1.57.0 does not change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations.
- 1.57.0 does not make Codex the release owner or treat beginner confirmation as production approval.

## Evidence Status

- Plan: `docs/plans/guided-release-adapter-1.57-plan.md`
- Core: `core/release-adapter.md`
- Docs: `docs/release-adapter.md`
- Template: `templates/release-adapter-profile.md`
- Checklist: `checklists/release-adapter-review.md`
- Prompt: `prompts/release-adapter-agent.md`
- Resolver: `scripts/resolve-release-adapter.mjs`
- Checker: `scripts/check-release-adapter.mjs`
- Workflow directory: `release-adapters/`
- Good example: `examples/1.57-guided-release-adapter/web-vercel-preview`
- Bad fixtures: `test-fixtures/bad/bad-release-adapter-*`

## Added

- `core/release-adapter.md`
- `docs/release-adapter.md`
- `docs/plans/guided-release-adapter-1.57-plan.md`
- `templates/release-adapter-profile.md`
- `checklists/release-adapter-review.md`
- `prompts/release-adapter-agent.md`
- `release-adapters/`
- `scripts/resolve-release-adapter.mjs`
- `scripts/check-release-adapter.mjs`
- 1.57 example and bad fixtures

## Boundary

Guided Release Adapter is a discovery, translation, and planning layer. It is not a release owner, deployment engine, CI installer, secret manager, store-submission agent, migration runner, rollback approver, or production authority.

## Known Limitations

- Release discovery is heuristic and should be reviewed for unusual stacks.
- The adapter prepares and explains release setup; it does not execute production release.
- Provider-specific execution remains project SOP dependent.
- Secrets must stay outside IntentOS artifacts.
- It does not inspect live cloud consoles, app stores, DNS, payment systems, production logs, or monitoring dashboards.

## Verification

```bash
node --check scripts/resolve-release-adapter.mjs
node --check scripts/check-release-adapter.mjs
node scripts/cli.mjs release-adapter . --intent "prepare release adapter"
node scripts/check-release-adapter.mjs .
node scripts/check-release-adapter.mjs examples/1.57-guided-release-adapter/web-vercel-preview
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```
