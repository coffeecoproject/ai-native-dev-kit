# Codex Usage

Use this guide when Codex is the main implementation agent.

## Operating Model

Codex should do four things:

1. Classify the human goal before choosing a path.
2. Turn conversation into workflow artifacts.
3. Execute one approved task card at a time.
4. Run verification and report evidence.
5. Propose workflow improvements without applying governance changes automatically.

Humans decide:

- project onboarding acceptance
- project-wide engineering conventions
- task priority and task level
- high-risk approval
- technology strategy
- release readiness
- active Skill or automation creation

## Bootstrap Prompt

Use this when you want Codex to configure a new, existing, or already bootstrapped project without hand-running the steps yourself:

```text
Read this AI Native Dev Kit and configure the current project yourself.
Detect whether this is a new project, existing project, or already bootstrapped project.
Do not modify business code during bootstrap.
Stop for any migration report that needs my approval.
```

Expected Codex behavior:

- Classify intent with `prompts/bootstrap-agent.md`.
- If the user asked only to review, discuss, evaluate, or look first, do not write files.
- If the user clearly asked to configure, run `scripts/start-project.mjs <project-root>` or `scripts/cli.mjs start <project-root>` first.
- Treat `start` as read-only by default: it recommends adoption path and decisions, but does not write target project files.
- After `start`, use `scripts/cli.mjs baseline <project-root>` when the project needs Engineering and Environment Baseline recommendations.
- Treat `baseline` as read-only by default: it must include `Can AI write now: No`.
- Use `scripts/baseline-project.mjs <project-root> --write-plan <file>` and reviewed `--apply-plan <file>` before writing baseline docs.
- Use `scripts/workflow-next.mjs <project-root>` as the lower-level technical state detector when needed.
- Report `workflow-next` results with `Human Decision Summary` first, then human summary, then technical state fields. The decision summary must include the recommended option, alternatives, whether each option writes files, risk, and what happens if the human does nothing. Use `--format technical` only when the user or automation asks for raw technical output.
- If `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, do not run setup commands or write files. Produce a real adoption report, existing governance map, and patch classification first.
- If `workflow-next` reports `NEXT_ACTION: REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, do not create workflow artifacts, execute task cards, or edit files until the human confirms how to handle existing changes.
- When the user is non-expert or the request is broad, use Guided Decision & Delivery Loop. Recommend the smallest safe path before asking for confirmation, keep one current mainline, park side ideas, and avoid raw technical questions such as enum-vs-lookup unless they are translated into product choices.
- Follow `NEXT_ACTION`.
- Use `init-project.mjs` for initialization or workflow asset updates.
- Summarize `.ai-native/migration-reports/` and stop before applying `AGENTS.md` or PR template migrations.
- Run baseline checks after setup when scripts are available.
- Run `node scripts/check-product-baseline.mjs .` and `node scripts/check-claim-control.mjs .` when workflow behavior, release wording, README/public summaries, final reports, or handoffs change.
- Run `node scripts/check-context-governance.mjs .` when learning candidates, context corrections, Git boundary reports, baselines, AGENTS, or project source-of-truth docs change.
- Run `node scripts/check-launch-readiness.mjs .` when a task claims demo, internal handoff, release-review, blocked, or not-ready status.
- Run `node scripts/check-conversation-drift.mjs .` when a user message may be discussion-only, review-only, a scope change, a new task, a direct follow-up, a risk decision, or a pause/stop request.
- Run `node scripts/check-guided-delivery-loop.mjs .` when Active Work Thread or Guided Decision Summary artifacts exist.
- Run `node scripts/check-first-delivery-walkthrough.mjs .` when a broad idea is recorded as a first delivery walkthrough or adoption trial.
- Run `node scripts/check-real-adoption-trial.mjs .` when a real governed or production-sensitive project is recorded as a read-only adoption trial.
- Run `node scripts/check-patch-classification.mjs .` before proposing or applying a non-trivial fix in a governed project.
- Run `node scripts/check-change-boundary.mjs . --report <report>` after non-trivial edits, governed-project edits, dirty-worktree work, or any task where changed files need to be proven against intended scope.
- Run `node scripts/check-baseline-state.mjs . --report <report>` when baseline docs are drafted or reviewed before implementation/evidence exists.
- Remember that `real-adoption` and `patch-classification` check recorded artifacts. They do not automatically generate target-project reports or approve implementation.
- Record inferred or unconfirmed facts in an Assumption Register when they affect decisions, claims, release, environment, rollback, monitoring, or risk.
- Use `.ai-native/prompts/goal-planner-agent.md` and create a Goal Card when the next goal is broad, ambiguous, high-risk, or can route into more than one workflow.

Optional project-state gate:

```bash
node scripts/start-project.mjs .
node scripts/workflow-next.mjs . --enforce
```

## New Project Prompt

```text
Use this repo's AI Native workflow.
First run project onboarding.
Draft the required project docs from our conversation.
Do not implement code until I approve the first request/spec/eval/task chain.
```

Expected Codex behavior:

- Read `AGENTS.md`.
- Use `.ai-native/prompts/bootstrap-agent.md` if the project setup state is unclear.
- Run `node scripts/workflow-next.mjs .` after initialization.
- Use `node scripts/check-ai-workflow.mjs . --mode core` for routine project checks. Use `--mode full` only after installing or updating the complete workflow asset set.
- Use `.ai-native/prompts/project-onboarding-agent.md`.
- Draft `docs/project-onboarding.md`, `docs/project-profile.md`, `docs/tech-stack-strategy.md`, `docs/business-spec-index.md`, `docs/sample-policy.md`, and `docs/onboarding-decisions.md`.
- Draft `docs/engineering-baseline.md` before structural, contract, schema, permission, migration, dependency, generated type, or cross-module state decisions.
- Run `node scripts/check-engineering-baseline.mjs .`; default mode is advisory and reports pending decisions without blocking low-risk local work.
- Draft `docs/environment-baseline.md` before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert decisions.
- Run `node scripts/check-environment-baseline.mjs .`; default mode is advisory and fails obvious secret misuse.
- Run `node scripts/check-baseline-enforcement.mjs . --mode ready` before implementation when task cards exist.
- Draft `Selected Profiles` in `docs/project-profile.md` and run `node scripts/check-platform-baseline.mjs .`.
- Use `node scripts/resolve-platform-baseline.mjs .` when the effective platform baseline needs to be reviewed.
- For standard baseline decisions, run `node scripts/cli.mjs standard-baseline .` first and create a Standard Baseline Selection Report when the recommendation affects the task.
- Use `node scripts/cli.mjs baseline-packs .` for the umbrella read-only view: standard packs first, optional industrial overlays second.
- For BL2 industrial work, read `industrial-packs/selection-guide.md`, recommend selected industrial overlays, wait for human confirmation of BL2 and draft pack acceptance, install only selected packs with `init-project --industrial-packs <pack-id>`, draft `docs/baseline-selection.md` / `docs/baseline-evidence.md`, then run `node scripts/check-standard-baseline-selection.mjs .`, `node scripts/check-baseline-pack-selection.mjs .`, `node scripts/check-industrial-pack.mjs . --selected-only`, and `node scripts/check-industrial-baseline.mjs . --bl2-only`.
- Ask for human decisions only where the workflow requires confirmation.

## Goal Mode Prompt

Use this when the next user request is broad, ambiguous, high-risk, or could mean discussion, setup, definition, implementation, review, repair, decision, or report:

```text
Classify this request with Goal Mode first.
Create a Goal Card only if a durable route record is useful.
Do not treat the Goal Card as permission to implement.
```

Expected Codex behavior:

- Read `.ai-native/core/goal-mode.md`.
- Use `.ai-native/prompts/goal-planner-agent.md` when present.
- Choose one mode: `DISCUSS_ONLY`, `ADOPT_PROJECT`, `DEFINE_WORK`, `IMPLEMENT_TASK`, `REVIEW_TASK`, `REPAIR_TASK`, `BASELINE_DECISION`, or `HANDOFF_OR_REPORT`.
- Generate `node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>` when route evidence is useful.
- Run `node scripts/check-goal-mode.mjs .` when Goal Cards exist.
- Continue only through the artifacts and approvals required by the selected mode.
- Do not let Goal Mode bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.

## Subagent Prompt

Use this only when Codex will use helper agents for planning, read-only research, review, repair analysis, or reporting:

```text
Use Subagent Orchestration for this helper-agent run.
Keep many readers, one writer.
Close or skip every subagent after handoff.
Do not leave helper agents occupying slots after their output is consumed.
```

Expected Codex behavior:

- Read `.ai-native/core/subagent-orchestration.md`.
- Generate `node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>` when helper-agent usage is non-trivial or needs a durable record.
- Record each subagent role, authority, status, write scope, close condition, and closure evidence.
- Treat subagent output as input, not authority.
- Keep the main thread responsible for writes, verification, and final reporting.
- Close or skip every subagent after handoff.
- Run `node scripts/check-subagent-orchestration.mjs .` before final response, commit, or task closure when Subagent Run Plans exist.
- Do not use helper agents to resolve `NEEDS_HUMAN_DECISION`, approve risk, approve release, create automations, call external GPT/API reviewers, or bypass Review Loop boundaries.

## Task Prompt

```text
Use task tasks/001-first-slice.md.
Check request/spec/eval alignment first.
Run the required verification.
Stop if the scope, risk gate, or acceptance criteria are unclear.
```

Expected Codex behavior:

- Read the linked request, preflight, spec, eval, and task card.
- Run `node scripts/check-workflow-artifacts.mjs . --mode ready --task <task-card>` before implementation.
- Run `node scripts/check-engineering-baseline.mjs .` before implementation when the task touches structure, API contracts, DTO / schema / domain boundaries, enum / string / lookup / state-machine choices, schema or migrations, permission model, generated type source, dependencies, or cross-module state.
- Run `node scripts/check-environment-baseline.mjs .` before implementation when the task touches build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts.
- Run `node scripts/check-baseline-enforcement.mjs . --mode ready --task <task-card>` before implementation when the task declares or appears to touch baselines.
- For high-risk work, run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` after human approval is recorded.
- For checked risk items, `Human Approval` must include the approved `Approval scope`.
- Refuse to widen scope without approval.
- Do not create or upgrade project-wide engineering conventions without a documented source of truth or human approval.
- Request explicit approval before high-risk code changes.
- Generate `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when the change needs independent human, GPT Pro, or second-model review.
- Generate `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need automatic-fix and re-review tracking.
- Generate `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet.
- Generate `node scripts/new-workflow-item.mjs --type subagent-run-plan --task <task-card>` when helper agents are used; close or skip every subagent after handoff.
- Generate `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>` when a suggested next step is directly related but outside current task scope.
- Generate `node scripts/new-workflow-item.mjs --type final-report --task <task-card>` when the task result needs durable reporting beyond chat.
- Run `node scripts/check-review-loop.mjs . --task <task-card>` when a Review Loop Report exists.
- Run `node scripts/check-baseline-enforcement.mjs . --mode implementation --task <task-card>` before closure for BL1 implementation work, BL2 work, or L3 tasks.
- Run `node scripts/check-subagent-orchestration.mjs .` when Subagent Run Plans exist.
- Run `node scripts/check-next-step-boundary.mjs . --task <task-card>` when a Final Report, Review Loop Report, review summary, or Follow-up Proposal includes next-step suggestions.
- Generate `node scripts/new-workflow-item.mjs --type change-boundary-report --task <task-card>` when the final result needs proof that actual changed files stayed inside approved scope.
- Generate `node scripts/new-workflow-item.mjs --type baseline-state-report --task <task-card>` when the task drafts or changes baseline recommendations without implementation evidence.
- Run `node scripts/check-change-boundary.mjs . --report <change-boundary-report>` when a Change Boundary Report exists.
- Run `node scripts/check-baseline-state.mjs . --report <baseline-state-report>` when a Baseline State Report exists.
- Auto-fix only deterministic, low-risk findings inside approved task scope, for at most 2 rounds.
- Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to the human.
- Route missing engineering baseline decisions to a Decision Brief or Human Decisions Needed instead of silently choosing.
- Route missing environment baseline decisions to a Decision Brief or Human Decisions Needed instead of inventing environment facts.
- Do not treat reports, Review Packets, Goal Cards, or subagent output as release, risk, scope, or future-work approval.
- Do not describe simulated dogfood, generated-project smoke, or draft packs as production evidence.
- Report changed files, verification, residual risks, classified Next-Step Suggestions, Human Decisions Needed, and Next Safe Action.
- Do not claim a no-code/new-project baseline is confirmed, implemented, verified, or production-ready without evidence or a human-confirmed source.

GPT Pro or second-model review should stay semi-automatic unless an approved automation adapter exists:

1. Codex generates a Review Packet.
2. Codex generates a GPT Review Prompt paired with that packet.
3. The human copies the packet and prompt to GPT Pro or another reviewer.
4. The human pastes reviewer findings back to Codex.
5. Codex records findings in the Review Loop Report.
6. Codex fixes only `AUTO_FIX` items that stay inside the approved task scope.
7. Codex routes `NEEDS_HUMAN_DECISION` items to the human and stops before implementing them.

## Output Prompt

Use this when Codex needs to explain workflow state, baseline readiness, adoption results, review loop results, or handoff status to a human:

```text
Summarize this using the AI Native Output Experience Protocol.
Start with Human Decision Summary: recommended option, alternatives, whether each option writes files, risk, whether AI can continue, what I need to decide, and what happens if I do nothing.
Keep technical fields and audit notes after the human summary.
```

Expected Codex behavior:

- Read `.ai-native/core/output-protocol.md`.
- Use `.ai-native/core/glossary.md` when internal terms need plain-language explanation.
- Use `.ai-native/core/next-step-boundary.md` when reporting suggested next steps.
- Use `.ai-native/core/product-baseline.md`, `.ai-native/core/claim-control.md`, and `.ai-native/core/assumption-register.md` when reporting release wording, public claims, final reports, or handoffs.
- Use `.ai-native/core/context-governance.md` and `.ai-native/core/git-boundary.md` when deciding whether an observation should become project memory or enter Git.
- Use `.ai-native/core/safe-launch.md` before claiming delivery readiness.
- Use `.ai-native/core/conversation-drift-control.md` before acting on a user message that might change scope or risk.
- Use `.ai-native/core/real-project-adoption-trial.md` before writing to a real governed or production-sensitive project.
- Use `.ai-native/core/patch-classification.md` before treating a non-trivial failure as a local patch.
- Use `.ai-native/prompts/reporter-agent.md` when converting technical state into a report.
- Generate `human-status-report`, `decision-brief`, `plain-review-summary`, or `customer-handoff` only when a file record is useful.
- Do not treat any report as Human Approval, release approval, risk acceptance, or permission to apply migrations.
- Include Assumption Register when the report relies on inferred or unconfirmed facts.

## Existing Project Prompt

```text
Inject the AI Native workflow into this existing project.
Use update-workflow-assets only.
Do not overwrite existing project docs, specs, tasks, logs, or business code.
After that, run the baseline checks and tell me what decisions remain.
```

Expected Codex command:

```bash
node ai-native-dev-kit/scripts/workflow-next.mjs .
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets --backup-dir .ai-native/backups/first-adoption --write-plan /tmp/ai-native-update-plan.json
node ai-native-dev-kit/scripts/init-project.mjs --apply-plan /tmp/ai-native-update-plan.json
```

For governed, production-sensitive, or dirty projects, the first command may return:

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
```

When that happens, Codex must not run `init-project`. It should use `templates/adoption-assessment.md` and `templates/existing-governance-map.md` to explain how AI Native concepts map to existing project governance, then wait for approval before adapter setup.

For an already bootstrapped low-risk project, Codex may run direct update:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets
```

For a strong governed project that is already bootstrapped, `workflow-next` may instead return:

```text
ADOPTION_MODE: GUARDED
NEXT_ACTION: REVIEW_DIRTY_WORKTREE
```

When that happens, Codex should summarize the dirty worktree state and ask the human whether to continue, split, stash, commit, or generate a Review Packet before task execution.

If `.ai-native/migration-reports/agents-governance.md` is created, Codex should summarize it and wait for human approval before applying the AGENTS.md governance appendix:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets --apply-agent-governance
```

If `.ai-native/migration-reports/pr-template-governance.md` is created, Codex should summarize it and wait for human approval before applying the PR template governance appendix:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets --apply-pr-template-governance
```

## Daily Summary Prompt

```text
Run the workflow daily summary for this project.
If there is no new evidence, report NO_ACTION.
If there is a signal, summarize the decision needed.
Do not create Skills, automations, or dev-kit changes without approval.
```

Expected Codex command:

```bash
node scripts/workflow-daily-summary.mjs .
```

## Stop Rules

Codex should stop and report when:

- the task card is missing or contradictory
- the requested implementation exceeds approved scope
- high-risk changes need human approval
- an `AGENTS.md` or PR template migration report needs approval
- production secrets, data, or config are required
- `workflow-next` reports `REVIEW_DIRTY_WORKTREE`
- the same verification failure repeats
- a workflow change would create or enable an active Skill or automation

## Platform Notes

For web, iOS, Android, backend, internal admin, or high-risk projects, choose the matching project profile and starter. The core workflow stays the same; platform-specific rules live in profiles, starter docs, and `AGENTS.md`.

Standard baseline packs are ordinary engineering guardrails. Use `resolve-standard-baseline.mjs` first. Industrial packs are BL2 governance overlays. They should be recommended for production, customer delivery, long-lived, regulated, or high-risk projects, but they must not be silently treated as accepted without human confirmation. Use `resolve-baseline-packs.mjs` only when lower-level industrial pack evidence is needed, `resolve-industrial-baseline.mjs` to inspect selected packs, and `check-industrial-baseline.mjs --strict` only after baseline level, exceptions, and residual risks are approved.
