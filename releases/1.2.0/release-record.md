# 1.2.0 Release Record

## Release Type

Simulated baseline guided setup release.

This release has not yet been validated against a long-running production project. It is intended for controlled project adoption and first real-project trials.

## Theme

Engineering and Environment Baseline Guided Setup.

## Added

- `baseline` CLI entry for read-only baseline recommendation.
- Environment Baseline as a first-class workflow layer.
- Plan-first baseline write/apply flow.
- Artifact-level baseline enforcement for task cards, review packets, and review loop reports.
- Platform environment topic lists.
- 1.2 examples and bad fixtures.

## Guardrails

- `baseline` defaults to read-only.
- Recommendation includes `Can AI write now: No`.
- Apply scope is limited to baseline docs and baseline reports.
- No `.env`, CI/CD, deployment, production config, AGENTS.md, PR template, secret value, or industrial-pack writes are allowed through baseline apply.
- BL2 remains explicit opt-in.

## Verification

See:

- `releases/1.2.0/baseline-smoke.md`
- `releases/1.2.0/generated-project-smoke.md`
- `releases/1.2.0/self-check-report.md`
- `releases/1.2.0/known-limitations.md`
