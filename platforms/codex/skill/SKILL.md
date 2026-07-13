---
name: intentos-spec-first-development
description: Use when turning vague product requests into spec-first, eval-first, task-scoped software changes before Codex implementation.
---

# IntentOS Spec-first Development

## Purpose

Use this skill to keep AI coding work inside a controlled workflow:

1. Preflight
2. Spec Pack
3. Eval Pack
4. Task Breakdown
5. Implementation
6. Verification
7. Review
8. Release notes
9. AI task log

## Hard Rule

Do not write implementation code for vague, large, or high-risk requests before preflight.

## Modes

### Bootstrap Mode

Use when the user asks Codex to configure, apply, initialize, inject, install, or bootstrap this workflow into a project.

Rules:

- classify execution-vs-discussion intent with `bootstrap-agent.md`
- do not write files when the user only asks to review, evaluate, discuss, or look first
- run `workflow-next.mjs` to detect project state
- configure workflow and governance assets only
- do not modify business code during bootstrap
- reconcile migration reports with project authority and use controlled apply,
  rollback, and receipt verification; ask the user only for bounded business,
  external-fact, or real-world-consent input

### Preflight Mode

Use when the user asks for a broad feature, new product, unclear bug, or risky change.

Output:

- clarity
- missing information
- risk areas
- MVP
- non-goals
- first vertical slice
- task level
- decision

### Spec Mode

Use when preflight is ready.

Generate:

- spec
- eval
- task cards

### Builder Mode

Use only when a task card exists.

Rules:

- implement one task only
- respect allowed/forbidden scope
- add dependencies only when the evidence-backed plan and verification path support them
- stop on repeated verification failure

### Reviewer Mode

Review diff against:

- AGENTS.md
- spec
- eval
- task card

Prioritize permission, data isolation, missing tests, scope creep, and release risk.
