# 1.40 Approval Record Governance Plan

## Goal

Add a dedicated Approval Record layer between Controlled Apply Readiness and any future controlled apply candidate.

This layer records explicit human approval without granting Codex automatic write authority.

## Scope

- Add Approval Record governance.
- Add approval record template, checklist, prompt, docs, examples, and bad fixtures.
- Add a checker that validates approval records are human-owned, bounded, explicit, and non-executing.
- Add a `new-workflow-item` artifact type for draft approval records.
- Add CLI and verification coverage for checking recorded approval records.
- Add generated-project assets and manifest coverage.

## Non-Goals

- Do not add an apply runner.
- Do not execute writes from an Apply Plan.
- Do not let a readiness report count as approval.
- Do not let Codex, AI, reviewer, or subagent output approve work.
- Do not approve release, production, CI, hooks, archive moves, migrations, secrets, payments, security, privacy, compliance, legal, or industrial packs.
- Do not support blanket approvals.

## User Experience

User says:

```text
我批准这份计划里的 A001 和 A002。
```

Codex should answer:

```text
我先把这次批准记录成 Approval Record。它只记录你批准了哪些 action，不会自动执行。
```

Then Codex should generate or update one approval record, run the checker, and stop before any future apply step.

## Required Behavior

1. Approval status must be explicit.
2. Approved records must identify a human approver.
3. Approved records must reference one apply plan and a plan hash.
4. Approved action IDs must be explicit and bounded.
5. Approval scope must name exact files or exact artifact paths.
6. Expiry must be present and not open-ended.
7. Rollback and verification acknowledgement must be explicit.
8. Approval records must state that they do not authorize automatic apply, implementation approval, release approval, production approval, hook/CI changes, or high-risk actions.
9. Draft records may exist, but they cannot be treated as approval.
10. High-risk actions remain human-only and cannot be approved through this layer.

## Verification

- `node scripts/check-approval-record.mjs .`
- `node scripts/check-approval-record.mjs examples/1.40-approval-record-governance`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`
