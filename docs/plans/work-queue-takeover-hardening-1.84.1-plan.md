# Work Queue Takeover Hardening 1.84.1 Plan

## Purpose

1.84.1 hardens the 1.84 Work Queue Takeover path for existing projects.

The problem is not a missing CLI entry. The problem is semantic precision:

- stale or risky old task sources must never become `CURRENT`;
- a migrated `CURRENT` item must not be executable until Task Governance is real;
- source identity must be durable enough to prevent stale evidence reuse;
- takeover readiness must be understood as review readiness, not implementation permission.

## Scope

This patch updates:

- Work Queue Takeover resolver logic;
- Work Queue Takeover checker logic;
- Work Queue Takeover evidence schema;
- examples and bad-fixture rejection behavior;
- public docs, script reference, README, VERSION, manifest, and release evidence.

It does not add a new user-facing command.

## Required Behavior

### Source Identity

Each discovered source must carry:

- `source_ref`
- `source_digest`
- `source_type`
- `status`
- `summary`

Each migration disposition must carry the matching `source_digest`.

Each queue item must carry `source_item_digest` matching the source inventory.

### Current Candidate Selection

`MIGRATE_CURRENT` may only be assigned to a non-stale, non-risky source.

If a source already has `CURRENT` status, it is preferred over an `UNKNOWN`
source. If no safe current source exists, no current task is promoted.

### Task Governance Binding

A migrated `CURRENT` item starts with:

```text
task_governance_binding_status: PENDING
task_governance_digest: N/A
execution_review_eligible_after_task_governance: Yes
execution_eligible: No
```

`execution_eligible: Yes` is allowed only after a real Task Governance report is
resolved and the digest matches that report. 1.84.1 does not generate such a
verified state by default.

### Readiness Wording

The evidence keeps `takeover_ready` for compatibility, but adds
`takeover_review_ready` to make the meaning explicit.

`takeover_review_ready: Yes` means the report can be reviewed. It does not mean
Codex may implement, commit, release, install native assets, or execute old
TODOs.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-work-queue-takeover.mjs
node --check scripts/check-work-queue-takeover.mjs
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/messy-todo-migration --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/missing-task-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/unsafe-dirty-project --require-structured-evidence
npm run verify:syntax
npm run verify:baseline
npm run verify:governance
npm run verify:industrial
npm run verify:examples
npm run verify:release
git diff --check
```

Negative coverage must reject:

- stale source promoted to `CURRENT`;
- risky source promoted to `CURRENT`;
- backlog item marked executable;
- current item without Task Governance ref;
- generated pending current item claiming `execution_eligible: Yes`;
- takeover reports that approve implementation, completion, release, commit, or full adoption.

## Boundary

1.84.1 remains non-authorizing:

- no target-project writes;
- no deletion of old task sources;
- no native asset installation;
- no `AGENTS.md`, CI, release, runtime, API, Web, DB, Docker, or production changes;
- no implementation approval;
- no completion approval;
- no commit/push approval;
- no release/production approval;
- no full-adoption claim.
