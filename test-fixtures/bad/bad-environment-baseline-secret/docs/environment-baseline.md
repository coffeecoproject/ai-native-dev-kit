# Environment Baseline

## Human Summary

Bad fixture with an obvious secret value.

## Status

Baseline status: DRAFT

Human decision status: PENDING

Owner: test

Last reviewed: 2026-06-27

## Scope

Applies to: test

Does not apply to: NOT_APPLICABLE

## Local Development

Runtime: CONFIRMED

Package manager: CONFIRMED

Install command: CONFIRMED

Dev command: CONFIRMED

Local test command: CONFIRMED

Known local dependencies: CONFIRMED

## Runtime Versions

| Runtime | Version | Source | Status |
|---|---|---|---|
| Node | 20 | test | CONFIRMED |

## Package Manager And Lockfile

Package manager: npm

Lockfile: package-lock.json

Policy: test

Codex may change dependencies: Human approval required

## Environment Variables

| Name | Required? | Environment | Owner | Secret? | Source | Status |
|---|---|---|---|---|---|---|
| API_KEY | Yes | local | test | Yes | api_key=abc123 | CONFIRMED |

Important rule:
Record variable names and ownership only. Never record secret values.

## Secret Boundary

Secret values must never be written into this file.

Secret storage: test

Who can access: test

Codex must not: write secrets

Rotation / incident owner: test

## External Services

| Service | Used for | Environment | Owner | Status |
|---|---|---|---|---|
| test | test | test | test | CONFIRMED |

## Test Environment

Test command: npm test

Test data policy: test

Mock / real service policy: test

CI test command: npm test

## Preview / Staging / Production

| Environment | Exists? | URL / Ref | Owner | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|---|
| Production | NOT_APPLICABLE | NOT_APPLICABLE | test | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |

## CI / CD

CI system: NOT_APPLICABLE

Required checks: NOT_APPLICABLE

Build command: NOT_APPLICABLE

Deploy command: NOT_APPLICABLE

Codex may modify CI: Human approval required

## Release Process

Release owner: NOT_APPLICABLE

Release checklist: NOT_APPLICABLE

Approval required: NOT_APPLICABLE

Evidence required: NOT_APPLICABLE

## Rollback Process

Rollback owner: NOT_APPLICABLE

Rollback command or process: NOT_APPLICABLE

Rollback evidence: NOT_APPLICABLE

Codex must stop when: production is needed

## Logs / Monitoring / Alerts

Logs: NOT_APPLICABLE

Metrics: NOT_APPLICABLE

Alerts: NOT_APPLICABLE

Incident owner: NOT_APPLICABLE

Evidence refs: NOT_APPLICABLE

## Open Environment Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| none | none | none | test | NOT_APPLICABLE |
