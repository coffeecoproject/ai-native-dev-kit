# 1.49 Structured Impact Coverage Example

This example shows a completed Change Impact Coverage closure record for a contract input restriction.

It demonstrates:

- `closure` mode
- structured `Machine-Readable Evidence`
- changed-file signals
- non-placeholder `DONE` evidence references
- explicit `NOT_APPLICABLE` reasons for data, permission, and release surfaces

Run:

```bash
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence
```
