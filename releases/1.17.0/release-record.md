# Release 1.17.0: Guided Baseline Selection Entry

## Human Summary

1.17.0 turns baseline selection into a user-readable decision entry.

It adds Baseline Decision Cards so Codex can explain the recommended BL0/BL1/BL2 path, standard packs, industrial candidates, human decisions, safe next actions, and boundaries without asking the user to understand internal resolver names.

## What Changed

- Added `core/guided-baseline-selection.md`.
- Added `docs/guided-baseline-selection-entry.md`.
- Added `templates/baseline-decision-card.md`.
- Added `checklists/baseline-decision-review.md`.
- Added `prompts/baseline-decision-agent.md`.
- Added `baseline-decision-cards/`.
- Added `scripts/resolve-guided-baseline-selection.mjs`.
- Added `scripts/check-guided-baseline-selection.mjs`.
- Added CLI commands:
  - `baseline-decision`
  - `baseline-decision-check`
- Added `new-workflow-item --type baseline-decision-card`.
- Added 1.17 examples for:
  - new Mini Program
  - new Web admin
  - existing light Web
  - existing governed read-only
  - production-sensitive
  - dirty worktree
  - BL2 candidate
- Added bad fixtures for unsafe decision cards.

## Allowed Claims

- 1.17.0 adds a guided baseline selection entry.
- Codex can now print a Baseline Decision Card for BL level, ordinary standard packs, industrial candidates, human decisions, and safe next actions.
- The guided baseline checker rejects obvious unsafe decision-card wording, including default BL2, all-pack selection, write approval, implementation approval, release approval, production readiness claims, and governed-project overwrite recommendations.
- The 1.17 examples are simulated evidence examples for checker coverage.

## Forbidden Claims

- Do not claim Baseline Decision Cards approve target-project writes.
- Do not claim Baseline Decision Cards approve implementation.
- Do not claim Baseline Decision Cards approve release or production.
- Do not claim Baseline Decision Cards approve BL2 activation.
- Do not claim Baseline Decision Cards approve security, privacy, legal, compliance, payment, finance, tax, HR, migration, or irreversible data decisions.
- Do not claim 1.17.0 makes every platform baseline complete for every real project.
- Do not claim real-project production validation.

## Evidence Status

- Self-check, fixture, manifest, generated-project, and simulated example evidence only.
- No target production project was modified by this release.
- Examples prove checker routing and decision-card shape, not real deployment readiness.
- Real projects still require project-specific read-only assessment, evidence mapping, and human confirmation before write actions.

## Known Limitations

- Baseline Decision Cards are recommendation records only.
- The resolver uses repository signals and documented baselines; it cannot prove unstated business risk.
- BL2 industrial candidates remain candidate-only until the human explicitly approves BL2 and selected packs.
- Existing governed or production-sensitive projects still need adapter/read-only mapping before controlled apply.
- Platform pack choice still needs project-specific confirmation when backend, release, payment, privacy, compliance, migration, or production constraints are unclear.

## User Experience

The expected flow is:

```text
User gives Codex a project path, Git URL, or project idea.
Codex reads project signals.
Codex prints a Baseline Decision Card.
User confirms project state, risk, baseline level, and whether Codex may proceed.
Codex continues only inside the approved boundary.
```

## Checker Rules

`check-guided-baseline-selection.mjs` rejects:

- missing required decision-card sections
- too many human questions
- default BL2
- selecting every standard pack
- listing every industrial pack
- forcing backend for frontend-only or Mini Program projects without evidence
- industrial packs that are not candidate-only
- BL2 candidates without evidence gaps
- target-project write approval
- implementation approval
- release or production approval
- security, privacy, compliance, payment, or migration approval
- production readiness claims
- existing governed project overwrite recommendations
- production-sensitive direct init/update recommendations
- dirty-worktree continuation without a human decision
- vague safe next actions

## Boundary

1.17.0 does not:

- make BL2 default
- select all packs
- approve target-project writes
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, finance, tax, HR, migration, or irreversible data decisions
- replace existing governed project assets
- prove real-project evidence exists
- claim production validation

In checker terms, 1.17.0 does not make BL2 default and does not select all packs.

## Verification

Expected verification:

```bash
node --check scripts/resolve-guided-baseline-selection.mjs
node --check scripts/check-guided-baseline-selection.mjs
node scripts/cli.mjs baseline-decision .
node scripts/cli.mjs baseline-decision-check .
node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Next

After 1.17, future work should use this guided entry to decide baseline depth before expanding or promoting any baseline pack content.
