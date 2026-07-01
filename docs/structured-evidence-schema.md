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

The Markdown sections remain the human-readable record. The `Machine-Readable Evidence` JSON block is the machine-checkable record.

## Rules

- The JSON block must match the schema under `schemas/artifacts/`.
- Unified Apply Plan evidence must include a recomputable `plan_digest`.
- Readiness and Approval records must reference the same `plan_digest` when the apply plan file is available.
- Boundary fields must stay false unless a future controlled runner explicitly supports a safe mode.
- Approval evidence still does not authorize automatic apply.
- Product completeness evidence still does not approve release, production, or real-user adoption.
- Change impact coverage evidence still does not authorize implementation, apply, release, production, or high-risk decisions.

## Strict Mode

Default checks remain compatible with older Markdown artifacts. Strict mode is explicit:

```bash
node scripts/check-apply-plan.mjs <project> --require-structured-evidence
node scripts/check-controlled-apply-readiness.mjs <project> --require-structured-evidence
node scripts/check-approval-record.mjs <project> --require-structured-evidence
node scripts/check-low-risk-apply-candidate.mjs <project> --require-structured-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
```

Strict mode requires `Machine-Readable Evidence`. For readiness and approval records, strict mode also requires the referenced apply plan to resolve locally so the checker can verify the plan digest.

Structured readiness evidence must include at least one action unless `readiness_state` is `NO_APPLY_PLAN`.

Low-risk apply candidate strict mode requires a valid `candidate_digest`, exact target paths, path safety evidence, rollback, verification, and authority fields that all remain non-authorizing.

Change impact coverage strict closure mode requires a valid `impact_digest`, matching Markdown and JSON surface statuses, non-placeholder `DONE` evidence, and required surfaces closed instead of left `NOT_STARTED`.

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
