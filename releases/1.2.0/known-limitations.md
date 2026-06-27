# 1.2.0 Known Limitations

1. This release provides simulated baseline guided setup evidence, not full production validation.
2. `check-baseline-enforcement.mjs` checks workflow artifacts, not full source-code architecture.
3. `check-environment-baseline.mjs` detects only obvious secret misuse. It is not a full secret scanner.
4. `baseline-project.mjs` recommends platform candidates from common signals and still requires human confirmation.
5. BL2 remains selected-only and is not activated by baseline recommendation.
6. Baseline apply does not edit CI, deployment, production config, AGENTS.md, PR templates, `.env`, migrations, permissions, or business code.
