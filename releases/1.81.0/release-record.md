# IntentOS 1.81.0 Release Record

## Theme

Existing Project Safe Adoption Autopilot.

## Summary

1.81.0 adds a read-only old-project adoption entry. Codex can now summarize
whether an existing project can safely use IntentOS as a working method without
asking the user to run internal adoption commands.

## Added

- `adopt` / `adopt-check` CLI entries.
- Existing Project Safe Adoption Autopilot protocol docs.
- Adoption Autopilot report template.
- Structured `existing_project_adoption_autopilot` evidence schema.
- Resolver and checker scripts.
- Good examples for governed, light, and dirty existing projects.
- Bad fixtures for technical user burden, false full-adoption claims, write
  claims, and authority-change claims.

## Allowed Claims

- IntentOS can provide a read-only adoption result card for existing projects.
- IntentOS can say whether its working method is available for safe use without
  changing project authority.
- IntentOS can separate safe planning/review use from deeper asset migration.
- IntentOS can route omitted or stricter existing-rule coverage to a later
  collaboration-file review instead of blocking all safe workflow use.

## Forbidden Claims

- This release does not claim full adoption.
- This release does not install `.intentos/`.
- This release does not create, replace, or update `AGENTS.md`.
- This release does not change CI, hooks, release SOP, package files, code,
  config, DB, API, Web, Docker, production, secrets, DNS, payment, provider
  state, data, compliance, legal, HR, finance, or tax assets.
- This release does not approve implementation, commit, push, release,
  production, app-store review, mini-program review, or project authority
  migration.

## Known Limitations

- 1.81.0 is read-only and does not write target-project adoption records.
- A project can be available for safe IntentOS working-mode use while deeper
  adoption still needs rule review, convergence evidence, assurance evidence,
  and a controlled apply plan.
- Existing projects with omitted, stronger, or conflicting rules still require
  a separate collaboration-file review before selected asset migration.
- The report is a user-facing view; internal traces remain evidence, not
  permission to write or migrate.

## Evidence Status

- Checker: `scripts/check-existing-project-adoption-autopilot.mjs`.
- Resolver: `scripts/resolve-existing-project-adoption-autopilot.mjs`.
- CLI entries: `adopt` and `adopt-check`.
- Examples: `examples/1.81-existing-project-adoption-autopilot/`.
- Bad fixtures: `test-fixtures/bad/bad-adoption-autopilot-*`.
- Self-check integration: `scripts/check-intentos.mjs`.

## Safety Boundary

1.81.0 is read-only.

It does not:

- write target-project files;
- install `.intentos/`;
- create or replace `AGENTS.md`;
- change CI, hooks, release, code, config, DB, API, Web, Docker, production,
  secrets, DNS, payment, provider state, data, compliance, legal, HR, finance,
  or tax assets;
- approve implementation, commit, push, release, production, app-store review,
  or mini-program review;
- claim full adoption.

## Verification

Required verification:

```bash
node --check scripts/resolve-existing-project-adoption-autopilot.mjs
node --check scripts/check-existing-project-adoption-autopilot.mjs
node scripts/cli.mjs adopt . --intent "接入 IntentOS 老项目工作流"
node scripts/cli.mjs adopt-check . --allow-empty
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/light-existing --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/dirty-blocked --require-structured-evidence
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
