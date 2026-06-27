# Checkers Reference

Checkers enforce workflow behavior. They are not a substitute for human risk acceptance.

## Target Project Checks

| Checker | Purpose |
|---|---|
| `check-ai-workflow.mjs` | Core or full workflow asset check |
| `start-project.mjs` | Read-only guided adoption recommendation |
| `baseline-project.mjs` | Read-only engineering/environment baseline recommendation and plan-first baseline apply |
| `check-guided-adoption.mjs` | Saved adoption recommendation report check |
| `workflow-next.mjs` | Project-state and next-action detector |
| `check-project-onboarding.mjs` | O0/O1/O2 onboarding readiness |
| `check-engineering-baseline.mjs` | Engineering Baseline completeness and pending decisions |
| `check-environment-baseline.mjs` | Environment Baseline structure, pending decisions, and obvious secret misuse |
| `check-baseline-enforcement.mjs` | Artifact-level baseline references in tasks, review packets, and review loops |
| `check-product-baseline.mjs` | Guided delivery product boundary, approval limits, and installed 1.3 assets |
| `check-claim-control.mjs` | Release/report wording, evidence claims, and assumption register boundaries |
| `check-platform-baseline.mjs` | Platform profile and platform baseline readiness |
| `resolve-platform-baseline.mjs` | Resolve selected platform profiles |
| `check-industrial-baseline.mjs` | BL0/BL1/BL2 and selected industrial baseline readiness |
| `resolve-industrial-baseline.mjs` | Resolve selected industrial packs |
| `check-workflow-version.mjs` | Installed workflow asset version |
| `check-workflow-artifacts.mjs` | Request/preflight/spec/eval/task/report artifact quality |
| `check-review-loop.mjs` | Review Packet and Review Loop semantics |
| `check-next-step-boundary.mjs` | Bounded Next-Step suggestions |
| `check-goal-mode.mjs` | Goal Card semantics |
| `check-subagent-orchestration.mjs` | Many readers / one writer and helper closure |
| `workflow-daily-summary.mjs` | Project-scoped daily summary support |
| `summarize-ai-logs.mjs` | Summarize AI task logs |

## Dev-Kit Maintenance Checks

| Checker | Purpose |
|---|---|
| `check-dev-kit.mjs` | Full repository self-check |
| `check-fixtures.mjs` | Golden, bad, migration, CLI, init/update, and output-quality fixture matrix |
| `check-manifest.mjs` | Manifest shape, required assets, copy rules, workflow-version sync |
| `check-industrial-pack.mjs` | Industrial pack structure, maturity metadata, draft overclaim scan |
| `score-output-quality.mjs` | Human-facing report quality score |
| `check-glossary-usage.mjs` | Plain-language glossary coverage |

## Common Modes

`check-ai-workflow.mjs`:

- `--mode core`: minimal target-project workflow check
- `--mode full`: complete workflow asset check

`check-workflow-artifacts.mjs`:

- `--mode draft`: early incomplete artifacts allowed
- `--mode ready`: before implementation
- `--mode implementation`: after implementation
- `--task <task-file>`: task-scoped graph consistency
- `--changed-only`: CI-friendly changed artifact scope
- `--strict-schema`: fail legacy artifacts without frontmatter

Industrial pack checks:

- `--selected-only`: only check selected packs for a project
- `--bl2-only`: focus on BL2 industrial baseline readiness

Baseline enforcement checks:

- `check-environment-baseline.mjs` defaults to advisory mode; use `--strict` only when pending environment decisions should block work.
- `check-baseline-enforcement.mjs --mode ready` checks declarations before implementation.
- `check-baseline-enforcement.mjs --mode implementation` is stricter for BL1/BL2 or L3 task closure.

Product and claim checks:

- `check-product-baseline.mjs` is source-strict for Dev Kit maintenance and target-safe for generated projects.
- `check-claim-control.mjs` checks public wording and reports; it does not make claim reports mandatory for every task.
- Assumption Register is required only when reports rely on inferred or unconfirmed facts.

## Suggested Sequences

For a normal target project:

```bash
node scripts/workflow-next.mjs .
node scripts/start-project.mjs .
node scripts/check-guided-adoption.mjs .
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
```

For L2/L3 task completion:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-baseline-enforcement.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-review-loop.mjs . --task tasks/<task>.md
node scripts/check-next-step-boundary.mjs . --task tasks/<task>.md
```

For dev-kit changes:

```bash
node scripts/check-manifest.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Failure Handling

Treat failures as one of three categories:

- deterministic AUTO_FIX inside current task scope
- NEEDS_HUMAN_DECISION
- out-of-scope follow-up

Do not turn checker failure into permission to rewrite unrelated parts of a project.
