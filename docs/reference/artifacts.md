# Artifacts Reference

Artifacts make AI work auditable without forcing every task into the heaviest process.

## Core Task Artifacts

| Directory | Purpose | When to use |
|---|---|---|
| `requests/` | Capture the user request and problem | Before non-trivial work |
| `preflight/` | Check project state, risk, assumptions, and stop conditions | Before writing code |
| `specs/` | Define expected behavior and interfaces | Before task execution |
| `evals/` | Define acceptance and verification | Before task execution |
| `tasks/` | Bound one executable task | Before implementation |
| `ai-logs/` | Record execution notes | During or after implementation |

## Review Artifacts

| Directory | Purpose |
|---|---|
| `review-packets/` | Stable input for human, GPT Pro, or reviewer agent |
| `gpt-review-prompts/` | Read-only reviewer prompt |
| `review-loop-reports/` | Findings, AUTO_FIX rounds, verification, and remaining decisions |
| `review-summaries/` | Plain-language review summary |

Review Loop is required for L2/L3 tasks and optional for smaller tasks.

## Planning And Control Artifacts

| Directory | Purpose |
|---|---|
| `goal-cards/` | Goal Mode route and task level |
| `subagent-run-plans/` | Helper agent roles, authority, handoff, and closure |
| `decision-briefs/` | Human decision input |
| `follow-up-proposals/` | Suggestions outside the current task |

Goal Card is not approval to implement. Subagent output is not authority. Human Approval remains separate.

## Reporting Artifacts

| Directory | Purpose |
|---|---|
| `final-reports/` | Durable task result |
| `status-reports/` | Human-readable status |
| `customer-handoffs/` | Delivery or milestone handoff |
| `releases/` | Release and evidence records |

## Self-Iteration Artifacts

| Directory | Purpose |
|---|---|
| `workflow-retros/` | Retrospective notes |
| `workflow-improvements/` | Process improvement proposal |
| `skill-candidates/` | Candidate repeatable Skill |
| `automation-proposals/` | Candidate automation |
| `dev-kit-proposals/` | Proposed dev-kit change |

These artifacts should not be treated as automatic permission to extend scope.

## Project Docs

Common target-project docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`
- `docs/verification-matrix.md`
- `docs/engineering-baseline.md`

Engineering Baseline covers decisions such as enum vs string vs lookup, DTO/domain/API boundaries, generated types, folder structure, permission model, migration rules, and cross-module state.

Source profiles live under `profiles/`. Platform adapter instructions live under `platforms/`.

## Frontmatter

New generated artifacts include machine-readable frontmatter. Markdown remains the human-readable source, but frontmatter helps checkers avoid brittle parsing.

Legacy artifacts without frontmatter may pass with migration warnings until the relevant migration decision is complete.

## Choosing The Right Artifact

Use `docs/artifact-decision-tree.md` when unsure.

Short rule:

- need to define work: request, preflight, spec, eval, task
- need to review work: review packet and review loop report
- need a human decision: decision brief
- need to suggest future work: follow-up proposal
- need to close work: final report
