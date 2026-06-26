# Engineering Baseline

This file defines engineering decision rules Codex must read before making structural, typing, schema, API, domain, permission, migration, or state-model decisions.

It does not define business requirements.

## Human Summary

This example requires status-like values to be decided by ownership, change frequency, label needs, reporting needs, migration cost, and transition behavior. Codex must not choose enum, string, lookup, or state machine only because the value set is small.

## Status

Baseline status: CONFIRMED

Human decision status: APPROVED

Owner: dev-kit example owner

Last reviewed: 2026-06-26

## Scope

This baseline applies to:

- frontend state display
- backend API contracts
- data storage
- generated types
- domain model
- state model

This baseline does not apply to:

- feature priority
- release approval
- product copy

## Code Structure Boundary

| Concern | Project Location | Source of Truth | Codex May Decide? |
|---|---|---|---|
| pages / routes | `src/pages` | local route registry | No |
| components | `src/components` | local component index | Yes, when local-only |
| hooks | `src/hooks` | hook category notes | No |
| services | `src/services` | service module owner | No |
| API client | `src/api/generated` | generated client command | No |
| domain logic | `src/domain` | domain model owner | No |
| shared utilities | `src/shared` | shared utility owner | No |

## Type Source of Truth

| Type Kind | Source | Generated? | Owner | Codex May Create? |
|---|---|---|---|---|
| API request DTO | OpenAPI spec | Yes | API owner | No |
| API response DTO | OpenAPI spec | Yes | API owner | No |
| domain model | `src/domain/status-model.ts` | No | domain owner | No |
| database schema type | migration schema | Yes | data owner | No |
| UI view model | `src/view-models` | No | frontend owner | Yes, when local-only |

## DTO / Schema / Domain Rules

DTO means the generated API boundary shape.

Schema means the storage shape controlled by migrations.

Domain model means the internal value model used by business logic and state transitions.

Conversion layer: DTO values are converted into domain values in `src/domain/mappers`.

Codex must not:

- use API DTOs as domain models
- derive labels or colors directly from raw stored values
- turn a local mapping into a project-wide status standard

## API Contract Source

API contract source of truth: OpenAPI spec in `api/openapi.yaml`.

Generated client or type command: `npm run generate:api`.

Manual contract change rules: contract changes require an approved decision brief and regenerated client evidence.

Codex must stop when:

- adding a new status value
- changing a public API status field
- introducing a new generated type source

## Enum / String / Lookup / State Machine Decision Matrix

Do not choose based only on value count. Decide by ownership, change frequency, migration cost, label/i18n needs, sorting, enable-disable behavior, external values, reporting, and state transitions.

| Case | Preferred Pattern | Requires Human Decision? | Notes |
|---|---|---|---|
| stable small code-owned set | union type exported from domain model | No | only when storage is not constrained |
| DB strong constraint, very low change | DB enum with migration and rollback plan | Yes | requires release evidence |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes | product or operations owned |
| external system values | string at boundary, mapped to domain type | Maybe | raw external value stays at boundary |
| state transitions | state machine | Yes | transition rules must be explicit |
| UI color / label mapping | mapping layer | No | never infer UI directly from stored value |

## Frontend Boundary

| Concern | Rule |
|---|---|
| page / route responsibility | load route data and compose feature surfaces |
| component responsibility | render props without owning domain transitions |
| hook categories | data hooks call generated API client; UI hooks own local UI state only |
| API client location | `src/api/generated` |
| server state | query cache layer |
| form state | form controller layer |
| UI state | local component or view model |
| global state | only for approved cross-route state |
| error code handling | `src/domain/error-map.ts` |
| permission code handling | permission model document |
| generated type source | OpenAPI generation command |

## Schema / Migration Rules

Codex may edit schema when: an approved task explicitly includes schema changes and rollback evidence.

Codex must stop when: a status value would require data migration, rollback planning, or release coordination.

Migration requires: migration file, rollback plan, compatibility notes, and verification evidence.

Rollback requires: documented downgrade behavior for every stored status value.

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

Codex must not create or upgrade project-wide engineering conventions without human approval.

## Open Engineering Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
