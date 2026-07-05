# Release Record: 1.30.0

## Summary

`1.30.0` adds Deep Guide Orchestration.

The `guide` command remains the plain-language front door. With `--deep`, it selectively runs relevant read-only resolvers and compresses the results back into one Workflow Guidance Card.

## Added

- `guide --deep` support in `scripts/resolve-workflow-guidance.mjs`
- Selective read-only orchestration for baseline decision, workflow map, review surface, delivery path, work queue, document lifecycle, and hook policy
- Deep orchestration JSON output under `deepOrchestration`
- Plain `What I Checked` section for deep guidance cards
- 1.30 deep guide example and release evidence

## Changed

- Workflow guidance docs now explain lightweight guide vs deep guide.
- `verify:governance`, CI smoke checks, and intentos self-check now exercise deep guide.
- README and script references now show `node scripts/cli.mjs guide <project> --deep`.

## Boundary

This release does not:

- write target files
- modify CI
- install hooks
- delete or archive documents
- change task state
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, or data decisions
- replace the downstream resolvers it summarizes

## Allowed Claims

- IntentOS can run `guide --deep` to selectively summarize relevant read-only workflow checks into one guidance card.
- Deep guide can include review surface and delivery path by default, then add baseline decision, workflow map, work queue, document lifecycle, or hook policy only when signals justify them.
- Deep guide keeps plain mode user-facing and hides command selection from ordinary users.

## Forbidden Claims

- Do not claim that `guide --deep` applies recommendations, writes files, updates tasks, archives documents, installs hooks, changes CI, or approves release.
- Do not claim that `guide --deep` proves production readiness or replaces detailed downstream evidence.
- Do not claim that all resolvers always run.

## Evidence Status

- Release evidence is recorded in `self-check-report.md`.
- `node scripts/check-intentos.mjs`, `npm run verify`, and `git diff --check` passed on 2026-06-29.

## Known Limitations

- Deep guide is read-only and does not write target files.
- Deep guide summarizes selected resolver output; it does not replace detailed downstream evidence.
- Deep guide does not prove production readiness or real-user usability.
- Deep guide does not apply archive plans, change task state, install hooks, modify CI, approve implementation, approve release, or approve production.

## Verification

See `releases/1.30.0/self-check-report.md`.
