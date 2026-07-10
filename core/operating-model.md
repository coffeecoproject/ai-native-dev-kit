# IntentOS Operating Model

IntentOS Operating Model is the single read-only view over project entry and
the task lifecycle.

## Project Entry

Projects enter through one of two product meanings:

```text
new project initialization
existing project adoption
```

After entry, both use the same task lifecycle. Existing projects keep
rule-reconciliation and controlled-migration protections, but do not use a
separate daily development workflow.

## Operating Loop

The public meanings are:

```text
START_PROJECT
CONTINUE_TASK
CHECK_STATUS
FINISH_TASK
PREPARE_RELEASE
ADOPT_PROJECT
```

They route to existing source systems. They do not replace those systems.

## Operating Decision Contract

The Operating State includes exactly one derived Operating Decision. It names
one action code, reason, source inputs, blockers, current human-decision need,
decision digest, and invalidation conditions.

The decision selects the next safe source-system route. It is not a scheduler,
task state, evidence authority, approval, or execution permission. Unknown
blockers fail closed to governance preparation, and source-read failure
outranks every easier action.

The beginner next-step explanation is rendered from the same selected action,
so human and machine output cannot choose different routes.

## Evidence Trace

Evidence Trace explains which source systems were read, what they reported,
what is missing, and what changes would invalidate the result. `CURRENT_RUN`
means read now, not strict-checker approval.

Evidence Trace is not a new artifact and does not become evidence authority.

## Authority Recommendation

Authority Recommendation explains which project, domain, data, security,
release, production, compliance, or external-system owner may be needed before
a material action.

It cannot grant authority, approve a write, create an owner, or replace a
structured Approval Record.

## Baseline And Task Impact

Project Baseline defines project-wide engineering defaults. Task Governance
defines the process depth for the current task. BL2 does not automatically make
every task HIGH, and a low task cannot bypass a stricter applicable project
rule.

## Verification Responsibilities

```text
Verification Plan   = what must be proved
Test Evidence       = what was actually proved
Execution Assurance = whether execution matched intent, plan, diff, review,
                      and authoritative evidence bindings
```

Execution Assurance can validate Test Evidence identity and required presence.
It must not become a second test-quality evaluator.

## Boundary

The Operating Model is a derived read-only view. It does not write files,
change task state, authorize implementation, authorize apply, approve release
or production, change project authority, replace source systems, or prove
product correctness.
