# 1.64.0 Native Migration Parser Calibration & Evidence Consistency Plan

## Purpose

1.64 hardens the 1.63 Native Migration Precision layer.

1.63 moved existing-project migration from file-level evidence to rule-level
evidence. 1.64 keeps the same scope and makes the evidence harder to misuse:

```text
native migration plan
  -> rule extraction coverage
  -> skipped / low-signal block visibility
  -> Markdown / JSON rule consistency
  -> clearer workflow-map diagnostic wording
```

## Scope Contract

1.64 is a parser calibration and evidence consistency release.

It can:

- record skipped Markdown tables, long paragraphs, and low-signal paragraphs
- keep parser warnings visible when skipped or ambiguous blocks exist
- compare Markdown rule rows against Machine-Readable Evidence by `rule_id`
- validate structured proposed actions in strict mode
- make workflow-map output clearly diagnostic rather than an adoption endpoint
- add realistic fixtures for tables, no-keyword rules, long paragraphs, and
  bilingual governance notes

It must not:

- execute native migration
- write target-project governance files
- replace `AGENTS.md`, CI, hooks, release SOPs, production config, or business
  code
- treat parser output as human approval
- make IntentOS the business, production, release, compliance, security, data,
  migration, payment, permission, legal, tax, finance, HR, or customer-record
  authority
- require normal users to choose internal checker flags

## User Outcome

A user with an old project should not need to understand parser internals.

Codex should be able to say:

```text
I found several concrete rules and also found some blocks I did not classify
automatically, such as a table and a long paragraph. I am not treating those as
approved migration rules. They need review before governance replacement.
```

The human still only decides:

- whether IntentOS should become the Codex workflow authority
- how to classify ambiguous old rules
- whether exact governance replacement actions are approved

## Work Items

### 1. Parser Calibration

Update `scripts/lib/native-rule-extraction.mjs` so coverage includes:

```text
skipped_blocks
low_signal_blocks
parser_warnings
```

The extractor should report:

- Markdown table blocks
- long paragraphs that are too large for confident extraction
- low-signal paragraphs under governance-like headings
- fenced code blocks that may contain commands or rules

Skipped and low-signal blocks are not extracted rules. They are review evidence.

### 2. Structured Evidence Consistency

Update `scripts/check-native-migration.mjs` strict mode so it compares each
Markdown rule row with its JSON rule by `rule_id`.

Required consistency:

```text
source_file
source_start_line
source_end_line
context_heading
source_excerpt
rule_class
authority
default_handling
preserve_or_replace
risk_surfaces
target_action
human_decision_required
confidence
```

The checker should also validate structured `proposed_actions` fields.

### 3. Workflow-Map Wording

Update `scripts/resolve-existing-workflow.mjs` conclusions so Workflow Adoption
Map is described as diagnostic:

```text
This map is diagnostic. If you want IntentOS to become the Codex workflow for
this project, the next step is a Native Migration Plan. Adapter-only remains
available when ownership, production, compliance, or project constraints block
native migration.
```

### 4. Fixtures

Add a 1.64 positive fixture with:

- a table-like old rule block
- a long paragraph under governance heading
- a low-signal business paragraph
- Chinese or bilingual governance text
- strict Machine-Readable Evidence

Add bad fixtures for:

- Markdown / JSON rule class mismatch
- Markdown / JSON line range mismatch
- missing skipped-block reporting when strict coverage claims warnings
- invalid structured proposed action

### 5. Version And Release Evidence

Update:

- README / README.zh-CN
- VERSION
- package version and example verification
- intentos manifest and workflow version template
- native migration schema
- release record, limitations, and self-check report

## Acceptance

1.64 is accepted only if:

- syntax checks pass
- strict 1.64 positive fixture passes
- 1.63 strict fixture remains compatible
- new bad fixtures fail
- workflow-map output says diagnostic and points to Native Migration Plan
- manifest, README, VERSION, package, workflow version, and release evidence are synchronized
- `npm run verify` passes

## Boundary

1.64 does not authorize target-project writes, governance replacement,
implementation, release, production, CI changes, hooks, provider calls, secrets,
migrations, payment, permissions, data changes, or business-rule changes.
