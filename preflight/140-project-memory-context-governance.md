# Preflight 140: Project Memory & Context Governance

## Human Summary

The phase is allowed as a governance-layer upgrade, not as AI self-learning or automatic project-rule mutation.

## Project State

- Current IntentOS version before this phase: 1.3.0.
- Working tree before implementation: only local `.DS_Store` untracked.
- Existing source-of-truth pattern: manifest-driven assets, deterministic checks, release evidence, and workflow artifacts.

## Risks

- Overstating memory as self-learning.
- Letting candidates become rules without human confirmation.
- Storing secrets, raw conversations, or local machine details.
- Creating a heavy mandatory workflow for every small task.

## Stop Conditions

- Any design that lets Codex automatically persist unconfirmed context as fact.
- Any design that stores raw conversations or secrets.
- Any design that treats project memory as approval.

## Decision

Proceed with a bounded 1.4 implementation.

