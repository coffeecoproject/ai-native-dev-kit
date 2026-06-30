# Subagent Dispatch Hygiene Example

This example shows a clean recover-before-dispatch state:

- no stale task helper remains active
- completed helpers are closed
- unused planned helpers are skipped
- task drift is checked
- dispatch is allowed only after cleanup
- active writer count is at most one

Check it with:

```bash
node scripts/check-subagent-orchestration.mjs examples/1.39-subagent-dispatch-hygiene
```
