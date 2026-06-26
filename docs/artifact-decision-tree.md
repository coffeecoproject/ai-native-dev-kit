# Artifact Decision Tree

Use this guide when deciding which AI Native artifact to create.

The goal is not to create every file for every task. Create the smallest artifact set that makes the work understandable, reviewable, and safe.

## First Rule

Start from the work state, not from the template list.

```text
What is happening now?
-> What decision or evidence is missing?
-> Which artifact records that one thing?
```

## Common Choices

| Situation | Use | Do not use it as |
|---|---|---|
| User asks for a change | `requests/` | approval to implement a vague request |
| Request is unclear, broad, cross-module, or risky | `preflight/` | final spec |
| Scope and behavior need to be agreed | `specs/` | implementation log |
| Acceptance needs to be testable | `evals/` | test output |
| AI needs a narrow implementation unit | `tasks/` | broad roadmap |
| Code structure, type source, contract, schema, permission, migration, dependency, or state-model rules are missing | `docs/engineering-baseline.md` or `decision-briefs/` | universal coding style guide |
| AI completed L1/L2/L3 work | `ai-logs/` | final product documentation |
| A change needs independent review | `review-packets/` | approval |
| GPT Pro, a second model, or a reviewer needs a prompt | `gpt-review-prompts/` | whole-repo context dump |
| Review findings need closure, AUTO_FIX, or human routing | `review-loop-reports/` | review input |
| Codex notices directly related future work | `follow-up-proposals/` | current task authorization |
| Task result needs durable reporting beyond chat | `final-reports/` | release approval |
| Human needs to decide between options | `decision-briefs/` | implementation task |
| Workflow or baseline status must be human-readable | `status-reports/` | machine-only script output |
| Review results need a plain-language summary | `review-summaries/` | detailed Review Loop Report |
| Customer or stakeholder needs delivery context | `customer-handoffs/` | release gate |
| Release or delivery needs evidence | `releases/` | approval by itself |
| Repeated project workflow issue appears | `workflow-improvements/` | immediate dev-kit change |
| Repeated execution pattern appears | `skill-candidates/` | active Skill |
| Recurring project process may be automated | `automation-proposals/` | enabled automation |
| Shared dev-kit change is proposed | `dev-kit-proposals/` | direct core change |

## Task Flow

```text
request
-> preflight when unclear or risky
-> engineering baseline check when structural engineering decisions are touched
-> spec
-> eval
-> task
-> implementation
-> verification
-> review packet when independent review is needed
-> review loop report when findings need closure
-> final report when durable result record is needed
-> AI task log for L1/L2/L3 work
```

## Review Flow

Use this when the implementation is done and review is needed.

```text
Need independent review?
-> review-packet

Task is L2 or L3 and entering implementation closure?
-> review-packet
-> review-loop-report

Need GPT Pro / second model / read-only reviewer instruction?
-> gpt-review-prompt

Reviewer found current-task issues?
-> review-loop-report

Finding is deterministic and inside task scope?
-> AUTO_FIX, max 2 rounds

Finding touches scope, risk, architecture, dependency, permission, migration, production, release, rollback, approval, payment, or value transfer?
-> NEEDS_HUMAN_DECISION
```

Review Packet is input. Review Loop Report is process history. GPT Review Prompt is reviewer instruction.

## Engineering Baseline Flow

Use this before implementation when Codex is about to make or change project-wide engineering decisions.

```text
Task only changes local behavior?
-> follow nearby existing local pattern
-> record baseline gap if found

Task touches structure, API contract, DTO/schema/domain boundary, enum/string/lookup/state, permission, migration, dependency, generated types, or cross-module state?
-> check docs/engineering-baseline.md

Baseline answers the decision?
-> follow it

Baseline is missing or ambiguous?
-> decision-brief or Human Decisions Needed
-> do not create a new project standard silently
```

Engineering Baseline is a project source-of-truth document. It should not become a universal platform directory rule or source-code scanning gate by default.

## Next-Step Flow

Use this when Codex wants to suggest what might happen after the current task.

```text
Suggestion is inside current task and needs no new approval?
-> IN_SCOPE_NEXT_STEP

Suggestion is directly related but outside current task?
-> DIRECT_FOLLOW_UP
-> follow-up-proposal or new request

Suggestion needs human judgment or risk approval?
-> RISK_DECISION
-> decision-brief or preflight

Suggestion is useful context but not immediate work?
-> OUT_OF_SCOPE_OBSERVATION
-> record only

Suggestion is unsafe or unauthorized now?
-> DO_NOT_PROCEED
```

Next-step suggestions are not permission to continue. Only `IN_SCOPE_NEXT_STEP` can be handled inside the current task.

## Human-Facing Output

Use Output Experience when the result is complex, blocked, risky, or decision-heavy.

```text
Need status in plain language?
-> status-report

Need human choice?
-> decision-brief

Need review summary without all findings detail?
-> plain-review-summary

Need delivery context for a customer or stakeholder?
-> customer-handoff

Need durable task result?
-> final-report
```

Human-facing artifacts should start with what happened, whether AI can continue, what decision is needed, and the next safe action.

## What Not To Do

- Do not create all artifacts by default.
- Do not use a Review Packet as approval.
- Do not use a Final Report as release approval.
- Do not use a Follow-up Proposal as permission to implement.
- Do not put current-task findings into Next-Step Suggestions.
- Do not put future suggestions into AUTO_FIX.
- Do not create active Skills or automations from candidate/proposal files without explicit approval.
