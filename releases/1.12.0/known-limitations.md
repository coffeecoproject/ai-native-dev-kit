# Known Limitations: 1.12.0

## Human Summary

1.12.0 adds stronger checks for recorded workflow evidence. It does not make Codex omniscient and does not remove human decision points.

## Limitations

- Change Boundary checks recorded reports. It does not automatically know every intended scope unless the task/report records it.
- Git diff comparison is optional and depends on the available git state or explicit report input.
- Baseline State can reject overclaims, but it cannot prove a project baseline is correct without human-confirmed sources or real evidence.
- Guided Delivery checks recorded artifacts. It does not force every discussion to create an active-work-thread file.
- The new checks do not approve implementation, release, production, payment, privacy, security, compliance, migration, rollback, or risk acceptance.
- The new checks do not run an external GPT/API reviewer.
- Real-project adoption remains read-only or plan-first according to existing project state.
- Industrial packs remain draft/candidate according to their own maturity evidence; this release does not promote them.
