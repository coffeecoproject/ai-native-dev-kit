# Product Completeness Gate

Use Product Completeness Gate after a first slice exists or when deciding whether a simple product can be tried.

```bash
node scripts/cli.mjs product-completeness . --intent "booking app first version"
node scripts/cli.mjs product-completeness . --evidence evidence/smoke-output.txt
node scripts/cli.mjs product-completeness . --evidence evidence/smoke-output.json
node scripts/cli.mjs product-completeness-check .
```

The output should be plain:

- current product state;
- what is complete;
- what is missing;
- what Codex can do next;
- what still needs a human decision.

Use `--evidence` when a local smoke test, demo run, or manual trial output has already been recorded. Text evidence remains supported for compatibility. Structured JSON evidence is preferred for new examples and should match `schemas/artifacts/product-completeness-evidence.schema.json`.

Explicit evidence strengthens the local MVP judgment, but it still does not prove production readiness or real-user adoption.

It is not a release approval.
