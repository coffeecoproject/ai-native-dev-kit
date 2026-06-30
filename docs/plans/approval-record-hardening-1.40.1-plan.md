# Approval Record Hardening 1.40.1 Plan

## Goal

Harden the current `1.40.0` Approval Record phase without adding a new governance module.

This release is a stabilization pass. It keeps `1.41` focused on machine-readable schemas and keeps `1.42` focused on a dry-run-first controlled apply candidate.

## Why Now

`1.40.0` completed the plan-first approval evidence chain:

```text
Unified Apply Plan -> Controlled Apply Readiness -> Approval Record
```

The next risk is not missing capability. The next risk is complexity drift:

- user-facing entry points can become too technical;
- `IntentOS`, `AI Native Dev Kit`, and `ai-native` naming can look inconsistent;
- artifact directories can feel flat without a lifecycle map;
- O0 / BL0 users can be exposed to heavy governance concepts too early;
- Approval Record path and expiry boundaries need stronger bad-fixture coverage.

## Scope

### In Scope

1. Clarify the naming contract:
   - `IntentOS` is the product/workflow-system name.
   - `AI Native Dev Kit` is the historical repository/package lineage.
   - `ai-native` remains a compatibility CLI/package alias for now.
2. Clarify that `1.4.0` was a historical Project Memory phase and the current line is `1.40.x`.
3. Add an artifact lifecycle map so maintainers know when each artifact class appears.
4. Add an O0 / BL0 lightweight path so small projects do not see heavy governance by default.
5. Harden Approval Record checks for:
   - wildcard paths;
   - parent directory traversal;
   - root or slash-leading absolute paths;
   - expired approvals;
   - ambiguous human approvers;
   - mismatched approved action IDs between the action table and the statement.
6. Add bad fixtures and fixture matrix coverage for the new rejection cases.
7. Update release records and docs references.

### Out Of Scope

- No machine-readable schema migration.
- No controlled apply runner.
- No automatic apply.
- No CI or hook installation behavior changes.
- No default BL2 or industrial pack enablement.
- No removal of existing commands.

## Execution Plan

1. Documentation hardening:
   - update README and README.zh-CN;
   - add `docs/artifact-lifecycle.md`;
   - add `docs/o0-bl0-lightweight-path.md`;
   - link both from docs home, index, operator manual, and references as needed.
2. Approval Record checker hardening:
   - add path boundary detection;
   - add expiry parsing for already-expired approval records;
   - reject ambiguous owner labels;
   - compare approved action IDs with the human approval statement.
3. Evidence and examples:
   - add new bad fixtures;
   - update `test-fixtures/fixture-cases.json`;
   - update `scripts/check-dev-kit.mjs` source-evidence checks.
4. Version and release:
   - bump package, manifest, workflow version, and version docs to `1.40.1`;
   - add release evidence under `releases/1.40.1`.
5. Verification:
   - syntax check the modified scripts;
   - run Approval Record checker on source, example, and bad fixtures;
   - run fixture matrix;
   - run manifest check;
   - run full Dev Kit self-check;
   - run `git diff --check`.

## Success Criteria

- The repository still presents a simple natural-language entry for ordinary users.
- The command surface remains available but is framed as maintainer/reference evidence.
- Approval Records cannot use wildcard, traversal, root, expired, ambiguous-owner, or mismatched-action approvals.
- `1.41` and `1.42` remain roadmap phases, not accidentally implemented in `1.40.1`.
- Full self-check passes.

## Human Boundary

This plan does not authorize target-project writes, release, production use, hook installation, CI modification, schema migration, or controlled apply.
