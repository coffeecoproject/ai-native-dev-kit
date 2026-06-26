# Example: Web Industrial BL2 First Slice

This example shows how a Web BL2 slice connects project baseline selection, baseline evidence, task gating, release evidence, and AI task logging.

It is not a product template and does not bind the project to a framework or hosting provider.

This example intentionally exercises many Web evidence categories. A real task should require only the evidence subset triggered by its Risk Gate, selected packs, and release scope.

Flow:

```text
baseline selection
  -> baseline evidence
  -> request
  -> preflight
  -> spec
  -> eval
  -> task
  -> runtime evidence
  -> release record
  -> review packet
  -> review loop report
  -> AI task log
```

Files:

- `docs/baseline-selection.md`
- `docs/baseline-evidence.md`
- `requests/001-web-runtime-quality.md`
- `preflight/001-web-runtime-quality.md`
- `specs/001-web-runtime-quality.md`
- `evals/001-web-runtime-quality.md`
- `tasks/001-web-runtime-quality.md`
- `evidence/web-runtime-evidence.md`
- `releases/001-web-runtime-quality-release.md`
- `review-packets/001-web-runtime-quality.md`
- `review-loop-reports/001-web-runtime-quality.md`
- `ai-logs/2026-06-26-web-runtime-quality.md`

In a real project, the evidence refs should point to that project's own tests, screenshots, traces, command output, release records, and review notes.
