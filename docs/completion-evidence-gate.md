# Completion Evidence Gate

Completion Evidence Gate answers one user-facing question:

```text
Can Codex say this task is complete?
```

It does not run tests. It does not decide whether the product is correct. It checks whether the current task has a complete evidence chain:

```text
Business Rule Closure
-> Verification Plan
-> Test Evidence
-> Execution Assurance
-> Completion Evidence Gate
```

From 1.78.1, strict mode also checks that this is one real source chain, not
four unrelated ready reports. It verifies:

- Verification Plan points to the same Business Rule Closure.
- Test Evidence points to the same Verification Plan.
- Execution Assurance points to the same Test Evidence.
- Source digests match the referenced artifacts.
- Source intent digests match the current completion intent when available.

From 1.78.2, strict mode requires every source-chain item to include
`intent_digest`, and Execution Assurance must expose top-level `intent_digest`.
That lets Completion Evidence check Execution Assurance intent directly instead
of treating it as an indirect task/source-system match.

From 1.78.3, the compatibility rule is explicit: strict completion chains
should use one canonical task intent across Business Rule Closure, Verification
Plan, Test Evidence, Execution Assurance, and Completion Evidence, or treat the
saved task artifact as the canonical intent source. If the same task is phrased
differently in different commands, the intent digests will differ and strict
Completion Evidence should block the completion claim.

From 1.85.0, strict task-consumer mode adds Task Entry Binding. Completion
Evidence must match the current Work Queue item and the corresponding Task
Governance tier before it can say the task is complete.

```bash
node scripts/check-completion-evidence.mjs . \
  --require-task-governance \
  --require-work-queue \
  --strict-task-consumer
```

## When To Use

Use it when Codex is about to say:

- done
- completed
- ready to hand off
- ready for final response

For small discussion-only work, it can be skipped. For feature implementation, bug fixes, old-project adoption, baseline migration, and release preparation, it should be used before a completion claim.

## Human Role

The user should not need to know the internal artifact names. Codex should explain the result in plain language:

- complete
- blocked by missing test evidence
- blocked by execution assurance
- blocked by stale or mismatched task evidence

## Commands

```bash
node scripts/cli.mjs completion-evidence . \
  --intent "appointment requests must include a service time" \
  --business-rule-ref artifact:business-rule-closures/001-service-time.md \
  --verification-plan-ref artifact:verification-plans/001-service-time.md \
  --test-evidence-ref artifact:test-evidence-reports/001-service-time.md \
  --execution-assurance-ref artifact:execution-assurance-reports/001-service-time.md \
  --out completion-evidence-reports/001-service-time.md

node scripts/cli.mjs completion-evidence-check . \
  --report completion-evidence-reports/001-service-time.md \
  --require-structured-evidence \
  --require-source-refs \
  --require-ready
```
