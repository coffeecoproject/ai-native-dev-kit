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
- If `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, do not write target files. Create a real adoption trial report and run `node scripts/check-real-adoption-trial.mjs .` first.

## Workflow Guidance

- When the user gives a broad goal, asks what to do next, or provides a project path/repository without naming a workflow command, run `node scripts/resolve-workflow-guidance.mjs .`.
- Use the Workflow Guidance Card to choose the next safe path.
- Do not treat guidance as permission to write files, change CI, install hooks, archive documents, change task state, implement, release, or approve high-risk domain decisions.

## Delivery Path

- Run `node scripts/cli.mjs delivery-path .` when claiming local-use, self-test, internal-trial, release-review, blocked, or not-ready status.
- Run `node scripts/cli.mjs delivery-path-check .` when Delivery Path Reports exist.
- Do not treat Delivery Path as permission to write files, approve implementation, approve release or production, replace Safe Launch, or prove real users can use the product.

## Debt & Knowledge Handoff

- Run `node scripts/cli.mjs debt-handoff .` when work is paused, interrupted, leaves known debt, or needs reliable next-run context.
- Run `node scripts/cli.mjs debt-handoff-check .` when Debt & Knowledge Handoff Reports exist.
- Do not treat handoff reports as debt forgiveness, implementation approval, release/production approval, task-state changes, source-of-truth changes, Review Loop replacement, or Safe Launch replacement.

## Document Archive Apply

- Run `node scripts/cli.mjs archive-apply .` only when Document Lifecycle archive suggestions need a controlled apply plan.
- Run `node scripts/cli.mjs archive-apply-check .` when Archive Apply Plans exist.
- Do not treat archive apply plans as permission to delete, move/archive, rewrite links, change source of truth, replace Document Lifecycle, or approve cleanup completion.

## Unified Apply Plan

- Run `node scripts/cli.mjs apply-plan . --intent "<goal>"` before applying any recommendation that may write target-project files.
- Run `node scripts/cli.mjs apply-plan-check .` when Unified Apply Plans exist.
- Do not treat apply plans as permission to write files, authorize apply, approve implementation, approve release/production, modify CI/hooks, delete/archive files, change source of truth, or continue beyond scope.

## Project Hook Policy

- Run `node scripts/cli.mjs hook-policy .` before proposing hook installation, CI hook changes, blocking gates, scheduled jobs, external reviewer hooks, token use, or auto-fix hooks.
- Run `node scripts/cli.mjs hook-policy-check .` when Project Hook Policies exist.
- Do not treat hook policy as permission to install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration.

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
- Run `node scripts/cli.mjs baseline-decision .` first when the user needs a plain-language baseline decision card.
- Run `node scripts/check-guided-baseline-selection.mjs .` when Baseline Decision Cards exist.
- Run `node scripts/resolve-standard-baseline.mjs .` for a read-only standard baseline pack recommendation when platform, capability, or release baseline choice is unclear.
- Recommend platform standard packs first; keep backend and release packs conditional; do not treat standard baseline selection as target-project write approval.
- Run `node scripts/cli.mjs baseline-packs .` for the umbrella read-only recommendation when optional industrial overlays also matter.
- Run `node scripts/check-baseline-pack-selection.mjs .` when Baseline Pack Selection Reports exist.
- Run `node scripts/check-standard-baseline-selection.mjs .` when Standard Baseline Selection Reports exist.
- Run `node scripts/check-industrial-pack.mjs . --selected-only` to validate selected industrial pack assets.
- Run `node scripts/resolve-industrial-baseline.mjs .` and `node scripts/check-industrial-baseline.mjs . --bl2-only` to inspect project-level BL2 readiness when BL2 is selected.
- Read `.ai-native/industrial-packs/selection-guide.md` before recommending pack combinations.
- Do not select all baseline packs by default; separate standard packs from industrial overlays.
- Do not treat BL2 or selected industrial packs as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and project-level industrial baseline status.

## Workflow Artifacts

- Use `node scripts/new-workflow-item.mjs` to create numbered workflow files.
- Use `node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.
- Use `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when a change needs independent human, GPT Pro, or second-model review.
- use `node scripts/new-workflow-item.mjs --type review-surface-card --name <slug>` before non-trivial implementation, repair, or review work when selected review surfaces need to be recorded
- use `node scripts/new-workflow-item.mjs --type delivery-path-report --name <slug>` when delivery state needs to be recorded
- use `node scripts/new-workflow-item.mjs --type debt-knowledge-handoff-report --name <slug>` when paused or unfinished work needs handoff context
- use `node scripts/new-workflow-item.mjs --type document-archive-apply-plan --name <slug>` when archive suggestions need a controlled apply plan
- use `node scripts/new-workflow-item.mjs --type project-hook-policy --name <slug>` when hook policy needs to be recorded
- Use `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need closure.
- Use `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet.
- Use `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>` when a bounded suggestion is related but outside current task scope.
- Use `node scripts/new-workflow-item.mjs --type final-report --task <task-card>` when the result needs a durable final report.
- run `node scripts/check-review-surface.mjs .` when Review Surface Cards exist
- run `node scripts/check-delivery-path.mjs .` when Delivery Path Reports exist
- run `node scripts/check-debt-handoff.mjs .` when Debt & Knowledge Handoff Reports exist
- run `node scripts/check-document-archive-apply.mjs .` when Archive Apply Plans exist
- run `node scripts/check-hook-policy.mjs .` when Project Hook Policies exist
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
- Use `node scripts/new-workflow-item.mjs --type patch-classification --name <slug>` and run `node scripts/check-patch-classification.mjs .` before proposing or applying a non-trivial fix in a governed project.
- Patch classification is repair routing only; it is not implementation authorization.

For change boundary and baseline state:

- Use `node scripts/new-workflow-item.mjs --type change-boundary-report --name <slug>` and run `node scripts/check-change-boundary.mjs . --report <report>` when actual changed files need to be proven against approved scope.
- Use `node scripts/new-workflow-item.mjs --type baseline-state-report --name <slug>` and run `node scripts/check-baseline-state.mjs . --report <report>` when baselines are drafted or reviewed before implementation evidence exists.
- Do not claim a no-code or new-project baseline is implemented, verified, production-ready, or confirmed without evidence or a human-confirmed source.

For baseline pack selection:

- Use `node scripts/new-workflow-item.mjs --type standard-baseline-selection-report --name <slug>` when Codex recommends standard baseline packs.
- Use `node scripts/new-workflow-item.mjs --type baseline-pack-selection-report --name <slug>` when Codex recommends BL2 industrial packs or risk overlays.
- Run `node scripts/check-standard-baseline-selection.mjs . --report <report>` before treating standard baseline selection as ready for human decision.
- Run `node scripts/check-baseline-pack-selection.mjs . --report <report>` before treating the recommendation as ready for human decision.
- Baseline pack selection does not approve implementation, target-project writes, release, production, compliance/security/privacy, or draft pack stability.

## Guided Decision & Delivery Loop

For guided delivery:

- Use `.ai-native/core/decision-delegation-boundary.md`, `.ai-native/core/guided-delivery-loop.md`, and `.ai-native/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices.
- Recommend the smallest safe path first, explain what is out of scope, ask for one user-owned confirmation, and park side ideas instead of executing them.
- Use `node scripts/new-workflow-item.mjs --type active-work-thread --name <current-mainline>` only when broad conversation or drift makes the mainline unclear.
- Use `node scripts/new-workflow-item.mjs --type guided-decision-summary --name <decision-name>` when a technical choice needs to become a human-owned product or risk decision.
- These artifacts do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.
- Run `node scripts/check-guided-delivery-loop.mjs .` when these artifacts exist.

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

## Safe Launch

- Use `.ai-native/core/safe-launch.md` when finished work needs a demo, internal handoff, release-review, blocked, or not-ready classification.
- Run `node scripts/check-launch-readiness.mjs .` when Launch Readiness Reports exist or delivery readiness is being claimed.
- Treat `READY_FOR_DEMO`, `READY_FOR_INTERNAL_HANDOFF`, and `READY_FOR_RELEASE_REVIEW` as recommendations only.
- Do not treat Safe Launch as production, legal, compliance, payment, privacy, security, migration, or release approval.

## Conversation Drift

- Use `.ai-native/core/conversation-drift-control.md` when the user message may be discussion-only, review-only, a pause/stop request, a scope change, a new task, a direct follow-up, or a risk decision.
- Run `node scripts/check-conversation-drift.mjs .` when conversation turn classifications or scope change reports exist.
- Classify before acting.
- Do not write files for `DISCUSS_ONLY`, `REVIEW_ONLY`, or `PAUSE_OR_STOP` turns.
- Do not continue current task for `SCOPE_CHANGE`, `NEW_TASK`, `DIRECT_FOLLOW_UP`, or `RISK_DECISION` without human decision.

## First Delivery Walkthrough

- Use `.ai-native/core/first-delivery-walkthrough.md` when a broad new idea needs a complete first-slice walkthrough from human idea to demo, handoff, or not-ready recommendation.
- Run `node scripts/check-first-delivery-walkthrough.mjs .` when Adoption Trial Reports exist or first-delivery evidence is being claimed.
- Start with the smallest safe path: start, baseline, request, spec, eval, task, verify, final report, launch readiness.
- Add heavier artifacts only when risk, ambiguity, helper agents, independent review, or scope drift appears.
- Do not treat walkthroughs or adoption trial reports as production, release, payment, privacy, security, legal, compliance, migration, or customer approval.

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
