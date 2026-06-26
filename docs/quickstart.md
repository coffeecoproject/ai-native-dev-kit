# Quickstart

This guide is for starting or upgrading a project with the AI Native Dev Kit.

The workflow goal is simple: let AI draft and execute, while humans keep decisions, risk acceptance, and final review.

For the decision model behind workflow, profiles, BL levels, and industrial packs, see `docs/mental-model.md`.

## Codex Bootstrap

When using Codex, you can provide the dev-kit path, repo URL, archive, or copied files and say:

```text
Read this AI Native Dev Kit and configure the current project yourself.
```

Codex should classify intent with `prompts/bootstrap-agent.md`. If you ask to review or discuss first, it should not write files. If you ask it to configure, it should run `workflow-next` to decide the next step:

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs .
```

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
node scripts/workflow-next.mjs .
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

## Platform Baseline

After onboarding, select target runtime profiles in `docs/project-profile.md`:

```md
## Selected Profiles

- web-app
- backend-api
```

Then run:

```bash
node scripts/check-platform-baseline.mjs .
node scripts/resolve-platform-baseline.mjs .
```

Profiles do not change the workflow. They define platform-specific task levels, risk gates, verification evidence, and release checks.

## Industrial Baseline

Use baseline levels for project governance strength:

```text
BL0_LIGHTWEIGHT = AI Native workflow only
BL1_STANDARD = workflow plus platform profiles
BL2_INDUSTRIAL = workflow plus profiles and selected industrial packs
```

Industrial packs are optional BL2 assets. They define production-grade evidence standards; they do not prove a real project is ready by themselves.

```bash
node scripts/check-industrial-pack.mjs .
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
```

For BL2 projects, let AI draft `docs/baseline-selection.md` and `docs/baseline-evidence.md` from `.ai-native/templates/`, then use `check-industrial-baseline.mjs --strict` only after the human has approved baseline level, selected packs, exceptions, and residual risks.

`baseline-evidence.md` must reference real project evidence. Rows with `Status: Done` need an existing `Evidence Ref`; rows marked `Not applicable` need a reason.

For Web BL2 projects, the Web industrial pack now expects runtime evidence for UI states, form interactions, API failure behavior, accessibility, performance or asset impact, release, rollback, and monitoring when those areas are touched. It remains framework-neutral; framework or hosting-specific rules should live in separate candidate packs until stabilized.

See `examples/web-industrial-bl2-first-slice` for a framework-neutral dogfood package that connects baseline selection, evidence, task gate, release record, and AI task log.

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
node scripts/check-workflow-artifacts.mjs . --mode ready
```

Only after the request, spec, eval, and task card are clear should an agent implement code.

For a high-risk implementation task, run the task-scoped implementation gate:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/001-first-slice.md
```

If any Risk Gate item is checked, the task card must include `## Human Approval` with a concrete `Approval scope` and `Status: Approved` before implementation.

## Existing Project

Inject or refresh workflow assets:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

This updates `.ai-native/`, workflow scripts, CI, missing onboarding docs, and missing workflow directories. It does not overwrite existing product docs, specs, tasks, logs, or business code.

It creates `AGENTS.md` when missing. If the project already has `AGENTS.md` and it is missing workflow governance markers, the update command writes a migration report instead of modifying the file:

```text
.ai-native/migration-reports/agents-governance.md
```

After human review, apply the proposed appendix explicitly:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-agent-governance
```

If the project already has `.github/pull_request_template.md` and it is missing workflow governance markers, the update command writes a migration report instead of modifying the template:

```text
.ai-native/migration-reports/pr-template-governance.md
```

After human review, apply the proposed appendix explicitly:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-pr-template-governance
```

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
