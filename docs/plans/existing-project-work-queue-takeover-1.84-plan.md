# Existing Project Work Queue Takeover 1.84 Plan

## Purpose

1.84 should solve the old-project task-entry problem:

```text
An existing project may have TODOs, sessions, issues, handoff notes, AI logs, or scattered pending work,
but those records may be stale, duplicated, incomplete, or unsafe as an execution entry.
```

The goal is to let Codex establish a reliable IntentOS Work Queue when an old project's task system is missing or unreliable.

Plain-language target:

```text
Codex reads the old task records.
Codex decides whether they are reliable.
If they are messy or missing, Codex builds an IntentOS Work Queue.
Old records are preserved as sources, but future execution starts from the IntentOS queue.
```

## Relationship To 1.83

1.83 classifies a single task and decides which governance path it needs:

```text
LOW / MEDIUM / POSSIBLE_HIGH / HIGH
```

1.84 decides where tasks come from and whether the old project has a trustworthy task entry:

```text
Old task sources -> IntentOS Work Queue -> Task Governance
```

1.84 must make Task Governance consumable at the Work Queue entry point:

- every executable Work Queue item must have a Task Governance ref;
- backlog or archived items do not need execution governance yet;
- no task may become `CURRENT` for execution without Task Governance;
- old TODO lines cannot be treated as direct implementation permission.

## Why This Is The Minimal Integration

The complete Task Governance consumer chain would include:

- Work Queue;
- Execution Assurance;
- Completion Evidence;
- Unified Closure;
- User Delivery Console;
- release and delivery views.

1.84 should not modify all of those at once.

1.84 makes the smallest useful enforcement cut:

```text
No task execution entry without Work Queue + Task Governance.
```

That prevents the most common bypass:

```text
Codex starts from a messy old TODO or chat memory and skips the 1.83 task classifier.
```

1.85 can then connect this entry to completion and user-status consumers.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `core/work-queue.md`
- `docs/work-queue.md`
- `templates/work-queue-report.md`
- `checklists/work-queue-review.md`
- `prompts/work-queue-agent.md`
- `scripts/resolve-work-queue.mjs`
- `scripts/check-work-queue.mjs`
- `docs/plans/behavior-complete-existing-project-adoption-1.83-plan.md`
- `core/behavior-complete-existing-project-adoption.md`
- `docs/behavior-complete-existing-project-adoption.md`
- `templates/task-governance-report.md`
- `schemas/artifacts/task-governance.schema.json`
- `scripts/resolve-task-governance.mjs`
- `scripts/check-task-governance.mjs`
- `scripts/check-intentos.mjs`

Real-project observations such as WorkControl may be used only as calibration evidence. They must not be hard-coded as public behavior.

## Problem Statement

### Problem 1: Old TODO Systems Are Often Not Reliable

Old project task records can be:

- stale;
- duplicated;
- missing owner or status;
- mixed with ideas, bugs, and completed work;
- disconnected from current code;
- missing recovery point;
- missing validation evidence;
- unclear about whether they are still wanted.

Codex must not treat those records as the execution source of truth.

### Problem 2: Users Cannot Judge Task-System Reliability

The user should not need to decide whether:

- `TODO.md` is current;
- an old issue is still valid;
- a session item is complete;
- an AI log note is safe to resume;
- a task should be migrated, archived, merged, or blocked.

Codex should inspect and produce a plain recommendation.

### Problem 3: "Complete Migration" Must Not Mean Activating Every Old Item

For messy projects, 1.84 may recommend a full Work Queue takeover.

But full takeover means:

```text
Future task authority moves to IntentOS Work Queue.
```

It does not mean:

```text
Every old TODO becomes an active task.
```

Every source item must receive one disposition.

## Project Task-System Classes

1.84 should classify the old project's task system as one of:

| Class | Meaning | Default action |
| --- | --- | --- |
| `RELIABLE_EXISTING_TASK_SYSTEM` | Existing task records have clear current task, states, owners, recovery, and evidence | Map to IntentOS Work Queue |
| `MESSY_TASK_SYSTEM` | Records exist but are stale, duplicated, ownerless, or inconsistent | Establish IntentOS Work Queue and migrate valid items |
| `MISSING_TASK_SYSTEM` | No usable task continuity system exists | Establish IntentOS Work Queue |
| `UNSAFE_TO_TAKE_OVER` | Dirty worktree, unclear production incident, owner conflict, or risky active release | Stop for safe review |

Default behavior:

```text
MESSY_TASK_SYSTEM -> IntentOS Work Queue becomes future task authority.
MISSING_TASK_SYSTEM -> IntentOS Work Queue becomes future task authority.
RELIABLE_EXISTING_TASK_SYSTEM -> existing system may stay authoritative if mapped.
UNSAFE_TO_TAKE_OVER -> no takeover.
```

## Source Discovery

1.84 should scan common task sources read-only:

- `TODO.md`, `todo.md`, `TASKS.md`, `ROADMAP.md`;
- docs containing `TODO`, `FIXME`, `pending`, `follow-up`, `backlog`;
- session or handoff directories;
- issue export files if present locally;
- AI logs or final reports;
- existing Work Queue files;
- active branches or PR notes when available locally;
- project-specific task docs found by existing adoption/autopilot signals.

The scanner must not:

- call external APIs by default;
- mutate target-project files during discovery;
- delete or rewrite old task sources;
- treat comments like `TODO` in implementation code as executable backlog without context.

## Reliability Criteria

Codex should evaluate whether the current task system has:

- one current task or a clear no-current-task state;
- stable task ids;
- task states;
- source refs;
- owner or source owner;
- updated timestamp or recency signal;
- paused/resume checkpoint for incomplete work;
- blockers;
- verification or close-out evidence for completed work;
- no uncontrolled duplication;
- no contradiction between records.

If these are missing or contradictory, the system is not reliable.

## Migration Dispositions

Every old source item should receive exactly one disposition:

| Disposition | Meaning |
| --- | --- |
| `MIGRATE_CURRENT` | Promote as the one current task |
| `MIGRATE_BACKLOG` | Add as future task |
| `MIGRATE_PAUSED` | Add as paused work with resume review required |
| `MIGRATE_BLOCKED` | Add as blocked task with blocker |
| `MERGE_DUPLICATE` | Merge into another queue item |
| `MARK_DONE_WITH_EVIDENCE` | Keep as done because evidence exists |
| `MARK_STALE` | Keep as stale historical item |
| `NEEDS_CLARIFICATION` | Too ambiguous to migrate safely |
| `ARCHIVE_SOURCE_ONLY` | Preserve only as historical source |

Disallowed disposition:

```text
ACTIVATE_ALL
```

## Work Queue Item Requirements

Every executable item must include:

- item id;
- title;
- plain user summary;
- source refs;
- source digest or source summary;
- current state;
- task owner or source owner;
- task_governance_ref when executable;
- task_governance_digest when executable;
- resume requirements when paused;
- blocked reason when blocked;
- verification required before done;
- close-out requirements;
- migration disposition.

## Task Governance Binding

Rules:

- `CURRENT` must have Task Governance.
- `PAUSED` must have Task Governance before resume.
- `BLOCKED` must record why governance is not enough yet.
- `BACKLOG` may omit Task Governance until promotion, but the promotion must create or bind one.
- `DONE` must have completion evidence or a source reason.
- `CANCELLED` must not be resumed as-is.

If a task is promoted to execution without Task Governance, the checker must fail.

## User Experience

The user should not see a technical migration table first.

Recommended plain output:

```text
我检查到这个老项目的任务记录不够可靠。
我会建立 IntentOS 任务队列，后续任务以新队列为准。
旧 TODO 不删除，只作为历史来源保留。
高风险或无法判断的条目会先停下来，不会自动执行。
```

If the project already has a reliable task system:

```text
我检查到项目已有可靠任务体系。
我会把它映射到 IntentOS Work Queue，不重复建立一套新队列。
```

## Scope

1.84 should add:

- existing-project Work Queue takeover core protocol;
- docs and plain-language usage page;
- Work Queue takeover template;
- schema for takeover reports;
- resolver;
- checker;
- examples:
  - reliable existing task system;
  - messy TODO migration;
  - missing task system;
  - unsafe dirty project;
- bad fixtures:
  - activates all old TODO items;
  - multiple current tasks;
  - executable current task without Task Governance;
  - deletes old TODO source;
  - claims full adoption from queue takeover;
  - treats backlog as permission to execute;
  - migrates stale item without source evidence.

## Non-Goals

1.84 must not:

- delete old TODO files;
- overwrite project task systems without a controlled apply path;
- install `.intentos/`;
- replace `AGENTS.md`;
- change CI, hooks, release, runtime, DB, API, Web, Docker, production, secrets, payments, or external systems;
- claim full adoption;
- approve implementation;
- approve completion;
- approve commit/push;
- execute tests or migrations;
- force strong governed projects to abandon a better existing task system.

## Implementation Plan

### Step 1: Define The Protocol

Add core and docs pages:

- `core/existing-project-work-queue-takeover.md`
- `docs/existing-project-work-queue-takeover.md`

They must define:

- task-system classes;
- takeover decision;
- source discovery;
- reliability criteria;
- migration dispositions;
- Task Governance binding;
- no-delete boundary;
- plain user output.

### Step 2: Add Artifact Template And Schema

Add:

- `templates/work-queue-takeover-report.md`
- `schemas/artifacts/work-queue-takeover.schema.json`
- `work-queue-takeover-reports/.gitkeep`

Required evidence:

- project task-system class;
- discovered sources;
- source item dispositions;
- final task authority;
- current task count;
- executable item Task Governance binding status;
- user-facing summary;
- boundaries.

### Step 3: Add Resolver

Add:

- `scripts/resolve-work-queue-takeover.mjs`

Resolver behavior:

- read target project;
- scan likely task sources;
- classify task-system reliability;
- generate report;
- do not mutate target files unless `--out` is a relative path inside target project;
- default to stdout;
- include plain user summary.

### Step 4: Add Checker

Add:

- `scripts/check-work-queue-takeover.mjs`

Checker rules:

- at most one `CURRENT`;
- messy/missing systems must recommend IntentOS Work Queue authority;
- reliable systems may recommend mapping;
- every executable item has Task Governance or is blocked from execution;
- every old source item has exactly one disposition;
- no report may delete old sources;
- no report may claim full adoption;
- no report may approve implementation or completion.

### Step 5: Add CLI Entries

Add CLI commands:

```bash
node scripts/cli.mjs queue-takeover <project> --intent "<user intent>"
node scripts/cli.mjs queue-takeover-check <project>
```

The public help should explain this in plain language:

```text
Review whether an old project's task records should be mapped or replaced by IntentOS Work Queue.
```

### Step 6: Add Examples And Bad Fixtures

Add examples:

- `examples/1.84-work-queue-takeover/reliable-existing-system`
- `examples/1.84-work-queue-takeover/messy-todo-migration`
- `examples/1.84-work-queue-takeover/missing-task-system`
- `examples/1.84-work-queue-takeover/unsafe-dirty-project`

Add bad fixtures listed in Scope.

### Step 7: Wire Self-Check

Update:

- `scripts/check-intentos.mjs`;
- `package.json` verify surfaces;
- `intentos-manifest.json`;
- `README.md`;
- `README.zh-CN.md`;
- `VERSION.md`;
- `templates/workflow-version.json`;
- release evidence under `releases/1.84.0/`.

## Acceptance Plan

### Static Acceptance

Required commands:

```bash
node --check scripts/resolve-work-queue-takeover.mjs
node --check scripts/check-work-queue-takeover.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
git diff --check
```

### Positive Fixtures

Required:

```bash
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/reliable-existing-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/messy-todo-migration --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/missing-task-system --require-structured-evidence
node scripts/check-work-queue-takeover.mjs examples/1.84-work-queue-takeover/unsafe-dirty-project --require-structured-evidence
```

Expected:

- reliable system maps instead of replacing;
- messy system recommends takeover and migration;
- missing system recommends new IntentOS Work Queue;
- unsafe project blocks takeover.

### Negative Fixtures

Required bad fixtures must fail:

- activates all TODOs;
- deletes old source;
- has multiple current tasks;
- current task without Task Governance;
- backlog treated as permission;
- stale item migrated as active without evidence;
- report claims full adoption;
- report approves implementation.

### CLI Acceptance

Required:

```bash
node scripts/cli.mjs queue-takeover examples/1.84-work-queue-takeover/messy-todo-migration --intent "continue old project tasks"
node scripts/cli.mjs queue-takeover-check examples/1.84-work-queue-takeover/messy-todo-migration
```

Expected:

- resolver prints a plain-language result first;
- no target files are changed by default;
- checker passes the structured report.

### User-Burden Acceptance

Human Summary must not require users to understand:

- Work Queue internals;
- Task Governance internals;
- JSON schema;
- migration dispositions;
- source digests.

Technical details may appear in a lower technical trace, not as the primary user decision.

### Boundary Acceptance

Reports must state:

- writes target files: `No`;
- approves implementation: `No`;
- approves completion: `No`;
- approves commit/push: `No`;
- approves release/production: `No`;
- deletes old task sources: `No`;
- claims full adoption: `No`.

## Release Criteria

1.84 can be considered complete when:

- Work Queue takeover protocol exists;
- old task source reliability can be classified;
- messy or missing task systems recommend IntentOS Work Queue authority;
- reliable systems can be mapped without replacement;
- every source item receives a disposition;
- executable items require Task Governance;
- positive and bad fixtures are covered by self-check;
- the user-facing output stays plain-language;
- no target-project apply or runtime mutation is implied.

## Known Limits

1.84 does not yet enforce completion-chain consumers.

It ensures:

```text
task entry -> Work Queue -> Task Governance
```

It does not yet ensure:

```text
Execution Assurance / Completion Evidence / Unified Closure / User Delivery Console
all consume Work Queue + Task Governance.
```

That is the job of 1.85.
