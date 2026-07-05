# Review Packet: Checker Library Refactor

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-06-27

Reviewer: main-thread review loop

Review target: `tasks/040-checker-library-refactor.md`

## Review Purpose

What should the reviewer focus on?

- Confirm the shared helper refactor preserved checker behavior.
- Confirm generated projects receive the helper libraries required by copied scripts.
- Confirm `init-project.mjs` and `new-workflow-item.mjs` kept script-specific local helpers instead of being forced into generic behavior.

What should the reviewer ignore?

- Do not evaluate new workflow concepts, license policy, industrial pack maturity, or migration command behavior in this packet.

## Project State

Project root: `/Users/liushan/Developer/CodingFlow/intentos`

Branch: `main`

Project state tags: intentos source repository

Adoption mode: repository maintenance

Workflow next action: `RUN_DEV_KIT_SELF_CHECK`

Dirty worktree: Yes, only current 0.40.1 task changes

Changed file count: grouped across scripts, manifest/version docs, phase artifacts, and shared libraries

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/040-checker-library-refactor.md` | Ready | phase intent |
| Preflight | `preflight/040-checker-library-refactor.md` | Ready | scope validation |
| Spec | `specs/040-checker-library-refactor.md` | Ready | helper contract |
| Eval | `evals/040-checker-library-refactor.md` | Ready | checks and reject conditions |
| Task | `tasks/040-checker-library-refactor.md` | Ready | L2 execution boundary |
| AI task log | Not created | Not applicable | phase evidence uses Review Loop and Final Report |
| Release evidence | `releases/0.40.1/phase-report.md` | Ready | release phase report |

## Request Summary

- Start `0.40.1` after fixture matrix expansion.
- Reduce duplicated checker plumbing through shared libraries.
- Preserve existing behavior and output.

## Spec / Scope Summary

Allowed scope:

- Add shared helpers under `scripts/lib/`.
- Migrate repeated `parseArgs`, `sectionBody`, git state, file walking, and simple result recording.
- Update manifest, workflow version assets, version metadata, README notes, and phase evidence.

Forbidden scope:

- Checker semantic redesign.
- Dependency addition.
- Migration command implementation.
- Generated project snapshot commit.
- Platform or industrial baseline policy changes.

Non-goals:

- No new workflow layer.
- No external GPT/API automation.
- No release or license policy decision.

## Acceptance Criteria

- Shared helper files exist and are used by covered scripts.
- Fixture matrix passes.
- Dev-kit self-check passes.
- Generated projects receive required helper libraries.
- No new package dependency is added.
- Special script-specific helpers are preserved where generic helper behavior would differ.

## Risk Gate

Checked risk items:

- none

Risk Gate Exclusions:

| Mentioned term | Why excluded | Human accepted |
|---|---|---|
| dependency | Mentioned only as a forbidden action; no package dependency was added | Yes |
| migration | Mentioned only as a non-goal; no migration command behavior was implemented | Yes |

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by: Not Required

Approved at: Not Required

## Baseline State

Onboarding state: not applicable for intentos source repository

Engineering baseline checked: Not applicable

Engineering baseline ref: not applicable

Engineering baseline gaps: none

Platform baseline state: not applicable

Selected profiles: none

Industrial baseline state: not applicable

Baseline level: not selected

Selected industrial packs: none

## Evidence

Commands run:

```text
node --check scripts/lib/args.mjs
find scripts -name '*.mjs' -exec node --check {} \;
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-checker-library-refactor.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-checker-library-refactor.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-checker-library-refactor.md
node scripts/check-intentos.mjs
```

Verification results:

- PASS: all script syntax checks
- PASS: fixture matrix, 43 cases
- PASS: manifest check
- PASS: Goal Mode check
- PASS: Subagent Orchestration check
- PASS: workflow artifact task graph check
- PASS: full intentos self-check

Evidence refs:

- `releases/0.40.1/phase-report.md`
- `review-loop-reports/040-checker-library-refactor.md`
- `final-reports/040-checker-library-refactor.md`

Skipped evidence and reason:

- External GPT/API review was not used because 0.40.1 uses local review loop only.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/lib/*.mjs` | Added | shared helper libraries | internal utility risk |
| `scripts/check-*.mjs`, `scripts/resolve-*.mjs`, `scripts/workflow-next.mjs`, `scripts/score-output-quality.mjs` | Updated | use shared helpers | behavior drift risk covered by fixtures |
| `intentos-manifest.json`, `templates/workflow-version.json`, `templates/version-record.md` | Updated | generated projects receive required helper assets | target copy completeness |
| `VERSION.md`, `package.json`, README files, roadmap | Updated | version and human-facing notes | documentation drift |
| `requests/`, `preflight/`, `specs/`, `evals/`, `tasks/`, `goal-cards/`, `subagent-run-plans/`, `review-*`, `final-reports/`, `decision-briefs/`, `releases/0.40.1/` | Added | phase evidence | process evidence only |

## Diff Summary

- Added five shared helper libraries.
- Removed repeated helper implementations from covered scripts.
- Preserved special local helpers in `init-project.mjs` and `new-workflow-item.mjs`.
- Updated manifest and generated-project workflow version assets for helper copying.
- Updated 0.40.1 version and release evidence.

## Known Risks

- Some scripts still have local helpers by design because their behavior is not identical to generic checker plumbing.
- The refactor is behavior-preserving only to the extent covered by the fixture matrix and intentos self-check.

## Open Questions

- No current-task open question.

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] Human Approval is present when required.
- [x] Verification evidence is enough for the stated risk.
- [x] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [x] Baseline or industrial evidence gaps are called out.
- [x] Dirty worktree or pre-existing changes are separated from this task.
- [x] No secrets, production config, migrations, or release paths changed without approval.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

Findings:

- No blocking finding.

Required follow-up:

- Commit 0.40.1 after final checks pass.
