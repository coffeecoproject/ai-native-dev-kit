# Guided Delivery Check

Guided Delivery Check validates the evidence created by the Guided Decision & Delivery Loop.

It checks that:

- Active Work Thread reports keep a current mainline.
- Parking-lot items are not treated as approved backlog.
- Guided Decision Summary uses valid `D0`-`D4` decision levels.
- `D3` and `D4` decisions do not claim implementation approval.
- Final reports keep a next safe action.

## Command

```bash
node scripts/check-guided-delivery-loop.mjs .
```

## Boundary

The checker validates recorded guided-delivery evidence. It does not decide the correct product direction and does not approve implementation, release, or risk.

