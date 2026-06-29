# 1.22 Work Queue Example

This example shows how to record one current task, one paused task, and one parked item without approving implementation.

Run:

```bash
node scripts/check-work-queue.mjs examples/1.22-work-queue
node scripts/resolve-work-queue.mjs examples/1.22-work-queue
```

Expected result:

- the checker passes
- one `CURRENT` task is detected
- the paused task requires resume review
- the backlog item is parked, not executable
