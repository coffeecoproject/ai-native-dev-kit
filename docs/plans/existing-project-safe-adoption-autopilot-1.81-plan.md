# Existing Project Safe Adoption Autopilot 1.81 Plan

## Purpose

1.81 should turn existing-project adoption from an expert-facing workflow into a safe default autopilot.

The user should be able to say:

```text
把这个老项目接入 IntentOS。
```

Codex should then decide and execute the safe adoption path by itself as far as it can:

- identify whether the project is new, existing, governed, or production-sensitive;
- compare existing rules against IntentOS;
- preserve stricter project rules;
- reject broad or dangerous migration;
- create safe adoption records where allowed;
- verify whether the adoption is actually active;
- explain the result in plain language.

The target user experience is:

```text
zero technical participation
near-zero routine participation
human participation only when risk or authority truly escalates
```

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
- `docs/unified-apply-plan.md`
- `docs/controlled-apply-readiness.md`
- `docs/approval-record-governance.md`
- `docs/release-core-model.md`
- `docs/plans/existing-project-native-adoption-decision-1.69-plan.md`
- `docs/plans/existing-project-governance-convergence-1.70-plan.md`
- `docs/plans/adoption-execution-assurance-1.71-plan.md`
- `scripts/cli.mjs`
- `scripts/workflow-next.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/resolve-apply-plan.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `scripts/check-intentos.mjs`

WorkControl, AiCoffeeCo, or other local project observations may be used only as calibration evidence. They must not become hard-coded public rules.

## Current Baseline

IntentOS already supports:

- existing-project read-only diagnosis;
- active IntentOS Operating Mode without write permission;
- native migration recommendation;
- existing-rule reconciliation;
- governance convergence;
- adoption execution assurance;
- controlled apply readiness;
- approval records;
- release plan views;
- completion, verification, test, and release evidence gates.

The remaining gap is user experience:

```text
IntentOS can do the expert work,
but it still exposes too much expert workflow to the user.
```

## Problem Statement

### Problem 1: Internal Workflow Leaks To Users

Users should not need to understand:

- `native-migration`
- `reconcile-rules`
- `governance-convergence`
- `adoption-assurance`
- `apply-plan`
- `controlled-apply-readiness`
- `release-plan`

These are internal execution steps. A public old-project adoption flow should not ask users to sequence them or interpret them.

### Problem 2: "Ask The User" Is Still Too Technical

It is not enough to replace commands with confirmations such as:

```text
Do you approve selected native adoption?
Do you approve controlled apply readiness?
Do you approve agent rule convergence?
```

Those are still system terms.

1.81 must translate technical decisions into ordinary risk and permission questions.

### Problem 3: Safe Work Should Not Require Repeated Confirmation

When the user explicitly asks to connect an old project to IntentOS, Codex should treat that as permission to perform a bounded safe adoption pass.

The safe pass may include:

- read-only diagnosis;
- rule extraction and comparison;
- adoption recommendation;
- rejection of dangerous broad migration;
- docs-only adoption records in an allowlisted location when project state is clean and no project rule forbids it;
- read-only adoption assurance;
- plain-language status output.

It must not include runtime, production, release, CI, agent-entry, code, database, API, Web, Docker, secret, DNS, payment, provider-state, or compliance changes.

### Problem 4: Existing Projects Should Move Toward Native IntentOS Operation

Old projects should not remain permanently adapter-only just because they are governed or production-sensitive.

The target posture is:

```text
IntentOS becomes the active working mode where safe.
Existing stricter project rules remain authoritative.
Project assets converge through evidence-bound comparison and controlled apply.
```

## Scope

1.81 includes:

- an Existing Project Safe Adoption Autopilot protocol;
- a default safe action budget for existing projects;
- human decision translation rules;
- a user-facing adoption result card;
- internal orchestration of native migration, rule reconciliation, governance convergence, adoption assurance, and apply-plan readiness;
- safe docs-only adoption record behavior where allowed;
- checker coverage that rejects technical prompt burden and unsafe overclaims;
- examples and bad fixtures for old-project autopilot behavior;
- release evidence and self-check coverage.

1.81 does not include:

- automatic `.intentos/` installation;
- automatic `AGENTS.md`, CI, hook, PR template, release SOP, baseline, DB, API, Web, Docker, or production config changes;
- automatic code changes;
- automatic production release execution;
- secret, DNS, payment, provider-state, data migration, permission, compliance, legal, tax, HR, finance, privacy, or security approval;
- deleting, archiving, or rewriting old project documents;
- hard-coded WorkControl or AiCoffeeCo behavior;
- replacing human/project authority.

## Core Concept

### Safe Adoption Autopilot

Add a user-facing adoption autopilot layer:

```text
user intent -> project classification -> safe action budget -> internal adoption chain -> result card
```

The autopilot is not a new authority layer. It is an orchestration and UX layer over existing IntentOS systems.

It should produce an artifact such as:

```text
adoption-autopilot-reports/<id>.md
```

Suggested machine-readable summary:

```json
{
  "safe_adoption_autopilot": {
    "state": "PARTIAL_ADOPTION_SAFE_MODE",
    "target_project_type": "EXISTING_GOVERNED_PROJECT",
    "intent_os_operating_mode": "ACTIVE",
    "safe_action_budget": "DOCS_ONLY_LOW_RISK",
    "codex_writes_performed": "DOCS_ONLY_ALLOWLIST",
    "runtime_changes_performed": "No",
    "can_claim_full_adoption": false,
    "next_user_facing_step": "No action needed unless you want Codex to modify project rules."
  }
}
```

Allowed user-facing states:

- `SAFE_ADOPTION_NOT_STARTED`
- `SAFE_ADOPTION_IN_PROGRESS`
- `PARTIAL_ADOPTION_SAFE_MODE`
- `READY_FOR_RULE_ENTRY_REVIEW`
- `READY_FOR_CONTROLLED_APPLY_REVIEW`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `BLOCKED_BY_UNSAFE_PROJECT_STATE`
- `FAILED_INVALID_EVIDENCE`

These states must be presented in plain language. Internal subsystem states may be stored for audit, but should not dominate the user response.

## Safe Action Budget

1.81 should define action levels.

| Level | Name | Default behavior |
| --- | --- | --- |
| S0 | Read-only diagnosis | Always automatic after adoption request |
| S1 | Safe docs-only record | Automatic only when allowlisted, clean, non-authoritative, and not forbidden by project rules |
| S2 | Collaboration/rule entry change | Requires simple confirmation |
| S3 | Code/config/runtime change | Requires explicit scoped approval |
| S4 | Production/release/secret/data authority | Plan only unless the responsible owner approves |

### S0: Read-Only Diagnosis

Codex may automatically:

- inspect project structure;
- identify project type and platform;
- detect production/governed signals;
- read existing rules;
- compare baselines;
- classify rules as preserve, merge, replace candidate, or blocked;
- run read-only adoption assurance;
- produce a result card.

No user confirmation is required after the user asks for adoption.

### S1: Safe Docs-Only Record

Codex may automatically create or update docs-only adoption records when all conditions are true:

- the user explicitly requested project adoption;
- the target project has no conflicting uncommitted edits in the files to be touched;
- the write is limited to an allowlisted docs/session/adoption record path;
- the document is non-authoritative and does not replace existing project rules;
- the document clearly states that runtime, release, CI, production, and code were not changed;
- project rules do not forbid such documentation updates.

Examples:

```text
docs/intentos-bounded-apply-plan-v1.md
docs/intentos-reintegration-v1.md
docs/sessions/<session-id>.md
docs/sessions/INDEX.md
docs/DOCUMENT_GOVERNANCE.md
```

If any condition fails, Codex must fall back to no-write output and explain the reason in plain language.

### S2: Collaboration Or Rule Entry Change

Codex must ask a simple question before:

- updating `AGENTS.md`;
- updating an existing agent instruction file;
- changing project rule entry points;
- making IntentOS the visible project workflow authority.

Plain-language prompt:

```text
下一步会修改项目协作说明文件，不影响代码运行、不影响发布配置。是否继续？
```

Do not ask:

```text
是否进入 agent rule convergence？
```

### S3: Code, Config, Runtime, Or CI Change

Codex must not perform these by default.

Plain-language prompt:

```text
下一步会修改代码或项目配置。请确认是否只生成方案，还是允许我按明确范围修改。
```

### S4: Production, Release, Secrets, Data, Or External Authority

Codex must default to plan-only.

Plain-language prompt:

```text
这一步可能影响发布、生产、数据或外部系统。建议只生成方案，不执行。需要负责人确认后再继续。
```

## Human Decision Translation

1.81 must translate internal decisions into user-comprehensible questions.

| Internal decision | User-facing translation |
| --- | --- |
| `DOCS_ONLY_APPLY_PLAN` | "I will write adoption notes only. No code or config changes." |
| `AGENT_RULE_CONVERGENCE` | "I will update collaboration instructions, not runtime code." |
| `CONTROLLED_APPLY_READINESS` | "I will check whether the approved changes are safe to apply." |
| `SELECTED_NATIVE_ADOPTION` | "I recommend a limited adoption path, preserving stricter existing rules." |
| `PRODUCTION_AUTHORITY_REQUIRED` | "This touches production ownership. I will not execute it without the responsible owner." |
| `RELEASE_OWNER_REQUIRED` | "This affects release responsibility. I can draft the plan, but cannot approve release." |

Acceptance rule:

```text
If the user-facing output requires a non-technical user to understand IntentOS subsystem names, the flow fails.
```

## Desired User Experience

### Existing Governed Project

User says:

```text
把这个项目接入 IntentOS。
```

Codex responds:

```text
我会先用安全方式接入：不改代码、不改发布、不改生产配置。
```

Codex automatically performs:

- project classification;
- existing rule comparison;
- broad migration rejection where needed;
- docs-only adoption record if safe;
- adoption assurance;
- result summary.

Final response:

```text
已完成安全接入第一阶段。

当前状态：部分接入，可以按 IntentOS 工作方式协作。
已完成：项目识别、规则对比、接入计划、只读验收。
未执行：代码、CI、发布、数据库、生产配置。
下一步：如果你希望更深接入，我可以准备修改协作说明文件的方案。
```

### Existing Light Project

If the project is not production-sensitive and has no strong existing governance, Codex may recommend a deeper path:

```text
这是一个轻量老项目。可以直接采用标准 IntentOS 工作方式。
我会先完成安全文档接入，再告诉你是否建议安装项目资产。
```

### Hard Stop Case

If the project state is unsafe:

```text
我先停在安全接入前。
原因：当前工作区已有未提交改动，继续写文档可能覆盖或混淆已有工作。
我可以继续只读分析，但不会写项目文件。
```

## Internal Orchestration

The public entry should hide the internal chain:

```text
start
-> native migration
-> existing rule reconciliation
-> governance convergence
-> adoption assurance
-> bounded apply plan review
-> safe adoption result card
```

Suggested command:

```text
node scripts/resolve-existing-project-adoption-autopilot.mjs <target>
```

Public aliases should be simple:

```text
intentos adopt <target>
intentos start <target>
```

Do not make users choose internal commands.

## Execution Plan

### Phase A: Protocol And Public UX

Add or update documentation for:

- safe adoption autopilot purpose;
- safe action budget;
- human decision translation;
- public result card;
- boundaries for old projects;
- relationship to existing native migration, reconciliation, convergence, assurance, and apply-plan systems.

### Phase B: Autopilot Report And Template

Add an autopilot report template with:

- `Project Classification`
- `Safe Action Budget`
- `Actions Automatically Completed`
- `Actions Rejected`
- `Existing Rule Summary`
- `Project Authority Preserved`
- `IntentOS Working Mode`
- `Writes Performed`
- `Forbidden Surfaces Not Touched`
- `Adoption State`
- `Plain Next Step`
- `Technical Trace`

Technical trace should exist for audit, but not replace the plain result.

### Phase C: Resolver Behavior

Implement a resolver that can:

- classify project state;
- run the existing read-only chain internally;
- continue through mechanically resolvable gaps;
- classify action levels S0-S4;
- perform S1 docs-only writes only when all safe conditions pass;
- refuse S2-S4 execution by default;
- produce a user-facing result card and a machine-readable trace.

### Phase D: Checker Behavior

Implement checker coverage that rejects:

- asking users to run internal commands when autopilot can continue;
- asking users to classify technical rules manually;
- exposing subsystem names as required user decisions;
- claiming full adoption after only docs-only safe adoption;
- S1 writes outside the docs/session/adoption allowlist;
- any `.intentos/`, `AGENTS.md`, CI, release, package, script, code, DB, API, Web, Docker, production, secret, DNS, payment, provider, data, or compliance change without explicit higher-level approval;
- hiding whether files were written;
- hiding whether runtime changed;
- project-specific hardcoding.

Suggested command:

```text
node scripts/check-existing-project-adoption-autopilot.mjs <report-or-fixture>
```

### Phase E: Public Entry Integration

Update:

- `doctor`
- `guide`
- `workflow-next`
- `start`
- relevant CLI help text

Expected public behavior:

```text
If the user asks to adopt IntentOS:
  run safe adoption autopilot.

If only S0/S1 actions are needed and allowed:
  complete them and summarize.

If S2 is needed:
  ask one plain collaboration-file question.

If S3/S4 is needed:
  default to plan-only.
```

### Phase F: Examples And Bad Fixtures

Add examples:

- production governed project safe docs-only adoption;
- light existing project safe adoption;
- dirty project no-write fallback;
- governed project ready for collaboration-rule review;
- governed project blocked by production authority.

Add bad fixtures:

- user asked to run `native-migration` manually;
- user asked to choose `selected native adoption`;
- user asked to classify CI strictness;
- `.intentos/` installed during safe adoption;
- `AGENTS.md` changed during S1;
- CI or release changed during S1;
- docs-only adoption claims full adoption;
- technical command list used as final result;
- project-specific WorkControl behavior hard-coded.

### Phase G: Release Evidence

Update:

- `VERSION.md`
- `package.json`
- `README.md`
- `README.zh-CN.md`
- `intentos-manifest.json`
- release record for `1.81.0`
- self-check coverage

Only after implementation and verification.

## Acceptance Plan

### Static Checks

Run:

```bash
node --check scripts/resolve-existing-project-adoption-autopilot.mjs
node --check scripts/check-existing-project-adoption-autopilot.mjs
git diff --check
```

### Fixture Checks

Expected passing fixtures:

```bash
node scripts/check-existing-project-adoption-autopilot.mjs examples/existing-project-autopilot/governed-docs-only
node scripts/check-existing-project-adoption-autopilot.mjs examples/existing-project-autopilot/light-existing-project
node scripts/check-existing-project-adoption-autopilot.mjs examples/existing-project-autopilot/dirty-no-write-fallback
node scripts/check-existing-project-adoption-autopilot.mjs examples/existing-project-autopilot/collaboration-rule-review-needed
```

Expected failing fixtures:

```bash
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/manual-command-burden
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/technical-decision-prompt
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/unsafe-intentos-install
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/agents-changed-in-safe-mode
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/full-adoption-overclaim
node scripts/check-existing-project-adoption-autopilot.mjs examples/bad-existing-project-autopilot/runtime-change-hidden
```

### End-To-End Simulation

Create or reuse a governed old-project fixture.

Expected result:

```text
state: PARTIAL_ADOPTION_SAFE_MODE
intent_os_operating_mode: ACTIVE
runtime_changes_performed: No
can_claim_full_adoption: false
user_technical_participation_required: No
next_prompt_style: plain_language_only
```

Create or reuse a dirty existing-project fixture.

Expected result:

```text
state: BLOCKED_BY_UNSAFE_PROJECT_STATE
read_only_analysis_completed: true
docs_written: No
plain_reason_present: true
```

### Integration Checks

Run:

```bash
node scripts/check-intentos.mjs
npm run verify
```

The verification must prove:

- safe existing-project adoption can proceed without user command sequencing;
- safe docs-only writes are bounded and visible;
- S2-S4 actions do not execute by default;
- users are not asked to understand technical subsystem names;
- old-project adoption progresses toward native IntentOS operation without overwriting project authority;
- full adoption cannot be claimed from safe docs-only adoption alone.

## Human Participation Boundary

Humans should not be asked to perform technical judgment.

Humans may be asked only when:

- the project goal is ambiguous;
- Codex would modify collaboration/rule entry files;
- Codex would modify code, config, runtime, CI, release, or production surfaces;
- a real project owner must be identified;
- risk acceptance is required.

Prompts must use ordinary language.

Allowed prompt:

```text
下一步会修改项目协作说明文件，不影响代码运行、不影响发布配置。是否继续？
```

Disallowed prompt:

```text
是否允许进入 controlled apply readiness？
```

## Expected Result

After 1.81:

```text
User gives a project path or GitHub repository and asks for IntentOS adoption.
Codex classifies the project and runs the safe adoption path.
Codex performs safe read-only and allowed docs-only work automatically.
Codex stops only when real authority or risk escalates.
Codex reports status in plain language.
```

This preserves the IntentOS direction:

```text
new projects: configure the right workflow and baseline from the start
old projects: safely move toward native IntentOS operation through automatic low-risk adoption and controlled higher-risk changes
```
