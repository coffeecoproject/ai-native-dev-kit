# Understanding And Planning Closure

Understanding And Planning Closure is the read-only planning close-out for one
current task. It consumes existing IntentOS and project-native authorities and
answers whether the task is understood and reviewed well enough to enter a
later controlled implementation review.

It is not a second workflow, Work Queue, plan authority, execution engine, or
completion system.

## Authority

- Project Entry Trust owns whether ordinary IntentOS operation is allowed.
- Work Queue or a verified project-native equivalent owns the current task.
- Task Governance owns task impact and required planning depth.
- Business, boundary, impact, verification, review, and control systems own
  their respective evidence.
- Planning Closure derives one result and never overrides a source.

## States

- `PLANNING_READY`
- `PLANNING_IN_PROGRESS`
- `PLANNING_INPUT_NEEDED`
- `PLANNING_DISCOVERY_NEEDED`
- `PLANNING_BLOCKED`
- `PLANNING_INVALID`

Only `PLANNING_READY` may include an Execution Entry Contract. That contract is
an exact handoff description and always records that it does not authorize
implementation, project writes, apply, release, or production.

## Zero-Experience Contract

The user states the goal. Codex chooses the technical planning, review, and
verification path. Only unavailable business/product facts, authoritative
external facts, or later concrete real-world consent may be requested from the
user.

## Boundaries

Planning Closure:

- writes no target files unless an explicit report output path is requested;
- changes no task state;
- runs no implementation, tests, runtime probes, Subagents, apply, or release;
- does not prove plan correctness, implementation correctness, or completion;
- does not authorize the first mutable action.

