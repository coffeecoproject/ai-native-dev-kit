# 1.34.0 Known Limitations

- Unified Apply Plan is plan-only; it does not execute writes.
- Action inference from natural language is conservative and heuristic.
- Specialized apply flows still require their own review and approval.
- High-risk actions are listed but not approved.
- Dirty worktree detection depends on local Git state when available.
- Real production validation is not claimed.
