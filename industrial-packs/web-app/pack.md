# Web App Industrial Pack

Status: Draft

## Purpose

Define industrial delivery expectations for browser-based products, dashboards, internal tools, and SaaS frontends.

This pack converts the `web-app` profile's focus areas into evidence-backed delivery requirements. It is not a full project implementation and does not prove that a real project is production-ready.

## Pack Type

`primary-platform`

## Applies To

- browser-based applications
- dashboards
- internal tools
- SaaS frontends
- web interfaces backed by APIs

## Requires Additional Packs When Relevant

- `backend-api-industrial` when APIs or server-side behavior are part of the system
- `internal-admin-industrial` when privileged admin workflows exist
- `auth-permission-industrial` when authentication, authorization, roles, tenants, or resource boundaries exist
- `data-storage-industrial` when project behavior depends on persistent data
- `payment-value-transfer-industrial` when money, credits, balances, or irreversible value movement exist
- `high-risk-change-industrial` when regulated, destructive, irreversible, or production-impacting work is in scope

## Industrial Standards

This draft pack covers the first Web industrial slice:

- runtime and UI state evidence
- form, interaction, and API failure behavior evidence
- security and permission evidence
- performance and accessibility evidence
- release readiness and rollback evidence
- Codex execution protocol
- audit entry points
- bootstrap templates

It intentionally stays framework-neutral. Framework, hosting, and scenario-specific rules should become separate candidate packs after they are split, normalized, checked, and dogfooded.

## Evidence Standard

A BL2 Web project must be able to point to concrete evidence for:

- loading, empty, error, forbidden, and success states
- responsive behavior for critical flows
- form validation, duplicate-submit prevention, destructive action confirmation, and recovery behavior when user actions change
- API timeout, network failure, unauthorized, forbidden, validation error, and server error behavior where relevant
- keyboard navigation, focus state, accessible names, and status messaging for critical interactions
- bundle, asset, loading, and interaction responsiveness impact when performance-sensitive code changes
- server-side permission enforcement when protected resources exist
- client-side secret and production config review
- release record, rollback plan, and monitoring evidence
- unresolved exceptions and residual risks

## Non-goals

- Do not require a specific framework such as React, Vue, Next.js, Nuxt, or Svelte.
- Do not require a specific hosting provider such as Vercel, Cloudflare, Netlify, Nginx, or a container platform.
- Do not require full E2E coverage for every low-risk UI change.
- Do not replace project-specific product, design, browser support, or release decisions.

## Does Not Cover By Itself

- backend API contract correctness
- admin operation approval flow
- data schema, migration, retention, or recovery correctness
- auth, role, tenant, or protected-resource enforcement
- payment, refund, balance, credit, or value-transfer correctness

## AI Boundaries

AI may draft code, tests, baseline docs, audit notes, and evidence records inside an approved task scope.

AI must not self-approve production release, production config, authentication, permission, secrets, irreversible behavior, accessibility-critical exceptions, performance exceptions, or residual risk acceptance.

## Scope Boundary

The Web pack governs browser runtime behavior, UI state, client-side interaction, API client behavior, accessibility, performance, and web release evidence. Backend, admin, data, auth, payment, and high-risk production responsibilities must be selected through companion packs when they affect correctness or safety.

## Architecture Baseline

Evidence should identify routing boundaries, screen ownership, state ownership, API client boundaries, form ownership, and how critical UI flows degrade when data, permission, or network state changes.

## Environment Baseline

Evidence should identify the package manager, browser support, build command, test command, local runtime, CI path, deployment target, and any environment variables by name only. Secret values and production config edits are outside this pack's authority.

## Data Boundary

This pack can record how data appears in the browser and how client state is cached or invalidated. Persistent data correctness, schema design, migration safety, backup, restore, retention, and repair require `data-storage-industrial`.

## Permission Boundary

This pack can verify visible forbidden states and client-side behavior around protected resources. Server-side enforcement, role models, tenant scope, and permission matrices require `auth-permission-industrial`.

## Verification Baseline

BL2 evidence should include browser behavior proof for loading, empty, success, error, forbidden, responsive, form, API failure, keyboard, accessible-name, focus, contrast, performance, and release-handoff behavior where those surfaces are in scope.

## Release And Rollback

Release evidence should reference the reviewed build artifact, deployment path, rollback or mitigation plan, monitoring signal, and unresolved exceptions. This pack does not approve production launch.

## Evidence Template

Record project evidence in `docs/baseline-evidence.md`. Each done requirement should include an evidence ref to a test output, screenshot, release record, review packet, audit note, or project-specific verification file.

## Bad Cases

- Selecting this pack for a backend-only or mobile-only project.
- Treating a visual screenshot as server permission evidence.
- Claiming web BL2 approval authorizes implementation or release.
- Handling payments, migrations, or production config with only the Web pack selected.

## Codex Forbidden Actions

Codex must not expand scope into backend, admin, data, auth, payment, production config, release, or high-risk changes without the matching companion pack and human approval.

## Maturity Limits

This pack remains draft. It is not stable, not production-proven, and does not prove any real Web project satisfies BL2 without project-specific evidence.
