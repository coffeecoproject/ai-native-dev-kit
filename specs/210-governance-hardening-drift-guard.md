---
artifact_type: spec
id: 210-governance-hardening-drift-guard
status: approved
---

# Spec: 210-governance-hardening-drift-guard

## Human Summary

1.11.0 should make the kit stricter where drift is likely while keeping user-facing adoption simple.

## Request Ref

- `requests/210-governance-hardening-drift-guard.md`

## Requirements

1. README and README.zh-CN must list the current release record.
2. Direct init must refuse non-empty target directories unless `--force-new-project` is passed.
3. `--dry-run`, `--write-plan`, `--apply-plan`, and update paths must remain available.
4. Manifest checks must catch important source files that are not covered by source inventory or copy rules.
5. Release record checks must require meaningful section bodies for claim-control sections.
6. `npm run verify` must run the release-level verification chain.
7. Dev-kit self-check must cover the new negative and positive paths.

## Non-Requirements

- No production validation claim.
- No industrial pack maturity change.
- No fake owner rules.
- No target-project workflow write approval.

## Success Criteria

- All syntax checks pass.
- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-intentos.mjs` passes.
- `npm run verify` passes.
- `git diff --check` passes.

