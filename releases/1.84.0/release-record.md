# IntentOS 1.84.0 Release Record

## Theme

Existing Project Work Queue Takeover.

## Summary

IntentOS 1.84.0 adds a dedicated old-project task-entry layer. Before Codex
continues work in an existing project, it can inspect TODOs, sessions, issue
exports, handoffs, roadmaps, and existing Work Queue records, then decide
whether to map the existing task system, establish IntentOS Work Queue as the
future task authority, or block takeover.

This closes a gap left by Task Governance: 1.83 decides how a task should be
governed, but old projects may not have a reliable task entry at all. 1.84
normalizes that entry before execution planning.

## Added

- `core/existing-project-work-queue-takeover.md`
- `docs/existing-project-work-queue-takeover.md`
- `templates/work-queue-takeover-report.md`
- `schemas/artifacts/work-queue-takeover.schema.json`
- `checklists/work-queue-takeover-review.md`
- `prompts/work-queue-takeover-agent.md`
- `work-queue-takeover-reports/.gitkeep`
- `scripts/resolve-work-queue-takeover.mjs`
- `scripts/check-work-queue-takeover.mjs`
- CLI commands:
  - `queue-takeover`
  - `queue-takeover-check`
- Examples for:
  - reliable existing task system
  - messy TODO/session migration
  - missing task system
  - unsafe takeover block
- Bad fixtures for:
  - activating all TODOs
  - multiple current queue items
  - current item without Task Governance
  - deleting old task sources
  - claiming full adoption
  - executable backlog item
  - stale source becoming current
  - implementation authorization

## Classification Model

1. `RELIABLE_EXISTING_TASK_SYSTEM`
   - Map the project-native task system.
   - Do not duplicate it.

2. `MESSY_TASK_SYSTEM`
   - Preserve old records as source.
   - Recommend IntentOS Work Queue as future task authority.
   - Only one migrated item may become `CURRENT`.

3. `MISSING_TASK_SYSTEM`
   - Recommend establishing IntentOS Work Queue.
   - No old TODO may be treated as execution permission.

4. `UNSAFE_TO_TAKE_OVER`
   - Block takeover.
   - Keep only read-only diagnostic evidence.

## Boundaries

1.84.0 is non-authorizing. It does not:

- write target-project files;
- delete old task sources;
- approve implementation;
- approve completion;
- approve commit or push;
- approve release or production;
- claim full adoption;
- install native assets.

## Allowed Claims

- Existing projects can run a read-only Work Queue Takeover review before
  execution planning.
- Reliable project-native task systems can be mapped instead of replaced.
- Messy TODO/session sources can be preserved while recommending IntentOS Work
  Queue as the future task authority.
- Missing task systems can be classified without treating old notes as
  executable work.
- Unsafe project states block takeover and keep old task sources read-only.

## Forbidden Claims

- This release does not implement, test, or complete project tasks.
- This release does not authorize execution from old TODOs, sessions, issues,
  handoffs, or roadmaps.
- This release does not approve implementation, completion, commit, push,
  release, production, CI changes, hooks, migrations, or native apply.
- This release does not delete or rewrite old task sources.
- This release does not claim `FULL_ADOPTION` or install native project assets.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Work Queue Takeover CLI smoke is covered by `verify:governance`.
- Positive examples cover reliable, messy, missing, and unsafe takeover states.
- Bad fixtures cover all-task activation, multiple current items, missing Task
  Governance binding, source deletion, full-adoption overclaim, executable
  backlog, stale current promotion, and implementation authorization.
- `check-intentos` covers the 1.84 assets, package verify surface, CLI
  delegation, examples, fixtures, and release metadata.

## Known Limitations

- 1.84 is a takeover/readiness layer, not a task execution system.
- It does not prove a promoted `CURRENT` item has passed Task Governance; that
  consumer integration is reserved for 1.85.
- It does not clean up, archive, or rewrite old project task documents.
- It uses conservative markdown source discovery and can block takeover when
  task sources are ambiguous or unsafe.
- It does not replace project-native task systems, issue trackers, CI, release
  rules, or production authority.

## Verification

Expected acceptance commands:

```bash
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
```

## Next

1.85 should connect Work Queue Takeover to Task Governance as a consumer
integration. It should prove that a promoted `CURRENT` queue item cannot enter
implementation review without a matching Task Governance report.
