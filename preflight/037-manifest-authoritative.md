# Preflight: Manifest Authoritative Asset Source

## Source Request

Request: `requests/037-manifest-authoritative.md`

## Clarity

READY

## Problem Summary

The manifest should become the single place to update asset inventories and safe static copy rules, but it must not change higher-risk governance behavior.

## Missing Information

- Init/update dry-run, backup, and apply-plan behavior is intentionally deferred to `0.38.0`.
- Artifact frontmatter and schema enforcement are intentionally deferred.
- Package publishing remains deferred.

## Assumptions

- Static asset copy rules can safely move into manifest.
- PR template and AGENTS handling must stay in code because they have human-approval migration logic.
- Industrial pack concrete pack selection must stay in code because it depends on explicit selection and installed packs.
- Generated projects can receive `.intentos/intentos-manifest.json` and `scripts/lib/manifest.mjs`.

## Direction Risks

- Manifest authority could accidentally bypass existing safety guards.
- Generated projects could fail if manifest or loader is not copied.
- Checkers could fail noisily if manifest schema is incomplete.
- A future asset could still require multiple script edits if one script keeps using old lists.

## Over-design Risks

- Rewriting all init/update behavior into plans belongs to `0.38.0`, not this phase.
- Moving PR template or AGENTS governance into raw copy rules would weaken approval behavior.
- Adding a schema engine or package dependency is unnecessary.

## MVP Recommendation

Make manifest authoritative for required path groups, workflow version assets, workflow readiness paths, and safe static copy rules. Keep all higher-risk governance functions unchanged.

## Non-goals

- No init/update plan or backup behavior.
- No migration command.
- No package publishing.
- No artifact schema enforcement.
- No industrial pack maturity change.
- No license rewrite.

## Domain Model Draft

- Authoritative manifest: source of asset groups and safe copy rules.
- Source required files: files that must exist in the intentos repository.
- Target required paths: files and directories required in generated projects.
- Workflow readiness paths: target core paths used by `workflow-next`.
- Copy rules: static source-to-target mappings that do not require human approval.

## Permission / Security Risks

No secrets, auth, permissions, production configuration, data migration, destructive operation, value transfer, or dependency addition are touched.

## First Vertical Slice

Make generated projects receive `.intentos/intentos-manifest.json` and `scripts/lib/manifest.mjs`, then verify `check-ai-workflow` and `workflow-next` both report a manifest-added target path without script edits.

## Suggested Specs

Spec: `specs/037-manifest-authoritative.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded, locally verifiable, and follows directly after the read-only manifest and CLI front-door phases.
