# Control Effectiveness

Control Effectiveness is an internal evidence source. It proves whether one
bounded claim made by an IntentOS-native or project-native control is actually
enforced for the current project, task, revision, scope, environment, and
consumer.

## Contract

```text
Control exists != control is effective.
Control reports PASS != the depended-on claim is proven.
Project-owned != automatically trusted.
IntentOS-native != automatically trusted.
```

A strict consumer may rely on a control only when the exact claim has current
proof for implementation identity, semantic match, scope completeness,
evidence identity and freshness, failure capability, result integrity, and
operational safety.

## Routing

Task Governance decides whether the current adoption or task claim relies on a
control. Unrelated controls do not block unrelated work. Technical uncertainty
is resolved by Codex or remains blocked; it is never delegated to the ordinary
user.

## Authority

Control Effectiveness does not authorize implementation, writes, CI or hook
changes, adoption apply, release, production, or project-authority transfer.
It does not prove product or business correctness. Unified Closure remains the
only final completion truth.

## Dynamic Proof

The resolver and checker are read-only and never execute evidence-provided
commands. Dynamic proof must run through the existing bounded execution
orchestrator with direct process arguments, explicit effects, isolation,
timeouts, cleanup ownership, no production, and no arbitrary shell text.

## User Experience

Ordinary users continue to describe goals in natural language. IntentOS chooses
the controls, proof level, remediation, and review path. The public result is
one plain status, one reason, and one safe next action.
