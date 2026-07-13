# Quickstart

This guide is for starting or upgrading a project with IntentOS.

The workflow goal is simple: the user describes real business needs while IntentOS and Codex own technical decisions, execution, testing, review, and repair. The user is involved only for unavailable business facts or consent to one prepared real-world effect.

For the decision model behind workflow, profiles, BL levels, standard baseline packs, and industrial packs, see `docs/mental-model.md`.

## Start Here: Ordinary User Product Loop

If you are starting from a plain idea, do not begin with baseline, hook, workflow-map, or apply-plan commands. Start with the product goal.

```text
我想做一个预约 App，你帮我开始。
```

Codex should read the project briefly, recommend the first useful version, and ask only the few decisions that matter. The ordinary path is:

```text
plain goal
-> first-slice recommendation
-> local MVP or local demo evidence
-> product completeness check
-> low-risk apply candidate only when a small later write is being considered
```

For command-line evidence, use the shared operating loop:

```bash
node scripts/cli.mjs work ../my-project "我想做一个预约 App"
```

IntentOS chooses the required first-slice, baseline, task-governance, evidence,
or adoption source systems internally. Maintainers can inspect the lower-level
commands with `node scripts/cli.mjs --help-advanced`.

Use the same command as the goal changes:

```bash
node scripts/cli.mjs work ../my-project "继续完成预约时间规则"
node scripts/cli.mjs work ../my-project "检查当前任务做到哪里了"
node scripts/cli.mjs work ../my-project "这个任务做完了吗"
node scripts/cli.mjs work ../my-project "准备发布内部测试版本"
node scripts/cli.mjs work ../old-project "让这个项目按 IntentOS 工作"
```

Each result is read-only. IntentOS selects the underlying task, closure,
release, baseline, or adoption sources and keeps their evidence and authority
rules intact. It does not approve implementation, commit, push, release,
production, CI, hooks, payment, permissions, migrations, secrets, or data
changes.

Use the built-in local examples to see the path end to end:

```bash
node scripts/check-mvp-example.mjs examples/mvp-booking-web-app
node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app
node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool
```

## Maintainer Bootstrap And Adoption

When using Codex, you can provide the intentos path, repo URL, archive, or copied files and say:

```text
Read this IntentOS / IntentOS and configure the current project yourself.
```

Codex should classify intent with `prompts/bootstrap-agent.md`. If you ask to review or discuss first, it should not write files. If you ask it to configure, it should enter through the Operating Model first:

```bash
node intentos/scripts/cli.mjs work . "configure this project under IntentOS"
```

The Operating Model is read-only and selects the required lower-level project,
adoption, or baseline sources. `start` and `baseline` remain advanced source
commands, not user-selected stages.

The first section should be a plain-language recommendation. It states what Codex selected, what evidence supports it, whether a real-world effect still needs consent, and what happens next. The user should not need to interpret `NEXT_ACTION` fields or choose a technical route.

When the Evidence Trace requires baseline detail, maintainers can inspect the
lower-level baseline recommendation:

```bash
node intentos/scripts/cli.mjs baseline .
```

`baseline` is also read-only by default. It reports profile candidates, recommended BL level, Engineering Baseline state, Environment Baseline state, missing decisions, and safe next actions. It must include:

```text
Can AI write now: No
```

Writing baseline docs requires plan-first flow:

```bash
node intentos/scripts/baseline-project.mjs . --write-plan baseline-recommendations/baseline-plan.json
node intentos/scripts/init-project.mjs --target . --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan ./apply-execution-plans/baseline.json
```

The baseline recommendation plan is not executable. Codex must prepare and
apply the exact controlled init/update graph with structured approval and
readiness evidence.

Apply scope is limited to baseline docs and baseline reports.

Baseline output follows the same decision format. Codex may recommend a baseline plan, but applying baseline docs still requires a reviewed plan.

For a plain-language baseline decision:

```bash
node intentos/scripts/cli.mjs baseline-decision .
```

`baseline-decision` turns the project state into a Baseline Decision Card. It explains the derived BL0/BL1/BL2 level, standard packs, industrial candidates, missing evidence, unavailable business facts, and safe next actions. It does not authorize project writes, implementation, release, production, or a real-world effect.

This command prints the card only. Codex records it when the active workflow requires durable evidence; the user does not decide whether an internal technical record should exist.

For platform standard baseline packs:

```bash
node intentos/scripts/cli.mjs standard-baseline .
```

Use the recommendation as a decision summary. It can recommend Web, Mini Program, iOS, Android, internal admin, backend, environment, or release standard packs, but backend and release remain conditional and the output does not approve project writes.

Use `workflow-next` directly only when you need the lower-level technical state:

```bash
node intentos/scripts/workflow-next.mjs .
```

If `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, stop setup. This means the project appears governed, production-sensitive, or dirty. Codex should produce a read-only real adoption report, an existing governance map, and a patch classification report instead of running `init-project`.

```bash
node intentos/scripts/new-workflow-item.mjs --type real-adoption-trial-report --name governed-project-readonly
node intentos/scripts/new-workflow-item.mjs --type patch-classification --name governed-project-repair-scale
node intentos/scripts/check-real-adoption-trial.mjs .
node intentos/scripts/check-patch-classification.mjs .
```

These commands check recorded reports. They do not automatically inspect a real target project, write a bridge, or approve a fix. See `docs/real-adoption-usage.md`.

Real project evidence is local-only by default. Public evidence should be sanitized unless the human explicitly approves naming the target project.

If `workflow-next` reports `NEXT_ACTION: REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing a task. Confirm who owns the current git changes and whether they should be committed, split, stashed, ignored, or reviewed first.

## New Project

Initialize from a starter:

```bash
node intentos/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-new-project
```

Use a platform starter when the target is already clear:

```bash
node intentos/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node intentos/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node intentos/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

Then enter the generated project and check the baseline:

```bash
cd ../my-new-project
node scripts/check-ai-workflow.mjs . --mode core
node scripts/workflow-next.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-launch-review-view.mjs .
node scripts/check-release-adapter.mjs .
node scripts/check-release-execution.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/check-workflow-version.mjs .
```

Use `node scripts/check-ai-workflow.mjs . --mode full` after installing or updating the complete workflow asset set.

## Onboarding Level

Codex derives one level before the first implementation task:

| Level | Use When | Internal obligation |
| --- | --- | --- |
| O0 | Small experiment or local tool | Derive the project goal, platform, first slice, and runnable verification |
| O1 | Normal product or internal tool | Derive project profile, technology strategy, sample policy, risks, and first slice |
| O2 | Regulated, financial, privacy-sensitive, or production-critical work | Derive all O1 controls plus compliance boundary, permission model, release policy, and rollback policy |

IntentOS/Codex drafts and verifies onboarding records. Only unavailable business facts or prepared real-world effects return to the user.

## Engineering Baseline

Before Codex makes structural engineering decisions, use `docs/engineering-baseline.md`.

This file answers:

- where code belongs
- which types are source of truth
- how DTO / schema / domain boundaries work
- when enum / string / lookup / state-machine choices require stronger internal evidence or project-authority reconciliation
- where API contracts, generated types, permissions, migrations, and cross-module state rules come from

Default check:

```bash
node scripts/check-engineering-baseline.mjs .
```

The default mode is advisory. It may report `PENDING` while still allowing low-risk local work. Use `--strict` only after the project wants the baseline to block missing or pending engineering decisions.

Codex must not invent or upgrade project-wide engineering conventions when this baseline is missing.

## Environment Baseline

Before Codex changes build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts, use `docs/environment-baseline.md`.

This file records real project facts and pending decisions. It uses:

- `CONFIRMED`
- `PENDING_CONFIRMATION`
- `NOT_APPLICABLE`

Secret values must never be written into this file.

Default check:

```bash
node scripts/check-environment-baseline.mjs .
```

Use `--strict` only after the project expects pending environment decisions to block work.

## Product Baseline And Claim Control

Product Baseline and Claim Control keep reports, release records, public summaries, and handoffs from becoming approval or overclaiming evidence.

Use them when a change touches workflow behavior, release wording, README/public summaries, final reports, customer handoffs, or IntentOS maintenance:

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
```

These checks do not make claim reports mandatory for every task. Use Assumption Register sections only when the result depends on inferred or unconfirmed facts.

## Project Memory And Context Governance

Use this when Codex observes reusable context, finds stale project docs, or needs to decide whether workflow artifacts should enter Git.

```bash
node scripts/check-context-governance.mjs .
```

Codex may draft learning candidates and context corrections. Humans confirm before source-of-truth changes.

## Safe Launch And Conversation Drift

Use Safe Launch when completed work needs a readiness answer:

```bash
node scripts/check-launch-readiness.mjs .
```

Use Conversation Drift Control when a user message may be discussion-only, review-only, a scope change, a new task, a direct follow-up, a risk decision, or a stop request:

```bash
node scripts/check-conversation-drift.mjs .
```

Readiness labels are not production approvals. Conversation classifications are routing decisions, not permission to widen scope.

## Guided Decision And Delivery Loop

Use Guided Decision & Delivery Loop when the user gives a broad idea or should not be asked to answer raw technical choices.

Codex should recommend the smallest safe path first:

```text
I recommend the first demo slice.
Here is what it includes.
Here is what stays out of scope.
Here is what I can do after confirmation.
Here is what I must not do without a separate decision.
```

Optional artifacts:

```bash
node scripts/new-workflow-item.mjs --type active-work-thread --name first-slice
node scripts/new-workflow-item.mjs --type guided-decision-summary --name status-model
```

These artifacts keep the current mainline visible and translate technical choices into user-owned decisions. They do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.

When these artifacts exist, run:

```bash
node scripts/check-guided-delivery-loop.mjs .
```

## Change Boundary And Baseline State

Use Change Boundary when Codex has completed a task and the human needs a simple answer to:

```text
Was this task only changed inside the expected scope?
```

Create a report when the change is larger than a tiny local fix, when the worktree was dirty, when the project is governed, or when files outside the obvious feature area changed:

```bash
node scripts/new-workflow-item.mjs --type change-boundary-report --name first-slice
node scripts/check-change-boundary.mjs . --report change-boundary-reports/first-slice.md
```

Use Baseline State when a new or no-code project is still designing engineering, environment, platform, or industrial baselines:

```bash
node scripts/new-workflow-item.mjs --type baseline-state-report --name no-code-baseline
node scripts/check-baseline-state.mjs . --report baseline-state-reports/no-code-baseline.md
```

Baseline State keeps proposed, pending-confirmation, evidence-required, and confirmed baselines separate. Codex must not describe a drafted baseline as implemented, production-ready, or verified unless project-owned evidence or a verifiable external fact establishes it.

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
BL0_LIGHTWEIGHT = IntentOS workflow only
BL1_STANDARD = workflow plus platform profiles
BL2_INDUSTRIAL = workflow plus profiles, selected standard packs, and selected industrial overlays
```

Industrial packs are optional BL2 assets. They define production-grade evidence standards; they do not prove a real project is ready by themselves.

Use `industrial-packs/selection-guide.md` while deriving BL2. It explains how Codex combines primary platform, capability, and risk-overlay packs without defaulting to Web or selecting everything.

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

For BL2 projects, Codex drafts `docs/baseline-selection.md` and `docs/baseline-evidence.md` from `.intentos/templates/`, reconciles them with stronger project rules, and runs `check-industrial-baseline.mjs --strict` only after selection, exceptions, residual risks, and evidence are internally resolved.

`baseline-evidence.md` must reference real project evidence. Rows with `Status: Done` need an existing `Evidence Ref`; rows marked `Not applicable` need a reason.

Default bootstrap keeps standard packs available for read-only recommendation and industrial packs lightweight. Install concrete industrial packs only after selection:

```bash
node intentos/scripts/init-project.mjs \
  --target ../my-project \
  --update-workflow-assets \
  --industrial-packs web-app-industrial
```

Evidence has three layers: project-level baseline evidence, task-triggered evidence, and release evidence. A task should not carry the entire pack catalog unless it actually touches those areas.

For Web BL2 projects, the Web industrial pack now expects runtime evidence for UI states, form interactions, API failure behavior, accessibility, performance or asset impact, release, rollback, and monitoring when those areas are touched. It remains framework-neutral; framework or hosting-specific rules should live in separate candidate packs until stabilized.

See `examples/web-industrial-bl2-first-slice` for a framework-neutral dogfood package that connects baseline selection, evidence, task gate, release record, and AI task log.

For WeChat Mini Program BL2 projects, use `wechat-miniprogram-industrial` for the mini program runtime. Add `internal-admin-industrial`, `backend-api-industrial`, `cloudbase-industrial`, `auth-permission-industrial`, `data-storage-industrial`, or `payment-value-transfer-industrial` only when those companion surfaces are actually in scope.

See `examples/miniprogram-industrial-bl2-first-slice` for a Mini Program dogfood package covering login state, cloud read boundary, permission and failure states, release readiness, and AI task logging.

For a real project trial, copy `.intentos/templates/dogfood-observation.md` into `workflow-retros/<date>-dogfood-observation.md` or another agreed project observation location. Use it to track workflow cost, evidence effort, Risk Gate false positives or false negatives, and AI collaboration quality. It is an observation record, not a replacement for task artifacts or release evidence.

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

New artifacts created by `new-workflow-item.mjs` include frontmatter for schema-aware checks. Legacy artifacts without frontmatter warn by default. Use strict mode only for migration rehearsals:

```bash
node scripts/check-workflow-artifacts.mjs . --mode draft --strict-schema
```

Only after the request, spec, eval, and task card are clear should an agent implement code.

For a high-risk implementation task, run the task-scoped implementation gate:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/001-first-slice.md
```

If any Risk Gate item is checked, the task card must include the structured compatibility approval section required by the checker. It may record the user's original bounded business request or prepared real-world consent, but it must not ask the user to approve technical architecture or internal safeguards.

When independent review is needed, generate a Review Packet:

```bash
node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md
```

Fill it with the diff summary, commands run, evidence refs, known risks, and open questions before independent read-only review by a reviewer agent, GPT Pro, or a second model. A Review Packet is not approval.

For L2/L3 work, or whenever review findings need a recorded loop, generate a Review Loop Report:

```bash
node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md
```

If GPT Pro or a second model will review the packet, generate a read-only reviewer prompt:

```bash
node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md
```

Codex may auto-fix only deterministic, low-risk findings inside the task boundary, for at most 2 rounds. It resolves technical scope, architecture, dependency, and test issues internally; unavailable business facts, protected project authority, and prepared real-world effects use their existing bounded decision paths.

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
node intentos/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

This updates `.intentos/`, workflow scripts, CI, missing onboarding docs, and missing workflow directories. It does not overwrite existing product docs, specs, tasks, logs, or business code.

For an existing governed, already-online, dirty, or first-adoption project, inspect state first:

```bash
node intentos/scripts/workflow-next.mjs ../existing-project
```

If the result allows guarded setup, generate and apply a reviewed plan:

```bash
node intentos/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --backup-dir .intentos/backups/first-adoption \
  --write-plan /tmp/intentos-update-plan.json
node intentos/scripts/init-project.mjs \
  --apply-plan /tmp/intentos-update-plan.json
```

If the result is `RUN_ADOPTION_ASSESSMENT`, keep the first pass read-only. Map existing agent rules, CI, baselines, evidence, release/rollback controls, and dirty worktree state before asking for adapter approval.

From 1.62 onward, if the user wants the existing project to actually adopt
IntentOS instead of staying adapter-only, generate a native migration plan
before any workflow asset write:

```bash
node intentos/scripts/cli.mjs workflow-map ../existing-project
node intentos/scripts/cli.mjs native-migration ../existing-project
node intentos/scripts/cli.mjs native-migration-check ../existing-project
```

The native migration plan is still plan-only. It can classify old rules and
recommend IntentOS as the future planning workflow, but it cannot overwrite
`AGENTS.md`, CI, hooks, release SOPs, production config, business logic, data, or
secrets. Any approved governance-file edit must still go through Unified Apply
Plan, Controlled Apply Readiness, and Approval Record.

It creates `AGENTS.md` when missing. If the project already has `AGENTS.md` and it is missing workflow governance markers, the update command writes a migration report instead of modifying the file:

```text
.intentos/migration-reports/agents-governance.md
```

After Codex completes rule reconciliation, bounded plan review, rollback preparation, and controlled readiness, it may apply the proposed appendix:

```bash
node intentos/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-agent-governance
```

If the project already has `.github/pull_request_template.md` and it is missing workflow governance markers, the update command writes a migration report instead of modifying the template:

```text
.intentos/migration-reports/pr-template-governance.md
```

After Codex completes rule reconciliation, bounded plan review, rollback preparation, and controlled readiness, it may apply the proposed appendix:

```bash
node intentos/scripts/init-project.mjs \
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
