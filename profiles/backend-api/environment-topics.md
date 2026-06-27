# Backend API Environment Topics

Use these topics when drafting `docs/environment-baseline.md` for a backend API project.

## Runtime

- runtime version
- package manager
- local service start command
- worker or job command
- database migration command
- seed command

## Data And Contracts

- database ownership
- migration policy
- API contract source
- schema generation source
- auth and permission boundary
- rate limits

## Environment Variables

- database URL variable name
- cache/message queue variable names
- auth/session variable names
- external service variable names

Variable names may be recorded. Secret values and credential-bearing connection strings must never be recorded.

## Operations

- test environment
- preview/staging/production status
- deploy command
- rollback and backup process
- logs, metrics, alerts, and incident owner
