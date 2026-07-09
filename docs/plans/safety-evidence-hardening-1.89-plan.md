# Path And Evidence Hardening 1.89 Plan

## Purpose

1.89 hardens IntentOS execution reliability after the full-repository review.

The goal is not to add another workflow layer. The goal is to make existing
write paths, evidence gates, and existing-project adoption claims fail closed
when the recorded evidence is missing, stale, unsafe, or not task-bound.

## Scope

1. Path safety for IntentOS write-capable commands.
2. Plan integrity for generated init/update apply plans.
3. Strict evidence gates that fail when required reports are absent.
4. Structured evidence schema enforcement for keywords already used by the
   artifact schemas.
5. Existing-project adoption assurance that cannot claim verified active or
   full adoption without a verified apply chain.
6. Work Queue takeover source coverage without arbitrary source truncation.
7. Safer release handoff defaults that start blocked until approval evidence is
   recorded.
8. CLI visibility when a command may write through `--out`.

## Non-Goals

- Do not add a new project workflow.
- Do not authorize native apply.
- Do not approve implementation, commit, push, release, production, tests,
  migrations, provider actions, or owner decisions.
- Do not replace project-native gates, CI, release, session, task, or business
  authority.

## Required Implementation

### 1. Shared Path Safety Helper

Add `scripts/lib/path-safety.mjs` and use it from write-capable or path-driven
surfaces.

The helper must reject:

- absolute paths;
- `..` traversal;
- empty or dot-only path segments;
- backslash-separated paths;
- NUL bytes;
- writes outside the intended root;
- writes through symlink path components.

### 2. Init / Update Plan Integrity

`scripts/init-project.mjs` must:

- validate starter names and backup directories;
- validate copy source and target paths;
- refuse symlink write paths;
- compute a stable `planDigest`;
- refuse `--apply-plan` when the plan content no longer matches its digest.

### 3. Manifest And Workflow Asset Safety

`scripts/check-manifest.mjs` must validate manifest path fields before drift
checks run. Unsafe source, target, and group paths must fail the check.

Generated projects must receive any shared helper required by generated
workflow scripts.

### 4. New Workflow Item Safety

`scripts/new-workflow-item.mjs` must validate references and output paths. The
`--number` field must be digits-only so a workflow item number cannot become a
path segment.

### 5. Artifact Schema Keyword Enforcement

`scripts/lib/artifact-schema.mjs` must enforce schema keywords already used by
IntentOS artifact schemas, including:

- `$ref`;
- `allOf`;
- `const`;
- `minLength`;
- `minItems`;
- `minProperties`;
- `uniqueItems`;
- `contains`;
- schema-valued `additionalProperties`.

Unsupported schema keywords must fail closed.

### 6. Strict Evidence Absence Must Fail

When strict flags require evidence, checkers must not pass because a report
directory is empty.

At minimum:

- Plan Review strict mode;
- Completion Evidence strict mode;
- Controlled Apply Readiness strict mode.

### 7. Adoption Assurance Verified Active Guard

`VERIFIED_ACTIVE` must require a verified apply chain:

- apply plan evidence;
- approval record evidence;
- controlled apply readiness evidence;
- matching plan digest across those records;
- approved approval record;
- ready apply readiness state.

Without that chain, a read-only or adapter-only old-project adoption can be
valid, but it must remain partial.

### 8. Work Queue Takeover Coverage

Work Queue takeover must not silently omit discovered task sources. If a real
project has 40 sources, all 40 must be dispositioned or explicitly blocked.

### 9. Release Handoff Defaults

Release handoff template defaults must remain blocked until structured
approval is recorded.

### 10. CLI Write Visibility

The CLI must show the underlying command when a command writes directly or can
write through `--out`.

## Acceptance

Run:

```bash
npm run verify
git diff --check
```

The self-check must include direct coverage for:

- unsafe manifest path rejection;
- tampered init/update apply plan rejection;
- symlink write rejection;
- strict evidence absence failure;
- schema keyword enforcement;
- partial old-project adoption staying valid without full adoption claims.

## Expected User Impact

Users should not need to understand these internals.

For users, the practical effect is:

- IntentOS is stricter about where it writes;
- old-project adoption cannot overclaim;
- missing evidence cannot be treated as success;
- generated projects receive the helper files their scripts need.
