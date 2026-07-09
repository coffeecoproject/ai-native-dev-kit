# Release 1.89.1: Adoption Assurance Apply Binding Hardening

## Summary

1.89.1 closes the P1 gaps found after 1.89.0.

This patch does not add a new workflow concept. It makes the existing adoption
and apply evidence chain stricter and more consistent.

## Changed Assets

- `scripts/lib/adoption-apply-chain.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/check-adoption-assurance.mjs`
- `scripts/init-project.mjs`
- `scripts/check-intentos.mjs`
- `schemas/artifacts/approval-record.schema.json`
- `schemas/artifacts/controlled-apply-readiness.schema.json`
- `schemas/artifacts/unified-apply-plan.schema.json`
- `templates/version-record.md`
- `templates/workflow-version.json`
- `package.json`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `intentos-manifest.json`
- `releases/1.89.1/*`

## Allowed Claims

- Adoption Assurance resolver and checker now use the same verified
  apply-chain interpretation.
- Apply-chain evidence is not `VERIFIED` merely because files exist.
- Strict Adoption Assurance checks fail when no report exists, unless
  maintainers explicitly pass `--allow-empty`.
- `init-project --apply-plan` now requires a structured human approval record.
- The approval record must match the init/update plan digest, executable action
  IDs, and exact target paths before apply can proceed.

## Forbidden Claims

- 1.89.1 does not approve implementation.
- 1.89.1 does not approve native apply by itself.
- 1.89.1 does not approve commit, push, release, production, tests, migrations,
  provider actions, or project-owner decisions.
- A valid approval record is a precondition for controlled apply, not permission
  to broaden scope or bypass project gates.

## Evidence Status

- Syntax checks cover the new shared apply-chain helper.
- Self-check covers `init-project --apply-plan` with approval-record binding.
- Self-check preserves tampered-plan rejection while an approval record is
  present.
- Targeted checks cover strict Adoption Assurance no-report failure and
  `--allow-empty` override behavior.

## Known Limitations

- 1.89.1 does not implement release identity/tag binding.
- 1.89.1 does not add Windows-specific raw backslash path fixtures.
- 1.89.1 does not add Work Queue over-40-source UI hardening.
- 1.89.1 does not pin GitHub workflow SHAs.

## Verification

Required verification:

```bash
npm run verify
git diff --check
```

Verification status is recorded in
[self-check-report.md](self-check-report.md).
