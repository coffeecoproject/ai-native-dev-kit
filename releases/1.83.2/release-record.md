# IntentOS 1.83.2 Release Record

## Theme

Tier-specific review policy for Task Governance.

## Summary

1.83.2 clarifies what "review" means after Task Governance classifies a task
as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`.

The release prevents task grading from being misread as permission to skip
review. Every tier now records a machine-readable `review_policy` with review
level, self-check requirement, independent-review requirement, review timing,
review coverage, review source, and the reason full review is or is not needed.

The release remains non-authorizing. It does not write target project files,
install `.intentos/`, replace `AGENTS.md`, change CI/hooks, authorize
implementation, approve completion, approve commit/push, approve release, or
replace project-native reviewers.

## Changed

- Expanded `task_governance` structured evidence to schema `1.83.2`.
- Added `review_policy` to Task Governance evidence:
  - `review_level`
  - `codex_self_check_required`
  - `independent_review_required`
  - `review_must_happen_before`
  - `review_must_cover`
  - `review_source`
  - `skip_full_review_reason`
- Updated resolver output so generated reports include tier-specific review
  policy.
- Updated checker logic so each task tier must carry the expected review
  policy:
  - `LOW` -> `LIGHTWEIGHT`
  - `MEDIUM` -> `TARGETED`
  - `POSSIBLE_HIGH` -> `BLOCKING_CLARIFICATION`
  - `HIGH` -> `FULL`
- Updated Task Governance template, docs, prompt, checklist, examples, manifest,
  README, version files, and self-check coverage.
- Added a bad fixture for an invalid low-impact review policy.

## Allowed Claims

- Task Governance now distinguishes lightweight review, targeted review,
  clarification gates, and full review chains by task tier.
- Low-impact work is still governed by scope, excluded-surface, minimal
  verification, and unrelated-edit checks.
- Medium-impact work requires a short plan, bounded impact surface, targeted
  verification, and unrelated-edit checks.
- Possible-high work blocks implementation review until clarification or
  read-only inspection resolves the risk.
- High-impact work requires full review and evidence before implementation and
  completion claims.

## Forbidden Claims

- This release does not approve implementation.
- This release does not make low-impact or medium-impact tasks unreviewed.
- This release does not replace project-native reviewers.
- This release does not approve completion, commit, push, release, production,
  CI changes, hooks, migrations, or native apply.
- This release does not claim full IntentOS adoption.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Task Governance CLI smoke remains covered by `verify:governance`.
- Positive examples run through strict structured evidence checks.
- `check-intentos` covers the 1.83.2 release files, review-policy markers, the
  low-review-policy bad fixture, and full Task Governance asset presence.

## Known Limitations

- Review policy proves the expected governance route for a task tier; it does
  not prove the implementation is correct.
- Lightweight and targeted review policies still depend on the task being
  correctly classified.
- Independent review requirements do not name a concrete human reviewer unless
  the target project provides one.
- Project-native review records still need the 1.83.1 evidence binding rules
  before they can be treated as mapped behavior.
- Task Governance remains non-authorizing and cannot approve implementation,
  completion, release, production, or full IntentOS adoption.

## Verification

Required verification:

```bash
node --check scripts/resolve-task-governance.mjs
node --check scripts/check-task-governance.mjs
node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/medium-list-filter --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/review-required-step-policy --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-low-wrong-review-policy --require-structured-evidence
node scripts/check-intentos.mjs
git diff --check
```

The low-review-policy bad fixture must fail.
