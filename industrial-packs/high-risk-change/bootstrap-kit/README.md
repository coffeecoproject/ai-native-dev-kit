# High-risk Change Bootstrap Kit

Use this pack after the project has selected BL2 industrial mode and high-risk work is in scope.

Recommended first steps:

1. Audit production config, destructive operations, regulated data, migrations, security-sensitive areas, rollback, and monitoring assumptions.
2. Draft project `docs/baseline-selection.md`.
3. Draft project `docs/baseline-evidence.md`.
4. Run `node scripts/check-industrial-baseline.mjs .`.
5. Use strict mode only after human approval.
