# Project Agent Rules

## Workflow Rules

- Codex should follow the old task checklist before editing files.
- Contract approval limits are business rules and must remain project-owned.

## Release Rules

- Production release requires rollback evidence from the release owner.

```bash
pnpm gate:quality
pnpm release:preview
```

