# IntentOS 1.82.1 Release Record

## Theme

Controlled Native Adoption Review source and matrix hardening.

## Summary

1.82.1 tightens `adopt-review` after the first 1.82 release. It makes source
blockers auditable, prevents maturity/recommendation drift, and stops target
projects from being recommended for deeper adoption when target-matching source
evidence says the project is dirty, unsafe, or lacks authority.

## Changed

- Added source trace fields for `ref`, `digest`, `source_outcome`,
  `current_project_match`, and `blocker_class`.
- Made target-matching dirty/unsafe and project-authority source blockers drive
  blocked recommendations.
- Added a complete maturity-to-recommendation matrix check.
- Required `LIGHT_LOW_RISK_PROJECT` to have explicit low production sensitivity.
- Expanded technical user-burden scanning across user-visible recommendation,
  blocked-action, decision, and risk sections.
- Added bad fixtures for dirty-plan-only, unknown-owner-repair,
  messy-production-selected-plan, and maturity-depth drift.
- Added `.DS_Store` ignore handling to prevent local macOS files from polluting
  source worktree checks.

## Allowed Claims

- `adopt-review` records auditable source trace metadata.
- Target-matching dirty or unsafe blockers force `BLOCKED_BY_UNSAFE_PROJECT_STATE`.
- Target-matching project-authority blockers force `BLOCKED_BY_PROJECT_AUTHORITY`.
- Maturity state, recommended adoption depth, recommendation class, and outcome
  are checked as one matrix.

## Forbidden Claims

- This release does not write target-project files.
- This release does not install `.intentos/`.
- This release does not create or replace `AGENTS.md`.
- This release does not change CI, hooks, release SOPs, production config,
  business code, DB, API, Web, Docker, secrets, payment, provider state, or
  project authority.
- This release does not approve implementation, commit, push, release,
  production, app-store review, or mini-program review.
- This release does not claim full IntentOS adoption.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- The four positive maturity examples are covered by strict structured checks.
- Four bad fixtures prove source blocker and maturity matrix violations are
  rejected.
- `check-intentos` covers the protocol assets, examples, bad fixtures, CLI
  entries, and release evidence.

## Known Limitations

- `adopt-review` still recommends only; it does not apply files.
- Source digests are resolver-output digests, not durable persisted source
  artifact files.
- `current_project_match` distinguishes repository-internal example noise from
  target-project blockers; future project-level apply planning still requires
  Unified Apply Plan, Approval Record, Controlled Apply Readiness, and
  execution evidence.

## Verification

Required verification:

```bash
node --check scripts/resolve-controlled-native-adoption-review.mjs
node --check scripts/check-controlled-native-adoption-review.mjs
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/strong-governed-stay-partial --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/weak-governance-repair --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/messy-production-repair-only --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/light-plan-only --require-structured-evidence
```

Bad fixtures must be rejected:

```bash
node scripts/check-controlled-native-adoption-review.mjs test-fixtures/bad/bad-controlled-native-adoption-review-dirty-plan-only --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs test-fixtures/bad/bad-controlled-native-adoption-review-unknown-owner-repair --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs test-fixtures/bad/bad-controlled-native-adoption-review-messy-selected-plan --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs test-fixtures/bad/bad-controlled-native-adoption-review-maturity-depth-drift --require-structured-evidence
```

Full suite:

```bash
npm run verify
node scripts/check-intentos.mjs
git diff --check
```
