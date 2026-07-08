# Execution And Release Runtime Hygiene 1.86 Plan

## Purpose

1.86 should handle the real engineering conditions that appear after a task has
been classified, queued, implemented, or prepared for release.

Plain-language target:

```text
Codex should not only write code.
Codex should also understand when Git, local gates, CI, release bundles,
artifact quotas, or release lanes block delivery, then choose the safest next
step without asking the user to understand technical details.
```

1.86 is not a new task-governance layer. It is a runtime hygiene layer for the
period between:

```text
task execution started
-> commit / push / CI / release preflight / release handoff
-> delivery can be safely claimed or must remain blocked
```

## Relationship To 1.84 And 1.85

1.84 answers:

```text
Where does the current task come from?
Is it safe to make this task the current Work Queue item?
```

1.85 answers:

```text
Do completion consumers prove that the current Work Queue item and Task
Governance record match the work being closed?
```

1.86 answers:

```text
When the task reaches real Git, push, CI, or release runtime conditions, can
Codex keep the delivery path clean, recover safely, and explain the situation
without shifting technical judgment to the user?
```

The intended chain is:

```text
Work Queue -> Task Governance -> Execution / Completion Consumers
-> Runtime Hygiene -> Delivery / Release Status
```

1.86 must not bypass or weaken 1.84 or 1.85. It consumes their task identity and
completion status as source evidence.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/plans/existing-project-work-queue-takeover-1.84-plan.md`
- `docs/plans/task-governance-consumer-integration-1.85-plan.md`
- `core/work-queue.md`
- `docs/work-queue.md`
- `core/behavior-complete-existing-project-adoption.md`
- `docs/behavior-complete-existing-project-adoption.md`
- `core/execution-assurance-chain.md`
- `docs/execution-assurance-chain.md`
- `core/completion-evidence-gate.md`
- `docs/completion-evidence-gate.md`
- `core/release-core-model.md`
- `docs/release-core-model.md`
- `core/release-evidence-gate.md`
- `docs/release-evidence-gate.md`
- `scripts/check-intentos.mjs`

Real-project observations such as WorkControl may be used only as calibration
evidence. They must not be hard-coded as public behavior.

## Problem Statement

### Problem 1: Git History Can Make A Clean Task Look Dirty

Existing-project work often continues on an old branch. That branch may already
contain previous task commits that were merged into `main` through a merge
commit. When Codex continues on that old branch, Git can show confusing
`ahead/behind` state.

Plain-language problem:

```text
The user sees "ahead" or old commits and cannot know whether the PR will only
contain the current task.
```

IntentOS should detect:

- stale `origin/main`;
- old task branches being reused;
- local commits already included in `main` through another merge path;
- current task commit mixed with old adoption or documentation commits;
- PR diff that includes more than the current task.

### Problem 2: Push Can Fail For Project Gate Reasons

A task may be locally committed but fail at pre-push because the project has
its own gates.

Examples:

- lint failure;
- typecheck failure;
- test failure;
- structure budget failure;
- large-file split-required failure;
- generated file or docs consistency failure;
- security or dependency gate failure.

Plain-language problem:

```text
Code was committed, but the project says it is not ready to push.
```

IntentOS should not bypass gates. It should classify the failure, keep the task
open, and produce the next safe repair path.

### Problem 3: CI Failure Is Not Always A Code Failure

GitHub Actions or other CI providers can fail because of:

- code/test problems;
- environment problems;
- missing permissions;
- network or cache issues;
- artifact storage quota;
- unavailable runners;
- expired secrets;
- branch protection or required checks.

Plain-language problem:

```text
The user only sees "CI failed" and cannot tell whether the task is wrong, the
environment is blocked, or a human approval is needed.
```

### Problem 4: Release Failure Does Not Always Mean Production Was Touched

Release workflows can fail at different lanes:

```text
preflight -> bundle -> test lane -> production lane -> post-release smoke
```

A failure before test lane usually has no production side effect. A failure
after production actions may require incident-style handling.

IntentOS must distinguish:

- no release side effect yet;
- test lane started;
- production freeze entered;
- production deploy started;
- production deploy completed;
- post-release smoke failed;
- rollback required.

### Problem 5: Artifact Quota And Bundle Size Can Block Release

A release may be blocked because the CI provider cannot upload a bundle
artifact.

Observed class:

```text
Artifact storage quota has been hit.
```

This is not a production deploy failure. It is a release-runtime storage
failure.

IntentOS should recognize:

- release bundle upload failure;
- artifact quota failure;
- large release bundle;
- historical release bundle artifacts occupying space;
- release evidence artifacts that should be preserved;
- irreversible artifact deletion requiring approval.

### Problem 6: Release Bundles Can Accidentally Include Evidence Archives

A release source bundle may become too large because it includes:

- screenshots;
- videos;
- PDFs;
- large evidence archives;
- `docs/evidence`;
- generated reports;
- built assets or binary artifacts that are not runtime inputs.

Plain-language problem:

```text
The release package is carrying audit evidence as if it were runtime code.
```

IntentOS should separate:

```text
Git commit evidence
release evidence
runtime release bundle
external evidence archive
```

Evidence must not be deleted just to make a release pass. Instead, runtime
bundle contents should be narrowed while evidence remains indexed, hashed, and
recoverable.

## Scope

1.86 should add:

- runtime hygiene protocol;
- runtime blocker report template;
- runtime hygiene schema;
- runtime hygiene resolver;
- runtime hygiene checker;
- examples for Git, push gate, CI, artifact quota, and bundle bloat;
- bad fixtures that reject unsafe recovery recommendations;
- CLI entries for runtime hygiene;
- release evidence for 1.86.

## Non-Goals

1.86 must not:

- replace Work Queue;
- replace Task Governance;
- replace Execution Assurance;
- replace Completion Evidence;
- replace Release Plan or Release Evidence Gate;
- create a deployment system;
- approve release or production;
- bypass pre-push hooks;
- bypass CI;
- force push by default;
- delete artifacts automatically;
- delete evidence automatically;
- modify production systems;
- change project runtime code as part of diagnosis;
- treat runtime hygiene as completion proof by itself.

## Runtime Hygiene Classes

1.86 should classify runtime blockers as:

| Class | Meaning | Default behavior |
| --- | --- | --- |
| `GIT_LINEAGE_DIRTY` | Branch history is stale, mixed, or not based on current main | Produce branch cleanup plan |
| `COMMIT_SCOPE_MIXED` | Current commit includes unrelated task changes | Block completion and request split/amend plan |
| `PRE_PUSH_GATE_FAILED` | Local pre-push or project gate failed | Classify gate and continue task repair |
| `STRUCTURE_BUDGET_EXCEEDED` | Project structure budget blocks push | Require structural split, not bypass |
| `CI_CODE_FAILURE` | CI failed because code/test behavior failed | Return to execution repair |
| `CI_ENVIRONMENT_FAILURE` | CI failed because of external environment/provider issue | Retry or human-approved provider action |
| `RELEASE_PREFLIGHT_FAILED` | Release failed before test/prod side effects | Diagnose and retry if safe |
| `ARTIFACT_QUOTA_BLOCKED` | Artifact storage quota blocks bundle/evidence upload | Human-approved cleanup or bundle strategy |
| `RELEASE_BUNDLE_OVERSIZED` | Bundle includes large non-runtime assets | Recommend bundle slimming |
| `PRODUCTION_SIDE_EFFECT_UNKNOWN` | It is unclear whether production was touched | Stop for release-owner decision |
| `PRODUCTION_SIDE_EFFECT_PRESENT` | Production action started or completed | Stop for release-owner / incident path |

## Runtime Decision States

The report should output one of:

| State | Meaning |
| --- | --- |
| `CAN_CONTINUE_AUTOMATICALLY` | Codex can continue without user approval because the action is reversible and inside the current task |
| `CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR` | Codex should repair the gate failure as part of the current task |
| `NEEDS_PLAIN_USER_APPROVAL` | A non-technical user decision is required |
| `NEEDS_RELEASE_OWNER_APPROVAL` | Release owner must approve because release authority or irreversible cleanup is involved |
| `BLOCKED_BY_IRREVERSIBLE_ACTION` | Proposed action cannot proceed without explicit approval |
| `BLOCKED_BY_PRODUCTION_SIDE_EFFECT` | Production may have been touched; stop for release-owner process |
| `BLOCKED_BY_UNCLEAR_TASK_SCOPE` | Runtime state suggests unrelated work or mixed commits |

## User-Facing Output Contract

Users should not be asked to understand:

- `ahead/behind`;
- merge bases;
- rebase internals;
- pre-push hook internals;
- GitHub Actions artifact quota;
- release lanes;
- bundle staging;
- evidence digest details.

The first output must be plain:

```text
This task is not finished yet. The code was committed, but push was blocked by
the project's structure gate. I need to split the new logic out of large files,
rerun the gate, and push again.
```

Or:

```text
The release has not touched production. GitHub storage for build bundles is
full. The safe option is to remove old release bundles but keep release evidence
and the latest production bundle. Deleting artifacts is irreversible, so I need
your approval.
```

Technical trace belongs below the plain answer.

## Git Lineage Rules

Codex should inspect before commit or push:

- current branch name;
- upstream branch;
- latest fetched `origin/main`;
- dirty worktree state;
- staged scope;
- local commits not in `origin/main`;
- commits in `origin/main` not in the current branch;
- whether old local commits are already represented by a merge commit on main;
- whether current task files match the active Work Queue item.

Required behavior:

- fetch before comparing remote state when network is available;
- do not assume `origin/main` is fresh;
- prefer a new clean branch for a new task if the current branch belongs to an
  already-merged task;
- do not force push by default;
- if a pushed branch requires history rewrite, stop or require explicit
  approval;
- if old commits are mixed with current work, block completion until the task
  commit is isolated.

## Push Gate Rules

Codex should classify local push failures:

| Failure | Required response |
| --- | --- |
| lint/typecheck/test fail | Repair current task or mark blocked |
| structure budget fail | Split code structurally; do not add exemption by default |
| generated docs/index drift | Regenerate or update expected source |
| secret/security fail | Stop if secret exposure or policy violation |
| hook error unrelated to task | classify and decide retry vs project-owner issue |

The report must record:

- gate command;
- exit status;
- failure class;
- whether target files changed;
- whether failure is current-task related;
- next repair action;
- whether user approval is needed;
- whether the task remains open.

## CI Runtime Rules

Codex should classify CI failures as:

- code failure;
- test flake;
- environment failure;
- permission failure;
- quota/storage failure;
- required-check configuration failure;
- unknown failure.

It must not call a failed CI "safe" unless:

- failure class is known;
- no production side effect exists;
- retry is permitted;
- current task evidence records the failure and retry plan.

## Release Lane Rules

Release runtime hygiene must distinguish:

| Lane state | Meaning | Default action |
| --- | --- | --- |
| `PREFLIGHT_ONLY` | No test/prod side effect yet | diagnose and retry if reversible |
| `BUNDLE_CREATED` | Bundle exists but not handed to test/prod | safe to rebuild if evidence preserved |
| `TEST_LANE_STARTED` | Test deploy/check started | preserve test evidence before retry |
| `PROD_FREEZE_ENTERED` | Production release lock/freeze entered | release owner approval required |
| `PROD_DEPLOY_STARTED` | Production action started | stop for release-owner path |
| `PROD_DEPLOY_DONE` | Production changed | post-release/rollback rules apply |
| `UNKNOWN` | Cannot prove lane state | stop |

Release runtime hygiene does not approve release.

## Artifact Quota Rules

For artifact quota failures:

- identify artifact type if possible;
- distinguish release bundles from release evidence;
- preserve release evidence and production evidence by default;
- preserve latest production release bundle by default;
- prefer deleting older non-authoritative build bundles first;
- record that deletion is irreversible;
- require explicit approval before deletion;
- if deletion is not approved, recommend waiting for quota reset or changing
  bundle transport.

## Release Bundle Hygiene Rules

Codex should inspect bundle composition when bundle size blocks release or is
near project-defined thresholds.

Default classification:

| Content | Bundle default |
| --- | --- |
| runtime source code | include |
| package manifests / lockfiles | include |
| runtime configuration templates | include if safe |
| migrations needed by release | include if part of release |
| docs/evidence screenshots/videos | exclude from runtime bundle |
| release evidence index / hash manifest | include or reference |
| build output already reproducible | exclude unless required by deployment |
| secrets | never include |
| local caches / dependencies | exclude |

Important rule:

```text
Do not delete evidence to slim a bundle. Separate evidence storage from runtime
bundle content.
```

## Proposed Assets

Add:

- `core/execution-release-runtime-hygiene.md`
- `docs/execution-release-runtime-hygiene.md`
- `templates/runtime-hygiene-report.md`
- `schemas/artifacts/runtime-hygiene.schema.json`
- `checklists/runtime-hygiene-review.md`
- `prompts/runtime-hygiene-agent.md`
- `runtime-hygiene-reports/.gitkeep`
- `scripts/resolve-runtime-hygiene.mjs`
- `scripts/check-runtime-hygiene.mjs`
- `releases/1.86.0/release-record.md`
- `releases/1.86.0/known-limitations.md`
- `releases/1.86.0/self-check-report.md`

Add CLI entries:

```text
runtime-hygiene
runtime-hygiene-check
```

Candidate command shape:

```bash
node scripts/cli.mjs runtime-hygiene . --intent "push current task"
node scripts/cli.mjs runtime-hygiene-check . --allow-empty
```

## Runtime Hygiene Report Schema

The machine-readable evidence should include:

```json
{
  "schema_version": "1.86.0",
  "artifact_type": "runtime_hygiene",
  "runtime_hygiene_ref": "runtime-hygiene-reports/generated.md",
  "runtime_hygiene_digest": "sha256:<64 hex>",
  "task_ref": "task:<id>",
  "work_queue_item_ref": "<ref or N/A>",
  "task_governance_ref": "<ref or N/A>",
  "operation": "commit|push|ci|release|artifact-cleanup|bundle-slimming",
  "runtime_class": "GIT_LINEAGE_DIRTY",
  "decision_state": "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR",
  "plain_user_summary": "<plain summary>",
  "plain_next_step": "<plain next step>",
  "technical_terms_required": "No",
  "git_context": {
    "branch": "<branch>",
    "upstream": "<upstream or N/A>",
    "origin_main_fresh": "Yes|No|Unknown",
    "ahead_count": 0,
    "behind_count": 0,
    "current_task_commit_isolated": "Yes|No|Unknown",
    "force_push_required": "Yes|No|Unknown"
  },
  "gate_context": {
    "gate_name": "<name or N/A>",
    "exit_code": "0|nonzero|Unknown",
    "failure_class": "<class or N/A>",
    "current_task_related": "Yes|No|Unknown",
    "bypass_recommended": "No"
  },
  "release_context": {
    "lane_state": "PREFLIGHT_ONLY|TEST_LANE_STARTED|PROD_DEPLOY_STARTED|UNKNOWN",
    "production_touched": "Yes|No|Unknown",
    "release_id_reusable": "Yes|No|Unknown",
    "release_owner_required": "Yes|No"
  },
  "artifact_context": {
    "artifact_quota_blocked": "Yes|No|Unknown",
    "artifact_deletion_required": "Yes|No|Unknown",
    "artifact_deletion_irreversible": "Yes|No|N/A",
    "preserve_evidence_artifacts": "Yes",
    "preserve_latest_production_bundle": "Yes|No|Unknown"
  },
  "bundle_context": {
    "bundle_size_status": "OK|WARN|BLOCKED|Unknown",
    "suspected_non_runtime_content": ["docs/evidence"],
    "evidence_removed": "No",
    "bundle_slimming_recommended": "Yes|No"
  },
  "boundaries": {
    "writes_target_files": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "bypasses_gates": "No",
    "deletes_artifacts": "No",
    "changes_production": "No",
    "force_pushes": "No"
  },
  "required_approval": {
    "approval_required": "Yes|No",
    "approval_reason": "<reason or N/A>",
    "approval_scope": "<scope or N/A>"
  },
  "task_continuation": {
    "task_remains_open": "Yes|No",
    "resume_action": "<next action>",
    "work_queue_update_required": "Yes|No"
  },
  "outcome": "BLOCKED_BY_IRREVERSIBLE_ACTION"
}
```

## Examples

Add positive examples:

- `examples/1.86-runtime-hygiene/git-old-branch-rebase-plan`
  - stale branch;
  - old task commits already merged;
  - current task commit isolated after rebase plan;
  - no force push approval granted.

- `examples/1.86-runtime-hygiene/pre-push-structure-gate`
  - local commit exists;
  - pre-push fails structure budget;
  - outcome tells Codex to split code, not bypass.

- `examples/1.86-runtime-hygiene/ci-environment-retry`
  - CI failure classified as provider/environment;
  - retry allowed only if no production side effect and task evidence remains open.

- `examples/1.86-runtime-hygiene/release-artifact-quota-preflight`
  - release stopped before test/prod;
  - artifact quota blocks upload;
  - deletion requires approval;
  - release id can be reused only because lane state is preflight-only.

- `examples/1.86-runtime-hygiene/release-bundle-evidence-bloat`
  - bundle size blocked;
  - large evidence directory identified;
  - recommendation excludes evidence from runtime bundle while preserving index/hash.

Add bad fixtures:

- `bad-runtime-hygiene-force-push-without-approval`
- `bad-runtime-hygiene-bypasses-pre-push`
- `bad-runtime-hygiene-claims-done-after-gate-fail`
- `bad-runtime-hygiene-artifact-delete-without-approval`
- `bad-runtime-hygiene-deletes-release-evidence`
- `bad-runtime-hygiene-reuses-release-id-after-prod-touch`
- `bad-runtime-hygiene-unknown-production-side-effect-continues`
- `bad-runtime-hygiene-bundle-slimming-deletes-evidence`
- `bad-runtime-hygiene-technical-user-burden`

## Implementation Plan

### Step 1: Define Runtime Hygiene Protocol

Create:

- `core/execution-release-runtime-hygiene.md`
- `docs/execution-release-runtime-hygiene.md`

Document:

- Git lineage rules;
- push gate rules;
- CI failure classification;
- release lane state model;
- artifact quota handling;
- bundle hygiene;
- user-facing output rules;
- non-authorizing boundary.

### Step 2: Add Template And Schema

Create:

- `templates/runtime-hygiene-report.md`
- `schemas/artifacts/runtime-hygiene.schema.json`

The schema must require:

- plain summary;
- runtime class;
- decision state;
- current task linkage when available;
- boundary flags;
- approval requirement;
- task continuation status.

### Step 3: Add Resolver

Create `scripts/resolve-runtime-hygiene.mjs`.

The resolver should be read-only by default.

It may infer from local project facts:

- branch context;
- git status;
- known gate output files if supplied;
- release lane notes if supplied;
- artifact quota error text if supplied;
- bundle composition summary if supplied.

It must not:

- run destructive cleanup;
- force push;
- delete artifacts;
- modify production;
- bypass gates.

Suggested flags:

```text
--intent
--operation
--gate-output
--release-lane
--artifact-error
--bundle-summary
--out
--json
```

`--out` must be relative to the target project.

### Step 4: Add Checker

Create `scripts/check-runtime-hygiene.mjs`.

The checker must reject reports that:

- authorize implementation, commit, push, release, production, artifact deletion,
  gate bypass, or force push;
- claim done while a gate failed;
- continue after unknown production side effect;
- delete artifacts without explicit approval;
- delete release evidence;
- reuse a release id after production was touched;
- expose raw technical burden in the first user-facing summary;
- omit current task continuation status.

### Step 5: Add CLI Routing

Update `scripts/cli.mjs`:

```text
runtime-hygiene
runtime-hygiene-check
```

Help text should be plain:

```text
Diagnose Git, push, CI, artifact, bundle, or release-runtime blockers without
approving destructive actions.
```

### Step 6: Add Examples And Bad Fixtures

Add the examples and bad fixtures listed above.

Each example should include:

- runtime hygiene report;
- source snippets if needed;
- plain user summary;
- machine-readable evidence.

### Step 7: Integrate Self-Check

Update:

- `scripts/check-intentos.mjs`;
- `package.json` verify scripts;
- `intentos-manifest.json`;
- `docs/plans/README.md`;
- `README.md`;
- `README.zh-CN.md`;
- `VERSION.md`;
- `templates/version-record.md`;
- `templates/workflow-version.json`.

### Step 8: Release Evidence

Create:

- `releases/1.86.0/release-record.md`
- `releases/1.86.0/known-limitations.md`
- `releases/1.86.0/self-check-report.md`

The release record must say:

- 1.86 is non-authorizing;
- 1.86 does not approve push or release;
- 1.86 does not delete artifacts;
- 1.86 does not change production;
- 1.86 classifies runtime blockers and safe continuation paths.

## Acceptance Plan

### Syntax

```bash
node --check scripts/resolve-runtime-hygiene.mjs
node --check scripts/check-runtime-hygiene.mjs
node --check scripts/check-intentos.mjs
```

### Positive Checks

```bash
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/git-old-branch-rebase-plan --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/pre-push-structure-gate --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/ci-environment-retry --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-artifact-quota-preflight --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-bundle-evidence-bloat --require-structured-evidence
```

### Negative Checks

Each bad fixture must fail:

```bash
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-force-push-without-approval --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-bypasses-pre-push --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-claims-done-after-gate-fail --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-artifact-delete-without-approval --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-deletes-release-evidence --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-reuses-release-id-after-prod-touch --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-unknown-production-side-effect-continues --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-bundle-slimming-deletes-evidence --require-structured-evidence
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-technical-user-burden --require-structured-evidence
```

### CLI Checks

```bash
node scripts/cli.mjs runtime-hygiene . --intent "push current task"
node scripts/cli.mjs runtime-hygiene-check . --allow-empty
```

### Full Checks

```bash
npm run verify:syntax
npm run verify:release
git diff --check
```

## Review Plan

Before release, run a static review focused on:

- no destructive action is authorized;
- no production action is authorized;
- no artifact deletion is automatic;
- evidence is preserved even when bundle slimming is recommended;
- Work Queue / Task Governance task identity is respected;
- user-facing summaries are plain language;
- technical trace remains available for reviewers.

## User Experience Target

For a branch lineage issue, the user should see:

```text
This branch is carrying history from an older task. I will make the current
task branch line up with latest main so the PR only contains this task.
```

For a pre-push structure gate:

```text
The code is not ready to push. The project blocked it because too much new
logic was added to already-large files. I need to split the logic and rerun
the gate.
```

For artifact quota:

```text
The release has not touched production. GitHub storage for build bundles is
full. The safe cleanup is to remove old release bundles while keeping release
evidence and the latest production bundle. Deletion is irreversible, so I need
approval.
```

For bundle bloat:

```text
The release bundle is too large because it includes evidence archives. The
application code can still use Git as source of truth, but the runtime bundle
should exclude evidence files and preserve them through an index and digest.
```

## Completion Definition

1.86 is complete when:

- runtime hygiene protocol exists;
- resolver and checker exist;
- CLI entries exist;
- Git, push, CI, artifact quota, and bundle bloat examples pass;
- unsafe recovery bad fixtures fail;
- release evidence exists;
- `check-intentos` covers 1.86 assets and fixtures;
- full release verification passes.

## What 1.86 Does Not Mean

1.86 does not mean:

- Codex can force push;
- Codex can delete artifacts without approval;
- Codex can bypass local gates;
- Codex can bypass CI;
- Codex can approve release;
- Codex can alter production;
- Codex can delete evidence;
- runtime hygiene proves task completion by itself.

1.86 means:

```text
When real Git, push, CI, artifact, bundle, or release-runtime blockers appear,
Codex can classify them, keep the task open, propose the safe next step, and
avoid making the user understand low-level engineering mechanics.
```
