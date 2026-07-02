# Decision Explain Trace

Decision Explain Trace makes Unified Closure Decisions explainable.

It does not create a second closure system. It explains why the single Unified Closure Decision was selected.

## Required Explanation

Every current Closure Decision should include:

- Decision Trace: how each input affected the final decision.
- Dominant Reason: the one input that controls the final result.
- Conflict Summary: whether lower-level inputs disagreed and why the stricter result won.

## Boundary

Decision Explain Trace does not:

- change the final decision enum
- approve implementation
- authorize apply
- approve commit or push
- approve release or production
- modify CI or hooks
- replace lower-level evidence checks
- approve security, privacy, compliance, payment, migration, or production decisions
