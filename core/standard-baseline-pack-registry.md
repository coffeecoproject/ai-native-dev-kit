# Standard Baseline Pack Registry

The Standard Baseline Pack Registry separates ordinary engineering guardrails from BL2 industrial overlays.

## Rule

```text
standard baseline packs first
industrial overlays only when risk justifies them
Codex selects from evidence
controlled task readiness before writes
```

## Definitions

| Layer | Meaning |
|---|---|
| Profile | Project shape such as Web, backend, Mini Program, iOS, Android, admin |
| Standard baseline pack | Normal engineering guardrail for a platform, capability, quality, environment, or release concern |
| Industrial pack | Optional BL2 overlay for high-risk, production-sensitive, customer-data, payment, migration, or release-risk work |

## AI Boundaries

Codex may:

- recommend standard packs
- explain why a pack is or is not selected
- prepare a selection report
- check report consistency

Codex may not:

- enable every pack by default
- treat `recommendedForBL` as activation
- treat standard pack selection as implementation approval
- authorize target-project writes
- approve release or production
- approve compliance, security, or privacy
- treat draft packs as stable
- treat pack files as real project evidence

## Responsibility Boundary

Codex derives and records:

- selected profiles
- BL level
- selected standard packs
- optional industrial overlays
- missing evidence acceptance
- whether a separate implementation task has sufficient authority and readiness to write files

Baseline selection does not authorize a specific implementation task, release,
or production action. The user is asked only for bounded business facts,
product preferences, exact real-world consent, or external facts.
