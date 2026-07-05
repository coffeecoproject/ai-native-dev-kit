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
- `BLOCKED_BY_UPSTREAM_EVIDENCE`
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
- `PRESENT_UNVERIFIED`
- `NOT_APPLICABLE_WITH_REASON`

Empty not-applicable reasons fail strict review.

`PRESENT_UNVERIFIED` means an asset or directory exists but is not enough evidence yet. For example, apply-chain directories that only contain placeholders must not be treated as verified apply evidence.

## Source Systems

Every structured report must record upstream source-system evidence, including workflow-next, native migration, existing-rule reconciliation, governance convergence, and release plan inputs.

If any upstream source is `BLOCKED` or `NEEDS_INPUT`, adoption assurance must not return `VERIFIED_ACTIVE`.

## Boundaries

Adoption assurance must not:

- write target project files;
- authorize project writes;
- approve implementation;
- approve release or production;
- mutate CI or hooks;
- replace project-owned release SOPs;
- transfer business, production, data, compliance, secrets, payment, migration, tax, legal, finance, or HR authority to IntentOS;
- turn `ai-logs` into routine command logs;
- claim product correctness.

In short: adoption assurance does not write target files, does not approve release or production, and does not replace project-owned release SOP.

## Simulation

The simulation is read-only. It uses a synthetic task such as:

```text
Add a required field validation to a non-production example flow.
```

The simulation must record each executed read-only step and its result. It checks that Codex would route through:

```text
ask / guide -> workflow-next -> work queue -> impact coverage -> review surface -> apply plan -> closure / finish
```

Each simulation step must include:

- `exit_code`;
- `read_only`;
- `writes_target_files`;
- `target_diff_status`;
- `output_digest`;
- outcome summary.

`SIMULATION_PASSED` requires every step to pass, exit with code `0`, stay read-only, avoid target writes, and show git-backed `UNCHANGED` target diff status.

It proves workflow behavior, not product correctness.

## Target Install Scope

Adoption assurance has two asset classes:

- target workflow assets: copied into target projects when full workflow assets are intentionally installed or updated;
- source-only maintainer assets: examples, bad fixtures, release records, and calibration evidence used to validate the IntentOS itself.

If an asset is source-only, it can support IntentOS validation but must not be presented as proof that a target project has adopted IntentOS.
