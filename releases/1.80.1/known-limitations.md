# IntentOS 1.80.1 Known Limitations

- Release Evidence Gate validates local evidence precision; it cannot prove
  production stability or external platform acceptance.
- Digest checks cover local artifacts that are referenced by the report. Cloud,
  app-store, mini-program, DNS, payment, monitoring, and incident tooling remain
  external authority.
- `--require-current-completion` validates the referenced Completion Evidence
  report, but it does not approve release or production.
- `READY_FOR_RELEASE_OWNER_REVIEW` means evidence can be handed off for review;
  it is still not release approval.
- Human release owners and existing project SOPs remain authoritative for final
  release decisions.
