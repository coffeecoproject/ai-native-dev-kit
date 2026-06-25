# API Contract And Runtime Baseline

## Required Coverage

- public and internal API contracts are documented where relevant
- validation, error, forbidden, rate, timeout, and retry behavior are covered
- authentication and authorization are enforced server-side
- data writes and external side effects are traceable
- compatibility impact is reviewed before changing existing contracts
- observability and rollback paths are available for production-impacting changes

## AI Boundary

AI may prepare contracts, tests, and evidence, but must not approve production config, permissions, destructive operations, or residual risk.
