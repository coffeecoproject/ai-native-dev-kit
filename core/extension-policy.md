# Dev Kit Extension Policy

## Purpose

This policy controls how the AI Native Dev Kit may be extended without diluting the workflow or binding the core layer to a specific platform, product, business domain, or tool.

## Layer Rules

### Core

`core/` contains rules that must apply to every software project.

Allowed:

- workflow stages
- task levels
- gates
- platform strategy
- extension policy
- skill governance
- automation governance

Not allowed:

- iOS-specific rules
- Android-specific rules
- Web-specific rules
- business-domain rules
- concrete technology stack commands
- concrete project facts

### Templates

`templates/` contains reusable forms used by all projects.

Allowed:

- request card
- preflight report
- spec
- eval
- task card
- AI task log
- workflow retro
- workflow improvement
- workflow daily summary
- dev kit change proposal
- skill candidate
- project automation proposal
- daily automation prompt
- profile template
- starter readiness template
- platform risk policy template
- verification matrix template
- baseline selection template
- baseline evidence template

Not allowed:

- default business assumptions
- concrete domain models
- concrete platform commands unless clearly marked as examples or placeholders

### Checklists

`checklists/` contains review gates for assets and changes.

Allowed:

- scope review
- risk review
- verification review
- release review
- profile review
- starter review
- industrial pack review
- core purity review
- self-iteration review
- skill review
- automation review

Not allowed:

- one-project acceptance decisions
- one-platform release instructions in generic checklists

### Profiles

`profiles/<profile-name>/profile.md` contains platform or project-type rules.

Examples:

- `web-app`
- `backend-api`
- `ios-app`
- `android-app`
- `internal-admin`
- `high-risk-change`

Profiles may define platform-specific or project-type-specific risks and verification expectations, but they must not include current project facts such as app name, bundle ID, package name, API URL, production credentials, team member names, or release accounts.

### Industrial Packs

`industrial-packs/<pack-name>/` contains industrial delivery standards, evidence requirements, audit entry points, and bootstrap assets.

Industrial packs may be platform-specific or capability-specific, but they are standards, not project evidence.

Allowed:

- BL2 industrial evidence standards
- pack metadata and schema
- required baselines, execution docs, audit docs, checklists, and templates
- task-level escalation rules
- human approval requirements
- release, recovery, security, privacy, and operations evidence expectations

Not allowed:

- concrete app names
- bundle IDs or package names
- production API URLs
- production accounts
- certificates, provisioning identifiers, credentials, tokens, or secrets
- real customer data
- team member names
- customer-specific business decisions

`industrial-pack-candidates/` is a staging area for legacy material. Candidate packs are not official workflow assets and must not be copied into target projects by initialization.

### Starters

`starters/<starter-name>/` contains files copied into a new project.

Starters may be platform-oriented, but must still preserve the AI Native workflow structure.

Starters are not complete when copied manually. Complete initialization must go through `scripts/init-project.mjs`, which injects shared `.ai-native/` workflow assets, workflow scripts, and CI workflow files.

Starters should keep project-specific `scripts/verify.sh`, but must not duplicate shared workflow scripts such as `check-ai-workflow.mjs`, `summarize-ai-logs.mjs`, or `check-workflow-version.mjs`. Those scripts are injected from the current dev-kit version during initialization.

Starter examples:

- `generic-project`
- `codex-web-app`
- `codex-ios-app`
- `codex-android-app`

### Platforms

`platforms/` means AI/tooling platforms, not target application platforms.

Examples:

- Codex
- Cursor
- Claude
- GitHub

Do not place iOS, Android, Web, or Backend rules here. Those belong in `profiles/` and `starters/`.

### Project

Concrete project facts belong only in the generated project:

- project `AGENTS.md`
- `docs/product-vision.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/permission-model.md`
- `docs/test-strategy.md`
- request/spec/eval/task files
- `ai-logs/`
- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`
- `automation-proposals/`
- `dev-kit-proposals/`

## Extension Admission Rules

Any new profile must pass:

- `templates/profile.md`
- `checklists/profile-review.md`
- `scripts/check-dev-kit.mjs`

Any new starter must pass:

- `templates/starter-readiness.md`
- `checklists/starter-review.md`
- `scripts/check-dev-kit.mjs`

Any new industrial pack must pass:

- `industrial-packs/schema/pack.schema.json`
- `checklists/industrial-pack-review.md`
- `scripts/check-industrial-pack.mjs`
- `scripts/check-industrial-baseline.mjs` in at least one approved dogfood project before marking the pack stable
- `scripts/check-dev-kit.mjs`

Any change to `core/`, `templates/`, `prompts/`, or default starter must pass:

- `checklists/core-purity-review.md`
- business/platform coupling scan in `scripts/check-dev-kit.mjs`

Any proposed shared workflow change should come from one of:

- repeated project evidence in `ai-logs/`
- milestone evidence in `workflow-retros/`
- a concrete `workflow-improvements/` entry
- a reviewed `skill-candidates/` entry
- a reviewed `automation-proposals/` entry
- an explicit platform/profile/starter expansion need

Do not update shared core workflow from a one-off project preference without review.

## Default Starter Rule

The default starter must remain business-neutral and target-platform-neutral.

Current default:

```text
generic-project
```

Platform-specific starters may exist, but the default initializer must not silently choose one of them.

## Naming Rules

Profiles:

```text
profiles/<kebab-case-name>/profile.md
```

Industrial packs:

```text
industrial-packs/<kebab-case-name>/pack.md
industrial-packs/<kebab-case-name>/pack.json
```

Starters:

```text
starters/<kebab-case-name>/
```

Examples:

```text
examples/<kebab-case-name>/
```

## Review Questions

Before adding or changing an asset, ask:

1. Is this universal, platform-specific, project-type-specific, or project-specific?
2. Is it in the correct layer?
3. Does it weaken any gate?
4. Does it introduce business assumptions into core?
5. Does it require verification?
6. Does it define stop conditions?
7. Does it preserve human approval for high-risk changes?
