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

Use this protocol after Codex has prepared a Unified Apply Plan and must prove what is still needed before any bounded controlled apply can be considered.

The report should classify the plan into one of these states:

| State | Meaning | Codex action |
|---|---|---|
| `NO_APPLY_PLAN` | No readable apply plan was provided | ask for or generate a plan |
| `NOT_READY` | Plan exists but required readiness evidence is missing | list the missing items |
| `READY_FOR_HUMAN_APPROVED_APPLY` | Compatibility state: a low-risk, bounded, reversible plan is ready for exact request/authority binding | do not ask the user to inspect technical actions; continue only through the Approval Record and apply gates |
| `HUMAN_ONLY` | Compatibility state: the action belongs to a specialized authority or requires a prepared real-world effect | do not use this generic apply path |
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
- exact current-request or real-world authority binding is required and not assumed;
- no high-risk action is included.

## Low-Risk Candidate Actions

Only these action types may ever be considered candidates:

- `WORKFLOW_ASSET_UPDATE`
- `BASELINE_DOC_WRITE`
- `EXISTING_PROJECT_BRIDGE_DOC`
- `PR_TEMPLATE_GOVERNANCE`
- `AGENTS_GOVERNANCE`

These actions still require an exact Approval Record binding. For ordinary
reversible project-local work, the record may bind the current natural-language
request after readiness passes; do not ask for a second technical approval.

## Human-Only Actions

Compatibility heading: these actions are not technical choices for a
zero-experience user. IntentOS must route them to the specialized task,
migration, release, external-provider, or real-world-effect authority and ask
the user only for a missing business fact or exact prepared external effect.

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

They may be planned and reviewed, but must route to their task, migration,
release, external-provider, or real-world-effect authority. They must not be
auto-applied by this generic gate.

## Evidence Rules

A readiness report should link to:

- Unified Apply Plan;
- source evidence from that plan;
- git status or dirty-work review;
- backup / rollback evidence;
- verification plan;
- current-request / real-world authority binding status.

If evidence is missing, the readiness state must be `NOT_READY` or `BLOCKED`.

## Allowed Claims

- A Controlled Apply Readiness Report was produced.
- A Unified Apply Plan was evaluated.
- Low-risk candidate actions were separated from human-only or blocked actions.
- Missing prerequisites were listed.
- Exact authority binding is still required before any future apply; this does
  not imply a second technical question for the user.

## Forbidden Claims

- Files were applied.
- Codex may execute the plan now.
- Apply is authorized.
- Implementation is approved.
- Release or production is approved.
- Hooks, CI, archive moves, migrations, secrets, production config, payment, security, privacy, compliance, legal, or industrial packs are enabled.
- Authority or consent is implied by the existence of the report.
