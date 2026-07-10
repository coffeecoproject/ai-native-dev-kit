# IntentOS 1.93.0 Release Record

## Theme

Release Trust Closure.

## Human Summary

IntentOS can now distinguish a real, current human release approval from a
plain-text claim, command-line flag, old copied record, or stale candidate.
Before Release Execution becomes eligible, the approval must match the current
project, Git revision, exact candidate, target, package identity, and every
required strict release evidence source.

## Delivered

- structured project-bound Release Approval Record protocol, template, schema,
  checker, CLI entry, and artifact directory;
- shared release-trust validation for project, revision, candidate, package,
  target, owner, expiry, source digest, and bounded action identity;
- strict Release Evidence Gate, Runtime Hygiene, Release Channel Policy, and
  required platform recipe/handoff consumption;
- release candidate and Git revision binding for successful release preflight;
- Release Execution machine evidence and authority explanation trace;
- removal of ordinary-text and CLI approval authority;
- generated-project manifest, workflow, starter governance, and self-check
  integration;
- current-source Runtime Hygiene evidence for the strict 1.86 example.

## Allowed Claims

- A current human Release Approval Record can unlock review of only the exact
  bounded release trust bundle it approves.
- Candidate, project, Git, target, package, source-report, owner, expiry, and
  allowed-action drift invalidate release execution eligibility.
- Release Execution may assist only with approval-listed low-risk verification,
  build, packaging, evidence, handoff preparation, or read-only smoke work.

## Forbidden Claims

- IntentOS approves, performs, or guarantees a production release.
- A chat message, CLI flag, tag, GitHub Release, recipe, Release Plan, or Launch
  Review View is release approval.
- A valid approval transfers release ownership to Codex.
- Production deploy, store/mini-program submission, migration, secrets, DNS,
  payment, permissions, production config, or rollback execution is automatic.

## Evidence Status

- Current project-bound approval trust chain: PASS
- Strict Release Execution authority consumption: PASS
- Plain-text / CLI self-approval negative path: PASS
- Copied approval negative path: PASS
- Candidate mutation negative path: PASS
- Git revision mutation negative path: PASS
- Strict Runtime Hygiene source evidence: PASS
- Generated-project onboarding classification: PASS
- Full repository verification: PASS

## Known Limitations

IntentOS validates current project-local evidence and derives a bounded release
execution or handoff plan. It does not call provider APIs, perform production
actions, judge legal/compliance correctness, replace project release SOPs, or
guarantee operational success.

See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

Release verification covers a temporary Git project, current candidate and
source-report digests, strict authority checker replay, copied/stale evidence
rejection, generated-project installation, schema/manifest consistency,
claim-control, syntax, and the complete repository verification chain.

See [self-check-report.md](self-check-report.md) for command-level results.
