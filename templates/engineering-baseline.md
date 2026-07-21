# Engineering Baseline

This file defines engineering decision rules Codex must read before making
structural, typing, schema, API, domain, permission, migration, or state-model
decisions. It does not define business requirements.

## Codex Technical Summary

Conclusion:

Selected baseline level and profiles:

Can Codex continue now: yes / limited / no

Evidence refs:

Missing business or external fact, if any:

## Status

Baseline status: DRAFT / PARTIAL / READY

Evidence status: MISSING / PARTIAL / VERIFIED

Last reviewed:

## Scope

This baseline applies to:

- frontend
- backend
- data storage
- API contracts
- generated types
- domain model
- permissions
- state model

This baseline does not authorize:

- invented business rules
- feature-priority changes outside the request
- production or other real-world effects

## Code Structure Boundary

| Concern | Project location | Source of truth | Codex rule and evidence |
|---|---|---|---|
| pages / routes |  |  |  |
| components |  |  |  |
| hooks |  |  |  |
| services |  |  |  |
| API client |  |  |  |
| domain logic |  |  |  |
| shared utilities |  |  |  |

## Type Source Of Truth

| Type kind | Source | Generated? | Authority | Codex creation rule |
|---|---|---|---|---|
| API request DTO |  | Yes / No |  |  |
| API response DTO |  | Yes / No |  |  |
| domain model |  | Yes / No |  |  |
| database schema type |  | Yes / No |  |  |
| UI view model |  | Yes / No |  |  |

## DTO / Schema / Domain Rules

DTO means:

Schema means:

Domain model means:

Conversion layer:

Codex must not:

-

## API Contract Source

API contract source of truth:

Generated client or type command:

Manual contract change rules:

Required review and verification:

## Enum / String / Lookup / State Machine Decision Matrix

Do not choose based only on value count. Decide by ownership, change frequency,
migration cost, label/i18n needs, sorting, enable-disable behavior, external
values, reporting, and state transitions.

| Case | Preferred pattern | Required technical evidence | Notes |
|---|---|---|---|
| stable small code-owned set | typed constants / enum / union type | ownership and compatibility review |  |
| DB strong constraint, very low change | DB enum with migration / rollback plan | migration and rollback evidence |  |
| configurable labels / i18n / ordering / enable-disable | lookup table | lifecycle and data-integrity evidence |  |
| external system values | string at boundary, mapped to domain type | boundary contract evidence |  |
| state transitions | state machine | transition and negative-path tests |  |
| UI color / label mapping | mapping layer | mapping coverage |  |

## Frontend Boundary

Fill this when the project has a frontend. Mark it Not applicable with evidence
when it does not.

| Concern | Rule |
|---|---|
| page / route responsibility |  |
| component responsibility |  |
| hook categories |  |
| API client location |  |
| server state |  |
| form state |  |
| UI state |  |
| global state |  |
| error code handling |  |
| permission code handling |  |
| generated type source |  |

## Schema / Migration Rules

Codex may edit schema when:

Required migration evidence:

Required rollback evidence:

Real-data or production consent boundary:

## Engineering Review Required When

Codex must record and review an explicit technical decision for:

- new directory convention
- new shared abstraction
- new API contract pattern
- DTO / domain / schema boundary change
- enum / string / lookup / state-machine choice
- database schema or migration
- permission model
- generated type source
- new dependency
- cross-module state pattern

These are internal technical reviews. They do not become user approval prompts.

## Codex Behavior

If the baseline is complete, follow it and cite its evidence.

If the baseline is missing, Codex reads local patterns, drafts the missing rule,
checks it against the project and selected platform pack, records the decision,
and verifies affected code. Ask the user only for an unavailable business fact,
external fact, or consent to a concrete real-world effect.

## Open Engineering Decisions

| Decision | Options | Codex recommendation | Evidence or experiment | Status |
|---|---|---|---|---|
|  |  |  |  | PENDING_INTERNAL_REVIEW |
