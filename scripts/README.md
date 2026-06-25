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

## check-ai-workflow.mjs

Check whether a project contains the minimum AI Native workflow assets.

```bash
node ai-native-dev-kit/scripts/check-ai-workflow.mjs ../my-project
```

## workflow-next.mjs

Detect whether a target is a new project, existing project, or bootstrapped project, then print the next safe workflow action.

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs ../my-project
node scripts/workflow-next.mjs .
node scripts/workflow-next.mjs . --json
node scripts/workflow-next.mjs . --enforce
```

This script does not interpret natural language and does not write files. Codex should use `.ai-native/prompts/bootstrap-agent.md` for execution-vs-discussion intent, then use `workflow-next.mjs` for project state.

`--enforce` exits non-zero when workflow assets are missing, versions mismatch, migration reports need approval, or onboarding is not ready.

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
node scripts/check-industrial-pack.mjs . --json
```

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
node scripts/check-industrial-baseline.mjs . --strict
node scripts/check-industrial-baseline.mjs . --json
```

## new-workflow-item.mjs

Create numbered workflow files from templates and keep basic cross-references aligned.

```bash
node scripts/new-workflow-item.mjs --type request --name first-slice
node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md
node scripts/new-workflow-item.mjs --type spec --name first-slice --request requests/001-first-slice.md --preflight preflight/001-first-slice.md
node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md
node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1
node scripts/new-workflow-item.mjs --type ai-log --task tasks/001-first-slice.md
```

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
In CI, prefer `--mode ready --changed-only --base <base-ref>` so historical draft artifacts do not block unrelated changes.

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
node scripts/check-project-onboarding.mjs . --level O0
node scripts/check-project-onboarding.mjs . --level O1
node scripts/check-project-onboarding.mjs . --level O2
```

Default mode verifies that onboarding files and workflow assets exist. It reads `## Onboarding Level` from `docs/project-onboarding.md` when possible and otherwise defaults to O1. Strict mode is for after human decisions are confirmed; it fails while placeholders or pending decisions remain.

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
