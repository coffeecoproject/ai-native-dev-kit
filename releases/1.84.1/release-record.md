# IntentOS 1.84.1 Release Record

## Theme

Work Queue Takeover Hardening.

1.84.1 tightens the 1.84 old-project task-entry path so Codex cannot turn
stale, risky, or weak old task records into executable work.

## Changes

- Added `source_digest` to Work Queue Takeover source inventory.
- Added matching `source_digest` to migration dispositions.
- Added `source_item_digest` to queue items.
- Added `task_governance_binding_status`.
- Added `execution_review_eligible_after_task_governance`.
- Added `takeover_review_ready` to clarify that readiness is review readiness.
- Updated resolver logic so stale or risky sources cannot become `CURRENT`.
- Updated resolver logic to prefer a safe source already marked `CURRENT` before
  a generic old TODO source.
- Updated resolver output so migrated `CURRENT` items remain
  `execution_eligible: No` until Task Governance is verified.
- Updated checker logic to reject stale/risky `CURRENT` promotion, source digest
  mismatch, non-current executable items, pending-current execution claims, and
  unresolved verified Task Governance bindings.
- Regenerated 1.84 Work Queue Takeover examples with 1.84.1 evidence.
- Updated public docs, templates, script reference, README, VERSION, manifest,
  and release self-check evidence.

## Compatibility

The user-facing commands are unchanged:

```bash
node scripts/cli.mjs queue-takeover <project> --intent "<goal>"
node scripts/cli.mjs queue-takeover-check <project>
```

The evidence schema version is `1.84.1`.

## Boundary

1.84.1 remains non-authorizing:

- no target-project writes;
- no old task source deletion;
- no `.intentos/` installation;
- no `AGENTS.md`, CI, release, runtime, API, Web, DB, Docker, production, secret,
  payment, or permission changes;
- no implementation approval;
- no completion approval;
- no commit/push approval;
- no release/production approval;
- no full-adoption claim;
- no direct execution from old TODO/session records.

## Allowed Claims

- Work Queue Takeover now records source digests for discovered old task
  sources.
- Migration dispositions and queue items now carry matching source identity.
- Stale and risky sources are blocked from becoming `CURRENT`.
- A safe source already marked `CURRENT` is preferred over a generic old TODO
  when selecting the migrated current candidate.
- Migrated `CURRENT` items remain non-executable until Task Governance is
  verified.
- `takeover_review_ready` clarifies that takeover reports can be reviewed
  without granting implementation permission.

## Forbidden Claims

- This release does not implement, test, or complete project tasks.
- This release does not authorize execution from old TODOs, sessions, issues,
  handoffs, roadmaps, AI logs, or chat history.
- This release does not approve implementation, completion, commit, push,
  release, production, CI changes, hooks, migrations, native apply, or full
  adoption.
- This release does not delete or rewrite old task sources.
- This release does not prove a Task Governance binding exists unless a real
  Task Governance report resolves and its digest matches.
- This release does not replace project-native task systems, issue trackers,
  release authority, CI gates, production authority, or business authority.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Work Queue Takeover CLI smoke remains covered by `verify:governance`.
- Positive examples cover reliable, messy, missing, and unsafe takeover states
  with 1.84.1 structured evidence.
- Bad fixtures cover all-task activation, multiple current items, missing Task
  Governance ref, old-source deletion, full-adoption overclaim, executable
  backlog, stale current promotion, and implementation authorization.
- `check-intentos` covers 1.84.1 release files, source-digest markers,
  pending-binding markers, CLI delegation, examples, fixtures, and package
  verification surfaces.

## Known Limitations

- 1.84.1 is still a takeover review layer, not a task execution system.
- `takeover_review_ready: Yes` is review readiness, not implementation
  readiness.
- Generated `CURRENT` items stay `execution_eligible: No` until a real Task
  Governance report is verified.
- Source discovery is conservative markdown scanning and may still require
  project-specific review for unusual task systems.
- 1.85 is expected to connect Work Queue Takeover candidates into downstream
  execution and completion consumers.

## Verification

Expected acceptance commands:

```bash
node --check scripts/resolve-work-queue-takeover.mjs
node --check scripts/check-work-queue-takeover.mjs
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/messy-todo-migration --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/missing-task-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/unsafe-dirty-project --require-structured-evidence
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
