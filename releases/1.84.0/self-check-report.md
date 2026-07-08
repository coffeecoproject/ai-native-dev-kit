# IntentOS 1.84.0 Self-Check Report

## Scope

This self-check covers Existing Project Work Queue Takeover assets, scripts,
CLI entry, examples, bad fixtures, release metadata, and version alignment.

## Positive Coverage

- Reliable existing task system maps to `PROJECT_NATIVE_MAPPED`.
- Messy TODO/session records recommend `INTENTOS_WORK_QUEUE`.
- Missing task system recommends establishing `INTENTOS_WORK_QUEUE`.
- Unsafe takeover signals block takeover.

## Negative Coverage

The checker rejects reports that:

- activate all old TODOs;
- contain more than one `CURRENT` queue item;
- mark a `CURRENT` queue item without Task Governance ref/digest;
- delete old task sources;
- claim full adoption;
- make backlog items executable;
- promote stale sources to `CURRENT`;
- approve implementation.

## Verification Commands

```bash
node --check scripts/resolve-work-queue-takeover.mjs
node --check scripts/check-work-queue-takeover.mjs
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/messy-todo-migration --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/missing-task-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/unsafe-dirty-project --require-structured-evidence
node scripts/cli.mjs queue-takeover examples/1.84-work-queue-takeover/messy-todo-migration --intent "continue old project tasks"
node scripts/cli.mjs queue-takeover-check examples/1.84-work-queue-takeover/messy-todo-migration --require-structured-evidence
npm run verify:syntax
npm run verify:governance
npm run verify:examples
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```

## Result

PASS.

The final release commit verification ran the 1.84 resolver/checker syntax
checks, positive examples, bad fixture rejection checks, CLI delegation checks,
and package verification surfaces listed above. A first `verify:release` pass
found missing claim-control sections in the release record; the release record
was corrected and the final verification pass must remain green before commit.
