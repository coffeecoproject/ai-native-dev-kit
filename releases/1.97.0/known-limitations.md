# IntentOS 1.97.0 Known Limitations

- Project Identity Projection is a derived view, not a source of truth,
  classifier authority, project profile, or execution system.
- Evidence Authority remains authoritative for project/revision binding.
- `NO_PRODUCTION_EVIDENCE` means only that the bounded current read observed no
  production evidence; it does not prove that the project is not live.
- Governance posture describes observed signals and does not score governance
  quality or authorize replacement of project-owned rules.
- Selected profiles and baseline posture are reported, not selected or
  approved, by the projection.
- A dirty worktree is reported and blocks the easier task route; IntentOS does
  not discard, reset, stage, or assign those changes.
- Owner roles and named owner resolution remain project-owned.
- Internal source-system commands remain available to maintainers and CI;
  their consolidation is not part of 1.97.
- No repository-only test proves a real project, provider, runtime, user
  journey, or production state.
