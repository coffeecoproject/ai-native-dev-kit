# Claude Project Instructions

Use the AI Native Development Workflow:

```text
Request -> Preflight -> Spec -> Eval -> Task -> Execute -> Verify -> Review -> Release -> Log
```

When the route is unclear, first use Goal Mode:

```text
Goal Mode -> Request / Adoption / Task / Review / Repair / Decision / Report
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
- run `node scripts/start-project.mjs .` first for a read-only adoption recommendation
- after adoption classification, run `node scripts/cli.mjs baseline .` when engineering or environment rules are unclear
- treat `baseline` as read-only by default; it must report `Can AI write now: No`
- write baseline docs only through reviewed `baseline-project --write-plan` and `--apply-plan`
- use `node scripts/workflow-next.mjs .` as the lower-level state detector and follow `NEXT_ACTION`
- stop for human approval before applying migration reports
- if `workflow-next` reports `REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`, stop before creating artifacts or executing tasks until the human confirms how to handle existing changes
- if `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, do not write target files; create a real adoption trial report and run `node scripts/check-real-adoption-trial.mjs .` first

For workflow guidance:

- when the user gives a broad goal, asks what to do next, or provides a project path/repository without naming a workflow command, run `node scripts/resolve-workflow-guidance.mjs .`
- use the Workflow Guidance Card to choose the next safe path
- do not treat guidance as permission to write files, change CI, install hooks, archive documents, change task state, implement, release, or approve high-risk domain decisions

For delivery path:

- run `node scripts/cli.mjs delivery-path .` when claiming local-use, self-test, internal-trial, release-review, blocked, or not-ready status
- run `node scripts/cli.mjs delivery-path-check .` when Delivery Path Reports exist
- do not treat Delivery Path as permission to write files, approve implementation, approve release or production, replace Safe Launch, or prove real users can use the product

For debt and knowledge handoff:

- run `node scripts/cli.mjs debt-handoff .` when work is paused, interrupted, leaves known debt, or needs reliable next-run context
- run `node scripts/cli.mjs debt-handoff-check .` when Debt & Knowledge Handoff Reports exist
- do not treat handoff reports as debt forgiveness, implementation approval, release/production approval, task-state changes, source-of-truth changes, Review Loop replacement, or Safe Launch replacement

For project onboarding:

- before first non-trivial implementation, use `.ai-native/prompts/project-onboarding-agent.md`
- AI drafts project context documents from conversation
- humans decide project direction, stack approval, risk boundaries, and first vertical slice
- do not ask the human to manually fill all onboarding files
- ask focused questions, propose options, record assumptions, and request confirmation
- run `node scripts/check-project-onboarding.mjs .` for baseline
- use `node scripts/check-project-onboarding.mjs . --strict` only after human confirmation

For engineering baseline:

- before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.ai-native/core/engineering-baseline.md` when present
- run `node scripts/check-engineering-baseline.mjs .` for advisory baseline status
- Claude may follow existing local patterns for low-risk local changes
- Claude must not create or upgrade project-wide engineering conventions without a documented project source of truth or human approval
- if the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns

For environment baseline:

- before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert changes, read `docs/environment-baseline.md` and `.ai-native/core/environment-baseline.md` when present
- run `node scripts/check-environment-baseline.mjs .` for advisory environment baseline status
- run `node scripts/check-baseline-enforcement.mjs . --mode ready` when task cards exist
- Claude may draft missing facts as `PENDING_CONFIRMATION` and irrelevant items as `NOT_APPLICABLE`
- Claude must not create or edit `.env`, record secret values, invent production/release/rollback/monitoring facts, or change CI/CD, deployment, or production config without explicit approval

For platform baseline:

- select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`
- run `node scripts/check-platform-baseline.mjs .` before the first non-trivial implementation
- use `node scripts/resolve-platform-baseline.mjs .` to inspect effective platform verification and risk requirements
- use strict mode only after humans confirm selected profiles and project docs

For industrial baseline:

- baseline level is `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`; it is not task level
- run `node scripts/cli.mjs baseline-decision .` first when the user needs a plain-language baseline decision card
- run `node scripts/check-guided-baseline-selection.mjs .` when Baseline Decision Cards exist
- run `node scripts/resolve-standard-baseline.mjs .` for read-only standard baseline pack recommendation when platform, capability, or release baseline choice is unclear
- recommend platform standard packs first; keep backend and release packs conditional; do not treat standard baseline selection as target-project write approval
- run `node scripts/cli.mjs baseline-packs .` for the umbrella read-only recommendation when optional industrial overlays also matter
- run `node scripts/check-baseline-pack-selection.mjs .` when Baseline Pack Selection Reports exist
- run `node scripts/check-standard-baseline-selection.mjs .` when Standard Baseline Selection Reports exist
- run `node scripts/check-industrial-pack.mjs . --selected-only` to validate selected industrial pack assets
- run `node scripts/resolve-industrial-baseline.mjs .` and `node scripts/check-industrial-baseline.mjs . --bl2-only` to inspect project-level BL2 readiness when BL2 is selected
- read `.ai-native/industrial-packs/selection-guide.md` before recommending pack combinations
- do not select all baseline packs by default; separate standard packs from industrial overlays
- do not treat BL2 or selected industrial packs as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and project-level industrial baseline status

For workflow artifacts:

- use `node scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, AI log, review packet, GPT review prompt, review loop report, goal card, follow-up proposal, and final report files
- use `node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows
- use `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` when a change needs independent human, GPT Pro, or second-model review
- use `node scripts/new-workflow-item.mjs --type review-surface-card --name <slug>` before non-trivial implementation, repair, or review work when selected review surfaces need to be recorded
- use `node scripts/new-workflow-item.mjs --type delivery-path-report --name <slug>` when delivery state needs to be recorded
- use `node scripts/new-workflow-item.mjs --type debt-knowledge-handoff-report --name <slug>` when paused or unfinished work needs handoff context
- use `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>` for L2/L3 work or when review findings need closure
- use `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` only as a read-only reviewer prompt paired with a Review Packet
- use `node scripts/new-workflow-item.mjs --type follow-up-proposal --task <task-card>` when a bounded suggestion is related but outside current task scope
- use `node scripts/new-workflow-item.mjs --type final-report --task <task-card>` when the result needs a durable final report
- run `node scripts/check-review-surface.mjs .` when Review Surface Cards exist
- run `node scripts/check-delivery-path.mjs .` when Delivery Path Reports exist
- run `node scripts/check-debt-handoff.mjs .` when Debt & Knowledge Handoff Reports exist
- run `node scripts/check-review-loop.mjs . --task <task-card>` when a Review Loop Report exists
- run `node scripts/check-goal-mode.mjs .` when Goal Cards exist
- run `node scripts/check-subagent-orchestration.mjs .` when Subagent Run Plans exist
- run `node scripts/check-next-step-boundary.mjs . --task <task-card>` when next-step suggestions are recorded
- run `node scripts/check-workflow-artifacts.mjs . --mode ready` before implementation when workflow artifacts exist
- run `node scripts/check-baseline-enforcement.mjs . --mode ready --task <task-card>` before implementation when baselines are touched
- run `node scripts/check-baseline-enforcement.mjs . --mode implementation --task <task-card>` before closure for BL1 implementation work, BL2 work, or L3 tasks
- run `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>` for high-risk implementation after human approval is recorded
- if any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation
- fix placeholder or missing artifact content before coding
- AUTO_FIX is limited to deterministic, low-risk findings inside approved task scope, for at most 2 rounds
- route scope, risk, permission, architecture, dependency, migration, production config, release, rollback, Human Approval, and Approval scope changes to the human
- route missing engineering or environment baseline decisions to a Decision Brief or Human Decisions Needed instead of silently choosing
- create `node scripts/new-workflow-item.mjs --type patch-classification --name <slug>` and run `node scripts/check-patch-classification.mjs .` before proposing or applying a non-trivial fix in a governed project
- patch classification is repair routing only; it is not implementation authorization

For change boundary and baseline state:

- create `node scripts/new-workflow-item.mjs --type change-boundary-report --name <slug>` and run `node scripts/check-change-boundary.mjs . --report <report>` when actual changed files need to be proven against approved scope
- create `node scripts/new-workflow-item.mjs --type baseline-state-report --name <slug>` and run `node scripts/check-baseline-state.mjs . --report <report>` when baselines are drafted or reviewed before implementation evidence exists
- never claim a no-code or new-project baseline is implemented, verified, production-ready, or confirmed without evidence or a human-confirmed source

For baseline pack selection:

- create `node scripts/new-workflow-item.mjs --type standard-baseline-selection-report --name <slug>` when Codex recommends standard baseline packs
- create `node scripts/new-workflow-item.mjs --type baseline-pack-selection-report --name <slug>` when Codex recommends BL2 industrial packs or risk overlays
- run `node scripts/check-standard-baseline-selection.mjs . --report <report>` before treating standard baseline selection as ready for human decision
- run `node scripts/check-baseline-pack-selection.mjs . --report <report>` before treating the recommendation as ready for human decision
- never treat baseline pack selection as implementation, target-project write, release, production, compliance/security/privacy, or draft-pack stability approval

For guided decision and guided delivery:

- use `.ai-native/core/decision-delegation-boundary.md`, `.ai-native/core/guided-delivery-loop.md`, and `.ai-native/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices
- recommend the smallest safe path first, explain what is out of scope, ask for one user-owned confirmation, and park side ideas instead of executing them
- use `node scripts/new-workflow-item.mjs --type active-work-thread --name <current-mainline>` only when broad conversation or drift makes the mainline unclear
- use `node scripts/new-workflow-item.mjs --type guided-decision-summary --name <decision-name>` when a technical choice needs to become a human-owned product or risk decision
- these artifacts do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes
- run `node scripts/check-guided-delivery-loop.mjs .` when these artifacts exist

For Goal Mode:

- read `.ai-native/core/goal-mode.md` and `.ai-native/prompts/goal-planner-agent.md` when present
- choose one of `DISCUSS_ONLY`, `ADOPT_PROJECT`, `DEFINE_WORK`, `IMPLEMENT_TASK`, `REVIEW_TASK`, `REPAIR_TASK`, `BASELINE_DECISION`, or `HANDOFF_OR_REPORT`
- never treat a Goal Card as implementation approval, risk acceptance, release approval, Human Approval, Approval scope, or subagent orchestration approval

For subagent orchestration:

- read `.ai-native/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting
- create a Subagent Run Plan with `node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>`
- follow many readers, one writer; subagent output is input, not authority
- close or skip every subagent after handoff
- do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot
- do not use helper agents to resolve `NEEDS_HUMAN_DECISION`, approve risk, approve release, create automations, call external GPT/API reviewers, or bypass Review Loop boundaries

For safe launch:

- use `.ai-native/core/safe-launch.md` when completed work needs a demo, internal handoff, release-review, blocked, or not-ready classification
- run `node scripts/check-launch-readiness.mjs .` when Launch Readiness Reports exist or delivery readiness is claimed
- treat readiness states as recommendations, not production, legal, compliance, payment, privacy, security, migration, or release approval

For conversation drift:

- use `.ai-native/core/conversation-drift-control.md` when a user message may be discussion-only, review-only, a pause/stop request, a scope change, a new task, a direct follow-up, or a risk decision
- run `node scripts/check-conversation-drift.mjs .` when conversation turn classifications or scope change reports exist
- classify before acting
- do not write files for `DISCUSS_ONLY`, `REVIEW_ONLY`, or `PAUSE_OR_STOP`
- do not continue current task for `SCOPE_CHANGE`, `NEW_TASK`, `DIRECT_FOLLOW_UP`, or `RISK_DECISION` without human decision

For first delivery walkthrough:

- use `.ai-native/core/first-delivery-walkthrough.md` when a broad new idea needs a complete first-slice walkthrough from human idea to demo, handoff, or not-ready recommendation
- run `node scripts/check-first-delivery-walkthrough.mjs .` when Adoption Trial Reports exist or first-delivery evidence is being claimed
- start with the smallest safe path: start, baseline, request, spec, eval, task, verify, final report, launch readiness
- add heavier artifacts only when risk, ambiguity, helper agents, independent review, or scope drift appears
- do not treat walkthroughs or adoption trial reports as production, release, payment, privacy, security, legal, compliance, migration, or customer approval

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

For product baseline and claim control:

- use `.ai-native/core/outcome-baseline.md`, `.ai-native/core/product-baseline.md`, `.ai-native/core/claim-control.md`, and `.ai-native/core/assumption-register.md` when workflow behavior, release wording, public summaries, reports, or handoffs change
- run `node scripts/check-product-baseline.mjs .`, `node scripts/check-claim-control.mjs .`, and `node scripts/check-context-governance.mjs .` when available
- do not treat reports, Review Packets, Goal Cards, or subagent output as approval
- do not describe simulated dogfood, generated-project smoke, or draft packs as production evidence
- record inferred or unconfirmed facts in an Assumption Register when they affect decisions, claims, release, environment, rollback, monitoring, or risk

For project memory and context governance:

- use `.ai-native/core/context-governance.md` and `.ai-native/core/git-boundary.md` when observations may become project memory, context appears stale, or artifact Git boundary is unclear
- Codex may draft Learning Candidates, Context Correction Reports, and Git Boundary Reports
- humans confirm before source-of-truth changes
- model memory must not override Git-backed source of truth

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
