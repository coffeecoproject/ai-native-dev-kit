# Change Boundary

Change Boundary records what a task is allowed to change and compares that intended boundary with the actual changed files.

It is a review and evidence layer. It is not operating-system sandboxing and does not guarantee that AI can never write outside scope.

## Core Rule

Codex must not treat a task as complete when the actual diff exceeds the approved task boundary.

If actual changes differ from the approved task boundary, Codex must report the drift and stop for review, revert guidance, or human decision.

## Boundary Levels

| Level | Meaning | Required Behavior |
|---|---|---|
| `CB0_ADVISORY` | low-risk local task | final report records whether unexpected files changed |
| `CB1_RECORDED` | normal project task | task records allowed and forbidden scope |
| `CB2_CHECKED` | non-trivial, governed, or multi-file change | change-boundary report required |
| `CB3_HUMAN_APPROVED` | high-risk or sensitive surfaces | human approval scope required before implementation |

Recommended mapping:

- L0: `CB0_ADVISORY`
- L1: `CB1_RECORDED`
- L2: `CB2_CHECKED`
- L3: `CB3_HUMAN_APPROVED`

## Required Boundary Fields

Use these fields in a task or change-boundary report when boundary tracking matters:

```text
Boundary level:
Allowed paths:
Forbidden paths:
Allowed change types:
Forbidden change types:
Expected diff scale:
Out-of-scope but related:
```

## High-Risk Boundary Surfaces

Changes require explicit human approval when they touch:

- auth or permission;
- data migration or destructive data operation;
- production config;
- release or rollback;
- payment or value transfer;
- privacy, security, compliance, legal, tax, or regulated data;
- CI gate weakening;
- dependency changes;
- secrets;
- app signing or platform release;
- generated assets without regeneration evidence.

## Diff Report Outcomes

| Outcome | Meaning | AI behavior |
|---|---|---|
| `PASS` | actual changed files match approved boundary | may continue to verification/review |
| `NEEDS_REVIEW` | unexpected but low/medium-risk drift needs review | stop and report |
| `NEEDS_REVERT` | unrelated or forbidden changes should be reverted before closure | stop and report |
| `NEEDS_HUMAN_DECISION` | boundary change touches high-risk or scope decision | stop for human decision |

## Relationship To Existing Protocols

- Conversation Drift prevents user messages from silently widening scope.
- Next-Step Boundary prevents suggestions from becoming implementation approval.
- Patch Classification decides whether the repair should be a patch at all.
- Review Loop checks whether findings can be fixed in the current task.
- Launch Readiness must not claim readiness when required boundary checks fail.

Change Boundary does not approve implementation, release, launch, production, risk acceptance, or target-project writes.

