# Release 1.71.1 - Adoption Assurance Evidence Hardening

## Summary

1.71.1 hardens Adoption Execution Assurance. It keeps 1.71.0's old-project adoption goal, but makes the evidence stricter: a report can no longer claim full IntentOS adoption from static text, placeholder directories, or unrelated upstream output.

## What Changed

- `resolve-adoption-assurance.mjs` now records a concrete read-only simulation step trace instead of treating script presence as a passed simulation.
- Structured evidence now includes `source_systems`, simulation `steps`, `BLOCKED_BY_UPSTREAM_EVIDENCE`, and `PRESENT_UNVERIFIED`.
- Upstream `BLOCKED` / `NEEDS_INPUT` source systems prevent `VERIFIED_ACTIVE`.
- `apply_chain` distinguishes no target writes, placeholder-only presence, incomplete evidence, and verified evidence.
- `check-adoption-assurance.mjs` now checks Markdown / JSON consistency for summary state, simulation result, and surface rows.
- Evidence refs are resolved by type: `checker:`, `simulation:`, `human-decision:`, `file:`, `artifact:`, and `generated:`.
- Absolutely forbidden claims, such as production approval or IntentOS owning production/business authority, fail in every state.
- New bad fixtures cover production approval overclaim, state mismatch, surface mismatch, upstream-blocked verified state, and placeholder apply-chain overclaim.

## Boundary

- This release does not write target project files.
- This release does not authorize migration, release, deployment, CI mutation, hook mutation, production approval, or project authority transfer.
- This release does not make adoption assurance a business correctness proof.
- This release only strengthens the evidence needed before Codex can say an old project is actively operating under IntentOS.

## Allowed Claims

- IntentOS 1.71.1 strengthens old-project adoption assurance evidence.
- Adoption assurance reports now include source-system evidence and read-only simulation step traces.
- `VERIFIED_ACTIVE` requires consistent structured evidence, no blocking surfaces, recorded upstream sources, and passed simulation steps.
- Placeholder-only apply-chain directories are not treated as verified apply evidence.

## Forbidden Claims

- IntentOS 1.71.1 does not approve production, release, deployment, CI mutation, hook mutation, data migration, secrets, payment, compliance, or project authority transfer.
- IntentOS 1.71.1 does not prove product correctness or business correctness.
- IntentOS 1.71.1 does not allow Codex to write target project files from an adoption assurance report.
- IntentOS 1.71.1 does not let Codex replace project-owned release SOPs or protected governance.

## Evidence Status

- Resolver syntax is covered by `node --check scripts/resolve-adoption-assurance.mjs`.
- Checker syntax is covered by `node --check scripts/check-adoption-assurance.mjs`.
- Positive examples cover verified, partial, blocked, and failed assurance states.
- Negative fixtures cover full-adoption overclaims, unresolved evidence, write authorization, production approval, CI/hook mutation, release SOP replacement, stale diffs, AI log spam, state mismatch, surface mismatch, upstream-blocked verified state, and placeholder apply-chain overclaim.

## Known Limitations

- Adoption assurance remains read-only and does not execute target-project migration.
- The simulation validates IntentOS routing behavior, not real feature implementation.
- Human or project owner approval is still required for protected authority surfaces.
- Project-specific apply evidence still requires a controlled apply plan, approval record, and readiness record before any write action.

## Verification

- `node --check scripts/resolve-adoption-assurance.mjs`
- `node --check scripts/check-adoption-assurance.mjs`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence`
- `node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence`
- `node scripts/check-intentos.mjs`
