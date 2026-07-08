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

## Review Policy

分级不是取消审查，而是选择合适的审查强度：

- `LOW`：轻量自检，确认没有扩范围、没有动高风险面，并做最小验证或说明为什么不需要。
- `MEDIUM`：定向审查，先有短计划，再确认局部影响面和针对性验证。
- `POSSIBLE_HIGH`：先停下来澄清或只读检查，不能直接进入实现。
- `HIGH`：完整审查链，先处理业务规则、影响面、执行计划和验证计划，再进入实现评审；完成前还要有测试、执行和完成证据。

所以小任务不会被过度治理，但也不是无审查；高影响任务不会被当成补丁处理。

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

In 1.83.1, "evidence-bound" means the mapping must include a resolvable
`artifact:` ref, matching sha256 digest, owner, scope, current-task match, and
plain summary. A project can keep its own documents, but Codex must prove which
document is being used and why it applies to the current task.

Examples:

- a project RFC can satisfy Business Rule Closure when it records the actor,
  trigger, success path, failure path, edge cases, and verification expectation;
- a QA checklist can satisfy or strengthen Verification Plan only when it is
  current-task matched and its stronger controls are preserved;
- a release SOP can be mapped as release evidence, but it does not approve
  production release by itself.
