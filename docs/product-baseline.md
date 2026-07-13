# Product Baseline Guide

## User Summary

Product Baseline keeps IntentOS from hiding risk while it removes technical judgment from the zero-experience user's responsibilities.

## When To Use

Use Product Baseline review when changing:

- workflow gates
- generated project assets
- release records
- README claims
- subagent rules
- review loop behavior
- industrial pack maturity
- automation behavior
- baseline setup behavior

## Practical Rule

If a change increases what AI can do, it must also say:

- what business, real-world consent, or external input the user still supplies
- what AI still must not do
- what evidence supports the change
- what evidence is still missing

## Required Command

```bash
node scripts/check-product-baseline.mjs .
```

## Human-facing Standard

The output should remain understandable:

```text
what happened
what is safe
what evidence or permitted user input is missing
what AI can do
what AI must not do
what evidence exists
what remains limited
```
