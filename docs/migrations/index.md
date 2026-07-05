# Migration Index

Migration support is conservative.

`intentos migrate` is plan-only in 0.42.0. It helps inspect a target project and produce a reviewable plan. It does not apply changes.

## Supported Ranges

| From | To | Status |
|---|---|---|
| `0.33.0` | `1.0.0` | Plan-only preview and write-plan |

## Commands

Preview:

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
```

Write a JSON plan:

```bash
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

The command fails if neither `--dry-run` nor `--write-plan` is provided.

## Detailed Guides

- `docs/migrations/0.33-to-1.0.md`

## Boundary

Migration apply is intentionally out of scope for 0.42.0. Use `init-project --write-plan` and reviewed apply-plan flow for asset updates that are already supported.
