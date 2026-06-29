# 1.22.0 Known Limitations

- Work Queue is a recorded state ledger, not an automatic task scheduler.
- `resolve-work-queue.mjs` is heuristic and read-only; it may recommend a queue action but does not change files.
- `check-work-queue.mjs` checks recorded reports; it does not prove the real project is free of hidden tasks.
- A paused task still needs task/spec/review evidence before implementation can continue.
- Backlog promotion still requires human decision.
- Hook orchestration is not implemented in 1.22.0.
- Work Queue does not replace Active Work Thread; it provides a stricter current/paused/backlog ledger around task state.
