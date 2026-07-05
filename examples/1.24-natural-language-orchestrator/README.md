# 1.24 Natural Language Orchestrator Example

This example shows the default user-facing entry for IntentOS.

The user does not need to choose `workflow-map`, `doc-lifecycle`, `work-queue`, or `hook-plan`.
Codex reads the project in read-only mode, chooses the safe internal route, and returns one Workflow Guidance Card.

## Scenario

A user asks:

```text
Please read this existing project first. Do not change files. Tell me the safest next step.
```

Expected behavior:

- do not write target files
- do not modify CI
- do not install hooks
- do not delete or archive documents
- do not change task state
- explain the next step in plain language
- keep internal workflow names hidden in plain mode

## Evidence

- `workflow-guidance-cards/001-existing-project.md`

