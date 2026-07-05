# 1.63.0 Native Migration Precision Hardening Plan

## Purpose

1.63 hardens the 1.62 Native-First Existing Project Migration path.

1.62 changed the existing-project posture from adapter-only to native migration
planning:

```text
existing project
  -> workflow-map diagnostic
  -> Native Migration Plan
  -> plan-first controlled apply
```

1.63 should make that migration plan precise enough for real governed projects.

The core problem is not that 1.62 is unsafe. The problem is that 1.62 can still
classify old rules too coarsely. A real `AGENTS.md` or `agent.md` can contain
workflow habits, business facts, production rules, CI expectations, test
commands, and stale notes in the same file. A file-level or first-line summary
is not enough to support a future workflow authority transition.

1.63 upgrades native migration from:

```text
file-level migration planning
```

to:

```text
rule-level migration evidence
```

## Scope Contract

1.63 is a precision and evidence release.

It can:

- extract multiple rules from one agent/governance file
- preserve heading, bullet, numbered-list, and code-block context
- attach stable rule IDs and line ranges
- classify each extracted rule separately
- produce structured native migration evidence
- make workflow-map language point clearly from diagnostic mapping to native
  migration planning
- add realistic mixed-rule fixtures based on production-governed project shapes
- strengthen checker rules for source evidence, schema, and authority transition

It must not:

- execute native migration
- rewrite `AGENTS.md`, `agent.md`, CI, hooks, release SOPs, production config, or
  business code
- add a native migration apply runner
- make IntentOS the business, production, release, compliance, security, data,
  migration, payment, permission, legal, tax, finance, HR, or customer-record
  authority
- treat structured evidence as human approval
- require normal users to choose internal checker flags

## User Outcome

A user with an existing project should be able to say:

```text
Use IntentOS for this old project.
```

Codex should be able to respond:

```text
I found existing workflow rules, business rules, production controls, and
engineering baselines. I split them into individual rules instead of treating
the whole file as one rule.

IntentOS can become the planning workflow for Codex, but these business and
production rules remain project-owned. Any replacement still needs an apply
plan and human approval.
```

The user should make decision-level choices only:

- confirm whether IntentOS should become the Codex workflow authority
- confirm uncertain or ownerless rules
- approve or reject exact governance replacement actions
- decide whether old workflow docs should be preserved, mapped, or archived

The user should not need to understand parser modes, schema formats, or
checker internals.

## Current Gap From 1.62

1.62 already provides:

- native migration posture
- authority fields
- workflow-map to native-migration routing
- native migration plan template
- checker and bad fixtures
- plan-first apply boundary

1.62 does not yet prove:

- every relevant rule inside a mixed `AGENTS.md` was extracted
- each rule has a line range
- a business rule inside an agent file was preserved
- a production control inside an agent file was not downgraded
- old workflow rules are the only rules proposed for replacement
- the structured record matches the Markdown plan
- workflow-map language consistently treats adapter-only as an escape hatch

## Design

### 1. Rule-Level Extraction

Add a reusable extraction path for native migration.

The extractor should understand:

- Markdown headings
- bullet lists
- numbered lists
- short paragraphs under headings
- fenced code blocks as context, not default rules
- inline emphasis and checklist items
- line ranges

Each extracted rule must include:

```text
rule_id
source_file
source_start_line
source_end_line
source_excerpt
context_heading
detected_terms
rule_class
authority
default_handling
preserve_or_replace
risk_surfaces
target_action
human_decision_required
confidence
reason
```

The extractor should prefer several specific low-confidence rules over one
overconfident file-level rule.

Each Native Migration Plan should also include a rule extraction coverage
summary:

```text
source_file
lines_scanned
rules_extracted
unclassified_blocks
parser_warnings
notes
```

This answers the review question: did IntentOS scan the relevant source, or did
it only extract a few convenient rules?

Parser warnings are first-class review evidence. They should capture ambiguous
or ignored blocks, for example:

```json
[
  "Code block at AGENTS.md:L31-L38 treated as context only",
  "Low-confidence paragraph at AGENTS.md:L52-L54 marked UNKNOWN_AUTHORITY"
]
```

Warnings do not block planning by default. They tell the human where review is
needed before governance replacement.

### 2. Authority Classification Schema

Add structured evidence for Native Migration Plans.

Suggested schema:

```text
schemas/artifacts/native-migration-plan.schema.json
```

The schema should validate:

- report type and version
- project state and posture
- authority fields
- rule extraction coverage summary
- extracted rule classifications
- parser warnings
- conflicts
- proposed actions
- exact target paths
- AGENTS handling
- preserve / replace / archive decisions
- restore plan
- authority transition
- apply chain
- human decisions
- boundaries
- outcome

Markdown remains supported by default, but strict mode should require valid
structured evidence.

Suggested strict flag:

```bash
node scripts/check-native-migration.mjs <project> --require-structured-evidence
```

### 3. Markdown And JSON Consistency

If a Native Migration Plan contains Machine-Readable Evidence, the checker
should ensure that important Markdown claims match the structured evidence.

Examples:

- Markdown says `canCodexWriteNow: No`; JSON must not say writes are allowed.
- Markdown says production authority is external; JSON must not assign release
  ownership to Codex.
- Markdown lists `AGENTS.md` replacement; JSON must include restore plan and
  exact target path.
- Markdown classifies a business rule as preserved; JSON must not mark it as
  replaceable workflow guidance.

### 4. Workflow-Map Language Calibration

Update workflow-map human output so the path is clear:

```text
workflow-map = diagnostic map
native-migration = adoption planning
adapter-only = escape hatch
```

For existing projects, workflow-map should not imply that read-only mapping is
the adoption endpoint when the user intends to use IntentOS.

Recommended wording:

```text
This map is diagnostic. If you want IntentOS to become the Codex workflow for
this project, the next step is a Native Migration Plan. Adapter-only remains
available when ownership, production, compliance, or project constraints block
native migration.
```

### 5. Exact Target Path And Risk Classification

1.62 already rejects broad paths. 1.63 should make path checks more explicit.

Risk classes:

| Target | Default risk | 1.63 handling |
| --- | --- | --- |
| `AGENTS.md`, `agent.md` | high | rule extraction + restore plan + approval |
| `.github/pull_request_template.md` | medium/high | exact apply plan and approval |
| `.github/workflows/*` | high | preserve/map by default; release owner approval |
| `.githooks/*`, `.husky/*` | high | hook policy first; no install |
| release SOP / rollback docs | high | preserve/map; release owner approval |
| engineering baseline docs | medium | map after review |
| business source-of-truth docs | high | preserve or escalate |
| historical notes | low/medium | archive suggestion only |

### 6. Realistic Mixed-Rule Fixtures

Add fixtures that look like real old projects.

Positive fixtures should include:

- a mixed `AGENTS.md` with workflow, business, production, engineering, and
  historical rules
- a production governed project with release and rollback docs
- a light project with simple agent guidance and no production signals

Bad fixtures should include:

- mixed agent file collapsed into one file-level rule
- missing line ranges
- schema evidence missing or invalid in strict mode
- business rule proposed for replacement
- production control proposed as engineering baseline
- `AGENTS.md` replacement without restore plan
- workflow-map conclusion that treats adapter-only as the default endpoint
- Markdown and JSON evidence disagreeing on write authority

## Proposed Assets

Suggested new assets:

```text
docs/plans/native-migration-precision-hardening-1.63-plan.md
schemas/artifacts/native-migration-plan.schema.json
examples/1.63-native-migration-precision/
test-fixtures/bad/bad-native-migration-mixed-rules-collapsed/
test-fixtures/bad/bad-native-migration-missing-line-range/
test-fixtures/bad/bad-native-migration-structured-evidence-mismatch/
test-fixtures/bad/bad-native-migration-schema-invalid/
test-fixtures/bad/bad-workflow-map-adapter-endpoint/
releases/1.63.0/
```

Suggested updated assets:

```text
core/native-first-existing-project-migration.md
docs/native-first-existing-project-migration.md
templates/native-migration-plan.md
scripts/resolve-native-migration.mjs
scripts/check-native-migration.mjs
scripts/resolve-existing-workflow.mjs
scripts/check-workflow-adoption-map.mjs
scripts/check-intentos.mjs
README.md
README.zh-CN.md
VERSION.md
package.json
intentos-manifest.json
templates/workflow-version.json
templates/version-record.md
docs/reference/scripts.md
docs/reference/checkers.md
docs/reference/artifacts.md
```

Optional implementation asset:

```text
scripts/lib/native-rule-extraction.mjs
```

Use this only if extraction logic becomes large enough to justify a shared
library. Do not add an abstraction just to create a file.

## CLI Shape

No new user-facing command is required.

Existing commands remain:

```bash
node scripts/cli.mjs workflow-map <project>
node scripts/cli.mjs native-migration <project>
node scripts/cli.mjs native-migration-check <project>
```

Allowed checker hardening:

```bash
node scripts/check-native-migration.mjs <project> --require-structured-evidence
```

The ordinary user entry should still be natural language or `guide/start`. The
strict flag is for maintainers and CI only.

## Goal + Subagent Execution Model

1.63 can use goal mode and subagents internally, but only as execution
organization.

Recommended goal:

```text
Deliver 1.63 Native Migration Precision Hardening without changing target
project files or adding a migration runner.
```

Recommended subagent roles:

| Role | Mode | Responsibility |
| --- | --- | --- |
| Extraction reviewer | READ_ONLY_RESEARCH | Review AGENTS/Markdown parsing edge cases |
| Schema reviewer | READ_ONLY_RESEARCH | Check schema fields and strict evidence requirements |
| Fixture reviewer | READ_ONLY_RESEARCH | Check positive/bad fixture coverage |
| Main thread | WRITER_LIMITED | Make repository edits and run verification |

Subagent rules:

- many readers, one writer
- subagents must not edit files
- subagents must be closed or skipped before final response
- no external GPT/API reviewer is required
- subagent output is input to the main thread, not approval

## Implementation Plan

### Phase 1: Model And Schema

- Update Native Migration docs to require rule-level extraction.
- Add structured Machine-Readable Evidence requirements.
- Add `native-migration-plan.schema.json`.
- Update template with line ranges, confidence, and structured evidence block.

Acceptance for Phase 1:

- Docs explain rule-level extraction.
- Template cannot be filled as a one-file summary.
- Schema rejects missing authority fields, missing line ranges, missing exact
  target paths, and missing restore plan.
- Schema requires rule extraction coverage summary.
- Schema allows parser warnings and treats them as review evidence, not approval.

### Phase 2: Resolver Precision

- Update resolver extraction to produce multiple rules per source file.
- Preserve heading/bullet/numbered-list context.
- Include source start/end lines.
- Use lower confidence for ambiguous rules.
- Record lines scanned, rules extracted, unclassified blocks, and parser
  warnings for each scanned source file.
- Treat code blocks as context unless heading or lead-in text clearly makes
  them required commands or rules.
- Keep `UNKNOWN_AUTHORITY` when owner or risk is unclear.
- Add human wording that `PLAN_REQUIRED` does not authorize writes.

Acceptance for Phase 2:

- A mixed `AGENTS.md` produces multiple rule classifications.
- Business and production rules are not proposed for replacement.
- Workflow rules can be proposed for replacement only after reviewed plan and
  approval.
- JSON output includes rule line ranges and confidence.
- JSON output includes extraction coverage and parser warnings.
- Low-confidence and unclassified blocks are visible to the reviewer.

### Phase 3: Checker Hardening

- Add strict structured evidence mode.
- Validate Markdown/JSON consistency.
- Reject one-rule collapsed summaries for mixed fixtures.
- Reject missing line ranges.
- Reject missing extraction coverage in strict mode.
- Reject schema evidence mismatch.
- Reject workflow-map text that makes adapter-only the default endpoint.

Acceptance for Phase 3:

- Existing 1.62 positive examples continue to pass default mode.
- New 1.63 positive examples pass strict mode.
- New 1.63 bad fixtures fail for clear reasons.
- `npm run verify` includes the new strict checks.

### Phase 4: Workflow-Map Calibration

- Update workflow-map human conclusion and JSON recommendation wording.
- Keep `READ_ONLY_MAP` as the safe diagnostic step.
- Make Native Migration Plan the next adoption-planning step when the user
  intends to use IntentOS.
- Keep `ADAPTER_ONLY_RECOMMENDED` as an explicit blocked/escape posture.

Acceptance for Phase 4:

- Existing production project output says workflow-map is diagnostic.
- Output recommends Native Migration Plan for IntentOS adoption.
- Output does not imply target-project writes are allowed.
- Adapter-only remains available for blocked ownership, production, compliance,
  third-party, incident, or refusal cases.

### Phase 5: Examples, Release Evidence, And Verification

- Add realistic 1.63 examples.
- Add bad fixtures.
- Update README, VERSION, package, manifest, workflow version assets, and
  reference docs.
- Add release record, known limitations, and self-check report.
- Run full verification.

Acceptance for Phase 5:

- Version metadata is synchronized.
- `check-intentos` validates 1.63 assets.
- `npm run verify` passes.
- Release record includes allowed claims, forbidden claims, evidence status,
  known limitations, and verification.

## Acceptance Plan

### Functional Acceptance

1. `native-migration` extracts multiple rules from a mixed `AGENTS.md`.
2. Each extracted rule has source file, start line, end line, excerpt, heading,
   class, authority, handling, risk surface, target action, confidence, and
   reason.
3. Each scanned source has coverage evidence: lines scanned, rules extracted,
   unclassified blocks, parser warnings, and notes.
4. Business rules are preserved or escalated, not replaced.
5. Production controls are preserved and mapped to release guide / recipe /
   handoff, not downgraded to engineering baseline.
6. Workflow rules can be proposed for replacement only through reviewed native
   migration plan, unified apply plan, controlled apply readiness, and approval
   record.
7. `PLAN_REQUIRED` is explained as "not write authority".
8. Workflow-map clearly says it is diagnostic and points to native migration
   for adoption.
9. Adapter-only remains available as a blocked/escape posture.
10. Existing 1.62 examples continue to pass default checks.
11. 1.63 strict examples pass `--require-structured-evidence`.

### Safety Acceptance

The checker must reject:

- one mixed agent file collapsed into one broad rule
- extracted rules without line ranges
- strict evidence without extraction coverage summary
- parser warnings omitted when unclassified blocks exist
- missing source excerpt
- missing rule authority
- missing confidence
- schema evidence missing in strict mode
- invalid schema evidence
- Markdown and JSON disagreement on write authority
- business rule marked as replaceable workflow rule
- production control marked as engineering baseline
- `AGENTS.md` replacement without restore plan
- broad target path such as `docs/**`, repository root, all workflow files, or
  unbounded globs
- workflow-map output that treats adapter-only as the default adoption endpoint
- any claim that 1.63 applies migration, approves implementation, approves
  release, or authorizes production changes

### Documentation Acceptance

Docs must explain:

- why 1.63 exists after 1.62
- rule-level extraction vs file-level classification
- why structured evidence is needed
- when IntentOS can become workflow authority
- when project/business/production authority overrides IntentOS
- how `AGENTS.md` replacement is planned safely
- why strict mode is for maintainers and CI, not normal users
- what remains outside Codex authority

### Real Project Calibration Acceptance

Run read-only calibration against at least one real existing project, such as
WorkControl.

The calibration must record:

- no target project files changed
- project state and posture
- whether mixed agent/governance rules were split correctly
- whether extraction coverage shows full relevant source scanning
- whether parser warnings are clear enough for human review
- which rules were `UNKNOWN_AUTHORITY`
- false positives and false negatives
- whether human-facing output was clear enough for a non-expert owner

Calibration must not commit WorkControl artifacts unless the project owner asks
for a docs-only record in that project.

## Verification Commands

Expected final verification:

```bash
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node --check scripts/resolve-existing-workflow.mjs
node scripts/cli.mjs workflow-map . --json
node scripts/cli.mjs native-migration . --json
node scripts/check-native-migration.mjs .
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/light-web
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/governed-admin
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/production-maintained
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/dirty-worktree
node scripts/check-native-migration.mjs examples/1.63-native-migration-precision/mixed-agent-rules --require-structured-evidence
node scripts/check-workflow-adoption-map.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Expected bad fixture verification:

```bash
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-mixed-rules-collapsed --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-missing-line-range --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-structured-evidence-mismatch --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-schema-invalid --require-structured-evidence
node scripts/check-workflow-adoption-map.mjs test-fixtures/bad/bad-workflow-map-adapter-endpoint
```

Each bad fixture must fail with a clear reason.

## Release Evidence Acceptance

`releases/1.63.0/` should include:

- `release-record.md`
- `known-limitations.md`
- `self-check-report.md`

The release record must explicitly say:

- 1.63 improves Native Migration Plan precision.
- 1.63 does not execute migration.
- 1.63 does not approve target-project writes.
- 1.63 does not replace business, production, release, security, compliance,
  data, migration, payment, permission, legal, tax, finance, HR, or customer
  authority.
- Structured evidence improves reviewability but does not become approval.
- Real projects still require human-reviewed apply plans before governance
  replacement.

## Known Risks

### Parser Overreach

Markdown parsing can be too aggressive and split explanatory text into rules.

Mitigation:

- include confidence
- allow `HISTORICAL_NOTE`
- prefer human review for low-confidence rules

### False Safety From Schema

Valid JSON does not prove the real project was fully understood.

Mitigation:

- release record must state schema validates recorded evidence only
- real project calibration records false positives and false negatives

### Command Surface Growth

1.63 should not add another normal-user command.

Mitigation:

- use existing `native-migration` and `native-migration-check`
- strict mode remains maintainer/CI only

### Existing Project Sensitivity

Real projects may contain secrets, private docs, or sensitive operational
context.

Mitigation:

- calibration is read-only
- do not copy real project content into public examples without sanitization
- keep examples synthetic unless explicitly approved

## Rollback Plan

If 1.63 hardening causes too many false positives:

1. Keep default checker compatible with 1.62 Markdown records.
2. Gate strict schema checks behind `--require-structured-evidence`.
3. Keep 1.62 examples passing default mode.
4. Document strict mode as opt-in until fixture coverage stabilizes.

Do not remove 1.62 native migration behavior.

## Success Criteria

1. Native Migration Plan is rule-level, not file-summary-level.
2. Mixed `AGENTS.md` files are parsed into separate workflow, business,
   production, engineering, historical, and unknown rules.
3. Rule extraction coverage shows how much was scanned, extracted, and left
   unclassified.
4. Parser warnings make ambiguity visible instead of hiding it.
5. Structured evidence can be validated in strict mode.
6. Markdown and structured evidence cannot contradict each other on authority.
7. Workflow-map no longer reads like adapter-only is the normal endpoint.
8. WorkControl-style projects remain protected and read-only by default.
9. IntentOS can be proposed as Codex workflow authority without becoming
   business or production authority.
10. All governance replacement remains plan-first, approval-bound, and
   reversible.

## Final Boundary

1.63 makes native migration more precise, not more aggressive.

Short form:

```text
1.62: plan native migration.
1.63: prove what the plan is based on.
```
