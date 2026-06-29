# Review Surface Governance

## Purpose

Review Surface Governance defines what Codex must review for a task before it starts implementation and after it finishes implementation.

It prevents patch-style work where Codex fixes one visible issue while ignoring data, permission, release, documentation, or debt impact.

## Product Rule

Codex selects review surfaces.

The user should not need to choose technical review types.

The user may describe the goal in plain language. Codex reads project signals, task intent, and existing governance assets, then records a Review Surface Card.

## Review Surface Card

A Review Surface Card is pre-execution planning only.

It does not:

- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, or data decisions
- change target files
- modify CI
- install hooks
- delete or archive documents
- change task state

Boundary lines must include:

- This card writes target files: No
- This card modifies CI: No
- This card installs hooks: No
- This card deletes or archives documents: No
- This card changes task state: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No

## Standard Review Surfaces

Every Review Surface Card must include:

- `FUNCTIONAL_REVIEW`
- `CODE_REVIEW`
- `VERIFICATION_REVIEW`
- `DEBT_REVIEW`

DEBT_REVIEW is always required.

Additional surfaces are selected when project or intent signals require them:

| Surface | Trigger |
|---|---|
| `DATA_REVIEW` | schema, migration, database, API data, storage, finance, tax, order, payment |
| `PERMISSION_REVIEW` | login, auth, RBAC, roles, sessions, tenant boundary, admin |
| `UX_REVIEW` | UI, routes, frontend pages, miniprogram views, mobile screens |
| `DOCUMENTATION_REVIEW` | README, AGENTS, docs, SOP, governance documents |
| `RELEASE_IMPACT_REVIEW` | CI, deploy, staging, production, rollback, runbook |
| `EXISTING_GOVERNANCE_REVIEW` | AGENTS, `.ai-native`, scripts/guard, existing workflows, strong docs |
| `SECURITY_PRIVACY_REVIEW` | secrets, tokens, privacy, compliance, payment, billing, finance, personal data |

## Human Decision Boundary

Codex can select review surfaces automatically.

Codex cannot use the card to decide high-risk business or production questions.

These surfaces usually require human confirmation before execution:

- `DATA_REVIEW`
- `PERMISSION_REVIEW`
- `RELEASE_IMPACT_REVIEW`
- `EXISTING_GOVERNANCE_REVIEW`
- `SECURITY_PRIVACY_REVIEW`

## Post-Execution Review Contract

Every task that used a Review Surface Card must close with:

- Per-surface result: pass, fail, or not verified for each selected surface.
- Unverified surfaces: named with reason and owner.
- Debt result: fixed, deferred, or needs human decision.
- Next delivery state: self-test, internal trial, release review, or blocked.

Codex must not summarize only successful checks.

If a selected surface was not reviewed, Codex must say so.

## Relationship To Other Workflow Layers

Review Surface Governance does not replace:

- Review Loop
- Change Boundary
- Patch Classification
- Launch Readiness
- Existing Project Workflow Adapter

It decides what must be reviewed, then those layers provide the appropriate evidence, repair loop, boundary check, or release readiness check.

## Stop Conditions

Codex must stop for human decision when:

- a selected high-risk surface lacks evidence
- data migration or production data impact is unclear
- permission or tenant impact is unclear
- security, privacy, compliance, payment, or finance impact is unclear
- existing project governance conflicts with the proposed work
- a fix would require broad structural change outside the approved task
- the same issue repeats after review
