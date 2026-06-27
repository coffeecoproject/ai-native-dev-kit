# Environment Baseline

## Human Summary

New web project environment baseline. Unknown facts stay pending.

## Status

Baseline status: DRAFT

Human decision status: PENDING

Owner: human

Last reviewed: 2026-06-27

## Scope

Applies to local web development and first task verification.

Does not apply to:

- production release until explicitly confirmed

## Local Development

Runtime: PENDING_CONFIRMATION

Package manager: PENDING_CONFIRMATION

Install command: PENDING_CONFIRMATION

Dev command: PENDING_CONFIRMATION

Local test command: PENDING_CONFIRMATION

Known local dependencies: PENDING_CONFIRMATION

## Runtime Versions

| Runtime | Version | Source | Status |
|---|---|---|---|
| Node.js | PENDING_CONFIRMATION | package/tooling evidence | PENDING_CONFIRMATION |

## Package Manager And Lockfile

Package manager: PENDING_CONFIRMATION

Lockfile: PENDING_CONFIRMATION

Policy: PENDING_CONFIRMATION

Codex may change dependencies: Human approval required

## Environment Variables

| Name | Required? | Environment | Owner | Secret? | Source | Status |
|---|---|---|---|---|---|---|
| API_BASE_URL | PENDING_CONFIRMATION | local | human | No | pending | PENDING_CONFIRMATION |

Important rule:
Record variable names and ownership only. Never record secret values.

## Secret Boundary

Secret values must never be written into this file.

Secret storage: PENDING_CONFIRMATION

Who can access: PENDING_CONFIRMATION

Codex must not:

- create or edit `.env` files
- record secret values

Rotation / incident owner: PENDING_CONFIRMATION

## External Services

| Service | Used for | Environment | Owner | Status |
|---|---|---|---|---|
| API | data access | local | human | PENDING_CONFIRMATION |

## Test Environment

Test command: PENDING_CONFIRMATION

Test data policy: PENDING_CONFIRMATION

Mock / real service policy: PENDING_CONFIRMATION

CI test command: PENDING_CONFIRMATION

## Preview / Staging / Production

| Environment | Exists? | URL / Ref | Owner | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|---|
| Preview | PENDING_CONFIRMATION | PENDING_CONFIRMATION | human | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |
| Production | PENDING_CONFIRMATION | PENDING_CONFIRMATION | human | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |

## CI / CD

CI system: PENDING_CONFIRMATION

Required checks: PENDING_CONFIRMATION

Build command: PENDING_CONFIRMATION

Deploy command: PENDING_CONFIRMATION

Codex may modify CI: Human approval required

## Release Process

Release owner: PENDING_CONFIRMATION

Release checklist: PENDING_CONFIRMATION

Approval required: PENDING_CONFIRMATION

Evidence required: PENDING_CONFIRMATION

## Rollback Process

Rollback owner: PENDING_CONFIRMATION

Rollback command or process: PENDING_CONFIRMATION

Rollback evidence: PENDING_CONFIRMATION

Codex must stop when:

- release or rollback owner is unknown

## Logs / Monitoring / Alerts

Logs: PENDING_CONFIRMATION

Metrics: PENDING_CONFIRMATION

Alerts: PENDING_CONFIRMATION

Incident owner: PENDING_CONFIRMATION

Evidence refs: PENDING_CONFIRMATION

## Open Environment Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Confirm dev/test commands | package scripts / human input | package scripts | human | PENDING_CONFIRMATION |
