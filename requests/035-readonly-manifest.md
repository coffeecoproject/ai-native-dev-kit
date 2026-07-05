# Request: Read-only IntentOS Manifest

## Raw Request

Continue Productization Hardcut by implementing phase `0.35.0`: introduce a central intentos manifest in read-only mode.

## User / Customer

Maintainers of `intentos` who need a stable asset inventory before CLI, init/update safety, schema enforcement, and authoritative manifest work.

## Problem

The IntentOS has many asset lists repeated across scripts and templates. Future phases need a central manifest to compare against those lists, but making the manifest authoritative immediately would create too much risk.

## Desired Outcome

Add a manifest, schema, loader, and checker that mirror existing asset lists and detect drift without changing existing script behavior.

## Constraints

- Manifest must be read-only in this phase.
- Do not make manifest authoritative for init, update, workflow checks, or generated-project behavior.
- Do not implement CLI.
- Do not implement artifact frontmatter or schema enforcement.
- Do not change target-project bootstrap semantics.
- Keep `check-intentos` green and make it run the manifest check.

## Priority

P1

## Suggested Task Level

L2
