# Test Evidence Installation And Schema Contract 1.77.2 Plan

## Goal

Close the remaining Test Evidence Binding distribution and schema-contract gaps after 1.77.1.

1.77.2 is a patch release. It does not add a new workflow layer, does not make IntentOS run tests, and does not make Execution Assurance consume Test Evidence by default.

## Problem

1.77.1 tightened Test Evidence behavior, but two contract signals still needed calibration:

- the Test Evidence schema still advertised `1.77.0` while requiring the stricter 1.77.1 shape;
- generated-project PR smoke visibly stopped at Verification Plan, even though source self-check already covered Test Evidence binding.

This can confuse maintainers and external reviewers because installed projects should prove the visible BRC -> CIC -> Verification Plan -> Test Evidence chain with the same strict binding rules.

## Scope

- Mark the strict Test Evidence artifact shape as schema `1.77.1`.
- Regenerate source example and bad fixture Test Evidence reports so their digests match the schema version.
- Add visible generated-project Test Evidence resolver/checker steps to the PR workflow.
- Add low-risk Markdown/JSON reason consistency checks for Test Evidence tables.
- Update release/version/readme/manifest references to `1.77.2`.

## Non-Goals

- Do not run project tests.
- Do not design tests automatically.
- Do not prove product correctness.
- Do not approve implementation, release, production, CI, hooks, secrets, payment, data migration, or provider changes.
- Do not make `TEST_EVIDENCE_COMPLETE` mean task, product, release, or production completion.
- Do not make Execution Assurance require Test Evidence by default.

## Required Changes

1. Schema contract
   - `schemas/artifacts/test-evidence.schema.json` uses `schemaVersion: 1.77.1`.
   - `schema_version` accepts `1.77.1`.
   - `scripts/resolve-test-evidence.mjs` emits `schema_version: 1.77.1`.

2. Existing evidence artifacts
   - The 1.77 source example and bad fixtures are regenerated to `schema_version: 1.77.1`.
   - `test_evidence_digest` values are recalculated after the schema-version change.

3. Generated-project smoke
   - The PR workflow generated-project smoke creates a task-bound evidence artifact from the generated Verification Plan obligations.
   - The smoke then runs `resolve-test-evidence.mjs`.
   - The smoke then runs `check-test-evidence.mjs` with structured evidence, Verification Plan ref, strict source binding, current evidence, and test-quality control requirements.

4. Consistency checks
   - Test Evidence Markdown/JSON comparison covers:
     - Coverage Map `reason`;
     - Test Quality Controls `reason`;
     - Known Gaps `reason` and `required_follow_up`;
     - Manual Verification `reason`;
     - Existing Project Mapping `reason`.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-test-evidence.mjs
node --check scripts/check-test-evidence.mjs
node scripts/check-test-evidence.mjs examples/1.77-test-evidence-binding/appointment-service-time --report test-evidence-reports/001-service-time.md --require-structured-evidence --require-verification-plan-ref --strict-source-binding --require-current-evidence --require-test-quality-controls
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Expected result:

- schema version and strict required shape no longer drift;
- generated-project smoke visibly proves BRC -> CIC -> Verification Plan -> Test Evidence strict binding;
- Test Evidence Markdown/JSON reason fields cannot drift silently;
- release evidence documents the remaining boundaries.
