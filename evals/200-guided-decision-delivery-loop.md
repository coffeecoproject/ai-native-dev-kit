# Eval: Guided Decision & Delivery Loop

## Related Spec

`specs/200-guided-decision-delivery-loop.md`

## Acceptance Criteria

- Decision Delegation Boundary exists and documents D0/D1/D2/D3/D4.
- Guided Delivery Loop exists and documents current mainline, parking lot, and next safe action.
- Active Work Thread and Guided Decision Summary templates exist.
- Delivery Coach prompt exists and is advisory only.
- `new-workflow-item` can create both new artifact types.
- Docs explain that these artifacts are optional and do not approve implementation.
- Manifest, workflow version assets, init/update, and platform adapters include the new assets.
- Self-check covers the new protocol enough to prevent drift.

## Verification Commands

```bash
node --check scripts/new-workflow-item.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Expected Result

PASS
