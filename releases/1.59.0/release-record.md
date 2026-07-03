# 1.59.0 Release Record

## Human Summary

1.59.0 adds Platform Release Recipes. Release Guide can now route a launch request into a platform-specific read-only recipe before release execution planning.

## Added

- `core/platform-release-recipes.md`
- `docs/platform-release-recipes.md`
- `templates/platform-release-recipe.md`
- `checklists/platform-release-recipe-review.md`
- `prompts/platform-release-recipe-agent.md`
- `release-recipes/`
- `scripts/resolve-platform-release-recipe.mjs`
- `scripts/check-platform-release-recipe.mjs`
- CLI entries: `release-recipe`, `release-recipe-check`
- strict recipes:
  - `web-hosted-preview`
  - `backend-api-handoff`
  - `mini-program-review-handoff`
- draft recipes:
  - `ios-testflight-handoff`
  - `android-internal-testing-handoff`
  - `internal-admin-rollout`
  - `web-container-release-handoff`

## Allowed Claims

- IntentOS can select or suggest a platform release recipe.
- Strict recipes are checked for owner, rollback, monitoring, evidence, and Codex boundaries.
- Draft recipes are visible but cannot pass strict checks.
- Recipes are read-only maps that bridge Release Guide into Release Execution planning.

## Forbidden Claims

- 1.59 approves release.
- 1.59 executes release commands.
- 1.59 deploys, publishes, uploads, submits, migrates, or mutates remote state.
- 1.59 runs provider API commands.
- 1.59 asks for or stores secrets.
- 1.59 makes Codex the release owner.

## Evidence Status

- Source recipe assets added.
- Strict recipe examples added.
- Bad fixtures added for unsafe recipe patterns.
- Checker rejects production actions assigned to Codex, secret requests, missing rollback, missing monitoring, missing owner, provider certainty claims, and draft recipes in strict mode.

## Boundary

Platform Release Recipes are platform maps, not release execution packs.

## Known Limitations

- 1.59 does not build provider-specific Release Handoff Packs.
- Draft recipes require project-specific completion before strict use.
- Provider and production actions remain human or external-system owned.

## Verification

See `releases/1.59.0/self-check-report.md`.
