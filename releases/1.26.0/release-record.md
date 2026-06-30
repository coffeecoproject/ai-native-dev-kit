# Release Record: 1.26.0

## Summary

`1.26.0` adds Delivery Path Governance.

It lets Codex explain how far a project or task is from being usable by real
people without requiring the user to understand internal workflow commands.

## Added

- `core/delivery-path-governance.md`
- `docs/delivery-path-governance.md`
- `templates/delivery-path-report.md`
- `checklists/delivery-path-review.md`
- `prompts/delivery-path-agent.md`
- `delivery-path-reports/`
- `scripts/resolve-delivery-path.mjs`
- `scripts/check-delivery-path.mjs`
- `docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md`
- 1.26 example and bad fixtures

## Boundary

This release does not:

- write target project files
- change CI or hooks
- change task state
- approve implementation
- approve release or production
- replace Safe Launch
- prove real users can use the product

## Allowed Claims

- AI Native Dev Kit can produce a read-only Delivery Path Report through `delivery-path`.
- Delivery Path Reports can describe the current delivery state, next target state, missing evidence, blockers, and next safe action.
- The checker validates recorded reports for valid states, evidence, blockers, boundaries, and release-overclaim protection.
- Generated projects receive the 1.26 delivery path scripts, template, prompt, checklist, protocol, documentation, and report directory through manifest-managed workflow assets.

## Forbidden Claims

- Do not claim that 1.26 approves implementation, release, production, real-user use, CI changes, hook changes, or task-state changes.
- Do not claim that Delivery Path replaces Safe Launch, Review Surface, Work Queue, Document Lifecycle, Hook Orchestration, or human approval.
- Do not claim that `READY_FOR_RELEASE_REVIEW` means release is approved.
- Do not claim that a Delivery Path Report proves a real project is production ready.

## Evidence Status

- Source assets, examples, bad fixtures, CLI commands, generated-project copy rules, and workflow-version assets are recorded in `dev-kit-manifest.json`.
- `scripts/check-delivery-path.mjs` validates source and generated Delivery Path Reports and rejects 1.26 bad fixtures for release overclaim and missing state.
- Full release evidence is pending until `npm run verify` completes and `self-check-report.md` is updated from `PENDING` to `PASS`.

## Known Limitations

- Delivery state is signal-based and conservative.
- The checker validates recorded reports; it does not certify every real target-project behavior.
- Release and production decisions still require Safe Launch and human acceptance.

## Verification

See `self-check-report.md`.
