# Release 1.70.0

## Theme

Existing Project Governance Convergence.

## Summary

1.70.0 adds a read-only convergence layer for old, governed, production-sensitive, or dirty projects.

It answers one practical question:

```text
How can this old project work closer to a new IntentOS project without replacing existing project authority?
```

## Added

- `core/existing-project-governance-convergence.md`
- `docs/existing-project-governance-convergence.md`
- `templates/governance-convergence-report.md`
- `schemas/artifacts/governance-convergence.schema.json`
- `checklists/governance-convergence-review.md`
- `prompts/governance-convergence-agent.md`
- `governance-convergence-reports/`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/check-governance-convergence.mjs`
- CLI commands:
  - `convergence`
  - `convergence-check`

## Governance Model

Governance Convergence consumes the existing old-project chain:

```text
workflow-next
native-migration
existing-rule-reconciliation
release-plan
```

It then summarizes convergence across:

- workflow
- baseline
- audit
- release
- CI/hooks
- documents
- work queue
- AI log policy
- protected authority

## Allowed Claims

- IntentOS can operate as the Codex working mode for old projects.
- Old projects can converge toward new-project daily workflow behavior.
- Existing stricter or project-owned rules can remain project-owned.
- Gaps can be proposed for merge or adoption after review.
- Target-project writes still require Unified Apply Plan, Approval Record, and Controlled Apply Readiness.

## Forbidden Claims

- Governance Convergence writes target-project files.
- Governance Convergence approves governance replacement.
- Governance Convergence approves implementation, release, or production.
- IntentOS replaces existing project release SOPs, CI, hooks, baseline files, business rules, or production controls.
- Old project history should be rewritten into IntentOS artifacts.
- AI logs should be created for every command.
- Migration should be maximized by default.

## Verification

Required verification for this release:

```bash
node --check scripts/resolve-governance-convergence.mjs
node --check scripts/check-governance-convergence.mjs
node scripts/cli.mjs convergence .
node scripts/cli.mjs convergence-check .
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/governed-web-admin --require-structured-evidence
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/production-multiplatform --require-structured-evidence
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked --require-structured-evidence
npm run verify
```

## Evidence Status

This release is supported by source-repository self-checks, strict example checks, bad-fixture rejection, manifest validation, and local verification commands.

It is not evidence of production deployment, production validation, external customer adoption, or correctness for every real old project.

## Known Limitations

- Governance Convergence is a derived read-only report, not an apply runner.
- It depends on upstream Workflow Next, Native Migration, Existing Rule Reconciliation, and Release Plan evidence.
- It does not prove every old project rule was discovered.
- It does not approve release, production, CI, hooks, secrets, provider state, migrations, data, permissions, payment, legal, tax, finance, HR, security, privacy, compliance, or business decisions.
- It does not rewrite old history or import historical evidence automatically.
- It does not make old projects identical to new projects; it gives a bounded convergence path.

## Boundary

This release remains non-executing. It does not add a migration runner, apply runner, CI mutator, hook installer, release executor, or target-project writer.
