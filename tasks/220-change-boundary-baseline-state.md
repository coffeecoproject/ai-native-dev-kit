---
artifact_type: task
id: 220-change-boundary-baseline-state
status: approved
---

# Task: 220-change-boundary-baseline-state

## Human Summary

Implement the 1.12.0 boundary and baseline-state hardening plan and verify it through examples, fixtures, manifest, self-check, and release verification.

## Spec Ref

- `specs/220-change-boundary-baseline-state.md`

## Eval Ref

- `evals/220-change-boundary-baseline-state.md`

## Change Boundary

Allowed paths:

- `core/`
- `docs/`
- `checklists/`
- `prompts/`
- `templates/`
- `scripts/`
- `.github/`
- `platforms/`
- `examples/`
- `test-fixtures/`
- `requests/`
- `preflight/`
- `specs/`
- `evals/`
- `tasks/`
- `final-reports/`
- `releases/`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `dev-kit-manifest.json`
- `templates/workflow-version.json`
- `templates/version-record.md`

Forbidden paths:

- Target-project business code outside this repository.
- License term changes.
- Secrets or environment values.

## Baseline State

- No target project baseline is confirmed by this task.
- New baseline-state assets may define allowed states and checks.
- No-code baseline examples must remain proposed or pending unless evidence is present.

## Implementation Steps

1. Add 1.12 plan, core docs, user docs, prompts, checklists, templates, and report directories.
2. Add `check-guided-delivery-loop`, `check-change-boundary`, and `check-baseline-state`.
3. Add CLI and `new-workflow-item` support.
4. Add init/update, manifest, workflow-version, CI, docs, platform template, and package verify integration.
5. Add examples and bad fixtures.
6. Add release evidence and self-check coverage.
7. Run verification and record results.

## Human Approval

Status: Approved

Approval scope: dev-kit workflow/source hardening only.
