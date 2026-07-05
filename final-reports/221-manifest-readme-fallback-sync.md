---
artifact_type: final_report
id: 221-manifest-readme-fallback-sync
status: completed
---

# Final Report: 221-manifest-readme-fallback-sync

## Human Summary

1.12.1 completed the manifest, README, fixture, and fallback calibration patch. The patch keeps the 1.12.0 product scope unchanged while preventing version phase drift, stale README self-check guidance, and stale fallback workflow asset checks.

## Task Ref

- `tasks/221-manifest-readme-fallback-sync.md`

## Change Boundary

Intended scope:

- Dev-kit metadata, README self-check guidance, fallback required paths, version metadata, and release evidence.

Actual changed files:

- `intentos-manifest.json`
- `package.json`
- `templates/workflow-version.json`
- `VERSION.md`
- `templates/version-record.md`
- `README.md`
- `README.zh-CN.md`
- `scripts/check-manifest.mjs`
- `scripts/check-intentos.mjs`
- `scripts/check-ai-workflow.mjs`
- `scripts/check-fixtures.mjs`
- `requests/221-manifest-readme-fallback-sync.md`
- `preflight/221-manifest-readme-fallback-sync.md`
- `specs/221-manifest-readme-fallback-sync.md`
- `evals/221-manifest-readme-fallback-sync.md`
- `tasks/221-manifest-readme-fallback-sync.md`
- `final-reports/221-manifest-readme-fallback-sync.md`
- `releases/1.12.1/release-record.md`
- `releases/1.12.1/known-limitations.md`
- `releases/1.12.1/self-check-report.md`

Boundary result:

- PASS. No target-project files, production gates, CODEOWNERS, standard baseline packs, or real-project write authority were added.

## Baseline State

- No target-project baseline was confirmed or changed.
- No standard baseline pack was introduced.

## Verification

PASS:

```bash
node --check scripts/check-manifest.mjs
node --check scripts/check-ai-workflow.mjs
node --check scripts/check-intentos.mjs
node --check scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs --case "migration manifest version mismatch"
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Residual Risk

- The checkers still validate recorded reports and repository assets; they do not scan or approve real target-project changes.
- `check-ai-workflow` fallback coverage is still a fallback only. Authoritative generated projects should use `.intentos/intentos-manifest.json`.
- CODEOWNERS and standard baseline packs remain out of scope.

## Next Safe Action

Review the 1.12.1 patch diff and decide whether to commit/push.
