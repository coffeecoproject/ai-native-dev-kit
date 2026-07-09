# IntentOS 1.88.0 Known Limitations

1.88.0 is the Plan Review Gate core release.

Known limits:

- Source-chain resolution is structural in 1.88.0; deeper source-chain hardening
  is expected in a later patch.
- Consumer enforcement for Execution Assurance, Completion Evidence, Apply
  Readiness, and related downstream gates is not fully wired in this release.
- Plan Review Gate can derive a temporary review-surface matrix when no durable
  Review Surface Card exists. It records that derived status and does not treat
  it as project authority.
- The resolver reviews verification commands statically. It does not execute
  tests or prove runtime behavior.
- The resolver does not rewrite the original implementation plan by default.

These limits are intentional to keep 1.88.0 focused on the core gate.

