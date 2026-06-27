# Decision Brief 140: Context Source-of-Truth Boundary

## Human Summary

This decision keeps project memory human-confirmed and Git-backed.

## Decision Needed

Should 1.4 allow Codex to persist learned context automatically?

## Recommendation

No. Codex may draft learning candidates and context corrections, but human confirmation is required before project source of truth changes.

## Rationale

- Model memory can be stale, incomplete, or wrong.
- Historical AI logs can conflict with current user instructions.
- Project facts need auditability and version control.
- Secret and local-context boundaries require explicit governance.

## Decision

Approved: Project Memory & Context Governance will be candidate-first and human-confirmed.

## Consequences

- Learning candidates are proposals only.
- Context corrections need evidence and human decision.
- Git Boundary Reports are evidence, not approval.
- Git-backed source of truth has higher authority than model memory.

