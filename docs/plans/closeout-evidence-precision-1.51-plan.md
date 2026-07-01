# Close-Out Evidence Precision 1.51 Plan

## Human Summary

1.51 strengthens the 1.50 close-out chain.

1.50 can prove:

```text
The evidence reference exists.
The Execution Closure links a strict Change Impact Coverage report.
```

1.51 must prove, in strict mode:

```text
The linked report is the exact current task report.
The linked report has the expected artifact type.
DONE evidence resolves to concrete, non-placeholder proof.
Recorded artifact and human-decision references resolve to real project records.
```

This is still a read-only verification layer. It does not apply changes, approve commits, approve release, or replace human judgment.

## Problem

After 1.50, a false close-out can still happen in stricter projects:

1. Execution Closure links any existing Change Impact Coverage report, not necessarily the current task report.
2. `artifact:<id>` and `human-decision:<id>` can be accepted as recorded references without proving the record exists.
3. Evidence files can exist but contain placeholder or empty content.
4. A stale report from a previous task can satisfy "report exists" checks.

The result is subtle: the workflow looks closed, but the evidence may belong to another task or be too weak to support closure.

## Goals

- Add precise strict mode for Change Impact Coverage evidence references.
- Add exact report selection through a single-report checker path.
- Require strict Execution Closure to validate the linked Change Impact Coverage report, not any report in the project.
- Require linked Change Impact Coverage to match the current closure task or intent when precision mode is enabled.
- Resolve `artifact:<id>` and `human-decision:<id>` to actual project records in precision mode.
- Reject empty, placeholder, or weak evidence files in precision mode.
- Add good and bad fixtures proving the new behavior.
- Keep all new precision checks opt-in.

## Non-Goals

- Do not write target-project files.
- Do not scan every code path or perform full static analysis.
- Do not judge product correctness or release readiness.
- Do not call external GPT/API reviewers.
- Do not automatically fix missing surfaces.
- Do not require historical Markdown reports to migrate.
- Do not make precision checks mandatory outside explicit strict flags.

## User-Facing Behavior

Default behavior remains compatible:

```bash
node scripts/check-change-impact-coverage.mjs .
node scripts/check-execution-closure.mjs .
```

Strict evidence reference resolution from 1.50 remains valid:

```bash
node scripts/check-change-impact-coverage.mjs . \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs
```

1.51 precision mode adds:

```bash
node scripts/check-change-impact-coverage.mjs . \
  --report change-impact-coverage-reports/001-contract-input-rule.md \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs \
  --require-precise-evidence
```

Execution Closure precision mode adds:

```bash
node scripts/check-execution-closure.mjs . \
  --require-impact-coverage \
  --require-precise-evidence
```

## Precision Rules

When `--require-precise-evidence` is enabled:

1. File evidence must resolve inside the project root.
2. `command-output:<path>` must point to a project-local evidence file.
3. Resolved evidence files must contain meaningful, non-placeholder content.
4. `artifact:<id-or-path>` must resolve to a concrete Markdown artifact or exact project-local file.
5. `human-decision:<id-or-path>` must resolve to a concrete approval or decision artifact.
6. Execution Closure must validate the exact linked Change Impact Coverage report with `--report`.
7. A linked Change Impact Coverage report must be type `change_impact_coverage`.
8. The closure `Related task card` or `User intent` must match the linked report `task_ref` or intent.
9. Precision mode remains read-only and cannot approve implementation, commit, push, release, production, or high-risk decisions.

## Implementation Plan

1. Update `scripts/check-change-impact-coverage.mjs`.
   - Add `--report`.
   - Add `--require-precise-evidence`.
   - Restrict checks to the selected report when `--report` is provided.
   - Add precise evidence resolution for files, command output, artifact refs, and human-decision refs.
   - Reject weak resolved evidence files.

2. Update `scripts/check-execution-closure.mjs`.
   - Add `--require-precise-evidence`.
   - Resolve the exact linked Change Impact Coverage report.
   - Run strict Change Impact Coverage against the exact report.
   - Check current task or intent alignment in precision mode.

3. Add fixtures and examples.
   - Keep the existing 1.49 structured example as the good precision example.
   - Add bad fixture for stale impact report mismatch.
   - Add bad fixture for weak evidence file content.
   - Add bad fixture for unresolved recorded artifact reference.

4. Update docs and release metadata.
   - Update README / README.zh-CN.
   - Update VERSION, package, manifest, and release records.
   - Add 1.51 release record, known limitations, and self-check report.

5. Extend Dev Kit self-check.
   - Assert 1.51 assets exist.
   - Assert strict precision examples pass.
   - Assert bad fixtures fail for the expected reasons.
   - Assert package, README, VERSION, and manifest stay aligned.

## Acceptance Plan

Run:

```bash
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule \
  --report change-impact-coverage-reports/001-contract-input-rule.md \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs \
  --require-precise-evidence
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule \
  --require-impact-coverage \
  --require-precise-evidence
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Bad fixtures must fail for:

- stale or mismatched Change Impact Coverage report
- weak resolved evidence file
- unresolved `artifact:<id>` record

## Expected Outcome

1.51 makes strict close-out harder to fake:

```text
Wrong report -> not closed.
Old task report -> not closed.
Weak evidence file -> not closed.
Unresolved recorded artifact -> not closed.
```

It still does not authorize implementation, apply, commit, push, release, production, or high-risk decisions.
