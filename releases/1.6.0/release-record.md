# Release Record 1.6.0

## Human Summary

`1.6.0` adds Conversation Drift Control.

It helps Codex classify user messages before acting, so discussion, new scope, direct follow-ups, and risk decisions do not silently become current-task execution.

## Included

- `core/conversation-drift-control.md`
- `templates/conversation-turn-classification.md`
- `templates/scope-change-report.md`
- `checklists/conversation-drift-review.md`
- `prompts/conversation-router-agent.md`
- `docs/conversation-drift-control.md`
- `conversation-turns/`
- `scope-change-reports/`
- `scripts/check-conversation-drift.mjs`
- CLI command `conversation-drift`
- examples and bad fixtures

## Not Included

- no chatbot state engine
- no external memory store
- no automatic scope approval
- no production or release approval

## Verification

```text
node scripts/check-conversation-drift.mjs .
node scripts/check-conversation-drift.mjs examples/1.6-conversation-drift-control
node scripts/check-conversation-drift.mjs test-fixtures/bad/bad-conversation-discuss-only-writes
node scripts/check-conversation-drift.mjs test-fixtures/bad/bad-conversation-scope-creep
node scripts/check-conversation-drift.mjs test-fixtures/bad/bad-conversation-risk-auto-continue
```

The bad fixture commands are expected to fail.

## Allowed Claims

- `1.6.0` adds Conversation Drift Control assets and checks.
- Conversation turn classification can route discussion-only, review-only, scope-change, new-task, direct-follow-up, risk-decision, and pause/stop turns.
- The checker rejects discussion-only writes, scope changes without human decision, and risk decisions that auto-continue.

## Forbidden Claims

- Do not claim perfect intent detection.
- Do not claim automatic scope approval.
- Do not claim production or release approval.
- Do not claim external GPT/API hook automation.

## Evidence Status

Source repo checks, good example, and bad fixtures exist. Real-project adoption evidence remains future work.

## Known Limitations

See `releases/1.6.0/known-limitations.md`.

## Human Boundary

Codex classifies and recommends routing. Humans decide scope changes, risk acceptance, launch, release, and cancellation.
