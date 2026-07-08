# IntentOS 1.84.1 Self-Check Report

## Scope

This self-check covers Work Queue Takeover source identity, current-candidate
selection, Task Governance binding semantics, examples, bad fixtures, release
metadata, and version alignment.

## Positive Coverage

- Reliable existing task system maps to `PROJECT_NATIVE_MAPPED`.
- Messy TODO/session records recommend `INTENTOS_WORK_QUEUE`.
- Missing task system recommends establishing `INTENTOS_WORK_QUEUE`.
- Unsafe takeover signals block takeover.
- Source inventory carries `source_digest`.
- Migration dispositions carry matching `source_digest`.
- Queue items carry matching `source_item_digest`.
- Migrated `CURRENT` items are `execution_eligible: No` until Task Governance is
  verified.
- `takeover_review_ready` is recorded separately from implementation authority.

## Negative Coverage

The checker rejects reports that:

- activate all old TODOs;
- contain more than one `CURRENT` queue item;
- mark a `CURRENT` queue item without Task Governance ref;
- invent a Task Governance digest while binding is still pending;
- make a pending `CURRENT` item execution eligible;
- delete old task sources;
- claim full adoption;
- make backlog items executable;
- promote stale or risky sources to `CURRENT`;
- approve implementation.

## Verification Commands

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

PASS. Local verification completed for the 1.84.1 work queue takeover
hardening release.
