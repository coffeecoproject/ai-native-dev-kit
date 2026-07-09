# Release 1.89.0 Known Limitations

- Path safety protects IntentOS-managed write paths only. It does not scan or
  rewrite arbitrary target-project scripts.
- Strict no-report failure applies when strict evidence, explicit reports, or
  required reports are requested.
- Existing-project `VERIFIED_ACTIVE` requires apply-chain evidence, but that
  evidence remains non-authorizing and does not replace project owner approval.
- Release handoff defaults are safer, but project-specific release execution
  still requires the project's own release owner and release system.
