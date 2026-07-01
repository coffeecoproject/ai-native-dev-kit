# Known Limitations: 1.46.0

- Risk-surface detection remains conservative and heuristic. It improves consistency, but it is not a full product, legal, security, or architecture review.
- Product Completeness can read explicit smoke evidence, but it still cannot prove UX quality, business correctness, real-user adoption, or production readiness.
- The built-in MVP examples are local O0/BL0 examples. They do not include persistence, authentication, production deployment, customer data, payment, or external integrations.
- Low-Risk Controlled Apply Candidate structured evidence is strict-checkable, but it still does not authorize apply or implementation.
- Path safety checks cover common unsafe cases, generated paths, symlinks, ignored paths, CI workflows, and hook paths where local evidence exists. They do not replace human review for unusual filesystem or repository setups.
- Historical Markdown-only target-project candidate records remain compatible unless strict mode is explicitly requested.
