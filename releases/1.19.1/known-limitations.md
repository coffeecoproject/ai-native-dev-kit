# 1.19.1 Known Limitations

- Summary metrics are calibration evidence, not production validation.
- Synthetic fixtures still cannot replace sanitized real read-only trials.
- `precision-fixtures.json` externalizes case ids and metadata, but fixture
  builders still live in `scripts/check-baseline-selection-precision.mjs`.
- JSON summary output is for review evidence; it does not approve writes,
  implementation, release, production, BL2 activation, or high-risk decisions.
- Remote GitHub Actions evidence is not embedded until a run URL is recorded
  after push.
