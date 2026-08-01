# Review Packet: 246-dirty-worktree-controlled-activation

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

Project revision: `sha256:dfdf421f13c30ff54627e505d162e80ee1dccde87ff55ad84a34ebed85ba677f`

Task ref: `tasks/246-dirty-worktree-controlled-activation.md`

Task digest: `sha256:3cf6be54f0bb9ee288f1235c992abd2daffcbf41d9a74d5130d32608f505c60f`

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-08-01

Reviewer: Codex

Review target: `tasks/246-dirty-worktree-controlled-activation.md`

## Review Purpose

What should the reviewer focus on?

- Verify that dirty activation is derived from an exact, complete, zero-overlap controlled-update plan and fails closed otherwise.

What should the reviewer ignore?

- Pawcode apply execution, workflow-next state redesign, and broader authority changes.

## Project State

Project root: `/private/tmp/intentos-source-only-adoption-hardening`

Branch: `codex/source-only-external-adoption-hardening`

Project state tags: IntentOS source repository; Task 246 candidate only

Adoption mode: source maintenance

Workflow next action: create the local Task 246 commit

Dirty worktree: Yes

Changed file count: two source/test files plus Task 246 evidence

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/246-dirty-worktree-controlled-activation.md` | READY | real activation rollback blocker |
| Preflight | `preflight/246-dirty-worktree-controlled-activation.md` | READY | no missing input |
| Spec | `specs/246-dirty-worktree-controlled-activation.md` | READY | exact zero-overlap contract |
| Eval | `evals/246-dirty-worktree-controlled-activation.md` | READY | positive and fail-closed cases |
| Task | `tasks/246-dirty-worktree-controlled-activation.md` | READY | CB2 boundary |
| AI task log | `ai-logs/2026-08-01-dirty-worktree-controlled-activation.md` | CURRENT | task evidence |
| Release evidence | Not applicable | N/A | no release effect |

## Request Summary

- Recognize the expected dirty routing only when one exact controlled plan proves the dirty work is preserved.

## Spec / Scope Summary

Allowed scope:

- existing activation predicate, existing trust test, and Task 246 evidence

Forbidden scope:

- Pawcode apply, state redesign, authority artifacts, schemas, dependencies, CI/hooks, release, and business code

Non-goals:

- no general dirty-state acceptance and no second authority source

## Acceptance Criteria

- controlled workflow update, complete dirty fingerprint, safe executable paths, zero conflicts, and zero overlap are all mandatory

## Risk Gate

Checked risk items:

- None checked; internal activation trust is handled as L2 technical review.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| authority / activation | internal project-local execution trust only | Yes |
| apply / rollback | target execution excluded; failed v2 receipt proves rollback | Yes |

## Human Approval

Compatibility heading: this section records exact consent to a prepared real-world effect only.

Required: No

Status: Not Required

User input class: NO_USER_ACTION

Approval scope: Not required

Prepared effect and safeguards: None; source-only local code and evidence

Approved by:

Approved at:

## Baseline State

Onboarding state: source repository established

Engineering baseline checked: Yes

Engineering baseline ref: source repository self-check contract

Engineering baseline gaps: None

Environment baseline checked: Not applicable

Environment baseline ref: Not applicable

Environment baseline gaps: None

Platform baseline state: source self-check boundary

Selected profiles: Not applicable

Industrial baseline state: Not applicable

Baseline level: source repository baseline

Selected industrial packs: None

## Change Boundary Review

Change-boundary report: `change-boundary-reports/125-dirty-worktree-controlled-activation.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
node --test --test-name-pattern='dirty-worktree activation|deferred agent authority' tests/execution-distribution-trust.test.mjs
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
read-only real Pawcode v2 plan predicate
```

Verification results:

- Focused tests: PASS 2/2.
- Execution/distribution suite: PASS 72/72.
- Project-entry suite: PASS 113/113.
- Pawcode v2: activation eligible, 0 ownership conflicts, 0 dirty overlaps.
- Full source self-check: PASS, exit 0 with `IntentOS self-check passed.`

Evidence refs:

- Pawcode failed receipt proves `APPLY_FAILED_ROLLED_BACK` and zero changed actions.
- Task 246 spec/eval/task and change-boundary report.

Skipped evidence and reason:

- None.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/lib/adoption-apply-chain.mjs` | implementation | exact dirty-plan predicate | medium |
| `tests/execution-distribution-trust.test.mjs` | tests | positive and fail-closed regressions | low |
| Task 246 evidence files | governance | bounded workflow evidence | low |

## Diff Summary

- Adds one narrow `REVIEW_DIRTY_WORKTREE` branch behind exact plan proof.
- Keeps all existing ready and pending-state behavior unchanged.

## Known Risks

- Git short-status parsing intentionally rejects quoted or backslash paths; such plans stay blocked rather than being guessed.

## Open Questions

- None.

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| Pawcode v2 dirty fingerprint is the exact pre-apply state | plan digest and verified rollback receipt | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] Exact real-world consent is present when the prepared external effect requires it.
- [x] Verification evidence is enough for the stated risk.
- [x] Engineering baseline is checked when structure, contracts, schema, permissions, migrations, dependencies, or cross-module state changed.
- [x] Environment baseline is checked when build, CI, environment variables, deployment, production config, release, rollback, secrets, logs, monitoring, or alerts changed.
- [x] Baseline or industrial evidence gaps are called out.
- [x] Inferred facts are recorded in Assumption Register and are not treated as approved baseline rules.
- [x] Dirty worktree or pre-existing changes are separated from this task.
- [x] Codex selected and verified secret, production-config, migration, and release mechanics; exact consent exists for any prepared real-world effect.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

`NEEDS_HUMAN_DECISION` is a compatibility outcome and may represent only BUSINESS_FACT_NEEDED, REAL_WORLD_CONSENT_NEEDED, or EXTERNAL_FACT_NEEDED.

User input class: NO_USER_ACTION

Findings:

- No blocking finding in the exact dirty-plan activation boundary.

Required follow-up:

- Create the local Task 246 commit.
