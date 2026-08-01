# Review Packet: 249-node-22-supported-runtime-boundary

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

This binding identifies the product-direction contract used to prepare this review input. It is not implementation, apply, release, or production approval.

## Decision Responsibility

Technical decision owner: Codex

Codex selects architecture, baseline, scope mechanics, risk treatment, verification strategy, review routing, release readiness, and technical recovery from project evidence.

Default user input class: NO_USER_ACTION

Bounded exceptions: BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION

Project fingerprint: `sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58`

Project revision: `sha256:c8f76fa98492d5e1052a40a7b73b81169a4be9c5ce8f18bcb1e883d75b9103c2`

Task ref: `tasks/249-node-22-supported-runtime-boundary.md`

Task digest: `sha256:c0e1275c5194d2df7e2409891d09e15cb6efceba991d96a642f806e560228209`

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-08-01

Reviewer: Codex read-only source and boundary review

Review target: `tasks/249-node-22-supported-runtime-boundary.md`

## Review Purpose

What should the reviewer focus on?

- Confirm that the declared package engine, public prerequisites, maintainer guidance, CI runtime and self-check all express one Node 22.x support boundary.
- Confirm that no Node 23 repair, checker refactor, adoption/apply behavior, target project, dependency, release or production surface entered the diff.

What should the reviewer ignore?

- Node 23 root-cause repair and the already completed Task 248 adoption implementation.

## Project State

Project root: `/private/tmp/intentos-source-only-adoption-hardening`

Branch: `codex/source-only-external-adoption-hardening`

Project state tags: IntentOS source repository; Task 249 bounded runtime-contract closeout

Adoption mode: source maintenance

Workflow next action: commit and push the verified feature branch, then safely fast-forward the default branch

Dirty worktree: Yes; exactly the staged Task 249 candidate

Changed file count: seven runtime contract/documentation/self-check files plus eleven Task 249 evidence files

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/249-node-22-supported-runtime-boundary.md` | READY | user selected Node 22 and default-branch closeout |
| Preflight | `preflight/249-node-22-supported-runtime-boundary.md` | READY | no missing input |
| Spec | `specs/249-node-22-supported-runtime-boundary.md` | READY | bounded compatibility contract |
| Eval | `evals/249-node-22-supported-runtime-boundary.md` | READY | all acceptance and verification checks are recorded as passing |
| Task | `tasks/249-node-22-supported-runtime-boundary.md` | READY | CB2 boundary |
| AI task log | `ai-logs/2026-08-01-node-22-supported-runtime-boundary.md` | READY | verification is complete; authorized Git closeout follows this snapshot |
| Release evidence | Not applicable | N/A | no tag or release action in Task 249 |

## Request Summary

- Correct the public and machine-readable open-ended `>=22` claim so it matches the Node 22 runtime already used by first-party CI and successful full verification.

## Spec / Scope Summary

Allowed scope:

- `package.json`, two READMEs, source-only/maintainer/contributor guidance, one self-check assertion, and Task 249 evidence

Forbidden scope:

- GitHub workflows, Node 23 internals, checker DAG, dependencies, adoption/apply/receipt behavior, target projects, release and production

Non-goals:

- no Node 23 compatibility claim or repair
- no default-branch merge until current evidence and the final Node 22 full check pass

## Acceptance Criteria

- Package engine is exactly `>=22 <23` and active entry docs state Node 22.x.
- Existing GitHub workflows remain on Node 22 and unchanged.
- Self-check rejects a drifted engine range.
- Current-task gates and one final Node 22.22.3 full source self-check pass before merge.

## Risk Gate

Checked risk items:

- None; this is a local source compatibility declaration and evidence change.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| Node 23 compatibility | explicitly outside Task 249; the change removes an unsupported claim instead of altering runtime behavior | Yes |

## Human Approval

Compatibility heading: this section records exact consent to a prepared real-world effect only.

Required: No

Status: Not Required

User input class: NO_USER_ACTION

Approval scope: exact prepared real-world effect only; it must not contain technical choices.

Prepared effect and safeguards: None within Task 249; the user separately authorized the later Git default-branch update after verification.

Approved by:

Approved at:

## Baseline State

Onboarding state: established source repository

Engineering baseline checked: Yes

Engineering baseline ref: `docs/engineering-baseline.md`; one bounded self-check assertion changes, with no architecture, schema, permissions, dependency or cross-module runtime behavior change

Engineering baseline gaps: None

Environment baseline checked: Yes

Environment baseline ref: `docs/environment-baseline.md`, first-party Node 22 workflows, and Task 248 Node 22.22.3 full-check evidence

Environment baseline gaps: Node 23 compatibility remains explicitly unsupported and outside this task

Platform baseline state: Node 22.x source verification

Selected profiles: Not applicable

Industrial baseline state: Not applicable

Baseline level: source repository environment boundary

Selected industrial packs: None

## Change Boundary Review

Change-boundary report: `change-boundary-reports/128-node-22-supported-runtime-boundary.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
Node 22.22.3: node --check scripts/self-check/foundation.mjs
Node 22.22.3: node --test tests/check-intentos-modularity.test.mjs
Node 22.22.3: node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/249-node-22-supported-runtime-boundary.md
Node 22.22.3: node scripts/check-manifest.mjs
Node 22.22.3: node scripts/check-change-boundary.mjs . --report change-boundary-reports/128-node-22-supported-runtime-boundary.md
git diff --cached --check
Node 22.22.3: node scripts/check-intentos.mjs
```

Verification results:

- Syntax, modularity 2/2, manifest, current-task artifact quality, review-loop, next-step, Guided Delivery, and Change Boundary 128: PASS.
- Cached diff: PASS after bounded evidence cleanup.
- Final full source self-check: PASS under Node 22.22.3 with `IntentOS self-check passed.` and no source/runtime FAIL.

Evidence refs:

- Change Boundary 128 and the exact staged file list.
- Task 248 Node 22 full-check and remote-clone external-project simulation.

Skipped evidence and reason:

- None; UI, release, production, and external runtime evidence are not applicable to this source-only compatibility declaration.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `package.json` | runtime contract | bound supported engine to Node 22.x | low |
| `README.md`, `README.zh-CN.md` | user documentation | align public prerequisite | low |
| `CONTRIBUTING.md`, `docs/for-maintainers.md`, `docs/source-only-adoption.md` | maintainer/adoption documentation | align formal verification guidance | low |
| `scripts/self-check/foundation.mjs` | self-check | enforce exact engine declaration | low |
| Task 249 evidence | governance/evidence | make the change reviewable and auditable | low |

## Diff Summary

- Replaces the open-ended `>=22` support claim with `>=22 <23` / Node 22.x.
- Leaves the already pinned Node 22 workflows unchanged.
- Adds no runtime wrapper, dependency or Node 23 workaround.

## Known Risks

- Node 23 remains unsupported for the full maintainer verification graph.
- The full source check remains slow, but its single final Node 22.22.3 run passed and no further rerun is required for this candidate.

## Open Questions

- None within the bounded source change.

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| Node 22 is the formal supported major | first-party workflows plus Task 248 Node 22.22.3 full pass | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] No real-world effect is prepared within Task 249.
- [x] Final full-check evidence is recorded under Node 22.22.3.
- [x] Engineering baseline is checked for the bounded self-check source change.
- [x] Environment baseline and Node 22 evidence are checked.
- [x] Baseline and compatibility gaps are explicit.
- [x] The only assumption is evidence-backed and recorded.
- [x] The staged Task 249 candidate is separated from earlier commits.
- [x] No secret, production-config, migration or release mechanics changed.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

`NEEDS_HUMAN_DECISION` is a compatibility outcome and may represent only BUSINESS_FACT_NEEDED, REAL_WORLD_CONSENT_NEEDED, or EXTERNAL_FACT_NEEDED.

User input class: NO_USER_ACTION

Findings:

- NO_ACTION: the bounded source change matches the requested Node 22 support boundary, all evidence-only findings are closed, and the final full source self-check passes.

Required follow-up:

- Commit and push this verified candidate, confirm the remote default branch remains an ancestor, then fast-forward and push `main` without force, tag, release, or production action.
