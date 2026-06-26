# Request: 001-review-loop-l2-slice

## Raw Request

Create a review-focused L2 workflow slice that shows how current-task findings, automatic fixes, human decisions, and future suggestions stay separated.

## User / Customer

Project owner and implementing agent.

## Problem

Review Loop rules are easier to understand when a concrete example shows which issues Codex may fix and which issues must remain outside the current task.

## Current Workflow

Review Loop protocol exists, but a dedicated L2 dogfood example is needed to demonstrate semantic checker behavior.

## Desired Outcome

A reviewer can inspect one L2 example and see `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `DIRECT_FOLLOW_UP`, and `DO_NOT_PROCEED` represented in the correct artifacts.

## Constraints

Do not add a product feature, platform-specific baseline, external dependency, production configuration, migration, release action, or automation hook.

## Priority

P0

## Suggested Task Level

L2

## Deadline

None.

## Notes

This is a workflow dogfood example. Real projects should replace example evidence with project-specific evidence.
