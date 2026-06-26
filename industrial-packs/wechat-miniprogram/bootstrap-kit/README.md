# Mini Program Bootstrap Kit

Use this pack after the project has selected BL2 industrial mode and mini program delivery is in scope.

Recommended first steps:

1. Audit runtime, platform permissions, cloud capability, storage, and release assumptions.
2. Decide whether admin backend, API, CloudBase, auth, data, payment, or high-risk companion packs are in scope.
3. Draft project `docs/baseline-selection.md`.
4. Draft project `docs/baseline-evidence.md`.
5. Run `node scripts/check-industrial-pack.mjs . --selected-only`.
6. Run `node scripts/check-industrial-baseline.mjs . --bl2-only`.
7. Use strict mode only after human approval.

Do not treat this pack as covering an operations/admin backend by itself. Use `internal-admin-industrial` and backend/cloud/auth/data companion packs when those surfaces exist.
