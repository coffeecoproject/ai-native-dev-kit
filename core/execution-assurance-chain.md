# Execution Assurance Chain

Execution Assurance Chain verifies whether a specific execution can be claimed as complete.

It is a derived verification layer. It consumes existing IntentOS source systems such as Change Impact Coverage, Execution Closure, Review Loop, Adoption Assurance, Governance Convergence, Release Plan, Document Lifecycle, Unified Apply Plan, Approval Record, and Controlled Apply Readiness.

It does not replace those systems.

From 1.78.2, every Execution Assurance report also exposes a top-level
`intent_digest`. Completion Evidence can then bind Execution Assurance to the
same task intent directly, instead of trusting that an Execution Assurance
report merely exists.

From 1.85.0, strict task-consumer mode requires `task_entry_binding`.
Execution Assurance must consume the current Work Queue item and matching Task
Governance report before it can support a done claim.

## Purpose

The purpose is to move completion from narrative claim to evidence chain:

```text
what was promised
what was planned
what actually changed
what proves it
who or what reviewed it
whether closure is allowed
```

User-facing result:

```text
VERIFIED_DONE / PARTIAL_DONE / BLOCKED
```

Machine-facing rule:

```text
No evidence chain, no verified completion.
```

## Non-Authority Boundary

Execution Assurance is read-only by default.

It must not:

- write target files;
- authorize target-file writes;
- approve implementation beyond recorded scope;
- approve commit or push;
- approve release or production;
- replace source systems;
- prove product correctness;
- transfer project authority to IntentOS.

## Execution Kinds

Supported execution kinds:

- `FEATURE_IMPLEMENTATION`
- `BUG_FIX`
- `SAFE_PATCH`
- `CONTROLLED_PATCH`
- `ADOPTION_MIGRATION`
- `BASELINE_SETUP`
- `DOCUMENT_GOVERNANCE`
- `RELEASE_PREPARATION`
- `WORKFLOW_CAPABILITY`
- `UNKNOWN`

Unknown execution kinds cannot produce `VERIFIED_DONE`.

## Required Chain

`VERIFIED_DONE` requires all of the following:

1. Intent Lock
2. Completion Contract
3. Planned Impact Map
4. Execution Plan Binding
5. Actual Diff Binding
6. Evidence Binding
7. Independent Review Binding
8. Patch Assessment
9. Closure Decision

If any required part is missing, the result must be `PARTIAL_DONE`, `NEEDS_HUMAN_DECISION`, or a blocking state.

For `VERIFIED_DONE`, Execution Plan Binding must point to a resolvable
task-plan record. The plan reference must be `file:`, `artifact:`, or a known
`checker:` record. A bare path, placeholder, stale record, or unrelated plan
cannot support a completion claim.

## Patch Assessment

Patch states:

- `NOT_A_PATCH`
- `SAFE_PATCH`
- `CONTROLLED_PATCH`
- `PATCH_SMELL`
- `BLOCKED_PATCH`

`PATCH_SMELL` and `BLOCKED_PATCH` block `VERIFIED_DONE`.

Patch smell examples:

- backend-only fix for a user-visible validation rule;
- hard-coded special case without project rule;
- skipped tests without a reason;
- broad catch/fallback that hides the real error;
- bypassing permission, payment, release, migration, or status rules;
- docs-only claim without target-state evidence.

## Closure States

Allowed assurance states:

- `VERIFIED_DONE`
- `PARTIAL_DONE`
- `BLOCKED_BY_MISSING_EVIDENCE`
- `BLOCKED_BY_UNEXPECTED_DIFF`
- `BLOCKED_BY_PATCH_SMELL`
- `BLOCKED_BY_SCOPE_DRIFT`
- `BLOCKED_BY_RISK`
- `NEEDS_HUMAN_DECISION`

Only `VERIFIED_DONE` supports the claim:

```text
This execution is complete according to the recorded contract and evidence.
```

Even `VERIFIED_DONE` does not approve release, production, compliance, security, legal, tax, finance, HR, privacy, or business correctness.

## Source Systems Stay Authoritative

Execution Assurance is not a new source of truth. It is a computed report over source systems.

If source systems disagree, the stricter result wins and the trace must show why.

## Required Artifact

Use `templates/execution-assurance-report.md`.

Required report sections:

- Human Summary
- Execution Kind
- Intent Lock
- Completion Contract
- Planned Impact Map
- Execution Plan Binding
- Actual Diff Binding
- Evidence Binding
- Independent Review Binding
- Patch Assessment
- Source System Trace
- Closure Decision
- Pending Human Decisions
- Forbidden Claims
- Boundary
- Machine-Readable Evidence
