# 1.74.0 Known Limitations

- Execution Assurance remains a verification layer. It does not make product,
  legal, compliance, finance, tax, HR, release, production, or business
  correctness decisions.
- Checker-backed `evidence_digest` records a source claim snapshot, but external
  checker internals remain outside this report unless represented by a concrete
  file or artifact.
- The resolver is intentionally conservative. Reports generated without saved
  task-scoped evidence should normally stay `PARTIAL_DONE`.
- Strict planned path coverage supports exact relative paths and directory globs
  ending in `/**`; broader glob semantics are intentionally rejected.
- Historical 1.72 examples keep their folder name for continuity, but their
  structured Execution Assurance evidence is upgraded to schema `1.74.0`.
