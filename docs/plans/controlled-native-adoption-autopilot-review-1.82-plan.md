# Controlled Native Adoption Autopilot Review 1.82 Plan

## Purpose

1.82 should handle the third stage of existing-project adoption:

```text
Codex automatically evaluates an old project's governance maturity,
then recommends the safest adoption depth.
```

The goal is not to directly run native apply. The goal is to let Codex decide whether an old project should:

- stay safely partial;
- receive low-risk governance repair;
- move toward selected native adoption planning;
- stay blocked because production, data, release, or owner authority is unclear.

The target user experience is:

```text
User asks for deeper IntentOS adoption.
Codex performs the maturity and risk review.
Codex gives a professional recommendation.
User only confirms whether to follow the recommended safe action.
```

## Relationship To 1.81

1.81 establishes safe existing-project adoption:

```text
read-only diagnosis
safe docs-only records where allowed
adoption assurance
collaboration-layer entry
plain result card
```

1.82 starts from that posture, but does not assume WorkControl-like strong governance.

It must support both:

```text
strong governed projects -> likely stay partial
weak or messy projects -> likely governance repair and selected native adoption planning
```

1.82 must preserve the 1.81 UX principle:

```text
Users should not need to understand IntentOS internals.
```

## Context Reset

This plan must be executed from repository facts, not conversation memory.

Before implementation, Codex must re-read:

- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `core/existing-project-safe-adoption-autopilot.md`
- `docs/existing-project-safe-adoption-autopilot.md`
- `docs/native-first-existing-project-migration.md`
- `docs/existing-rule-reconciliation.md`
- `docs/existing-project-governance-convergence.md`
- `docs/adoption-execution-assurance.md`
- `docs/unified-apply-plan.md`
- `docs/controlled-apply-readiness.md`
- `docs/approval-record-governance.md`
- `docs/plans/existing-project-safe-adoption-autopilot-1.81-plan.md`
- `docs/plans/native-first-existing-project-migration-1.62-plan.md`
- `docs/plans/adoption-execution-assurance-1.71-plan.md`
- `scripts/cli.mjs`
- `scripts/resolve-existing-project-adoption-autopilot.mjs`
- `scripts/check-existing-project-adoption-autopilot.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/resolve-apply-plan.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `scripts/check-intentos.mjs`

WorkControl, AiCoffeeCo, or other local project observations may be used only as calibration evidence. They must not become hard-coded public behavior.

## Current Baseline

IntentOS can already bring an old project to a safe partial adoption state:

```text
PARTIAL_ADOPTION
ADAPTER_ONLY
planning/review working mode available
project authority preserved
no runtime or production takeover
```

The next question is broader than "should we deepen adoption":

```text
How mature is this existing project, and what depth of IntentOS adoption is appropriate?
```

That question should be answered by Codex.

## Problem Statement

### Problem 1: Strong Old Projects And Messy Old Projects Need Different Outcomes

For a strong governed project, full native adoption may add noise or duplicate stricter project rules.

For a weak or messy project, staying partial may leave the real problem unsolved.

1.82 must support both outcomes:

```text
Strong governed project -> recommend stay partial or small refinement.
Weak/messy project -> recommend governance repair and selected native adoption planning.
```

### Problem 2: Users Cannot Judge Governance Maturity

Users should not need to decide whether a project is:

- strongly governed;
- weakly governed;
- messy but production-sensitive;
- light and low-risk;
- ownerless or unsafe.

Codex should infer this from project evidence and explain the conclusion plainly.

### Problem 3: "Complete Adoption" Is Not Always The Best Target

For some old projects, the best target is:

```text
PARTIAL_ADOPTION + planning/review active
```

For other projects, the best target is:

```text
GOVERNANCE_REPAIR -> SELECTED_NATIVE_ADOPTION_PLAN -> controlled apply later
```

1.82 must not optimize for maximum migration. It must optimize for the safest useful adoption depth.

### Problem 4: Review Must Not Become Apply

1.82 is a review and recommendation layer.

It must not:

- apply native migration;
- install `.intentos/`;
- replace `AGENTS.md`;
- modify CI, hooks, release, API, Web, DB, Docker, production, secrets, payments, data, or external systems;
- treat user enthusiasm as blanket approval.

## Scope

1.82 includes:

- an Existing Project Governance Maturity model;
- a Controlled Native Adoption Autopilot Review protocol;
- adoption depth recommendation;
- low-user-burden decision translation;
- a native adoption review report artifact;
- structured evidence for maturity, recommendation, risk, verification, and rollback;
- checker coverage for over-migration, under-migration, unsafe apply, and technical user burden;
- examples and bad fixtures across strong, weak, messy, light, and blocked old projects;
- CLI/public entry integration as a review-only flow;
- release evidence and self-check coverage.

1.82 does not include:

- native apply execution;
- `.intentos/` installation;
- `AGENTS.md` creation or replacement;
- project CI/hook/release modification;
- runtime/code/config change;
- production, secret, DNS, payment, data, migration, compliance, legal, tax, HR, finance, privacy, or security approval;
- a general project migration runner;
- project-specific WorkControl or AiCoffeeCo behavior.

## Core Concept

### Governance Maturity Review

Before recommending an adoption depth, Codex must classify the old project.

Suggested maturity states:

- `STRONG_GOVERNED_PROJECT`
- `WEAK_GOVERNANCE_PROJECT`
- `MESSY_PRODUCTION_PROJECT`
- `LIGHT_LOW_RISK_PROJECT`
- `UNKNOWN_OR_OWNERLESS_PROJECT`
- `DIRTY_OR_UNSAFE_PROJECT`

Suggested machine-readable summary:

```json
{
  "governance_maturity": {
    "state": "WEAK_GOVERNANCE_PROJECT",
    "confidence": "medium",
    "signals_present": ["README", "tests"],
    "signals_missing": ["release policy", "test strategy", "environment baseline", "task workflow"],
    "production_sensitivity": "unknown",
    "recommended_adoption_depth": "GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN"
  }
}
```

### Controlled Native Adoption Review

Add a computed review artifact:

```text
native-adoption-review-reports/<id>.md
```

The report answers:

```text
What kind of old project is this?
Should it stay partial, repair governance, or plan selected native adoption?
What can Codex do safely without asking a technical user to judge internals?
```

Suggested machine-readable summary:

```json
{
  "controlled_native_adoption_review": {
    "state": "RECOMMEND_GOVERNANCE_REPAIR",
    "current_adoption_state": "PARTIAL_ADOPTION",
    "governance_maturity": "WEAK_GOVERNANCE_PROJECT",
    "recommended_user_choice": "let Codex prepare a low-risk governance repair plan",
    "safe_to_apply_now": false,
    "native_apply_allowed": false,
    "recommended_actions": [
      {
        "id": "NAR-001",
        "plain_summary": "Create missing project workflow and verification records.",
        "risk": "low",
        "execution": "plan only"
      }
    ],
    "blocked_actions": [
      {
        "id": "NAR-B001",
        "plain_summary": "Do not modify runtime or production settings.",
        "reason": "production sensitivity is not fully known"
      }
    ]
  }
}
```

Allowed states:

- `RECOMMEND_STAY_PARTIAL`
- `RECOMMEND_GOVERNANCE_REPAIR`
- `READY_FOR_LOW_RISK_COLLABORATION_APPLY_REVIEW`
- `READY_FOR_DOCS_ONLY_ENHANCEMENT_REVIEW`
- `READY_FOR_SELECTED_NATIVE_PLAN_ONLY`
- `BLOCKED_BY_PROJECT_AUTHORITY`
- `BLOCKED_BY_UNSAFE_PROJECT_STATE`
- `NATIVE_APPLY_NOT_RECOMMENDED`
- `FAILED_INVALID_EVIDENCE`

These states are internal. The user-facing output must explain them plainly.

## Maturity-To-Recommendation Matrix

| Project maturity | Default recommendation | User-facing wording |
| --- | --- | --- |
| `STRONG_GOVERNED_PROJECT` | `KEEP_PARTIAL_ADOPTION` or small refinement | "保持当前安全接入，现有规则更强" |
| `WEAK_GOVERNANCE_PROJECT` | `GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN` | "先补治理缺口，再准备更深接入方案" |
| `MESSY_PRODUCTION_PROJECT` | `GOVERNANCE_REPAIR_ONLY` | "先治理修复，不碰生产和代码" |
| `LIGHT_LOW_RISK_PROJECT` | `SELECTED_NATIVE_PLAN_ONLY` | "可以更快进入更深接入方案，但先不执行" |
| `UNKNOWN_OR_OWNERLESS_PROJECT` | `BLOCK_NEEDS_OWNER` | "需要确认项目责任人或风险边界" |
| `DIRTY_OR_UNSAFE_PROJECT` | `BLOCK_UNSAFE_STATE` | "当前状态不适合继续写入，只能只读分析" |

## Native Adoption Recommendation Classes

| Recommendation | Meaning | User-facing wording |
| --- | --- | --- |
| `KEEP_PARTIAL_ADOPTION` | Current safe adoption is the best state | "保持现在的安全接入方式" |
| `GOVERNANCE_REPAIR_ONLY` | Repair workflow/test/baseline/docs gaps, no native asset apply | "先补治理缺口，不动代码和发布" |
| `GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN` | Repair missing governance, then plan selected native adoption | "先修治理，再出更深接入方案" |
| `DOCS_ONLY_ENHANCEMENT` | Add or refine non-authoritative docs only | "只补充说明文档，不改代码和配置" |
| `COLLABORATION_ENTRY_REFINEMENT` | Small agent/rule-entry wording refinement | "只调整协作说明，不影响运行" |
| `SELECTED_NATIVE_PLAN_ONLY` | Native asset candidates exist but should only be planned | "可以先出更深接入方案，但不执行" |
| `BLOCK_NATIVE_ADOPTION` | Deeper adoption is unsafe or unnecessary | "不建议继续加深接入" |

## Default Decision Rules

Codex should recommend `KEEP_PARTIAL_ADOPTION` when:

- the project is production-sensitive;
- existing CI/release/gate/session/preflight rules are stricter;
- IntentOS is already available for planning/review;
- native assets would duplicate or confuse existing authority;
- no specific workflow gap requires native assets.

Codex should recommend `GOVERNANCE_REPAIR_ONLY` when:

- the project lacks task workflow, testing, baseline, release, environment, or document source-of-truth clarity;
- the project may be production-sensitive;
- runtime, code, CI, or release changes would be unsafe;
- low-risk docs and planning records can reduce future AI execution risk.

Codex should recommend `GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN` when:

- governance gaps are clear;
- production sensitivity is low or can be bounded;
- selected IntentOS assets may reduce confusion;
- native apply still requires a future plan, approval record, and controlled readiness.

Codex may recommend `SELECTED_NATIVE_PLAN_ONLY` when:

- the project is light and low-risk;
- existing governance is weak;
- IntentOS assets would provide structure without replacing production authority;
- the result remains plan-only.

Codex must recommend `BLOCK_NATIVE_ADOPTION` when:

- the worktree is unsafe;
- project authority is unknown;
- release/production/data/secrets/compliance surfaces are implicated;
- deeper adoption would replace stricter project authority or hide risk.

## User Experience

### Strong Governed Project

```text
我已完成深度接入审查。

判断：这个项目治理较强。
建议：保持当前安全接入，不安装 .intentos。
原因：现有 CI、发布、回滚和协作规则已经更严格。

你无需处理技术细节。当前状态已经适合按 IntentOS 做规划和复查。
```

### Weak Governance Project

```text
我已完成深度接入审查。

判断：这个项目治理不足。
建议：先补治理缺口，再准备更深接入方案。
我会先补齐任务流程、验证策略、文档来源和接入证据，不改代码和发布配置。

是否按这个低风险建议继续？
```

### Messy Production Project

```text
我判断这个项目可能已有真实使用，但治理不完整。
建议：先只做治理修复，不碰代码、发布和生产配置。
等责任边界清楚后，再决定是否更深接入。
```

### Light Low-Risk Project

```text
我判断这是轻量低风险老项目。
建议：可以进入更深接入方案，但这一步仍然只生成方案，不直接执行。
是否继续生成方案？
```

## Human Decision Translation

1.82 must not ask users technical questions.

Disallowed:

```text
是否允许 selected native adoption？
是否进入 controlled apply readiness？
是否安装 .intentos？
是否替换 AGENTS？
```

Allowed:

```text
我建议保持当前安全接入，不再加深。是否接受这个建议？
```

```text
我建议先补治理缺口，不改代码和发布。是否继续？
```

```text
我建议只生成更深接入方案，不执行。是否继续生成方案？
```

Acceptance rule:

```text
If the user must understand IntentOS subsystem terms to answer, the flow fails.
```

## Review Inputs

The resolver should consume, when available:

- existing-project adoption autopilot report;
- native migration report;
- existing-rule reconciliation report;
- governance convergence report;
- adoption assurance report;
- bounded apply plan review;
- collaboration-layer entry evidence;
- document governance index;
- current git state;
- current project authority signals;
- README, tests, CI, release docs, environment docs, baseline docs, task docs, and workflow entry signals.

Missing inputs should not automatically force a user prompt. Codex should:

1. generate missing read-only inputs when safe;
2. classify the project using available evidence;
3. mark unavailable inputs clearly;
4. proceed with a conservative recommendation when evidence is partial;
5. avoid claiming readiness without evidence.

## Execution Plan

### Phase A: Protocol And Documentation

Add or update:

- `core/controlled-native-adoption-autopilot-review.md`
- `docs/controlled-native-adoption-autopilot-review.md`
- `templates/controlled-native-adoption-review-report.md`
- `schemas/artifacts/controlled-native-adoption-review.schema.json`
- `checklists/controlled-native-adoption-review.md`
- `prompts/controlled-native-adoption-review-agent.md`
- `native-adoption-review-reports/.gitkeep`

The documentation must state:

```text
review is not apply
recommendation is not approval
governance repair can be the correct next step
partial adoption can be the best outcome
native apply is never default
```

### Phase B: Resolver

Add:

```text
scripts/resolve-controlled-native-adoption-review.mjs
```

The resolver should:

- verify that safe adoption state exists or run read-only adoption autopilot first;
- inspect rule, convergence, assurance, and collaboration-entry evidence;
- classify governance maturity;
- detect missing governance surfaces;
- classify candidate deeper adoption actions;
- recommend stay partial, governance repair, docs-only enhancement, collaboration refinement, plan-only native candidate, or block;
- calculate risk and authority level;
- produce a plain user result and a technical trace;
- refuse hidden apply.

Suggested CLI:

```text
intentos adopt-deeper <target>
intentos native-review <target>
```

Both must be review-only in 1.82.

### Phase C: Checker

Add:

```text
scripts/check-controlled-native-adoption-review.mjs
```

The checker must reject:

- native apply execution in 1.82;
- `.intentos/` installation recommendations without plan-only framing;
- `AGENTS.md`, CI, release, code, DB, API, Web, Docker, production, secret, payment, data, or external-system changes as direct actions;
- full adoption claims from partial evidence;
- recommendations that ask users to choose technical artifact names;
- recommendations without maturity classification;
- weak-governance projects that are told to stay partial without explaining missing governance repair;
- strong-governance projects that are pushed toward native assets without showing the value;
- recommendations without risk, verification, and rollback analysis;
- recommendations that ignore existing stricter project authority;
- reports that hide missing evidence;
- project-specific hardcoding.

### Phase D: Public Entry Integration

Update public flow so after safe adoption:

```text
Safe adoption complete.
Codex can review whether this project should stay partial or move deeper.
```

If the user says yes, Codex runs review-only 1.82.

Do not expose internal subsystem sequence.

### Phase E: Examples And Bad Fixtures

Add examples:

- strong governed production project where partial adoption is recommended;
- weak governance project where governance repair is recommended;
- messy production project where governance repair only is recommended;
- light low-risk project where selected native plan-only is recommended;
- project with collaboration entry gap where low-risk refinement is recommended;
- dirty project where deeper adoption is blocked;
- project with unknown authority where plan-only output is allowed.

Add bad fixtures:

- direct `.intentos/` install recommendation;
- `AGENTS.md` replacement as direct action;
- CI/release/native apply recommended as default;
- user asked to choose technical subsystem;
- full adoption claimed from partial adoption;
- weak-governance project told to stay partial with no repair recommendation;
- strong-governance project pushed toward native assets with no value case;
- missing maturity classification;
- missing rollback/verification analysis;
- existing stricter project authority ignored;
- project-specific WorkControl behavior hard-coded.

### Phase F: Release Evidence

Update:

- `VERSION.md`
- `package.json`
- `README.md`
- `README.zh-CN.md`
- `intentos-manifest.json`
- release record for `1.82.0`
- self-check coverage

Only after implementation and verification.

## Acceptance Plan

### Static Checks

Run:

```bash
node --check scripts/resolve-controlled-native-adoption-review.mjs
node --check scripts/check-controlled-native-adoption-review.mjs
git diff --check
```

### Fixture Checks

Expected passing fixtures:

```bash
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/strong-governed-stay-partial
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/weak-governance-repair
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/messy-production-repair-only
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/light-plan-only
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/collaboration-entry-refinement
node scripts/check-controlled-native-adoption-review.mjs examples/controlled-native-adoption-review/dirty-blocked
```

Expected failing fixtures:

```bash
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/direct-intentos-install
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/agents-replacement-direct
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/full-adoption-overclaim
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/technical-user-choice
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/ci-release-direct-apply
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/weak-project-under-migrated
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/strong-project-over-migrated
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/missing-maturity-classification
node scripts/check-controlled-native-adoption-review.mjs examples/bad-controlled-native-adoption-review/no-rollback-verification
```

### End-To-End Simulation

Create or reuse a strong governed old-project fixture.

Expected output:

```text
governance_maturity: STRONG_GOVERNED_PROJECT
state: RECOMMEND_STAY_PARTIAL
native_apply_allowed: false
recommended_user_choice: keep current safe adoption
user_technical_participation_required: No
plain_language_result: present
```

Create or reuse a weak governance old-project fixture.

Expected output:

```text
governance_maturity: WEAK_GOVERNANCE_PROJECT
state: RECOMMEND_GOVERNANCE_REPAIR
native_apply_allowed: false
recommended_user_choice: let Codex prepare a low-risk governance repair plan
user_technical_participation_required: No
plain_language_result: present
```

Create or reuse a light existing-project fixture.

Expected output:

```text
governance_maturity: LIGHT_LOW_RISK_PROJECT
state: READY_FOR_SELECTED_NATIVE_PLAN_ONLY
native_apply_allowed: false
recommended_user_choice: generate deeper adoption plan only
plain_language_result: present
```

### Integration Checks

Run:

```bash
node scripts/check-intentos.mjs
npm run verify
```

The verification must prove:

- third-stage review is automatic and review-only;
- governance maturity drives adoption depth;
- users are not asked to make technical adoption decisions;
- "stay partial" is a valid successful recommendation;
- "governance repair first" is a valid successful recommendation;
- weak projects are not under-migrated without explanation;
- strong projects are not over-migrated without value case;
- native apply cannot be implied;
- existing project authority is preserved;
- low-risk recommendations include verification and rollback;
- full adoption cannot be claimed without approval record, controlled apply readiness, and actual applied evidence.

## Human Participation Boundary

Humans should only be asked:

- whether to accept the recommendation;
- whether Codex may generate a plan-only deeper adoption proposal;
- whether Codex may perform a clearly described low-risk docs/collaboration update;
- whether a responsible owner approves high-risk production/release/data/security actions.

Humans should not be asked:

- whether the project is strong, weak, messy, or light;
- which IntentOS subsystem to run;
- whether to install `.intentos/`;
- whether to enter selected native adoption;
- whether controlled apply readiness passes;
- whether project CI is stricter than IntentOS;
- whether a rule is an IntentOS or project authority rule.

Codex must provide the professional recommendation first.

## Expected Result

After 1.82:

```text
Existing projects can proceed from safe adoption to maturity-based deep adoption review without making users learn IntentOS internals.
Codex decides whether the project should stay partial, repair governance, or plan selected native adoption.
Codex may recommend staying partial.
Codex may recommend governance repair.
Codex only asks simple permission questions when a safe next action exists.
Native apply remains separate, explicit, and approval-bound.
```

This preserves the product goal:

```text
zero technical participation for users
safe defaults for old projects
professional AI recommendation before human confirmation
weak projects can move toward fuller adoption without burdening users
strong projects are not over-migrated
no hidden authority transfer
```

