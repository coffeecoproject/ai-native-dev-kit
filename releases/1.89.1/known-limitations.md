# Release 1.89.1 Known Limitations

- Approval-record binding applies to `init-project --apply-plan`; other
  plan-only commands remain governed by their existing checkers unless they
  call this apply path.
- Adoption Assurance apply-chain verification checks structured plan, approval,
  readiness, digest, action ID, and target path consistency. It does not prove
  the underlying business change is correct.
- `--allow-empty` remains a maintainer escape hatch for asset-only checks. It
  must not be used as proof that adoption evidence exists.
- Release identity, tag binding, Windows raw path fixtures, Work Queue source
  overflow UI, and workflow SHA pinning are deferred to later hardening.
