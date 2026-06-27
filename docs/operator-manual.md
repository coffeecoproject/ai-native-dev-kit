# Operator Manual

This manual explains how to operate the AI Native Dev Kit after the first three-minute README entry.

Use this document when you need the full route for Codex, CI, migration, review, and project adoption decisions.

## Operating Model

The kit separates five concerns:

| Layer | Purpose |
|---|---|
| Workflow | Request, preflight, spec, eval, task, verification, review, report |
| Project onboarding | Project profile, technology strategy, business spec index, risk and verification docs |
| Engineering/environment baseline | Project-specific coding rules, runtime facts, command ownership, secret boundary, release and rollback decisions |
| Platform profile | Web, iOS, Android, WeChat Mini Program, backend, internal admin, or high-risk change |
| Industrial baseline | BL0, BL1, BL2, and selected industrial packs |
| Product/claim baseline | Product boundary, evidence wording, and assumption visibility |
| Product surface | CLI, manifest, migration plans, fixtures, checks, release evidence |

Codex may draft and execute. Humans keep responsibility for decisions, risk acceptance, release approval, and business tradeoffs.

## Entry Rule

Always start by reading project state before writing files:

```bash
node scripts/cli.mjs start <project>
```

`start` is read-only by default. It classifies the project, recommends the adoption path, and lists human decisions. Use `node scripts/cli.mjs next <project>` only when you need the lower-level `workflow-next` state.

After adoption classification, use baseline setup:

```bash
node scripts/cli.mjs baseline <project>
```

`baseline` is read-only by default. It recommends Engineering and Environment Baseline setup and must report `Can AI write now: No`. Writes require `baseline-project --write-plan` and reviewed `--apply-plan`.

If `workflow-next` returns `ADOPTION_MODE: READ_ONLY`, `RUN_ADOPTION_ASSESSMENT`, or `REVIEW_DIRTY_WORKTREE`, stop write actions and follow the matching playbook.

## Adoption Paths

| Path | Use when | Start here |
|---|---|---|
| New project | The target has little or no existing governance | `docs/adoption-playbooks/new-project.md` |
| Existing light project | The project exists but has no strong release, CI, or guardrails | `docs/adoption-playbooks/existing-light-project.md` |
| Governed read-only project | The project already has agent instructions, CI, guards, baselines, or evidence | `docs/adoption-playbooks/governed-project-read-only.md` |
| Production adapter | The project is live, customer-facing, regulated, or release-sensitive | `docs/adoption-playbooks/production-project-adapter.md` |

## Task Loop

Use the smallest loop that fits the risk:

```text
Request -> Preflight -> Engineering/Environment Baseline -> Spec -> Eval -> Task -> Verify -> Review -> Final Report
```

L0/L1 tasks may use a lighter set of artifacts when the project policy allows it. L2/L3 tasks require Review Packet and Review Loop Report.

## Goal Mode

Goal Mode chooses the route before work starts. It does not approve implementation or risk.

Common modes:

- `DISCUSS_ONLY`
- `ADOPT_PROJECT`
- `DEFINE_WORK`
- `IMPLEMENT_TASK`
- `REVIEW_TASK`
- `REPAIR_TASK`
- `BASELINE_DECISION`
- `HANDOFF_OR_REPORT`

When a durable route is needed, create a Goal Card:

```bash
node scripts/new-workflow-item.mjs --type goal-card --name <slug> --goal-mode IMPLEMENT_TASK
node scripts/check-goal-mode.mjs .
```

## Subagent Orchestration

Use subagent planning only when helper agents are actually used or when an L3 phase requires explicit orchestration evidence.

Rules:

- Many readers, one writer.
- Reviewer agents stay read-only.
- Every helper must end as `CLOSED` or `SKIPPED`.
- No helper agent may remain `RUNNING` before final response, commit, or handoff.

Check:

```bash
node scripts/check-subagent-orchestration.mjs .
```

## Review Loop

Review Loop runs at task completion, not after every tiny edit.

Use it for:

- L2/L3 work
- production-sensitive changes
- permission, migration, payment, release, or data-risk changes
- tasks where an independent reviewer or GPT Pro review is needed

The usual artifacts are:

- `review-packets/`
- `gpt-review-prompts/`
- `review-loop-reports/`
- `review-summaries/`

AUTO_FIX is bounded. Repeated findings, risk decisions, architecture scope changes, production configuration, and external side effects need human decision.

## Baseline Setup

Use baseline setup after `start` and before non-trivial work.

```bash
node scripts/cli.mjs baseline <project>
node scripts/baseline-project.mjs <project> --write-plan baseline-plan.json
node scripts/baseline-project.mjs --apply-plan baseline-plan.json
```

Apply scope is limited to:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `baseline-recommendations/`
- `baseline-gap-reports/`

Do not use baseline setup to edit `.env`, CI/CD, deploy files, production config, AGENTS.md, PR templates, migrations, permissions, or industrial packs.

## Product Baseline And Claim Control

Use this layer when changing workflow behavior, release wording, public summaries, final reports, handoffs, or Dev Kit release evidence.

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
```

Rules:

- Reports are not approvals.
- Simulated dogfood is not production evidence.
- Draft packs are not stable packs.
- AI assumptions must be visible when they affect decisions or claims.
- Humans still approve risk, release, scope expansion, and future work.

## Migration

`ai-native migrate` is plan-only in 0.42.0.

It can inspect a target and write a reviewable plan file. It cannot apply changes to the target project.

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

See `docs/migrations/0.33-to-1.0.md`.

## Evidence

For dev-kit changes, record:

- request
- preflight
- spec
- eval
- task
- review packet
- review loop report
- final report
- release phase report

For generated or adopted projects, record only the artifacts required by the project risk level.

## Standard Checks

For dev-kit development:

```bash
node scripts/check-manifest.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

For target projects:

```bash
node scripts/check-ai-workflow.mjs . --mode core
node scripts/workflow-next.mjs .
node scripts/check-workflow-version.mjs .
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
```

Use full checks only when the project has the matching assets and risk level.

## Stop Conditions

Stop and ask for a human decision when:

- the project is production, dirty, or governed and no adoption decision exists
- a risk gate item is checked but approval scope is missing
- Codex needs to change permissions, payment, secrets, deployment, production config, or data migration behavior
- migration would require direct target writes
- a reviewer finding is `NEEDS_HUMAN_DECISION`
- the same deterministic fix fails twice
