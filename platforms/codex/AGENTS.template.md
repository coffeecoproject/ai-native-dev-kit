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

## Automation Governance

- Codex may propose project-scoped automations during setup, release preparation, or workflow review.
- Proposals must be written in `automation-proposals/` using `.ai-native/templates/project-automation-proposal.md`.
- Do not create, update, resume, delete, or enable Codex App automations without explicit human approval for the exact project root, schedule, prompt, allowed writes, and initial status.
- Do not attach project automation to a parent directory unless the user explicitly approves a multi-project monitor.
