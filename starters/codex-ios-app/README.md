# New IntentOS iOS App

This project is initialized with the IntentOS for iOS app development.

Use `scripts/init-project.mjs`; do not copy this starter directly.

## Workflow

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log -> Retro
```

## First setup

1. Run project onboarding with `.intentos/prompts/project-onboarding-agent.md`.
2. Let AI draft onboarding docs from conversation.
3. Codex derives the iOS stack, baseline, risk controls, first slice, and build assumptions from the goal and project evidence.
4. Run `node scripts/check-project-onboarding.mjs .`.
5. Run `node scripts/check-engineering-baseline.mjs .` before structural engineering decisions.
6. Run `node scripts/check-project-onboarding.mjs . --strict` after the derived records are internally verified.
7. Use `.intentos/templates/request-card.md` to create the first request card in `requests/`.

Codex drafts, checks, and applies technical decisions. Ask the user only for a business fact that cannot be inferred or consent to one prepared real-world effect.

## Verify

```bash
bash scripts/verify.sh
```

## Workflow Checks

```bash
node scripts/check-ai-workflow.mjs .
node scripts/check-workflow-version.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/summarize-ai-logs.mjs .
node scripts/workflow-daily-summary.mjs . --write-state
```

Create a daily retro or candidate draft only when the daily summary reports `ACTION_REQUIRED`.

## Skill Candidates

Use `.intentos/templates/skill-candidate.md` for repeated execution patterns. Keep drafts in `skill-candidates/`. Do not create or enable active Skills without explicit human approval.

## Project Automations

Use `.intentos/templates/project-automation-proposal.md` before creating or updating Codex App automations. Keep proposals in `automation-proposals/`. Codex may prepare the proposal, but creation/update/enablement requires explicit human approval.
