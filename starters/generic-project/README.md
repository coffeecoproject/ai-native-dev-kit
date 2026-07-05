# New IntentOS Project

This project is initialized with the IntentOS.

## Workflow

Use:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

## First setup

1. Run project onboarding with `.intentos/prompts/project-onboarding-agent.md`.
2. Let AI draft onboarding docs from conversation.
3. Human confirms project direction, stack decisions, risk boundaries, and first slice.
4. Run `node scripts/check-project-onboarding.mjs .`.
5. Run `node scripts/check-engineering-baseline.mjs .` before structural engineering decisions.
6. Run `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.
7. Use `.intentos/templates/request-card.md` to create the first request card in `requests/`.
8. Use `.intentos/templates/ai-task-log.md` after L1/L2/L3 work.
9. Use `.intentos/templates/workflow-retro.md` for milestone retrospectives.

AI drafts. Humans decide. Do not ask the human to manually fill all onboarding files.

## Local workflow assets

This project should contain:

```text
.intentos/core
.intentos/templates
.intentos/prompts
.intentos/checklists
```

These files are copied from the IntentOS at initialization time, so the project can run the workflow without depending on the original intentos path.

## Verify

```bash
bash scripts/verify.sh
```

## Project Onboarding Check

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
```

## Summarize Workflow Learning

```bash
node scripts/summarize-ai-logs.mjs .
```

## Daily Summary Check

```bash
node scripts/workflow-daily-summary.mjs . --write-state
```

Create a daily retro or candidate draft only when the command reports `ACTION_REQUIRED`.

## Skill Candidates

Use `.intentos/templates/skill-candidate.md` for repeated execution patterns. Keep drafts in `skill-candidates/`. Do not create or enable active Skills without explicit human approval.

## Project Automations

Use `.intentos/templates/project-automation-proposal.md` before creating or updating Codex App automations. Keep proposals in `automation-proposals/`. Codex may prepare the proposal, but creation/update/enablement requires explicit human approval.

## Check Workflow Version

```bash
node scripts/check-workflow-version.mjs .
```
