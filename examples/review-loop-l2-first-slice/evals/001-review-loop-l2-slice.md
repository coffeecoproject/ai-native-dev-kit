# Eval 001: Review Loop L2 Slice

## Related Spec

`specs/001-review-loop-l2-slice.md`

## Must Pass

- Review Loop report references task, spec, eval, and review packet.
- Review Loop report includes `AUTO_FIX` and `NEEDS_HUMAN_DECISION`.
- Next-Step Suggestions include `DIRECT_FOLLOW_UP` and `DO_NOT_PROCEED`.
- Semantic checkers pass.

## Spec Alignment

- The example remains a workflow artifact example.
- No hook automation is implemented.
- No dependency, production config, migration, release, or product behavior is introduced.

## Permission / Data Checks

- No secrets, credentials, production tokens, real runtime data, or customer data are included.
- Human-decision items remain unimplemented.

## Manual Review Checklist

- Does `AUTO_FIX` stay deterministic and inside task scope?
- Does the dependency or hook question route to Human Decision Queue?
- Are future suggestions kept out of current task execution?

## Reject Conditions

Reject if:

- `DIRECT_FOLLOW_UP` is treated as current task authorization.
- `DO_NOT_PROCEED` is described as executable current work.
- `NEEDS_HUMAN_DECISION` is auto-fixed.
- Review evidence is missing.

## Required Evidence

- Semantic checker evidence: `check-workflow-artifacts`, `check-review-loop`, and `check-next-step-boundary` results.
- Artifact evidence: review packet, review loop report, final report, follow-up proposal, and plain review summary.
