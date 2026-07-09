# IntentOS 1.88.1 Release Record

## Theme

Plan Review Gate source-chain, Review Surface, and subagent hardening.

## Summary

1.88.1 tightens the Plan Review Gate introduced in 1.88.0.

The key change is simple:

```text
PLAN_REVIEW_PASSED must be backed by real source evidence.
```

A high-impact plan review can no longer pass only because the plan-review report
derived its own review-surface matrix. It must be backed by Task Governance,
Review Surface authority, Verification Plan evidence, and any required Business
Rule or Change Impact sources.

## Added

- `docs/plans/plan-review-gate-hardening-1.88.1-plan.md`
- `releases/1.88.1/release-record.md`
- `releases/1.88.1/known-limitations.md`
- `releases/1.88.1/self-check-report.md`
- bad fixtures:
  - `test-fixtures/bad/bad-plan-review-derived-surface-pass`
  - `test-fixtures/bad/bad-plan-review-missing-source-verification`
  - `test-fixtures/bad/bad-plan-review-subagent-fallback-pass`

## Changed

- `scripts/check-plan-review.mjs` now rejects high-impact passed reports that:
  - depend only on a derived review-surface matrix;
  - lack Review Surface authority in `source_chain`;
  - lack `verification_plan` in `source_chain`;
  - use unsafe or duplicate source-chain entries;
  - use Codex-owned `business_rule_closure`;
  - use fallback as a substitute for recommended subagent review.
- `scripts/resolve-plan-review.mjs` now emits stronger default source chains for
  `HIGH` and `POSSIBLE_HIGH` passed reports.
- The high-impact passed example now uses `review_surface_card`,
  `verification_plan`, `business_rule_closure`, and `change_impact_coverage`
  source evidence.

## Compatibility

1.88.1 keeps the Plan Review artifact schema compatible with `1.88.0`.

This patch tightens checker interpretation and resolver output. It does not
introduce a new artifact schema version.

## Allowed Claims

- IntentOS 1.88.1 hardens Plan Review Gate source-chain checks for high-impact
  and possible-high-impact passed reports.
- `PLAN_REVIEW_PASSED` now requires Task Governance, Review Surface authority,
  Verification Plan, and required Business Rule / Change Impact sources when
  those surfaces apply.
- Derived review-surface matrices are helper evidence only; they cannot be the
  only authority for high-impact passed reports.
- Recommended subagent review must be read-only, planned, and closed or skipped
  before pass; fallback cannot substitute for it.
- 1.88.1 keeps the `plan_review` artifact schema compatible with `1.88.0`.

## Forbidden Claims

- Do not claim 1.88.1 approves implementation, commit, push, release,
  production, migration, CI changes, or project-owner decisions.
- Do not claim 1.88.1 executes tests. Verification command review remains
  static.
- Do not claim a derived review-surface matrix replaces project-native Review
  Surface authority.
- Do not claim subagent output is authoritative or that fallback can replace a
  recommended subagent review for `PLAN_REVIEW_PASSED`.
- Do not claim the patch changes the Plan Review artifact schema version.

## Evidence Status

- Positive evidence: the high-impact passing example now passes with
  source-chain evidence for Task Governance, Review Surface authority,
  Verification Plan, Business Rule Closure, and Change Impact Coverage.
- Negative evidence: `bad-plan-review-derived-surface-pass` is rejected because
  a derived review-surface matrix cannot satisfy high-impact pass by itself.
- Negative evidence: `bad-plan-review-missing-source-verification` is rejected
  because high-impact pass requires `verification_plan` in the source chain.
- Negative evidence: `bad-plan-review-subagent-fallback-pass` is rejected
  because fallback cannot substitute for recommended subagent review.
- Repository evidence is limited to static checks, fixture validation, and
  release self-checks. It is not production validation.

## Known Limitations

- 1.88.1 does not execute tests or prove runtime behavior.
- 1.88.1 does not rewrite implementation plans automatically.
- 1.88.1 does not approve implementation or release work.
- 1.88.1 does not replace project-native Review Surface cards.
- Full downstream consumer enforcement is still reserved for a follow-up phase.

## Boundaries

1.88.1 is non-authorizing.

`PLAN_REVIEW_PASSED` means only:

```text
The pre-implementation plan-review prerequisite is satisfied.
```

It does not approve:

- implementation;
- commit or push;
- release or production;
- test execution;
- migration;
- project-owner decisions;
- risk acceptance;
- subagent output as authority.

## Verification

Required checks:

```bash
node --check scripts/resolve-plan-review.mjs
node --check scripts/check-plan-review.mjs
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-passed --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-derived-surface-pass --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-missing-source-verification --require-structured-evidence
node scripts/check-plan-review.mjs test-fixtures/bad/bad-plan-review-subagent-fallback-pass --require-structured-evidence
npm run verify:syntax
npm run verify:examples
npm run verify:release
git diff --check
```

The bad fixture checks must fail with the expected blocking messages.
