---
artifact_type: request
id: 220-change-boundary-baseline-state
status: approved
---

# Request: 220-change-boundary-baseline-state

## Human Summary

Add a formal 1.12.0 upgrade so Codex can better control change boundaries, check guided delivery decisions, and avoid overclaiming baseline readiness before evidence exists.

## Goal

Implement `docs/change-boundary-baseline-state-1.12-plan.md` as a release-grade dev-kit upgrade.

## Scope

- Change Boundary protocol, templates, prompt, checklist, checker, examples, and bad fixtures.
- Baseline State protocol, templates, prompt, checklist, checker, examples, and bad fixtures.
- Guided Delivery standalone checker for current mainline, parking lot, and D0-D4 decision boundaries.
- CLI, init/update, manifest, workflow-version, CI, docs, platform templates, and self-check integration.
- Release evidence for 1.12.0.

## Out Of Scope

- Real target-project code modification.
- Automatic full-project scanning.
- Automatic GPT/API review.
- Production launch approval.
- Human risk, release, migration, payment, privacy, security, or compliance approval.
- Platform industrial-pack promotion.

## Human Approval

Status: Approved

Approval scope: dev-kit workflow/source hardening only.
