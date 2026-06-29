# 1.25.0 Known Limitations

- Review surface detection is signal-based. It does not prove a full semantic understanding of every project.
- The resolver is read-only and does not create Review Surface Cards automatically.
- The checker validates recorded cards. It does not independently inspect all changed code.
- High-risk surfaces still require human confirmation.
- Post-execution results must be reported by Codex or the reviewer; the checker only verifies the card structure.
