# Document Ownership

This page defines which documents are source of truth and which documents are supporting evidence.

## Ownership Map

| Area | Source Of Truth | Supporting Docs |
|---|---|---|
| Product positioning | `README.md`, `README.zh-CN.md` | `docs/README.md`, `docs/index.md` |
| Current version | `VERSION.md` | `releases/<version>/release-record.md` |
| Core workflow rules | `core/*.md` | `docs/*.md`, `templates/*.md`, `checklists/*.md`, `prompts/*.md` |
| CLI behavior | `scripts/cli.mjs`, resolver/checker scripts | `docs/reference/scripts.md` |
| Artifact contract | `templates/*.md`, artifact directories | `docs/reference/artifacts.md`, `docs/artifact-decision-tree.md` |
| Check behavior | `scripts/check-*.mjs` | `docs/reference/checkers.md` |
| Baseline packs | `standard-baseline-packs/`, `industrial-packs/` | `docs/reference/standard-baseline-packs.md`, `docs/reference/industrial-packs.md` |
| Project adoption | `docs/adoption-playbooks/` | `docs/first-hour.md`, `docs/existing-project-workflow-adapter.md` |
| Historical plans | `docs/plans/` | `releases/` |
| Roadmaps | `docs/roadmaps/` | `VERSION.md` |

## Rules

- README is the product entry, not the complete manual.
- `docs/operator-manual.md` is the long-form operator manual.
- `docs/reference/` owns detailed script, checker, artifact, and baseline references.
- `docs/plans/` records historical implementation plans; plans are not current product rules by themselves.
- `docs/roadmaps/` records forward-looking or phased roadmap documents; roadmaps are not release evidence.
- `releases/` owns release evidence and verification records.
- `core/` owns governance rules; docs explain them for users.

## When Docs Disagree

Use this order:

```text
core governance / script behavior
-> current docs usage page
-> reference docs
-> release evidence
-> historical plan
-> roadmap
```

If a lower-priority doc conflicts with a higher-priority doc, update the lower-priority doc or mark it historical. Do not silently treat historical plans as active behavior.

## Cleanup Boundary

Document ownership does not authorize deletion, archival, link rewrites, or source-of-truth changes by itself.

Any cleanup action must go through Document Lifecycle and, if files may move or links may change, Document Archive Apply or Unified Apply Plan.

