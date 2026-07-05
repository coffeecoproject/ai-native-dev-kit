# Structured Evidence Schema

IntentOS keeps workflow artifacts readable for humans, but high-risk write-control artifacts also need stable machine-readable evidence.

1.41.0 adds schema-backed evidence for:

- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

1.46.0 extends the same pattern to:

- Low-Risk Controlled Apply Candidate

1.47.0 adds structured local product evidence for:

- Product Completeness Evidence files passed to `--evidence`

1.49.0 extends structured Markdown evidence to:

- Change Impact Coverage

1.50.0 keeps the 1.49 Change Impact Coverage schema and adds stricter checker behavior:

- `--resolve-evidence-refs` requires `DONE` evidence references to resolve
- `command-output:<path>` points to a saved command output file
- `artifact:<id-or-ref>` points to a recorded workflow artifact reference
- `human-decision:<id-or-ref>` points to a recorded human decision reference
- `--require-impact-coverage` lets Execution Closure require a strict Change Impact Coverage report for cross-surface READY closures

1.62.0 through 1.71.3 extend structured Markdown evidence to existing-project adoption:

- Native Migration Plan
- Existing Rule Reconciliation
- Release Plan
- Existing Project Governance Convergence
- Adoption Assurance Report

1.71.3 specifically tightens Adoption Assurance evidence refs:

- every structured surface evidence ref must appear in `evidence_refs`
- unknown evidence ref prefixes fail instead of being silently ignored
- generated reports can be written with explicit `--out <relative-report-path>` and checked as the same file

1.72.0 extends structured Markdown evidence to:

- Execution Assurance Report

Execution Assurance binds intent, completion contract, planned impact, actual diff, evidence refs, review result, patch classification, source-system trace, and closure decision before Codex can claim execution-class work is complete.

The Markdown sections remain the human-readable record. The `Machine-Readable Evidence` JSON block is the machine-checkable record.

## Rules

- The JSON block must match the schema under `schemas/artifacts/`.
- Unified Apply Plan evidence must include a recomputable `plan_digest`.
- Readiness and Approval records must reference the same `plan_digest` when the apply plan file is available.
- Boundary fields must stay false unless a future controlled runner explicitly supports a safe mode.
- Approval evidence still does not authorize automatic apply.
- Product completeness evidence still does not approve release, production, or real-user adoption.
- Change impact coverage and execution assurance evidence still do not authorize implementation, apply, release, production, commit/push, target writes, CI/hook mutation, secrets, migrations, provider actions, or high-risk decisions.

## Strict Mode

Default checks remain compatible with older Markdown artifacts. Strict mode is explicit:

```bash
node scripts/check-apply-plan.mjs <project> --require-structured-evidence
node scripts/check-controlled-apply-readiness.mjs <project> --require-structured-evidence
node scripts/check-approval-record.mjs <project> --require-structured-evidence
node scripts/check-low-risk-apply-candidate.mjs <project> --require-structured-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
node scripts/check-native-migration.mjs <project> --require-structured-evidence
node scripts/check-existing-rule-reconciliation.mjs <project> --require-structured-evidence
node scripts/check-release-plan.mjs <project> --require-structured-evidence
node scripts/check-governance-convergence.mjs <project> --require-structured-evidence
node scripts/check-adoption-assurance.mjs <project> --require-structured-evidence
node scripts/check-adoption-assurance.mjs <project> --require-structured-evidence --require-simulation
node scripts/check-execution-assurance.mjs <project> --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
```

Strict mode requires `Machine-Readable Evidence`. For readiness and approval records, strict mode also requires the referenced apply plan to resolve locally so the checker can verify the plan digest.

Structured readiness evidence must include at least one action unless `readiness_state` is `NO_APPLY_PLAN`.

Low-risk apply candidate strict mode requires a valid `candidate_digest`, exact target paths, path safety evidence, rollback, verification, and authority fields that all remain non-authorizing.

Change impact coverage strict closure mode requires a valid `impact_digest`, matching Markdown and JSON surface statuses, non-placeholder `DONE` evidence, and required surfaces closed instead of left `NOT_STARTED`.

Existing-project adoption strict mode requires structured evidence for migration, rule reconciliation, convergence, release plan, and adoption assurance when those reports are used to claim IntentOS operating mode. Adoption Assurance also requires every surface evidence ref to resolve through `evidence_refs`; `VERIFIED_ACTIVE` additionally requires a passed read-only simulation trace.

Execution Assurance strict mode requires current-task evidence refs, a concrete actual diff binding, a completion contract, planned impact surfaces, independent review when required, source-system trace, and a patch assessment that does not hide partial or broad changes behind safe-patch wording.

Product completeness structured evidence is supplied as a JSON file, not as a Markdown `Machine-Readable Evidence` block:

```bash
node scripts/resolve-product-completeness.mjs <project> --evidence evidence/smoke-output.json
```

The JSON must match `schemas/artifacts/product-completeness-evidence.schema.json` and keep `approves_release_or_production` and `proves_real_users_can_use_product` false.

## Current Boundary

Structured evidence improves verification. It does not write files, execute apply plans, validate real human identity, approve implementation, approve release or production, install hooks, change CI, or enable BL2.

The schema files are not the complete safety boundary by themselves. Use the corresponding IntentOS checker because path, boundary, digest, readiness, approval, and non-authorization rules are enforced by the checker code as well as the schema.

## Human Workflow

1. Codex writes a readable apply plan.
2. Codex includes structured evidence with exact action IDs and target paths.
3. Codex creates readiness and approval records that reference the plan digest.
4. Checkers validate both readable Markdown boundaries and structured JSON evidence.
5. Humans still approve or reject the actual decision.
