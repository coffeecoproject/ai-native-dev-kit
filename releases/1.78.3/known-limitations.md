# IntentOS 1.78.3 Known Limitations

## Scope

1.78.3 is a documentation and compatibility-notes patch for the 1.78
Completion Evidence line.

It does not change checker behavior, add a new gate, approve implementation,
run tests, or prove real-environment behavior.

## Limitations

- Older 1.78.0 / 1.78.1 Completion Evidence reports may fail 1.78.2+ strict
  checks until regenerated or patched with `source_chain[].intent_digest`.
- Execution Assurance reports used as strict Completion Evidence sources must
  include top-level `intent_digest`; older reports without that field should be
  regenerated from the current resolver.
- Strict chains still rely on using one canonical task intent across Business
  Rule Closure, Verification Plan, Test Evidence, Execution Assurance, and
  Completion Evidence. Intent paraphrases can intentionally produce different
  digests.
- This patch documents compatibility expectations only. It does not inspect
  real project repositories or repair existing project evidence automatically.
- Completion Evidence remains a completion-claim gate. It does not replace
  business review, test execution, release approval, production validation, or
  customer-facing rollout decisions.
