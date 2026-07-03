# 1.64.0 Release Record

## Human Summary

1.64.0 hardens Native Migration parser calibration and evidence consistency. It does not add a new migration system; it makes 1.63 rule-level migration evidence harder to misuse.

## Theme

Native Migration Parser Calibration & Evidence Consistency.

## What Changed

- `scripts/lib/native-rule-extraction.mjs` now records skipped Markdown tables, long paragraphs, and low-signal governance text.
- `scripts/resolve-native-migration.mjs` emits 1.64 structured evidence with `skipped_blocks` and `low_signal_blocks`.
- `scripts/check-native-migration.mjs` strict mode now compares Markdown rule rows and Machine-Readable Evidence by `rule_id`.
- Strict mode validates structured `proposed_actions` as plan-only and human-approved.
- `scripts/resolve-existing-workflow.mjs` now describes Workflow Adoption Map as diagnostic and points adoption to Native Migration Plan.
- Added `examples/1.64-native-migration-parser-calibration/table-long-bilingual`.
- Added bad fixtures for rule JSON mismatch, line-range mismatch, missing skipped-block reporting, and structured action writes.

## Compatibility

Default `check-native-migration` remains compatible with older Markdown-only records.

Strict mode accepts 1.63 structured evidence and 1.64 structured evidence:

```bash
node scripts/check-native-migration.mjs <project> --require-structured-evidence
```

1.64-specific coverage fields are required when `schema_version` is `1.64.0`.

## Authority Boundary

1.64 still does not:

- write target-project files
- replace `AGENTS.md`
- approve implementation
- approve release or production
- edit CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- replace project business authority
- replace human or external production authority
- treat parser warnings, skipped blocks, low-signal blocks, or structured evidence as approval

## Allowed Claims

- IntentOS can record skipped tables, long paragraphs, and low-signal governance text during native migration planning.
- IntentOS can compare Markdown rule rows with Machine-Readable Evidence by `rule_id` in strict mode.
- IntentOS can reject structured Native Migration Plans whose Markdown and JSON disagree on rule class, line range, authority, handling, risk surface, target action, or confidence.
- IntentOS can reject structured proposed actions that try to write target files.
- Workflow Adoption Map is diagnostic; Native Migration Plan is the next adoption-planning step when the user wants IntentOS to become the Codex workflow.

## Forbidden Claims

1.64 does not:

- prove every old-project rule was found
- prove a target project is fully migrated
- authorize target-project writes
- approve governance replacement
- approve implementation, release, or production
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- replace project business or production authority
- turn parser warnings into human decisions

## Evidence Status

- `docs/plans/native-migration-parser-calibration-1.64-plan.md` records the execution and acceptance plan.
- `scripts/lib/native-rule-extraction.mjs` records skipped and low-signal blocks.
- `scripts/resolve-native-migration.mjs` emits 1.64 structured evidence.
- `scripts/check-native-migration.mjs` validates rule-id consistency and proposed actions.
- `scripts/resolve-existing-workflow.mjs` calibrates workflow-map wording.
- `examples/1.64-native-migration-parser-calibration/table-long-bilingual` proves 1.64 coverage behavior.
- `test-fixtures/bad/bad-native-migration-*` 1.64 fixtures prove unsafe records are rejected.
- `releases/1.64.0/self-check-report.md` records verification commands and result.

## Known Limitations

- The parser is deterministic and conservative; it reports skipped and low-signal blocks but does not prove semantic completeness.
- Table rows are reported for human review rather than automatically classified.
- Low-signal text under governance-like headings still requires human classification before governance replacement.
- Strict structured checks run only when `--require-structured-evidence` is requested.
- Migration apply remains outside 1.64 and still requires Unified Apply Plan, Controlled Apply Readiness, and Approval Record.

## Acceptance

The release is accepted only if:

- syntax checks pass
- the 1.64 strict positive example passes
- the 1.63 strict example remains compatible
- the 1.64 bad fixtures fail in strict mode
- workflow-map output says diagnostic and points adoption to Native Migration Plan
- manifest, README, package, VERSION, workflow-version assets, and release evidence are synchronized
- `npm run verify` passes

## Verification

See `releases/1.64.0/self-check-report.md`.
