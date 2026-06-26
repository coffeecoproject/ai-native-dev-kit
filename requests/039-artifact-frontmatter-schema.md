# Request: Artifact Frontmatter + Schema

## Raw Request

Execute Productization Hardcut phase `0.39.0`: add machine-readable artifact metadata and schemas while keeping Markdown readable for humans.

## User / Customer

Maintainers and real-project adopters who need workflow artifact checks to become more stable without forcing immediate migration of all old Markdown files.

## Problem

Workflow artifact checkers rely heavily on Markdown sections. This is readable, but it makes references, type, status, and level harder to validate consistently.

## Desired Outcome

New generated artifacts include frontmatter. Checkers validate frontmatter when present, warn for old artifacts by default, and fail old artifacts only in strict schema mode.

## Constraints

- Do not migrate all existing examples in this phase.
- Do not make old artifacts fail by default in `0.39.x`.
- Do not add dependencies.
- Do not weaken existing Markdown section checks.
- Do not implement the `0.40.0` fixture matrix expansion.

## Priority

P1

## Suggested Task Level

L2
