# Release 1.37.0

## Theme

Conversation-Native Ask.

This release makes IntentOS treat a user's plain project goal as the default entry path.

## What Changed

- Added Conversation-Native Ask governance so Codex should route natural-language project goals through Beginner Entry behavior.
- Added Conversation Ask Card template and review checklist.
- Added a prompt for agents that should not make users choose internal workflow commands before starting.
- Added `conversation-ask-cards/` as optional durable evidence.
- Added `scripts/check-conversation-native-ask.mjs`.
- Added examples and bad fixtures for write overclaims, CLI burden, and excessive questions.
- Updated CLI, docs, manifest, generated-project assets, CI/verify coverage, and README references.

## What Did Not Change

- No target-project files are written by Conversation-Native Ask.
- No apply action is authorized.
- No implementation, release, production, CI, hook, document cleanup, task-state, baseline activation, industrial pack, or high-risk decision is approved.
- `apply-plan` remains plan-first and non-executing.
- The `ask` CLI remains available for evidence and maintainer use.

## Intended User Experience

The user can say:

```text
我想做一个预约 App，你帮我开始。
```

Codex should understand this as entry intent, read the project safely, and return a plain next-step recommendation instead of asking the user to learn command names first.

## Verification

- `node scripts/check-conversation-native-ask.mjs .`
- `node scripts/check-conversation-native-ask.mjs examples/1.37-conversation-native-ask`
- `node scripts/check-intentos.mjs`
- `npm run verify:release`
- `git diff --check`

## Boundary

1.37.0 is a conversational entry governance release. It is not an approved apply runner, production validation claim, or automatic execution system.

## Allowed Claims

- IntentOS can treat a plain user project goal as the default entry path.
- Codex can route conversational project goals through Beginner Entry behavior without requiring users to choose workflow command names first.
- Conversation Ask Cards can provide optional durable evidence for the routing decision.
- `scripts/check-conversation-native-ask.mjs` validates Conversation-Native Ask assets, examples, and boundary failures.

## Forbidden Claims

- Do not claim Conversation-Native Ask writes target-project files.
- Do not claim Conversation-Native Ask authorizes apply, implementation, release, production, CI, hooks, document cleanup, task-state changes, baseline activation, industrial packs, or high-risk decisions.
- Do not claim ordinary users must run CLI commands before Codex can understand a project goal.
- Do not claim this release adds an approved automatic execution runner.

## Evidence Status

- Release evidence is expected to pass through `releases/1.37.0/self-check-report.md`.
- Source checks include Conversation-Native Ask checker coverage, generated-project workflow checks, manifest consistency, and release verification.
- Example evidence is synthetic workflow evidence, not production validation.

## Known Limitations

- Conversation-Native Ask improves entry behavior; it does not replace human decisions about scope, risk, baseline level, writes, or release.
- CLI commands remain useful for maintainers, CI, and durable evidence, but should not be exposed as a required first step for ordinary users.
- Existing governed or production-sensitive projects still need read-only assessment or adapter flow before any write proposal.
- The release validates workflow assets and examples; it does not prove real project delivery quality by itself.
