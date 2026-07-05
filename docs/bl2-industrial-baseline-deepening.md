# BL2 Industrial Baseline Deepening

## Human Summary

BL2 industrial baseline is the selected-only layer for production-sensitive, high-risk, customer-data, permission, payment, migration, or release-sensitive work.

1.16 deepens existing industrial packs. It does not make BL2 the default and does not approve implementation or release.

## What Changed In 1.16

Every industrial pack now follows one depth contract:

- applicability
- non-applicability
- scope boundary
- architecture baseline
- environment baseline
- data boundary
- permission boundary
- verification baseline
- release and rollback
- evidence template
- bad cases
- Codex forbidden actions
- maturity limits

The goal is to make pack selection concrete enough for Codex to judge gaps without pretending the pack is real project evidence.

## Core Rule

```text
Industrial pack files define expectations.
Project evidence proves whether a real project satisfies them.
```

## Required Project Evidence

For BL2, selected industrial packs must be backed by project evidence:

```text
docs/baseline-selection.md
docs/baseline-evidence.md
```

`docs/baseline-evidence.md` should include an evidence row for each selected pack requirement. Done rows need an evidence ref to a project file, command output, review packet, release record, audit note, screenshot, or verification artifact.

## Pack Boundaries

Platform packs do not absorb capability or risk responsibilities:

- Web, Mini Program, iOS, and Android packs cover runtime/platform behavior.
- Backend API covers API contracts and service boundaries.
- Internal Admin covers privileged workflows.
- Data Storage covers schema, migration, backup, restore, retention, and repair.
- Auth And Permission covers identity, roles, tenants, protected resources, and enforcement.
- CloudBase covers managed functions, access rules, environments, and platform config.
- Payment And Value Transfer covers money, balances, credits, refunds, reconciliation, and value movement.
- High-risk Change covers dangerous production, destructive, migration, auth, payment, data, or release-sensitive changes.

## Risk Overlay Rule

Risk overlays need risk-specific evidence.

Selecting `payment-value-transfer-industrial` without payment, refund, value movement, balance, billing, reconciliation, idempotency, or duplicate-submit evidence is invalid.

Selecting `high-risk-change-industrial` without risk classification, blast radius, approval scope, rollback, migration, production, destructive, or incident evidence is invalid.

## Forbidden Claims

BL2 selection is not:

- implementation approval
- release approval
- production approval
- security/privacy/compliance/legal approval
- payment, finance, tax, HR, or migration approval
- evidence that a real project already satisfies BL2

## How To Check

```bash
node scripts/check-industrial-pack.mjs .
node scripts/check-industrial-baseline.mjs <project> --strict
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
```
