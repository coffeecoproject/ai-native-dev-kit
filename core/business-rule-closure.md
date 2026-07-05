# Business Rule Closure

Business Rule Closure is the task-communication layer for business-rule work.
It runs after intent understanding and before Change Impact Coverage.

Its question is:

```text
Is this business rule clear enough to map implementation surfaces?
```

It does not answer whether code is complete, whether tests are sufficient, or
whether the product is ready to release.

## User Experience

Codex performs the internal completeness scan. Users should see only:

- what Codex understands;
- what still needs a business decision;
- the safest default when the user is unsure.

Codex should not ask ordinary users to fill a full specification. A Business
Rule Closure card should ask no more than three user-facing questions in one
turn.

## Required Boundary

Business Rule Closure is read-only.

It does not write target files, does not authorize implementation, and does not approve release or production.

- This closure writes target files: No
- This closure authorizes implementation: No
- This closure approves release or production: No
- This closure approves finance, tax, HR, legal, payment, privacy, compliance,
  migration, production, or customer-data decisions: No
- This closure proves real-environment behavior: No

## States

| State | Meaning |
| --- | --- |
| `READY_FOR_IMPACT_COVERAGE` | Business meaning is clear enough to map surfaces |
| `NEEDS_USER_CONFIRMATION` | A user decision changes behavior or customer impact |
| `NEEDS_DOMAIN_OWNER` | A specialist owner must decide before impact coverage |
| `BLOCKED_INCOMPLETE_RULE` | The rule is incomplete or contradictory |
| `OUT_OF_SCOPE_FOR_CURRENT_TASK` | The request belongs to another task |

`READY_FOR_IMPACT_COVERAGE` is not a completion claim. It only allows the next
read-only step: Change Impact Coverage.

## Dimension Status

| Status | Meaning |
| --- | --- |
| `CLOSED` | The dimension is clear enough to feed impact coverage |
| `DEFAULTED_WITH_REASON` | A safe default is recorded with a concrete reason |
| `NEEDS_USER_CONFIRMATION` | A user decision is needed |
| `NEEDS_DOMAIN_OWNER` | A domain owner decision is needed |
| `BLOCKED_CONTRADICTORY` | The rule conflicts with itself or known rules |
| `OUT_OF_SCOPE_WITH_REASON` | The dimension belongs to another task |
| `NOT_APPLICABLE_WITH_REASON` | The dimension does not apply and the reason is concrete |

## Rule Identity

Business Rule Closure must be bindable by later systems. A structured record
must include:

- `business_rule_id`
- `business_rule_ref`
- `source_request_digest`
- `business_rule_digest`
- `closure_digest`

Change Impact Coverage, Execution Assurance, and Unified Closure can then prove
they are using the same business-rule interpretation.

## Safe Defaults

Safe defaults are recommendations, not execution approval.

Each default must distinguish:

- recommendation;
- whether user acceptance is required;
- whether the user accepted it;
- whether Codex can apply it now.

Business Rule Closure must never treat a recommended default as implementation
permission.

## Existing Rule Conflicts

For existing projects, Codex should look for project rule sources such as
`AGENTS.md`, business specs, permission docs, API docs, release SOPs, and
existing rule reconciliation reports.

If a conflict is found, Business Rule Closure cannot be
`READY_FOR_IMPACT_COVERAGE` until the conflict is resolved by the user or the
proper domain owner.
