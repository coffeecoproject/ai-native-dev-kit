# Codex Quickstart

This adapter is for projects where Codex is the daily coding agent.

## Install Into A Project

If you want Codex to choose the setup path, provide the intentos path or repo URL and say:

```text
Read this IntentOS and configure the current project yourself.
```

Codex should use `.intentos/prompts/bootstrap-agent.md` or `prompts/bootstrap-agent.md` to classify intent, then run:

```bash
node intentos/scripts/start-project.mjs .
```

`start-project.mjs` is read-only by default. It recommends the adoption path before any init, update, or write-plan action.

Then ask for baseline recommendation:

```bash
node intentos/scripts/cli.mjs baseline .
```

`baseline` is also read-only. It tells you which engineering and environment decisions need confirmation before tasks.

If you ask Codex to review or discuss first, it should not write files.

From the parent directory:

```bash
node intentos/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-project
```

For a platform-specific project:

```bash
node intentos/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node intentos/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node intentos/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

## First Codex Conversation

Use this instruction:

```text
Use AGENTS.md and the .intentos workflow.
Start with project onboarding.
Draft the project profile, technology strategy, business spec index, sample policy, onboarding decisions, and first vertical slice.
Do not implement code yet.
```

The expected result is a set of onboarding document drafts and a short list of human decisions.

Before the first non-trivial implementation, Codex should also draft or confirm:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`

Then run:

```bash
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

## First Implementation Conversation

After onboarding is accepted, create a workflow package:

```bash
node scripts/new-workflow-item.mjs --type request --name first-slice
node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md
node scripts/new-workflow-item.mjs --type spec --request requests/001-first-slice.md --preflight preflight/001-first-slice.md
node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md
node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1
```

Ask Codex to fill the artifacts from conversation. Then run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

Implementation should happen only after the task card is approved.

## Review

Codex final reports should include:

- what changed
- what did not change
- verification commands and results
- risks remaining
- suggested next step

For L1/L2/L3 work, write an AI task log and run the summary scripts:

```bash
node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md
node scripts/summarize-ai-logs.mjs .
node scripts/workflow-daily-summary.mjs .
```
