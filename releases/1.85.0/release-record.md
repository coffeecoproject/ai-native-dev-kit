# IntentOS 1.85.0 Release Record

## Theme

Task Governance Consumer Integration.

1.85.0 connects Work Queue and Task Governance entry records into downstream
completion/status consumers.

## Changes

- Added `core/task-governance-consumer-integration.md`.
- Added `docs/task-governance-consumer-integration.md`.
- Added `scripts/lib/task-entry-binding.mjs` to share strict task-entry
  binding checks across consumers.
- Added optional `task_entry_binding` schema support to Execution Assurance and
  Completion Evidence.
- Added `--require-task-governance`, `--require-work-queue`, and
  `--strict-task-consumer` to:
  - `scripts/check-execution-assurance.mjs`;
  - `scripts/check-completion-evidence.mjs`;
  - `scripts/check-closure-decision.mjs`;
  - `scripts/check-user-delivery-console.mjs`.
- Updated Execution Assurance, Completion Evidence, Unified Closure, and User
  Delivery Console docs/templates to describe Task Entry Binding.
- Added examples for a high-impact task with complete evidence and a
  possible-high task that must remain blocked.
- Added bad fixtures for missing task-entry binding and unresolved
  `POSSIBLE_HIGH` done claims.
- Updated package verification and `check-intentos` coverage.

## Compatibility

Historical reports remain compatible by default. The new checks are opt-in
through strict flags:

```bash
--require-task-governance
--require-work-queue
--strict-task-consumer
```

Strict mode is intended for current task completion/status claims.

## Boundary

1.85.0 remains non-authorizing:

- no target-project writes;
- no implementation approval;
- no completion approval by itself;
- no commit/push approval;
- no release/production approval;
- no new closure system;
- no replacement of Execution Assurance, Completion Evidence, Unified Closure,
  User Delivery Console, Work Queue, Task Governance, or project-native
  reviewers.

## Allowed Claims

- Strict consumers can require a current Work Queue item.
- Strict consumers can require a matching Task Governance report and digest.
- Strict consumers can reject completion/status claims for stale queue items,
  wrong task refs, wrong tier, unresolved `POSSIBLE_HIGH`, or missing tier
  evidence.
- LOW/MEDIUM/HIGH reports may remain blocked without fabricating evidence as
  long as they do not claim done.
- User-facing status can stay plain while technical trace records the binding.

## Forbidden Claims

- This release does not make Work Queue or Task Governance executable by
  themselves.
- This release does not authorize implementation.
- This release does not approve implementation or completion.
- This release does not prove product correctness or real-environment behavior.
- This release does not approve release or production.
- This release does not approve release, production, CI, hooks, secrets,
  migrations, payments, permissions, or project authority changes.
- This release does not require users to inspect raw digests or internal schema
  fields.

## Evidence Status

- New helper syntax is covered by `verify:syntax`.
- Positive examples cover:
  - a high-impact Execution Assurance done claim bound to current Work Queue
    and Task Governance;
  - a possible-high Completion Evidence blocked state;
  - a possible-high Unified Closure blocked state;
  - a possible-high User Delivery Console blocked state.
- Bad fixtures cover:
  - strict closure without task-entry binding;
  - unresolved `POSSIBLE_HIGH` incorrectly claiming done.
- `check-intentos` covers assets, docs, verify surfaces, examples, bad fixtures,
  and release evidence.

## Known Limitations

- 1.85.0 is a consumer integration layer, not a task execution layer.
- Strict flags are opt-in so historical reports remain compatible.
- Strict mode requires recorded Work Queue and Task Governance artifacts; it
  does not create those artifacts automatically.
- Task Entry Binding proves identity and tier consistency, not product
  correctness.
- User-facing status remains a derived view; project-native reviewers and
  release owners remain authoritative.
- HIGH task completion still requires source-system evidence outside this
  helper. The helper only checks that the consumer acknowledges the high-impact
  evidence-chain status.
- Existing projects may map project-native task systems, but stale or missing
  bindings cannot be used for done claims in strict mode.

## Verification

Expected acceptance commands:

```bash
node --check scripts/lib/task-entry-binding.mjs
node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --report completion-evidence-reports/001-possible-high-blocked.md --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
npm run verify:syntax
npm run verify:baseline
npm run verify:governance
npm run verify:industrial
npm run verify:examples
npm run verify:release
git diff --check
```

## Result

Release accepted when the self-check commands in
[`self-check-report.md`](self-check-report.md) pass.
