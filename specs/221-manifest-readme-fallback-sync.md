---
artifact_type: spec
id: 221-manifest-readme-fallback-sync
status: approved
---

# Spec: 221-manifest-readme-fallback-sync

## Human Summary

1.12.1 should close the small but important drift gaps discovered after 1.12.0.

## Request Ref

- `requests/221-manifest-readme-fallback-sync.md`

## Requirements

1. `dev-kit-manifest.json` must set `devKitVersion` and `compatibilityPolicy.phase` to the same current version.
2. `scripts/check-manifest.mjs` must fail when `compatibilityPolicy.phase` differs from `devKitVersion`.
3. `scripts/check-dev-kit.mjs` must assert the same manifest phase rule.
4. README and README.zh-CN self-check command blocks must include `npm run verify`, `check-guided-delivery-loop`, `check-change-boundary`, and `check-baseline-state`.
5. `scripts/check-ai-workflow.mjs` fallback required paths must include 1.12 scripts, docs, core assets, templates, prompts, checklists, and report directories.
6. Version metadata and release evidence must update to 1.12.1.

## Non-Requirements

- Do not add standard baseline packs in this patch.
- Do not set fake CODEOWNERS.
- Do not change license terms.
- Do not add automatic reviewer automation.
- Do not alter target-project write authority.

## Success Criteria

- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-dev-kit.mjs` passes.
- `npm run verify` passes.
- `git diff --check` passes.
