# Starter Review Checklist

Use this checklist before adding or changing `starters/<name>/`.

Starters must be validated through `scripts/init-project.mjs`; direct copying a starter is not considered a complete project initialization.

## Required Files

- [ ] `AGENTS.md`
- [ ] `README.md`
- [ ] `docs/ai-workflow.md`
- [ ] Generated project receives onboarding docs from templates
- [ ] `docs/product-vision.md`
- [ ] `docs/architecture.md`
- [ ] `docs/domain-model.md`
- [ ] `docs/permission-model.md`
- [ ] `docs/test-strategy.md`
- [ ] `requests/.gitkeep`
- [ ] `preflight/.gitkeep`
- [ ] `specs/.gitkeep`
- [ ] `evals/.gitkeep`
- [ ] `tasks/.gitkeep`
- [ ] `ai-logs/.gitkeep`
- [ ] `workflow-retros/.gitkeep`
- [ ] `workflow-improvements/.gitkeep`
- [ ] `skill-candidates/.gitkeep`
- [ ] `automation-proposals/.gitkeep`
- [ ] `intentos-proposals/.gitkeep`
- [ ] `releases/.gitkeep`
- [ ] `scripts/verify.sh`
- [ ] `.github/pull_request_template.md`

## Rules

- [ ] Preserves request/preflight/spec/eval/task/log structure
- [ ] Does not include secrets or private config
- [ ] Does not include concrete project facts
- [ ] Does not weaken high-risk boundaries
- [ ] `scripts/verify.sh` is executable by `bash`
- [ ] Generated project can receive `.intentos` assets
- [ ] Generated project can receive `scripts/check-ai-workflow.mjs`
- [ ] Generated project can receive injected workflow scripts
- [ ] Generated project can receive GitHub workflow checks
- [ ] Generated project can run `scripts/check-project-onboarding.mjs`
- [ ] `scripts/init-project.mjs --target <tmp>` produces a project that passes workflow check
- [ ] `scripts/init-project.mjs --target <tmp> --update-workflow-assets` updates workflow assets without touching project docs/specs/tasks
- [ ] Starter PR template includes Skill / Automation Governance
- [ ] Starter does not duplicate injected workflow scripts

## Decision

APPROVE / REQUEST_CHANGES / BLOCK
