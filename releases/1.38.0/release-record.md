# Release 1.38.0

## Summary

`1.38.0` adds Controlled Apply Readiness.

This release introduces a pre-execution readiness layer after Unified Apply Plan. It lets Codex evaluate whether a reviewed plan is eligible for a future human-approved controlled apply step without executing the plan.

## Added

- `core/controlled-apply-readiness.md`
- `docs/controlled-apply-readiness.md`
- `templates/controlled-apply-readiness-report.md`
- `checklists/controlled-apply-readiness-review.md`
- `prompts/controlled-apply-readiness-agent.md`
- `apply-readiness-reports/`
- `scripts/resolve-controlled-apply-readiness.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `apply-readiness` and `apply-readiness-check` CLI entries
- 1.38 example and bad fixtures

## Changed

- README, documentation index, script reference, artifact reference, checker reference, manifest, generated-project asset lists, CI, and release checks now include Controlled Apply Readiness.
- `npm run verify:governance` includes controlled apply readiness checks.

## Boundary

This release does not:

- add an apply runner;
- write target-project files;
- authorize apply;
- approve implementation;
- approve release or production;
- install hooks;
- modify CI;
- archive, delete, move, or rewrite documents;
- change source of truth;
- enable baseline or industrial packs;
- approve migration, secrets, payment, production config, security, privacy, compliance, legal, or high-risk decisions.

## Allowed Claims

- IntentOS can evaluate apply readiness after a Unified Apply Plan exists.
- Codex can separate low-risk candidates from human-only and blocked actions.
- Controlled Apply Readiness can identify missing target, dirty state, missing rollback, missing verification, and high-risk blockers.
- A readiness report can say a low-risk plan is a candidate for future human-approved apply.

## Forbidden Claims

- Do not claim Controlled Apply Readiness executes writes.
- Do not claim it authorizes apply.
- Do not claim user confirmation in chat is blanket permission.
- Do not claim high-risk actions can be auto-applied by Codex.
- Do not claim implementation, release, production, hooks, CI, archives, migrations, secrets, payments, security, privacy, compliance, legal, or industrial packs are approved.

## Evidence Status

- Release evidence passed through `releases/1.38.0/self-check-report.md`.
- Source checks include controlled apply readiness checker coverage, generated-project workflow checks, manifest consistency, bad fixtures, and release verification.
- Example evidence is synthetic workflow evidence, not production validation.

## Known Limitations

- Controlled Apply Readiness is still not an executor.
- It validates recorded readiness reports and resolver output; it does not inspect every live conversation automatically.
- It does not replace specialized `init-project --apply-plan` or baseline apply protocols.
- It does not prove real production project delivery quality.

## Verification

See `releases/1.38.0/self-check-report.md`.
