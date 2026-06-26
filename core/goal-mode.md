# Goal Mode Entry

Goal Mode is the workflow entry layer that classifies what the human is trying to do before Codex chooses artifacts or writes code.

It is a routing protocol, not execution approval.

## Purpose

Goal Mode helps Codex answer four questions:

1. Is the user asking to discuss, configure, define work, implement, review, repair, decide, or report?
2. What is the smallest safe workflow path for that goal?
3. Which artifacts must exist before AI may continue?
4. What must stay human-owned?

Goal Mode must reduce human prompt burden without weakening governance.

## Modes

| Mode | Use When | AI May Do | AI Must Not Do |
|---|---|---|---|
| `DISCUSS_ONLY` | The user asks to look, explain, evaluate, review, or discuss without execution | Read, summarize, compare, ask focused questions | Write files, run setup, create artifacts, modify code |
| `ADOPT_PROJECT` | The user wants to apply the workflow to an existing or governed project | Run or emulate `workflow-next`, map existing governance, draft read-only adoption assessment | Run `init-project`, update workflow assets, create migration reports, or edit project files while `ADOPTION_MODE: READ_ONLY` |
| `DEFINE_WORK` | The user describes a new goal, feature, bug, or product direction | Create request, preflight, spec, eval, and task candidates | Implement before the task path is ready |
| `IMPLEMENT_TASK` | A valid task card exists and the user asks to execute it | Implement exactly one approved task, run verification, report evidence | Expand scope, bypass Risk Gate, skip Engineering Baseline, or self-approve high-risk work |
| `REVIEW_TASK` | The user asks to inspect completed work or a task needs independent review | Create or read Review Packet, run read-only review, record findings | Edit files as reviewer, approve release, change risk acceptance |
| `REPAIR_TASK` | Review findings are deterministic and inside approved task scope | Fix `AUTO_FIX` findings, at most 2 rounds, then verify | Repair `NEEDS_HUMAN_DECISION`, scope expansion, dependencies, migrations, production config, architecture, permission model, Human Approval, or Approval scope |
| `BASELINE_DECISION` | Work depends on project-wide engineering, platform, BL level, industrial pack, risk, release, or approval decisions | Draft Decision Brief, compare options, list tradeoffs and next safe step | Decide for the human or change the baseline before confirmation |
| `HANDOFF_OR_REPORT` | The user needs a human-readable status, review summary, delivery note, or durable final report | Create status report, review summary, customer handoff, or final report | Treat a report as approval or start follow-up implementation |

## Goal Card

When the goal is non-trivial, Codex should create or maintain a Goal Card:

```bash
node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>
```

Goal Cards live in:

```text
goal-cards/
```

A Goal Card records:

- selected Goal Mode
- project state and adoption mode
- risk level and task level
- required artifacts
- allowed actions
- forbidden actions
- human decisions needed
- next safe step

Goal Cards are useful for new projects, old projects, review work, and handoff/reporting work. They are not required for every tiny L0 edit unless the project asks for strict entry governance.

## Required Routing Rules

### Discussion Is Read-only

If the user asks to discuss, review, evaluate, or look first, use `DISCUSS_ONLY`.

Do not create files, run setup commands, or modify the project unless the user later gives explicit execution intent.

### Existing Governed Projects Start With Adoption

If `workflow-next` reports any of these:

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
PROJECT_STATE_TAGS: GOVERNED_EXISTING_PROJECT
PROJECT_STATE_TAGS: PRODUCTION_GOVERNED_PROJECT
PROJECT_STATE_TAGS: DIRTY_WORKTREE_PROJECT
```

use `ADOPT_PROJECT`.

While read-only adoption is active:

- do not run `init-project`
- do not run `--update-workflow-assets`
- do not create migration reports
- do not edit `AGENTS.md`
- do not edit PR templates, CI, business code, production config, secrets, migrations, or deployment files

The next safe step is adoption assessment and existing governance mapping.

### Define Before Implementing

If the request is broad, vague, cross-module, high-risk, or missing acceptance criteria, use `DEFINE_WORK`.

The path is:

```text
Request -> Preflight -> Engineering Baseline when needed -> Spec -> Eval -> Task
```

Do not implement until the task card has enough scope, acceptance criteria, verification, risk handling, and human approval when needed.

### Implementation Requires A Task

Use `IMPLEMENT_TASK` only when a task card exists and is the selected execution target.

Before implementation:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready --task <task-card>
```

For high-risk implementation:

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>
```

Implementation must respect Engineering Baseline, Platform Baseline, Industrial Baseline, Risk Gate, Human Approval, and Approval scope.

### Review Is Read-only

Use `REVIEW_TASK` when the goal is review.

Review input is a Review Packet. Reviewer output is findings.

Reviewer agents, GPT Pro reviewers, and second-model reviewers must not edit files, approve release, accept risk, change scope, or modify Human Approval.

### Repair Is Narrow

Use `REPAIR_TASK` only after a Review Loop finding is classified as `AUTO_FIX`.

Repair must stay inside:

- the approved task
- the approved scope
- deterministic low-risk changes
- maximum 2 auto-fix rounds

If the same issue repeats twice, stop and route to humans.

### Baseline Decisions Stay Human-owned

Use `BASELINE_DECISION` for:

- engineering conventions
- enum / string / lookup / state-machine choices
- DTO / schema / domain boundaries
- platform profile selection
- BL level selection
- industrial pack selection
- permission, payment, privacy, migration, release, rollback, infrastructure, or production decisions

Codex may draft options and recommend a path. The human decides.

### Reports Are Not Permission

Use `HANDOFF_OR_REPORT` for durable human-facing output.

A final report, review summary, customer handoff, status report, or decision brief does not grant permission to continue implementation.

Any follow-up work must enter a valid next step:

```text
IN_SCOPE_NEXT_STEP
DIRECT_FOLLOW_UP
RISK_DECISION
OUT_OF_SCOPE_OBSERVATION
DO_NOT_PROCEED
```

## Level Guidance

| Task Level | Goal Mode Requirement |
|---|---|
| `L0` | Goal Card optional unless project requires strict entry governance |
| `L1` | Goal Card recommended when the request is broad or has multiple possible paths |
| `L2` | Goal Card recommended; Review Packet / Review Loop must be planned when implementation proceeds |
| `L3` | Goal Card required before execution; human decisions and review path must be explicit |

## Checks

Use:

```bash
node scripts/check-goal-mode.mjs .
```

The checker validates Goal Cards when they exist. It should not fail empty projects only because no Goal Card has been created.

## Non-goals

Goal Mode does not:

- execute work by itself
- replace `workflow-next`
- replace request, preflight, spec, eval, or task cards
- replace Engineering Baseline or platform/industrial baselines
- replace Review Loop
- authorize high-risk work
- create subagents automatically
- call external GPT/API reviewers

Subagent orchestration is a later layer. Goal Mode only chooses the route.
