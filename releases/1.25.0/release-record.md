# Release Record: 1.25.0

## Theme

Review Surface Governance.

## Summary

1.25.0 adds a read-only review-surface layer. Codex can decide which parts of a task must be reviewed before execution and after execution, without asking users to choose technical review types.

## Added

- `core/review-surface-governance.md`
- `docs/review-surface-governance.md`
- `templates/review-surface-card.md`
- `checklists/review-surface-review.md`
- `prompts/review-surface-agent.md`
- `scripts/resolve-review-surface.mjs`
- `scripts/check-review-surface.mjs`
- `review-surface-cards/`
- 1.25 example and bad fixtures

## Boundary

Review Surface Cards do not approve implementation, release, production, security, privacy, compliance, payment, migration, or data decisions.

## Allowed Claims

- AI Native Dev Kit can generate a read-only Review Surface Card through `review-surface`.
- Review Surface Cards help Codex decide which review surfaces are required for a task before execution and close them out after execution.
- Review Surface Governance always requires functional review, code review, verification review, and debt review.
- The review-surface checker validates recorded cards for required surfaces, forbidden approval claims, unverified-surface disclosure, debt result, and next delivery state.
- Generated projects receive the 1.25 review surface scripts, template, prompt, checklist, protocol, documentation, and card directory through manifest-managed workflow assets.

## Forbidden Claims

- Do not claim that a Review Surface Card approves implementation, target-project writes, release, production, CI changes, hook installation, security decisions, privacy decisions, compliance decisions, payment decisions, migration decisions, or data decisions.
- Do not claim that Review Surface Governance replaces Review Loop, Safe Launch, Work Queue, Document Lifecycle, Hook Plan, Existing Governance Adoption, or human approval rules.
- Do not claim that 1.25 automatically scans all real project behavior or proves a project is production ready.
- Do not claim that optional review surfaces are optional to ignore when task evidence shows data, permission, UX, documentation, release, existing-governance, security, or privacy impact.

## Evidence Status

- Source assets, examples, bad fixtures, CLI commands, generated-project copy rules, and workflow-version assets are recorded in `dev-kit-manifest.json`.
- `scripts/check-review-surface.mjs` validates source and generated Review Surface Cards and rejects 1.25 bad fixtures for forbidden approval claims and missing debt review.
- Full release evidence is pending until `npm run verify` completes and `self-check-report.md` is updated from `PENDING` to `PASS`.

## Known Limitations

- Review Surface selection is signal-based and conservative; uncertain tasks may include extra review surfaces instead of narrowing too aggressively.
- The checker validates recorded Review Surface Cards; it does not automatically inspect every changed file or certify real project behavior.
- Review Surface Governance is a review planning and close-out layer, not an implementation planner, release gate, hook installer, or CI policy by itself.
- Human decisions are still required for high-risk, production, security, privacy, compliance, payment, migration, and data-boundary changes.

## Verification

See `releases/1.25.0/self-check-report.md`.
