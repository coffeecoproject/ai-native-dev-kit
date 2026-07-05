# Release 1.27.0: Debt & Knowledge Handoff

## Human Summary

1.27.0 adds a safe handoff layer for unfinished work, paused work, and known debt. It helps Codex explain what remains, how to verify it, and where to resume next time.

## What Changed

- Added Debt & Knowledge Handoff protocol, docs, template, checklist, and prompt.
- Added `debt-handoff` and `debt-handoff-check` CLI paths.
- Added `debt-handoff-reports/` as the durable handoff evidence directory.
- Added examples and bad fixtures for debt-forgiveness overclaim and missing verification handoff.

## Boundaries

- This release does not forgive debt.
- This release does not approve implementation.
- This release does not approve release or production.
- This release does not change task state.
- This release does not change source of truth.
- This release does not replace Review Loop or Safe Launch.

## Allowed Claims

- IntentOS can produce a read-only Debt & Knowledge Handoff Report through `debt-handoff`.
- Debt & Knowledge Handoff Reports can record debt level, verification notes, files to revisit, human decisions, and the next safe resume point.
- The checker validates recorded reports for debt-forgiveness overclaims, required verification handoff, release-boundary claims, and missing handoff context.
- Generated projects receive the 1.27 debt handoff scripts, template, prompt, checklist, protocol, documentation, and report directory through manifest-managed workflow assets.

## Forbidden Claims

- Do not claim that 1.27 forgives debt, approves implementation, approves release or production, changes task state, changes source of truth, or accepts risk.
- Do not claim that a Debt & Knowledge Handoff Report replaces Review Loop, Review Surface, Safe Launch, Work Queue, Document Lifecycle, Hook Policy, or human approval.
- Do not claim that D3/D4 debt can continue into release review without an explicit human decision.
- Do not claim that the resolver automatically scans every real project dependency, runtime path, or production behavior.

## Evidence Status

- Source assets, examples, bad fixtures, CLI commands, generated-project copy rules, and workflow-version assets are recorded in `intentos-manifest.json`.
- `scripts/check-debt-handoff.mjs` validates source and generated Debt & Knowledge Handoff Reports and rejects 1.27 bad fixtures for debt forgiveness and missing verification handoff.
- Full release evidence is pending until `npm run verify` completes and `self-check-report.md` is updated from `PENDING` to `PASS`.

## Known Limitations

- Debt & Knowledge Handoff is a recorded report protocol, not an automatic project scanner.
- The resolver infers obvious debt from local project signals and git state only.
- A handoff report cannot approve implementation, release, production, risk acceptance, source-of-truth changes, or task-state changes.
- D3/D4 debt still requires human decision before release review or high-risk continuation.

## Verification

Status: PASS after local self-check.

Commands:

```bash
node --check scripts/resolve-debt-handoff.mjs
node --check scripts/check-debt-handoff.mjs
node scripts/resolve-debt-handoff.mjs . --json
node scripts/check-debt-handoff.mjs .
node scripts/check-debt-handoff.mjs examples/1.27-debt-knowledge-handoff
npm run verify
```

## User Impact

Users do not need to understand debt taxonomy. Codex should summarize the current debt level, what needs human confirmation, and the next safe action in plain language.
