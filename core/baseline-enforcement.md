# Baseline Enforcement

Baseline Enforcement proves that project rules are used during work, not only documented.

The first enforcement layer is artifact-level. It checks task cards, review packets, and review loop reports. It does not attempt full source-code architecture scanning.

## Required Task Fields

Every task card should declare:

```text
Engineering Baseline touched: Yes / No
Environment Baseline touched: Yes / No
Baseline refs:
Baseline decisions introduced:
```

If engineering or environment baselines are touched, the task must cite the relevant baseline:

- `docs/engineering-baseline.md`
- `docs/environment-baseline.md`

## Touched Areas

Engineering Baseline is touched by changes to:

- database schema
- API contract
- DTO / schema / domain boundary
- permission model
- migration
- dependency
- folder structure
- generated types
- enum, lookup, or state-machine decisions
- cross-module state

Environment Baseline is touched by changes to:

- build command
- CI/CD
- environment variables
- deployment
- production config
- release process
- rollback process
- secrets
- logs, monitoring, or alerts

## Failure Policy

| Context | Missing baseline refs |
|---|---|
| BL0 | Advisory only. |
| BL1 ready mode | Advisory by default. |
| BL1 implementation mode | Fail for obvious touched areas. |
| BL2 ready mode | Fail unless `NOT_APPLICABLE` or an exception is recorded. |
| BL2 implementation mode | Fail. |
| L3 task | Fail. |

## Review Packet

Review Packet must carry baseline state. Engineering fields already exist. Environment fields should include:

```text
Environment baseline checked:
Environment baseline ref:
Environment baseline gaps:
```

## Review Loop

Review Loop should ask:

- Did implementation follow Engineering Baseline?
- Did implementation follow Environment Baseline?
- Did it introduce a baseline decision without updating the baseline or decision brief?
- Did it touch environment, release, secret, or production config without approval?

## Non-goals

Baseline Enforcement is not a full static analyzer.

It must not claim to:

- parse all imports
- detect all architecture violations
- scan every environment variable in source
- infer production behavior from code
- replace human approval for high-risk decisions
