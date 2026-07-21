# Baseline Recommendation Report: <project-name>

## User Input Summary

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Baseline Decision And Evidence

Selected action: INSPECT_ONLY / PLAN_BASELINE / PREPARE_CONTROLLED_APPLY / BLOCKED_BY_EVIDENCE

Can Codex continue now: yes / limited / no

Selected profile, level, and packs:

Project evidence and rationale:

Scope and exact write boundary:

Risk response, verification, and recovery:

## Plain Summary

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
|  | CANDIDATE / PENDING_EVIDENCE / SELECTED / REJECTED |  |

## Baseline State

| Layer | State | Ref | Notes |
|---|---|---|---|
| Engineering | MISSING / PENDING / PRESENT | `docs/engineering-baseline.md` |  |
| Environment | MISSING / PENDING / PRESENT | `docs/environment-baseline.md` |  |
| Platform | PENDING_EVIDENCE / SELECTED | profiles |  |
| Industrial | NOT_APPLICABLE / PENDING_EVIDENCE / SELECTED | selected packs only |  |

## Gap Summary

- 

## Pending User Input

- <one of the four user-input classes, or NO_USER_ACTION>

## High-risk Areas

- 

## Safe Next Actions

| Action | Command | Writes | Required authority/input |
|---|---|---|---|
| Read baseline recommendation | `node scripts/cli.mjs baseline <project>` | No | No |
| Write proposal | `node scripts/baseline-project.mjs <project> --write-plan baseline-recommendations/baseline-plan.json` | Project-local proposal file only | Internal plan evidence |
| Prepare controlled apply | `node scripts/init-project.mjs --target <project> --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan <project>/apply-execution-plans/baseline.json` | Exact plan file only | Codex evidence; exact consent only for a prepared real-world effect |

## Actions AI Must Not Take Yet

- Do not create or edit `.env` files.
- Do not record secret values.
- Do not modify CI/CD, deployment, production config, AGENTS.md, PR templates, or industrial packs through baseline setup.
- Do not enable BL2 or install industrial packs without evidence-backed selection and strict internal review.

## Final Recommendation
