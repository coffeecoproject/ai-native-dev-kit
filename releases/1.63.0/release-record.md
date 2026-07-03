# 1.63.0 Release Record

## Human Summary

1.63.0 hardens Native-First Existing Project Migration. It moves old-project migration review from file-level classification to rule-level extraction, so Codex cannot collapse business rules, production controls, engineering baselines, and old workflow instructions into one broad "replace" decision.

## Theme

Native Migration Precision Hardening.

1.63 keeps the 1.62 migration model:

```text
read old project
plan native migration
preserve business and production authority
require human approval before governance replacement
route writes through apply planning
```

It adds precision evidence:

```text
source file
source line range
context heading
source excerpt
rule class
confidence
rule extraction coverage
parser warnings
machine-readable evidence
```

## What Changed

- Added `scripts/lib/native-rule-extraction.mjs`.
- Added `schemas/artifacts/native-migration-plan.schema.json`.
- Updated `scripts/resolve-native-migration.mjs` to emit rule extraction coverage, parser warnings, line ranges, and machine-readable evidence.
- Updated `scripts/check-native-migration.mjs` with `--require-structured-evidence`.
- Updated `templates/native-migration-plan.md`.
- Updated native migration docs, checklist, and prompt.
- Added `examples/1.63-native-migration-precision/mixed-agent-rules`.
- Added bad fixtures for:
  - collapsed mixed rules
  - missing source line ranges
  - structured evidence mismatch
  - schema version drift
- Hardened workflow-map checks so Workflow Adoption Map cannot present itself as the final native adoption endpoint.

## Compatibility

Default `check-native-migration` remains compatible with older Markdown-only 1.62 migration records.

Strict mode is opt-in:

```bash
node scripts/check-native-migration.mjs <project> --require-structured-evidence
```

Use strict mode when a Native Migration Plan will become the basis for real governance replacement review.

## Authority Boundary

1.63 still does not:

- write target-project files
- replace `AGENTS.md`
- approve implementation
- approve release or production
- edit CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- replace project business authority
- replace release, production, security, privacy, compliance, legal, tax, finance, HR, or customer-data authority

## Allowed Claims

- IntentOS can extract old project rules with source line ranges and context headings for migration review.
- IntentOS can record rule extraction coverage, including lines scanned, rules extracted, unclassified blocks, and parser warnings.
- IntentOS can emit machine-readable Native Migration Plan evidence for strict checker review.
- IntentOS can keep legacy Markdown migration records compatible by default while requiring strict evidence for real governance replacement review.
- IntentOS can reject unsafe native migration records that collapse mixed rules, omit line ranges, mismatch structured evidence, or drift schema version.
- IntentOS can reject Workflow Adoption Map records that present themselves as the final native adoption endpoint.

## Forbidden Claims

1.63 does not:

- prove a target project is fully migrated
- prove every old project rule is current, correct, or authoritative
- authorize target-project writes
- approve implementation
- approve release or production
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, provider state, migrations, secrets, payment, permissions, or data
- replace project business authority or human/external production authority
- turn parser warnings into approval
- treat structured evidence as a human decision

## Evidence Status

- `docs/plans/native-migration-precision-hardening-1.63-plan.md` records the execution and acceptance plan.
- `scripts/lib/native-rule-extraction.mjs` implements deterministic rule extraction.
- `schemas/artifacts/native-migration-plan.schema.json` defines structured migration evidence.
- `scripts/resolve-native-migration.mjs` emits the new evidence.
- `scripts/check-native-migration.mjs` validates default and strict modes.
- `examples/1.63-native-migration-precision/mixed-agent-rules` proves mixed rules stay separated.
- `test-fixtures/bad/bad-native-migration-*` and `bad-workflow-map-adapter-endpoint` prove unsafe records are rejected.
- `releases/1.63.0/self-check-report.md` records verification commands and result.

## Known Limitations

- Strict structured evidence checks run only when `--require-structured-evidence` is requested.
- Rule extraction is deterministic and conservative, but it cannot prove every source line is semantically current.
- Parser warnings and unclassified blocks require human review before governance replacement.
- The checker validates recorded migration plans; it does not inspect live production systems.
- Migration apply remains outside 1.63 and still requires Unified Apply Plan, Controlled Apply Readiness, and Approval Record.

## Acceptance

The release is accepted only if:

- syntax checks pass for the new library, resolver, checker, and source checks
- strict native migration example passes
- new bad fixtures fail in strict mode
- workflow adoption map rejects adapter-endpoint overclaim
- manifest, README, package, VERSION, workflow-version assets, and release evidence are synchronized
- `npm run verify` passes

## Verification

See `releases/1.63.0/self-check-report.md`.
