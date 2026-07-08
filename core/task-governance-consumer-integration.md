# Task Governance Consumer Integration

Task Governance Consumer Integration makes downstream completion systems consume
the task-entry decision from Work Queue and Task Governance.

1.85.1 hardens this integration. Strict consumers must prove that the referenced
Work Queue item and referenced Task Governance report are jointly bound to each
other, not merely valid in isolation.

It answers one control question:

```text
Is this execution or completion claim bound to the current governed task?
```

## Core Rule

Execution Assurance, Completion Evidence, Unified Closure, and User Delivery
Console must not ignore task-entry governance when strict task-consumer mode is
enabled.

Strict consumers must bind to:

- the current Work Queue item;
- the Work Queue item digest;
- the matching Task Governance report;
- the Task Governance digest;
- the task impact tier;
- the review level and verification obligations for that tier.

## Task Entry Binding

Consumers use `task_entry_binding` in machine-readable evidence, or a `Task
Entry Binding` Markdown section for view-only artifacts.

Required binding fields:

- `work_queue_item_ref`
- `work_queue_item_digest`
- `work_queue_item_state`
- `work_queue_item_current_task_match`
- `approved_resume_review`
- `resume_review_ref` / `resume_review_digest` / `resume_review_owner` /
  `resume_review_task_match` when `approved_resume_review` is `Yes`
- `task_governance_ref`
- `task_governance_digest`
- `task_governance_tier`
- `task_governance_review_level`
- `task_governance_task_match`
- `minimal_verification_status`
- `targeted_verification_status`
- `high_impact_evidence_chain_complete`
- `task_governance_blocks_completion`
- `tier_completion_requirements_satisfied`
- `unresolved_task_governance_blockers`
- `plain_user_blocker`

## Strict Source And Joint Binding

Strict consumers must validate referenced Work Queue Takeover and Task
Governance structured evidence. A consumer cannot pass strict task-consumer
checks by pointing at a minimal source stub.

Strict consumers must also prove joint binding:

```text
queueItem.task_governance_ref == binding.task_governance_ref
queueItem.task_governance_digest == binding.task_governance_digest
queueItem.task_governance_binding_status == VERIFIED when completion can be claimed
```

Closure Decision and User Delivery Console are derived views, but in strict
mode they still need a task ref so the referenced Task Governance report can be
matched to the current task.

## Tier Rules

`LOW`:

- requires `LIGHTWEIGHT` review;
- requires minimal verification recorded or a concrete not-applicable reason;
- cannot claim done if lightweight requirements are not satisfied.

`MEDIUM`:

- requires `TARGETED` review;
- requires targeted verification recorded;
- cannot claim done if targeted requirements are not satisfied.

`POSSIBLE_HIGH`:

- blocks completion until resolved;
- cannot claim done.

`HIGH`:

- requires `FULL` review;
- requires the full high-impact evidence chain;
- cannot claim done until high-impact requirements are satisfied.

## Consumer Behavior

Execution Assurance must fail strict task-consumer checks when the execution is
not bound to the current Work Queue item and matching Task Governance report.

Completion Evidence must fail strict task-consumer checks when completion
evidence is from another queue item, stale task, unresolved `POSSIBLE_HIGH`, or
lower-risk classification.

Unified Closure must not output `DONE` when Task Governance still blocks
completion.

User Delivery Console must translate technical blockers into plain user status
instead of asking the user to inspect schema fields, digests, checker flags, or
internal artifact names.

## Boundary

This integration does not:

- create a new closure system;
- authorize implementation;
- approve implementation;
- approve completion by itself;
- approve release or production;
- approve commit, push, release, or production;
- install hooks, CI gates, `.intentos/`, or target-project runtime assets;
- replace stronger project-owned rules.

It only ensures downstream consumers cannot ignore Work Queue and Task
Governance in strict mode.
