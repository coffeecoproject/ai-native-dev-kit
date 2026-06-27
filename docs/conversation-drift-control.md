# Conversation Drift Control

Conversation Drift Control is for the moments when a project conversation changes direction.

Examples:

- The user asks a side question while Codex is implementing.
- The user says "also add payments" in the middle of a UI task.
- The user asks "can this go live?" after a demo task.
- The user says "wait, just discuss first."

## Plain Meaning

Before Codex continues, it asks:

```text
Is this still the same task?
```

If yes, Codex continues.

If no, Codex stops, explains the boundary, and asks for a decision or creates a scope change report.

## What This Prevents

- discussion becoming accidental permission
- new work sneaking into the current task
- risk decisions being handled by Codex alone
- follow-up ideas being executed without approval
- old task evidence being used for new scope

## Command

Run:

```bash
node scripts/check-conversation-drift.mjs .
```

Or through the CLI:

```bash
node scripts/cli.mjs conversation-drift .
```

The checker allows projects with no conversation classification artifacts to pass. It becomes strict once `conversation-turns/` or `scope-change-reports/` contains reports.
