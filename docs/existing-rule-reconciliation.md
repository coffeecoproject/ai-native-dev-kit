# Existing Rule Reconciliation

Existing Rule Reconciliation helps old projects adopt IntentOS without
overwriting their current rules.

Codex compares:

```text
existing project rules
vs
IntentOS engineering baseline / release recipe / release handoff expectations
```

Then it gives a bounded recommendation:

```text
KEEP_EXISTING
ADOPT_INTENTOS
MERGE
NEEDS_HUMAN_DECISION
```

For release and production rules, the allowed path is stricter:

```text
KEEP_EXISTING
GAP_SUGGESTION
NEEDS_HUMAN_DECISION
CONFLICT_HIGH_RISK
UNKNOWN_AUTHORITY
```

## What The User Sees

The output should be plain:

```text
Codex compared the existing rules with IntentOS expectations.

Engineering baseline:
- keep 3 existing rules
- adopt 2 missing IntentOS engineering rules
- merge 1 duplicate rule as a future wording proposal

Release / production:
- keep the existing release SOP
- add 2 gap suggestions
- 1 conflict needs your confirmation

This report is not permission to change files.
```

## What It Cannot Do

Existing Rule Reconciliation does not:

- write target-project files
- replace `AGENTS.md`
- replace project baselines
- modify CI, hooks, release SOPs, production config, provider state, migrations,
  secrets, payment, permissions, or data
- approve implementation
- approve release or production
- decide business, legal, tax, finance, HR, security, privacy, compliance, or
  production correctness

## When To Use

Use it after a Native Migration Plan has classified existing rules and before
any Unified Apply Plan is prepared.

```text
Native Migration Plan
Existing Rule Reconciliation
Unified Apply Plan
Controlled Apply Readiness
Approval Record
```

For pure read-only diagnosis, Codex may generate a temporary Native Migration
input without writing target files:

```bash
node scripts/cli.mjs reconcile-rules <project> --auto-native
```

This produces an AI Native Adoption Recommendation. It tells the user whether
the safest path is read-only diagnosis, docs bridge, selected native adoption,
owner clarification, or dirty-worktree block.

## Safe Interpretation

- `KEEP_EXISTING`: the old project rule remains the source of truth.
- `ADOPT_INTENTOS`: only a low/medium-risk engineering baseline gap can use
  this outcome.
- `MERGE`: prepare a reviewed wording proposal later; do not merge files now.
- `GAP_SUGGESTION`: documentation or evidence gap only; not release approval.
- `NEEDS_HUMAN_DECISION`: stop and ask the owner.

## Human Confirmation Boundary

The AI should recommend the technical path. The human confirms whether Codex may
prepare a reviewable apply plan for that recommendation.

The report must not ask a non-technical user to personally decide whether a
release gate, CI guard, baseline rule, or hook policy is technically stricter.
