# IntentOS Development Workflow

## Purpose

IntentOS turns a natural-language product goal into bounded, executable,
verifiable, reviewable, recoverable, and traceable engineering work.

The ordinary user does not operate an internal workflow. The ordinary user
uses one public entry:

```text
work <natural-language goal>
```

Codex determines which existing source systems are applicable, completes the
technical work they require, and returns one plain-language next action or
completion conclusion.

## Responsibility Boundary

The zero-experience solo user provides:

- the real business goal;
- unavailable business facts;
- preferences between valid product outcomes;
- unavailable authoritative external facts;
- consent to one concrete, prepared real-world effect.

Codex owns:

- project inspection and current-work recovery;
- platform, Profile, baseline, BL level, and industrial-pack selection;
- architecture, stack, dependencies, schemas, and migration design;
- task classification, planning depth, review depth, and Subagent use;
- implementation, test strategy, verification, evidence, and repair;
- technical risk treatment, release-readiness analysis, and rollback
  preparation.

Missing technical evidence means Codex must inspect, plan, verify, repair, or
block with a technical reason. It is not converted into a user choice.

## Public Operating Loop

IntentOS derives one current operation from the user's natural language and the
project's current state:

```text
DISCUSS
START_OR_ADOPT
PLAN_WORK
EXECUTE_WORK
VERIFY_OR_REVIEW
PREPARE_RELEASE
```

These are internal routing meanings, not modes the user selects and not a
mandatory lifecycle shown to the user. The user may change topic, pause, resume,
ask a question, or continue an existing task. Work Queue and conversation-drift
governance preserve the current thread without treating every turn as new
implementation permission.

## Current Source Systems

The Operating Model selects and consumes existing authorities. It does not
replace them with a second workflow.

| Concern | Current authority |
|---|---|
| Safe project entry | Project Entry Trust and Project Fact Projection |
| Current task and continuity | Work Queue or verified project-native task system |
| Task depth | Task Governance |
| Scope and boundaries | Change Boundary and Change Impact Coverage |
| Business completeness | Business Universe Coverage and Business Rule Closure |
| Engineering constraints | Project baselines and Existing Rule Reconciliation |
| Plan readiness | Plan Review and Understanding And Planning Closure |
| Verification obligations | Verification Plan |
| Runtime provenance | Verification Runtime Trust and Test Evidence |
| Independent challenge | Review Surface, Review Loop, and Subagent Orchestration |
| Execution truth | Execution Assurance and Control Effectiveness |
| Final completion | Completion Evidence and Unified Closure |
| Release preparation | Launch Review, Release Plan, and release evidence systems |
| Controlled project writes | Unified Apply Plan and Controlled Apply Readiness |

Each source system remains authoritative for its own question. A derived view
may summarize source results but cannot override, weaken, or authorize them.

## Risk-Proportional Task Chain

Task Governance selects the required chain from current project evidence.

### LOW

Use a lightweight but complete path:

- bind the current task and intent;
- define a bounded change;
- inspect the affected code and project rules;
- implement without unrelated changes;
- run targeted verification;
- review the actual diff and evidence;
- close only through the current completion authority.

LOW does not mean unchecked, self-declared, or exempt from completion evidence.

### MEDIUM

Add durable planning, impact coverage, verification planning, targeted review,
and exact evidence binding. Business or runtime sources are required when Task
Governance finds them applicable.

### POSSIBLE_HIGH

Codex performs bounded read-only discovery. It cannot silently downgrade the
task or begin implementation until the applicable evidence resolves the risk.

### HIGH

Use the full applicable chain, including independent review or Challenger work,
strict runtime/evidence identity, rollback preparation, and stronger
project-native controls. The zero-experience user still does not choose the
technical approach or review mechanism.

## Planning And Execution

Before project writes, Codex must have a current task, a bounded change, the
required planning sources, and a valid write boundary. Understanding And
Planning Closure may describe readiness for implementation review, but it never
authorizes writes.

During execution Codex must:

- follow the current project authority and stricter applicable rules;
- avoid unrelated refactors and scope expansion;
- prefer coherent structural changes over accumulating repair fragments;
- keep one writer when Subagents are used;
- close or skip every Subagent after handoff;
- revalidate task, source revision, plan, and boundary before controlled writes;
- record actual changes and verification rather than self-declared results.

## Verification And Review

Verification is selected from the task's real impact, not from a universal test
list. It may include static checks, unit tests, integration tests, browser or
device behavior, runtime identity, data/state checks, security checks, build,
and project-native gates.

Review must inspect the actual change and attempt to disprove the completion
claim. Review findings may be repaired automatically only when they are
deterministic, reversible, inside the approved task boundary, and followed by
re-verification. Business facts, external facts, and concrete real-world
effects use the bounded user-input classes instead of generic technical
approval.

## Completion

No implementation, test report, reviewer statement, or derived summary can
declare completion by itself.

Completion Evidence and Unified Closure must consume all applicable current
sources and reject:

- missing or stale evidence;
- evidence from another project, task, intent, source revision, or runtime;
- uncovered business categories, lifecycle paths, or affected surfaces;
- partial implementation or unverified behavior;
- unresolved findings or conflicting source conclusions;
- claims based only on file existence or narrative text.

## Release And Real-World Effects

Codex determines technical release readiness and prepares the exact action,
evidence, consequence, and rollback path. A release or other external effect is
not authorized by technical readiness.

The user is asked only for consent to the concrete prepared effect when such
consent is actually required. Provider authority, legal facts, third-party
permissions, credentials, and other external authority must be proven through
their real source; they are not inferred from a conversational claim.

## Apply And Existing Projects

For existing projects, IntentOS first discovers current authority, reconciles
rules, and preserves stronger valid project controls. Weak, missing, duplicate,
or contradictory governance is repaired through the controlled adoption path;
it is not preserved merely because it already exists.

Project writes require the existing Apply chain:

```text
Unified Apply Plan
-> Plan Review
-> Controlled Apply Readiness
-> bounded consent when a concrete real-world effect requires it
-> exact approved-graph replay
-> Apply Execution Receipt
-> post-apply activation and assurance checks
```

No plan, readiness report, or approval-compatible field is write authority by
itself.

## User Input Classes

Every user-facing request must resolve to one of:

```text
NO_USER_ACTION
BUSINESS_FACT_NEEDED
REAL_WORLD_CONSENT_NEEDED
EXTERNAL_FACT_NEEDED
```

Compatibility fields such as `Human Approval`, `human_decision`, or
`NEEDS_HUMAN_DECISION` may remain in historical schemas, but current guidance
must interpret them through these four classes. They never transfer
architecture, testing, review, baseline, risk-treatment, or release-readiness
judgment to the user.

## Learning

After a task, IntentOS may record escaped defects, repeated findings, workflow
friction, test gaps, and improvement candidates. Repeated execution patterns may
become Skill or automation proposals, but persistent/global automation and
external recurring effects require exact bounded consent before activation.

Learning artifacts inform future work. They do not silently change active
governance, enable Skills, install hooks, alter CI, or expand product scope.

## Non-Authority Rule

No workflow document, card, summary, generated file, Subagent, compatibility
label, or user statement can bypass the current project authority, applicable
source-system checks, controlled write path, release path, or final completion
authority.
