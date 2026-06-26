# Decision Brief: DTO / Domain Boundary

## Human Summary

This example keeps generated API DTOs at the boundary and maps them into domain models before business logic uses them.

## Decision Needed

Can Codex use generated API response DTOs as domain models?

## Options

| Option | Good For | Risk |
|---|---|---|
| use DTO directly | short local prototype | leaks API shape into domain |
| map DTO to domain model | durable workflow | requires conversion tests |
| create UI view model from DTO | simple view-only screen | can bypass domain rules |

## Recommendation

Use DTO-to-domain mapping for behavior and UI view models for rendering.

## Human Decision

Status: APPROVED

Owner: dev-kit example owner
