# Beginner Entry

Beginner Entry is the simplest way to use the workflow.

The user gives one sentence. Codex reads the project and returns one plain card.

In 1.37, this is also the default conversation behavior. The user can simply say the goal in chat; Codex should internally route through Beginner Entry instead of making the user run a command first.

```bash
node scripts/cli.mjs ask ../my-project "我想做一个预约 App"
```

The user does not need to know whether Codex should run guidance, baseline selection, workflow mapping, task queue, apply planning, or closure. Codex decides the internal route and explains the recommendation in normal language.

## What It Solves

Before this layer, a user might need to know commands such as:

```text
guide
start
baseline-decision
workflow-map
apply-plan
work-queue
closure
```

Beginner Entry makes that unnecessary for normal use.

## What Users See

The card answers:

- what Codex understood;
- what the safest path is;
- what needs human confirmation;
- what Codex can safely do next;
- what Codex must not do yet;
- whether anything can be changed now.

## What Codex Does Internally

Codex may use the existing read-only guidance system and downstream resolvers. The result is compressed back into one card.

This is routing and explanation only. It does not approve execution.

## Commands

```bash
node scripts/cli.mjs ask ../my-project "我想做一个预约 App"
node scripts/cli.mjs ask ../my-project --goal "帮我把这个老项目接入 IntentOS"
node scripts/cli.mjs ask-check ../my-project
```

For JSON:

```bash
node scripts/resolve-beginner-entry.mjs ../my-project --goal "我想做一个预约 App" --json
```

## Boundaries

Beginner Entry does not write target files, authorize apply, approve implementation, approve release/production, install hooks, modify CI, delete/archive documents, change task state, or enable baseline/industrial packs.

If a write may be needed, Codex should recommend a plan-first step and then use Unified Apply Plan or an existing specialized apply protocol.
