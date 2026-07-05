# Execution Assurance Runtime Plan Ref Binding 1.74.2 Plan

## Goal

Patch the 1.74 Execution Assurance line so runtime project-state vocabulary and
strict completion proof use the same IntentOS-native identity and evidence
discipline.

This is a hardening patch, not a new workflow layer.

## Inputs

- 1.74.0 Execution Assurance Strict Binding.
- 1.74.1 vocabulary and docs sync.
- Review finding: runtime source-repository states still used legacy uppercase
  source-kit vocabulary in active scripts and templates.
- Review finding: `execution_plan.plan_ref` was only required to exist, but was
  not required to resolve when a report claimed `VERIFIED_DONE` or strict
  precise evidence.
- Review finding: generated-project smoke should prove a saved report can be
  checked, not only that empty asset-only checks can skip with `--allow-empty`.

## Implementation Scope

- Replace active runtime source-repository state/action vocabulary with
  `INTENTOS_*` terms.
- Extend naming-hardcut checks to reject active legacy source-kit runtime tokens.
- Require `execution_plan.plan_ref` to resolve to `file:`, `artifact:`, or a
  known `checker:` record when `--require-precise-evidence` is used or when a
  report claims `VERIFIED_DONE`.
- Validate non-empty `execution_plan.approval_refs` as bounded references in
  strict completion contexts.
- Add a bad fixture for unresolved execution plan references.
- Update the generated-project smoke to generate an Execution Assurance report
  with `--out` and then check that same recorded report.
- Record release evidence for 1.74.2.

## Non-Goals

- Do not change the Execution Assurance artifact schema shape.
- Do not introduce a new completion or release system.
- Do not make ordinary users choose proof-chain commands.
- Do not authorize target-project writes, implementation, commit, push,
  release, production, CI/hook mutation, secrets, migrations, provider actions,
  or governance replacement.

## Acceptance

- Version metadata is `1.74.2` across README, VERSION, package, manifest, and
  workflow version template.
- Active runtime scripts no longer emit legacy source-kit project-state, workflow
  state, or next-action values.
- Naming hardcut rejects active legacy source-kit identity drift.
- `VERIFIED_DONE` and precise Execution Assurance checks reject unresolved
  `execution_plan.plan_ref`.
- Positive Execution Assurance examples still pass strict checks.
- Generated-project smoke saves and checks the same Execution Assurance report.
- The same-report generated-project smoke remains a required CI signal, so a
  generated project cannot pass by only running empty `--allow-empty` checks.
- `node scripts/check-intentos.mjs`, `node scripts/check-manifest.mjs`,
  `npm run verify`, and `git diff --check` pass.
