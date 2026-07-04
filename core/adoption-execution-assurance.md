# Adoption Execution Assurance

Adoption Execution Assurance verifies whether an existing project has actually adopted IntentOS as its working mode.

It is not a migration executor, permission record, release approval, or production readiness guarantee.

## Purpose

Existing projects can look adopted because a report says so. That is not enough.

An adoption claim is allowed only when it is backed by inspectable project state:

- mapped workflow entry;
- existing rules and baselines compared;
- release, CI/hook, document, work queue, AI log, and risk authority surfaces classified;
- apply/approval/readiness evidence resolved when writes occurred;
- a safe read-only simulation proves Codex would route work through IntentOS.

## Assurance States

- `NOT_ADOPTED`
- `READ_ONLY_DIAGNOSIS_ONLY`
- `PLAN_READY`
- `APPLY_READY`
- `APPLIED_PENDING_VERIFICATION`
- `PARTIAL_ADOPTION`
- `VERIFIED_ACTIVE`
- `BLOCKED_BY_DIRTY_WORKTREE`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `FAILED_ASSURANCE`

`VERIFIED_ACTIVE` is the only state that allows Codex to claim full existing-project adoption.

## Required Surfaces

Every report must classify:

- workflow_entry;
- ai_rules_agents;
- engineering_baseline;
- environment_baseline;
- release_rollback;
- ci_hooks;
- documents;
- work_queue;
- ai_logs_audit;
- risk_authority;
- apply_chain;
- simulation_task.

Allowed surface states:

- `VERIFIED`
- `MAPPED`
- `PROJECT_OWNED`
- `PENDING_APPLY`
- `PENDING_HUMAN_DECISION`
- `BLOCKED`
- `MISSING`
- `NOT_APPLICABLE_WITH_REASON`

Empty not-applicable reasons fail strict review.

## Boundaries

Adoption assurance must not:

- write target project files;
- does not write target files;
- authorize project writes;
- approve implementation;
- does not approve release or production;
- approve release or production;
- mutate CI or hooks;
- replace project-owned release SOPs;
- does not replace project-owned release SOP;
- transfer business, production, data, compliance, secrets, payment, migration, tax, legal, finance, or HR authority to IntentOS;
- turn `ai-logs` into routine command logs;
- claim product correctness.

## Simulation

The simulation is read-only. It uses a synthetic task such as:

```text
Add a required field validation to a non-production example flow.
```

The simulation checks that Codex would route through:

```text
ask / guide -> workflow-next -> work queue -> impact coverage -> review surface -> apply plan -> closure / finish
```

It proves workflow behavior, not product correctness.
