# Release 1.23.0: Hook Orchestration Governance

## Human Summary

1.23.0 adds hook orchestration governance.

It helps Codex distinguish safe automatic read-only checks from hooks that need human confirmation before installation, CI changes, blocking gates, API calls, auto-fix, release behavior, or production impact.

## What Changed

- Added `core/hook-orchestration.md`.
- Added `docs/hook-orchestration.md`.
- Added `templates/hook-orchestration-plan.md`.
- Added `checklists/hook-orchestration-review.md`.
- Added `prompts/hook-orchestration-agent.md`.
- Added `hook-orchestration-plans/` as the plan directory.
- Added `scripts/resolve-hook-orchestration.mjs` for read-only hook candidate mapping.
- Added `scripts/check-hook-orchestration.mjs` for recorded plan validation.
- Added CLI entries: `hook-plan` and `hook-plan-check`.
- Added an example and bad fixtures for hook orchestration plans.

## Allowed Claims

- 1.23.0 helps Codex classify hook candidates as H0/H1/H2/H3.
- H0/H1 can be read-only or suggestion-only.
- H2 requires human confirmation before non-blocking installation or file changes.
- H3 requires explicit approval before blocking, CI, API, release, auto-fix, or production-related behavior.
- 1.23.0 checks recorded Hook Orchestration Plans for plan-first boundaries.

## Forbidden Claims

- Do not claim 1.23.0 installs hooks.
- Do not claim 1.23.0 modifies CI.
- Do not claim 1.23.0 adds blocking gates.
- Do not claim 1.23.0 calls external APIs.
- Do not claim 1.23.0 enables auto-fix.
- Do not claim 1.23.0 changes target-project files.
- Do not claim 1.23.0 approves implementation, release, production, security, compliance, privacy, payment, migration, or data decisions.
- Do not claim hook output replaces human approval.

## Evidence Status

- Evidence is based on local repository checks, examples, bad fixtures, generated-project smoke, and source self-check.
- No target-project hook is installed by this release.
- No CI workflow is modified by the resolver or checker.
- No blocking gate, external API call, auto-fix, release approval, or production approval is claimed.

## Known Limitations

- `hook-plan` prints a read-only recommendation; it does not write a plan into the target project.
- `hook-plan-check` validates recorded plans; it does not prove all external automation is safe.
- Actual hook installation remains a separate reviewed task after human approval.
- External GPT/API reviewer automation remains out of scope unless separately approved with cost, privacy, secret, and rollback controls.

## Verification

Required checks:

```bash
node scripts/resolve-hook-orchestration.mjs .
node scripts/resolve-hook-orchestration.mjs . --json
node scripts/check-hook-orchestration.mjs .
node scripts/check-hook-orchestration.mjs examples/1.23-hook-orchestration
node scripts/check-dev-kit.mjs
npm run verify:release
npm run verify
git diff --check
```

## Next

Future work may add optional hook installation plans or adapters, but only through explicit human approval, rollback documentation, and project-specific integration.

