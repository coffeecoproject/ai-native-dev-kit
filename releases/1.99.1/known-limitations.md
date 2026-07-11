# IntentOS 1.99.1 Known Limitations

## Deterministic Review Detection

The review-context checker detects known classes of direction drift. It does not
prove that every natural-language recommendation is semantically correct.
Independent review still evaluates the actual task and evidence.

## Compatibility Vocabulary

Existing schemas and artifacts still contain fields such as `owner`,
`reviewer`, `human_decision`, and `*_owner_ref`. They remain for compatibility
and are translated through the current product contract. Renaming every field
would be a separate compatibility migration.

## Historical Records

Prior releases, completed plans, examples, and logs are not rewritten. They are
classified as historical and cannot define current product direction, but a
tool that ignores the review-context contract can still quote them incorrectly.

## External Authority

IntentOS cannot prove legal identity, regulatory correctness, provider-account
ownership, third-party permission, or platform authority from the current chat
identity. Only the dependent external action remains blocked.

## Capability Scope

1.99.1 prevents reviewers from expanding scope merely because a capability or
pack exists. A richer required/recommended/deferred/not-applicable capability
model is intentionally deferred until concrete runtime evidence requires it.

