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
| `check-context-governance.mjs` | Learning candidates, context corrections, Git boundary reports, and source-of-truth boundaries |
| `check-launch-readiness.mjs` | Launch readiness reports, evidence, human decisions, and overclaims |
| `check-conversation-drift.mjs` | Conversation turn classification and scope-change routing |
| `check-guided-delivery-loop.mjs` | Active work thread, parking lot, and guided decision boundaries |
| `check-first-delivery-walkthrough.mjs` | First Delivery Walkthrough and Adoption Trial evidence |
| `check-real-adoption-trial.mjs` | Real-project read-only adoption trial reports, bridge boundaries, and public evidence status |
| `check-patch-classification.mjs` | Repair-scale classification and false-positive calibration before non-trivial fixes |
| `check-change-boundary.mjs` | Intended scope, allowed paths, forbidden paths, actual changed files, and claim boundary |
| `check-baseline-state.mjs` | Baseline state claims for proposed, pending, evidence-required, and confirmed baselines |
| `resolve-standard-baseline.mjs` | Read-only standard baseline recommendation with optional industrial overlays |
| `check-standard-baseline-pack.mjs` | Standard baseline pack registry and draft overclaim checks |
| `check-standard-baseline-selection.mjs` | Standard baseline selection report boundaries and consistency checks |
| `resolve-baseline-packs.mjs` | Deprecated lower-level read-only industrial-oriented recommendation for exact evidence; prefer `node scripts/cli.mjs baseline-packs <project>` for human usage |
| `check-baseline-pack-selection.mjs` | Baseline pack selection report boundaries and overclaim checks |
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
- `check-context-governance.mjs` is candidate/audit focused; it does not approve project facts or require learning candidates for every task.
- `check-launch-readiness.mjs` allows empty projects, but rejects ready states without verification, reports with pending human decisions, and production-safety overclaims.
- `check-conversation-drift.mjs` allows empty projects, but rejects discussion-only writes, scope changes without human decision, and risk decisions that auto-continue.
- `check-first-delivery-walkthrough.mjs` allows empty projects, but rejects walkthrough reports missing final report or launch readiness references, simulated evidence overclaims, and unclosed subagents.
- `check-real-adoption-trial.mjs` allows empty projects, but rejects real adoption reports with target writes, missing read-only evidence, unsafe bridge claims, local-only public naming, overclaims, secret-like content, or unclosed subagents.
- `check-patch-classification.mjs` allows empty projects, but rejects unsafe `SAFE_LOCAL_FIX` classification on high-risk surfaces, patch reports that authorize implementation, missing evidence, completed `DO_NOT_PATCH` reports, and false-positive records that accept real high-risk impact as safe.
- False-positive records are calibration evidence only. They do not modify the original patch classification report; changing repair scale still needs a new patch classification report or an explicit human decision.
- `check-guided-delivery-loop.mjs` allows empty projects, but rejects parking-lot items that are approved/executable now, D3/D4 summaries that claim implementation approval, and summaries missing human choice or next safe action.
- `check-change-boundary.mjs` allows empty projects, but rejects reports where forbidden paths changed, actual files sit outside allowed paths, forbidden change types appear, or a report claims PASS while any changed file is outside boundary.
- `check-baseline-state.mjs` allows empty projects, but rejects no-code/new-project baselines marked `CONFIRMED` without evidence or human-confirmed source, and rejects implementation permission that claims approved writes without evidence.
- `check-standard-baseline-pack.mjs` rejects standard packs that use `defaultForBL`, include unknown metadata fields, drift between `index.json` and `pack.json`, are active by default, miss required baseline/checklist/template content, claim production readiness, authorize writes, implementation, release, compliance, security, or privacy, or turn environment guidance into `.env` writes, secret values, invented deployment facts, or CI/CD approval claims.
- `check-standard-baseline-selection.mjs` allows empty projects, but rejects reports that mix industrial overlays into standard packs, use unknown profile or pack IDs, select every known standard pack, force backend without evidence, recommend release/rollback without evidence, use overwrite language for governed existing projects, claim write or implementation approval, claim release/production approval, or treat selection as evidence. `--compare-resolver` checks recorded recommendations against resolver output.
- `check-baseline-pack-selection.mjs` allows empty projects, but rejects reports that select all packs by default, treat BL2 as universal default, treat draft packs as stable, claim pack files prove real project evidence, or authorize writes, implementation, release, or production.

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
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-standard-baseline.mjs .
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
```

For L2/L3 task completion:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-baseline-enforcement.mjs . --mode implementation --task tasks/<task>.md
node scripts/check-review-loop.mjs . --task tasks/<task>.md
node scripts/check-next-step-boundary.mjs . --task tasks/<task>.md
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
```

For dev-kit changes:

```bash
node scripts/check-manifest.mjs .
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
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
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
