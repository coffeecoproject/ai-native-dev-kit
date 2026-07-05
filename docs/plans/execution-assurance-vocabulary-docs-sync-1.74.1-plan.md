# Execution Assurance Vocabulary And Docs Sync 1.74.1 Plan

## Goal

Patch the 1.74 strict-binding release so the runtime vocabulary, schema enum,
public documentation, maintainer command table, and generated-project smoke all
describe the same Execution Assurance behavior.

This is a consistency release, not a new governance layer.

## Inputs

- 1.74.0 Execution Assurance Strict Binding release.
- Review finding: resolver output included `REQUIRES_EXPLICIT_EXECUTION_PLAN`
  before the JSON schema enum accepted it.
- Review finding: runtime bootstrapped-project tags still used a legacy
  product identity token.
- Review finding: README and docs explained the capability but did not make the
  adoption/execution assurance command surface visible enough.
- Review finding: generated-project smoke did not explicitly exercise the
  Execution Assurance CLI aliases after asset installation.

## Implementation Scope

- Add `REQUIRES_EXPLICIT_EXECUTION_PLAN` to the Execution Assurance schema enum.
- Keep `schema_version: 1.74.0` for Execution Assurance reports because the
  artifact shape remains compatible.
- Replace runtime bootstrapped tags with IntentOS terminology.
- Extend naming-hardcut checks to uppercase legacy identity tokens.
- Update README, Chinese README, Execution Assurance docs, and structured
  evidence docs.
- Add generated-project smoke coverage for `execution-assurance`,
  `execution-assurance-check`, `done-check`, and `verify-execution`.
- Record 1.74.1 release evidence.

## Non-Goals

- Do not add a new assurance system.
- Do not change target-project write authority.
- Do not approve implementation, commit, push, release, production, CI, hooks,
  secrets, migrations, provider actions, or governance replacement.
- Do not require ordinary users to learn Execution Assurance commands.

## Acceptance

- Version metadata is `1.74.1` across README, VERSION, package, manifest, and
  workflow version template.
- Execution Assurance schema accepts resolver vocabulary.
- IntentOS naming hardcut rejects uppercase legacy identity tokens.
- README capability tables mention Adoption Assurance and Execution Assurance
  Chain plainly.
- Maintainer command tables include `execution-assurance`,
  `execution-assurance-check`, `done-check`, and `verify-execution`.
- Generated-project smoke visibly runs the Execution Assurance resolver/checker
  commands.
- `node scripts/check-intentos.mjs`, `node scripts/check-manifest.mjs`,
  `npm run verify`, and `git diff --check` pass.
