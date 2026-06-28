---
artifact_type: request
id: 221-manifest-readme-fallback-sync
status: approved
---

# Request: 221-manifest-readme-fallback-sync

## Human Summary

Ship a 1.12.1 calibration patch for the 1.12.0 release so manifest phase metadata, README self-check guidance, and `check-ai-workflow` fallback assets stay aligned.

## Goal

Resolve review findings from the 1.12.0 audit without adding a new product layer.

## Scope

- Align `dev-kit-manifest.json` `compatibilityPolicy.phase` with `devKitVersion`.
- Teach `check-manifest.mjs` and `check-dev-kit.mjs` to fail future phase drift.
- Add 1.12 checks and `npm run verify` to README self-check commands.
- Sync `check-ai-workflow.mjs` fallback required paths with 1.12 assets.
- Update version metadata and 1.12.1 release evidence.

## Out Of Scope

- Standard baseline pack registry.
- CODEOWNERS real owner assignment.
- Security policy SLA changes.
- Automatic real-project scanning.
- Automatic GPT/API review.
- Target-project write approval.

## Human Approval

Status: Approved

Approval scope: dev-kit metadata and self-check calibration only.
