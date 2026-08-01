---
schema_version: 1.0
artifact_type: spec
number: 247
slug: current-managed-identity-boundary
title: "current managed identity boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/247-current-managed-identity-boundary.md
preflight: preflight/247-current-managed-identity-boundary.md
---
# Spec 247: current managed identity boundary

## Status

Ready

## Source

- Request: `requests/247-current-managed-identity-boundary.md`
- Preflight: `preflight/247-current-managed-identity-boundary.md`

## Problem

受控更新后的身份证据会合并 bootstrap 与最新 apply 回执，但当前验证把历史 `.intentos`/`scripts` 整个目录作为永久身份根。已从当前 `workflowAssets` 退役且未被更新计划触碰的文件，只要有历史 bootstrap 动作，就会因合法用户修改导致身份冲突。

## User Story

As a Codex workflow operator,
I want controlled-update identity validation to follow the current managed asset declaration,
so that retired assets can remain project-owned without weakening current asset integrity.

## Scope

Included:

- Derive identity roots from current `workflowAssets` plus `AGENTS.md` and `.intentos/version.json`.
- Preserve exact bootstrap/latest-receipt evidence merging for current assets.
- Extend the existing generated-project controlled-update integration test with a modified retired `scripts/verify.sh`.

## Non-goals

- Pawcode apply execution or business files.
- Workflow states, receipts, schemas, dependency/CI/hook/release behavior.
- General tolerance for current managed-asset drift.

## Data Model Impact

New or changed entities:

- None.

## API / Interface Contract

### Current managed identity validation

Input:

```json
{"workflowAssets":["current managed paths"],"bootstrapEvidence":"verified","latestUpdateEvidence":"verified"}
```

Output:

```json
{"projectIdentity":"INSTALLED_CURRENT"}
```

Errors:

- Missing current asset, unsafe path, missing applied evidence, or current hash mismatch returns `CONFLICTED`.

## UI States

- Not applicable; no UI.

## Permission Rules

- No permission model change.

## Observability

- Logs: existing Project Entry reason text.
- Metrics: not applicable.
- Audit events: existing apply/bootstrap receipts remain authoritative.

## Acceptance Criteria

- A retired `scripts/verify.sh` historical action cannot invalidate a current identity when it is absent from current `workflowAssets`.
- The retired file remains byte-for-byte preserved through controlled update.
- Current declared managed assets still require applied evidence and exact hashes.
- Existing current-asset tamper regression continues to fail closed.
- Focused integration, project-entry, manifest, and full source self-check pass.

## Test Plan

- Unit: existing Project Entry identity tests.
- Integration: generated project init, mutate retired verify script, controlled update, cold trust.
- E2E: full source self-check.
- Manual: Pawcode v3 evidence diagnosis and a fresh post-fix controlled update.

## Rollback Notes

Revert the local source commit; no data migration or external rollback exists.

## Open Questions

- None.
