# Baseline Calibration: Local iOS Industrial Monorepo Project

| Field | Value |
|---|---|
| Artifact type | baseline calibration report |
| Public evidence status | LOCAL_ONLY_SANITIZED |
| Target label | `local-ios-industrial-monorepo-project` |
| Project shape | iOS-led production governed monorepo with Web admin, backend/contracts, Mini Program/Android shells, database, governance, release, and rollback evidence |
| Target writes performed | No |
| Generated on | 2026-06-28 |

## Human Summary

The selector made the right safety decision: this project must stay read-only and
adapter-first. It correctly treated the project as production-sensitive and
high-risk, and it kept BL2 as a candidate rather than an automatic install.

The main calibration gap is not safety. It is clarity for large monorepos: the
legacy baseline entry says `BL1`, the guided baseline decision says `BL2` as a
candidate, and present-but-not-selected platforms are not explained clearly
enough for a user to judge.

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
| Detected platform | `backend-api + internal-admin + ios-app + web-app` |
| Backend API scope | confirmed by project signals |
| Production sensitivity | confirmed |
| High-risk scope | permission, data, payment/finance/tax, migration/irreversible data |
| Legacy baseline recommendation | `BL1` |
| Guided baseline level | `BL2_INDUSTRIAL` as candidate only |
| Guided standard packs | `backend-api-standard`, `environment-standard`, `internal-admin-standard`, `ios-app-standard`, `web-runtime-standard` |
| Guided industrial candidates | `auth-permission-industrial`, `backend-api-industrial`, `data-storage-industrial`, `high-risk-change-industrial`, `internal-admin-industrial`, `ios-app-industrial`, `payment-value-transfer-industrial`, `web-app-industrial` |
| Existing baseline state | engineering and environment baseline evidence present through existing project docs |
| Can write target files now | No |

## Calibration Judgment

The read-only and production-sensitive boundaries are correct. A project with
existing governance, release/rollback evidence, database rollback scripts,
permission boundaries, payment/value-transfer language, and multi-platform
structure should not receive direct workflow initialization or a broad baseline
install.

The `baseline` command and the guided baseline selector use different wording:
the former says recommended level is `BL1`, while the latter says `BL2` is a
candidate path. The safer product experience is to explain this as:

```text
Current safe action: BL1 / read-only mapping
Possible target level: BL2 candidate after human confirmation and evidence
```

The platform signal also needs better language for large monorepos. Android and
Mini Program shells may exist but not be active in the current phase. The output
should distinguish:

```text
selected profile
present but inactive/needs confirmation
not detected
```

## Recommended Follow-Up

1. Align legacy `baseline` language with guided baseline language so users do
   not see BL1 and BL2 as contradictory recommendations.
2. Add a monorepo platform state vocabulary:
   `selected`, `present-needs-confirmation`, `inactive/deferred`, and
   `not-detected`.
3. Keep `ios-app-standard`, `backend-api-standard`, `internal-admin-standard`,
   and `web-runtime-standard` as selected candidates for this shape.
4. Surface Android and Mini Program as present-but-not-selected when repository
   structure shows them but the current phase does not confirm them.
5. Keep industrial overlays candidate-only until the user confirms project
   level, scope, and evidence.

## Non-Goals

- Do not write baseline files into the target.
- Do not initialize `.ai-native` in the target.
- Do not replace existing `AGENTS.md`, governance docs, CI, release, rollback,
  database, permission, or production authority.
- Do not treat all platforms in a monorepo as active for the current task.

