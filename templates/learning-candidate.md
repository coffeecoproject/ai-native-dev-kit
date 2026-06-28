# Learning Candidate: <name>

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Approve learning | Move this candidate into the chosen source of truth | Context/baseline only | low/medium | Choose when the observation is confirmed |
| B | Keep as candidate | Record it without treating it as truth | Candidate only | low | Choose when evidence is useful but not confirmed |
| C | Reject learning | Do not persist this as project context | Candidate/report only | low | Choose when the observation is wrong or too specific |
| D | Ask for more evidence | Pause before updating context | Candidate/evidence only | low/medium | Choose when confidence is low |

Recommended reason:

What happens if you do nothing:

## Human Summary

Codex observed something that may need to become project context, but it is not confirmed yet.

## Observation

Describe what was observed.

## Evidence

| Evidence | Source | Confidence |
|---|---|---|
|  |  | High / Medium / Low |

## Type

One of:

- `PROJECT_FACT`
- `ENGINEERING_DECISION`
- `ENVIRONMENT_FACT`
- `FAILURE_MODE`
- `USER_PREFERENCE`
- `CHECKER_FALSE_POSITIVE`
- `OBSOLETE_CONTEXT`

## Confidence

High / Medium / Low

## Recommended Destination

One of:

- `docs/project-profile.md`
- `docs/tech-stack-strategy.md`
- `docs/business-spec-index.md`
- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`
- `docs/verification-matrix.md`
- `decision-briefs/`
- `context-corrections/`
- do not persist

## Human Decision

Pending / Approved / Rejected / Needs Revision

## Rejection Reason

Required when Human Decision is Rejected.

## AI Must Not

- Do not update source-of-truth until approved.
- Do not treat this candidate as `CONFIRMED` context.
- Do not cite this candidate as a baseline rule.
