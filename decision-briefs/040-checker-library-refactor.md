# Decision Brief: Checker Library Refactor

Use this template when a human must decide before AI can continue safely.

## Human Summary

0.40.1 may refactor checker internals, but it must not change checker behavior unless the repository owner explicitly approves that drift.

## Decision Needed

Question: Should 0.40.1 allow checker behavior drift while extracting shared libraries?

Owner: human

Decision deadline, if any: before changing fixture expectations for new behavior

## Background

0.40.0 expanded the fixture matrix specifically to protect behavior before refactoring checker internals. The next roadmap phase is internal cleanup, not a semantic redesign.

## Options

| Option | Benefit | Risk | AI impact | Recommended |
|---|---|---|---|---|
| Preserve behavior unless explicitly reviewed | Keeps 0.40.1 safe and easy to verify | Some duplicate script-specific behavior may remain | AI can refactor only covered, stable plumbing | Yes |
| Permit behavior changes during refactor | Allows cleaner abstractions faster | Harder to separate cleanup from product change | AI must update fixtures and stop for approval before behavior drift | No |

## Recommended Choice

Recommendation: Preserve behavior unless explicitly reviewed.

Reason: This phase exists to reduce maintenance cost after fixture expansion, not to redesign checker semantics.

## Human Decisions Needed

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
| Allow checker behavior drift during 0.40.1 | Behavior drift would change the purpose of this phase | preserve behavior / permit reviewed drift | preserve behavior | human | APPROVED |

## If Not Confirmed

The main thread proceeds with behavior-preserving refactor only and stops if a helper abstraction requires semantic changes.

## Next Safe Action

Proceed with behavior-preserving helper refactor and stop if fixture expectations would need to change for new behavior.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DO_NOT_PROCEED | Do not change checker semantics inside 0.40.1 without a separate human decision | current task boundary | No | do not proceed | behavior drift approval required |

## What AI Can Do Safely Before Decision

- Add dependency-free shared helpers.
- Migrate repeated plumbing where output and exit behavior stay stable.
- Run fixture and dev-kit checks.
- Record any behavior-drift pressure in the review loop.

## What AI Must Not Do Before Decision

- Change checker pass/fail semantics.
- Change fixture expectations to accept new behavior.
- Add dependencies.
- Reclassify workflow gates, task levels, or baseline policy.

## Evidence

- `0.40.0` fixture matrix exists to protect checker behavior before refactor.
- `0.40.1` task card marks checker semantic changes as not allowed.
- Final verification uses fixture matrix and full dev-kit self-check.

## Technical Details

Related files:

- `docs/productization-hardcut-1.0-plan.md`
- `tasks/040-checker-library-refactor.md`
- `test-fixtures/fixture-cases.json`

Related checks:

```text
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

Related workflow fields:

```text
Goal Mode: IMPLEMENT_TASK
Subagent Mode: REVIEW_LOOP
Task Level: L2
Human Approval: Not Required unless behavior drift, dependency, migration, production config, or release scope appears
```

## Audit Notes

Recorded by: Codex

Recorded at: 2026-06-27

Decision status: APPROVED

Decision result: Behavior-preserving refactor only for 0.40.1.

Residual risks: none for the decision itself; push credential scope is tracked in the final report.
