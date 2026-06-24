---
name: ai-native-spec-first-development
description: Use when turning vague product requests into spec-first, eval-first, task-scoped software changes before Codex implementation.
---

# AI Native Spec-first Development

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
- avoid unapproved dependencies
- stop on repeated verification failure

### Reviewer Mode

Review diff against:

- AGENTS.md
- spec
- eval
- task card

Prioritize permission, data isolation, missing tests, scope creep, and release risk.

