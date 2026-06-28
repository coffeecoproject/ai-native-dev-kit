# Rollback Baseline

## Scope

Use this baseline when a change can affect deployed behavior, persistent data, user access, payment/value transfer, or service availability.

## Required Decisions

- Rollback owner.
- Restore point or rollback method.
- Data compatibility expectation.
- Rollback verification command.
- Time window for rollback decision.

## Minimum Expectations

- Rollback path is documented or `NOT_AVAILABLE` is explicitly accepted.
- Irreversible changes are escalated before implementation.
- Database migration rollback risk is recorded.
- Production configuration changes have a restore path.
- Rollback evidence is not inferred from pack files.

## Boundary

This baseline does not approve destructive operations or production rollback execution.
