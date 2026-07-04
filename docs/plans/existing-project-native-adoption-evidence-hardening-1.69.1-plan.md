# Existing Project Native Adoption Evidence Hardening 1.69.1 Plan

## Purpose

1.69.1 hardens the 1.69 existing-project native adoption path.

The goal is to keep Codex operating under IntentOS for old projects while preventing a partial or truncated rule comparison from looking complete.

This is a stabilization patch. It does not add a new migration mode, does not authorize writes, and does not ask non-technical users to judge technical rule quality.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `VERSION.md`
- `package.json`
- `dev-kit-manifest.json`
- `scripts/cli.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/check-existing-rule-reconciliation.mjs`
- `scripts/check-dev-kit.mjs`
- `schemas/artifacts/existing-rule-reconciliation.schema.json`
- `core/existing-rule-reconciliation.md`
- `docs/existing-rule-reconciliation.md`
- `templates/existing-rule-reconciliation-report.md`
- `examples/1.66-existing-rule-reconciliation/governed-web-admin/existing-rule-reconciliations/001-governed-web-admin.md`

Private project observations, including WorkControl observations, may be used only as calibration evidence. They must not become hard-coded project rules.

## Problems To Solve

### Problem 1: Truncated Rule Reconciliation Can Overstate Readiness

1.69 reconciles extracted project rules and can recommend an IntentOS-native migration path.

If the resolver only reconciles a bounded subset of extracted rules, the output must not imply that all existing project rules were reviewed.

Expected behavior:

```text
extracted rules > reconciled rules
-> omitted rules are recorded
-> selected native adoption is blocked
-> Codex may explain the next safe review step
-> Codex may not recommend apply plan now
```

### Problem 2: Apply-Plan Recommendation Needs Two States

The previous `can_recommend_apply_plan` field is too coarse.

1.69.1 must distinguish:

- whether an apply plan can be recommended now;
- whether an apply plan can be recommended after human review resolves the block.

This keeps the path understandable without turning a technical warning into blanket approval.

### Problem 3: `doctor --dry-run` Must Reflect Old-Project Routing

`doctor --dry-run` should not show the generic missing-asset check path for old governed projects.

Expected behavior:

```text
doctor --dry-run <existing-project>
-> workflow-next read-only diagnosis
-> old-project adoption stop condition when applicable
-> next safe step: native-migration + reconcile-rules --auto-native
```

## Scope

1.69.1 includes:

- rule reconciliation coverage fields;
- selected-native-adoption block when extracted rules are omitted;
- stricter structured evidence validation for coverage and native adoption decisions;
- `doctor --dry-run` old-project branch calibration;
- example, template, docs, schema, self-check, and release metadata updates.

1.69.1 does not include:

- automatic target-project writes;
- automatic `.ai-native` installation;
- automatic AGENTS, CI, hook, baseline, release SOP, or PR template replacement;
- automatic approval, commit, push, release, production, provider, secret, migration, payment, permission, data, legal, tax, finance, HR, security, privacy, or compliance changes;
- full migration execution for any private project.

## Technical Design

### Rule Reconciliation Coverage

Existing Rule Reconciliation must emit:

```json
{
  "rule_reconciliation_coverage": {
    "total_extracted_rules": 21,
    "reconciled_rules": 20,
    "omitted_rules": 1,
    "truncation_warning": "Only first 20 extracted rules were reconciled; 1 rule(s) were omitted.",
    "blocks_selected_native_adoption": "Yes"
  }
}
```

If `omitted_rules > 0`:

- `blocks_selected_native_adoption` must be `Yes`;
- `native_adoption_decision.recommendation` must not be `SELECTED_NATIVE_ADOPTION`;
- `outcome` must be `BLOCKED`;
- `can_recommend_apply_plan_now` must be `No`;
- `can_recommend_apply_plan` must be `NoUntilBlockResolved`.

If `omitted_rules === 0`:

- `blocks_selected_native_adoption` must be `No`;
- existing recommendation logic may continue to select the safest migration depth.

### Native Adoption Decision Validation

Strict structured evidence must validate:

- `native_adoption_decision.recommendation`;
- `native_adoption_decision.migration_depth`;
- `native_adoption_decision.confidence`;
- `native_adoption_decision.can_codex_write_now`;
- `default_path`;
- `preserve`;
- `merge`;
- `replace`;
- `blocked`;
- `human_confirmation`.

The decision must remain recommendation-only. It must not authorize writes, release, production, CI mutation, hook installation, secrets, provider calls, or target-project governance replacement.

### `doctor --dry-run`

`doctor --dry-run` must be project-aware:

- source dev-kit projects may still show source self-check behavior;
- old governed or production-sensitive projects should show the adoption diagnosis branch;
- generic missing-asset checks should not be the default dry-run explanation for that branch.

## Acceptance Plan

Run at least:

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/check-existing-rule-reconciliation.mjs`
- `node --check scripts/check-dev-kit.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/check-manifest.mjs`
- `node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence`
- `node scripts/cli.mjs reconcile-rules . --auto-native`
- `node scripts/check-existing-rule-reconciliation.mjs .`
- `npm --silent run verify:governance`
- `node scripts/check-dev-kit.mjs`
- `git diff --check`

If a full command is blocked by local environment limits, record the exact failure and run the nearest safe subset. Do not mark 1.69.1 complete if core rule coverage, strict example evidence, manifest, or dev-kit self-check fails.

## Review Checklist

- [ ] Version metadata is `1.69.1`.
- [ ] Release evidence exists under `releases/1.69.1/`.
- [ ] Manifest includes the 1.69.1 plan and release files.
- [ ] Rule reconciliation coverage appears in docs, template, schema, example, resolver, and checker.
- [ ] Omitted extracted rules block selected native adoption.
- [ ] Blocked native adoption cannot recommend apply plan now.
- [ ] `doctor --dry-run` has an old-project branch.
- [ ] No target-project write authority is added.
- [ ] No private project rule is hard-coded.

## Outcome

1.69.1 is complete when the source repository can prove that existing-project native adoption recommendations are coverage-aware, non-truncated, and still plan-first.
