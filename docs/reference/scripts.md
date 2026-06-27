# Scripts Reference

This reference lists the stable command surface and the lower-level scripts that remain available for CI and evidence.

## CLI Front Door

Use `scripts/cli.mjs` for daily operation.

| Command | Purpose | Writes |
|---|---|---|
| `node scripts/cli.mjs init --starter <starter> --target <project>` | Initialize workflow assets | Yes |
| `node scripts/cli.mjs update --target <project>` | Update workflow assets | Yes |
| `node scripts/cli.mjs next <project>` | Read project state and report next safe action | No |
| `node scripts/cli.mjs check <project> --mode core` | Run core workflow check | No |
| `node scripts/cli.mjs doctor <project>` | Run `next` then core check | No |
| `node scripts/cli.mjs new --type <artifact> --name <slug>` | Create a workflow artifact | Yes |
| `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --dry-run` | Preview migration plan | No |
| `node scripts/cli.mjs migrate --target <project> --from 0.33.0 --to 1.0.0 --write-plan <file>` | Write migration plan JSON only | Plan file only |
| `node scripts/cli.mjs fixtures` | Run fixture suite | No |
| `node scripts/cli.mjs self-check` | Run dev-kit self-check | No |

Global `--dry-run` prints the underlying command without running it.

## Init And Update

`scripts/init-project.mjs` is the lower-level implementation for `init` and `update`.

Important flags:

- `--starter <name>`
- `--target <project>`
- `--update-workflow-assets`
- `--dry-run`
- `--write-plan <file>`
- `--apply-plan <file>`
- `--backup-dir <dir>`
- `--apply-agent-governance`
- `--apply-pr-template-governance`

Governed, production, dirty, or unbootstrapped existing projects must use plan-first flow.

## Project State

`scripts/workflow-next.mjs` reads project state and reports:

- `ADOPTION_MODE`
- `NEXT_ACTION`
- `CAN_WRITE_WORKFLOW_ASSETS`
- `PROJECT_STATE_TAGS`
- platform baseline readiness
- industrial baseline readiness

Use `--enforce` when the command should fail unsafe states instead of only reporting them.

## Artifact Creation

`scripts/new-workflow-item.mjs` creates supported workflow artifacts with frontmatter.

Common types:

- `request`
- `preflight`
- `spec`
- `eval`
- `task`
- `ai-task-log`
- `review-packet`
- `gpt-review-prompt`
- `review-loop-report`
- `follow-up-proposal`
- `final-report`
- `goal-card`
- `subagent-run-plan`

## Checks

Checker details are in `docs/reference/checkers.md`.

Common commands:

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-workflow-artifacts.mjs . --mode ready
node scripts/check-review-loop.mjs .
node scripts/check-next-step-boundary.mjs .
node scripts/check-goal-mode.mjs .
node scripts/check-subagent-orchestration.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-platform-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-pack.mjs .
```

## Dev-Kit Only Scripts

These are primarily for maintaining this repository:

- `scripts/check-dev-kit.mjs`
- `scripts/check-fixtures.mjs`
- `scripts/check-manifest.mjs`
- `scripts/check-glossary-usage.mjs`
- `scripts/score-output-quality.mjs`

Target projects normally do not need to run dev-kit-only checks.
