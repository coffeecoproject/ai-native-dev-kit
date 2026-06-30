# Artifact Lifecycle Map

IntentOS artifacts are not meant to appear all at once.

Use the smallest artifact set that controls the current risk. Heavy artifacts only appear when the project state, risk, or requested write requires them.

## Lifecycle

```text
User goal
  -> Entry
  -> Project reading
  -> Baseline decision
  -> Task planning
  -> Execution review
  -> Closure
  -> Apply control, only when workflow or project writes need explicit planning
```

## Artifact Groups

| Stage | Typical artifacts | When they appear | Default for O0 / BL0 |
|---|---|---|---|
| Entry | Beginner Entry Card, Conversation Ask Card | User starts with a natural-language goal | Yes |
| Project reading | Workflow Guidance Card, Adoption Recommendation, Workflow Adoption Map | Codex needs to classify new, existing, governed, or production-sensitive projects | Only if project state is unclear |
| Baseline decision | Baseline Decision Card, Standard Baseline Selection, Baseline Pack Selection | Platform, risk level, or baseline level must be chosen | Usually skipped unless the task touches setup |
| Task planning | Request, Preflight, Spec, Eval, Task, Review Surface Card | Work is ready to become an executable task | Keep minimal |
| Execution review | Review Packet, Review Loop Report, Patch Classification, Debt Handoff | A task completed, failed, or needs repair classification | Only use Final Report plus basic verification unless risk rises |
| Closure | Execution Closure, Final Report, Launch Readiness | Codex must summarize changed scope, checks, debt, and next state | Yes, in lightweight form |
| Apply control | Unified Apply Plan, Controlled Apply Readiness, Approval Record | The work may write workflow assets, project governance, docs, CI, hooks, or other controlled paths | No, unless a write plan is explicitly requested |
| Repository governance | Document Lifecycle, Archive Apply Plan, Work Queue, Hook Plan, Hook Policy | The repository itself needs structure, long-running work, or automation governance | No |

## Three Operating Modes

| Mode | Default artifact set | Suitable for |
|---|---|---|
| Lite | Ask Card, minimal task note, verification note, Final Report | O0 / BL0, prototypes, small fixes, non-production work |
| Standard | Ask/Guide, Baseline Decision when needed, Review Surface, Task, Review Loop, Closure | O1 / BL1 normal product work |
| Governed | Full planning chain, Change Boundary, Baseline State, Review Loop, Apply Plan, Readiness, Approval Record | O2 / BL2, governed projects, production-sensitive work |

## Rules

- Do not create a heavier artifact just because the template exists.
- Do not expose artifact names to a beginner user unless they are needed for a decision.
- Do not treat any artifact as approval unless its boundary explicitly says so.
- Do not use Apply Plan, Apply Readiness, or Approval Record for ordinary task execution unless controlled writes are involved.
- Do not enable BL2 or industrial overlays by default.

## Relationship To Commands

Commands are evidence and maintainer tools. Ordinary users can start with a natural-language goal. Codex should route internally and present a plain-language recommendation.
