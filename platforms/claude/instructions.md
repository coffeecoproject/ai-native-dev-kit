# Claude Project Instructions

Use the AI Native Development Workflow:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

For vague or large requests:

- do not write code first
- produce a preflight report
- identify first vertical slice
- mark task level L0-L3

For implementation:

- implement one task card only
- follow scope and stop conditions
- run verification
- summarize evidence, risks, classified next-step suggestions, and next safe action

For bootstrap entry:

- if the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat it as execution bootstrap intent
- execution bootstrap intent may write workflow and governance assets only; do not modify business code during bootstrap
- if the user asks to look, review, evaluate, discuss, or not execute yet, treat it as discussion-only intent and do not write files
- use `.ai-native/prompts/bootstrap-agent.md` when present
- run `node scripts/workflow-next.mjs .` and follow `NEXT_ACTION`
- stop for human approval before applying migration reports
- if `workflow-next` reports `REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing tasks until the human confirms how to handle existing changes

For project onboarding:

- before first non-trivial implementation, use `.ai-native/prompts/project-onboarding-agent.md`
- AI drafts project context documents from conversation
- humans decide project direction, stack approval, risk boundaries, and first vertical slice
- do not ask the human to manually fill all onboarding files
- ask focused questions, propose options, record assumptions, and request confirmation
- run `node scripts/check-project-onboarding.mjs .` for baseline
- use `node scripts/check-project-onboarding.mjs . --strict` only after human confirmation

For platform baseline:

- select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`
- run `node scripts/check-platform-baseline.mjs .` before the first non-trivial implementation
- use `node scripts/resolve-platform-baseline.mjs .` to inspect effective platform verification and risk requirements
- use strict mode only after humans confirm selected profiles and project docs

For industrial baseline:

- baseline level is `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`; it is not task level
- run `node scripts/check-industrial-pack.mjs . --selected-only` to validate selected industrial pack assets
- run `node scripts/resolve-industrial-baseline.mjs .` and `node scripts/check-industrial-baseline.mjs . --bl2-only` to inspect project-level BL2 readiness when BL2 is selected
- read `.ai-native/industrial-packs/selection-guide.md` before recommending pack combinations
- do not treat BL2 or selected industrial packs as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and project-level industrial baseline status

For workflow artifacts:

- use `node scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, AI log, review packet, GPT review prompt, review loop report, follow-up proposal, and final report files
- use `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when a change needs independent human, GPT Pro, or second-model review
- use `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need closure
- use `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet
- use `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>` when a bounded suggestion is related but outside current task scope
- use `node scripts/new-workflow-item.mjs --type final-report --task <task-card>` when the result needs a durable final report
- run `node scripts/check-review-loop.mjs . --task <task-card>` when a Review Loop Report exists
- run `node scripts/check-next-step-boundary.mjs . --task <task-card>` when next-step suggestions are recorded
- run `node scripts/check-workflow-artifacts.mjs . --mode ready` before implementation when workflow artifacts exist
- run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` for high-risk implementation after human approval is recorded
- if any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation
- fix placeholder or missing artifact content before coding
- AUTO_FIX is limited to deterministic, low-risk findings inside approved task scope, for at most 2 rounds
- route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to the human

For bounded next-step suggestions:

- use `.ai-native/core/next-step-boundary.md` before reporting suggestions, review follow-ups, or final next actions
- suggestions must be bounded, classified, and actionable
- use only `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`
- only `IN_SCOPE_NEXT_STEP` may be handled inside the current task when no new approval is needed
- `DIRECT_FOLLOW_UP` requires a new request or `follow-up-proposal`
- `RISK_DECISION` requires human decision and preflight before implementation
- `OUT_OF_SCOPE_OBSERVATION` is context only
- `DO_NOT_PROCEED` must not be implemented under current scope

For output experience:

- use `.ai-native/core/output-protocol.md` and `.ai-native/prompts/reporter-agent.md` for workflow, baseline, adoption, review, release, and automation status
- start human-facing output with a human summary, current status, decision needed, next safe step, what AI can do, and what AI must not do
- keep technical fields, paths, commands, and audit notes after the plain-language status
- use `.ai-native/core/glossary.md` when internal workflow terms need translation

For review:

- lead with findings
- prioritize bugs, permission issues, data leakage, missing tests, and scope creep

For Skill governance:

- repeated patterns may become `skill-candidates/`
- use `.ai-native/templates/skill-candidate.md`
- review with `.ai-native/checklists/skill-review.md`
- do not create, update, install, enable, or run active Skills without explicit human approval

For automation governance:

- automations must be project-scoped by default
- proposals belong in `automation-proposals/`
- use `.ai-native/templates/project-automation-proposal.md`
- review with `.ai-native/checklists/automation-review.md`
- do not create, update, resume, delete, or enable automations without explicit human approval for project root, schedule, prompt, allowed writes, forbidden actions, and initial status
- do not attach automation to a parent directory unless the user explicitly approves a multi-project monitor

For daily workflow summary:

- `scripts/workflow-daily-summary.mjs .` is a signal check
- `NO_ACTION` means no workflow draft is needed
- `ACTION_REQUIRED` means a retro, improvement, Skill candidate, automation proposal, or dev-kit proposal may be needed
- daily summary must not modify business code, production config, secrets, or active Skills
