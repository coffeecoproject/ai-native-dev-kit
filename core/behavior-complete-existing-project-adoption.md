# Behavior-Complete Existing Project Adoption

## Human Summary

Behavior-complete adoption lets an existing project keep its own governance
assets while Codex still follows the right IntentOS behavior for each task.

It does not mean full native migration. It does not install `.intentos/`,
replace `AGENTS.md`, change CI, or approve implementation. It classifies the
task as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`, then routes the work to the
right existing IntentOS evidence chain.

## Task Tiers

`LOW` tasks are small, local, and non-behavioral. They need a scope check,
minimal verification or a concrete no-verification reason, and a clear
statement that no API, DB, permission, runtime, business-rule, release, or
production surface is affected.

`MEDIUM` tasks are localized behavior changes. They need a short plan, affected
surface check, targeted verification, and evidence that no high-impact surface
is hidden.

`POSSIBLE_HIGH` tasks have credible high-impact signals but incomplete
information. Codex must stop direct implementation and either ask one plain
clarifying question or perform read-only inspection.

`HIGH` tasks touch or may affect DB, API contract, DTO/domain boundaries,
runtime workflow state, approval, settlement, finance, permission, production,
release, security, scheduled jobs, cross-surface behavior, or long-lived
queues. They require Business Rule Closure, Change Impact Coverage, Execution
Plan, Verification Plan, Test Evidence, Execution Assurance, and Completion
Evidence / Unified Close-Out through the existing systems.

## Boundary

Task Governance is a router and gate, not a completion system.

It does not authorize implementation.

It must not:

- write target-project files;
- authorize implementation;
- approve commit or push;
- approve release or production;
- run migrations;
- change CI or hooks;
- replace stronger project-owned rules.

## Existing Project Rule

Project-native evidence may satisfy required IntentOS behavior when it is
mapped with a source ref, digest, task match, and reason. If the project-native
rule is stronger, it must be preserved rather than downgraded.
