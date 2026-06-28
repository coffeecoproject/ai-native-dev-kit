# Baseline Pack Selection Review Checklist

Use this checklist before treating a baseline pack recommendation as accepted.

## Required

- Project state is recorded.
- Selected profiles are recorded or explicitly pending.
- Recommended BL level is recorded.
- Selected packs are separated by primary platform, capability, and risk overlay.
- Not-selected packs have reasons.
- Draft pack acceptance is explicit when any draft pack is selected.
- Evidence requirements are listed.
- Human Decision has a single status: `PENDING`, `APPROVED`, or `REJECTED`.
- The report says pack selection does not authorize writes, implementation, release, or production.

## Reject

Reject the report if it:

- selects all packs by default
- treats BL2 as the default for every project
- treats a draft pack as stable
- claims production readiness from pack files
- claims real project evidence without evidence refs
- authorizes target-project writes
- approves implementation or release
- merges platform, capability, and risk packs into one unclear recommendation

