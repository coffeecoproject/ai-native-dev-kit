# IntentOS 1.97.0 Release Record

## Theme

Project Identity Projection.

## Human Summary

IntentOS now gives Codex one consistent, read-only account of the project it is
working in. New, existing, governed, production-sensitive, non-Git, and
IntentOS-source projects are described through the same Operating State instead
of leaving Codex to reconcile several labels independently.

Ordinary users receive one plain project summary. They are not asked to decide
project kind, Git identity, governance maturity, platform profile IDs, or
baseline state when those facts can be read from the project.

## Delivered

- one `projectIdentityProjection` inside `INTENTOS_OPERATING_STATE`;
- canonical project, governance, production, and worktree postures;
- current IntentOS, onboarding, platform, baseline, and industrial-pack state;
- selected profiles exposed by Workflow Next as structured source data;
- Evidence Authority project/revision identity reused without a competing
  fingerprint;
- current source semantic digests, conflict visibility, confidence, and stable
  projection digest;
- Operating Decision digest binding to the current projection;
- one matching beginner `Project reading` / `项目识别` summary;
- dirty-worktree consistency for the IntentOS source repository;
- 25 operating-model, decision, and identity-projection acceptance tests;
- generated-project, PR, release, Manifest, and self-check coverage.

## Allowed Claims

- `work --json` identifies the current project through one derived projection.
- The projection includes current evidence identity, worktree, governance,
  production, IntentOS, baseline, and selected-platform posture.
- The Operating Decision is invalidated when its bound project projection
  changes.
- The beginner project summary and structured projection use the same facts.
- Project identity facts readable by Codex are not delegated to a beginner.

## Forbidden Claims

- Project Identity Projection is a new project profile or source of truth.
- The projection proves that no production deployment exists.
- A governance posture scores governance quality or permits rule replacement.
- A selected profile or baseline posture is an approval or automatic choice.
- The projection grants implementation, apply, commit, push, migration,
  release, production, or provider authority.
- Repository tests prove a real project, runtime, provider, or user journey.

## Evidence Status

- new-project identity projection: PASS
- existing-light identity projection: PASS
- governed and production-sensitive projection: PASS
- IntentOS-source projection: PASS
- non-Git Evidence Authority identity: PASS
- dirty-worktree projection without changed-filename exposure: PASS
- selected-profile structured projection: PASS
- source-failure low-confidence projection: PASS
- stable unchanged projection digest: PASS
- projection and decision invalidation after posture change: PASS
- LOW task remains distinct from project industrial depth: PASS
- matching beginner project summary: PASS
- no-authority boundary: PASS
- generated-project projection smoke: PASS
- full repository verification: PASS

## Known Limitations

The projection reports evidence observed in a bounded current read. In
particular, `NO_PRODUCTION_EVIDENCE` is not proof that a project is not live.
The projection does not evaluate the quality of project-owned governance or
resolve a named owner. Internal source-system surface consolidation remains a
1.98 concern.

See [known-limitations.md](known-limitations.md) for the complete boundary.

## Verification

The release is checked through positive and negative Operating Model scenarios,
current Git and non-Git identity behavior, generated-project installation,
Manifest validation, self-check, product and claim controls, and complete
repository verification.

See [self-check-report.md](self-check-report.md) for command-level evidence.
