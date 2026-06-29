# 1.23 Hook Orchestration Example

This example shows a plan-first hook recommendation.

Run:

```bash
node scripts/check-hook-orchestration.mjs examples/1.23-hook-orchestration
node scripts/resolve-hook-orchestration.mjs examples/1.23-hook-orchestration
```

Expected result:

- the checker passes
- H0/H1 candidates stay read-only or suggestion-only
- H2/H3 candidates require human approval
- no hook is installed
- no CI is changed
- no blocking gate is added

