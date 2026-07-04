# Release 1.67.0

## Theme

Release Core Model Consolidation.

## Summary

1.67 adds Release Plan as a pure view model over the 1.57-1.66 release path systems. It gives users one release-facing answer while keeping Release Adapter, Release Guide, Platform Recipe, Launch Review, Handoff Pack, Release Execution, Native Migration, and Existing Rule Reconciliation authoritative.

## Key Changes

- Added `release-plan` and `release-check` public CLI entries.
- Added `core/release-core-model.md`, `docs/release-core-model.md`, `templates/release-plan.md`, and structured release-plan schema.
- Added Release Plan Trace as explanation only.
- Added existing project rule comparison inside Release Plan.
- Clarified that IntentOS Operating Mode can be active in existing projects without granting write permission.
- Clarified that project asset migration depth is recommended after comparison and not maximized by default.

## Boundaries

- No production approval.
- No release execution.
- No target project writes.
- No CI/hook mutation.
- No secret handling.
- No replacement of existing project governance.

## Allowed Claims

- IntentOS can summarize release-facing source systems into one user-facing Release Plan.
- Release Plan can provide a single readable answer for "what should happen next for release or launch review" while keeping lower-level source systems authoritative.
- Release Plan Trace can explain which source systems contributed to the summary, and every trace row must remain non-controlling.
- Existing projects can enter IntentOS Operating Mode for planning, task routing, review, comparison, and controlled apply planning.
- Existing-project baselines, release rules, CI, hooks, governance files, and protected constraints can be compared against IntentOS references before any migration recommendation.
- IntentOS can recommend `KEEP_EXISTING_AS_STRICTER`, `MERGE_AFTER_REVIEW`, `GAP_SUGGESTION`, or `NEEDS_HUMAN_DECISION` for old-project rule reconciliation inside a Release Plan.
- IntentOS can reject Release Plans that approve production, let trace control execution, let summary state drive behavior, treat operating mode as write permission, or ignore existing project rules.

## Forbidden Claims

1.67 does not:

- make Release Plan a new source system, workflow engine, execution authority, or release authority
- override Release Adapter, Release Guide, Platform Release Recipe, Launch Review View, Release Handoff Pack, Release Execution, Native Migration, or Existing Rule Reconciliation
- approve release, production, deploy, publish, upload, app-store submission, mini-program review submission, migration, DNS changes, payment changes, provider-state changes, CI changes, hook installation, or secret handling
- write target-project files
- replace existing project governance, engineering baselines, environment baselines, release SOPs, CI, hooks, `AGENTS.md`, pull-request templates, protected constraints, or business rules
- turn IntentOS Operating Mode into write permission
- maximize project asset migration depth by default
- treat a stricter existing project rule as something IntentOS should overwrite automatically
- prove every existing project rule or release risk was found

## Evidence Status

- `docs/plans/release-core-model-consolidation-1.67-plan.md` records the execution and acceptance plan.
- `core/release-core-model.md` and `docs/release-core-model.md` define Release Plan as a pure view model.
- `templates/release-plan.md` defines the human-facing Release Plan format.
- `schemas/artifacts/release-plan.schema.json` defines the structured evidence contract.
- `scripts/resolve-release-plan.mjs` generates a Release Plan from lower-level source system outputs.
- `scripts/check-release-plan.mjs` validates pure-view boundaries, trace behavior, existing-project operating mode, rule comparison, and structured evidence.
- `examples/1.67-release-core-model/web-preview` proves the new-project / preview-style path.
- `examples/1.67-release-core-model/governed-existing-project-readonly` proves the old-project path where IntentOS Operating Mode is active but asset migration is comparison-bound.
- `test-fixtures/bad/bad-release-plan-*` proves unsafe Release Plans are rejected.
- `releases/1.67.0/self-check-report.md` records final verification commands and result.

## Known Limitations

- Release Plan is a read-only projection and does not reduce the need to inspect lower-level source systems when debugging.
- Existing-project rule comparison is only as complete as the project signals and available governance files that Codex can read.
- IntentOS Operating Mode can guide Codex immediately, but target-project writes still require Unified Apply Plan, Controlled Apply Readiness, Approval Record, and project-specific verification.
- Release Plan summary state is intentionally not a workflow engine state and must not be used to drive automation.
- Trace is explanation-only and must not become a hidden control path.
- Release Plan does not prove product correctness, production readiness, security, legal compliance, or release approval.

## Verification

See `self-check-report.md`.
