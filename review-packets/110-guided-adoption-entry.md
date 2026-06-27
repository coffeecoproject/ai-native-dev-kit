# Review Packet: Guided Adoption Entry

## Packet Status

Status: READY_FOR_REVIEW

Prepared by: Codex main thread

Prepared at: 2026-06-27

Reviewer: main-thread review / optional read-only subagent

Review target: 1.1.0 Guided Adoption Entry

## Review Purpose

What should the reviewer focus on?

- Whether `start` is read-only by default.
- Whether recommendations leave human decisions to the human.
- Whether governed, production-sensitive, and dirty projects avoid direct setup.
- Whether generated projects receive the new entry assets.

What should the reviewer ignore?

- Platform baseline deepening.
- Industrial-pack expansion.
- External GPT/API automation.

## Project State

Project root: dev-kit repository

Branch: main

Project state tags: DEV_KIT_REPOSITORY

Adoption mode: NOT_APPLICABLE

Workflow next action: RUN_DEV_KIT_SELF_CHECK

Dirty worktree: Yes

Changed file count: task scoped

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/110-guided-adoption-entry.md` | Ready | Scope source |
| Preflight | `preflight/110-guided-adoption-entry.md` | Ready | Risk routing |
| Spec | `specs/110-guided-adoption-entry.md` | Ready | Behavior definition |
| Eval | `evals/110-guided-adoption-entry.md` | Ready | Verification |
| Task | `tasks/110-guided-adoption-entry.md` | Ready | Implementation scope |
| AI task log | `ai-logs/2026-06-27-guided-adoption-entry.md` | Draft | Work log |
| Release evidence | `releases/1.1.0/release-record.md` | Draft | Release evidence |

## Request Summary

- Add a read-only first-hour entry command.
- Classify project adoption type.
- Recommend safe next steps.
- Keep the user responsible only for judgment decisions.

## Spec / Scope Summary

Allowed scope:

- CLI entry, scripts, checker, docs, examples, manifest, version, CI, and release evidence.

Forbidden scope:

- No automatic target writes from `start`.
- No BL2 or industrial-pack default enablement.
- No external reviewer automation.

Non-goals:

- No business feature work.
- No platform baseline deepening.

## Acceptance Criteria

- `start` is listed in CLI help.
- `start` prints a Guided Adoption Recommendation.
- `Can AI write now` is `No`.
- Saved recommendation examples pass `check-guided-adoption`.
- Self-check passes.

## Risk Gate

Checked risk items:

- None.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Human accepted |
|---|---|---|
| migration | Mentioned as a forbidden scope item, no migration behavior changed | Yes |
| production config | Mentioned as a forbidden scope item, no production config changed | Yes |
| permissions | Mentioned as a forbidden scope item, no permission model changed | Yes |

## Human Approval

Required: No

Status: Not Required

Approval scope: Approved 1.1.0 Guided Adoption Entry request

Approved by: human request

Approved at: 2026-06-27

## Baseline State

Onboarding state: NOT_APPLICABLE

Engineering baseline checked: Yes

Engineering baseline ref: This task changes workflow tooling only.

Engineering baseline gaps: None identified.

Platform baseline state: NOT_APPLICABLE

Selected profiles: none

Industrial baseline state: NOT_SELECTED

Baseline level: none

Selected industrial packs: none

## Evidence

Commands run:

```text
node --check scripts/start-project.mjs
node --check scripts/check-guided-adoption.mjs
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```

Verification results:

- PASS.

Evidence refs:

- `evals/110-guided-adoption-entry.md`
- `releases/1.1.0/release-record.md`

Skipped evidence and reason:

- Real project adoption trial is not required for this tooling release.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/start-project.mjs` | Add | Read-only adoption entry | Medium |
| `scripts/check-guided-adoption.mjs` | Add | Validate saved recommendations | Medium |
| `scripts/cli.mjs` | Update | Expose start | Medium |
| `dev-kit-manifest.json` | Update | Include generated assets | Medium |
| docs/examples/releases | Add/update | Productized usage and evidence | Low |

## Diff Summary

- Adds a read-only guided entry.
- Adds a saved-report checker.
- Adds docs, examples, manifest entries, generated-project CI, and release evidence.

## Known Risks

- Heuristic project classification can be conservative.
- Real-project adoption evidence remains future work.

## Open Questions

- None for 1.1.0 release scope.

## Reviewer Checklist

- [ ] The implementation matches the request and spec.
- [ ] The change stays inside approved scope.
- [ ] Non-goals were not implemented accidentally.
- [ ] Risk Gate items match the actual touched areas.
- [ ] Human Approval is present when required.
- [ ] Verification evidence is enough for the stated risk.
- [ ] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [ ] Baseline or industrial evidence gaps are called out.
- [ ] Dirty worktree or pre-existing changes are separated from this task.
- [ ] No secrets, production config, migrations, or release paths changed without approval.
- [ ] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

Findings:

- No blocking findings after final verification.
