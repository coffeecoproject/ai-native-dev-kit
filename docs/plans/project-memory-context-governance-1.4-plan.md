# Project Memory & Context Governance 1.4 Plan

## Human Summary

This phase adds project memory and context governance as a horizontal source-of-truth layer. It lets Codex observe context drift and propose learning or correction candidates, but it does not allow Codex to persist unconfirmed assumptions as project facts.

## Product Definition

Project Memory & Context Governance means:

- Codex may observe project context gaps.
- Codex may draft learning candidates.
- Codex may draft context correction reports.
- Humans confirm before any candidate becomes project source of truth.
- Confirmed context belongs in Git-backed project docs, baselines, decision briefs, or accepted correction reports.
- Git-backed source of truth overrides model memory and historical AI logs.

It is not Codex self-learning. It is an auditable, versioned, human-confirmed project context layer.

## Outcome

Long-running projects should become easier for humans and AI to understand over time, without allowing stale notes, chat memory, or AI inference to override confirmed project facts.

## Scope

This phase adds:

- Git Boundary governance.
- Context Source-of-Truth governance.
- Learning Candidate template and directory.
- Context Correction Report template and directory.
- Git Boundary Report template and directory.
- Context governance checker.
- Context governance checklist and prompt.
- 1.4 examples, bad fixtures, release evidence, and workflow artifacts.
- Generated-project installation of the new governance assets.

## Non-goals

- No automatic memory write.
- No external vector database or model-memory integration.
- No raw conversation persistence.
- No secret scanning product claim beyond deterministic obvious-pattern checks.
- No Safe Launch / Delivery Readiness implementation.
- No automatic AGENTS, baseline, or project-rule rewrite from a learning candidate.

## Architecture

```text
Task / Review / Failure / Observation
  -> Codex observes context gap
  -> Learning Candidate or Context Correction Report
  -> Human Decision
  -> Confirmed destination update
  -> Future tasks cite Git-backed source of truth
```

## Context Authority Order

From highest to lowest:

1. Current explicit human instruction.
2. Current request, preflight, spec, eval, and task.
3. Confirmed engineering, environment, platform, industrial, product, and context baselines.
4. Project code, tests, and runtime evidence.
5. Confirmed decision brief, ADR, onboarding decision, or accepted correction report.
6. Latest review loop report, final report, or AI log.
7. Historical AI logs, review summaries, and retros.
8. Codex inference.
9. Model memory.

Lower authority must not override higher authority. Inferred context must not override confirmed rules.

## Goal Mode Plan

Main goal:

```text
Establish Project Memory & Context Governance for IntentOS.
```

Modes:

- `DEFINE_WORK`: document the bounded 1.4 plan.
- `IMPLEMENT_TASK`: add core files, templates, script, examples, and metadata.
- `REVIEW_TASK`: run context, product, claim, manifest, fixture, and intentos checks.
- `REPAIR_TASK`: repair deterministic checker failures only.
- `HANDOFF_OR_REPORT`: record evidence and summarize remaining boundaries.

## Subagent Plan

Use many readers / one writer:

- Main thread is the only writer.
- Read-only subagents may review source-of-truth boundaries, Git boundary, and overreach risks.
- Subagents do not approve project facts, risk, release, scope expansion, or future work.
- Subagents must be `CLOSED` or `SKIPPED` before final response.

## Deliverables

Core:

- `core/context-governance.md`
- `core/git-boundary.md`

Templates:

- `templates/learning-candidate.md`
- `templates/context-correction-report.md`
- `templates/git-boundary-report.md`

Checklists and prompts:

- `checklists/context-governance-review.md`
- `checklists/git-boundary-review.md`
- `prompts/context-governance-agent.md`

Scripts:

- `scripts/check-context-governance.mjs`

Docs and directories:

- `docs/project-memory.md`
- `docs/git-boundary.md`
- `learning-candidates/`
- `context-corrections/`
- `git-boundary-reports/`

Examples and fixtures:

- `examples/1.4-project-memory-context/`
- `test-fixtures/bad/bad-learning-approved-without-evidence/`
- `test-fixtures/bad/bad-context-correction-missing-evidence/`
- `test-fixtures/bad/bad-git-boundary-secret/`

Workflow evidence:

- request, preflight, spec, eval, task
- decision brief
- goal card
- subagent run plan
- review packet
- review loop report
- final report
- release record

## Checker Behavior

`check-context-governance.mjs` verifies:

- required context governance assets exist
- learning candidates use approved statuses and required sections
- approved learning candidates include evidence and destination
- rejected learning candidates include a reason
- context corrections include old context, new evidence, proposed correction, source-of-truth destination, human decision, applied changes, and audit notes
- git boundary reports include commit/PR boundary, included items, excluded items, secrets check, and human decision
- obvious secret values are not stored in context governance artifacts
- source repo contains 1.4 release and workflow evidence

The checker is deterministic. It does not call external models and does not decide business truth.

## Acceptance Criteria

- Context governance is described as source-of-truth governance, not AI self-learning.
- Git Boundary separates committed facts from local, noisy, or forbidden artifacts.
- Learning Candidate and Context Correction Report keep unconfirmed context out of project rules.
- Context Authority Order is documented.
- Generated projects receive context governance assets and checker.
- Bad fixtures fail for approved-without-evidence, correction-without-evidence, and secret misuse.
- CLI, CI, manifest, workflow-version, docs, and self-check include context governance.
- `check-context-governance`, product baseline check, claim control check, manifest check, fixture suite, intentos self-check, and `git diff --check` pass.

