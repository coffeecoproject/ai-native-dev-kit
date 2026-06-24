# Codex Quickstart

This adapter is for projects where Codex is the daily coding agent.

## Install Into A Project

If you want Codex to choose the setup path, provide the dev-kit path or repo URL and say:

```text
Read this AI Native Dev Kit and configure the current project yourself.
```

Codex should use `.ai-native/prompts/bootstrap-agent.md` or `prompts/bootstrap-agent.md` to classify intent, then run:

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs .
```

If you ask Codex to review or discuss first, it should not write files.

From the parent directory:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-project
```

For a platform-specific project:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

## First Codex Conversation

Use this instruction:

```text
Use AGENTS.md and the .ai-native workflow.
Start with project onboarding.
Draft the project profile, technology strategy, business spec index, sample policy, onboarding decisions, and first vertical slice.
Do not implement code yet.
```

The expected result is a set of onboarding document drafts and a short list of human decisions.

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
node scripts/check-workflow-artifacts.mjs .
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
