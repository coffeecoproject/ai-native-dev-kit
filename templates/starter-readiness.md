# Starter Readiness: <starter-name>

## Purpose

What kind of new project does this starter initialize?

Starters are not standalone deliverables. They are copied through `scripts/init-project.mjs`, which also injects shared `.intentos/` workflow assets, workflow scripts, and CI workflow files.

## Applies To

- 

## Does Not Apply To

- 

## Linked Profiles

- 

## Required Files

- [ ] `AGENTS.md`
- [ ] `README.md`
- [ ] `docs/ai-workflow.md`
- [ ] generated project receives `docs/project-onboarding.md`
- [ ] generated project receives `docs/engineering-baseline.md`
- [ ] generated project receives `docs/project-profile.md`
- [ ] generated project receives `docs/tech-stack-strategy.md`
- [ ] generated project receives `docs/business-spec-index.md`
- [ ] generated project receives `docs/sample-policy.md`
- [ ] generated project receives `docs/onboarding-decisions.md`
- [ ] `docs/product-vision.md`
- [ ] `docs/engineering-principles.md`
- [ ] `docs/risk-policy.md`
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

## Verification

Default verification command:

```bash
bash scripts/verify.sh
```

Workflow check:

```bash
node scripts/check-ai-workflow.mjs .
```

## Platform / Stack Notes

What must the user edit after initialization?

- 

## Risk Boundaries

What high-risk areas must remain explicitly gated?

- 

## Completion Criteria

- [ ] Initializer can copy this starter
- [ ] Generated project passes `check-ai-workflow.mjs`
- [ ] Generated project includes injected `.intentos/` assets
- [ ] Generated project includes injected `scripts/check-ai-workflow.mjs`
- [ ] Generated project includes injected workflow scripts
- [ ] Generated project includes injected workflow CI
- [ ] Generated project includes onboarding prompt, templates, checklist, docs, and `check-project-onboarding.mjs`
- [ ] Generated project includes engineering baseline prompt/docs/checklist and `check-engineering-baseline.mjs`
- [ ] Default verify script gives a useful result before stack setup
- [ ] Starter does not contain project-specific secrets or facts
- [ ] Starter does not weaken core gates
