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
