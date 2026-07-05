# Preflight: Read-only IntentOS Manifest

## Source Request

Request: `requests/035-readonly-manifest.md`

## Clarity

READY

## Problem Summary

The repository needs a central manifest to describe current source and generated-project assets, but the manifest must not drive runtime behavior yet.

## Missing Information

- Real long-term package and CLI shape is intentionally deferred to later phases.
- Authoritative manifest migration rules are intentionally deferred to `0.37.0`.

## Assumptions

- Existing script lists remain the source of behavior for this phase.
- Manifest drift checking can compare manifest groups against current script and template lists.
- A decision brief is appropriate because this phase decides manifest authority boundaries.

## Direction Risks

- Manifest could be mistaken as authoritative before it is safe.
- Drift checks could become noisy if groups are too broad.
- Schema validation could be too weak to catch malformed groups.

## Over-design Risks

- Building a full schema engine is not needed for this phase.
- Rewriting init/update/check logic is explicitly deferred.
- CLI integration is explicitly deferred.

## MVP Recommendation

Add a read-only manifest, a schema file, a small loader, and a drift checker. Keep all existing scripts on their current lists.

## Non-goals

- No authoritative manifest behavior.
- No CLI.
- No target-project behavior change.
- No artifact frontmatter.
- No package publishing.

## Domain Model Draft

- Manifest: central inventory of current intentos assets.
- Manifest schema: structure rule for required fields and groups.
- Drift check: comparison between manifest groups and existing script/template lists.
- Authority boundary: manifest is observable but not executable.

## Permission / Security Risks

No secrets, auth, permissions, production configuration, data migration, destructive operation, or value transfer are touched.

## First Vertical Slice

Create `intentos-manifest.json`, validate it with `scripts/check-manifest.mjs`, and call that checker from `scripts/check-intentos.mjs`.

## Suggested Specs

Spec: `specs/035-readonly-manifest.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded and can be verified locally without changing target-project behavior.
