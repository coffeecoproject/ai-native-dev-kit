# Follow-up Proposal: Status Filter Lookup Administration

## Human Summary

This proposal captures the future question from review: whether status options should be managed by backend configuration. It is not part of the current task and Codex must not implement it without a new request and human approval.

## Type

DIRECT_FOLLOW_UP

## Source

Review finding: F2 in `review-loop-reports/001-project-status-filter.md`

Related task: `tasks/001-project-status-filter.md`

## Suggestion

Evaluate whether status labels, ordering, and availability should move from a local UI mapping table to backend-managed configuration.

## Relation To Current Task

The current task used a local mapping table by design. Backend management changes ownership, API contract, testing, and operating model, so it belongs in a separate request.

## Can AI Do This Now?

No

## Required Entry

follow-up proposal

## Risk / Approval

Needs product owner and engineering owner approval before any implementation. May require API contract, schema, permission, release, and migration review depending on the selected design.

## Human Decision Needed

Status: NEEDS_HUMAN_DECISION

Owner: Product and engineering owner

Decision: Approve or reject exploration of backend-managed status configuration.

## Next Safe Action

Discuss whether status definitions are stable enough to remain local. If not, create a new request and baseline decision before implementation.

## Technical Details

Potential future artifacts would include a Decision Brief, updated engineering baseline, new spec, eval, task card, and Review Packet. None of those are authorized by this current task.

## Audit Notes

This proposal exists to keep next-step suggestions bounded. It is not execution approval.
