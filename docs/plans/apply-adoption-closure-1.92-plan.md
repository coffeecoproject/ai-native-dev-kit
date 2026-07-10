# Apply & Adoption Closure 1.92 Execution And Acceptance Plan

## 1. Purpose

IntentOS 1.90 and 1.91 established execution and evidence authority. They do
not yet prove that an approved existing-project adoption plan was replayed
exactly, that only approved paths changed, or that the resulting project will
continue to enter IntentOS behavior on the next Codex task.

1.92 closes that gap for the existing low-risk IntentOS init/update apply path:

```text
immutable execution plan
-> exact human approval
-> controlled apply readiness
-> action-by-action replay
-> apply receipt
-> post-apply target digest
-> behavior activation proof
-> adoption assurance
```

After the user accepts the professional recommendation, Codex may perform the
bounded low-risk IntentOS governance apply and must prove what happened. The
user must not need to inspect action graphs or compare files manually.

## 2. Non-Goals

1.92 does not:

- execute business-code changes;
- modify hooks, CI, release, production, secrets, data migrations, payment,
  security, privacy, compliance, legal, or industrial-pack decisions;
- treat a receipt as product correctness or release/production approval;
- infer approval from conversation text;
- permit actions absent from the approved execution graph;
- make projects claim full adoption merely because files were copied;
- replace project-owned engineering, environment, release, runtime, data,
  permission, or business authority.

## 3. Authority Model

### 3.1 Source Of Execution Truth

The exact execution plan JSON produced by `init-project --write-plan` is the
only action graph the controlled init/update path may execute. The runner must
not regenerate actions from command arguments after approval or call the broad
init/update copier as a substitute for replay.

### 3.2 Approval

The Approval Record binds the plan path and digest, exact action IDs and target
paths, a specific human approver, expiry, rollback acknowledgement,
verification acknowledgement, and exclusion of high-risk actions.

### 3.3 Readiness

Apply must consume a structured Controlled Apply Readiness Report matching the
same plan digest, action IDs, and paths. Missing, stale, unrelated, human-only,
blocked, or non-matching readiness evidence is rejected.

### 3.4 Receipt

The Apply Receipt is generated from observed execution facts, not authored as
a Codex claim. It records project and Git identity, plan/approval/readiness
identity, action results, before/after hashes, unexpected paths, verification,
activation, rollback evidence, and final state.

## 4. Execution Scope

The runner supports only bounded IntentOS governance actions emitted by the
init/update execution planner:

- create or update a file from an exact IntentOS source path;
- create an exact workflow-directory marker;
- write an exact plan-bound IntentOS version record;
- write an exact plan-bound governance migration report;
- append an exact plan-bound AGENTS or PR-template payload when explicitly
  included and approved;
- skip an existing target without writing.

Unsupported, high-risk, wildcard, traversal, absolute, symlinked, or unbound
actions fail before the first target write.

## 5. Plan Hardening

Every write-capable action must contain immutable replay data:

- stable action ID and exact relative target path;
- action type and execution classification;
- `hashBefore`, including `null` for an absent target;
- exact source path and source hash, or exact generated content;
- expected target hash after apply;
- backup requirement.

The plan also binds IntentOS version, manifest digest, project-root identity,
Git repository identity/branch/HEAD/scoped dirty state, receipt path, and the
canonical plan digest. Any bound input change invalidates apply before writing.

## 6. Apply Receipt Model

Add:

- `core/apply-execution-receipt.md`
- `docs/apply-execution-receipt.md`
- `templates/apply-execution-receipt.md`
- `schemas/artifacts/apply-execution-receipt.schema.json`
- `scripts/check-apply-execution-receipt.mjs`
- `apply-receipts/`

Receipt states:

- `APPLY_VERIFIED`
- `APPLY_PARTIAL_ROLLBACK_REQUIRED`
- `APPLY_FAILED_NO_WRITE`
- `APPLY_FAILED_ROLLED_BACK`
- `ACTIVATION_NOT_VERIFIED`

Only `APPLY_VERIFIED` supports applied-adoption evidence. It does not authorize
release or production.

## 7. Behavior Activation Proof

After target writes, the runner performs a read-only activation check:

- `.intentos/version.json` exists and matches the applied version;
- the installed `workflow-next` entry executes successfully;
- target project identity still matches;
- no path outside approved targets and receipt path changed during apply;
- the result contains a recognized project state and next action;
- the activation check performs no additional writes.

This proves the installed workflow can be entered. It does not prove product
correctness or full adoption while project-owned surfaces remain pending.

## 8. Adoption Assurance Integration

`VERIFIED_ACTIVE` requires a valid project-bound Apply Receipt whenever the
claim depends on target writes. Assurance rejects receipts copied from another
project, bound to another plan/action set, stale after target changes, missing
activation proof, or containing unexpected paths.

Read-only and adapter-only adoption remains valid without a receipt when it is
explicitly partial and claims no target writes.

## 9. Failure And Rollback Rules

The complete graph is validated before the first write. During replay:

1. write one approved action;
2. verify its resulting hash immediately;
3. stop at the first mismatch;
4. restore already-written targets or remove newly created targets;
5. verify rollback hashes;
6. write failure evidence only to the bound receipt path;
7. never continue after a mismatch.

Unverified rollback produces `APPLY_PARTIAL_ROLLBACK_REQUIRED` and requires a
project owner.

## 10. User Experience

The public entry remains natural language. The user receives a professional
recommendation, one meaningful approval request when needed, the expected
effect and main risk, and a plain final result. The user is not asked to select
checkers, calculate digests, compare action IDs, or read internal evidence.

## 11. Implementation Work Packages

### WP1 - Execution Plan Integrity

- add source and expected-target digests;
- add project and manifest identity;
- bind receipt path;
- validate absent targets remain absent;
- reject source drift and unsupported actions;
- stop regenerating the graph after approval.

### WP2 - Readiness-Bound Replay

- require approval and readiness evidence for `--apply-plan`;
- validate plan path, digest, action IDs, and paths across all records;
- replay only approved actions;
- reject hidden writes.

### WP3 - Apply Receipt

- add schema, protocol, template, checker, CLI entry, and workflow directory;
- generate receipt from runtime observations;
- validate exact before/after hashes and unexpected paths;
- record rollback outcomes.

### WP4 - Activation And Adoption Closure

- run installed workflow activation check;
- bind activation output to project and receipt;
- require a verified receipt for applied-adoption claims;
- preserve adapter-only/read-only semantics.

### WP5 - Product Integration

- update manifest, generated assets, CLI help, references, README files,
  versions, release evidence, examples, negative fixtures, and self-checks.

## 12. Acceptance Matrix

| ID | Scenario | Expected result |
|---|---|---|
| A01 | Valid plan + exact approval + exact readiness | only approved actions replay |
| A02 | Plan changed after approval | fail before first write |
| A03 | Source changed after plan | fail before first write |
| A04 | Previously absent target appears | fail before first write |
| A05 | Approval action set differs | fail before first write |
| A06 | Approval target path differs | fail before first write |
| A07 | Readiness belongs to another plan | fail before first write |
| A08 | Readiness action set differs | fail before first write |
| A09 | Symlink appears in target path | fail before first write |
| A10 | Runner attempts unplanned path | fail with no hidden write |
| A11 | Result hash differs | stop, rollback, verify rollback |
| A12 | Successful apply | receipt state `APPLY_VERIFIED` |
| A13 | Receipt copied to another project | checker fails |
| A14 | Applied target later changes | assurance rejects stale receipt |
| A15 | Activation entry fails | no verified-active claim |
| A16 | Adapter-only project, no writes | partial adoption remains valid |
| A17 | Receipt claims release approval | checker fails |
| A18 | High-risk or business-code action | runner refuses it |
| A19 | Dirty work outside approved scope | fail before apply |
| A20 | Full source self-check | `npm run verify` passes |

## 13. Verification Commands

```bash
node scripts/check-apply-execution-receipt.mjs <example> --require-structured-evidence
node scripts/check-adoption-assurance.mjs <example> --require-structured-evidence
node scripts/check-intentos.mjs --mode full
npm run verify
npm run verify:syntax
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs
node scripts/check-claim-control.mjs
git diff --check
```

Self-check must include temporary-project runtime tests that inspect actual
target diffs and hashes, not only fixture text.

## 14. Release Evidence

Create `releases/1.92.0/release-record.md`, `known-limitations.md`, and
`self-check-report.md`.

Allowed claim: IntentOS can verify that its bounded low-risk init/update
adoption apply replayed the exact approved graph and produced project-bound
execution and activation evidence.

Forbidden claim: IntentOS guarantees product correctness, approves release or
production, or automatically executes arbitrary project changes.

## 15. Completion Criteria

1. No init/update apply regenerates a broader graph after approval.
2. Approval and readiness bind the executed plan and action set.
3. Every applied action has verified before/after evidence.
4. Unexpected target writes fail the apply.
5. A project-bound receipt is generated and independently checkable.
6. Applied adoption cannot become `VERIFIED_ACTIVE` without receipt and
   activation proof.
7. Adapter-only/read-only projects do not receive false full-adoption claims.
8. Positive, negative, runtime, manifest, product, claim, syntax, and full
   verification pass.

