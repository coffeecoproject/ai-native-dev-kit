# Engineering Baseline

This project-level baseline defines engineering decision rules Codex must read before making structural, typing, schema, API, domain, permission, migration, or state-model decisions.

## Human Summary

- Initial placeholder. Fill this from project evidence and human decisions before structural work.

## Status

Baseline status: DRAFT

Human decision status: PENDING

Owner: human

Last reviewed:

## Scope

This baseline applies to:

- frontend when present
- backend when present
- data storage when present
- API contracts
- generated types
- domain model
- permissions
- state model

This baseline does not define business requirements.

## Code Structure Boundary

| Concern | Project Location | Source of Truth | Codex May Decide? |
|---|---|---|---|
| pages / routes | PENDING | project decision | No |
| components | PENDING | project decision | No |
| hooks | PENDING | project decision | No |
| services | PENDING | project decision | No |
| API client | PENDING | project decision | No |
| domain logic | PENDING | project decision | No |
| shared utilities | PENDING | project decision | No |

## Type Source of Truth

| Type Kind | Source | Generated? | Owner | Codex May Create? |
|---|---|---|---|---|
| API request DTO | PENDING | PENDING | human | No |
| API response DTO | PENDING | PENDING | human | No |
| domain model | PENDING | PENDING | human | No |
| database schema type | PENDING | PENDING | human | No |
| UI view model | PENDING | PENDING | human | No |

## DTO / Schema / Domain Rules

DTO means: PENDING

Schema means: PENDING

Domain model means: PENDING

Conversion layer: PENDING

Codex must not:

- create or upgrade project-wide DTO, schema, domain, or generated type conventions without human approval

## API Contract Source

API contract source of truth: PENDING

Generated client or type command: PENDING

Manual contract change rules: PENDING

Codex must stop when:

- API contract source is missing or ambiguous

## Enum / String / Lookup / State Machine Decision Matrix

| Case | Preferred Pattern | Requires Human Decision? | Notes |
|---|---|---|---|
| stable small code-owned set | typed constants / enum / union type | Maybe | Confirm ownership first |
| DB strong constraint, very low change | DB enum with migration / rollback plan | Yes | Do not decide silently |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes | Usually business-owned |
| external system values | string at boundary, mapped to domain type | Maybe | Confirm mapping owner |
| state transitions | state machine | Yes | Define allowed transitions |
| UI color / label mapping | mapping layer | Maybe | Do not derive directly from enum value |

## Frontend Boundary

| Concern | Rule |
|---|---|
| page / route responsibility | PENDING |
| component responsibility | PENDING |
| hook categories | PENDING |
| API client location | PENDING |
| server state | PENDING |
| form state | PENDING |
| UI state | PENDING |
| global state | PENDING |
| error code handling | PENDING |
| permission code handling | PENDING |
| generated type source | PENDING |

## Schema / Migration Rules

Codex may edit schema when: PENDING

Codex must stop when: schema, migration, rollback, data compatibility, or production data risk is unclear

Migration requires: human approval for production-impacting changes

Rollback requires: PENDING

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
| Confirm project engineering baseline | Fill this file from existing code and human decisions | Start with existing local patterns | human | PENDING |
