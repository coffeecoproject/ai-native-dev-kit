# Example: Generic First Change

This example shows the shape of the first IntentOS workflow package without binding to any business domain.

Example goal:

```text
actor intent
  -> interface or command
  -> operation
  -> state/resource change
  -> rule check
  -> verification evidence
```

Files:

- `request-card.md`
- `preflight-report.md`
- `spec.md`
- `eval.md`
- `task-card.md`

In a real project, copy these into:

```text
requests/
preflight/
specs/
evals/
tasks/
```

