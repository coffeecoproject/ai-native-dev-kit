# IntentOS 1.81.2 Known Limitations

- `start` is orientation only. It does not write adoption records or apply
  workflow assets.
- `adopt` is still read-only. It gives a safe adoption result card, not a
  migration approval.
- Existing projects still need rule comparison, convergence evidence, adoption
  assurance, Unified Apply Plan, explicit approval, and readiness before any
  target-project workflow assets can change.
- 1.81.2 changes public entry semantics and docs; it does not introduce a new
  migration engine.
