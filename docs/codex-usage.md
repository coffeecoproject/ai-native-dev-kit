# Codex Usage

Use this guide when Codex is the main implementation agent.

## Operating Model

Codex should do four things:

1. Turn conversation into workflow artifacts.
2. Execute one approved task card at a time.
3. Run verification and report evidence.
4. Propose workflow improvements without applying governance changes automatically.

Humans decide:

- project onboarding acceptance
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
- If the user clearly asked to configure, run `scripts/workflow-next.mjs <project-root>` or emulate it from the dev-kit checkout.
- Follow `NEXT_ACTION`.
- Use `init-project.mjs` for initialization or workflow asset updates.
- Summarize `.ai-native/migration-reports/` and stop before applying `AGENTS.md` or PR template migrations.
- Run baseline checks after setup when scripts are available.

Optional project-state gate:

```bash
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
- Draft `Selected Profiles` in `docs/project-profile.md` and run `node scripts/check-platform-baseline.mjs .`.
- Use `node scripts/resolve-platform-baseline.mjs .` when the effective platform baseline needs to be reviewed.
- For BL2 industrial work, read `industrial-packs/selection-guide.md`, recommend selected industrial packs, install them with `init-project --industrial-packs <pack-id>`, draft `docs/baseline-selection.md` / `docs/baseline-evidence.md`, then run `node scripts/check-industrial-pack.mjs . --selected-only` and `node scripts/check-industrial-baseline.mjs . --bl2-only`.
- Ask for human decisions only where the workflow requires confirmation.

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
- For high-risk work, run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` after human approval is recorded.
- For checked risk items, `Human Approval` must include the approved `Approval scope`.
- Refuse to widen scope without approval.
- Request explicit approval before high-risk code changes.
- Report changed files, verification, residual risks, and next step.

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
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets
```

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
- the same verification failure repeats
- a workflow change would create or enable an active Skill or automation

## Platform Notes

For web, iOS, Android, backend, internal admin, or high-risk projects, choose the matching project profile and starter. The core workflow stays the same; platform-specific rules live in profiles, starter docs, and `AGENTS.md`.

Industrial packs are BL2 governance assets. They should be recommended for production, customer delivery, long-lived, regulated, or high-risk projects, but they must not be silently treated as accepted without human confirmation. Use `resolve-industrial-baseline.mjs` to inspect selected packs and `check-industrial-baseline.mjs --strict` only after baseline level, exceptions, and residual risks are approved.
