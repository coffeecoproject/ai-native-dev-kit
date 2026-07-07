# IntentOS 1.82.0 Release Record

## Theme

Controlled Native Adoption Review.

## Summary

1.82.0 adds `adopt-review`, a read-only maturity and adoption-depth review for
existing projects. It is the next step after `adopt`: Codex can judge whether an
old project should stay safely partial, repair governance first, prepare a
selected deeper adoption plan, or remain blocked until owner/risk/state issues
are resolved.

## Changed

- Added Controlled Native Adoption Review core protocol, docs, checklist,
  prompt, template, schema, report directory, resolver, and checker.
- Added CLI entries `adopt-review` and `adopt-review-check`.
- Added maturity examples for strong governed, weak governance, messy
  production-sensitive, and light low-risk projects.
- Added strict report checks for source authority, read-only boundaries,
  adoption-card derived-view status, risk/verification/rollback, and over/under
  migration rules.
- Updated README, README.zh-CN, script reference, manifest, workflow version,
  package verification, and self-check coverage.

## Allowed Claims

- `adopt-review` recommends adoption depth from read-only evidence.
- Strong governed projects may be recommended to stay partial.
- Weak or messy projects may be recommended to repair governance first.
- Light low-risk projects may be recommended to prepare a selected deeper plan.
- The recommendation can be audited through structured evidence.

## Forbidden Claims

- This release does not write target-project files.
- This release does not install `.intentos/`.
- This release does not create or replace `AGENTS.md`.
- This release does not change CI, hooks, release SOPs, secrets, migrations,
  production config, business code, DB, API, Web, Docker, payment, permissions,
  provider state, or project authority.
- This release does not approve implementation, commit, push, release,
  production, app-store review, or mini-program review.
- This release does not claim full IntentOS adoption.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- `adopt-review` and `adopt-review-check` are covered by `verify:governance`.
- Four maturity examples are covered by `verify:examples` and strict structured
  evidence checks.
- Manifest, workflow version, README, release record, and generated-project
  installation are covered by `verify:release` and `check-intentos`.
- Evidence proves review-only recommendation behavior; it does not prove any
  target-project write, native asset installation, production release, or full
  adoption.

## Known Limitations

- `adopt-review` is a maturity recommendation, not an apply command.
- Upstream source systems can still appear blocked in the trace while the 1.82
  recommendation uses project maturity signals; reviewers should inspect the
  source chain when deciding whether to prepare a future plan.
- Any future write still requires Unified Apply Plan, Approval Record,
  Controlled Apply Readiness, and execution evidence.
- S1/S2/S3/S4 apply behavior remains out of scope.

## Verification

Required verification:

```bash
node --check scripts/resolve-controlled-native-adoption-review.mjs
node --check scripts/check-controlled-native-adoption-review.mjs
node scripts/cli.mjs adopt-review . --intent "review deeper IntentOS adoption"
node scripts/cli.mjs adopt-review-check . --allow-empty
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/strong-governed-stay-partial --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/weak-governance-repair --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/messy-production-repair-only --require-structured-evidence
node scripts/check-controlled-native-adoption-review.mjs examples/1.82-controlled-native-adoption-review/light-plan-only --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```
