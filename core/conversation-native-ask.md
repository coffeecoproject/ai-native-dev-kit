# Conversation-Native Ask Governance

Conversation-Native Ask makes Beginner Entry the default conversational behavior.

When a user states a project goal in natural language, Codex should treat that as an ask-style entry unless the user explicitly says they only want to discuss, review, or inspect.

## Purpose

- Let users start with ordinary language instead of workflow commands.
- Keep Beginner Entry as the internal routing layer.
- Prevent Codex from pushing CLI commands back to non-technical users.
- Preserve all no-write, no-apply, no-release, and high-risk decision boundaries.

## Trigger Rule

Use Conversation-Native Ask when the user says things like:

```text
我想做一个预约 App
帮我把这个老项目接入 IntentOS
这个任务做到一半，我想先换一个方向
我做完了，帮我收口
```

Codex should internally behave as if it ran Beginner Entry:

```text
user natural-language goal -> Beginner Entry -> Workflow Guidance -> safe next path
```

Codex should not require the user to first run:

```bash
node scripts/cli.mjs ask ...
```

The command is available for evidence, CI, and maintainer debugging. It is not the default user burden.

## Non-Trigger Rule

Do not auto-enter execution routing when the user clearly asks to:

- only discuss;
- only review;
- only inspect;
- compare options;
- pause or stop;
- ask a conceptual question.

For those cases, answer the question or use Conversation Drift Control before recommending action.

## Required Behavior

Conversation-Native Ask must:

- restate what Codex understood;
- identify the safest plain-language path;
- ask at most one plain business question and ask none for technical choices;
- say what Codex can safely do next;
- say what Codex must not do yet;
- keep internal workflow names out of the default user surface;
- route writes through Unified Apply Plan or a specialized plan-first protocol;
- run implementation, CI-safe project work, document governance, baseline selection, and technical risk controls through internal gates; ask only for missing business/external facts or consent to a concrete production/external effect.

## Relationship To Beginner Entry

Conversation-Native Ask does not replace Beginner Entry.

It defines when Codex should automatically use Beginner Entry from conversation.

The durable output may be recorded as a Conversation Ask Card or a Beginner Entry Card. Both are routing evidence only.

## Boundary

A Conversation Ask Card does not:

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

When a durable card is needed, include:

- Human Decision Summary
- User Goal
- Trigger Classification
- What I Understood
- Recommended Path
- What I Need From You
- What Codex Can Do Next
- What Codex Must Not Do Yet
- Internal Routing
- Boundary
- Outcome
