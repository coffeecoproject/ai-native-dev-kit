# Conversation Turn Classification

## Human Summary

The user asked to add payment during the demo booking task. This changes scope and must not be silently added.

## User Message

Can we also add payment now?

## Active Work

- Current goal: booking mini app first demo slice
- Current task: service, slot, contact, confirmation demo
- Current approved scope: payment excluded

## Intent Classification

`SCOPE_CHANGE`

## Relation To Current Task

`RELATED_BUT_OUT_OF_SCOPE`

## Risk / Scope Impact

Payment introduces provider choice, compliance, privacy, refund, production configuration, and release risk.

## Selected Action

Create a Scope Change Report and stop before modifying the current task.

## Can Continue Current Task?

`No`

## Required Human Decision

`Payment scope decision`

## Audit Notes

Payment can become a future task after explicit human approval and baseline review.
