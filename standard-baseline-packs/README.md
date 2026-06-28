# Standard Baseline Packs

Standard baseline packs define normal engineering guardrails for common project shapes.

They are not industrial packs, production certification, security approval, privacy approval, compliance approval, release approval, or permission for Codex to write target project files.

Use them before considering BL2 industrial overlays.

```text
standard baseline pack -> normal project guardrail
industrial pack -> optional high-risk / production-sensitive overlay
```

## Current Packs

| Pack | Type | Status | Purpose |
|---|---|---|---|
| `web-runtime-standard` | `primary-platform` | `draft` | Web runtime, UI state, API client, forms, responsive behavior |
| `backend-api-standard` | `capability` | `draft` | API contract, domain/data boundary, migrations, local API verification |
| `release-rollback-standard` | `release` | `draft` | Release plan, rollback plan, smoke evidence, deployment decision boundary |

## Boundary

- AI may recommend standard packs.
- Human selection is required before treating a pack as selected.
- Pack selection does not approve implementation.
- Pack selection does not approve release or production.
- Pack selection does not prove real project evidence exists.
- Industrial overlays remain optional and inactive unless explicitly approved.
