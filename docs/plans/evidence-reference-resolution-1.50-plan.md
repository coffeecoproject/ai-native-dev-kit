# Evidence Reference Resolution 1.50 Plan

## Human Summary

1.50 strengthens the 1.49 Change Impact Coverage close-out path.

1.49 can say:

```text
This surface is DONE, and here is the evidence text.
```

1.50 must let strict checks say:

```text
This surface is DONE, and the evidence reference actually resolves.
Execution Closure cannot be READY for cross-surface work unless it cites a strict Change Impact Coverage report.
```

This is not an automatic apply runner. It is a stricter evidence reliability layer before commit review.

## Problem

1.49 added structured impact coverage, but three gaps remain:

1. A `DONE` row can cite a path-like string that does not exist.
2. Execution Closure can mention validation, API, backend, data, permission, or error-copy work without strictly requiring a Change Impact Coverage report.
3. The resolver can accept `--changed-files`, but users still need to pass the list manually.

These gaps can produce a false close-out:

```text
Backend rule changed.
Frontend/API/tests are listed as done.
Evidence paths look valid.
But no evidence files exist, and Execution Closure is still READY.
```

## Goals

- Add strict evidence reference resolution for Change Impact Coverage.
- Keep legacy Markdown and 1.49 strict evidence compatible by default.
- Add `--resolve-evidence-refs` so `DONE` implementation and verification evidence must be resolvable.
- Support file evidence, `command-output:<path>`, `artifact:<id-or-ref>`, and `human-decision:<id-or-ref>`.
- Add git diff changed-file input through `--from-git-diff`, `--cached`, and `--base`.
- Add strict Execution Closure impact coverage linking through `--require-impact-coverage`.
- Add good and bad fixtures that prove the stricter behavior.
- Keep all new strict behavior opt-in.

## Non-Goals

- Do not write target-project files.
- Do not implement missing frontend/backend/API/test work.
- Do not approve implementation, apply, commit, push, release, production, CI, hooks, migration, data, permission, payment, privacy, security, tax, legal, or compliance decisions.
- Do not require every historical Change Impact Coverage report to contain resolvable evidence refs.
- Do not make path inference a full static analyzer.
- Do not add automatic apply runner behavior.

## User-Facing Behavior

Default usage remains compatible:

```bash
node scripts/check-change-impact-coverage.mjs .
```

Strict close-out can now be:

```bash
node scripts/check-change-impact-coverage.mjs . \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs
```

Git diff input can be:

```bash
node scripts/cli.mjs impact-coverage . \
  --intent "add contract input restriction" \
  --from-git-diff
```

Staged-only input can be:

```bash
node scripts/cli.mjs impact-coverage . \
  --intent "add contract input restriction" \
  --from-git-diff \
  --cached
```

Base comparison can be:

```bash
node scripts/cli.mjs impact-coverage . \
  --intent "add contract input restriction" \
  --from-git-diff \
  --base origin/main
```

Strict Execution Closure can be:

```bash
node scripts/check-execution-closure.mjs . --require-impact-coverage
```

## Evidence Reference Rules

When `--resolve-evidence-refs` is enabled:

- `DONE` implementation coverage must include a resolvable evidence reference.
- `DONE` verification coverage must include a resolvable evidence reference.
- Markdown rows and structured `Machine-Readable Evidence` rows are both checked.
- A relative file path must resolve inside the project root.
- A path may resolve relative to the project root or the report file directory.
- Absolute paths and parent traversal outside the project are not accepted.
- `command-output:<path>` must point to a real local evidence file.
- `artifact:<id-or-ref>` is accepted as a recorded artifact reference.
- `human-decision:<id-or-ref>` is accepted as a human decision reference, but it does not turn high-risk work into implementation approval.

## Execution Closure Integration

When `--require-impact-coverage` is enabled:

- `READY_FOR_COMMIT_REVIEW` closures that mention validation, business rules, API, backend, data, permissions, schemas, contracts, input restrictions, or error-copy work must include:

```text
Change Impact Coverage Report | <ref> | found | CHANGE_IMPACT_COVERAGE | ...
```

- The referenced report must resolve.
- The project must pass:

```bash
node scripts/check-change-impact-coverage.mjs <project> \
  --require-structured-evidence \
  --mode closure \
  --strict-evidence \
  --resolve-evidence-refs
```

## Implementation Plan

1. Update `scripts/check-change-impact-coverage.mjs`.
   - Add `--resolve-evidence-refs`.
   - Validate Markdown `DONE` evidence refs.
   - Validate structured `DONE` evidence refs.
   - Reuse bounded project-root reference resolution.

2. Update `scripts/resolve-change-impact-coverage.mjs`.
   - Add `--from-git-diff`.
   - Add `--cached`.
   - Add `--base`.
   - Merge explicit `--changed-files` with git diff files.

3. Update `scripts/check-execution-closure.mjs`.
   - Add `--require-impact-coverage`.
   - Require a found Change Impact Coverage Report for cross-surface READY closures.
   - Run the strict impact coverage checker against the linked project.

4. Add examples and fixtures.
   - Add real evidence files to the 1.49 structured example.
   - Add a 1.50 strict closure integration example.
   - Add bad fixtures for missing evidence refs and missing impact coverage links.

5. Update docs, README, version, package scripts, manifest, and release evidence.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
node scripts/check-execution-closure.mjs examples/1.50-evidence-reference-resolution --require-impact-coverage
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Bad fixtures must fail for:

- missing evidence reference resolution
- missing Change Impact Coverage link during strict Execution Closure

## Expected Outcome

1.50 makes cross-surface close-out more reliable:

```text
No resolvable evidence -> not closed.
No strict impact report for cross-surface READY closure -> not closed.
Git diff can provide changed-file input -> less manual copying.
```

It still does not approve implementation, apply, commit, push, release, or production.
