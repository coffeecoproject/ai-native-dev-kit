# 1.59.0 Platform Release Recipes Plan

## Goal

Add platform release maps so a beginner release request can be routed by platform without asking the user to understand release internals.

1.59 continues the 1.58 Release Guide path:

```text
Natural language release intent
  -> Release Guide
  -> Platform Release Recipe
  -> Launch Review / Unified Closure
  -> Structured Release Approval
  -> Release Execution Plan
```

## Scope

In scope:

- platform recipe protocol
- recipe registry
- recipe resolver
- recipe checker
- strict recipe examples
- draft recipe visibility
- release-guide bridge into selected recipe

Out of scope:

- release handoff packs
- provider API integration
- deployment automation
- preview publication
- app-store or mini-program upload
- production deployment
- secret handling
- CI/CD mutation

## Strict Recipes

1.59 ships three strict recipes:

| Recipe | Reason |
|---|---|
| `web-hosted-preview` | common beginner web launch path and preview-first |
| `backend-api-handoff` | forces release owner, rollback, monitoring, migration review, and data-risk boundaries |
| `mini-program-review-handoff` | covers mini-program upload/review/release human ownership |

Draft recipes remain visible for iOS, Android, internal admin, and server/container release paths. Draft recipes cannot pass `--strict`.

## Acceptance

- README / VERSION / package / manifest report `1.59.0`
- `release-recipe` and `release-recipe-check` are available through CLI
- strict recipes pass checker
- draft recipes are marked draft and fail strict checks
- resolver explains selected recipe and confidence
- release-guide JSON includes platform recipe routing
- provider secrets are never requested or stored
- production deploy, store submission, mini-program release, migrations, DNS, payment, permissions, production data, and production config remain human-owned or external-system-owned
- bad fixtures fail for unsafe recipe patterns
- `npm run verify` passes
- `git diff --check` passes
