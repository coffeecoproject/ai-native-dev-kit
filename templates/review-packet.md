# Review Packet: <change-name>

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.111.0`

Context digest: `sha256:d6f09031f1aa79713aa98cc7717ac606133315bf5c8176018d75b69e6b2d9363`

This binding identifies the product-direction contract used to prepare this
review input. It is not implementation, apply, release, or production approval.

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION / HISTORICAL_AUDIT

Project fingerprint:

Project revision:

Task ref:

Task digest:

## Packet Status

Status: DRAFT / READY_FOR_REVIEW / REVIEWED

Prepared by:

Prepared at:

Reviewer:

Review target:

## Review Purpose

What should the reviewer focus on?

- 

What should the reviewer ignore?

- 

## Project State

Project root:

Branch:

Project state tags:

Adoption mode:

Workflow next action:

Dirty worktree: Yes / No

Changed file count:

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request |  |  |  |
| Preflight |  |  |  |
| Spec |  |  |  |
| Eval |  |  |  |
| Task |  |  |  |
| AI task log |  |  |  |
| Release evidence |  |  |  |

## Request Summary

- 

## Spec / Scope Summary

Allowed scope:

- 

Forbidden scope:

- 

Non-goals:

- 

## Acceptance Criteria

- 

## Risk Gate

Checked risk items:

- 

Risk Gate Exclusions:

| Mentioned term | Why excluded | Human accepted |
|---|---|---|
|  |  | Yes / No |

## Human Approval

Required: Yes / No

Status: Not Required / Pending / Approved / Rejected

Approval scope:

Approved by:

Approved at:

## Baseline State

Onboarding state:

Engineering baseline checked: Yes / No / Not applicable

Engineering baseline ref:

Engineering baseline gaps:

Environment baseline checked: Yes / No / Not applicable

Environment baseline ref:

Environment baseline gaps:

Platform baseline state:

Selected profiles:

Industrial baseline state:

Baseline level:

Selected industrial packs:

## Change Boundary Review

Change-boundary report: Not required / `change-boundary-reports/<file>.md`

Actual changed files checked against approved boundary: Yes / No / Not applicable

Forbidden paths changed: No / Yes

Out-of-scope changes require: None / Review / Revert / Human decision

## Baseline State Review

Baseline-state report: Not required / `baseline-state-reports/<file>.md`

Proposed or evidence-required baselines treated as confirmed: No / Yes / Not applicable

## Evidence

Commands run:

```text

```

Verification results:

- 

Evidence refs:

- 

Skipped evidence and reason:

- 

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
|  |  |  |  |

## Diff Summary

- 

## Known Risks

- 

## Open Questions

- 

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | Yes / No | AI / human | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Reviewer Checklist

- [ ] The implementation matches the request and spec.
- [ ] The change stays inside approved scope.
- [ ] Non-goals were not implemented accidentally.
- [ ] Risk Gate items match the actual touched areas.
- [ ] Human Approval is present when required.
- [ ] Verification evidence is enough for the stated risk.
- [ ] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [ ] Environment baseline is checked when build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts changed.
- [ ] Baseline or industrial evidence gaps are called out.
- [ ] Inferred facts are recorded in Assumption Register and are not treated as approved baseline rules.
- [ ] Dirty worktree or pre-existing changes are separated from this task.
- [ ] No secrets, production config, migrations, or release paths changed without approval.
- [ ] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE / REQUEST_CHANGES / BLOCKED / NEEDS_HUMAN_DECISION

Findings:

- 

Required follow-up:

- 
