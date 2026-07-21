# Learning Candidate: <name>

## Human Decision Summary

Compatibility heading: semantically this is the bounded `User Input Summary`; it grants no technical decision authority.

Conclusion:

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

User input needed now: Yes / No

Plain-language question or exact consent request, if needed:

Why project evidence cannot answer it:

What happens if you do nothing:

## Codex Learning Decision And Evidence

Selected disposition: PERSIST / KEEP_CANDIDATE / REJECT / COLLECT_MORE_EVIDENCE

Can Codex continue now: yes / limited / no

Evidence and confidence:

Selected destination and scope:

Risk response, verification, and recovery:

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

Compatibility heading: semantically this is the bounded `User Input Record`.

User input class: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

Status: PENDING / PROVIDED / CONSENTED / NOT_REQUIRED

## Rejection Reason

Codex disposition reason when the candidate is rejected.

## AI Must Not

- Do not update source-of-truth until Codex verifies the evidence or receives the classified bounded fact.
- Do not treat this candidate as `CONFIRMED` context.
- Do not cite this candidate as a baseline rule.
