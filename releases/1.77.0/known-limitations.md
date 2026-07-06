# 1.77.0 Known Limitations

- Test Evidence Binding does not run tests. Evidence files must come from explicit command/manual/report output.
- It does not judge whether a test is semantically perfect. It checks binding, freshness, source consistency, output digest, and declared coverage.
- It does not prove production behavior or real user behavior.
- It does not approve release, production, migrations, secrets, provider actions, or app store / mini program submission.
- Existing-project mapping is minimal in 1.77.0; deeper project-specific test-system reconciliation should be handled in a later release.
- Broad commands can be referenced only when mapped to specific obligations; a passing broad command alone is not proof.
