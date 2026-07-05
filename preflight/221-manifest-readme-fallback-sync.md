---
artifact_type: preflight
id: 221-manifest-readme-fallback-sync
status: approved
---

# Preflight: 221-manifest-readme-fallback-sync

## Human Summary

This is a patch calibration after 1.12.0. It should make existing guarantees harder to drift, not introduce a new baseline-pack system.

## Request Ref

- `requests/221-manifest-readme-fallback-sync.md`

## Existing Context

- Current release before this work: `1.12.0`.
- Independent review found `compatibilityPolicy.phase` still set to `1.11.0`.
- README self-check commands did not list 1.12 checks or `npm run verify`.
- `check-ai-workflow.mjs` fallback paths lagged behind manifest-backed 1.12 assets.

## Risk Gate

- Target project writes: not applicable.
- Public claims: must remain source-level only.
- CODEOWNERS: not changed because real maintainers require human decision.
- Standard baseline packs: not started in this patch.

## Baseline References

- `intentos-manifest.json`
- `scripts/check-manifest.mjs`
- `scripts/check-ai-workflow.mjs`
- `README.md`
- `README.zh-CN.md`
- `core/change-boundary.md`
- `core/baseline-state.md`
