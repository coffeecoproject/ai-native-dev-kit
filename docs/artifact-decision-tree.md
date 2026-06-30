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
| User only gives a plain-language goal and should not need workflow terms | `conversation-ask-cards/` or `beginner-entry-cards/` | apply approval or implementation permission |
| User intent needs route selection before artifacts or code | `goal-cards/` | implementation approval |
| Helper agents are used for planning, research, review, repair analysis, or reporting | `subagent-run-plans/` | permission for background agents or multiple writers |
| User asks for a change | `requests/` | approval to implement a vague request |
| Request is unclear, broad, cross-module, or risky | `preflight/` | final spec |
| Scope and behavior need to be agreed | `specs/` | implementation log |
| Acceptance needs to be testable | `evals/` | test output |
| AI needs a narrow implementation unit | `tasks/` | broad roadmap |
| Code structure, type source, contract, schema, permission, migration, dependency, or state-model rules are missing | `docs/engineering-baseline.md` or `decision-briefs/` | universal coding style guide |
| Current mainline or side ideas are drifting | `active-work-threads/` | approval to implement parked items |
| Technical choice needs to become a human-owned decision | `guided-decision-summaries/` | implementation approval |
| Actual changed files need to be proven against intended scope | `change-boundary-reports/` | permission to widen scope |
| Baselines are drafted before implementation/evidence exists | `baseline-state-reports/` | proof that the baseline is implemented |
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
goal-card when route is ambiguous, high-risk, or multi-step
->
request
-> preflight when unclear or risky
-> engineering baseline check when structural engineering decisions are touched
-> spec
-> eval
-> task
-> subagent run plan when helper agents are used
-> implementation
-> verification
-> change boundary report when actual changed files need scope proof
-> review packet when independent review is needed
-> review loop report when findings need closure
-> final report when durable result record is needed
-> AI task log for L1/L2/L3 work
```

## Goal Mode Flow

Use this before artifact creation or implementation when the human request can route in more than one way.

```text
Need discussion only?
-> DISCUSS_ONLY

Existing governed or production-sensitive project?
-> ADOPT_PROJECT
-> adoption assessment / governance map before writes

Need to turn broad work into executable artifacts?
-> DEFINE_WORK
-> request / preflight / spec / eval / task

Selected task exists and user asks to execute?
-> IMPLEMENT_TASK

Need independent review?
-> REVIEW_TASK
-> review-packet

Need to fix review findings?
-> REPAIR_TASK
-> AUTO_FIX only, max 2 rounds

Need human-owned baseline or risk decision?
-> BASELINE_DECISION
-> decision-brief

Need a status, final report, or handoff?
-> HANDOFF_OR_REPORT
```

Goal Card is route selection only. It is not approval to implement, approve risk, approve release, or bypass workflow gates.

## Subagent Flow

Use this only when helper agents are used.

```text
Need helper agents?
-> create subagent-run-plan
-> assign role and authority
-> keep many readers, one writer
-> collect handoff / findings
-> close or skip every subagent
-> run check-subagent-orchestration
```

Subagent Run Plan is a closure and authority record. It is not permission to keep background agents, leave `RUNNING` agents open, use external GPT/API reviewer automation, or let more than one writer edit the project.

## Guided Delivery Flow

Use this when a broad request, side idea, or non-expert decision needs a clear current mainline.

```text
Broad or drifting conversation?
-> active-work-thread
-> one current mainline
-> parking lot for side ideas

Technical or risk choice needs human ownership?
-> guided-decision-summary
-> recommend smallest safe path
-> D3/D4 stops until human decision
```

Active Work Thread and Guided Decision Summary are routing records. They are not approval to implement, release, migrate, change payment/privacy/security/compliance, or write target-project files.

## Change Boundary Flow

Use this after implementation when changed files need scope proof.

```text
Actual changed files are non-trivial or not obviously local?
-> change-boundary-report
-> list allowed paths
-> list forbidden paths
-> list actual changed files
-> run check-change-boundary
```

If a changed file is outside boundary, do not hide it. Classify it as human decision, follow-up, revert candidate, or intentional approved scope change.

## Baseline State Flow

Use this when Codex drafts or reviews baselines before implementation/evidence exists.

```text
Baseline is only a recommendation?
-> PROPOSED

Human has not confirmed it?
-> PENDING_CONFIRMATION

Evidence is needed before confidence?
-> EVIDENCE_REQUIRED

Human source or real evidence exists?
-> CONFIRMED
```

Baseline State is wording control. It is not proof that the baseline has been implemented across a project.

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
- Do not use a Goal Card as implementation approval.
- Do not use a Review Packet as approval.
- Do not use a Final Report as release approval.
- Do not use a Follow-up Proposal as permission to implement.
- Do not put current-task findings into Next-Step Suggestions.
- Do not put future suggestions into AUTO_FIX.
- Do not create active Skills or automations from candidate/proposal files without explicit approval.
