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

If `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, stop setup. This means the project appears governed, production-sensitive, or dirty. Codex should produce a read-only assessment from `templates/adoption-assessment.md` and `templates/existing-governance-map.md` instead of running `init-project`.

If `workflow-next` reports `NEXT_ACTION: REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing a task. Confirm who owns the current git changes and whether they should be committed, split, stashed, ignored, or reviewed first.

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
node scripts/check-ai-workflow.mjs . --mode core
node scripts/workflow-next.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-workflow-version.mjs .
```

Use `node scripts/check-ai-workflow.mjs . --mode full` after installing or updating the complete workflow asset set.

## Onboarding Level

Pick one level before the first implementation task:

| Level | Use When | Required Human Decision |
| --- | --- | --- |
| O0 | Small experiment or local tool | Confirm the project goal, platform, first slice, and verification command |
| O1 | Normal product or internal tool | Confirm project profile, technology strategy, sample policy, risks, and first slice |
| O2 | Regulated, financial, privacy-sensitive, production-critical, or multi-team work | Confirm all O1 items plus compliance boundary, permission model, release policy, and rollback policy |

AI may draft the onboarding documents. Human review decides whether they are accepted.

## Engineering Baseline

Before Codex makes structural engineering decisions, use `docs/engineering-baseline.md`.

This file answers:

- where code belongs
- which types are source of truth
- how DTO / schema / domain boundaries work
- when enum / string / lookup / state-machine choices need human decision
- where API contracts, generated types, permissions, migrations, and cross-module state rules come from

Default check:

```bash
node scripts/check-engineering-baseline.mjs .
```

The default mode is advisory. It may report `PENDING` while still allowing low-risk local work. Use `--strict` only after the project wants the baseline to block missing or pending engineering decisions.

Codex must not invent or upgrade project-wide engineering conventions when this baseline is missing.

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

Use `industrial-packs/selection-guide.md` before approving BL2. It explains the current draft packs and how to combine primary platform, capability, and risk-overlay packs without defaulting to Web or selecting everything.

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

For BL2 projects, let AI draft `docs/baseline-selection.md` and `docs/baseline-evidence.md` from `.ai-native/templates/`, then use `check-industrial-baseline.mjs --strict` only after the human has approved baseline level, selected packs, exceptions, and residual risks.

`baseline-evidence.md` must reference real project evidence. Rows with `Status: Done` need an existing `Evidence Ref`; rows marked `Not applicable` need a reason.

Default bootstrap keeps industrial packs lightweight: only the registry and schemas are injected. Install concrete packs only after selection:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../my-project \
  --update-workflow-assets \
  --industrial-packs web-app-industrial
```

Evidence has three layers: project-level baseline evidence, task-triggered evidence, and release evidence. A task should not carry the entire pack catalog unless it actually touches those areas.

For Web BL2 projects, the Web industrial pack now expects runtime evidence for UI states, form interactions, API failure behavior, accessibility, performance or asset impact, release, rollback, and monitoring when those areas are touched. It remains framework-neutral; framework or hosting-specific rules should live in separate candidate packs until stabilized.

See `examples/web-industrial-bl2-first-slice` for a framework-neutral dogfood package that connects baseline selection, evidence, task gate, release record, and AI task log.

For WeChat Mini Program BL2 projects, use `wechat-miniprogram-industrial` for the mini program runtime. Add `internal-admin-industrial`, `backend-api-industrial`, `cloudbase-industrial`, `auth-permission-industrial`, `data-storage-industrial`, or `payment-value-transfer-industrial` only when those companion surfaces are actually in scope.

See `examples/miniprogram-industrial-bl2-first-slice` for a Mini Program dogfood package covering login state, cloud read boundary, permission and failure states, release readiness, and AI task logging.

For a real project trial, copy `.ai-native/templates/dogfood-observation.md` into `workflow-retros/<date>-dogfood-observation.md` or another agreed project observation location. Use it to track workflow cost, evidence effort, Risk Gate false positives or false negatives, and AI collaboration quality. It is an observation record, not a replacement for task artifacts or release evidence.

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

When independent review is needed, generate a Review Packet:

```bash
node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md
```

Fill it with the diff summary, commands run, evidence refs, known risks, and open questions before handing it to a human reviewer, GPT Pro, or a second model. A Review Packet is not approval.

For L2/L3 work, or whenever review findings need a recorded loop, generate a Review Loop Report:

```bash
node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md
```

If GPT Pro or a second model will review the packet, generate a read-only reviewer prompt:

```bash
node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md
```

Codex may auto-fix only deterministic, low-risk findings inside approved task scope, for at most 2 rounds. Scope, risk, permission, architecture, dependency, migration, production config, release, rollback, and approval changes require human decision.

Check Review Loop semantics:

```bash
node scripts/check-review-loop.mjs . --task tasks/001-first-slice.md
```

For L2/L3 tasks, `check-workflow-artifacts --mode implementation --task <task>` expects matching `review-packets/` and `review-loop-reports/` files.

If Codex uses helper agents, record and close them with Subagent Orchestration:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --task tasks/001-first-slice.md
node scripts/check-subagent-orchestration.mjs .
```

Do this only when helper agents are used. Every subagent must be `CLOSED` or `SKIPPED` after handoff.

When Codex suggests next work, use the bounded next-step protocol:

```bash
node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-slice.md
```

Only `IN_SCOPE_NEXT_STEP` can be handled inside the current task. `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, and `DO_NOT_PROCEED` require a new entry point, human decision, or stop record.

Check next-step boundaries:

```bash
node scripts/check-next-step-boundary.mjs . --task tasks/001-first-slice.md
```

## Existing Project

Inject or refresh workflow assets for a low-risk project that is already understood:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

This updates `.ai-native/`, workflow scripts, CI, missing onboarding docs, and missing workflow directories. It does not overwrite existing product docs, specs, tasks, logs, or business code.

For an existing governed, already-online, dirty, or first-adoption project, inspect state first:

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs ../existing-project
```

If the result allows guarded setup, generate and apply a reviewed plan:

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --backup-dir .ai-native/backups/first-adoption \
  --write-plan /tmp/ai-native-update-plan.json
node ai-native-dev-kit/scripts/init-project.mjs \
  --apply-plan /tmp/ai-native-update-plan.json
```

If the result is `RUN_ADOPTION_ASSESSMENT`, keep the first pass read-only. Map existing agent rules, CI, baselines, evidence, release/rollback controls, and dirty worktree state before asking for adapter approval.

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
