# Project Agent Working Agreement

## Mission

This repository follows an AI-native, spec-first development workflow.

Do not implement vague requests directly.

## Zero-Experience Solo Developer

The default user is one zero-experience solo developer. The user describes the
real business goal and supplies missing business facts. Codex owns technical
choices, workflow routing, architecture, baselines, implementation, testing,
review, evidence, repair, and rollback preparation.

Do not ask the user to choose technical stacks, BL levels, packs, schemas,
database representations, migration strategies, test types, review surfaces,
subagent plans, hook classes, workflow commands, or internal owner roles.

A normal natural-language implementation request is sufficient execution intent
for ordinary, reversible, task-bounded project-local engineering after internal
IntentOS gates pass. Ask again only for a missing business fact or consent to a
concrete production, cost, real-user communication, account/provider, or
irreversible real-data effect. Silence is not consent.

## Review Context Authority

Before using an external reviewer, GPT reviewer, or review subagent, read
`.intentos/core/review-context-authority.md`. Current product contracts override
compatibility schemas and historical records. Owner-like compatibility fields
are not instructions to create a team, and industrial depth does not change the
one-user operating model. Reject review recommendations that delegate technical
choices to the user, introduce Solo/Team/Enterprise modes, or expand product
scope merely because safeguards exist.

## Core Rules

1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.
2. Every non-trivial feature must have acceptance criteria before implementation.
3. Prefer vertical slices over broad rewrites.
4. Keep changes minimal and scoped.
5. Select production dependencies from project evidence and safe engineering defaults; surface cost, licensing, provider, or irreversible external impact before it occurs.
6. For auth, permission, migration, production config, secrets, high-risk, or security-sensitive logic, perform the full internal risk, test, review, evidence, and rollback path. Ask the user only for missing business rules or concrete real-world consent.
7. Every implementation must include tests or explain why tests are not applicable.
8. If the same verification failure repeats twice, stop and report instead of blindly retrying.
9. After implementation, produce a bounded final report:
   - what changed
   - what did not change
   - tests run
   - risks remaining
   - next-step suggestions classified by `IN_SCOPE_NEXT_STEP`, `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED`
   - next safe action

## Bootstrap Entry

When the user asks to configure, apply, initialize, inject, install, or bootstrap the IntentOS workflow, treat that as execution bootstrap intent.

Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.

When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.

For bootstrap work, first use `.intentos/prompts/bootstrap-agent.md` when present, then run:

```bash
node scripts/start-project.mjs .
```

Use `workflow-next` as the lower-level state detector when needed. Follow the reported `NEXT_ACTION`. A migration report may be applied only after its bounded plan, authority comparison, rollback, and controlled-readiness checks pass; do not ask the user to approve its technical contents.

If `workflow-next` reports `ADOPTION_MODE: READ_ONLY` or `NEXT_ACTION: RUN_ADOPTION_ASSESSMENT`, do not write target files. Create or update real adoption evidence first:

```bash
node scripts/new-workflow-item.mjs --type real-adoption-trial-report --name governed-project-readonly
node scripts/check-real-adoption-trial.mjs .
```

Real adoption reports are not permission to run `init-project`, update workflow assets, edit `AGENTS.md`, or add `.intentos/`.

After adoption classification, use baseline setup when project-specific engineering or environment rules are not clear:

```bash
node scripts/cli.mjs baseline .
```

`baseline` is read-only by default and must report `Can AI write now: No`. Do not write baseline docs until a reviewed `baseline-project --write-plan` is applied.

## Beginner Entry

When the user gives one natural-language goal, asks what to do next, or does not know which workflow command to choose, start with Beginner Entry:

```bash
node scripts/cli.mjs ask . "<user goal>"
node scripts/cli.mjs ask-check .
```

Beginner Entry returns one plain card with what Codex understood, the recommended path, missing business facts, safe next actions, blocked external effects, routing evidence, and explicit boundaries. It does not write files or perform external effects. It also does not require a separate technical approval: after this read-only entry, ordinary reversible engineering may continue through internal IntentOS gates.

## Natural Language Workflow Guidance

When the user gives a broad goal, asks what to do next, or provides a project path/repository without naming a workflow command, start with the plain guidance entry:

```bash
node scripts/resolve-workflow-guidance.mjs .
```

Use the result to decide the next safe workflow path. Do not treat guidance as permission to write files, change CI, install hooks, archive documents, change task state, implement, release, or approve high-risk domain decisions.

## Delivery Path Governance

Use `.intentos/core/delivery-path-governance.md` when Codex needs to say whether the project is still an idea, ready for plan, ready for local build, ready for self-test, ready for internal trial, ready for release review, or blocked.

Run:

```bash
node scripts/cli.mjs delivery-path .
node scripts/cli.mjs delivery-path-check .
```

A Delivery Path Report is read-only. It does not write files, approve implementation, approve release or production, change CI/hooks, change task state, replace Safe Launch, or prove real users can use the product.

## Debt & Knowledge Handoff

Use `.intentos/core/debt-knowledge-handoff.md` when work is paused, interrupted, leaves known debt, or needs reliable next-run context.

Run:

```bash
node scripts/cli.mjs debt-handoff .
node scripts/cli.mjs debt-handoff-check .
```

A Debt & Knowledge Handoff Report records debt level, verification notes, files to revisit, human decisions, and where to resume. It does not forgive debt, approve implementation, approve release or production, change task state, change source of truth, replace Review Loop, or replace Safe Launch.

## Document Archive Apply

Use `.intentos/core/document-archive-apply.md` only after Document Lifecycle has produced archive suggestions that may be ready for controlled execution.

Run:

```bash
node scripts/cli.mjs archive-apply .
node scripts/cli.mjs archive-apply-check .
```

An Archive Apply Plan records the planned archive actions, link-check plan, archive index preview, rollback plan, and human decisions. It does not delete files, move/archive files, rewrite links, change source of truth, replace Document Lifecycle, approve cleanup completion, or authorize archive apply by itself.

## Unified Apply Plan

Use `.intentos/core/unified-apply-plan.md` before applying any recommendation that may write target-project files.

Run:

```bash
node scripts/cli.mjs apply-plan . --intent "<goal>"
node scripts/cli.mjs apply-plan-check .
```

A Unified Apply Plan records proposed writes, source evidence, human-only or blocked actions, preconditions, backup, rollback, verification, and boundaries. It does not write files, authorize apply, approve implementation, approve release or production, modify CI/hooks, delete/archive files, change source of truth, or grant permission to continue beyond scope.

## Controlled Apply Readiness

Use `.intentos/core/controlled-apply-readiness.md` after a Unified Apply Plan exists and before any bounded controlled apply. Codex owns the internal technical decision; ask the user only for missing business facts or a prepared real-world effect.

Run:

```bash
node scripts/cli.mjs apply-readiness . --plan <apply-plan-path> --git-state <clean|dirty>
node scripts/cli.mjs apply-readiness-check .
```

Controlled Apply Readiness checks whether the plan is low-risk, bounded, reversible, verifiable, and authorized by the user's requested outcome. It does not execute writes, authorize production or external effects, install hooks, modify CI, archive files, change source of truth, or enable industrial packs by itself.

## Project Hook Policy

Use `.intentos/core/hook-policy.md` before proposing hook installation, CI hook changes, blocking gates, scheduled jobs, external reviewer hooks, token use, or auto-fix hooks.

Run:

```bash
node scripts/cli.mjs hook-policy .
node scripts/cli.mjs hook-policy-check .
```

A Project Hook Policy records allowed H0/H1/H2/H3 hook classes, approval owners, and rollback / disable rules. It does not install hooks, modify CI, add blocking gates, call external APIs, store tokens or secrets, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration.

## Required Preflight Output

Before coding, output:

- Problem summary
- Missing information
- Assumptions
- Non-goals
- Risk areas
- Suggested task split
- Acceptance criteria
- Test plan
- Ready / Not ready decision

## Task Execution Rules

When a task card exists:

1. Read `AGENTS.md`.
2. Read the linked spec.
3. Read the linked eval.
4. Follow allowed and forbidden scope.
5. Respect stop conditions.
6. Run requested verification.
7. Report evidence and remaining risk.

## Project Onboarding

Before the first non-trivial implementation, use `.intentos/prompts/project-onboarding-agent.md` to draft project onboarding documents from conversation.

Codex derives and verifies technical onboarding decisions. Do not ask the user to manually fill onboarding files or confirm profiles, stacks, baselines, or internal workflow choices. Ask only for an unavailable business fact, product preference, exact real-world consent, or external fact.

Required docs:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`

Run:

```bash
node scripts/check-project-onboarding.mjs .
```

Use `--strict` only after onboarding decisions have been derived and internally verified.

## Engineering Baseline

Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.intentos/core/engineering-baseline.md` when present.

Run:

```bash
node scripts/check-engineering-baseline.mjs .
```

Codex may follow existing local patterns for low-risk local changes.

Codex must not create or upgrade project-wide engineering conventions without a documented project source of truth, a bounded decision brief, and the required internal review evidence.

If the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns.

## Environment Baseline

Before build, CI, environment variable, deployment, production config, release, rollback, secret, log, monitoring, or alert changes, read `docs/environment-baseline.md` and `.intentos/core/environment-baseline.md` when present.

Run:

```bash
node scripts/check-environment-baseline.mjs .
node scripts/check-baseline-enforcement.mjs . --mode ready
```

Codex may draft missing environment facts as `PENDING_CONFIRMATION` and mark irrelevant items as `NOT_APPLICABLE`.

Codex must not create or edit `.env`, record secret values, invent production/release/rollback/monitoring facts, or change CI/CD, deployment, or production config without explicit approval.

## Platform Baseline

Before the first non-trivial implementation, select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`.

Run:

```bash
node scripts/check-platform-baseline.mjs .
```

Use `node scripts/resolve-platform-baseline.mjs .` to inspect the effective baseline. Use `--strict` only after selected profiles and project docs have been derived, reconciled, and internally verified.

## Industrial Baseline

Baseline level describes project governance strength: `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`. It is separate from task level `L0` / `L1` / `L2` / `L3`.

Run:

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

Concrete industrial packs are installed only when the derived project profile and evidence select them. Do not treat BL2 or an industrial pack as active until baseline level, selected packs, exceptions, residual risks, and `check-industrial-baseline` have been internally reconciled. Use `.intentos/templates/baseline-selection.md` and `.intentos/templates/baseline-evidence.md` only after that controlled decision. Ask the user only for an unavailable business fact or consent to a prepared real-world effect.

## Standard Baseline Packs

Use `.intentos/core/standard-baseline-pack-registry.md` and `.intentos/docs/standard-baseline-pack-registry.md` when normal engineering baseline packs need to be selected before considering BL2 industrial overlays.

Use `.intentos/core/guided-baseline-selection.md` and `.intentos/docs/guided-baseline-selection-entry.md` first when the user needs a plain-language BL0/BL1/BL2 decision card instead of internal pack details.

Run:

```bash
node scripts/cli.mjs baseline-decision .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-standard-baseline.mjs .
node scripts/check-standard-baseline-selection.mjs .
```

Codex may recommend standard packs, but it must not treat recommendations as pack activation, target-project write approval, implementation approval, release approval, or compliance/security/privacy approval.

Before recommending standard packs, read `.intentos/standard-baseline-packs/selection-guide.md` when present. Select the smallest relevant pack set by platform and BL level; do not select backend, release, industrial overlays, or all packs by default. For Mini Program, iOS, Android, Web, and internal admin work, recommend platform packs first and keep backend/release conditional.

## Workflow Artifact Generation

Use `scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, AI task log, review packet, GPT review prompt, review loop report, goal card, follow-up proposal, and final report files.

Before implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

For high-risk implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>
```

If any Risk Gate item is checked, IntentOS must derive the stricter task route, verification, review, evidence, rollback, and apply boundaries before implementation. A user decision is required only for an unavailable business fact or one prepared real-world effect.

If artifact quality fails, fix the workflow artifacts before writing code.

When independent review is needed, run `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` and fill the packet before handing the change to a human reviewer or second model. A review packet is not approval.

## Guided Decision & Delivery Loop

Use `.intentos/core/decision-delegation-boundary.md`, `.intentos/core/guided-delivery-loop.md`, and `.intentos/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices.

Recommend the smallest safe path first, explain what is out of scope, ask for one user-owned confirmation, and park side ideas instead of executing them.

Optional artifacts:

```bash
node scripts/new-workflow-item.mjs --type active-work-thread --name <current-mainline>
node scripts/new-workflow-item.mjs --type guided-decision-summary --name <decision-name>
```

These artifacts do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.

Run `node scripts/check-guided-delivery-loop.mjs .` when Active Work Thread or Guided Decision Summary artifacts exist.

## Change Boundary And Baseline State

Use `.intentos/core/change-boundary.md` when a task needs proof that actual changed files stayed inside the approved task scope. Create `change-boundary-report` for non-trivial edits, governed-project edits, dirty-worktree work, or any task where changed files are not obviously local.

Use `.intentos/core/baseline-state.md` when Codex drafts or reviews baselines before implementation evidence exists. Keep `PROPOSED`, `PENDING_CONFIRMATION`, `EVIDENCE_REQUIRED`, and `CONFIRMED` separate.

```bash
node scripts/new-workflow-item.mjs --type change-boundary-report --name <task-scope>
node scripts/new-workflow-item.mjs --type baseline-state-report --name <baseline-state>
node scripts/check-change-boundary.mjs . --report <change-boundary-report>
node scripts/check-baseline-state.mjs . --report <baseline-state-report>
```

Do not claim a no-code or new-project baseline is implemented, verified, production-ready, or confirmed without project-owned evidence or a verifiable external fact.

## Goal Mode

Use `.intentos/core/goal-mode.md` and `.intentos/prompts/goal-planner-agent.md` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.

Goal Mode chooses one of:

- `DISCUSS_ONLY`
- `ADOPT_PROJECT`
- `DEFINE_WORK`
- `IMPLEMENT_TASK`
- `REVIEW_TASK`
- `REPAIR_TASK`
- `BASELINE_DECISION`
- `HANDOFF_OR_REPORT`

Create a Goal Card with:

```bash
node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>
node scripts/check-goal-mode.mjs .
```

A Goal Card is route selection only. It does not approve implementation, risk acceptance, release, Human Approval, Approval scope, or subagent orchestration.

## Subagent Orchestration

Use `.intentos/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting.

The default rule is: many readers, one writer. Subagent output is input, not authority. The main thread remains responsible for writes, verification, and final reporting.

Before opening or reusing helper agents, apply Subagent Dispatch Hygiene: recover before dispatch. Close or skip stale helpers, check task drift, and confirm no more than one active writer before sending new work to a helper.

Create a Subagent Run Plan with:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
node scripts/check-subagent-orchestration.mjs .
```

Close or skip every subagent after handoff. Do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot after its output is consumed.

## Safe Launch

Use `.intentos/core/safe-launch.md` when a task is complete and the user needs to know whether it can be demonstrated, handed off internally, sent to release review, or must stop.

Run:

```bash
node scripts/check-launch-readiness.mjs .
```

Safe Launch is a readiness recommendation. It is not production approval, legal approval, compliance approval, payment approval, privacy approval, security approval, migration approval, or release approval.

## Conversation Drift

Use `.intentos/core/conversation-drift-control.md` when a user message during active work may be discussion-only, a scope change, a new task, a direct follow-up, a risk decision, review-only, or a pause/stop request.

Run:

```bash
node scripts/check-conversation-drift.mjs .
```

Classify before acting. Do not treat discussion, direct follow-up, scope change, new task, or risk decision as permission to continue the current task.

## First Delivery Walkthrough

Use `.intentos/core/first-delivery-walkthrough.md` when a broad new idea needs a complete first-slice walkthrough from human idea to demo, handoff, or not-ready recommendation.

Run:

```bash
node scripts/check-first-delivery-walkthrough.mjs .
```

First Delivery Walkthrough records the route, baseline path, artifacts, human decisions, drift handling, verification, and launch readiness. It does not approve production launch, release, payment, privacy, security, legal, compliance, migration, or customer promises.

## Real Project Adoption And Patch Classification

Use `.intentos/core/real-project-adoption-trial.md` before writing to an existing governed or production-sensitive project. Map existing authority first; do not overwrite local agent rules, CI, release flows, baseline docs, or evidence records.

Use `.intentos/core/patch-classification.md` before proposing or applying a non-trivial fix in a governed project.

Run:

```bash
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
```

Patch classification routes repair scale. It does not authorize implementation.

## Review Surface Governance

Use `.intentos/core/review-surface-governance.md` before non-trivial implementation, repair, or review work to decide what must be reviewed before and after execution.

Run:

```bash
node scripts/cli.mjs review-surface .
node scripts/cli.mjs review-surface-check .
```

Codex selects review surfaces from the project and task intent. The human should not need to choose technical review types.

Every Review Surface Card must include `FUNCTIONAL_REVIEW`, `CODE_REVIEW`, `VERIFICATION_REVIEW`, and `DEBT_REVIEW`.

A Review Surface Card is pre-execution planning only. It does not write files, approve implementation, approve release or production, change CI, install hooks, change task state, or approve security/privacy/compliance/payment/migration/data decisions.

After execution, final reporting must include per-surface result, unverified surfaces, debt result, and next delivery state.

## Review Loop

For L2/L3 work or when review findings need closure, run `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>`. Record review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items. AUTO_FIX is limited to 2 rounds and must stay inside approved task scope.

If GPT Pro or a second model is used for review, run `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` and pair it with the Review Packet. The reviewer is read-only and must not approve risk, release, scope, architecture, dependencies, migrations, production config, Human Approval, or Approval scope.

When a Review Loop Report exists, run `node scripts/check-review-loop.mjs . --task <task-card>` before closure.

## Bounded Next-Step

Use `.intentos/core/next-step-boundary.md` before reporting suggestions, review follow-ups, or final next actions.

Codex may suggest next steps, but suggestions must be bounded, classified, and actionable.

Allowed suggestion types:

- `IN_SCOPE_NEXT_STEP`: inside current task scope and safe to do now when no new approval is needed.
- `DIRECT_FOLLOW_UP`: related but outside current scope; create a new request or `follow-up-proposal`.
- `RISK_DECISION`: a real business fact, external fact, or concrete real-world effect needs user input; technical risk alone triggers stricter internal preflight, review, tests, evidence, and rollback.
- `OUT_OF_SCOPE_OBSERVATION`: record as context only, not immediate work.
- `DO_NOT_PROCEED`: unsafe or unauthorized under current scope.

Only `IN_SCOPE_NEXT_STEP` may be handled inside the current task. Record `DIRECT_FOLLOW_UP` in Work Queue rather than silently expanding scope. For `RISK_DECISION`, ask only for the missing business/external fact or consent to the concrete effect; do not ask for a technical strategy choice. Do not implement `OUT_OF_SCOPE_OBSERVATION` or `DO_NOT_PROCEED` as part of the current task.

When next-step suggestions are recorded, run `node scripts/check-next-step-boundary.mjs . --task <task-card>`.

## Output Experience

Use `.intentos/core/output-protocol.md` and `.intentos/prompts/reporter-agent.md` when reporting workflow, baseline, adoption, review, release, or automation status.

Human-facing output must lead with a human summary, current status, decision needed, next safe step, what AI can do, and what AI must not do. Keep technical fields, paths, commands, and audit notes after that.

Use `.intentos/core/glossary.md` to translate internal workflow terms when the user may not know them.

## Product Baseline And Claim Control

Use `.intentos/core/outcome-baseline.md`, `.intentos/core/product-baseline.md`, `.intentos/core/claim-control.md`, and `.intentos/core/assumption-register.md` when changing workflow behavior, release wording, public summaries, final reports, or handoffs.

Run these checks when available:

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
```

Do not treat reports, Review Packets, Goal Cards, or subagent output as approval. Do not describe simulated dogfood, generated-project smoke, or draft packs as production evidence. Record inferred or unconfirmed facts in an Assumption Register when they affect decisions, claims, release, environment, rollback, monitoring, or risk.

## Project Memory And Context Governance

Use `.intentos/core/context-governance.md` and `.intentos/core/git-boundary.md` when Codex observes reusable project context, finds stale context, or decides whether IntentOS artifacts should enter Git.

Codex may draft Learning Candidates, Context Correction Reports, and Git Boundary Reports. Technical source-of-truth changes use the controlled apply chain; ask the user only when the change alters real business meaning. Model memory must not override Git-backed source of truth.

## High-risk Boundaries

Stop the external or irreversible action and strengthen internal planning before:

- production release or deployment
- production environment variables or secrets
- authentication, session, token, cookie, or permission policy changes; Codex owns the technical design and asks only for missing business access rules
- database schema changes with production compatibility risk; Codex owns migration, test, backup, and rollback design
- destructive database migration or data cleanup
- production data access, export, repair, or migration
- irreversible, regulated, value-transfer, identity, safety-critical, or destructive decisions
- adding production dependencies; Codex owns necessity, compatibility, security, and rollback checks, and asks only about concrete cost/account effects
- changing infrastructure, DNS, TLS, CDN, WAF, hosting, or equivalent runtime config outside the local project

Ask the current user only when the next action creates a concrete production,
cost, real-user communication, provider-account, or irreversible real-data
effect. Do not ask the user to approve the technical plan itself.

## Review Focus

When reviewing changes, focus on:

- scope creep
- missing tests
- permission bypass
- data leakage
- unsafe migration
- architecture drift
- excessive dependencies
- unclear rollback

For dirty production-governed projects, respect `workflow-next` when it returns `REVIEW_DIRTY_WORKTREE` or `ADOPTION_MODE: GUARDED`. Codex must classify and preserve existing changes before task execution; ask the user only if two real business tasks conflict and priority cannot be inferred.

## Self-iteration Rules

- L1/L2/L3 work should create an AI task log.
- Daily automation should be scoped to this project root and may run `scripts/workflow-daily-summary.mjs`, but should only create draft workflow files when it reports `ACTION_REQUIRED`.
- Repeated workflow problems should become workflow improvements before intentos changes.
- Repeated execution patterns may become Skill candidates. Installing or enabling an active Skill requires a bounded plan and internal verification; ask for user consent only when it changes an external account, persistent environment, cost, or other concrete real-world effect.
- Proposed intentos changes must pass proposal review and `check-intentos.mjs`.

## Skill Governance

Use `.intentos/templates/skill-candidate.md` for candidate drafts and `.intentos/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.

## Automation Governance

- Codex may propose project-scoped automations during setup, release preparation, or workflow review.
- Proposals must be written in `automation-proposals/` using `.intentos/templates/project-automation-proposal.md`.
- Do not create, update, resume, delete, or enable a Codex App automation until its exact project root, schedule, prompt, allowed writes, initial status, rollback, and real-world effect are prepared. Ask the user for consent to that concrete scheduled effect, not for technical configuration choices.
- Do not attach project automation to a parent directory unless the user explicitly approves a multi-project monitor.

## Final Report

Every implementation response must include:

- Completed
- Verified
- Not changed
- Risks remaining
- Assumption Register when the result depends on inferred or unconfirmed facts
- Next-step suggestions with type, relation to current task, whether AI can do it now, required entry, and risk / approval
- Human decisions needed
- Next safe action
