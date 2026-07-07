# IntentOS 1.81.0 Known Limitations

- 1.81.0 does not write target-project adoption records. Safe docs-only writes
  are reserved for a later phase.
- `adopt` is read-only. It summarizes the safe route but does not install
  `.intentos/` or change project authority.
- Existing projects with omitted or stricter rules may still need a separate
  collaboration-file review plan before deeper adoption.
- The report can say IntentOS is available for safe use, but it must not claim
  full adoption.
- Local project observations are calibration evidence only and are not
  hard-coded into public rules.
