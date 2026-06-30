# Subagent Orchestration Closed Run Example

This example shows a safe helper-agent run:

- many readers, one writer
- reviewer is read-only
- builder is the only writer
- dispatch hygiene is checked before any future helper dispatch
- every subagent is `CLOSED`
- no subagent is left occupying a slot after handoff

Check it with:

```bash
node scripts/check-subagent-orchestration.mjs examples/subagent-orchestration-closed-run
```
