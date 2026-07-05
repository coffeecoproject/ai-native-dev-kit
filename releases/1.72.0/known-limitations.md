# 1.72.0 Known Limitations

- Execution Assurance checks recorded evidence. It does not independently prove the product is correct, complete, releasable, or production-safe.
- `--out` writes only the requested report file. It is not permission to modify target business code, CI, hooks, release configuration, secrets, migrations, provider state, or production data.
- `VERIFIED_DONE` means the recorded completion contract and evidence chain pass IntentOS checks. It is not a human approval, release approval, or production approval.
- Strict evidence quality depends on upstream artifacts such as Change Impact Coverage, Review Loop, Adoption Assurance, Governance Convergence, and Release Plan being accurate.
- Patch-smell detection is conservative and evidence-bound. A blocked patch may still be valid work, but it must be reframed with a broader plan, review, or human decision before being claimed complete.
- Execution Assurance does not replace project-owned engineering baselines, production SOPs, legal/compliance requirements, release owners, or platform provider controls.
