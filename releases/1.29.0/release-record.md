# Release Record: 1.29.0

## Summary

`1.29.0` adds Project Hook Policy Governance.

It lets Codex define which hook classes a project allows, who approves H2/H3
automation, and how hooks are disabled or rolled back before any future approved
hook implementation task.

## Added

- `core/hook-policy.md`
- `docs/hook-policy.md`
- `templates/project-hook-policy.md`
- `checklists/hook-policy-review.md`
- `prompts/hook-policy-agent.md`
- `hook-policies/`
- `scripts/resolve-hook-policy.mjs`
- `scripts/check-hook-policy.mjs`
- 1.29 example and bad fixtures

## Boundary

This release does not:

- install hooks
- modify CI
- add blocking gates
- call external APIs
- store tokens or secrets
- enable auto-fix
- approve implementation, release, or production
- replace Hook Orchestration

## Allowed Claims

- AI Native Dev Kit can produce a read-only Project Hook Policy through `hook-policy`.
- A Project Hook Policy can define allowed hook classes, approval owners, and rollback / disable requirements.
- The checker validates recorded policies for hook-installation overclaims, missing H0-H3 classes, missing approval matrix, missing rollback / disable policy, and release/production overclaims.

## Forbidden Claims

- Do not claim that 1.29 installs hooks, changes CI, adds gates, calls APIs, stores secrets, enables auto-fix, or approves release.
- Do not claim that a Project Hook Policy authorizes implementation.
- Do not claim that Project Hook Policy replaces Hook Orchestration or human approval.

## Evidence Status

- Release evidence is recorded in `self-check-report.md`.
- `node scripts/check-dev-kit.mjs`, `npm run verify`, and `git diff --check` passed on 2026-06-29.

## Known Limitations

- Project Hook Policy is plan-first and does not install hooks, modify CI, add blocking gates, call external APIs, store tokens/secrets, or enable auto-fix.
- Existing organization hook policy outside the repository cannot be inferred from this dev kit.
- H2 and H3 hook approval still requires human decision, named owner, rollback evidence, and project-specific context.
- A recorded policy does not replace Hook Orchestration, Review Loop, Safe Launch, release policy, or human approval.

## Verification

See `releases/1.29.0/self-check-report.md`.
