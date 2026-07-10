# IntentOS 1.97.0 Self-Check Report

## Scope

- read-only Project Identity Projection;
- Evidence Authority identity reuse;
- project, governance, production, worktree, IntentOS, baseline, and platform
  posture;
- source trace, conflict, confidence, and digest behavior;
- Operating Decision identity binding;
- beginner project summary consistency;
- generated-project and no-authority boundaries.

## Results

| Check | Result |
|---|---|
| `node --test tests/operating-model.test.mjs` (`25/25`) | PASS |
| New project projects `NEW_PROJECT / NOT_ESTABLISHED` | PASS |
| Existing light project remains `EXISTING_PROJECT` | PASS |
| Production governance projects `PRODUCTION_SENSITIVE` | PASS |
| IntentOS source has a source-specific projection | PASS |
| Non-Git project uses Evidence Authority `NON_GIT` identity | PASS |
| Dirty worktree is visible without changed filenames | PASS |
| Selected profiles come from structured Workflow Next output | PASS |
| Source failure lowers projection confidence and fails closed | PASS |
| Unchanged projection digest is stable | PASS |
| Project posture change invalidates projection and decision | PASS |
| Human project summary matches structured projection | PASS |
| Material action authorization remains `No` | PASS |
| Generated-project projection smoke | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| `node scripts/check-product-baseline.mjs .` | PASS |
| `node scripts/check-claim-control.mjs .` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary

These checks prove repository and synthetic projection behavior. They do not
authorize or prove implementation, apply, commit, push, release, production,
provider state, project-owner decisions, or product correctness.
