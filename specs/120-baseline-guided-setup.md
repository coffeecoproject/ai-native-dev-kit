# Spec 120: Baseline Guided Setup

## Goal

Add `baseline` as the second guided entry after `start`.

## Requirements

- `baseline` is read-only by default.
- Default output includes `Can AI write now: No`.
- `--write-plan` writes only a plan file.
- `--apply-plan` writes only baseline docs and baseline report folders.
- Environment Baseline uses `CONFIRMED`, `PENDING_CONFIRMATION`, and `NOT_APPLICABLE`.
- Task Card, Review Packet, and Review Loop templates include engineering/environment baseline refs.
- Checkers distinguish BL0, BL1, and BL2 behavior.

## Non-goals

- no `.env` writes
- no CI/CD or deploy edits
- no source-code deep scanning
- no default industrial pack activation
