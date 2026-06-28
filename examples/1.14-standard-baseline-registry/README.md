# 1.14 Standard Baseline Registry Example

This example shows a BL1 Web project selecting the Web runtime standard pack.

It does not select BL2 industrial overlays and does not approve implementation.

## Checks

```bash
node scripts/resolve-standard-baseline.mjs examples/1.14-standard-baseline-registry
node scripts/check-standard-baseline-selection.mjs examples/1.14-standard-baseline-registry --strict --compare-resolver
```
