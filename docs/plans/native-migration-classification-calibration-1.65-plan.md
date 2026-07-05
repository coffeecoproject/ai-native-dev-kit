# 1.65.0 Native Migration Classification Calibration Plan

## Purpose

1.65 continues the Native Migration line without adding a new migration system.

1.62 introduced Native Migration planning for existing projects. 1.63 made the
plan rule-level and evidence-backed. 1.64 made parser coverage more transparent
by reporting skipped and low-signal blocks. 1.65 should make classification
safer and more accurate when old project rules mix business, engineering,
workflow, production, and Chinese governance language.

```text
native migration plan
  -> rule extraction coverage
  -> skipped / low-signal visibility
  -> Markdown / JSON consistency
  -> classification calibration
```

## Scope Contract

1.65 is a classification calibration release.

It can:

- adjust classification priority for mixed business + engineering rules
- add high-risk semantic keyword groups for business, permission, payment,
  data, compliance, production, release, and Chinese governance text
- add confidence and ambiguity handling for mixed rules
- conservatively extract simple Markdown table rules only when the table shape
  is clear
- keep complex tables as skipped blocks with parser warnings
- compare Markdown proposed-action rows with structured `proposed_actions`
- add positive and bad fixtures for mixed-language and mixed-domain rules
- record read-only calibration reports from real projects without copying
  private project content into public fixtures

It must not:

- execute Native Migration
- write target-project governance files
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, or business
  code
- treat classifier output as human approval
- treat IntentOS as the business, production, release, compliance, security,
  data, migration, payment, permission, legal, tax, finance, HR, or customer
  record authority
- automatically infer final business meaning from ambiguous text
- require normal users to choose internal checker flags

## User Outcome

A user with an existing project should get a clearer, less technical judgment.

Codex should be able to say:

```text
I found a rule that mentions schema and API, but its meaning is about invoice
tax behavior. I am treating it as a business rule, not a code-style rule. It
still needs your confirmation before any governance replacement.
```

The human still only decides:

- whether the classification is acceptable
- whether ambiguous rules should be business, engineering, workflow,
  production, or unknown authority
- whether exact governance replacement actions are approved later through the
  apply chain

## Work Items

### 1. Classification Priority Calibration

Update the native rule classifier so mixed rules are not classified only by the
first engineering keyword.

Required handling:

```text
production / release / rollback / secrets / incident
  -> PRODUCTION_RULE

payment / invoice / tax / finance / customer data / contract meaning
  -> BUSINESS_FACT or UNKNOWN_AUTHORITY when authority is unclear

database / schema / enum / API / component / lint / test
  -> ENGINEERING_BASELINE when the rule is primarily implementation standard

workflow / Codex / task / review / evidence / plan
  -> WORKFLOW_RULE

historical / deprecated / legacy / replaced
  -> HISTORICAL_CONTEXT
```

Mixed rules should prefer the semantic risk surface over the incidental
technical word. For example:

```text
Customer invoice status schema must preserve tax meaning.
```

should not be classified as a plain engineering baseline only because it
contains `schema`.

### 2. Chinese Governance Keyword Calibration

Add conservative Chinese keyword groups for:

- business: 客户, 合同, 协议, 订单, 发票, 税务, 结算, 财务, 门店, 审批
- permission and data: 权限, 角色, 数据, 客户数据, 隐私, 合规
- production and release: 生产, 上线, 发布, 回滚, 事故, 密钥, 配置
- workflow: 任务, 审查, 证据, 复盘, 计划, 执行, 验收

Chinese text with strong domain meaning may be classified. Chinese text with
weak or unclear authority should remain `low_signal_blocks` or
`UNKNOWN_AUTHORITY` with parser warnings.

### 3. Conservative Simple Table Extraction

Keep 1.64's safe default: complex tables remain skipped.

Add extraction only for simple Markdown tables that clearly contain rule-like
columns, such as:

```text
| Area | Rule |
| Rule | Handling |
| Surface | Requirement |
```

The table extractor must:

- preserve source line ranges for each extracted row
- preserve source excerpt
- assign conservative confidence
- mark ambiguous rows as skipped or low-signal instead of guessing
- keep parser warnings when any table row is skipped

Tables involving production, payment, permission, customer data, compliance,
tax, finance, HR, legal, secrets, migrations, or release must stay human-review
bound even if extracted.

### 4. Proposed Action Consistency

1.64 validates structured `proposed_actions` as plan-only and human-approved.
1.65 should also compare Markdown proposed-action rows with structured
`proposed_actions` where both exist.

Required consistency:

```text
action
exact target path
writes target files
requires human approval
status
```

If Markdown suggests a write but JSON says no-write, strict mode must fail.

### 5. Fixtures

Add a 1.65 positive fixture with:

- mixed business + engineering rule
- Chinese business rule
- Chinese production / release rule
- simple extractable Markdown table
- complex table that remains skipped
- strict Machine-Readable Evidence

Add bad fixtures for:

- mixed invoice / tax / schema rule classified as plain engineering baseline
- Chinese production text classified as business or engineering
- simple table extracted without line range
- complex high-risk table extracted without parser warning
- Markdown proposed action and JSON proposed action mismatch

### 6. Real Project Read-Only Calibration

Run at least one read-only calibration against an existing project if available.

The report must:

- not copy private project content into public examples
- record only anonymized classification categories and false-positive /
  false-negative patterns
- not write target-project files
- not change target-project workflow, CI, hooks, release, or governance files

If no suitable real project is available, record an explicit N/A reason in the
self-check report.

### 7. Version And Release Evidence

When implementation begins, update:

- README / README.zh-CN
- VERSION
- package version and example verification
- intentos manifest and workflow version template
- native migration schema if evidence shape changes
- native migration docs, templates, checklist, and reviewer prompt
- release record, limitations, and self-check report

## Acceptance

1.65 is accepted only if:

- syntax checks pass
- 1.64 strict positive fixture still passes
- 1.63 strict fixture remains compatible
- 1.65 positive fixture passes in strict mode
- all new 1.65 bad fixtures fail for the intended reason
- mixed business + engineering examples are not silently downgraded to plain
  engineering rules
- Chinese production / release / permission / payment / finance text is either
  correctly classified or explicitly marked ambiguous with parser warnings
- simple table extraction preserves source line ranges and excerpts
- complex high-risk tables remain skipped or human-review bound
- Markdown proposed actions and structured `proposed_actions` cannot conflict
  in strict mode
- workflow-map remains diagnostic and still points to Native Migration Plan
- manifest, README, VERSION, package, workflow version, and release evidence are
  synchronized
- `npm run verify` passes

## Suggested Verification Commands

```bash
node --check scripts/lib/native-rule-extraction.mjs
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node scripts/check-native-migration.mjs examples/1.64-native-migration-parser-calibration/table-long-bilingual --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual --require-structured-evidence
node scripts/check-workflow-adoption-map.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixtures should be verified individually and must fail for their intended
classification, table, or proposed-action consistency reason.

## Review Plan

Before release:

1. Review classifier priority against mixed-domain examples.
2. Review Chinese keyword handling for false positives.
3. Review simple table extraction for line-range accuracy.
4. Review all skipped / low-signal / parser warning output.
5. Review Markdown / JSON consistency for both rules and proposed actions.
6. Review boundaries to confirm no target-project write authority was added.

## Boundary

1.65 does not authorize target-project writes, governance replacement,
implementation, release, production, CI changes, hooks, provider calls, secrets,
migrations, payment, permissions, data changes, or business-rule changes.

1.65 improves classification evidence. It does not make the final business,
production, release, compliance, security, finance, tax, HR, legal, customer,
or data authority decision.
