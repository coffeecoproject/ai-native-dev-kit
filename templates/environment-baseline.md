# Environment Baseline

## Codex Environment Summary

Conclusion:

Selected environment model:

Can Codex continue now: yes / limited / no

Evidence refs:

Missing business or external fact, if any:

## Human Summary

<baseline-generated-summary>

Project: <project-name>

Detected profile candidates: <detected-profile-candidates>

Recommended baseline level: <recommended-bl-level>

This file records environment facts, unknowns, and explicit non-applicable
items. It must not invent staging, production, rollback, monitoring, or release
processes.

## Status

Baseline status: DRAFT / PARTIAL / READY

Evidence status: MISSING / PARTIAL / VERIFIED

Last reviewed: <date>

## Scope

Applies to:

- project environments and commands discovered by Codex

Does not apply to:

- items marked NOT_APPLICABLE with project evidence

## Local Development

Runtime: UNKNOWN

Package manager: UNKNOWN

Install command: UNKNOWN

Dev command: UNKNOWN

Local test command: UNKNOWN

Known local dependencies: UNKNOWN

Discovery evidence:

## Runtime Versions

| Runtime | Version | Source | Status |
|---|---|---|---|
| UNKNOWN | UNKNOWN | UNKNOWN | PENDING_CODEX_DISCOVERY |

## Package Manager And Lockfile

Package manager: UNKNOWN

Lockfile: UNKNOWN

Policy: Codex derives this from project files and the selected baseline.

Dependency changes: Codex may make reversible project-local changes after
internal review and verification. Concrete paid services or external-account
effects require `REAL_WORLD_CONSENT_NEEDED`.

## Environment Variables

| Name | Required? | Environment | Responsibility domain | Secret? | Source | Status |
|---|---|---|---|---|---|---|
| UNKNOWN | UNKNOWN | UNKNOWN | ENGINEERING / EXTERNAL_PROVIDER | UNKNOWN | UNKNOWN | PENDING_CODEX_DISCOVERY |

Record variable names and provenance only. Never record secret values.

## Secret Boundary

Secret values must never be written into this file or committed to source.

Secret storage mechanism: UNKNOWN

Access boundary: UNKNOWN

Codex must not expose or invent private keys, service-account material,
production credentials, or credential-bearing connection strings. When a real
account secret is required, Codex prepares the secure configuration path and
asks only for the concrete external-account action.

## External Services

| Service | Used for | Environment | Responsibility domain | Status |
|---|---|---|---|---|
| UNKNOWN | UNKNOWN | UNKNOWN | EXTERNAL_PROVIDER | PENDING_CODEX_DISCOVERY |

## Test Environment

Test command: UNKNOWN

Test data policy: UNKNOWN

Mock / real service policy: UNKNOWN

CI test command: UNKNOWN

Isolation and cleanup evidence:

## Preview / Staging / Production

| Environment | Exists? | URL / ref | Authority source | Deploy command | Rollback path | Status |
|---|---|---|---|---|---|---|
| Preview | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PENDING_CODEX_DISCOVERY |
| Staging | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PENDING_CODEX_DISCOVERY |
| Production | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PENDING_CODEX_DISCOVERY |

## CI / CD

CI system: UNKNOWN

Required checks: UNKNOWN

Build command: UNKNOWN

Deploy command: UNKNOWN

Codex may change CI within the requested technical boundary after internal
review and verification. Triggering production, paid runners, or externally
visible publication requires consent to that concrete effect.

## Release Process

Release authority source: UNKNOWN

Release checklist: UNKNOWN

Real-world consent required: UNKNOWN

Evidence required: UNKNOWN

## Rollback Process

Rollback mechanism: UNKNOWN

Rollback command or process: UNKNOWN

Rollback evidence: UNKNOWN

Codex must keep the affected release action disabled when rollback cannot be
proved, production credentials are unavailable, or concrete production consent
has not been given. Do not ask the user to choose the technical rollback plan.

## Logs / Monitoring / Alerts

Logs: UNKNOWN

Metrics: UNKNOWN

Alerts: UNKNOWN

Incident response path: UNKNOWN

Evidence refs: UNKNOWN

## Open Environment Items

| Item | Classification | Codex recommendation | Evidence needed | Status |
|---|---|---|---|---|
| local runtime and commands | NO_USER_ACTION | inspect project files and run safe probes | project-local command evidence | PENDING_CODEX_DISCOVERY |
| release and rollback facts | NO_USER_ACTION / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | inspect project authority and prepare the safest path | project or external evidence | PENDING_CODEX_DISCOVERY |
