# 1.66.0 Known Limitations

1.66.0 is a reconciliation and recommendation release.

It does not make IntentOS the automatic winner over existing project rules.

## Limits

- Reconciliation is only as complete as the previous Native Migration Plan input.
- Resolver output is conservative and may return `NEEDS_HUMAN_DECISION` when old rules are unclear.
- Existing project release and production rules stay human-owned or external-system-owned.
- `ADOPT_INTENTOS` is allowed only for low/medium-risk engineering baseline gaps.
- `MERGE` is a future wording proposal, not a write operation.
- `GAP_SUGGESTION` is release-review input, not release approval.
- The checker validates report structure and boundaries; it does not prove the real project rules are complete.
- It does not execute a governance replacement, apply plan, release, deployment, provider command, migration, hook installation, CI change, secret change, or production mutation.

## False Positive / False Negative Notes

- False positives may occur when evidence references contain words that look like protected surfaces.
- False negatives may occur when project-specific protected language is absent from extracted Native Migration rules.
- High-risk or ambiguous cases should remain `NEEDS_HUMAN_DECISION`, `CONFLICT_HIGH_RISK`, or `UNKNOWN_AUTHORITY`.
