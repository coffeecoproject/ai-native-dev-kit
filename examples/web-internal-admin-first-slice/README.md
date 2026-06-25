# Example: Web Internal Admin First Slice

This example shows a filled workflow package for a small web internal-admin slice.

It is not a product template. It only demonstrates how request, preflight, spec, eval, task, and AI task log files connect.

Files:

- `request-card.md`
- `preflight-report.md`
- `spec.md`
- `eval.md`
- `task-card.md`
- `ai-task-log.example.md`

In a generated project, copy them into:

```text
requests/001-admin-work-item-list.md
preflight/001-admin-work-item-list.md
specs/001-admin-work-item-list.md
evals/001-admin-work-item-list.md
tasks/001-admin-work-item-list.md
ai-logs/2026-06-24-admin-work-item-list.md
```

Then run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```
