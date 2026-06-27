# Patch Classification Governance

Patch Classification Governance prevents Codex from solving a real project problem with a narrow patch when the issue requires baseline-aligned hardcut, structural remediation, or human decision.

It is not a ban on small fixes. It is a repair-scale classification step.

## Purpose

Before proposing or applying a non-trivial fix, Codex must classify the repair scale:

```text
Can this safely be a local fix?
Does it touch governed project surfaces?
Is the root cause structural?
Does a human need to decide?
Should this patch path be rejected?
```

## Repair Scale Types

| Type | Meaning | AI behavior |
|---|---|---|
| `SAFE_LOCAL_FIX` | small isolated fix with no cross-boundary impact | may propose or execute only if already authorized |
| `BASELINE_ALIGNED_HARDCUT` | scoped change touches governed surfaces but scope is clear | follow target baseline, update tests/docs/evidence in same batch |
| `STRUCTURAL_REMEDIATION` | root cause is structural drift or cross-layer mismatch | plan structural repair; do not hide it with a symptom patch |
| `NEEDS_HUMAN_DECISION` | risk, scope, architecture, production, data, security, privacy, release, or irreversible choice | stop and ask |
| `DO_NOT_PATCH` | patch would hide, weaken, bypass, or silence governance | reject patch path |

## SAFE_LOCAL_FIX

`SAFE_LOCAL_FIX` is narrow. It is allowed only when all are true:

- isolated change
- no API, DB, auth, permission, state machine, release, environment, migration, dependency, production, schema, contract, or gate surface
- no fallback or compatibility path added without approval
- no gate, validation, schema, contract, or permission rule is weakened
- verification is direct and small

Examples:

- typo in non-authoritative prose
- local display copy with no policy meaning
- small test label correction
- narrow styling correction that does not affect design-system rules

## BASELINE_ALIGNED_HARDCUT

Use this when:

- project has clear baseline authority
- scope is approved
- fix touches governed surfaces
- the correct action is to align to the baseline in one coherent batch

Examples:

- API contract exists and frontend/backend drift must be reconciled to it
- DTO/domain boundary is clear and mixed types must be separated
- UI design-system rule exists and local style drift must return to the source of truth
- test, docs, and evidence must be updated in the same batch

This is not a workaround. It is a governed change.

## STRUCTURAL_REMEDIATION

Use this when the root cause is wider than the visible failure.

Signals:

- repeated failures in the same area
- cross-layer mismatch
- unclear ownership boundary
- conflicting source-of-truth documents
- large-file, module-boundary, or import-direction drift
- several local patches would preserve the real problem

Output must include structural plan, affected layers, migration/test/evidence plan, and human decisions.

## NEEDS_HUMAN_DECISION

Use this when the issue requires a judgment call or irreversible/risky choice:

- architecture direction
- production/release/rollback
- DB migration or destructive data action
- auth, permission, security, privacy, compliance, payment, tax, identity, or regulated data
- dependency adoption
- scope expansion
- accepting an exception

Codex must stop and ask.

## DO_NOT_PATCH

Use this when a patch would:

- hide a root cause
- weaken a gate
- bypass permissions
- loosen a contract or schema
- add fallback compatibility without approval
- change tests to match broken behavior
- remove evidence requirements
- make a task pass while damaging governance

`DO_NOT_PATCH` is not a completed fix. It is a stop signal.

## Required Report Fields

Every non-trivial patch classification must record:

```text
Repair classification:
- Type:
- Why this type:
- Why not SAFE_LOCAL_FIX:
- Why not another type:
- Affected baselines:
- Affected surfaces:
- Patch risk:
- Could this hide a root cause?
- Could this weaken a gate?
- Rollback / recovery impact:
- Required evidence:
- Required human decisions:
- Verification plan:
- Patch classification authorizes implementation: No
```

## Relationship To Review Loop

Review Loop decides whether findings can be auto-fixed.

Patch Classification asks a different question:

```text
Should this problem be handled as a patch at all?
```

Patch classification does not authorize implementation. It routes the repair.

## Checker Boundary

The checker is heuristic and structure-based. It does not prove code correctness, root-cause correctness, security, privacy, compliance, release readiness, or production safety.
