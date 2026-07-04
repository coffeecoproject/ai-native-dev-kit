# 1.66.0 Existing Rule Reconciliation Calibration Plan

## Purpose

1.66 continues the Native Migration line for existing projects.

1.62 introduced Native Migration planning. 1.63 made migration evidence
rule-level and source-backed. 1.64 made parser coverage transparent. 1.65 made
classification safer for mixed business, engineering, production, workflow,
Chinese governance text, and Markdown tables.

1.66 should turn "Codex can classify old rules" into "Codex can compare old
rules with IntentOS recommended baselines and produce a bounded reconciliation
proposal."

```text
old project rules
  -> native migration classification
  -> rule reconciliation
  -> keep / adopt / merge / human decision
  -> later apply chain only after explicit approval
```

## Core Definition

1.66 introduces Existing Rule Reconciliation.

It is not a rule replacement engine. It is a review and planning layer that
compares:

```text
existing project engineering baseline / release rules
vs
IntentOS standard baseline / release recipe / release handoff expectations
```

and records a bounded recommendation.

General reconciliation outcomes:

```text
KEEP_EXISTING
ADOPT_INTENTOS
MERGE
NEEDS_HUMAN_DECISION
NO_INTENTOS_MATCH
NO_EXISTING_RULE
CONFLICT_HIGH_RISK
UNKNOWN_AUTHORITY
```

Release / production outcomes:

```text
KEEP_EXISTING
GAP_SUGGESTION
NEEDS_HUMAN_DECISION
CONFLICT_HIGH_RISK
UNKNOWN_AUTHORITY
```

`ADOPT_INTENTOS` and `MERGE` are not valid release / production outcomes.
IntentOS references can point out missing safety evidence, but they cannot win
over an existing release SOP or production control.

## Scope Contract

1.66 can:

- compare classified Native Migration rules against IntentOS engineering
  baselines, platform standard packs, release recipes, and release handoff
  expectations
- recommend keep, adopt, merge, or human decision for engineering baseline
  rules
- recommend keep-existing-first, gap suggestion, or human decision for
  production and release rules
- record permission, security, privacy, compliance, data, finance, tax, HR,
  legal, customer, payment, and migration rules as protected project constraints
- collect anonymized real-project calibration records without copying private
  project content
- add false-positive and false-negative calibration records
- extend Chinese domain vocabulary conservatively where it improves protected
  classification
- add fixtures for reconciliation conflicts, safe merges, missing gaps, and
  unsafe replacement proposals

It must not:

- execute reconciliation changes
- write target-project files
- replace old governance files
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, provider
  state, migrations, secrets, payment, permissions, data, or business logic
- treat IntentOS as the business, production, release, compliance, security,
  legal, tax, finance, HR, customer, or data authority
- rank release or production rules as "IntentOS wins"
- use `ADOPT_INTENTOS` for release, production, or protected project
  constraints
- use `MERGE` to mean file writes, behavior changes, or semantic approval
- turn recommendations into approval
- require normal users to understand internal rule classes or checker flags

## User Outcome

A user with an old project should see a decision-oriented summary, not a
technical dump.

Codex should be able to say:

```text
I compared the existing project rules with IntentOS expectations.

Engineering baseline:
- keep 3 existing rules because they are stricter
- adopt 2 IntentOS missing rules
- merge 1 duplicate rule

Release / production:
- keep existing release SOP as the source of truth
- add 2 gap suggestions for rollback and monitoring evidence
- 1 conflict needs your confirmation

No target files can be changed until you approve an apply plan.
```

The human should decide only:

- whether a proposed keep/adopt/merge recommendation is acceptable
- whether a high-risk conflict should be preserved, mapped, or rejected
- whether later exact apply actions may proceed

## Reconciliation Rules

### Engineering Baseline Rules

Engineering baseline rules may be compared and merged when the authority is
clear.

Default behavior:

```text
existing rule stricter or more project-specific
  -> KEEP_EXISTING

IntentOS rule fills a missing engineering gap
  -> ADOPT_INTENTOS

both describe the same standard but one is incomplete
  -> MERGE

rules conflict or authority is unclear
  -> NEEDS_HUMAN_DECISION
```

`ADOPT_INTENTOS` is allowed only when:

- surface is `ENGINEERING_BASELINE`
- the rule is low or medium risk
- no protected business, permission, security, privacy, compliance, payment,
  finance, tax, HR, legal, customer, data, migration, provider-state,
  production, or release terms are present
- the IntentOS reference fills a missing or clearly weaker engineering rule
- target action remains "prepare apply-plan after approval"

`MERGE` means "prepare a reviewed wording proposal for future apply planning."
It does not merge files, change project behavior, or approve semantics.

A `MERGE` item must record:

```text
existing_rule_ref
intentos_reference_ref
merge_reason
preserved_existing_terms
added_intentos_terms
human_decision_required = Yes
target_action = prepare apply-plan after approval
```

Examples:

- Existing enum rule is stricter than IntentOS generic enum guidance:
  `KEEP_EXISTING`.
- Project has no test ownership rule and IntentOS standard pack has one:
  `ADOPT_INTENTOS`.
- Project and IntentOS both require API contract evidence but use different
  wording: `MERGE`.
- Project requires a legacy folder structure that conflicts with the selected
  platform baseline: `NEEDS_HUMAN_DECISION`.

### Production And Release Rules

Production and release rules are not "best rule wins" comparisons.

Default behavior:

```text
existing release / production rule exists
  -> KEEP_EXISTING

IntentOS release recipe finds a missing launch safety item
  -> GAP_SUGGESTION

IntentOS suggestion conflicts with existing release SOP
  -> NEEDS_HUMAN_DECISION

release ownership, secrets, provider state, rollback, monitoring, migration,
or incident response is unclear
  -> NEEDS_HUMAN_DECISION
```

Required wording:

- Existing production rules remain project-owned.
- IntentOS can identify gaps and conflicts.
- IntentOS cannot replace release owner judgment.
- IntentOS cannot approve release, deploy, rollback, migration, provider state,
  or production configuration changes.
- `surface = RELEASE_PRODUCTION` or `surface = PRODUCTION_CONTROL` must not use
  `ADOPT_INTENTOS` or `MERGE`.
- `GAP_SUGGESTION` is documentation or evidence guidance only. It is not release
  approval.

### Business / Permission / Security / Privacy / Compliance Rules

Rules in these surfaces are protected constraints, not workflow convenience
rules.

Protected surfaces:

- business meaning
- customer data
- permissions and roles
- security
- privacy
- compliance
- payment
- finance
- tax
- HR
- legal
- migration
- provider state
- production data

Default behavior:

```text
protected project constraint
  -> KEEP_EXISTING or NEEDS_HUMAN_DECISION
```

IntentOS may recommend a documentation or evidence gap. It must not decide the
business meaning or rewrite the rule.

## Proposed Artifacts

### Core Protocol

Add:

```text
core/existing-rule-reconciliation.md
docs/existing-rule-reconciliation.md
```

The protocol should define:

- reconciliation purpose
- supported outcomes
- engineering baseline comparison rules
- release / production keep-existing-first rules
- protected surfaces
- authority boundaries
- relationship to Native Migration Plan, Unified Apply Plan, Controlled Apply
  Readiness, Approval Record, Release Guide, Platform Release Recipes, and
  Release Handoff Packs

### Template

Add:

```text
templates/existing-rule-reconciliation-report.md
```

Required sections:

```text
Human Summary
Input Evidence
Existing Rule Set
IntentOS Reference Set
Reconciliation Matrix
Engineering Baseline Recommendations
Release / Production Recommendations
Protected Constraint Handling
Conflicts And Human Decisions
False Positive / False Negative Notes
Proposed Next Step
Boundaries
Machine-Readable Evidence
Outcome
```

### Schema

Add:

```text
schemas/artifacts/existing-rule-reconciliation.schema.json
```

1.66 should not rely only on Markdown tables. The schema must make the
recommendation-only boundary machine-checkable.

Required schema-level constraints:

- `can_codex_write_now` must be `No`
- `reconciliation_authority` must be `RECOMMENDATION_ONLY`
- `business_authority` must be `PROJECT_OWNED`
- `production_authority` must be `HUMAN_OR_EXTERNAL_SYSTEM`
- release / production surfaces cannot use `ADOPT_INTENTOS` or `MERGE`
- protected surfaces cannot use `ADOPT_INTENTOS`
- `MERGE` items must include preserved and added terms
- every proposed next step must require the apply / approval chain before any
  target-project file change

### Checklist And Prompt

Add:

```text
checklists/existing-rule-reconciliation-review.md
prompts/existing-rule-reconciliation-agent.md
```

The checklist and prompt must require:

- no target-project writes
- no governance replacement
- no production or release approval
- existing production rules remain project-owned
- engineering merge recommendations are evidence-backed
- protected surfaces default to preserve or human decision
- proposed next steps remain plan-only

### Artifact Directory

Add:

```text
existing-rule-reconciliations/.gitkeep
```

### Resolver And Checker

Add:

```text
scripts/resolve-existing-rule-reconciliation.mjs
scripts/check-existing-rule-reconciliation.mjs
```

Resolver behavior:

- read existing Native Migration evidence when available
- read selected IntentOS standard baseline / release recipe / release handoff
  references when available
- emit a plan-only reconciliation report
- keep target writes disabled
- print a human-readable summary by default
- emit JSON when requested

Checker behavior:

- allow no reports in a source repo or newly initialized project
- validate report sections
- validate Machine-Readable Evidence when required
- reject target writes, release approval, production approval, and governance
  replacement language
- reject production/release outcomes that prefer IntentOS over existing project
  rules without human decision
- reject `surface = RELEASE_PRODUCTION` or `surface = PRODUCTION_CONTROL` with
  `outcome = ADOPT_INTENTOS` or `outcome = MERGE`
- reject `ADOPT_INTENTOS` outside low/medium-risk engineering baseline gaps
- reject `MERGE` without existing rule reference, IntentOS reference, merge
  reason, preserved existing terms, added IntentOS terms, human decision, and
  apply-plan target action
- reject protected business/security/privacy/compliance rules categorized as
  plain engineering merge
- reject protected constraints without owner / authority / human decision
- reject `GAP_SUGGESTION` wording that implies approval
- reject proposed next steps that skip Unified Apply Plan, Controlled Apply
  Readiness, Approval Record, or Release Guide / Release Handoff review where
  required
- reject reports that claim "rules reconciled, safe to apply"

### CLI

Add one natural-language friendly command pair:

```text
node scripts/cli.mjs reconcile-rules .
node scripts/cli.mjs reconcile-rules-check .
```

The user-facing wording should be:

```text
Codex compared existing project rules with IntentOS expectations.
This is a recommendation report, not permission to change files.
```

## Calibration Inputs

### Synthetic Fixtures

Add one positive example:

```text
examples/1.66-existing-rule-reconciliation/governed-web-admin/
```

It should include:

- existing engineering baseline stricter than IntentOS
- missing IntentOS engineering baseline rule
- duplicate engineering rule that can be merged
- existing release SOP that must remain source of truth
- missing rollback or monitoring evidence gap
- permission/security/privacy rule that must remain protected
- Machine-Readable Evidence

Add bad fixtures:

```text
bad-rule-reconciliation-replaces-release-sop
bad-rule-reconciliation-business-as-engineering
bad-rule-reconciliation-approves-target-write
bad-rule-reconciliation-skips-approval-chain
bad-rule-reconciliation-production-intentos-wins
bad-rule-reconciliation-missing-protected-owner
bad-rule-reconciliation-fake-gap-evidence
bad-rule-reconciliation-release-adopt-intentos
bad-rule-reconciliation-merge-without-preserved-terms
bad-rule-reconciliation-gap-suggestion-as-approval
```

### Real Project Calibration

Run at least one read-only local project calibration when a suitable
non-sensitive local project is available.

The record must be anonymized and must not include proprietary content.

Suggested public record:

```text
rule-reconciliation-calibration-reports/2026-07-04-anonymized-existing-project.md
```

It should record:

- project class only, such as existing governed web project or production
  sensitive project
- number of classified engineering rules
- number of release / production rules
- number of protected constraints
- false positive categories
- false negative categories
- whether any rule would have been unsafe to replace
- no copied private excerpts

This is conditional acceptance, not a hard blocker. If no suitable project is
available, record an explicit N/A reason in the self-check report.

## Machine-Readable Evidence Shape

Recommended evidence fields:

```json
{
  "schema_version": "1.66.0",
  "artifact_type": "existing_rule_reconciliation_report",
  "report_type": "EXISTING_RULE_RECONCILIATION",
  "project_state": "EXISTING_GOVERNED_PROJECT",
  "can_codex_write_now": "No",
  "can_recommend_apply_plan": "Yes",
  "reconciliation_authority": "RECOMMENDATION_ONLY",
  "business_authority": "PROJECT_OWNED",
  "production_authority": "HUMAN_OR_EXTERNAL_SYSTEM",
  "requires_human_approval_before_apply": "Yes",
  "existing_rule_source": [],
  "intentos_reference_source": [],
  "reconciliation_items": [
    {
      "item_id": "RR-001",
      "existing_rule_ref": "native-migration:R-001",
      "intentos_reference_ref": "standard-baseline:web-runtime-standard",
      "surface": "ENGINEERING_BASELINE",
      "surface_authority": "PROJECT_OWNED",
      "allowed_outcomes": ["KEEP_EXISTING", "MERGE", "NEEDS_HUMAN_DECISION"],
      "outcome": "MERGE",
      "reason": "Existing rule is project-specific; IntentOS adds missing evidence wording.",
      "merge_reason": "Combine project-specific enum wording with missing evidence wording.",
      "preserved_existing_terms": ["project-specific enum rule"],
      "added_intentos_terms": ["evidence wording"],
      "risk_surfaces": ["engineering"],
      "human_decision_required": "Yes",
      "requires_apply_chain": "Yes",
      "can_replace_existing_rule": "No",
      "target_action": "prepare apply-plan after approval"
    }
  ],
  "protected_constraints": [],
  "release_production_gaps": [],
  "conflicts": [],
  "proposed_next_steps": [],
  "boundary": {
    "writesTargetFiles": "No",
    "authorizesTargetFileWrites": "No",
    "approvesGovernanceReplacement": "No",
    "approvesImplementation": "No",
    "approvesReleaseOrProduction": "No"
  },
  "outcome": "RECONCILIATION_RECORDED"
}
```

## Execution Plan

### Phase 1: Protocol And Template

1. Add core protocol and user docs.
2. Add report template.
3. Add schema.
4. Add checklist and agent prompt.
5. Add artifact directory.
6. Update reference docs and artifact index.

Acceptance:

- docs define reconciliation as plan-only
- release / production keep-existing-first rule is explicit
- protected surfaces are explicit
- schema-level authority boundaries are explicit
- user-facing wording does not require technical knowledge

### Phase 2: Resolver And Checker

1. Add resolver.
2. Add checker.
3. Add CLI aliases.
4. Validate strict structured evidence against the schema.
5. Update `scripts/check-dev-kit.mjs`.
6. Update `package.json` verification if needed.

Acceptance:

- no-report state passes in source repo
- generated report is plan-only
- checker rejects target writes and release approval
- checker rejects production "IntentOS wins" wording
- checker rejects release / production `ADOPT_INTENTOS` and `MERGE`
- checker rejects unsafe `ADOPT_INTENTOS` outside engineering baseline gaps
- checker rejects incomplete `MERGE` evidence
- checker rejects protected constraints merged as plain engineering rules

### Phase 3: Examples And Bad Fixtures

1. Add 1.66 positive example.
2. Add bad fixtures for unsafe reconciliation.
3. Add compatibility tests with 1.63, 1.64, and 1.65 Native Migration examples.
4. Add anonymized real-project calibration record if a suitable non-sensitive
   project is available; otherwise record N/A in self-check.

Acceptance:

- positive example passes strict checker
- all bad fixtures fail for intended reasons
- previous Native Migration strict examples still pass
- no private project text is copied into public fixtures

### Phase 4: Version And Release Evidence

Update:

- README / README.zh-CN
- VERSION
- package version
- dev-kit manifest
- workflow version template
- template version record
- release record
- known limitations
- self-check report

Acceptance:

- version signals are synchronized
- release record has Allowed Claims, Forbidden Claims, Evidence Status, Known
  Limitations, Acceptance, and Verification
- self-check report records exact commands and results

## Acceptance Criteria

1.66 is accepted only if:

- `node --check` passes for new resolver and checker
- `node scripts/check-existing-rule-reconciliation.mjs .` passes in source repo
- the 1.66 positive example passes
- all 1.66 bad fixtures fail for intended reasons
- existing 1.63, 1.64, and 1.65 Native Migration strict examples still pass
- reconciliation outcomes are limited to allowed values
- release / production outcomes cannot use `ADOPT_INTENTOS` or `MERGE`
- `ADOPT_INTENTOS` is limited to low/medium-risk engineering baseline gaps
- `MERGE` means reviewed wording proposal only and must include preserved /
  added terms
- engineering baseline recommendations can keep, adopt, merge, or require human
  decision
- production and release recommendations default to keep existing, gap
  suggestion, or human decision
- protected business, permission, security, privacy, compliance, payment,
  finance, tax, HR, legal, customer, data, migration, and provider-state rules
  cannot be automatically merged as plain engineering baselines
- proposed next steps do not skip Native Migration Plan, Unified Apply Plan,
  Controlled Apply Readiness, Approval Record, Release Guide, Release Handoff,
  or human approval where required
- anonymized real-project calibration does not expose private project content
  when a suitable non-sensitive project is available; otherwise self-check
  records N/A
- manifest, README, VERSION, package, workflow version, and release evidence are
  synchronized
- `npm run verify` passes
- `git diff --check` passes

## Suggested Verification Commands

```bash
node --check scripts/resolve-existing-rule-reconciliation.mjs
node --check scripts/check-existing-rule-reconciliation.mjs
node scripts/check-existing-rule-reconciliation.mjs .
node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence
node scripts/cli.mjs reconcile-rules .
node scripts/cli.mjs reconcile-rules-check .
node scripts/check-native-migration.mjs examples/1.63-native-migration-precision/mixed-agent-rules --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.64-native-migration-parser-calibration/table-long-bilingual --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

Bad fixtures should be run individually. Each must fail for its intended unsafe
reconciliation reason.

## Review Plan

Before release:

1. Review all language for permission creep.
2. Review engineering recommendations for evidence-backed merge logic.
3. Review release / production recommendations for keep-existing-first wording.
4. Review protected-surface rules to confirm they cannot be silently downgraded.
5. Review CLI wording from a beginner user's perspective.
6. Review real-project calibration records for privacy and anonymization.
7. Review full verification output before version release.

## Non-Goals

1.66 does not:

- implement target-project governance changes
- automatically migrate old `AGENTS.md`
- automatically replace project baselines
- execute release, deployment, rollback, migration, provider, CI, or hook
  changes
- decide business, legal, tax, finance, HR, security, privacy, compliance, or
  production correctness
- make old projects fully IntentOS-native without approval

## Main Risk

The main risk is wording drift: "reconciliation" could be misread as permission
to replace project rules.

Mitigation:

- every report must say it is a recommendation, not approval
- production and release keep-existing-first must be a checker rule
- protected surfaces must be rejected if classified as automatic engineering
  merges
- all apply paths must still go through the existing approval chain
