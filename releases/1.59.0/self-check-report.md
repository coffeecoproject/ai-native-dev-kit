# 1.59.0 Self-Check Report

## Result

Passed.

## Commands

```bash
node --check scripts/resolve-platform-release-recipe.mjs
node --check scripts/check-platform-release-recipe.mjs
node scripts/check-manifest.mjs
node scripts/check-platform-release-recipe.mjs .
node scripts/check-platform-release-recipe.mjs examples/1.59-platform-release-recipes/web-hosted-preview --strict
node scripts/check-platform-release-recipe.mjs examples/1.59-platform-release-recipes/mini-program-review --strict
node scripts/check-platform-release-recipe.mjs examples/1.59-platform-release-recipes/backend-api-handoff --strict
node scripts/cli.mjs release-recipe . --intent "help me launch"
node scripts/cli.mjs release-recipe-check .
node scripts/cli.mjs release-guide . --intent "help me launch"
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Notes

- Recipes are read-only maps.
- Strict recipes require owner, rollback, monitoring, evidence, and safe Codex boundaries.
- Draft recipes remain visible but cannot pass `--strict`.
- `templates/workflow-version.json` is synchronized with `intentos-manifest.json` workflow assets.
- Platform Release Recipes do not approve release and do not execute release commands.
