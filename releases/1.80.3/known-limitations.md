# IntentOS 1.80.3 Known Limitations

- Release Evidence Gate checks local artifacts and recorded evidence only. It
  does not prove production behavior or real-user stability.
- Completion Evidence set validation proves every included report is checked and
  in scope, but it does not prove the product is correct for real users.
- Owner readiness records release, risk, and environment owners for
  release-review handoff. It does not approve release or replace the release
  owner.
- Approval refs must remain non-authorizing. Real release approval belongs to
  the project's external release process.
- Release Evidence Gate does not deploy, approve release, submit app-store or
  mini-program review, execute migrations, collect secrets, mutate DNS/payment/
  provider/CI, or override existing project release SOPs.
- Post-launch evidence is intentionally out of scope for `1.80.3`.
