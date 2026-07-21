# Review Packet: <change-name>

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

This binding identifies the product-direction contract used to prepare this
review input. It is not implementation, apply, release, or production approval.

## Decision Responsibility

Technical decision owner: Codex

Codex selects architecture, baseline, scope mechanics, risk treatment, verification strategy, review routing, release readiness, and technical recovery from project evidence.

Default user input class: NO_USER_ACTION

Bounded exceptions: BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

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

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
|  |  | Yes / No |

## Human Approval

Compatibility heading: this section records exact consent to a prepared real-world effect only.

Required: Yes / No

Status: Not Required / Pending / Approved / Rejected

User input class: NO_USER_ACTION / REAL_WORLD_CONSENT_NEEDED

Approval scope: exact prepared real-world effect only; it must not contain technical choices.

Prepared effect and safeguards:

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

Out-of-scope changes require: None / Codex review / Revert / Codex replan

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

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
|  |  | high / medium / low | Yes / No | NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | Codex / user / external authority | CONFIRMED / INFERRED / PENDING_CONFIRMATION / NOT_APPLICABLE |

## Reviewer Checklist

- [ ] The implementation matches the request and spec.
- [ ] The change stays inside approved scope.
- [ ] Non-goals were not implemented accidentally.
- [ ] Risk Gate items match the actual touched areas.
- [ ] Exact real-world consent is present when the prepared external effect requires it.
- [ ] Verification evidence is enough for the stated risk.
- [ ] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [ ] Environment baseline is checked when build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts changed.
- [ ] Baseline or industrial evidence gaps are called out.
- [ ] Inferred facts are recorded in Assumption Register and are not treated as approved baseline rules.
- [ ] Dirty worktree or pre-existing changes are separated from this task.
- [ ] Codex selected and verified secret, production-config, migration, and release mechanics; exact consent exists for any prepared real-world effect.
- [ ] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE / REQUEST_CHANGES / BLOCKED / NEEDS_HUMAN_DECISION

`NEEDS_HUMAN_DECISION` is a compatibility outcome and may represent only BUSINESS_FACT_NEEDED, REAL_WORLD_CONSENT_NEEDED, or EXTERNAL_FACT_NEEDED.

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

Findings:

- 

Required follow-up:

- 
