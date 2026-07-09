# Release 1.88.2 Known Limitations

- `plan_review_binding` is enforced only when a consumer report includes it or
  the checker is run with `--require-plan-review`.
- Older reports remain compatible and are not retroactively rewritten.
- Plan Review Gate remains non-authorizing; downstream consumers must still
  obey Task Governance, Work Queue, project-native authority, Approval Record,
  and Controlled Apply Readiness rules.
- Controlled Apply Readiness can consume Plan Review evidence, but it still
  cannot apply files or proceed without explicit human approval.
