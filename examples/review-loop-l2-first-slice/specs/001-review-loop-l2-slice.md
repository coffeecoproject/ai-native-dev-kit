# Spec 001: Review Loop L2 Slice

## Status

Ready

## Source

- Request: `requests/001-review-loop-l2-slice.md`
- Preflight: `preflight/001-review-loop-l2-slice.md`

## Problem

Review Loop and Bounded Next-Step rules need one concrete L2 example that can be checked by scripts and read by humans.

## User Story

As a project owner,
I want one L2 review loop example,
so that I can see what Codex may auto-fix, what requires human decision, and what must become follow-up or stop records.

## Scope

Included:

- one L2 task card
- one review packet
- one GPT review prompt
- one review loop report
- one final report
- one follow-up proposal
- one plain review summary
- checker commands that validate the example

## Non-goals

- No implementation of hook automation.
- No external GPT API call.
- No product feature.
- No platform-specific baseline.
- No dependency addition.
- No production configuration or release action.

## Data Model Impact

New or changed entities/resources:

- Example workflow artifacts only.

## API / Interface Contract

Input:

```json
{
  "artifact": "review-loop-l2-example"
}
```

Output:

```json
{
  "status": "reviewable",
  "reviewLoop": "checked"
}
```

Errors:

- missing review packet
- invalid finding category
- out-of-scope next-step suggestion

## UI States

Use this section only if there is UI:

- Not applicable because this is a workflow artifact example.

## Permission Rules

- No secrets or sensitive runtime data may be included.
- Any dependency, architecture, hook automation, production, release, or approval-boundary change must be routed to a human decision instead of AUTO_FIX.

## Observability

- Checker commands and example artifact refs are used as evidence.

## Acceptance Criteria

- The example includes one `AUTO_FIX` finding with verification after fix.
- The example includes one `NEEDS_HUMAN_DECISION` finding routed to Human Decision Queue.
- The example includes one `DIRECT_FOLLOW_UP` next-step suggestion.
- The example includes one `DO_NOT_PROCEED` next-step suggestion.
- `check-workflow-artifacts`, `check-review-loop`, and `check-next-step-boundary` pass for the example.

## Test Plan

- Run workflow artifact implementation check.
- Run Review Loop semantic check.
- Run Next-Step Boundary semantic check.

## Rollback Notes

Remove the example directory if the dogfood example is superseded.

## Open Questions

- None.
