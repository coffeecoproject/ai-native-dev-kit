# 1.58.0 Known Limitations

- Release Guide is a router and guide, not a deployment tool.
- Release path discovery still depends on 1.57 heuristic adapter signals.
- Structured approval shape is enforced, but approval validity remains human-owned.
- Lower-level Release Execution records remain backward-compatible; strict structured release approval is enforced by the Release Guide layer.
- Evidence quality checks reject obvious placeholders but do not inspect live cloud consoles, app stores, DNS, payment systems, production logs, or monitoring dashboards.
- Platform release recipes are intentionally deferred to 1.59.
- Release handoff packs are intentionally deferred to 1.60.
