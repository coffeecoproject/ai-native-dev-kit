# Release 1.15.1 Record

## Human Summary

1.15.1 hardens the 1.15 platform standard baseline pack system.

It does not add new platform packs. It makes the existing standard pack registry harder to drift, easier to verify locally, and safer around environment facts.

## What Changed

- Added `standard-baseline-packs/schema/index.schema.json`.
- Added an index-level schema for `standard-baseline-packs/index.json`.
- Strengthened `scripts/check-standard-baseline-pack.mjs` so `standard-baseline-packs/index.json` is checked as a first-class registry artifact.
- Added index-level checks for:
  - required index fields
  - baseline levels
  - pack types
  - maturity stages
  - duplicate pack ids
  - duplicate pack paths
  - unsafe pack paths
  - entry-level authorization flags
- Added index entry to `pack.json` consistency checks for key fields.
- Added explicit index/pack.json consistency coverage to the registry self-check.
- Added environment-standard overclaim checks for:
  - `.env` creation or edits
  - secret value recording
  - invented staging/production/deployment facts
  - deployment verification overclaims
  - CI/CD approval claims
- Added bad fixtures for index/pack mismatch and unsafe environment overclaims.
- Updated `npm run verify` to execute:
  - `node scripts/cli.mjs standard-baseline .`
  - `node scripts/cli.mjs baseline-packs .`
- Expanded `.github/CODEOWNERS` with an explicit owner-decision backlog without adding fake active owner rules.
- Added 1.16 and 1.17 plan docs as future roadmap artifacts.

## Why

After 1.15 expanded standard packs from three to eight, `standard-baseline-packs/index.json` became a more important source of truth.

The 1.15.1 patch prevents a common drift pattern:

```text
index.json says one thing
pack.json says another thing
resolver/checker output becomes ambiguous
```

It also tightens the riskiest new standard pack:

```text
environment-standard records facts
environment-standard does not invent facts
environment-standard does not write secrets or .env files
environment-standard does not approve CI/CD or deployment
```

## Allowed Claims

- The standard baseline registry now has index-level schema checks.
- The pack checker now compares key `index.json` metadata against matching `pack.json` metadata.
- The environment standard pack has stricter overclaim checks for secret values, `.env` writes, invented deployment facts, deployment verification claims, and CI/CD approval claims.
- `npm run verify` now executes standard baseline recommendation commands before pack checks.
- CODEOWNERS records a backlog of future ownership decisions without enabling required owners.

## Forbidden Claims

- Do not claim new standard packs were added.
- Do not claim draft standard packs are stable.
- Do not claim BL2 is default.
- Do not claim any pack is active by default.
- Do not claim standard baseline selection authorizes target-project writes.
- Do not claim standard baseline selection approves implementation.
- Do not claim release, production, compliance, security, privacy, payment, tax, finance, HR, legal, or migration approval.
- Do not claim real-project production validation.
- Do not claim CODEOWNERS enforcement is active.

## Evidence Status

- Self-check, fixture, and local resolver/checker evidence only.
- No target project was modified.
- No production validation is claimed.
- Bad fixtures prove index drift and environment overclaim detection, not real-project runtime behavior.

## Known Limitations

- All standard packs remain draft.
- The index schema is enforced by the local checker, not by an external schema registry.
- Environment checks look for obvious overclaim patterns in pack assets; they do not inspect a real target project's deployment system.
- CODEOWNERS remains advisory until real maintainer handles are confirmed.
- The 1.16 and 1.17 documents are roadmap plans only; they are not implemented by this patch.

## Boundary

1.15.1 does not:

- add new standard packs
- add new industrial packs
- promote any draft pack
- make BL2 default
- make any pack active by default
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, legal, compliance, payment, tax, finance, HR, or migration decisions
- claim real-project production validation
- assign real CODEOWNERS handles

## Verification

Required checks:

```bash
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
```

## Next

Recommended next version:

```text
1.16.0 = BL2 Industrial Baseline Deepening
1.17.0 = Guided Baseline Selection Entry
```

1.16 should deepen existing industrial packs before 1.17 turns baseline selection into a user-facing decision card.
