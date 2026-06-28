# Release Record: 1.12.0 Change Boundary, Guided Delivery Check & Baseline State Guard

## Human Summary

1.12.0 makes the dev kit easier to judge in real use: Codex must show what it was allowed to change, what it actually changed, and whether a baseline is only proposed or truly evidenced.

## Scope

- Change Boundary protocol, report template, prompt, checklist, checker, examples, and bad fixtures.
- Baseline State protocol, report template, prompt, checklist, checker, examples, and bad fixtures.
- Guided Delivery standalone checker for active work thread, parking lot, and D0-D4 decision boundaries.
- CLI, `new-workflow-item`, init/update, manifest, workflow-version, CI, docs, and platform template integration.
- 1.12 workflow evidence and self-check coverage.

## Allowed Claims

- The dev kit can now check recorded Change Boundary reports.
- The dev kit can now check recorded Baseline State reports.
- The dev kit can now check Guided Delivery Loop artifacts directly.
- The generated project asset set can include these new docs, prompts, templates, report directories, and checkers.
- CI and `npm run verify` include the 1.12 checks.

## Forbidden Claims

- This release does not prove production project adoption.
- This release does not automatically inspect or mutate real projects.
- This release does not approve target-project writes.
- This release does not approve production launch, release, payment, privacy, security, compliance, migration, or risk acceptance.
- This release does not make no-code baselines implemented or production-ready.
- This release does not add automatic GPT/API review.
- This release does not promote industrial packs.

## Evidence Status

- Source assets: PASS
- Manifest: PASS
- Self-check: PASS
- Release verify: PASS
- Real-project validation: not claimed

## Verification

```bash
node --check scripts/check-guided-delivery-loop.mjs
node --check scripts/check-change-boundary.mjs
node --check scripts/check-baseline-state.mjs
node scripts/check-guided-delivery-loop.mjs examples/1.12-change-boundary-baseline-state
node scripts/check-change-boundary.mjs examples/1.12-change-boundary-baseline-state --report change-boundary-reports/001-appointment-first-slice.md
node scripts/check-baseline-state.mjs examples/1.12-change-boundary-baseline-state --report baseline-state-reports/001-no-code-baseline.md
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Known Limitations

See `releases/1.12.0/known-limitations.md`.
