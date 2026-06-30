# Delivery Readiness And Drift Roadmap 1.4.1 To 1.6

This document is the execution plan for the upgrade batch after `1.4.0`.

The intent is not to add more ceremony. The intent is to keep the same product promise:

```text
Humans make judgment calls.
Codex prepares, executes, verifies, records, and stops at the right boundary.
```

## Upgrade Scope

This batch has three ordered releases.

| Release | Theme | Purpose | Boundary |
|---|---|---|---|
| `1.4.1` | Context polish | Make Project Memory and Context Governance easier to use correctly | No new workflow gate |
| `1.5.0` | Safe Launch / Delivery Readiness | Decide whether a completed task is ready for demo, handoff, release review, or blocked | Does not claim production validation |
| `1.6.0` | Conversation Drift Control | Keep Codex aligned when the user discusses, changes scope, asks a side question, or raises risk | Does not silence useful suggestions |

## Non Goals

- Do not create a hidden autopilot that makes product, release, payment, permission, migration, or production decisions.
- Do not require every small task to create every artifact.
- Do not turn context notes into confirmed project rules without human approval.
- Do not treat a launch readiness report as legal, security, compliance, or production approval.
- Do not prevent Codex from answering useful questions during execution. It must classify the turn and preserve the active task boundary.

## 1.4.1 Context Polish

### Problem

`1.4.0` added Project Memory and Context Governance, but a weak user may still not know when to create:

- a Learning Candidate
- a Context Correction Report
- a Git Boundary Report

The repo also still has old wording in `check-product-baseline.mjs` that describes a source-only skip as a `1.3 release` skip.

### Deliverables

- `docs/context-governance-usage.md`
- `docs/minimal-commit-set.md`
- wording cleanup in `scripts/check-product-baseline.mjs`
- `releases/1.4.1/` evidence

### Acceptance

- A user can understand when to record context without understanding the internal governance model.
- The minimal commit set is explicit, so Codex does not commit local scratch, secrets, generated noise, or unapproved candidates.
- No new heavy gate is added.

## 1.5.0 Safe Launch / Delivery Readiness

### Problem

After a task is implemented and reviewed, the user still needs a simple answer:

```text
Can this be shown, handed off, release-reviewed, or should it stop?
```

Without a dedicated readiness layer, Codex can overstate completion, confuse a demo with production readiness, or skip unresolved human decisions.

### Deliverables

- `core/safe-launch.md`
- `templates/launch-readiness-report.md`
- `checklists/launch-readiness-review.md`
- `prompts/launch-readiness-agent.md`
- `docs/safe-launch.md`
- `launch-readiness/`
- `scripts/check-launch-readiness.mjs`
- CLI command: `launch-readiness`
- examples and bad fixtures
- release evidence under `releases/1.5.0/`

### Readiness States

| State | Meaning |
|---|---|
| `NOT_READY` | Work exists, but evidence is insufficient or incomplete |
| `READY_FOR_DEMO` | Safe to demonstrate in a controlled environment |
| `READY_FOR_INTERNAL_HANDOFF` | Safe to hand to an internal operator or teammate with known limits |
| `READY_FOR_RELEASE_REVIEW` | Ready for a separate release approval process |
| `BLOCKED` | Must stop until a human decision or missing evidence is resolved |

### Human Decision Boundary

Codex may recommend a readiness state. Codex must not approve:

- production launch
- legal or compliance acceptance
- payment, tax, privacy, or security acceptance
- data migration or irreversible operation
- customer-facing promise beyond verified evidence

### Acceptance

- A ready state requires verification evidence.
- Open human decisions block ready states.
- BL0 cannot be described as production-ready.
- Overclaims are rejected by machine checks.
- Empty target projects are not punished when no launch readiness report exists.

## 1.6.0 Conversation Drift Control

### Problem

During a task, users often ask questions, change direction, add a new idea, or raise risk. A capable Codex can drift by treating any user message as permission to continue or expand scope.

The goal is not to restrict conversation. The goal is to make Codex classify the new turn before acting.

### Deliverables

- `core/conversation-drift-control.md`
- `templates/conversation-turn-classification.md`
- `templates/scope-change-report.md`
- `checklists/conversation-drift-review.md`
- `prompts/conversation-router-agent.md`
- `docs/conversation-drift-control.md`
- `conversation-turns/`
- `scope-change-reports/`
- `scripts/check-conversation-drift.mjs`
- CLI command: `conversation-drift`
- examples and bad fixtures
- release evidence under `releases/1.6.0/`

### Intent Classification

| Intent | Default behavior |
|---|---|
| `DISCUSS_ONLY` | Answer or discuss; do not write files |
| `ANSWER_TO_PENDING_QUESTION` | Use answer to continue current approved task |
| `CONTINUE_CURRENT_TASK` | Continue current task inside existing scope |
| `SCOPE_CHANGE` | Stop for decision or create a scope change report |
| `NEW_TASK` | Do not merge into current task silently |
| `DIRECT_FOLLOW_UP` | Suggest next entry; do not execute inside current task |
| `RISK_DECISION` | Stop for human decision |
| `PAUSE_OR_STOP` | Stop execution |
| `REVIEW_ONLY` | Review and report; do not modify files |
| `MEMORY_CANDIDATE` | Record as candidate only, if useful |
| `OUT_OF_SCOPE_OBSERVATION` | Mention separately; do not execute |

### Acceptance

- Discussion-only turns cannot authorize writes.
- Scope changes and risk decisions require a human decision.
- Direct follow-ups cannot be silently folded into the current task.
- Router artifacts are optional for tiny turns, but required when ambiguity affects scope, risk, or execution.

## Goal And Subagent Orchestration

This batch uses Goal Mode as the primary execution container:

```text
Goal: finish the 1.4.1, 1.5.0, and 1.6.0 upgrade batch.
```

Subagents may be used for read-only review, checklist inspection, and repair analysis. The main thread remains the only writer.

Required subagent governance:

- one active writer at most
- subagents are `CLOSED` or `SKIPPED` before final response
- subagent findings are advisory until the main thread applies and verifies them
- no subagent may approve release, risk, privacy, payment, migration, production, or commercial decisions

## Execution Order

1. Add 1.4.1 polish docs and wording cleanup.
2. Add 1.5 safe launch rules, templates, checker, examples, fixtures, and CLI entry.
3. Add 1.6 conversation drift rules, templates, checker, examples, fixtures, and CLI entry.
4. Update manifest, workflow version, docs, platform adapters, CI, PR templates, and generated-project checks.
5. Run syntax, fixture, manifest, and full dev-kit self-checks.
6. Commit and push only after checks pass.

## Evidence Required For This Upgrade

- source repo check passes
- generated project receives required lightweight assets
- bad fixtures fail for missing launch evidence, launch overclaim, discussion-only writes, scope creep, and risk auto-continue
- README and reference docs include the new user-facing entry points
- release notes state limitations clearly

## Completion Criteria

This upgrade is complete when:

- `VERSION.md`, `package.json`, `dev-kit-manifest.json`, `templates/workflow-version.json`, and `templates/version-record.md` all agree on `1.6.0`
- `node scripts/check-launch-readiness.mjs .` passes
- `node scripts/check-conversation-drift.mjs .` passes
- `node scripts/check-manifest.mjs` passes
- `node scripts/check-fixtures.mjs` passes
- `node scripts/check-dev-kit.mjs` passes
- the commit excludes local scratch and `.DS_Store`
