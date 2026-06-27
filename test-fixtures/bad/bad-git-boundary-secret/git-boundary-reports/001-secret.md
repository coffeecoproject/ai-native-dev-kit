# Git Boundary Report: secret misuse

## Human Summary

This bad fixture stores a secret-like value.

## Change Scope

Bad fixture.

## Should Enter Git

- `docs/environment-baseline.md`

## Conditional / Needs Human Decision

- none

## Should Stay Local

- cache

## Never Commit Check

| Item | Status | Notes |
|---|---|---|
| Secrets | FAIL | API_TOKEN=abcdefghijklmnopqrstuvwx |
| Tokens | FAIL | token included |
| Private keys | PASS | none |
| Raw conversations | PASS | none |
| Local caches | PASS | none |

## Human Decision

Pending

## Audit Notes

Secret-like values must not be persisted.

