# Release 1.16.0: BL2 Industrial Baseline Deepening

## Human Summary

1.16.0 deepens the BL2 industrial baseline layer.

It does not add a new user-facing entry and does not make BL2 default. It makes the existing industrial packs more concrete so Codex can tell what each pack covers, what it does not cover, and what project evidence is required.

## What Changed

- Added `docs/bl2-industrial-baseline-deepening.md`.
- Added `docs/reference/bl2-industrial-pack-depth-matrix.md`.
- Deepened every concrete industrial pack with:
  - non-scope boundary
  - scope boundary
  - architecture baseline
  - environment baseline
  - data boundary
  - permission boundary
  - verification baseline
  - release and rollback
  - evidence template
  - bad cases
  - Codex forbidden actions
  - maturity limits
- Hardened `scripts/check-industrial-pack.mjs` so missing BL2 depth sections fail.
- Hardened `scripts/check-industrial-baseline.mjs` so BL2 all-pack defaults fail.
- Hardened risk overlay checks so payment/high-risk overlays need risk-specific evidence.
- Added 1.16 simulated examples:
  - `web-admin-data-auth`
  - `miniprogram-cloud-auth`
  - `mobile-api`
  - `payment-risk-overlay`
- Added bad fixtures for:
  - missing industrial pack depth contract
  - selecting all industrial packs by default
  - selecting a risk overlay without risk-specific evidence

## Allowed Claims

- Industrial packs now have a clearer BL2 depth contract.
- Platform packs now state companion-pack boundaries more explicitly.
- Risk overlays now require risk-specific evidence.
- The checker rejects missing depth sections, all-pack BL2 selection, and risk overlay misuse.
- The 1.16 examples are simulated evidence examples for checker coverage.

## Forbidden Claims

- Do not claim industrial packs are stable.
- Do not claim BL2 is default.
- Do not claim all industrial packs should be selected.
- Do not claim BL2 selection authorizes target-project writes.
- Do not claim BL2 selection approves implementation.
- Do not claim BL2 selection approves release or production.
- Do not claim security, privacy, legal, compliance, payment, finance, tax, HR, or migration approval.
- Do not claim real-project production validation.

## Evidence Status

- Self-check, fixture, and simulated example evidence only.
- No target project was modified.
- No production project validation is claimed.
- Examples prove checker routing and evidence shape, not real deployment readiness.

## Known Limitations

- Every industrial pack remains `draft`.
- The depth contract is stronger, but still needs real project dogfood before candidate/stable promotion.
- The risk overlay keyword checks catch obvious misuse; they are not a full financial, security, legal, compliance, or production risk review.
- iOS and Android examples validate baseline selection/evidence shape, not App Store or Play release readiness.
- Existing governed projects still need read-only mapping before controlled apply.

## Verification

Required checks:

```bash
node scripts/check-industrial-pack.mjs .
node scripts/check-industrial-baseline.mjs examples/1.16-bl2-industrial-deepening/web-admin-data-auth --strict
node scripts/check-industrial-baseline.mjs examples/1.16-bl2-industrial-deepening/miniprogram-cloud-auth --strict
node scripts/check-industrial-baseline.mjs examples/1.16-bl2-industrial-deepening/mobile-api --strict
node scripts/check-industrial-baseline.mjs examples/1.16-bl2-industrial-deepening/payment-risk-overlay --strict
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Next

Recommended next version:

```text
1.17.0 = Guided Baseline Selection Entry
```

1.17 should translate the strengthened baseline rules into a user-readable decision card.
