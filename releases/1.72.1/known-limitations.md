# 1.72.1 Known Limitations

- Execution Assurance still validates recorded evidence. It does not independently prove product, business, release, legal, compliance, or production correctness.
- `--allow-empty` is only for asset-only maintenance checks. It must not be used to claim execution work is complete.
- 1.72.1 keeps the `execution_assurance_report` schema at `1.72.0`; this patch changes checker behavior, not report shape.
- A passing Execution Assurance check means the recorded proof chain is internally consistent for the stated task. It does not approve commit, push, release, production, or follow-up work.
