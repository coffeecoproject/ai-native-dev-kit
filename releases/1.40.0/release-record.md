# Release Record: 1.40.0

## Theme

Approval Record Governance.

## Summary

1.40.0 adds a human approval evidence layer after Controlled Apply Readiness. It records exactly which action IDs a human approved, for which target paths, under which expiry, rollback, and verification conditions.

## Added

- `core/approval-record-governance.md`
- `docs/approval-record-governance.md`
- `docs/roadmaps/controlled-apply-execution-roadmap-1.40-1.42.md`
- `docs/plans/approval-record-governance-1.40-plan.md`
- `templates/approval-record.md`
- `checklists/approval-record-review.md`
- `prompts/approval-record-agent.md`
- `scripts/check-approval-record.mjs`
- `approval-records/.gitkeep`
- `approval-record-check` CLI command
- `approval-record` artifact generator type
- good example and bad fixtures for approval ownership, plan hash, blanket approval, automatic apply, and high-risk action rejection

## Allowed Claims

- IntentOS now has a dedicated approval record layer.
- Approval records are checked for human ownership, explicit action IDs, bounded target paths, plan hash, expiry, rollback acknowledgement, verification acknowledgement, and non-authorizations.
- Approval records do not execute plans or authorize automatic apply.
- Draft approval records can be generated for human completion.

## Forbidden Claims

- Do not claim 1.40.0 adds an apply runner.
- Do not claim Approval Records let Codex write files automatically.
- Do not claim a readiness report itself is approval.
- Do not claim AI, Codex, reviewer, subagent, or automation output can approve work.
- Do not claim high-risk actions, release, production, hooks, CI, migrations, secrets, payments, security, privacy, compliance, legal, or industrial packs can be approved through this layer.

## Evidence Status

- Source evidence: protocol, docs, template, checker, CLI entry, generator entry, manifest copy rules, examples, bad fixtures, and release evidence are present in the repository.
- Verification evidence: local checks should include `check-approval-record`, `check-fixtures`, `check-manifest`, `check-intentos`, and `git diff --check`.
- Real-project evidence: not claimed by this release.

## Known Limitations

- Approval Record Governance validates recorded Markdown evidence. It does not validate a real person's identity outside the record.
- Plan hash presence is checked, but the hash is not yet recomputed against a machine-readable plan file.
- No controlled apply runner is shipped in this release.

## Non-Goals

1.40.0 does not execute apply plans, install hooks, change CI, approve production release, approve high-risk changes, call external GPT/API review, or grant write authority.

## Verification

Expected checks:

```bash
node scripts/check-approval-record.mjs .
node scripts/check-approval-record.mjs examples/1.40-approval-record-governance
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
git diff --check
```
