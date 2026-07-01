# 1.46 Ordinary User Product Loop Hardening Plan

## Purpose

1.46 hardens the 1.42-1.45 ordinary-user product loop. It does not add a new delivery layer. It makes the existing loop easier to start, easier to verify, and safer before any future controlled apply work.

The goal is:

```text
plain user goal
-> first useful slice
-> runnable local evidence
-> product completeness judgment
-> low-risk apply candidate record
-> later human-approved apply planning only when needed
```

## Scope

1. Reframe Quickstart around the ordinary-user path first.
2. Use a shared risk surface library for first-slice and low-risk apply candidate decisions.
3. Add machine-readable evidence to Low-Risk Controlled Apply Candidate records.
4. Let Product Completeness read explicit smoke or demo evidence.
5. Strengthen local MVP example evidence with failure/empty-state proof and at least one additional simple product shape.
6. Keep all new and changed commands read-only.

## Non-Goals

- Do not add an apply runner.
- Do not write target-project files from candidate records.
- Do not approve implementation, release, production, CI, hooks, payment, permissions, migrations, secrets, or data changes.
- Do not make BL2 or industrial overlays default.
- Do not make ordinary users choose internal workflow commands.
- Do not turn MVP examples into a full project template library.

## Implementation Plan

### 1. Entry And Documentation

- Update `docs/quickstart.md` so the first path is ordinary-user product delivery.
- Keep existing bootstrap, baseline, governed project, and maintainer instructions, but move them behind the user path.
- Update README wording from `1.45.x` to `1.46.x` and describe hardening without overclaiming automation.

### 2. Shared Risk Surfaces

- Extend `scripts/lib/risk-surfaces.mjs` from pattern-only helpers into a shared risk analysis module.
- Reuse it in:
  - `scripts/resolve-first-slice.mjs`
  - `scripts/resolve-low-risk-apply-candidate.mjs`
  - `scripts/check-low-risk-apply-candidate.mjs`
- Include Chinese and English surfaces for payment, auth, permissions, privacy, security, production, deployment, CI, hooks, secrets, migrations, database/schema, legal, tax, customer data, multi-tenant, refund, inventory, and approval flows.
- Add bounded path safety checks for absolute paths, parent traversal, wildcards, backslashes, generated directories, symlinks, and ignored paths where local evidence exists.

### 3. Low-Risk Apply Candidate Structured Evidence

- Add `schemas/artifacts/low-risk-apply-candidate.schema.json`.
- Update resolver and template to print a `Machine-Readable Evidence` JSON block.
- Update checker to validate the evidence when present and require it in strict mode.
- Keep default compatibility for old Markdown-only target-project records.

### 4. Product Completeness Evidence

- Add `--evidence <file>` support to `product-completeness`.
- Treat explicit smoke/demo evidence as stronger verification than package script presence alone.
- Keep the report boundary: local MVP evidence is not release approval and does not prove real-user adoption.

### 5. MVP Example Evidence

- Strengthen `examples/mvp-booking-web-app` with explicit smoke output and failure/empty-state evidence.
- Add one additional O0/BL0 local MVP example with a different product shape.
- Generalize `check-mvp-example.mjs` so it checks example metadata and evidence instead of hard-coding only booking terms.

### 6. Release And Verification

- Update version files, manifest, generated workflow version template, references, release evidence, and self-check coverage.
- Run:

```bash
node scripts/check-dev-kit.mjs
npm run verify
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
git diff --check
```

## Acceptance Plan

1. Quickstart starts with the ordinary-user flow and does not require baseline, workflow-next, BL2, hook policy, or apply-plan knowledge before the first decision.
2. First-slice and low-risk apply candidate use the same shared risk surface library.
3. A low-risk apply candidate record includes valid machine-readable evidence and still says:
   - writes now: false
   - authorizes apply: false
   - approves implementation: false
   - approves release/production: false
4. Product Completeness can cite explicit smoke evidence through `--evidence`.
5. Built-in MVP examples pass their smoke checks and keep local-demo-only boundaries.
6. Bad fixtures still fail for write authorization, broad paths, high-risk candidate claims, and release overclaiming.
7. Full repository verification passes.

## Stop Conditions

Stop and re-plan if the implementation would:

- require a real apply runner,
- install or modify hooks/CI,
- make structured evidence mandatory for historical target-project records,
- require ordinary users to learn the internal command map,
- or expand 1.46 into platform baseline or industrial-pack work.
