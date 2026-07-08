# Behavior-Complete Existing Project Adoption

This layer answers one practical question:

```text
For this task, how much IntentOS discipline must Codex use?
```

Existing projects do not need to install every IntentOS asset before using this
behavior. Codex should classify the task, choose the matching governance path,
and explain the next step in plain language.

## User-Facing Behavior

Codex should say:

```text
I classified this task as HIGH. I will prepare the business rule, impact map,
plan, and verification checklist first.
```

or:

```text
I classified this task as LOW. I will keep the change scoped and run minimal
verification.
```

Codex should not ask the user:

```text
Do you want Business Rule Closure / Change Impact Coverage / Execution
Assurance?
```

## Tier Summary

| Tier | Use When | Required Before Work |
| --- | --- | --- |
| `LOW` | Copy, typo, non-authoritative docs, isolated visual-only change | Scope check and minimal verification |
| `MEDIUM` | Localized bounded behavior change | Short plan, surface check, targeted verification |
| `POSSIBLE_HIGH` | High-impact signal is plausible but not confirmed | Clarification or read-only inspection |
| `HIGH` | DB, API, workflow state, permissions, settlement, release, production, security, or cross-surface behavior | Business Rule Closure, Change Impact Coverage, Execution Plan, Verification Plan |

## Completion Boundary

Task Governance may say what is required before implementation review and what
is required before completion claims. It does not itself authorize
implementation or completion.

It does not authorize implementation.

HIGH task completion still depends on:

- Test Evidence Binding;
- Execution Assurance;
- Completion Evidence Gate;
- Unified Closure.

## Existing Project Evidence

Project-native RFCs, QA checklists, release SOPs, or engineering baselines can
map to IntentOS behavior when they are concrete and evidence-bound.

If a project-native rule is stronger than IntentOS, preserve it.
