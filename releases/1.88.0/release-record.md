# IntentOS 1.88.0 Release Record

## Theme

Plan Review Gate Core.

## Summary

1.88.0 turns implementation plans into reviewable artifacts before coding
starts.

For important work, especially permission, deletion, workflow, business-rule,
data, API, release, or production-sensitive changes, "the plan is written" is
not enough. Codex must review the plan, record findings, handle blocking gaps,
and only then move to implementation review.

## Added

- `core/plan-review-gate.md`
- `docs/plan-review-gate.md`
- `templates/plan-review-report.md`
- `schemas/artifacts/plan-review.schema.json`
- `checklists/plan-review-gate-review.md`
- `prompts/plan-review-gate-agent.md`
- `plan-review-reports/.gitkeep`
- `scripts/resolve-plan-review.mjs`
- `scripts/check-plan-review.mjs`
- CLI entries:
  - `plan-review`
  - `plan-review-check`
- 1.88 examples and bad fixtures.

## Boundaries

Plan Review Gate is non-authorizing.

`PLAN_REVIEW_PASSED` means only:

```text
The pre-implementation plan-review prerequisite is satisfied.
```

It does not approve:

- implementation;
- commit or push;
- release or production;
- tests as executed;
- migrations;
- project-owner decisions;
- risk acceptance.

## Allowed Claims

- IntentOS 1.88.0 adds a read-only Plan Review Gate before implementation review.
- `plan-review` can derive a plan-review report from an intent and, when provided,
  a referenced plan.
- `plan-review-check` can validate structured plan-review evidence, stale-plan
  detection, source-chain binding, review-surface coverage, subagent review
  routing, and non-authorizing boundaries.
- `PLAN_REVIEW_PASSED` means the plan-review prerequisite is satisfied for
  implementation review only.

## Forbidden Claims

- Do not claim Plan Review Gate approves implementation, commit, push, release,
  production, migration, CI changes, or project-owner decisions.
- Do not claim verification commands were executed by plan review; 1.88 only
  performs static verification command review.
- Do not claim subagent review output is authoritative, or that a running /
  unknown subagent closure can produce `PLAN_REVIEW_PASSED`.
- Do not claim `NO_PLAN_REQUIRED` is a real plan reference; it must use
  `plan_ref = N/A` and `plan_digest = N/A`.

## Evidence Status

- Positive examples cover low `NO_PLAN_REQUIRED`, medium reviewed plan, high
  revision-required plan, high passed plan, and stale-plan blocking.
- Bad fixtures cover missing task governance, missing review surfaces, unresolved
  P1/P2 findings, subagent misuse, fake test execution claims, stale digest,
  original-plan rewriting, repeated failed rounds, and user-facing technical
  burden.
- Release verification is limited to repository checks and generated fixture
  validation. It is not production validation.

## Known Limitations

- 1.88.0 does not rewrite implementation plans automatically.
- 1.88.0 does not execute tests, release commands, migrations, or deployment
  commands.
- 1.88.0 does not replace project-native review surface cards; derived review
  matrices remain secondary evidence.
- Consumer integration is intentionally limited in 1.88.0; deeper integration
  with Execution Assurance, Completion, and Apply Readiness is reserved for a
  follow-up phase.

## Verification

Required checks:

```bash
node --check scripts/resolve-plan-review.mjs
node --check scripts/check-plan-review.mjs
node scripts/check-plan-review.mjs examples/1.88-plan-review-gate/high-permission-delete-plan-passed --require-structured-evidence
npm run verify:syntax
npm run verify:release
```
