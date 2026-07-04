# Existing Rule Reconciliation

Existing Rule Reconciliation is a recommendation layer for old or governed
projects that are adopting IntentOS.

It compares classified existing-project rules with IntentOS references and
records whether each rule should be kept, adopted as a missing engineering
baseline, merged into a reviewed wording proposal, or escalated for human
decision.

It is not a replacement engine.

## Position In The Flow

```text
Native Migration Plan
Existing Rule Reconciliation
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
```

Existing Rule Reconciliation must not bypass Native Migration Plan or the apply
chain.

## Core Rule

```text
reconcile != replace
recommend != approve
gap suggestion != release approval
merge != write
IntentOS reference != project authority
```

## Outcomes

General outcomes:

```text
KEEP_EXISTING
ADOPT_INTENTOS
MERGE
NEEDS_HUMAN_DECISION
NO_INTENTOS_MATCH
NO_EXISTING_RULE
CONFLICT_HIGH_RISK
UNKNOWN_AUTHORITY
```

Release / production outcomes:

```text
KEEP_EXISTING
GAP_SUGGESTION
NEEDS_HUMAN_DECISION
CONFLICT_HIGH_RISK
UNKNOWN_AUTHORITY
```

Release and production rules must not use `ADOPT_INTENTOS` or `MERGE`.

## Engineering Baseline Rules

Engineering baseline rules can be compared when the authority is clear.

- Keep an existing rule when it is stricter or more project-specific.
- Adopt an IntentOS reference only when it fills a low/medium-risk engineering
  gap.
- Merge only means preparing a reviewed wording proposal for future apply
  planning.
- Stop for human decision when rules conflict or authority is unclear.

`ADOPT_INTENTOS` is only allowed for `ENGINEERING_BASELINE` gaps without
protected business, permission, security, privacy, compliance, payment,
finance, tax, HR, legal, customer, data, migration, provider-state,
production, or release terms.

MERGE means a reviewed wording proposal, not a file write or behavior change.

`MERGE` must record:

- existing rule reference
- IntentOS reference
- merge reason
- preserved existing terms
- added IntentOS terms
- human decision required
- target action: prepare apply-plan after approval

## Release And Production Rules

Existing production rules remain project-owned.

IntentOS can identify missing release evidence or conflicts, but it cannot
replace release owner judgment.

Default behavior:

- existing release or production rule: `KEEP_EXISTING`
- missing launch safety evidence: `GAP_SUGGESTION`
- conflict with existing SOP: `NEEDS_HUMAN_DECISION`
- unclear ownership, secrets, provider state, rollback, monitoring, migration,
  or incident response: `NEEDS_HUMAN_DECISION`

`GAP_SUGGESTION` is documentation or evidence guidance only. It is not approval
to release, deploy, rollback, migrate, submit review, or change production
configuration.

Machine-checkable rule: release / production surfaces cannot use
`ADOPT_INTENTOS` or `MERGE`.

## Protected Constraints

Protected constraints are project-owned. They may be kept or escalated; they
must not be automatically adopted or merged as plain engineering rules.

Protected surfaces:

- business meaning
- customer data
- permission and roles
- security
- privacy
- compliance
- payment
- finance
- tax
- HR
- legal
- migration
- provider state
- production data

## Required Boundary

Every reconciliation report must state:

```text
Can Codex write now: No
Reconciliation Authority: RECOMMENDATION_ONLY
Business Authority: PROJECT_OWNED
Production Authority: HUMAN_OR_EXTERNAL_SYSTEM
Approves governance replacement: No
Approves implementation: No
Approves release or production: No
Requires apply plan before file change: Yes
```

## Rule Coverage And Native Adoption Decision

Existing Rule Reconciliation must record coverage for extracted rules.

Machine-readable evidence must include:

```text
schema_version: 1.69.2
evidence_profile: existing-rule-reconciliation-1.69.2
rule_reconciliation_coverage
existing_rule_source
intentos_reference_source
native_adoption_decision
can_recommend_apply_plan_now
can_recommend_apply_plan_after_human_review
```

Every `reconciliation_items[].existing_rule_ref` must resolve to
`existing_rule_source[].rule_ref`.

Every `reconciliation_items[].intentos_reference_ref` must resolve to
`intentos_reference_source[].reference_ref`.

The human-readable report must also include an
`AI Native Adoption Recommendation` section with:

- Recommendation
- Migration Depth
- Can Codex write now
- Human Confirmation
- Preserve / Merge / Replace After Approval / Blocked

If only part of the extracted rule set is reconciled, the report must say so.

When omitted rules exist:

```text
blocks_selected_native_adoption: Yes
native_adoption_decision.recommendation: BLOCKED_NEEDS_OWNER
outcome: BLOCKED
```

Selected native adoption is not allowed until omitted rules are reviewed.

If native adoption is blocked, `can_recommend_apply_plan_now` must be `No`.
Codex may only recommend an apply plan after the block is resolved and a human
confirms the reviewed path.

## Human Role

The human decides whether a recommendation is acceptable. Codex may prepare a
future apply plan only after the report is reviewed and the exact action is
approved.
