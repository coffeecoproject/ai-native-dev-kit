# Context Governance

## Human Summary

Context Governance keeps project memory accurate, auditable, and evidence-bound. Codex can notice context gaps and draft candidates, but unsupported inference must not become project fact.

## Core Rule

Codex derives technical context from project evidence and reviews it before promotion. Business facts, product preferences, concrete real-world consent, and unavailable external facts come from the user or verifiable external evidence. Context becomes source of truth only when it is evidence-backed and written to the correct Git-backed destination.

## What Counts As Project Context

Project context includes:

- product scope and project purpose
- engineering baseline decisions
- environment baseline facts
- platform and industrial baseline selections
- permission, data, release, rollback, and risk rules
- accepted decision briefs
- accepted context corrections
- repeated failure modes that pass evidence-backed context review

## Context Status

Use these statuses when context may affect future work:

| Status | Meaning | Can become project rule? |
|---|---|---|
| `CONFIRMED` | Evidence-backed, with user or external input only when the fact cannot be derived | Yes |
| `INFERRED` | AI or reviewer inferred it from evidence | No |
| `PENDING_CONFIRMATION` | Compatibility state: needs evidence, a business fact, exact real-world consent, or an external fact before use | No |
| `NOT_APPLICABLE` | Explicitly not relevant, with reason | No |
| `REJECTED` | Human rejected the candidate | No |

Only `CONFIRMED` context can become a project rule.

## Context Authority Order

From highest to lowest:

1. Current explicit human instruction.
2. Current request, preflight, spec, eval, and task.
3. Confirmed engineering, environment, platform, industrial, product, and context baselines.
4. Project code, tests, and runtime evidence.
5. Confirmed decision brief, ADR, onboarding decision, or accepted correction report.
6. Latest review loop report, final report, or AI log.
7. Historical AI logs, review summaries, and retros.
8. Codex inference.
9. Model memory.

Rules:

- Lower authority must not override higher authority.
- Historical notes must not override current task artifacts.
- Inference must not override confirmed baseline rules.
- Model memory must not override Git-backed context.
- Model memory must not override Git-backed source of truth.

## Learning Candidate

Use a Learning Candidate when Codex observes something that may be worth remembering, but it is not yet confirmed.

Valid candidate types:

- `PROJECT_FACT`
- `ENGINEERING_DECISION`
- `ENVIRONMENT_FACT`
- `FAILURE_MODE`
- `USER_PREFERENCE`
- `CHECKER_FALSE_POSITIVE`
- `OBSOLETE_CONTEXT`

Learning candidates are proposals. They do not update source of truth by themselves.

## Context Correction

Use a Context Correction Report when existing context appears outdated, wrong, or incomplete.

Correction reports must include:

- old context
- new evidence
- impact
- proposed correction
- source-of-truth destination to update
- human decision
- applied changes
- audit notes

Approved correction reports may support updates to baselines or docs. The report itself is not enough unless the destination is updated or explicitly accepted as the durable record.

## Source-of-Truth Destinations

Confirmed context should be written to the narrowest correct destination:

- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `docs/verification-matrix.md`
- `decision-briefs/`
- `context-corrections/`
- platform or industrial baseline selection docs

Do not put raw observations, chat logs, secrets, or local machine details into source-of-truth docs.

## AI Boundaries

Codex must not:

- call unconfirmed inference `CONFIRMED`
- write learning candidates into baselines without a bounded correction plan and internal verification
- treat a review packet, final report, or AI log as approval
- use model memory to override Git-backed context
- persist secrets or local machine fingerprints as project memory
- silently change AGENTS, project baselines, release rules, permission models, or environment facts

## Review Triggers

Run context governance review when:

- repeated review findings suggest a durable project rule
- a baseline appears outdated
- Codex discovers conflicting project docs
- a task relies on inferred environment, release, permission, or data facts
- AGENTS, baselines, onboarding docs, or project profile change
- public reports or handoffs depend on project memory
