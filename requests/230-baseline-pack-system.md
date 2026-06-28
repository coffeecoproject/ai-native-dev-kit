---
artifact_type: request
id: 230-baseline-pack-system
status: approved
---

# Request: 230-baseline-pack-system

## Human Summary

Add a formal Baseline Pack System so Codex can recommend project-level, platform, capability, and risk baseline packs without forcing the user to understand technical internals or silently enabling BL2.

## Goal

Make baseline pack selection clear, read-only by default, and bounded by human decision.

## Scope

- Add core and user-facing baseline pack system docs.
- Add a Baseline Pack Selection Report template, checklist, and router prompt.
- Add read-only baseline pack recommendation command.
- Add baseline pack selection report checker.
- Wire commands into CLI, generated workflow assets, manifest, README, and self-check.

## Out Of Scope

- Promoting industrial packs from draft to stable.
- Installing all packs by default.
- Automatically enabling BL2.
- Approving target-project writes.
- Real project production validation.

## Human Approval

Status: Approved

Approval scope: dev-kit baseline pack selection system only.

