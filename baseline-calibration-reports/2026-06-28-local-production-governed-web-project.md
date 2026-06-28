# Baseline Calibration: Local Production Governed Web Project

| Field | Value |
|---|---|
| Artifact type | baseline calibration report |
| Public evidence status | LOCAL_ONLY_SANITIZED |
| Target label | `local-production-governed-web-project` |
| Project shape | Production governed Web/admin/backend project |
| Target writes performed | No |
| Generated on | 2026-06-28 |

## Human Summary

The selector made the right high-level call: this is a production-sensitive,
already governed project, so the only safe path is adapter-only, read-only
mapping first. It also found existing engineering and environment baseline
documents.

## Commands

```bash
node scripts/cli.mjs start <target>
node scripts/cli.mjs baseline <target>
node scripts/resolve-guided-baseline-selection.mjs <target> --json
node scripts/cli.mjs standard-baseline <target>
node scripts/cli.mjs baseline-packs <target>
```

## Observed Decision

| Area | Observed result |
|---|---|
| Project state | `PRODUCTION_SENSITIVE_PROJECT` |
| Default adoption mode | adapter-only / read-only-first |
| Detected platform | `backend-api + internal-admin + web-app` |
| Backend API scope | confirmed by project signals |
| Production sensitivity | confirmed |
| High-risk scope | permission, data, payment/finance/tax, migration/irreversible data |
| Guided baseline level | `BL2_INDUSTRIAL` as candidate only |
| Existing baseline state | engineering and environment baseline present |
| Can write target files now | No |

## Calibration Judgment

This behavior matches the expected adoption boundary for a production governed
project. The Dev Kit should not initialize, overwrite governance files, modify
CI, or add release gates. It should prepare a governance map and only later
propose a reviewed bridge if the human approves.

The industrial candidate set is intentionally broad because the project exposes
production, release, data, permission, and financial-risk signals. The important
part is that candidates remain inactive until narrowed and approved.

## Recommended Follow-Up

1. Keep production governed projects in adapter-only mode by default.
2. Make the user-facing recommendation clearer: "Map existing governance first;
   do not install another workflow."
3. Keep BL2 as a candidate path, not an automatic setting.
4. In future reports, separate "candidate industrial pack list" from "selected
   industrial pack list" visually so users do not mistake candidates for applied
   configuration.

## Non-Goals

- Do not run `init-project` against the target.
- Do not copy `.ai-native` assets into the target.
- Do not change `AGENTS.md`, CI, release, rollback, secret, database, or
  production files.

