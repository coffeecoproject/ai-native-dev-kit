# 1.8 Real Project Read-only Adoption Example

This example shows the public shape of a real-project adoption trial without exposing private project details.

It represents:

- one governed production-sensitive Web project
- read-only inspection only
- no target-project writes
- no concrete target name or path in public evidence
- `NO_WRITE_MAP` as the first bridge mode
- patch classification as routing, not implementation authorization

Run:

```bash
node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly
node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly
```
