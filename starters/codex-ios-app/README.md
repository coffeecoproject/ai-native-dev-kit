# New AI Native iOS App

This project is initialized with the AI Native Dev Kit for iOS app development.

Use `scripts/init-project.mjs`; do not copy this starter directly.

## Workflow

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log -> Retro
```

## First setup

1. Run project onboarding with `.ai-native/prompts/project-onboarding-agent.md`.
2. Let AI draft onboarding docs from conversation.
3. Human confirms project direction, stack decisions, risk boundaries, first slice, and iOS build assumptions.
4. Run `node scripts/check-project-onboarding.mjs .`.
5. Run `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.
6. Use `.ai-native/templates/request-card.md` to create the first request card in `requests/`.

AI drafts. Humans decide. Do not ask the human to manually fill all onboarding files.

## Verify

```bash
bash scripts/verify.sh
```

## Workflow Checks

```bash
node scripts/check-ai-workflow.mjs .
node scripts/check-workflow-version.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/summarize-ai-logs.mjs .
node scripts/workflow-daily-summary.mjs . --write-state
```

Create a daily retro or candidate draft only when the daily summary reports `ACTION_REQUIRED`.

## Skill Candidates

Use `.ai-native/templates/skill-candidate.md` for repeated execution patterns. Keep drafts in `skill-candidates/`. Do not create or enable active Skills without explicit human approval.

## Project Automations

Use `.ai-native/templates/project-automation-proposal.md` before creating or updating Codex App automations. Keep proposals in `automation-proposals/`. Codex may prepare the proposal, but creation/update/enablement requires explicit human approval.
