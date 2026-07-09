# Plan Review Gate Hardening 1.88.1 Execution And Acceptance Plan

## Purpose

1.88.1 hardens the Plan Review Gate added in 1.88.0.

Plain-language target:

```text
A passed plan review must be backed by the right sources.
It cannot pass only because the plan-review report derived its own checklist.
It also cannot treat skipped or unfinished subagent review as enough.
```

This is a patch release, not a new workflow layer. It keeps the 1.88.0
`plan_review` artifact shape compatible and tightens resolver/checker behavior.

## Scope

1.88.1 covers three hardening areas:

1. Source-chain hardening
2. Review Surface authority hardening
3. Subagent review routing hardening

It does not implement downstream coding, release, production, migration, CI, or
runtime behavior.

## Source-Chain Hardening

For `PLAN_REVIEW_PASSED` with `HIGH` or `POSSIBLE_HIGH` impact, the source chain
must include:

- `task_governance`
- an authoritative Review Surface source:
  - `review_surface_card`, or
  - `project_native_review_surface`, or
  - `project_native_equivalent`
- `verification_plan`
- `business_rule_closure` when the required surfaces include `business_rule`
- `change_impact_coverage` when the required surfaces include
  `data_destructive` or `frontend_backend_consistency`

Every source must have a concrete sha256 digest, must match the current task, and
must not be stale, contradictory, absolute-path based, or `..`-based.

Business-rule closure cannot be owned by Codex. It must be domain-owner or
project-native evidence.

## Review Surface Authority Hardening

Plan Review Gate may derive a review-surface matrix as helper evidence, but that
derived matrix is not project authority.

For high-impact `PLAN_REVIEW_PASSED`, a derived review-surface matrix cannot be
the only basis for passing. The report must be backed by a project-native Review
Surface source or equivalent.

This protects the system from this false pass:

```text
The plan-review report generated its own surface list,
then used that generated list to prove the plan was fully reviewed.
```

## Subagent Routing Hardening

When subagent review is recommended:

- a read-only run plan is required;
- `run_plan_ref` must be concrete;
- writer subagents are forbidden for plan review;
- subagent output is input only, never authority;
- `PLAN_REVIEW_PASSED` cannot leave recommended subagent closure unknown;
- `PLAN_REVIEW_PASSED` cannot use fallback as a substitute for recommended
  subagent review.

Fallback can explain why a non-passing state continues without subagent review.
It cannot be used to make a passing report look complete.

## Resolver Changes

`scripts/resolve-plan-review.mjs` should:

- emit `review_surface_card` as the default authoritative source for generated
  high-impact examples;
- emit source chains for both `HIGH` and `POSSIBLE_HIGH`;
- emit `verification_plan` in the source chain for high-impact passed reports;
- mark completed recommended subagent review as not using fallback.

## Checker Changes

`scripts/check-plan-review.mjs` should reject:

- high-impact passed reports that use only a derived matrix;
- high-impact passed reports missing `verification_plan`;
- high-impact passed reports missing Review Surface authority;
- source-chain duplicates, unsafe refs, non-sha256 digests, stale sources, and
  contradictory sources;
- `business_rule_closure` sources owned by Codex;
- passing reports that use fallback as a substitute for recommended subagent
  review.

## Fixtures

Add bad fixtures:

- `bad-plan-review-derived-surface-pass`
- `bad-plan-review-missing-source-verification`
- `bad-plan-review-subagent-fallback-pass`

The existing high-impact passing example should be regenerated so it reflects
the hardened source chain and subagent routing.

## Acceptance Criteria

- The high-impact passed example still passes with structured evidence.
- The three new bad fixtures fail for the intended reason.
- `scripts/check-intentos.mjs` lists the 1.88.1 assets and fixture checks.
- `README.md`, `README.zh-CN.md`, `VERSION.md`, `package.json`,
  `templates/version-record.md`, `templates/workflow-version.json`, and
  `intentos-manifest.json` all point to `1.88.1`.
- The 1.88.1 release record states that the artifact schema remains compatible
  with 1.88.0.

## Non-Goals

1.88.1 does not:

- approve implementation;
- execute verification commands;
- run tests;
- rewrite implementation plans;
- install hooks;
- change downstream apply behavior;
- replace project-native Review Surface cards;
- make subagent output authoritative.

