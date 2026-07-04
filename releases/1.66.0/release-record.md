# Release 1.66.0

## Summary

1.66.0 adds Existing Rule Reconciliation Calibration.

The release extends Native-First Existing Project Migration with a recommendation-only comparison step:

```text
Native Migration Plan
Existing Rule Reconciliation
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
```

This means Codex can compare an existing project's rules against IntentOS references, but it still cannot replace existing governance, production controls, release SOPs, business rules, or protected project constraints by itself.

## Added

- `core/existing-rule-reconciliation.md`
- `docs/existing-rule-reconciliation.md`
- `templates/existing-rule-reconciliation-report.md`
- `schemas/artifacts/existing-rule-reconciliation.schema.json`
- `checklists/existing-rule-reconciliation-review.md`
- `prompts/existing-rule-reconciliation-agent.md`
- `existing-rule-reconciliations/`
- `rule-reconciliation-calibration-reports/`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/check-existing-rule-reconciliation.mjs`
- CLI entries:
  - `reconcile-rules`
  - `reconcile-rules-check`
- Positive example:
  - `examples/1.66-existing-rule-reconciliation/governed-web-admin`
- Bad fixtures for:
  - release SOP replacement
  - business rules treated as engineering baseline
  - target writes authorized by a reconciliation report
  - skipped apply / approval chain
  - production rules where "IntentOS wins"
  - protected constraints without a real owner
  - release gap suggestions treated as approval
  - release / production `ADOPT_INTENTOS`
  - `MERGE` without preserved existing terms

## Rules

Existing Rule Reconciliation may recommend:

- `KEEP_EXISTING`
- `ADOPT_INTENTOS`
- `MERGE`
- `NEEDS_HUMAN_DECISION`
- `NO_INTENTOS_MATCH`
- `NO_EXISTING_RULE`
- `CONFLICT_HIGH_RISK`
- `UNKNOWN_AUTHORITY`
- `GAP_SUGGESTION`

Release / production surfaces are restricted to:

- `KEEP_EXISTING`
- `GAP_SUGGESTION`
- `NEEDS_HUMAN_DECISION`
- `CONFLICT_HIGH_RISK`
- `UNKNOWN_AUTHORITY`

Release / production surfaces cannot use `ADOPT_INTENTOS` or `MERGE`.

`MERGE` means a future reviewed wording proposal. It does not write files, replace old rules, approve apply, or approve implementation.

`GAP_SUGGESTION` means "record a gap for release review". It is not release approval.

## Allowed Claims

- IntentOS can compare existing project rule classifications from Native Migration Plans against IntentOS reference rules.
- IntentOS can recommend whether an existing rule should be kept, whether a low-risk engineering baseline gap can adopt IntentOS wording, whether future merge wording is needed, or whether a human decision is required.
- IntentOS can record release / production gaps as review suggestions without treating them as approval.
- IntentOS can reject strict reconciliation reports that try to replace release SOPs, downgrade business rules into engineering baselines, skip the apply / approval chain, or treat gap suggestions as approval.
- IntentOS can keep business, protected, production, and release authority outside automatic workflow replacement.

## Forbidden Claims

1.66 does not:

- prove every existing project rule was found
- prove existing governance is fully reconciled
- authorize target-project writes
- approve governance replacement
- approve implementation, release, production, deploy, publish, upload, submit review, migration, hook installation, CI change, or provider API calls
- replace business rules, protected constraints, release SOPs, production controls, `AGENTS.md`, CI, hooks, release workflows, secrets, provider state, customer data, permissions, privacy, security, compliance, payment, tax, finance, HR, legal, production data, or production config
- make IntentOS the automatic winner over existing project authority
- turn reconciliation output, structured evidence, `ADOPT_INTENTOS`, `MERGE`, or `GAP_SUGGESTION` into human approval

## Evidence Status

- `docs/plans/existing-rule-reconciliation-calibration-1.66-plan.md` records the execution and acceptance plan.
- `core/existing-rule-reconciliation.md` and `docs/existing-rule-reconciliation.md` define the recommendation-only protocol.
- `templates/existing-rule-reconciliation-report.md` defines the human report format.
- `schemas/artifacts/existing-rule-reconciliation.schema.json` defines the structured evidence contract.
- `scripts/resolve-existing-rule-reconciliation.mjs` emits reconciliation recommendations from Native Migration Plan input.
- `scripts/check-existing-rule-reconciliation.mjs` validates report boundaries, recommendation outcomes, protected constraints, release / production limits, and strict structured evidence.
- `examples/1.66-existing-rule-reconciliation/governed-web-admin` proves the positive governed-project path.
- `test-fixtures/bad/bad-rule-reconciliation-*` proves unsafe reconciliation records are rejected.
- `releases/1.66.0/self-check-report.md` records final verification commands and result.

## Known Limitations

- Reconciliation is only as complete as the previous Native Migration Plan input.
- Existing project release and production rules remain human-owned or external-system-owned.
- `ADOPT_INTENTOS` is limited to low/medium-risk engineering baseline gaps.
- `MERGE` is a future reviewed wording proposal; it is not a write operation.
- `GAP_SUGGESTION` is release-review input; it is not release approval.
- Checker validation does not prove the real project rules are semantically complete.
- Applying any wording change remains outside 1.66 and still requires Unified Apply Plan, Controlled Apply Readiness, Approval Record, and human approval.

## Boundaries

1.66.0 does not:

- write target-project files
- replace existing governance
- overwrite `AGENTS.md`
- modify CI or hooks
- replace release SOPs
- approve implementation
- approve release or production
- deploy, publish, upload, submit review, run migrations, or call provider APIs
- request or store secrets
- change business rules, customer data, permissions, privacy, security, compliance, payment, tax, finance, HR, legal, production data, production config, or provider state

## Verification

Planned verification:

```bash
node --check scripts/resolve-existing-rule-reconciliation.mjs
node --check scripts/check-existing-rule-reconciliation.mjs
node scripts/check-existing-rule-reconciliation.mjs .
node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence
node scripts/cli.mjs reconcile-rules .
node scripts/cli.mjs reconcile-rules-check .
npm run verify:syntax
npm run verify:governance
npm run verify:examples
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

Final verification is recorded in `self-check-report.md`.
