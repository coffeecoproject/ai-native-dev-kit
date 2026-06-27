# Product Baseline Guide

## Human Summary

Product Baseline keeps AI Native Dev Kit from growing into an over-automated system that asks less from humans but also hides risk.

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

- what humans still decide
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
what needs confirmation
what AI can do
what AI must not do
what evidence exists
what remains limited
```
