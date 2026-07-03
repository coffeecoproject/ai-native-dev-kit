# Native-First Existing Project Migration

Native-First Existing Project Migration is the IntentOS path for in-progress, legacy, governed, and production-maintained projects.

It changes the default old-project posture from adapter-only caution to IntentOS-native planning:

```text
read existing project state
classify old rules and authority
preserve business and production constraints
recommend an IntentOS-native migration posture
produce a reviewed Native Migration Plan
route any approved governance edits through Unified Apply Plan, Controlled Apply Readiness, and Approval Record
```

## Core Rule

IntentOS may become the workflow authority for Codex behavior.

IntentOS must not become the business, production, compliance, security, data, release, migration, payment, permission, legal, tax, finance, HR, or customer-data authority.

Native-first means planning-first. It does not mean write-first.

## Postures

| Project type | Posture |
| --- | --- |
| New project | `FULL_MANAGED_INTENTOS_NATIVE` |
| Existing light project | `NATIVE_FIRST_MIGRATION` |
| Existing governed project | `NATIVE_FIRST_WITH_GOVERNANCE_CONFLICT_REVIEW` |
| Existing production project | `PRODUCTION_SAFE_NATIVE_OVERLAY` |
| Dirty worktree project | `NATIVE_FIRST_PENDING_WORKTREE_REVIEW` |
| Unknown / ownerless project | `BLOCKED_NEEDS_OWNER` |
| Migration blocked by owner, third-party, incident, compliance, or explicit refusal | `ADAPTER_ONLY_RECOMMENDED` |

## Authority Fields

Every Native Migration Plan must report:

| Field | Meaning |
| --- | --- |
| `intentOsWorkflowAuthority` | Whether IntentOS can be used for planning and task routing now |
| `targetFileWriteAuthority` | Whether Codex may write target files now |
| `businessAuthority` | Business behavior remains owned by project evidence and human decisions |
| `productionAuthority` | Release, provider, migration, operations, and production remain human or external-system owned |

`intentOsWorkflowAuthority=ACTIVE_FOR_PLANNING` never authorizes target-file writes.

## Rule Classes

Existing rules must be classified before replacement.

| Rule class | Default handling |
| --- | --- |
| `BUSINESS_FACT` | Preserve or escalate |
| `PROJECT_CONSTRAINT` | Preserve or map |
| `PRODUCTION_CONTROL` | Preserve and escalate |
| `ENGINEERING_BASELINE` | Migrate into IntentOS baseline after review |
| `WORKFLOW_RULE` | IntentOS becomes preferred future authority after reviewed plan and approval |
| `HISTORICAL_NOTE` | Archive suggestion, not deletion |
| `UNKNOWN_AUTHORITY` | Stop for classification |

Each extracted rule needs source file, source excerpt, source location, rule class, authority, target action, risk surface, and reason.

## AGENTS.md Handling

An existing `AGENTS.md` should not be treated as untouchable forever.

It must be:

1. parsed and classified
2. split into project facts, business constraints, production controls, engineering baseline items, workflow rules, historical notes, and unknown-authority items
3. preserved where it represents real project constraints
4. replaced only where it is old AI workflow guidance and a reviewed migration plan plus human approval exists
5. paired with a restore plan before replacement

No `AGENTS.md` replacement is acceptable without extracted-rule classification, proposed IntentOS-native replacement shape, and restore plan.

## Apply Boundary

Native migration may produce a plan. It may not directly apply the plan.

Approved governance-file work must go through:

```text
Native Migration Plan
Unified Apply Plan
Controlled Apply Readiness
Approval Record
Change Impact Coverage / Review Loop / Finish
```

## Forbidden Actions

A Native Migration Plan must not:

- approve implementation, release, production, CI, hook, migration, provider, data, permission, payment, security, privacy, compliance, legal, tax, finance, HR, or customer decisions
- rewrite `AGENTS.md`, PR templates, CI, hooks, release SOPs, production config, or target files directly
- remove business facts or production controls
- treat Codex, subagents, or GPT review as human approval
- use broad target paths such as `docs/**`, repository root, all workflow files, or unbounded globs
- claim the project is fully migrated without evidence
