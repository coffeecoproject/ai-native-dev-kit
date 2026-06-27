# Release Record: 1.0.0

## Release Type

1.0 minimum productization release.

This is not a 10/10 real-project evidence release.

## Human Summary

The dev kit has a productized CLI, authoritative manifest, safe init/update plan flow, plan-only migration command, docs IA, checker suite, fixture matrix, and release evidence.

The release is suitable for controlled real-project adoption, not for claiming that every industrial pack is stable or production-proven.

All concrete packs remain draft.

## Release Boundary

Included:

- CLI front door
- authoritative manifest
- init/update dry-run, write-plan, apply-plan, and backup support
- artifact frontmatter and schema support
- fixture matrix
- docs IA
- migration plan command
- release evidence
- adoption entry criteria

Not included:

- No package publishing
- SaaS or hosted service
- external GPT/API reviewer automation
- No migration apply from `ai-native migrate`
- 10/10 real-project evidence
- industrial pack promotion from draft to candidate
- legal advice

## Entry Criteria

| Criterion | Status | Evidence |
|---|---|---|
| dev-kit first-party CI exists | PASS | `.github/workflows/dev-kit-pr-checks.yml`, `.github/workflows/dev-kit-release-checks.yml` |
| CLI is stable | PASS | `scripts/cli.mjs`, `releases/1.0.0/self-check-report.md` |
| manifest is authoritative | PASS | `dev-kit-manifest.json`, `scripts/check-manifest.mjs` |
| init/update safety exists | PASS | `releases/1.0.0/update-smoke.md` |
| governed/production/dirty protection exists | PASS | `scripts/workflow-next.mjs`, `scripts/check-dev-kit.mjs` |
| new artifacts have frontmatter/schema support | PASS | `schemas/artifacts/`, `scripts/new-workflow-item.mjs` |
| fixture matrix covers checkers | PASS | `releases/1.0.0/self-check-report.md` |
| migration matrix exists | PASS | `releases/1.0.0/migration-matrix.md` |
| README is slim and docs IA exists | PASS | `README.md`, `docs/operator-manual.md`, `docs/reference/` |
| license/commercial boundary is clear | PASS | `LICENSE.md`, `LICENSE-FAQ.md`, `LICENSE-COMMERCIAL.md`, `NOTICE.md` |
| industrial pack maturity lifecycle exists | PASS | `industrial-packs/*/maturity.md` |
| release evidence is recorded | PASS | `releases/1.0.0/` |

## 10/10 Evidence Status

Status: NOT ACHIEVED.

Missing before a 10/10 evidence release:

- 2-3 real project adoption reports
- governed existing project read-only adoption report
- production-sensitive adapter trial
- at least one industrial pack promoted from draft to candidate
- public changelog and migration matrix backed by real project evidence

## Human Decisions

| Decision | Status | Notes |
|---|---|---|
| Release as 1.0 minimum without 10/10 real adoption evidence | ACCEPTED | Allowed only with explicit limitation wording |
| Treat license wording as final legal advice | REJECTED | Existing docs remain explanatory and not legal advice |
| Promote any industrial pack to candidate | REJECTED | All concrete packs remain draft |
| Implement migration apply | REJECTED | `ai-native migrate` remains plan-only |

## Rollback

If this release needs to be rolled back, revert the 1.0 version metadata, release evidence, adoption templates, self-check release-evidence rules, and workflow artifacts in one commit.
