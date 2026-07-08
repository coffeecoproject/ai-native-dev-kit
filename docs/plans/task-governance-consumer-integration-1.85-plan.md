# Task Governance Consumer Integration 1.85 Plan

## Purpose

1.85 should connect the task-entry guarantees from 1.84 to the execution and completion consumers.

After 1.84:

```text
Work Queue item -> Task Governance
```

1.85 should enforce:

```text
Work Queue item + Task Governance -> Execution Assurance -> Completion Evidence -> Unified Closure -> User Delivery Console
```

The goal is not to add another governance layer. The goal is to make existing completion and status layers consume the task-entry decision.

## Relationship To 1.84

1.84 prevents Codex from starting work from messy old TODOs or chat memory.

1.85 prevents Codex from claiming work is done when the execution or completion evidence does not match:

- the current Work Queue item;
- the Task Governance tier;
- the required review policy;
- the required verification status;
- the required high-impact evidence chain.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `docs/plans/existing-project-work-queue-takeover-1.84-plan.md`
- `core/work-queue.md`
- `docs/work-queue.md`
- `core/behavior-complete-existing-project-adoption.md`
- `docs/behavior-complete-existing-project-adoption.md`
- `schemas/artifacts/task-governance.schema.json`
- `scripts/check-task-governance.mjs`
- `docs/execution-assurance-chain.md`
- `schemas/artifacts/execution-assurance.schema.json`
- `scripts/check-execution-assurance.mjs`
- `docs/completion-evidence-gate.md`
- `schemas/artifacts/completion-evidence.schema.json`
- `scripts/check-completion-evidence.mjs`
- `docs/unified-closure-model.md`
- `scripts/check-closure-decision.mjs`
- `docs/user-delivery-console.md`
- `scripts/check-user-delivery-console.mjs`
- `scripts/check-intentos.mjs`

## Problem Statement

### Problem 1: A Task Can Be Classified But Not Consumed

1.83 can classify a task.

1.84 can require tasks to enter a Work Queue.

But unless downstream consumers check those records, Codex may still:

- write code after an unresolved `POSSIBLE_HIGH`;
- claim a `HIGH` task is complete without full evidence;
- close a task that is not the current Work Queue item;
- show a user "done" while Task Governance still blocks completion.

### Problem 2: Completion Must Match The Current Task

Completion evidence must not be reusable from:

- another queue item;
- a stale task;
- a different intent digest;
- a previous version of the same task;
- a lower-risk classification.

### Problem 3: The User Should Still See A Simple Answer

Users should not be asked to inspect:

- Work Queue ids;
- Task Governance JSON;
- execution assurance schema;
- completion evidence refs;
- closure traces.

They should see:

```text
This task is done / not done / blocked, and here is the plain reason.
```

Technical details belong in trace sections.

## Scope

1.85 should add consumer integration rules to:

- Execution Assurance;
- Completion Evidence;
- Unified Closure;
- User Delivery Console.

It may add:

- source refs for Work Queue item and Task Governance;
- digest matching;
- task match checks;
- tier-to-requirement checks;
- plain user blocker output.

It must not:

- create a new closure system;
- replace existing Execution Assurance;
- replace Completion Evidence;
- replace Unified Closure;
- replace User Delivery Console;
- approve implementation;
- approve completion by itself;
- approve release/production;
- modify target-project runtime behavior;
- install hooks or CI gates by default.

## Consumer Rules

### Rule 1: Execution Assurance Must Reference The Current Queue Item

For executable work, Execution Assurance must include:

- `work_queue_item_ref`;
- `work_queue_item_digest`;
- `task_governance_ref`;
- `task_governance_digest`;
- `task_governance_task_match`;
- `task_governance_tier`.

If the Work Queue item is not `CURRENT`, Execution Assurance must fail unless the task is an approved resume review.

### Rule 2: Task Governance Tier Controls Required Evidence

Required behavior:

| Tier | Required before completion claim |
| --- | --- |
| `LOW` | scope unchanged, no unrelated edits, minimal verification status `RECORDED` or explicit accepted reason |
| `MEDIUM` | short plan, bounded surface, targeted verification status `RECORDED` |
| `POSSIBLE_HIGH` | cannot claim done until resolved to LOW/MEDIUM/HIGH |
| `HIGH` | Business Rule Closure or matched project-native equivalent, Change Impact Coverage, Execution Plan, Verification Plan, Test Evidence, Execution Assurance, Completion Evidence |

### Rule 3: Completion Evidence Must Bind To Task Governance

Completion Evidence must include:

- current Work Queue item ref;
- Task Governance ref;
- Task Governance digest;
- current task match;
- tier;
- evidence coverage for the tier;
- unresolved blocker list.

It must fail when:

- Task Governance is missing;
- digest does not match;
- task match is not `Yes`;
- `POSSIBLE_HIGH` remains unresolved;
- HIGH required evidence is missing;
- LOW/MEDIUM verification status still says `REQUIRED` or `NOT_RUN` without accepted reason.

### Rule 4: Unified Closure Must Respect Task Governance Blockers

Unified Closure must not return a final done/ready result when:

- Work Queue item is not current or properly resumed;
- Task Governance is missing;
- Task Governance blocks implementation or completion;
- Completion Evidence reports unresolved task-governance blockers.

It may show:

```text
Not done yet: this task still needs targeted verification.
```

It should not expose raw internal terminology as the first user-facing line.

### Rule 5: User Delivery Console Must Show Plain Status

User Delivery Console should convert technical blockers into plain status:

| Technical blocker | Plain user status |
| --- | --- |
| missing Task Governance | "I need to classify this task before continuing." |
| unresolved POSSIBLE_HIGH | "This may affect important behavior, so I need to confirm impact before coding." |
| missing verification | "The change is not proven yet. I still need to run the required check." |
| queue item not current | "This is not the active task. I need to switch or resume it first." |
| high-impact evidence missing | "This task affects important behavior and still needs the full review evidence." |

## Implementation Plan

### Step 1: Define Consumer Contract

Add:

- `core/task-governance-consumer-integration.md`
- `docs/task-governance-consumer-integration.md`

Define:

- Work Queue binding;
- Task Governance binding;
- tier-to-evidence requirements;
- consumer behavior for Execution Assurance, Completion Evidence, Closure, and User Delivery Console;
- user-facing plain output rules.

### Step 2: Extend Schemas Carefully

Add optional-to-required-by-mode fields where appropriate:

- Execution Assurance:
  - `work_queue_item_ref`;
  - `work_queue_item_digest`;
  - `task_governance_ref`;
  - `task_governance_digest`;
  - `task_governance_tier`;
  - `task_governance_task_match`.
- Completion Evidence:
  - same binding fields;
  - `task_governance_blockers`;
  - `tier_completion_requirements_satisfied`.
- Closure/User Delivery evidence:
  - reference fields or derived blocker trace.

Keep backwards-compatible default mode where existing historical examples still pass unless strict consumer mode is requested.

Strict mode should be required for 1.85 examples and release self-check.

### Step 3: Extend Checkers

Update:

- `scripts/check-execution-assurance.mjs`;
- `scripts/check-completion-evidence.mjs`;
- `scripts/check-closure-decision.mjs`;
- `scripts/check-user-delivery-console.mjs`.

Add flags:

```bash
--require-task-governance
--require-work-queue
--strict-task-consumer
```

The checkers should verify:

- refs resolve;
- digests match;
- current task matches;
- tier matches required evidence;
- blockers are propagated;
- plain user status does not require internal terminology.

### Step 4: Add Examples

Add examples:

- `examples/1.85-task-governance-consumer-integration/low-copy-done`
- `examples/1.85-task-governance-consumer-integration/medium-targeted-verified`
- `examples/1.85-task-governance-consumer-integration/high-workflow-rule`
- `examples/1.85-task-governance-consumer-integration/possible-high-blocked`
- `examples/1.85-task-governance-consumer-integration/queue-item-not-current`

Each example should include:

- Work Queue item;
- Task Governance report;
- required execution/completion/closure/status artifacts for the scenario.

### Step 5: Add Bad Fixtures

Bad fixtures must fail:

- execution assurance without Task Governance;
- completion evidence with stale Task Governance digest;
- done claim for unresolved `POSSIBLE_HIGH`;
- HIGH task missing Business Rule Closure;
- MEDIUM task missing targeted verification;
- LOW task with unrelated edits;
- closure ready while queue item is not current;
- User Delivery Console says done while Task Governance blocks completion.

### Step 6: CLI And Verify Surface

Do not add a new primary public command unless needed.

Prefer extending existing checkers and status commands:

```bash
node scripts/check-execution-assurance.mjs <project> --require-task-governance --require-work-queue
node scripts/check-completion-evidence.mjs <project> --require-task-governance --require-work-queue
node scripts/check-closure-decision.mjs <project> --strict-task-consumer
node scripts/check-user-delivery-console.mjs <project> --strict-task-consumer
```

Update:

- `scripts/check-intentos.mjs`;
- `package.json` verify surfaces;
- `intentos-manifest.json`;
- `README.md`;
- `README.zh-CN.md`;
- `VERSION.md`;
- release evidence under `releases/1.85.0/`.

## Acceptance Plan

### Static Acceptance

Required:

```bash
node --check scripts/check-execution-assurance.mjs
node --check scripts/check-completion-evidence.mjs
node --check scripts/check-closure-decision.mjs
node --check scripts/check-user-delivery-console.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
git diff --check
```

### Positive Consumer Examples

Required:

```bash
node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-task-governance --require-work-queue --require-structured-evidence
node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-task-governance --require-work-queue --require-structured-evidence
node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --strict-task-consumer
node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --strict-task-consumer
```

Repeat for LOW and MEDIUM examples.

### Negative Consumer Fixtures

The checker suite must reject:

- no Task Governance ref;
- stale Task Governance digest;
- unresolved `POSSIBLE_HIGH`;
- HIGH missing required evidence;
- MEDIUM missing targeted verification;
- LOW unrelated edits;
- closure ready despite queue mismatch;
- user console overclaims done.

### User-Burden Acceptance

The first user-facing line must answer:

```text
Can this task continue?
Can this task be called done?
What is missing in plain language?
```

It must not require the user to interpret:

- schema names;
- digest mismatch details;
- internal evidence ref syntax;
- checker flags;
- closure internals.

### Existing Project Acceptance

For an existing project with partial/adaptor-only adoption:

- Task Governance can be satisfied by matched project-native evidence;
- stronger project rules remain authoritative;
- Work Queue can map to project-native sessions if reliable;
- messy task sources can be taken over by IntentOS Work Queue;
- no `.intentos/`, `AGENTS.md`, CI, release, runtime, DB, API, Web, Docker, production, or business code changes are implied.

### Full Verify Acceptance

Required before release:

```bash
npm run verify:syntax
npm run verify:release
```

If full `npm run verify` is not run, the release record must say so explicitly and classify the missing evidence.

## Release Criteria

1.85 can be considered complete when:

- Execution Assurance consumes Work Queue + Task Governance under strict mode;
- Completion Evidence consumes Work Queue + Task Governance under strict mode;
- Unified Closure cannot claim done when Task Governance blocks;
- User Delivery Console shows Task Governance blockers plainly;
- LOW/MEDIUM/HIGH/POSSIBLE_HIGH examples prove correct behavior;
- bad fixtures prove bypass attempts fail;
- project-native evidence remains valid when matched and stronger;
- no new execution authority is introduced.

## Known Limits

1.85 still does not mean:

- automatic production release;
- automatic CI or hook installation;
- full native adoption of every old project;
- replacement of stronger project-owned rules;
- guaranteed business correctness without valid source evidence.

1.85 means:

```text
The execution and completion consumers can no longer ignore Work Queue and Task Governance in strict mode.
```
