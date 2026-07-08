# IntentOS 1.84.1 Known Limitations

- Work Queue Takeover is still read-only by default.
- `takeover_review_ready: Yes` means the report can be reviewed; it is not
  implementation or native-apply permission.
- A migrated `CURRENT` queue item is not executable in 1.84.1 by default.
- `execution_eligible: Yes` requires a verified Task Governance binding, but
  1.84.1 does not create or verify that binding automatically.
- Existing projects with strong native task systems should be mapped, not
  overwritten.
- Unsafe projects remain blocked until the project authority resolves the
  unsafe condition.
- 1.85 is expected to connect Task Governance consumers to execution and
  completion-chain entry points.
