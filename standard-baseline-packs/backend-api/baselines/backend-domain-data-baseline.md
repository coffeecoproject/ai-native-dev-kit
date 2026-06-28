# Backend Domain And Data Baseline

## Scope

Use this baseline when backend domain state, database schema, migrations, or persistent records are in scope.

## Required Decisions

- Source of truth for domain types.
- When to use enum, lookup table, or string value.
- Migration ownership and rollback expectations.
- Seed and fixture policy.
- Data retention or deletion expectations when relevant.

## Minimum Expectations

- Domain values are not represented as loose strings when a constrained type is required.
- Schema changes have a migration path.
- Data writes are testable locally or in a documented safe environment.
- Migration and rollback risk is recorded before destructive changes.
- Persistent data assumptions are not inferred from UI code alone.

## Boundary

This baseline does not approve real data migration or destructive operations.
