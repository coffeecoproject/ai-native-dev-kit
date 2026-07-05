# Conversation-Native Ask 1.37 Plan

## Goal

Make IntentOS usable from ordinary conversation.

The user should be able to say:

```text
我想做一个预约 App，你帮我开始
```

Codex should treat that as an entry request, internally route through Beginner Entry, and return a plain safe path without requiring the user to know workflow commands.

## Problem

1.35 introduced `ask`, but it is still documented as a CLI command.

That lowers the barrier for maintainers, but a non-technical user still has to know that `ask` exists.

The expected product behavior is:

```text
natural-language goal -> Codex understands entry intent -> Beginner Entry behavior -> safe next path
```

## Scope

This phase adds:

- `core/conversation-native-ask.md`
- `docs/conversation-native-ask.md`
- `templates/conversation-ask-card.md`
- `checklists/conversation-native-ask-review.md`
- `prompts/conversation-native-ask-agent.md`
- `conversation-ask-cards/`
- `scripts/check-conversation-native-ask.mjs`
- 1.37 examples, bad fixtures, manifest coverage, generated-project copy support, CI/verify hooks, README/docs references, and release evidence

## Non-Scope

This phase does not:

- add an automatic write executor;
- make `apply-plan` executable;
- approve target-project writes;
- approve implementation;
- approve release or production;
- install hooks;
- modify CI in target projects;
- delete, move, archive, or rewrite documents;
- change task state;
- enable baseline packs or industrial packs;
- approve high-risk decisions;
- remove the CLI `ask` command.

## Behavior

When a user gives a natural-language project goal, Codex should:

1. classify whether it is a project goal or a discussion/review/pause-only turn;
2. if it is a project goal, route through Beginner Entry behavior;
3. read project state in read-only mode;
4. return a plain recommendation with at most 3 questions;
5. avoid pushing command names onto the user;
6. stop before any write-capable action unless a plan-first protocol and human approval exist.

## Evidence Contract

Durable evidence can be recorded as a Conversation Ask Card.

The checker rejects:

- write authorization;
- apply authorization;
- implementation approval;
- release/production approval;
- CI/hook changes;
- document delete/archive/rewrite claims;
- task-state changes;
- baseline/industrial pack enablement;
- high-risk decision approval;
- requiring the user to run CLI commands first;
- more than 3 questions;
- internal command burden in the user-facing surface.

## Verification Plan

Run:

```bash
node scripts/check-conversation-native-ask.mjs .
node scripts/check-conversation-native-ask.mjs examples/1.37-conversation-native-ask
node scripts/check-intentos.mjs
npm run verify:release
git diff --check
```

## Success Criteria

- Conversation-Native Ask is documented as the default conversational entry.
- Beginner Entry remains the internal routing layer.
- CLI commands remain available for evidence and maintainers, not as a user burden.
- Generated projects receive the new governance assets.
- Bad fixtures prove the checker rejects unsafe or command-centric behavior.
