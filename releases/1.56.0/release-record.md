# IntentOS 1.56.0 Release Record

## Human Summary

1.56.0 adds Release Execution Protocol.

Plainly: 1.55 says whether work can enter launch review. 1.56 turns approved launch review into a bounded release execution plan with step ownership, stop conditions, and evidence capture.

## Allowed Claims

- IntentOS can generate a read-only Release Execution Plan.
- Release Execution depends on Launch Review View and Human Release Approval.
- Release Execution supports `PLAN_ONLY`, `HUMAN_EXECUTION_HANDOFF`, `ASSISTED_EXECUTION`, and `BLOCKED` modes.
- `ASSISTED_EXECUTION` only means Codex may help with explicitly allowed low-risk steps after approval.
- High-risk production actions remain human-owned or external-release-system-owned by default.

## Forbidden Claims

- 1.56.0 does not approve release, production, publication, app-store review, mini-program review, customer rollout, rollback risk, or incident acceptance.
- 1.56.0 does not deploy, publish, submit, migrate, tag, merge, or release by itself.
- 1.56.0 does not change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations.
- 1.56.0 does not replace Launch Review View, Unified Closure, Safe Launch, release SOPs, release owners, rollback owners, or incident owners.
- 1.56.0 does not make Codex the release owner or treat a user confirmation as blanket production authorization.

## Evidence Status

- Plan: `docs/plans/release-execution-protocol-1.56-plan.md`
- Core: `core/release-execution-protocol.md`
- Docs: `docs/release-execution-protocol.md`
- Template: `templates/release-execution-plan.md`
- Checklist: `checklists/release-execution-review.md`
- Prompt: `prompts/release-execution-agent.md`
- Resolver: `scripts/resolve-release-execution.mjs`
- Checker: `scripts/check-release-execution.mjs`
- Workflow directory: `release-execution-plans/`
- Good example: `examples/1.56-release-execution/web-assisted-handoff`
- Bad fixtures: `test-fixtures/bad/bad-release-execution-*`

## Added

- `core/release-execution-protocol.md`
- `docs/release-execution-protocol.md`
- `docs/plans/release-execution-protocol-1.56-plan.md`
- `templates/release-execution-plan.md`
- `checklists/release-execution-review.md`
- `prompts/release-execution-agent.md`
- `release-execution-plans/`
- `scripts/resolve-release-execution.mjs`
- `scripts/check-release-execution.mjs`
- 1.56 example and bad fixtures

## Boundary

Release Execution Protocol is a plan and evidence layer, not a release owner, deployment engine, store-submission agent, migration runner, rollback approver, or production authority.

## Known Limitations

- It does not inspect live production systems, app stores, cloud consoles, DNS, secrets, payment systems, monitoring dashboards, or release platforms.
- It depends on recorded Launch Review View and Human Release Approval evidence being accurate.
- It can classify step ownership, but it cannot guarantee a project release SOP is operationally correct.
- It does not prove business, security, legal, privacy, compliance, tax, finance, or payment readiness.

## Verification

```bash
node --check scripts/resolve-release-execution.mjs
node --check scripts/check-release-execution.mjs
node scripts/cli.mjs release-execution . --intent "prepare release execution"
node scripts/check-release-execution.mjs .
node scripts/check-release-execution.mjs examples/1.56-release-execution/web-assisted-handoff
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
