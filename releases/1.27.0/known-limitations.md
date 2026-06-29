# 1.27.0 Known Limitations

- Debt & Knowledge Handoff is a recorded report protocol, not an automatic project scanner.
- The resolver infers obvious debt from local project signals and git state only.
- A handoff report cannot approve implementation, release, production, risk acceptance, source-of-truth changes, or task-state changes.
- D3/D4 debt still requires human decision before release review or high-risk continuation.
- This phase does not add automatic issue tracking, external GPT review, hook installation, or CI gate changes beyond existing dev-kit checks.
