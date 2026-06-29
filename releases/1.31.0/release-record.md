# Release Record: 1.31.0

## Summary

`1.31.0` adds Intent-Aware Deep Guide.

`guide --deep --intent "<goal>"` now combines project structure with the user's natural-language goal before choosing read-only downstream checks.

## Added

- `--intent` support in `scripts/resolve-workflow-guidance.mjs`
- Intent classification for new product, feature, payment/value transfer, auth/permission, data/migration, release/deploy, document governance, task switch/resume, bug fix, automation/hook, general change, and not provided
- `intentUnderstanding` JSON output
- User-facing `User Intent` section in Workflow Guidance Cards
- Intent-aware deep guide example and release evidence

## Changed

- Deep guide can pass raw intent to downstream resolvers that already support intent.
- Review surface and delivery path are still always included in deep guide.
- Work queue, debt handoff, document lifecycle, hook policy, baseline decision, and workflow map can be selected based on project signals plus user intent.
- README, CLI help, scripts reference, workflow guidance docs, CI smoke checks, and governance verification now include intent-aware guide usage.

## Boundary

This release does not:

- write target files
- modify CI
- install hooks
- delete or archive documents
- change task state
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, tax, legal, data, or automation decisions
- replace detailed downstream evidence

## Allowed Claims

- AI Native Dev Kit can classify a provided user intent and use it to improve deep guide routing.
- Payment, auth, data, release, document, task-switch, bug-fix, and automation intents can raise relevant review focus and risk questions.
- Intent-aware guide stays read-only and compresses selected resolver output into one guidance card.

## Forbidden Claims

- Do not claim that intent classification is authoritative.
- Do not claim that `--intent` approves payment, auth, data, migration, release, hook, CI, tax, legal, privacy, security, or production decisions.
- Do not claim that `--intent` executes or applies anything.
- Do not claim that all resolvers always run.

## Evidence Status

- Release evidence is recorded in `releases/1.31.0/self-check-report.md`.
- `node scripts/check-dev-kit.mjs`, `npm run verify`, and `git diff --check` passed on 2026-06-29.

## Known Limitations

- Intent classification is heuristic and must be confirmed by a human for high-risk work.
- Intent-aware guide only passes intent to downstream resolvers that accept it.
- Real production validation is still not claimed.
- Detailed downstream reports remain necessary for implementation, review, or release evidence.

## Verification

See `releases/1.31.0/self-check-report.md`.
