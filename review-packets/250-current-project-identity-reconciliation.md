# Review Packet: 250-current-project-identity-reconciliation

This packet is a read-only review input. It grants no implementation, apply,
release, production, or target-write authority.

## Current Review Context Binding

Contract ID: `ZERO_EXPERIENCE_SOLO_DEVELOPER`

Context version: `1.113.0`

Context digest: `sha256:bdc16d1aa0bdc231d5b5d1cd339a65f94560a3d38f89c64af4adee4c74a67d81`

## Decision Responsibility

Technical decision owner: Codex

Default user input class: NO_USER_ACTION

Bounded exceptions: BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

## Review Input Identity

Lifecycle: CURRENT_IMPLEMENTATION

Project fingerprint: `sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58`

Project revision: `sha256:e2f2e0febff3a1438149b73d53792418c5ed82bd7599c7bc4abaa770ab7e4db5`

Task ref: `tasks/250-current-project-identity-reconciliation.md`

Task digest: `sha256:23a05d71dd342cdd3e898e5ecf444a484f7f437da2590548b4cbf2d86400dddb`

## Packet Status

Status: READY_FOR_REVIEW

Prepared by: Codex

Prepared at: 2026-08-02

Reviewer: Codex read-only source, boundary, and external-snapshot review

Review target: `tasks/250-current-project-identity-reconciliation.md`

## Review Purpose

What should the reviewer focus on?

- Confirm that historical origin and current project identity have separate,
  explicit responsibilities.
- Confirm that the content observation excludes IntentOS-managed assets and
  workflow-record roots without exposing target paths publicly.
- Confirm that a new scaffold stays new, Pawcode becomes existing, and dirty
  work remains fail-closed and read-only.
- Confirm that project-information status does not start current-task
  completion processing and that current-task status still does when one
  current Work Queue item exists.

What should the reviewer ignore?

- Apply, receipt, ownership, CI, release, production, dependency, and Pawcode
  product changes, all of which are outside Task 250.

## Project State

Project root: `/Users/liushan/Developer/CodingFlow/ai-native-dev-kit`

Branch: `main`

Project state tags: IntentOS source repository; bounded Task 250 candidate

Adoption mode: source maintenance

Workflow next action: report the verified local candidate; do not commit or
push without a separate user instruction

Dirty worktree: Yes; the exact Task 250 candidate plus independently governed
Task 251 test-harness repair

Changed file count: 28 aggregate paths: 19 Task 250 paths plus 9 Task 251 and
aggregate-boundary paths

## Source Artifacts

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Request | `requests/250-current-project-identity-reconciliation.md` | READY | user-authorized IntentOS repair |
| Preflight | `preflight/250-current-project-identity-reconciliation.md` | READY | root cause and stop conditions |
| Spec | `specs/250-current-project-identity-reconciliation.md` | COMPLETE | additive current-fact contract implemented |
| Eval | `evals/250-current-project-identity-reconciliation.md` | VERIFIED | all required checks complete |
| Task | `tasks/250-current-project-identity-reconciliation.md` | COMPLETE | L2 / CB2 |
| AI task log | `ai-logs/2026-08-02-current-project-identity-reconciliation.md` | CLOSED | verified local closeout |
| Companion Task | `tasks/251-verification-runtime-interruption-test-readiness.md` | COMPLETE | independent L1 test-harness readiness repair |
| Release evidence | Not applicable | NOT_APPLICABLE | no release action |

## Request Summary

- Correct the public identity contradiction found during a zero-write Pawcode
  validation without writing to Pawcode or widening into apply behavior.

## Spec / Scope Summary

Allowed scope:

- current project-content fact, authoritative source-manifest handoff, entry
  reconciliation, additive provenance fields, status-scope source selection,
  focused tests, concise docs, and Task 250 evidence.

Forbidden scope:

- target writes, apply/receipt/ownership, dependencies, hosted CI, release,
  production, or unrelated refactoring.

Non-goals:

- no persistent maturity migration and no intent-wording identity heuristic.

## Acceptance Criteria

- Scaffold-only remains new; project-owned content produces an existing current
  identity while origin stays `NEW_PROJECT`.
- Workflow evidence creation leaves source-only Project Fact identity stable;
  genuine project content still invalidates it.
- Project-information and missing-current-task status omit the task delivery
  console; an identified current-task status retains it.
- Dirty-worktree safe stop and no-write boundaries remain unchanged.
- Generated distribution, trust, consumer-chain, Manifest, Pawcode snapshot,
  and final source verification pass.

## Risk Gate

Checked risk items:

- Performance: remove an unnecessary current-task evidence traversal from the
  project-information identity view without weakening any strict task gate.

Risk Gate Exclusions:

| Mentioned term | Why excluded | Codex evidence supports exclusion |
|---|---|---|
| target write | explicitly forbidden and snapshot-checked | Yes |
| release / production | authority boundary only; no such files or actions | Yes |

## Human Approval

Required: No

Status: Not Required

User input class: NO_USER_ACTION

Approval scope: Not Required

Prepared effect and safeguards: local IntentOS source edit and read-only target inspection only

Approved by: Not applicable

Approved at: Not applicable

## Baseline State

Onboarding state: established IntentOS source repository

Engineering baseline checked: Yes

Engineering baseline ref: `docs/engineering-baseline.md`

Engineering baseline gaps: None

Environment baseline checked: Not applicable

Environment baseline ref: Not applicable

Environment baseline gaps: None

Platform baseline state: Not applicable

Selected profiles: Not applicable

Industrial baseline state: Not applicable

Baseline level: source identity contract

Selected industrial packs: None

## Change Boundary Review

Task-local change-boundary report: `change-boundary-reports/129-current-project-identity-reconciliation.md`

Exact aggregate candidate report: `change-boundary-reports/130-task-250-251-combined-candidate.md`

Actual changed files checked against approved boundary: Yes

Forbidden paths changed: No

Out-of-scope changes require: None

## Baseline State Review

Baseline-state report: Not required

Proposed or evidence-required baselines treated as confirmed: No

## Evidence

Commands run:

```text
Node 22 syntax checks for the three changed modules
Node 22 focused operating identity tests: 5/5 PASS
Node 22 Project Entry trust tests: 7/7 PASS
Node 22 Project Entry consumer chain: 15/15 PASS
Node 22 generated-project distribution and cold-start tests: PASS
Node 22 Manifest check: PASS
Task 250 workflow artifact ready check: PASS
First final source self-check: stopped on Operating Model source-identity timeout
Focused source-identity replay after repair: PASS within the existing timeout
Complete Operating Model suite after repair: PASS 45/45
Associated-process residual check after focused and complete replay: none
Second final source self-check: passed Task 250 identity and 1.113 evidence-chain checks, then stopped at an unrelated runtime-lifecycle test readiness race
Task 251 exact interruption regression: PASS 1/1
Task 251 complete runtime-lifecycle module: PASS 22/22; no new temp roots or residual processes
Final repository-wide Node 22 source self-check: PASS, exit 0; IntentOS self-check passed
The same final source run passed Task 250 Operating Model/current-decision checks, the current 1.113 governance/evidence chain, and Task 251 runtime-lifecycle regressions
Exact-candidate Pawcode read-only replay: PASS; HEAD, project fingerprint, project revision, 240-entry status digest/count, and index digest remained identical
```

Verification results:

- All focused behavior, routing, and distribution checks pass.
- Fresh scaffold remains `NEW_PROJECT`; Pawcode becomes `EXISTING_PROJECT`,
  remains `DIRTY`, and routes to `REVIEW_CURRENT_WORK`.
- The first final source check exposed an in-scope routing defect: a
  `PROJECT_INFORMATION` request started `USER_DELIVERY_CONSOLE`, traversed
  historical completion evidence, and hit the 180-second child timeout.
- After source selection was bound to the existing status scope, the exact
  source identity case passed in focused runs and the complete Operating Model
  suite passed 45/45 in about 5 minutes 53 seconds.
- A second repository-wide check progressed through Task 250's regression,
  Project Identity Projection, and the 1.113 governance/evidence chain before
  stopping at an unrelated lifecycle-test race: the fixed abort could run
  before the descendant PID fixture became ready.
- Independent Task 251 added a bounded readiness handshake and exact fixture
  cleanup only in the test file. Its exact regression passes 1/1, the complete
  lifecycle module passes 22/22, the historical 963-root inventory remains
  unchanged, and no related process remains.
- The final repository-wide source self-check exited 0 with `IntentOS
  self-check passed.` In the same run, Task 250's Operating Model and current
  decision contract, the current 1.113 governance/evidence chain, and Task
  251's lifecycle regressions all passed.
- The exact-candidate Pawcode run remained read-only and returned
  `EXISTING_PROJECT`, `VERIFIED_ACTIVE`, `DIRTY`, and
  `NEEDS_CURRENT_WORK_REVIEW`. All six immutable comparison fields remained
  identical across the 240-entry target status snapshot.
- Pawcode's safe stop is expected: the target has no canonical current-task /
  durable Work Queue takeover binding. Task execution was not claimed.

Evidence refs:

- Task 250 eval, Change Boundary 129, independent Task 251 evidence, aggregate
  Change Boundary 130, exact current Git diff, final source self-check, and
  Pawcode before/after immutable snapshots.

Skipped evidence and reason:

- UI, apply, release, and production evidence are not applicable.

## Files Changed

| File | Change type | Why changed | Risk |
|---|---|---|---|
| `scripts/lib/project-fact-projection.mjs` | current fact | distinguish managed/workflow records from project content | medium |
| `scripts/lib/project-entry-trust.mjs` | source authority handoff | provide authoritative workflow roots in source-only operation | low |
| `scripts/operating-loop/classification.mjs` | identity classification | reconcile current entry while preserving origin | medium |
| `scripts/operating-loop/identity.mjs` | public contract | expose provenance role and content state additively | medium |
| `scripts/operating-loop/source-orchestration.mjs` | status source routing | keep project information outside current-task completion processing | medium |
| `scripts/resolve-operating-loop.mjs` | data flow | pass origin to identity projection | low |
| `tests/operating-model.test.mjs` | regression | cover scaffold, established, status scope, dirty, and wording cases | low |
| `docs/operating-model.md` | documentation | define provenance/current and status-scope semantics | low |
| Task 250 evidence | governance | reviewable boundary and results | low |
| `tests/verification-runtime-lifecycle.test.mjs` | independent Task 251 test harness | wait for the fixture-owned PID before abort and remove only run-owned test roots | low |
| Task 251 evidence and aggregate boundary | independent governance | preserve separate authority while checking the exact combined candidate | low |

## Diff Summary

- Adds one bounded counts-and-digest-only project content fact.
- Keeps generated workflow-record counts outside the identity-bound fact and
  resolves source-only workflow roots from the authoritative Manifest.
- Uses the fact only for a new-origin bootstrapped project's current entry.
- Makes source selection honor the existing `PROJECT_INFORMATION` versus
  `CURRENT_TASK` contract without a source-repository special case.
- Keeps existing-project, source checkout, operation, safe-stop, exit, and
  authority behavior unchanged.

## Known Risks

- Current identity depends on an installed or authoritative source Manifest's
  workflow directory inventory; when installed version metadata exists and
  neither authority is readable, the fact yields `NOT_OBSERVED` rather than
  inferring content.
- Pawcode intentionally remains dirty with 240 existing status entries and no
  canonical current-task binding; the correct result is the read-only
  `REVIEW_CURRENT_WORK` safe stop.
- The recorded inventory of 963 historical runtime temporary roots remains;
  Task 251 added none, and bulk cleanup is outside this candidate.
- No commit or push is authorized in this task turn.

## Open Questions

- None within Task 250.

## Assumption Register

| Assumption | Evidence | Confidence | Can proceed? | User input class | Owner | Status |
|---|---|---|---|---|---|---|
| Installed workflow roots are the authority for workflow-record exclusion | current installed manifest and generated-project tests | high | Yes | NO_USER_ACTION | Codex | CONFIRMED |

## Reviewer Checklist

- [x] The implementation matches the request and spec.
- [x] The change stays inside approved scope.
- [x] Non-goals were not implemented.
- [x] Risk Gate matches the touched areas.
- [x] No real-world consent is required.
- [x] Focused verification is sufficient before the final source check.
- [x] Engineering baseline was checked.
- [x] Environment baseline is not applicable.
- [x] No baseline or industrial evidence gap is hidden.
- [x] Assumptions are explicit.
- [x] Dirty work is separated and protected.
- [x] No secret, production, migration, or release mechanic changed.
- [x] Known risks and open questions are explicit.

## Review Outcome

Decision: APPROVE

User input class: NO_USER_ACTION

Findings:

- The first final check found one in-scope status-source coupling; it is fixed
  and the complete Operating Model suite now passes 45/45.

Required follow-up:

- Report the verified local candidate and await a separate Git closeout
  instruction; do not rerun the full self-check or write to Pawcode.
