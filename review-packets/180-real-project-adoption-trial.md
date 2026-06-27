# Review Packet: 1.8 Real Project Read-only Adoption Trial

## Packet Status

Status: READY_FOR_REVIEW

Prepared by: Codex main thread

Prepared at: 2026-06-27

Reviewer: local final review

Review target: 1.8 Real Project Read-only Adoption Trial and Patch Classification Governance changes

## Review Purpose

What should the reviewer focus on?

- target-project write leakage
- private target identity leakage
- production, release, security, privacy, compliance, migration, or payment overclaim
- patch classification being treated as implementation approval
- incomplete CLI/CI/manifest/docs/checker integration

What should the reviewer ignore?

- unrelated historical artifacts
- real production validation, which is explicitly out of scope

## Project State

Project root: `/Users/liushan/Developer/CodingFlow/ai-native-dev-kit`

Branch: main

Project state tags: source repo

Adoption mode: not applicable

Workflow next action: implementation review

Dirty worktree: Yes

Changed file count: multiple workflow assets

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/180-real-project-adoption-trial.md` | complete | user request |
| Preflight | `preflight/180-real-project-adoption-trial.md` | complete | scope/risk |
| Spec | `specs/180-real-project-adoption-trial.md` | complete | behavior |
| Eval | `evals/180-real-project-adoption-trial.md` | complete | checks |
| Task | `tasks/180-real-project-adoption-trial.md` | complete | L2 |
| Real adoption trial | `real-adoption-trials/180-governed-web-readonly.md` | complete | sanitized source evidence |
| Existing governance map | `governance-maps/180-governed-web-readonly.md` | complete | sanitized mapping |
| Patch classification | `patch-classifications/180-governed-web-repair-scale.md` | complete | source patch classification |
| Release evidence | `releases/1.8.0/release-record.md` | complete | bounded claims |

## Request Summary

Implement 1.8 from a sanitized real governed-project read-only trial, then add patch classification so Codex stops treating every repair as a small local patch.

## Spec / Scope Summary

Allowed scope:

- Real adoption trial assets, patch classification assets, checkers, examples, fixtures, release evidence, and references.

Forbidden scope:

- target project writes, private target identity, production validation, release approval, risk approval, or external GPT/API hook automation.

Non-goals:

- applying the bridge to a real target project.

## Acceptance Criteria

- Real adoption and patch classification checkers pass.
- Example passes.
- Bad fixtures fail as expected.
- Full dev-kit self-check passes.
- Claims remain bounded and sanitized.

## Risk Gate

Checked risk items:

- None.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Human accepted |
|---|---|---|
| production / release / security / privacy / compliance / migration / payment | terms are boundaries only, not implemented behavior | Yes |
| real project | source evidence is sanitized and read-only; no target write is implemented | Yes |

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by:

Approved at:

## Baseline State

Onboarding state: Not applicable

Engineering baseline checked: Not applicable

Engineering baseline ref: Not applicable

Engineering baseline gaps: None

Environment baseline checked: Not applicable

Environment baseline ref: Not applicable

Environment baseline gaps: None

Platform baseline state: Not applicable

Selected profiles: None

Industrial baseline state: Not applicable

Baseline level: `BL1_STANDARD`

Selected industrial packs: None

## Evidence

Commands run:

```text
node --check scripts/check-real-adoption-trial.mjs
node --check scripts/check-patch-classification.mjs
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly
node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/180-real-project-adoption-trial.md
node scripts/check-review-loop.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-next-step-boundary.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-dev-kit.mjs
git diff --check
```

Verification results:

- Passed.

Evidence refs:

- `releases/1.8.0/self-check-report.md`
- `final-reports/180-real-project-adoption-trial.md`

Skipped evidence and reason:

- target project writes: forbidden
- private target identity: not public approved

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `core/real-project-adoption-trial.md` | add | read-only adoption protocol | medium |
| `core/patch-classification.md` | add | patch scale governance | medium |
| `scripts/check-real-adoption-trial.mjs` | add | checker | medium |
| `scripts/check-patch-classification.mjs` | add | checker | medium |
| `examples/1.8-real-project-readonly/` | add | sanitized example | low |
| `dev-kit-manifest.json` | update | asset registry | medium |
| `scripts/check-dev-kit.mjs` | update | self-check integration | medium |

## Diff Summary

- Adds read-only real adoption and patch classification protocols.
- Adds sanitized source evidence and example evidence.
- Wires CLI, CI, manifest, docs, platform adapters, and self-check.
- Improves equivalent baseline detection for existing governed projects.

## Known Risks

- One real read-only trial is not broad production validation.
- Checkers can validate recorded evidence, not unrecorded private conversation.
- Future target-project bridge application still requires human approval.

## Open Questions

- Which other project types should receive future private read-only trials?

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
| sanitized real-project evidence is acceptable for public source release records | user asked to use the deployed-project result but public review advised anonymization | high | Yes | No | AI | CONFIRMED |

## Reviewer Checklist

- [ ] The implementation matches the request and spec.
- [ ] The change stays inside approved scope.
- [ ] Non-goals were not implemented accidentally.
- [ ] Risk Gate items match the actual touched areas.
- [ ] Patch classification does not authorize implementation.
