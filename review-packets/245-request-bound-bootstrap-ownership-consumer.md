# Review Packet: 245-request-bound-bootstrap-ownership-consumer

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

Project revision: `sha256:f809d282c9cfab1b10cb4b512d4d2e8aa8d6beeb1c11cb345bee5306d6d6a242`

Task ref: `tasks/245-request-bound-bootstrap-ownership-consumer.md`

Task digest: `sha256:00d4e832277f23de572c0942f15a5b3625511036fbbcd0d2ef527148546b6b43`

## Packet Status

Status: READY

Prepared by: Codex

Prepared at: 2026-08-01

Reviewer:

Review target: `tasks/245-request-bound-bootstrap-ownership-consumer.md`

## Review Purpose

What should the reviewer focus on?

- Verify the shared verifier independently rechecks target/version/receipt/plan
  evidence and that request-bound authority requires exact action ownership.

What should the reviewer ignore?

- Pawcode apply execution, product/UI work, and broader authority redesign.

## Project State

Project root: `/private/tmp/intentos-source-only-adoption-hardening`

Branch: `codex/source-only-external-adoption-hardening`

Project state tags: IntentOS source repository; Task 245 candidate only

Adoption mode: source maintenance

Workflow next action: create the bounded local Task 245 commit

Dirty worktree: Yes

Changed file count: four source/test files plus Task 245 evidence

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/245-request-bound-bootstrap-ownership-consumer.md` | READY | real apply-preflight blocker |
| Preflight | `preflight/245-request-bound-bootstrap-ownership-consumer.md` | READY | no missing input |
| Spec | `specs/245-request-bound-bootstrap-ownership-consumer.md` | READY | shared exact verifier |
| Eval | `evals/245-request-bound-bootstrap-ownership-consumer.md` | READY | positive and fail-closed cases |
| Task | `tasks/245-request-bound-bootstrap-ownership-consumer.md` | READY | CB2 boundary |
| AI task log | `ai-logs/2026-08-01-request-bound-bootstrap-ownership-consumer.md` | CURRENT | task evidence |
| Release evidence | Not applicable | N/A | no release effect |

## Request Summary

- Close the consumer gap that rejects planner-proven bootstrap ownership before apply.

## Spec / Scope Summary

Allowed scope:

- shared bootstrap verifier, planner reuse, request-bound consumer, focused tests

Forbidden scope:

- Pawcode apply, authority widening, schemas, dependencies, CI/hooks, release, business code

Non-goals:

- no inferred ownership and no second ownership state

## Acceptance Criteria

- exact bootstrap evidence is independently recomputed and action ownership must match
- forged/missing ownership, edits, duplicates, drift, and unmanaged files fail closed
- exact Pawcode plan graph has zero errors and zero dirty overlap

## Risk Gate

Checked risk items:

- None checked; internal write authority is handled as L2 technical trust review.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| permission / authority | internal project-local write authority only | Yes |
| apply / rollback | target execution excluded; source rollback is commit revert | Yes |

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

Engineering baseline ref: `docs/engineering-baseline.md`

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

Change-boundary report: `change-boundary-reports/124-request-bound-bootstrap-ownership-consumer.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
node --test tests/request-bound-apply-authority.test.mjs tests/project-entry-new-project-transaction.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
read-only Pawcode dry-run and request-bound graph validation
```

Verification results:

- Focused tests: PASS 36/36.
- Project-entry suite: PASS 113/113.
- Pawcode: 0 ownership conflicts, 0 authority graph errors, 0 dirty overlaps.
- Full source self-check: PASS (`IntentOS self-check passed.`, exit 0).

Evidence refs:

- Task 245 spec/eval/task and change-boundary report.
- Pawcode bootstrap receipt action A-764 consumed by plan action A-754.

Skipped evidence and reason:

- None.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/lib/bootstrap-transaction.mjs` | implementation | shared exact verifier | medium |
| `scripts/init-project/plan.mjs` | refactor | reuse shared verifier | low |
| `scripts/lib/request-bound-apply-authority.mjs` | implementation | independently consume verifier | medium |
| `tests/request-bound-apply-authority.test.mjs` | tests | positive and fail-closed regressions | low |
| Task 245 evidence | governance | bounded workflow evidence | low |

## Diff Summary

- Moves the Task 244 exact proof into the existing bootstrap trust module.
- Requires current target digest and exact action ownership equality downstream.

## Known Risks

- The shared verifier remains local project evidence, not external signature;
  strict receipt, plan, root, action, and current-file bindings remain mandatory.

## Open Questions

- None.

## Assumption Register

Use this section when review conclusions depend on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| Pawcode A-754 is the same bootstrap-created file | exact plan/receipt id, path, type, state, and hashes | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

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

- No blocking finding in the shared-verifier and consumer trust boundary.

Required follow-up:

- Create the bounded local Task 245 commit.
