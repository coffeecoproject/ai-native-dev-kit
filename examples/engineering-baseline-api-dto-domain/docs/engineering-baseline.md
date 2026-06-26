# Engineering Baseline

This file defines engineering decision rules Codex must read before making structural, typing, schema, API, domain, permission, migration, or state-model decisions.

It does not define business requirements.

## Human Summary

Generated API DTOs are boundary types, not domain models. Codex must preserve conversion layers between API DTOs, schema types, domain models, and UI view models.

## Status

Baseline status: CONFIRMED

Human decision status: APPROVED

Owner: dev-kit example owner

Last reviewed: 2026-06-26

## Scope

This baseline applies to:

- frontend
- backend
- API contracts
- generated types
- domain model
- UI view model

This baseline does not apply to:

- business priority
- release approval
- copywriting

## Code Structure Boundary

| Concern | Project Location | Source of Truth | Codex May Decide? |
|---|---|---|---|
| pages / routes | `src/pages` | route registry | No |
| components | `src/components` | component owner | Yes, when local-only |
| hooks | `src/hooks` | hook category policy | No |
| services | `src/services` | service owner | No |
| API client | `src/api/generated` | generated client | No |
| domain logic | `src/domain` | domain owner | No |
| shared utilities | `src/shared` | shared owner | No |

## Type Source of Truth

| Type Kind | Source | Generated? | Owner | Codex May Create? |
|---|---|---|---|---|
| API request DTO | OpenAPI spec | Yes | API owner | No |
| API response DTO | OpenAPI spec | Yes | API owner | No |
| domain model | `src/domain` | No | domain owner | No |
| database schema type | migration or ORM schema | Yes | data owner | No |
| UI view model | `src/view-models` | No | frontend owner | Yes, when derived from approved domain model |

## DTO / Schema / Domain Rules

DTO means generated API boundary shape.

Schema means persisted storage shape.

Domain model means internal behavior and invariants.

Conversion layer: `src/domain/mappers` converts DTOs into domain models and view models.

Codex must not:

- pass API response DTOs directly into domain logic
- persist UI view models
- add new generated type sources without approval
- remove the DTO-to-domain conversion layer

## API Contract Source

API contract source of truth: `api/openapi.yaml`.

Generated client or type command: `npm run generate:api`.

Manual contract change rules: update the spec first, regenerate types, then update conversion tests.

Codex must stop when:

- a task asks for manual API type edits
- generated files are stale
- a domain model field is missing from the contract

## Enum / String / Lookup / State Machine Decision Matrix

Do not choose based only on value count. Decide by ownership, change frequency, migration cost, label/i18n needs, sorting, enable-disable behavior, external values, reporting, and state transitions.

| Case | Preferred Pattern | Requires Human Decision? | Notes |
|---|---|---|---|
| stable small code-owned set | union type in domain model | No | used after DTO mapping |
| DB strong constraint, very low change | DB enum with migration and rollback plan | Yes | schema owner approves |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes | operations owner approves |
| external system values | string at boundary, mapped to domain type | Maybe | never leak past boundary |
| state transitions | state machine | Yes | transition tests required |
| UI color / label mapping | mapping layer | No | view-model concern |

## Frontend Boundary

| Concern | Rule |
|---|---|
| page / route responsibility | compose data and view models |
| component responsibility | render view models and emit UI events |
| hook categories | server hooks use generated client; form hooks own form state only |
| API client location | `src/api/generated` |
| server state | query cache layer |
| form state | form controller layer |
| UI state | local component state |
| global state | approved cross-route state only |
| error code handling | domain error mapper |
| permission code handling | permission model document |
| generated type source | OpenAPI generation command |

## Schema / Migration Rules

Codex may edit schema when: the task explicitly authorizes schema work and includes migration evidence.

Codex must stop when: DTO, schema, and domain fields diverge without an approved mapping decision.

Migration requires: migration file, rollback note, compatibility note, and verification evidence.

Rollback requires: documented handling for removed or transformed fields.

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
