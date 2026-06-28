# 1.18.0 Known Limitations

- This release improves selector precision, but it is still heuristic.
- Platform states are recommendations and do not prove which platforms are
  currently in scope for a task.
- Mini Program cloud functions mark backend/API scope as possible; they do not
  automatically select the backend baseline.
- Internal-admin detection is stricter, but unusual project layouts may still
  need human confirmation.
- BL2 remains candidate-only until selected packs, evidence, residual risk, and
  human approval are recorded.
- No target-project write approval, implementation approval, release approval,
  production approval, or real-project production validation is included.

