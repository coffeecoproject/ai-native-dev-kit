# Controlled Apply Readiness Governance

Controlled Apply Readiness is the pre-execution gate after a Unified Apply Plan exists.

It answers one question:

```text
Is this reviewed plan eligible for a future controlled apply step?
```

It does not execute the plan.

Machine-checkable boundary:

- This readiness report writes files now: No
- This readiness report authorizes apply: No
- This readiness report approves implementation: No
- This readiness report approves release or production: No
- This readiness report installs hooks or changes CI: No
- This readiness report changes source of truth: No
- This readiness report enables high-risk actions: No

## Purpose

Use this protocol when a human has reviewed or is close to reviewing a Unified Apply Plan and asks what is still needed before any controlled apply can be considered.

The report should classify the plan into one of these states:

| State | Meaning | Codex action |
|---|---|---|
| `NO_APPLY_PLAN` | No readable apply plan was provided | ask for or generate a plan |
| `NOT_READY` | Plan exists but required readiness evidence is missing | list the missing items |
| `READY_FOR_HUMAN_APPROVED_APPLY` | Low-risk, bounded, reviewable, reversible plan can be considered by a human | stop for explicit approval |
| `HUMAN_ONLY` | Risk or action type requires human execution or a specialized owner | do not apply |
| `BLOCKED` | Dirty state, missing target, missing rollback, missing verification, or invalid evidence blocks readiness | resolve blocker first |

## Required Preconditions

All of these must be true before a report may say `READY_FOR_HUMAN_APPROVED_APPLY`:

- one Unified Apply Plan is referenced and readable;
- the plan says it does not write now;
- the plan says it does not authorize apply;
- the plan says Codex cannot write now;
- target paths are explicit and bounded;
- git state is clean or the plan explicitly proves a safe dirty-work exception;
- backup and rollback plan exists;
- pre-apply and post-apply verification are defined;
- human approval is required and not assumed;
- no high-risk action is included.

## Low-Risk Candidate Actions

Only these action types may ever be considered candidates:

- `WORKFLOW_ASSET_UPDATE`
- `BASELINE_DOC_WRITE`
- `EXISTING_PROJECT_BRIDGE_DOC`
- `PR_TEMPLATE_GOVERNANCE`
- `AGENTS_GOVERNANCE`

Even these actions still require explicit human approval before any future apply.

## Human-Only Actions

These are never eligible for Codex-controlled apply through this readiness gate:

- `BUSINESS_CODE_CHANGE`
- `HOOK_OR_CI_CHANGE`
- `AUTOMATION_CHANGE`
- `DOCUMENT_ARCHIVE_APPLY`
- `INDUSTRIAL_PACK_ENABLE`
- `DATA_OR_MIGRATION_CHANGE`
- `SECRET_OR_ENV_CHANGE`
- `PRODUCTION_CONFIG_CHANGE`
- `PAYMENT_OR_VALUE_TRANSFER_CHANGE`
- `SECURITY_PRIVACY_COMPLIANCE_CHANGE`
- `LEGAL_LICENSE_POLICY_CHANGE`

They may be planned, reviewed, or assigned to a human owner. They must not be auto-applied by Codex.

## Evidence Rules

A readiness report should link to:

- Unified Apply Plan;
- source evidence from that plan;
- git status or dirty-work review;
- backup / rollback evidence;
- verification plan;
- human approval status.

If evidence is missing, the readiness state must be `NOT_READY` or `BLOCKED`.

## Allowed Claims

- A Controlled Apply Readiness Report was produced.
- A Unified Apply Plan was evaluated.
- Low-risk candidate actions were separated from human-only or blocked actions.
- Missing prerequisites were listed.
- Human approval is still required before any future apply.

## Forbidden Claims

- Files were applied.
- Codex may execute the plan now.
- Apply is authorized.
- Implementation is approved.
- Release or production is approved.
- Hooks, CI, archive moves, migrations, secrets, production config, payment, security, privacy, compliance, legal, or industrial packs are enabled.
- Human approval is implied by the existence of the report.
