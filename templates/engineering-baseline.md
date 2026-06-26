# Engineering Baseline

This file defines engineering decision rules Codex must read before making structural, typing, schema, API, domain, permission, migration, or state-model decisions.

It does not define business requirements.

## Human Summary

Plain-language summary of the engineering decisions that matter most before AI writes code:

- 

## Status

Baseline status: DRAFT / PARTIAL / CONFIRMED

Human decision status: PENDING / APPROVED / REJECTED

Owner:

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

This baseline does not apply to:

- business requirements
- feature priority
- release approval

## Code Structure Boundary

Where do these concerns belong?

| Concern | Project Location | Source of Truth | Codex May Decide? |
|---|---|---|---|
| pages / routes |  |  | Yes / No |
| components |  |  | Yes / No |
| hooks |  |  | Yes / No |
| services |  |  | Yes / No |
| API client |  |  | Yes / No |
| domain logic |  |  | Yes / No |
| shared utilities |  |  | Yes / No |

## Type Source of Truth

| Type Kind | Source | Generated? | Owner | Codex May Create? |
|---|---|---|---|---|
| API request DTO |  | Yes / No |  | Yes / No |
| API response DTO |  | Yes / No |  | Yes / No |
| domain model |  | Yes / No |  | Yes / No |
| database schema type |  | Yes / No |  | Yes / No |
| UI view model |  | Yes / No |  | Yes / No |

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

Codex must stop when:

- 

## Enum / String / Lookup / State Machine Decision Matrix

Do not choose based only on value count. Decide by ownership, change frequency, migration cost, label/i18n needs, sorting, enable-disable behavior, external values, reporting, and state transitions.

| Case | Preferred Pattern | Requires Human Decision? | Notes |
|---|---|---|---|
| stable small code-owned set | typed constants / enum / union type | No / Yes |  |
| DB strong constraint, very low change | DB enum with migration / rollback plan | Yes |  |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes |  |
| external system values | string at boundary, mapped to domain type | Maybe |  |
| state transitions | state machine | Yes |  |
| UI color / label mapping | mapping layer | No / Yes |  |

## Frontend Boundary

Fill this when the project has a frontend. Leave as Not applicable when it does not.

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

Codex must stop when:

Migration requires:

Rollback requires:

## Engineering Decision Required When

Codex must stop and propose an engineering decision for:

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

## Codex Behavior

If baseline is complete:

- follow it

If baseline is missing:

- do not invent a project standard
- use local pattern only for low-risk local changes
- record the baseline gap
- create a Decision Brief when needed

## Open Engineering Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
|  |  |  | human | PENDING |
