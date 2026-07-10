# IntentOS 1.94.0 Known Limitations

- All current standard and industrial packs keep their recorded maturity. A
  `draft` pack remains draft even when selected and installed.
- Baseline installation verifies selected managed assets and project records
  against an exact valid Apply Receipt and current target hashes; it does not
  verify every project-specific engineering, environment, runtime, security,
  privacy, compliance, or release fact.
- Existing-project reconciliation still requires project-owned evidence. When
  two high-risk rules conflict and evidence cannot establish the safer valid
  rule, the owner decision remains human-owned.
- Direct generic init remains available for an empty project, but a configured
  profile/BL/pack baseline uses the plan-first controlled path.
- IntentOS does not write business code, CI, deployment, production, secrets,
  migrations, payment, permissions, DNS, or external release systems through
  baseline setup.
- The public GitHub repository keeps its historical repository slug while the
  product and generated asset identity remain IntentOS.
