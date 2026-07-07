# IntentOS 1.80.2 Known Limitations

- Release Evidence Gate checks local artifacts and recorded evidence only. It
  does not prove production behavior or real-user stability.
- Digest validation proves the referenced artifact matches the report, not that
  the artifact itself is semantically sufficient for a real release.
- Markdown/JSON consistency covers the key release-review tables, but it does
  not replace human release-owner judgment.
- Release Evidence Gate does not deploy, approve release, submit app-store or
  mini-program review, execute migrations, collect secrets, mutate DNS/payment/
  provider/CI, or override existing project release SOPs.
- Post-launch evidence is intentionally out of scope for `1.80.2`.
