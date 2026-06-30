# 1.4.0 Release Record

## Release Type

Project Memory & Context Governance release.

## Human Summary

1.4.0 adds a controlled project memory layer: Codex can propose learning and corrections, but humans confirm before project facts change.

## Theme

Project Memory & Context Governance.

## Added

- Context Governance.
- Git Boundary.
- Learning Candidate template and directory.
- Context Correction Report template and directory.
- Git Boundary Report template and directory.
- Context governance checker.
- Context/Git boundary review checklists and reviewer prompt.
- 1.4 examples and bad fixtures.

## Allowed Claims

- 1.4.0 adds deterministic checks for context governance artifacts.
- 1.4.0 distinguishes confirmed project facts from inferred or pending context.
- 1.4.0 documents that Git-backed source of truth overrides model memory.
- 1.4.0 helps Codex propose learning and correction candidates without automatically changing project rules.

## Forbidden Claims

- Do not call 1.4.0 Codex self-learning.
- Do not claim automatic project memory persistence.
- Do not claim full secret scanning coverage.
- Do not claim production validation.
- Do not claim Safe Launch / Delivery Readiness.

## Evidence Status

| Evidence | Status | Notes |
|---|---|---|
| Simulated dogfood | Present | 1.4 workflow artifacts exercise the phase. |
| Bad fixtures | Present | Approved-without-evidence, missing correction evidence, and secret-like Git boundary misuse. |
| Generated-project smoke | Expected | Covered by dev-kit self-check. |
| Controlled real-project trial | Not present | Requires later trial. |
| Production adoption evidence | Not present | Not claimed. |

## Known Limitations

- Context governance is deterministic and structure-based.
- Obvious-pattern secret checks do not replace dedicated secret scanning.
- Learning candidates are not mandatory for ordinary tasks.
- Context corrections need human confirmation before source-of-truth updates.
- External memory, vector database, and model-memory integration remain out of scope.

## Verification

```bash
node scripts/check-context-governance.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Related Artifacts

- docs/plans/project-memory-context-governance-1.4-plan.md
- requests/140-project-memory-context-governance.md
- tasks/140-project-memory-context-governance.md
- review-loop-reports/140-project-memory-context-governance.md
- final-reports/140-project-memory-context-governance.md

