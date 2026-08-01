# Review Packet: 248-verified-prior-apply-dirty-overlap

Use this file when a completed or in-progress change needs a stable review input for a human reviewer, GPT Pro, a second model, or another review process.

This packet does not approve the change. It packages context, evidence, known risks, and open questions so a reviewer can inspect the work without reconstructing the whole conversation.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

This binding identifies the product-direction contract used to prepare this review input. It is not implementation, apply, release, or production approval.

## Decision Responsibility

Technical decision owner: Codex

Default user input class: NO_USER_ACTION

Bounded exceptions: BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION

Project fingerprint: `sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58`

Project revision: `sha256:c08c14953cd0ecd92519195879248389d3b0d7854f78117bb64c5fad8b37d4ba`

Task ref: `tasks/248-verified-prior-apply-dirty-overlap.md`

Task digest: `sha256:48c1d67c0d298015218eb819648f9775278db15f855e8caeeafd89d620e026e5`

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-08-01

Reviewer: Codex read-only source review

Review target: `tasks/248-verified-prior-apply-dirty-overlap.md`

## Review Purpose

What should the reviewer focus on?

- Verify that consecutive dirty controlled updates accept only an exact, canonical, receipt/plan/action/hash-bound prior-transaction overlap.
- Verify that unproved business changes, directory overlap, stale hashes, malformed statuses, unsupported actions, and re-digested plan tampering fail closed.

What should the reviewer ignore?

- Pawcode execution, general dirty merging, schema/state redesign, and checker-performance refactoring.

## Project State

Project root: `/private/tmp/intentos-source-only-adoption-hardening`

Branch: `codex/source-only-external-adoption-hardening`

Project state tags: IntentOS source repository; Task 248 candidate; five earlier source-only hardening commits remain separate

Adoption mode: source maintenance

Workflow next action: user review of the staged candidate; no commit or push

Dirty worktree: Yes

Changed file count: four implementation/test files plus eleven Task 248 governance/evidence files

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/248-verified-prior-apply-dirty-overlap.md` | READY | real consecutive-update blocker |
| Preflight | `preflight/248-verified-prior-apply-dirty-overlap.md` | READY | no missing input |
| Spec | `specs/248-verified-prior-apply-dirty-overlap.md` | READY | exact proof contract |
| Eval | `evals/248-verified-prior-apply-dirty-overlap.md` | READY | all required checks passed |
| Task | `tasks/248-verified-prior-apply-dirty-overlap.md` | READY | CB2 boundary |
| AI task log | `ai-logs/2026-08-01-verified-prior-apply-dirty-overlap.md` | COMPLETE | bounded task closed |
| Release evidence | Not applicable | N/A | no release effect |

## Request Summary

- Let a second controlled workflow update recognize only the exact current file bytes written by the last still-valid transaction, while preserving all project-owned dirty work.

## Spec / Scope Summary

Allowed scope:

- plan fingerprint proof generation, dirty activation validation, focused regressions, and Task 248 evidence

Forbidden scope:

- Pawcode writes, business code, schema/state/authority redesign, dependencies, CI/hooks, release, production, or external actions

Non-goals:

- no general dirty merge, path allowlist, directory overlap, or older-plan compatibility bypass

## Acceptance Criteria

- Exact prior receipt/plan/action/hash evidence authorizes only the computed dirty/write file intersection.
- Two controlled updates succeed in a generated external project while dirty business bytes remain unchanged.
- Re-digested proof tampering and every unproved or inexact overlap fail before mutation.

## Risk Gate

Checked risk items:

- None; this is local source validation with no real-world effect.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| apply / receipt | request-bound local evidence validation only; authority and schemas unchanged | Yes |
| dirty worktree | exact path classification only; no merge or project-content write authority | Yes |

## Human Approval

Compatibility heading: this section records exact consent to a prepared real-world effect only.

Required: No

Status: Not Required

User input class: NO_USER_ACTION

Approval scope: Not required

Prepared effect and safeguards: None; source/test/evidence files only

Approved by:

Approved at:

## Baseline State

Onboarding state: established source repository

Engineering baseline checked: Yes

Engineering baseline ref: `docs/engineering-baseline.md` and the source repository controlled-apply/full-self-check contract

Engineering baseline gaps: None identified

Environment baseline checked: Not applicable

Environment baseline ref: `docs/environment-baseline.md` reviewed; no environment surface changed

Environment baseline gaps: None

Platform baseline state: source self-check boundary

Selected profiles: Not applicable

Industrial baseline state: Not applicable

Baseline level: source repository baseline

Selected industrial packs: None

## Change Boundary Review

Change-boundary report: `change-boundary-reports/127-verified-prior-apply-dirty-overlap.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
node --check <four changed source/test files>
node --test --test-name-pattern='dirty generated project preserves business work' tests/project-entry-generated-parity.test.mjs
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
Node 22.22.3: node scripts/check-intentos.mjs
git diff --check
read-only strict Pawcode v3 receipt and stale v4 inspection
```

Verification results:

- Syntax and diff checks: PASS.
- Consecutive-update integration, including re-digested proof tampering: PASS 1/1 in 39.4 seconds.
- Execution/distribution suite: PASS 72/72 in 172.0 seconds.
- Project Entry suite after the final test change: PASS 114/114 in 382.2 seconds.
- Pawcode v3 receipt: strict validator PASS; `.intentos/version.json` is receipt-applied and current.
- Pawcode v4: proof is absent, only two managed writes plus receipt, no business path; it remains stale and unexecuted.
- Full source self-check: PASS under Node 22.22.3 with final output `IntentOS self-check passed.`
- Node 23.11.0 diagnostic: the first full-check attempt reached process exit but deadlocked while joining a V8 worker; it emitted no candidate FAIL and was terminated. The same leaf completed under Node 22, which then completed the full self-check.

Evidence refs:

- Task 248 integration/unit tests, Pawcode v3 receipt, v3 plan, and stale v4 plan.

Skipped evidence and reason:

- Fresh Pawcode planning/apply is intentionally outside Task 248 and requires a new post-validation plan.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/init-project/plan.mjs` | implementation | derive canonical prior-apply overlap proof | medium |
| `scripts/lib/adoption-apply-chain.mjs` | implementation | validate exact dirty/write overlap | medium |
| `tests/execution-distribution-trust.test.mjs` | test | fail-closed unit matrix | low |
| `tests/project-entry-generated-parity.test.mjs` | test | consecutive external-project and tamper regression | low |
| Task 248 workflow evidence | governance/evidence | review and audit trail | low |

## Diff Summary

- Replaces zero-overlap-only activation with zero overlap or one exact verified prior-transaction overlap.
- Builds proof only from the newest strictly valid receipt and its digest-valid plan.
- Requires the prior receipt hash, current file hash, current action preimage, and managed ownership digest to agree.
- Adds positive, negative, end-to-end preservation, and re-digested tamper coverage.

## Known Risks

- Task 248 proves behavior in a generated external project; it deliberately does not generate or execute a fresh Pawcode plan.
- The full checker graph repeats expensive upstream checks, and Node 23.11.0 exposed a V8 shutdown deadlock during that graph. Node 22.22.3 completed successfully. Checker DAG/runtime hardening remains separate performance and compatibility debt, not a Task 248 correctness change.

## Open Questions

- None within Task 248 scope.

## Assumption Register

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| Pawcode v4 is stale and cannot be reused | it lacks `verifiedPriorApplyOverlap` and the repaired source canonical rebuild would differ | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented accidentally.
- [x] Risk Gate items match the actual touched areas.
- [x] Exact real-world consent is present when the prepared external effect requires it.
- [x] Final verification evidence is enough for the stated risk; the full source self-check passed.
- [x] Engineering baseline is checked where the cross-module plan contract changed.
- [x] Environment baseline is not overclaimed.
- [x] Baseline or industrial evidence gaps are called out.
- [x] Inferred facts are recorded and not treated as baseline authority.
- [x] Dirty worktree and pre-existing commits are separated from this task.
- [x] No secret, production-config, migration, or release effect is prepared.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

User input class: NO_USER_ACTION

Findings:

- NO_ACTION: the exact proof model and canonical rebuild remain fail-closed under the reviewed positive and negative paths.

Required follow-up:

- Complete the full source self-check and final evidence/cached-diff closeout.
