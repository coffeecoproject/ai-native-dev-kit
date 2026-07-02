# Closure Decision Review

- [ ] There is exactly one final closure decision for the task.
- [ ] The decision is one of `DONE`, `NOT_DONE`, `NEEDS_EVIDENCE`, `NEEDS_IMPACT_COVERAGE`, `NEEDS_HUMAN_DECISION`, or `BLOCKED`.
- [ ] Change Impact Coverage, Execution Closure, Guided Closure, and Evidence Precision are treated as inputs, not competing final truths.
- [ ] `DONE` is not claimed without passing verification evidence.
- [ ] `DONE` is not claimed when related surfaces are missing.
- [ ] High-risk scope does not close without human decision.
- [ ] Boundaries remain `No` for apply, commit, push, release, production, CI, hooks, and high-risk decisions.
