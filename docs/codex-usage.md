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

## New Project Prompt

```text
Use this repo's AI Native workflow.
First run project onboarding.
Draft the required project docs from our conversation.
Do not implement code until I approve the first request/spec/eval/task chain.
```

Expected Codex behavior:

- Read `AGENTS.md`.
- Use `.ai-native/prompts/project-onboarding-agent.md`.
- Draft `docs/project-onboarding.md`, `docs/project-profile.md`, `docs/tech-stack-strategy.md`, `docs/business-spec-index.md`, `docs/sample-policy.md`, and `docs/onboarding-decisions.md`.
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
node ai-native-dev-kit/scripts/init-project.mjs --target . --update-workflow-assets
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
- production secrets, data, or config are required
- the same verification failure repeats
- a workflow change would create or enable an active Skill or automation

## Platform Notes

For web, iOS, Android, backend, internal admin, or high-risk projects, choose the matching project profile and starter. The core workflow stays the same; platform-specific rules live in profiles, starter docs, and `AGENTS.md`.
