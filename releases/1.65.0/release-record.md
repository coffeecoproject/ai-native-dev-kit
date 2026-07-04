# Release 1.65.0

## Theme

Native Migration Classification Calibration.

## Summary

1.65 continues the existing-project Native Migration line. It does not add a new
migration system. It makes the existing rule-level migration evidence more
accurate when old project rules mix business, engineering, production,
workflow, Chinese governance text, and Markdown tables.

## Changes

- Calibrated Native Migration classification priority so mixed business +
  engineering rules are not downgraded to plain engineering baselines because
  they contain incidental technical words such as schema, API, database, enum,
  or type.
- Added conservative Chinese keyword handling for business, permission,
  production, release, compliance, workflow, finance, tax, and customer/data
  governance language.
- Added conservative simple Markdown table extraction for clear rule-like
  tables while keeping complex tables skipped or human-review bound.
- Added strict Markdown / JSON proposed-action consistency checks.
- Added a 1.65 mixed-domain bilingual positive example.
- Added bad fixtures for mixed-rule misclassification, Chinese production
  misclassification, missing simple-table line range, missing complex-table
  warning, and proposed-action mismatch.

## Boundary

1.65 does not authorize target-project writes, governance replacement,
implementation, release, production, CI changes, hooks, provider calls, secrets,
migrations, payment, permissions, data changes, or business-rule changes.

Classifier output remains evidence for review. It is not human approval.

## Allowed Claims

- IntentOS can classify mixed business + engineering native-migration rules more conservatively in structured evidence.
- IntentOS can recognize common Chinese business, permission, production, release, compliance, workflow, finance, tax, and customer/data governance wording during native migration planning.
- IntentOS can extract clear simple Markdown table rows as rule evidence with source line ranges.
- IntentOS can keep complex or ambiguous Markdown tables in skipped / warning evidence for human review.
- IntentOS can reject strict native-migration reports whose Proposed Native Migration Plan table disagrees with Machine-Readable Evidence.

## Forbidden Claims

1.65 does not:

- prove every old-project rule was found
- prove a target project is fully migrated
- authorize target-project writes
- approve governance replacement
- approve implementation, release, or production
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- replace project business or production authority
- turn classifier output, parser warnings, skipped blocks, simple table extraction, or structured evidence into human approval

## Evidence Status

- `docs/plans/native-migration-classification-calibration-1.65-plan.md` records the execution and acceptance plan.
- `scripts/lib/native-rule-extraction.mjs` implements classification priority, Chinese keyword handling, and conservative simple-table extraction.
- `scripts/resolve-native-migration.mjs` emits 1.65 structured native-migration evidence.
- `scripts/check-native-migration.mjs` validates 1.65 classification guardrails and Markdown / JSON proposed-action consistency.
- `examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual` proves the mixed-domain bilingual positive path.
- `test-fixtures/bad/bad-native-migration-*` 1.65 fixtures prove unsafe or inconsistent records are rejected.
- `releases/1.65.0/self-check-report.md` records verification commands and result.

## Known Limitations

- The parser is deterministic and conservative; it does not prove semantic completeness for every historical project rule.
- Chinese keyword support covers common governance/business/release vocabulary, not every domain phrase.
- Simple Markdown table extraction is intentionally narrow; complex tables remain human-review evidence.
- Strict proposed-action consistency checks require `--require-structured-evidence`.
- Native migration apply remains outside 1.65 and still requires Unified Apply Plan, Controlled Apply Readiness, Approval Record, and human approval.

## Acceptance

The release is accepted only if:

- syntax checks pass
- the 1.63, 1.64, and 1.65 strict native-migration examples pass
- the 1.65 bad fixtures fail in strict mode for their intended reasons
- manifest, README, package, VERSION, workflow-version assets, and release evidence are synchronized
- `npm run verify` passes

## Acceptance Evidence

Required before release:

- `node --check scripts/lib/native-rule-extraction.mjs`
- `node --check scripts/resolve-native-migration.mjs`
- `node --check scripts/check-native-migration.mjs`
- `node scripts/check-native-migration.mjs examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual --require-structured-evidence`
- 1.65 bad fixtures fail for their intended reasons
- `node scripts/check-manifest.mjs`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`
- `git diff --check`

## Verification

See `releases/1.65.0/self-check-report.md`.
