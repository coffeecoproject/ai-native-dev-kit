# Release 1.71.3 - Adoption Assurance Evidence Closure

## Summary

1.71.3 closes the remaining Adoption Execution Assurance evidence gaps from the 1.71 line. It keeps the old-project adoption goal unchanged: Codex can work in IntentOS mode for an old project only when the claim is backed by source-system evidence, surface coverage, and a read-only simulation.

This patch focuses on the evidence closure path:

- `resolve-adoption-assurance.mjs` and `resolve-governance-convergence.mjs` support explicit `--out <relative-report-path>` report writing.
- Adoption Assurance strict checks require every structured surface evidence ref to appear in `evidence_refs`.
- Unknown evidence ref prefixes now fail instead of being silently ignored.
- Project-authority blocking in Adoption Assurance uses typed `authority_block` source evidence instead of broad text scanning.
- Documentation indexes now expose the old-project sequence: Workflow Adapter -> Native Migration -> Existing Rule Reconciliation -> Governance Convergence -> Adoption Assurance.

## Allowed Claims

- IntentOS 1.71.3 improves old-project adoption assurance evidence closure.
- Generated convergence and assurance reports can be saved explicitly and checked as the same file.
- Adoption Assurance strict mode rejects unlisted surface evidence and unknown evidence ref prefixes.
- Adoption Assurance project-authority blocking is based on typed source fields, not broad prose matching.

## Forbidden Claims

- IntentOS 1.71.3 does not approve implementation, release, production, deployment, CI mutation, hook mutation, data migration, secrets, payment, compliance, or project authority transfer.
- `--out` does not authorize target-project business-code writes or governance replacement.
- Adoption Assurance does not prove product correctness, business correctness, release readiness, or production safety.
- Adoption Assurance does not replace Native Migration, Existing Rule Reconciliation, Governance Convergence, Release Plan, Unified Apply Plan, Approval Record, or Controlled Apply Readiness.

## Evidence Status

- Resolver syntax is covered by `node --check scripts/resolve-adoption-assurance.mjs` and `node --check scripts/resolve-governance-convergence.mjs`.
- Checker syntax is covered by `node --check scripts/check-adoption-assurance.mjs`.
- Positive Adoption Assurance examples cover verified, partial, blocked, and failed assurance states.
- Bad fixtures cover unknown evidence prefixes and surface evidence missing from `evidence_refs`.
- `check-dev-kit` verifies an explicit `--out` generated Adoption Assurance report and checks that same file.

## Known Limitations

- Adoption Assurance is still a governance-evidence check; it does not prove that the old project is correct, complete, releasable, or production-safe.
- `--out` writes only the requested report file and does not authorize business-code changes, CI changes, release changes, or governance replacement.
- Typed `authority_block` improves source handling, but it still depends on upstream Native Migration, Rule Reconciliation, Governance Convergence, and Release Plan reports being accurate.
- The 1.71.3 checks validate recorded reports and fixtures; they do not automatically inspect or modify arbitrary old-project files outside the declared evidence chain.

## Verification

The following commands were used as the intended verification surface for 1.71.3:

```bash
node --check scripts/resolve-adoption-assurance.mjs
node --check scripts/resolve-governance-convergence.mjs
node --check scripts/check-adoption-assurance.mjs
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-unknown-evidence-prefix --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-surface-evidence-not-in-evidence-refs --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```
