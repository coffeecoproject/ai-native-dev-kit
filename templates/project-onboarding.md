# Project Onboarding: <project-name>

## Status

Onboarding status: DRAFT / READY / BLOCKED_BY_MISSING_FACT

Last updated:

## Onboarding Depth

Codex-selected depth: O0 / O1 / O2

Evidence and rationale:

## Source Conversation

Summarize the user's business goal, product preferences, and supplied facts in
plain language.

-

## Codex Responsibility

Codex reads the project, chooses the onboarding depth, target platform profile,
technical approach, baseline level, verification strategy, and first valuable
slice. Codex records those choices with project evidence and resolves technical
uncertainty through inspection, safe defaults, review, tests, or a bounded
spike.

The user does not fill workflow files or approve technical choices.

## User Input Boundary

Ask the user only when one of these classes applies:

- `BUSINESS_FACT_NEEDED`: a real business rule or product preference cannot be
  inferred from project evidence;
- `REAL_WORLD_CONSENT_NEEDED`: the next concrete external action may create
  cost, affect production or real data, use a real account, or communicate with
  real users;
- `EXTERNAL_FACT_NEEDED`: a legal, tax, compliance, provider, or other external
  fact cannot be proved by the project.

All other onboarding work is `NO_USER_ACTION`.

## Required Onboarding Documents

- [ ] `docs/project-profile.md`
- [ ] `docs/tech-stack-strategy.md`
- [ ] `docs/business-spec-index.md`
- [ ] `docs/sample-policy.md`
- [ ] `docs/onboarding-decisions.md`

## Current Project Understanding

- Project category:
- Target platform(s):
- Primary users:
- Primary problem:
- First valuable outcome:
- Constraints:
- Evidence refs:

## Open Facts And Effects

| Item | Classification | Codex recommendation | Dependent scope | Status |
|---|---|---|---|---|
|  | NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED |  |  | OPEN |

Technical questions must remain `NO_USER_ACTION` and be resolved by Codex.

## First Vertical Slice

- Codex-selected goal:
- User value:
- Scope:
- Non-goals:
- Verification:
- Risks:
- Evidence refs:

## Ready For First Request

Readiness: READY / NOT_READY

Reason:

Next automatic action:
