# Repository Structure

IntentOS contains product docs, reusable workflow assets, examples, release evidence, and test fixtures in one repository.

The repository is intentionally not organized like a normal application codebase.

## Root Directory Classes

| Class | Examples | Purpose |
|---|---|---|
| Product entry | `README.md`, `README.zh-CN.md`, `VERSION.md` | Explain what IntentOS is and what version is current |
| Core governance | `core/` | Source governance rules used by docs, templates, scripts, and generated projects |
| User docs | `docs/` | Current operator docs, references, plans, roadmaps, and adoption playbooks |
| Templates and prompts | `templates/`, `prompts/`, `checklists/` | Assets copied into or used by governed projects |
| Scripts | `scripts/` | CLI, resolvers, checkers, and shared libraries |
| Platforms and starters | `platforms/`, `starters/`, `profiles/` | Project-specific adapters and starter assets |
| Baseline packs | `standard-baseline-packs/`, `industrial-packs/` | Standard and industrial baseline package definitions |
| Evidence and examples | `examples/`, `releases/`, `test-fixtures/` | Verification, release evidence, and negative cases |
| Workflow artifacts | `requests/`, `tasks/`, `review-packets/`, `conversation-ask-cards/`, `apply-plans/`, `apply-readiness-reports/`, `work-queue/` | IntentOS artifact contract used by scripts and generated projects |

## Why Many Root Artifact Directories Remain Flat

Directories such as these intentionally remain at the repository root:

```text
requests/
preflight/
specs/
evals/
tasks/
review-packets/
review-loop-reports/
apply-plans/
apply-readiness-reports/
conversation-ask-cards/
work-queue/
hook-policies/
workflow-guidance-cards/
baseline-decision-cards/
delivery-path-reports/
debt-handoff-reports/
execution-closures/
```

They are not random folders. They are part of the workflow artifact contract.

Moving them would change generated-project paths, examples, checkers, and user expectations. For 1.36, the repository documents these directories instead of moving them.

## Docs Directory Structure

```text
docs/
  README.md                  documentation front door
  index.md                   complete documentation map
  repository-structure.md    repository directory policy
  document-ownership.md      source-of-truth rules
  reference/                 command, checker, artifact, and baseline references
  adoption-playbooks/        new/existing/governed/production project adoption
  migrations/                version migration guidance
  plans/                     historical implementation plans
  roadmaps/                  forward-looking roadmap docs
```

Current operating docs stay directly under `docs/`. Historical implementation plans and roadmaps do not.

## Change Policy

- Do not move root workflow artifact directories without a dedicated compatibility release.
- Do not move generated-project output paths as part of documentation cleanup.
- Do not delete historical plans; move them under `docs/plans/`.
- Do not delete roadmap documents; move them under `docs/roadmaps/`.
- Update `dev-kit-manifest.json`, README links, and self-checks whenever documentation source paths move.
