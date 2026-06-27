# Baseline Recommendation: Production-sensitive Project

## Human Summary

Can AI write now: No

Recommendation: Stay read-only. Environment, release, rollback, secret, CI, and production ownership must be confirmed before any apply.

## High-risk Areas

- production config
- secret boundary
- CI/CD
- deployment
- release process
- rollback process

## Safe Next Actions

- Produce a baseline recommendation only.
- Prepare a write plan only after the human confirms production ownership.
- Apply only reviewed baseline docs and reports.

## Actions AI Must Not Take Yet

- Do not edit `.env`.
- Do not read or write secret values.
- Do not change CI/CD, deployment, production config, release, rollback, or monitoring.
