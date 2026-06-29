# 1.21.0 Known Limitations

- `doc-lifecycle` prints a read-only recommendation; it does not write a report
  into the target project.
- It inventories document signals, but it does not fully parse every
  project-specific ownership rule.
- It does not delete files, authorize deletion, move files, archive files, or
  change source of truth.
- Archive, deprecation, merge, and deletion actions require human approval and a
  separate reviewed plan.
- Work queue and hook orchestration remain later phases.
- Remote GitHub Actions evidence is not embedded until a run URL is recorded
  after push.
