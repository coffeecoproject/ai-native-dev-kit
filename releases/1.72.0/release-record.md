# Release 1.72.0 - Execution Assurance Chain

## Summary

1.72.0 adds Execution Assurance Chain. Its purpose is to stop Codex from saying execution-class work is complete when the work only has partial implementation, weak evidence, stale evidence, no review, or patch-smell behavior.

The new chain covers more than code changes:

- feature work
- bug fixes
- safe patches
- old-project IntentOS adoption
- baseline setup
- document governance
- release preparation
- workflow capability changes

Core rule:

```text
No evidence chain, no verified completion.
```

## Added

- `core/execution-assurance-chain.md`
- `docs/execution-assurance-chain.md`
- `templates/execution-assurance-report.md`
- `schemas/artifacts/execution-assurance.schema.json`
- `checklists/execution-assurance-review.md`
- `prompts/execution-assurance-agent.md`
- `execution-assurance-reports/`
- `scripts/resolve-execution-assurance.mjs`
- `scripts/check-execution-assurance.mjs`
- CLI commands:
  - `execution-assurance`
  - `execution-assurance-check`
  - `done-check`
  - `verify-execution`

## Required Chain

An Execution Assurance Report binds:

- user intent
- normalized execution kind
- completion contract
- planned impact map
- execution plan binding
- actual diff binding
- evidence bindings
- independent review binding
- patch assessment
- source-system trace
- closure decision
- pending human decisions
- forbidden claims
- safety boundary

## Allowed Claims

- IntentOS 1.72.0 can generate and check Execution Assurance Reports.
- Execution Assurance can verify whether recorded execution evidence is sufficient to claim `VERIFIED_DONE`.
- Execution Assurance can block partial completion, patch-smell completion, broad safe-patch claims, unresolved evidence, stale evidence, missing review, and source-system gaps.
- Execution Assurance can be used for feature work, old-project adoption, baseline setup, document governance, release preparation, and workflow capability changes.

## Forbidden Claims

- Execution Assurance does not write target-project files by itself.
- Execution Assurance does not approve implementation beyond the recorded scope.
- Execution Assurance does not approve commit, push, release, production, deployment, CI mutation, hook mutation, migration, secrets, payment, provider action, or project authority transfer.
- Execution Assurance does not approve commit or push.
- Execution Assurance does not approve release or production.
- Execution Assurance does not prove product correctness, business correctness, release readiness, production safety, legal/compliance correctness, or human decision validity.
- Execution Assurance does not replace Change Impact Coverage, Review Loop, Adoption Assurance, Governance Convergence, Release Plan, Approval Record, Controlled Apply Readiness, or project-owned release SOPs.

## Known Limitations

- Execution Assurance validates recorded evidence chains; it does not independently inspect every possible project behavior or prove the product is correct.
- Execution Assurance can mark a report `VERIFIED_DONE` only for the recorded completion contract. It does not extend the task scope, approve follow-up work, or approve implementation beyond recorded scope.
- `--out` writes only the requested report file. It is not permission to modify target business code, CI, hooks, release configuration, secrets, migrations, provider state, or production data.
- Patch-smell detection is conservative. A blocked patch may still be valid work, but it needs a broader plan, explicit review, or human decision before it can be treated as complete.
- Upstream source systems remain authoritative. If Change Impact Coverage, Review Loop, Adoption Assurance, Governance Convergence, or Release Plan evidence is wrong, Execution Assurance does not make it correct.

## Evidence Status

- Resolver syntax is covered by `node --check scripts/resolve-execution-assurance.mjs`.
- Checker syntax is covered by `node --check scripts/check-execution-assurance.mjs`.
- Positive examples cover:
  - feature contract validation
  - old-project IntentOS adoption
  - safe copy patch
  - backend-only patch smell
- Bad fixtures cover missing completion contract, missing actual diff, unresolved evidence, stale evidence, patch-smell verified completion, unexpected CI/hook diff, broad safe patch, controlled patch without debt, missing review, adoption without source assurance, and release overclaim.
- Package verify and `check-dev-kit` include the 1.72 assets and strict example checks.

## Verification

The intended verification surface for 1.72.0 is:

```bash
node --check scripts/resolve-execution-assurance.mjs
node --check scripts/check-execution-assurance.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/old-project-intentos-adoption --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/safe-copy-patch --require-structured-evidence --require-evidence-refs --require-actual-diff
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/patch-smell-backend-only --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```
