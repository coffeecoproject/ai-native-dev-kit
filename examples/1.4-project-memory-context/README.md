# 1.4 Project Memory & Context Governance Example

## Human Summary

This example shows how Codex records project-memory candidates without turning them into project facts automatically.

## Scenario

During a task, Codex observes that the project repeatedly treats project status as a lookup table instead of an enum. The observation may become useful future context, but it still needs human confirmation before it becomes a baseline rule.

## Flow

```text
Observation
  -> Learning Candidate
  -> Human Decision
  -> Context Correction if existing docs are wrong
  -> Source-of-truth update after approval
```

## Included Artifacts

- `learning-candidates/001-status-source.md`
- `context-corrections/001-status-source-correction.md`
- `git-boundary-reports/001-context-artifacts.md`

## Verification

```bash
node scripts/check-context-governance.mjs examples/1.4-project-memory-context
```

