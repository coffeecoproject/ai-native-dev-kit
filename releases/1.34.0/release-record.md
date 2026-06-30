# Release Record: 1.34.0

## Summary

`1.34.0` adds Unified Apply Plan Governance.

The release creates one read-only plan surface before Codex writes target-project files. It consolidates scattered write-capable recommendations into a single plan with proposed actions, evidence, preconditions, human-only actions, backup, rollback, verification, and explicit no-apply boundaries.

## Added

- `core/unified-apply-plan.md`
- `docs/unified-apply-plan.md`
- `docs/unified-apply-plan-1.34-plan.md`
- `templates/unified-apply-plan.md`
- `checklists/unified-apply-plan-review.md`
- `prompts/apply-plan-agent.md`
- `apply-plans/`
- `scripts/resolve-apply-plan.mjs`
- `scripts/check-apply-plan.mjs`
- `apply-plan` and `apply-plan-check` CLI entries
- 1.34 example and bad fixtures

## Changed

- README, script references, manifest, CI, generated-project asset lists, AGENTS/PR governance wording, and release checks now include Unified Apply Plan.
- `npm run verify` includes apply-plan syntax and governance smoke checks.

## Boundary

This release does not:

- write target files
- approve apply
- add a generic write executor
- apply init/update plans
- apply baseline plans
- move/archive/delete documents
- install hooks
- change CI
- enable BL2 or industrial packs
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, tax, legal, data, hook, CI, automation, release, or production decisions

## Allowed Claims

- AI Native Dev Kit can produce a Unified Apply Plan.
- The plan can list proposed writes, evidence, human-only actions, backup, rollback, and verification requirements.
- The plan can explain why an apply path is blocked or needs human approval.

## Forbidden Claims

- Do not claim the plan authorizes apply.
- Do not claim Codex may write after plan generation.
- Do not claim high-risk actions are approved.
- Do not claim implementation, release, production, hooks, CI, archive moves, secrets, migrations, or industrial packs are approved.

## Evidence Status

- Release evidence is complete. `releases/1.34.0/self-check-report.md` is `PASS`.

## Known Limitations

- The resolver classifies requested actions heuristically from `--intent` and `--action`.
- The plan is not a general write executor.
- Existing specialized apply commands still own their own low-level apply behavior.
- Real project adoption remains evidence-dependent and should default to read-only mapping for governed or production-sensitive projects.

## Verification

See `releases/1.34.0/self-check-report.md`.
