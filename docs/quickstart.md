# Quickstart

This guide is for starting or upgrading a project with the AI Native Dev Kit.

The workflow goal is simple: let AI draft and execute, while humans keep decisions, risk acceptance, and final review.

## New Project

Initialize from a starter:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-new-project
```

Use a platform starter when the target is already clear:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

Then enter the generated project and check the baseline:

```bash
cd ../my-new-project
node scripts/check-ai-workflow.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/check-workflow-version.mjs .
```

## Onboarding Level

Pick one level before the first implementation task:

| Level | Use When | Required Human Decision |
| --- | --- | --- |
| O0 | Small experiment or local tool | Confirm the project goal, platform, first slice, and verification command |
| O1 | Normal product or internal tool | Confirm project profile, technology strategy, sample policy, risks, and first slice |
| O2 | Regulated, financial, privacy-sensitive, production-critical, or multi-team work | Confirm all O1 items plus compliance boundary, permission model, release policy, and rollback policy |

AI may draft the onboarding documents. Human review decides whether they are accepted.

## First Workflow Package

Create a request:

```bash
node scripts/new-workflow-item.mjs --type request --name first-slice
```

Create the rest of the chain:

```bash
node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md
node scripts/new-workflow-item.mjs --type spec --request requests/001-first-slice.md --preflight preflight/001-first-slice.md
node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md
node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1
```

Fill the files from conversation and project evidence, then run:

```bash
node scripts/check-workflow-artifacts.mjs .
```

Only after the request, spec, eval, and task card are clear should an agent implement code.

## Existing Project

Inject or refresh workflow assets:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

This updates `.ai-native/`, workflow scripts, CI, missing onboarding docs, missing workflow directories, and PR governance markers. It does not overwrite existing product docs, specs, tasks, logs, or business code.

## After Implementation

Run project verification:

```bash
scripts/verify.sh
```

Write an AI task log:

```bash
node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md
node scripts/summarize-ai-logs.mjs .
node scripts/workflow-daily-summary.mjs .
```

If a repeated issue appears, write `workflow-improvements/`. If a repeated execution pattern appears, write `skill-candidates/`. Do not create, install, update, or enable active Skills without explicit human approval.
