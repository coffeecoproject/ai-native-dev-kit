# Beginner Entry Governance

Beginner Entry is the plain-language front door for users who should not need to know IntentOS workflow commands.

It receives one user goal, reads the project in read-only mode, calls existing guidance logic, and returns one Beginner Entry Card.

Conversation-Native Ask defines when Codex should apply this behavior automatically from a normal user message.

## Purpose

- Let users describe the desired outcome in natural language.
- Let Codex choose the internal workflow route.
- Keep the user responsible only for judgment, confirmation, and risk acceptance.
- Hide internal command names from the default user-facing surface.
- Preserve all existing safety boundaries.

## Entry Rule

The user may say something like:

```text
我想做一个预约 App
帮我把这个老项目接入 IntentOS
这个任务做到一半，我先切到另一个
我做完了，帮我收口
```

Codex should not ask the user to choose between `guide`, `workflow-map`, `baseline-decision`, `apply-plan`, `work-queue`, `closure`, or other internal commands.

## Required Behavior

Beginner Entry must:

- summarize what the user wants;
- state the safest next path in non-technical wording;
- ask at most 3 human questions by default;
- explain what Codex can safely do next;
- explain what Codex cannot do yet;
- keep technical routing available for Codex/reviewer evidence;
- route through existing workflow capabilities instead of creating a parallel process.

## Internal Routing

Beginner Entry may internally use:

- Workflow Guidance;
- Baseline Decision;
- Existing Workflow Adapter;
- Review Surface;
- Delivery Path;
- Work Queue;
- Debt & Knowledge Handoff;
- Document Lifecycle;
- Unified Apply Plan;
- Hook Policy;
- Execution Closure.

These internal routes are not user approvals.

## User Surface

The default card should talk in human terms:

```text
I can first read the project and prepare a safe plan.
I should not change files until you confirm the scope.
I need you to confirm whether this is a new project or an existing/live project.
```

Avoid making the user learn internal labels such as `BL2`, `workflow-map`, `apply-plan`, `hook orchestration`, `source of truth`, or `dirty worktree`.

## Boundary

A Beginner Entry Card does not:

- write target-project files;
- authorize apply;
- approve implementation;
- approve release or production;
- install hooks;
- modify CI;
- delete, move, archive, or rewrite documents;
- change task state;
- enable baseline packs or industrial packs;
- approve security, privacy, compliance, payment, tax, legal, migration, data, hook, automation, release, or production decisions;
- grant Codex permission to continue beyond the confirmed goal.

## Output Contract

The card must include:

- Human Decision Summary
- What I Understood
- Recommended Path
- What I Need From You
- What Codex Can Do Next
- What Codex Must Not Do Yet
- Routing Evidence
- Boundary
- Outcome

## Apply Relationship

If the recommended next path may write files, Beginner Entry must stop at a plan-first recommendation.

The next write-capable step must go through Unified Apply Plan or an existing specialized plan/apply protocol.

Beginner Entry itself is never the apply approval.
