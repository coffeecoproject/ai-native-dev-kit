# Known Limitations: 1.13.0

## Human Summary

1.13.0 makes baseline pack selection clearer and safer. It does not make the draft industrial packs stable or production-proven.

## Limitations

- All current industrial packs remain draft unless their own maturity metadata says otherwise.
- `baseline-packs` is a read-only recommendation command; it does not install or enable packs.
- `check-baseline-pack-selection` checks recorded reports; it does not automatically inspect full source-code correctness.
- BL2 selection still needs human acceptance and project evidence.
- Real project dogfood is still required before any pack can be promoted to candidate or stable.
- This release does not add automatic GPT/API review, real-project scanning, target-project write approval, release approval, production approval, or commercial-use authorization.

