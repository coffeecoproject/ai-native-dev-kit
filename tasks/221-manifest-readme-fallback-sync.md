---
artifact_type: task
id: 221-manifest-readme-fallback-sync
status: approved
---

# Task: 221-manifest-readme-fallback-sync

## Human Summary

Implement the 1.12.1 calibration patch and verify the release.

## Spec Ref

- `specs/221-manifest-readme-fallback-sync.md`

## Eval Ref

- `evals/221-manifest-readme-fallback-sync.md`

## Change Boundary

Allowed paths:

- `dev-kit-manifest.json`
- `package.json`
- `templates/workflow-version.json`
- `templates/version-record.md`
- `VERSION.md`
- `README.md`
- `README.zh-CN.md`
- `scripts/check-manifest.mjs`
- `scripts/check-ai-workflow.mjs`
- `scripts/check-dev-kit.mjs`
- `scripts/check-fixtures.mjs`
- `requests/`
- `preflight/`
- `specs/`
- `evals/`
- `tasks/`
- `final-reports/`
- `releases/1.12.1/`

Forbidden paths:

- CODEOWNERS owner assignment.
- License terms.
- Standard baseline pack registry.
- Target-project code.

## Implementation Steps

1. Add manifest phase equality checks.
2. Sync README self-check commands.
3. Sync `check-ai-workflow` fallback assets.
4. Update version metadata to 1.12.1.
5. Add release evidence.
6. Run full verification.

## Human Approval

Status: Approved

Approval scope: dev-kit calibration patch only.
