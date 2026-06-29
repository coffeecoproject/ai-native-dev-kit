# Release 1.22.0 - Work Queue / Todo Governance

## Human Summary

1.22.0 adds Work Queue / Todo governance.

It helps Codex keep one current task, park side requests, pause interrupted work, and resume stale work only after review.

## Theme

1.22.0 adds an independent Work Queue layer for interrupted work, long-running work, pause/resume, backlog parking, and single-current-task enforcement.

## Why

Existing workflow layers already handle baseline selection, old-project adoption, patch classification, document lifecycle, review loops, and delivery readiness.

They did not yet give Codex a durable task-state ledger for:

- work paused halfway through
- long-running tasks that span sessions
- side requests that should be parked
- switching tasks safely
- resuming stale work with current-state checks
- preventing multiple active tasks from drifting in parallel

## Added

- `core/work-queue.md`
- `docs/work-queue.md`
- `templates/work-queue-report.md`
- `checklists/work-queue-review.md`
- `prompts/work-queue-agent.md`
- `work-queue/`
- `scripts/resolve-work-queue.mjs`
- `scripts/check-work-queue.mjs`
- `new-workflow-item --type work-queue-report`
- `cli.mjs work-queue`
- `cli.mjs work-queue-check`
- passing example in `examples/1.22-work-queue/`
- bad fixtures for multiple current tasks and resume without review

## Allowed Claims

- 1.22.0 adds a Work Queue / Todo governance layer.
- Work Queue enforces at most one `CURRENT` task in recorded reports.
- Paused tasks require resume review before execution.
- Backlog items are parked work, not execution permission.
- The resolver is read-only and does not change task state.
- The checker validates recorded Work Queue Reports.

## Forbidden Claims

- Do not claim Work Queue approves implementation.
- Do not claim Work Queue approves target-project writes.
- Do not claim Work Queue approves scope expansion.
- Do not claim Work Queue approves release or production.
- Do not claim Work Queue replaces task cards, specs, Review Loop, launch readiness, risk policy, or human decisions.
- Do not claim Work Queue resumes stale work without review.
- Do not claim this implements hook orchestration.

## Evidence

- `node scripts/resolve-work-queue.mjs .`
- `node scripts/check-work-queue.mjs .`
- `node scripts/check-work-queue.mjs examples/1.22-work-queue`
- bad fixture checks in `scripts/check-dev-kit.mjs`
- `npm run verify`
- `npm run verify:release`

## Evidence Status

- Evidence is based on local repository checks, examples, bad fixtures, generated-project smoke, and source self-check.
- No target-project task state is changed by the resolver or checker.
- No implementation, target-project write, release, production, or stale-work resume approval is claimed.

## Known Limitations

- `work-queue` prints a read-only recommendation; it does not write or update a Work Queue report.
- `check-work-queue` validates recorded reports; it does not discover every hidden task in a real project.
- Work Queue does not replace task cards, specs, Review Loop, launch readiness, risk policy, or human decisions.
- Hook orchestration remains a later phase.

## Verification

Required checks:

```bash
node scripts/resolve-work-queue.mjs .
node scripts/resolve-work-queue.mjs . --json
node scripts/check-work-queue.mjs .
node scripts/check-work-queue.mjs examples/1.22-work-queue
node scripts/check-dev-kit.mjs
npm run verify:release
npm run verify
git diff --check
```

## Boundary

This release is a workflow governance upgrade. It does not change any business application, does not create a scheduler/hook runner, and does not authorize implementation.
