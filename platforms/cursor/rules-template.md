# Cursor Rules Template

This project uses an AI-native, spec-first workflow.

## Core Rules

1. Do not implement vague requests directly.
2. Ask for or create a request card for large features.
3. Use preflight before coding for unclear, cross-module, or high-risk work.
4. Implement only one task card at a time.
5. Respect allowed and forbidden file scope.
6. Do not modify auth, permission, migration, production config, secrets, high-risk, or security-sensitive logic without explicit approval.
7. Add or update tests for behavior changes.
8. Run project verification before claiming completion.
9. Report what changed, tests run, remaining risks, classified next-step suggestions, and next safe action.

## Required Project Context

Before non-trivial work, read:

- `AGENTS.md`
- `.ai-native/core/project-onboarding.md`
- `.ai-native/core/workflow.md`
- the linked request, preflight, spec, eval, and task card when they exist
- project docs that define architecture, permissions, risks, and verification

## Bootstrap Entry

- When the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat that as execution bootstrap intent.
- Execution bootstrap intent may write workflow and governance assets only; do not modify business code during bootstrap.
- When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.
- For bootstrap work, use `.ai-native/prompts/bootstrap-agent.md` when present, then run `node scripts/start-project.mjs .`.
- After adoption classification, run `node scripts/cli.mjs baseline .` when engineering or environment rules are unclear.
- Treat `baseline` as read-only by default. It must report `Can AI write now: No`; writes require reviewed `baseline-project --write-plan` and `--apply-plan`.
- Use `workflow-next` as the lower-level state detector when needed.
- Follow `NEXT_ACTION` and stop for human approval before applying migration reports.
- If `workflow-next` reports `REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing tasks until the human confirms how to handle existing changes.

## Project Onboarding

- Before the first non-trivial implementation, run project onboarding.
- Use `.ai-native/prompts/project-onboarding-agent.md`.
- AI drafts project onboarding docs from conversation; humans confirm decisions.
- Do not ask the human to manually fill all onboarding files.
- Ask focused questions, propose options, record assumptions, and request confirmation.
- Run `node scripts/check-project-onboarding.mjs .` for baseline and `node scripts/check-project-onboarding.mjs . --strict` after decisions are confirmed.

## Engineering Baseline

- Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.ai-native/core/engineering-baseline.md` when present.
- Run `node scripts/check-engineering-baseline.mjs .` for advisory baseline status.
- Cursor may follow existing local patterns for low-risk local changes.
- Cursor must not create or upgrade project-wide engineering conventions without a documented project source of truth or human approval.
- If the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns.

## Environment Baseline

- Before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert changes, read `docs/environment-baseline.md` and `.ai-native/core/environment-baseline.md` when present.
- Run `node scripts/check-environment-baseline.mjs .` for advisory environment baseline status.
- Run `node scripts/check-baseline-enforcement.mjs . --mode ready` when task cards exist.
- Cursor may draft missing facts as `PENDING_CONFIRMATION` and irrelevant items as `NOT_APPLICABLE`.
- Cursor must not create or edit `.env`, record secret values, invent production/release/rollback/monitoring facts, or change CI/CD, deployment, or production config without explicit approval.

## Platform Baseline

- Select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`.
- Run `node scripts/check-platform-baseline.mjs .` before the first non-trivial implementation.
- Use `node scripts/resolve-platform-baseline.mjs .` when effective platform verification or risk requirements need review.
- Use strict mode only after humans confirm selected profiles and project docs.

## Industrial Baseline

- Baseline level is `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`; it is not task level.
- Run `node scripts/check-industrial-pack.mjs . --selected-only` to validate selected industrial pack assets.
- Run `node scripts/resolve-industrial-baseline.mjs .` and `node scripts/check-industrial-baseline.mjs . --bl2-only` to inspect project-level BL2 readiness when BL2 is selected.
- Read `.ai-native/industrial-packs/selection-guide.md` before recommending pack combinations.
- Do not treat BL2 or selected industrial packs as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and project-level industrial baseline status.

## Workflow Artifacts

- Use `node scripts/new-workflow-item.mjs` to create numbered workflow files.
- Use `node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.
- Use `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when a change needs independent human, GPT Pro, or second-model review.
- Use `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need closure.
- Use `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet.
- Use `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>` when a bounded suggestion is related but outside current task scope.
- Use `node scripts/new-workflow-item.mjs --type final-report --task <task-card>` when the result needs a durable final report.
- Run `node scripts/check-review-loop.mjs . --task <task-card>` when a Review Loop Report exists.
- Run `node scripts/check-goal-mode.mjs .` when Goal Cards exist.
- Run `node scripts/check-subagent-orchestration.mjs .` when Subagent Run Plans exist.
- Run `node scripts/check-next-step-boundary.mjs . --task <task-card>` when next-step suggestions are recorded.
- Run `node scripts/check-workflow-artifacts.mjs . --mode ready` before implementation when request/spec/eval/task files exist.
- Run `node scripts/check-baseline-enforcement.mjs . --mode ready --task <task-card>` before implementation when baselines are touched.
- Run `node scripts/check-baseline-enforcement.mjs . --mode implementation --task <task-card>` before closure for BL1 implementation work, BL2 work, or L3 tasks.
- Run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` for high-risk implementation after human approval is recorded.
- If any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation.
- Fix placeholder or missing artifact content before writing code.
- AUTO_FIX is limited to deterministic, low-risk findings inside approved task scope, for at most 2 rounds.
- Route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to the human.
- Route missing engineering or environment baseline decisions to a Decision Brief or Human Decisions Needed instead of silently choosing.

## Goal Mode

- Use `.ai-native/core/goal-mode.md` and `.ai-native/prompts/goal-planner-agent.md` before creating artifacts or writing code when the route is unclear.
- Select one of `DISCUSS_ONLY`, `ADOPT_PROJECT`, `DEFINE_WORK`, `IMPLEMENT_TASK`, `REVIEW_TASK`, `REPAIR_TASK`, `BASELINE_DECISION`, or `HANDOFF_OR_REPORT`.
- A Goal Card is route selection only. It is not permission to implement, approve risk, approve release, change Human Approval, or activate subagent orchestration.

## Subagent Orchestration

- Use `.ai-native/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting.
- Use `node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>` to record helper-agent roles, authority, handoff, and closure.
- Follow many readers, one writer. Subagent output is input, not authority.
- Close or skip every subagent after handoff.
- Do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot.
- Do not use helper agents to resolve `NEEDS_HUMAN_DECISION`, approve risk, approve release, create automations, call external GPT/API reviewers, or bypass Review Loop boundaries.

## Bounded Next-Step

- Use `.ai-native/core/next-step-boundary.md` before reporting suggestions, review follow-ups, or final next actions.
- Codex/Cursor may suggest next steps, but suggestions must be bounded, classified, and actionable.
- Use only `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`.
- Only `IN_SCOPE_NEXT_STEP` may be handled inside the current task when no new approval is needed.
- `DIRECT_FOLLOW_UP` requires a new request or `follow-up-proposal`.
- `RISK_DECISION` requires human decision and preflight before implementation.
- `OUT_OF_SCOPE_OBSERVATION` is context only.
- `DO_NOT_PROCEED` must not be implemented under current scope.

## Output Experience

- Use `.ai-native/core/output-protocol.md` and `.ai-native/prompts/reporter-agent.md` for workflow, baseline, adoption, review, release, and automation status.
- Human-facing output starts with a human summary, current status, decision needed, next safe step, what AI can do, and what AI must not do.
- Put technical fields, paths, commands, and audit notes after the plain-language status.
- Use `.ai-native/core/glossary.md` when internal terms need translation.

## Product Baseline And Claim Control

- Use `.ai-native/core/outcome-baseline.md`, `.ai-native/core/product-baseline.md`, `.ai-native/core/claim-control.md`, and `.ai-native/core/assumption-register.md` when workflow behavior, release wording, public summaries, reports, or handoffs change.
- Run `node scripts/check-product-baseline.mjs .`, `node scripts/check-claim-control.mjs .`, and `node scripts/check-context-governance.mjs .` when available.
- Do not treat reports, Review Packets, Goal Cards, or subagent output as approval.
- Do not describe simulated dogfood, generated-project smoke, or draft packs as production evidence.
- Record inferred or unconfirmed facts in an Assumption Register when they affect decisions, claims, release, environment, rollback, monitoring, or risk.

## Project Memory And Context Governance

- Use `.ai-native/core/context-governance.md` and `.ai-native/core/git-boundary.md` when observations may become project memory, context appears stale, or artifact Git boundary is unclear.
- Codex may draft Learning Candidates, Context Correction Reports, and Git Boundary Reports.
- Humans confirm before source-of-truth changes.
- Model memory must not override Git-backed source of truth.

## Skill Governance

- Repeated execution patterns may become `skill-candidates/` entries.
- Do not create, update, install, enable, or run an active Skill unless the user has explicitly approved it.
- Do not promote one-project behavior into shared workflow rules.
- Use `.ai-native/templates/skill-candidate.md` and `.ai-native/checklists/skill-review.md` for Skill proposals.

## Automation Governance

- Codex/Cursor may propose project-scoped automations, but must not create, update, resume, delete, or enable them without explicit human approval.
- Automation proposals belong in `automation-proposals/` and must use `.ai-native/templates/project-automation-proposal.md`.
- A valid automation approval must include exact project root, schedule, prompt, allowed writes, forbidden actions, and initial status.
- Do not attach automation to a parent directory unless the user explicitly approves a multi-project monitor.

## Daily Workflow Summary

- `scripts/workflow-daily-summary.mjs .` is a signal check, not an implementation step.
- `NO_ACTION` means no workflow draft is needed.
- `ACTION_REQUIRED` means draft retros, improvements, Skill candidates, automation proposals, or dev-kit proposals may be needed.
- Daily summary must not modify business code, production config, secrets, or active Skills.
