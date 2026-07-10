# Execution Truth Hardcut 1.90 Plan

## Purpose

1.90 closes the highest-severity gap found in the full IntentOS audit:

```text
An existing file must not be accepted as evidence merely because its path exists.
```

The release makes a final `DONE` decision depend on verified, task-matched
upstream evidence. It strengthens the existing task and close-out chain; it
does not add another workflow, approval system, or release gate.

## User Outcome

A user can still ask one simple question:

```text
Is this task actually done?
```

IntentOS must answer `DONE` only when the recorded execution closure has
passed its own strict checks and, where relevant, the linked impact coverage
also passes and belongs to the task being closed. Otherwise it must give a
plain blocker and the next safe action.

Users do not need to select checkers, interpret digests, or decide task tier
rules themselves.

## Problem Statement

Before 1.90, Unified Closure could mark a task `DONE` when:

- an Execution Closure path existed but that closure failed strict validation;
- a Change Impact Coverage path existed but belonged to another task;
- a Human Decision argument pointed at an unrelated file; or
- a recorded Closure Decision only repeated `PASS` strings without proving the
  source checks passed.

This violates the single closure truth promise. The final decision must be the
strictest *verified* interpretation of its inputs, not a summary of paths and
free text.

## Scope

1. Add exact-report support to the Execution Closure checker so a final
   decision can validate its chosen source rather than every historic record.
2. Make `resolve-closure-decision` validate its chosen Execution Closure with
   the same strict evidence rules used by the Execution Closure checker.
3. Require verified Change Impact Coverage for behavior-changing closures,
   including task/intent matching and precise evidence when that source is
   required.
4. Prevent a human-decision reference from being accepted as an arbitrary
   duplicate of another evidence file.
5. Add verified-input details to the Unified Closure decision trace and
   evidence map so its final conclusion remains explainable.
6. Extend `check-closure-decision` so a recorded `DONE` decision must include
   verified source evidence, not only rendered `PASS` table cells.
7. Preserve the existing tier-specific task governance requirements and make
   strict task-consumer closure checks remain the required route for governed
   tasks. This release does not invent an alternative tier classifier.
8. Add positive and negative fixtures, including the audit reproduction where
   a stale Execution Closure used to produce `DONE`.

## Non-Goals

- Do not authorize code changes, apply, commit, push, release, production,
  migrations, CI, hooks, secrets, or owner decisions.
- Do not replace Test Evidence or Execution Assurance with Unified Closure.
- Do not redesign the full Evidence Authority system. Canonical project/Git
  identity and all-schema hardening remain the 1.91 scope.
- Do not change baseline selection, existing-project migration, or release
  execution behavior.

## Target Model

```text
Task Governance / Work Queue (when required by project or tier)
                     |
                     v
Change Impact Coverage -- strict check + current task match
                     |
                     v
Execution Closure ----- strict check + exact selected report
                     |
                     v
Unified Closure Decision -- derived, read-only final view
```

`Unified Closure Decision` remains derived and non-authorizing. It never
replaces the lower-level records. It may report `DONE` only after their
validation has succeeded.

## Implementation Contract

### Exact Source Validation

`check-execution-closure.mjs` gains a `--report <project-relative-path>`
selector. It must:

- reject absolute paths, traversal, and paths outside the project;
- validate only the selected Execution Closure report;
- fail when the selected file is missing or not under `execution-closures/`;
- preserve current all-report behavior when `--report` is not supplied.

### Unified Closure Inputs

`resolve-closure-decision.mjs` must distinguish:

- `PASS`: source exists, passes its required checker, and is relevant;
- `FAIL`: source exists but fails validation or does not match task/intent;
- `MISSING`: required source is absent;
- `N/A` or `OPTIONAL`: source is not required for this task.

For `DONE`:

- Verification remains required.
- Execution Closure must be a verified `READY_FOR_COMMIT_REVIEW` source.
- Behavior-changing work must have a verified exact Change Impact Coverage
  report matched to the Execution Closure task or intent.
- High-risk work still requires a distinct human decision record; an execution
  closure or impact report cannot double as that record.
- Any failed source outranks `DONE` and yields `NEEDS_EVIDENCE` or `BLOCKED`.

### Recorded Closure Decisions

The Closure Decision template and checker must add an input-verification view:

- each required evidence input records `verified: Yes|No|N/A`;
- `DONE` needs verified Verification and Execution Closure inputs;
- behavior-changing `DONE` needs verified Impact Coverage;
- high-risk `DONE` needs verified Human Decision;
- `PASS` wording alone must not satisfy this requirement.

Older Closure Decision records remain readable. They are not retroactively
treated as verified `DONE` records unless they contain the new verified-input
evidence or are checked in compatibility/read-only mode without a completion
claim.

## Acceptance Matrix

Positive:

1. The structured impact-coverage example still resolves to `DONE` with its
   matched Execution Closure.
2. A selected valid Execution Closure passes `--report` strict validation.
3. A strict task-consumer Closure Decision still honors the existing Work
   Queue and Task Governance binding.

Negative:

1. The stale-impact Execution Closure fixture cannot produce `DONE`.
2. An Execution Closure reference that fails its own checker produces a
   non-DONE result even when its path exists.
3. A behavior-changing task cannot use an unrelated Impact Coverage report.
4. A high-risk task cannot reuse the Execution Closure file as its human
   decision source.
5. A recorded `DONE` decision with only rendered `PASS` rows fails the
   Closure Decision checker.
6. Unsafe `--report` paths are rejected.
7. A low-risk intent in a project that merely contains CI/workflow files does
   not create a false Human Decision requirement.

Repository verification:

```bash
node --check scripts/resolve-closure-decision.mjs
node --check scripts/check-closure-decision.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Compatibility And Migration

The hard cut is semantic, not a forced project migration:

- Existing reports remain readable and diagnosable.
- New `DONE` claims must meet the verified-source contract.
- No project assets are written solely by running these resolvers/checkers.
- Existing projects only become stricter when they ask IntentOS to make a
  final completion claim.

## Release Evidence

1.90 must include:

- a release record;
- known limitations distinguishing 1.90 from the later 1.91 Evidence Authority
  work;
- a self-check report with the stale-closure regression result;
- version, README, manifest, reference, template, checklist, prompt, and
  generated-project asset synchronization where applicable.
