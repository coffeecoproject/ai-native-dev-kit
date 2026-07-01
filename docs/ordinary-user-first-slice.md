# Ordinary User First-Slice

Ordinary User First-Slice is the plain-language path for a simple first version.

Use it when a user says something like:

```text
I want to build a booking app.
```

Codex should not ask the user to choose workflow commands. It should produce one first-slice recommendation, ask only the few decisions that matter, and keep risky items in backlog.

1.46 routes risk through the shared risk-surface library so first-slice and low-risk apply candidate decisions use the same vocabulary.

## Command Evidence

```bash
node scripts/cli.mjs first-slice . "我想做一个预约 App"
node scripts/cli.mjs first-slice-check .
```

The command is evidence for maintainers. In conversation, Codex can apply this behavior directly.

## Output Shape

- I understand you want
- I suggest the first version
- I need you to confirm
- After confirmation I can
- Not in this version
- You will get

## Boundary

This path does not write files by itself. It does not approve implementation, release, production, CI, hooks, payments, data migrations, secrets, permissions, BL2, or industrial packs.
