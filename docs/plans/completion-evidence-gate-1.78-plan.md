# 1.78 Completion Evidence Gate Plan

## Purpose

IntentOS already has Business Rule Closure, Verification Plan, Test Evidence, and Execution Assurance. The remaining gap is completion overclaim:

```text
Codex may say "done" even when one upstream proof artifact is missing, stale, or from another task.
```

1.78 adds a final read-only Completion Evidence Gate so a task-completion claim can be checked as one chain.

## User Outcome

The user should not need to understand every internal checker. Codex can answer:

```text
Can I claim this task is complete?
```

The answer is `Yes` only when all required source artifacts are present, ready, and bound to the same task.

## Required Source Chain

| Source | Required ready outcome |
|---|---|
| Business Rule Closure | `READY_FOR_IMPACT_COVERAGE` |
| Verification Plan | `VERIFICATION_PLAN_READY` |
| Test Evidence | `TEST_EVIDENCE_COMPLETE` |
| Execution Assurance | `VERIFIED_DONE` and `can_claim_done: Yes` |

## Scope

Add:

- `completion-evidence` command
- `completion-evidence-check` command
- `scripts/resolve-completion-evidence.mjs`
- `scripts/check-completion-evidence.mjs`
- `completion-evidence-reports/`
- Completion Evidence schema, template, checklist, prompt, core doc, and user doc
- Positive example binding BRC -> Verification Plan -> Test Evidence -> Execution Assurance -> Completion Evidence
- Bad fixtures for missing Test Evidence, task mismatch, and unverified execution

## Non-Goals

Completion Evidence Gate does not:

- run tests
- design tests
- write target files
- approve implementation
- approve commit or push
- approve release or production
- prove product correctness
- prove real-environment behavior
- replace BRC, Verification Plan, Test Evidence, or Execution Assurance

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Expected:

- positive example passes strict Completion Evidence checks
- bad fixtures are rejected
- generated project smoke can produce and check a Completion Evidence report
- package, manifest, workflow version, README, and release record all show `1.78.0`
