# 1.27 Debt & Knowledge Handoff Example

This example shows how to record unfinished debt and handoff knowledge without turning that record into approval.

Use this when:

- a task is interrupted
- a long-running task is paused
- verification debt remains
- the next Codex run needs a reliable starting point

Run:

```bash
node scripts/check-debt-handoff.mjs examples/1.27-debt-knowledge-handoff
```

The example is intentionally read-only. It does not forgive debt, approve implementation, approve release, change task state, or replace Review Loop / Safe Launch.
