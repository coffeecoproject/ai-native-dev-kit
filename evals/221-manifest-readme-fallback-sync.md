---
artifact_type: eval
id: 221-manifest-readme-fallback-sync
status: approved
---

# Eval: 221-manifest-readme-fallback-sync

## Human Summary

Verify that the 1.12.1 patch catches the exact drift reported in the 1.12.0 review and keeps release claims narrow.

## Spec Ref

- `specs/221-manifest-readme-fallback-sync.md`

## Required Evidence

```bash
node --check scripts/check-manifest.mjs
node --check scripts/check-ai-workflow.mjs
node --check scripts/check-dev-kit.mjs
node --check scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs --case "migration manifest version mismatch"
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Negative Coverage

- Manifest phase mismatch should fail `check-manifest`.
- Pure manifest version mismatch should still fail with the existing VERSION drift message.
- README self-check drift should fail `check-dev-kit`.

## Claim Boundary

Passing this eval proves metadata and self-check calibration only. It does not prove production adoption, real-project validation, standard baseline pack maturity, or commercial-use permission.
