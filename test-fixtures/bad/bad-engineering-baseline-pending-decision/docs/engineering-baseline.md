# Engineering Baseline

This fixture intentionally keeps an open engineering decision while otherwise providing all required sections.

## Human Summary

This bad baseline has enough structure but still contains an unresolved engineering decision.

## Status

Baseline status: CONFIRMED

Human decision status: APPROVED

Owner: fixture owner

Last reviewed: 2026-06-26

## Scope

This baseline applies to structural, typing, schema, API, and state-model decisions.

This baseline does not apply to business priority or release approval.

## Code Structure Boundary

Pages belong in `src/pages`; shared utilities belong in `src/shared`; Codex may not create new project-wide directories without approval.

## Type Source of Truth

API request and response types come from OpenAPI. Domain models live in `src/domain`. UI view models live in `src/view-models`.

## DTO / Schema / Domain Rules

DTO means generated API boundary shape.

Schema means persisted storage shape.

Domain model means internal behavior and invariants.

Conversion layer: DTOs map to domain models before business logic.

Codex must not bypass the conversion layer.

## API Contract Source

API contract source of truth: `api/openapi.yaml`.

Generated client or type command: `npm run generate:api`.

Manual contract change rules: update the contract first, then regenerate.

Codex must stop when changing public contract shape.

## Enum / String / Lookup / State Machine Decision Matrix

Do not choose based only on value count.

| Case | Preferred Pattern | Requires Human Decision? | Notes |
|---|---|---|---|
| stable small code-owned set | union type | No | local domain only |
| DB strong constraint, very low change | DB enum with rollback plan | Yes | migration owner approves |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes | product owner approves |
| external system values | string at boundary, mapped to domain type | Maybe | boundary only |
| state transitions | state machine | Yes | transition tests required |
| UI color / label mapping | mapping layer | No | view concern |

## Frontend Boundary

| Concern | Rule |
|---|---|
| page / route responsibility | compose feature surfaces |
| component responsibility | render view models |
| hook categories | server hooks call generated clients |
| API client location | `src/api/generated` |
| server state | query cache |
| form state | form controller |
| UI state | local component state |
| global state | approved cross-route state only |
| error code handling | domain mapper |
| permission code handling | permission model |
| generated type source | OpenAPI generation |

## Schema / Migration Rules

Codex may edit schema when the task explicitly authorizes migration work.

Codex must stop when rollback behavior is unclear.

Migration requires evidence and rollback notes.

Rollback requires a documented downgrade path.

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
| status transition model | union type / lookup table / state machine | state machine | human | PENDING |

