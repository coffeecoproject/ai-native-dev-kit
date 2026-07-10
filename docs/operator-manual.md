# Operator Manual

This manual explains how to operate the IntentOS after the first three-minute README entry.

Use this document when you need the full route for Codex, CI, migration, review, and project adoption decisions.

## Operating Model

The kit separates five concerns:

| Layer | Purpose |
|---|---|
| Workflow | Request, preflight, spec, eval, task, verification, review, report |
| Project onboarding | Project profile, technology strategy, business spec index, risk and verification docs |
| Engineering/environment baseline | Project-specific coding rules, runtime facts, command ownership, secret boundary, release and rollback decisions |
| Platform profile | Web, iOS, Android, WeChat Mini Program, backend, internal admin, or high-risk change |
| Standard baseline packs | Ordinary engineering guardrails by platform, capability, and release need |
| Industrial baseline | BL0, BL1, BL2, and selected industrial overlays |
| Product/claim baseline | Product boundary, evidence wording, and assumption visibility |
| Product surface | CLI, manifest, migration plans, fixtures, checks, release evidence |

Codex may draft and execute. Humans keep responsibility for decisions, risk acceptance, release approval, and business tradeoffs.

## Entry Rule

The public entry is the read-only Operating Model:

```bash
node scripts/cli.mjs work <project> "<plain-language goal>"
```

It derives Project Entry, the current operation, Evidence Trace, and Authority
Recommendation. It does not replace or authorize the lower-level source
systems. Use `--help-advanced` only for maintainer diagnosis and direct evidence
work.

When a user gives a plain project goal in conversation, treat it as Conversation-Native Ask unless the user clearly says they only want to discuss, review, compare, inspect, pause, or stop.

The user should not need to know the command name before Codex can route the work:

```text
我想做一个预约 App，你帮我开始。
```

For durable user-facing evidence, use the same Operating Model:

```bash
node scripts/cli.mjs work <project> "<goal>"
```

Conversation-Native Ask is routing only. It does not authorize writes, apply, implementation, release, production, CI, hooks, document cleanup, task-state changes, baseline activation, or high-risk decisions.

The Operating Model reads project state before any write is considered:

```bash
node scripts/cli.mjs work <project> "<goal>"
```

Maintainers may use `start` or `next` from `--help-advanced` to inspect the
lower-level project-state source. They do not replace the public entry.

Decision-heavy output must start with `Human Decision Summary`. The user should see one recommended choice, alternatives, whether each choice writes project files, the risk, and what happens if they do nothing before any technical fields.

For broad or non-expert requests, add Guided Decision & Delivery Loop behavior: recommend the smallest safe path, explain what is out of scope, ask for one user-owned confirmation, and park side ideas instead of executing them.

When Active Work Thread or Guided Decision Summary artifacts exist, check that they did not turn side ideas or D3/D4 choices into implementation approval:

```bash
node scripts/check-guided-delivery-loop.mjs <project>
```

After adoption classification, use baseline setup:

```bash
node scripts/cli.mjs baseline <project>
```

`baseline` is read-only by default. It recommends Engineering and Environment Baseline setup and must report `Can AI write now: No`. Writes require `baseline-project --write-plan` and reviewed `--apply-plan`.

When a Unified Apply Plan exists and the user asks whether it can be executed, do not treat the conversation as apply permission. Run Controlled Apply Readiness first:

```bash
node scripts/cli.mjs apply-readiness <project> --plan <apply-plan>
node scripts/cli.mjs apply-readiness-check <project>
```

Controlled Apply Readiness is still read-only. It can classify a plan as not ready, blocked, human-only, or a low-risk candidate for future human-approved apply. It does not write files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, archive files, change source of truth, enable industrial packs, or approve high-risk decisions.

When a human explicitly approves exact action IDs from a readiness-reviewed plan, record that approval separately:

```bash
node scripts/new-workflow-item.mjs --type approval-record --name <apply-scope>
node scripts/cli.mjs approval-record-check <project>
```

Approval Record Governance records who approved, which plan and hash were approved, exact action IDs, target paths, expiry, rollback acknowledgement, and verification acknowledgement. It still does not execute writes, authorize automatic apply, approve implementation, approve release/production, install hooks, modify CI, change source of truth, or enable high-risk actions.

For platform standard baseline recommendations:

```bash
node scripts/cli.mjs baseline-decision <project>
```

Use `baseline-decision` when the human needs the decision in plain language. It should summarize the recommended BL level, ordinary standard packs, optional industrial candidates, missing human confirmations, and safe next actions. It does not approve target-project writes, implementation, release, production, BL2 activation, or high-risk domain decisions.

`baseline-decision` prints only. Persist a record only after the human wants to keep the decision:

```bash
node scripts/new-workflow-item.mjs --type baseline-decision-card --name project-baseline-decision
node scripts/cli.mjs baseline-decision-check <project>
```

If the recommendation mentions BL2, phrase it as a candidate path for human review, not as an active selection.

For lower-level platform standard baseline recommendations:

```bash
node scripts/cli.mjs standard-baseline <project>
```

Recommend ordinary platform packs first. Keep backend and release packs conditional. Keep industrial overlays separate until risk and human confirmation require them. A standard baseline recommendation does not approve target-project writes or implementation.

If `workflow-next` returns `ADOPTION_MODE: READ_ONLY`, `RUN_ADOPTION_ASSESSMENT`, or `REVIEW_DIRTY_WORKTREE`, stop write actions and follow the matching playbook.

For governed or production-sensitive projects, record the first pass as a real adoption trial and classify future repair scale before implementation:

```bash
node scripts/new-workflow-item.mjs --type real-adoption-trial-report --name governed-project-readonly
node scripts/new-workflow-item.mjs --type patch-classification --name governed-project-repair-scale
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
```

`real-adoption` and `patch-classification` check recorded reports. They do not automatically scan a target project, create reports, write bridge files, or approve implementation. Use `docs/real-adoption-usage.md` to decide whether the project needs only a read-only report, a governance map, or patch classification.

These reports do not authorize target-project writes. They document the read-only boundary, bridge mode, public evidence status, and repair classification.

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

O0 / BL0 and L0/L1 tasks may use a lighter set of artifacts when the project policy allows it. Use `docs/o0-bl0-lightweight-path.md` for small local or prototype work, and `docs/artifact-lifecycle.md` to decide when heavier artifacts are actually needed. L2/L3 tasks require Review Packet and Review Loop Report.

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
- Recover before dispatch: close or skip stale helpers before opening another helper.
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

Patch Classification Governance runs before non-trivial repair proposals in governed projects. It decides whether the work is `SAFE_LOCAL_FIX`, `BASELINE_ALIGNED_HARDCUT`, `STRUCTURAL_REMEDIATION`, `NEEDS_HUMAN_DECISION`, or `DO_NOT_PATCH`. It is routing, not implementation approval.

Use Change Boundary after non-trivial edits, governed-project edits, dirty-worktree work, or any change where the human needs to judge whether Codex stayed inside scope:

```bash
node scripts/new-workflow-item.mjs --type change-boundary-report --name <task-scope>
node scripts/check-change-boundary.mjs <project> --report change-boundary-reports/<report>.md
```

Use Baseline State when baselines are drafted before code or evidence exists:

```bash
node scripts/new-workflow-item.mjs --type baseline-state-report --name <baseline-state>
node scripts/check-baseline-state.mjs <project> --report baseline-state-reports/<report>.md
```

Baseline State keeps proposed, pending-confirmation, evidence-required, and confirmed baselines separate. It does not make a drafted baseline implemented or production-ready.

## Baseline Setup

Use baseline setup after `start` and before non-trivial work.

```bash
node scripts/cli.mjs baseline <project>
node scripts/baseline-project.mjs <project> --write-plan baseline-recommendations/baseline-plan.json
node scripts/init-project.mjs --target <project> --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan <project>/apply-execution-plans/baseline.json
```

`baseline-project --write-plan` is proposal-only. Baseline writes use the
structured Approval Record and Controlled Apply Readiness path of the exact
init/update execution plan; direct baseline apply is retired.

Apply scope is limited to:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `baseline-recommendations/`
- `baseline-gap-reports/`

Do not use baseline setup to edit `.env`, CI/CD, deploy files, production config, AGENTS.md, PR templates, migrations, permissions, standard pack selections, or industrial packs.

## Product Baseline And Claim Control

Use this layer when changing workflow behavior, release wording, public summaries, final reports, handoffs, or IntentOS release evidence.

```bash
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
```

Rules:

- Reports are not approvals.
- Simulated dogfood is not production evidence.
- Draft packs are not stable packs.
- AI assumptions must be visible when they affect decisions or claims.
- Humans still approve risk, release, scope expansion, and future work.

## Project Memory And Context Governance

Use this layer when Codex observes context that may need to become project memory, when existing context appears stale, or when deciding which IntentOS artifacts should enter Git.

```bash
node scripts/check-context-governance.mjs .
```

Rules:

- Codex may draft learning candidates and context corrections.
- Humans confirm before project source of truth changes.
- Git-backed source of truth overrides model memory.
- Secrets, raw conversations, local caches, and unconfirmed assumptions must not become project facts.

## Safe Launch And Conversation Drift

Use Safe Launch when completed work needs a readiness answer:

```bash
node scripts/check-launch-readiness.mjs .
```

It separates `NOT_READY`, `READY_FOR_DEMO`, `READY_FOR_INTERNAL_HANDOFF`, `READY_FOR_RELEASE_REVIEW`, and `BLOCKED`. It does not approve production launch.

Use Conversation Drift Control when a user message may change the route of active work:

```bash
node scripts/check-conversation-drift.mjs .
```

Discussion-only, review-only, pause/stop, direct follow-up, scope change, new task, and risk decision turns must be routed before Codex continues.

## Migration

`intentos migrate` is plan-only in 0.42.0.

It can inspect a target and write a reviewable plan file. It cannot apply changes to the target project.

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

See `docs/migrations/0.33-to-1.0.md`.

## Evidence

For intentos changes, record:

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

For intentos development:

```bash
node scripts/check-manifest.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
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
