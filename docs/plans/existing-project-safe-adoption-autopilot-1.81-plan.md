# Existing Project Safe Adoption Autopilot 1.81 Plan

## Purpose

1.81 turns existing-project adoption into a safe, user-facing autopilot.

The user should be able to say:

```text
把这个老项目接入 IntentOS。
```

Codex should then do the expert work internally and return a plain result:

- what kind of project this is;
- whether IntentOS can be used safely now;
- whether any project authority changed;
- whether any files were written;
- what is blocked and why;
- what Codex can safely do next.

The user should not need to understand native migration, rule reconciliation,
governance convergence, adoption assurance, controlled apply readiness, or
release planning terminology.

## Scope Split

The review for 1.81 correctly identified that this feature must be split.

### 1.81.0: Read-Only Autopilot And Result Card

1.81.0 implements only:

- read-only existing-project adoption autopilot;
- one public `adopt` entry;
- a user-readable adoption result card;
- structured evidence for the result card;
- checker coverage for unsafe claims, technical user burden, and write claims;
- examples and bad fixtures.

1.81.0 does not write target-project files.

### 1.81.1: Safe Docs-Only Record

1.81.1 may add docs-only records, but only with:

- explicit write ledger;
- git boundary evidence;
- allowlisted paths;
- no authoritative project-rule edits;
- no `.intentos/`, `AGENTS.md`, CI, hook, release, code, config, runtime, DB,
  API, Web, Docker, production, secret, DNS, payment, provider, data,
  compliance, legal, HR, finance, or tax changes.

### 1.81.2: Public Entry Integration

1.81.2 may connect `start --adopt` or stronger public routing. `start` itself
must remain read-only and must not silently become a migration command.

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `docs/for-existing-projects.md`
- `docs/native-first-existing-project-migration.md`
- `docs/existing-rule-reconciliation.md`
- `docs/existing-project-governance-convergence.md`
- `docs/adoption-execution-assurance.md`
- `scripts/cli.mjs`
- `scripts/workflow-next.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/check-intentos.mjs`

WorkControl, AiCoffeeCo, or other local project observations may be used only
as calibration evidence. They must not become hard-coded public rules.

## Problem Statement

### Problem 1: Expert Workflow Leaks To Users

Existing projects already have multiple internal checks. The problem is not
missing diagnosis; the problem is that Codex can expose the diagnosis as a list
of expert commands and blockers.

1.81.0 must hide internal sequencing and return a single clear adoption result.

### Problem 2: Human Decisions Are Too Technical

The user should not be asked questions such as:

```text
是否进入 selected native adoption？
是否批准 agent rule convergence？
```

1.81.0 must translate decisions into ordinary questions about permission and
risk. If the only safe next step is read-only, it should continue without asking.

### Problem 3: "Available For Safe Use" Is Not "Fully Adopted"

Old projects can use IntentOS as a working method before IntentOS assets are
installed or before project authority changes.

1.81.0 must explicitly separate:

```text
intentos_working_mode: AVAILABLE_FOR_SAFE_USE
project_authority_changed: No
native_assets_installed: No
full_adoption_claim: No
```

Do not use user-facing phrasing that implies hidden authority transfer, such as
"IntentOS Operating Mode ACTIVE".

## Core Model

### Safe Adoption Autopilot

The 1.81.0 flow is:

```text
user intent
-> read project signals
-> run internal read-only adoption chain
-> classify current adoption state
-> produce one result card
```

The result card is a computed view. It is not a new authority layer and does not
grant write permission.

### Safe Action Budget

1.81.0 supports only one active action level:

| Level | Name | 1.81.0 behavior |
| --- | --- | --- |
| S0 | Read-only diagnosis | Automatic after the user asks for adoption |

Future phases may add:

| Level | Name | Future behavior |
| --- | --- | --- |
| S1 | Safe docs-only record | 1.81.1 only, with ledger and allowlist |
| S2 | Collaboration/rule entry change | Requires simple confirmation |
| S3 | Code/config/runtime/CI change | Requires explicit scoped approval |
| S4 | Production/release/secrets/data/external authority | Plan only unless owner approves |

### Allowed 1.81.0 States

- `SAFE_READ_ONLY_ADOPTION_COMPLETE`
- `READY_FOR_RULE_ENTRY_REVIEW`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `BLOCKED_BY_UNSAFE_PROJECT_STATE`
- `BLOCKED_BY_PROJECT_NOT_FOUND`
- `FAILED_INVALID_EVIDENCE`

These states are internal. The user-facing result should explain them in plain
language.

## 1.81.0 Deliverables

### Protocol Assets

Add:

- `core/existing-project-safe-adoption-autopilot.md`
- `docs/existing-project-safe-adoption-autopilot.md`
- `templates/existing-project-adoption-autopilot-report.md`
- `schemas/artifacts/existing-project-adoption-autopilot.schema.json`
- `checklists/existing-project-adoption-autopilot-review.md`
- `prompts/existing-project-adoption-autopilot-agent.md`
- `adoption-autopilot-reports/.gitkeep`

### Scripts

Add:

- `scripts/resolve-existing-project-adoption-autopilot.mjs`
- `scripts/check-existing-project-adoption-autopilot.mjs`

Public CLI:

- `adopt`
- `adopt-check`

`adopt` must be read-only in 1.81.0.

### Result Card Sections

The report must include:

- `Human Summary`
- `What I Checked`
- `Current Adoption State`
- `Safe Action Budget`
- `What I Did Not Change`
- `What Codex Can Safely Do Next`
- `Human Decisions Needed`
- `Technical Trace`
- `Boundaries`
- `Machine-Readable Evidence`
- `Outcome`

Only `Technical Trace` and `Machine-Readable Evidence` may expose internal
subsystem names.

### Checker Requirements

The checker must reject:

- missing required sections;
- secret-like content;
- claims that files were written in 1.81.0;
- claims that project authority changed;
- claims that native assets were installed;
- claims that full adoption is complete;
- user-facing burden that asks non-technical users to understand internal
  subsystem names;
- runtime, production, release, CI, hook, code, config, DB, API, Web, Docker,
  secret, DNS, payment, provider, data, compliance, legal, HR, finance, or tax
  approval claims;
- invalid or missing structured evidence when strict mode is used;
- structured evidence whose digest does not match.

### Examples

Add examples for:

- governed project read-only adoption;
- light existing project read-only adoption;
- dirty project blocked safely.

### Bad Fixtures

Add bad fixtures for:

- technical user-facing prompt burden;
- false full-adoption claim;
- write claim in 1.81.0;
- project authority changed claim.

## Acceptance Plan

Run:

```bash
node --check scripts/resolve-existing-project-adoption-autopilot.mjs
node --check scripts/check-existing-project-adoption-autopilot.mjs
node scripts/cli.mjs adopt . --intent "接入 IntentOS 老项目工作流"
node scripts/cli.mjs adopt-check . --allow-empty
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/light-existing --require-structured-evidence
node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/dirty-blocked --require-structured-evidence
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixtures must fail under `--require-structured-evidence`.

## Non-Goals

1.81.0 does not:

- install `.intentos/`;
- create or replace `AGENTS.md`;
- write adoption records into target projects;
- modify CI, hooks, release SOP, package files, code, DB, API, Web, Docker,
  production configuration, secrets, DNS, payment, provider state, data,
  compliance, legal, HR, finance, or tax assets;
- approve implementation, commit, push, release, production, app-store review,
  or mini-program review;
- replace existing stricter project rules;
- hard-code WorkControl or AiCoffeeCo behavior.

## Release Definition

1.81.0 is successful when:

- existing projects can ask for adoption through one read-only command;
- Codex can continue through read-only diagnosis without asking the user to pick
  expert commands;
- the result is understandable to a non-technical user;
- the report proves no authority or target-file write occurred;
- full adoption is not claimed until later apply/evidence systems prove it.
