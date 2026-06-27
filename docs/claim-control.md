# Claim Control Guide

## Human Summary

Claim Control protects the project from saying more than the evidence proves.

## Why It Exists

AI Native Dev Kit uses simulations, generated-project smoke tests, examples, and dogfood. These are useful evidence, but they are not the same as production adoption evidence.

## Before Publishing

Check:

```bash
node scripts/check-claim-control.mjs .
```

## Good Wording

- "simulated dogfood passed"
- "generated-project smoke passed"
- "advisory by default"
- "requires human confirmation"
- "known limitations remain"

## Bad Wording

- "production proven"
- "guaranteed safe"
- "works for every project"
- "no human approval required"
- "report approves release"
- "draft pack is stable"

## Human Decision

Claims about release, customer delivery, commercial use, legal terms, production readiness, or risk acceptance must be confirmed by a human.
