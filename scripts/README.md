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

Update mode may add missing onboarding docs, missing workflow directories, missing `AGENTS.md`, and refresh injected workflow scripts/CI. It must not overwrite existing project docs, specs, tasks, logs, business code, an existing `AGENTS.md`, or an existing `.github/pull_request_template.md`.

If `AGENTS.md` is missing, update mode creates it from the Codex platform template. If an existing `AGENTS.md` is missing workflow governance markers, update mode writes:

```text
.ai-native/migration-reports/agents-governance.md
```

Apply the proposed appendix only after human review:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-agent-governance
```

If an existing PR template is missing workflow governance markers, update mode writes:

```text
.ai-native/migration-reports/pr-template-governance.md
```

Apply the proposed appendix only after human review:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target ../my-project --update-workflow-assets --apply-pr-template-governance
```

Injected workflow scripts:

- `scripts/check-ai-workflow.mjs`
- `scripts/check-project-onboarding.mjs`
- `scripts/check-engineering-baseline.mjs`
- `scripts/check-platform-baseline.mjs`
- `scripts/resolve-platform-baseline.mjs`
- `scripts/check-industrial-pack.mjs`
- `scripts/resolve-industrial-baseline.mjs`
- `scripts/check-industrial-baseline.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/check-workflow-version.mjs`
- `scripts/new-workflow-item.mjs`
- `scripts/summarize-ai-logs.mjs`
- `scripts/workflow-daily-summary.mjs`
- `scripts/workflow-next.mjs`
- `scripts/resolve-document-lifecycle.mjs`
- `scripts/check-document-lifecycle.mjs`
- `scripts/resolve-document-archive-apply.mjs`
- `scripts/check-document-archive-apply.mjs`
- `scripts/resolve-work-queue.mjs`
- `scripts/check-work-queue.mjs`
- `scripts/resolve-hook-orchestration.mjs`
- `scripts/check-hook-orchestration.mjs`
- `scripts/resolve-hook-policy.mjs`
- `scripts/check-hook-policy.mjs`
- `scripts/resolve-workflow-guidance.mjs`
- `scripts/check-workflow-guidance.mjs`
- `scripts/resolve-review-surface.mjs`
- `scripts/check-review-surface.mjs`
- `scripts/resolve-debt-handoff.mjs`
- `scripts/check-debt-handoff.mjs`

## check-ai-workflow.mjs

Check whether a project contains the minimum AI Native workflow assets.

```bash
node ai-native-dev-kit/scripts/check-ai-workflow.mjs ../my-project
node ai-native-dev-kit/scripts/check-ai-workflow.mjs ../my-project --mode core
node ai-native-dev-kit/scripts/check-ai-workflow.mjs ../my-project --mode full
```

Modes:

- `core`: checks the daily workflow runtime, project context docs, templates, prompts, checklists, scripts, PR template, and CI entry. Use this for routine target-project CI.
- `full`: default; also checks platform profiles, industrial registry/schema, baseline templates, and profile-specific baseline assets. Use this after installing or updating the full workflow kit.

## workflow-next.mjs

Detect whether a target is a new project, existing project, or bootstrapped project, then print the next safe workflow action.

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs ../my-project
node scripts/workflow-next.mjs .
node scripts/workflow-next.mjs . --format human
node scripts/workflow-next.mjs . --format technical
node scripts/workflow-next.mjs . --format json
node scripts/workflow-next.mjs . --json
node scripts/workflow-next.mjs . --enforce
```

This script does not interpret natural language and does not write files. Codex should use `.ai-native/prompts/bootstrap-agent.md` for execution-vs-discussion intent, then use `workflow-next.mjs` for project state.

Default output is `--format human`: a human summary first, followed by technical state fields. Use `--format technical` for raw field-first output and `--format json` or `--json` for machine-readable output.

`--enforce` exits non-zero when workflow assets are missing, versions mismatch, migration reports need approval, or onboarding is not ready.

## resolve-workflow-guidance.mjs / check-workflow-guidance.mjs

Return one plain-language next-step card from a natural-language project entry.

```bash
node scripts/resolve-workflow-guidance.mjs .
node scripts/check-workflow-guidance.mjs .
node scripts/cli.mjs guide .
node scripts/cli.mjs guide-check .
```

`resolve-workflow-guidance.mjs` is read-only. It reports project state, delivery path state, recommended next step, distance to useful use, limited questions for the human, internal routing, and no-write/no-CI/no-hook/no-release boundaries. `check-workflow-guidance.mjs` rejects overclaims, too many questions, and internal workflow jargon in plain mode.

## resolve-review-surface.mjs / check-review-surface.mjs

Select what must be reviewed before and after execution.

```bash
node scripts/resolve-review-surface.mjs .
node scripts/check-review-surface.mjs .
node scripts/cli.mjs review-surface .
node scripts/cli.mjs review-surface-check .
```

`resolve-review-surface.mjs` is read-only. It selects review surfaces from project signals and user intent, always including functional, code, verification, and debt review. `check-review-surface.mjs` rejects cards that miss required surfaces, omit post-execution close-out fields, or claim implementation, release, target-write, CI, hook, document, task-state, or high-risk approval.

## resolve-delivery-path.mjs / check-delivery-path.mjs

Report how far a project is from useful use without approving release.

```bash
node scripts/resolve-delivery-path.mjs .
node scripts/check-delivery-path.mjs .
node scripts/cli.mjs delivery-path .
node scripts/cli.mjs delivery-path-check .
```

`resolve-delivery-path.mjs` is read-only. It reports the current delivery state, next target state, distance to useful use, evidence, blockers, next safe action, and human decisions. `check-delivery-path.mjs` rejects invalid states, missing evidence, release overclaims, Safe Launch replacement, and implementation/release approval claims.

## resolve-debt-handoff.mjs / check-debt-handoff.mjs

```bash
node scripts/resolve-debt-handoff.mjs .
node scripts/check-debt-handoff.mjs .
node scripts/cli.mjs debt-handoff .
node scripts/cli.mjs debt-handoff-check .
```

`resolve-debt-handoff.mjs` is read-only. It records debt level, knowledge handoff, verification notes, files to revisit, human decisions, and safe boundaries for paused, interrupted, or unfinished work. `check-debt-handoff.mjs` rejects debt forgiveness, implementation approval, release/production approval, task-state/source-of-truth changes, Review Loop replacement, Safe Launch replacement, missing handoff subsections, and invalid debt levels.

## resolve-document-archive-apply.mjs / check-document-archive-apply.mjs

Plan archive apply without executing it.

```bash
node scripts/resolve-document-archive-apply.mjs .
node scripts/check-document-archive-apply.mjs .
node scripts/cli.mjs archive-apply .
node scripts/cli.mjs archive-apply-check .
```

`resolve-document-archive-apply.mjs` is read-only. It turns Document Lifecycle archive suggestions into an apply plan, link-check plan, archive index preview, rollback plan, excluded-file list, and human decisions. `check-document-archive-apply.mjs` rejects archive apply authorization, moved/deleted/archived claims, link-rewrite claims, cleanup-complete claims, source-of-truth changes, and plans missing link-check, archive-index, or rollback sections.

## resolve-work-queue.mjs / check-work-queue.mjs

Review task state without changing it.

```bash
node scripts/resolve-work-queue.mjs .
node scripts/check-work-queue.mjs .
node scripts/cli.mjs work-queue .
node scripts/cli.mjs work-queue-check .
```

`resolve-work-queue.mjs` is read-only. It reports current, paused, blocked, backlog, and resume candidates. `check-work-queue.mjs` enforces at most one `CURRENT` task and requires resume review before paused work continues.

## resolve-hook-orchestration.mjs / check-hook-orchestration.mjs

Review hook candidates without installing hooks.

```bash
node scripts/resolve-hook-orchestration.mjs .
node scripts/check-hook-orchestration.mjs .
node scripts/cli.mjs hook-plan .
node scripts/cli.mjs hook-plan-check .
```

`resolve-hook-orchestration.mjs` is read-only. It classifies candidate triggers as H0/H1/H2/H3. `check-hook-orchestration.mjs` rejects plans that install hooks, modify CI, add blocking gates, call external APIs, enable auto-fix, or treat hook output as human approval.

## resolve-hook-policy.mjs / check-hook-policy.mjs

Define project hook policy without installing hooks.

```bash
node scripts/resolve-hook-policy.mjs .
node scripts/check-hook-policy.mjs .
node scripts/cli.mjs hook-policy .
node scripts/cli.mjs hook-policy-check .
```

`resolve-hook-policy.mjs` is read-only. It recommends project-level H0/H1/H2/H3 rules, approval owners, and rollback / disable requirements. `check-hook-policy.mjs` rejects hook-installation authority, CI mutation, blocking gates, external APIs, secret storage, auto-fix, missing approval owners, missing rollback policy, and release/production overclaims.

## check-baseline-selection-precision.mjs

Check the Guided Baseline Selection precision scoreboard and synthetic
calibration fixtures.

```bash
node scripts/check-baseline-selection-precision.mjs .
node scripts/check-baseline-selection-precision.mjs . --skip-fixtures
node scripts/check-baseline-selection-precision.mjs . --json
node scripts/check-baseline-selection-precision.mjs . --scoreboard baseline-calibration-reports/scoreboard.md
```

This checker validates scoreboard structure, false-positive / false-negative
status values, Summary Metrics, required fixture case ids from
`baseline-calibration-reports/precision-fixtures.json`, and resolver output for
generated local calibration cases. It is calibration evidence only; it does not
approve target-project writes or prove production readiness.

## resolve-platform-baseline.mjs

Resolve `docs/project-profile.md` `Selected Profiles` into an effective platform baseline from `.ai-native/profiles/*/baseline.json`, including required docs, escalation rules, risk mappings, verification, release checks, and AI boundaries.

```bash
node scripts/resolve-platform-baseline.mjs .
node scripts/resolve-platform-baseline.mjs . --json
```

## check-platform-baseline.mjs

Check selected platform profiles, required docs, starter compatibility, verification coverage, `scripts/verify.sh` coverage, risk policy coverage, and permission model coverage.

```bash
node scripts/check-platform-baseline.mjs .
node scripts/check-platform-baseline.mjs . --strict
node scripts/check-platform-baseline.mjs . --json
```

Default mode allows pending profile decisions and reports incomplete coverage as `PENDING`. Strict mode is for confirmed project baselines and turns incomplete coverage into `FAIL`. `--json` emits machine-readable JSON only.

## check-industrial-pack.mjs

Check AI Native industrial pack structure, metadata, references, required files, and basic purity rules. This validates the dev-kit pack itself or the `.ai-native/industrial-packs` assets injected into a project; it does not certify that a real project is industrial-ready.

```bash
node scripts/check-industrial-pack.mjs .
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/check-industrial-pack.mjs . --json
```

Use full mode for the dev-kit repository. Use `--selected-only` in target projects so only packs selected in `docs/baseline-selection.md` are required.

Target projects include `.ai-native/industrial-packs/selection-guide.md` by default. Use it before selecting packs; concrete pack files are still installed only when selected or explicitly requested.

If a selected pack is missing from the target project, the checker prints a repair command that installs the selected pack through `init-project --update-workflow-assets --industrial-packs <pack-id>`.

## resolve-industrial-baseline.mjs

Resolve `docs/baseline-selection.md` and selected industrial packs into an effective project industrial baseline.

```bash
node scripts/resolve-industrial-baseline.mjs .
node scripts/resolve-industrial-baseline.mjs . --json
```

## check-industrial-baseline.mjs

Check project-level BL2 readiness. Default mode reports missing human decisions or evidence as `PENDING`; strict mode turns incomplete BL2 readiness into `FAIL`.

```bash
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
node scripts/check-industrial-baseline.mjs . --strict
node scripts/check-industrial-baseline.mjs . --json
```

Strict mode validates the structured `docs/baseline-evidence.md` evidence index. `Done` rows must point to existing project files through `Evidence Ref`; `Not applicable` rows must include `Reason if skipped`.

Use `--bl2-only` in routine target-project CI so BL0/BL1 projects skip industrial readiness checks until `BL2_INDUSTRIAL` is selected.

If BL2 selected packs are declared but not installed, the checker prints a repair command that installs the missing packs before evidence validation continues.

For Web BL2 projects, `web-app-industrial` includes additional required evidence for form interactions, API failure behavior, accessibility, performance, and runtime quality when those areas are touched. These rules stay framework-neutral and are resolved through the industrial baseline pack.

`check-workflow-artifacts.mjs` also detects likely missed Risk Gate checks from the task and linked spec. Ready mode reports a warning; implementation mode fails unless the task has a human-accepted `Risk Gate Exclusions` entry for the text-only risk mention. If a task has more than three accepted exclusions, ready mode warns and implementation mode requires `Human Approval` scope to explicitly cover Risk Gate Exclusions.

## new-workflow-item.mjs

Create numbered workflow files from templates and keep basic cross-references aligned.

```bash
node scripts/new-workflow-item.mjs --type request --name first-slice
node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md
node scripts/new-workflow-item.mjs --type spec --name first-slice --request requests/001-first-slice.md --preflight preflight/001-first-slice.md
node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md
node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1
node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type subagent-run-plan --task tasks/001-first-slice.md --subagent-mode READ_ONLY_RESEARCH
node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next
node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection
node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type customer-handoff --name release-001
node scripts/new-workflow-item.mjs --type document-lifecycle-report --name stale-docs
```

## document lifecycle

Review document lifecycle state without deleting, moving, archiving, or changing
source of truth:

```bash
node scripts/cli.mjs doc-lifecycle .
node scripts/cli.mjs doc-lifecycle-check .
node scripts/resolve-document-lifecycle.mjs .
node scripts/check-document-lifecycle.mjs .
```

Use `doc-lifecycle-reports/` when stale docs, duplicate docs, archive
suggestions, deprecation suggestions, or source-of-truth conflicts need to be
recorded. Archive is only a suggestion until a human approves a separate plan.

Use `archive-apply-plans/` when approved archive suggestions need a controlled
apply plan. The plan records what would move, what links must be checked, how the
archive index would be updated, and how to roll back. It still does not execute
archive actions.

## check-workflow-artifacts.mjs

Check filled workflow artifacts for required sections, placeholder content, and cross-file references.

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
node scripts/check-workflow-artifacts.mjs . --mode draft
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/001-first-slice.md
node scripts/check-workflow-artifacts.mjs . --task tasks/001-first-slice.md
node scripts/check-workflow-artifacts.mjs . --mode ready --changed-only --base origin/main
```

Modes:

- `draft`: checks structure and resolvable references, but allows placeholders.
- `ready`: default; checks placeholders, single-choice fields, graph consistency, and task approval structure.
- `implementation`: requires `--task` and requires checked risk items to have approved human approval with scope.

This check is intentionally stricter than `check-ai-workflow.mjs`. It should run before implementation once request/spec/eval/task files exist.
For L2/L3 tasks, implementation mode also expects matching Review Packet and Review Loop Report artifacts.
In CI, prefer `--mode ready --changed-only --base <base-ref>` so historical draft artifacts do not block unrelated changes.

## check-review-loop.mjs

Check Review Loop Reports for semantic rules such as valid finding categories, AUTO_FIX limits, human-decision routing, and verification after fixes.

```bash
node scripts/check-review-loop.mjs .
node scripts/check-review-loop.mjs . --task tasks/001-first-slice.md
node scripts/check-review-loop.mjs . --mode implementation --task tasks/001-first-slice.md
```

## check-subagent-orchestration.mjs

Check Subagent Run Plans for helper-agent authority, one-writer control, handoff, and closure.

```bash
node scripts/check-subagent-orchestration.mjs .
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/001-first-slice.md
node scripts/check-subagent-orchestration.mjs . --json
```

Empty projects pass without requiring a run plan. When a run plan exists, every subagent must be `CLOSED` or `SKIPPED` before the final response, commit, or task closure.

## check-next-step-boundary.mjs

Check Review Loop Reports, Final Reports, review summaries, and Follow-up Proposals for bounded next-step rules.

```bash
node scripts/check-next-step-boundary.mjs .
node scripts/check-next-step-boundary.mjs . --task tasks/001-first-slice.md
node scripts/check-next-step-boundary.mjs . --mode implementation --task tasks/001-first-slice.md
```

## check-fixtures.mjs

Run dev-kit fixture checks. This is for the dev-kit repository itself; it is not injected into target projects.

```bash
node scripts/check-fixtures.mjs
node scripts/check-fixtures.mjs --case "bad review loop forbidden auto fix"
node scripts/check-fixtures.mjs --json
```

The runner calls the real governance checkers and asserts expected pass/fail output. It must not reimplement checker rules.

The case registry records `type`, `checker`, expected output, and fixture-maintainer repair guidance. Generated-project cases may create a temporary target project and clean it up after the case.

When a fixture fails, the runner prints the command, the failed expectation, actual output, and repair guidance from `test-fixtures/fixture-cases.json`.

## score-output-quality.mjs

Score durable human-facing reports for output quality. This is a dev-kit hardening checker and is not injected into target projects by default.

```bash
node scripts/score-output-quality.mjs examples/next-step-boundary-suggestions --min-score 80
node scripts/score-output-quality.mjs examples/next-step-boundary-suggestions --json
```

## check-glossary-usage.mjs

Check that important workflow terms have plain-language explanations in `core/glossary.md`.

```bash
node scripts/check-glossary-usage.mjs .
node scripts/check-glossary-usage.mjs . --json
```

## check-dev-kit.mjs

Check whether the dev kit itself is internally complete and extension-safe.
This also runs fixture checks, initializes a temporary project, runs its workflow check, runs AI log summarization, and verifies workflow asset update mode.

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
node scripts/check-project-onboarding.mjs . --level O0
node scripts/check-project-onboarding.mjs . --level O1
node scripts/check-project-onboarding.mjs . --level O2
```

Default mode verifies that onboarding files and workflow assets exist. It reads `## Onboarding Level` from `docs/project-onboarding.md` when possible and otherwise defaults to O1. Strict mode is for after human decisions are confirmed; it fails while placeholders or pending decisions remain.

## check-engineering-baseline.mjs

Check whether `docs/engineering-baseline.md` exists and whether required engineering decision sections are filled or still pending.

```bash
node scripts/check-engineering-baseline.mjs .
node scripts/check-engineering-baseline.mjs . --strict
node scripts/check-engineering-baseline.mjs . --json
```

Default mode is advisory and exits successfully with `PENDING` when decisions still need human confirmation. Strict mode is for projects that deliberately make engineering baseline readiness a blocking gate.

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

## resolve-existing-workflow.mjs

Recommend how AI Native workflow should map to an existing project before
target-project writes.

```bash
node scripts/resolve-existing-workflow.mjs .
node scripts/resolve-existing-workflow.mjs . --json
node scripts/cli.mjs workflow-map .
```

This command is read-only. It inventories existing workflow signals and
recommends which AI Native workflows to use, reuse, add later, or avoid.

## check-workflow-adoption-map.mjs

Check recorded Workflow Adoption Maps.

```bash
node scripts/check-workflow-adoption-map.mjs .
node scripts/check-workflow-adoption-map.mjs examples/1.20-existing-project-workflow-adapter
node scripts/cli.mjs workflow-map-check .
```

This checker rejects reports that turn a workflow recommendation into permission
to write target files, change CI/hooks, overwrite governance, approve
implementation, or approve release/production/high-risk decisions.

These scripts intentionally avoid external dependencies.
