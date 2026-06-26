# Project Agent Working Agreement

## Mission

This repository follows an AI-native, spec-first development workflow.

Do not implement vague requests directly. Convert broad work into request, preflight, spec, eval, and task assets before implementation.

## Core Rules

1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.
2. Every non-trivial feature must have acceptance criteria before implementation.
3. Prefer vertical slices over broad rewrites.
4. Keep changes minimal and scoped.
5. Do not add production dependencies without explicit approval.
6. Do not modify auth, permission, migration, production config, secrets, high-risk, or security-sensitive logic without a risk report and explicit approval.
7. Every implementation must include tests or explain why tests are not applicable.
8. If the same verification failure repeats twice, stop and report instead of blindly retrying.
9. After implementation, produce a bounded final report with completed work, verification, unchanged scope, risks remaining, classified next-step suggestions, human decisions needed, and next safe action.

## Task Levels

- L0: small text/style/low-risk bug; direct implementation plus verification.
- L1: ordinary feature; spec, task, verification.
- L2: cross-module, permission, data, architecture, dependency, or release risk; preflight, spec, eval, review.
- L3: irreversible, regulated, value-transfer, production migration, destructive operation, regulated data, secrets, production config; full workflow and explicit human approval.

If unsure, use the higher level.

## Bootstrap Entry

When the user asks to configure, apply, initialize, inject, install, or bootstrap the AI Native workflow, treat that as execution bootstrap intent.

Execution bootstrap intent allows workflow and governance asset setup only. Do not modify business code during bootstrap.

When the user asks to look, review, evaluate, discuss, or not execute yet, treat that as discussion-only intent and do not write files.

For bootstrap work, first use `.ai-native/prompts/bootstrap-agent.md` when present, then run:

```bash
node scripts/workflow-next.mjs .
```

Follow the reported `NEXT_ACTION`. Stop for human approval before applying any migration report.

## Project Onboarding

Before the first non-trivial implementation, run project onboarding.

Use `.ai-native/prompts/project-onboarding-agent.md` and `.ai-native/core/project-onboarding.md` to draft:

- `docs/project-onboarding.md`
- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/sample-policy.md`
- `docs/onboarding-decisions.md`

AI owns drafting, comparison, consistency checks, and document updates. Humans own decisions.

Do not ask the human to manually fill all onboarding files. Ask focused questions, propose options, record assumptions, and request confirmation.

Do not start broad feature implementation until onboarding is ready or the user explicitly approves a narrow L0/L1 exception.

Check onboarding with:

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-project-onboarding.mjs . --strict
```

## Engineering Baseline

Before structural, typing, schema, API, domain, permission, migration, dependency, or state-model changes, read `docs/engineering-baseline.md` and `.ai-native/core/engineering-baseline.md` when present.

Run:

```bash
node scripts/check-engineering-baseline.mjs .
```

Codex may follow existing local patterns for low-risk local changes.

Codex must not create or upgrade project-wide engineering conventions without a documented project source of truth or human approval.

If the engineering baseline is missing or ambiguous, record the gap and create a Decision Brief before changing structure, contracts, schema, permission, generated type sources, dependencies, migrations, or cross-module state patterns.

## Platform Baseline

Before the first non-trivial implementation, select target runtime profiles in `docs/project-profile.md` under `Selected Profiles`.

Run:

```bash
node scripts/check-platform-baseline.mjs .
```

Use `node scripts/resolve-platform-baseline.mjs .` to inspect the effective baseline. Use strict mode only after humans confirm selected profiles and project docs.

## Industrial Baseline

Baseline level describes project governance strength: `BL0_LIGHTWEIGHT`, `BL1_STANDARD`, or `BL2_INDUSTRIAL`. It is separate from task level `L0` / `L1` / `L2` / `L3`.

Run:

```bash
node scripts/check-industrial-pack.mjs .
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs .
```

Do not treat BL2 or any industrial pack as accepted until humans confirm baseline level, selected packs, exceptions, residual risk acceptance, and `check-industrial-baseline` is no worse than pending. Use `.ai-native/templates/baseline-selection.md` and `.ai-native/templates/baseline-evidence.md` as project docs only after that decision.

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

If any Risk Gate item is checked, `Human Approval` status and `Approval scope` must be recorded before implementation.

If artifact quality fails, fix the workflow artifacts before writing code.

When independent review is needed, run `node scripts/new-workflow-item.mjs --type review-packet --task <task-card>` and fill the packet before handing the change to a human reviewer or second model. A review packet is not approval.

## Goal Mode

Use `.ai-native/core/goal-mode.md` and `.ai-native/prompts/goal-planner-agent.md` when the human request is broad, ambiguous, high-risk, or can route into multiple workflows.

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

Use `.ai-native/core/subagent-orchestration.md` when helper agents are used for planning, read-only research, review, repair analysis, or reporting.

The default rule is: many readers, one writer. Subagent output is input, not authority. The main thread remains responsible for writes, verification, and final reporting.

Create a Subagent Run Plan with:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
node scripts/check-subagent-orchestration.mjs .
```

Close or skip every subagent after handoff. Do not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot after its output is consumed.

## Review Loop

For L2/L3 work or when review findings need closure, run `node scripts/new-workflow-item.mjs --type review-loop-report --task <task-card>`. Record review rounds, AUTO_FIX attempts, verification, repeated issues, and human-decision items. AUTO_FIX is limited to 2 rounds and must stay inside approved task scope.

If GPT Pro or a second model is used for review, run `node scripts/new-workflow-item.mjs --type gpt-review-prompt --task <task-card>` and pair it with the Review Packet. The reviewer is read-only and must not approve risk, release, scope, architecture, dependencies, migrations, production config, Human Approval, or Approval scope.

When a Review Loop Report exists, run `node scripts/check-review-loop.mjs . --task <task-card>` before closure.

## Bounded Next-Step

Use `.ai-native/core/next-step-boundary.md` before reporting suggestions, review follow-ups, or final next actions.

Codex may suggest next steps, but suggestions must be bounded, classified, and actionable.

Allowed suggestion types:

- `IN_SCOPE_NEXT_STEP`: inside current task scope and safe to do now when no new approval is needed.
- `DIRECT_FOLLOW_UP`: related but outside current scope; create a new request or `follow-up-proposal`.
- `RISK_DECISION`: requires human decision and preflight before implementation.
- `OUT_OF_SCOPE_OBSERVATION`: record as context only, not immediate work.
- `DO_NOT_PROCEED`: unsafe or unauthorized under current scope.

Only `IN_SCOPE_NEXT_STEP` may be handled inside the current task. Do not implement `DIRECT_FOLLOW_UP`, `RISK_DECISION`, `OUT_OF_SCOPE_OBSERVATION`, or `DO_NOT_PROCEED` unless the human opens a new entry point and approves the needed scope.

When next-step suggestions are recorded, run `node scripts/check-next-step-boundary.mjs . --task <task-card>`.

## Output Experience

Use `.ai-native/core/output-protocol.md` and `.ai-native/prompts/reporter-agent.md` when reporting workflow, baseline, adoption, review, release, or automation status.

Human-facing output must lead with a human summary, current status, decision needed, next safe step, what AI can do, and what AI must not do. Keep technical fields, paths, commands, and audit notes after that.

Use `.ai-native/core/glossary.md` to translate internal workflow terms when the user may not know them.

## High-risk Boundaries

Stop and ask before:

- production release or deployment
- production environment variables or secrets
- authentication, session, token, cookie, or permission policy changes
- database schema changes with production compatibility risk
- destructive database migration or data cleanup
- production data access, export, repair, or migration
- irreversible, regulated, value-transfer, safety-critical, or regulated-data decisions
- adding production dependencies
- changing infrastructure, DNS, TLS, CDN, WAF, or hosting config

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

Update `scripts/verify.sh` when the stack is chosen.

## Self-iteration Rules

1. L1/L2/L3 work should create an `ai-logs/` entry.
2. L2/L3 work must create an `ai-logs/` entry.
3. Milestones or meaningful task batches should create `workflow-retros/` entries.
4. Repeated workflow problems should create `workflow-improvements/` entries.
5. Repeated execution patterns may create `skill-candidates/` entries.
6. Skill candidates must not create, update, install, enable, or rely on active Skills without explicit human approval.
7. Proposed changes back to the shared dev kit must be written as `dev-kit-proposals/` first.
8. Project-specific lessons stay in project docs or project `AGENTS.md`.
9. Core workflow changes require core purity review and `check-dev-kit.mjs`.

Learning summary command:

```bash
node scripts/summarize-ai-logs.mjs .
```

Daily summary check:

```bash
node scripts/workflow-daily-summary.mjs . --write-state
```

Codex App automation should be scoped to this project root, not the shared dev-kit directory or a broad parent directory.

Only create daily retro, workflow improvement, or Skill candidate drafts when the daily summary reports `ACTION_REQUIRED`.

## Skill Governance

Use `.ai-native/templates/skill-candidate.md` for candidate drafts and `.ai-native/checklists/skill-review.md` before any Skill generation or update. Do not write to `.codex/skills/` unless the user explicitly approves that exact Skill.

## Automation Governance

Codex may propose project-scoped automations during setup, release preparation, or workflow review.

Use `automation-proposals/` and `.ai-native/templates/project-automation-proposal.md` before creating or updating any Codex App automation. Do not create, update, resume, delete, or enable automations without explicit human approval for the exact project root, schedule, prompt, allowed writes, and initial status.

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

## Final Report

Every implementation response must include:

- Completed
- Verified
- Not changed
- Risks remaining
- Next-step suggestions with type, relation to current task, whether AI can do it now, required entry, and risk / approval
- Human decisions needed
- Next safe action
