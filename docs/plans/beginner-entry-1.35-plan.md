# 1.35.0 Beginner Entry Plan

## Theme

`1.35.0` adds a beginner-friendly natural language entry so users can start with one sentence without understanding the internal workflow map.

## Problem

The workflow is now broad enough that users may see too many correct but technical suggestions:

- run guide;
- run baseline decision;
- run workflow map;
- run apply plan;
- run work queue;
- run closure.

That is still too much user burden.

## Goal

Add one front door:

```bash
node scripts/cli.mjs ask ../my-project "我想做一个预约 App"
```

Codex should internally route through existing governance, then return one Beginner Entry Card.

## Scope

Add:

- `core/beginner-entry.md`
- `docs/beginner-entry.md`
- `templates/beginner-entry-card.md`
- `checklists/beginner-entry-review.md`
- `prompts/beginner-entry-agent.md`
- `beginner-entry-cards/`
- `scripts/resolve-beginner-entry.mjs`
- `scripts/check-beginner-entry.mjs`
- CLI entries `ask` and `ask-check`
- example and bad fixtures
- README, manifest, CI, starter, and release evidence coverage

## Non-Goals

This release does not:

- replace Workflow Guidance;
- add a new write executor;
- approve target-project writes;
- approve implementation;
- approve release or production;
- hide required human decisions;
- make baseline or industrial packs active;
- install hooks;
- modify CI;
- archive/delete documents;
- change task state.

## Acceptance Criteria

- `ask` accepts one natural-language goal without requiring `--deep` or `--intent`.
- The output is understandable without workflow jargon.
- The card asks at most 3 questions by default.
- The card clearly says Codex cannot write yet.
- Technical routing is still available for Codex/reviewer evidence.
- Bad fixtures reject write authorization and jargon leakage.
- Generated projects include the new assets.
- Full dev-kit verification passes.
