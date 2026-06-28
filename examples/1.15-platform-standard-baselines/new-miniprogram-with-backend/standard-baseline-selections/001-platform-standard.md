# Standard Baseline Selection Report: New Mini Program With Backend

## Human Summary

Recommended path: BL1_STANDARD with platform standard baseline packs.

Can AI enable packs now: No.

Can AI write target project files now: No.

## Project Classification

- Project state: new
- Project shape: mini program + backend API
- Risk level: medium
- Evidence source: docs/project-profile.md, docs/baseline-selection.md

## Selected Profiles

- wechat-miniprogram
- backend-api

## BL Level

- Recommended level: BL1_STANDARD
- Current selected level: BL1_STANDARD
- Why: Platform standard baseline example for 1.15.0.

## Recommended Standard Packs

Primary platform packs:

- miniprogram-runtime-standard

Capability packs:

- backend-api-standard

Quality, environment, or release packs:

- environment-standard

## Conditional Standard Packs

Backend / API packs:

- none

Release / rollback packs:

- release-rollback-standard

Conditional scope evidence:

- Backend scope evidence: docs/project-profile.md
- Release scope evidence: PENDING

## Optional Industrial Overlays

Risk overlay packs:

- none

## Not Selected

| Pack | Layer | Reason |
|---|---|---|
| release-rollback-standard | standard | release scope is not confirmed |

## Evidence Required

| Requirement | Evidence ref | Status |
|---|---|---|
| project profile | docs/project-profile.md | DONE |
| baseline selection | docs/baseline-selection.md | DONE |

## Human Decision

- Decision status: PENDING
- Decision owner: human
- Approved standard packs: none until approved
- Approved industrial overlays: none until approved
- Explicitly rejected packs: none
- Draft pack acceptance: PENDING

## Boundary

- This report authorizes target-project writes: No
- This report approves implementation: No
- This report approves release or production: No
- This report approves compliance/security/privacy: No
- This report proves real project evidence exists: No

Human approval of this standard baseline selection does not approve a specific implementation task.
