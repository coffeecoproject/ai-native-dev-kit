# Product Completeness Gate

Use Product Completeness Gate after a first slice exists or when deciding whether a simple product can be tried.

```bash
node scripts/cli.mjs product-completeness . --intent "booking app first version"
node scripts/cli.mjs product-completeness-check .
```

The output should be plain:

- current product state;
- what is complete;
- what is missing;
- what Codex can do next;
- what still needs a human decision.

It is not a release approval.
