# Baseline Recommendation Report: <project-name>

## Human Summary

Can AI write now: No

Recommendation:

## Project Classification

| Field | Value |
|---|---|
| Project type |  |
| Risk level |  |
| Adoption mode |  |
| Recommended BL level |  |

## Profile Candidates

| Profile | Status | Evidence |
|---|---|---|
|  | CANDIDATE / PENDING_CONFIRMATION / REJECTED |  |

## Baseline State

| Layer | State | Ref | Notes |
|---|---|---|---|
| Engineering | MISSING / PENDING / PRESENT | `docs/engineering-baseline.md` |  |
| Environment | MISSING / PENDING / PRESENT | `docs/environment-baseline.md` |  |
| Platform | PENDING_CONFIRMATION | profiles |  |
| Industrial | NOT_APPLICABLE / PENDING_CONFIRMATION | selected packs only |  |

## Gap Summary

- 

## Pending Human Decisions

- 

## High-risk Areas

- 

## Safe Next Actions

| Action | Command | Writes | Requires human confirmation |
|---|---|---|---|
| Read baseline recommendation | `node scripts/cli.mjs baseline <project>` | No | No |
| Write plan | `node scripts/baseline-project.mjs <project> --write-plan baseline-plan.json` | Plan file only | Yes |
| Apply reviewed plan | `node scripts/baseline-project.mjs --apply-plan baseline-plan.json` | Approved baseline docs/reports only | Yes |

## Actions AI Must Not Take Yet

- Do not create or edit `.env` files.
- Do not record secret values.
- Do not modify CI/CD, deployment, production config, AGENTS.md, PR templates, or industrial packs through baseline setup.
- Do not enable BL2 or install industrial packs without explicit human confirmation.

## Final Recommendation


