# IntentOS 1.96.0 Self-Check Report

## Scope

- structured Operating Decision Contract;
- deterministic action precedence;
- source and blocker traceability;
- human/machine next-action consistency;
- missing-goal, dirty-worktree, risk, closure, release, and adoption behavior;
- generated-project installation and CI smoke behavior;
- no-authority and no-parallel-artifact boundaries.

## Results

| Check | Result |
|---|---|
| `node --test tests/operating-model.test.mjs` (`22/22`) | PASS |
| Missing goal selects `REQUEST_GOAL` | PASS |
| Dirty worktree selects `REVIEW_CURRENT_WORK` | PASS |
| New project selects `PREPARE_PROJECT_PLAN` | PASS |
| Existing-project adoption selects `RUN_ADOPTION_REVIEW` | PASS |
| Status selects `SUMMARIZE_CURRENT_STATUS` | PASS |
| LOW and MEDIUM task routes remain distinct | PASS |
| POSSIBLE_HIGH selects read-only risk inspection | PASS |
| HIGH selects first Task Governance prerequisite | PASS |
| Invalid closure cannot report done | PASS |
| Strict matching closure can select completion reporting | PASS |
| Source failure outranks every easier route | PASS |
| Semantic decision digest is stable | PASS |
| Human Summary action equals structured action | PASS |
| Material action authorization remains `No` | PASS |
| Generated-project contract smoke | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| `node scripts/check-product-baseline.mjs .` | PASS |
| `node scripts/check-claim-control.mjs .` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary

These checks prove IntentOS repository behavior and synthetic decision routing.
They do not authorize or prove implementation, apply, commit, push, release,
production, project-owner decisions, provider state, or product correctness.
