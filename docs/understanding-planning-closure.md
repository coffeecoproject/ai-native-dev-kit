# Understanding And Planning Closure

IntentOS uses Planning Closure internally before controlled implementation.
The ordinary user continues to describe the desired result in natural
language. Codex checks the current task, scope, affected business behavior,
verification obligations, plan review, and any relied-on control proof.

The user sees one plain result:

- planning is ready and Codex can continue to controlled implementation;
- Codex is still completing technical planning;
- one unavailable business or external fact is needed;
- bounded technical discovery is required; or
- current evidence is blocked or invalid.

`PLANNING_READY` does not mean code may be changed automatically. Its Execution
Entry Contract is read-only and must be revalidated by the later execution
layer before any write.

Advanced diagnostics:

```bash
node scripts/cli.mjs planning-closure . --intent "describe the goal"
node scripts/cli.mjs planning-closure-check . --allow-empty
```

These commands are not required for ordinary use.

