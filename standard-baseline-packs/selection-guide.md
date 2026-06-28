# Standard Baseline Pack Selection Guide

Use the smallest standard baseline set that matches the project.

## Default Order

```text
project state
  -> selected profiles
  -> BL level
  -> standard baseline packs
  -> optional industrial overlays
  -> evidence gaps
  -> human decision
```

## Selection Rules

- Select a primary platform pack only when the platform is in scope.
- Select a capability pack only when that capability is in scope.
- Select a release pack only when release, staging, handoff, launch readiness, or rollback is in scope.
- Do not select every pack because it exists.
- Do not treat `recommendedForBL` as default activation.
- Do not treat draft packs as stable.
- Do not treat pack selection as write approval.

## BL Levels

| Level | Standard pack behavior | Industrial overlay behavior |
|---|---|---|
| `BL0_LIGHTWEIGHT` | Essential standard guidance only | Not recommended by default |
| `BL1_STANDARD` | Selected standard packs are usually enough | Not active by default |
| `BL2_INDUSTRIAL` | Standard packs first | Optional overlays only when risk exists and human approves |

## Human Decisions

The human confirms:

- selected profiles
- BL level
- selected standard packs
- optional industrial overlays
- missing evidence acceptance
- whether Codex may write target project files for a separate implementation task

Approving standard baseline selection does not approve a specific implementation task.
