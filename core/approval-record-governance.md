# Approval Record Governance

Approval Record Governance is the human approval evidence layer after Controlled Apply Readiness.

It answers one question:

```text
Which exact low-risk actions remain inside the current user's explicit business request?
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

Use this protocol after Codex has converted the current user's explicit natural-language request into an exact low-risk Apply Plan.

The default zero-experience solo developer does not inspect action IDs, file
digests, or technical plan details. Codex may record
`CURRENT_CONVERSATION_USER` and bind only actions that are reversible,
project-local, low-risk, covered by readiness, and inside the original request.
If any action expands scope or creates a concrete real-world effect, do not
infer approval; ask for the business impact or real-world consent in plain
language.

The record is evidence. It is not an executor, release gate, or blanket permission.

## Approval States

| State | Meaning | Codex action |
|---|---|---|
| `DRAFT` | Approval record is being prepared | do not treat as approval |
| `PENDING_REVIEW` | The original request does not clearly cover one or more actions | explain the business or real-world effect, not action IDs |
| `APPROVED` | Exact low-risk actions are bound to the current user's explicit request | record evidence and continue through readiness/apply gates |
| `REVOKED` | Prior approval was withdrawn | do not apply |
| `EXPIRED` | Approval is no longer valid | request fresh approval |

## Required Approval Evidence

An approved record must include:

- `CURRENT_CONVERSATION_USER` or another specific human confirmer;
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

Ambiguous values such as `someone`, `owner`, `human`, `team`, or `unknown` are
not valid. The reserved current-conversation identity is valid only when an
explicit user request or consent statement is present in the active interaction.

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

The generated approval statement must bind the same approved action IDs as the
action table and the same task intent as the current user request. The user is
not asked to read or repeat those IDs.

## Target Path Rules

Included target paths must be exact relative paths.

Not allowed:

```text
docs/*.md
../outside-project.md
/absolute/path
symlink:docs/current.md
all files
```

Approval Records must not use wildcard paths, parent directory traversal, slash-leading absolute paths, platform absolute paths, backslashes, or symlink aliases.

## Expiry And Plan Change Rules

Approval must be time-bounded. If the approval is expired, revoked, or the plan changed after approval, Codex must request fresh approval.

`1.40.1` rejects records that explicitly say the plan changed after approval. Full digest recomputation is reserved for the later machine-readable schema phase.

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

These may be planned and reviewed. They must not become Codex-controlled writes
through this layer. Ask only for the missing business fact or concrete
real-world effect; do not ask the user to judge the technical action class.

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
