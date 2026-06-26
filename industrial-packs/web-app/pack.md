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

## AI Boundaries

AI may draft code, tests, baseline docs, audit notes, and evidence records inside an approved task scope.

AI must not self-approve production release, production config, authentication, permission, secrets, irreversible behavior, accessibility-critical exceptions, performance exceptions, or residual risk acceptance.
