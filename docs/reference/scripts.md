# Scripts Reference

This reference lists the stable command surface and the lower-level scripts that remain available for CI and evidence.

## CLI Front Door

Use `scripts/cli.mjs` for daily operation.

| Command | Purpose | Writes |
|---|---|---|
| `node scripts/cli.mjs start <project>` | Read-only guided adoption recommendation | No |
| `node scripts/cli.mjs baseline <project>` | Read-only engineering/environment baseline recommendation | No |
| `node scripts/cli.mjs product-baseline <project>` | Check guided delivery product boundary and approval limits | No |
| `node scripts/cli.mjs claim-control <project>` | Check release/report wording against evidence boundaries | No |
| `node scripts/cli.mjs context-governance <project>` | Check project memory, context correction, and Git boundary governance | No |
| `node scripts/cli.mjs launch-readiness <project>` | Check Safe Launch / Delivery Readiness reports | No |
| `node scripts/cli.mjs conversation-drift <project>` | Check conversation turn routing and scope-change governance | No |
| `node scripts/cli.mjs guided-delivery <project>` | Check active work thread, parking lot, and guided decision boundaries | No |
| `node scripts/cli.mjs first-delivery <project>` | Check First Delivery Walkthrough and Adoption Trial evidence | No |
| `node scripts/cli.mjs real-adoption <project>` | Check recorded real-project read-only adoption trial evidence; does not auto-generate a report | No |
| `node scripts/cli.mjs patch-classification <project>` | Check recorded repair-scale classification and false-positive calibration reports before non-trivial fixes | No |
| `node scripts/cli.mjs change-boundary <project> --report <file>` | Check that actual changed files stay inside recorded task scope | No |
| `node scripts/cli.mjs baseline-state <project> --report <file>` | Check proposed/pending/evidence-required/confirmed baseline state claims | No |
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

`scripts/start-project.mjs` is the first-hour adoption entry. It calls `workflow-next`, classifies the target project, lists decisions needed from the human, and recommends safe next actions. It is read-only by default and must not write target project files.

`scripts/baseline-project.mjs` is the second guided entry. It recommends Engineering and Environment Baseline setup and is read-only by default. Use `--write-plan <file>` to write a reviewable plan and `--apply-plan <file>` to apply only approved baseline docs and baseline reports.

`scripts/check-product-baseline.mjs` checks the guided delivery product boundary: humans keep judgment and approval, reports are not approvals, simulated evidence is not production evidence, and industrial packs remain selected-only.

`scripts/check-claim-control.mjs` checks README, release records, final reports, and handoffs for overclaims and missing assumption boundaries.

`scripts/check-context-governance.mjs` checks Learning Candidates, Context Correction Reports, Git Boundary Reports, and source-of-truth boundaries.

`scripts/check-launch-readiness.mjs` checks Launch Readiness Reports, readiness states, verification evidence, pending human decisions, and launch overclaims.

`scripts/check-conversation-drift.mjs` checks Conversation Turn Classification reports and Scope Change Reports so discussion, new scope, direct follow-ups, and risk decisions do not silently continue the current task.

`scripts/check-guided-delivery-loop.mjs` checks Active Work Thread and Guided Decision Summary reports so current mainline, parking lot, and D0-D4 decision boundaries stay visible and non-executable decisions do not become implementation approval.

`scripts/check-first-delivery-walkthrough.mjs` checks Adoption Trial Reports so first-slice walkthroughs include the starting idea, route, baseline path, artifacts, human decisions, drift handling, verification, launch readiness, final report, and claim boundary.

`scripts/check-real-adoption-trial.mjs` checks real-project read-only adoption reports so existing governed or production-sensitive projects are mapped before writes, public evidence stays sanitized, and bridge proposals do not overwrite existing authority.

`scripts/check-patch-classification.mjs` checks patch classification reports so non-trivial fixes are routed as safe local fixes, baseline-aligned hardcuts, structural remediation, human decisions, or do-not-patch stops before implementation. It also checks `patch-classification-false-positives/` when present. False-positive records are calibration evidence only; they do not approve implementation.

`scripts/check-change-boundary.mjs` checks Change Boundary Reports so intended scope, allowed paths, forbidden paths, actual changed files, boundary result, and claim boundary are explicit. Use `--report <file>` for a specific report and `--cached` or `--base <ref>` when git diff comparison should be included.

`scripts/check-baseline-state.mjs` checks Baseline State Reports so no-code/new-project baselines are not marked confirmed without evidence or human-confirmed source. Use `--report <file>` for a specific report.

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
- `launch-readiness-report`
- `conversation-turn-classification`
- `scope-change-report`
- `adoption-trial-report`
- `real-adoption-trial-report`
- `patch-classification`
- `patch-classification-false-positive`
- `active-work-thread`
- `guided-decision-summary`
- `change-boundary-report`
- `baseline-state-report`

Use `active-work-thread` only when broad conversation, side ideas, or repeated drift make the current mainline unclear. Use `guided-decision-summary` when Codex needs to recommend one safe path and translate technical choices into a human-owned decision.

Use `change-boundary-report` when actual changed files need to be checked against intended scope. Use `baseline-state-report` when Codex drafts or reviews baselines before real project evidence exists.

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
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/check-guided-adoption.mjs .
node scripts/check-platform-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-pack.mjs .
```

## Dev-Kit Only Scripts

These are primarily for maintaining this repository:

- `scripts/check-dev-kit.mjs`
- `scripts/check-fixtures.mjs`
- `scripts/check-manifest.mjs`
- `scripts/check-product-baseline.mjs`
- `scripts/check-claim-control.mjs`
- `scripts/check-context-governance.mjs`
- `scripts/check-launch-readiness.mjs`
- `scripts/check-conversation-drift.mjs`
- `scripts/check-guided-delivery-loop.mjs`
- `scripts/check-real-adoption-trial.mjs`
- `scripts/check-patch-classification.mjs`
- `scripts/check-change-boundary.mjs`
- `scripts/check-baseline-state.mjs`
- `scripts/check-glossary-usage.mjs`
- `scripts/score-output-quality.mjs`

Target projects normally do not need to run dev-kit-only checks.
