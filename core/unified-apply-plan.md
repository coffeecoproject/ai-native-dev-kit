# Unified Apply Plan Governance

Unified Apply Plan Governance is the single review layer for any IntentOS action that may write project files.

It does not execute writes. It turns proposed writes into a clear, reviewable
plan so IntentOS can validate scope, evidence, rollback, and authority before a
specialized executor writes anything. The zero-experience user does not inspect
or approve raw technical actions.

When a consumer explicitly requires structured apply evidence, at least one
Unified Apply Plan must exist. An empty plan directory cannot satisfy strict
apply evidence.

Machine-checkable boundary:

- The plan writes files now: No
- The plan authorizes apply: No
- The plan approves implementation: No
- The plan approves release or production: No
- The plan modifies CI or hooks now: No
- The plan deletes or archives files now: No
- The plan changes source of truth now: No
- The plan grants Codex permission to continue beyond scope: No

## Purpose

Use this protocol before applying any recommendation that could change a target project, including:

- workflow asset init or update
- AGENTS.md governance migration
- pull request template governance migration
- engineering or environment baseline writes
- baseline pack selection records
- industrial or BL2 overlays
- document archive apply actions
- hook or CI changes
- automation proposals that may later write files or call external services
- existing governed project bridge documents

The goal is to answer:

```text
What exactly would change?
Why is it needed?
Which evidence supports it?
Which files are in scope?
Which actions are human-only or blocked?
How would it be backed up, verified, and rolled back?
What is Codex not allowed to do?
```

## Relationship To Existing Apply Flows

Unified Apply Plan does not replace specialized flows.

It wraps them.

| Existing flow | Unified Apply Plan role |
|---|---|
| `init-project --write-plan` | referenced as workflow asset apply evidence |
| `baseline --write-plan` | referenced as baseline apply evidence |
| `archive-apply` | referenced as document archive apply evidence |
| `hook-policy` / `hook-plan` | referenced as hook risk evidence |
| `workflow-map` | referenced for existing governed project adoption |
| `closure` | referenced before commit-review or handoff |

If a specialized flow already has a local plan, the Unified Apply Plan summarizes the proposed write surface and approval boundary. It must not silently execute the specialized plan.

## Apply States

| State | Meaning | Codex action |
|---|---|---|
| `NO_APPLY_ACTION_READY` | No concrete write action is ready | stay read-only |
| `PLAN_ONLY` | Proposed writes are described but not ready | complete internal review and authority binding |
| `NEEDS_HUMAN_APPROVAL` | Compatibility state: the current request does not bind an action or one permitted user input remains | translate to the exact four-class input; never ask for raw technical approval |
| `BLOCKED_BY_MISSING_EVIDENCE` | Required source evidence is missing | gather evidence first |
| `BLOCKED_BY_DIRTY_WORK` | Existing changes make apply unsafe | resolve or map current work first |
| `BLOCKED_BY_RISK` | Required technical evidence, authority, or recovery proof is missing | keep blocked while Codex resolves the technical path |
| `BLOCKED_BY_MISSING_TARGET` | Target project path is invalid | provide a valid project |

## Required Plan Sections

Every Unified Apply Plan must include:

- Plain Outcome Summary
- Apply Readiness
- Source Evidence
- Planned Actions
- Specialized / Blocked Actions
- Preconditions
- Backup / Rollback Plan
- Verification Plan
- Permitted User Input Needed
- Boundary
- Outcome

## Planned Action Rules

Each planned action must include:

- action id
- action type
- target paths
- reason
- status
- whether it writes now
- whether the current request binds the action or a permitted user input is required
- whether rollback is required

Allowed action statuses:

- `PLAN_ONLY`
- `HUMAN_APPROVAL_REQUIRED`
- `HUMAN_ONLY`
- `BLOCKED`
- `NOT_APPLICABLE`

`Will write now` must always be `No`.

## High-Risk Action Rules

These action types are never authorized by this generic Apply layer. They route
to their specialized task, evidence, release, or real-world-effect authority:

- `HOOK_OR_CI_CHANGE`
- `PRODUCTION_CONFIG_CHANGE`
- `SECRET_OR_ENV_CHANGE`
- `DATA_OR_MIGRATION_CHANGE`
- `PAYMENT_OR_VALUE_TRANSFER_CHANGE`
- `SECURITY_PRIVACY_COMPLIANCE_CHANGE`
- `LEGAL_LICENSE_POLICY_CHANGE`
- `INDUSTRIAL_PACK_ENABLE`
- `BUSINESS_CODE_CHANGE`

Unified Apply Plan may describe them. It must not execute them, ask the user to
approve their technical design, or treat a compatibility approval field as
authority.

## Evidence Rules

An apply plan should link to the most relevant source evidence:

- Workflow Guidance Card
- Workflow Adoption Map
- Baseline Decision Card
- Standard Baseline Selection Report
- Baseline Pack Selection Report
- Document Archive Apply Plan
- Hook Orchestration Plan
- Project Hook Policy
- Review Surface Card
- Change Boundary Report
- Debt & Knowledge Handoff Report
- Execution Closure Report

Missing evidence does not automatically fail a plan, but the readiness state must become `BLOCKED_BY_MISSING_EVIDENCE` when the proposed action depends on missing evidence.

## Backup And Rollback Rules

Every write-capable action must define:

- what would be backed up
- where the backup should go
- how rollback would restore the original file or behavior
- what verification proves rollback worked

If rollback is unclear, the action status must be `BLOCKED`.

## Verification Rules

Verification must be listed before apply:

- pre-apply check
- post-apply check
- evidence path
- owner

The plan may name commands. The plan itself does not prove the commands passed.

## Allowed Claims

- A Unified Apply Plan was produced.
- Proposed writes were listed.
- Human-only and blocked actions were separated.
- Backup, rollback, and verification requirements were identified.

## Forbidden Claims

- Files were applied.
- Writes are approved.
- Codex may execute the plan without explicit approval.
- Implementation is approved.
- Release or production is approved.
- High-risk decisions are approved.
- Existing project governance was replaced.
- Hooks, CI, archive moves, secrets, migrations, or industrial packs were enabled.
