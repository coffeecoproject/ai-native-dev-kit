# Project Agent Working Agreement

## Mission

This repository follows an AI-native, spec-first development workflow.

Do not implement vague requests directly.

## Core Rules

1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.
2. Every non-trivial feature must have acceptance criteria before implementation.
3. Prefer vertical slices over broad rewrites.
4. Keep changes minimal and scoped.
5. Do not add production dependencies without explicit approval.
6. Do not modify auth, permission, migration, production config, secrets, high-risk, or security-sensitive logic without a risk report and explicit approval.
7. Every implementation must include tests or explain why tests are not applicable.
8. If the same verification failure repeats twice, stop and report instead of blindly retrying.
9. After implementation, produce a final report:
   - what changed
   - what did not change
   - tests run
   - risks remaining
   - next suggested step

## Bootstrap Entry

When the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat that as execution bootstrap intent.

Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.

When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.

For bootstrap work, first use `.ai-native/prompts/bootstrap-agent.md` when present, then run:

```bash
node scripts/workflow-next.mjs .
```

Follow the reported `NEXT_ACTION`. Stop for human approval before applying any migration report.

## Required Preflight Output

Before coding, output:

- Problem summary
- Missing information
- Assumptions
- Non-goals
- Risk areas
- Suggested task split
- Acceptance criteria
- Test plan
- Ready / Not ready decision

## Task Execution Rules

When a task card exists:

1. Read `AGENTS.md`.
2. Read the linked spec.
3. Read the linked eval.
4. Follow allowed and forbidden scope.
5. Respect stop conditions.
6. Run requested verification.
7. Report evidence and remaining risk.

## Project Onboarding

Before the first non-trivial implementation, use `.ai-native/prompts/project-onboarding-agent.md` to draft project onboarding documents from conversation.

AI drafts. Humans decide.

Do not ask the human to manually fill all onboarding files. Ask focused questions, propose options, record assumptions, and request confirmation.

Required docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`

Run:

```bash
node scripts/check-project-onboarding.mjs .
```

Use `--strict` only after the human confirms onboarding decisions.

## Workflow Artifact Generation

Use `scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, and AI task log files.

Before implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

For high-risk implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>
```

If any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation.

If artifact quality fails, fix the workflow artifacts before writing code.

## High-risk Boundaries

Stop and ask before:

- production release or deployment
- production environment variables or secrets
- authentication, session, token, cookie, or permission policy changes
- database schema changes with production compatibility risk
- destructive database migration or data cleanup
- production data access, export, repair, or migration
- irreversible, regulated, value-transfer, identity, safety-critical, or destructive decisions
- adding production dependencies
- changing infrastructure, DNS, TLS, CDN, WAF, hosting, or equivalent runtime config

## Review Focus

When reviewing changes, focus on:

- scope creep
- missing tests
- permission bypass
- data leakage
- unsafe migration
- architecture drift
- excessive dependencies
- unclear rollback

## Self-iteration Rules

- L1/L2/L3 work should create an AI task log.
- Daily automation should be scoped to this project root and may run `scripts/workflow-daily-summary.mjs`, but should only create draft workflow files when it reports `ACTION_REQUIRED`.
- Repeated workflow problems should become workflow improvements before dev-kit changes.
- Repeated execution patterns may become Skill candidates, but active Skills must not be created, updated, installed, or enabled without explicit human approval.
- Proposed dev-kit changes must pass proposal review and `check-dev-kit.mjs`.

## Skill Governance

Use `.ai-native/templates/skill-candidate.md` for candidate drafts and `.ai-native/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.

## Automation Governance

- Codex may propose project-scoped automations during setup, release preparation, or workflow review.
- Proposals must be written in `automation-proposals/` using `.ai-native/templates/project-automation-proposal.md`.
- Do not create, update, resume, delete, or enable Codex App automations without explicit human approval for the exact project root, schedule, prompt, allowed writes, and initial status.
- Do not attach project automation to a parent directory unless the user explicitly approves a multi-project monitor.

## Final Report

Every implementation response must include:

- What changed
- What did not change
- Tests run
- Risks remaining
- Suggested next step
