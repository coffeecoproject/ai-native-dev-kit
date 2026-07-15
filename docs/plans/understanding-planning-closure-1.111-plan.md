# Understanding And Planning Closure 1.111 Execution And Acceptance Plan

## Status

Implemented and accepted as IntentOS `1.111.0` against the committed
`1.110.0` baseline.

The previous draft correctly identified the need for a planning close-out, but
mixed that need with a new Work Queue schema, Review Surface schema, external
review-provider infrastructure, plan lineage engine, installed-project
migration system, and future execution dispatch. Those additions duplicated
existing authorities or depended on capabilities that IntentOS does not own.

This document replaces that draft as one coherent release plan. It authorizes
implementation only inside the boundaries below.

## Theme

IntentOS `1.111.0` adds **Understanding And Planning Closure**.

It answers one internal question:

```text
For the current project and current task, are the required understanding,
scope, business, engineering, review, control, and verification planning
obligations current enough to enter controlled implementation review?
```

It does not answer whether implementation is complete, whether tests passed,
or whether release or production is allowed.

## Product Contract

The zero-experience solo user continues to state a goal in natural language.
Codex owns:

- task routing and planning depth;
- project and source inspection;
- architecture and engineering decisions;
- business and change-surface discovery;
- baseline, review, control, and verification selection;
- technical blockers and the next internal planning action.

The user may be asked only for:

- an unavailable business fact;
- a product preference between valid outcomes;
- an unavailable authoritative external fact;
- consent for a later prepared real-world effect.

The user is not asked to select workflow commands, risk tiers, schemas,
reviewers, test tools, platforms, baselines, packs, or technical approaches.

## Core Decision

`Planning Closure` is a pure derived projection over existing authorities.

It may:

- validate the current task and intent binding;
- read Task Governance applicability;
- validate required current source reports;
- identify the earliest missing planning obligation;
- emit one non-authorizing Execution Entry Contract when planning is ready;
- provide one plain-language next action.

It may not:

- create or mutate Work Queue records;
- create a second task, plan, review, or completion authority;
- run discovery, tests, Subagents, apply, migration, or release actions;
- authorize implementation or any project write;
- treat an artifact's existence as proof that it is current or valid;
- turn partial planning into an execution-ready result.

## Existing Authorities

1.111 reuses these authorities without replacing them:

| Concern | Existing authority |
|---|---|
| Project operation allowed | Project Entry Trust / Project Fact Projection |
| Current work | Work Queue or verified project-native task system |
| Task depth | Task Governance |
| Business completeness | Business Universe Coverage and Business Rule Closure |
| Planned affected scope | Change Impact Coverage and the exact plan binding validated by Plan Review |
| Engineering constraints | Baseline State and project-native engineering evidence |
| Verification obligations | Verification Plan |
| Review | Review Surface and Plan Review |
| Relied-on controls | Control Effectiveness |
| Final task completion | Completion Evidence and Unified Closure |

Planning Closure never overrides a source authority. Conflicting or invalid
source results block the projection.

## Relationship To 1.110

When Task Governance says a relied-on control requires proof, Planning Closure
must consume the exact current `Control Effectiveness` result already bound by
Plan Review or Verification Plan.

Only `CONTROL_PROVEN_EFFECTIVE` can support planning readiness. Partial,
missing, invalid, stale, task-mismatched, or intent-mismatched control evidence
blocks planning. Planning Closure does not reassess the control.

## Planning Depth

Planning depth comes from Task Governance and stronger applicable project
rules. It is never chosen by the user.

### LOW

- current task and intent;
- current project/source identity;
- bounded change description;
- lightweight verification intent;
- explicit reason when durable Plan Review is not required.

### MEDIUM

- current durable plan as strictly bound by Plan Review;
- affected engineering facts;
- applicable Change Impact Coverage;
- Verification Plan;
- targeted Plan Review;
- applicable business and control evidence.

### POSSIBLE_HIGH

- planning remains blocked;
- Codex performs bounded read-only inspection;
- no Execution Entry Contract is emitted.

### HIGH

- all applicable MEDIUM sources;
- full business and affected-surface coverage;
- current baselines and assumptions;
- independent review evidence through the existing Plan Review/Subagent
  mechanisms when available and required by project policy;
- no locally invented provider receipt requirement.

If the current environment cannot prove required independent review, the plan
remains blocked. 1.111 does not invent an external signature system.

## Required Source Matrix

Task Governance owns applicability. Planning Closure only consumes it.

| Source | Required when |
|---|---|
| Project Entry Trust | Every ordinary task |
| Work Queue/current-task projection | Every task |
| Task Governance | Every task |
| Business Universe Coverage | Task Governance requires it |
| Business Rule Closure | Task Governance requires it |
| Change Impact Coverage | Task Governance requires it |
| Verification Plan | Task Governance requires it |
| Plan Review, including its exact plan identity binding | Task Governance/review policy requires it |
| Control Effectiveness | Task Governance requires relied-on control proof |

Required source evidence must be:

- project-local and path-safe;
- schema-valid when a structured schema exists;
- bound to the same project, task, and intent;
- current for the source revision;
- non-skipped and non-placeholder;
- semantically ready according to its own checker.

Historical compatibility may remain readable, but it cannot support a strict
1.111 ready result.

## Planning Closure States

```text
PLANNING_READY
PLANNING_IN_PROGRESS
PLANNING_INPUT_NEEDED
PLANNING_DISCOVERY_NEEDED
PLANNING_BLOCKED
PLANNING_INVALID
```

- `PLANNING_READY`: every applicable planning source is current and ready.
- `PLANNING_IN_PROGRESS`: Codex can produce the next missing technical source.
- `PLANNING_INPUT_NEEDED`: one permitted business/product/external fact is
  unavailable from project evidence.
- `PLANNING_DISCOVERY_NEEDED`: bounded technical inspection is required before
  structural planning can continue.
- `PLANNING_BLOCKED`: a required source is blocked or a stronger project rule
  prevents progression.
- `PLANNING_INVALID`: evidence is contradictory, stale, unsafe, malformed, or
  belongs to another task/project/intent.

The projection reports one deterministic first blocker while retaining all
diagnostic blockers in structured evidence.

## Execution Entry Contract

Only `PLANNING_READY` may carry an Execution Entry Contract.

The contract binds:

```text
project_identity_digest
source_revision_digest
task_ref
intent_digest
task_impact
source_bindings_for_every_required_current_authority
planning_closure_ref_and_digest
```

It always records:

```text
authorizes_implementation = No
authorizes_project_writes = No
authorizes_apply = No
authorizes_release = No
authorizes_production = No
requires_pre_write_revalidation = Yes
```

It is an exact handoff description for a later controlled execution layer, not
a permission token. Any project, task, intent, source, plan, boundary, review,
or verification drift invalidates it.

## Operating Model Integration

The ordinary public command remains `work`.

For task continuation/status routes, the Operating Model consumes Planning
Closure as one source and returns:

- what Codex currently understands;
- whether planning is ready;
- the plain reason when it is not ready;
- the next automatic technical step;
- whether user input is genuinely needed;
- confirmation that no implementation authority is created by this result.

Advanced diagnostic commands may expose:

```text
planning-closure
planning-closure-check
execution-entry-contract-check
```

These are not ordinary-user workflow choices.

## New Assets

```text
core/understanding-planning-closure.md
docs/understanding-planning-closure.md
templates/planning-closure-report.md
prompts/planning-closure-agent.md
checklists/planning-closure-review.md
planning-closure-reports/.gitkeep
schemas/artifacts/planning-closure.schema.json
scripts/lib/planning-closure.mjs
scripts/resolve-planning-closure.mjs
scripts/check-planning-closure.mjs
scripts/check-execution-entry-contract.mjs
tests/understanding-planning-closure.test.mjs
tests/understanding-planning-consumer-chain.test.mjs
tests/understanding-planning-public-ux.test.mjs
releases/1.111.0/*
```

## Existing Assets To Update

```text
scripts/resolve-operating-loop.mjs
scripts/cli.mjs
scripts/new-workflow-item.mjs
scripts/check-intentos.mjs
core/review-context-authority.json
intentos-manifest.json
package.json
README.md
README.zh-CN.md
VERSION.md
docs/README.md
docs/plans/README.md
docs/reference/artifacts.md
docs/reference/checkers.md
docs/reference/scripts.md
.github/workflows/intentos-pr-checks.yml
.github/workflows/intentos-release-checks.yml
templates/review-packet.md
templates/gpt-review-prompt.md
templates/version-record.md
templates/workflow-version.json
starters/**
```

Task Governance, Plan Review, Verification Plan, and Control Effectiveness
schemas are changed only if an exact consumer binding is missing. 1.111 does
not add new Work Queue, Review Surface, provider receipt, lineage, scheduler,
or migration schemas.

## Implementation Phases

### Phase 1: Core Projection

1. Add strict Planning Closure schema and shared resolver logic.
2. Resolve the current Work Queue item without mutating it.
3. Resolve Task Governance and derive exact applicability.
4. Validate required sources through existing schemas/checkers.
5. Derive one deterministic state and first blocker.
6. Emit a non-authorizing contract only for `PLANNING_READY`.

### Phase 2: Consumer Integration

1. Add independent Planning Closure and contract checkers.
2. Bind the Operating Model and advanced CLI commands.
3. Add artifact creation support without making it public workflow syntax.
4. Register Guidance Authority and Manifest distribution.
5. Distribute the same assets to all four Codex starters.

### Phase 3: Acceptance And Release

1. Add positive and negative fixtures/tests.
2. Verify LOW/MEDIUM/HIGH/POSSIBLE_HIGH behavior.
3. Verify absent, skipped, stale, unsafe, and mismatched source rejection.
4. Verify no contract for partial/discovery/blocked/invalid states.
5. Verify no technical decision is delegated to the user.
6. Run target-local starter parity and full `npm run verify`.
7. Record exact release evidence and known limitations.

## Acceptance Matrix

### Core

1. Exactly one current task is consumed.
2. No current task or multiple current tasks block.
3. Task and intent mismatch is invalid.
4. Task Governance controls depth and cannot be downgraded by Goal Mode.
5. Missing required sources do not disappear because a producer is absent.
6. A source cannot certify itself through an unvalidated `PASS` string.
7. 1.110 control proof is required exactly when routed.

### Planning Depth

1. LOW remains lightweight and may use a governed no-plan reason.
2. MEDIUM requires its targeted durable sources.
3. POSSIBLE_HIGH cannot become ready.
4. HIGH requires every routed source and required review evidence.
5. Stronger project-native rules may increase but never reduce requirements.

### Contract

1. Only `PLANNING_READY` emits a contract.
2. The contract binds the exact closure and source evidence.
3. Every authority field remains `No`.
4. Contract checking rejects source drift and identity mismatch.
5. A contract cannot be reused as write, apply, release, or production
   permission.

### Evidence

1. Missing report fails strict mode.
2. Empty or placeholder evidence fails.
3. Unsafe path, symlink escape, or outside-project reference fails.
4. Stale source revision fails.
5. Wrong project/task/intent fails.
6. Skipped required source fails.
7. Conflicting source outcomes fail.
8. Historical pre-1.111 evidence cannot support a current ready result.

### User Experience

1. Ordinary users continue to use natural language through `work`.
2. Output contains no request to choose tiers, commands, schemas, tests,
   reviewers, platforms, baselines, or implementation approaches.
3. Technical work remains Codex-owned.
4. Only unavailable business/product/external facts create a user question.
5. The output clearly says whether code changed and what happens next.

### Distribution

1. Source repository checks pass.
2. Generic, Web, iOS, and Android starters contain complete current assets.
3. Generated-project tests do not import source-only modules.
4. Manifest and review-context current/history signals agree on `1.111.0`.
5. `npm run verify` and `git diff --check` pass.

## Review Plan

Review surfaces:

1. authority and no-second-workflow boundary;
2. task/source identity and path safety;
3. task-proportionate source applicability;
4. 1.110 Control Effectiveness consumption;
5. non-authorizing contract semantics;
6. zero-experience public output;
7. starter and installed distribution parity;
8. release claims and known limitations.

P0, P1, and invariant-breaking P2 findings block release. Corrections must
change the coherent source contract, not append compatibility exceptions.

## Stop Conditions

Implementation or release stops when:

1. current Project Entry or Work Queue identity is ambiguous;
2. a required authority cannot be validated;
3. Planning Closure duplicates or overrides an existing authority;
4. partial planning emits an Execution Entry Contract;
5. any contract field authorizes a mutable action;
6. public output delegates technical decisions to the user;
7. starter/generated parity fails;
8. full verification fails.

## Allowed Claims

After acceptance, IntentOS may claim:

- current-task planning obligations are derived from existing authorities;
- required current planning evidence is checked before planning is called
  ready;
- partial, discovery, blocked, and invalid planning cannot emit an execution
  entry contract;
- a ready contract is exact, current, and explicitly non-authorizing;
- ordinary users do not need to operate internal planning commands.

## Forbidden Claims

IntentOS must not claim:

- every plan is correct or complete in an absolute sense;
- Planning Closure authorizes implementation;
- a contract guarantees execution correctness;
- tests ran or implementation completed;
- release or production is approved;
- every possible business or engineering omission is impossible.

## Completion Rule

1.111 is complete only when:

```text
one current task and intent are bound
AND Task Governance determines planning depth
AND every routed source is current, valid, and task-matched
AND relied-on controls use exact 1.110 evidence
AND Planning Closure derives one deterministic state
AND only PLANNING_READY emits a contract
AND the contract remains non-authorizing
AND Operating Model exposes one plain next step
AND zero-experience users make no technical workflow decisions
AND source and four starter distributions pass independently
AND full verification and release evidence pass
```

## IntentOS Principles Review

The reviewed design aligns with:

- natural-language first;
- zero-experience solo use;
- Codex-owned technical decisions;
- one existing authority per concern;
- task-proportionate governance;
- evidence before readiness claims;
- planning/execution separation;
- project, platform, and business neutrality;
- no patch-style subsystem accumulation.

Review outcome:

```text
DESIGN_REBASED_ON_1.110
IMPLEMENTED_AND_ACCEPTED_AS_1.111.0
```
