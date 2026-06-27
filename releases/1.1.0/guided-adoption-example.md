# Guided Adoption Example Evidence

## Purpose

Prove saved recommendation examples are checkable and cover the intended first-hour cases.

## Cases

- `examples/1.1-guided-adoption/new-project`
- `examples/1.1-guided-adoption/existing-light-project`
- `examples/1.1-guided-adoption/governed-readonly`

## Commands

```bash
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
```

## Expected

All examples pass. The governed example must block direct setup.

## Result

PASS.
