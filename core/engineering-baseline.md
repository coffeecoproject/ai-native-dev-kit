# Engineering Baseline Governance

Engineering Baseline is the pre-coding governance layer for structural engineering decisions.

It answers one question:

```text
Before Codex writes code, which engineering rules may it follow, which rules must it look up, and which decisions require human approval?
```

It is not a coding style guide, platform best-practice catalog, or directory convention mandate.

## Position

```text
Before coding: Engineering Baseline
During work: IntentOS Workflow
After work: Review Loop
Final reporting: Bounded Next-Step and Output Experience
```

Engineering Baseline constrains project-wide decisions before implementation starts. Review Loop checks whether the completed work stayed inside the approved scope and evidence boundary.

## Core Rule

Codex may follow existing local project patterns for low-risk local changes.

Codex must not create, change, or upgrade project-wide engineering conventions without an explicit project source of truth or human approval.

This includes:

- new directory conventions
- new shared abstractions
- API contract patterns
- DTO / schema / domain model boundaries
- enum / string / lookup / state-machine choices
- database schema or migration rules
- permission model boundaries
- generated type sources
- new dependencies
- cross-module state patterns

## Source Of Truth

Project-specific decisions belong in project docs, not in this core protocol.

Expected project doc:

```text
docs/engineering-baseline.md
```

Related docs may include:

```text
docs/engineering-principles.md
docs/architecture.md
docs/domain-model.md
docs/permission-model.md
docs/tech-stack-strategy.md
docs/test-strategy.md
```

If the project has stronger existing governance, map this baseline to that governance instead of creating a competing standard.

## Missing Or Ambiguous Baseline

When the engineering baseline is missing or ambiguous:

- low-risk local changes may follow the nearest existing local pattern
- structural, contract, schema, permission, state-model, dependency, or migration changes must stop for a decision
- Codex should record the baseline gap in the final report, AI task log, Review Packet, or Decision Brief
- Codex must not treat a one-off implementation choice as a new project standard

## Task-Level Use

L0 / L1:

- baseline check is advisory
- Codex may continue with local patterns for local changes
- gaps should be reported

L2:

- baseline must be checked when work touches structure, types, contracts, schema, state, permission, migration, or shared abstractions
- missing critical baseline decisions should route to a Decision Brief and internal review

L3:

- baseline must be checked
- missing critical sections block implementation until project evidence, a bounded decision brief, and internal review establish the decision or exception

## Review Integration

Review Packet and Review Loop should record:

```text
Engineering baseline checked: Yes / No / Not applicable
Engineering baseline ref:
Engineering baseline gaps:
```

Reviewers should check whether the change:

- violates the project engineering baseline
- introduces an unapproved project-wide convention
- creates new DTO / schema / domain boundaries
- bypasses the approved API client or contract source
- creates enum / string / lookup / state-machine decisions without approval

## Non-Goals

Engineering Baseline does not define:

- a universal React, Vue, SwiftUI, UIKit, Kotlin, Compose, or Mini Program structure
- a universal enum / string / lookup decision
- a universal database schema pattern
- project business requirements
- test commands, build commands, or release commands
- source-code scanning gates

Platform topics may be added later in profiles or industrial packs. Strict source-code gates should be introduced only after real project dogfood and only for BL2 / strict mode.
