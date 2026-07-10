# Closure Decision Review

- [ ] There is exactly one final closure decision for the task.
- [ ] The decision is one of `DONE`, `NOT_DONE`, `NEEDS_EVIDENCE`, `NEEDS_IMPACT_COVERAGE`, `NEEDS_HUMAN_DECISION`, or `BLOCKED`.
- [ ] Change Impact Coverage, Execution Closure, Guided Closure, and Evidence Precision are treated as inputs, not competing final truths.
- [ ] Decision Trace explains how each input affected the final decision.
- [ ] Dominant Reason names the input that controls the final decision.
- [ ] Conflict Summary explains whether lower-level inputs disagreed and why the stricter result won.
- [ ] `DONE` is not claimed without passing verification evidence.
- [ ] `DONE` includes Input Verification rows for Verification and Execution Closure.
- [ ] The selected Execution Closure passed its exact strict checker; a path existing is not treated as proof.
- [ ] A behavior-changing `DONE` is bound to the exact, task-matched Change Impact Coverage report.
- [ ] A required Human Decision is a distinct record, not a reused execution or impact report.
- [ ] `DONE` is not claimed when related surfaces are missing.
- [ ] High-risk scope does not close without human decision.
- [ ] Boundaries remain `No` for apply, commit, push, release, production, CI, hooks, and high-risk decisions.
