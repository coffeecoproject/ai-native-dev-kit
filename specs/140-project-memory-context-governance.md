# Spec 140: Project Memory & Context Governance

## Human Summary

1.4.0 adds a controlled source-of-truth layer for project memory.

## Requirements

- Add Git Boundary and Context Governance core documents.
- Add Learning Candidate, Context Correction Report, and Git Boundary Report templates.
- Add context governance checklist, Git boundary checklist, and reviewer prompt.
- Add deterministic `check-context-governance.mjs`.
- Add example and bad fixtures.
- Install new assets into generated projects.
- Update CLI, CI, manifest, workflow-version, docs, and self-check.

## Boundaries

- Candidates are not project facts until approved.
- Context corrections do not update source of truth by themselves.
- Git Boundary Reports are not approval.
- Model memory never overrides Git-backed source of truth.

## User Experience

The user should only need to decide:

- Should this observation become project memory?
- Is this correction approved?
- Should this artifact enter Git?

Codex drafts and checks the artifacts.

