# Decision Brief: Artifact Frontmatter Compatibility

## Human Summary

The decision for phase `0.39.0` is to add frontmatter for new artifacts while keeping old artifacts compatible by default.

## Current Status

- Decision: new generated artifacts include schema-backed frontmatter.
- Legacy policy: old artifacts without frontmatter warn by default in `0.39.x`.
- Strict policy: `--strict-schema` fails old artifacts without frontmatter for migration rehearsals.
- Risk level: medium, because checker behavior changes.

## What I Need From You

No additional decision is needed to close this phase. A future human decision is needed before strict schema becomes default or old examples are bulk migrated.

## Recommended Next Step

Close `0.39.0` after verification passes, then start `0.40.0` fixture matrix expansion.

## What AI Can Do Safely

- Add schemas and frontmatter helper.
- Emit frontmatter for new generated artifacts.
- Warn for legacy artifacts by default.
- Fail legacy artifacts under explicit `--strict-schema`.
- Keep Markdown section checks active.

## What AI Must Not Do

- Do not bulk migrate examples in this phase.
- Do not make strict schema default.
- Do not remove Markdown section checks.
- Do not add dependencies.
- Do not treat frontmatter as implementation or risk approval.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Add frontmatter for new artifacts in `0.39.0` | Confirmed by task scope | Repository owner | `tasks/039-artifact-frontmatter-schema.md` |
| Make strict schema default | Deferred | Repository owner | Future release decision |
| Bulk migrate existing examples | Deferred | Repository owner | Future `0.40.x` work |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.40.0` fixture matrix expansion after this phase is reviewed | Next roadmap phase, outside current task | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not make strict schema default inside `0.39.0` | It would break legacy compatibility | No | do not proceed | Separate approval required |

## Technical Details

Frontmatter validates metadata fields only. Existing Markdown sections still carry human-readable detail and remain checked.

## Audit Notes

- This brief is a compatibility-boundary decision, not release approval.
- No package publishing is approved.
- No dependency is added.
