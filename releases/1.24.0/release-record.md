# Release Record: 1.24.0

## Summary

`1.24.0` adds Natural Language Workflow Orchestrator as the plain-language front door for AI Native Dev Kit.

It lets Codex read a project and return one Workflow Guidance Card without requiring the user to choose internal commands.

## Added

- `core/natural-language-orchestrator.md`
- `docs/natural-language-orchestrator.md`
- `templates/workflow-guidance-card.md`
- `templates/user-decision-card.md`
- `checklists/workflow-guidance-review.md`
- `prompts/workflow-concierge-agent.md`
- `workflow-guidance-cards/`
- `scripts/resolve-workflow-guidance.mjs`
- `scripts/check-workflow-guidance.mjs`
- CLI commands `guide` and `guide-check`

## Boundary

This release does not:

- write target project files from guidance
- modify CI
- install hooks
- delete or archive documents
- change task state
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, or data decisions

## Allowed Claims

- AI Native Dev Kit has a plain-language workflow guidance entry through `guide`.
- Workflow Guidance Cards can recommend the next safe workflow path without writing target files.
- The guidance checker validates recorded cards for question limits, plain-language boundaries, and overclaim protection.
- Generated projects receive the 1.24 guidance scripts, templates, prompt, checklist, and guidance directory through manifest-managed workflow assets.

## Forbidden Claims

- Do not claim that 1.24 automatically applies the recommended workflow path.
- Do not claim that a Workflow Guidance Card authorizes target-project writes, implementation, release, production, hook installation, CI changes, document archive, task-state changes, or high-risk domain decisions.
- Do not claim that 1.24 proves a real project is production ready.
- Do not claim that plain guidance replaces existing governed-project adoption, document lifecycle, work queue, hook plan, review loop, or launch readiness checks.

## Evidence Status

- Source assets, examples, bad fixtures, CLI commands, generated-project copy rules, and workflow-version assets are recorded in `dev-kit-manifest.json`.
- `scripts/check-workflow-guidance.mjs` validates source evidence and rejects the 1.24 bad fixtures.
- Full release evidence is pending until `npm run verify` completes and `self-check-report.md` is updated from `PENDING` to `PASS`.

## Known Limitations

- The orchestrator is signal-based and conservative; uncertain projects may be routed to read-only planning until a human confirms risk.
- Plain mode intentionally hides internal workflow names, so maintainers should use developer or maintainer mode when they need command-level routing evidence.
- The checker validates recorded Workflow Guidance Cards; it does not scan or certify all real target-project behavior.
- Hook/API automation, automatic workflow switching, and production approval remain outside this release.

## Verification

See `self-check-report.md`.
