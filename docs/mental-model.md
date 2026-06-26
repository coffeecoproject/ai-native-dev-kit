# AI Native Dev Kit Mental Model

This document explains when to use each layer of the dev kit.

It is intentionally short. Use it when a project owner or agent is unsure whether a project needs only the workflow, a platform profile, or BL2 industrial governance.

## The Short Version

Use the smallest layer that can control the risk.

```text
Workflow
  -> Profile
  -> BL2 Industrial Pack
  -> Project Evidence
  -> Task Gate
```

## Workflow

Use the core workflow for every project.

It answers:

- What is the request?
- Is the request clear enough?
- What is the spec?
- How will the work be evaluated?
- What task is AI allowed to execute?
- What evidence must be reported?
- What should be logged and improved after the task?

If the project is a prototype, internal experiment, or low-risk local tool, the core workflow plus O0/O1 onboarding may be enough.

## Profile

Use a profile when the target runtime matters.

Examples:

- `web-app`
- `backend-api`
- `ios-app`
- `android-app`
- `wechat-miniprogram`
- `internal-admin`
- `high-risk-change`

A profile answers:

- What platform is this project built for?
- What docs are required?
- What task level should common risks use?
- What risk gate labels matter?
- What verification evidence is expected?
- What must AI not do without human approval?

Profiles do not replace the workflow. They tune the workflow for the project type.

## BL Level

BL level is project governance strength.

```text
BL0 = lightweight project governance
BL1 = standard project governance
BL2 = industrial project governance with evidence
```

Use BL0 when the project is exploratory and low risk.

Use BL1 when the project has real users, repeated development, or shared ownership.

Use BL2 when the project touches production, sensitive data, permissions, payments, destructive behavior, release risk, regulated work, or long-term maintainability.

## Industrial Pack

Use an industrial pack only when BL2 is selected.

An industrial pack answers:

- What baseline docs apply?
- What audit docs apply?
- What checklists apply?
- What evidence must exist?
- Which risks require task level escalation?
- Which actions require human approval?

Industrial packs should not be selected just because they exist. Select them when the project actually needs that runtime, capability, or risk overlay.

## Evidence

BL2 requires evidence, not claims.

`docs/baseline-evidence.md` should point to real project files:

```text
Requirement -> Evidence Type -> Evidence Ref -> Status -> Owner -> Review date
```

`Done` means there is a real evidence reference.

`Not applicable` means there is a reason.

`Pending` means the project is not ready for strict BL2 execution.

## Task Gate

The task gate controls what AI may implement.

Before implementation, the task should prove:

- the project baseline is ready
- the task level matches the risk
- Risk Gate labels are checked when high-risk areas appear in the task, spec, or eval
- Human Approval is present when a checked risk requires it
- the eval names the evidence required by selected industrial packs

If a high-risk area appears in the task or related spec but Risk Gate is not checked, ready mode should warn and implementation mode should fail.

## Practical Choices

Use this decision path:

```text
Starting any project?
  Use core workflow.

Target runtime matters?
  Select profiles.

Production, sensitive, permission, payment, destructive, or release risk?
  Consider BL2.

BL2 selected?
  Select industrial packs and require evidence.

Single task touches a risky area?
  Raise task level, check Risk Gate, and require Human Approval where needed.
```

## What Not To Do

- Do not use BL2 for every small experiment.
- Do not select every industrial pack by default.
- Do not treat passing local checks as production readiness.
- Do not let AI approve its own high-risk scope.
- Do not turn framework or hosting preferences into core workflow rules.
