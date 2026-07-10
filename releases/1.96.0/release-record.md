# IntentOS 1.96.0 Release Record

## Theme

Operating Decision Contract.

## Human Summary

IntentOS already lets users enter through one natural-language `work` command.
1.96 makes the selected next step precise for Codex and CI as well: every
Operating State now contains one structured action, one reason, its source
inputs, blockers, current human-decision need, and invalidation conditions.

The beginner explanation is generated from the same action selection. Users do
not choose an internal checker or action code.

## Delivered

- one `operatingDecision` inside the existing `INTENTOS_OPERATING_STATE`;
- stable action, action-class, status, and reason vocabularies;
- fail-closed precedence for source failure, missing goal, dirty worktree,
  unresolved risk, task-governance blockers, closure, and release review;
- source-input trace, semantic source digests, and original blocker preservation;
- deterministic semantic decision digest that excludes timestamps and prose;
- Human Summary next step generated from the same selected action;
- advanced closure evidence forwarding without exposing it in beginner help;
- 22 operating-model and decision-contract acceptance tests;
- generated-project, PR, release, manifest, and self-check coverage.

## Allowed Claims

- `work --json` returns exactly one structured next-action decision.
- The decision explains its reason, blockers, source inputs, and invalidation.
- The beginner next step and machine action come from the same selection.
- Unknown task-governance blockers fail closed to governance preparation.
- Existing source systems and project authority remain authoritative.

## Forbidden Claims

- The Operating Decision is a scheduler, workflow engine, or new authority.
- The selected action has already run or its required artifact already exists.
- An action code authorizes implementation, apply, commit, push, release, or
  production.
- A recommended role is the actual project owner or current approver.
- The decision digest proves source evidence is valid.
- 1.96 guarantees task correctness, product completeness, or production safety.

## Evidence Status

- missing-goal decision: PASS
- dirty-worktree precedence: PASS
- new-project plan decision: PASS
- old-project adoption decision: PASS
- status-summary decision: PASS
- LOW and MEDIUM task review decisions: PASS
- POSSIBLE_HIGH read-only risk decision: PASS
- HIGH task prerequisite decision: PASS
- incomplete closure decision: PASS
- strictly supported completion-report decision: PASS
- release-review decision: PASS
- source-failure precedence: PASS
- semantic digest stability: PASS
- human/machine action consistency: PASS
- generated-project decision contract: PASS
- full repository verification: PASS

## Known Limitations

The decision consumes current source-system outcomes; it does not independently
revalidate every source artifact. If a source system cannot yet recognize a
completed prerequisite, the Operating Decision preserves that blocker rather
than bypassing it. Project identity consolidation is deferred to 1.97, and
additional internal-surface consolidation is deferred to 1.98.

See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

The release is checked through decision-contract positive and negative tests,
strict closure fixture evidence, generated-project smoke tests, Manifest
validation, self-check, product and claim controls, and complete repository
verification. These checks prove repository and synthetic routing behavior;
they do not certify a real product or production release.

See [self-check-report.md](self-check-report.md) for command-level evidence.
