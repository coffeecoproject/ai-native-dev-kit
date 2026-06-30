# Conversation-Native Ask

Conversation-Native Ask is the user-facing entry behavior for IntentOS.

The user should be able to say:

```text
我想做一个预约 App，你帮我开始
```

Codex should not reply by making the user learn workflow commands first. It should internally follow the Beginner Entry path, read the project in read-only mode, and return one plain recommendation.

## What This Changes

Before:

```bash
node scripts/cli.mjs ask ../my-project "我想做一个预约 App"
```

After, in normal conversation:

```text
我想做一个预约 App，你帮我开始。
```

Codex treats that as the same entry intent and produces the same kind of safe card.

The CLI still exists for maintainers, CI, examples, and recorded evidence.

## Default User Experience

Codex should answer in plain language:

- what it understood;
- what path it recommends;
- what it needs the human to confirm;
- what it can safely do next;
- what it cannot do yet.

It should not require the user to choose between `ask`, `guide`, `workflow-map`, `baseline-decision`, `apply-plan`, `work-queue`, `closure`, or other internal commands.

## When To Use It

Use this entry when the user gives a goal, such as:

- building a new product;
- adding a feature;
- adopting IntentOS in an existing project;
- resuming or switching work;
- finishing and closing out a task;
- asking Codex to figure out how to start.

Do not use it when the user clearly asks only to discuss, review, compare, or inspect without execution.

## Safe Next Step

Conversation-Native Ask is routing only.

If the next step may write files, Codex should produce or recommend a plan-first artifact. It must not treat the user's initial sentence as write approval.

## Checks

Recorded cards can be checked with:

```bash
node scripts/check-conversation-native-ask.mjs .
```

This checks that cards do not push workflow commands onto the user, do not ask too many questions, and do not approve writes, apply, implementation, release, CI, hooks, document changes, task-state changes, baseline activation, or high-risk decisions.
