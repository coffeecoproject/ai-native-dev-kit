# AI Log: 2026-06-27 Baseline Guided Setup

## Summary

Implemented 1.2.0 baseline guided setup.

## Key Decisions

- Keep `start` as the first entry and add `baseline` as the second entry.
- Keep baseline default read-only.
- Use plan-first writes.
- Add Environment Baseline as first-class, but bounded to facts and pending decisions.
- Enforce baseline usage through artifacts first.

## Risks

- No real production project validation yet.
- Artifact-level enforcement does not replace source review.
