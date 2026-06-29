# Known Limitations: 1.24.0

- The orchestrator recommends the next safe workflow path; it does not automatically apply that path.
- Plain mode hides internal workflow names, so maintainers should use `--mode developer` or `--mode maintainer` when they need command-level routing evidence.
- Project state detection is signal-based and conservative. Unknown or risk-sensitive projects may be routed to read-only planning even when a human later confirms a lower-risk path.
- The guidance checker validates recorded Workflow Guidance Cards. It does not prove that a real target project is production ready.
- The orchestrator does not replace existing governed-project adoption, document lifecycle, work queue, hook plan, or launch readiness checks.

