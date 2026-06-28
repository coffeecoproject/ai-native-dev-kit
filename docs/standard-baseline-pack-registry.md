# Standard Baseline Pack Registry

Standard baseline packs answer a practical question:

```text
For this project shape, what normal engineering guardrails should Codex respect?
```

They sit between profiles and industrial packs.

```text
profile -> standard baseline packs -> optional industrial overlays
```

## Plain Meaning

- Standard baseline packs are normal project guardrails.
- Industrial packs are heavier BL2 overlays for high-risk or production-sensitive work.
- Recommendations are read-only.
- Selection requires human confirmation.
- Selection does not approve implementation.

## First Three Packs

| Pack | Use When |
|---|---|
| `web-runtime-standard` | Web UI, routing, state, API client, forms, or browser behavior is in scope |
| `backend-api-standard` | Backend API, DTO/domain boundary, database schema, migrations, or API integration is in scope |
| `release-rollback-standard` | Release, rollback, staging, production, handoff, or launch readiness is in scope |

## Commands

Read-only standard recommendation:

```bash
node scripts/cli.mjs standard-baseline <project>
```

Check recorded standard selection reports:

```bash
node scripts/cli.mjs standard-baseline-selection <project>
```

Read-only umbrella recommendation:

```bash
node scripts/cli.mjs baseline-packs <project>
```

The umbrella command shows standard packs first and optional industrial overlays second.

## Important Boundary

Standard baseline selection does not mean:

- AI can write project files
- a specific implementation task is approved
- release or production is approved
- security, privacy, legal, or compliance is approved
- evidence exists
- BL2 is required
- industrial overlays are active

It only records the intended engineering baseline path.

## 1.14.1 Hardening

- Standard pack metadata fields are explicit. Experimental pack metadata must go under `extensions`.
- Selected profile ids in Standard Baseline Selection Reports must resolve to `profiles/` or `.ai-native/profiles/`.
- Public documentation URLs such as `https://developer.mozilla.org/` or `https://owasp.org/` are allowed in standard pack docs without being treated as private project URLs.
- `scripts/resolve-baseline-packs.mjs` remains available only as a lower-level industrial resolver; humans should use `node scripts/cli.mjs baseline-packs <project>`.
