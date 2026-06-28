# Baseline Calibration: Local iOS Backend Project

| Field | Value |
|---|---|
| Artifact type | baseline calibration report |
| Public evidence status | LOCAL_ONLY_SANITIZED |
| Target label | `local-ios-backend-project` |
| Project shape | iOS app with backend signals and dirty worktree |
| Target writes performed | No |
| Generated on | 2026-06-28 |

## Human Summary

The selector correctly stopped writes because the target had a dirty worktree.
It also detected iOS and backend signals. The parts that need calibration are
the broad internal-admin signal and the way dirty-worktree projects are shown as
BL1 even when high-risk scope exists.

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
| Project state | `DIRTY_WORKTREE_PROJECT` |
| Default adoption mode | read-only |
| Detected platform | `backend-api + internal-admin + ios-app` |
| Backend API scope | confirmed by project signals |
| Production sensitivity | not detected |
| High-risk scope | permission, data, migration/irreversible data |
| Guided baseline level | `BL1_STANDARD` |
| Standard packs | `backend-api-standard`, `environment-standard`, `internal-admin-standard`, `ios-app-standard` |
| Can write target files now | No |

## Calibration Judgment

Dirty-worktree protection is working as intended. The selector must not write
baseline assets or adoption plans into a project with uncommitted user work.

The detected internal-admin scope may be too broad for a mobile app with backend
or permissions vocabulary. Internal admin should require stronger evidence such
as admin pages, dashboard routes, management console files, approval workflows,
or internal operations docs.

The BL1 result is safe for a dirty project, but the output should still explain
that high-risk signals may become BL2 candidates after the dirty-worktree
decision is resolved.

## Recommended Follow-Up

1. Keep dirty-worktree projects read-only.
2. Add an explicit "BL2 candidate after worktree resolution" message when high
   risk is present but writes are blocked by dirty state.
3. Tighten internal-admin detection so permission or backend terms alone do not
   imply an admin console.
4. Keep iOS and backend standard packs as candidates until the project goal is
   confirmed.

## Non-Goals

- Do not write baseline files into the target.
- Do not infer production sensitivity without release, deployment, rollback,
  production, or CI evidence.
- Do not enable industrial packs from dirty-worktree evidence alone.

