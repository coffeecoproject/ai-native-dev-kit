# Native-First Existing Project Migration

Native-First Migration is how IntentOS enters an existing project without pretending it owns the project.

Plain-language meaning:

```text
IntentOS becomes the way Codex plans and reviews work.
The project keeps its real business, production, release, data, and safety rules.
Any governance-file change still needs a reviewed plan and human approval.
```

Use it when a user says:

- "This is my existing project. Configure yourself and continue with IntentOS."
- "Use the new workflow in this old project."
- "Adopt IntentOS here."
- "Stop giving me adapter-only advice and switch into the workflow."

## What Codex Should Say

The first line should be:

```text
I have switched to IntentOS Native-First Migration Planning mode.
```

Then Codex should explain:

- what it found
- which exact old rules were extracted, with source line ranges
- which project constraints must be preserved
- which conflicts block apply
- which parser warnings, unclassified blocks, skipped blocks, or low-signal blocks need human review
- what the human needs to decide

## What It Does Not Do

Native-First Migration does not:

- rewrite business logic
- rewrite production or release configuration
- overwrite `AGENTS.md`
- install hooks
- edit CI
- delete historical documents
- approve implementation
- approve release or production

## How To Run

```bash
node scripts/cli.mjs native-migration ../existing-project
node scripts/cli.mjs native-migration ../existing-project --json
node scripts/cli.mjs native-migration-check ../existing-project
node scripts/check-native-migration.mjs ../existing-project --require-structured-evidence
```

Use strict evidence mode when a recorded migration plan will become the basis for a real governance replacement. Default mode remains compatible with older Markdown-only reports.

## How To Use The Result

If the result recommends native migration, the next step is not direct file editing.

The safe path is:

```text
Native Migration Plan
Rule Extraction Coverage
Machine-Readable Evidence
Markdown / JSON rule consistency
Unified Apply Plan
Controlled Apply Readiness
Approval Record
approved governance-file edits only
Review Loop / Finish
```

## When Adapter-Only Still Wins

Use `ADAPTER_ONLY_RECOMMENDED` when:

- project owner is unknown
- authority is unclear
- dirty worktree blocks safe planning
- active incident or release freeze exists
- third-party project constraints block migration
- compliance, security, privacy, legal, or customer-data authority is unclear
- the user explicitly refuses migration
