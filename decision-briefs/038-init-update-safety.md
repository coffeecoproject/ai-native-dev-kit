# Decision Brief: Init/Update Safety Boundary

## Human Summary

The decision for phase `0.38.0` is to make init/update reviewable and safer without turning every update into a heavy migration process.

## Current Status

- Decision: add dry-run, write-plan, apply-plan, backup-dir, stale-plan validation, and direct-update blocking for risky targets.
- Evidence: `scripts/init-project.mjs`, `scripts/cli.mjs`, `scripts/check-intentos.mjs`, and `releases/0.38.0/phase-report.md`.
- Risk level: medium, because init/update writes workflow assets into target projects.

## What I Need From You

No additional decision is needed to close this phase. A future human decision is needed before artifact schema/frontmatter, migration command behavior, package publishing, or license/distribution changes.

## Recommended Next Step

Close `0.38.0` after safety checks and intentos self-check pass, then start `0.39.0` artifact frontmatter and schema from a new task card.

## What AI Can Do Safely

- Generate init/update plans.
- Apply plans after preconditions are validated.
- Preserve backups before managed overwrites when `--backup-dir` is supplied.
- Block direct update on dirty or unbootstrapped existing projects; allow direct update only for already bootstrapped clean targets.
- Keep direct update for already bootstrapped low-risk projects.

## What AI Must Not Do

- Do not treat plan generation as human approval for governance migrations.
- Do not implement migration command behavior.
- Do not add artifact schema/frontmatter in this phase.
- Do not publish package or add dependencies.
- Do not call external GPT/API reviewers.
- Do not scan target project source code as a new static-analysis gate.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Add plan-first init/update safety in `0.38.0` | Confirmed by this task scope | Repository owner | `tasks/038-init-update-safety.md` |
| Add artifact schema/frontmatter | Deferred | Repository owner | Future `0.39.0` task |
| Implement migration command later | Deferred | Repository owner | Future `0.42.0` task |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.39.0` artifact frontmatter and schema after this phase is reviewed | This is the next productization phase, not part of current task | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not implement migration command inside `0.38.0` | It exceeds this phase | No | do not proceed | separate human approval required |
| N3 | DO_NOT_PROCEED | Do not add package publishing or license changes inside `0.38.0` | Those changes are future release decisions | No | do not proceed | separate human approval required |

## Technical Details

Plan-first update is enforced through `workflow-next` for risky target states. Apply-plan validates target existence, git state, dirty summary, and relevant file hashes before writing.

## Audit Notes

- This brief is a safety-boundary decision, not release approval.
- No package publishing is approved.
- No license terms are changed.
- No target business behavior is changed.
