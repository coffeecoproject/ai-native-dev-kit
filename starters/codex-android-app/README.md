# New IntentOS Android App

This project is initialized with the IntentOS for Android app development.

Use `scripts/init-project.mjs`; do not copy this starter directly.

## Workflow

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log -> Retro
```

## First use

Tell Codex the Android product goal in plain language. The controlled
initializer has already preserved that goal as the only current Work Queue item
and verified that this project can run IntentOS from its own installed assets.

Codex now derives the Android stack, baseline, risk controls, build assumptions,
review depth, verification, and first useful slice. The user is asked only for
a business fact that cannot be inferred, an unavailable external fact, a
genuine product preference, or consent to one prepared real-world effect.

Do not ask the user to choose an internal command, framework, baseline, pack,
test, reviewer, migration depth, or evidence format.

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
