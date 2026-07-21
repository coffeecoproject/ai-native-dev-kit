# Standard Baseline Pack Selection Guide

IntentOS Codex selects the smallest complete standard baseline set from current project evidence and the user's business goal. The user does not choose profiles, BL levels, packs, architecture, or verification tools.

## Internal Selection Order

```text
current project evidence and goal
  -> Codex derives platform and capability profiles
  -> Codex derives the baseline level
  -> Codex selects complete standard packs
  -> Codex identifies evidence gaps
  -> Codex verifies the installed baseline before task execution
```

## Selection Rules

- Codex selects a primary platform pack only when repository evidence or the business goal establishes that platform.
- Codex selects a capability pack only when the capability is present or required by the goal.
- Codex selects `environment-standard` for BL1/BL2 non-trivial projects; it remains minimal or pending for BL0.
- Codex selects a release pack when release, staging, handoff, launch readiness, or rollback is in scope.
- Do not infer Web from a generic `src/` directory or a Node package alone.
- Do not force `backend-api-standard` for a frontend or Mini Program unless backend, API, or data scope is evidenced.
- Do not select every pack because it exists.
- Do not treat `recommendedForBL` as proof that a pack applies.
- Do not treat draft packs as stable.
- Do not treat pack selection as target-write or production approval.

## BL Levels

| Level | Standard pack behavior | Industrial overlay behavior |
|---|---|---|
| `BL0_LIGHTWEIGHT` | Essential guidance for a bounded low-impact project | Not selected unless concrete risk evidence raises the project depth |
| `BL1_STANDARD` | Complete platform, capability, and environment standards | Not active without concrete risk evidence |
| `BL2_INDUSTRIAL` | Complete standard packs remain mandatory | Codex selects only risk-relevant overlays and verifies their evidence |

## User Input Boundary

No technical selection is delegated to the user. Codex continues collecting and reconciling project evidence until it can make the selection.

The user is asked only for:

- a business fact that cannot be established from the project;
- a genuine product preference between equivalent outcomes;
- consent for a concrete real-world action after its effect and rollback are explained;
- an external provider or legal fact that cannot be verified locally.

Unclear technical evidence blocks baseline readiness; it does not create a profile, BL, or pack question for the user.

## Completion Rule

A baseline is ready only when the selected profiles, level, standard packs, environment coverage, and required evidence agree with the current project. Installing pack files or recording a selection does not prove readiness.
