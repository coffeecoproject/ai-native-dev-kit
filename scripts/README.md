# Scripts

## init-project.mjs

Initialize a new project from a starter.

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter generic-project --target ../my-project
```

Update workflow assets in an existing project without overwriting existing project docs or business work:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target ../my-project --update-workflow-assets
```

Update mode may add missing onboarding docs, missing workflow directories, refresh injected workflow scripts/CI, and append missing governance markers to `.github/pull_request_template.md`. It must not overwrite existing project docs, specs, tasks, logs, or business code.

## check-ai-workflow.mjs

Check whether a project contains the minimum AI Native workflow assets.

```bash
node ai-native-dev-kit/scripts/check-ai-workflow.mjs ../my-project
```

## check-dev-kit.mjs

Check whether the dev kit itself is internally complete and extension-safe.
This also initializes a temporary project, runs its workflow check, runs AI log summarization, and verifies workflow asset update mode.

```bash
node ai-native-dev-kit/scripts/check-dev-kit.mjs
```

## summarize-ai-logs.mjs

Summarize project-level AI task logs, workflow improvement signals, Skill candidates, and dev-kit proposal counts.

```bash
node scripts/summarize-ai-logs.mjs .
```

## workflow-daily-summary.mjs

Run a daily workflow signal check. It reports `NO_ACTION` when no new evidence or pending decision exists, and `ACTION_REQUIRED` when a daily retro, workflow improvement, Skill candidate review, or dev-kit proposal review should be considered.

```bash
node scripts/workflow-daily-summary.mjs .
node scripts/workflow-daily-summary.mjs . --write-state
```

This script does not change business code and does not create or enable active Skills.

For Codex App automation, create one automation per project and set the automation `cwd` to that project root. Avoid broad parent-directory scanning unless the user explicitly wants a multi-project monitor.

Before creating or updating an automation, write an `automation-proposals/` entry from `.ai-native/templates/project-automation-proposal.md` and review it with `.ai-native/checklists/automation-review.md`.

## check-project-onboarding.mjs

Check whether project onboarding assets are present.

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-project-onboarding.mjs . --strict
```

Default mode verifies that onboarding files and workflow assets exist. Strict mode is for after human decisions are confirmed; it fails while placeholders or pending decisions remain.

## check-workflow-version.mjs

Check the generated project's `.ai-native/version.json`.

From inside a generated project:

```bash
node scripts/check-workflow-version.mjs .
```

From the dev-kit checkout, this also compares against the local dev-kit version:

```bash
node ai-native-dev-kit/scripts/check-workflow-version.mjs ../my-project
```

These scripts intentionally avoid external dependencies.
