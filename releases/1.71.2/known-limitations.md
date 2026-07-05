# 1.71.2 Known Limitations

- Adoption assurance is still read-only; it does not migrate target projects or apply workflow assets.
- Simulation checks route behavior and no-write evidence, not product correctness.
- Output digests prove captured output identity, not semantic correctness.
- `NOT_GIT_REPO` target diff status is weaker than git-backed `UNCHANGED` evidence and cannot support a passed simulation claim.
- Source-only examples, fixtures, release records, and calibration evidence validate IntentOS itself; they do not prove target-project adoption.
- Protected release, production, CI/hook, data, secrets, compliance, payment, and business-rule authority remains project-owned or human-owned.
