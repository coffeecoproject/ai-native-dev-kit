# IntentOS 1.82.0 Known Limitations

- `adopt-review` is review-only. It recommends adoption depth but does not apply
  files.
- Upstream source systems can still report blocked trace states while 1.82 uses
  project maturity signals for recommendation; those trace states remain visible
  for audit.
- A future write still requires Unified Apply Plan, Approval Record, Controlled
  Apply Readiness, and execution evidence.
- 1.82.0 does not implement S1/S2/S3/S4 apply behavior.
