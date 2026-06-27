# Environment Baseline

## Human Summary

<baseline-generated-summary>

Project: <project-name>

Detected profile candidates: <detected-profile-candidates>

Recommended baseline level: <recommended-bl-level>

This file records environment facts, unknowns, and explicit non-applicable items. It must not invent staging, production, rollback, monitoring, or release processes.

## Status

Baseline status: DRAFT

Human decision status: PENDING

Owner: PENDING_CONFIRMATION

Last reviewed: <date>

## Scope

Applies to:

- PENDING_CONFIRMATION

Does not apply to:

- NOT_APPLICABLE until humans confirm project-specific exclusions.

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
| PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |

## Package Manager And Lockfile

Package manager: PENDING_CONFIRMATION

Lockfile: PENDING_CONFIRMATION

Policy: PENDING_CONFIRMATION

Codex may change dependencies: Human approval required

## Environment Variables

| Name | Required? | Environment | Owner | Secret? | Source | Status |
|---|---|---|---|---|---|---|
| PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |

Important rule:
Record variable names and ownership only. Never record secret values.

## Secret Boundary

Secret values must never be written into this file.

Secret storage: PENDING_CONFIRMATION

Who can access: PENDING_CONFIRMATION

Codex must not:

- create or edit `.env` files
- read or write secret values into workflow docs
- commit private keys, service account JSON, production credentials, or connection strings with embedded credentials

Rotation / incident owner: PENDING_CONFIRMATION

## External Services

| Service | Used for | Environment | Owner | Status |
|---|---|---|---|---|
| PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |

## Test Environment

Test command: PENDING_CONFIRMATION

Test data policy: PENDING_CONFIRMATION

Mock / real service policy: PENDING_CONFIRMATION

CI test command: PENDING_CONFIRMATION

## Preview / Staging / Production

| Environment | Exists? | URL / Ref | Owner | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|---|
| Preview | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |
| Staging | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |
| Production | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION | PENDING_CONFIRMATION |

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

- rollback ownership is unknown
- production config is needed
- release approval is missing
- secret values or production credentials are needed

## Logs / Monitoring / Alerts

Logs: PENDING_CONFIRMATION

Metrics: PENDING_CONFIRMATION

Alerts: PENDING_CONFIRMATION

Incident owner: PENDING_CONFIRMATION

Evidence refs: PENDING_CONFIRMATION

## Open Environment Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Confirm local runtime and commands | Use existing project docs / package scripts / human input | PENDING_CONFIRMATION | human | PENDING_CONFIRMATION |
| Confirm release and rollback state | CONFIRMED / PENDING_CONFIRMATION / NOT_APPLICABLE | PENDING_CONFIRMATION | human | PENDING_CONFIRMATION |
