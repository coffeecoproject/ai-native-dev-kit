# Release 1.70.1

## Theme

Governance Convergence Evidence Consistency Hardening.

## Summary

1.70.1 tightens the 1.70 Governance Convergence layer.

It answers one practical question:

```text
Can a convergence report claim readiness when its human summary, Markdown table, JSON evidence, upstream source status, and outcome disagree?
```

The answer is no.

## Changed

- `schemas/artifacts/governance-convergence.schema.json` now requires all 9 convergence dimensions in structured evidence.
- `templates/governance-convergence-report.md` now includes complete machine-readable dimension evidence by default.
- `scripts/resolve-governance-convergence.mjs` now emits schema `1.70.1`, structured upstream source evidence, and a blocked state for unresolved upstream source input.
- `scripts/check-governance-convergence.mjs` now cross-checks Human Summary, Markdown dimensions, Machine-Readable Evidence, source-system status, and Outcome.
- `scripts/check-dev-kit.mjs` now checks generated strict Governance Convergence reports with explicit `--report` input.
- PR and release generated-project smoke checks now exercise `convergence`, `convergence-check`, resolver output, and explicit report checking.

## Added Fixtures

- `bad-governance-convergence-upstream-ready`
- `bad-governance-convergence-summary-json-state-mismatch`
- `bad-governance-convergence-dimensions-mismatch`
- `bad-governance-convergence-schema-one-dimension`

## Allowed Claims

- Strict Governance Convergence reports now require complete structured dimensions.
- Strict checks now reject upstream `BLOCKED` / `NEEDS_INPUT` source systems when the report still claims ready or partial convergence.
- Strict checks now reject mismatch between human-facing summary, Markdown dimensions, machine-readable evidence, and final outcome.
- Generated-project smoke now covers the convergence command path.

## Forbidden Claims

- 1.70.1 proves old-project adoption is complete.
- 1.70.1 writes target-project files.
- 1.70.1 approves governance replacement, release, production, CI, hooks, secrets, migrations, payment, permissions, business rules, or protected authority changes.
- A passing Governance Convergence report means a project is fully migrated to IntentOS.
- Source-system evidence resolution means the upstream system is correct.

## Verification

Required verification for this release:

```bash
node --check scripts/resolve-governance-convergence.mjs
node --check scripts/check-governance-convergence.mjs
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/governed-web-admin --require-structured-evidence
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/production-multiplatform --require-structured-evidence
node scripts/check-governance-convergence.mjs examples/1.70-existing-project-governance-convergence/dirty-worktree-blocked --require-structured-evidence
node scripts/resolve-governance-convergence.mjs . > /tmp/governance-convergence.md
node scripts/check-governance-convergence.mjs . --report /tmp/governance-convergence.md --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Evidence Status

This release is supported by source-repository self-checks, strict examples, bad-fixture rejection, generated-report checking, manifest validation, and generated-project smoke coverage.

It is not evidence of production deployment, production validation, external customer adoption, complete old-project migration, or correctness for every real old project.

## Known Limitations

- Governance Convergence remains a derived read-only view, not an apply mechanism.
- Strict evidence consistency proves report alignment, not product correctness or full old-project adoption.
- Upstream source status can block convergence, but it does not prove the upstream source is complete or correct.
- A passing strict report does not approve target-project writes, governance replacement, release, production, CI/hooks, secrets, migrations, payment, permissions, business rules, or protected authority changes.
- It does not automatically write an adoption anchor, AI log, migration plan, rule reconciliation, apply plan, approval record, or target-project workflow assets.
- It does not import historical evidence, archive old documents, rewrite links, or make old projects identical to new projects.

## Boundary

This release remains non-executing. It does not add a migration runner, apply runner, CI mutator, hook installer, release executor, or target-project writer.
