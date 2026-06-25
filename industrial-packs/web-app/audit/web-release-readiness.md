# Web Release Readiness Audit

## Purpose

Assess whether a Web change has enough release, rollback, monitoring, and residual risk evidence.

## Readiness Areas

- verification readiness
- production config readiness
- permission and security readiness
- rollback or disable readiness
- monitoring and post-release check readiness
- exception and residual risk acceptance

## Conclusions

Use one of:

- `pass`
- `conditional_pass`
- `fail`
- `not_audited`
- `not_applicable`

Do not use a single `pass` to cover production, release, security, privacy, and recovery readiness.

