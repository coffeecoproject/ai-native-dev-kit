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

1.75.0 adds structured Markdown evidence before Change Impact Coverage:

- Business Rule Closure

Business Rule Closure records the task-bound business rule, required dimensions,
safe defaults, limited user questions, source-rule conflicts, real-environment
validation expectations, `business_rule_digest`, and `closure_digest` before
Codex maps implementation surfaces. It is generic task-communication evidence:
contract, tax, finance, HR, legal, payment, privacy, compliance, migration,
production, and customer-data wording is treated as a risk signal or example,
not as the default business domain.

1.75.1 tightens the binding between Business Rule Closure and Change Impact
Coverage:

- Business Rule Closure reports must self-reference the current report through
  `business_rule_ref`.
- Change Impact Coverage evidence can carry `business_rule_digest` and
  `business_rule_state` alongside `business_rule_ref`.
- `check-change-impact-coverage --require-business-rule-ref
  --require-business-rule-ready` verifies that the referenced Business Rule
  Closure resolves, is `READY_FOR_IMPACT_COVERAGE`, and matches the recorded
  digest and state.
- 1.75.2 makes strict business-rule flags require Change Impact Coverage
  machine-readable evidence even when `--require-structured-evidence` is not
  passed separately. It also makes Business Rule Closure reports generated with
  `--out <relative-report-path>` self-reference the actual output path.

1.76.0 extends structured Markdown evidence to:

- Verification Plan

Verification Plan records the current task, intent digest, Business Rule Closure
source, Change Impact Coverage source, affected surfaces, verification
obligations, test-correctness controls, manual-verification ownership,
not-applicable obligations, `verification_plan_ref`, and
`verification_plan_digest`. It is a planning artifact: it does not execute
tests, approve implementation, approve release or production, replace Execution
Assurance, or prove product correctness.

1.76.1 through 1.76.3 keep the Verification Plan artifact schema at `1.76.0`
while tightening checker behavior: source-system chains must bind to the same
BRC/CIC reports, Markdown sections must match JSON evidence both ways, Test
Correctness Controls are part of the consistency contract, and READY plans must
use recorded BRC/CIC source systems.

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

1.74.0 through 1.74.3 tighten Execution Assurance evidence identity:

- source-system records include `source_system_ref`, `source_task_ref`,
  `source_outcome`, `current_task_match`, `report_digest`, and
  `evidence_digest`;
- actual diff binding includes `REQUIRES_EXPLICIT_EXECUTION_PLAN` when changed
  files exist but no explicit reviewed execution plan covers them;
- strict/precise completion requires actual changed files to be covered by
  explicit planned target paths;
- strict/precise completion also requires `execution_plan.plan_ref` to resolve
  to a concrete `file:`, `artifact:`, or known `checker:` record;
- non-empty `approval_refs` are checked for supported, bounded references and
  cannot be treated as blanket approval;
- declarative references such as `review:`, `command:`, `generated:`, and
  `git-diff:` are not precise completion proof by themselves;
- Markdown `Execution Plan Binding`, `Actual Diff Binding`, and
  `Evidence Binding` tables must match the JSON `execution_plan`,
  `actual_diff`, and `evidence_bindings` records.

The Execution Assurance artifact schema version remains `1.74.0` in the 1.74.x
repository patches because the artifact shape stays compatible; 1.74.1 aligns
the resolver, schema enum, docs, and smoke coverage, 1.74.2 tightens checker
interpretation of existing fields, and 1.74.3 tightens Markdown/JSON
consistency checks.

The Markdown sections remain the human-readable record. The `Machine-Readable Evidence` JSON block is the machine-checkable record and remains authoritative, but the human-readable tables must not drift from it.

## Rules

- The JSON block must match the schema under `schemas/artifacts/`.
- Unified Apply Plan evidence must include a recomputable `plan_digest`.
- Readiness and Approval records must reference the same `plan_digest` when the apply plan file is available.
- Boundary fields must stay false unless a future controlled runner explicitly supports a safe mode.
- Approval evidence still does not authorize automatic apply.
- Product completeness evidence still does not approve release, production, or real-user adoption.
- Business rule closure, change impact coverage, verification plan, and execution assurance evidence still do not authorize implementation, apply, release, production, commit/push, target writes, CI/hook mutation, secrets, migrations, provider actions, or high-risk decisions.

## Strict Mode

Default checks remain compatible with older Markdown artifacts. Strict mode is explicit:

```bash
node scripts/check-apply-plan.mjs <project> --require-structured-evidence
node scripts/check-controlled-apply-readiness.mjs <project> --require-structured-evidence
node scripts/check-approval-record.mjs <project> --require-structured-evidence
node scripts/check-low-risk-apply-candidate.mjs <project> --require-structured-evidence
node scripts/check-business-rule-closure.mjs <project> --require-structured-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence
node scripts/check-change-impact-coverage.mjs <project> --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
node scripts/check-verification-plan.mjs <project> --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
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

Business Rule Closure strict mode requires a valid `business_rule_digest`,
`closure_digest`, task-bound rule identity, required dimensions for the detected
rule type, no unresolved decisions in `READY_FOR_IMPACT_COVERAGE`, Markdown/JSON
consistency, and non-authorizing boundaries. Use `--require-business-rule-closure`
when a task must not proceed to impact coverage until a saved rule closure exists.

Change impact coverage strict closure mode requires a valid `impact_digest`, matching Markdown and JSON surface statuses, non-placeholder `DONE` evidence, and required surfaces closed instead of left `NOT_STARTED`.

Verification Plan strict mode requires a valid `verification_plan_digest`,
current-report `verification_plan_ref`, source-system binding to Business Rule
Closure and Change Impact Coverage, matching task and intent digest when source
reports are present, concrete obligations for required impact surfaces, positive
and negative API checks for API contracts, generated-test review controls when
risk requires them, and manual-verification owner fields when manual checks are
blocking.

Existing-project adoption strict mode requires structured evidence for migration, rule reconciliation, convergence, release plan, and adoption assurance when those reports are used to claim IntentOS operating mode. Adoption Assurance also requires every surface evidence ref to resolve through `evidence_refs`; `VERIFIED_ACTIVE` additionally requires a passed read-only simulation trace.

Execution Assurance strict mode requires current-task evidence refs, a concrete actual diff binding, a completion contract, planned impact surfaces, a resolvable execution plan reference, independent review when required, source-system trace, digest-backed evidence identity when available, explicit planned target paths for actual changed files, Markdown/JSON binding-table consistency, and a patch assessment that does not hide partial or broad changes behind safe-patch wording.

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
