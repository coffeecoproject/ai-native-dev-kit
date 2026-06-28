---
artifact_type: preflight
id: 230-baseline-pack-system
status: approved
---

# Preflight: 230-baseline-pack-system

## Human Summary

This phase should make baseline pack choice easier for users, not heavier. It must keep selection read-only until the human confirms BL level and packs.

## Request Ref

- `requests/230-baseline-pack-system.md`

## Existing Context

- Profiles already exist for Web, WeChat Mini Program, iOS, Android, backend API, internal admin, and high-risk change.
- Industrial packs already exist as draft packs for primary platforms, capabilities, and risk overlays.
- Current pack guidance exists in `industrial-packs/selection-guide.md`, but it is not yet exposed as a simple front-door command or report checker.

## Risk Gate

- Target project writes: not allowed.
- BL2 selection: human decision required.
- Draft pack acceptance: human decision required.
- Production readiness: not claimed.
- Pack stability promotion: not in scope.

