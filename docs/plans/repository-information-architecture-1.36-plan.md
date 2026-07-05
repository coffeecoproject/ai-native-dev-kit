# Repository Information Architecture 1.36 Plan

## Summary

`1.36.0` turns the repository from a flat internal workbench into a clearer product repository for IntentOS.

This is not a workflow behavior change. It is an information architecture and documentation consistency upgrade.

## Problem

The repository currently exposes too many implementation and evidence directories at the top level. This makes the project look like a loose collection of workflow artifacts instead of a coherent product.

The `docs/` folder also mixes current operating docs, historical version plans, roadmap docs, and reference docs in one flat layer.

## Goals

- Make README a product entry page, not a command index.
- Make `docs/` navigable through a small set of stable entry points.
- Move historical implementation plans into `docs/plans/`.
- Move roadmap documents into `docs/roadmaps/`.
- Add a repository structure guide explaining why some root workflow artifact directories remain flat.
- Add document ownership rules that define the source of truth for each document class.
- Keep existing generated-project and workflow artifact paths stable.
- Keep self-check and manifest coverage aligned with the new information architecture.

## Non-Goals

This release does not:

- move root workflow artifact directories such as `requests/`, `tasks/`, `review-packets/`, `apply-plans/`, `work-queue/`, or `hook-policies/`;
- change generated-project artifact output paths;
- change CLI command behavior;
- change adoption, baseline, review, hook, or apply-plan semantics;
- delete historical documents;
- archive release evidence;
- change license terms.

## Source Of Truth Rules

| Document Class | Source Of Truth |
|---|---|
| Product entry | `README.md`, `README.zh-CN.md` |
| Documentation index | `docs/README.md`, `docs/index.md` |
| Operator usage | `docs/operator-manual.md`, `docs/quickstart.md`, `docs/first-hour.md` |
| Current workflow governance | `core/*.md`, matching `docs/*.md` usage pages |
| Reference material | `docs/reference/` |
| Adoption playbooks | `docs/adoption-playbooks/` |
| Historical implementation plans | `docs/plans/` |
| Roadmaps | `docs/roadmaps/` |
| Version evidence | `releases/` |
| Workflow artifact examples/evidence | existing root artifact directories and `examples/` |

## Directory Policy

### Keep Flat At Root For Compatibility

The following root directories are workflow artifact directories and remain stable:

```text
requests/
preflight/
specs/
evals/
tasks/
review-packets/
review-loop-reports/
apply-plans/
work-queue/
hook-policies/
workflow-guidance-cards/
baseline-decision-cards/
delivery-path-reports/
debt-handoff-reports/
execution-closures/
```

These are part of the IntentOS artifact contract. Moving them would break scripts, examples, generated projects, or user expectations.

### Move Under Docs

Historical planning and roadmap documents should not live beside current usage docs.

Move:

```text
docs/*-1.*-plan.md -> docs/plans/
docs/*roadmap*.md -> docs/roadmaps/
```

Keep current usage docs in `docs/` root when they describe active behavior.

## Execution Plan

1. Add `docs/README.md`.
2. Add `docs/index.md`.
3. Add `docs/repository-structure.md`.
4. Add `docs/document-ownership.md`.
5. Add `docs/plans/README.md`.
6. Add `docs/roadmaps/README.md`.
7. Move historical plan documents to `docs/plans/`.
8. Move roadmap documents to `docs/roadmaps/`.
9. Update internal links and hard-coded checker paths.
10. Update manifest and version metadata.
11. Add release evidence under `releases/1.36.0/`.
12. Run full governance checks.

## Safety Checks

Required checks:

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify:release
git diff --check
```

## Acceptance Criteria

- README explains IntentOS clearly without becoming a command dump.
- `docs/` has a visible index and source-of-truth structure.
- Plan and roadmap docs are separated from current usage docs.
- Existing root artifact directories are explained, not hidden.
- Manifest source inventory matches moved files.
- Self-check passes.
- No generated-project artifact paths are changed.

