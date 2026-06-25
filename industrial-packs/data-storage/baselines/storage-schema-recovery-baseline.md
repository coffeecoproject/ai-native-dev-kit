# Storage Schema And Recovery Baseline

## Required Coverage

- persistent entities and ownership boundaries are documented
- schema changes include compatibility and rollback or recovery notes
- migrations include dry-run, backup, or restore expectations where relevant
- deletion and retention behavior is explicit
- data integrity checks exist for high-risk changes
- exceptions and residual risks are recorded in project evidence

## AI Boundary

AI may prepare evidence and checks, but must not approve production migration, deletion, retention exceptions, or residual risk.
