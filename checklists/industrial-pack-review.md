# Industrial Pack Review

Use this checklist before adding, promoting, or materially changing an industrial pack.

## Layer Fit

- [ ] The pack belongs in `industrial-packs/`, not `core/`, `profiles/`, or `starters/`.
- [ ] The pack defines industrial standards, not project-specific evidence.
- [ ] The pack type is correct: `primary-platform`, `capability`, or `risk-overlay`.
- [ ] Candidate material has not been promoted without inventory, normalization, schema, and purity review.

## Required Structure

- [ ] `pack.md` exists.
- [ ] `pack.json` exists.
- [ ] `baselines/` exists.
- [ ] `executions/` exists.
- [ ] `audit/` exists.
- [ ] `bootstrap-kit/` exists.
- [ ] `checklists/` exists.
- [ ] `templates/` exists.

## Machine-readable Contract

- [ ] `pack.json` matches `industrial-packs/schema/pack.schema.json`.
- [ ] `appliesToProfiles` references existing profiles or is intentionally empty.
- [ ] `compatiblePacks` and `conflictsWith` reference packs registered in `industrial-packs/index.json`.
- [ ] `requiredEvidence` is specific enough to guide task and release evidence.
- [ ] `humanApprovalRequiredFor` covers high-risk operations.

## Purity

- [ ] No concrete app names.
- [ ] No bundle IDs or package names.
- [ ] No API URLs.
- [ ] No production accounts.
- [ ] No credentials, tokens, certificates, or provisioning identifiers.
- [ ] No team member names.
- [ ] No customer-specific business decisions.
- [ ] No real data samples.

## Verification

- [ ] `node scripts/check-industrial-pack.mjs .` passes.
- [ ] `node scripts/resolve-industrial-baseline.mjs .` produces machine-readable project selection output when dogfooding.
- [ ] `node scripts/check-industrial-baseline.mjs . --strict` passes in at least one approved dogfood project before marking a pack stable.
- [ ] `node scripts/check-intentos.mjs` passes.
- [ ] Any project dogfood evidence is recorded outside the pack.
