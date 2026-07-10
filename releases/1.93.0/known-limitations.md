# IntentOS 1.93.0 Known Limitations

- Release Approval Record proves current authorization binding; it does not
  prove product correctness or production safety.
- IntentOS does not deploy, publish, submit, migrate, change secrets/DNS/payment/
  permissions/production config, execute rollback, or become release owner.
- Platform-specific production handoff requires a strict recipe and handoff
  pack. Draft recipes remain planning inputs only.
- Release trust currently resolves project-local evidence. External provider
  state remains owned by the project release system and human release owner.
- Old plan-only Release Execution Markdown remains readable for compatibility,
  but cannot pass `--require-release-trust` or unlock real execution.
- Manifest structural consolidation and baseline/public-entry cleanup remain
  scheduled for 1.94 rather than being mixed into this release hardcut.
