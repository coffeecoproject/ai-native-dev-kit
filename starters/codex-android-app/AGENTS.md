# Android Project Agent Working Agreement

## Mission

This repository follows an AI-native, spec-first development workflow for Android app development.

Do not implement vague requests directly. Convert broad work into request, preflight, spec, eval, and task assets before implementation.

## Zero-Experience Solo Developer

Assume one non-technical user unless the repository proves otherwise. The user supplies business goals, real-world facts, preferences, and consent to concrete external effects. Codex owns architecture, baseline selection, implementation strategy, testing, review, evidence, repair, rollback preparation, and workflow routing.

Do not ask the user to choose technical stacks, profiles, packs, databases, tests, reviewers, subagents, hooks, checker commands, or internal workflow states. Internal responsibility domains are safety lenses, not separate people. Routine reversible project-local engineering may proceed after IntentOS internal gates; production changes, real cost, real-user communication, external-account actions, and irreversible data effects require explicit consent to that concrete effect. Silence is not consent.

Before external, GPT, or subagent review, read
`.intentos/core/review-context-authority.md`. Current product contracts override
compatibility schemas and historical records. Reject review recommendations
that add Solo/Team/Enterprise modes, delegate technical choices to the user,
turn owner-like fields into people the user must find, or expand product scope
merely because industrial safeguards exist.

## Core Rules

1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.
2. Every non-trivial change must have acceptance criteria before implementation.
3. Prefer vertical slices over broad rewrites.
4. Keep changes minimal and scoped.
5. Codex must evaluate production dependencies internally and prove necessity, compatibility, security, and rollback; ask the user only when the dependency creates a concrete external cost or account effect.
6. Auth, permission, persistence migration, production config, secrets, signing, manifest exported components, and security-sensitive work requires stricter internal planning, testing, review, evidence, and rollback. Ask the user only for missing business facts or consent to a concrete real-world effect.
7. Every implementation must include tests or explain why tests are not applicable.
8. If the same verification failure repeats twice, stop and report instead of blindly retrying.
9. After implementation, produce a bounded final report with completed work, verification, unchanged scope, risks remaining, classified next-step suggestions, human decisions needed, and next safe action.

## Task Levels

- L0: docs, formatting, simple low-risk local UI change; direct implementation plus verification.
- L1: ordinary local Kotlin/Java/Compose/XML behavior; spec, task, verification.
- L2: cross-module state, networking contract, persistence, runtime permission, dependency, or release risk; preflight, spec, eval, review.
- L3: signing, keystore, Play Console release, sensitive permissions, destructive migration, value-transfer, regulated data, production config, bundle/APK upload; full internal workflow, with exact user consent only for the prepared real-world effect.

If unsure, use the higher level.

## Bootstrap Entry

When the user asks to configure, apply, initialize, inject, install, or bootstrap the IntentOS workflow, treat that as execution bootstrap intent.

Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.

When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.

For bootstrap work, first use `.intentos/prompts/bootstrap-agent.md` when present, then run:

```bash
node scripts/workflow-next.mjs .
```

Follow the reported `NEXT_ACTION`. Apply a migration report only after bounded-plan, authority, rollback, and controlled-readiness checks pass; do not ask the user to approve technical contents.

## Beginner Entry

When the user gives one natural-language goal, asks what to do next, or does not know which workflow command to choose, start with Beginner Entry:

```bash
node scripts/cli.mjs ask . "<user goal>"
node scripts/cli.mjs ask-check .
```

Beginner Entry returns one plain card with what Codex understood and the next safe action. It must not expose technical workflow choices. Codex chooses profiles, baselines, checks, review depth, and internal routing. The user is asked only for missing business facts or consent to a concrete real-world effect. The card itself remains read-only and does not silently authorize release or production effects.

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

## Apply Execution Receipt

After a controlled IntentOS init/update apply, run `node scripts/cli.mjs apply-receipt-check . --require-structured-evidence` before claiming that approved adoption writes were executed or remain active. The receipt proves exact governance replay and read-only workflow activation only; it does not approve implementation, CI/hooks, release, production, or authority changes.

## Release Approval Record

Before any real release handoff or assisted execution state, run `node scripts/cli.mjs release-approval-check . --require-structured-evidence --require-approved`. Only a current project-bound structured human approval for the exact revision, candidate, target, package identity, and strict release evidence chain is release authority. High-risk release actions remain human or external-system owned.

## Controlled Apply Readiness

Use `.intentos/core/controlled-apply-readiness.md` after a Unified Apply Plan exists and before any bounded controlled apply. Codex owns the internal technical decision; ask the user only for missing business facts or a prepared real-world effect.

Run:

```bash
node scripts/cli.mjs apply-readiness . --plan <apply-plan-path> --git-state <clean|dirty>
node scripts/cli.mjs apply-readiness-check .
```

Controlled Apply Readiness checks whether the plan is low-risk, bounded, reversible, verifiable, and authorized by the requested outcome. It does not authorize production or external effects by itself.

## Project Hook Policy

Use `.intentos/core/hook-policy.md` before proposing hook installation, CI hook changes, blocking gates, scheduled jobs, external reviewer hooks, token use, or auto-fix hooks.

Run:

```bash
node scripts/cli.mjs hook-policy .
node scripts/cli.mjs hook-policy-check .
```

A Project Hook Policy records allowed H0/H1/H2/H3 hook classes, approval owners, and rollback / disable rules. It does not install hooks, modify CI, add blocking gates, call external APIs, store tokens or secrets, enable auto-fix, approve implementation/release/production, or replace Hook Orchestration.

## Project Onboarding

Before the first non-trivial implementation, run project onboarding.

Use `.intentos/prompts/project-onboarding-agent.md` and `.intentos/core/project-onboarding.md` to draft:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`

AI owns drafting, comparison, consistency checks, and document updates. Humans own decisions.

Do not ask the user to manually fill onboarding files or confirm technical choices. Derive them from evidence and ask only for unavailable business facts, product preferences, exact real-world consent, or external facts.

Do not start broad feature implementation until onboarding is ready or the user explicitly approves a narrow L0/L1 exception.

Check onboarding with:

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-project-onboarding.mjs . --strict
```

## Engineering Baseline

Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.intentos/core/engineering-baseline.md` when present.

Run:

```bash
node scripts/check-engineering-baseline.mjs .
```

Codex may follow existing local patterns for low-risk local changes.

Codex must not create or upgrade project-wide engineering conventions without a documented project source of truth, bounded decision brief, and required internal review evidence.

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

Use `node scripts/resolve-platform-baseline.mjs .` to inspect the effective baseline. Use strict mode only after selected profiles and project documents are derived and verified from evidence.

## Industrial Baseline

Baseline level describes project governance strength: `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`. It is separate from task level `L0` / `L1` / `L2` / `L3`.

Run:

```bash
node scripts/check-industrial-pack.mjs .
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
```

Do not treat BL2 or any industrial pack as active until baseline level, selected packs, exceptions, residual risks, compatibility, and evidence pass the internal baseline gates. Use `.intentos/templates/baseline-selection.md` and `.intentos/templates/baseline-evidence.md` to record that derivation.

## Standard Baseline Packs

Use `.intentos/core/standard-baseline-pack-registry.md` and `.intentos/docs/standard-baseline-pack-registry.md` when normal engineering baseline packs need to be selected before considering BL2 industrial overlays.

Run:

```bash
node scripts/resolve-standard-baseline.mjs .
node scripts/check-standard-baseline-selection.mjs .
```

Codex may recommend standard packs, but it must not treat recommendations as pack activation, target-project write approval, implementation approval, release approval, or compliance/security/privacy approval.

Before recommending standard packs, read `.intentos/standard-baseline-packs/selection-guide.md` when present. Select the smallest relevant pack set by platform and BL level; do not select backend, release, industrial overlays, or all packs by default. Recommend platform packs first and keep backend/release conditional.

## Baseline Pack System

Use `.intentos/core/baseline-pack-system.md` and `.intentos/docs/baseline-pack-system.md` when project profile, BL level, standard packs, industrial packs, or risk overlays need to be selected.

Codex selects the smallest evidence-backed candidate pack set. It must not select all packs, treat draft packs as stable, or treat pack files as real project evidence. Standard packs are normal engineering guardrails; industrial packs are optional BL2 overlays enabled only by internal evidence and compatibility gates.

Optional artifacts:

```bash
node scripts/new-workflow-item.mjs --type standard-baseline-selection-report --name <project-standard-baseline>
node scripts/new-workflow-item.mjs --type baseline-pack-selection-report --name <project-baseline-packs>
```

Run `node scripts/resolve-standard-baseline.mjs .` for a standard baseline recommendation, `node scripts/cli.mjs baseline-packs .` for the umbrella recommendation, and selection checkers when reports exist.

## Workflow Artifact Generation

Use `scripts/new-workflow-item.mjs` to create numbered request, preflight, spec, eval, task, AI task log, review packet, GPT review prompt, review loop report, goal card, follow-up proposal, and final report files instead of hand-copying templates.

Before implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

For high-risk implementation, run:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>
```

If any Risk Gate item is checked, derive the stricter task route, verification, review, evidence, rollback, and apply boundaries before implementation. Ask the user only for an unavailable business fact or one prepared real-world effect.

If artifact quality fails, fix the workflow artifacts before writing code.

When independent review is needed, run `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` and fill the packet before handing the change to a human reviewer or second model. A review packet is not approval.

## Guided Decision & Delivery Loop

Use `.intentos/core/decision-delegation-boundary.md`, `.intentos/core/guided-delivery-loop.md`, and `.intentos/prompts/delivery-coach-agent.md` when the user gives a broad idea, mixes side ideas into current work, or should not be asked to answer raw technical choices.

Recommend the smallest safe path first, explain what stays out of scope, and park side ideas instead of executing them.

Optional artifacts:

```bash
node scripts/new-workflow-item.mjs --type active-work-thread --name <current-mainline>
node scripts/new-workflow-item.mjs --type guided-decision-summary --name <decision-name>
node scripts/check-guided-delivery-loop.mjs .
```

These artifacts do not approve implementation, release, production, payment, privacy, security, compliance, migration, or target-project writes.

## Change Boundary And Baseline State

Use `.intentos/core/change-boundary.md` when a task needs proof that actual changed files stayed inside approved scope.

Use `.intentos/core/baseline-state.md` when Codex drafts or reviews baselines before implementation evidence exists.

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

Create a Subagent Run Plan with:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
node scripts/check-subagent-orchestration.mjs .
```

Close or skip every subagent after handoff. Do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot after its output is consumed.

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

## Business Rule Closure

Use Business Rule Closure before turning a user-requested business rule, validation rule, permission rule, status transition, integration behavior, or high-risk domain wording into implementation.

Run:

```bash
node scripts/cli.mjs business-rule . --intent "<business rule>"
node scripts/cli.mjs business-rule-check . --allow-empty
```

A Business Rule Closure Card records the actor, trigger, success path, failure path, feedback, enforcement layer, data behavior, safe defaults, limited user decisions, existing-rule conflicts, and real-environment validation expectation. It is a generic task-communication layer; contract, tax, finance, HR, legal, payment, privacy, compliance, migration, production, and customer-data wording is only example or risk-signal language unless the current project explicitly owns that domain.

A Business Rule Closure Card does not write files, authorize implementation, approve release or production, approve high-risk domain decisions, or prove real-environment behavior.

## Change Impact Coverage

Use `.intentos/core/change-impact-coverage.md` when a task changes validation rules, form restrictions, API behavior, backend/domain rules, data model, permissions, error copy, or any user-visible business rule.

Run:

```bash
node scripts/cli.mjs impact-coverage . --intent "<user request>"
node scripts/cli.mjs impact-coverage-check .
```

Codex selects affected surfaces from the request and project signals. The human should not need to choose technical surfaces manually.

Every Change Impact Coverage Report must close or decision-bind likely affected surfaces such as `USER_FLOW`, `FRONTEND_UI`, `API_CONTRACT`, `BACKEND_RULE`, `ERROR_COPY`, `TEST_COVERAGE`, and `DOCS_HANDOFF`. High-risk `DATA_MODEL`, `PERMISSION_RISK`, and `RELEASE_IMPACT` surfaces require concrete exclusion reasons or human decision.

Use `--require-structured-evidence --mode closure --strict-evidence` for new strict close-out records when the task has already been implemented.

A Change Impact Coverage Report is read-only planning and close-out evidence. It does not write files, approve implementation, approve release or production, replace Safe Launch, or prove every possible impact was found.

## Review Loop

For L2/L3 work or when review findings need closure, run `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>`. Record review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items. AUTO_FIX is limited to 2 rounds and must stay inside approved task scope.

If GPT Pro or a second model is used for review, run `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` and pair it with the Review Packet. The reviewer is read-only and must not approve risk, release, scope, architecture, dependencies, migrations, production config, Human Approval, or Approval scope.

When a Review Loop Report exists, run `node scripts/check-review-loop.mjs . --task <task-card>` before closure.

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

Stop the external or irreversible action and strengthen internal planning, tests, review, evidence, and rollback before:

- signing, keystore, Play Console, or production release changes
- manifest exported component or permission changes
- Play Billing or value-transfer behavior
- destructive local data migration
- production API endpoint changes
- background service or notification behavior changes
- Data Safety, privacy, or tracking behavior changes
- release bundle/APK upload operations

Ask the current user only for a missing business fact or consent to a concrete production, cost, real-user communication, provider-account, store-submission, or irreversible real-data effect. Do not ask the user to choose the technical solution.

## Task Execution Rules

When a task card exists:

1. Read `AGENTS.md`.
2. Read the linked spec.
3. Read the linked eval if present.
4. Follow allowed and forbidden scope.
5. Respect stop conditions.
6. Run requested verification.
7. Report evidence and remaining risk.

## Required Preflight Output

Before coding vague or high-risk work, output:

- Problem summary
- Missing information
- Assumptions
- Non-goals
- Risk areas
- Suggested task split
- Acceptance criteria
- Test plan
- Ready / not ready decision

## Verification

Default command:

```bash
bash scripts/verify.sh
```

Update `scripts/verify.sh` after Gradle wrapper, variants, and test commands are known.

## Self-iteration Rules

1. L1/L2/L3 work should create an `ai-logs/` entry.
2. L2/L3 work must create an `ai-logs/` entry.
3. Milestones or meaningful task batches should create `workflow-retros/` entries.
4. Repeated workflow problems should create `workflow-improvements/` entries.
5. Repeated execution patterns may create `skill-candidates/` entries.
6. Skill candidates must not install or enable active Skills without a bounded plan and internal verification; ask for consent only when the action changes a persistent environment, external account, cost, or other concrete real-world effect.
7. Proposed changes back to the shared IntentOS must be written as `intentos-proposals/` first.
8. Project-specific lessons stay in project docs or project `AGENTS.md`.
9. Core workflow changes require core purity review and `check-intentos.mjs`.

Learning summary command:

```bash
node scripts/summarize-ai-logs.mjs .
```

Daily summary check:

```bash
node scripts/workflow-daily-summary.mjs . --write-state
```

Codex App automation should be scoped to this project root, not the shared intentos directory or a broad parent directory.

Only create daily retro, workflow improvement, or Skill candidate drafts when the daily summary reports `ACTION_REQUIRED`.

## Skill Governance

Use `.intentos/templates/skill-candidate.md` for candidate drafts and `.intentos/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.

## Automation Governance

Codex may propose project-scoped automations during setup, release preparation, or workflow review.

Use `automation-proposals/` and `.intentos/templates/project-automation-proposal.md` before creating or updating any Codex App automation. Prepare the exact project root, schedule, prompt, allowed writes, initial status, rollback, and effect, then ask for consent to that concrete scheduled effect rather than technical configuration approval.

## Review Focus

When reviewing changes, focus on:

- scope creep
- missing tests
- permission bypass
- data leakage
- unsafe migration
- lifecycle regression
- signing/manifest drift
- Play policy risk
- excessive dependencies
- unclear rollback

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
