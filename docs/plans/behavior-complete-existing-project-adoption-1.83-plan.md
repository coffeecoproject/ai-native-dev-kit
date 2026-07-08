# Behavior-Complete Existing Project Adoption 1.83 Plan

## Purpose

1.83 should solve the gap between partial adoption and reliable task execution:

```text
An old project may not install all IntentOS assets,
but Codex must still execute every task with the right level of IntentOS discipline.
```

The goal is not to force full native adoption. The goal is behavior-complete adoption:

```text
Keep project-owned strong governance.
Classify each task as LOW, MEDIUM, POSSIBLE_HIGH, or HIGH.
Use lightweight governance for low-risk tasks.
Use stronger planning and verification for medium tasks.
Use the full IntentOS behavior chain for high-impact tasks.
Upgrade the task immediately when impact expands.
Do not require users to ask for plans, impact coverage, business closure, verification, evidence, or close-out.
```

This prevents two failure modes:

- high-impact work being treated like a small patch;
- low-impact work being overburdened by heavyweight governance.

## Implementation Sequencing

1.83 depends on the adoption-depth result from 1.82.

Before implementing the full 1.83 behavior layer, 1.82 must reliably handle:

- source blockers;
- dirty or unsafe project state;
- project authority blockers;
- maturity-to-recommendation consistency;
- low-risk calibration.

Recommended sequence:

```text
1.82.1 Source Blocker And Maturity Matrix Hardening
1.83.0 Task Impact Tier Classifier
1.83.1 Source Binding And Project-Native Evidence Mapping
1.83.2 Behavior-Complete Existing Project Enforcement
```

This document defines the full 1.83 direction, but 1.83.0 should start narrow:

```text
classify task tier
map required governance for that tier
produce a plain next step
do not authorize implementation
do not create a parallel completion system
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `core/existing-project-safe-adoption-autopilot.md`
- `docs/existing-project-safe-adoption-autopilot.md`
- `docs/controlled-native-adoption-autopilot-review.md`
- `docs/business-rule-closure.md`
- `docs/change-impact-coverage.md`
- `docs/verification-test-governance.md`
- `docs/test-evidence-binding.md`
- `docs/execution-assurance.md`
- `docs/completion-evidence-gate.md`
- `docs/unified-closure-model.md`
- `docs/adoption-execution-assurance.md`
- `docs/approval-record-governance.md`
- `docs/controlled-apply-readiness.md`
- `docs/work-queue.md`
- `docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md`
- `docs/plans/controlled-native-adoption-autopilot-review-1.82-plan.md`
- `scripts/cli.mjs`
- `scripts/resolve-existing-project-adoption-autopilot.mjs`
- `scripts/resolve-controlled-native-adoption-review.mjs`
- `scripts/check-controlled-native-adoption-review.mjs`
- `scripts/check-intentos.mjs`

WorkControl and other real-project observations may be used only as calibration evidence. They must not become hard-coded project behavior.

## Current Baseline

After 1.81 and 1.82, an existing project may reach:

```text
PARTIAL_ADOPTION
ADAPTER_ONLY
ACTIVE_FOR_PLANNING_AND_REVIEW
```

This is enough for Codex to know IntentOS is available, but it may still leave a practical gap:

```text
For real feature work, Codex might not always choose the correct governance strength.
```

1.83 should close that gap without requiring full native asset installation.

## Problem Statement

### Problem 1: Partial Adoption Can Still Be Too Advisory

Partial adoption can tell Codex:

```text
Use IntentOS planning/review behavior.
```

But it may not force Codex to:

- classify the task tier;
- enforce low-task scope control;
- require short plans for medium tasks;
- close business rules first for high-impact tasks;
- cover affected surfaces;
- require a verification plan;
- require test evidence binding before completion claims;
- avoid patch-style state-machine fixes;
- produce final close-out through the existing closure system.

1.83 must convert advisory behavior into mandatory behavior for every task tier.

### Problem 2: Users Should Not Need To Ask For Plans

The user may say:

```text
做这个功能。
```

Codex should decide whether the task is low, medium, possible high, or high impact, then automatically select the correct governance path.

The user should not need to say:

```text
先落方案文档。
```

### Problem 3: Low And Medium Tasks Still Need Correctness Guarantees

Low and medium tasks should not use the full high-impact chain, but they still need:

- scope boundaries;
- no unrelated edits;
- minimal or targeted verification;
- clear close-out;
- escalation if impact expands.

1.83 must avoid both under-governance and over-governance.

### Problem 4: 1.83 Must Not Become A Parallel Completion System

IntentOS already has:

- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan Governance;
- Test Evidence Binding;
- Execution Assurance;
- Completion Evidence Gate;
- Unified Closure;
- User Delivery Console.

1.83 must be a task-tier governance trigger, router, and gate.

It must not redefine a separate completion system.

### Problem 5: Full Native Adoption Is Not Always Appropriate

Some old projects have strong existing governance that should remain project-owned.

1.83 must enforce IntentOS behavior without requiring:

- `.intentos/` installation;
- `AGENTS.md` replacement;
- CI/release takeover;
- production governance replacement;
- full native asset migration.

## Scope Split

### 1.83.0: Task Impact Tier Classifier

1.83.0 should be read-only and non-authorizing.

It should:

- classify task impact as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`;
- record confidence and trigger evidence;
- map required governance for the tier;
- map project-native evidence equivalents;
- produce a plain next step;
- refuse implementation authorization.

It should not:

- write target files;
- approve implementation;
- approve commit/push;
- execute tests;
- run migrations;
- modify CI/hooks;
- claim completion.

### 1.83.1: Source Binding And Project-Native Evidence Mapping

1.83.1 should bind task-tier governance to existing artifacts:

- scope check or short plan for low/medium tasks;
- `business_rule_closure_ref` for high-impact tasks;
- `change_impact_coverage_ref`;
- `execution_plan_ref`;
- `verification_plan_ref`;
- `test_evidence_ref`;
- `execution_assurance_ref`;
- `completion_evidence_ref`.

It should verify source refs, digests, task matching, and current intent matching.

### 1.83.2: Behavior-Complete Existing Project Enforcement

1.83.2 may integrate behavior-complete checks into existing-project workflows so tasks cannot proceed or close with the wrong governance tier.

It must still preserve project-owned authority and must not force full native adoption.

## Core Concept

### Behavior-Complete Adoption

Behavior-complete adoption means:

```text
The project may remain partial or adapter-only at the asset level,
but Codex must follow IntentOS task behavior for the task's actual risk level.
```

It is different from full native adoption:

| Dimension | Partial advisory adoption | Behavior-complete adoption | Full native adoption |
| --- | --- | --- | --- |
| Codex knows IntentOS is available | yes | yes | yes |
| Task tier classification is mandatory | maybe | yes | yes |
| Low tasks have scope and minimal verification | maybe | yes | yes |
| Medium tasks have short plan and targeted verification | maybe | yes | yes |
| High-impact task governance is mandatory | maybe | yes | yes |
| Verification/Test Evidence is required before high-impact completion | maybe | yes | yes |
| `.intentos/` installed | no | not required | likely |
| Project CI/release replaced | no | no | only if approved |
| Existing stronger project rules preserved | yes | yes | yes, if reconciled |

## Task Governance Tiers

### LOW

LOW tasks are small, local, and non-behavioral.

Examples:

- copy text changes;
- typo fixes;
- isolated visual spacing or style changes;
- non-authoritative documentation cleanup;
- static label changes with no business logic impact.

LOW tasks must not touch:

- DB;
- API;
- runtime state;
- permissions;
- business rules;
- review/approval/settlement;
- release or production config;
- tests or infrastructure unless the task is specifically about tests/docs.

Required flow:

```text
Scope Check
-> Minimal Change
-> Minimal Verification
-> Close-Out
```

Required evidence:

- task classified as LOW with reason;
- changed scope listed;
- verification performed or concrete reason why not;
- statement of what was not changed.

### MEDIUM

MEDIUM tasks are localized but may affect behavior in a bounded surface.

Examples:

- a local frontend interaction;
- a list filter or display rule;
- a small non-critical API parameter;
- a local validation rule without DB/runtime/permission impact;
- a component-level behavior change.

Required flow:

```text
Short Plan
-> Surface Check
-> Targeted Verification
-> Evidence Summary
-> Close-Out
```

Required evidence:

- task classified as MEDIUM with reason;
- affected surfaces listed;
- short plan;
- targeted verification;
- no high-impact surface detected, or escalation recorded.

### POSSIBLE_HIGH

POSSIBLE_HIGH tasks have incomplete information but credible high-impact signals.

Codex must not treat them as LOW or MEDIUM until clarified.

Required behavior:

```text
stop direct implementation
ask a plain-language clarification or perform read-only inspection
classify as HIGH or downgrade with evidence
```

Allowed prompt:

```text
这个需求可能影响数据、状态或权限。我先做只读检查来确认影响范围，不直接改代码。
```

### HIGH

A task is HIGH if it touches or may affect any of:

- DB schema or migrations;
- API contract or DTO/domain boundaries;
- runtime workflow state machine;
- review, approval, settlement, billing, payment, finance, tax, HR, permission, or compliance behavior;
- release, rollback, production, CI, hooks, or deployment;
- authentication, authorization, audit, data access, customer data, or privacy;
- scheduled jobs, generated tasks, recurring workflows, background jobs, or snapshot logic;
- cross-surface UI/backend behavior;
- existing production behavior;
- long-lived task queues, work queues, or close-out state.

For HIGH tasks, Codex must not jump straight to implementation.

Required flow:

```text
Task Intake
-> Business Rule Closure
-> Change Impact Coverage
-> Execution Plan
-> Verification Plan
-> Implementation
-> Test Evidence Binding
-> Execution Assurance
-> Completion Evidence / Unified Close-Out
```

Business Rule Closure comes before Change Impact Coverage because Codex must understand the business rule before it can correctly determine impacted surfaces.

1.83 should not create a replacement close-out. It should require and reference the existing closure and evidence systems.

## Upgrade Rules

Codex must upgrade LOW or MEDIUM to POSSIBLE_HIGH or HIGH when it discovers:

- DB schema, migrations, persistence, or backfill work;
- API contract or DTO/domain boundary changes;
- runtime state-machine or workflow transition changes;
- review, approval, settlement, billing, permission, finance, tax, HR, or compliance behavior;
- authentication, authorization, audit, data access, privacy, or customer data effects;
- release, rollback, production, CI, hook, deployment, or environment impact;
- scheduled, recurring, generated, or background task effects;
- shared logic refactor required to make the fix correct;
- tests or verification reveal a broader affected surface;
- the initial low/medium classification cannot be defended with evidence.

Upgrade behavior:

```text
stop expanding implementation
record why the task was upgraded
switch to the stronger required flow
ask only plain-language permission when required
```

Disallowed behavior:

```text
continue patching after discovering a high-impact surface
```

## Machine-Readable Evidence Model

1.83 should add a task governance report.

Suggested artifact:

```text
task-governance-reports/<id>.md
```

Suggested machine-readable shape:

```json
{
  "schema_version": "1.83.0",
  "artifact_type": "task_governance",
  "intent": "Add optional no-review workflow steps",
  "intent_digest": "sha256:...",
  "task_ref": "tasks/...",
  "project_adoption_mode": "partial",
  "impact_classification": {
    "task_impact": "HIGH",
    "confidence": "high",
    "triggered_surfaces": ["runtime workflow state machine", "review center", "settlement"],
    "trigger_evidence": ["step submission changes status", "last step enters settlement"],
    "low_impact_reason": "",
    "medium_impact_reason": "",
    "upgrade_history": []
  },
  "required_governance": {
    "scope_check_required": "Yes",
    "short_plan_required": "No",
    "business_rule_closure_required": "Yes",
    "change_impact_coverage_required": "Yes",
    "execution_plan_required": "Yes",
    "verification_plan_required": "Yes",
    "test_evidence_required": "Yes",
    "execution_assurance_required": "Yes",
    "completion_evidence_required": "Yes"
  },
  "source_chain": [],
  "existing_project_mapping": [],
  "readiness": {
    "can_start_implementation": "No",
    "can_claim_done": "No",
    "blocked_by": ["missing business rule closure", "missing verification plan"]
  },
  "user_prompt": {
    "plain_next_step": "这个需求会影响任务推进和结算链路。我会先写执行方案和验证清单，再实现。",
    "technical_terms_required": "No"
  },
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "executes_migrations": "No",
    "changes_ci_or_hooks": "No"
  }
}
```

### Impact Classification

Impact classification must be evidence-bound:

- `HIGH`: confirmed high-impact surfaces exist;
- `POSSIBLE_HIGH`: insufficient evidence, but risk signals exist;
- `MEDIUM`: bounded behavioral change with no high-impact surface;
- `LOW`: no behavioral or high-impact surface detected, with a concrete reason.

LOW and MEDIUM classifications must include reasons.

Examples:

```text
LOW because only user-facing copy changed; no DB/API/runtime/permission/release behavior affected.
```

```text
MEDIUM because the change affects one list filter; API contract, DB, permission, runtime state, and release surfaces are unchanged.
```

### Source Chain

The source chain should reference existing IntentOS artifacts or project-native equivalents.

Each source should include:

- `name`;
- `status`;
- `ref`;
- `digest`;
- `state`;
- `current_task_match`;
- `not_applicable_reason` when applicable.

The checker must verify:

- ref resolves;
- digest matches;
- task or intent matches;
- required source state is ready;
- not-applicable has a concrete reason.

### Existing Project Mapping

1.83 must support project-native evidence instead of forcing IntentOS artifact duplication.

Suggested shape:

```json
{
  "existing_project_mapping": [
    {
      "required_behavior": "Business Rule Closure",
      "project_native_evidence_ref": "artifact:docs/rfc-123.md",
      "mapping_state": "MATCHED",
      "reason": "RFC describes user-visible rule, backend rule, edge cases, and audit behavior."
    }
  ]
}
```

Allowed mapping states:

- `MATCHED`
- `WEAKER`
- `STRONGER`
- `MISSING`
- `NEEDS_OWNER`

## Execution Plan Is Not Apply Plan

For high-impact tasks, `execution_plan_required` means:

```text
Codex must have a durable plan before implementation.
```

It does not mean:

```text
Codex is approved to write code.
```

The report should distinguish:

```json
{
  "execution_plan_required": "Yes",
  "execution_plan_ref": "artifact:docs/plans/step-review-policy.md",
  "execution_plan_type": "project_native",
  "execution_plan_authorizes_write": "No"
}
```

If implementation is requested later, the normal apply/approval/execution chain still applies.

## Verification And Test Evidence Wiring

1.83 must reuse existing verification and test evidence systems:

- LOW tasks require minimal verification or a concrete reason when verification is not applicable.
- MEDIUM tasks require targeted verification.
- HIGH tasks require Verification Plan Governance and Test Evidence Binding before completion claims.

For HIGH tasks:

- Verification Plan Governance defines what must be verified;
- Test Evidence Binding proves the verification obligations were actually tested;
- Execution Assurance and Completion Evidence determine whether execution can be claimed complete.

1.83 should require refs:

```text
verification_plan_ref required for high-impact tasks
test_evidence_ref required before high-impact completion claim
```

It must not invent a separate verification subsystem.

## Human Participation Boundary

Humans should not be asked to decide technical governance.

Humans may be asked only:

- whether to proceed with a clearly described low-risk plan;
- whether to allow code/config changes;
- whether to involve release/production/data/security owner;
- whether to accept a business or risk tradeoff.

Allowed prompt:

```text
这个需求会影响任务提交后的状态推进和结算链路。我会先写执行方案和验证清单，再实现。是否继续？
```

Disallowed prompt:

```text
是否进入 change impact coverage / business rule closure / execution assurance？
```

## Execution Plan For 1.83

### Phase A: Protocol And Documentation

Add or update:

- `core/behavior-complete-existing-project-adoption.md`
- `docs/behavior-complete-existing-project-adoption.md`
- `templates/task-governance-report.md`
- `schemas/artifacts/task-governance.schema.json`
- `checklists/task-governance-review.md`
- `prompts/task-governance-agent.md`
- `task-governance-reports/.gitkeep`

The docs must make clear:

```text
behavior-complete is about task behavior, not full asset migration.
LOW/MEDIUM/HIGH tasks use different governance strength.
task governance does not authorize implementation.
```

### Phase B: Resolver / Classifier

Add:

```text
scripts/resolve-task-governance.mjs
```

The resolver should:

- classify whether a task is `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`;
- infer affected surfaces;
- identify required governance artifacts for the tier;
- map project-native evidence;
- recommend whether a durable plan is required;
- produce plain-language next steps;
- refuse to treat high-impact implementation as low-risk without evidence;
- upgrade task tier when discovered surfaces expand;
- respect 1.82 adoption-depth blockers.

### Phase C: Checker

Add:

```text
scripts/check-task-governance.mjs
```

The checker must reject:

- LOW tasks without low-impact reason;
- LOW tasks that touch API, DB, runtime, permissions, release, production, business rules, or state;
- LOW tasks without scope check, minimal verification, or concrete no-verification reason;
- MEDIUM tasks without short plan, surface check, targeted verification, or close-out;
- MEDIUM tasks with hidden high-impact surfaces;
- POSSIBLE_HIGH tasks that proceed as LOW/MEDIUM without clarification or read-only inspection;
- high-impact tasks without Business Rule Closure or project-native equivalent;
- high-impact tasks without Change Impact Coverage;
- high-impact tasks with DB/API/runtime/review/settlement surfaces missing from the impact map;
- high-impact tasks without execution plan;
- high-impact tasks without Verification Plan;
- completion claims without Test Evidence;
- Test Evidence not bound to Verification Plan;
- unresolved source refs or digest mismatch;
- task_ref / intent_digest mismatch across sources;
- final-step workflow changes without settlement/finalization coverage;
- permission-sensitive tasks without permission/audit checks;
- patch-style runtime fixes with no shared transition logic analysis;
- user-facing prompts that ask "是否进入 BRC/CIC/Execution Assurance";
- task governance reports that claim implementation, commit, push, release, migration, CI/hook, or production approval;
- cases where 1.82 adopt-review says blocked but 1.83 says implementation can start.

### Phase D: Existing Project Integration

Update existing-project docs so `PARTIAL_ADOPTION / ACTIVE_FOR_PLANNING_AND_REVIEW` projects can enforce behavior-complete adoption for all task tiers without requiring full native assets.

The public UX should be:

```text
I classified this task as HIGH.
I will prepare the business rule, impact coverage, plan, and verification checklist first.
```

or:

```text
I classified this task as LOW.
I will keep the change scoped and run minimal verification.
```

not:

```text
Please approve IntentOS execution assurance.
```

### Phase E: Examples And Bad Fixtures

Add examples:

- low-impact copy change;
- medium list filter change;
- medium frontend interaction with targeted verification;
- review-required workflow step change;
- DB/API/frontend high-impact change;
- last-step settlement/finalization change;
- permission-sensitive workflow change;
- possible-high task downgraded after read-only inspection;
- project-native RFC mapped as Business Rule Closure;
- project-native QA checklist mapped as Verification Plan.

Add bad fixtures:

- low task with hidden API change;
- low task with no reason;
- medium task with no short plan;
- medium task with hidden permission impact;
- possible-high task implemented without clarification;
- high-impact task implemented without Business Rule Closure;
- no Change Impact Coverage;
- no execution plan;
- no Verification Plan;
- test evidence not bound to business rules;
- last-step workflow change with no settlement coverage;
- patch-style runtime fix with missing shared transition logic;
- close-out claims done without evidence;
- task governance report authorizes implementation;
- 1.82 blocked state ignored;
- technical user prompt burden.

### Phase F: Release Evidence

Update:

- `VERSION.md`
- `package.json`
- `README.md`
- `README.zh-CN.md`
- `intentos-manifest.json`
- release record for `1.83.0`
- self-check coverage

Only after implementation and verification.

## Acceptance Plan

### Static Checks

Run:

```bash
node --check scripts/resolve-task-governance.mjs
node --check scripts/check-task-governance.mjs
git diff --check
```

### Fixture Checks

Expected passing fixtures:

```bash
node scripts/check-task-governance.mjs examples/task-governance/low-copy-change
node scripts/check-task-governance.mjs examples/task-governance/medium-list-filter
node scripts/check-task-governance.mjs examples/task-governance/medium-frontend-interaction
node scripts/check-task-governance.mjs examples/task-governance/review-required-step-policy
node scripts/check-task-governance.mjs examples/task-governance/db-api-ui-change
node scripts/check-task-governance.mjs examples/task-governance/last-step-settlement
node scripts/check-task-governance.mjs examples/task-governance/permission-sensitive-workflow
node scripts/check-task-governance.mjs examples/task-governance/possible-high-downgraded
node scripts/check-task-governance.mjs examples/task-governance/project-native-rfc-mapping
node scripts/check-task-governance.mjs examples/task-governance/project-native-qa-checklist-mapping
```

Expected failing fixtures:

```bash
node scripts/check-task-governance.mjs examples/bad-task-governance/low-hidden-api-change
node scripts/check-task-governance.mjs examples/bad-task-governance/low-no-reason
node scripts/check-task-governance.mjs examples/bad-task-governance/medium-no-short-plan
node scripts/check-task-governance.mjs examples/bad-task-governance/medium-hidden-permission-impact
node scripts/check-task-governance.mjs examples/bad-task-governance/possible-high-no-clarification
node scripts/check-task-governance.mjs examples/bad-task-governance/no-business-rule-closure
node scripts/check-task-governance.mjs examples/bad-task-governance/no-change-impact-coverage
node scripts/check-task-governance.mjs examples/bad-task-governance/no-execution-plan
node scripts/check-task-governance.mjs examples/bad-task-governance/no-verification-plan
node scripts/check-task-governance.mjs examples/bad-task-governance/test-not-bound-to-business-rule
node scripts/check-task-governance.mjs examples/bad-task-governance/no-settlement-coverage
node scripts/check-task-governance.mjs examples/bad-task-governance/patch-style-state-machine-fix
node scripts/check-task-governance.mjs examples/bad-task-governance/closeout-without-evidence
node scripts/check-task-governance.mjs examples/bad-task-governance/authorizes-implementation
node scripts/check-task-governance.mjs examples/bad-task-governance/ignores-1.82-blocker
node scripts/check-task-governance.mjs examples/bad-task-governance/technical-user-prompt
```

### End-To-End Simulation

Use a fixture modeled on a step-level review policy change.

Expected classifier output:

```text
task_impact: HIGH
required_artifacts:
  - business rule closure
  - change impact coverage
  - execution plan
  - verification plan
  - test evidence before completion claim
  - execution assurance before completion claim
  - completion evidence before done claim
can_start_implementation: No
authorizes_implementation: No
user_technical_participation_required: No
```

Use a fixture modeled on a copy-only UI change.

Expected classifier output:

```text
task_impact: LOW
low_impact_reason: present
required_artifacts:
  - scope check
  - minimal verification or no-verification reason
can_use_lightweight_flow: Yes
```

Use a fixture modeled on a localized list filter.

Expected classifier output:

```text
task_impact: MEDIUM
medium_impact_reason: present
required_artifacts:
  - short plan
  - surface check
  - targeted verification
can_use_lightweight_flow: Yes
```

Expected checker output:

```text
PASS when the task tier has the right governance evidence.
FAIL when a low/medium task hides high-impact surfaces.
FAIL when the last-step settlement/finalization path is missing.
FAIL when tests do not prove the business rule.
FAIL when the report authorizes implementation.
FAIL when 1.82 adoption review blocks deeper action.
```

### Integration Checks

Run:

```bash
node scripts/check-intentos.mjs
npm run verify
```

The verification must prove:

- every task gets tier classification;
- low tasks require scope and minimal verification without full burden;
- medium tasks require short plan and targeted verification;
- possible-high tasks cannot proceed without clarification or inspection;
- high-impact tasks cannot bypass governance classification;
- Business Rule Closure precedes Change Impact Coverage for high-impact tasks;
- source refs and digests are checked;
- project-native evidence can satisfy required behaviors when mapped;
- execution plan does not authorize writes;
- verification/test evidence is required and must map to rules;
- finalization/settlement paths are covered when impacted;
- user prompts remain plain-language;
- behavior-complete adoption works without full native asset installation.

## Expected Result

After 1.83:

```text
Existing projects can remain partial at the asset level,
but task execution becomes IntentOS-complete at the behavior level.
```

This means:

- Codex will not require users to ask for a plan;
- Codex will not overburden low-impact tasks;
- medium tasks get bounded planning and targeted verification;
- high-impact work starts with Business Rule Closure and impact coverage;
- implementation cannot start from the governance report alone;
- tests and evidence are tied to the business rule;
- close-out cannot claim success without proof;
- full native adoption remains optional and separate.

