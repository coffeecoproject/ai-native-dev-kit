# Engineering Baseline

This project-level baseline defines engineering decision rules Codex must read before making structural, typing, schema, API, domain, permission, migration, or state-model decisions.

## Human Summary

- Initial placeholder. Codex derives this from project evidence before structural work and asks only for unavailable business facts or concrete real-world consent.

## Status

Baseline status: DRAFT

Human decision status: NOT_REQUIRED_FOR_TECHNICAL_DERIVATION

Owner: IntentOS/Codex

Last reviewed:

## Scope

This baseline applies to:

- iOS app structure
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
| pages / routes | Not applicable | project evidence + Codex decision | Yes |
| components | PENDING | project evidence + Codex decision | Yes |
| hooks | Not applicable | project evidence + Codex decision | Yes |
| services | PENDING | project evidence + Codex decision | Yes |
| API client | PENDING | project evidence + Codex decision | Yes |
| domain logic | PENDING | project evidence + Codex decision | Yes |
| shared utilities | PENDING | project evidence + Codex decision | Yes |

## Type Source of Truth

| Type Kind | Source | Generated? | Owner | Codex May Create? |
|---|---|---|---|---|
| API request DTO | PENDING | PENDING | IntentOS/Codex | Yes, with evidence |
| API response DTO | PENDING | PENDING | IntentOS/Codex | Yes, with evidence |
| domain model | PENDING | PENDING | IntentOS/Codex | Yes, with evidence |
| database schema type | PENDING | PENDING | IntentOS/Codex | Yes, with evidence |
| UI view model | PENDING | PENDING | IntentOS/Codex | Yes, with evidence |

## DTO / Schema / Domain Rules

DTO means: PENDING

Schema means: PENDING

Domain model means: PENDING

Conversion layer: PENDING

Codex must not:

- create or upgrade project-wide DTO, schema, domain, or generated type conventions without a bounded decision brief and internal review evidence

## API Contract Source

API contract source of truth: PENDING

Generated client or type command: PENDING

Manual contract change rules: PENDING

Codex must stop when:

- API contract source is missing or ambiguous

## Enum / String / Lookup / State Machine Decision Matrix

| Case | Preferred Pattern | Requires Internal Decision Record? | Notes |
|---|---|---|---|
| stable small code-owned set | typed constants / enum / union type | Maybe | Derive ownership from project evidence |
| DB strong constraint, very low change | DB enum with migration / rollback plan | Yes | Do not decide silently |
| configurable labels / i18n / ordering / enable-disable | lookup table | Yes | Usually business-owned |
| external system values | string at boundary, mapped to domain type | Maybe | Derive mapping authority from project evidence |
| state transitions | state machine | Yes | Define allowed transitions |
| UI color / label mapping | mapping layer | Maybe | Do not derive directly from enum value |

## Frontend Boundary

| Concern | Rule |
|---|---|
| page / route responsibility | Not applicable |
| component responsibility | PENDING |
| hook categories | Not applicable |
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

Migration requires: internal verification and rollback evidence; exact user consent is required only before a prepared production or irreversible real-data effect

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

- inspect current project evidence and derive the safest technically complete
  baseline
- use local patterns for low-risk local changes while unsupported broad
  conventions remain blocked
- record the baseline gap
- create and internally review a Decision Brief when needed

## Open Engineering Decisions

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Derive project engineering baseline | Fill this file from existing code and verified project evidence | Start with existing local patterns | IntentOS/Codex | CODEX_ACTION_REQUIRED |
