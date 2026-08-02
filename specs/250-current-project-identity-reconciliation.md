---
schema_version: 1.0
artifact_type: spec
number: 250
slug: current-project-identity-reconciliation
title: "current project identity reconciliation"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
request: requests/250-current-project-identity-reconciliation.md
preflight: preflight/250-current-project-identity-reconciliation.md
---
# Spec 250: Current Project Identity Reconciliation

## Status

Implementing

## Source

- Request: `requests/250-current-project-identity-reconciliation.md`
- Preflight: `preflight/250-current-project-identity-reconciliation.md`

## Problem

An installed project may preserve `projectEntryOrigin=NEW_PROJECT` forever.
The current implementation treats that provenance as current identity, so an
established project can contradict the current bootstrapped, active, and dirty
facts produced in the same run.

## User Story

As an external project user,
I want IntentOS to distinguish how my project originally entered IntentOS from
what the project is now,
so that the public workflow describes the current project truthfully without
rewriting history or touching my files.

## Scope

Included:

- add one counts-and-digest-only current project-content fact;
- exclude IntentOS-managed assets and workflow-record directories;
- resolve workflow-record directories from the installed Manifest first and
  the authoritative source Manifest for source-only operation;
- bind the fact only to project-owned content, not the number of generated
  workflow evidence records;
- reconcile a new-origin bootstrapped project to an existing current entry
  when project-owned content exists;
- preserve scaffold-only new-project behavior;
- expose historical origin and its role additively in the identity projection;
- keep `PROJECT_INFORMATION` status independent of current-task completion
  evidence and start the User Delivery Console only for one identified current
  task;
- add focused regression and external read-only evidence.

## Current Project Content Fact

The current-run Project Fact Projection must expose a non-authorizing,
counts-only `project_content` fact derived from the already bounded project
inventory.

Canonical states:

- `PROJECT_OWNED_CONTENT_PRESENT`: at least one non-IntentOS-managed,
  non-workflow-record project path is observed;
- `INTENTOS_SCAFFOLD_ONLY`: only installed IntentOS assets and workflow records
  are observed;
- `NOT_OBSERVED`: the target cannot be inspected as a directory.

The projection must not expose the content paths through the public identity
view.

Creating, updating, or removing an IntentOS workflow record under an
authoritative `groups.workflowDirs` root must not change the project-content or
Project Fact digest. Adding, changing, or removing genuine project-owned
content must continue to invalidate those digests.

## Data Model Impact

No application data changes. One additive `project_content` object is added to
the in-process Project Fact Projection, and additive provenance fields are
added to `projectIdentityProjection`.

## API / Interface Contract

### Current project identity projection

Input:

```json
{
  "sourceProjectState": "BOOTSTRAPPED_PROJECT",
  "projectEntryOrigin": "NEW_PROJECT",
  "projectContentState": "PROJECT_OWNED_CONTENT_PRESENT"
}
```

Output:

```json
{
  "projectKind": "EXISTING_PROJECT",
  "projectEntryOrigin": "NEW_PROJECT",
  "projectEntryOriginRole": "HISTORICAL_PROVENANCE"
}
```

Errors:

- unreadable or conflicted required sources remain blocked and low confidence;
- no content path is included in the public identity projection.

## UI States

- Not applicable; human CLI prose is rendered from the structured identity.

## Permission Rules

- The projection remains read-only and non-authorizing.
- No target write, implementation, apply, release, or production authority is
  introduced.

## Observability

- Logs: existing human and JSON `work` output.
- Metrics: not applicable.
- Audit events: Task 250 focused test summaries and Pawcode immutable snapshots.

## Entry Reconciliation

For `projectEntryOrigin=NEW_PROJECT`:

- an unbootstrapped or scaffold-only target remains `NEW_PROJECT_ENTRY`;
- a bootstrapped target with `PROJECT_OWNED_CONTENT_PRESENT` becomes
  `EXISTING_PROJECT_ENTRY`;
- declared current production facts remain production-sensitive and take
  precedence.

For `projectEntryOrigin=EXISTING_PROJECT`, existing/governed behavior remains
unchanged. `INTENTOS_REPOSITORY` remains `INTENTOS_SOURCE_ENTRY`.

## Public Projection

`projectIdentityProjection` must retain both:

- current `projectKind`, derived from the reconciled current entry; and
- historical `projectEntryOrigin`, explicitly marked as provenance.

The projection digest must bind the content state and origin. A project that
crosses from scaffold-only to project-owned content must produce a different
identity projection digest.

## Status Source Selection

The existing `statusScope` contract controls source orchestration:

- `PROJECT_INFORMATION` reads project identity and Work Queue posture but does
  not start `USER_DELIVERY_CONSOLE`;
- `CURRENT_TASK` without one current Work Queue item reports the missing task
  identity before task-completion processing;
- `CURRENT_TASK` with one current Work Queue item may start
  `USER_DELIVERY_CONSOLE` and preserves its existing read-only contract.

This is a source-selection correction, not a User Delivery Console rewrite or
a new process-management framework.

## Compatibility

Operation selection, status-scope classification, dirty-worktree blocking,
material-action authorization, target write boundaries, and exit codes are
unchanged. Source selection now honors the existing status scope. Existing
consumers may continue reading the established fields; new explanatory fields
are additive.

## Acceptance Criteria

- A new unbootstrapped or scaffold-only target remains `NEW_PROJECT`.
- A new-origin bootstrapped target with project-owned content becomes
  `EXISTING_PROJECT` without changing its origin.
- Workflow evidence alone does not establish product content.
- Source-only workflow evidence creation leaves the Project Fact digest stable,
  while genuine project content changes it.
- Dirty-worktree safe stop, operation, exit code, and no-write boundaries remain
  unchanged.
- Project-information status omits `USER_DELIVERY_CONSOLE`; missing-current-task
  status also omits it, while an identified current-task status still consumes
  it.
- The previously timed-out IntentOS source identity case completes within its
  existing 180-second bound and leaves no associated process behind.
- Generated-project distribution checks pass.
- Pawcode is correctly described and remains byte/Git-state unchanged.
- One final IntentOS source self-check passes.

## Non-goals

- no target-project mutation;
- no apply, receipt, ownership, release, or production change;
- no durable project-maturity write or migration;
- no intent-wording-based identity classification.

## Test Plan

- Unit/integration: current Project Fact Projection, source-only evidence
  invariance, status-scope source selection, and Operating Model tests.
- Distribution: generated project cold-start and installed local consumer test.
- External: Pawcode before/after immutable snapshot under a read-only command.
- Repository: Manifest, workflow artifact, Change Boundary, diff, and one final
  IntentOS source self-check.

## Rollback Notes

Revert the bounded Task 250 commit if a current consumer regresses. No target
project rollback is needed because validation is read-only.

## Open Questions

- None within Task 250.
