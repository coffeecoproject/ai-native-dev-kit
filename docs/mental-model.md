# IntentOS Mental Model

## One Public Entry

The ordinary user does not assemble an IntentOS workflow. The user states the
goal in natural language:

```text
work <what should become true>
```

Codex reads the project, recovers current work, derives the technical path,
performs the allowed work, verifies it, and reports one plain next action or
completion conclusion.

Internal commands, reports, schemas, profiles, baseline levels, industrial
packs, review roles, and evidence systems are implementation details selected
by IntentOS/Codex.

## User And Codex Roles

The zero-experience solo user is the source of:

- the business goal;
- unavailable business facts;
- product preferences between valid outcomes;
- unavailable authoritative external facts;
- consent to one exact, prepared real-world effect.

Codex is responsible for:

- project and code inspection;
- platform, Profile, baseline, BL level, and pack selection;
- architecture, stack, dependencies, migrations, and engineering rules;
- task classification, planning, implementation, verification, and review;
- technical risk treatment, release-readiness analysis, evidence, repair, and
  rollback preparation.

Technical ambiguity is not a reason to ask the user to choose a technical
option. Codex continues bounded inspection, selects the evidence-backed option,
or records a technical blocker.

## Internal Operating Meanings

IntentOS derives one current operation:

```text
DISCUSS
START_OR_ADOPT
PLAN_WORK
EXECUTE_WORK
VERIFY_OR_REVIEW
PREPARE_RELEASE
```

These meanings help Codex route work. They are not modes the user must learn,
not a mandatory six-stage lifecycle, and not separate sources of truth.

## Source Systems, Not One Giant Workflow

IntentOS contains specialized source systems for different questions:

| Question | Source system examples |
|---|---|
| May the project be entered or adopted? | Project Entry Trust, adoption and reconciliation evidence |
| What is the current task? | Work Queue or verified project-native task system |
| How much governance is required? | Task Governance |
| What business and technical scope is affected? | Business Universe, Business Rule, Change Impact |
| Is the plan ready? | Plan Review, Planning Closure |
| What must be verified? | Verification Plan |
| Did the right code run in the right environment? | Runtime Trust, Test Evidence |
| Did implementation and controls really hold? | Execution Assurance, Control Effectiveness |
| Is the task complete? | Completion Evidence, Unified Closure |
| Is release technically prepared? | Launch Review and release evidence systems |
| May bounded project writes occur? | Unified Apply Plan and Controlled Apply Readiness |

The public Operating Model summarizes these systems. It does not replace their
authority or smooth over a stricter, missing, or blocked result.

## Project Depth

Codex derives the smallest sufficient governance depth from project evidence.

```text
BL0 = lightweight project governance
BL1 = standard project governance
BL2 = industrial project governance with evidence
```

BL depth is not selected by the user and does not imply a team. A solo project
may require BL2 when production, sensitive data, permissions, payments,
destructive behavior, regulation, release risk, or long-term operational
reliability demand it.

Profiles and industrial packs tune platform and risk requirements. Codex selects
only applicable packs and proves that selected requirements are actually
satisfied; availability alone does not expand product scope.

## New Projects

For a new project, Codex:

1. derives the project goal and platform from natural language;
2. selects the baseline depth and applicable packs;
3. initializes project and IntentOS assets atomically;
4. verifies generated-project guidance and project identity;
5. creates or recovers the first current task;
6. routes the first ordinary task through the risk-proportional chain.

The user is not asked to choose starter internals, platform profiles, BL level,
packs, test tools, or workflow commands.

## Existing Projects

For an existing project, Codex:

1. enters read-only and identifies current project authority;
2. maps existing baselines, tasks, CI, release, runtime, and business rules;
3. compares them with IntentOS requirements;
4. preserves stronger valid controls;
5. repairs weak, missing, duplicate, or contradictory governance through a
   bounded plan;
6. proves that selected adoption actions were applied and remain active.

Existing files are evidence, not automatic authority. IntentOS does not preserve
an unreliable legacy process merely because it is old, and it does not overwrite
a stronger process merely because its filename differs.

## Task Depth

Task Governance derives LOW, MEDIUM, POSSIBLE_HIGH, or HIGH from actual impact.
Every task still receives a bounded change, targeted verification, diff review,
and authoritative completion decision.

Higher depth adds durable planning, wider impact coverage, stronger runtime and
evidence identity, independent challenge, and rollback preparation. It does not
add technical choices for the user.

## Subagents And Review

Subagents are internal roles, not people the user manages.

```text
Builder   -> implements inside the boundary
Verifier  -> independently executes verification
Challenger -> attempts to disprove the result
```

IntentOS decides when these roles are needed. The default write rule remains:

```text
Many readers, one writer.
```

Every Subagent is closed or skipped after handoff. A Subagent result is evidence
input, not final approval or completion authority.

## Completion And Release

Passing tests is not the same as completing a task, and completing a task is not
the same as authorizing release.

Unified Closure produces the task completion conclusion from current source
evidence. Release systems then determine technical readiness and prepare the
exact external action and rollback path.

The user does not judge technical release readiness. When a real production,
provider, cost, customer, or irreversible data effect is prepared and evidence
is ready, the user may be asked for consent to that exact effect.

## Compatibility Labels

Older artifacts may contain labels such as `Human Approval`,
`Risk Gate Exclusions`, `owner`, `human_decision`, or
`NEEDS_HUMAN_DECISION`. These names are compatibility fields, not the current
responsibility model. `Risk Gate Exclusions` records Codex-validated evidence
that a risk signal does not apply to the current task; it is not a request for
the user to waive a technical risk.

Current IntentOS interprets user input only as:

```text
NO_USER_ACTION
BUSINESS_FACT_NEEDED
REAL_WORLD_CONSENT_NEEDED
EXTERNAL_FACT_NEEDED
```

No compatibility label transfers architecture, baseline, testing, review,
technical risk, migration design, or release-readiness judgment to the user.

## The Practical Rule

Use one natural-language entry. Let IntentOS/Codex choose the internal path.
Keep source systems authoritative, require current evidence, and ask the user
only for information or real-world consent that cannot be obtained through
technical work.
