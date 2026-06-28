---
artifact_type: task
id: 230-baseline-pack-system
status: approved
---

# Task: 230-baseline-pack-system

## Human Summary

Implement 1.13.0 Baseline Pack System.

## Spec Ref

- `specs/230-baseline-pack-system.md`

## Eval Ref

- `evals/230-baseline-pack-system.md`

## Change Boundary

Allowed paths:

- `core/`
- `docs/`
- `templates/`
- `checklists/`
- `prompts/`
- `baseline-pack-selections/`
- `scripts/`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `templates/version-record.md`
- `templates/workflow-version.json`
- `package.json`
- `dev-kit-manifest.json`
- `requests/`
- `preflight/`
- `specs/`
- `evals/`
- `tasks/`
- `final-reports/`
- `releases/1.13.0/`

Forbidden paths:

- Target project code.
- Pack maturity promotion to stable.
- License terms.
- CODEOWNERS owner assignment.

## Implementation Steps

1. Add docs/templates/checklist/prompt/directory.
2. Add recommendation and checker scripts.
3. Wire CLI, generator, init, fallback checks, README, reference docs, package verify, and self-check.
4. Update version metadata and manifest.
5. Add release evidence.
6. Run full verification.

## Human Approval

Status: Approved

Approval scope: dev-kit baseline pack selection governance only.

