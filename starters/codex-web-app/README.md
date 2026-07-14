# New IntentOS Web App

This project is initialized with the IntentOS.

## Workflow

Use:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

## First use

Tell Codex the Web product goal in plain language. The controlled initializer
has already preserved that goal as the only current Work Queue item and
verified that this project can run IntentOS from its own installed assets.

Codex now derives the Web stack, baseline, risk controls, review depth,
verification, and first useful slice. The user is asked only for a business
fact that cannot be inferred, an unavailable external fact, a genuine product
preference, or consent to one prepared real-world effect.

Do not ask the user to choose an internal command, framework, baseline, pack,
test, reviewer, migration depth, or evidence format.

## Local workflow assets

This project should contain:

```text
.intentos/core
.intentos/templates
.intentos/prompts
.intentos/checklists
```

These files are copied from the IntentOS at initialization time, so the project can run the workflow without depending on the original intentos path.

## Summarize Workflow Learning

```bash
node scripts/summarize-ai-logs.mjs .
```

## Project Onboarding Check

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
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

## Verify

```bash
bash scripts/verify.sh
```
