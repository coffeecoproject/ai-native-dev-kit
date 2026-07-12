# IntentOS 1.99.3 Known Limitations

## Semantic Review

Context conflict detection is deterministic. It rejects supported direct
contradictions but does not prove that every natural-language recommendation is
semantically correct.

## Historical Evidence

Historical review inputs without current context, project, revision, and task
identity remain readable for audit. They cannot be used as current
implementation evidence.

## External Reality

Project-local evidence cannot prove legal identity, provider authority,
regulatory facts, third-party permission, production account state, or other
external facts. Those remain external inputs when truly required.

## Verification Availability

Starter verification fails closed until the generated project has a real,
project-native verification path. IntentOS does not invent passing tests for an
unknown stack.

## Concurrent Worktree Changes

Repository verification intentionally reports unregistered source assets. A
separate concurrent task must finish or register its own files before the same
worktree can produce a clean full-repository result.
