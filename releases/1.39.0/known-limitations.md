# Known Limitations: 1.39.0

- Dispatch Hygiene records cleanup intent and evidence; it does not operate real helper-agent sessions.
- If the Codex surface has no explicit subagent close tool, closure is represented by run-plan status and no further work being sent.
- The checker validates recorded Subagent Run Plans. It does not inspect live tool state.
- Task drift still depends on Conversation Drift Control, Work Queue, and the main thread's judgment.
- Real multi-agent execution remains main-thread coordinated and does not become automatic scheduling.
