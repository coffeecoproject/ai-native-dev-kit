# 1.74.3 Release Record

## Release

Version: `1.74.3`

Theme: Execution Assurance Log And Markdown Consistency

## Summary

1.74.3 is the Execution Assurance Log And Markdown Consistency patch.

It closes the 1.74 strict-binding line by improving maintainer log clarity and
cross-checking the human-readable report tables against machine-readable JSON
evidence.

## Changes

- Renamed combined Execution Assurance self-check output labels from `1.72
  execution assurance` to `1.72-1.74 execution assurance`.
- Added Markdown/JSON consistency checks for `Execution Plan Binding`.
- Added Markdown/JSON consistency checks for `Actual Diff Binding`.
- Added Markdown/JSON consistency checks for `Evidence Binding`.
- Added a bad fixture for Markdown `Plan Ref` drifting from JSON
  `execution_plan.plan_ref`.
- Updated version metadata to `1.74.3`.

## Existing Project Boundary

1.74.3 does not change existing-project adoption authority. Old projects can be
read and planned in IntentOS mode, but target-project writes still require
Native Migration, Existing Rule Reconciliation, Unified Apply Plan, approval,
and Controlled Apply Readiness.

## Allowed Claims

- IntentOS 1.74.3 makes Execution Assurance self-check logs clearer by naming
  the combined 1.72-1.74 assurance line.
- IntentOS 1.74.3 rejects Execution Assurance reports where Markdown
  Execution Plan, Actual Diff, or Evidence Binding tables drift from the
  machine-readable JSON evidence.
- IntentOS 1.74.3 keeps the 1.74.0 Execution Assurance report shape compatible.

## Forbidden Claims

- 1.74.3 does not prove any real project task is complete.
- 1.74.3 does not approve implementation, target-project writes, commit, push,
  release, production, CI/hook mutation, secrets, migrations, provider actions,
  app-store submission, mini-program submission, payment, permission, finance,
  tax, HR, legal, compliance, or customer-data decisions.
- 1.74.3 does not make Markdown tables authoritative over JSON evidence.
- 1.74.3 does not require ordinary users to choose internal proof-chain
  commands.

## Evidence Status

- Markdown/JSON consistency coverage is repository-local and checked by
  `node scripts/check-execution-assurance.mjs`.
- The Markdown/JSON plan-ref mismatch fixture proves report body drift is
  rejected.
- Positive Execution Assurance examples prove existing standard reports remain
  compatible.
- Manifest coverage is verified by `node scripts/check-manifest.mjs`.
- Evidence remains local to this repository and does not represent a real
  external project delivery claim.

## Known Limitations

- 1.74.3 is a hardening patch, not a new assurance model or execution runner.
- Execution Assurance reports still use `schema_version: 1.74.0` by design.
- Markdown/JSON consistency checks cover Execution Plan Binding, Actual Diff
  Binding, and Evidence Binding only.
- Generated-project smoke proves installed assets and same-report checking are
  runnable; it does not prove a real external project has adopted IntentOS or
  completed a feature.
- IntentOS still does not approve target-project writes, implementation,
  commit/push, release, production, CI/hooks, secrets, migrations, providers, or
  high-risk business decisions.

## Compatibility

The Execution Assurance artifact schema version remains `1.74.0`.

This release does not require report producers to emit new fields. It only
requires the existing human-readable Markdown tables to match existing
machine-readable JSON evidence.

## Verification

Required checks:

```bash
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch --require-structured-evidence
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify
git diff --check
```

The bad fixture must fail. The other checks must pass.

## Boundaries

This release does not write target-project files, approve implementation,
approve commit or push, approve release or production, mutate CI/hooks, touch
secrets, run migrations, call providers, approve high-risk decisions, or replace
project authority.

JSON remains the machine-checkable authority. Markdown tables are checked for
consistency so human review does not drift from the authoritative evidence.
