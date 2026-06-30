# Approval Record Governance

Approval Record Governance is the human approval evidence layer after Controlled Apply Readiness.

It answers one question:

```text
What exactly did a human approve?
```

It does not execute the plan.

Machine-checkable boundary:

- This approval record writes files now: No
- This approval record authorizes automatic apply: No
- This approval record approves implementation: No
- This approval record approves release or production: No
- This approval record installs hooks or changes CI: No
- This approval record changes source of truth: No
- This approval record enables high-risk actions: No
- This approval record lets Codex proceed without readiness: No

## Purpose

Use this protocol when a human has reviewed an Apply Plan and gives explicit approval for selected actions.

The record is evidence. It is not an executor, release gate, or blanket permission.

## Approval States

| State | Meaning | Codex action |
|---|---|---|
| `DRAFT` | Approval record is being prepared | do not treat as approval |
| `PENDING_REVIEW` | Approval is requested but not given | stop for human |
| `APPROVED` | A human approved explicit action IDs and bounded scope | record evidence and stop before apply |
| `REVOKED` | Prior approval was withdrawn | do not apply |
| `EXPIRED` | Approval is no longer valid | request fresh approval |

## Required Approval Evidence

An approved record must include:

- human approver identity or role;
- approval owner type set to `HUMAN`;
- one referenced Unified Apply Plan;
- one plan hash;
- explicit approved action IDs;
- exact included target paths;
- exact excluded scope where relevant;
- expiry;
- rollback acknowledgement;
- verification acknowledgement;
- non-authorizations.

## Approved Action Rules

Approved action IDs must be explicit.

Allowed:

```text
A001, A002
```

Not allowed:

```text
all actions
everything in the plan
whatever Codex thinks is needed
entire repo
all files
```

## High-Risk Action Rules

Approval Record Governance cannot approve these action classes:

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

These may be planned, reviewed, or assigned to a human owner. They must not become Codex-controlled writes through this layer.

## Allowed Claims

- A human approval record exists.
- The record approves specific action IDs for a bounded scope.
- The record references a specific plan and plan hash.
- The record requires readiness and verification before any future controlled apply.

## Forbidden Claims

- Codex may write now.
- Apply is automatic.
- Implementation is approved.
- Release or production is approved.
- A readiness report itself is approval.
- A reviewer, subagent, or AI response is human approval.
- A vague user sentence approves everything.
- High-risk actions are enabled.
