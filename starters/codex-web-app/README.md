# New AI Native Web App

This project is initialized with the AI Native Dev Kit.

## Workflow

Use:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

## First setup

1. Run project onboarding with `.ai-native/prompts/project-onboarding-agent.md`.
2. Let AI draft onboarding docs from conversation.
3. Human confirms project direction, stack decisions, risk boundaries, and first slice.
4. Run `node scripts/check-project-onboarding.mjs .`.
5. Run `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.
6. Use `.ai-native/templates/request-card.md` to create the first request card in `requests/`.
7. Use `.ai-native/templates/ai-task-log.md` after L1/L2/L3 work.
8. Use `.ai-native/templates/workflow-retro.md` for milestone retrospectives.

AI drafts. Humans decide. Do not ask the human to manually fill all onboarding files.

## Local workflow assets

This project should contain:

```text
.ai-native/core
.ai-native/templates
.ai-native/prompts
.ai-native/checklists
```

These files are copied from the dev kit at initialization time, so the project can run the workflow without depending on the original dev-kit path.

## Summarize Workflow Learning

```bash
node scripts/summarize-ai-logs.mjs .
```

## Project Onboarding Check

```bash
node scripts/check-project-onboarding.mjs .
```

## Daily Summary Check

```bash
node scripts/workflow-daily-summary.mjs . --write-state
```

Create a daily retro or candidate draft only when the command reports `ACTION_REQUIRED`.

## Skill Candidates

Use `.ai-native/templates/skill-candidate.md` for repeated execution patterns. Keep drafts in `skill-candidates/`. Do not create or enable active Skills without explicit human approval.

## Project Automations

Use `.ai-native/templates/project-automation-proposal.md` before creating or updating Codex App automations. Keep proposals in `automation-proposals/`. Codex may prepare the proposal, but creation/update/enablement requires explicit human approval.

## Check Workflow Version

```bash
node scripts/check-workflow-version.mjs .
```

## Verify

```bash
bash scripts/verify.sh
```
