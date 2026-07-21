# Claim Control Guide

## Human Summary

Claim Control protects the project from saying more than the evidence proves.

## Why It Exists

IntentOS uses simulations, generated-project smoke tests, examples, and dogfood. These are useful evidence, but they are not the same as production adoption evidence.

## Before Publishing

Check:

```bash
node scripts/check-claim-control.mjs .
```

## Good Wording

- "simulated dogfood passed"
- "generated-project smoke passed"
- "advisory by default"
- "requires exact consent before the prepared production effect"
- "requires an external fact that project evidence cannot prove"
- "known limitations remain"

## Bad Wording

- "production proven"
- "guaranteed safe"
- "works for every project"
- "no human approval required"
- "report approves release"
- "draft pack is stable"

## Codex Claim Decision

Codex sets claim strength from the available evidence, records limitations, and owns release-readiness and risk-treatment wording. It must not turn missing technical evidence into a user decision.

## Bounded User Input

User input is permitted only when a claim depends on a missing business fact, exact consent to a prepared real-world effect, or an external legal, regulatory, provider, or third-party fact that project evidence cannot prove. Otherwise use `NO_USER_ACTION`.
